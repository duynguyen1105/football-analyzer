import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * Generate match preview banner images for blog posts.
 *
 * Usage: /api/blog-image?type=match&home=Arsenal&away=Chelsea&homeCrest=...&awayCrest=...&league=Premier League&time=22:00&homeWin=52&draw=24&awayWin=24
 * Usage: /api/blog-image?type=league&league=Premier League&leagueLogo=...&matchCount=10&round=30
 * Usage: /api/blog-image?type=player&name=Haaland&photo=...&team=Man City&goals=25&assists=5
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") || "match";

  const fontPath = join(process.cwd(), "assets", "Inter-SemiBold.ttf");
  const fontData = await readFile(fontPath);

  if (type === "match") {
    return generateMatchImage(searchParams, fontData);
  } else if (type === "league") {
    return generateLeagueImage(searchParams, fontData);
  } else if (type === "player") {
    return generatePlayerImage(searchParams, fontData);
  }

  return generateMatchImage(searchParams, fontData);
}

function generateMatchImage(params: URLSearchParams, fontData: Buffer) {
  const home = params.get("home") || "Home";
  const away = params.get("away") || "Away";
  const homeCrest = params.get("homeCrest") || "";
  const awayCrest = params.get("awayCrest") || "";
  const league = params.get("league") || "";
  const time = params.get("time") || "";
  const date = params.get("date") || "";
  const homeWin = params.get("homeWin") || "";
  const draw = params.get("draw") || "";
  const awayWin = params.get("awayWin") || "";
  const venue = params.get("venue") || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #0f172a 0%, #1a2744 40%, #0f172a 100%)",
          fontFamily: "Inter",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow effects */}
        <div style={{ position: "absolute", left: 100, top: 80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)", display: "flex" }} />
        <div style={{ position: "absolute", right: 100, top: 80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", display: "flex" }} />

        {/* Top bar: league + time */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, paddingTop: 40 }}>
          <span style={{ fontSize: 18, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2 }}>{league}</span>
          {time && <span style={{ fontSize: 18, color: "#64748b" }}>·</span>}
          {time && <span style={{ fontSize: 18, color: "#94a3b8" }}>{time}</span>}
          {date && <span style={{ fontSize: 18, color: "#64748b" }}>·</span>}
          {date && <span style={{ fontSize: 18, color: "#94a3b8" }}>{date}</span>}
        </div>

        {/* Main: teams vs */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", gap: 60, padding: "0 80px" }}>
          {/* Home */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            {homeCrest && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={homeCrest} width={120} height={120} style={{ objectFit: "contain" }} alt="" />
            )}
            <span style={{ fontSize: 28, color: "#f1f5f9", fontWeight: 600 }}>{home}</span>
          </div>

          {/* VS + predictions */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20, color: "#475569", letterSpacing: 4 }}>NHẬN ĐỊNH</span>
            <span style={{ fontSize: 48, color: "#22c55e", fontWeight: 700 }}>VS</span>
            {homeWin && (
              <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: 24, color: "#22c55e", fontWeight: 700 }}>{homeWin}%</span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Thắng</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: 24, color: "#eab308", fontWeight: 700 }}>{draw}%</span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Hòa</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: 24, color: "#3b82f6", fontWeight: 700 }}>{awayWin}%</span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Thắng</span>
                </div>
              </div>
            )}
          </div>

          {/* Away */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            {awayCrest && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={awayCrest} width={120} height={120} style={{ objectFit: "contain" }} alt="" />
            )}
            <span style={{ fontSize: 28, color: "#f1f5f9", fontWeight: 600 }}>{away}</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 60px 30px" }}>
          <span style={{ fontSize: 14, color: "#475569" }}>{venue}</span>
          <span style={{ fontSize: 14, color: "#475569" }}>nhandinhbongdavn.com</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Inter", data: fontData, style: "normal", weight: 600 }],
    }
  );
}

function generateLeagueImage(params: URLSearchParams, fontData: Buffer) {
  const league = params.get("league") || "League";
  const leagueLogo = params.get("leagueLogo") || "";
  const matchCount = params.get("matchCount") || "0";
  const round = params.get("round") || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "Inter",
        }}
      >
        {leagueLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={leagueLogo} width={100} height={100} style={{ objectFit: "contain", marginBottom: 20 }} alt="" />
        )}
        <span style={{ fontSize: 48, color: "#f1f5f9", fontWeight: 600 }}>Nhận định {league}</span>
        {round && <span style={{ fontSize: 28, color: "#22c55e", marginTop: 12 }}>Vòng {round}</span>}
        <span style={{ fontSize: 22, color: "#94a3b8", marginTop: 16 }}>{matchCount} trận đấu · Phân tích chi tiết</span>
        <span style={{ fontSize: 16, color: "#475569", marginTop: 40 }}>nhandinhbongdavn.com</span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Inter", data: fontData, style: "normal", weight: 600 }],
    }
  );
}

function generatePlayerImage(params: URLSearchParams, fontData: Buffer) {
  const name = params.get("name") || "Player";
  const photo = params.get("photo") || "";
  const team = params.get("team") || "";
  const goals = params.get("goals") || "0";
  const assists = params.get("assists") || "0";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "Inter",
          padding: 60,
        }}
      >
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} width={200} height={200} style={{ objectFit: "cover", borderRadius: "50%", border: "4px solid #334155" }} alt="" />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 44, color: "#f1f5f9", fontWeight: 600 }}>{name}</span>
          <span style={{ fontSize: 22, color: "#94a3b8" }}>{team}</span>
          <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 36, color: "#22c55e", fontWeight: 700 }}>{goals}</span>
              <span style={{ fontSize: 14, color: "#64748b" }}>Bàn thắng</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 36, color: "#3b82f6", fontWeight: 700 }}>{assists}</span>
              <span style={{ fontSize: 14, color: "#64748b" }}>Kiến tạo</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Inter", data: fontData, style: "normal", weight: 600 }],
    }
  );
}
