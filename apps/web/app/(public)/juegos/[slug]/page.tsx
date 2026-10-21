import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { ArticleCard } from "@/components/public/content-cards";
import { ContentState } from "@/components/public/content-state";
import { getGame, listGames } from "@/features/games/lib/content";
import { listWikiArticles } from "@/features/wiki/lib/content";

type GamePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listGames().map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const game = getGame((await params).slug);
  if (!game) notFound();

  return {
    title: game.subtitle,
    description: game.summary,
    openGraph: {
      title: `${game.subtitle} | Refugio`,
      description: game.summary,
      locale: "es_ES",
      type: "website",
    },
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const game = getGame((await params).slug);
  if (!game) notFound();

  const articles = listWikiArticles({ gameSlug: game.slug });

  return (
    <main className="shell-width pb-8 pt-6 sm:pt-10" id="contenido">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Juegos", href: "/juegos" }, { label: game.subtitle }]} />
      <article>
        <header className="max-w-4xl pb-10 pt-8 sm:pb-12 sm:pt-10">
          <p className="eyebrow">SECTOR {game.number} / {game.title}</p>
          <h1 className="mt-4 break-words text-4xl font-medium leading-tight tracking-[-0.045em] text-paper sm:text-5xl">{game.subtitle}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{game.summary}</p>
          <p className="mt-6 font-terminal text-xs tracking-wide text-phosphor">CONTENIDO DE MUESTRA</p>
        </header>
        <div className="section-rule grid gap-8 pt-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16 lg:pt-10">
          <section aria-labelledby="setting-title" className="max-w-3xl">
            <h2 className="text-2xl font-medium tracking-tight text-paper" id="setting-title">El escenario</h2>
            <p className="mt-5 text-base leading-8 text-muted">{game.description}</p>
          </section>
          <aside aria-labelledby="game-data-title" className="card-surface h-fit p-5 sm:p-6">
            <h2 className="text-lg font-medium text-paper" id="game-data-title">Datos del juego</h2>
            <dl className="mt-4 space-y-5 text-sm">
              <div><dt className="text-muted">Escenario</dt><dd className="mt-1 text-paper">{game.title}</dd></div>
              <div><dt className="text-muted">Localización</dt><dd className="mt-1 text-paper">{game.setting}</dd></div>
              <div><dt className="text-muted">Año de referencia en la historia</dt><dd className="mt-1 font-terminal text-phosphor">{game.era}</dd></div>
            </dl>
          </aside>
        </div>
      </article>
      <section aria-labelledby="articles-title" className="section-rule mt-12 pt-8 sm:mt-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-medium tracking-tight text-paper" id="articles-title">Artículos de este juego</h2>
          <p className="font-terminal text-xs tracking-wide text-muted">{articles.length} {articles.length === 1 ? "artículo de muestra" : "artículos de muestra"}</p>
        </div>
        {articles.length > 0 ? (
          <>
            <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
              {articles.map((article) => <ArticleCard article={article} key={article.slug} />)}
            </ul>
            <Link className="text-link mt-6 inline-flex min-h-11 items-center text-sm text-phosphor" href={`/wiki?juego=${game.slug}`}>Explorar {game.subtitle} en la wiki</Link>
          </>
        ) : (
          <ContentState title="Todavía no hay artículos de este juego" description="El archivo aún no contiene artículos asociados a este juego. Puedes explorar el resto de registros de la wiki.">
            <Link className="text-link inline-flex min-h-11 items-center text-sm text-phosphor" href="/wiki">Explorar la wiki</Link>
          </ContentState>
        )}
      </section>
      <Link className="text-link mt-8 inline-flex min-h-11 items-center gap-2 text-sm text-phosphor" href="/juegos"><span aria-hidden="true">←</span> Volver a los juegos</Link>
    </main>
  );
}
