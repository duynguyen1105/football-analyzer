import type { Metadata } from "next";
import { getMatches, getMatchOdds } from "@/lib/football-data";
import { getVietnamDate } from "@/lib/timezone";
import { getLeagueBySlug } from "@/lib/league-slugs";
import { Match, MatchOdds } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 1800;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const league = getLeagueBySlug(slug);
  if (!league) return {};

  return {
    title: `Soi kèo ${league.name} — Tỷ lệ kèo mới nhất`,
    description: `Soi kèo ${league.name} mùa giải 2025/26. So sánh tỷ lệ kèo từ các nhà cái.`,
  };
}

export default async function LeagueOddsPage({ params }: Props) {
  const { slug } = await params;
  const league = getLeagueBySlug(slug);
  if (!league) notFound();

  const today = getVietnamDate();
  const nextWeek = getVietnamDate(7);

  const allMatches = await getMatches(today, nextWeek);
  const matches = allMatches.filter((m) => m.competition.code === league.code && m.status === "SCHEDULED");

  const matchesWithOdds: { match: Match; odds: MatchOdds | null }[] = await Promise.all(
    matches.slice(0, 10).map(async (match) => ({
      match,
      odds: await getMatchOdds(match.id),
    }))
  );

  return (
    <section>
      <h2 className="text-base font-bold mb-2">Soi kèo {league.name}</h2>
      <p className="text-sm text-text-secondary mb-6">
        Tỷ lệ kèo từ các nhà cái &middot; Cập nhật mỗi giờ
      </p>

      {matchesWithOdds.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          Không có trận đấu nào có tỷ lệ kèo trong 7 ngày tới.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {matchesWithOdds.map(({ match, odds }) => {
            const matchWinner = odds?.bookmakers?.[0]?.bets?.find(
              (b) => b.name === "Match Winner" || b.name === "Home/Away"
            );
            const home = matchWinner?.values.find((v) => v.value === "Home")?.odd;
            const draw = matchWinner?.values.find((v) => v.value === "Draw")?.odd;
            const away = matchWinner?.values.find((v) => v.value === "Away")?.odd;

            return (
              <Link
                key={match.id}
                href={`/match/${match.id}`}
                className="block bg-bg-card rounded-xl border border-border p-4 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img src={match.homeTeam.crest} alt="" className="w-10 h-10 object-contain shrink-0" loading="lazy" />
                    <span className="font-semibold truncate">{match.homeTeam.shortName}</span>
                  </div>
                  <div className="text-center px-4">
                    <span className="text-xs text-text-muted">{match.date}</span>
                    <p className="text-sm font-medium">{match.time}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                    <span className="font-semibold truncate text-right">{match.awayTeam.shortName}</span>
                    <img src={match.awayTeam.crest} alt="" className="w-10 h-10 object-contain shrink-0" loading="lazy" />
                  </div>
                </div>

                {matchWinner ? (
                  <div className="flex gap-2">
                    <OddBadge label="Thắng nhà" value={home} color="accent" />
                    <OddBadge label="Hòa" value={draw} color="accent-yellow" />
                    <OddBadge label="Thắng khách" value={away} color="accent-2" />
                  </div>
                ) : (
                  <p className="text-xs text-text-muted text-center py-2">Chưa có tỷ lệ kèo</p>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-text-muted mt-6 text-center">
        Tỷ lệ kèo chỉ mang tính chất tham khảo, phân tích thông tin.
      </p>
    </section>
  );
}

function OddBadge({ label, value, color }: { label: string; value?: string; color: string }) {
  return (
    <div className={`flex-1 text-center py-1.5 px-2 rounded-lg bg-${color}/10`}>
      <p className={`text-xs font-bold text-${color}`}>{value ?? "-"}</p>
      <p className="text-[9px] text-text-muted">{label}</p>
    </div>
  );
}
