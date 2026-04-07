import type { MetadataRoute } from "next";
import { getMatches, getStandings } from "@/lib/football-data";
import { getAllLeagueSlugs, getLeagueBySlug } from "@/lib/league-slugs";
import { generateMatchSlug } from "@/lib/match-slugs";
import { LEAGUES } from "@/lib/constants";
import { getAllPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://nhandinhbongdavn.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1.0 },
    { url: `${baseUrl}/hom-nay`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/truc-tiep`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
    { url: `${baseUrl}/soi-keo-hom-nay`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.95 },
    { url: `${baseUrl}/du-doan`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/so-sanh`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/doi-dau`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/ung-ho`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
  ];

  // League pages
  const leagueSlugs = getAllLeagueSlugs();
  const leaguePages: MetadataRoute.Sitemap = [
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
    ...leagueSlugs.flatMap((slug) => [
      { url: `${baseUrl}/lich-thi-dau/${slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
      { url: `${baseUrl}/bang-xep-hang/${slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
      { url: `${baseUrl}/soi-keo/${slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    ]),
  ];

  // Team pages — collect unique teams from all league standings
  const teamPages: MetadataRoute.Sitemap = [];
  const seenTeamIds = new Set<number>();
  try {
    const standingsResults = await Promise.allSettled(
      LEAGUES.filter((l) => !l.isTournament).map((l) => getStandings(l.code))
    );
    for (const result of standingsResults) {
      if (result.status === "fulfilled") {
        for (const s of result.value) {
          if (!seenTeamIds.has(s.team.id)) {
            seenTeamIds.add(s.team.id);
            teamPages.push({
              url: `${baseUrl}/doi-bong/${s.team.id}`,
              lastModified: new Date(),
              changeFrequency: "weekly",
              priority: 0.6,
            });
          }
        }
      }
    }
  } catch { /* skip team pages on error */ }

  // Blog posts
  const blogPosts = getAllPosts();
  const blogPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/bai-viet`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/bai-viet/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  // Dynamic match pages — get upcoming matches
  try {
    const today = new Date().toISOString().slice(0, 10);
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const matches = await getMatches(today, nextWeek);

    const matchPages: MetadataRoute.Sitemap = matches.flatMap((match) => {
      const matchSlug = generateMatchSlug(match.homeTeam.shortName, match.awayTeam.shortName, match.date, match.id);
      return [
        { url: `${baseUrl}/match/${match.id}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
        { url: `${baseUrl}/nhan-dinh/${matchSlug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
      ];
    });

    return [...staticPages, ...leaguePages, ...teamPages, ...matchPages, ...blogPages];
  } catch {
    return [...staticPages, ...leaguePages, ...teamPages, ...blogPages];
  }
}
