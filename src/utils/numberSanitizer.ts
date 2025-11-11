/**
 * SANITIZATION DES NOMBRES
 * Empêche la propagation de NaN, Infinity, undefined dans les calculs
 *
 * CRITIQUE pour éviter crash et résultats aberrants
 */

export interface SanitizeOptions {
  min?: number;
  max?: number;
  fallback: number;
  warnOnFallback?: boolean;
}

/**
 * Sanitize un nombre avec validation complète
 *
 * @param value - Valeur à sanitiser
 * @param options - Options de sanitization
 * @returns Nombre valide garanti
 */
export function sanitizeNumber(
  value: any,
  options: SanitizeOptions
): number {
  const { min, max, fallback, warnOnFallback = true } = options;

  // ========================================================================
  // DÉTECTION DES VALEURS INVALIDES
  // ========================================================================

  // Cas 1: undefined ou null
  if (value === undefined || value === null) {
    if (warnOnFallback) {
      console.warn(`⚠️ [Sanitizer] Valeur undefined/null → Fallback: ${fallback}`);
    }
    return fallback;
  }

  // Cas 2: Pas un nombre (string, object, etc.)
  if (typeof value !== 'number') {
    if (warnOnFallback) {
      console.warn(`⚠️ [Sanitizer] Type invalide (${typeof value}) → Fallback: ${fallback}`);
    }
    return fallback;
  }

  // Cas 3: NaN
  if (isNaN(value)) {
    if (warnOnFallback) {
      console.warn(`⚠️ [Sanitizer] NaN détecté → Fallback: ${fallback}`);
    }
    return fallback;
  }

  // Cas 4: Infinity ou -Infinity
  if (!isFinite(value)) {
    if (warnOnFallback) {
      console.warn(`⚠️ [Sanitizer] Infinity détecté (${value}) → Fallback: ${fallback}`);
    }
    return fallback;
  }

  // ========================================================================
  // VALIDATION DES BORNES
  // ========================================================================

  // Appliquer minimum
  if (min !== undefined && value < min) {
    if (warnOnFallback) {
      console.warn(`⚠️ [Sanitizer] Valeur ${value} < min (${min}) → Clamped à ${min}`);
    }
    return min;
  }

  // Appliquer maximum
  if (max !== undefined && value > max) {
    if (warnOnFallback) {
      console.warn(`⚠️ [Sanitizer] Valeur ${value} > max (${max}) → Clamped à ${max}`);
    }
    return max;
  }

  // Valeur valide
  return value;
}

/**
 * Sanitize plusieurs nombres d'un coup
 */
export function sanitizeNumbers(
  values: Record<string, any>,
  optionsMap: Record<string, SanitizeOptions>
): Record<string, number> {
  const sanitized: Record<string, number> = {};

  for (const key in values) {
    if (optionsMap[key]) {
      sanitized[key] = sanitizeNumber(values[key], optionsMap[key]);
    } else {
      // Pas d'options spécifiées, on log un warning
      console.warn(`⚠️ [Sanitizer] Pas d'options pour "${key}", utilisation valeur brute`);
      sanitized[key] = values[key];
    }
  }

  return sanitized;
}

/**
 * Sanitize un taux de buts par minute (pour Poisson)
 */
export function sanitizeGoalRate(goalsPerMatch: any): number {
  return sanitizeNumber(goalsPerMatch, {
    min: 0.3,    // Minimum 0.3 buts/match (équipe très défensive)
    max: 5.0,    // Maximum 5 buts/match (équipe ultra-offensive, rare)
    fallback: 1.5, // Moyenne ligue standard
    warnOnFallback: true
  });
}

/**
 * Sanitize une possession (%)
 */
export function sanitizePossession(possession: any): number {
  return sanitizeNumber(possession, {
    min: 20,     // Minimum 20% possession
    max: 80,     // Maximum 80% possession
    fallback: 50, // 50% par défaut (équilibré)
    warnOnFallback: true
  });
}

/**
 * Sanitize un nombre de tirs
 */
export function sanitizeShots(shots: any): number {
  return sanitizeNumber(shots, {
    min: 0,
    max: 50,     // Maximum 50 tirs (extrême)
    fallback: 0,
    warnOnFallback: false // Ne pas warn pour 0 tirs (peut être valide)
  });
}

/**
 * Sanitize un nombre de corners
 */
export function sanitizeCorners(corners: any): number {
  return sanitizeNumber(corners, {
    min: 0,
    max: 30,     // Maximum 30 corners (extrême)
    fallback: 0,
    warnOnFallback: false
  });
}

