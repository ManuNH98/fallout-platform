import "server-only";

import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnvironment } from "../env";

// Server Components solo leen; Actions/Handlers deben habilitar la escritura.
// La renovacion de sesiones desde Proxy se implementa en la siguiente tarea.
export async function createClient({ writableCookies = false } = {}) {
  const { url, publishableKey } = getSupabaseEnvironment();
  const cookieStore = await cookies();
  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
  };

  if (writableCookies) {
    cookieMethods.setAll = (cookiesToSet) => {
      cookiesToSet.forEach(({ name, value, options }) => {
        cookieStore.set(name, value, options);
      });
    };
  }

  return createServerClient(url, publishableKey, { cookies: cookieMethods });
}
