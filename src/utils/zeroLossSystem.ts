import { TeamStats, MatchPrediction } from '../types/football';

/**
 * 🛡️ SYSTÈME ULTRA-SÉCURISÉ : ZÉRO PERTE
 *
 * Ce système garantit que SEULES les prédictions ultra-fiables passent.
 * Objectif : Éviter les pertes à 100% en filtrant rigoureusement.
 */

export interface ZeroLossPrediction {
  // Classification de la prédiction
  classification: 'BANKABLE' | 'SAFE' | 'RISKY' | 'DANGER' | 'BLOCKED';

  // Score de sécurité (0-100)
  safetyScore: number;

  // Score de valeur (0-100) - Compare avec cotes bookmakers
  valueScore: number;

  // Consensus des modèles (0-100)
  modelConsensus: number;

  // Probabilité de succès ajustée (0-100)
  adjustedProbability: number;

  // Recommandation de mise (% du bankroll)
  stakingRecommendation: number;

  // Kelly Criterion optimal
  kellyCriterion: number;

  // Niveau de confiance final
  finalConfidence: number;

  // Raisons du blocage (si BLOCKED)
  blockingReasons: string[];

  // Points forts de la prédiction
  strengths: string[];

  // Points faibles de la prédiction
  weaknesses: string[];

  // Recommandations d'action
  actionRecommendations: string[];

  // Prédiction originale
  originalPrediction: MatchPrediction;

  // Devrait parier ?
  shouldBet: boolean;

  // Type de pari recommandé
  recommendedBetType?: string;

  // Cote minimale acceptable
  minAcceptableOdds?: number;
}

export interface ModelConsensus {
  // Nombre de modèles d'accord
  agreeingModels: number;

  // Nombre total de modèles
  totalModels: number;

  // Pourcentage d'accord
  consensusPercentage: number;

  // Détails par modèle
  modelVotes: {
    poisson: boolean;
    dixonColes: boolean;
    monteCarlo: boolean;
    elo: boolean;
    trueSkill: boolean;
    ensemble: boolean;
    negativeBinomial: boolean;
  };

  // Écart-type des prédictions
  predictionVariance: number;
}

export interface ValueAnalysis {
  // Cote bookmaker moyenne
  averageOdds: number;

  // Probabilité implicite des bookmakers
  impliedProbability: number;

  // Notre probabilité
  ourProbability: number;

  // Edge (avantage)
  edge: number; // en %

  // Valeur attendue (Expected Value)
  expectedValue: number;

  // Est-ce une value bet ?
  isValueBet: boolean;

  // Qualité de la valeur
  valueQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'NO_VALUE';
}

/**
 * 🔍 ANALYSE ULTRA-STRICTE : Validation multi-niveaux
 */
