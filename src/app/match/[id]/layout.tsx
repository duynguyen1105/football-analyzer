import type { Metadata } from "next";
import { getMatch } from "@/lib/football-data";

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

export default function MatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
