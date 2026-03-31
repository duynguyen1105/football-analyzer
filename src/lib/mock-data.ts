// Static mock data for design preview — will be replaced with real API data

// Football-Data.org free CDN — no API key needed for images
// URL pattern: https://crests.football-data.org/{teamId}.png (or .svg)
const crest = (id: number) => `https://crests.football-data.org/${id}.png`;

export const LEAGUES = [
  { id: "PL", name: "Premier League", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "PD", name: "La Liga", country: "Spain", flag: "🇪🇸" },
  { id: "SA", name: "Serie A", country: "Italy", flag: "🇮🇹" },
  { id: "BL1", name: "Bundesliga", country: "Germany", flag: "🇩🇪" },
  { id: "FL1", name: "Ligue 1", country: "France", flag: "🇫🇷" },
];

export interface Match {
  id: string;
  league: string;
  leagueFlag: string;
  date: string;
  time: string;
  homeTeam: string;
  homeShort: string;
  homeLogo: string;
  awayTeam: string;
  awayShort: string;
  awayLogo: string;
  homeForm: string[];
  awayForm: string[];
  venue: string;
}

export const MOCK_MATCHES: Match[] = [
  {
    id: "arsenal-chelsea-2026-04-05",
    league: "Premier League",
    leagueFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    date: "2026-04-05",
    time: "20:00",
    homeTeam: "Arsenal",
    homeShort: "ARS",
    homeLogo: crest(57),
    awayTeam: "Chelsea",
    awayShort: "CHE",
    awayLogo: crest(61),
    homeForm: ["W", "W", "D", "W", "L"],
    awayForm: ["W", "L", "W", "D", "W"],
    venue: "Emirates Stadium",
  },
  {
    id: "liverpool-mancity-2026-04-05",
    league: "Premier League",
    leagueFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    date: "2026-04-05",
    time: "17:30",
    homeTeam: "Liverpool",
    homeShort: "LIV",
    homeLogo: crest(64),
    awayTeam: "Manchester City",
    awayShort: "MCI",
    awayLogo: crest(65),
    homeForm: ["W", "W", "W", "D", "W"],
    awayForm: ["L", "W", "D", "W", "W"],
    venue: "Anfield",
  },
  {
    id: "barca-realmadrid-2026-04-05",
    league: "La Liga",
    leagueFlag: "🇪🇸",
    date: "2026-04-05",
    time: "21:00",
    homeTeam: "Barcelona",
    homeShort: "BAR",
    homeLogo: crest(81),
    awayTeam: "Real Madrid",
    awayShort: "RMA",
    awayLogo: crest(86),
    homeForm: ["W", "W", "W", "W", "D"],
    awayForm: ["W", "D", "W", "L", "W"],
    venue: "Spotify Camp Nou",
  },
  {
    id: "inter-acmilan-2026-04-06",
    league: "Serie A",
    leagueFlag: "🇮🇹",
    date: "2026-04-06",
    time: "20:45",
    homeTeam: "Inter Milan",
    homeShort: "INT",
    homeLogo: crest(108),
    awayTeam: "AC Milan",
    awayShort: "ACM",
    awayLogo: crest(98),
    homeForm: ["W", "D", "W", "W", "W"],
    awayForm: ["L", "W", "D", "L", "W"],
    venue: "San Siro",
  },
  {
    id: "bayern-dortmund-2026-04-06",
    league: "Bundesliga",
    leagueFlag: "🇩🇪",
    date: "2026-04-06",
    time: "18:30",
    homeTeam: "Bayern Munich",
    homeShort: "BAY",
    homeLogo: crest(5),
    awayTeam: "Borussia Dortmund",
    awayShort: "BVB",
    awayLogo: crest(4),
    homeForm: ["W", "W", "W", "D", "W"],
    awayForm: ["W", "L", "W", "W", "D"],
    venue: "Allianz Arena",
  },
  {
    id: "psg-marseille-2026-04-06",
    league: "Ligue 1",
    leagueFlag: "🇫🇷",
    date: "2026-04-06",
    time: "20:45",
    homeTeam: "Paris Saint-Germain",
    homeShort: "PSG",
    homeLogo: crest(524),
    awayTeam: "Olympique Marseille",
    awayShort: "OM",
    awayLogo: crest(516),
    homeForm: ["W", "W", "D", "W", "W"],
    awayForm: ["D", "W", "L", "W", "D"],
    venue: "Parc des Princes",
  },
];

export interface MatchDetail {
  match: Match;
  h2h: {
    homeWins: number;
    draws: number;
    awayWins: number;
    lastMatches: {
      date: string;
      home: string;
      away: string;
      scoreHome: number;
      scoreAway: number;
    }[];
  };
  standings: {
    home: { pos: number; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; gd: number; pts: number };
    away: { pos: number; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; gd: number; pts: number };
  };
  stats: {
    homeGoalsScored: number;
    homeGoalsConceded: number;
    awayGoalsScored: number;
    awayGoalsConceded: number;
    homeCleanSheets: number;
    awayCleanSheets: number;
    homeAvgGoals: number;
    awayAvgGoals: number;
    homePossession: number;
    awayPossession: number;
    homeShotsPerGame: number;
    awayShotsPerGame: number;
  };
  prediction: {
    homeWin: number;
    draw: number;
    awayWin: number;
    btts: number;
    over25: number;
  };
}

export const MOCK_MATCH_DETAIL: MatchDetail = {
  match: MOCK_MATCHES[0],
  h2h: {
    homeWins: 8,
    draws: 5,
    awayWins: 7,
    lastMatches: [
      { date: "2026-01-18", home: "Chelsea", away: "Arsenal", scoreHome: 1, scoreAway: 2 },
      { date: "2025-11-02", home: "Arsenal", away: "Chelsea", scoreHome: 1, scoreAway: 1 },
      { date: "2025-04-20", home: "Chelsea", away: "Arsenal", scoreHome: 0, scoreAway: 3 },
      { date: "2024-10-28", home: "Arsenal", away: "Chelsea", scoreHome: 2, scoreAway: 1 },
      { date: "2024-04-14", home: "Chelsea", away: "Arsenal", scoreHome: 2, scoreAway: 2 },
    ],
  },
  standings: {
    home: { pos: 1, played: 30, won: 22, drawn: 5, lost: 3, gf: 68, ga: 22, gd: 46, pts: 71 },
    away: { pos: 4, played: 30, won: 17, drawn: 6, lost: 7, gf: 55, ga: 34, gd: 21, pts: 57 },
  },
  stats: {
    homeGoalsScored: 68,
    homeGoalsConceded: 22,
    awayGoalsScored: 55,
    awayGoalsConceded: 34,
    homeCleanSheets: 14,
    awayCleanSheets: 9,
    homeAvgGoals: 2.27,
    awayAvgGoals: 1.83,
    homePossession: 58,
    awayPossession: 54,
    homeShotsPerGame: 16.2,
    awayShotsPerGame: 13.8,
  },
  prediction: {
    homeWin: 52,
    draw: 24,
    awayWin: 24,
    btts: 58,
    over25: 62,
  },
};
