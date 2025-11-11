import { realMatchDatabase, RealMatch } from './realMatchDatabase';
import { analyzeMatch } from './footballAnalysis';
import { TeamStats } from '../types/football';

/**
 * MOTEUR DE BACKTESTING RÉEL
 *
 * Ce système teste les prédictions sur de vrais matchs pour calculer
 * la précision RÉELLE du système (pas de simulation).
 *
 * Il mesure:
 * - Précision Over/Under
 * - Précision BTTS
 * - Précision résultat (1X2)
 * - ROI sur paris fictifs
 */

export interface BacktestResult {
  matchId: string;
  matchName: string;
  league: string;
  date: string;

  // Prédictions
  predictedOver25: number;
  predictedUnder25: number;
  predictedBttsYes: number;
  predictedBttsNo: number;
  predictedHomeWin: number;
  predictedDraw: number;
  predictedAwayWin: number;

  // Résultats réels
  actualOver25: boolean;
  actualBttsYes: boolean;
  actualResult: 'HOME' | 'DRAW' | 'AWAY';

  // Succès/Échecs
  over25Success: boolean;
  bttsSuccess: boolean;
  resultSuccess: boolean;

  // Confiance
  confidence: number;
}

export interface BacktestSummary {
  totalMatches: number;

  // Précision Over/Under
  over25Accuracy: number;
  over25Correct: number;
  over25Total: number;

  // Précision BTTS
  bttsAccuracy: number;
  bttsCorrect: number;
  bttsTotal: number;

  // Précision résultat
  resultAccuracy: number;
  resultCorrect: number;
  resultTotal: number;

  // Précision globale
  overallAccuracy: number;

  // ROI
  totalBets: number;
  successfulBets: number;
  roi: number;

  // Distribution de confiance
  avgConfidence: number;
  highConfidenceMatches: number; // >80%
  mediumConfidenceMatches: number; // 60-80%
  lowConfidenceMatches: number; // <60%

  // Détails
  results: BacktestResult[];
}

/**
 * Exécute le backtest sur tous les matchs réels
 */
export function runRealBacktest(): BacktestSummary {
  const results: BacktestResult[] = [];

  // Tester chaque match
  for (const match of realMatchDatabase) {
    const result = backtestSingleMatch(match);
    results.push(result);
  }

  // Calculer les statistiques
  return calculateBacktestSummary(results);
}

/**
 * Backtest un seul match
 */
