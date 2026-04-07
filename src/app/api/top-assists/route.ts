import { getTopAssists } from "@/lib/football-data";
import { topAssistsSchema, parseSearchParams } from "@/lib/api-validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = parseSearchParams(topAssistsSchema, searchParams);
  if (result.error) return result.error;
  const { code } = result.data;

  try {
    const assists = await getTopAssists(code);
    return Response.json(assists, {
      headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600" },
    });
  } catch (error) {
    console.error("Failed to fetch top assists:", error);
    return Response.json([], { status: 500 });
  }
}
