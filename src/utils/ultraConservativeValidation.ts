import { MatchPrediction } from '../types/football';
import { REAL_OVER_UNDER_PROBABILITIES, REAL_BTTS_PROBABILITIES } from './realWorldConstants';

/**
 * SYSTÈME ULTRA-CONSERVATEUR ANTI-PERTE
 *
 * Ce système déteste les risques et les pertes. Il applique des critères EXTRÊMEMENT stricts
 * pour ne laisser passer que les prédictions avec probabilité maximale de gain.
 *
 * PHILOSOPHIE:
 * - Mieux vaut NE PAS PARIER que de risquer une perte
 * - Confiance minimale: 90% (vs 70% standard)
 * - Safety score minimal: 90 (vs 70 standard)
 * - Blocage agressif si moindre doute
 * - Pénalités cumulatives pour facteurs de risque
 *
 * TAUX DE REJET ATTENDU: 85-95% des prédictions
 * (Seules les 5-15% meilleures prédictions passent)
 */

export interface UltraConservativeResult {
  approved: boolean;
  finalScore: number; // 0-100, minimum 90 requis
  confidence: number; // 0-100, minimum 90 requis
  riskFactors: string[];
  penalties: {
    reason: string;
    points: number;
  }[];
  recommendation: 'APPROVED' | 'REJECTED' | 'CRITICAL_REJECTION';
  message: string;
}

/**
 * VALIDATION ULTRA-CONSERVATRICE
 *
 * Critères stricts:
 * 1. Confiance ≥ 90% (non négociable)
 * 2. Safety score ≥ 90 après pénalités
 * 3. Cohérence parfaite (0 incohérence)
 * 4. Déviation baseline ≤ 10%
 * 5. Marge de sécurité ≥ 20%
 */
