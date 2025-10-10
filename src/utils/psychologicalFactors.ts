import { TeamStats } from '../types/football';

// Facteurs psychologiques et motivationnels pour prédictions ultra-précises
export interface PsychologicalFactors {
  home: TeamPsychology;
  away: TeamPsychology;
  headToHead: HeadToHeadPsychology;
  context: MatchContext;
}

export interface TeamPsychology {
  confidence: number; // 0-1, niveau de confiance
  pressure: number; // 0-1, niveau de pression
  motivation: number; // 0-1, niveau de motivation
  fatigue: number; // 0-1, niveau de fatigue
  cohesion: number; // 0-1, cohésion d'équipe
  adaptability: number; // 0-1, capacité d'adaptation
  bigMatchExperience: number; // 0-1, expérience des gros matchs
  homeAdvantage: number; // 0-1, avantage domicile psychologique
  recentMomentum: number; // -1 à 1, momentum psychologique
  stressHandling: number; // 0-1, gestion du stress
  leadership: number; // 0-1, qualité du leadership
  teamSpirit: number; // 0-1, esprit d'équipe
}

export interface HeadToHeadPsychology {
  homeAdvantage: number; // 0-1, avantage psychologique domicile
  recentMeetings: number; // Nombre de confrontations récentes
  psychologicalEdge: 'home' | 'away' | 'balanced';
  rivalry: number; // 0-1, niveau de rivalité
  revengeFactor: number; // 0-1, facteur de revanche
  dominance: 'home' | 'away' | 'balanced';
  mentalBlock: boolean; // Blocage mental d'une équipe
  confidence: number; // 0-1, confiance dans les H2H
}

export interface MatchContext {
  importance: number; // 0-1, importance du match
  pressure: number; // 0-1, pression du match
  atmosphere: number; // 0-1, atmosphère du stade
  mediaAttention: number; // 0-1, attention médiatique
  fanExpectations: number; // 0-1, attentes des supporters
  seasonStage: 'early' | 'mid' | 'late' | 'crucial';
  competitionLevel: 'friendly' | 'league' | 'cup' | 'europe' | 'final';
  weatherImpact: number; // 0-1, impact psychologique de la météo
  refereeReputation: number; // 0-1, réputation de l'arbitre
  venueFamiliarity: number; // 0-1, familiarité avec le stade
}

// Calcul des facteurs psychologiques
export function calculatePsychologicalFactors(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  context: any
): PsychologicalFactors {
  return {
    home: calculateTeamPsychology(homeTeam, 'home', context),
    away: calculateTeamPsychology(awayTeam, 'away', context),
    headToHead: calculateHeadToHeadPsychology(homeTeam, awayTeam),
    context: calculateMatchContext(context)
  };
}

// Calcul de la psychologie d'équipe
function calculateTeamPsychology(
  team: TeamStats,
  teamType: 'home' | 'away',
  context: any
): TeamPsychology {
  // Facteurs de base basés sur les statistiques
  const form = calculateForm(team);
  const pressure = calculatePressure(team, teamType, context);
  const motivation = calculateMotivation(team, context);
  const fatigue = calculateFatigue(team, context);
  
  return {
    confidence: Math.min(1, (form + team.sofascoreRating / 100) / 2),
    pressure: pressure,
    motivation: motivation,
    fatigue: fatigue,
    cohesion: calculateCohesion(team),
    adaptability: calculateAdaptability(team),
    bigMatchExperience: calculateBigMatchExperience(team),
    homeAdvantage: teamType === 'home' ? 0.15 : 0,
    recentMomentum: calculateRecentMomentum(team),
    stressHandling: calculateStressHandling(team),
    leadership: calculateLeadership(team),
    teamSpirit: calculateTeamSpirit(team)
  };
}

// Calcul de la forme psychologique
function calculateForm(team: TeamStats): number {
  if (!team.matches || team.matches < 5) return 0.5;
  
  // Basé sur les performances récentes
  const goalDifference = team.goalsPerMatch - team.goalsConcededPerMatch;
  const possession = team.possession / 100;
  const accuracy = team.accuracyPerMatch / 100;
  
  return Math.min(1, (goalDifference + possession + accuracy) / 3);
}

