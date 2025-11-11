import { TeamStats, MatchPrediction } from '../types/football';

/**
 * SYSTÈME ULTRA-CONSERVATEUR
 *
 * Objectif: Minimiser les pertes en n'acceptant QUE les paris ultra-sûrs
 * Philosophie: Il vaut mieux NE PAS parier que de perdre
 *
 * Critères stricts:
 * - Confiance minimum: 80% (vs 40% actuel)
 * - Safety score minimum: 85 (vs 70 actuel)
 * - Consensus de 3+ modèles minimum
 * - Pas de prédictions sur matchs avec données incomplètes
 * - Filtrage des matchs à risque (derbies, relegation battles, etc.)
 */

export interface UltraConservativeResult {
  approved: boolean;
  confidence: number;
  reasons: string[];
  warnings: string[];
  recommendation: 'BET' | 'SKIP' | 'DANGER';
  expectedValue: number; // Expected Value (EV)
  kellyStake: number; // Kelly Criterion stake
  riskScore: number; // 0-100, lower is better
}

export interface BettingOpportunity {
  type: string;
  prediction: any;
  confidence: number;
  odds: number; // Estimated odds
  expectedValue: number;
  approved: boolean;
}

// Seuils ultra-conservateurs
const ULTRA_CONSERVATIVE_THRESHOLDS = {
  MIN_CONFIDENCE: 80, // Confiance minimum 80%
  MIN_SAFETY_SCORE: 85, // Score de sécurité minimum 85
  MIN_DATA_QUALITY: 75, // Qualité données minimum 75%
  MAX_RISK_SCORE: 20, // Score de risque maximum 20/100
  MIN_MODEL_AGREEMENT: 0.85, // 85% accord entre modèles
  MIN_EXPECTED_VALUE: 0.05, // EV minimum 5%
  MAX_KELLY_STAKE: 0.02, // Maximum 2% de bankroll (Kelly)
};

// Matchs à éviter absolument
const HIGH_RISK_MATCH_TYPES = [
  'DERBY',
  'RELEGATION_BATTLE',
  'FINALE',
  'PLAY_OFF',
];

/**
 * Valide une prédiction avec critères ultra-conservateurs
 */
