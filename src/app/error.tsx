"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">&#9888;&#65039;</div>
        <h1 className="text-xl font-bold mb-2">Đã xảy ra lỗi</h1>
        <p className="text-sm text-text-muted mb-6">
          Có lỗi xảy ra khi tải trang. Vui lòng thử lại.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-bg-card border border-border rounded-lg text-sm font-medium hover:border-accent/40 transition-colors"
          >
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
