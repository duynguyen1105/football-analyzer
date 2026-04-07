import { getMatches, getStandings } from "@/lib/football-data";
import { computePrediction } from "@/lib/prediction";
import { LEAGUES } from "@/lib/constants";
import { Match, Standing } from "@/lib/types";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ---------------------------------------------------------------------------
// Telegram send helper
// ---------------------------------------------------------------------------
async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  parseMode: "HTML" | "MarkdownV2" | undefined = undefined
): Promise<void> {
  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is not set");
    return;
  }
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...(parseMode ? { parse_mode: parseMode } : {}),
    }),
  });
}

// ---------------------------------------------------------------------------
// Date helpers (GMT+7)
// ---------------------------------------------------------------------------
function getVietnamDate(offsetDays = 0): string {
  const now = new Date();
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  vnTime.setUTCDate(vnTime.getUTCDate() + offsetDays);
  return vnTime.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Command: /homnay — Today's matches
// ---------------------------------------------------------------------------
function formatMatchList(matches: Match[]): string {
  if (matches.length === 0) {
    return "Hôm nay không có trận đấu nào.";
  }

  // Group by competition
  const grouped = new Map<string, Match[]>();
  for (const m of matches) {
    const key = m.competition.name;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(m);
  }

  const league = (code: string) =>
    LEAGUES.find((l) => l.code === code);

  let text = "⚽ Trận đấu hôm nay:\n";
  for (const [compName, compMatches] of grouped) {
    const leagueInfo = league(compMatches[0].competition.code);
    const flag = leagueInfo?.flag ?? "🏆";
    text += `\n${flag} ${compName}:\n`;
    for (const m of compMatches) {
      if (m.status === "FINISHED" && m.score) {
        text += `  ${m.homeTeam.shortName} ${m.score.home} - ${m.score.away} ${m.awayTeam.shortName} (KT)\n`;
      } else if (m.status === "LIVE" && m.score) {
        text += `  ${m.homeTeam.shortName} ${m.score.home} - ${m.score.away} ${m.awayTeam.shortName} (LIVE)\n`;
      } else {
        text += `  ${m.homeTeam.shortName} vs ${m.awayTeam.shortName} - ${m.time}\n`;
      }
    }
  }
  return text;
}

// ---------------------------------------------------------------------------
// Command: /soikeo — Today's predictions
// ---------------------------------------------------------------------------
async function formatPredictions(matches: Match[]): Promise<string> {
  const scheduled = matches.filter(
    (m) => m.status === "SCHEDULED" || m.status === "TIMED" || m.status === "NS"
  );
  if (scheduled.length === 0) {
    return "Không có trận đấu nào cần soi kèo hôm nay.";
  }

  // Load standings for each unique competition
  const standingsMap = new Map<string, Standing[]>();
  const codes = [...new Set(scheduled.map((m) => m.competition.code))];
  await Promise.all(
    codes.map(async (code) => {
      const standings = await getStandings(code);
      standingsMap.set(code, standings);
    })
  );

  let text = "📊 Soi kèo hôm nay:\n";
  for (const m of scheduled) {
    const standings = standingsMap.get(m.competition.code) ?? [];
    const homeSt = standings.find((s) => s.team.id === m.homeTeam.id) ?? null;
    const awaySt = standings.find((s) => s.team.id === m.awayTeam.id) ?? null;
    const pred = computePrediction(homeSt, awaySt);

    text += `\n${m.homeTeam.shortName} vs ${m.awayTeam.shortName} (${m.time}):\n`;
    text += `  Thắng nhà: ${pred.homeWin}% | Hòa: ${pred.draw}% | Thắng khách: ${pred.awayWin}%\n`;
    text += `  BTTS: ${pred.btts}% | Trên 2.5: ${pred.over25}%\n`;
  }
  return text;
}

// ---------------------------------------------------------------------------
// Command: /bangxephang — Standings table
// ---------------------------------------------------------------------------
function formatStandings(standings: Standing[], leagueName: string): string {
  if (standings.length === 0) {
    return `Không có dữ liệu bảng xếp hạng cho ${leagueName}.`;
  }

  let text = `🏆 ${leagueName}:\n\n`;
  text += `Hạng | Đội              | Đ  | T  | H  | B  | HS  | Đ\n`;
  text += `-----+------------------+----+----+----+----+-----+---\n`;
  for (const s of standings.slice(0, 20)) {
    const pos = String(s.position).padStart(4);
    const team = s.team.tla.padEnd(18);
    const played = String(s.playedGames).padStart(2);
    const won = String(s.won).padStart(2);
    const draw = String(s.draw).padStart(2);
    const lost = String(s.lost).padStart(2);
    const gd = (s.goalDifference >= 0 ? `+${s.goalDifference}` : `${s.goalDifference}`).padStart(4);
    const pts = String(s.points).padStart(2);
    text += `${pos} | ${team} | ${played} | ${won} | ${draw} | ${lost} | ${gd} | ${pts}\n`;
  }
  return text;
}

// ---------------------------------------------------------------------------
// Parse league code from /bangxephang argument
// ---------------------------------------------------------------------------
function parseLeagueCode(text: string): { code: string; name: string } {
  const arg = text.replace("/bangxephang", "").trim().toUpperCase();
  const league = arg
    ? LEAGUES.find((l) => l.code === arg || l.name.toUpperCase().includes(arg))
    : LEAGUES[0]; // Default: Premier League
  return {
    code: league?.code ?? "PL",
    name: league?.name ?? "Premier League",
  };
}

// ---------------------------------------------------------------------------
// POST handler — Telegram webhook
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  if (!BOT_TOKEN) {
    return Response.json({ error: "Bot token not configured" }, { status: 500 });
  }

  try {
    const update = await request.json();
    const message = update?.message;
    if (!message?.text) {
      return Response.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const command = text.split(" ")[0].split("@")[0]; // Handle /cmd@BotName

    switch (command) {
      case "/start": {
        await sendTelegramMessage(
          chatId,
          "Chào mừng bạn đến với MatchDay Analyst Bot! 🎉\n\n" +
            "Các lệnh:\n" +
            "/homnay - Trận đấu hôm nay\n" +
            "/soikeo - Soi kèo hôm nay\n" +
            "/bangxephang [league] - Bảng xếp hạng"
        );
        break;
      }

      case "/homnay": {
        const today = getVietnamDate();
        const matches = await getMatches(today, today);
        const reply = formatMatchList(matches);
        await sendTelegramMessage(chatId, reply);
        break;
      }

      case "/soikeo": {
        const today = getVietnamDate();
        const matches = await getMatches(today, today);
        const reply = await formatPredictions(matches);
        await sendTelegramMessage(chatId, reply);
        break;
      }

      case "/bangxephang": {
        const { code, name } = parseLeagueCode(text);
        const standings = await getStandings(code);
        const reply = formatStandings(standings, name);
        await sendTelegramMessage(chatId, reply);
        break;
      }

      default: {
        await sendTelegramMessage(
          chatId,
          "Lệnh không hợp lệ. Gõ /start để xem danh sách lệnh."
        );
        break;
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return Response.json({ ok: true }); // Always 200 so Telegram doesn't retry
  }
}
