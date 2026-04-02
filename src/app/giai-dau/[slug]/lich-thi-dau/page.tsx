import type { Metadata } from "next";
import { getMatches } from "@/lib/football-data";
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

  const today = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const twoWeeks = new Date(Date.now() + 10 * 86400000 + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const allMatches = await getMatches(today, twoWeeks);
  const matches = allMatches.filter((m) => m.competition.code === league.code);

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
                  <Link
                    key={m.id}
                    href={`/match/${m.id}`}
                    className="flex items-center gap-3 bg-bg-card rounded-lg border border-border p-3 hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img src={m.homeTeam.crest} alt="" className="w-5 h-5 object-contain shrink-0" loading="lazy" />
                      <span className="text-sm font-medium truncate">{m.homeTeam.shortName}</span>
                    </div>
                    <span className="text-xs text-text-muted shrink-0">
                      {m.status === "FINISHED" && m.score ? `${m.score.home} - ${m.score.away}` : m.time}
                    </span>
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="text-sm font-medium truncate text-right">{m.awayTeam.shortName}</span>
                      <img src={m.awayTeam.crest} alt="" className="w-5 h-5 object-contain shrink-0" loading="lazy" />
                    </div>
                    <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
                      {m.status === "FINISHED" ? "Xem lại" : "Phân tích"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
