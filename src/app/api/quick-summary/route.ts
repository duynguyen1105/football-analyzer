import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getMatch, getStandings } from "@/lib/football-data";

const client = new Anthropic();

const cache = new Map<string, { text: string; generatedAt: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const matchIdParam = searchParams.get("matchId");

  if (!matchIdParam) {
    return Response.json({ error: "Missing matchId" }, { status: 400 });
  }

  const matchId = parseInt(matchIdParam, 10);

  // Check cache
  const cacheKey = `quick-summary:${matchId}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.generatedAt < CACHE_TTL) {
    return Response.json({ summary: cached.text });
  }

  try {
    const match = await getMatch(matchId);
    if (!match) {
      return Response.json({ error: "Match not found" }, { status: 404 });
    }

    const standings = await getStandings(match.competition.code);
    const homeStanding = standings.find((s) => s.team.id === match.homeTeam.id);
    const awayStanding = standings.find((s) => s.team.id === match.awayTeam.id);

    const homePos = homeStanding?.position ?? "N/A";
    const homePts = homeStanding?.points ?? "N/A";
    const homeForm = match.homeForm.length > 0 ? match.homeForm.join("-") : "N/A";
    const awayPos = awayStanding?.position ?? "N/A";
    const awayPts = awayStanding?.points ?? "N/A";
    const awayForm = match.awayForm.length > 0 ? match.awayForm.join("-") : "N/A";

    const prompt = `Viết 3 điểm nhận định nhanh (mỗi điểm 1 câu ngắn) cho trận ${match.homeTeam.name} vs ${match.awayTeam.name}.
${match.homeTeam.shortName}: Hạng ${homePos}, ${homePts} điểm, phong độ ${homeForm}
${match.awayTeam.shortName}: Hạng ${awayPos}, ${awayPts} điểm, phong độ ${awayForm}
Chỉ trả về 3 dòng, mỗi dòng bắt đầu bằng "•". Không cần tiêu đề.`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const summary =
      response.content[0].type === "text" ? response.content[0].text : "";

    cache.set(cacheKey, { text: summary, generatedAt: Date.now() });

    return Response.json({ summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate summary";
    return Response.json({ error: message }, { status: 500 });
  }
}
