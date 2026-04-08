import { NextRequest } from "next/server";
import { getMatches, getStandings } from "@/lib/football-data";
import { computePrediction } from "@/lib/prediction";
import { setCached, getCached } from "@/lib/cache";
import { LEAGUES } from "@/lib/constants";
import { Match, Standing } from "@/lib/types";

// ---------------------------------------------------------------------------
// Date helpers (GMT+7)
// ---------------------------------------------------------------------------
function getVietnamDate(offsetDays = 0): string {
  const now = new Date();
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  vnTime.setUTCDate(vnTime.getUTCDate() + offsetDays);
  return vnTime.toISOString().slice(0, 10);
}

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
// Build match paragraph — natural Vietnamese analysis style
// ---------------------------------------------------------------------------
function buildMatchParagraph(
  match: Match,
  homeStanding: Standing | null,
  awayStanding: Standing | null,
  prediction: { homeWin: number; draw: number; awayWin: number; btts: number; over25: number }
): string {
  const lines: string[] = [];

  // Opening line with team names and time
  lines.push(
    `### ${match.homeTeam.shortName} vs ${match.awayTeam.shortName} (${match.time})`
  );
  lines.push("");

  // Standings context
  if (homeStanding && awayStanding) {
    lines.push(
      `Dựa trên thống kê mùa giải, **${match.homeTeam.shortName}** đang xếp thứ ${homeStanding.position} với ${homeStanding.points} điểm (${homeStanding.won}T-${homeStanding.draw}H-${homeStanding.lost}B), ` +
        `trong khi **${match.awayTeam.shortName}** đứng vị trí ${awayStanding.position} với ${awayStanding.points} điểm (${awayStanding.won}T-${awayStanding.draw}H-${awayStanding.lost}B).`
    );
  }

  // Form analysis
  if (match.homeForm.length > 0) {
    lines.push(
      `Với phong độ hiện tại, đội chủ nhà có ${describeForm(match.homeForm)} (${formToString(match.homeForm)}).`
    );
  }
  if (match.awayForm.length > 0) {
    lines.push(
      `Đội khách đang có ${describeForm(match.awayForm)} (${formToString(match.awayForm)}).`
    );
  }

  // Prediction
  const favorite =
    prediction.homeWin > prediction.awayWin
      ? match.homeTeam.shortName
      : prediction.awayWin > prediction.homeWin
        ? match.awayTeam.shortName
        : null;

  if (favorite) {
    const pct = Math.max(prediction.homeWin, prediction.awayWin);
    lines.push(
      `Đội chủ nhà đang có chuỗi lợi thế sân nhà, mô hình dự đoán nghiêng về **${favorite}** với ${pct}% cơ hội chiến thắng. Tỷ lệ hòa: ${prediction.draw}%. Khả năng cả hai đội ghi bàn (BTTS): ${prediction.btts}%.`
    );
  } else {
    lines.push(
      `Đây là trận đấu cân bằng với tỷ lệ: Thắng nhà ${prediction.homeWin}% — Hòa ${prediction.draw}% — Thắng khách ${prediction.awayWin}%.`
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

async function generateBlogPosts() {

  try {
    const tomorrow = getVietnamDate(1);
    const dayAfter = getVietnamDate(2);
    const matches = await getMatches(tomorrow, dayAfter);

    // Filter to scheduled matches only
    const scheduled = matches.filter(
      (m) => m.status === "SCHEDULED" || m.status === "TIMED" || m.status === "NS"
    );

    // Group by league
    const byLeague = new Map<string, Match[]>();
    for (const m of scheduled) {
      const code = m.competition.code;
      if (!byLeague.has(code)) byLeague.set(code, []);
      byLeague.get(code)!.push(m);
    }

    // Load standings for relevant leagues
    const standingsMap = new Map<string, Standing[]>();
    await Promise.all(
      [...byLeague.keys()].map(async (code) => {
        standingsMap.set(code, await getStandings(code));
      })
    );

    const generatedSlugs: string[] = [];
    const TTL_30_DAYS = 30 * 24 * 60 * 60;

    for (const [code, leagueMatches] of byLeague) {
      if (leagueMatches.length < 3) continue;

      const league = LEAGUES.find((l) => l.code === code);
      if (!league) continue;

      const standings = standingsMap.get(code) ?? [];
      const round = extractRound(leagueMatches);
      const dateLabel = formatVietnameseDate(tomorrow);
      const roundLabel = round ? ` vòng ${round}` : "";

      const title = `Nhận định ${league.name}${roundLabel} — ${dateLabel}`;
      const description = `Phân tích và dự đoán ${leagueMatches.length} trận đấu ${league.name}${roundLabel}. Tỷ lệ kèo, phong độ, và thống kê chi tiết.`;

      const matchSections = leagueMatches.map((match) => {
        const homeSt = standings.find((s) => s.team.id === match.homeTeam.id) ?? null;
        const awaySt = standings.find((s) => s.team.id === match.awayTeam.id) ?? null;
        const prediction = computePrediction(homeSt, awaySt);
        return buildMatchParagraph(match, homeSt, awaySt, prediction);
      });

      const tags = [
        slugify(league.name),
        "nhan-dinh",
        round ? `vong-${round}` : "",
      ].filter(Boolean);

      const slug = slugify(`nhan-dinh-${league.name}${roundLabel}-${tomorrow}`);

      const body = `## Tổng quan ${league.name}${roundLabel}\n\n${league.name}${roundLabel} có tổng cộng ${leagueMatches.length} trận đấu đáng chú ý. Dưới đây là nhận định chi tiết từng cặp đấu dựa trên thống kê mùa giải, phong độ gần đây và mô hình dự đoán Poisson.\n\n${matchSections.join("\n---\n\n")}\n## Kết luận\n\nHãy theo dõi nhận định chi tiết từng trận đấu trên [trang chủ](https://nhandinhbongdavn.com) để cập nhật thông tin mới nhất trước giờ bóng lăn.`;

      // Store post as JSON in Redis (works on serverless)
      const post = { slug, title, description, date: tomorrow, author: "MatchDay Analyst", tags, image: "/icons/icon-512.png", body };
      await setCached(`blog:post:${slug}`, JSON.stringify(post), TTL_30_DAYS);
      generatedSlugs.push(slug);
    }

    // Update the blog index in Redis
    const existingIndex = await getCached("blog:index");
    const existingSlugs: string[] = existingIndex ? JSON.parse(existingIndex) : [];
    const mergedSlugs = [...new Set([...existingSlugs, ...generatedSlugs])];
    await setCached("blog:index", JSON.stringify(mergedSlugs), TTL_30_DAYS);

    return Response.json({
      success: true,
      generated: generatedSlugs,
      dateRange: `${tomorrow} — ${dayAfter}`,
      totalMatches: scheduled.length,
      leaguesProcessed: byLeague.size,
    });
  } catch (error) {
    console.error("Auto-blog generation error:", error);
    return Response.json(
      { error: "Không thể tạo bài viết tự động" },
      { status: 500 }
    );
  }
}
