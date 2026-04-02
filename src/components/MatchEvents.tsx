"use client";

import { useMatchEvents } from "@/lib/hooks";
import Link from "next/link";

interface MatchEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
  comments: string | null;
}

function EventIcon({ type, detail }: { type: string; detail: string }) {
  if (type === "Goal") {
    if (detail === "Own Goal") return <span className="text-sm">⚽</span>;
    if (detail === "Penalty") return <span className="text-sm">⚽</span>;
    if (detail === "Missed Penalty") return <span className="text-sm opacity-40">⚽</span>;
    return <span className="text-sm">⚽</span>;
  }
  if (type === "Card") {
    if (detail === "Yellow Card") return <span className="inline-block w-3 h-4 bg-yellow-400 rounded-sm" />;
    if (detail === "Red Card") return <span className="inline-block w-3 h-4 bg-red-500 rounded-sm" />;
    if (detail === "Second Yellow card") {
      return (
        <span className="flex gap-0.5">
          <span className="inline-block w-2.5 h-3.5 bg-yellow-400 rounded-sm" />
          <span className="inline-block w-2.5 h-3.5 bg-red-500 rounded-sm" />
        </span>
      );
    }
    return <span className="inline-block w-3 h-4 bg-yellow-400 rounded-sm" />;
  }
  if (type === "subst") return <span className="text-sm text-green-400">&#8644;</span>;
  if (type === "Var") return <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-1 rounded">VAR</span>;
  return null;
}

function PlayerLink({ id, name }: { id: number; name: string }) {
  if (!id) return <span>{name}</span>;
  return (
    <Link href={`/cau-thu/${id}`} className="hover:text-accent transition-colors">
      {name}
    </Link>
  );
}

function EventContent({ event }: { event: MatchEvent }) {
  let suffix = "";
  if (event.type === "Goal" && event.detail === "Own Goal") suffix = " (phản lưới)";
  if (event.type === "Goal" && event.detail === "Penalty") suffix = " (pen)";
  if (event.type === "Goal" && event.detail === "Missed Penalty") suffix = " (hỏng pen)";

  if (event.type === "subst") {
    return (
      <p className="text-xs leading-relaxed">
        <span className="text-green-400"><PlayerLink id={event.player.id} name={event.player.name} /></span>
        {event.assist.name && (
          <> <span className="text-red-400/70">&#8592; <PlayerLink id={event.assist.id ?? 0} name={event.assist.name} /></span></>
        )}
      </p>
    );
  }

  return (
    <p className="text-xs leading-relaxed">
      <span className="font-medium"><PlayerLink id={event.player.id} name={event.player.name} /></span>
      {suffix}
      {event.type === "Goal" && event.assist.name && (
        <span className="text-text-muted"> (kt: <PlayerLink id={event.assist.id ?? 0} name={event.assist.name} />)</span>
      )}
    </p>
  );
}

function TimelineSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 border-t border-dashed border-border/50" />
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
      <div className="flex-1 border-t border-dashed border-border/50" />
    </div>
  );
}

export function MatchEvents({
  matchId,
  homeTeamId,
  awayTeamId,
}: {
  matchId: string;
  homeTeamId: number;
  awayTeamId: number;
}) {
  const { data: events, isLoading } = useMatchEvents(matchId);

  if (isLoading) {
    return (
      <section className="bg-bg-card rounded-2xl border border-border p-5">
        <div className="h-4 w-32 bg-border/40 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-border/15 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!events || events.length === 0) return null;

  // Sort by time
  const sorted = [...events].sort(
    (a: MatchEvent, b: MatchEvent) =>
      a.time.elapsed - b.time.elapsed ||
      (a.time.extra ?? 0) - (b.time.extra ?? 0)
  );

  // Split into halves
  const firstHalf = sorted.filter((e: MatchEvent) => e.time.elapsed <= 45 || (e.time.elapsed === 45 && e.time.extra != null));
  const secondHalf = sorted.filter((e: MatchEvent) => e.time.elapsed > 45 || (e.time.elapsed === 45 && e.time.extra == null && !firstHalf.includes(e)));
  // Re-filter: some events at exactly 45 could go either way, just use elapsed > 45 for second half
  const fh = sorted.filter((e: MatchEvent) => e.time.elapsed <= 45);
  const sh = sorted.filter((e: MatchEvent) => e.time.elapsed > 45);

  return (
    <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Diễn biến trận đấu
      </h3>

      <div className="relative">
        {/* Central timeline line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/30 -translate-x-1/2 hidden md:block" />

        {fh.length > 0 && (
          <>
            <TimelineSeparator label="Hiệp 1" />
            {fh.map((event: MatchEvent, i: number) => (
              <TimelineRow key={`fh-${i}`} event={event} isHome={event.team.id === homeTeamId} />
            ))}
          </>
        )}

        {sh.length > 0 && (
          <>
            <TimelineSeparator label="Hiệp 2" />
            {sh.map((event: MatchEvent, i: number) => (
              <TimelineRow key={`sh-${i}`} event={event} isHome={event.team.id === homeTeamId} />
            ))}
          </>
        )}
      </div>
    </section>
  );
}

function TimelineRow({ event, isHome }: { event: MatchEvent; isHome: boolean }) {
  const timeStr = event.time.extra
    ? `${event.time.elapsed}+${event.time.extra}'`
    : `${event.time.elapsed}'`;

  const isGoal = event.type === "Goal";
  const rowBg = isGoal ? "bg-accent/5" : "";

  return (
    <div className={`flex items-center gap-2 py-2 px-1 rounded-lg ${rowBg}`}>
      {/* Home side (right-aligned content) */}
      <div className={`flex-1 min-w-0 ${isHome ? "" : "invisible"}`}>
        <div className="flex items-center gap-2 justify-end">
          <EventContent event={event} />
          <EventIcon type={event.type} detail={event.detail} />
        </div>
      </div>

      {/* Center time badge */}
      <div className="w-12 md:w-14 shrink-0 text-center">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
          isGoal ? "bg-accent/20 text-accent" : "text-text-muted"
        }`}>
          {timeStr}
        </span>
      </div>

      {/* Away side (left-aligned content) */}
      <div className={`flex-1 min-w-0 ${isHome ? "invisible" : ""}`}>
        <div className="flex items-center gap-2">
          <EventIcon type={event.type} detail={event.detail} />
          <EventContent event={event} />
        </div>
      </div>
    </div>
  );
}
