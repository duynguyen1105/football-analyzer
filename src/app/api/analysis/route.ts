import { NextRequest } from "next/server";
import { generateMatchAnalysis } from "@/lib/ai-analysis";
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
import { MatchDetail } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const matchId = searchParams.get("matchId");
  const lang = (searchParams.get("lang") as "en" | "vi") || "en";

  if (!matchId) {
    return Response.json({ error: "Missing matchId" }, { status: 400 });
  }

  try {
    const match = await getMatch(parseInt(matchId, 10));
    if (!match) {
      return Response.json({ error: "Match not found" }, { status: 404 });
    }

    const [standings, homeTeamInfo, awayTeamInfo, homeRecent, awayRecent, h2h, topScorers] =
      await Promise.all([
        getStandings(match.competition.code),
        getTeamInfo(match.homeTeam.id),
        getTeamInfo(match.awayTeam.id),
        getTeamRecentMatches(match.homeTeam.id, 10),
        getTeamRecentMatches(match.awayTeam.id, 10),
        getH2H(parseInt(matchId, 10)).then(r => r || computeH2H(match.homeTeam.id, match.awayTeam.id)),
        getTopScorers(match.competition.code),
      ]);

    const homeForm = computeForm(match.homeTeam.id, homeRecent);
    const awayForm = computeForm(match.awayTeam.id, awayRecent);
    match.homeForm = homeForm;
    match.awayForm = awayForm;

    const homeStanding = standings.find((s) => s.team.id === match.homeTeam.id) || null;
    const awayStanding = standings.find((s) => s.team.id === match.awayTeam.id) || null;
    const prediction = computePrediction(homeStanding, awayStanding, h2h);

    const matchDetail: MatchDetail = {
      match,
      homeTeamInfo,
      awayTeamInfo,
      h2h,
      standings,
      topScorers,
      prediction,
    };

    const analysis = await generateMatchAnalysis(matchDetail, lang);
    return Response.json({ analysis });
  } catch (err: any) {
    return Response.json({ error: err.message || "Failed to generate analysis" }, { status: 500 });
  }
}
