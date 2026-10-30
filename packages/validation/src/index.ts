import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ error: "Introduce tu correo electrónico." })
    .trim()
    .min(1, "Introduce tu correo electrónico.")
    .max(254, "El correo es demasiado largo.")
    .email("Introduce un correo electrónico válido."),
  // Login no impone una politica de registro ni modifica espacios de contrasenas existentes.
  password: z
    .string({ error: "Introduce tu contraseña." })
    .min(1, "Introduce tu contraseña.")
    .max(4096, "La contraseña es demasiado larga."),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Contrato de lectura: valida la respuesta privada y elimina campos no previstos.
export const userProfileResponseSchema = z.object({
  id: z.uuid(),
  supabaseUserId: z.uuid(),
  username: z.string().nullable(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  role: z.enum(["USER", "ADMIN", "EDITOR", "MODERATOR"]),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
