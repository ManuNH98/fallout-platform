import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
// Next inicializa este global al arrancar; el harness aislado hace lo mismo.
globalThis.AsyncLocalStorage ??= AsyncLocalStorage;
const { NextRequest, NextResponse } = require("next/server");
const {
  unstable_doesMiddlewareMatch,
} = require("next/experimental/testing/server");
const environment = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_prueba",
};
const cache = {
  "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
  Expires: "0",
  Pragma: "no-cache",
};
const authenticated = {
  data: { claims: { sub: "usuario-verificado" } },
  error: null,
};
const anonymous = { data: null, error: null };

async function loadProxy(getClaims = async () => anonymous, env = environment) {
  const context = vm.createContext({ URL, process: { env } });
  let clients = 0;
  const sdk = new vm.SyntheticModule(
    ["createServerClient"],
    function () {
      this.setExport("createServerClient", (url, key, options) => {
        assert.equal(url, environment.NEXT_PUBLIC_SUPABASE_URL);
        assert.equal(key, environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
        clients++;
        return {
          auth: {
            getClaims: () => getClaims(options.cookies),
            getSession: () => {
              throw new Error("No confiar en getSession");
            },
          },
        };
      });
    },
    { context },
  );
  const next = new vm.SyntheticModule(
    ["NextResponse"],
    function () {
      this.setExport("NextResponse", NextResponse);
    },
    { context },
  );
  const serverOnly = new vm.SyntheticModule([], function () {}, { context });
  const entries = new Map();
  for (const [name, path] of [
    ["env", "../../env.ts"],
    ["helper", "../proxy.ts"],
    ["entry", "../../../proxy.ts"],
  ]) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    });
    entries.set(name, new vm.SourceTextModule(outputText, { context }));
  }
  const entry = entries.get("entry");
  await entry.link((specifier) => {
    if (specifier === "./lib/supabase/proxy") return entries.get("helper");
    if (specifier === "../env") return entries.get("env");
    if (specifier === "@supabase/ssr") return sdk;
    if (specifier === "next/server") return next;
    if (specifier === "server-only") return serverOnly;
    throw new Error(`Import inesperado: ${specifier}`);
  });
  await entry.evaluate();
  return { ...entry.namespace, clients: () => clients };
}

function request(path, cookie = "") {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: cookie ? { cookie } : {},
  });
}

function assertPrivate(response) {
  for (const [name, value] of Object.entries(cache)) {
    assert.equal(response.headers.get(name), value);
  }
}

test("matcher real de Next incluye solo Auth y admin, sin publico ni assets", async () => {
  const { config, clients } = await loadProxy();
  for (const path of [
    "/login",
    "/registro",
    "/auth/confirmar?token_hash=prueba",
    "/admin",
    "/admin/wiki",
    "/admin/",
  ]) {
    assert.equal(
      unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: path }),
      true,
      path,
    );
  }
  for (const path of [
    "/",
    "/wiki",
    "/wiki/mr-house",
    "/juegos",
    "/juegos/fallout-4",
    "/administra",
    "/login-extra",
    "/auth/otro",
    "/restablecer-contrasena",
    "/favicon.ico",
    "/_next/static/chunk.js",
    "/_next/image?url=prueba",
    "/imagen.png",
  ]) {
    assert.equal(
      unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: path }),
      false,
      path,
    );
  }
  assert.equal(clients(), 0);
});

test("Auth sin sesion continua; admin redirige sin query ni destino manipulable", async () => {
  const { proxy } = await loadProxy();
  for (const path of [
    "/login",
    "/registro",
    "/auth/confirmar?token_hash=prueba",
  ]) {
    const response = await proxy(request(path));
    assert.equal(response.headers.get("x-middleware-next"), "1");
    assert.equal(response.headers.get("location"), null);
    assertPrivate(response);
  }
  const response = await proxy(
    request("/admin?next=https://example.org&token=privado"),
  );
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "http://localhost:3000/login");
  assertPrivate(response);
});

test("identidad verificada permite continuar sin atribuir roles de negocio", async () => {
  const { proxy } = await loadProxy(async () => authenticated);
  const response = await proxy(request("/admin/wiki"));
  assert.equal(response.headers.get("x-middleware-next"), "1");
  assert.equal(response.headers.get("location"), null);
  assertPrivate(response);
});

