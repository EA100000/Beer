/**
 * PARSER INTELLIGENT DE DONNÉES LIVE
 *
 * Extrait AUTOMATIQUEMENT toutes les variables d'un texte collé
 * Format: Aperçu du match Sofascore
 */

export interface ParsedMatchData {
  // Score et temps
  homeScore: number;
  awayScore: number;
  minute: number;

  // Possession
  homePossession: number;
  awayPossession: number;

  // xG et occasions
  homeXG: number;
  awayXG: number;
  homeBigChances: number;
  awayBigChances: number;

  // Tirs
  homeTotalShots: number;
  awayTotalShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homeShotsOffTarget: number;
  awayShotsOffTarget: number;
  homeShotsBlocked: number;
  awayShotsBlocked: number;
  homeShotsInsideBox: number;
  awayShotsInsideBox: number;
  homeShotsOutsideBox: number;
  awayShotsOutsideBox: number;
  homeShotsOnPost: number;
  awayShotsOnPost: number;

  // Gardien
  homeGoalkeeperSaves: number;
  awayGoalkeeperSaves: number;
  homeGoalsPrevented: number;
  awayGoalsPrevented: number;
  homeGoalKicks: number;
  awayGoalKicks: number;

  // Corners et fautes
  homeCorners: number;
  awayCorners: number;
  homeFouls: number;
  awayFouls: number;

  // Passes
  homePasses: number;
  awayPasses: number;
  homeAccuratePasses: number;
  awayAccuratePasses: number;
  homePassesToFinalThird: number;
  awayPassesToFinalThird: number;
  homePassesInFinalThird: number;
  awayPassesInFinalThird: number;
  homePassesInFinalThirdTotal: number;
  awayPassesInFinalThirdTotal: number;
  homeLongBalls: number;
  awayLongBalls: number;
  homeLongBallsTotal: number;
  awayLongBallsTotal: number;
  homeCrosses: number;
  awayCrosses: number;
  homeCrossesTotal: number;
  awayCrossesTotal: number;

  // Attaque
  homeBigChancesScored: number;
  awayBigChancesScored: number;
  homeBigChancesMissed: number;
  awayBigChancesMissed: number;
  homeThroughBalls: number;
  awayThroughBalls: number;
  homeTouchesInBox: number;
  awayTouchesInBox: number;
  homeTouches: number;
  awayTouches: number;

  // Duels
  homeDuelsWon: number;
  awayDuelsWon: number;
  homeDuelsTotal: number;
  awayDuelsTotal: number;
  homeGroundDuelsWon: number;
  awayGroundDuelsWon: number;
  homeGroundDuelsTotal: number;
  awayGroundDuelsTotal: number;
  homeAerialDuelsWon: number;
  awayAerialDuelsWon: number;
  homeAerialDuelsTotal: number;
  awayAerialDuelsTotal: number;
  homeDribbles: number;
  awayDribbles: number;
  homeDribblesTotal: number;
  awayDribblesTotal: number;
  homeBallsLost: number;
  awayBallsLost: number;

  // Défense
  homeTackles: number;
  awayTackles: number;
  homeTacklesWonPercentage: number;
  awayTacklesWonPercentage: number;
  homeInterceptions: number;
  awayInterceptions: number;
  homeRecoveries: number;
  awayRecoveries: number;
  homeClearances: number;
  awayClearances: number;

  // Coups francs
  homeFreeKicks: number;
  awayFreeKicks: number;

  // Qualité des données
  dataQuality: number;
  missingFields: string[];
}

/**
 * Parse le texte collé et extrait TOUTES les variables
 */
