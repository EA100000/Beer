/**
 * VALIDATION SÉLECTIVE PAR MARCHÉ
 *
 * Mode ultra-conservateur appliqué UNIQUEMENT aux marchés à haut risque
 * Marchés sûrs = validation standard (confiance 70%+)
 * Marchés risqués = ultra-conservateur (confiance 90%+)
 */

export type MarketType =
  | 'result_1x2'           // Résultat du match (1/X/2)
  | 'double_chance'        // Double chance (1X, 12, X2)
  | 'over_under_goals'     // Over/Under buts
  | 'btts'                 // Both teams to score
  | 'corners'              // Corners total/équipe
  | 'cards'                // Cartons jaunes/total
  | 'fouls'                // Fautes
  | 'shots'                // Tirs
  | 'throw_ins'            // Remises en jeu
  | 'offsides'             // Hors-jeux
  | 'exact_score'          // Score exact
  | 'halftime_fulltime'    // Mi-temps/Fin

export type RiskLevel = 'SAFE' | 'MODERATE' | 'RISKY' | 'VERY_RISKY';

export interface MarketRiskProfile {
  marketType: MarketType;
  riskLevel: RiskLevel;
  minConfidence: number;      // Confiance minimale requise
  minSafetyScore: number;     // Safety score minimum
  maxBaselineDeviation: number; // Déviation baseline max (%)
  minSafetyMargin: number;    // Marge sécurité min (anti-coinflip)
  description: string;
  reasoning: string;
}

/**
 * CLASSIFICATION DES MARCHÉS PAR RISQUE
 *
 * Basé sur:
 * - Volatilité historique
 * - Prévisibilité statistique
 * - Variance des résultats
 */
export const MARKET_RISK_PROFILES: Record<MarketType, MarketRiskProfile> = {
  // ============================================================================
  // MARCHÉS SÛRS (70%+ confiance, validation standard)
  // ============================================================================
  double_chance: {
    marketType: 'double_chance',
    riskLevel: 'SAFE',
    minConfidence: 70,
    minSafetyScore: 70,
    maxBaselineDeviation: 0.15,  // 15%
    minSafetyMargin: 0.15,       // 15%
    description: 'Double Chance (1X, 12, X2)',
    reasoning: '2 résultats sur 3 gagnent → Risque très faible'
  },

  corners: {
    marketType: 'corners',
    riskLevel: 'SAFE',
    minConfidence: 75,
    minSafetyScore: 70,
    maxBaselineDeviation: 0.15,
    minSafetyMargin: 0.15,
    description: 'Corners total/équipe',
    reasoning: 'Très prévisible après minute 30, faible volatilité'
  },

  fouls: {
    marketType: 'fouls',
    riskLevel: 'SAFE',
    minConfidence: 75,
    minSafetyScore: 70,
    maxBaselineDeviation: 0.15,
    minSafetyMargin: 0.15,
    description: 'Fautes total/équipe',
    reasoning: 'Stable, suit patterns arbitre/équipes'
  },

  throw_ins: {
    marketType: 'throw_ins',
    riskLevel: 'SAFE',
    minConfidence: 72,
    minSafetyScore: 70,
    maxBaselineDeviation: 0.18,
    minSafetyMargin: 0.12,
    description: 'Remises en jeu',
    reasoning: 'Suit possession, très stable minute 30+'
  },

  // ============================================================================
  // MARCHÉS MODÉRÉS (80%+ confiance)
  // ============================================================================
  cards: {
    marketType: 'cards',
    riskLevel: 'MODERATE',
    minConfidence: 80,
    minSafetyScore: 75,
    maxBaselineDeviation: 0.12,
    minSafetyMargin: 0.18,
    description: 'Cartons jaunes/total',
    reasoning: 'Dépend arbitre (variabilité moyenne)'
  },

  shots: {
    marketType: 'shots',
    riskLevel: 'MODERATE',
    minConfidence: 78,
    minSafetyScore: 75,
    maxBaselineDeviation: 0.12,
    minSafetyMargin: 0.15,
    description: 'Tirs total/cadrés',
    reasoning: 'Suit intensité match, variabilité modérée'
  },

  offsides: {
    marketType: 'offsides',
    riskLevel: 'MODERATE',
    minConfidence: 75,
    minSafetyScore: 72,
    maxBaselineDeviation: 0.15,
    minSafetyMargin: 0.15,
    description: 'Hors-jeux total/équipe',
    reasoning: 'Dépend tactique, moins prévisible'
  },

  btts: {
    marketType: 'btts',
    riskLevel: 'MODERATE',
    minConfidence: 80,
    minSafetyScore: 75,
    maxBaselineDeviation: 0.10,
    minSafetyMargin: 0.20,
    description: 'Both Teams To Score',
    reasoning: 'Dépend défenses, risque modéré'
  },

  // ============================================================================
  // MARCHÉS RISQUÉS (85%+ confiance, ULTRA-CONSERVATEUR)
  // ============================================================================
  over_under_goals: {
    marketType: 'over_under_goals',
    riskLevel: 'RISKY',
    minConfidence: 85,
    minSafetyScore: 85,
    maxBaselineDeviation: 0.08,
    minSafetyMargin: 0.25,
    description: 'Over/Under Buts',
    reasoning: '1 but peut tout changer, haute volatilité'
  },

  result_1x2: {
    marketType: 'result_1x2',
    riskLevel: 'RISKY',
    minConfidence: 85,
    minSafetyScore: 85,
    maxBaselineDeviation: 0.08,
    minSafetyMargin: 0.25,
    description: 'Résultat 1X2 (1/X/2)',
    reasoning: 'Imprévisible, dépend d\'1 événement (but/erreur)'
  },

  halftime_fulltime: {
    marketType: 'halftime_fulltime',
    riskLevel: 'RISKY',
    minConfidence: 82,
    minSafetyScore: 82,
    maxBaselineDeviation: 0.10,
    minSafetyMargin: 0.22,
    description: 'Mi-temps / Fin de match',
    reasoning: '2 prédictions simultanées = risque cumulé'
  },

  // ============================================================================
  // MARCHÉS TRÈS RISQUÉS (90%+ confiance, ZÉRO TOLÉRANCE)
  // ============================================================================
  exact_score: {
    marketType: 'exact_score',
    riskLevel: 'VERY_RISKY',
    minConfidence: 90,
    minSafetyScore: 90,
    maxBaselineDeviation: 0.05,
    minSafetyMargin: 0.30,
    description: 'Score exact',
    reasoning: 'Probabilité très faible (1/20+), cotes élevées mais très risqué'
  }
};

