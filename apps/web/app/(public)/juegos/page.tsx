import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { GameCard } from "@/components/public/content-cards";
import { ContentState } from "@/components/public/content-state";
import { listGames } from "@/features/games/lib/content";

export const metadata: Metadata = {
  title: "Juegos de Fallout",
  description: "Descubre los escenarios de Fallout en español: del Mojave a Appalachia, pasando por el Commonwealth y el Yermo Capital. Explora nuestra selección de juegos.",
};

export default function GamesPage() {
  const games = listGames();

  return (
    <main className="shell-width pb-8 pt-6 sm:pt-10" id="contenido">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Juegos" }]} />
      <header className="pb-10 pt-8 sm:pb-12 sm:pt-10">
        <p className="eyebrow">ARCHIVO DEL YERMO / JUEGOS</p>
        <h1 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.045em] text-paper sm:text-5xl">Juegos de Fallout</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted">Del Mojave a Appalachia, cada juego abre una ventana distinta al Yermo. Conoce sus escenarios y el lugar que ocupan en la historia de Fallout.</p>
      </header>
      <section aria-labelledby="games-title" className="section-rule pt-6 sm:pt-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-medium tracking-tight text-paper" id="games-title">Mundos del archivo</h2>
          <p className="font-terminal text-xs tracking-wide text-muted">{games.length} {games.length === 1 ? "juego de muestra" : "juegos de muestra"}</p>
        </div>
        {games.length > 0 ? (
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {games.map((game) => <GameCard game={game} key={game.slug} />)}
          </ul>
        ) : (
          <ContentState title="Todavía no hay juegos en el archivo" description="Aún no hay juegos disponibles. Puedes volver al inicio y seguir explorando las historias del Yermo.">
            <Link className="text-link inline-flex min-h-11 items-center text-sm text-phosphor" href="/">Volver al inicio</Link>
          </ContentState>
        )}
      </section>
    </main>
  );
}
