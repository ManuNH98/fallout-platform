import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnvironment } from "../../lib/env";

// El registro no debe sustituir cookies existentes ni iniciar una sesion antes
// de confirmar el correo, incluso si el proveedor se configura incorrectamente.
export async function createRegistrationClient() {
  const { url, publishableKey } = getSupabaseEnvironment();
  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
