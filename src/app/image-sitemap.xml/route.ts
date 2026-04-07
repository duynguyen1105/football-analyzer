import { getStandings } from "@/lib/football-data";
import { LEAGUES } from "@/lib/constants";
import { getAllLeagueSlugs } from "@/lib/league-slugs";

export const revalidate = 86400; // once a day

export async function GET() {
  const baseUrl = "https://nhandinhbongdavn.com";
  const entries: string[] = [];

  // League OG images
  for (const slug of getAllLeagueSlugs()) {
    entries.push(`
    <url>
      <loc>${baseUrl}/giai-dau/${slug}</loc>
      <image:image>
        <image:loc>${baseUrl}/giai-dau/${slug}/opengraph-image</image:loc>
        <image:title>${slug.replace(/-/g, " ")} - Nhận Định Bóng Đá VN</image:title>
      </image:image>
    </url>`);
  }

  // Team crest images from standings
  try {
    const standingsResults = await Promise.allSettled(
      LEAGUES.filter((l) => !l.isTournament).map((l) => getStandings(l.code))
    );
    const seenTeams = new Set<number>();
    for (const result of standingsResults) {
      if (result.status === "fulfilled") {
        for (const s of result.value) {
          if (!seenTeams.has(s.team.id) && s.team.crest) {
            seenTeams.add(s.team.id);
            entries.push(`
    <url>
      <loc>${baseUrl}/doi-bong/${s.team.id}</loc>
      <image:image>
        <image:loc>${escapeXml(s.team.crest)}</image:loc>
        <image:title>${escapeXml(s.team.shortName)}</image:title>
      </image:image>
    </url>`);
          }
        }
      }
    }
  } catch { /* skip on error */ }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
