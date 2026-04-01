import {
  getPlayerProfile,
  getPlayerTransfers,
  getPlayerTrophies,
} from "@/lib/football-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const section = searchParams.get("section") || "profile";

  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  const playerId = parseInt(id, 10);

  if (section === "profile") {
    const profile = await getPlayerProfile(playerId);
    if (!profile) {
      return Response.json({ error: "Player not found" }, { status: 404 });
    }
    return Response.json(profile, {
      headers: { "Cache-Control": "s-maxage=7200, stale-while-revalidate=14400" },
    });
  }

  if (section === "transfers") {
    const transfers = await getPlayerTransfers(playerId);
    return Response.json(transfers, {
      headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=172800" },
    });
  }

  if (section === "trophies") {
    const trophies = await getPlayerTrophies(playerId);
    return Response.json(trophies, {
      headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=172800" },
    });
  }

  return Response.json({ error: "Invalid section" }, { status: 400 });
}
