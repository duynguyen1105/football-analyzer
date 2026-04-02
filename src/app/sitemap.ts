import type { MetadataRoute } from "next";
import { getMatches } from "@/lib/football-data";
import { getAllLeagueSlugs, getLeagueBySlug } from "@/lib/league-slugs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://nhandinhbongdavn.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1.0 },
    { url: `${baseUrl}/hom-nay`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/truc-tiep`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
    { url: `${baseUrl}/du-doan`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/so-sanh`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
  ];

  // League pages
  const leagueSlugs = getAllLeagueSlugs();
  const leaguePages: MetadataRoute.Sitemap = [
    // League detail hub + sub-pages
    ...leagueSlugs.flatMap((slug) => {
      const league = getLeagueBySlug(slug);
      const pages = [
        { url: `${baseUrl}/giai-dau/${slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
        { url: `${baseUrl}/giai-dau/${slug}/lich-thi-dau`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
        { url: `${baseUrl}/giai-dau/${slug}/top-ghi-ban`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
        { url: `${baseUrl}/giai-dau/${slug}/top-kien-tao`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
      ];
      if (league?.isTournament) {
        pages.push({ url: `${baseUrl}/giai-dau/${slug}/bang-dau`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 });
      } else {
        pages.push({ url: `${baseUrl}/giai-dau/${slug}/soi-keo`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 });
      }
      return pages;
    }),
    // Standalone SEO pages
    ...leagueSlugs.flatMap((slug) => [
      { url: `${baseUrl}/lich-thi-dau/${slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
      { url: `${baseUrl}/bang-xep-hang/${slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
      { url: `${baseUrl}/soi-keo/${slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
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
