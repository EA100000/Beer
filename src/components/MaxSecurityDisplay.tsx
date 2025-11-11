/**
 * Affichage des Seuils à SÉCURITÉ MAXIMALE
 *
 * Focus sur le SEUIL qui est l'élément critique
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SecureThreshold } from '@/utils/maxSecurityThresholds';
import {
  Shield,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Lock,
  BarChart4,
  AlertTriangle,
  Target,
  Sparkles
} from 'lucide-react';

interface MaxSecurityDisplayProps {
  thresholds: SecureThreshold[];
  homeTeam: string;
  awayTeam: string;
}

export function MaxSecurityDisplay({ thresholds, homeTeam, awayTeam }: MaxSecurityDisplayProps) {
  if (thresholds.length === 0) {
    return (
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            Aucun Seuil Sécurisé Disponible
          </CardTitle>
          <CardDescription>
            Les données fournies ne permettent pas de calculer des seuils avec sécurité maximale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              <p className="font-medium mb-2">Pour obtenir des seuils sécurisés, fournissez:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Nombre de matchs joués (minimum 10)</li>
                <li>Buts marqués et encaissés</li>
                <li>Tirs cadrés par match</li>
                <li>Possession moyenne</li>
                <li>Cartons jaunes par match</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const strongBets = thresholds.filter(t => t.recommendation === 'STRONG_BET');
  const regularBets = thresholds.filter(t => t.recommendation === 'BET');

  const getSecurityColor = (level: number) => {
    if (level >= 90) return 'from-green-500 to-emerald-600';
    if (level >= 80) return 'from-green-400 to-green-500';
    if (level >= 70) return 'from-blue-400 to-blue-500';
    return 'from-gray-400 to-gray-500';
  };

  const getSecurityBg = (level: number) => {
    if (level >= 90) return 'bg-green-50 border-green-300';
    if (level >= 80) return 'bg-green-50/70 border-green-200';
    if (level >= 70) return 'bg-blue-50 border-blue-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'VERY_LOW':
        return <Badge className="bg-green-600 text-white">Risque TRÈS FAIBLE</Badge>;
      case 'LOW':
        return <Badge className="bg-green-500 text-white">Risque FAIBLE</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-yellow-500 text-white">Risque MOYEN</Badge>;
      default:
        return <Badge variant="outline">Risque Inconnu</Badge>;
    }
  };

  return (
    <Card className="border-green-300 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800 text-2xl">
          <Shield className="h-7 w-7" />
          SEUILS À SÉCURITÉ MAXIMALE 🔒
        </CardTitle>
        <CardDescription className="text-base text-green-700">
          {homeTeam} vs {awayTeam} - Seuils calculés avec marge de sécurité statistique (1 écart-type)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Résumé */}
        <Alert className="bg-gradient-to-r from-green-100 to-emerald-100 border-green-400 border-2">
          <Shield className="h-5 w-5 text-green-700" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-green-900 text-lg mb-1">
                  ✅ {thresholds.length} SEUILS SÉCURISÉS IDENTIFIÉS
                </p>
                <p className="text-sm text-green-800">
                  {strongBets.length} paris ULTRA-SÉCURISÉS • {regularBets.length} paris SÉCURISÉS
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700">{strongBets.length}</div>
                  <div className="text-xs text-green-600">STRONG BET</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{regularBets.length}</div>
                  <div className="text-xs text-blue-600">BET</div>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* STRONG BETS - Priorité Absolue */}
        {strongBets.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-green-400 pb-2">
              <Sparkles className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-bold text-green-900">
                🔥 PARIS ULTRA-SÉCURISÉS (Priorité Max)
              </h3>
              <Badge className="bg-green-600 text-white ml-auto">
                Sécurité ≥ 85%
              </Badge>
            </div>

            <div className="grid gap-4">
              {strongBets.map((threshold, index) => (
                <Card
                  key={index}
                  className={`border-4 border-green-500 ${getSecurityBg(threshold.securityLevel)} shadow-lg hover:shadow-xl transition-all`}
                >
                  <CardContent className="p-5">
                    {/* Header avec sécurité */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full bg-gradient-to-br ${getSecurityColor(threshold.securityLevel)}`}>
                          {threshold.prediction === 'OVER' || threshold.prediction === 'YES' ? (
                            <TrendingUp className="h-6 w-6 text-white" />
                          ) : (
                            <TrendingDown className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 font-medium">{threshold.category}</div>
                          <div className="text-xl font-bold text-gray-900">{threshold.metric}</div>
                        </div>
                      </div>
                      <Badge className="bg-green-700 text-white text-base px-3 py-1">
                        <Lock className="h-4 w-4 mr-1" />
                        STRONG BET
                      </Badge>
                    </div>

                    {/* SEUIL - Élément Central */}
                    <div className="bg-white rounded-xl p-5 mb-4 border-4 border-dashed border-green-400 shadow-inner">
                      <div className="text-center mb-3">
                        <div className="text-sm text-gray-600 mb-1">🎯 SEUIL SÉCURISÉ</div>
                        <div className="text-5xl font-black text-green-700">
                          {threshold.prediction} {threshold.threshold > 0 ? threshold.threshold : ''}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                        <div className="bg-green-50 rounded-lg p-2">
                          <div className="text-xs text-gray-600">Probabilité</div>
                          <div className="text-2xl font-bold text-green-700">
                            {threshold.probability.toFixed(0)}%
                          </div>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-2">
                          <div className="text-xs text-gray-600">Sécurité</div>
                          <div className="text-2xl font-bold text-emerald-700">
                            {threshold.securityLevel.toFixed(0)}%
                          </div>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-2">
                          <div className="text-xs text-gray-600">Confiance</div>
                          <div className="text-xl font-bold text-teal-700">
                            {threshold.confidence === 'MAXIMUM' ? '⭐⭐⭐' :
                             threshold.confidence === 'VERY_HIGH' ? '⭐⭐' : '⭐'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Analyse Statistique */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart4 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-bold text-blue-900">Analyse Statistique:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-600">Valeur Attendue</div>
                          <div className="font-bold text-gray-900">{threshold.expectedValue.toFixed(2)}</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-600">Variance (±)</div>
                          <div className="font-bold text-gray-900">{threshold.variance.toFixed(2)}</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-600">Minimum Probable (P10)</div>
                          <div className="font-bold text-gray-900">{threshold.minExpected.toFixed(1)}</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-gray-600">Maximum Probable (P90)</div>
                          <div className="font-bold text-gray-900">{threshold.maxExpected.toFixed(1)}</div>
                        </div>
                      </div>
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2">
                        <div className="text-xs font-semibold text-yellow-800">
                          🔒 Marge de sécurité: {threshold.securityMargin.toFixed(2)} écart-types
                        </div>
                        <div className="text-xs text-yellow-700 mt-1">
                          Le seuil est placé à {threshold.securityMargin.toFixed(1)}σ de la moyenne pour maximiser la sécurité
                        </div>
                      </div>
                    </div>

                    {/* Raisonnement */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                      <div className="text-sm font-semibold text-gray-700 mb-2">📊 Raisonnement:</div>
                      <div className="space-y-1">
                        {threshold.reasoning.map((reason, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-green-600 mt-0.5">▪</span>
                            <span className="text-gray-700">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Validation */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-300">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-purple-50 border-purple-300 text-purple-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {threshold.validatedBy.length} validations
                        </Badge>
                        {getRiskBadge(threshold.riskLevel)}
                      </div>
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* REGULAR BETS */}
        {regularBets.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-blue-300 pb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-blue-900">
                Paris Sécurisés (Haute Fiabilité)
              </h3>
              <Badge className="bg-blue-600 text-white ml-auto">
                Sécurité 70-85%
              </Badge>
            </div>

            <div className="grid gap-3">
              {regularBets.map((threshold, index) => (
                <Card
                  key={index}
                  className={`border-2 border-blue-400 ${getSecurityBg(threshold.securityLevel)}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {threshold.prediction === 'OVER' || threshold.prediction === 'YES' ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-blue-600" />
                        )}
                        <div>
                          <div className="text-xs text-gray-600">{threshold.category}</div>
                          <div className="font-bold text-gray-900">{threshold.metric}</div>
                        </div>
                      </div>
                      <Badge className="bg-blue-600 text-white">BET</Badge>
                    </div>

                    <div className="bg-white rounded-lg p-3 mb-3 border-2 border-dashed border-blue-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-600">Seuil</div>
                          <div className="text-2xl font-bold text-blue-700">
                            {threshold.prediction} {threshold.threshold > 0 ? threshold.threshold : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">Probabilité</div>
                          <div className="text-2xl font-bold text-green-600">
                            {threshold.probability.toFixed(0)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">Sécurité</div>
                          <div className="text-2xl font-bold text-purple-600">
                            {threshold.securityLevel.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 mb-2">
                      🔒 Intervalle probable: {threshold.minExpected.toFixed(1)} - {threshold.maxExpected.toFixed(1)}
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {threshold.validatedBy.length} validations
                      </Badge>
                      {getRiskBadge(threshold.riskLevel)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Guide Stratégique */}
        <Alert className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300">
          <Lock className="h-4 w-4 text-purple-600" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-bold text-purple-900">🎯 Stratégie de Sécurité Maximale:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <p className="font-semibold text-purple-800 mb-1">✅ STRONG BET (Priorité Max)</p>
                  <ul className="list-disc list-inside text-purple-700 space-y-1">
                    <li>Probabilité ≥ 85%</li>
                    <li>Sécurité ≥ 85%</li>
                    <li>Marge: 1+ écart-type</li>
                    <li>Mise: 3-5% du bankroll</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="font-semibold text-blue-800 mb-1">🎲 BET (Haute Fiabilité)</p>
                  <ul className="list-disc list-inside text-blue-700 space-y-1">
                    <li>Probabilité ≥ 78%</li>
                    <li>Sécurité 70-85%</li>
                    <li>Marge: 0.75-1 écart-type</li>
                    <li>Mise: 2-3% du bankroll</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border-2 border-yellow-400">
                <p className="font-bold text-yellow-900 mb-2">⚡ CLÉS DU SUCCÈS:</p>
                <ul className="list-disc list-inside text-yellow-800 space-y-1 text-sm">
                  <li><strong>Le SEUIL</strong> est calculé avec 1 écart-type de marge = 84% de chances de gagner</li>
                  <li>Plus la <strong>sécurité</strong> est élevée, plus le seuil est conservateur</li>
                  <li>Combiner 2-3 paris STRONG BET en combiné pour maximiser les gains</li>
                  <li>Ne JAMAIS dépasser 10% du bankroll sur un seul pari</li>
                  <li>Tracker tous les résultats pour valider le système (objectif: 80-90% de réussite)</li>
                </ul>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-300">
          <p className="font-semibold">Système de Seuils à Sécurité Maximale v1.0</p>
          <p className="mt-1">
            Basé sur l'analyse statistique avec variance, écart-type et marge de sécurité de 1σ
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
