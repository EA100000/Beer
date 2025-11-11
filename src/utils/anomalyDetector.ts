/**
 * DÉTECTION D'ANOMALIES DANS LES MATCHS LIVE
 * Identifie situations inhabituelles qui peuvent fausser les prédictions
 *
 * IMPORTANT pour ajuster confiance et alerter utilisateur
 */

export interface LiveMatchData {
  homeScore: number;
  awayScore: number;
  minute: number;
  homePossession: number;
  awayPossession: number;
  homeOffsides: number;
  awayOffsides: number;
  homeCorners: number;
  awayCorners: number;
  homeFouls: number;
  awayFouls: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeTotalShots: number;
  awayTotalShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
}

export interface Anomaly {
  type: 'RED_CARD_SUSPECTED' | 'VERY_DEFENSIVE' | 'VERY_OFFENSIVE' | 'UNUSUAL_STATS' | 'EXTREME_DOMINANCE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  confidenceAdjustment: number; // En pourcentage (-20, -15, -10, -5)
  affectedMarkets: string[];    // ['goals', 'corners', 'btts', etc.]
}

export interface AnomalyDetectionResult {
  anomalies: Anomaly[];
  overallSeverity: 'OK' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendedAction: 'PROCEED' | 'CAUTION' | 'REDUCE_STAKES' | 'AVOID_BETTING';
  confidenceAdjustment: number; // Ajustement total à appliquer
}

/**
 * Détecte toutes les anomalies dans un match live
 */
export function detectAnomalies(data: LiveMatchData): AnomalyDetectionResult {
  const anomalies: Anomaly[] = [];

  // Ne détecte anomalies que si match a commencé
  if (data.minute < 5) {
    return {
      anomalies: [],
      overallSeverity: 'OK',
      recommendedAction: 'PROCEED',
      confidenceAdjustment: 0
    };
  }

  // ========================================================================
  // ANOMALIE 1: CARTON ROUGE SUSPECTÉ
  // ========================================================================
  const redCardAnomaly = detectRedCard(data);
  if (redCardAnomaly) anomalies.push(redCardAnomaly);

  // ========================================================================
  // ANOMALIE 2: MATCH TRÈS DÉFENSIF
  // ========================================================================
  const defensiveAnomaly = detectVeryDefensiveMatch(data);
  if (defensiveAnomaly) anomalies.push(defensiveAnomaly);

  // ========================================================================
  // ANOMALIE 3: MATCH TRÈS OFFENSIF
  // ========================================================================
  const offensiveAnomaly = detectVeryOffensiveMatch(data);
  if (offensiveAnomaly) anomalies.push(offensiveAnomaly);

  // ========================================================================
  // ANOMALIE 4: DOMINATION EXTRÊME
  // ========================================================================
  const dominanceAnomaly = detectExtremeDominance(data);
  if (dominanceAnomaly) anomalies.push(dominanceAnomaly);

  // ========================================================================
  // ANOMALIE 5: STATISTIQUES INHABITUELLES
  // ========================================================================
  const unusualStatsAnomaly = detectUnusualStats(data);
  if (unusualStatsAnomaly) anomalies.push(unusualStatsAnomaly);

  // ========================================================================
  // CALCUL DE LA SÉVÉRITÉ GLOBALE
  // ========================================================================
  const overallSeverity = calculateOverallSeverity(anomalies);
  const recommendedAction = getRecommendedAction(overallSeverity);
  const confidenceAdjustment = calculateTotalConfidenceAdjustment(anomalies);

  return {
    anomalies,
    overallSeverity,
    recommendedAction,
    confidenceAdjustment
  };
}

/**
 * DÉTECTION 1: Carton rouge suspecté
 *
 * Heuristiques:
 * - Écart de possession > 35% (équipe réduite ne peut garder le ballon)
 * - Écart de fautes faible < 5 (équipe réduite fait moins de fautes)
 * - OU: Cartons jaunes > 8 (probable double carton)
 */
