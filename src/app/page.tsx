"use client";

import { useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { AdSlot } from "@/components/AdSlot";
import { useMatches, useStandings } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { LEAGUES } from "@/lib/constants";
import { Match, Standing } from "@/lib/types";
import Link from "next/link";

/* ───────────────────────── Match Card ───────────────────────── */

function MatchCard({ match }: { match: Match }) {
  const league = LEAGUES.find((l) => l.code === match.competition.code);
  const fin = match.status === "FINISHED";

  return (
    <Link href={`/match/${match.id}`} className="block bg-bg-card rounded-lg border border-border hover:border-accent/30 transition-colors">
      {/* League header */}
      <div className="px-3 py-1.5 border-b border-border/50 text-[10px] text-text-muted truncate">
        {league?.flag} {match.competition.name}
      </div>

      {/* Row 1: Home team */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-border/20">
        <img src={match.homeTeam.crest} alt="" className="w-7 h-7 object-contain shrink-0" loading="lazy" />
        <span className="text-sm font-medium flex-1 truncate">{match.homeTeam.shortName}</span>
        {fin && match.score ? (
          <span className="text-sm font-bold w-6 text-right">{match.score.home}</span>
        ) : null}
      </div>

      {/* Row 2: Away team */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-border/20">
        <img src={match.awayTeam.crest} alt="" className="w-7 h-7 object-contain shrink-0" loading="lazy" />
        <span className="text-sm font-medium flex-1 truncate">{match.awayTeam.shortName}</span>
        {fin && match.score ? (
          <span className="text-sm font-bold w-6 text-right">{match.score.away}</span>
        ) : null}
      </div>

      {/* Row 3: Time + CTA */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs text-text-muted">
          {fin ? "KT" : match.time} · {match.date}
        </span>
        <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
          {fin ? "Xem lại" : "Phân tích"}
        </span>
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
      <Link href={`/giai-dau/${league.code}`}>
        <h3 className="font-semibold text-xs mb-2 hover:text-accent transition-colors">{league.flag} {league.name}</h3>
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
      <Link href={`/giai-dau/${league.code}`} className="block text-center text-[10px] text-accent mt-2 hover:underline">
        Xem day du &rarr;
      </Link>
    </div>
  );
}

/* ───────────────────────── Home Page ───────────────────────── */

export default function Home() {
  const { leagueFilter, setLeagueFilter } = useAppStore();
  const { data: matches, isLoading } = useMatches();

  const filtered = leagueFilter
    ? (matches || []).filter((m: Match) => m.competition.code === leagueFilter)
    : matches || [];

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

      <div className="max-w-5xl mx-auto px-3 py-4">
        {/* Title */}
        <h1 className="text-lg font-bold mb-0.5">Lịch thi đấu &amp; Nhận định</h1>
        <p className="text-text-secondary text-xs mb-4">Phân tích trước trận cho 5 giải hàng đầu Châu Âu</p>

        {/* League filter — wraps on mobile instead of scrolling */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setLeagueFilter(null)}
            className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
              !leagueFilter
                ? "bg-accent/15 text-accent border border-accent/30"
                : "text-text-secondary border border-border hover:bg-bg-card-hover"
            }`}
          >
            Tất cả
          </button>
          {LEAGUES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLeagueFilter(l.code)}
              className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                leagueFilter === l.code
                  ? "bg-accent/15 text-accent border border-accent/30"
                  : "text-text-secondary border border-border hover:bg-bg-card-hover"
              }`}
            >
              {l.flag} {l.name}
            </button>
          ))}
        </div>

        <AdSlot size="leaderboard" className="mb-4" />

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
                <div className="space-y-2">
                  {dateMatches.map((m: Match) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <AdSlot size="rectangle" className="mt-6 mx-auto max-w-sm" />

        {/* Standings */}
        <section className="mt-8">
          <h2 className="text-base font-bold mb-3">Bảng xếp hạng</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {LEAGUES.map((l) => (
              <StandingsCard key={l.code} league={l} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 py-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>MatchDay Analyst — Nhận định bóng đá trước trận</p>
          <p className="mt-0.5">Dữ liệu từ Football-Data.org</p>
          <div className="mt-1 flex gap-3 justify-center">
            <Link href="/about" className="hover:text-text-primary">Giới thiệu</Link>
            <Link href="/privacy" className="hover:text-text-primary">Chính sách bảo mật</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
