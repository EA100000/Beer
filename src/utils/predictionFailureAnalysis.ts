import { TeamStats } from '../types/football';

// Analyse des causes d'échec des prédictions
export interface PredictionFailure {
  type: 'over_under' | 'btts' | 'corners' | 'cards' | 'fouls' | 'throw_ins';
  predicted: any;
  actual: any;
  confidence: number;
  failureReasons: string[];
  impact: 'high' | 'medium' | 'low';
}

// Facteurs de risque identifiés pour les échecs de prédictions
export const PREDICTION_RISK_FACTORS = {
  // Facteurs contextuels manquants
  context: {
    weather: {
      impact: 'high',
      description: 'Conditions météorologiques non prises en compte',
      examples: ['Pluie → Plus de fautes, moins de buts', 'Vent → Erreurs de passes, corners']
    },
    referee: {
      impact: 'high', 
      description: 'Style arbitral non considéré',
      examples: ['Arbitre strict → Plus de cartons', 'Arbitre permissif → Moins de cartons']
    },
    injuries: {
      impact: 'high',
      description: 'Blessures et suspensions non intégrées',
      examples: ['Titulaire blessé → Baisse de performance', 'Suspension → Tactique modifiée']
    },
    motivation: {
      impact: 'high',
      description: 'Enjeux du match sous-estimés',
      examples: ['Relégation → Plus d\'intensité', 'Match amical → Moins d\'intensité']
    }
  },
  
  // Faiblesses des modèles
  models: {
    momentum: {
      impact: 'high',
      description: 'Calcul du momentum trop simpliste',
      issues: ['Poids égal pour tous les matchs', 'Pas de prise en compte des adversaires', 'Forme récente mal pondérée']
    },
    head_to_head: {
      impact: 'medium',
      description: 'Confrontations directes ignorées',
      issues: ['Historique H2H non utilisé', 'Tendances tactiques non analysées', 'Psychologie des confrontations']
    },
    tactical: {
      impact: 'high',
      description: 'Adaptations tactiques non prévues',
      issues: ['Changements de formation', 'Joueurs clés manquants', 'Stratégies spécifiques']
    },
    external: {
      impact: 'medium',
      description: 'Facteurs externes insuffisants',
      issues: ['Fatigue des joueurs', 'Déplacements', 'Supporters', 'Pression médiatique']
    }
  },
  
  // Problèmes de calibration
  calibration: {
    confidence: {
      impact: 'high',
      description: 'Confiance mal calibrée',
      issues: ['Sur-confiance sur certaines prédictions', 'Sous-estimation des risques', 'Pas de correction bayésienne']
    },
    thresholds: {
      impact: 'medium',
      description: 'Seuils de prédiction fixes',
      issues: ['Seuils non adaptatifs', 'Pas de prise en compte de la variance', 'Seuils trop optimistes']
    },
    ensemble: {
      impact: 'medium',
      description: 'Combinaison des modèles imparfaite',
      issues: ['Poids égaux pour tous les modèles', 'Pas de pondération dynamique', 'Modèles corrélés']
    }
  }
};

// Analyse des faiblesses spécifiques par type de prédiction
export const PREDICTION_SPECIFIC_WEAKNESSES = {
  over_under: {
    mainIssues: [
      'Météo non prise en compte (pluie = moins de buts)',
      'Style des équipes trop simplifié',
      'Fatigue des attaquants non considérée',
      'Forme récente des gardiens ignorée',
      'Tactiques défensives spécifiques non analysées'
    ],
    improvements: [
      'Intégrer les conditions météo',
      'Analyser le style de jeu récent',
      'Pondérer par la fatigue des joueurs clés',
      'Considérer les performances des gardiens',
      'Analyser les tactiques défensives récentes'
    ]
  },
  
  btts: {
    mainIssues: [
      'Forme des attaquants mal évaluée',
      'Qualité défensive des adversaires sous-estimée',
      'Blessures des défenseurs clés ignorées',
      'Style de jeu des équipes mal analysé',
      'Historique des confrontations non utilisé'
    ],
    improvements: [
      'Analyser la forme des attaquants clés',
      'Évaluer la solidité défensive récente',
      'Intégrer les blessures défensives',
      'Analyser le style de jeu offensif',
      'Utiliser l\'historique H2H'
    ]
  },
  
  corners: {
    mainIssues: [
      'Style de jeu offensif mal évalué',
      'Pression défensive non considérée',
      'Tactiques de corners non analysées',
      'Forme récente des ailiers ignorée',
      'Qualité des centres non prise en compte'
    ],
    improvements: [
      'Analyser le style offensif récent',
      'Évaluer la pression défensive',
      'Considérer les tactiques de corners',
      'Pondérer par la forme des ailiers',
      'Analyser la qualité des centres'
    ]
  },
  
  cards: {
    mainIssues: [
      'Style arbitral non pris en compte',
      'Agressivité des équipes mal évaluée',
      'Enjeux du match sous-estimés',
      'Historique disciplinaire ignoré',
      'Pression du match non considérée'
    ],
    improvements: [
      'Intégrer le style de l\'arbitre',
      'Analyser l\'agressivité récente',
      'Pondérer par les enjeux',
      'Utiliser l\'historique disciplinaire',
      'Considérer la pression du match'
    ]
  },
  
  fouls: {
    mainIssues: [
      'Intensité du match mal évaluée',
      'Style de jeu des équipes simplifié',
      'Fatigue des joueurs ignorée',
      'Enjeux du match sous-estimés',
      'Historique des confrontations non utilisé'
    ],
    improvements: [
      'Analyser l\'intensité récente',
      'Considérer le style de jeu détaillé',
      'Pondérer par la fatigue',
      'Évaluer les enjeux correctement',
      'Utiliser l\'historique H2H'
    ]
  }
};

