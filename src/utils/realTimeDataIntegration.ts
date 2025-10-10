import { TeamStats } from '../types/football';

// Intégration de données temps réel pour prédictions ultra-précises
export interface RealTimeData {
  weather: {
    condition: 'sunny' | 'rainy' | 'windy' | 'snowy' | 'foggy';
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    visibility: number;
    lastUpdated: string;
  };
  injuries: {
    home: PlayerInjury[];
    away: PlayerInjury[];
    lastUpdated: string;
  };
  suspensions: {
    home: PlayerSuspension[];
    away: PlayerSuspension[];
    lastUpdated: string;
  };
  teamNews: {
    home: TeamNews[];
    away: TeamNews[];
    lastUpdated: string;
  };
  marketOdds: {
    over25: number;
    btts: number;
    corners: number;
    cards: number;
    homeWin: number;
    draw: number;
    awayWin: number;
    lastUpdated: string;
  };
  referee: {
    name: string;
    experience: number;
    strictness: number;
    avgCards: number;
    avgFouls: number;
    homeBias: number;
    lastUpdated: string;
  };
  venue: {
    name: string;
    capacity: number;
    pitchSize: { length: number; width: number };
    grassType: 'natural' | 'hybrid' | 'artificial';
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    lastUpdated: string;
  };
}

export interface PlayerInjury {
  name: string;
  position: string;
  injury: string;
  severity: 'minor' | 'moderate' | 'major';
  expectedReturn: string;
  impact: number; // 0-1, impact sur la performance
}

export interface PlayerSuspension {
  name: string;
  position: string;
  reason: string;
  matches: number;
  impact: number; // 0-1, impact sur la performance
}

export interface TeamNews {
  type: 'tactical' | 'formation' | 'motivation' | 'other';
  title: string;
  description: string;
  impact: number; // 0-1, impact sur la performance
  confidence: number; // 0-1, fiabilité de la nouvelle
}

// Simulation de données temps réel (en réalité, ce serait des API externes)
export function fetchRealTimeData(
  homeTeam: string,
  awayTeam: string,
  matchDate: string
): RealTimeData {
  return {
    weather: {
      condition: getRandomWeatherCondition(),
      temperature: Math.floor(Math.random() * 20) + 5,
      humidity: Math.floor(Math.random() * 40) + 40,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      precipitation: Math.floor(Math.random() * 20),
      visibility: Math.floor(Math.random() * 5) + 5,
      lastUpdated: new Date().toISOString()
    },
    injuries: {
      home: generateRandomInjuries(homeTeam),
      away: generateRandomInjuries(awayTeam),
      lastUpdated: new Date().toISOString()
    },
    suspensions: {
      home: generateRandomSuspensions(homeTeam),
      away: generateRandomSuspensions(awayTeam),
      lastUpdated: new Date().toISOString()
    },
    teamNews: {
      home: generateRandomTeamNews(homeTeam),
      away: generateRandomTeamNews(awayTeam),
      lastUpdated: new Date().toISOString()
    },
    marketOdds: {
      over25: Math.random() * 0.4 + 0.3,
      btts: Math.random() * 0.4 + 0.3,
      corners: Math.random() * 0.4 + 0.3,
      cards: Math.random() * 0.4 + 0.3,
      homeWin: Math.random() * 0.4 + 0.3,
      draw: Math.random() * 0.2 + 0.2,
      awayWin: Math.random() * 0.4 + 0.3,
      lastUpdated: new Date().toISOString()
    },
    referee: {
      name: getRandomRefereeName(),
      experience: Math.floor(Math.random() * 20) + 5,
      strictness: Math.random(),
      avgCards: Math.random() * 2 + 2,
      avgFouls: Math.random() * 10 + 15,
      homeBias: (Math.random() - 0.5) * 0.2,
      lastUpdated: new Date().toISOString()
    },
    venue: {
      name: `${homeTeam} Stadium`,
      capacity: Math.floor(Math.random() * 50000) + 30000,
      pitchSize: { length: 105, width: 68 },
      grassType: ['natural', 'hybrid', 'artificial'][Math.floor(Math.random() * 3)] as any,
      condition: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)] as any,
      lastUpdated: new Date().toISOString()
    }
  };
}

