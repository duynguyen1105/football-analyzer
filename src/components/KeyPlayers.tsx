"use client";

import { useMatchPerformers } from "@/lib/hooks";
import Link from "next/link";

interface KeyPlayersProps {
  matchId: string;
  homeTeam: { name: string; shortName: string; crest: string };
  awayTeam: { name: string; shortName: string; crest: string };
}

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

const POSITION_MAP: Record<string, string> = {
  Offence: "Tấn công",
  Midfield: "Tiền vệ",
  Defence: "Hậu vệ",
  Goalkeeper: "Thủ môn",
  Attacker: "Tấn công",
  Midfielder: "Tiền vệ",
  Defender: "Hậu vệ",
};

function PlayerRow({ player }: { player: Performer }) {
  const hasStats = player.goals > 0 || player.assists > 0;

  return (
    <Link
      href={`/cau-thu/${player.id}`}
      className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-bg-primary/50 transition-colors"
    >
      {player.photo ? (
        <img
          src={player.photo}
          alt={player.name}
          className="w-10 h-10 rounded-full object-cover bg-border/20 shrink-0"
          loading="lazy"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-border/20 flex items-center justify-center text-sm text-text-muted shrink-0">
          👤
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{player.name}</p>
        <p className="text-[10px] text-text-muted">
          {POSITION_MAP[player.position] || player.position}
          {player.appearances > 0 && ` • ${player.appearances} trận`}
        </p>
      </div>
      {hasStats && (
        <div className="flex gap-2 shrink-0">
          {player.goals > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
              {player.goals} bàn
            </span>
          )}
          {player.assists > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-medium">
              {player.assists} kiến tạo
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

function PerformersColumn({
  team,
  performers,
}: {
  team: { name: string; shortName: string; crest: string };
  performers: Performer[];
}) {
  // Show top 8 performers
  const topPerformers = performers.slice(0, 8);

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
      <div className="space-y-0.5">
        {topPerformers.map((p) => (
          <PlayerRow key={p.id} player={p} />
        ))}
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[0, 1].map((col) => (
        <div key={col} className="space-y-3">
          <div className="h-5 w-32 bg-border/30 rounded animate-pulse" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-border/20 animate-pulse shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-border/30 rounded animate-pulse w-3/4 mb-1" />
                <div className="h-3 bg-border/20 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function KeyPlayers({ matchId, homeTeam, awayTeam }: KeyPlayersProps) {
  const { data, isLoading } = useMatchPerformers(matchId);

  return (
    <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <h3 className="font-bold text-sm mb-3 md:mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        Cầu thủ chủ chốt
      </h3>

      {isLoading && <SectionSkeleton />}

      {!isLoading && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.homePerformers && data.homePerformers.length > 0 && (
            <PerformersColumn team={homeTeam} performers={data.homePerformers} />
          )}
          {data.awayPerformers && data.awayPerformers.length > 0 && (
            <PerformersColumn team={awayTeam} performers={data.awayPerformers} />
          )}
        </div>
      )}

      {!isLoading && (!data?.homePerformers?.length && !data?.awayPerformers?.length) && (
        <p className="text-xs text-text-muted text-center py-4">
          Không có dữ liệu cầu thủ.
        </p>
      )}
    </section>
  );
}
