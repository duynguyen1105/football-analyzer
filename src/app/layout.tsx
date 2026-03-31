import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://nhandinhbongdavn.com"),
  title: {
    default: "Nhận Định Bóng Đá — Phân Tích Trước Trận Đấu",
    template: "%s | Nhận Định Bóng Đá VN",
  },
  description: "Nhận định bóng đá trước trận với AI. Phong độ, đối đầu, thống kê và dự đoán cho 5 giải hàng đầu Châu Âu: Premier League, La Liga, Serie A, Bundesliga, Ligue 1.",
  keywords: [
    "nhận định bóng đá",
    "phân tích bóng đá",
    "dự đoán bóng đá",
    "soi kèo",
    "premier league",
    "la liga",
    "serie a",
    "bundesliga",
    "ligue 1",
    "tỉ số dự đoán",
    "phong độ đội bóng",
    "lịch sử đối đầu",
  ],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Nhận Định Bóng Đá VN",
    title: "Nhận Định Bóng Đá — Phân Tích Trước Trận Đấu",
    description: "Nhận định bóng đá trước trận với AI. Phong độ, đối đầu, thống kê và dự đoán cho 5 giải hàng đầu Châu Âu.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nhận Định Bóng Đá — Phân Tích Trước Trận Đấu",
    description: "Nhận định bóng đá trước trận với AI. Phong độ, đối đầu, thống kê và dự đoán.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://nhandinhbongdavn.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased overflow-x-hidden">
      <body className="min-h-full flex flex-col w-full max-w-[100vw] overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