export function validateUltraConservative(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  prediction: MatchPrediction,
  confidence: number,
  safetyScore: number,
  dataQualityScore: number,
  matchContext?: string
): UltraConservativeResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let riskScore = 0;
  let approved = true;

  // 1. Vérifier la confiance minimale
  if (confidence < ULTRA_CONSERVATIVE_THRESHOLDS.MIN_CONFIDENCE) {
    approved = false;
    reasons.push(`❌ Confiance trop faible: ${confidence}% < ${ULTRA_CONSERVATIVE_THRESHOLDS.MIN_CONFIDENCE}%`);
    riskScore += 30;
  }

  // 2. Vérifier le score de sécurité
  if (safetyScore < ULTRA_CONSERVATIVE_THRESHOLDS.MIN_SAFETY_SCORE) {
    approved = false;
    reasons.push(`❌ Score de sécurité insuffisant: ${safetyScore} < ${ULTRA_CONSERVATIVE_THRESHOLDS.MIN_SAFETY_SCORE}`);
    riskScore += 25;
  }

  // 3. Vérifier la qualité des données
  if (dataQualityScore < ULTRA_CONSERVATIVE_THRESHOLDS.MIN_DATA_QUALITY) {
    approved = false;
    reasons.push(`❌ Qualité des données insuffisante: ${dataQualityScore}% < ${ULTRA_CONSERVATIVE_THRESHOLDS.MIN_DATA_QUALITY}%`);
    riskScore += 20;
  }

  // 4. Vérifier le contexte du match
  if (matchContext && HIGH_RISK_MATCH_TYPES.includes(matchContext)) {
    approved = false;
    reasons.push(`❌ Type de match à risque élevé: ${matchContext}`);
    riskScore += 35;
    warnings.push('⚠️ Les derbies et matchs de relegation sont imprévisibles');
  }

  // 5. Vérifier les données critiques
  const criticalDataMissing = checkCriticalData(homeTeam, awayTeam);
  if (criticalDataMissing.length > 0) {
    approved = false;
    reasons.push(`❌ Données critiques manquantes: ${criticalDataMissing.join(', ')}`);
    riskScore += 25;
  }

  // 6. Détecter les anomalies statistiques
  const anomalies = detectAnomalies(homeTeam, awayTeam, prediction);
  if (anomalies.length > 0) {
    approved = false;
    anomalies.forEach(anomaly => {
      reasons.push(`❌ ${anomaly}`);
      riskScore += 15;
    });
  }

  // 7. Vérifier la cohérence des prédictions
  const inconsistencies = checkPredictionConsistency(prediction);
  if (inconsistencies.length > 0) {
    warnings.push(...inconsistencies);
    riskScore += 10 * inconsistencies.length;
    if (inconsistencies.length >= 2) {
      approved = false;
      reasons.push('❌ Multiples incohérences détectées dans les prédictions');
    }
  }

  // 8. Calculer Expected Value (EV)
  const expectedValue = calculateExpectedValue(prediction, confidence);
  if (expectedValue < ULTRA_CONSERVATIVE_THRESHOLDS.MIN_EXPECTED_VALUE) {
    approved = false;
    reasons.push(`❌ Expected Value insuffisante: ${(expectedValue * 100).toFixed(2)}% < ${ULTRA_CONSERVATIVE_THRESHOLDS.MIN_EXPECTED_VALUE * 100}%`);
    riskScore += 20;
  }

  // 9. Calculer Kelly stake
  const kellyStake = calculateKellyStake(confidence, 1.8); // Odds moyenne 1.8
  if (kellyStake > ULTRA_CONSERVATIVE_THRESHOLDS.MAX_KELLY_STAKE) {
    warnings.push(`⚠️ Kelly stake élevé: ${(kellyStake * 100).toFixed(2)}% de la bankroll`);
  }

  // Déterminer la recommandation finale
  let recommendation: 'BET' | 'SKIP' | 'DANGER';
  if (riskScore > 50) {
    recommendation = 'DANGER';
    approved = false;
  } else if (riskScore > 30 || !approved) {
    recommendation = 'SKIP';
  } else {
    recommendation = 'BET';
  }

  // Messages finaux
  if (approved) {
    reasons.push('✅ PARI APPROUVÉ - Tous les critères ultra-conservateurs sont satisfaits');
    reasons.push(`✅ Confiance: ${confidence}%`);
    reasons.push(`✅ Sécurité: ${safetyScore}/100`);
    reasons.push(`✅ Qualité données: ${dataQualityScore}%`);
    reasons.push(`✅ Expected Value: +${(expectedValue * 100).toFixed(2)}%`);
  } else {
    reasons.push('');
    reasons.push('🚫 PARI REFUSÉ - Ne pas parier sur ce match');
    reasons.push('💡 Il vaut mieux NE PAS parier que de perdre de l\'argent');
  }

  return {
    approved,
    confidence,
    reasons,
    warnings,
    recommendation,
    expectedValue,
    kellyStake,
    riskScore: Math.min(100, riskScore),
  };
}

/**
 * Vérifie les données critiques
 */
function checkCriticalData(homeTeam: TeamStats, awayTeam: TeamStats): string[] {
  const missing: string[] = [];

  const criticalFields: (keyof TeamStats)[] = [
    'goalsPerMatch',
    'goalsConcededPerMatch',
    'possession',
    'shotsOnTargetPerMatch',
  ];

  criticalFields.forEach(field => {
    if (!homeTeam[field] || homeTeam[field] === 0) {
      missing.push(`${field} (Domicile)`);
    }
    if (!awayTeam[field] || awayTeam[field] === 0) {
      missing.push(`${field} (Extérieur)`);
    }
  });

  return missing;
}

/**
 * Détecte les anomalies statistiques
 */
function detectAnomalies(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  prediction: MatchPrediction
): string[] {
  const anomalies: string[] = [];

  // Anomalie 1: Possession totale != 100%
  if (homeTeam.possession && awayTeam.possession) {
    const totalPossession = homeTeam.possession + awayTeam.possession;
    if (Math.abs(totalPossession - 100) > 5) {
      anomalies.push(`Possession totale anormale: ${totalPossession}%`);
    }
  }

  // Anomalie 2: Ratio buts marqués/encaissés suspect
  if (homeTeam.goalsPerMatch && homeTeam.goalsConcededPerMatch) {
    const homeRatio = homeTeam.goalsPerMatch / Math.max(homeTeam.goalsConcededPerMatch, 0.1);
    if (homeRatio > 5 || homeRatio < 0.2) {
      anomalies.push(`Ratio de buts domicile suspect: ${homeRatio.toFixed(2)}`);
    }
  }

  if (awayTeam.goalsPerMatch && awayTeam.goalsConcededPerMatch) {
    const awayRatio = awayTeam.goalsPerMatch / Math.max(awayTeam.goalsConcededPerMatch, 0.1);
    if (awayRatio > 5 || awayRatio < 0.2) {
      anomalies.push(`Ratio de buts extérieur suspect: ${awayRatio.toFixed(2)}`);
    }
  }

  // Anomalie 3: Prédiction de buts extrême
  if (prediction.expectedGoals) {
    const totalGoals = prediction.expectedGoals.home + prediction.expectedGoals.away;
    if (totalGoals > 6) {
      anomalies.push(`Prédiction de buts totaux très élevée: ${totalGoals.toFixed(1)}`);
    }
    if (totalGoals < 0.5) {
      anomalies.push(`Prédiction de buts totaux très faible: ${totalGoals.toFixed(1)}`);
    }
  }

  // Anomalie 4: SofaScore rating incohérent
  if (homeTeam.sofascoreRating && awayTeam.sofascoreRating) {
    if (homeTeam.sofascoreRating < 60 || awayTeam.sofascoreRating < 60) {
      anomalies.push('Rating SofaScore très faible (< 60) pour au moins une équipe');
    }
    if (homeTeam.sofascoreRating > 90 || awayTeam.sofascoreRating > 90) {
      anomalies.push('Rating SofaScore suspicieusement élevé (> 90)');
    }
  }

  return anomalies;
}

