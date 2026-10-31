import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserProfileResponse } from "@repo/types";
import { loginSchema } from "@repo/validation";
import {
  PrivateApiError,
  type createPrivateProfileApi,
} from "../../lib/api/private-profile";
import type { AuthActionState } from "./types";

export interface AuthDependencies {
  client: () => Promise<Pick<SupabaseClient, "auth">>;
  api: ReturnType<typeof createPrivateProfileApi>;
}
type VerifiedSession =
  | { kind: "verified"; token: string; subject: string }
  | { kind: "anonymous" }
  | { kind: "unavailable" };
export type AuthResult =
  | { kind: "error"; state: AuthActionState }
  | { kind: "redirect"; destination: "/login" | "/login?perfil=pendiente" };
export type LoginView =
  | { kind: "anonymous" }
  | { kind: "unavailable" }
  | {
      kind: "authenticated";
      profile: UserProfileResponse | null;
      profileUnavailable: boolean;
    };

async function verify(
  client: Pick<SupabaseClient, "auth">,
  token: string,
): Promise<VerifiedSession> {
  const { data, error } = await client.auth.getClaims(token);
  if (error)
    return {
      kind: [400, 401, 403].includes(error.status ?? 0)
        ? "anonymous"
        : "unavailable",
    };
  const claims = data?.claims;
  if (
    typeof claims?.sub !== "string" ||
    !claims.sub ||
    claims.role !== "authenticated" ||
    claims.is_anonymous === true
  )
    return { kind: "anonymous" };
  return { kind: "verified", token, subject: claims.sub };
}
async function currentSession(
  client: Pick<SupabaseClient, "auth">,
): Promise<VerifiedSession> {
  const { data, error } = await client.auth.getSession();
  if (error)
    return {
      kind: [400, 401, 403].includes(error.status ?? 0)
        ? "anonymous"
        : "unavailable",
    };
  if (!data.session?.access_token) return { kind: "anonymous" };
  // getSession obtiene el bearer; solo getClaims sobre ESE token acredita identidad.
  return verify(client, data.session.access_token);
}
function assertOwnProfile(profile: UserProfileResponse, subject: string) {
  if (profile.supabaseUserId !== subject) throw new PrivateApiError(503);
}

export async function loadLoginView(
  deps: AuthDependencies,
): Promise<LoginView> {
  try {
    const session = await currentSession(await deps.client());
    if (session.kind !== "verified") return { kind: session.kind };
    try {
      const profile = await deps.api.read(session.token);
      assertOwnProfile(profile, session.subject);
      return { kind: "authenticated", profile, profileUnavailable: false };
    } catch (error) {
      if (error instanceof PrivateApiError && error.status === 401)
        return { kind: "anonymous" };
      return {
        kind: "authenticated",
        profile: null,
        profileUnavailable: !(
          error instanceof PrivateApiError && error.status === 404
        ),
      };
    }
  } catch {
    return { kind: "unavailable" };
  }
}

export async function login(
  form: FormData,
  deps: AuthDependencies,
): Promise<AuthResult> {
  const parsed = loginSchema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    return {
      kind: "error",
      state: {
        message: "Revisa los campos indicados.",
        fieldErrors: {
          email: errors.email?.[0],
          password: errors.password?.[0],
        },
      },
    };
  }
  try {
    const client = await deps.client();
    const { data, error } = await client.auth.signInWithPassword(parsed.data);
    if (error)
      return {
        kind: "error",
        state: {
          message:
            (error.status ?? 500) < 500
              ? "No se ha podido iniciar sesión. Revisa tu correo y contraseña."
              : "El servicio de acceso no está disponible. Inténtalo más tarde.",
        },
      };
    if (!data.session?.access_token)
      return {
        kind: "error",
        state: {
          message: "No se ha podido iniciar sesión. Inténtalo de nuevo.",
        },
      };
    try {
      const session = await verify(client, data.session.access_token);
      if (session.kind !== "verified") throw new Error("Sesion sin verificar.");
      const profile = await deps.api.synchronize(session.token);
      assertOwnProfile(profile, session.subject);
      return { kind: "redirect", destination: "/login" };
    } catch {
      // La sesion puede estar iniciada aunque la API este caida. No afirmar exito del perfil.
      return { kind: "redirect", destination: "/login?perfil=pendiente" };
    }
  } catch {
    return {
      kind: "error",
      state: {
        message:
          "El servicio de acceso no está disponible. Inténtalo más tarde.",
      },
    };
  }
}

export async function continueSession(
  deps: AuthDependencies,
): Promise<AuthResult> {
  try {
    const session = await currentSession(await deps.client());
    if (session.kind === "anonymous")
      return {
        kind: "error",
        state: { message: "Tu sesión ha caducado. Vuelve a iniciar sesión." },
      };
    if (session.kind !== "verified") throw new Error("Sesion no disponible.");
    const profile = await deps.api.synchronize(session.token);
    assertOwnProfile(profile, session.subject);
    return { kind: "redirect", destination: "/login" };
  } catch {
    return {
      kind: "error",
      state: {
        message:
          "No se ha podido preparar tu perfil. Puedes reintentar o cerrar la sesión.",
      },
    };
  }
}

export async function logout(deps: AuthDependencies): Promise<AuthResult> {
  try {
    const { error } = await (
      await deps.client()
    ).auth.signOut({ scope: "local" });
    if (error) throw error;
    return { kind: "redirect", destination: "/login" };
  } catch {
    return {
      kind: "error",
      state: {
        message: "No se ha podido cerrar la sesión. Inténtalo de nuevo.",
      },
    };
  }
}
