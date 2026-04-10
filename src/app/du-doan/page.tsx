"use client";

import { Navbar } from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { useState, useSyncExternalStore } from "react";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import {
  getVisitorId,
  getNickname,
  setNickname as saveNickname,
} from "@/lib/prediction-game";
import type { LeaderboardEntry } from "@/lib/prediction-game";

interface PredictionEntry {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
  prediction: {
    homeWin: number;
    draw: number;
    awayWin: number;
    btts: number;
    over25: number;
  };
  result?: {
    homeGoals: number;
    awayGoals: number;
    outcome: "home" | "draw" | "away";
  };
  correct?: boolean;
}

interface AccuracyStats {
  totalTracked: number;
  totalResolved: number;
  correctOutcome: number;
  correctPct: number;
  correctBtts: number;
  bttsPct: number;
  correctOver25: number;
  over25Pct: number;
  recentPredictions: PredictionEntry[];
  calibration: { bucket: string; predicted: number; actual: number; count: number }[];
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-4 text-center">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-accent" : ""}`}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-text-muted mt-1">{sub}</p>}
    </div>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-2 bg-border/30 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function PredictionRow({ entry }: { entry: PredictionEntry }) {
  const predictedOutcome =
    entry.prediction.homeWin >= entry.prediction.draw &&
    entry.prediction.homeWin >= entry.prediction.awayWin
      ? "home"
      : entry.prediction.awayWin >= entry.prediction.draw
        ? "away"
        : "draw";

  const predictedLabel =
    predictedOutcome === "home"
      ? entry.homeTeam
      : predictedOutcome === "away"
        ? entry.awayTeam
        : "Hoà";

  const confidence =
    predictedOutcome === "home"
      ? entry.prediction.homeWin
      : predictedOutcome === "away"
        ? entry.prediction.awayWin
        : entry.prediction.draw;

  return (
    <Link
      href={`/match/${entry.matchId}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-bg-card/60 transition-colors border-b border-border/30 last:border-0"
    >
      {/* Status indicator */}
      <div className="w-6 text-center shrink-0">
        {entry.result ? (
          entry.correct ? (
            <span className="text-green-400 text-sm" title="Chính xác">
              &#10003;
            </span>
          ) : (
            <span className="text-red-400 text-sm" title="Sai">
              &#10007;
            </span>
          )
        ) : (
          <span className="w-2 h-2 rounded-full bg-accent-yellow/60 inline-block" title="Chờ kết quả" />
        )}
      </div>

      {/* Match info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">
          {entry.homeTeam} vs {entry.awayTeam}
        </p>
        <p className="text-[10px] text-text-muted">
          {entry.date} &bull; {entry.league}
        </p>
      </div>

      {/* Prediction */}
      <div className="text-right shrink-0">
        <p className="text-xs font-medium">{predictedLabel}</p>
        <p className="text-[10px] text-text-muted">{confidence}%</p>
      </div>

      {/* Result */}
      <div className="w-16 text-right shrink-0">
        {entry.result ? (
          <span className="text-sm font-bold">
            {entry.result.homeGoals} - {entry.result.awayGoals}
          </span>
        ) : (
          <span className="text-xs text-text-muted">Chờ</span>
        )}
      </div>
    </Link>
  );
}

const emptySubscribe = () => () => {};

