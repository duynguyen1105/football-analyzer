"use client";

import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { usePlayerProfile } from "@/lib/hooks";
import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

interface SearchResult {
  id: number;
  name: string;
  photo: string;
  team: string;
  teamCrest: string;
}

interface TopPlayer {
  id: number;
  name: string;
  photo: string;
  team: string;
  teamLogo: string;
  goals: number;
  assists: number | null;
}

const SUGGESTED_COMPARISONS = [
  { a: { id: 1100, name: "Haaland" }, b: { id: 278, name: "Mbappé" } },
  { a: { id: 874, name: "Salah" }, b: { id: 1485, name: "Vinícius Jr" } },
  { a: { id: 154, name: "Messi" }, b: { id: 874, name: "Salah" } },
  { a: { id: 1100, name: "Haaland" }, b: { id: 1485, name: "Vinícius Jr" } },
  { a: { id: 184054, name: "Lamine Yamal" }, b: { id: 286289, name: "Kobbie Mainoo" } },
  { a: { id: 521, name: "De Bruyne" }, b: { id: 874, name: "Salah" } },
];

const LEAGUE_TABS = [
  { code: "PL", label: "PL", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "PD", label: "La Liga", flag: "🇪🇸" },
  { code: "SA", label: "Serie A", flag: "🇮🇹" },
  { code: "BL1", label: "Bundesliga", flag: "🇩🇪" },
  { code: "FL1", label: "Ligue 1", flag: "🇫🇷" },
];

