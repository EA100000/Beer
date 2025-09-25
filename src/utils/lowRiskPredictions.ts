import { TeamStats, MatchPrediction } from '../types/football';

// Interface pour les prédictions à faible risque
export interface LowRiskPrediction {
  type: string;
  description: string;
  confidence: number;
  riskLevel: 'VERY_LOW' | 'LOW' | 'MEDIUM';
  expectedValue: number;
  reasoning: string;
  dataPoints: string[];
}

// Interface pour les prédictions combinées
export interface CombinedPrediction {
  primary: LowRiskPrediction;
  secondary: LowRiskPrediction[];
  overallConfidence: number;
  riskAssessment: string;
  recommendedStakes: number; // Pourcentage du bankroll
}

// Analyse des patterns de données pour identifier les prédictions sûres
export function analyzeLowRiskPatterns(homeTeam: TeamStats, awayTeam: TeamStats, prediction: MatchPrediction): LowRiskPrediction[] {
  const predictions: LowRiskPrediction[] = [];

  // 1. PRÉDICTION BASÉE SUR LA POSSESSION
  if (homeTeam.possession > 0 && awayTeam.possession > 0) {
    const possessionDiff = Math.abs(homeTeam.possession - awayTeam.possession);
    if (possessionDiff > 15) {
      const strongerTeam = homeTeam.possession > awayTeam.possession ? 'Domicile' : 'Extérieur';
      predictions.push({
        type: 'POSSESSION_DOMINANCE',
        description: `L'équipe ${strongerTeam} dominera probablement la possession`,
        confidence: Math.min(85, 60 + possessionDiff * 1.5),
        riskLevel: 'LOW',
        expectedValue: 0.15,
        reasoning: `Différence de possession de ${possessionDiff}% entre les équipes`,
        dataPoints: ['possession', 'accuracyPerMatch']
      });
    }
  }

  // 2. PRÉDICTION BASÉE SUR LES TIRS CADRÉS
  if (homeTeam.shotsOnTargetPerMatch > 0 && awayTeam.shotsOnTargetPerMatch > 0) {
    const totalShotsOnTarget = prediction.advancedMetrics.expectedShotsOnTarget;
    if (totalShotsOnTarget > 12) {
      predictions.push({
        type: 'HIGH_SHOTS_ON_TARGET',
        description: 'Plus de 12 tirs cadrés attendus',
        confidence: Math.min(80, 50 + (totalShotsOnTarget - 12) * 3),
        riskLevel: 'LOW',
        expectedValue: 0.12,
        reasoning: `Les deux équipes ont des moyennes élevées de tirs cadrés`,
        dataPoints: ['shotsOnTargetPerMatch', 'bigChancesPerMatch']
      });
    }
  }

  // 3. PRÉDICTION BASÉE SUR LA DÉFENSE
  if (homeTeam.cleanSheets > 0 && awayTeam.cleanSheets > 0) {
    const totalCleanSheets = homeTeam.cleanSheets + awayTeam.cleanSheets;
    const totalMatches = homeTeam.matches + awayTeam.matches;
    const cleanSheetRate = totalCleanSheets / totalMatches;
    
    if (cleanSheetRate > 0.3) {
      predictions.push({
        type: 'DEFENSIVE_MATCH',
        description: 'Match probablement défensif avec peu de buts',
        confidence: Math.min(75, 40 + cleanSheetRate * 100),
        riskLevel: 'LOW',
        expectedValue: 0.10,
        reasoning: `Taux de clean sheets élevé (${(cleanSheetRate * 100).toFixed(1)}%)`,
        dataPoints: ['cleanSheets', 'goalsConcededPerMatch']
      });
    }
  }

  // 4. PRÉDICTION BASÉE SUR LA PRÉCISION
  if (homeTeam.accuracyPerMatch > 0 && awayTeam.accuracyPerMatch > 0) {
    const accuracyDiff = Math.abs(homeTeam.accuracyPerMatch - awayTeam.accuracyPerMatch);
    if (accuracyDiff > 10) {
      const moreAccurateTeam = homeTeam.accuracyPerMatch > awayTeam.accuracyPerMatch ? 'Domicile' : 'Extérieur';
      predictions.push({
        type: 'ACCURACY_ADVANTAGE',
        description: `L'équipe ${moreAccurateTeam} sera plus précise dans ses passes`,
        confidence: Math.min(80, 55 + accuracyDiff * 2),
        riskLevel: 'LOW',
        expectedValue: 0.08,
        reasoning: `Différence de précision de ${accuracyDiff.toFixed(1)}%`,
        dataPoints: ['accuracyPerMatch', 'possession']
      });
    }
  }

  // 5. PRÉDICTION BASÉE SUR LES INTERCEPTIONS (si données disponibles)
  if (homeTeam.interceptionsPerMatch > 0 && awayTeam.interceptionsPerMatch > 0) {
    const totalInterceptions = (homeTeam.interceptionsPerMatch + awayTeam.interceptionsPerMatch) * 0.5;
    if (totalInterceptions > 10) {
      predictions.push({
        type: 'HIGH_INTERCEPTIONS',
        description: 'Plus de 10 interceptions attendues',
        confidence: Math.min(75, 45 + (totalInterceptions - 10) * 3),
        riskLevel: 'LOW',
        expectedValue: 0.07,
        reasoning: `Moyenne élevée d'interceptions par match`,
        dataPoints: ['interceptionsPerMatch', 'tacklesPerMatch']
      });
    }
  }

  // 6. PRÉDICTION BASÉE SUR LES CARTONS (si données disponibles)
  if (homeTeam.yellowCardsPerMatch > 0 && awayTeam.yellowCardsPerMatch > 0) {
    const totalYellowCards = prediction.yellowCards.predicted;
    if (totalYellowCards > 4) {
      predictions.push({
        type: 'HIGH_YELLOW_CARDS',
        description: 'Plus de 4 cartons jaunes attendus',
        confidence: Math.min(70, 40 + (totalYellowCards - 4) * 5),
        riskLevel: 'MEDIUM',
        expectedValue: 0.05,
        reasoning: `Les deux équipes ont tendance à recevoir des cartons`,
        dataPoints: ['yellowCardsPerMatch', 'fouls']
      });
    }
  }

  // 7. PRÉDICTION BASÉE SUR LA FORCE GÉNÉRALE
  const homeStrength = prediction.modelMetrics.homeStrength;
  const awayStrength = prediction.modelMetrics.awayStrength;
  const strengthDiff = Math.abs(homeStrength - awayStrength);
  
  if (strengthDiff > 20) {
    const strongerTeam = homeStrength > awayStrength ? 'Domicile' : 'Extérieur';
    predictions.push({
      type: 'STRENGTH_DOMINANCE',
      description: `L'équipe ${strongerTeam} est significativement plus forte`,
      confidence: Math.min(85, 60 + strengthDiff * 0.8),
      riskLevel: 'LOW',
      expectedValue: 0.18,
      reasoning: `Différence de force de ${strengthDiff} points`,
      dataPoints: ['sofascoreRating', 'goalsPerMatch', 'goalsConcededPerMatch']
    });
  }

  // 8. PRÉDICTION BASÉE SUR L'INTENSITÉ DU MATCH
  const intensityScore = prediction.advancedMetrics.intensityScore;
  if (intensityScore > 60) {
    predictions.push({
      type: 'HIGH_INTENSITY_MATCH',
      description: 'Match à haute intensité attendu',
      confidence: Math.min(75, 50 + (intensityScore - 60) * 0.5),
      riskLevel: 'LOW',
      expectedValue: 0.12,
      reasoning: `Score d'intensité élevé (${intensityScore}/100)`,
      dataPoints: ['goalsPerMatch', 'shotsOnTargetPerMatch', 'bigChancesPerMatch']
    });
  }

  // 9. PRÉDICTION BASÉE SUR LA VALEUR DU MATCH
  const valueRating = prediction.advancedMetrics.valueRating;
  if (valueRating > 70) {
    predictions.push({
      type: 'HIGH_VALUE_MATCH',
      description: 'Match à haute valeur prédictive',
      confidence: Math.min(90, 60 + (valueRating - 70) * 1.5),
      riskLevel: 'VERY_LOW',
      expectedValue: 0.20,
      reasoning: `Note de valeur élevée (${valueRating}/100)`,
      dataPoints: ['modelMetrics.confidence', 'statisticalSignificance']
    });
  }

  // 10. PRÉDICTION BASÉE SUR LA COHÉRENCE DES DONNÉES
  const dataQuality = prediction.modelMetrics.dataQuality;
  const modelAgreement = prediction.modelMetrics.modelAgreement;
  
  if (dataQuality > 80 && modelAgreement > 85) {
    predictions.push({
      type: 'RELIABLE_PREDICTION',
      description: 'Prédiction très fiable basée sur des données cohérentes',
      confidence: Math.min(95, (dataQuality + modelAgreement) / 2),
      riskLevel: 'VERY_LOW',
      expectedValue: 0.25,
      reasoning: `Qualité des données: ${dataQuality}%, Accord des modèles: ${modelAgreement}%`,
      dataPoints: ['dataQuality', 'modelAgreement', 'confidence']
    });
  }

  // 11. PRÉDICTIONS ALTERNATIVES POUR DONNÉES LIMITÉES
  
  // 11.1. Prédiction basée sur le ratio buts marqués/encaissés
  if (homeTeam.goalsPerMatch > 0 && homeTeam.goalsConcededPerMatch > 0 && 
      awayTeam.goalsPerMatch > 0 && awayTeam.goalsConcededPerMatch > 0) {
    const homeRatio = homeTeam.goalsPerMatch / homeTeam.goalsConcededPerMatch;
    const awayRatio = awayTeam.goalsPerMatch / awayTeam.goalsConcededPerMatch;
    const ratioDiff = Math.abs(homeRatio - awayRatio);
    
    if (ratioDiff > 0.5) {
      const betterTeam = homeRatio > awayRatio ? 'Domicile' : 'Extérieur';
      predictions.push({
        type: 'GOAL_RATIO_ADVANTAGE',
        description: `L'équipe ${betterTeam} a un meilleur ratio buts marqués/encaissés`,
        confidence: Math.min(80, 60 + ratioDiff * 20),
        riskLevel: 'LOW',
        expectedValue: 0.12,
        reasoning: `Différence de ratio de ${ratioDiff.toFixed(2)} entre les équipes`,
        dataPoints: ['goalsPerMatch', 'goalsConcededPerMatch']
      });
    }
  }

  // 11.2. Prédiction basée sur la différence de rating
  if (homeTeam.sofascoreRating > 0 && awayTeam.sofascoreRating > 0) {
    const ratingDiff = Math.abs(homeTeam.sofascoreRating - awayTeam.sofascoreRating);
    if (ratingDiff > 15) {
      const betterTeam = homeTeam.sofascoreRating > awayTeam.sofascoreRating ? 'Domicile' : 'Extérieur';
      predictions.push({
        type: 'RATING_ADVANTAGE',
        description: `L'équipe ${betterTeam} a un rating significativement plus élevé`,
        confidence: Math.min(85, 65 + ratingDiff * 1.2),
        riskLevel: 'LOW',
        expectedValue: 0.15,
        reasoning: `Différence de rating de ${ratingDiff} points`,
        dataPoints: ['sofascoreRating']
      });
    }
  }

  // 11.3. Prédiction basée sur le nombre de matchs joués
  if (homeTeam.matches > 0 && awayTeam.matches > 0) {
    const totalMatches = homeTeam.matches + awayTeam.matches;
    if (totalMatches > 20) {
      predictions.push({
        type: 'SUFFICIENT_DATA',
        description: 'Données suffisantes pour une prédiction fiable',
        confidence: Math.min(75, 50 + totalMatches * 1.5),
        riskLevel: 'LOW',
        expectedValue: 0.08,
        reasoning: `Total de ${totalMatches} matchs analysés`,
        dataPoints: ['matches']
      });
    }
  }

  // 11.4. Prédiction basée sur les grosses occasions
  if (homeTeam.bigChancesPerMatch > 0 && awayTeam.bigChancesPerMatch > 0) {
    const totalBigChances = (homeTeam.bigChancesPerMatch + awayTeam.bigChancesPerMatch) * 0.5;
    if (totalBigChances > 3) {
      predictions.push({
        type: 'HIGH_BIG_CHANCES',
        description: 'Plus de 3 grosses occasions attendues',
        confidence: Math.min(70, 45 + (totalBigChances - 3) * 8),
        riskLevel: 'LOW',
        expectedValue: 0.10,
        reasoning: `Moyenne élevée de grosses occasions par match`,
        dataPoints: ['bigChancesPerMatch']
      });
    }
  }

  // 11.5. Prédiction basée sur la possession et la précision combinées
  if (homeTeam.possession > 0 && homeTeam.accuracyPerMatch > 0 && 
      awayTeam.possession > 0 && awayTeam.accuracyPerMatch > 0) {
    const homeControl = (homeTeam.possession + homeTeam.accuracyPerMatch) / 2;
    const awayControl = (awayTeam.possession + awayTeam.accuracyPerMatch) / 2;
    const controlDiff = Math.abs(homeControl - awayControl);
    
    if (controlDiff > 15) {
      const betterTeam = homeControl > awayControl ? 'Domicile' : 'Extérieur';
      predictions.push({
        type: 'CONTROL_ADVANTAGE',
        description: `L'équipe ${betterTeam} contrôlera mieux le jeu`,
        confidence: Math.min(75, 55 + controlDiff * 1.2),
        riskLevel: 'LOW',
        expectedValue: 0.09,
        reasoning: `Différence de contrôle de ${controlDiff.toFixed(1)} points`,
        dataPoints: ['possession', 'accuracyPerMatch']
      });
    }
  }

  // 12. NOUVELLES PRÉDICTIONS BASÉES SUR LES NOUVELLES DONNÉES

  // 12.1. Prédiction basée sur les duels remportés
  if (homeTeam.duelsWonPerMatch > 0 && awayTeam.duelsWonPerMatch > 0) {
    const totalDuels = (homeTeam.duelsWonPerMatch + awayTeam.duelsWonPerMatch) * 0.5;
    if (totalDuels > 50) {
      predictions.push({
        type: 'HIGH_DUELS',
        description: 'Plus de 50 duels remportés attendus',
        confidence: Math.min(75, 50 + (totalDuels - 50) * 1.5),
        riskLevel: 'LOW',
        expectedValue: 0.08,
        reasoning: `Moyenne élevée de duels remportés par match`,
        dataPoints: ['duelsWonPerMatch']
      });
    }
  }

  // 12.2. Prédiction basée sur les hors-jeux
  if (homeTeam.offsidesPerMatch > 0 && awayTeam.offsidesPerMatch > 0) {
    const totalOffsides = (homeTeam.offsidesPerMatch + awayTeam.offsidesPerMatch) * 0.5;
    if (totalOffsides > 4) {
      predictions.push({
        type: 'HIGH_OFFSIDES',
        description: 'Plus de 4 hors-jeux attendus',
        confidence: Math.min(70, 45 + (totalOffsides - 4) * 6),
        riskLevel: 'LOW',
        expectedValue: 0.06,
        reasoning: `Moyenne élevée de hors-jeux par match`,
        dataPoints: ['offsidesPerMatch']
      });
    }
  }

  // 12.3. Prédiction basée sur les coups de pied de but
  if (homeTeam.goalKicksPerMatch > 0 && awayTeam.goalKicksPerMatch > 0) {
    const totalGoalKicks = (homeTeam.goalKicksPerMatch + awayTeam.goalKicksPerMatch) * 0.5;
    if (totalGoalKicks > 10) {
      predictions.push({
        type: 'HIGH_GOAL_KICKS',
        description: 'Plus de 10 coups de pied de but attendus',
        confidence: Math.min(72, 48 + (totalGoalKicks - 10) * 2.4),
        riskLevel: 'LOW',
        expectedValue: 0.07,
        reasoning: `Moyenne élevée de coups de pied de but par match`,
        dataPoints: ['goalKicksPerMatch']
      });
    }
  }

  // 12.4. Prédiction basée sur les cartons rouges
  if (homeTeam.redCardsPerMatch > 0 && awayTeam.redCardsPerMatch > 0) {
    const totalRedCards = (homeTeam.redCardsPerMatch + awayTeam.redCardsPerMatch) * 0.5;
    if (totalRedCards > 0.3) {
      predictions.push({
        type: 'HIGH_RED_CARDS',
        description: 'Carton rouge probable',
        confidence: Math.min(65, 40 + totalRedCards * 50),
        riskLevel: 'MEDIUM',
        expectedValue: 0.12,
        reasoning: `Moyenne élevée de cartons rouges par match`,
        dataPoints: ['redCardsPerMatch']
      });
    }
  }

  // 12.5. Prédiction basée sur l'intensité défensive (duels + tacles)
  if (homeTeam.duelsWonPerMatch > 0 && homeTeam.tacklesPerMatch > 0 && 
      awayTeam.duelsWonPerMatch > 0 && awayTeam.tacklesPerMatch > 0) {
    const homeDefensiveIntensity = (homeTeam.duelsWonPerMatch + homeTeam.tacklesPerMatch) / 2;
    const awayDefensiveIntensity = (awayTeam.duelsWonPerMatch + awayTeam.tacklesPerMatch) / 2;
    const intensityDiff = Math.abs(homeDefensiveIntensity - awayDefensiveIntensity);
    
    if (intensityDiff > 10) {
      const moreIntenseTeam = homeDefensiveIntensity > awayDefensiveIntensity ? 'Domicile' : 'Extérieur';
      predictions.push({
        type: 'DEFENSIVE_INTENSITY',
        description: `L'équipe ${moreIntenseTeam} sera plus intense défensivement`,
        confidence: Math.min(78, 55 + intensityDiff * 1.5),
        riskLevel: 'LOW',
        expectedValue: 0.10,
        reasoning: `Différence d'intensité défensive de ${intensityDiff.toFixed(1)} points`,
        dataPoints: ['duelsWonPerMatch', 'tacklesPerMatch']
      });
    }
  }

  // 12.6. Prédiction basée sur l'agressivité (cartons + duels)
  if (homeTeam.yellowCardsPerMatch > 0 && homeTeam.duelsWonPerMatch > 0 && 
      awayTeam.yellowCardsPerMatch > 0 && awayTeam.duelsWonPerMatch > 0) {
    const homeAggressiveness = (homeTeam.yellowCardsPerMatch + homeTeam.duelsWonPerMatch / 20) / 2;
    const awayAggressiveness = (awayTeam.yellowCardsPerMatch + awayTeam.duelsWonPerMatch / 20) / 2;
    const aggressivenessDiff = Math.abs(homeAggressiveness - awayAggressiveness);
    
    if (aggressivenessDiff > 1.5) {
      const moreAggressiveTeam = homeAggressiveness > awayAggressiveness ? 'Domicile' : 'Extérieur';
      predictions.push({
        type: 'AGGRESSIVENESS_ADVANTAGE',
        description: `L'équipe ${moreAggressiveTeam} sera plus agressive`,
        confidence: Math.min(72, 50 + aggressivenessDiff * 8),
        riskLevel: 'LOW',
        expectedValue: 0.08,
        reasoning: `Différence d'agressivité de ${aggressivenessDiff.toFixed(1)} points`,
        dataPoints: ['yellowCardsPerMatch', 'duelsWonPerMatch']
      });
    }
  }

  return predictions.sort((a, b) => b.confidence - a.confidence);
}

