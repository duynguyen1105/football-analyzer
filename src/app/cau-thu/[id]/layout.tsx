import { getTopScorers } from "@/lib/football-data";
import { LEAGUES } from "@/lib/constants";

export async function generateStaticParams() {
  const params: { id: string }[] = [];
  const seenIds = new Set<number>();

  // Pre-generate pages for top scorers across all leagues
  const results = await Promise.allSettled(
    LEAGUES.filter((l) => !l.isTournament).map((l) => getTopScorers(l.code))
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const scorer of result.value) {
        if (scorer.id && !seenIds.has(scorer.id)) {
          seenIds.add(scorer.id);
          params.push({ id: String(scorer.id) });
        }
      }
    }
  }

  return params;
}

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
