"use client";

import { useState } from "react";

interface ShimmerImgProps {
  src: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
}

export function ShimmerImg({ src, alt = "", className = "", loading = "lazy" }: ShimmerImgProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <div className="absolute inset-0 img-shimmer rounded-inherit" />}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        loading={loading}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
