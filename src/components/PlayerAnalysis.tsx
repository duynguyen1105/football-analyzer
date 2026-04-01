"use client";

import { usePlayerAnalysis } from "@/lib/hooks";

interface PlayerAnalysisProps {
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
}

const POSITION_MAP: Record<string, string> = {
  Offence: "Tấn công",
  Midfield: "Tiền vệ",
  Defence: "Hậu vệ",
  Goalkeeper: "Thủ môn",
};

interface PlayerData {
  id: number;
  name: string;
  position: string;
  nationality: string;
  age: number;
  goals: number;
  assists: number;
  matchesPlayed: number;
}

function PlayerCard({ player }: { player: PlayerData }) {
  const posVi = POSITION_MAP[player.position] || player.position;

  return (
    <div className="py-2.5 px-3 rounded-xl bg-bg-primary/50">
      <p className="text-sm font-semibold text-text-primary">{player.name}</p>
      <p className="text-xs text-text-muted mt-0.5">
        {posVi} · {player.nationality}
        {player.age > 0 && ` · ${player.age} tuổi`}
      </p>
      <div className="flex items-center gap-3 mt-1.5 text-xs">
        <span className="text-accent font-semibold">{player.goals} bàn</span>
        <span className="text-accent-2 font-semibold">
          {player.assists} kiến tạo
        </span>
        <span className="text-text-muted">{player.matchesPlayed} trận</span>
      </div>
    </div>
  );
}

function TeamColumn({
  teamName,
  players,
}: {
  teamName: string;
  players: PlayerData[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-text-secondary text-center mb-2 truncate">
        {teamName}
      </p>
      <div className="space-y-2">
        {players.map((p) => (
          <PlayerCard key={p.id} player={p} />
        ))}
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[0, 1].map((col) => (
        <div key={col} className="space-y-2">
          <div className="h-4 w-24 bg-border/30 rounded animate-pulse mx-auto" />
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-border/20 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PlayerAnalysis({
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
}: PlayerAnalysisProps) {
  const { data, isLoading } = usePlayerAnalysis(homeTeamId, awayTeamId);

  if (
    !isLoading &&
    (!data ||
      (!data.home?.players?.length && !data.away?.players?.length))
  ) {
    return null;
  }

  return (
    <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <h3 className="font-bold text-sm mb-3 md:mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />
        {"\u26A1"} Cầu thủ đáng xem
      </h3>

      {isLoading && <SectionSkeleton />}

      {!isLoading && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.home?.players?.length > 0 && (
            <TeamColumn
              teamName={data.home.teamName || homeTeamName}
              players={data.home.players}
            />
          )}
          {data.away?.players?.length > 0 && (
            <TeamColumn
              teamName={data.away.teamName || awayTeamName}
              players={data.away.players}
            />
          )}
        </div>
      )}
    </section>
  );
}
