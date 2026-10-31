import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="shell-width flex min-h-20 items-center justify-between gap-4">
          <Link
            className="font-terminal text-sm font-semibold tracking-[0.2em] text-phosphor"
            href="/"
            aria-label="Refugio, inicio"
          >
            REFUGIO
          </Link>
          <Link
            className="text-link inline-flex min-h-11 items-center text-sm text-muted"
            href="/"
          >
            Volver al archivo
          </Link>
        </div>
      </header>
      <main id="contenido" className="shell-width py-12 sm:py-20">
        {children}
      </main>
    </div>
  );
}
