import Link from "next/link";
import { LEAGUES } from "@/lib/constants";
import { getSlugByCode } from "@/lib/league-slugs";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg animate-fade-in">
        <div className="text-7xl mb-4">⚽</div>
        <div className="text-5xl font-bold text-text-muted mb-2">404</div>
        <h1 className="text-xl font-bold mb-2">Không tìm thấy trang</h1>
        <p className="text-sm text-text-muted mb-8">
          Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>

        <div className="flex gap-3 justify-center mb-8">
          <Link
            href="/"
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Trang chủ
          </Link>
          <Link
            href="/hom-nay"
            className="px-4 py-2 bg-bg-card border border-border rounded-lg text-sm font-medium hover:border-accent/40 transition-colors"
          >
            Trận hôm nay
          </Link>
          <Link
            href="/truc-tiep"
            className="px-4 py-2 bg-bg-card border border-border rounded-lg text-sm font-medium hover:border-accent/40 transition-colors"
          >
            Trực tiếp
          </Link>
        </div>

        {/* League quick links */}
        <p className="text-xs text-text-muted mb-3">Hoặc xem giải đấu:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {LEAGUES.map((l) => (
            <Link
              key={l.code}
              href={`/giai-dau/${getSlugByCode(l.code) || l.code}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-border hover:border-accent/30 transition-colors"
            >
              <img src={l.logo} alt="" className="w-4 h-4 object-contain" />
              <span>{l.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
