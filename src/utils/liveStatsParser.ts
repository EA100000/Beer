/**
 * PARSER INTELLIGENT POUR DONNÉES LIVE SOFASCORE
 * Extrait automatiquement toutes les stats du texte copié-collé
 *
 * Gère 2 formats:
 * 1. Format simplifié (Aperçu du match)
 * 2. Format détaillé (Stats complètes)
 */

export interface ParsedLiveStats {
  possession: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  offsides: { home: number; away: number };
  totalShots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  bigChances: { home: number; away: number };
  success: boolean;
  warnings: string[];
}

/**
 * Parse les statistiques live depuis le texte copié de SofaScore
 */
export function parseLiveStats(text: string): ParsedLiveStats {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const warnings: string[] = [];

  // Initialiser avec valeurs par défaut
  const result: ParsedLiveStats = {
    possession: { home: 50, away: 50 },
    corners: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
    yellowCards: { home: 0, away: 0 },
    offsides: { home: 0, away: 0 },
    totalShots: { home: 0, away: 0 },
    shotsOnTarget: { home: 0, away: 0 },
    bigChances: { home: 0, away: 0 },
    success: false,
    warnings: []
  };

  try {
    // ========================================================================
    // STRATÉGIE DE PARSING INTELLIGENT
    // ========================================================================

    /**
     * Fonction générique pour trouver une ligne de stat et extraire les 2 valeurs
     * Exemples:
     * - "60% Possession 40%" → [60, 40]
     * - "4 Corner 0" → [4, 0]
     * - "5 Fautes 8" → [5, 8]
     */
    const findStat = (keywords: string[]): [number, number] | null => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();

        // Vérifier si la ligne contient un des mots-clés
        const keywordFound = keywords.some(kw => line.includes(kw.toLowerCase()));

        if (keywordFound) {
          // Stratégie 1: Chercher format "60% Possession 40%"
          const percentMatch = lines[i].match(/(\d+)%.*?(\d+)%/);
          if (percentMatch) {
            return [parseInt(percentMatch[1]), parseInt(percentMatch[2])];
          }

          // Stratégie 2: Chercher format "4 Corner 0"
          const inlineMatch = lines[i].match(/(\d+).*?(\d+)/);
          if (inlineMatch) {
            return [parseInt(inlineMatch[1]), parseInt(inlineMatch[2])];
          }

          // Stratégie 3: Valeurs sur les lignes suivantes
          const values: number[] = [];
          for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
            const num = parseInt(lines[j]);
            if (!isNaN(num)) {
              values.push(num);
              if (values.length === 2) {
                return [values[0], values[1]];
              }
            }
          }
        }
      }
      return null;
    };

    // ========================================================================
    // EXTRACTION DES STATS
    // ========================================================================

    // POSSESSION
    const possession = findStat(['possession', 'possession de balle']);
    if (possession) {
      result.possession = { home: possession[0], away: possession[1] };
    } else {
      warnings.push('Possession non trouvée');
    }

    // CORNERS
    const corners = findStat(['corner', 'corners']);
    if (corners) {
      result.corners = { home: corners[0], away: corners[1] };
    } else {
      warnings.push('Corners non trouvés');
    }

    // FAUTES
    const fouls = findStat(['faute', 'fautes', 'foul', 'fouls']);
    if (fouls) {
      result.fouls = { home: fouls[0], away: fouls[1] };
    } else {
      warnings.push('Fautes non trouvées');
    }

    // CARTONS JAUNES
    const yellowCards = findStat(['cartons jaunes', 'carton jaune', 'yellow card']);
    if (yellowCards) {
      result.yellowCards = { home: yellowCards[0], away: yellowCards[1] };
    } else {
      warnings.push('Cartons jaunes non trouvés');
    }

    // HORS-JEUX
    const offsides = findStat(['hors-jeu', 'hors-jeux', 'offside', 'offsides']);
    if (offsides) {
      result.offsides = { home: offsides[0], away: offsides[1] };
    } else {
      warnings.push('Hors-jeux non trouvés');
    }

    // TIRS TOTAUX
    const totalShots = findStat(['total des tirs', 'total tirs', 'tirs']);
    if (totalShots) {
      result.totalShots = { home: totalShots[0], away: totalShots[1] };
    } else {
      warnings.push('Tirs totaux non trouvés');
    }

    // TIRS CADRÉS
    const shotsOnTarget = findStat(['tirs cadrés', 'shots on target', 'cadrés']);
    if (shotsOnTarget) {
      result.shotsOnTarget = { home: shotsOnTarget[0], away: shotsOnTarget[1] };
    } else {
      warnings.push('Tirs cadrés non trouvés');
    }

    // GROSSES OCCASIONS
    const bigChances = findStat(['grosses occasions', 'big chances', 'occasions']);
    if (bigChances) {
      result.bigChances = { home: bigChances[0], away: bigChances[1] };
    } else {
      warnings.push('Grosses occasions non trouvées');
    }

    // ========================================================================
    // VALIDATION DES DONNÉES
    // ========================================================================

    // Vérifier possession = 100%
    const totalPossession = result.possession.home + result.possession.away;
    if (totalPossession < 95 || totalPossession > 105) {
      warnings.push(`⚠️ Possession totale anormale: ${totalPossession}%`);
      // Normaliser à 100%
      const factor = 100 / totalPossession;
      result.possession.home = Math.round(result.possession.home * factor);
      result.possession.away = Math.round(result.possession.away * factor);
    }

    // Vérifier tirs cadrés ≤ tirs totaux
    if (result.shotsOnTarget.home > result.totalShots.home) {
      warnings.push(`⚠️ Tirs cadrés domicile (${result.shotsOnTarget.home}) > tirs totaux (${result.totalShots.home})`);
    }
    if (result.shotsOnTarget.away > result.totalShots.away) {
      warnings.push(`⚠️ Tirs cadrés extérieur (${result.shotsOnTarget.away}) > tirs totaux (${result.totalShots.away})`);
    }

    // Si au moins 4 stats trouvées, considérer comme succès
    const statsFound = 8 - warnings.length;
    result.success = statsFound >= 4;
    result.warnings = warnings;

    if (result.success) {
      console.log(`✅ [LiveParser] ${statsFound}/8 stats extraites avec succès`);
    } else {
      console.error(`❌ [LiveParser] Seulement ${statsFound}/8 stats trouvées`);
    }

    return result;

  } catch (error) {
    console.error('❌ [LiveParser] Exception:', error);
    return {
      ...result,
      success: false,
      warnings: ['Erreur critique de parsing']
    };
  }
}

