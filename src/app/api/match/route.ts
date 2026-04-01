import {
  getMatch,
  getStandings,
  getTeamInfo,
  getTeamRecentMatches,
  getTopScorers,
  getH2H,
  computeH2H,
  computeForm,
} from "@/lib/football-data";
import { computePrediction } from "@/lib/prediction";
import { computeImportance } from "@/lib/importance";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const section = searchParams.get("section") || "core";

  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  const matchId = parseInt(id, 10);
  const match = await getMatch(matchId);
  if (!match) {
    return Response.json({ error: "Match not found" }, { status: 404 });
  }

  // "core" = match + standings + prediction + importance + h2h (fast, essential)
  if (section === "core") {
    const [standings, h2h] = await Promise.all([
      getStandings(match.competition.code),
      getH2H(matchId),
    ]);
    const homeStanding = standings.find((s) => s.team.id === match.homeTeam.id) || null;
    const awayStanding = standings.find((s) => s.team.id === match.awayTeam.id) || null;
    const prediction = computePrediction(homeStanding, awayStanding, h2h);
    const importance = computeImportance(homeStanding, awayStanding);

    return Response.json({
      match,
      standings,
      homeStanding,
      awayStanding,
      prediction,
      importance,
      h2h,
    }, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
    });
  }

  // "form" = recent matches + form computation
  if (section === "form") {
    const [homeRecent, awayRecent] = await Promise.all([
      getTeamRecentMatches(match.homeTeam.id, 10),
      getTeamRecentMatches(match.awayTeam.id, 10),
    ]);
    const homeForm = computeForm(match.homeTeam.id, homeRecent);
    const awayForm = computeForm(match.awayTeam.id, awayRecent);

    return Response.json({ homeForm, awayForm }, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" },
    });
  }

  // "h2h" = head to head (try official endpoint, fallback to computed)
  if (section === "h2h") {
    let h2h = await getH2H(matchId);
    if (!h2h) {
      // Fallback to manual computation
      h2h = await computeH2H(match.homeTeam.id, match.awayTeam.id);
    }
    return Response.json(h2h, {
      headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=172800" },
    });
  }

  // "teams" = team info (coach, squad)
  if (section === "teams") {
    const [homeTeamInfo, awayTeamInfo] = await Promise.all([
      getTeamInfo(match.homeTeam.id),
      getTeamInfo(match.awayTeam.id),
    ]);
    return Response.json({ homeTeamInfo, awayTeamInfo }, {
      headers: { "Cache-Control": "s-maxage=7200, stale-while-revalidate=14400" },
    });
  }

  // "scorers" = top scorers in the league
  if (section === "scorers") {
    const topScorers = await getTopScorers(match.competition.code);
    return Response.json(topScorers, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" },
    });
  }

  return Response.json({ error: "Invalid section" }, { status: 400 });
}
