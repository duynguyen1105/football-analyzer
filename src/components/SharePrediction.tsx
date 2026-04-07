"use client";

import { useState } from "react";

interface SharePredictionProps {
  matchId: number;
  homeTeam: { shortName: string; crest: string };
  awayTeam: { shortName: string; crest: string };
  league: string;
  date: string;
}

export function SharePrediction({ matchId, homeTeam, awayTeam, league, date }: SharePredictionProps) {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [shared, setShared] = useState(false);

  const nickname = typeof window !== "undefined"
    ? localStorage.getItem("matchday-nickname") || "Fan"
    : "Fan";

  const shareUrl = () => {
    const params = new URLSearchParams({
      home: homeTeam.shortName,
      away: awayTeam.shortName,
      homeCrest: homeTeam.crest,
      awayCrest: awayTeam.crest,
      homeScore: String(homeScore),
      awayScore: String(awayScore),
      league,
      date,
      nickname,
    });
    return `/api/share-card?${params.toString()}`;
  };

  const handleShare = async () => {
    const matchUrl = `${window.location.origin}/match/${matchId}`;
    const text = `Tôi dự đoán ${homeTeam.shortName} ${homeScore}-${awayScore} ${awayTeam.shortName}! Bạn nghĩ sao?`;

    if (navigator.share) {
      try {
        await navigator.share({ title: text, url: matchUrl });
        setShared(true);
      } catch { /* cancelled */ }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${text}\n${matchUrl}`);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${typeof window !== "undefined" ? window.location.origin : ""}/match/${matchId}`)}`;

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />
        Chia sẻ dự đoán
      </h3>

      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="text-center">
          <img src={homeTeam.crest} alt="" className="w-10 h-10 object-contain mx-auto mb-1" />
          <p className="text-xs font-medium">{homeTeam.shortName}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
            className="w-7 h-7 rounded-lg bg-border/30 text-xs font-bold hover:bg-border/50 transition-colors"
          >-</button>
          <span className="text-2xl font-bold w-8 text-center">{homeScore}</span>
          <button
            onClick={() => setHomeScore(Math.min(9, homeScore + 1))}
            className="w-7 h-7 rounded-lg bg-border/30 text-xs font-bold hover:bg-border/50 transition-colors"
          >+</button>
        </div>

        <span className="text-text-muted text-lg">-</span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
            className="w-7 h-7 rounded-lg bg-border/30 text-xs font-bold hover:bg-border/50 transition-colors"
          >-</button>
          <span className="text-2xl font-bold w-8 text-center">{awayScore}</span>
          <button
            onClick={() => setAwayScore(Math.min(9, awayScore + 1))}
            className="w-7 h-7 rounded-lg bg-border/30 text-xs font-bold hover:bg-border/50 transition-colors"
          >+</button>
        </div>

        <div className="text-center">
          <img src={awayTeam.crest} alt="" className="w-10 h-10 object-contain mx-auto mb-1" />
          <p className="text-xs font-medium">{awayTeam.shortName}</p>
        </div>
      </div>

      {/* Preview card link */}
      <div className="mb-3">
        <a
          href={shareUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-[10px] text-accent hover:underline"
        >
          Xem ảnh dự đoán &rarr;
        </a>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="flex-1 py-2 px-3 bg-accent/15 text-accent rounded-lg text-xs font-medium hover:bg-accent/25 transition-colors"
        >
          {shared ? "Đã sao chép!" : "Chia sẻ dự đoán"}
        </button>
        <a
          href={fbShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2 px-3 bg-blue-600/15 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-600/25 transition-colors"
        >
          Facebook
        </a>
      </div>
    </div>
  );
}
