import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { getMatch } from "@/lib/football-data";

export const runtime = "nodejs";
export const alt = "Nhận định trận đấu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await getMatch(parseInt(id, 10));

  const fontPath = join(process.cwd(), "assets", "Inter-SemiBold.ttf");
  const fontData = await readFile(fontPath);

  const homeName = match?.homeTeam.shortName || "Home";
  const awayName = match?.awayTeam.shortName || "Away";
  const competition = match?.competition.name || "Football";
  const venue = match?.venue || "";
  const time = match ? `${match.time} · ${match.date}` : "";

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
        {/* Competition */}
        <div style={{ fontSize: 24, color: "#64748b", marginBottom: 30 }}>
          {competition}
        </div>

        {/* Teams */}
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {match?.homeTeam.crest && (
              <img src={match.homeTeam.crest} width={80} height={80} style={{ objectFit: "contain" }} />
            )}
            <span style={{ fontSize: 36, color: "#f1f5f9", fontWeight: 600 }}>{homeName}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 48, color: "#22c55e", fontWeight: 600 }}>VS</span>
            <span style={{ fontSize: 20, color: "#94a3b8", marginTop: 8 }}>{time}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {match?.awayTeam.crest && (
              <img src={match.awayTeam.crest} width={80} height={80} style={{ objectFit: "contain" }} />
            )}
            <span style={{ fontSize: 36, color: "#f1f5f9", fontWeight: 600 }}>{awayName}</span>
          </div>
        </div>

        {/* Venue */}
        <div style={{ fontSize: 18, color: "#475569", marginTop: 30 }}>
          {venue}
        </div>

        {/* Branding */}
        <div style={{ fontSize: 20, color: "#334155", marginTop: 40, display: "flex", alignItems: "center", gap: 8 }}>
          ⚽ nhandinhbongdavn.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Inter", data: fontData, style: "normal", weight: 600 }],
    }
  );
}
