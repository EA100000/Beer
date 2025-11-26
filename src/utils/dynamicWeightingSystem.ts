/**
 * SYSTÈME DE PONDÉRATION DYNAMIQUE ULTRA-INTELLIGENT
 *
 * Ajuste automatiquement les poids de chaque facteur selon:
 * - Phase du match (0-15', 15-30', 30-45', 45-60', 60-75', 75-90')
 * - Score actuel (équilibré, avantage home, avantage away)
 * - État du jeu (offensif, défensif, équilibré)
 * - Momentum des équipes
 */

export interface DynamicWeights {
  // Poids pour les prédictions de buts
  goals: {
    prematchData: number;      // Importance des données pré-match
    currentScore: number;       // Importance du score actuel
    xGoals: number;            // Expected Goals
    shotQuality: number;       // Qualité des tirs
    bigChances: number;        // Grosses occasions
    momentum: number;          // Dynamique actuelle
    possession: number;        // Possession
    attacks: number;           // Attaques
  };

  // Poids pour les prédictions de corners
  corners: {
    currentRate: number;       // Rythme actuel
    prematchRate: number;      // Rythme historique
    possession: number;        // Possession
    attacks: number;           // Nombre d'attaques
    crosses: number;           // Centres
    setPlayActivity: number;   // Activité coups de pied arrêtés
    gameState: number;         // État du match (ouvert/fermé)
  };

  // Poids pour les prédictions de fautes
  fouls: {
    currentRate: number;       // Rythme actuel
    physicalIntensity: number; // Intensité physique
    cardRate: number;          // Taux de cartons
    gameState: number;         // État du match
    scoreDifferential: number; // Différence de score
    timeRemaining: number;     // Temps restant
  };

  // Poids pour les prédictions de cartons
  cards: {
    currentRate: number;       // Rythme actuel
    foulAggression: number;    // Agressivité des fautes
    gameIntensity: number;     // Intensité du match
    scoreTension: number;      // Tension liée au score
    timePhase: number;         // Phase du match
  };

  // Poids pour BTTS (Both Teams To Score)
  btts: {
    xGoalsBoth: number;        // xG des deux équipes
    shotQuality: number;       // Qualité des tirs
    defensiveWeakness: number; // Faiblesse défensive
    currentScore: number;      // Score actuel
    momentum: number;          // Momentum des deux équipes
    timeRemaining: number;     // Temps restant
  };

  // Métadonnées
  phase: string;
  confidence: number;
}

/**
 * Calcule les poids dynamiques selon la phase du match
 */
