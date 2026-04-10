import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { getRecentTransfers, LeagueTransfer } from "@/lib/football-data";
import { LEAGUES } from "@/lib/constants";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tin Chuyển Nhượng Mới Nhất — Mùa Giải 2025/26",
  description:
    "Tin chuyển nhượng bóng đá mới nhất. Cập nhật chuyển nhượng Premier League, La Liga, Serie A, Bundesliga.",
  keywords: [
    "chuyển nhượng bóng đá",
    "tin chuyển nhượng",
    "chuyển nhượng mới nhất",
    "chuyển nhượng Premier League",
    "chuyển nhượng La Liga",
  ],
};

export const revalidate = 3600;

// Top 5 leagues for transfers (excluding tournaments)
const TRANSFER_LEAGUES = LEAGUES.filter(
  (l) => !l.isTournament && l.code !== "VL",
);

function formatTransferDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function getTransferTypeLabel(type: string): { label: string; color: string } {
  const lower = type.toLowerCase();
  if (lower === "free") return { label: "Miễn phí", color: "bg-green-500/15 text-green-400" };
  if (lower === "loan") return { label: "Cho mượn", color: "bg-blue-500/15 text-blue-400" };
  if (lower.includes("end")) return { label: "Hết hạn", color: "bg-yellow-500/15 text-yellow-400" };
  if (lower === "n/a" || !type) return { label: "Chuyển nhượng", color: "bg-accent/15 text-accent" };
  return { label: type, color: "bg-accent/15 text-accent" };
}

export default async function ChuyenNhuongPage() {
  // Fetch transfers from top 5 leagues in parallel
  const results = await Promise.allSettled(
    TRANSFER_LEAGUES.map((l) => getRecentTransfers(l.id)),
  );

  const transfersByLeague: { league: typeof TRANSFER_LEAGUES[0]; transfers: LeagueTransfer[] }[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value.length > 0) {
      transfersByLeague.push({ league: TRANSFER_LEAGUES[i], transfers: r.value.slice(0, 15) });
    }
  });

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-3 py-6">
        <h1 className="text-xl md:text-2xl font-bold mb-1">
          Tin Chuyển Nhượng Mới Nhất
        </h1>
        <p className="text-sm text-text-muted mb-6">
          Cập nhật chuyển nhượng mùa giải 2025/26 từ 5 giải đấu hàng đầu châu Âu
        </p>

        {transfersByLeague.length === 0 ? (
          <div className="bg-bg-card rounded-2xl border border-border p-8 text-center">
            <p className="text-text-muted">Chưa có dữ liệu chuyển nhượng.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {transfersByLeague.map(({ league, transfers }) => (
              <section key={league.code}>
                <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                  <img src={league.logo} alt="" className="w-5 h-5 object-contain" />
                  {league.flag} {league.name}
                </h2>
                <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="divide-y divide-border/30">
                    {transfers.map((t, i) => {
                      const typeInfo = getTransferTypeLabel(t.type);
                      return (
                        <div
                          key={`${t.player.id}-${i}`}
                          className="p-3 md:p-4 hover:bg-bg-primary/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {/* Player photo */}
                            <Link
                              href={`/cau-thu/${t.player.id}`}
                              className="shrink-0 hover:opacity-80 transition-opacity"
                            >
                              {t.player.photo ? (
                                <img
                                  src={t.player.photo}
                                  alt=""
                                  className="w-10 h-10 rounded-full object-cover bg-border/20"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-border/20 flex items-center justify-center text-sm">
                                  ?
                                </div>
                              )}
                            </Link>

                            {/* Player info + transfer details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                  href={`/cau-thu/${t.player.id}`}
                                  className="text-sm font-semibold hover:text-accent transition-colors truncate"
                                >
                                  {t.player.name}
                                </Link>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeInfo.color}`}
                                >
                                  {typeInfo.label}
                                </span>
                              </div>

                              {/* From -> To */}
                              <div className="flex items-center gap-1.5 mt-1 text-xs text-text-secondary">
                                <div className="flex items-center gap-1 min-w-0">
                                  {t.teamOut.logo && (
                                    <img
                                      src={t.teamOut.logo}
                                      alt=""
                                      className="w-4 h-4 object-contain shrink-0"
                                    />
                                  )}
                                  <span className="truncate">{t.teamOut.name || "—"}</span>
                                </div>
                                <svg
                                  className="w-3 h-3 text-text-muted shrink-0"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                  />
                                </svg>
                                <div className="flex items-center gap-1 min-w-0">
                                  {t.teamIn.logo && (
                                    <img
                                      src={t.teamIn.logo}
                                      alt=""
                                      className="w-4 h-4 object-contain shrink-0"
                                    />
                                  )}
                                  <span className="truncate font-medium">{t.teamIn.name || "—"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Date */}
                            <div className="text-[10px] md:text-xs text-text-muted shrink-0 text-right">
                              {formatTransferDate(t.date)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}

        {/* SEO content */}
        <div className="mt-10 bg-bg-card rounded-2xl border border-border p-5 md:p-6 space-y-4">
          <h2 className="font-bold text-base">Tin chuyển nhượng bóng đá châu Âu</h2>
          <div className="text-sm text-text-secondary space-y-3 leading-relaxed">
            <p>
              Theo dõi những chuyển nhượng mới nhất từ 5 giải vô địch quốc gia hàng đầu châu Âu
              bao gồm Premier League (Anh), La Liga (Tây Ban Nha), Serie A (Ý), Bundesliga (Đức)
              và Ligue 1 (Pháp).
            </p>
            <p>
              Dữ liệu chuyển nhượng được cập nhật tự động, bao gồm các thông tin về cầu thủ
              chuyển đến, đội bóng cũ và mới, hình thức chuyển nhượng (mua đứt, cho mượn, miễn phí)
              và ngày hoàn tất thương vụ.
            </p>
            <p>
              Bấm vào tên cầu thủ để xem thống kê chi tiết, lịch sử chuyển nhượng và thành tích
              thi đấu.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
