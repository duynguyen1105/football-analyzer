import { League } from "./types";

export const LEAGUES: League[] = [
  {
    code: "PL",
    id: 2021,
    name: "Premier League",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  },
  {
    code: "PD",
    id: 2014,
    name: "La Liga",
    country: "Spain",
    flag: "🇪🇸",
  },
  {
    code: "SA",
    id: 2019,
    name: "Serie A",
    country: "Italy",
    flag: "🇮🇹",
  },
  {
    code: "BL1",
    id: 2002,
    name: "Bundesliga",
    country: "Germany",
    flag: "🇩🇪",
  },
  {
    code: "FL1",
    id: 2015,
    name: "Ligue 1",
    country: "France",
    flag: "🇫🇷",
  },
];

export const COMPETITION_CODES = LEAGUES.map((l) => l.code).join(",");
