import type { GameSummary, WikiArticleSummary, WikiCategorySummary } from "@repo/types";
import Link from "next/link";

export function GameCard({ game }: { game: GameSummary }) {
  return (
    <li className="game-card card-surface relative min-h-52 overflow-hidden p-5" data-tone={game.tone}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-5 size-36 rounded-full border border-phosphor/10 before:absolute before:inset-4 before:rounded-full before:border before:border-phosphor/10 after:absolute after:inset-9 after:rounded-full after:border after:border-phosphor/10" />
      <div className="relative flex h-full min-h-40 flex-col justify-between">
        <div className="flex items-center justify-between font-terminal text-[0.6rem] tracking-widest text-muted"><span>SECTOR {game.number}</span><span className="text-[color:var(--game-accent)]">{game.era}</span></div>
        <div><p className="font-terminal text-[0.65rem] tracking-[0.13em] text-muted">{game.subtitle}</p><h3 className="mt-2 max-w-48 text-xl font-medium leading-tight tracking-[-0.03em] text-paper"><Link className="text-link inline-block py-1" href={`/juegos/${game.slug}`}>{game.title}</Link></h3><p className="mt-3 flex items-center justify-between border-t border-line pt-3 font-terminal text-[0.6rem] tracking-wide text-muted"><span>{game.setting}</span><span aria-hidden="true" className="text-phosphor">↗</span></p></div>
      </div>
    </li>
  );
}

export function CategoryRow({ category }: { category: WikiCategorySummary }) {
  return (
    <li className="border-b border-line">
      <Link className="group flex min-h-[5.25rem] items-center gap-4 py-4 sm:gap-6" href={`/wiki?categoria=${category.slug}`}>
        <span className="font-terminal text-xs text-phosphor/70">{category.index}</span>
        <span className="min-w-0 flex-1"><span className="block text-base font-medium text-paper transition-colors group-hover:text-phosphor">{category.title}</span><span className="mt-1 block text-xs leading-5 text-muted">{category.description}</span></span>
        <span className="hidden font-terminal text-[0.58rem] tracking-wide text-muted sm:block">{category.countLabel}</span>
      </Link>
    </li>
  );
}

export function ArticleCard({ article }: { article: WikiArticleSummary }) {
  return (
    <li className="article-card card-surface flex min-h-64 flex-col p-5 sm:p-6">
      <div className="flex items-center justify-between font-terminal text-[0.6rem] tracking-widest text-muted"><span>{article.index}</span><span>{article.readTime.toUpperCase()} DE LECTURA</span></div>
      <div className="mt-8 flex-1"><p className="font-terminal text-[0.62rem] tracking-widest text-phosphor">{article.category.toUpperCase()} <span className="text-muted">/ {article.game.toUpperCase()}</span></p><h3 className="mt-3 text-xl font-medium tracking-[-0.025em] text-paper"><Link className="text-link inline-block py-1" href={`/wiki/${article.slug}`}>{article.title}</Link></h3><p className="mt-3 text-sm leading-6 text-muted">{article.summary}</p></div>
      <p className="mt-6 border-t border-line pt-4 font-terminal text-[0.6rem] tracking-wide text-muted">CONTENIDO DE MUESTRA</p>
    </li>
  );
}
