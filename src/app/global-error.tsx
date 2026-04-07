"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="vi">
      <body>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Đã xảy ra lỗi</h1>
            <p style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "1.5rem" }}>
              Có lỗi xảy ra khi tải trang. Vui lòng thử lại.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{ padding: "0.5rem 1rem", background: "#3b82f6", color: "white", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 500, border: "none", cursor: "pointer" }}
              >
                Thử lại
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                style={{ padding: "0.5rem 1rem", border: "1px solid #334155", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 500, color: "inherit", textDecoration: "none" }}
              >
                Trang chủ
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
