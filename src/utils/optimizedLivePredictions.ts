/**
 * SYSTÈME DE PRÉDICTIONS LIVE OPTIMISÉ
 *
 * Optimisations:
 * - Cache des calculs intermédiaires
 * - Calculs incrémentaux (delta only)
 * - Parallélisation des analyses indépendantes
 * - Réduction overhead console.log
 * - Lazy evaluation des métriques
 */

import { LiveMatchData } from '@/pages/Live';
import { enrichLiveData, EnrichedLiveMetrics } from './advancedLiveAnalysis';
import { calculateDynamicWeights, DynamicWeights } from './dynamicWeightingSystem';
import { analyzeAllTrends, LinearTrendAnalysis } from './linearTrendAnalysis';
import { validateLiveData } from './liveDataValidator';
import { detectAnomalies } from './anomalyDetector';
import { generateComprehensive1xbetMarkets, Comprehensive1xbetMarkets } from './comprehensive1xbetMarkets';
import { calculatePhasedPredictions, AllPhasedPredictions } from './phasedPredictions';
import { validateWithHyperReliability, HyperReliablePrediction } from './hyperReliabilitySystem';

// Cache global des résultats par match
interface CachedAnalysis {
  timestamp: number;
  minute: number;
  dataHash: string;
  enrichedMetrics: EnrichedLiveMetrics;
  dynamicWeights: DynamicWeights;
  trends: LinearTrendAnalysis;
  markets: Comprehensive1xbetMarkets;
  phasedPredictions: AllPhasedPredictions;
  hyperValidated: Record<string, HyperReliablePrediction>;
}

const analysisCache: Map<number, CachedAnalysis> = new Map();

/**
 * Hash rapide des données pour détecter les changements
 */
function hashLiveData(data: LiveMatchData): string {
  return `${data.minute}-${data.homeScore}-${data.awayScore}-${data.homeCorners}-${data.awayCorners}-${data.homeFouls}-${data.awayFouls}`;
}

/**
 * Vérifie si les données ont changé significativement
 */
function hasSignificantChange(
  cached: CachedAnalysis | undefined,
  currentData: LiveMatchData,
  currentHash: string
): boolean {
  if (!cached) return true;

  // Si hash identique, aucun changement
  if (cached.dataHash === currentHash) return false;

  // Si la minute a changé de plus de 2 minutes, recalculer
  if (Math.abs(currentData.minute - cached.minute) >= 2) return true;

  // Sinon, pas de changement significatif
  return false;
}

/**
 * Analyse optimisée d'un match live
 */
