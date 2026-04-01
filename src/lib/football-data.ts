import { Match, Standing, TeamInfo, H2HMatch } from "./types";
import { COMPETITION_CODES } from "./constants";

const BASE_URL = "https://api.football-data.org/v4";
const GMT_PLUS_7_OFFSET = 7 * 60 * 60 * 1000; // 7 hours in ms

// ---------------------------------------------------------------------------
// In-memory cache — avoids redundant API calls across navigations
// ---------------------------------------------------------------------------
const memCache = new Map<string, { data: unknown; expiresAt: number }>();

function getCached<T>(key: string): T | null {
  const entry = memCache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data as T;
  if (entry) memCache.delete(key);
  return null;
}

function setCache(key: string, data: unknown, ttlMs: number): void {
  memCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

const CACHE_5_MIN = 5 * 60 * 1000;
const CACHE_30_MIN = 30 * 60 * 1000;
const CACHE_2_HR = 2 * 60 * 60 * 1000;
const CACHE_24_HR = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Rate limiter — sliding window (10 requests per 60 seconds)
// ---------------------------------------------------------------------------
const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS = 9; // stay under 10/min limit
const requestTimestamps: number[] = [];

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();

  // Remove timestamps older than the window
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_WINDOW_MS) {
    requestTimestamps.shift();
  }

  // If at capacity, wait until the oldest request falls out of the window
  if (requestTimestamps.length >= MAX_REQUESTS) {
    const waitMs = requestTimestamps[0] + RATE_WINDOW_MS - now + 100;
    await new Promise((r) => setTimeout(r, waitMs));
  }

  requestTimestamps.push(Date.now());
}

// ---------------------------------------------------------------------------
// Generic fetch helper with retry on 429
// ---------------------------------------------------------------------------
async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error("FOOTBALL_DATA_API_KEY environment variable is not set");
  }

  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  // Wait if at rate limit
  await waitForRateLimit();

  const res = await fetch(url.toString(), {
    headers: { "X-Auth-Token": apiKey },
    next: { revalidate: 300 },
  } as RequestInit);

  // Retry once on 429
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 10000));
    const retry = await fetch(url.toString(), {
      headers: { "X-Auth-Token": apiKey },
      next: { revalidate: 300 },
    } as RequestInit);
    if (!retry.ok) {
      const text = await retry.text().catch(() => "");
      throw new Error(`Football-Data API error ${retry.status}: ${text}`);
    }
    return retry.json() as Promise<T>;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Football-Data API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Date helpers — convert UTC ISO string to GMT+7
// ---------------------------------------------------------------------------
function utcToGmt7(utcDateStr: string): Date {
  const utcMs = new Date(utcDateStr).getTime();
  return new Date(utcMs + GMT_PLUS_7_OFFSET);
}

