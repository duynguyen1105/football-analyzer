"use client";

import { Navbar } from "@/components/Navbar";
import { useLiveMatches, useMatches } from "@/lib/hooks";
import { LEAGUES } from "@/lib/constants";
import { Match } from "@/lib/types";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      LIVE
    </span>
  );
}

/** Countdown timer showing seconds until next auto-refresh */
function RefreshCountdown({ dataUpdatedAt, interval }: { dataUpdatedAt: number; interval: number }) {
  const [secondsLeft, setSecondsLeft] = useState(interval / 1000);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - dataUpdatedAt;
      const remaining = Math.max(0, Math.ceil((interval - elapsed) / 1000));
      setSecondsLeft(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dataUpdatedAt, interval]);

  return (
    <span className="text-[10px] text-text-muted tabular-nums">
      Cập nhật sau {secondsLeft}s
    </span>
  );
}

function LiveMatchCard({
  match,
  hasScoreChanged,
}: {
  match: Match;
  hasScoreChanged: boolean;
}) {
  const league = LEAGUES.find((l) => l.code === match.competition.code);
  const isLive = match.status === "IN_PLAY" || match.status === "LIVE";
  const isHalfTime = match.status === "IN_PLAY" && match.time === "HT";
  const isFinished = match.status === "FINISHED" || match.status === "FT";

  return (
    <Link
      href={`/match/${match.id}`}
      className={`block bg-bg-card rounded-xl border transition-all ${
        hasScoreChanged
          ? "border-accent ring-2 ring-accent/30 animate-[goalFlash_1.5s_ease-out]"
          : isFinished
            ? "border-border/50 opacity-75 hover:opacity-100"
            : "border-border hover:border-accent/40"
      }`}
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {league?.logo && (
            <img src={league.logo} alt="" className="w-5 h-5 object-contain" />
          )}
          <span className="text-xs text-text-muted">
            {match.competition.name}
          </span>
        </div>
        {isLive && <LiveBadge />}
        {isHalfTime && (
          <span className="text-xs text-accent-yellow font-medium">
            Nghỉ giữa hiệp
          </span>
        )}
        {isFinished && (
          <span className="text-xs text-text-muted font-medium">Kết thúc</span>
        )}
      </div>

      {/* Match content */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Home team */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <img
                src={match.homeTeam.crest}
                alt=""
                className="w-10 h-10 object-contain"
                loading="lazy"
              />
              <div>
                <p className="font-semibold text-sm">
                  {match.homeTeam.shortName}
                </p>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="px-6 text-center">
            <div
              className={`text-3xl font-bold ${hasScoreChanged ? "text-accent scale-110 transition-transform" : ""}`}
            >
              {match.score ? (
                <>
                  <span
                    className={
                      match.score.home! > match.score.away! ? "text-accent" : ""
                    }
                  >
                    {match.score.home}
                  </span>
                  <span className="text-text-muted mx-2">-</span>
                  <span
                    className={
                      match.score.away! > match.score.home! ? "text-accent" : ""
                    }
                  >
                    {match.score.away}
                  </span>
                </>
              ) : (
                <span className="text-text-muted">{match.time}</span>
              )}
            </div>
            {isLive && (
              <p className="text-xs text-text-muted mt-1">{match.time}&apos;</p>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1">
            <div className="flex items-center gap-3 justify-end">
              <div className="text-right">
                <p className="font-semibold text-sm">
                  {match.awayTeam.shortName}
                </p>
              </div>
              <img
                src={match.awayTeam.crest}
                alt=""
                className="w-10 h-10 object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border/50 flex justify-center">
        <span className="text-xs text-accent font-medium">
          Xem chi tiết &rarr;
        </span>
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

function UpcomingMatchRow({ match }: { match: Match }) {
  const league = LEAGUES.find((l) => l.code === match.competition.code);
  return (
    <Link
      href={`/match/${match.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-bg-card/60 transition-colors border-b border-border/30 last:border-0"
    >
      <span className="text-xs text-text-muted w-12 shrink-0 font-medium">{match.time}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {league?.logo && <img src={league.logo} alt="" className="w-4 h-4 object-contain" />}
          <span className="text-xs text-text-muted truncate">{match.competition.name}</span>
        </div>
        <p className="text-sm font-medium truncate mt-0.5">
          {match.homeTeam.shortName} vs {match.awayTeam.shortName}
        </p>
      </div>
      <span className="text-xs text-accent font-medium shrink-0">Phân tích &rarr;</span>
    </Link>
  );
}

const REFRESH_INTERVAL = 30 * 1000;

export default function LivePage() {
  const { data: matches, isLoading, isFetching, dataUpdatedAt, refetch } =
    useLiveMatches();
  const { data: allMatches } = useMatches();

  // Track previous scores to detect goals
  const prevScoresRef = useRef<Map<number, string>>(new Map());
  const [changedIds, setChangedIds] = useState<Set<number>>(new Set());

  // Detect score changes
  useEffect(() => {
    if (!matches) return;
    const newChanged = new Set<number>();
    const prev = prevScoresRef.current;

    for (const m of matches) {
      const key = `${m.score?.home ?? ""}-${m.score?.away ?? ""}`;
      const old = prev.get(m.id);
      if (old !== undefined && old !== key) {
        newChanged.add(m.id);
      }
      prev.set(m.id, key);
    }

    if (newChanged.size > 0) {
      setChangedIds(newChanged);
      // Browser notification for goals
      if (Notification.permission === "granted") {
        for (const m of matches) {
          if (newChanged.has(m.id) && m.score) {
            new Notification("Bàn thắng!", {
              body: `${m.homeTeam.shortName} ${m.score.home} - ${m.score.away} ${m.awayTeam.shortName}`,
              icon: "/icons/icon-192.png",
            });
          }
        }
      }
      // Clear flash after animation
      const timer = setTimeout(() => setChangedIds(new Set()), 2000);
      return () => clearTimeout(timer);
    }
  }, [matches]);

  const liveMatches = (matches || []).filter(
    (m: Match) => m.status === "IN_PLAY" || m.status === "LIVE"
  );
  const recentlyFinished = (matches || []).filter(
    (m: Match) => m.status === "FINISHED" || m.status === "FT"
  );

  const lastUpdate = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  const handleManualRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <>
      <Navbar />
      <style jsx global>{`
        @keyframes goalFlash {
          0%,
          100% {
            background-color: transparent;
          }
          25% {
            background-color: rgba(34, 197, 94, 0.1);
          }
          50% {
            background-color: transparent;
          }
          75% {
            background-color: rgba(34, 197, 94, 0.05);
          }
        }
      `}</style>
      <div className="max-w-6xl mx-auto px-4 py-6 xl:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              Trực tiếp
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Cập nhật tự động mỗi 30 giây
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Countdown + last update */}
            <div className="text-right">
              {dataUpdatedAt > 0 && (
                <RefreshCountdown
                  dataUpdatedAt={dataUpdatedAt}
                  interval={REFRESH_INTERVAL}
                />
              )}
              {lastUpdate && (
                <p className="text-[10px] text-text-muted">Lúc {lastUpdate}</p>
              )}
            </div>
            {/* Manual refresh */}
            <button
              onClick={handleManualRefresh}
              disabled={isFetching}
              className="p-2 rounded-lg bg-bg-card border border-border hover:border-accent/40 transition-colors disabled:opacity-50"
              title="Làm mới ngay"
            >
              <svg
                className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
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
        {!isLoading && liveMatches.length === 0 && recentlyFinished.length === 0 && (
          <div className="text-center py-16 bg-bg-card rounded-2xl border border-border">
            <div className="text-4xl mb-4">&#9917;</div>
            <p className="text-text-secondary font-medium">
              Không có trận đấu đang diễn ra
            </p>
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
          <>
            <h2 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Đang diễn ra ({liveMatches.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {liveMatches.map((match: Match) => (
                <LiveMatchCard
                  key={match.id}
                  match={match}
                  hasScoreChanged={changedIds.has(match.id)}
                />
              ))}
            </div>
          </>
        )}

        {/* Recently finished matches */}
        {!isLoading && recentlyFinished.length > 0 && (
          <div className={liveMatches.length > 0 ? "mt-8" : ""}>
            <h2 className="text-sm font-semibold text-text-secondary mb-3">
              Vừa kết thúc ({recentlyFinished.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recentlyFinished.map((match: Match) => (
                <LiveMatchCard
                  key={match.id}
                  match={match}
                  hasScoreChanged={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming today */}
        {allMatches && (() => {
          const today = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
          const upcoming = allMatches.filter(
            (m: Match) => m.date === today && m.status === "SCHEDULED"
          );
          if (upcoming.length === 0) return null;
          return (
            <div className={liveMatches.length > 0 || recentlyFinished.length > 0 ? "mt-8" : ""}>
              <h2 className="text-sm font-semibold text-text-secondary mb-3">
                Sắp diễn ra hôm nay ({upcoming.length})
              </h2>
              <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
                {upcoming.slice(0, 10).map((m: Match) => (
                  <UpcomingMatchRow key={m.id} match={m} />
                ))}
              </div>
            </div>
          );
        })()}

        {/* Notification toggle */}
        {typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted" && (
          <div className="mt-6 text-center">
            <button
              onClick={() => Notification.requestPermission()}
              className="text-xs text-accent hover:underline"
            >
              Bật thông báo bàn thắng
            </button>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-bg-card/50 rounded-xl border border-border/50">
          <h3 className="font-semibold text-sm mb-2">Về trang Trực tiếp</h3>
          <ul className="text-xs text-text-muted space-y-1">
            <li>
              &bull; Theo dõi tỷ số trực tiếp của 5 giải đấu hàng đầu Châu Âu,
              V-League, Champions League và World Cup
            </li>
            <li>&bull; Tự động cập nhật mỗi 30 giây, nhấn nút làm mới để cập nhật ngay</li>
            <li>&bull; Tỷ số nhấp nháy xanh khi có bàn thắng mới</li>
            <li>&bull; Nhấn vào trận đấu để xem chi tiết diễn biến</li>
          </ul>
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
