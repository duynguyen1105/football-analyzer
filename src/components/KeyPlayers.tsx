"use client";

import { useMatchTeams } from "@/lib/hooks";

interface KeyPlayersProps {
  matchId: string;
  homeTeam: { name: string; shortName: string; crest: string };
  awayTeam: { name: string; shortName: string; crest: string };
}

interface Player {
  name: string;
  position: string;
  nationality: string;
  photo?: string;
}

const POSITION_MAP: Record<string, string> = {
  Offence: "Tấn công",
  Midfield: "Tiền vệ",
  Defence: "Hậu vệ",
  Goalkeeper: "Thủ môn",
};

const POSITION_ORDER = ["Offence", "Midfield", "Defence", "Goalkeeper"];
const MAX_PER_POSITION = 4;

function groupByPosition(
  squad: Player[]
): Record<string, Player[]> {
  const groups: Record<string, Player[]> = {};

  for (const pos of POSITION_ORDER) {
    groups[pos] = [];
  }

  for (const player of squad) {
    const pos = POSITION_ORDER.includes(player.position)
      ? player.position
      : null;
    if (pos) {
      groups[pos].push(player);
    }
  }

  // Limit per position
  for (const pos of POSITION_ORDER) {
    groups[pos] = groups[pos].slice(0, MAX_PER_POSITION);
  }

  return groups;
}

function PlayerRow({ player }: { player: Player }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      {player.photo ? (
        <img
          src={player.photo}
          alt={player.name}
          className="w-8 h-8 rounded-full object-cover bg-border/20 shrink-0"
          loading="lazy"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-border/20 flex items-center justify-center text-xs text-text-muted shrink-0">
          👤
        </div>
      )}
      <div className="min-w-0">
        <span className="text-sm text-text-primary block truncate">{player.name}</span>
        {player.nationality && (
          <span className="text-[10px] text-text-muted">{player.nationality}</span>
        )}
      </div>
    </div>
  );
}

function PositionGroup({
  label,
  players,
}: {
  label: string;
  players: Player[];
}) {
  if (players.length === 0) return null;
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
        {label}
      </p>
      {players.map((p, i) => (
        <PlayerRow key={`${p.name}-${i}`} player={p} />
      ))}
    </div>
  );
}

function SquadColumn({
  team,
  squad,
}: {
  team: { name: string; shortName: string; crest: string };
  squad: Player[];
}) {
  const groups = groupByPosition(squad);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <img
          src={team.crest}
          alt={team.shortName}
          className="w-5 h-5 object-contain"
        />
        <span className="text-sm font-semibold text-text-primary truncate">
          {team.shortName}
        </span>
      </div>
      {POSITION_ORDER.map((pos) => (
        <PositionGroup
          key={pos}
          label={POSITION_MAP[pos] || pos}
          players={groups[pos]}
        />
      ))}
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[0, 1].map((col) => (
        <div key={col} className="space-y-3">
          <div className="h-5 w-32 bg-border/30 rounded animate-pulse" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-border/20 animate-pulse shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-border/30 rounded animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function KeyPlayers({ matchId, homeTeam, awayTeam }: KeyPlayersProps) {
  const { data, isLoading } = useMatchTeams(matchId);

  return (
    <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <h3 className="font-bold text-sm mb-3 md:mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        Cầu thủ chủ chốt
      </h3>

      {isLoading && <SectionSkeleton />}

      {!isLoading && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.homeTeamInfo && (
            <SquadColumn team={homeTeam} squad={data.homeTeamInfo.squad} />
          )}
          {data.awayTeamInfo && (
            <SquadColumn team={awayTeam} squad={data.awayTeamInfo.squad} />
          )}
        </div>
      )}

      {!isLoading && !data?.homeTeamInfo && !data?.awayTeamInfo && (
        <p className="text-xs text-text-muted text-center py-4">
          Không có dữ liệu đội hình.
        </p>
      )}
    </section>
  );
}
