import { TeamStats, MatchPrediction } from '../types/football';
import { analyzeZeroLossPrediction } from './zeroLossSystem';
import { detectHistoricalPatterns } from './historicalPatternMatching';
import { analyzeMatch } from './footballAnalysis';

/**
 * 🧪 MOTEUR DE BACKTESTING
 *
 * Teste les prédictions du système sur des matchs passés dont on connaît les résultats réels.
 * Permet de valider la précision du système et d'identifier les points d'amélioration.
 */

export interface MatchResult {
  // Informations du match
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;

  // Résultats réels
  homeGoals: number;
  awayGoals: number;
  totalGoals: number;
  btts: boolean;
  corners: number;
  yellowCards: number;
  redCards: number;

  // Stats des équipes avant le match
  homeTeamStats: TeamStats;
  awayTeamStats: TeamStats;
}

export interface BacktestPrediction {
  // Prédiction faite
  prediction: MatchPrediction;
  zeroLossAnalysis: any;
  patternAnalysis: any;

  // Résultat réel
  actualResult: MatchResult;

  // Évaluation
  evaluation: PredictionEvaluation;
}

export interface PredictionEvaluation {
  // Précision par type de prédiction
  over25Correct: boolean;
  under25Correct: boolean;
  bttsCorrect: boolean;
  winnerCorrect: boolean;
  cornersAccuracy: number; // Écart en %
  cardsAccuracy: number; // Écart en %

  // Score global
  overallAccuracy: number; // 0-100

  // Évaluation du système de sécurité
  wasSafe: boolean; // Classification était SAFE ou BANKABLE
  shouldHaveBet: boolean; // Selon le système
  wasProfit: boolean; // Si on avait parié, aurait-on gagné ?

  // Analyse
  strengths: string[];
  weaknesses: string[];
  lessons: string[];
}

export interface BacktestResults {
  // Statistiques globales
  totalMatches: number;
  totalPredictions: number;

  // Précision par type
  over25Accuracy: number;
  under25Accuracy: number;
  bttsAccuracy: number;
  winnerAccuracy: number;
  cornersMAE: number; // Mean Absolute Error
  cardsMAE: number;

  // Performance du système de sécurité
  bankableMatches: number;
  bankableWinRate: number;
  safeMatches: number;
  safeWinRate: number;
  riskyMatches: number;
  riskyWinRate: number;
  blockedMatches: number;
  blockedWouldHaveLost: number; // % de matchs bloqués qui auraient perdu

  // ROI simulé
  totalStaked: number;
  totalWon: number;
  totalProfit: number;
  roi: number; // Return on Investment en %

  // Meilleurs et pires
  bestPredictions: BacktestPrediction[];
  worstPredictions: BacktestPrediction[];

  // Insights
  insights: string[];
  recommendations: string[];
}

/**
 * 🧪 Effectuer un backtest sur un ensemble de matchs
 */
export function runBacktest(matches: MatchResult[]): BacktestResults {
  console.log(`🧪 Démarrage du backtest sur ${matches.length} matchs...`);

  const predictions: BacktestPrediction[] = [];

  // Analyser chaque match
  for (const match of matches) {
    const prediction = analyzeMatch(match.homeTeamStats, match.awayTeamStats);
    const zeroLoss = analyzeZeroLossPrediction(match.homeTeamStats, match.awayTeamStats, prediction);
    const patterns = detectHistoricalPatterns(match.homeTeamStats, match.awayTeamStats, prediction);

    const evaluation = evaluatePrediction(prediction, zeroLoss, patterns, match);

    predictions.push({
      prediction,
      zeroLossAnalysis: zeroLoss,
      patternAnalysis: patterns,
      actualResult: match,
      evaluation
    });
  }

  // Calculer les statistiques globales
  return calculateBacktestResults(predictions);
}

/**
 * 📊 Évaluer une prédiction par rapport au résultat réel
 */
