import { League } from "./types";

// API-Football league logo URL pattern
const leagueLogo = (id: number) => `https://media.api-sports.io/football/leagues/${id}.png`;

export const LEAGUES: League[] = [
  { code: "PL", id: 39, name: "Premier League", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: leagueLogo(39) },
  { code: "PD", id: 140, name: "La Liga", country: "Spain", flag: "🇪🇸", logo: leagueLogo(140) },
  { code: "SA", id: 135, name: "Serie A", country: "Italy", flag: "🇮🇹", logo: leagueLogo(135) },
  { code: "BL1", id: 78, name: "Bundesliga", country: "Germany", flag: "🇩🇪", logo: leagueLogo(78) },
  { code: "FL1", id: 61, name: "Ligue 1", country: "France", flag: "🇫🇷", logo: leagueLogo(61) },
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
