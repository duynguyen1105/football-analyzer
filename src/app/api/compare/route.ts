import Anthropic from "@anthropic-ai/sdk";
import { getPlayerProfile, PlayerProfile } from "@/lib/football-data";
import { getCached, setCached } from "@/lib/cache";

const client = new Anthropic();
const CACHE_TTL = 6 * 60 * 60; // 6 hours

function buildStatsBlock(name: string, p: PlayerProfile): string {
  const s = p.statistics[0];
  if (!s) return `${name}: Không có dữ liệu thống kê`;

  return `${name} (${p.age} tuổi, ${p.nationality}, ${p.position})
  CLB: ${s.team.name} | Giải: ${s.league.name}
  Trận: ${s.games.appearences} | Phút: ${s.games.minutes} | Điểm TB: ${s.games.rating || "N/A"}
  Bàn thắng: ${s.goals.total} | Kiến tạo: ${s.goals.assists}
  Sút: ${s.shots.total} (trúng đích: ${s.shots.on})
  Chuyền: ${s.passes.total} (chính xác: ${s.passes.accuracy ?? "N/A"}%)
  Tắc bóng: ${s.tackles.total} | Cắt bóng: ${s.tackles.interceptions}
  Tranh chấp: ${s.duels.total} (thắng: ${s.duels.won})
  Rê bóng: ${s.dribbles.attempts} (thành công: ${s.dribbles.success})
  Thẻ vàng: ${s.cards.yellow} | Thẻ đỏ: ${s.cards.red}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idA = searchParams.get("a");
  const idB = searchParams.get("b");

  if (!idA || !idB) {
    return Response.json({ error: "Missing player IDs" }, { status: 400 });
  }

  const cacheKey = `compare:${idA}:${idB}`;
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
