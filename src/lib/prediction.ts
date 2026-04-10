import { Match, Standing } from "./types";

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

type PredictionResult = {
  homeWin: number;
  draw: number;
  awayWin: number;
  btts: number;
  over25: number;
};

/**
 * Derive attack/defense rates from recent form results.
 * Used for knockout matches where standings are irrelevant.
 */
function ratesFromRecentMatches(
  teamId: number,
  recentMatches: Match[]
): { attack: number; defense: number } | null {
  const finished = recentMatches.filter(
    (m) => m.status === "FINISHED" && m.score
  );
  if (finished.length === 0) return null;

  let goalsFor = 0;
  let goalsAgainst = 0;
  for (const m of finished) {
    const isHome = m.homeTeam.id === teamId;
    goalsFor += isHome ? (m.score!.home ?? 0) : (m.score!.away ?? 0);
    goalsAgainst += isHome ? (m.score!.away ?? 0) : (m.score!.home ?? 0);
  }

  return {
    attack: goalsFor / finished.length,
    defense: goalsAgainst / finished.length,
  };
}

/**
 * Core Poisson calculation from attack/defense rates.
 */
function poissonFromRates(
  homeAttack: number,
  homeDefense: number,
  awayAttack: number,
  awayDefense: number
): { homeWinPct: number; drawPct: number; awayWinPct: number; bttsPct: number; over25Pct: number } {
  const expectedHomeGoals = homeAttack * awayDefense * 1.1;
  const expectedAwayGoals = awayAttack * homeDefense * 0.9;

  const lambdaHome = Math.max(0.2, Math.min(expectedHomeGoals, 5));
  const lambdaAway = Math.max(0.2, Math.min(expectedAwayGoals, 5));

  const MAX_GOALS = 7;
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

  return {
    homeWinPct: pHomeWin * 100,
    drawPct: pDraw * 100,
    awayWinPct: pAwayWin * 100,
    bttsPct: pBothScore * 100,
    over25Pct: (1 - pUnder25) * 100,
  };
}

function blendH2H(
  homeWinPct: number,
  drawPct: number,
  awayWinPct: number,
  h2h: { homeWins: number; draws: number; awayWins: number } | null | undefined,
  weight: number
): { homeWinPct: number; drawPct: number; awayWinPct: number } {
  if (!h2h) return { homeWinPct, drawPct, awayWinPct };
  const total = h2h.homeWins + h2h.draws + h2h.awayWins;
  if (total === 0) return { homeWinPct, drawPct, awayWinPct };

  const h2hHome = (h2h.homeWins / total) * 100;
  const h2hDraw = (h2h.draws / total) * 100;
  const h2hAway = (h2h.awayWins / total) * 100;
  const base = 1 - weight;

  return {
    homeWinPct: homeWinPct * base + h2hHome * weight,
    drawPct: drawPct * base + h2hDraw * weight,
    awayWinPct: awayWinPct * base + h2hAway * weight,
  };
}

