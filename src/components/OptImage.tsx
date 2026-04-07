import Image from "next/image";

// Tiny SVG blur placeholder — renders as a soft gray circle (pre-computed base64)
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiMxZTI5M2IiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==";

/**
 * Optimized image wrapper for API-Football images.
 * Uses Next.js Image for automatic WebP conversion and lazy loading.
 * Falls back to <img> for non-api-sports URLs or when src is empty.
 */
export function OptImage({
  src,
  alt = "",
  size,
  className = "",
  priority = false,
}: {
  src: string;
  alt?: string;
  size: number; // pixel size (used for both width and height)
  className?: string;
  priority?: boolean;
}) {
  if (!src || !src.includes("media.api-sports.io")) {
    // Fallback for empty or non-optimizable URLs
    return src ? (
      <img src={src} alt={alt} className={className} loading="lazy" />
    ) : null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      loading={priority ? "eager" : "lazy"}
      priority={priority}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      unoptimized={false}
    />
  );
}