function formatDateGmt7(utcDateStr: string): string {
  const d = utcToGmt7(utcDateStr);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeGmt7(utcDateStr: string): string {
  const d = utcToGmt7(utcDateStr);
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// ---------------------------------------------------------------------------
// Map raw API match to our Match type
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMatch(raw: any): Match {
  return {
    id: raw.id,
    competition: {
      code: raw.competition?.code ?? "",
      name: raw.competition?.name ?? "",
    },
    date: formatDateGmt7(raw.utcDate),
    time: formatTimeGmt7(raw.utcDate),
    status: raw.status ?? "SCHEDULED",
    homeTeam: {
      id: raw.homeTeam?.id ?? 0,
      name: raw.homeTeam?.name ?? "",
      shortName: raw.homeTeam?.shortName ?? "",
      tla: raw.homeTeam?.tla ?? "",
      crest: raw.homeTeam?.crest ?? "",
    },
    awayTeam: {
      id: raw.awayTeam?.id ?? 0,
      name: raw.awayTeam?.name ?? "",
      shortName: raw.awayTeam?.shortName ?? "",
      tla: raw.awayTeam?.tla ?? "",
      crest: raw.awayTeam?.crest ?? "",
    },
    venue: raw.venue ?? "",
    homeForm: [],
    awayForm: [],
    score:
      raw.score?.fullTime?.home != null || raw.score?.fullTime?.away != null
        ? { home: raw.score.fullTime.home, away: raw.score.fullTime.away }
        : undefined,
    referee: (() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ref = (raw.referees ?? []).find((r: any) => r.type === "REFEREE");
      return ref ? { name: ref.name ?? "", nationality: ref.nationality ?? "" } : null;
    })(),
  };
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/**
 * Fetch matches across tracked competitions for a date range.
 * Form arrays are left empty (computed on match detail pages).
 */
export async function getMatches(dateFrom: string, dateTo: string): Promise<Match[]> {
  const cacheKey = `matches:${dateFrom}:${dateTo}`;
  const cached = getCached<Match[]>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any>("/matches", {
      competitions: COMPETITION_CODES,
      dateFrom,
      dateTo,
    });

    const matches: Match[] = (data.matches ?? []).map(mapMatch);
    setCache(cacheKey, matches, CACHE_5_MIN);
    return matches;
  } catch (error) {
    console.error("Failed to fetch matches:", error);
    return [];
  }
}

/**
 * Fetch a single match by ID.
 */
export async function getMatch(matchId: number): Promise<Match | null> {
  const cacheKey = `match:${matchId}`;
  const cached = getCached<Match>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await apiFetch<any>(`/matches/${matchId}`);
    const match = mapMatch(raw);
    setCache(cacheKey, match, CACHE_5_MIN);
    return match;
  } catch (error) {
    console.error(`Failed to fetch match ${matchId}:`, error);
    return null;
  }
}

/**
 * Fetch the TOTAL standings table for a competition.
 */
export async function getStandings(competitionCode: string): Promise<Standing[]> {
  const cacheKey = `standings:${competitionCode}`;
  const cached = getCached<Standing[]>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any>(`/competitions/${competitionCode}/standings`);

    const standingsGroup = (data.standings ?? []).find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => s.type === "TOTAL"
    );

    if (!standingsGroup) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (standingsGroup.table ?? []).map((row: any): Standing => ({
      position: row.position,
      team: {
        id: row.team?.id ?? 0,
        name: row.team?.name ?? "",
        shortName: row.team?.shortName ?? "",
        tla: row.team?.tla ?? "",
        crest: row.team?.crest ?? "",
      },
      playedGames: row.playedGames ?? 0,
      won: row.won ?? 0,
      draw: row.draw ?? 0,
      lost: row.lost ?? 0,
      goalsFor: row.goalsFor ?? 0,
      goalsAgainst: row.goalsAgainst ?? 0,
      goalDifference: row.goalDifference ?? 0,
      points: row.points ?? 0,
    }));
    setCache(cacheKey, result, CACHE_30_MIN);
    return result;
  } catch (error) {
    console.error(`Failed to fetch standings for ${competitionCode}:`, error);
    return [];
  }
}

/**
 * Fetch team info including squad and coach.
 */