function roundAndNormalize(
  homeWinPct: number,
  drawPct: number,
  awayWinPct: number,
  bttsPct: number,
  over25Pct: number
): PredictionResult {
  const rawSum = homeWinPct + drawPct + awayWinPct;
  let homeWin = Math.round((homeWinPct / rawSum) * 100);
  let draw = Math.round((drawPct / rawSum) * 100);
  let awayWin = Math.round((awayWinPct / rawSum) * 100);

  const diff = 100 - (homeWin + draw + awayWin);
  if (diff !== 0) {
    if (homeWin >= draw && homeWin >= awayWin) homeWin += diff;
    else if (draw >= homeWin && draw >= awayWin) draw += diff;
    else awayWin += diff;
  }

  return {
    homeWin,
    draw,
    awayWin,
    btts: Math.round(Math.max(0, Math.min(100, bttsPct))),
    over25: Math.round(Math.max(0, Math.min(100, over25Pct))),
  };
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
): PredictionResult {
  // Default if standings data is missing
  if (
    !homeStanding ||
    !awayStanding ||
    homeStanding.playedGames === 0 ||
    awayStanding.playedGames === 0
  ) {
    return { homeWin: 40, draw: 25, awayWin: 35, btts: 50, over25: 50 };
  }

  const homeAttack = homeStanding.goalsFor / homeStanding.playedGames;
  const homeDefense = homeStanding.goalsAgainst / homeStanding.playedGames;
  const awayAttack = awayStanding.goalsFor / awayStanding.playedGames;
  const awayDefense = awayStanding.goalsAgainst / awayStanding.playedGames;

  const poisson = poissonFromRates(homeAttack, homeDefense, awayAttack, awayDefense);

  // Blend in H2H data at 10% weight
  const blended = blendH2H(poisson.homeWinPct, poisson.drawPct, poisson.awayWinPct, h2h, 0.1);

  return roundAndNormalize(blended.homeWinPct, blended.drawPct, blended.awayWinPct, poisson.bttsPct, poisson.over25Pct);
}

/**
 * Compute prediction for knockout/playoff matches using recent form instead of standings.
 * H2H is weighted higher (20%) since direct elimination amplifies historical patterns.
 *
 * For 2nd legs, adjusts predictions based on the first leg result:
 * - Team trailing on aggregate needs to attack more → higher goal expectancy
 * - Team leading can sit back → lower risk, more draw probability
 */
export function computeKnockoutPrediction(
  homeTeamId: number,
  awayTeamId: number,
  homeRecent: Match[],
  awayRecent: Match[],
  h2h?: { homeWins: number; draws: number; awayWins: number } | null,
  firstLeg?: { homeTeamId: number; homeGoals: number; awayGoals: number } | null
): PredictionResult {
  const homeRates = ratesFromRecentMatches(homeTeamId, homeRecent);
  const awayRates = ratesFromRecentMatches(awayTeamId, awayRecent);

  if (!homeRates || !awayRates) {
    return { homeWin: 40, draw: 25, awayWin: 35, btts: 50, over25: 50 };
  }

  let homeAttack = homeRates.attack;
  let homeDefense = homeRates.defense;
  let awayAttack = awayRates.attack;
  let awayDefense = awayRates.defense;

  // 2nd leg adjustment: team trailing on aggregate attacks more aggressively
  if (firstLeg) {
    // Figure out which team is "home" in the 2nd leg relative to the 1st leg
    const firstLegHomeIsNowAway = firstLeg.homeTeamId === awayTeamId;
    const homeAggGoals = firstLegHomeIsNowAway ? firstLeg.awayGoals : firstLeg.homeGoals;
    const awayAggGoals = firstLegHomeIsNowAway ? firstLeg.homeGoals : firstLeg.awayGoals;
    const aggDiff = homeAggGoals - awayAggGoals; // positive = home leads on aggregate

    if (aggDiff < 0) {
      // Home team trails → must attack, boost attack rate, slightly weaker defense
      homeAttack *= 1.15;
      homeDefense *= 1.1;
    } else if (aggDiff > 0) {
      // Home team leads → can be cautious, slightly lower attack but tighter defense
      homeAttack *= 0.95;
      homeDefense *= 0.9;
    } else {
      // Level → both teams push, slightly more open match
      homeAttack *= 1.05;
      awayAttack *= 1.05;
    }

    if (awayAggGoals < homeAggGoals) {
      // Away team trails → must attack away from home (harder)
      awayAttack *= 1.1;
      awayDefense *= 1.1;
    }
  }

  const poisson = poissonFromRates(homeAttack, homeDefense, awayAttack, awayDefense);

  // Blend H2H at 20% for knockouts
  const blended = blendH2H(poisson.homeWinPct, poisson.drawPct, poisson.awayWinPct, h2h, 0.2);

  return roundAndNormalize(blended.homeWinPct, blended.drawPct, blended.awayWinPct, poisson.bttsPct, poisson.over25Pct);
}