/**
 * Récupère le profil de risque d'un marché
 */
export function getMarketRiskProfile(marketType: MarketType): MarketRiskProfile {
  return MARKET_RISK_PROFILES[marketType];
}

/**
 * Valide une prédiction selon le profil de risque du marché
 */
export function validateMarketPrediction(
  marketType: MarketType,
  confidence: number,
  safetyScore: number,
  baselineDeviation: number,
  safetyMargin: number
): {
  approved: boolean;
  reason: string;
  riskLevel: RiskLevel;
  thresholds: {
    minConfidence: number;
    minSafetyScore: number;
    maxBaselineDeviation: number;
    minSafetyMargin: number;
  };
} {
  const profile = getMarketRiskProfile(marketType);

  // Vérifier chaque critère
  const checks = {
    confidence: confidence >= profile.minConfidence,
    safetyScore: safetyScore >= profile.minSafetyScore,
    baselineDeviation: baselineDeviation <= profile.maxBaselineDeviation,
    safetyMargin: safetyMargin >= profile.minSafetyMargin
  };

  const passed = Object.values(checks).every(check => check);

  let reason = '';
  if (!passed) {
    const failures: string[] = [];
    if (!checks.confidence) {
      failures.push(`Confiance ${confidence}% < ${profile.minConfidence}% requis`);
    }
    if (!checks.safetyScore) {
      failures.push(`Safety ${safetyScore} < ${profile.minSafetyScore} requis`);
    }
    if (!checks.baselineDeviation) {
      failures.push(`Déviation ${(baselineDeviation * 100).toFixed(1)}% > ${(profile.maxBaselineDeviation * 100).toFixed(1)}% max`);
    }
    if (!checks.safetyMargin) {
      failures.push(`Marge ${(safetyMargin * 100).toFixed(1)}% < ${(profile.minSafetyMargin * 100).toFixed(1)}% min`);
    }
    reason = failures.join(', ');
  } else {
    reason = `✅ ${profile.description} approuvé (${profile.riskLevel})`;
  }

  return {
    approved: passed,
    reason,
    riskLevel: profile.riskLevel,
    thresholds: {
      minConfidence: profile.minConfidence,
      minSafetyScore: profile.minSafetyScore,
      maxBaselineDeviation: profile.maxBaselineDeviation,
      minSafetyMargin: profile.minSafetyMargin
    }
  };
}

/**
 * Filtre les prédictions 1xbet selon risque marché
 */
export function filterMarketsByRisk(
  predictions: any,
  minRiskLevel: RiskLevel = 'SAFE'
): any {
  const riskOrder: RiskLevel[] = ['SAFE', 'MODERATE', 'RISKY', 'VERY_RISKY'];
  const minIndex = riskOrder.indexOf(minRiskLevel);

  const filtered: any = {};

  // Filtrer chaque catégorie selon risque
  for (const [key, value] of Object.entries(predictions)) {
    const marketType = mapKeyToMarketType(key);
    if (marketType) {
      const profile = getMarketRiskProfile(marketType);
      const riskIndex = riskOrder.indexOf(profile.riskLevel);

      // Garder si risque <= minRiskLevel
      if (riskIndex <= minIndex) {
        filtered[key] = value;
      }
    } else {
      // Marché non classifié, garder par défaut
      filtered[key] = value;
    }
  }

  return filtered;
}

/**
 * Mapping clé → MarketType
 */
function mapKeyToMarketType(key: string): MarketType | null {
  const mapping: Record<string, MarketType> = {
    'goals': 'over_under_goals',
    'corners': 'corners',
    'cards': 'cards',
    'fouls': 'fouls',
    'shots': 'shots',
    'throwIns': 'throw_ins',
    'offsides': 'offsides',
    'matchResult': 'result_1x2',
    'halfTimeFullTime': 'halftime_fulltime',
    'specialMarkets': 'btts'
  };

  return mapping[key] || null;
}

/**
 * Récupère statistiques de risque par catégorie
 */
export function getMarketRiskStats() {
  const stats = {
    SAFE: [] as string[],
    MODERATE: [] as string[],
    RISKY: [] as string[],
    VERY_RISKY: [] as string[]
  };

  for (const [_, profile] of Object.entries(MARKET_RISK_PROFILES)) {
    stats[profile.riskLevel].push(profile.description);
  }

  return {
    stats,
    summary: {
      safe: stats.SAFE.length,
      moderate: stats.MODERATE.length,
      risky: stats.RISKY.length,
      very_risky: stats.VERY_RISKY.length,
      total: Object.values(stats).flat().length
    }
  };
}
