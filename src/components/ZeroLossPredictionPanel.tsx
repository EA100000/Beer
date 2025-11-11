import React from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, XCircle, Target, DollarSign } from 'lucide-react';
import { ZeroLossPrediction } from '@/utils/zeroLossSystem';
import { PatternMatchingResult } from '@/utils/historicalPatternMatching';

interface ZeroLossPredictionPanelProps {
  zeroLoss: ZeroLossPrediction;
  patterns: PatternMatchingResult;
}

export function ZeroLossPredictionPanel({ zeroLoss, patterns }: ZeroLossPredictionPanelProps) {
  // Déterminer la couleur selon classification
  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'BANKABLE': return 'bg-green-500 text-white';
      case 'SAFE': return 'bg-blue-500 text-white';
      case 'RISKY': return 'bg-yellow-500 text-black';
      case 'DANGER': return 'bg-orange-500 text-white';
      case 'BLOCKED': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'BANKABLE': return <CheckCircle className="h-5 w-5" />;
      case 'SAFE': return <Shield className="h-5 w-5" />;
      case 'RISKY': return <AlertTriangle className="h-5 w-5" />;
      case 'DANGER': return <XCircle className="h-5 w-5" />;
      case 'BLOCKED': return <XCircle className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getSafetyColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* En-tête : Classification principale */}
      <Card className="p-6 border-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getClassificationIcon(zeroLoss.classification)}
            <div>
              <h2 className="text-2xl font-bold">Analyse Ultra-Sécurisée</h2>
              <p className="text-sm text-muted-foreground">Système de Zéro Perte Activé</p>
            </div>
          </div>
          <Badge className={`${getClassificationColor(zeroLoss.classification)} px-4 py-2 text-lg`}>
            {zeroLoss.classification}
          </Badge>
        </div>

        {/* Scores principaux */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score de Sécurité</span>
              <span className={`text-2xl font-bold ${getSafetyColor(zeroLoss.safetyScore)}`}>
                {zeroLoss.safetyScore}/100
              </span>
            </div>
            <Progress value={zeroLoss.safetyScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Consensus Modèles</span>
              <span className="text-2xl font-bold text-blue-600">
                {zeroLoss.modelConsensus.toFixed(0)}%
              </span>
            </div>
            <Progress value={zeroLoss.modelConsensus} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Probabilité Ajustée</span>
              <span className="text-2xl font-bold text-purple-600">
                {zeroLoss.adjustedProbability.toFixed(0)}%
              </span>
            </div>
            <Progress value={zeroLoss.adjustedProbability} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score de Valeur</span>
              <span className={`text-2xl font-bold ${zeroLoss.valueScore > 5 ? 'text-green-600' : 'text-gray-600'}`}>
                {zeroLoss.valueScore > 0 ? '+' : ''}{zeroLoss.valueScore.toFixed(1)}%
              </span>
            </div>
            <Progress value={Math.max(0, Math.min(100, zeroLoss.valueScore + 50))} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Décision de pari */}
      {zeroLoss.shouldBet ? (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-bold text-green-900 text-lg">✅ PARI RECOMMANDÉ</p>
              <div className="space-y-1 text-green-800">
                <p><strong>Type de pari :</strong> {zeroLoss.recommendedBetType}</p>
                <p><strong>Mise recommandée :</strong> {zeroLoss.stakingRecommendation.toFixed(1)}% du bankroll</p>
                <p><strong>Kelly Criterion :</strong> {zeroLoss.kellyCriterion.toFixed(2)}%</p>
                {zeroLoss.minAcceptableOdds && (
                  <p><strong>Cote minimale acceptable :</strong> {zeroLoss.minAcceptableOdds}</p>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-red-500 bg-red-50">
          <XCircle className="h-5 w-5 text-red-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-bold text-red-900 text-lg">❌ PARI NON RECOMMANDÉ</p>
              <p className="text-red-800">Les conditions de sécurité ne sont pas remplies pour ce match.</p>
              {zeroLoss.blockingReasons.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold text-red-900">Raisons du blocage :</p>
                  <ul className="list-disc list-inside space-y-1 text-red-800">
                    {zeroLoss.blockingReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Patterns historiques détectés */}
      {patterns.primaryPattern && (
        <Card className="p-6 border-blue-300">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="text-xl font-bold">Pattern Historique Détecté</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-lg text-blue-900">{patterns.primaryPattern.patternName}</p>
                <Badge className="bg-blue-600 text-white">
                  Similarité: {patterns.primaryPattern.similarity.toFixed(0)}%
                </Badge>
              </div>
              <p className="text-blue-800 mb-3">{patterns.primaryPattern.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-900">Succès Historique</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {patterns.primaryPattern.historicalSuccessRate}%
                  </p>
                  <p className="text-xs text-blue-700">
                    Basé sur {patterns.primaryPattern.occurrences} matchs
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Fiabilité Globale</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {patterns.overallReliability.toFixed(0)}%
                  </p>
                  <p className="text-xs text-blue-700">
                    {patterns.detectedPatterns.length} pattern(s) convergent(s)
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-sm font-semibold text-blue-900 mb-1">Résultats Historiques :</p>
                <ul className="space-y-1">
                  {patterns.primaryPattern.historicalResults.map((result, idx) => (
                    <li key={idx} className="text-sm text-blue-800">• {result}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Prédictions ajustées par patterns */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="font-semibold text-purple-900 mb-2">Prédictions Ajustées par Patterns :</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-purple-700">Over 2.5</p>
                  <p className="text-lg font-bold text-purple-900">
                    {patterns.adjustedPrediction.over25Probability}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-purple-700">BTTS</p>
                  <p className="text-lg font-bold text-purple-900">
                    {patterns.adjustedPrediction.bttsProbability}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-purple-700">Corners</p>
                  <p className="text-lg font-bold text-purple-900">
                    {patterns.adjustedPrediction.cornersPrediction}
                  </p>
                </div>
              </div>
              {patterns.adjustedPrediction.confidenceBoost > 0 && (
                <p className="text-xs text-purple-700 mt-2">
                  🚀 Boost de confiance: +{patterns.adjustedPrediction.confidenceBoost}%
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Forces et faiblesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Forces */}
        <Card className="p-6 border-green-300">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-bold text-green-900">Points Forts</h3>
          </div>
          <ul className="space-y-2">
            {zeroLoss.strengths.length > 0 ? (
              zeroLoss.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>{strength}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-600">Aucun point fort significatif détecté</li>
            )}
          </ul>
        </Card>

        {/* Faiblesses */}
        <Card className="p-6 border-orange-300">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-bold text-orange-900">Points de Vigilance</h3>
          </div>
          <ul className="space-y-2">
            {zeroLoss.weaknesses.length > 0 ? (
              zeroLoss.weaknesses.map((weakness, idx) => (
                <li key={idx} className="text-sm text-orange-800 flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>{weakness}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-600">Aucune faiblesse majeure détectée</li>
            )}
          </ul>
        </Card>
      </div>

      {/* Recommandations d'action */}
      <Card className="p-6 border-purple-300 bg-purple-50">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-bold text-purple-900">Recommandations d'Action</h3>
        </div>
        <div className="space-y-2">
          {zeroLoss.actionRecommendations.map((recommendation, idx) => (
            <p key={idx} className="text-sm text-purple-800 font-medium">
              {recommendation}
            </p>
          ))}
        </div>
      </Card>

      {/* Recommandation historique */}
      {patterns.historicalRecommendation && (
        <Card className="p-6 border-indigo-300 bg-indigo-50">
          <h3 className="text-lg font-bold text-indigo-900 mb-3">📊 Recommandation Historique</h3>
          <pre className="text-sm text-indigo-800 whitespace-pre-wrap font-sans">
            {patterns.historicalRecommendation}
          </pre>
        </Card>
      )}
    </div>
  );
}
