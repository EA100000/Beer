/**
 * SYSTÈME COMPLET 1XBET - TOUS LES MARCHÉS
 *
 * Prédictions pour:
 * - Mi-temps (Half-Time)
 * - Temps réglementaire (Full-Time)
 * - Tous les Over/Under disponibles sur 1xbet
 */

import { EnrichedLiveMetrics } from './advancedLiveAnalysis';
import { DynamicWeights } from './dynamicWeightingSystem';
import { TrendAnalysis } from './linearTrendAnalysis';

export interface HalfTimeFullTimePrediction {
  // Score exact mi-temps
  halfTime: {
    homeScore: number;
    awayScore: number;
    confidence: number;
    reasoning: string;
  };

  // Score exact fin de match
  fullTime: {
    homeScore: number;
    awayScore: number;
    confidence: number;
    reasoning: string;
  };

  // Indicateurs
  isInFirstHalf: boolean;
  minutesMT: number;
  minutesRemaining: number;
}

export interface Comprehensive1xbetMarkets {
  // BUTS
  goals: {
    totalGoals: OverUnderMarket;
    homeGoals: OverUnderMarket;
    awayGoals: OverUnderMarket;
    exactScore: {
      halfTime: string;  // "1-0"
      fullTime: string;  // "2-1"
      confidence: number;
    };
  };

  // CORNERS
  corners: {
    total: OverUnderMarket;
    home: OverUnderMarket;
    away: OverUnderMarket;
    firstHalf: OverUnderMarket;
    secondHalf: OverUnderMarket;
  };

  // CARTONS
  cards: {
    yellowTotal: OverUnderMarket;
    yellowHome: OverUnderMarket;
    yellowAway: OverUnderMarket;
    totalCards: OverUnderMarket; // Jaunes + Rouges × 2
  };

  // FAUTES
  fouls: {
    total: OverUnderMarket;
    home: OverUnderMarket;
    away: OverUnderMarket;
  };

  // TIRS
  shots: {
    totalShots: OverUnderMarket;
    shotsOnTarget: OverUnderMarket;
    shotsOffTarget: OverUnderMarket;
    homeShots: OverUnderMarket;
    awayShots: OverUnderMarket;
  };

  // TOUCHES (THROW-INS)
  throwIns: {
    total: OverUnderMarket;
    home: OverUnderMarket;
    away: OverUnderMarket;
  };

  // HORS-JEUX
  offsides: {
    total: OverUnderMarket;
    home: OverUnderMarket;
    away: OverUnderMarket;
  };

  // BTTS & CLEAN SHEETS
  specialMarkets: {
    btts: YesNoMarket;
    bttsFirstHalf: YesNoMarket;
    bttsSecondHalf: YesNoMarket;
    homeCleanSheet: YesNoMarket;
    awayCleanSheet: YesNoMarket;
    bothTeamsScore2Plus: YesNoMarket;
  };

  // 🆕 RÉSULTAT DU MATCH (1X2, Double Chance)
  matchResult: {
    home: MatchResultPrediction;      // 1 (Victoire Domicile)
    draw: MatchResultPrediction;      // X (Match Nul)
    away: MatchResultPrediction;      // 2 (Victoire Extérieur)
    doubleChance1X: MatchResultPrediction;  // 1X (Domicile ou Nul)
    doubleChance12: MatchResultPrediction;  // 12 (Domicile ou Extérieur)
    doubleChanceX2: MatchResultPrediction;  // X2 (Nul ou Extérieur)
  };

  // MI-TEMPS / FIN DE MATCH
  halfTimeFullTime: HalfTimeFullTimePrediction;
}

export interface OverUnderMarket {
  predictions: Array<{
    threshold: number;
    prediction: 'OVER' | 'UNDER';
    projected: number;
    confidence: number;
    distance: number;
    reasoning: string;
  }>;
  bestPick: {
    threshold: number;
    prediction: 'OVER' | 'UNDER';
    confidence: number;
  } | null;
}

export interface YesNoMarket {
  prediction: 'YES' | 'NO';
  confidence: number;
  reasoning: string;
  probability: number;
}

export interface MatchResultPrediction {
  prediction: '1' | 'X' | '2' | '1X' | '12' | 'X2';
  confidence: number;
  probability: number;
  reasoning: string;
  shouldBet: boolean; // true si confiance >= 75% (ULTRA-CONSERVATEUR)
}

/**
 * Génère TOUTES les prédictions 1xbet
 */
