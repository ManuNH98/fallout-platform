import Link from "next/link";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { ContentState } from "@/components/public/content-state";

export default function WikiNotFound() {
  return (
    <main className="shell-width pb-8 pt-6 sm:pt-10" id="contenido">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Wiki", href: "/wiki" }, { label: "Artículo no encontrado" }]} />
      <h1 className="my-8 text-4xl font-medium tracking-tight text-paper sm:my-10">Artículo no encontrado</h1>
      <ContentState title="Este registro no está en el archivo" description="No hemos encontrado el artículo que buscas. Vuelve al listado para explorar los registros disponibles.">
        <Link className="text-link inline-flex min-h-11 items-center text-sm text-phosphor" href="/wiki">Volver a la wiki</Link>
      </ContentState>
    </main>
  );
}
