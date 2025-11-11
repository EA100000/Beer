/**
 * CALIBRATION AVEC DONNÉES RÉELLES
 *
 * Ce module calibre les prédictions du système pour qu'elles convergent
 * vers les probabilités RÉELLES observées sur 230,557 matchs.
 *
 * Source: Matches.csv (analyse du 5 Janvier 2025)
 */

import {
  REAL_OVER_UNDER_PROBABILITIES,
  REAL_BTTS_PROBABILITIES,
  REAL_RESULT_PROBABILITIES,
  REAL_ELO_THRESHOLDS,
  REAL_HOME_ADVANTAGE,
  CALIBRATION_FACTORS,
  calculateWinProbabilityFromElo
} from './realWorldConstants';

/**
 * Calibre les probabilités Over/Under pour converger vers les vraies stats
 *
 * Baseline réel:
 * - Over 2.5: 49.13%
 * - Under 2.5: 50.87%
 *
 * Le système ne doit PAS systématiquement prédire Over ou Under,
 * mais converger vers ~50/50 en moyenne sur beaucoup de matchs.
 */
export function calibrateOverUnderPrediction(
  rawOverProbability: number,
  homeGoalsExpected: number,
  awayGoalsExpected: number
): {
  over25Prob: number;
  under25Prob: number;
  calibrated: boolean;
  deviation: number;
} {
  // Calcul baseline
  const totalGoalsExpected = homeGoalsExpected + awayGoalsExpected;

  // Si on s'éloigne trop du 2.65 buts/match réel, on calibre
  const realMeanGoals = 2.65; // Observé sur 230,557 matchs
  const deviation = Math.abs(totalGoalsExpected - realMeanGoals);

  let calibratedOverProb = rawOverProbability;

  if (deviation > 0.5) {
    // Grosse déviation - on rapproche du baseline réel
    const calibrationFactor = 1 - (deviation * 0.1);
    const targetProb = REAL_OVER_UNDER_PROBABILITIES.over25;
    calibratedOverProb = rawOverProbability * calibrationFactor + targetProb * (1 - calibrationFactor);
  }

  // S'assurer qu'on ne dépasse pas 5% de déviation du baseline
  const maxDeviation = CALIBRATION_FACTORS.max_deviation_allowed;
  const minOverProb = REAL_OVER_UNDER_PROBABILITIES.over25 - maxDeviation;
  const maxOverProb = REAL_OVER_UNDER_PROBABILITIES.over25 + maxDeviation;

  calibratedOverProb = Math.max(minOverProb, Math.min(maxOverProb, calibratedOverProb));

  return {
    over25Prob: calibratedOverProb,
    under25Prob: 1 - calibratedOverProb,
    calibrated: deviation > 0.3,
    deviation: deviation
  };
}

/**
 * Calibre les probabilités BTTS pour converger vers les vraies stats
 *
 * Baseline réel:
 * - BTTS Yes: 51.72%
 * - BTTS No: 48.28%
 *
 * Légère tendance BTTS Yes, mais pas écrasante.
 */
export function calibrateBTTSPrediction(
  rawBttsYesProb: number,
  homeGoalsExpected: number,
  awayGoalsExpected: number
): {
  bttsYesProb: number;
  bttsNoProb: number;
  calibrated: boolean;
  deviation: number;
} {
  // Si l'une des équipes a très peu de buts attendus, BTTS No devient plus probable
  const minGoalsExpected = Math.min(homeGoalsExpected, awayGoalsExpected);

  let calibratedBttsProb = rawBttsYesProb;
  let deviation = Math.abs(rawBttsYesProb - REAL_BTTS_PROBABILITIES.btts_yes);

  // Si une équipe marque < 0.8 buts en moyenne, réduire BTTS Yes
  if (minGoalsExpected < 0.8) {
    const reductionFactor = minGoalsExpected / 0.8;
    calibratedBttsProb *= reductionFactor;
    deviation = Math.abs(calibratedBttsProb - REAL_BTTS_PROBABILITIES.btts_yes);
  }

  // S'assurer qu'on reste proche du baseline réel (51.72%)
  const maxDeviation = CALIBRATION_FACTORS.max_deviation_allowed;
  const minBttsProb = REAL_BTTS_PROBABILITIES.btts_yes - maxDeviation;
  const maxBttsProb = REAL_BTTS_PROBABILITIES.btts_yes + maxDeviation;

  calibratedBttsProb = Math.max(minBttsProb, Math.min(maxBttsProb, calibratedBttsProb));

  return {
    bttsYesProb: calibratedBttsProb,
    bttsNoProb: 1 - calibratedBttsProb,
    calibrated: deviation > 0.05,
    deviation: deviation
  };
}

