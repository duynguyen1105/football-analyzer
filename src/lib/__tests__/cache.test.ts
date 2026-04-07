import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Ensure no Redis env vars are set, so cache.ts uses in-memory fallback
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

// Dynamic import so the module sees cleared env vars
let getCached: (key: string) => Promise<string | null>;
let setCached: (key: string, value: string, ttlSeconds: number) => Promise<void>;

beforeEach(async () => {
  // Re-import fresh module for each test to reset the in-memory Map
  vi.resetModules();
  const mod = await import("../cache");
  getCached = mod.getCached;
  setCached = mod.setCached;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("in-memory cache (no Redis)", () => {
  it("returns null for a key that has not been set", async () => {
    const result = await getCached("nonexistent-key");
    expect(result).toBeNull();
  });

  it("stores and retrieves a value", async () => {
    await setCached("test-key", "test-value", 60);
    const result = await getCached("test-key");
    expect(result).toBe("test-value");
  });

  it("stores JSON strings correctly", async () => {
    const data = JSON.stringify({ foo: "bar", count: 42 });
    await setCached("json-key", data, 60);
    const result = await getCached("json-key");
    expect(result).toBe(data);
    expect(JSON.parse(result!)).toEqual({ foo: "bar", count: 42 });
  });

  it("returns null after TTL expires", async () => {
    vi.useFakeTimers();

    await setCached("expiring-key", "value", 5); // 5 second TTL

    // Still valid immediately
    let result = await getCached("expiring-key");
    expect(result).toBe("value");

    // Advance time past TTL
    vi.advanceTimersByTime(6000); // 6 seconds

    result = await getCached("expiring-key");
    expect(result).toBeNull();
  });

  it("returns value just before TTL expires", async () => {
    vi.useFakeTimers();

    await setCached("edge-key", "edge-value", 10); // 10 second TTL

    // Advance to just before expiry
    vi.advanceTimersByTime(9999);

    const result = await getCached("edge-key");
    expect(result).toBe("edge-value");
  });

  it("overwrites existing key with new value", async () => {
    await setCached("overwrite-key", "old-value", 60);
    await setCached("overwrite-key", "new-value", 60);

    const result = await getCached("overwrite-key");
    expect(result).toBe("new-value");
  });

  it("handles multiple keys independently", async () => {
    await setCached("key-a", "value-a", 60);
    await setCached("key-b", "value-b", 60);

    expect(await getCached("key-a")).toBe("value-a");
    expect(await getCached("key-b")).toBe("value-b");
  });

  it("cleans up expired entries on read", async () => {
    vi.useFakeTimers();

    await setCached("short-lived", "gone-soon", 2);
    await setCached("long-lived", "still-here", 60);

    vi.advanceTimersByTime(3000); // 3 seconds - past short-lived TTL

    expect(await getCached("short-lived")).toBeNull();
    expect(await getCached("long-lived")).toBe("still-here");
  });
});
