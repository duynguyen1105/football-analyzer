"use client";

import { useMemo, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { AdSlot } from "@/components/AdSlot";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useMatches, useStandings } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { LEAGUES } from "@/lib/constants";
import { getSlugByCode } from "@/lib/league-slugs";
import { Match, Standing } from "@/lib/types";
import { Newsletter } from "@/components/Newsletter";
import { SponsoredSlot } from "@/components/SponsoredSlot";
import { OptImage } from "@/components/OptImage";
import Link from "next/link";

/* ───────────────────────── Match Card ───────────────────────── */

function MatchCard({ match }: { match: Match }) {
  const league = LEAGUES.find((l) => l.code === match.competition.code);
  const fin = match.status === "FINISHED";
  const queryClient = useQueryClient();

  // Prefetch match data on hover so detail page loads instantly
  const prefetch = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ["match", String(match.id), "core"],
      queryFn: () => fetch(`/api/match?id=${match.id}&section=core`).then((r) => r.json()),
      staleTime: 5 * 60 * 1000,
    });
  }, [match.id, queryClient]);

  return (
    <Link
      href={`/match/${match.id}`}
      className="block bg-bg-card rounded-lg border border-border hover:border-accent/30 transition-colors"
      onMouseEnter={prefetch}
      onTouchStart={prefetch}
    >
      {/* League header */}
      <div className="px-3 py-1.5 border-b border-border/50 text-[10px] md:text-xs text-text-muted flex items-center gap-1.5">
        {league?.logo && <img src={league.logo} alt="" className="w-4 h-4 object-contain" />}
        <span className="truncate flex-1">{match.competition.name}</span>
        <FavoriteButton teamId={match.homeTeam.id} />
        <FavoriteButton teamId={match.awayTeam.id} />
      </div>

      {/* Mobile: row-based layout */}
      <div className="md:hidden">
        <div className="flex items-center gap-3 px-3 py-2 border-b border-border/20">
          <img src={match.homeTeam.crest} alt="" className="w-7 h-7 object-contain shrink-0" loading="lazy" />
          <span className="text-sm font-medium flex-1 truncate">{match.homeTeam.shortName}</span>
          {fin && match.score ? <span className="text-sm font-bold w-6 text-right">{match.score.home}</span> : null}
        </div>
        <div className="flex items-center gap-3 px-3 py-2 border-b border-border/20">
          <img src={match.awayTeam.crest} alt="" className="w-7 h-7 object-contain shrink-0" loading="lazy" />
          <span className="text-sm font-medium flex-1 truncate">{match.awayTeam.shortName}</span>
          {fin && match.score ? <span className="text-sm font-bold w-6 text-right">{match.score.away}</span> : null}
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs text-text-muted">{fin ? "KT" : match.time} · {match.date}</span>
          <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">{fin ? "Xem lại" : "Phân tích"}</span>
        </div>
      </div>

      {/* Desktop: classic horizontal layout */}
      <div className="hidden md:block p-4">
        <div className="grid grid-cols-3 items-center">
          <div className="text-center">
            <OptImage src={match.homeTeam.crest} alt={match.homeTeam.shortName} size={48} className="w-12 h-12 object-contain mx-auto mb-1" />
            <p className="font-semibold text-sm">{match.homeTeam.shortName}</p>
          </div>
          <div className="text-center">
            {fin && match.score ? (
              <p className="text-xl font-bold">{match.score.home} - {match.score.away}</p>
            ) : (
              <p className="text-xl font-bold">{match.time}</p>
            )}
            <p className="text-xs text-text-muted mt-0.5">{match.date}</p>
            <span className="inline-block mt-2 text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
              {fin ? "Xem lại" : "Phân tích"}
            </span>
          </div>
          <div className="text-center">
            <OptImage src={match.awayTeam.crest} alt={match.awayTeam.shortName} size={48} className="w-12 h-12 object-contain mx-auto mb-1" />
            <p className="font-semibold text-sm">{match.awayTeam.shortName}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ───────────────────────── Skeleton ───────────────────────── */

function MatchSkeleton() {
  return (
    <div className="bg-bg-card rounded-lg border border-border">
      <div className="px-3 py-1.5 border-b border-border/50">
        <div className="h-3 w-24 bg-border/30 rounded animate-pulse" />
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-border/20">
          <div className="w-7 h-7 bg-border/20 rounded-full animate-pulse shrink-0" />
          <div className="h-3.5 flex-1 bg-border/30 rounded animate-pulse" />
        </div>
      ))}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="h-3 w-20 bg-border/20 rounded animate-pulse" />
        <div className="h-4 w-14 bg-border/10 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

