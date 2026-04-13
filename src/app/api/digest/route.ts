import { getMatches, getStandings } from "@/lib/football-data";
import { computePrediction } from "@/lib/prediction";
import { LEAGUES } from "@/lib/constants";
import { Match, Standing } from "@/lib/types";
import { getVietnamDate, getVietnamNow } from "@/lib/timezone";

/** Find the next Saturday & Sunday (or today if already Sat/Sun) */
function getNextWeekendDates(): { saturday: string; sunday: string } {
  const vnTime = getVietnamNow();
  const dayOfWeek = vnTime.getUTCDay(); // 0=Sun, 6=Sat

  let daysToSaturday: number;
  if (dayOfWeek === 6) daysToSaturday = 0;
  else if (dayOfWeek === 0) daysToSaturday = 6;
  else daysToSaturday = 6 - dayOfWeek;

  const saturday = getVietnamDate(daysToSaturday);
  const sunday = getVietnamDate(daysToSaturday + 1);
  return { saturday, sunday };
}

// ---------------------------------------------------------------------------
// Priority score for matches (higher = more important)
// ---------------------------------------------------------------------------
function matchPriority(m: Match): number {
  const leagueOrder: Record<string, number> = {
    CL: 100, WC: 100, PL: 90, PD: 80, SA: 70, BL1: 60, FL1: 50, VL: 40,
  };
  return leagueOrder[m.competition.code] ?? 10;
}

// ---------------------------------------------------------------------------
// Build HTML email
// ---------------------------------------------------------------------------
interface MatchWithPrediction {
  match: Match;
  prediction: { homeWin: number; draw: number; awayWin: number; btts: number; over25: number };
}

function buildDigestHtml(matches: MatchWithPrediction[], saturday: string, sunday: string): string {
  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  const matchRows = matches
    .map((mw) => {
      const { match: m, prediction: p } = mw;
      const leagueInfo = LEAGUES.find((l) => l.code === m.competition.code);
      const flag = leagueInfo?.flag ?? "";

      return `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #1e293b;">
          <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">
            ${flag} ${m.competition.name} &middot; ${m.date} &middot; ${m.time}
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
            <tr>
              <td width="40%" style="text-align: right; padding-right: 12px;">
                <img src="${m.homeTeam.crest}" alt="" width="28" height="28" style="vertical-align: middle; margin-right: 8px;" />
                <span style="color: #f8fafc; font-size: 15px; font-weight: 600;">${m.homeTeam.shortName}</span>
              </td>
              <td width="20%" style="text-align: center; color: #64748b; font-size: 13px;">vs</td>
              <td width="40%" style="padding-left: 12px;">
                <span style="color: #f8fafc; font-size: 15px; font-weight: 600;">${m.awayTeam.shortName}</span>
                <img src="${m.awayTeam.crest}" alt="" width="28" height="28" style="vertical-align: middle; margin-left: 8px;" />
              </td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="33%" style="text-align: center;">
                <div style="background: #1e293b; border-radius: 6px; padding: 6px 8px;">
                  <div style="color: #94a3b8; font-size: 10px; text-transform: uppercase;">Thắng nhà</div>
                  <div style="color: #22c55e; font-size: 16px; font-weight: 700;">${p.homeWin}%</div>
                </div>
              </td>
              <td width="33%" style="text-align: center; padding: 0 4px;">
                <div style="background: #1e293b; border-radius: 6px; padding: 6px 8px;">
                  <div style="color: #94a3b8; font-size: 10px; text-transform: uppercase;">Hòa</div>
                  <div style="color: #facc15; font-size: 16px; font-weight: 700;">${p.draw}%</div>
                </div>
              </td>
              <td width="33%" style="text-align: center;">
                <div style="background: #1e293b; border-radius: 6px; padding: 6px 8px;">
                  <div style="color: #94a3b8; font-size: 10px; text-transform: uppercase;">Thắng khách</div>
                  <div style="color: #3b82f6; font-size: 16px; font-weight: 700;">${p.awayWin}%</div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nhận Định Bóng Đá Cuối Tuần</title>
</head>
<body style="margin: 0; padding: 0; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #020617;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
              <div style="font-size: 28px; margin-bottom: 8px;">⚽</div>
              <h1 style="margin: 0; color: #f8fafc; font-size: 22px; font-weight: 700;">
                Nhận Định Bóng Đá Cuối Tuần
              </h1>
              <p style="margin: 8px 0 0; color: #c7d2fe; font-size: 14px;">
                ${formatDate(saturday)} — ${formatDate(sunday)}
              </p>
            </td>
          </tr>

          <!-- Matches -->
          <tr>
            <td style="padding: 24px;">
              <h2 style="margin: 0 0 16px; color: #f8fafc; font-size: 16px; font-weight: 600;">
                🔥 Top trận đấu đáng chú ý
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${matchRows || `
                <tr>
                  <td style="padding: 24px; text-align: center; color: #94a3b8;">
                    Chưa có trận đấu nào cuối tuần này.
                  </td>
                </tr>`}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 0 24px 24px; text-align: center;">
              <a href="https://nhandinhbongdavn.com" style="display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                Xem chi tiết trên website
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #020617; padding: 24px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">
                Nhận Định Bóng Đá VN &mdash; nhandinhbongdavn.com
              </p>
              <a href="{{UNSUBSCRIBE_URL}}" style="color: #475569; font-size: 12px; text-decoration: underline;">
                Hủy đăng ký nhận bản tin
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// GET handler — generates the weekly digest HTML
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const { saturday, sunday } = getNextWeekendDates();
    const matches = await getMatches(saturday, sunday);

    // Filter to scheduled matches, sort by priority, take top 5
    const scheduled = matches.filter(
      (m) => m.status === "SCHEDULED" || m.status === "TIMED" || m.status === "NS"
    );
    scheduled.sort((a, b) => matchPriority(b) - matchPriority(a));
    const topMatches = scheduled.slice(0, 5);

    // Load standings for predictions
    const standingsMap = new Map<string, Standing[]>();
    const codes = [...new Set(topMatches.map((m) => m.competition.code))];
    await Promise.all(
      codes.map(async (code) => {
        const standings = await getStandings(code);
        standingsMap.set(code, standings);
      })
    );

    // Compute predictions
    const matchesWithPredictions: MatchWithPrediction[] = topMatches.map((m) => {
      const standings = standingsMap.get(m.competition.code) ?? [];
      const homeSt = standings.find((s) => s.team.id === m.homeTeam.id) ?? null;
      const awaySt = standings.find((s) => s.team.id === m.awayTeam.id) ?? null;
      return { match: m, prediction: computePrediction(homeSt, awaySt) };
    });

    const html = buildDigestHtml(matchesWithPredictions, saturday, sunday);

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Digest generation error:", error);
    return Response.json({ error: "Không thể tạo bản tin" }, { status: 500 });
  }
}
