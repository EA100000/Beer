import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  runRealBacktest,
  runConservativeBacktest,
  generateBacktestReport,
  type BacktestSummary,
} from '@/utils/realBacktestingEngine';
import { getRealMatchCount } from '@/utils/realMatchDatabase';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Target,
  DollarSign,
} from 'lucide-react';

export function RealBacktestingPanel() {
  const [summary, setSummary] = useState<BacktestSummary | null>(null);
  const [conservativeSummary, setConservativeSummary] = useState<BacktestSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const matchCount = getRealMatchCount();

  const runBacktest = () => {
    setLoading(true);
    setTimeout(() => {
      const result = runRealBacktest();
      const conservativeResult = runConservativeBacktest(80);
      setSummary(result);
      setConservativeSummary(conservativeResult);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    // Auto-run on mount
    runBacktest();
  }, []);

  if (loading) {
    return (
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 animate-spin" />
            Exécution du Backtesting...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={66} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">
            Analyse de {matchCount} matchs réels...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Backtesting sur Matchs Réels</CardTitle>
          <CardDescription>Testez la précision du système sur des résultats réels</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runBacktest}>Lancer le Backtesting</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alert Principal */}
      <Alert
        variant={summary.overallAccuracy >= 70 ? 'default' : 'destructive'}
        className={summary.overallAccuracy >= 70 ? 'border-green-500 bg-green-50' : ''}
      >
        <Target className="h-4 w-4" />
        <AlertTitle className="font-bold text-lg">
          Précision Réelle: {summary.overallAccuracy.toFixed(1)}%
        </AlertTitle>
        <AlertDescription>
          {summary.overallAccuracy >= 70 ? (
            <>
              ✅ Le système fonctionne bien sur {matchCount} matchs réels testés.
              <br />
              Cependant, rappelez-vous: même à {summary.overallAccuracy.toFixed(0)}%, environ{' '}
              {Math.round(100 - summary.overallAccuracy)}% des paris seront perdus.
            </>
          ) : summary.overallAccuracy >= 50 ? (
            <>
              ⚠️ Précision de {summary.overallAccuracy.toFixed(1)}% - légèrement mieux que le hasard
              (50%).
              <br />
              Le système a besoin d'améliorations avant de parier de l'argent réel.
            </>
          ) : (
            <>
              ❌ Précision de {summary.overallAccuracy.toFixed(1)}% - MOINS BON que le hasard!
              <br />
              🚨 NE PAS UTILISER ce système pour parier de l'argent réel dans son état actuel.
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Alerte échantillon */}
      {matchCount < 30 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>⚠️ Échantillon TROP PETIT</AlertTitle>
          <AlertDescription>
            Seulement {matchCount} matchs testés. Minimum recommandé: 50+ matchs.
            <br />
            Les résultats ne sont PAS statistiquement fiables.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="conservative">Mode Conservateur</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
        </TabsList>

        {/* Onglet Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4">
          {/* Stats principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Over/Under */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Over/Under 2.5</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.over25Accuracy.toFixed(1)}%</div>
                <Progress value={summary.over25Accuracy} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {summary.over25Correct}/{summary.over25Total} correct
                </p>
                {summary.over25Accuracy >= 70 ? (
                  <Badge className="mt-2 bg-green-500">Excellent</Badge>
                ) : summary.over25Accuracy >= 60 ? (
                  <Badge className="mt-2 bg-yellow-500">Bon</Badge>
                ) : (
                  <Badge className="mt-2 bg-red-500">Faible</Badge>
                )}
              </CardContent>
            </Card>

            {/* BTTS */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">BTTS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.bttsAccuracy.toFixed(1)}%</div>
                <Progress value={summary.bttsAccuracy} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {summary.bttsCorrect}/{summary.bttsTotal} correct
                </p>
                {summary.bttsAccuracy >= 70 ? (
                  <Badge className="mt-2 bg-green-500">Excellent</Badge>
                ) : summary.bttsAccuracy >= 60 ? (
                  <Badge className="mt-2 bg-yellow-500">Bon</Badge>
                ) : (
                  <Badge className="mt-2 bg-red-500">Faible</Badge>
                )}
              </CardContent>
            </Card>

            {/* Résultat */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Résultat (1X2)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.resultAccuracy.toFixed(1)}%</div>
                <Progress value={summary.resultAccuracy} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {summary.resultCorrect}/{summary.resultTotal} correct
                </p>
                {summary.resultAccuracy >= 60 ? (
                  <Badge className="mt-2 bg-green-500">Excellent</Badge>
                ) : summary.resultAccuracy >= 45 ? (
                  <Badge className="mt-2 bg-yellow-500">Bon</Badge>
                ) : (
                  <Badge className="mt-2 bg-red-500">Faible</Badge>
                )}
              </CardContent>
            </Card>

            {/* ROI */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  ROI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${summary.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {summary.roi >= 0 ? '+' : ''}
                  {summary.roi.toFixed(1)}%
                </div>
                {summary.roi >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-500 mt-2" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-500 mt-2" />
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {summary.successfulBets}/{summary.totalBets} paris gagnants
                </p>
                {summary.roi > 10 ? (
                  <Badge className="mt-2 bg-green-500">Rentable!</Badge>
                ) : summary.roi > 0 ? (
                  <Badge className="mt-2 bg-yellow-500">Positif</Badge>
                ) : (
                  <Badge className="mt-2 bg-red-500">Perte</Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Précision globale */}
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Précision Globale
              </CardTitle>
              <CardDescription>
                Performance sur l'ensemble des {summary.totalMatches} matchs testés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Précision totale</span>
                    <span className="text-2xl font-bold">
                      {summary.overallAccuracy.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={summary.overallAccuracy} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Confiance moyenne</p>
                    <p className="text-xl font-bold">{summary.avgConfidence.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Matchs haute confiance</p>
                    <p className="text-xl font-bold">{summary.highConfidenceMatches}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bouton rapport complet */}
          <Button onClick={() => setShowReport(!showReport)} className="w-full" variant="outline">
            {showReport ? 'Masquer' : 'Afficher'} le Rapport Complet
          </Button>

          {showReport && (
            <Card>
              <CardHeader>
                <CardTitle>Rapport Détaillé</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-lg overflow-auto max-h-96">
                  {generateBacktestReport(summary)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Mode Conservateur */}
        <TabsContent value="conservative" className="space-y-4">
          {conservativeSummary && conservativeSummary.totalMatches > 0 ? (
            <>
              <Alert className="border-orange-500 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Mode Ultra-Conservateur (Confiance ≥80%)</AlertTitle>
                <AlertDescription>
                  Seuls {conservativeSummary.totalMatches} matchs sur {summary.totalMatches}{' '}
                  passent le filtre ultra-conservateur.
                  <br />
                  Précision: {conservativeSummary.overallAccuracy.toFixed(1)}% | ROI:{' '}
                  {conservativeSummary.roi >= 0 ? '+' : ''}
                  {conservativeSummary.roi.toFixed(1)}%
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Over/Under</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {conservativeSummary.over25Accuracy.toFixed(1)}%
                    </div>
                    <Progress value={conservativeSummary.over25Accuracy} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">BTTS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {conservativeSummary.bttsAccuracy.toFixed(1)}%
                    </div>
                    <Progress value={conservativeSummary.bttsAccuracy} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">ROI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${conservativeSummary.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {conservativeSummary.roi >= 0 ? '+' : ''}
                      {conservativeSummary.roi.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Analyse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {conservativeSummary.overallAccuracy > summary.overallAccuracy ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>
                        Le filtre conservateur AMÉLIORE la précision de{' '}
                        {(conservativeSummary.overallAccuracy - summary.overallAccuracy).toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      <span>
                        Le filtre conservateur réduit la précision de{' '}
                        {(summary.overallAccuracy - conservativeSummary.overallAccuracy).toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    💡 Recommandation: {conservativeSummary.roi > summary.roi
                      ? 'Utilisez le mode conservateur pour de meilleurs résultats.'
                      : 'Le filtre conservateur ne semble pas améliorer les performances.'}
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Aucun match en mode conservateur</AlertTitle>
              <AlertDescription>
                Aucun match n'atteint le seuil de confiance de 80%.
                <br />
                Cela signifie que le système n'est PAS assez confiant pour recommander des paris.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Onglet Détails */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Détails des Matchs</CardTitle>
              <CardDescription>Performance détaillée sur chaque match testé</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-auto">
                {summary.results.map((result, index) => (
                  <div
                    key={result.matchId}
                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {index + 1}. {result.matchName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {result.league} - {result.date}
                        </p>
                      </div>
                      <Badge variant={result.confidence >= 80 ? 'default' : 'secondary'}>
                        {result.confidence.toFixed(0)}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        {result.over25Success ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>O/U</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {result.bttsSuccess ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>BTTS</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {result.resultSuccess ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>Résultat</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Message final important */}
      <Alert className="border-yellow-500 bg-yellow-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="font-bold">⚠️ RAPPEL CRUCIAL</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            • <strong>100% de précision est IMPOSSIBLE</strong> - Le football est imprévisible
          </p>
          <p>
            • Même à {summary.overallAccuracy.toFixed(0)}%, environ{' '}
            {Math.round(100 - summary.overallAccuracy)}% des paris seront perdus
          </p>
          <p>• La gestion de bankroll est CRUCIALE - Ne jamais parier plus de 2% par pari</p>
          <p>
            • {matchCount < 50
              ? `L'échantillon de ${matchCount} matchs est trop petit pour être fiable`
              : `Basé sur ${matchCount} matchs réels`}
          </p>
          <p className="font-bold text-red-600">
            • NE JAMAIS parier plus que vous ne pouvez perdre!
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
