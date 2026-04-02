"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LEAGUE_TABS = [
  { label: "Tổng quan", segment: "" },
  { label: "Lịch thi đấu", segment: "lich-thi-dau" },
  { label: "Vua phá lưới", segment: "top-ghi-ban" },
  { label: "Kiến tạo", segment: "top-kien-tao" },
  { label: "Soi kèo", segment: "soi-keo" },
];

const TOURNAMENT_TABS = [
  { label: "Tổng quan", segment: "" },
  { label: "Bảng đấu", segment: "bang-dau" },
  { label: "Lịch thi đấu", segment: "lich-thi-dau" },
  { label: "Vua phá lưới", segment: "top-ghi-ban" },
  { label: "Kiến tạo", segment: "top-kien-tao" },
];

export function LeagueTabNav({ slug, isTournament }: { slug: string; isTournament?: boolean }) {
  const pathname = usePathname();
  const base = `/giai-dau/${slug}`;
  const tabs = isTournament ? TOURNAMENT_TABS : LEAGUE_TABS;

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none mb-6">
      {tabs.map((tab) => {
        const href = tab.segment ? `${base}/${tab.segment}` : base;
        const isActive = tab.segment
          ? pathname === href
          : pathname === base;

        return (
          <Link
            key={tab.segment || "overview"}
            href={href}
            className={`whitespace-nowrap text-xs px-3.5 py-2 rounded-full border transition-colors ${
              isActive
                ? "bg-accent/20 border-accent text-accent font-medium"
                : "border-border text-text-secondary hover:border-accent/30"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
