/**
 * MOTEUR DE PRÉDICTION MAÎTRE
 *
 * Combine TOUS les systèmes pour des prédictions ultra-précises:
 * 1. Analyse statistique de base (Poisson, Dixon-Coles, Monte Carlo)
 * 2. Ratings SofaScore
 * 3. Contexte du match (enjeu, derby, etc.)
 * 4. Entraînement sur données historiques
 * 5. Profils de championnat appris
 * 6. Système zéro perte
 * 7. Validation multi-niveaux
 *
 * OBJECTIF: 95-99% DE PRÉCISION
 */

import { TeamStats, MatchPrediction, AnalysisResult } from '@/types/football';
import { MatchContext } from '@/types/matchContext';
import { analyzeMatch as baseAnalyze } from './footballAnalysis';
import { analyzeMatchEnhanced, EnhancedAnalysisResult } from './enhancedPredictionEngine';
import { getPredictionWithMLAdjustment, TRAINED_PATTERNS, LEAGUE_PROFILES } from './intelligentTrainingSystem';
import { analyzeZeroLossPrediction, ZeroLossPrediction } from './zeroLossSystem';
import { createDefaultMatchContext } from './enhancedPredictionEngine';

/**
 * Configuration de championnat
 */
export interface LeagueConfig {
  code: string; // Ex: 'PL', 'LL', 'BR', 'FI', etc.
  name: string;
  country: string;
  level: 'ELITE' | 'PROFESSIONAL' | 'SEMI_PROFESSIONAL' | 'AMATEUR';
}

/**
 * Résultat de prédiction ultra-complet
 */
export interface MasterPredictionResult {
  // Équipes
  homeTeam: TeamStats;
  awayTeam: TeamStats;

  // Prédictions à différents niveaux
  basePrediction: MatchPrediction; // Prédiction statistique de base
  enhancedPrediction: MatchPrediction; // Ajustée au contexte
  mlAdjustedPrediction: MatchPrediction; // Ajustée par ML/profil championnat
  finalPrediction: MatchPrediction; // Prédiction finale consolidée

  // Confiance
  baseConfidence: number;
  enhancedConfidence: number;
  finalConfidence: number;

  // Analyse complète
  enhancedAnalysis: EnhancedAnalysisResult;
  zeroLossAnalysis: ZeroLossPrediction;

  // Méta-données
  leagueConfig?: LeagueConfig;
  matchContext: MatchContext;

  // Recommandation finale
  recommendation: {
    decision: 'BET' | 'SKIP' | 'OBSERVE';
    reasoning: string[];
    riskLevel: 'SAFE' | 'MEDIUM' | 'HIGH';
    confidenceLevel: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  };
}

/**
 * Fonction principale: Analyse complète d'un match
 */
export function analyzeMaster(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  matchContext?: MatchContext,
  leagueConfig?: LeagueConfig
): MasterPredictionResult {
  // ===== ÉTAPE 1: ANALYSE STATISTIQUE DE BASE =====
  const baseAnalysis = baseAnalyze(homeTeam, awayTeam);
  const basePrediction = baseAnalysis.prediction;
  const baseConfidence = baseAnalysis.confidence;

  // ===== ÉTAPE 2: CONTEXTE DU MATCH =====
  const context = matchContext || createDefaultMatchContext();

  // ===== ÉTAPE 3: ANALYSE AMÉLIORÉE (SofaScore + Contexte + Historique) =====
  const enhancedAnalysis = analyzeMatchEnhanced(
    homeTeam,
    awayTeam,
    basePrediction,
    baseConfidence,
    context
  );

  const enhancedPrediction = enhancedAnalysis.prediction;
  const enhancedConfidence = enhancedAnalysis.confidence;

  // ===== ÉTAPE 4: AJUSTEMENT PAR ML (Profil championnat) =====
  let mlAdjustedPrediction = enhancedPrediction;

  if (leagueConfig && leagueConfig.code) {
    mlAdjustedPrediction = getPredictionWithMLAdjustment(
      enhancedPrediction,
      leagueConfig.code
    );
  }

  // ===== ÉTAPE 5: CONSOLIDATION FINALE =====
  // On fait une moyenne pondérée des prédictions
  const finalPrediction = consolidatePredictions(
    basePrediction,
    enhancedPrediction,
    mlAdjustedPrediction
  );

  // Confiance finale (moyenne pondérée)
  const finalConfidence = (baseConfidence * 0.3 + enhancedConfidence * 0.4 + enhancedConfidence * 0.3);

  // ===== ÉTAPE 6: ANALYSE ZÉRO PERTE =====
  const zeroLossAnalysis = analyzeZeroLossPrediction(
    homeTeam,
    awayTeam,
    finalPrediction,
    {
      over25: finalPrediction.overUnder25Goals.over / 100,
      under25: finalPrediction.overUnder25Goals.under / 100,
      btts: finalPrediction.btts.yes / 100,
    }
  );

  // ===== ÉTAPE 7: DÉCISION FINALE =====
  const recommendation = makeRecommendation(
    finalPrediction,
    finalConfidence,
    zeroLossAnalysis,
    enhancedAnalysis
  );

  return {
    homeTeam,
    awayTeam,
    basePrediction,
    enhancedPrediction,
    mlAdjustedPrediction,
    finalPrediction,
    baseConfidence,
    enhancedConfidence,
    finalConfidence,
    enhancedAnalysis,
    zeroLossAnalysis,
    leagueConfig,
    matchContext: context,
    recommendation,
  };
}

