import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TennisPlayerStats {
  // Statistiques générales
  ranking: number;
  aces_per_match: number;
  double_faults_per_match: number;
  first_serve_percentage: number;
  first_serve_points_won: number;
  second_serve_points_won: number;
  break_points_saved: number;
  service_games_won: number;

  // Performance retour
  first_serve_return_won: number;
  second_serve_return_won: number;
  break_points_converted: number;
  return_games_won: number;

  // Forme récente
  wins_last_5: number;
  sets_won_last_5: number;

  // Contexte
  h2h_wins: number;
  surface_win_rate: number;
}

interface TennisMatchContext {
  surface: 'hard' | 'clay' | 'grass' | 'carpet';
  tournament_level: 'grand_slam' | 'masters_1000' | 'atp_500' | 'atp_250' | 'challenger';
  best_of: 3 | 5;
  indoor: boolean;
}

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
}

export default function Tennis() {
  const navigate = useNavigate();
  const [player1, setPlayer1] = useState<Partial<TennisPlayerStats>>({});
  const [player2, setPlayer2] = useState<Partial<TennisPlayerStats>>({});
  const [context, setContext] = useState<TennisMatchContext>({
    surface: 'hard',
    tournament_level: 'atp_500',
    best_of: 3,
    indoor: false
  });
  const [prediction, setPrediction] = useState<TennisPrediction | null>(null);

  const analyzeTennisMatch = () => {
    // Algorithme de prédiction tennis simplifié
    const p1Rating = calculatePlayerRating(player1, context);
    const p2Rating = calculatePlayerRating(player2, context);

    const totalRating = p1Rating + p2Rating;
    const p1WinProb = p1Rating / totalRating;
    const p2WinProb = p2Rating / totalRating;

    const winner = p1WinProb > p2WinProb ? 'Joueur 1' : 'Joueur 2';
    const confidence = Math.max(p1WinProb, p2WinProb) * 100;

    // Prédiction nombre de sets
    const predictedSets = context.best_of === 5
      ? (confidence > 75 ? '3-0' : confidence > 60 ? '3-1' : '3-2')
      : (confidence > 75 ? '2-0' : '2-1');

    // Total games (basé sur qualité des serveurs)
    const avgFirstServeWon = ((player1.first_serve_points_won || 70) + (player2.first_serve_points_won || 70)) / 2;
    const gamesLine = context.best_of === 5 ? 38.5 : 22.5;
    const gamesPredict = avgFirstServeWon > 72 ? 'under' : 'over';
    const gamesConfidence = Math.abs(avgFirstServeWon - 72) * 3;

    // Aces (basé sur moyennes)
    const totalAces = (player1.aces_per_match || 5) + (player2.aces_per_match || 5);
    const acesLine = context.best_of === 5 ? 18.5 : 10.5;
    const acesPredict = totalAces > acesLine ? 'over' : 'under';
    const acesConfidence = Math.abs(totalAces - acesLine) * 8;

    // Break of serve
    const avgBreakConverted = ((player1.break_points_converted || 40) + (player2.break_points_converted || 40)) / 2;
    const breakPredict = avgBreakConverted > 38 ? 'yes' : 'no';
    const breakConfidence = Math.abs(avgBreakConverted - 38) * 2;

    setPrediction({
      winner,
      confidence: Math.round(confidence),
      predicted_sets: predictedSets,
      total_games_over_under: {
        line: gamesLine,
        prediction: gamesPredict,
        confidence: Math.min(95, Math.round(gamesConfidence))
      },
      aces_over_under: {
        line: acesLine,
        prediction: acesPredict,
        confidence: Math.min(95, Math.round(acesConfidence))
      },
      break_of_serve: {
        prediction: breakPredict,
        confidence: Math.min(95, Math.round(breakConfidence))
      }
    });
  };

  const calculatePlayerRating = (player: Partial<TennisPlayerStats>, ctx: TennisMatchContext): number => {
    let rating = 1000;

    // Ranking (plus important = meilleur rating)
    if (player.ranking) {
      rating += (100 - Math.min(100, player.ranking)) * 5;
    }

    // Service
    rating += (player.first_serve_points_won || 70) * 2;
    rating += (player.second_serve_points_won || 50) * 1.5;
    rating += (player.aces_per_match || 5) * 10;
    rating -= (player.double_faults_per_match || 2) * 15;

    // Retour
    rating += (player.first_serve_return_won || 30) * 2;
    rating += (player.break_points_converted || 40) * 1.5;

    // Forme
    rating += (player.wins_last_5 || 2) * 30;

    // Surface
    rating += (player.surface_win_rate || 50) * 3;

    // H2H
    rating += (player.h2h_wins || 0) * 25;

    return Math.max(1, rating);
  };

  const updatePlayer1Stat = (key: keyof TennisPlayerStats, value: string) => {
    setPlayer1(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const updatePlayer2Stat = (key: keyof TennisPlayerStats, value: string) => {
    setPlayer2(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
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
                Analyse Tennis
              </h1>
              <p className="text-slate-400">Prédictions basées sur statistiques ATP/WTA</p>
            </div>
          </div>
        </div>

        {/* Contexte du match */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Contexte du Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-slate-300">Surface</Label>
                <Select value={context.surface} onValueChange={(v: any) => setContext({...context, surface: v})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hard">Dur (Hard Court)</SelectItem>
                    <SelectItem value="clay">Terre Battue (Clay)</SelectItem>
                    <SelectItem value="grass">Gazon (Grass)</SelectItem>
                    <SelectItem value="carpet">Moquette (Carpet)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Niveau Tournoi</Label>
                <Select value={context.tournament_level} onValueChange={(v: any) => setContext({...context, tournament_level: v})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grand_slam">Grand Slam</SelectItem>
                    <SelectItem value="masters_1000">Masters 1000</SelectItem>
                    <SelectItem value="atp_500">ATP 500</SelectItem>
                    <SelectItem value="atp_250">ATP 250</SelectItem>
                    <SelectItem value="challenger">Challenger</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Format</Label>
                <Select value={context.best_of.toString()} onValueChange={(v) => setContext({...context, best_of: parseInt(v) as 3 | 5})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Best of 3</SelectItem>
                    <SelectItem value="5">Best of 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Lieu</Label>
                <Select value={context.indoor ? 'indoor' : 'outdoor'} onValueChange={(v) => setContext({...context, indoor: v === 'indoor'})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outdoor">Extérieur</SelectItem>
                    <SelectItem value="indoor">Intérieur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques des joueurs */}
        <Tabs defaultValue="player1" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="player1" className="data-[state=active]:bg-blue-600">
              Joueur 1
            </TabsTrigger>
            <TabsTrigger value="player2" className="data-[state=active]:bg-red-600">
              Joueur 2
            </TabsTrigger>
          </TabsList>

          <TabsContent value="player1">
            <PlayerStatsForm player={player1} updateStat={updatePlayer1Stat} playerColor="blue" />
          </TabsContent>

          <TabsContent value="player2">
            <PlayerStatsForm player={player2} updateStat={updatePlayer2Stat} playerColor="red" />
          </TabsContent>
        </Tabs>

        {/* Bouton Analyser */}
        <Button
          onClick={analyzeTennisMatch}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold"
        >
          <TrendingUp className="mr-2 h-5 w-5" />
          Analyser le Match
        </Button>

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
                    <strong>Note:</strong> Ces prédictions sont basées sur un algorithme simplifié.
                    Pour des paris importants, croisez avec d'autres sources et analysez les statistiques H2H détaillées.
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

// Composant pour le formulaire de stats d'un joueur
function PlayerStatsForm({
  player,
  updateStat,
  playerColor
}: {
  player: Partial<TennisPlayerStats>;
  updateStat: (key: keyof TennisPlayerStats, value: string) => void;
  playerColor: 'blue' | 'red';
}) {
  const borderColor = playerColor === 'blue' ? 'border-blue-600' : 'border-red-600';

  return (
    <Card className={`bg-slate-800/50 border-2 ${borderColor}`}>
      <CardHeader>
        <CardDescription className="text-slate-300">
          Entrez les statistiques du joueur (tous les champs sont optionnels)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Général */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Général</h3>

            <div>
              <Label className="text-slate-300">Classement ATP/WTA</Label>
              <Input
                type="number"
                placeholder="ex: 15"
                value={player.ranking || ''}
                onChange={(e) => updateStat('ranking', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Victoires (5 derniers matchs)</Label>
              <Input
                type="number"
                placeholder="ex: 4"
                value={player.wins_last_5 || ''}
                onChange={(e) => updateStat('wins_last_5', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Taux victoire surface (%)</Label>
              <Input
                type="number"
                placeholder="ex: 65"
                value={player.surface_win_rate || ''}
                onChange={(e) => updateStat('surface_win_rate', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Victoires H2H</Label>
              <Input
                type="number"
                placeholder="ex: 3"
                value={player.h2h_wins || ''}
                onChange={(e) => updateStat('h2h_wins', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          {/* Service */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Service</h3>

            <div>
              <Label className="text-slate-300">Aces / match</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="ex: 8.5"
                value={player.aces_per_match || ''}
                onChange={(e) => updateStat('aces_per_match', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Double fautes / match</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="ex: 2.3"
                value={player.double_faults_per_match || ''}
                onChange={(e) => updateStat('double_faults_per_match', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">1ère balle gagnée (%)</Label>
              <Input
                type="number"
                placeholder="ex: 73"
                value={player.first_serve_points_won || ''}
                onChange={(e) => updateStat('first_serve_points_won', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">2nde balle gagnée (%)</Label>
              <Input
                type="number"
                placeholder="ex: 52"
                value={player.second_serve_points_won || ''}
                onChange={(e) => updateStat('second_serve_points_won', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          {/* Retour */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Retour</h3>

            <div>
              <Label className="text-slate-300">1ère balle retour gagnée (%)</Label>
              <Input
                type="number"
                placeholder="ex: 35"
                value={player.first_serve_return_won || ''}
                onChange={(e) => updateStat('first_serve_return_won', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">2nde balle retour gagnée (%)</Label>
              <Input
                type="number"
                placeholder="ex: 55"
                value={player.second_serve_return_won || ''}
                onChange={(e) => updateStat('second_serve_return_won', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Breaks convertis (%)</Label>
              <Input
                type="number"
                placeholder="ex: 42"
                value={player.break_points_converted || ''}
                onChange={(e) => updateStat('break_points_converted', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Breaks sauvés (%)</Label>
              <Input
                type="number"
                placeholder="ex: 65"
                value={player.break_points_saved || ''}
                onChange={(e) => updateStat('break_points_saved', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
