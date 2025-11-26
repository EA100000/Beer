/**
 * SYSTÈME DE VALIDATION ULTRA-STRICT POUR PRÉCISION 100%
 *
 * Valide chaque prédiction avec 7 niveaux de contrôle:
 * 1. Cohérence des données
 * 2. Plausibilité statistique
 * 3. Corrélation inter-variables
 * 4. Détection d'anomalies
 * 5. Validation contextuelle
 * 6. Test de robustesse
 * 7. Score de confiance final
 */

import { EnrichedLiveMetrics } from './advancedLiveAnalysis';

export interface ValidationResult {
  isValid: boolean;
  confidence: number;         // 0-100
  riskLevel: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  validationScore: number;    // 0-100
  issues: ValidationIssue[];
  recommendations: string[];
  safetyLocks: SafetyLock[];
}

export interface ValidationIssue {
  level: 'warning' | 'error' | 'critical';
  category: string;
  message: string;
  impact: number; // 0-100
}

export interface SafetyLock {
  name: string;
  triggered: boolean;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Validation complète d'une prédiction
 */
export function validatePrediction(
  enrichedMetrics: EnrichedLiveMetrics,
  predictionType: 'goals' | 'corners' | 'fouls' | 'cards' | 'btts',
  predictedValue: number,
  threshold: number,
  predictionDirection: 'over' | 'under' | 'yes' | 'no'
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const recommendations: string[] = [];
  const safetyLocks: SafetyLock[] = [];

  let totalScore = 100;

  // ==================== NIVEAU 1: COHÉRENCE DES DONNÉES ====================
  const dataConsistency = validateDataConsistency(enrichedMetrics);
  if (dataConsistency.score < 70) {
    issues.push({
      level: 'warning',
      category: 'Data Consistency',
      message: `Cohérence des données faible: ${dataConsistency.score.toFixed(0)}%`,
      impact: 100 - dataConsistency.score
    });
    totalScore -= (100 - dataConsistency.score) * 0.15;
  }

  dataConsistency.issues.forEach(issue => {
    issues.push({
      level: 'warning',
      category: 'Data Consistency',
      message: issue,
      impact: 10
    });
  });

  // ==================== NIVEAU 2: PLAUSIBILITÉ STATISTIQUE ====================
  const plausibility = validatePlausibility(
    enrichedMetrics,
    predictionType,
    predictedValue
  );

  if (!plausibility.isPlausible) {
    issues.push({
      level: 'error',
      category: 'Statistical Plausibility',
      message: plausibility.reason,
      impact: 30
    });
    totalScore -= 30;

    safetyLocks.push({
      name: 'Plausibility Check',
      triggered: true,
      reason: plausibility.reason,
      severity: 'high'
    });
  }

  // ==================== NIVEAU 3: CORRÉLATION INTER-VARIABLES ====================
  const correlation = validateCorrelations(enrichedMetrics, predictionType);
  if (correlation.score < 60) {
    issues.push({
      level: 'warning',
      category: 'Variable Correlation',
      message: `Corrélations incohérentes: ${correlation.score.toFixed(0)}%`,
      impact: 60 - correlation.score
    });
    totalScore -= (60 - correlation.score) * 0.2;
  }

  correlation.warnings.forEach(warning => {
    recommendations.push(warning);
  });

  // ==================== NIVEAU 4: DÉTECTION D'ANOMALIES ====================
  const anomalies = detectAnomalies(enrichedMetrics);
  if (anomalies.length > 0) {
    anomalies.forEach(anomaly => {
      issues.push({
        level: anomaly.severity === 'high' ? 'error' : 'warning',
        category: 'Anomaly Detection',
        message: anomaly.description,
        impact: anomaly.severity === 'high' ? 25 : 10
      });
      totalScore -= anomaly.severity === 'high' ? 25 : 10;
    });

    if (anomalies.some(a => a.severity === 'high')) {
      safetyLocks.push({
        name: 'Anomaly Detector',
        triggered: true,
        reason: `${anomalies.filter(a => a.severity === 'high').length} anomalies critiques détectées`,
        severity: 'critical'
      });
    }
  }

  // ==================== NIVEAU 5: VALIDATION CONTEXTUELLE ====================
  const contextValidation = validateContext(enrichedMetrics, predictionType, predictedValue);
  if (contextValidation.score < 70) {
    issues.push({
      level: 'warning',
      category: 'Contextual Validation',
      message: `Contexte inhabituel: ${contextValidation.message}`,
      impact: 70 - contextValidation.score
    });
    totalScore -= (70 - contextValidation.score) * 0.15;
  }

  // ==================== NIVEAU 6: TEST DE ROBUSTESSE ====================
  const robustness = testRobustness(
    enrichedMetrics,
    predictionType,
    predictedValue,
    threshold
  );

  if (robustness.marginOfSafety < 0.15) {
    issues.push({
      level: 'warning',
      category: 'Robustness',
      message: `Marge de sécurité faible: ${(robustness.marginOfSafety * 100).toFixed(1)}%`,
      impact: 20
    });
    totalScore -= 20;

    recommendations.push(
      `⚠️ Prédiction proche du seuil (marge: ${(robustness.marginOfSafety * 100).toFixed(1)}%). Considérer augmenter le seuil de confiance requis.`
    );
  }

  if (robustness.volatility > 0.3) {
    issues.push({
      level: 'warning',
      category: 'Robustness',
      message: `Volatilité élevée: ${(robustness.volatility * 100).toFixed(1)}%`,
      impact: 15
    });
    totalScore -= 15;
  }

  // ==================== NIVEAU 7: SCORE DE CONFIANCE FINAL ====================
  const finalConfidence = calculateFinalConfidence(
    enrichedMetrics,
    totalScore,
    issues
  );

  // Seuils ultra-stricts
  if (finalConfidence < 75) {
    safetyLocks.push({
      name: 'Confidence Threshold',
      triggered: true,
      reason: `Confiance finale trop faible: ${finalConfidence.toFixed(1)}% < 75%`,
      severity: 'critical'
    });
  }

  if (totalScore < 60) {
    safetyLocks.push({
      name: 'Validation Score Threshold',
      triggered: true,
      reason: `Score de validation trop faible: ${totalScore.toFixed(1)}% < 60%`,
      severity: 'critical'
    });
  }

  // Verrous de sécurité spécifiques au type de prédiction
  const specificLocks = applySpecificSafetyLocks(
    enrichedMetrics,
    predictionType,
    predictedValue,
    threshold,
    predictionDirection
  );
  safetyLocks.push(...specificLocks);

  // Déterminer le niveau de risque
  let riskLevel: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  const criticalIssues = issues.filter(i => i.level === 'critical').length;
  const errorIssues = issues.filter(i => i.level === 'error').length;
  const activeLocks = safetyLocks.filter(l => l.triggered).length;

  if (criticalIssues > 0 || activeLocks >= 3 || finalConfidence < 65) {
    riskLevel = 'CRITICAL';
  } else if (errorIssues > 0 || activeLocks >= 2 || finalConfidence < 75) {
    riskLevel = 'HIGH';
  } else if (issues.length > 3 || activeLocks >= 1 || finalConfidence < 85) {
    riskLevel = 'MEDIUM';
  } else if (issues.length > 0 || finalConfidence < 92) {
    riskLevel = 'LOW';
  } else {
    riskLevel = 'VERY_LOW';
  }

  // Ajout de recommandations
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    recommendations.push('🚨 NE PAS PARIER - Risque trop élevé');
    recommendations.push('Attendre plus de données ou choisir une autre prédiction');
  } else if (riskLevel === 'MEDIUM') {
    recommendations.push('⚠️ Mise réduite recommandée (50% du montant habituel)');
  } else if (riskLevel === 'LOW') {
    recommendations.push('✅ Mise normale acceptable');
  } else {
    recommendations.push('✅✅ Excellente opportunité - Confiance maximale');
  }

