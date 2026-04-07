"use client";

import { useMatches } from "@/lib/hooks";
import { Match } from "@/lib/types";
import Link from "next/link";

export function RelatedMatches({
  currentMatchId,
  leagueCode,
}: {
  currentMatchId: number;
  leagueCode: string;
}) {
  const { data: matches } = useMatches();

  if (!matches) return null;

  const related = matches
    .filter(
      (m: Match) =>
        m.competition.code === leagueCode && m.id !== currentMatchId
    )
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />
        Trận đấu cùng giải
      </h3>
      <div className="space-y-2">
        {related.map((m: Match) => {
          const fin = m.status === "FINISHED";
          return (
            <Link
              key={m.id}
              href={`/match/${m.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-primary/50 transition-colors"
            >
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <img
                  src={m.homeTeam.crest}
                  alt=""
                  className="w-4 h-4 object-contain shrink-0"
                />
                <span className="text-xs truncate">{m.homeTeam.shortName}</span>
              </div>
              <div className="text-center shrink-0 px-2">
                {fin && m.score ? (
                  <span className="text-xs font-bold">
                    {m.score.home} - {m.score.away}
                  </span>
                ) : (
                  <span className="text-[10px] text-accent font-medium">
                    {m.time}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                <span className="text-xs truncate text-right">
                  {m.awayTeam.shortName}
                </span>
                <img
                  src={m.awayTeam.crest}
                  alt=""
                  className="w-4 h-4 object-contain shrink-0"
                />
              </div>
              <span className="text-[9px] text-text-muted shrink-0">
                {m.date}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
