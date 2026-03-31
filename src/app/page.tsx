"use client";

import { useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { AdSlot } from "@/components/AdSlot";
import { useMatches, useStandings } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { LEAGUES } from "@/lib/constants";
import { Match, Standing } from "@/lib/types";
import Link from "next/link";

function MatchCard({ match }: { match: Match }) {
  const leagueInfo = LEAGUES.find((l) => l.code === match.competition.code);
  const isFinished = match.status === "FINISHED";

  return (
    <Link
      href={`/match/${match.id}`}
      className="block bg-bg-card rounded-xl border border-border hover:border-accent/30 hover:bg-bg-card-hover transition-all group"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 gap-2">
        <span className="text-[10px] md:text-xs text-text-muted whitespace-nowrap">{leagueInfo?.flag} {match.competition.name}</span>
        <span className="text-[10px] md:text-xs text-text-muted truncate text-right">{match.venue}</span>
      </div>
      <div className="px-3 py-4 md:px-4 md:py-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center min-w-0">
            <div className="flex justify-center mb-2">
              <img src={match.homeTeam.crest} alt={match.homeTeam.shortName} className="w-10 h-10 md:w-12 md:h-12 object-contain" loading="lazy" />
            </div>
            <p className="font-semibold text-xs md:text-sm truncate px-1">{match.homeTeam.shortName}</p>
          </div>
          <div className="px-2 md:px-4 text-center shrink-0">
            {isFinished && match.score ? (
              <p className="text-xl md:text-2xl font-bold text-text-primary">{match.score.home} - {match.score.away}</p>
            ) : (
              <p className="text-xl md:text-2xl font-bold text-text-primary">{match.time}</p>
            )}
            <p className="text-[10px] md:text-xs text-text-muted mt-1">{match.date}</p>
            <div className="mt-2 md:mt-3 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] md:text-xs font-medium group-hover:bg-accent/20 transition-colors">
              {isFinished ? "Xem lại" : "Phân tích"}
            </div>
          </div>
          <div className="flex-1 text-center min-w-0">
            <div className="flex justify-center mb-2">
              <img src={match.awayTeam.crest} alt={match.awayTeam.shortName} className="w-10 h-10 md:w-12 md:h-12 object-contain" loading="lazy" />
            </div>
            <p className="font-semibold text-xs md:text-sm truncate px-1">{match.awayTeam.shortName}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function MatchSkeleton() {
  return (
    <div className="bg-bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
        <div className="h-3 w-28 bg-border/30 rounded animate-pulse" />
        <div className="h-3 w-20 bg-border/20 rounded animate-pulse" />
      </div>
      <div className="px-3 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-border/20 rounded-full animate-pulse" />
            <div className="h-3.5 w-16 bg-border/30 rounded animate-pulse" />
          </div>
          <div className="px-2 flex flex-col items-center gap-2">
            <div className="h-6 w-12 bg-border/40 rounded animate-pulse" />
            <div className="h-3 w-16 bg-border/20 rounded animate-pulse" />
            <div className="h-5 w-14 bg-border/10 rounded-full animate-pulse mt-1" />
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-border/20 rounded-full animate-pulse" />
            <div className="h-3.5 w-16 bg-border/30 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StandingsCard({ league }: { league: typeof LEAGUES[number] }) {
  const { data: standings, isLoading } = useStandings(league.code);
  const top5 = (standings || []).slice(0, 5);

  if (isLoading) {
    return (
      <div className="bg-bg-card rounded-xl border border-border p-3">
        <div className="h-4 w-32 bg-border/40 rounded animate-pulse mb-3" />
        <div className="space-y-2.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-4 bg-border/20 rounded animate-pulse" />
              <div className="w-4 h-4 bg-border/20 rounded animate-pulse" />
              <div className="h-3 flex-1 bg-border/20 rounded animate-pulse" />
              <div className="h-3 w-5 bg-border/30 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (top5.length === 0) return null;

  return (
    <div className="bg-bg-card rounded-xl border border-border p-3">
      <h3 className="font-semibold text-xs md:text-sm mb-3">{league.flag} {league.name}</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-text-muted">
            <th className="text-left py-1">#</th>
            <th className="text-left py-1">Đội</th>
            <th className="text-center py-1">Tr</th>
            <th className="text-center py-1">HS</th>
            <th className="text-center py-1 font-bold text-text-secondary">Đ</th>
          </tr>
        </thead>
        <tbody className="text-text-secondary">
          {top5.map((row: Standing) => (
            <tr key={row.team.id} className="border-t border-border/30">
              <td className="py-1.5 text-text-muted">{row.position}</td>
              <td className="py-1.5">
                <div className="flex items-center gap-1.5">
                  <img src={row.team.crest} alt="" className="w-4 h-4 object-contain" />
                  <span className="text-text-primary font-medium">{row.team.shortName}</span>
                </div>
              </td>
              <td className="py-1.5 text-center">{row.playedGames}</td>
              <td className="py-1.5 text-center">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
              <td className="py-1.5 text-center font-bold text-text-primary">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Home() {
  const { leagueFilter, setLeagueFilter } = useAppStore();
  const { data: matches, isLoading } = useMatches();

  const filteredMatches = leagueFilter
    ? (matches || []).filter((m: Match) => m.competition.code === leagueFilter)
    : matches || [];

  // Group matches by date — use stable key (YYYY-MM-DD string) to avoid hydration issues
  const grouped = useMemo(() => {
    const g: Record<string, Match[]> = {};
    for (const match of filteredMatches) {
      if (!g[match.date]) g[match.date] = [];
      g[match.date].push(match);
    }
    return g;
  }, [filteredMatches]);

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold">Lịch thi đấu &amp; Nhận định</h1>
          <p className="text-text-secondary text-xs md:text-sm mt-1">
            Phân tích trước trận đấu cho 5 giải hàng đầu Châu Âu
          </p>
        </div>

        {/* League filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-4 scrollbar-hide">
          <button
            onClick={() => setLeagueFilter(null)}
            className={`px-3 md:px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              !leagueFilter
                ? "bg-accent/15 text-accent border border-accent/30"
                : "text-text-secondary hover:bg-bg-card-hover border border-transparent hover:border-border"
            }`}
          >
            Tất cả giải đấu
          </button>
          {LEAGUES.map((league) => (
            <button
              key={league.code}
              onClick={() => setLeagueFilter(league.code)}
              className={`px-3 md:px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                leagueFilter === league.code
                  ? "bg-accent/15 text-accent border border-accent/30"
                  : "text-text-secondary hover:bg-bg-card-hover border border-transparent hover:border-border"
              }`}
            >
              {league.flag} {league.name}
            </button>
          ))}
        </div>

        <AdSlot size="leaderboard" className="mb-6" />

        {/* Matches */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {[...Array(4)].map((_, i) => <MatchSkeleton key={i} />)}
          </div>
        )}

        {!isLoading && filteredMatches.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            <p className="text-lg">Không có trận đấu nào được lên lịch.</p>
            <p className="text-sm mt-2">Hãy quay lại sau hoặc xem bảng xếp hạng bên dưới.</p>
          </div>
        )}

        {!isLoading && filteredMatches.length > 0 && (
          <div className="space-y-6 md:space-y-8">
            {Object.entries(grouped).map(([date, dateMatches]) => (
              <section key={date}>
                <h2 className="text-xs md:text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                  {date}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {dateMatches.map((match: Match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <AdSlot size="rectangle" className="mt-8 mx-auto max-w-md" />

        {/* Standings */}
        <section className="mt-8 md:mt-10">
          <h2 className="text-lg md:text-xl font-bold mb-4">Bảng xếp hạng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {LEAGUES.map((league) => (
              <StandingsCard key={league.code} league={league} />
            ))}
          </div>
        </section>

        <footer className="mt-10 md:mt-12 py-6 border-t border-border text-center text-xs text-text-muted">
          <p>MatchDay Analyst — Nhận định bóng đá trước trận</p>
          <p className="mt-1">Dữ liệu từ Football-Data.org</p>
          <div className="mt-2 flex gap-4 justify-center">
            <Link href="/about" className="hover:text-text-primary transition-colors">Giới thiệu</Link>
            <Link href="/privacy" className="hover:text-text-primary transition-colors">Chính sách bảo mật</Link>
          </div>
        </footer>
      </main>
    </>
  );
}
