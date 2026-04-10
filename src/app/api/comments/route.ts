import { z } from "zod";
import { getCached, setCached } from "@/lib/cache";
import { parseBody, parseSearchParams } from "@/lib/api-validation";

const TTL_24_HR = 24 * 60 * 60;
const MAX_COMMENTS = 20;

interface StoredComment {
  visitorId: string;
  nickname: string;
  text: string;
  createdAt: number;
}

// --- Schemas ---

const commentGetSchema = z.object({
  matchId: z.string().regex(/^\d+$/, "Must be a numeric string"),
});

const commentPostSchema = z.object({
  matchId: z.number().int().positive(),
  visitorId: z.string().min(8).max(40),
  nickname: z.string().min(1).max(30),
  text: z.string().min(1).max(500),
});

function cacheKey(matchId: number | string) {
  return `comments:${matchId}`;
}

// ---------------------------------------------------------------------------
// GET — fetch comments for a match
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const result = parseSearchParams(commentGetSchema, url.searchParams);
    if (result.error) return result.error;

    const { matchId } = result.data;
    const raw = await getCached(cacheKey(matchId));
    const comments: StoredComment[] = raw
      ? typeof raw === "string"
        ? JSON.parse(raw)
        : raw
      : [];

    return Response.json(
      { comments },
      { headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" } },
    );
  } catch (e) {
    console.error("Comments GET error:", e);
    return Response.json({ error: "Không thể tải bình luận" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — add a comment
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = parseBody(commentPostSchema, body);
    if (result.error) return result.error;

    const { matchId, visitorId, nickname, text } = result.data;

    const key = cacheKey(matchId);
    const raw = await getCached(key);
    const comments: StoredComment[] = raw
      ? typeof raw === "string"
        ? JSON.parse(raw)
        : raw
      : [];

    // Rate limit: max 1 comment per visitor per 30 seconds
    const recentByUser = comments.find(
      (c) => c.visitorId === visitorId && Date.now() - c.createdAt < 30_000,
    );
    if (recentByUser) {
      return Response.json(
        { error: "Vui lòng chờ 30 giây trước khi bình luận tiếp" },
        { status: 429 },
      );
    }

    const newComment: StoredComment = {
      visitorId,
      nickname,
      text,
      createdAt: Date.now(),
    };

    // Add newest first, keep max 20
    comments.unshift(newComment);
    const trimmed = comments.slice(0, MAX_COMMENTS);

    await setCached(key, JSON.stringify(trimmed), TTL_24_HR);

    return Response.json(newComment, { status: 201 });
  } catch (e) {
    console.error("Comments POST error:", e);
    return Response.json({ error: "Không thể gửi bình luận" }, { status: 500 });
  }
}
