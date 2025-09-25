export interface TeamStats {
  name: string;
  sofascoreRating: number;
  matches: number;
  goalsScored: number;
  goalsConceded: number;
  assists: number;
  goalsPerMatch: number;
  shotsOnTargetPerMatch: number;
  bigChancesPerMatch: number;
  bigChancesMissedPerMatch: number;
  possession: number;
  accuracyPerMatch: number;
  longBallsAccuratePerMatch: number;
  cleanSheets: number;
  goalsConcededPerMatch: number;
  interceptionsPerMatch: number;
  tacklesPerMatch: number;
  clearancesPerMatch: number;
  penaltyConceded: number;
  throwInsPerMatch: number;
  yellowCardsPerMatch: number;
  // Nouvelles données ajoutées
  duelsWonPerMatch: number;
  offsidesPerMatch: number;
  goalKicksPerMatch: number;
  redCardsPerMatch: number;
}

export interface MatchPrediction {
  overUnder15Goals: {
    over: number;
    under: number;
    prediction: 'OVER' | 'UNDER';
  };
  overUnder25Goals: {
    over: number;
    under: number;
    prediction: 'OVER' | 'UNDER';
  };
  btts: {
    yes: number;
    no: number;
    prediction: 'YES' | 'NO';
  };
  corners: {
    predicted: number;
    confidence: number;
    threshold: number;
    over: number;
  };
  throwIns: {
    predicted: number;
    confidence: number;
    threshold: number;
    over: number;
  };
  fouls: {
    predicted: number;
    confidence: number;
    threshold: number;
    over: number;
  };
  yellowCards: {
    predicted: number;
    confidence: number;
    threshold: number;
    over: number;
  };
  redCards: {
    predicted: number;
    confidence: number;
    threshold: number;
    over: number;
  };
  duels: {
    predicted: number;
    confidence: number;
    threshold: number;
    over: number;
  };
  offsides: {
    predicted: number;
    confidence: number;
    threshold: number;
    over: number;
  };
  goalKicks: {
    predicted: number;
    confidence: number;
    threshold: number;
    over: number;
  };
  winProbabilities: {
    home: number;
    draw: number;
    away: number;
  };
  expectedGoals: {
    home: number;
    away: number;
  };
  mostLikelyScorelines: Array<{
    score: string;
    probability: number;
  }>;
  modelMetrics: {
    confidence: number;
    dataQuality: number;
    modelAgreement: number;
    statisticalSignificance: number;
    homeStrength: number;
    awayStrength: number;
  };
  advancedMetrics: {
    expectedShotsOnTarget: number;
    expectedBigChances: number;
    possessionPrediction: number;
    intensityScore: number;
    valueRating: number;
  };
}

export interface AnalysisResult {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  prediction: MatchPrediction;
  confidence: number;
}