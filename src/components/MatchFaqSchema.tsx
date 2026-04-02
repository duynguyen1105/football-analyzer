import { Match } from "@/lib/types";

/**
 * Generates FAQPage JSON-LD schema for match pages.
 * Helps win Google rich snippets in search results.
 */
export function MatchFaqSchema({
  match,
  prediction,
  venue,
}: {
  match: Match;
  prediction?: { homeWin: number; draw: number; awayWin: number };
  venue?: string;
}) {
  const predictedWinner =
    prediction && prediction.homeWin > prediction.awayWin && prediction.homeWin > prediction.draw
      ? match.homeTeam.shortName
      : prediction && prediction.awayWin > prediction.homeWin && prediction.awayWin > prediction.draw
        ? match.awayTeam.shortName
        : "Hoà (xác suất cao nhất)";

  const predictedPct = prediction
    ? Math.max(prediction.homeWin, prediction.draw, prediction.awayWin)
    : 0;

  const isFinished = match.status === "FINISHED";
  const matchTitle = `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`;

  const faqs = [
    {
      question: `Trận ${matchTitle} diễn ra khi nào?`,
      answer: `Trận đấu ${matchTitle} diễn ra vào lúc ${match.time} ngày ${match.date} (giờ Việt Nam, GMT+7)${venue ? `, tại sân ${venue}` : ""}.`,
    },
    {
      question: `Ai được dự đoán thắng trận ${matchTitle}?`,
      answer: isFinished && match.score
        ? `Trận đấu đã kết thúc với tỷ số ${match.score.home} - ${match.score.away}.`
        : prediction
          ? `Theo mô hình dự đoán Poisson, ${predictedWinner} được dự đoán thắng với xác suất ${predictedPct}%. Tỷ lệ: ${match.homeTeam.shortName} ${prediction.homeWin}% - Hoà ${prediction.draw}% - ${match.awayTeam.shortName} ${prediction.awayWin}%.`
          : `Chưa có dữ liệu dự đoán.`,
    },
    {
      question: `${matchTitle} thuộc giải đấu nào?`,
      answer: `Trận ${matchTitle} thuộc giải ${match.competition.name}.`,
    },
  ];

  if (venue) {
    faqs.push({
      question: `Trận ${matchTitle} diễn ra ở sân nào?`,
      answer: `Trận đấu diễn ra tại sân vận động ${venue}.`,
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
