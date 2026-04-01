import {
  getTeamProfile,
  getTeamSeasonStats,
  getTeamSquad,
  getTeamRecentMatches,
} from "@/lib/football-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const section = searchParams.get("section") || "profile";
  const leagueId = searchParams.get("leagueId");

  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  const teamId = parseInt(id, 10);

  if (section === "profile") {
    const profile = await getTeamProfile(teamId);
    if (!profile) {
      return Response.json({ error: "Team not found" }, { status: 404 });
    }
    return Response.json(profile, {
      headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=172800" },
    });
  }

  if (section === "stats") {
    if (!leagueId) {
      return Response.json({ error: "Missing leagueId for stats" }, { status: 400 });
    }
    const stats = await getTeamSeasonStats(teamId, parseInt(leagueId, 10));
    return Response.json(stats, {
      headers: { "Cache-Control": "s-maxage=7200, stale-while-revalidate=14400" },
    });
  }

  if (section === "squad") {
    const squad = await getTeamSquad(teamId);
    return Response.json(squad, {
      headers: { "Cache-Control": "s-maxage=7200, stale-while-revalidate=14400" },
    });
  }

  if (section === "recent") {
    const matches = await getTeamRecentMatches(teamId, 10);
    return Response.json(matches, {
      headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600" },
    });
  }

  return Response.json({ error: "Invalid section" }, { status: 400 });
}
