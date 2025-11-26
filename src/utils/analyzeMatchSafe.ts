import { TeamStats, MatchPrediction, DataQuality } from '../types/football';
import { analyzeMatch } from './footballAnalysis';
import { validatePrediction } from './predictionValidationSystem';
import { REAL_OVER_UNDER_PROBABILITIES, REAL_BTTS_PROBABILITIES } from './realWorldConstants';
import { getCachedPrediction, setCachedPrediction } from './predictionCache';
import {
  validateUltraConservative,
  validateZeroTolerance,
  calculateLossAversionScore,
  UltraConservativeResult
} from './ultraConservativeValidation';

/**
 * SYSTÈME DE VALIDATION OBLIGATOIRE
 *
 * Ce wrapper garantit que TOUTES les prédictions passent par validation multi-niveaux
 * avant d'être affichées à l'utilisateur.
 *
 * SÉCURITÉ:
 * - Safety score < 50 → BLOQUÉ (erreur levée)
 * - Safety score 50-70 → WARNING (console uniquement)
 * - Safety score > 70 → SAFE (ok)
 *
 * USAGE:
 * ```typescript
 * // ❌ AVANT (dangereux):
 * const prediction = analyzeMatch(homeTeam, awayTeam);
 *
 * // ✅ APRÈS (sécurisé):
 * const { prediction, validation, safetyReport } = analyzeMatchSafe(homeTeam, awayTeam);
 * if (!validation.shouldProceed) {
 *   return <ErrorDisplay errors={validation.errors} />;
 * }
 * ```
 */

export interface SafetyReport {
  safetyScore: number;
  riskLevel: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  shouldProceed: boolean;
  errors: string[];
  warnings: string[];
  dataQuality: {
    score: number;
    level: string;
    missingFields: number;
  };
  validationPassed: {
    inputValidation: boolean;
    statisticalAnomalies: boolean;
    predictionCoherence: boolean;
    confidenceCheck: boolean;
    thresholdSafety: boolean;
  };
}

export interface SafeAnalysisResult {
  prediction: MatchPrediction;
  validation: SafetyReport;
  safetyReport: SafetyReport; // Alias pour compatibilité
  ultraConservative?: UltraConservativeResult; // Validation ultra-conservatrice
  lossAversion?: {
    expectedValue: number;
    lossAversionAdjusted: number;
    recommendation: 'BET' | 'NO_BET';
    message: string;
  };
}

/**
 * WRAPPER DE VALIDATION OBLIGATOIRE
 *
 * Analyse un match avec validation complète en 7 niveaux:
 * 1. Validation des données d'entrée
 * 2. Détection anomalies statistiques
 * 3. Cohérence inter-prédictions
 * 4. Vérification confiance
 * 5. Seuils de sécurité
 * 6. Calibration sur baselines réels
 * 7. Score de sécurité final
 */
