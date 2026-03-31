"use client";

import { useState, useCallback } from "react";

interface ShareButtonProps {
  homeTeam: string;
  awayTeam: string;
  matchId: string | number;
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.474l6.733-3.367A2.52 2.52 0 0 1 13 4.5Z" />
    </svg>
  );
}

export function ShareButton({ homeTeam, awayTeam, matchId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/match/${matchId}`;
    const title = `${homeTeam} vs ${awayTeam} — Nhận định bóng đá`;

    // Use native share API on mobile if available
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Last resort: prompt-based copy
      window.prompt("Sao chép link:", url);
    }
  }, [homeTeam, awayTeam, matchId]);

  return (
    <div className="relative inline-flex">
      <button
        onClick={handleShare}
        className="px-4 py-2 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
      >
        <ShareIcon />
        Chia sẻ
      </button>
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-bg-card border border-border text-xs text-accent whitespace-nowrap shadow-lg">
          Đã sao chép!
        </span>
      )}
    </div>
  );
}
