import { Match, Standing, TeamInfo, H2HMatch, MatchOdds, MatchInjury, MatchLineup } from "./types";
import { LEAGUE_IDS, CURRENT_SEASON, getLeagueId, getLeagueCode } from "./constants";
import { getCached as getRedis, setCached as setRedis } from "./cache";
import { getShortName, getTla } from "./team-names";

const BASE_URL = "https://v3.football.api-sports.io";
const GMT_PLUS_7_OFFSET = 7 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Two-level cache: in-memory (fast) + Redis (persistent across deploys)
// ---------------------------------------------------------------------------
const memCache = new Map<string, { data: unknown; expiresAt: number }>();

async function getCached<T>(key: string): Promise<T | null> {
  const mem = memCache.get(key);
  if (mem && Date.now() < mem.expiresAt) return mem.data as T;
  if (mem) memCache.delete(key);

  const redisVal = await getRedis(`af:${key}`);
  if (redisVal) {
    try {
      const parsed = JSON.parse(redisVal) as T;
      memCache.set(key, { data: parsed, expiresAt: Date.now() + 5 * 60 * 1000 });
      return parsed;
    } catch { /* ignore */ }
  }
  return null;
}

async function setCache(key: string, data: unknown, ttlMs: number): Promise<void> {
  memCache.set(key, { data, expiresAt: Date.now() + ttlMs });
  await setRedis(`af:${key}`, JSON.stringify(data), Math.floor(ttlMs / 1000)).catch(() => {});
}

const CACHE_5_MIN = 5 * 60 * 1000;
const CACHE_30_MIN = 30 * 60 * 1000;
const CACHE_1_HR = 60 * 60 * 1000;
const CACHE_2_HR = 2 * 60 * 60 * 1000;
const CACHE_24_HR = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Rate limiter — sliding window (300 req/min on Pro plan, use 280 safely)
// ---------------------------------------------------------------------------
const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS = 280;
const requestTimestamps: number[] = [];

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= MAX_REQUESTS) {
    const waitMs = requestTimestamps[0] + RATE_WINDOW_MS - now + 100;
    await new Promise((r) => setTimeout(r, waitMs));
  }
  requestTimestamps.push(Date.now());
}

// ---------------------------------------------------------------------------
// Status mapping: API-Football short codes → our normalized status
// ---------------------------------------------------------------------------
const STATUS_MAP: Record<string, string> = {
  TBD: "SCHEDULED", NS: "SCHEDULED",
  "1H": "IN_PLAY", HT: "IN_PLAY", "2H": "IN_PLAY", ET: "IN_PLAY", BT: "IN_PLAY", P: "IN_PLAY",
  SUSP: "SUSPENDED", INT: "SUSPENDED",
  FT: "FINISHED", AET: "FINISHED", PEN: "FINISHED", AWD: "FINISHED", WO: "FINISHED",
  PST: "POSTPONED", CANC: "CANCELLED", ABD: "CANCELLED",
  LIVE: "LIVE",
};

// ---------------------------------------------------------------------------
// Position mapping: API-Football → our convention
// ---------------------------------------------------------------------------
const POSITION_MAP: Record<string, string> = {
  Goalkeeper: "Goalkeeper",
  Defender: "Defence",
  Midfielder: "Midfield",
  Attacker: "Offence",
};

function mapPosition(pos: string): string {
  return POSITION_MAP[pos] ?? pos;
}

// ---------------------------------------------------------------------------
// Generic fetch helper
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function apiFetch<T = any>(path: string, params?: Record<string, string>): Promise<T> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) throw new Error("API_FOOTBALL_KEY environment variable is not set");

  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }

  await waitForRateLimit();

  const res = await fetch(url.toString(), {
    headers: { "x-apisports-key": apiKey },
    next: { revalidate: 300 },
  } as RequestInit);

  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 5000));
    const retry = await fetch(url.toString(), {
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 300 },
    } as RequestInit);
    if (!retry.ok) throw new Error(`API-Football error ${retry.status}`);
    const json = await retry.json();
    return json.response as T;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API-Football error ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(`API-Football error: ${JSON.stringify(json.errors)}`);
  }
  return json.response as T;
}

