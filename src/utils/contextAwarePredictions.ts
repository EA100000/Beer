import { TeamStats } from '../types/football';

// Facteurs contextuels avancés pour améliorer la précision
export interface ContextualFactors {
  weather: {
    condition: 'sunny' | 'rainy' | 'windy' | 'snowy' | 'foggy';
    temperature: number;
    humidity: number;
    windSpeed: number;
    impact: {
      goals: number; // Multiplier pour les buts
      corners: number; // Multiplier pour les corners
      fouls: number; // Multiplier pour les fautes
      cards: number; // Multiplier pour les cartons
    };
  };
  referee: {
    name: string;
    strictness: number; // 0-1, 1 = très strict
    avgCardsPerMatch: number;
    avgFoulsPerMatch: number;
    homeBias: number; // -0.1 à 0.1, biais pour l'équipe domicile
  };
  injuries: {
    home: {
      keyPlayers: string[];
      defenders: number;
      midfielders: number;
      forwards: number;
      impact: number; // 0-1, impact sur la performance
    };
    away: {
      keyPlayers: string[];
      defenders: number;
      midfielders: number;
      forwards: number;
      impact: number;
    };
  };
  motivation: {
    home: {
      leaguePosition: number;
      pointsFromRelegation: number;
      pointsFromEurope: number;
      recentForm: number; // -1 à 1, forme récente
      derby: boolean;
      cupMatch: boolean;
      importance: number; // 0-1, importance du match
    };
    away: {
      leaguePosition: number;
      pointsFromRelegation: number;
      pointsFromEurope: number;
      recentForm: number;
      derby: boolean;
      cupMatch: boolean;
      importance: number;
    };
  };
  headToHead: {
    last5Meetings: Array<{
      date: string;
      homeScore: number;
      awayScore: number;
      homeTeam: string;
      awayTeam: string;
      competition: string;
    }>;
    homeAdvantage: number; // 0-1, avantage domicile dans les H2H
    avgGoals: number;
    avgCorners: number;
    avgCards: number;
    trends: {
      over25: number; // % de matchs over 2.5
      btts: number; // % de matchs BTTS
      homeWins: number; // % de victoires domicile
    };
  };
  tactical: {
    home: {
      formation: string;
      style: 'attacking' | 'defensive' | 'balanced' | 'counter';
      pressIntensity: number; // 0-1
      possessionStyle: 'short' | 'long' | 'mixed';
      setPieceStrength: number; // 0-1
    };
    away: {
      formation: string;
      style: 'attacking' | 'defensive' | 'balanced' | 'counter';
      pressIntensity: number;
      possessionStyle: 'short' | 'long' | 'mixed';
      setPieceStrength: number;
    };
  };
}

// Base de données des arbitres avec leurs statistiques
const REFEREE_DATABASE = {
  'Anthony Taylor': { strictness: 0.7, avgCards: 3.2, avgFouls: 22.1, homeBias: 0.02 },
  'Michael Oliver': { strictness: 0.6, avgCards: 2.8, avgFouls: 20.5, homeBias: -0.01 },
  'Paul Tierney': { strictness: 0.8, avgCards: 3.8, avgFouls: 25.3, homeBias: 0.03 },
  'Craig Pawson': { strictness: 0.5, avgCards: 2.2, avgFouls: 18.7, homeBias: -0.02 },
  'Stuart Attwell': { strictness: 0.9, avgCards: 4.1, avgFouls: 28.2, homeBias: 0.01 },
  'default': { strictness: 0.6, avgCards: 3.0, avgFouls: 22.0, homeBias: 0.0 }
};

// Impact météorologique sur les statistiques
const WEATHER_IMPACT = {
  sunny: { goals: 1.0, corners: 1.0, fouls: 0.95, cards: 0.95 },
  rainy: { goals: 0.85, corners: 1.1, fouls: 1.15, cards: 1.1 },
  windy: { goals: 0.9, corners: 1.2, fouls: 1.05, cards: 1.0 },
  snowy: { goals: 0.75, corners: 1.3, fouls: 1.25, cards: 1.15 },
  foggy: { goals: 0.8, corners: 0.9, fouls: 1.1, cards: 1.05 }
};

