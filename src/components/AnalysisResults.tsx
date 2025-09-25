import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchPrediction } from '@/types/football';
import { TrendingUp, Target, CornerDownRight, Hand, AlertTriangle, BarChart3, Trophy, Brain, Zap, Calendar } from 'lucide-react';

interface AnalysisResultsProps {
  prediction: MatchPrediction;
  confidence: number;
}

export function AnalysisResults({ prediction, confidence }: AnalysisResultsProps) {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'bg-green-500';
    if (conf >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPredictionColor = (value: number, threshold: number = 50) => {
    return value > threshold ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Confidence and Model Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-accent/30 bg-gradient-field shadow-strong">
          <CardHeader className="bg-gradient-gold text-accent-foreground rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Confiance du Modèle
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confiance Globale</span>
                <span className="text-2xl font-bold text-primary">{prediction.modelMetrics.confidence}%</span>
              </div>
              <Progress value={prediction.modelMetrics.confidence} className="h-3" />
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-accent">{prediction.modelMetrics.dataQuality}%</div>
                  <div className="text-xs text-muted-foreground">Qualité Données</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary-glow">{prediction.modelMetrics.modelAgreement}%</div>
                  <div className="text-xs text-muted-foreground">Accord Modèles</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-gradient-field shadow-strong">
          <CardHeader className="bg-gradient-pitch text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Force des Équipes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Force Domicile:</span>
                <span className="text-xl font-bold text-primary">{prediction.modelMetrics.homeStrength}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Force Extérieur:</span>
                <span className="text-xl font-bold text-primary-glow">{prediction.modelMetrics.awayStrength}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="text-center">
                  <div className="text-lg font-bold text-accent">{prediction.modelMetrics.statisticalSignificance}%</div>
                  <div className="text-xs text-muted-foreground">Signification Statistique</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analysis Tabs */}
      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="scorelines">Scores Probables</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-6">

          {/* Win Probabilities */}
          <Card className="border-primary/30 bg-gradient-field shadow-soft">
            <CardHeader className="bg-gradient-pitch text-primary-foreground rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Probabilités de Victoire
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {prediction.winProbabilities.home.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Domicile</div>
                  <Progress value={prediction.winProbabilities.home} className="mt-2 h-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {prediction.winProbabilities.draw.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Match Nul</div>
                  <Progress value={prediction.winProbabilities.draw} className="mt-2 h-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-glow mb-1">
                    {prediction.winProbabilities.away.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Extérieur</div>
                  <Progress value={prediction.winProbabilities.away} className="mt-2 h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Goals Prediction */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-primary/30 bg-gradient-field shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Buts Attendus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Domicile:</span>
                    <span className="text-xl font-bold text-primary">
                      {prediction.expectedGoals.home}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Extérieur:</span>
                    <span className="text-xl font-bold text-primary-glow">
                      {prediction.expectedGoals.away}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      Total: {(prediction.expectedGoals.home + prediction.expectedGoals.away).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-gradient-field shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Plus/Moins 1.5</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Plus de 1.5:</span>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {prediction.overUnder15Goals.over.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Moins de 1.5:</span>
                    <Badge variant="outline" className="text-lg font-bold">
                      {prediction.overUnder15Goals.under.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <Badge 
                      variant={prediction.overUnder15Goals.prediction === 'OVER' ? 'default' : 'secondary'}
                      className="w-full justify-center py-2"
                    >
                      {prediction.overUnder15Goals.prediction === 'OVER' ? 'PLUS' : 'MOINS'} DE 1.5
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-gradient-field shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Plus/Moins 2.5</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Plus de 2.5:</span>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {prediction.overUnder25Goals.over.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Moins de 2.5:</span>
                    <Badge variant="outline" className="text-lg font-bold">
                      {prediction.overUnder25Goals.under.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <Badge 
                      variant={prediction.overUnder25Goals.prediction === 'OVER' ? 'default' : 'secondary'}
                      className="w-full justify-center py-2"
                    >
                      {prediction.overUnder25Goals.prediction === 'OVER' ? 'PLUS' : 'MOINS'} DE 2.5
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BTTS Prediction */}
          <Card className="border-accent/30 bg-gradient-field shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Les Deux Équipes Marquent (BTTS)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {prediction.btts.yes.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">OUI</div>
                  <Progress value={prediction.btts.yes} className="mt-2 h-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {prediction.btts.no.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">NON</div>
                  <Progress value={prediction.btts.no} className="mt-2 h-2" />
                </div>
              </div>
              <div className="pt-4">
                <Badge 
                  variant={prediction.btts.prediction === 'YES' ? 'default' : 'secondary'}
                  className="w-full justify-center py-2"
                >
                  PRÉDICTION: {prediction.btts.prediction === 'YES' ? 'OUI' : 'NON'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">

          {/* Enhanced Event Predictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-accent/30 bg-gradient-field shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CornerDownRight className="h-4 w-4" />
                  Corners
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {prediction.corners.predicted}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Prédiction
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Plus de {prediction.corners.threshold}:</span>
                    <span className="font-bold">{prediction.corners.over}%</span>
                  </div>
                  <Progress value={prediction.corners.over} className="h-2" />
                  <div className="text-xs text-center text-muted-foreground">
                    Confiance: {prediction.corners.confidence}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/30 bg-gradient-field shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Hand className="h-4 w-4" />
                  Touches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {prediction.throwIns.predicted}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Prédiction
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Plus de {prediction.throwIns.threshold}:</span>
                    <span className="font-bold">{prediction.throwIns.over}%</span>
                  </div>
                  <Progress value={prediction.throwIns.over} className="h-2" />
                  <div className="text-xs text-center text-muted-foreground">
                    Confiance: {prediction.throwIns.confidence}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/30 bg-gradient-field shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4" />
                  Fautes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {prediction.fouls.predicted}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Prédiction
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Plus de {prediction.fouls.threshold}:</span>
                    <span className="font-bold">{prediction.fouls.over}%</span>
                  </div>
                  <Progress value={prediction.fouls.over} className="h-2" />
                  <div className="text-xs text-center text-muted-foreground">
                    Confiance: {prediction.fouls.confidence}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/30 bg-gradient-field shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Cartons Jaunes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {prediction.yellowCards.predicted}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cartons Jaunes
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Plus de {prediction.yellowCards.threshold}:</span>
                    <span className="font-bold">{prediction.yellowCards.over}%</span>
                  </div>
                  <Progress value={prediction.yellowCards.over} className="h-2" />
                  <div className="text-xs text-center text-muted-foreground">
                    Confiance: {prediction.yellowCards.confidence}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/30 bg-gradient-field shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Cartons Rouges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {prediction.redCards.predicted}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cartons Rouges
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Plus de {prediction.redCards.threshold}:</span>
                    <span className="font-bold">{prediction.redCards.over}%</span>
                  </div>
                  <Progress value={prediction.redCards.over} className="h-2" />
                  <div className="text-xs text-center text-muted-foreground">
                    Confiance: {prediction.redCards.confidence}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/30 bg-gradient-field shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4" />
                  Duels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {prediction.duels.predicted}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Duels Remportés
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Plus de {prediction.duels.threshold}:</span>
                    <span className="font-bold">{prediction.duels.over}%</span>
                  </div>
                  <Progress value={prediction.duels.over} className="h-2" />
                  <div className="text-xs text-center text-muted-foreground">
                    Confiance: {prediction.duels.confidence}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/30 bg-gradient-field shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4" />
                  Hors-jeux
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {prediction.offsides.predicted}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Hors-jeux
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Plus de {prediction.offsides.threshold}:</span>
                    <span className="font-bold">{prediction.offsides.over}%</span>
                  </div>
                  <Progress value={prediction.offsides.over} className="h-2" />
                  <div className="text-xs text-center text-muted-foreground">
                    Confiance: {prediction.offsides.confidence}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/30 bg-gradient-field shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CornerDownRight className="h-4 w-4" />
                  Coups de Pied de But
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {prediction.goalKicks.predicted}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Coups de Pied de But
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Plus de {prediction.goalKicks.threshold}:</span>
                    <span className="font-bold">{prediction.goalKicks.over}%</span>
                  </div>
                  <Progress value={prediction.goalKicks.over} className="h-2" />
                  <div className="text-xs text-center text-muted-foreground">
                    Confiance: {prediction.goalKicks.confidence}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scorelines" className="space-y-6">
          {/* Most Likely Scorelines */}
          <Card className="border-primary/30 bg-gradient-field shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Scores Les Plus Probables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {prediction.mostLikelyScorelines.map((scoreline, index) => (
                  <div key={index} className="text-center p-4 rounded-lg bg-card border border-border">
                    <div className="text-2xl font-bold text-primary mb-2">
                      {scoreline.score}
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {scoreline.probability.toFixed(1)}%
                    </div>
                    <Progress value={scoreline.probability} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {/* Advanced Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-accent/30 bg-gradient-field shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Métriques Avancées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{prediction.advancedMetrics.expectedShotsOnTarget}</div>
                    <div className="text-xs text-muted-foreground">Tirs Cadrés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-accent">{prediction.advancedMetrics.expectedBigChances}</div>
                    <div className="text-xs text-muted-foreground">Grosses Occasions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary-glow">{prediction.advancedMetrics.possessionPrediction}%</div>
                    <div className="text-xs text-muted-foreground">Possession Dom.</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-accent">{prediction.advancedMetrics.intensityScore}</div>
                    <div className="text-xs text-muted-foreground">Score Intensité</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-gradient-field shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Évaluation Qualité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Note de Valeur:</span>
                    <span className="text-lg font-bold text-primary">{prediction.advancedMetrics.valueRating}/100</span>
                  </div>
                  <Progress value={prediction.advancedMetrics.valueRating} className="h-2" />
                  
                  <div className="pt-2 border-t border-border">
                    <div className="text-center">
                      <Badge variant={prediction.advancedMetrics.valueRating > 70 ? 'default' : 'secondary'} className="px-4 py-2">
                        {prediction.advancedMetrics.valueRating > 80 ? 'EXCELLENT' : 
                         prediction.advancedMetrics.valueRating > 60 ? 'BON' : 'MOYEN'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}