// Génère des prédictions combinées à faible risque
export function generateCombinedLowRiskPredictions(
  homeTeam: TeamStats, 
  awayTeam: TeamStats, 
  prediction: MatchPrediction
): CombinedPrediction[] {
  const individualPredictions = analyzeLowRiskPatterns(homeTeam, awayTeam, prediction);
  const combinations: CombinedPrediction[] = [];

  // Combinaison 1: Prédictions à très faible risque
  const veryLowRisk = individualPredictions.filter(p => p.riskLevel === 'VERY_LOW');
  if (veryLowRisk.length >= 2) {
    combinations.push({
      primary: veryLowRisk[0],
      secondary: veryLowRisk.slice(1, 3),
      overallConfidence: veryLowRisk.reduce((acc, p) => acc + p.confidence, 0) / veryLowRisk.length,
      riskAssessment: 'TRÈS FAIBLE - Prédictions très sûres',
      recommendedStakes: 5 // 5% du bankroll
    });
  }

  // Combinaison 2: Prédictions à faible risque
  const lowRisk = individualPredictions.filter(p => p.riskLevel === 'LOW');
  if (lowRisk.length >= 3) {
    combinations.push({
      primary: lowRisk[0],
      secondary: lowRisk.slice(1, 4),
      overallConfidence: lowRisk.reduce((acc, p) => acc + p.confidence, 0) / lowRisk.length,
      riskAssessment: 'FAIBLE - Prédictions sûres',
      recommendedStakes: 3 // 3% du bankroll
    });
  }

  // Combinaison 3: Prédictions mixtes (très faible + faible)
  const mixedRisk = [...veryLowRisk, ...lowRisk];
  if (mixedRisk.length >= 4) {
    combinations.push({
      primary: mixedRisk[0],
      secondary: mixedRisk.slice(1, 5),
      overallConfidence: mixedRisk.reduce((acc, p) => acc + p.confidence, 0) / mixedRisk.length,
      riskAssessment: 'FAIBLE-MOYEN - Mélange de prédictions sûres',
      recommendedStakes: 2 // 2% du bankroll
    });
  }

  return combinations.sort((a, b) => b.overallConfidence - a.overallConfidence);
}

