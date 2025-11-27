/**
 * PRÉDICTIONS PAR PHASE DU MATCH
 *
 * Gère 3 types de prédictions selon la minute:
 * 1. Prochaines 10 minutes (toute période)
 * 2. Score à la mi-temps (si minute < 45)
 * 3. Score final (toujours)
 */

import { EnrichedLiveMetrics } from './advancedLiveAnalysis';

export interface PhasedPrediction {
  phase: '10min' | 'half-time' | 'full-time';
  homeScore: number;
  awayScore: number;
  confidence: number;
  reasoning: string;
  timeframe: string;
}

export interface AllPhasedPredictions {
  next10Minutes: PhasedPrediction | null;
  halfTime: PhasedPrediction | null;
  fullTime: PhasedPrediction;
}

/**
 * Calcule les prédictions pour toutes les phases applicables
 */
export function calculatePhasedPredictions(
  enrichedMetrics: EnrichedLiveMetrics,
  currentScore: { home: number; away: number },
  minute: number
): AllPhasedPredictions {

  // Protection contre valeurs invalides
  const safeMinute = Math.max(1, Math.min(120, minute));
  const safeCurrentHomeScore = Math.max(0, currentScore.home || 0);
  const safeCurrentAwayScore = Math.max(0, currentScore.away || 0);

  // Taux de buts par minute (avec protection NaN)
  const xGoalsRateHome = isFinite(enrichedMetrics.intensity.xGoalsRate.home)
    ? enrichedMetrics.intensity.xGoalsRate.home
    : 0.03; // Fallback: ~3 buts en 90min

  const xGoalsRateAway = isFinite(enrichedMetrics.intensity.xGoalsRate.away)
    ? enrichedMetrics.intensity.xGoalsRate.away
    : 0.03;

  // ========================================================================
  // 1. PRÉDICTION PROCHAINES 10 MINUTES
  // ========================================================================
  const next10Minutes: PhasedPrediction = {
    phase: '10min',
    homeScore: Math.max(0, Math.round(safeCurrentHomeScore + xGoalsRateHome * 10)),
    awayScore: Math.max(0, Math.round(safeCurrentAwayScore + xGoalsRateAway * 10)),
    confidence: Math.min(85, 60 + (safeMinute / 90 * 25)), // 60-85%
    reasoning: `Projection 10 min basée sur intensité actuelle (xG rate: ${xGoalsRateHome.toFixed(3)} - ${xGoalsRateAway.toFixed(3)})`,
    timeframe: `${safeMinute}' → ${Math.min(90, safeMinute + 10)}'`
  };

  // ========================================================================
  // 2. PRÉDICTION MI-TEMPS (uniquement si minute < 45)
  // ========================================================================
  let halfTime: PhasedPrediction | null = null;

  if (safeMinute < 45) {
    const minutesToHalfTime = 45 - safeMinute;
    halfTime = {
      phase: 'half-time',
      homeScore: Math.max(0, Math.round(safeCurrentHomeScore + xGoalsRateHome * minutesToHalfTime)),
      awayScore: Math.max(0, Math.round(safeCurrentAwayScore + xGoalsRateAway * minutesToHalfTime)),
      confidence: Math.min(90, 65 + (safeMinute / 45 * 25)), // 65-90%
      reasoning: `Projection mi-temps (${minutesToHalfTime} min restantes en 1ère MT)`,
      timeframe: `${safeMinute}' → 45'`
    };
  }

  // ========================================================================
  // 3. PRÉDICTION FIN DE MATCH (toujours)
  // ========================================================================
  const minutesToEnd = Math.max(0, 90 - safeMinute);

  const fullTime: PhasedPrediction = {
    phase: 'full-time',
    homeScore: Math.max(0, Math.round(safeCurrentHomeScore + xGoalsRateHome * minutesToEnd)),
    awayScore: Math.max(0, Math.round(safeCurrentAwayScore + xGoalsRateAway * minutesToEnd)),
    confidence: Math.min(95, 70 + (safeMinute / 90 * 25)), // 70-95%
    reasoning: `Projection finale (${minutesToEnd} min restantes)`,
    timeframe: `${safeMinute}' → 90'`
  };

  // Protection finale contre NaN
  [next10Minutes, halfTime, fullTime].forEach(pred => {
    if (pred && (isNaN(pred.homeScore) || isNaN(pred.awayScore) || isNaN(pred.confidence))) {
      console.error('❌ [PhasedPredictions] NaN détecté!', pred);
      pred.homeScore = safeCurrentHomeScore;
      pred.awayScore = safeCurrentAwayScore;
      pred.confidence = 50;
      pred.reasoning = '⚠️ Données insuffisantes - Score actuel maintenu';
    }
  });

  return {
    next10Minutes,
    halfTime,
    fullTime
  };
}

/**
 * Génère un affichage textuel des prédictions par phase
 */
export function formatPhasedPredictionsDisplay(predictions: AllPhasedPredictions): string {
  let display = '';

  // 10 minutes
  if (predictions.next10Minutes) {
    const p = predictions.next10Minutes;
    display += `🔮 PROCHAINES 10 MINUTES (${p.timeframe})\n`;
    display += `   Score prédit: ${p.homeScore} - ${p.awayScore}\n`;
    display += `   Confiance: ${p.confidence}%\n`;
    display += `   ${p.reasoning}\n\n`;
  }

  // Mi-temps
  if (predictions.halfTime) {
    const p = predictions.halfTime;
    display += `⚽ SCORE À LA MI-TEMPS (${p.timeframe})\n`;
    display += `   Score prédit: ${p.homeScore} - ${p.awayScore}\n`;
    display += `   Confiance: ${p.confidence}%\n`;
    display += `   ${p.reasoning}\n\n`;
  }

  // Fin
  const p = predictions.fullTime;
  display += `🏁 SCORE FINAL (${p.timeframe})\n`;
  display += `   Score prédit: ${p.homeScore} - ${p.awayScore}\n`;
  display += `   Confiance: ${p.confidence}%\n`;
  display += `   ${p.reasoning}\n`;

  return display;
}