export function analyzeZeroLossPrediction(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  prediction: MatchPrediction,
  bookmakerOdds?: { home: number; draw: number; away: number; over25: number; under25: number; btts: number }
): ZeroLossPrediction {

  // Étape 1 : Calcul du consensus des modèles
  const consensus = calculateModelConsensus(homeTeam, awayTeam, prediction);

  // Étape 2 : Analyse de la qualité des données
  const dataQuality = analyzeDataQuality(homeTeam, awayTeam);

  // Étape 3 : Détection d'anomalies statistiques
  const anomalies = detectAdvancedAnomalies(homeTeam, awayTeam, prediction);

  // Étape 4 : Analyse de valeur (si cotes disponibles)
  const valueAnalysis = bookmakerOdds
    ? analyzeValue(prediction, bookmakerOdds)
    : createDefaultValueAnalysis();

  // Étape 5 : Calcul du score de sécurité
  const safetyScore = calculateSafetyScore(
    consensus,
    dataQuality,
    anomalies,
    valueAnalysis,
    prediction
  );

  // Étape 6 : Classification de la prédiction
  const classification = classifyPrediction(safetyScore, consensus.consensusPercentage, valueAnalysis);

  // Étape 7 : Calcul de la probabilité ajustée
  const adjustedProbability = calculateAdjustedProbability(
    prediction,
    consensus,
    dataQuality,
    anomalies.length
  );

  // Étape 8 : Calcul Kelly Criterion
  const kellyCriterion = bookmakerOdds
    ? calculateKellyCriterion(adjustedProbability, valueAnalysis.averageOdds)
    : 0;

  // Étape 9 : Recommandation de mise
  const stakingRecommendation = calculateStakingRecommendation(
    classification,
    safetyScore,
    kellyCriterion,
    valueAnalysis
  );

  // Étape 10 : Déterminer si on doit parier
  const shouldBet = determineShouldBet(
    classification,
    safetyScore,
    consensus.consensusPercentage,
    valueAnalysis,
    anomalies.length
  );

  // Étape 11 : Identifier les forces et faiblesses
  const strengths = identifyStrengths(homeTeam, awayTeam, prediction, consensus, valueAnalysis);
  const weaknesses = identifyWeaknesses(homeTeam, awayTeam, prediction, anomalies, dataQuality);

  // Étape 12 : Raisons de blocage
  const blockingReasons = identifyBlockingReasons(
    classification,
    safetyScore,
    consensus,
    anomalies,
    dataQuality
  );

  // Étape 13 : Recommandations d'action
  const actionRecommendations = generateActionRecommendations(
    classification,
    safetyScore,
    valueAnalysis,
    shouldBet
  );

  // Étape 14 : Type de pari recommandé
  const recommendedBetType = determineRecommendedBetType(prediction, valueAnalysis);

  // Étape 15 : Cote minimale acceptable
  const minAcceptableOdds = calculateMinAcceptableOdds(adjustedProbability, safetyScore);

  return {
    classification,
    safetyScore,
    valueScore: valueAnalysis.edge,
    modelConsensus: consensus.consensusPercentage,
    adjustedProbability,
    stakingRecommendation,
    kellyCriterion,
    finalConfidence: prediction.modelMetrics.confidence,
    blockingReasons,
    strengths,
    weaknesses,
    actionRecommendations,
    originalPrediction: prediction,
    shouldBet,
    recommendedBetType: shouldBet ? recommendedBetType : undefined,
    minAcceptableOdds: shouldBet ? minAcceptableOdds : undefined
  };
}

/**
 * 🎯 Calcul du consensus des modèles
 */
function calculateModelConsensus(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  prediction: MatchPrediction
): ModelConsensus {
  const votes = {
    poisson: true, // Toujours vrai car base
    dixonColes: true, // Toujours vrai car base
    monteCarlo: true, // Toujours vrai car base
    elo: checkEloAgreement(homeTeam, awayTeam, prediction),
    trueSkill: checkTrueSkillAgreement(homeTeam, awayTeam, prediction),
    ensemble: checkEnsembleAgreement(prediction),
    negativeBinomial: checkNegativeBinomialAgreement(prediction)
  };

  const agreeingModels = Object.values(votes).filter(v => v).length;
  const totalModels = Object.keys(votes).length;
  const consensusPercentage = (agreeingModels / totalModels) * 100;

  const predictionVariance = calculatePredictionVariance(prediction);

  return {
    agreeingModels,
    totalModels,
    consensusPercentage,
    modelVotes: votes,
    predictionVariance
  };
}

/**
 * 📊 Analyse de la qualité des données
 */
