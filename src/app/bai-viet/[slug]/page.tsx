import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { getAllPosts, getPostBySlug, getRelatedPosts, renderMarkdown } from "@/lib/blog";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Không tìm thấy bài viết" };

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: post.image, width: 512, height: 512, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug, post.tags);
  const html = renderMarkdown(post.body);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Nhận Định Bóng Đá VN",
      url: "https://nhandinhbongdavn.com",
    },
    image: `https://nhandinhbongdavn.com${post.image}`,
    mainEntityOfPage: `https://nhandinhbongdavn.com/bai-viet/${slug}`,
  };

  const shareUrl = `https://nhandinhbongdavn.com/bai-viet/${slug}`;
  const shareText = encodeURIComponent(post.title);

  return (
    <>
      <Navbar />

      <main className="max-w-3xl mx-auto px-3 py-6 xl:px-6">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-xs text-text-muted mb-4">
          <ol className="flex items-center gap-1">
            <li>
              <Link href="/" className="hover:text-text-primary transition-colors">
                Trang chủ
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/bai-viet" className="hover:text-text-primary transition-colors">
                Bài viết
              </Link>
            </li>
            <li>/</li>
            <li className="text-text-secondary font-medium truncate max-w-[200px]">
              {post.title}
            </li>
          </ol>
        </nav>

        {/* Article header */}
        <article>
          <header className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold mb-2">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>&bull;</span>
              <span>{post.author}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Article body */}
          <div
            className="prose-custom"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>

        {/* Share buttons */}
        <div className="mt-8 pt-4 border-t border-border">
          <p className="text-xs text-text-muted mb-2">Chia sẻ bài viết</p>
          <div className="flex gap-2">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg bg-[#1877f2]/10 text-[#1877f2] hover:bg-[#1877f2]/20 transition-colors"
            >
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg bg-text-primary/5 text-text-secondary hover:bg-text-primary/10 transition-colors"
            >
              X / Twitter
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 transition-colors"
            >
              Telegram
            </a>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold mb-3">Bài viết liên quan</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/bai-viet/${r.slug}`}
                  className="group bg-bg-card rounded-xl border border-border p-3 hover:border-accent/30 transition-colors"
                >
                  <time
                    dateTime={r.date}
                    className="text-[10px] text-text-muted"
                  >
                    {formatDate(r.date)}
                  </time>
                  <h3 className="text-xs font-medium mt-1 group-hover:text-accent transition-colors line-clamp-2">
                    {r.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-10 py-4 border-t border-border text-center text-[10px] text-text-muted">
          <p>MatchDay Analyst &mdash; Nhận định bóng đá trước trận</p>
        </footer>
      </main>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
