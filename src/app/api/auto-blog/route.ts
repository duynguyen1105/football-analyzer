import { NextRequest } from "next/server";
import { getMatches, getStandings } from "@/lib/football-data";
import { computePrediction } from "@/lib/prediction";
import { setCached, getCached } from "@/lib/cache";
import { LEAGUES } from "@/lib/constants";
import { Match, Standing } from "@/lib/types";
import { getVietnamDate, getVietnamNow } from "@/lib/timezone";

// Allow up to 60s for this endpoint (fetches multiple leagues)
export const maxDuration = 60;

function formatVietnameseDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Turn a Vietnamese string into a URL-safe slug */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------------
// Form description helpers — natural Vietnamese phrases
// ---------------------------------------------------------------------------
function describeForm(form: string[]): string {
  const last5 = form.slice(0, 5);
  const wins = last5.filter((r) => r === "W").length;
  const draws = last5.filter((r) => r === "D").length;
  const losses = last5.filter((r) => r === "L").length;

  if (wins >= 4) return "phong độ rất tốt";
  if (wins >= 3) return "phong độ khá ổn định";
  if (losses >= 4) return "phong độ rất kém";
  if (losses >= 3) return "phong độ đáng lo ngại";
  if (draws >= 3) return "phong độ trầm lắng với nhiều trận hòa";
  return `${wins} thắng, ${draws} hòa, ${losses} thua trong 5 trận gần nhất`;
}

function formToString(form: string[]): string {
  return form
    .slice(0, 5)
    .map((r) => (r === "W" ? "T" : r === "D" ? "H" : "B"))
    .join("-");
}

// ---------------------------------------------------------------------------
// Narrative hooks — TrenDuongPitch style openers
// ---------------------------------------------------------------------------
const NARRATIVE_OPENERS = [
  (home: string, away: string) => `Khi **${home}** tiếp đón **${away}**, đây không đơn thuần là một trận đấu — đây là câu chuyện về tham vọng và bản lĩnh.`,
  (home: string, away: string) => `Có những trận đấu bạn xem vì kết quả, có những trận bạn xem vì cảm xúc. **${home}** vs **${away}** thuộc loại thứ hai.`,
  (home: string, away: string) => `Nếu bóng đá là một vở kịch, thì ${home} và ${away} đang viết nên chương hấp dẫn nhất mùa giải.`,
  (home: string, away: string) => `**${home}** bước vào trận đấu với **${away}** mang theo áp lực của cả mùa giải trên vai.`,
  (home: string, away: string) => `Giữa những con số và thống kê, trận **${home}** gặp **${away}** ẩn chứa nhiều câu chuyện hơn bạn nghĩ.`,
  (home: string, away: string) => `Đôi khi, một trận đấu có thể thay đổi cả mùa giải. **${home}** vs **${away}** có tiềm năng trở thành khoảnh khắc đó.`,
];

