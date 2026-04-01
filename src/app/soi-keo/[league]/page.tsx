import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { getMatches, getMatchOdds } from "@/lib/football-data";
import { getLeagueBySlug, getAllLeagueSlugs, LEAGUE_SLUGS } from "@/lib/league-slugs";
import { buildBreadcrumbSchema } from "@/lib/json-ld";
import { Match, MatchOdds } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 1800;

type Props = { params: Promise<{ league: string }> };

export function generateStaticParams() {
  return getAllLeagueSlugs().map((league) => ({ league }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { league: slug } = await params;
  const league = getLeagueBySlug(slug);
  if (!league) return { title: "Soi kèo" };

  const title = `Soi kèo ${league.name} hôm nay — Tỷ lệ kèo mới nhất`;
  const description = `Soi kèo ${league.name} mùa giải 2025/26. So sánh tỷ lệ kèo từ các nhà cái. Cập nhật hàng giờ.`;

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `https://nhandinhbongdavn.com/soi-keo/${slug}` },
  };
}

export default async function SoiKeoPage({ params }: Props) {
  const { league: slug } = await params;
  const league = getLeagueBySlug(slug);
  if (!league) notFound();

  const baseUrl = "https://nhandinhbongdavn.com";
  const today = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 86400000 + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const allMatches = await getMatches(today, nextWeek);
  const matches = allMatches.filter((m) => m.competition.code === league.code && m.status === "SCHEDULED");

  // Fetch odds for first 10 matches (to conserve API calls)
  const matchesWithOdds: { match: Match; odds: MatchOdds | null }[] = await Promise.all(
    matches.slice(0, 10).map(async (match) => ({
      match,
      odds: await getMatchOdds(match.id),
    }))
  );

  const breadcrumb = buildBreadcrumbSchema([
    { name: "Trang chủ", url: baseUrl },
    { name: `Soi kèo ${league.name}`, url: `${baseUrl}/soi-keo/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }}
      />
      <Navbar />

      <main className="max-w-6xl mx-auto px-3 py-6 xl:px-6">
        <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
          <Link href="/" className="hover:text-text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-text-secondary">{league.flag} Soi kèo {league.name}</span>
        </div>

        <h1 className="text-xl md:text-2xl font-bold mb-2">
          {league.flag} Soi kèo {league.name}
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Tỷ lệ kèo từ các nhà cái &middot; Cập nhật mỗi giờ
        </p>

        {/* League filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(LEAGUE_SLUGS).map(([s]) => {
            const l = getLeagueBySlug(s);
            if (!l) return null;
            const isActive = s === slug;
            return (
              <Link
                key={s}
                href={`/soi-keo/${s}`}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  isActive
                    ? "bg-accent/20 border-accent text-accent"
                    : "border-border text-text-secondary hover:border-accent/30"
                }`}
              >
                {l.flag} {l.name}
              </Link>
            );
          })}
        </div>

        {matchesWithOdds.length === 0 ? (
          <div className="text-center py-16 text-text-muted text-sm">
            Không có trận đấu nào có tỷ lệ kèo trong 7 ngày tới.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {matchesWithOdds.map(({ match, odds }) => {
              const matchWinner = odds?.bookmakers?.[0]?.bets?.find(
                (b) => b.name === "Match Winner" || b.name === "Home/Away"
              );
              const home = matchWinner?.values.find((v) => v.value === "Home")?.odd;
              const draw = matchWinner?.values.find((v) => v.value === "Draw")?.odd;
              const away = matchWinner?.values.find((v) => v.value === "Away")?.odd;

              return (
                <Link
                  key={match.id}
                  href={`/match/${match.id}`}
                  className="block bg-bg-card rounded-xl border border-border p-4 hover:border-accent/30 transition-colors"
                >
                  {/* Teams row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img src={match.homeTeam.crest} alt="" className="w-10 h-10 object-contain shrink-0" loading="lazy" />
                      <span className="font-semibold truncate">{match.homeTeam.shortName}</span>
                    </div>
                    <div className="text-center px-4">
                      <span className="text-xs text-text-muted">{match.date}</span>
                      <p className="text-sm font-medium">{match.time}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                      <span className="font-semibold truncate text-right">{match.awayTeam.shortName}</span>
                      <img src={match.awayTeam.crest} alt="" className="w-10 h-10 object-contain shrink-0" loading="lazy" />
                    </div>
                  </div>

                  {/* Odds row */}
                  {matchWinner ? (
                    <div className="flex gap-2">
                      <OddBadge label="Thắng nhà" value={home} color="accent" />
                      <OddBadge label="Hòa" value={draw} color="accent-yellow" />
                      <OddBadge label="Thắng khách" value={away} color="accent-2" />
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted text-center py-2">Chưa có tỷ lệ kèo</p>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        <p className="text-[10px] text-text-muted mt-6 text-center">
          Tỷ lệ kèo chỉ mang tính chất tham khảo, phân tích thông tin.
        </p>

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
