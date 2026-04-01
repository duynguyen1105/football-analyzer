"use client";

import { Navbar } from "@/components/Navbar";
import { useLiveMatches } from "@/lib/hooks";
import { LEAGUES } from "@/lib/constants";
import { Match } from "@/lib/types";
import Link from "next/link";

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      LIVE
    </span>
  );
}

function LiveMatchCard({ match }: { match: Match }) {
  const league = LEAGUES.find((l) => l.code === match.competition.code);
  const isLive = match.status === "IN_PLAY" || match.status === "LIVE";
  const isHalfTime = match.status === "IN_PLAY" && match.time === "HT";

  return (
    <Link
      href={`/match/${match.id}`}
      className="block bg-bg-card rounded-xl border border-border hover:border-accent/40 transition-all"
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {league?.logo && <img src={league.logo} alt="" className="w-5 h-5 object-contain" />}
          <span className="text-xs text-text-muted">{match.competition.name}</span>
        </div>
        {isLive && <LiveBadge />}
        {isHalfTime && (
          <span className="text-xs text-accent-yellow font-medium">Nghỉ giữa hiệp</span>
        )}
      </div>

      {/* Match content */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Home team */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <img src={match.homeTeam.crest} alt="" className="w-10 h-10 object-contain" loading="lazy" />
              <div>
                <p className="font-semibold text-sm">{match.homeTeam.shortName}</p>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="px-6 text-center">
            <div className="text-3xl font-bold">
              {match.score ? (
                <>
                  <span className={match.score.home! > match.score.away! ? "text-accent" : ""}>
                    {match.score.home}
                  </span>
                  <span className="text-text-muted mx-2">-</span>
                  <span className={match.score.away! > match.score.home! ? "text-accent" : ""}>
                    {match.score.away}
                  </span>
                </>
              ) : (
                <span className="text-text-muted">{match.time}</span>
              )}
            </div>
            {isLive && (
              <p className="text-xs text-text-muted mt-1">{match.time}'</p>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1">
            <div className="flex items-center gap-3 justify-end">
              <div className="text-right">
                <p className="font-semibold text-sm">{match.awayTeam.shortName}</p>
              </div>
              <img src={match.awayTeam.crest} alt="" className="w-10 h-10 object-contain" loading="lazy" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border/50 flex justify-center">
        <span className="text-xs text-accent font-medium">Xem chi tiết &rarr;</span>
      </div>
    </Link>
  );
}

function LiveSkeleton() {
  return (
    <div className="bg-bg-card rounded-xl border border-border">
      <div className="px-4 py-2 border-b border-border/50">
        <div className="h-4 w-32 bg-border/30 rounded animate-pulse" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-border/20 rounded-full animate-pulse" />
            <div className="h-4 w-24 bg-border/30 rounded animate-pulse" />
          </div>
          <div className="h-8 w-16 bg-border/30 rounded animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-4 w-24 bg-border/30 rounded animate-pulse" />
            <div className="w-10 h-10 bg-border/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LivePage() {
  const { data: matches, isLoading, dataUpdatedAt } = useLiveMatches();

  const liveMatches = (matches || []).filter(
    (m: Match) => m.status === "IN_PLAY" || m.status === "LIVE"
  );

  const lastUpdate = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6 xl:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              Trực tiếp
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Kết quả cập nhật tự động mỗi 30 giây
            </p>
          </div>
          {lastUpdate && (
            <div className="text-right">
              <p className="text-[10px] text-text-muted">Cập nhật lúc</p>
              <p className="text-xs font-medium">{lastUpdate}</p>
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <LiveSkeleton key={i} />
            ))}
          </div>
        )}

        {/* No live matches */}
        {!isLoading && liveMatches.length === 0 && (
          <div className="text-center py-16 bg-bg-card rounded-2xl border border-border">
            <div className="text-4xl mb-4">⚽</div>
            <p className="text-text-secondary font-medium">Không có trận đấu đang diễn ra</p>
            <p className="text-sm text-text-muted mt-2">
              Xem lịch thi đấu sắp tới
            </p>
            <Link
              href="/"
              className="inline-block mt-4 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium hover:bg-accent/20 transition-colors"
            >
              Xem lịch đấu
            </Link>
          </div>
        )}

        {/* Live matches */}
        {!isLoading && liveMatches.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {liveMatches.map((match: Match) => (
              <LiveMatchCard key={match.id} match={match} />
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-bg-card/50 rounded-xl border border-border/50">
          <h3 className="font-semibold text-sm mb-2">Về trang Trực tiếp</h3>
          <ul className="text-xs text-text-muted space-y-1">
            <li>• Theo dõi tỷ số trực tiếp của 5 giải đấu hàng đầu Châu Âu</li>
            <li>• Tự động cập nhật mỗi 30 giây</li>
            <li>• Nhấn vào trận đấu để xem chi tiết diễn biến</li>
          </ul>
        </div>

        {/* Footer */}
        <footer className="mt-8 py-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>MatchDay Analyst — Nhận định bóng đá trước trận</p>
          <div className="mt-1 flex gap-3 justify-center">
            <Link href="/" className="hover:text-text-primary">Trang chủ</Link>
            <Link href="/about" className="hover:text-text-primary">Giới thiệu</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
