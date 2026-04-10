"use client";

import { useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { AdSlot } from "@/components/AdSlot";
import { MatchCard, MatchSkeleton } from "@/components/MatchCard";
import { StandingsCard } from "@/components/StandingsCard";
import { useMatches } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { LEAGUES } from "@/lib/constants";
import { Match } from "@/lib/types";
import { Newsletter } from "@/components/Newsletter";
import { SponsoredSlot } from "@/components/SponsoredSlot";
import { Footer } from "@/components/Footer";
import { MatchDayBanner } from "@/components/MatchDayBanner";
import Link from "next/link";

/* ───────────────────────── Helpers ───────────────────────── */

function formatDateLabel(dateStr: string): string {
  const now = new Date();
  const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const today = vnNow.toISOString().slice(0, 10);
  const tomorrow = new Date(vnNow.getTime() + 86400000).toISOString().slice(0, 10);

  if (dateStr === today) return "Hôm nay";
  if (dateStr === tomorrow) return "Ngày mai";

  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric" });
}

/* ───────────────────────── Home Page ───────────────────────── */

/** Pick the top featured matches based on both teams' league positions */
function pickFeatured(matches: Match[]): Match[] {
  // Only future/scheduled matches
  const upcoming = matches.filter((m) => m.status === "SCHEDULED" || m.status === "TIMED");
  if (upcoming.length === 0) return [];

  // Score: top-league matches between strong teams (based on code priority)
  const leaguePriority: Record<string, number> = { CL: 5, PL: 4, PD: 3, SA: 3, BL1: 2, FL1: 2, WC: 5, VL: 1 };
  const scored = upcoming.map((m) => ({
    match: m,
    score: (leaguePriority[m.competition.code] || 1),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((s) => s.match);
}

export default function Home() {
  const { leagueFilter, setLeagueFilter, favoriteTeams, showFavoritesOnly, setShowFavoritesOnly } = useAppStore();
  const { data: matches, isLoading } = useMatches();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Sync ?league= query param → store on mount
  useEffect(() => {
    const qLeague = searchParams.get("league");
    if (qLeague && LEAGUES.some((l) => l.code === qLeague) && qLeague !== leagueFilter) {
      setLeagueFilter(qLeague);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync store → URL when filter changes
  const setFilter = useCallback((code: string | null) => {
    setLeagueFilter(code);
    setShowFavoritesOnly(false);
    const url = code ? `/?league=${code}` : "/";
    router.replace(url, { scroll: false });
  }, [setLeagueFilter, setShowFavoritesOnly, router]);

  const hasFavorites = favoriteTeams.length > 0;

  const filtered = useMemo(() => {
    let list = matches || [];
    if (leagueFilter) {
      list = list.filter((m: Match) => m.competition.code === leagueFilter);
    }
    if (showFavoritesOnly && hasFavorites) {
      list = list.filter(
        (m: Match) =>
          favoriteTeams.includes(m.homeTeam.id) || favoriteTeams.includes(m.awayTeam.id)
      );
    }
    return list;
  }, [matches, leagueFilter, showFavoritesOnly, hasFavorites, favoriteTeams]);

  const featured = useMemo(() => pickFeatured(matches || []), [matches]);

  const grouped = useMemo(() => {
    const g: Record<string, Match[]> = {};
    for (const m of filtered) {
      (g[m.date] ??= []).push(m);
    }
    return g;
  }, [filtered]);

  return (
    <>
      <Navbar />

      <div id="main-content" className="max-w-7xl mx-auto px-3 py-4 xl:px-6">
        {/* Title + Quick Stats */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold mb-0.5">Lịch thi đấu &amp; Nhận định</h1>
            <p className="text-text-secondary text-xs">Phân tích trước trận cho các giải đấu hàng đầu</p>
          </div>
          {!isLoading && matches && matches.length > 0 && (
            <div className="hidden sm:flex items-center gap-3 text-[10px] text-text-muted">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {matches.length} trận
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-2" />
                {new Set(matches.map((m: Match) => m.competition.code)).size} giải
              </span>
            </div>
          )}
        </div>

        {/* League filter — wraps on mobile instead of scrolling */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setFilter(null)}
            className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
              !leagueFilter && !showFavoritesOnly
                ? "bg-accent/15 text-accent border border-accent/30"
                : "text-text-secondary border border-border hover:bg-bg-card-hover"
            }`}
          >
            Tất cả
          </button>
          {hasFavorites && (
            <button
              onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setLeagueFilter(null); router.replace("/", { scroll: false }); }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                showFavoritesOnly
                  ? "bg-accent-yellow/15 text-accent-yellow border border-accent-yellow/30"
                  : "text-text-secondary border border-border hover:bg-bg-card-hover"
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={showFavoritesOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Đội của tôi
            </button>
          )}
          {LEAGUES.map((l) => {
            const count = (matches || []).filter((m: Match) => m.competition.code === l.code).length;
            return (
              <button
                key={l.code}
                onClick={() => setFilter(l.code)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                  leagueFilter === l.code
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "text-text-secondary border border-border hover:bg-bg-card-hover"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center shrink-0">
                  <img src={l.logo} alt="" className="w-3.5 h-3.5 object-contain" />
                </span>
                <span className="hidden sm:inline">{l.name}</span>
                <span className="sm:hidden">{l.code === "BL1" ? "BL" : l.code}</span>
                {count > 0 && (
                  <span className="w-4 h-4 rounded-full bg-border/50 text-[9px] flex items-center justify-center">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Match day countdown banner */}
        {!isLoading && matches && <MatchDayBanner matches={matches} />}

        <AdSlot size="leaderboard" className="mb-4" />

        {/* Featured matches */}
        {!isLoading && featured.length > 0 && !leagueFilter && !showFavoritesOnly && (
          <section className="mb-6">
            <h2 className="text-sm font-bold text-text-secondary mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-accent-yellow" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Trận đấu nổi bật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {featured.map((m) => (
                <MatchCard key={`featured-${m.id}`} match={m} />
              ))}
            </div>
          </section>
        )}

        {/* Match list */}
        {isLoading && (
          <div className="space-y-3 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-3 md:space-y-0">
            {[...Array(6)].map((_, i) => <MatchSkeleton key={i} />)}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-5xl mb-4 opacity-30">&#9917;</div>
            <p className="text-text-muted font-medium">Không có trận đấu nào</p>
            <p className="text-xs text-text-muted mt-1 mb-4">Thử chọn giải đấu khác hoặc xem bảng xếp hạng bên dưới</p>
            <div className="flex gap-2 justify-center">
              <Link href="/ket-qua" className="text-xs text-accent hover:underline">Kết quả hôm qua</Link>
              <span className="text-text-muted">·</span>
              <Link href="/bai-viet" className="text-xs text-accent hover:underline">Đọc bài viết</Link>
            </div>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="space-y-5">
            {Object.entries(grouped).map(([date, dateMatches]) => (
              <section key={date}>
                <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">{formatDateLabel(date)}</h2>
                <div className="space-y-2 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-3 md:space-y-0">
                  {dateMatches.map((m: Match) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <AdSlot size="rectangle" className="mt-6 mx-auto max-w-sm" />

        {/* Newsletter + Sponsored */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Newsletter />
          <SponsoredSlot className="flex items-center" />
        </div>

        {/* Standings */}
        <section className="mt-8">
          <h2 className="text-base font-bold mb-3">Bảng xếp hạng</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {LEAGUES.map((l) => (
              <StandingsCard key={l.code} league={l} />
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
