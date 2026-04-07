/**
 * User prediction game — scoring logic and visitor ID management.
 *
 * Scoring rules:
 *   Exact score correct:  3 points
 *   Correct outcome (W/D/L) but wrong score:  1 point
 *   Wrong outcome:  0 points
 */

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export interface ScoringResult {
  points: number;
  exactScore: boolean;
  correctOutcome: boolean;
}

export function scorePrediction(
  predicted: { homeScore: number; awayScore: number },
  actual: { homeScore: number; awayScore: number },
): ScoringResult {
  const predOutcome = getOutcome(predicted.homeScore, predicted.awayScore);
  const actOutcome = getOutcome(actual.homeScore, actual.awayScore);

  const exactScore =
    predicted.homeScore === actual.homeScore &&
    predicted.awayScore === actual.awayScore;

  const correctOutcome = predOutcome === actOutcome;

  let points = 0;
  if (exactScore) {
    points = 3;
  } else if (correctOutcome) {
    points = 1;
  }

  return { points, exactScore, correctOutcome };
}

function getOutcome(home: number, away: number): "home" | "draw" | "away" {
  if (home > away) return "home";
  if (home < away) return "away";
  return "draw";
}

// ---------------------------------------------------------------------------
// Visitor ID (client-side only)
// ---------------------------------------------------------------------------

const VISITOR_KEY = "prediction-game:visitorId";
const NICKNAME_KEY = "prediction-game:nickname";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = generateVisitorId();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function generateVisitorId(): string {
  // Crypto-random 12-char hex string
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  // Fallback
  return (
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36)
  );
}

export function getNickname(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NICKNAME_KEY) || "";
}

export function setNickname(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NICKNAME_KEY, name.trim().slice(0, 30));
}

// ---------------------------------------------------------------------------
// Types shared between client and API
// ---------------------------------------------------------------------------

export interface UserPrediction {
  matchId: number;
  visitorId: string;
  homeScore: number;
  awayScore: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string; // YYYY-MM-DD
  nickname?: string;
  createdAt: number; // Unix ms
}

export interface LeaderboardEntry {
  visitorId: string;
  nickname: string;
  total: number;
  correct: number;
  exactScore: number;
  points: number;
}
