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

export const registrationSchema = z
  .object({
    email: loginSchema.shape.email,
    password: loginSchema.shape.password.min(
      8,
      "Usa una contraseña de al menos 8 caracteres.",
    ),
    passwordConfirmation: z
      .string({ error: "Repite tu contraseña." })
      .max(4096, "La contraseña es demasiado larga."),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Las contraseñas no coinciden.",
  });
export type RegistrationInput = z.infer<typeof registrationSchema>;

export const confirmationSchema = z.object({
  token_hash: z.string().min(20).max(1024).regex(/^[A-Za-z0-9_-]+$/),
  type: z.literal("email"),
});
