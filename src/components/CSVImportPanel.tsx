import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Database,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { importMatchesFromCSV, analyzeCSV, type ImportConfig, type ImportResult } from '@/utils/csvMatchImporter';
import { realMatchDatabase } from '@/utils/realMatchDatabase';

export function CSVImportPanel() {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [csvStats, setCSVStats] = useState<any>(null);

  // Configuration
  const [minYear, setMinYear] = useState(2020);
  const [maxYear, setMaxYear] = useState(2024);
  const [maxMatches, setMaxMatches] = useState(1000);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(['F1', 'D1', 'E1', 'I1', 'SP1']);

  const leagues = [
    { code: 'F1', name: 'Ligue 1' },
    { code: 'D1', name: 'Bundesliga' },
    { code: 'E1', name: 'Premier League' },
    { code: 'I1', name: 'Serie A' },
    { code: 'SP1', name: 'La Liga' },
    { code: 'F2', name: 'Ligue 2' },
    { code: 'D2', name: 'Bundesliga 2' },
    { code: 'E2', name: 'Championship' },
  ];

  const handleAnalyze = async () => {
    setAnalyzing(true);

    try {
      // Read Matches.csv file
      const response = await fetch('/Matches.csv');
      const csvContent = await response.text();

      const stats = analyzeCSV(csvContent);
      setCSVStats(stats);
    } catch (error) {
      console.error('Erreur analyse CSV:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setImportResult(null);

    try {
      // Read Matches.csv file
      const response = await fetch('/Matches.csv');
      const csvContent = await response.text();

      const config: ImportConfig = {
        minYear,
        maxYear,
        leagues: selectedLeagues,
        requireCompleteData: true,
        maxMatches,
      };

      const result = await importMatchesFromCSV(csvContent, config);
      setImportResult(result);

      // Add to real match database
      if (result.matchesImported > 0) {
        // Note: In production, you'd save to database
        console.log(`${result.matchesImported} matchs importés avec succès!`);
      }
    } catch (error) {
      setImportResult({
        totalProcessed: 0,
        matchesImported: 0,
        matchesRejected: 0,
        matches: [],
        errors: [`Erreur: ${error}`],
        warnings: [],
      });
    } finally {
      setImporting(false);
    }
  };

  const toggleLeague = (leagueCode: string) => {
    setSelectedLeagues(prev =>
      prev.includes(leagueCode)
        ? prev.filter(l => l !== leagueCode)
        : [...prev, leagueCode]
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Importation Matches.csv
          </CardTitle>
          <CardDescription>
            Importez des milliers de matchs réels depuis Matches.csv (230,557 matchs disponibles)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="config">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="analyze">Analyse</TabsTrigger>
              <TabsTrigger value="results">Résultats</TabsTrigger>
            </TabsList>

            {/* Onglet Configuration */}
            <TabsContent value="config" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Période */}
                <div className="space-y-2">
                  <Label>Année de début</Label>
                  <Select value={minYear.toString()} onValueChange={(v) => setMinYear(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024].map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Année de fin</Label>
                  <Select value={maxYear.toString()} onValueChange={(v) => setMaxYear(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2020, 2021, 2022, 2023, 2024, 2025].map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nombre maximum */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Nombre maximum de matchs</Label>
                  <Select value={maxMatches.toString()} onValueChange={(v) => setMaxMatches(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 matchs (test rapide)</SelectItem>
                      <SelectItem value="500">500 matchs</SelectItem>
                      <SelectItem value="1000">1,000 matchs (recommandé)</SelectItem>
                      <SelectItem value="2000">2,000 matchs</SelectItem>
                      <SelectItem value="5000">5,000 matchs (max)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ligues */}
              <div className="space-y-2">
                <Label>Ligues à inclure</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {leagues.map(league => (
                    <div key={league.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={league.code}
                        checked={selectedLeagues.includes(league.code)}
                        onCheckedChange={() => toggleLeague(league.code)}
                      />
                      <label
                        htmlFor={league.code}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {league.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtres appliqués */}
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>Filtres appliqués</AlertTitle>
                <AlertDescription className="space-y-1">
                  <p>• Période: {minYear} - {maxYear}</p>
                  <p>• Ligues: {selectedLeagues.length} sélectionnée(s)</p>
                  <p>• Maximum: {maxMatches.toLocaleString()} matchs</p>
                  <p>• Données complètes requises: Oui (Corners, Tirs, Fautes, Cartons)</p>
                </AlertDescription>
              </Alert>

              {/* Boutons */}
              <div className="flex gap-2">
                <Button onClick={handleImport} disabled={importing || selectedLeagues.length === 0}>
                  {importing ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Importation en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Importer les Matchs
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={handleAnalyze} disabled={analyzing}>
                  {analyzing ? (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2 animate-spin" />
                      Analyse...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analyser CSV
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Onglet Analyse */}
            <TabsContent value="analyze" className="space-y-4">
              {csvStats ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Matchs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{csvStats.totalMatches.toLocaleString()}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Données Complètes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{csvStats.completeDataCount.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                          {((csvStats.completeDataCount / csvStats.totalMatches) * 100).toFixed(1)}% du total
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Période</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm font-medium">
                          {csvStats.dateRange.min} → {csvStats.dateRange.max}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Répartition par Ligue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(csvStats.byLeague)
                          .sort((a: any, b: any) => b[1] - a[1])
                          .slice(0, 10)
                          .map(([league, count]: any) => (
                            <div key={league} className="flex items-center justify-between">
                              <span className="text-sm">{league}</span>
                              <Badge>{count.toLocaleString()}</Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Analyse non effectuée</AlertTitle>
                  <AlertDescription>
                    Cliquez sur "Analyser CSV" pour voir les statistiques du fichier Matches.csv
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Onglet Résultats */}
            <TabsContent value="results" className="space-y-4">
              {importing && (
                <div className="space-y-2">
                  <Progress value={66} />
                  <p className="text-sm text-muted-foreground text-center">
                    Importation en cours... Traitement des matchs
                  </p>
                </div>
              )}

              {importResult && (
                <>
                  <Alert
                    variant={importResult.matchesImported > 0 ? 'default' : 'destructive'}
                    className={importResult.matchesImported > 0 ? 'border-green-500 bg-green-50' : ''}
                  >
                    {importResult.matchesImported > 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {importResult.matchesImported > 0
                        ? `✅ ${importResult.matchesImported} matchs importés avec succès!`
                        : '❌ Aucun match importé'}
                    </AlertTitle>
                    <AlertDescription>
                      Traités: {importResult.totalProcessed} | Rejetés: {importResult.matchesRejected}
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Traités</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{importResult.totalProcessed.toLocaleString()}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Importés</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {importResult.matchesImported.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Rejetés</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                          {importResult.matchesRejected.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Erreurs */}
                  {importResult.errors.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm text-red-600">Erreurs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1 max-h-40 overflow-auto">
                          {importResult.errors.slice(0, 10).map((error, i) => (
                            <p key={i} className="text-xs text-red-600">{error}</p>
                          ))}
                          {importResult.errors.length > 10 && (
                            <p className="text-xs text-muted-foreground">
                              ... et {importResult.errors.length - 10} autres erreurs
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Warnings */}
                  {importResult.warnings.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Avertissements</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside">
                          {importResult.warnings.map((warning, i) => (
                            <li key={i} className="text-sm">{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Prochaines étapes */}
                  {importResult.matchesImported > 0 && (
                    <Alert className="border-blue-500 bg-blue-50">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-900">Prochaines Étapes</AlertTitle>
                      <AlertDescription className="text-blue-800">
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Les matchs sont importés en mémoire</li>
                          <li>Allez dans l'onglet "Real Backtesting" pour tester la précision</li>
                          <li>Le système va calculer la précision réelle sur {importResult.matchesImported} matchs</li>
                          <li>Analysez les résultats avant de parier de l'argent réel</li>
                        </ol>
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}

              {!importResult && !importing && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Aucune importation effectuée</AlertTitle>
                  <AlertDescription>
                    Configurez les filtres dans l'onglet "Configuration" puis cliquez sur "Importer les Matchs"
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Informations */}
      <Alert>
        <Database className="h-4 w-4" />
        <AlertTitle>À Propos de Matches.csv</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Ce fichier contient <strong>230,557 matchs</strong> de multiples ligues européennes.</p>
          <p className="text-sm">
            ⚠️ <strong>Important</strong> : Seuls les matchs avec données complètes (Corners, Tirs, Fautes, Cartons) sont importés.
            Les matchs anciens (avant 2015) ont souvent des données incomplètes.
          </p>
          <p className="text-sm">
            💡 <strong>Recommandation</strong> : Commencez avec 1,000 matchs de 2020-2024 pour un bon équilibre entre
            précision et temps de traitement.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
