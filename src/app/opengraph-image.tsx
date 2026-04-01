import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "Nhận Định Bóng Đá VN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
        }}
      >
        <div style={{ fontSize: 80, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 16 }}>
          ⚽ MatchDay
          <span style={{ color: "#22c55e" }}>Analyst</span>
        </div>
        <div style={{ fontSize: 32, color: "#94a3b8", marginTop: 20 }}>
          Nhận định bóng đá trước trận với AI
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 40, fontSize: 20, color: "#64748b" }}>
          <span>🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League</span>
          <span>🇪🇸 La Liga</span>
          <span>🇮🇹 Serie A</span>
          <span>🇩🇪 Bundesliga</span>
          <span>🇫🇷 Ligue 1</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Inter", data: fontData, style: "normal", weight: 600 }],
    }
  );
}
