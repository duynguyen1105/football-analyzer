import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Dự Đoán Bóng Đá — Độ Chính Xác & Bảng Xếp Hạng",
  description: "Theo dõi độ chính xác dự đoán bóng đá. Bảng xếp hạng người chơi dự đoán tỷ số.",
  alternates: { canonical: "https://nhandinhbongdavn.com/du-doan" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