// Calcul de l'impact contextuel sur les prédictions
export function calculateContextualImpact(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  context: ContextualFactors
): {
  goalsMultiplier: { home: number; away: number };
  cornersMultiplier: number;
  foulsMultiplier: number;
  cardsMultiplier: number;
  bttsMultiplier: number;
  confidenceAdjustment: number;
} {
  // Impact météorologique
  const weatherImpact = WEATHER_IMPACT[context.weather.condition];
  
  // Impact de l'arbitre
  const refereeImpact = {
    cards: 1 + (context.referee.strictness - 0.5) * 0.4,
    fouls: 1 + (context.referee.strictness - 0.5) * 0.3
  };
  
  // Impact des blessures
  const injuryImpact = {
    home: 1 - context.injuries.home.impact * 0.3,
    away: 1 - context.injuries.away.impact * 0.3
  };
  
  // Impact de la motivation
  const motivationImpact = {
    home: 1 + (context.motivation.home.importance - 0.5) * 0.4,
    away: 1 + (context.motivation.away.importance - 0.5) * 0.4
  };
  
  // Impact tactique
  const tacticalImpact = {
    home: context.tactical.home.style === 'attacking' ? 1.1 : 
          context.tactical.home.style === 'defensive' ? 0.9 : 1.0,
    away: context.tactical.away.style === 'attacking' ? 1.1 : 
          context.tactical.away.style === 'defensive' ? 0.9 : 1.0
  };
  
  // Calcul des multiplicateurs finaux
  const goalsMultiplier = {
    home: weatherImpact.goals * injuryImpact.home * motivationImpact.home * tacticalImpact.home,
    away: weatherImpact.goals * injuryImpact.away * motivationImpact.away * tacticalImpact.away
  };
  
  const cornersMultiplier = weatherImpact.corners * 
    (1 + (context.tactical.home.pressIntensity + context.tactical.away.pressIntensity) * 0.2);
  
  const foulsMultiplier = weatherImpact.fouls * refereeImpact.fouls * 
    (1 + (context.tactical.home.pressIntensity + context.tactical.away.pressIntensity) * 0.3);
  
  const cardsMultiplier = weatherImpact.cards * refereeImpact.cards * 
    (1 + Math.abs(context.motivation.home.importance - context.motivation.away.importance) * 0.4);
  
  const bttsMultiplier = (injuryImpact.home + injuryImpact.away) / 2 * 
    (1 + (context.tactical.home.style === 'attacking' ? 0.1 : 0) + 
     (context.tactical.away.style === 'attacking' ? 0.1 : 0));
  
  // Ajustement de la confiance basé sur la qualité du contexte
  let confidenceAdjustment = 0;
  
  // Bonus pour données contextuelles complètes
  if (context.weather.condition !== 'sunny' || context.referee.name !== 'default') {
    confidenceAdjustment += 5;
  }
  
  if (context.injuries.home.keyPlayers.length > 0 || context.injuries.away.keyPlayers.length > 0) {
    confidenceAdjustment += 8;
  }
  
  if (context.headToHead.last5Meetings.length > 0) {
    confidenceAdjustment += 10;
  }
  
  if (context.motivation.home.derby || context.motivation.away.derby) {
    confidenceAdjustment += 5;
  }
  
  return {
    goalsMultiplier,
    cornersMultiplier,
    foulsMultiplier,
    cardsMultiplier,
    bttsMultiplier,
    confidenceAdjustment
  };
}

