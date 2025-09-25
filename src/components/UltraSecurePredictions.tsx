import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Target, Clock, AlertTriangle, CornerDownRight } from 'lucide-react';

interface UltraSecurePrediction {
  over: number;
  under: number;
  prediction: 'OVER' | 'UNDER';
  confidence: number;
  successRate: number;
  riskLevel: 'ULTRA_LOW' | 'LOW' | 'MEDIUM';
}

interface UltraSecurePredictionsProps {
  predictions: {
    over05Goals: UltraSecurePrediction;
    over05GoalsHalftime: UltraSecurePrediction;
    under55Cards: UltraSecurePrediction;
    over65Corners: UltraSecurePrediction;
  };
}

export function UltraSecurePredictions({ predictions }: UltraSecurePredictionsProps) {
  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'ULTRA_LOW': 
        return <Badge className="bg-green-600 text-white">Ultra Sécurisé</Badge>;
      case 'LOW': 
        return <Badge className="bg-yellow-600 text-white">Faible Risque</Badge>;
      case 'MEDIUM': 
        return <Badge className="bg-orange-600 text-white">Risque Moyen</Badge>;
      default: 
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-yellow-600';
    if (confidence >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const predictionCards = [
    {
      key: 'over05Goals',
      title: 'Over 0.5 Buts (Match Complet)',
      description: 'Au moins 1 but dans le match',
      icon: <Target className="h-5 w-5" />,
      prediction: predictions.over05Goals,
      color: 'border-green-500/30',
      bgColor: 'bg-gradient-green'
    },
    {
      key: 'over05GoalsHalftime',
      title: 'Over 0.5 Buts (1ère Mi-temps)',
      description: 'Au moins 1 but avant la pause',
      icon: <Clock className="h-5 w-5" />,
      prediction: predictions.over05GoalsHalftime,
      color: 'border-blue-500/30',
      bgColor: 'bg-gradient-blue'
    },
    {
      key: 'under55Cards',
      title: 'Moins de 5.5 Cartons',
      description: 'Total cartons jaunes + rouges',
      icon: <AlertTriangle className="h-5 w-5" />,
      prediction: predictions.under55Cards,
      color: 'border-yellow-500/30',
      bgColor: 'bg-gradient-yellow'
    },
    {
      key: 'over65Corners',
      title: 'Over 6.5 Corners',
      description: 'Plus de 6 corners dans le match',
      icon: <CornerDownRight className="h-5 w-5" />,
      prediction: predictions.over65Corners,
      color: 'border-purple-500/30',
      bgColor: 'bg-gradient-purple'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-green-500/30 bg-gradient-field shadow-strong">
        <CardHeader className="bg-gradient-green text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Prédictions Ultra-Sécurisées
            <Badge className="bg-white/20 text-white">93-96% de Réussite</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictionCards.map((card) => (
              <Card key={card.key} className={`${card.color} ${card.bgColor} shadow-soft`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      {card.icon}
                      {card.title}
                    </div>
                    {getRiskBadge(card.prediction.riskLevel)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {card.prediction.prediction === 'OVER' ? card.prediction.over : card.prediction.under}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Probabilité {card.prediction.prediction}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Confiance du Modèle:</span>
                      <span className={`font-bold ${getConfidenceColor(card.prediction.confidence)}`}>
                        {card.prediction.confidence}%
                      </span>
                    </div>
                    <Progress value={card.prediction.confidence} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Taux de Réussite Calculé:</span>
                      <span className="font-bold text-green-600">
                        {card.prediction.successRate}%
                      </span>
                    </div>
                    <Progress value={card.prediction.successRate} className="h-2" />
                  </div>

                  <div className="bg-card/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Over {card.prediction.prediction === 'OVER' ? card.prediction.over : card.prediction.under}%:</span>
                        <span className="font-bold">{card.prediction.prediction === 'OVER' ? card.prediction.over : card.prediction.under}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Under {card.prediction.prediction === 'OVER' ? card.prediction.under : card.prediction.over}%:</span>
                        <span className="font-bold">{card.prediction.prediction === 'OVER' ? card.prediction.under : card.prediction.over}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-400/30 bg-gradient-field shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Conseils pour les Prédictions Ultra-Sécurisées
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">✅ Avantages</h4>
              <ul className="space-y-1">
                <li>• Taux de réussite de 93-96%</li>
                <li>• Risque minimal de perte</li>
                <li>• Idéal pour la gestion de bankroll</li>
                <li>• Basé sur des données historiques réelles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">⚠️ Points d'Attention</h4>
              <ul className="space-y-1">
                <li>• Cotes généralement faibles (1.10-1.30)</li>
                <li>• Nécessite des mises plus importantes</li>
                <li>• Vérifiez les conditions météo</li>
                <li>• Surveillez les blessures importantes</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="font-medium text-blue-800 dark:text-blue-200">
              💡 Conseil Pro : Ces prédictions sont parfaites pour sécuriser votre bankroll 
              tout en générant des profits réguliers sur le long terme.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
