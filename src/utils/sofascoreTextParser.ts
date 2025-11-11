/**
 * Parser de texte copié-collé depuis SofaScore
 * Permet de coller directement les statistiques sans scraping
 */

import { TeamStats } from '@/types/football';

export interface ParsedTeamData {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  success: boolean;
  error?: string;
}

/**
 * Parse le texte copié depuis SofaScore avec format séquentiel
 */
export function parseSofaScoreText(text: string): ParsedTeamData {
  try {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    // Extraire les noms des équipes (première ligne)
    const firstLine = lines[0];
    const teamMatch = firstLine.match(/Equipe\s+A\s+(.+?)\s+et\s+(?:Equipe\s+(?:B\s+)?)?(.+)/i);

    let homeTeamName = 'Équipe Domicile';
    let awayTeamName = 'Équipe Extérieur';

    if (teamMatch) {
      homeTeamName = teamMatch[1].trim();
      awayTeamName = teamMatch[2].trim();
    }

    // Fonction pour trouver une ligne et récupérer les 2 valeurs suivantes
    const findValues = (keyword: string): [number, number] => {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(keyword.toLowerCase())) {
          // Chercher les 2 prochaines lignes avec des nombres
          const values: number[] = [];
          for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
            const num = parseFloat(lines[j].replace(',', '.').replace('%', '').trim());
            if (!isNaN(num)) {
              values.push(num);
              if (values.length === 2) break;
            }
          }
          return values.length === 2 ? [values[0], values[1]] : [0, 0];
        }
      }
      return [0, 0];
    };

    // Fonction pour extraire une valeur avec pourcentage entre parenthèses
    const findValuesWithPercent = (keyword: string): [number, number, number, number] => {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(keyword.toLowerCase())) {
          // Chercher les 2 prochaines lignes avec format "123.4 (56.7%)"
          const values: number[] = [];
          for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
            const match = lines[j].match(/([0-9,.]+)\s*\(([0-9,.]+)%?\)/);
            if (match) {
              const val = parseFloat(match[1].replace(',', '.'));
              const pct = parseFloat(match[2].replace(',', '.'));
              values.push(val, pct);
              if (values.length === 4) break;
            }
          }
          return values.length === 4
            ? [values[0], values[1], values[2], values[3]]
            : [0, 0, 0, 0];
        }
      }
      return [0, 0, 0, 0];
    };

    // Extraire toutes les statistiques
    const [homeRating, awayRating] = findValues('moy. des notes sofascore');
    const [homeMatches, awayMatches] = findValues('matchs');
    const [homeGoals, awayGoals] = findValues('buts marqués');
    const [homeConceded, awayConceded] = findValues('buts encaissés');
    const [homeAssists, awayAssists] = findValues('passes décisives');
    const [homeGoalsPerMatch, awayGoalsPerMatch] = findValues('buts par match');
    const [homeShotsOnTarget, awayShotsOnTarget] = findValues('tirs cadrés par match');
    const [homeBigChances, awayBigChances] = findValues('grosses occasions par match');
    const [homeBigChancesMissed, awayBigChancesMissed] = findValues('grosses occasions ratées');
    const [homePossession, awayPossession] = findValues('possession');

    // Passes avec pourcentage
    const [homeAccuratePasses, homePassAccuracy, awayAccuratePasses, awayPassAccuracy] =
      findValuesWithPercent('précision par match');

    const [homeLongBalls, homeLongBallsAccuracy, awayLongBalls, awayLongBallsAccuracy] =
      findValuesWithPercent('longues balles');

    // Défense
    const [homeCleanSheets, awayCleanSheets] = findValues('cage inviolée');
    const [homeConcededPerMatch, awayConcededPerMatch] = findValues('buts encaissés par match');
    const [homeInterceptions, awayInterceptions] = findValues('interceptions par match');
    const [homeTackles, awayTackles] = findValues('tacles par match');
    const [homeClearances, awayClearances] = findValues('dégagements par match');
    const [homePenaltyConceded, awayPenaltyConceded] = findValues('buts sur penalty concédés');

    // Autre
    const [homeDuels, homeDuelsPercent, awayDuels, awayDuelsPercent] =
      findValuesWithPercent('duels remportés');

    const [homeFouls, awayFouls] = findValues('fautes par match');
    const [homeOffsides, awayOffsides] = findValues('hors-jeux par match');
    const [homeGoalKicks, awayGoalKicks] = findValues('coup de pied de but par match');
    const [homeThrowIns, awayThrowIns] = findValues('touches par match');
    const [homeYellowCards, awayYellowCards] = findValues('cartons jaunes par match');
    const [homeRedCards, awayRedCards] = findValues('cartons rouges');

    // Construire les objets TeamStats
    const homeTeam: TeamStats = {
      name: homeTeamName,
      sofascoreRating: homeRating,
      matches: Math.round(homeMatches),
      goalsScored: Math.round(homeGoals),
      goalsConceded: Math.round(homeConceded),
      assists: Math.round(homeAssists),
      goalsPerMatch: homeGoalsPerMatch,
      shotsOnTargetPerMatch: homeShotsOnTarget,
      bigChancesPerMatch: homeBigChances,
      bigChancesMissedPerMatch: homeBigChancesMissed,
      possession: homePossession,
      accuracyPerMatch: homePassAccuracy,
      longBallsAccuratePerMatch: homeLongBalls,
      cleanSheets: Math.round(homeCleanSheets),
      goalsConcededPerMatch: homeConcededPerMatch,
      interceptionsPerMatch: homeInterceptions,
      tacklesPerMatch: homeTackles,
      clearancesPerMatch: homeClearances,
      penaltyConceded: Math.round(homePenaltyConceded),
      throwInsPerMatch: homeThrowIns,
      yellowCardsPerMatch: homeYellowCards,
      duelsWonPerMatch: homeDuels,
      offsidesPerMatch: homeOffsides,
      goalKicksPerMatch: homeGoalKicks,
      redCardsPerMatch: homeRedCards / (homeMatches || 1),
      foulsPerMatch: homeFouls
    };

    const awayTeam: TeamStats = {
      name: awayTeamName,
      sofascoreRating: awayRating,
      matches: Math.round(awayMatches),
      goalsScored: Math.round(awayGoals),
      goalsConceded: Math.round(awayConceded),
      assists: Math.round(awayAssists),
      goalsPerMatch: awayGoalsPerMatch,
      shotsOnTargetPerMatch: awayShotsOnTarget,
      bigChancesPerMatch: awayBigChances,
      bigChancesMissedPerMatch: awayBigChancesMissed,
      possession: awayPossession,
      accuracyPerMatch: awayPassAccuracy,
      longBallsAccuratePerMatch: awayLongBalls,
      cleanSheets: Math.round(awayCleanSheets),
      goalsConcededPerMatch: awayConcededPerMatch,
      interceptionsPerMatch: awayInterceptions,
      tacklesPerMatch: awayTackles,
      clearancesPerMatch: awayClearances,
      penaltyConceded: Math.round(awayPenaltyConceded),
      throwInsPerMatch: awayThrowIns,
      yellowCardsPerMatch: awayYellowCards,
      duelsWonPerMatch: awayDuels,
      offsidesPerMatch: awayOffsides,
      goalKicksPerMatch: awayGoalKicks,
      redCardsPerMatch: awayRedCards / (awayMatches || 1),
      foulsPerMatch: awayFouls
    };

    return {
      homeTeam,
      awayTeam,
      success: true
    };

  } catch (error) {
    return {
      homeTeam: {} as TeamStats,
      awayTeam: {} as TeamStats,
      success: false,
      error: error instanceof Error ? error.message : 'Erreur de parsing'
    };
  }
}
