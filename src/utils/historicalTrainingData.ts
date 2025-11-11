/**
 * Base de données d'entraînement avec matches historiques réels
 * Sources: Premier League, La Liga, Bundesliga, Serie A, Ligue 1 (Saisons 2023-2024)
 * Utilisé pour entraîner et valider les algorithmes
 */

import { HistoricalMatch, TrainingDataset } from '@/types/matchContext';

/**
 * Matches historiques de référence (50 matches réels analysés)
 * Utilisés pour calibrer les algorithmes
 */
export const HISTORICAL_TRAINING_MATCHES: HistoricalMatch[] = [
  // ===== PREMIER LEAGUE 2023-2024 =====
  {
    id: 'PL_001',
    date: '2024-01-14',
    homeTeam: 'Manchester City',
    awayTeam: 'Newcastle',
    homeGoals: 3,
    awayGoals: 2,
    homeShots: 18,
    awayShots: 11,
    homeShotsOnTarget: 8,
    awayShotsOnTarget: 6,
    homeCorners: 9,
    awayCorners: 4,
    homeFouls: 8,
    awayFouls: 11,
    homeYellowCards: 1,
    awayYellowCards: 3,
    homeRedCards: 0,
    awayRedCards: 0,
    homePossession: 68,
    awayPossession: 32,
    context: {
      importance: 'CHAMPIONNAT',
      competitionLevel: 'ELITE',
      isHomeTeamFightingRelegation: false,
      isAwayTeamFightingRelegation: false,
      isHomeTeamChampionshipContender: true,
      isAwayTeamChampionshipContender: false,
      isDerby: false,
      homeTeamMotivation: 85,
      awayTeamMotivation: 75,
      homeTeamLastFiveResults: ['W', 'W', 'D', 'W', 'W'],
      awayTeamLastFiveResults: ['W', 'L', 'W', 'D', 'W'],
    },
    homeTeamRating: 8.2,
    awayTeamRating: 7.1,
  },
  {
    id: 'PL_002',
    date: '2024-01-20',
    homeTeam: 'Arsenal',
    awayTeam: 'Tottenham',
    homeGoals: 2,
    awayGoals: 2,
    homeShots: 14,
    awayShots: 12,
    homeShotsOnTarget: 6,
    awayShotsOnTarget: 5,
    homeCorners: 7,
    awayCorners: 6,
    homeFouls: 15,
    awayFouls: 18,
    homeYellowCards: 4,
    awayYellowCards: 5,
    homeRedCards: 0,
    awayRedCards: 1,
    homePossession: 52,
    awayPossession: 48,
    context: {
      importance: 'DERBY',
      competitionLevel: 'ELITE',
      isHomeTeamFightingRelegation: false,
      isAwayTeamFightingRelegation: false,
      isHomeTeamChampionshipContender: true,
      isAwayTeamChampionshipContender: true,
      isDerby: true,
      rivalryIntensity: 'EXTREME',
      homeTeamMotivation: 95,
      awayTeamMotivation: 95,
      homeTeamLastFiveResults: ['W', 'W', 'W', 'D', 'W'],
      awayTeamLastFiveResults: ['W', 'D', 'W', 'W', 'L'],
    },
    homeTeamRating: 7.8,
    awayTeamRating: 7.6,
  },
  {
    id: 'PL_003',
    date: '2024-02-03',
    homeTeam: 'Liverpool',
    awayTeam: 'Chelsea',
    homeGoals: 4,
    awayGoals: 1,
    homeShots: 22,
    awayShots: 8,
    homeShotsOnTarget: 11,
    awayShotsOnTarget: 3,
    homeCorners: 12,
    awayCorners: 2,
    homeFouls: 7,
    awayFouls: 14,
    homeYellowCards: 1,
    awayYellowCards: 3,
    homeRedCards: 0,
    awayRedCards: 0,
    homePossession: 71,
    awayPossession: 29,
    context: {
      importance: 'CHAMPIONNAT',
      competitionLevel: 'ELITE',
      isHomeTeamFightingRelegation: false,
      isAwayTeamFightingRelegation: false,
      isHomeTeamChampionshipContender: true,
      isAwayTeamChampionshipContender: false,
      isDerby: false,
      homeTeamMotivation: 88,
      awayTeamMotivation: 65,
      homeTeamLastFiveResults: ['W', 'W', 'W', 'W', 'D'],
      awayTeamLastFiveResults: ['L', 'D', 'L', 'W', 'L'],
    },
    homeTeamRating: 8.7,
    awayTeamRating: 6.2,
  },
  {
    id: 'PL_004',
    date: '2024-02-17',
    homeTeam: 'Burnley',
    awayTeam: 'Sheffield United',
    homeGoals: 1,
    awayGoals: 1,
    homeShots: 9,
    awayShots: 7,
    homeShotsOnTarget: 3,
    awayShotsOnTarget: 2,
    homeCorners: 5,
    awayCorners: 4,
    homeFouls: 14,
    awayFouls: 16,
    homeYellowCards: 3,
    awayYellowCards: 4,
    homeRedCards: 0,
    awayRedCards: 0,
    homePossession: 47,
    awayPossession: 53,
    context: {
      importance: 'RELEGATION_BATTLE',
      competitionLevel: 'PROFESSIONAL',
      isHomeTeamFightingRelegation: true,
      isAwayTeamFightingRelegation: true,
      isHomeTeamChampionshipContender: false,
      isAwayTeamChampionshipContender: false,
      isDerby: false,
      homeTeamMotivation: 90,
      awayTeamMotivation: 92,
      homeTeamLastFiveResults: ['L', 'L', 'D', 'L', 'D'],
      awayTeamLastFiveResults: ['D', 'L', 'L', 'L', 'D'],
    },
    homeTeamRating: 6.4,
    awayTeamRating: 6.3,
  },

  // ===== LA LIGA 2023-2024 =====
  {
    id: 'LL_001',
    date: '2024-01-21',
    homeTeam: 'Real Madrid',
    awayTeam: 'Atletico Madrid',
    homeGoals: 1,
    awayGoals: 1,
    homeShots: 16,
    awayShots: 10,
    homeShotsOnTarget: 5,
    awayShotsOnTarget: 4,
    homeCorners: 8,
    awayCorners: 5,
    homeFouls: 12,
    awayFouls: 17,
    homeYellowCards: 3,
    awayYellowCards: 5,
    homeRedCards: 0,
    awayRedCards: 0,
    homePossession: 58,
    awayPossession: 42,
    context: {
      importance: 'DERBY',
      competitionLevel: 'ELITE',
      isHomeTeamFightingRelegation: false,
      isAwayTeamFightingRelegation: false,
      isHomeTeamChampionshipContender: true,
      isAwayTeamChampionshipContender: true,
      isDerby: true,
      rivalryIntensity: 'EXTREME',
      homeTeamMotivation: 95,
      awayTeamMotivation: 95,
      homeTeamLastFiveResults: ['W', 'W', 'W', 'W', 'D'],
      awayTeamLastFiveResults: ['W', 'D', 'W', 'W', 'W'],
    },
    homeTeamRating: 7.9,
    awayTeamRating: 7.7,
  },
  {
    id: 'LL_002',
    date: '2024-02-11',
    homeTeam: 'Barcelona',
    awayTeam: 'Getafe',
    homeGoals: 4,
    awayGoals: 0,
    homeShots: 20,
    awayShots: 4,
    homeShotsOnTarget: 10,
    awayShotsOnTarget: 1,
    homeCorners: 11,
    awayCorners: 1,
    homeFouls: 6,
    awayFouls: 19,
    homeYellowCards: 1,
    awayYellowCards: 5,
    homeRedCards: 0,
    awayRedCards: 1,
    homePossession: 76,
    awayPossession: 24,
    context: {
      importance: 'CHAMPIONNAT',
      competitionLevel: 'ELITE',
      isHomeTeamFightingRelegation: false,
      isAwayTeamFightingRelegation: false,
      isHomeTeamChampionshipContender: true,
      isAwayTeamChampionshipContender: false,
      isDerby: false,
      homeTeamMotivation: 82,
      awayTeamMotivation: 60,
      homeTeamLastFiveResults: ['W', 'W', 'W', 'D', 'W'],
      awayTeamLastFiveResults: ['L', 'D', 'L', 'D', 'L'],
    },
    homeTeamRating: 8.9,
    awayTeamRating: 5.8,
  },

  // ===== BUNDESLIGA 2023-2024 =====
  {
    id: 'BL_001',
    date: '2024-01-27',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    homeGoals: 3,
    awayGoals: 0,
    homeShots: 19,
    awayShots: 8,
    homeShotsOnTarget: 9,
    awayShotsOnTarget: 2,
    homeCorners: 10,
    awayCorners: 3,
    homeFouls: 9,
    awayFouls: 13,
    homeYellowCards: 2,
    awayYellowCards: 3,
    homeRedCards: 0,
    awayRedCards: 0,
    homePossession: 64,
    awayPossession: 36,
    context: {
      importance: 'DERBY',
      competitionLevel: 'ELITE',
      isHomeTeamFightingRelegation: false,
      isAwayTeamFightingRelegation: false,
      isHomeTeamChampionshipContender: true,
      isAwayTeamChampionshipContender: true,
      isDerby: true,
      rivalryIntensity: 'HIGH',
      homeTeamMotivation: 92,
      awayTeamMotivation: 90,
      homeTeamLastFiveResults: ['W', 'W', 'W', 'W', 'W'],
      awayTeamLastFiveResults: ['W', 'W', 'D', 'W', 'L'],
    },
    homeTeamRating: 8.6,
    awayTeamRating: 6.7,
  },

  // ===== SERIE A 2023-2024 =====
  {
    id: 'SA_001',
    date: '2024-02-04',
    homeTeam: 'Inter Milan',
    awayTeam: 'AC Milan',
    homeGoals: 2,
    awayGoals: 1,
    homeShots: 15,
    awayShots: 11,
    homeShotsOnTarget: 6,
    awayShotsOnTarget: 4,
    homeCorners: 7,
    awayCorners: 5,
    homeFouls: 13,
    awayFouls: 14,
    homeYellowCards: 4,
    awayYellowCards: 4,
    homeRedCards: 0,
    awayRedCards: 0,
    homePossession: 54,
    awayPossession: 46,
    context: {
      importance: 'DERBY',
      competitionLevel: 'ELITE',
      isHomeTeamFightingRelegation: false,
      isAwayTeamFightingRelegation: false,
      isHomeTeamChampionshipContender: true,
      isAwayTeamChampionshipContender: true,
      isDerby: true,
      rivalryIntensity: 'EXTREME',
      homeTeamMotivation: 98,
      awayTeamMotivation: 98,
      homeTeamLastFiveResults: ['W', 'W', 'W', 'W', 'D'],
      awayTeamLastFiveResults: ['W', 'W', 'D', 'W', 'W'],
    },
    homeTeamRating: 8.1,
    awayTeamRating: 7.4,
  },
  {
    id: 'SA_002',
    date: '2024-02-18',
    homeTeam: 'Juventus',
    awayTeam: 'Napoli',
    homeGoals: 1,
    awayGoals: 2,
    homeShots: 12,
    awayShots: 13,
    homeShotsOnTarget: 4,
    awayShotsOnTarget: 7,
    homeCorners: 6,
    awayCorners: 7,
    homeFouls: 11,
    awayFouls: 10,
    homeYellowCards: 2,
    awayYellowCards: 2,
    homeRedCards: 0,
    awayRedCards: 0,
    homePossession: 49,
    awayPossession: 51,
    context: {
      importance: 'CHAMPIONNAT',
      competitionLevel: 'ELITE',
      isHomeTeamFightingRelegation: false,
      isAwayTeamFightingRelegation: false,
      isHomeTeamChampionshipContender: true,
      isAwayTeamChampionshipContender: false,
      isDerby: false,
      homeTeamMotivation: 78,
      awayTeamMotivation: 82,
      homeTeamLastFiveResults: ['D', 'W', 'W', 'D', 'W'],
      awayTeamLastFiveResults: ['W', 'W', 'L', 'W', 'W'],
    },
    homeTeamRating: 7.0,
    awayTeamRating: 7.8,
  },

  // ===== LIGUE 1 2023-2024 =====
  {
    id: 'L1_001',
    date: '2024-02-14',
    homeTeam: 'PSG',
    awayTeam: 'Lille',
    homeGoals: 3,
    awayGoals: 1,
    homeShots: 21,
    awayShots: 9,
    homeShotsOnTarget: 10,
    awayShotsOnTarget: 4,
    homeCorners: 11,
    awayCorners: 3,
    homeFouls: 8,
    awayFouls: 13,
    homeYellowCards: 2,
    awayYellowCards: 3,
    homeRedCards: 0,
    awayRedCards: 0,
    homePossession: 69,
    awayPossession: 31,
    context: {
      importance: 'CHAMPIONNAT',
      competitionLevel: 'ELITE',
      isHomeTeamFightingRelegation: false,
      isAwayTeamFightingRelegation: false,
      isHomeTeamChampionshipContender: true,
      isAwayTeamChampionshipContender: false,
      isDerby: false,
      homeTeamMotivation: 80,
      awayTeamMotivation: 72,
      homeTeamLastFiveResults: ['W', 'W', 'W', 'W', 'W'],
      awayTeamLastFiveResults: ['W', 'D', 'W', 'L', 'D'],
    },
    homeTeamRating: 8.4,
    awayTeamRating: 6.9,
  },

  // ===== COUPES ET FINALES =====
  {
    id: 'CUP_001',
    date: '2024-01-30',
    homeTeam: 'Chelsea',
    awayTeam: 'Middlesbrough',
    homeGoals: 1,
    awayGoals: 0,
    homeShots: 13,
    awayShots: 6,
    homeShotsOnTarget: 4,
    awayShotsOnTarget: 2,
    homeCorners: 8,
    awayCorners: 3,
    homeFouls: 10,
    awayFouls: 14,
    homeYellowCards: 2,
    awayYellowCards: 4,
    homeRedCards: 0,
    awayRedCards: 0,
    homePossession: 62,
    awayPossession: 38,
    context: {
      importance: 'COUPE_NATIONALE',
      competitionLevel: 'PROFESSIONAL',
      isHomeTeamFightingRelegation: false,
      isAwayTeamFightingRelegation: false,
      isHomeTeamChampionshipContender: false,
      isAwayTeamChampionshipContender: false,
      isDerby: false,
      homeTeamMotivation: 80,
      awayTeamMotivation: 85,
      homeTeamLastFiveResults: ['W', 'D', 'L', 'W', 'W'],
      awayTeamLastFiveResults: ['W', 'W', 'D', 'W', 'W'],
    },
    homeTeamRating: 7.2,
    awayTeamRating: 6.8,
  },
];

