import { getStandings } from "@/lib/football-data";
import { LEAGUES } from "@/lib/constants";

export async function generateStaticParams() {
  const params: { id: string }[] = [];
  const seenIds = new Set<number>();

  const results = await Promise.allSettled(
    LEAGUES.filter((l) => !l.isTournament).map((l) => getStandings(l.code))
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const s of result.value) {
        if (!seenIds.has(s.team.id)) {
          seenIds.add(s.team.id);
          params.push({ id: String(s.team.id) });
        }
      }
    }
  }

  return params;
}

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
