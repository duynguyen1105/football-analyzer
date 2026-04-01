"use client";

interface TeamSeasonSummaryProps {
  standing: {
    won: number;
    draw: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    playedGames: number;
    points: number;
    position: number;
  } | null;
  teamName: string;
}

export function TeamSeasonSummary({
  standing,
  teamName,
}: TeamSeasonSummaryProps) {
  if (!standing) return null;

  const avgGoals = (standing.goalsFor / standing.playedGames).toFixed(1);

  return (
    <div className="rounded-xl bg-bg-card border border-border px-4 py-3">
      <p className="text-xs text-text-muted mb-2 font-medium">{teamName}</p>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Position badge */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/15 text-accent text-sm font-bold flex-shrink-0">
          {standing.position}
        </div>

        {/* Record */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-accent font-semibold">{standing.won}T</span>
          <span className="text-accent-yellow font-semibold">
            {standing.draw}H
          </span>
          <span className="text-accent-red font-semibold">
            {standing.lost}B
          </span>
        </div>

        {/* Divider */}
        <span className="text-border">|</span>

        {/* Goals */}
        <span className="text-xs text-text-secondary">
          {standing.goalsFor} ghi / {standing.goalsAgainst} thua
        </span>

        {/* Divider */}
        <span className="text-border">|</span>

        {/* Points */}
        <span className="text-sm font-bold text-text-primary">
          {standing.points}{" "}
          <span className="text-text-muted font-normal text-xs">điểm</span>
        </span>

        {/* Divider */}
        <span className="text-border">|</span>

        {/* Average goals */}
        <span className="text-xs text-text-muted">
          ~{avgGoals} bàn/trận
        </span>
      </div>
    </div>
  );
}
