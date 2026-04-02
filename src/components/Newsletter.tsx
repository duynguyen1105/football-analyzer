"use client";

import { useState } from "react";

export function Newsletter({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className={`bg-accent/10 border border-accent/20 rounded-xl p-4 text-center ${compact ? "" : "py-6"}`}>
        <p className="text-sm font-medium text-accent">Đăng ký thành công!</p>
        <p className="text-xs text-text-muted mt-1">Bạn sẽ nhận bản tin hàng tuần về các trận đấu lớn.</p>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email của bạn..."
          className="flex-1 bg-bg-card border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-accent/50 transition-colors text-text-primary placeholder:text-text-muted"
          required
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-3 py-2 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 shrink-0"
        >
          {status === "loading" ? "..." : "Đăng ký"}
        </button>
      </form>
    );
  }

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-sm">Bản tin tuần</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Nhận nhận định các trận đấu lớn trong tuần qua email mỗi thứ Hai
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn..."
          className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-accent/50 transition-colors text-text-primary placeholder:text-text-muted"
          required
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 shrink-0"
        >
          {status === "loading" ? "..." : "Đăng ký"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-xs text-accent-red mt-2">Có lỗi xảy ra. Vui lòng thử lại.</p>
      )}
      <p className="text-[9px] text-text-muted mt-2">Miễn phí. Hủy bất cứ lúc nào. Không spam.</p>
    </div>
  );
}
