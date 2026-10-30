import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { confirmationSchema, registrationSchema } from "@repo/validation";
import type { AuthActionState } from "./types";

type ClientFactory = () => Promise<Pick<SupabaseClient, "auth">>;
const pendingMessage =
  "Si el registro puede completarse, recibirás un correo para confirmar tu cuenta. Revisa tu bandeja de entrada y la carpeta de spam.";

export async function register(
  form: FormData,
  clientFactory: ClientFactory,
): Promise<AuthActionState> {
  const parsed = registrationSchema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
    passwordConfirmation: form.get("passwordConfirmation"),
  });
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    return {
      message: "Revisa los campos indicados.",
      fieldErrors: {
        email: errors.email?.[0],
        password: errors.password?.[0],
        passwordConfirmation: errors.passwordConfirmation?.[0],
      },
    };
  }
  try {
    const client = await clientFactory();
    const { data, error } = await client.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    // No devolver user/identities: Supabase puede ofuscarlos para cuentas existentes.
    if (error) {
      if (error.code === "user_already_exists" || error.code === "email_exists")
        return { message: pendingMessage, submitted: true };
      return {
        message:
          error.status === 429
            ? "No se ha podido procesar el registro ahora. Espera antes de volver a intentarlo."
            : "No se ha podido completar el registro. Comprueba los campos e inténtalo más tarde.",
      };
    }
    if (data.session)
      return {
        message:
          "El registro no está disponible en este momento. Inténtalo más tarde.",
      };
    return { message: pendingMessage, submitted: true };
  } catch {
    return { message: "El servicio de registro no está disponible. Inténtalo más tarde." };
  }
}

export async function confirmEmail(
  params: URLSearchParams,
  clientFactory: ClientFactory,
): Promise<"/login" | "/registro?confirmacion=invalida" | "/registro?confirmacion=no-disponible"> {
  const invalid = "/registro?confirmacion=invalida";
  if (params.getAll("token_hash").length !== 1 || params.getAll("type").length !== 1)
    return invalid;
  const parsed = confirmationSchema.safeParse({
    token_hash: params.get("token_hash"),
    type: params.get("type"),
  });
  if (!parsed.success) return invalid;
  try {
    const client = await clientFactory();
    const { data, error } = await client.auth.verifyOtp(parsed.data);
    if (error)
      return error.status && [400, 401, 403, 422].includes(error.status)
        ? invalid
        : "/registro?confirmacion=no-disponible";
    return data.session?.access_token ? "/login" : invalid;
  } catch {
    return "/registro?confirmacion=no-disponible";
  }
}
