import type { Metadata } from "next";
import { getMatch } from "@/lib/football-data";
import { buildSportsEventSchema, buildBreadcrumbSchema } from "@/lib/json-ld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const match = await getMatch(parseInt(id));

  if (!match) {
    return {
      title: "Nhận Định Bóng Đá — Phân Tích Trước Trận Đấu",
      description:
        "Nhận định bóng đá trước trận với AI. Phong độ, đối đầu, thống kê và dự đoán cho 5 giải hàng đầu Châu Âu.",
    };
  }

  const title = `Nhận định ${match.homeTeam.shortName} vs ${match.awayTeam.shortName} — ${match.competition.name}`;
  const description = `Phân tích trước trận ${match.homeTeam.shortName} vs ${match.awayTeam.shortName} tại ${match.venue}. Xem dự đoán, thống kê, đối đầu và nhận định bằng AI.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function MatchLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;
  const match = await getMatch(parseInt(id));

  const baseUrl = "https://nhandinhbongdavn.com";

  return (
    <>
      {match && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(buildSportsEventSchema(match)).replace(/</g, "\\u003c"),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(
                buildBreadcrumbSchema([
                  { name: "Trang chủ", url: baseUrl },
                  { name: match.competition.name, url: baseUrl },
                  {
                    name: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`,
                    url: `${baseUrl}/match/${id}`,
                  },
                ])
              ).replace(/</g, "\\u003c"),
            }}
          />
        </>
      )}
      {children}
    </>
  );
}
