export interface Match {
  id: number; // Football-Data.org match ID
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
  coach: { name: string; nationality: string } | null;
  squad: { id: number; name: string; position: string; nationality: string; dateOfBirth?: string }[];
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
    name: string;
    team: string;
    goals: number;
    assists: number | null;
    nationality: string;
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
}
