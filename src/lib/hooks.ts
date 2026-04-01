"use client";

import { useQuery } from "@tanstack/react-query";
import { Match, Standing } from "./types";

function getVietnamDate(offsetDays = 0): string {
  const now = new Date();
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  vnTime.setUTCDate(vnTime.getUTCDate() + offsetDays);
  return vnTime.toISOString().slice(0, 10);
}

export function useMatches() {
  const dateFrom = getVietnamDate();
  const dateTo = getVietnamDate(7);

  return useQuery<Match[]>({
    queryKey: ["matches", dateFrom, dateTo],
    queryFn: () =>
      fetch(`/api/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`).then((r) =>
        r.json()
      ),
  });
}

export function useStandings(code: string) {
  return useQuery<Standing[]>({
    queryKey: ["standings", code],
    queryFn: () =>
      fetch(`/api/standings?code=${code}`).then((r) => r.json()),
    staleTime: 30 * 60 * 1000, // 30 min
  });
}

export function useMatchCore(matchId: string) {
  return useQuery({
    queryKey: ["match", matchId, "core"],
    queryFn: () =>
      fetch(`/api/match?id=${matchId}&section=core`).then((r) => r.json()),
  });
}

export function useMatchForm(matchId: string) {
  return useQuery({
    queryKey: ["match", matchId, "form"],
    queryFn: () =>
      fetch(`/api/match?id=${matchId}&section=form`).then((r) => r.json()),
    staleTime: 60 * 60 * 1000,
  });
}

export function useMatchH2H(matchId: string) {
  return useQuery({
    queryKey: ["match", matchId, "h2h"],
    queryFn: () =>
      fetch(`/api/match?id=${matchId}&section=h2h`).then((r) => r.json()),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useMatchTeams(matchId: string) {
  return useQuery({
    queryKey: ["match", matchId, "teams"],
    queryFn: () =>
      fetch(`/api/match?id=${matchId}&section=teams`).then((r) => r.json()),
    staleTime: 2 * 60 * 60 * 1000,
  });
}

export function useMatchScorers(matchId: string) {
  return useQuery({
    queryKey: ["match", matchId, "scorers"],
    queryFn: () =>
      fetch(`/api/match?id=${matchId}&section=scorers`).then((r) => r.json()),
    staleTime: 60 * 60 * 1000,
  });
}

export function useQuickSummary(matchId: string) {
  return useQuery({
    queryKey: ["quick-summary", matchId],
    queryFn: () =>
      fetch(`/api/quick-summary?matchId=${matchId}`).then((r) => r.json()),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
  });
}
