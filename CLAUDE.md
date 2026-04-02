# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build (includes type-check)
npm run lint      # ESLint
```

## Architecture

Vietnamese-first football pre-match analysis site covering Europe's top 5 leagues (PL, La Liga, Serie A, Bundesliga, Ligue 1), V-League (Vietnam), Champions League, and World Cup. Next.js 16 App Router + React Query + Zustand + Tailwind CSS 4. Data sourced from API-Football (api-sports.io).

### Data Flow

```
API-Football (api-sports.io) → Rate Limiter (280/60s sliding window) → Two-Level Cache → API Routes → React Query → Components
                                                                                              ↓
Claude Haiku API → Redis Cache (6hr) → AI Analysis / Quick Summary
```

### Three-Level Caching Strategy

1. **React Query (client)** — staleTime 30min-12hr per hook, gcTime 1hr, refetchOnMount disabled
2. **In-memory (server)** — Map-based, 5min-24hr TTL per data type
3. **Upstash Redis (persistent)** — survives deploys, shared across serverless instances

### Key Patterns

- **Section-based API**: `/api/match?id=X&section=core|form|h2h|teams|scorers` — clients fetch only needed data
- **Prefetch on hover**: MatchCard prefetches core data via React Query on mouseenter/touchstart
- **H2H fallback chain**: official `/matches/{id}/head2head` endpoint → computed from recent matches
- **Prediction engine**: Poisson model from standings data with home advantage (1.1x) and optional H2H blending (10%)
- **Rate limiter**: sliding window (280 req/min) in `football-data.ts`, NOT fixed delay — first requests are instant, only throttles at capacity

### API Integration

- **API-Football** (`src/lib/football-data.ts`): All data fetching via `v3.football.api-sports.io`. Pro plan: 280 req/min. Auth via `x-apisports-key` header. League IDs: PL=39, La Liga=140, Serie A=135, Bundesliga=78, Ligue 1=61, V-League=340, Champions League=2, World Cup=1. Responses use UTC dates, converted to GMT+7 in `mapMatch()`.
- **Claude API** (`src/lib/ai-analysis.ts`): Match analysis + quick summaries. Model: `claude-haiku-4-5-20251001`. Prompts in both EN and VI with bold predicted score. Cached in Redis 6hr.
- **Upstash Redis** (`src/lib/cache.ts`): Persistent KV cache. Falls back to in-memory if env vars not set.

### Route Structure

**Client components** ("use client"): `/` (home), `/match/[id]` — use React Query hooks for progressive loading
**Server components**: `/hom-nay`, `/giai-dau/[code]`, `/bang-xep-hang/[league]`, `/lich-thi-dau/[league]` — ISR with `revalidate = 300`

Every route has a `loading.tsx` for instant navigation skeleton.

### State Management

- **Zustand** (`src/lib/store.ts`): `lang` (vi/en), `leagueFilter` (nullable league code)
- **React Query**: all server state (matches, standings, teams, analysis)

## Important Conventions

- All UI text must be in **Vietnamese with proper diacritics** (dấu). Example: "Nhận định bóng đá" not "Nhan dinh bong da"
- API-Football dates are UTC — always convert to GMT+7 via `utcToGmt7()` before display
- `getCached`/`setCache` in football-data.ts are **async** (Redis I/O) — always `await` them
- Mobile layout: row-based match cards (team per row). Desktop: horizontal grid (crests above names, 2-column grid)
- Vietnamese position names: Offence→"Tấn công", Midfield→"Tiền vệ", Defence→"Hậu vệ", Goalkeeper→"Thủ môn"

## Environment Variables

```
API_FOOTBALL_KEY               # API-Football (api-sports.io, Pro plan, 280 req/min)
ANTHROPIC_API_KEY              # Claude API for AI analysis
UPSTASH_REDIS_REST_URL         # Persistent cache (optional, falls back to in-memory)
UPSTASH_REDIS_REST_TOKEN       # Redis auth
NEXT_PUBLIC_GA_ID              # Google Analytics (optional)
NEXT_PUBLIC_ADSENSE_ID         # Google AdSense (optional)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION  # Search Console (optional)
NEXT_PUBLIC_KOFI_URL              # Ko-fi donation page URL (shown on /ung-ho support page)
NEXT_PUBLIC_SPONSOR_NAME          # Sponsored content: sponsor display name
NEXT_PUBLIC_SPONSOR_LOGO          # Sponsored content: sponsor logo URL
NEXT_PUBLIC_SPONSOR_URL           # Sponsored content: sponsor link URL
NEXT_PUBLIC_SPONSOR_TAGLINE       # Sponsored content: short tagline text
NEXT_PUBLIC_CONTACT_EMAIL         # Contact email for sponsor inquiries (default: contact@nhandinhbongdavn.com)
```

## Domain & Deployment

- **Live**: https://nhandinhbongdavn.com
- **Hosting**: Vercel
- **Repo**: github.com/duynguyen1105/football-analyzer

@AGENTS.md
