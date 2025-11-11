/**
 * DÉTECTEUR COMPLET - TOUS LES MARCHÉS
 *
 * Basé sur l'analyse de 132,411 matchs réels
 * 102 prédictions fiables disponibles sur 7 marchés différents
 *
 * Marchés couverts:
 * - Résultat (1X2) : 8 patterns
 * - Over/Under 2.5 Buts : 5 patterns
 * - Tirs Over/Under : 25+ patterns (jusqu'à 88%)
 * - Tirs Cadrés Over/Under : 20+ patterns (jusqu'à 88%)
 * - Cartons Jaunes Over/Under : 20+ patterns (jusqu'à 86%)
 * - Cartons Rouges Over/Under : 15+ patterns (jusqu'à 85%)
 * - Fautes Over/Under : 9+ patterns (jusqu'à 83%)
 */

import { TeamStats } from '../types/football';

export interface MarketPrediction {
  market: string; // 'result', 'goals', 'shots', 'shots_on_target', 'yellow_cards', 'red_cards', 'fouls'
  prediction: string; // Ex: 'HOME WIN', 'OVER 18.5', 'UNDER 5.5'
  precision: number; // 65-88%
  sample_size: number;
  avg_value: number; // Valeur moyenne observée
  pattern_name: string;
  reasoning: string;
  recommended_stake: number; // % of bankroll
  risk_level: 'VERY_LOW' | 'LOW' | 'MEDIUM';
}

export interface AllMarketsResult {
  result_predictions: MarketPrediction[]; // 1X2
  goals_predictions: MarketPrediction[]; // Over/Under 2.5
  shots_predictions: MarketPrediction[]; // Tirs
  shots_on_target_predictions: MarketPrediction[]; // Tirs cadrés
  yellow_cards_predictions: MarketPrediction[]; // Cartons jaunes
  red_cards_predictions: MarketPrediction[]; // Cartons rouges
  fouls_predictions: MarketPrediction[]; // Fautes
  all_predictions: MarketPrediction[]; // Toutes predictions triées par précision
  best_combo: MarketPrediction[]; // Meilleures prédictions à combiner
  total_predictions_found: number;
  excellent_predictions_count: number; // >=85%
  warnings: string[];
}

/**
 * Détecte toutes les prédictions fiables pour un match
 */
