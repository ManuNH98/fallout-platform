import type { Metadata } from "next";
import Link from "next/link";
import { RegistrationForm } from "@/features/auth/components/registration-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta de Refugio y confirma tu correo electrónico.",
};
export const dynamic = "force-dynamic";

export default async function RegistrationPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmacion?: string }>;
}) {
  const { confirmacion } = await searchParams;
  const invalid = confirmacion === "invalida";
  const unavailable = confirmacion === "no-disponible";
  return (
    <section aria-labelledby="registration-title" className="mx-auto max-w-md">
      <div className="mb-8 space-y-3">
        <p className="eyebrow">Acceso al refugio</p>
        <h1 id="registration-title" className="text-3xl font-semibold tracking-tight text-paper sm:text-4xl">Crear cuenta</h1>
        <p className="text-sm leading-7 text-muted">Confirma tu correo electrónico antes de iniciar sesión.</p>
      </div>
      <div className="card-surface corner-brackets space-y-6 p-6 sm:p-8">
        {(invalid || unavailable) && (
          <p role="alert" className="text-sm leading-7 text-rust">
            {invalid
              ? "No se ha podido confirmar el correo. El enlace puede ser incorrecto, haber caducado o haberse usado. Si ya confirmaste tu cuenta, inicia sesión."
              : "El servicio de confirmación no está disponible. Inténtalo más tarde abriendo de nuevo el enlace de tu correo."}
          </p>
        )}
        {invalid || unavailable ? <Link className="text-link inline-flex min-h-11 items-center text-sm text-phosphor" href="/registro">Volver al registro</Link> : <RegistrationForm />}
      </div>
      <p className="mt-6 text-center text-sm text-muted">¿Ya tienes cuenta? <Link href="/login" className="text-link inline-flex min-h-11 items-center text-phosphor">Iniciar sesión</Link></p>
    </section>
  );
}
