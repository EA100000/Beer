import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, Clock, AlertTriangle, CornerDownRight, 
  Trophy, Shield, Users, Zap, 
  BarChart3, Activity, Layers, 
  TrendingUp, TrendingDown, Star
} from 'lucide-react';

interface ComprehensivePrediction {
  over?: number;
  under?: number;
  yes?: number;
  no?: number;
  home?: number;
  away?: number;
  homeX?: number;
  awayX?: number;
  prediction: string;
  confidence: number;
  successRate: number;
  riskLevel: 'ULTRA_LOW' | 'LOW' | 'MEDIUM' | 'HIGH';
  team?: string;
}

interface ComprehensivePredictionsProps {
  predictions: {
    over05Goals: ComprehensivePrediction;
    over15Goals: ComprehensivePrediction;
    over25Goals: ComprehensivePrediction;
    over05GoalsHalftime: ComprehensivePrediction;
    under55Cards: ComprehensivePrediction;
    over65Corners: ComprehensivePrediction;
    btts: ComprehensivePrediction;
    doubleChance: ComprehensivePrediction;
    drawNoBet: ComprehensivePrediction;
    favoriteOver05: ComprehensivePrediction;
    bothHalvesGoals: ComprehensivePrediction;
    teamBothHalves: ComprehensivePrediction;
    shotsOnTarget: ComprehensivePrediction;
    throwIns: ComprehensivePrediction;
  };
}

