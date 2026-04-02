import { Standing } from "@/lib/types";
import Link from "next/link";

/**
 * Horizontal bar chart showing all teams' points in the league.
 * Visual overview of the standings race.
 */
export function StandingsChart({ standings }: { standings: Standing[] }) {
  if (!standings || standings.length === 0) return null;

  const maxPoints = Math.max(...standings.map((s) => s.points), 1);
  const totalTeams = standings.length;

  // Zone thresholds
  const championsZone = Math.min(4, Math.ceil(totalTeams * 0.2));
  const relegationZone = totalTeams - Math.max(3, Math.ceil(totalTeams * 0.15));

  return (
    <section className="mb-8">
      <h2 className="text-base font-bold mb-3">Cuộc đua điểm số</h2>
      <div className="bg-bg-card rounded-2xl border border-border p-4">
        <div className="space-y-1.5">
          {standings.map((s) => {
            const pct = (s.points / maxPoints) * 100;
            const isChampions = s.position <= championsZone;
            const isRelegation = s.position > relegationZone;

            const barColor = isChampions
              ? "bg-green-500/70"
              : isRelegation
                ? "bg-red-500/60"
                : "bg-accent-2/50";

            return (
              <Link
                key={s.team.id}
                href={`/doi-bong/${s.team.id}`}
                className="flex items-center gap-2 group hover:bg-bg-primary/50 rounded px-1 py-0.5 transition-colors"
              >
                <span className="w-4 text-[10px] text-text-muted text-right shrink-0">
                  {s.position}
                </span>
                <img
                  src={s.team.crest}
                  alt=""
                  className="w-4 h-4 object-contain shrink-0"
                />
                <span className="w-16 sm:w-20 text-[10px] font-medium truncate shrink-0 group-hover:text-accent transition-colors">
                  {s.team.tla || s.team.shortName}
                </span>
                <div className="flex-1 h-4 bg-border/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  />
                </div>
                <span className="w-7 text-[10px] font-bold text-right shrink-0">
                  {s.points}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3 pt-3 border-t border-border/30 text-[9px] text-text-muted justify-center">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-green-500/70 rounded-sm" /> Champions League
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-accent-2/50 rounded-sm" /> Giữa bảng
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-red-500/60 rounded-sm" /> Xuống hạng
          </span>
        </div>
      </div>
    </section>
  );
}