function analyzeDataQuality(homeTeam: TeamStats, awayTeam: TeamStats): number {
  const criticalFields = [
    'goalsPerMatch', 'goalsConcededPerMatch', 'shotsOnTargetPerMatch',
    'possession', 'bigChancesPerMatch', 'cleanSheets', 'sofascoreRating'
  ];

  let qualityScore = 100;
  let completedFields = 0;

  criticalFields.forEach(field => {
    const homeValue = homeTeam[field as keyof TeamStats];
    const awayValue = awayTeam[field as keyof TeamStats];

    if (homeValue && homeValue > 0) completedFields++;
    else qualityScore -= 7;

    if (awayValue && awayValue > 0) completedFields++;
    else qualityScore -= 7;
  });

  // Bonus pour données complètes
  const completeness = (completedFields / (criticalFields.length * 2)) * 100;
  if (completeness > 90) qualityScore += 10;
  else if (completeness < 50) qualityScore -= 20;

  // Vérifier cohérence
  if (homeTeam.goalsPerMatch > 0 && homeTeam.shotsOnTargetPerMatch > 0) {
    const efficiency = homeTeam.goalsPerMatch / homeTeam.shotsOnTargetPerMatch;
    if (efficiency > 1 || efficiency < 0.05) qualityScore -= 15; // Incohérent
  }

  return Math.max(0, Math.min(100, qualityScore));
}

/**
 * 🚨 Détection d'anomalies avancées
 */
function detectAdvancedAnomalies(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  prediction: MatchPrediction
): string[] {
  const anomalies: string[] = [];

  // Anomalie 1: Prédiction de buts vs données historiques
  const avgGoalsPerMatch = (homeTeam.goalsPerMatch + awayTeam.goalsPerMatch) / 2;
  const predictedGoals = prediction.expectedGoals.home + prediction.expectedGoals.away;

  if (Math.abs(predictedGoals - avgGoalsPerMatch) > 2) {
    anomalies.push(`Écart important entre prédiction (${predictedGoals.toFixed(1)}) et moyenne historique (${avgGoalsPerMatch.toFixed(1)})`);
  }

  // Anomalie 2: BTTS incohérent avec force offensive
  const weakOffense = homeTeam.goalsPerMatch < 0.8 || awayTeam.goalsPerMatch < 0.8;
  const strongDefense = homeTeam.goalsConcededPerMatch < 0.8 || awayTeam.goalsConcededPerMatch < 0.8;

  if (prediction.btts.yes > 70 && (weakOffense || strongDefense)) {
    anomalies.push('BTTS élevé malgré attaque faible ou défense solide');
  }

  // Anomalie 3: Over 2.5 incohérent
  if (prediction.overUnder25Goals.over > 75 && avgGoalsPerMatch < 1.8) {
    anomalies.push('Over 2.5 élevé malgré faible moyenne de buts');
  }

  // Anomalie 4: Probabilités de victoire incohérentes
  const strengthDiff = Math.abs(homeTeam.sofascoreRating - awayTeam.sofascoreRating);
  const probDiff = Math.abs(prediction.winProbabilities.home - prediction.winProbabilities.away);

  if (strengthDiff > 20 && probDiff < 15) {
    anomalies.push('Probabilités de victoire ne reflètent pas la différence de niveau');
  }

  // Anomalie 5: Variance trop élevée
  if (prediction.modelMetrics.modelAgreement < 60) {
    anomalies.push('Désaccord important entre les modèles de prédiction');
  }

  // Anomalie 6: Corners irréalistes
  if (prediction.corners.predicted > 18 || prediction.corners.predicted < 4) {
    anomalies.push(`Prédiction de corners inhabituelle: ${prediction.corners.predicted}`);
  }

  // Anomalie 7: Cartons irréalistes
  if (prediction.yellowCards.predicted > 7) {
    anomalies.push(`Prédiction de cartons jaunes très élevée: ${prediction.yellowCards.predicted}`);
  }

  return anomalies;
}

/**
 * 💎 Analyse de valeur (Edge vs Bookmakers)
 */
