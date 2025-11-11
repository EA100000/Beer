/**
 * IMPORTATEUR CSV MATCHES
 *
 * Parse le fichier Matches.csv (230,557 matchs) et convertit
 * en format RealMatch pour backtesting
 */

import { RealMatch } from './realMatchDatabase';

export interface CSVMatch {
  Division: string;
  MatchDate: string;
  MatchTime: string;
  HomeTeam: string;
  AwayTeam: string;
  HomeElo: number;
  AwayElo: number;
  Form3Home: number;
  Form5Home: number;
  Form3Away: number;
  Form5Away: number;
  FTHome: number;
  FTAway: number;
  FTResult: string;
  HTHome: number;
  HTAway: number;
  HTResult: string;
  HomeShots: number;
  AwayShots: number;
  HomeTarget: number;
  AwayTarget: number;
  HomeFouls: number;
  AwayFouls: number;
  HomeCorners: number;
  AwayCorners: number;
  HomeYellow: number;
  AwayYellow: number;
  HomeRed: number;
  AwayRed: number;
  OddHome: number;
  OddDraw: number;
  OddAway: number;
}

export interface ImportConfig {
  minYear?: number; // Année minimum (ex: 2015)
  maxYear?: number; // Année maximum (ex: 2024)
  leagues?: string[]; // Ligues à inclure (ex: ['F1', 'D1', 'E1'])
  requireCompleteData?: boolean; // Exiger toutes les stats
  maxMatches?: number; // Nombre maximum de matchs à importer
}

export interface ImportResult {
  totalProcessed: number;
  matchesImported: number;
  matchesRejected: number;
  matches: RealMatch[];
  errors: string[];
  warnings: string[];
}

/**
 * Parse une ligne CSV en objet CSVMatch
 */
