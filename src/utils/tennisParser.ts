/**
 * Parser automatique pour données tennis collées
 * Extrait les statistiques depuis le format texte brut
 */

export interface ParsedTennisData {
  player1: {
    age?: number;
    height?: number;
    matches_won?: string;
    win_percentage?: number;
    tournaments_won?: string;
    first_serve_percentage?: number;
    first_serve_points_won?: number;
    second_serve_percentage?: number;
    second_serve_points_won?: number;
    aces_per_match?: number;
    double_faults_per_match?: number;
    break_points_saved?: number;
    break_points_saved_percentage?: number;
    break_points_converted?: number;
    break_points_converted_percentage?: number;
    tiebreaks_won?: number;
    tiebreaks_won_percentage?: number;
  };
  player2: {
    age?: number;
    height?: number;
    matches_won?: string;
    win_percentage?: number;
    tournaments_won?: string;
    first_serve_percentage?: number;
    first_serve_points_won?: number;
    second_serve_percentage?: number;
    second_serve_points_won?: number;
    aces_per_match?: number;
    double_faults_per_match?: number;
    break_points_saved?: number;
    break_points_saved_percentage?: number;
    break_points_converted?: number;
    break_points_converted_percentage?: number;
    tiebreaks_won?: number;
    tiebreaks_won_percentage?: number;
  };
}

/**
 * Parse les données tennis collées depuis SofaScore ou autre source
 * Format: chaque stat sur une ligne, valeurs sur lignes séparées
 */
export function parseTennisData(rawText: string): ParsedTennisData | null {
  try {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const result: ParsedTennisData = {
      player1: {},
      player2: {}
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
      const nextNextLine = i + 2 < lines.length ? lines[i + 2] : '';

      // Âge - format: "28 ans" puis "33 ans" sur lignes séparées
      if (line.toLowerCase().includes('âge') || line.toLowerCase() === 'age') {
        const age1Match = nextLine.match(/(\d+)/);
        const age2Match = nextNextLine.match(/(\d+)/);
        if (age1Match) result.player1.age = parseInt(age1Match[1]);
        if (age2Match) result.player2.age = parseInt(age2Match[1]);
      }

      // Matchs gagnés - format: "20/47 (43%)" puis "16/37 (43%)"
      if (line.toLowerCase().includes('matchs gagnés') || line.toLowerCase().includes('matches won')) {
        const match1 = nextLine.match(/(\d+)\/(\d+)\s*\((\d+)%\)/);
        const match2 = nextNextLine.match(/(\d+)\/(\d+)\s*\((\d+)%\)/);
        if (match1) {
          result.player1.matches_won = `${match1[1]}/${match1[2]}`;
          result.player1.win_percentage = parseInt(match1[3]);
        }
        if (match2) {
          result.player2.matches_won = `${match2[1]}/${match2[2]}`;
          result.player2.win_percentage = parseInt(match2[3]);
        }
      }

      // 1er service - format: "65%" puis "56.5%"
      if ((line === '1er service' || line.toLowerCase().includes('1st serve')) &&
          !line.toLowerCase().includes('points')) {
        const pct1 = nextLine.match(/(\d+\.?\d*)%/);
        const pct2 = nextNextLine.match(/(\d+\.?\d*)%/);
        if (pct1) result.player1.first_serve_percentage = parseFloat(pct1[1]);
        if (pct2) result.player2.first_serve_percentage = parseFloat(pct2[1]);
      }

      // Points gagnés sur 1er service
      if (line.toLowerCase().includes('points gagnés sur 1er service') ||
          line.toLowerCase().includes('1st serve points won')) {
        const pct1 = nextLine.match(/(\d+\.?\d*)%/);
        const pct2 = nextNextLine.match(/(\d+\.?\d*)%/);
        if (pct1) result.player1.first_serve_points_won = parseFloat(pct1[1]);
        if (pct2) result.player2.first_serve_points_won = parseFloat(pct2[1]);
      }

      // 2e service
      if ((line === '2e service' || line.toLowerCase().includes('2nd serve')) &&
          !line.toLowerCase().includes('points')) {
        const pct1 = nextLine.match(/(\d+\.?\d*)%/);
        const pct2 = nextNextLine.match(/(\d+\.?\d*)%/);
        if (pct1) result.player1.second_serve_percentage = parseFloat(pct1[1]);
        if (pct2) result.player2.second_serve_percentage = parseFloat(pct2[1]);
      }

      // Points gagnés sur 2e service
      if (line.toLowerCase().includes('points gagnés sur 2e service') ||
          line.toLowerCase().includes('2nd serve points won')) {
        const pct1 = nextLine.match(/(\d+\.?\d*)%/);
        const pct2 = nextNextLine.match(/(\d+\.?\d*)%/);
        if (pct1) result.player1.second_serve_points_won = parseFloat(pct1[1]);
        if (pct2) result.player2.second_serve_points_won = parseFloat(pct2[1]);
      }

      // Aces par match
      if (line.toLowerCase().includes('aces par match') ||
          line.toLowerCase().includes('aces per match')) {
        const aces1 = parseFloat(nextLine);
        const aces2 = parseFloat(nextNextLine);
        if (!isNaN(aces1)) result.player1.aces_per_match = aces1;
        if (!isNaN(aces2)) result.player2.aces_per_match = aces2;
      }

      // Doubles fautes par match
      if (line.toLowerCase().includes('doubles fautes') ||
          line.toLowerCase().includes('double faults')) {
        const df1 = parseFloat(nextLine);
        const df2 = parseFloat(nextNextLine);
        if (!isNaN(df1)) result.player1.double_faults_per_match = df1;
        if (!isNaN(df2)) result.player2.double_faults_per_match = df2;
      }

      // Balles de break sauvées
      if (line.toLowerCase().includes('balles de break sauvées') ||
          line.toLowerCase().includes('break points saved')) {
        const bp1 = nextLine.match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);
        const bp2 = nextNextLine.match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);
        if (bp1) {
          result.player1.break_points_saved = parseInt(bp1[1]);
          result.player1.break_points_saved_percentage = parseFloat(bp1[3]);
        }
        if (bp2) {
          result.player2.break_points_saved = parseInt(bp2[1]);
          result.player2.break_points_saved_percentage = parseFloat(bp2[3]);
        }
      }

      // Balles de break converties
      if (line.toLowerCase().includes('balles de break converties') ||
          line.toLowerCase().includes('break points converted')) {
        const bp1 = nextLine.match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);
        const bp2 = nextNextLine.match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);
        if (bp1) {
          result.player1.break_points_converted = parseInt(bp1[1]);
          result.player1.break_points_converted_percentage = parseFloat(bp1[3]);
        }
        if (bp2) {
          result.player2.break_points_converted = parseInt(bp2[1]);
          result.player2.break_points_converted_percentage = parseFloat(bp2[3]);
        }
      }

      // Jeux décisifs gagnés
      if (line.toLowerCase().includes('jeux décisifs') ||
          line.toLowerCase().includes('tie') ||
          line.toLowerCase().includes('tiebreak')) {
        const tb1 = nextLine.match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);
        const tb2 = nextNextLine.match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);
        if (tb1) {
          result.player1.tiebreaks_won = parseInt(tb1[1]);
          result.player1.tiebreaks_won_percentage = parseFloat(tb1[3]);
        }
        if (tb2) {
          result.player2.tiebreaks_won = parseInt(tb2[1]);
          result.player2.tiebreaks_won_percentage = parseFloat(tb2[3]);
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Erreur lors du parsing des données tennis:', error);
    return null;
  }
}