function backtestSingleMatch(match: RealMatch): BacktestResult {
  // Convertir les stats en TeamStats
  const homeTeam: TeamStats = {
    name: match.homeTeam.name,
    matches: 10, // Approximation
    ...match.homeTeam.stats,
    goalsScored: match.homeTeam.stats.goalsPerMatch * 10,
    goalsConceded: match.homeTeam.stats.goalsConcededPerMatch * 10,
    cleanSheets: 0, // Non disponible
    assists: 0,
    accuracy: 0,
    longBallsAccurate: 0,
    duelsWonPerMatch: 0,
    tacklesPerMatch: 0,
    interceptionsPerMatch: 0,
    throwInsPerMatch: 0,
    offsidesPerMatch: 0,
    goalKicksPerMatch: 0,
    redCardsPerMatch: 0,
    bigChancesPerMatch: 0,
  };

  const awayTeam: TeamStats = {
    name: match.awayTeam.name,
    matches: 10,
    ...match.awayTeam.stats,
    goalsScored: match.awayTeam.stats.goalsPerMatch * 10,
    goalsConceded: match.awayTeam.stats.goalsConcededPerMatch * 10,
    cleanSheets: 0,
    assists: 0,
    accuracy: 0,
    longBallsAccurate: 0,
    duelsWonPerMatch: 0,
    tacklesPerMatch: 0,
    interceptionsPerMatch: 0,
    throwInsPerMatch: 0,
    offsidesPerMatch: 0,
    goalKicksPerMatch: 0,
    redCardsPerMatch: 0,
    bigChancesPerMatch: 0,
  };

  // Exécuter l'analyse
  const analysis = analyzeMatch(homeTeam, awayTeam);

  // Extraire les prédictions
  const predictedOver25 = analysis.prediction.overUnder25Goals?.over || 0;
  const predictedUnder25 = analysis.prediction.overUnder25Goals?.under || 0;
  const predictedBttsYes = analysis.prediction.btts?.yes || 0;
  const predictedBttsNo = analysis.prediction.btts?.no || 0;
  const predictedHomeWin = analysis.prediction.homeWin || 0;
  const predictedDraw = analysis.prediction.draw || 0;
  const predictedAwayWin = analysis.prediction.awayWin || 0;

  // Déterminer le résultat réel
  let actualResult: 'HOME' | 'DRAW' | 'AWAY';
  if (match.actualResult.homeWin) actualResult = 'HOME';
  else if (match.actualResult.draw) actualResult = 'DRAW';
  else actualResult = 'AWAY';

  // Vérifier succès
  const over25Success =
    (predictedOver25 > predictedUnder25 && match.actualResult.over25) ||
    (predictedUnder25 > predictedOver25 && match.actualResult.under25);

  const bttsSuccess =
    (predictedBttsYes > predictedBttsNo && match.actualResult.bttsYes) ||
    (predictedBttsNo > predictedBttsYes && match.actualResult.bttsNo);

  let resultSuccess = false;
  if (predictedHomeWin > predictedDraw && predictedHomeWin > predictedAwayWin) {
    resultSuccess = actualResult === 'HOME';
  } else if (predictedDraw > predictedHomeWin && predictedDraw > predictedAwayWin) {
    resultSuccess = actualResult === 'DRAW';
  } else if (predictedAwayWin > predictedHomeWin && predictedAwayWin > predictedDraw) {
    resultSuccess = actualResult === 'AWAY';
  }

  return {
    matchId: match.id,
    matchName: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    league: match.league,
    date: match.date,

    predictedOver25,
    predictedUnder25,
    predictedBttsYes,
    predictedBttsNo,
    predictedHomeWin,
    predictedDraw,
    predictedAwayWin,

    actualOver25: match.actualResult.over25,
    actualBttsYes: match.actualResult.bttsYes,
    actualResult,

    over25Success,
    bttsSuccess,
    resultSuccess,

    confidence: analysis.confidence,
  };
}

/**
 * Calcule le résumé du backtest
 */
function calculateBacktestSummary(results: BacktestResult[]): BacktestSummary {
  const totalMatches = results.length;

  // Over/Under
  const over25Correct = results.filter(r => r.over25Success).length;
  const over25Total = totalMatches;
  const over25Accuracy = (over25Correct / over25Total) * 100;

  // BTTS
  const bttsCorrect = results.filter(r => r.bttsSuccess).length;
  const bttsTotal = totalMatches;
  const bttsAccuracy = (bttsCorrect / bttsTotal) * 100;

  // Résultat
  const resultCorrect = results.filter(r => r.resultSuccess).length;
  const resultTotal = totalMatches;
  const resultAccuracy = (resultCorrect / resultTotal) * 100;

  // Global
  const totalPredictions = over25Total + bttsTotal + resultTotal;
  const totalCorrect = over25Correct + bttsCorrect + resultCorrect;
  const overallAccuracy = (totalCorrect / totalPredictions) * 100;

  // ROI (simulé avec odds moyennes)
  const avgOdds = 1.85;
  const totalBets = totalPredictions;
  const successfulBets = totalCorrect;
  const totalStake = totalBets * 1; // 1€ par pari
  const totalReturn = successfulBets * avgOdds;
  const roi = ((totalReturn - totalStake) / totalStake) * 100;

  // Confiance
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / totalMatches;
  const highConfidenceMatches = results.filter(r => r.confidence > 80).length;
  const mediumConfidenceMatches = results.filter(r => r.confidence >= 60 && r.confidence <= 80).length;
  const lowConfidenceMatches = results.filter(r => r.confidence < 60).length;

  return {
    totalMatches,

    over25Accuracy,
    over25Correct,
    over25Total,

    bttsAccuracy,
    bttsCorrect,
    bttsTotal,

    resultAccuracy,
    resultCorrect,
    resultTotal,

    overallAccuracy,

    totalBets,
    successfulBets,
    roi,

    avgConfidence,
    highConfidenceMatches,
    mediumConfidenceMatches,
    lowConfidenceMatches,

    results,
  };
}

