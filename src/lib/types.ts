export interface Match {
  id: number; // API-Football fixture ID
  competition: { code: string; name: string };
  date: string; // YYYY-MM-DD in GMT+7
  time: string; // HH:MM in GMT+7
  status: string; // SCHEDULED, LIVE, FINISHED, etc
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  venue: string;
  round?: string; // e.g. "Group A - 1", "Quarter-finals", "Regular Season - 10"
  homeForm: string[]; // ["W","D","L",...]
  awayForm: string[];
  score?: { home: number | null; away: number | null };
  referee?: { name: string; nationality: string } | null;
}

export interface Standing {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface TeamInfo {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  venue: string;
  coach: { name: string; nationality: string; photo?: string } | null;
  squad: { id: number; name: string; position: string; nationality: string; photo?: string; dateOfBirth?: string }[];
}

export interface H2HMatch {
  date: string;
  home: string;
  away: string;
  scoreHome: number;
  scoreAway: number;
}

export interface MatchDetail {
  match: Match;
  homeTeamInfo: TeamInfo | null;
  awayTeamInfo: TeamInfo | null;
  h2h: {
    homeWins: number;
    draws: number;
    awayWins: number;
    totalGoals: number;
    lastMatches: H2HMatch[];
  } | null;
  standings: Standing[];
  topScorers: {
    id: number;
    name: string;
    team: string;
    goals: number;
    assists: number | null;
    nationality: string;
    photo?: string;
  }[];
  prediction: {
    homeWin: number;
    draw: number;
    awayWin: number;
    btts: number;
    over25: number;
  };
}

export interface League {
  code: string;
  id: number;
  name: string;
  country: string;
  flag: string;
  logo: string;
  isTournament?: boolean; // true for WC, CL — group stage + knockouts
}

export interface GroupStanding {
  group: string; // "Group A", "Group B", etc.
  standings: Standing[];
}

export interface MatchOdds {
  fixtureId: number;
  bookmakers: {
    name: string;
    bets: {
      name: string;
      values: { value: string; odd: string }[];
    }[];
  }[];
}

export interface MatchInjury {
  player: { id: number; name: string; photo: string };
  team: { id: number; name: string; logo: string };
  type: string;
  reason: string;
}

export interface MatchLineup {
  team: { id: number; name: string; logo: string };
  formation: string;
  coach: { name: string; photo: string };
  startXI: { id: number; name: string; number: number; pos: string }[];
  substitutes: { id: number; name: string; number: number; pos: string }[];
}
