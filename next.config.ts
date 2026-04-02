import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