function PlayerLeaderboard() {
  const visitorId = useSyncExternalStore(emptySubscribe, getVisitorId, () => "");
  const storedNickname = useSyncExternalStore(emptySubscribe, getNickname, () => "");
  const [nickname, setNickname] = useState(storedNickname);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");

  const { data, isLoading } = useQuery<{ leaderboard: LeaderboardEntry[] }>({
    queryKey: ["prediction-leaderboard"],
    queryFn: () =>
      fetch("/api/user-predictions/leaderboard").then((r) => r.json()),
    staleTime: 60 * 1000, // 1 min
  });

  const handleSaveNickname = () => {
    if (nicknameInput.trim()) {
      saveNickname(nicknameInput.trim());
      setNickname(nicknameInput.trim());
    }
    setEditingNickname(false);
  };

  const leaderboard = data?.leaderboard || [];

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Bảng xếp hạng người chơi</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Xếp hạng dựa trên dự đoán tỷ số của người dùng
          </p>
        </div>
        {!editingNickname ? (
          <button
            onClick={() => {
              setNicknameInput(nickname);
              setEditingNickname(true);
            }}
            className="text-xs text-accent hover:text-accent/80 transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-accent/50"
          >
            {nickname ? "Đổi biệt danh" : "Đặt biệt danh"}
          </button>
        ) : (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value.slice(0, 30))}
              placeholder="Biệt danh..."
              className="px-2 py-1 text-xs rounded-lg bg-bg-primary border border-border focus:border-accent focus:outline-none w-28"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveNickname()}
            />
            <button
              onClick={handleSaveNickname}
              className="text-xs text-green-400 hover:text-green-300"
            >
              Lưu
            </button>
            <button
              onClick={() => setEditingNickname(false)}
              className="text-xs text-text-muted hover:text-text-primary"
            >
              Hủy
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 border-b border-border/30 animate-pulse bg-border/10"
            />
          ))}
        </div>
      )}

      {!isLoading && leaderboard.length === 0 && (
        <div className="bg-bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-text-muted text-sm">
            Chưa có dự đoán nào
          </p>
          <p className="text-xs text-text-muted mt-1">
            Hãy dự đoán tỷ số các trận đấu sắp tới để lên bảng xếp hạng!
          </p>
        </div>
      )}

      {!isLoading && leaderboard.length > 0 && (
        <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2.5rem_1fr_3.5rem_3.5rem_3.5rem] sm:grid-cols-[3rem_1fr_4.5rem_4.5rem_4.5rem] px-4 py-2.5 text-[10px] sm:text-xs text-text-muted border-b border-border font-semibold">
            <span>#</span>
            <span>Người chơi</span>
            <span className="text-center">Dự đoán</span>
            <span className="text-center">Đúng</span>
            <span className="text-center">Điểm</span>
          </div>
          {/* Rows */}
          {leaderboard.map((entry, i) => {
            const isMe = entry.visitorId === visitorId;
            const rankEmoji =
              i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
            return (
              <div
                key={entry.visitorId}
                className={`grid grid-cols-[2.5rem_1fr_3.5rem_3.5rem_3.5rem] sm:grid-cols-[3rem_1fr_4.5rem_4.5rem_4.5rem] px-4 py-2.5 text-xs sm:text-sm border-b border-border/30 last:border-0 ${
                  isMe ? "bg-accent/5" : "hover:bg-bg-card/60"
                } transition-colors`}
              >
                <span className="font-bold">{rankEmoji}</span>
                <span className={`truncate ${isMe ? "text-accent font-semibold" : ""}`}>
                  {entry.nickname}
                  {isMe && (
                    <span className="text-[10px] text-accent ml-1">(bạn)</span>
                  )}
                </span>
                <span className="text-center text-text-muted">
                  {entry.total}
                </span>
                <span className="text-center text-green-400">
                  {entry.correct}
                </span>
                <span className="text-center font-bold">{entry.points}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Scoring rules */}
      <div className="mt-4 p-3 bg-bg-card/50 rounded-xl border border-border/50">
        <p className="text-xs font-semibold mb-1.5">Cách tính điểm</p>
        <div className="flex gap-4 text-[10px] text-text-muted">
          <span>Đúng tỷ số: <strong className="text-accent">3 điểm</strong></span>
          <span>Đúng kết quả: <strong className="text-text-primary">1 điểm</strong></span>
          <span>Sai: <strong className="text-text-muted">0 điểm</strong></span>
        </div>
      </div>
    </div>
  );
}

export default function PredictionPage() {
  const { data: stats, isLoading } = useQuery<AccuracyStats>({
    queryKey: ["prediction-stats"],
    queryFn: () => fetch("/api/predictions").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6 xl:px-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Độ chính xác dự đoán</h1>
          <p className="text-xs text-text-muted mt-1">
            Theo dõi hiệu quả mô hình dự đoán Poisson của chúng tôi
          </p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-bg-card rounded-xl border border-border p-4 h-20 animate-pulse"
              />
            ))}
          </div>
        )}

        {stats && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard
                label="Tổng dự đoán"
                value={String(stats.totalTracked)}
                sub={`${stats.totalResolved} đã có kết quả`}
              />
              <StatCard
                label="Kết quả đúng"
                value={`${stats.correctPct}%`}
                sub={`${stats.correctOutcome}/${stats.totalResolved}`}
                accent
              />
              <StatCard
                label="BTTS đúng"
                value={`${stats.bttsPct}%`}
                sub={`${stats.correctBtts}/${stats.totalResolved}`}
              />
              <StatCard
                label="O2.5 đúng"
                value={`${stats.over25Pct}%`}
                sub={`${stats.correctOver25}/${stats.totalResolved}`}
              />
            </div>

            {/* Calibration chart */}
            {stats.calibration.some((b) => b.count > 0) && (
              <div className="bg-bg-card rounded-xl border border-border p-4 mb-6">
                <h2 className="text-sm font-semibold mb-3">
                  Hiệu chuẩn mô hình
                </h2>
                <p className="text-[10px] text-text-muted mb-4">
                  So sánh xác suất dự đoán với tỷ lệ xảy ra thực tế
                </p>
                <div className="space-y-3">
                  {stats.calibration
                    .filter((b) => b.count > 0)
                    .map((b) => (
                      <div key={b.bucket}>
                        <div className="flex justify-between text-[10px] text-text-muted mb-1">
                          <span>
                            {b.bucket} ({b.count} trận)
                          </span>
                          <span>
                            Dự đoán {b.predicted}% / Thực tế{" "}
                            {b.count > 0
                              ? Math.round(
                                  (b.actual / (b.count * 100)) * 100
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <ProgressBar pct={b.predicted} color="bg-accent/60" />
                          <ProgressBar
                            pct={
                              b.count > 0
                                ? Math.round(
                                    (b.actual / (b.count * 100)) * 100
                                  )
                                : 0
                            }
                            color="bg-green-500/60"
                          />
                        </div>
                      </div>
                    ))}
                </div>
                <div className="flex gap-4 mt-3 text-[10px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-1.5 rounded bg-accent/60" /> Dự đoán
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-1.5 rounded bg-green-500/60" /> Thực
                    tế
                  </span>
                </div>
              </div>
            )}

            {/* Recent predictions */}
            <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold">Dự đoán gần đây</h2>
              </div>
              {stats.recentPredictions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-text-muted text-sm">
                    Chưa có dự đoán nào được theo dõi
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Dự đoán sẽ được lưu tự động khi bạn xem phân tích trước
                    trận
                  </p>
                </div>
              ) : (
                <div>
                  {stats.recentPredictions.map((entry) => (
                    <PredictionRow key={entry.matchId} entry={entry} />
                  ))}
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="mt-6 p-4 bg-bg-card/50 rounded-xl border border-border/50">
              <h3 className="font-semibold text-sm mb-2">
                Cách hoạt động
              </h3>
              <ul className="text-xs text-text-muted space-y-1">
                <li>
                  &bull; Mô hình Poisson tính xác suất dựa trên sức mạnh tấn
                  công/phòng ngự từ bảng xếp hạng
                </li>
                <li>
                  &bull; Hệ số lợi thế sân nhà: 1.1x (đội nhà) / 0.9x (đội
                  khách)
                </li>
                <li>
                  &bull; Kết hợp 90% mô hình Poisson + 10% lịch sử đối đầu
                </li>
                <li>
                  &bull; Dự đoán tự động lưu khi bạn xem trang phân tích trước
                  trận
                </li>
                <li>
                  &bull; Kết quả được cập nhật sau khi trận đấu kết thúc
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Player Leaderboard */}
        <PlayerLeaderboard />

        <Footer />
      </div>
    </>
  );
}
