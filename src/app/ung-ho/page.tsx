import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ủng hộ MatchDay Analyst",
  description: "Ủng hộ MatchDay Analyst để duy trì và phát triển trang nhận định bóng đá miễn phí cho cộng đồng.",
};

const KOFI_URL = process.env.NEXT_PUBLIC_KOFI_URL || "https://ko-fi.com/matchdayanalyst";

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="text-sm font-bold mb-1">{title}</h3>
      <p className="text-xs text-text-muted">{description}</p>
    </div>
  );
}

export default function SupportPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 xl:px-8">
        <Breadcrumbs items={[{ label: "Ủng hộ" }]} />

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">&#9917;</div>
          <h1 className="text-2xl font-bold mb-2">Ủng hộ MatchDay Analyst</h1>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Giúp chúng tôi duy trì và phát triển trang nhận định bóng đá miễn phí cho cộng đồng người hâm mộ Việt Nam.
          </p>
        </div>

        {/* Support button */}
        <div className="text-center mb-8">
          <a
            href={KOFI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            Ủng hộ qua Ko-fi
          </a>
          <p className="text-xs text-text-muted mt-3">
            Hoặc chuyển khoản: <span className="font-medium text-text-secondary">MB Bank — 0123456789 — NGUYEN DUY NGUYEN</span>
          </p>
        </div>

        {/* What you support */}
        <h2 className="text-base font-bold mb-3">Bạn ủng hộ điều gì?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <FeatureCard
            icon="&#129302;"
            title="Phân tích AI"
            description="Chi phí API Claude AI cho nhận định bóng đá tự động trước mỗi trận đấu"
          />
          <FeatureCard
            icon="&#128202;"
            title="Dữ liệu thống kê"
            description="Chi phí API-Football Pro để cập nhật dữ liệu real-time cho 8 giải đấu"
          />
          <FeatureCard
            icon="&#9889;"
            title="Hosting & Hạ tầng"
            description="Vercel hosting, Upstash Redis cache, domain nhandinhbongdavn.com"
          />
          <FeatureCard
            icon="&#128640;"
            title="Tính năng mới"
            description="Phát triển thêm tính năng: so sánh cầu thủ, dự đoán, trực tiếp, và nhiều hơn"
          />
        </div>

        {/* Premium features teaser */}
        <div className="bg-bg-card rounded-2xl border border-accent/20 p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-accent-yellow" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h2 className="text-base font-bold">Sắp ra mắt: Premium</h2>
          </div>
          <p className="text-xs text-text-muted mb-3">
            Chúng tôi đang phát triển gói Premium với các tính năng nâng cao:
          </p>
          <ul className="text-xs text-text-secondary space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="text-accent">&#10003;</span> Không quảng cáo
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">&#10003;</span> Nhận định AI chi tiết hơn (phân tích dài, nhiều số liệu)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">&#10003;</span> Xuất báo cáo PDF trước trận
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">&#10003;</span> Thông báo đẩy khi có trận đấu lớn
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">&#10003;</span> Truy cập sớm các tính năng mới
            </li>
          </ul>
        </div>

        {/* Footer */}
        <footer className="mt-8 py-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>MatchDay Analyst — Nhận định bóng đá trước trận</p>
          <div className="mt-1 flex gap-3 justify-center">
            <Link href="/" className="hover:text-text-primary">Trang chủ</Link>
            <Link href="/about" className="hover:text-text-primary">Giới thiệu</Link>
          </div>
        </footer>
      </main>
    </>
  );
}
