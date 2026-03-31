import { Navbar } from "@/components/Navbar";
import { AdSlot } from "@/components/AdSlot";
import { AiAnalysis } from "@/components/AiAnalysis";
import {
  getMatch,
  getStandings,
  getTeamInfo,
  getTeamRecentMatches,
  getTopScorers,
  computeH2H,
  computeForm,
} from "@/lib/football-data";
import { computePrediction } from "@/lib/prediction";
import { Standing } from "@/lib/types";
import Link from "next/link";

export const revalidate = 300;

function FormBadge({ result }: { result: string }) {
  const cls = result === "W" ? "badge-w" : result === "D" ? "badge-d" : "badge-l";
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${cls}`}>
      {result}
    </span>
  );
}

function StatCompare({ label, homeVal, awayVal, format = "number" }: {
  label: string; homeVal: number; awayVal: number; format?: "number" | "percent";
}) {
  const total = homeVal + awayVal || 1;
  const homePct = (homeVal / total) * 100;
  const homeWins = homeVal > awayVal;
  const awayWins = awayVal > homeVal;
  return (
    <div className="py-3">
      <div className="flex justify-between text-sm mb-1.5">
        <span className={homeWins ? "font-bold text-accent" : "text-text-secondary"}>
          {format === "percent" ? `${homeVal}%` : homeVal}
        </span>
        <span className="text-text-muted text-xs">{label}</span>
        <span className={awayWins ? "font-bold text-accent-2" : "text-text-secondary"}>
          {format === "percent" ? `${awayVal}%` : awayVal}
        </span>
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

function ordinal(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matchId = parseInt(id, 10);

  const match = await getMatch(matchId);
  if (!match) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-text-muted text-lg">Không tìm thấy trận đấu.</p>
          <Link href="/" className="text-accent mt-4 inline-block hover:underline">Về trang chủ</Link>
        </main>
      </>
    );
  }

  // Fetch all data in parallel
  const [
    standings,
    homeTeamInfo,
    awayTeamInfo,
    homeRecent,
    awayRecent,
    h2h,
    topScorers,
  ] = await Promise.all([
    getStandings(match.competition.code),
    getTeamInfo(match.homeTeam.id),
    getTeamInfo(match.awayTeam.id),
    getTeamRecentMatches(match.homeTeam.id, 10),
    getTeamRecentMatches(match.awayTeam.id, 10),
    computeH2H(match.homeTeam.id, match.awayTeam.id),
    getTopScorers(match.competition.code),
  ]);

  const homeForm = computeForm(match.homeTeam.id, homeRecent);
  const awayForm = computeForm(match.awayTeam.id, awayRecent);

  const homeStanding = standings.find((s) => s.team.id === match.homeTeam.id) || null;
  const awayStanding = standings.find((s) => s.team.id === match.awayTeam.id) || null;

  const prediction = computePrediction(homeStanding, awayStanding, h2h);

  // Top scorers from either team
  const relevantScorers = topScorers.filter(
    (s) => s.team === match.homeTeam.name || s.team === match.awayTeam.name
  );

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
          <Link href="/" className="hover:text-text-primary transition-colors">Home</Link>
          <span>/</span>
          <span>{match.competition.name}</span>
          <span>/</span>
          <span className="text-text-secondary">{match.homeTeam.shortName} vs {match.awayTeam.shortName}</span>
        </div>

        {/* Match header */}
        <div className="bg-bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="text-center mb-2">
            <span className="text-xs text-text-muted">{match.competition.name} — {match.venue}</span>
          </div>
          <div className="flex items-center justify-between py-4">
            <div className="flex-1 text-center">
              <div className="flex justify-center mb-3">
                <img src={match.homeTeam.crest} alt={match.homeTeam.shortName} className="w-20 h-20 object-contain" />
              </div>
              <h2 className="text-xl font-bold">{match.homeTeam.shortName}</h2>
              {homeStanding && (
                <p className="text-xs text-text-muted mt-1">
                  {ordinal(homeStanding.position)} — {homeStanding.points} pts
                </p>
              )}
              {homeTeamInfo?.coach && (
                <p className="text-xs text-text-muted mt-0.5">
                  HLV: {homeTeamInfo.coach.name}
                </p>
              )}
              <div className="flex gap-1.5 justify-center mt-3">
                {homeForm.map((r, i) => <FormBadge key={i} result={r} />)}
              </div>
            </div>

            <div className="px-6 text-center">
              {match.status === "FINISHED" && match.score ? (
                <p className="text-4xl font-bold">{match.score.home} - {match.score.away}</p>
              ) : (
                <>
                  <p className="text-sm text-text-muted">Giờ đá</p>
                  <p className="text-3xl font-bold my-2">{match.time}</p>
                </>
              )}
              <p className="text-xs text-text-muted">
                {new Date(match.date + "T00:00:00").toLocaleDateString("vi-VN", {
                  weekday: "short", day: "numeric", month: "short", year: "numeric",
                })}
              </p>
            </div>

            <div className="flex-1 text-center">
              <div className="flex justify-center mb-3">
                <img src={match.awayTeam.crest} alt={match.awayTeam.shortName} className="w-20 h-20 object-contain" />
              </div>
              <h2 className="text-xl font-bold">{match.awayTeam.shortName}</h2>
              {awayStanding && (
                <p className="text-xs text-text-muted mt-1">
                  {ordinal(awayStanding.position)} — {awayStanding.points} pts
                </p>
              )}
              {awayTeamInfo?.coach && (
                <p className="text-xs text-text-muted mt-0.5">
                  HLV: {awayTeamInfo.coach.name}
                </p>
              )}
              <div className="flex gap-1.5 justify-center mt-3">
                {awayForm.map((r, i) => <FormBadge key={i} result={r} />)}
              </div>
            </div>
          </div>
        </div>

        <AdSlot size="leaderboard" className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Prediction */}
            <section className="bg-bg-card rounded-2xl border border-border p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Dự đoán trận đấu
              </h3>
              <div className="flex gap-2 mb-4">
                {[
                  { label: match.homeTeam.tla, pct: prediction.homeWin, color: "bg-accent" },
                  { label: "Draw", pct: prediction.draw, color: "bg-accent-yellow" },
                  { label: match.awayTeam.tla, pct: prediction.awayWin, color: "bg-accent-2" },
                ].map((p) => (
                  <div key={p.label} className="flex-1 text-center">
                    <div className="text-2xl font-bold">{p.pct}%</div>
                    <div className="text-xs text-text-muted mt-1">{p.label}</div>
                    <div className="mt-2 h-2 rounded-full bg-border overflow-hidden">
                      <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 pt-3 border-t border-border/50">
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold">{prediction.btts}%</p>
                  <p className="text-xs text-text-muted">Cả hai ghi bàn</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold">{prediction.over25}%</p>
                  <p className="text-xs text-text-muted">Trên 2.5 bàn</p>
                </div>
              </div>
            </section>

            {/* Lịch sử đối đầu */}
            {h2h && h2h.lastMatches.length > 0 && (
              <section className="bg-bg-card rounded-2xl border border-border p-5">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-2" />
                  Lịch sử đối đầu
                </h3>
                <div className="flex gap-2 mb-5">
                  <div className="flex-1 text-center p-3 rounded-xl bg-accent/10">
                    <p className="text-2xl font-bold text-accent">{h2h.homeWins}</p>
                    <p className="text-xs text-text-muted">{match.homeTeam.tla} Wins</p>
                  </div>
                  <div className="flex-1 text-center p-3 rounded-xl bg-accent-yellow/10">
                    <p className="text-2xl font-bold text-accent-yellow">{h2h.draws}</p>
                    <p className="text-xs text-text-muted">Draws</p>
                  </div>
                  <div className="flex-1 text-center p-3 rounded-xl bg-accent-2/10">
                    <p className="text-2xl font-bold text-accent-2">{h2h.awayWins}</p>
                    <p className="text-xs text-text-muted">{match.awayTeam.tla} Wins</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {h2h.lastMatches.map((m, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-bg-primary/50 text-sm">
                      <span className="text-xs text-text-muted w-24">{m.date}</span>
                      <span className="flex-1 text-right truncate">{m.home}</span>
                      <span className="mx-3 font-bold px-2 py-0.5 rounded bg-white/5">
                        {m.scoreHome} - {m.scoreAway}
                      </span>
                      <span className="flex-1 truncate">{m.away}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Thống kê mùa giải */}
            {homeStanding && awayStanding && (
              <section className="bg-bg-card rounded-2xl border border-border p-5">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
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
                  <StatCompare label="Wins" homeVal={homeStanding.won} awayVal={awayStanding.won} />
                  <StatCompare label="Draws" homeVal={homeStanding.draw} awayVal={awayStanding.draw} />
                  <StatCompare label="Losses" homeVal={homeStanding.lost} awayVal={awayStanding.lost} />
                  <StatCompare label="Hiệu số" homeVal={Math.max(0, homeStanding.goalDifference)} awayVal={Math.max(0, awayStanding.goalDifference)} />
                </div>
              </section>
            )}

            {/* AI Analysis */}
            <AiAnalysis matchId={String(match.id)} />

            {/* Squad Comparison */}
            {homeTeamInfo && awayTeamInfo && (
              <section className="bg-bg-card rounded-2xl border border-border p-5">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Đội hình
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { team: match.homeTeam, info: homeTeamInfo, color: "accent" },
                    { team: match.awayTeam, info: awayTeamInfo, color: "accent-2" },
                  ].map(({ team, info, color }) => (
                    <div key={team.id}>
                      <h4 className={`text-xs font-semibold text-${color} mb-2`}>{team.shortName}</h4>
                      {(["Goalkeeper", "Defence", "Midfield", "Offence"] as const).map((pos) => {
                        const players = info.squad.filter((p) => p.position === pos);
                        if (players.length === 0) return null;
                        return (
                          <div key={pos} className="mb-2">
                            <p className="text-xs text-text-muted mb-1">{pos}</p>
                            {players.map((p, i) => (
                              <p key={i} className="text-xs text-text-secondary truncate">
                                {p.name} <span className="text-text-muted">({p.nationality})</span>
                              </p>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AdSlot size="rectangle" />

            {/* Standings snippet */}
            {standings.length > 0 && (
              <section className="bg-bg-card rounded-2xl border border-border p-5">
                <h3 className="font-bold text-sm mb-3">{match.competition.name}</h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-text-muted">
                      <th className="text-left py-1">#</th>
                      <th className="text-left py-1">Team</th>
                      <th className="text-center py-1">W</th>
                      <th className="text-center py-1">D</th>
                      <th className="text-center py-1">L</th>
                      <th className="text-center py-1">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.slice(0, 8).map((s) => {
                      const isHome = s.team.id === match.homeTeam.id;
                      const isAway = s.team.id === match.awayTeam.id;
                      return (
                        <tr
                          key={s.team.id}
                          className={`border-t border-border/30 ${isHome ? "text-accent" : isAway ? "text-accent-2" : "text-text-secondary"}`}
                        >
                          <td className="py-1.5">{s.position}</td>
                          <td className="py-1.5">
                            <div className="flex items-center gap-1">
                              <img src={s.team.crest} alt="" className="w-3.5 h-3.5 object-contain" />
                              <span className="font-medium">{s.team.tla}</span>
                            </div>
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

            {/* Manager Info */}
            {(homeTeamInfo?.coach || awayTeamInfo?.coach) && (
              <section className="bg-bg-card rounded-2xl border border-border p-5">
                <h3 className="font-bold text-sm mb-3">Huấn luyện viên</h3>
                <div className="space-y-3">
                  {homeTeamInfo?.coach && (
                    <div className="flex items-center gap-3">
                      <img src={match.homeTeam.crest} alt="" className="w-6 h-6 object-contain" />
                      <div>
                        <p className="text-sm font-medium">{homeTeamInfo.coach.name}</p>
                        <p className="text-xs text-text-muted">{homeTeamInfo.coach.nationality}</p>
                      </div>
                    </div>
                  )}
                  {awayTeamInfo?.coach && (
                    <div className="flex items-center gap-3">
                      <img src={match.awayTeam.crest} alt="" className="w-6 h-6 object-contain" />
                      <div>
                        <p className="text-sm font-medium">{awayTeamInfo.coach.name}</p>
                        <p className="text-xs text-text-muted">{awayTeamInfo.coach.nationality}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Top Scorers */}
            {relevantScorers.length > 0 && (
              <section className="bg-bg-card rounded-2xl border border-border p-5">
                <h3 className="font-bold text-sm mb-3">Cầu thủ chủ chốt — Vua phá lưới</h3>
                <div className="space-y-2">
                  {relevantScorers.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-text-muted">{s.team}</p>
                      </div>
                      <span className="text-accent font-bold">{s.goals} goals</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sân vận động */}
            {homeTeamInfo && (
              <section className="bg-bg-card rounded-2xl border border-border p-5">
                <h3 className="font-bold text-sm mb-3">Sân vận động</h3>
                <p className="text-sm">{homeTeamInfo.venue || match.venue}</p>
                <p className="text-xs text-text-muted mt-1">Sân nhà của {match.homeTeam.shortName}</p>
              </section>
            )}

            <AdSlot size="rectangle" />
          </div>
        </div>

        <AdSlot size="leaderboard" className="mt-8" />

        <footer className="mt-8 py-6 border-t border-border text-center text-xs text-text-muted">
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
