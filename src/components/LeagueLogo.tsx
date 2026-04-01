export function LeagueLogo({
  src,
  alt,
  size = "md",
}: {
  src: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const dims: Record<string, string> = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`${dims[size]} object-contain`}
      loading="lazy"
    />
  );
}
