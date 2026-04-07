import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { getAllPosts } from "@/lib/blog";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Bài viết bóng đá — Nhận định, phân tích & tin tức",
  description:
    "Đọc các bài nhận định bóng đá, phân tích chiến thuật, và tin tức mới nhất từ 5 giải hàng đầu châu Âu: Premier League, La Liga, Serie A, Bundesliga, Ligue 1.",
  keywords: [
    "nhận định bóng đá",
    "phân tích bóng đá",
    "tin tức bóng đá",
    "bài viết bóng đá",
    "chiến thuật bóng đá",
    "premier league",
    "la liga",
    "serie a",
  ],
  openGraph: {
    title: "Bài viết bóng đá — Nhận định, phân tích & tin tức",
    description:
      "Nhận định, phân tích chiến thuật và tin tức bóng đá mới nhất.",
    type: "website",
  },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogListPage() {
  const posts = getAllPosts();

  return (
    <>
      <Navbar />

      <main className="max-w-5xl mx-auto px-3 py-6 xl:px-6">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-xs text-text-muted mb-4">
          <ol className="flex items-center gap-1">
            <li>
              <Link href="/" className="hover:text-text-primary transition-colors">
                Trang chủ
              </Link>
            </li>
            <li>/</li>
            <li className="text-text-secondary font-medium">Bài viết</li>
          </ol>
        </nav>

        {/* Page heading */}
        <h1 className="text-xl md:text-2xl font-bold mb-1">
          Bài viết bóng đá
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Nhận định, phân tích chiến thuật và tin tức mới nhất
        </p>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p className="text-lg mb-2">Chưa có bài viết nào.</p>
            <Link href="/" className="text-accent text-sm hover:underline">
              Quay lại trang chủ &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/bai-viet/${post.slug}`}
                className="group bg-bg-card rounded-xl border border-border p-4 hover:border-accent/30 transition-colors flex flex-col"
              >
                {/* Date */}
                <time
                  dateTime={post.date}
                  className="text-[10px] text-text-muted mb-2"
                >
                  {formatDate(post.date)}
                </time>

                {/* Title */}
                <h2 className="text-sm font-semibold mb-1.5 group-hover:text-accent transition-colors line-clamp-2">
                  {post.title}
                </h2>

                {/* Description */}
                <p className="text-xs text-text-secondary mb-3 line-clamp-3 flex-1">
                  {post.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 py-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>MatchDay Analyst &mdash; Nhận định bóng đá trước trận</p>
        </footer>
      </main>
    </>
  );
}
