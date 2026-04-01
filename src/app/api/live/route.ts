import { getLiveMatches } from "@/lib/football-data";

export async function GET() {
  try {
    const matches = await getLiveMatches();
    return Response.json(matches, {
      headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error("Failed to fetch live matches:", error);
    return Response.json([], { status: 500 });
  }
}
