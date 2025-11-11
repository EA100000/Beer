/**
 * Parser de texte copié-collé depuis SofaScore
 * Permet de coller directement les statistiques sans scraping
 *
 * AMÉLIORATIONS SÉCURITÉ:
 * - Détection échecs de parsing avec logging
 * - Validation des données parsées
 * - Flag MISSING (-999) au lieu de 0 silencieux
 * - Fallback sur moyennes de ligue
 */

import { TeamStats } from '@/types/football';

export interface ParsedTeamData {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  success: boolean;
  error?: string;
  warnings?: string[];  // Nouveaux warnings
  missingFields?: string[];  // Champs manquants
}

// Flag pour champs manquants (au lieu de 0 silencieux)
const MISSING = -999;

// Moyennes de ligue pour fallback
const LEAGUE_AVERAGES = {
  sofascoreRating: 7.0,
  goalsPerMatch: 1.5,
  goalsConcededPerMatch: 1.5,
  possession: 50,
  shotsOnTargetPerMatch: 4.5,
  bigChancesPerMatch: 1.5,
  foulsPerMatch: 12,
  yellowCardsPerMatch: 2,
  offsides: 2,
  duels: 15
};

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

    // ========================================================================
    // PARSING AMÉLIORÉ AVEC DÉTECTION D'ÉCHECS
    // ========================================================================
    const warnings: string[] = [];
    const missingFields: string[] = [];

    // Fonction pour trouver une ligne et récupérer les 2 valeurs suivantes
    const findValues = (keyword: string, fieldName: string): [number, number] => {
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

          if (values.length === 2) {
            return [values[0], values[1]];
          } else {
            // ÉCHEC: Logger et marquer comme MISSING
            console.warn(`⚠️ [Parser] Échec extraction "${keyword}" (${fieldName})`);
            warnings.push(`Échec extraction: ${fieldName}`);
            missingFields.push(fieldName);
            return [MISSING, MISSING];
          }
        }
      }

      // Keyword non trouvé
      console.warn(`⚠️ [Parser] Keyword "${keyword}" non trouvé (${fieldName})`);
      warnings.push(`Keyword non trouvé: ${fieldName}`);
      missingFields.push(fieldName);
      return [MISSING, MISSING];
    };

    // Fonction pour extraire une valeur avec pourcentage entre parenthèses
    const findValuesWithPercent = (keyword: string, fieldName: string): [number, number, number, number] => {
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

          if (values.length === 4) {
            return [values[0], values[1], values[2], values[3]];
          } else {
            console.warn(`⚠️ [Parser] Échec extraction "${keyword}" (${fieldName})`);
            warnings.push(`Échec extraction: ${fieldName}`);
            missingFields.push(fieldName);
            return [MISSING, MISSING, MISSING, MISSING];
          }
        }
      }

      console.warn(`⚠️ [Parser] Keyword "${keyword}" non trouvé (${fieldName})`);
      warnings.push(`Keyword non trouvé: ${fieldName}`);
      missingFields.push(fieldName);
      return [MISSING, MISSING, MISSING, MISSING];
    };

    // Extraire toutes les statistiques avec fieldName pour logging
    const [homeRating, awayRating] = findValues('moy. des notes sofascore', 'rating');
    const [homeMatches, awayMatches] = findValues('matchs', 'matches');
    const [homeGoals, awayGoals] = findValues('buts marqués', 'goalsScored');
    const [homeConceded, awayConceded] = findValues('buts encaissés', 'goalsConceded');
    const [homeAssists, awayAssists] = findValues('passes décisives', 'assists');
    const [homeGoalsPerMatch, awayGoalsPerMatch] = findValues('buts par match', 'goalsPerMatch');
    const [homeShotsOnTarget, awayShotsOnTarget] = findValues('tirs cadrés par match', 'shotsOnTarget');
    const [homeBigChances, awayBigChances] = findValues('grosses occasions par match', 'bigChances');
    const [homeBigChancesMissed, awayBigChancesMissed] = findValues('grosses occasions ratées', 'bigChancesMissed');
    const [homePossession, awayPossession] = findValues('possession', 'possession');

    // Passes avec pourcentage
    const [homeAccuratePasses, homePassAccuracy, awayAccuratePasses, awayPassAccuracy] =
      findValuesWithPercent('précision par match', 'passes');

    const [homeLongBalls, homeLongBallsAccuracy, awayLongBalls, awayLongBallsAccuracy] =
      findValuesWithPercent('longues balles', 'longBalls');

    // Défense
    const [homeCleanSheets, awayCleanSheets] = findValues('cage inviolée', 'cleanSheets');
    const [homeConcededPerMatch, awayConcededPerMatch] = findValues('buts encaissés par match', 'concededPerMatch');
    const [homeInterceptions, awayInterceptions] = findValues('interceptions par match', 'interceptions');
    const [homeTackles, awayTackles] = findValues('tacles par match', 'tackles');
    const [homeClearances, awayClearances] = findValues('dégagements par match', 'clearances');
    const [homePenaltyConceded, awayPenaltyConceded] = findValues('buts sur penalty concédés', 'penaltyConceded');

    // Autre
    const [homeDuels, homeDuelsPercent, awayDuels, awayDuelsPercent] =
      findValuesWithPercent('duels remportés', 'duels');

    const [homeFouls, awayFouls] = findValues('fautes par match', 'fouls');
    const [homeOffsides, awayOffsides] = findValues('hors-jeux par match', 'offsides');
    const [homeGoalKicks, awayGoalKicks] = findValues('coup de pied de but par match', 'goalKicks');
    const [homeThrowIns, awayThrowIns] = findValues('touches par match', 'throwIns');
    const [homeYellowCards, awayYellowCards] = findValues('cartons jaunes par match', 'yellowCards');
    const [homeRedCards, awayRedCards] = findValues('cartons rouges', 'redCards');

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

    // ========================================================================
    // VALIDATION ET FALLBACK SUR MOYENNES DE LIGUE
    // ========================================================================
    const applyFallback = (value: number, fallbackValue: number, fieldName: string): number => {
      if (value === MISSING) {
        console.warn(`⚠️ [Parser] Utilisation fallback pour ${fieldName}: ${fallbackValue}`);
        return fallbackValue;
      }
      return value;
    };

    // Appliquer fallbacks sur champs critiques
    homeTeam.sofascoreRating = applyFallback(homeTeam.sofascoreRating, LEAGUE_AVERAGES.sofascoreRating, 'homeRating');
    awayTeam.sofascoreRating = applyFallback(awayTeam.sofascoreRating, LEAGUE_AVERAGES.sofascoreRating, 'awayRating');

    homeTeam.goalsPerMatch = applyFallback(homeTeam.goalsPerMatch, LEAGUE_AVERAGES.goalsPerMatch, 'homeGoalsPerMatch');
    awayTeam.goalsPerMatch = applyFallback(awayTeam.goalsPerMatch, LEAGUE_AVERAGES.goalsPerMatch, 'awayGoalsPerMatch');

    homeTeam.goalsConcededPerMatch = applyFallback(homeTeam.goalsConcededPerMatch, LEAGUE_AVERAGES.goalsConcededPerMatch, 'homeConcededPerMatch');
    awayTeam.goalsConcededPerMatch = applyFallback(awayTeam.goalsConcededPerMatch, LEAGUE_AVERAGES.goalsConcededPerMatch, 'awayConcededPerMatch');

    homeTeam.possession = applyFallback(homeTeam.possession, LEAGUE_AVERAGES.possession, 'homePossession');
    awayTeam.possession = applyFallback(awayTeam.possession, LEAGUE_AVERAGES.possession, 'awayPossession');

    homeTeam.shotsOnTargetPerMatch = applyFallback(homeTeam.shotsOnTargetPerMatch, LEAGUE_AVERAGES.shotsOnTargetPerMatch, 'homeShotsOnTarget');
    awayTeam.shotsOnTargetPerMatch = applyFallback(awayTeam.shotsOnTargetPerMatch, LEAGUE_AVERAGES.shotsOnTargetPerMatch, 'awayShotsOnTarget');

    // ========================================================================
    // VALIDATION DES DONNÉES PARSÉES
    // ========================================================================
    const validateTeamStats = (team: TeamStats, side: string): void => {
      // Vérifier goalsPerMatch
      if (team.goalsPerMatch < 0.3 || team.goalsPerMatch > 5.0) {
        console.error(`❌ [Parser] ${side} goalsPerMatch invalide: ${team.goalsPerMatch} (attendu 0.3-5.0)`);
        warnings.push(`${side}: goalsPerMatch invalide (${team.goalsPerMatch})`);
      }

      // Vérifier possession
      if (team.possession < 20 || team.possession > 80) {
        console.error(`❌ [Parser] ${side} possession invalide: ${team.possession}% (attendu 20-80%)`);
        warnings.push(`${side}: possession invalide (${team.possession}%)`);
      }

      // Vérifier rating
      if (team.sofascoreRating < 6.0 || team.sofascoreRating > 8.5) {
        console.error(`❌ [Parser] ${side} rating invalide: ${team.sofascoreRating} (attendu 6.0-8.5)`);
        warnings.push(`${side}: rating invalide (${team.sofascoreRating})`);
      }
    };

    validateTeamStats(homeTeam, 'Domicile');
    validateTeamStats(awayTeam, 'Extérieur');

    // Vérifier si trop de champs manquants (parser échoué)
    if (missingFields.length > 10) {
      console.error(`❌ [Parser] ÉCHEC MAJEUR: ${missingFields.length} champs manquants`);
      return {
        homeTeam,
        awayTeam,
        success: false,
        error: `Trop de champs manquants (${missingFields.length}/30)`,
        warnings,
        missingFields
      };
    }

    // Si quelques warnings, on accepte mais on signale
    if (warnings.length > 0) {
      console.warn(`⚠️ [Parser] Parsing réussi avec ${warnings.length} warnings`);
    }

    return {
      homeTeam,
      awayTeam,
      success: true,
      warnings: warnings.length > 0 ? warnings : undefined,
      missingFields: missingFields.length > 0 ? missingFields : undefined
    };

  } catch (error) {
    console.error('❌ [Parser] Exception critique:', error);
    return {
      homeTeam: {} as TeamStats,
      awayTeam: {} as TeamStats,
      success: false,
      error: error instanceof Error ? error.message : 'Erreur de parsing critique'
    };
  }
}
