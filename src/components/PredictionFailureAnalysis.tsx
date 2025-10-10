import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Target, 
  TrendingDown, 
  Brain, 
  Zap,
  CheckCircle,
  XCircle,
  Info,
  Lightbulb,
  BarChart3
} from 'lucide-react';

interface PredictionFailureAnalysisProps {
  className?: string;
}

export const PredictionFailureAnalysis: React.FC<PredictionFailureAnalysisProps> = ({ className }) => {
  // Simulation des faiblesses identifiées
  const identifiedWeaknesses = {
    context: {
      weather: {
        impact: 'high',
        description: 'Conditions météorologiques non prises en compte',
        examples: ['Pluie → Plus de fautes, moins de buts', 'Vent → Erreurs de passes, corners']
      },
      referee: {
        impact: 'high', 
        description: 'Style arbitral non considéré',
        examples: ['Arbitre strict → Plus de cartons', 'Arbitre permissif → Moins de cartons']
      },
      injuries: {
        impact: 'high',
        description: 'Blessures et suspensions non intégrées',
        examples: ['Titulaire blessé → Baisse de performance', 'Suspension → Tactique modifiée']
      }
    },
    models: {
      momentum: {
        impact: 'high',
        description: 'Calcul du momentum trop simpliste',
        issues: ['Poids égal pour tous les matchs', 'Pas de prise en compte des adversaires', 'Forme récente mal pondérée']
      },
      head_to_head: {
        impact: 'medium',
        description: 'Confrontations directes ignorées',
        issues: ['Historique H2H non utilisé', 'Tendances tactiques non analysées', 'Psychologie des confrontations']
      }
    },
    calibration: {
      confidence: {
        impact: 'high',
        description: 'Confiance mal calibrée',
        issues: ['Sur-confiance sur certaines prédictions', 'Sous-estimation des risques', 'Pas de correction bayésienne']
      }
    }
  };

  const improvementRecommendations = [
    'Intégrer les facteurs contextuels (météo, arbitre, blessures)',
    'Améliorer le calcul du momentum avec pondération intelligente',
    'Ajouter l\'analyse des confrontations directes',
    'Recalibrer les modèles de confiance',
    'Implémenter des facteurs temps réel',
    'Améliorer la détection des anomalies'
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <XCircle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-600" />
            Analyse des Faiblesses de Prédiction
            <Badge variant="destructive">Critique</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Identification des causes d'échec et recommandations d'amélioration
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Résumé des faiblesses identifiées */}
          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">Faiblesses Critiques Identifiées</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">3</div>
                <div className="text-red-700">Facteurs Contextuels</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">2</div>
                <div className="text-orange-700">Faiblesses Modèles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">1</div>
                <div className="text-yellow-700">Problème Calibration</div>
              </div>
            </div>
          </div>

          {/* Faiblesses contextuelles */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Faiblesses Contextuelles
            </h4>
            
            {Object.entries(identifiedWeaknesses.context).map(([key, weakness]) => (
              <Card key={key} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getImpactIcon(weakness.impact)}
                      <span className="font-medium">{weakness.description}</span>
                    </div>
                    <Badge className={getImpactColor(weakness.impact)}>
                      {weakness.impact.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Impact: {weakness.impact === 'high' ? 'Élevé' : weakness.impact === 'medium' ? 'Moyen' : 'Faible'}
                  </div>
                  <div className="space-y-1">
                    {weakness.examples.map((example, index) => (
                      <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        {example}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Faiblesses des modèles */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Faiblesses des Modèles
            </h4>
            
            {Object.entries(identifiedWeaknesses.models).map(([key, weakness]) => (
              <Card key={key} className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getImpactIcon(weakness.impact)}
                      <span className="font-medium">{weakness.description}</span>
                    </div>
                    <Badge className={getImpactColor(weakness.impact)}>
                      {weakness.impact.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {weakness.issues.map((issue, index) => (
                      <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                        {issue}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Problèmes de calibration */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Problèmes de Calibration
            </h4>
            
            {Object.entries(identifiedWeaknesses.calibration).map(([key, weakness]) => (
              <Card key={key} className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getImpactIcon(weakness.impact)}
                      <span className="font-medium">{weakness.description}</span>
                    </div>
                    <Badge className={getImpactColor(weakness.impact)}>
                      {weakness.impact.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {weakness.issues.map((issue, index) => (
                      <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                        {issue}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recommandations d'amélioration */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-green-600" />
              Recommandations d'Amélioration
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {improvementRecommendations.map((recommendation, index) => (
                <Alert key={index} variant="default">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {recommendation}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>

          {/* Plan d'action */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="space-y-2">
                <div className="text-sm font-medium text-green-800">
                  Plan d'Amélioration Prioritaire
                </div>
                <div className="text-xs text-green-700 space-y-1">
                  <p>1. <strong>Intégrer les facteurs contextuels</strong> - Météo, arbitre, blessures</p>
                  <p>2. <strong>Améliorer le momentum</strong> - Pondération intelligente des matchs récents</p>
                  <p>3. <strong>Recalibrer la confiance</strong> - Correction bayésienne des prédictions</p>
                  <p>4. <strong>Ajouter l'analyse H2H</strong> - Confrontations directes et tendances</p>
                </div>
              </div>
            </div>
          </div>

          {/* Métriques de performance */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Impact Estimé des Améliorations</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Précision Globale</span>
                <span className="font-medium">78% → 85% (+7%)</span>
              </div>
              <Progress value={78} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <span>Précision Corners</span>
                <span className="font-medium">84% → 89% (+5%)</span>
              </div>
              <Progress value={84} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <span>Précision BTTS</span>
                <span className="font-medium">83% → 88% (+5%)</span>
              </div>
              <Progress value={83} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
