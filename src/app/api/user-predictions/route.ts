import { redis } from "@/lib/cache";
import { getCached, setCached } from "@/lib/cache";
import {
  userPredictionSchema,
  userPredictionGetSchema,
  parseBody,
  parseSearchParams,
} from "@/lib/api-validation";
import type { UserPrediction } from "@/lib/prediction-game";

const TTL_30_DAYS = 30 * 24 * 60 * 60;

// ---------------------------------------------------------------------------
// POST — submit a prediction
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = parseBody(userPredictionSchema, body);
    if (result.error) return result.error;

    const {
      matchId,
      visitorId,
      homeScore,
      awayScore,
      homeTeam,
      awayTeam,
      league,
      date,
      nickname,
    } = result.data;

    const predKey = `pred:${visitorId}:${matchId}`;

    // Check for existing prediction
    const existing = await getCached(predKey);
    if (existing) {
      return Response.json(
        { error: "Bạn đã dự đoán trận này rồi" },
        { status: 409 },
      );
    }

    const prediction: UserPrediction = {
      matchId,
      visitorId,
      homeScore,
      awayScore,
      homeTeam,
      awayTeam,
      league,
      date,
      nickname: nickname || undefined,
      createdAt: Date.now(),
    };

    // Store prediction
    await setCached(predKey, JSON.stringify(prediction), TTL_30_DAYS);

    // Update per-visitor match index (for fast GET lookup)
    const indexKey = `pred-index:${visitorId}`;
    const rawIndex = await getCached(indexKey);
    const matchIds: number[] = rawIndex
      ? typeof rawIndex === "string"
        ? JSON.parse(rawIndex)
        : rawIndex
      : [];
    if (!matchIds.includes(matchId)) {
      matchIds.push(matchId);
      await setCached(indexKey, JSON.stringify(matchIds), TTL_30_DAYS);
    }

    // Update per-match visitor index (for community summary on match page)
    const matchIndexKey = `pred-match:${matchId}`;
    const rawMatchIndex = await getCached(matchIndexKey);
    const matchVisitors: string[] = rawMatchIndex
      ? typeof rawMatchIndex === "string"
        ? JSON.parse(rawMatchIndex)
        : rawMatchIndex
      : [];
    if (!matchVisitors.includes(visitorId)) {
      matchVisitors.push(visitorId);
      await setCached(matchIndexKey, JSON.stringify(matchVisitors), TTL_30_DAYS);
    }

    // Update visitor stats
    const statsKey = `pred-stats:${visitorId}`;
    const rawStats = await getCached(statsKey);
    const stats = rawStats
      ? typeof rawStats === "string"
        ? JSON.parse(rawStats)
        : rawStats
      : { visitorId, nickname: nickname || "", total: 0, correct: 0, exactScore: 0, points: 0 };

    stats.total += 1;
    if (nickname) stats.nickname = nickname;
    await setCached(statsKey, JSON.stringify(stats), TTL_30_DAYS);

    // Track visitor in the global visitor set (for leaderboard scan)
    const visitorsKey = "pred-visitors";
    const rawVisitors = await getCached(visitorsKey);
    const visitors: string[] = rawVisitors
      ? typeof rawVisitors === "string"
        ? JSON.parse(rawVisitors)
        : rawVisitors
      : [];
    if (!visitors.includes(visitorId)) {
      visitors.push(visitorId);
      await setCached(visitorsKey, JSON.stringify(visitors), TTL_30_DAYS);
    }

    return Response.json(prediction, { status: 201 });
  } catch (e) {
    console.error("User prediction POST error:", e);
    return Response.json(
      { error: "Không thể lưu dự đoán" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// GET — get predictions for a visitor
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const result = parseSearchParams(
      userPredictionGetSchema,
      url.searchParams,
    );
    if (result.error) return result.error;

    const { visitorId } = result.data;

    // We can't scan in-memory cache the same way as Redis, so we maintain a
    // per-visitor match-id list alongside each prediction.
    const indexKey = `pred-index:${visitorId}`;
    const rawIndex = await getCached(indexKey);
    let matchIds: number[] = rawIndex
      ? typeof rawIndex === "string"
        ? JSON.parse(rawIndex)
        : rawIndex
      : [];

    // If no index exists, try to scan Redis for existing keys
    if (matchIds.length === 0 && redis) {
      try {
        let cursor = 0;
        const found: number[] = [];
        do {
          const [next, keys] = await redis.scan(cursor, {
            match: `pred:${visitorId}:*`,
            count: 100,
          });
          cursor = typeof next === "string" ? parseInt(next, 10) : next;
          for (const k of keys) {
            const parts = (k as string).split(":");
            const mId = parseInt(parts[2], 10);
            if (!isNaN(mId)) found.push(mId);
          }
        } while (cursor !== 0);
        matchIds = found;
        if (matchIds.length > 0) {
          await setCached(indexKey, JSON.stringify(matchIds), TTL_30_DAYS);
        }
      } catch {
        // Scan failed — return empty
      }
    }

    // Fetch each prediction
    const predictions: UserPrediction[] = [];
    for (const mId of matchIds) {
      const raw = await getCached(`pred:${visitorId}:${mId}`);
      if (raw) {
        const p = typeof raw === "string" ? JSON.parse(raw) : raw;
        predictions.push(p);
      }
    }

    // Sort newest first
    predictions.sort((a, b) => b.createdAt - a.createdAt);

    return Response.json({ predictions });
  } catch (e) {
    console.error("User prediction GET error:", e);
    return Response.json(
      { error: "Không thể tải dự đoán" },
      { status: 500 },
    );
  }
}
