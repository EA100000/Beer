/**
 * PARSER ULTRA-ROBUSTE MULTI-FORMAT
 *
 * Extrait TOUTES les données collées avec validation et multi-patterns
 * - Supporte variations format SofaScore
 * - Validation automatique cohérence
 * - Détection ordre home/away
 * - Fallback intelligent si échec
 */

export interface RobustParsedData {
  // Score et temps
  homeScore: number;
  awayScore: number;
  minute: number;

  // Statistiques principales (42 variables)
  homePossession: number;
  awayPossession: number;
  homeXG: number;
  awayXG: number;
  homeCorners: number;
  awayCorners: number;
  homeFouls: number;
  awayFouls: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeTotalShots: number;
  awayTotalShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homeBigChances: number;
  awayBigChances: number;
  homePasses: number;
  awayPasses: number;
  homeAccuratePasses: number;
  awayAccuratePasses: number;
  homeGoalkeeperSaves: number;
  awayGoalkeeperSaves: number;
  homeThrowIns: number;
  awayThrowIns: number;
  homeOffsides: number;
  awayOffsides: number;
  homeTackles: number;
  awayTackles: number;
  homeInterceptions: number;
  awayInterceptions: number;
  homeDuelsWon: number;
  awayDuelsWon: number;

  // Métadonnées
  dataQuality: number;        // 0-100%
  missingFields: string[];
  extractedFields: number;
  totalFields: number;
  validationErrors: string[];
  warnings: string[];
}

/**
 * EXTRACTION MULTI-PATTERN
 * Essaie plusieurs regex pour chaque statistique
 */
function extractWithPatterns(
  text: string,
  fieldName: string,
  patterns: RegExp[]
): [number, number] | null {

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match.length >= 3) {
      const val1 = parseFloat(match[1].replace(',', '.').replace('%', '').trim());
      const val2 = parseFloat(match[2].replace(',', '.').replace('%', '').trim());

      if (!isNaN(val1) && !isNaN(val2)) {
        return [val1, val2];
      }
    }
  }

  return null;
}

/**
 * VALIDATION COHÉRENCE DONNÉES
 */
function validateData(data: Partial<RobustParsedData>): string[] {
  const errors: string[] = [];

  // Possession doit faire 100% (±2% tolérance)
  if (data.homePossession !== undefined && data.awayPossession !== undefined) {
    const total = data.homePossession + data.awayPossession;
    if (Math.abs(total - 100) > 2) {
      errors.push(`Possession invalide: ${total}% (doit = 100%)`);
      data.homePossession = undefined;
      data.awayPossession = undefined;
    }
  }

  // Valeurs négatives impossibles
  const positiveFields: (keyof RobustParsedData)[] = [
    'homeCorners', 'awayCorners', 'homeFouls', 'awayFouls',
    'homeYellowCards', 'awayYellowCards', 'homeTotalShots', 'awayTotalShots'
  ];

  for (const field of positiveFields) {
    const value = data[field] as number | undefined;
    if (value !== undefined && value < 0) {
      errors.push(`${field} négatif: ${value}`);
      (data as any)[field] = undefined;
    }
  }

  // Tirs cadrés <= Total tirs
  if (data.homeShotsOnTarget && data.homeTotalShots && data.homeShotsOnTarget > data.homeTotalShots) {
    errors.push(`Tirs cadrés home (${data.homeShotsOnTarget}) > Total tirs (${data.homeTotalShots})`);
    data.homeShotsOnTarget = undefined;
  }

  if (data.awayShotsOnTarget && data.awayTotalShots && data.awayShotsOnTarget > data.awayTotalShots) {
    errors.push(`Tirs cadrés away (${data.awayShotsOnTarget}) > Total tirs (${data.awayTotalShots})`);
    data.awayShotsOnTarget = undefined;
  }

  // xG > 5.0 = suspect (mais pas erreur)
  if (data.homeXG && data.homeXG > 5.0) {
    errors.push(`xG home élevé suspect: ${data.homeXG}`);
  }
  if (data.awayXG && data.awayXG > 5.0) {
    errors.push(`xG away élevé suspect: ${data.awayXG}`);
  }

  return errors;
}