/**
 * Vérifie la cohérence des prédictions
 */
function checkPredictionConsistency(prediction: MatchPrediction): string[] {
  const inconsistencies: string[] = [];

  // Incohérence 1: BTTS + Over/Under
  if (prediction.btts && prediction.overUnder25Goals) {
    const bttsYes = prediction.btts.yes > 50;
    const over25 = prediction.overUnder25Goals.over > 50;

    if (bttsYes && !over25) {
      inconsistencies.push('⚠️ BTTS Oui mais Under 2.5 - incohérence possible');
    }
  }

  // Incohérence 2: Win probabilities
  if (prediction.homeWin && prediction.draw && prediction.awayWin) {
    const total = prediction.homeWin + prediction.draw + prediction.awayWin;
    if (Math.abs(total - 100) > 5) {
      inconsistencies.push(`⚠️ Probabilités de victoire totales != 100% (${total.toFixed(1)}%)`);
    }
  }

  // Incohérence 3: Expected goals vs Over/Under
  if (prediction.expectedGoals && prediction.overUnder25Goals) {
    const totalGoals = prediction.expectedGoals.home + prediction.expectedGoals.away;
    const over25Prob = prediction.overUnder25Goals.over;

    if (totalGoals > 3 && over25Prob < 60) {
      inconsistencies.push('⚠️ Expected goals élevés mais faible prob Over 2.5');
    }
    if (totalGoals < 2 && over25Prob > 60) {
      inconsistencies.push('⚠️ Expected goals faibles mais forte prob Over 2.5');
    }
  }

  return inconsistencies;
}

/**
 * Calcule Expected Value (EV)
 */
function calculateExpectedValue(prediction: MatchPrediction, confidence: number): number {
  // EV = (Probabilité de gain * Gain potentiel) - (Probabilité de perte * Mise)
  const winProb = confidence / 100;
  const estimatedOdds = 1.8; // Odds conservatrice moyenne
  const gain = estimatedOdds - 1;
  const ev = (winProb * gain) - ((1 - winProb) * 1);

  return ev;
}

/**
 * Calcule le Kelly Criterion stake
 */
function calculateKellyStake(confidence: number, odds: number): number {
  const p = confidence / 100;
  const q = 1 - p;
  const b = odds - 1;

  // Kelly formula: f = (bp - q) / b
  let kelly = (b * p - q) / b;

  // Fractional Kelly (0.25 Kelly pour sécurité)
  kelly = Math.max(0, kelly * 0.25);

  // Cap à 2% de bankroll
  return Math.min(kelly, ULTRA_CONSERVATIVE_THRESHOLDS.MAX_KELLY_STAKE);
}

/**
 * Filtre et retourne uniquement les paris ultra-sûrs
 */
