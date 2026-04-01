import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { getMatches, getStandings } from "@/lib/football-data";
import { LEAGUES } from "@/lib/constants";
import { Standing, Match } from "@/lib/types";
import Link from "next/link";

export const revalidate = 300;

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const league = LEAGUES.find((l) => l.code === code);
  return {
    title: league ? `Bang xep hang ${league.name}` : "Giai dau",
    description: league
      ? `Bang xep hang va lich thi dau ${league.name} mua giai 2025/26`
      : "",
  };
}

function getVietnamToday(): string {
  const d = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function getDatePlusDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default async function LeaguePage({ params }: Props) {
  const { code } = await params;
  const league = LEAGUES.find((l) => l.code === code);

  if (!league) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-text-muted text-lg">
            Khong tim thay giai dau nay.
          </p>
          <Link
            href="/"
            className="text-accent mt-4 inline-block hover:underline"
          >
            Ve trang chu
          </Link>
        </main>
      </>
    );
  }

  // Fetch standings and upcoming matches in parallel
  const today = getVietnamToday();
  const nextWeek = getDatePlusDays(today, 7);

  const [standings, allMatches] = await Promise.all([
    getStandings(code),
    getMatches(today, nextWeek),
  ]);

  // Filter matches for this league only
  const leagueMatches = allMatches.filter(
    (m) => m.competition.code === code
  );

  // Group matches by date
  const grouped: Record<string, Match[]> = {};
  for (const m of leagueMatches) {
    (grouped[m.date] ??= []).push(m);
  }

  const totalTeams = standings.length;

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-3 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
          <Link
            href="/"
            className="hover:text-text-primary transition-colors"
          >
            Trang chu
          </Link>
          <span>/</span>
          <span className="text-text-secondary">
            {league.flag} {league.name}
          </span>
        </div>

        <h1 className="text-xl md:text-2xl font-bold mb-6">
          {league.flag} {league.name}
        </h1>

        {/* Standings table */}
        {standings.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-bold mb-3">Bang xep hang</h2>
            <div className="bg-bg-card rounded-xl border border-border overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead>
                  <tr className="text-text-muted border-b border-border">
                    <th className="text-left py-2.5 px-2 w-8">#</th>
                    <th className="text-left py-2.5 px-2">Doi</th>
                    <th className="text-center py-2.5 px-1.5 w-8">Tr</th>
                    <th className="text-center py-2.5 px-1.5 w-8">T</th>
                    <th className="text-center py-2.5 px-1.5 w-8">H</th>
                    <th className="text-center py-2.5 px-1.5 w-8">B</th>
                    <th className="text-center py-2.5 px-1.5 w-8 hidden sm:table-cell">
                      BT
                    </th>
                    <th className="text-center py-2.5 px-1.5 w-8 hidden sm:table-cell">
                      BB
                    </th>
                    <th className="text-center py-2.5 px-1.5 w-9">HS</th>
                    <th className="text-center py-2.5 px-2 w-10 font-bold text-text-secondary">
                      D
                    </th>
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
                      <tr
                        key={r.team.id}
                        className={`border-t border-border/30 ${borderClass}`}
                      >
                        <td className="py-2 px-2 text-text-muted">
                          {r.position}
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={r.team.crest}
                              alt=""
                              className="w-4 h-4 object-contain shrink-0"
                              loading="lazy"
                            />
                            <span className="text-text-primary font-medium truncate">
                              {r.team.shortName}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-1.5 text-center">
                          {r.playedGames}
                        </td>
                        <td className="py-2 px-1.5 text-center">{r.won}</td>
                        <td className="py-2 px-1.5 text-center">{r.draw}</td>
                        <td className="py-2 px-1.5 text-center">{r.lost}</td>
                        <td className="py-2 px-1.5 text-center hidden sm:table-cell">
                          {r.goalsFor}
                        </td>
                        <td className="py-2 px-1.5 text-center hidden sm:table-cell">
                          {r.goalsAgainst}
                        </td>
                        <td className="py-2 px-1.5 text-center">
                          {r.goalDifference > 0
                            ? `+${r.goalDifference}`
                            : r.goalDifference}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-text-primary">
                          {r.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Legend */}
            <div className="flex gap-4 mt-2 text-[10px] text-text-muted">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-sm" />
                <span>Champions League / Top 4</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-sm" />
                <span>Xuong hang</span>
              </div>
            </div>
          </section>
        )}

        {/* Upcoming matches */}
        <section>
          <h2 className="text-base font-bold mb-3">
            Lich thi dau 7 ngay toi
          </h2>

          {leagueMatches.length === 0 ? (
            <div className="text-center py-10 text-text-muted text-sm">
              Khong co tran dau nao trong 7 ngay toi.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([date, dateMatches]) => (
                <div key={date}>
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                    {new Date(date + "T00:00:00").toLocaleDateString(
                      "vi-VN",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      }
                    )}
                  </h3>
                  <div className="space-y-2">
                    {dateMatches.map((m: Match) => (
                      <Link
                        key={m.id}
                        href={`/match/${m.id}`}
                        className="flex items-center gap-3 bg-bg-card rounded-lg border border-border p-3 hover:border-accent/30 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <img
                            src={m.homeTeam.crest}
                            alt=""
                            className="w-5 h-5 object-contain shrink-0"
                            loading="lazy"
                          />
                          <span className="text-sm font-medium truncate">
                            {m.homeTeam.shortName}
                          </span>
                        </div>
                        <span className="text-xs text-text-muted shrink-0">
                          {m.status === "FINISHED" && m.score
                            ? `${m.score.home} - ${m.score.away}`
                            : m.time}
                        </span>
                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                          <span className="text-sm font-medium truncate text-right">
                            {m.awayTeam.shortName}
                          </span>
                          <img
                            src={m.awayTeam.crest}
                            alt=""
                            className="w-5 h-5 object-contain shrink-0"
                            loading="lazy"
                          />
                        </div>
                        <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
                          {m.status === "FINISHED"
                            ? "Xem lai"
                            : "Phan tich"}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-10 py-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>MatchDay Analyst &mdash; Nhan dinh bong da truoc tran</p>
          <p className="mt-0.5">Du lieu tu Football-Data.org</p>
        </footer>
      </main>
    </>
  );
}