export function calculateDynamicWeights(
  minute: number,
  homeScore: number,
  awayScore: number,
  gameState: 'balanced' | 'home-dominating' | 'away-dominating' | 'defensive' | 'open',
  homeAdvantage: number,
  intensity: 'low' | 'medium' | 'high' | 'very-high'
): DynamicWeights {
  const scoreDiff = Math.abs(homeScore - awayScore);
  const timeProgress = minute / 90;
  const timeRemaining = (90 - minute) / 90;

  // Déterminer la phase du match
  let phase: string;
  if (minute < 15) phase = 'early';
  else if (minute < 30) phase = 'mid-first';
  else if (minute < 45) phase = 'end-first';
  else if (minute < 60) phase = 'early-second';
  else if (minute < 75) phase = 'mid-second';
  else phase = 'late';

  // ==================== POIDS POUR LES BUTS ====================
  let goalWeights = {
    prematchData: 0.3,    // Par défaut
    currentScore: 0.1,
    xGoals: 0.15,
    shotQuality: 0.15,
    bigChances: 0.1,
    momentum: 0.05,
    possession: 0.05,
    attacks: 0.1
  };

  // Phase début (0-15'): Privilégier pré-match
  if (minute < 15) {
    goalWeights.prematchData = 0.50;
    goalWeights.currentScore = 0.05;
    goalWeights.xGoals = 0.10;
    goalWeights.shotQuality = 0.10;
    goalWeights.bigChances = 0.10;
    goalWeights.momentum = 0.05;
    goalWeights.possession = 0.05;
    goalWeights.attacks = 0.05;
  }
  // Phase milieu 1ère MT (15-30'): Équilibre
  else if (minute < 30) {
    goalWeights.prematchData = 0.35;
    goalWeights.currentScore = 0.10;
    goalWeights.xGoals = 0.15;
    goalWeights.shotQuality = 0.15;
    goalWeights.bigChances = 0.10;
    goalWeights.momentum = 0.05;
    goalWeights.possession = 0.05;
    goalWeights.attacks = 0.05;
  }
  // Phase fin 1ère MT (30-45'): Plus de live
  else if (minute < 45) {
    goalWeights.prematchData = 0.25;
    goalWeights.currentScore = 0.10;
    goalWeights.xGoals = 0.20;
    goalWeights.shotQuality = 0.20;
    goalWeights.bigChances = 0.10;
    goalWeights.momentum = 0.05;
    goalWeights.possession = 0.05;
    goalWeights.attacks = 0.05;
  }
  // Phase début 2ème MT (45-60'): Score important
  else if (minute < 60) {
    goalWeights.prematchData = 0.20;
    goalWeights.currentScore = 0.15;
    goalWeights.xGoals = 0.20;
    goalWeights.shotQuality = 0.20;
    goalWeights.bigChances = 0.10;
    goalWeights.momentum = 0.05;
    goalWeights.possession = 0.05;
    goalWeights.attacks = 0.05;
  }
  // Phase milieu 2ème MT (60-75'): Momentum clé
  else if (minute < 75) {
    goalWeights.prematchData = 0.15;
    goalWeights.currentScore = 0.15;
    goalWeights.xGoals = 0.20;
    goalWeights.shotQuality = 0.20;
    goalWeights.bigChances = 0.10;
    goalWeights.momentum = 0.10;
    goalWeights.possession = 0.05;
    goalWeights.attacks = 0.05;
  }
  // Phase finale (75-90'): Live dominant
  else {
    goalWeights.prematchData = 0.10;
    goalWeights.currentScore = 0.20;
    goalWeights.xGoals = 0.25;
    goalWeights.shotQuality = 0.20;
    goalWeights.bigChances = 0.10;
    goalWeights.momentum = 0.10;
    goalWeights.possession = 0.03;
    goalWeights.attacks = 0.02;
  }

  // Ajustement selon le score: Si match serré, augmenter momentum
  if (scoreDiff === 0) {
    goalWeights.momentum += 0.05;
    goalWeights.prematchData -= 0.03;
    goalWeights.possession -= 0.02;
  }
  // Si grande différence de score, diminuer importance live
  else if (scoreDiff >= 2) {
    goalWeights.currentScore += 0.10;
    goalWeights.xGoals -= 0.05;
    goalWeights.momentum -= 0.05;
  }

  // ==================== POIDS POUR LES CORNERS ====================
  let cornerWeights = {
    currentRate: 0.3,
    prematchRate: 0.2,
    possession: 0.15,
    attacks: 0.15,
    crosses: 0.10,
    setPlayActivity: 0.05,
    gameState: 0.05
  };

  // Début de match: historique important
  if (minute < 20) {
    cornerWeights.prematchRate = 0.40;
    cornerWeights.currentRate = 0.20;
    cornerWeights.possession = 0.15;
    cornerWeights.attacks = 0.15;
    cornerWeights.crosses = 0.05;
    cornerWeights.setPlayActivity = 0.03;
    cornerWeights.gameState = 0.02;
  }
  // Milieu de match: équilibre
  else if (minute < 60) {
    cornerWeights.prematchRate = 0.20;
    cornerWeights.currentRate = 0.35;
    cornerWeights.possession = 0.15;
    cornerWeights.attacks = 0.15;
    cornerWeights.crosses = 0.08;
    cornerWeights.setPlayActivity = 0.04;
    cornerWeights.gameState = 0.03;
  }
  // Fin de match: rythme actuel crucial
  else {
    cornerWeights.prematchRate = 0.10;
    cornerWeights.currentRate = 0.45;
    cornerWeights.possession = 0.15;
    cornerWeights.attacks = 0.15;
    cornerWeights.crosses = 0.08;
    cornerWeights.setPlayActivity = 0.04;
    cornerWeights.gameState = 0.03;
  }

  // Si match ouvert: augmenter poids attaques
  if (gameState === 'open') {
    cornerWeights.attacks += 0.10;
    cornerWeights.crosses += 0.05;
    cornerWeights.possession -= 0.10;
    cornerWeights.prematchRate -= 0.05;
  }

  // ==================== POIDS POUR LES FAUTES ====================
  let foulWeights = {
    currentRate: 0.35,
    physicalIntensity: 0.20,
    cardRate: 0.10,
    gameState: 0.15,
    scoreDifferential: 0.10,
    timeRemaining: 0.10
  };

  // Début: historique important
  if (minute < 20) {
    foulWeights.currentRate = 0.25;
    foulWeights.physicalIntensity = 0.30;
    foulWeights.cardRate = 0.10;
    foulWeights.gameState = 0.20;
    foulWeights.scoreDifferential = 0.05;
    foulWeights.timeRemaining = 0.10;
  }
  // Fin de match: tension augmente
  else if (minute > 70) {
    foulWeights.currentRate = 0.40;
    foulWeights.physicalIntensity = 0.15;
    foulWeights.cardRate = 0.15;
    foulWeights.gameState = 0.10;
    foulWeights.scoreDifferential = 0.15;
    foulWeights.timeRemaining = 0.05;
  }

  // Match serré: plus de tension
  if (scoreDiff <= 1 && minute > 60) {
    foulWeights.scoreDifferential += 0.10;
    foulWeights.timeRemaining += 0.05;
    foulWeights.physicalIntensity -= 0.10;
    foulWeights.gameState -= 0.05;
  }

  // Intensité élevée: privilégier physique
  if (intensity === 'very-high' || intensity === 'high') {
    foulWeights.physicalIntensity += 0.10;
    foulWeights.currentRate += 0.05;
    foulWeights.gameState -= 0.10;
    foulWeights.timeRemaining -= 0.05;
  }

  // ==================== POIDS POUR LES CARTONS ====================
  let cardWeights = {
    currentRate: 0.30,
    foulAggression: 0.25,
    gameIntensity: 0.20,
    scoreTension: 0.15,
    timePhase: 0.10
  };

  // Début: peu de cartons attendus
  if (minute < 20) {
    cardWeights.currentRate = 0.20;
    cardWeights.foulAggression = 0.35;
    cardWeights.gameIntensity = 0.25;
    cardWeights.scoreTension = 0.10;
    cardWeights.timePhase = 0.10;
  }
  // Fin de match: tension maximale
  else if (minute > 70) {
    cardWeights.currentRate = 0.40;
    cardWeights.foulAggression = 0.20;
    cardWeights.gameIntensity = 0.15;
    cardWeights.scoreTension = 0.20;
    cardWeights.timePhase = 0.05;
  }

  // Match serré en fin de match: cartons plus probables
  if (scoreDiff <= 1 && minute > 60) {
    cardWeights.scoreTension += 0.15;
    cardWeights.foulAggression += 0.05;
    cardWeights.gameIntensity -= 0.10;
    cardWeights.currentRate -= 0.10;
  }

  // ==================== POIDS POUR BTTS ====================
  let bttsWeights = {
    xGoalsBoth: 0.30,
    shotQuality: 0.20,
    defensiveWeakness: 0.15,
    currentScore: 0.15,
    momentum: 0.10,
    timeRemaining: 0.10
  };

  // Début: xG crucial
  if (minute < 30) {
    bttsWeights.xGoalsBoth = 0.40;
    bttsWeights.shotQuality = 0.20;
    bttsWeights.defensiveWeakness = 0.15;
    bttsWeights.currentScore = 0.10;
    bttsWeights.momentum = 0.05;
    bttsWeights.timeRemaining = 0.10;
  }
  // Milieu: équilibre
  else if (minute < 60) {
    bttsWeights.xGoalsBoth = 0.30;
    bttsWeights.shotQuality = 0.20;
    bttsWeights.defensiveWeakness = 0.15;
    bttsWeights.currentScore = 0.15;
    bttsWeights.momentum = 0.10;
    bttsWeights.timeRemaining = 0.10;
  }
  // Fin: score actuel déterminant
  else {
    bttsWeights.xGoalsBoth = 0.20;
    bttsWeights.shotQuality = 0.15;
    bttsWeights.defensiveWeakness = 0.10;
    bttsWeights.currentScore = 0.30;
    bttsWeights.momentum = 0.15;
    bttsWeights.timeRemaining = 0.10;
  }

  // Si une équipe mène déjà: augmenter importance score
  if (homeScore > 0 && awayScore > 0) {
    // Les deux ont marqué: BTTS déjà réussi
    bttsWeights.currentScore = 0.60;
    bttsWeights.xGoalsBoth = 0.10;
    bttsWeights.shotQuality = 0.10;
    bttsWeights.defensiveWeakness = 0.05;
    bttsWeights.momentum = 0.10;
    bttsWeights.timeRemaining = 0.05;
  } else if (homeScore > 0 || awayScore > 0) {
    // Une seule équipe a marqué
    bttsWeights.currentScore = 0.20;
    bttsWeights.xGoalsBoth += 0.10;
    bttsWeights.momentum += 0.05;
    bttsWeights.timeRemaining -= 0.05;
  }

  // Peu de temps restant: si pas BTTS encore, difficile
  if (minute > 75 && (homeScore === 0 || awayScore === 0)) {
    bttsWeights.timeRemaining += 0.15;
    bttsWeights.momentum += 0.10;
    bttsWeights.xGoalsBoth -= 0.15;
    bttsWeights.defensiveWeakness -= 0.10;
  }

  // ==================== CALCUL DE CONFIANCE ====================
  // Plus le match avance, plus on a de données → plus de confiance
  let confidence = 50 + (timeProgress * 40); // Base: 50-90%

  // Ajustements selon l'état du match
  if (gameState === 'balanced') confidence += 5;
  if (intensity === 'medium' || intensity === 'high') confidence += 3;
  if (minute >= 30) confidence += 5;
  if (minute >= 60) confidence += 5;

  confidence = Math.min(100, Math.max(50, confidence));

  return {
    goals: goalWeights,
    corners: cornerWeights,
    fouls: foulWeights,
    cards: cardWeights,
    btts: bttsWeights,
    phase,
    confidence
  };
}

