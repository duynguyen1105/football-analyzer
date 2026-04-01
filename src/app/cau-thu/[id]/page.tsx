"use client";

import { use } from "react";
import { Navbar } from "@/components/Navbar";
import { usePlayerProfile, usePlayerTransfers, usePlayerTrophies } from "@/lib/hooks";
import Link from "next/link";

const POSITION_VI: Record<string, string> = {
  Goalkeeper: "Thủ môn",
  Defender: "Hậu vệ",
  Midfielder: "Tiền vệ",
  Attacker: "Tiền đạo",
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-bg-primary/50 rounded-xl p-3 text-center">
      <p className="text-2xl font-bold text-accent">{value}</p>
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
          <div className="w-32 h-32 rounded-full bg-border/20 animate-pulse mx-auto md:mx-0" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 bg-border/30 rounded animate-pulse" />
            <div className="h-4 w-32 bg-border/20 rounded animate-pulse" />
            <div className="h-4 w-40 bg-border/20 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TransfersSection({ playerId }: { playerId: string }) {
  const { data: transfers, isLoading } = usePlayerTransfers(playerId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-border/20 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!transfers || transfers.length === 0) {
    return <p className="text-sm text-text-muted">Không có thông tin chuyển nhượng</p>;
  }

  return (
    <div className="space-y-2">
      {transfers.map((t: any, i: number) => (
        <div key={i} className="flex items-center gap-3 py-2 px-3 bg-bg-primary/50 rounded-lg">
          <span className="text-xs text-text-muted w-20 shrink-0">{t.date}</span>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {t.teamOut.logo && (
              <img src={t.teamOut.logo} alt="" className="w-5 h-5 object-contain" />
            )}
            <span className="text-sm truncate">{t.teamOut.name || "—"}</span>
          </div>
          <span className="text-text-muted">→</span>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {t.teamIn.logo && (
              <img src={t.teamIn.logo} alt="" className="w-5 h-5 object-contain" />
            )}
            <span className="text-sm truncate">{t.teamIn.name}</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded ${
            t.type === "Free" ? "bg-green-500/20 text-green-400" :
            t.type === "Loan" ? "bg-blue-500/20 text-blue-400" :
            "bg-accent/20 text-accent"
          }`}>
            {t.type === "Free" ? "Miễn phí" : t.type === "Loan" ? "Cho mượn" : t.type === "N/A" ? "" : "Chuyển nhượng"}
          </span>
        </div>
      ))}
    </div>
  );
}

function TrophiesSection({ playerId }: { playerId: string }) {
  const { data: trophies, isLoading } = usePlayerTrophies(playerId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-border/20 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!trophies || trophies.length === 0) {
    return <p className="text-sm text-text-muted">Chưa có danh hiệu</p>;
  }

  // Group by league
  const grouped = trophies.reduce((acc: Record<string, any[]>, t: any) => {
    const key = t.league;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.entries(grouped).slice(0, 8).map(([league, items]) => (
        <div key={league} className="bg-bg-primary/50 rounded-lg p-3">
          <p className="text-sm font-medium mb-1">{league}</p>
          <div className="flex flex-wrap gap-1">
            {(items as any[]).map((t, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-accent/10 text-accent rounded">
                {t.place === "Winner" ? "🏆" : "🥈"} {t.season}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: player, isLoading, error } = usePlayerProfile(id);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <ProfileSkeleton />
      </>
    );
  }

  if (error || !player || player.error) {
    return (
      <>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-20 text-center xl:px-8">
          <p className="text-text-muted text-lg">Không tìm thấy cầu thủ.</p>
          <Link href="/" className="text-accent mt-4 inline-block hover:underline">Về trang chủ</Link>
        </main>
      </>
    );
  }

  const mainStats = player.statistics?.[0];
  const position = POSITION_VI[player.position] || player.position;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 xl:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
          <Link href="/" className="hover:text-text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-text-secondary">Cầu thủ</span>
          <span>/</span>
          <span className="text-text-secondary">{player.name}</span>
        </div>

        {/* Profile Header */}
        <div className="bg-bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="shrink-0 mx-auto md:mx-0">
              {player.photo ? (
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-border"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-border/20 flex items-center justify-center text-4xl">
                  👤
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                {player.currentTeam?.logo && (
                  <Link href={`/doi-bong/${player.currentTeam.id}`}>
                    <img src={player.currentTeam.logo} alt="" className="w-8 h-8 object-contain" />
                  </Link>
                )}
                <h1 className="text-2xl md:text-3xl font-bold">{player.name}</h1>
                {player.number && (
                  <span className="text-2xl font-bold text-accent">#{player.number}</span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-text-secondary mb-4">
                {player.currentTeam && (
                  <Link href={`/doi-bong/${player.currentTeam.id}`} className="hover:text-accent transition-colors">
                    {player.currentTeam.name}
                  </Link>
                )}
                <span className="text-text-muted">•</span>
                <span>{position}</span>
                <span className="text-text-muted">•</span>
                <span>{player.nationality}</span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-text-muted">
                {player.age > 0 && <span>🎂 {player.age} tuổi</span>}
                {player.height && <span>📏 {player.height}</span>}
                {player.weight && <span>⚖️ {player.weight}</span>}
                {player.birthPlace && <span>📍 {player.birthPlace}, {player.birthCountry}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Season Stats */}
            {mainStats && (
              <section className="bg-bg-card rounded-2xl border border-border p-5">
                <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Thống kê mùa giải
                  {mainStats.league?.name && (
                    <span className="text-text-muted font-normal">— {mainStats.league.name}</span>
                  )}
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <StatCard label="Trận đấu" value={mainStats.games?.appearences ?? 0} sub={`${mainStats.games?.minutes ?? 0} phút`} />
                  <StatCard label="Bàn thắng" value={mainStats.goals?.total ?? 0} />
                  <StatCard label="Kiến tạo" value={mainStats.goals?.assists ?? 0} />
                  <StatCard label="Đánh giá" value={mainStats.games?.rating ? parseFloat(mainStats.games.rating).toFixed(1) : "—"} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard label="Sút" value={mainStats.shots?.total ?? 0} sub={`${mainStats.shots?.on ?? 0} trúng đích`} />
                  <StatCard label="Chuyền" value={mainStats.passes?.total ?? 0} sub={mainStats.passes?.accuracy ? `${mainStats.passes.accuracy}% chính xác` : undefined} />
                  <StatCard label="Tắc bóng" value={mainStats.tackles?.total ?? 0} sub={`${mainStats.tackles?.interceptions ?? 0} chặn`} />
                  <StatCard label="Rê bóng" value={mainStats.dribbles?.success ?? 0} sub={`/${mainStats.dribbles?.attempts ?? 0} lần thử`} />
                </div>

                <div className="flex gap-4 mt-4 pt-4 border-t border-border/50 justify-center">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-5 bg-yellow-400 rounded-sm" />
                    <span className="text-sm">{mainStats.cards?.yellow ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-5 bg-red-500 rounded-sm" />
                    <span className="text-sm">{mainStats.cards?.red ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <span>Phạm lỗi: {mainStats.fouls?.committed ?? 0}</span>
                    <span>•</span>
                    <span>Bị phạm lỗi: {mainStats.fouls?.drawn ?? 0}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Transfers */}
            <section className="bg-bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Lịch sử chuyển nhượng
              </h2>
              <TransfersSection playerId={id} />
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trophies */}
            <section className="bg-bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                Danh hiệu
              </h2>
              <TrophiesSection playerId={id} />
            </section>

            {/* Other leagues stats */}
            {player.statistics && player.statistics.length > 1 && (
              <section className="bg-bg-card rounded-2xl border border-border p-5">
                <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Thống kê các giải khác
                </h2>
                <div className="space-y-3">
                  {player.statistics.slice(1, 4).map((stat: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-bg-primary/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {stat.league?.logo && (
                          <img src={stat.league.logo} alt="" className="w-5 h-5 object-contain" />
                        )}
                        <span className="text-sm truncate">{stat.league?.name}</span>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <span>{stat.games?.appearences ?? 0} trận</span>
                        <span className="text-accent font-bold">{stat.goals?.total ?? 0} bàn</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
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