// Calcul de la pression
function calculatePressure(team: TeamStats, teamType: 'home' | 'away', context: any): number {
  let pressure = 0.5; // Pression de base
  
  // Pression du public (plus forte à domicile)
  if (teamType === 'home') pressure += 0.2;
  
  // Pression des enjeux
  if (context?.importance) pressure += context.importance * 0.3;
  
  // Pression des performances récentes
  if (team.goalsPerMatch < 1) pressure += 0.1; // Difficultés offensives
  if (team.goalsConcededPerMatch > 2) pressure += 0.1; // Défense défaillante
  
  return Math.min(1, pressure);
}

// Calcul de la motivation
function calculateMotivation(team: TeamStats, context: any): number {
  let motivation = 0.5; // Motivation de base
  
  // Motivation basée sur la position
  if (context?.leaguePosition) {
    if (context.leaguePosition <= 3) motivation += 0.2; // Top 3
    if (context.leaguePosition >= 15) motivation += 0.3; // Relégation
  }
  
  // Motivation basée sur les performances
  if (team.goalsPerMatch > 1.5) motivation += 0.1; // Bonne attaque
  if (team.goalsConcededPerMatch < 1) motivation += 0.1; // Bonne défense
  
  return Math.min(1, motivation);
}

// Calcul de la fatigue
function calculateFatigue(team: TeamStats, context: any): number {
  let fatigue = 0.3; // Fatigue de base
  
  // Fatigue basée sur le nombre de matchs
  if (team.matches > 30) fatigue += 0.2;
  if (team.matches > 40) fatigue += 0.2;
  
  // Fatigue basée sur l'intensité
  if (team.tacklesPerMatch > 20) fatigue += 0.1;
  if (team.duelsWonPerMatch > 60) fatigue += 0.1;
  
  return Math.min(1, fatigue);
}

// Calcul de la cohésion d'équipe
function calculateCohesion(team: TeamStats): number {
  // Basé sur la régularité des performances
  const consistency = team.accuracyPerMatch / 100;
  const possession = team.possession / 100;
  
  return (consistency + possession) / 2;
}

// Calcul de la capacité d'adaptation
function calculateAdaptability(team: TeamStats): number {
  // Basé sur la polyvalence tactique
  const possession = team.possession / 100;
  const tackles = Math.min(1, team.tacklesPerMatch / 25);
  const shots = Math.min(1, team.shotsOnTargetPerMatch / 8);
  
  return (possession + tackles + shots) / 3;
}

// Calcul de l'expérience des gros matchs
function calculateBigMatchExperience(team: TeamStats): number {
  // Basé sur le rating et les performances
  const rating = team.sofascoreRating / 100;
  const matches = Math.min(1, team.matches / 30);
  
  return (rating + matches) / 2;
}

// Calcul du momentum récent
function calculateRecentMomentum(team: TeamStats): number {
  // Basé sur les performances récentes
  const goalDiff = team.goalsPerMatch - team.goalsConcededPerMatch;
  const possession = (team.possession - 50) / 50;
  
  return Math.max(-1, Math.min(1, (goalDiff + possession) / 2));
}

// Calcul de la gestion du stress
function calculateStressHandling(team: TeamStats): number {
  // Basé sur la régularité et la possession
  const accuracy = team.accuracyPerMatch / 100;
  const possession = team.possession / 100;
  
  return (accuracy + possession) / 2;
}

// Calcul du leadership
function calculateLeadership(team: TeamStats): number {
  // Basé sur la cohésion et les performances
  const cohesion = calculateCohesion(team);
  const experience = calculateBigMatchExperience(team);
  
  return (cohesion + experience) / 2;
}

// Calcul de l'esprit d'équipe
function calculateTeamSpirit(team: TeamStats): number {
  // Basé sur la cohésion et la motivation
  const cohesion = calculateCohesion(team);
  const motivation = 0.5; // Valeur par défaut
  
  return (cohesion + motivation) / 2;
}

