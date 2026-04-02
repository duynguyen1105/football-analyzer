"use client";

import { use } from "react";
import { Navbar } from "@/components/Navbar";
import { useTopAssists } from "@/lib/hooks";
import { LEAGUES } from "@/lib/constants";
import Link from "next/link";

// Map URL slugs to league codes
const SLUG_TO_CODE: Record<string, string> = {
  "premier-league": "PL",
  "la-liga": "PD",
  "serie-a": "SA",
  "bundesliga": "BL1",
  "ligue-1": "FL1",
  "v-league": "VL",
  "champions-league": "CL",
  "world-cup": "WC",
};

const CODE_TO_SLUG: Record<string, string> = {
  PL: "premier-league",
  PD: "la-liga",
  SA: "serie-a",
  BL1: "bundesliga",
  FL1: "ligue-1",
  VL: "v-league",
  CL: "champions-league",
  WC: "world-cup",
};

interface AssistPlayer {
  id: number;
  name: string;
  team: string;
  teamLogo: string;
  assists: number;
  goals: number;
  photo: string;
}

function PlayerRow({ player, rank }: { player: AssistPlayer; rank: number }) {
  return (
    <Link
      href={player.id ? `/cau-thu/${player.id}` : "#"}
      className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0 hover:bg-bg-primary/50 transition-colors rounded-lg px-2 -mx-2"
    >
      {/* Rank */}
      <div className="w-8 text-center">
        <span
          className={`text-lg font-bold ${
            rank <= 3 ? "text-accent" : "text-text-muted"
          }`}
        >
          {rank}
        </span>
      </div>

      {/* Photo */}
      <div className="w-12 h-12 rounded-full overflow-hidden bg-border/20 shrink-0">
        {player.photo ? (
          <img
            src={player.photo}
            alt={player.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">
            👤
          </div>
        )}
      </div>

      {/* Player info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{player.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {player.teamLogo && (
            <img
              src={player.teamLogo}
              alt=""
              className="w-4 h-4 object-contain"
            />
          )}
          <span className="text-xs text-text-muted truncate">{player.team}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-center">
        <div>
          <p className="text-lg font-bold text-accent">{player.assists}</p>
          <p className="text-[10px] text-text-muted">Kiến tạo</p>
        </div>
        <div>
          <p className="text-lg font-bold text-text-secondary">{player.goals}</p>
          <p className="text-[10px] text-text-muted">Bàn thắng</p>
        </div>
      </div>
    </Link>
  );
}

function PlayerSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/30">
      <div className="w-8 h-6 bg-border/30 rounded animate-pulse" />
      <div className="w-12 h-12 rounded-full bg-border/20 animate-pulse" />
      <div className="flex-1">
        <div className="h-4 w-32 bg-border/30 rounded animate-pulse" />
        <div className="h-3 w-24 bg-border/20 rounded animate-pulse mt-1.5" />
      </div>
      <div className="flex gap-4">
        <div className="h-6 w-8 bg-border/30 rounded animate-pulse" />
        <div className="h-6 w-8 bg-border/20 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function TopAssistsPage({
  params,
}: {
  params: Promise<{ league: string }>;
}) {
  const { league: slug } = use(params);
  const code = SLUG_TO_CODE[slug] || "PL";
  const leagueInfo = LEAGUES.find((l) => l.code === code);
  const { data: players, isLoading } = useTopAssists(code);

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6 xl:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
          <Link href="/" className="hover:text-text-primary transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-text-secondary">Top kiến tạo</span>
          <span>/</span>
          <span className="text-text-secondary">{leagueInfo?.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {leagueInfo?.logo && (
            <img
              src={leagueInfo.logo}
              alt=""
              className="w-12 h-12 object-contain"
            />
          )}
          <div>
            <h1 className="text-xl font-bold">Top kiến tạo</h1>
            <p className="text-sm text-text-muted">{leagueInfo?.name}</p>
          </div>
        </div>

        {/* League tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {LEAGUES.map((l) => (
            <Link
              key={l.code}
              href={`/top-kien-tao/${CODE_TO_SLUG[l.code]}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                l.code === code
                  ? "bg-accent/15 text-accent border border-accent/30"
                  : "text-text-secondary border border-border hover:bg-bg-card-hover"
              }`}
            >
              <img src={l.logo} alt="" className="w-4 h-4 object-contain" />
              <span className="hidden sm:inline">{l.name}</span>
              <span className="sm:hidden">{l.code === "BL1" ? "BL" : l.code}</span>
            </Link>
          ))}
        </div>

        {/* Players list */}
        <div className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
          <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Bảng xếp hạng kiến tạo mùa giải
          </h2>

          {isLoading && (
            <div>
              {[...Array(10)].map((_, i) => (
                <PlayerSkeleton key={i} />
              ))}
            </div>
          )}

          {!isLoading && (!players || players.length === 0) && (
            <div className="text-center py-8 text-text-muted">
              <p>Chưa có dữ liệu kiến tạo</p>
            </div>
          )}

          {!isLoading && players && players.length > 0 && (
            <div>
              {players.map((player: AssistPlayer, i: number) => (
                <PlayerRow key={i} player={player} rank={i + 1} />
              ))}
            </div>
          )}
        </div>

        {/* Link to top scorers */}
        <div className="mt-6 text-center">
          <Link
            href={`/giai-dau/${CODE_TO_SLUG[code] || slug}`}
            className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
          >
            Xem vua phá lưới và bảng xếp hạng &rarr;
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-8 py-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>MatchDay Analyst — Nhận định bóng đá trước trận</p>
          <div className="mt-1 flex gap-3 justify-center">
            <Link href="/" className="hover:text-text-primary">
              Trang chủ
            </Link>
            <Link href="/about" className="hover:text-text-primary">
              Giới thiệu
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}
