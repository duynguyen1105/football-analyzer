# Nhận Định Bóng Đá VN

Vietnamese-first football pre-match analysis site with AI-powered predictions, covering Europe's top 5 leagues, V-League, Champions League, and World Cup.

**Live:** [nhandinhbongdavn.com](https://nhandinhbongdavn.com)

## Features

- **Match Analysis** — Poisson-model predictions, AI analysis (Claude), form tracking, H2H history
- **Soi Kèo** — Daily odds comparison with predictions for all leagues
- **Live Scores** — Auto-refresh every 30s with goal flash notifications
- **Blog** — Auto-generated daily articles + manual editorial content
- **Prediction Game** — Users submit score predictions, leaderboard with points
- **TV Schedule** — Which channel shows which match (K+, FPT Play, VTV)
- **Transfer News** — Latest transfers across top 5 European leagues
- **Player & Team Pages** — Detailed stats, transfers, trophies
- **Social Sharing** — Dynamic OG images with prediction cards
- **Telegram Bot** — Daily match previews and predictions via commands
- **PWA** — Offline support, push notifications, installable

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **State:** React Query 5 + Zustand 5
- **Data:** API-Football (api-sports.io)
- **AI:** Claude Haiku (Anthropic)
- **Cache:** Upstash Redis + in-memory fallback
- **Hosting:** Vercel
- **Error Tracking:** Sentry
- **Validation:** Zod
- **Testing:** Vitest

## Getting Started

```bash
npm install
npm run dev       # localhost:3000
npm run build     # Production build
npm run test      # Run tests
npm run lint      # ESLint
```

## Environment Variables

```env
# Required
API_FOOTBALL_KEY               # API-Football Pro plan (280 req/min)
ANTHROPIC_API_KEY              # Claude API for AI analysis

# Cache (optional — falls back to in-memory)
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# Automation
CRON_SECRET                    # Vercel Cron authentication
AUTO_BLOG_TOKEN                # Manual trigger for auto-blog API
ADMIN_PASSWORD                 # Access /admin dashboard

# Telegram (optional)
TELEGRAM_BOT_TOKEN             # Bot API token from @BotFather

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN

# Analytics & Ads (optional)
NEXT_PUBLIC_GA_ID
NEXT_PUBLIC_ADSENSE_ID
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

# Branding (optional)
NEXT_PUBLIC_KOFI_URL
NEXT_PUBLIC_SPONSOR_NAME
NEXT_PUBLIC_SPONSOR_LOGO
NEXT_PUBLIC_SPONSOR_URL
NEXT_PUBLIC_SPONSOR_TAGLINE
NEXT_PUBLIC_CONTACT_EMAIL
```

## Project Structure

```
src/
  app/
    (pages)        # 15+ routes — home, match, leagues, blog, etc.
    api/           # 20+ API routes — match data, predictions, telegram, etc.
  components/      # 40+ React components
  lib/             # Utilities — football-data, prediction, cache, blog, etc.
content/
  blog/            # Markdown blog posts (auto-generated + manual)
public/
  sw.js            # Service worker for PWA
  icons/           # PWA icons
```

## Automated Content

The site generates 3-4 blog posts automatically twice daily via Vercel Cron:
1. **League matchday previews** (top 2 leagues)
2. **Big match deep dive** (highest-priority match)
3. **Daily odds roundup** (all matches)

Posts are stored in Redis with 30-day TTL and include auto-generated banner images.

## License

Private project.
