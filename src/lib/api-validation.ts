import { z, ZodSchema } from "zod";

// --- Reusable refinements ---

/** String that must parse as a positive integer */
const numericString = z.string().regex(/^\d+$/, "Must be a numeric string");

/** YYYY-MM-DD date string */
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD");

// --- Route schemas ---

export const analysisSchema = z.object({
  matchId: numericString,
  lang: z.enum(["en", "vi"]).optional(),
});

export const compareSchema = z.object({
  a: numericString,
  b: numericString,
});

export const h2hSchema = z.object({
  a: numericString,
  b: numericString,
});

export const matchSchema = z.object({
  id: numericString,
  section: z
    .enum([
      "core",
      "form",
      "h2h",
      "teams",
      "scorers",
      "odds",
      "injuries",
      "lineups",
      "events",
      "statistics",
      "performers",
    ])
    .optional(),
});

export const matchesSchema = z.object({
  dateFrom: dateString,
  dateTo: dateString,
});

export const playerSchema = z.object({
  id: numericString,
  section: z.enum(["profile", "transfers", "trophies"]).optional(),
});

export const playersSchema = z.object({
  homeTeamId: numericString,
  awayTeamId: numericString,
});

export const quickSummarySchema = z.object({
  matchId: numericString,
});

export const searchSchema = z.object({
  q: z.string().min(2).optional(),
});

export const standingsSchema = z.object({
  code: z.string().optional(),
  league: z.string().optional(),
  type: z.enum(["scorers"]).optional(),
});

export const subscribeSchema = z.object({
  email: z.string().includes("@").max(200),
});

export const teamSchema = z.object({
  id: numericString,
  section: z.enum(["profile", "stats", "squad", "recent", "fixtures"]).optional(),
  leagueId: numericString.optional(),
});

export const topAssistsSchema = z.object({
  code: z.string().min(1),
});

// --- Helper ---

type ParseResult<T> = { data: T; error: null } | { data: null; error: Response };

export function parseSearchParams<T>(
  schema: ZodSchema<T>,
  searchParams: URLSearchParams,
): ParseResult<T> {
  const raw: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    raw[key] = value;
  });

  const result = schema.safeParse(raw);
  if (!result.success) {
    const message = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return {
      data: null,
      error: Response.json({ error: message }, { status: 400 }),
    };
  }
  return { data: result.data, error: null };
}

export function parseBody<T>(
  schema: ZodSchema<T>,
  body: unknown,
): ParseResult<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return {
      data: null,
      error: Response.json({ error: message }, { status: 400 }),
    };
  }
  return { data: result.data, error: null };
}
