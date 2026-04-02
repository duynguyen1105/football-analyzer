import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { getPlayerInfo } from "@/lib/football-data";

export const runtime = "nodejs";
export const alt = "Cầu thủ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = await getPlayerInfo(parseInt(id, 10));

  const fontPath = join(process.cwd(), "assets", "Inter-SemiBold.ttf");
  const fontData = await readFile(fontPath);

  const name = player?.name || "Cầu thủ";
  const nationality = player?.nationality || "";
  const position = player?.position || "";

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
        <div style={{ fontSize: 56, color: "#f1f5f9", fontWeight: 600 }}>
          {name}
        </div>
        <div style={{ fontSize: 24, color: "#94a3b8", marginTop: 16, display: "flex", gap: 16 }}>
          {position && <span>{position}</span>}
          {nationality && <span>· {nationality}</span>}
        </div>
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
