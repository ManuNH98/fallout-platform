import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnvironment } from "../../lib/env";

export async function createRegistrationClient() {
  const { url, publishableKey } = getSupabaseEnvironment();
  const store = await cookies();
  const verifier = `sb-${new URL(url).hostname.split(".")[0]}-auth-token-code-verifier`;
  const isVerifier = (name: string) =>
    name === verifier ||
    (name.startsWith(`${verifier}.`) &&
      /^\d+$/.test(name.slice(verifier.length + 1)));

  return createServerClient(url, publishableKey, {
    cookieOptions: { maxAge: 60 * 60 },
    cookies: {
      // El registro solo conserva el verifier PKCE, nunca una sesion prematura
      // ni cambios sobre otra cuenta ya iniciada en este navegador.
      getAll: () => store.getAll().filter(({ name }) => isVerifier(name)),
      setAll: (updates) => {
        updates
          .filter(({ name }) => isVerifier(name))
          .forEach(({ name, value, options }) => {
            store.set(name, value, { ...options, maxAge: value ? 60 * 60 : 0 });
          });
      },
    },
  });
}
