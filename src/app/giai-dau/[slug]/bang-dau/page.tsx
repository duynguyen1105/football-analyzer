import type { Metadata } from "next";
import { getGroupStandings } from "@/lib/football-data";
import { getLeagueBySlug } from "@/lib/league-slugs";
import { GroupStanding } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 1800;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const league = getLeagueBySlug(slug);
  if (!league) return {};

  return {
    title: `Bảng đấu ${league.name} — Vòng bảng mùa giải`,
    description: `Bảng đấu ${league.name}: thứ hạng các bảng, điểm, hiệu số bàn thắng.`,
  };
}

export default async function GroupStagePage({ params }: Props) {
  const { slug } = await params;
  const league = getLeagueBySlug(slug);
  if (!league) notFound();

  const groups = await getGroupStandings(league.code);

  return (
    <section>
      <h2 className="text-base font-bold mb-2">Bảng đấu {league.name}</h2>
      <p className="text-sm text-text-secondary mb-6">
        Vòng bảng &middot; {groups.length} bảng
      </p>

      {groups.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          Chưa có dữ liệu bảng đấu.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((g) => (
            <GroupTable key={g.group} group={g} />
          ))}
        </div>
      )}

      <div className="flex gap-4 mt-4 text-[10px] text-text-muted">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-sm" />
          <span>Đi tiếp</span>
        </div>
      </div>
    </section>
  );
}

function GroupTable({ group }: { group: GroupStanding }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-3 py-2 border-b border-border bg-bg-primary/30">
        <h3 className="text-xs font-bold">{group.group}</h3>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-text-muted">
            <th className="text-left py-1.5 px-2 w-6">#</th>
            <th className="text-left py-1.5 px-2">Đội</th>
            <th className="text-center py-1.5 px-1 w-6">Tr</th>
            <th className="text-center py-1.5 px-1 w-6">T</th>
            <th className="text-center py-1.5 px-1 w-6">H</th>
            <th className="text-center py-1.5 px-1 w-6">B</th>
            <th className="text-center py-1.5 px-1 w-7 hidden sm:table-cell">BT</th>
            <th className="text-center py-1.5 px-1 w-7 hidden sm:table-cell">BB</th>
            <th className="text-center py-1.5 px-1 w-7">HS</th>
            <th className="text-center py-1.5 px-2 w-7 font-bold text-text-secondary">D</th>
          </tr>
        </thead>
        <tbody className="text-text-secondary">
          {group.standings.map((r) => {
            const isQualify = r.position <= 2;
            return (
              <tr key={r.team.id} className={`border-t border-border/30 ${isQualify ? "border-l-2 border-l-green-500" : "border-l-2 border-l-transparent"}`}>
                <td className="py-1.5 px-2 text-text-muted">{r.position}</td>
                <td className="py-1.5 px-2">
                  <Link href={`/doi-bong/${r.team.id}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                    <img src={r.team.crest} alt="" className="w-4 h-4 object-contain shrink-0" loading="lazy" />
                    <span className="text-text-primary font-medium truncate">{r.team.shortName}</span>
                  </Link>
                </td>
                <td className="py-1.5 px-1 text-center">{r.playedGames}</td>
                <td className="py-1.5 px-1 text-center">{r.won}</td>
                <td className="py-1.5 px-1 text-center">{r.draw}</td>
                <td className="py-1.5 px-1 text-center">{r.lost}</td>
                <td className="py-1.5 px-1 text-center hidden sm:table-cell">{r.goalsFor}</td>
                <td className="py-1.5 px-1 text-center hidden sm:table-cell">{r.goalsAgainst}</td>
                <td className="py-1.5 px-1 text-center">{r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}</td>
                <td className="py-1.5 px-2 text-center font-bold text-text-primary">{r.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