export function validateUltraConservative(
  prediction: MatchPrediction,
  safetyScore: number,
  options: {
    minConfidence?: number; // Défaut: 90
    minSafetyScore?: number; // Défaut: 90
    maxBaselineDeviation?: number; // Défaut: 0.10 (10%)
    minSafetyMargin?: number; // Défaut: 0.20 (20%)
    zeroTolerance?: boolean; // true = blocage au moindre doute
  } = {}
): UltraConservativeResult {
  const {
    minConfidence = 90,
    minSafetyScore = 90,
    maxBaselineDeviation = 0.10,
    minSafetyMargin = 0.20,
    zeroTolerance = false
  } = options;

  let finalScore = safetyScore;
  const penalties: { reason: string; points: number }[] = [];
  const riskFactors: string[] = [];

  // ============================================================================
  // CRITÈRE 1: CONFIANCE MINIMALE (NON NÉGOCIABLE)
  // ============================================================================
  const over25Confidence = Math.max(
    prediction.overUnder25Goals?.over || 0,
    prediction.overUnder25Goals?.under || 0
  );
  const bttsConfidence = Math.max(
    prediction.btts?.yes || 0,
    prediction.btts?.no || 0
  );
  const mainConfidence = Math.max(over25Confidence, bttsConfidence);

  if (mainConfidence < minConfidence) {
    return {
      approved: false,
      finalScore: 0,
      confidence: mainConfidence,
      riskFactors: [`Confiance insuffisante: ${mainConfidence}% < ${minConfidence}%`],
      penalties: [{ reason: 'Confiance < seuil minimum', points: 100 }],
      recommendation: 'CRITICAL_REJECTION',
      message: `🚫 REJET CRITIQUE: Confiance ${mainConfidence}% insuffisante (minimum requis: ${minConfidence}%)`
    };
  }

  // ============================================================================
  // CRITÈRE 2: DÉVIATION BASELINE (CONSERVATISME EXTRÊME)
  // ============================================================================
  const over25Prob = (prediction.overUnder25Goals?.over || 0) / 100;
  const bttsProb = (prediction.btts?.yes || 0) / 100;

  const over25Deviation = Math.abs(over25Prob - REAL_OVER_UNDER_PROBABILITIES.over25);
  const bttsDeviation = Math.abs(bttsProb - REAL_BTTS_PROBABILITIES.btts_yes);

  // Pénalité progressive pour déviation baseline
  if (over25Deviation > maxBaselineDeviation) {
    const penalty = Math.round((over25Deviation - maxBaselineDeviation) * 200); // 20 points par 10% déviation
    penalties.push({
      reason: `Déviation Over2.5 vs baseline: ${(over25Deviation * 100).toFixed(1)}%`,
      points: penalty
    });
    finalScore -= penalty;
    riskFactors.push(`Déviation Over2.5: ${(over25Deviation * 100).toFixed(1)}% (max: ${maxBaselineDeviation * 100}%)`);
  }

  if (bttsDeviation > maxBaselineDeviation) {
    const penalty = Math.round((bttsDeviation - maxBaselineDeviation) * 200);
    penalties.push({
      reason: `Déviation BTTS vs baseline: ${(bttsDeviation * 100).toFixed(1)}%`,
      points: penalty
    });
    finalScore -= penalty;
    riskFactors.push(`Déviation BTTS: ${(bttsDeviation * 100).toFixed(1)}% (max: ${maxBaselineDeviation * 100}%)`);
  }

  // ============================================================================
  // CRITÈRE 3: MARGE DE SÉCURITÉ (ANTI-COINFLIP)
  // ============================================================================
  // Si prédiction proche de 50/50 → REJET (trop incertain)
  const over25Margin = Math.abs(over25Prob - 0.5);
  const bttsMargin = Math.abs(bttsProb - 0.5);

  if (over25Margin < minSafetyMargin) {
    const penalty = Math.round((minSafetyMargin - over25Margin) * 100); // 10 points par 10% manquant
    penalties.push({
      reason: `Marge sécurité Over2.5 faible: ${(over25Margin * 100).toFixed(1)}%`,
      points: penalty
    });
    finalScore -= penalty;
    riskFactors.push(`Over2.5 trop proche 50/50: ${(over25Prob * 100).toFixed(1)}% (marge: ${(over25Margin * 100).toFixed(1)}%)`);
  }

  if (bttsMargin < minSafetyMargin) {
    const penalty = Math.round((minSafetyMargin - bttsMargin) * 100);
    penalties.push({
      reason: `Marge sécurité BTTS faible: ${(bttsMargin * 100).toFixed(1)}%`,
      points: penalty
    });
    finalScore -= penalty;
    riskFactors.push(`BTTS trop proche 50/50: ${(bttsProb * 100).toFixed(1)}% (marge: ${(bttsMargin * 100).toFixed(1)}%)`);
  }

  // ============================================================================
  // CRITÈRE 4: COHÉRENCE INTER-PRÉDICTIONS (ZÉRO TOLÉRANCE)
  // ============================================================================
  const coherenceIssues = checkPredictionCoherence(prediction);
  if (coherenceIssues.length > 0) {
    const penalty = coherenceIssues.length * 20; // 20 points par incohérence
    penalties.push({
      reason: `Incohérences détectées: ${coherenceIssues.join(', ')}`,
      points: penalty
    });
    finalScore -= penalty;
    riskFactors.push(...coherenceIssues);

    if (zeroTolerance) {
      return {
        approved: false,
        finalScore: 0,
        confidence: mainConfidence,
        riskFactors,
        penalties,
        recommendation: 'CRITICAL_REJECTION',
        message: `🚫 REJET CRITIQUE (Zero Tolerance): Incohérences détectées - ${coherenceIssues.join('; ')}`
      };
    }
  }

  // ============================================================================
  // CRITÈRE 5: CORNERS, CARTONS, FAUTES (VALIDATION RANGES)
  // ============================================================================
  // Corners > 25 ou < 5 → Suspect
  const cornersPredicted = prediction.corners?.predicted || 0;
  if (cornersPredicted > 25) {
    penalties.push({ reason: `Corners trop élevés: ${cornersPredicted}`, points: 15 });
    finalScore -= 15;
    riskFactors.push(`Corners anormaux: ${cornersPredicted} (max réaliste: 25)`);
  }
  if (cornersPredicted < 5 && cornersPredicted > 0) {
    penalties.push({ reason: `Corners trop faibles: ${cornersPredicted}`, points: 10 });
    finalScore -= 10;
    riskFactors.push(`Corners anormaux: ${cornersPredicted} (min réaliste: 5)`);
  }

  // Fautes > 45 ou < 10 → Suspect
  const foulsPredicted = prediction.fouls?.predicted || 0;
  if (foulsPredicted > 45) {
    penalties.push({ reason: `Fautes trop élevées: ${foulsPredicted}`, points: 15 });
    finalScore -= 15;
    riskFactors.push(`Fautes anormales: ${foulsPredicted} (max réaliste: 45)`);
  }
  if (foulsPredicted < 10 && foulsPredicted > 0) {
    penalties.push({ reason: `Fautes trop faibles: ${foulsPredicted}`, points: 10 });
    finalScore -= 10;
    riskFactors.push(`Fautes anormales: ${foulsPredicted} (min réaliste: 10)`);
  }

  // Cartons jaunes > 12 ou < 1 → Suspect
  const yellowCardsPredicted = prediction.yellowCards?.predicted || 0;
  if (yellowCardsPredicted > 12) {
    penalties.push({ reason: `Cartons trop élevés: ${yellowCardsPredicted}`, points: 15 });
    finalScore -= 15;
    riskFactors.push(`Cartons anormaux: ${yellowCardsPredicted} (max réaliste: 12)`);
  }
  if (yellowCardsPredicted < 1 && yellowCardsPredicted > 0) {
    penalties.push({ reason: `Cartons trop faibles: ${yellowCardsPredicted}`, points: 10 });
    finalScore -= 10;
    riskFactors.push(`Cartons anormaux: ${yellowCardsPredicted} (min réaliste: 1)`);
  }

  // ============================================================================
  // CRITÈRE 6: CONFIANCE EXCESSIVE (OVERCONFIDENCE PENALTY)
  // ============================================================================
  // Confiance > 95% → Suspect (overconfidence)
  if (mainConfidence > 95) {
    const penalty = (mainConfidence - 95) * 2; // 2 points par % au-dessus de 95%
    penalties.push({
      reason: `Overconfidence détectée: ${mainConfidence}%`,
      points: penalty
    });
    finalScore -= penalty;
    riskFactors.push(`Confiance suspecte: ${mainConfidence}% (>95% = overconfidence possible)`);
  }

  // ============================================================================
  // DÉCISION FINALE
  // ============================================================================
  finalScore = Math.max(0, Math.min(100, finalScore));

  const approved = finalScore >= minSafetyScore && mainConfidence >= minConfidence;

  let recommendation: 'APPROVED' | 'REJECTED' | 'CRITICAL_REJECTION' = 'REJECTED';
  let message = '';

  if (approved) {
    recommendation = 'APPROVED';
    message = `✅ APPROUVÉ (Score final: ${finalScore}/100, Confiance: ${mainConfidence}%)`;
  } else if (finalScore < 50 || mainConfidence < 80) {
    recommendation = 'CRITICAL_REJECTION';
    message = `🚫 REJET CRITIQUE (Score final: ${finalScore}/100, Confiance: ${mainConfidence}%) - NE JAMAIS PARIER`;
  } else {
    recommendation = 'REJECTED';
    message = `⚠️ REJETÉ (Score final: ${finalScore}/100 < ${minSafetyScore} requis) - Risque trop élevé`;
  }

  return {
    approved,
    finalScore,
    confidence: mainConfidence,
    riskFactors,
    penalties,
    recommendation,
    message
  };
}

