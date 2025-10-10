import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  TrendingUp,
  Target,
  Brain,
  Zap
} from 'lucide-react';

interface DataQualityIndicatorProps {
  homeQuality: {
    score: number;
    level: 'excellent' | 'good' | 'fair' | 'poor';
    missingFields: string[];
    recommendations: string[];
  };
  awayQuality: {
    score: number;
    level: 'excellent' | 'good' | 'fair' | 'poor';
    missingFields: string[];
    recommendations: string[];
  };
  overallConfidence: number;
  className?: string;
}

export const DataQualityIndicator: React.FC<DataQualityIndicatorProps> = ({
  homeQuality,
  awayQuality,
  overallConfidence,
  className
}) => {
  const getQualityColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getQualityBadge = (level: string) => {
    switch (level) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityIcon = (level: string) => {
    switch (level) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'fair': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'poor': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-blue-600';
    if (confidence >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-blue-100 text-blue-800';
    if (confidence >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Qualité des Données & Confiance
            <Badge className={getConfidenceBadge(overallConfidence)}>
              {overallConfidence}%
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            L'algorithme s'adapte automatiquement aux données disponibles
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Confiance Globale */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                Confiance Globale de l'Algorithme
              </span>
              <Badge className={getConfidenceBadge(overallConfidence)}>
                {overallConfidence}%
              </Badge>
            </div>
            <Progress value={overallConfidence} className="h-3" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <Zap className="h-3 w-3 text-yellow-600" />
              <span>
                {overallConfidence >= 80 
                  ? 'Données excellentes - Prédictions très fiables'
                  : overallConfidence >= 60
                  ? 'Données bonnes - Prédictions fiables'
                  : overallConfidence >= 40
                  ? 'Données correctes - Prédictions moyennement fiables'
                  : 'Données limitées - Prédictions basiques'
                }
              </span>
            </div>
          </div>

          {/* Qualité par équipe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Équipe Domicile */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  {getQualityIcon(homeQuality.level)}
                  Équipe Domicile
                  <Badge className={getQualityBadge(homeQuality.level)}>
                    {homeQuality.level}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Score de qualité</span>
                    <span className={`font-medium ${getQualityColor(homeQuality.level)}`}>
                      {homeQuality.score}/100
                    </span>
                  </div>
                  <Progress value={homeQuality.score} className="h-2" />
                </div>
                
                {homeQuality.missingFields.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      Champs manquants ({homeQuality.missingFields.length})
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {homeQuality.missingFields.slice(0, 3).join(', ')}
                      {homeQuality.missingFields.length > 3 && '...'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Équipe Extérieur */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  {getQualityIcon(awayQuality.level)}
                  Équipe Extérieur
                  <Badge className={getQualityBadge(awayQuality.level)}>
                    {awayQuality.level}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Score de qualité</span>
                    <span className={`font-medium ${getQualityColor(awayQuality.level)}`}>
                      {awayQuality.score}/100
                    </span>
                  </div>
                  <Progress value={awayQuality.score} className="h-2" />
                </div>
                
                {awayQuality.missingFields.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      Champs manquants ({awayQuality.missingFields.length})
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {awayQuality.missingFields.slice(0, 3).join(', ')}
                      {awayQuality.missingFields.length > 3 && '...'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommandations */}
          {(homeQuality.recommendations.length > 0 || awayQuality.recommendations.length > 0) && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Recommandations pour Améliorer la Précision
              </h4>
              <div className="space-y-2">
                {[...homeQuality.recommendations, ...awayQuality.recommendations]
                  .filter((rec, index, arr) => arr.indexOf(rec) === index) // Supprimer les doublons
                  .map((recommendation, index) => (
                    <Alert key={index} variant="default">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {recommendation}
                      </AlertDescription>
                    </Alert>
                  ))}
              </div>
            </div>
          )}

          {/* Informations sur l'adaptation automatique */}
          <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-medium text-green-800">
                  Intelligence Adaptative
                </div>
                <div className="text-xs text-green-700">
                  L'algorithme utilise des corrélations statistiques avancées pour 
                  inférer automatiquement les données manquantes basées sur les 
                  informations disponibles et le niveau de compétition.
                </div>
              </div>
            </div>
          </div>

          {/* Niveaux de qualité expliqués */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Niveaux de Qualité des Données</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Excellent (80-100%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Bon (60-79%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Correct (40-59%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Limité (0-39%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