function evaluatePrediction(
  prediction: MatchPrediction,
  zeroLoss: any,
  patterns: any,
  actualResult: MatchResult
): PredictionEvaluation {

  // Vérifier Over/Under 2.5
  const over25Correct = (actualResult.totalGoals > 2.5 && prediction.overUnder25Goals.prediction === 'OVER') ||
                        (actualResult.totalGoals < 2.5 && prediction.overUnder25Goals.prediction === 'UNDER');

  const under25Correct = !over25Correct;

  // Vérifier BTTS
  const bttsCorrect = (actualResult.btts && prediction.btts.prediction === 'YES') ||
                      (!actualResult.btts && prediction.btts.prediction === 'NO');

  // Vérifier gagnant
  let winnerCorrect = false;
  if (actualResult.homeGoals > actualResult.awayGoals && prediction.winProbabilities.home > prediction.winProbabilities.away) {
    winnerCorrect = true;
  } else if (actualResult.homeGoals < actualResult.awayGoals && prediction.winProbabilities.away > prediction.winProbabilities.home) {
    winnerCorrect = true;
  } else if (actualResult.homeGoals === actualResult.awayGoals && prediction.winProbabilities.draw > Math.max(prediction.winProbabilities.home, prediction.winProbabilities.away)) {
    winnerCorrect = true;
  }

  // Précision corners et cartons
  const cornersAccuracy = 100 - Math.abs((prediction.corners.predicted - actualResult.corners) / actualResult.corners * 100);
  const cardsAccuracy = 100 - Math.abs((prediction.yellowCards.predicted - actualResult.yellowCards) / actualResult.yellowCards * 100);

  // Score global
  let overallAccuracy = 0;
  if (over25Correct) overallAccuracy += 25;
  if (bttsCorrect) overallAccuracy += 25;
  if (winnerCorrect) overallAccuracy += 25;
  overallAccuracy += Math.min(25, (cornersAccuracy + cardsAccuracy) / 2 * 0.25);

  // Évaluation du système de sécurité
  const wasSafe = zeroLoss.classification === 'SAFE' || zeroLoss.classification === 'BANKABLE';
  const shouldHaveBet = zeroLoss.shouldBet;
  const wasProfit = over25Correct || bttsCorrect; // Simplifié pour l'exemple

  // Analyse des forces et faiblesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const lessons: string[] = [];

  if (over25Correct) strengths.push('✅ Prédiction Over/Under 2.5 correcte');
  else weaknesses.push('❌ Prédiction Over/Under 2.5 incorrecte');

  if (bttsCorrect) strengths.push('✅ Prédiction BTTS correcte');
  else weaknesses.push('❌ Prédiction BTTS incorrecte');

  if (winnerCorrect) strengths.push('✅ Prédiction du gagnant correcte');
  else weaknesses.push('❌ Prédiction du gagnant incorrecte');

  if (cornersAccuracy > 80) strengths.push('✅ Prédiction corners très précise');
  else if (cornersAccuracy < 60) weaknesses.push('❌ Prédiction corners imprécise');

  // Leçons
  if (shouldHaveBet && !wasProfit) {
    lessons.push('⚠️ Le système a recommandé de parier mais résultat négatif - Revoir les critères');
  } else if (!shouldHaveBet && wasProfit) {
    lessons.push('💡 Le système a bloqué un pari gagnant - Critères peut-être trop stricts');
  } else if (shouldHaveBet && wasProfit) {
    lessons.push('✅ Succès : Le système a correctement identifié une opportunité');
  } else {
    lessons.push('✅ Protection : Le système a correctement évité une perte');
  }

  return {
    over25Correct,
    under25Correct,
    bttsCorrect,
    winnerCorrect,
    cornersAccuracy: Math.max(0, cornersAccuracy),
    cardsAccuracy: Math.max(0, cardsAccuracy),
    overallAccuracy,
    wasSafe,
    shouldHaveBet,
    wasProfit,
    strengths,
    weaknesses,
    lessons
  };
}

/**
 * 📈 Calculer les résultats du backtest
 */