  // Vérification finale
  // ⚠️ CORRECTION CRITIQUE: Seuils augmentés pour éviter pertes massives (252M£)
  // Ancien: totalScore >= 60, finalConfidence >= 75
  // Nouveau: totalScore >= 85, finalConfidence >= 90, riskLevel VERY_LOW obligatoire
  const isValid = safetyLocks.filter(l => l.triggered && (l.severity === 'high' || l.severity === 'critical')).length === 0 &&
                  totalScore >= 85 &&
                  finalConfidence >= 90 &&
                  riskLevel === 'VERY_LOW';

  return {
    isValid,
    confidence: Math.max(0, Math.min(100, finalConfidence)),
    riskLevel,
    validationScore: Math.max(0, Math.min(100, totalScore)),
    issues,
    recommendations,
    safetyLocks
  };
}

/**
 * Valide la cohérence des données
 */
function validateDataConsistency(metrics: EnrichedLiveMetrics): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;

  // Vérifier que possession = 100%
  const totalPossession = metrics.base.homePossession + metrics.base.awayPossession;
  if (Math.abs(totalPossession - 100) > 5) {
    issues.push(`Possession totale incohérente: ${totalPossession}% (attendu: 100%)`);
    score -= 15;
  }

  // Vérifier cohérence tirs cadrés <= total tirs
  if (metrics.base.homeShotsOnTarget > metrics.base.homeTotalShots) {
    issues.push(`Tirs cadrés home (${metrics.base.homeShotsOnTarget}) > Total tirs (${metrics.base.homeTotalShots})`);
    score -= 20;
  }
  if (metrics.base.awayShotsOnTarget > metrics.base.awayTotalShots) {
    issues.push(`Tirs cadrés away (${metrics.base.awayShotsOnTarget}) > Total tirs (${metrics.base.awayTotalShots})`);
    score -= 20;
  }

  // Vérifier cohérence passes précises <= total passes
  if (metrics.base.homeAccuratePasses > metrics.base.homePasses) {
    issues.push(`Passes précises home > Total passes`);
    score -= 20;
  }
  if (metrics.base.awayAccuratePasses > metrics.base.awayPasses) {
    issues.push(`Passes précises away > Total passes`);
    score -= 20;
  }

  // Vérifier que les stats augmentent avec le temps (si > 30 min)
  if (metrics.context.matchMinute > 30) {
    const expectedMinCorners = metrics.context.matchMinute / 15; // ~1 corner / 15 min minimum
    const actualCorners = metrics.base.homeCorners + metrics.base.awayCorners;
    if (actualCorners < expectedMinCorners * 0.3) {
      issues.push(`Nombre de corners inhabituellement bas pour la minute ${metrics.context.matchMinute}`);
      score -= 10;
    }
  }

  return { score: Math.max(0, score), issues };
}