export function analyzeMatchSafe(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  options: {
    blockHighRisk?: boolean; // true = bloque si safety < 50
    warnMediumRisk?: boolean; // true = warning si safety < 70
    calibrateToBaseline?: boolean; // true = force convergence vers REAL_WORLD_DATA
    useCache?: boolean; // true = utilise cache LRU (défaut: true)
    ultraConservative?: boolean; // true = active validation ultra-conservatrice (défaut: true)
    zeroTolerance?: boolean; // true = mode zero tolerance (blocage agressif)
    checkLossAversion?: boolean; // true = calcule espérance avec aversion pertes (défaut: true)
    stake?: number; // Mise pour calcul espérance (défaut: 100)
  } = {}
): SafeAnalysisResult {
  const {
    blockHighRisk = true,
    warnMediumRisk = true,
    calibrateToBaseline = true,
    useCache = true,
    ultraConservative = true, // ACTIVÉ PAR DÉFAUT
    zeroTolerance = false,
    checkLossAversion = true, // ACTIVÉ PAR DÉFAUT
    stake = 100
  } = options;

  // ÉTAPE 0: Vérifier cache (si activé)
  let rawPrediction: MatchPrediction;
  if (useCache) {
    const cached = getCachedPrediction(homeTeam, awayTeam);
    if (cached) {
      rawPrediction = cached;
    } else {
      // ÉTAPE 1: Analyse statistique standard (50k Monte Carlo iterations)
      rawPrediction = analyzeMatch(homeTeam, awayTeam);
      setCachedPrediction(homeTeam, awayTeam, rawPrediction);
    }
  } else {
    // ÉTAPE 1: Analyse statistique standard (sans cache)
    rawPrediction = analyzeMatch(homeTeam, awayTeam);
  }

  // ÉTAPE 2: Validation multi-niveaux
  const validation = performComprehensiveValidation(homeTeam, awayTeam, rawPrediction);

  // ÉTAPE 3: Calibration baselines réels (optionnel)
  const calibratedPrediction = calibrateToBaseline
    ? calibrateToRealWorldBaselines(rawPrediction, validation)
    : rawPrediction;

  // ÉTAPE 4: Construction rapport de sécurité
  const safetyReport = buildSafetyReport(validation, rawPrediction.dataQuality);

  // ============================================================================
  // ÉTAPE 5: VALIDATION ULTRA-CONSERVATRICE (ANTI-PERTE)
  // ============================================================================
  let ultraConservativeResult: UltraConservativeResult | undefined;
  let lossAversionResult: any;

  if (ultraConservative || zeroTolerance) {
    console.log('🔒 [ULTRA-CONSERVATEUR] Activation validation stricte...');

    if (zeroTolerance) {
      // MODE ZERO TOLERANCE: Blocage au moindre doute
      ultraConservativeResult = validateZeroTolerance(calibratedPrediction, safetyReport.safetyScore);
      console.log('⚠️ [ZERO TOLERANCE] Mode activé - Seuils maximaux appliqués');
    } else {
      // MODE ULTRA-CONSERVATEUR: Seuils très stricts
      ultraConservativeResult = validateUltraConservative(calibratedPrediction, safetyReport.safetyScore);
    }

    console.log('📊 [ULTRA-CONSERVATEUR] Résultat:', {
      approved: ultraConservativeResult.approved,
      finalScore: ultraConservativeResult.finalScore,
      confidence: ultraConservativeResult.confidence,
      recommendation: ultraConservativeResult.recommendation,
      riskFactors: ultraConservativeResult.riskFactors.length
    });

    // Blocage si rejeté
    if (!ultraConservativeResult.approved) {
      console.error('🚫 [ULTRA-CONSERVATEUR BLOCKED]', ultraConservativeResult.message);
      console.error('   Risk Factors:', ultraConservativeResult.riskFactors);
      console.error('   Penalties:', ultraConservativeResult.penalties);

      if (ultraConservativeResult.recommendation === 'CRITICAL_REJECTION') {
        throw new Error(
          `❌ REJET CRITIQUE ULTRA-CONSERVATEUR\n\n` +
          ultraConservativeResult.message + '\n\n' +
          `Facteurs de risque (${ultraConservativeResult.riskFactors.length}):\n` +
          ultraConservativeResult.riskFactors.map(r => `  - ${r}`).join('\n') + '\n\n' +
          `Pénalités appliquées (${ultraConservativeResult.penalties.length}):\n` +
          ultraConservativeResult.penalties.map(p => `  - ${p.reason}: -${p.points} pts`).join('\n') + '\n\n' +
          `🚫 IMPOSSIBLE DE PARIER - Risque de perte trop élevé`
        );
      }
    } else {
      console.log('✅ [ULTRA-CONSERVATEUR APPROVED]', ultraConservativeResult.message);
    }
  }

  // ============================================================================
  // ÉTAPE 6: CALCUL AVERSION AUX PERTES (PROSPECT THEORY)
  // ============================================================================
  if (checkLossAversion) {
    lossAversionResult = calculateLossAversionScore(calibratedPrediction, stake);

    console.log('💰 [AVERSION PERTES] Analyse:', {
      expectedValue: lossAversionResult.expectedValue.toFixed(2) + '£',
      lossAversionAdjusted: lossAversionResult.lossAversionAdjusted.toFixed(2) + '£',
      recommendation: lossAversionResult.recommendation
    });

    // Blocage si espérance négative avec aversion pertes
    if (lossAversionResult.recommendation === 'NO_BET') {
      console.warn('⚠️ [AVERSION PERTES] Recommandation: NE PAS PARIER');
      console.warn('   Message:', lossAversionResult.message);

      if (ultraConservative || zeroTolerance) {
        throw new Error(
          `❌ REJET AVERSION AUX PERTES\n\n` +
          lossAversionResult.message + '\n\n' +
          `Espérance standard: ${lossAversionResult.expectedValue.toFixed(2)}£\n` +
          `Espérance ajustée (aversion pertes × 2.5): ${lossAversionResult.lossAversionAdjusted.toFixed(2)}£\n\n` +
          `Le risque de perte (${((1 - calibratedPrediction.over25.confidence / 100) * 100).toFixed(1)}%) ` +
          `pèse 2.5× plus lourd que le potentiel de gain.\n\n` +
          `🚫 NE PAS PARIER - Principe d'aversion aux pertes`
        );
      }
    } else {
      console.log('✅ [AVERSION PERTES]', lossAversionResult.message);
    }
  }

  // ============================================================================
  // ÉTAPE 7: DÉCISION FINALE (VALIDATION STANDARD)
  // ============================================================================
  if (blockHighRisk && safetyReport.safetyScore < 50) {
    console.error('🚫 [PREDICTION BLOCKED] Safety score too low:', safetyReport.safetyScore);
    console.error('   Errors:', safetyReport.errors);
    throw new Error(
      `❌ PRÉDICTION BLOQUÉE - Score de sécurité trop faible (${safetyReport.safetyScore}/100)\n\n` +
      `Erreurs critiques:\n${safetyReport.errors.map(e => `  - ${e}`).join('\n')}\n\n` +
      `Impossible de générer une prédiction fiable avec ces données.`
    );
  }

  if (warnMediumRisk && safetyReport.safetyScore < 70) {
    console.warn('⚠️ [PREDICTION WARNING] Medium safety score:', safetyReport.safetyScore);
    console.warn('   Warnings:', safetyReport.warnings);
  }

  console.log('✅ [PREDICTION SAFE] Safety score:', safetyReport.safetyScore);

  return {
    prediction: calibratedPrediction,
    validation: safetyReport,
    safetyReport,
    ultraConservative: ultraConservativeResult,
    lossAversion: lossAversionResult
  };
}

