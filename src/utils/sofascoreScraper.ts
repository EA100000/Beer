/**
 * SofaScore Scraper - Récupération automatique des statistiques d'équipes
 * Utilise l'API Claude WebFetch pour extraire les données
 */

import { TeamStats } from '@/types/football';

export interface SofaScoreTeamData {
  name: string;
  rating: number;
  matchesPlayed: number;
  goalsScored: number;
  goalsConceded: number;
  goalsPerMatch: number;
  possession: number;
  accuratePasses: number;
  passAccuracy: number;
  shotsOnTarget: number;
  bigChances: number;
  bigChancesMissed: number;
  cleanSheets: number;
  interceptions: number;
  tackles: number;
  clearances: number;
  yellowCards: number;
  redCards: number;
  fouls: number;
  offsides: number;
  corners: number;
}

export interface SofaScoreComparisonResult {
  homeTeam: SofaScoreTeamData;
  awayTeam: SofaScoreTeamData;
  success: boolean;
  error?: string;
}

/**
 * Parse une URL de comparaison SofaScore pour extraire les team IDs
 */
export function parseSofaScoreURL(url: string): { teamIds: string[], seasonIds: string[], tournamentIds: string[] } | null {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    const ids = params.get('ids')?.split(',') || [];
    const s_ids = params.get('s_ids')?.split(',') || [];
    const ut_ids = params.get('ut_ids')?.split(',') || [];

    if (ids.length !== 2) {
      return null;
    }

    return {
      teamIds: ids,
      seasonIds: s_ids,
      tournamentIds: ut_ids
    };
  } catch (e) {
    return null;
  }
}

/**
 * Convertit les données SofaScore en format TeamStats de l'application
 */
export function convertToTeamStats(data: SofaScoreTeamData): TeamStats {
  return {
    // Informations de base
    name: data.name,
    sofascoreRating: data.rating,
    matches: data.matchesPlayed,

    // Buts
    goalsScored: data.goalsScored,
    goalsConceded: data.goalsConceded,
    goalsPerMatch: data.goalsPerMatch,
    goalsConcededPerMatch: data.matchesPlayed > 0 ? data.goalsConceded / data.matchesPlayed : 0,

    // Passes et possession
    possession: data.possession,
    accuracyPerMatch: data.passAccuracy,
    assists: Math.floor(data.goalsScored * 0.6), // Estimation: ~60% des buts ont une passe décisive
    longBallsAccuratePerMatch: 0, // Pas disponible

    // Tirs
    shotsOnTargetPerMatch: data.shotsOnTarget,

    // Occasions
    bigChancesPerMatch: data.bigChances,
    bigChancesMissedPerMatch: data.bigChancesMissed,

    // Défense
    cleanSheets: data.cleanSheets,
    interceptionsPerMatch: data.interceptions,
    tacklesPerMatch: data.tackles,
    clearancesPerMatch: data.clearances,

    // Discipline
    yellowCardsPerMatch: data.yellowCards,
    redCardsPerMatch: data.matchesPlayed > 0 ? data.redCards / data.matchesPlayed : 0,
    penaltyConceded: 0, // Pas disponible

    // Autres
    throwInsPerMatch: 0, // Pas disponible dans SofaScore
    offsidesPerMatch: data.offsides,
    duelsWonPerMatch: 0, // Pas disponible
    goalKicksPerMatch: 0, // Pas disponible
  };
}

/**
 * Parse les données HTML/texte extraites par WebFetch
 * Cette fonction analyse le texte retourné et extrait les statistiques
 */