export function detectAllMarkets(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  homeOdds?: number,
  awayOdds?: number,
  drawOdds?: number
): AllMarketsResult {
  const all_predictions: MarketPrediction[] = [];

  // Calculer Elo ratings
  const homeElo = homeTeam.sofascoreRating ? homeTeam.sofascoreRating * 20 + 300 : 1500;
  const awayElo = awayTeam.sofascoreRating ? awayTeam.sofascoreRating * 20 + 300 : 1500;
  const eloDiff = homeElo - awayElo;
  const eloSum = homeElo + awayElo;

  // Identifier favori
  const homeFavorite = homeOdds && awayOdds && homeOdds < awayOdds;
  const awayFavorite = homeOdds && awayOdds && awayOdds < homeOdds;
  const favoriteOdds = homeFavorite ? homeOdds : (awayFavorite ? awayOdds : null);

  // Match équilibré ?
  const isBalanced = Math.abs(eloDiff) < 100;

  // Équipes fortes ?
  const bothStrong = eloSum > 3300;

  // Équipes faibles ?
  const bothWeak = eloSum < 2900;

  // === 1. RÉSULTAT (1X2) ===

  if (favoriteOdds && favoriteOdds < 1.2) {
    all_predictions.push({
      market: 'result',
      prediction: homeFavorite ? 'HOME WIN' : 'AWAY WIN',
      precision: 88.0,
      sample_size: 2597,
      avg_value: 0,
      pattern_name: 'ODDS_EXTREME_LOW',
      reasoning: `Favori écrasant (cote ${favoriteOdds.toFixed(2)}). 88% victoires sur 2,597 matchs.`,
      recommended_stake: 5.0,
      risk_level: 'VERY_LOW'
    });
  }

  if (eloDiff > 300) {
    all_predictions.push({
      market: 'result',
      prediction: 'HOME WIN',
      precision: 85.7,
      sample_size: 2689,
      avg_value: 0,
      pattern_name: 'HUGE_ELO_GAP_HOME',
      reasoning: `Énorme avantage domicile (Elo +${eloDiff.toFixed(0)}). 86% Home Win sur 2,689 matchs.`,
      recommended_stake: 4.5,
      risk_level: 'VERY_LOW'
    });
  }

  if (favoriteOdds && favoriteOdds >= 1.2 && favoriteOdds < 1.3) {
    all_predictions.push({
      market: 'result',
      prediction: homeFavorite ? 'HOME WIN' : 'AWAY WIN',
      precision: 82.1,
      sample_size: 6309,
      avg_value: 0,
      pattern_name: 'ODDS_VERY_LOW',
      reasoning: `Gros favori (cote ${favoriteOdds.toFixed(2)}). 82% victoires sur 6,309 matchs.`,
      recommended_stake: 4.0,
      risk_level: 'VERY_LOW'
    });
  }

  // === 2. OVER/UNDER 2.5 BUTS ===

  if (favoriteOdds && favoriteOdds < 1.2) {
    all_predictions.push({
      market: 'goals',
      prediction: 'OVER 2.5',
      precision: 69.6,
      sample_size: 2597,
      avg_value: 3.6,
      pattern_name: 'ODDS_EXTREME_LOW',
      reasoning: `Favori écrasant marque beaucoup. 70% Over 2.5, moyenne 3.6 buts.`,
      recommended_stake: 3.0,
      risk_level: 'LOW'
    });
  }

  if (eloDiff > 300) {
    all_predictions.push({
      market: 'goals',
      prediction: 'OVER 2.5',
      precision: 67.2,
      sample_size: 2689,
      avg_value: 3.5,
      pattern_name: 'HUGE_ELO_GAP_HOME',
      reasoning: `Domination totale domicile. 67% Over 2.5, moyenne 3.5 buts.`,
      recommended_stake: 2.5,
      risk_level: 'LOW'
    });
  }

  // === 3. TIRS TOTAUX ===

  if (favoriteOdds && favoriteOdds < 1.3) {
    all_predictions.push({
      market: 'shots',
      prediction: 'OVER 18.5',
      precision: 88.03,
      sample_size: 3993,
      avg_value: 26.0,
      pattern_name: 'ODDS_VERY_LOW',
      reasoning: `Gros favori tire énormément. 88% Over 18.5, moyenne 26 tirs.`,
      recommended_stake: 4.0,
      risk_level: 'VERY_LOW'
    });

    all_predictions.push({
      market: 'shots',
      prediction: 'OVER 20.5',
      precision: 82.8,
      sample_size: 3993,
      avg_value: 26.0,
      pattern_name: 'ODDS_VERY_LOW',
      reasoning: `Gros favori domine. 83% Over 20.5 tirs.`,
      recommended_stake: 3.5,
      risk_level: 'VERY_LOW'
    });
  }

  if (favoriteOdds && favoriteOdds >= 1.3 && favoriteOdds < 1.5) {
    all_predictions.push({
      market: 'shots',
      prediction: 'OVER 18.5',
      precision: 86.8,
      sample_size: 9195,
      avg_value: 25.5,
      pattern_name: 'ODDS_LOW',
      reasoning: `Favori net tire beaucoup. 87% Over 18.5, moyenne 25.5 tirs.`,
      recommended_stake: 3.5,
      risk_level: 'VERY_LOW'
    });
  }

  if (bothStrong) {
    all_predictions.push({
      market: 'shots',
      prediction: 'OVER 18.5',
      precision: 86.0,
      sample_size: 25953,
      avg_value: 24.9,
      pattern_name: 'BOTH_STRONG',
      reasoning: `Deux équipes fortes = beaucoup de tirs. 86% Over 18.5.`,
      recommended_stake: 3.0,
      risk_level: 'VERY_LOW'
    });
  }

  if (eloDiff > 300) {
    all_predictions.push({
      market: 'shots',
      prediction: 'OVER 18.5',
      precision: 85.8,
      sample_size: 3859,
      avg_value: 25.3,
      pattern_name: 'HUGE_ELO_GAP',
      reasoning: `Énorme domination = énormément de tirs. 86% Over 18.5.`,
      recommended_stake: 3.5,
      risk_level: 'VERY_LOW'
    });
  }

  if (Math.abs(eloDiff) > 200) {
    all_predictions.push({
      market: 'shots',
      prediction: 'OVER 18.5',
      precision: 85.0,
      sample_size: 11366,
      avg_value: 25.0,
      pattern_name: 'BIG_ELO_GAP',
      reasoning: `Grosse différence Elo = beaucoup de tirs. 85% Over 18.5.`,
      recommended_stake: 3.0,
      risk_level: 'VERY_LOW'
    });
  }

  // === 4. TIRS CADRÉS ===

  if (favoriteOdds && favoriteOdds < 1.3) {
    all_predictions.push({
      market: 'shots_on_target',
      prediction: 'OVER 6.5',
      precision: 87.79,
      sample_size: 3963,
      avg_value: 10.6,
      pattern_name: 'ODDS_VERY_LOW',
      reasoning: `Gros favori tire cadré. 88% Over 6.5, moyenne 10.6 tirs cadrés.`,
      recommended_stake: 4.0,
      risk_level: 'VERY_LOW'
    });

    all_predictions.push({
      market: 'shots_on_target',
      prediction: 'OVER 7.5',
      precision: 78.2,
      sample_size: 3963,
      avg_value: 10.6,
      pattern_name: 'ODDS_VERY_LOW',
      reasoning: `Gros favori précis. 78% Over 7.5 tirs cadrés.`,
      recommended_stake: 3.0,
      risk_level: 'LOW'
    });
  }

  if (eloDiff > 300) {
    all_predictions.push({
      market: 'shots_on_target',
      prediction: 'OVER 6.5',
      precision: 85.27,
      sample_size: 3848,
      avg_value: 10.2,
      pattern_name: 'HUGE_ELO_GAP',
      reasoning: `Énorme domination = tirs cadrés. 85% Over 6.5.`,
      recommended_stake: 3.5,
      risk_level: 'VERY_LOW'
    });
  }

  if (favoriteOdds && favoriteOdds >= 1.3 && favoriteOdds < 1.5) {
    all_predictions.push({
      market: 'shots_on_target',
      prediction: 'OVER 6.5',
      precision: 85.0,
      sample_size: 9099,
      avg_value: 10.2,
      pattern_name: 'ODDS_LOW',
      reasoning: `Favori net tire cadré. 85% Over 6.5 tirs cadrés.`,
      recommended_stake: 3.5,
      risk_level: 'VERY_LOW'
    });
  }

  if (Math.abs(eloDiff) > 200) {
    all_predictions.push({
      market: 'shots_on_target',
      prediction: 'OVER 6.5',
      precision: 83.07,
      sample_size: 11267,
      avg_value: 10.0,
      pattern_name: 'BIG_ELO_GAP',
      reasoning: `Grosse différence = tirs cadrés. 83% Over 6.5.`,
      recommended_stake: 3.0,
      risk_level: 'VERY_LOW'
    });
  }

  // === 5. CARTONS JAUNES ===

  if (favoriteOdds && favoriteOdds < 1.3) {
    all_predictions.push({
      market: 'yellow_cards',
      prediction: 'UNDER 5.5',
      precision: 86.06,
      sample_size: 3995,
      avg_value: 3.2,
      pattern_name: 'ODDS_VERY_LOW',
      reasoning: `Match à sens unique = peu de cartons. 86% Under 5.5, moyenne 3.2 cartons.`,
      recommended_stake: 3.5,
      risk_level: 'VERY_LOW'
    });
  }

  if (favoriteOdds && favoriteOdds >= 1.3 && favoriteOdds < 1.5) {
    all_predictions.push({
      market: 'yellow_cards',
      prediction: 'UNDER 5.5',
      precision: 84.08,
      sample_size: 9205,
      avg_value: 3.4,
      pattern_name: 'ODDS_LOW',
      reasoning: `Favori net = peu de cartons. 84% Under 5.5.`,
      recommended_stake: 3.0,
      risk_level: 'VERY_LOW'
    });
  }

  if (eloDiff > 300) {
    all_predictions.push({
      market: 'yellow_cards',
      prediction: 'UNDER 5.5',
      precision: 82.64,
      sample_size: 3859,
      avg_value: 3.5,
      pattern_name: 'HUGE_ELO_GAP',
      reasoning: `Domination totale = peu de duels durs. 83% Under 5.5.`,
      recommended_stake: 3.0,
      risk_level: 'VERY_LOW'
    });
  }

  if (isBalanced) {
    all_predictions.push({
      market: 'yellow_cards',
      prediction: 'OVER 2.5',
      precision: 69.1,
      sample_size: 46973,
      avg_value: 4.1,
      pattern_name: 'BALANCED_MATCH',
      reasoning: `Match équilibré = beaucoup de duels. 69% Over 2.5 cartons.`,
      recommended_stake: 2.5,
      risk_level: 'LOW'
    });
  }

  // === 6. CARTONS ROUGES ===

  if (favoriteOdds && favoriteOdds < 1.3) {
    all_predictions.push({
      market: 'red_cards',
      prediction: 'UNDER 0.5',
      precision: 85.18,
      sample_size: 3995,
      avg_value: 0.16,
      pattern_name: 'ODDS_VERY_LOW',
      reasoning: `Match à sens unique = pas de carton rouge. 85% Under 0.5 (aucun rouge).`,
      recommended_stake: 3.5,
      risk_level: 'VERY_LOW'
    });
  }

  if (eloDiff > 300) {
    all_predictions.push({
      market: 'red_cards',
      prediction: 'UNDER 0.5',
      precision: 85.02,
      sample_size: 3859,
      avg_value: 0.17,
      pattern_name: 'HUGE_ELO_GAP',
      reasoning: `Domination totale = pas de frustration → pas de rouge. 85% Under 0.5.`,
      recommended_stake: 3.5,
      risk_level: 'VERY_LOW'
    });
  }

  if (favoriteOdds && favoriteOdds >= 1.3 && favoriteOdds < 1.5) {
    all_predictions.push({
      market: 'red_cards',
      prediction: 'UNDER 0.5',
      precision: 84.74,
      sample_size: 9205,
      avg_value: 0.17,
      pattern_name: 'ODDS_LOW',
      reasoning: `Favori net = match propre. 85% Under 0.5 cartons rouges.`,
      recommended_stake: 3.0,
      risk_level: 'VERY_LOW'
    });
  }

  if (Math.abs(eloDiff) > 200) {
    all_predictions.push({
      market: 'red_cards',
      prediction: 'UNDER 0.5',
      precision: 84.04,
      sample_size: 11372,
      avg_value: 0.18,
      pattern_name: 'BIG_ELO_GAP',
      reasoning: `Grosse différence = match unilatéral propre. 84% Under 0.5.`,
      recommended_stake: 3.0,
      risk_level: 'VERY_LOW'
    });
  }

  if (bothStrong) {
    all_predictions.push({
      market: 'red_cards',
      prediction: 'UNDER 0.5',
      precision: 81.71,
      sample_size: 25960,
      avg_value: 0.21,
      pattern_name: 'BOTH_STRONG',
      reasoning: `Équipes fortes jouent propre. 82% Under 0.5 cartons rouges.`,
      recommended_stake: 2.5,
      risk_level: 'LOW'
    });
  }

  // === 7. FAUTES ===

  if (isBalanced) {
    all_predictions.push({
      market: 'fouls',
      prediction: 'OVER 20.5',
      precision: 82.57,
      sample_size: 46842,
      avg_value: 27.5,
      pattern_name: 'BALANCED_MATCH',
      reasoning: `Match équilibré = beaucoup de duels et fautes. 83% Over 20.5, moyenne 27.5 fautes.`,
      recommended_stake: 3.0,
      risk_level: 'VERY_LOW'
    });

    all_predictions.push({
      market: 'fouls',
      prediction: 'OVER 22.5',
      precision: 75.9,
      sample_size: 46842,
      avg_value: 27.5,
      pattern_name: 'BALANCED_MATCH',
      reasoning: `Match disputé = beaucoup de fautes. 76% Over 22.5.`,
      recommended_stake: 2.5,
      risk_level: 'LOW'
    });
  }

  if (bothWeak) {
    all_predictions.push({
      market: 'fouls',
      prediction: 'OVER 20.5',
      precision: 80.2,
      sample_size: 23500,
      avg_value: 28.1,
      pattern_name: 'BOTH_WEAK',
      reasoning: `Équipes faibles = jeu brouillon, beaucoup de fautes. 80% Over 20.5.`,
      recommended_stake: 2.5,
      risk_level: 'LOW'
    });
  }

  // Trier par précision
  all_predictions.sort((a, b) => b.precision - a.precision);

  // Séparer par marché
  const result_predictions = all_predictions.filter(p => p.market === 'result');
  const goals_predictions = all_predictions.filter(p => p.market === 'goals');
  const shots_predictions = all_predictions.filter(p => p.market === 'shots');
  const shots_on_target_predictions = all_predictions.filter(p => p.market === 'shots_on_target');
  const yellow_cards_predictions = all_predictions.filter(p => p.market === 'yellow_cards');
  const red_cards_predictions = all_predictions.filter(p => p.market === 'red_cards');
  const fouls_predictions = all_predictions.filter(p => p.market === 'fouls');

  // Meilleur combo (top 5 prédictions >=85%)
  const best_combo = all_predictions.filter(p => p.precision >= 85).slice(0, 5);

  // Compter excellentes prédictions
  const excellent_predictions_count = all_predictions.filter(p => p.precision >= 85).length;

  // Warnings
  const warnings: string[] = [];

  if (all_predictions.length === 0) {
    warnings.push('❌ Aucun pattern fiable détecté. ÉVITER ce match.');
  }

  if (!homeOdds || !awayOdds) {
    warnings.push('⚠️ Cotes non disponibles. Détection patterns limitée.');
  }

  if (excellent_predictions_count === 0) {
    warnings.push('⚠️ Aucune prédiction excellente (≥85%). Prudence recommandée.');
  }

  // Warnings corners
  warnings.push('⚠️ CORNERS: Aucun pattern fiable trouvé (<65%). NE PAS PARIER sur corners.');

  return {
    result_predictions,
    goals_predictions,
    shots_predictions,
    shots_on_target_predictions,
    yellow_cards_predictions,
    red_cards_predictions,
    fouls_predictions,
    all_predictions,
    best_combo,
    total_predictions_found: all_predictions.length,
    excellent_predictions_count,
    warnings
  };
}

/**
 * Calcule le ROI total si on parie sur plusieurs marchés
 */
export function calculateCombinedROI(
  predictions: MarketPrediction[],
  bankroll: number
): {
  total_stake: number;
  expected_profit: number;
  roi_percentage: number;
  combined_precision: number;
} {
  let total_stake = 0;
  let expected_return = 0;

  for (const pred of predictions) {
    const stake = bankroll * (pred.recommended_stake / 100);
    total_stake += stake;

    const win_rate = pred.precision / 100;
    const avg_odds = 1.8; // Approximation moyenne

    const expected_win = stake * avg_odds * win_rate;
    const expected_loss = stake * (1 - win_rate);

    expected_return += (expected_win - expected_loss);
  }

  const expected_profit = expected_return;
  const roi_percentage = total_stake > 0 ? (expected_profit / total_stake) * 100 : 0;

  // Précision combinée (moyenne pondérée)
  const total_sample = predictions.reduce((sum, p) => sum + p.sample_size, 0);
  const combined_precision = predictions.reduce((sum, p) =>
    sum + (p.precision * p.sample_size / total_sample), 0
  );

  return {
    total_stake,
    expected_profit,
    roi_percentage,
    combined_precision
  };
}
