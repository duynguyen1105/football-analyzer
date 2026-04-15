import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { NavigationProgress } from "@/components/NavigationProgress";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { AdSenseScript } from "@/components/AdSenseScript";
import { buildWebSiteSchema } from "@/lib/json-ld";
import { MobileNav } from "@/components/MobileNav";
import { WebVitals } from "@/components/WebVitals";
import { ServiceWorker } from "@/components/ServiceWorker";
import { BackToTop } from "@/components/BackToTop";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { FavoriteNotifier } from "@/components/FavoriteNotifier";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://nhandinhbongdavn.com"),
  title: {
    default: "Nhận Định Bóng Đá — Phân Tích Trước Trận Đấu",
    template: "%s | Nhận Định Bóng Đá VN",
  },
  description: "Nhận định bóng đá (nhan dinh bong da) trước trận với AI: phong độ, đối đầu, thống kê, dự đoán tỷ số và soi kèo hôm nay cho Premier League, La Liga, Serie A, Bundesliga, Ligue 1, V-League, Champions League.",
  keywords: [
    "nhận định bóng đá",
    "nhan dinh bong da",
    "nhan dinh bong da hom nay",
    "nhận định bóng đá hôm nay",
    "phân tích bóng đá",
    "phan tich bong da",
    "dự đoán bóng đá",
    "du doan bong da",
    "dự đoán tỷ số",
    "du doan ty so",
    "soi kèo",
    "soi keo bong da",
    "soi kèo hôm nay",
    "soi keo hom nay",
    "kèo nhà cái",
    "keo nha cai",
    "premier league",
    "la liga",
    "serie a",
    "bundesliga",
    "ligue 1",
    "v-league",
    "champions league",
  ],
  openGraph: { type: "website", locale: "vi_VN", siteName: "Nhận Định Bóng Đá VN" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://nhandinhbongdavn.com" },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="dns-prefetch" href="https://media.api-sports.io" />
        <link rel="preconnect" href="https://media.api-sports.io" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t){document.documentElement.setAttribute('data-theme',t);var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',t==='light'?'#ffffff':'#0f172a')}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[100] focus:bg-accent focus:text-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
        >
          Bỏ qua đến nội dung chính
        </a>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <Providers>
          <div className="min-h-dvh flex flex-col pb-20 md:pb-0">{children}</div>
          <MobileNav />
          <BackToTop />
          <KeyboardShortcuts />
          <FavoriteNotifier />
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildWebSiteSchema()).replace(/</g, "\\u003c"),
          }}
        />
        <GoogleAnalytics />
        <WebVitals />
        <AdSenseScript />
        <ServiceWorker />
      </body>
    </html>
  );
}