export function parseWebFetchResponse(text: string): SofaScoreComparisonResult {
  const lines = text.split('\n');

  const result: SofaScoreComparisonResult = {
    homeTeam: {} as SofaScoreTeamData,
    awayTeam: {} as SofaScoreTeamData,
    success: false
  };

  try {
    // Extraire les noms des équipes
    const teamNamesLine = lines.find(l => l.includes('Team Comparison Statistics:'));
    if (teamNamesLine) {
      const match = teamNamesLine.match(/Statistics:\s*(.+?)\s+vs\s+(.+)/);
      if (match) {
        result.homeTeam.name = match[1].trim();
        result.awayTeam.name = match[2].trim();
      }
    }

    // Parser les tableaux de statistiques
    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Identifier la section
      if (line.startsWith('## ')) {
        currentSection = line.replace('## ', '');
        continue;
      }

      // Parser les lignes de données (format: | Metric | Team1 | Team2 |)
      if (line.startsWith('|') && !line.includes('Metric') && !line.includes('---')) {
        const parts = line.split('|').map(p => p.trim()).filter(p => p);
        if (parts.length >= 3) {
          const metric = parts[0];
          const value1 = parts[1];
          const value2 = parts[2];

          // Extraire les valeurs numériques
          const parseValue = (val: string): number => {
            const num = parseFloat(val.replace(/[^0-9.]/g, ''));
            return isNaN(num) ? 0 : num;
          };

          // Mapper les métriques aux propriétés
          switch (metric) {
            case 'Average Sofascore Rating':
              result.homeTeam.rating = parseValue(value1);
              result.awayTeam.rating = parseValue(value2);
              break;
            case 'Matches Played':
              result.homeTeam.matchesPlayed = parseValue(value1);
              result.awayTeam.matchesPlayed = parseValue(value2);
              break;
            case 'Goals Scored':
              result.homeTeam.goalsScored = parseValue(value1);
              result.awayTeam.goalsScored = parseValue(value2);
              break;
            case 'Goals Conceded':
              result.homeTeam.goalsConceded = parseValue(value1);
              result.awayTeam.goalsConceded = parseValue(value2);
              break;
            case 'Goals per Match':
              result.homeTeam.goalsPerMatch = parseValue(value1);
              result.awayTeam.goalsPerMatch = parseValue(value2);
              break;
            case 'Possession %':
              result.homeTeam.possession = parseValue(value1);
              result.awayTeam.possession = parseValue(value2);
              break;
            case 'Accurate Passes/Match':
              const passes1 = value1.match(/([0-9.]+)\s*\(([0-9.]+)%\)/);
              const passes2 = value2.match(/([0-9.]+)\s*\(([0-9.]+)%\)/);
              if (passes1) {
                result.homeTeam.accuratePasses = parseFloat(passes1[1]);
                result.homeTeam.passAccuracy = parseFloat(passes1[2]);
              }
              if (passes2) {
                result.awayTeam.accuratePasses = parseFloat(passes2[1]);
                result.awayTeam.passAccuracy = parseFloat(passes2[2]);
              }
              break;
            case 'Shots on Target/Match':
              result.homeTeam.shotsOnTarget = parseValue(value1);
              result.awayTeam.shotsOnTarget = parseValue(value2);
              break;
            case 'Big Chances/Match':
              result.homeTeam.bigChances = parseValue(value1);
              result.awayTeam.bigChances = parseValue(value2);
              break;
            case 'Big Chances Missed/Match':
              result.homeTeam.bigChancesMissed = parseValue(value1);
              result.awayTeam.bigChancesMissed = parseValue(value2);
              break;
            case 'Clean Sheets':
              result.homeTeam.cleanSheets = parseValue(value1);
              result.awayTeam.cleanSheets = parseValue(value2);
              break;
            case 'Interceptions/Match':
              result.homeTeam.interceptions = parseValue(value1);
              result.awayTeam.interceptions = parseValue(value2);
              break;
            case 'Tackles/Match':
              result.homeTeam.tackles = parseValue(value1);
              result.awayTeam.tackles = parseValue(value2);
              break;
            case 'Clearances/Match':
              result.homeTeam.clearances = parseValue(value1);
              result.awayTeam.clearances = parseValue(value2);
              break;
            case 'Yellow Cards/Match':
              result.homeTeam.yellowCards = parseValue(value1);
              result.awayTeam.yellowCards = parseValue(value2);
              break;
            case 'Red Cards':
              result.homeTeam.redCards = parseValue(value1);
              result.awayTeam.redCards = parseValue(value2);
              break;
            case 'Fouls/Match':
              result.homeTeam.fouls = parseValue(value1);
              result.awayTeam.fouls = parseValue(value2);
              break;
            case 'Offsides/Match':
              result.homeTeam.offsides = parseValue(value1);
              result.awayTeam.offsides = parseValue(value2);
              break;
            case 'Corners/Match':
              result.homeTeam.corners = parseValue(value1);
              result.awayTeam.corners = parseValue(value2);
              break;
          }
        }
      }
    }

    // Vérifier que nous avons bien récupéré des données
    if (result.homeTeam.name && result.awayTeam.name && result.homeTeam.rating > 0) {
      result.success = true;
    } else {
      result.error = "Impossible d'extraire les données complètes";
    }

  } catch (e) {
    result.success = false;
    result.error = e instanceof Error ? e.message : "Erreur de parsing";
  }

  return result;
}

/**
 * Fonction principale pour récupérer les stats depuis SofaScore
 * Cette fonction doit être appelée côté serveur/backend car elle utilise WebFetch
 */
export async function fetchSofaScoreStats(url: string): Promise<{
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  success: boolean;
  error?: string;
}> {
  try {
    // Validation de l'URL
    const parsed = parseSofaScoreURL(url);
    if (!parsed) {
      return {
        homeTeam: {} as TeamStats,
        awayTeam: {} as TeamStats,
        success: false,
        error: "URL SofaScore invalide"
      };
    }

    // Note: Dans un vrai environnement, il faudrait faire un appel API backend
    // Pour l'instant, cette fonction retourne une structure de données
    // L'appel WebFetch doit être fait depuis le backend

    return {
      homeTeam: {} as TeamStats,
      awayTeam: {} as TeamStats,
      success: false,
      error: "Cette fonction doit être appelée depuis un endpoint backend avec WebFetch"
    };

  } catch (e) {
    return {
      homeTeam: {} as TeamStats,
      awayTeam: {} as TeamStats,
      success: false,
      error: e instanceof Error ? e.message : "Erreur inconnue"
    };
  }
}

/**
 * Fonction utilitaire pour tester si une URL est valide SofaScore
 */
export function isValidSofaScoreURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('sofascore.com') &&
           url.includes('/team/compare') &&
           url.includes('ids=');
  } catch {
    return false;
  }
}
