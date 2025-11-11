/**
 * Affichage de l'analyse améliorée avec:
 * - Ratings SofaScore
 * - Impact du contexte
 * - Matches historiques similaires
 * - Recommandations
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedAnalysisResult } from '@/utils/enhancedPredictionEngine';
import { TrendingUp, TrendingDown, Minus, Trophy, AlertCircle, History, Target } from 'lucide-react';

interface EnhancedAnalysisDisplayProps {
  analysis: EnhancedAnalysisResult;
}

export function EnhancedAnalysisDisplay({ analysis }: EnhancedAnalysisDisplayProps) {
  const { sofascoreRatings, matchContext, contextualRecommendations, similarMatches, calibrationData } = analysis;

  // Icône selon l'avantage
  const getAdvantageIcon = () => {
    switch (sofascoreRatings.advantage) {
      case 'HOME':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'AWAY':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getImportanceBadgeColor = (importance: string) => {
    switch (importance) {
      case 'FINALE':
      case 'DERBY':
        return 'destructive';
      case 'COUPE_INTERNATIONALE':
      case 'PLAY_OFF':
        return 'default';
      case 'RELEGATION_BATTLE':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Ratings SofaScore */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Ratings SofaScore
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{analysis.homeTeam.name}</div>
              <div className="text-3xl font-bold text-blue-600">
                {sofascoreRatings.home.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 mt-1">/ 10</div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
              {getAdvantageIcon()}
              <div className="text-sm font-semibold mt-2">
                {sofascoreRatings.advantage === 'BALANCED' ? 'Équilibré' :
                 sofascoreRatings.advantage === 'HOME' ? 'Avantage Domicile' : 'Avantage Extérieur'}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Diff: {Math.abs(sofascoreRatings.difference).toFixed(2)}
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{analysis.awayTeam.name}</div>
              <div className="text-3xl font-bold text-orange-600">
                {sofascoreRatings.away.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 mt-1">/ 10</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            <strong>Explication:</strong> Ratings calculés selon l'algorithme SofaScore (base 6.5,
            ajusté par buts, assists, tacles, interceptions, possession, discipline, etc.)
          </div>
        </CardContent>
      </Card>

      {/* Contexte du Match */}
      {matchContext && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Contexte du Match
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant={getImportanceBadgeColor(matchContext.importance)}>
                {matchContext.importance.replace(/_/g, ' ')}
              </Badge>
              <Badge variant="outline">{matchContext.competitionLevel}</Badge>
              {matchContext.isDerby && (
                <Badge variant="destructive">
                  DERBY {matchContext.rivalryIntensity && `(${matchContext.rivalryIntensity})`}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold">{analysis.homeTeam.name}</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Motivation:</span>
                    <span className="font-medium">{matchContext.homeTeamMotivation}/100</span>
                  </div>
                  {matchContext.isHomeTeamChampionshipContender && (
                    <div className="text-yellow-600 font-medium">Course au titre</div>
                  )}
                  {matchContext.isHomeTeamFightingRelegation && (
                    <div className="text-red-600 font-medium">Lutte relégation</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold">{analysis.awayTeam.name}</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Motivation:</span>
                    <span className="font-medium">{matchContext.awayTeamMotivation}/100</span>
                  </div>
                  {matchContext.isAwayTeamChampionshipContender && (
                    <div className="text-yellow-600 font-medium">Course au titre</div>
                  )}
                  {matchContext.isAwayTeamFightingRelegation && (
                    <div className="text-red-600 font-medium">Lutte relégation</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommandations Contextuelles */}
      {contextualRecommendations && contextualRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Recommandations Contextuelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contextualRecommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matches Historiques Similaires */}
      {similarMatches && similarMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Matches Historiques Similaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {similarMatches.map((match, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">{match.teams}</div>
                    <div className="text-xs text-gray-600">{match.context}</div>
                  </div>
                  <div className="text-lg font-bold text-gray-700">{match.result}</div>
                </div>
              ))}

              {calibrationData && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-semibold mb-2">Statistiques moyennes (matches similaires):</div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Buts</div>
                      <div className="font-bold">{calibrationData.averageGoalsInSimilarMatches.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Corners</div>
                      <div className="font-bold">{calibrationData.averageCornersInSimilarMatches.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">BTTS</div>
                      <div className="font-bold">{calibrationData.bttsPercentageInSimilarMatches.toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prédictions Finales */}
      <Card>
        <CardHeader>
          <CardTitle>Prédictions Ajustées au Contexte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Buts Attendus</div>
              <div className="text-xl font-bold text-green-600">
                {(analysis.prediction.expectedGoals.home + analysis.prediction.expectedGoals.away).toFixed(2)}
              </div>
            </div>

            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Corners</div>
              <div className="text-xl font-bold text-blue-600">
                {analysis.prediction.corners.predicted.toFixed(1)}
              </div>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Fautes</div>
              <div className="text-xl font-bold text-yellow-600">
                {analysis.prediction.fouls.predicted.toFixed(1)}
              </div>
            </div>

            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Cartons</div>
              <div className="text-xl font-bold text-red-600">
                {analysis.prediction.yellowCards.predicted.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-semibold mb-2">Over/Under 2.5</div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {analysis.prediction.overUnder25Goals.prediction}
                </span>
                <span className="text-2xl font-bold">
                  {analysis.prediction.overUnder25Goals[
                    analysis.prediction.overUnder25Goals.prediction.toLowerCase() as 'over' | 'under'
                  ].toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="text-sm font-semibold mb-2">BTTS</div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {analysis.prediction.btts.prediction}
                </span>
                <span className="text-2xl font-bold">
                  {analysis.prediction.btts[
                    analysis.prediction.btts.prediction.toLowerCase() as 'yes' | 'no'
                  ].toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
