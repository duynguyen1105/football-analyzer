"use client";

import { useStandings } from "@/lib/hooks";
import { LEAGUES } from "@/lib/constants";
import { getSlugByCode } from "@/lib/league-slugs";
import { Standing } from "@/lib/types";
import Link from "next/link";

export function StandingsCard({ league }: { league: (typeof LEAGUES)[number] }) {
  const { data: standings, isLoading } = useStandings(league.code);
  const rows = (standings || []).slice(0, 5);

  if (isLoading) {
    return (
      <div className="bg-bg-card rounded-lg border border-border p-3 space-y-2">
        <div className="h-4 w-28 bg-border/40 rounded animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-3.5 bg-border/20 rounded animate-pulse" />
        ))}
      </div>
    );
  }
  if (rows.length === 0) return null;

  return (
    <div className="bg-bg-card rounded-lg border border-border p-3">
      <Link href={`/giai-dau/${getSlugByCode(league.code) || league.code}`}>
        <h3 className="font-semibold text-xs mb-2 hover:text-accent transition-colors flex items-center gap-1.5">
          <img src={league.logo} alt="" className="w-5 h-5 object-contain" />
          {league.name}
        </h3>
      </Link>
      <table className="w-full text-[11px]">
        <thead>
          <tr className="text-text-muted">
            <th className="text-left py-0.5 w-5">#</th>
            <th className="text-left py-0.5">Đội</th>
            <th className="text-center py-0.5 w-6">Tr</th>
            <th className="text-center py-0.5 w-7">HS</th>
            <th className="text-center py-0.5 w-6 text-text-secondary font-bold">Đ</th>
          </tr>
        </thead>
        <tbody className="text-text-secondary">
          {rows.map((r: Standing) => (
            <tr key={r.team.id} className="border-t border-border/30">
              <td className="py-1 text-text-muted">{r.position}</td>
              <td className="py-1">
                <div className="flex items-center gap-1">
                  <img src={r.team.crest} alt="" className="w-3.5 h-3.5 object-contain shrink-0" />
                  <span className="text-text-primary font-medium truncate">{r.team.shortName}</span>
                </div>
              </td>
              <td className="py-1 text-center">{r.playedGames}</td>
              <td className="py-1 text-center">{r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}</td>
              <td className="py-1 text-center font-bold text-text-primary">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href={`/giai-dau/${getSlugByCode(league.code) || league.code}`} className="block text-center text-[10px] text-accent mt-2 hover:underline">
        Xem đầy đủ &rarr;
      </Link>
    </div>
  );
}
