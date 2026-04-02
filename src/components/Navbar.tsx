"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LEAGUES } from "@/lib/constants";
import { getSlugByCode } from "@/lib/league-slugs";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-bg-secondary/90 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 xl:px-6 flex items-center justify-between h-12">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-lg">&#9917;</span>
          <span className="font-bold text-sm text-text-primary">
            MatchDay<span className="text-accent">Analyst</span>
          </span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4 text-xs text-text-secondary">
          <Link href="/truc-tiep" className="hover:text-text-primary transition-colors flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Live
          </Link>
          <Link href="/hom-nay" className="hover:text-text-primary transition-colors">Hôm nay</Link>

          {/* Giải đấu dropdown */}
          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="hover:text-text-primary transition-colors flex items-center gap-0.5"
            >
              Giải đấu
              <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-bg-card border border-border rounded-xl shadow-lg py-1.5 z-50">
                {LEAGUES.map((l) => (
                  <Link
                    key={l.code}
                    href={`/giai-dau/${getSlugByCode(l.code) || l.code}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-bg-primary/50 transition-colors"
                  >
                    <img src={l.logo} alt="" className="w-5 h-5 object-contain" />
                    <span className="text-xs text-text-primary">{l.flag} {l.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/soi-keo/premier-league" className="hover:text-text-primary transition-colors">Soi kèo</Link>
          <Link href="/du-doan" className="hover:text-text-primary transition-colors hidden sm:inline">Dự đoán</Link>
          <Link href="/so-sanh" className="hover:text-text-primary transition-colors hidden md:inline">So sánh</Link>
          <SearchBar />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