function parseCSVLine(line: string): CSVMatch | null {
  const parts = line.split(',');

  if (parts.length < 48) return null;

  try {
    return {
      Division: parts[0],
      MatchDate: parts[1],
      MatchTime: parts[2],
      HomeTeam: parts[3],
      AwayTeam: parts[4],
      HomeElo: parseFloat(parts[5]) || 0,
      AwayElo: parseFloat(parts[6]) || 0,
      Form3Home: parseFloat(parts[7]) || 0,
      Form5Home: parseFloat(parts[8]) || 0,
      Form3Away: parseFloat(parts[9]) || 0,
      Form5Away: parseFloat(parts[10]) || 0,
      FTHome: parseFloat(parts[11]) || 0,
      FTAway: parseFloat(parts[12]) || 0,
      FTResult: parts[13],
      HTHome: parseFloat(parts[14]) || 0,
      HTAway: parseFloat(parts[15]) || 0,
      HTResult: parts[16],
      HomeShots: parseFloat(parts[17]) || 0,
      AwayShots: parseFloat(parts[18]) || 0,
      HomeTarget: parseFloat(parts[19]) || 0,
      AwayTarget: parseFloat(parts[20]) || 0,
      HomeFouls: parseFloat(parts[21]) || 0,
      AwayFouls: parseFloat(parts[22]) || 0,
      HomeCorners: parseFloat(parts[23]) || 0,
      AwayCorners: parseFloat(parts[24]) || 0,
      HomeYellow: parseFloat(parts[25]) || 0,
      AwayYellow: parseFloat(parts[26]) || 0,
      HomeRed: parseFloat(parts[27]) || 0,
      AwayRed: parseFloat(parts[28]) || 0,
      OddHome: parseFloat(parts[29]) || 0,
      OddDraw: parseFloat(parts[30]) || 0,
      OddAway: parseFloat(parts[31]) || 0,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Vérifie si un match a toutes les données requises
 */
function hasCompleteData(match: CSVMatch): boolean {
  // Données critiques absolues
  if (!match.HomeTeam || !match.AwayTeam) return false;
  if (!match.MatchDate) return false;
  if (match.FTHome === undefined || match.FTAway === undefined) return false;

  // Stats de match
  if (match.HomeCorners === 0 && match.AwayCorners === 0) return false;
  if (match.HomeFouls === 0 && match.AwayFouls === 0) return false;
  if (match.HomeYellow === 0 && match.AwayYellow === 0) return false;

  // Au moins quelques stats de tirs
  if (match.HomeTarget === 0 && match.AwayTarget === 0) return false;

  return true;
}

/**
 * Convertit CSVMatch en RealMatch
 */
function convertToRealMatch(csvMatch: CSVMatch, leagueMap: { [key: string]: string }): RealMatch {
  const matchId = `${csvMatch.Division}_${csvMatch.MatchDate.replace(/-/g, '')}_${csvMatch.HomeTeam.replace(/\s+/g, '')}_${csvMatch.AwayTeam.replace(/\s+/g, '')}`;

  // Calculer stats moyennes basées sur Elo et forme
  const homeRating = csvMatch.HomeElo ? Math.min(Math.max(csvMatch.HomeElo / 25, 60), 90) : 75;
  const awayRating = csvMatch.AwayElo ? Math.min(Math.max(csvMatch.AwayElo / 25, 60), 90) : 75;

  // Calculer possession estimée basée sur Elo
  const eloDiff = csvMatch.HomeElo - csvMatch.AwayElo;
  const homePossession = Math.min(Math.max(50 + (eloDiff / 40), 35), 65);
  const awayPossession = 100 - homePossession;

  // Stats par match basées sur forme récente (sur 5 matchs)
  const homeGoalsPerMatch = csvMatch.Form5Home ? csvMatch.Form5Home / 5 : 1.5;
  const awayGoalsPerMatch = csvMatch.Form5Away ? csvMatch.Form5Away / 5 : 1.5;

  // Estimer buts encaissés (inverse de la forme)
  const homeGoalsConcededPerMatch = csvMatch.Form5Away ? csvMatch.Form5Away / 5 : 1.2;
  const awayGoalsConcededPerMatch = csvMatch.Form5Home ? csvMatch.Form5Home / 5 : 1.2;

  const realMatch: RealMatch = {
    id: matchId,
    date: csvMatch.MatchDate,
    league: leagueMap[csvMatch.Division] || csvMatch.Division,
    homeTeam: {
      name: csvMatch.HomeTeam,
      stats: {
        goalsPerMatch: homeGoalsPerMatch,
        goalsConcededPerMatch: homeGoalsConcededPerMatch,
        possession: homePossession,
        shotsOnTargetPerMatch: csvMatch.HomeTarget || 5,
        cornersPerMatch: csvMatch.HomeCorners || 5,
        foulsPerMatch: csvMatch.HomeFouls || 11,
        yellowCardsPerMatch: csvMatch.HomeYellow || 2,
        sofascoreRating: homeRating / 10, // Convert to 0-10 scale
      },
    },
    awayTeam: {
      name: csvMatch.AwayTeam,
      stats: {
        goalsPerMatch: awayGoalsPerMatch,
        goalsConcededPerMatch: awayGoalsConcededPerMatch,
        possession: awayPossession,
        shotsOnTargetPerMatch: csvMatch.AwayTarget || 4.5,
        cornersPerMatch: csvMatch.AwayCorners || 4.5,
        foulsPerMatch: csvMatch.AwayFouls || 11,
        yellowCardsPerMatch: csvMatch.AwayYellow || 2,
        sofascoreRating: awayRating / 10,
      },
    },
    actualResult: {
      homeGoals: csvMatch.FTHome,
      awayGoals: csvMatch.FTAway,
      totalCorners: csvMatch.HomeCorners + csvMatch.AwayCorners,
      totalFouls: csvMatch.HomeFouls + csvMatch.AwayFouls,
      totalYellowCards: csvMatch.HomeYellow + csvMatch.AwayYellow,
      homeWin: csvMatch.FTResult === 'H',
      draw: csvMatch.FTResult === 'D',
      awayWin: csvMatch.FTResult === 'A',
      over25: (csvMatch.FTHome + csvMatch.FTAway) > 2.5,
      under25: (csvMatch.FTHome + csvMatch.FTAway) <= 2.5,
      bttsYes: csvMatch.FTHome > 0 && csvMatch.FTAway > 0,
      bttsNo: csvMatch.FTHome === 0 || csvMatch.FTAway === 0,
    },
  };

  return realMatch;
}

/**
 * Importe les matchs depuis le CSV
 */
export async function importMatchesFromCSV(
  csvContent: string,
  config: ImportConfig = {}
): Promise<ImportResult> {
  const {
    minYear = 2015,
    maxYear = 2024,
    leagues = ['F1', 'D1', 'E1', 'I1', 'SP1'], // Top 5 ligues
    requireCompleteData = true,
    maxMatches = 5000,
  } = config;

  const leagueMap: { [key: string]: string } = {
    F1: 'Ligue 1',
    D1: 'Bundesliga',
    E1: 'Premier League',
    I1: 'Serie A',
    SP1: 'La Liga',
    F2: 'Ligue 2',
    D2: 'Bundesliga 2',
    E2: 'Championship',
    I2: 'Serie B',
    SP2: 'La Liga 2',
  };

  const result: ImportResult = {
    totalProcessed: 0,
    matchesImported: 0,
    matchesRejected: 0,
    matches: [],
    errors: [],
    warnings: [],
  };

  const lines = csvContent.split('\n');

  // Skip header
  for (let i = 1; i < lines.length && result.matchesImported < maxMatches; i++) {
    result.totalProcessed++;

    const line = lines[i].trim();
    if (!line) continue;

    try {
      const csvMatch = parseCSVLine(line);

      if (!csvMatch) {
        result.matchesRejected++;
        continue;
      }

      // Filtrer par ligue
      if (leagues.length > 0 && !leagues.includes(csvMatch.Division)) {
        result.matchesRejected++;
        continue;
      }

      // Filtrer par année
      if (csvMatch.MatchDate) {
        const year = parseInt(csvMatch.MatchDate.split('-')[0]);
        if (year < minYear || year > maxYear) {
          result.matchesRejected++;
          continue;
        }
      }

      // Vérifier données complètes
      if (requireCompleteData && !hasCompleteData(csvMatch)) {
        result.matchesRejected++;
        continue;
      }

      // Convertir en RealMatch
      const realMatch = convertToRealMatch(csvMatch, leagueMap);
      result.matches.push(realMatch);
      result.matchesImported++;

    } catch (error) {
      result.errors.push(`Ligne ${i}: ${error}`);
      result.matchesRejected++;
    }

    // Afficher progression tous les 1000 matchs
    if (result.totalProcessed % 1000 === 0) {
      console.log(`Traité: ${result.totalProcessed}, Importé: ${result.matchesImported}, Rejeté: ${result.matchesRejected}`);
    }
  }

  // Ajouter warnings si nécessaire
  if (result.matchesImported === 0) {
    result.warnings.push('Aucun match importé - vérifiez les critères de filtrage');
  } else if (result.matchesImported < 50) {
    result.warnings.push(`Seulement ${result.matchesImported} matchs importés - échantillon très petit`);
  }

  return result;
}

/**
 * Lire et importer depuis fichier
 */
export async function importMatchesFromFile(filePath: string, config?: ImportConfig): Promise<ImportResult> {
  try {
    const fs = await import('fs');
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    return importMatchesFromCSV(csvContent, config);
  } catch (error) {
    return {
      totalProcessed: 0,
      matchesImported: 0,
      matchesRejected: 0,
      matches: [],
      errors: [`Erreur lecture fichier: ${error}`],
      warnings: [],
    };
  }
}

/**
 * Preview rapide du CSV
 */
export function previewCSV(csvContent: string, lines: number = 10): CSVMatch[] {
  const preview: CSVMatch[] = [];
  const allLines = csvContent.split('\n');

  for (let i = 1; i < Math.min(lines + 1, allLines.length); i++) {
    const match = parseCSVLine(allLines[i]);
    if (match) preview.push(match);
  }

  return preview;
}

/**
 * Analyser le CSV et retourner des stats
 */
export function analyzeCSV(csvContent: string): {
  totalMatches: number;
  byLeague: { [key: string]: number };
  byYear: { [key: number]: number };
  completeDataCount: number;
  dateRange: { min: string; max: string };
} {
  const stats = {
    totalMatches: 0,
    byLeague: {} as { [key: string]: number },
    byYear: {} as { [key: number]: number },
    completeDataCount: 0,
    dateRange: { min: '9999-99-99', max: '0000-00-00' },
  };

  const lines = csvContent.split('\n');

  for (let i = 1; i < lines.length; i++) {
    const match = parseCSVLine(lines[i]);
    if (!match) continue;

    stats.totalMatches++;

    // Par ligue
    stats.byLeague[match.Division] = (stats.byLeague[match.Division] || 0) + 1;

    // Par année
    if (match.MatchDate) {
      const year = parseInt(match.MatchDate.split('-')[0]);
      if (!isNaN(year)) {
        stats.byYear[year] = (stats.byYear[year] || 0) + 1;

        // Date range
        if (match.MatchDate < stats.dateRange.min) stats.dateRange.min = match.MatchDate;
        if (match.MatchDate > stats.dateRange.max) stats.dateRange.max = match.MatchDate;
      }
    }

    // Données complètes
    if (hasCompleteData(match)) {
      stats.completeDataCount++;
    }
  }

  return stats;
}
