import type { MetadataRoute } from "next";
import { getMatches } from "@/lib/football-data";
import { getAllLeagueSlugs } from "@/lib/league-slugs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://nhandinhbongdavn.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1.0 },
    { url: `${baseUrl}/hom-nay`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
  ];

  // League pages (existing /giai-dau/ + new SEO pages)
  const leagueSlugs = getAllLeagueSlugs();
  const leaguePages: MetadataRoute.Sitemap = [
    // Existing league detail pages
    { url: `${baseUrl}/giai-dau/PL`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/giai-dau/PD`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/giai-dau/SA`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/giai-dau/BL1`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/giai-dau/FL1`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    // SEO schedule + standings pages
    ...leagueSlugs.flatMap((slug) => [
      { url: `${baseUrl}/lich-thi-dau/${slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
      { url: `${baseUrl}/bang-xep-hang/${slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    ]),
  ];

  // Dynamic match pages — get upcoming matches
  try {
    const today = new Date().toISOString().slice(0, 10);
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const matches = await getMatches(today, nextWeek);

    const matchPages: MetadataRoute.Sitemap = matches.map((match) => ({
      url: `${baseUrl}/match/${match.id}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...leaguePages, ...matchPages];
  } catch {
    return [...staticPages, ...leaguePages];
  }
}