function calculateBacktestResults(predictions: BacktestPrediction[]): BacktestResults {
  const totalMatches = predictions.length;

  // Précision par type
  const over25Correct = predictions.filter(p => p.evaluation.over25Correct).length;
  const bttsCorrect = predictions.filter(p => p.evaluation.bttsCorrect).length;
  const winnerCorrect = predictions.filter(p => p.evaluation.winnerCorrect).length;

  const over25Accuracy = (over25Correct / totalMatches) * 100;
  const under25Accuracy = 100 - over25Accuracy; // Simplifié
  const bttsAccuracy = (bttsCorrect / totalMatches) * 100;
  const winnerAccuracy = (winnerCorrect / totalMatches) * 100;

  // MAE pour corners et cartons
  const cornersMAE = predictions.reduce((sum, p) => {
    return sum + Math.abs(p.prediction.corners.predicted - p.actualResult.corners);
  }, 0) / totalMatches;

  const cardsMAE = predictions.reduce((sum, p) => {
    return sum + Math.abs(p.prediction.yellowCards.predicted - p.actualResult.yellowCards);
  }, 0) / totalMatches;

  // Performance par classification
  const bankable = predictions.filter(p => p.zeroLossAnalysis.classification === 'BANKABLE');
  const safe = predictions.filter(p => p.zeroLossAnalysis.classification === 'SAFE');
  const risky = predictions.filter(p => p.zeroLossAnalysis.classification === 'RISKY');
  const blocked = predictions.filter(p => p.zeroLossAnalysis.classification === 'BLOCKED' ||
                                          p.zeroLossAnalysis.classification === 'DANGER');

  const bankableWinRate = bankable.length > 0
    ? (bankable.filter(p => p.evaluation.wasProfit).length / bankable.length) * 100
    : 0;

  const safeWinRate = safe.length > 0
    ? (safe.filter(p => p.evaluation.wasProfit).length / safe.length) * 100
    : 0;

  const riskyWinRate = risky.length > 0
    ? (risky.filter(p => p.evaluation.wasProfit).length / risky.length) * 100
    : 0;

  const blockedWouldHaveLost = blocked.length > 0
    ? (blocked.filter(p => !p.evaluation.wasProfit).length / blocked.length) * 100
    : 0;

  // ROI simulé (cotes moyennes estimées)
  let totalStaked = 0;
  let totalWon = 0;

  predictions.forEach(p => {
    if (p.zeroLossAnalysis.shouldBet) {
      const stake = p.zeroLossAnalysis.stakingRecommendation; // % du bankroll
      totalStaked += stake;

      if (p.evaluation.wasProfit) {
        // Cote moyenne estimée à 1.8
        totalWon += stake * 1.8;
      }
    }
  });

  const totalProfit = totalWon - totalStaked;
  const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

  // Meilleurs et pires prédictions
  const sorted = [...predictions].sort((a, b) => b.evaluation.overallAccuracy - a.evaluation.overallAccuracy);
  const bestPredictions = sorted.slice(0, 5);
  const worstPredictions = sorted.slice(-5).reverse();

  // Insights
  const insights: string[] = [];

  if (over25Accuracy > 80) {
    insights.push(`✅ Excellente précision Over/Under 2.5 (${over25Accuracy.toFixed(1)}%)`);
  } else if (over25Accuracy < 70) {
    insights.push(`⚠️ Précision Over/Under 2.5 à améliorer (${over25Accuracy.toFixed(1)}%)`);
  }

  if (bttsAccuracy > 80) {
    insights.push(`✅ Excellente précision BTTS (${bttsAccuracy.toFixed(1)}%)`);
  } else if (bttsAccuracy < 70) {
    insights.push(`⚠️ Précision BTTS à améliorer (${bttsAccuracy.toFixed(1)}%)`);
  }

  if (bankableWinRate > 85) {
    insights.push(`💎 Les matchs BANKABLE ont un excellent taux de réussite (${bankableWinRate.toFixed(1)}%)`);
  }

  if (safeWinRate > 75) {
    insights.push(`✅ Les matchs SAFE ont un bon taux de réussite (${safeWinRate.toFixed(1)}%)`);
  }

  if (blockedWouldHaveLost > 60) {
    insights.push(`🛡️ Le système de blocage est efficace (${blockedWouldHaveLost.toFixed(1)}% auraient perdu)`);
  }

  if (roi > 10) {
    insights.push(`💰 ROI positif excellent : +${roi.toFixed(1)}%`);
  } else if (roi > 0) {
    insights.push(`💰 ROI positif : +${roi.toFixed(1)}%`);
  } else {
    insights.push(`⚠️ ROI négatif : ${roi.toFixed(1)}% - Système à optimiser`);
  }

  // Recommandations
  const recommendations: string[] = [];

  if (over25Accuracy < 75) {
    recommendations.push('📊 Améliorer le modèle de prédiction des buts (ajuster paramètres Poisson/Monte Carlo)');
  }

  if (bttsAccuracy < 75) {
    recommendations.push('📊 Améliorer la prédiction BTTS (mieux prendre en compte force défensive)');
  }

  if (cornersMAE > 3) {
    recommendations.push('📊 Affiner la prédiction des corners (corrélation avec possession/attaque)');
  }

  if (bankableWinRate < 85) {
    recommendations.push('🛡️ Augmenter les critères de classification BANKABLE (seuil de sécurité plus élevé)');
  }

  if (blockedWouldHaveLost < 55) {
    recommendations.push('🛡️ Assouplir légèrement les critères de blocage (trop strict)');
  }

  if (roi < 5) {
    recommendations.push('💰 Optimiser les recommandations de mise (Kelly Criterion trop agressif/conservateur)');
  }

  return {
    totalMatches,
    totalPredictions: predictions.length,
    over25Accuracy,
    under25Accuracy,
    bttsAccuracy,
    winnerAccuracy,
    cornersMAE,
    cardsMAE,
    bankableMatches: bankable.length,
    bankableWinRate,
    safeMatches: safe.length,
    safeWinRate,
    riskyMatches: risky.length,
    riskyWinRate,
    blockedMatches: blocked.length,
    blockedWouldHaveLost,
    totalStaked,
    totalWon,
    totalProfit,
    roi,
    bestPredictions,
    worstPredictions,
    insights,
    recommendations
  };
}

