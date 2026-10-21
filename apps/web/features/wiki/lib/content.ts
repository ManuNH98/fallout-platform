import type { WikiArticleFilters, WikiArticleSummary } from "@repo/types";
import { featuredGames, wikiArticles, wikiCategories } from "@/lib/mocks/public-content";
import { normalizeWikiSearch } from "./filters";

export function listWikiArticles(filters: Partial<WikiArticleFilters> = {}): readonly WikiArticleSummary[] {
  const query = normalizeWikiSearch(filters.query ?? "");

  return wikiArticles.filter((article) => (
    (!query || normalizeWikiSearch(`${article.title} ${article.summary}`).includes(query))
    && (!filters.gameSlug || article.gameSlugs.includes(filters.gameSlug))
    && (!filters.categorySlug || article.categorySlugs.includes(filters.categorySlug))
  ));
}

export function getWikiFilterOptions() {
  return {
    games: featuredGames.map((game) => ({ slug: game.slug, title: game.subtitle })),
    categories: wikiCategories.map((category) => ({ slug: category.slug, title: category.title })),
  };
}
