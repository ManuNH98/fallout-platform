import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";

// Harness sin runner adicional: transpila con TypeScript y aisla entorno/SDK.
// Ejecutar con node --experimental-vm-modules --test <este archivo>.
const require = createRequire(import.meta.url);
const ts = require("typescript");
const validEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_prueba",
};

async function loadFactories(environment = validEnvironment, stores = []) {
  const calls = [];
  let cookieRequests = 0;
  const context = vm.createContext({ URL, process: { env: environment } });
  const sdk = new vm.SyntheticModule(
    ["createBrowserClient", "createServerClient"],
    function () {
      for (const name of ["createBrowserClient", "createServerClient"]) {
        this.setExport(name, (...args) => {
          const client = { name, args };
          calls.push(client);
          return client;
        });
      }
    },
    { context },
  );
  const headers = new vm.SyntheticModule(
    ["cookies"],
    function () {
      this.setExport("cookies", async () => stores[cookieRequests++]);
    },
    { context },
  );
  const serverOnly = new vm.SyntheticModule([], function () {}, { context });
  const modules = new Map();

  for (const [name, path] of [
    ["env", "../../env.ts"],
    ["client", "../client.ts"],
    ["server", "../server.ts"],
  ]) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    });
    modules.set(name, new vm.SourceTextModule(outputText, { context }));
  }

  for (const name of ["client", "server"]) {
    const entry = modules.get(name);
    await entry.link((specifier) => {
      if (specifier === "../env") return modules.get("env");
      if (specifier === "@supabase/ssr") return sdk;
      if (specifier === "next/headers") return headers;
      if (specifier === "server-only") return serverOnly;
      throw new Error(`Import inesperado: ${specifier}`);
    });
    await entry.evaluate();
  }

  return {
    browser: modules.get("client").namespace.createClient,
    server: modules.get("server").namespace.createClient,
    environment: modules.get("env").namespace.webEnvironment,
    calls,
    cookieRequests: () => cookieRequests,
  };
}

test("importar sin Supabase permite mocks y no crea clientes ni lee cookies", async () => {
  const result = await loadFactories({});
  assert.equal(result.environment.supabaseUrl, undefined);
  assert.equal(result.calls.length, 0);
  assert.equal(result.cookieRequests(), 0);
  assert.throws(() => result.browser(), /Configura NEXT_PUBLIC_SUPABASE_URL/);
  await assert.rejects(result.server(), /Configura NEXT_PUBLIC_SUPABASE_URL/);
  assert.equal(result.calls.length, 0);
  assert.equal(result.cookieRequests(), 0);
});

test("la configuracion parcial o invalida falla sin incluir valores", async () => {
  for (const environment of [
    { NEXT_PUBLIC_SUPABASE_URL: validEnvironment.NEXT_PUBLIC_SUPABASE_URL },
    { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "valor-que-no-debe-aparecer" },
  ]) {
    await assert.rejects(loadFactories(environment), (error) => {
      assert.match(error.message, /deben configurarse juntas/);
      assert.ok(!error.message.includes("valor-que-no-debe-aparecer"));
      return true;
    });
  }
  await assert.rejects(
    loadFactories({
      ...validEnvironment,
      NEXT_PUBLIC_SUPABASE_URL: "url-invalida",
    }),
    /NEXT_PUBLIC_SUPABASE_URL debe ser una URL valida/,
  );
});

test("la factoria navegador recibe solo URL y publishable key al invocarse", async () => {
  const result = await loadFactories(validEnvironment);
  assert.equal(result.calls.length, 0);
  const client = result.browser();
  assert.equal(client.name, "createBrowserClient");
  assert.deepEqual(client.args, [
    validEnvironment.NEXT_PUBLIC_SUPABASE_URL,
    validEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ]);
  assert.equal(result.cookieRequests(), 0);
});

test("cada cliente servidor usa el almacen de su peticion y solo lee por defecto", async () => {
  const firstCookies = [{ name: "sesion", value: "primera" }];
  const secondCookies = [{ name: "sesion", value: "segunda" }];
  const result = await loadFactories(validEnvironment, [
    { getAll: () => firstCookies },
    { getAll: () => secondCookies },
  ]);
  const first = await result.server();
  const second = await result.server();
  assert.notEqual(first, second);
  assert.equal(result.cookieRequests(), 2);
  assert.equal(first.args[2].cookies.getAll(), firstCookies);
  assert.equal(second.args[2].cookies.getAll(), secondCookies);
  assert.equal(first.args[2].cookies.setAll, undefined);
  assert.deepEqual(first.args.slice(0, 2), [
    validEnvironment.NEXT_PUBLIC_SUPABASE_URL,
    validEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ]);
});

test("escritura explicita conserva chunks, borrados y opciones del SDK", async () => {
  const writes = [];
  const result = await loadFactories(validEnvironment, [
    {
      getAll: () => [],
      set: (...args) => writes.push(args),
    },
  ]);
  const client = await result.server({ writableCookies: true });
  const changes = [
    {
      name: "sesion.0",
      value: "chunk",
      options: { path: "/", sameSite: "lax", secure: true },
    },
    { name: "sesion.1", value: "", options: { path: "/", maxAge: 0 } },
  ];
  client.args[2].cookies.setAll(changes);
  assert.deepEqual(
    writes,
    changes.map(({ name, value, options }) => [name, value, options]),
  );
});

test("errores al escribir cookies se propagan en lugar de ocultar una sesion perdida", async () => {
  const failure = new Error("almacen no escribible");
  const result = await loadFactories(validEnvironment, [
    {
      getAll: () => [],
      set: () => {
        throw failure;
      },
    },
  ]);
  const client = await result.server({ writableCookies: true });
  assert.throws(
    () =>
      client.args[2].cookies.setAll([
        { name: "sesion", value: "prueba", options: {} },
      ]),
    (error) => error === failure,
  );
});
