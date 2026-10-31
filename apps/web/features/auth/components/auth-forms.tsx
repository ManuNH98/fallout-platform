"use client";

import Link from "next/link";
import { useActionState } from "react";
import { continueAction, loginAction, logoutAction } from "../actions";
import type { AuthActionState } from "../types";

const initial: AuthActionState = {};
const button =
  "inline-flex min-h-12 w-full items-center justify-center border border-phosphor bg-phosphor px-5 font-terminal text-sm font-semibold text-void transition-colors hover:bg-paper focus-visible:outline-phosphor disabled:cursor-wait disabled:opacity-60";
const input =
  "min-h-12 w-full border border-line bg-void px-3 text-paper outline-none focus:border-phosphor focus:ring-1 focus:ring-phosphor disabled:opacity-60";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} aria-busy={pending} className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm text-paper" htmlFor="email">
          Correo electrónico
        </label>
        <input
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          className={input}
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          disabled={pending}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email ? "email-error" : undefined
          }
        />
        {state.fieldErrors?.email && (
          <p className="text-sm text-rust" id="email-error">
            {state.fieldErrors.email}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label className="block text-sm text-paper" htmlFor="password">
          Contraseña
        </label>
        <input
          autoComplete="current-password"
          className={input}
          id="password"
          name="password"
          type="password"
          required
          maxLength={4096}
          disabled={pending}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
        />
        {state.fieldErrors?.password && (
          <p className="text-sm text-rust" id="password-error">
            {state.fieldErrors.password}
          </p>
        )}
      </div>
      <p aria-live="polite" role="status" className="text-sm text-rust">
        {state.message}
      </p>
      <button className={button} disabled={pending} type="submit">
        {pending ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>
      <p className="text-center text-sm text-muted">¿Aún no tienes cuenta? <Link href="/registro" className="text-link inline-flex min-h-11 items-center text-phosphor">Crear cuenta</Link></p>
    </form>
  );
}

export function ContinueForm() {
  const [state, action, pending] = useActionState(continueAction, initial);
  return (
    <form action={action} aria-busy={pending} className="space-y-3">
      <button className={button} disabled={pending} type="submit">
        {pending ? "Preparando tu perfil…" : "Continuar con mi sesión"}
      </button>
      <p aria-live="polite" role="status" className="text-sm text-rust">
        {state.message}
      </p>
    </form>
  );
}
export function LogoutForm() {
  const [state, action, pending] = useActionState(logoutAction, initial);
  return (
    <form action={action} aria-busy={pending} className="space-y-3">
      <button
        className="inline-flex min-h-11 w-full items-center justify-center border border-line px-4 text-sm text-paper transition-colors hover:border-phosphor disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Cerrando sesión…" : "Cerrar sesión en este navegador"}
      </button>
      <p aria-live="polite" role="status" className="text-sm text-rust">
        {state.message}
      </p>
    </form>
  );
}
