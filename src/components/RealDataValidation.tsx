import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateWithRealData, getRealTimeValidationData } from '@/utils/realDataValidator';
import { getPerfectMatchPredictions } from '@/utils/perfectMatchPredictions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Database, BarChart3 } from 'lucide-react';

export const RealDataValidation: React.FC = () => {
  const [validationData, setValidationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runValidation = async () => {
      try {
        setIsLoading(true);
        const results = validateWithRealData(getPerfectMatchPredictions);
        setValidationData(results);
      } catch (err) {
        setError('Erreur lors de la validation avec les données réelles');
        console.error('Real data validation error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    runValidation();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Validation avec Données Réelles
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
      <Card>
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
              {error || 'Impossible de charger les données de validation'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { accuracy, detailedResults, recommendations } = validationData;

  // Données pour les graphiques
  const accuracyData = [
    { name: 'Corners', accuracy: accuracy.corners, target: 60, color: '#3b82f6' },
    { name: 'Fautes', accuracy: accuracy.fouls, target: 55, color: '#ef4444' },
    { name: 'Cartons', accuracy: accuracy.cards, target: 50, color: '#f59e0b' },
    { name: 'Touches', accuracy: accuracy.throwIns, target: 55, color: '#10b981' },
    { name: 'Buts', accuracy: accuracy.goals, target: 70, color: '#8b5cf6' },
    { name: 'Global', accuracy: accuracy.overall, target: 65, color: '#06b6d4' }
  ];

  // Données de corrélation prédiction vs réalité
  const correlationData = detailedResults.map(result => ({
    match: result.match.split(' vs ')[0],
    corners: { actual: result.actual.corners, predicted: result.predicted.corners },
    fouls: { actual: result.actual.fouls, predicted: result.predicted.fouls },
    goals: { actual: result.actual.goals, predicted: result.predicted.goals }
  }));

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Validation avec Données Réelles
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Précision testée sur {detailedResults.length} matchs réels des 5 principales ligues européennes
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Précision globale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Précision Globale</span>
              <Badge className={getAccuracyBadge(accuracy.overall, 65)}>
                {accuracy.overall.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={accuracy.overall} className="h-2" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {accuracy.overall >= 65 ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-red-600" />
              )}
              <span>
                {accuracy.overall >= 65 
                  ? 'Précision satisfaisante sur les données réelles' 
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
            {Object.entries(accuracy).map(([key, value]: [string, number]) => {
              if (key === 'overall') return null;
              const target = key === 'goals' ? 70 : key === 'corners' ? 60 : key === 'fouls' || key === 'throwIns' ? 55 : 50;
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium capitalize">
                      {key === 'throwIns' ? 'Touches' : key}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getAccuracyColor(value, target)}`}
                    >
                      {value.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress 
                    value={value} 
                    className="h-1"
                  />
                  <div className="text-xs text-muted-foreground">
                    Objectif: {target}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Graphique de corrélation */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Corrélation Prédiction vs Réalité</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h5 className="text-xs font-medium">Corners</h5>
                <ResponsiveContainer width="100%" height={120}>
                  <ScatterChart data={correlationData}>
                    <CartesianGrid />
                    <XAxis dataKey="corners.actual" name="Réel" />
                    <YAxis dataKey="corners.predicted" name="Prédit" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter dataKey="corners" fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-xs font-medium">Fautes</h5>
                <ResponsiveContainer width="100%" height={120}>
                  <ScatterChart data={correlationData}>
                    <CartesianGrid />
                    <XAxis dataKey="fouls.actual" name="Réel" />
                    <YAxis dataKey="fouls.predicted" name="Prédit" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter dataKey="fouls" fill="#ef4444" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-xs font-medium">Buts</h5>
                <ResponsiveContainer width="100%" height={120}>
                  <ScatterChart data={correlationData}>
                    <CartesianGrid />
                    <XAxis dataKey="goals.actual" name="Réel" />
                    <YAxis dataKey="goals.predicted" name="Prédit" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter dataKey="goals" fill="#8b5cf6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
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

          {/* Résumé des performances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Performances par Statistique</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Corners (tolérance ±2):</span>
                  <span className={`font-medium ${getAccuracyColor(accuracy.corners, 60)}`}>
                    {accuracy.corners.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Fautes (tolérance ±3):</span>
                  <span className={`font-medium ${getAccuracyColor(accuracy.fouls, 55)}`}>
                    {accuracy.fouls.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cartons (tolérance ±1):</span>
                  <span className={`font-medium ${getAccuracyColor(accuracy.cards, 50)}`}>
                    {accuracy.cards.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Touches (tolérance ±4):</span>
                  <span className={`font-medium ${getAccuracyColor(accuracy.throwIns, 55)}`}>
                    {accuracy.throwIns.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Buts (tolérance ±0.5):</span>
                  <span className={`font-medium ${getAccuracyColor(accuracy.goals, 70)}`}>
                    {accuracy.goals.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Objectifs de Précision</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Précision Globale:</span>
                  <span className={`font-medium ${getAccuracyColor(accuracy.overall, 65)}`}>
                    {accuracy.overall.toFixed(1)}% / 65%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Matchs Testés:</span>
                  <span className="font-medium">{detailedResults.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ligues Couvertes:</span>
                  <span className="font-medium">5 (Premier League, Bundesliga, La Liga, Serie A, Ligue 1)</span>
                </div>
                <div className="flex justify-between">
                  <span>Période:</span>
                  <span className="font-medium">2023-2024</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


