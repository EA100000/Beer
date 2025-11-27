/**
 * VALIDATION DES DONNÉES LIVE
 * Détecte les incohérences et erreurs dans les données saisies
 *
 * CRITIQUE pour éviter prédictions fausses avec confiance artificielle
 */

export interface LiveMatchData {
  homeScore: number;
  awayScore: number;
  minute: number;
  homePossession: number;
  awayPossession: number;
  homeOffsides: number;
  awayOffsides: number;
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
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  severity: 'OK' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

/**
 * Valide la cohérence des données live d'un match
 */
export function validateLiveData(data: LiveMatchData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ========================================================================
  // VALIDATION 1: MINUTE DU MATCH
  // ========================================================================
  if (data.minute < 0) {
    errors.push(`❌ Minute négative: ${data.minute} (impossible)`);
  }
  if (data.minute > 120) {
    errors.push(`❌ Minute > 120: ${data.minute} (vérifier si prolongations)`);
  }
  if (data.minute > 95 && data.minute <= 120) {
    warnings.push(`⚠️ Prolongations détectées (${data.minute}'), ajustez les calculs`);
  }

  // ========================================================================
  // VALIDATION 2: SCORES
  // ========================================================================
  if (data.homeScore < 0) {
    errors.push(`❌ Score domicile négatif: ${data.homeScore} (impossible)`);
  }
  if (data.awayScore < 0) {
    errors.push(`❌ Score extérieur négatif: ${data.awayScore} (impossible)`);
  }
  if (data.homeScore > 15) {
    warnings.push(`⚠️ Score domicile très élevé: ${data.homeScore} (vérifier saisie)`);
  }
  if (data.awayScore > 15) {
    warnings.push(`⚠️ Score extérieur très élevé: ${data.awayScore} (vérifier saisie)`);
  }

  // ========================================================================
  // VALIDATION 3: TIRS (CRITÈRE LE PLUS IMPORTANT)
  // ========================================================================
  // Assouplissement: Tolérer une différence de ±1 pour erreurs de parsing
  if (data.homeShotsOnTarget > data.homeTotalShots + 1) {
    errors.push(
      `❌ INCOHÉRENCE CRITIQUE: Tirs cadrés domicile (${data.homeShotsOnTarget}) > ` +
      `tirs totaux (${data.homeTotalShots})`
    );
  } else if (data.homeShotsOnTarget > data.homeTotalShots) {
    warnings.push(
      `⚠️ Tirs cadrés domicile (${data.homeShotsOnTarget}) légèrement > ` +
      `tirs totaux (${data.homeTotalShots}) - possible erreur parsing`
    );
  }

  if (data.awayShotsOnTarget > data.awayTotalShots + 1) {
    errors.push(
      `❌ INCOHÉRENCE CRITIQUE: Tirs cadrés extérieur (${data.awayShotsOnTarget}) > ` +
      `tirs totaux (${data.awayTotalShots})`
    );
  } else if (data.awayShotsOnTarget > data.awayTotalShots) {
    warnings.push(
      `⚠️ Tirs cadrés extérieur (${data.awayShotsOnTarget}) légèrement > ` +
      `tirs totaux (${data.awayTotalShots}) - possible erreur parsing`
    );
  }

  // Tirs cadrés sans but (suspect si >20 tirs cadrés et 0 but)
  if (data.homeShotsOnTarget > 20 && data.homeScore === 0) {
    warnings.push(`⚠️ ${data.homeShotsOnTarget} tirs cadrés dom sans but (gardien exceptionnel?)`);
  }
  if (data.awayShotsOnTarget > 20 && data.awayScore === 0) {
    warnings.push(`⚠️ ${data.awayShotsOnTarget} tirs cadrés ext sans but (gardien exceptionnel?)`);
  }

  // ========================================================================
  // VALIDATION 4: POSSESSIONS (DOIT TOTALISER ~100%)
  // ========================================================================
  const totalPossession = data.homePossession + data.awayPossession;
  // Assouplissement: Tolérer 90-110% au lieu de 95-105% pour erreurs d'arrondi
  if (totalPossession < 90 || totalPossession > 110) {
    errors.push(
      `❌ INCOHÉRENCE CRITIQUE: Possessions totales = ${totalPossession}% ` +
      `(attendu ~100%)`
    );
  } else if (totalPossession < 95 || totalPossession > 105) {
    warnings.push(
      `⚠️ Possessions totales = ${totalPossession}% (attendu ~100%, ` +
      `possible erreur d'arrondi)`
    );
  }

  // Possession anormalement basse/haute
  if (data.homePossession < 20 || data.homePossession > 80) {
    warnings.push(`⚠️ Possession domicile extrême: ${data.homePossession}%`);
  }
  if (data.awayPossession < 20 || data.awayPossession > 80) {
    warnings.push(`⚠️ Possession extérieur extrême: ${data.awayPossession}%`);
  }

  // ========================================================================
  // VALIDATION 5: CARTONS VS FAUTES
  // ========================================================================
  // Assouplissement: Tolérer égalité (cartons = fautes) car certains cartons directs ne comptent pas comme fautes
  if (data.homeYellowCards > data.homeFouls + 1) {
    errors.push(
      `❌ INCOHÉRENCE CRITIQUE: Cartons jaunes dom (${data.homeYellowCards}) > ` +
      `fautes (${data.homeFouls})`
    );
  } else if (data.homeYellowCards > data.homeFouls) {
    warnings.push(
      `⚠️ Cartons jaunes dom (${data.homeYellowCards}) ≥ fautes (${data.homeFouls}) ` +
      `- possible carton direct sans faute`
    );
  }

  if (data.awayYellowCards > data.awayFouls + 1) {
    errors.push(
      `❌ INCOHÉRENCE CRITIQUE: Cartons jaunes ext (${data.awayYellowCards}) > ` +
      `fautes (${data.awayFouls})`
    );
  } else if (data.awayYellowCards > data.awayFouls) {
    warnings.push(
      `⚠️ Cartons jaunes ext (${data.awayYellowCards}) ≥ fautes (${data.awayFouls}) ` +
      `- possible carton direct sans faute`
    );
  }

  // Trop de cartons jaunes (>8 au total = carton rouge probable)
  const totalYellowCards = data.homeYellowCards + data.awayYellowCards;
  if (totalYellowCards > 8) {
    warnings.push(
      `⚠️ ${totalYellowCards} cartons jaunes (carton rouge probable, impact sur prédictions)`
    );
  }

  // ========================================================================
  // VALIDATION 6: COHÉRENCE TEMPORELLE
  // ========================================================================

  // Trop de corners pour le temps écoulé (>15 corners en 20 minutes)
  if (data.minute > 0 && data.minute < 30) {
    const totalCorners = data.homeCorners + data.awayCorners;
    const cornerRate = totalCorners / data.minute;
    if (cornerRate > 0.5) { // Plus de 1 corner toutes les 2 minutes
      warnings.push(`⚠️ Taux de corners très élevé: ${totalCorners} en ${data.minute} min`);
    }
  }

  // Trop de buts pour le temps écoulé (>5 buts en 30 minutes)
  if (data.minute > 0 && data.minute < 45) {
    const totalGoals = data.homeScore + data.awayScore;
    const goalRate = totalGoals / data.minute;
    if (goalRate > 0.15) { // Plus de 1 but toutes les 7 minutes
      warnings.push(`⚠️ Match très offensif: ${totalGoals} buts en ${data.minute} min`);
    }
  }

  // Trop de fautes pour le temps écoulé (>30 fautes en 45 minutes)
  if (data.minute > 0 && data.minute < 60) {
    const totalFouls = data.homeFouls + data.awayFouls;
    const foulRate = totalFouls / data.minute;
    if (foulRate > 0.5) { // Plus de 1 faute toutes les 2 minutes
      warnings.push(`⚠️ Match très engagé: ${totalFouls} fautes en ${data.minute} min`);
    }
  }

  // ========================================================================
  // VALIDATION 7: DONNÉES MANQUANTES (toutes à 0)
  // ========================================================================
  if (
    data.minute > 30 &&
    data.homePossession === 0 &&
    data.awayPossession === 0 &&
    data.homeCorners === 0 &&
    data.awayCorners === 0
  ) {
    errors.push(`❌ DONNÉES MANQUANTES: Toutes les statistiques sont à 0 (parser échoué?)`);
  }

  // ========================================================================
  // VALIDATION 8: STATISTIQUES ANORMALEMENT BASSES
  // ========================================================================
  if (data.minute > 60) {
    const totalCorners = data.homeCorners + data.awayCorners;
    const totalShots = data.homeTotalShots + data.awayTotalShots;
    const totalFouls = data.homeFouls + data.awayFouls;

    // Moyenne attendue: ~10 corners, ~20 tirs, ~20 fautes par match
    const expectedCorners = (data.minute / 90) * 10;
    const expectedShots = (data.minute / 90) * 20;
    const expectedFouls = (data.minute / 90) * 20;

    if (totalCorners < expectedCorners * 0.2) {
      warnings.push(
        `⚠️ Corners anormalement bas: ${totalCorners} (attendu ~${Math.round(expectedCorners)})`
      );
    }

    if (totalShots < expectedShots * 0.3 && data.minute > 45) {
      warnings.push(
        `⚠️ Tirs anormalement bas: ${totalShots} (attendu ~${Math.round(expectedShots)})`
      );
    }

    if (totalFouls < expectedFouls * 0.3) {
      warnings.push(
        `⚠️ Fautes anormalement basses: ${totalFouls} (attendu ~${Math.round(expectedFouls)})`
      );
    }
  }

  // ========================================================================
  // CALCUL DE LA SÉVÉRITÉ
  // ========================================================================
  let severity: 'OK' | 'WARNING' | 'ERROR' | 'CRITICAL' = 'OK';

  if (errors.length > 0) {
    // Erreurs critiques détectées
    severity = 'CRITICAL';
  } else if (warnings.length >= 3) {
    // 3+ warnings = situation anormale
    severity = 'ERROR';
  } else if (warnings.length > 0) {
    severity = 'WARNING';
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    severity
  };
}

/**
 * Validation rapide (uniquement erreurs critiques, pas de warnings)
 */
export function quickValidate(data: LiveMatchData): boolean {
  // Vérifications minimales pour accepter/rejeter rapidement

  if (data.minute < 0 || data.minute > 120) return false;
  if (data.homeScore < 0 || data.awayScore < 0) return false;

  // Assouplissement: Tolérer ±1 pour erreurs de parsing
  if (data.homeShotsOnTarget > data.homeTotalShots + 1) return false;
  if (data.awayShotsOnTarget > data.awayTotalShots + 1) return false;

  const totalPossession = data.homePossession + data.awayPossession;
  // Assouplissement: 90-110% au lieu de 95-105%
  if (totalPossession < 90 || totalPossession > 110) return false;

  // Assouplissement: Tolérer +1 pour cartons directs
  if (data.homeYellowCards > data.homeFouls + 1) return false;
  if (data.awayYellowCards > data.awayFouls + 1) return false;

  return true;
}

/**
 * Affichage formaté du résultat de validation
 */
export function formatValidationResult(result: ValidationResult): string {
  let output = '';

  if (result.severity === 'OK') {
    output += '✅ DONNÉES VALIDES - Aucun problème détecté\n';
    return output;
  }

  if (result.severity === 'WARNING') {
    output += '⚠️ DONNÉES ACCEPTABLES - Warnings détectés\n\n';
  } else if (result.severity === 'ERROR') {
    output += '⚠️ DONNÉES SUSPECTES - Plusieurs anomalies\n\n';
  } else if (result.severity === 'CRITICAL') {
    output += '❌ DONNÉES INVALIDES - Erreurs critiques\n\n';
  }

  if (result.errors.length > 0) {
    output += 'ERREURS CRITIQUES:\n';
    result.errors.forEach(err => {
      output += `  ${err}\n`;
    });
    output += '\n';
  }

  if (result.warnings.length > 0) {
    output += 'AVERTISSEMENTS:\n';
    result.warnings.forEach(warn => {
      output += `  ${warn}\n`;
    });
  }

  return output;
}