/**
 * Génère un rapport de backtest lisible
 */
export function generateBacktestReport(summary: BacktestSummary): string {
  let report = '\n';
  report += '═══════════════════════════════════════════════════════════════\n';
  report += '          RAPPORT DE BACKTESTING - MATCHS RÉELS\n';
  report += '═══════════════════════════════════════════════════════════════\n\n';

  report += `📊 Total de matchs testés: ${summary.totalMatches}\n`;
  report += `📈 Confiance moyenne: ${summary.avgConfidence.toFixed(1)}%\n\n`;

  report += '─────────────────────────────────────────────────────────────\n';
  report += '                    PRÉCISION PAR TYPE\n';
  report += '─────────────────────────────────────────────────────────────\n\n';

  // Over/Under
  report += `🎯 OVER/UNDER 2.5 BUTS:\n`;
  report += `   Précision: ${summary.over25Accuracy.toFixed(1)}%\n`;
  report += `   Correct: ${summary.over25Correct}/${summary.over25Total}\n`;
  report += `   ${getAccuracyRating(summary.over25Accuracy)}\n\n`;

  // BTTS
  report += `🎯 BOTH TEAMS TO SCORE (BTTS):\n`;
  report += `   Précision: ${summary.bttsAccuracy.toFixed(1)}%\n`;
  report += `   Correct: ${summary.bttsCorrect}/${summary.bttsTotal}\n`;
  report += `   ${getAccuracyRating(summary.bttsAccuracy)}\n\n`;

  // Résultat
  report += `🎯 RÉSULTAT DU MATCH (1X2):\n`;
  report += `   Précision: ${summary.resultAccuracy.toFixed(1)}%\n`;
  report += `   Correct: ${summary.resultCorrect}/${summary.resultTotal}\n`;
  report += `   ${getAccuracyRating(summary.resultAccuracy)}\n\n`;

  report += '─────────────────────────────────────────────────────────────\n';
  report += '                 PERFORMANCE GLOBALE\n';
  report += '─────────────────────────────────────────────────────────────\n\n';

  report += `🏆 Précision Globale: ${summary.overallAccuracy.toFixed(1)}%\n`;
  report += `💰 ROI (Return on Investment): ${summary.roi >= 0 ? '+' : ''}${summary.roi.toFixed(1)}%\n`;
  report += `✅ Paris réussis: ${summary.successfulBets}/${summary.totalBets}\n\n`;

  // Analyse ROI
  if (summary.roi > 10) {
    report += `   🎉 EXCELLENT ROI - Système rentable!\n\n`;
  } else if (summary.roi > 0) {
    report += `   ✅ ROI positif - Légèrement rentable\n\n`;
  } else if (summary.roi > -10) {
    report += `   ⚠️  ROI légèrement négatif - Break-even proche\n\n`;
  } else {
    report += `   ❌ ROI négatif - Système perd de l'argent\n\n`;
  }

  report += '─────────────────────────────────────────────────────────────\n';
  report += '              DISTRIBUTION DE CONFIANCE\n';
  report += '─────────────────────────────────────────────────────────────\n\n';

  report += `🔴 Confiance Élevée (>80%): ${summary.highConfidenceMatches} matchs\n`;
  report += `🟡 Confiance Moyenne (60-80%): ${summary.mediumConfidenceMatches} matchs\n`;
  report += `🟢 Confiance Faible (<60%): ${summary.lowConfidenceMatches} matchs\n\n`;

  report += '─────────────────────────────────────────────────────────────\n';
  report += '                  DÉTAILS DES MATCHS\n';
  report += '─────────────────────────────────────────────────────────────\n\n';

  summary.results.forEach((result, index) => {
    report += `${index + 1}. ${result.matchName} (${result.league})\n`;
    report += `   Date: ${result.date}\n`;
    report += `   Confiance: ${result.confidence.toFixed(1)}%\n`;
    report += `   Over/Under: ${result.over25Success ? '✅' : '❌'} `;
    report += `(Prédit: ${result.predictedOver25 > result.predictedUnder25 ? 'Over' : 'Under'}, `;
    report += `Réel: ${result.actualOver25 ? 'Over' : 'Under'})\n`;
    report += `   BTTS: ${result.bttsSuccess ? '✅' : '❌'} `;
    report += `(Prédit: ${result.predictedBttsYes > result.predictedBttsNo ? 'Oui' : 'Non'}, `;
    report += `Réel: ${result.actualBttsYes ? 'Oui' : 'Non'})\n`;
    report += `   Résultat: ${result.resultSuccess ? '✅' : '❌'}\n\n`;
  });

  report += '═══════════════════════════════════════════════════════════════\n';
  report += '                      CONCLUSION\n';
  report += '═══════════════════════════════════════════════════════════════\n\n';

  // Vérité sur la précision
  if (summary.overallAccuracy >= 70) {
    report += `✅ Le système atteint ${summary.overallAccuracy.toFixed(1)}% de précision.\n`;
    report += `   C'est très bon pour des prédictions sportives!\n\n`;
  } else if (summary.overallAccuracy >= 60) {
    report += `⚠️  Le système atteint ${summary.overallAccuracy.toFixed(1)}% de précision.\n`;
    report += `   C'est acceptable mais peut être amélioré.\n\n`;
  } else if (summary.overallAccuracy >= 50) {
    report += `⚠️  Le système atteint ${summary.overallAccuracy.toFixed(1)}% de précision.\n`;
    report += `   C'est légèrement mieux que le hasard (50%).\n\n`;
  } else {
    report += `❌ Le système atteint ${summary.overallAccuracy.toFixed(1)}% de précision.\n`;
    report += `   C'est MOINS BON que le hasard. Système à revoir!\n\n`;
  }

  report += `⚠️  RAPPEL IMPORTANT:\n`;
  report += `   • Aucun système ne peut atteindre 100% de précision\n`;
  report += `   • Le football est imprévisible par nature\n`;
  report += `   • Même à 70% de précision, 3 paris sur 10 seront perdus\n`;
  report += `   • La gestion de bankroll est CRUCIALE\n`;
  report += `   • Ne jamais parier plus que vous pouvez perdre\n\n`;

  report += `📝 Taille de l'échantillon: ${summary.totalMatches} matchs\n`;
  report += `   ⚠️  ${summary.totalMatches < 30 ? 'Échantillon TROP PETIT - Ajouter plus de matchs!' : ''}\n`;
  report += `   ⚠️  ${summary.totalMatches < 50 ? 'Échantillon petit - 50+ matchs recommandés' : ''}\n`;
  report += `   ✅ ${summary.totalMatches >= 50 ? 'Échantillon acceptable' : ''}\n`;
  report += `   🎉 ${summary.totalMatches >= 100 ? 'Échantillon excellent!' : ''}\n\n`;

  report += '═══════════════════════════════════════════════════════════════\n';

  return report;
}

/**
 * Retourne un rating textuel basé sur la précision
 */
function getAccuracyRating(accuracy: number): string {
  if (accuracy >= 80) return '🏆 EXCELLENT';
  if (accuracy >= 70) return '✅ TRÈS BON';
  if (accuracy >= 60) return '👍 BON';
  if (accuracy >= 50) return '⚠️  MOYEN';
  return '❌ FAIBLE';
}

/**
 * Backtest avec filtre ultra-conservateur
 */
export function runConservativeBacktest(minConfidence: number = 80): BacktestSummary {
  const allResults = runRealBacktest();

  // Filtrer seulement les matchs haute confiance
  const filteredResults = allResults.results.filter(r => r.confidence >= minConfidence);

  return calculateBacktestSummary(filteredResults);
}