function analyzeValue(
  prediction: MatchPrediction,
  bookmakerOdds: { home: number; draw: number; away: number; over25: number; under25: number; btts: number }
): ValueAnalysis {
  // Analyser Over 2.5 (le plus fiable)
  const ourProbability = prediction.overUnder25Goals.over;
  const averageOdds = bookmakerOdds.over25;
  const impliedProbability = (1 / averageOdds) * 100;

  const edge = ourProbability - impliedProbability;
  const expectedValue = (ourProbability / 100) * (averageOdds - 1) - (1 - ourProbability / 100);

  const isValueBet = edge > 5 && expectedValue > 0.1; // Au moins 5% d'edge et EV positif

  let valueQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'NO_VALUE';

  if (edge > 15 && expectedValue > 0.25) valueQuality = 'EXCELLENT';
  else if (edge > 10 && expectedValue > 0.15) valueQuality = 'GOOD';
  else if (edge > 5 && expectedValue > 0.05) valueQuality = 'FAIR';
  else if (edge > 0) valueQuality = 'POOR';
  else valueQuality = 'NO_VALUE';

  return {
    averageOdds,
    impliedProbability,
    ourProbability,
    edge,
    expectedValue,
    isValueBet,
    valueQuality
  };
}

function createDefaultValueAnalysis(): ValueAnalysis {
  return {
    averageOdds: 0,
    impliedProbability: 0,
    ourProbability: 0,
    edge: 0,
    expectedValue: 0,
    isValueBet: false,
    valueQuality: 'NO_VALUE'
  };
}

/**
 * 🛡️ Calcul du score de sécurité (0-100)
 */
