import { getStandings, getTopScorers } from "@/lib/football-data";
import { standingsSchema, parseSearchParams } from "@/lib/api-validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = parseSearchParams(standingsSchema, searchParams);
  if (result.error) return result.error;
  const { code, league, type } = result.data;
  const leagueCode = code || league || "PL";

  if (type === "scorers") {
    const scorers = await getTopScorers(leagueCode);
    return Response.json(scorers, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" },
    });
  }

  const standings = await getStandings(leagueCode);
  return Response.json(standings, {
    headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600" },
  });
}
