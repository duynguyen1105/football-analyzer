"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
interface MatchPredictionEntry {
  nickname: string | null;
  visitorIdShort: string;
  homeScore: number;
  awayScore: number;
  createdAt: number;
}

interface MatchPredictionsResponse {
  total: number;
  summary: { home: number; draw: number; away: number };
  predictions: MatchPredictionEntry[];
}

interface Props {
  matchId: number;
  homeTeam: { shortName: string; tla: string };
  awayTeam: { shortName: string; tla: string };
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  return `${d} ngày trước`;
}

export function PredictionSummary({ matchId, homeTeam, awayTeam }: Props) {
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading } = useQuery<MatchPredictionsResponse>({
    queryKey: ["match-predictions", matchId],
    queryFn: async () => {
      const res = await fetch(`/api/user-predictions/match?matchId=${matchId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 30 * 1000,
  });

  if (isLoading) {
    return (
      <div className="bg-bg-card rounded-2xl border border-border p-4 md:p-5 mb-6">
        <div className="h-4 w-40 bg-border/40 rounded animate-pulse mb-3" />
        <div className="h-3 w-full bg-border/20 rounded animate-pulse" />
      </div>
    );
  }

  if (!data || data.total === 0) return null;

  const { total, summary, predictions } = data;
  const homePct = total > 0 ? Math.round((summary.home / total) * 100) : 0;
  const drawPct = total > 0 ? Math.round((summary.draw / total) * 100) : 0;
  const awayPct = Math.max(0, 100 - homePct - drawPct);

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-4 md:p-5 mb-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-2" />
          Cộng đồng dự đoán
        </h3>
        <span className="text-[11px] text-text-muted">
          {total} {total === 1 ? "dự đoán" : "lượt dự đoán"}
        </span>
      </div>

      {/* Stacked bar */}
      <div
        className="flex h-7 rounded-lg overflow-hidden bg-bg-primary border border-border/60"
        role="img"
        aria-label={`${summary.home} dự đoán ${homeTeam.shortName} thắng, ${summary.draw} dự đoán hòa, ${summary.away} dự đoán ${awayTeam.shortName} thắng`}
      >
        {summary.home > 0 && (
          <div
            className="bg-accent/80 flex items-center justify-center text-[10px] font-semibold text-white min-w-0"
            style={{ width: `${homePct}%` }}
          >
            {homePct >= 18 ? `${homePct}%` : ""}
          </div>
        )}
        {summary.draw > 0 && (
          <div
            className="bg-accent-yellow/70 flex items-center justify-center text-[10px] font-semibold text-white min-w-0"
            style={{ width: `${drawPct}%` }}
          >
            {drawPct >= 18 ? `${drawPct}%` : ""}
          </div>
        )}
        {summary.away > 0 && (
          <div
            className="bg-accent-2/80 flex items-center justify-center text-[10px] font-semibold text-white min-w-0"
            style={{ width: `${awayPct}%` }}
          >
            {awayPct >= 18 ? `${awayPct}%` : ""}
          </div>
        )}
      </div>

      {/* Legend — stacks vertically on narrow mobile, 3 cols from sm+ */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-1.5 text-xs text-text-muted">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-sm bg-accent/80 shrink-0" />
          <span className="truncate">
            {homeTeam.shortName} thắng
          </span>
          <span className="ml-auto font-semibold text-text-secondary tabular-nums">
            {summary.home}
            <span className="text-text-muted font-normal"> · {homePct}%</span>
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-sm bg-accent-yellow/70 shrink-0" />
          <span className="truncate">Hòa</span>
          <span className="ml-auto font-semibold text-text-secondary tabular-nums">
            {summary.draw}
            <span className="text-text-muted font-normal"> · {drawPct}%</span>
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-sm bg-accent-2/80 shrink-0" />
          <span className="truncate">
            {awayTeam.shortName} thắng
          </span>
          <span className="ml-auto font-semibold text-text-secondary tabular-nums">
            {summary.away}
            <span className="text-text-muted font-normal"> · {awayPct}%</span>
          </span>
        </div>
      </div>

      {/* Toggle detail */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full mt-3 pt-3 border-t border-border text-[11px] text-text-muted hover:text-accent transition-colors flex items-center justify-center gap-1"
        aria-expanded={expanded}
      >
        {expanded ? "Ẩn chi tiết" : "Xem ai dự đoán gì"}
        <span className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
          &#9662;
        </span>
      </button>

      {expanded && (
        <ul className="mt-3 divide-y divide-border/50 max-h-72 overflow-y-auto -mx-1">
          {predictions.map((p, i) => {
            const name = p.nickname || `Khách #${p.visitorIdShort}`;
            const outcome =
              p.homeScore > p.awayScore
                ? "home"
                : p.homeScore < p.awayScore
                ? "away"
                : "draw";
            const tint =
              outcome === "home"
                ? "text-accent"
                : outcome === "away"
                ? "text-accent-2"
                : "text-accent-yellow";
            return (
              <li
                key={`${p.visitorIdShort}-${i}`}
                className="flex items-center gap-2 py-2 px-1"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-secondary truncate">
                    {name}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {formatRelative(p.createdAt)}
                  </p>
                </div>
                <span className={`font-bold text-sm tabular-nums shrink-0 ${tint}`}>
                  {p.homeScore} - {p.awayScore}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
