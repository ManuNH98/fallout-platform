"use client";

import Link from "next/link";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { ContentState } from "@/components/public/content-state";

export default function GamesError({ reset }: { reset: () => void }) {
  return (
    <main className="shell-width pb-8 pt-6 sm:pt-10" id="contenido">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Juegos" }]} />
      <h1 className="my-8 text-4xl font-medium tracking-tight text-paper sm:my-10">Juegos de Fallout</h1>
      <ContentState title="No se han podido cargar los juegos" description="Se ha interrumpido la señal. Inténtalo de nuevo o vuelve al inicio para seguir explorando.">
        <button className="min-h-11 border border-phosphor bg-phosphor px-5 text-sm font-medium text-void transition-colors hover:bg-transparent hover:text-phosphor" onClick={reset} type="button">Volver a intentarlo</button>
        <Link className="text-link inline-flex min-h-11 items-center px-2 text-sm text-paper" href="/">Volver al inicio</Link>
      </ContentState>
    </main>
  );
}
