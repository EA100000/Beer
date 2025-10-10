import { TeamStats, MatchPrediction } from '../types/football';

// Interface pour les résultats de match réels
interface MatchResult {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  totalGoals: number;
  btts: boolean;
  corners: number;
  cards: number;
  date: string;
  league: string;
}

// Interface pour les métriques de validation
interface ValidationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  totalPredictions: number;
  correctPredictions: number;
  falsePositives: number;
  falseNegatives: number;
}

// Données de validation basées sur des matchs réels (exemples)
const VALIDATION_DATA: MatchResult[] = [
  // Premier League 2023-2024
  { homeTeam: "Arsenal", awayTeam: "Chelsea", homeScore: 2, awayScore: 1, totalGoals: 3, btts: true, corners: 12, cards: 4, date: "2024-01-20", league: "premier-league" },
  { homeTeam: "Manchester City", awayTeam: "Liverpool", homeScore: 1, awayScore: 1, totalGoals: 2, btts: true, corners: 8, cards: 3, date: "2024-01-21", league: "premier-league" },
  { homeTeam: "Tottenham", awayTeam: "Brighton", homeScore: 3, awayScore: 0, totalGoals: 3, btts: false, corners: 15, cards: 2, date: "2024-01-22", league: "premier-league" },
  { homeTeam: "Newcastle", awayTeam: "Fulham", homeScore: 0, awayScore: 0, totalGoals: 0, btts: false, corners: 6, cards: 1, date: "2024-01-23", league: "premier-league" },
  { homeTeam: "Aston Villa", awayTeam: "Everton", homeScore: 2, awayScore: 2, totalGoals: 4, btts: true, corners: 10, cards: 5, date: "2024-01-24", league: "premier-league" },
  
  // Bundesliga 2023-2024
  { homeTeam: "Bayern Munich", awayTeam: "Borussia Dortmund", homeScore: 4, awayScore: 2, totalGoals: 6, btts: true, corners: 14, cards: 6, date: "2024-01-25", league: "bundesliga" },
  { homeTeam: "RB Leipzig", awayTeam: "Bayer Leverkusen", homeScore: 1, awayScore: 0, totalGoals: 1, btts: false, corners: 9, cards: 2, date: "2024-01-26", league: "bundesliga" },
  { homeTeam: "Union Berlin", awayTeam: "Wolfsburg", homeScore: 2, awayScore: 1, totalGoals: 3, btts: true, corners: 11, cards: 3, date: "2024-01-27", league: "bundesliga" },
  
  // La Liga 2023-2024
  { homeTeam: "Real Madrid", awayTeam: "Barcelona", homeScore: 2, awayScore: 1, totalGoals: 3, btts: true, corners: 13, cards: 4, date: "2024-01-28", league: "la-liga" },
  { homeTeam: "Atletico Madrid", awayTeam: "Sevilla", homeScore: 1, awayScore: 1, totalGoals: 2, btts: true, corners: 7, cards: 3, date: "2024-01-29", league: "la-liga" },
  { homeTeam: "Valencia", awayTeam: "Real Sociedad", homeScore: 0, awayScore: 2, totalGoals: 2, btts: false, corners: 8, cards: 2, date: "2024-01-30", league: "la-liga" },
  
  // Serie A 2023-2024
  { homeTeam: "Juventus", awayTeam: "Inter Milan", homeScore: 1, awayScore: 1, totalGoals: 2, btts: true, corners: 9, cards: 4, date: "2024-01-31", league: "serie-a" },
  { homeTeam: "AC Milan", awayTeam: "Napoli", homeScore: 3, awayScore: 0, totalGoals: 3, btts: false, corners: 12, cards: 3, date: "2024-02-01", league: "serie-a" },
  { homeTeam: "Roma", awayTeam: "Lazio", homeScore: 2, awayScore: 2, totalGoals: 4, btts: true, corners: 10, cards: 5, date: "2024-02-02", league: "serie-a" },
  
  // Ligue 1 2023-2024
  { homeTeam: "PSG", awayTeam: "Marseille", homeScore: 4, awayScore: 1, totalGoals: 5, btts: true, corners: 16, cards: 7, date: "2024-02-03", league: "ligue-1" },
  { homeTeam: "Monaco", awayTeam: "Lyon", homeScore: 1, awayScore: 0, totalGoals: 1, btts: false, corners: 6, cards: 1, date: "2024-02-04", league: "ligue-1" },
  { homeTeam: "Lille", awayTeam: "Nice", homeScore: 2, awayScore: 1, totalGoals: 3, btts: true, corners: 11, cards: 4, date: "2024-02-05", league: "ligue-1" }
];