/**
 * Valide la plausibilité statistique
 */
function validatePlausibility(
  metrics: EnrichedLiveMetrics,
  predictionType: string,
  predictedValue: number
): { isPlausible: boolean; reason: string } {
  const minute = metrics.context.matchMinute;

  switch (predictionType) {
    case 'goals':
      // Maximum réaliste: ~15 buts par match
      if (predictedValue > 15) {
        return { isPlausible: false, reason: `Score final projeté irréaliste: ${predictedValue} buts` };
      }
      break;

    case 'corners':
      // Maximum réaliste: ~30 corners par match
      if (predictedValue > 30) {
        return { isPlausible: false, reason: `Nombre de corners projeté irréaliste: ${predictedValue}` };
      }
      // Minimum réaliste après 45': au moins 2 corners
      if (minute > 45 && predictedValue < 2) {
        return { isPlausible: false, reason: `Trop peu de corners projetés pour la minute ${minute}` };
      }
      break;

    case 'fouls':
      // Maximum réaliste: ~50 fautes par match
      if (predictedValue > 50) {
        return { isPlausible: false, reason: `Nombre de fautes projeté irréaliste: ${predictedValue}` };
      }
      // Minimum réaliste après 45': au moins 10 fautes
      if (minute > 45 && predictedValue < 10) {
        return { isPlausible: false, reason: `Trop peu de fautes projetées pour la minute ${minute}` };
      }
      break;

    case 'cards':
      // Maximum réaliste: ~10 cartons par match
      if (predictedValue > 10) {
        return { isPlausible: false, reason: `Nombre de cartons projeté irréaliste: ${predictedValue}` };
      }
      break;
  }

  return { isPlausible: true, reason: '' };
}

/**
 * Valide les corrélations entre variables
 */
