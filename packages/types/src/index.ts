export interface GameSummary {
  slug: string;
  title: string;
  subtitle: string;
  era: string;
  setting: string;
  number: string;
  tone: "amber" | "sage" | "blue" | "rust";
}

export interface GameDetail extends GameSummary {
  summary: string;
  description: string;
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

// Contratos JSON de Auth; no exponen modelos Prisma ni fechas Date al frontend.
export type UserRole = "USER" | "ADMIN" | "EDITOR" | "MODERATOR";

export interface UserProfileResponse {
  id: string;
  supabaseUserId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCheckResponse {
  message: string;
}
