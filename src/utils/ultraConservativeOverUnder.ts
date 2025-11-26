/**
 * SYSTÈME ULTRA-CONSERVATEUR POUR OVER/UNDER LIVE
 *
 * OBJECTIF: 95%+ de réussite sur TOUTES les prédictions Over/Under
 *
 * PRINCIPES:
 * 1. Marge de sécurité MASSIVE (minimum 2.0, idéal 3.0+)
 * 2. Validation contexte (score actuel + minute)
 * 3. Rejet automatique des cas ambigus
 * 4. Confiance basée sur probabilité mathématique réelle
 */

export interface UltraConservativeOverUnder {
  threshold: number;
  prediction: 'OVER' | 'UNDER' | 'REJECTED';
  projected: number;
  confidence: number;
  distance: number;
  safetyMargin: number;
  reasoning: string;
  riskFactors: string[];
  isApproved: boolean;
}

/**
 * Génère prédiction Over/Under ULTRA-CONSERVATRICE
 *
 * @param projected - Valeur projetée (ex: 2.8 buts)
 * @param threshold - Seuil (ex: 2.5 buts)
 * @param currentValue - Valeur actuelle (ex: 2 buts déjà marqués)
 * @param minute - Minute actuelle (1-90)
 * @param marketName - Nom du marché (pour logging)
 * @param baseConfidence - Confiance de base (ignorée si marge insuffisante)
 */
