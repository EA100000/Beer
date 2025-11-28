/**
 * Types TypeScript pour l'analyse Tennis
 * Système de prédiction pour ATP/WTA
 */

export interface TennisPlayerStats {
  // Statistiques générales
  ranking: number;
  aces_per_match: number;
  double_faults_per_match: number;
  first_serve_percentage: number;
  first_serve_points_won: number;
  second_serve_points_won: number;
  break_points_saved: number;
  service_games_won: number;

  // Performance retour
  first_serve_return_won: number;
  second_serve_return_won: number;
  break_points_converted: number;
  return_games_won: number;

  // Forme récente
  wins_last_5: number;
  sets_won_last_5: number;

  // Contexte
  h2h_wins: number;
  surface_win_rate: number;
}

export type TennisSurface = 'hard' | 'clay' | 'grass' | 'carpet';

export type TennisTournamentLevel =
  | 'grand_slam'
  | 'masters_1000'
  | 'atp_500'
  | 'atp_250'
  | 'challenger'
  | 'wta_1000'
  | 'wta_500'
  | 'wta_250';

export interface TennisMatchContext {
  surface: TennisSurface;
  tournament_level: TennisTournamentLevel;
  best_of: 3 | 5;
  indoor: boolean;
}

export interface TennisOverUnder {
  line: number;
  prediction: 'over' | 'under';
  confidence: number;
}

export interface TennisPrediction {
  // Vainqueur
  winner: string;
  confidence: number;
  predicted_sets: string;

  // Marchés Over/Under
  total_games_over_under: TennisOverUnder;
  aces_over_under: TennisOverUnder;

  // Autres marchés
  break_of_serve: {
    prediction: 'yes' | 'no';
    confidence: number;
  };

  // Détails additionnels
  player1_rating?: number;
  player2_rating?: number;
  match_quality_score?: number;
}

export interface TennisAnalysisResult {
  player1: TennisPlayerStats;
  player2: TennisPlayerStats;
  context: TennisMatchContext;
  prediction: TennisPrediction;
  timestamp: string;
}

/**
 * Constantes pour l'analyse tennis
 */
export const TENNIS_CONSTANTS = {
  // Moyennes ATP
  ATP_AVERAGES: {
    aces_per_match: 6.5,
    double_faults_per_match: 2.8,
    first_serve_percentage: 62,
    first_serve_points_won: 72,
    second_serve_points_won: 52,
    break_points_saved: 62,
    first_serve_return_won: 32,
    break_points_converted: 40,
  },

  // Moyennes WTA
  WTA_AVERAGES: {
    aces_per_match: 2.5,
    double_faults_per_match: 3.2,
    first_serve_percentage: 60,
    first_serve_points_won: 65,
    second_serve_points_won: 48,
    break_points_saved: 55,
    first_serve_return_won: 38,
    break_points_converted: 45,
  },

  // Facteurs de surface
  SURFACE_FACTORS: {
    hard: {
      ace_multiplier: 1.0,
      break_multiplier: 1.0,
      game_speed: 'medium',
    },
    clay: {
      ace_multiplier: 0.7,
      break_multiplier: 1.3,
      game_speed: 'slow',
    },
    grass: {
      ace_multiplier: 1.4,
      break_multiplier: 0.7,
      game_speed: 'fast',
    },
    carpet: {
      ace_multiplier: 1.2,
      break_multiplier: 0.8,
      game_speed: 'fast',
    },
  },

  // Lignes Over/Under standards
  STANDARD_LINES: {
    best_of_3: {
      total_games: 22.5,
      aces: 10.5,
    },
    best_of_5: {
      total_games: 38.5,
      aces: 18.5,
    },
  },
};
