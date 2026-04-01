"use client";

import { useTeamRecentDetailed } from "@/lib/hooks";

interface HomeAwayFormProps {
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
}

interface RawMatch {
  id: number;
  status: string;
  homeTeam: { id: number };
  score: { fullTime: { home: number | null; away: number | null } };
}

interface Record {
  wins: number;
  draws: number;
  losses: number;
}

function computeHomeAwayRecord(
  teamId: number,
  matches: RawMatch[]
): { home: Record; away: Record } {
  const home: Record = { wins: 0, draws: 0, losses: 0 };
  const away: Record = { wins: 0, draws: 0, losses: 0 };

  for (const m of matches) {
    if (m.status !== "FINISHED" || !m.score?.fullTime) continue;

    const homeGoals = m.score.fullTime.home ?? 0;
    const awayGoals = m.score.fullTime.away ?? 0;
    const isHome = m.homeTeam.id === teamId;

    const teamGoals = isHome ? homeGoals : awayGoals;
    const oppGoals = isHome ? awayGoals : homeGoals;
    const record = isHome ? home : away;

    if (teamGoals > oppGoals) record.wins++;
    else if (teamGoals === oppGoals) record.draws++;
    else record.losses++;
  }

  return { home, away };
}

function RecordDisplay({ label, record }: { label: string; record: Record }) {
  return (
    <span className="text-xs">
      <span className="text-text-muted">{label}: </span>
      <span className="text-accent font-semibold">{record.wins}T</span>
      <span className="text-text-muted">-</span>
      <span className="text-accent-yellow font-semibold">{record.draws}H</span>
      <span className="text-text-muted">-</span>
      <span className="text-accent-red font-semibold">{record.losses}B</span>
    </span>
  );
}

function TeamRow({
  teamId,
  teamName,
}: {
  teamId: number;
  teamName: string;
}) {
  const { data, isLoading } = useTeamRecentDetailed(teamId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="h-4 w-full bg-border/20 rounded animate-pulse" />
      </div>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  const { home, away } = computeHomeAwayRecord(teamId, data);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 py-1.5">
      <span className="text-xs font-semibold text-text-primary min-w-[80px] truncate">
        {teamName}
      </span>
      <RecordDisplay label="Nhà" record={home} />
      <span className="text-text-muted text-xs">|</span>
      <RecordDisplay label="Khách" record={away} />
    </div>
  );
}

export function HomeAwayForm({
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
}: HomeAwayFormProps) {
  return (
    <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-2" />
        {"\uD83D\uDCCA"} Phong độ sân nhà / sân khách
      </h3>
      <div className="divide-y divide-border/30">
        <TeamRow teamId={homeTeamId} teamName={homeTeamName} />
        <TeamRow teamId={awayTeamId} teamName={awayTeamName} />
      </div>
    </section>
  );
}