/**
 * VALIDATION COMPLÈTE EN 7 NIVEAUX
 */
function performComprehensiveValidation(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  prediction: MatchPrediction
): any {
  const issues: string[] = [];
  const warnings: string[] = [];
  let safetyScore = 100;

  // NIVEAU 1: Données d'entrée
  const inputValidation = validateInputData(homeTeam, awayTeam);
  if (!inputValidation.isValid) {
    issues.push(...inputValidation.errors);
    safetyScore -= 20;
  }

  // NIVEAU 2: Anomalies statistiques
  const anomalyDetection = detectStatisticalAnomalies(homeTeam, awayTeam);
  if (anomalyDetection.hasAnomalies) {
    warnings.push(...anomalyDetection.anomalies);
    safetyScore -= 10;
  }

  // NIVEAU 3: Cohérence des prédictions
  const coherenceCheck = validatePredictionCoherence(prediction);
  if (!coherenceCheck.isCoherent) {
    issues.push(...coherenceCheck.errors);
    safetyScore -= 15;
  }

  // NIVEAU 4: Confiance
  const confidenceCheck = validateConfidence(prediction);
  if (!confidenceCheck.isValid) {
    warnings.push(...confidenceCheck.warnings);
    safetyScore -= 10;
  }

  // NIVEAU 5: Seuils de sécurité
  const thresholdCheck = validateThresholds(prediction);
  if (!thresholdCheck.isValid) {
    issues.push(...thresholdCheck.errors);
    safetyScore -= 15;
  }

  // NIVEAU 6: Déviation des baselines
  const baselineCheck = checkBaselineDeviation(prediction);
  if (baselineCheck.hasSignificantDeviation) {
    warnings.push(...baselineCheck.warnings);
    safetyScore -= 5;
  }

  // NIVEAU 7: Score final
  safetyScore = Math.max(0, Math.min(100, safetyScore));

  return {
    isValid: issues.length === 0,
    shouldProceed: safetyScore >= 50,
    safetyScore,
    errors: issues,
    warnings,
    validationPassed: {
      inputValidation: inputValidation.isValid,
      statisticalAnomalies: !anomalyDetection.hasAnomalies,
      predictionCoherence: coherenceCheck.isCoherent,
      confidenceCheck: confidenceCheck.isValid,
      thresholdSafety: thresholdCheck.isValid
    }
  };
}

/**
 * NIVEAU 1: Validation données d'entrée
 */
