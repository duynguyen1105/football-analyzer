import { getStandings, getTopScorers } from "@/lib/football-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") || searchParams.get("league") || "PL";
  const type = searchParams.get("type");

  if (type === "scorers") {
    const scorers = await getTopScorers(code);
    return Response.json(scorers, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" },
    });
  }

  const standings = await getStandings(code);
  return Response.json(standings, {
    headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600" },
  });
}