/**
 * Sanitize un nombre de fautes
 */
export function sanitizeFouls(fouls: any): number {
  return sanitizeNumber(fouls, {
    min: 0,
    max: 40,     // Maximum 40 fautes (match très engagé)
    fallback: 0,
    warnOnFallback: false
  });
}

/**
 * Sanitize un nombre de cartons jaunes
 */
export function sanitizeYellowCards(cards: any): number {
  return sanitizeNumber(cards, {
    min: 0,
    max: 10,     // Maximum 10 cartons jaunes (extrême)
    fallback: 0,
    warnOnFallback: false
  });
}

/**
 * Sanitize une minute de match
 */
export function sanitizeMinute(minute: any): number {
  return sanitizeNumber(minute, {
    min: 0,
    max: 120,    // Maximum 120 minutes (prolongations)
    fallback: 0,
    warnOnFallback: true
  });
}

/**
 * Sanitize un score
 */
export function sanitizeScore(score: any): number {
  return sanitizeNumber(score, {
    min: 0,
    max: 15,     // Maximum 15 buts (extrême)
    fallback: 0,
    warnOnFallback: true
  });
}

/**
 * Sanitize un rating SofaScore
 */
export function sanitizeRating(rating: any): number {
  return sanitizeNumber(rating, {
    min: 6.0,    // Rating minimum ~6.0
    max: 8.0,    // Rating maximum ~8.0
    fallback: 7.0, // Moyenne standard
    warnOnFallback: true
  });
}

/**
 * Protection division par zéro avec sanitization
 */
export function safeDivide(numerator: number, denominator: number, fallback: number = 0): number {
  // Sanitize dénominateur
  const safeDenom = sanitizeNumber(denominator, {
    min: 0.001,  // Minimum très petit pour éviter division par 0
    fallback: 1,
    warnOnFallback: false
  });

  // Sanitize numérateur
  const safeNum = sanitizeNumber(numerator, {
    fallback: 0,
    warnOnFallback: false
  });

  const result = safeNum / safeDenom;

  // Vérifier que le résultat n'est pas NaN/Infinity
  if (!isFinite(result) || isNaN(result)) {
    console.warn(`⚠️ [SafeDivide] ${numerator}/${denominator} = invalide → Fallback: ${fallback}`);
    return fallback;
  }

  return result;
}

/**
 * Sanitize toutes les données live d'un match
 */
export function sanitizeLiveMatchData(data: any): any {
  return {
    homeScore: sanitizeScore(data.homeScore),
    awayScore: sanitizeScore(data.awayScore),
    minute: sanitizeMinute(data.minute),
    homePossession: sanitizePossession(data.homePossession),
    awayPossession: sanitizePossession(data.awayPossession),
    homeOffsides: sanitizeNumber(data.homeOffsides, { min: 0, max: 20, fallback: 0, warnOnFallback: false }),
    awayOffsides: sanitizeNumber(data.awayOffsides, { min: 0, max: 20, fallback: 0, warnOnFallback: false }),
    homeCorners: sanitizeCorners(data.homeCorners),
    awayCorners: sanitizeCorners(data.awayCorners),
    homeFouls: sanitizeFouls(data.homeFouls),
    awayFouls: sanitizeFouls(data.awayFouls),
    homeYellowCards: sanitizeYellowCards(data.homeYellowCards),
    awayYellowCards: sanitizeYellowCards(data.awayYellowCards),
    homeTotalShots: sanitizeShots(data.homeTotalShots),
    awayTotalShots: sanitizeShots(data.awayTotalShots),
    homeShotsOnTarget: sanitizeShots(data.homeShotsOnTarget),
    awayShotsOnTarget: sanitizeShots(data.awayShotsOnTarget)
  };
}

/**
 * Sanitize données TeamStats
 */
export function sanitizeTeamStats(stats: any): any {
  return {
    ...stats,
    sofascoreRating: sanitizeRating(stats.sofascoreRating),
    goalsPerMatch: sanitizeGoalRate(stats.goalsPerMatch),
    goalsConcededPerMatch: sanitizeGoalRate(stats.goalsConcededPerMatch),
    possession: sanitizePossession(stats.possession),
    shotsOnTargetPerMatch: sanitizeShots(stats.shotsOnTargetPerMatch),
    foulsPerMatch: sanitizeFouls(stats.foulsPerMatch),
    yellowCardsPerMatch: sanitizeYellowCards(stats.yellowCardsPerMatch),
    // ... autres champs avec sanitization selon type
  };
}
