import { Redis } from "@upstash/redis";

// Use Upstash Redis if configured, otherwise fall back to in-memory
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// In-memory fallback
const memCache = new Map<string, { data: string; expiresAt: number }>();

/**
 * Get a cached value. Tries Redis first, falls back to in-memory.
 */
export async function getCached(key: string): Promise<string | null> {
  // Try Redis
  if (redis) {
    try {
      const val = await redis.get<string>(key);
      if (val) return val;
    } catch (e) {
      console.error("Redis get error:", e);
    }
  }

  // Fallback to memory
  const entry = memCache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data;
  if (entry) memCache.delete(key);
  return null;
}

/**
 * Set a cached value. Writes to both Redis and in-memory.
 * @param ttlSeconds TTL in seconds
 */
export async function setCached(key: string, value: string, ttlSeconds: number): Promise<void> {
  // Write to memory always
  memCache.set(key, { data: value, expiresAt: Date.now() + ttlSeconds * 1000 });

  // Write to Redis if available
  if (redis) {
    try {
      await redis.set(key, value, { ex: ttlSeconds });
    } catch (e) {
      console.error("Redis set error:", e);
    }
  }
}
