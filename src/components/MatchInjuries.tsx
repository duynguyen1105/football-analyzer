"use client";

import { useMatchInjuries } from "@/lib/hooks";
import { MatchInjury } from "@/lib/types";
import Link from "next/link";

// Translation maps for injury types and reasons
const TYPE_VI: Record<string, string> = {
  "Missing Fixture": "Vắng mặt",
  "Questionable": "Chưa chắc chắn",
  "Doubtful": "Nghi ngờ",
  "Out": "Không thi đấu",
};

const REASON_VI: Record<string, string> = {
  // Suspensions
  "Suspended": "Treo giò",
  "Red Card": "Thẻ đỏ",
  "Yellow Cards": "Thẻ vàng",
  "Accumulated Yellow Cards": "Tích lũy thẻ vàng",
  "Direct Red Card": "Thẻ đỏ trực tiếp",

  // Injuries
  "Injury": "Chấn thương",
  "Knee Injury": "Chấn thương đầu gối",
  "Muscle Injury": "Chấn thương cơ",
  "Hamstring": "Chấn thương gân kheo",
  "Hamstring Injury": "Chấn thương gân kheo",
  "Groin Injury": "Chấn thương háng",
  "Ankle Injury": "Chấn thương mắt cá",
  "Foot Injury": "Chấn thương bàn chân",
  "Calf Injury": "Chấn thương bắp chân",
  "Thigh Injury": "Chấn thương đùi",
  "Back Injury": "Chấn thương lưng",
  "Hip Injury": "Chấn thương hông",
  "Shoulder Injury": "Chấn thương vai",
  "Head Injury": "Chấn thương đầu",
  "Achilles Tendon Injury": "Chấn thương gân Achilles",
  "Cruciate Ligament Injury": "Chấn thương dây chằng chéo",
  "Ligament Injury": "Chấn thương dây chằng",
  "Meniscus Injury": "Chấn thương sụn chêm",
  "Broken Leg": "Gãy chân",
  "Broken Arm": "Gãy tay",
  "Broken Nose": "Gãy mũi",
  "Concussion": "Chấn động não",

  // Other
  "Illness": "Ốm",
  "Flu": "Cảm cúm",
  "Covid-19": "Covid-19",
  "Personal Reasons": "Lý do cá nhân",
  "Family Reasons": "Lý do gia đình",
  "Not in Squad": "Không có trong đội hình",
  "Lack of Match Fitness": "Thiếu thể lực",
  "Recovery": "Đang hồi phục",
  "Unknown": "Không rõ",
  "International Duty": "Nghĩa vụ ĐTQG",
};

function translateInjury(type: string, reason: string): string {
  // Try to translate reason first
  if (reason) {
    // Check for exact match
    if (REASON_VI[reason]) return REASON_VI[reason];

    // Check for partial matches (e.g., "Knee Injury" in "Right Knee Injury")
    for (const [eng, vi] of Object.entries(REASON_VI)) {
      if (reason.toLowerCase().includes(eng.toLowerCase())) {
        return vi;
      }
    }

    // If contains "Injury", return generic injury + original
    if (reason.toLowerCase().includes("injury")) {
      return "Chấn thương";
    }
  }

  // Fall back to type translation
  if (TYPE_VI[type]) return TYPE_VI[type];

  // Return original if no translation found
  return reason || type;
}

export function MatchInjuries({
  matchId,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
}: {
  matchId: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
}) {
  const { data, isLoading } = useMatchInjuries(matchId);

  if (isLoading) {
    return (
      <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
        <div className="h-4 w-48 bg-border/30 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              {[...Array(2)].map((_, j) => (
                <div key={j} className="h-8 bg-border/20 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  }

  const injuries = (data ?? []) as MatchInjury[];
  if (injuries.length === 0) return null;

  const homeInjuries = injuries.filter((i) => i.team.id === homeTeamId);
  const awayInjuries = injuries.filter((i) => i.team.id === awayTeamId);

  if (homeInjuries.length === 0 && awayInjuries.length === 0) return null;

  return (
    <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <h3 className="font-bold text-sm mb-3 md:mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
        Chấn thương / Vắng mặt
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InjuryColumn teamName={homeTeamName} injuries={homeInjuries} />
        <InjuryColumn teamName={awayTeamName} injuries={awayInjuries} />
      </div>
    </section>
  );
}

function InjuryColumn({ teamName, injuries }: { teamName: string; injuries: MatchInjury[] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-text-secondary mb-2">{teamName}</p>
      {injuries.length === 0 ? (
        <p className="text-xs text-text-muted">Không có thông tin</p>
      ) : (
        <div className="space-y-1.5">
          {injuries.map((inj, idx) => (
            <Link
              key={`${inj.player.id}-${idx}`}
              href={inj.player.id ? `/cau-thu/${inj.player.id}` : "#"}
              className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-bg-primary/50 text-xs hover:bg-bg-primary/80 transition-colors"
            >
              {inj.player.photo && (
                <img
                  src={inj.player.photo}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                />
              )}
              <span className="flex-1 truncate text-text-primary">{inj.player.name}</span>
              <span
                className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  inj.type === "Missing Fixture" || inj.type === "Out"
                    ? "bg-accent-red/15 text-accent-red"
                    : "bg-accent-yellow/15 text-accent-yellow"
                }`}
              >
                {translateInjury(inj.type, inj.reason)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
