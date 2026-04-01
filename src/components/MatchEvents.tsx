"use client";

import { useMatchEvents } from "@/lib/hooks";

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
    if (detail === "Own Goal") {
      return <span className="text-red-400">⚽</span>;
    }
    if (detail === "Penalty") {
      return <span>⚽🎯</span>;
    }
    return <span>⚽</span>;
  }
  if (type === "Card") {
    if (detail === "Yellow Card") {
      return <span className="inline-block w-3 h-4 bg-yellow-400 rounded-sm" />;
    }
    if (detail === "Red Card") {
      return <span className="inline-block w-3 h-4 bg-red-500 rounded-sm" />;
    }
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
  if (type === "subst") {
    return <span className="text-green-400">↔</span>;
  }
  if (type === "Var") {
    return <span className="text-blue-400">📺</span>;
  }
  return null;
}

function EventDetail({ event }: { event: MatchEvent }) {
  const timeStr = event.time.extra
    ? `${event.time.elapsed}+${event.time.extra}'`
    : `${event.time.elapsed}'`;

  let description = event.player.name;
  if (event.type === "Goal" && event.assist.name) {
    description += ` (kiến tạo: ${event.assist.name})`;
  }
  if (event.type === "subst" && event.assist.name) {
    description = `${event.assist.name} → ${event.player.name}`;
  }
  if (event.type === "Goal" && event.detail === "Own Goal") {
    description += " (phản lưới)";
  }
  if (event.type === "Goal" && event.detail === "Penalty") {
    description += " (penalty)";
  }

  const typeLabel =
    event.type === "Goal"
      ? "Bàn thắng"
      : event.type === "Card"
        ? event.detail === "Yellow Card"
          ? "Thẻ vàng"
          : event.detail === "Red Card"
            ? "Thẻ đỏ"
            : "Thẻ phạt"
        : event.type === "subst"
          ? "Thay người"
          : event.type === "Var"
            ? "VAR"
            : event.type;

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-10 text-center shrink-0">
        <span className="text-xs font-bold text-accent">{timeStr}</span>
      </div>
      <div className="w-6 shrink-0 flex justify-center pt-0.5">
        <EventIcon type={event.type} detail={event.detail} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <img src={event.team.logo} alt="" className="w-4 h-4 object-contain" />
          <span className="text-xs text-text-muted">{typeLabel}</span>
        </div>
        <p className="text-sm mt-0.5 truncate">{description}</p>
      </div>
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
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-border/15 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!events || events.length === 0) return null;

  // Filter to show only important events
  const importantEvents = events.filter(
    (e: MatchEvent) => e.type === "Goal" || e.type === "Card" || e.type === "Var"
  );

  if (importantEvents.length === 0) return null;

  return (
    <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Diễn biến trận đấu
      </h3>
      <div className="divide-y divide-border/30">
        {importantEvents.map((event: MatchEvent, i: number) => (
          <EventDetail key={i} event={event} />
        ))}
      </div>
    </section>
  );
}
