"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key) {
        case "/": {
          e.preventDefault();
          const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Tìm"]');
          searchInput?.focus();
          break;
        }
        case "Escape": {
          (document.activeElement as HTMLElement)?.blur();
          break;
        }
        case "h":
          if (!e.metaKey && !e.ctrlKey) router.push("/");
          break;
        case "t":
          if (!e.metaKey && !e.ctrlKey) router.push("/hom-nay");
          break;
        case "l":
          if (!e.metaKey && !e.ctrlKey) router.push("/truc-tiep");
          break;
        case "?": {
          // Show shortcut help
          const existing = document.getElementById("shortcut-help");
          if (existing) { existing.remove(); return; }
          const div = document.createElement("div");
          div.id = "shortcut-help";
          div.className = "fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm";
          div.onclick = () => div.remove();
          div.innerHTML = `
            <div class="bg-bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl" onclick="event.stopPropagation()">
              <h3 class="font-bold text-sm mb-4">Phím tắt</h3>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between"><span class="text-text-muted">Tìm kiếm</span><kbd class="px-2 py-0.5 bg-border/30 rounded text-text-secondary font-mono">/</kbd></div>
                <div class="flex justify-between"><span class="text-text-muted">Trang chủ</span><kbd class="px-2 py-0.5 bg-border/30 rounded text-text-secondary font-mono">h</kbd></div>
                <div class="flex justify-between"><span class="text-text-muted">Hôm nay</span><kbd class="px-2 py-0.5 bg-border/30 rounded text-text-secondary font-mono">t</kbd></div>
                <div class="flex justify-between"><span class="text-text-muted">Trực tiếp</span><kbd class="px-2 py-0.5 bg-border/30 rounded text-text-secondary font-mono">l</kbd></div>
                <div class="flex justify-between"><span class="text-text-muted">Đóng</span><kbd class="px-2 py-0.5 bg-border/30 rounded text-text-secondary font-mono">Esc</kbd></div>
                <div class="flex justify-between"><span class="text-text-muted">Trợ giúp</span><kbd class="px-2 py-0.5 bg-border/30 rounded text-text-secondary font-mono">?</kbd></div>
              </div>
              <p class="text-[10px] text-text-muted mt-4 text-center">Nhấn bất kỳ đâu để đóng</p>
            </div>`;
          document.body.appendChild(div);
          break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}
