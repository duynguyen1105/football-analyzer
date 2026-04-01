import { Standing } from "./types";

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
