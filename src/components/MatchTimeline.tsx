"use client";

import { useMatchEvents } from "@/lib/hooks";

interface MatchEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  type: string;
  detail: string;
}

function EventDot({
  event,
  isHome,
  matchMinutes,
}: {
  event: MatchEvent;
  isHome: boolean;
  matchMinutes: number;
}) {
  const minute = event.time.elapsed + (event.time.extra ?? 0);
  const pct = Math.min((minute / matchMinutes) * 100, 100);

  const isGoal = event.type === "Goal" && event.detail !== "Missed Penalty";
  const isCard = event.type === "Card";
  const isRed = event.detail === "Red Card" || event.detail === "Second Yellow card";

  // Position: home on top, away on bottom
  const yPos = isHome ? "-top-5" : "-bottom-5";

  let dotColor = "bg-text-muted/40";
  let dotSize = "w-2 h-2";
  let icon = "";

  if (isGoal) {
    dotColor = "bg-accent";
    dotSize = "w-4 h-4";
    icon = "⚽";
  } else if (isCard && isRed) {
    dotColor = "bg-red-500";
    dotSize = "w-2.5 h-3.5 rounded-sm";
  } else if (isCard) {
    dotColor = "bg-yellow-400";
    dotSize = "w-2.5 h-3.5 rounded-sm";
  }

  const label = `${event.player.name} ${minute}'`;

  return (
    <div
      className={`absolute ${yPos}`}
      style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
      title={label}
    >
      {isGoal ? (
        <span className="text-xs cursor-default">{icon}</span>
      ) : (
        <div className={`${dotSize} ${dotColor} cursor-default`} />
      )}
    </div>
  );
}

export function MatchTimeline({
  matchId,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  isLive,
}: {
  matchId: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  isLive?: boolean;
}) {
  const { data: events } = useMatchEvents(matchId, isLive);

  if (!events || events.length === 0) return null;

  // Filter to meaningful events only
  const meaningful = (events as MatchEvent[]).filter(
    (e) => e.type === "Goal" || e.type === "Card"
  );

  if (meaningful.length === 0) return null;

  // Determine match length (90 or extra time)
  const maxMinute = Math.max(...(events as MatchEvent[]).map((e) => e.time.elapsed + (e.time.extra ?? 0)));
  const matchMinutes = Math.max(90, maxMinute);

  const homeEvents = meaningful.filter((e) => e.team.id === homeTeamId);
  const awayEvents = meaningful.filter((e) => e.team.id === awayTeamId);

  return (
    <div className="bg-bg-card rounded-xl border border-border p-4">
      <p className="text-[10px] text-text-muted uppercase tracking-wide font-semibold mb-3">
        Diễn biến chính
      </p>

      {/* Team labels */}
      <div className="flex justify-between text-[10px] text-text-muted mb-1">
        <span className="text-accent font-medium">{homeTeamName}</span>
        <span className="text-accent-2 font-medium">{awayTeamName}</span>
      </div>

      {/* Timeline bar */}
      <div className="relative mx-2 py-6">
        {/* Main bar */}
        <div className="h-1 bg-border/40 rounded-full relative">
          {/* Half-time marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-text-muted/40"
            style={{ left: `${(45 / matchMinutes) * 100}%` }}
          />
        </div>

        {/* Home events (above bar) */}
        {homeEvents.map((event, i) => (
          <EventDot
            key={`h-${i}`}
            event={event}
            isHome={true}
            matchMinutes={matchMinutes}
          />
        ))}

        {/* Away events (below bar) */}
        {awayEvents.map((event, i) => (
          <EventDot
            key={`a-${i}`}
            event={event}
            isHome={false}
            matchMinutes={matchMinutes}
          />
        ))}
      </div>

      {/* Time markers */}
      <div className="flex justify-between text-[9px] text-text-muted/60 mx-2">
        <span>0&apos;</span>
        <span>45&apos;</span>
        <span>{matchMinutes}&apos;</span>
      </div>

      {/* Legend */}
      <div className="flex gap-3 mt-2 text-[9px] text-text-muted justify-center">
        <span className="flex items-center gap-1">⚽ Bàn thắng</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2.5 bg-yellow-400 rounded-sm inline-block" /> Thẻ vàng
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2.5 bg-red-500 rounded-sm inline-block" /> Thẻ đỏ
        </span>
      </div>
    </div>
  );
}
