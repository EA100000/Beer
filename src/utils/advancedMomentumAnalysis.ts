import { TeamStats } from '../types/football';

// Analyse avancée du momentum et de la forme récente
export interface MomentumAnalysis {
  home: {
    recentForm: number; // -1 à 1
    momentum: number; // -1 à 1
    consistency: number; // 0 à 1
    trend: 'improving' | 'declining' | 'stable';
    keyFactors: string[];
    confidence: number;
  };
  away: {
    recentForm: number;
    momentum: number;
    consistency: number;
    trend: 'improving' | 'declining' | 'stable';
    keyFactors: string[];
    confidence: number;
  };
  headToHead: {
    homeAdvantage: number;
    recentMeetings: number;
    trend: 'home' | 'away' | 'balanced';
    confidence: number;
  };
}

// Données historiques pour l'analyse du momentum
const MOMENTUM_WEIGHTS = {
  lastMatch: 0.4,
  last3Matches: 0.3,
  last5Matches: 0.2,
  last10Matches: 0.1
};

// Facteurs de momentum spécifiques
const MOMENTUM_FACTORS = {
  goals: {
    weight: 0.3,
    threshold: 0.1 // Variation minimale pour considérer un changement
  },
  possession: {
    weight: 0.2,
    threshold: 0.05
  },
  defensive: {
    weight: 0.25,
    threshold: 0.1
  },
  attacking: {
    weight: 0.25,
    threshold: 0.1
  }
};

// Calcul du momentum avancé
export function calculateAdvancedMomentum(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  recentMatches: {
    home: Array<{
      date: string;
      opponent: string;
      goalsFor: number;
      goalsAgainst: number;
      possession: number;
      shotsOnTarget: number;
      corners: number;
      fouls: number;
      cards: number;
      result: 'W' | 'D' | 'L';
    }>;
    away: Array<{
      date: string;
      opponent: string;
      goalsFor: number;
      goalsAgainst: number;
      possession: number;
      shotsOnTarget: number;
      corners: number;
      fouls: number;
      cards: number;
      result: 'W' | 'D' | 'L';
    }>;
  }
): MomentumAnalysis {
  
  // Calcul du momentum pour l'équipe domicile
  const homeMomentum = calculateTeamMomentum(homeTeam, recentMatches.home, 'home');
  
  // Calcul du momentum pour l'équipe extérieure
  const awayMomentum = calculateTeamMomentum(awayTeam, recentMatches.away, 'away');
  
  // Analyse des confrontations directes
  const headToHead = analyzeHeadToHead(recentMatches.home, recentMatches.away);
  
  return {
    home: homeMomentum,
    away: awayMomentum,
    headToHead
  };
}

// Calcul du momentum pour une équipe
function calculateTeamMomentum(
  team: TeamStats,
  recentMatches: Array<any>,
  teamType: 'home' | 'away'
): {
  recentForm: number;
  momentum: number;
  consistency: number;
  trend: 'improving' | 'declining' | 'stable';
  keyFactors: string[];
  confidence: number;
} {
  if (recentMatches.length === 0) {
    return {
      recentForm: 0,
      momentum: 0,
      consistency: 0.5,
      trend: 'stable',
      keyFactors: ['Données insuffisantes'],
      confidence: 0
    };
  }
  
  // Calcul de la forme récente (résultats)
  const recentForm = calculateRecentForm(recentMatches);
  
  // Calcul du momentum (tendances)
  const momentum = calculateMomentumTrend(recentMatches, team);
  
  // Calcul de la cohérence
  const consistency = calculateConsistency(recentMatches);
  
  // Détermination de la tendance
  const trend = determineTrend(momentum, recentForm);
  
  // Identification des facteurs clés
  const keyFactors = identifyKeyFactors(recentMatches, team);
  
  // Calcul de la confiance
  const confidence = calculateMomentumConfidence(recentMatches, team);
  
  return {
    recentForm,
    momentum,
    consistency,
    trend,
    keyFactors,
    confidence
  };
}

