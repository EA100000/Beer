import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, TrendingUp, Target, AlertTriangle, DollarSign, Sparkles } from 'lucide-react';
import {
  detectTop10Predictions,
  calculateTop10ROI,
  type Top10Result,
  type Top10Prediction
} from '@/utils/top10Predictions';
import { TeamStats } from '@/types/football';

interface Top10PredictionsPanelProps {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  homeOdds?: number;
  awayOdds?: number;
  bankroll?: number;
}

export function Top10PredictionsPanel({
  homeTeam,
  awayTeam,
  homeOdds,
  awayOdds,
  bankroll = 1000
}: Top10PredictionsPanelProps) {
  // Détecter les prédictions Top 10
  const result: Top10Result = detectTop10Predictions(homeTeam, awayTeam, homeOdds, awayOdds);

  // Calculer ROI
  const roi = result.total_count > 0
    ? calculateTop10ROI(result.predictions_found, bankroll)
    : null;

  // Icônes par catégorie
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'RESULT':
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 'SHOTS':
      case 'SHOTS_ON_TARGET':
        return <Target className="h-5 w-5 text-blue-600" />;
      case 'YELLOW_CARDS':
        return <span className="text-xl">🟨</span>;
      case 'RED_CARDS':
        return <span className="text-xl">🟥</span>;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  // Badge de précision
  const getPrecisionBadge = (precision: number) => {
    if (precision >= 87) {
      return <Badge className="bg-purple-600 text-white">🏆 {precision}% EXCEPTIONNEL</Badge>;
    } else if (precision >= 85) {
      return <Badge className="bg-green-600 text-white">⭐ {precision}% EXCELLENT</Badge>;
    } else {
      return <Badge className="bg-blue-600 text-white">{precision}%</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Alert */}
      {result.has_super_combo ? (
        <Alert className="border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <AlertDescription className="text-purple-900 font-bold text-lg">
            🎯 SUPER COMBO DÉTECTÉ ! {result.total_count} prédictions Top 10 disponibles !
          </AlertDescription>
        </Alert>
      ) : result.total_count > 0 ? (
        <Alert className="border-green-600 bg-green-50">
          <Trophy className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800 font-semibold">
            ✅ {result.total_count} prédiction(s) Top 10 détectée(s) (85-88% précision)
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-yellow-600 bg-yellow-50">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            ⚠️ Aucune prédiction Top 10 pour ce match. Conditions non remplies.
          </AlertDescription>
        </Alert>
      )}

      {/* Prédictions détectées */}
      {result.total_count > 0 && (
        <Card className="border-2 border-purple-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Trophy className="h-6 w-6" />
              Top 10 Prédictions - Les Plus Fiables
            </CardTitle>
            <CardDescription className="text-purple-700 font-medium">
              Basé sur 132,411 matchs analysés • Précision validée 85-88%
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Statistiques globales */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-purple-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600">Prédictions</p>
                <p className="text-3xl font-bold text-purple-700">{result.total_count}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Précision Moyenne</p>
                <p className="text-3xl font-bold text-green-700">
                  {result.combined_precision.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Excellentes</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {result.excellent_count}
                </p>
              </div>
            </div>

            {/* Liste des prédictions */}
            <div className="space-y-4">
              {result.predictions_found.map((pred: Top10Prediction, idx) => (
                <div
                  key={pred.id}
                  className="border-2 border-purple-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(pred.category)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-gray-900">
                            #{idx + 1} {pred.description}
                          </h3>
                          {getPrecisionBadge(pred.precision)}
                        </div>
                        <p className="text-sm text-purple-700 font-medium mt-1">
                          {pred.prediction}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pattern détecté */}
                  <div className="bg-blue-50 p-3 rounded-lg mb-3">
                    <p className="text-sm font-semibold text-blue-900">
                      📊 Pattern: {pred.pattern_detected}
                    </p>
                  </div>

                  {/* Statistiques */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Précision Validée</p>
                      <p className="text-xl font-bold text-green-700">
                        {pred.precision}%
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Mise Recommandée</p>
                      <p className="text-xl font-bold text-purple-700">
                        {pred.recommended_stake_pct}% = {(bankroll * pred.recommended_stake_pct / 100).toFixed(0)}€
                      </p>
                    </div>
                  </div>

                  {/* Moyenne observée */}
                  {pred.average_value && (
                    <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-yellow-900">
                        📈 Moyenne observée: <span className="font-bold">{pred.average_value}</span>
                      </p>
                    </div>
                  )}

                  {/* Raisonnement */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">💡 Analyse:</span> {pred.reasoning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ROI Analysis */}
      {roi && result.total_count > 0 && (
        <Card className="border-green-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <DollarSign className="h-5 w-5" />
              Analyse ROI - Combo Top 10
            </CardTitle>
            <CardDescription>
              Rentabilité attendue si vous pariez sur toutes les prédictions détectées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Mise Totale</p>
                <p className="text-2xl font-bold text-blue-700">
                  {roi.total_stake.toFixed(2)}€
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {((roi.total_stake / bankroll) * 100).toFixed(1)}% du bankroll
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Profit Attendu</p>
                <p className="text-2xl font-bold text-green-700">
                  +{roi.expected_profit.toFixed(2)}€
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Moyenne sur long terme
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">ROI</p>
                <p className="text-2xl font-bold text-purple-700">
                  {roi.roi_percentage.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Par série de paris
                </p>
              </div>
            </div>

            {roi.roi_percentage > 8 && (
              <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-sm text-green-800 font-semibold">
                  ✅ ROI {'>'} 8% : Combo TRÈS RENTABLE sur le long terme !
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Informations complémentaires */}
      {result.total_count === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-700">ℹ️ Conditions Top 10</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Pour détecter les prédictions Top 10, il faut :</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Cote favorite &lt; 1.5 (idéalement &lt; 1.3)</li>
                <li>OU Différence Elo &gt; 300</li>
                <li>OU 2 équipes fortes (Elo sum &gt; 3300)</li>
              </ul>
              <p className="mt-3 font-semibold text-gray-700">
                Ce match ne remplit pas ces conditions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Info */}
      <div className="text-xs text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
        <p>
          🏆 Top 10 Prédictions : Les plus fiables trouvées sur 132,411 matchs analysés
        </p>
        <p className="mt-1">
          Précision validée : 85-88% • Échantillons : 2,597 à 25,953 matchs
        </p>
      </div>
    </div>
  );
}
