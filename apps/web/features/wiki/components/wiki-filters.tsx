import Link from "next/link";
import type { WikiArticleFilters } from "@repo/types";
import { WIKI_QUERY_MAX_LENGTH, type WikiFilterOptions } from "../lib/filters";

interface WikiFiltersProps {
  filters: WikiArticleFilters;
  options: WikiFilterOptions;
}

const controlClassName = "mt-2 min-h-12 w-full min-w-0 border border-line bg-void px-3 text-base text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-phosphor";

export function WikiFilters({ filters, options }: WikiFiltersProps) {
  const activeFilters = [
    filters.query ? `Búsqueda: «${filters.query}»` : "",
    options.games.find((game) => game.slug === filters.gameSlug)?.title,
    options.categories.find((category) => category.slug === filters.categorySlug)?.title,
  ].filter(Boolean);

  return (
    <div className="mb-10">
      <form action="/wiki" aria-label="Buscar y filtrar artículos" className="card-surface p-5 sm:p-6" method="get">
        <div className="grid items-end gap-5 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_auto]">
          <label className="min-w-0 text-sm text-paper" htmlFor="wiki-query">
            Buscar artículos
            <input className={controlClassName} defaultValue={filters.query} id="wiki-query" maxLength={WIKI_QUERY_MAX_LENGTH} name="q" placeholder="Título o resumen" type="search" />
          </label>
          <label className="min-w-0 text-sm text-paper" htmlFor="wiki-game">
            Juego
            <select className={controlClassName} defaultValue={filters.gameSlug} id="wiki-game" name="juego">
              <option value="">Todos los juegos</option>
              {options.games.map((game) => <option key={game.slug} value={game.slug}>{game.title}</option>)}
            </select>
          </label>
          <label className="min-w-0 text-sm text-paper" htmlFor="wiki-category">
            Categoría
            <select className={controlClassName} defaultValue={filters.categorySlug} id="wiki-category" name="categoria">
              <option value="">Todas las categorías</option>
              {options.categories.map((category) => <option key={category.slug} value={category.slug}>{category.title}</option>)}
            </select>
          </label>
          <button className="min-h-12 border border-phosphor bg-phosphor px-5 text-sm font-medium text-void transition-colors hover:bg-transparent hover:text-phosphor" type="submit">Buscar y filtrar</button>
        </div>
      </form>
      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ul aria-label="Filtros aplicados" className="m-0 flex min-w-0 list-none flex-wrap gap-2 p-0">
            {activeFilters.map((label, index) => <li className="max-w-full break-words border border-line bg-panel px-3 py-2 text-sm text-muted" key={index}>{label}</li>)}
          </ul>
          <Link className="text-link inline-flex min-h-11 items-center px-2 text-sm text-phosphor" href="/wiki">Limpiar filtros</Link>
        </div>
      )}
    </div>
  );
}
