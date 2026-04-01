import { getTopAssists } from "@/lib/football-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return Response.json({ error: "Missing code" }, { status: 400 });
  }

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
