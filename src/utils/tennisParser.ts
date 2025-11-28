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
 */
export function parseTennisData(rawText: string): ParsedTennisData | null {
  try {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const result: ParsedTennisData = {
      player1: {},
      player2: {}
    };

    // Helper pour extraire 2 valeurs d'une ligne
    const extractTwoValues = (line: string): [string, string] | null => {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        return [parts[0], parts[1]];
      }
      return null;
    };

    // Helper pour extraire un nombre avec %
    const extractPercentage = (text: string): number | undefined => {
      const match = text.match(/(\d+\.?\d*)%/);
      return match ? parseFloat(match[1]) : undefined;
    };

    // Helper pour extraire fraction et pourcentage
    const extractFractionAndPercentage = (text: string): { count: number; total: number; percentage: number } | null => {
      // Format: "207/359 (57.7%)" ou "20/47 (43%)"
      const match = text.match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);
      if (match) {
        return {
          count: parseInt(match[1]),
          total: parseInt(match[2]),
          percentage: parseFloat(match[3])
        };
      }
      return null;
    };

    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = i + 1 < lines.length ? lines[i + 1] : '';

      // Détection des sections
      if (line.toLowerCase().includes('général') || line.toLowerCase().includes('general')) {
        currentSection = 'general';
        continue;
      }
      if (line.toLowerCase().includes('performance')) {
        currentSection = 'performance';
        continue;
      }
      if (line.toLowerCase().includes('service')) {
        currentSection = 'service';
        continue;
      }
      if (line.toLowerCase().includes('pression') || line.toLowerCase().includes('métriques')) {
        currentSection = 'pressure';
        continue;
      }

      // Extraction selon la section
      if (currentSection === 'general') {
        if (line.toLowerCase().includes('âge') || line.toLowerCase().includes('age')) {
          const values = extractTwoValues(nextLine);
          if (values) {
            result.player1.age = parseInt(values[0]);
            result.player2.age = parseInt(values[1]);
          }
        }
        if (line.toLowerCase().includes('taille') || line.toLowerCase().includes('height')) {
          const values = extractTwoValues(nextLine);
          if (values) {
            result.player1.height = parseFloat(values[0]);
            result.player2.height = parseFloat(values[1]);
          }
        }
      }

      if (currentSection === 'performance') {
        if (line.toLowerCase().includes('matchs gagnés') || line.toLowerCase().includes('matches won')) {
          const values = extractTwoValues(nextLine);
          if (values) {
            result.player1.matches_won = values[0];
            result.player2.matches_won = values[1];

            // Extraire pourcentage
            const p1Pct = extractPercentage(values[0]);
            const p2Pct = extractPercentage(values[1]);
            if (p1Pct) result.player1.win_percentage = p1Pct;
            if (p2Pct) result.player2.win_percentage = p2Pct;
          }
        }
        if (line.toLowerCase().includes('tournois remportés') || line.toLowerCase().includes('tournaments won')) {
          const values = extractTwoValues(nextLine);
          if (values) {
            result.player1.tournaments_won = values[0];
            result.player2.tournaments_won = values[1];
          }
        }
      }

      if (currentSection === 'service') {
        if (line === '1er service' || line.toLowerCase().includes('1er service')) {
          const values = extractTwoValues(nextLine);
          if (values) {
            const p1 = extractPercentage(values[0]);
            const p2 = extractPercentage(values[1]);
            if (p1) result.player1.first_serve_percentage = p1;
            if (p2) result.player2.first_serve_percentage = p2;
          }
        }
        if (line.toLowerCase().includes('points gagnés sur 1er service') ||
            line.toLowerCase().includes('points won on 1st serve')) {
          const values = extractTwoValues(nextLine);
          if (values) {
            const p1 = extractPercentage(values[0]);
            const p2 = extractPercentage(values[1]);
            if (p1) result.player1.first_serve_points_won = p1;
            if (p2) result.player2.first_serve_points_won = p2;
          }
        }
        if (line === '2e service' || line.toLowerCase().includes('2e service')) {
          const values = extractTwoValues(nextLine);
          if (values) {
            const p1 = extractPercentage(values[0]);
            const p2 = extractPercentage(values[1]);
            if (p1) result.player1.second_serve_percentage = p1;
            if (p2) result.player2.second_serve_percentage = p2;
          }
        }
        if (line.toLowerCase().includes('points gagnés sur 2e service') ||
            line.toLowerCase().includes('points won on 2nd serve')) {
          const values = extractTwoValues(nextLine);
          if (values) {
            const p1 = extractPercentage(values[0]);
            const p2 = extractPercentage(values[1]);
            if (p1) result.player1.second_serve_points_won = p1;
            if (p2) result.player2.second_serve_points_won = p2;
          }
        }
        if (line.toLowerCase().includes('aces par match') ||
            line.toLowerCase().includes('aces per match')) {
          const values = extractTwoValues(nextLine);
          if (values) {
            result.player1.aces_per_match = parseFloat(values[0]);
            result.player2.aces_per_match = parseFloat(values[1]);
          }
        }
        if (line.toLowerCase().includes('doubles fautes par match') ||
            line.toLowerCase().includes('double faults per match')) {
          const values = extractTwoValues(nextLine);
          if (values) {
            result.player1.double_faults_per_match = parseFloat(values[0]);
            result.player2.double_faults_per_match = parseFloat(values[1]);
          }
        }
      }

      if (currentSection === 'pressure') {
        if (line.toLowerCase().includes('balles de break sauvées') ||
            line.toLowerCase().includes('break points saved')) {
          const values = extractTwoValues(nextLine);
          if (values) {
            const p1Data = extractFractionAndPercentage(values[0]);
            const p2Data = extractFractionAndPercentage(values[1]);

            if (p1Data) {
              result.player1.break_points_saved = p1Data.count;
              result.player1.break_points_saved_percentage = p1Data.percentage;
            }
            if (p2Data) {
              result.player2.break_points_saved = p2Data.count;
              result.player2.break_points_saved_percentage = p2Data.percentage;
            }
          }
        }
        if (line.toLowerCase().includes('balles de break converties') ||
            line.toLowerCase().includes('break points converted')) {
          const values = extractTwoValues(nextLine);
          if (values) {
            const p1Data = extractFractionAndPercentage(values[0]);
            const p2Data = extractFractionAndPercentage(values[1]);

            if (p1Data) {
              result.player1.break_points_converted = p1Data.count;
              result.player1.break_points_converted_percentage = p1Data.percentage;
            }
            if (p2Data) {
              result.player2.break_points_converted = p2Data.count;
              result.player2.break_points_converted_percentage = p2Data.percentage;
            }
          }
        }
        if (line.toLowerCase().includes('jeux décisifs gagnés') ||
            line.toLowerCase().includes('tie breaks won') ||
            line.toLowerCase().includes('tiebreaks won')) {
          const values = extractTwoValues(nextLine);
          if (values) {
            const p1Data = extractFractionAndPercentage(values[0]);
            const p2Data = extractFractionAndPercentage(values[1]);

            if (p1Data) {
              result.player1.tiebreaks_won = p1Data.count;
              result.player1.tiebreaks_won_percentage = p1Data.percentage;
            }
            if (p2Data) {
              result.player2.tiebreaks_won = p2Data.count;
              result.player2.tiebreaks_won_percentage = p2Data.percentage;
            }
          }
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