// Fonction d'analyse des échecs de prédiction
export function analyzePredictionFailure(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  predictionType: string,
  actualResult: any,
  predictedResult: any,
  confidence: number
): PredictionFailure {
  const failureReasons: string[] = [];
  let impact: 'high' | 'medium' | 'low' = 'low';
  
  // Analyser les faiblesses contextuelles
  if (!homeTeam.sofascoreRating || !awayTeam.sofascoreRating) {
    failureReasons.push('Rating des équipes manquant - évaluation de force imprécise');
    impact = 'high';
  }
  
  if (!homeTeam.matches || homeTeam.matches < 5) {
    failureReasons.push('Données insuffisantes pour l\'équipe domicile - forme récente mal évaluée');
    impact = 'high';
  }
  
  if (!awayTeam.matches || awayTeam.matches < 5) {
    failureReasons.push('Données insuffisantes pour l\'équipe extérieure - forme récente mal évaluée');
    impact = 'high';
  }
  
  // Analyser les faiblesses spécifiques au type de prédiction
  const specificWeaknesses = PREDICTION_SPECIFIC_WEAKNESSES[predictionType as keyof typeof PREDICTION_SPECIFIC_WEAKNESSES];
  if (specificWeaknesses) {
    failureReasons.push(...specificWeaknesses.mainIssues.slice(0, 3));
    impact = 'high';
  }
  
  // Analyser la calibration de la confiance
  if (confidence > 80 && Math.abs(predictedResult - actualResult) > predictedResult * 0.3) {
    failureReasons.push('Sur-confiance détectée - modèle mal calibré');
    impact = 'high';
  }
  
  // Analyser les données manquantes critiques
  const criticalFields = ['goalsPerMatch', 'goalsConcededPerMatch', 'possession', 'tacklesPerMatch'];
  const missingCriticalFields = criticalFields.filter(field => 
    !homeTeam[field as keyof TeamStats] || !awayTeam[field as keyof TeamStats]
  );
  
  if (missingCriticalFields.length > 0) {
    failureReasons.push(`Champs critiques manquants: ${missingCriticalFields.join(', ')}`);
    impact = 'high';
  }
  
  return {
    type: predictionType as any,
    predicted: predictedResult,
    actual: actualResult,
    confidence,
    failureReasons,
    impact
  };
}

// Recommandations d'amélioration basées sur l'analyse des échecs
export function getImprovementRecommendations(failures: PredictionFailure[]): string[] {
  const recommendations: string[] = [];
  
  // Analyser les patterns d'échec
  const highImpactFailures = failures.filter(f => f.impact === 'high');
  const contextFailures = failures.filter(f => 
    f.failureReasons.some(r => r.includes('météo') || r.includes('arbitre') || r.includes('blessure'))
  );
  const dataFailures = failures.filter(f => 
    f.failureReasons.some(r => r.includes('manquant') || r.includes('insuffisantes'))
  );
  const calibrationFailures = failures.filter(f => 
    f.failureReasons.some(r => r.includes('confiance') || r.includes('calibré'))
  );
  
  if (contextFailures.length > 0) {
    recommendations.push('Intégrer les facteurs contextuels (météo, arbitre, blessures)');
  }
  
  if (dataFailures.length > 0) {
    recommendations.push('Améliorer la collecte et validation des données');
  }
  
  if (calibrationFailures.length > 0) {
    recommendations.push('Recalibrer les modèles de confiance');
  }
  
  if (highImpactFailures.length > failures.length * 0.5) {
    recommendations.push('Réviser l\'architecture des modèles de prédiction');
  }
  
  return recommendations;
}

// Fonction pour identifier les prédictions à risque
export function identifyRiskyPredictions(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  predictions: any
): { prediction: string; risk: 'high' | 'medium' | 'low'; reasons: string[] }[] {
  const riskyPredictions: { prediction: string; risk: 'high' | 'medium' | 'low'; reasons: string[] }[] = [];
  
  // Vérifier les données manquantes
  const missingData = [];
  if (!homeTeam.sofascoreRating) missingData.push('Rating domicile');
  if (!awayTeam.sofascoreRating) missingData.push('Rating extérieur');
  if (!homeTeam.matches || homeTeam.matches < 5) missingData.push('Matchs domicile');
  if (!awayTeam.matches || awayTeam.matches < 5) missingData.push('Matchs extérieur');
  
  if (missingData.length > 0) {
    riskyPredictions.push({
      prediction: 'Toutes les prédictions',
      risk: 'high',
      reasons: [`Données manquantes: ${missingData.join(', ')}`]
    });
  }
  
  // Vérifier les incohérences
  if (homeTeam.goalsPerMatch > 0 && homeTeam.goalsConcededPerMatch > 0) {
    const goalRatio = homeTeam.goalsPerMatch / homeTeam.goalsConcededPerMatch;
    if (goalRatio > 5 || goalRatio < 0.2) {
      riskyPredictions.push({
        prediction: 'Prédictions de buts',
        risk: 'high',
        reasons: ['Ratio buts marqués/encaissés incohérent']
      });
    }
  }
  
  // Vérifier la confiance excessive
  Object.entries(predictions).forEach(([key, value]: [string, any]) => {
    if (value.confidence && value.confidence > 90) {
      riskyPredictions.push({
        prediction: key,
        risk: 'medium',
        reasons: ['Confiance très élevée - risque de sur-confiance']
      });
    }
  });
  
  return riskyPredictions;
}
