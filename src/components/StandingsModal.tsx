"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStandings } from "@/lib/hooks";
import { LEAGUES } from "@/lib/constants";
import { getSlugByCode } from "@/lib/league-slugs";
import { Standing } from "@/lib/types";

const TABLE_LEAGUES = LEAGUES.filter((l) => !l.isTournament);
const STORAGE_KEY = "bxh-modal-league";

export function StandingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeCode, setActiveCode] = useState<string>(() => {
    if (typeof window === "undefined") return TABLE_LEAGUES[0].code;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && TABLE_LEAGUES.some((l) => l.code === saved) ? saved : TABLE_LEAGUES[0].code;
  });

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  function selectLeague(code: string) {
    setActiveCode(code);
    localStorage.setItem(STORAGE_KEY, code);
  }

  const activeLeague = TABLE_LEAGUES.find((l) => l.code === activeCode) ?? TABLE_LEAGUES[0];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Bảng xếp hạng"
    >
      <div
        className="bg-bg-secondary border border-border rounded-none sm:rounded-xl w-full max-w-3xl max-h-[100vh] sm:max-h-[85vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h2 className="text-sm font-bold text-text-primary">Bảng xếp hạng</h2>
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Đóng"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* League tabs */}
        <div className="flex gap-1.5 overflow-x-auto px-3 py-2 border-b border-border shrink-0 scrollbar-thin">
          {TABLE_LEAGUES.map((l) => {
            const isActive = l.code === activeCode;
            return (
              <button
                key={l.code}
                onClick={() => selectLeague(l.code)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors ${
                  isActive
                    ? "bg-accent/15 border-accent text-accent"
                    : "border-border text-text-secondary hover:border-accent/30"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
                  <img src={l.logo} alt="" className="w-3 h-3 object-contain" />
                </span>
                {l.name}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          <StandingsTable leagueCode={activeCode} />
        </div>

        {/* Footer link */}
        <div className="px-4 py-2.5 border-t border-border shrink-0 text-center">
          <Link
            href={`/bang-xep-hang/${getSlugByCode(activeLeague.code) || activeLeague.code}`}
            onClick={onClose}
            className="text-xs text-accent hover:underline"
          >
            Xem trang BXH {activeLeague.name} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

function StandingsTable({ leagueCode }: { leagueCode: string }) {
  const { data: standings, isLoading } = useStandings(leagueCode);

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-7 bg-border/20 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted text-sm">
        Chưa có dữ liệu bảng xếp hạng.
      </div>
    );
  }

  const totalTeams = standings.length;

  return (
    <table className="w-full text-xs">
      <thead className="sticky top-0 bg-bg-secondary z-10">
        <tr className="text-text-muted border-b border-border">
          <th className="text-left py-2 px-2 w-8">#</th>
          <th className="text-left py-2 px-2">Đội</th>
          <th className="text-center py-2 px-1.5 w-8">Tr</th>
          <th className="text-center py-2 px-1.5 w-8 hidden sm:table-cell">T</th>
          <th className="text-center py-2 px-1.5 w-8 hidden sm:table-cell">H</th>
          <th className="text-center py-2 px-1.5 w-8 hidden sm:table-cell">B</th>
          <th className="text-center py-2 px-1.5 w-9">HS</th>
          <th className="text-center py-2 px-2 w-10 font-bold text-text-secondary">Đ</th>
        </tr>
      </thead>
      <tbody className="text-text-secondary">
        {standings.map((r: Standing) => {
          const isTop4 = r.position <= 4;
          const isBottom3 = r.position > totalTeams - 3;
          const borderClass = isTop4
            ? "border-l-2 border-l-green-500"
            : isBottom3
              ? "border-l-2 border-l-red-500"
              : "border-l-2 border-l-transparent";

          return (
            <tr key={r.team.id} className={`border-t border-border/30 ${borderClass}`}>
              <td className="py-2 px-2 text-text-muted">{r.position}</td>
              <td className="py-2 px-2">
                <div className="flex items-center gap-1.5">
                  <img src={r.team.crest} alt="" className="w-4 h-4 object-contain shrink-0" loading="lazy" />
                  <span className="text-text-primary font-medium truncate">{r.team.shortName}</span>
                </div>
              </td>
              <td className="py-2 px-1.5 text-center">{r.playedGames}</td>
              <td className="py-2 px-1.5 text-center hidden sm:table-cell">{r.won}</td>
              <td className="py-2 px-1.5 text-center hidden sm:table-cell">{r.draw}</td>
              <td className="py-2 px-1.5 text-center hidden sm:table-cell">{r.lost}</td>
              <td className="py-2 px-1.5 text-center">
                {r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}
              </td>
              <td className="py-2 px-2 text-center font-bold text-text-primary">{r.points}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
