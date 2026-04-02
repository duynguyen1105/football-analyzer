"use client";

import { useMatchLineups, useMatchEvents } from "@/lib/hooks";
import { MatchLineup } from "@/lib/types";
import Link from "next/link";
import { useMemo } from "react";

interface PlayerAnnotation {
  goals: number[];       // minutes
  assists: number[];     // minutes
  yellowCard?: number;   // minute
  redCard?: number;      // minute
  subbedOff?: number;    // minute
  subbedOn?: number;     // minute
}

function buildAnnotations(events: any[] | undefined): Map<number, PlayerAnnotation> {
  const map = new Map<number, PlayerAnnotation>();
  if (!events) return map;

  const getOrCreate = (id: number): PlayerAnnotation => {
    if (!map.has(id)) map.set(id, { goals: [], assists: [] });
    return map.get(id)!;
  };

  for (const e of events) {
    const min = e.time?.elapsed ?? 0;
    if (e.type === "Goal" && e.player?.id) {
      getOrCreate(e.player.id).goals.push(min);
      if (e.assist?.id) getOrCreate(e.assist.id).assists.push(min);
    }
    if (e.type === "Card" && e.player?.id) {
      const a = getOrCreate(e.player.id);
      if (e.detail === "Yellow Card") a.yellowCard = min;
      if (e.detail === "Red Card" || e.detail === "Second Yellow card") a.redCard = min;
    }
    if (e.type === "subst") {
      // player = who comes ON, assist = who goes OFF
      if (e.player?.id) getOrCreate(e.player.id).subbedOn = min;
      if (e.assist?.id) getOrCreate(e.assist.id).subbedOff = min;
    }
  }
  return map;
}

function AnnotationBadges({ annotation }: { annotation?: PlayerAnnotation }) {
  if (!annotation) return null;
  const badges: React.ReactNode[] = [];

  for (const min of annotation.goals) {
    badges.push(<span key={`g${min}`} className="text-[10px]" title={`Bàn thắng ${min}'`}>⚽ {min}&apos;</span>);
  }
  for (const min of annotation.assists) {
    badges.push(<span key={`a${min}`} className="text-[10px] text-accent" title={`Kiến tạo ${min}'`}>&#127919; {min}&apos;</span>);
  }
  if (annotation.yellowCard) {
    badges.push(<span key="yc" className="inline-block w-2 h-2.5 bg-yellow-400 rounded-sm" title={`Thẻ vàng ${annotation.yellowCard}'`} />);
  }
  if (annotation.redCard) {
    badges.push(<span key="rc" className="inline-block w-2 h-2.5 bg-red-500 rounded-sm" title={`Thẻ đỏ ${annotation.redCard}'`} />);
  }
  if (annotation.subbedOff) {
    badges.push(<span key="off" className="text-[10px] text-red-400" title={`Ra sân ${annotation.subbedOff}'`}>&#8595; {annotation.subbedOff}&apos;</span>);
  }
  if (annotation.subbedOn) {
    badges.push(<span key="on" className="text-[10px] text-green-400" title={`Vào sân ${annotation.subbedOn}'`}>&#8593; {annotation.subbedOn}&apos;</span>);
  }

  if (badges.length === 0) return null;
  return <div className="flex items-center gap-1.5 ml-auto shrink-0">{badges}</div>;
}

export function MatchLineups({ matchId }: { matchId: string }) {
  const { data, isLoading } = useMatchLineups(matchId);
  const { data: events } = useMatchEvents(matchId);

  const annotations = useMemo(() => buildAnnotations(events), [events]);

  if (isLoading) {
    return (
      <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
        <div className="h-4 w-40 bg-border/30 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="h-7 bg-border/20 rounded animate-pulse" />
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
          <LineupColumn key={lineup.team.id} lineup={lineup} annotations={annotations} />
        ))}
      </div>
    </section>
  );
}

function LineupColumn({ lineup, annotations }: { lineup: MatchLineup; annotations: Map<number, PlayerAnnotation> }) {
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

      {/* Coach */}
      {lineup.coach?.name && (
        <div className="flex items-center gap-2 mb-2 px-2 text-[11px] text-text-muted">
          <span>HLV: {lineup.coach.name}</span>
        </div>
      )}

      {/* Starting XI */}
      <div className="space-y-0.5">
        {lineup.startXI.map((p) => {
          const ann = annotations.get(p.id);
          const hasGoal = ann && ann.goals.length > 0;
          return (
            <Link
              key={p.id || p.name}
              href={p.id ? `/cau-thu/${p.id}` : "#"}
              className={`flex items-center gap-2 py-1.5 px-2 rounded text-xs hover:bg-bg-primary/80 transition-colors ${
                hasGoal ? "bg-accent/5" : "bg-bg-primary/50"
              }`}
            >
              <span className="w-5 text-center text-text-muted font-mono text-[10px]">
                {p.number || ""}
              </span>
              <span className="flex-1 truncate text-text-secondary font-medium">{p.name}</span>
              <span className="text-[10px] text-text-muted mr-1">{p.pos}</span>
              <AnnotationBadges annotation={ann} />
            </Link>
          );
        })}
      </div>

      {/* Substitutes */}
      {lineup.substitutes.length > 0 && (
        <>
          <p className="text-[10px] text-text-muted mt-3 mb-1 uppercase tracking-wide font-semibold">
            Dự bị
          </p>
          <div className="space-y-0.5">
            {lineup.substitutes.map((p) => {
              const ann = annotations.get(p.id);
              const usedSub = ann?.subbedOn != null;
              return (
                <Link
                  key={p.id || p.name}
                  href={p.id ? `/cau-thu/${p.id}` : "#"}
                  className={`flex items-center gap-2 py-1 px-2 text-[11px] rounded hover:bg-bg-primary/50 transition-colors ${
                    usedSub ? "text-text-secondary" : "text-text-muted"
                  }`}
                >
                  <span className="w-5 text-center font-mono text-[10px]">
                    {p.number || ""}
                  </span>
                  <span className="flex-1 truncate">{p.name}</span>
                  <AnnotationBadges annotation={ann} />
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
