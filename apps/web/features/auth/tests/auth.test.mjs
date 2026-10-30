import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const validationRequire = createRequire(
  new URL("../../../../../packages/validation/package.json", import.meta.url),
);
const zod = validationRequire("zod");
const subject = "2756a032-021a-4bf7-bab1-a827d6fa9a45";
const token = "access.token.signature";
const profile = {
  id: "a07c7044-cc9e-4121-a9a8-f0e0e47d8e60",
  supabaseUserId: subject,
  username: null,
  displayName: null,
  avatarUrl: null,
  role: "USER",
  createdAt: "2026-10-30T10:00:00.000Z",
  updatedAt: "2026-10-30T10:00:00.000Z",
};
const plain = (value) => JSON.parse(JSON.stringify(value));
function form(email = "habitante@example.com", password = " clave privada ") {
  const data = new FormData();
  data.set("email", email);
  data.set("password", password);
  return data;
}

async function load(options = {}) {
  const calls = {
    clients: 0,
    signIn: [],
    claims: [],
    signOut: [],
    fetch: [],
    cookies: [],
  };
  const jar = new Map();
  let session = options.session ? { access_token: token } : null;
  if (session) jar.set("sb-test-auth-token", "sesion");
  const store = {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    set(name, value, settings) {
      calls.cookies.push({ name, value, settings });
      if (!value) jar.delete(name);
      else jar.set(name, value);
    },
  };
  const fetcher = async (url, init) => {
    calls.fetch.push({ url: String(url), init });
    if (options.fetch) return options.fetch(url, init);
    return new Response(
      JSON.stringify({ ...profile, ...(options.profile ?? {}) }),
      { status: 200 },
    );
  };
  const context = vm.createContext({
    URL,
    FormData,
    AbortSignal,
    fetch: fetcher,
  });
  function synthetic(values) {
    return new vm.SyntheticModule(
      Object.keys(values),
      function () {
        for (const [key, value] of Object.entries(values))
          this.setExport(key, value);
      },
      { context },
    );
  }
  const externals = {
    "server-only": synthetic({}),
    zod: synthetic({ z: zod.z }),
    "next/headers": synthetic({ cookies: async () => store }),
    "next/navigation": synthetic({
      redirect(destination) {
        throw Object.assign(new Error("NEXT_REDIRECT"), { destination });
      },
    }),
    "@supabase/ssr": synthetic({
      createServerClient(_url, _key, { cookies }) {
        calls.clients++;
        if (options.clientUnavailable)
          throw new Error("configuracion-sensible");
        return {
          auth: {
            async signInWithPassword(input) {
              calls.signIn.push(input);
              if (options.signInThrow) throw new Error("password-secreto");
              if (options.signInError)
                return { data: { session: null }, error: options.signInError };
              session = { access_token: token };
              cookies.setAll([
                {
                  name: "sb-test-auth-token",
                  value: "sesion",
                  options: { path: "/", sameSite: "lax" },
                },
              ]);
              return { data: { session }, error: null };
            },
            getSession() {
              return Promise.resolve({
                data: { session: jar.size ? session : null },
                error: options.sessionError ?? null,
              });
            },
            getClaims(jwt) {
              calls.claims.push(jwt);
              return Promise.resolve({
                data: options.claimsError
                  ? null
                  : {
                      claims: {
                        sub: subject,
                        role: "authenticated",
                        is_anonymous: false,
                        ...(options.claims ?? {}),
                      },
                    },
                error: options.claimsError ?? null,
              });
            },
            async signOut(scope) {
              calls.signOut.push(scope);
              if (options.logoutError) return { error: options.logoutError };
              cookies.setAll([
                {
                  name: "sb-test-auth-token",
                  value: "",
                  options: { path: "/", maxAge: 0 },
                },
              ]);
              session = null;
              return { error: null };
            },
          },
        };
      },
    }),
    env: synthetic({
      webEnvironment: { apiUrl: "http://localhost:3001" },
      getSupabaseEnvironment: () => ({
        url: "https://project.example",
        publishableKey: "sb_publishable_prueba",
      }),
    }),
  };
  const modules = new Map();
  for (const [name, sourcePath] of [
    ["validation", "../../../../../packages/validation/src/index.ts"],
    ["api", "../../../lib/api/private-profile.ts"],
    ["client", "../../../lib/supabase/server.ts"],
    ["core", "../core.ts"],
    ["server", "../server.ts"],
    ["actions", "../actions.ts"],
  ]) {
    const source = await readFile(new URL(sourcePath, import.meta.url), "utf8");
    modules.set(
      name,
      new vm.SourceTextModule(
        ts.transpileModule(source, {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
          },
        }).outputText,
        { context },
      ),
    );
  }
  const imports = {
    "@repo/validation": "validation",
    "../../lib/api/private-profile": "api",
    "../../lib/supabase/server": "client",
    "../../lib/env": "env",
    "../env": "env",
    "./core": "core",
    "./server": "server",
  };
  await modules.get("actions").link(
    (specifier) =>
      externals[specifier] ??
      modules.get(imports[specifier]) ??
      externals[imports[specifier]] ??
      (() => {
        throw new Error(`Import inesperado: ${specifier}`);
      })(),
  );
  await modules.get("actions").evaluate();
  return {
    calls,
    jar,
    actions: modules.get("actions").namespace,
    core: modules.get("core").namespace,
    schema: modules.get("validation").namespace,
    api: modules.get("api").namespace,
    dependencies: modules.get("server").namespace.authDependencies,
  };
}

