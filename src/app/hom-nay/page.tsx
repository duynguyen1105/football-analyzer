import { Navbar } from "@/components/Navbar";
import { getMatches, getStandings } from "@/lib/football-data";
import { computePrediction } from "@/lib/prediction";
import { computeImportance } from "@/lib/importance";
import { LEAGUES } from "@/lib/constants";
import { Match, Standing } from "@/lib/types";
import Link from "next/link";

export const metadata = {
  title: "Nhận Định Bóng Đá Hôm Nay",
  description:
    "Nhận định và dự đoán tất cả trận đấu hôm nay từ Premier League, La Liga, Serie A, Bundesliga, Ligue 1.",
};

export const revalidate = 300;

function getVietnamToday(): string {
  const d = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function formatVietnameseDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PredictionBar({
  homeWin,
  draw,
  awayWin,
}: {
  homeWin: number;
  draw: number;
  awayWin: number;
}) {
  return (
    <div className="flex h-2 rounded-full overflow-hidden bg-border/30">
      <div
        className="bg-accent transition-all"
        style={{ width: `${homeWin}%` }}
        title={`Thắng: ${homeWin}%`}
      />
      <div
        className="bg-accent-yellow transition-all"
        style={{ width: `${draw}%` }}
        title={`Hòa: ${draw}%`}
      />
      <div
        className="bg-accent-2 transition-all"
        style={{ width: `${awayWin}%` }}
        title={`Thua: ${awayWin}%`}
      />
    </div>
  );
}

function MatchDigestCard({
  match,
  prediction,
  importance,
}: {
  match: Match;
  prediction: { homeWin: number; draw: number; awayWin: number };
  importance: { score: number; reason: string };
}) {
  const league = LEAGUES.find((l) => l.code === match.competition.code);

  return (
    <div className="bg-bg-card rounded-xl border border-border p-4 hover:border-accent/30 transition-colors">
      {/* League tag */}
      <div className="text-[10px] text-text-muted mb-2">
        {league?.flag} {match.competition.name}
      </div>

      {/* Teams row */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img
            src={match.homeTeam.crest}
            alt=""
            className="w-6 h-6 object-contain shrink-0"
            loading="lazy"
          />
          <span className="text-sm font-medium truncate">
            {match.homeTeam.shortName}
          </span>
        </div>
        <span className="text-xs text-text-muted shrink-0">vs</span>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-sm font-medium truncate text-right">
            {match.awayTeam.shortName}
          </span>
          <img
            src={match.awayTeam.crest}
            alt=""
            className="w-6 h-6 object-contain shrink-0"
            loading="lazy"
          />
        </div>
      </div>

      {/* Time + Venue */}
      <p className="text-xs text-text-muted mb-3 text-center">
        {match.time}
        {match.venue ? ` \u00B7 ${match.venue}` : ""}
      </p>

      {/* Prediction bar */}
      <PredictionBar
        homeWin={prediction.homeWin}
        draw={prediction.draw}
        awayWin={prediction.awayWin}
      />
      <div className="flex justify-between text-[10px] text-text-muted mt-1">
        <span>{prediction.homeWin}%</span>
        <span>{prediction.draw}%</span>
        <span>{prediction.awayWin}%</span>
      </div>

      {/* Importance badge */}
      {importance.score >= 6 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className="text-orange-400">&#128293;</span>
          <span className="font-semibold text-orange-400">
            {importance.score}/10
          </span>
          <span className="text-text-muted">
            &mdash; {importance.reason}
          </span>
        </div>
      )}

      {/* CTA link */}
      <Link
        href={`/match/${match.id}`}
        className="mt-3 block text-center text-xs font-medium text-accent bg-accent/10 px-3 py-1.5 rounded-lg hover:bg-accent/20 transition-colors"
      >
        Xem nhận định &rarr;
      </Link>
    </div>
  );
}

export default async function HomNayPage() {
  const today = getVietnamToday();
  const matches = await getMatches(today, today);

  // Fetch standings for all leagues that have matches today
  const leagueCodes = [...new Set(matches.map((m) => m.competition.code))];
  const standingsMap: Record<string, Standing[]> = {};

  await Promise.all(
    leagueCodes.map(async (code) => {
      standingsMap[code] = await getStandings(code);
    })
  );

  // Compute predictions and importance for each match
  const matchData = matches.map((match) => {
    const standings = standingsMap[match.competition.code] || [];
    const homeStanding =
      standings.find((s) => s.team.id === match.homeTeam.id) || null;
    const awayStanding =
      standings.find((s) => s.team.id === match.awayTeam.id) || null;

    const prediction = computePrediction(homeStanding, awayStanding);
    const importance = computeImportance(homeStanding, awayStanding);

    return { match, prediction, importance };
  });

  return (
    <>
      <Navbar />

      <main className="max-w-3xl mx-auto px-3 py-6">
        {/* SEO heading */}
        <h1 className="text-xl md:text-2xl font-bold mb-1">
          Nhận Định Bóng Đá Hôm Nay
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          {formatVietnameseDate(today)}
        </p>

        {matches.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p className="text-lg mb-2">
              Hôm nay không có trận đấu nào từ 5 giải hàng đầu.
            </p>
            <Link
              href="/"
              className="text-accent text-sm hover:underline"
            >
              Xem lịch đấu sắp tới &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {matchData.map(({ match, prediction, importance }) => (
              <MatchDigestCard
                key={match.id}
                match={match}
                prediction={prediction}
                importance={importance}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 py-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>MatchDay Analyst &mdash; Nhận định bóng đá trước trận</p>
          <p className="mt-0.5">Dữ liệu từ API-Football</p>
        </footer>
      </main>
    </>
  );
}
