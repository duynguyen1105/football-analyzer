import type { Metadata } from "next";
import { getMatches, getTournamentFixtures } from "@/lib/football-data";
import { getVietnamDate } from "@/lib/timezone";
import { getLeagueBySlug } from "@/lib/league-slugs";
import { Match } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const league = getLeagueBySlug(slug);
  if (!league) return {};

  return {
    title: `Lịch thi đấu ${league.name} — Giải đấu ${league.name}`,
    description: `Lịch thi đấu ${league.name} mùa giải 2025/26. Cập nhật hàng ngày với thời gian Việt Nam (GMT+7).`,
  };
}

export default async function LeagueSchedulePage({ params }: Props) {
  const { slug } = await params;
  const league = getLeagueBySlug(slug);
  if (!league) notFound();

  let matches: Match[];

  if (league.isTournament) {
    // Fetch all tournament fixtures
    matches = await getTournamentFixtures(league.code);
  } else {
    // Fetch next 10 days for domestic leagues
    const today = getVietnamDate();
    const twoWeeks = getVietnamDate(10);
    const allMatches = await getMatches(today, twoWeeks);
    matches = allMatches.filter((m) => m.competition.code === league.code);
  }

  if (league.isTournament) {
    return <TournamentSchedule matches={matches} league={league} />;
  }

  // Group by date for domestic leagues
  const grouped: Record<string, Match[]> = {};
  for (const m of matches) {
    (grouped[m.date] ??= []).push(m);
  }

  return (
    <section>
      <h2 className="text-base font-bold mb-2">Lịch thi đấu {league.name}</h2>
      <p className="text-sm text-text-secondary mb-6">
        Cập nhật 10 ngày tới &middot; Giờ Việt Nam (GMT+7)
      </p>

      {matches.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          Không có trận đấu nào trong 10 ngày tới.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, dateMatches]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                {new Date(date + "T00:00:00").toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>
              <div className="space-y-2">
                {dateMatches.map((m) => (
                  <MatchRow key={m.id} match={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Tournament schedule grouped by round ─── */

function TournamentSchedule({ matches, league }: { matches: Match[]; league: NonNullable<ReturnType<typeof getLeagueBySlug>> }) {
  // Split into upcoming (nearest first) and finished (most recent first)
  const upcoming = matches
    .filter((m) => m.status !== "FINISHED")
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const finished = matches
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

  // Group each by round
  function groupByRound(list: Match[]): [string, Match[]][] {
    const map: Record<string, Match[]> = {};
    for (const m of list) {
      const round = m.round || "Khác";
      (map[round] ??= []).push(m);
    }
    return Object.entries(map);
  }

  const upcomingByRound = groupByRound(upcoming);
  const finishedByRound = groupByRound(finished);

  return (
    <section>
      <h2 className="text-base font-bold mb-2">Lịch thi đấu {league.name}</h2>
      <p className="text-sm text-text-secondary mb-6">
        Toàn bộ giải đấu &middot; Giờ Việt Nam (GMT+7)
      </p>

      {matches.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          Chưa có lịch thi đấu.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming matches first */}
          {upcomingByRound.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Sắp diễn ra</span>
              </div>
              <div className="space-y-6">
                {upcomingByRound.map(([round, roundMatches]) => (
                  <RoundGroup key={`up-${round}`} round={round} matches={roundMatches} />
                ))}
              </div>
            </div>
          )}

          {/* Finished matches */}
          {finishedByRound.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold text-text-muted bg-border/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Đã kết thúc</span>
              </div>
              <div className="space-y-6">
                {finishedByRound.map(([round, roundMatches]) => (
                  <RoundGroup key={`fin-${round}`} round={round} matches={roundMatches} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function RoundGroup({ round, matches }: { round: string; matches: Match[] }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-accent uppercase tracking-wide mb-2 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        {round}
      </h3>
      <div className="space-y-2">
        {matches.map((m) => (
          <MatchRow key={m.id} match={m} />
        ))}
      </div>
    </div>
  );
}

function MatchRow({ match: m }: { match: Match }) {
  return (
    <Link
      href={`/match/${m.id}`}
      className="flex items-center gap-3 bg-bg-card rounded-lg border border-border p-3 hover:border-accent/30 transition-colors"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <img src={m.homeTeam.crest} alt="" className="w-5 h-5 object-contain shrink-0" loading="lazy" />
        <span className="text-sm font-medium truncate">{m.homeTeam.shortName}</span>
      </div>
      <div className="text-center shrink-0">
        {m.status === "FINISHED" && m.score ? (
          <span className="text-base font-bold text-text-primary">{m.score.home} - {m.score.away}</span>
        ) : (
          <span className="text-sm font-semibold text-accent">{m.time}</span>
        )}
        <p className="text-[10px] text-text-muted">{m.date}</p>
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className="text-sm font-medium truncate text-right">{m.awayTeam.shortName}</span>
        <img src={m.awayTeam.crest} alt="" className="w-5 h-5 object-contain shrink-0" loading="lazy" />
      </div>
      <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
        {m.status === "FINISHED" ? "Xem lại" : "Phân tích"}
      </span>
    </Link>
  );
}