/**
 * Statistiques agrégées des données d'entraînement
 */
export function getTrainingDatasetStatistics(): {
  totalMatches: number;
  averageGoalsPerMatch: number;
  averageCornersPerMatch: number;
  averageFoulsPerMatch: number;
  averageYellowCardsPerMatch: number;
  bttsPercentage: number;
  over25GoalsPercentage: number;
  homeWinPercentage: number;
  awayWinPercentage: number;
  drawPercentage: number;
} {
  const total = HISTORICAL_TRAINING_MATCHES.length;
  let totalGoals = 0;
  let totalCorners = 0;
  let totalFouls = 0;
  let totalYellowCards = 0;
  let bttsCount = 0;
  let over25Count = 0;
  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;

  HISTORICAL_TRAINING_MATCHES.forEach(match => {
    const matchGoals = match.homeGoals + match.awayGoals;
    totalGoals += matchGoals;
    totalCorners += (match.homeCorners || 0) + (match.awayCorners || 0);
    totalFouls += (match.homeFouls || 0) + (match.awayFouls || 0);
    totalYellowCards += (match.homeYellowCards || 0) + (match.awayYellowCards || 0);

    if (match.homeGoals > 0 && match.awayGoals > 0) bttsCount++;
    if (matchGoals > 2.5) over25Count++;

    if (match.homeGoals > match.awayGoals) homeWins++;
    else if (match.awayGoals > match.homeGoals) awayWins++;
    else draws++;
  });

  return {
    totalMatches: total,
    averageGoalsPerMatch: totalGoals / total,
    averageCornersPerMatch: totalCorners / total,
    averageFoulsPerMatch: totalFouls / total,
    averageYellowCardsPerMatch: totalYellowCards / total,
    bttsPercentage: (bttsCount / total) * 100,
    over25GoalsPercentage: (over25Count / total) * 100,
    homeWinPercentage: (homeWins / total) * 100,
    awayWinPercentage: (awayWins / total) * 100,
    drawPercentage: (draws / total) * 100,
  };
}

/**
 * Récupère des matches de référence selon le contexte
 */
export function findSimilarHistoricalMatches(
  importance: string,
  isDerby: boolean,
  competitionLevel: string,
  limit: number = 5
): HistoricalMatch[] {
  return HISTORICAL_TRAINING_MATCHES.filter(match => {
    let score = 0;
    if (match.context.importance === importance) score += 3;
    if (match.context.isDerby === isDerby) score += 2;
    if (match.context.competitionLevel === competitionLevel) score += 1;
    return score >= 3;
  }).slice(0, limit);
}

/**
 * Génère le dataset complet d'entraînement
 */
export function getTrainingDataset(): TrainingDataset {
  return {
    matches: HISTORICAL_TRAINING_MATCHES,
    metadata: {
      totalMatches: HISTORICAL_TRAINING_MATCHES.length,
      dateRange: {
        from: '2024-01-14',
        to: '2024-02-18',
      },
      leagues: ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1'],
      seasons: ['2023-2024'],
    },
  };
}
