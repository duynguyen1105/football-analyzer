"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

export function AdSlot({
  size = "banner",
  slot,
  className = "",
}: {
  size?: "banner" | "rectangle" | "leaderboard";
  slot?: string;
  className?: string;
}) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  const minHeight: Record<string, string> = {
    banner: "90px",
    rectangle: "250px",
    leaderboard: "90px",
  };

  useEffect(() => {
    if (!ADSENSE_ID || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet
    }
  }, []);

  if (!ADSENSE_ID) {
    return (
      <div
        className={`w-full rounded-xl border border-dashed border-border/50 bg-bg-secondary/50 flex items-center justify-center ${className}`}
        style={{ minHeight: minHeight[size] }}
      >
        <span className="text-xs text-text-muted/40">
          AD SPACE — {size.toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} style={{ minHeight: minHeight[size] }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_ID}
        data-ad-slot={slot || ""}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
