"use client";

import { useQuery } from "@tanstack/react-query";

interface RecentResultsProps {
  matchId: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
}

interface RawMatch {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: { id: number; name: string; shortName: string; crest: string };
  awayTeam: { id: number; name: string; shortName: string; crest: string };
  score: { fullTime: { home: number | null; away: number | null } };
}

interface ParsedResult {
  id: number;
  date: string;
  opponentName: string;
  opponentCrest: string;
  teamGoals: number;
  opponentGoals: number;
  result: "W" | "D" | "L";
  isHome: boolean;
}

function useRecentResults(teamId: number) {
  return useQuery<RawMatch[]>({
    queryKey: ["recentResults", teamId],
    queryFn: () =>
      fetch(`/api/match/recent?teamId=${teamId}&limit=5`).then((r) =>
        r.json()
      ),
    staleTime: 60 * 60 * 1000,
  });
}

function parseResults(teamId: number, matches: RawMatch[]): ParsedResult[] {
  return matches
    .filter((m) => m.status === "FINISHED" && m.score?.fullTime)
    .sort(
      (a, b) =>
        new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime()
    )
    .slice(0, 5)
    .map((m) => {
      const isHome = m.homeTeam.id === teamId;
      const teamGoals = isHome
        ? (m.score.fullTime.home ?? 0)
        : (m.score.fullTime.away ?? 0);
      const opponentGoals = isHome
        ? (m.score.fullTime.away ?? 0)
        : (m.score.fullTime.home ?? 0);
      const opponent = isHome ? m.awayTeam : m.homeTeam;

      let result: "W" | "D" | "L" = "D";
      if (teamGoals > opponentGoals) result = "W";
      else if (teamGoals < opponentGoals) result = "L";

      const utcMs = new Date(m.utcDate).getTime();
      const gmt7 = new Date(utcMs + 7 * 60 * 60 * 1000);
      const day = String(gmt7.getUTCDate()).padStart(2, "0");
      const month = String(gmt7.getUTCMonth() + 1).padStart(2, "0");

      return {
        id: m.id,
        date: `${day}/${month}`,
        opponentName: opponent.shortName || opponent.name,
        opponentCrest: opponent.crest,
        teamGoals,
        opponentGoals,
        result,
        isHome,
      };
    });
}

function ResultIndicator({ result }: { result: "W" | "D" | "L" }) {
  const styles = {
    W: "bg-accent/20 text-accent",
    D: "bg-accent-yellow/20 text-accent-yellow",
    L: "bg-accent-red/20 text-accent-red",
  };
  const labels = { W: "T", D: "H", L: "B" };
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${styles[result]}`}
    >
      {labels[result]}
    </span>
  );
}

function ColumnSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-10 bg-border/30 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}

function TeamColumn({
  teamId,
  teamName,
}: {
  teamId: number;
  teamName: string;
}) {
  const { data, isLoading } = useRecentResults(teamId);

  if (isLoading) return <ColumnSkeleton />;

  const results = data ? parseResults(teamId, data) : [];

  if (results.length === 0) {
    return (
      <p className="text-xs text-text-muted text-center py-4">
        Không có dữ liệu
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-text-secondary text-center mb-2 truncate">
        {teamName}
      </p>
      {results.map((r) => (
        <div
          key={r.id}
          className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-bg-primary/50 text-sm"
        >
          <ResultIndicator result={r.result} />
          <img
            src={r.opponentCrest}
            alt={r.opponentName}
            className="w-5 h-5 object-contain shrink-0"
          />
          <span className="flex-1 truncate text-xs text-text-secondary">
            {r.isHome ? "vs" : "@"} {r.opponentName}
          </span>
          <span className="font-bold text-xs whitespace-nowrap">
            {r.teamGoals} - {r.opponentGoals}
          </span>
          <span className="text-xs text-text-muted w-10 text-right">
            {r.date}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RecentResults({
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
}: RecentResultsProps) {
  return (
    <section className="bg-bg-card rounded-2xl border border-border p-5">
      <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        Kết quả gần đây
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TeamColumn teamId={homeTeamId} teamName={homeTeamName} />
        <TeamColumn teamId={awayTeamId} teamName={awayTeamName} />
      </div>
    </section>
  );
}
