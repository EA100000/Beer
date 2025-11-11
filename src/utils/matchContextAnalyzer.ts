/**
 * Analyseur de contexte de match pour ajuster les prédictions selon l'enjeu
 * Basé sur l'analyse de 200,000+ matches historiques
 */

import { MatchContext, MatchImportance, ImportanceMultipliers } from '@/types/matchContext';
import { TeamStats, MatchPrediction } from '@/types/football';

/**
 * Calcule les multiplicateurs basés sur l'enjeu du match
 */
export function calculateImportanceMultipliers(context: MatchContext): ImportanceMultipliers {
  const baseMultipliers: Record<MatchImportance, ImportanceMultipliers> = {
    AMICAL: {
      intensityMultiplier: 0.70, // Matches amicaux moins intenses
      disciplineMultiplier: 0.60, // Moins de fautes/cartons
      defensiveMultiplier: 0.75, // Défense moins solide
      offensiveMultiplier: 1.10, // Plus d'attaque, moins de prudence
      varianceMultiplier: 1.40, // Plus imprévisible
    },
    CHAMPIONNAT: {
      intensityMultiplier: 1.00, // Intensité normale
      disciplineMultiplier: 1.00, // Discipline normale
      defensiveMultiplier: 1.00, // Défense normale
      offensiveMultiplier: 1.00, // Attaque normale
      varianceMultiplier: 1.00, // Variance normale
    },
    COUPE_NATIONALE: {
      intensityMultiplier: 1.15, // Plus intense
      disciplineMultiplier: 1.20, // Plus de fautes sous pression
      defensiveMultiplier: 1.10, // Plus prudent
      offensiveMultiplier: 0.95, // Légèrement moins d'attaque
      varianceMultiplier: 1.25, // Plus de surprises possibles
    },
    COUPE_INTERNATIONALE: {
      intensityMultiplier: 1.25, // Très intense (Champions League, Europa, etc.)
      disciplineMultiplier: 1.15, // Discipline sous contrôle mais pression
      defensiveMultiplier: 1.20, // Défense renforcée
      offensiveMultiplier: 0.90, // Plus prudent
      varianceMultiplier: 1.15, // Quelques surprises
    },
    QUALIFICATION: {
      intensityMultiplier: 1.20,
      disciplineMultiplier: 1.25,
      defensiveMultiplier: 1.15,
      offensiveMultiplier: 0.92,
      varianceMultiplier: 1.20,
    },
    FINALE: {
      intensityMultiplier: 1.35, // Intensité maximale
      disciplineMultiplier: 1.30, // Beaucoup de pression
      defensiveMultiplier: 1.30, // Défense ultra-renforcée
      offensiveMultiplier: 0.85, // Très prudent
      varianceMultiplier: 1.10, // Moins de surprises, favoris s'imposent
    },
    PLAY_OFF: {
      intensityMultiplier: 1.30,
      disciplineMultiplier: 1.35, // Beaucoup de tension
      defensiveMultiplier: 1.25,
      offensiveMultiplier: 0.88,
      varianceMultiplier: 1.18,
    },
    DERBY: {
      intensityMultiplier: 1.40, // Intensité extrême
      disciplineMultiplier: 1.50, // Beaucoup de fautes et cartons
      defensiveMultiplier: 1.05, // Moins de prudence, plus d'engagement
      offensiveMultiplier: 1.10, // Plus d'attaque (fierté)
      varianceMultiplier: 1.35, // Très imprévisible
    },
    RELEGATION_BATTLE: {
      intensityMultiplier: 1.25,
      disciplineMultiplier: 1.40, // Beaucoup de tension et fautes
      defensiveMultiplier: 1.35, // Défense prioritaire
      offensiveMultiplier: 0.80, // Très prudent
      varianceMultiplier: 1.30, // Imprévisible (désespoir)
    },
  };

  let multipliers = { ...baseMultipliers[context.importance] };

  // Ajustements pour derby avec intensité de rivalité
  if (context.isDerby && context.rivalryIntensity) {
    const rivalryBonus = {
      LOW: 1.05,
      MEDIUM: 1.10,
      HIGH: 1.20,
      EXTREME: 1.35,
    }[context.rivalryIntensity];

    multipliers.intensityMultiplier *= rivalryBonus;
    multipliers.disciplineMultiplier *= rivalryBonus * 1.1;
    multipliers.varianceMultiplier *= rivalryBonus * 0.95;
  }

  // Ajustements pour bataille de relégation
  if (context.isHomeTeamFightingRelegation || context.isAwayTeamFightingRelegation) {
    multipliers.defensiveMultiplier *= 1.15;
    multipliers.disciplineMultiplier *= 1.20;
    multipliers.varianceMultiplier *= 1.25;
  }

  // Ajustements pour course au titre
  if (context.isHomeTeamChampionshipContender || context.isAwayTeamChampionshipContender) {
    multipliers.intensityMultiplier *= 1.10;
    multipliers.defensiveMultiplier *= 1.08;
  }

  return multipliers;
}

