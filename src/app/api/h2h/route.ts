import { computeH2H } from "@/lib/football-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamA = searchParams.get("a");
  const teamB = searchParams.get("b");

  if (!teamA || !teamB) {
    return Response.json({ error: "Missing team IDs (a, b)" }, { status: 400 });
  }

  const h2h = await computeH2H(parseInt(teamA, 10), parseInt(teamB, 10));

  if (!h2h) {
    return Response.json({ error: "No H2H data found" }, { status: 404 });
  }

  return Response.json(h2h, {
    headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=172800" },
  });
}
