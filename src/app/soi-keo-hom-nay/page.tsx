import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { getMatches, getMatchOdds, getStandings } from "@/lib/football-data";
import { computePrediction } from "@/lib/prediction";
import { buildBreadcrumbSchema } from "@/lib/json-ld";
import { LEAGUES } from "@/lib/constants";
import { getSlugByCode } from "@/lib/league-slugs";
import { Match, MatchOdds, Standing } from "@/lib/types";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Soi Kèo Hôm Nay — Tỷ Lệ Kèo Nhà Cái Mới Nhất",
  description:
    "Soi kèo hôm nay cho tất cả các giải đấu. Tỷ lệ kèo nhà cái, dự đoán tỷ số, phân tích trước trận. Cập nhật liên tục.",
  keywords: [
    "soi kèo hôm nay",
    "kèo nhà cái hôm nay",
    "tỷ lệ kèo",
    "nhận định bóng đá hôm nay",
    "dự đoán bóng đá",
  ],
  openGraph: {
    title: "Soi Kèo Hôm Nay — Tỷ Lệ Kèo Nhà Cái Mới Nhất",
    description:
      "Soi kèo hôm nay cho tất cả các giải đấu. Tỷ lệ kèo nhà cái, dự đoán tỷ số, phân tích trước trận.",
  },
  alternates: {
    canonical: "https://nhandinhbongdavn.com/soi-keo-hom-nay",
  },
};

export const revalidate = 1800;

