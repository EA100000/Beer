/**
 * SofaScore API Client - Récupère les vraies données depuis l'API SofaScore
 */

import { SofaScoreTeamData } from './sofascoreScraper';

/**
 * Extrait les IDs depuis l'URL de comparaison SofaScore
 */
export function extractIdsFromURL(url: string): { teamId1: string; teamId2: string; seasonId: string; tournamentId: string } | null {
  try {
    const urlObj = new URL(url);
    const ids = urlObj.searchParams.get('ids')?.split(',') || [];
    const s_ids = urlObj.searchParams.get('s_ids')?.split(',') || [];
    const ut_ids = urlObj.searchParams.get('ut_ids')?.split(',') || [];

    if (ids.length !== 2 || s_ids.length === 0 || ut_ids.length === 0) {
      return null;
    }

    return {
      teamId1: ids[0],
      teamId2: ids[1],
      seasonId: s_ids[0],
      tournamentId: ut_ids[0]
    };
  } catch (e) {
    return null;
  }
}

/**
 * Récupère les statistiques d'une équipe depuis l'API SofaScore
 */
export async function fetchTeamStats(teamId: string, seasonId: string, tournamentId: string): Promise<SofaScoreTeamData> {
  try {
    // Essayer d'abord l'API directe (peut être bloquée)
    const apiUrl = `https://api.sofascore.com/api/v1/team/${teamId}/unique-tournament/${tournamentId}/season/${seasonId}/statistics/overall`;

    let response;
    let data;

    try {
      // Tentative d'appel direct
      response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Origin': 'https://www.sofascore.com',
          'Referer': 'https://www.sofascore.com/'
        }
      });
      data = await response.json();
    } catch (directError) {
      // Si l'appel direct échoue, utiliser le proxy
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
      response = await fetch(proxyUrl);
      data = await response.json();
    }

    // Parser les données de l'API SofaScore
    const stats = data.statistics || {};

    // Extraire toutes les statistiques
    const rating = stats.rating?.rating || 0;
    const matchesPlayed = stats.matches || 0;
    const goalsScored = stats.goals || 0;
    const goalsConceded = stats.goalsConceded || 0;
    const goalsPerMatch = matchesPlayed > 0 ? goalsScored / matchesPlayed : 0;

    // Possession
    const possession = stats.possession?.average || 0;

    // Passes
    const accuratePasses = stats.accuratePasses?.average || 0;
    const totalPasses = stats.totalPasses?.average || 0;
    const passAccuracy = totalPasses > 0 ? (accuratePasses / totalPasses) * 100 : 0;

    // Tirs
    const shotsOnTarget = stats.shotsOnTarget?.average || 0;

    // Occasions
    const bigChances = stats.bigChances?.average || 0;
    const bigChancesMissed = stats.bigChancesMissed?.average || 0;

    // Défense
    const cleanSheets = stats.cleanSheets || 0;
    const interceptions = stats.interceptions?.average || 0;
    const tackles = stats.tackles?.average || 0;
    const clearances = stats.clearances?.average || 0;

    // Discipline
    const yellowCards = stats.yellowCards?.average || 0;
    const redCards = stats.redCards || 0;

    // Autres
    const fouls = stats.fouls?.average || 0;
    const offsides = stats.offsides?.average || 0;
    const corners = stats.corners?.average || 0;

    // Récupérer le nom de l'équipe
    const teamInfoUrl = `https://api.sofascore.com/api/v1/team/${teamId}`;
    const teamProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(teamInfoUrl)}`;
    const teamResponse = await fetch(teamProxyUrl);
    const teamData = await teamResponse.json();
    const teamName = teamData.name || `Team ${teamId}`;

    return {
      name: teamName,
      rating,
      matchesPlayed,
      goalsScored,
      goalsConceded,
      goalsPerMatch,
      possession,
      accuratePasses,
      passAccuracy,
      shotsOnTarget,
      bigChances,
      bigChancesMissed,
      cleanSheets,
      interceptions,
      tackles,
      clearances,
      yellowCards,
      redCards,
      fouls,
      offsides,
      corners
    };

  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    // Retourner des données par défaut en cas d'erreur
    return {
      name: `Team ${teamId}`,
      rating: 0,
      matchesPlayed: 0,
      goalsScored: 0,
      goalsConceded: 0,
      goalsPerMatch: 0,
      possession: 0,
      accuratePasses: 0,
      passAccuracy: 0,
      shotsOnTarget: 0,
      bigChances: 0,
      bigChancesMissed: 0,
      cleanSheets: 0,
      interceptions: 0,
      tackles: 0,
      clearances: 0,
      yellowCards: 0,
      redCards: 0,
      fouls: 0,
      offsides: 0,
      corners: 0
    };
  }
}

/**
 * Récupère les stats des deux équipes depuis une URL de comparaison SofaScore
 */
export async function fetchComparisonStats(url: string): Promise<{
  homeTeam: SofaScoreTeamData;
  awayTeam: SofaScoreTeamData;
  success: boolean;
  error?: string;
}> {
  try {
    // Extraire les IDs de l'URL
    const ids = extractIdsFromURL(url);
    if (!ids) {
      return {
        homeTeam: {} as SofaScoreTeamData,
        awayTeam: {} as SofaScoreTeamData,
        success: false,
        error: 'URL invalide - impossible d\'extraire les IDs des équipes'
      };
    }

    // Récupérer les stats des deux équipes en parallèle
    const [homeTeam, awayTeam] = await Promise.all([
      fetchTeamStats(ids.teamId1, ids.seasonId, ids.tournamentId),
      fetchTeamStats(ids.teamId2, ids.seasonId, ids.tournamentId)
    ]);

    return {
      homeTeam,
      awayTeam,
      success: true
    };

  } catch (error) {
    return {
      homeTeam: {} as SofaScoreTeamData,
      awayTeam: {} as SofaScoreTeamData,
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}
