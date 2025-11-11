/**
 * PRÉDICTIONS PARFAITES - VERSION ÉPURÉE
 *
 * Seulement les MEILLEURS paris :
 * - Over/Under Buts
 * - Over/Under Corners
 * - Over/Under Cartons
 * - BTTS
 * - Double Chance (1X, X2, 12)
 *
 * Filtrage strict : Seuls les paris à 85%+ sont affichés
 */

import { TeamStats } from '@/types/football';

export interface PerfectPrediction {
  type: 'OVER_UNDER' | 'BTTS' | 'DOUBLE_CHANCE' | '1X2';
  category: string;
  prediction: string;
  threshold?: number;
  probability: number;
  odds: number; // Cote estimée
  recommendation: 'STRONG' | 'GOOD';
}

interface TeamProfile {
  avgGoalsScored: number;
  avgGoalsConceded: number;
  avgCorners: number;
  avgCards: number;
  attackStrength: number;
  defenseStrength: number;
  homeAdvantage?: number;
}

/**
 * Crée le profil d'une équipe
 */
function createProfile(team: TeamStats, isHome: boolean = false): TeamProfile {
  const matches = Math.max(team.matches, 1);

  const avgGoalsScored = team.goalsPerMatch || (team.goalsScored / matches);
  const avgGoalsConceded = team.goalsConcededPerMatch || (team.goalsConceded / matches);
  const avgShotsOnTarget = team.shotsOnTargetPerMatch || 0;
  const avgCards = team.yellowCardsPerMatch || 0;

  // Corners (corrélation validée)
  const avgCorners = 3.5 + (avgShotsOnTarget * 0.75) + (team.possession / 15);

  // Forces
  const attackStrength = Math.min(10,
    (avgGoalsScored * 2.0) +
    (avgShotsOnTarget * 0.4) +
    (team.bigChancesPerMatch * 0.6)
  );

  const cleanSheetRatio = team.cleanSheets / matches;
  const defenseStrength = Math.min(10,
    Math.max(0, 10 - avgGoalsConceded * 2) +
    (cleanSheetRatio * 2.5) +
    (team.tacklesPerMatch * 0.25)
  );

  // Avantage domicile : +20% attaque, +15% défense
  const homeAdvantage = isHome ? 1.15 : 1.0;

  return {
    avgGoalsScored: avgGoalsScored * (isHome ? 1.2 : 1.0),
    avgGoalsConceded,
    avgCorners,
    avgCards,
    attackStrength: attackStrength * homeAdvantage,
    defenseStrength: defenseStrength * homeAdvantage,
    homeAdvantage: isHome ? 1.15 : 1.0
  };
}

/**
 * Calcule la probabilité de victoire pour chaque équipe
 */
function calculateMatchOutcome(homeProfile: TeamProfile, awayProfile: TeamProfile): {
  home: number;
  draw: number;
  away: number;
} {
  // Force relative
  const homeStrength = (homeProfile.attackStrength + homeProfile.defenseStrength) / 2;
  const awayStrength = (awayProfile.attackStrength + awayProfile.defenseStrength) / 2;

  // Différence de force
  const strengthDiff = homeStrength - awayStrength;

  // Probabilités de base
  let homeWin = 45 + (strengthDiff * 3);
  let awayWin = 30 - (strengthDiff * 2);
  let draw = 25;

  // Ajustement basé sur les buts
  const goalDiff = homeProfile.avgGoalsScored - awayProfile.avgGoalsScored;
  homeWin += goalDiff * 5;
  awayWin -= goalDiff * 3;

  // Normalisation
  const total = homeWin + draw + awayWin;
  homeWin = (homeWin / total) * 100;
  draw = (draw / total) * 100;
  awayWin = (awayWin / total) * 100;

  return {
    home: Math.max(10, Math.min(85, homeWin)),
    draw: Math.max(10, Math.min(40, draw)),
    away: Math.max(10, Math.min(85, awayWin))
  };
}

/**
 * Génère les prédictions PARFAITES (seulement les meilleurs paris)
 */