// Calcule le score de sécurité global
export function calculateSafetyScore(predictions: LowRiskPrediction[]): {
  score: number;
  level: string;
  recommendations: string[];
} {
  const avgConfidence = predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length;
  const veryLowRiskCount = predictions.filter(p => p.riskLevel === 'VERY_LOW').length;
  const lowRiskCount = predictions.filter(p => p.riskLevel === 'LOW').length;
  
  let score = avgConfidence * 0.6 + (veryLowRiskCount * 20) + (lowRiskCount * 10);
  score = Math.min(100, score);
  
  let level = 'FAIBLE';
  if (score >= 80) level = 'TRÈS ÉLEVÉE';
  else if (score >= 70) level = 'ÉLEVÉE';
  else if (score >= 60) level = 'MOYENNE';
  
  const recommendations: string[] = [];
  
  if (score >= 80) {
    recommendations.push('✅ Prédictions très sûres - Vous pouvez parier avec confiance');
    recommendations.push('💰 Recommandation: 3-5% du bankroll par prédiction');
  } else if (score >= 70) {
    recommendations.push('⚠️ Prédictions moyennement sûres - Surveillez les cotes');
    recommendations.push('💰 Recommandation: 2-3% du bankroll par prédiction');
  } else {
    recommendations.push('❌ Prédictions risquées - Évitez ou pariez très peu');
    recommendations.push('💰 Recommandation: Maximum 1% du bankroll');
  }
  
  return { score, level, recommendations };
}
