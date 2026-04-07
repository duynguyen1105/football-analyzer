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
  description: "Nhận định bóng đá trước trận với AI. Phong độ, đối đầu, thống kê và dự đoán cho 5 giải hàng đầu Châu Âu: Premier League, La Liga, Serie A, Bundesliga, Ligue 1.",
  keywords: ["nhận định bóng đá", "phân tích bóng đá", "dự đoán bóng đá", "soi kèo", "premier league", "la liga", "serie a", "bundesliga", "ligue 1"],
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
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
          <div className="pb-20 md:pb-0">{children}</div>
          <MobileNav />
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
