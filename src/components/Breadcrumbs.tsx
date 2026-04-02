import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const allItems = [{ label: "Trang chủ", href: "/" }, ...items];

  // JSON-LD BreadcrumbList schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `https://nhandinhbongdavn.com${item.href}` } : {}),
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-muted mb-5 overflow-x-auto">
        {allItems.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5 shrink-0">
            {i > 0 && <span className="text-border">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-text-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-text-secondary">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
