/**
 * ANALYSE LINÉAIRE DES TENDANCES LIVE
 *
 * Ce système analyse l'évolution des stats entre chaque snapshot
 * pour détecter les tendances (accélération/ralentissement) et
 * améliorer la précision des prédictions.
 */

interface LiveDataSnapshot {
  minute: number;
  timestamp: number;
  data: any; // LiveMatchData
}

interface TrendAnalysis {
  // Taux actuel (stats/minute)
  currentRate: number;

  // Tendance: positif = accélération, négatif = ralentissement
  trend: 'accelerating' | 'stable' | 'decelerating';
  trendFactor: number; // -1 à +1

  // Projection fin de match
  projectedTotal: number;
  projectedTotalWithTrend: number; // Avec correction de tendance

  // Confiance dans la projection (0-100)
  confidence: number;

  // Nombre de snapshots utilisés
  snapshotsCount: number;
}

/**
 * Analyse la tendance linéaire d'une statistique
 */
export function analyzeTrend(
  history: LiveDataSnapshot[],
  statExtractor: (data: any) => number,
  currentMinute: number
): TrendAnalysis {
  // Besoin d'au moins 2 snapshots pour analyse
  if (history.length < 2) {
    const currentValue = history.length > 0 ? statExtractor(history[history.length - 1].data) : 0;
    const rate = currentMinute > 0 ? currentValue / currentMinute : 0;
    const projected = rate * 90;

    return {
      currentRate: rate,
      trend: 'stable',
      trendFactor: 0,
      projectedTotal: projected,
      projectedTotalWithTrend: projected,
      confidence: 50, // Faible confiance avec un seul snapshot
      snapshotsCount: history.length
    };
  }

  // Extraire les valeurs et minutes
  const dataPoints = history.map(snapshot => ({
    minute: snapshot.minute,
    value: statExtractor(snapshot.data),
    timestamp: snapshot.timestamp
  }));

  // Calcul de la régression linéaire
  const n = dataPoints.length;
  const sumX = dataPoints.reduce((sum, p) => sum + p.minute, 0);
  const sumY = dataPoints.reduce((sum, p) => sum + p.value, 0);
  const sumXY = dataPoints.reduce((sum, p) => sum + (p.minute * p.value), 0);
  const sumX2 = dataPoints.reduce((sum, p) => sum + (p.minute * p.minute), 0);

  // Pente de la droite (taux par minute)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Ordonnée à l'origine
  const intercept = (sumY - slope * sumX) / n;

  // Projection fin de match avec régression linéaire
  const projectedTotal = intercept + slope * 90;

  // Analyse de la tendance (accélération/ralentissement)
  // Comparer les taux entre première et deuxième moitié de l'historique
  const midpoint = Math.floor(n / 2);
  const firstHalf = dataPoints.slice(0, midpoint);
  const secondHalf = dataPoints.slice(midpoint);

  const rateFirstHalf = firstHalf.length > 0
    ? (firstHalf[firstHalf.length - 1].value - firstHalf[0].value) / Math.max(1, firstHalf[firstHalf.length - 1].minute - firstHalf[0].minute)
    : 0;

  const rateSecondHalf = secondHalf.length > 0
    ? (secondHalf[secondHalf.length - 1].value - secondHalf[0].value) / Math.max(1, secondHalf[secondHalf.length - 1].minute - secondHalf[0].minute)
    : 0;

  // Facteur de tendance (-1 = forte décélération, 0 = stable, +1 = forte accélération)
  const trendFactor = rateFirstHalf !== 0
    ? Math.max(-1, Math.min(1, (rateSecondHalf - rateFirstHalf) / Math.abs(rateFirstHalf)))
    : 0;

  // Classification de la tendance
  let trend: 'accelerating' | 'stable' | 'decelerating';
  if (trendFactor > 0.15) trend = 'accelerating';
  else if (trendFactor < -0.15) trend = 'decelerating';
  else trend = 'stable';

  // Projection avec correction de tendance
  // Si accélération, augmenter la projection; si ralentissement, diminuer
  const trendAdjustment = trendFactor * slope * (90 - currentMinute) * 0.3; // 30% d'ajustement max
  const projectedTotalWithTrend = Math.max(0, projectedTotal + trendAdjustment);

  // Confiance basée sur:
  // 1. Nombre de snapshots (plus = mieux)
  // 2. Cohérence des données (R²)
  // 3. Temps écoulé (plus de match = plus de confiance)

  // Calcul du R² (coefficient de détermination)
  const meanY = sumY / n;
  const ssTotal = dataPoints.reduce((sum, p) => sum + Math.pow(p.value - meanY, 2), 0);
  const ssResidual = dataPoints.reduce((sum, p) => {
    const predicted = intercept + slope * p.minute;
    return sum + Math.pow(p.value - predicted, 2);
  }, 0);

  // ⚠️ CORRECTION CRITIQUE: Empêcher R² négatif et gérer cas limite
  let r2 = 0;
  if (ssTotal > 0) {
    r2 = 1 - (ssResidual / ssTotal);
    // Si R² négatif (modèle pire que la moyenne), forcer à 0
    r2 = Math.max(0, Math.min(1, r2));
  } else if (ssResidual === 0) {
    // Tous les points identiques ET parfaitement prédits = modèle parfait
    r2 = 1;
  }

  // Confiance composite
  const snapshotConfidence = Math.min(100, (n / 5) * 100); // 5 snapshots = 100%
  const r2Confidence = Math.max(0, r2 * 100);
  const timeConfidence = Math.min(100, (currentMinute / 45) * 100); // 45 min = 100%

  const confidence = (snapshotConfidence * 0.3 + r2Confidence * 0.4 + timeConfidence * 0.3);

  return {
    currentRate: slope,
    trend,
    trendFactor,
    projectedTotal,
    projectedTotalWithTrend,
    confidence: Math.round(confidence),
    snapshotsCount: n
  };
}

