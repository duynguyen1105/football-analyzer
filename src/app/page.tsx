import { Navbar } from "@/components/Navbar";
import { AdSlot } from "@/components/AdSlot";
import { getMatches, getStandings } from "@/lib/football-data";
import { LEAGUES } from "@/lib/constants";
import { Match, Standing } from "@/lib/types";
import Link from "next/link";

export const revalidate = 300;

function getVietnamDate(offsetDays = 0): string {
  const now = new Date();
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  vnTime.setUTCDate(vnTime.getUTCDate() + offsetDays);
  return vnTime.toISOString().slice(0, 10);
}

function FormBadge({ result }: { result: string }) {
  const cls = result === "W" ? "badge-w" : result === "D" ? "badge-d" : "badge-l";
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${cls}`}>
      {result}
    </span>
  );
}

function MatchCard({ match }: { match: Match }) {
  const leagueInfo = LEAGUES.find((l) => l.code === match.competition.code);
  const isFinished = match.status === "FINISHED";

  return (
    <Link
      href={`/match/${match.id}`}
      className="block bg-bg-card rounded-xl border border-border hover:border-accent/30 hover:bg-bg-card-hover transition-all group"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        <span className="text-xs text-text-muted">
          {leagueInfo?.flag} {match.competition.name}
        </span>
        <span className="text-xs text-text-muted">{match.venue}</span>
      </div>
      <div className="px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <div className="flex justify-center mb-2">
              <img src={match.homeTeam.crest} alt={match.homeTeam.shortName} className="w-12 h-12 object-contain" loading="lazy" />
            </div>
            <p className="font-semibold text-sm">{match.homeTeam.shortName}</p>
          </div>
          <div className="px-4 text-center">
            {isFinished && match.score ? (
              <p className="text-2xl font-bold text-text-primary">
                {match.score.home} - {match.score.away}
              </p>
            ) : (
              <p className="text-2xl font-bold text-text-primary">{match.time}</p>
            )}
            <p className="text-xs text-text-muted mt-1">{formatDate(match.date)}</p>
            <div className="mt-3 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium group-hover:bg-accent/20 transition-colors">
              {isFinished ? "Xem lại" : "Phân tích"}
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className="flex justify-center mb-2">
              <img src={match.awayTeam.crest} alt={match.awayTeam.shortName} className="w-12 h-12 object-contain" loading="lazy" />
            </div>
            <p className="font-semibold text-sm">{match.awayTeam.shortName}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StandingsCard({ league, standings }: { league: typeof LEAGUES[number]; standings: Standing[] }) {
  const top5 = standings.slice(0, 5);
  if (top5.length === 0) return null;

  return (
    <div className="bg-bg-card rounded-xl border border-border p-4">
      <h3 className="font-semibold text-sm mb-3">
        {league.flag} {league.name}
      </h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-text-muted">
            <th className="text-left py-1">#</th>
            <th className="text-left py-1">Đội</th>
            <th className="text-center py-1">Tr</th>
            <th className="text-center py-1">HS</th>
            <th className="text-center py-1 font-bold text-text-secondary">Đ</th>
          </tr>
        </thead>
        <tbody className="text-text-secondary">
          {top5.map((row) => (
            <tr key={row.team.id} className="border-t border-border/30">
              <td className="py-1.5 text-text-muted">{row.position}</td>
              <td className="py-1.5">
                <div className="flex items-center gap-1.5">
                  <img src={row.team.crest} alt="" className="w-4 h-4 object-contain" />
                  <span className="text-text-primary font-medium">{row.team.shortName}</span>
                </div>
              </td>
              <td className="py-1.5 text-center">{row.playedGames}</td>
              <td className="py-1.5 text-center">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
              <td className="py-1.5 text-center font-bold text-text-primary">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const { league: leagueFilter } = await searchParams;
  const today = getVietnamDate();
  const nextWeek = getVietnamDate(7);

  const [matches, ...allStandings] = await Promise.all([
    getMatches(today, nextWeek),
    ...LEAGUES.map((l) => getStandings(l.code)),
  ]);

  // Filter by league if specified
  const filteredMatches = leagueFilter
    ? matches.filter((m) => m.competition.code === leagueFilter)
    : matches;

  // Group matches by date
  const grouped: Record<string, Match[]> = {};
  for (const match of filteredMatches) {
    if (!grouped[match.date]) grouped[match.date] = [];
    grouped[match.date].push(match);
  }

  const hasMatches = filteredMatches.length > 0;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Lịch thi đấu & Nhận định</h1>
          <p className="text-text-secondary text-sm mt-1">
            Phân tích trước trận đấu cho 5 giải hàng đầu Châu Âu
          </p>
        </div>

        {/* League filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide">
          <Link
            href="/"
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              !leagueFilter
                ? "bg-accent/15 text-accent border border-accent/30"
                : "text-text-secondary hover:bg-bg-card-hover border border-transparent hover:border-border"
            }`}
          >
            Tất cả giải đấu
          </Link>
          {LEAGUES.map((league) => (
            <Link
              key={league.code}
              href={`/?league=${league.code}`}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                leagueFilter === league.code
                  ? "bg-accent/15 text-accent border border-accent/30"
                  : "text-text-secondary hover:bg-bg-card-hover border border-transparent hover:border-border"
              }`}
            >
              {league.flag} {league.name}
            </Link>
          ))}
        </div>

        <AdSlot size="leaderboard" className="mb-6" />

        {!hasMatches && (
          <div className="text-center py-16 text-text-muted">
            <p className="text-lg">Không có trận đấu nào được lên lịch.</p>
            <p className="text-sm mt-2">Hãy quay lại sau hoặc xem bảng xếp hạng bên dưới.</p>
          </div>
        )}

        {hasMatches && (
          <div className="space-y-8">
            {Object.entries(grouped).map(([date, dateMatches]) => (
              <section key={date}>
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                  {formatDateHeader(date, today)}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dateMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <AdSlot size="rectangle" className="mt-8 mx-auto max-w-md" />

        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Bảng xếp hạng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LEAGUES.map((league, i) => (
              <StandingsCard key={league.code} league={league} standings={allStandings[i] || []} />
            ))}
          </div>
        </section>

        <footer className="mt-12 py-6 border-t border-border text-center text-xs text-text-muted">
          <p>MatchDay Analyst — Nhận định bóng đá trước trận</p>
          <p className="mt-1">Dữ liệu từ Football-Data.org</p>
          <div className="mt-2 flex gap-4 justify-center">
            <Link href="/about" className="hover:text-text-primary transition-colors">Giới thiệu</Link>
            <Link href="/privacy" className="hover:text-text-primary transition-colors">Chính sách bảo mật</Link>
          </div>
        </footer>
      </main>
    </>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "short" });
}

function formatDateHeader(dateStr: string, today: string): string {
  if (dateStr === today) return "Hôm nay";
  const todayD = new Date(today + "T00:00:00");
  const tomorrow = new Date(todayD);
  tomorrow.setDate(todayD.getDate() + 1);
  if (dateStr === tomorrow.toISOString().slice(0, 10)) return "Ngày mai";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" });
}