/** Like apiFetch but returns the full JSON envelope (response + paging) for paginated endpoints */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function apiFetchRaw(path: string, params?: Record<string, string>): Promise<{ response: any[]; paging: { current: number; total: number } }> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) throw new Error("API_FOOTBALL_KEY environment variable is not set");

  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }

  await waitForRateLimit();

  const res = await fetch(url.toString(), {
    headers: { "x-apisports-key": apiKey },
    next: { revalidate: 300 },
  } as RequestInit);

  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 5000));
    const retry = await fetch(url.toString(), {
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 300 },
    } as RequestInit);
    if (!retry.ok) throw new Error(`API-Football error ${retry.status}`);
    const json = await retry.json();
    return { response: json.response ?? [], paging: json.paging ?? { current: 1, total: 1 } };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API-Football error ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(`API-Football error: ${JSON.stringify(json.errors)}`);
  }
  return { response: json.response ?? [], paging: json.paging ?? { current: 1, total: 1 } };
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
// Map API-Football fixture to our Match type
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFixture(raw: any): Match {
  const fixtureDate = raw.fixture?.date ?? new Date().toISOString();
  const homeId = raw.teams?.home?.id ?? 0;
  const awayId = raw.teams?.away?.id ?? 0;
  const homeName = raw.teams?.home?.name ?? "";
  const awayName = raw.teams?.away?.name ?? "";

  return {
    id: raw.fixture?.id ?? 0,
    competition: {
      code: getLeagueCode(raw.league?.id) ?? "",
      name: raw.league?.name ?? "",
    },
    date: formatDateGmt7(fixtureDate),
    time: formatTimeGmt7(fixtureDate),
    status: STATUS_MAP[raw.fixture?.status?.short] ?? "SCHEDULED",
    homeTeam: {
      id: homeId,
      name: homeName,
      shortName: getShortName(homeId, homeName),
      tla: getTla(homeId, homeName),
      crest: raw.teams?.home?.logo ?? "",
    },
    awayTeam: {
      id: awayId,
      name: awayName,
      shortName: getShortName(awayId, awayName),
      tla: getTla(awayId, awayName),
      crest: raw.teams?.away?.logo ?? "",
    },
    venue: raw.fixture?.venue?.name ?? "",
    homeForm: [],
    awayForm: [],
    score:
      raw.goals?.home != null || raw.goals?.away != null
        ? { home: raw.goals.home, away: raw.goals.away }
        : undefined,
    referee: raw.fixture?.referee
      ? { name: raw.fixture.referee, nationality: "" }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

export async function getMatches(dateFrom: string, dateTo: string): Promise<Match[]> {
  const cacheKey = `matches:${dateFrom}:${dateTo}`;
  const cached = await getCached<Match[]>(cacheKey);
  if (cached) return cached;

  try {
    const allFixtures = await Promise.all(
      LEAGUE_IDS.map((leagueId) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiFetch<any[]>("/fixtures", {
          league: String(leagueId),
          season: String(CURRENT_SEASON),
          from: dateFrom,
          to: dateTo,
        })
      )
    );

    const matches: Match[] = allFixtures.flat().map(mapFixture);
    matches.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
    });

    await setCache(cacheKey, matches, CACHE_5_MIN);
    return matches;
  } catch (error) {
    console.error("Failed to fetch matches:", error);
    return [];
  }
}

export async function getMatch(matchId: number): Promise<Match | null> {
  const cacheKey = `match:${matchId}`;
  const cached = await getCached<Match>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/fixtures", { id: String(matchId) });
    if (!data || data.length === 0) return null;
    const match = mapFixture(data[0]);
    await setCache(cacheKey, match, CACHE_5_MIN);
    return match;
  } catch (error) {
    console.error(`Failed to fetch match ${matchId}:`, error);
    return null;
  }
}

export async function getStandings(competitionCode: string): Promise<Standing[]> {
  const cacheKey = `standings:${competitionCode}`;
  const cached = await getCached<Standing[]>(cacheKey);
  if (cached) return cached;

  const leagueId = getLeagueId(competitionCode);
  if (!leagueId) return [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/standings", {
      league: String(leagueId),
      season: String(CURRENT_SEASON),
    });

    // response[0].league.standings[0] = array of team standings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const standingsArr = data?.[0]?.league?.standings?.[0] ?? [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = standingsArr.map((row: any): Standing => ({
      position: row.rank ?? 0,
      team: {
        id: row.team?.id ?? 0,
        name: row.team?.name ?? "",
        shortName: getShortName(row.team?.id, row.team?.name ?? ""),
        tla: getTla(row.team?.id, row.team?.name ?? ""),
        crest: row.team?.logo ?? "",
      },
      playedGames: row.all?.played ?? 0,
      won: row.all?.win ?? 0,
      draw: row.all?.draw ?? 0,
      lost: row.all?.lose ?? 0,
      goalsFor: row.all?.goals?.for ?? 0,
      goalsAgainst: row.all?.goals?.against ?? 0,
      goalDifference: row.goalsDiff ?? 0,
      points: row.points ?? 0,
    }));

    await setCache(cacheKey, result, CACHE_30_MIN);
    return result;
  } catch (error) {
    console.error(`Failed to fetch standings for ${competitionCode}:`, error);
    return [];
  }
}

