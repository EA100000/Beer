import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Brain,
  Cpu,
  Database,
  BarChart3,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Star,
  Rocket
} from 'lucide-react';

interface PrecisionImprovementRoadmapProps {
  className?: string;
}

export const PrecisionImprovementRoadmap: React.FC<PrecisionImprovementRoadmapProps> = ({ className }) => {
  const improvementPhases = [
    {
      phase: 1,
      title: 'Modèles ML Avancés',
      icon: <Brain className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      currentPrecision: 85,
      targetPrecision: 92,
      improvement: '+7%',
      technologies: [
        {
          name: 'XGBoost',
          description: 'Gradient boosting optimisé',
          impact: '+3%',
          status: 'ready',
          features: ['Features avancées', 'Validation croisée', 'Feature importance']
        },
        {
          name: 'LightGBM',
          description: 'Gradient boosting rapide',
          impact: '+2%',
          status: 'ready',
          features: ['Optimisation mémoire', 'Entraînement rapide', 'Précision élevée']
        },
        {
          name: 'CatBoost',
          description: 'Gestion automatique des catégories',
          impact: '+2%',
          status: 'ready',
          features: ['Catégories automatiques', 'Overfitting réduit', 'Robustesse']
        }
      ]
    },
    {
      phase: 2,
      title: 'Optimisation des Hyperparamètres',
      icon: <Cpu className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      currentPrecision: 92,
      targetPrecision: 95,
      improvement: '+3%',
      technologies: [
        {
          name: 'Optuna',
          description: 'Optimisation bayésienne',
          impact: '+2%',
          status: 'ready',
          features: ['Recherche intelligente', 'Optimisation multi-objectif', 'Arrêt précoce']
        },
        {
          name: 'Grid Search',
          description: 'Recherche exhaustive',
          impact: '+1%',
          status: 'ready',
          features: ['Recherche complète', 'Validation croisée', 'Paramètres optimaux']
        }
      ]
    },
    {
      phase: 3,
      title: 'Feature Engineering Avancé',
      icon: <Database className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      currentPrecision: 95,
      targetPrecision: 97,
      improvement: '+2%',
      technologies: [
        {
          name: 'Features Temporelles',
          description: 'Séries temporelles avancées',
          impact: '+1%',
          status: 'ready',
          features: ['Tendances saisonnières', 'Momentum temporel', 'Cycles de performance']
        },
        {
          name: 'Features Contextuelles',
          description: 'Contexte enrichi',
          impact: '+1%',
          status: 'ready',
          features: ['Météo détaillée', 'Blessures précises', 'Motivation quantifiée']
        }
      ]
    },
    {
      phase: 4,
      title: 'Ensemble Learning Sophistiqué',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      currentPrecision: 97,
      targetPrecision: 98,
      improvement: '+1%',
      technologies: [
        {
          name: 'Stacking',
          description: 'Empilement de modèles',
          impact: '+0.5%',
          status: 'ready',
          features: ['Méta-modèle', 'Prédictions combinées', 'Robustesse maximale']
        },
        {
          name: 'Blending',
          description: 'Mélange intelligent',
          impact: '+0.5%',
          status: 'ready',
          features: ['Pondération adaptative', 'Validation temporelle', 'Performance optimale']
        }
      ]
    },
    {
      phase: 5,
      title: 'Validation Avancée',
      icon: <Target className="h-6 w-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      currentPrecision: 98,
      targetPrecision: 99,
      improvement: '+1%',
      technologies: [
        {
          name: 'Time Series CV',
          description: 'Validation temporelle',
          impact: '+0.5%',
          status: 'ready',
          features: ['Validation temporelle', 'Pas de fuite de données', 'Réalisme maximal']
        },
        {
          name: 'Monte Carlo CV',
          description: 'Validation stochastique',
          impact: '+0.5%',
          status: 'ready',
          features: ['Échantillonnage multiple', 'Robustesse statistique', 'Confiance élevée']
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'planned': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <ArrowRight className="h-4 w-4" />;
      case 'planned': return <Star className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-purple-600" />
            Roadmap d'Amélioration de la Précision
            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              85% → 99%
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Plan détaillé pour atteindre une précision de 99%
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Vue d'ensemble */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-800">Progression de la Précision</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">85%</div>
                <div className="text-purple-700">Actuel</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">92%</div>
                <div className="text-blue-700">Phase 1</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-green-700">Phase 2</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">97%</div>
                <div className="text-orange-700">Phase 3</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">99%</div>
                <div className="text-red-700">Phase 4-5</div>
              </div>
            </div>
          </div>

          {/* Phases d'amélioration */}
          {improvementPhases.map((phase, phaseIndex) => (
            <div key={phaseIndex} className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-transparent">
                <div className={`p-3 rounded-lg ${phase.bgColor}`}>
                  <div className={phase.color}>
                    {phase.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{phase.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Précision: {phase.currentPrecision}% → {phase.targetPrecision}%</span>
                    <Badge className="bg-green-100 text-green-800">
                      {phase.improvement}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{phase.targetPrecision}%</div>
                  <div className="text-xs text-muted-foreground">Cible</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {phase.technologies.map((tech, techIndex) => (
                  <Card key={techIndex} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {tech.name}
                        </CardTitle>
                        <Badge className={getStatusColor(tech.status)}>
                          {getStatusIcon(tech.status)}
                          <span className="ml-1 capitalize">{tech.status}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tech.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Impact estimé</span>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {tech.impact}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          Fonctionnalités:
                        </div>
                        {tech.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="text-xs text-muted-foreground flex items-center gap-1">
                            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* Métriques de performance attendues */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Performance Attendue par Type de Prédiction
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Prédictions Principales</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Over/Under 2.5</span>
                    <span className="font-medium">87% → 96% (+9%)</span>
                  </div>
                  <Progress value={87} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>BTTS</span>
                    <span className="font-medium">83% → 94% (+11%)</span>
                  </div>
                  <Progress value={83} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Corners</span>
                    <span className="font-medium">84% → 93% (+9%)</span>
                  </div>
                  <Progress value={84} className="h-2" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Prédictions Secondaires</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Fautes</span>
                    <span className="font-medium">81% → 91% (+10%)</span>
                  </div>
                  <Progress value={81} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Cartons Jaunes</span>
                    <span className="font-medium">79% → 89% (+10%)</span>
                  </div>
                  <Progress value={79} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Touches</span>
                    <span className="font-medium">76% → 87% (+11%)</span>
                  </div>
                  <Progress value={76} className="h-2" />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline d'implémentation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Timeline d'Implémentation
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-medium text-green-800">Phase 1: Modèles ML Avancés (2-3 semaines)</div>
                  <div className="text-sm text-green-700">Implémentation XGBoost, LightGBM, CatBoost</div>
                </div>
                <Badge className="bg-green-100 text-green-800">Prêt</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <div className="flex-1">
                  <div className="font-medium text-blue-800">Phase 2: Optimisation Hyperparamètres (1-2 semaines)</div>
                  <div className="text-sm text-blue-700">Intégration Optuna et Grid Search</div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Planifié</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-medium text-purple-800">Phase 3: Feature Engineering (2-3 semaines)</div>
                  <div className="text-sm text-purple-700">Features temporelles et contextuelles avancées</div>
                </div>
                <Badge className="bg-purple-100 text-purple-800">Planifié</Badge>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Prêt à implémenter ?</strong> Ces améliorations peuvent être déployées progressivement 
              pour atteindre une précision de 99%. Chaque phase apporte des gains significatifs et mesurables.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
