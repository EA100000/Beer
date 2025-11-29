import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, TrendingUp, Target, AlertCircle, ClipboardPaste, Zap, Radio } from 'lucide-react';
import { parseTennisData, generateTennisDataSummary, validateParsedData, ParsedTennisData } from '@/utils/tennisParser';
import { useToast } from '@/hooks/use-toast';

interface TennisPrediction {
  winner: string;
  confidence: number;
  predicted_sets: string;
  total_games_over_under: {
    line: number;
    prediction: 'over' | 'under';
    confidence: number;
  };
  aces_over_under: {
    line: number;
    prediction: 'over' | 'under';
    confidence: number;
  };
  break_of_serve: {
    prediction: 'yes' | 'no';
    confidence: number;
  };
  key_insights: string[];
}

export default function TennisAuto() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rawData, setRawData] = useState('');
  const [parsedData, setParsedData] = useState<ParsedTennisData | null>(null);
  const [prediction, setPrediction] = useState<TennisPrediction | null>(null);
  const [bestOf, setBestOf] = useState<3 | 5>(3);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRawData(text);
      toast({
        title: "Données collées",
        description: "Cliquez sur 'Analyser' pour générer les prédictions",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de lire le presse-papier. Collez manuellement.",
        variant: "destructive",
      });
    }
  };

  const analyzeTennisData = () => {
    if (!rawData.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez coller des données tennis",
        variant: "destructive",
      });
      return;
    }

    const parsed = parseTennisData(rawData);

    if (!parsed) {
      toast({
        title: "Erreur de parsing",
        description: "Format de données non reconnu",
        variant: "destructive",
      });
      return;
    }

    setParsedData(parsed);

    const validation = validateParsedData(parsed);

    toast({
      title: "Données extraites",
      description: `Complétude: ${validation.completenessScore}%`,
    });

    // Générer les prédictions
    const pred = generatePredictions(parsed, bestOf);
    setPrediction(pred);
  };

  const generatePredictions = (data: ParsedTennisData, format: 3 | 5): TennisPrediction => {
    const p1 = data.player1;
    const p2 = data.player2;

    // Calcul rating joueur 1
    let rating1 = 1000;
    rating1 += (p1.first_serve_points_won || 70) * 3;
    rating1 += (p1.aces_per_match || 5) * 15;
    rating1 -= (p1.double_faults_per_match || 2) * 20;
    rating1 += (p1.break_points_saved_percentage || 60) * 2;
    rating1 += (p1.break_points_converted_percentage || 40) * 1.5;
    rating1 += (p1.tiebreaks_won_percentage || 50) * 2;
    rating1 += (p1.win_percentage || 50) * 3;

    // Calcul rating joueur 2
    let rating2 = 1000;
    rating2 += (p2.first_serve_points_won || 70) * 3;
    rating2 += (p2.aces_per_match || 5) * 15;
    rating2 -= (p2.double_faults_per_match || 2) * 20;
    rating2 += (p2.break_points_saved_percentage || 60) * 2;
    rating2 += (p2.break_points_converted_percentage || 40) * 1.5;
    rating2 += (p2.tiebreaks_won_percentage || 50) * 2;
    rating2 += (p2.win_percentage || 50) * 3;

    const totalRating = rating1 + rating2;
    const p1WinProb = rating1 / totalRating;
    const p2WinProb = rating2 / totalRating;

    const winner = p1WinProb > p2WinProb ? 'Joueur 1' : 'Joueur 2';
    const confidence = Math.max(p1WinProb, p2WinProb) * 100;

    // Score prédit
    const predictedSets = format === 5
      ? (confidence > 75 ? '3-0' : confidence > 60 ? '3-1' : '3-2')
      : (confidence > 75 ? '2-0' : '2-1');

    // Total games
    const avgFirstServeWon = ((p1.first_serve_points_won || 70) + (p2.first_serve_points_won || 70)) / 2;
    const gamesLine = format === 5 ? 38.5 : 22.5;
    const gamesPredict = avgFirstServeWon > 72 ? 'under' : 'over';
    const gamesConfidence = Math.min(95, Math.abs(avgFirstServeWon - 72) * 3 + 50);

    // Total aces
    const totalAces = (p1.aces_per_match || 5) + (p2.aces_per_match || 5);
    const acesLine = format === 5 ? 18.5 : 10.5;
    const acesPredict = totalAces > acesLine ? 'over' : 'under';
    const acesConfidence = Math.min(95, Math.abs(totalAces - acesLine) * 8 + 50);

    // Break of serve
    const avgBreakSaved = ((p1.break_points_saved_percentage || 60) + (p2.break_points_saved_percentage || 60)) / 2;
    const breakPredict = avgBreakSaved < 65 ? 'yes' : 'no';
    const breakConfidence = Math.min(95, Math.abs(avgBreakSaved - 65) * 2 + 50);

    // Key insights
    const insights: string[] = [];

    if (p2.tiebreaks_won_percentage && p1.tiebreaks_won_percentage &&
        p2.tiebreaks_won_percentage > p1.tiebreaks_won_percentage + 20) {
      insights.push(`🎯 Joueur 2 domine en jeux décisifs (${p2.tiebreaks_won_percentage}% vs ${p1.tiebreaks_won_percentage}%)`);
    }

    if (p2.aces_per_match && p1.aces_per_match &&
        p2.aces_per_match > p1.aces_per_match * 2) {
      insights.push(`⚡ Joueur 2 service dominant (${p2.aces_per_match} aces/match vs ${p1.aces_per_match})`);
    }

    if (p1.break_points_converted_percentage && p2.break_points_saved_percentage &&
        p1.break_points_converted_percentage > p2.break_points_saved_percentage) {
      insights.push(`🔥 Joueur 1 efficace au retour (${p1.break_points_converted_percentage}% breaks convertis)`);
    }

    if (totalAces > (format === 5 ? 20 : 12)) {
      insights.push(`🎾 Match avec beaucoup de services gagnants attendu (${totalAces.toFixed(1)} aces combinés)`);
    }

    return {
      winner,
      confidence: Math.round(confidence),
      predicted_sets: predictedSets,
      total_games_over_under: {
        line: gamesLine,
        prediction: gamesPredict,
        confidence: Math.round(gamesConfidence)
      },
      aces_over_under: {
        line: acesLine,
        prediction: acesPredict,
        confidence: Math.round(acesConfidence)
      },
      break_of_serve: {
        prediction: breakPredict,
        confidence: Math.round(breakConfidence)
      },
      key_insights: insights
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                Analyse Tennis - Copier/Coller
              </h1>
              <p className="text-slate-400">Collez les statistiques et obtenez l'analyse instantanée</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/tennis-live')}
            className="bg-red-600 hover:bg-red-700"
          >
            <Radio className="mr-2 h-4 w-4" />
            Tennis Live (6 matchs)
          </Button>
        </div>

        {/* Zone de collage */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ClipboardPaste className="h-5 w-5" />
              Données Tennis (SofaScore, Flashscore, etc.)
            </CardTitle>
            <CardDescription className="text-slate-300">
              Copiez les statistiques depuis votre source et collez-les ici
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              placeholder={`Exemple de format attendu:

Général
Âge
28 ans    33 ans
Performance
Matchs gagnés
20/47 (43%)    16/37 (43%)
Service
1er service
65%    56.5%
Points gagnés sur 1er service
60.5%    67.6%
Aces par match
1.6    4.5
...`}
              className="min-h-[300px] bg-slate-700 border-slate-600 text-white font-mono text-sm"
            />

            <div className="flex gap-3">
              <Button
                onClick={handlePaste}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ClipboardPaste className="mr-2 h-4 w-4" />
                Coller depuis Presse-papier
              </Button>

              <div className="flex items-center gap-2">
                <Label className="text-slate-300">Format:</Label>
                <select
                  value={bestOf}
                  onChange={(e) => setBestOf(parseInt(e.target.value) as 3 | 5)}
                  className="bg-slate-700 border-slate-600 text-white rounded px-3 py-2"
                >
                  <option value={3}>Best of 3</option>
                  <option value={5}>Best of 5</option>
                </select>
              </div>

              <Button
                onClick={analyzeTennisData}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 ml-auto"
              >
                <Zap className="mr-2 h-4 w-4" />
                Analyser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Données extraites */}
        {parsedData && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">✅ Données Extraites</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                {generateTennisDataSummary(parsedData)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Prédictions */}
        {prediction && (
          <div className="space-y-4">
            {/* Vainqueur */}
            <Card className="bg-gradient-to-r from-green-900/50 to-green-800/50 border-green-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  Vainqueur Prédit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{prediction.winner}</div>
                  <div className="text-2xl text-green-300">Confiance: {prediction.confidence}%</div>
                  <div className="text-lg text-slate-300 mt-2">Score prédit: {prediction.predicted_sets}</div>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            {prediction.key_insights.length > 0 && (
              <Card className="bg-blue-900/30 border-blue-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-sm">💡 Insights Clés</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prediction.key_insights.map((insight, idx) => (
                      <li key={idx} className="text-blue-200 text-sm">{insight}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Autres marchés */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Total Games */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Total Jeux</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {prediction.total_games_over_under.prediction.toUpperCase()} {prediction.total_games_over_under.line}
                    </div>
                    <div className="text-slate-300 mt-1">
                      {prediction.total_games_over_under.confidence}% confiance
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Aces */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Total Aces</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {prediction.aces_over_under.prediction.toUpperCase()} {prediction.aces_over_under.line}
                    </div>
                    <div className="text-slate-300 mt-1">
                      {prediction.aces_over_under.confidence}% confiance
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Break of Serve */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Break de Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {prediction.break_of_serve.prediction === 'yes' ? 'OUI' : 'NON'}
                    </div>
                    <div className="text-slate-300 mt-1">
                      {prediction.break_of_serve.confidence}% confiance
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Avertissement */}
            <Card className="bg-yellow-900/20 border-yellow-700/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <strong>Note:</strong> Prédictions générées automatiquement depuis les données collées.
                    Vérifiez la complétude des données extraites ci-dessus pour une analyse optimale.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
