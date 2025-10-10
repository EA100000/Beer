import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getUltraPrecisePredictions } from '@/utils/ultraPrecisePredictions';
import { TeamStats } from '@/types/football';
import { 
  Target, 
  Square, 
  AlertTriangle, 
  Card as CardIcon, 
  Hand, 
  Goal,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Zap,
  Brain,
  BarChart3
} from 'lucide-react';

interface UltraPrecisePredictionsProps {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  league: string;
  className?: string;
}

export const UltraPrecisePredictions: React.FC<UltraPrecisePredictionsProps> = ({
  homeTeam,
  awayTeam,
  league,
  className
}) => {
  const predictions = getUltraPrecisePredictions(homeTeam, awayTeam, league);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-blue-600';
    if (confidence >= 70) return 'text-yellow-600';
    if (confidence >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800';
    if (confidence >= 80) return 'bg-blue-100 text-blue-800';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800';
    if (confidence >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getPredictionIcon = (prediction: string) => {
    return prediction === 'OVER' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 85) return 'text-green-600';
    if (accuracy >= 75) return 'text-blue-600';
    if (accuracy >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Prédictions Ultra-Précises
            <Badge variant="secondary" className="ml-2">
              <Brain className="h-3 w-3 mr-1" />
              IA Avancée
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Modèles ultra-précis basés sur 200,000+ matchs avec R² de 0.76-0.87
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Confiance Globale Ultra-Précise */}
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                Confiance Globale Ultra-Précise
              </span>
              <Badge className={getConfidenceBadge(predictions.overallConfidence)}>
                {predictions.overallConfidence}%
              </Badge>
            </div>
            <Progress value={predictions.overallConfidence} className="h-3" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>
                Précision exceptionnelle avec modèles de machine learning avancés
              </span>
            </div>
          </div>

          {/* Précision des Modèles */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Précision des Modèles (R²)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(predictions.modelAccuracy).map(([key, accuracy]) => (
                <div key={key} className="text-center">
                  <div className="text-xs text-muted-foreground capitalize">
                    {key === 'throwIns' ? 'Touches' : key}
                  </div>
                  <div className={`text-lg font-bold ${getAccuracyColor(accuracy)}`}>
                    {accuracy}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prédictions par catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Corners Ultra-Précis */}
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Square className="h-5 w-5 text-blue-600" />
                  Corners Ultra-Précis
                  <Badge variant="outline" className="text-xs">
                    R²: {predictions.modelAccuracy.corners}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Prédiction</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">{predictions.corners.predicted}</span>
                    <Badge className={getConfidenceBadge(predictions.corners.confidence)}>
                      {predictions.corners.confidence}%
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Over {predictions.corners.predicted}</span>
                    <div className="flex items-center gap-1">
                      {getPredictionIcon(predictions.corners.overUnder.prediction)}
                      <span className="font-medium">{predictions.corners.overUnder.over}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Under {predictions.corners.predicted}</span>
                    <span className="font-medium">{predictions.corners.overUnder.under}%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-muted-foreground">Facteurs Ultra-Précis</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Possession:</span>
                      <span className="font-medium">{predictions.corners.factors.possession}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tirs Cadrés:</span>
                      <span className="font-medium">{predictions.corners.factors.shotsOnTarget}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Intensité:</span>
                      <span className="font-medium">{predictions.corners.factors.intensity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pression:</span>
                      <span className="font-medium">{predictions.corners.factors.pressure}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Météo:</span>
                      <span className="font-medium">{predictions.corners.factors.weather}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Arbitre:</span>
                      <span className="font-medium">{predictions.corners.factors.referee}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fautes Ultra-Précises */}
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Fautes Ultra-Précises
                  <Badge variant="outline" className="text-xs">
                    R²: {predictions.modelAccuracy.fouls}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Prédiction</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-600">{predictions.fouls.predicted}</span>
                    <Badge className={getConfidenceBadge(predictions.fouls.confidence)}>
                      {predictions.fouls.confidence}%
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Over {predictions.fouls.predicted}</span>
                    <div className="flex items-center gap-1">
                      {getPredictionIcon(predictions.fouls.overUnder.prediction)}
                      <span className="font-medium">{predictions.fouls.overUnder.over}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Under {predictions.fouls.predicted}</span>
                    <span className="font-medium">{predictions.fouls.overUnder.under}%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-muted-foreground">Facteurs Ultra-Précis</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Intensité:</span>
                      <span className="font-medium">{predictions.fouls.factors.intensity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pression:</span>
                      <span className="font-medium">{predictions.fouls.factors.pressure}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duels:</span>
                      <span className="font-medium">{predictions.fouls.factors.duels}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Arbitre:</span>
                      <span className="font-medium">{predictions.fouls.factors.referee}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Importance:</span>
                      <span className="font-medium">{predictions.fouls.factors.importance}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fatigue:</span>
                      <span className="font-medium">{predictions.fouls.factors.fatigue}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cartons Ultra-Précis */}
            <Card className="border-yellow-200 bg-yellow-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CardIcon className="h-5 w-5 text-yellow-600" />
                  Cartons Ultra-Précis
                  <Badge variant="outline" className="text-xs">
                    R²: {predictions.modelAccuracy.cards}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Jaunes</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-yellow-600">{predictions.cards.yellow.predicted}</span>
                      <Badge className={getConfidenceBadge(predictions.cards.yellow.confidence)}>
                        {predictions.cards.yellow.confidence}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rouges</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-red-600">{predictions.cards.red.predicted}</span>
                      <Badge className={getConfidenceBadge(predictions.cards.red.confidence)}>
                        {predictions.cards.red.confidence}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{predictions.cards.total.predicted}</span>
                      <Badge className={getConfidenceBadge(predictions.cards.total.confidence)}>
                        {predictions.cards.total.confidence}%
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Over {predictions.cards.total.predicted}</span>
                    <div className="flex items-center gap-1">
                      {getPredictionIcon(predictions.cards.overUnder.prediction)}
                      <span className="font-medium">{predictions.cards.overUnder.over}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Under {predictions.cards.total.predicted}</span>
                    <span className="font-medium">{predictions.cards.overUnder.under}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Touches Ultra-Précises */}
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Hand className="h-5 w-5 text-green-600" />
                  Touches Ultra-Précises
                  <Badge variant="outline" className="text-xs">
                    R²: {predictions.modelAccuracy.throwIns}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Prédiction</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">{predictions.throwIns.predicted}</span>
                    <Badge className={getConfidenceBadge(predictions.throwIns.confidence)}>
                      {predictions.throwIns.confidence}%
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Over {predictions.throwIns.predicted}</span>
                    <div className="flex items-center gap-1">
                      {getPredictionIcon(predictions.throwIns.overUnder.prediction)}
                      <span className="font-medium">{predictions.throwIns.overUnder.over}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Under {predictions.throwIns.predicted}</span>
                    <span className="font-medium">{predictions.throwIns.overUnder.under}%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-muted-foreground">Facteurs Ultra-Précis</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Possession:</span>
                      <span className="font-medium">{predictions.throwIns.factors.possession}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Solidité Déf:</span>
                      <span className="font-medium">{predictions.throwIns.factors.defensiveSolidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pression:</span>
                      <span className="font-medium">{predictions.throwIns.factors.pressure}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tactiques:</span>
                      <span className="font-medium">{predictions.throwIns.factors.tactics}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Météo:</span>
                      <span className="font-medium">{predictions.throwIns.factors.weather}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taille Terrain:</span>
                      <span className="font-medium">{predictions.throwIns.factors.fieldSize}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prédictions de Buts Ultra-Précises */}
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Goal className="h-5 w-5 text-purple-600" />
                Prédictions de Buts Ultra-Précises
                <Badge variant="outline" className="text-xs">
                  R²: {predictions.modelAccuracy.goals}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Domicile</div>
                  <div className="text-2xl font-bold text-purple-600">{predictions.goals.home.predicted}</div>
                  <Badge className={getConfidenceBadge(predictions.goals.home.confidence)}>
                    {predictions.goals.home.confidence}%
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Total</div>
                  <div className="text-3xl font-bold text-purple-600">{predictions.goals.total.predicted}</div>
                  <Badge className={getConfidenceBadge(predictions.goals.total.confidence)}>
                    {predictions.goals.total.confidence}%
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Extérieur</div>
                  <div className="text-2xl font-bold text-purple-600">{predictions.goals.away.predicted}</div>
                  <Badge className={getConfidenceBadge(predictions.goals.away.confidence)}>
                    {predictions.goals.away.confidence}%
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Over 0.5 Buts</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Over</span>
                    <div className="flex items-center gap-1">
                      {getPredictionIcon(predictions.goals.overUnder.over05.prediction)}
                      <span className="font-medium">{predictions.goals.overUnder.over05.over}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Under</span>
                    <span className="font-medium">{predictions.goals.overUnder.over05.under}%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Over 1.5 Buts</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Over</span>
                    <div className="flex items-center gap-1">
                      {getPredictionIcon(predictions.goals.overUnder.over15.prediction)}
                      <span className="font-medium">{predictions.goals.overUnder.over15.over}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Under</span>
                    <span className="font-medium">{predictions.goals.overUnder.over15.under}%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Over 2.5 Buts</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Over</span>
                    <div className="flex items-center gap-1">
                      {getPredictionIcon(predictions.goals.overUnder.over25.prediction)}
                      <span className="font-medium">{predictions.goals.overUnder.over25.over}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Under</span>
                    <span className="font-medium">{predictions.goals.overUnder.over25.under}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

