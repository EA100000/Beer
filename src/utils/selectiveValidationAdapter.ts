/**
 * ADAPTATEUR VALIDATION SÉLECTIVE
 *
 * Remplace la validation ultra-conservatrice globale par une validation
 * adaptée au risque de chaque marché spécifique.
 *
 * PHILOSOPHIE:
 * - Marchés SÛRS (Corners, Fautes, Double Chance): Validation standard (70-75%)
 * - Marchés MODÉRÉS (Cartons, BTTS): Validation modérée (78-80%)
 * - Marchés RISQUÉS (Buts, 1X2): Ultra-conservateur (85%+)
 * - Marchés TRÈS RISQUÉS (Score Exact): Zéro tolérance (90%+)
 */

import {
  validateMarketPrediction,
  getMarketRiskProfile,
  MarketType,
  RiskLevel,
  MARKET_RISK_PROFILES
} from './selectiveMarketValidation';
import { EnrichedLiveMetrics } from './advancedLiveAnalysis';

export interface SelectiveValidationResult {
  approved: boolean;
  confidence: number;
  safetyScore: number;
  reason: string;
  riskLevel: RiskLevel;
  marketType: MarketType;
  thresholds: {
    minConfidence: number;
    minSafetyScore: number;
    maxBaselineDeviation: number;
    minSafetyMargin: number;
  };
}

/**
 * Mapping des noms de marchés vers MarketType
 */
function mapMarketNameToType(marketName: string): MarketType {
  const name = marketName.toLowerCase();

  // BUTS
  if (name.includes('goal') || name.includes('but')) {
    if (name.includes('exact')) return 'exact_score';
    return 'over_under_goals';
  }

  // CORNERS
  if (name.includes('corner')) return 'corners';

  // CARTONS
  if (name.includes('card') || name.includes('carton') || name.includes('yellow')) {
    return 'cards';
  }

  // FAUTES
  if (name.includes('foul') || name.includes('faute')) return 'fouls';

  // TIRS
  if (name.includes('shot') || name.includes('tir')) return 'shots';

  // REMISES EN JEU
  if (name.includes('throw') || name.includes('touche')) return 'throw_ins';

  // HORS-JEUX
  if (name.includes('offside') || name.includes('hors')) return 'offsides';

  // BTTS
  if (name.includes('btts') || name.includes('both') || name.includes('les deux')) {
    return 'btts';
  }

  // DOUBLE CHANCE
  if (name.includes('double') && name.includes('chance')) return 'double_chance';

  // RÉSULTAT 1X2
  if (name.includes('1x2') || name.includes('result') || name.includes('résultat')) {
    return 'result_1x2';
  }

  // MI-TEMPS / FIN
  if (name.includes('halftime') || name.includes('mi-temps')) {
    return 'halftime_fulltime';
  }

  // FALLBACK: Corners (marché sûr par défaut)
  return 'corners';
}

/**
 * Calcule le safety score basé sur:
 * - Distance à la baseline
 * - Minute du match
 * - Volatilité des données
 */
