"use client";

import { useQuery } from "@tanstack/react-query";
import { Match, Standing } from "./types";

function getVietnamDate(offsetDays = 0): string {
  const now = new Date();
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  vnTime.setUTCDate(vnTime.getUTCDate() + offsetDays);
  return vnTime.toISOString().slice(0, 10);
}

export function useMatches(customDate?: string) {
  const dateFrom = customDate || getVietnamDate();
  const dateTo = customDate || getVietnamDate(7);

  return useQuery<Match[]>({
    queryKey: ["matches", dateFrom, dateTo],
    queryFn: () =>
      fetch(`/api/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`).then((r) => r.json()),
    staleTime: 30 * 60 * 1000, // 30 min — matches don't change often
  });
}

export function useStandings(code: string) {
  return useQuery<Standing[]>({
    queryKey: ["standings", code],
    queryFn: () =>
      fetch(`/api/standings?code=${code}`).then((r) => r.json()),
    staleTime: 60 * 60 * 1000, // 1 hour — standings update after matches
  });
}

export function useMatchCore(matchId: string, isLive?: boolean) {
  return useQuery({
    queryKey: ["match", matchId, "core"],
    queryFn: () =>
      fetch(`/api/match?id=${matchId}&section=core`).then((r) => r.json()),
    staleTime: isLive ? 30 * 1000 : 30 * 60 * 1000,
    refetchInterval: isLive ? 30 * 1000 : undefined,
  });
}