// Calcul de l'impact des données temps réel
export function calculateRealTimeImpact(
  realTimeData: RealTimeData,
  basePredictions: any
): {
  adjustedPredictions: any;
  confidenceAdjustment: number;
  riskFactors: string[];
  opportunities: string[];
} {
  const riskFactors: string[] = [];
  const opportunities: string[] = [];
  let confidenceAdjustment = 0;
  
  // Impact météorologique
  const weatherImpact = calculateWeatherImpact(realTimeData.weather);
  if (weatherImpact.risk > 0.7) {
    riskFactors.push(`Conditions météo difficiles: ${realTimeData.weather.condition}`);
  }
  if (weatherImpact.opportunity > 0.7) {
    opportunities.push(`Conditions météo favorables: ${realTimeData.weather.condition}`);
  }
  
  // Impact des blessures
  const injuryImpact = calculateInjuryImpact(realTimeData.injuries);
  if (injuryImpact.home > 0.3) {
    riskFactors.push(`${injuryImpact.home * 100}% d'impact des blessures domicile`);
  }
  if (injuryImpact.away > 0.3) {
    opportunities.push(`${injuryImpact.away * 100}% d'impact des blessures extérieur`);
  }
  
  // Impact des suspensions
  const suspensionImpact = calculateSuspensionImpact(realTimeData.suspensions);
  if (suspensionImpact.home > 0.2) {
    riskFactors.push(`${suspensionImpact.home * 100}% d'impact des suspensions domicile`);
  }
  if (suspensionImpact.away > 0.2) {
    opportunities.push(`${suspensionImpact.away * 100}% d'impact des suspensions extérieur`);
  }
  
  // Impact de l'arbitre
  const refereeImpact = calculateRefereeImpact(realTimeData.referee);
  if (realTimeData.referee.strictness > 0.8) {
    riskFactors.push(`Arbitre strict: ${realTimeData.referee.name}`);
  }
  if (realTimeData.referee.strictness < 0.3) {
    opportunities.push(`Arbitre permissif: ${realTimeData.referee.name}`);
  }
  
  // Impact des cotes du marché
  const marketImpact = calculateMarketImpact(realTimeData.marketOdds, basePredictions);
  if (marketImpact.value > 0.1) {
    opportunities.push(`Valeur détectée sur le marché: ${marketImpact.value * 100}%`);
  }
  if (marketImpact.risk > 0.1) {
    riskFactors.push(`Risque de marché: ${marketImpact.risk * 100}%`);
  }
  
  // Ajustement de la confiance
  confidenceAdjustment += weatherImpact.confidence;
  confidenceAdjustment += injuryImpact.confidence;
  confidenceAdjustment += suspensionImpact.confidence;
  confidenceAdjustment += refereeImpact.confidence;
  confidenceAdjustment += marketImpact.confidence;
  
  // Ajustement des prédictions
  const adjustedPredictions = { ...basePredictions };
  
  // Ajuster les prédictions de buts
  if (adjustedPredictions.expectedGoals) {
    adjustedPredictions.expectedGoals.home *= weatherImpact.goalsMultiplier;
    adjustedPredictions.expectedGoals.away *= weatherImpact.goalsMultiplier;
  }
  
  // Ajuster les prédictions de corners
  if (adjustedPredictions.corners) {
    adjustedPredictions.corners.predicted *= weatherImpact.cornersMultiplier;
  }
  
  // Ajuster les prédictions de cartons
  if (adjustedPredictions.yellowCards) {
    adjustedPredictions.yellowCards.predicted *= refereeImpact.cardsMultiplier;
  }
  
  // Ajuster les prédictions de fautes
  if (adjustedPredictions.fouls) {
    adjustedPredictions.fouls.predicted *= refereeImpact.foulsMultiplier;
  }
  
  return {
    adjustedPredictions,
    confidenceAdjustment: Math.min(20, confidenceAdjustment),
    riskFactors,
    opportunities
  };
}

// Fonctions utilitaires
function getRandomWeatherCondition(): 'sunny' | 'rainy' | 'windy' | 'snowy' | 'foggy' {
  const conditions = ['sunny', 'rainy', 'windy', 'snowy', 'foggy'];
  return conditions[Math.floor(Math.random() * conditions.length)] as any;
}

function getRandomRefereeName(): string {
  const referees = [
    'Anthony Taylor', 'Michael Oliver', 'Paul Tierney', 'Craig Pawson',
    'Stuart Attwell', 'David Coote', 'Peter Bankes', 'Jarred Gillett'
  ];
  return referees[Math.floor(Math.random() * referees.length)];
}

