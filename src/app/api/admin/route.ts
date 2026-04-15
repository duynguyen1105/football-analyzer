import { NextRequest } from "next/server";
import { getCacheStats, getCached } from "@/lib/cache";
import { getApiCacheStats } from "@/lib/football-data";

export async function GET(request: NextRequest) {
  // Auth check
  const auth = request.headers.get("Authorization");
  const password = process.env.ADMIN_PASSWORD;
  if (!password || auth !== `Bearer ${password}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Cache stats
    const cacheStats = getCacheStats();
    const apiCacheStats = getApiCacheStats();

    // 2. Blog index — Upstash may auto-parse JSON, so handle both shapes
    let blogSlugs: string[] = [];
    const rawBlogIndex = await getCached("blog:index");
    if (rawBlogIndex) {
      if (typeof rawBlogIndex === "string") {
        try {
          const parsed = JSON.parse(rawBlogIndex);
          blogSlugs = Array.isArray(parsed) ? parsed : [];
        } catch {
          /* corrupted index */
        }
      } else if (Array.isArray(rawBlogIndex)) {
        blogSlugs = rawBlogIndex as string[];
      }
    }

    // 3. Prediction game stats
    const predictionStats = {
      totalPredictions: 0,
      uniqueVisitors: 0,
      leaderboard: [] as Array<{
        nickname: string;
        total: number;
        points: number;
        correct: number;
        exactScore: number;
      }>,
    };

    const rawVisitors = await getCached("pred-visitors");
    if (rawVisitors) {
      const visitors: string[] =
        typeof rawVisitors === "string" ? JSON.parse(rawVisitors) : rawVisitors;
      predictionStats.uniqueVisitors = visitors.length;

      const entries: Array<{
        visitorId: string;
        nickname: string;
        total: number;
        points: number;
        correct: number;
        exactScore: number;
      }> = [];

      for (const visitorId of visitors) {
        const raw = await getCached(`pred-stats:${visitorId}`);
        if (!raw) continue;
        const stats = typeof raw === "string" ? JSON.parse(raw) : raw;
        predictionStats.totalPredictions += stats.total || 0;
        entries.push({
          visitorId,
          nickname:
            stats.nickname || `Nguoi choi ${visitorId.slice(0, 6)}`,
          total: stats.total || 0,
          points: stats.points || 0,
          correct: stats.correct || 0,
          exactScore: stats.exactScore || 0,
        });
      }

      entries.sort((a, b) => b.points - a.points);
      predictionStats.leaderboard = entries.slice(0, 5);
    }

    // 4. Last auto-blog cron run
    let lastCronRun: string | null = null;
    const rawCron = await getCached("auto-blog:last-run");
    if (rawCron) {
      lastCronRun = rawCron;
    }

    // 5. Sitemap URL count — return the URL so the client can fetch it
    //    (server-side fetch to own origin is problematic in serverless)

    return Response.json({
      cacheStats,
      apiCacheStats,
      blogSlugs,
      predictionStats,
      lastCronRun,
    });
  } catch (e) {
    console.error("Admin API error:", e);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