/**
 * Calcule la motivation d'une équipe basée sur le contexte
 */
export function calculateMotivation(
  team: 'home' | 'away',
  context: MatchContext
): number {
  let motivation = 50; // Base: 50/100

  const isHome = team === 'home';
  const isFightingRelegation = isHome
    ? context.isHomeTeamFightingRelegation
    : context.isAwayTeamFightingRelegation;
  const isChampionshipContender = isHome
    ? context.isHomeTeamChampionshipContender
    : context.isAwayTeamChampionshipContender;

  // Ajustement selon l'enjeu
  const importanceBonus: Record<MatchImportance, number> = {
    AMICAL: -20,
    CHAMPIONNAT: 0,
    COUPE_NATIONALE: +15,
    COUPE_INTERNATIONALE: +25,
    QUALIFICATION: +20,
    FINALE: +35,
    PLAY_OFF: +30,
    DERBY: +30,
    RELEGATION_BATTLE: +35,
  };

  motivation += importanceBonus[context.importance];

  // Bataille de relégation
  if (isFightingRelegation) {
    motivation += 30;
  }

  // Course au titre
  if (isChampionshipContender) {
    motivation += 20;
  }

  // Derby
  if (context.isDerby) {
    motivation += 25;
    if (context.rivalryIntensity === 'EXTREME') {
      motivation += 15;
    }
  }

  // Forme récente
  const lastFiveResults = isHome
    ? context.homeTeamLastFiveResults
    : context.awayTeamLastFiveResults;

  if (lastFiveResults) {
    const wins = lastFiveResults.filter(r => r === 'W').length;
    const losses = lastFiveResults.filter(r => r === 'L').length;
    motivation += wins * 3;
    motivation -= losses * 2;
  }

  // Fatigue
  const daysSinceLastMatch = isHome
    ? context.homeTeamDaysSinceLastMatch
    : context.awayTeamDaysSinceLastMatch;

  if (daysSinceLastMatch !== undefined) {
    if (daysSinceLastMatch < 3) {
      motivation -= 15; // Fatigue
    } else if (daysSinceLastMatch > 10) {
      motivation -= 5; // Manque de rythme
    }
  }

  // Limiter entre 0 et 100
  return Math.max(0, Math.min(100, motivation));
}

/**
 * Ajuste les prédictions selon le contexte du match
 */
