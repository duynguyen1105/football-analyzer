import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { NavigationProgress } from "@/components/NavigationProgress";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { AdSenseScript } from "@/components/AdSenseScript";
import { buildWebSiteSchema } from "@/lib/json-ld";

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
    <html lang="vi">
      <body>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <Providers>{children}</Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildWebSiteSchema()).replace(/</g, "\\u003c"),
          }}
        />
        <GoogleAnalytics />
        <AdSenseScript />
      </body>
    </html>
  );
}