// Génération de facteurs contextuels par défaut
export function generateDefaultContext(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  league: string = 'premier-league'
): ContextualFactors {
  return {
    weather: {
      condition: 'sunny',
      temperature: 20,
      humidity: 60,
      windSpeed: 10,
      impact: { goals: 1.0, corners: 1.0, fouls: 1.0, cards: 1.0 }
    },
    referee: {
      name: 'default',
      strictness: 0.6,
      avgCardsPerMatch: 3.0,
      avgFoulsPerMatch: 22.0,
      homeBias: 0.0
    },
    injuries: {
      home: {
        keyPlayers: [],
        defenders: 0,
        midfielders: 0,
        forwards: 0,
        impact: 0
      },
      away: {
        keyPlayers: [],
        defenders: 0,
        midfielders: 0,
        forwards: 0,
        impact: 0
      }
    },
    motivation: {
      home: {
        leaguePosition: 10,
        pointsFromRelegation: 15,
        pointsFromEurope: 8,
        recentForm: 0,
        derby: false,
        cupMatch: false,
        importance: 0.5
      },
      away: {
        leaguePosition: 12,
        pointsFromRelegation: 12,
        pointsFromEurope: 10,
        recentForm: 0,
        derby: false,
        cupMatch: false,
        importance: 0.5
      }
    },
    headToHead: {
      last5Meetings: [],
      homeAdvantage: 0.1,
      avgGoals: 2.5,
      avgCorners: 10,
      avgCards: 3,
      trends: {
        over25: 0.6,
        btts: 0.5,
        homeWins: 0.4
      }
    },
    tactical: {
      home: {
        formation: '4-3-3',
        style: 'balanced',
        pressIntensity: 0.5,
        possessionStyle: 'mixed',
        setPieceStrength: 0.5
      },
      away: {
        formation: '4-3-3',
        style: 'balanced',
        pressIntensity: 0.5,
        possessionStyle: 'mixed',
        setPieceStrength: 0.5
      }
    }
  };
}

// Amélioration des prédictions avec le contexte
export function enhancePredictionsWithContext(
  basePredictions: any,
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  context: ContextualFactors
): any {
  const impact = calculateContextualImpact(homeTeam, awayTeam, context);
  
  // Appliquer les multiplicateurs contextuels
  const enhancedPredictions = { ...basePredictions };
  
  // Ajuster les prédictions de buts
  if (enhancedPredictions.expectedGoals) {
    enhancedPredictions.expectedGoals.home *= impact.goalsMultiplier.home;
    enhancedPredictions.expectedGoals.away *= impact.goalsMultiplier.away;
  }
  
  // Ajuster les prédictions de corners
  if (enhancedPredictions.corners) {
    enhancedPredictions.corners.predicted *= impact.cornersMultiplier;
    enhancedPredictions.corners.confidence = Math.min(95, 
      enhancedPredictions.corners.confidence + impact.confidenceAdjustment * 0.5
    );
  }
  
  // Ajuster les prédictions de fautes
  if (enhancedPredictions.fouls) {
    enhancedPredictions.fouls.predicted *= impact.foulsMultiplier;
    enhancedPredictions.fouls.confidence = Math.min(95, 
      enhancedPredictions.fouls.confidence + impact.confidenceAdjustment * 0.5
    );
  }
  
  // Ajuster les prédictions de cartons
  if (enhancedPredictions.yellowCards) {
    enhancedPredictions.yellowCards.predicted *= impact.cardsMultiplier;
    enhancedPredictions.yellowCards.confidence = Math.min(95, 
      enhancedPredictions.yellowCards.confidence + impact.confidenceAdjustment * 0.5
    );
  }
  
  // Ajuster BTTS
  if (enhancedPredictions.btts) {
    const bttsProb = enhancedPredictions.btts.yes / 100;
    const adjustedProb = Math.min(0.95, bttsProb * impact.bttsMultiplier);
    enhancedPredictions.btts.yes = Math.round(adjustedProb * 100);
    enhancedPredictions.btts.no = 100 - enhancedPredictions.btts.yes;
  }
  
  // Ajuster la confiance globale
  if (enhancedPredictions.confidence) {
    enhancedPredictions.confidence = Math.min(98, 
      enhancedPredictions.confidence + impact.confidenceAdjustment
    );
  }
  
  return enhancedPredictions;
}
