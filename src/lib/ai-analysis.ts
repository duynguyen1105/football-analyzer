import Anthropic from "@anthropic-ai/sdk";
import { MatchDetail } from "./types";

const client = new Anthropic();

const cache = new Map<string, { text: string; generatedAt: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours

export async function generateMatchAnalysis(
  data: MatchDetail,
  lang: "en" | "vi" = "en"
): Promise<string> {
  const cacheKey = `${data.match.id}-${lang}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.generatedAt < CACHE_TTL) {
    return cached.text;
  }

  const prompt = lang === "en" ? buildEnglishPrompt(data) : buildVietnamesePrompt(data);

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  cache.set(cacheKey, { text, generatedAt: Date.now() });
  return text;
}

function buildDataBlock(data: MatchDetail): string {
  const { match, h2h, standings, prediction, homeTeamInfo, awayTeamInfo, topScorers } = data;

  const homeStanding = standings.find((s) => s.team.id === match.homeTeam.id);
  const awayStanding = standings.find((s) => s.team.id === match.awayTeam.id);

  let block = `MATCH: ${match.homeTeam.name} (HOME) vs ${match.awayTeam.name} (AWAY)
LEAGUE: ${match.competition.name}
VENUE: ${match.venue}`;

  if (homeStanding && awayStanding) {
    block += `

STANDINGS:
- ${match.homeTeam.shortName}: ${homeStanding.position}th, ${homeStanding.points}pts, ${homeStanding.won}W-${homeStanding.draw}D-${homeStanding.lost}L, GF:${homeStanding.goalsFor} GA:${homeStanding.goalsAgainst} GD:${homeStanding.goalDifference > 0 ? "+" : ""}${homeStanding.goalDifference}
- ${match.awayTeam.shortName}: ${awayStanding.position}th, ${awayStanding.points}pts, ${awayStanding.won}W-${awayStanding.draw}D-${awayStanding.lost}L, GF:${awayStanding.goalsFor} GA:${awayStanding.goalsAgainst} GD:${awayStanding.goalDifference > 0 ? "+" : ""}${awayStanding.goalDifference}`;
  }

  if (match.homeForm.length > 0 || match.awayForm.length > 0) {
    block += `

FORM (last 5): ${match.homeTeam.shortName}: ${match.homeForm.join("-") || "N/A"} | ${match.awayTeam.shortName}: ${match.awayForm.join("-") || "N/A"}`;
  }

  if (h2h && h2h.lastMatches.length > 0) {
    block += `

HEAD TO HEAD: ${match.homeTeam.shortName} ${h2h.homeWins}W - ${h2h.draws}D - ${h2h.awayWins}W ${match.awayTeam.shortName}
Recent meetings:
${h2h.lastMatches.map((m) => `  ${m.date}: ${m.home} ${m.scoreHome}-${m.scoreAway} ${m.away}`).join("\n")}`;
  }

  if (homeTeamInfo?.coach || awayTeamInfo?.coach) {
    block += `

MANAGERS:`;
    if (homeTeamInfo?.coach) block += `\n- ${match.homeTeam.shortName}: ${homeTeamInfo.coach.name} (${homeTeamInfo.coach.nationality})`;
    if (awayTeamInfo?.coach) block += `\n- ${match.awayTeam.shortName}: ${awayTeamInfo.coach.name} (${awayTeamInfo.coach.nationality})`;
  }

  const homeScorers = topScorers.filter((s) => s.team === match.homeTeam.name);
  const awayScorers = topScorers.filter((s) => s.team === match.awayTeam.name);
  if (homeScorers.length > 0 || awayScorers.length > 0) {
    block += `

TOP SCORERS IN LEAGUE:`;
    for (const s of [...homeScorers, ...awayScorers]) {
      block += `\n- ${s.name} (${s.team}): ${s.goals} goals${s.assists ? `, ${s.assists} assists` : ""}`;
    }
  }

  if (homeTeamInfo?.squad && awayTeamInfo?.squad) {
    block += `

SQUAD SIZE: ${match.homeTeam.shortName}: ${homeTeamInfo.squad.length} players | ${match.awayTeam.shortName}: ${awayTeamInfo.squad.length} players`;
  }

  block += `

PREDICTION MODEL: Home win ${prediction.homeWin}% | Draw ${prediction.draw}% | Away win ${prediction.awayWin}% | BTTS ${prediction.btts}% | Over 2.5 ${prediction.over25}%`;

  return block;
}

function buildEnglishPrompt(data: MatchDetail): string {
  return `You are a football analyst writing an actionable pre-match preview for informed readers. Write a concise, insightful analysis (5-6 short paragraphs) based on the data below. Your analysis must cover:

1. Key tactical matchups and how each manager is likely to set up
2. Current form and momentum — which team is on the rise or declining
3. Motivation assessment — which team has more at stake (title race, relegation, European spots)
4. Injury impact — how missing or returning players affect the balance
5. Head-to-head patterns and what they tell us about this fixture
6. Clear verdict with reasoning

${buildDataBlock(data)}

Write naturally. No markdown headers. No bullet points. Just flowing paragraphs. Be specific with numbers. Mention the managers and key players when relevant. Make your analysis actionable — help readers understand the likely dynamics of the match.

End with your predicted final score in bold format like **Predicted Score: ${data.match.homeTeam.shortName} 2-1 ${data.match.awayTeam.shortName}**`;
}

function buildVietnamesePrompt(data: MatchDetail): string {
  return `Bạn là một nhà phân tích bóng đá chuyên nghiệp viết bài nhận định trước trận cho người đọc muốn đưa ra quyết định sáng suốt. Viết bài phân tích ngắn gọn, sâu sắc (5-6 đoạn ngắn) dựa trên dữ liệu bên dưới. Bài phân tích phải bao gồm:

1. Đối đầu chiến thuật quan trọng — cách mỗi HLV có thể bố trí đội hình
2. Phong độ hiện tại — đội nào đang trên đà thăng tiến hay sa sút
3. Đánh giá động lực — đội nào có nhiều lý do để chiến đấu hơn (đua vô địch, trụ hạng, suất châu Âu)
4. Ảnh hưởng chấn thương — cầu thủ vắng mặt hoặc trở lại tác động thế nào
5. Lịch sử đối đầu và bài học rút ra
6. Nhận định rõ ràng kèm lý do

${buildDataBlock(data)}

Viết tự nhiên bằng tiếng Việt. Không dùng markdown headers. Không dùng bullet points. Chỉ các đoạn văn liền mạch. Dùng số liệu cụ thể. Nhắc đến HLV và cầu thủ chủ chốt khi cần. Phân tích phải mang tính ứng dụng — giúp người đọc hiểu rõ diễn biến có thể xảy ra trong trận đấu.

Kết thúc bằng dự đoán tỉ số in đậm theo format: **Dự đoán tỉ số: ${data.match.homeTeam.shortName} 2-1 ${data.match.awayTeam.shortName}**`;
}