/**
 * Consolidation de 3 prédictions en une seule
 */
function consolidatePredictions(
  base: MatchPrediction,
  enhanced: MatchPrediction,
  ml: MatchPrediction
): MatchPrediction {
  // Copie profonde
  const final: MatchPrediction = JSON.parse(JSON.stringify(enhanced));

  // Moyenne pondérée des buts attendus
  final.expectedGoals.home = (
    base.expectedGoals.home * 0.25 +
    enhanced.expectedGoals.home * 0.45 +
    ml.expectedGoals.home * 0.30
  );

  final.expectedGoals.away = (
    base.expectedGoals.away * 0.25 +
    enhanced.expectedGoals.away * 0.45 +
    ml.expectedGoals.away * 0.30
  );

  // Moyenne pondérée des corners
  final.corners.predicted = (
    base.corners.predicted * 0.25 +
    enhanced.corners.predicted * 0.45 +
    ml.corners.predicted * 0.30
  );

  // Moyenne pondérée des fautes
  final.fouls.predicted = (
    base.fouls.predicted * 0.25 +
    enhanced.fouls.predicted * 0.45 +
    ml.fouls.predicted * 0.30
  );

  // Moyenne pondérée des cartons
  final.yellowCards.predicted = (
    base.yellowCards.predicted * 0.25 +
    enhanced.yellowCards.predicted * 0.45 +
    ml.yellowCards.predicted * 0.30
  );

  // Over/Under 2.5: Prendre la prédiction avec la plus haute confiance
  const totalGoals = final.expectedGoals.home + final.expectedGoals.away;

  if (totalGoals > 2.7) {
    final.overUnder25Goals.prediction = 'OVER';
    final.overUnder25Goals.over = Math.max(enhanced.overUnder25Goals.over, ml.overUnder25Goals.over);
    final.overUnder25Goals.under = 100 - final.overUnder25Goals.over;
  } else if (totalGoals < 2.3) {
    final.overUnder25Goals.prediction = 'UNDER';
    final.overUnder25Goals.under = Math.max(enhanced.overUnder25Goals.under, ml.overUnder25Goals.under);
    final.overUnder25Goals.over = 100 - final.overUnder25Goals.under;
  } else {
    // Zone grise: prendre la moyenne
    final.overUnder25Goals.over = (enhanced.overUnder25Goals.over + ml.overUnder25Goals.over) / 2;
    final.overUnder25Goals.under = 100 - final.overUnder25Goals.over;
    final.overUnder25Goals.prediction = final.overUnder25Goals.over > 50 ? 'OVER' : 'UNDER';
  }

  // BTTS: Même logique
  final.btts.yes = (enhanced.btts.yes + ml.btts.yes) / 2;
  final.btts.no = 100 - final.btts.yes;
  final.btts.prediction = final.btts.yes > 50 ? 'YES' : 'NO';

  return final;
}

/**
 * Décision finale: Parier ou non?
 */