export function generateUltraConservativeOverUnder(
  projected: number,
  threshold: number,
  currentValue: number,
  minute: number,
  marketName: string,
  baseConfidence: number = 70
): UltraConservativeOverUnder {

  const minutesRemaining = 90 - minute;
  const distance = Math.abs(projected - threshold);
  const riskFactors: string[] = [];

  // ============================================================================
  // VALIDATION #1: Distance minimum MASSIVE (sécurité)
  // ============================================================================

  // Marge requise selon minute (plus tôt = plus grande marge)
  let requiredMargin: number;
  if (minute < 20) {
    requiredMargin = 4.0; // Début match: TRÈS incertain
  } else if (minute < 40) {
    requiredMargin = 3.0; // 1ère MT: Encore incertain
  } else if (minute < 60) {
    requiredMargin = 2.5; // Mi-match: Modérément certain
  } else if (minute < 75) {
    requiredMargin = 2.0; // Fin approche: Plus certain
  } else {
    requiredMargin = 1.5; // Dernières minutes: Assez certain
  }

  if (distance < requiredMargin) {
    riskFactors.push(`Distance ${distance.toFixed(1)} < Marge requise ${requiredMargin.toFixed(1)} (minute ${minute})`);
    return createRejectedPrediction(projected, threshold, currentValue, minute, marketName, riskFactors, distance);
  }

  // ============================================================================
  // VALIDATION #2: Contexte OVER/UNDER avec score actuel
  // ============================================================================

  const prediction: 'OVER' | 'UNDER' = projected > threshold ? 'OVER' : 'UNDER';

  if (prediction === 'UNDER') {
    // UNDER: Vérifier que currentValue n'est PAS déjà AU-DESSUS du seuil
    if (currentValue >= threshold) {
      riskFactors.push(`UNDER ${threshold} impossible: Déjà ${currentValue} (>= seuil)`);
      return createRejectedPrediction(projected, threshold, currentValue, minute, marketName, riskFactors, distance);
    }

    // UNDER: Vérifier marge de sécurité avec currentValue
    const marginToThreshold = threshold - currentValue;
    const projectedIncrease = projected - currentValue;

    // Si projeté proche du seuil ET temps restant important → RISQUÉ
    if (marginToThreshold < 1.5 && minute < 60) {
      riskFactors.push(`UNDER ${threshold} risqué: Marge ${marginToThreshold.toFixed(1)} faible avec ${minutesRemaining}min restantes`);
      return createRejectedPrediction(projected, threshold, currentValue, minute, marketName, riskFactors, distance);
    }

    // Si taux d'augmentation élevé → RISQUÉ
    const ratePerMinute = projectedIncrease / minutesRemaining;
    if (ratePerMinute > 0.08) { // Plus de 0.08 unités/minute = dangereux pour UNDER
      riskFactors.push(`UNDER ${threshold} risqué: Taux ${(ratePerMinute * 90).toFixed(1)}/match trop élevé`);
      return createRejectedPrediction(projected, threshold, currentValue, minute, marketName, riskFactors, distance);
    }

  } else {
    // OVER: Vérifier que currentValue n'a PAS DÉJÀ DÉPASSÉ largement
    if (currentValue > threshold + 2) {
      riskFactors.push(`OVER ${threshold} inutile: Déjà ${currentValue} (>> seuil)`);
      return createRejectedPrediction(projected, threshold, currentValue, minute, marketName, riskFactors, distance);
    }

    // OVER: Si projeté faible ET temps court → RISQUÉ
    if (projected < threshold + 1.0 && minutesRemaining < 20) {
      riskFactors.push(`OVER ${threshold} risqué: Projeté ${projected.toFixed(1)} proche seuil avec ${minutesRemaining}min restantes`);
      return createRejectedPrediction(projected, threshold, currentValue, minute, marketName, riskFactors, distance);
    }

    // OVER: Vérifier taux réaliste
    const neededIncrease = threshold - currentValue + 0.5; // +0.5 marge sécurité
    const ratePerMinute = neededIncrease / minutesRemaining;

    // Pour buts: max réaliste = 0.05/min (4.5 buts/match)
    // Pour corners: max réaliste = 0.15/min (13.5 corners/match)
    // Pour fautes: max réaliste = 0.3/min (27 fautes/match)
    let maxRealisticRate: number;
    if (marketName.toLowerCase().includes('but') || marketName.toLowerCase().includes('goal')) {
      maxRealisticRate = 0.05;
    } else if (marketName.toLowerCase().includes('corner')) {
      maxRealisticRate = 0.15;
    } else if (marketName.toLowerCase().includes('fau') || marketName.toLowerCase().includes('foul')) {
      maxRealisticRate = 0.3;
    } else if (marketName.toLowerCase().includes('carton') || marketName.toLowerCase().includes('card')) {
      maxRealisticRate = 0.08;
    } else {
      maxRealisticRate = 0.2; // Défaut conservateur
    }

    if (ratePerMinute > maxRealisticRate * 1.5) { // 1.5x max = très improbable
      riskFactors.push(`OVER ${threshold} irréaliste: Besoin ${(ratePerMinute * 90).toFixed(1)}/match (max réaliste: ${(maxRealisticRate * 90).toFixed(1)})`);
      return createRejectedPrediction(projected, threshold, currentValue, minute, marketName, riskFactors, distance);
    }
  }

  // ============================================================================
  // VALIDATION #3: Cas spéciaux selon minute
  // ============================================================================

  // Minute < 10: REJETER automatiquement (trop tôt)
  if (minute < 10) {
    riskFactors.push(`Minute ${minute} trop tôt pour prédiction fiable`);
    return createRejectedPrediction(projected, threshold, currentValue, minute, marketName, riskFactors, distance);
  }

  // Minute 85+: OVER/UNDER buts seulement si marge ÉNORME
  if (minute >= 85 && marketName.toLowerCase().includes('but')) {
    if (distance < 2.0) {
      riskFactors.push(`Minute ${minute}: Buts trop imprévisibles en fin de match (marge < 2.0)`);
      return createRejectedPrediction(projected, threshold, currentValue, minute, marketName, riskFactors, distance);
    }
  }

  // ============================================================================
  // CALCUL CONFIANCE ULTRA-CONSERVATRICE
  // ============================================================================

  // Base: 50% (toujours conservateur)
  let confidence = 50;

  // Bonus distance (max +30%)
  const distanceBonus = Math.min(30, distance * 7);
  confidence += distanceBonus;

  // Bonus minute avancée (max +15%)
  const minuteBonus = Math.min(15, (minute / 90) * 15);
  confidence += minuteBonus;

  // Bonus alignement score actuel (max +10%)
  let alignmentBonus = 0;
  if (prediction === 'UNDER' && currentValue < threshold - 2) {
    alignmentBonus = 10; // Déjà bien en-dessous
  } else if (prediction === 'OVER' && currentValue > threshold - 1) {
    alignmentBonus = 10; // Déjà proche ou au-dessus
  } else if (prediction === 'UNDER' && currentValue < threshold - 1) {
    alignmentBonus = 5;
  } else if (prediction === 'OVER' && currentValue > threshold - 2) {
    alignmentBonus = 5;
  }
  confidence += alignmentBonus;

  // Plafond 92% (jamais 95%+ = suspect)
  confidence = Math.min(92, confidence);

  // Si confiance < 70% après calcul → REJETER
  if (confidence < 70) {
    riskFactors.push(`Confiance calculée ${confidence.toFixed(0)}% < 70% minimum`);
    return createRejectedPrediction(projected, threshold, currentValue, minute, marketName, riskFactors, distance);
  }

  // ============================================================================
  // VALIDATION #4: Filtre final baseline
  // ============================================================================

  // Vérifier que prédiction bat baseline (50/50)
  // Pour Over/Under, baseline = ~49-51% selon marché
  // Confidence minimum = 72% pour battre significativement baseline
  if (confidence < 72) {
    riskFactors.push(`Confiance ${confidence.toFixed(0)}% insuffisante pour battre baseline 50%`);
    return createRejectedPrediction(projected, threshold, currentValue, minute, marketName, riskFactors, distance);
  }

  // ============================================================================
  // APPROUVÉ!
  // ============================================================================

  const safetyMargin = distance;
  const reasoning = buildReasoningApproved(
    prediction,
    projected,
    threshold,
    currentValue,
    minute,
    minutesRemaining,
    confidence,
    safetyMargin
  );

  return {
    threshold,
    prediction,
    projected: Math.round(projected * 10) / 10,
    confidence: Math.round(confidence),
    distance: Math.round(distance * 10) / 10,
    safetyMargin: Math.round(safetyMargin * 10) / 10,
    reasoning,
    riskFactors: [], // Aucun risque si approuvé
    isApproved: true
  };
}

