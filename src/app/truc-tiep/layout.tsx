import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Trực Tiếp Bóng Đá — Tỷ Số Trực Tuyến",
  description: "Theo dõi tỷ số trực tiếp bóng đá. Cập nhật tự động mỗi 30 giây từ Premier League, La Liga, Serie A, Bundesliga, Ligue 1.",
  alternates: { canonical: "https://nhandinhbongdavn.com/truc-tiep" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
