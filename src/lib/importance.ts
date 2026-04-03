import { Standing } from "./types";

const KNOCKOUT_ROUND_IMPORTANCE: Record<string, { score: number; reason: string }> = {
  final: { score: 10, reason: "Trận chung kết" },
  "semi-finals": { score: 9, reason: "Bán kết" },
  "quarter-finals": { score: 9, reason: "Tứ kết" },
  "round of 16": { score: 8, reason: "Vòng 16 đội" },
  "round of 32": { score: 7, reason: "Vòng 32 đội" },
};

/**
 * Compute importance for knockout/playoff matches.
 * Returns a high fixed score based on the round name.
 */
export function computeKnockoutImportance(round?: string): { score: number; reason: string } {
  if (!round) return { score: 8, reason: "Vòng loại trực tiếp" };

  const lower = round.toLowerCase();
  for (const [key, value] of Object.entries(KNOCKOUT_ROUND_IMPORTANCE)) {
    if (lower.includes(key)) return value;
  }

  // Playoff or other knockout format
  if (lower.includes("playoff") || lower.includes("play-off")) {
    return { score: 8, reason: "Vòng play-off" };
  }

  return { score: 8, reason: "Vòng loại trực tiếp" };
}

export function computeImportance(
  homeStanding: Standing | null,
  awayStanding: Standing | null,
  totalTeams: number = 20
): { score: number; reason: string } {
  let score = 5;
  const reasons: string[] = [];

  if (!homeStanding || !awayStanding) {
    return { score, reason: "" };
  }

  const homePos = homeStanding.position;
  const awayPos = awayStanding.position;
  const gap = Math.abs(homePos - awayPos);

  // Both teams in top 2 — title race (checked first as it's more specific than top 4)
  if (homePos <= 2 && awayPos <= 2) {
    score += 3;
    reasons.push("Cuộc đua vô địch");
  }
  // Both teams in top 4
  else if (homePos <= 4 && awayPos <= 4) {
    score += 2;
    reasons.push("Cuộc đua top 4");
  }

  // Position gap <= 3
  if (gap <= 3) {
    score += 1;
    reasons.push("Trận cầu cân sức");
  }

  // One team in bottom 3
  const bottomThreshold = totalTeams - 2; // positions totalTeams, totalTeams-1, totalTeams-2
  if (homePos >= bottomThreshold || awayPos >= bottomThreshold) {
    score += 1;
    reasons.push("Cuộc chiến trụ hạng");
  }

  // Both in bottom 5
  const bottomFiveThreshold = totalTeams - 4;
  if (homePos >= bottomFiveThreshold && awayPos >= bottomFiveThreshold) {
    score += 2;
    reasons.push("Trận 6 điểm sinh tử");
  }

  // Both in top half and gap <= 5
  const topHalf = Math.floor(totalTeams / 2);
  if (homePos <= topHalf && awayPos <= topHalf && gap <= 5) {
    score += 1;
    reasons.push("Tranh suất châu Âu");
  }

  // Cap at 10
  score = Math.min(score, 10);

  return { score, reason: reasons.join(", ") };
}
