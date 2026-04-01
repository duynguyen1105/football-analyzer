import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { getMatches } from "@/lib/football-data";
import { getLeagueBySlug, getAllLeagueSlugs, LEAGUE_SLUGS } from "@/lib/league-slugs";
import { buildBreadcrumbSchema } from "@/lib/json-ld";
import { Match } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

type Props = { params: Promise<{ league: string }> };

export function generateStaticParams() {
  return getAllLeagueSlugs().map((league) => ({ league }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { league: slug } = await params;
  const league = getLeagueBySlug(slug);
  if (!league) return { title: "Lịch thi đấu" };

  const title = `Lịch thi đấu ${league.name} mới nhất`;
  const description = `Lịch thi đấu ${league.name} mùa giải 2025/26. Cập nhật hàng ngày với thời gian Việt Nam (GMT+7).`;

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `https://nhandinhbongdavn.com/lich-thi-dau/${slug}` },
  };
}

export default async function SchedulePage({ params }: Props) {
  const { league: slug } = await params;
  const league = getLeagueBySlug(slug);
  if (!league) notFound();

  const baseUrl = "https://nhandinhbongdavn.com";

  // Fetch next 10 days of matches for this league (API limit: max 10 days)
  const today = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const twoWeeks = new Date(Date.now() + 10 * 86400000 + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const allMatches = await getMatches(today, twoWeeks);
  const matches = allMatches.filter((m) => m.competition.code === league.code);

  // Group by date
  const grouped: Record<string, Match[]> = {};
  for (const m of matches) {
    (grouped[m.date] ??= []).push(m);
  }

  const breadcrumb = buildBreadcrumbSchema([
    { name: "Trang chủ", url: baseUrl },
    { name: `Lịch thi đấu ${league.name}`, url: `${baseUrl}/lich-thi-dau/${slug}` },
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

      <main className="max-w-4xl mx-auto px-3 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
          <Link href="/" className="hover:text-text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-text-secondary">{league.flag} Lịch thi đấu {league.name}</span>
        </div>

        <h1 className="text-xl md:text-2xl font-bold mb-2">
          {league.flag} Lịch thi đấu {league.name}
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Cập nhật lịch đấu 10 ngày tới &middot; Giờ Việt Nam (GMT+7)
        </p>

        {/* Other league links */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(LEAGUE_SLUGS).map(([s, code]) => {
            const l = getLeagueBySlug(s);
            if (!l) return null;
            const isActive = s === slug;
            return (
              <Link
                key={s}
                href={`/lich-thi-dau/${s}`}
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

        {matches.length === 0 ? (
          <div className="text-center py-16 text-text-muted text-sm">
            Không có trận đấu nào trong 14 ngày tới.
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([date, dateMatches]) => (
              <div key={date}>
                <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                  {new Date(date + "T00:00:00").toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h2>
                <div className="space-y-2">
                  {dateMatches.map((m) => (
                    <Link
                      key={m.id}
                      href={`/match/${m.id}`}
                      className="flex items-center gap-3 bg-bg-card rounded-lg border border-border p-3 hover:border-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img src={m.homeTeam.crest} alt="" className="w-5 h-5 object-contain shrink-0" loading="lazy" />
                        <span className="text-sm font-medium truncate">{m.homeTeam.shortName}</span>
                      </div>
                      <span className="text-xs text-text-muted shrink-0">
                        {m.status === "FINISHED" && m.score ? `${m.score.home} - ${m.score.away}` : m.time}
                      </span>
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="text-sm font-medium truncate text-right">{m.awayTeam.shortName}</span>
                        <img src={m.awayTeam.crest} alt="" className="w-5 h-5 object-contain shrink-0" loading="lazy" />
                      </div>
                      <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
                        {m.status === "FINISHED" ? "Xem lại" : "Phân tích"}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Link to standings */}
        <div className="mt-8 text-center">
          <Link
            href={`/bang-xep-hang/${slug}`}
            className="text-sm text-accent hover:underline"
          >
            Xem bảng xếp hạng {league.name} &rarr;
          </Link>
        </div>

        <footer className="mt-10 py-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>MatchDay Analyst &mdash; Nhận định bóng đá trước trận</p>
          <p className="mt-0.5">Dữ liệu từ Football-Data.org</p>
        </footer>
      </main>
    </>
  );
}