function validateInputData(homeTeam: TeamStats, awayTeam: TeamStats) {
  const errors: string[] = [];

  // Vérifier valeurs critiques
  if (!homeTeam.goalsPerMatch || homeTeam.goalsPerMatch < 0 || homeTeam.goalsPerMatch > 5) {
    errors.push(`Buts domicile invalides: ${homeTeam.goalsPerMatch}`);
  }
  if (!awayTeam.goalsPerMatch || awayTeam.goalsPerMatch < 0 || awayTeam.goalsPerMatch > 5) {
    errors.push(`Buts extérieur invalides: ${awayTeam.goalsPerMatch}`);
  }

  // Possession doit être entre 0-100
  if (homeTeam.possession && (homeTeam.possession < 0 || homeTeam.possession > 100)) {
    errors.push(`Possession domicile invalide: ${homeTeam.possession}%`);
  }
  if (awayTeam.possession && (awayTeam.possession < 0 || awayTeam.possession > 100)) {
    errors.push(`Possession extérieur invalide: ${awayTeam.possession}%`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * NIVEAU 2: Détection anomalies statistiques
 */
function detectStatisticalAnomalies(homeTeam: TeamStats, awayTeam: TeamStats) {
  const anomalies: string[] = [];

  // xG sans buts (suspect)
  if (homeTeam.expectedGoals && homeTeam.expectedGoals > 2 && homeTeam.goalsPerMatch < 0.5) {
    anomalies.push(`xG élevé (${homeTeam.expectedGoals}) mais buts faibles (${homeTeam.goalsPerMatch}) - Domicile`);
  }
  if (awayTeam.expectedGoals && awayTeam.expectedGoals > 2 && awayTeam.goalsPerMatch < 0.5) {
    anomalies.push(`xG élevé (${awayTeam.expectedGoals}) mais buts faibles (${awayTeam.goalsPerMatch}) - Extérieur`);
  }

  // Tirs cadrés > tirs totaux (impossible)
  if (homeTeam.shotsOnTargetPerMatch && homeTeam.shotsPerMatch &&
      homeTeam.shotsOnTargetPerMatch > homeTeam.shotsPerMatch) {
    anomalies.push(`Tirs cadrés > tirs totaux - Domicile`);
  }
  if (awayTeam.shotsOnTargetPerMatch && awayTeam.shotsPerMatch &&
      awayTeam.shotsOnTargetPerMatch > awayTeam.shotsPerMatch) {
    anomalies.push(`Tirs cadrés > tirs totaux - Extérieur`);
  }

  return {
    hasAnomalies: anomalies.length > 0,
    anomalies
  };
}

/**
 * NIVEAU 3: Cohérence inter-prédictions
 */
function validatePredictionCoherence(prediction: MatchPrediction) {
  const errors: string[] = [];

  // BTTS = Yes MAIS Over 2.5 = No → Incohérent
  if (prediction.btts.prediction === 'Yes' &&
      prediction.btts.confidence > 70 &&
      prediction.over25.prediction === 'No' &&
      prediction.over25.confidence > 70) {
    errors.push('Incohérence: BTTS=Yes mais Over2.5=No (impossible si confiance élevée)');
  }

  // Over 2.5 = Yes MAIS BTTS = No ET home/away clean sheet → Suspect
  if (prediction.over25.prediction === 'Yes' &&
      prediction.over25.confidence > 80 &&
      prediction.btts.prediction === 'No') {
    // Acceptable seulement si une équipe domine fortement (ex: 3-0, 4-0)
    const scoreDiff = Math.abs(prediction.mostLikelyScore.homeGoals - prediction.mostLikelyScore.awayGoals);
    if (scoreDiff < 2) {
      errors.push('Incohérence: Over2.5=Yes mais BTTS=No sans domination claire');
    }
  }

  return {
    isCoherent: errors.length === 0,
    errors
  };
}

/**
 * NIVEAU 4: Validation confiance
 */
function validateConfidence(prediction: MatchPrediction) {
  const warnings: string[] = [];

  // Confiance > 95% suspect
  if (prediction.over25.confidence > 95) {
    warnings.push(`Confiance Over2.5 trop élevée: ${prediction.over25.confidence}% (max recommandé: 95%)`);
  }
  if (prediction.btts.confidence > 95) {
    warnings.push(`Confiance BTTS trop élevée: ${prediction.btts.confidence}% (max recommandé: 95%)`);
  }

  // Confiance < 30% inutile
  if (prediction.over25.confidence < 30) {
    warnings.push(`Confiance Over2.5 trop faible: ${prediction.over25.confidence}% (min recommandé: 30%)`);
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
}

/**
 * NIVEAU 5: Seuils de sécurité
 */
function validateThresholds(prediction: MatchPrediction) {
  const errors: string[] = [];

  // Corners > 30 (quasi impossible)
  if (prediction.corners.total.predicted > 30) {
    errors.push(`Corners projetés trop élevés: ${prediction.corners.total.predicted} (max réaliste: 30)`);
  }

  // Fautes > 50 (quasi impossible)
  if (prediction.fouls.total.predicted > 50) {
    errors.push(`Fautes projetées trop élevées: ${prediction.fouls.total.predicted} (max réaliste: 50)`);
  }

  // Cartons jaunes > 15 (impossible sans expulsion masse)
  if (prediction.cards.total.predicted > 15) {
    errors.push(`Cartons jaunes projetés trop élevés: ${prediction.cards.total.predicted} (max réaliste: 15)`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * NIVEAU 6: Déviation des baselines réels
 */
function checkBaselineDeviation(prediction: MatchPrediction) {
  const warnings: string[] = [];

  // Over 2.5: baseline réel = 49.13%
  const over25Prob = prediction.over25.prediction === 'Yes'
    ? prediction.over25.confidence / 100
    : (100 - prediction.over25.confidence) / 100;

  const over25Deviation = Math.abs(over25Prob - REAL_OVER_UNDER_PROBABILITIES.over25);
  if (over25Deviation > 0.25) {
    warnings.push(`Forte déviation Over2.5: ${(over25Prob * 100).toFixed(1)}% vs baseline ${(REAL_OVER_UNDER_PROBABILITIES.over25 * 100).toFixed(1)}%`);
  }

  // BTTS: baseline réel = 51.72%
  const bttsProb = prediction.btts.prediction === 'Yes'
    ? prediction.btts.confidence / 100
    : (100 - prediction.btts.confidence) / 100;

  const bttsDeviation = Math.abs(bttsProb - REAL_BTTS_PROBABILITIES.btts_yes);
  if (bttsDeviation > 0.25) {
    warnings.push(`Forte déviation BTTS: ${(bttsProb * 100).toFixed(1)}% vs baseline ${(REAL_BTTS_PROBABILITIES.btts_yes * 100).toFixed(1)}%`);
  }

  return {
    hasSignificantDeviation: warnings.length > 0,
    warnings
  };
}

/**
 * CALIBRATION SUR BASELINES RÉELS
 *
 * Si prédiction proche baseline (±5%), ajuster légèrement vers baseline
 * pour éviter overconfidence.
 */
function calibrateToRealWorldBaselines(
  prediction: MatchPrediction,
  validation: any
): MatchPrediction {
  // Ne calibrer que si validation OK
  if (!validation.shouldProceed || validation.safetyScore < 60) {
    return prediction;
  }

  const calibrated = { ...prediction };

  // Calibrer Over 2.5
  const over25Prob = prediction.over25.prediction === 'Yes'
    ? prediction.over25.confidence / 100
    : (100 - prediction.over25.confidence) / 100;

  const over25Diff = Math.abs(over25Prob - REAL_OVER_UNDER_PROBABILITIES.over25);
  if (over25Diff < 0.05) {
    // Proche baseline → ajuster légèrement
    const calibratedProb = (over25Prob + REAL_OVER_UNDER_PROBABILITIES.over25) / 2;
    calibrated.over25.confidence = Math.round(
      prediction.over25.prediction === 'Yes'
        ? calibratedProb * 100
        : (1 - calibratedProb) * 100
    );
  }

  // Calibrer BTTS
  const bttsProb = prediction.btts.prediction === 'Yes'
    ? prediction.btts.confidence / 100
    : (100 - prediction.btts.confidence) / 100;

  const bttsDiff = Math.abs(bttsProb - REAL_BTTS_PROBABILITIES.btts_yes);
  if (bttsDiff < 0.05) {
    const calibratedProb = (bttsProb + REAL_BTTS_PROBABILITIES.btts_yes) / 2;
    calibrated.btts.confidence = Math.round(
      prediction.btts.prediction === 'Yes'
        ? calibratedProb * 100
        : (1 - calibratedProb) * 100
    );
  }

  return calibrated;
}

/**
 * Construction rapport de sécurité final
 */
function buildSafetyReport(validation: any, dataQuality: DataQuality): SafetyReport {
  let riskLevel: SafetyReport['riskLevel'] = 'VERY_LOW';

  if (validation.safetyScore < 50) riskLevel = 'CRITICAL';
  else if (validation.safetyScore < 60) riskLevel = 'HIGH';
  else if (validation.safetyScore < 70) riskLevel = 'MEDIUM';
  else if (validation.safetyScore < 85) riskLevel = 'LOW';

  return {
    safetyScore: validation.safetyScore,
    riskLevel,
    shouldProceed: validation.shouldProceed,
    errors: validation.errors,
    warnings: validation.warnings,
    dataQuality: {
      score: dataQuality.score,
      level: dataQuality.level,
      missingFields: dataQuality.missingFields.length
    },
    validationPassed: validation.validationPassed
  };
}