test("importar no crea clientes ni realiza fetch; validacion invalida no usa SDK", async () => {
  const x = await load();
  assert.equal(x.calls.clients, 0);
  assert.equal(x.calls.fetch.length, 0);
  for (const data of [
    form("invalido", ""),
    new FormData(),
    form("a".repeat(255) + "@example.com"),
    form("a@example.com", "x".repeat(4097)),
  ]) {
    const result = await x.actions.loginAction({}, data);
    assert(result.message);
    assert(!JSON.stringify(result).includes("password-secreto"));
  }
  assert.equal(x.calls.clients, 0);
});
test("Zod compartido recorta email y conserva exactamente espacios de password", async () => {
  const x = await load();
  assert.deepEqual(
    plain(
      x.schema.loginSchema.parse({
        email: " habitante@example.com ",
        password: " clave ",
      }),
    ),
    { email: "habitante@example.com", password: " clave " },
  );
  assert.equal(
    x.schema.loginSchema.safeParse({
      email: new File(["x"], "correo"),
      password: "a",
    }).success,
    false,
  );
});
test("login escribe cookies por el adaptador SSR, sincroniza y redirige fuera de catch", async () => {
  const x = await load();
  await assert.rejects(
    x.actions.loginAction({}, form(" habitante@example.com ")),
    (e) => e.destination === "/login",
  );
  assert.deepEqual(x.calls.signIn, [
    { email: "habitante@example.com", password: " clave privada " },
  ]);
  assert.deepEqual(x.calls.claims, [token]);
  assert.equal(x.jar.get("sb-test-auth-token"), "sesion");
  assert.equal(x.calls.fetch.length, 1);
  assert.equal(x.calls.fetch[0].init.method, "POST");
  assert.equal(x.calls.fetch[0].init.headers.Authorization, `Bearer ${token}`);
  assert.equal(x.calls.fetch[0].init.body, undefined);
});
for (const status of [400, 401, 403, 422, 500])
  test(`error Supabase ${status} es generico y no contacta API`, async () => {
    const x = await load({
      signInError: { status, message: "correo-no-existe password-secreto" },
    });
    const result = await x.actions.loginAction({}, form());
    assert(result.message);
    assert(!JSON.stringify(result).includes("password-secreto"));
    assert(!JSON.stringify(result).includes("habitante@example.com"));
    assert.equal(x.calls.fetch.length, 0);
    assert.equal(x.jar.size, 0);
  });
