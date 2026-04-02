import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { getStandings } from "@/lib/football-data";
import { getLeagueBySlug, getAllLeagueSlugs, LEAGUE_SLUGS } from "@/lib/league-slugs";
import { buildBreadcrumbSchema } from "@/lib/json-ld";
import { Standing } from "@/lib/types";
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
  if (!league) return { title: "Bảng xếp hạng" };

  const title = `Bảng xếp hạng ${league.name} mới nhất`;
  const description = `Bảng xếp hạng ${league.name} mùa giải 2025/26. Thống kê chi tiết: điểm, thắng, hòa, thua, bàn thắng, hiệu số.`;

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `https://nhandinhbongdavn.com/bang-xep-hang/${slug}` },
  };
}

export default async function StandingsPage({ params }: Props) {
  const { league: slug } = await params;
  const league = getLeagueBySlug(slug);
  if (!league) notFound();

  const baseUrl = "https://nhandinhbongdavn.com";
  const standings = await getStandings(league.code);
  const totalTeams = standings.length;

  const breadcrumb = buildBreadcrumbSchema([
    { name: "Trang chủ", url: baseUrl },
    { name: `Bảng xếp hạng ${league.name}`, url: `${baseUrl}/bang-xep-hang/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar />

      <main className="max-w-6xl mx-auto px-3 py-6 xl:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
          <Link href="/" className="hover:text-text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-text-secondary">{league.flag} Bảng xếp hạng {league.name}</span>
        </div>

        <h1 className="text-xl md:text-2xl font-bold mb-2">
          {league.flag} Bảng xếp hạng {league.name}
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Mùa giải 2025/26 &middot; Cập nhật mỗi 30 phút
        </p>

        {/* Other league links */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(LEAGUE_SLUGS).map(([s]) => {
            const l = getLeagueBySlug(s);
            if (!l) return null;
            const isActive = s === slug;
            return (
              <Link
                key={s}
                href={`/bang-xep-hang/${s}`}
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

        {standings.length === 0 ? (
          <div className="text-center py-16 text-text-muted text-sm">
            Chưa có dữ liệu bảng xếp hạng.
          </div>
        ) : (
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
        )}

        {/* Legend */}
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

        {/* Cross-links */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <Link href={`/giai-dau/${slug}`} className="text-sm text-accent hover:underline">
            Xem trang giải đấu {league.name} &rarr;
          </Link>
          <Link href={`/lich-thi-dau/${slug}`} className="text-xs text-text-secondary hover:text-accent hover:underline">
            Lịch thi đấu {league.name}
          </Link>
        </div>

        <footer className="mt-10 py-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>MatchDay Analyst &mdash; Nhận định bóng đá trước trận</p>
          <p className="mt-0.5">Dữ liệu từ API-Football</p>
        </footer>
      </main>
    </>
  );
}
