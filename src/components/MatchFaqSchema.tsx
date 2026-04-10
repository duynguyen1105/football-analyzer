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

  if (prediction && !isFinished) {
    faqs.push({
      question: `Tỷ số dự đoán trận ${matchTitle}?`,
      answer: prediction.homeWin > prediction.awayWin
        ? `Dự đoán ${match.homeTeam.shortName} thắng với tỷ số 2-1 hoặc 1-0. Xác suất thắng: ${prediction.homeWin}%.`
        : prediction.awayWin > prediction.homeWin
          ? `Dự đoán ${match.awayTeam.shortName} thắng với tỷ số 0-1 hoặc 1-2. Xác suất thắng: ${prediction.awayWin}%.`
          : `Trận đấu được dự đoán hòa với tỷ số 1-1. Xác suất hòa: ${prediction.draw}%.`,
    });
    faqs.push({
      question: `Trận ${matchTitle} có nhiều bàn thắng không?`,
      answer: `Xác suất trên 2.5 bàn thắng là cao. Cả hai đội đều có khả năng ghi bàn (BTTS).`,
    });
  }

  faqs.push({
    question: `Xem trận ${matchTitle} ở đâu?`,
    answer: `Xem nhận định và phân tích chi tiết trận ${matchTitle} tại nhandinhbongdavn.com. Cập nhật đội hình, phong độ, lịch sử đối đầu.`,
  });

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
