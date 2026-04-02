"use client";

import { useState, useEffect } from "react";

interface Props {
  matchId: number;
  matchDate: string; // YYYY-MM-DD in GMT+7
  matchTime: string; // HH:MM in GMT+7
  homeTeam: string;
  awayTeam: string;
}

function getMatchTimestamp(date: string, time: string): number {
  // Parse GMT+7 date/time and convert to UTC timestamp
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const gmt7 = new Date(Date.UTC(year, month - 1, day, hour - 7, minute));
  return gmt7.getTime();
}

export function MatchReminder({ matchId, matchDate, matchTime, homeTeam, awayTeam }: Props) {
  const [isSet, setIsSet] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported("Notification" in window);
    const reminders = JSON.parse(localStorage.getItem("match-reminders") || "{}");
    setIsSet(!!reminders[matchId]);
  }, [matchId]);

  const matchTs = getMatchTimestamp(matchDate, matchTime);
  const now = Date.now();
  const isFuture = matchTs > now;

  if (!supported || !isFuture) return null;

  const toggle = async () => {
    if (isSet) {
      // Remove reminder
      const reminders = JSON.parse(localStorage.getItem("match-reminders") || "{}");
      delete reminders[matchId];
      localStorage.setItem("match-reminders", JSON.stringify(reminders));
      setIsSet(false);
      return;
    }

    // Request permission
    if (Notification.permission === "default") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;
    }
    if (Notification.permission !== "granted") return;

    // Set reminder 5 minutes before match
    const reminderTs = matchTs - 5 * 60 * 1000;
    const delay = reminderTs - Date.now();

    if (delay > 0) {
      // Store in localStorage
      const reminders = JSON.parse(localStorage.getItem("match-reminders") || "{}");
      reminders[matchId] = { matchDate, matchTime, homeTeam, awayTeam, reminderTs };
      localStorage.setItem("match-reminders", JSON.stringify(reminders));

      // Schedule notification (only works while tab is open)
      setTimeout(() => {
        new Notification(`${homeTeam} vs ${awayTeam}`, {
          body: `Trận đấu sắp bắt đầu lúc ${matchTime}!`,
          icon: "/icons/icon-192.png",
          tag: `match-${matchId}`,
        });
        // Clean up
        const r = JSON.parse(localStorage.getItem("match-reminders") || "{}");
        delete r[matchId];
        localStorage.setItem("match-reminders", JSON.stringify(r));
      }, delay);

      setIsSet(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        isSet
          ? "bg-accent/20 text-accent"
          : "bg-bg-card border border-border hover:border-accent/40 text-text-secondary"
      }`}
      title={isSet ? "Hủy nhắc nhở" : "Nhắc tôi 5 phút trước trận"}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {isSet ? "Đã đặt nhắc" : "Nhắc tôi"}
    </button>
  );
}