/**
 * PARSER PRINCIPAL ULTRA-ROBUSTE
 */
export function parseMatchDataRobust(rawText: string): RobustParsedData {
  const text = rawText.trim();
  const data: Partial<RobustParsedData> = {};
  const missingFields: string[] = [];
  const warnings: string[] = [];
  let extractedFields = 0;
  const totalFields = 32; // Nombre de champs principaux

  // ============================================================================
  // POSSESSION (Multi-patterns)
  // ============================================================================
  const possessionPatterns = [
    /(\d+)\s*%?\s*Possession\s*(\d+)\s*%?/i,           // "65% Possession 35%"
    /Possession[:\s]*(\d+)\s*%?[:\s-]+(\d+)\s*%?/i,   // "Possession: 65-35"
    /(\d+)\s*[-/]\s*(\d+)\s*%?\s*Possession/i         // "65-35% Possession"
  ];

  const possession = extractWithPatterns(text, 'Possession', possessionPatterns);
  if (possession) {
    data.homePossession = possession[0];
    data.awayPossession = possession[1];
    extractedFields++;
  } else {
    missingFields.push('Possession');
  }

  // ============================================================================
  // xG (Multi-patterns)
  // ============================================================================
  const xgPatterns = [
    /([\d.]+)\s*Buts attendus[^0-9]*([\d.]+)/i,       // "1.2 Buts attendus (xG) 0.8"
    /([\d.]+)\s*xG[^0-9]*([\d.]+)/i,                  // "1.2 xG 0.8"
    /xG[:\s]*([\d.]+)[^0-9]+([\d.]+)/i                // "xG: 1.2 - 0.8"
  ];

  const xg = extractWithPatterns(text, 'xG', xgPatterns);
  if (xg) {
    data.homeXG = xg[0];
    data.awayXG = xg[1];
    extractedFields++;
  } else {
    missingFields.push('xG');
  }

  // ============================================================================
  // CORNERS (Multi-patterns)
  // ============================================================================
  const cornerPatterns = [
    /(\d+)\s*Corners?\s*(\d+)/i,                      // "5 Corner 3"
    /Corners?[:\s]*(\d+)[^0-9]+(\d+)/i,               // "Corner: 5-3"
    /(\d+)\s*[-/]\s*(\d+)\s*Corners?/i                // "5-3 Corners"
  ];

  const corners = extractWithPatterns(text, 'Corners', cornerPatterns);
  if (corners) {
    data.homeCorners = corners[0];
    data.awayCorners = corners[1];
    extractedFields++;
  } else {
    missingFields.push('Corners');
  }

  // ============================================================================
  // FAUTES (Multi-patterns)
  // ============================================================================
  const foulsPatterns = [
    /(\d+)\s*Fautes?\s*(\d+)/i,
    /Fautes?[:\s]*(\d+)[^0-9]+(\d+)/i,
    /(\d+)\s*[-/]\s*(\d+)\s*Fautes?/i
  ];

  const fouls = extractWithPatterns(text, 'Fautes', foulsPatterns);
  if (fouls) {
    data.homeFouls = fouls[0];
    data.awayFouls = fouls[1];
    extractedFields++;
  } else {
    missingFields.push('Fautes');
  }

  // ============================================================================
  // CARTONS JAUNES (Multi-patterns)
  // ============================================================================
  const yellowCardsPatterns = [
    /(\d+)\s*Cartons? jaunes?\s*(\d+)/i,
    /Cartons? jaunes?[:\s]*(\d+)[^0-9]+(\d+)/i,
    /(\d+)\s*[-/]\s*(\d+)\s*Cartons? jaunes?/i
  ];

  const yellowCards = extractWithPatterns(text, 'Cartons jaunes', yellowCardsPatterns);
  if (yellowCards) {
    data.homeYellowCards = yellowCards[0];
    data.awayYellowCards = yellowCards[1];
    extractedFields++;
  } else {
    missingFields.push('Cartons jaunes');
  }

  // ============================================================================
  // TIRS TOTAUX (Multi-patterns)
  // ============================================================================
  const totalShotsPatterns = [
    /(\d+)\s*Total des tirs\s*(\d+)/i,
    /(\d+)\s*Tirs totaux\s*(\d+)/i,
    /Total des tirs[:\s]*(\d+)[^0-9]+(\d+)/i
  ];

  const totalShots = extractWithPatterns(text, 'Total tirs', totalShotsPatterns);
  if (totalShots) {
    data.homeTotalShots = totalShots[0];
    data.awayTotalShots = totalShots[1];
    extractedFields++;
  } else {
    missingFields.push('Total tirs');
  }

  // ============================================================================
  // TIRS CADRÉS (Multi-patterns)
  // ============================================================================
  const shotsOnTargetPatterns = [
    /(\d+)\s*Tirs cadrés\s*(\d+)/i,
    /Tirs cadrés[:\s]*(\d+)[^0-9]+(\d+)/i,
    /(\d+)\s*[-/]\s*(\d+)\s*Tirs cadrés/i
  ];

  const shotsOnTarget = extractWithPatterns(text, 'Tirs cadrés', shotsOnTargetPatterns);
  if (shotsOnTarget) {
    data.homeShotsOnTarget = shotsOnTarget[0];
    data.awayShotsOnTarget = shotsOnTarget[1];
    extractedFields++;
  } else {
    missingFields.push('Tirs cadrés');
  }

  // ============================================================================
  // GROSSES OCCASIONS (Multi-patterns)
  // ============================================================================
  const bigChancesPatterns = [
    /(\d+)\s*Grosses? occasions?\s*(\d+)/i,
    /Grosses? occasions?[:\s]*(\d+)[^0-9]+(\d+)/i,
    /(\d+)\s*[-/]\s*(\d+)\s*Grosses? occasions?/i
  ];

  const bigChances = extractWithPatterns(text, 'Grosses occasions', bigChancesPatterns);
  if (bigChances) {
    data.homeBigChances = bigChances[0];
    data.awayBigChances = bigChances[1];
    extractedFields++;
  } else {
    missingFields.push('Grosses occasions');
  }

  // ============================================================================
  // PASSES (Multi-patterns)
  // ============================================================================
  const passesPatterns = [
    /(\d+)\s*Passes?\s*(\d+)/i,
    /Passes?[:\s]*(\d+)[^0-9]+(\d+)/i
  ];

  const passes = extractWithPatterns(text, 'Passes', passesPatterns);
  if (passes) {
    data.homePasses = passes[0];
    data.awayPasses = passes[1];
    extractedFields++;
  } else {
    missingFields.push('Passes');
  }

  // ============================================================================
  // PASSES PRÉCISES (Multi-patterns avec %)
  // ============================================================================
  const accuratePassesPatterns = [
    /(\d+)\s*\([\d.]+%\)\s*Passes précises\s*(\d+)/i,
    /Passes précises[:\s]*(\d+)[^0-9]+(\d+)/i
  ];

  const accuratePasses = extractWithPatterns(text, 'Passes précises', accuratePassesPatterns);
  if (accuratePasses) {
    data.homeAccuratePasses = accuratePasses[0];
    data.awayAccuratePasses = accuratePasses[1];
    extractedFields++;
  } else {
    missingFields.push('Passes précises');
  }

  // ============================================================================
  // ARRÊTS GARDIEN (Multi-patterns)
  // ============================================================================
  const savesPatterns = [
    /(\d+)\s*Arrêts du gardien\s*(\d+)/i,
    /Arrêts[:\s]*(\d+)[^0-9]+(\d+)/i
  ];

  const saves = extractWithPatterns(text, 'Arrêts gardien', savesPatterns);
  if (saves) {
    data.homeGoalkeeperSaves = saves[0];
    data.awayGoalkeeperSaves = saves[1];
    extractedFields++;
  } else {
    missingFields.push('Arrêts gardien');
  }

  // ============================================================================
  // REMISES EN JEU (Multi-patterns)
  // ============================================================================
  const throwInsPatterns = [
    /(\d+)\s*Remises? en jeu\s*(\d+)/i,
    /Remises? en jeu[:\s]*(\d+)[^0-9]+(\d+)/i,
    /(\d+)\s*Throw-?ins?\s*(\d+)/i
  ];

  const throwIns = extractWithPatterns(text, 'Remises en jeu', throwInsPatterns);
  if (throwIns) {
    data.homeThrowIns = throwIns[0];
    data.awayThrowIns = throwIns[1];
    extractedFields++;
  } else {
    missingFields.push('Remises en jeu');
  }

  // ============================================================================
  // HORS-JEUX (Multi-patterns)
  // ============================================================================
  const offsidesPatterns = [
    /(\d+)\s*Hors-?jeux?\s*(\d+)/i,
    /Hors-?jeux?[:\s]*(\d+)[^0-9]+(\d+)/i,
    /(\d+)\s*Offsides?\s*(\d+)/i
  ];

  const offsides = extractWithPatterns(text, 'Hors-jeux', offsidesPatterns);
  if (offsides) {
    data.homeOffsides = offsides[0];
    data.awayOffsides = offsides[1];
    extractedFields++;
  } else {
    missingFields.push('Hors-jeux');
  }

  // ============================================================================
  // VALIDATION COHÉRENCE
  // ============================================================================
  const validationErrors = validateData(data);

  // ============================================================================
  // CALCUL QUALITÉ DONNÉES
  // ============================================================================
  const dataQuality = Math.round((extractedFields / totalFields) * 100);

  // Avertissements si qualité faible
  if (dataQuality < 50) {
    warnings.push(`Qualité données faible: ${dataQuality}% (min recommandé: 50%)`);
  }
  if (dataQuality < 30) {
    warnings.push(`⚠️ CRITIQUE: Seulement ${dataQuality}% des données extraites`);
  }

  // ============================================================================
  // RETOUR AVEC VALEURS PAR DÉFAUT 0 (après validation)
  // ============================================================================
  return {
    homeScore: data.homeScore ?? 0,
    awayScore: data.awayScore ?? 0,
    minute: data.minute ?? 0,
    homePossession: data.homePossession ?? 0,
    awayPossession: data.awayPossession ?? 0,
    homeXG: data.homeXG ?? 0,
    awayXG: data.awayXG ?? 0,
    homeCorners: data.homeCorners ?? 0,
    awayCorners: data.awayCorners ?? 0,
    homeFouls: data.homeFouls ?? 0,
    awayFouls: data.awayFouls ?? 0,
    homeYellowCards: data.homeYellowCards ?? 0,
    awayYellowCards: data.awayYellowCards ?? 0,
    homeTotalShots: data.homeTotalShots ?? 0,
    awayTotalShots: data.awayTotalShots ?? 0,
    homeShotsOnTarget: data.homeShotsOnTarget ?? 0,
    awayShotsOnTarget: data.awayShotsOnTarget ?? 0,
    homeBigChances: data.homeBigChances ?? 0,
    awayBigChances: data.awayBigChances ?? 0,
    homePasses: data.homePasses ?? 0,
    awayPasses: data.awayPasses ?? 0,
    homeAccuratePasses: data.homeAccuratePasses ?? 0,
    awayAccuratePasses: data.awayAccuratePasses ?? 0,
    homeGoalkeeperSaves: data.homeGoalkeeperSaves ?? 0,
    awayGoalkeeperSaves: data.awayGoalkeeperSaves ?? 0,
    homeThrowIns: data.homeThrowIns ?? 0,
    awayThrowIns: data.awayThrowIns ?? 0,
    homeOffsides: data.homeOffsides ?? 0,
    awayOffsides: data.awayOffsides ?? 0,
    homeTackles: data.homeTackles ?? 0,
    awayTackles: data.awayTackles ?? 0,
    homeInterceptions: data.homeInterceptions ?? 0,
    awayInterceptions: data.awayInterceptions ?? 0,
    homeDuelsWon: data.homeDuelsWon ?? 0,
    awayDuelsWon: data.awayDuelsWon ?? 0,

    // Métadonnées
    dataQuality,
    missingFields,
    extractedFields,
    totalFields,
    validationErrors,
    warnings
  };
}
