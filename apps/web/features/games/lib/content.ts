import type { GameDetail, GameSummary } from "@repo/types";
import { games } from "@/lib/mocks/public-content";
import { gameContent } from "@/lib/mocks/game-content";

export function listGames(): readonly GameSummary[] {
  return games;
}

export function getGame(slug: string): GameDetail | undefined {
  const summary = games.find((game) => game.slug === slug);
  const content = gameContent.find((game) => game.slug === slug);

  if (!summary || !content) return undefined;

  return { ...summary, ...content };
}
