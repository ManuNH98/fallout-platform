import type { GameSummary } from "@repo/types";
import { games } from "@/lib/mocks/public-content";

export function listGames(): readonly GameSummary[] {
  return games;
}
