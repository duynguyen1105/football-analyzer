"use client";

import { useMatchStatistics } from "@/lib/hooks";

interface TeamStatistics {
  teamId: number;
  teamName: string;
  teamLogo: string;
  stats: Record<string, string | number | null>;
}

const STAT_LABELS: Record<string, string> = {
  "Ball Possession": "Kiểm soát bóng",
  "Total Shots": "Tổng cú sút",
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
  "Total passes": "Tổng đường chuyền",
  "Passes accurate": "Chuyền chính xác",
  "Passes %": "Tỷ lệ chuyền (%)",
  "expected_goals": "Bàn thắng kỳ vọng (xG)",
};

const STAT_GROUPS: { title: string; icon: string; stats: string[] }[] = [
  {
    title: "Tổng quan",
    icon: "📊",
    stats: ["Ball Possession"],
  },
  {
    title: "Tấn công",
    icon: "⚡",
    stats: ["Total Shots", "Shots on Goal", "Shots off Goal", "Blocked Shots", "Shots insidebox", "Shots outsidebox"],
  },
  {
    title: "Chuyền bóng",
    icon: "🎯",
    stats: ["Total passes", "Passes accurate", "Passes %"],
  },
  {
    title: "Phòng ngự & Kỷ luật",
    icon: "🛡️",
    stats: ["Fouls", "Corner Kicks", "Offsides", "Yellow Cards", "Red Cards", "Goalkeeper Saves"],
  },
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

  const homeWins = homeNum > awayNum;
  const awayWins = awayNum > homeNum;

  return (
    <div className="py-2">
      <div className="flex justify-between text-sm mb-1">
        <span className={homeWins ? "font-bold text-accent" : "text-text-secondary"}>
          {homeDisplay}
        </span>
        <span className="text-[11px] text-text-muted">{STAT_LABELS[label] || label}</span>
        <span className={awayWins ? "font-bold text-accent-2" : "text-text-secondary"}>
          {awayDisplay}
        </span>
      </div>
      <div className="flex gap-0.5 h-1.5">
        <div className="flex-1 bg-border/20 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${homeWins ? "bg-accent" : "bg-accent/40"}`}
            style={{ width: `${homePct}%`, marginLeft: "auto" }}
          />
        </div>
        <div className="flex-1 bg-border/20 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${awayWins ? "bg-accent-2" : "bg-accent-2/40"}`}
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
  isLive,
}: {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  isLive?: boolean;
}) {
  const { data: statistics, isLoading } = useMatchStatistics(matchId, isLive);

  if (isLoading) {
    return (
      <section className="bg-bg-card rounded-2xl border border-border p-5">
        <div className="h-4 w-32 bg-border/40 rounded animate-pulse mb-4" />
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-8 bg-border/15 rounded-lg animate-pulse" />
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

      {/* Grouped stats */}
      <div className="space-y-4">
        {STAT_GROUPS.map((group) => {
          const visibleStats = group.stats.filter((key) => {
            const hv = homeStats.stats[key];
            const av = awayStats.stats[key];
            return !((hv === null || hv === 0 || hv === "0" || hv === "0%") && (av === null || av === 0 || av === "0" || av === "0%"));
          });
          if (visibleStats.length === 0) return null;

          return (
            <div key={group.title}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs">{group.icon}</span>
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{group.title}</span>
              </div>
              <div className="divide-y divide-border/20">
                {visibleStats.map((statKey) => (
                  <StatBar
                    key={statKey}
                    label={statKey}
                    homeVal={homeStats.stats[statKey]}
                    awayVal={awayStats.stats[statKey]}
                    isPossession={statKey === "Ball Possession" || statKey === "Passes %"}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