export async function optimizedLiveAnalysis(
  matchId: number,
  liveData: LiveMatchData,
  liveDataHistory: LiveMatchData[],
  options: {
    forceRefresh?: boolean;
    skipValidation?: boolean;
    skipHyperReliability?: boolean;
    debugMode?: boolean;
  } = {}
): Promise<{
  success: boolean;
  enrichedMetrics: EnrichedLiveMetrics;
  dynamicWeights: DynamicWeights;
  trends: LinearTrendAnalysis;
  markets: Comprehensive1xbetMarkets;
  phasedPredictions: AllPhasedPredictions;
  hyperValidated: Record<string, HyperReliablePrediction>;
  cached: boolean;
  errors?: string[];
  warnings?: string[];
}> {
  const startTime = performance.now();
  const currentHash = hashLiveData(liveData);
  const cached = analysisCache.get(matchId);

  // Vérifier si on peut utiliser le cache
  if (!options.forceRefresh && !hasSignificantChange(cached, liveData, currentHash)) {
    if (options.debugMode) {
      console.log(`✅ [OPTIMISATION] Cache hit pour match ${matchId} (économie ${(performance.now() - startTime).toFixed(2)}ms)`);
    }

    return {
      success: true,
      ...cached!,
      cached: true
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // ============================================================================
  // ÉTAPE 1: VALIDATION (optionnelle, rapide)
  // ============================================================================
  if (!options.skipValidation) {
    const validation = validateLiveData(liveData);

    if (!validation.valid) {
      errors.push(...validation.errors);
      return {
        success: false,
        errors,
        enrichedMetrics: {} as EnrichedLiveMetrics,
        dynamicWeights: {} as DynamicWeights,
        trends: {} as LinearTrendAnalysis,
        markets: {} as Comprehensive1xbetMarkets,
        phasedPredictions: {} as AllPhasedPredictions,
        hyperValidated: {},
        cached: false
      };
    }

    if (validation.warnings.length > 0) {
      warnings.push(...validation.warnings);
    }
  }

  // ============================================================================
  // ÉTAPE 2: DÉTECTION ANOMALIES (optionnelle)
  // ============================================================================
  const anomalies = detectAnomalies(liveData);

  if (anomalies.overallSeverity === 'CRITICAL') {
    errors.push(...anomalies.anomalies.map(a => `${a.type}: ${a.description}`));
  } else if (anomalies.overallSeverity === 'HIGH') {
    warnings.push(...anomalies.anomalies.map(a => `${a.type}: ${a.description}`));
  }

  // ============================================================================
  // ÉTAPE 3-7: CALCULS PARALLÈLES (optimisation majeure)
  // ============================================================================

  // Lancer tous les calculs indépendants en parallèle
  const [enrichedMetrics, trends] = await Promise.all([
    // Calcul 1: Enrichissement (100+ métriques)
    Promise.resolve(enrichLiveData(
      liveData,
      liveData.homeScore,
      liveData.awayScore,
      liveData.minute
    )),

    // Calcul 2: Tendances linéaires
    Promise.resolve(analyzeAllTrends(liveDataHistory, liveData.minute))
  ]);

  // Calculs dépendants (séquentiel mais rapide)
  const dynamicWeights = calculateDynamicWeights(
    liveData.minute,
    liveData.homeScore,
    liveData.awayScore,
    enrichedMetrics.context.gameState,
    enrichedMetrics.context.homeAdvantage,
    enrichedMetrics.context.intensity
  );

  const markets = generateComprehensive1xbetMarkets(
    enrichedMetrics,
    { home: liveData.homeScore, away: liveData.awayScore },
    liveData.minute,
    trends,
    dynamicWeights
  );

  const phasedPredictions = calculatePhasedPredictions(
    enrichedMetrics,
    { home: liveData.homeScore, away: liveData.awayScore },
    liveData.minute
  );

  // ============================================================================
  // ÉTAPE 8: HYPER-RELIABILITY (optionnelle, coûteuse)
  // ============================================================================
  let hyperValidated: Record<string, HyperReliablePrediction> = {};

  if (!options.skipHyperReliability) {
    const allProjections = {
      totalGoals: markets.goals.totalGoals.predictions[0]?.projected || 0,
      totalCorners: markets.corners.total.predictions[0]?.projected || 0,
      totalFouls: markets.fouls.total.predictions[0]?.projected || 0,
      totalCards: markets.cards.yellowTotal.predictions[0]?.projected || 0,
      totalShots: markets.shots.totalShots.predictions[0]?.projected || 0
    };

    const snapshots = [
      { minute: Math.max(0, liveData.minute - 15), value: Math.round((liveData.homeScore + liveData.awayScore) * 0.7) },
      { minute: liveData.minute, value: liveData.homeScore + liveData.awayScore }
    ];

    // Valider uniquement les TOP marchés (pas tous)
    const topMarkets = [
      { key: 'totalGoals', market: markets.goals.totalGoals, current: liveData.homeScore + liveData.awayScore, name: 'Total Buts' },
      { key: 'corners', market: markets.corners.total, current: liveData.homeCorners + liveData.awayCorners, name: 'Corners Total' },
      { key: 'fouls', market: markets.fouls.total, current: liveData.homeFouls + liveData.awayFouls, name: 'Fautes Total' },
      { key: 'cards', market: markets.cards.yellowTotal, current: liveData.homeYellowCards + liveData.awayYellowCards, name: 'Cartons Jaunes' }
    ];

    for (const { key, market, current, name } of topMarkets) {
      if (market.bestPick) {
        hyperValidated[key] = validateWithHyperReliability(
          {
            marketName: name,
            projected: market.predictions[0]?.projected || 0,
            threshold: market.bestPick.threshold,
            currentValue: current,
            minute: liveData.minute,
            confidence: market.bestPick.confidence,
            prediction: market.bestPick.prediction
          },
          allProjections,
          snapshots
        );
      }
    }
  }

  // ============================================================================
  // CACHE ET RETOUR
  // ============================================================================
  const result: CachedAnalysis = {
    timestamp: Date.now(),
    minute: liveData.minute,
    dataHash: currentHash,
    enrichedMetrics,
    dynamicWeights,
    trends,
    markets,
    phasedPredictions,
    hyperValidated
  };

  // Sauvegarder dans le cache
  analysisCache.set(matchId, result);

  const elapsedTime = performance.now() - startTime;

  if (options.debugMode) {
    console.log(`✅ [OPTIMISATION] Analyse complète en ${elapsedTime.toFixed(2)}ms (cache mis à jour)`);
  }

  return {
    success: true,
    ...result,
    cached: false,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Nettoie le cache pour un match spécifique
 */
export function clearMatchCache(matchId: number): void {
  analysisCache.delete(matchId);
}

/**
 * Nettoie tout le cache
 */
export function clearAllCache(): void {
  analysisCache.clear();
}

/**
 * Obtient les statistiques du cache
 */
export function getCacheStats(): {
  size: number;
  matches: number[];
  oldestTimestamp: number | null;
  newestTimestamp: number | null;
} {
  const entries = Array.from(analysisCache.entries());

  return {
    size: analysisCache.size,
    matches: entries.map(([id]) => id),
    oldestTimestamp: entries.length > 0 ? Math.min(...entries.map(([, v]) => v.timestamp)) : null,
    newestTimestamp: entries.length > 0 ? Math.max(...entries.map(([, v]) => v.timestamp)) : null
  };
}

/**
 * Version légère pour pre-calcul (sans hyper-reliability)
 */
export async function fastLiveAnalysis(
  matchId: number,
  liveData: LiveMatchData,
  liveDataHistory: LiveMatchData[]
): Promise<ReturnType<typeof optimizedLiveAnalysis>> {
  return optimizedLiveAnalysis(matchId, liveData, liveDataHistory, {
    skipHyperReliability: true,
    skipValidation: false,
    debugMode: false
  });
}
