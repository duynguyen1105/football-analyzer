"use client";

import { useMemo } from "react";
import { Match } from "@/lib/types";
import { LEAGUES } from "@/lib/constants";
import Link from "next/link";

const LEAGUE_PRIORITY: Record<string, number> = { CL: 5, WC: 5, PL: 4, PD: 3, SA: 3, BL1: 2, FL1: 2, VL: 1 };

export function MatchDayBanner({ matches }: { matches: Match[] }) {
  const nextBig = useMemo(() => {
    if (!matches) return null;

    // Compare epoch ms directly. matchTime is a real GMT+7-anchored timestamp;
    // Date.now() is real epoch ms. No offset shifting needed.
    const nowMs = Date.now();

    const upcoming = matches
      .filter((m) => m.status === "SCHEDULED")
      .map((m) => {
        const matchTime = new Date(`${m.date}T${m.time}:00+07:00`);
        const diffMin = (matchTime.getTime() - nowMs) / 60000;
        return { match: m, diffMin, priority: LEAGUE_PRIORITY[m.competition.code] || 1 };
      })
      .filter((m) => m.diffMin > 0 && m.diffMin <= 360) // within 6 hours
      .sort((a, b) => b.priority - a.priority || a.diffMin - b.diffMin);

    return upcoming[0] || null;
  }, [matches]);

  if (!nextBig) return null;

  const { match, diffMin } = nextBig;
  const league = LEAGUES.find((l) => l.code === match.competition.code);
  const hours = Math.floor(diffMin / 60);
  const mins = Math.round(diffMin % 60);
  const timeStr = hours > 0 ? `${hours} giờ ${mins > 0 ? `${mins} phút` : ""}` : `${mins} phút`;

  return (
    <Link
      href={`/match/${match.id}`}
      className="block bg-gradient-to-r from-accent/10 via-accent/5 to-accent-2/10 border border-accent/20 rounded-xl p-3 mb-4 hover:border-accent/40 transition-colors animate-fade-in"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0">
          {league?.logo && <img src={league.logo} alt="" className="w-5 h-5 object-contain" />}
          <span className="text-xs text-text-muted">{match.competition.name}</span>
        </div>
        <div className="flex-1 min-w-0 text-center">
          <p className="text-sm font-semibold truncate">
            {match.homeTeam.shortName} vs {match.awayTeam.shortName}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-medium text-accent">Còn {timeStr}</p>
          <p className="text-[10px] text-text-muted">{match.time}</p>
        </div>
      </div>
    </Link>
  );
}