function useTopPlayers(leagueCode: string) {
  return useQuery<TopPlayer[]>({
    queryKey: ["top-scorers", leagueCode],
    queryFn: async () => {
      const res = await fetch(`/api/standings?type=scorers&league=${leagueCode}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data || []).slice(0, 10);
    },
    staleTime: 60 * 60 * 1000,
  });
}

function PlayerSearch({
  label,
  selectedId,
  onSelect,
}: {
  label: string;
  selectedId: number | null;
  onSelect: (id: number, name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.players || []);
      setIsOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleClear() {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <label className="text-xs text-text-muted block mb-1">{label}</label>
      <div className={`flex items-center gap-2 bg-bg-card border rounded-lg px-3 py-2 transition-colors ${selectedId ? "border-accent/40" : "border-border"} focus-within:border-accent/50`}>
        <svg
          className="w-4 h-4 text-text-muted shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Tìm cầu thủ..."
          className="bg-transparent text-sm outline-none flex-1 text-text-primary placeholder:text-text-muted"
        />
        {loading && (
          <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        )}
        {query && !loading && (
          <button onClick={handleClear} className="text-text-muted hover:text-text-primary transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-bg-card border border-border rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onSelect(p.id, p.name);
                setQuery(p.name);
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 w-full text-left hover:bg-accent/10 transition-colors"
            >
              <img
                src={p.photo}
                alt=""
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{p.name}</p>
                <p className="text-[10px] text-text-muted flex items-center gap-1">
                  {p.teamCrest && (
                    <img
                      src={p.teamCrest}
                      alt=""
                      className="w-3 h-3 object-contain"
                    />
                  )}
                  {p.team}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBar({
  label,
  valueA,
  valueB,
}: {
  label: string;
  valueA: number;
  valueB: number;
}) {
  const max = Math.max(valueA, valueB, 1);
  const pctA = (valueA / max) * 100;
  const pctB = (valueB / max) * 100;

  return (
    <div className="py-2">
      <p className="text-[10px] text-text-muted text-center mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-bold w-8 text-right ${valueA > valueB ? "text-accent" : valueA < valueB ? "text-text-muted" : ""}`}
        >
          {valueA}
        </span>
        <div className="flex-1 flex gap-0.5">
          <div className="flex-1 h-2 bg-border/30 rounded-full overflow-hidden flex justify-end">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${pctA}%` }}
            />
          </div>
          <div className="flex-1 h-2 bg-border/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-2 rounded-full transition-all"
              style={{ width: `${pctB}%` }}
            />
          </div>
        </div>
        <span
          className={`text-xs font-bold w-8 ${valueB > valueA ? "text-accent-2" : valueB < valueA ? "text-text-muted" : ""}`}
        >
          {valueB}
        </span>
      </div>
    </div>
  );
}

function PlayerCard({ playerId }: { playerId: number }) {
  const { data: player, isLoading } = usePlayerProfile(String(playerId));

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-border/20 rounded-full mx-auto animate-pulse mb-2" />
        <div className="h-4 w-24 bg-border/30 rounded mx-auto animate-pulse" />
      </div>
    );
  }

  if (!player) return null;

  return (
    <Link href={`/cau-thu/${player.id}`} className="block text-center group">
      <img
        src={player.photo}
        alt={player.name}
        className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-border group-hover:border-accent transition-colors"
      />
      <p className="text-sm font-bold mt-2 group-hover:text-accent transition-colors">
        {player.name}
      </p>
      <p className="text-[10px] text-text-muted">
        {player.currentTeam?.name} &bull; {player.position}
      </p>
      {player.currentTeam?.logo && (
        <img
          src={player.currentTeam.logo}
          alt=""
          className="w-5 h-5 mx-auto mt-1 object-contain"
        />
      )}
    </Link>
  );
}

function AiConclusion({ playerA, playerB }: { playerA: number; playerB: number }) {
  const { data, isLoading, error } = useQuery<{ analysis: string }>({
    queryKey: ["compare-analysis", playerA, playerB],
    queryFn: () =>
      fetch(`/api/compare?a=${playerA}&b=${playerB}`).then((r) => r.json()),
    staleTime: 6 * 60 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="bg-bg-card rounded-2xl border border-border p-4 md:p-5 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-xs text-text-muted">AI đang phân tích...</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-border/20 rounded animate-pulse w-full" />
          <div className="h-3 bg-border/20 rounded animate-pulse w-5/6" />
          <div className="h-3 bg-border/20 rounded animate-pulse w-4/6" />
          <div className="h-3 bg-border/20 rounded animate-pulse w-full" />
          <div className="h-3 bg-border/20 rounded animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !data?.analysis) return null;

  // Convert **bold** to <strong> tags
  const html = data.analysis
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .split("\n\n")
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join("");

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-4 md:p-5 mt-4">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        Nhận xét AI
      </h3>
      <div
        className="text-sm text-text-secondary leading-relaxed space-y-3 [&_strong]:text-text-primary [&_strong]:font-semibold"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function ComparisonView({
  playerA,
  playerB,
}: {
  playerA: number;
  playerB: number;
}) {
  const { data: a } = usePlayerProfile(String(playerA));
  const { data: b } = usePlayerProfile(String(playerB));

  if (!a || !b) return null;

  // Aggregate stats from primary league
  const statsA = a.statistics[0];
  const statsB = b.statistics[0];

  if (!statsA || !statsB) {
    return (
      <p className="text-sm text-text-muted text-center py-8">
        Không đủ dữ liệu thống kê để so sánh
      </p>
    );
  }

  const comparisons = [
    { label: "Trận đấu", a: statsA.games.appearences, b: statsB.games.appearences },
    { label: "Bàn thắng", a: statsA.goals.total, b: statsB.goals.total },
    { label: "Kiến tạo", a: statsA.goals.assists, b: statsB.goals.assists },
    { label: "Phút thi đấu", a: statsA.games.minutes, b: statsB.games.minutes },
    { label: "Sút", a: statsA.shots.total, b: statsB.shots.total },
    { label: "Sút trúng đích", a: statsA.shots.on, b: statsB.shots.on },
    { label: "Chuyền", a: statsA.passes.total, b: statsB.passes.total },
    { label: "Tắc bóng", a: statsA.tackles.total, b: statsB.tackles.total },
    { label: "Tranh chấp thắng", a: statsA.duels.won, b: statsB.duels.won },
    { label: "Rê bóng thành công", a: statsA.dribbles.success, b: statsB.dribbles.success },
    { label: "Thẻ vàng", a: statsA.cards.yellow, b: statsB.cards.yellow },
    { label: "Thẻ đỏ", a: statsA.cards.red, b: statsB.cards.red },
  ];

  const ratingA = statsA.games.rating ? parseFloat(statsA.games.rating) : 0;
  const ratingB = statsB.games.rating ? parseFloat(statsB.games.rating) : 0;

  return (
    <>
    <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
      {/* Player headers */}
      <div className="grid grid-cols-3 p-4 border-b border-border">
        <PlayerCard playerId={playerA} />
        <div className="flex items-center justify-center">
          <span className="text-lg font-bold text-text-muted">VS</span>
        </div>
        <PlayerCard playerId={playerB} />
      </div>

      {/* Rating */}
      {(ratingA > 0 || ratingB > 0) && (
        <div className="px-4 pt-4">
          <div className="grid grid-cols-3 text-center">
            <p
              className={`text-xl font-bold ${ratingA > ratingB ? "text-accent" : "text-text-secondary"}`}
            >
              {ratingA > 0 ? ratingA.toFixed(1) : "-"}
            </p>
            <p className="text-xs text-text-muted self-center">
              Điểm trung bình
            </p>
            <p
              className={`text-xl font-bold ${ratingB > ratingA ? "text-accent-2" : "text-text-secondary"}`}
            >
              {ratingB > 0 ? ratingB.toFixed(1) : "-"}
            </p>
          </div>
        </div>
      )}

      {/* Stats comparison */}
      <div className="px-4 pb-4 divide-y divide-border/30">
        {comparisons.map((c) => (
          <StatBar key={c.label} label={c.label} valueA={c.a} valueB={c.b} />
        ))}
      </div>

      {/* League info */}
      <div className="px-4 py-3 border-t border-border bg-bg-primary/30">
        <div className="grid grid-cols-3 text-center text-[10px] text-text-muted">
          <p>
            {statsA.league.name}
            <br />
            {statsA.team.name}
          </p>
          <p>Giải đấu</p>
          <p>
            {statsB.league.name}
            <br />
            {statsB.team.name}
          </p>
        </div>
      </div>
    </div>

    {/* AI Conclusion */}
    <AiConclusion playerA={playerA} playerB={playerB} />
    </>
  );
}

function SuggestedComparisons({ onPick }: { onPick: (a: number, b: number) => void }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">So sánh phổ biến</h3>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_COMPARISONS.map((s, i) => (
          <button
            key={i}
            onClick={() => onPick(s.a.id, s.b.id)}
            className="text-xs px-3 py-1.5 rounded-full border border-border bg-bg-card hover:border-accent/40 hover:bg-accent/5 transition-colors text-text-secondary"
          >
            {s.a.name} vs {s.b.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function TopPlayerPicker({ slot, onPick }: { slot: "A" | "B"; onPick: (id: number) => void }) {
  const [league, setLeague] = useState("PL");
  const { data: players, isLoading } = useTopPlayers(league);

  return (
    <div className="bg-bg-card rounded-xl border border-border p-3">
      <p className="text-xs font-semibold text-text-muted mb-2">
        Hoặc chọn nhanh Cầu thủ {slot}
      </p>

      {/* League tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto no-scrollbar">
        {LEAGUE_TABS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLeague(l.code)}
            className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap transition-colors ${
              league === l.code
                ? "bg-accent text-white"
                : "bg-bg-primary/50 text-text-muted hover:text-text-primary"
            }`}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>

      {/* Player grid */}
      {isLoading ? (
        <div className="grid grid-cols-5 gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-border/20 animate-pulse" />
              <div className="h-2 w-10 rounded bg-border/20 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {(players || []).slice(0, 10).map((p) => (
            <button
              key={p.id}
              onClick={() => onPick(p.id)}
              className="flex flex-col items-center gap-1 p-1.5 rounded-lg hover:bg-accent/10 transition-colors group"
            >
              <img
                src={p.photo}
                alt={p.name}
                className="w-10 h-10 rounded-full object-cover border border-border group-hover:border-accent transition-colors"
              />
              <span className="text-[9px] text-text-secondary text-center leading-tight line-clamp-2 group-hover:text-accent transition-colors">
                {p.name.split(" ").slice(-1)[0]}
              </span>
              <span className="text-[8px] text-text-muted">{p.goals} ban</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ComparisonPage() {
  const [playerA, setPlayerA] = useState<number | null>(null);
  const [playerB, setPlayerB] = useState<number | null>(null);

  function handleSelectA(id: number) {
    setPlayerA(id);
  }

  function handleSelectB(id: number) {
    setPlayerB(id);
  }

  function handleSuggested(a: number, b: number) {
    setPlayerA(a);
    setPlayerB(b);
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6 xl:px-8">
        <Breadcrumbs items={[{ label: "So sánh cầu thủ" }]} />

        <h1 className="text-xl font-bold mb-1">So sánh cầu thủ</h1>
        <p className="text-xs text-text-muted mb-6">
          Chọn 2 cầu thủ để so sánh thống kê mùa giải
        </p>

        {/* Player selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <PlayerSearch label="Cầu thủ 1" selectedId={playerA} onSelect={(id) => handleSelectA(id)} />
          <PlayerSearch label="Cầu thủ 2" selectedId={playerB} onSelect={(id) => handleSelectB(id)} />
        </div>

        {/* Suggested comparisons + quick-pick (shown when no comparison active) */}
        {!(playerA && playerB) && (
          <>
            <SuggestedComparisons onPick={handleSuggested} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <TopPlayerPicker slot="A" onPick={handleSelectA} />
              <TopPlayerPicker slot="B" onPick={handleSelectB} />
            </div>
          </>
        )}

        {/* Comparison */}
        {playerA && playerB ? (
          <ComparisonView playerA={playerA} playerB={playerB} />
        ) : (
          <div className="text-center py-12 bg-bg-card rounded-2xl border border-border">
            <div className="text-4xl mb-4">&#9878;&#65039;</div>
            <p className="text-text-secondary font-medium">
              Chọn 2 cầu thủ để bắt đầu so sánh
            </p>
            <p className="text-xs text-text-muted mt-2">
              Tìm kiếm theo tên, chọn nhanh, hoặc bấm một cặp gợi ý
            </p>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-bg-card/50 rounded-xl border border-border/50">
          <h3 className="font-semibold text-sm mb-2">Về trang So sánh</h3>
          <ul className="text-xs text-text-muted space-y-1">
            <li>&bull; So sánh thống kê mùa giải hiện tại của 2 cầu thủ bất kỳ</li>
            <li>&bull; Dữ liệu bao gồm: bàn thắng, kiến tạo, chuyền, tắc bóng, rê bóng, thẻ phạt</li>
            <li>&bull; Nhấn vào tên cầu thủ để xem hồ sơ chi tiết</li>
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
