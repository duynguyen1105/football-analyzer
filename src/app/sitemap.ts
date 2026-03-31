import type { MetadataRoute } from "next";
import { getMatches } from "@/lib/football-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://nhandinhbongdavn.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
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

    return [...staticPages, ...matchPages];
  } catch {
    return staticPages;
  }
}
