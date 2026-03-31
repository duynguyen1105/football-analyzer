"use client";

import { useEffect, useState } from "react";

interface MatchCountdownProps {
  matchDate: string; // YYYY-MM-DD in GMT+7
  matchTime: string; // HH:MM in GMT+7
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(matchDate: string, matchTime: string): TimeLeft | null {
  // Build the kickoff timestamp in GMT+7
  // matchDate is YYYY-MM-DD, matchTime is HH:MM, both in GMT+7
  const [year, month, day] = matchDate.split("-").map(Number);
  const [hour, minute] = matchTime.split(":").map(Number);

  // Create a Date in UTC that corresponds to the GMT+7 kickoff time
  const kickoffUtcMs = Date.UTC(year, month - 1, day, hour - 7, minute);
  const now = Date.now();
  const diffMs = kickoffUtcMs - now;

  if (diffMs <= 0) return null;

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-bg-primary border border-border rounded-lg w-16 h-16 flex items-center justify-center">
        <span className="text-2xl font-bold text-text-primary">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs text-text-muted mt-1.5">{label}</span>
    </div>
  );
}

export function MatchCountdown({ matchDate, matchTime }: MatchCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    getTimeLeft(matchDate, matchTime)
  );

  useEffect(() => {
    // If already past kickoff, don't start the interval
    const initial = getTimeLeft(matchDate, matchTime);
    if (!initial) {
      setTimeLeft(null);
      return;
    }
    setTimeLeft(initial);

    const interval = setInterval(() => {
      const remaining = getTimeLeft(matchDate, matchTime);
      setTimeLeft(remaining);
      if (!remaining) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [matchDate, matchTime]);

  if (!timeLeft) return null;

  return (
    <div className="flex justify-center gap-3">
      <CountdownUnit value={timeLeft.days} label="Ngày" />
      <div className="flex items-center text-text-muted text-xl font-bold pb-5">
        :
      </div>
      <CountdownUnit value={timeLeft.hours} label="Giờ" />
      <div className="flex items-center text-text-muted text-xl font-bold pb-5">
        :
      </div>
      <CountdownUnit value={timeLeft.minutes} label="Phút" />
      <div className="flex items-center text-text-muted text-xl font-bold pb-5">
        :
      </div>
      <CountdownUnit value={timeLeft.seconds} label="Giây" />
    </div>
  );
}
