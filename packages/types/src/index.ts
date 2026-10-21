export interface GameSummary {
  slug: string;
  title: string;
  subtitle: string;
  era: string;
  setting: string;
  number: string;
  tone: "amber" | "sage" | "blue" | "rust";
}

export interface WikiCategorySummary {
  slug: string;
  title: string;
  description: string;
  countLabel: string;
  index: string;
}

export interface WikiArticleSummary {
  slug: string;
  title: string;
  summary: string;
  category: string;
  game: string;
  gameSlugs: readonly string[];
  categorySlugs: readonly string[];
  readTime: string;
  index: string;
}

export interface WikiArticleFilters {
  query: string;
  gameSlug: string;
  categorySlug: string;
}

export interface WikiSourceSummary {
  id: string;
  title: string;
  reference: string;
}

export interface WikiArticleDetail extends WikiArticleSummary {
  bodyMarkdown: string;
  sources: readonly WikiSourceSummary[];
  relatedArticles: readonly WikiArticleSummary[];
}
