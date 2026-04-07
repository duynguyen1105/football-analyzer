import { OptImage } from "./OptImage";

const SIZE_MAP: Record<string, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 80,
};

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
    <OptImage
      src={src}
      alt={alt}
      size={SIZE_MAP[size]}
      className={`${dims[size]} object-contain`}
    />
  );
}
