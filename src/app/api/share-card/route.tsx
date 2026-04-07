import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const homeTeam = searchParams.get("home") || "Home";
  const awayTeam = searchParams.get("away") || "Away";
  const homeCrest = searchParams.get("homeCrest") || "";
  const awayCrest = searchParams.get("awayCrest") || "";
  const homeScore = searchParams.get("homeScore") || "0";
  const awayScore = searchParams.get("awayScore") || "0";
  const league = searchParams.get("league") || "";
  const date = searchParams.get("date") || "";
  const nickname = searchParams.get("nickname") || "Fan";

  const fontPath = join(process.cwd(), "assets", "Inter-SemiBold.ttf");
  const fontData = await readFile(fontPath);

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
          padding: 60,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 18, color: "#64748b" }}>⚽ Nhận Định Bóng Đá VN</span>
        </div>

        <div style={{ fontSize: 16, color: "#94a3b8", marginBottom: 40 }}>
          {league} · {date}
        </div>

        {/* Match */}
        <div style={{ display: "flex", alignItems: "center", gap: 40, marginBottom: 40 }}>
          {/* Home */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {homeCrest && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={homeCrest} width={80} height={80} style={{ objectFit: "contain" }} alt="" />
            )}
            <span style={{ fontSize: 24, color: "#f1f5f9", fontWeight: 600 }}>{homeTeam}</span>
          </div>

          {/* Score prediction */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>DỰ ĐOÁN CỦA</span>
            <span style={{ fontSize: 18, color: "#22c55e", marginBottom: 16 }}>{nickname}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 64, color: "#f1f5f9", fontWeight: 700 }}>{homeScore}</span>
              <span style={{ fontSize: 36, color: "#475569" }}>-</span>
              <span style={{ fontSize: 64, color: "#f1f5f9", fontWeight: 700 }}>{awayScore}</span>
            </div>
          </div>

          {/* Away */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {awayCrest && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={awayCrest} width={80} height={80} style={{ objectFit: "contain" }} alt="" />
            )}
            <span style={{ fontSize: 24, color: "#f1f5f9", fontWeight: 600 }}>{awayTeam}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: 16, color: "#475569" }}>
          nhandinhbongdavn.com — Dự đoán cùng bạn bè!
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