/**
 * Crée une prédiction REJETÉE
 */
function createRejectedPrediction(
  projected: number,
  threshold: number,
  currentValue: number,
  minute: number,
  marketName: string,
  riskFactors: string[],
  distance: number
): UltraConservativeOverUnder {
  const prediction = projected > threshold ? 'OVER' : 'UNDER';

  return {
    threshold,
    prediction: 'REJECTED',
    projected: Math.round(projected * 10) / 10,
    confidence: 0,
    distance: Math.round(distance * 10) / 10,
    safetyMargin: 0,
    reasoning: `❌ REJETÉ: ${riskFactors.join(' | ')}`,
    riskFactors,
    isApproved: false
  };
}

/**
 * Construction reasoning pour prédiction approuvée
 */
function buildReasoningApproved(
  prediction: 'OVER' | 'UNDER',
  projected: number,
  threshold: number,
  currentValue: number,
  minute: number,
  minutesRemaining: number,
  confidence: number,
  safetyMargin: number
): string {
  const parts: string[] = [];

  // Prédiction principale
  parts.push(`✅ ${prediction} ${threshold}`);

  // Projection
  parts.push(`Projeté: ${projected.toFixed(1)}`);

  // État actuel
  parts.push(`Actuel: ${currentValue}`);

  // Marge de sécurité
  parts.push(`Marge: ${safetyMargin.toFixed(1)}`);

  // Minute
  parts.push(`Min: ${minute}/90 (${minutesRemaining}min rest.)`);

  // Confiance
  parts.push(`Conf: ${confidence.toFixed(0)}%`);

  return parts.join(' | ');
}

/**
 * Génère prédictions Over/Under ultra-conservatrices pour tous les seuils
 */
export function generateAllUltraConservativeOverUnder(
  projected: number,
  thresholds: number[],
  currentValue: number,
  minute: number,
  marketName: string,
  baseConfidence: number = 70
): UltraConservativeOverUnder[] {
  return thresholds
    .map(threshold =>
      generateUltraConservativeOverUnder(
        projected,
        threshold,
        currentValue,
        minute,
        marketName,
        baseConfidence
      )
    )
    .filter(pred => pred.isApproved); // Retourner SEULEMENT les approuvées
}
