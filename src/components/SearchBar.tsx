"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

interface SearchResult {
  teams: { id: number; name: string; crest: string; country: string }[];
  players: { id: number; name: string; photo: string; team: string; teamCrest: string }[];
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      setIsOpen(true);
    } catch {
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => search(query), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const close = () => {
    setIsOpen(false);
    setQuery("");
    setResults(null);
  };

  const hasResults = results && (results.teams.length > 0 || results.players.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1.5 bg-bg-card/60 border border-border rounded-lg px-2 py-1 focus-within:border-accent/50 transition-colors">
        <svg className="w-3.5 h-3.5 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => hasResults && setIsOpen(true)}
          placeholder="Tìm đội bóng..."
          className="bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none w-24 sm:w-32 focus:w-40 transition-all"
        />
        {isLoading && (
          <div className="w-3 h-3 border border-accent/50 border-t-accent rounded-full animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
          {!hasResults && (
            <p className="text-xs text-text-muted p-3 text-center">
              Không tìm thấy kết quả cho &ldquo;{query}&rdquo;
            </p>
          )}

          {results.teams.length > 0 && (
            <div>
              <p className="text-[10px] text-text-muted px-3 pt-2 pb-1 uppercase tracking-wide font-medium">
                Đội bóng
              </p>
              {results.teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/doi-bong/${team.id}`}
                  onClick={close}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-accent/10 transition-colors"
                >
                  <img src={team.crest} alt="" className="w-6 h-6 object-contain" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{team.name}</p>
                    <p className="text-[10px] text-text-muted">{team.country}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {results.players.length > 0 && (
            <div className={results.teams.length > 0 ? "border-t border-border/50" : ""}>
              <p className="text-[10px] text-text-muted px-3 pt-2 pb-1 uppercase tracking-wide font-medium">
                Cầu thủ
              </p>
              {results.players.map((player) => (
                <Link
                  key={player.id}
                  href={`/cau-thu/${player.id}`}
                  onClick={close}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-accent/10 transition-colors"
                >
                  <img src={player.photo} alt="" className="w-6 h-6 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{player.name}</p>
                    <p className="text-[10px] text-text-muted flex items-center gap-1">
                      {player.teamCrest && (
                        <img src={player.teamCrest} alt="" className="w-3 h-3 object-contain" />
                      )}
                      {player.team}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