export async function getTeamInfo(teamId: number): Promise<TeamInfo | null> {
  const cacheKey = `team:${teamId}`;
  const cached = getCached<TeamInfo>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await apiFetch<any>(`/teams/${teamId}`);

    const result: TeamInfo = {
      id: raw.id,
      name: raw.name ?? "",
      shortName: raw.shortName ?? "",
      tla: raw.tla ?? "",
      crest: raw.crest ?? "",
      venue: raw.venue ?? "",
      coach: raw.coach
        ? { name: raw.coach.name ?? "", nationality: raw.coach.nationality ?? "" }
        : null,
      squad: (raw.squad ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => ({
          id: p.id ?? 0,
          name: p.name ?? "",
          position: p.position ?? "Unknown",
          nationality: p.nationality ?? "",
          dateOfBirth: p.dateOfBirth ?? undefined,
        })
      ),
    };
    setCache(cacheKey, result, CACHE_2_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch team info for ${teamId}:`, error);
    return null;
  }
}

/**
 * Fetch recent finished matches for a team.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getTeamRecentMatches(teamId: number, limit: number): Promise<any[]> {
  const cacheKey = `recent:${teamId}:${limit}`;
  const cached = getCached<any[]>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any>(`/teams/${teamId}/matches`, {
      status: "FINISHED",
      limit: String(limit),
    });
    const result = data.matches ?? [];
    setCache(cacheKey, result, CACHE_30_MIN);
    return result;
  } catch (error) {
    console.error(`Failed to fetch recent matches for team ${teamId}:`, error);
    return [];
  }
}

/**
 * Fetch top scorers for a competition.
 */
export async function getTopScorers(
  competitionCode: string
): Promise<
  { name: string; team: string; goals: number; assists: number | null; nationality: string }[]
> {
  const cacheKey = `scorers:${competitionCode}`;
  const cached = getCached<any[]>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any>(`/competitions/${competitionCode}/scorers`, {
      limit: "10",
    });

    const result = (data.scorers ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => ({
        name: s.player?.name ?? "",
        team: s.team?.name ?? "",
        goals: s.goals ?? 0,
        assists: s.assists ?? null,
        nationality: s.player?.nationality ?? "",
      })
    );
    setCache(cacheKey, result, CACHE_30_MIN);
    return result;
  } catch (error) {
    console.error(`Failed to fetch top scorers for ${competitionCode}:`, error);
    return [];
  }
}

/**
 * Fetch head-to-head data from the official Football-Data.org H2H endpoint.
 * Falls back to computeH2H if the endpoint fails.
 */
export async function getH2H(
  matchId: number
): Promise<{
  homeWins: number;
  draws: number;
  awayWins: number;
  totalGoals: number;
  lastMatches: H2HMatch[];
} | null> {
  const cacheKey = `h2h:${matchId}`;
  const cached = getCached<{
    homeWins: number;
    draws: number;
    awayWins: number;
    totalGoals: number;
    lastMatches: H2HMatch[];
  }>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any>(`/matches/${matchId}/head2head`, {
      limit: "10",
    });

    const agg = data.aggregates;
    const homeWins = agg?.homeTeam?.wins ?? 0;
    const draws = agg?.homeTeam?.draws ?? agg?.awayTeam?.draws ?? 0;
    const awayWins = agg?.awayTeam?.wins ?? 0;
    const totalGoals = agg?.totalGoals ?? 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastMatches: H2HMatch[] = (data.matches ?? []).map((m: any) => ({
      date: formatDateGmt7(m.utcDate),
      home: m.homeTeam?.shortName ?? m.homeTeam?.name ?? "",
      away: m.awayTeam?.shortName ?? m.awayTeam?.name ?? "",
      scoreHome: m.score?.fullTime?.home ?? 0,
      scoreAway: m.score?.fullTime?.away ?? 0,
    }));

    const result = { homeWins, draws, awayWins, totalGoals, lastMatches };
    setCache(cacheKey, result, CACHE_24_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch H2H for match ${matchId}, falling back to computeH2H:`, error);
    return null;
  }
}

/**
 * Compute head-to-head record between two teams.
 * Fetches recent matches for both teams and finds overlapping fixtures.
 */
