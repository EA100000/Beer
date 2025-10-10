import { TeamStats } from '../types/football';

// Système de validation ultra-robuste pour éviter les mauvaises analyses
export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  warnings: string[];
  errors: string[];
  recommendations: string[];
  safetyScore: number; // 0-100
  shouldProceed: boolean;
}

export interface StatisticalAnomaly {
  type: 'data_inconsistency' | 'prediction_outlier' | 'confidence_mismatch' | 'model_disagreement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: number; // 0-1
  recommendation: string;
}

// Validation multi-niveaux des prédictions
export function validatePrediction(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  predictions: any,
  confidence: number
): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const recommendations: string[] = [];
  let safetyScore = 100;
  
  // 1. Validation des données d'entrée
  const dataValidation = validateInputData(homeTeam, awayTeam);
  warnings.push(...dataValidation.warnings);
  errors.push(...dataValidation.errors);
  safetyScore -= dataValidation.safetyPenalty;
  
  // 2. Détection d'anomalies statistiques
  const anomalies = detectStatisticalAnomalies(homeTeam, awayTeam, predictions);
  anomalies.forEach(anomaly => {
    if (anomaly.severity === 'critical') {
      errors.push(anomaly.description);
      safetyScore -= 30;
    } else if (anomaly.severity === 'high') {
      warnings.push(anomaly.description);
      safetyScore -= 20;
    } else if (anomaly.severity === 'medium') {
      warnings.push(anomaly.description);
      safetyScore -= 10;
    }
    recommendations.push(anomaly.recommendation);
  });
  
  // 3. Validation de cohérence des prédictions
  const consistencyValidation = validatePredictionConsistency(predictions);
  warnings.push(...consistencyValidation.warnings);
  errors.push(...consistencyValidation.errors);
  safetyScore -= consistencyValidation.safetyPenalty;
  
  // 4. Validation de la confiance
  const confidenceValidation = validateConfidence(predictions, confidence);
  warnings.push(...confidenceValidation.warnings);
  errors.push(...confidenceValidation.errors);
  safetyScore -= confidenceValidation.safetyPenalty;
  
  // 5. Validation des seuils de sécurité
  const safetyValidation = validateSafetyThresholds(predictions, confidence);
  warnings.push(...safetyValidation.warnings);
  errors.push(...safetyValidation.errors);
  safetyScore -= safetyValidation.safetyPenalty;
  
  // 6. Validation croisée des modèles
  const crossValidation = validateModelAgreement(predictions);
  warnings.push(...crossValidation.warnings);
  errors.push(...crossValidation.errors);
  safetyScore -= crossValidation.safetyPenalty;
  
  // Déterminer le niveau de risque
  const riskLevel = determineRiskLevel(safetyScore, errors.length, warnings.length);
  
  // Déterminer si on peut procéder
  const shouldProceed = safetyScore >= 70 && errors.length === 0;
  
  // Générer des recommandations finales
  if (!shouldProceed) {
    recommendations.push('⚠️ PRÉDICTION NON RECOMMANDÉE - Données insuffisantes ou incohérentes');
  } else if (safetyScore < 85) {
    recommendations.push('⚠️ Prédiction à risque - Vérifiez les données avant de parier');
  } else {
    recommendations.push('✅ Prédiction validée - Sécurité élevée');
  }
  
  return {
    isValid: shouldProceed,
    confidence: Math.max(0, Math.min(100, confidence)),
    riskLevel,
    warnings,
    errors,
    recommendations,
    safetyScore: Math.max(0, safetyScore),
    shouldProceed
  };
}

// Validation des données d'entrée
function validateInputData(homeTeam: TeamStats, awayTeam: TeamStats): {
  warnings: string[];
  errors: string[];
  safetyPenalty: number;
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  let safetyPenalty = 0;
  
  // Vérifier les données critiques
  const criticalFields = ['name', 'goalsPerMatch', 'goalsConcededPerMatch', 'possession'];
  
  criticalFields.forEach(field => {
    if (!homeTeam[field as keyof TeamStats] || homeTeam[field as keyof TeamStats] === 0) {
      errors.push(`Données critiques manquantes pour l'équipe domicile: ${field}`);
      safetyPenalty += 25;
    }
    if (!awayTeam[field as keyof TeamStats] || awayTeam[field as keyof TeamStats] === 0) {
      errors.push(`Données critiques manquantes pour l'équipe extérieure: ${field}`);
      safetyPenalty += 25;
    }
  });
  
  // Vérifier la cohérence des données
  if (homeTeam.goalsPerMatch > 0 && homeTeam.goalsConcededPerMatch > 0) {
    const goalRatio = homeTeam.goalsPerMatch / homeTeam.goalsConcededPerMatch;
    if (goalRatio > 10 || goalRatio < 0.1) {
      warnings.push('Ratio buts marqués/encaissés incohérent pour l\'équipe domicile');
      safetyPenalty += 15;
    }
  }
  
  if (awayTeam.goalsPerMatch > 0 && awayTeam.goalsConcededPerMatch > 0) {
    const goalRatio = awayTeam.goalsPerMatch / awayTeam.goalsConcededPerMatch;
    if (goalRatio > 10 || goalRatio < 0.1) {
      warnings.push('Ratio buts marqués/encaissés incohérent pour l\'équipe extérieure');
      safetyPenalty += 15;
    }
  }
  
  // Vérifier les valeurs aberrantes
  if (homeTeam.possession > 90 || homeTeam.possession < 10) {
    warnings.push('Possession de l\'équipe domicile suspecte');
    safetyPenalty += 10;
  }
  
  if (awayTeam.possession > 90 || awayTeam.possession < 10) {
    warnings.push('Possession de l\'équipe extérieure suspecte');
    safetyPenalty += 10;
  }
  
  return { warnings, errors, safetyPenalty };
}

