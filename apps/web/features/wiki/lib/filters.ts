import type { WikiArticleFilters } from "@repo/types";

export type WikiSearchParams = Record<string, string | string[] | undefined>;

interface FilterOption {
  slug: string;
  title: string;
}

export interface WikiFilterOptions {
  games: readonly FilterOption[];
  categories: readonly FilterOption[];
}

export const WIKI_QUERY_MAX_LENGTH = 200;

export function normalizeWikiSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim().replace(/\s+/g, " ");
}

export function parseWikiFilters(params: WikiSearchParams, options: WikiFilterOptions): WikiArticleFilters {
  const firstValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] ?? "" : value ?? "").trim();
  const gameSlug = firstValue(params.juego);
  const categorySlug = firstValue(params.categoria);

  return {
    query: firstValue(params.q).slice(0, WIKI_QUERY_MAX_LENGTH),
    gameSlug: options.games.some((game) => game.slug === gameSlug) ? gameSlug : "",
    categorySlug: options.categories.some((category) => category.slug === categorySlug) ? categorySlug : "",
  };
}
