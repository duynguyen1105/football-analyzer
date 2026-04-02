import { LEAGUES } from "./constants";
import type { League } from "./types";

export const LEAGUE_SLUGS: Record<string, string> = {
  "premier-league": "PL",
  "la-liga": "PD",
  "serie-a": "SA",
  "bundesliga": "BL1",
  "ligue-1": "FL1",
  "v-league": "VL",
  "champions-league": "CL",
  "world-cup": "WC",
};

const SLUG_BY_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(LEAGUE_SLUGS).map(([slug, code]) => [code, slug])
);

export function getLeagueBySlug(slug: string): League | undefined {
  const code = LEAGUE_SLUGS[slug];
  if (!code) return undefined;
  return LEAGUES.find((l) => l.code === code);
}

export function getSlugByCode(code: string): string | undefined {
  return SLUG_BY_CODE[code];
}

export function getAllLeagueSlugs(): string[] {
  return Object.keys(LEAGUE_SLUGS);
}
