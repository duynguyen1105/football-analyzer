"use client";

import { useMatchLineups } from "@/lib/hooks";
import { MatchLineup } from "@/lib/types";
import Link from "next/link";

export function MatchLineups({ matchId }: { matchId: string }) {
  const { data, isLoading } = useMatchLineups(matchId);

  if (isLoading) {
    return (
      <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
        <div className="h-4 w-40 bg-border/30 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-6 bg-border/20 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  }

  const lineups = (data ?? []) as MatchLineup[];
  if (lineups.length === 0) return null;

  return (
    <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <h3 className="font-bold text-sm mb-3 md:mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-2" />
        Đội hình ra sân
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lineups.map((lineup) => (
          <LineupColumn key={lineup.team.id} lineup={lineup} />
        ))}
      </div>
    </section>
  );
}

function LineupColumn({ lineup }: { lineup: MatchLineup }) {
  return (
    <div>
      {/* Team header + formation */}
      <div className="flex items-center gap-2 mb-3">
        <Link href={`/doi-bong/${lineup.team.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {lineup.team.logo && (
            <img src={lineup.team.logo} alt="" className="w-5 h-5 object-contain" />
          )}
          <span className="text-xs font-semibold text-text-primary">{lineup.team.name}</span>
        </Link>
        {lineup.formation && (
          <span className="text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded-full ml-auto">
            {lineup.formation}
          </span>
        )}
      </div>

      {/* Starting XI */}
      <div className="space-y-1">
        {lineup.startXI.map((p) => (
          <Link
            key={p.id || p.name}
            href={p.id ? `/cau-thu/${p.id}` : "#"}
            className="flex items-center gap-2 py-1 px-2 rounded bg-bg-primary/50 text-xs hover:bg-bg-primary/80 transition-colors"
          >
            <span className="w-5 text-center text-text-muted font-mono text-[10px]">
              {p.number || ""}
            </span>
            <span className="flex-1 truncate text-text-secondary">{p.name}</span>
            <span className="text-[10px] text-text-muted">{p.pos}</span>
          </Link>
        ))}
      </div>

      {/* Substitutes */}
      {lineup.substitutes.length > 0 && (
        <>
          <p className="text-[10px] text-text-muted mt-2 mb-1 uppercase tracking-wide">
            Dự bị
          </p>
          <div className="space-y-0.5">
            {lineup.substitutes.slice(0, 7).map((p) => (
              <Link
                key={p.id || p.name}
                href={p.id ? `/cau-thu/${p.id}` : "#"}
                className="flex items-center gap-2 py-0.5 px-2 text-[11px] text-text-muted hover:text-text-secondary transition-colors"
              >
                <span className="w-5 text-center font-mono text-[10px]">
                  {p.number || ""}
                </span>
                <span className="flex-1 truncate">{p.name}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