export async function getTeamInfo(teamId: number): Promise<TeamInfo | null> {
  const cacheKey = `team:${teamId}`;
  const cached = await getCached<TeamInfo>(cacheKey);
  if (cached) return cached;

  try {
    const [teamData, coachData, squadData] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiFetch<any[]>("/teams", { id: String(teamId) }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiFetch<any[]>("/coachs", { team: String(teamId) }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiFetch<any[]>("/players/squads", { team: String(teamId) }),
    ]);

    const team = teamData?.[0];
    const squad = squadData?.[0]?.players ?? [];

    // Find the current coach - prefer the one with the most recent start date and no end date
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentCoach = (coachData ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((c: any) => c.career?.some((career: any) => career.team?.id === teamId && !career.end))
      .sort((a: any, b: any) => {
        const aStart = a.career?.find((c: any) => c.team?.id === teamId && !c.end)?.start ?? "";
        const bStart = b.career?.find((c: any) => c.team?.id === teamId && !c.end)?.start ?? "";
        return bStart.localeCompare(aStart); // most recent first
      })[0];

    const result: TeamInfo = {
      id: team?.team?.id ?? teamId,
      name: team?.team?.name ?? "",
      shortName: getShortName(teamId, team?.team?.name ?? ""),
      tla: getTla(teamId, team?.team?.name ?? ""),
      crest: team?.team?.logo ?? "",
      venue: team?.venue?.name ?? "",
      coach: currentCoach
        ? { name: currentCoach.name ?? "", nationality: currentCoach.nationality ?? "", photo: currentCoach.photo ?? "" }
        : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      squad: squad.map((p: any) => ({
        id: p.id ?? 0,
        name: p.name ?? "",
        position: mapPosition(p.position ?? ""),
        nationality: "",
        photo: p.photo ?? "",
        dateOfBirth: undefined,
      })),
    };

    await setCache(cacheKey, result, CACHE_2_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch team info for ${teamId}:`, error);
    return null;
  }
}

/**
 * Fetch recent finished matches for a team.
 * Returns objects normalized to the shape consumers expect
 * (utcDate, status, homeTeam.shortName, score.fullTime, etc.)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getTeamRecentMatches(teamId: number, limit: number): Promise<any[]> {
  const cacheKey = `recent:${teamId}:${limit}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cached = await getCached<any[]>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/fixtures", {
      team: String(teamId),
      last: String(limit),
    });

    // Normalize to the shape consumers expect (RecentResults, HomeAwayForm, computeForm)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (data ?? []).map((raw: any) => {
      const homeId = raw.teams?.home?.id ?? 0;
      const awayId = raw.teams?.away?.id ?? 0;
      const statusShort = raw.fixture?.status?.short ?? "NS";

      return {
        id: raw.fixture?.id ?? 0,
        utcDate: raw.fixture?.date ?? "",
        status: STATUS_MAP[statusShort] ?? "SCHEDULED",
        homeTeam: {
          id: homeId,
          name: raw.teams?.home?.name ?? "",
          shortName: getShortName(homeId, raw.teams?.home?.name ?? ""),
          crest: raw.teams?.home?.logo ?? "",
        },
        awayTeam: {
          id: awayId,
          name: raw.teams?.away?.name ?? "",
          shortName: getShortName(awayId, raw.teams?.away?.name ?? ""),
          crest: raw.teams?.away?.logo ?? "",
        },
        score: {
          fullTime: {
            home: raw.goals?.home ?? null,
            away: raw.goals?.away ?? null,
          },
        },
      };
    });

    await setCache(cacheKey, result, CACHE_30_MIN);
    return result;
  } catch (error) {
    console.error(`Failed to fetch recent matches for team ${teamId}:`, error);
    return [];
  }
}

export async function getTopScorers(
  competitionCode: string
): Promise<{ id: number; name: string; team: string; goals: number; assists: number | null; nationality: string; photo?: string }[]> {
  const cacheKey = `scorers:${competitionCode}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cached = await getCached<any[]>(cacheKey);
  if (cached) return cached;

  const leagueId = getLeagueId(competitionCode);
  if (!leagueId) return [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/players/topscorers", {
      league: String(leagueId),
      season: String(CURRENT_SEASON),
    });

    const result = (data ?? []).slice(0, 10).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => ({
        id: s.player?.id ?? 0,
        name: s.player?.name ?? "",
        team: s.statistics?.[0]?.team?.name ?? "",
        goals: s.statistics?.[0]?.goals?.total ?? 0,
        assists: s.statistics?.[0]?.goals?.assists ?? null,
        nationality: s.player?.nationality ?? "",
        photo: s.player?.photo ?? "",
      })
    );

    await setCache(cacheKey, result, CACHE_30_MIN);
    return result;
  } catch (error) {
    console.error(`Failed to fetch top scorers for ${competitionCode}:`, error);
    return [];
  }
}

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
  const cached = await getCached<{
    homeWins: number; draws: number; awayWins: number;
    totalGoals: number; lastMatches: H2HMatch[];
  }>(cacheKey);
  if (cached) return cached;

  try {
    const match = await getMatch(matchId);
    if (!match) return null;

    const result = await computeH2H(match.homeTeam.id, match.awayTeam.id);
    if (result) await setCache(cacheKey, result, CACHE_24_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch H2H for match ${matchId}:`, error);
    return null;
  }
}

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
  const cacheKey = `h2h-direct:${homeTeamId}-${awayTeamId}`;
  const cached = await getCached<{
    homeWins: number; draws: number; awayWins: number;
    totalGoals: number; lastMatches: H2HMatch[];
  }>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/fixtures/headtohead", {
      h2h: `${homeTeamId}-${awayTeamId}`,
      last: "10",
    });

    let homeWins = 0, draws = 0, awayWins = 0, totalGoals = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastMatches: H2HMatch[] = (data ?? []).map((raw: any) => {
      const scoreHome: number = raw.goals?.home ?? 0;
      const scoreAway: number = raw.goals?.away ?? 0;
      totalGoals += scoreHome + scoreAway;

      const isHomeTeamHome = raw.teams?.home?.id === homeTeamId;
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
        date: formatDateGmt7(raw.fixture?.date ?? new Date().toISOString()),
        home: getShortName(raw.teams?.home?.id, raw.teams?.home?.name ?? ""),
        away: getShortName(raw.teams?.away?.id, raw.teams?.away?.name ?? ""),
        scoreHome,
        scoreAway,
      };
    });

    const result = { homeWins, draws, awayWins, totalGoals, lastMatches: lastMatches.slice(0, 5) };
    await setCache(cacheKey, result, CACHE_24_HR);
    return result;
  } catch (error) {
    console.error(`Failed to compute H2H for ${homeTeamId} vs ${awayTeamId}:`, error);
    return null;
  }
}

