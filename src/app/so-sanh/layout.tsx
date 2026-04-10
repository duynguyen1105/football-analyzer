import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "So Sánh Cầu Thủ — Thống Kê & Hiệu Suất",
  description: "So sánh thống kê, bàn thắng, kiến tạo của các cầu thủ bóng đá hàng đầu châu Âu.",
  alternates: { canonical: "https://nhandinhbongdavn.com/so-sanh" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
