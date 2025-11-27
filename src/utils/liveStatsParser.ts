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
  bigChancesScored: { home: number; away: number };
  bigChancesMissed: { home: number; away: number };
  // STATS TIRS
  passes: { home: number; away: number };
  tackles: { home: number; away: number };
  goalkeeperSaves: { home: number; away: number };
  shotsBlocked: { home: number; away: number };
  shotsOffTarget: { home: number; away: number };
  freeKicks: { home: number; away: number };
  shotsOnPost: { home: number; away: number };
  shotsInsideBox: { home: number; away: number };
  shotsOutsideBox: { home: number; away: number };
  // STATS ATTAQUE
  attacks: { home: number; away: number };
  dangerousAttacks: { home: number; away: number };
  crosses: { home: number; away: number };
  accurateCrosses: { home: number; away: number };
  throughPasses: { home: number; away: number };
  touchesInBox: { home: number; away: number };
  tacklesInAttackingThird: { home: number; away: number };
  // STATS PASSES
  accuratePasses: { home: number; away: number };
  keyPasses: { home: number; away: number };
  passAccuracy: { home: number; away: number };
  // STATS DUELS
  totalDuels: { home: number; away: number };
  duelsWon: { home: number; away: number };
  aerialDuels: { home: number; away: number };
  successfulDribbles: { home: number; away: number };
  // STATS DÉFENSE
  interceptions: { home: number; away: number };
  clearances: { home: number; away: number };
  ballsLost: { home: number; away: number };
  // STATS PASSES DÉTAILLÉES
  ownHalfPasses: { home: number; away: number };
  opponentHalfPasses: { home: number; away: number };
  passesInFinalThird: { home: number; away: number };
  // STATS DUELS DÉTAILLÉES
  groundDuels: { home: number; away: number };
  groundDuelsWon: { home: number; away: number };
  // STATS GARDIEN DÉTAILLÉES
  goalkeeperExits: { home: number; away: number };
  goalkeeperKicks: { home: number; away: number };
  longKicks: { home: number; away: number };
  goalkeeperThrows: { home: number; away: number };
  greatSaves: { home: number; away: number };
  // STATS ATTAQUE DÉTAILLÉES
  longBalls: { home: number; away: number };
  accurateLongBalls: { home: number; away: number };
  // CARTONS/FAUTES
  redCards: { home: number; away: number };
  foulsDrawn: { home: number; away: number };
  // STATS AVANCÉES
  possessionLost: { home: number; away: number };
  ballsRecovered: { home: number; away: number };
  touches: { home: number; away: number };
  crossAccuracy: { home: number; away: number };
  duelAccuracy: { home: number; away: number };
  expectedGoals: { home: number; away: number };
  dribblesAttempted: { home: number; away: number };
  defensiveDuels: { home: number; away: number };
  defensiveDuelsWon: { home: number; away: number };
  shotsRepelled: { home: number; away: number };
  chancesCreated: { home: number; away: number };
  longPassAccuracy: { home: number; away: number };
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
    bigChancesScored: { home: 0, away: 0 },
    bigChancesMissed: { home: 0, away: 0 },
    passes: { home: 0, away: 0 },
    tackles: { home: 0, away: 0 },
    goalkeeperSaves: { home: 0, away: 0 },
    shotsBlocked: { home: 0, away: 0 },
    shotsOffTarget: { home: 0, away: 0 },
    freeKicks: { home: 0, away: 0 },
    shotsOnPost: { home: 0, away: 0 },
    shotsInsideBox: { home: 0, away: 0 },
    shotsOutsideBox: { home: 0, away: 0 },
    attacks: { home: 0, away: 0 },
    dangerousAttacks: { home: 0, away: 0 },
    crosses: { home: 0, away: 0 },
    accurateCrosses: { home: 0, away: 0 },
    throughPasses: { home: 0, away: 0 },
    touchesInBox: { home: 0, away: 0 },
    tacklesInAttackingThird: { home: 0, away: 0 },
    accuratePasses: { home: 0, away: 0 },
    keyPasses: { home: 0, away: 0 },
    passAccuracy: { home: 0, away: 0 },
    totalDuels: { home: 0, away: 0 },
    duelsWon: { home: 0, away: 0 },
    aerialDuels: { home: 0, away: 0 },
    successfulDribbles: { home: 0, away: 0 },
    interceptions: { home: 0, away: 0 },
    clearances: { home: 0, away: 0 },
    ballsLost: { home: 0, away: 0 },
    ownHalfPasses: { home: 0, away: 0 },
    opponentHalfPasses: { home: 0, away: 0 },
    passesInFinalThird: { home: 0, away: 0 },
    groundDuels: { home: 0, away: 0 },
    groundDuelsWon: { home: 0, away: 0 },
    goalkeeperExits: { home: 0, away: 0 },
    goalkeeperKicks: { home: 0, away: 0 },
    longKicks: { home: 0, away: 0 },
    goalkeeperThrows: { home: 0, away: 0 },
    greatSaves: { home: 0, away: 0 },
    longBalls: { home: 0, away: 0 },
    accurateLongBalls: { home: 0, away: 0 },
    redCards: { home: 0, away: 0 },
    foulsDrawn: { home: 0, away: 0 },
    possessionLost: { home: 0, away: 0 },
    ballsRecovered: { home: 0, away: 0 },
    touches: { home: 0, away: 0 },
    crossAccuracy: { home: 0, away: 0 },
    duelAccuracy: { home: 0, away: 0 },
    expectedGoals: { home: 0, away: 0 },
    dribblesAttempted: { home: 0, away: 0 },
    defensiveDuels: { home: 0, away: 0 },
    defensiveDuelsWon: { home: 0, away: 0 },
    shotsRepelled: { home: 0, away: 0 },
    chancesCreated: { home: 0, away: 0 },
    longPassAccuracy: { home: 0, away: 0 },
    success: false,
    warnings: []
  };

  try {
    // ========================================================================
    // STRATÉGIE DE PARSING INTELLIGENT
    // ========================================================================

    /**
     * Fonction générique pour trouver une ligne de stat et extraire les 2 valeurs
     * Supporte plusieurs formats SofaScore:
     * - "60% Possession 41%" → [60, 41]
     * - "3 Corner 0" → [3, 0]
     * - "22\nTotal des tirs\n7" → [22, 7]
     * - "19/36 53% Longs ballons 41% 17/41" → [19, 17] (fractions)
     * - "102/135 76% Passes dans le tiers offensif 55% 30/55" → [102, 30]
     */
    const findStat = (keywords: string[]): [number, number] | null => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        const keywordFound = keywords.some(kw => line.includes(kw.toLowerCase()));

        if (keywordFound) {
          // 🎯 CORRECTION 1M$ - Stratégie 1: TOUJOURS extraire % en PRIORITÉ
          // Format: "32/74 43% Duels au sol 57% 42/74" → [43, 57] (les %)
          const percentMatch = lines[i].match(/(\d+)%.*?(\d+)%/);
          if (percentMatch) {
            return [parseInt(percentMatch[1]), parseInt(percentMatch[2])];
          }

          // Stratégie 2: Format avec fractions "19 Longs ballons 17" (sans %)
          const fractionMatch = lines[i].match(/(\d+)\/\d+.*?(\d+)\/\d+/);
          if (fractionMatch) {
            return [parseInt(fractionMatch[1]), parseInt(fractionMatch[2])];
          }

          // Stratégie 3: Format inline "3 Corner 0"
          const inlineMatch = lines[i].match(/^(\d+)\s+\w+.*?\s+(\d+)$/);
          if (inlineMatch) {
            return [parseInt(inlineMatch[1]), parseInt(inlineMatch[2])];
          }

          // Stratégie 4: Format SofaScore standard - valeur AVANT titre
          // "22\nTotal des tirs\n7"
          if (i > 0) {
            const prevLine = parseInt(lines[i - 1]);
            if (!isNaN(prevLine)) {
              // Chercher valeur APRÈS le titre (skip team names)
              for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                const nextNum = parseInt(lines[j]);
                // Vérifier que ce n'est pas un nom d'équipe
                if (!isNaN(nextNum) && lines[j].trim() === nextNum.toString()) {
                  return [prevLine, nextNum];
                }
              }
            }
          }

          // Stratégie 5: Valeurs sur lignes suivantes
          const values: number[] = [];
          for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
            const num = parseInt(lines[j]);
            if (!isNaN(num) && lines[j].trim() === num.toString()) {
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

    // POSSESSION - Traitement spécial pour garantir la première occurrence
    let possession: [number, number] | null = null;

    // Chercher spécifiquement le format "59%\nPossession\n41%" (format SofaScore)
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes('possession')) {
        // Vérifier si ligne précédente est un pourcentage
        if (i > 0 && lines[i - 1].includes('%')) {
          const homePct = parseInt(lines[i - 1]);
          // Chercher la valeur suivante (pourcentage away)
          if (i + 1 < lines.length && lines[i + 1].includes('%')) {
            const awayPct = parseInt(lines[i + 1]);
            if (!isNaN(homePct) && !isNaN(awayPct)) {
              possession = [homePct, awayPct];
              break; // Prendre la PREMIÈRE occurrence
            }
          }
        }
        // Vérifier format inline "59% Possession 41%"
        const percentMatch = lines[i].match(/(\d+)%.*?(\d+)%/);
        if (percentMatch) {
          possession = [parseInt(percentMatch[1]), parseInt(percentMatch[2])];
          break; // Prendre la PREMIÈRE occurrence
        }
      }
    }

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

    // GROSSES OCCASIONS RÉALISÉES
    const bigChancesScored = findStat(['grosses occasions réalisées', 'big chances scored']);
    if (bigChancesScored) {
      result.bigChancesScored = { home: bigChancesScored[0], away: bigChancesScored[1] };
    } else {
      warnings.push('Grosses occasions réalisées non trouvées');
    }

    // GROSSES OCCASIONS MANQUÉES
    const bigChancesMissed = findStat(['grosses occasions manquées', 'big chances missed']);
    if (bigChancesMissed) {
      result.bigChancesMissed = { home: bigChancesMissed[0], away: bigChancesMissed[1] };
    } else {
      warnings.push('Grosses occasions manquées non trouvées');
    }

    // PASSES
    const passes = findStat(['passes', 'total de passes', 'total passes']);
    if (passes) {
      result.passes = { home: passes[0], away: passes[1] };
    } else {
      warnings.push('Passes non trouvées');
    }

    // TACLES
    const tackles = findStat(['tacles', 'tackles', 'total de tacles']);
    if (tackles) {
      result.tackles = { home: tackles[0], away: tackles[1] };
    } else {
      warnings.push('Tacles non trouvés');
    }

    // ARRÊTS GARDIEN
    const goalkeeperSaves = findStat(['arrêts du gardien', 'goalkeeper saves', 'saves', 'arrêts']);
    if (goalkeeperSaves) {
      result.goalkeeperSaves = { home: goalkeeperSaves[0], away: goalkeeperSaves[1] };
    } else {
      warnings.push('Arrêts gardien non trouvés');
    }

    // TIRS BLOQUÉS
    const shotsBlocked = findStat(['tirs bloqués', 'shots blocked', 'bloqués']);
    if (shotsBlocked) {
      result.shotsBlocked = { home: shotsBlocked[0], away: shotsBlocked[1] };
    } else {
      warnings.push('Tirs bloqués non trouvés');
    }

    // TIRS NON CADRÉS
    const shotsOffTarget = findStat(['tirs non cadrés', 'shots off target', 'non cadrés']);
    if (shotsOffTarget) {
      result.shotsOffTarget = { home: shotsOffTarget[0], away: shotsOffTarget[1] };
    } else {
      warnings.push('Tirs non cadrés non trouvés');
    }

    // COUPS FRANCS
    const freeKicks = findStat(['coups francs', 'free kicks', 'coups-francs']);
    if (freeKicks) {
      result.freeKicks = { home: freeKicks[0], away: freeKicks[1] };
    } else {
      warnings.push('Coups francs non trouvés');
    }

    // ========================================================================
    // SECTION TIRS AVANCÉS
    // ========================================================================

    // TIRS SUR POTEAU
    const shotsOnPost = findStat(['frappe sur le poteau', 'tirs sur poteau', 'shots on post', 'poteau', 'hit woodwork']);
    if (shotsOnPost) {
      result.shotsOnPost = { home: shotsOnPost[0], away: shotsOnPost[1] };
    } else {
      warnings.push('Tirs sur poteau non trouvés');
    }

    // TIRS DANS SURFACE
    const shotsInsideBox = findStat(['tirs dans la surface', 'tirs dans surface', 'shots inside box', 'dans surface', 'dans la surface']);
    if (shotsInsideBox) {
      result.shotsInsideBox = { home: shotsInsideBox[0], away: shotsInsideBox[1] };
    } else {
      warnings.push('Tirs dans la surface non trouvés');
    }

    // TIRS HORS SURFACE
    const shotsOutsideBox = findStat(['tirs en dehors de la surface', 'tirs hors surface', 'shots outside box', 'hors surface', 'hors de la surface', 'en dehors de la surface']);
    if (shotsOutsideBox) {
      result.shotsOutsideBox = { home: shotsOutsideBox[0], away: shotsOutsideBox[1] };
    } else {
      warnings.push('Tirs hors surface non trouvés');
    }

    // ========================================================================
    // SECTION ATTAQUE
    // ========================================================================

    // ATTAQUES
    const attacks = findStat(['attaques', 'attacks', 'total attaques']);
    if (attacks) {
      result.attacks = { home: attacks[0], away: attacks[1] };
    } else {
      warnings.push('Attaques non trouvées');
    }

    // ATTAQUES DANGEREUSES
    const dangerousAttacks = findStat(['attaques dangereuses', 'dangerous attacks', 'attaques danger']);
    if (dangerousAttacks) {
      result.dangerousAttacks = { home: dangerousAttacks[0], away: dangerousAttacks[1] };
    } else {
      warnings.push('Attaques dangereuses non trouvées');
    }

    // CENTRES (SofaScore dit "Transversales")
    const crosses = findStat(['transversales', 'centres', 'crosses', 'total centres']);
    if (crosses) {
      result.crosses = { home: crosses[0], away: crosses[1] };
    } else {
      warnings.push('Centres non trouvés');
    }

    // CENTRES RÉUSSIS
    const accurateCrosses = findStat(['centres réussis', 'accurate crosses', 'centres précis']);
    if (accurateCrosses) {
      result.accurateCrosses = { home: accurateCrosses[0], away: accurateCrosses[1] };
    } else {
      warnings.push('Centres réussis non trouvés');
    }

    // PASSES EN PROFONDEUR
    const throughPasses = findStat(['passes en profondeur', 'through passes', 'through balls']);
    if (throughPasses) {
      result.throughPasses = { home: throughPasses[0], away: throughPasses[1] };
    } else {
      warnings.push('Passes en profondeur non trouvées');
    }

    // TOUCHES DANS LA SURFACE
    const touchesInBox = findStat(['touches dans la surface de réparation adversaire', 'touches dans la surface', 'touches in box']);
    if (touchesInBox) {
      result.touchesInBox = { home: touchesInBox[0], away: touchesInBox[1] };
    } else {
      warnings.push('Touches dans la surface non trouvées');
    }

    // TACLES REÇUS DANS LE TIERS OFFENSIF
    const tacklesInAttacking = findStat(['tacles reçus dans le tiers offensif', 'tackles in attacking third']);
    if (tacklesInAttacking) {
      result.tacklesInAttackingThird = { home: tacklesInAttacking[0], away: tacklesInAttacking[1] };
    } else {
      warnings.push('Tacles reçus tiers offensif non trouvés');
    }

    // ========================================================================
    // SECTION PASSES AVANCÉES
    // ========================================================================

    // PASSES RÉUSSIES (SofaScore dit "Passe précise")
    const accuratePasses = findStat(['passe précise', 'passes réussies', 'accurate passes', 'passes précises']);
    if (accuratePasses) {
      result.accuratePasses = { home: accuratePasses[0], away: accuratePasses[1] };
    } else {
      warnings.push('Passes précises non trouvées');
    }

    // PASSES CLÉS
    const keyPasses = findStat(['passes clés', 'key passes', 'passes décisives']);
    if (keyPasses) {
      result.keyPasses = { home: keyPasses[0], away: keyPasses[1] };
    } else {
      warnings.push('Passes clés non trouvées');
    }

    // PRÉCISION PASSES (calcul automatique si on a passes et passes réussies)
    if (result.passes.home > 0 && result.accuratePasses.home > 0) {
      result.passAccuracy.home = Math.round((result.accuratePasses.home / result.passes.home) * 100);
    }
    if (result.passes.away > 0 && result.accuratePasses.away > 0) {
      result.passAccuracy.away = Math.round((result.accuratePasses.away / result.passes.away) * 100);
    }

    // ========================================================================
    // SECTION DUELS
    // ========================================================================

    // TOTAL DUELS (note: SofaScore affiche "51% Duels 49%" en pourcentage)
    const totalDuels = findStat(['total duels', 'duels', 'total de duels']);
    if (totalDuels) {
      result.totalDuels = { home: totalDuels[0], away: totalDuels[1] };
    } else {
      warnings.push('Total duels non trouvés');
    }

    // DUELS GAGNÉS
    const duelsWon = findStat(['duels gagnés', 'duels won', 'duels remportés']);
    if (duelsWon) {
      result.duelsWon = { home: duelsWon[0], away: duelsWon[1] };
    } else {
      warnings.push('Duels gagnés non trouvés');
    }

    // DUELS AÉRIENS
    const aerialDuels = findStat(['duels aériens', 'aerial duels', 'duels aeriens']);
    if (aerialDuels) {
      result.aerialDuels = { home: aerialDuels[0], away: aerialDuels[1] };
    } else {
      warnings.push('Duels aériens non trouvés');
    }

    // DRIBBLES RÉUSSIS
    const successfulDribbles = findStat(['dribbles', 'successful dribbles', 'dribbles réussis']);
    if (successfulDribbles) {
      result.successfulDribbles = { home: successfulDribbles[0], away: successfulDribbles[1] };
    } else {
      warnings.push('Dribbles non trouvés');
    }

    // ========================================================================
    // SECTION DÉFENSE
    // ========================================================================

    // INTERCEPTIONS
    const interceptions = findStat(['interceptions', 'total interceptions']);
    if (interceptions) {
      result.interceptions = { home: interceptions[0], away: interceptions[1] };
    } else {
      warnings.push('Interceptions non trouvées');
    }

    // DÉGAGEMENTS
    const clearances = findStat(['dégagements', 'clearances', 'degagements']);
    if (clearances) {
      result.clearances = { home: clearances[0], away: clearances[1] };
    } else {
      warnings.push('Dégagements non trouvés');
    }

    // BALLON PERDU (SofaScore dit "Perte de balle")
    const ballsLost = findStat(['perte de balle', 'ballon perdu', 'balls lost', 'ballons perdus', 'possession lost']);
    if (ballsLost) {
      result.ballsLost = { home: ballsLost[0], away: ballsLost[1] };
    } else {
      warnings.push('Perte de balle non trouvée');
    }

    // ========================================================================
    // SECTION PASSES DÉTAILLÉES
    // ========================================================================

    // PASSES PROPRE CAMP
    const ownHalfPasses = findStat(['passes propre camp', 'own half passes', 'passes propre moitié']);
    if (ownHalfPasses) {
      result.ownHalfPasses = { home: ownHalfPasses[0], away: ownHalfPasses[1] };
    } else {
      warnings.push('Passes propre camp non trouvées');
    }

    // PASSES CAMP ADVERSE (SofaScore dit "Passes vers le tiers offensif")
    const opponentHalfPasses = findStat(['passes vers le tiers offensif', 'passes camp adverse', 'opponent half passes', 'passes moitié adverse']);
    if (opponentHalfPasses) {
      result.opponentHalfPasses = { home: opponentHalfPasses[0], away: opponentHalfPasses[1] };
    } else {
      warnings.push('Passes camp adverse non trouvées');
    }

    // PASSES DANS LE TIERS OFFENSIF (format: "102/135 76% Passes dans le tiers offensif 55% 30/55")
    const passesInFinal = findStat(['passes dans le tiers offensif', 'passes in final third']);
    if (passesInFinal) {
      result.passesInFinalThird = { home: passesInFinal[0], away: passesInFinal[1] };
    } else {
      warnings.push('Passes dans le tiers offensif non trouvées');
    }

    // ========================================================================
    // SECTION DUELS DÉTAILLÉS
    // ========================================================================

    // DUELS AU SOL
    const groundDuels = findStat(['duels au sol', 'ground duels', 'duels terrestres']);
    if (groundDuels) {
      result.groundDuels = { home: groundDuels[0], away: groundDuels[1] };
    } else {
      warnings.push('Duels au sol non trouvés');
    }

    // DUELS SOL GAGNÉS
    const groundDuelsWon = findStat(['duels sol gagnés', 'ground duels won', 'duels au sol gagnés']);
    if (groundDuelsWon) {
      result.groundDuelsWon = { home: groundDuelsWon[0], away: groundDuelsWon[1] };
    } else {
      warnings.push('Duels sol gagnés non trouvés');
    }

    // ========================================================================
    // SECTION GARDIEN DÉTAILLÉE
    // ========================================================================

    // SORTIES GARDIEN (SofaScore dit "Sorties aériennes")
    const goalkeeperExits = findStat(['sorties aériennes', 'sorties gardien', 'goalkeeper exits', 'sorties']);
    if (goalkeeperExits) {
      result.goalkeeperExits = { home: goalkeeperExits[0], away: goalkeeperExits[1] };
    } else {
      warnings.push('Sorties gardien non trouvées');
    }

    // COUPS DE PIED GARDIEN (SofaScore dit "Coup de pied de but")
    const goalkeeperKicks = findStat(['coup de pied de but', 'coups de pied', 'goalkeeper kicks', 'dégagements gardien']);
    if (goalkeeperKicks) {
      result.goalkeeperKicks = { home: goalkeeperKicks[0], away: goalkeeperKicks[1] };
    } else {
      warnings.push('Coups de pied gardien non trouvés');
    }

    // LONGS DÉGAGEMENTS
    const longKicks = findStat(['longs dégagements', 'long kicks', 'longs ballons gardien']);
    if (longKicks) {
      result.longKicks = { home: longKicks[0], away: longKicks[1] };
    } else {
      warnings.push('Longs dégagements non trouvés');
    }

    // RELANCES GARDIEN (SofaScore dit "Dégagements des poings")
    const goalkeeperThrows = findStat(['dégagements des poings', 'relances gardien', 'goalkeeper throws', 'lancer gardien']);
    if (goalkeeperThrows) {
      result.goalkeeperThrows = { home: goalkeeperThrows[0], away: goalkeeperThrows[1] };
    } else {
      warnings.push('Relances gardien non trouvées');
    }

    // GRANDS ARRÊTS
    const greatSaves = findStat(['grands arrêts', 'great saves']);
    if (greatSaves) {
      result.greatSaves = { home: greatSaves[0], away: greatSaves[1] };
    } else {
      warnings.push('Grands arrêts non trouvés');
    }

    // ========================================================================
    // SECTION ATTAQUE DÉTAILLÉE
    // ========================================================================

    // LONGS BALLONS
    const longBalls = findStat(['longs ballons', 'long balls', 'ballons longs']);
    if (longBalls) {
      result.longBalls = { home: longBalls[0], away: longBalls[1] };
    } else {
      warnings.push('Longs ballons non trouvés');
    }

    // LONGS BALLONS RÉUSSIS
    const accurateLongBalls = findStat(['longs ballons réussis', 'accurate long balls', 'longs ballons précis']);
    if (accurateLongBalls) {
      result.accurateLongBalls = { home: accurateLongBalls[0], away: accurateLongBalls[1] };
    } else {
      warnings.push('Longs ballons réussis non trouvés');
    }

    // ========================================================================
    // SECTION CARTONS/FAUTES
    // ========================================================================

    // CARTONS ROUGES
    const redCards = findStat(['cartons rouges', 'red cards', 'carton rouge']);
    if (redCards) {
      result.redCards = { home: redCards[0], away: redCards[1] };
    } else {
      warnings.push('Cartons rouges non trouvés');
    }

    // FAUTES SUBIES
    const foulsDrawn = findStat(['fautes subies', 'fouls drawn', 'fautes obtenues']);
    if (foulsDrawn) {
      result.foulsDrawn = { home: foulsDrawn[0], away: foulsDrawn[1] };
    } else {
      warnings.push('Fautes subies non trouvées');
    }

    // ========================================================================
    // SECTION STATS AVANCÉES
    // ========================================================================

    // POSSESSION PERDUE
    const possessionLost = findStat(['possession perdue', 'possession lost', 'ballons perdus']);
    if (possessionLost) {
      result.possessionLost = { home: possessionLost[0], away: possessionLost[1] };
    } else {
      warnings.push('Possession perdue non trouvée');
    }

    // BALLONS RÉCUPÉRÉS (SofaScore dit "Récupérations")
    const ballsRecovered = findStat(['récupérations', 'ballons récupérés', 'balls recovered']);
    if (ballsRecovered) {
      result.ballsRecovered = { home: ballsRecovered[0], away: ballsRecovered[1] };
    } else {
      warnings.push('Récupérations non trouvées');
    }

    // TOUCHES DE BALLE
    const touches = findStat(['touches', 'touches de balle', 'total touches']);
    if (touches) {
      result.touches = { home: touches[0], away: touches[1] };
    } else {
      warnings.push('Touches non trouvées');
    }

    // PRÉCISION CENTRES (calcul auto si centres trouvés)
    if (result.crosses.home > 0 && result.accurateCrosses.home > 0) {
      result.crossAccuracy.home = Math.round((result.accurateCrosses.home / result.crosses.home) * 100);
    }
    if (result.crosses.away > 0 && result.accurateCrosses.away > 0) {
      result.crossAccuracy.away = Math.round((result.accurateCrosses.away / result.crosses.away) * 100);
    }

    // PRÉCISION DUELS (calcul auto)
    if (result.totalDuels.home > 0 && result.duelsWon.home > 0) {
      result.duelAccuracy.home = Math.round((result.duelsWon.home / result.totalDuels.home) * 100);
    }
    if (result.totalDuels.away > 0 && result.duelsWon.away > 0) {
      result.duelAccuracy.away = Math.round((result.duelsWon.away / result.totalDuels.away) * 100);
    }

    // EXPECTED GOALS (xG)
    const expectedGoals = findStat(['expected goals', 'xg', 'buts attendus']);
    if (expectedGoals) {
      result.expectedGoals = { home: expectedGoals[0], away: expectedGoals[1] };
    } else {
      warnings.push('Expected Goals (xG) non trouvés');
    }

    // DRIBBLES TENTÉS
    const dribblesAttempted = findStat(['dribbles tentés', 'dribbles attempted', 'tentatives dribble']);
    if (dribblesAttempted) {
      result.dribblesAttempted = { home: dribblesAttempted[0], away: dribblesAttempted[1] };
    } else {
      warnings.push('Dribbles tentés non trouvés');
    }

    // DUELS DÉFENSIFS (SofaScore dit "Tacles gagnés")
    const defensiveDuels = findStat(['tacles gagnés', 'duels défensifs', 'defensive duels', 'duels defense']);
    if (defensiveDuels) {
      result.defensiveDuels = { home: defensiveDuels[0], away: defensiveDuels[1] };
    } else {
      warnings.push('Duels défensifs non trouvés');
    }

    // DUELS DÉFENSIFS GAGNÉS
    const defensiveDuelsWon = findStat(['duels défensifs gagnés', 'defensive duels won', 'duels defense gagnés']);
    if (defensiveDuelsWon) {
      result.defensiveDuelsWon = { home: defensiveDuelsWon[0], away: defensiveDuelsWon[1] };
    } else {
      warnings.push('Duels défensifs gagnés non trouvés');
    }

    // TIRS REPOUSSÉS
    const shotsRepelled = findStat(['tirs repoussés', 'shots repelled', 'tirs contrés']);
    if (shotsRepelled) {
      result.shotsRepelled = { home: shotsRepelled[0], away: shotsRepelled[1] };
    } else {
      warnings.push('Tirs repoussés non trouvés');
    }

    // OCCASIONS CRÉÉES
    const chancesCreated = findStat(['occasions créées', 'chances created', 'occasions']);
    if (chancesCreated) {
      result.chancesCreated = { home: chancesCreated[0], away: chancesCreated[1] };
    } else {
      warnings.push('Occasions créées non trouvées');
    }

    // PRÉCISION LONGUES PASSES (calcul auto)
    if (result.longBalls.home > 0 && result.accurateLongBalls.home > 0) {
      result.longPassAccuracy.home = Math.round((result.accurateLongBalls.home / result.longBalls.home) * 100);
    }
    if (result.longBalls.away > 0 && result.accurateLongBalls.away > 0) {
      result.longPassAccuracy.away = Math.round((result.accurateLongBalls.away / result.longBalls.away) * 100);
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

    // Compter VRAIMENT le nombre de stats extraites (non-zéro)
    let statsFound = 0;
    const allStats = [
      result.possession, result.corners, result.fouls, result.yellowCards, result.offsides,
      result.totalShots, result.shotsOnTarget, result.bigChances, result.bigChancesScored, result.bigChancesMissed,
      result.passes, result.tackles,
      result.goalkeeperSaves, result.shotsBlocked, result.shotsOffTarget, result.freeKicks,
      result.shotsOnPost, result.shotsInsideBox, result.shotsOutsideBox,
      result.attacks, result.dangerousAttacks, result.crosses, result.accurateCrosses,
      result.throughPasses, result.touchesInBox, result.tacklesInAttackingThird,
      result.accuratePasses, result.keyPasses, result.passAccuracy,
      result.totalDuels, result.duelsWon, result.aerialDuels, result.successfulDribbles,
      result.interceptions, result.clearances, result.ballsLost,
      result.ownHalfPasses, result.opponentHalfPasses, result.passesInFinalThird,
      result.groundDuels, result.groundDuelsWon,
      result.goalkeeperExits, result.goalkeeperKicks, result.longKicks, result.goalkeeperThrows, result.greatSaves,
      result.longBalls, result.accurateLongBalls,
      result.redCards, result.foulsDrawn,
      result.possessionLost, result.ballsRecovered, result.touches,
      result.crossAccuracy, result.duelAccuracy, result.expectedGoals,
      result.dribblesAttempted, result.defensiveDuels, result.defensiveDuelsWon,
      result.shotsRepelled, result.chancesCreated, result.longPassAccuracy
    ];

    // Compter les stats qui ont au moins une valeur non-zéro (home ou away)
    for (const stat of allStats) {
      if (stat.home > 0 || stat.away > 0) {
        statsFound++;
      }
    }

    result.success = statsFound >= 10; // Au moins 10 stats trouvées pour succès
    result.warnings = warnings;

    if (result.success) {
      console.log(`✅ [LiveParser] ${statsFound}/63 stats extraites avec succès`);
    } else {
      console.error(`❌ [LiveParser] Seulement ${statsFound}/63 stats trouvées`);
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
