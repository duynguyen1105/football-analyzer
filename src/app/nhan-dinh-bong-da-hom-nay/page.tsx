import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { getMatches, getStandings } from "@/lib/football-data";
import { getVietnamDate } from "@/lib/timezone";
import { computePrediction } from "@/lib/prediction";
import { LEAGUES } from "@/lib/constants";
import { generateMatchSlug } from "@/lib/match-slugs";
import { Match, Standing } from "@/lib/types";

export const metadata: Metadata = {
  title: "Nhận Định Bóng Đá Hôm Nay — Soi Kèo, Dự Đoán Tỷ Số",
  description:
    "Nhận định bóng đá hôm nay (nhan dinh bong da hom nay): phân tích phong độ, đối đầu, dự đoán tỷ số và soi kèo cho tất cả trận đấu hôm nay từ Premier League, La Liga, Serie A, Bundesliga, Ligue 1 và V-League.",
  keywords: [
    "nhận định bóng đá hôm nay",
    "nhan dinh bong da hom nay",
    "soi kèo hôm nay",
    "soi keo hom nay",
    "dự đoán bóng đá hôm nay",
    "du doan bong da hom nay",
    "kèo bóng đá hôm nay",
    "keo bong da hom nay",
  ],
  alternates: {
    canonical: "https://nhandinhbongdavn.com/nhan-dinh-bong-da-hom-nay",
  },
  openGraph: {
    title: "Nhận Định Bóng Đá Hôm Nay — Soi Kèo, Dự Đoán Tỷ Số",
    description:
      "Phân tích, dự đoán và soi kèo tất cả trận đấu hôm nay — miễn phí, cập nhật liên tục.",
  },
};

export const revalidate = 300;

function formatVietnameseDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildFaqSchema(dateLabel: string, matchCount: number) {
  const faqs = [
    {
      q: "Nhận định bóng đá hôm nay có những trận nào?",
      a: `Hôm nay (${dateLabel}) có ${matchCount} trận đấu được nhận định, bao gồm các giải đấu hàng đầu như Premier League, La Liga, Serie A, Bundesliga, Ligue 1 và V-League.`,
    },
    {
      q: "Dự đoán tỷ số được tính như thế nào?",
      a: "Mô hình dự đoán sử dụng phương pháp Poisson dựa trên bảng xếp hạng, phong độ gần đây và lịch sử đối đầu, kết hợp với lợi thế sân nhà (1.1x) và điều chỉnh cho trận lượt về ở vòng loại trực tiếp.",
    },
    {
      q: "Soi kèo và nhận định có miễn phí không?",
      a: "Có. Tất cả nhận định, dự đoán tỷ số và phân tích trên nhandinhbongdavn.com đều miễn phí cho người hâm mộ bóng đá Việt Nam.",
    },
    {
      q: "Làm sao để xem nhận định chi tiết một trận cụ thể?",
      a: "Nhấp vào trận đấu bất kỳ trong danh sách để xem phân tích chi tiết: phong độ, đội hình dự kiến, lịch sử đối đầu, thống kê mùa giải và nhận định AI.",
    },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function LeagueGroup({
  leagueCode,
  matches,
  predictions,
}: {
  leagueCode: string;
  matches: Match[];
  predictions: Record<number, { homeWin: number; draw: number; awayWin: number }>;
}) {
  const league = LEAGUES.find((l) => l.code === leagueCode);
  if (!league || matches.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-base font-bold mb-3 flex items-center gap-2">
        <span>{league.flag}</span>
        <span>Nhận định {league.name} hôm nay</span>
      </h2>
      <ul className="space-y-2">
        {matches.map((m) => {
          const slug = generateMatchSlug(
            m.homeTeam.name,
            m.awayTeam.name,
            m.date,
            m.id,
          );
          const p = predictions[m.id];
          const winner =
            p && p.homeWin > p.awayWin && p.homeWin > p.draw
              ? `${m.homeTeam.shortName} thắng`
              : p && p.awayWin > p.homeWin && p.awayWin > p.draw
                ? `${m.awayTeam.shortName} thắng`
                : "Hòa";
          return (
            <li
              key={m.id}
              className="bg-bg-card rounded-xl border border-border p-3 hover:border-accent/30 transition-colors"
            >
              <Link href={`/nhan-dinh/${slug}`} className="block">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      Nhận định {m.homeTeam.shortName} vs {m.awayTeam.shortName}
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {m.time} · {league.name}
                      {p ? ` · Dự đoán: ${winner}` : ""}
                    </p>
                  </div>
                  <span className="text-accent text-sm shrink-0">&rarr;</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default async function NhanDinhHomNayPage() {
  const today = getVietnamDate();
  const dateLabel = formatVietnameseDate(today);
  const matches = await getMatches(today, today);

  const leagueCodes = [...new Set(matches.map((m) => m.competition.code))];
  const standingsMap: Record<string, Standing[]> = {};
  await Promise.all(
    leagueCodes.map(async (code) => {
      standingsMap[code] = await getStandings(code);
    }),
  );

  const predictions: Record<
    number,
    { homeWin: number; draw: number; awayWin: number; btts: number; over25: number }
  > = {};
  for (const m of matches) {
    const standings = standingsMap[m.competition.code] || [];
    const hs = standings.find((s) => s.team.id === m.homeTeam.id) || null;
    const as_ = standings.find((s) => s.team.id === m.awayTeam.id) || null;
    predictions[m.id] = computePrediction(hs, as_);
  }

  const matchesByLeague: Record<string, Match[]> = {};
  for (const m of matches) {
    (matchesByLeague[m.competition.code] ||= []).push(m);
  }

  const faq = buildFaqSchema(dateLabel, matches.length);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faq).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Nhận Định Bóng Đá Hôm Nay
          </h1>
          <p className="text-sm text-text-muted">{dateLabel}</p>
        </header>

        <div className="bg-bg-card rounded-xl border border-border p-5 mb-8 text-sm text-text-secondary leading-relaxed">
          <p className="mb-2">
            <strong>Nhận định bóng đá hôm nay</strong> cung cấp phân tích chi
            tiết trước trận cho tất cả các giải đấu hàng đầu: Premier League,
            La Liga, Serie A, Bundesliga, Ligue 1, V-League và Champions
            League. Mỗi trận đấu đều có dự đoán tỷ số, phân tích phong độ,
            lịch sử đối đầu và các thống kê mùa giải quan trọng.
          </p>
          <p>
            Danh sách <strong>soi kèo hôm nay</strong> được cập nhật liên tục
            theo giờ Việt Nam (GMT+7). Nhấp vào bất kỳ trận đấu nào để xem
            nhận định đầy đủ — bao gồm đội hình dự kiến, cầu thủ chấn thương
            và dự đoán tỷ số từ mô hình AI.
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p className="mb-3">Hôm nay không có trận đấu nào được nhận định.</p>
            <Link href="/" className="text-accent hover:underline text-sm">
              Xem lịch đấu sắp tới &rarr;
            </Link>
          </div>
        ) : (
          <>
            {Object.keys(matchesByLeague).map((code) => (
              <LeagueGroup
                key={code}
                leagueCode={code}
                matches={matchesByLeague[code]}
                predictions={predictions}
              />
            ))}
          </>
        )}

        <footer className="mt-10 pt-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>
            Nhận định bóng đá · Soi kèo hôm nay ·{" "}
            <Link href="/" className="hover:text-accent">
              nhandinhbongdavn.com
            </Link>
          </p>
        </footer>
      </main>
    </>
  );
}
