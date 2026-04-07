import { getMatches } from "@/lib/football-data";
import { generateMatchSlug } from "@/lib/match-slugs";

export const revalidate = 3600;

export async function GET() {
  const baseUrl = "https://nhandinhbongdavn.com";
  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  let matches: Awaited<ReturnType<typeof getMatches>> = [];
  try {
    matches = await getMatches(today, nextWeek);
  } catch { /* empty */ }

  const entries = matches.map((match) => {
    const slug = generateMatchSlug(match.homeTeam.shortName, match.awayTeam.shortName, match.date, match.id);
    const title = `Nhận định ${match.homeTeam.shortName} vs ${match.awayTeam.shortName} - ${match.competition.name}`;
    return `
    <url>
      <loc>${baseUrl}/nhan-dinh/${slug}</loc>
      <news:news>
        <news:publication>
          <news:name>Nhận Định Bóng Đá VN</news:name>
          <news:language>vi</news:language>
        </news:publication>
        <news:publication_date>${match.date}</news:publication_date>
        <news:title>${escapeXml(title)}</news:title>
      </news:news>
    </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
