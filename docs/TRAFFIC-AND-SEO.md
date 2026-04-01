# Traffic, SEO & Monetization Guide

This document covers all the traffic/SEO/monetization features implemented in nhandinhbongdavn.com and how to activate them.

---

## 1. Google Analytics 4

**File:** `src/components/GoogleAnalytics.tsx`

Loads GA4 via `next/script` with `afterInteractive` strategy. Auto-tracks all page views including SPA navigations.

### Setup

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a new GA4 property for `nhandinhbongdavn.com`
3. Copy your Measurement ID (format: `G-XXXXXXXXXX`)
4. Add to `.env.local`:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

5. Redeploy

### Verification

Open your site → DevTools → Network tab → filter for `googletagmanager.com`. You should see requests being made.

---

## 2. Google Search Console

**File:** `src/app/layout.tsx` (verification meta tag in metadata)

### Setup

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property → URL prefix → `https://nhandinhbongdavn.com`
3. Choose "HTML tag" verification method
4. Copy the `content` value from the meta tag they give you
5. Add to `.env.local`:

```
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
```

6. Redeploy
7. Click "Verify" in Search Console
8. **Submit sitemap:** Go to Sitemaps → Enter `sitemap.xml` → Submit

### What the sitemap includes

- Homepage, /hom-nay, /about, /privacy
- 5 schedule pages: `/lich-thi-dau/premier-league`, `/lich-thi-dau/la-liga`, etc.
- 5 standings pages: `/bang-xep-hang/premier-league`, `/bang-xep-hang/la-liga`, etc.
- 5 league detail pages: `/giai-dau/PL`, `/giai-dau/PD`, etc.
- All upcoming match pages (next 7 days): `/match/[id]`

---

## 3. JSON-LD Structured Data

**File:** `src/lib/json-ld.ts`

### What's implemented

| Schema | Where | Purpose |
|--------|-------|---------|
| `WebSite` + `Organization` | Root layout (all pages) | Tells Google what the site is |
| `SportsEvent` | Match pages (`/match/[id]`) | Rich results for football matches |
| `BreadcrumbList` | Match pages, schedule pages, standings pages | Navigation trail in search results |

### Validation

Use [Google Rich Results Test](https://search.google.com/test/rich-results) to validate any page URL.

---

## 4. Open Graph Images

**Files:**
- `src/app/opengraph-image.tsx` — Static homepage OG image
- `src/app/match/[id]/opengraph-image.tsx` — Dynamic per-match OG image

### Homepage image

- 1200x630px, dark background
- Shows site name, tagline, and 5 league names
- Generated at build time

### Match image

- 1200x630px, dark background
- Shows: home team crest + name, VS, away team crest + name
- Competition name, date/time, venue
- Generated dynamically per match

### Font

`assets/Inter-SemiBold.ttf` — Static TTF from Inter v4.1 (required by Satori renderer). **Do not replace with a variable font** — Satori only supports static TTF/OTF.

### Testing

Visit these URLs directly to see the generated images:
- `https://nhandinhbongdavn.com/opengraph-image`
- `https://nhandinhbongdavn.com/match/[any-match-id]/opengraph-image`

---

## 5. SEO Pages (Cornerstone Content)

These pages target high-volume Vietnamese search queries.

### Schedule Pages — `/lich-thi-dau/[league]`

**File:** `src/app/lich-thi-dau/[league]/page.tsx`

| URL | Target keyword |
|-----|---------------|
| `/lich-thi-dau/premier-league` | lịch thi đấu premier league |
| `/lich-thi-dau/la-liga` | lịch thi đấu la liga |
| `/lich-thi-dau/serie-a` | lịch thi đấu serie a |
| `/lich-thi-dau/bundesliga` | lịch thi đấu bundesliga |
| `/lich-thi-dau/ligue-1` | lịch thi đấu ligue 1 |

- SSG with ISR (revalidate every hour)
- Shows next 10 days of matches (API max)
- Links to match detail pages
- Cross-links to other leagues and standings

### Standings Pages — `/bang-xep-hang/[league]`

**File:** `src/app/bang-xep-hang/[league]/page.tsx`

| URL | Target keyword |
|-----|---------------|
| `/bang-xep-hang/premier-league` | bảng xếp hạng premier league |
| `/bang-xep-hang/la-liga` | bảng xếp hạng la liga |
| `/bang-xep-hang/serie-a` | bảng xếp hạng serie a |
| `/bang-xep-hang/bundesliga` | bảng xếp hạng bundesliga |
| `/bang-xep-hang/ligue-1` | bảng xếp hạng ligue 1 |

- SSG with ISR (revalidate every 30 minutes)
- Full standings table (all teams)
- Cross-links to schedule pages

### Slug mapping

**File:** `src/lib/league-slugs.ts`

```
premier-league → PL
la-liga        → PD
serie-a        → SA
bundesliga     → BL1
ligue-1        → FL1
```

---

## 6. Google AdSense

**Files:**
- `src/components/AdSenseScript.tsx` — Global script loader
- `src/components/AdSlot.tsx` — Individual ad units

### Setup

1. Apply at [adsense.google.com](https://adsense.google.com) (requires consistent traffic first — aim for ~1 month of organic traffic)
2. Once approved, copy your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)
3. Add to `.env.local`:

```
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
```

4. Redeploy

### How it works

- **Without env var:** Shows placeholder boxes ("AD SPACE — BANNER/RECTANGLE/LEADERBOARD") — safe for development
- **With env var:** Renders real AdSense `<ins>` tags with auto-responsive format

### Ad placements

The `<AdSlot>` component is used throughout the site with these sizes:
- `banner` (90px height) — top of pages
- `leaderboard` (90px height) — between content sections
- `rectangle` (250px height) — sidebar on match pages

### Custom ad slots

Pass a `slot` prop for specific ad unit IDs from your AdSense dashboard:

```tsx
<AdSlot size="rectangle" slot="1234567890" />
```

---

## Environment Variables Summary

| Variable | Purpose | When to set |
|----------|---------|-------------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 Measurement ID | Immediately |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console verification | Immediately |
| `NEXT_PUBLIC_ADSENSE_ID` | AdSense Publisher ID | After AdSense approval |

All are optional — the site works without them, features just won't activate.

---

## Traffic Growth Checklist

- [ ] Set up GA4 and add `NEXT_PUBLIC_GA_ID`
- [ ] Verify in Google Search Console
- [ ] Submit sitemap.xml
- [ ] Create a Facebook Page for the site
- [ ] Share daily match previews on Facebook/Zalo groups
- [ ] Post on Vietnamese football forums (e.g., bongdaplus, troll bóng đá)
- [ ] Wait 2-4 weeks for Google to index pages
- [ ] Monitor Search Console for indexing issues
- [ ] Apply for AdSense once you have steady traffic (~100+ visits/day)
- [ ] Set `NEXT_PUBLIC_ADSENSE_ID` after approval