function validateCorrelations(
  metrics: EnrichedLiveMetrics,
  predictionType: string
): { score: number; warnings: string[] } {
  const warnings: string[] = [];
  let score = 100;

  // Possession élevée devrait corréler avec plus de passes
  const avgPossession = (metrics.base.homePossession + metrics.base.awayPossession) / 2;
  const avgPasses = (metrics.base.homePasses + metrics.base.awayPasses) / 2;
  if (avgPossession > 60 && avgPasses < 200) {
    warnings.push('Possession élevée mais peu de passes enregistrées');
    score -= 15;
  }

  // Beaucoup de tirs devrait corréler avec occasions
  const totalShots = metrics.base.homeTotalShots + metrics.base.awayTotalShots;
  const totalChances = metrics.base.homeBigChances + metrics.base.awayBigChances;
  if (totalShots > 20 && totalChances < 2) {
    warnings.push('Beaucoup de tirs mais peu de grosses occasions');
    score -= 10;
  }

  // Corners devraient corréler avec attaques
  const totalCorners = metrics.base.homeCorners + metrics.base.awayCorners;
  if (predictionType === 'corners' && totalCorners > 10 && totalShots < 8) {
    warnings.push('Beaucoup de corners mais peu de tirs');
    score -= 10;
  }

  // Cartons devraient corréler avec fautes
  const totalCards = metrics.base.homeYellowCards + metrics.base.awayYellowCards;
  const totalFouls = metrics.base.homeFouls + metrics.base.awayFouls;
  if (totalCards > 4 && totalFouls < 15) {
    warnings.push('Beaucoup de cartons mais peu de fautes');
    score -= 15;
  }

  return { score: Math.max(0, score), warnings };
}

/**
 * Détecte les anomalies dans les données
 */
function detectAnomalies(metrics: EnrichedLiveMetrics): Array<{ description: string; severity: 'low' | 'high' }> {
  const anomalies: Array<{ description: string; severity: 'low' | 'high' }> = [];

  // Anomalie: Précision de tir > 80% (trop élevé)
  if (metrics.efficiency.shotAccuracy.home > 80) {
    anomalies.push({
      description: `Précision de tir home anormalement élevée: ${metrics.efficiency.shotAccuracy.home.toFixed(0)}%`,
      severity: 'low'
    });
  }
  if (metrics.efficiency.shotAccuracy.away > 80) {
    anomalies.push({
      description: `Précision de tir away anormalement élevée: ${metrics.efficiency.shotAccuracy.away.toFixed(0)}%`,
      severity: 'low'
    });
  }

  // Anomalie: xG très élevé sans buts
  const xGoalsHome = metrics.offensiveThreat.xGoals.home;
  const xGoalsAway = metrics.offensiveThreat.xGoals.away;
  const actualGoals = metrics.base.homeScore + metrics.base.awayScore;

  if ((xGoalsHome + xGoalsAway) > 4 && actualGoals === 0 && metrics.context.matchMinute > 45) {
    anomalies.push({
      description: `xG élevé (${(xGoalsHome + xGoalsAway).toFixed(1)}) mais aucun but après 45 minutes`,
      severity: 'high'
    });
  }

  // Anomalie: Dominance extrême sans résultat
  const dominanceDiff = Math.abs(metrics.dominance.overallDominance.home - metrics.dominance.overallDominance.away);
  if (dominanceDiff > 40 && Math.abs(metrics.context.scoreDifferential) < 2 && metrics.context.matchMinute > 60) {
    anomalies.push({
      description: `Dominance extrême (${dominanceDiff.toFixed(0)}%) sans se traduire au score`,
      severity: 'low'
    });
  }

  // Anomalie: Taux de conversion anormalement élevé
  if (metrics.efficiency.conversionRate.home > 50 && metrics.base.homeTotalShots > 5) {
    anomalies.push({
      description: `Taux de conversion home anormal: ${metrics.efficiency.conversionRate.home.toFixed(0)}%`,
      severity: 'high'
    });
  }
  if (metrics.efficiency.conversionRate.away > 50 && metrics.base.awayTotalShots > 5) {
    anomalies.push({
      description: `Taux de conversion away anormal: ${metrics.efficiency.conversionRate.away.toFixed(0)}%`,
      severity: 'high'
    });
  }

  return anomalies;
}

/**
 * Valide le contexte de la prédiction
 */
function validateContext(
  metrics: EnrichedLiveMetrics,
  predictionType: string,
  predictedValue: number
): { score: number; message: string } {
  let score = 100;
  let message = '';

  // Contexte inhabituel si match très défensif et prédiction over buts
  if (metrics.context.gameState === 'defensive' && predictionType === 'goals' && predictedValue > 2.5) {
    score -= 20;
    message = 'Match défensif, prédiction over buts risquée';
  }

  // Contexte inhabituel si fin de match et grande différence au score
  if (metrics.context.matchMinute > 75 && Math.abs(metrics.context.scoreDifferential) >= 3) {
    score -= 15;
    message = 'Fin de match avec large écart, rythme peut ralentir';
  }

  // Contexte idéal si match ouvert et prédiction corners/buts
  if (metrics.context.gameState === 'open' && (predictionType === 'goals' || predictionType === 'corners')) {
    score += 10;
    message = 'Match ouvert, conditions favorables';
  }

  // Contexte problématique si intensité faible
  if (metrics.context.intensity === 'low' && metrics.context.matchMinute > 30) {
    score -= 15;
    message = 'Intensité faible, prédictions plus incertaines';
  }

  return { score: Math.min(100, Math.max(0, score)), message };
}