// ---------------------------------------------------------------------------
// Build match paragraph — narrative storytelling style (TrenDuongPitch-inspired)
// ---------------------------------------------------------------------------
function buildMatchParagraph(
  match: Match,
  homeStanding: Standing | null,
  awayStanding: Standing | null,
  prediction: { homeWin: number; draw: number; awayWin: number; btts: number; over25: number },
  index: number
): string {
  const lines: string[] = [];
  const home = match.homeTeam.shortName;
  const away = match.awayTeam.shortName;

  // Match heading with team crests as images
  lines.push(`### ${home} vs ${away}`);
  lines.push(`*${match.time} · ${match.venue || ""}*`);
  lines.push("");

  // Team crest images side by side
  lines.push(`![${home}](${match.homeTeam.crest})  ![${away}](${match.awayTeam.crest})`);
  lines.push("");

  // Narrative opening — rotate through styles
  const opener = NARRATIVE_OPENERS[index % NARRATIVE_OPENERS.length];
  lines.push(opener(home, away));
  lines.push("");

  // Standings context woven into narrative
  if (homeStanding && awayStanding) {
    const posDiff = Math.abs(homeStanding.position - awayStanding.position);
    if (posDiff <= 3) {
      lines.push(
        `Hai đội đang đứng sát nhau trên bảng xếp hạng — **${home}** ở vị trí ${homeStanding.position} (${homeStanding.points} điểm) và **${away}** ở vị trí ${awayStanding.position} (${awayStanding.points} điểm). Mỗi điểm số đều quý giá.`
      );
    } else if (homeStanding.position < awayStanding.position) {
      lines.push(
        `**${home}** đang ở vị trí ${homeStanding.position} với ${homeStanding.points} điểm, nhìn xuống **${away}** ở hạng ${awayStanding.position}. Nhưng trong bóng đá, khoảng cách trên bảng xếp hạng không đảm bảo điều gì trên sân cỏ.`
      );
    } else {
      lines.push(
        `Dù **${away}** đang xếp trên ở vị trí ${awayStanding.position} (${awayStanding.points} điểm), chuyến làm khách đến sân **${home}** (hạng ${homeStanding.position}, ${homeStanding.points} điểm) chưa bao giờ dễ dàng.`
      );
    }
    lines.push("");
  }

  // Prediction woven naturally
  const favorite =
    prediction.homeWin > prediction.awayWin ? home
    : prediction.awayWin > prediction.homeWin ? away
    : null;

  if (favorite) {
    const pct = Math.max(prediction.homeWin, prediction.awayWin);
    const underdog = favorite === home ? away : home;
    if (pct >= 50) {
      lines.push(
        `Mô hình dự đoán cho **${favorite}** lợi thế rõ rệt với **${pct}%** cơ hội chiến thắng. Tuy nhiên, ${underdog} có thể tạo bất ngờ — bóng đá luôn là vậy.`
      );
    } else {
      lines.push(
        `Đây là trận đấu khó đoán. **${favorite}** nhỉnh hơn chút với ${pct}% theo mô hình, nhưng tỷ lệ hòa ${prediction.draw}% cho thấy mọi kết quả đều có thể xảy ra.`
      );
    }
  } else {
    lines.push(
      `Trận đấu cân bằng tuyệt đối: Thắng nhà ${prediction.homeWin}% — Hòa ${prediction.draw}% — Thắng khách ${prediction.awayWin}%. Khó ai dám đặt cược vào một kết quả cụ thể.`
    );
  }

  // BTTS + Over 2.5 as a color detail
  if (prediction.btts >= 55) {
    lines.push(
      `Với khả năng cả hai đội ghi bàn lên đến **${prediction.btts}%**, đây hứa hẹn là một trận đấu mãn nhãn cho người hâm mộ trung lập.`
    );
  }

  lines.push("");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Extract round number from match round string
// ---------------------------------------------------------------------------
function extractRound(matches: Match[]): string {
  for (const m of matches) {
    if (m.round) {
      const roundMatch = m.round.match(/(\d+)/);
      if (roundMatch) return roundMatch[1];
    }
  }
  return "";
}

// ---------------------------------------------------------------------------
// GET handler — for Vercel Cron (uses CRON_SECRET header)
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get("Authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (process.env.CRON_SECRET && cronSecret !== expected) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return generateBlogPosts();
}

// ---------------------------------------------------------------------------
// POST handler — for manual triggers
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = process.env.AUTO_BLOG_TOKEN;
  if (!token || authHeader !== `Bearer ${token}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return generateBlogPosts();
}

const LEAGUE_PRIORITY: Record<string, number> = { CL: 5, WC: 5, PL: 4, PD: 3, SA: 3, BL1: 2, FL1: 2, VL: 1 };
const TTL_30_DAYS = 30 * 24 * 60 * 60;
const baseUrl = "https://nhandinhbongdavn.com";

async function generateBlogPosts() {
  const tomorrow = getVietnamDate(1);
  const dayAfter = getVietnamDate(2);
  const generatedSlugs: string[] = [];
  const errors: string[] = [];

  let matches: Match[];
  try {
    matches = await getMatches(tomorrow, dayAfter);
  } catch (e) {
    return Response.json({ error: "Failed to fetch matches", detail: String(e) }, { status: 500 });
  }

  const scheduled = matches.filter((m) => m.status === "SCHEDULED" || m.status === "TIMED");
  if (scheduled.length === 0) {
    return Response.json({ success: true, generated: [], message: "No scheduled matches found" });
  }

  // Group by league
  const byLeague = new Map<string, Match[]>();
  for (const m of scheduled) {
    const code = m.competition.code;
    if (!byLeague.has(code)) byLeague.set(code, []);
    byLeague.get(code)!.push(m);
  }

  // --- POST TYPE 1: League matchday previews (top 2 leagues by priority) ---
  const sortedLeagues = [...byLeague.entries()]
    .filter(([, ms]) => ms.length >= 2)
    .sort(([a], [b]) => (LEAGUE_PRIORITY[b] || 0) - (LEAGUE_PRIORITY[a] || 0))
    .slice(0, 2);

  for (const [code, leagueMatches] of sortedLeagues) {
    try {
      const league = LEAGUES.find((l) => l.code === code);
      if (!league) continue;

      const standings = await getStandings(code);
      const round = extractRound(leagueMatches);
      const dateLabel = formatVietnameseDate(tomorrow);
      const roundLabel = round ? ` vòng ${round}` : "";

      const leagueImgUrl = `${baseUrl}/api/blog-image?${new URLSearchParams({
        type: "league", league: league.name, leagueLogo: league.logo,
        matchCount: String(leagueMatches.length), round: round || "",
      })}`;

      const sections = leagueMatches.map((match, i) => {
        const homeSt = standings.find((s) => s.team.id === match.homeTeam.id) ?? null;
        const awaySt = standings.find((s) => s.team.id === match.awayTeam.id) ?? null;
        const prediction = computePrediction(homeSt, awaySt);
        const matchImgUrl = `${baseUrl}/api/blog-image?${new URLSearchParams({
          type: "match", home: match.homeTeam.shortName, away: match.awayTeam.shortName,
          homeCrest: match.homeTeam.crest, awayCrest: match.awayTeam.crest,
          league: league.name, time: match.time, date: match.date,
          homeWin: String(prediction.homeWin), draw: String(prediction.draw), awayWin: String(prediction.awayWin),
        })}`;
        return `![${match.homeTeam.shortName} vs ${match.awayTeam.shortName}](${matchImgUrl})\n\n${buildMatchParagraph(match, homeSt, awaySt, prediction, i)}`;
      });

      const slug = slugify(`nhan-dinh-${league.name}${roundLabel}-${tomorrow}`);
      const post = {
        slug,
        title: `Nhận định ${league.name}${roundLabel} — ${dateLabel}`,
        description: `Phân tích ${leagueMatches.length} trận đấu ${league.name}${roundLabel}. Dự đoán tỷ số chi tiết.`,
        date: tomorrow, author: "MatchDay Analyst",
        tags: [slugify(league.name), "nhan-dinh", round ? `vong-${round}` : ""].filter(Boolean),
        image: leagueImgUrl,
        body: `![${league.name}](${leagueImgUrl})\n\n## Tổng quan ${league.name}${roundLabel}\n\n${leagueMatches.length} trận đấu đáng chú ý. Dưới đây là nhận định chi tiết dựa trên mô hình Poisson.\n\n${sections.join("\n---\n\n")}\n\n## Kết luận\n\nTheo dõi nhận định chi tiết tại [nhandinhbongdavn.com](${baseUrl}).`,
      };
      await setCached(`blog:post:${slug}`, JSON.stringify(post), TTL_30_DAYS);
      generatedSlugs.push(slug);
    } catch (e) {
      errors.push(`League ${code}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // --- POST TYPE 2: "Trận cầu tâm điểm" — deep dive on the biggest match ---
  try {
    const biggestMatch = scheduled
      .map((m) => ({ match: m, priority: LEAGUE_PRIORITY[m.competition.code] || 0 }))
      .sort((a, b) => b.priority - a.priority)[0];

    if (biggestMatch) {
      const m = biggestMatch.match;
      const league = LEAGUES.find((l) => l.code === m.competition.code);
      const standings = await getStandings(m.competition.code);
      const homeSt = standings.find((s) => s.team.id === m.homeTeam.id) ?? null;
      const awaySt = standings.find((s) => s.team.id === m.awayTeam.id) ?? null;
      const prediction = computePrediction(homeSt, awaySt);

      const matchImgUrl = `${baseUrl}/api/blog-image?${new URLSearchParams({
        type: "match", home: m.homeTeam.shortName, away: m.awayTeam.shortName,
        homeCrest: m.homeTeam.crest, awayCrest: m.awayTeam.crest,
        league: league?.name || "", time: m.time, date: m.date,
        homeWin: String(prediction.homeWin), draw: String(prediction.draw), awayWin: String(prediction.awayWin),
      })}`;

      const slug = slugify(`tran-cau-tam-diem-${m.homeTeam.shortName}-vs-${m.awayTeam.shortName}-${tomorrow}`);
      const homePos = homeSt ? `hạng ${homeSt.position} (${homeSt.points} điểm)` : "";
      const awayPos = awaySt ? `hạng ${awaySt.position} (${awaySt.points} điểm)` : "";

      const body = `![${m.homeTeam.shortName} vs ${m.awayTeam.shortName}](${matchImgUrl})

## Trận cầu tâm điểm: ${m.homeTeam.shortName} vs ${m.awayTeam.shortName}

*${league?.name || ""} · ${m.time} · ${m.venue || ""}*

Đây là trận đấu được chờ đợi nhất trong ngày. **${m.homeTeam.shortName}**${homePos ? ` (${homePos})` : ""} tiếp đón **${m.awayTeam.shortName}**${awayPos ? ` (${awayPos})` : ""} trong cuộc đối đầu hứa hẹn nhiều cảm xúc.

${buildMatchParagraph(m, homeSt, awaySt, prediction, 0)}

## Đội hình dự kiến

Cả hai đội đều được kỳ vọng tung ra đội hình mạnh nhất. Xem đội hình dự kiến và phân tích chi tiết tại [trang trận đấu](${baseUrl}/match/${m.id}).

## Dự đoán của chúng tôi

Mô hình Poisson cho kết quả: **${m.homeTeam.shortName} ${prediction.homeWin}%** — Hòa ${prediction.draw}% — **${m.awayTeam.shortName} ${prediction.awayWin}%**

Khả năng cả hai ghi bàn: **${prediction.btts}%** · Trên 2.5 bàn: **${prediction.over25}%**

${prediction.homeWin > prediction.awayWin
  ? `Chúng tôi nghiêng về **${m.homeTeam.shortName}** với lợi thế sân nhà.`
  : prediction.awayWin > prediction.homeWin
    ? `**${m.awayTeam.shortName}** được đánh giá cao hơn trong trận này.`
    : `Trận đấu cực kỳ cân bằng — khó đoán kết quả.`}

---

*Xem nhận định đầy đủ tại [nhandinhbongdavn.com/match/${m.id}](${baseUrl}/match/${m.id})*`;

      const post = {
        slug,
        title: `Trận cầu tâm điểm: ${m.homeTeam.shortName} vs ${m.awayTeam.shortName}`,
        description: `Phân tích chuyên sâu trận ${m.homeTeam.shortName} vs ${m.awayTeam.shortName}. Dự đoán tỷ số, thống kê, đội hình.`,
        date: tomorrow, author: "MatchDay Analyst",
        tags: [slugify(league?.name || ""), slugify(m.homeTeam.shortName), slugify(m.awayTeam.shortName), "tam-diem"],
        image: matchImgUrl, body,
      };
      await setCached(`blog:post:${slug}`, JSON.stringify(post), TTL_30_DAYS);
      generatedSlugs.push(slug);
    }
  } catch (e) {
    errors.push(`Big match: ${e instanceof Error ? e.message : String(e)}`);
  }

  // --- POST TYPE 3: "Soi kèo tổng hợp" — all today's odds in one article ---
  try {
    const todayDate = formatVietnameseDate(tomorrow);
    const slug = slugify(`soi-keo-tong-hop-${tomorrow}`);
    const allSections = scheduled.slice(0, 12).map((m, i) => {
      const league = LEAGUES.find((l) => l.code === m.competition.code);
      return `### ${m.homeTeam.shortName} vs ${m.awayTeam.shortName}\n*${league?.name || ""} · ${m.time}*\n\n![${m.homeTeam.shortName}](${m.homeTeam.crest})  ![${m.awayTeam.shortName}](${m.awayTeam.crest})\n\n[Xem nhận định chi tiết →](${baseUrl}/match/${m.id})`;
    });

    const post = {
      slug,
      title: `Soi kèo tổng hợp ngày ${todayDate}`,
      description: `Tổng hợp soi kèo ${scheduled.length} trận đấu ngày ${todayDate}. Tỷ lệ kèo, dự đoán từ tất cả các giải.`,
      date: tomorrow, author: "MatchDay Analyst",
      tags: ["soi-keo", "tong-hop"],
      image: "/icons/icon-512.png",
      body: `## Soi kèo tổng hợp — ${todayDate}\n\nHôm nay có tổng cộng **${scheduled.length} trận đấu** từ các giải hàng đầu. Dưới đây là danh sách các trận đấu và link phân tích chi tiết.\n\n${allSections.join("\n\n---\n\n")}\n\n---\n\n*Xem tất cả tại [nhandinhbongdavn.com/soi-keo-hom-nay](${baseUrl}/soi-keo-hom-nay)*`,
    };
    await setCached(`blog:post:${slug}`, JSON.stringify(post), TTL_30_DAYS);
    generatedSlugs.push(slug);
  } catch (e) {
    errors.push(`Roundup: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Update blog index
  try {
    const existingIndex = await getCached("blog:index");
    let existingSlugs: string[] = [];
    if (existingIndex) {
      // Upstash may auto-parse JSON values, so guard both shapes
      if (typeof existingIndex === "string") {
        try {
          const parsed = JSON.parse(existingIndex);
          existingSlugs = Array.isArray(parsed) ? parsed : [];
        } catch {
          existingSlugs = [];
        }
      } else if (Array.isArray(existingIndex)) {
        existingSlugs = existingIndex as string[];
      }
    }
    const mergedSlugs = [...new Set([...existingSlugs, ...generatedSlugs])];
    await setCached("blog:index", JSON.stringify(mergedSlugs), TTL_30_DAYS);
  } catch (e) {
    errors.push(`Index: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Store notification for clients to pick up
  if (generatedSlugs.length > 0) {
    try {
      await setCached("blog:latest-notification", JSON.stringify({
        title: `${generatedSlugs.length} bài viết mới`,
        body: `Nhận định mới nhất đã sẵn sàng!`,
        url: "/bai-viet",
        timestamp: Date.now(),
      }), 86400);
    } catch { /* non-critical */ }
  }

  // Record last cron run time for admin dashboard
  try {
    const vnTime = getVietnamNow();
    await setCached("auto-blog:last-run", vnTime.toISOString().replace("T", " ").slice(0, 19) + " (GMT+7)", TTL_30_DAYS);
  } catch { /* non-critical */ }

  return Response.json({
    success: true,
    generated: generatedSlugs,
    errors: errors.length > 0 ? errors : undefined,
    dateRange: `${tomorrow} — ${dayAfter}`,
    totalMatches: scheduled.length,
  });
}
