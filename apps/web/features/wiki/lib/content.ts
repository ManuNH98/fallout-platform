import type { WikiArticleSummary } from "@repo/types";
import { wikiArticles } from "@/lib/mocks/public-content";

export function listWikiArticles(): readonly WikiArticleSummary[] {
  return wikiArticles;
}