/**
 * Calibre les probabilités de résultat basé sur Elo RÉEL
 *
 * Thresholds réels (230,557 matchs):
 * - Victoire domicile: Elo diff > +44
 * - Match nul: Elo diff entre -10 et +44
 * - Victoire extérieur: Elo diff < -61
 *
 * Probabilités baseline:
 * - Home Win: 44.62%
 * - Draw: 26.49%
 * - Away Win: 28.89%
 */
export function calibrateResultPrediction(
  homeRating: number,
  awayRating: number,
  rawHomeProbability: number,
  rawDrawProbability: number,
  rawAwayProbability: number
): {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  calibrated: boolean;
  eloDiff: number;
  reasoning: string;
} {
  const eloDiff = homeRating - awayRating;

  // Utiliser la fonction basée sur VRAIES données
  const realProbs = calculateWinProbabilityFromElo(eloDiff);

  // Mélanger prédiction brute avec probabilités réelles
  // 60% prédiction brute, 40% baseline réel
  const blendFactor = 0.6;

  const calibratedHome = rawHomeProbability * blendFactor + realProbs.home * (1 - blendFactor);
  const calibratedDraw = rawDrawProbability * blendFactor + realProbs.draw * (1 - blendFactor);
  const calibratedAway = rawAwayProbability * blendFactor + realProbs.away * (1 - blendFactor);

  // Normaliser pour que total = 1
  const total = calibratedHome + calibratedDraw + calibratedAway;

  let reasoning = '';
  if (eloDiff > REAL_ELO_THRESHOLDS.home_win_threshold) {
    reasoning = `Fort avantage domicile (Elo diff: +${eloDiff.toFixed(0)})`;
  } else if (eloDiff < REAL_ELO_THRESHOLDS.away_win_threshold) {
    reasoning = `Fort avantage extérieur (Elo diff: ${eloDiff.toFixed(0)})`;
  } else {
    reasoning = `Match serré (Elo diff: ${eloDiff.toFixed(0)})`;
  }

  return {
    homeWinProb: calibratedHome / total,
    drawProb: calibratedDraw / total,
    awayWinProb: calibratedAway / total,
    calibrated: true,
    eloDiff: eloDiff,
    reasoning: reasoning
  };
}

/**
 * Applique l'avantage domicile RÉEL (non simulé)
 *
 * Données réelles:
 * - Ratio Home/Away wins: 1.544
 * - Home Win: 44.62%
 * - Away Win: 28.89%
 * - Bonus Elo domicile: +44
 */
export function applyRealHomeAdvantage(
  homeGoalsExpected: number,
  league: string = 'premier-league'
): number {
  // Facteur domicile réel = 15.7% bonus
  const homeBonus = REAL_HOME_ADVANTAGE.home_bonus_factor; // 0.157

  // Ajustements légers par ligue (basé sur observations)
  const leagueAdjustments = {
    'premier-league': 1.0,
    'bundesliga': 1.05, // Légèrement plus d'avantage domicile
    'la-liga': 0.95,
    'serie-a': 0.90, // Moins d'avantage domicile
    'ligue-1': 0.93
  };

  const leagueFactor = leagueAdjustments[league] || 1.0;

  return homeGoalsExpected * (1 + homeBonus * leagueFactor);
}

/**
 * Vérifie si une prédiction respecte les contraintes RÉELLES
 */
