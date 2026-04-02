import { getMatches, getStandings, getGroupStandings, getTournamentFixtures } from "@/lib/football-data";
import { getLeagueBySlug } from "@/lib/league-slugs";
import { Standing, Match, GroupStanding } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export default async function LeagueOverviewPage({ params }: Props) {
  const { slug } = await params;
  const league = getLeagueBySlug(slug);
  if (!league) notFound();

  if (league.isTournament) {
    return <TournamentOverview league={league} />;
  }

  return <LeagueOverview league={league} />;
}

/* ─── Regular league overview ─── */

async function LeagueOverview({ league }: { league: ReturnType<typeof getLeagueBySlug> & {} }) {
  const today = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 86400000 + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [standings, allMatches] = await Promise.all([
    getStandings(league!.code),
    getMatches(today, nextWeek),
  ]);

  const leagueMatches = allMatches.filter((m) => m.competition.code === league!.code);
  const totalTeams = standings.length;

  const grouped: Record<string, Match[]> = {};
  for (const m of leagueMatches) {
    (grouped[m.date] ??= []).push(m);
  }

  return (
    <>
      {/* Standings */}
      {standings.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-bold mb-3">Bảng xếp hạng</h2>
          <StandingsTable standings={standings} totalTeams={totalTeams} />
          <div className="flex gap-4 mt-2 text-[10px] text-text-muted">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-sm" />
              <span>Champions League / Top 4</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-sm" />
              <span>Xuống hạng</span>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming matches */}
      <section>
        <h2 className="text-base font-bold mb-3">Lịch thi đấu 7 ngày tới</h2>
        <MatchList matches={leagueMatches} grouped={grouped} emptyText="Không có trận đấu nào trong 7 ngày tới." />
      </section>
    </>
  );
}

/* ─── Tournament overview (WC, CL) ─── */