/**
 * 🎯 Générer des matchs de test pour démonstration
 */
export function generateTestMatches(): MatchResult[] {
  return [
    // Match 1: Équipes offensives équilibrées (devrait être BANKABLE pour Over 2.5)
    {
      homeTeam: 'Manchester City',
      awayTeam: 'Liverpool',
      league: 'Premier League',
      date: '2024-03-15',
      homeGoals: 2,
      awayGoals: 2,
      totalGoals: 4,
      btts: true,
      corners: 12,
      yellowCards: 4,
      redCards: 0,
      homeTeamStats: {
        name: 'Manchester City',
        sofascoreRating: 82,
        matches: 28,
        goalsScored: 70,
        goalsConceded: 28,
        assists: 56,
        goalsPerMatch: 2.5,
        shotsOnTargetPerMatch: 6.8,
        bigChancesPerMatch: 3.2,
        bigChancesMissedPerMatch: 1.8,
        possession: 65,
        accuracyPerMatch: 88,
        longBallsAccuratePerMatch: 18,
        cleanSheets: 12,
        goalsConcededPerMatch: 1.0,
        interceptionsPerMatch: 10,
        tacklesPerMatch: 15,
        clearancesPerMatch: 18,
        penaltyConceded: 0.1,
        throwInsPerMatch: 25,
        yellowCardsPerMatch: 1.8,
        duelsWonPerMatch: 52,
        offsidesPerMatch: 2.5,
        goalKicksPerMatch: 7,
        redCardsPerMatch: 0.1
      },
      awayTeamStats: {
        name: 'Liverpool',
        sofascoreRating: 80,
        matches: 28,
        goalsScored: 65,
        goalsConceded: 32,
        assists: 52,
        goalsPerMatch: 2.3,
        shotsOnTargetPerMatch: 6.2,
        bigChancesPerMatch: 2.9,
        bigChancesMissedPerMatch: 1.6,
        possession: 58,
        accuracyPerMatch: 85,
        longBallsAccuratePerMatch: 16,
        cleanSheets: 10,
        goalsConcededPerMatch: 1.1,
        interceptionsPerMatch: 9,
        tacklesPerMatch: 16,
        clearancesPerMatch: 20,
        penaltyConceded: 0.15,
        throwInsPerMatch: 28,
        yellowCardsPerMatch: 2.1,
        duelsWonPerMatch: 48,
        offsidesPerMatch: 3.1,
        goalKicksPerMatch: 8,
        redCardsPerMatch: 0.05
      }
    },

    // Match 2: Équipes défensives (devrait être SAFE pour Under 2.5)
    {
      homeTeam: 'Atletico Madrid',
      awayTeam: 'Getafe',
      league: 'La Liga',
      date: '2024-03-16',
      homeGoals: 1,
      awayGoals: 0,
      totalGoals: 1,
      btts: false,
      corners: 8,
      yellowCards: 6,
      redCards: 0,
      homeTeamStats: {
        name: 'Atletico Madrid',
        sofascoreRating: 74,
        matches: 28,
        goalsScored: 42,
        goalsConceded: 22,
        assists: 32,
        goalsPerMatch: 1.5,
        shotsOnTargetPerMatch: 4.5,
        bigChancesPerMatch: 1.8,
        bigChancesMissedPerMatch: 1.2,
        possession: 52,
        accuracyPerMatch: 82,
        longBallsAccuratePerMatch: 14,
        cleanSheets: 15,
        goalsConcededPerMatch: 0.8,
        interceptionsPerMatch: 12,
        tacklesPerMatch: 18,
        clearancesPerMatch: 24,
        penaltyConceded: 0.08,
        throwInsPerMatch: 26,
        yellowCardsPerMatch: 2.5,
        duelsWonPerMatch: 46,
        offsidesPerMatch: 2.2,
        goalKicksPerMatch: 9,
        redCardsPerMatch: 0.12
      },
      awayTeamStats: {
        name: 'Getafe',
        sofascoreRating: 68,
        matches: 28,
        goalsScored: 32,
        goalsConceded: 28,
        assists: 24,
        goalsPerMatch: 1.1,
        shotsOnTargetPerMatch: 3.8,
        bigChancesPerMatch: 1.2,
        bigChancesMissedPerMatch: 1.5,
        possession: 45,
        accuracyPerMatch: 78,
        longBallsAccuratePerMatch: 12,
        cleanSheets: 12,
        goalsConcededPerMatch: 1.0,
        interceptionsPerMatch: 13,
        tacklesPerMatch: 20,
        clearancesPerMatch: 28,
        penaltyConceded: 0.12,
        throwInsPerMatch: 30,
        yellowCardsPerMatch: 3.2,
        duelsWonPerMatch: 44,
        offsidesPerMatch: 1.8,
        goalKicksPerMatch: 11,
        redCardsPerMatch: 0.15
      }
    },

    // Match 3: Domination totale (devrait être BANKABLE pour Home Win)
    {
      homeTeam: 'Bayern Munich',
      awayTeam: 'Augsburg',
      league: 'Bundesliga',
      date: '2024-03-17',
      homeGoals: 4,
      awayGoals: 0,
      totalGoals: 4,
      btts: false,
      corners: 14,
      yellowCards: 3,
      redCards: 0,
      homeTeamStats: {
        name: 'Bayern Munich',
        sofascoreRating: 85,
        matches: 26,
        goalsScored: 78,
        goalsConceded: 28,
        assists: 62,
        goalsPerMatch: 3.0,
        shotsOnTargetPerMatch: 7.5,
        bigChancesPerMatch: 3.8,
        bigChancesMissedPerMatch: 2.2,
        possession: 68,
        accuracyPerMatch: 89,
        longBallsAccuratePerMatch: 20,
        cleanSheets: 14,
        goalsConcededPerMatch: 1.1,
        interceptionsPerMatch: 11,
        tacklesPerMatch: 14,
        clearancesPerMatch: 16,
        penaltyConceded: 0.08,
        throwInsPerMatch: 24,
        yellowCardsPerMatch: 1.6,
        duelsWonPerMatch: 54,
        offsidesPerMatch: 3.2,
        goalKicksPerMatch: 6,
        redCardsPerMatch: 0.05
      },
      awayTeamStats: {
        name: 'Augsburg',
        sofascoreRating: 65,
        matches: 26,
        goalsScored: 28,
        goalsConceded: 52,
        assists: 22,
        goalsPerMatch: 1.1,
        shotsOnTargetPerMatch: 3.2,
        bigChancesPerMatch: 1.0,
        bigChancesMissedPerMatch: 1.8,
        possession: 42,
        accuracyPerMatch: 74,
        longBallsAccuratePerMatch: 10,
        cleanSheets: 5,
        goalsConcededPerMatch: 2.0,
        interceptionsPerMatch: 8,
        tacklesPerMatch: 19,
        clearancesPerMatch: 30,
        penaltyConceded: 0.18,
        throwInsPerMatch: 32,
        yellowCardsPerMatch: 2.8,
        duelsWonPerMatch: 40,
        offsidesPerMatch: 1.5,
        goalKicksPerMatch: 13,
        redCardsPerMatch: 0.12
      }
    }
  ];
}

