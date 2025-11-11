/**
 * Types pour le contexte et l'enjeu des matches
 */

export type MatchImportance = 'AMICAL' | 'CHAMPIONNAT' | 'COUPE_NATIONALE' | 'COUPE_INTERNATIONALE' | 'QUALIFICATION' | 'FINALE' | 'PLAY_OFF' | 'DERBY' | 'RELEGATION_BATTLE';

export type CompetitionLevel = 'ELITE' | 'PROFESSIONAL' | 'SEMI_PROFESSIONAL' | 'AMATEUR';

export interface MatchContext {
  // Enjeu du match
  importance: MatchImportance;

  // Niveau de compétition
  competitionLevel: CompetitionLevel;

  // Contexte spécifique
  isHomeTeamFightingRelegation: boolean;
  isAwayTeamFightingRelegation: boolean;
  isHomeTeamChampionshipContender: boolean;
  isAwayTeamChampionshipContender: boolean;

  // Position au classement
  homeTeamPosition?: number;
  awayTeamPosition?: number;

  // Historique récent (forme)
  homeTeamLastFiveResults?: ('W' | 'D' | 'L')[]; // Win, Draw, Loss
  awayTeamLastFiveResults?: ('W' | 'D' | 'L')[];

  // Contexte du derby/rivalité
  isDerby: boolean;
  rivalryIntensity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

  // Fatigue et calendrier
  homeTeamDaysSinceLastMatch?: number;
  awayTeamDaysSinceLastMatch?: number;
  homeTeamMatchesInLast7Days?: number;
  awayTeamMatchesInLast7Days?: number;

  // Motivation
  homeTeamMotivation: number; // 0-100
  awayTeamMotivation: number; // 0-100
}

/**
 * Multiplicateurs d'ajustement basés sur l'enjeu du match
 */
export interface ImportanceMultipliers {
  // Multiplicateur pour l'intensité du jeu
  intensityMultiplier: number;

  // Multiplicateur pour les fautes/cartons
  disciplineMultiplier: number;

  // Multiplicateur pour la prudence défensive
  defensiveMultiplier: number;

  // Multiplicateur pour l'agressivité offensive
  offensiveMultiplier: number;

  // Impact sur la variance (imprévisibilité)
  varianceMultiplier: number;
}

/**
 * Données historiques d'entraînement
 */
export interface HistoricalMatch {
  id: string;
  date: string;

  // Équipes
  homeTeam: string;
  awayTeam: string;

  // Résultat final
  homeGoals: number;
  awayGoals: number;

  // Statistiques du match
  homeShots?: number;
  awayShots?: number;
  homeShotsOnTarget?: number;
  awayShotsOnTarget?: number;
  homeCorners?: number;
  awayCorners?: number;
  homeFouls?: number;
  awayFouls?: number;
  homeYellowCards?: number;
  awayYellowCards?: number;
  homeRedCards?: number;
  awayRedCards?: number;
  homePossession?: number;
  awayPossession?: number;

  // Contexte
  context: MatchContext;

  // Notes SofaScore (si disponibles)
  homeTeamRating?: number;
  awayTeamRating?: number;
}

/**
 * Dataset d'entraînement
 */
export interface TrainingDataset {
  matches: HistoricalMatch[];
  metadata: {
    totalMatches: number;
    dateRange: {
      from: string;
      to: string;
    };
    leagues: string[];
    seasons: string[];
  };
}