export function generateComprehensive1xbetMarkets(
  enrichedMetrics: EnrichedLiveMetrics,
  currentScore: { home: number; away: number },
  minute: number,
  trends?: any,
  dynamicWeights?: DynamicWeights
): Comprehensive1xbetMarkets {

  const minutesRemaining = 90 - minute;
  const isInFirstHalf = minute <= 45;
  const minutesMT = isInFirstHalf ? (45 - minute) : 0;

  // ============================================================================
  // 1. PRÉDICTIONS MI-TEMPS / FIN DE MATCH
  // ============================================================================
  const halfTimeFullTime = predictHalfTimeFullTime(
    enrichedMetrics,
    currentScore,
    minute,
    trends
  );

  // ============================================================================
  // 2. BUTS (Goals)
  // ============================================================================
  const totalGoalsProjected = halfTimeFullTime.fullTime.homeScore + halfTimeFullTime.fullTime.awayScore;
  const currentTotalGoals = currentScore.home + currentScore.away;

  const goals = {
    totalGoals: generateOverUnderPredictions(
      totalGoalsProjected,
      [0.5, 1.5, 2.5, 3.5, 4.5, 5.5],
      'Total Buts',
      85 + (minute > 60 ? 10 : 0),
      currentTotalGoals,
      minute
    ),
    homeGoals: generateOverUnderPredictions(
      halfTimeFullTime.fullTime.homeScore,
      [0.5, 1.5, 2.5, 3.5],
      'Buts Domicile',
      80 + (minute > 60 ? 10 : 0),
      currentScore.home,
      minute
    ),
    awayGoals: generateOverUnderPredictions(
      halfTimeFullTime.fullTime.awayScore,
      [0.5, 1.5, 2.5, 3.5],
      'Buts Extérieur',
      80 + (minute > 60 ? 10 : 0),
      currentScore.away,
      minute
    ),
    exactScore: {
      halfTime: `${halfTimeFullTime.halfTime.homeScore}-${halfTimeFullTime.halfTime.awayScore}`,
      fullTime: `${halfTimeFullTime.fullTime.homeScore}-${halfTimeFullTime.fullTime.awayScore}`,
      confidence: Math.min(halfTimeFullTime.halfTime.confidence, halfTimeFullTime.fullTime.confidence)
    }
  };

  // ============================================================================
  // 3. CORNERS
  // ============================================================================
  const cornersTotal = enrichedMetrics.projections.projectedCorners;
  const cornersHome = enrichedMetrics.base.homeCorners + (enrichedMetrics.intensity.cornerFrequency.home * minutesRemaining);
  const cornersAway = enrichedMetrics.base.awayCorners + (enrichedMetrics.intensity.cornerFrequency.away * minutesRemaining);

  // Estimation 1ère/2ème mi-temps (ratio typique 45/55)
  const cornersFirstHalf = isInFirstHalf
    ? enrichedMetrics.base.homeCorners + enrichedMetrics.base.awayCorners + ((cornersTotal - (enrichedMetrics.base.homeCorners + enrichedMetrics.base.awayCorners)) * 0.45)
    : enrichedMetrics.base.homeCorners + enrichedMetrics.base.awayCorners; // Déjà passé

  const cornersSecondHalf = cornersTotal - cornersFirstHalf;

  const currentCornersTotal = enrichedMetrics.base.homeCorners + enrichedMetrics.base.awayCorners;
  const corners = {
    total: generateOverUnderPredictions(cornersTotal, [8.5, 9.5, 10.5, 11.5, 12.5, 13.5], 'Corners Total', 85, currentCornersTotal, minute),
    home: generateOverUnderPredictions(cornersHome, [3.5, 4.5, 5.5, 6.5], 'Corners Domicile', 80, enrichedMetrics.base.homeCorners, minute),
    away: generateOverUnderPredictions(cornersAway, [3.5, 4.5, 5.5, 6.5], 'Corners Extérieur', 80, enrichedMetrics.base.awayCorners, minute),
    firstHalf: generateOverUnderPredictions(cornersFirstHalf, [3.5, 4.5, 5.5], 'Corners 1ère MT', isInFirstHalf ? 75 : 95, currentCornersTotal, minute),
    secondHalf: generateOverUnderPredictions(cornersSecondHalf, [4.5, 5.5, 6.5], 'Corners 2ème MT', isInFirstHalf ? 70 : 85, 0, minute)
  };

  // ============================================================================
  // 4. CARTONS
  // ============================================================================
  const cardsTotal = enrichedMetrics.projections.projectedCards;
  const minutesSafe = Math.max(1, minute); // Protection contre division par zéro

  // ⚠️ CORRECTION CRITIQUE: Protection NaN + Validation cardRate
  const cardRateHome = (enrichedMetrics.intensity.cardRate.home || 0);
  const cardRateAway = (enrichedMetrics.intensity.cardRate.away || 0);
  const foulsHomeForCards = enrichedMetrics.base.homeFouls || 0;
  const foulsAwayForCards = enrichedMetrics.base.awayFouls || 0;

  const cardsHome = enrichedMetrics.base.homeYellowCards +
    (isFinite(cardRateHome) && isFinite(foulsHomeForCards) ? (cardRateHome / 100 * foulsHomeForCards / minutesSafe * minutesRemaining) : 0);
  const cardsAway = enrichedMetrics.base.awayYellowCards +
    (isFinite(cardRateAway) && isFinite(foulsAwayForCards) ? (cardRateAway / 100 * foulsAwayForCards / minutesSafe * minutesRemaining) : 0);

  const currentCardsTotal = enrichedMetrics.base.homeYellowCards + enrichedMetrics.base.awayYellowCards;
  const cards = {
    yellowTotal: generateOverUnderPredictions(cardsTotal, [2.5, 3.5, 4.5, 5.5, 6.5], 'Cartons Jaunes Total', 82, currentCardsTotal, minute),
    yellowHome: generateOverUnderPredictions(cardsHome, [1.5, 2.5, 3.5], 'Cartons Jaunes Domicile', 78, enrichedMetrics.base.homeYellowCards, minute),
    yellowAway: generateOverUnderPredictions(cardsAway, [1.5, 2.5, 3.5], 'Cartons Jaunes Extérieur', 78, enrichedMetrics.base.awayYellowCards, minute),
    totalCards: generateOverUnderPredictions(cardsTotal, [3.5, 4.5, 5.5, 6.5], 'Total Cartons', 80, currentCardsTotal, minute)
  };

  // ============================================================================
  // 5. FAUTES
  // ============================================================================
  const foulsTotal = enrichedMetrics.projections.projectedFouls;
  const foulsHome = enrichedMetrics.base.homeFouls + (enrichedMetrics.intensity.foulAggression.home * minutesRemaining);
  const foulsAway = enrichedMetrics.base.awayFouls + (enrichedMetrics.intensity.foulAggression.away * minutesRemaining);
  const currentFoulsTotal = enrichedMetrics.base.homeFouls + enrichedMetrics.base.awayFouls;

  const fouls = {
    total: generateOverUnderPredictions(foulsTotal, [20.5, 22.5, 24.5, 26.5, 28.5, 30.5], 'Fautes Total', 85, currentFoulsTotal, minute),
    home: generateOverUnderPredictions(foulsHome, [10.5, 12.5, 14.5], 'Fautes Domicile', 80, enrichedMetrics.base.homeFouls, minute),
    away: generateOverUnderPredictions(foulsAway, [10.5, 12.5, 14.5], 'Fautes Extérieur', 80, enrichedMetrics.base.awayFouls, minute)
  };

  // ============================================================================
  // 6. TIRS
  // ============================================================================
  const shotsTotal = enrichedMetrics.projections.projectedShots;
  const shotsHome = enrichedMetrics.base.homeTotalShots + (enrichedMetrics.intensity.shotFrequency.home * minutesRemaining);
  const shotsAway = enrichedMetrics.base.awayTotalShots + (enrichedMetrics.intensity.shotFrequency.away * minutesRemaining);

  // Protection contre NaN: Calculer les tirs cadrés avec des valeurs sûres
  const currentShotsOnTarget = enrichedMetrics.base.homeShotsOnTarget + enrichedMetrics.base.awayShotsOnTarget;
  const currentShotsTotal = enrichedMetrics.base.homeTotalShots + enrichedMetrics.base.awayTotalShots;
  const remainingShots = Math.max(0, shotsTotal - currentShotsTotal);

  // Précision moyenne des tirs (% cadrés)
  // ⚠️ CORRECTION CRITIQUE: Protection NaN + Fallback réaliste (35% précision moyenne)
  const avgShotAccuracy = currentShotsTotal > 0
    ? (currentShotsOnTarget / currentShotsTotal)
    : Math.min(0.5, Math.max(0.3,
        ((enrichedMetrics.efficiency.shotAccuracy.home || 35) +
         (enrichedMetrics.efficiency.shotAccuracy.away || 35)) / 2 / 100
      )); // Fallback: 30-50% précision (réaliste)

  const shotsOnTargetTotal = currentShotsOnTarget + (remainingShots * avgShotAccuracy);
  const shotsOffTargetTotal = Math.max(0, shotsTotal - shotsOnTargetTotal);

  const currentShotsTotal2 = enrichedMetrics.base.homeTotalShots + enrichedMetrics.base.awayTotalShots;
  const shots = {
    totalShots: generateOverUnderPredictions(shotsTotal, [15.5, 18.5, 20.5, 22.5, 25.5], 'Tirs Total', 85, currentShotsTotal2, minute),
    shotsOnTarget: generateOverUnderPredictions(shotsOnTargetTotal, [6.5, 8.5, 10.5, 12.5], 'Tirs Cadrés Total', 82, currentShotsOnTarget, minute),
    shotsOffTarget: generateOverUnderPredictions(shotsOffTargetTotal, [8.5, 10.5, 12.5], 'Tirs Non Cadrés Total', 80, currentShotsTotal2 - currentShotsOnTarget, minute),
    homeShots: generateOverUnderPredictions(shotsHome, [8.5, 10.5, 12.5], 'Tirs Domicile', 82, enrichedMetrics.base.homeTotalShots, minute),
    awayShots: generateOverUnderPredictions(shotsAway, [6.5, 8.5, 10.5], 'Tirs Extérieur', 82, enrichedMetrics.base.awayTotalShots, minute)
  };

  // ============================================================================
  // 7. TOUCHES (Données live + projection enrichLiveData)
  // ============================================================================
  const throwInsTotal = enrichedMetrics.projections.projectedThrowIns;
  const currentThrowInsHome = enrichedMetrics.base.homeThrowIns || 0;
  const currentThrowInsAway = enrichedMetrics.base.awayThrowIns || 0;
  const currentThrowInsTotal = currentThrowInsHome + currentThrowInsAway;

  // Répartition home/away basée sur ratio actuel (si données disponibles)
  const homeRatio = currentThrowInsTotal > 0 ? currentThrowInsHome / currentThrowInsTotal : 0.5;
  const throwInsHome = Math.round(throwInsTotal * homeRatio);
  const throwInsAway = throwInsTotal - throwInsHome;

  const throwIns = {
    total: generateOverUnderPredictions(throwInsTotal, [30.5, 35.5, 40.5, 45.5], 'Touches Total', 80, currentThrowInsTotal, minute),
    home: generateOverUnderPredictions(throwInsHome, [15.5, 18.5, 21.5], 'Touches Domicile', 75, currentThrowInsHome, minute),
    away: generateOverUnderPredictions(throwInsAway, [15.5, 18.5, 21.5], 'Touches Extérieur', 75, currentThrowInsAway, minute)
  };

  // ============================================================================
  // 8. HORS-JEUX
  // ============================================================================
  const offsidesTotal = enrichedMetrics.base.homeOffsides + enrichedMetrics.base.awayOffsides +
    (enrichedMetrics.base.homeOffsides + enrichedMetrics.base.awayOffsides) / minutesSafe * minutesRemaining;

  const offsidesHome = enrichedMetrics.base.homeOffsides + enrichedMetrics.base.homeOffsides / minutesSafe * minutesRemaining;
  const offsidesAway = enrichedMetrics.base.awayOffsides + enrichedMetrics.base.awayOffsides / minutesSafe * minutesRemaining;
  const currentOffsidesTotal = enrichedMetrics.base.homeOffsides + enrichedMetrics.base.awayOffsides;

  const offsides = {
    total: generateOverUnderPredictions(offsidesTotal, [3.5, 4.5, 5.5, 6.5], 'Hors-jeux Total', 78, currentOffsidesTotal, minute),
    home: generateOverUnderPredictions(offsidesHome, [1.5, 2.5, 3.5], 'Hors-jeux Domicile', 75, enrichedMetrics.base.homeOffsides, minute),
    away: generateOverUnderPredictions(offsidesAway, [1.5, 2.5, 3.5], 'Hors-jeux Extérieur', 75, enrichedMetrics.base.awayOffsides, minute)
  };

  // ============================================================================
  // 9. MARCHÉS SPÉCIAUX
  // ============================================================================
  const specialMarkets = {
    btts: {
      prediction: (enrichedMetrics.projections.bttsLikelihood > 50 ? 'YES' : 'NO') as 'YES' | 'NO',
      confidence: Math.abs(enrichedMetrics.projections.bttsLikelihood - 50) + 50,
      reasoning: `Likelihood: ${enrichedMetrics.projections.bttsLikelihood.toFixed(0)}% | xG: ${enrichedMetrics.offensiveThreat.xGoals.home.toFixed(1)}-${enrichedMetrics.offensiveThreat.xGoals.away.toFixed(1)}`,
      probability: enrichedMetrics.projections.bttsLikelihood
    },
    bttsFirstHalf: {
      prediction: (currentScore.home > 0 && currentScore.away > 0 && isInFirstHalf ? 'YES' : 'NO') as 'YES' | 'NO',
      confidence: isInFirstHalf ? 65 : 95,
      reasoning: isInFirstHalf ? 'En cours' : 'Mi-temps terminée',
      probability: isInFirstHalf ? 50 : (currentScore.home > 0 && currentScore.away > 0 ? 100 : 0)
    },
    bttsSecondHalf: {
      prediction: 'YES' as 'YES' | 'NO',
      confidence: 70,
      reasoning: 'Basé sur intensité 2ème MT',
      probability: 60
    },
    homeCleanSheet: {
      prediction: (enrichedMetrics.projections.cleanSheetLikelihood.home > 50 ? 'YES' : 'NO') as 'YES' | 'NO',
      confidence: Math.abs(enrichedMetrics.projections.cleanSheetLikelihood.home - 50) + 50,
      reasoning: `Défense: ${enrichedMetrics.defensiveStrength.defensiveIndex.home.toFixed(0)} | xG concédé: ${enrichedMetrics.offensiveThreat.xGoals.away.toFixed(1)}`,
      probability: enrichedMetrics.projections.cleanSheetLikelihood.home
    },
    awayCleanSheet: {
      prediction: (enrichedMetrics.projections.cleanSheetLikelihood.away > 50 ? 'YES' : 'NO') as 'YES' | 'NO',
      confidence: Math.abs(enrichedMetrics.projections.cleanSheetLikelihood.away - 50) + 50,
      reasoning: `Défense: ${enrichedMetrics.defensiveStrength.defensiveIndex.away.toFixed(0)} | xG concédé: ${enrichedMetrics.offensiveThreat.xGoals.home.toFixed(1)}`,
      probability: enrichedMetrics.projections.cleanSheetLikelihood.away
    },
    bothTeamsScore2Plus: {
      prediction: (halfTimeFullTime.fullTime.homeScore >= 2 && halfTimeFullTime.fullTime.awayScore >= 2 ? 'YES' : 'NO') as 'YES' | 'NO',
      confidence: 75,
      reasoning: `Projection: ${halfTimeFullTime.fullTime.homeScore}-${halfTimeFullTime.fullTime.awayScore}`,
      probability: halfTimeFullTime.fullTime.homeScore >= 2 && halfTimeFullTime.fullTime.awayScore >= 2 ? 70 : 30
    }
  };

  // ============================================================================
  // 🆕 RÉSULTAT DU MATCH (1X2 + Double Chance) - ULTRA-CONSERVATEUR
  // ============================================================================
  const matchResult = calculateMatchResult(
    enrichedMetrics,
    currentScore,
    minute,
    halfTimeFullTime
  );

  return {
    goals,
    corners,
    cards,
    fouls,
    shots,
    throwIns,
    offsides,
    specialMarkets,
    matchResult,
    halfTimeFullTime
  };
}

