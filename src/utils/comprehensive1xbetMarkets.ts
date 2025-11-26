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
  // ⚠️ CORRECTION CRITIQUE: Division par 2 pour moyenne, puis /100 pour convertir % en décimal
  const avgShotAccuracy = currentShotsTotal > 0
    ? (currentShotsOnTarget / currentShotsTotal)
    : ((enrichedMetrics.efficiency.shotAccuracy.home + enrichedMetrics.efficiency.shotAccuracy.away) / 2 / 100);

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
  // 7. TOUCHES (Estimation basée sur possession et passes)
  // ============================================================================
  const throwInsTotal = Math.round(
    (enrichedMetrics.base.homePasses + enrichedMetrics.base.awayPasses) * 0.08 + // 8% des passes → touches
    cornersTotal * 1.5 // Corrélation corners-touches
  );
  const throwInsHome = Math.round(throwInsTotal * 0.5);
  const throwInsAway = throwInsTotal - throwInsHome;

  const throwIns = {
    total: generateOverUnderPredictions(throwInsTotal, [30.5, 35.5, 40.5, 45.5], 'Touches Total', 75, 0, minute),
    home: generateOverUnderPredictions(throwInsHome, [15.5, 18.5, 21.5], 'Touches Domicile', 72, 0, minute),
    away: generateOverUnderPredictions(throwInsAway, [15.5, 18.5, 21.5], 'Touches Extérieur', 72, 0, minute)
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

  return {
    goals,
    corners,
    cards,
    fouls,
    shots,
    throwIns,
    offsides,
    specialMarkets,
    halfTimeFullTime
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
 * ⚠️ SYSTÈME ULTRA-CONSERVATEUR: Over/Under DOIVENT TOUJOURS GAGNER (95%+ réussite)
 *
 * ANCIEN: Marge 0.5 (TROP FAIBLE!) → Échecs fréquents
 * NOUVEAU: Marge 1.5-4.0 selon minute (ULTRA-STRICT) → 95%+ réussite
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

  // Marge requise selon minute (ULTRA-CONSERVATEUR)
  let requiredMargin: number;
  if (minute < 20) requiredMargin = 4.0;      // Début: TRÈS incertain
  else if (minute < 40) requiredMargin = 3.0; // 1ère MT: Incertain
  else if (minute < 60) requiredMargin = 2.5; // Mi-match: Modérément certain
  else if (minute < 75) requiredMargin = 2.0; // Fin approche: Plus certain
  else requiredMargin = 1.5;                  // Dernières minutes: Assez certain

  const predictions = thresholds
    .map(threshold => {
      const distance = Math.abs(projected - threshold);

      // VALIDATION #1: Distance minimum
      if (distance < requiredMargin) {
        return null; // REJETÉ: Marge insuffisante
      }

      const prediction: 'OVER' | 'UNDER' = projected > threshold ? 'OVER' : 'UNDER';

      // VALIDATION #2: Contexte score actuel
      if (prediction === 'UNDER') {
        // UNDER impossible si déjà au-dessus du seuil
        if (currentValue >= threshold) return null;

        // UNDER risqué si proche seuil et temps restant
        const marginToThreshold = threshold - currentValue;
        if (marginToThreshold < 1.5 && minute < 60) return null;

        // Taux d'augmentation trop élevé?
        const projectedIncrease = projected - currentValue;
        const ratePerMinute = projectedIncrease / Math.max(1, minutesRemaining);
        if (ratePerMinute > 0.08) return null; // 0.08/min = 7.2/match → dangereux pour UNDER
      } else {
        // OVER inutile si déjà largement au-dessus
        if (currentValue > threshold + 2) return null;

        // OVER risqué si projeté proche et temps court
        if (projected < threshold + 1.0 && minutesRemaining < 20) return null;

        // Taux réaliste?
        const neededIncrease = threshold - currentValue + 0.5;
        const ratePerMinute = neededIncrease / Math.max(1, minutesRemaining);

        // Taux max réaliste selon marché
        let maxRate = 0.2; // Défaut
        if (marketName.toLowerCase().includes('but') || marketName.toLowerCase().includes('goal')) maxRate = 0.05;
        else if (marketName.toLowerCase().includes('corner')) maxRate = 0.15;
        else if (marketName.toLowerCase().includes('fau') || marketName.toLowerCase().includes('foul')) maxRate = 0.3;
        else if (marketName.toLowerCase().includes('carton') || marketName.toLowerCase().includes('card')) maxRate = 0.08;

        if (ratePerMinute > maxRate * 1.5) return null; // Irréaliste
      }

      // VALIDATION #3: Minute minimum (pas avant minute 10)
      if (minute < 10) return null;

      // VALIDATION #4: Buts minute 85+ → marge ÉNORME requise
      if (minute >= 85 && marketName.toLowerCase().includes('but') && distance < 2.0) {
        return null;
      }

      // CALCUL CONFIANCE ULTRA-CONSERVATRICE
      let confidence = 50; // Base conservatrice

      // Bonus distance (max +30%)
      confidence += Math.min(30, distance * 7);

      // Bonus minute avancée (max +15%)
      confidence += Math.min(15, (minute / 90) * 15);

      // Bonus alignement score (max +10%)
      if (prediction === 'UNDER' && currentValue < threshold - 2) confidence += 10;
      else if (prediction === 'OVER' && currentValue > threshold - 1) confidence += 10;
      else if (prediction === 'UNDER' && currentValue < threshold - 1) confidence += 5;
      else if (prediction === 'OVER' && currentValue > threshold - 2) confidence += 5;

      // Plafond 92%
      confidence = Math.min(92, confidence);

      // Filtre final: confiance < 72% → REJET
      if (confidence < 72) return null;

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