export async function computeH2H(
  homeTeamId: number,
  awayTeamId: number
): Promise<{
  homeWins: number;
  draws: number;
  awayWins: number;
  totalGoals: number;
  lastMatches: H2HMatch[];
} | null> {
  try {
    // Fetch last 20 finished matches for each team to find H2H encounters
    const [homeMatches, awayMatches] = await Promise.all([
      getTeamRecentMatches(homeTeamId, 20),
      getTeamRecentMatches(awayTeamId, 20),
    ]);

    // Build a set of match IDs for the away team for quick lookup
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const awayMatchIds = new Set(awayMatches.map((m: any) => m.id));

    // Find matches that appear in both lists (H2H encounters)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const h2hRawMatches = homeMatches.filter((m: any) => awayMatchIds.has(m.id));

    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;
    let totalGoals = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastMatches: H2HMatch[] = h2hRawMatches.map((m: any) => {
      const scoreHome: number = m.score?.fullTime?.home ?? 0;
      const scoreAway: number = m.score?.fullTime?.away ?? 0;

      totalGoals += scoreHome + scoreAway;

      const isHomeTeamHome = m.homeTeam?.id === homeTeamId;

      if (scoreHome === scoreAway) {
        draws++;
      } else if (
        (isHomeTeamHome && scoreHome > scoreAway) ||
        (!isHomeTeamHome && scoreAway > scoreHome)
      ) {
        homeWins++;
      } else {
        awayWins++;
      }

      return {
        date: formatDateGmt7(m.utcDate),
        home: m.homeTeam?.name ?? "",
        away: m.awayTeam?.name ?? "",
        scoreHome,
        scoreAway,
      };
    });

    // Return only the last 5 meetings
    return {
      homeWins,
      draws,
      awayWins,
      totalGoals,
      lastMatches: lastMatches.slice(0, 5),
    };
  } catch (error) {
    console.error(`Failed to compute H2H for ${homeTeamId} vs ${awayTeamId}:`, error);
    return null;
  }
}

/**
 * Compute form string (W/D/L) from the last N finished matches for a team.
 * @param teamId - The team's ID to determine W/D/L perspective
 * @param recentMatches - Raw match objects from the Football-Data API
 * @returns Array of "W", "D", or "L" strings, most recent first
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function computeForm(teamId: number, recentMatches: any[]): string[] {
  // Sort by date descending (most recent first)
  const sorted = [...recentMatches]
    .filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (m: any) => m.status === "FINISHED" && m.score?.fullTime
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => {
      return new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime();
    })
    .slice(0, 5);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return sorted.map((m: any) => {
    const homeGoals: number = m.score.fullTime.home ?? 0;
    const awayGoals: number = m.score.fullTime.away ?? 0;

    const isHome = m.homeTeam?.id === teamId;
    const teamGoals = isHome ? homeGoals : awayGoals;
    const opponentGoals = isHome ? awayGoals : homeGoals;

    if (teamGoals > opponentGoals) return "W";
    if (teamGoals === opponentGoals) return "D";
    return "L";
  });
}

/**
 * Fetch individual player profile.
 */
export async function getPlayerInfo(playerId: number): Promise<{
  id: number;
  name: string;
  dateOfBirth: string;
  nationality: string;
  position: string;
  shirtNumber?: number;
} | null> {
  const cacheKey = `player:${playerId}`;
  const cached = getCached<{
    id: number;
    name: string;
    dateOfBirth: string;
    nationality: string;
    position: string;
    shirtNumber?: number;
  }>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await apiFetch<any>(`/persons/${playerId}`);

    const result = {
      id: raw.id,
      name: raw.name ?? "",
      dateOfBirth: raw.dateOfBirth ?? "",
      nationality: raw.nationality ?? "",
      position: raw.position ?? "",
      shirtNumber: raw.shirtNumber ?? undefined,
    };
    setCache(cacheKey, result, CACHE_2_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch player info for ${playerId}:`, error);
    return null;
  }
}

const CACHE_1_HR = 60 * 60 * 1000;

/**
 * Fetch a player's recent match stats (aggregated).
 */
export async function getPlayerMatches(
  playerId: number,
  limit: number = 5
): Promise<{
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  matchesPlayed: number;
} | null> {
  const cacheKey = `player-matches:${playerId}:${limit}`;
  const cached = getCached<{
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
    matchesPlayed: number;
  }>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await apiFetch<any>(`/persons/${playerId}/matches`, {
      limit: String(limit),
    });

    const resultSet = raw.resultSet ?? {};
    const matches = raw.matches ?? [];

    const result = {
      goals: resultSet.goals ?? 0,
      assists: resultSet.assists ?? 0,
      yellowCards: resultSet.yellowCards ?? 0,
      redCards: resultSet.redCards ?? 0,
      minutesPlayed: resultSet.minutesPlayed ?? 0,
      matchesPlayed: matches.length,
    };
    setCache(cacheKey, result, CACHE_1_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch player matches for ${playerId}:`, error);
    return null;
  }
}
