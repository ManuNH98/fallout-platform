import type { Metadata } from "next";
import Link from "next/link";
import {
  ContinueForm,
  LoginForm,
  LogoutForm,
} from "@/features/auth/components/auth-forms";
import { loadLoginView } from "@/features/auth/core";
import { authDependencies } from "@/features/auth/server";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta de Refugio.",
};
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ perfil?: string }>;
}) {
  const [view, query] = await Promise.all([
    loadLoginView(authDependencies(false)),
    searchParams,
  ]);
  const pendingProfile = query.perfil === "pendiente";
  return (
    <section aria-labelledby="login-title" className="mx-auto max-w-md">
      <div className="mb-8 space-y-3">
        <p className="eyebrow">Acceso al refugio</p>
        <h1
          className="text-3xl font-semibold tracking-tight text-paper sm:text-4xl"
          id="login-title"
        >
          {view.kind === "authenticated" ? "Tu sesión" : "Iniciar sesión"}
        </h1>
        <p className="text-sm leading-7 text-muted">
          {view.kind === "authenticated"
            ? "Gestiona tu sesión para seguir explorando el Yermo."
            : "Identifícate para acceder a tu cuenta de Refugio."}
        </p>
      </div>
      <div className="card-surface corner-brackets p-6 sm:p-8">
        {view.kind === "anonymous" && <LoginForm />}
        {view.kind === "unavailable" && (
          <div className="space-y-5">
            <p role="status" className="text-sm text-rust">
              No se ha podido comprobar la sesión. Inténtalo de nuevo en unos
              momentos.
            </p>
            <Link
              className="text-link inline-flex min-h-11 items-center text-sm text-phosphor"
              href="/login"
            >
              Volver a intentarlo
            </Link>
            <LogoutForm />
          </div>
        )}
        {view.kind === "authenticated" && (
          <div className="space-y-6">
            {view.profile && !pendingProfile ? (
              <div className="space-y-3">
                <p className="text-lg text-paper">
                  {view.profile.displayName ?? "Bienvenido a Refugio."}
                </p>
                <p role="status" className="text-sm text-muted">
                  Tu sesión está iniciada y tu perfil está preparado.
                </p>
                <Link
                  className="text-link inline-flex min-h-11 items-center text-sm text-phosphor"
                  href="/"
                >
                  Explorar el archivo →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p role="status" className="text-sm text-muted">
                  {view.profileUnavailable || pendingProfile
                    ? "La sesión está iniciada, pero no hemos podido preparar tu perfil. Puedes reintentar o cerrar la sesión."
                    : "Tu sesión está verificada. Continúa para preparar tu perfil."}
                </p>
                <ContinueForm />
              </div>
            )}
            <LogoutForm />
          </div>
        )}
      </div>
      <p className="mt-6 text-center text-xs leading-6 text-muted">
        Tu contraseña no se comparte con la API de Refugio.
      </p>
    </section>
  );
}
