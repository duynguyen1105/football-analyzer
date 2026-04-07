"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

interface TeamLink {
  names: string[]; // All name variants to match
  id: number;
  href: string;
}

/** Render markdown bold + auto-link team names */
function renderContent(text: string, teamLinks: TeamLink[]) {
  // First split by bold markers
  const boldParts = text.split(/\*\*(.+?)\*\*/g);

  return boldParts.map((part, i) => {
    const isBold = i % 2 === 1;
    const linked = linkTeamNames(part, teamLinks, isBold);
    return <span key={i}>{linked}</span>;
  });
}

function linkTeamNames(text: string, teamLinks: TeamLink[], bold: boolean) {
  if (teamLinks.length === 0) {
    return bold ? <strong className="font-bold text-text-primary">{text}</strong> : text;
  }

  // Build regex matching all team name variants
  const allNames = teamLinks.flatMap((t) => t.names).filter((n) => n.length > 2);
  if (allNames.length === 0) {
    return bold ? <strong className="font-bold text-text-primary">{text}</strong> : text;
  }

  const escaped = allNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, j) => {
    const match = teamLinks.find((t) =>
      t.names.some((n) => n.toLowerCase() === part.toLowerCase())
    );
    if (match) {
      return (
        <Link key={j} href={match.href} className="text-accent hover:underline font-medium">
          {bold ? <strong>{part}</strong> : part}
        </Link>
      );
    }
    return bold ? <strong key={j} className="font-bold text-text-primary">{part}</strong> : part;
  });
}

export function AiAnalysis({
  matchId,
  homeTeam,
  awayTeam,
}: {
  matchId: string;
  homeTeam?: { id: number; name: string; shortName: string; tla: string };
  awayTeam?: { id: number; name: string; shortName: string; tla: string };
}) {
  const teamLinks = useMemo<TeamLink[]>(() => {
    const links: TeamLink[] = [];
    if (homeTeam) {
      links.push({
        names: [homeTeam.name, homeTeam.shortName, homeTeam.tla].filter(Boolean),
        id: homeTeam.id,
        href: `/doi-bong/${homeTeam.id}`,
      });
    }
    if (awayTeam) {
      links.push({
        names: [awayTeam.name, awayTeam.shortName, awayTeam.tla].filter(Boolean),
        id: awayTeam.id,
        href: `/doi-bong/${awayTeam.id}`,
      });
    }
    return links;
  }, [homeTeam, awayTeam]);
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
            <p key={i}>{renderContent(paragraph, teamLinks)}</p>
          ))}
        </div>
      )}
    </section>
  );
}