export function parseIntelligentMatchData(rawText: string): ParsedMatchData {
  const data: Partial<ParsedMatchData> = {};
  const missingFields: string[] = [];

  // Nettoyer le texte
  const text = rawText.trim();

  // ============================================================================
  // EXTRACTION POSSESSION
  // ============================================================================
  const possessionMatch = text.match(/(\d+)%\s*Possession\s*(\d+)%/i);
  if (possessionMatch) {
    data.homePossession = parseInt(possessionMatch[1]);
    data.awayPossession = parseInt(possessionMatch[2]);
  } else {
    missingFields.push('Possession');
  }

  // ============================================================================
  // EXTRACTION xG
  // ============================================================================
  const xgMatch = text.match(/([\d.]+)\s*Buts attendus \(xG\)\s*([\d.]+)/i);
  if (xgMatch) {
    data.homeXG = parseFloat(xgMatch[1]);
    data.awayXG = parseFloat(xgMatch[2]);
  } else {
    missingFields.push('xG');
  }

  // ============================================================================
  // EXTRACTION GROSSES OCCASIONS
  // ============================================================================
  const bigChancesMatch = text.match(/(\d+)\s*Grosses occasions\s*(\d+)/i);
  if (bigChancesMatch) {
    data.homeBigChances = parseInt(bigChancesMatch[1]);
    data.awayBigChances = parseInt(bigChancesMatch[2]);
  } else {
    missingFields.push('Grosses occasions');
  }

  // ============================================================================
  // EXTRACTION TIRS
  // ============================================================================
  const totalShotsMatch = text.match(/(\d+)\s*Total des tirs\s*(\d+)/i);
  if (totalShotsMatch) {
    data.homeTotalShots = parseInt(totalShotsMatch[1]);
    data.awayTotalShots = parseInt(totalShotsMatch[2]);
  } else {
    missingFields.push('Total tirs');
  }

  const shotsOnTargetMatch = text.match(/(\d+)\s*Tirs cadrés\s*(\d+)/i);
  if (shotsOnTargetMatch) {
    data.homeShotsOnTarget = parseInt(shotsOnTargetMatch[1]);
    data.awayShotsOnTarget = parseInt(shotsOnTargetMatch[2]);
  } else {
    missingFields.push('Tirs cadrés');
  }

  const shotsOffTargetMatch = text.match(/(\d+)\s*Tirs non cadrés\s*(\d+)/i);
  if (shotsOffTargetMatch) {
    data.homeShotsOffTarget = parseInt(shotsOffTargetMatch[1]);
    data.awayShotsOffTarget = parseInt(shotsOffTargetMatch[2]);
  }

  const shotsBlockedMatch = text.match(/(\d+)\s*Tirs bloqués\s*(\d+)/i);
  if (shotsBlockedMatch) {
    data.homeShotsBlocked = parseInt(shotsBlockedMatch[1]);
    data.awayShotsBlocked = parseInt(shotsBlockedMatch[2]);
  }

  const shotsInsideBoxMatch = text.match(/(\d+)\s*Tirs dans la surface\s*(\d+)/i);
  if (shotsInsideBoxMatch) {
    data.homeShotsInsideBox = parseInt(shotsInsideBoxMatch[1]);
    data.awayShotsInsideBox = parseInt(shotsInsideBoxMatch[2]);
  }

  const shotsOutsideBoxMatch = text.match(/(\d+)\s*Tirs en dehors de la surface\s*(\d+)/i);
  if (shotsOutsideBoxMatch) {
    data.homeShotsOutsideBox = parseInt(shotsOutsideBoxMatch[1]);
    data.awayShotsOutsideBox = parseInt(shotsOutsideBoxMatch[2]);
  }

  const shotsOnPostMatch = text.match(/(\d+)\s*Frappe sur le poteau\s*(\d+)/i);
  if (shotsOnPostMatch) {
    data.homeShotsOnPost = parseInt(shotsOnPostMatch[1]);
    data.awayShotsOnPost = parseInt(shotsOnPostMatch[2]);
  }

  // ============================================================================
  // EXTRACTION GARDIEN
  // ============================================================================
  const savesMatch = text.match(/(\d+)\s*Arrêts du gardien\s*(\d+)/i);
  if (savesMatch) {
    data.homeGoalkeeperSaves = parseInt(savesMatch[1]);
    data.awayGoalkeeperSaves = parseInt(savesMatch[2]);
  } else {
    missingFields.push('Arrêts gardien');
  }

  const goalPreventedMatch = text.match(/([\d.]+)\s*Buts évités\s*([\d.]+)/i);
  if (goalPreventedMatch) {
    data.homeGoalsPrevented = parseFloat(goalPreventedMatch[1]);
    data.awayGoalsPrevented = parseFloat(goalPreventedMatch[2]);
  }

  const goalKicksMatch = text.match(/(\d+)\s*Coup de pied de but\s*(\d+)/i);
  if (goalKicksMatch) {
    data.homeGoalKicks = parseInt(goalKicksMatch[1]);
    data.awayGoalKicks = parseInt(goalKicksMatch[2]);
  }

  // ============================================================================
  // EXTRACTION CORNERS
  // ============================================================================
  const cornersMatch = text.match(/(\d+)\s*Corner\s*(\d+)/i);
  if (cornersMatch) {
    data.homeCorners = parseInt(cornersMatch[1]);
    data.awayCorners = parseInt(cornersMatch[2]);
  } else {
    missingFields.push('Corners');
  }

  // ============================================================================
  // EXTRACTION FAUTES
  // ============================================================================
  const foulsMatch = text.match(/(\d+)\s*Fautes\s*(\d+)/i);
  if (foulsMatch) {
    data.homeFouls = parseInt(foulsMatch[1]);
    data.awayFouls = parseInt(foulsMatch[2]);
  } else {
    missingFields.push('Fautes');
  }

  // ============================================================================
  // EXTRACTION PASSES
  // ============================================================================
  const passesMatch = text.match(/(\d+)\s*Passes\s*(\d+)/i);
  if (passesMatch) {
    data.homePasses = parseInt(passesMatch[1]);
    data.awayPasses = parseInt(passesMatch[2]);
  } else {
    missingFields.push('Passes');
  }

  const accuratePassesMatch = text.match(/(\d+)\s*Passe précise\s*(\d+)/i);
  if (accuratePassesMatch) {
    data.homeAccuratePasses = parseInt(accuratePassesMatch[1]);
    data.awayAccuratePasses = parseInt(accuratePassesMatch[2]);
  }

  const passesToFinalThirdMatch = text.match(/(\d+)\s*Passes vers le tiers offensif\s*(\d+)/i);
  if (passesToFinalThirdMatch) {
    data.homePassesToFinalThird = parseInt(passesToFinalThirdMatch[1]);
    data.awayPassesToFinalThird = parseInt(passesToFinalThirdMatch[2]);
  }

  const passesInFinalThirdMatch = text.match(/(\d+)\/(\d+)\s*\d+%\s*Passes dans le tiers offensif\s*\d+%\s*(\d+)\/(\d+)/i);
  if (passesInFinalThirdMatch) {
    data.homePassesInFinalThird = parseInt(passesInFinalThirdMatch[1]);
    data.homePassesInFinalThirdTotal = parseInt(passesInFinalThirdMatch[2]);
    data.awayPassesInFinalThird = parseInt(passesInFinalThirdMatch[3]);
    data.awayPassesInFinalThirdTotal = parseInt(passesInFinalThirdMatch[4]);
  }

  const longBallsMatch = text.match(/(\d+)\/(\d+)\s*\d+%\s*Longs ballons\s*\d+%\s*(\d+)\/(\d+)/i);
  if (longBallsMatch) {
    data.homeLongBalls = parseInt(longBallsMatch[1]);
    data.homeLongBallsTotal = parseInt(longBallsMatch[2]);
    data.awayLongBalls = parseInt(longBallsMatch[3]);
    data.awayLongBallsTotal = parseInt(longBallsMatch[4]);
  }

  const crossesMatch = text.match(/(\d+)\/(\d+)\s*\d+%\s*Transversales\s*\d+%\s*(\d+)\/(\d+)/i);
  if (crossesMatch) {
    data.homeCrosses = parseInt(crossesMatch[1]);
    data.homeCrossesTotal = parseInt(crossesMatch[2]);
    data.awayCrosses = parseInt(crossesMatch[3]);
    data.awayCrossesTotal = parseInt(crossesMatch[4]);
  }

  // ============================================================================
  // EXTRACTION ATTAQUE
  // ============================================================================
  const bigChancesScoredMatch = text.match(/(\d+)\s*Grosses occasions réalisées\s*(\d+)/i);
  if (bigChancesScoredMatch) {
    data.homeBigChancesScored = parseInt(bigChancesScoredMatch[1]);
    data.awayBigChancesScored = parseInt(bigChancesScoredMatch[2]);
  }

  const bigChancesMissedMatch = text.match(/(\d+)\s*Grosses occasions manquées\s*(\d+)/i);
  if (bigChancesMissedMatch) {
    data.homeBigChancesMissed = parseInt(bigChancesMissedMatch[1]);
    data.awayBigChancesMissed = parseInt(bigChancesMissedMatch[2]);
  }

  const throughBallsMatch = text.match(/(\d+)\s*Passes en profondeur\s*(\d+)/i);
  if (throughBallsMatch) {
    data.homeThroughBalls = parseInt(throughBallsMatch[1]);
    data.awayThroughBalls = parseInt(throughBallsMatch[2]);
  }

  const touchesInBoxMatch = text.match(/(\d+)\s*Touches dans la surface de réparation adversaire\s*(\d+)/i);
  if (touchesInBoxMatch) {
    data.homeTouchesInBox = parseInt(touchesInBoxMatch[1]);
    data.awayTouchesInBox = parseInt(touchesInBoxMatch[2]);
  }

  const touchesMatch = text.match(/(\d+)\s*Touches\s*(\d+)/i);
  if (touchesMatch) {
    data.homeTouches = parseInt(touchesMatch[1]);
    data.awayTouches = parseInt(touchesMatch[2]);
  }

  const ballsLostMatch = text.match(/(\d+)\s*Perte de balle\s*(\d+)/i);
  if (ballsLostMatch) {
    data.homeBallsLost = parseInt(ballsLostMatch[1]);
    data.awayBallsLost = parseInt(ballsLostMatch[2]);
  }

  // ============================================================================
  // EXTRACTION DUELS
  // ============================================================================
  const duelsMatch = text.match(/(\d+)%\s*Duels\s*(\d+)%/i);
  if (duelsMatch) {
    // Pourcentage → estimer total (on prend 100 duels par défaut)
    const homePercent = parseInt(duelsMatch[1]);
    const awayPercent = parseInt(duelsMatch[2]);
    const totalDuels = 100;
    data.homeDuelsWon = Math.round(totalDuels * homePercent / 100);
    data.awayDuelsWon = Math.round(totalDuels * awayPercent / 100);
    data.homeDuelsTotal = totalDuels;
    data.awayDuelsTotal = totalDuels;
  }

  const groundDuelsMatch = text.match(/(\d+)\/(\d+)\s*\d+%\s*Duels au sol\s*\d+%\s*(\d+)\/(\d+)/i);
  if (groundDuelsMatch) {
    data.homeGroundDuelsWon = parseInt(groundDuelsMatch[1]);
    data.homeGroundDuelsTotal = parseInt(groundDuelsMatch[2]);
    data.awayGroundDuelsWon = parseInt(groundDuelsMatch[3]);
    data.awayGroundDuelsTotal = parseInt(groundDuelsMatch[4]);
  }

  const aerialDuelsMatch = text.match(/(\d+)\/(\d+)\s*\d+%\s*Duels aériens\s*\d+%\s*(\d+)\/(\d+)/i);
  if (aerialDuelsMatch) {
    data.homeAerialDuelsWon = parseInt(aerialDuelsMatch[1]);
    data.homeAerialDuelsTotal = parseInt(aerialDuelsMatch[2]);
    data.awayAerialDuelsWon = parseInt(aerialDuelsMatch[3]);
    data.awayAerialDuelsTotal = parseInt(aerialDuelsMatch[4]);
  }

  // Support 2 formats: "5/10 50% Dribbles 40% 2/5" ET "5/10 Dribbles 2/5"
  const dribblesMatch = text.match(/(\d+)\/(\d+)(?:\s*\d+%)?\s*Dribbles(?:\s*\d+%)?\s*(\d+)\/(\d+)/i);
  if (dribblesMatch) {
    data.homeDribbles = parseInt(dribblesMatch[1]);
    data.homeDribblesTotal = parseInt(dribblesMatch[2]);
    data.awayDribbles = parseInt(dribblesMatch[3]);
    data.awayDribblesTotal = parseInt(dribblesMatch[4]);
  }

  // ============================================================================
  // EXTRACTION DÉFENSE
  // ============================================================================
  // Support 2 formats: "5 Total de tacles 4" ET "5 Tacles 4"
  const tacklesMatch = text.match(/(\d+)\s*(?:Total de )?[Tt]acles\s*(\d+)/i);
  if (tacklesMatch) {
    data.homeTackles = parseInt(tacklesMatch[1]);
    data.awayTackles = parseInt(tacklesMatch[2]);
  } else {
    missingFields.push('Tacles');
  }

  const tacklesWonMatch = text.match(/(\d+)%\s*Tacles gagnés\s*(\d+)%/i);
  if (tacklesWonMatch) {
    data.homeTacklesWonPercentage = parseInt(tacklesWonMatch[1]);
    data.awayTacklesWonPercentage = parseInt(tacklesWonMatch[2]);
  }

  const interceptionsMatch = text.match(/(\d+)\s*Interceptions\s*(\d+)/i);
  if (interceptionsMatch) {
    data.homeInterceptions = parseInt(interceptionsMatch[1]);
    data.awayInterceptions = parseInt(interceptionsMatch[2]);
  }

  const recoveriesMatch = text.match(/(\d+)\s*Récupérations\s*(\d+)/i);
  if (recoveriesMatch) {
    data.homeRecoveries = parseInt(recoveriesMatch[1]);
    data.awayRecoveries = parseInt(recoveriesMatch[2]);
  }

  const clearancesMatch = text.match(/(\d+)\s*Dégagements\s*(\d+)/i);
  if (clearancesMatch) {
    data.homeClearances = parseInt(clearancesMatch[1]);
    data.awayClearances = parseInt(clearancesMatch[2]);
  }

  // ============================================================================
  // EXTRACTION COUPS FRANCS
  // ============================================================================
  const freeKicksMatch = text.match(/(\d+)\s*Coups francs\s*(\d+)/i);
  if (freeKicksMatch) {
    data.homeFreeKicks = parseInt(freeKicksMatch[1]);
    data.awayFreeKicks = parseInt(freeKicksMatch[2]);
  }

  // ============================================================================
  // VALEURS PAR DÉFAUT (0 si manquant)
  // ============================================================================
  const fillDefaults = (obj: Partial<ParsedMatchData>): ParsedMatchData => {
    return {
      homeScore: obj.homeScore ?? 0,
      awayScore: obj.awayScore ?? 0,
      minute: obj.minute ?? 0,
      homePossession: obj.homePossession ?? 50,
      awayPossession: obj.awayPossession ?? 50,
      homeXG: obj.homeXG ?? 0,
      awayXG: obj.awayXG ?? 0,
      homeBigChances: obj.homeBigChances ?? 0,
      awayBigChances: obj.awayBigChances ?? 0,
      homeTotalShots: obj.homeTotalShots ?? 0,
      awayTotalShots: obj.awayTotalShots ?? 0,
      homeShotsOnTarget: obj.homeShotsOnTarget ?? 0,
      awayShotsOnTarget: obj.awayShotsOnTarget ?? 0,
      homeShotsOffTarget: obj.homeShotsOffTarget ?? 0,
      awayShotsOffTarget: obj.awayShotsOffTarget ?? 0,
      homeShotsBlocked: obj.homeShotsBlocked ?? 0,
      awayShotsBlocked: obj.awayShotsBlocked ?? 0,
      homeShotsInsideBox: obj.homeShotsInsideBox ?? 0,
      awayShotsInsideBox: obj.awayShotsInsideBox ?? 0,
      homeShotsOutsideBox: obj.homeShotsOutsideBox ?? 0,
      awayShotsOutsideBox: obj.awayShotsOutsideBox ?? 0,
      homeShotsOnPost: obj.homeShotsOnPost ?? 0,
      awayShotsOnPost: obj.awayShotsOnPost ?? 0,
      homeGoalkeeperSaves: obj.homeGoalkeeperSaves ?? 0,
      awayGoalkeeperSaves: obj.awayGoalkeeperSaves ?? 0,
      homeGoalsPrevented: obj.homeGoalsPrevented ?? 0,
      awayGoalsPrevented: obj.awayGoalsPrevented ?? 0,
      homeGoalKicks: obj.homeGoalKicks ?? 0,
      awayGoalKicks: obj.awayGoalKicks ?? 0,
      homeCorners: obj.homeCorners ?? 0,
      awayCorners: obj.awayCorners ?? 0,
      homeFouls: obj.homeFouls ?? 0,
      awayFouls: obj.awayFouls ?? 0,
      homePasses: obj.homePasses ?? 0,
      awayPasses: obj.awayPasses ?? 0,
      homeAccuratePasses: obj.homeAccuratePasses ?? 0,
      awayAccuratePasses: obj.awayAccuratePasses ?? 0,
      homePassesToFinalThird: obj.homePassesToFinalThird ?? 0,
      awayPassesToFinalThird: obj.awayPassesToFinalThird ?? 0,
      homePassesInFinalThird: obj.homePassesInFinalThird ?? 0,
      awayPassesInFinalThird: obj.awayPassesInFinalThird ?? 0,
      homePassesInFinalThirdTotal: obj.homePassesInFinalThirdTotal ?? 0,
      awayPassesInFinalThirdTotal: obj.awayPassesInFinalThirdTotal ?? 0,
      homeLongBalls: obj.homeLongBalls ?? 0,
      awayLongBalls: obj.awayLongBalls ?? 0,
      homeLongBallsTotal: obj.homeLongBallsTotal ?? 0,
      awayLongBallsTotal: obj.awayLongBallsTotal ?? 0,
      homeCrosses: obj.homeCrosses ?? 0,
      awayCrosses: obj.awayCrosses ?? 0,
      homeCrossesTotal: obj.homeCrossesTotal ?? 0,
      awayCrossesTotal: obj.awayCrossesTotal ?? 0,
      homeBigChancesScored: obj.homeBigChancesScored ?? 0,
      awayBigChancesScored: obj.awayBigChancesScored ?? 0,
      homeBigChancesMissed: obj.homeBigChancesMissed ?? 0,
      awayBigChancesMissed: obj.awayBigChancesMissed ?? 0,
      homeThroughBalls: obj.homeThroughBalls ?? 0,
      awayThroughBalls: obj.awayThroughBalls ?? 0,
      homeTouchesInBox: obj.homeTouchesInBox ?? 0,
      awayTouchesInBox: obj.awayTouchesInBox ?? 0,
      homeTouches: obj.homeTouches ?? 0,
      awayTouches: obj.awayTouches ?? 0,
      homeDuelsWon: obj.homeDuelsWon ?? 0,
      awayDuelsWon: obj.awayDuelsWon ?? 0,
      homeDuelsTotal: obj.homeDuelsTotal ?? 0,
      awayDuelsTotal: obj.awayDuelsTotal ?? 0,
      homeGroundDuelsWon: obj.homeGroundDuelsWon ?? 0,
      awayGroundDuelsWon: obj.awayGroundDuelsWon ?? 0,
      homeGroundDuelsTotal: obj.homeGroundDuelsTotal ?? 0,
      awayGroundDuelsTotal: obj.awayGroundDuelsTotal ?? 0,
      homeAerialDuelsWon: obj.homeAerialDuelsWon ?? 0,
      awayAerialDuelsWon: obj.awayAerialDuelsWon ?? 0,
      homeAerialDuelsTotal: obj.homeAerialDuelsTotal ?? 0,
      awayAerialDuelsTotal: obj.awayAerialDuelsTotal ?? 0,
      homeDribbles: obj.homeDribbles ?? 0,
      awayDribbles: obj.awayDribbles ?? 0,
      homeDribblesTotal: obj.homeDribblesTotal ?? 0,
      awayDribblesTotal: obj.awayDribblesTotal ?? 0,
      homeBallsLost: obj.homeBallsLost ?? 0,
      awayBallsLost: obj.awayBallsLost ?? 0,
      homeTackles: obj.homeTackles ?? 0,
      awayTackles: obj.awayTackles ?? 0,
      homeTacklesWonPercentage: obj.homeTacklesWonPercentage ?? 50,
      awayTacklesWonPercentage: obj.awayTacklesWonPercentage ?? 50,
      homeInterceptions: obj.homeInterceptions ?? 0,
      awayInterceptions: obj.awayInterceptions ?? 0,
      homeRecoveries: obj.homeRecoveries ?? 0,
      awayRecoveries: obj.awayRecoveries ?? 0,
      homeClearances: obj.homeClearances ?? 0,
      awayClearances: obj.awayClearances ?? 0,
      homeFreeKicks: obj.homeFreeKicks ?? 0,
      awayFreeKicks: obj.awayFreeKicks ?? 0,
      dataQuality: 0,
      missingFields: []
    };
  };

  const result = fillDefaults(data);

  // Calculer qualité des données
  const totalFields = 90; // Nombre total de champs
  const filledFields = totalFields - missingFields.length;
  result.dataQuality = Math.round((filledFields / totalFields) * 100);
  result.missingFields = missingFields;

  return result;
}
