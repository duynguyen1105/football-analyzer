"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function WebVitals() {
  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (!gaId) return;

    import("web-vitals").then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      function sendToGA(metric: { name: string; value: number; id: string }) {
        // Send to Google Analytics as events
        if (typeof window.gtag === "function") {
          window.gtag("event", metric.name, {
            event_category: "Web Vitals",
            event_label: metric.id,
            value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
            non_interaction: true,
          });
        }
      }

      onCLS(sendToGA);
      onINP(sendToGA);
      onLCP(sendToGA);
      onFCP(sendToGA);
      onTTFB(sendToGA);
    });
  }, []);

  return null;
}
