import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-bg-secondary/90 backdrop-blur border-b border-border">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-12">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-lg">&#9917;</span>
          <span className="font-bold text-sm text-text-primary">
            MatchDay<span className="text-accent">Analyst</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-xs text-text-secondary">
          <Link href="/" className="hover:text-text-primary transition-colors">Lịch đấu</Link>
          <Link href="/about" className="hover:text-text-primary transition-colors">Giới thiệu</Link>
        </nav>
      </div>
    </header>
  );
}
