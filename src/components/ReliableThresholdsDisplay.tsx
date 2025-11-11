/**
 * Affichage des seuils fiables - UNIQUEMENT les prédictions solides
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReliableThreshold } from '@/utils/reliableThresholds';
import { Target, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ReliableThresholdsDisplayProps {
  thresholds: ReliableThreshold[];
}

export function ReliableThresholdsDisplay({ thresholds }: ReliableThresholdsDisplayProps) {
  if (thresholds.length === 0) {
    return (
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            Aucun Seuil Fiable Détecté
          </CardTitle>
          <CardDescription>
            Les données ne permettent pas d'identifier de prédictions statistiquement solides
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Raisons possibles:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Données insuffisantes pour profiler les équipes</li>
                  <li>Match trop équilibré (pas de tendance claire)</li>
                  <li>Besoin de plus de statistiques</li>
                </ul>
                <p className="font-bold text-yellow-800 mt-3">
                  💡 Recommandation: SKIP ce match ou attendre plus d'informations
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'VERY_HIGH':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'HIGH':
        return 'bg-blue-100 text-blue-800 border-blue-300';
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
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 70) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Target className="h-6 w-6" />
          Seuils Fiables - Statistiquement Solides
        </CardTitle>
        <CardDescription>
          Uniquement les prédictions avec haute probabilité (75-85%)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bannière de succès */}
        <Alert className="bg-green-100 border-green-300">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <span className="font-bold text-green-800">
              ✅ {thresholds.length} PRÉDICTION{thresholds.length > 1 ? 'S' : ''} FIABLE{thresholds.length > 1 ? 'S' : ''} DÉTECTÉE{thresholds.length > 1 ? 'S' : ''}
            </span>
            <p className="text-sm text-green-700 mt-1">
              Ces seuils sont basés sur le profilage statistique réel des équipes
            </p>
          </AlertDescription>
        </Alert>

        {/* Liste des seuils */}
        <div className="space-y-4">
          {thresholds.map((threshold, index) => (
            <Card
              key={index}
              className="border-2 hover:shadow-lg transition-shadow"
              style={{
                borderColor: threshold.confidence === 'VERY_HIGH' ? '#22c55e' :
                             threshold.confidence === 'HIGH' ? '#3b82f6' : '#9ca3af'
              }}
            >
              <CardContent className="p-4">
                {/* En-tête */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {threshold.prediction === 'OVER' ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-blue-600" />
                    )}
                    <span className="font-bold text-lg">{threshold.metric}</span>
                  </div>
                  <Badge className={getConfidenceColor(threshold.confidence)}>
                    {getConfidenceIcon(threshold.confidence)}
                    <span className="ml-1">{threshold.confidence.replace('_', ' ')}</span>
                  </Badge>
                </div>

                {/* Prédiction principale */}
                <div className="bg-white rounded-lg p-4 mb-3 border-2 border-dashed"
                     style={{
                       borderColor: threshold.prediction === 'OVER' ? '#22c55e' : '#3b82f6'
                     }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Prédiction</div>
                      <div className="text-2xl font-bold"
                           style={{
                             color: threshold.prediction === 'OVER' ? '#22c55e' : '#3b82f6'
                           }}>
                        {threshold.prediction} {threshold.threshold}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Probabilité</div>
                      <div className={`text-3xl font-bold ${getProbabilityColor(threshold.probability)}`}>
                        {threshold.probability.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analyse détaillée */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="text-sm font-semibold text-gray-700 mb-2">📊 Analyse:</div>
                  {threshold.reasoning.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span className="text-gray-700">{reason}</span>
                    </div>
                  ))}
                </div>

                {/* Recommandation */}
                <div className="mt-3 flex items-center justify-between">
                  <Badge
                    variant={threshold.recommendation === 'BET' ? 'default' : 'secondary'}
                    className={
                      threshold.recommendation === 'BET'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400'
                    }
                  >
                    {threshold.recommendation === 'BET' ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        PARIER
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        SKIP
                      </>
                    )}
                  </Badge>

                  {threshold.probability >= 80 && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                      ⭐ HAUTE CONFIANCE
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Conseils stratégiques */}
        <Alert className="bg-blue-50 border-blue-200">
          <Target className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="text-sm space-y-1">
              <p className="font-bold text-blue-800">💡 Stratégie Recommandée:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 ml-2">
                <li>Parier uniquement sur les seuils avec probabilité {'>'} 75%</li>
                <li>Privilégier les prédictions "VERY HIGH" et "HIGH"</li>
                <li>Commencer avec de petites mises pour valider</li>
                <li>Tracker vos résultats pour améliorer le système</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
