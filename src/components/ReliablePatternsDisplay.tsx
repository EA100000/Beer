import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import {
  detectReliablePatterns,
  getHighPrecisionPatterns,
  getExcellentPatterns,
  calculateExpectedROI,
  type PatternDetectionResult,
  type ReliablePattern
} from '@/utils/reliablePatternsDetector';
import { TeamStats } from '@/types/football';

interface ReliablePatternsDisplayProps {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  homeOdds?: number;
  awayOdds?: number;
  drawOdds?: number;
  bankroll?: number;
}

export function ReliablePatternsDisplay({
  homeTeam,
  awayTeam,
  homeOdds,
  awayOdds,
  drawOdds,
  bankroll = 1000
}: ReliablePatternsDisplayProps) {
  // Détecter les patterns
  const patterns: PatternDetectionResult = detectReliablePatterns(
    homeTeam,
    awayTeam,
    homeOdds,
    awayOdds,
    drawOdds
  );

  const highPrecisionPatterns = getHighPrecisionPatterns(patterns);
  const excellentPatterns = getExcellentPatterns(patterns);

  // Calculer ROI
  const roi = highPrecisionPatterns.length > 0
    ? calculateExpectedROI(highPrecisionPatterns, bankroll)
    : null;

  // Fonction pour obtenir le badge de risque
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'VERY_LOW':
        return <Badge className="bg-green-600">TRÈS FAIBLE</Badge>;
      case 'LOW':
        return <Badge className="bg-green-500">FAIBLE</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-yellow-500">MOYEN</Badge>;
      default:
        return <Badge className="bg-gray-500">INCONNU</Badge>;
    }
  };

  // Fonction pour obtenir le badge de précision
  const getPrecisionBadge = (precision: number) => {
    if (precision >= 85) {
      return <Badge className="bg-purple-600 text-white">EXCELLENT ({precision}%)</Badge>;
    } else if (precision >= 75) {
      return <Badge className="bg-blue-600 text-white">TRÈS BON ({precision}%)</Badge>;
    } else if (precision >= 70) {
      return <Badge className="bg-blue-500 text-white">BON ({precision}%)</Badge>;
    } else {
      return <Badge className="bg-gray-500">LIMITE ({precision}%)</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Alert */}
      {patterns.has_high_precision_opportunity ? (
        <Alert className="border-green-600 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 font-semibold">
            🎯 OPPORTUNITÉ EXCELLENTE DÉTECTÉE ! Précision ≥80%
          </AlertDescription>
        </Alert>
      ) : patterns.has_good_opportunity ? (
        <Alert className="border-blue-600 bg-blue-50">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 font-semibold">
            ✅ BONNE OPPORTUNITÉ DÉTECTÉE ! Précision ≥70%
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-yellow-600 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 font-semibold">
            ⚠️ Aucun pattern haute précision. Prudence recommandée.
          </AlertDescription>
        </Alert>
      )}

      {/* Patterns Détectés */}
      {patterns.patterns_found.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Patterns Fiables Détectés
            </CardTitle>
            <CardDescription>
              Basé sur l'analyse de 132,411 matchs réels (2000-2025)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patterns.patterns_found.map((pattern, idx) => (
                <div
                  key={idx}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Header du pattern */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">
                          {pattern.prediction}
                        </h4>
                        {getPrecisionBadge(pattern.precision)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {pattern.description}
                      </p>
                    </div>
                  </div>

                  {/* Métriques */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Précision</p>
                      <p className="text-lg font-bold text-green-600">
                        {pattern.precision}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Échantillon</p>
                      <p className="text-lg font-semibold">
                        {pattern.sample_size.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Risque</p>
                      <div className="mt-1">
                        {getRiskBadge(pattern.risk_level)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ROI Attendu</p>
                      <p className="text-lg font-bold text-blue-600">
                        {pattern.roi_expected}%
                      </p>
                    </div>
                  </div>

                  {/* Recommandation de mise */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-semibold text-blue-900">
                        Mise Recommandée
                      </p>
                    </div>
                    <p className="text-sm text-blue-800">
                      {pattern.recommended_stake}% du bankroll ={' '}
                      <span className="font-bold">
                        {(bankroll * pattern.recommended_stake / 100).toFixed(2)}€
                      </span>
                    </p>
                  </div>

                  {/* Raisonnement */}
                  <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    <p className="font-semibold mb-1">📊 Analyse:</p>
                    <p>{pattern.reasoning}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ROI Summary */}
      {roi && highPrecisionPatterns.length > 0 && (
        <Card className="border-green-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              Analyse ROI - Patterns Haute Précision
            </CardTitle>
            <CardDescription>
              Calcul basé sur {highPrecisionPatterns.length} pattern(s) ≥70% précision
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Mise Totale</p>
                <p className="text-2xl font-bold text-blue-700">
                  {roi.total_stake.toFixed(2)}€
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {((roi.total_stake / bankroll) * 100).toFixed(1)}% du bankroll
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Profit Attendu</p>
                <p className="text-2xl font-bold text-green-700">
                  +{roi.expected_profit.toFixed(2)}€
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  En moyenne sur long terme
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">ROI</p>
                <p className="text-2xl font-bold text-purple-700">
                  {roi.roi_percentage.toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Rentabilité attendue
                </p>
              </div>
            </div>

            {roi.roi_percentage > 5 && (
              <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-sm text-green-800 font-semibold">
                  ✅ ROI > 5% : TRÈS RENTABLE sur le long terme
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommandations */}
      {patterns.recommended_actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">Recommandations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {patterns.recommended_actions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {patterns.warnings.length > 0 && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              Avertissements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {patterns.warnings.map((warning, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-yellow-800">{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Statistiques Excellentes */}
      {excellentPatterns.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              ⭐ Opportunités Excellentes (≥80%)
            </CardTitle>
            <CardDescription>
              Précision validée sur des milliers de matchs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {excellentPatterns.map((pattern, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200"
                >
                  <div>
                    <p className="font-semibold text-purple-900">
                      {pattern.prediction}
                    </p>
                    <p className="text-xs text-gray-600">
                      {pattern.description}
                    </p>
                  </div>
                  <Badge className="bg-purple-600 text-white">
                    {pattern.precision}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Info */}
      <div className="text-xs text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
        <p>
          📊 Analyse basée sur 132,411 matchs réels (2000-2025)
        </p>
        <p className="mt-1">
          Méthodologie: Statistiques descriptives rigoureuses • Échantillons validés ≥30 matchs
        </p>
      </div>
    </div>
  );
}