// Détection d'anomalies statistiques
function detectStatisticalAnomalies(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  predictions: any
): StatisticalAnomaly[] {
  const anomalies: StatisticalAnomaly[] = [];
  
  // Anomalie 1: Prédiction de buts incohérente
  if (predictions.expectedGoals) {
    const totalGoals = predictions.expectedGoals.home + predictions.expectedGoals.away;
    if (totalGoals > 6) {
      anomalies.push({
        type: 'prediction_outlier',
        severity: 'high',
        description: 'Prédiction de buts total très élevée (>6)',
        impact: 0.8,
        recommendation: 'Vérifiez les données offensives des équipes'
      });
    }
    if (totalGoals < 0.5) {
      anomalies.push({
        type: 'prediction_outlier',
        severity: 'high',
        description: 'Prédiction de buts total très faible (<0.5)',
        impact: 0.8,
        recommendation: 'Vérifiez les données défensives des équipes'
      });
    }
  }
  
  // Anomalie 2: Prédiction de corners incohérente
  if (predictions.corners && predictions.corners.predicted > 20) {
    anomalies.push({
      type: 'prediction_outlier',
      severity: 'medium',
      description: 'Prédiction de corners très élevée (>20)',
      impact: 0.6,
      recommendation: 'Vérifiez les statistiques de corners des équipes'
    });
  }
  
  // Anomalie 3: Prédiction de cartons incohérente
  if (predictions.yellowCards && predictions.yellowCards.predicted > 8) {
    anomalies.push({
      type: 'prediction_outlier',
      severity: 'medium',
      description: 'Prédiction de cartons jaunes très élevée (>8)',
      impact: 0.6,
      recommendation: 'Vérifiez les statistiques disciplinaires des équipes'
    });
  }
  
  // Anomalie 4: Incohérence entre les données et les prédictions
  if (homeTeam.goalsPerMatch < 0.5 && predictions.expectedGoals?.home > 2) {
    anomalies.push({
      type: 'data_inconsistency',
      severity: 'critical',
      description: 'Incohérence: équipe domicile faible offensivement mais prédiction élevée',
      impact: 0.9,
      recommendation: 'Vérifiez les données offensives de l\'équipe domicile'
    });
  }
  
  // Anomalie 5: Désaccord entre modèles
  if (predictions.modelDisagreement && predictions.modelDisagreement > 0.3) {
    anomalies.push({
      type: 'model_disagreement',
      severity: 'high',
      description: 'Désaccord important entre les modèles de prédiction',
      impact: 0.7,
      recommendation: 'Utilisez des données plus complètes ou vérifiez la cohérence'
    });
  }
  
  return anomalies;
}

// Validation de cohérence des prédictions
function validatePredictionConsistency(predictions: any): {
  warnings: string[];
  errors: string[];
  safetyPenalty: number;
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  let safetyPenalty = 0;
  
  // Vérifier la cohérence BTTS vs Over/Under
  if (predictions.btts && predictions.overUnder25Goals) {
    const bttsProb = predictions.btts.yes / 100;
    const over25Prob = predictions.overUnder25Goals.over / 100;
    
    if (bttsProb > 0.8 && over25Prob < 0.3) {
      warnings.push('Incohérence: BTTS élevé mais Over 2.5 faible');
      safetyPenalty += 15;
    }
    
    if (bttsProb < 0.3 && over25Prob > 0.8) {
      warnings.push('Incohérence: BTTS faible mais Over 2.5 élevé');
      safetyPenalty += 15;
    }
  }
  
  // Vérifier la cohérence des prédictions de buts
  if (predictions.expectedGoals) {
    const homeGoals = predictions.expectedGoals.home;
    const awayGoals = predictions.expectedGoals.away;
    
    if (Math.abs(homeGoals - awayGoals) > 3) {
      warnings.push('Écart important entre les prédictions de buts des équipes');
      safetyPenalty += 10;
    }
  }
  
  return { warnings, errors, safetyPenalty };
}

