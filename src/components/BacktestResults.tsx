import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlayCircle, Download, Trophy, Target, DollarSign, Shield } from 'lucide-react';
import { runBacktest, generateTestMatches, exportBacktestReport, BacktestResults as BacktestResultsType } from '@/utils/backtestingEngine';

export function BacktestResults() {
  const [results, setResults] = useState<BacktestResultsType | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunBacktest = async () => {
    setIsRunning(true);

    // Simuler un délai pour montrer que le backtest est en cours
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Générer des matchs de test et lancer le backtest
    const testMatches = generateTestMatches();
    const backtestResults = runBacktest(testMatches);

    setResults(backtestResults);
    setIsRunning(false);
  };

  const handleExportReport = () => {
    if (!results) return;

    const report = exportBacktestReport(results);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backtest_report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card className="border-2 border-cyan-300 bg-gradient-to-br from-cyan-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-6 w-6 text-cyan-600" />
              Backtesting - Test du Système
            </CardTitle>
            {results && (
              <Button variant="outline" size="sm" onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-1" />
                Exporter Rapport
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!results ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Testez le système sur des matchs historiques pour valider sa précision.
              </p>
              <Button
                onClick={handleRunBacktest}
                disabled={isRunning}
                size="lg"
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {isRunning ? (
                  <>
                    <PlayCircle className="mr-2 h-5 w-5 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Lancer le Backtest
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Statistiques Globales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Matchs Testés</p>
                  <p className="text-3xl font-bold text-cyan-900">{results.totalMatches}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ROI</p>
                  <p className={`text-3xl font-bold ${results.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {results.roi >= 0 ? '+' : ''}{results.roi.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profit</p>
                  <p className={`text-3xl font-bold ${results.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {results.totalProfit >= 0 ? '+' : ''}{results.totalProfit.toFixed(2)} unités
                  </p>
                </div>
              </div>

              {/* Précision par Type */}
              <Card className="border-blue-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Précision par Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Over/Under 2.5</span>
                        <Badge className={results.over25Accuracy >= 75 ? 'bg-green-600' : 'bg-orange-600'}>
                          {results.over25Accuracy.toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress value={results.over25Accuracy} className="h-3" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">BTTS</span>
                        <Badge className={results.bttsAccuracy >= 75 ? 'bg-green-600' : 'bg-orange-600'}>
                          {results.bttsAccuracy.toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress value={results.bttsAccuracy} className="h-3" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Gagnant</span>
                        <Badge className={results.winnerAccuracy >= 70 ? 'bg-green-600' : 'bg-orange-600'}>
                          {results.winnerAccuracy.toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress value={results.winnerAccuracy} className="h-3" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Erreur Moyenne Corners</p>
                        <p className="text-xl font-bold">±{results.cornersMAE.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Erreur Moyenne Cartons</p>
                        <p className="text-xl font-bold">±{results.cardsMAE.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance du Système de Sécurité */}
              <Card className="border-green-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Performance du Système de Sécurité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-green-900">💎 BANKABLE</span>
                        <div className="text-right">
                          <Badge className="bg-green-700 mb-1">
                            {results.bankableWinRate.toFixed(1)}% réussite
                          </Badge>
                          <p className="text-xs text-green-700">
                            {results.bankableMatches} matchs
                          </p>
                        </div>
                      </div>
                      <Progress value={results.bankableWinRate} className="h-3" />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-blue-900">✅ SAFE</span>
                        <div className="text-right">
                          <Badge className="bg-blue-700 mb-1">
                            {results.safeWinRate.toFixed(1)}% réussite
                          </Badge>
                          <p className="text-xs text-blue-700">
                            {results.safeMatches} matchs
                          </p>
                        </div>
                      </div>
                      <Progress value={results.safeWinRate} className="h-3" />
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-yellow-900">⚡ RISKY</span>
                        <div className="text-right">
                          <Badge className="bg-yellow-700 mb-1">
                            {results.riskyWinRate.toFixed(1)}% réussite
                          </Badge>
                          <p className="text-xs text-yellow-700">
                            {results.riskyMatches} matchs
                          </p>
                        </div>
                      </div>
                      <Progress value={results.riskyWinRate} className="h-3" />
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-red-900">🚫 BLOCKED</span>
                        <div className="text-right">
                          <Badge className="bg-red-700 mb-1">
                            {results.blockedWouldHaveLost.toFixed(1)}% auraient perdu
                          </Badge>
                          <p className="text-xs text-red-700">
                            {results.blockedMatches} matchs bloqués
                          </p>
                        </div>
                      </div>
                      <Progress value={results.blockedWouldHaveLost} className="h-3" />
                      <p className="text-xs text-red-700 mt-2">
                        ✅ Le système a correctement évité {Math.round(results.blockedMatches * results.blockedWouldHaveLost / 100)} pertes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ROI Détaillé */}
              <Card className="border-indigo-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    Analyse Financière
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Misé</p>
                      <p className="text-2xl font-bold">{results.totalStaked.toFixed(2)} unités</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Gagné</p>
                      <p className="text-2xl font-bold text-green-600">{results.totalWon.toFixed(2)} unités</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Profit Net</p>
                      <p className={`text-2xl font-bold ${results.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {results.totalProfit >= 0 ? '+' : ''}{results.totalProfit.toFixed(2)} unités
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insights */}
              <Card className="border-purple-300 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-purple-900">💡 Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.insights.map((insight, idx) => (
                      <p key={idx} className="text-purple-900">{insight}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommandations */}
              <Card className="border-amber-300 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-amber-900">📋 Recommandations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.recommendations.map((rec, idx) => (
                      <p key={idx} className="text-amber-900">{rec}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bouton pour relancer */}
              <div className="text-center">
                <Button
                  onClick={handleRunBacktest}
                  variant="outline"
                  size="lg"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Relancer le Backtest
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
