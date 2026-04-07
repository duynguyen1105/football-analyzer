import { NextResponse } from "next/server";

export function middleware() {
  const response = NextResponse.next();
  const headers = response.headers;

  // Security headers
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-XSS-Protection", "0");
  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://adservice.google.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://media.api-sports.io https://www.googletagmanager.com https://pagead2.googlesyndication.com",
    "font-src 'self'",
    "connect-src 'self' https://www.google-analytics.com https://pagead2.googlesyndication.com https://*.upstash.io",
    "frame-src https://googleads.g.doubleclick.net https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    // Match all pages but skip API routes, static files, and Next.js internals
    "/((?!api|_next/static|_next/image|favicon\\.ico|icons|manifest\\.json|sw\\.js|robots\\.txt|sitemap\\.xml).*)",
  ],
};