// Calcul de la psychologie des confrontations directes
function calculateHeadToHeadPsychology(
  homeTeam: TeamStats,
  awayTeam: TeamStats
): HeadToHeadPsychology {
  // Simulation basée sur les forces des équipes
  const homeStrength = homeTeam.sofascoreRating;
  const awayStrength = awayTeam.sofascoreRating;
  
  return {
    homeAdvantage: 0.1,
    recentMeetings: 0, // Pas de données H2H disponibles
    psychologicalEdge: homeStrength > awayStrength ? 'home' : 
                      awayStrength > homeStrength ? 'away' : 'balanced',
    rivalry: 0.3, // Rivalité modérée par défaut
    revengeFactor: 0.2, // Facteur de revanche modéré
    dominance: 'balanced',
    mentalBlock: false,
    confidence: 0.5
  };
}

// Calcul du contexte du match
function calculateMatchContext(context: any): MatchContext {
  return {
    importance: context?.importance || 0.5,
    pressure: context?.pressure || 0.5,
    atmosphere: 0.7, // Atmosphère de stade
    mediaAttention: 0.6, // Attention médiatique
    fanExpectations: 0.5, // Attentes des supporters
    seasonStage: 'mid',
    competitionLevel: 'league',
    weatherImpact: 0.3, // Impact météorologique
    refereeReputation: 0.5, // Réputation de l'arbitre
    venueFamiliarity: 0.8 // Familiarité avec le stade
  };
}

// Calcul de l'impact psychologique sur les prédictions
export function calculatePsychologicalImpact(
  psychologicalFactors: PsychologicalFactors,
  basePredictions: any
): {
  adjustedPredictions: any;
  confidenceAdjustment: number;
  psychologicalInsights: string[];
} {
  const insights: string[] = [];
  let confidenceAdjustment = 0;
  
  // Impact de la confiance
  const confidenceDiff = psychologicalFactors.home.confidence - psychologicalFactors.away.confidence;
  if (Math.abs(confidenceDiff) > 0.3) {
    insights.push(`Différence de confiance significative: ${Math.round(confidenceDiff * 100)}%`);
    confidenceAdjustment += 5;
  }
  
  // Impact de la pression
  const pressureDiff = psychologicalFactors.home.pressure - psychologicalFactors.away.pressure;
  if (Math.abs(pressureDiff) > 0.3) {
    insights.push(`Différence de pression: ${Math.abs(pressureDiff) > 0 ? 'Domicile' : 'Extérieur'} plus pressé`);
    confidenceAdjustment += 3;
  }
  
  // Impact de la motivation
  const motivationDiff = psychologicalFactors.home.motivation - psychologicalFactors.away.motivation;
  if (Math.abs(motivationDiff) > 0.3) {
    insights.push(`Différence de motivation: ${motivationDiff > 0 ? 'Domicile' : 'Extérieur'} plus motivé`);
    confidenceAdjustment += 4;
  }
  
  // Impact de la fatigue
  const fatigueDiff = psychologicalFactors.home.fatigue - psychologicalFactors.away.fatigue;
  if (Math.abs(fatigueDiff) > 0.3) {
    insights.push(`Différence de fatigue: ${fatigueDiff > 0 ? 'Domicile' : 'Extérieur'} plus fatigué`);
    confidenceAdjustment += 2;
  }
  
  // Ajustement des prédictions
  const adjustedPredictions = { ...basePredictions };
  
  // Ajuster les prédictions de buts basées sur la confiance
  if (adjustedPredictions.expectedGoals) {
    const confidenceMultiplier = 1 + (confidenceDiff * 0.2);
    adjustedPredictions.expectedGoals.home *= confidenceMultiplier;
    adjustedPredictions.expectedGoals.away *= (2 - confidenceMultiplier);
  }
  
  // Ajuster les prédictions de cartons basées sur la pression
  if (adjustedPredictions.yellowCards) {
    const pressureMultiplier = 1 + (Math.abs(pressureDiff) * 0.3);
    adjustedPredictions.yellowCards.predicted *= pressureMultiplier;
  }
  
  // Ajuster les prédictions de fautes basées sur la fatigue
  if (adjustedPredictions.fouls) {
    const fatigueMultiplier = 1 + (Math.abs(fatigueDiff) * 0.2);
    adjustedPredictions.fouls.predicted *= fatigueMultiplier;
  }
  
  return {
    adjustedPredictions,
    confidenceAdjustment: Math.min(15, confidenceAdjustment),
    psychologicalInsights: insights
  };
}
