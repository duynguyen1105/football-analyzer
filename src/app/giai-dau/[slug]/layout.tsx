import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { LeagueTabNav } from "@/components/LeagueTabNav";
import { getLeagueBySlug, getAllLeagueSlugs } from "@/lib/league-slugs";
import { buildBreadcrumbSchema } from "@/lib/json-ld";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export function generateStaticParams() {
  return getAllLeagueSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const league = getLeagueBySlug(slug);
  if (!league) return { title: "Giải đấu" };

  const title = `${league.name} — Bảng xếp hạng, lịch thi đấu, vua phá lưới`;
  const description = `Thông tin chi tiết ${league.name} mùa giải 2025/26: bảng xếp hạng, lịch thi đấu, vua phá lưới, kiến tạo, soi kèo.`;

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `https://nhandinhbongdavn.com/giai-dau/${slug}` },
  };
}

const BASE_URL = "https://nhandinhbongdavn.com";

export default async function LeagueLayout({ params, children }: Props) {
  const { slug } = await params;
  const league = getLeagueBySlug(slug);
  if (!league) notFound();

  const breadcrumb = buildBreadcrumbSchema([
    { name: "Trang chủ", url: BASE_URL },
    { name: league.name, url: `${BASE_URL}/giai-dau/${slug}` },
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
          <Link href="/" className="hover:text-text-primary transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-text-secondary">{league.name}</span>
        </div>

        {/* League header */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src={league.logo}
            alt=""
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              {league.flag} {league.name}
            </h1>
            <p className="text-sm text-text-muted">
              Mùa giải 2025/26
            </p>
          </div>
        </div>

        {/* Tab navigation */}
        <LeagueTabNav slug={slug} isTournament={league.isTournament} />

        {/* Tab content */}
        {children}

        {/* Footer */}
        <footer className="mt-10 py-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>MatchDay Analyst &mdash; Nhận định bóng đá trước trận</p>
          <p className="mt-0.5">Dữ liệu từ API-Football</p>
        </footer>
      </main>
    </>
  );
}