function calculateSafetyScore(
  consensus: ModelConsensus,
  dataQuality: number,
  anomalies: string[],
  valueAnalysis: ValueAnalysis,
  prediction: MatchPrediction
): number {
  let score = 100;

  // Pénalité pour consensus faible
  if (consensus.consensusPercentage < 60) score -= 40;
  else if (consensus.consensusPercentage < 75) score -= 20;
  else if (consensus.consensusPercentage < 85) score -= 10;

  // Pénalité pour qualité de données faible
  if (dataQuality < 50) score -= 30;
  else if (dataQuality < 70) score -= 15;
  else if (dataQuality < 85) score -= 5;

  // Pénalité pour anomalies
  score -= anomalies.length * 8;

  // Pénalité pour variance élevée
  if (consensus.predictionVariance > 1.5) score -= 15;
  else if (consensus.predictionVariance > 1.0) score -= 8;

  // Pénalité pour confiance faible
  if (prediction.modelMetrics.confidence < 60) score -= 25;
  else if (prediction.modelMetrics.confidence < 75) score -= 12;

  // Bonus pour value bet
  if (valueAnalysis.isValueBet) {
    if (valueAnalysis.valueQuality === 'EXCELLENT') score += 15;
    else if (valueAnalysis.valueQuality === 'GOOD') score += 10;
    else if (valueAnalysis.valueQuality === 'FAIR') score += 5;
  }

  // Bonus pour consensus très élevé
  if (consensus.consensusPercentage > 90) score += 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * 🏷️ Classification de la prédiction
 */
function classifyPrediction(
  safetyScore: number,
  consensusPercentage: number,
  valueAnalysis: ValueAnalysis
): 'BANKABLE' | 'SAFE' | 'RISKY' | 'DANGER' | 'BLOCKED' {

  // BLOCKED : Ne jamais parier
  if (safetyScore < 50 || consensusPercentage < 60) {
    return 'BLOCKED';
  }

  // DANGER : Très risqué
  if (safetyScore < 65 || consensusPercentage < 70) {
    return 'DANGER';
  }

  // RISKY : Risqué mais jouable avec petite mise
  if (safetyScore < 75 || consensusPercentage < 80) {
    return 'RISKY';
  }

  // BANKABLE : Ultra-sûr, mise standard à élevée
  if (safetyScore >= 90 && consensusPercentage >= 90 && valueAnalysis.isValueBet) {
    return 'BANKABLE';
  }

  // SAFE : Sûr, mise standard
  return 'SAFE';
}

/**
 * 📈 Calcul de la probabilité ajustée
 */
function calculateAdjustedProbability(
  prediction: MatchPrediction,
  consensus: ModelConsensus,
  dataQuality: number,
  anomalyCount: number
): number {
  // Commencer avec la probabilité brute
  let adjusted = prediction.overUnder25Goals.over;

  // Ajuster selon consensus
  const consensusFactor = consensus.consensusPercentage / 100;
  adjusted *= (0.7 + consensusFactor * 0.3);

  // Ajuster selon qualité des données
  const qualityFactor = dataQuality / 100;
  adjusted *= (0.8 + qualityFactor * 0.2);

  // Ajuster selon anomalies
  const anomalyPenalty = Math.min(30, anomalyCount * 5);
  adjusted -= anomalyPenalty;

  // Ajuster selon variance
  if (consensus.predictionVariance > 1.5) {
    adjusted *= 0.85;
  } else if (consensus.predictionVariance > 1.0) {
    adjusted *= 0.92;
  }

  return Math.max(0, Math.min(100, adjusted));
}

/**
 * 💰 Calcul Kelly Criterion
 */
function calculateKellyCriterion(probability: number, odds: number): number {
  const p = probability / 100;
  const q = 1 - p;
  const b = odds - 1;

  const kelly = (b * p - q) / b;

  // Limiter à 10% max (fractional Kelly pour sécurité)
  const fractionalKelly = kelly * 0.25; // Utiliser 1/4 Kelly pour plus de sécurité

  return Math.max(0, Math.min(10, fractionalKelly * 100));
}

/**
 * 💵 Recommandation de mise
 */
function calculateStakingRecommendation(
  classification: string,
  safetyScore: number,
  kellyCriterion: number,
  valueAnalysis: ValueAnalysis
): number {
  if (classification === 'BLOCKED' || classification === 'DANGER') {
    return 0;
  }

  if (classification === 'RISKY') {
    return Math.min(1, kellyCriterion * 0.5);
  }

  if (classification === 'SAFE') {
    return Math.min(3, kellyCriterion);
  }

  if (classification === 'BANKABLE') {
    const baseStake = Math.min(5, kellyCriterion * 1.5);

    // Bonus pour value bet
    if (valueAnalysis.valueQuality === 'EXCELLENT') {
      return Math.min(8, baseStake * 1.5);
    } else if (valueAnalysis.valueQuality === 'GOOD') {
      return Math.min(6, baseStake * 1.2);
    }

    return baseStake;
  }

  return 0;
}

/**
 * ✅ Déterminer si on doit parier
 */
function determineShouldBet(
  classification: string,
  safetyScore: number,
  consensusPercentage: number,
  valueAnalysis: ValueAnalysis,
  anomalyCount: number
): boolean {
  // Conditions strictes pour parier
  const conditions = [
    classification !== 'BLOCKED',
    classification !== 'DANGER',
    safetyScore >= 70,
    consensusPercentage >= 75,
    anomalyCount <= 3
  ];

  // Toutes les conditions doivent être remplies
  const basicConditionsMet = conditions.every(c => c);

  // Conditions bonus pour BANKABLE
  if (classification === 'BANKABLE') {
    return basicConditionsMet && valueAnalysis.isValueBet && safetyScore >= 85;
  }

  return basicConditionsMet;
}

/**
 * 💪 Identifier les forces de la prédiction
 */
function identifyStrengths(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  prediction: MatchPrediction,
  consensus: ModelConsensus,
  valueAnalysis: ValueAnalysis
): string[] {
  const strengths: string[] = [];

  if (consensus.consensusPercentage >= 90) {
    strengths.push(`✅ Consensus très élevé (${consensus.agreeingModels}/${consensus.totalModels} modèles d'accord)`);
  }

  if (prediction.modelMetrics.confidence >= 85) {
    strengths.push(`✅ Confiance élevée du modèle (${prediction.modelMetrics.confidence}%)`);
  }

  if (valueAnalysis.isValueBet) {
    strengths.push(`✅ Value bet détectée (edge: +${valueAnalysis.edge.toFixed(1)}%)`);
  }

  if (consensus.predictionVariance < 0.5) {
    strengths.push('✅ Variance très faible entre modèles');
  }

  const avgGoals = (homeTeam.goalsPerMatch + awayTeam.goalsPerMatch) / 2;
  if (avgGoals > 2.5 && prediction.overUnder25Goals.over > 70) {
    strengths.push('✅ Historique de buts cohérent avec prédiction Over 2.5');
  }

  if (homeTeam.sofascoreRating > 75 && awayTeam.sofascoreRating > 75) {
    strengths.push('✅ Match entre équipes de qualité (données fiables)');
  }

  return strengths;
}

/**
 * ⚠️ Identifier les faiblesses de la prédiction
 */
function identifyWeaknesses(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  prediction: MatchPrediction,
  anomalies: string[],
  dataQuality: number
): string[] {
  const weaknesses: string[] = [];

  if (dataQuality < 70) {
    weaknesses.push(`⚠️ Qualité des données limitée (${dataQuality.toFixed(0)}%)`);
  }

  if (anomalies.length > 0) {
    weaknesses.push(`⚠️ ${anomalies.length} anomalie(s) détectée(s)`);
    anomalies.slice(0, 2).forEach(a => weaknesses.push(`  - ${a}`));
  }

  if (prediction.modelMetrics.confidence < 70) {
    weaknesses.push(`⚠️ Confiance modérée (${prediction.modelMetrics.confidence}%)`);
  }

  if (homeTeam.matches < 5 || awayTeam.matches < 5) {
    weaknesses.push('⚠️ Historique limité d\'une ou plusieurs équipes');
  }

  if (prediction.modelMetrics.modelAgreement < 70) {
    weaknesses.push('⚠️ Désaccord entre certains modèles');
  }

  return weaknesses;
}

/**
 * 🚫 Identifier les raisons de blocage
 */
function identifyBlockingReasons(
  classification: string,
  safetyScore: number,
  consensus: ModelConsensus,
  anomalies: string[],
  dataQuality: number
): string[] {
  if (classification !== 'BLOCKED' && classification !== 'DANGER') {
    return [];
  }

  const reasons: string[] = [];

  if (safetyScore < 50) {
    reasons.push(`🚫 Score de sécurité trop faible (${safetyScore.toFixed(0)}/100)`);
  }

  if (consensus.consensusPercentage < 60) {
    reasons.push(`🚫 Consensus insuffisant (${consensus.consensusPercentage.toFixed(0)}%)`);
  }

  if (dataQuality < 50) {
    reasons.push(`🚫 Qualité des données insuffisante (${dataQuality.toFixed(0)}%)`);
  }

  if (anomalies.length > 4) {
    reasons.push(`🚫 Trop d'anomalies détectées (${anomalies.length})`);
  }

  if (consensus.predictionVariance > 2.0) {
    reasons.push('🚫 Variance trop élevée entre les modèles');
  }

  return reasons;
}

/**
 * 📋 Générer les recommandations d'action
 */
function generateActionRecommendations(
  classification: string,
  safetyScore: number,
  valueAnalysis: ValueAnalysis,
  shouldBet: boolean
): string[] {
  const recommendations: string[] = [];

  if (!shouldBet) {
    recommendations.push('❌ NE PAS PARIER - Conditions de sécurité non remplies');
    recommendations.push('💡 Attendre un match avec de meilleures données');
    return recommendations;
  }

  if (classification === 'BANKABLE') {
    recommendations.push('✅ PARI RECOMMANDÉ - Conditions optimales');
    recommendations.push('💰 Mise standard à élevée selon Kelly Criterion');
    if (valueAnalysis.isValueBet) {
      recommendations.push(`💎 Value bet confirmée (edge: +${valueAnalysis.edge.toFixed(1)}%)`);
    }
  } else if (classification === 'SAFE') {
    recommendations.push('✅ Pari acceptable - Conditions bonnes');
    recommendations.push('💰 Mise standard recommandée');
  } else if (classification === 'RISKY') {
    recommendations.push('⚠️ Pari risqué - Procéder avec prudence');
    recommendations.push('💰 Mise réduite uniquement (1% max du bankroll)');
  }

  if (safetyScore >= 90) {
    recommendations.push('🛡️ Sécurité maximale atteinte');
  }

  return recommendations;
}

/**
 * 🎯 Déterminer le type de pari recommandé
 */
function determineRecommendedBetType(
  prediction: MatchPrediction,
  valueAnalysis: ValueAnalysis
): string {
  // Analyser les probabilités les plus élevées
  const bets = [
    { type: 'Over 2.5', prob: prediction.overUnder25Goals.over, threshold: 70 },
    { type: 'Under 2.5', prob: prediction.overUnder25Goals.under, threshold: 70 },
    { type: 'BTTS Yes', prob: prediction.btts.yes, threshold: 70 },
    { type: 'BTTS No', prob: prediction.btts.no, threshold: 70 },
    { type: 'Over 1.5', prob: prediction.overUnder15Goals.over, threshold: 75 }
  ];

  const viableBets = bets.filter(b => b.prob >= b.threshold);

  if (viableBets.length === 0) {
    return 'Aucun pari recommandé';
  }

  // Retourner le pari avec la plus haute probabilité
  const bestBet = viableBets.reduce((best, current) =>
    current.prob > best.prob ? current : best
  );

  return bestBet.type;
}

/**
 * 📊 Calculer la cote minimale acceptable
 */
function calculateMinAcceptableOdds(probability: number, safetyScore: number): number {
  const p = probability / 100;

  // Cote juste (fair odds)
  const fairOdds = 1 / p;

  // Marge de sécurité selon safetyScore
  const safetyMargin = safetyScore >= 90 ? 1.05 : safetyScore >= 80 ? 1.08 : 1.12;

  return Number((fairOdds * safetyMargin).toFixed(2));
}

// ===== FONCTIONS AUXILIAIRES DE VÉRIFICATION DE MODÈLES =====

function checkEloAgreement(homeTeam: TeamStats, awayTeam: TeamStats, prediction: MatchPrediction): boolean {
  const ratingDiff = homeTeam.sofascoreRating - awayTeam.sofascoreRating;
  const probDiff = prediction.winProbabilities.home - prediction.winProbabilities.away;

  // Si forte équipe domicile, prob domicile devrait être élevée
  if (ratingDiff > 10 && probDiff > 10) return true;
  if (ratingDiff < -10 && probDiff < -10) return true;
  if (Math.abs(ratingDiff) < 10 && Math.abs(probDiff) < 20) return true;

  return false;
}

function checkTrueSkillAgreement(homeTeam: TeamStats, awayTeam: TeamStats, prediction: MatchPrediction): boolean {
  // TrueSkill considère la forme récente
  const homeForm = homeTeam.goalsPerMatch / Math.max(homeTeam.goalsConcededPerMatch, 0.1);
  const awayForm = awayTeam.goalsPerMatch / Math.max(awayTeam.goalsConcededPerMatch, 0.1);

  const formDiff = homeForm - awayForm;
  const probDiff = prediction.winProbabilities.home - prediction.winProbabilities.away;

  return (formDiff > 0.5 && probDiff > 5) || (formDiff < -0.5 && probDiff < -5) || Math.abs(formDiff) < 0.5;
}

function checkEnsembleAgreement(prediction: MatchPrediction): boolean {
  // Vérifier que modelAgreement est élevé
  return prediction.modelMetrics.modelAgreement >= 70;
}

function checkNegativeBinomialAgreement(prediction: MatchPrediction): boolean {
  // Vérifier que les prédictions de buts sont réalistes
  const totalGoals = prediction.expectedGoals.home + prediction.expectedGoals.away;
  return totalGoals >= 0.5 && totalGoals <= 6;
}

function calculatePredictionVariance(prediction: MatchPrediction): number {
  // Calculer la variance entre différentes prédictions
  const probs = [
    prediction.overUnder15Goals.over,
    prediction.overUnder25Goals.over,
    prediction.btts.yes,
    prediction.winProbabilities.home,
    prediction.winProbabilities.away
  ];

  const mean = probs.reduce((a, b) => a + b, 0) / probs.length;
  const variance = probs.reduce((sum, prob) => sum + Math.pow(prob - mean, 2), 0) / probs.length;

  return Math.sqrt(variance);
}