/**
 * Applique les poids dynamiques pour calculer une prédiction pondérée
 */
export function applyWeights(
  values: { [key: string]: number },
  weights: { [key: string]: number }
): number {
  let total = 0;
  let weightSum = 0;

  for (const key in weights) {
    if (values[key] !== undefined && values[key] !== null) {
      total += values[key] * weights[key];
      weightSum += weights[key];
    }
  }

  // Normaliser si les poids ne somment pas à 1
  return weightSum > 0 ? total / weightSum : 0;
}

/**
 * Calcule un boost de confiance basé sur la cohérence des signaux
 */
export function calculateConfidenceBoost(
  values: { [key: string]: number },
  weights: { [key: string]: number },
  threshold: number
): number {
  // Si tous les signaux pointent dans la même direction → boost
  const weightedValues = Object.keys(weights).map(key => ({
    value: values[key] || 0,
    weight: weights[key]
  }));

  // Calculer écart-type pondéré
  const mean = applyWeights(values, weights);
  const variance = weightedValues.reduce((sum, item) =>
    sum + Math.pow(item.value - mean, 2) * item.weight, 0
  );
  const stdDev = Math.sqrt(variance);

  // Faible variance = signaux cohérents = boost
  const coherenceScore = Math.max(0, 100 - (stdDev / mean * 50));

  // Calculer la distance au seuil
  const distanceToThreshold = Math.abs(mean - threshold);
  const distanceScore = Math.min(100, distanceToThreshold * 20);

  // Score final (0-20%)
  const boost = ((coherenceScore * 0.6 + distanceScore * 0.4) / 100) * 20;

  return boost;
}