/**
 * Génère un résumé textuel des données parsées
 */
export function generateTennisDataSummary(data: ParsedTennisData): string {
  const p1 = data.player1;
  const p2 = data.player2;

  let summary = '📊 DONNÉES EXTRAITES\n\n';

  summary += '👤 JOUEUR 1:\n';
  if (p1.age) summary += `- Âge: ${p1.age} ans\n`;
  if (p1.matches_won) summary += `- Matchs gagnés: ${p1.matches_won}\n`;
  if (p1.first_serve_points_won) summary += `- 1er service gagné: ${p1.first_serve_points_won}%\n`;
  if (p1.aces_per_match) summary += `- Aces/match: ${p1.aces_per_match}\n`;
  if (p1.break_points_saved_percentage) summary += `- Breaks sauvés: ${p1.break_points_saved_percentage}%\n`;
  if (p1.tiebreaks_won_percentage) summary += `- Jeux décisifs: ${p1.tiebreaks_won_percentage}%\n`;

  summary += '\n👤 JOUEUR 2:\n';
  if (p2.age) summary += `- Âge: ${p2.age} ans\n`;
  if (p2.matches_won) summary += `- Matchs gagnés: ${p2.matches_won}\n`;
  if (p2.first_serve_points_won) summary += `- 1er service gagné: ${p2.first_serve_points_won}%\n`;
  if (p2.aces_per_match) summary += `- Aces/match: ${p2.aces_per_match}\n`;
  if (p2.break_points_saved_percentage) summary += `- Breaks sauvés: ${p2.break_points_saved_percentage}%\n`;
  if (p2.tiebreaks_won_percentage) summary += `- Jeux décisifs: ${p2.tiebreaks_won_percentage}%\n`;

  return summary;
}

/**
 * Valide que les données parsées sont complètes
 */
export function validateParsedData(data: ParsedTennisData): {
  isValid: boolean;
  missingFields: string[];
  completenessScore: number;
} {
  const requiredFields = [
    'first_serve_points_won',
    'aces_per_match',
    'double_faults_per_match',
    'break_points_saved_percentage'
  ];

  const missingFields: string[] = [];
  let totalFields = 0;
  let presentFields = 0;

  for (const field of requiredFields) {
    totalFields += 2; // Player 1 + Player 2

    if (!(field in data.player1) || data.player1[field as keyof typeof data.player1] === undefined) {
      missingFields.push(`Player 1 - ${field}`);
    } else {
      presentFields++;
    }

    if (!(field in data.player2) || data.player2[field as keyof typeof data.player2] === undefined) {
      missingFields.push(`Player 2 - ${field}`);
    } else {
      presentFields++;
    }
  }

  const completenessScore = Math.round((presentFields / totalFields) * 100);

  return {
    isValid: missingFields.length === 0,
    missingFields,
    completenessScore
  };
}
