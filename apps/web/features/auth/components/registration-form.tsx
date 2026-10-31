"use client";

import { useActionState } from "react";
import { registerAction } from "../actions";
import type { AuthActionState } from "../types";

const initial: AuthActionState = {};
const fields = [
  { name: "email", label: "Correo electrónico", type: "email", autoComplete: "email", maxLength: 254 },
  { name: "password", label: "Contraseña", type: "password", autoComplete: "new-password", maxLength: 4096 },
  { name: "passwordConfirmation", label: "Repite la contraseña", type: "password", autoComplete: "new-password", maxLength: 4096 },
] as const;

export function RegistrationForm() {
  const [state, action, pending] = useActionState(registerAction, initial);
  if (state.submitted)
    return <p role="status" className="text-sm leading-7 text-paper">{state.message}</p>;
  return (
    <form action={action} aria-busy={pending} className="space-y-5">
      {fields.map((field) => (
        <div className="space-y-2" key={field.name}>
          <label className="block text-sm text-paper" htmlFor={field.name}>{field.label}</label>
          <input
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            maxLength={field.maxLength}
            id={field.name}
            required
            minLength={field.type === "password" ? 8 : undefined}
            autoCapitalize="none"
            spellCheck={false}
            disabled={pending}
            className="min-h-12 w-full border border-line bg-void px-3 text-paper outline-none focus:border-phosphor focus:ring-1 focus:ring-phosphor disabled:opacity-60"
            aria-invalid={Boolean(state.fieldErrors?.[field.name])}
            aria-describedby={[
              field.name === "password" ? "password-help" : "",
              state.fieldErrors?.[field.name] ? `${field.name}-error` : "",
            ].filter(Boolean).join(" ") || undefined}
          />
          {field.name === "password" && <p id="password-help" className="text-xs text-muted">Usa al menos 8 caracteres. No reutilices tu contraseña de otros servicios.</p>}
          {state.fieldErrors?.[field.name] && <p id={`${field.name}-error`} className="text-sm text-rust">{state.fieldErrors[field.name]}</p>}
        </div>
      ))}
      <p aria-live="polite" role="status" className="text-sm text-rust">{state.message}</p>
      <button disabled={pending} type="submit" className="inline-flex min-h-12 w-full items-center justify-center border border-phosphor bg-phosphor px-5 font-terminal text-sm font-semibold text-void transition-colors hover:bg-paper focus-visible:outline-phosphor disabled:cursor-wait disabled:opacity-60">
        {pending ? "Procesando registro…" : "Crear cuenta"}
      </button>
    </form>
  );
}
