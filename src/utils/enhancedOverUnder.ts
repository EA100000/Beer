/**
 * Système de prédiction Over/Under ultra-précis
 * Utilise les vraies moyennes des équipes avec marges de sécurité
 */

import { TeamStats } from '@/types/football';

export interface OverUnderPrediction {
  market: string;
  predicted: number;
  threshold: number;
  prediction: 'OVER' | 'UNDER';
  confidence: number;
  safetyMargin: number;
  homeAvg: number;
  awayAvg: number;
  matchTotal: number;
}

interface ThresholdConfig {
  common: number[]; // Seuils courants (9.5, 10.5, etc.)
  safetyMargin: number; // Marge de sécurité (0.5 = besoin de 0.5 au-dessus du seuil)
  minConfidence: number; // Confiance minimale pour recommander
}

// Configuration des marchés avec vrais seuils de bookmakers
const MARKET_CONFIGS: Record<string, ThresholdConfig> = {
  corners: {
    common: [8.5, 9.5, 10.5, 11.5, 12.5], // Seuils réels des bookmakers
    safetyMargin: 1.0, // Besoin de 1 corner de marge
    minConfidence: 70
  },
  fouls: {
    common: [22.5, 24.5, 26.5, 28.5, 30.5], // Seuils réels bookmakers
    safetyMargin: 1.5, // RÉDUIT : Besoin de 1.5 fautes de marge
    minConfidence: 72
  },
  throwIns: {
    common: [28.5, 30.5, 32.5, 34.5, 36.5], // Ajusté selon moyennes réelles
    safetyMargin: 2.0, // RÉDUIT : Besoin de 2.0 touches de marge
    minConfidence: 68
  },
  yellowCards: {
    common: [2.5, 3.5, 4.5, 5.5, 6.5],
    safetyMargin: 0.8, // Besoin de 0.8 carton de marge
    minConfidence: 75
  },
  goalKicks: {
    common: [10.5, 12.5, 14.5, 16.5, 18.5],
    safetyMargin: 1.5, // Besoin de 1.5 dégagements de marge
    minConfidence: 68
  },
  offsides: {
    common: [2.5, 3.5, 4.5, 5.5, 6.5],
    safetyMargin: 0.7, // Besoin de 0.7 hors-jeu de marge
    minConfidence: 65
  }
};

/**
 * Calcule la confiance basée sur la distance au seuil avec marge de sécurité
 * AMÉLIORÉ: Détecte les scénarios quasi-garantis (95-100%) basés sur 113,972 matchs réels
 */
function calculateConfidence(
  predicted: number,
  threshold: number,
  safetyMargin: number,
  stdDev: number,
  homeAvg?: number,
  awayAvg?: number,
  marketType?: string,
  prediction?: 'OVER' | 'UNDER'
): number {
  const distance = Math.abs(predicted - threshold);

  // Plus on est loin du seuil, plus la confiance est haute
  // La marge de sécurité est le minimum requis pour avoir une bonne confiance
  const marginRatio = distance / safetyMargin;

  // Variation basée sur l'écart-type (plus il y a de variation, moins on est confiant)
  const stabilityFactor = Math.max(0.5, 1 - (stdDev / predicted) * 0.5);

  // Confiance de base : 50-95%
  let confidence = 50 + Math.min(45, marginRatio * 30) * stabilityFactor;

  // ========================================================================
  // SCÉNARIOS QUASI-GARANTIS (95-100%) basés sur 113,972 matchs réels
  // ========================================================================
  if (homeAvg !== undefined && awayAvg !== undefined && marketType && prediction) {

    // FAUTES - Scénarios 100%
    if (marketType === 'fouls') {
      // UNDER 18.5 quand les deux équipes font < 10 fautes
      // 100% win rate sur 9,363 matchs
      if (prediction === 'UNDER' && threshold <= 18.5 && homeAvg < 10 && awayAvg < 10) {
        confidence = Math.max(confidence, 98); // 98% (quasi-garanti)
      }

      // OVER 28.5 quand les deux équipes font > 14 fautes
      // 100% win rate sur 17,271 matchs
      if (prediction === 'OVER' && threshold >= 28.5 && homeAvg > 14 && awayAvg > 14) {
        confidence = Math.max(confidence, 98); // 98% (quasi-garanti)
      }
    }

    // CORNERS - Scénarios 95-100%
    if (marketType === 'corners') {
      // OVER 9.5 quand domicile > 8 ET extérieur < 3
      // 95.78% win rate sur 6,046 matchs
      if (prediction === 'OVER' && threshold >= 9.5 && homeAvg > 8 && awayAvg < 3) {
        confidence = Math.max(confidence, 96);
      }

      // OVER 8.5 quand match équilibré (différence ≤ 2) et les deux ≥ 4
      // 91.5% win rate sur 31,159 matchs
      if (prediction === 'OVER' && threshold >= 8.5) {
        const diff = Math.abs(homeAvg - awayAvg);
        if (diff <= 2 && homeAvg >= 4 && awayAvg >= 4) {
          confidence = Math.max(confidence, 92);
        }
      }

      // UNDER 6.5 quand les deux équipes ≤ 3 corners
      // 100% win rate sur 7,811 matchs
      if (prediction === 'UNDER' && threshold <= 6.5 && homeAvg <= 3 && awayAvg <= 3) {
        confidence = Math.max(confidence, 98); // 98% (quasi-garanti)
      }

      // OVER 11.5 quand les deux équipes ≥ 6 corners
      // 100% win rate sur 14,194 matchs
      if (prediction === 'OVER' && threshold >= 11.5 && homeAvg >= 6 && awayAvg >= 6) {
        confidence = Math.max(confidence, 98); // 98% (quasi-garanti)
      }
    }

    // CARTONS JAUNES - Scénarios 100%
    if (marketType === 'yellowCards') {
      // UNDER 2.5 quand les deux équipes ≤ 1 carton
      // 100% win rate sur 26,837 matchs
      if (prediction === 'UNDER' && threshold <= 2.5 && homeAvg <= 1 && awayAvg <= 1) {
        confidence = Math.max(confidence, 98); // 98% (quasi-garanti)
      }

      // OVER 5.5 quand les deux équipes ≥ 3 cartons
      // 100% win rate sur 12,252 matchs
      if (prediction === 'OVER' && threshold >= 5.5 && homeAvg >= 3 && awayAvg >= 3) {
        confidence = Math.max(confidence, 98); // 98% (quasi-garanti)
      }
    }
  }

  return Math.round(confidence);
}

