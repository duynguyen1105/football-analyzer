import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { getMatches } from "@/lib/football-data";
import { LEAGUES } from "@/lib/constants";
import { Match } from "@/lib/types";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kết Quả Bóng Đá Hôm Qua — Tỷ Số Trận Đấu",
  description:
    "Kết quả bóng đá hôm qua. Tỷ số trận đấu từ Premier League, La Liga, Serie A, Bundesliga, Ligue 1, V-League.",
  keywords: [
    "kết quả bóng đá",
    "kết quả hôm qua",
    "tỷ số bóng đá",
    "tỷ số hôm qua",
  ],
};

export const revalidate = 300;

function getVietnamYesterday(): string {
  const now = new Date();
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  vnTime.setUTCDate(vnTime.getUTCDate() - 1);
  return vnTime.toISOString().slice(0, 10);
}

function formatVietnameseDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function KetQuaPage() {
  const yesterday = getVietnamYesterday();
  const allMatches = await getMatches(yesterday, yesterday);

  // Filter to finished matches only
  const finished = allMatches.filter((m) => m.status === "FINISHED");

  // Group by league
  const byLeague = new Map<string, Match[]>();
  for (const m of finished) {
    const code = m.competition.code;
    if (!byLeague.has(code)) byLeague.set(code, []);
    byLeague.get(code)!.push(m);
  }

  // Sort leagues by LEAGUES order
  const leagueOrder = LEAGUES.map((l) => l.code);
  const sortedLeagues = [...byLeague.entries()].sort(
    (a, b) => leagueOrder.indexOf(a[0]) - leagueOrder.indexOf(b[0])
  );

  return (
    <>
      <Navbar />

      <main id="main-content" className="max-w-4xl mx-auto px-3 py-6 xl:px-6">
        {/* SEO heading */}
        <h1 className="text-xl md:text-2xl font-bold mb-1">
          Kết Quả Bóng Đá Hôm Qua
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          {formatVietnameseDate(yesterday)}
        </p>

        {finished.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p className="text-lg mb-2">
              Không có trận đấu nào hôm qua
            </p>
            <Link
              href="/hom-nay"
              className="text-accent text-sm hover:underline"
            >
              Xem trận hôm nay &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedLeagues.map(([code, matches]) => {
              const league = LEAGUES.find((l) => l.code === code);
              return (
                <section key={code}>
                  {/* League header */}
                  <div className="flex items-center gap-2.5 mb-3">
                    {league?.logo && (
                      <img
                        src={league.logo}
                        alt=""
                        className="w-6 h-6 object-contain"
                      />
                    )}
                    <h2 className="text-base font-semibold text-text-primary">
                      {league?.flag} {league?.name ?? code}
                    </h2>
                  </div>

                  {/* Results table */}
                  <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-text-muted text-xs">
                          <th className="py-2 px-3 text-right font-medium w-[38%]">
                            Đội nhà
                          </th>
                          <th className="py-2 px-2 text-center font-medium w-[12%]">
                            Tỷ số
                          </th>
                          <th className="py-2 px-3 text-left font-medium w-[38%]">
                            Đội khách
                          </th>
                          <th className="py-2 px-2 text-center font-medium w-[12%] hidden sm:table-cell">
                            HT
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {matches.map((match) => (
                          <tr
                            key={match.id}
                            className="border-b border-border/50 last:border-0 hover:bg-bg-primary/30 transition-colors"
                          >
                            {/* Home team */}
                            <td className="py-3 px-3">
                              <Link
                                href={`/match/${match.id}`}
                                className="flex items-center gap-2 justify-end group"
                              >
                                <span className="text-sm text-text-primary group-hover:text-accent transition-colors truncate text-right">
                                  {match.homeTeam.shortName}
                                </span>
                                <img
                                  src={match.homeTeam.crest}
                                  alt=""
                                  className="w-5 h-5 object-contain shrink-0"
                                  loading="lazy"
                                />
                              </Link>
                            </td>

                            {/* Score */}
                            <td className="py-3 px-2 text-center">
                              <Link
                                href={`/match/${match.id}`}
                                className="inline-block font-bold text-text-primary hover:text-accent transition-colors"
                              >
                                {match.score?.home ?? 0} - {match.score?.away ?? 0}
                              </Link>
                            </td>

                            {/* Away team */}
                            <td className="py-3 px-3">
                              <Link
                                href={`/match/${match.id}`}
                                className="flex items-center gap-2 group"
                              >
                                <img
                                  src={match.awayTeam.crest}
                                  alt=""
                                  className="w-5 h-5 object-contain shrink-0"
                                  loading="lazy"
                                />
                                <span className="text-sm text-text-primary group-hover:text-accent transition-colors truncate">
                                  {match.awayTeam.shortName}
                                </span>
                              </Link>
                            </td>

                            {/* Half-time score */}
                            <td className="py-3 px-2 text-center text-xs text-text-muted hidden sm:table-cell">
                              {match.scoreHT
                                ? `${match.scoreHT.home ?? 0}-${match.scoreHT.away ?? 0}`
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Cross-link */}
        <div className="mt-8 text-center">
          <Link
            href="/hom-nay"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            Xem trận hôm nay &rarr;
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-10 py-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>MatchDay Analyst &mdash; Nhận định bóng đá trước trận</p>
          <p className="mt-0.5">Dữ liệu từ API-Football</p>
        </footer>
      </main>
    </>
  );
}
