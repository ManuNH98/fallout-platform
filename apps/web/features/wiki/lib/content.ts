import type { WikiArticleDetail, WikiArticleFilters, WikiArticleSummary } from "@repo/types";
import { games, wikiArticles, wikiCategories } from "@/lib/mocks/public-content";
import { wikiArticleContent, wikiSources } from "@/lib/mocks/wiki-content";
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
    games: games.map((game) => ({ slug: game.slug, title: game.subtitle })),
    categories: wikiCategories.map((category) => ({ slug: category.slug, title: category.title })),
  };
}

export function getWikiArticle(slug: string): WikiArticleDetail | undefined {
  const summary = wikiArticles.find((article) => article.slug === slug);
  const content = wikiArticleContent.find((article) => article.slug === slug);

  if (!summary || !content) return undefined;

  return {
    ...summary,
    bodyMarkdown: content.bodyMarkdown,
    sources: wikiSources.filter((source) => content.sourceIds.includes(source.id)),
    relatedArticles: wikiArticles.filter((article) => article.slug !== slug && content.relatedSlugs.includes(article.slug)),
  };
}
