import { getStandings } from "@/lib/football-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") || "PL";

  const standings = await getStandings(code);
  return Response.json(standings, {
    headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600" },
  });
}