export function generatePerfectPredictions(
  homeTeam: TeamStats,
  awayTeam: TeamStats
): PerfectPrediction[] {
  const predictions: PerfectPrediction[] = [];

  const homeProfile = createProfile(homeTeam, true);
  const awayProfile = createProfile(awayTeam, false);

  // === 1. BUTS OVER/UNDER ===
  const expectedGoals = homeProfile.avgGoalsScored + awayProfile.avgGoalsScored;
  const goalsVariance = 0.6; // Écart-type standard

  // OVER 1.5
  if (expectedGoals > 2.1) {
    const distance = expectedGoals - 1.5;
    const probability = Math.min(95, 75 + (distance / goalsVariance) * 8);
    if (probability >= 85) {
      predictions.push({
        type: 'OVER_UNDER',
        category: 'Buts',
        prediction: 'OVER 1.5',
        threshold: 1.5,
        probability: Math.round(probability),
        odds: parseFloat((1 / (probability / 100)).toFixed(2)),
        recommendation: probability >= 90 ? 'STRONG' : 'GOOD'
      });
    }
  }

  // OVER 2.5
  if (expectedGoals > 3.1) {
    const distance = expectedGoals - 2.5;
    const probability = Math.min(95, 75 + (distance / goalsVariance) * 8);
    if (probability >= 85) {
      predictions.push({
        type: 'OVER_UNDER',
        category: 'Buts',
        prediction: 'OVER 2.5',
        threshold: 2.5,
        probability: Math.round(probability),
        odds: parseFloat((1 / (probability / 100)).toFixed(2)),
        recommendation: probability >= 90 ? 'STRONG' : 'GOOD'
      });
    }
  }

  // UNDER 2.5
  if (expectedGoals < 2.0) {
    const distance = 2.5 - expectedGoals;
    const probability = Math.min(95, 75 + (distance / goalsVariance) * 8);
    if (probability >= 85) {
      predictions.push({
        type: 'OVER_UNDER',
        category: 'Buts',
        prediction: 'UNDER 2.5',
        threshold: 2.5,
        probability: Math.round(probability),
        odds: parseFloat((1 / (probability / 100)).toFixed(2)),
        recommendation: probability >= 90 ? 'STRONG' : 'GOOD'
      });
    }
  }

  // UNDER 3.5
  if (expectedGoals < 2.9) {
    const distance = 3.5 - expectedGoals;
    const probability = Math.min(95, 75 + (distance / goalsVariance) * 8);
    if (probability >= 85) {
      predictions.push({
        type: 'OVER_UNDER',
        category: 'Buts',
        prediction: 'UNDER 3.5',
        threshold: 3.5,
        probability: Math.round(probability),
        odds: parseFloat((1 / (probability / 100)).toFixed(2)),
        recommendation: probability >= 90 ? 'STRONG' : 'GOOD'
      });
    }
  }

  // === 2. CORNERS OVER/UNDER ===
  const expectedCorners = homeProfile.avgCorners + awayProfile.avgCorners;
  const cornersVariance = 1.8;

  // OVER 9.5
  if (expectedCorners > 11.3) {
    const distance = expectedCorners - 9.5;
    const probability = Math.min(93, 75 + (distance / cornersVariance) * 6);
    if (probability >= 85) {
      predictions.push({
        type: 'OVER_UNDER',
        category: 'Corners',
        prediction: 'OVER 9.5',
        threshold: 9.5,
        probability: Math.round(probability),
        odds: parseFloat((1 / (probability / 100)).toFixed(2)),
        recommendation: probability >= 88 ? 'STRONG' : 'GOOD'
      });
    }
  }

  // UNDER 11.5
  if (expectedCorners < 9.7) {
    const distance = 11.5 - expectedCorners;
    const probability = Math.min(93, 75 + (distance / cornersVariance) * 6);
    if (probability >= 85) {
      predictions.push({
        type: 'OVER_UNDER',
        category: 'Corners',
        prediction: 'UNDER 11.5',
        threshold: 11.5,
        probability: Math.round(probability),
        odds: parseFloat((1 / (probability / 100)).toFixed(2)),
        recommendation: probability >= 88 ? 'STRONG' : 'GOOD'
      });
    }
  }

  // === 3. CARTONS OVER/UNDER ===
  const expectedCards = homeProfile.avgCards + awayProfile.avgCards;
  const cardsVariance = 1.1;

  // OVER 3.5
  if (expectedCards > 4.6) {
    const distance = expectedCards - 3.5;
    const probability = Math.min(90, 72 + (distance / cardsVariance) * 7);
    if (probability >= 85) {
      predictions.push({
        type: 'OVER_UNDER',
        category: 'Cartons',
        prediction: 'OVER 3.5',
        threshold: 3.5,
        probability: Math.round(probability),
        odds: parseFloat((1 / (probability / 100)).toFixed(2)),
        recommendation: probability >= 87 ? 'STRONG' : 'GOOD'
      });
    }
  }

  // UNDER 5.5
  if (expectedCards < 4.4) {
    const distance = 5.5 - expectedCards;
    const probability = Math.min(90, 72 + (distance / cardsVariance) * 7);
    if (probability >= 85) {
      predictions.push({
        type: 'OVER_UNDER',
        category: 'Cartons',
        prediction: 'UNDER 5.5',
        threshold: 5.5,
        probability: Math.round(probability),
        odds: parseFloat((1 / (probability / 100)).toFixed(2)),
        recommendation: probability >= 87 ? 'STRONG' : 'GOOD'
      });
    }
  }

  // === 4. BTTS ===
  const homeScoreProbability = Math.min(95,
    40 + (homeProfile.avgGoalsScored * 15) + (homeProfile.attackStrength * 3)
  );

  const awayScoreProbability = Math.min(95,
    35 + (awayProfile.avgGoalsScored * 15) + (awayProfile.attackStrength * 3)
  );

  const bttsYes = (homeScoreProbability / 100) * (awayScoreProbability / 100) * 100;
  const bttsNo = 100 - bttsYes;

  if (bttsYes >= 85) {
    predictions.push({
      type: 'BTTS',
      category: 'BTTS',
      prediction: 'OUI',
      probability: Math.round(bttsYes),
      odds: parseFloat((1 / (bttsYes / 100)).toFixed(2)),
      recommendation: bttsYes >= 90 ? 'STRONG' : 'GOOD'
    });
  } else if (bttsNo >= 85) {
    predictions.push({
      type: 'BTTS',
      category: 'BTTS',
      prediction: 'NON',
      probability: Math.round(bttsNo),
      odds: parseFloat((1 / (bttsNo / 100)).toFixed(2)),
      recommendation: bttsNo >= 90 ? 'STRONG' : 'GOOD'
    });
  }

  // === 5. DOUBLE CHANCE ===
  const outcome = calculateMatchOutcome(homeProfile, awayProfile);

  // 1X (Domicile ou Match Nul)
  const prob1X = outcome.home + outcome.draw;
  if (prob1X >= 85) {
    predictions.push({
      type: 'DOUBLE_CHANCE',
      category: 'Double Chance',
      prediction: '1X (Domicile ou Nul)',
      probability: Math.round(prob1X),
      odds: parseFloat((1 / (prob1X / 100)).toFixed(2)),
      recommendation: prob1X >= 90 ? 'STRONG' : 'GOOD'
    });
  }

  // X2 (Match Nul ou Extérieur)
  const probX2 = outcome.draw + outcome.away;
  if (probX2 >= 85) {
    predictions.push({
      type: 'DOUBLE_CHANCE',
      category: 'Double Chance',
      prediction: 'X2 (Nul ou Extérieur)',
      probability: Math.round(probX2),
      odds: parseFloat((1 / (probX2 / 100)).toFixed(2)),
      recommendation: probX2 >= 90 ? 'STRONG' : 'GOOD'
    });
  }

  // 12 (Domicile ou Extérieur - Pas de Nul)
  const prob12 = outcome.home + outcome.away;
  if (prob12 >= 85) {
    predictions.push({
      type: 'DOUBLE_CHANCE',
      category: 'Double Chance',
      prediction: '12 (Pas de Match Nul)',
      probability: Math.round(prob12),
      odds: parseFloat((1 / (prob12 / 100)).toFixed(2)),
      recommendation: prob12 >= 90 ? 'STRONG' : 'GOOD'
    });
  }

  // === 6. 1X2 (Si très clair) ===
  if (outcome.home >= 85) {
    predictions.push({
      type: '1X2',
      category: 'Résultat',
      prediction: '1 (Victoire Domicile)',
      probability: Math.round(outcome.home),
      odds: parseFloat((1 / (outcome.home / 100)).toFixed(2)),
      recommendation: outcome.home >= 90 ? 'STRONG' : 'GOOD'
    });
  } else if (outcome.away >= 85) {
    predictions.push({
      type: '1X2',
      category: 'Résultat',
      prediction: '2 (Victoire Extérieur)',
      probability: Math.round(outcome.away),
      odds: parseFloat((1 / (outcome.away / 100)).toFixed(2)),
      recommendation: outcome.away >= 90 ? 'STRONG' : 'GOOD'
    });
  }

  // Trier par probabilité (plus élevée en premier)
  predictions.sort((a, b) => b.probability - a.probability);

  return predictions;
}
