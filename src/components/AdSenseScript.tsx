"use client";

import Script from "next/script";

export function AdSenseScript() {
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  if (!pubId) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