function detectRedCard(data: LiveMatchData): Anomaly | null {
  const possessionGap = Math.abs(data.homePossession - data.awayPossession);
  const foulsGap = Math.abs(data.homeFouls - data.awayFouls);
  const totalYellowCards = data.homeYellowCards + data.awayYellowCards;

  // Heuristique 1: Grande possession + peu d'écart de fautes
  if (data.minute > 30 && possessionGap > 35 && foulsGap < 5) {
    return {
      type: 'RED_CARD_SUSPECTED',
      severity: 'HIGH',
      description: `⚠️ CARTON ROUGE POSSIBLE: Possession ${data.homePossession}%-${data.awayPossession}% (écart ${possessionGap}%), fautes équilibrées`,
      confidenceAdjustment: -20,
      affectedMarkets: ['goals', 'btts', 'corners', 'fouls', 'yellowCards']
    };
  }

  // Heuristique 2: Trop de cartons jaunes
  if (data.minute > 45 && totalYellowCards > 8) {
    return {
      type: 'RED_CARD_SUSPECTED',
      severity: 'MEDIUM',
      description: `⚠️ CARTON ROUGE POSSIBLE: ${totalYellowCards} cartons jaunes (double carton probable)`,
      confidenceAdjustment: -15,
      affectedMarkets: ['goals', 'btts', 'corners', 'fouls']
    };
  }

  return null;
}

/**
 * DÉTECTION 2: Match très défensif
 *
 * Critères:
 * - Très peu de tirs (<5 tirs cadrés en 60+ minutes)
 * - Très peu de corners (<4 en 60+ minutes)
 * - Score bas (0-0 ou 1-0 après 60+ minutes)
 */
function detectVeryDefensiveMatch(data: LiveMatchData): Anomaly | null {
  if (data.minute < 60) return null;

  const totalShotsOnTarget = data.homeShotsOnTarget + data.awayShotsOnTarget;
  const totalCorners = data.homeCorners + data.awayCorners;
  const totalGoals = data.homeScore + data.awayScore;

  // Très peu de tirs cadrés
  if (totalShotsOnTarget < 5) {
    return {
      type: 'VERY_DEFENSIVE',
      severity: 'MEDIUM',
      description: `⚠️ MATCH TRÈS DÉFENSIF: Seulement ${totalShotsOnTarget} tirs cadrés en ${data.minute} minutes`,
      confidenceAdjustment: -10,
      affectedMarkets: ['goals', 'corners', 'btts']
    };
  }

  // Très peu de corners
  if (totalCorners < 4 && data.minute > 70) {
    return {
      type: 'VERY_DEFENSIVE',
      severity: 'MEDIUM',
      description: `⚠️ MATCH TRÈS DÉFENSIF: Seulement ${totalCorners} corners en ${data.minute} minutes`,
      confidenceAdjustment: -8,
      affectedMarkets: ['corners', 'goals']
    };
  }

  // Score très bas après 75 minutes
  if (data.minute > 75 && totalGoals === 0) {
    return {
      type: 'VERY_DEFENSIVE',
      severity: 'LOW',
      description: `⚠️ MATCH DÉFENSIF: 0-0 après ${data.minute} minutes (peu de buts attendus)`,
      confidenceAdjustment: -5,
      affectedMarkets: ['goals', 'btts']
    };
  }

  return null;
}

/**
 * DÉTECTION 3: Match très offensif
 *
 * Critères:
 * - Beaucoup de buts (5+ en 60 minutes, 7+ en 90 minutes)
 * - Beaucoup de tirs cadrés (15+ en 60 minutes)
 */
function detectVeryOffensiveMatch(data: LiveMatchData): Anomaly | null {
  const totalGoals = data.homeScore + data.awayScore;
  const totalShotsOnTarget = data.homeShotsOnTarget + data.awayShotsOnTarget;

  // Beaucoup de buts pour le temps écoulé
  if (data.minute > 45) {
    const goalRate = totalGoals / data.minute;
    if (goalRate > 0.1) { // Plus d'1 but toutes les 10 minutes
      return {
        type: 'VERY_OFFENSIVE',
        severity: 'MEDIUM',
        description: `⚠️ MATCH TRÈS OFFENSIF: ${totalGoals} buts en ${data.minute} minutes (taux: ${(goalRate * 90).toFixed(1)}/90min)`,
        confidenceAdjustment: -10,
        affectedMarkets: ['goals', 'btts']
      };
    }
  }

  // Beaucoup de tirs cadrés
  if (data.minute > 60 && totalShotsOnTarget > 15) {
    return {
      type: 'VERY_OFFENSIVE',
      severity: 'LOW',
      description: `⚠️ MATCH OFFENSIF: ${totalShotsOnTarget} tirs cadrés en ${data.minute} minutes`,
      confidenceAdjustment: -5,
      affectedMarkets: ['goals']
    };
  }

  // 6+ buts (situation exceptionnelle)
  if (totalGoals >= 6) {
    return {
      type: 'VERY_OFFENSIVE',
      severity: 'HIGH',
      description: `⚠️ MATCH EXCEPTIONNEL: ${totalGoals} buts (situation très rare, variance élevée)`,
      confidenceAdjustment: -15,
      affectedMarkets: ['goals', 'btts', 'corners']
    };
  }

  return null;
}

