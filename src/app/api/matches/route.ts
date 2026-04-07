import { getMatches } from "@/lib/football-data";
import { matchesSchema, parseSearchParams } from "@/lib/api-validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = parseSearchParams(matchesSchema, searchParams);
  if (result.error) return result.error;
  const { dateFrom, dateTo } = result.data;

  const matches = await getMatches(dateFrom, dateTo);
  return Response.json(matches, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
  });
}
