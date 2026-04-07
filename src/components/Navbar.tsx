"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LEAGUES } from "@/lib/constants";
import { getSlugByCode } from "@/lib/league-slugs";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [leagueOpen, setLeagueOpen] = useState(false);
  const leagueRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (leagueRef.current && !leagueRef.current.contains(e.target as Node)) setLeagueOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-bg-secondary/90 backdrop-blur border-b border-border" role="banner">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 xl:px-6 flex items-center justify-between h-12">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <span className="text-lg">&#9917;</span>
          <span className="font-bold text-sm text-text-primary">
            {/* Mobile: short abbreviation */}
            <span className="sm:hidden">NĐBĐ</span>
            {/* Desktop: full Vietnamese name */}
            <span className="hidden sm:inline">Nhận Định Bóng Đá <span className="text-accent">VN</span></span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Điều hướng chính" className="hidden sm:flex items-center gap-3 md:gap-4 text-xs text-text-secondary">
          <Link href="/truc-tiep" className="hover:text-text-primary transition-colors flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Live
          </Link>
          <Link href="/hom-nay" className="hover:text-text-primary transition-colors">Hôm nay</Link>

          {/* Giải đấu dropdown */}
          <div ref={leagueRef} className="relative">
            <button
              onClick={() => setLeagueOpen(!leagueOpen)}
              className="hover:text-text-primary transition-colors flex items-center gap-0.5"
            >
              Giải đấu
              <svg className={`w-3 h-3 transition-transform ${leagueOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {leagueOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-bg-card border border-border rounded-xl shadow-lg py-1.5 z-50">
                {LEAGUES.map((l) => (
                  <Link
                    key={l.code}
                    href={`/giai-dau/${getSlugByCode(l.code) || l.code}`}
                    onClick={() => setLeagueOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-bg-primary/50 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0">
                      <img src={l.logo} alt="" className="w-4 h-4 object-contain" />
                    </span>
                    <span className="text-xs text-text-primary">{l.flag} {l.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/soi-keo-hom-nay" className="hover:text-text-primary transition-colors">Soi kèo</Link>
          <Link href="/du-doan" className="hover:text-text-primary transition-colors hidden md:inline">Dự đoán</Link>
          <Link href="/bai-viet" className="hover:text-text-primary transition-colors hidden md:inline">Bài viết</Link>
          <Link href="/so-sanh" className="hover:text-text-primary transition-colors hidden lg:inline">So sánh</Link>
          <SearchBar />
          <ThemeToggle />
        </nav>

        {/* Mobile nav: minimal icons */}
        <div className="flex sm:hidden items-center gap-2">
          <Link href="/truc-tiep" className="p-1.5 hover:text-text-primary transition-colors flex items-center gap-1 text-xs text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>Live</span>
          </Link>
          <SearchBar />
          <ThemeToggle />

          {/* Hamburger menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                {/* Navigation links */}
                <div className="border-b border-border py-1.5">
                  <MobileNavLink href="/hom-nay" onClick={() => setMenuOpen(false)}>Hôm nay</MobileNavLink>
                  <MobileNavLink href="/soi-keo-hom-nay" onClick={() => setMenuOpen(false)}>Soi kèo</MobileNavLink>
                  <MobileNavLink href="/du-doan" onClick={() => setMenuOpen(false)}>Dự đoán</MobileNavLink>
                  <MobileNavLink href="/so-sanh" onClick={() => setMenuOpen(false)}>So sánh</MobileNavLink>
                  <MobileNavLink href="/bai-viet" onClick={() => setMenuOpen(false)}>Bài viết</MobileNavLink>
                </div>

                {/* Leagues */}
                <div className="py-1.5">
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Giải đấu</p>
                  {LEAGUES.map((l) => (
                    <Link
                      key={l.code}
                      href={`/giai-dau/${getSlugByCode(l.code) || l.code}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-bg-primary/50 transition-colors"
                    >
                      <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0">
                        <img src={l.logo} alt="" className="w-4 h-4 object-contain" />
                      </span>
                      <span className="text-xs text-text-primary">{l.flag} {l.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2.5 text-sm text-text-primary hover:bg-bg-primary/50 transition-colors"
    >
      {children}
    </Link>
  );
}
