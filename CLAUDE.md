# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build (includes type-check)
npm run lint      # ESLint
npm run test      # Vitest (46 tests)
npm run test:watch # Vitest watch mode
```

## Architecture

Vietnamese-first football pre-match analysis site covering Europe's top 5 leagues (PL, La Liga, Serie A, Bundesliga, Ligue 1), V-League (Vietnam), Champions League, and World Cup. Next.js 16 App Router + React Query + Zustand + Tailwind CSS 4. Data sourced from API-Football (api-sports.io).

### Data Flow

```
API-Football (api-sports.io) → Rate Limiter (280/60s sliding window) → Three-Level Cache → API Routes → React Query → Components
                                                                                              ↓
Claude Haiku API → Redis Cache (6hr) → AI Analysis / Quick Summary
                                                                                              ↓
Auto-Blog Cron (2x daily) → Redis → Blog Pages
```

### Three-Level Caching Strategy

1. **React Query (client)** — staleTime 30min-12hr per hook, gcTime 1hr, refetchOnMount disabled
2. **In-memory (server)** — Map-based, 5min-24hr TTL per data type, with hit rate tracking
3. **Upstash Redis (persistent)** — survives deploys, shared across serverless instances

### Key Patterns

- **Section-based API**: `/api/match?id=X&section=core|form|h2h|teams|scorers|odds|injuries|lineups|events|statistics|performers` — clients fetch only needed data
- **Prefetch on hover**: MatchCard prefetches core data via React Query on mouseenter/touchstart, shows H2H preview from cache
- **H2H fallback chain**: official `/matches/{id}/head2head` endpoint → computed from recent matches
- **Prediction engine**: Poisson model from standings data with home advantage (1.1x), H2H blending (10%), and 2nd-leg aggregate adjustment
- **Rate limiter**: sliding window (280 req/min) in `football-data.ts`, NOT fixed delay — first requests are instant, only throttles at capacity
- **Zod validation**: all API routes validate input via schemas in `src/lib/api-validation.ts`
- **Lazy loading**: heavy match detail components loaded via `next/dynamic`

### API Integration

- **API-Football** (`src/lib/football-data.ts`): All data fetching via `v3.football.api-sports.io`. Pro plan: 280 req/min. Auth via `x-apisports-key` header. League IDs: PL=39, La Liga=140, Serie A=135, Bundesliga=78, Ligue 1=61, V-League=340, Champions League=2, World Cup=1. Responses use UTC dates, converted to GMT+7 in `mapMatch()`.
- **Claude API** (`src/lib/ai-analysis.ts`): Match analysis + quick summaries. Model: `claude-haiku-4-5-20251001`. Prompts in both EN and VI with bold predicted score. Cached in Redis 6hr. Includes first leg context for 2nd-leg knockout matches.
- **Upstash Redis** (`src/lib/cache.ts`): Persistent KV cache with hit rate tracking. Falls back to in-memory if env vars not set. Also used by prediction game, comments, auto-blog storage.

### Route Structure

**Client components** ("use client"):
- `/` (home) — match list, standings, countdown banner
- `/match/[id]` — full match analysis with lazy-loaded sections
- `/truc-tiep` — live scores with auto-refresh
- `/du-doan` — prediction accuracy + user leaderboard
- `/so-sanh` — player comparison
- `/doi-dau` — head-to-head comparison
- `/cau-thu/[id]` — player profile
- `/doi-bong/[id]` — team profile

**Server components** (ISR):
- `/hom-nay` — today's matches digest (revalidate 300s)
- `/ket-qua` — yesterday's results (revalidate 300s)
- `/soi-keo-hom-nay` — all today's odds + predictions (revalidate 1800s)
- `/giai-dau/[slug]` — league overview with sub-pages (revalidate 300s)
- `/bang-xep-hang/[league]` — standings (revalidate 1800s)
- `/lich-thi-dau/[league]` — schedule (revalidate 3600s)
- `/soi-keo/[league]` — league odds (revalidate 1800s)
- `/nhan-dinh/[slug]` — match preview article (revalidate 1800s)
- `/bai-viet` — blog listing (revalidate 3600s)
- `/bai-viet/[slug]` — blog article (revalidate 3600s)
- `/lich-phat-song` — TV schedule (revalidate 300s)
- `/chuyen-nhuong` — transfer news (revalidate 3600s)

**API routes** (20+):
- `/api/match`, `/api/matches`, `/api/standings`, `/api/h2h`, `/api/live`, `/api/search`, `/api/player`, `/api/team`, `/api/compare`, `/api/analysis`, `/api/quick-summary`, `/api/predictions`, `/api/top-assists`, `/api/subscribe`
- `/api/user-predictions` — prediction game (POST/GET)
- `/api/user-predictions/leaderboard` — top predictors
- `/api/comments` — match comments (POST/GET)
- `/api/auto-blog` — cron-triggered blog generation
- `/api/blog-image` — dynamic match/league/player images
- `/api/blog-notification` — check for new blog posts
- `/api/share-card` — shareable prediction OG image
- `/api/telegram` — Telegram bot webhook
- `/api/telegram/setup` — register webhook
- `/api/digest` — weekly email digest
- `/api/digest/send` — send digest to subscribers
- `/api/admin` — admin dashboard data

Every route has a `loading.tsx` for instant navigation skeleton.

### State Management

- **Zustand** (`src/lib/store.ts`): `lang` (vi/en), `leagueFilter` (nullable league code), `favoriteTeams`, `showFavoritesOnly`
- **React Query**: all server state (matches, standings, teams, analysis)

### Blog System

- **Manual posts**: Markdown files in `content/blog/` with YAML frontmatter
- **Auto-generated posts**: Stored in Redis via `/api/auto-blog`, read by `getAllPostsWithRedis()`
- **Rendering**: Custom markdown renderer in `src/lib/blog.ts` — handles headings, bold/italic, images (block + inline), links, lists, horizontal rules
- **Images**: Auto-generated via `/api/blog-image` (match preview, league overview, player spotlight)
- **Cron**: Vercel Cron runs at 7AM and 1PM Vietnam time (vercel.json)

### Prediction Engine

- **League matches**: Poisson model from standings (attack/defense rates) + H2H blending at 10%
- **Knockout matches**: Recent form-based rates + H2H at 20%
- **2nd legs**: Adjusts for first leg aggregate — trailing team gets boosted attack, leading team plays conservative
- **User predictions**: Stored in Redis, scored (3pts exact, 1pt correct outcome), leaderboard

## Important Conventions

- All UI text must be in **Vietnamese with proper diacritics** (dấu). Example: "Nhận định bóng đá" not "Nhan dinh bong da"
- API-Football dates are UTC — always convert to GMT+7 via `utcToGmt7()` before display
- `getCached`/`setCache` in football-data.ts are **async** (Redis I/O) — always `await` them
- Mobile layout: row-based match cards (team per row). Desktop: horizontal grid (crests above names, 2-column grid)
- Vietnamese position names: Offence→"Tấn công", Midfield→"Tiền vệ", Defence→"Hậu vệ", Goalkeeper→"Thủ môn"
- All API routes use Zod validation via `parseSearchParams()` from `src/lib/api-validation.ts`
- Lazy-load heavy components on match page with `next/dynamic`
- Blog images: `/api/blog-image` URLs render full-width, `media.api-sports.io` crest URLs render as icons

## Environment Variables

```
# Required
API_FOOTBALL_KEY               # API-Football (api-sports.io, Pro plan, 280 req/min)
ANTHROPIC_API_KEY              # Claude API for AI analysis

