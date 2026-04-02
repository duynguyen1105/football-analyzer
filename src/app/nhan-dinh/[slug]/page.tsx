import type { Metadata } from "next";
import { getMatch, getStandings } from "@/lib/football-data";
import { computePrediction } from "@/lib/prediction";
import { extractMatchIdFromSlug } from "@/lib/match-slugs";
import { buildBreadcrumbSchema, buildSportsEventSchema } from "@/lib/json-ld";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCached } from "@/lib/cache";

export const revalidate = 1800;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const matchId = extractMatchIdFromSlug(slug);
  if (!matchId) return { title: "Nhận định bóng đá" };

  const match = await getMatch(matchId);
  if (!match) return { title: "Nhận định bóng đá" };

  const title = `Nhận định ${match.homeTeam.shortName} vs ${match.awayTeam.shortName} — ${match.competition.name}`;
  const description = `Nhận định bóng đá ${match.homeTeam.name} vs ${match.awayTeam.name}. Phân tích phong độ, đối đầu, thống kê mùa giải và dự đoán tỷ số.`;

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `https://nhandinhbongdavn.com/nhan-dinh/${slug}` },
  };
}

export default async function MatchPreviewPage({ params }: Props) {
  const { slug } = await params;
  const matchId = extractMatchIdFromSlug(slug);
  if (!matchId) notFound();

  const match = await getMatch(matchId);
  if (!match) notFound();

  const baseUrl = "https://nhandinhbongdavn.com";
  const standings = await getStandings(match.competition.code);
  const homeStanding = standings.find((s) => s.team.id === match.homeTeam.id);
  const awayStanding = standings.find((s) => s.team.id === match.awayTeam.id);
  const prediction = computePrediction(homeStanding ?? null, awayStanding ?? null);

  // Try to get cached AI summary
  const aiSummary = await getCached(`quick-summary:${matchId}`);

  const breadcrumb = buildBreadcrumbSchema([
    { name: "Trang chủ", url: baseUrl },
    { name: "Nhận định", url: baseUrl },
    { name: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`, url: `${baseUrl}/nhan-dinh/${slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSportsEventSchema(match)).replace(/</g, "\\u003c") }} />
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
          <Link href="/" className="hover:text-text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-text-secondary">Nhận định {match.homeTeam.shortName} vs {match.awayTeam.shortName}</span>
        </div>

        <article>
          {/* Header */}
          <header className="bg-bg-card rounded-2xl border border-border p-6 mb-6 text-center">
            <p className="text-xs text-text-muted mb-4">{match.competition.name} · {match.venue}</p>
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="text-center">
                <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="w-16 h-16 object-contain mx-auto mb-2" />
                <h2 className="font-bold text-lg">{match.homeTeam.shortName}</h2>
                {homeStanding && <p className="text-xs text-text-muted">Hạng {homeStanding.position} · {homeStanding.points} điểm</p>}
              </div>
              <div className="text-center">
                {match.status === "FINISHED" && match.score ? (
                  <p className="text-3xl font-bold">{match.score.home} - {match.score.away}</p>
                ) : (
                  <p className="text-2xl font-bold text-accent">{match.time}</p>
                )}
                <p className="text-xs text-text-muted mt-1">
                  {new Date(match.date + "T00:00:00").toLocaleDateString("vi-VN", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-center">
                <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="w-16 h-16 object-contain mx-auto mb-2" />
                <h2 className="font-bold text-lg">{match.awayTeam.shortName}</h2>
                {awayStanding && <p className="text-xs text-text-muted">Hạng {awayStanding.position} · {awayStanding.points} điểm</p>}
              </div>
            </div>
          </header>

          <h1 className="text-2xl font-bold mb-6">
            Nhận định {match.homeTeam.name} vs {match.awayTeam.name}
          </h1>

          {/* Prediction */}
          <section className="bg-bg-card rounded-xl border border-border p-5 mb-6">
            <h2 className="font-bold text-sm mb-4">Dự đoán trận đấu</h2>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 text-center p-3 rounded-lg bg-accent/10">
                <p className="text-2xl font-bold text-accent">{prediction.homeWin}%</p>
                <p className="text-xs text-text-muted">{match.homeTeam.tla} thắng</p>
              </div>
              <div className="flex-1 text-center p-3 rounded-lg bg-accent-yellow/10">
                <p className="text-2xl font-bold text-accent-yellow">{prediction.draw}%</p>
                <p className="text-xs text-text-muted">Hòa</p>
              </div>
              <div className="flex-1 text-center p-3 rounded-lg bg-accent-2/10">
                <p className="text-2xl font-bold text-accent-2">{prediction.awayWin}%</p>
                <p className="text-xs text-text-muted">{match.awayTeam.tla} thắng</p>
              </div>
            </div>
            <div className="flex gap-4 text-center text-sm">
              <div className="flex-1">
                <span className="font-bold">{prediction.btts}%</span>
                <span className="text-text-muted ml-1">Cả hai ghi bàn</span>
              </div>
              <div className="flex-1">
                <span className="font-bold">{prediction.over25}%</span>
                <span className="text-text-muted ml-1">Trên 2.5 bàn</span>
              </div>
            </div>
          </section>

          {/* Season stats comparison */}
          {homeStanding && awayStanding && (
            <section className="bg-bg-card rounded-xl border border-border p-5 mb-6">
              <h2 className="font-bold text-sm mb-4">So sánh mùa giải</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-muted text-xs">
                      <th className="text-left py-2">{match.homeTeam.tla}</th>
                      <th className="text-center py-2">Chỉ số</th>
                      <th className="text-right py-2">{match.awayTeam.tla}</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    {[
                      { label: "Trận đấu", h: homeStanding.playedGames, a: awayStanding.playedGames },
                      { label: "Thắng", h: homeStanding.won, a: awayStanding.won },
                      { label: "Hòa", h: homeStanding.draw, a: awayStanding.draw },
                      { label: "Thua", h: homeStanding.lost, a: awayStanding.lost },
                      { label: "Bàn thắng", h: homeStanding.goalsFor, a: awayStanding.goalsFor },
                      { label: "Bàn thua", h: homeStanding.goalsAgainst, a: awayStanding.goalsAgainst },
                      { label: "Hiệu số", h: homeStanding.goalDifference, a: awayStanding.goalDifference },
                      { label: "Điểm", h: homeStanding.points, a: awayStanding.points },
                    ].map((row) => (
                      <tr key={row.label} className="border-t border-border/30">
                        <td className={`py-2 ${row.h > row.a ? "font-bold text-accent" : ""}`}>{row.h}</td>
                        <td className="py-2 text-center text-xs text-text-muted">{row.label}</td>
                        <td className={`py-2 text-right ${row.a > row.h ? "font-bold text-accent-2" : ""}`}>{row.a}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* AI Summary */}
          {aiSummary && (
            <section className="bg-bg-card rounded-xl border border-border p-5 mb-6">
              <h2 className="font-bold text-sm mb-3">Nhận định nhanh</h2>
              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{aiSummary}</div>
            </section>
          )}

          {/* CTA */}
          <div className="text-center py-6">
            <Link
              href={`/match/${matchId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
            >
              Xem phân tích chi tiết &rarr;
            </Link>
          </div>
        </article>

        <footer className="mt-8 py-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>Nhận Định Bóng Đá VN &mdash; nhandinhbongdavn.com</p>
        </footer>
      </main>
    </>
  );
}
