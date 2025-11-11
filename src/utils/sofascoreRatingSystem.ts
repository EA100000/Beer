/**
 * Système de notation inspiré de SofaScore
 * Basé sur leur algorithme: note de base 6.5, ajustée par centaines de points de données
 * Mise à jour 60 fois par match, échelle 3-10
 */

import { TeamStats } from '@/types/football';

/**
 * Composantes de la notation SofaScore
 */
interface RatingComponents {
  // Attaque (40% du rating)
  goals: number;
  assists: number;
  shotsOnTarget: number;
  bigChances: number;
  dribbles: number;

  // Défense (30% du rating)
  tackles: number;
  interceptions: number;
  clearances: number;
  cleanSheets: number;

  // Possession & Distribution (20% du rating)
  passAccuracy: number;
  longBalls: number;
  possession: number;

  // Discipline & Erreurs (10% négatif)
  foulsCommitted: number;
  yellowCards: number;
  redCards: number;
  bigChancesMissed: number;
  penaltyConceded: number;
}

/**
 * Poids pour chaque composante (basé sur l'algorithme SofaScore)
 */
const RATING_WEIGHTS = {
  // Actions offensives (impact positif majeur)
  goal: 1.5,
  assist: 1.0,
  shotOnTarget: 0.15,
  bigChance: 0.3,
  bigChanceMissed: -0.4,

  // Actions défensives (impact positif)
  tackle: 0.2,
  interception: 0.25,
  clearance: 0.1,
  cleanSheet: 0.8,
  goalConceded: -0.3,

  // Possession & Distribution
  passAccuracy: 0.02, // Par pourcentage
  longBallAccurate: 0.1,
  possession: 0.015, // Par pourcentage

  // Discipline (impact négatif)
  foulCommitted: -0.15,
  yellowCard: -0.3,
  redCard: -2.0,
  penaltyConceded: -0.8,

  // Autres
  duel: 0.08,
  offside: -0.1,
};

/**
 * Calcule le rating SofaScore d'une équipe
 * Note de base: 6.5
 * Échelle finale: 3.0 à 10.0
 */
export function calculateSofaScoreRating(team: TeamStats): number {
  let rating = 6.5; // Note de base SofaScore

  // === ATTAQUE (40%) ===

  // Buts marqués (impact majeur)
  rating += team.goalsPerMatch * RATING_WEIGHTS.goal;

  // Assists
  rating += (team.assists / team.matches) * RATING_WEIGHTS.assist;

  // Tirs cadrés
  rating += team.shotsOnTargetPerMatch * RATING_WEIGHTS.shotOnTarget;

  // Grandes occasions créées
  rating += team.bigChancesPerMatch * RATING_WEIGHTS.bigChance;

  // Grandes occasions manquées (négatif)
  rating += team.bigChancesMissedPerMatch * RATING_WEIGHTS.bigChanceMissed;

  // === DÉFENSE (30%) ===

  // Tacles
  rating += team.tacklesPerMatch * RATING_WEIGHTS.tackle;

  // Interceptions
  rating += team.interceptionsPerMatch * RATING_WEIGHTS.interception;

  // Dégagements
  rating += team.clearancesPerMatch * RATING_WEIGHTS.clearance;

  // Clean sheets (ratio)
  const cleanSheetRatio = team.cleanSheets / team.matches;
  rating += cleanSheetRatio * RATING_WEIGHTS.cleanSheet * 10;

  // Buts encaissés (négatif)
  rating += team.goalsConcededPerMatch * RATING_WEIGHTS.goalConceded;

  // === POSSESSION & DISTRIBUTION (20%) ===

  // Précision des passes
  rating += team.accuracyPerMatch * RATING_WEIGHTS.passAccuracy;

  // Longs ballons réussis
  rating += team.longBallsAccuratePerMatch * RATING_WEIGHTS.longBallAccurate;

  // Possession
  rating += team.possession * RATING_WEIGHTS.possession;

  // === DISCIPLINE (10% négatif) ===

  // Cartons jaunes
  rating += team.yellowCardsPerMatch * RATING_WEIGHTS.yellowCard;

  // Cartons rouges
  rating += team.redCardsPerMatch * RATING_WEIGHTS.redCard;

  // Penalties concédés
  rating += (team.penaltyConceded / team.matches) * RATING_WEIGHTS.penaltyConceded;

  // === AUTRES STATISTIQUES ===

  // Duels gagnés
  rating += team.duelsWonPerMatch * RATING_WEIGHTS.duel;

  // Hors-jeux (négatif léger)
  rating += team.offsidesPerMatch * RATING_WEIGHTS.offside;

  // Limiter entre 3.0 et 10.0 (échelle SofaScore)
  rating = Math.max(3.0, Math.min(10.0, rating));

  // Arrondir à 2 décimales
  return Math.round(rating * 100) / 100;
}