// Validation de la confiance
function validateConfidence(predictions: any, confidence: number): {
  warnings: string[];
  errors: string[];
  safetyPenalty: number;
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  let safetyPenalty = 0;
  
  // Vérifier la sur-confiance
  if (confidence > 95) {
    warnings.push('Confiance très élevée (>95%) - Risque de sur-confiance');
    safetyPenalty += 20;
  }
  
  // Vérifier la sous-confiance
  if (confidence < 30) {
    errors.push('Confiance très faible (<30%) - Prédiction non fiable');
    safetyPenalty += 40;
  }
  
  // Vérifier la cohérence entre confiance et prédictions
  if (predictions.corners && predictions.corners.confidence > confidence + 20) {
    warnings.push('Incohérence: confiance des corners > confiance globale');
    safetyPenalty += 10;
  }
  
  return { warnings, errors, safetyPenalty };
}

// Validation des seuils de sécurité
function validateSafetyThresholds(predictions: any, confidence: number): {
  warnings: string[];
  errors: string[];
  safetyPenalty: number;
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  let safetyPenalty = 0;
  
  // Seuils de sécurité pour les prédictions
  const safetyThresholds = {
    minConfidence: 40,
    maxConfidence: 95,
    minGoals: 0.5,
    maxGoals: 6,
    minCorners: 3,
    maxCorners: 20,
    minCards: 0,
    maxCards: 10
  };
  
  // Vérifier la confiance
  if (confidence < safetyThresholds.minConfidence) {
    errors.push(`Confiance trop faible (${confidence}% < ${safetyThresholds.minConfidence}%)`);
    safetyPenalty += 30;
  }
  
  if (confidence > safetyThresholds.maxConfidence) {
    warnings.push(`Confiance suspecte (${confidence}% > ${safetyThresholds.maxConfidence}%)`);
    safetyPenalty += 15;
  }
  
  // Vérifier les prédictions de buts
  if (predictions.expectedGoals) {
    const totalGoals = predictions.expectedGoals.home + predictions.expectedGoals.away;
    if (totalGoals < safetyThresholds.minGoals) {
      errors.push(`Prédiction de buts trop faible (${totalGoals.toFixed(1)} < ${safetyThresholds.minGoals})`);
      safetyPenalty += 25;
    }
    if (totalGoals > safetyThresholds.maxGoals) {
      warnings.push(`Prédiction de buts très élevée (${totalGoals.toFixed(1)} > ${safetyThresholds.maxGoals})`);
      safetyPenalty += 15;
    }
  }
  
  // Vérifier les prédictions de corners
  if (predictions.corners) {
    if (predictions.corners.predicted < safetyThresholds.minCorners) {
      warnings.push(`Prédiction de corners très faible (${predictions.corners.predicted} < ${safetyThresholds.minCorners})`);
      safetyPenalty += 10;
    }
    if (predictions.corners.predicted > safetyThresholds.maxCorners) {
      warnings.push(`Prédiction de corners très élevée (${predictions.corners.predicted} > ${safetyThresholds.maxCorners})`);
      safetyPenalty += 10;
    }
  }
  
  return { warnings, errors, safetyPenalty };
}

// Validation croisée des modèles
function validateModelAgreement(predictions: any): {
  warnings: string[];
  errors: string[];
  safetyPenalty: number;
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  let safetyPenalty = 0;
  
  // Vérifier l'accord entre modèles (si disponible)
  if (predictions.modelAgreement !== undefined) {
    if (predictions.modelAgreement < 0.5) {
      errors.push('Désaccord important entre les modèles de prédiction');
      safetyPenalty += 30;
    } else if (predictions.modelAgreement < 0.7) {
      warnings.push('Désaccord modéré entre les modèles de prédiction');
      safetyPenalty += 15;
    }
  }
  
  return { warnings, errors, safetyPenalty };
}

// Déterminer le niveau de risque
function determineRiskLevel(safetyScore: number, errorCount: number, warningCount: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (errorCount > 0 || safetyScore < 50) return 'CRITICAL';
  if (safetyScore < 70 || warningCount > 5) return 'HIGH';
  if (safetyScore < 85 || warningCount > 2) return 'MEDIUM';
  return 'LOW';
}

// Fonction de validation rapide pour les prédictions critiques
export function quickValidation(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  predictions: any,
  confidence: number
): boolean {
  // Vérifications rapides critiques
  if (confidence < 40) return false;
  if (!homeTeam.goalsPerMatch || !awayTeam.goalsPerMatch) return false;
  if (predictions.expectedGoals) {
    const totalGoals = predictions.expectedGoals.home + predictions.expectedGoals.away;
    if (totalGoals < 0.5 || totalGoals > 6) return false;
  }
  return true;
}