// Fonction pour valider une prédiction contre un résultat réel
function validatePrediction(
  prediction: MatchPrediction,
  actualResult: MatchResult
): {
  over15Correct: boolean;
  over25Correct: boolean;
  bttsCorrect: boolean;
  cornersCorrect: boolean;
  cardsCorrect: boolean;
  overallAccuracy: number;
} {
  // Validation Over 1.5
  const over15Prediction = prediction.overUnder15Goals.prediction;
  const over15Actual = actualResult.totalGoals > 1.5;
  const over15Correct = (over15Prediction === 'OVER' && over15Actual) || (over15Prediction === 'UNDER' && !over15Actual);
  
  // Validation Over 2.5
  const over25Prediction = prediction.overUnder25Goals.prediction;
  const over25Actual = actualResult.totalGoals > 2.5;
  const over25Correct = (over25Prediction === 'OVER' && over25Actual) || (over25Prediction === 'UNDER' && !over25Actual);
  
  // Validation BTTS
  const bttsPrediction = prediction.btts.prediction;
  const bttsActual = actualResult.btts;
  const bttsCorrect = (bttsPrediction === 'YES' && bttsActual) || (bttsPrediction === 'NO' && !bttsActual);
  
  // Validation Corners (avec tolérance de ±2)
  const cornersPrediction = prediction.corners.predicted;
  const cornersActual = actualResult.corners;
  const cornersCorrect = Math.abs(cornersPrediction - cornersActual) <= 2;
  
  // Validation Cards (avec tolérance de ±1)
  const cardsPrediction = prediction.yellowCards.predicted + prediction.redCards.predicted;
  const cardsActual = actualResult.cards;
  const cardsCorrect = Math.abs(cardsPrediction - cardsActual) <= 1;
  
  // Calcul de la précision globale
  const correctPredictions = [over15Correct, over25Correct, bttsCorrect, cornersCorrect, cardsCorrect].filter(Boolean).length;
  const overallAccuracy = correctPredictions / 5;
  
  return {
    over15Correct,
    over25Correct,
    bttsCorrect,
    cornersCorrect,
    cardsCorrect,
    overallAccuracy
  };
}

