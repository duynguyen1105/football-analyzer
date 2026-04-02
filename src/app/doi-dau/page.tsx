"use client";

import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";

interface TeamResult {
  id: number;
  name: string;
  crest: string;
  country: string;
}

interface H2HMatch {
  date: string;
  home: string;
  away: string;
  scoreHome: number;
  scoreAway: number;
}

interface H2HData {
  homeWins: number;
  draws: number;
  awayWins: number;
  totalGoals: number;
  lastMatches: H2HMatch[];
}

function TeamSearch({
  label,
  onSelect,
  selected,
}: {
  label: string;
  onSelect: (team: TeamResult) => void;
  selected: TeamResult | null;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TeamResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.teams || []);
      setIsOpen(true);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setResults([]); setIsOpen(false); return; }
    debounceRef.current = setTimeout(() => search(query), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="text-xs text-text-muted block mb-1">{label}</label>
      {selected ? (
        <div className="flex items-center gap-2 bg-bg-card border border-border rounded-lg px-3 py-2">
          <img src={selected.crest} alt="" className="w-6 h-6 object-contain" />
          <span className="text-sm font-medium flex-1">{selected.name}</span>
          <button
            onClick={() => { onSelect(null as unknown as TeamResult); setQuery(""); }}
            className="text-text-muted hover:text-text-primary text-xs"
          >
            &#10005;
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-bg-card border border-border rounded-lg px-3 py-2 focus-within:border-accent/50 transition-colors">
          <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Tìm đội bóng..."
            className="bg-transparent text-sm outline-none flex-1 text-text-primary placeholder:text-text-muted"
          />
          {loading && <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />}
        </div>
      )}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-bg-card border border-border rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((t) => (
            <button
              key={t.id}
              onClick={() => { onSelect(t); setQuery(t.name); setIsOpen(false); }}
              className="flex items-center gap-2.5 px-3 py-2 w-full text-left hover:bg-accent/10 transition-colors"
            >
              <img src={t.crest} alt="" className="w-6 h-6 object-contain" />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{t.name}</p>
                <p className="text-[10px] text-text-muted">{t.country}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DonutChart({ homeWins, draws, awayWins }: { homeWins: number; draws: number; awayWins: number }) {
  const total = homeWins + draws + awayWins;
  if (total === 0) return null;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const homePct = homeWins / total;
  const drawPct = draws / total;

  const homeLen = homePct * circumference;
  const drawLen = drawPct * circumference;
  const awayLen = circumference - homeLen - drawLen;

  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border)" strokeWidth="12" opacity="0.3" />
      {/* Home wins (green) */}
      <circle
        cx="50" cy="50" r={radius} fill="none"
        stroke="var(--accent)" strokeWidth="12"
        strokeDasharray={`${homeLen} ${circumference - homeLen}`}
        strokeDashoffset={circumference * 0.25}
        strokeLinecap="round"
      />
      {/* Draws (yellow) */}
      <circle
        cx="50" cy="50" r={radius} fill="none"
        stroke="var(--accent-yellow)" strokeWidth="12"
        strokeDasharray={`${drawLen} ${circumference - drawLen}`}
        strokeDashoffset={circumference * 0.25 - homeLen}
        strokeLinecap="round"
      />
      {/* Away wins (blue) */}
      <circle
        cx="50" cy="50" r={radius} fill="none"
        stroke="var(--accent-2)" strokeWidth="12"
        strokeDasharray={`${awayLen} ${circumference - awayLen}`}
        strokeDashoffset={circumference * 0.25 - homeLen - drawLen}
        strokeLinecap="round"
      />
      <text x="50" y="48" textAnchor="middle" className="fill-text-primary text-lg font-bold">{total}</text>
      <text x="50" y="60" textAnchor="middle" className="fill-text-muted" style={{ fontSize: "7px" }}>trận</text>
    </svg>
  );
}

function H2HResults({ teamA, teamB }: { teamA: TeamResult; teamB: TeamResult }) {
  const { data: h2h, isLoading, error } = useQuery<H2HData>({
    queryKey: ["h2h", teamA.id, teamB.id],
    queryFn: () => fetch(`/api/h2h?a=${teamA.id}&b=${teamB.id}`).then((r) => r.json()),
    staleTime: 24 * 60 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="bg-bg-card rounded-2xl border border-border p-6">
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !h2h || h2h.homeWins === undefined) {
    return (
      <div className="bg-bg-card rounded-2xl border border-border p-6 text-center">
        <p className="text-text-muted text-sm">Không tìm thấy lịch sử đối đầu giữa hai đội này.</p>
      </div>
    );
  }

  const total = h2h.homeWins + h2h.draws + h2h.awayWins;
  const avgGoals = total > 0 ? (h2h.totalGoals / total).toFixed(1) : "0";

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-bg-card rounded-2xl border border-border p-5">
        <div className="grid grid-cols-3 items-center gap-4">
          {/* Team A */}
          <Link href={`/doi-bong/${teamA.id}`} className="text-center group">
            <img src={teamA.crest} alt={teamA.name} className="w-14 h-14 object-contain mx-auto mb-1" />
            <p className="text-sm font-bold group-hover:text-accent transition-colors">{teamA.name}</p>
            <p className="text-2xl font-bold text-accent mt-1">{h2h.homeWins}</p>
            <p className="text-[10px] text-text-muted">Thắng</p>
          </Link>

          {/* Center stats */}
          <div className="text-center">
            <DonutChart homeWins={h2h.homeWins} draws={h2h.draws} awayWins={h2h.awayWins} />
            <p className="text-xl font-bold text-accent-yellow mt-1">{h2h.draws}</p>
            <p className="text-[10px] text-text-muted">Hoà</p>
          </div>

          {/* Team B */}
          <Link href={`/doi-bong/${teamB.id}`} className="text-center group">
            <img src={teamB.crest} alt={teamB.name} className="w-14 h-14 object-contain mx-auto mb-1" />
            <p className="text-sm font-bold group-hover:text-accent-2 transition-colors">{teamB.name}</p>
            <p className="text-2xl font-bold text-accent-2 mt-1">{h2h.awayWins}</p>
            <p className="text-[10px] text-text-muted">Thắng</p>
          </Link>
        </div>

        {/* Extra stats */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/30">
          <div className="text-center bg-bg-primary/50 rounded-lg py-2">
            <p className="text-lg font-bold">{h2h.totalGoals}</p>
            <p className="text-[10px] text-text-muted">Tổng bàn thắng</p>
          </div>
          <div className="text-center bg-bg-primary/50 rounded-lg py-2">
            <p className="text-lg font-bold">{avgGoals}</p>
            <p className="text-[10px] text-text-muted">TB bàn/trận</p>
          </div>
        </div>

        {/* Win percentage bar */}
        {total > 0 && (
          <div className="mt-4">
            <div className="flex h-3 rounded-full overflow-hidden">
              <div className="bg-accent" style={{ width: `${(h2h.homeWins / total) * 100}%` }} />
              <div className="bg-accent-yellow" style={{ width: `${(h2h.draws / total) * 100}%` }} />
              <div className="bg-accent-2" style={{ width: `${(h2h.awayWins / total) * 100}%` }} />
            </div>
            <div className="flex justify-between text-[9px] text-text-muted mt-1">
              <span>{Math.round((h2h.homeWins / total) * 100)}%</span>
              <span>{Math.round((h2h.draws / total) * 100)}%</span>
              <span>{Math.round((h2h.awayWins / total) * 100)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Match history */}
      {h2h.lastMatches.length > 0 && (
        <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Lịch sử đối đầu ({h2h.lastMatches.length} trận gần nhất)</h3>
          </div>
          <div>
            {h2h.lastMatches.map((m, i) => {
              const homeIsA = m.home.includes(teamA.name) || teamA.name.includes(m.home);
              const teamAGoals = homeIsA ? m.scoreHome : m.scoreAway;
              const teamBGoals = homeIsA ? m.scoreAway : m.scoreHome;
              const result = teamAGoals > teamBGoals ? "A" : teamAGoals < teamBGoals ? "B" : "D";

              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-border/30 last:border-0"
                >
                  {/* Result indicator */}
                  <div className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center shrink-0 ${
                    result === "A" ? "bg-green-500/20 text-green-400" :
                    result === "B" ? "bg-red-500/20 text-red-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {result === "A" ? "W" : result === "B" ? "L" : "D"}
                  </div>

                  {/* Match info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {m.home} vs {m.away}
                    </p>
                    <p className="text-[10px] text-text-muted">{m.date}</p>
                  </div>

                  {/* Score */}
                  <span className="text-sm font-bold shrink-0">
                    {m.scoreHome} - {m.scoreAway}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function H2HPage() {
  const [teamA, setTeamA] = useState<TeamResult | null>(null);
  const [teamB, setTeamB] = useState<TeamResult | null>(null);

  return (
    <>
      <Navbar />
      <div id="main-content" className="max-w-3xl mx-auto px-4 py-6 xl:px-8">
        <Breadcrumbs items={[{ label: "Đối đầu" }]} />

        <h1 className="text-xl font-bold mb-1">Lịch sử đối đầu</h1>
        <p className="text-xs text-text-muted mb-6">
          Chọn 2 đội bóng để xem lịch sử đối đầu trực tiếp
        </p>

        {/* Team selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <TeamSearch label="Đội 1" onSelect={setTeamA} selected={teamA} />
          <TeamSearch label="Đội 2" onSelect={setTeamB} selected={teamB} />
        </div>

        {/* Results */}
        {teamA && teamB ? (
          <H2HResults teamA={teamA} teamB={teamB} />
        ) : (
          <div className="text-center py-16 bg-bg-card rounded-2xl border border-border">
            <div className="text-4xl mb-4">&#9878;&#65039;</div>
            <p className="text-text-secondary font-medium">Chọn 2 đội bóng để xem đối đầu</p>
            <p className="text-xs text-text-muted mt-2">Tìm kiếm theo tên đội ở trên</p>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-bg-card/50 rounded-xl border border-border/50">
          <h3 className="font-semibold text-sm mb-2">Về trang Đối đầu</h3>
          <ul className="text-xs text-text-muted space-y-1">
            <li>&bull; Xem lịch sử đối đầu trực tiếp giữa 2 đội bóng bất kỳ</li>
            <li>&bull; Dữ liệu bao gồm: số trận thắng/hoà/thua, tổng bàn thắng, 10 trận gần nhất</li>
            <li>&bull; Nhấn vào tên đội để xem hồ sơ chi tiết</li>
          </ul>
        </div>

        <footer className="mt-8 py-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>MatchDay Analyst — Nhận định bóng đá trước trận</p>
          <div className="mt-1 flex gap-3 justify-center">
            <Link href="/" className="hover:text-text-primary">Trang chủ</Link>
            <Link href="/about" className="hover:text-text-primary">Giới thiệu</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
