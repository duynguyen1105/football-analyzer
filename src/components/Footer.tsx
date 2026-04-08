import Link from "next/link";
import { LEAGUES } from "@/lib/constants";
import { getSlugByCode } from "@/lib/league-slugs";

export function Footer() {
  return (
    <footer className="mt-10 pt-6 pb-4 border-t border-border">
      <div className="max-w-7xl mx-auto px-3 xl:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-text-muted mb-6">
          {/* Column 1 */}
          <div>
            <p className="font-semibold text-text-secondary mb-2">Trang chính</p>
            <ul className="space-y-1.5">
              <li><Link href="/" className="hover:text-text-primary transition-colors">Trang chủ</Link></li>
              <li><Link href="/hom-nay" className="hover:text-text-primary transition-colors">Hôm nay</Link></li>
              <li><Link href="/truc-tiep" className="hover:text-text-primary transition-colors">Trực tiếp</Link></li>
              <li><Link href="/soi-keo-hom-nay" className="hover:text-text-primary transition-colors">Soi kèo hôm nay</Link></li>
              <li><Link href="/du-doan" className="hover:text-text-primary transition-colors">Dự đoán</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <p className="font-semibold text-text-secondary mb-2">Giải đấu</p>
            <ul className="space-y-1.5">
              {LEAGUES.slice(0, 6).map((l) => (
                <li key={l.code}>
                  <Link href={`/giai-dau/${getSlugByCode(l.code) || l.code}`} className="hover:text-text-primary transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <p className="font-semibold text-text-secondary mb-2">Bảng xếp hạng</p>
            <ul className="space-y-1.5">
              {LEAGUES.filter((l) => !l.isTournament).map((l) => (
                <li key={l.code}>
                  <Link href={`/bang-xep-hang/${getSlugByCode(l.code) || l.code}`} className="hover:text-text-primary transition-colors">
                    BXH {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <p className="font-semibold text-text-secondary mb-2">Khác</p>
            <ul className="space-y-1.5">
              <li><Link href="/bai-viet" className="hover:text-text-primary transition-colors">Bài viết</Link></li>
              <li><Link href="/so-sanh" className="hover:text-text-primary transition-colors">So sánh cầu thủ</Link></li>
              <li><Link href="/doi-dau" className="hover:text-text-primary transition-colors">Đối đầu</Link></li>
              <li><Link href="/about" className="hover:text-text-primary transition-colors">Giới thiệu</Link></li>
              <li><Link href="/privacy" className="hover:text-text-primary transition-colors">Bảo mật</Link></li>
              <li><Link href="/ung-ho" className="hover:text-accent-red transition-colors">Ủng hộ</Link></li>
            </ul>
          </div>
        </div>

        <div className="text-center text-[10px] text-text-muted pt-4 border-t border-border/50">
          <p>MatchDay Analyst — Nhận định bóng đá trước trận</p>
          <p className="mt-0.5">Dữ liệu từ API-Football · © {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
