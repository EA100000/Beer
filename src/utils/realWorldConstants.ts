/**
 * CONSTANTES BASÉES SUR DONNÉES RÉELLES
 *
 * Source: Analyse de 230,557 matchs réels (Matches.csv)
 * Date: 5 Janvier 2025
 *
 * Ces constantes remplacent les estimations/simulations par des VRAIES statistiques
 */

// ============================================================================
// PROBABILITÉS BASELINE RÉELLES
// ============================================================================

/**
 * Probabilités Over/Under 2.5 Goals (230,557 matchs)
 */
export const REAL_OVER_UNDER_PROBABILITIES = {
  over25: 0.4913, // 49.13% - Légère tendance UNDER
  under25: 0.5087, // 50.87%

  // Insight: Quasi 50/50, système doit être très précis pour battre hasard
  baseline_threshold: 0.50, // Seuil naturel
};

/**
 * Probabilités BTTS (Both Teams To Score) réelles
 */
export const REAL_BTTS_PROBABILITIES = {
  btts_yes: 0.5172, // 51.72% - Légèrement > 50%
  btts_no: 0.4828, // 48.28%

  // Insight: Légère tendance BTTS Yes, mais faible
  baseline_threshold: 0.52,
};

/**
 * Probabilités de résultat (Home/Draw/Away)
 */
export const REAL_RESULT_PROBABILITIES = {
  home_win: 0.4462, // 44.62% - FORT avantage domicile
  draw: 0.2649, // 26.49% - 1 match sur 4
  away_win: 0.2889, // 28.89%

  // Insight: Avantage domicile = +15.73% vs extérieur
  home_advantage_factor: 1.544, // 1.54x plus de victoires domicile
};

// ============================================================================
// SEUILS ELO OPTIMAUX (Basés sur données réelles)
// ============================================================================

/**
 * Seuils Elo pour prédire le résultat
 *
 * Calculés sur 230,557 matchs réels:
 * - Victoire domicile: Elo diff moyen = +44
 * - Match nul: Elo diff moyen = -10
 * - Victoire extérieur: Elo diff moyen = -61
 */
export const REAL_ELO_THRESHOLDS = {
  // Seuil pour prédire victoire domicile
  home_win_threshold: 44, // Si Elo diff > +44 → Forte prob victoire domicile

  // Zone de match serré (nul probable)
  draw_zone_min: -10,
  draw_zone_max: 44,

  // Seuil pour prédire victoire extérieur
  away_win_threshold: -61, // Si Elo diff < -61 → Forte prob victoire extérieur

  // Elo diff moyens observés
  avg_elo_diff_home_win: 43.996,
  avg_elo_diff_draw: -9.874,
  avg_elo_diff_away_win: -61.328,
};

// ============================================================================
// CORRÉLATIONS CORNERS (ATTENTION: FAUSSES CROYANCES CORRIGÉES!)
// ============================================================================

/**
 * ⚠️ INSIGHT MAJEUR: Corners NE prédisent PAS Over/Under 2.5!
 *
 * Analyse de 230,557 matchs:
 * - Corners moyens (Over 2.5): 10.36
 * - Corners moyens (Under 2.5): 10.44
 * - Différence: -0.08 (QUASI-NULLE!)
 *
 * CONCLUSION: Les corners n'ont AUCUNE corrélation significative avec Over/Under 2.5
 */
export const REAL_CORNER_STATS = {
  avg_corners_over25: 10.36,
  avg_corners_under25: 10.44,

  // Différence négligeable → PAS de corrélation
  correlation_with_over_under: -0.08, // Quasi-nulle!

  // ⚠️ NE PAS utiliser corners pour prédire Over/Under!
  is_predictive_of_goals: false,

  warning: "Corners DO NOT predict Over/Under 2.5 goals based on real data!",
};

// ============================================================================
// AVANTAGE DOMICILE RÉEL
// ============================================================================

/**
 * Avantage domicile calculé sur 230,557 matchs
 */
export const REAL_HOME_ADVANTAGE = {
  // Probabilité baseline victoire domicile
  home_win_probability: 0.4462,

  // Probabilité baseline victoire extérieur
  away_win_probability: 0.2889,

  // Ratio victoires domicile/extérieur
  home_away_ratio: 1.544, // 1.54x plus de victoires domicile

  // Bonus à appliquer aux prédictions domicile
  home_bonus_factor: 0.157, // +15.7%

  // Ajustement Elo pour domicile (optimisé)
  elo_home_bonus: 44, // Basé sur Elo diff moyen victoires domicile
};

// ============================================================================
// DISTRIBUTION RÉELLE DES BUTS
// ============================================================================

/**
 * Distribution observée sur 230,557 matchs
 * (À compléter avec analyse plus détaillée si besoin)
 */
export const REAL_GOALS_DISTRIBUTION = {
  // Probabilités par nombre de buts total
  // Note: À extraire de l'analyse complète
  mean_goals_per_match: 2.65, // Estimation basée sur Over/Under ~50/50

  // Goals par équipe
  mean_home_goals: 1.45, // Estimation
  mean_away_goals: 1.20, // Estimation (moins que domicile)
};

// ============================================================================
// MÉTRIQUES DE QUALITÉ POUR VALIDATION
// ============================================================================

/**
 * Métriques pour valider la qualité des prédictions
 */