# Cache (optional, falls back to in-memory)
UPSTASH_REDIS_REST_URL         # Persistent cache
UPSTASH_REDIS_REST_TOKEN       # Redis auth

# Automation
CRON_SECRET                    # Vercel Cron authentication
AUTO_BLOG_TOKEN                # Bearer token for POST /api/auto-blog
ADMIN_PASSWORD                 # Password for /admin dashboard

# Telegram (optional)
TELEGRAM_BOT_TOKEN             # Telegram Bot API token (from @BotFather)

# Error tracking (optional)
NEXT_PUBLIC_SENTRY_DSN         # Sentry DSN
SENTRY_ORG                     # Sentry org (for source maps)
SENTRY_PROJECT                 # Sentry project

# Analytics & Ads (optional)
NEXT_PUBLIC_GA_ID              # Google Analytics
NEXT_PUBLIC_ADSENSE_ID         # Google AdSense
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION  # Search Console

# Branding (optional)
NEXT_PUBLIC_KOFI_URL              # Ko-fi donation page URL
NEXT_PUBLIC_SPONSOR_NAME          # Sponsored content: sponsor display name
NEXT_PUBLIC_SPONSOR_LOGO          # Sponsored content: sponsor logo URL
NEXT_PUBLIC_SPONSOR_URL           # Sponsored content: sponsor link URL
NEXT_PUBLIC_SPONSOR_TAGLINE       # Sponsored content: short tagline text
NEXT_PUBLIC_CONTACT_EMAIL         # Contact email (default: contact@nhandinhbongdavn.com)
```

## Domain & Deployment

- **Live**: https://nhandinhbongdavn.com
- **Hosting**: Vercel (Hobby plan, 2 cron jobs)
- **Repo**: github.com/duynguyen1105/football-analyzer
- **Crons**: 7AM + 1PM Vietnam time → auto-blog generation

@AGENTS.md