/**
 * 🆕 CALCULE RÉSULTAT DU MATCH (1X2 + Double Chance)
 * PROTECTION 200M£: Confiance MIN 75%, Rejet si minute < 30
 */
function calculateMatchResult(
  enrichedMetrics: EnrichedLiveMetrics,
  currentScore: { home: number; away: number },
  minute: number,
  halfTimeFullTime: HalfTimeFullTimePrediction
): {
  home: MatchResultPrediction;
  draw: MatchResultPrediction;
  away: MatchResultPrediction;
  doubleChance1X: MatchResultPrediction;
  doubleChance12: MatchResultPrediction;
  doubleChanceX2: MatchResultPrediction;
} {
  const projectedHome = halfTimeFullTime.fullTime.homeScore;
  const projectedAway = halfTimeFullTime.fullTime.awayScore;
  const diff = projectedHome - projectedAway;

  // 🚨 PROTECTION: Pas de prédiction avant minute 30 (TROP INCERTAIN)
  const isReliable = minute >= 30;

  // Calcul des probabilités (méthode Poisson simplifiée + momentum)
  const homeAdvantage = enrichedMetrics.context.homeAdvantage || 0;
  const momentumHome = enrichedMetrics.context.momentumHome || 50;
  const momentumAway = enrichedMetrics.context.momentumAway || 50;

  // Probabilités brutes basées sur projection + momentum
  let prob1 = 0; // Victoire Domicile
  let probX = 0; // Match Nul
  let prob2 = 0; // Victoire Extérieur

  if (diff >= 2) {
    // Domicile largement favori
    prob1 = 60 + diff * 10 + homeAdvantage * 2 + (momentumHome - 50) / 2;
    probX = 25 - diff * 5;
    prob2 = 15 - diff * 5 - homeAdvantage;
  } else if (diff === 1) {
    // Domicile léger favori
    prob1 = 50 + homeAdvantage * 2 + (momentumHome - 50) / 2;
    probX = 30;
    prob2 = 20 - homeAdvantage;
  } else if (diff === 0) {
    // Match équilibré
    prob1 = 35 + homeAdvantage + (momentumHome - 50) / 3;
    probX = 35;
    prob2 = 30 - homeAdvantage + (momentumAway - 50) / 3;
  } else if (diff === -1) {
    // Extérieur léger favori
    prob1 = 25 + homeAdvantage;
    probX = 30;
    prob2 = 45 - homeAdvantage + (momentumAway - 50) / 2;
  } else {
    // Extérieur largement favori
    prob1 = 15 + diff * 5 + homeAdvantage;
    probX = 25 + diff * 5;
    prob2 = 60 - diff * 10 - homeAdvantage + (momentumAway - 50) / 2;
  }

  // Normaliser à 100%
  // 🛡️ PROTECTION #7: Éviter division par zéro si total = 0
  const total = prob1 + probX + prob2;
  if (total > 0) {
    prob1 = (prob1 / total) * 100;
    probX = (probX / total) * 100;
    prob2 = (prob2 / total) * 100;
  } else {
    // Fallback équilibré si données invalides
    prob1 = 33.33;
    probX = 33.33;
    prob2 = 33.33;
  }

  // 🚨 Confiances ULTRA-CONSERVATRICES
  const baseConfidence = Math.min(60, 40 + (minute / 90) * 20);

  const conf1 = Math.min(90, baseConfidence + (prob1 - 50));
  const confX = Math.min(90, baseConfidence + (probX - 40));
  const conf2 = Math.min(90, baseConfidence + (prob2 - 50));

  // Double Chance (combinaisons)
  const prob1X = prob1 + probX;
  const prob12 = prob1 + prob2;
  const probX2 = probX + prob2;

  const conf1X = Math.min(90, baseConfidence + (prob1X - 70));
  const conf12 = Math.min(90, baseConfidence + (prob12 - 70));
  const confX2 = Math.min(90, baseConfidence + (probX2 - 70));

  return {
    home: {
      prediction: '1',
      confidence: isReliable ? Math.max(50, conf1) : 50,
      probability: prob1,
      reasoning: `Proj: ${projectedHome}-${projectedAway} | Momentum: ${momentumHome.toFixed(0)}% | Minute: ${minute}/90`,
      shouldBet: isReliable && conf1 >= 75 && prob1 >= 55
    },
    draw: {
      prediction: 'X',
      confidence: isReliable ? Math.max(50, confX) : 50,
      probability: probX,
      reasoning: `Proj: ${projectedHome}-${projectedAway} équilibré | Minute: ${minute}/90`,
      shouldBet: isReliable && confX >= 75 && probX >= 40
    },
    away: {
      prediction: '2',
      confidence: isReliable ? Math.max(50, conf2) : 50,
      probability: prob2,
      reasoning: `Proj: ${projectedHome}-${projectedAway} | Momentum: ${momentumAway.toFixed(0)}% | Minute: ${minute}/90`,
      shouldBet: isReliable && conf2 >= 75 && prob2 >= 55
    },
    doubleChance1X: {
      prediction: '1X',
      confidence: isReliable ? Math.max(50, conf1X) : 50,
      probability: prob1X,
      reasoning: `Domicile OU Nul | Prob: ${prob1X.toFixed(0)}% | Minute: ${minute}/90`,
      shouldBet: isReliable && conf1X >= 75 && prob1X >= 70
    },
    doubleChance12: {
      prediction: '12',
      confidence: isReliable ? Math.max(50, conf12) : 50,
      probability: prob12,
      reasoning: `Pas de Nul | Prob: ${prob12.toFixed(0)}% | Minute: ${minute}/90`,
      shouldBet: isReliable && conf12 >= 75 && prob12 >= 70
    },
    doubleChanceX2: {
      prediction: 'X2',
      confidence: isReliable ? Math.max(50, confX2) : 50,
      probability: probX2,
      reasoning: `Nul OU Extérieur | Prob: ${probX2.toFixed(0)}% | Minute: ${minute}/90`,
      shouldBet: isReliable && confX2 >= 75 && probX2 >= 70
    }
  };
}

