import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Nhận Định Bóng Đá — Phân Tích Trước Trận Đấu",
  description: "Nhận định bóng đá trước trận với AI. Phong độ, đối đầu, thống kê và dự đoán cho 5 giải hàng đầu Châu Âu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