/**
 * Teste la robustesse de la prédiction
 */
function testRobustness(
  metrics: EnrichedLiveMetrics,
  predictionType: string,
  predictedValue: number,
  threshold: number
): { marginOfSafety: number; volatility: number } {
  // Marge de sécurité: distance au seuil
  const distance = Math.abs(predictedValue - threshold);
  const marginOfSafety = threshold > 0 ? distance / threshold : distance;

  // Volatilité: basée sur la cohérence des signaux
  const reliability = metrics.confidence.reliability;
  const consistency = metrics.confidence.consistency;
  const volatility = 1 - ((reliability + consistency) / 200);

  return {
    marginOfSafety: Math.max(0, Math.min(1, marginOfSafety)),
    volatility: Math.max(0, Math.min(1, volatility))
  };
}

/**
 * Calcule la confiance finale
 */
function calculateFinalConfidence(
  metrics: EnrichedLiveMetrics,
  validationScore: number,
  issues: ValidationIssue[]
): number {
  // Base: confiance des métriques enrichies
  let confidence = metrics.confidence.reliability;

  // Ajustement selon score de validation
  confidence = confidence * (validationScore / 100);

  // Pénalité pour chaque problème
  const criticalCount = issues.filter(i => i.level === 'critical').length;
  const errorCount = issues.filter(i => i.level === 'error').length;
  const warningCount = issues.filter(i => i.level === 'warning').length;

  confidence -= criticalCount * 15;
  confidence -= errorCount * 10;
  confidence -= warningCount * 3;

  // Bonus si données de haute qualité
  if (metrics.confidence.dataQuality > 90) {
    confidence += 5;
  }

  // Bonus si échantillon suffisant
  if (metrics.confidence.sampleSize > 50) {
    confidence += 3;
  }

  // Bonus si signaux prédictifs forts
  if (metrics.confidence.predictionStrength > 70) {
    confidence += 7;
  }

  return Math.max(0, Math.min(100, confidence));
}

/**
 * Applique les verrous de sécurité spécifiques au type de prédiction
 */
function applySpecificSafetyLocks(
  metrics: EnrichedLiveMetrics,
  predictionType: string,
  predictedValue: number,
  threshold: number,
  direction: 'over' | 'under' | 'yes' | 'no'
): SafetyLock[] {
  const locks: SafetyLock[] = [];

  switch (predictionType) {
    case 'corners':
      // Verrou: Prédiction under corners mais match très ouvert
      if (direction === 'under' && metrics.context.gameState === 'open' && metrics.context.intensity === 'very-high') {
        locks.push({
          name: 'Corners Under Safety Lock',
          triggered: true,
          reason: 'Match ouvert et intense, under corners risqué',
          severity: 'medium'
        });
      }
      break;

    case 'btts':
      // Verrou: BTTS Yes mais une équipe très défensive
      if (direction === 'yes') {
        const minXg = Math.min(metrics.offensiveThreat.xGoals.home, metrics.offensiveThreat.xGoals.away);
        if (minXg < 0.5 && metrics.context.matchMinute > 60) {
          locks.push({
            name: 'BTTS Yes Safety Lock',
            triggered: true,
            reason: `xG trop faible pour une équipe (${minXg.toFixed(2)})`,
            severity: 'high'
          });
        }
      }
      break;

    case 'fouls':
      // Verrou: Over fautes mais discipline élevée
      if (direction === 'over') {
        const avgDiscipline = (metrics.defensiveStrength.disciplineIndex.home + metrics.defensiveStrength.disciplineIndex.away) / 2;
        if (avgDiscipline > 80) {
          locks.push({
            name: 'Fouls Over Safety Lock',
            triggered: true,
            reason: `Discipline élevée (${avgDiscipline.toFixed(0)}), over fautes risqué`,
            severity: 'low'
          });
        }
      }
      break;
  }

  return locks;
}
