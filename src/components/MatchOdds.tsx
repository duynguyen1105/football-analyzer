"use client";

import { useMatchOdds } from "@/lib/hooks";
import { MatchOdds as MatchOddsType } from "@/lib/types";

export function MatchOdds({ matchId }: { matchId: string }) {
  const { data, isLoading } = useMatchOdds(matchId);

  if (isLoading) {
    return (
      <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
        <div className="h-4 w-32 bg-border/30 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-12 bg-border/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  const odds = data as MatchOddsType | null;
  if (!odds || !odds.bookmakers || odds.bookmakers.length === 0) return null;

  // Find Match Winner (bet id 1) and Over/Under (bet id 5) from each bookmaker
  const matchWinnerRows = odds.bookmakers
    .map((b) => {
      const matchWinner = b.bets.find(
        (bet) => bet.name === "Match Winner" || bet.name === "Home/Away"
      );
      if (!matchWinner) return null;
      const home = matchWinner.values.find((v) => v.value === "Home");
      const draw = matchWinner.values.find((v) => v.value === "Draw");
      const away = matchWinner.values.find((v) => v.value === "Away");
      return { bookmaker: b.name, home: home?.odd, draw: draw?.odd, away: away?.odd };
    })
    .filter(Boolean)
    .slice(0, 3);

  if (matchWinnerRows.length === 0) return null;

  return (
    <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <h3 className="font-bold text-sm mb-3 md:mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />
        Tỷ lệ kèo
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs md:text-sm">
          <thead>
            <tr className="text-text-muted">
              <th className="text-left py-2 px-2">Nhà cái</th>
              <th className="text-center py-2 px-2">Thắng nhà</th>
              <th className="text-center py-2 px-2">Hòa</th>
              <th className="text-center py-2 px-2">Thắng khách</th>
            </tr>
          </thead>
          <tbody>
            {matchWinnerRows.map((row) => (
              <tr key={row!.bookmaker} className="border-t border-border/30">
                <td className="py-2 px-2 text-text-secondary font-medium">{row!.bookmaker}</td>
                <td className="py-2 px-2 text-center">
                  <span className="inline-block bg-accent/10 text-accent font-bold px-2 py-0.5 rounded">
                    {row!.home ?? "-"}
                  </span>
                </td>
                <td className="py-2 px-2 text-center">
                  <span className="inline-block bg-accent-yellow/10 text-accent-yellow font-bold px-2 py-0.5 rounded">
                    {row!.draw ?? "-"}
                  </span>
                </td>
                <td className="py-2 px-2 text-center">
                  <span className="inline-block bg-accent-2/10 text-accent-2 font-bold px-2 py-0.5 rounded">
                    {row!.away ?? "-"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-text-muted mt-3">
        Tỷ lệ kèo chỉ mang tính chất tham khảo. Cập nhật mỗi giờ.
      </p>
    </section>
  );
}