// Calcul de la forme récente basée sur les résultats
function calculateRecentForm(matches: Array<any>): number {
  if (matches.length === 0) return 0;
  
  let formScore = 0;
  let totalWeight = 0;
  
  matches.forEach((match, index) => {
    const weight = MOMENTUM_WEIGHTS[`last${Math.min(index + 1, 10)}Matches` as keyof typeof MOMENTUM_WEIGHTS] || 0.1;
    
    let matchScore = 0;
    if (match.result === 'W') matchScore = 1;
    else if (match.result === 'D') matchScore = 0.5;
    else matchScore = 0;
    
    formScore += matchScore * weight;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? (formScore / totalWeight) * 2 - 1 : 0; // Normaliser entre -1 et 1
}

// Calcul du momentum basé sur les tendances
function calculateMomentumTrend(matches: Array<any>, team: TeamStats): number {
  if (matches.length < 2) return 0;
  
  let momentumScore = 0;
  let totalWeight = 0;
  
  // Analyser les tendances sur les 5 derniers matchs
  const recentMatches = matches.slice(0, 5);
  
  // Tendance des buts
  const goalsTrend = analyzeTrend(recentMatches.map(m => m.goalsFor), team.goalsPerMatch);
  momentumScore += goalsTrend * MOMENTUM_FACTORS.goals.weight;
  totalWeight += MOMENTUM_FACTORS.goals.weight;
  
  // Tendance de la possession
  const possessionTrend = analyzeTrend(recentMatches.map(m => m.possession), team.possession);
  momentumScore += possessionTrend * MOMENTUM_FACTORS.possession.weight;
  totalWeight += MOMENTUM_FACTORS.possession.weight;
  
  // Tendance défensive
  const defensiveTrend = analyzeTrend(recentMatches.map(m => m.goalsAgainst), team.goalsConcededPerMatch);
  momentumScore += defensiveTrend * MOMENTUM_FACTORS.defensive.weight;
  totalWeight += MOMENTUM_FACTORS.defensive.weight;
  
  // Tendance offensive
  const attackingTrend = analyzeTrend(recentMatches.map(m => m.shotsOnTarget), team.shotsOnTargetPerMatch);
  momentumScore += attackingTrend * MOMENTUM_FACTORS.attacking.weight;
  totalWeight += MOMENTUM_FACTORS.attacking.weight;
  
  return totalWeight > 0 ? momentumScore / totalWeight : 0;
}

// Analyse d'une tendance spécifique
function analyzeTrend(values: number[], baseline: number): number {
  if (values.length < 2) return 0;
  
  // Calculer la pente de la tendance
  let slope = 0;
  for (let i = 1; i < values.length; i++) {
    slope += (values[i-1] - values[i]) / (values.length - 1);
  }
  
  // Normaliser par rapport à la baseline
  const normalizedSlope = slope / (baseline || 1);
  
  // Appliquer un seuil pour éviter les micro-variations
  if (Math.abs(normalizedSlope) < 0.05) return 0;
  
  return Math.max(-1, Math.min(1, normalizedSlope));
}

// Calcul de la cohérence
function calculateConsistency(matches: Array<any>): number {
  if (matches.length < 3) return 0.5;
  
  // Calculer la variance des performances
  const performances = matches.map(match => {
    const goalsDiff = match.goalsFor - match.goalsAgainst;
    const possession = match.possession / 100;
    const shots = match.shotsOnTarget / 10; // Normaliser
    return goalsDiff + possession + shots;
  });
  
  const mean = performances.reduce((a, b) => a + b, 0) / performances.length;
  const variance = performances.reduce((sum, perf) => sum + Math.pow(perf - mean, 2), 0) / performances.length;
  
  // Convertir en cohérence (0-1, 1 = très cohérent)
  return Math.max(0, 1 - Math.sqrt(variance) / 2);
}

// Détermination de la tendance
function determineTrend(momentum: number, form: number): 'improving' | 'declining' | 'stable' {
  const combinedScore = (momentum + form) / 2;
  
  if (combinedScore > 0.2) return 'improving';
  if (combinedScore < -0.2) return 'declining';
  return 'stable';
}

// Identification des facteurs clés
function identifyKeyFactors(matches: Array<any>, team: TeamStats): string[] {
  const factors: string[] = [];
  
  if (matches.length === 0) return ['Données insuffisantes'];
  
  // Analyser les performances récentes
  const recentGoals = matches.slice(0, 3).map(m => m.goalsFor);
  const avgRecentGoals = recentGoals.reduce((a, b) => a + b, 0) / recentGoals.length;
  
  if (avgRecentGoals > team.goalsPerMatch * 1.2) {
    factors.push('Forme offensive excellente');
  } else if (avgRecentGoals < team.goalsPerMatch * 0.8) {
    factors.push('Difficultés offensives');
  }
  
  // Analyser la défense
  const recentConceded = matches.slice(0, 3).map(m => m.goalsAgainst);
  const avgRecentConceded = recentConceded.reduce((a, b) => a + b, 0) / recentConceded.length;
  
  if (avgRecentConceded < team.goalsConcededPerMatch * 0.8) {
    factors.push('Défense solide récemment');
  } else if (avgRecentConceded > team.goalsConcededPerMatch * 1.2) {
    factors.push('Défense défaillante');
  }
  
  // Analyser la possession
  const recentPossession = matches.slice(0, 3).map(m => m.possession);
  const avgPossession = recentPossession.reduce((a, b) => a + b, 0) / recentPossession.length;
  
  if (avgPossession > team.possession + 5) {
    factors.push('Contrôle du jeu amélioré');
  } else if (avgPossession < team.possession - 5) {
    factors.push('Perte de contrôle du jeu');
  }
  
  // Analyser les résultats
  const recentResults = matches.slice(0, 5).map(m => m.result);
  const wins = recentResults.filter(r => r === 'W').length;
  const draws = recentResults.filter(r => r === 'D').length;
  const losses = recentResults.filter(r => r === 'L').length;
  
  if (wins >= 3) {
    factors.push('Série de victoires');
  } else if (losses >= 3) {
    factors.push('Série de défaites');
  } else if (draws >= 3) {
    factors.push('Série de matchs nuls');
  }
  
  return factors.length > 0 ? factors : ['Forme stable'];
}

// Calcul de la confiance du momentum
function calculateMomentumConfidence(matches: Array<any>, team: TeamStats): number {
  if (matches.length === 0) return 0;
  
  let confidence = 0;
  
  // Bonus pour le nombre de matchs
  confidence += Math.min(20, matches.length * 4);
  
  // Bonus pour la cohérence des données
  const dataCompleteness = calculateDataCompleteness(matches);
  confidence += dataCompleteness * 30;
  
  // Bonus pour la récence des données
  const dataRecency = calculateDataRecency(matches);
  confidence += dataRecency * 20;
  
  // Bonus pour la qualité des adversaires
  const opponentQuality = calculateOpponentQuality(matches);
  confidence += opponentQuality * 30;
  
  return Math.min(100, confidence);
}

// Calcul de la complétude des données
function calculateDataCompleteness(matches: Array<any>): number {
  if (matches.length === 0) return 0;
  
  const requiredFields = ['goalsFor', 'goalsAgainst', 'possession', 'shotsOnTarget'];
  let completeness = 0;
  
  matches.forEach(match => {
    const filledFields = requiredFields.filter(field => 
      match[field] !== undefined && match[field] !== null
    ).length;
    completeness += filledFields / requiredFields.length;
  });
  
  return completeness / matches.length;
}

// Calcul de la récence des données
function calculateDataRecency(matches: Array<any>): number {
  if (matches.length === 0) return 0;
  
  const now = new Date();
  const recentMatches = matches.filter(match => {
    const matchDate = new Date(match.date);
    const daysDiff = (now.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30; // 30 derniers jours
  });
  
  return recentMatches.length / matches.length;
}

// Calcul de la qualité des adversaires
function calculateOpponentQuality(matches: Array<any>): number {
  if (matches.length === 0) return 0;
  
  // Simulation basée sur les résultats
  const avgGoalsFor = matches.reduce((sum, m) => sum + m.goalsFor, 0) / matches.length;
  const avgGoalsAgainst = matches.reduce((sum, m) => sum + m.goalsAgainst, 0) / matches.length;
  
  // Plus les buts sont élevés, plus les adversaires sont considérés comme de qualité
  return Math.min(1, (avgGoalsFor + avgGoalsAgainst) / 4);
}

// Analyse des confrontations directes
function analyzeHeadToHead(
  homeMatches: Array<any>,
  awayMatches: Array<any>
): {
  homeAdvantage: number;
  recentMeetings: number;
  trend: 'home' | 'away' | 'balanced';
  confidence: number;
} {
  // Simulation basée sur les données disponibles
  const homeAdvantage = 0.1; // Avantage domicile standard
  const recentMeetings = 0; // Pas de données H2H disponibles
  const trend = 'balanced';
  const confidence = 0;
  
  return {
    homeAdvantage,
    recentMeetings,
    trend,
    confidence
  };
}