function calculateSafetyScore(
  enrichedMetrics: EnrichedLiveMetrics,
  marketType: MarketType,
  projectedValue: number,
  currentValue: number,
  minute: number
): number {
  let score = 100;

  // PÉNALITÉ #1: Minute trop précoce
  if (minute < 15) {
    score -= 50; // Données très volatiles
  } else if (minute < 30) {
    score -= 20;
  }

  // PÉNALITÉ #2: Écart baseline trop grand
  const minutesRemaining = 90 - minute;
  const ratePerMinute = minutesRemaining > 0 ? (projectedValue - currentValue) / minutesRemaining : 0;

  // Seuils de taux/minute par marché
  const maxRates: Record<MarketType, number> = {
    corners: 0.20,
    fouls: 0.40,
    cards: 0.10,
    throw_ins: 0.80,
    shots: 0.50,
    offsides: 0.15,
    over_under_goals: 0.05,
    btts: 0.05,
    double_chance: 0.0,
    result_1x2: 0.05,
    halftime_fulltime: 0.05,
    exact_score: 0.05
  };

  const maxRate = maxRates[marketType] || 0.20;
  if (ratePerMinute > maxRate * 1.5) {
    score -= 30; // Projection irréaliste
  } else if (ratePerMinute > maxRate) {
    score -= 15;
  }

  // PÉNALITÉ #3: Cohérence avec données actuelles
  if (currentValue === 0 && minute > 20) {
    // Ex: 0 corners à la minute 25 mais projection de 10+ au total
    if (marketType === 'corners' && projectedValue > 8) score -= 20;
    if (marketType === 'fouls' && projectedValue > 25) score -= 15;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calcule la déviation baseline (écart par rapport à la moyenne attendue)
 */
function calculateBaselineDeviation(
  projectedValue: number,
  marketType: MarketType,
  minute: number
): number {
  // Moyennes réelles par marché (90 minutes)
  const baselineValues: Record<MarketType, number> = {
    corners: 10.5,
    fouls: 24,
    cards: 4.2,
    throw_ins: 42,
    shots: 22,
    offsides: 3.5,
    over_under_goals: 2.7,
    btts: 0.5, // Probabilité
    double_chance: 0.67, // Probabilité
    result_1x2: 0.33, // Probabilité
    halftime_fulltime: 0.15, // Probabilité
    exact_score: 0.08 // Probabilité
  };

  const baseline = baselineValues[marketType] || 10;
  return Math.abs(projectedValue - baseline) / baseline;
}

/**
 * Calcule la marge de sécurité (distance au seuil critique)
 */
function calculateSafetyMargin(
  projectedValue: number,
  threshold: number,
  prediction: 'over' | 'under' | 'yes' | 'no'
): number {
  const distance = Math.abs(projectedValue - threshold);
  const relativeMargin = distance / threshold;

  // Marge minimale recommandée: 15-30% selon marché
  return relativeMargin;
}

/**
 * VALIDATION SÉLECTIVE PRINCIPALE
 *
 * Remplace validatePrediction() de ultraStrictValidation.ts
 * avec validation adaptée au risque du marché.
 */
export function validateWithSelectiveThresholds(
  enrichedMetrics: EnrichedLiveMetrics,
  marketName: string,
  projectedValue: number,
  threshold: number,
  prediction: 'over' | 'under' | 'yes' | 'no',
  confidence: number
): SelectiveValidationResult {
  const marketType = mapMarketNameToType(marketName);
  const profile = getMarketRiskProfile(marketType);
  const minute = enrichedMetrics.base.minute;

  // Valeur actuelle du marché
  const currentValue = getCurrentMarketValue(enrichedMetrics, marketType);

  // CALCULS DE VALIDATION
  const safetyScore = calculateSafetyScore(
    enrichedMetrics,
    marketType,
    projectedValue,
    currentValue,
    minute
  );

  const baselineDeviation = calculateBaselineDeviation(
    projectedValue,
    marketType,
    minute
  );

  const safetyMargin = calculateSafetyMargin(
    projectedValue,
    threshold,
    prediction
  );

  // VALIDATION SELON PROFIL DE RISQUE
  const validation = validateMarketPrediction(
    marketType,
    confidence,
    safetyScore,
    baselineDeviation,
    safetyMargin
  );

  return {
    approved: validation.approved,
    confidence,
    safetyScore,
    reason: validation.reason,
    riskLevel: validation.riskLevel,
    marketType,
    thresholds: validation.thresholds
  };
}

/**
 * Récupère la valeur actuelle d'un marché
 */
function getCurrentMarketValue(
  enrichedMetrics: EnrichedLiveMetrics,
  marketType: MarketType
): number {
  switch (marketType) {
    case 'corners':
      return enrichedMetrics.base.homeCorners + enrichedMetrics.base.awayCorners;

    case 'fouls':
      return enrichedMetrics.base.homeFouls + enrichedMetrics.base.awayFouls;

    case 'cards':
      return enrichedMetrics.base.homeYellowCards + enrichedMetrics.base.awayYellowCards;

    case 'throw_ins':
      return enrichedMetrics.base.homeThrowIns + enrichedMetrics.base.awayThrowIns;

    case 'shots':
      return enrichedMetrics.base.homeTotalShots + enrichedMetrics.base.awayTotalShots;

    case 'offsides':
      return enrichedMetrics.base.homeOffsides + enrichedMetrics.base.awayOffsides;

    case 'over_under_goals':
      return enrichedMetrics.base.homeGoals + enrichedMetrics.base.awayGoals;

    default:
      return 0;
  }
}

/**
 * Filtre les marchés 1xbet selon niveau de risque accepté
 */
export function filterMarketsByRiskLevel(
  markets: any,
  maxRiskLevel: RiskLevel = 'MODERATE'
): any {
  const riskOrder: RiskLevel[] = ['SAFE', 'MODERATE', 'RISKY', 'VERY_RISKY'];
  const maxIndex = riskOrder.indexOf(maxRiskLevel);

  const filtered: any = {};

  for (const [category, predictions] of Object.entries(markets)) {
    // Déterminer le type de marché pour cette catégorie
    const marketType = mapMarketNameToType(category);
    const profile = getMarketRiskProfile(marketType);
    const riskIndex = riskOrder.indexOf(profile.riskLevel);

    // Garder uniquement si risque <= maxRiskLevel
    if (riskIndex <= maxIndex) {
      filtered[category] = predictions;
    }
  }

  return filtered;
}

/**
 * Obtient les statistiques de validation par marché
 */
export function getValidationStats(markets: any): {
  total: number;
  approved: number;
  byRiskLevel: Record<RiskLevel, { total: number; approved: number }>;
} {
  const stats = {
    total: 0,
    approved: 0,
    byRiskLevel: {
      SAFE: { total: 0, approved: 0 },
      MODERATE: { total: 0, approved: 0 },
      RISKY: { total: 0, approved: 0 },
      VERY_RISKY: { total: 0, approved: 0 }
    } as Record<RiskLevel, { total: number; approved: number }>
  };

  for (const [category, predictions] of Object.entries(markets)) {
    const marketType = mapMarketNameToType(category);
    const profile = getMarketRiskProfile(marketType);

    // Compter les prédictions
    if (typeof predictions === 'object' && predictions !== null) {
      const predArray = Array.isArray(predictions) ? predictions : Object.values(predictions);

      predArray.forEach((pred: any) => {
        if (pred && typeof pred === 'object') {
          stats.total++;
          stats.byRiskLevel[profile.riskLevel].total++;

          // Vérifier si approuvé (confidence >= seuil)
          const confidence = pred.confidence || pred.over?.confidence || pred.yes?.confidence || 0;
          if (confidence >= profile.minConfidence) {
            stats.approved++;
            stats.byRiskLevel[profile.riskLevel].approved++;
          }
        }
      });
    }
  }

  return stats;
}

/**
 * Affiche un résumé de validation
 */
export function getValidationSummary(markets: any): string {
  const stats = getValidationStats(markets);

  const lines = [
    `📊 VALIDATION SÉLECTIVE PAR MARCHÉ`,
    ``,
    `Total: ${stats.approved}/${stats.total} approuvés (${Math.round(stats.approved / stats.total * 100)}%)`,
    ``,
    `Par niveau de risque:`,
    `🟢 SÛRS: ${stats.byRiskLevel.SAFE.approved}/${stats.byRiskLevel.SAFE.total} (${Math.round(stats.byRiskLevel.SAFE.approved / stats.byRiskLevel.SAFE.total * 100)}%)`,
    `🟡 MODÉRÉS: ${stats.byRiskLevel.MODERATE.approved}/${stats.byRiskLevel.MODERATE.total} (${Math.round(stats.byRiskLevel.MODERATE.approved / stats.byRiskLevel.MODERATE.total * 100)}%)`,
    `🔴 RISQUÉS: ${stats.byRiskLevel.RISKY.approved}/${stats.byRiskLevel.RISKY.total} (${Math.round(stats.byRiskLevel.RISKY.approved / stats.byRiskLevel.RISKY.total * 100)}%)`,
    `⚫ TRÈS RISQUÉS: ${stats.byRiskLevel.VERY_RISKY.approved}/${stats.byRiskLevel.VERY_RISKY.total} (${Math.round(stats.byRiskLevel.VERY_RISKY.approved / stats.byRiskLevel.VERY_RISKY.total * 100)}%)`
  ];

  return lines.join('\n');
}
