export function TeamCrest({
  src,
  alt,
  size = "md",
}: {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const dims: Record<string, string> = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
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
