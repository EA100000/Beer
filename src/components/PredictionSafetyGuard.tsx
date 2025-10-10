import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Lock,
  Unlock,
  Eye,
  Brain,
  Target,
  Zap
} from 'lucide-react';

interface PredictionSafetyGuardProps {
  validationResult: {
    isValid: boolean;
    confidence: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    warnings: string[];
    errors: string[];
    recommendations: string[];
    safetyScore: number;
    shouldProceed: boolean;
  };
  onOverride?: () => void;
  className?: string;
}

export const PredictionSafetyGuard: React.FC<PredictionSafetyGuardProps> = ({
  validationResult,
  onOverride,
  className
}) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return <CheckCircle className="h-4 w-4" />;
      case 'MEDIUM': return <Info className="h-4 w-4" />;
      case 'HIGH': return <AlertTriangle className="h-4 w-4" />;
      case 'CRITICAL': return <XCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getSafetyColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSafetyBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    if (score >= 50) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className={className}>
      <Card className={`border-l-4 ${
        validationResult.riskLevel === 'CRITICAL' ? 'border-l-red-500' :
        validationResult.riskLevel === 'HIGH' ? 'border-l-orange-500' :
        validationResult.riskLevel === 'MEDIUM' ? 'border-l-yellow-500' :
        'border-l-green-500'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Garde de Sécurité des Prédictions
            <Badge className={getRiskColor(validationResult.riskLevel)}>
              {getRiskIcon(validationResult.riskLevel)}
              <span className="ml-1">{validationResult.riskLevel}</span>
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Protection contre les mauvaises analyses statistiques
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score de sécurité */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                Score de Sécurité
              </span>
              <Badge className={`${getSafetyColor(validationResult.safetyScore)} ${getSafetyBgColor(validationResult.safetyScore)}`}>
                {validationResult.safetyScore}/100
              </Badge>
            </div>
            <Progress value={validationResult.safetyScore} className="h-3" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              {validationResult.safetyScore >= 90 ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Sécurité maximale - Prédiction très fiable</span>
                </>
              ) : validationResult.safetyScore >= 80 ? (
                <>
                  <Info className="h-3 w-3 text-blue-600" />
                  <span>Sécurité élevée - Prédiction fiable</span>
                </>
              ) : validationResult.safetyScore >= 70 ? (
                <>
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  <span>Sécurité modérée - Prédiction à risque</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 text-red-600" />
                  <span>Sécurité faible - Prédiction non recommandée</span>
                </>
              )}
            </div>
          </div>

          {/* Statut de validation */}
          <div className="flex items-center gap-3 p-4 rounded-lg border">
            {validationResult.shouldProceed ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium text-green-800">Prédiction Validée</div>
                  <div className="text-sm text-green-700">
                    Les données sont cohérentes et la prédiction est fiable
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <Unlock className="h-3 w-3 mr-1" />
                  SÉCURISÉ
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-600" />
                <div className="flex-1">
                  <div className="font-medium text-red-800">Prédiction Bloquée</div>
                  <div className="text-sm text-red-700">
                    Données incohérentes ou insuffisantes - Risque élevé
                  </div>
                </div>
                <Badge className="bg-red-100 text-red-800">
                  <Lock className="h-3 w-3 mr-1" />
                  BLOQUÉ
                </Badge>
              </>
            )}
          </div>

          {/* Erreurs critiques */}
          {validationResult.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-red-600">
                <XCircle className="h-4 w-4" />
                Erreurs Critiques ({validationResult.errors.length})
              </h4>
              <div className="space-y-1">
                {validationResult.errors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Avertissements */}
          {validationResult.warnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                Avertissements ({validationResult.warnings.length})
              </h4>
              <div className="space-y-1">
                {validationResult.warnings.map((warning, index) => (
                  <Alert key={index} variant="default">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {warning}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Recommandations */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-blue-600">
              <Brain className="h-4 w-4" />
              Recommandations ({validationResult.recommendations.length})
            </h4>
            <div className="space-y-1">
              {validationResult.recommendations.map((recommendation, index) => (
                <Alert key={index} variant="default">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {recommendation}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t">
            {validationResult.shouldProceed ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Prédiction approuvée - Vous pouvez parier en toute sécurité
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Prédiction bloquée - Risque trop élevé
                  </span>
                </div>
                {onOverride && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOverride}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Voir quand même
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Informations supplémentaires */}
          <div className="p-3 bg-gray-50 rounded-lg text-xs text-muted-foreground">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-3 w-3" />
              <span className="font-medium">Protection Active</span>
            </div>
            <div className="space-y-1">
              <p>• Validation multi-niveaux des données d'entrée</p>
              <p>• Détection d'anomalies statistiques</p>
              <p>• Vérification de cohérence des prédictions</p>
              <p>• Validation croisée des modèles</p>
              <p>• Seuils de sécurité automatiques</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
