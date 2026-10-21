import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { ArticleCard } from "@/components/public/content-cards";
import { ContentState } from "@/components/public/content-state";
import { WikiFilters } from "@/features/wiki/components/wiki-filters";
import { getWikiFilterOptions, listWikiArticles } from "@/features/wiki/lib/content";
import { parseWikiFilters, type WikiSearchParams } from "@/features/wiki/lib/filters";

export const metadata: Metadata = {
  title: "Wiki de Fallout",
  description: "Explora el archivo de Fallout en español: personajes, facciones y lugares del Yermo. Un primer recorrido por nuestros artículos de muestra.",
};

export default async function WikiPage({ searchParams }: { searchParams: Promise<WikiSearchParams> }) {
  const options = getWikiFilterOptions();
  const filters = parseWikiFilters(await searchParams, options);
  const articles = listWikiArticles(filters);
  const total = listWikiArticles().length;
  const hasFilters = Boolean(filters.query || filters.gameSlug || filters.categorySlug);

  return (
    <main className="shell-width pb-8 pt-6 sm:pt-10" id="contenido">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Wiki" }]} />
      <header className="pb-10 pt-8 sm:pb-12 sm:pt-10">
        <p className="eyebrow">ARCHIVO DEL YERMO / WIKI</p>
        <h1 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.045em] text-paper sm:text-5xl">Wiki de Fallout</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted">Personajes, facciones y lugares que dan forma al Yermo. Recorre los primeros registros de nuestro archivo en español.</p>
      </header>
      <WikiFilters filters={filters} key={JSON.stringify(filters)} options={options} />
      <section aria-labelledby="articles-title" className="section-rule pt-6 sm:pt-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-medium tracking-tight text-paper" id="articles-title">Artículos del archivo</h2>
          <p className="font-terminal text-xs tracking-wide text-muted">{articles.length} de {total} artículos de muestra</p>
        </div>
        {articles.length > 0 ? (
          <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => <ArticleCard article={article} key={article.slug} />)}
          </ul>
        ) : (
          <ContentState title={hasFilters ? "No se han encontrado artículos" : "El archivo todavía está vacío"} description={hasFilters ? "Prueba con otras palabras o cambia los filtros para explorar más registros del Yermo." : "Aún no hay artículos disponibles. Puedes volver al inicio y seguir explorando los juegos del Yermo."}>
            <Link className="text-link inline-flex min-h-11 items-center text-sm text-phosphor" href={hasFilters ? "/wiki" : "/"}>{hasFilters ? "Limpiar filtros" : "Volver al inicio"}</Link>
          </ContentState>
        )}
      </section>
    </main>
  );
}
