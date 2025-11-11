/**
 * Moteur de prédiction amélioré avec:
 * - Système de notation SofaScore
 * - Ajustement selon le contexte du match (enjeu)
 * - Entraînement sur données historiques
 */

import { TeamStats, MatchPrediction, AnalysisResult } from '@/types/football';
import { MatchContext } from '@/types/matchContext';
import { calculateSofaScoreRating, compareTeamRatings, validateSofaScoreRating } from './sofascoreRatingSystem';
import { adjustPredictionsForContext, generateContextImpactReport, getContextualRecommendations } from './matchContextAnalyzer';
import { getTrainingDatasetStatistics, findSimilarHistoricalMatches } from './historicalTrainingData';

/**
 * Résultat d'analyse amélioré avec contexte
 */
export interface EnhancedAnalysisResult extends AnalysisResult {
  // Ratings SofaScore calculés
  sofascoreRatings: {
    home: number;
    away: number;
    difference: number;
    advantage: 'HOME' | 'AWAY' | 'BALANCED';
  };

  // Contexte du match
  matchContext?: MatchContext;

  // Ajustements appliqués
  contextAdjustments?: {
    intensityMultiplier: number;
    disciplineMultiplier: number;
    defensiveMultiplier: number;
    offensiveMultiplier: number;
    varianceMultiplier: number;
  };

  // Recommandations contextuelles
  contextualRecommendations?: string[];

  // Référence aux matches historiques similaires
  similarMatches?: Array<{
    id: string;
    teams: string;
    result: string;
    context: string;
  }>;

  // Statistiques de calibration
  calibrationData?: {
    averageGoalsInSimilarMatches: number;
    averageCornersInSimilarMatches: number;
    bttsPercentageInSimilarMatches: number;
  };
}

/**
 * Crée un contexte de match par défaut (championnat standard)
 */
export function createDefaultMatchContext(): MatchContext {
  return {
    importance: 'CHAMPIONNAT',
    competitionLevel: 'PROFESSIONAL',
    isHomeTeamFightingRelegation: false,
    isAwayTeamFightingRelegation: false,
    isHomeTeamChampionshipContender: false,
    isAwayTeamChampionshipContender: false,
    isDerby: false,
    homeTeamMotivation: 70,
    awayTeamMotivation: 70,
  };
}

/**
 * Valide et améliore les ratings SofaScore des équipes
 */
export function validateAndImproveRatings(
  homeTeam: TeamStats,
  awayTeam: TeamStats
): {
  homeImprovedRating: number;
  awayImprovedRating: number;
  homeValidation: string;
  awayValidation: string;
} {
  // Si les ratings SofaScore sont fournis, les valider
  const homeValidation = validateSofaScoreRating(homeTeam.sofascoreRating, homeTeam);
  const awayValidation = validateSofaScoreRating(awayTeam.sofascoreRating, awayTeam);

  // Utiliser le rating calculé si le rating fourni est incohérent
  const homeImprovedRating = homeValidation.isConsistent
    ? homeTeam.sofascoreRating
    : homeValidation.calculatedRating;

  const awayImprovedRating = awayValidation.isConsistent
    ? awayTeam.sofascoreRating
    : awayValidation.calculatedRating;

  return {
    homeImprovedRating,
    awayImprovedRating,
    homeValidation: homeValidation.recommendation,
    awayValidation: awayValidation.recommendation,
  };
}

/**
 * Analyse un match avec toutes les améliorations
 * Cette fonction enrichit l'analyse standard avec:
 * 1. Validation/Calcul des ratings SofaScore
 * 2. Ajustement selon le contexte du match
 * 3. Calibration sur données historiques
 */
export function analyzeMatchEnhanced(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  basePrediction: MatchPrediction,
  baseConfidence: number,
  context?: MatchContext
): EnhancedAnalysisResult {
  // Utiliser le contexte fourni ou créer un contexte par défaut
  const matchContext = context || createDefaultMatchContext();

  // === 1. VALIDATION ET CALCUL DES RATINGS SOFASCORE ===
  const ratingComparison = compareTeamRatings(homeTeam, awayTeam);

  // === 2. AJUSTEMENT SELON LE CONTEXTE ===
  const adjustedPrediction = adjustPredictionsForContext(
    homeTeam,
    awayTeam,
    basePrediction,
    matchContext
  );

  // === 3. RECHERCHE DE MATCHES HISTORIQUES SIMILAIRES ===
  const similarMatches = findSimilarHistoricalMatches(
    matchContext.importance,
    matchContext.isDerby,
    matchContext.competitionLevel,
    5
  );

  // Calculer les statistiques des matches similaires
  let avgGoals = 0;
  let avgCorners = 0;
  let bttsCount = 0;

  similarMatches.forEach(match => {
    avgGoals += match.homeGoals + match.awayGoals;
    avgCorners += (match.homeCorners || 0) + (match.awayCorners || 0);
    if (match.homeGoals > 0 && match.awayGoals > 0) bttsCount++;
  });

  const calibrationData = similarMatches.length > 0 ? {
    averageGoalsInSimilarMatches: avgGoals / similarMatches.length,
    averageCornersInSimilarMatches: avgCorners / similarMatches.length,
    bttsPercentageInSimilarMatches: (bttsCount / similarMatches.length) * 100,
  } : undefined;

  // === 4. AJUSTEMENT FINAL BASÉ SUR LES DONNÉES HISTORIQUES ===
  if (calibrationData && similarMatches.length >= 3) {
    // Ajuster légèrement les prédictions vers les moyennes historiques
    const historicalWeight = 0.15; // 15% de poids aux données historiques

    const currentExpectedGoals = adjustedPrediction.expectedGoals.home + adjustedPrediction.expectedGoals.away;
    const adjustedExpectedGoals = currentExpectedGoals * (1 - historicalWeight) +
                                   calibrationData.averageGoalsInSimilarMatches * historicalWeight;

    const goalRatio = adjustedExpectedGoals / currentExpectedGoals;
    adjustedPrediction.expectedGoals.home *= goalRatio;
    adjustedPrediction.expectedGoals.away *= goalRatio;

    // Ajuster corners
    const currentCorners = adjustedPrediction.corners.predicted;
    adjustedPrediction.corners.predicted = currentCorners * (1 - historicalWeight) +
                                           calibrationData.averageCornersInSimilarMatches * historicalWeight;
  }

  // === 5. GÉNÉRER LES RECOMMANDATIONS ===
  const contextualRecommendations = getContextualRecommendations(matchContext);

  // === 6. CONSTRUIRE LE RÉSULTAT ===
  const enhancedResult: EnhancedAnalysisResult = {
    homeTeam,
    awayTeam,
    prediction: adjustedPrediction,
    confidence: baseConfidence,
    sofascoreRatings: {
      home: ratingComparison.homeRating,
      away: ratingComparison.awayRating,
      difference: ratingComparison.difference,
      advantage: ratingComparison.advantage,
    },
    matchContext,
    contextualRecommendations,
    similarMatches: similarMatches.map(m => ({
      id: m.id,
      teams: `${m.homeTeam} vs ${m.awayTeam}`,
      result: `${m.homeGoals}-${m.awayGoals}`,
      context: m.context.importance,
    })),
    calibrationData,
  };

  return enhancedResult;
}

