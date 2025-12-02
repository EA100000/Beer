import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  BarChart3,
  Brain
} from 'lucide-react';
import { LowRiskPrediction, CombinedPrediction, calculateSafetyScore } from '@/utils/lowRiskPredictions';

interface LowRiskPredictionsProps {
  predictions: LowRiskPrediction[];
  combinations: CombinedPrediction[];
}

export function LowRiskPredictions({ predictions, combinations }: LowRiskPredictionsProps) {
  const safetyScore = calculateSafetyScore(predictions);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'VERY_LOW': return 'bg-green-500';
      case 'LOW': return 'bg-yellow-500';
      case 'MEDIUM': return 'bg-orange-500';
      default: return 'bg-red-500';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'VERY_LOW': return <CheckCircle className="h-4 w-4" />;
      case 'LOW': return <Shield className="h-4 w-4" />;
      case 'MEDIUM': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    if (confidence >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Safety Score Overview */}
      <Card className="border-primary/30 bg-gradient-field shadow-strong">
        <CardHeader className="bg-gradient-pitch text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Score de Sécurité Global
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Score de Sécurité</span>
              <span className={`text-3xl font-bold ${getConfidenceColor(safetyScore.score)}`}>
                {safetyScore.score.toFixed(0)}/100
              </span>
            </div>
            <Progress value={safetyScore.score} className="h-4" />
            <div className="text-center">
              <Badge variant="outline" className="text-lg px-4 py-2">
                Niveau: {safetyScore.level}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {safetyScore.recommendations.map((rec, index) => (
                <Alert key={index} className="border-accent/30">
                  <AlertDescription className="text-sm">{rec}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Predictions */}
      <Card className="border-accent/30 bg-gradient-field shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Prédictions à Faible Risque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictions.map((prediction, index) => (
              <Card key={index} className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getRiskIcon(prediction.riskLevel)}
                        <span className="font-medium text-sm">{prediction.type}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${getRiskColor(prediction.riskLevel)} text-white`}
                      >
                        {prediction.riskLevel.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {prediction.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Confiance:</span>
                        <span className={`font-bold ${getConfidenceColor(prediction.confidence)}`}>
                          {prediction.confidence.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={prediction.confidence} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Valeur attendue:</span>
                      <span className="font-bold text-green-600">
                        +{(prediction.expectedValue * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium mb-1">Raisonnement:</p>
                      <p>{prediction.reasoning}</p>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium mb-1">Données utilisées:</p>
                      <div className="flex flex-wrap gap-1">
                        {prediction.dataPoints.map((point, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Combined Predictions */}
      {combinations.length > 0 && (
        <Card className="border-primary/30 bg-gradient-field shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Prédictions Combinées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {combinations.map((combination, index) => (
                <Card key={index} className="border-border/50 bg-card/50">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Combinaison {index + 1}</h4>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {combination.overallConfidence.toFixed(1)}%
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-medium">Prédiction principale:</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          {combination.primary.description}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          <span className="font-medium">Prédictions secondaires:</span>
                        </div>
                        <div className="ml-6 space-y-1">
                          {combination.secondary.map((pred, i) => (
                            <p key={i} className="text-sm text-muted-foreground">
                              • {pred.description}
                            </p>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm">Mise recommandée:</span>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {combination.recommendedStakes}% du bankroll
                        </Badge>
                      </div>
                      
                      <Alert className="border-accent/30">
                        <AlertDescription className="text-sm">
                          <strong>Évaluation du risque:</strong> {combination.riskAssessment}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Predictions Available */}
      {predictions.length === 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-orange-800 mb-2">
              Aucune prédiction à faible risque disponible
            </h3>
            <p className="text-orange-600">
              Les données fournies ne permettent pas d'identifier des patterns à faible risque.
              Considérez ajouter plus de données statistiques pour améliorer l'analyse.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


