/**
 * Analyse toutes les tendances importantes d'un match
 */
export function analyzeAllTrends(history: LiveDataSnapshot[], currentMinute: number) {
  return {
    corners: {
      home: analyzeTrend(history, (data) => data.homeCorners || 0, currentMinute),
      away: analyzeTrend(history, (data) => data.awayCorners || 0, currentMinute),
      total: analyzeTrend(history, (data) => (data.homeCorners || 0) + (data.awayCorners || 0), currentMinute)
    },
    fouls: {
      home: analyzeTrend(history, (data) => data.homeFouls || 0, currentMinute),
      away: analyzeTrend(history, (data) => data.awayFouls || 0, currentMinute),
      total: analyzeTrend(history, (data) => (data.homeFouls || 0) + (data.awayFouls || 0), currentMinute)
    },
    yellowCards: {
      home: analyzeTrend(history, (data) => data.homeYellowCards || 0, currentMinute),
      away: analyzeTrend(history, (data) => data.awayYellowCards || 0, currentMinute),
      total: analyzeTrend(history, (data) => (data.homeYellowCards || 0) + (data.awayYellowCards || 0), currentMinute)
    },
    shots: {
      home: analyzeTrend(history, (data) => data.homeTotalShots || 0, currentMinute),
      away: analyzeTrend(history, (data) => data.awayTotalShots || 0, currentMinute),
      total: analyzeTrend(history, (data) => (data.homeTotalShots || 0) + (data.awayTotalShots || 0), currentMinute)
    },
    shotsOnTarget: {
      home: analyzeTrend(history, (data) => data.homeShotsOnTarget || 0, currentMinute),
      away: analyzeTrend(history, (data) => data.awayShotsOnTarget || 0, currentMinute),
      total: analyzeTrend(history, (data) => (data.homeShotsOnTarget || 0) + (data.awayShotsOnTarget || 0), currentMinute)
    },
    possession: {
      home: analyzeTrend(history, (data) => data.homePossession || 0, currentMinute),
      away: analyzeTrend(history, (data) => data.awayPossession || 0, currentMinute)
    }
  };
}

/**
 * Affiche un rapport de tendance lisible
 */
export function getTrendReport(analysis: TrendAnalysis, statName: string): string {
  const trendEmoji = analysis.trend === 'accelerating' ? '📈'
                   : analysis.trend === 'decelerating' ? '📉'
                   : '➡️';

  const trendText = analysis.trend === 'accelerating' ? 'En accélération'
                  : analysis.trend === 'decelerating' ? 'En ralentissement'
                  : 'Stable';

  return `${trendEmoji} ${statName}: ${trendText} (Facteur: ${(analysis.trendFactor * 100).toFixed(0)}%) | ` +
         `Projeté: ${analysis.projectedTotal.toFixed(1)} → ${analysis.projectedTotalWithTrend.toFixed(1)} | ` +
         `Confiance: ${analysis.confidence}% (${analysis.snapshotsCount} snapshots)`;
}