test("renovacion y varias escrituras conservan cookies para render y navegador", async () => {
  const { proxy } = await loadProxy(async (cookies) => {
    assert.equal(cookies.getAll()[0].value, "caducada");
    cookies.setAll(
      [
        {
          name: "sesion.0",
          value: "renovada",
          options: { path: "/", secure: true, sameSite: "lax" },
        },
        { name: "sesion.1", value: "", options: { path: "/", maxAge: 0 } },
      ],
      cache,
    );
    cookies.setAll(
      [
        {
          name: "sesion.2",
          value: "otro-chunk",
          options: { path: "/", httpOnly: true },
        },
      ],
      cache,
    );
    return authenticated;
  });
  const incoming = request("/admin", "sesion.0=caducada; sesion.1=anterior");
  const response = await proxy(incoming);
  assert.equal(incoming.cookies.get("sesion.0").value, "renovada");
  assert.match(
    response.headers.get("x-middleware-request-cookie"),
    /sesion.0=renovada/,
  );
  assert.match(
    response.headers.get("x-middleware-request-cookie"),
    /sesion.2=otro-chunk/,
  );
  assert.equal(response.cookies.get("sesion.0").secure, true);
  assert.equal(response.cookies.get("sesion.0").sameSite, "lax");
  assert.equal(response.cookies.get("sesion.1").maxAge, 0);
  assert.equal(response.cookies.get("sesion.2").httpOnly, true);
  assertPrivate(response);
});

test("rechazo de refresh conserva borrados y cache en la redireccion", async () => {
  const { proxy } = await loadProxy(async (cookies) => {
    cookies.setAll(
      [{ name: "sesion", value: "", options: { path: "/", maxAge: 0 } }],
      cache,
    );
    return { data: null, error: { status: 400 } };
  });
  const response = await proxy(request("/admin", "sesion=invalidada"));
  assert.equal(response.status, 303);
  assert.equal(response.cookies.get("sesion").maxAge, 0);
  assertPrivate(response);
});

test("token invalido nunca permite admin aunque el SDK devuelva claims", async () => {
  const { proxy } = await loadProxy(async () => ({
    ...authenticated,
    error: { status: 401 },
  }));
  const response = await proxy(request("/admin"));
  assert.equal(response.status, 303);
  assertPrivate(response);
});

test("fallos de proveedor y excepciones devuelven 503 sin datos sensibles", async () => {
  for (const outcome of [
    async () => ({
      data: null,
      error: { status: 503, message: "token-no-publicar" },
    }),
    async () => {
      throw new Error("token-no-publicar");
    },
  ]) {
    const { proxy } = await loadProxy(outcome);
    const response = await proxy(request("/admin"));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("location"), null);
    assertPrivate(response);
    assert.ok(!(await response.text()).includes("token-no-publicar"));
  }
});

test("un error despues de renovar conserva cookies en la respuesta 503", async () => {
  const { proxy } = await loadProxy(async (cookies) => {
    cookies.setAll(
      [{ name: "sesion", value: "renovada", options: { path: "/" } }],
      cache,
    );
    throw new Error("JWKS no disponible");
  });
  const response = await proxy(request("/admin"));
  assert.equal(response.status, 503);
  assert.equal(response.cookies.get("sesion").value, "renovada");
  assertPrivate(response);
});

test("ausencia de configuracion no crea clientes ni permite rutas privadas", async () => {
  const { proxy, clients } = await loadProxy(undefined, {});
  const response = await proxy(request("/admin"));
  assert.equal(response.status, 503);
  assert.equal(clients(), 0);
  assertPrivate(response);
});

test("peticiones concurrentes no comparten clientes, cookies o respuestas", async () => {
  const { proxy, clients } = await loadProxy(async (cookies) => {
    const identity = cookies.getAll()[0].value;
    await Promise.resolve();
    cookies.setAll(
      [
        {
          name: "sesion",
          value: `renovada-${identity}`,
          options: { path: "/" },
        },
      ],
      cache,
    );
    return authenticated;
  });
  const [first, second] = await Promise.all([
    proxy(request("/admin", "sesion=primera")),
    proxy(request("/admin", "sesion=segunda")),
  ]);
  assert.equal(clients(), 2);
  assert.equal(first.cookies.get("sesion").value, "renovada-primera");
  assert.equal(second.cookies.get("sesion").value, "renovada-segunda");
  assert.notEqual(first, second);
});