export function ComprehensivePredictions({ predictions }: ComprehensivePredictionsProps) {
  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'ULTRA_LOW': 
        return <Badge className="bg-green-600 text-white">Ultra Sécurisé</Badge>;
      case 'LOW': 
        return <Badge className="bg-yellow-600 text-white">Faible Risque</Badge>;
      case 'MEDIUM': 
        return <Badge className="bg-orange-600 text-white">Risque Moyen</Badge>;
      case 'HIGH': 
        return <Badge className="bg-red-600 text-white">Risque Élevé</Badge>;
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

  const getSuccessRateColor = (successRate: number) => {
    if (successRate >= 90) return 'text-green-600';
    if (successRate >= 80) return 'text-yellow-600';
    if (successRate >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const ultraSecurePredictions = [
    {
      key: 'over05Goals',
      title: 'Over 0.5 Buts',
      description: 'Au moins 1 but dans le match',
      icon: <Target className="h-5 w-5" />,
      prediction: predictions.over05Goals,
      color: 'border-green-500/30',
      bgColor: 'bg-gradient-green'
    },
    {
      key: 'under55Cards',
      title: 'Moins de 5.5 Cartons',
      description: 'Total cartons jaunes + rouges',
      icon: <AlertTriangle className="h-5 w-5" />,
      prediction: predictions.under55Cards,
      color: 'border-yellow-500/30',
      bgColor: 'bg-gradient-yellow'
    }
  ];

  const highReliabilityPredictions = [
    {
      key: 'over15Goals',
      title: 'Over 1.5 Buts',
      description: 'Au moins 2 buts dans le match',
      icon: <Target className="h-5 w-5" />,
      prediction: predictions.over15Goals,
      color: 'border-blue-500/30',
      bgColor: 'bg-gradient-blue'
    },
    {
      key: 'over25Goals',
      title: 'Over 2.5 Buts',
      description: 'Au moins 3 buts dans le match',
      icon: <Target className="h-5 w-5" />,
      prediction: predictions.over25Goals,
      color: 'border-purple-500/30',
      bgColor: 'bg-gradient-purple'
    },
    {
      key: 'btts',
      title: 'BTTS (Both Teams To Score)',
      description: 'Les deux équipes marquent',
      icon: <Users className="h-5 w-5" />,
      prediction: predictions.btts,
      color: 'border-indigo-500/30',
      bgColor: 'bg-gradient-indigo'
    },
    {
      key: 'over65Corners',
      title: 'Over 6.5 Corners',
      description: 'Plus de 6 corners dans le match',
      icon: <CornerDownRight className="h-5 w-5" />,
      prediction: predictions.over65Corners,
      color: 'border-cyan-500/30',
      bgColor: 'bg-gradient-cyan'
    }
  ];

  const tacticalPredictions = [
    {
      key: 'over05GoalsHalftime',
      title: 'Over 0.5 Buts (1ère MT)',
      description: 'Au moins 1 but avant la pause',
      icon: <Clock className="h-5 w-5" />,
      prediction: predictions.over05GoalsHalftime,
      color: 'border-orange-500/30',
      bgColor: 'bg-gradient-orange'
    },
    {
      key: 'doubleChance',
      title: 'Double Chance',
      description: '1X ou X2 (couvre 2 résultats)',
      icon: <Shield className="h-5 w-5" />,
      prediction: predictions.doubleChance,
      color: 'border-emerald-500/30',
      bgColor: 'bg-gradient-emerald'
    },
    {
      key: 'drawNoBet',
      title: 'Draw No Bet',
      description: 'Handicap asiatique 0.0 (remboursement si nul)',
      icon: <Trophy className="h-5 w-5" />,
      prediction: predictions.drawNoBet,
      color: 'border-rose-500/30',
      bgColor: 'bg-gradient-rose'
    },
    {
      key: 'favoriteOver05',
      title: 'Équipe Favorite Over 0.5',
      description: `${predictions.favoriteOver05.team} marque au moins 1 but`,
      icon: <Star className="h-5 w-5" />,
      prediction: predictions.favoriteOver05,
      color: 'border-amber-500/30',
      bgColor: 'bg-gradient-amber'
    }
  ];

  const advancedPredictions = [
    {
      key: 'bothHalvesGoals',
      title: 'But dans les Deux Mi-temps',
      description: 'Au moins 1 but dans chaque mi-temps',
      icon: <Activity className="h-5 w-5" />,
      prediction: predictions.bothHalvesGoals,
      color: 'border-violet-500/30',
      bgColor: 'bg-gradient-violet'
    },
    {
      key: 'teamBothHalves',
      title: 'Équipe Marque dans les Deux Mi-temps',
      description: 'Une équipe marque dans chaque mi-temps',
      icon: <Zap className="h-5 w-5" />,
      prediction: predictions.teamBothHalves,
      color: 'border-pink-500/30',
      bgColor: 'bg-gradient-pink'
    },
    {
      key: 'shotsOnTarget',
      title: 'Over 7.5 Tirs Cadrés',
      description: 'Plus de 7.5 tirs cadrés dans le match',
      icon: <BarChart3 className="h-5 w-5" />,
      prediction: predictions.shotsOnTarget,
      color: 'border-teal-500/30',
      bgColor: 'bg-gradient-teal'
    },
    {
      key: 'throwIns',
      title: 'Over 45 Touches',
      description: 'Plus de 45 touches dans le match',
      icon: <Layers className="h-5 w-5" />,
      prediction: predictions.throwIns,
      color: 'border-slate-500/30',
      bgColor: 'bg-gradient-slate'
    }
  ];

  const renderPredictionCard = (card: any) => (
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
            {card.prediction.prediction}
          </div>
          <div className="text-sm text-muted-foreground">
            Prédiction recommandée
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
            <span>Taux de Réussite:</span>
            <span className={`font-bold ${getSuccessRateColor(card.prediction.successRate)}`}>
              {card.prediction.successRate}%
            </span>
          </div>
          <Progress value={card.prediction.successRate} className="h-2" />
        </div>

        <div className="bg-card/50 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground space-y-1">
            {card.prediction.over !== undefined && (
              <div className="flex justify-between">
                <span>Over {card.prediction.over}%:</span>
                <span className="font-bold">{card.prediction.over}%</span>
              </div>
            )}
            {card.prediction.under !== undefined && (
              <div className="flex justify-between">
                <span>Under {card.prediction.under}%:</span>
                <span className="font-bold">{card.prediction.under}%</span>
              </div>
            )}
            {card.prediction.yes !== undefined && (
              <div className="flex justify-between">
                <span>Oui {card.prediction.yes}%:</span>
                <span className="font-bold">{card.prediction.yes}%</span>
              </div>
            )}
            {card.prediction.no !== undefined && (
              <div className="flex justify-between">
                <span>Non {card.prediction.no}%:</span>
                <span className="font-bold">{card.prediction.no}%</span>
              </div>
            )}
            {card.prediction.home !== undefined && (
              <div className="flex justify-between">
                <span>Domicile {card.prediction.home}%:</span>
                <span className="font-bold">{card.prediction.home}%</span>
              </div>
            )}
            {card.prediction.away !== undefined && (
              <div className="flex justify-between">
                <span>Extérieur {card.prediction.away}%:</span>
                <span className="font-bold">{card.prediction.away}%</span>
              </div>
            )}
            {card.prediction.homeX !== undefined && (
              <div className="flex justify-between">
                <span>1X {card.prediction.homeX}%:</span>
                <span className="font-bold">{card.prediction.homeX}%</span>
              </div>
            )}
            {card.prediction.awayX !== undefined && (
              <div className="flex justify-between">
                <span>X2 {card.prediction.awayX}%:</span>
                <span className="font-bold">{card.prediction.awayX}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="border-blue-500/30 bg-gradient-field shadow-strong">
        <CardHeader className="bg-gradient-blue text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Prédictions Complètes
            <Badge className="bg-white/20 text-white">Toutes les Options</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="ultra-secure" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ultra-secure">Ultra Sécurisé</TabsTrigger>
              <TabsTrigger value="high-reliability">Haute Fiabilité</TabsTrigger>
              <TabsTrigger value="tactical">Tactique</TabsTrigger>
              <TabsTrigger value="advanced">Avancé</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ultra-secure" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ultraSecurePredictions.map(renderPredictionCard)}
              </div>
            </TabsContent>
            
            <TabsContent value="high-reliability" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {highReliabilityPredictions.map(renderPredictionCard)}
              </div>
            </TabsContent>
            
            <TabsContent value="tactical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tacticalPredictions.map(renderPredictionCard)}
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {advancedPredictions.map(renderPredictionCard)}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}









