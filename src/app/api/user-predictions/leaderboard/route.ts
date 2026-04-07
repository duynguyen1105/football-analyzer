import { getCached } from "@/lib/cache";
import type { LeaderboardEntry } from "@/lib/prediction-game";

// ---------------------------------------------------------------------------
// GET — return top 20 predictors by points
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    // Load global visitor list
    const rawVisitors = await getCached("pred-visitors");
    const visitors: string[] = rawVisitors
      ? typeof rawVisitors === "string"
        ? JSON.parse(rawVisitors)
        : rawVisitors
      : [];

    // Load stats for each visitor
    const entries: LeaderboardEntry[] = [];
    for (const visitorId of visitors) {
      const raw = await getCached(`pred-stats:${visitorId}`);
      if (!raw) continue;
      const stats = typeof raw === "string" ? JSON.parse(raw) : raw;
      entries.push({
        visitorId,
        nickname: stats.nickname || `Người chơi ${visitorId.slice(0, 6)}`,
        total: stats.total || 0,
        correct: stats.correct || 0,
        exactScore: stats.exactScore || 0,
        points: stats.points || 0,
      });
    }

    // Sort by points desc, then by correct desc, then by total asc (fewer predictions = more efficient)
    entries.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.correct !== a.correct) return b.correct - a.correct;
      return a.total - b.total;
    });

    return Response.json(
      { leaderboard: entries.slice(0, 20) },
      {
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (e) {
    console.error("Leaderboard GET error:", e);
    return Response.json(
      { error: "Không thể tải bảng xếp hạng" },
      { status: 500 },
    );
  }
}
