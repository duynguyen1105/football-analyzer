import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { getLeagueBySlug } from "@/lib/league-slugs";

export const runtime = "nodejs";
export const alt = "Giải đấu bóng đá";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const league = getLeagueBySlug(slug);

  const fontPath = join(process.cwd(), "assets", "Inter-SemiBold.ttf");
  const fontData = await readFile(fontPath);

  const name = league?.name || "Giải đấu";
  const flag = league?.flag || "⚽";

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
        {league?.logo && (
          <img src={league.logo} width={120} height={120} style={{ objectFit: "contain", marginBottom: 24 }} />
        )}
        <div style={{ fontSize: 56, color: "#f1f5f9", fontWeight: 600 }}>
          {flag} {name}
        </div>
        <div style={{ fontSize: 28, color: "#94a3b8", marginTop: 16 }}>
          Bảng xếp hạng · Lịch thi đấu · Vua phá lưới
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