/**
 * Calcule le rating avec détails des composantes
 */
export function calculateDetailedRating(team: TeamStats): {
  overallRating: number;
  components: {
    attack: number;
    defense: number;
    possession: number;
    discipline: number;
  };
  breakdown: string[];
} {
  const baseRating = 6.5;
  let attackRating = 0;
  let defenseRating = 0;
  let possessionRating = 0;
  let disciplineRating = 0;

  const breakdown: string[] = [];

  // ATTAQUE
  const goalImpact = team.goalsPerMatch * RATING_WEIGHTS.goal;
  attackRating += goalImpact;
  breakdown.push(`Buts: +${goalImpact.toFixed(2)}`);

  const assistImpact = (team.assists / team.matches) * RATING_WEIGHTS.assist;
  attackRating += assistImpact;
  breakdown.push(`Assists: +${assistImpact.toFixed(2)}`);

  const shotsImpact = team.shotsOnTargetPerMatch * RATING_WEIGHTS.shotOnTarget;
  attackRating += shotsImpact;
  breakdown.push(`Tirs cadrés: +${shotsImpact.toFixed(2)}`);

  const bigChancesImpact = team.bigChancesPerMatch * RATING_WEIGHTS.bigChance;
  attackRating += bigChancesImpact;
  breakdown.push(`Grandes occasions: +${bigChancesImpact.toFixed(2)}`);

  // DÉFENSE
  const tacklesImpact = team.tacklesPerMatch * RATING_WEIGHTS.tackle;
  defenseRating += tacklesImpact;
  breakdown.push(`Tacles: +${tacklesImpact.toFixed(2)}`);

  const interceptionsImpact = team.interceptionsPerMatch * RATING_WEIGHTS.interception;
  defenseRating += interceptionsImpact;
  breakdown.push(`Interceptions: +${interceptionsImpact.toFixed(2)}`);

  const cleanSheetsImpact = (team.cleanSheets / team.matches) * RATING_WEIGHTS.cleanSheet * 10;
  defenseRating += cleanSheetsImpact;
  breakdown.push(`Clean sheets: +${cleanSheetsImpact.toFixed(2)}`);

  const goalsConcededImpact = team.goalsConcededPerMatch * RATING_WEIGHTS.goalConceded;
  defenseRating += goalsConcededImpact;
  breakdown.push(`Buts encaissés: ${goalsConcededImpact.toFixed(2)}`);

  // POSSESSION
  const passAccuracyImpact = team.accuracyPerMatch * RATING_WEIGHTS.passAccuracy;
  possessionRating += passAccuracyImpact;
  breakdown.push(`Précision passes: +${passAccuracyImpact.toFixed(2)}`);

  const possessionImpact = team.possession * RATING_WEIGHTS.possession;
  possessionRating += possessionImpact;
  breakdown.push(`Possession: +${possessionImpact.toFixed(2)}`);

  // DISCIPLINE
  const yellowCardsImpact = team.yellowCardsPerMatch * RATING_WEIGHTS.yellowCard;
  disciplineRating += yellowCardsImpact;
  breakdown.push(`Cartons jaunes: ${yellowCardsImpact.toFixed(2)}`);

  const redCardsImpact = team.redCardsPerMatch * RATING_WEIGHTS.redCard;
  disciplineRating += redCardsImpact;
  breakdown.push(`Cartons rouges: ${redCardsImpact.toFixed(2)}`);

  const overallRating = Math.max(
    3.0,
    Math.min(10.0, baseRating + attackRating + defenseRating + possessionRating + disciplineRating)
  );

  return {
    overallRating: Math.round(overallRating * 100) / 100,
    components: {
      attack: Math.round(attackRating * 100) / 100,
      defense: Math.round(defenseRating * 100) / 100,
      possession: Math.round(possessionRating * 100) / 100,
      discipline: Math.round(disciplineRating * 100) / 100,
    },
    breakdown,
  };
}

/**
 * Compare deux équipes selon le système SofaScore
 */