/**
 * Extrait TOUTES les données du match (format "Aperçu du match")
 * Version améliorée qui gère le format complet
 */
export function parseFullMatchOverview(text: string): ParsedLiveStats & {
  passes: { home: number; away: number };
  tackles: { home: number; away: number };
  freeKicks: { home: number; away: number };
  goalkeeperSaves: { home: number; away: number };
} {
  const baseStats = parseLiveStats(text);

  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  // Fonction helper réutilisée
  const findStat = (keywords: string[]): [number, number] | null => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      const keywordFound = keywords.some(kw => line.includes(kw.toLowerCase()));

      if (keywordFound) {
        const percentMatch = lines[i].match(/(\d+)%.*?(\d+)%/);
        if (percentMatch) {
          return [parseInt(percentMatch[1]), parseInt(percentMatch[2])];
        }
        const inlineMatch = lines[i].match(/(\d+).*?(\d+)/);
        if (inlineMatch) {
          return [parseInt(inlineMatch[1]), parseInt(inlineMatch[2])];
        }
        const values: number[] = [];
        for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
          const num = parseInt(lines[j]);
          if (!isNaN(num)) {
            values.push(num);
            if (values.length === 2) {
              return [values[0], values[1]];
            }
          }
        }
      }
    }
    return null;
  };

  // Stats supplémentaires
  const passes = findStat(['passes']) || [0, 0];
  const tackles = findStat(['tacles', 'tackles']) || [0, 0];
  const freeKicks = findStat(['coups francs', 'free kicks']) || [0, 0];
  const saves = findStat(['arrêts du gardien', 'goalkeeper saves', 'saves']) || [0, 0];

  return {
    ...baseStats,
    passes: { home: passes[0], away: passes[1] },
    tackles: { home: tackles[0], away: tackles[1] },
    freeKicks: { home: freeKicks[0], away: freeKicks[1] },
    goalkeeperSaves: { home: saves[0], away: saves[1] }
  };
}

/**
 * Exemple d'utilisation:
 *
 * const text = `
 * 60%
 * Possession
 * 40%
 * 4
 * Corner
 * 0
 * 5
 * Fautes
 * 8
 * `;
 *
 * const stats = parseLiveStats(text);
 * console.log(stats.possession); // { home: 60, away: 40 }
 * console.log(stats.corners); // { home: 4, away: 0 }
 */