async function TournamentOverview({ league }: { league: ReturnType<typeof getLeagueBySlug> & {} }) {
  const [groups, allFixtures] = await Promise.all([
    getGroupStandings(league!.code),
    getTournamentFixtures(league!.code),
  ]);

  // Upcoming matches (not finished yet)
  const upcoming = allFixtures.filter((m) => m.status !== "FINISHED");
  const upcomingGrouped: Record<string, Match[]> = {};
  for (const m of upcoming.slice(0, 20)) {
    (upcomingGrouped[m.date] ??= []).push(m);
  }

  // Recent results
  const recent = allFixtures.filter((m) => m.status === "FINISHED").slice(-10).reverse();

  return (
    <>
      {/* Group standings preview (first 4 groups) */}
      {groups.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">Bảng đấu</h2>
            {groups.length > 4 && (
              <Link href={`/giai-dau/${league!.code === "WC" ? "world-cup" : "champions-league"}/bang-dau`} className="text-xs text-accent hover:underline">
                Xem tất cả {groups.length} bảng &rarr;
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.slice(0, 4).map((g) => (
              <GroupTable key={g.group} group={g} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming matches */}
      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">Trận đấu sắp tới</h2>
        <MatchList matches={upcoming.slice(0, 20)} grouped={upcomingGrouped} emptyText="Chưa có lịch thi đấu." />
      </section>

      {/* Recent results */}
      {recent.length > 0 && (
        <section>
          <h2 className="text-base font-bold mb-3">Kết quả gần đây</h2>
          <div className="space-y-2">
            {recent.map((m) => (
              <MatchRow key={m.id} match={m} showRound />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/* ─── Shared components ─── */

function GroupTable({ group }: { group: GroupStanding }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-3 py-2 border-b border-border bg-bg-primary/30">
        <h3 className="text-xs font-bold">{group.group}</h3>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-text-muted">
            <th className="text-left py-1.5 px-2 w-6">#</th>
            <th className="text-left py-1.5 px-2">Đội</th>
            <th className="text-center py-1.5 px-1 w-6">Tr</th>
            <th className="text-center py-1.5 px-1 w-6">T</th>
            <th className="text-center py-1.5 px-1 w-6">H</th>
            <th className="text-center py-1.5 px-1 w-6">B</th>
            <th className="text-center py-1.5 px-1 w-7">HS</th>
            <th className="text-center py-1.5 px-2 w-7 font-bold text-text-secondary">D</th>
          </tr>
        </thead>
        <tbody className="text-text-secondary">
          {group.standings.map((r) => {
            const isQualify = r.position <= 2;
            return (
              <tr key={r.team.id} className={`border-t border-border/30 ${isQualify ? "border-l-2 border-l-green-500" : "border-l-2 border-l-transparent"}`}>
                <td className="py-1.5 px-2 text-text-muted">{r.position}</td>
                <td className="py-1.5 px-2">
                  <div className="flex items-center gap-1.5">
                    <img src={r.team.crest} alt="" className="w-4 h-4 object-contain shrink-0" loading="lazy" />
                    <span className="text-text-primary font-medium truncate">{r.team.shortName}</span>
                  </div>
                </td>
                <td className="py-1.5 px-1 text-center">{r.playedGames}</td>
                <td className="py-1.5 px-1 text-center">{r.won}</td>
                <td className="py-1.5 px-1 text-center">{r.draw}</td>
                <td className="py-1.5 px-1 text-center">{r.lost}</td>
                <td className="py-1.5 px-1 text-center">{r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}</td>
                <td className="py-1.5 px-2 text-center font-bold text-text-primary">{r.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StandingsTable({ standings, totalTeams }: { standings: Standing[]; totalTeams: number }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border overflow-x-auto">
      <table className="w-full text-xs md:text-sm">
        <thead>
          <tr className="text-text-muted border-b border-border">
            <th className="text-left py-2.5 px-2 w-8">#</th>
            <th className="text-left py-2.5 px-2">Đội</th>
            <th className="text-center py-2.5 px-1.5 w-8">Tr</th>
            <th className="text-center py-2.5 px-1.5 w-8">T</th>
            <th className="text-center py-2.5 px-1.5 w-8">H</th>
            <th className="text-center py-2.5 px-1.5 w-8">B</th>
            <th className="text-center py-2.5 px-1.5 w-8 hidden sm:table-cell">BT</th>
            <th className="text-center py-2.5 px-1.5 w-8 hidden sm:table-cell">BB</th>
            <th className="text-center py-2.5 px-1.5 w-9">HS</th>
            <th className="text-center py-2.5 px-2 w-10 font-bold text-text-secondary">D</th>
          </tr>
        </thead>
        <tbody className="text-text-secondary">
          {standings.map((r: Standing) => {
            const isTop4 = r.position <= 4;
            const isBottom3 = r.position > totalTeams - 3;
            const borderClass = isTop4
              ? "border-l-2 border-l-green-500"
              : isBottom3
                ? "border-l-2 border-l-red-500"
                : "border-l-2 border-l-transparent";

            return (
              <tr key={r.team.id} className={`border-t border-border/30 ${borderClass}`}>
                <td className="py-2 px-2 text-text-muted">{r.position}</td>
                <td className="py-2 px-2">
                  <Link href={`/doi-bong/${r.team.id}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                    <img src={r.team.crest} alt="" className="w-4 h-4 object-contain shrink-0" loading="lazy" />
                    <span className="text-text-primary font-medium truncate">{r.team.shortName}</span>
                  </Link>
                </td>
                <td className="py-2 px-1.5 text-center">{r.playedGames}</td>
                <td className="py-2 px-1.5 text-center">{r.won}</td>
                <td className="py-2 px-1.5 text-center">{r.draw}</td>
                <td className="py-2 px-1.5 text-center">{r.lost}</td>
                <td className="py-2 px-1.5 text-center hidden sm:table-cell">{r.goalsFor}</td>
                <td className="py-2 px-1.5 text-center hidden sm:table-cell">{r.goalsAgainst}</td>
                <td className="py-2 px-1.5 text-center">
                  {r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}
                </td>
                <td className="py-2 px-2 text-center font-bold text-text-primary">{r.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MatchRow({ match: m, showRound }: { match: Match; showRound?: boolean }) {
  return (
    <Link
      href={`/match/${m.id}`}
      className="flex items-center gap-3 bg-bg-card rounded-lg border border-border p-3 hover:border-accent/30 transition-colors"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <img src={m.homeTeam.crest} alt="" className="w-5 h-5 object-contain shrink-0" loading="lazy" />
        <span className="text-sm font-medium truncate">{m.homeTeam.shortName}</span>
      </div>
      <div className="text-center shrink-0">
        <span className="text-xs text-text-muted">
          {m.status === "FINISHED" && m.score ? `${m.score.home} - ${m.score.away}` : m.time}
        </span>
        {showRound && m.round && (
          <p className="text-[9px] text-text-muted truncate max-w-[100px]">{m.round}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className="text-sm font-medium truncate text-right">{m.awayTeam.shortName}</span>
        <img src={m.awayTeam.crest} alt="" className="w-5 h-5 object-contain shrink-0" loading="lazy" />
      </div>
      <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
        {m.status === "FINISHED" ? "Xem lại" : "Phân tích"}
      </span>
    </Link>
  );
}

function MatchList({ matches, grouped, emptyText }: { matches: Match[]; grouped: Record<string, Match[]>; emptyText: string }) {
  if (matches.length === 0) {
    return <div className="text-center py-10 text-text-muted text-sm">{emptyText}</div>;
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, dateMatches]) => (
        <div key={date}>
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            {new Date(date + "T00:00:00").toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>
          <div className="space-y-2">
            {dateMatches.map((m) => (
              <MatchRow key={m.id} match={m} showRound={!!m.round} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