/* ───────────────────────── Standings ───────────────────────── */

function StandingsCard({ league }: { league: (typeof LEAGUES)[number] }) {
  const { data: standings, isLoading } = useStandings(league.code);
  const rows = (standings || []).slice(0, 5);

  if (isLoading) {
    return (
      <div className="bg-bg-card rounded-lg border border-border p-3 space-y-2">
        <div className="h-4 w-28 bg-border/40 rounded animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-3.5 bg-border/20 rounded animate-pulse" />
        ))}
      </div>
    );
  }
  if (rows.length === 0) return null;

  return (
    <div className="bg-bg-card rounded-lg border border-border p-3">
      <Link href={`/giai-dau/${getSlugByCode(league.code) || league.code}`}>
        <h3 className="font-semibold text-xs mb-2 hover:text-accent transition-colors flex items-center gap-1.5">
          <img src={league.logo} alt="" className="w-5 h-5 object-contain" />
          {league.name}
        </h3>
      </Link>
      <table className="w-full text-[11px]">
        <thead>
          <tr className="text-text-muted">
            <th className="text-left py-0.5 w-5">#</th>
            <th className="text-left py-0.5">Đội</th>
            <th className="text-center py-0.5 w-6">Tr</th>
            <th className="text-center py-0.5 w-7">HS</th>
            <th className="text-center py-0.5 w-6 text-text-secondary font-bold">Đ</th>
          </tr>
        </thead>
        <tbody className="text-text-secondary">
          {rows.map((r: Standing) => (
            <tr key={r.team.id} className="border-t border-border/30">
              <td className="py-1 text-text-muted">{r.position}</td>
              <td className="py-1">
                <div className="flex items-center gap-1">
                  <img src={r.team.crest} alt="" className="w-3.5 h-3.5 object-contain shrink-0" />
                  <span className="text-text-primary font-medium truncate">{r.team.shortName}</span>
                </div>
              </td>
              <td className="py-1 text-center">{r.playedGames}</td>
              <td className="py-1 text-center">{r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}</td>
              <td className="py-1 text-center font-bold text-text-primary">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href={`/giai-dau/${getSlugByCode(league.code) || league.code}`} className="block text-center text-[10px] text-accent mt-2 hover:underline">
        Xem đầy đủ &rarr;
      </Link>
    </div>
  );
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

      <div className="max-w-7xl mx-auto px-3 py-4 xl:px-6">
        {/* Title */}
        <h1 className="text-lg font-bold mb-0.5">Lịch thi đấu &amp; Nhận định</h1>
        <p className="text-text-secondary text-xs mb-4">Phân tích trước trận cho các giải đấu hàng đầu</p>

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
          {LEAGUES.map((l) => (
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
            </button>
          ))}
        </div>

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
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <MatchSkeleton key={i} />)}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <p>Không có trận đấu nào.</p>
            <p className="text-xs mt-1">Xem bảng xếp hạng bên dưới.</p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="space-y-5">
            {Object.entries(grouped).map(([date, dateMatches]) => (
              <section key={date}>
                <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">{date}</h2>
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

        {/* Footer */}
        <footer className="mt-8 py-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>MatchDay Analyst — Nhận định bóng đá trước trận</p>
          <p className="mt-0.5">Dữ liệu từ API-Football</p>
          <div className="mt-1 flex gap-3 justify-center">
            <Link href="/about" className="hover:text-text-primary">Giới thiệu</Link>
            <Link href="/privacy" className="hover:text-text-primary">Chính sách bảo mật</Link>
            <Link href="/ung-ho" className="hover:text-accent-red text-accent-red/70">Ủng hộ</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
