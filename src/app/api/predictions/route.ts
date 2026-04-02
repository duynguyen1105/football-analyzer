import { getAccuracyStats, getAllPredictions, recordResult } from "@/lib/prediction-tracker";
import { getMatch } from "@/lib/football-data";

export async function GET() {
  // First, try to resolve any unresolved predictions
  const predictions = await getAllPredictions();
  const unresolved = predictions.filter((p) => !p.result);

  // Resolve up to 10 per request to avoid rate limiting
  const toResolve = unresolved.slice(0, 10);
  for (const pred of toResolve) {
    try {
      const match = await getMatch(pred.matchId);
      if (
        match &&
        (match.status === "FINISHED" || match.status === "FT") &&
        match.score &&
        match.score.home !== null &&
        match.score.away !== null
      ) {
        await recordResult(pred.matchId, match.score.home, match.score.away);
      }
    } catch {
      // Skip failed lookups
    }
  }

  const stats = await getAccuracyStats();
  return Response.json(stats, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
  });
}
