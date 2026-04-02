import type { Metadata } from "next";
import { getTopAssists } from "@/lib/football-data";
import { getLeagueBySlug } from "@/lib/league-slugs";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 1800;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const league = getLeagueBySlug(slug);
  if (!league) return {};

  return {
    title: `Top kiến tạo ${league.name} — Mùa giải 2025/26`,
    description: `Bảng xếp hạng kiến tạo ${league.name} mùa giải 2025/26. Thống kê kiến tạo, bàn thắng chi tiết.`,
  };
}

export default async function TopAssistsPage({ params }: Props) {
  const { slug } = await params;
  const league = getLeagueBySlug(slug);
  if (!league) notFound();

  const players = await getTopAssists(league.code);

  return (
    <section>
      <h2 className="text-base font-bold mb-2">Top kiến tạo {league.name}</h2>
      <p className="text-sm text-text-secondary mb-6">
        Bảng xếp hạng kiến tạo mùa giải 2025/26
      </p>

      {players.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          Chưa có dữ liệu kiến tạo.
        </div>
      ) : (
        <div className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
          {players.map((player, i) => (
            <Link
              key={player.id || i}
              href={player.id ? `/cau-thu/${player.id}` : "#"}
              className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0 hover:bg-bg-primary/50 transition-colors rounded-lg px-2 -mx-2"
            >
              {/* Rank */}
              <div className="w-8 text-center">
                <span className={`text-lg font-bold ${i < 3 ? "text-accent" : "text-text-muted"}`}>
                  {i + 1}
                </span>
              </div>

              {/* Photo */}
              <div className="w-12 h-12 rounded-full overflow-hidden bg-border/20 shrink-0">
                {player.photo ? (
                  <img src={player.photo} alt={player.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">&#128100;</div>
                )}
              </div>

              {/* Player info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{player.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {player.teamLogo && (
                    <img src={player.teamLogo} alt="" className="w-4 h-4 object-contain" />
                  )}
                  <span className="text-xs text-text-muted truncate">{player.team}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-accent">{player.assists}</p>
                  <p className="text-[10px] text-text-muted">Kiến tạo</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-text-secondary">{player.goals}</p>
                  <p className="text-[10px] text-text-muted">Bàn thắng</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
