import { Standing } from "./types";

/**
 * Poisson probability mass function: P(k) = (lambda^k * e^(-lambda)) / k!
 */
function poissonPmf(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) {
    logP -= Math.log(i);
  }
  return Math.exp(logP);
}

/**
 * Compute match prediction based on standings data and optional H2H record.
 *
 * Uses a Poisson model with attack/defense strength derived from league standings,
 * then optionally blends in head-to-head history.
 */
export function computePrediction(
  homeStanding: Standing | null,
  awayStanding: Standing | null,
  h2h?: { homeWins: number; draws: number; awayWins: number } | null
): {
  homeWin: number;
  draw: number;
  awayWin: number;
  btts: number;
  over25: number;
} {
  // Default if standings data is missing
  if (
    !homeStanding ||
    !awayStanding ||
    homeStanding.playedGames === 0 ||
    awayStanding.playedGames === 0
  ) {
    return { homeWin: 40, draw: 25, awayWin: 35, btts: 50, over25: 50 };
  }

  // Compute attack and defense rates
  const homeAttack = homeStanding.goalsFor / homeStanding.playedGames;
  const homeDefense = homeStanding.goalsAgainst / homeStanding.playedGames;
  const awayAttack = awayStanding.goalsFor / awayStanding.playedGames;
  const awayDefense = awayStanding.goalsAgainst / awayStanding.playedGames;

  // Expected goals with home advantage factor
  const expectedHomeGoals = homeAttack * awayDefense * 1.1;
  const expectedAwayGoals = awayAttack * homeDefense * 0.9;

  // Clamp to reasonable range
  const lambdaHome = Math.max(0.2, Math.min(expectedHomeGoals, 5));
  const lambdaAway = Math.max(0.2, Math.min(expectedAwayGoals, 5));

  const MAX_GOALS = 7;

  // Build probability matrix P(home=i, away=j)
  const homeProbs: number[] = [];
  const awayProbs: number[] = [];
  for (let k = 0; k <= MAX_GOALS; k++) {
    homeProbs.push(poissonPmf(k, lambdaHome));
    awayProbs.push(poissonPmf(k, lambdaAway));
  }

  let pHomeWin = 0;
  let pDraw = 0;
  let pAwayWin = 0;
  let pBothScore = 0;
  let pUnder25 = 0;

  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      const p = homeProbs[h] * awayProbs[a];

      if (h > a) pHomeWin += p;
      else if (h === a) pDraw += p;
      else pAwayWin += p;

      if (h > 0 && a > 0) pBothScore += p;
      if (h + a <= 2) pUnder25 += p;
    }
  }

  let homeWinPct = pHomeWin * 100;
  let drawPct = pDraw * 100;
  let awayWinPct = pAwayWin * 100;
  let bttsPct = pBothScore * 100;
  let over25Pct = (1 - pUnder25) * 100;

  // Blend in H2H data at 10% weight if available
  if (h2h) {
    const totalH2H = h2h.homeWins + h2h.draws + h2h.awayWins;
    if (totalH2H > 0) {
      const h2hHome = (h2h.homeWins / totalH2H) * 100;
      const h2hDraw = (h2h.draws / totalH2H) * 100;
      const h2hAway = (h2h.awayWins / totalH2H) * 100;

      homeWinPct = homeWinPct * 0.9 + h2hHome * 0.1;
      drawPct = drawPct * 0.9 + h2hDraw * 0.1;
      awayWinPct = awayWinPct * 0.9 + h2hAway * 0.1;
    }
  }

  // Round to integers summing to 100
  const rawSum = homeWinPct + drawPct + awayWinPct;
  let homeWin = Math.round((homeWinPct / rawSum) * 100);
  let draw = Math.round((drawPct / rawSum) * 100);
  let awayWin = Math.round((awayWinPct / rawSum) * 100);

  // Adjust rounding error
  const diff = 100 - (homeWin + draw + awayWin);
  if (diff !== 0) {
    // Add the difference to the largest value
    if (homeWin >= draw && homeWin >= awayWin) homeWin += diff;
    else if (draw >= homeWin && draw >= awayWin) draw += diff;
    else awayWin += diff;
  }

  const btts = Math.round(Math.max(0, Math.min(100, bttsPct)));
  const over25 = Math.round(Math.max(0, Math.min(100, over25Pct)));

  return { homeWin, draw, awayWin, btts, over25 };
}
