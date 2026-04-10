"use client";

import { useState, useEffect, useCallback } from "react";
import { getVisitorId, getNickname, setNickname } from "@/lib/prediction-game";

interface Comment {
  visitorId: string;
  nickname: string;
  text: string;
  createdAt: number;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "vừa xong";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export function MatchComments({ matchId }: { matchId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [nick, setNick] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?matchId=${matchId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    setNick(getNickname() || "");
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    if (trimmed.length > 500) {
      setError("Bình luận tối đa 500 ký tự");
      return;
    }

    setSubmitting(true);
    setError(null);

    const visitorId = getVisitorId();
    const nickname = nick.trim() || `Khán giả ${visitorId.slice(0, 4)}`;

    // Save nickname for next time
    if (nick.trim()) setNickname(nick.trim());

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, visitorId, nickname, text: trimmed }),
      });

      if (res.ok) {
        setText("");
        await fetchComments();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Không thể gửi bình luận");
      }
    } catch {
      setError("Lỗi kết nối, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-bg-card rounded-2xl border border-border p-4 md:p-5">
      <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        Bình luận ({comments.length})
      </h3>

      {/* Comment input */}
      <div className="space-y-3 mb-5">
        <input
          type="text"
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          placeholder="Tên hiển thị (không bắt buộc)"
          maxLength={30}
          className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
        />
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            maxLength={500}
            rows={2}
            className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            className="self-end px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {submitting ? "..." : "Bình luận"}
          </button>
        </div>
        {text.length > 0 && (
          <p className="text-[10px] text-text-muted text-right">{text.length}/500</p>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-border/30 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 bg-border/30 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-border/20 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-4">
          Chưa có bình luận nào. Hãy là người đầu tiên!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((c, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                {c.nickname.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold truncate">{c.nickname}</span>
                  <span className="text-[10px] text-text-muted shrink-0">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-sm text-text-secondary break-words">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
