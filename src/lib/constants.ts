import { League } from "./types";

export const LEAGUES: League[] = [
  { code: "PL", id: 39, name: "Premier League", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "PD", id: 140, name: "La Liga", country: "Spain", flag: "🇪🇸" },
  { code: "SA", id: 135, name: "Serie A", country: "Italy", flag: "🇮🇹" },
  { code: "BL1", id: 78, name: "Bundesliga", country: "Germany", flag: "🇩🇪" },
  { code: "FL1", id: 61, name: "Ligue 1", country: "France", flag: "🇫🇷" },
];

export const LEAGUE_IDS = LEAGUES.map((l) => l.id);

export function getLeagueId(code: string): number | undefined {
  return LEAGUES.find((l) => l.code === code)?.id;
}

export function getLeagueCode(leagueId: number): string | undefined {
  return LEAGUES.find((l) => l.id === leagueId)?.code;
}

/** European season starts July/August — derive starting year */
export function getCurrentSeason(): number {
  const now = new Date();
  const month = now.getMonth() + 1;
  return month >= 7 ? now.getFullYear() : now.getFullYear() - 1;
}

export const CURRENT_SEASON = getCurrentSeason();
