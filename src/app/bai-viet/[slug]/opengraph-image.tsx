import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { getPostBySlug } from "@/lib/blog";

export const runtime = "nodejs";
export const alt = "Bài viết bóng đá";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const fontPath = join(process.cwd(), "assets", "Inter-SemiBold.ttf");
  const fontData = await readFile(fontPath);

  const title = post?.title || "Bài viết bóng đá";
  const tags = post?.tags?.slice(0, 3).join(" · ") || "";
  const date = post?.date || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "Inter",
          padding: 60,
        }}
      >
        {/* Top: brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 24 }}>⚽</span>
          <span style={{ fontSize: 20, color: "#64748b" }}>
            Nhận Định Bóng Đá <span style={{ color: "#22c55e" }}>VN</span>
          </span>
        </div>

        {/* Middle: title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 48, color: "#f1f5f9", fontWeight: 600, lineHeight: 1.2, maxWidth: "90%" }}>
            {title.length > 60 ? title.slice(0, 60) + "..." : title}
          </div>
          {tags && (
            <div style={{ fontSize: 18, color: "#22c55e" }}>
              {tags}
            </div>
          )}
        </div>

        {/* Bottom: date + author */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 16, color: "#64748b" }}>{date}</span>
          <span style={{ fontSize: 16, color: "#64748b" }}>nhandinhbongdavn.com</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Inter", data: fontData, style: "normal", weight: 600 }],
    }
  );
}
