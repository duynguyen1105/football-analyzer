import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-text-muted mb-2">404</div>
        <h1 className="text-xl font-bold mb-2">Không tìm thấy trang</h1>
        <p className="text-sm text-text-muted mb-6">
          Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>
        <div className="flex gap-3 justify-center">
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
        </div>
      </div>
    </div>
  );
}