function getVietnamToday(): string {
  const d = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
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

type MatchWithOddsAndPrediction = {
  match: Match;
  odds: MatchOdds | null;
  prediction: { homeWin: number; draw: number; awayWin: number; btts: number; over25: number };
};

export default async function SoiKeoHomNayPage() {
  const baseUrl = "https://nhandinhbongdavn.com";
  const today = getVietnamToday();

  const allMatches = await getMatches(today, today);
  const scheduled = allMatches.filter((m) => m.status === "SCHEDULED");

  // Fetch standings for all leagues that have matches today
  const leagueCodes = [...new Set(scheduled.map((m) => m.competition.code))];
  const standingsMap: Record<string, Standing[]> = {};

  await Promise.all(
    leagueCodes.map(async (code) => {
      standingsMap[code] = await getStandings(code);
    })
  );

  // Fetch odds (limit to 15 matches to conserve API calls) and compute predictions
  const matchesData: MatchWithOddsAndPrediction[] = await Promise.all(
    scheduled.slice(0, 15).map(async (match) => {
      const odds = await getMatchOdds(match.id);

      const standings = standingsMap[match.competition.code] || [];
      const homeStanding = standings.find((s) => s.team.id === match.homeTeam.id) || null;
      const awayStanding = standings.find((s) => s.team.id === match.awayTeam.id) || null;
      const prediction = computePrediction(homeStanding, awayStanding);

      return { match, odds, prediction };
    })
  );

  // Add remaining matches (beyond first 15) without odds
  if (scheduled.length > 15) {
    for (const match of scheduled.slice(15)) {
      const standings = standingsMap[match.competition.code] || [];
      const homeStanding = standings.find((s) => s.team.id === match.homeTeam.id) || null;
      const awayStanding = standings.find((s) => s.team.id === match.awayTeam.id) || null;
      const prediction = computePrediction(homeStanding, awayStanding);
      matchesData.push({ match, odds: null, prediction });
    }
  }

  // Group by league
  const leagueGroups: Record<string, MatchWithOddsAndPrediction[]> = {};
  for (const item of matchesData) {
    const code = item.match.competition.code;
    if (!leagueGroups[code]) leagueGroups[code] = [];
    leagueGroups[code].push(item);
  }

  // Sort league groups by LEAGUES order
  const orderedCodes = LEAGUES.map((l) => l.code).filter((c) => leagueGroups[c]);

  // Count unique leagues
  const uniqueLeagues = new Set(matchesData.map((m) => m.match.competition.code));

  const breadcrumb = buildBreadcrumbSchema([
    { name: "Trang chủ", url: baseUrl },
    { name: "Soi kèo hôm nay", url: `${baseUrl}/soi-keo-hom-nay` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }}
      />
      <Navbar />

      <main id="main-content" className="max-w-6xl mx-auto px-3 py-6 xl:px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
          <Link href="/" className="hover:text-text-primary transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-text-secondary">Soi kèo hôm nay</span>
        </div>

        {/* H1 */}
        <h1 className="text-xl md:text-2xl font-bold mb-1">
          Soi Kèo Hôm Nay — {formatVietnameseDate(today)}
        </h1>

        {/* Summary stats */}
        <p className="text-sm text-text-secondary mb-6">
          {matchesData.length > 0
            ? `${matchesData.length} trận đấu hôm nay từ ${uniqueLeagues.size} giải đấu`
            : "Không có trận đấu nào hôm nay"}
        </p>

        {matchesData.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p className="text-lg mb-2">Hôm nay không có trận đấu nào có tỷ lệ kèo.</p>
            <Link href="/" className="text-accent text-sm hover:underline">
              Xem lịch đấu sắp tới &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orderedCodes.map((code) => {
              const league = LEAGUES.find((l) => l.code === code);
              const group = leagueGroups[code];
              if (!league || !group) return null;

              return (
                <section key={code}>
                  {/* League header */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <img
                      src={league.logo}
                      alt=""
                      className="w-7 h-7 object-contain"
                    />
                    <h2 className="text-lg font-bold">{league.flag} {league.name}</h2>
                  </div>

                  {/* Matches grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {group.map(({ match, odds, prediction }) => {
                      const matchWinner = odds?.bookmakers?.[0]?.bets?.find(
                        (b) => b.name === "Match Winner" || b.name === "Home/Away"
                      );
                      const home1x2 = matchWinner?.values.find((v) => v.value === "Home")?.odd;
                      const draw1x2 = matchWinner?.values.find((v) => v.value === "Draw")?.odd;
                      const away1x2 = matchWinner?.values.find((v) => v.value === "Away")?.odd;

                      return (
                        <Link
                          key={match.id}
                          href={`/match/${match.id}`}
                          className="block bg-bg-card rounded-xl border border-border p-4 hover:border-accent/30 transition-colors"
                        >
                          {/* Teams row */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <img
                                src={match.homeTeam.crest}
                                alt=""
                                className="w-10 h-10 object-contain shrink-0"
                                loading="lazy"
                              />
                              <span className="font-semibold text-sm truncate">
                                {match.homeTeam.shortName}
                              </span>
                            </div>
                            <div className="text-center px-3">
                              <p className="text-sm font-medium">{match.time}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                              <span className="font-semibold text-sm truncate text-right">
                                {match.awayTeam.shortName}
                              </span>
                              <img
                                src={match.awayTeam.crest}
                                alt=""
                                className="w-10 h-10 object-contain shrink-0"
                                loading="lazy"
                              />
                            </div>
                          </div>

                          {/* 1X2 Odds row */}
                          {matchWinner ? (
                            <div className="flex gap-2 mb-3">
                              <OddBadge label="Thắng nhà" value={home1x2} color="accent" />
                              <OddBadge label="Hòa" value={draw1x2} color="accent-yellow" />
                              <OddBadge label="Thắng khách" value={away1x2} color="accent-2" />
                            </div>
                          ) : (
                            <p className="text-xs text-text-muted text-center py-2 mb-3">
                              Chưa có tỷ lệ kèo
                            </p>
                          )}

                          {/* Prediction bar */}
                          <div className="mb-2">
                            <div className="flex justify-between text-[10px] text-text-muted mb-1">
                              <span>Dự đoán</span>
                            </div>
                            <div className="flex h-2 rounded-full overflow-hidden bg-border/30">
                              <div
                                className="bg-accent transition-all"
                                style={{ width: `${prediction.homeWin}%` }}
                                title={`Thắng: ${prediction.homeWin}%`}
                              />
                              <div
                                className="bg-accent-yellow transition-all"
                                style={{ width: `${prediction.draw}%` }}
                                title={`Hòa: ${prediction.draw}%`}
                              />
                              <div
                                className="bg-accent-2 transition-all"
                                style={{ width: `${prediction.awayWin}%` }}
                                title={`Thua: ${prediction.awayWin}%`}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-text-muted mt-1">
                              <span>{prediction.homeWin}%</span>
                              <span>{prediction.draw}%</span>
                              <span>{prediction.awayWin}%</span>
                            </div>
                          </div>

                          {/* BTTS and Over 2.5 */}
                          <div className="flex gap-3 text-[10px] text-text-muted">
                            <span>
                              BTTS: <strong className="text-text-secondary">{prediction.btts}%</strong>
                            </span>
                            <span>
                              Over 2.5: <strong className="text-text-secondary">{prediction.over25}%</strong>
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <p className="text-[10px] text-text-muted mt-6 text-center">
          Tỷ lệ kèo chỉ mang tính chất tham khảo, phân tích thông tin.
        </p>

        {/* Cross-link to league-specific pages */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {LEAGUES.filter((l) => !l.isTournament).map((l) => {
            const slug = getSlugByCode(l.code);
            if (!slug) return null;
            return (
              <Link
                key={l.code}
                href={`/soi-keo/${slug}`}
                className="text-xs text-accent hover:underline"
              >
                Soi kèo {l.name}
              </Link>
            );
          })}
        </div>

        {/* SEO text block */}
        <div className="mt-10 border-t border-border pt-8 space-y-6 text-sm text-text-secondary leading-relaxed">
          <div>
            <h2 className="text-base font-bold text-text-primary mb-2">Soi kèo là gì?</h2>
            <p>
              Soi kèo là quá trình phân tích tỷ lệ cược do các nhà cái đưa ra cho các trận đấu bóng đá.
              Người chơi sẽ nghiên cứu các chỉ số như kèo châu Âu (1X2), kèo châu Á (handicap),
              và kèo tài/xỉu (over/under) để đánh giá cơ hội thắng thua của từng đội.
              Việc soi kèo giúp bạn có cái nhìn tổng quát hơn về trận đấu,
              từ đó đưa ra nhận định chính xác hơn.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-text-primary mb-2">Cách đọc tỷ lệ kèo</h2>
            <p>
              <strong>Kèo 1X2 (kèo châu Âu):</strong> Tỷ lệ kèo cho 3 kết quả — đội nhà thắng (1),
              hòa (X), đội khách thắng (2). Tỷ lệ càng thấp nghĩa là khả năng xảy ra càng cao theo đánh giá của nhà cái.
            </p>
            <p className="mt-2">
              <strong>BTTS (Both Teams To Score):</strong> Xác suất cả hai đội cùng ghi bàn trong trận đấu.
              Chỉ số này hữu ích khi bạn muốn đánh giá mức độ tấn công của cả hai đội.
            </p>
            <p className="mt-2">
              <strong>Over 2.5:</strong> Xác suất trận đấu có từ 3 bàn thắng trở lên.
              Tỷ lệ này thường cao ở những trận đấu giữa các đội có lối chơi tấn công.
            </p>
          </div>
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

function OddBadge({ label, value, color }: { label: string; value?: string; color: string }) {
  return (
    <div className={`flex-1 text-center py-1.5 px-2 rounded-lg bg-${color}/10`}>
      <p className={`text-xs font-bold text-${color}`}>{value ?? "-"}</p>
      <p className="text-[9px] text-text-muted">{label}</p>
    </div>
  );
}