export function compareTeamRatings(homeTeam: TeamStats, awayTeam: TeamStats): {
  homeRating: number;
  awayRating: number;
  difference: number;
  advantage: 'HOME' | 'AWAY' | 'BALANCED';
  analysis: string;
} {
  const homeRating = calculateSofaScoreRating(homeTeam);
  const awayRating = calculateSofaScoreRating(awayTeam);
  const difference = homeRating - awayRating;

  let advantage: 'HOME' | 'AWAY' | 'BALANCED';
  let analysis: string;

  if (Math.abs(difference) < 0.3) {
    advantage = 'BALANCED';
    analysis = `Match équilibré. Les deux équipes ont des ratings très proches (${homeRating.toFixed(2)} vs ${awayRating.toFixed(2)}).`;
  } else if (difference > 0) {
    advantage = 'HOME';
    if (difference > 1.0) {
      analysis = `Avantage MAJEUR pour ${homeTeam.name} (${homeRating.toFixed(2)} vs ${awayRating.toFixed(2)}). Différence de ${difference.toFixed(2)} points.`;
    } else {
      analysis = `Léger avantage pour ${homeTeam.name} (${homeRating.toFixed(2)} vs ${awayRating.toFixed(2)}).`;
    }
  } else {
    advantage = 'AWAY';
    if (Math.abs(difference) > 1.0) {
      analysis = `Avantage MAJEUR pour ${awayTeam.name} (${awayRating.toFixed(2)} vs ${homeRating.toFixed(2)}). Différence de ${Math.abs(difference).toFixed(2)} points.`;
    } else {
      analysis = `Léger avantage pour ${awayTeam.name} (${awayRating.toFixed(2)} vs ${homeRating.toFixed(2)}).`;
    }
  }

  return {
    homeRating: Math.round(homeRating * 100) / 100,
    awayRating: Math.round(awayRating * 100) / 100,
    difference: Math.round(difference * 100) / 100,
    advantage,
    analysis,
  };
}

/**
 * Calcule un rating ajusté basé sur le rating SofaScore existant
 * Utilisé quand on a déjà un rating SofaScore mais qu'on veut le valider/ajuster
 */
export function validateSofaScoreRating(
  providedRating: number,
  team: TeamStats
): {
  providedRating: number;
  calculatedRating: number;
  difference: number;
  isConsistent: boolean;
  recommendation: string;
} {
  const calculatedRating = calculateSofaScoreRating(team);
  const difference = Math.abs(providedRating - calculatedRating);

  let isConsistent = difference < 0.5;
  let recommendation: string;

  if (isConsistent) {
    recommendation = `✅ Rating cohérent. Différence acceptable de ${difference.toFixed(2)} points.`;
  } else if (difference < 1.0) {
    recommendation = `⚠️ Légère incohérence. Différence de ${difference.toFixed(2)} points. Vérifier les données.`;
  } else {
    recommendation = `❌ Incohérence majeure! Différence de ${difference.toFixed(2)} points. Les données semblent incorrectes.`;
  }

  return {
    providedRating,
    calculatedRating: Math.round(calculatedRating * 100) / 100,
    difference: Math.round(difference * 100) / 100,
    isConsistent,
    recommendation,
  };
}

/**
 * Génère un rapport détaillé du rating
 */
export function generateRatingReport(team: TeamStats): string {
  const detailed = calculateDetailedRating(team);

  let report = `📊 RATING SOFASCORE: ${team.name}\n`;
  report += `${'='.repeat(60)}\n\n`;

  report += `🎯 Note Globale: ${detailed.overallRating}/10\n`;
  report += `   (Base: 6.5 + Ajustements)\n\n`;

  report += `📈 COMPOSANTES:\n`;
  report += `   ⚽ Attaque: ${detailed.components.attack > 0 ? '+' : ''}${detailed.components.attack.toFixed(2)}\n`;
  report += `   🛡️ Défense: ${detailed.components.defense > 0 ? '+' : ''}${detailed.components.defense.toFixed(2)}\n`;
  report += `   📊 Possession: ${detailed.components.possession > 0 ? '+' : ''}${detailed.components.possession.toFixed(2)}\n`;
  report += `   💛 Discipline: ${detailed.components.discipline.toFixed(2)}\n\n`;

  report += `🔍 DÉTAILS:\n`;
  detailed.breakdown.forEach(line => {
    report += `   • ${line}\n`;
  });

  report += `\n${'='.repeat(60)}\n`;

  return report;
}
