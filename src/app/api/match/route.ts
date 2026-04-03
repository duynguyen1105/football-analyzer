import {
  getMatch,
  getStandings,
  getTeamInfo,
  getTeamRecentMatches,
  getTopScorers,
  getH2H,
  computeH2H,
  computeForm,
  getMatchOdds,
  getMatchInjuries,
  getMatchLineups,
  getMatchEvents,
  getMatchStatistics,
  getTeamTopPerformers,
} from "@/lib/football-data";
import { getLeagueId, isKnockoutRound, isTournamentLeague } from "@/lib/constants";
import { computePrediction, computeKnockoutPrediction } from "@/lib/prediction";
import { computeImportance, computeKnockoutImportance } from "@/lib/importance";
import { storePrediction } from "@/lib/prediction-tracker";

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
    const knockout = isTournamentLeague(match.competition.code) && isKnockoutRound(match.round);

    if (knockout) {
      // Knockout: use recent form instead of standings for prediction
      const [h2h, homeRecent, awayRecent] = await Promise.all([
        getH2H(matchId),
        getTeamRecentMatches(match.homeTeam.id, 10),
        getTeamRecentMatches(match.awayTeam.id, 10),
      ]);
      const prediction = computeKnockoutPrediction(
        match.homeTeam.id,
        match.awayTeam.id,
        homeRecent,
        awayRecent,
        h2h
      );
      const importance = computeKnockoutImportance(match.round);

      if (match.status === "SCHEDULED" || match.status === "TIMED") {
        storePrediction(matchId, {
          homeTeam: match.homeTeam.shortName,
          awayTeam: match.awayTeam.shortName,
          league: match.competition.code,
          date: match.date,
          prediction,
        }).catch(() => {});
      }

      return Response.json({
        match,
        standings: [],
        homeStanding: null,
        awayStanding: null,
        prediction,
        importance,
        h2h,
        isKnockout: true,
      }, {
        headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
      });
    }

    // League / group stage: use standings as before
    const [standings, h2h] = await Promise.all([
      getStandings(match.competition.code),
      getH2H(matchId),
    ]);
    const homeStanding = standings.find((s) => s.team.id === match.homeTeam.id) || null;
    const awayStanding = standings.find((s) => s.team.id === match.awayTeam.id) || null;
    const prediction = computePrediction(homeStanding, awayStanding, h2h);
    const importance = computeImportance(homeStanding, awayStanding);

    // Store prediction for accuracy tracking (fire-and-forget)
    if (match.status === "SCHEDULED" || match.status === "TIMED") {
      storePrediction(matchId, {
        homeTeam: match.homeTeam.shortName,
        awayTeam: match.awayTeam.shortName,
        league: match.competition.code,
        date: match.date,
        prediction,
      }).catch(() => {});
    }

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

  // "odds" = bookmaker odds
  if (section === "odds") {
    const odds = await getMatchOdds(matchId);
    return Response.json(odds, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" },
    });
  }

  // "injuries" = player injuries/suspensions
  if (section === "injuries") {
    const injuries = await getMatchInjuries(matchId);
    return Response.json(injuries, {
      headers: { "Cache-Control": "s-maxage=7200, stale-while-revalidate=14400" },
    });
  }

  // "lineups" = predicted/confirmed lineups
  if (section === "lineups") {
    const lineups = await getMatchLineups(matchId);
    return Response.json(lineups, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
    });
  }

  // "events" = match events (goals, cards, subs)
  if (section === "events") {
    const events = await getMatchEvents(matchId);
    return Response.json(events, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" },
    });
  }

  // "statistics" = match statistics (possession, shots, etc.)
  if (section === "statistics") {
    const statistics = await getMatchStatistics(matchId);
    return Response.json(statistics, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
    });
  }

  // "performers" = top performers for both teams (sorted by goals + assists)
  if (section === "performers") {
    const leagueId = getLeagueId(match.competition.code);
    if (!leagueId) {
      return Response.json({ homePerformers: [], awayPerformers: [] }, {
        headers: { "Cache-Control": "s-maxage=7200, stale-while-revalidate=14400" },
      });
    }
    const [homePerformers, awayPerformers] = await Promise.all([
      getTeamTopPerformers(match.homeTeam.id, leagueId),
      getTeamTopPerformers(match.awayTeam.id, leagueId),
    ]);
    return Response.json({ homePerformers, awayPerformers }, {
      headers: { "Cache-Control": "s-maxage=7200, stale-while-revalidate=14400" },
    });
  }

  return Response.json({ error: "Invalid section" }, { status: 400 });
}