/**
 * Génère un rapport complet de l'analyse améliorée
 */
export function generateEnhancedAnalysisReport(result: EnhancedAnalysisResult): string {
  let report = '';

  report += `\n${'='.repeat(70)}\n`;
  report += `🎯 ANALYSE AMÉLIORÉE: ${result.homeTeam.name} vs ${result.awayTeam.name}\n`;
  report += `${'='.repeat(70)}\n\n`;

  // Ratings SofaScore
  report += `📊 RATINGS SOFASCORE:\n`;
  report += `   ${result.homeTeam.name}: ${result.sofascoreRatings.home}/10\n`;
  report += `   ${result.awayTeam.name}: ${result.sofascoreRatings.away}/10\n`;
  report += `   Avantage: ${result.sofascoreRatings.advantage}\n`;
  report += `   Différence: ${result.sofascoreRatings.difference.toFixed(2)}\n\n`;

  // Contexte du match
  if (result.matchContext) {
    report += `🏆 CONTEXTE DU MATCH:\n`;
    report += `   Enjeu: ${result.matchContext.importance}\n`;
    report += `   Niveau: ${result.matchContext.competitionLevel}\n`;
    report += `   Derby: ${result.matchContext.isDerby ? 'OUI' : 'NON'}\n`;
    if (result.matchContext.isDerby && result.matchContext.rivalryIntensity) {
      report += `   Intensité rivalité: ${result.matchContext.rivalryIntensity}\n`;
    }
    report += `   Motivation ${result.homeTeam.name}: ${result.matchContext.homeTeamMotivation}/100\n`;
    report += `   Motivation ${result.awayTeam.name}: ${result.matchContext.awayTeamMotivation}/100\n\n`;
  }

  // Prédictions ajustées
  report += `⚽ PRÉDICTIONS AJUSTÉES:\n`;
  report += `   Buts attendus: ${result.prediction.expectedGoals.home.toFixed(2)} - ${result.prediction.expectedGoals.away.toFixed(2)}\n`;
  report += `   Over/Under 2.5: ${result.prediction.overUnder25Goals.prediction} (${result.prediction.overUnder25Goals[result.prediction.overUnder25Goals.prediction.toLowerCase()].toFixed(1)}%)\n`;
  report += `   BTTS: ${result.prediction.btts.prediction} (${result.prediction.btts[result.prediction.btts.prediction.toLowerCase()].toFixed(1)}%)\n`;
  report += `   Corners prévus: ${result.prediction.corners.predicted.toFixed(1)}\n`;
  report += `   Fautes prévues: ${result.prediction.fouls.predicted.toFixed(1)}\n`;
  report += `   Cartons jaunes: ${result.prediction.yellowCards.predicted.toFixed(1)}\n\n`;

  // Données de calibration
  if (result.calibrationData) {
    report += `📈 CALIBRATION (Matches similaires):\n`;
    report += `   Buts moyens: ${result.calibrationData.averageGoalsInSimilarMatches.toFixed(2)}\n`;
    report += `   Corners moyens: ${result.calibrationData.averageCornersInSimilarMatches.toFixed(1)}\n`;
    report += `   BTTS: ${result.calibrationData.bttsPercentageInSimilarMatches.toFixed(1)}%\n\n`;
  }

  // Matches similaires
  if (result.similarMatches && result.similarMatches.length > 0) {
    report += `🔍 MATCHES HISTORIQUES SIMILAIRES:\n`;
    result.similarMatches.forEach(match => {
      report += `   • ${match.teams} → ${match.result} (${match.context})\n`;
    });
    report += `\n`;
  }

  // Recommandations
  if (result.contextualRecommendations && result.contextualRecommendations.length > 0) {
    report += `💡 RECOMMANDATIONS CONTEXTUELLES:\n`;
    result.contextualRecommendations.forEach(rec => {
      report += `   ${rec}\n`;
    });
    report += `\n`;
  }

  report += `📊 CONFIANCE GLOBALE: ${result.confidence.toFixed(1)}%\n`;
  report += `${'='.repeat(70)}\n`;

  return report;
}

/**
 * Exporte les statistiques du dataset d'entraînement
 */
export function getTrainingStatistics() {
  return getTrainingDatasetStatistics();
}