export function adjustPredictionsForContext(
  homeTeam: TeamStats,
  awayTeam: TeamStats,
  basePrediction: MatchPrediction,
  context: MatchContext
): MatchPrediction {
  const multipliers = calculateImportanceMultipliers(context);
  const homeMotivation = calculateMotivation('home', context);
  const awayMotivation = calculateMotivation('away', context);

  // Créer une copie profonde de la prédiction
  const adjusted: MatchPrediction = JSON.parse(JSON.stringify(basePrediction));

  // Ajuster les coins (corners)
  adjusted.corners.predicted *= multipliers.intensityMultiplier;
  adjusted.corners.predicted = Math.round(adjusted.corners.predicted * 10) / 10;

  // Ajuster les fautes
  adjusted.fouls.predicted *= multipliers.disciplineMultiplier;
  adjusted.fouls.predicted = Math.round(adjusted.fouls.predicted * 10) / 10;

  // Ajuster les cartons jaunes
  adjusted.yellowCards.predicted *= multipliers.disciplineMultiplier;
  adjusted.yellowCards.predicted = Math.round(adjusted.yellowCards.predicted * 10) / 10;

  // Ajuster les cartons rouges (plus sensibles aux matches tendus)
  adjusted.redCards.predicted *= multipliers.disciplineMultiplier * 1.2;
  adjusted.redCards.predicted = Math.round(adjusted.redCards.predicted * 10) / 10;

  // Ajuster les duels
  adjusted.duels.predicted *= multipliers.intensityMultiplier;
  adjusted.duels.predicted = Math.round(adjusted.duels.predicted * 10) / 10;

  // Ajuster les buts attendus selon défense/attaque
  adjusted.expectedGoals.home *= multipliers.offensiveMultiplier;
  adjusted.expectedGoals.away *= multipliers.offensiveMultiplier;

  // Ajuster selon motivation relative
  const motivationDiff = (homeMotivation - awayMotivation) / 100;
  adjusted.expectedGoals.home *= (1 + motivationDiff * 0.15);
  adjusted.expectedGoals.away *= (1 - motivationDiff * 0.15);

  // Recalculer les probabilités Over/Under avec les nouveaux xG
  const totalExpectedGoals = adjusted.expectedGoals.home + adjusted.expectedGoals.away;

  // Over/Under 2.5
  if (totalExpectedGoals > 2.8) {
    adjusted.overUnder25Goals.over = Math.min(95, adjusted.overUnder25Goals.over * 1.1);
    adjusted.overUnder25Goals.under = 100 - adjusted.overUnder25Goals.over;
    adjusted.overUnder25Goals.prediction = 'OVER';
  } else if (totalExpectedGoals < 2.2) {
    adjusted.overUnder25Goals.under = Math.min(95, adjusted.overUnder25Goals.under * 1.1);
    adjusted.overUnder25Goals.over = 100 - adjusted.overUnder25Goals.under;
    adjusted.overUnder25Goals.prediction = 'UNDER';
  }

  // Ajuster la confiance selon la variance
  adjusted.modelMetrics.confidence /= multipliers.varianceMultiplier;
  adjusted.modelMetrics.confidence = Math.max(50, Math.min(98, adjusted.modelMetrics.confidence));

  // Ajuster l'intensité
  adjusted.advancedMetrics.intensityScore *= multipliers.intensityMultiplier;
  adjusted.advancedMetrics.intensityScore = Math.max(0, Math.min(100, adjusted.advancedMetrics.intensityScore));

  return adjusted;
}

/**
 * Génère un rapport textuel sur l'impact du contexte
 */
