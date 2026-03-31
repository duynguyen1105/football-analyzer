import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-bg-secondary/90 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">&#9917;</span>
            <span className="font-bold text-lg text-text-primary">
              MatchDay<span className="text-accent">Analyst</span>
            </span>
          </Link>

          <nav className="flex items-center gap-6 text-sm text-text-secondary">
            <Link href="/" className="hover:text-text-primary transition-colors">
              Lịch đấu
            </Link>
            <Link href="/about" className="hover:text-text-primary transition-colors">
              Giới thiệu
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
