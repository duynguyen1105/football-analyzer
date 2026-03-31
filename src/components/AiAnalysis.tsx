"use client";

import { useEffect, useState } from "react";

/** Render basic markdown bold (**text**) as <strong> tags */
function renderBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold text-text-primary">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function AiAnalysis({ matchId }: { matchId: string }) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<"en" | "vi">("vi");

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`/api/analysis?matchId=${matchId}&lang=${lang}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setAnalysis(data.analysis);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [matchId, lang]);

  return (
    <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <div className="flex items-center justify-between gap-3 mb-3 md:mb-4 flex-wrap">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Nhận định bằng AI
        </h3>
        <div className="flex gap-1 bg-bg-primary rounded-lg p-0.5 border border-border">
          <button
            onClick={() => setLang("en")}
            className={`px-2.5 py-1 md:px-2 md:py-0.5 rounded-md text-xs font-medium transition-colors ${
              lang === "en"
                ? "bg-purple-500 text-white"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("vi")}
            className={`px-2.5 py-1 md:px-2 md:py-0.5 rounded-md text-xs font-medium transition-colors ${
              lang === "vi"
                ? "bg-purple-500 text-white"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            VI
          </button>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-border/50 rounded-full animate-pulse" style={{ width: `${90 - i * 10}%` }} />
              <div className="h-3 bg-border/50 rounded-full animate-pulse" style={{ width: `${95 - i * 5}%` }} />
              <div className="h-3 bg-border/50 rounded-full animate-pulse" style={{ width: `${70 - i * 8}%` }} />
            </div>
          ))}
          <p className="text-xs text-text-muted text-center mt-4">
            Đang phân tích bằng AI...
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">Failed to generate: {error}</p>
      )}

      {!loading && !error && (
        <div className="text-sm text-text-secondary leading-relaxed space-y-3">
          {analysis.split("\n\n").map((paragraph, i) => (
            <p key={i}>{renderBold(paragraph)}</p>
          ))}
        </div>
      )}
    </section>
  );
}
