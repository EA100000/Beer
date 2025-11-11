/**
 * Perfect Over/Under Display - Final Version
 * Displays all Over/Under predictions with perfect accuracy targeting
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PerfectThreshold } from '@/utils/perfectOverUnder';
import {
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Flag,
  AlertCircle,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface PerfectOverUnderDisplayProps {
  predictions: PerfectThreshold[];
  homeTeam: string;
  awayTeam: string;
}

export function PerfectOverUnderDisplay({ predictions, homeTeam, awayTeam }: PerfectOverUnderDisplayProps) {
  if (predictions.length === 0) {
    return (
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            Aucune Prédiction Over/Under Disponible
          </CardTitle>
          <CardDescription>
            Données insuffisantes pour générer des prédictions fiables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Raisons possibles:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Statistiques d'équipe incomplètes</li>
                  <li>Profil d'équipe non établi</li>
                  <li>Besoin de plus de données historiques</li>
                </ul>
                <p className="font-bold text-yellow-800 mt-3">
                  💡 Recommandation: Fournir plus de statistiques d'équipe
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Group predictions by category
  const groupedPredictions = predictions.reduce((acc, pred) => {
    if (!acc[pred.category]) {
      acc[pred.category] = [];
    }
    acc[pred.category].push(pred);
    return acc;
  }, {} as Record<string, PerfectThreshold[]>);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'VERY_HIGH':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'HIGH':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'VERY_HIGH':
        return <CheckCircle className="h-4 w-4" />;
      case 'HIGH':
        return <Target className="h-4 w-4" />;
      case 'MEDIUM':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 70) return 'text-blue-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getPredictionIcon = (prediction: string) => {
    if (prediction === 'OVER' || prediction === 'YES') {
      return <TrendingUp className="h-5 w-5 text-green-600" />;
    } else if (prediction === 'UNDER' || prediction === 'NO') {
      return <TrendingDown className="h-5 w-5 text-blue-600" />;
    }
    return <Target className="h-5 w-5 text-gray-600" />;
  };

  const getPredictionColor = (prediction: string) => {
    if (prediction === 'OVER' || prediction === 'YES') {
      return '#22c55e'; // green
    } else if (prediction === 'UNDER' || prediction === 'NO') {
      return '#3b82f6'; // blue
    }
    return '#9ca3af'; // gray
  };

  // Count high-confidence BET recommendations
  const betCount = predictions.filter(p => p.recommendation === 'BET').length;
  const considerCount = predictions.filter(p => p.recommendation === 'CONSIDER').length;

  const categoryIcons: Record<string, any> = {
    'Buts': '⚽',
    'Corners': '🚩',
    'Fautes': '⚠️',
    'Cartons Jaunes': '🟨',
    'Tirs Cadrés': '🎯',
    'Touches': '🤾',
    'BTTS': '⚽⚽',
    'Équipe +1.5 Buts': '🔥'
  };

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Target className="h-6 w-6" />
          Prédictions Over/Under - SYSTÈME PARFAIT
        </CardTitle>
        <CardDescription className="text-base">
          {homeTeam} vs {awayTeam} - Toutes les prédictions statistiquement solides
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Banner */}
        <Alert className="bg-gradient-to-r from-green-100 to-blue-100 border-green-300">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-green-800 text-lg">
                  ✅ {predictions.length} PRÉDICTIONS GÉNÉRÉES
                </span>
                <p className="text-sm text-green-700 mt-1">
                  {betCount} recommandées BET • {considerCount} à considérer
                </p>
              </div>
              <div className="flex gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{betCount}</div>
                  <div className="text-xs text-green-700">BET</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{considerCount}</div>
                  <div className="text-xs text-blue-700">CONSIDER</div>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Predictions grouped by category */}
        {Object.entries(groupedPredictions).map(([category, preds]) => (
          <div key={category} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center gap-2 border-b-2 border-gray-200 pb-2">
              <span className="text-2xl">{categoryIcons[category] || '📊'}</span>
              <h3 className="text-lg font-bold text-gray-800">{category}</h3>
              <Badge variant="outline" className="ml-auto">
                {preds.length} prédiction{preds.length > 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Predictions in this category */}
            <div className="grid gap-3">
              {preds.map((pred, index) => (
                <Card
                  key={index}
                  className="border-2 hover:shadow-lg transition-all duration-200"
                  style={{
                    borderColor: pred.confidence === 'VERY_HIGH' ? '#22c55e' :
                                 pred.confidence === 'HIGH' ? '#3b82f6' :
                                 pred.confidence === 'MEDIUM' ? '#eab308' : '#9ca3af'
                  }}
                >
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getPredictionIcon(pred.prediction)}
                        <div>
                          <div className="font-bold text-base">{pred.metric}</div>
                          {pred.threshold > 0 && (
                            <div className="text-xs text-gray-500">
                              Seuil: {pred.threshold}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={getConfidenceColor(pred.confidence)}>
                        {getConfidenceIcon(pred.confidence)}
                        <span className="ml-1">{pred.confidence.replace('_', ' ')}</span>
                      </Badge>
                    </div>

                    {/* Main Prediction */}
                    <div
                      className="bg-white rounded-lg p-4 mb-3 border-2 border-dashed"
                      style={{ borderColor: getPredictionColor(pred.prediction) }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Prédiction</div>
                          <div
                            className="text-3xl font-bold"
                            style={{ color: getPredictionColor(pred.prediction) }}
                          >
                            {pred.prediction}
                            {pred.threshold > 0 && ` ${pred.threshold}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-1">Probabilité</div>
                          <div className={`text-4xl font-bold ${getProbabilityColor(pred.probability)}`}>
                            {pred.probability.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expected Value */}
                    {pred.expectedValue > 0 && (
                      <div className="bg-purple-50 rounded-lg p-3 mb-3 border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-semibold text-purple-800">
                              Valeur Attendue
                            </span>
                          </div>
                          <div className="text-lg font-bold text-purple-600">
                            {pred.expectedValue.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reasoning */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 mb-3">
                      <div className="text-sm font-semibold text-gray-700 mb-2">📊 Analyse:</div>
                      {pred.reasoning.map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span className="text-gray-700">{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* Recommendation */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={pred.recommendation === 'BET' ? 'default' :
                                pred.recommendation === 'CONSIDER' ? 'secondary' : 'outline'}
                        className={
                          pred.recommendation === 'BET'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : pred.recommendation === 'CONSIDER'
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-gray-400 text-white'
                        }
                      >
                        {pred.recommendation === 'BET' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            PARIER
                          </>
                        ) : pred.recommendation === 'CONSIDER' ? (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            À CONSIDÉRER
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            SKIP
                          </>
                        )}
                      </Badge>

                      {pred.probability >= 75 && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                          ⭐ CONFIANCE ÉLEVÉE
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Strategic Advice */}
        <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <Flag className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="text-sm space-y-2">
              <p className="font-bold text-blue-800">💡 Stratégie de Paris Recommandée:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 ml-2">
                <li><strong>BET:</strong> Parier avec confiance (probabilité {'>'} 70%)</li>
                <li><strong>CONSIDER:</strong> Analyser davantage, miser petit pour tester</li>
                <li><strong>SKIP:</strong> Éviter, probabilité trop faible ou données insuffisantes</li>
                <li><strong>Gestion:</strong> Ne jamais miser plus de 2-5% du bankroll par pari</li>
                <li><strong>Validation:</strong> Tracker tous les résultats pour améliorer le système</li>
              </ul>
              <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                <p className="font-bold text-blue-900 mb-1">🎯 Focus sur les paris à haute valeur:</p>
                <p className="text-sm text-blue-800">
                  Privilégier les prédictions avec <strong>Probabilité {'>'} 70%</strong> ET{' '}
                  <strong>Valeur Attendue {'>'} 0</strong> pour maximiser les gains à long terme.
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* System Info */}
        <div className="text-center text-xs text-gray-500 mt-4">
          Système de Prédiction Perfect Over/Under v2.0 - Basé sur profilage statistique avancé et corrélations validées
        </div>
      </CardContent>
    </Card>
  );
}