function makeRecommendation(
  prediction: MatchPrediction,
  confidence: number,
  zeroLoss: ZeroLossPrediction,
  enhanced: EnhancedAnalysisResult
): {
  decision: 'BET' | 'SKIP' | 'OBSERVE';
  reasoning: string[];
  riskLevel: 'SAFE' | 'MEDIUM' | 'HIGH';
  confidenceLevel: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
} {
  const reasoning: string[] = [];
  let decision: 'BET' | 'SKIP' | 'OBSERVE' = 'OBSERVE';
  let riskLevel: 'SAFE' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
  let confidenceLevel: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';

  // Niveau de confiance
  if (confidence >= 90) {
    confidenceLevel = 'VERY_HIGH';
  } else if (confidence >= 80) {
    confidenceLevel = 'HIGH';
  } else if (confidence >= 70) {
    confidenceLevel = 'MEDIUM';
  } else {
    confidenceLevel = 'LOW';
  }

  // Classification zéro perte
  const zlClass = zeroLoss.classification;

  if (zlClass === 'BLOCKED') {
    decision = 'SKIP';
    riskLevel = 'HIGH';
    reasoning.push('❌ BLOQUÉ par le système zéro perte');
    reasoning.push(`Score de sécurité trop bas: ${zeroLoss.safetyScore}/100`);
  } else if (zlClass === 'BANKABLE') {
    decision = 'BET';
    riskLevel = 'SAFE';
    reasoning.push('✅ BANKABLE - Score de sécurité élevé');
    reasoning.push(`Consensus des modèles: ${zeroLoss.modelConsensus.toFixed(1)}%`);
    reasoning.push(`Confiance: ${confidence.toFixed(1)}%`);
  } else if (zlClass === 'SAFE') {
    if (confidence >= 85) {
      decision = 'BET';
      riskLevel = 'SAFE';
      reasoning.push('✅ SÛRE - Bonne confiance et sécurité');
    } else {
      decision = 'OBSERVE';
      riskLevel = 'MEDIUM';
      reasoning.push('⚠️ Confiance modérée - Observer avant de parier');
    }
  } else if (zlClass === 'RISKY') {
    decision = 'OBSERVE';
    riskLevel = 'MEDIUM';
    reasoning.push('⚠️ RISQUÉ - Prudence recommandée');
    reasoning.push('Observer l\'évolution des cotes');
  } else if (zlClass === 'DANGER') {
    decision = 'SKIP';
    riskLevel = 'HIGH';
    reasoning.push('❌ DANGER - Ne pas parier');
    reasoning.push('Risques élevés détectés');
  }

  // Recommandations contextuelles
  if (enhanced.contextualRecommendations) {
    enhanced.contextualRecommendations.forEach(rec => {
      if (rec.includes('Variance élevée') || rec.includes('Imprévisibilité')) {
        if (decision === 'BET') {
          decision = 'OBSERVE';
        }
        riskLevel = 'HIGH';
      }
    });
  }

  // Vérifier la qualité des données
  if (enhanced.dataQuality) {
    const dataScore = enhanced.dataQuality.overall;
    if (dataScore < 60) {
      reasoning.push(`⚠️ Données incomplètes (${dataScore}/100)`);
      if (decision === 'BET') {
        decision = 'OBSERVE';
      }
    }
  }

  return {
    decision,
    reasoning,
    riskLevel,
    confidenceLevel,
  };
}

/**
 * Génère un rapport complet de la prédiction maître
 */
export function generateMasterReport(result: MasterPredictionResult): string {
  let report = '';

  report += `\n${'='.repeat(90)}\n`;
  report += `🎯 ANALYSE COMPLÈTE MAÎTRE: ${result.homeTeam.name} vs ${result.awayTeam.name}\n`;
  report += `${'='.repeat(90)}\n\n`;

  // Championnat
  if (result.leagueConfig) {
    report += `🏆 CHAMPIONNAT: ${result.leagueConfig.name} (${result.leagueConfig.country})\n`;
    report += `   Niveau: ${result.leagueConfig.level}\n\n`;
  }

  // Contexte
  report += `📋 CONTEXTE:\n`;
  report += `   Enjeu: ${result.matchContext.importance}\n`;
  report += `   Derby: ${result.matchContext.isDerby ? 'OUI' : 'NON'}\n`;
  if (result.matchContext.isDerby && result.matchContext.rivalryIntensity) {
    report += `   Intensité rivalité: ${result.matchContext.rivalryIntensity}\n`;
  }
  report += `\n`;

  // Ratings SofaScore
  report += `📊 RATINGS SOFASCORE:\n`;
  report += `   ${result.homeTeam.name}: ${result.enhancedAnalysis.sofascoreRatings.home.toFixed(1)}/10\n`;
  report += `   ${result.awayTeam.name}: ${result.enhancedAnalysis.sofascoreRatings.away.toFixed(1)}/10\n`;
  report += `   Avantage: ${result.enhancedAnalysis.sofascoreRatings.advantage}\n\n`;

  // Prédictions finales
  report += `⚽ PRÉDICTIONS FINALES:\n`;
  report += `   Buts attendus: ${result.finalPrediction.expectedGoals.home.toFixed(2)} - ${result.finalPrediction.expectedGoals.away.toFixed(2)}\n`;
  report += `   Total: ${(result.finalPrediction.expectedGoals.home + result.finalPrediction.expectedGoals.away).toFixed(2)}\n\n`;

  report += `   Over/Under 2.5: ${result.finalPrediction.overUnder25Goals.prediction}\n`;
  report += `   Probabilité: ${result.finalPrediction.overUnder25Goals[result.finalPrediction.overUnder25Goals.prediction.toLowerCase() as 'over' | 'under'].toFixed(1)}%\n\n`;

  report += `   BTTS: ${result.finalPrediction.btts.prediction}\n`;
  report += `   Probabilité: ${result.finalPrediction.btts[result.finalPrediction.btts.prediction.toLowerCase() as 'yes' | 'no'].toFixed(1)}%\n\n`;

  report += `   Corners: ${result.finalPrediction.corners.predicted.toFixed(1)}\n`;
  report += `   Fautes: ${result.finalPrediction.fouls.predicted.toFixed(1)}\n`;
  report += `   Cartons jaunes: ${result.finalPrediction.yellowCards.predicted.toFixed(1)}\n\n`;

  // Analyse zéro perte
  report += `🛡️ ANALYSE ZÉRO PERTE:\n`;
  report += `   Classification: ${result.zeroLossAnalysis.classification}\n`;
  report += `   Score de sécurité: ${result.zeroLossAnalysis.safetyScore}/100\n`;
  report += `   Consensus modèles: ${result.zeroLossAnalysis.modelConsensus.toFixed(1)}%\n`;
  report += `   Score de valeur: ${result.zeroLossAnalysis.valueScore}/100\n\n`;

  // Confiance
  report += `📈 NIVEAUX DE CONFIANCE:\n`;
  report += `   Base: ${result.baseConfidence.toFixed(1)}%\n`;
  report += `   Améliorée: ${result.enhancedConfidence.toFixed(1)}%\n`;
  report += `   Finale: ${result.finalConfidence.toFixed(1)}%\n\n`;

  // Recommandation finale
  report += `💡 RECOMMANDATION FINALE:\n`;
  report += `   Décision: ${result.recommendation.decision}\n`;
  report += `   Niveau de risque: ${result.recommendation.riskLevel}\n`;
  report += `   Niveau de confiance: ${result.recommendation.confidenceLevel}\n\n`;

  report += `   Raisons:\n`;
  result.recommendation.reasoning.forEach(reason => {
    report += `      • ${reason}\n`;
  });
  report += `\n`;

  // Recommandations contextuelles
  if (result.enhancedAnalysis.contextualRecommendations && result.enhancedAnalysis.contextualRecommendations.length > 0) {
    report += `⚠️ RECOMMANDATIONS CONTEXTUELLES:\n`;
    result.enhancedAnalysis.contextualRecommendations.forEach(rec => {
      report += `   ${rec}\n`;
    });
    report += `\n`;
  }

  report += `${'='.repeat(90)}\n`;

  return report;
}

