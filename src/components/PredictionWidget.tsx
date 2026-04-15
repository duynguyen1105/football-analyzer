"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getVisitorId,
  getNickname,
  setNickname as saveNickname,
} from "@/lib/prediction-game";
import type { UserPrediction } from "@/lib/prediction-game";

const emptySubscribe = () => () => {};

function useVisitorId(): string {
  return useSyncExternalStore(emptySubscribe, getVisitorId, () => "");
}

function useStoredNickname(): string {
  return useSyncExternalStore(emptySubscribe, getNickname, () => "");
}

interface PredictionWidgetProps {
  matchId: number;
  homeTeam: { name: string; shortName: string; crest: string };
  awayTeam: { name: string; shortName: string; crest: string };
  league: string;
  date: string; // YYYY-MM-DD
}

export function PredictionWidget({
  matchId,
  homeTeam,
  awayTeam,
  league,
  date,
}: PredictionWidgetProps) {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const visitorId = useVisitorId();
  const storedNickname = useStoredNickname();
  const [nickname, setNickname] = useState(storedNickname);
  const [showNickname, setShowNickname] = useState(false);
  const queryClient = useQueryClient();

  // Check if user already predicted this match
  const { data: existingPrediction, isLoading: checking } = useQuery<UserPrediction | null>({
    queryKey: ["user-prediction", visitorId, matchId],
    queryFn: async () => {
      if (!visitorId) return null;
      const res = await fetch(
        `/api/user-predictions?visitorId=${encodeURIComponent(visitorId)}`,
      );
      if (!res.ok) return null;
      const data = await res.json();
      const found = (data.predictions || []).find(
        (p: UserPrediction) => p.matchId === matchId,
      );
      return found || null;
    },
    enabled: !!visitorId,
    staleTime: 5 * 60 * 1000,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user-predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          visitorId,
          homeScore,
          awayScore,
          homeTeam: homeTeam.name,
          awayTeam: awayTeam.name,
          league,
          date,
          nickname: nickname || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Lỗi");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["user-prediction", visitorId, matchId],
        data,
      );
      queryClient.invalidateQueries({ queryKey: ["match-predictions", matchId] });
      if (nickname) saveNickname(nickname);
    },
  });

  const handleSubmit = useCallback(() => {
    if (!visitorId) return;
    submitMutation.mutate();
  }, [visitorId, submitMutation]);

  // Already predicted
  if (existingPrediction) {
    return (
      <div className="bg-bg-card rounded-2xl border border-border p-4 md:p-5 mb-6">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Dự đoán của bạn
        </h3>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <img
              src={homeTeam.crest}
              alt={homeTeam.shortName}
              className="w-8 h-8 md:w-10 md:h-10 object-contain mx-auto mb-1"
            />
            <p className="text-xs font-medium">{homeTeam.shortName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-bold text-accent">
              {existingPrediction.homeScore}
            </span>
            <span className="text-text-muted text-lg">-</span>
            <span className="text-2xl md:text-3xl font-bold text-accent-2">
              {existingPrediction.awayScore}
            </span>
          </div>
          <div className="text-center">
            <img
              src={awayTeam.crest}
              alt={awayTeam.shortName}
              className="w-8 h-8 md:w-10 md:h-10 object-contain mx-auto mb-1"
            />
            <p className="text-xs font-medium">{awayTeam.shortName}</p>
          </div>
        </div>
        <p className="text-center text-[10px] text-green-400 mt-3 flex items-center justify-center gap-1">
          <span>&#10003;</span> Đã gửi dự đoán
        </p>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="bg-bg-card rounded-2xl border border-border p-4 md:p-5 mb-6">
        <div className="h-4 w-40 bg-border/40 rounded animate-pulse mb-4" />
        <div className="h-16 bg-border/15 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-4 md:p-5 mb-6">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />
        Dự đoán tỷ số
      </h3>
      <p className="text-[10px] text-text-muted mb-4">
        Đoán chính xác tỷ số: 3 điểm | Đúng kết quả (thắng/hòa/thua): 1 điểm
      </p>

      <div className="flex items-center justify-center gap-3 md:gap-5 mb-4">
        {/* Home team */}
        <div className="text-center flex-1">
          <img
            src={homeTeam.crest}
            alt={homeTeam.shortName}
            className="w-8 h-8 md:w-10 md:h-10 object-contain mx-auto mb-1"
          />
          <p className="text-xs font-medium truncate">{homeTeam.shortName}</p>
        </div>

        {/* Score inputs */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={99}
            value={homeScore}
            onChange={(e) => setHomeScore(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
            className="w-14 h-12 md:w-16 md:h-14 text-center text-xl md:text-2xl font-bold rounded-xl bg-bg-primary border border-border focus:border-accent focus:outline-none transition-colors"
            aria-label={`Tỷ số ${homeTeam.shortName}`}
          />
          <span className="text-text-muted text-lg font-bold">-</span>
          <input
            type="number"
            min={0}
            max={99}
            value={awayScore}
            onChange={(e) => setAwayScore(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
            className="w-14 h-12 md:w-16 md:h-14 text-center text-xl md:text-2xl font-bold rounded-xl bg-bg-primary border border-border focus:border-accent-2 focus:outline-none transition-colors"
            aria-label={`Tỷ số ${awayTeam.shortName}`}
          />
        </div>

        {/* Away team */}
        <div className="text-center flex-1">
          <img
            src={awayTeam.crest}
            alt={awayTeam.shortName}
            className="w-8 h-8 md:w-10 md:h-10 object-contain mx-auto mb-1"
          />
          <p className="text-xs font-medium truncate">{awayTeam.shortName}</p>
        </div>
      </div>

      {/* Nickname (optional) */}
      {showNickname ? (
        <div className="mb-3">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 30))}
            placeholder="Nhập biệt danh (tùy chọn)"
            className="w-full px-3 py-2 text-sm rounded-lg bg-bg-primary border border-border focus:border-accent focus:outline-none transition-colors"
          />
        </div>
      ) : (
        <button
          onClick={() => setShowNickname(true)}
          className="text-[10px] text-text-muted hover:text-accent transition-colors mb-3 block"
        >
          + Đặt biệt danh
        </button>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitMutation.isPending}
        className="w-full py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitMutation.isPending ? "Đang gửi..." : "Dự đoán"}
      </button>

      {submitMutation.isError && (
        <p className="text-red-400 text-xs mt-2 text-center">
          {(submitMutation.error as Error).message}
        </p>
      )}
    </div>
  );
}
