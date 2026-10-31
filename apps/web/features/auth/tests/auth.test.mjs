import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const { createServerClient: realServerClient } = require("@supabase/ssr");
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
    signUp: [],
    exchange: [],
    claims: [],
    signOut: [],
    fetch: [],
    cookies: [],
  };
  const jar = new Map(options.initialCookies ?? []);
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
    URLSearchParams,
    Request,
    Response,
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
      createServerClient(_url, _key, { cookies, cookieOptions }) {
        calls.clientCookies = cookies;
        calls.cookieOptions = cookieOptions;
        calls.clients++;
        if (options.realSdk)
          return realServerClient(_url, _key, {
            cookies,
            cookieOptions,
            global: { fetch: options.authFetch },
          });
        if (options.clientUnavailable)
          throw new Error("configuracion-sensible");
        return {
          auth: {
            async signUp(input) {
              calls.signUp.push(input);
              if (options.signUpThrow) throw new Error("password-secreto");
              cookies.setAll([
                { name: "sb-project-auth-token-code-verifier", value: "verifier", options: { path: "/", maxAge: cookieOptions.maxAge, sameSite: "lax" } },
                ...(options.signUpSession ? [{ name: "sb-test-auth-token", value: "prematura", options: { path: "/" } }] : []),
              ]);
              return { data: { user: options.signUpUser ?? { id: subject }, session: options.signUpSession ?? null }, error: options.signUpError ?? null };
            },
            async exchangeCodeForSession(input) {
              calls.exchange.push(input);
              if (options.exchangeThrow) throw new Error("code-secreto");
              if (options.exchangeError) return { data: { session: null }, error: options.exchangeError };
              if (options.exchangeMissingSession) return { data: { session: null }, error: null };
              cookies.setAll([{ name: "sb-test-auth-token", value: "confirmada", options: { path: "/", sameSite: "lax" } }]);
              session = { access_token: token };
              return { data: { session }, error: null };
            },
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
    ["registration", "../registration.ts"],
    ["registration-client", "../registration-client.ts"],
    ["confirm-route", "../../../app/(auth)/auth/confirmar/route.ts"],
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
    "./registration": "registration",
    "./registration-client": "registration-client",
    "@/features/auth/registration": "registration",
    "@/lib/supabase/server": "client",
    "./core": "core",
    "./server": "server",
  };
  const linker = (specifier) =>
      externals[specifier] ??
      modules.get(imports[specifier]) ??
      externals[imports[specifier]] ??
      (() => {
        throw new Error(`Import inesperado: ${specifier}`);
      })();
  await modules.get("actions").link(linker);
  await modules.get("confirm-route").link(linker);
  await modules.get("actions").evaluate();
  await modules.get("confirm-route").evaluate();
  return {
    calls,
    jar,
    actions: modules.get("actions").namespace,
    core: modules.get("core").namespace,
    registration: modules.get("registration").namespace,
    confirmRoute: modules.get("confirm-route").namespace,
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

function registrationForm(email = " habitante@example.com ", password = " clave privada ", confirmation = password) {
  const data = form(email, password);
  data.set("passwordConfirmation", confirmation);
  return data;
}
const authCode = "a".repeat(64);
const confirmationUrl = `https://host-no-fiable.example/auth/confirmar?code=${authCode}`;

test("registro valida email, minimo y confirmacion en servidor sin usar SDK", async () => {
  const x = await load();
  for (const data of [registrationForm("incorrecto"), registrationForm(undefined, "corta"), registrationForm(undefined, undefined, "otra"), new FormData()]) {
    const state = await x.actions.registerAction({}, data);
    assert.ok(state.fieldErrors);
    assert.equal(state.submitted, undefined);
    assert.ok(!JSON.stringify(state).includes("clave privada"));
  }
  const file = registrationForm();
  file.set("password", new Blob(["secreto"]), "password.txt");
  assert.ok((await x.actions.registerAction({}, file)).fieldErrors.password);
  assert.equal(x.calls.signUp.length, 0);
  assert.equal(x.calls.clients, 0);
});

test("registro envia redirect fijo y solo persiste verifier, sin metadata ni cookies de sesion", async () => {
  const x = await load({ session: true });
  const data = registrationForm();
  data.set("role", "ADMIN");
  data.set("next", "https://hostil.example");
  data.set("supabaseUserId", subject);
  const state = await x.actions.registerAction({ submitted: true }, data);
  assert.equal(state.submitted, true);
  assert.match(state.message, /recibirás un correo/);
  assert.deepEqual(plain(x.calls.signUp), [{ email: "habitante@example.com", password: " clave privada ", options: { emailRedirectTo: "http://localhost:3000/auth/confirmar" } }]);
  assert.equal(x.calls.cookieOptions.maxAge, 3600);
  assert.equal(x.calls.clients, 1);
  assert.equal(x.calls.cookies.length, 1);
  assert.equal(x.calls.cookies[0].name, "sb-project-auth-token-code-verifier");
  assert.deepEqual(plain(x.calls.clientCookies.getAll()).map(({ name }) => name), ["sb-project-auth-token-code-verifier"]);
  assert.equal(x.jar.get("sb-test-auth-token"), "sesion");
  assert.equal(x.calls.fetch.length, 0);
});

test("cuenta existente y nueva producen el mismo estado sin enumeracion", async () => {
  const fresh = await load();
  const expected = await fresh.actions.registerAction({}, registrationForm());
  for (const code of ["user_already_exists", "email_exists"]) {
    const x = await load({ signUpError: { status: 422, code, message: "identidad-secreta" } });
    assert.deepEqual(plain(await x.actions.registerAction({}, registrationForm())), plain(expected));
  }
  const obfuscated = await load({ signUpUser: { identities: [] } });
  assert.deepEqual(plain(await obfuscated.actions.registerAction({}, registrationForm())), plain(expected));
});

test("registro rechaza sesion prematura sin persistirla ni anunciar confirmacion", async () => {
  const x = await load({ signUpSession: { access_token: "secreto" } });
  const state = await x.actions.registerAction({}, registrationForm());
  assert.equal(state.submitted, undefined);
  assert.match(state.message, /no está disponible/);
  assert.ok(x.calls.cookies.every(({ name }) => name.endsWith("-code-verifier")));
  assert.equal(x.calls.fetch.length, 0);
});

test("limite de correo, error de proveedor y excepcion no exponen secretos ni reintentan", async () => {
  for (const options of [{ signUpError: { status: 429, message: "secreto" } }, { signUpError: { status: 500, message: "secreto" } }, { signUpThrow: true }]) {
    const x = await load(options);
    const state = await x.actions.registerAction({}, registrationForm());
    assert.equal(state.submitted, undefined);
    assert.ok(!JSON.stringify(state).includes("secreto"));
    assert.equal(x.calls.signUp.length, 1);
    assert.ok(x.calls.cookies.every(({ name }) => name.endsWith("-code-verifier")));
  }
});

test("confirmacion valida escribe cookies SSR y redirige sin token ni Host/next", async () => {
  const x = await load();
  const response = await x.confirmRoute.GET(new Request(`${confirmationUrl}&next=https://hostil.example&redirect_to=//hostil.example`));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/login");
  assert.match(response.headers.get("cache-control"), /private.*no-store/);
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(await response.text(), "");
  assert.deepEqual(plain(x.calls.exchange), [authCode]);
  assert.equal(x.jar.get("sb-test-auth-token"), "confirmada");
  assert.equal(x.calls.fetch.length, 0);
});

test("parametros ausentes, duplicados, enormes, TokenHash o errores del proveedor no canjean", async () => {
  const x = await load();
  for (const query of ["", "type=email", `code=${authCode}&type=recovery`, `code=${authCode}&code=${authCode}`, "code=corto", `code=${"a".repeat(1025)}`, `code=${encodeURIComponent("<script>".repeat(8))}`, `code=${authCode}&error=access_denied`, `code=${authCode}&error_code=otp_expired`, `code=${authCode}&token_hash=${authCode}`]) {
    const response = await x.confirmRoute.GET(new Request(`http://localhost/auth/confirmar?${query}`));
    assert.equal(response.headers.get("location"), "/registro?confirmacion=invalida");
    assert.equal(response.status, 303);
  }
  assert.equal(x.calls.clients, 0);
  assert.equal(x.calls.exchange.length, 0);
  assert.equal(x.calls.cookies.length, 0);
});

for (const [name, exchangeError] of [
  ["incorrecto", { status: 400, code: "otp_expired" }],
  ["caducado", { status: 403, code: "otp_expired" }],
  ["reutilizado", { status: 403, code: "otp_expired" }],
]) {
  test(`enlace ${name} no inicia sesion ni llama a Nest`, async () => {
    const x = await load({ exchangeError });
    const response = await x.confirmRoute.GET(new Request(confirmationUrl));
    assert.equal(response.headers.get("location"), "/registro?confirmacion=invalida");
    assert.equal(x.calls.cookies.length, 0);
    assert.equal(x.calls.fetch.length, 0);
    assert.ok(!(await response.text()).includes(authCode));
  });
}

test("fallos de confirmacion y respuesta sin sesion se sanitizan", async () => {
  for (const options of [{ exchangeError: { status: 500, message: authCode } }, { exchangeThrow: true }, { exchangeMissingSession: true }]) {
    const x = await load(options);
    const response = await x.confirmRoute.GET(new Request(confirmationUrl));
    assert.equal(response.headers.get("location"), options.exchangeMissingSession ? "/registro?confirmacion=invalida" : "/registro?confirmacion=no-disponible");
    assert.equal(x.calls.cookies.length, 0);
    assert.equal(x.calls.fetch.length, 0);
    assert.equal(x.calls.exchange.length, 1);
  }
});

test("confirmaciones concurrentes mantienen cookies independientes", async () => {
  const [a, b] = await Promise.all([load(), load({ exchangeError: { status: 403 } })]);
  await Promise.all([a.confirmRoute.GET(new Request(confirmationUrl)), b.confirmRoute.GET(new Request(confirmationUrl))]);
  assert.equal(a.jar.get("sb-test-auth-token"), "confirmada");
  assert.equal(b.jar.size, 0);
});

test("Next excluye queries de confirmacion del logger de peticiones y desactiva argumentos de acciones", async () => {
  const { default: config } = await import("../../../next.config.js");
  const { ignoreLoggingIncomingRequests } = require("next/dist/server/dev/log-requests.js");
  assert.equal(config.logging.serverFunctions, false);
  for (const path of ["/auth/confirmar", `/auth/confirmar?code=${authCode}`, "/auth/confirmar/?type=email"])
    assert.equal(ignoreLoggingIncomingRequests({ url: path }, config.logging), true);
  for (const path of ["/", "/wiki", "/login", "/registro", "/auth/confirmar-otra"])
    assert.equal(ignoreLoggingIncomingRequests({ url: path }, config.logging), false);
});

test("SDK real conserva challenge/verifier entre registro y callback, sin sesion hasta confirmar", async () => {
  const { createHash } = await import("node:crypto");
  const user = { id: subject, aud: "authenticated", role: "authenticated", email: "habitante@example.com", app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {}, created_at: "2026-10-31T10:00:00Z", identities: [] };
  const jwt = [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"),
    Buffer.from(JSON.stringify({ sub: subject, exp: Math.floor(Date.now() / 1000) + 3600, role: "authenticated" })).toString("base64url"),
    Buffer.alloc(32).toString("base64url"),
  ].join(".");
  let challenge;
  let used = false;
  const requests = [];
  const authFetch = async (input, init) => {
    const url = new URL(input);
    const body = JSON.parse(init.body);
    requests.push({ url, body });
    if (url.pathname.endsWith("/signup")) {
      challenge = body.code_challenge;
      assert.equal(body.code_challenge_method, "s256");
      assert.equal(url.searchParams.get("redirect_to"), "http://localhost:3000/auth/confirmar");
      return Response.json({ ...user });
    }
    assert.equal(url.pathname, "/auth/v1/token");
    assert.equal(url.searchParams.get("grant_type"), "pkce");
    assert.equal(body.auth_code, authCode);
    if (used || !body.code_verifier || createHash("sha256").update(body.code_verifier).digest("base64url") !== challenge)
      return Response.json({ code: "bad_code_verifier", msg: "Invalid verifier" }, { status: 400 });
    used = true;
    return Response.json({ access_token: jwt, refresh_token: "synthetic-refresh", expires_in: 3600, token_type: "bearer", user });
  };
  const x = await load({ realSdk: true, authFetch });
  assert.equal((await x.actions.registerAction({}, registrationForm())).submitted, true);
  assert.deepEqual([...x.jar.keys()], ["sb-project-auth-token-code-verifier"]);
  assert.equal(x.calls.cookies[0].settings.maxAge, 3600);
  assert.equal(x.calls.fetch.length, 0);
  const otherBrowser = await load({ realSdk: true, authFetch });
  const rejected = await otherBrowser.confirmRoute.GET(new Request(confirmationUrl));
  assert.equal(rejected.headers.get("location"), "/registro?confirmacion=invalida");
  assert.equal(otherBrowser.jar.has("sb-project-auth-token"), false);
  const response = await x.confirmRoute.GET(new Request(confirmationUrl));
  assert.equal(response.headers.get("location"), "/login");
  assert.equal(x.jar.has("sb-project-auth-token-code-verifier"), false);
  assert.equal(x.jar.has("sb-project-auth-token"), true);
  const replay = await x.confirmRoute.GET(new Request(confirmationUrl));
  assert.equal(replay.headers.get("location"), "/registro?confirmacion=invalida");
  assert.equal(x.calls.fetch.length, 0);
  assert.ok(requests.length >= 2);
});

test("registro filtra cookies de sesion y otros proyectos, preservando chunks del verifier", async () => {
  const x = await load({ initialCookies: [["sb-project-auth-token", "existente"], ["ajena", "privada"], ["sb-project-auth-token-code-verifier.0", "previo"]] });
  await x.actions.registerAction({}, registrationForm());
  assert.ok(x.calls.clientCookies.getAll().every(({ name }) => name.startsWith("sb-project-auth-token-code-verifier")));
  x.calls.clientCookies.setAll([
    { name: "sb-project-auth-token-code-verifier.0", value: "", options: { maxAge: 0 } },
    { name: "sb-project-auth-token-code-verifier.1", value: "nuevo", options: { path: "/", sameSite: "lax" } },
    { name: "sb-project-auth-token-code-verifier.hostil", value: "incorrecto", options: {} },
    { name: "sb-otro-auth-token-code-verifier", value: "incorrecto", options: {} },
    { name: "sb-project-auth-token", value: "sustituida", options: {} },
  ]);
  assert.equal(x.jar.get("sb-project-auth-token"), "existente");
  assert.equal(x.jar.get("ajena"), "privada");
  assert.equal(x.jar.has("sb-project-auth-token-code-verifier.0"), false);
  assert.equal(x.jar.get("sb-project-auth-token-code-verifier.1"), "nuevo");
  assert.equal(x.jar.has("sb-project-auth-token-code-verifier.hostil"), false);
  assert.equal(x.jar.has("sb-otro-auth-token-code-verifier"), false);
});

test("SDK real renueva una sesion caducada, usa el bearer nuevo y logout impide otra renovacion", async () => {
  const { generateKeyPairSync, sign } = await import("node:crypto");
  const keys = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const jwk = { ...keys.publicKey.export({ format: "jwk" }), kid: "integracion-renovacion", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  function jwt(expiration) {
    const header = Buffer.from(JSON.stringify({ alg: "ES256", typ: "JWT", kid: jwk.kid })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ sub: subject, role: "authenticated", is_anonymous: false, iss: "https://project.example/auth/v1", aud: "authenticated", exp: expiration, iat: now - 600 })).toString("base64url");
    const input = `${header}.${payload}`;
    return `${input}.${sign("sha256", Buffer.from(input), { key: keys.privateKey, dsaEncoding: "ieee-p1363" }).toString("base64url")}`;
  }
  const user = { id: subject, aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: {}, created_at: "2026-10-31T10:00:00Z" };
  const oldToken = jwt(now - 120);
  const newToken = jwt(now + 3600);
  const session = { access_token: oldToken, refresh_token: "synthetic-refresh", expires_at: now - 120, expires_in: 3600, token_type: "bearer", user };
  const authRequests = [];
  const x = await load({
    realSdk: true,
    initialCookies: [["sb-project-auth-token", `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`], ["sb-project-auth-token-code-verifier", "pending-verifier"]],
    authFetch: async (input, init) => {
      const url = new URL(input);
      authRequests.push({ path: url.pathname, grant: url.searchParams.get("grant_type"), scope: url.searchParams.get("scope") });
      if (url.pathname.endsWith("/token")) {
        assert.equal(url.searchParams.get("grant_type"), "refresh_token");
        assert.equal(JSON.parse(init.body).refresh_token, "synthetic-refresh");
        return Response.json({ access_token: newToken, refresh_token: "synthetic-refresh-rotated", expires_in: 3600, token_type: "bearer", user });
      }
      if (url.pathname.endsWith("/.well-known/jwks.json")) return Response.json({ keys: [jwk] });
      assert.equal(url.pathname, "/auth/v1/logout");
      assert.equal(url.searchParams.get("scope"), "local");
      return new Response(null, { status: 204 });
    },
  });
  const view = await x.core.loadLoginView(x.dependencies(true));
  assert.equal(view.kind, "authenticated");
  assert.equal(x.jar.has("sb-project-auth-token-code-verifier"), false);
  assert.equal(view.profile.supabaseUserId, subject);
  assert.equal(x.calls.fetch.length, 1);
  assert.equal(x.calls.fetch[0].init.headers.Authorization, `Bearer ${newToken}`);
  assert.ok(x.calls.cookies.some(({ name, value }) => name === "sb-project-auth-token" && value));
  assert.equal(authRequests.filter(({ grant }) => grant === "refresh_token").length, 1);
  await assert.rejects(x.actions.logoutAction({}), (error) => error.destination === "/login");
  assert.equal(x.jar.has("sb-project-auth-token"), false);
  assert.equal(authRequests.filter(({ scope }) => scope === "local").length, 1);
  assert.equal((await x.core.loadLoginView(x.dependencies(true))).kind, "anonymous");
  assert.equal(authRequests.filter(({ grant }) => grant === "refresh_token").length, 1);
  assert.equal(x.calls.fetch.length, 1);
});
