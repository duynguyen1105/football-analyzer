"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LEAGUES } from "@/lib/constants";
import { Match } from "@/lib/types";
import { FavoriteButton } from "@/components/FavoriteButton";
import { OptImage } from "@/components/OptImage";
import { getRelativeTime } from "@/lib/relative-time";
import Link from "next/link";

export function MatchCard({ match }: { match: Match }) {
  const league = LEAGUES.find((l) => l.code === match.competition.code);
  const fin = match.status === "FINISHED";
  const live = match.status === "IN_PLAY" || match.status === "LIVE";
  const relTime = !fin && !live ? getRelativeTime(match.date, match.time) : null;
  const isHot = !fin && (match.competition.code === "CL" || match.competition.code === "WC");
  const queryClient = useQueryClient();
  const [h2hHint, setH2hHint] = useState<string | null>(null);

  // Prefetch match data on hover so detail page loads instantly
  const prefetch = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ["match", String(match.id), "core"],
      queryFn: () => fetch(`/api/match?id=${match.id}&section=core`).then((r) => r.json()),
      staleTime: 5 * 60 * 1000,
    }).then(() => {
      const cached = queryClient.getQueryData<{ h2h?: { lastMatches?: { scoreHome: number; scoreAway: number }[] } }>(["match", String(match.id), "core"]);
      const last = cached?.h2h?.lastMatches?.[0];
      if (last) setH2hHint(`Gần nhất: ${last.scoreHome}-${last.scoreAway}`);
    });
  }, [match.id, queryClient]);

  return (
    <Link
      href={`/match/${match.id}`}
      className="block bg-bg-card rounded-lg border border-border hover:border-accent/30 card-hover"
      onMouseEnter={prefetch}
      onTouchStart={prefetch}
    >
      {/* League header */}
      <div className="px-3 py-1.5 border-b border-border/50 text-[10px] md:text-xs text-text-muted flex items-center gap-1.5">
        {league?.logo && <img src={league.logo} alt="" className="w-4 h-4 object-contain" />}
        <span className="truncate flex-1">{match.competition.name}</span>
        {live && <span className="text-[9px] font-semibold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-full animate-pulse">LIVE</span>}
        {isHot && <span className="text-[9px]">🔥</span>}
        <FavoriteButton teamId={match.homeTeam.id} />
        <FavoriteButton teamId={match.awayTeam.id} />
      </div>

      {/* Mobile: row-based layout */}
      <div className="md:hidden">
        <div className="flex items-center gap-3 px-3 py-2 border-b border-border/20">
          <img src={match.homeTeam.crest} alt="" className="w-7 h-7 object-contain shrink-0" loading="lazy" />
          <span className="text-sm font-medium flex-1 truncate">{match.homeTeam.shortName}</span>
          {(fin || live) && match.score ? <span className={`text-sm font-bold w-6 text-right ${live ? "text-accent" : ""}`}>{match.score.home}</span> : null}
        </div>
        <div className="flex items-center gap-3 px-3 py-2 border-b border-border/20">
          <img src={match.awayTeam.crest} alt="" className="w-7 h-7 object-contain shrink-0" loading="lazy" />
          <span className="text-sm font-medium flex-1 truncate">{match.awayTeam.shortName}</span>
          {(fin || live) && match.score ? <span className={`text-sm font-bold w-6 text-right ${live ? "text-accent" : ""}`}>{match.score.away}</span> : null}
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs text-text-muted">
            {fin ? "KT" : match.time} · {match.date}
            {relTime && <span className="text-accent ml-1.5">· {relTime}</span>}
          </span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${live ? "text-red-400 bg-red-400/10" : "text-accent bg-accent/10"}`}>{live ? "Trực tiếp" : fin ? "Xem lại" : "Phân tích"}</span>
        </div>
      </div>

      {/* Desktop: classic horizontal layout */}
      <div className="hidden md:block p-4">
        <div className="grid grid-cols-3 items-center">
          <div className="text-center">
            <OptImage src={match.homeTeam.crest} alt={match.homeTeam.shortName} size={48} className="w-12 h-12 object-contain mx-auto mb-1" />
            <p className="font-semibold text-sm">{match.homeTeam.shortName}</p>
          </div>
          <div className="text-center">
            {(fin || live) && match.score ? (
              <p className={`text-xl font-bold ${live ? "text-accent" : ""}`}>{match.score.home} - {match.score.away}</p>
            ) : (
              <p className="text-xl font-bold">{match.time}</p>
            )}
            <p className="text-xs text-text-muted mt-0.5">{match.date}</p>
            <span className="inline-block mt-2 text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
              {fin ? "Xem lại" : "Phân tích"}
            </span>
            {h2hHint && <p className="text-[10px] text-text-muted mt-1">{h2hHint}</p>}
          </div>
          <div className="text-center">
            <OptImage src={match.awayTeam.crest} alt={match.awayTeam.shortName} size={48} className="w-12 h-12 object-contain mx-auto mb-1" />
            <p className="font-semibold text-sm">{match.awayTeam.shortName}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function MatchSkeleton() {
  return (
    <div className="bg-bg-card rounded-lg border border-border">
      <div className="px-3 py-1.5 border-b border-border/50">
        <div className="h-3 w-24 bg-border/30 rounded animate-pulse" />
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-border/20">
          <div className="w-7 h-7 bg-border/20 rounded-full animate-pulse shrink-0" />
          <div className="h-3.5 flex-1 bg-border/30 rounded animate-pulse" />
        </div>
      ))}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="h-3 w-20 bg-border/20 rounded animate-pulse" />
        <div className="h-4 w-14 bg-border/10 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
