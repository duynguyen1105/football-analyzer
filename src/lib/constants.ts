import { League } from "./types";

// API-Football league logo URL pattern
const leagueLogo = (id: number) => `https://media.api-sports.io/football/leagues/${id}.png`;

export const LEAGUES: League[] = [
  { code: "PL", id: 39, name: "Premier League", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: leagueLogo(39) },
  { code: "PD", id: 140, name: "La Liga", country: "Spain", flag: "🇪🇸", logo: leagueLogo(140) },
  { code: "SA", id: 135, name: "Serie A", country: "Italy", flag: "🇮🇹", logo: leagueLogo(135) },
  { code: "BL1", id: 78, name: "Bundesliga", country: "Germany", flag: "🇩🇪", logo: leagueLogo(78) },
  { code: "FL1", id: 61, name: "Ligue 1", country: "France", flag: "🇫🇷", logo: leagueLogo(61) },
  { code: "VL", id: 340, name: "V-League", country: "Vietnam", flag: "🇻🇳", logo: leagueLogo(340) },
  { code: "CL", id: 2, name: "Champions League", country: "Europe", flag: "🇪🇺", logo: leagueLogo(2), isTournament: true },
  { code: "WC", id: 1, name: "World Cup", country: "World", flag: "🌍", logo: leagueLogo(1), isTournament: true },
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

/** Detect if a match round is a knockout/playoff stage (not group stage or league play) */
const KNOCKOUT_ROUND_PATTERNS = [
  "round of 16",
  "8th finals",
  "quarter",
  "semi",
  "final",
  "playoff",
  "knock",
  "elimination",
  "last 16",
  "last 8",
  "round of 32",
  "2nd qualifying",
  "3rd qualifying",
  "play-off",
];

export function isKnockoutRound(round?: string): boolean {
  if (!round) return false;
  const lower = round.toLowerCase();
  if (lower.startsWith("group")) return false;
  if (lower.includes("regular season")) return false;
  return KNOCKOUT_ROUND_PATTERNS.some((p) => lower.includes(p));
}

/** Detect if this is a 2nd leg of a two-legged tie */
export function isSecondLeg(round?: string): boolean {
  if (!round) return false;
  const lower = round.toLowerCase();
  return lower.includes("2nd leg") || lower.includes("second leg") || lower.includes("leg 2");
}

/** Get the corresponding round name for the 1st leg */
export function getFirstLegRound(round: string): string {
  return round
    .replace(/2nd Leg/i, "1st Leg")
    .replace(/Second Leg/i, "First Leg")
    .replace(/Leg 2/i, "Leg 1");
}

export function isTournamentLeague(code: string): boolean {
  return LEAGUES.find((l) => l.code === code)?.isTournament === true;
}

/** Calendar-year leagues (V-League, World Cup) use the current year as season */
const CALENDAR_YEAR_LEAGUE_IDS = new Set([340, 1]); // V-League, World Cup

export function getSeasonForLeague(leagueId: number): number {
  if (CALENDAR_YEAR_LEAGUE_IDS.has(leagueId)) {
    return new Date().getFullYear();
  }
  return CURRENT_SEASON;
}