/**
 * Compute form string (W/D/L) from raw recent matches.
 * Works on normalized objects from getTeamRecentMatches.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function computeForm(teamId: number, recentMatches: any[]): string[] {
  const sorted = [...recentMatches]
    .filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (m: any) => m.status === "FINISHED" && m.score?.fullTime
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) =>
      new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime()
    )
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

export async function getPlayerInfo(playerId: number): Promise<{
  id: number; name: string; dateOfBirth: string; nationality: string;
  position: string; shirtNumber?: number;
} | null> {
  const cacheKey = `player:${playerId}`;
  const cached = await getCached<{
    id: number; name: string; dateOfBirth: string; nationality: string;
    position: string; shirtNumber?: number;
  }>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/players", {
      id: String(playerId),
      season: String(CURRENT_SEASON),
    });

    const player = data?.[0]?.player;
    const stats = data?.[0]?.statistics?.[0];
    if (!player) return null;

    const result = {
      id: player.id,
      name: player.name ?? "",
      dateOfBirth: player.birth?.date ?? "",
      nationality: player.nationality ?? "",
      position: mapPosition(stats?.games?.position ?? player.position ?? ""),
      shirtNumber: player.number ?? undefined,
    };

    await setCache(cacheKey, result, CACHE_2_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch player info for ${playerId}:`, error);
    return null;
  }
}

export async function getPlayerMatches(
  playerId: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _limit: number = 5
): Promise<{
  goals: number; assists: number; yellowCards: number; redCards: number;
  minutesPlayed: number; matchesPlayed: number;
} | null> {
  const cacheKey = `player-matches:${playerId}`;
  const cached = await getCached<{
    goals: number; assists: number; yellowCards: number; redCards: number;
    minutesPlayed: number; matchesPlayed: number;
  }>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/players", {
      id: String(playerId),
      season: String(CURRENT_SEASON),
    });

    const stats = data?.[0]?.statistics?.[0];
    if (!stats) return null;

    const result = {
      goals: stats.goals?.total ?? 0,
      assists: stats.goals?.assists ?? 0,
      yellowCards: stats.cards?.yellow ?? 0,
      redCards: stats.cards?.red ?? 0,
      minutesPlayed: stats.games?.minutes ?? 0,
      matchesPlayed: stats.games?.appearences ?? 0,
    };

    await setCache(cacheKey, result, CACHE_1_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch player matches for ${playerId}:`, error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// New API-Football features: Odds, Injuries, Lineups
// ---------------------------------------------------------------------------

export async function getMatchOdds(fixtureId: number): Promise<MatchOdds | null> {
  const cacheKey = `odds:${fixtureId}`;
  const cached = await getCached<MatchOdds>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/odds", { fixture: String(fixtureId) });
    if (!data || data.length === 0) return null;

    const raw = data[0];
    const result: MatchOdds = {
      fixtureId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bookmakers: (raw.bookmakers ?? []).slice(0, 5).map((b: any) => ({
        name: b.name ?? "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bets: (b.bets ?? []).slice(0, 3).map((bet: any) => ({
          name: bet.name ?? "",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          values: (bet.values ?? []).map((v: any) => ({
            value: String(v.value ?? ""),
            odd: String(v.odd ?? ""),
          })),
        })),
      })),
    };

    await setCache(cacheKey, result, CACHE_1_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch odds for fixture ${fixtureId}:`, error);
    return null;
  }
}

export async function getMatchInjuries(fixtureId: number): Promise<MatchInjury[]> {
  const cacheKey = `injuries:${fixtureId}`;
  const cached = await getCached<MatchInjury[]>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/injuries", { fixture: String(fixtureId) });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: MatchInjury[] = (data ?? []).map((item: any) => ({
      player: {
        id: item.player?.id ?? 0,
        name: item.player?.name ?? "",
        photo: item.player?.photo ?? "",
      },
      team: {
        id: item.team?.id ?? 0,
        name: item.team?.name ?? "",
        logo: item.team?.logo ?? "",
      },
      type: item.player?.type ?? "",
      reason: item.player?.reason ?? "",
    }));

    await setCache(cacheKey, result, CACHE_2_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch injuries for fixture ${fixtureId}:`, error);
    return [];
  }
}

export async function getMatchLineups(fixtureId: number): Promise<MatchLineup[]> {
  const cacheKey = `lineups:${fixtureId}`;
  const cached = await getCached<MatchLineup[]>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/fixtures/lineups", { fixture: String(fixtureId) });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: MatchLineup[] = (data ?? []).map((item: any) => ({
      team: {
        id: item.team?.id ?? 0,
        name: item.team?.name ?? "",
        logo: item.team?.logo ?? "",
      },
      formation: item.formation ?? "",
      coach: {
        name: item.coach?.name ?? "",
        photo: item.coach?.photo ?? "",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      startXI: (item.startXI ?? []).map((entry: any) => ({
        id: entry.player?.id ?? 0,
        name: entry.player?.name ?? "",
        number: entry.player?.number ?? 0,
        pos: entry.player?.pos ?? "",
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      substitutes: (item.substitutes ?? []).map((entry: any) => ({
        id: entry.player?.id ?? 0,
        name: entry.player?.name ?? "",
        number: entry.player?.number ?? 0,
        pos: entry.player?.pos ?? "",
      })),
    }));

    await setCache(cacheKey, result, CACHE_5_MIN);
    return result;
  } catch (error) {
    console.error(`Failed to fetch lineups for fixture ${fixtureId}:`, error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Live matches — currently playing fixtures
// ---------------------------------------------------------------------------

export async function getLiveMatches(): Promise<Match[]> {
  const cacheKey = `live-matches`;
  const cached = await getCached<Match[]>(cacheKey);
  if (cached) return cached;

  try {
    const allLiveFixtures = await Promise.all(
      LEAGUE_IDS.map((leagueId) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiFetch<any[]>("/fixtures", {
          league: String(leagueId),
          live: "all",
        })
      )
    );

    const matches: Match[] = allLiveFixtures.flat().map(mapFixture);
    matches.sort((a, b) => a.time.localeCompare(b.time));

    // Short cache for live data - 30 seconds
    await setCache(cacheKey, matches, 30 * 1000);
    return matches;
  } catch (error) {
    console.error("Failed to fetch live matches:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Match events — goals, cards, substitutions
// ---------------------------------------------------------------------------

export interface MatchEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string; // "Goal", "Card", "subst", "Var"
  detail: string; // "Normal Goal", "Yellow Card", "Red Card", "Substitution 1"
  comments: string | null;
}

export async function getMatchEvents(fixtureId: number): Promise<MatchEvent[]> {
  const cacheKey = `events:${fixtureId}`;
  const cached = await getCached<MatchEvent[]>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/fixtures/events", { fixture: String(fixtureId) });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: MatchEvent[] = (data ?? []).map((event: any) => ({
      time: {
        elapsed: event.time?.elapsed ?? 0,
        extra: event.time?.extra ?? null,
      },
      team: {
        id: event.team?.id ?? 0,
        name: event.team?.name ?? "",
        logo: event.team?.logo ?? "",
      },
      player: {
        id: event.player?.id ?? 0,
        name: event.player?.name ?? "",
      },
      assist: {
        id: event.assist?.id ?? null,
        name: event.assist?.name ?? null,
      },
      type: event.type ?? "",
      detail: event.detail ?? "",
      comments: event.comments ?? null,
    }));

    // Cache for 1 minute for finished matches, 30 seconds for live
    await setCache(cacheKey, result, 60 * 1000);
    return result;
  } catch (error) {
    console.error(`Failed to fetch events for fixture ${fixtureId}:`, error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Match statistics — possession, shots, corners, etc.
// ---------------------------------------------------------------------------

export interface TeamStatistics {
  teamId: number;
  teamName: string;
  teamLogo: string;
  stats: Record<string, string | number | null>;
}

export async function getMatchStatistics(fixtureId: number): Promise<TeamStatistics[]> {
  const cacheKey = `statistics:${fixtureId}`;
  const cached = await getCached<TeamStatistics[]>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/fixtures/statistics", { fixture: String(fixtureId) });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: TeamStatistics[] = (data ?? []).map((teamStats: any) => {
      const stats: Record<string, string | number | null> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (teamStats.statistics ?? []).forEach((s: any) => {
        stats[s.type] = s.value;
      });
      return {
        teamId: teamStats.team?.id ?? 0,
        teamName: teamStats.team?.name ?? "",
        teamLogo: teamStats.team?.logo ?? "",
        stats,
      };
    });

    await setCache(cacheKey, result, CACHE_5_MIN);
    return result;
  } catch (error) {
    console.error(`Failed to fetch statistics for fixture ${fixtureId}:`, error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Top assists — league top assist providers
// ---------------------------------------------------------------------------

export async function getTopAssists(
  competitionCode: string
): Promise<{ id: number; name: string; team: string; teamLogo: string; assists: number; goals: number; photo: string }[]> {
  const cacheKey = `assists:${competitionCode}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cached = await getCached<any[]>(cacheKey);
  if (cached) return cached;

  const leagueId = getLeagueId(competitionCode);
  if (!leagueId) return [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/players/topassists", {
      league: String(leagueId),
      season: String(CURRENT_SEASON),
    });

    const result = (data ?? []).slice(0, 20).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => ({
        id: s.player?.id ?? 0,
        name: s.player?.name ?? "",
        team: s.statistics?.[0]?.team?.name ?? "",
        teamLogo: s.statistics?.[0]?.team?.logo ?? "",
        assists: s.statistics?.[0]?.goals?.assists ?? 0,
        goals: s.statistics?.[0]?.goals?.total ?? 0,
        photo: s.player?.photo ?? "",
      })
    );

    await setCache(cacheKey, result, CACHE_30_MIN);
    return result;
  } catch (error) {
    console.error(`Failed to fetch top assists for ${competitionCode}:`, error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Player Profile — detailed player information
// ---------------------------------------------------------------------------

export interface PlayerProfile {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  photo: string;
  age: number;
  nationality: string;
  height: string;
  weight: string;
  birthDate: string;
  birthPlace: string;
  birthCountry: string;
  currentTeam: {
    id: number;
    name: string;
    logo: string;
  } | null;
  position: string;
  number: number | null;
  statistics: {
    team: { id: number; name: string; logo: string };
    league: { id: number; name: string; country: string; logo: string };
    games: { appearences: number; minutes: number; rating: string | null };
    goals: { total: number; assists: number };
    passes: { total: number; accuracy: number | null };
    shots: { total: number; on: number };
    tackles: { total: number; interceptions: number };
    duels: { total: number; won: number };
    dribbles: { attempts: number; success: number };
    fouls: { drawn: number; committed: number };
    cards: { yellow: number; red: number };
  }[];
}

export async function getPlayerProfile(playerId: number): Promise<PlayerProfile | null> {
  const cacheKey = `player-profile:${playerId}`;
  const cached = await getCached<PlayerProfile>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/players", {
      id: String(playerId),
      season: String(CURRENT_SEASON),
    });

    if (!data || data.length === 0) return null;

    const raw = data[0];
    const player = raw.player;
    const stats = raw.statistics ?? [];

    const result: PlayerProfile = {
      id: player?.id ?? playerId,
      name: player?.name ?? "",
      firstname: player?.firstname ?? "",
      lastname: player?.lastname ?? "",
      photo: player?.photo ?? "",
      age: player?.age ?? 0,
      nationality: player?.nationality ?? "",
      height: player?.height ?? "",
      weight: player?.weight ?? "",
      birthDate: player?.birth?.date ?? "",
      birthPlace: player?.birth?.place ?? "",
      birthCountry: player?.birth?.country ?? "",
      currentTeam: stats[0]?.team ? {
        id: stats[0].team.id,
        name: stats[0].team.name,
        logo: stats[0].team.logo,
      } : null,
      position: stats[0]?.games?.position ?? "",
      number: player?.number ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      statistics: stats.map((s: any) => ({
        team: {
          id: s.team?.id ?? 0,
          name: s.team?.name ?? "",
          logo: s.team?.logo ?? "",
        },
        league: {
          id: s.league?.id ?? 0,
          name: s.league?.name ?? "",
          country: s.league?.country ?? "",
          logo: s.league?.logo ?? "",
        },
        games: {
          appearences: s.games?.appearences ?? 0,
          minutes: s.games?.minutes ?? 0,
          rating: s.games?.rating ?? null,
        },
        goals: {
          total: s.goals?.total ?? 0,
          assists: s.goals?.assists ?? 0,
        },
        passes: {
          total: s.passes?.total ?? 0,
          accuracy: s.passes?.accuracy ?? null,
        },
        shots: {
          total: s.shots?.total ?? 0,
          on: s.shots?.on ?? 0,
        },
        tackles: {
          total: s.tackles?.total ?? 0,
          interceptions: s.tackles?.interceptions ?? 0,
        },
        duels: {
          total: s.duels?.total ?? 0,
          won: s.duels?.won ?? 0,
        },
        dribbles: {
          attempts: s.dribbles?.attempts ?? 0,
          success: s.dribbles?.success ?? 0,
        },
        fouls: {
          drawn: s.fouls?.drawn ?? 0,
          committed: s.fouls?.committed ?? 0,
        },
        cards: {
          yellow: s.cards?.yellow ?? 0,
          red: s.cards?.red ?? 0,
        },
      })),
    };

    await setCache(cacheKey, result, CACHE_2_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch player profile for ${playerId}:`, error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Player Transfers — transfer history
// ---------------------------------------------------------------------------

export interface PlayerTransfer {
  date: string;
  type: string;
  teamIn: { id: number; name: string; logo: string };
  teamOut: { id: number; name: string; logo: string };
}

export async function getPlayerTransfers(playerId: number): Promise<PlayerTransfer[]> {
  const cacheKey = `player-transfers:${playerId}`;
  const cached = await getCached<PlayerTransfer[]>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/transfers", { player: String(playerId) });

    if (!data || data.length === 0) return [];

    const transfers = data[0]?.transfers ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: PlayerTransfer[] = transfers.slice(0, 10).map((t: any) => ({
      date: t.date ?? "",
      type: t.type ?? "",
      teamIn: {
        id: t.teams?.in?.id ?? 0,
        name: t.teams?.in?.name ?? "",
        logo: t.teams?.in?.logo ?? "",
      },
      teamOut: {
        id: t.teams?.out?.id ?? 0,
        name: t.teams?.out?.name ?? "",
        logo: t.teams?.out?.logo ?? "",
      },
    }));

    await setCache(cacheKey, result, CACHE_24_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch transfers for player ${playerId}:`, error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Player Trophies
// ---------------------------------------------------------------------------

export interface PlayerTrophy {
  league: string;
  country: string;
  season: string;
  place: string;
}

export async function getPlayerTrophies(playerId: number): Promise<PlayerTrophy[]> {
  const cacheKey = `player-trophies:${playerId}`;
  const cached = await getCached<PlayerTrophy[]>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/trophies", { player: String(playerId) });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: PlayerTrophy[] = (data ?? []).slice(0, 20).map((t: any) => ({
      league: t.league ?? "",
      country: t.country ?? "",
      season: t.season ?? "",
      place: t.place ?? "",
    }));

    await setCache(cacheKey, result, CACHE_24_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch trophies for player ${playerId}:`, error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Team Profile — detailed team/club information
// ---------------------------------------------------------------------------

export interface TeamProfile {
  id: number;
  name: string;
  code: string;
  country: string;
  founded: number;
  logo: string;
  venue: {
    name: string;
    address: string;
    city: string;
    capacity: number;
    image: string;
  };
}

export async function getTeamProfile(teamId: number): Promise<TeamProfile | null> {
  const cacheKey = `team-profile:${teamId}`;
  const cached = await getCached<TeamProfile>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/teams", { id: String(teamId) });

    if (!data || data.length === 0) return null;

    const raw = data[0];
    const team = raw.team;
    const venue = raw.venue;

    const result: TeamProfile = {
      id: team?.id ?? teamId,
      name: team?.name ?? "",
      code: team?.code ?? "",
      country: team?.country ?? "",
      founded: team?.founded ?? 0,
      logo: team?.logo ?? "",
      venue: {
        name: venue?.name ?? "",
        address: venue?.address ?? "",
        city: venue?.city ?? "",
        capacity: venue?.capacity ?? 0,
        image: venue?.image ?? "",
      },
    };

    await setCache(cacheKey, result, CACHE_24_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch team profile for ${teamId}:`, error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Team Season Statistics
// ---------------------------------------------------------------------------

export interface TeamSeasonStats {
  form: string;
  fixtures: {
    played: { home: number; away: number; total: number };
    wins: { home: number; away: number; total: number };
    draws: { home: number; away: number; total: number };
    loses: { home: number; away: number; total: number };
  };
  goals: {
    for: { home: number; away: number; total: number; average: { total: string } };
    against: { home: number; away: number; total: number; average: { total: string } };
  };
  cleanSheet: { home: number; away: number; total: number };
  failedToScore: { home: number; away: number; total: number };
  biggestWin: { home: string; away: string };
  biggestLose: { home: string; away: string };
}

export async function getTeamSeasonStats(teamId: number, leagueId: number): Promise<TeamSeasonStats | null> {
  const cacheKey = `team-stats:${teamId}:${leagueId}`;
  const cached = await getCached<TeamSeasonStats>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any>("/teams/statistics", {
      team: String(teamId),
      league: String(leagueId),
      season: String(CURRENT_SEASON),
    });

    if (!data) return null;

    const result: TeamSeasonStats = {
      form: data.form ?? "",
      fixtures: {
        played: {
          home: data.fixtures?.played?.home ?? 0,
          away: data.fixtures?.played?.away ?? 0,
          total: data.fixtures?.played?.total ?? 0,
        },
        wins: {
          home: data.fixtures?.wins?.home ?? 0,
          away: data.fixtures?.wins?.away ?? 0,
          total: data.fixtures?.wins?.total ?? 0,
        },
        draws: {
          home: data.fixtures?.draws?.home ?? 0,
          away: data.fixtures?.draws?.away ?? 0,
          total: data.fixtures?.draws?.total ?? 0,
        },
        loses: {
          home: data.fixtures?.loses?.home ?? 0,
          away: data.fixtures?.loses?.away ?? 0,
          total: data.fixtures?.loses?.total ?? 0,
        },
      },
      goals: {
        for: {
          home: data.goals?.for?.total?.home ?? 0,
          away: data.goals?.for?.total?.away ?? 0,
          total: data.goals?.for?.total?.total ?? 0,
          average: { total: data.goals?.for?.average?.total ?? "0" },
        },
        against: {
          home: data.goals?.against?.total?.home ?? 0,
          away: data.goals?.against?.total?.away ?? 0,
          total: data.goals?.against?.total?.total ?? 0,
          average: { total: data.goals?.against?.average?.total ?? "0" },
        },
      },
      cleanSheet: {
        home: data.clean_sheet?.home ?? 0,
        away: data.clean_sheet?.away ?? 0,
        total: data.clean_sheet?.total ?? 0,
      },
      failedToScore: {
        home: data.failed_to_score?.home ?? 0,
        away: data.failed_to_score?.away ?? 0,
        total: data.failed_to_score?.total ?? 0,
      },
      biggestWin: {
        home: data.biggest?.wins?.home ?? "",
        away: data.biggest?.wins?.away ?? "",
      },
      biggestLose: {
        home: data.biggest?.loses?.home ?? "",
        away: data.biggest?.loses?.away ?? "",
      },
    };

    await setCache(cacheKey, result, CACHE_2_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch team stats for ${teamId}:`, error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Detect which supported league a team belongs to
// ---------------------------------------------------------------------------

export async function getTeamLeagueId(teamId: number): Promise<number | null> {
  const cacheKey = `team-league:${teamId}`;
  const cached = await getCached<number>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/leagues", {
      team: String(teamId),
      season: String(CURRENT_SEASON),
    });

    if (!data || data.length === 0) return null;

    const supportedIds = new Set(LEAGUE_IDS);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const match = data.find((l: any) => supportedIds.has(l.league?.id));
    const leagueId = match?.league?.id ?? null;

    if (leagueId) {
      await setCache(cacheKey, leagueId, CACHE_24_HR);
    }
    return leagueId;
  } catch (error) {
    console.error(`Failed to detect league for team ${teamId}:`, error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Team Squad with detailed info
// ---------------------------------------------------------------------------

export interface SquadPlayer {
  id: number;
  name: string;
  age: number;
  number: number | null;
  position: string;
  photo: string;
}

export async function getTeamSquad(teamId: number): Promise<SquadPlayer[]> {
  const cacheKey = `team-squad:${teamId}`;
  const cached = await getCached<SquadPlayer[]>(cacheKey);
  if (cached) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await apiFetch<any[]>("/players/squads", { team: String(teamId) });

    if (!data || data.length === 0) return [];

    const players = data[0]?.players ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: SquadPlayer[] = players.map((p: any) => ({
      id: p.id ?? 0,
      name: p.name ?? "",
      age: p.age ?? 0,
      number: p.number ?? null,
      position: p.position ?? "",
      photo: p.photo ?? "",
    }));

    await setCache(cacheKey, result, CACHE_2_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch squad for team ${teamId}:`, error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Team Top Performers — players sorted by goals + assists
// ---------------------------------------------------------------------------

export interface TopPerformer {
  id: number;
  name: string;
  photo: string;
  position: string;
  goals: number;
  assists: number;
  appearances: number;
  rating: string | null;
}

export async function getTeamTopPerformers(teamId: number, leagueId: number): Promise<TopPerformer[]> {
  const cacheKey = `team-top-performers:${teamId}:${leagueId}`;
  const cached = await getCached<TopPerformer[]>(cacheKey);
  if (cached) return cached;

  try {
    // Fetch all pages of players for this team in the specific league
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allData: any[] = [];
    let page = 1;
    const maxPages = 3; // Safety limit — squads rarely exceed 60 players
    while (page <= maxPages) {
      const raw = await apiFetchRaw("/players", {
        team: String(teamId),
        league: String(leagueId),
        season: String(CURRENT_SEASON),
        page: String(page),
      });
      const items = raw.response ?? [];
      allData.push(...items);
      const totalPages = raw.paging?.total ?? 1;
      if (page >= totalPages) break;
      page++;
    }

    if (allData.length === 0) return [];

    // Map and sort players by performance (goals + assists, then appearances)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const performers: TopPerformer[] = allData.map((item: any) => {
      const player = item.player ?? {};
      // Find stats matching the specific league + team (not blindly [0])
      const stats = item.statistics?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (s: any) => s.league?.id === leagueId && s.team?.id === teamId
      ) ?? item.statistics?.[0] ?? {};
      return {
        id: player.id ?? 0,
        name: player.name ?? "",
        photo: player.photo ?? "",
        position: mapPosition(stats.games?.position ?? ""),
        goals: stats.goals?.total ?? 0,
        assists: stats.goals?.assists ?? 0,
        appearances: stats.games?.appearences ?? 0,
        rating: stats.games?.rating ?? null,
      };
    });

    // Sort by goals + assists first, then by appearances
    performers.sort((a, b) => {
      const scoreA = a.goals + a.assists;
      const scoreB = b.goals + b.assists;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return b.appearances - a.appearances;
    });

    // Return top 16 players
    const result = performers.slice(0, 16);
    await setCache(cacheKey, result, CACHE_2_HR);
    return result;
  } catch (error) {
    console.error(`Failed to fetch top performers for team ${teamId}:`, error);
    return [];
  }
}
