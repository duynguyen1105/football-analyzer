import { computeH2H } from "@/lib/football-data";
import { h2hSchema, parseSearchParams } from "@/lib/api-validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = parseSearchParams(h2hSchema, searchParams);
  if (result.error) return result.error;
  const { a: teamA, b: teamB } = result.data;

  const h2h = await computeH2H(parseInt(teamA, 10), parseInt(teamB, 10));

  if (!h2h) {
    return Response.json({ error: "No H2H data found" }, { status: 404 });
  }

  return Response.json(h2h, {
    headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=172800" },
  });
}