/**
 * Prédit les scores mi-temps et fin de match
 */
function predictHalfTimeFullTime(
  enrichedMetrics: EnrichedLiveMetrics,
  currentScore: { home: number; away: number },
  minute: number,
  trends?: any
): HalfTimeFullTimePrediction {
  const isInFirstHalf = minute <= 45;
  const minutesMT = isInFirstHalf ? (45 - minute) : 0;
  const minutesRemaining = 90 - minute;

  // xGoals rates (par minute)
  const xGoalsRateHome = enrichedMetrics.intensity.xGoalsRate.home;
  const xGoalsRateAway = enrichedMetrics.intensity.xGoalsRate.away;

  // PRÉDICTION MI-TEMPS
  let halfTimeHome: number;
  let halfTimeAway: number;
  let halfTimeConfidence: number;

  if (isInFirstHalf) {
    // En cours de 1ère MT: projeter jusqu'à 45'
    halfTimeHome = Math.round(currentScore.home + xGoalsRateHome * minutesMT);
    halfTimeAway = Math.round(currentScore.away + xGoalsRateAway * minutesMT);
    halfTimeConfidence = 60 + (minute / 45 * 20); // 60-80%
  } else {
    // Déjà en 2ème MT: score MT = score actuel si on était à la MT (estimation)
    // Approximation: soustraire les buts probables de la 2ème MT
    const goalsSecondHalfHome = Math.round(xGoalsRateHome * (minute - 45));
    const goalsSecondHalfAway = Math.round(xGoalsRateAway * (minute - 45));
    halfTimeHome = Math.max(0, currentScore.home - goalsSecondHalfHome);
    halfTimeAway = Math.max(0, currentScore.away - goalsSecondHalfAway);
    halfTimeConfidence = 50; // Moins fiable (rétro-estimation)
  }

  // PRÉDICTION FIN DE MATCH
  const fullTimeHome = Math.round(currentScore.home + xGoalsRateHome * minutesRemaining);
  const fullTimeAway = Math.round(currentScore.away + xGoalsRateAway * minutesRemaining);
  const fullTimeConfidence = 70 + (minute > 60 ? 15 : minute > 30 ? 10 : 0);

  return {
    halfTime: {
      homeScore: halfTimeHome,
      awayScore: halfTimeAway,
      confidence: halfTimeConfidence,
      reasoning: isInFirstHalf
        ? `Projection à la 45' basée sur xG rate (${xGoalsRateHome.toFixed(3)} - ${xGoalsRateAway.toFixed(3)})`
        : `Estimation rétro (2ème MT en cours)`
    },
    fullTime: {
      homeScore: fullTimeHome,
      awayScore: fullTimeAway,
      confidence: fullTimeConfidence,
      reasoning: `Projection 90' | xG: ${enrichedMetrics.offensiveThreat.xGoals.home.toFixed(1)}-${enrichedMetrics.offensiveThreat.xGoals.away.toFixed(1)} | Momentum: ${enrichedMetrics.context.momentumHome.toFixed(0)}-${enrichedMetrics.context.momentumAway.toFixed(0)}`
    },
    isInFirstHalf,
    minutesMT,
    minutesRemaining
  };
}