export function validateAgainstRealData(prediction: {
  over25Prob: number;
  bttsYesProb: number;
  homeWinProb: number;
}): {
  valid: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // 1. Vérifier Over/Under
  const overDeviation = Math.abs(prediction.over25Prob - REAL_OVER_UNDER_PROBABILITIES.over25);
  if (overDeviation > 0.20) {
    warnings.push(`Over 2.5 trop éloigné du baseline réel (${(REAL_OVER_UNDER_PROBABILITIES.over25 * 100).toFixed(1)}%)`);
    suggestions.push('Revoir calcul buts attendus - peut-être surestimation');
  }

  // 2. Vérifier BTTS
  const bttsDeviation = Math.abs(prediction.bttsYesProb - REAL_BTTS_PROBABILITIES.btts_yes);
  if (bttsDeviation > 0.25) {
    warnings.push(`BTTS Yes trop éloigné du baseline réel (${(REAL_BTTS_PROBABILITIES.btts_yes * 100).toFixed(1)}%)`);
    suggestions.push('Vérifier distribution buts par équipe');
  }

  // 3. Vérifier Home Win
  const homeDeviation = Math.abs(prediction.homeWinProb - REAL_RESULT_PROBABILITIES.home_win);
  if (homeDeviation > 0.25) {
    warnings.push(`Victoire domicile trop éloignée du baseline réel (${(REAL_RESULT_PROBABILITIES.home_win * 100).toFixed(1)}%)`);
    suggestions.push('Vérifier avantage domicile appliqué');
  }

  const valid = warnings.length === 0;

  return {
    valid,
    warnings,
    suggestions
  };
}

/**
 * Convertit des probabilités brutes en probabilités calibrées
 *
 * Garantit que sur un grand nombre de prédictions, on converge vers
 * les statistiques réelles observées.
 */
export function calibrateAllPredictions(
  homeTeamStats: { goalsExpected: number; rating: number },
  awayTeamStats: { goalsExpected: number; rating: number },
  rawPredictions: {
    over25Prob: number;
    bttsYesProb: number;
    homeWinProb: number;
    drawProb: number;
    awayWinProb: number;
  },
  league: string = 'premier-league'
): {
  calibrated: {
    over25Prob: number;
    under25Prob: number;
    bttsYesProb: number;
    bttsNoProb: number;
    homeWinProb: number;
    drawProb: number;
    awayWinProb: number;
  };
  adjustments: {
    overUnderCalibrated: boolean;
    bttsCalibrated: boolean;
    resultCalibrated: boolean;
  };
  validation: {
    valid: boolean;
    warnings: string[];
    suggestions: string[];
  };
  metadata: {
    homeGoalsAdjusted: number;
    awayGoalsAdjusted: number;
    eloDiff: number;
  };
} {
  // 1. Appliquer avantage domicile réel
  const homeGoalsAdjusted = applyRealHomeAdvantage(homeTeamStats.goalsExpected, league);
  const awayGoalsAdjusted = awayTeamStats.goalsExpected;

  // 2. Calibrer Over/Under
  const overUnderCalibrated = calibrateOverUnderPrediction(
    rawPredictions.over25Prob,
    homeGoalsAdjusted,
    awayGoalsAdjusted
  );

  // 3. Calibrer BTTS
  const bttsCalibrated = calibrateBTTSPrediction(
    rawPredictions.bttsYesProb,
    homeGoalsAdjusted,
    awayGoalsAdjusted
  );

  // 4. Calibrer Résultat
  const resultCalibrated = calibrateResultPrediction(
    homeTeamStats.rating,
    awayTeamStats.rating,
    rawPredictions.homeWinProb,
    rawPredictions.drawProb,
    rawPredictions.awayWinProb
  );

  // 5. Valider vs données réelles
  const validation = validateAgainstRealData({
    over25Prob: overUnderCalibrated.over25Prob,
    bttsYesProb: bttsCalibrated.bttsYesProb,
    homeWinProb: resultCalibrated.homeWinProb
  });

  return {
    calibrated: {
      over25Prob: overUnderCalibrated.over25Prob,
      under25Prob: overUnderCalibrated.under25Prob,
      bttsYesProb: bttsCalibrated.bttsYesProb,
      bttsNoProb: bttsCalibrated.bttsNoProb,
      homeWinProb: resultCalibrated.homeWinProb,
      drawProb: resultCalibrated.drawProb,
      awayWinProb: resultCalibrated.awayWinProb
    },
    adjustments: {
      overUnderCalibrated: overUnderCalibrated.calibrated,
      bttsCalibrated: bttsCalibrated.calibrated,
      resultCalibrated: resultCalibrated.calibrated
    },
    validation,
    metadata: {
      homeGoalsAdjusted,
      awayGoalsAdjusted,
      eloDiff: resultCalibrated.eloDiff
    }
  };
}

