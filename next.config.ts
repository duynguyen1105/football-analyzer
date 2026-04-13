import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        pathname: "/football/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24hr cache for optimized images
  },
  experimental: {
    optimizeCss: true,
    // Keep rendered page segments in the App Router client cache so
    // back/forward navigation reuses the previous render instead of
    // re-rendering (which would flash loading.tsx skeletons and force
    // React Query hooks to re-suspend).
    staleTimes: {
      dynamic: 60,   // 60s for dynamic pages (was 0 — caused skeleton flash)
      static: 300,   // 5 min for prefetched / static pages
    },
  },
  async redirects() {
    return [
      { source: "/giai-dau/PL", destination: "/giai-dau/premier-league", permanent: true },
      { source: "/giai-dau/PD", destination: "/giai-dau/la-liga", permanent: true },
      { source: "/giai-dau/SA", destination: "/giai-dau/serie-a", permanent: true },
      { source: "/giai-dau/BL1", destination: "/giai-dau/bundesliga", permanent: true },
      { source: "/giai-dau/FL1", destination: "/giai-dau/ligue-1", permanent: true },
      { source: "/giai-dau/VL", destination: "/giai-dau/v-league", permanent: true },
      { source: "/giai-dau/CL", destination: "/giai-dau/champions-league", permanent: true },
      { source: "/giai-dau/WC", destination: "/giai-dau/world-cup", permanent: true },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