function generateRandomInjuries(team: string): PlayerInjury[] {
  const injuries: PlayerInjury[] = [];
  const numInjuries = Math.floor(Math.random() * 3);
  
  for (let i = 0; i < numInjuries; i++) {
    injuries.push({
      name: `Player ${i + 1}`,
      position: ['GK', 'DEF', 'MID', 'FWD'][Math.floor(Math.random() * 4)],
      injury: ['Muscle', 'Knee', 'Ankle', 'Back'][Math.floor(Math.random() * 4)],
      severity: ['minor', 'moderate', 'major'][Math.floor(Math.random() * 3)] as any,
      expectedReturn: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      impact: Math.random() * 0.5
    });
  }
  
  return injuries;
}

function generateRandomSuspensions(team: string): PlayerSuspension[] {
  const suspensions: PlayerSuspension[] = [];
  const numSuspensions = Math.floor(Math.random() * 2);
  
  for (let i = 0; i < numSuspensions; i++) {
    suspensions.push({
      name: `Player ${i + 1}`,
      position: ['GK', 'DEF', 'MID', 'FWD'][Math.floor(Math.random() * 4)],
      reason: ['Red Card', 'Yellow Cards', 'Disciplinary'][Math.floor(Math.random() * 3)],
      matches: Math.floor(Math.random() * 3) + 1,
      impact: Math.random() * 0.4
    });
  }
  
  return suspensions;
}

function generateRandomTeamNews(team: string): TeamNews[] {
  const news: TeamNews[] = [];
  const numNews = Math.floor(Math.random() * 3);
  
  for (let i = 0; i < numNews; i++) {
    news.push({
      type: ['tactical', 'formation', 'motivation', 'other'][Math.floor(Math.random() * 4)] as any,
      title: `News ${i + 1}`,
      description: `Description of news ${i + 1}`,
      impact: Math.random() * 0.3,
      confidence: Math.random() * 0.5 + 0.5
    });
  }
  
  return news;
}

function calculateWeatherImpact(weather: RealTimeData['weather']) {
  const impacts = {
    sunny: { goals: 1.0, corners: 1.0, fouls: 0.95, cards: 0.95, risk: 0.1, opportunity: 0.8 },
    rainy: { goals: 0.85, corners: 1.1, fouls: 1.15, cards: 1.1, risk: 0.8, opportunity: 0.2 },
    windy: { goals: 0.9, corners: 1.2, fouls: 1.05, cards: 1.0, risk: 0.6, opportunity: 0.4 },
    snowy: { goals: 0.75, corners: 1.3, fouls: 1.25, cards: 1.15, risk: 0.9, opportunity: 0.1 },
    foggy: { goals: 0.8, corners: 0.9, fouls: 1.1, cards: 1.05, risk: 0.7, opportunity: 0.3 }
  };
  
  const impact = impacts[weather.condition];
  return {
    goalsMultiplier: impact.goals,
    cornersMultiplier: impact.corners,
    foulsMultiplier: impact.fouls,
    cardsMultiplier: impact.cards,
    risk: impact.risk,
    opportunity: impact.opportunity,
    confidence: 10
  };
}

function calculateInjuryImpact(injuries: { home: PlayerInjury[]; away: PlayerInjury[] }) {
  const homeImpact = injuries.home.reduce((sum, injury) => sum + injury.impact, 0);
  const awayImpact = injuries.away.reduce((sum, injury) => sum + injury.impact, 0);
  
  return {
    home: homeImpact,
    away: awayImpact,
    confidence: injuries.home.length + injuries.away.length > 0 ? 15 : 0
  };
}

function calculateSuspensionImpact(suspensions: { home: PlayerSuspension[]; away: PlayerSuspension[] }) {
  const homeImpact = suspensions.home.reduce((sum, suspension) => sum + suspension.impact, 0);
  const awayImpact = suspensions.away.reduce((sum, suspension) => sum + suspension.impact, 0);
  
  return {
    home: homeImpact,
    away: awayImpact,
    confidence: suspensions.home.length + suspensions.away.length > 0 ? 12 : 0
  };
}

function calculateRefereeImpact(referee: RealTimeData['referee']) {
  return {
    cardsMultiplier: 1 + (referee.strictness - 0.5) * 0.4,
    foulsMultiplier: 1 + (referee.strictness - 0.5) * 0.3,
    confidence: 8
  };
}

function calculateMarketImpact(marketOdds: RealTimeData['marketOdds'], basePredictions: any) {
  // Calcul de la valeur du marché par rapport aux prédictions
  const value = Math.abs(marketOdds.over25 - (basePredictions.overUnder25Goals?.over || 0.5));
  const risk = value > 0.2 ? 0.3 : 0.1;
  
  return {
    value: value,
    risk: risk,
    confidence: 5
  };
}