export function useMatchForm(matchId: string) {
  return useQuery({
    queryKey: ["match", matchId, "form"],
    queryFn: () =>
      fetch(`/api/match?id=${matchId}&section=form`).then((r) => r.json()),
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

export function useMatchH2H(matchId: string) {
  return useQuery({
    queryKey: ["match", matchId, "h2h"],
    queryFn: () =>
      fetch(`/api/match?id=${matchId}&section=h2h`).then((r) => r.json()),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours — historical data
  });
}

export function useMatchTeams(matchId: string) {
  return useQuery({
    queryKey: ["match", matchId, "teams"],
    queryFn: () =>
      fetch(`/api/match?id=${matchId}&section=teams`).then((r) => r.json()),
    staleTime: 4 * 60 * 60 * 1000, // 4 hours — squads rarely change
  });
}

export function useMatchScorers(matchId: string) {
  return useQuery({
    queryKey: ["match", matchId, "scorers"],
    queryFn: () =>
      fetch(`/api/match?id=${matchId}&section=scorers`).then((r) => r.json()),
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

export function useQuickSummary(matchId: string) {
  return useQuery({
    queryKey: ["quick-summary", matchId],
    queryFn: () =>
      fetch(`/api/quick-summary?matchId=${matchId}`).then((r) => r.json()),
    staleTime: 12 * 60 * 60 * 1000, // 12 hours — AI content, cached in Redis
  });
}

export function usePlayerAnalysis(homeTeamId: number, awayTeamId: number) {
  return useQuery({
    queryKey: ["players", homeTeamId, awayTeamId],
    queryFn: () =>
      fetch(`/api/players?homeTeamId=${homeTeamId}&awayTeamId=${awayTeamId}`).then((r) => r.json()),
    staleTime: 4 * 60 * 60 * 1000, // 4 hours — player data is stable
  });
}

export function useTeamRecentDetailed(teamId: number) {
  return useQuery({
    queryKey: ["recent-detailed", teamId],
    queryFn: () =>
      fetch(`/api/match/recent?teamId=${teamId}&limit=10`).then((r) => r.json()),
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

export function useMatchOdds(matchId: string) {
  return useQuery({
    queryKey: ["match", matchId, "odds"],
    queryFn: () =>
      fetch(`/api/match?id=${matchId}&section=odds`).then((r) => r.json()),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useMatchInjuries(matchId: string) {
  return useQuery({
    queryKey: ["match", matchId, "injuries"],
    queryFn: () =>
      fetch(`/api/match?id=${matchId}&section=injuries`).then((r) => r.json()),
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

export function useMatchLineups(matchId: string) {
  return useQuery({
    queryKey: ["match", matchId, "lineups"],
    queryFn: () =>
      fetch(`/api/match?id=${matchId}&section=lineups`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000, // 5 min — lineups update close to kickoff
  });
}

export function useLiveMatches() {
  return useQuery<Match[]>({
    queryKey: ["live-matches"],
    queryFn: () => fetch("/api/live").then((r) => r.json()),
    staleTime: 30 * 1000, // 30 seconds for live data
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });
}

export function useMatchEvents(matchId: string, isLive?: boolean) {
  return useQuery({
    queryKey: ["match", matchId, "events"],
    queryFn: () =>
      fetch(`/api/match?id=${matchId}&section=events`).then((r) => r.json()),
    staleTime: isLive ? 15 * 1000 : 60 * 1000,
    refetchInterval: isLive ? 30 * 1000 : undefined,
  });
}

export function useMatchStatistics(matchId: string, isLive?: boolean) {
  return useQuery({
    queryKey: ["match", matchId, "statistics"],
    queryFn: () =>
      fetch(`/api/match?id=${matchId}&section=statistics`).then((r) => r.json()),
    staleTime: isLive ? 30 * 1000 : 5 * 60 * 1000,
    refetchInterval: isLive ? 60 * 1000 : undefined,
  });
}

export function useMatchPerformers(matchId: string) {
  return useQuery({
    queryKey: ["match", matchId, "performers"],
    queryFn: () =>
      fetch(`/api/match?id=${matchId}&section=performers`).then((r) => r.json()),
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

export function useTopAssists(leagueCode: string) {
  return useQuery({
    queryKey: ["top-assists", leagueCode],
    queryFn: () =>
      fetch(`/api/top-assists?code=${leagueCode}`).then((r) => r.json()),
    staleTime: 30 * 60 * 1000, // 30 min
  });
}

// Player hooks
export function usePlayerProfile(playerId: string) {
  return useQuery({
    queryKey: ["player", playerId, "profile"],
    queryFn: () =>
      fetch(`/api/player?id=${playerId}&section=profile`).then((r) => r.json()),
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

export function usePlayerTransfers(playerId: string) {
  return useQuery({
    queryKey: ["player", playerId, "transfers"],
    queryFn: () =>
      fetch(`/api/player?id=${playerId}&section=transfers`).then((r) => r.json()),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function usePlayerTrophies(playerId: string) {
  return useQuery({
    queryKey: ["player", playerId, "trophies"],
    queryFn: () =>
      fetch(`/api/player?id=${playerId}&section=trophies`).then((r) => r.json()),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// Team hooks
export function useTeamProfile(teamId: string) {
  return useQuery({
    queryKey: ["team", teamId, "profile"],
    queryFn: () =>
      fetch(`/api/team?id=${teamId}&section=profile`).then((r) => r.json()),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useTeamStats(teamId: string, leagueId: number) {
  return useQuery({
    queryKey: ["team", teamId, "stats", leagueId],
    queryFn: () =>
      fetch(`/api/team?id=${teamId}&section=stats&leagueId=${leagueId}`).then((r) => r.json()),
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

export function useTeamSquad(teamId: string) {
  return useQuery({
    queryKey: ["team", teamId, "squad"],
    queryFn: () =>
      fetch(`/api/team?id=${teamId}&section=squad`).then((r) => r.json()),
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

export function useTeamRecent(teamId: string) {
  return useQuery({
    queryKey: ["team", teamId, "recent"],
    queryFn: () =>
      fetch(`/api/team?id=${teamId}&section=recent`).then((r) => r.json()),
    staleTime: 30 * 60 * 1000, // 30 min
  });
}

export function useTeamFixtures(teamId: string) {
  return useQuery<{ recent: any[]; upcoming: any[] }>({
    queryKey: ["team", teamId, "fixtures"],
    queryFn: () =>
      fetch(`/api/team?id=${teamId}&section=fixtures`).then((r) => r.json()),
    staleTime: 30 * 60 * 1000,
  });
}