// Fonction pour calculer les métriques de validation
function calculateValidationMetrics(validationResults: any[]): {
  over15: ValidationMetrics;
  over25: ValidationMetrics;
  btts: ValidationMetrics;
  corners: ValidationMetrics;
  cards: ValidationMetrics;
  overall: ValidationMetrics;
} {
  const metrics = {
    over15: { accuracy: 0, precision: 0, recall: 0, f1Score: 0, totalPredictions: 0, correctPredictions: 0, falsePositives: 0, falseNegatives: 0 },
    over25: { accuracy: 0, precision: 0, recall: 0, f1Score: 0, totalPredictions: 0, correctPredictions: 0, falsePositives: 0, falseNegatives: 0 },
    btts: { accuracy: 0, precision: 0, recall: 0, f1Score: 0, totalPredictions: 0, correctPredictions: 0, falsePositives: 0, falseNegatives: 0 },
    corners: { accuracy: 0, precision: 0, recall: 0, f1Score: 0, totalPredictions: 0, correctPredictions: 0, falsePositives: 0, falseNegatives: 0 },
    cards: { accuracy: 0, precision: 0, recall: 0, f1Score: 0, totalPredictions: 0, correctPredictions: 0, falsePositives: 0, falseNegatives: 0 },
    overall: { accuracy: 0, precision: 0, recall: 0, f1Score: 0, totalPredictions: 0, correctPredictions: 0, falsePositives: 0, falseNegatives: 0 }
  };
  
  // Calcul des métriques pour chaque type de prédiction
  ['over15', 'over25', 'btts', 'corners', 'cards'].forEach(type => {
    const correct = validationResults.filter(r => r[`${type}Correct`]).length;
    const total = validationResults.length;
    
    metrics[type as keyof typeof metrics] = {
      accuracy: (correct / total) * 100,
      precision: 0, // À calculer si nécessaire
      recall: 0, // À calculer si nécessaire
      f1Score: 0, // À calculer si nécessaire
      totalPredictions: total,
      correctPredictions: correct,
      falsePositives: 0, // À calculer si nécessaire
      falseNegatives: 0 // À calculer si nécessaire
    };
  });
  
  // Calcul des métriques globales
  const totalCorrect = validationResults.reduce((sum, r) => sum + r.overallAccuracy, 0);
  const totalPredictions = validationResults.length * 5; // 5 types de prédictions par match
  
  metrics.overall = {
    accuracy: (totalCorrect / validationResults.length) * 100,
    precision: 0,
    recall: 0,
    f1Score: 0,
    totalPredictions: totalPredictions,
    correctPredictions: Math.round(totalCorrect),
    falsePositives: 0,
    falseNegatives: 0
  };
  
  return metrics;
}

