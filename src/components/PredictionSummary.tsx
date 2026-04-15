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
        className="flex h-8 rounded-lg overflow-hidden bg-bg-primary border border-border/60"
        role="img"
        aria-label={`${summary.home} dự đoán ${homeTeam.shortName} thắng, ${summary.draw} dự đoán hòa, ${summary.away} dự đoán ${awayTeam.shortName} thắng`}
      >
        {summary.home > 0 && (
          <div
            className="bg-accent/80 flex items-center justify-center text-[10px] font-semibold text-white"
            style={{ width: `${homePct}%` }}
          >
            {homePct >= 10 ? `${homePct}%` : ""}
          </div>
        )}
        {summary.draw > 0 && (
          <div
            className="bg-accent-yellow/70 flex items-center justify-center text-[10px] font-semibold text-white"
            style={{ width: `${drawPct}%` }}
          >
            {drawPct >= 10 ? `${drawPct}%` : ""}
          </div>
        )}
        {summary.away > 0 && (
          <div
            className="bg-accent-2/80 flex items-center justify-center text-[10px] font-semibold text-white"
            style={{ width: `${awayPct}%` }}
          >
            {awayPct >= 10 ? `${awayPct}%` : ""}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] text-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-accent/80" />
          <span className="truncate">{homeTeam.tla} thắng</span>
          <span className="ml-auto font-semibold text-text-secondary">
            {summary.home}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-accent-yellow/70" />
          <span>Hòa</span>
          <span className="ml-auto font-semibold text-text-secondary">
            {summary.draw}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-accent-2/80" />
          <span className="truncate">{awayTeam.tla} thắng</span>
          <span className="ml-auto font-semibold text-text-secondary">
            {summary.away}
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
        <ul className="mt-3 space-y-2 max-h-72 overflow-y-auto">
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
                className="flex items-center gap-3 text-xs py-1"
              >
                <span className="flex-1 truncate font-medium text-text-secondary">
                  {name}
                </span>
                <span className={`font-bold tabular-nums ${tint}`}>
                  {p.homeScore} - {p.awayScore}
                </span>
                <span className="text-[10px] text-text-muted w-20 text-right">
                  {formatRelative(p.createdAt)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
