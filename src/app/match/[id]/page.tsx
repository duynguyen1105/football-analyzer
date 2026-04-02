"use client";

import { use } from "react";
import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AdSlot } from "@/components/AdSlot";
import { AiAnalysis } from "@/components/AiAnalysis";
import { RecentResults } from "@/components/RecentResults";
import { KeyPlayers } from "@/components/KeyPlayers";
import { PlayerAnalysis } from "@/components/PlayerAnalysis";
import { HomeAwayForm } from "@/components/HomeAwayForm";
import { MatchCountdown } from "@/components/MatchCountdown";
import { MatchImportance } from "@/components/MatchImportance";
import { RefereeInfo } from "@/components/RefereeInfo";
import { QuickSummary } from "@/components/QuickSummary";
import { ShareButton } from "@/components/ShareButton";
import { MatchOdds } from "@/components/MatchOdds";
import { MatchInjuries } from "@/components/MatchInjuries";
import { MatchLineups } from "@/components/MatchLineups";
import { MatchEvents } from "@/components/MatchEvents";
import { MatchStatistics } from "@/components/MatchStatistics";
import {
  useMatchCore,
  useMatchForm,
  useMatchH2H,
  useMatchTeams,
  useMatchScorers,
} from "@/lib/hooks";
import { Standing } from "@/lib/types";
import Link from "next/link";

function FormBadge({ result }: { result: string }) {
  const cls = result === "W" ? "badge-w" : result === "D" ? "badge-d" : "badge-l";
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-lg text-[10px] md:text-xs font-bold ${cls}`}>
      {result}
    </span>
  );
}

function StatCompare({ label, homeVal, awayVal }: { label: string; homeVal: number; awayVal: number }) {
  const total = homeVal + awayVal || 1;
  const homePct = (homeVal / total) * 100;
  return (
    <div className="py-3">
      <div className="flex justify-between text-sm mb-1.5">
        <span className={homeVal > awayVal ? "font-bold text-accent" : "text-text-secondary"}>{homeVal}</span>
        <span className="text-text-muted text-xs">{label}</span>
        <span className={awayVal > homeVal ? "font-bold text-accent-2" : "text-text-secondary"}>{awayVal}</span>
      </div>
      <div className="flex gap-1">
        <div className="flex-1 stat-bar">
          <div className="stat-bar-fill bg-accent" style={{ width: `${homePct}%`, float: "right" }} />
        </div>
        <div className="flex-1 stat-bar">
          <div className="stat-bar-fill bg-accent-2" style={{ width: `${100 - homePct}%` }} />
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="bg-bg-card rounded-2xl border border-border p-5">
      <div className="h-4 w-32 bg-border/40 rounded animate-pulse mb-4" />
      <div className="space-y-3">
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="h-9 bg-border/15 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function PredictionAccuracy({ prediction, score, homeTla, awayTla }: {
  prediction: { homeWin: number; draw: number; awayWin: number; btts: number; over25: number };
  score: { home: number | null; away: number | null };
  homeTla: string;
  awayTla: string;
}) {
  const h = score.home ?? 0;
  const a = score.away ?? 0;
  const actualResult = h > a ? "home" : h < a ? "away" : "draw";
  const predictedResult = prediction.homeWin > prediction.draw && prediction.homeWin > prediction.awayWin
    ? "home" : prediction.awayWin > prediction.draw && prediction.awayWin > prediction.homeWin
    ? "away" : "draw";
  const resultCorrect = actualResult === predictedResult;
  const totalGoals = h + a;
  const bttsActual = h > 0 && a > 0;
  const over25Actual = totalGoals > 2.5;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        resultCorrect ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
      }`}>
        {resultCorrect ? "&#10003;" : "&#10007;"} Kết quả: {actualResult === "home" ? `${homeTla} thắng` : actualResult === "away" ? `${awayTla} thắng` : "Hòa"}
      </span>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        bttsActual === (prediction.btts > 50) ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
      }`}>
        {bttsActual === (prediction.btts > 50) ? "&#10003;" : "&#10007;"} BTTS: {bttsActual ? "Có" : "Không"}
      </span>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        over25Actual === (prediction.over25 > 50) ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
      }`}>
        {over25Actual === (prediction.over25 > 50) ? "&#10003;" : "&#10007;"} O2.5: {totalGoals} bàn
      </span>
    </div>
  );
}