/**
 * DÉTECTION 4: Domination extrême
 *
 * Critères:
 * - Possession > 70% vs < 30%
 * - Écart de tirs > 15
 * - Écart de corners > 8
 */
function detectExtremeDominance(data: LiveMatchData): Anomaly | null {
  if (data.minute < 30) return null;

  const possessionGap = Math.abs(data.homePossession - data.awayPossession);
  const shotsGap = Math.abs(data.homeTotalShots - data.awayTotalShots);
  const cornersGap = Math.abs(data.homeCorners - data.awayCorners);

  // Possession extrême
  if (possessionGap > 40) {
    const dominant = data.homePossession > data.awayPossession ? 'Domicile' : 'Extérieur';
    return {
      type: 'EXTREME_DOMINANCE',
      severity: 'MEDIUM',
      description: `⚠️ DOMINATION EXTRÊME: ${dominant} domine (${Math.max(data.homePossession, data.awayPossession)}% possession)`,
      confidenceAdjustment: -8,
      affectedMarkets: ['btts', 'corners']
    };
  }

  // Écart de tirs important
  if (data.minute > 45 && shotsGap > 15) {
    return {
      type: 'EXTREME_DOMINANCE',
      severity: 'MEDIUM',
      description: `⚠️ DOMINATION EXTRÊME: Écart de ${shotsGap} tirs`,
      confidenceAdjustment: -8,
      affectedMarkets: ['btts', 'goals']
    };
  }

  // Écart de corners important
  if (data.minute > 60 && cornersGap > 8) {
    return {
      type: 'EXTREME_DOMINANCE',
      severity: 'LOW',
      description: `⚠️ DOMINATION EXTRÊME: Écart de ${cornersGap} corners`,
      confidenceAdjustment: -5,
      affectedMarkets: ['corners', 'btts']
    };
  }

  return null;
}

/**
 * DÉTECTION 5: Statistiques inhabituelles
 *
 * Critères:
 * - Beaucoup de tirs mais aucun but (gardien exceptionnel)
 * - Peu de tirs mais beaucoup de buts (efficacité exceptionnelle)
 * - Beaucoup de fautes mais peu de cartons (arbitre clément)
 */
function detectUnusualStats(data: LiveMatchData): Anomaly | null {
  if (data.minute < 45) return null;

  const totalShotsOnTarget = data.homeShotsOnTarget + data.awayShotsOnTarget;
  const totalGoals = data.homeScore + data.awayScore;
  const totalFouls = data.homeFouls + data.awayFouls;
  const totalYellowCards = data.homeYellowCards + data.awayYellowCards;

  // Beaucoup de tirs cadrés mais aucun but (gardien exceptionnel)
  if (totalShotsOnTarget > 15 && totalGoals === 0 && data.minute > 60) {
    return {
      type: 'UNUSUAL_STATS',
      severity: 'MEDIUM',
      description: `⚠️ STATISTIQUE INHABITUELLE: ${totalShotsOnTarget} tirs cadrés mais 0 but (gardien exceptionnel?)`,
      confidenceAdjustment: -10,
      affectedMarkets: ['goals', 'btts']
    };
  }

  // Peu de tirs mais beaucoup de buts (efficacité exceptionnelle)
  if (totalShotsOnTarget < 6 && totalGoals >= 4 && data.minute > 60) {
    return {
      type: 'UNUSUAL_STATS',
      severity: 'LOW',
      description: `⚠️ STATISTIQUE INHABITUELLE: ${totalGoals} buts avec seulement ${totalShotsOnTarget} tirs cadrés (efficacité exceptionnelle)`,
      confidenceAdjustment: -8,
      affectedMarkets: ['goals']
    };
  }

  // Beaucoup de fautes mais peu de cartons (arbitre clément)
  if (totalFouls > 30 && totalYellowCards < 3 && data.minute > 60) {
    return {
      type: 'UNUSUAL_STATS',
      severity: 'LOW',
      description: `⚠️ STATISTIQUE INHABITUELLE: ${totalFouls} fautes mais seulement ${totalYellowCards} cartons (arbitre clément)`,
      confidenceAdjustment: -5,
      affectedMarkets: ['yellowCards', 'fouls']
    };
  }

  // Beaucoup de cartons par rapport aux fautes (arbitre strict)
  if (totalFouls < 20 && totalYellowCards > 6 && data.minute > 60) {
    return {
      type: 'UNUSUAL_STATS',
      severity: 'LOW',
      description: `⚠️ STATISTIQUE INHABITUELLE: ${totalYellowCards} cartons pour seulement ${totalFouls} fautes (arbitre strict)`,
      confidenceAdjustment: -5,
      affectedMarkets: ['yellowCards']
    };
  }

  return null;
}