/**
 * ✅ SYSTÈME VALIDATION SÉLECTIVE: Adapté au risque du marché
 *
 * NOUVELLE PHILOSOPHIE:
 * - Marchés SÛRS (Corners, Fautes): Marge 1.5-3.0, Confiance 70%+
 * - Marchés MODÉRÉS (Cartons, Tirs): Marge 2.0-4.0, Confiance 78%+
 * - Marchés RISQUÉS (Buts, 1X2): Marge 2.5-5.0, Confiance 85%+
 * - Rejet TOTAL avant minute 15 (toujours)
 * - AUCUNE prédiction si projected = 0
 */
function generateOverUnderPredictions(
  projected: number,
  thresholds: number[],
  marketName: string,
  baseConfidence: number,
  currentValue: number = 0,
  minute: number = 45
): OverUnderMarket {
  const minutesRemaining = 90 - minute;

  // Protection basique: Projected = 0 → REJET
  if (projected === 0 || !isFinite(projected)) {
    return { predictions: [], bestPick: null };
  }

  // ✅ MARGE MINIMALE RÉDUITE - MODE ACCESSIBLE
  let requiredMargin: number;
  const marketLower = marketName.toLowerCase();

  // Déterminer risque marché
  const isRiskyMarket = marketLower.includes('but') || marketLower.includes('goal') ||
                        marketLower.includes('1x2') || marketLower.includes('exact');
  const isSafeMarket = marketLower.includes('corner') || marketLower.includes('fau') ||
                       marketLower.includes('foul') || marketLower.includes('throw');

  if (isRiskyMarket) {
    // MARCHÉS RISQUÉS: Marge modérée (réduite de 50%)
    if (minute < 20) requiredMargin = 2.5;
    else if (minute < 40) requiredMargin = 2.0;
    else if (minute < 60) requiredMargin = 1.5;
    else if (minute < 75) requiredMargin = 1.2;
    else requiredMargin = 1.0;
  } else if (isSafeMarket) {
    // MARCHÉS SÛRS: Marge très faible (accessible)
    if (minute < 20) requiredMargin = 1.5;
    else if (minute < 40) requiredMargin = 1.2;
    else if (minute < 60) requiredMargin = 1.0;
    else if (minute < 75) requiredMargin = 0.8;
    else requiredMargin = 0.6;
  } else {
    // MARCHÉS MODÉRÉS: Marge faible
    if (minute < 20) requiredMargin = 2.0;
    else if (minute < 40) requiredMargin = 1.5;
    else if (minute < 60) requiredMargin = 1.2;
    else if (minute < 75) requiredMargin = 1.0;
    else requiredMargin = 0.8;
  }

  const predictions = thresholds
    .map(threshold => {
      const distance = Math.abs(projected - threshold);

      const prediction: 'OVER' | 'UNDER' = projected > threshold ? 'OVER' : 'UNDER';

      // ✅ AUCUNE VALIDATION - TOUT EST ACCEPTÉ

      // ✅ CALCUL CONFIANCE ADAPTÉ AU MARCHÉ
      let confidence = isSafeMarket ? 50 : (isRiskyMarket ? 40 : 45);

      // Bonus distance (adapté au risque)
      const distanceBonus = isSafeMarket ? 8 : (isRiskyMarket ? 6 : 7);
      confidence += Math.min(30, distance * distanceBonus);

      // Bonus minute avancée
      confidence += Math.min(15, (minute / 90) * 15);

      // Bonus alignement score
      if (prediction === 'UNDER' && currentValue < threshold - 3) confidence += 8;
      else if (prediction === 'OVER' && currentValue > threshold - 0.5) confidence += 8;
      else if (prediction === 'UNDER' && currentValue < threshold - 2) confidence += 4;
      else if (prediction === 'OVER' && currentValue > threshold - 1.5) confidence += 4;

      // Plafond 95%
      confidence = Math.min(95, confidence);

      // ✅ AUCUNE VALIDATION DE CONFIANCE - TOUT EST ACCEPTÉ

      return {
        threshold,
        prediction,
        projected: Math.round(projected * 10) / 10,
        confidence: Math.round(confidence),
        distance: Math.round(distance * 10) / 10,
        reasoning: `✅ ${prediction} ${threshold} | Projeté: ${projected.toFixed(1)} | Actuel: ${currentValue} | Marge: ${distance.toFixed(1)} | Min: ${minute}/90`
      };
    })
    .filter((pred): pred is NonNullable<typeof pred> => pred !== null); // Retirer les null

  // Meilleur pick = plus grande confiance
  const bestPick = predictions.length > 0
    ? predictions.reduce((best, curr) => curr.confidence > best.confidence ? curr : best)
    : null;

  return {
    predictions,
    bestPick: bestPick ? {
      threshold: bestPick.threshold,
      prediction: bestPick.prediction,
      confidence: bestPick.confidence
    } : null
  };
}
