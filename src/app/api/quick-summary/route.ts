import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getMatch, getStandings, getTeamRecentMatches, computeForm } from "@/lib/football-data";
import { isKnockoutRound, isTournamentLeague } from "@/lib/constants";
import { getCached, setCached } from "@/lib/cache";

const client = new Anthropic();

const CACHE_TTL_SECONDS = 6 * 60 * 60; // 6 hours

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const matchIdParam = searchParams.get("matchId");

  if (!matchIdParam) {
    return Response.json({ error: "Missing matchId" }, { status: 400 });
  }

  const matchId = parseInt(matchIdParam, 10);
  const cacheKey = `quick-summary:${matchId}`;

  // Check persistent cache
  const cached = await getCached(cacheKey);
  if (cached) {
    return Response.json({ summary: cached });
  }

  try {
    const match = await getMatch(matchId);
    if (!match) {
      return Response.json({ error: "Match not found" }, { status: 404 });
    }

    const knockout = isTournamentLeague(match.competition.code) && isKnockoutRound(match.round);

    let prompt: string;

    if (knockout) {
      const [homeRecent, awayRecent] = await Promise.all([
        getTeamRecentMatches(match.homeTeam.id, 5),
        getTeamRecentMatches(match.awayTeam.id, 5),
      ]);
      const homeForm = computeForm(match.homeTeam.id, homeRecent);
      const awayForm = computeForm(match.awayTeam.id, awayRecent);

      prompt = `Viết 3 điểm nhận định nhanh (mỗi điểm 1 câu ngắn) cho trận ${match.homeTeam.name} vs ${match.awayTeam.name}.
Giải: ${match.competition.name} — ${match.round} (vòng loại trực tiếp, thua là bị loại)
Phong độ ${match.homeTeam.shortName}: ${homeForm.join("-") || "N/A"}
Phong độ ${match.awayTeam.shortName}: ${awayForm.join("-") || "N/A"}
KHÔNG nhắc đến thứ hạng hay bảng xếp hạng vòng bảng. Tập trung vào phong độ, lịch sử đối đầu, và áp lực loại trực tiếp.
Chỉ trả về 3 dòng, mỗi dòng bắt đầu bằng "•". Không cần tiêu đề.`;
    } else {
      const standings = await getStandings(match.competition.code);
      const homeStanding = standings.find((s) => s.team.id === match.homeTeam.id);
      const awayStanding = standings.find((s) => s.team.id === match.awayTeam.id);

      const homePos = homeStanding?.position ?? "N/A";
      const homePts = homeStanding?.points ?? "N/A";
      const awayPos = awayStanding?.position ?? "N/A";
      const awayPts = awayStanding?.points ?? "N/A";

      prompt = `Viết 3 điểm nhận định nhanh (mỗi điểm 1 câu ngắn) cho trận ${match.homeTeam.name} vs ${match.awayTeam.name}.
${match.homeTeam.shortName}: Hạng ${homePos}, ${homePts} điểm
${match.awayTeam.shortName}: Hạng ${awayPos}, ${awayPts} điểm
Chỉ trả về 3 dòng, mỗi dòng bắt đầu bằng "•". Không cần tiêu đề.`;
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const summary =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Store persistently
    await setCached(cacheKey, summary, CACHE_TTL_SECONDS);

    return Response.json({ summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate summary";
    return Response.json({ error: message }, { status: 500 });
  }
}