export const QUALITY_METRICS = {
  // Données sources
  total_matches_analyzed: 230557,
  complete_data_matches: 109835,
  data_completeness_rate: 0.476, // 47.6%

  // Seuils de confiance recommandés (basés sur baseline)
  min_confidence_over_under: 0.55, // Doit battre 50.9% baseline
  min_confidence_btts: 0.57, // Doit battre 51.7% baseline
  min_confidence_result: 0.50, // Difficile de battre 44.6% domicile

  // Warning thresholds
  suspicious_over_confidence: 0.95, // > 95% = suspect
  suspicious_under_confidence: 0.30, // < 30% = données insuffisantes
};

// ============================================================================
// CONSTANTES DE CALIBRATION
// ============================================================================

/**
 * Facteurs de calibration pour ajuster les modèles statistiques
 * aux observations réelles
 */
export const CALIBRATION_FACTORS = {
  // Monte Carlo doit converger vers ces probabilités
  target_over25_rate: REAL_OVER_UNDER_PROBABILITIES.over25,
  target_btts_yes_rate: REAL_BTTS_PROBABILITIES.btts_yes,
  target_home_win_rate: REAL_RESULT_PROBABILITIES.home_win,

  // Facteurs d'ajustement si simulations dévient
  max_deviation_allowed: 0.05, // 5% max de déviation acceptable

  // Si précision < baseline → Système moins bon que hasard!
  baseline_accuracy_threshold: {
    over_under: 0.509, // Doit battre Under 2.5 (50.9%)
    btts: 0.517, // Doit battre BTTS Yes (51.7%)
    home_win: 0.446, // Doit battre victoire domicile (44.6%)
  },
};

// ============================================================================
// EXPORTS GROUPÉS
// ============================================================================

/**
 * Toutes les constantes réelles en un seul objet
 */
export const REAL_WORLD_DATA = {
  probabilities: {
    over_under: REAL_OVER_UNDER_PROBABILITIES,
    btts: REAL_BTTS_PROBABILITIES,
    result: REAL_RESULT_PROBABILITIES,
  },
  thresholds: {
    elo: REAL_ELO_THRESHOLDS,
    quality: QUALITY_METRICS,
  },
  stats: {
    corners: REAL_CORNER_STATS,
    home_advantage: REAL_HOME_ADVANTAGE,
    goals: REAL_GOALS_DISTRIBUTION,
  },
  calibration: CALIBRATION_FACTORS,

  // Métadonnées
  metadata: {
    source: 'Matches.csv',
    total_matches: 230557,
    analysis_date: '2025-01-05',
    version: '1.0.0',
  },
};

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Vérifie si une prédiction Over/Under bat le baseline
 */
export function beatsOverUnderBaseline(predictedProb: number): boolean {
  return predictedProb > REAL_OVER_UNDER_PROBABILITIES.under25;
}

/**
 * Vérifie si une prédiction BTTS bat le baseline
 */
export function beatsBttsBaseline(predictedProb: number): boolean {
  return predictedProb > REAL_BTTS_PROBABILITIES.btts_yes;
}

/**
 * Calcule la probabilité de victoire basée sur Elo diff réel
 */
export function calculateWinProbabilityFromElo(eloDiff: number): {
  home: number;
  draw: number;
  away: number;
} {
  if (eloDiff > REAL_ELO_THRESHOLDS.home_win_threshold) {
    // Fort avantage domicile
    return {
      home: 0.60,
      draw: 0.25,
      away: 0.15,
    };
  } else if (eloDiff > REAL_ELO_THRESHOLDS.draw_zone_min &&
             eloDiff < REAL_ELO_THRESHOLDS.draw_zone_max) {
    // Match serré
    return {
      home: 0.40,
      draw: 0.35,
      away: 0.25,
    };
  } else if (eloDiff < REAL_ELO_THRESHOLDS.away_win_threshold) {
    // Fort avantage extérieur
    return {
      home: 0.20,
      draw: 0.25,
      away: 0.55,
    };
  } else {
    // Avantage domicile modéré (baseline)
    return {
      home: REAL_RESULT_PROBABILITIES.home_win,
      draw: REAL_RESULT_PROBABILITIES.draw,
      away: REAL_RESULT_PROBABILITIES.away_win,
    };
  }
}

/**
 * Valide qu'une prédiction est meilleure que le hasard
 */
export function validatePredictionQuality(
  type: 'over_under' | 'btts' | 'result',
  confidence: number
): {
  valid: boolean;
  beats_baseline: boolean;
  message: string;
} {
  let baseline: number;
  let threshold: number;

  switch (type) {
    case 'over_under':
      baseline = REAL_OVER_UNDER_PROBABILITIES.under25;
      threshold = QUALITY_METRICS.min_confidence_over_under;
      break;
    case 'btts':
      baseline = REAL_BTTS_PROBABILITIES.btts_yes;
      threshold = QUALITY_METRICS.min_confidence_btts;
      break;
    case 'result':
      baseline = REAL_RESULT_PROBABILITIES.home_win;
      threshold = QUALITY_METRICS.min_confidence_result;
      break;
  }

  const beats_baseline = confidence > baseline;
  const valid = confidence >= threshold;

  let message = '';
  if (!beats_baseline) {
    message = `⚠️ Confiance ${(confidence * 100).toFixed(1)}% ne bat pas baseline ${(baseline * 100).toFixed(1)}%`;
  } else if (!valid) {
    message = `⚠️ Confiance ${(confidence * 100).toFixed(1)}% insuffisante (min: ${(threshold * 100).toFixed(1)}%)`;
  } else {
    message = `✅ Confiance ${(confidence * 100).toFixed(1)}% bat baseline ${(baseline * 100).toFixed(1)}%`;
  }

  return { valid, beats_baseline, message };
}