test("fallo de red o configuracion durante login es sanitizado", async () => {
  for (const options of [{ signInThrow: true }, { clientUnavailable: true }]) {
    const x = await load(options);
    const result = await x.actions.loginAction({}, form());
    assert.match(result.message, /no está disponible/);
    assert(!JSON.stringify(result).includes("secreto"));
  }
});
test("sesion iniciada con API caida conserva cookies y marca perfil pendiente", async () => {
  const x = await load({
    fetch: () => {
      throw new Error("credencial-no-publicar");
    },
  });
  await assert.rejects(
    x.actions.loginAction({}, form()),
    (e) => e.destination === "/login?perfil=pendiente",
  );
  assert.equal(x.jar.size, 1);
});
test("GET de la pagina verifica el mismo token y solo LEE el perfil", async () => {
  const x = await load({ session: true });
  const view = await x.core.loadLoginView(x.dependencies(false));
  assert.equal(view.kind, "authenticated");
  assert.deepEqual(plain(view.profile), profile);
  assert.deepEqual(x.calls.claims, [token]);
  assert.equal(x.calls.fetch[0].init.method, "GET");
  assert(!JSON.stringify(view).includes(token));
  assert(!JSON.stringify(view).includes("access_token"));
  assert.equal(x.calls.cookies.length, 0);
});
test("GET anonimo no llama API, signIn ni signOut", async () => {
  const x = await load();
  assert.equal(
    (await x.core.loadLoginView(x.dependencies(false))).kind,
    "anonymous",
  );
  assert.equal(x.calls.fetch.length, 0);
  assert.equal(x.calls.signIn.length, 0);
  assert.equal(x.calls.signOut.length, 0);
});
for (const status of [400, 401, 403, 503])
  test(`sesion no verificada ${status} nunca sincroniza ni usa rol desde cookies`, async () => {
    const x = await load({
      session: true,
      claimsError: { status, message: "token-no-publicar" },
    });
    const view = await x.core.loadLoginView(x.dependencies(false));
    assert.equal(view.kind, status === 503 ? "unavailable" : "anonymous");
    const result = await x.actions.continueAction({});
    assert(result.message);
    assert.equal(x.calls.fetch.length, 0);
  });
for (const claims of [
  { role: "service_role" },
  { is_anonymous: true },
  { sub: "" },
])
  test(`claims no admitidos ${JSON.stringify(claims)} no llaman API`, async () => {
    const x = await load({ session: true, claims });
    assert.equal(
      (await x.core.loadLoginView(x.dependencies(false))).kind,
      "anonymous",
    );
    assert.equal(x.calls.fetch.length, 0);
  });
for (const status of [401, 403, 404, 503])
  test(`GET perfil HTTP ${status} distingue ausencia, sesion o dependencia`, async () => {
    const x = await load({
      session: true,
      fetch: () => new Response("detalle-no-publicar", { status }),
    });
    const view = await x.core.loadLoginView(x.dependencies(false));
    assert.equal(view.kind, status === 401 ? "anonymous" : "authenticated");
    if (status !== 401) {
      assert.equal(view.profile, null);
      assert.equal(view.profileUnavailable, status !== 404);
    }
    assert(!JSON.stringify(view).includes("detalle-no-publicar"));
  });
