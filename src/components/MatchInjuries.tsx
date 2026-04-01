"use client";

import { useMatchInjuries } from "@/lib/hooks";
import { MatchInjury } from "@/lib/types";

export function MatchInjuries({
  matchId,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
}: {
  matchId: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
}) {
  const { data, isLoading } = useMatchInjuries(matchId);

  if (isLoading) {
    return (
      <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
        <div className="h-4 w-48 bg-border/30 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              {[...Array(2)].map((_, j) => (
                <div key={j} className="h-8 bg-border/20 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  }

  const injuries = (data ?? []) as MatchInjury[];
  if (injuries.length === 0) return null;

  const homeInjuries = injuries.filter((i) => i.team.id === homeTeamId);
  const awayInjuries = injuries.filter((i) => i.team.id === awayTeamId);

  if (homeInjuries.length === 0 && awayInjuries.length === 0) return null;

  return (
    <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <h3 className="font-bold text-sm mb-3 md:mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
        Chấn thương / Vắng mặt
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InjuryColumn teamName={homeTeamName} injuries={homeInjuries} />
        <InjuryColumn teamName={awayTeamName} injuries={awayInjuries} />
      </div>
    </section>
  );
}

function InjuryColumn({ teamName, injuries }: { teamName: string; injuries: MatchInjury[] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-text-secondary mb-2">{teamName}</p>
      {injuries.length === 0 ? (
        <p className="text-xs text-text-muted">Không có thông tin</p>
      ) : (
        <div className="space-y-1.5">
          {injuries.map((inj) => (
            <div
              key={inj.player.id}
              className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-bg-primary/50 text-xs"
            >
              {inj.player.photo && (
                <img
                  src={inj.player.photo}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                />
              )}
              <span className="flex-1 truncate text-text-primary">{inj.player.name}</span>
              <span
                className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  inj.type === "Missing Fixture"
                    ? "bg-accent-red/15 text-accent-red"
                    : "bg-accent-yellow/15 text-accent-yellow"
                }`}
              >
                {inj.reason || inj.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
