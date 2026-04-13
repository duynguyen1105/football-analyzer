import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { getMatches } from "@/lib/football-data";
import { getVietnamDate } from "@/lib/timezone";
import { LEAGUES } from "@/lib/constants";
import { Match } from "@/lib/types";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lịch Phát Sóng Bóng Đá — Xem Kênh Nào Hôm Nay",
  description:
    "Lịch phát sóng bóng đá hôm nay. Xem trận đấu Premier League, La Liga, Serie A, Champions League trên kênh nào: K+, FPT Play, VTV.",
  keywords: [
    "lịch phát sóng bóng đá",
    "xem bóng đá kênh nào",
    "lịch phát sóng hôm nay",
    "K+ bóng đá",
    "FPT Play bóng đá",
    "VTV bóng đá",
  ],
};

export const revalidate = 300;

// --- TV channel mapping by league code ---
const TV_CHANNELS: Record<string, { channel: string; color: string }[]> = {
  PL: [
    { channel: "K+", color: "bg-blue-500/15 text-blue-400" },
    { channel: "FPT Play", color: "bg-orange-500/15 text-orange-400" },
  ],
  PD: [
    { channel: "VTV Cab", color: "bg-green-500/15 text-green-400" },
    { channel: "On Sports", color: "bg-purple-500/15 text-purple-400" },
  ],
  SA: [
    { channel: "On Sports+", color: "bg-purple-500/15 text-purple-400" },
  ],
  BL1: [
    { channel: "On Sports", color: "bg-purple-500/15 text-purple-400" },
  ],
  FL1: [
    { channel: "VTV Cab", color: "bg-green-500/15 text-green-400" },
  ],
  VL: [
    { channel: "VTV5", color: "bg-red-500/15 text-red-400" },
    { channel: "FPT Play", color: "bg-orange-500/15 text-orange-400" },
  ],
  CL: [
    { channel: "FPT Play", color: "bg-orange-500/15 text-orange-400" },
  ],
  WC: [
    { channel: "VTV", color: "bg-red-500/15 text-red-400" },
    { channel: "FPT Play", color: "bg-orange-500/15 text-orange-400" },
  ],
};

function formatVietnameseDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getTimeSlot(time: string): string {
  const hour = parseInt(time.split(":")[0], 10);
  if (hour < 12) return "Buổi sáng";
  if (hour < 18) return "Buổi chiều";
  return "Buổi tối";
}

function getTimeSlotOrder(slot: string): number {
  if (slot === "Buổi sáng") return 0;
  if (slot === "Buổi chiều") return 1;
  return 2;
}

export default async function LichPhatSongPage() {
  const today = getVietnamDate();
  const allMatches = await getMatches(today, today);

  // Filter to scheduled/live matches
  const upcoming = allMatches.filter(
    (m) => m.status === "SCHEDULED" || m.status === "IN_PLAY" || m.status === "LIVE",
  );

  // Group by time slot
  const bySlot = new Map<string, Match[]>();
  for (const m of upcoming) {
    const slot = getTimeSlot(m.time);
    if (!bySlot.has(slot)) bySlot.set(slot, []);
    bySlot.get(slot)!.push(m);
  }

  // Sort slots
  const sortedSlots = [...bySlot.entries()].sort(
    (a, b) => getTimeSlotOrder(a[0]) - getTimeSlotOrder(b[0]),
  );

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-3 py-6">
        <h1 className="text-xl md:text-2xl font-bold mb-1">
          Lịch Phát Sóng Bóng Đá Hôm Nay
        </h1>
        <p className="text-sm text-text-muted mb-6">{formatVietnameseDate(today)}</p>

        {upcoming.length === 0 ? (
          <div className="bg-bg-card rounded-2xl border border-border p-8 text-center">
            <p className="text-text-muted">Hôm nay không có trận đấu nào được phát sóng.</p>
            <Link href="/hom-nay" className="text-accent text-sm mt-2 inline-block hover:underline">
              Xem tất cả trận đấu hôm nay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedSlots.map(([slot, matches]) => (
              <div key={slot}>
                <h2 className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {slot}
                </h2>
                <div className="space-y-2">
                  {matches
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((match) => {
                      const league = LEAGUES.find((l) => l.code === match.competition.code);
                      const channels = TV_CHANNELS[match.competition.code] || [];

                      return (
                        <Link
                          key={match.id}
                          href={`/match/${match.id}`}
                          className="block bg-bg-card rounded-xl border border-border p-3 md:p-4 hover:border-accent/30 transition-colors"
                        >
                          {/* League + Time row */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {league && (
                                <span className="text-[10px] text-text-muted">
                                  {league.flag} {league.name}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {(match.status === "IN_PLAY" || match.status === "LIVE") && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              )}
                              <span className="text-sm font-bold text-accent">{match.time}</span>
                            </div>
                          </div>

                          {/* Teams row */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <img
                                src={match.homeTeam.crest}
                                alt=""
                                className="w-6 h-6 object-contain shrink-0"
                              />
                              <span className="text-sm font-medium truncate">
                                {match.homeTeam.shortName}
                              </span>
                            </div>
                            <span className="text-xs text-text-muted px-2 shrink-0">vs</span>
                            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                              <span className="text-sm font-medium truncate text-right">
                                {match.awayTeam.shortName}
                              </span>
                              <img
                                src={match.awayTeam.crest}
                                alt=""
                                className="w-6 h-6 object-contain shrink-0"
                              />
                            </div>
                          </div>

                          {/* TV Channels */}
                          {channels.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {channels.map((ch) => (
                                <span
                                  key={ch.channel}
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ch.color}`}
                                >
                                  {ch.channel}
                                </span>
                              ))}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SEO content */}
        <div className="mt-10 bg-bg-card rounded-2xl border border-border p-5 md:p-6 space-y-4">
          <h2 className="font-bold text-base">Xem bóng đá trên kênh nào tại Việt Nam?</h2>
          <div className="text-sm text-text-secondary space-y-3 leading-relaxed">
            <p>
              Tại Việt Nam, các trận bóng đá lớn được phát sóng trên nhiều kênh truyền hình và nền
              tảng OTT khác nhau. Dưới đây là tổng hợp các kênh phát sóng chính:
            </p>
            <ul className="space-y-2 pl-4">
              <li className="list-disc">
                <strong>K+</strong> — Kênh truyền hình trả phí sở hữu bản quyền Premier League,
                phát sóng tất cả trận đấu Ngoại hạng Anh tại Việt Nam.
              </li>
              <li className="list-disc">
                <strong>FPT Play</strong> — Nền tảng OTT phát sóng Champions League, Europa League,
                Premier League, V-League và nhiều giải đấu quốc tế.
              </li>
              <li className="list-disc">
                <strong>VTV</strong> — Kênh truyền hình quốc gia phát sóng World Cup, Euro, và các
                trận đấu lớn của đội tuyển Việt Nam.
              </li>
              <li className="list-disc">
                <strong>VTV Cab / On Sports</strong> — Phát sóng La Liga, Bundesliga, Ligue 1
                và nhiều giải đấu châu Âu khác.
              </li>
              <li className="list-disc">
                <strong>VTV5</strong> — Kênh chính phát sóng V-League và các giải bóng đá trong
                nước.
              </li>
            </ul>
            <p>
              Lịch phát sóng có thể thay đổi theo mùa giải và thỏa thuận bản quyền. Vui lòng kiểm
              tra lại trước giờ thi đấu để cập nhật thông tin chính xác nhất.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
