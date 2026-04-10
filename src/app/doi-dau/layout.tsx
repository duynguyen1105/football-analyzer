import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Đối Đầu — Lịch Sử Các Trận Gặp Nhau",
  description: "So sánh lịch sử đối đầu giữa hai đội bóng. Thống kê thắng/hòa/thua, bàn thắng.",
  alternates: { canonical: "https://nhandinhbongdavn.com/doi-dau" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
