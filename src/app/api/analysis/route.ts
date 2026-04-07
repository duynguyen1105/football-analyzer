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
import { computePrediction, computeKnockoutPrediction } from "@/lib/prediction";
import { isKnockoutRound, isTournamentLeague } from "@/lib/constants";
import { MatchDetail } from "@/lib/types";
import { analysisSchema, parseSearchParams } from "@/lib/api-validation";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const result = parseSearchParams(analysisSchema, searchParams);
  if (result.error) return result.error;
  const { matchId, lang: langParam } = result.data;
  const lang = langParam || "en";

  try {
    const match = await getMatch(parseInt(matchId, 10));
    if (!match) {
      return Response.json({ error: "Match not found" }, { status: 404 });
    }

    const knockout = isTournamentLeague(match.competition.code) && isKnockoutRound(match.round);

    const [standings, homeTeamInfo, awayTeamInfo, homeRecent, awayRecent, h2h, topScorers] =
      await Promise.all([
        knockout ? Promise.resolve([]) : getStandings(match.competition.code),
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

    let prediction;
    if (knockout) {
      prediction = computeKnockoutPrediction(
        match.homeTeam.id,
        match.awayTeam.id,
        homeRecent,
        awayRecent,
        h2h
      );
    } else {
      const homeStanding = standings.find((s) => s.team.id === match.homeTeam.id) || null;
      const awayStanding = standings.find((s) => s.team.id === match.awayTeam.id) || null;
      prediction = computePrediction(homeStanding, awayStanding, h2h);
    }

    const matchDetail: MatchDetail = {
      match,
      homeTeamInfo,
      awayTeamInfo,
      h2h,
      standings,
      topScorers,
      prediction,
      isKnockout: knockout,
    };

    const analysis = await generateMatchAnalysis(matchDetail, lang);
    return Response.json({ analysis });
  } catch (err: any) {
    return Response.json({ error: err.message || "Failed to generate analysis" }, { status: 500 });
  }
}
