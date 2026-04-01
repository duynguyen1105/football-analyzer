"use client";

import { useMatchStatistics } from "@/lib/hooks";

interface TeamStatistics {
  teamId: number;
  teamName: string;
  teamLogo: string;
  stats: Record<string, string | number | null>;
}

// Map API stat names to Vietnamese
const STAT_LABELS: Record<string, string> = {
  "Ball Possession": "Kiểm soát bóng",
  "Total Shots": "Tổng số cú sút",
  "Shots on Goal": "Sút trúng đích",
  "Shots off Goal": "Sút ra ngoài",
  "Blocked Shots": "Cú sút bị chặn",
  "Shots insidebox": "Sút trong vòng cấm",
  "Shots outsidebox": "Sút ngoài vòng cấm",
  "Fouls": "Phạm lỗi",
  "Corner Kicks": "Phạt góc",
  "Offsides": "Việt vị",
  "Yellow Cards": "Thẻ vàng",
  "Red Cards": "Thẻ đỏ",
  "Goalkeeper Saves": "Thủ môn cứu thua",
  "Total passes": "Tổng số đường chuyền",
  "Passes accurate": "Chuyền chính xác",
  "Passes %": "Tỷ lệ chuyền (%)",
};

// Stats to display (in order)
const DISPLAY_STATS = [
  "Ball Possession",
  "Total Shots",
  "Shots on Goal",
  "Corner Kicks",
  "Fouls",
  "Offsides",
  "Yellow Cards",
  "Goalkeeper Saves",
  "Passes %",
];

function StatBar({
  label,
  homeVal,
  awayVal,
  isPossession = false,
}: {
  label: string;
  homeVal: string | number | null;
  awayVal: string | number | null;
  isPossession?: boolean;
}) {
  // Parse values
  const parseVal = (v: string | number | null): number => {
    if (v === null || v === undefined) return 0;
    const str = String(v).replace("%", "");
    return parseFloat(str) || 0;
  };

  const homeNum = parseVal(homeVal);
  const awayNum = parseVal(awayVal);
  const total = homeNum + awayNum || 1;

  const homePct = isPossession ? homeNum : (homeNum / total) * 100;
  const awayPct = isPossession ? awayNum : (awayNum / total) * 100;

  const homeDisplay = homeVal !== null ? String(homeVal) : "-";
  const awayDisplay = awayVal !== null ? String(awayVal) : "-";

  return (
    <div className="py-2.5">
      <div className="flex justify-between text-sm mb-1.5">
        <span className={homeNum > awayNum ? "font-bold text-accent" : "text-text-secondary"}>
          {homeDisplay}
        </span>
        <span className="text-xs text-text-muted">{STAT_LABELS[label] || label}</span>
        <span className={awayNum > homeNum ? "font-bold text-accent-2" : "text-text-secondary"}>
          {awayDisplay}
        </span>
      </div>
      <div className="flex gap-1 h-2">
        <div className="flex-1 bg-border/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${homePct}%`, marginLeft: "auto" }}
          />
        </div>
        <div className="flex-1 bg-border/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-2 rounded-full transition-all"
            style={{ width: `${awayPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function MatchStatistics({
  matchId,
  homeTeamName,
  awayTeamName,
}: {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
}) {
  const { data: statistics, isLoading } = useMatchStatistics(matchId);

  if (isLoading) {
    return (
      <section className="bg-bg-card rounded-2xl border border-border p-5">
        <div className="h-4 w-32 bg-border/40 rounded animate-pulse mb-4" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-border/15 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!statistics || statistics.length < 2) return null;

  const homeStats = statistics[0] as TeamStatistics;
  const awayStats = statistics[1] as TeamStatistics;

  return (
    <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        Thống kê trận đấu
      </h3>

      {/* Team headers */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-2">
          <img src={homeStats.teamLogo} alt="" className="w-5 h-5 object-contain" />
          <span className="text-xs font-semibold text-accent">{homeTeamName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-accent-2">{awayTeamName}</span>
          <img src={awayStats.teamLogo} alt="" className="w-5 h-5 object-contain" />
        </div>
      </div>

      {/* Stats */}
      <div className="divide-y divide-border/30">
        {DISPLAY_STATS.map((statKey) => {
          const homeVal = homeStats.stats[statKey];
          const awayVal = awayStats.stats[statKey];
          // Skip if both values are null/0
          if ((homeVal === null || homeVal === 0) && (awayVal === null || awayVal === 0)) {
            return null;
          }
          return (
            <StatBar
              key={statKey}
              label={statKey}
              homeVal={homeVal}
              awayVal={awayVal}
              isPossession={statKey === "Ball Possession" || statKey === "Passes %"}
            />
          );
        })}
      </div>
    </section>
  );
}