/**
 * Calcule la sévérité globale basée sur toutes les anomalies
 */
function calculateOverallSeverity(anomalies: Anomaly[]): 'OK' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (anomalies.length === 0) return 'OK';

  const criticalCount = anomalies.filter(a => a.severity === 'CRITICAL').length;
  const highCount = anomalies.filter(a => a.severity === 'HIGH').length;
  const mediumCount = anomalies.filter(a => a.severity === 'MEDIUM').length;

  if (criticalCount > 0) return 'CRITICAL';
  if (highCount > 0 || anomalies.length >= 3) return 'HIGH';
  if (mediumCount > 0 || anomalies.length >= 2) return 'MEDIUM';
  return 'LOW';
}

/**
 * Recommande une action basée sur la sévérité
 */
function getRecommendedAction(severity: string): 'PROCEED' | 'CAUTION' | 'REDUCE_STAKES' | 'AVOID_BETTING' {
  switch (severity) {
    case 'OK':
      return 'PROCEED';
    case 'LOW':
      return 'CAUTION';
    case 'MEDIUM':
      return 'REDUCE_STAKES';
    case 'HIGH':
    case 'CRITICAL':
      return 'AVOID_BETTING';
    default:
      return 'CAUTION';
  }
}

/**
 * Calcule l'ajustement total de confiance
 * Si plusieurs anomalies, on prend 70% du total (pas complètement cumulatif)
 */
function calculateTotalConfidenceAdjustment(anomalies: Anomaly[]): number {
  if (anomalies.length === 0) return 0;

  const totalAdjustment = anomalies.reduce((sum, a) => sum + a.confidenceAdjustment, 0);

  // Si plusieurs anomalies, on réduit l'impact total (70% du cumul)
  if (anomalies.length > 1) {
    return Math.round(totalAdjustment * 0.7);
  }

  return totalAdjustment;
}

/**
 * Formatte le résultat de détection pour affichage
 */
export function formatAnomalyResult(result: AnomalyDetectionResult): string {
  if (result.overallSeverity === 'OK') {
    return '✅ AUCUNE ANOMALIE DÉTECTÉE - Match normal';
  }

  let output = '';

  // En-tête selon sévérité
  if (result.overallSeverity === 'CRITICAL') {
    output += '🚨 ANOMALIES CRITIQUES DÉTECTÉES\n\n';
  } else if (result.overallSeverity === 'HIGH') {
    output += '⚠️ ANOMALIES IMPORTANTES DÉTECTÉES\n\n';
  } else if (result.overallSeverity === 'MEDIUM') {
    output += '⚠️ ANOMALIES MODÉRÉES DÉTECTÉES\n\n';
  } else {
    output += '⚠️ ANOMALIES MINEURES DÉTECTÉES\n\n';
  }

  // Liste des anomalies
  result.anomalies.forEach(anomaly => {
    output += `${anomaly.description}\n`;
    output += `  → Ajustement confiance: ${anomaly.confidenceAdjustment}%\n`;
    output += `  → Marchés affectés: ${anomaly.affectedMarkets.join(', ')}\n\n`;
  });

  // Recommandation
  output += `AJUSTEMENT TOTAL: ${result.confidenceAdjustment}%\n`;
  output += `RECOMMANDATION: `;
  switch (result.recommendedAction) {
    case 'PROCEED':
      output += '✅ CONTINUER';
      break;
    case 'CAUTION':
      output += '⚠️ PRUDENCE';
      break;
    case 'REDUCE_STAKES':
      output += '⚠️ RÉDUIRE LES MISES (50%)';
      break;
    case 'AVOID_BETTING':
      output += '❌ ÉVITER DE PARIER';
      break;
  }

  return output;
}
