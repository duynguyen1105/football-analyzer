/**
 * Generate a URL-safe slug for a match.
 * Format: "arsenal-vs-chelsea-02-04-2026"
 */
export function generateMatchSlug(
  homeTeam: string,
  awayTeam: string,
  date: string, // YYYY-MM-DD
  matchId: number
): string {
  const slugify = (s: string) =>
    s.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip diacritics
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const home = slugify(homeTeam);
  const away = slugify(awayTeam);
  const [y, m, d] = date.split("-");
  return `${home}-vs-${away}-${d}-${m}-${y}-${matchId}`;
}

/**
 * Extract match ID from the slug (last segment after final dash).
 */
export function extractMatchIdFromSlug(slug: string): number | null {
  const match = slug.match(/-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}
