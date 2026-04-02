import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { getTeamProfile } from "@/lib/football-data";

export const runtime = "nodejs";
export const alt = "Đội bóng";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await getTeamProfile(parseInt(id, 10));

  const fontPath = join(process.cwd(), "assets", "Inter-SemiBold.ttf");
  const fontData = await readFile(fontPath);

  const name = team?.name || "Đội bóng";
  const country = team?.country || "";

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
        {team?.logo && (
          <img src={team.logo} width={140} height={140} style={{ objectFit: "contain", marginBottom: 24 }} />
        )}
        <div style={{ fontSize: 56, color: "#f1f5f9", fontWeight: 600 }}>
          {name}
        </div>
        {country && (
          <div style={{ fontSize: 24, color: "#94a3b8", marginTop: 12 }}>
            {country}{team?.founded ? ` · Thành lập ${team.founded}` : ""}
          </div>
        )}
        <div style={{ fontSize: 28, color: "#64748b", marginTop: 24 }}>
          Thống kê · Đội hình · Lịch thi đấu
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