/**
 * Liste de tous les championnats supportés
 */
export const SUPPORTED_LEAGUES: LeagueConfig[] = [
  // Europe - Top 5
  { code: 'PL', name: 'Premier League', country: 'Angleterre', level: 'ELITE' },
  { code: 'LL', name: 'La Liga', country: 'Espagne', level: 'ELITE' },
  { code: 'BL', name: 'Bundesliga', country: 'Allemagne', level: 'ELITE' },
  { code: 'SA', name: 'Serie A', country: 'Italie', level: 'ELITE' },
  { code: 'L1', name: 'Ligue 1', country: 'France', level: 'ELITE' },

  // Europe - Autres ligues majeures
  { code: 'PT', name: 'Primeira Liga', country: 'Portugal', level: 'PROFESSIONAL' },
  { code: 'NL', name: 'Eredivisie', country: 'Pays-Bas', level: 'PROFESSIONAL' },
  { code: 'BE', name: 'Jupiler Pro League', country: 'Belgique', level: 'PROFESSIONAL' },
  { code: 'TR', name: 'Süper Lig', country: 'Turquie', level: 'PROFESSIONAL' },
  { code: 'SC', name: 'Scottish Premiership', country: 'Écosse', level: 'PROFESSIONAL' },

  // Scandinavie
  { code: 'NO', name: 'Eliteserien', country: 'Norvège', level: 'PROFESSIONAL' },
  { code: 'SE', name: 'Allsvenskan', country: 'Suède', level: 'PROFESSIONAL' },
  { code: 'DK', name: 'Superliga', country: 'Danemark', level: 'PROFESSIONAL' },
  { code: 'FI', name: 'Veikkausliiga', country: 'Finlande', level: 'SEMI_PROFESSIONAL' },

  // Europe de l'Est & Méditerranée
  { code: 'GR', name: 'Super League', country: 'Grèce', level: 'PROFESSIONAL' },
  { code: 'IL', name: 'Premier League', country: 'Israël', level: 'PROFESSIONAL' },

  // Amériques
  { code: 'BR', name: 'Série A', country: 'Brésil', level: 'PROFESSIONAL' },
  { code: 'AR', name: 'Primera División', country: 'Argentine', level: 'PROFESSIONAL' },
  { code: 'MLS', name: 'MLS', country: 'USA', level: 'PROFESSIONAL' },

  // Asie
  { code: 'JP', name: 'J1 League', country: 'Japon', level: 'PROFESSIONAL' },
];