/**
 * Évalue si le système converge bien vers les statistiques réelles
 *
 * À utiliser après avoir fait beaucoup de prédictions pour vérifier
 * qu'en moyenne on est bien autour de 49% Over, 52% BTTS Yes, etc.
 */
export function evaluateSystemConvergence(
  predictions: Array<{
    over25Prob: number;
    bttsYesProb: number;
    homeWinProb: number;
  }>
): {
  converging: boolean;
  avgOverProb: number;
  avgBttsProb: number;
  avgHomeWinProb: number;
  deviations: {
    overDeviation: number;
    bttsDeviation: number;
    homeWinDeviation: number;
  };
  quality: 'EXCELLENT' | 'BON' | 'MOYEN' | 'FAIBLE';
  recommendations: string[];
} {
  if (predictions.length === 0) {
    return {
      converging: false,
      avgOverProb: 0,
      avgBttsProb: 0,
      avgHomeWinProb: 0,
      deviations: { overDeviation: 0, bttsDeviation: 0, homeWinDeviation: 0 },
      quality: 'FAIBLE',
      recommendations: ['Pas assez de prédictions pour évaluer']
    };
  }

  // Calculer moyennes
  const avgOverProb = predictions.reduce((sum, p) => sum + p.over25Prob, 0) / predictions.length;
  const avgBttsProb = predictions.reduce((sum, p) => sum + p.bttsYesProb, 0) / predictions.length;
  const avgHomeWinProb = predictions.reduce((sum, p) => sum + p.homeWinProb, 0) / predictions.length;

  // Calculer déviations vs baseline réel
  const overDeviation = Math.abs(avgOverProb - REAL_OVER_UNDER_PROBABILITIES.over25);
  const bttsDeviation = Math.abs(avgBttsProb - REAL_BTTS_PROBABILITIES.btts_yes);
  const homeWinDeviation = Math.abs(avgHomeWinProb - REAL_RESULT_PROBABILITIES.home_win);

  // Déviation totale
  const totalDeviation = overDeviation + bttsDeviation + homeWinDeviation;

  // Qualité du système
  let quality: 'EXCELLENT' | 'BON' | 'MOYEN' | 'FAIBLE';
  if (totalDeviation < 0.05) quality = 'EXCELLENT';
  else if (totalDeviation < 0.10) quality = 'BON';
  else if (totalDeviation < 0.20) quality = 'MOYEN';
  else quality = 'FAIBLE';

  const recommendations: string[] = [];

  if (overDeviation > 0.05) {
    recommendations.push(`Over/Under dévie de ${(overDeviation * 100).toFixed(1)}% - ajuster calcul buts`);
  }
  if (bttsDeviation > 0.05) {
    recommendations.push(`BTTS dévie de ${(bttsDeviation * 100).toFixed(1)}% - ajuster distribution buts`);
  }
  if (homeWinDeviation > 0.05) {
    recommendations.push(`Home Win dévie de ${(homeWinDeviation * 100).toFixed(1)}% - ajuster avantage domicile`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Système converge bien vers les données réelles !');
  }

  return {
    converging: totalDeviation < 0.10,
    avgOverProb,
    avgBttsProb,
    avgHomeWinProb,
    deviations: {
      overDeviation,
      bttsDeviation,
      homeWinDeviation
    },
    quality,
    recommendations
  };
}
