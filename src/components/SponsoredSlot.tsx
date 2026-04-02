"use client";

/**
 * Configurable sponsored content slot.
 * When no sponsor is configured, shows a "contact us" placeholder.
 * Configure via NEXT_PUBLIC_SPONSOR_* env vars.
 */

const SPONSOR = {
  name: process.env.NEXT_PUBLIC_SPONSOR_NAME || "",
  logo: process.env.NEXT_PUBLIC_SPONSOR_LOGO || "",
  url: process.env.NEXT_PUBLIC_SPONSOR_URL || "",
  tagline: process.env.NEXT_PUBLIC_SPONSOR_TAGLINE || "",
};

export function SponsoredSlot({ className = "" }: { className?: string }) {
  // If a sponsor is configured, show their content
  if (SPONSOR.name && SPONSOR.url) {
    return (
      <div className={`bg-bg-card rounded-xl border border-border/50 p-3 ${className}`}>
        <p className="text-[8px] text-text-muted/50 uppercase tracking-wider mb-2">Tài trợ</p>
        <a
          href={SPONSOR.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="flex items-center gap-3 group"
        >
          {SPONSOR.logo && (
            <img src={SPONSOR.logo} alt={SPONSOR.name} className="w-10 h-10 object-contain rounded shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium group-hover:text-accent transition-colors">{SPONSOR.name}</p>
            {SPONSOR.tagline && (
              <p className="text-[10px] text-text-muted">{SPONSOR.tagline}</p>
            )}
          </div>
        </a>
      </div>
    );
  }

  // No sponsor configured — show contact CTA for potential advertisers
  return (
    <div className={`bg-bg-card/50 rounded-xl border border-dashed border-border/50 p-3 text-center ${className}`}>
      <p className="text-[8px] text-text-muted/50 uppercase tracking-wider mb-1">Tài trợ</p>
      <p className="text-[10px] text-text-muted">
        Quảng cáo tại đây?{" "}
        <a href="mailto:contact@nhandinhbongdavn.com" className="text-accent hover:underline">
          Liên hệ
        </a>
      </p>
    </div>
  );
}
