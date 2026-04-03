import Anthropic from "@anthropic-ai/sdk";
import { getPlayerProfile, PlayerProfile } from "@/lib/football-data";
import { getCached, setCached } from "@/lib/cache";

const client = new Anthropic();
const CACHE_TTL = 6 * 60 * 60; // 6 hours

function buildStatsBlock(name: string, p: PlayerProfile): string {
  if (!p.statistics.length) return `${name}: Không có dữ liệu thống kê`;

  // Aggregate across all competitions this season
  let apps = 0, mins = 0, goals = 0, assists = 0;
  let shots = 0, shotsOn = 0, passes = 0;
  let tackles = 0, interceptions = 0;
  let duels = 0, duelsWon = 0;
  let dribbleAttempts = 0, dribbleSuccess = 0;
  let yellow = 0, red = 0;
  let ratingSum = 0, ratingCount = 0;
  const leagues: string[] = [];

  for (const s of p.statistics) {
    apps += s.games.appearences;
    mins += s.games.minutes;
    goals += s.goals.total;
    assists += s.goals.assists;
    shots += s.shots.total;
    shotsOn += s.shots.on;
    passes += s.passes.total;
    tackles += s.tackles.total;
    interceptions += s.tackles.interceptions;
    duels += s.duels.total;
    duelsWon += s.duels.won;
    dribbleAttempts += s.dribbles.attempts;
    dribbleSuccess += s.dribbles.success;
    yellow += s.cards.yellow;
    red += s.cards.red;
    if (s.games.rating) {
      ratingSum += parseFloat(s.games.rating) * s.games.appearences;
      ratingCount += s.games.appearences;
    }
    if (s.league.name && !leagues.includes(s.league.name)) {
      leagues.push(s.league.name);
    }
  }

  const avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(2) : "N/A";

  return `${name} (${p.age} tuổi, ${p.nationality}, ${p.position})
  CLB: ${p.currentTeam?.name ?? "N/A"} | Giải: ${leagues.join(", ")}
  Trận: ${apps} | Phút: ${mins} | Điểm TB: ${avgRating}
  Bàn thắng: ${goals} | Kiến tạo: ${assists}
  Sút: ${shots} (trúng đích: ${shotsOn})
  Chuyền: ${passes}
  Tắc bóng: ${tackles} | Cắt bóng: ${interceptions}
  Tranh chấp: ${duels} (thắng: ${duelsWon})
  Rê bóng: ${dribbleAttempts} (thành công: ${dribbleSuccess})
  Thẻ vàng: ${yellow} | Thẻ đỏ: ${red}
  (Tổng hợp từ ${p.statistics.length} giải đấu mùa này)`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idA = searchParams.get("a");
  const idB = searchParams.get("b");

  if (!idA || !idB) {
    return Response.json({ error: "Missing player IDs" }, { status: 400 });
  }

  const cacheKey = `compare-v2:${idA}:${idB}`;
  const cached = await getCached(cacheKey);
  if (cached) {
    return Response.json({ analysis: cached });
  }

  const [playerA, playerB] = await Promise.all([
    getPlayerProfile(parseInt(idA, 10)),
    getPlayerProfile(parseInt(idB, 10)),
  ]);

  if (!playerA || !playerB) {
    return Response.json({ error: "Player not found" }, { status: 404 });
  }

  const prompt = `Bạn là chuyên gia phân tích bóng đá. Dựa trên thống kê mùa giải dưới đây, hãy viết bài nhận xét so sánh 2 cầu thủ bằng tiếng Việt (3-4 đoạn ngắn). Bài viết cần:

1. So sánh điểm mạnh — điểm yếu của từng cầu thủ dựa trên số liệu cụ thể
2. Đánh giá ai đang có phong độ tốt hơn mùa này và vì sao
3. Phân tích vai trò chiến thuật — cầu thủ nào phù hợp hơn trong hệ thống nào
4. Kết luận rõ ràng: ai đang chơi hay hơn mùa này

CẦU THỦ A:
${buildStatsBlock(playerA.name, playerA)}

CẦU THỦ B:
${buildStatsBlock(playerB.name, playerB)}

Viết tự nhiên, không dùng markdown headers hay bullet points. Dùng số liệu cụ thể để minh chứng. Kết thúc bằng một câu kết luận in đậm (**...**).`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    await setCached(cacheKey, text, CACHE_TTL);

    return Response.json({ analysis: text }, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch (err: any) {
    return Response.json({ error: err.message || "AI analysis failed" }, { status: 500 });
  }
}
