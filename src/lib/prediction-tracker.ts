import { getCached, setCached } from "./cache";

export interface StoredPrediction {
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
  storedAt: number;
}

const PREDICTIONS_KEY = "prediction-tracker:all";
const TTL_90_DAYS = 90 * 24 * 60 * 60; // 90 days in seconds

/** Load all tracked predictions from cache */
async function loadPredictions(): Promise<StoredPrediction[]> {
  const cached = await getCached(PREDICTIONS_KEY);
  if (!cached) return [];
  try {
    return typeof cached === "string" ? JSON.parse(cached) : cached;
  } catch {
    return [];
  }
}

/** Save all predictions to cache */
async function savePredictions(predictions: StoredPrediction[]): Promise<void> {
  await setCached(PREDICTIONS_KEY, JSON.stringify(predictions), TTL_90_DAYS);
}

/** Store a prediction for a match (only if not already stored) */
export async function storePrediction(
  matchId: number,
  data: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    date: string;
    prediction: StoredPrediction["prediction"];
  }
): Promise<void> {
  const predictions = await loadPredictions();

  // Don't duplicate
  if (predictions.some((p) => p.matchId === matchId)) return;

  predictions.push({
    matchId,
    ...data,
    storedAt: Date.now(),
  });

  // Keep only last 500 predictions
  if (predictions.length > 500) {
    predictions.splice(0, predictions.length - 500);
  }

  await savePredictions(predictions);
}

/** Record a match result against a stored prediction */
export async function recordResult(
  matchId: number,
  homeGoals: number,
  awayGoals: number
): Promise<boolean> {
  const predictions = await loadPredictions();
  const pred = predictions.find((p) => p.matchId === matchId);
  if (!pred || pred.result) return false;

  pred.result = {
    homeGoals,
    awayGoals,
    outcome: homeGoals > awayGoals ? "home" : homeGoals < awayGoals ? "away" : "draw",
  };

  await savePredictions(predictions);
  return true;
}

/** Compute accuracy statistics */
export interface AccuracyStats {
  totalTracked: number;
  totalResolved: number;
  correctOutcome: number;
  correctPct: number;
  correctBtts: number;
  bttsPct: number;
  correctOver25: number;
  over25Pct: number;
  recentPredictions: (StoredPrediction & { correct?: boolean })[];
  calibration: { bucket: string; predicted: number; actual: number; count: number }[];
}

export async function getAccuracyStats(): Promise<AccuracyStats> {
  const predictions = await loadPredictions();

  const resolved = predictions.filter((p) => p.result);
  let correctOutcome = 0;
  let correctBtts = 0;
  let correctOver25 = 0;

  // Calibration buckets: 0-20%, 20-40%, 40-60%, 60-80%, 80-100%
  const buckets = [
    { min: 0, max: 20, label: "0-20%", totalPredicted: 0, totalActual: 0, count: 0 },
    { min: 20, max: 40, label: "20-40%", totalPredicted: 0, totalActual: 0, count: 0 },
    { min: 40, max: 60, label: "40-60%", totalPredicted: 0, totalActual: 0, count: 0 },
    { min: 60, max: 80, label: "60-80%", totalPredicted: 0, totalActual: 0, count: 0 },
    { min: 80, max: 100, label: "80-100%", totalPredicted: 0, totalActual: 0, count: 0 },
  ];

  const recentWithCorrectness: (StoredPrediction & { correct?: boolean })[] = [];

  for (const p of resolved) {
    const r = p.result!;
    const predictedOutcome =
      p.prediction.homeWin >= p.prediction.draw && p.prediction.homeWin >= p.prediction.awayWin
        ? "home"
        : p.prediction.awayWin >= p.prediction.draw
          ? "away"
          : "draw";

    const isCorrect = predictedOutcome === r.outcome;
    if (isCorrect) correctOutcome++;

    // BTTS check
    const actualBtts = r.homeGoals > 0 && r.awayGoals > 0;
    const predictedBtts = p.prediction.btts > 50;
    if (predictedBtts === actualBtts) correctBtts++;

    // Over 2.5 check
    const actualOver25 = r.homeGoals + r.awayGoals > 2;
    const predictedOver25 = p.prediction.over25 > 50;
    if (predictedOver25 === actualOver25) correctOver25++;

    // Calibration: the predicted probability for the actual outcome
    const predPctForOutcome =
      r.outcome === "home"
        ? p.prediction.homeWin
        : r.outcome === "away"
          ? p.prediction.awayWin
          : p.prediction.draw;

    for (const bucket of buckets) {
      if (predPctForOutcome >= bucket.min && predPctForOutcome < bucket.max) {
        bucket.totalPredicted += predPctForOutcome;
        bucket.totalActual += 100; // The outcome did happen (100%)
        bucket.count++;
        break;
      }
    }

    recentWithCorrectness.push({ ...p, correct: isCorrect });
  }

  // Also include unresolved ones
  for (const p of predictions.filter((p) => !p.result)) {
    recentWithCorrectness.push(p);
  }

  const totalResolved = resolved.length;

  return {
    totalTracked: predictions.length,
    totalResolved,
    correctOutcome,
    correctPct: totalResolved > 0 ? Math.round((correctOutcome / totalResolved) * 100) : 0,
    correctBtts,
    bttsPct: totalResolved > 0 ? Math.round((correctBtts / totalResolved) * 100) : 0,
    correctOver25,
    over25Pct: totalResolved > 0 ? Math.round((correctOver25 / totalResolved) * 100) : 0,
    recentPredictions: recentWithCorrectness.slice(-20).reverse(),
    calibration: buckets.map((b) => ({
      bucket: b.label,
      predicted: b.count > 0 ? Math.round(b.totalPredicted / b.count) : 0,
      actual: b.count > 0 ? Math.round(b.totalActual / b.count) : 0,
      count: b.count,
    })),
  };
}

/** Get all stored predictions (for the resolve job) */
export async function getAllPredictions(): Promise<StoredPrediction[]> {
  return loadPredictions();
}
