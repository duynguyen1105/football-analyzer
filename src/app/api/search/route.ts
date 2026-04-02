import { searchTeamsAndPlayers } from "@/lib/football-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return Response.json({ teams: [], players: [] });
  }

  const results = await searchTeamsAndPlayers(q);
  return Response.json(results, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" },
  });
}
