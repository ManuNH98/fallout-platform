import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { ArticleCard } from "@/components/public/content-cards";
import { WikiMarkdown } from "@/features/wiki/components/wiki-markdown";
import { getWikiArticle, getWikiFilterOptions, listWikiArticles } from "@/features/wiki/lib/content";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listWikiArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = getWikiArticle((await params).slug);
  if (!article) notFound();

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: `${article.title} | Refugio`,
      description: article.summary,
      type: "article",
      locale: "es_ES",
    },
  };
}

export default async function WikiArticlePage({ params }: ArticlePageProps) {
  const article = getWikiArticle((await params).slug);
  if (!article) notFound();

  const options = getWikiFilterOptions();
  const games = options.games.filter((game) => article.gameSlugs.includes(game.slug));
  const categories = options.categories.filter((category) => article.categorySlugs.includes(category.slug));

  return (
    <main className="shell-width pb-8 pt-6 sm:pt-10" id="contenido">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Wiki", href: "/wiki" }, { label: article.title }]} />
      <article>
        <header className="max-w-4xl pb-10 pt-8 sm:pb-12 sm:pt-10">
          <p className="eyebrow">{article.index} / {article.category}</p>
          <h1 className="mt-4 break-words text-4xl font-medium leading-tight tracking-[-0.045em] text-paper sm:text-5xl">{article.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{article.summary}</p>
          <p className="mt-6 font-terminal text-xs tracking-wide text-phosphor">CONTENIDO DE MUESTRA</p>
        </header>
        <div className="section-rule grid gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16 lg:pt-10">
          <div className="min-w-0 max-w-3xl">
            <WikiMarkdown body={article.bodyMarkdown} />
            <section aria-labelledby="sources-title" className="section-rule mt-10 pt-8">
              <h2 className="text-2xl font-medium tracking-tight text-paper" id="sources-title">Fuentes</h2>
              <p className="mt-3 text-sm leading-7 text-muted">Referencias dentro de los juegos para consultar el contexto de esta ficha de muestra.</p>
              <ol className="mt-5 list-decimal space-y-4 pl-5 text-sm leading-7 text-muted">
                {article.sources.map((source) => <li key={source.id}><cite className="font-medium not-italic text-paper">{source.title}</cite><p>{source.reference}</p></li>)}
              </ol>
            </section>
          </div>
          <aside aria-label="Explorar el archivo" className="card-surface h-fit p-5 sm:p-6">
            <h2 className="text-lg font-medium text-paper">Explorar por juego</h2>
            <ul className="m-0 mt-3 list-none p-0">
              {games.map((game) => <li key={game.slug}><Link className="text-link inline-flex min-h-11 items-center py-2 text-sm text-phosphor" href={`/wiki?juego=${game.slug}`}>{game.title}</Link></li>)}
            </ul>
            <h2 className="mt-6 border-t border-line pt-6 text-lg font-medium text-paper">Categorías</h2>
            <ul className="m-0 mt-3 list-none p-0">
              {categories.map((category) => <li key={category.slug}><Link className="text-link inline-flex min-h-11 items-center py-2 text-sm text-phosphor" href={`/wiki?categoria=${category.slug}`}>{category.title}</Link></li>)}
            </ul>
          </aside>
        </div>
      </article>
      {article.relatedArticles.length > 0 && (
        <section aria-labelledby="related-title" className="section-rule mt-12 pt-8 sm:mt-16">
          <h2 className="mb-6 text-2xl font-medium tracking-tight text-paper" id="related-title">Artículos relacionados</h2>
          <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
            {article.relatedArticles.map((related) => <ArticleCard article={related} key={related.slug} />)}
          </ul>
        </section>
      )}
      <Link className="text-link mt-8 inline-flex min-h-11 items-center gap-2 text-sm text-phosphor" href="/wiki"><span aria-hidden="true">←</span> Volver a la wiki</Link>
    </main>
  );
}
