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

      const tags = [
        slugify(league.name),
        "nhan-dinh",
        round ? `vong-${round}` : "",
      ].filter(Boolean);

      const slug = slugify(`nhan-dinh-${league.name}${roundLabel}-${tomorrow}`);

      // Generate league header image URL
      const baseUrl = "https://nhandinhbongdavn.com";
      const leagueImageParams = new URLSearchParams({
        type: "league", league: league.name, leagueLogo: league.logo,
        matchCount: String(leagueMatches.length), round: round || "",
      });
      const leagueImageUrl = `${baseUrl}/api/blog-image?${leagueImageParams}`;

      // Generate match preview images in the article body
      const matchImagesAndSections = leagueMatches.map((match, i) => {
        const homeSt = standings.find((s) => s.team.id === match.homeTeam.id) ?? null;
        const awaySt = standings.find((s) => s.team.id === match.awayTeam.id) ?? null;
        const prediction = computePrediction(homeSt, awaySt);
        const imgParams = new URLSearchParams({
          type: "match", home: match.homeTeam.shortName, away: match.awayTeam.shortName,
          homeCrest: match.homeTeam.crest, awayCrest: match.awayTeam.crest,
          league: league.name, time: match.time, date: match.date,
          homeWin: String(prediction.homeWin), draw: String(prediction.draw), awayWin: String(prediction.awayWin),
          venue: match.venue || "",
        });
        const matchImgUrl = `${baseUrl}/api/blog-image?${imgParams}`;
        const paragraph = buildMatchParagraph(match, homeSt, awaySt, prediction, i);
        return `![${match.homeTeam.shortName} vs ${match.awayTeam.shortName}](${matchImgUrl})\n\n${paragraph}`;
      });

      const body = `![${league.name}${roundLabel}](${leagueImageUrl})\n\n## Tổng quan ${league.name}${roundLabel}\n\n${league.name}${roundLabel} có tổng cộng ${leagueMatches.length} trận đấu đáng chú ý. Dưới đây là nhận định chi tiết từng cặp đấu dựa trên thống kê mùa giải, phong độ gần đây và mô hình dự đoán Poisson.\n\n${matchImagesAndSections.join("\n---\n\n")}\n## Kết luận\n\nHãy theo dõi nhận định chi tiết từng trận đấu trên [trang chủ](https://nhandinhbongdavn.com) để cập nhật thông tin mới nhất trước giờ bóng lăn.`;

      // Store post as JSON in Redis (works on serverless)
      const post = { slug, title, description, date: tomorrow, author: "MatchDay Analyst", tags, image: leagueImageUrl, body };
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