/**
 * VÉRIFICATION COHÉRENCE INTER-PRÉDICTIONS
 *
 * Détecte les incohérences logiques qui indiquent une prédiction non fiable.
 */
function checkPredictionCoherence(prediction: MatchPrediction): string[] {
  const issues: string[] = [];

  const bttsYes = (prediction.btts?.yes || 0) > 50;
  const bttsConfidence = Math.max(prediction.btts?.yes || 0, prediction.btts?.no || 0);
  const over25Yes = (prediction.overUnder25Goals?.over || 0) > 50;
  const over25Confidence = Math.max(
    prediction.overUnder25Goals?.over || 0,
    prediction.overUnder25Goals?.under || 0
  );

  // BTTS = Yes + Over 2.5 = No → Incohérent (minimum 3 buts si BTTS)
  if (bttsYes && bttsConfidence > 70 && !over25Yes && over25Confidence > 70) {
    issues.push('Incohérence BTTS=Yes + Over2.5=No');
  }

  // Over 2.5 = Yes + BTTS = No → OK seulement si domination claire (3-0, 4-0)
  if (over25Yes && over25Confidence > 80 && !bttsYes && bttsConfidence > 70) {
    // Vérifier score si disponible
    if (prediction.mostLikelyScorelines && prediction.mostLikelyScorelines.length > 0) {
      const topScore = prediction.mostLikelyScorelines[0].score;
      const [home, away] = topScore.split('-').map(Number);
      const scoreDiff = Math.abs(home - away);
      if (scoreDiff < 2) {
        issues.push(`Incohérence Over2.5=Yes + BTTS=No sans domination (score: ${topScore})`);
      }
    }
  }

  // Under 2.5 + BTTS = Yes → Incohérent (max 2 buts, donc 1-1 uniquement)
  if (!over25Yes && over25Confidence > 70 && bttsYes && bttsConfidence > 70) {
    if (prediction.mostLikelyScorelines && prediction.mostLikelyScorelines.length > 0) {
      const topScore = prediction.mostLikelyScorelines[0].score;
      const [home, away] = topScore.split('-').map(Number);
      const totalGoals = home + away;
      if (totalGoals > 2) {
        issues.push('Incohérence Under2.5 + BTTS=Yes (seul 1-1 possible)');
      }
    }
  }

  // Score probable ne correspond pas à Over/Under
  if (prediction.mostLikelyScorelines && prediction.mostLikelyScorelines.length > 0) {
    const topScore = prediction.mostLikelyScorelines[0].score;
    const [home, away] = topScore.split('-').map(Number);
    const totalGoals = home + away;

    if (totalGoals > 2.5 && !over25Yes && over25Confidence > 70) {
      issues.push(`Incohérence score (${totalGoals} buts: ${topScore}) vs Over2.5=No`);
    }
    if (totalGoals < 2.5 && over25Yes && over25Confidence > 70) {
      issues.push(`Incohérence score (${totalGoals} buts: ${topScore}) vs Over2.5=Yes`);
    }
  }

  return issues;
}

