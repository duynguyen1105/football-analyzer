"use client";

import { useMemo } from "react";
import { getVietnamDate } from "@/lib/timezone";

function formatShortDate(dateStr: string): { day: string; weekday: string; isToday: boolean; isTomorrow: boolean } {
  const today = getVietnamDate();
  const tomorrow = getVietnamDate(1);
  const d = new Date(dateStr + "T00:00:00");
  const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return {
    day: String(d.getDate()),
    weekday: dateStr === today ? "Nay" : dateStr === tomorrow ? "Mai" : weekdays[d.getDay()],
    isToday: dateStr === today,
    isTomorrow: dateStr === tomorrow,
  };
}

interface DatePickerProps {
  selected: string | null; // null = "all week" (default)
  onSelect: (date: string | null) => void;
}

export function DatePicker({ selected, onSelect }: DatePickerProps) {
  // Generate 7 days starting from today
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = getVietnamDate(i);
      return { date, ...formatShortDate(date) };
    });
  }, []);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {/* "All" button */}
      <button
        onClick={() => onSelect(null)}
        className={`flex flex-col items-center px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all shrink-0 ${
          selected === null
            ? "bg-accent/15 text-accent border border-accent/30"
            : "text-text-muted border border-transparent hover:bg-bg-card-hover"
        }`}
      >
        <span className="text-sm font-bold">7</span>
        <span>ngày</span>
      </button>

      {days.map((d) => {
        const isActive = selected === d.date;
        return (
          <button
            key={d.date}
            onClick={() => onSelect(d.date)}
            className={`flex flex-col items-center min-w-[44px] px-2 py-1.5 rounded-xl text-[10px] font-medium transition-all shrink-0 ${
              isActive
                ? "bg-accent/15 text-accent border border-accent/30 scale-105"
                : d.isToday
                  ? "text-text-primary border border-border hover:bg-bg-card-hover"
                  : "text-text-muted border border-transparent hover:bg-bg-card-hover"
            }`}
          >
            <span className={`text-sm font-bold ${d.isToday && !isActive ? "text-accent" : ""}`}>{d.day}</span>
            <span>{d.weekday}</span>
          </button>
        );
      })}
    </div>
  );
}
