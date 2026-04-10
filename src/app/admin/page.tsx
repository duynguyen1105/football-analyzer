"use client";

import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CacheStatsData {
  redisHits: number;
  memHits: number;
  misses: number;
  total: number;
  hitRate: string;
}

interface PredictionStats {
  totalPredictions: number;
  uniqueVisitors: number;
  leaderboard: Array<{
    nickname: string;
    total: number;
    points: number;
    correct: number;
    exactScore: number;
  }>;
}

interface AdminData {
  cacheStats: CacheStatsData;
  apiCacheStats: CacheStatsData;
  blogSlugs: string[];
  predictionStats: PredictionStats;
  lastCronRun: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getSavedPassword(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("admin-password") || "";
}

// ---------------------------------------------------------------------------
// Card component
// ---------------------------------------------------------------------------
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-5">
      <h2 className="text-sm font-bold text-text-primary mb-4 uppercase tracking-wider">
        {title}
      </h2>
      {children}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard content (only rendered when authenticated)
// ---------------------------------------------------------------------------
function Dashboard({
  password,
  onLogout,
}: {
  password: string;
  onLogout: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [sitemapCount, setSitemapCount] = useState<number | null>(null);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.status === 401) {
        setError("Sai mat khau");
        sessionStorage.removeItem("admin-password");
        onLogout();
        return;
      }
      if (!res.ok) {
        setError("Loi server");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      setError("Khong the ket noi");
    } finally {
      setLoading(false);
    }
  }, [password, onLogout]);

  const fetchSitemap = useCallback(async () => {
    try {
      const res = await fetch("/sitemap.xml");
      if (res.ok) {
        const text = await res.text();
        const matches = text.match(/<url>/g);
        setSitemapCount(matches ? matches.length : 0);
      }
    } catch {
      // ignore
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchData();
    fetchSitemap();
  }, [fetchData, fetchSitemap]);

  // Initial fetch on first render of Dashboard
  if (!initialFetchDone) {
    setInitialFetchDone(true);
    // Use queueMicrotask to avoid calling fetch during render
    queueMicrotask(refreshAll);
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border bg-bg-secondary">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-text-primary">
              Admin Dashboard
            </h1>
            <p className="text-[10px] text-text-muted">
              nhandinhbongdavn.com
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshAll}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-bg-primary border border-border text-xs text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
            >
              {loading ? "Dang tai..." : "Lam moi"}
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg border border-border text-xs text-text-muted hover:text-accent-red transition-colors"
            >
              Dang xuat
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading && !data && (
          <div className="text-center py-20">
            <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-text-muted mt-3">Dang tai du lieu...</p>
          </div>
        )}

        {error && (
          <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-accent-red">{error}</p>
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section 1: Cache Stats */}
            <Card title="Cache Stats (Redis/Memory)">
              <div className="space-y-0.5">
                <StatRow label="Redis hits" value={data.cacheStats.redisHits} />
                <StatRow label="Memory hits" value={data.cacheStats.memHits} />
                <StatRow label="Misses" value={data.cacheStats.misses} />
                <StatRow label="Total requests" value={data.cacheStats.total} />
                <StatRow label="Hit rate" value={data.cacheStats.hitRate} />
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
                  API-Football Cache
                </p>
                <div className="space-y-0.5">
                  <StatRow
                    label="Memory hits"
                    value={data.apiCacheStats.memHits}
                  />
                  <StatRow
                    label="Redis hits"
                    value={data.apiCacheStats.redisHits}
                  />
                  <StatRow label="Misses" value={data.apiCacheStats.misses} />
                  <StatRow
                    label="Hit rate"
                    value={data.apiCacheStats.hitRate}
                  />
                </div>
              </div>
              {/* Visual bar */}
              {data.cacheStats.total > 0 && (
                <div className="mt-4">
                  <div className="flex h-3 rounded-full overflow-hidden bg-bg-primary">
                    <div
                      className="bg-accent transition-all"
                      style={{
                        width: `${(data.cacheStats.redisHits / data.cacheStats.total) * 100}%`,
                      }}
                      title="Redis hits"
                    />
                    <div
                      className="bg-accent-2 transition-all"
                      style={{
                        width: `${(data.cacheStats.memHits / data.cacheStats.total) * 100}%`,
                      }}
                      title="Memory hits"
                    />
                    <div
                      className="bg-accent-red/60 transition-all"
                      style={{
                        width: `${(data.cacheStats.misses / data.cacheStats.total) * 100}%`,
                      }}
                      title="Misses"
                    />
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-accent" />
                      Redis
                    </span>
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-accent-2" />
                      Memory
                    </span>
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-accent-red/60" />
                      Miss
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* Section 2: Auto-Blog History */}
            <Card title="Auto-Blog History">
              <StatRow
                label="Tong bai viet tu dong"
                value={data.blogSlugs.length}
              />
              {data.blogSlugs.length > 0 ? (
                <div className="mt-3 max-h-60 overflow-y-auto space-y-1.5">
                  {data.blogSlugs
                    .slice()
                    .reverse()
                    .map((slug) => {
                      const dateMatch = slug.match(/(\d{4}-\d{2}-\d{2})/);
                      return (
                        <div
                          key={slug}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-bg-primary/50 hover:bg-bg-primary transition-colors"
                        >
                          <a
                            href={`/nhan-dinh/${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent-2 hover:underline truncate max-w-[70%]"
                          >
                            {slug}
                          </a>
                          {dateMatch && (
                            <span className="text-[10px] text-text-muted shrink-0 ml-2">
                              {dateMatch[1]}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-xs text-text-muted mt-3">
                  Chua co bai viet tu dong nao.
                </p>
              )}
            </Card>

            {/* Section 3: Prediction Game Stats */}
            <Card title="Du doan bong da">
              <div className="space-y-0.5">
                <StatRow
                  label="Tong du doan"
                  value={data.predictionStats.totalPredictions}
                />
                <StatRow
                  label="Nguoi choi"
                  value={data.predictionStats.uniqueVisitors}
                />
              </div>
              {data.predictionStats.leaderboard.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
                    Top 5 bang xep hang
                  </p>
                  <div className="space-y-1">
                    {data.predictionStats.leaderboard.map((entry, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-bg-primary/50"
                      >
                        <span
                          className={`text-xs font-bold w-5 text-center ${
                            i === 0
                              ? "text-accent-yellow"
                              : i === 1
                                ? "text-text-secondary"
                                : i === 2
                                  ? "text-accent"
                                  : "text-text-muted"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="text-xs text-text-primary flex-1 truncate">
                          {entry.nickname}
                        </span>
                        <span className="text-xs font-bold text-accent">
                          {entry.points} diem
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {entry.total} du doan
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.predictionStats.leaderboard.length === 0 && (
                <p className="text-xs text-text-muted mt-3">
                  Chua co du lieu du doan.
                </p>
              )}
            </Card>

            {/* Section 4: Site Health */}
            <Card title="Site Health">
              <div className="space-y-0.5">
                <StatRow
                  label="Trang trong sitemap"
                  value={sitemapCount !== null ? sitemapCount : "Dang dem..."}
                />
                <StatRow
                  label="Lan chay cron cuoi"
                  value={data.lastCronRun ?? "Chua chay"}
                />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      sitemapCount && sitemapCount > 0
                        ? "bg-accent"
                        : "bg-accent-yellow"
                    }`}
                  />
                  <span className="text-xs text-text-secondary">
                    Sitemap{" "}
                    {sitemapCount && sitemapCount > 0
                      ? "hoat dong"
                      : "dang kiem tra"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      data.blogSlugs.length > 0 ? "bg-accent" : "bg-accent-red"
                    }`}
                  />
                  <span className="text-xs text-text-secondary">
                    Auto-blog{" "}
                    {data.blogSlugs.length > 0
                      ? `(${data.blogSlugs.length} bai)`
                      : "chua co du lieu"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      data.cacheStats.total > 0
                        ? "bg-accent"
                        : "bg-accent-yellow"
                    }`}
                  />
                  <span className="text-xs text-text-secondary">
                    Cache{" "}
                    {data.cacheStats.total > 0
                      ? `hoat dong (${data.cacheStats.hitRate})`
                      : "chua co request"}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page (login gate)
// ---------------------------------------------------------------------------
export default function AdminPage() {
  const savedPw = getSavedPassword();
  const [password, setPassword] = useState(savedPw);
  const [authenticated, setAuthenticated] = useState(!!savedPw);
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setLoginError("Vui long nhap mat khau");
      return;
    }
    sessionStorage.setItem("admin-password", password);
    setAuthenticated(true);
  };

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("admin-password");
    setAuthenticated(false);
    setPassword("");
  }, []);

  if (authenticated) {
    return <Dashboard password={password} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="bg-bg-card rounded-xl border border-border p-8 w-full max-w-sm"
      >
        <h1 className="text-lg font-bold text-text-primary mb-1">
          Admin Dashboard
        </h1>
        <p className="text-xs text-text-muted mb-6">
          Nhap mat khau de truy cap
        </p>
        {loginError && (
          <p className="text-xs text-accent-red mb-3">{loginError}</p>
        )}
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setLoginError("");
          }}
          placeholder="Mat khau"
          className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent mb-4"
          autoFocus
        />
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-colors"
        >
          Dang nhap
        </button>
      </form>
    </div>
  );
}