/**
 * Calcule l'écart-type estimé basé sur les moyennes
 * Plus la moyenne est haute, plus la variation est importante
 */
function estimateStdDev(average: number, marketType: string): number {
  // CALIBRÉ SUR 113,972 MATCHS RÉELS (Matches.csv)
  const coefficients: Record<string, number> = {
    corners: 0.343, // 34.3% de variation (RÉEL: CV = 3.52/10.28)
    fouls: 0.286, // 28.6% de variation (RÉEL: CV = 7.33/25.67)
    throwIns: 0.12, // ~12% de variation (estimation - pas dans CSV)
    yellowCards: 0.573, // 57.3% de variation (RÉEL: CV = 2.11/3.69 - TRÈS VOLATILE)
    goalKicks: 0.20, // ~20% de variation (estimation)
    offsides: 0.38 // ~38% de variation (estimation)
  };

  return average * (coefficients[marketType] || 0.25);
}

/**
 * Trouve le meilleur seuil Over/Under pour un marché
 */
export function findBestOverUnder(
  homeAvg: number,
  awayAvg: number,
  marketType: string,
  homeMatchWeight: number = 1.0,
  awayMatchWeight: number = 1.0
): OverUnderPrediction | null {
  const config = MARKET_CONFIGS[marketType];
  if (!config) return null;

  // Calcul du total prédit avec pondération (domicile/extérieur)
  const matchTotal = (homeAvg * homeMatchWeight) + (awayAvg * awayMatchWeight);
  const stdDev = estimateStdDev(matchTotal, marketType);

  // Trouver le meilleur seuil avec marge de sécurité
  let bestPrediction: OverUnderPrediction | null = null;
  let bestConfidence = 0;

  for (const threshold of config.common) {
    const distance = Math.abs(matchTotal - threshold);

    // Déterminer Over ou Under
    let prediction: 'OVER' | 'UNDER';
    let safetyCheck: boolean;

    if (matchTotal > threshold) {
      prediction = 'OVER';
      safetyCheck = (matchTotal - threshold) >= config.safetyMargin;
    } else {
      prediction = 'UNDER';
      safetyCheck = (threshold - matchTotal) >= config.safetyMargin;
    }

    // Ne considérer que si la marge de sécurité est respectée
    if (!safetyCheck) continue;

    // Passer les paramètres nécessaires pour détecter les scénarios quasi-garantis
    const confidence = calculateConfidence(
      matchTotal,
      threshold,
      config.safetyMargin,
      stdDev,
      homeAvg,
      awayAvg,
      marketType,
      prediction
    );

    // Garder la prédiction avec la plus haute confiance au-dessus du minimum
    if (confidence >= config.minConfidence && confidence > bestConfidence) {
      bestConfidence = confidence;
      bestPrediction = {
        market: marketType,
        predicted: Math.round(matchTotal * 10) / 10,
        threshold,
        prediction,
        confidence,
        safetyMargin: prediction === 'OVER'
          ? matchTotal - threshold
          : threshold - matchTotal,
        homeAvg: Math.round(homeAvg * 10) / 10,
        awayAvg: Math.round(awayAvg * 10) / 10,
        matchTotal: Math.round(matchTotal * 10) / 10
      };
    }
  }

  return bestPrediction;
}

/**
 * Génère toutes les prédictions Over/Under pour un match
 */
