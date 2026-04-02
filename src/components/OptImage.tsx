import Image from "next/image";

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
      unoptimized={false}
    />
  );
}
