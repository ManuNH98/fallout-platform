import Link from "next/link";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { ContentState } from "@/components/public/content-state";

export default function GameNotFound() {
  return (
    <main className="shell-width pb-8 pt-6 sm:pt-10" id="contenido">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Juegos", href: "/juegos" }, { label: "Juego no encontrado" }]} />
      <h1 className="my-8 text-4xl font-medium tracking-tight text-paper sm:my-10">Juego no encontrado</h1>
      <ContentState title="Este juego no está en el archivo" description="No hemos encontrado el juego que buscas. Vuelve al listado para descubrir los mundos disponibles.">
        <Link className="text-link inline-flex min-h-11 items-center text-sm text-phosphor" href="/juegos">Volver a los juegos</Link>
      </ContentState>
    </main>
  );
}
