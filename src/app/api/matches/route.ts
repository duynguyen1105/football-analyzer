import { getMatches } from "@/lib/football-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  if (!dateFrom || !dateTo) {
    return Response.json({ error: "Missing dateFrom or dateTo" }, { status: 400 });
  }

  const matches = await getMatches(dateFrom, dateTo);
  return Response.json(matches, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
  });
}