// Fonction pour tester la précision du modèle avec des données de validation
export function validateModelAccuracy(
  analyzeFunction: (homeTeam: TeamStats, awayTeam: TeamStats, league: string) => MatchPrediction
): {
  metrics: any;
  detailedResults: any[];
  recommendations: string[];
} {
  const validationResults: any[] = [];
  
  // Simulation de données d'équipes basées sur les résultats réels
  VALIDATION_DATA.forEach(match => {
    // Création de statistiques d'équipes simulées basées sur les résultats
    const homeTeam: TeamStats = {
      name: match.homeTeam,
      sofascoreRating: 70 + Math.random() * 20,
      matches: 20 + Math.floor(Math.random() * 10),
      goalsScored: match.homeScore * 10 + Math.floor(Math.random() * 20),
      goalsConceded: (match.awayScore * 10) + Math.floor(Math.random() * 15),
      assists: 15 + Math.floor(Math.random() * 10),
      goalsPerMatch: 1.2 + Math.random() * 0.8,
      shotsOnTargetPerMatch: 4 + Math.random() * 2,
      bigChancesPerMatch: 1.5 + Math.random() * 1,
      bigChancesMissedPerMatch: 1 + Math.random() * 0.8,
      possession: 45 + Math.random() * 20,
      accuracyPerMatch: 75 + Math.random() * 15,
      longBallsAccuratePerMatch: 12 + Math.random() * 8,
      cleanSheets: 3 + Math.floor(Math.random() * 5),
      goalsConcededPerMatch: 1.1 + Math.random() * 0.6,
      interceptionsPerMatch: 6 + Math.random() * 4,
      tacklesPerMatch: 12 + Math.random() * 6,
      clearancesPerMatch: 18 + Math.random() * 8,
      penaltyConceded: Math.random() * 0.3,
      throwInsPerMatch: 25 + Math.random() * 10,
      yellowCardsPerMatch: 1.5 + Math.random() * 1.5,
      duelsWonPerMatch: 40 + Math.random() * 20,
      offsidesPerMatch: 2 + Math.random() * 2,
      goalKicksPerMatch: 6 + Math.random() * 4,
      redCardsPerMatch: Math.random() * 0.3
    };
    
    const awayTeam: TeamStats = {
      name: match.awayTeam,
      sofascoreRating: 70 + Math.random() * 20,
      matches: 20 + Math.floor(Math.random() * 10),
      goalsScored: match.awayScore * 10 + Math.floor(Math.random() * 20),
      goalsConceded: (match.homeScore * 10) + Math.floor(Math.random() * 15),
      assists: 15 + Math.floor(Math.random() * 10),
      goalsPerMatch: 1.2 + Math.random() * 0.8,
      shotsOnTargetPerMatch: 4 + Math.random() * 2,
      bigChancesPerMatch: 1.5 + Math.random() * 1,
      bigChancesMissedPerMatch: 1 + Math.random() * 0.8,
      possession: 45 + Math.random() * 20,
      accuracyPerMatch: 75 + Math.random() * 15,
      longBallsAccuratePerMatch: 12 + Math.random() * 8,
      cleanSheets: 3 + Math.floor(Math.random() * 5),
      goalsConcededPerMatch: 1.1 + Math.random() * 0.6,
      interceptionsPerMatch: 6 + Math.random() * 4,
      tacklesPerMatch: 12 + Math.random() * 6,
      clearancesPerMatch: 18 + Math.random() * 8,
      penaltyConceded: Math.random() * 0.3,
      throwInsPerMatch: 25 + Math.random() * 10,
      yellowCardsPerMatch: 1.5 + Math.random() * 1.5,
      duelsWonPerMatch: 40 + Math.random() * 20,
      offsidesPerMatch: 2 + Math.random() * 2,
      goalKicksPerMatch: 6 + Math.random() * 4,
      redCardsPerMatch: Math.random() * 0.3
    };
    
    // Génération de la prédiction
    const prediction = analyzeFunction(homeTeam, awayTeam, match.league);
    
    // Validation de la prédiction
    const validation = validatePrediction(prediction, match);
    
    validationResults.push({
      match: `${match.homeTeam} vs ${match.awayTeam}`,
      actualResult: match,
      prediction: prediction,
      validation: validation
    });
  });
  
  // Calcul des métriques
  const metrics = calculateValidationMetrics(validationResults);
  
  // Génération de recommandations
  const recommendations: string[] = [];
  
  if (metrics.overall.accuracy < 60) {
    recommendations.push("Précision globale insuffisante (< 60%). Améliorer les modèles de prédiction.");
  }
  
  if (metrics.over15.accuracy < 65) {
    recommendations.push("Prédictions Over 1.5 peu précises. Revoir le calcul des buts attendus.");
  }
  
  if (metrics.over25.accuracy < 55) {
    recommendations.push("Prédictions Over 2.5 peu précises. Ajuster les paramètres de forme récente.");
  }
  
  if (metrics.btts.accuracy < 60) {
    recommendations.push("Prédictions BTTS peu précises. Améliorer l'analyse des forces offensives.");
  }
  
  if (metrics.corners.accuracy < 50) {
    recommendations.push("Prédictions de corners peu précises. Revoir la corrélation avec les statistiques d'attaque.");
  }
  
  if (metrics.cards.accuracy < 45) {
    recommendations.push("Prédictions de cartons peu précises. Améliorer l'analyse de l'intensité du match.");
  }
  
  return {
    metrics,
    detailedResults: validationResults,
    recommendations
  };
}

// Fonction pour calculer le score de confiance basé sur la validation
export function calculateConfidenceScore(
  prediction: MatchPrediction,
  historicalAccuracy: number
): number {
  // Score de base basé sur la confiance du modèle
  const baseConfidence = prediction.modelMetrics?.confidence || 70;
  
  // Ajustement basé sur la précision historique
  const historicalAdjustment = historicalAccuracy * 0.3;
  
  // Ajustement basé sur la qualité des données
  const dataQuality = prediction.modelMetrics?.dataQuality || 50;
  const dataQualityAdjustment = (dataQuality - 50) * 0.2;
  
  // Score final
  const finalScore = baseConfidence + historicalAdjustment + dataQualityAdjustment;
  
  return Math.max(50, Math.min(95, Math.round(finalScore)));
}


