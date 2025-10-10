import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getPerfectMatchPredictions } from '@/utils/perfectMatchPredictions';
import { TeamStats } from '@/types/football';
import { 
  Target, 
  Square, 
  AlertTriangle, 
  CreditCard as CardIcon, 
  Hand, 
  Goal,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PerfectPredictionsProps {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  league: string;
  className?: string;
}

export const PerfectPredictions: React.FC<PerfectPredictionsProps> = ({
  homeTeam,
  awayTeam,
  league,
  className
}) => {
  const predictions = getPerfectMatchPredictions(homeTeam, awayTeam, league);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    if (confidence >= 65) return 'text-orange-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 85) return 'bg-green-100 text-green-800';
    if (confidence >= 75) return 'bg-yellow-100 text-yellow-800';
    if (confidence >= 65) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getPredictionIcon = (prediction: string) => {
    return prediction === 'OVER' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Prédictions Parfaites - Statistiques de Match
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Prédictions ultra-précises basées sur des modèles avancés et des données historiques réelles
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Confiance Globale */}
          <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Confiance Globale du Modèle</span>
              <Badge className={getConfidenceBadge(predictions.overallConfidence)}>
                {predictions.overallConfidence}%
              </Badge>
            </div>
            <Progress value={predictions.overallConfidence} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Précision moyenne de toutes les prédictions
            </p>
          </div>

          {/* Prédictions par catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Corners */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Square className="h-5 w-5" />
                  Corners
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Prédiction</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{predictions.corners.predicted}</span>
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
                  <h4 className="text-xs font-medium text-muted-foreground">Facteurs d'Influence</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Possession:</span>
                      <span>{predictions.corners.factors.possession}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tirs Cadrés:</span>
                      <span>{predictions.corners.factors.shotsOnTarget}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jeu Offensif:</span>
                      <span>{predictions.corners.factors.attackingPlay}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Intensité:</span>
                      <span>{predictions.corners.factors.intensity}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fautes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5" />
                  Fautes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Prédiction</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{predictions.fouls.predicted}</span>
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
                  <h4 className="text-xs font-medium text-muted-foreground">Facteurs d'Influence</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Intensité:</span>
                      <span>{predictions.fouls.factors.intensity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pression:</span>
                      <span>{predictions.fouls.factors.pressure}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duels:</span>
                      <span>{predictions.fouls.factors.duels}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Forme:</span>
                      <span>{predictions.fouls.factors.form}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cartons */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CardIcon className="h-5 w-5" />
                  Cartons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Jaunes</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">{predictions.cards.yellow.predicted}</span>
                      <Badge className={getConfidenceBadge(predictions.cards.yellow.confidence)}>
                        {predictions.cards.yellow.confidence}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rouges</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">{predictions.cards.red.predicted}</span>
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

            {/* Touches */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Hand className="h-5 w-5" />
                  Touches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Prédiction</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{predictions.throwIns.predicted}</span>
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
                  <h4 className="text-xs font-medium text-muted-foreground">Facteurs d'Influence</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Possession:</span>
                      <span>{predictions.throwIns.factors.possession}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jeu Défensif:</span>
                      <span>{predictions.throwIns.factors.defensivePlay}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pression:</span>
                      <span>{predictions.throwIns.factors.pressure}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Intensité:</span>
                      <span>{predictions.throwIns.factors.intensity}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prédictions de Buts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Goal className="h-5 w-5" />
                Prédictions de Buts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Domicile</div>
                  <div className="text-2xl font-bold">{predictions.goals.home.predicted}</div>
                  <Badge className={getConfidenceBadge(predictions.goals.home.confidence)}>
                    {predictions.goals.home.confidence}%
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Total</div>
                  <div className="text-3xl font-bold">{predictions.goals.total.predicted}</div>
                  <Badge className={getConfidenceBadge(predictions.goals.total.confidence)}>
                    {predictions.goals.total.confidence}%
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Extérieur</div>
                  <div className="text-2xl font-bold">{predictions.goals.away.predicted}</div>
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