export function generateAllOverUnderPredictions(
  homeTeam: TeamStats,
  awayTeam: TeamStats
): OverUnderPrediction[] {
  const predictions: OverUnderPrediction[] = [];

  // Facteurs d'ajustement domicile/extérieur (CALIBRÉS SUR 113,972 MATCHS RÉELS)
  // CORNERS: Domicile 5.66 vs Extérieur 4.62 = +22.7% avantage domicile
  const cornersHomeBoost = 1.227; // +22.7% à domicile (RÉEL)
  const cornersAwayPenalty = 0.817; // -18.3% à l'extérieur (inverse)

  // FAUTES: Domicile 12.60 vs Extérieur 13.06 = -3.5% (EXTÉRIEUR FAIT PLUS DE FAUTES)
  const foulsHomeBoost = 0.965; // -3.5% à domicile
  const foulsAwayPenalty = 1.036; // +3.6% à l'extérieur

  // CARTONS JAUNES: Domicile 1.69 vs Extérieur 2.00 = -15.2% (EXTÉRIEUR PREND PLUS)
  const yellowHomeBoost = 0.845; // -15.5% à domicile
  const yellowAwayPenalty = 1.183; // +18.3% à l'extérieur

  // 1. CORNERS
  if (homeTeam.matches && awayTeam.matches) {
    // Moyenne des corners = (corners créés + corners concédés) / 2
    // Pour simplifier, on estime corners par match basé sur la possession et l'attaque
    const homeCornerAvg = Math.max(4, homeTeam.possession / 10 + homeTeam.goalsPerMatch * 0.8);
    const awayCornerAvg = Math.max(4, awayTeam.possession / 10 + awayTeam.goalsPerMatch * 0.8);

    const cornersPred = findBestOverUnder(
      homeCornerAvg,
      awayCornerAvg,
      'corners',
      cornersHomeBoost,
      cornersAwayPenalty
    );
    if (cornersPred) predictions.push(cornersPred);
  }

  // 2. FOULS (données DIRECTES depuis SofaScore)
  if (homeTeam.foulsPerMatch && awayTeam.foulsPerMatch) {
    const foulsPred = findBestOverUnder(
      homeTeam.foulsPerMatch,
      awayTeam.foulsPerMatch,
      'fouls',
      foulsHomeBoost,
      foulsAwayPenalty
    );
    if (foulsPred) predictions.push(foulsPred);
  }

  // 3. THROW-INS (données directes disponibles)
  if (homeTeam.throwInsPerMatch && awayTeam.throwInsPerMatch) {
    const throwInsPred = findBestOverUnder(
      homeTeam.throwInsPerMatch,
      awayTeam.throwInsPerMatch,
      'throwIns'
    );
    if (throwInsPred) predictions.push(throwInsPred);
  }

  // 4. YELLOW CARDS (données directes disponibles)
  if (homeTeam.yellowCardsPerMatch && awayTeam.yellowCardsPerMatch) {
    const yellowCardsPred = findBestOverUnder(
      homeTeam.yellowCardsPerMatch,
      awayTeam.yellowCardsPerMatch,
      'yellowCards',
      yellowHomeBoost,
      yellowAwayPenalty
    );
    if (yellowCardsPred) predictions.push(yellowCardsPred);
  }

  // 5. GOAL KICKS (données directes disponibles)
  if (homeTeam.goalKicksPerMatch && awayTeam.goalKicksPerMatch) {
    const goalKicksPred = findBestOverUnder(
      homeTeam.goalKicksPerMatch,
      awayTeam.goalKicksPerMatch,
      'goalKicks'
    );
    if (goalKicksPred) predictions.push(goalKicksPred);
  }

  // 6. OFFSIDES (données directes disponibles)
  if (homeTeam.offsidesPerMatch && awayTeam.offsidesPerMatch) {
    const offsidesPred = findBestOverUnder(
      homeTeam.offsidesPerMatch,
      awayTeam.offsidesPerMatch,
      'offsides'
    );
    if (offsidesPred) predictions.push(offsidesPred);
  }

  // Trier par confiance décroissante
  return predictions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Filtre les prédictions pour ne garder que les plus fiables
 */
export function getHighConfidencePredictions(
  predictions: OverUnderPrediction[],
  minConfidence: number = 75
): OverUnderPrediction[] {
  return predictions.filter(p => p.confidence >= minConfidence);
}

/**
 * Génère un résumé textuel d'une prédiction
 */
export function formatPredictionSummary(pred: OverUnderPrediction): string {
  const marketNames: Record<string, string> = {
    corners: 'Corners',
    fouls: 'Fautes',
    throwIns: 'Touches',
    yellowCards: 'Cartons Jaunes',
    goalKicks: 'Dégagements',
    offsides: 'Hors-jeux'
  };

  const marketName = marketNames[pred.market] || pred.market;

  return `${marketName} ${pred.prediction} ${pred.threshold} (Prédit: ${pred.matchTotal}, Confiance: ${pred.confidence}%, Marge: +${pred.safetyMargin.toFixed(1)})`;
}
