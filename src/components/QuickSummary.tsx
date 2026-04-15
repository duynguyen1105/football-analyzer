"use client";

import { useQuickSummary } from "@/lib/hooks";

interface QuickSummaryProps {
  matchId: string;
}

export function QuickSummary({ matchId }: QuickSummaryProps) {
  const { data, isLoading, isError } = useQuickSummary(matchId);

  if (isError) return null;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-accent text-lg">⚡</span>
          <h3 className="text-sm font-semibold text-text-primary">
            Nhận định nhanh
          </h3>
        </div>
        <div className="space-y-2.5">
          <div className="h-4 w-full rounded bg-border/50 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-border/50 animate-pulse" />
          <div className="h-4 w-4/6 rounded bg-border/50 animate-pulse" />
        </div>
      </div>
    );
  }

  const summary: string = data?.summary ?? "";
  const bullets = summary
    .split("\n")
    .map((line: string) => line.replace(/^[•\-]\s*/, "").trim())
    .filter(Boolean);

  if (bullets.length === 0) return null;

  return (
    <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-accent text-lg">⚡</span>
        <h3 className="text-sm font-semibold text-text-primary">
          Nhận định nhanh
        </h3>
      </div>
      <ul className="space-y-1.5">
        {bullets.map((bullet, i) => (
          <li
            key={i}
            className="flex gap-2 text-sm text-text-secondary leading-relaxed"
          >
            <span className="text-accent mt-0.5 flex-shrink-0">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
