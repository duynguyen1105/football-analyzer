"use client";

import { use } from "react";
import { Navbar } from "@/components/Navbar";
import { useTeamProfile, useTeamSquad, useTeamStats, useTeamRecent } from "@/lib/hooks";
import { LEAGUES } from "@/lib/constants";
import Link from "next/link";

const POSITION_VI: Record<string, string> = {
  Goalkeeper: "Thủ môn",
  Defender: "Hậu vệ",
  Midfielder: "Tiền vệ",
  Attacker: "Tiền đạo",
};

const POSITION_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-bg-primary/50 rounded-xl p-3 text-center">
      <p className="text-xl font-bold text-accent">{value}</p>
      <p className="text-xs text-text-muted mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-text-muted">{sub}</p>}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 xl:px-8">
      <div className="bg-bg-card rounded-2xl border border-border p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 bg-border/20 animate-pulse mx-auto md:mx-0" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 bg-border/30 rounded animate-pulse" />
            <div className="h-4 w-32 bg-border/20 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SquadSection({ teamId }: { teamId: string }) {
  const { data: squad, isLoading } = useTeamSquad(teamId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-20 bg-border/20 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!squad || squad.length === 0) {
    return <p className="text-sm text-text-muted">Không có thông tin đội hình</p>;
  }

  // Group by position
  const grouped = POSITION_ORDER.reduce((acc, pos) => {
    acc[pos] = squad.filter((p: any) => p.position === pos);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      {POSITION_ORDER.map((pos) => {
        const players = grouped[pos];
        if (!players || players.length === 0) return null;

        return (
          <div key={pos}>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
              {POSITION_VI[pos] || pos} ({players.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {players.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/cau-thu/${p.id}`}
                  className="flex items-center gap-3 p-3 bg-bg-primary/50 rounded-lg hover:bg-bg-primary transition-colors"
                >
                  {p.photo ? (
                    <img src={p.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-border/20 flex items-center justify-center text-sm">👤</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-text-muted">
                      {p.number ? `#${p.number}` : ""} {p.age ? `• ${p.age} tuổi` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecentMatchesSection({ teamId }: { teamId: string }) {
  const { data: matches, isLoading } = useTeamRecent(teamId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-border/20 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return <p className="text-sm text-text-muted">Không có dữ liệu trận đấu</p>;
  }

  const teamIdNum = parseInt(teamId, 10);

  return (
    <div className="space-y-2">
      {matches.slice(0, 8).map((m: any) => {
        const isHome = m.homeTeam?.id === teamIdNum;
        const teamGoals = isHome ? m.score?.fullTime?.home : m.score?.fullTime?.away;
        const oppGoals = isHome ? m.score?.fullTime?.away : m.score?.fullTime?.home;
        const opponent = isHome ? m.awayTeam : m.homeTeam;
        const result = teamGoals > oppGoals ? "W" : teamGoals < oppGoals ? "L" : "D";
        const resultClass = result === "W" ? "bg-green-500/20 text-green-400" :
                           result === "L" ? "bg-red-500/20 text-red-400" :
                           "bg-yellow-500/20 text-yellow-400";

        return (
          <Link
            key={m.id}
            href={`/match/${m.id}`}
            className="flex items-center gap-3 py-2 px-3 bg-bg-primary/50 rounded-lg hover:bg-bg-primary transition-colors"
          >
            <span className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${resultClass}`}>
              {result}
            </span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {opponent?.crest && (
                <img src={opponent.crest} alt="" className="w-5 h-5 object-contain" />
              )}
              <span className="text-sm truncate">{opponent?.shortName || opponent?.name}</span>
            </div>
            <span className="text-sm font-bold">{teamGoals} - {oppGoals}</span>
            <span className="text-[10px] text-text-muted">{isHome ? "Sân nhà" : "Sân khách"}</span>
          </Link>
        );
      })}
    </div>
  );
}

function StatsSection({ teamId, leagueId }: { teamId: string; leagueId: number }) {
  const { data: stats, isLoading } = useTeamStats(teamId, leagueId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-20 bg-border/20 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return <p className="text-sm text-text-muted">Không có dữ liệu thống kê</p>;
  }

  return (
    <div>
      {/* Form */}
      {stats.form && (
        <div className="mb-4">
          <p className="text-xs text-text-muted mb-2">Phong độ gần đây</p>
          <div className="flex gap-1">
            {stats.form.split("").slice(-10).map((r: string, i: number) => (
              <span
                key={i}
                className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                  r === "W" ? "bg-green-500/20 text-green-400" :
                  r === "L" ? "bg-red-500/20 text-red-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard label="Trận đấu" value={stats.fixtures?.played?.total ?? 0} />
        <StatCard label="Thắng" value={stats.fixtures?.wins?.total ?? 0} />
        <StatCard label="Hòa" value={stats.fixtures?.draws?.total ?? 0} />
        <StatCard label="Thua" value={stats.fixtures?.loses?.total ?? 0} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Bàn thắng" value={stats.goals?.for?.total ?? 0} sub={`TB: ${stats.goals?.for?.average?.total ?? 0}/trận`} />
        <StatCard label="Bàn thua" value={stats.goals?.against?.total ?? 0} sub={`TB: ${stats.goals?.against?.average?.total ?? 0}/trận`} />
        <StatCard label="Sạch lưới" value={stats.cleanSheet?.total ?? 0} />
        <StatCard label="Không ghi bàn" value={stats.failedToScore?.total ?? 0} />
      </div>

      {/* Home vs Away */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-text-muted mb-2">Sân nhà</p>
            <div className="space-y-1 text-sm">
              <p>Thắng: <span className="font-bold text-green-400">{stats.fixtures?.wins?.home ?? 0}</span></p>
              <p>Hòa: <span className="font-bold text-yellow-400">{stats.fixtures?.draws?.home ?? 0}</span></p>
              <p>Thua: <span className="font-bold text-red-400">{stats.fixtures?.loses?.home ?? 0}</span></p>
              {stats.biggestWin?.home && <p className="text-text-muted">Thắng đậm: {stats.biggestWin.home}</p>}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted mb-2">Sân khách</p>
            <div className="space-y-1 text-sm">
              <p>Thắng: <span className="font-bold text-green-400">{stats.fixtures?.wins?.away ?? 0}</span></p>
              <p>Hòa: <span className="font-bold text-yellow-400">{stats.fixtures?.draws?.away ?? 0}</span></p>
              <p>Thua: <span className="font-bold text-red-400">{stats.fixtures?.loses?.away ?? 0}</span></p>
              {stats.biggestWin?.away && <p className="text-text-muted">Thắng đậm: {stats.biggestWin.away}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: team, isLoading, error } = useTeamProfile(id);

  // Use the leagueId from the profile (detected via API), fallback to PL
  const teamLeagueId = team?.leagueId ?? LEAGUES[0].id;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <ProfileSkeleton />
      </>
    );
  }

  if (error || !team || team.error) {
    return (
      <>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-20 text-center xl:px-8">
          <p className="text-text-muted text-lg">Không tìm thấy đội bóng.</p>
          <Link href="/" className="text-accent mt-4 inline-block hover:underline">Về trang chủ</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 xl:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
          <Link href="/" className="hover:text-text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-text-secondary">Đội bóng</span>
          <span>/</span>
          <span className="text-text-secondary">{team.name}</span>
        </div>

        {/* Profile Header */}
        <div className="bg-bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="shrink-0 mx-auto md:mx-0">
              {team.logo ? (
                <img src={team.logo} alt={team.name} className="w-24 h-24 object-contain" />
              ) : (
                <div className="w-24 h-24 bg-border/20 flex items-center justify-center text-4xl">⚽</div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{team.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-text-secondary mb-4">
                {team.code && <span className="px-2 py-0.5 bg-accent/10 text-accent rounded">{team.code}</span>}
                {team.country && <span>{team.country}</span>}
                {team.founded > 0 && (
                  <>
                    <span className="text-text-muted">•</span>
                    <span>Thành lập: {team.founded}</span>
                  </>
                )}
              </div>

              {/* Venue */}
              {team.venue?.name && (
                <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-bg-primary/50 rounded-xl">
                  {team.venue.image && (
                    <img src={team.venue.image} alt={team.venue.name} className="w-32 h-20 object-cover rounded-lg" />
                  )}
                  <div className="text-center md:text-left">
                    <p className="font-medium">🏟️ {team.venue.name}</p>
                    <p className="text-xs text-text-muted">
                      {team.venue.city && `${team.venue.city}`}
                      {team.venue.capacity > 0 && ` • Sức chứa: ${team.venue.capacity.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Season Stats */}
            <section className="bg-bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Thống kê mùa giải
              </h2>
              <StatsSection teamId={id} leagueId={teamLeagueId} />
            </section>

            {/* Squad */}
            <section className="bg-bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Đội hình
              </h2>
              <SquadSection teamId={id} />
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Matches */}
            <section className="bg-bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Trận đấu gần đây
              </h2>
              <RecentMatchesSection teamId={id} />
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 py-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>MatchDay Analyst — Nhận định bóng đá trước trận</p>
          <div className="mt-1 flex gap-3 justify-center">
            <Link href="/" className="hover:text-text-primary">Trang chủ</Link>
            <Link href="/about" className="hover:text-text-primary">Giới thiệu</Link>
          </div>
        </footer>
      </main>
    </>
  );
}
