import { searchTeamsAndPlayers } from "@/lib/football-data";
import { searchSchema, parseSearchParams } from "@/lib/api-validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = parseSearchParams(searchSchema, searchParams);
  if (result.error) return result.error;
  const { q } = result.data;

  if (!q || q.trim().length < 2) {
    return Response.json({ teams: [], players: [] });
  }

  const results = await searchTeamsAndPlayers(q);
  return Response.json(results, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" },
  });
}
