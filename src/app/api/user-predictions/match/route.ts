import { NextRequest } from "next/server";
import { getCached, setCached, redis } from "@/lib/cache";
import {
  userPredictionMatchSchema,
  parseSearchParams,
} from "@/lib/api-validation";
import type { UserPrediction } from "@/lib/prediction-game";

export interface MatchPredictionEntry {
  nickname: string | null;
  visitorIdShort: string;
  homeScore: number;
  awayScore: number;
  createdAt: number;
}

export interface MatchPredictionsResponse {
  total: number;
  summary: { home: number; draw: number; away: number };
  predictions: MatchPredictionEntry[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const result = parseSearchParams(userPredictionMatchSchema, searchParams);
  if (result.error) return result.error;
  const matchId = parseInt(result.data.matchId, 10);

  try {
    const matchIndexKey = `pred-match:${matchId}`;
    const rawIndex = await getCached(matchIndexKey);
    let visitorIds: string[] = rawIndex
      ? typeof rawIndex === "string"
        ? JSON.parse(rawIndex)
        : rawIndex
      : [];

    // Backfill: if no index exists, scan Redis for existing predictions on
    // this match (legacy data submitted before the per-match index existed).
    if (visitorIds.length === 0 && redis) {
      try {
        let cursor = 0;
        const found: string[] = [];
        do {
          const [next, keys] = await redis.scan(cursor, {
            match: `pred:*:${matchId}`,
            count: 100,
          });
          cursor = typeof next === "string" ? parseInt(next, 10) : next;
          for (const k of keys) {
            const parts = (k as string).split(":");
            if (parts.length >= 3 && parts[1]) found.push(parts[1]);
          }
        } while (cursor !== 0);
        if (found.length > 0) {
          visitorIds = found;
          await setCached(
            matchIndexKey,
            JSON.stringify(found),
            30 * 24 * 60 * 60,
          );
        }
      } catch {
        // Scan failed — serve empty
      }
    }

    const predictions: MatchPredictionEntry[] = [];
    let home = 0;
    let draw = 0;
    let away = 0;

    for (const visitorId of visitorIds) {
      const raw = await getCached(`pred:${visitorId}:${matchId}`);
      if (!raw) continue;
      const p: UserPrediction =
        typeof raw === "string" ? JSON.parse(raw) : raw;

      if (p.homeScore > p.awayScore) home += 1;
      else if (p.homeScore < p.awayScore) away += 1;
      else draw += 1;

      predictions.push({
        nickname: p.nickname?.trim() || null,
        visitorIdShort: p.visitorId.slice(0, 6),
        homeScore: p.homeScore,
        awayScore: p.awayScore,
        createdAt: p.createdAt,
      });
    }

    predictions.sort((a, b) => b.createdAt - a.createdAt);

    const body: MatchPredictionsResponse = {
      total: predictions.length,
      summary: { home, draw, away },
      predictions,
    };

    return Response.json(body, {
      headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (e) {
    console.error("Match predictions GET error:", e);
    return Response.json(
      { error: "Không thể tải dự đoán" },
      { status: 500 },
    );
  }
}
