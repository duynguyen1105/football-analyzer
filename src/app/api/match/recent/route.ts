import { getTeamRecentMatches } from "@/lib/football-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = parseInt(searchParams.get("teamId") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "5", 10);

  if (!teamId) {
    return Response.json({ error: "Missing teamId" }, { status: 400 });
  }

  const matches = await getTeamRecentMatches(teamId, limit);
  return Response.json(matches, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" },
  });
}
