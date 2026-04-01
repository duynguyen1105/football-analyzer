"use client";

interface MatchImportanceProps {
  score: number;
  reason: string;
}

export function MatchImportance({ score, reason }: MatchImportanceProps) {
  if (score <= 4) return null;

  const emoji = score >= 8 ? "🔥" : score >= 6 ? "⚡" : "📊";

  const barColor =
    score >= 8
      ? "bg-accent-red"
      : score >= 6
        ? "bg-accent-yellow"
        : "bg-accent-2";

  const textColor =
    score >= 8
      ? "text-accent-red"
      : score >= 6
        ? "text-accent-yellow"
        : "text-accent-2";

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-card border border-border text-sm">
      <span className={`font-bold ${textColor} whitespace-nowrap`}>
        {emoji} {score}/10
      </span>

      {/* Mini bar */}
      <div className="w-16 h-1.5 rounded-full bg-border flex-shrink-0">
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${score * 10}%` }}
        />
      </div>

      <span className="text-text-muted">—</span>
      <span className="text-text-secondary truncate">{reason}</span>
    </div>
  );
}
