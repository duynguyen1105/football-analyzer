"use client";

import { useMatchLineups } from "@/lib/hooks";
import { MatchLineup } from "@/lib/types";
import Link from "next/link";

/**
 * Parse formation string "4-3-3" → [4, 3, 3]
 * Then map players to rows (GK is always row 0)
 */
function parseFormation(formation: string): number[] {
  return formation.split("-").map(Number).filter((n) => !isNaN(n) && n > 0);
}

/**
 * Arrange players into pitch rows based on formation.
 * Row 0 = GK (1 player), Row 1..N = outfield lines.
 */
function arrangePlayers(
  startXI: MatchLineup["startXI"],
  formation: string
): { id: number; name: string; number: number; pos: string }[][] {
  const lines = parseFormation(formation);
  const rows: typeof startXI[] = [];

  // GK first
  const gk = startXI.filter((p) => p.pos === "G");
  const outfield = startXI.filter((p) => p.pos !== "G");

  rows.push(gk.length > 0 ? gk : [outfield.shift()!].filter(Boolean));

  let idx = 0;
  for (const count of lines) {
    rows.push(outfield.slice(idx, idx + count));
    idx += count;
  }

  // If any players left (formation didn't account for all), add them to last row
  if (idx < outfield.length) {
    rows.push(outfield.slice(idx));
  }

  return rows;
}

function PlayerDot({
  player,
  isAway,
}: {
  player: { id: number; name: string; number: number };
  isAway: boolean;
}) {
  // Shorten name: "M. Salah" or first 8 chars
  const shortName =
    player.name.length <= 8
      ? player.name
      : player.name.includes(" ")
        ? player.name.split(" ").map((w, i) => (i === 0 ? w[0] + "." : w)).join(" ").slice(0, 12)
        : player.name.slice(0, 8);

  return (
    <Link
      href={player.id ? `/cau-thu/${player.id}` : "#"}
      className="flex flex-col items-center gap-0.5 group"
    >
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold border-2 transition-colors ${
          isAway
            ? "bg-accent-2/20 border-accent-2/50 text-accent-2 group-hover:bg-accent-2/30"
            : "bg-accent/20 border-accent/50 text-accent group-hover:bg-accent/30"
        }`}
      >
        {player.number || ""}
      </div>
      <span className="text-[8px] sm:text-[9px] text-text-muted text-center leading-tight max-w-[60px] truncate group-hover:text-text-primary transition-colors">
        {shortName}
      </span>
    </Link>
  );
}

function PitchSide({
  lineup,
  isAway,
}: {
  lineup: MatchLineup;
  isAway: boolean;
}) {
  if (!lineup.formation || lineup.startXI.length === 0) return null;

  const rows = arrangePlayers(lineup.startXI, lineup.formation);

  return (
    <div className={`flex-1 flex flex-col justify-between py-3 px-1 ${isAway ? "flex-col-reverse" : ""}`}>
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-2 sm:gap-4">
          {row.map((p) => (
            <PlayerDot key={p.id || p.name} player={p} isAway={isAway} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function FormationPitch({ matchId }: { matchId: string }) {
  const { data } = useMatchLineups(matchId);

  const lineups = (data ?? []) as MatchLineup[];
  if (lineups.length < 2) return null;
  if (!lineups[0].formation || !lineups[1].formation) return null;

  const home = lineups[0];
  const away = lineups[1];

  return (
    <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
          Sơ đồ chiến thuật
        </h3>
        <div className="flex gap-3 text-[10px] text-text-muted">
          <span className="text-accent font-medium">{home.team.name} ({home.formation})</span>
          <span className="text-accent-2 font-medium">{away.team.name} ({away.formation})</span>
        </div>
      </div>

      {/* Pitch */}
      <div
        className="relative mx-3 mb-3 rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(to bottom, #1a472a 0%, #1d5430 25%, #1a472a 50%, #1d5430 75%, #1a472a 100%)",
          minHeight: "420px",
        }}
      >
        {/* Pitch markings */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Center line */}
          <div className="absolute left-[10%] right-[10%] top-1/2 h-px bg-white/15" />
          {/* Center circle */}
          <div className="absolute left-1/2 top-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2 border border-white/15 rounded-full" />
          {/* Center dot */}
          <div className="absolute left-1/2 top-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 bg-white/20 rounded-full" />
          {/* Top penalty area */}
          <div className="absolute left-1/4 right-1/4 top-0 h-[12%] border-b border-l border-r border-white/15 rounded-b-sm" />
          {/* Bottom penalty area */}
          <div className="absolute left-1/4 right-1/4 bottom-0 h-[12%] border-t border-l border-r border-white/15 rounded-t-sm" />
          {/* Top goal area */}
          <div className="absolute left-[35%] right-[35%] top-0 h-[5%] border-b border-l border-r border-white/10" />
          {/* Bottom goal area */}
          <div className="absolute left-[35%] right-[35%] bottom-0 h-[5%] border-t border-l border-r border-white/10" />
          {/* Pitch border */}
          <div className="absolute inset-[4%] border border-white/15 rounded-sm" />
        </div>

        {/* Players */}
        <div className="relative z-10 flex flex-col h-full" style={{ minHeight: "420px" }}>
          <PitchSide lineup={home} isAway={false} />
          <PitchSide lineup={away} isAway={true} />
        </div>
      </div>
    </div>
  );
}
