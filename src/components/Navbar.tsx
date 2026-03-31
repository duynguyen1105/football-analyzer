import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-bg-secondary/90 backdrop-blur border-b border-border w-full">
      <div className="max-w-6xl mx-auto px-4 w-full">
        <div className="flex items-center justify-between h-14 w-full min-w-0">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl">&#9917;</span>
            <span className="font-bold text-base md:text-lg text-text-primary">
              MatchDay<span className="text-accent">Analyst</span>
            </span>
          </Link>

          <nav className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-text-secondary shrink-0">
            <Link href="/" className="hover:text-text-primary transition-colors py-2">
              Lịch đấu
            </Link>
            <Link href="/about" className="hover:text-text-primary transition-colors py-2">
              Giới thiệu
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