function ordinal(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

// --- Form Section (loads independently) ---
function FormSection({ matchId }: { matchId: string }) {
  const { data, isLoading } = useMatchForm(matchId);
  if (isLoading || !data) return null;
  return (
    <div className="flex gap-3 md:gap-6 justify-center mt-3">
      <div className="flex gap-1 md:gap-1.5">
        {(data.homeForm || []).map((r: string, i: number) => <FormBadge key={i} result={r} />)}
      </div>
      <div className="flex gap-1 md:gap-1.5">
        {(data.awayForm || []).map((r: string, i: number) => <FormBadge key={i} result={r} />)}
      </div>
    </div>
  );
}

// --- H2H Section (uses core data, no extra API call) ---
function H2HSection({ h2h, homeTla, awayTla }: { h2h: any; homeTla: string; awayTla: string }) {
  if (!h2h || !h2h.lastMatches || h2h.lastMatches.length === 0) return null;

  return (
    <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-2" />
        Lịch sử đối đầu
      </h3>
      <div className="flex gap-2 mb-4 md:mb-5">
        <div className="flex-1 text-center p-2 md:p-3 rounded-xl bg-accent/10">
          <p className="text-xl md:text-2xl font-bold text-accent">{h2h.homeWins}</p>
          <p className="text-[10px] md:text-xs text-text-muted">{homeTla} Thắng</p>
        </div>
        <div className="flex-1 text-center p-2 md:p-3 rounded-xl bg-accent-yellow/10">
          <p className="text-xl md:text-2xl font-bold text-accent-yellow">{h2h.draws}</p>
          <p className="text-[10px] md:text-xs text-text-muted">Hòa</p>
        </div>
        <div className="flex-1 text-center p-2 md:p-3 rounded-xl bg-accent-2/10">
          <p className="text-xl md:text-2xl font-bold text-accent-2">{h2h.awayWins}</p>
          <p className="text-[10px] md:text-xs text-text-muted">{awayTla} Thắng</p>
        </div>
      </div>
      <div className="space-y-2">
        {h2h.lastMatches.map((m: any, i: number) => (
          <div key={i} className="flex items-center justify-between py-2 px-2 md:px-3 rounded-lg bg-bg-primary/50 text-xs md:text-sm">
            <span className="text-[10px] md:text-xs text-text-muted w-12 md:w-24 shrink-0">{m.date}</span>
            <span className="flex-1 text-right truncate min-w-0">{m.home}</span>
            <span className="mx-1.5 md:mx-3 font-bold px-1.5 md:px-2 py-0.5 rounded bg-white/5 shrink-0">{m.scoreHome} - {m.scoreAway}</span>
            <span className="flex-1 truncate min-w-0">{m.away}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Teams Section (coaches + squads) ---
function TeamsSection({ matchId, homeTeam, awayTeam }: { matchId: string; homeTeam: any; awayTeam: any }) {
  const { data, isLoading } = useMatchTeams(matchId);
  if (isLoading) return <SectionSkeleton lines={3} />;
  if (!data?.homeTeamInfo && !data?.awayTeamInfo) return null;

  return (
    <>
      {/* Managers sidebar card */}
      {(data.homeTeamInfo?.coach || data.awayTeamInfo?.coach) && (
        <section className="bg-bg-card rounded-2xl border border-border p-5">
          <h3 className="font-bold text-sm mb-3">Huấn luyện viên</h3>
          <div className="space-y-3">
            {data.homeTeamInfo?.coach && (
              <div className="flex items-center gap-3">
                {data.homeTeamInfo.coach.photo ? (
                  <img src={data.homeTeamInfo.coach.photo} alt="" className="w-10 h-10 rounded-full object-cover bg-border/20" />
                ) : (
                  <img src={homeTeam.crest} alt="" className="w-8 h-8 object-contain" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{data.homeTeamInfo.coach.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <img src={homeTeam.crest} alt="" className="w-4 h-4 object-contain" />
                    <span>{data.homeTeamInfo.coach.nationality}</span>
                  </div>
                </div>
              </div>
            )}
            {data.awayTeamInfo?.coach && (
              <div className="flex items-center gap-3">
                {data.awayTeamInfo.coach.photo ? (
                  <img src={data.awayTeamInfo.coach.photo} alt="" className="w-10 h-10 rounded-full object-cover bg-border/20" />
                ) : (
                  <img src={awayTeam.crest} alt="" className="w-8 h-8 object-contain" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{data.awayTeamInfo.coach.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <img src={awayTeam.crest} alt="" className="w-4 h-4 object-contain" />
                    <span>{data.awayTeamInfo.coach.nationality}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}

// --- Scorers Section ---
function ScorersSection({ matchId, homeTeamName, awayTeamName }: { matchId: string; homeTeamName: string; awayTeamName: string }) {
  const { data: scorers, isLoading } = useMatchScorers(matchId);
  if (isLoading) return <SectionSkeleton lines={3} />;

  const relevant = (scorers || []).filter(
    (s: any) => s.team === homeTeamName || s.team === awayTeamName
  );
  if (relevant.length === 0) return null;

  return (
    <section className="bg-bg-card rounded-2xl border border-border p-5">
      <h3 className="font-bold text-sm mb-3">Cầu thủ chủ chốt — Vua phá lưới</h3>
      <div className="space-y-2">
        {relevant.map((s: any, i: number) => (
          <Link
            key={i}
            href={s.id ? `/cau-thu/${s.id}` : "#"}
            className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-bg-primary/50 transition-colors"
          >
            {s.photo ? (
              <img src={s.photo} alt="" className="w-10 h-10 rounded-full object-cover bg-border/20 shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-border/20 flex items-center justify-center text-sm shrink-0">👤</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.name}</p>
              <p className="text-xs text-text-muted truncate">{s.team}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-accent font-bold">{s.goals}</span>
              <p className="text-[10px] text-text-muted">bàn thắng</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// --- Main Page ---
export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: core, isLoading: coreLoading } = useMatchCore(id);

  if (coreLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-6 xl:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-3 w-16 bg-border/30 rounded animate-pulse" />
            <div className="h-3 w-2 bg-border/20 rounded animate-pulse" />
            <div className="h-3 w-24 bg-border/30 rounded animate-pulse" />
            <div className="h-3 w-2 bg-border/20 rounded animate-pulse" />
            <div className="h-3 w-32 bg-border/40 rounded animate-pulse" />
          </div>

          {/* Match header */}
          <div className="bg-bg-card rounded-2xl border border-border p-4 md:p-6 mb-6">
            <div className="flex justify-center mb-2">
              <div className="h-3 w-48 bg-border/30 rounded animate-pulse" />
            </div>
            <div className="flex items-center justify-between py-3 md:py-4">
              <div className="flex-1 flex flex-col items-center gap-2 md:gap-3">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-border/20 rounded-full animate-pulse" />
                <div className="h-4 md:h-5 w-16 md:w-20 bg-border/40 rounded animate-pulse" />
                <div className="h-3 w-14 md:w-16 bg-border/20 rounded animate-pulse" />
              </div>
              <div className="px-2 md:px-6 flex flex-col items-center gap-2">
                <div className="h-3 w-10 bg-border/20 rounded animate-pulse" />
                <div className="h-7 md:h-9 w-14 md:w-16 bg-border/40 rounded animate-pulse" />
                <div className="h-3 w-20 md:w-28 bg-border/20 rounded animate-pulse" />
              </div>
              <div className="flex-1 flex flex-col items-center gap-2 md:gap-3">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-border/20 rounded-full animate-pulse" />
                <div className="h-4 md:h-5 w-16 md:w-20 bg-border/40 rounded animate-pulse" />
                <div className="h-3 w-14 md:w-16 bg-border/20 rounded animate-pulse" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SectionSkeleton />
              <SectionSkeleton />
            </div>
            <div className="space-y-6">
              <SectionSkeleton lines={3} />
              <SectionSkeleton lines={3} />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!core?.match) {
    return (
      <>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-20 text-center xl:px-8">
          <p className="text-text-muted text-lg">Không tìm thấy trận đấu.</p>
          <Link href="/" className="text-accent mt-4 inline-block hover:underline">Về trang chủ</Link>
        </main>
      </>
    );
  }

  const { match, standings, homeStanding, awayStanding, prediction } = core;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 xl:px-8">
        <Breadcrumbs items={[
          { label: match.competition.name, href: "/" },
          { label: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}` },
        ]} />

        {/* Match header */}
        <div className="bg-bg-card rounded-2xl border border-border p-4 md:p-6 mb-6">
          <div className="text-center mb-2">
            <span className="text-[10px] md:text-xs text-text-muted">{match.competition.name} — {match.venue}</span>
          </div>
          <div className="flex items-center justify-between py-3 md:py-4">
            <Link href={`/doi-bong/${match.homeTeam.id}`} className="flex-1 text-center min-w-0 hover:opacity-80 transition-opacity">
              <div className="flex justify-center mb-2 md:mb-3">
                <img src={match.homeTeam.crest} alt={match.homeTeam.shortName} className="w-14 h-14 md:w-20 md:h-20 object-contain" />
              </div>
              <h2 className="text-sm md:text-xl font-bold truncate px-1">{match.homeTeam.shortName}</h2>
              {homeStanding && (
                <p className="text-[10px] md:text-xs text-text-muted mt-1">{ordinal(homeStanding.position)} — {homeStanding.points} pts</p>
              )}
            </Link>
            <div className="px-2 md:px-6 text-center shrink-0">
              {match.status === "FINISHED" && match.score ? (
                <>
                  <span className="inline-block text-[10px] font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full mb-1">Kết thúc</span>
                  <p className="text-2xl md:text-4xl font-bold">{match.score.home} - {match.score.away}</p>
                  {match.scoreHT && (
                    <p className="text-[10px] md:text-xs text-text-muted mt-1">Hiệp 1: {match.scoreHT.home} - {match.scoreHT.away}</p>
                  )}
                </>
              ) : match.status === "IN_PLAY" || match.status === "LIVE" ? (
                <>
                  <span className="inline-block text-[10px] font-semibold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full mb-1 animate-pulse">Đang diễn ra</span>
                  <p className="text-2xl md:text-4xl font-bold">{match.score?.home ?? 0} - {match.score?.away ?? 0}</p>
                </>
              ) : (
                <>
                  <p className="text-xs md:text-sm text-text-muted">Giờ đá</p>
                  <p className="text-2xl md:text-3xl font-bold my-1 md:my-2">{match.time}</p>
                </>
              )}
              <p className="text-[10px] md:text-xs text-text-muted mt-1">
                {new Date(match.date + "T00:00:00").toLocaleDateString("vi-VN", {
                  weekday: "short", day: "numeric", month: "short", year: "numeric",
                })}
              </p>
            </div>
            <Link href={`/doi-bong/${match.awayTeam.id}`} className="flex-1 text-center min-w-0 hover:opacity-80 transition-opacity">
              <div className="flex justify-center mb-2 md:mb-3">
                <img src={match.awayTeam.crest} alt={match.awayTeam.shortName} className="w-14 h-14 md:w-20 md:h-20 object-contain" />
              </div>
              <h2 className="text-sm md:text-xl font-bold truncate px-1">{match.awayTeam.shortName}</h2>
              {awayStanding && (
                <p className="text-[10px] md:text-xs text-text-muted mt-1">{ordinal(awayStanding.position)} — {awayStanding.points} pts</p>
              )}
            </Link>
          </div>
          {/* Form loads independently */}
          <FormSection matchId={id} />

          {/* Referee */}
          <RefereeInfo referee={match.referee} />

          {/* Importance + Countdown + Share */}
          <div className="mt-3 space-y-2">
            {core.importance && (
              <MatchImportance score={core.importance.score} reason={core.importance.reason} />
            )}
            {match.status !== "FINISHED" && (
              <MatchCountdown matchDate={match.date} matchTime={match.time} />
            )}
            <div className="flex justify-center">
              <ShareButton homeTeam={match.homeTeam.shortName} awayTeam={match.awayTeam.shortName} matchId={match.id} />
            </div>
          </div>
        </div>

        <AdSlot size="leaderboard" className="mb-6" />

        {/* Quick Summary — loads independently */}
        <QuickSummary matchId={id} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">

            {/* ═══ FINISHED / LIVE: Match result sections first ═══ */}
            {(match.status === "FINISHED" || match.status === "IN_PLAY" || match.status === "LIVE") && (
              <>
                <MatchEvents
                  matchId={id}
                  homeTeamId={match.homeTeam.id}
                  awayTeamId={match.awayTeam.id}
                />
                <MatchStatistics
                  matchId={id}
                  homeTeamName={match.homeTeam.shortName}
                  awayTeamName={match.awayTeam.shortName}
                />
                <MatchLineups matchId={id} />
              </>
            )}

            {/* ═══ Prediction ═══ */}
            <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
              <h3 className="font-bold text-sm mb-3 md:mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {match.status === "FINISHED" ? "Dự đoán trước trận" : "Dự đoán trận đấu"}
              </h3>
              {/* Prediction accuracy for finished matches */}
              {match.status === "FINISHED" && match.score && (
                <PredictionAccuracy
                  prediction={prediction}
                  score={match.score}
                  homeTla={match.homeTeam.tla}
                  awayTla={match.awayTeam.tla}
                />
              )}
              <div className="flex gap-2 mb-3 md:mb-4">
                {[
                  { label: match.homeTeam.tla, pct: prediction.homeWin, color: "bg-accent" },
                  { label: "Hòa", pct: prediction.draw, color: "bg-accent-yellow" },
                  { label: match.awayTeam.tla, pct: prediction.awayWin, color: "bg-accent-2" },
                ].map((p: any) => (
                  <div key={p.label} className="flex-1 text-center">
                    <div className="text-xl md:text-2xl font-bold">{p.pct}%</div>
                    <div className="text-[10px] md:text-xs text-text-muted mt-1">{p.label}</div>
                    <div className="mt-2 h-1.5 md:h-2 rounded-full bg-border overflow-hidden">
                      <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 pt-3 border-t border-border/50">
                <div className="flex-1 text-center">
                  <p className="text-base md:text-lg font-bold">{prediction.btts}%</p>
                  <p className="text-[10px] md:text-xs text-text-muted">Cả hai ghi bàn</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-base md:text-lg font-bold">{prediction.over25}%</p>
                  <p className="text-[10px] md:text-xs text-text-muted">Trên 2.5 bàn</p>
                </div>
              </div>
            </section>

            {/* ═══ SCHEDULED: Odds before other sections ═══ */}
            {match.status !== "FINISHED" && match.status !== "IN_PLAY" && match.status !== "LIVE" && (
              <MatchOdds matchId={id} />
            )}

            {/* H2H */}
            <H2HSection h2h={core.h2h} homeTla={match.homeTeam.tla} awayTla={match.awayTeam.tla} />

            {/* Season Stats */}
            {homeStanding && awayStanding && (
              <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
                <h3 className="font-bold text-sm mb-3 md:mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />
                  Thống kê mùa giải
                </h3>
                <div className="flex justify-between text-xs text-text-muted mb-2 px-1">
                  <span className="text-accent font-semibold">{match.homeTeam.tla}</span>
                  <span className="text-accent-2 font-semibold">{match.awayTeam.tla}</span>
                </div>
                <div className="divide-y divide-border/30">
                  <StatCompare label="Bàn thắng" homeVal={homeStanding.goalsFor} awayVal={awayStanding.goalsFor} />
                  <StatCompare label="Bàn thua" homeVal={homeStanding.goalsAgainst} awayVal={awayStanding.goalsAgainst} />
                  <StatCompare label="Thắng" homeVal={homeStanding.won} awayVal={awayStanding.won} />
                  <StatCompare label="Hòa" homeVal={homeStanding.draw} awayVal={awayStanding.draw} />
                  <StatCompare label="Thua" homeVal={homeStanding.lost} awayVal={awayStanding.lost} />
                  <StatCompare label="Hiệu số" homeVal={Math.max(0, homeStanding.goalDifference)} awayVal={Math.max(0, awayStanding.goalDifference)} />
                </div>
              </section>
            )}

            {/* ═══ SCHEDULED: Lineups, Injuries, etc. ═══ */}
            {match.status !== "FINISHED" && match.status !== "IN_PLAY" && match.status !== "LIVE" && (
              <>
                <MatchLineups matchId={id} />
                <MatchInjuries
                  matchId={id}
                  homeTeamId={match.homeTeam.id}
                  awayTeamId={match.awayTeam.id}
                  homeTeamName={match.homeTeam.shortName}
                  awayTeamName={match.awayTeam.shortName}
                />
              </>
            )}

            {/* Recent Results */}
            <RecentResults
              matchId={id}
              homeTeamId={match.homeTeam.id}
              awayTeamId={match.awayTeam.id}
              homeTeamName={match.homeTeam.shortName}
              awayTeamName={match.awayTeam.shortName}
            />

            {/* Key Players */}
            <KeyPlayers
              matchId={id}
              homeTeam={{ name: match.homeTeam.name, shortName: match.homeTeam.shortName, crest: match.homeTeam.crest }}
              awayTeam={{ name: match.awayTeam.name, shortName: match.awayTeam.shortName, crest: match.awayTeam.crest }}
            />

            {/* FINISHED: Odds + Injuries after main content */}
            {(match.status === "FINISHED" || match.status === "IN_PLAY" || match.status === "LIVE") && (
              <>
                <MatchOdds matchId={id} />
                <MatchInjuries
                  matchId={id}
                  homeTeamId={match.homeTeam.id}
                  awayTeamId={match.awayTeam.id}
                  homeTeamName={match.homeTeam.shortName}
                  awayTeamName={match.awayTeam.shortName}
                />
              </>
            )}

            {/* Player Analysis */}
            <PlayerAnalysis
              matchId={id}
              homeTeamName={match.homeTeam.shortName}
              awayTeamName={match.awayTeam.shortName}
            />

            {/* Home/Away Form */}
            <HomeAwayForm
              homeTeamId={match.homeTeam.id}
              awayTeamId={match.awayTeam.id}
              homeTeamName={match.homeTeam.shortName}
              awayTeamName={match.awayTeam.shortName}
            />

            {/* AI Analysis */}
            <AiAnalysis matchId={id} />
          </div>

          {/* Sidebar — each section loads independently */}
          <div className="space-y-6">
            <AdSlot size="rectangle" />

            {/* Standings — instant from core */}
            {standings && standings.length > 0 && (
              <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
                <h3 className="font-bold text-sm mb-3">Bảng xếp hạng</h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-text-muted">
                      <th className="text-left py-1">#</th>
                      <th className="text-left py-1">Đội</th>
                      <th className="text-center py-1">T</th>
                      <th className="text-center py-1">H</th>
                      <th className="text-center py-1">B</th>
                      <th className="text-center py-1">Đ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.slice(0, 8).map((s: Standing) => {
                      const isHome = s.team.id === match.homeTeam.id;
                      const isAway = s.team.id === match.awayTeam.id;
                      return (
                        <tr key={s.team.id} className={`border-t border-border/30 ${isHome ? "text-accent" : isAway ? "text-accent-2" : "text-text-secondary"}`}>
                          <td className="py-1.5">{s.position}</td>
                          <td className="py-1.5">
                            <Link href={`/doi-bong/${s.team.id}`} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                              <img src={s.team.crest} alt="" className="w-3.5 h-3.5 object-contain" />
                              <span className="font-medium">{s.team.tla}</span>
                            </Link>
                          </td>
                          <td className="py-1.5 text-center">{s.won}</td>
                          <td className="py-1.5 text-center">{s.draw}</td>
                          <td className="py-1.5 text-center">{s.lost}</td>
                          <td className="py-1.5 text-center font-bold">{s.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
            )}

            {/* Teams (coaches) — loads independently */}
            <TeamsSection matchId={id} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />

            {/* Scorers — loads independently */}
            <ScorersSection matchId={id} homeTeamName={match.homeTeam.name} awayTeamName={match.awayTeam.name} />

            <AdSlot size="rectangle" />
          </div>
        </div>

        <footer className="mt-8 py-6 border-t border-border text-center text-xs text-text-muted">
          <p>MatchDay Analyst — Nhận định bóng đá trước trận</p>
          <div className="mt-2 flex gap-4 justify-center">
            <Link href="/about" className="hover:text-text-primary transition-colors">Giới thiệu</Link>
            <Link href="/privacy" className="hover:text-text-primary transition-colors">Chính sách bảo mật</Link>
          </div>
        </footer>
      </main>
    </>
  );
}