/**
 * 📊 Exporter les résultats du backtest en format texte
 */
export function exportBacktestReport(results: BacktestResults): string {
  let report = '📊 RAPPORT DE BACKTEST\n';
  report += '='.repeat(60) + '\n\n';

  report += `📈 STATISTIQUES GLOBALES\n`;
  report += `-`.repeat(60) + '\n';
  report += `Total de matchs testés: ${results.totalMatches}\n`;
  report += `Total de prédictions: ${results.totalPredictions}\n\n`;

  report += `🎯 PRÉCISION PAR TYPE DE PRÉDICTION\n`;
  report += `-`.repeat(60) + '\n';
  report += `Over 2.5:  ${results.over25Accuracy.toFixed(1)}%\n`;
  report += `Under 2.5: ${results.under25Accuracy.toFixed(1)}%\n`;
  report += `BTTS:      ${results.bttsAccuracy.toFixed(1)}%\n`;
  report += `Gagnant:   ${results.winnerAccuracy.toFixed(1)}%\n`;
  report += `Corners MAE: ${results.cornersMAE.toFixed(2)}\n`;
  report += `Cartons MAE: ${results.cardsMAE.toFixed(2)}\n\n`;

  report += `🛡️ PERFORMANCE DU SYSTÈME DE SÉCURITÉ\n`;
  report += `-`.repeat(60) + '\n';
  report += `Matchs BANKABLE: ${results.bankableMatches} (${results.bankableWinRate.toFixed(1)}% réussite)\n`;
  report += `Matchs SAFE:     ${results.safeMatches} (${results.safeWinRate.toFixed(1)}% réussite)\n`;
  report += `Matchs RISKY:    ${results.riskyMatches} (${results.riskyWinRate.toFixed(1)}% réussite)\n`;
  report += `Matchs BLOCKED:  ${results.blockedMatches} (${results.blockedWouldHaveLost.toFixed(1)}% auraient perdu)\n\n`;

  report += `💰 ROI SIMULÉ\n`;
  report += `-`.repeat(60) + '\n';
  report += `Total misé:    ${results.totalStaked.toFixed(2)} unités\n`;
  report += `Total gagné:   ${results.totalWon.toFixed(2)} unités\n`;
  report += `Profit:        ${results.totalProfit >= 0 ? '+' : ''}${results.totalProfit.toFixed(2)} unités\n`;
  report += `ROI:           ${results.roi >= 0 ? '+' : ''}${results.roi.toFixed(1)}%\n\n`;

  report += `💡 INSIGHTS\n`;
  report += `-`.repeat(60) + '\n';
  results.insights.forEach(insight => {
    report += `${insight}\n`;
  });
  report += '\n';

  report += `📋 RECOMMANDATIONS\n`;
  report += `-`.repeat(60) + '\n';
  results.recommendations.forEach(rec => {
    report += `${rec}\n`;
  });

  return report;
}
