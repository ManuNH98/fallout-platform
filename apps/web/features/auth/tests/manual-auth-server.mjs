// Diagnostico manual de Phase 5. No se importa en Next ni se despliega.
import { createServer } from "node:http";
import console from "node:console";
import process from "node:process";
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";

const host = "localhost:3196";
const provider = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const api = process.env.NEXT_PUBLIC_API_URL;
if (
  !provider ||
  !key ||
  new URL(provider).protocol !== "https:" ||
  api !== "http://localhost:3001"
)
  throw new Error(
    "Configura el entorno local web previsto antes del diagnostico.",
  );

// Etiquetas efimeras de prueba: nunca se muestran UUID ni se guardan sesiones.
const accounts = new Map();

const server = createServer(async (request, response) => {
  response.setHeader("Cache-Control", "private, no-store, max-age=0");
  response.setHeader("Vary", "Cookie");
  // Esta pagina no contiene queries sensibles; Safari necesita conservar el
  // origen en el POST del formulario. El callback de producto sigue no-referrer.
  response.setHeader("Referrer-Policy", "same-origin");
  response.setHeader("X-Robots-Tag", "noindex, nofollow");
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; frame-ancestors 'none'; form-action 'self'",
  );
  const origin = request.headers.origin;
  const renewing = request.method === "POST" && request.url === "/renovar";
  const reading = request.method === "GET" && request.url === "/";
  if (
    (!reading && !renewing) ||
    (renewing && origin !== `http://${host}`) ||
    request.headers.host !== host ||
    (origin && origin !== `http://${host}`) ||
    request.headers["sec-fetch-site"] === "cross-site"
  ) {
    response
      .writeHead(403, { "Content-Type": "text/plain; charset=utf-8" })
      .end("Solicitud local no autorizada.");
    return;
  }
  const results = {
    sessionVerified: false,
    accountLabel: null,
    sessionRefreshed: false,
    accessTokenChanged: false,
    profileHttp: null,
    profileMatchesSubject: null,
    adminHttp: null,
  };
  try {
    const cookieJar = new Map(
      parseCookieHeader(request.headers.cookie ?? "").map(({ name, value }) => [
        name,
        value,
      ]),
    );
    const written = new Map();
    const client = createServerClient(provider, key, {
      cookies: {
        getAll: () => [...cookieJar].map(([name, value]) => ({ name, value })),
        setAll: (updates) => {
          for (const { name, value, options } of updates) {
            cookieJar.set(name, value);
            written.set(name, serializeCookieHeader(name, value, options));
          }
          response.setHeader("Set-Cookie", [...written.values()]);
        },
      },
    });
    const { data: sessionData, error: sessionError } =
      await client.auth.getSession();
    let token = sessionData.session?.access_token;
    if (renewing && !sessionError && token) {
      const previous = token;
      const { data, error } = await client.auth.refreshSession();
      if (error || !data.session?.access_token)
        throw new Error("Renovacion no completada.");
      token = data.session.access_token;
      results.sessionRefreshed = true;
      results.accessTokenChanged = token !== previous;
    }
    if (!sessionError && token) {
      const { data, error } = await client.auth.getClaims(token);
      if (
        !error &&
        data?.claims.sub &&
        data.claims.role === "authenticated" &&
        data.claims.is_anonymous !== true
      ) {
        results.sessionVerified = true;
        if (!accounts.has(data.claims.sub))
          accounts.set(data.claims.sub, `Cuenta ${accounts.size + 1}`);
        results.accountLabel = accounts.get(data.claims.sub);
        const call = (path) =>
          fetch(`${api}/${path}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            cache: "no-store",
            credentials: "omit",
            redirect: "error",
            signal: AbortSignal.timeout(5000),
          });
        const [profile, admin] = await Promise.all([
          call("auth/me"),
          call("admin/comprobacion"),
        ]);
        results.profileHttp = profile.status;
        results.adminHttp = admin.status;
        if (profile.ok)
          results.profileMatchesSubject =
            (await profile.json()).supabaseUserId === data.claims.sub;
        await admin.arrayBuffer();
      }
    }
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(
      `<!doctype html><html lang="es"><meta charset="utf-8"><title>Comprobación local de Auth</title><h1>Comprobación local de Auth</h1><pre>${JSON.stringify(results, null, 2)}</pre><p>Perfil y permisos: solo lectura. No se crean perfiles ni se muestran credenciales.</p><form method="post" action="/renovar"><button type="submit">Renovar sesión de prueba</button></form></html>`,
    );
  } catch {
    response
      .writeHead(503, { "Content-Type": "text/plain; charset=utf-8" })
      .end("No se ha podido completar la comprobación local.");
  }
});
server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
server.listen(3196, "127.0.0.1", () => {
  console.info(
    "Diagnostico temporal en http://localhost:3196 (solo loopback). Ctrl+C para cerrar.",
  );
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => server.close(() => process.exit(0)));
}