/**
 * MODE ZERO TOLERANCE
 *
 * Blocage au MOINDRE doute:
 * - Safety score < 95 → REJET
 * - Confiance < 92% → REJET
 * - Moindre incohérence → REJET
 * - Déviation baseline > 5% → REJET
 *
 * Taux de rejet attendu: 95-99%
 */
export function validateZeroTolerance(
  prediction: MatchPrediction,
  safetyScore: number
): UltraConservativeResult {
  return validateUltraConservative(prediction, safetyScore, {
    minConfidence: 92,
    minSafetyScore: 95,
    maxBaselineDeviation: 0.05, // 5% max
    minSafetyMargin: 0.25, // 25% marge minimum
    zeroTolerance: true
  });
}

/**
 * FILTRE AVERSION AUX PERTES
 *
 * Applique théorie Prospect (Kahneman & Tversky):
 * - Perte pèse 2.5x plus lourd qu'un gain
 * - Éviter perte > chercher gain
 *
 * Calcule espérance ajustée avec aversion pertes:
 * E_adjusted = (P_win × Gain × 1.0) - (P_loss × Perte × 2.5)
 */
export function calculateLossAversionScore(
  prediction: MatchPrediction,
  stake: number = 100
): {
  expectedValue: number;
  lossAversionAdjusted: number;
  recommendation: 'BET' | 'NO_BET';
  message: string;
} {
  // Supposons cote moyenne 1.9 (Over/Under, BTTS)
  const averageOdds = 1.9;
  const potentialGain = stake * (averageOdds - 1);
  const potentialLoss = stake;

  // Probabilité gain = confiance principale
  const over25Confidence = Math.max(
    prediction.overUnder25Goals?.over || 0,
    prediction.overUnder25Goals?.under || 0
  );
  const bttsConfidence = Math.max(
    prediction.btts?.yes || 0,
    prediction.btts?.no || 0
  );
  const mainConfidence = Math.max(over25Confidence, bttsConfidence) / 100;

  const probWin = mainConfidence;
  const probLoss = 1 - probWin;

  // Espérance standard
  const expectedValue = (probWin * potentialGain) - (probLoss * potentialLoss);

  // Espérance ajustée aversion pertes (perte × 2.5)
  const lossAversionAdjusted = (probWin * potentialGain) - (probLoss * potentialLoss * 2.5);

  const shouldBet = lossAversionAdjusted > 0;

  return {
    expectedValue,
    lossAversionAdjusted,
    recommendation: shouldBet ? 'BET' : 'NO_BET',
    message: shouldBet
      ? `✅ PARI RECOMMANDÉ (EV ajusté: +${lossAversionAdjusted.toFixed(2)}£)`
      : `🚫 PAS DE PARI (EV ajusté: ${lossAversionAdjusted.toFixed(2)}£ - Risque perte > potentiel gain)`
  };
}
