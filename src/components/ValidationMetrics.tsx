import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateModelAccuracy } from '@/utils/predictionValidator';
import { analyzeMatchAdvanced } from '@/utils/advancedFootballAnalysis';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle } from 'lucide-react';

interface ValidationMetricsProps {
  className?: string;
}

export const ValidationMetrics: React.FC<ValidationMetricsProps> = ({ className }) => {
  const [validationData, setValidationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runValidation = async () => {
      try {
        setIsLoading(true);
        const results = validateModelAccuracy(analyzeMatchAdvanced);
        setValidationData(results);
      } catch (err) {
        setError('Erreur lors de la validation du modèle');
        console.error('Validation error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    runValidation();
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Validation du Modèle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Validation en cours...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !validationData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Erreur de Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Impossible de charger les métriques de validation'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { metrics, recommendations } = validationData;

  // Données pour les graphiques
  const accuracyData = [
    { name: 'Over 1.5', accuracy: metrics.over15.accuracy, target: 70 },
    { name: 'Over 2.5', accuracy: metrics.over25.accuracy, target: 60 },
    { name: 'BTTS', accuracy: metrics.btts.accuracy, target: 65 },
    { name: 'Corners', accuracy: metrics.corners.accuracy, target: 55 },
    { name: 'Cards', accuracy: metrics.cards.accuracy, target: 50 },
    { name: 'Global', accuracy: metrics.overall.accuracy, target: 65 }
  ];

  const getAccuracyColor = (accuracy: number, target: number) => {
    if (accuracy >= target) return 'text-green-600';
    if (accuracy >= target - 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBadge = (accuracy: number, target: number) => {
    if (accuracy >= target) return 'bg-green-100 text-green-800';
    if (accuracy >= target - 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Métriques de Validation du Modèle
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Précision basée sur l'analyse de {metrics.overall.totalPredictions} prédictions
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Précision globale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Précision Globale</span>
              <Badge className={getAccuracyBadge(metrics.overall.accuracy, 65)}>
                {metrics.overall.accuracy.toFixed(1)}%
              </Badge>
            </div>
            <Progress 
              value={metrics.overall.accuracy} 
              className="h-2"
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {metrics.overall.accuracy >= 65 ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-red-600" />
              )}
              <span>
                {metrics.overall.accuracy >= 65 
                  ? 'Précision satisfaisante' 
                  : 'Précision insuffisante - Améliorations nécessaires'
                }
              </span>
            </div>
          </div>

          {/* Graphique de précision par type */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Précision par Type de Prédiction</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}%`, 
                    name === 'accuracy' ? 'Précision' : 'Objectif'
                  ]}
                />
                <Bar dataKey="accuracy" fill="#3b82f6" name="Précision" />
                <Bar dataKey="target" fill="#ef4444" name="Objectif" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Détail des métriques */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(metrics).map(([key, metric]: [string, any]) => {
              if (key === 'overall') return null;
              const target = key === 'over15' ? 70 : key === 'over25' ? 60 : key === 'btts' ? 65 : key === 'corners' ? 55 : 50;
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getAccuracyColor(metric.accuracy, target)}`}
                    >
                      {metric.accuracy.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress 
                    value={metric.accuracy} 
                    className="h-1"
                  />
                  <div className="text-xs text-muted-foreground">
                    {metric.correctPredictions}/{metric.totalPredictions} correctes
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommandations */}
          {recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Recommandations d'Amélioration
              </h4>
              <div className="space-y-2">
                {recommendations.map((recommendation: string, index: number) => (
                  <Alert key={index} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {recommendation}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Indicateurs de performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Indicateurs de Performance</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Prédictions Correctes:</span>
                  <span className="font-medium">{metrics.overall.correctPredictions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Prédictions:</span>
                  <span className="font-medium">{metrics.overall.totalPredictions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taux de Réussite:</span>
                  <span className="font-medium">
                    {((metrics.overall.correctPredictions / metrics.overall.totalPredictions) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Objectifs de Précision</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Over 1.5 Goals:</span>
                  <span className={getAccuracyColor(metrics.over15.accuracy, 70)}>
                    {metrics.over15.accuracy.toFixed(1)}% / 70%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Over 2.5 Goals:</span>
                  <span className={getAccuracyColor(metrics.over25.accuracy, 60)}>
                    {metrics.over25.accuracy.toFixed(1)}% / 60%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>BTTS:</span>
                  <span className={getAccuracyColor(metrics.btts.accuracy, 65)}>
                    {metrics.btts.accuracy.toFixed(1)}% / 65%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