export function filterUltraSafeBets(
  predictions: any[],
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  safetyScore: number,
  dataQuality: number
): BettingOpportunity[] {
  const safeBets: BettingOpportunity[] = [];

  // Over/Under 2.5
  if (predictions.overUnder25Goals) {
    const overConfidence = predictions.overUnder25Goals.over;
    const underConfidence = predictions.overUnder25Goals.under;

    if (overConfidence > ULTRA_CONSERVATIVE_THRESHOLDS.MIN_CONFIDENCE) {
      const validation = validateUltraConservative(
        homeTeam,
        awayTeam,
        predictions,
        overConfidence,
        safetyScore,
        dataQuality
      );

      if (validation.approved) {
        safeBets.push({
          type: 'Over 2.5 Goals',
          prediction: predictions.overUnder25Goals,
          confidence: overConfidence,
          odds: 1.8,
          expectedValue: validation.expectedValue,
          approved: true,
        });
      }
    }

    if (underConfidence > ULTRA_CONSERVATIVE_THRESHOLDS.MIN_CONFIDENCE) {
      const validation = validateUltraConservative(
        homeTeam,
        awayTeam,
        predictions,
        underConfidence,
        safetyScore,
        dataQuality
      );

      if (validation.approved) {
        safeBets.push({
          type: 'Under 2.5 Goals',
          prediction: predictions.overUnder25Goals,
          confidence: underConfidence,
          odds: 1.9,
          expectedValue: validation.expectedValue,
          approved: true,
        });
      }
    }
  }

  // BTTS
  if (predictions.btts) {
    const bttsYesConfidence = predictions.btts.yes;
    const bttsNoConfidence = predictions.btts.no;

    if (bttsYesConfidence > ULTRA_CONSERVATIVE_THRESHOLDS.MIN_CONFIDENCE) {
      const validation = validateUltraConservative(
        homeTeam,
        awayTeam,
        predictions,
        bttsYesConfidence,
        safetyScore,
        dataQuality
      );

      if (validation.approved) {
        safeBets.push({
          type: 'BTTS Yes',
          prediction: predictions.btts,
          confidence: bttsYesConfidence,
          odds: 1.85,
          expectedValue: validation.expectedValue,
          approved: true,
        });
      }
    }

    if (bttsNoConfidence > ULTRA_CONSERVATIVE_THRESHOLDS.MIN_CONFIDENCE) {
      const validation = validateUltraConservative(
        homeTeam,
        awayTeam,
        predictions,
        bttsNoConfidence,
        safetyScore,
        dataQuality
      );

      if (validation.approved) {
        safeBets.push({
          type: 'BTTS No',
          prediction: predictions.btts,
          confidence: bttsNoConfidence,
          odds: 2.0,
          expectedValue: validation.expectedValue,
          approved: true,
        });
      }
    }
  }

  return safeBets;
}

/**
 * Génère un rapport de recommandation
 */
export function generateBettingReport(
  safeBets: BettingOpportunity[],
  validation: UltraConservativeResult
): string {
  let report = '\n═══════════════════════════════════════════════\n';
  report += '   RAPPORT ULTRA-CONSERVATEUR\n';
  report += '═══════════════════════════════════════════════\n\n';

  if (safeBets.length === 0) {
    report += '🚫 AUCUN PARI RECOMMANDÉ\n\n';
    report += 'Ce match ne satisfait pas les critères ultra-conservateurs.\n';
    report += 'Il vaut mieux NE PAS parier que de risquer votre argent.\n\n';
    report += 'Raisons:\n';
    validation.reasons.forEach(reason => {
      report += `  ${reason}\n`;
    });
  } else {
    report += `✅ ${safeBets.length} PARIS APPROUVÉS\n\n`;

    safeBets.forEach((bet, index) => {
      report += `${index + 1}. ${bet.type}\n`;
      report += `   Confiance: ${bet.confidence.toFixed(1)}%\n`;
      report += `   Cote estimée: ${bet.odds.toFixed(2)}\n`;
      report += `   Expected Value: +${(bet.expectedValue * 100).toFixed(2)}%\n`;
      report += `   Kelly Stake: ${(validation.kellyStake * 100).toFixed(2)}% de bankroll\n\n`;
    });

    report += '⚠️ RAPPELS IMPORTANTS:\n';
    report += '  • Ne jamais parier plus de 2% de votre bankroll\n';
    report += '  • Même à 80% de confiance, 1 pari sur 5 sera perdu\n';
    report += '  • La gestion de bankroll est CRUCIALE\n';
    report += '  • Suivez toujours le Kelly Criterion\n';
  }

  report += '\n═══════════════════════════════════════════════\n';

  return report;
}

/**
 * Calcule le score de qualité globale
 */
export function calculateOverallQualityScore(
  homeTeam: TeamStats,
  awayTeam: TeamStats
): number {
  let score = 0;
  let maxScore = 0;

  const fields: (keyof TeamStats)[] = [
    'goalsPerMatch',
    'goalsConcededPerMatch',
    'possession',
    'shotsOnTargetPerMatch',
    'cornersPerMatch',
    'yellowCardsPerMatch',
    'sofascoreRating',
  ];

  fields.forEach(field => {
    maxScore += 2; // 1 pour home, 1 pour away
    if (homeTeam[field] && homeTeam[field] !== 0) score += 1;
    if (awayTeam[field] && awayTeam[field] !== 0) score += 1;
  });

  return Math.round((score / maxScore) * 100);
}
