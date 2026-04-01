"use client";

import { useMatchPerformers } from "@/lib/hooks";
import Link from "next/link";

interface PlayerAnalysisProps {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
}

const POSITION_MAP: Record<string, string> = {
  Offence: "Tấn công",
  Midfield: "Tiền vệ",
  Defence: "Hậu vệ",
  Goalkeeper: "Thủ môn",
  Attacker: "Tấn công",
  Midfielder: "Tiền vệ",
  Defender: "Hậu vệ",
};

interface Performer {
  id: number;
  name: string;
  photo: string;
  position: string;
  goals: number;
  assists: number;
  appearances: number;
  rating: string | null;
}

function PlayerCard({ player }: { player: Performer }) {
  const posVi = POSITION_MAP[player.position] || player.position;

  return (
    <Link
      href={`/cau-thu/${player.id}`}
      className="block py-2.5 px-3 rounded-xl bg-bg-primary/50 hover:bg-bg-primary/80 transition-colors"
    >
      <div className="flex items-center gap-2.5">
        {player.photo ? (
          <img
            src={player.photo}
            alt={player.name}
            className="w-9 h-9 rounded-full object-cover bg-border/20 shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-border/20 flex items-center justify-center text-sm text-text-muted shrink-0">
            👤
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">{player.name}</p>
          <p className="text-xs text-text-muted mt-0.5">
            {posVi}
            {player.appearances > 0 && ` · ${player.appearances} trận`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-1.5 text-xs">
        {player.goals > 0 && (
          <span className="text-accent font-semibold">{player.goals} bàn</span>
        )}
        {player.assists > 0 && (
          <span className="text-accent-2 font-semibold">{player.assists} kiến tạo</span>
        )}
        {player.rating && (
          <span className="text-text-muted">⭐ {parseFloat(player.rating).toFixed(1)}</span>
        )}
      </div>
    </Link>
  );
}

function TeamColumn({ teamName, players }: { teamName: string; players: Performer[] }) {
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
            <div key={i} className="h-16 bg-border/20 rounded-xl animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PlayerAnalysis({ matchId, homeTeamName, awayTeamName }: PlayerAnalysisProps) {
  const { data, isLoading } = useMatchPerformers(matchId);

  // Pick top 3 performers per team (sorted by goals+assists, then appearances)
  const homeTop = (data?.homePerformers ?? []).slice(0, 3);
  const awayTop = (data?.awayPerformers ?? []).slice(0, 3);

  if (!isLoading && homeTop.length === 0 && awayTop.length === 0) {
    return null;
  }

  return (
    <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <h3 className="font-bold text-sm mb-3 md:mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />
        {"\u26A1"} Cầu thủ đáng xem
      </h3>

      {isLoading && <SectionSkeleton />}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {homeTop.length > 0 && (
            <TeamColumn teamName={homeTeamName} players={homeTop} />
          )}
          {awayTop.length > 0 && (
            <TeamColumn teamName={awayTeamName} players={awayTop} />
          )}
        </div>
      )}
    </section>
  );
}
