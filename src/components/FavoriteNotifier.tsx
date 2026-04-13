"use client";

import { useEffect, useRef } from "react";
import { useMatches } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { Match } from "@/lib/types";

const NOTIFIED_KEY = "matchday-notified";

function getNotified(): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || "[]"));
  } catch { return new Set(); }
}

function addNotified(matchId: number) {
  const set = getNotified();
  set.add(matchId);
  // Keep only last 100 entries
  const arr = [...set].slice(-100);
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(arr));
}

/**
 * Background component that checks for upcoming matches of favorite teams
 * and sends browser push notifications 30 minutes before kickoff.
 */
export function FavoriteNotifier() {
  const { data: matches } = useMatches();
  const favoriteTeams = useAppStore((s) => s.favoriteTeams);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!matches || favoriteTeams.length === 0 || checkedRef.current) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    checkedRef.current = true;
    const notified = getNotified();
    const nowMs = Date.now();

    for (const m of matches as Match[]) {
      if (m.status !== "SCHEDULED") continue;
      if (notified.has(m.id)) continue;

      const isFav = favoriteTeams.includes(m.homeTeam.id) || favoriteTeams.includes(m.awayTeam.id);
      if (!isFav) continue;

      const matchTime = new Date(`${m.date}T${m.time}:00+07:00`);
      const diffMin = (matchTime.getTime() - nowMs) / 60000;

      // Notify if match is within 30 minutes
      if (diffMin > 0 && diffMin <= 30) {
        new Notification(`⚽ ${m.homeTeam.shortName} vs ${m.awayTeam.shortName}`, {
          body: `Trận đấu sẽ bắt đầu sau ${Math.round(diffMin)} phút!`,
          icon: "/icons/icon-192.png",
          tag: `match-${m.id}`,
        });
        addNotified(m.id);
      }
    }
  }, [matches, favoriteTeams]);

  // Check for new blog posts
  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    const lastSeen = localStorage.getItem("matchday-blog-notif-ts") || "0";
    fetch("/api/blog-notification")
      .then((r) => r.json())
      .then((data) => {
        if (data?.timestamp && String(data.timestamp) !== lastSeen) {
          new Notification(data.title || "Bài viết mới", {
            body: data.body || "Nhận định mới đã sẵn sàng!",
            icon: "/icons/icon-192.png",
            tag: "blog-update",
          });
          localStorage.setItem("matchday-blog-notif-ts", String(data.timestamp));
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
