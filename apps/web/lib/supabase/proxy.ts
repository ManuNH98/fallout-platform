import "server-only";

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnvironment } from "../env";

const cacheHeaders = ["cache-control", "expires", "pragma"] as const;

function copySession(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  cacheHeaders.forEach((name) => {
    const value = source.headers.get(name);
    if (value !== null) target.headers.set(name, value);
  });
  return target;
}

function privateResponse(response: NextResponse) {
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0",
  );
  response.headers.set("Expires", "0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const unavailable = () =>
    privateResponse(
      copySession(
        response,
        NextResponse.json(
          {
            message: "No se ha podido comprobar la sesion. Intentalo de nuevo.",
          },
          { status: 503 },
        ),
      ),
    );

  try {
    const { url, publishableKey } = getSupabaseEnvironment();
    const supabase = createServerClient(url, publishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // Recrear la respuesta propaga las cookies nuevas al render servidor.
          response = copySession(response, NextResponse.next({ request }));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([name, value]) =>
            response.headers.set(name, value),
          );
        },
      },
    });

    const { data, error } = await supabase.auth.getClaims();

    if (error && ![400, 401, 403].includes(error.status ?? 0)) {
      return unavailable();
    }

    const hasIdentity = !error && Boolean(data?.claims.sub);
    const isPrivateRoute =
      request.nextUrl.pathname === "/admin" ||
      request.nextUrl.pathname.startsWith("/admin/");

    if (isPrivateRoute && !hasIdentity) {
      const destination = request.nextUrl.clone();
      destination.pathname = "/login";
      destination.search = "";
      return privateResponse(
        copySession(response, NextResponse.redirect(destination, 303)),
      );
    }

    // Una identidad valida no acredita rol ADMIN: NestJS autorizara los datos.
    return privateResponse(response);
  } catch {
    // No exponer tokens, cookies ni detalles del proveedor en respuestas/logs.
    return unavailable();
  }
}
