import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Play, Pause, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TennisLiveMatch {
  id: number;
  player1Name: string;
  player2Name: string;

  // Score actuel
  currentSet: number;
  sets: {
    player1: number;
    player2: number;
  };
  currentGame: {
    player1: number;
    player2: number;
  };

  // Stats live
  liveStats: {
    player1: {
      aces: number;
      double_faults: number;
      first_serve_pct: number;
      first_serve_won_pct: number;
      break_points_saved: number;
      break_points_saved_total: number;
    };
    player2: {
      aces: number;
      double_faults: number;
      first_serve_pct: number;
      first_serve_won_pct: number;
      break_points_saved: number;
      break_points_saved_total: number;
    };
  };

  // Prédictions
  predictions?: {
    nextSetWinner: string;
    confidence: number;
    finalScore: string;
    totalGamesRemaining: number;
    recommendations: string[];
  };
}

export default function TennisLive() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<TennisLiveMatch[]>([
    { id: 1, player1Name: '', player2Name: '', currentSet: 1, sets: { player1: 0, player2: 0 }, currentGame: { player1: 0, player2: 0 }, liveStats: createEmptyStats() },
    { id: 2, player1Name: '', player2Name: '', currentSet: 1, sets: { player1: 0, player2: 0 }, currentGame: { player1: 0, player2: 0 }, liveStats: createEmptyStats() },
    { id: 3, player1Name: '', player2Name: '', currentSet: 1, sets: { player1: 0, player2: 0 }, currentGame: { player1: 0, player2: 0 }, liveStats: createEmptyStats() },
    { id: 4, player1Name: '', player2Name: '', currentSet: 1, sets: { player1: 0, player2: 0 }, currentGame: { player1: 0, player2: 0 }, liveStats: createEmptyStats() },
    { id: 5, player1Name: '', player2Name: '', currentSet: 1, sets: { player1: 0, player2: 0 }, currentGame: { player1: 0, player2: 0 }, liveStats: createEmptyStats() },
    { id: 6, player1Name: '', player2Name: '', currentSet: 1, sets: { player1: 0, player2: 0 }, currentGame: { player1: 0, player2: 0 }, liveStats: createEmptyStats() },
  ]);

  const [activeMatch, setActiveMatch] = useState(1);

  function createEmptyStats() {
    return {
      player1: {
        aces: 0,
        double_faults: 0,
        first_serve_pct: 0,
        first_serve_won_pct: 0,
        break_points_saved: 0,
        break_points_saved_total: 0,
      },
      player2: {
        aces: 0,
        double_faults: 0,
        first_serve_pct: 0,
        first_serve_won_pct: 0,
        break_points_saved: 0,
        break_points_saved_total: 0,
      }
    };
  }

  const updateMatch = (matchId: number, updates: Partial<TennisLiveMatch>) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, ...updates } : m));
  };

  const analyzeLiveMatch = (matchId: number) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const p1 = match.liveStats.player1;
    const p2 = match.liveStats.player2;

    // Calcul ratings basé sur stats live
    let rating1 = 1000;
    rating1 += p1.aces * 20;
    rating1 -= p1.double_faults * 25;
    rating1 += p1.first_serve_won_pct * 3;
    if (p1.break_points_saved_total > 0) {
      rating1 += (p1.break_points_saved / p1.break_points_saved_total) * 200;
    }
    rating1 += match.sets.player1 * 300; // Bonus sets gagnés

    let rating2 = 1000;
    rating2 += p2.aces * 20;
    rating2 -= p2.double_faults * 25;
    rating2 += p2.first_serve_won_pct * 3;
    if (p2.break_points_saved_total > 0) {
      rating2 += (p2.break_points_saved / p2.break_points_saved_total) * 200;
    }
    rating2 += match.sets.player2 * 300;

    const totalRating = rating1 + rating2;
    const p1Prob = rating1 / totalRating;
    const p2Prob = rating2 / totalRating;

    const nextSetWinner = p1Prob > p2Prob ? match.player1Name || 'Joueur 1' : match.player2Name || 'Joueur 2';
    const confidence = Math.max(p1Prob, p2Prob) * 100;

    // Prédiction score final
    const setsNeeded = 2; // Best of 3
    const p1SetsToWin = setsNeeded - match.sets.player1;
    const p2SetsToWin = setsNeeded - match.sets.player2;

    let finalScore = '';
    if (confidence > 70) {
      finalScore = p1Prob > p2Prob
        ? `${setsNeeded}-${match.sets.player2}`
        : `${match.sets.player1}-${setsNeeded}`;
    } else {
      finalScore = p1Prob > p2Prob
        ? `${setsNeeded}-${setsNeeded - 1}`
        : `${setsNeeded - 1}-${setsNeeded}`;
    }

    // Recommendations
    const recommendations: string[] = [];

    if (match.sets.player1 > match.sets.player2 || match.sets.player2 > match.sets.player1) {
      const leader = match.sets.player1 > match.sets.player2 ? match.player1Name : match.player2Name;
      recommendations.push(`🎯 ${leader} mène au score - probabilité victoire augmentée`);
    }

    const totalAces = p1.aces + p2.aces;
    const avgAcesPerSet = totalAces / (match.sets.player1 + match.sets.player2 + match.currentSet);
    if (avgAcesPerSet > 4) {
      recommendations.push(`⚡ Rythme soutenu de services gagnants (${totalAces} aces)`);
    }

    const p1BreakSavedPct = p1.break_points_saved_total > 0 ? (p1.break_points_saved / p1.break_points_saved_total) * 100 : 0;
    const p2BreakSavedPct = p2.break_points_saved_total > 0 ? (p2.break_points_saved / p2.break_points_saved_total) * 100 : 0;

    if (p1BreakSavedPct < 50 || p2BreakSavedPct < 50) {
      recommendations.push(`🔓 Breaks fréquents - match instable`);
    }

    updateMatch(matchId, {
      predictions: {
        nextSetWinner,
        confidence: Math.round(confidence),
        finalScore,
        totalGamesRemaining: 12, // Estimation
        recommendations
      }
    });
  };

  const currentMatch = matches.find(m => m.id === activeMatch);

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
                Tennis Live - 6 Matchs
              </h1>
              <p className="text-slate-400">Suivi temps réel avec prédictions adaptatives</p>
            </div>
          </div>
        </div>

        {/* Sélecteur de matchs */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Matchs en Direct</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {matches.map(match => (
                <Button
                  key={match.id}
                  onClick={() => setActiveMatch(match.id)}
                  variant={activeMatch === match.id ? 'default' : 'outline'}
                  className={activeMatch === match.id
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                  }
                >
                  <Play className="mr-2 h-4 w-4" />
                  Match {match.id}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Formulaire du match actif */}
        {currentMatch && (
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="stats">Stats Live</TabsTrigger>
              <TabsTrigger value="predictions">Prédictions</TabsTrigger>
            </TabsList>

            {/* Tab Informations */}
            <TabsContent value="info">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Match {currentMatch.id} - Score & Joueurs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Joueur 1</Label>
                      <Input
                        value={currentMatch.player1Name}
                        onChange={(e) => updateMatch(currentMatch.id, { player1Name: e.target.value })}
                        placeholder="Nom Joueur 1"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Joueur 2</Label>
                      <Input
                        value={currentMatch.player2Name}
                        onChange={(e) => updateMatch(currentMatch.id, { player2Name: e.target.value })}
                        placeholder="Nom Joueur 2"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-300">Sets Joueur 1</Label>
                      <Input
                        type="number"
                        value={currentMatch.sets.player1}
                        onChange={(e) => updateMatch(currentMatch.id, {
                          sets: { ...currentMatch.sets, player1: parseInt(e.target.value) || 0 }
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Set en cours</Label>
                      <Input
                        type="number"
                        value={currentMatch.currentSet}
                        onChange={(e) => updateMatch(currentMatch.id, { currentSet: parseInt(e.target.value) || 1 })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Sets Joueur 2</Label>
                      <Input
                        type="number"
                        value={currentMatch.sets.player2}
                        onChange={(e) => updateMatch(currentMatch.id, {
                          sets: { ...currentMatch.sets, player2: parseInt(e.target.value) || 0 }
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Jeux Joueur 1 (set actuel)</Label>
                      <Input
                        type="number"
                        value={currentMatch.currentGame.player1}
                        onChange={(e) => updateMatch(currentMatch.id, {
                          currentGame: { ...currentMatch.currentGame, player1: parseInt(e.target.value) || 0 }
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Jeux Joueur 2 (set actuel)</Label>
                      <Input
                        type="number"
                        value={currentMatch.currentGame.player2}
                        onChange={(e) => updateMatch(currentMatch.id, {
                          currentGame: { ...currentMatch.currentGame, player2: parseInt(e.target.value) || 0 }
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Stats Live */}
            <TabsContent value="stats">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Statistiques Live - Match {currentMatch.id}</CardTitle>
                  <CardDescription className="text-slate-300">
                    Mettez à jour les stats en temps réel depuis votre source
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Joueur 1 */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold text-lg border-b border-blue-600 pb-2">
                        {currentMatch.player1Name || 'Joueur 1'}
                      </h3>

                      <div>
                        <Label className="text-slate-300">Aces</Label>
                        <Input
                          type="number"
                          value={currentMatch.liveStats.player1.aces}
                          onChange={(e) => updateMatch(currentMatch.id, {
                            liveStats: {
                              ...currentMatch.liveStats,
                              player1: { ...currentMatch.liveStats.player1, aces: parseInt(e.target.value) || 0 }
                            }
                          })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-slate-300">Doubles fautes</Label>
                        <Input
                          type="number"
                          value={currentMatch.liveStats.player1.double_faults}
                          onChange={(e) => updateMatch(currentMatch.id, {
                            liveStats: {
                              ...currentMatch.liveStats,
                              player1: { ...currentMatch.liveStats.player1, double_faults: parseInt(e.target.value) || 0 }
                            }
                          })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-slate-300">1ère balle gagnée (%)</Label>
                        <Input
                          type="number"
                          value={currentMatch.liveStats.player1.first_serve_won_pct}
                          onChange={(e) => updateMatch(currentMatch.id, {
                            liveStats: {
                              ...currentMatch.liveStats,
                              player1: { ...currentMatch.liveStats.player1, first_serve_won_pct: parseInt(e.target.value) || 0 }
                            }
                          })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-slate-300 text-sm">Breaks sauvés</Label>
                          <Input
                            type="number"
                            value={currentMatch.liveStats.player1.break_points_saved}
                            onChange={(e) => updateMatch(currentMatch.id, {
                              liveStats: {
                                ...currentMatch.liveStats,
                                player1: { ...currentMatch.liveStats.player1, break_points_saved: parseInt(e.target.value) || 0 }
                              }
                            })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300 text-sm">Total</Label>
                          <Input
                            type="number"
                            value={currentMatch.liveStats.player1.break_points_saved_total}
                            onChange={(e) => updateMatch(currentMatch.id, {
                              liveStats: {
                                ...currentMatch.liveStats,
                                player1: { ...currentMatch.liveStats.player1, break_points_saved_total: parseInt(e.target.value) || 0 }
                              }
                            })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Joueur 2 */}
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold text-lg border-b border-red-600 pb-2">
                        {currentMatch.player2Name || 'Joueur 2'}
                      </h3>

                      <div>
                        <Label className="text-slate-300">Aces</Label>
                        <Input
                          type="number"
                          value={currentMatch.liveStats.player2.aces}
                          onChange={(e) => updateMatch(currentMatch.id, {
                            liveStats: {
                              ...currentMatch.liveStats,
                              player2: { ...currentMatch.liveStats.player2, aces: parseInt(e.target.value) || 0 }
                            }
                          })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-slate-300">Doubles fautes</Label>
                        <Input
                          type="number"
                          value={currentMatch.liveStats.player2.double_faults}
                          onChange={(e) => updateMatch(currentMatch.id, {
                            liveStats: {
                              ...currentMatch.liveStats,
                              player2: { ...currentMatch.liveStats.player2, double_faults: parseInt(e.target.value) || 0 }
                            }
                          })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-slate-300">1ère balle gagnée (%)</Label>
                        <Input
                          type="number"
                          value={currentMatch.liveStats.player2.first_serve_won_pct}
                          onChange={(e) => updateMatch(currentMatch.id, {
                            liveStats: {
                              ...currentMatch.liveStats,
                              player2: { ...currentMatch.liveStats.player2, first_serve_won_pct: parseInt(e.target.value) || 0 }
                            }
                          })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-slate-300 text-sm">Breaks sauvés</Label>
                          <Input
                            type="number"
                            value={currentMatch.liveStats.player2.break_points_saved}
                            onChange={(e) => updateMatch(currentMatch.id, {
                              liveStats: {
                                ...currentMatch.liveStats,
                                player2: { ...currentMatch.liveStats.player2, break_points_saved: parseInt(e.target.value) || 0 }
                              }
                            })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300 text-sm">Total</Label>
                          <Input
                            type="number"
                            value={currentMatch.liveStats.player2.break_points_saved_total}
                            onChange={(e) => updateMatch(currentMatch.id, {
                              liveStats: {
                                ...currentMatch.liveStats,
                                player2: { ...currentMatch.liveStats.player2, break_points_saved_total: parseInt(e.target.value) || 0 }
                              }
                            })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => analyzeLiveMatch(currentMatch.id)}
                    className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analyser & Générer Prédictions
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Prédictions */}
            <TabsContent value="predictions">
              {currentMatch.predictions ? (
                <div className="space-y-4">
                  <Card className="bg-gradient-to-r from-green-900/50 to-green-800/50 border-green-700">
                    <CardHeader>
                      <CardTitle className="text-white">Vainqueur Prédit</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">
                          {currentMatch.predictions.nextSetWinner}
                        </div>
                        <div className="text-2xl text-green-300">
                          Confiance: {currentMatch.predictions.confidence}%
                        </div>
                        <div className="text-lg text-slate-300 mt-2">
                          Score prédit: {currentMatch.predictions.finalScore}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {currentMatch.predictions.recommendations.length > 0 && (
                    <Card className="bg-blue-900/30 border-blue-700/50">
                      <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Recommandations Live
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {currentMatch.predictions.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-blue-200 text-sm">{rec}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="text-center text-slate-400">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                      <p>Aucune prédiction générée.</p>
                      <p className="text-sm mt-2">Remplissez les stats live et cliquez sur "Analyser"</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