test("continuar sincroniza solo con identidad verificada; sin sesion no escribe", async () => {
  const anonymous = await load();
  assert((await anonymous.actions.continueAction({})).message);
  assert.equal(anonymous.calls.fetch.length, 0);
  const x = await load({ session: true });
  await assert.rejects(
    x.actions.continueAction({}),
    (e) => e.destination === "/login",
  );
  assert.deepEqual(x.calls.claims, [token]);
  assert.equal(x.calls.fetch[0].init.method, "POST");
});
test("un perfil de otra identidad nunca se presenta como disponible", async () => {
  const x = await load({
    session: true,
    profile: { supabaseUserId: "39c24ab1-a65e-43bd-9c8a-f7707146a561" },
  });
  const view = await x.core.loadLoginView(x.dependencies(false));
  assert.equal(view.profile, null);
  assert.equal(view.profileUnavailable, true);
  assert((await x.actions.continueAction({})).message);
});
test("respuestas malformadas o metadata extra no filtran datos", async () => {
  const malformed = await load({
    session: true,
    profile: { role: "service_role" },
  });
  assert.equal(
    (await malformed.core.loadLoginView(malformed.dependencies(false))).profile,
    null,
  );
  const x = await load({
    session: true,
    profile: { password: "no-publicar", refresh_token: "no-publicar" },
  });
  const view = await x.core.loadLoginView(x.dependencies(false));
  assert(!JSON.stringify(view).includes("no-publicar"));
});
test("logout pide scope local, borra cookies por SSR y no llama API", async () => {
  const x = await load({ session: true });
  await assert.rejects(
    x.actions.logoutAction({}),
    (e) => e.destination === "/login",
  );
  assert.deepEqual(plain(x.calls.signOut), [{ scope: "local" }]);
  assert.equal(x.jar.size, 0);
  assert.equal(x.calls.fetch.length, 0);
  assert.equal(x.calls.cookies[0].settings.maxAge, 0);
  assert.equal(
    (await x.core.loadLoginView(x.dependencies(false))).kind,
    "anonymous",
  );
});
test("error logout no afirma cierre ni borra cookies por su cuenta", async () => {
  const x = await load({
    session: true,
    logoutError: new Error("refresh-token-secreto"),
  });
  const result = await x.actions.logoutAction({});
  assert.match(result.message, /No se ha podido cerrar/);
  assert.equal(x.jar.size, 1);
  assert(!JSON.stringify(result).includes("secreto"));
});
test("peticiones aisladas no comparten sesion ni bearer", async () => {
  const a = await load({ session: true });
  const b = await load();
  await a.core.loadLoginView(a.dependencies(false));
  assert.equal(
    (await b.core.loadLoginView(b.dependencies(false))).kind,
    "anonymous",
  );
  assert.equal(b.calls.fetch.length, 0);
});
test("helper privado fija rutas, cache, timeout, cookies omitidas y rechazo de redirect", async () => {
  const x = await load({ session: true });
  await x.core.loadLoginView(x.dependencies(false));
  const { init, url } = x.calls.fetch[0];
  assert.equal(url, "http://localhost:3001/auth/me");
  assert.equal(init.cache, "no-store");
  assert.equal(init.credentials, "omit");
  assert.equal(init.redirect, "error");
  assert(init.signal instanceof AbortSignal);
  assert.equal(init.headers.Cookie, undefined);
  for (const base of [
    "http://example.com",
    "https://user:pass@example.com",
    "https://example.com?next=evil",
    "ftp://example.com",
  ]) {
    await assert.rejects(
      x.api.createPrivateProfileApi(base).read(token),
      (e) => e.status === 503,
    );
  }
  await assert.rejects(
    x.api
      .createPrivateProfileApi("http://localhost:3001")
      .read("sb_publishable_clave"),
    (e) => e.status === 401,
  );
});

test("datos extra del formulario no cambian identidad ni destino y errores de tipo son espanoles", async () => {
  const x = await load();
  const data = form();
  data.set("next", "https://evil.example");
  data.set("role", "ADMIN");
  data.set("access_token", "stolen.token.signature");
  await assert.rejects(
    x.actions.loginAction({}, data),
    (e) => e.destination === "/login",
  );
  assert.equal(x.calls.fetch[0].init.headers.Authorization, `Bearer ${token}`);
  const missing = await x.actions.loginAction({}, new FormData());
  assert.equal(missing.fieldErrors.email, "Introduce tu correo electrónico.");
  assert.equal(missing.fieldErrors.password, "Introduce tu contraseña.");
});