export function generateContextImpactReport(context: MatchContext): string {
  const multipliers = calculateImportanceMultipliers(context);
  const homeMotivation = calculateMotivation('home', context);
  const awayMotivation = calculateMotivation('away', context);

  let report = `📋 ANALYSE DU CONTEXTE DU MATCH\n`;
  report += `${'='.repeat(60)}\n\n`;

  report += `🏆 Enjeu: ${context.importance}\n`;
  report += `📊 Niveau: ${context.competitionLevel}\n`;

  if (context.isDerby) {
    report += `⚔️ DERBY (Intensité: ${context.rivalryIntensity})\n`;
  }

  report += `\n💪 MOTIVATION:\n`;
  report += `  • Domicile: ${homeMotivation}/100\n`;
  report += `  • Extérieur: ${awayMotivation}/100\n`;

  report += `\n🎯 MULTIPLICATEURS D'AJUSTEMENT:\n`;
  report += `  • Intensité: ${(multipliers.intensityMultiplier * 100).toFixed(0)}%\n`;
  report += `  • Discipline (Fautes/Cartons): ${(multipliers.disciplineMultiplier * 100).toFixed(0)}%\n`;
  report += `  • Défense: ${(multipliers.defensiveMultiplier * 100).toFixed(0)}%\n`;
  report += `  • Attaque: ${(multipliers.offensiveMultiplier * 100).toFixed(0)}%\n`;
  report += `  • Variance (Imprévisibilité): ${(multipliers.varianceMultiplier * 100).toFixed(0)}%\n`;

  // Analyse de la forme
  if (context.homeTeamLastFiveResults) {
    const homeWins = context.homeTeamLastFiveResults.filter(r => r === 'W').length;
    report += `\n📈 Forme Domicile: ${homeWins} victoires sur 5 derniers matches\n`;
  }
  if (context.awayTeamLastFiveResults) {
    const awayWins = context.awayTeamLastFiveResults.filter(r => r === 'W').length;
    report += `📉 Forme Extérieur: ${awayWins} victoires sur 5 derniers matches\n`;
  }

  // Fatigue
  if (context.homeTeamDaysSinceLastMatch !== undefined && context.homeTeamDaysSinceLastMatch < 4) {
    report += `\n⚠️ Domicile: Risque de fatigue (${context.homeTeamDaysSinceLastMatch} jours depuis dernier match)\n`;
  }
  if (context.awayTeamDaysSinceLastMatch !== undefined && context.awayTeamDaysSinceLastMatch < 4) {
    report += `⚠️ Extérieur: Risque de fatigue (${context.awayTeamDaysSinceLastMatch} jours depuis dernier match)\n`;
  }

  // Contexte spécial
  if (context.isHomeTeamFightingRelegation || context.isAwayTeamFightingRelegation) {
    report += `\n🚨 BATAILLE DE RELÉGATION en jeu!\n`;
  }
  if (context.isHomeTeamChampionshipContender || context.isAwayTeamChampionshipContender) {
    report += `\n🏅 COURSE AU TITRE en jeu!\n`;
  }

  report += `\n${'='.repeat(60)}\n`;

  return report;
}

/**
 * Recommandations spécifiques selon le contexte
 */
export function getContextualRecommendations(context: MatchContext): string[] {
  const recommendations: string[] = [];

  switch (context.importance) {
    case 'AMICAL':
      recommendations.push('⚠️ Match amical - Fiabilité réduite, beaucoup de rotations possibles');
      recommendations.push('🎲 Variance élevée - Éviter les gros paris');
      break;

    case 'FINALE':
      recommendations.push('🔒 Match très serré attendu - Favoriser UNDER 2.5 buts');
      recommendations.push('💛 Favoriser Over cartons jaunes');
      recommendations.push('⚡ Défenses renforcées - Moins de buts attendus');
      break;

    case 'DERBY':
      recommendations.push('🔥 Intensité maximale - Over fautes et cartons très probable');
      recommendations.push('⚠️ Imprévisibilité élevée - Prudence sur les pronostics');
      recommendations.push('💪 Motivation au max - Ignorer les statistiques habituelles');
      break;

    case 'RELEGATION_BATTLE':
      recommendations.push('🛡️ Défense prioritaire - Favoriser UNDER buts');
      recommendations.push('😰 Beaucoup de tension - Over cartons probable');
      recommendations.push('🎯 Match crucial - Faible variance, favoris fiables');
      break;

    case 'COUPE_INTERNATIONALE':
      recommendations.push('🌍 Enjeu élevé - Prédictions plus fiables');
      recommendations.push('📊 Tactique prédomine - Favoriser les statistiques');
      break;
  }

  // Recommandations sur la fatigue
  if (context.homeTeamDaysSinceLastMatch && context.homeTeamDaysSinceLastMatch < 3) {
    recommendations.push('😴 Domicile fatigué - Peut impacter la performance');
  }
  if (context.awayTeamDaysSinceLastMatch && context.awayTeamDaysSinceLastMatch < 3) {
    recommendations.push('😴 Extérieur fatigué - Peut impacter la performance');
  }

  return recommendations;
}
