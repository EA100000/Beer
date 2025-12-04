import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, TrendingUp, AlertCircle, CheckCircle2, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MatchData {
  homeTeam: string;
  awayTeam: string;
  homeElo: number;
  awayElo: number;
  homeForm?: number;
  awayForm?: number;
  league?: string;
}

interface MarketPrediction {
  market: string;
  probability: number;
  recommendation: 'FORTE' | 'OUI' | 'ÉVITER' | 'NON';
  warning?: string;
}

interface MatchPredictions {
  match: MatchData;
  goals: {
    expected: number;
    predictions: MarketPrediction[];
  };
  corners: {
    expected: number;
    predictions: MarketPrediction[];
  };
  fouls: {
    expected: number;
    predictions: MarketPrediction[];
  };
  throwIns: {
    expected: number;
    predictions: MarketPrediction[];
  };
  doubleChance: MarketPrediction[];
}

export default function DailyPredictions() {
  const navigate = useNavigate();
  const [inputData, setInputData] = useState('');
  const [predictions, setPredictions] = useState<MatchPredictions[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Parser les données collées
  const parseMatchData = (text: string): MatchData[] => {
    const matches: MatchData[] = [];
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
      // Format attendu: "Équipe A vs Équipe B | Elo A | Elo B | Forme A | Forme B | Ligue"
      // ou simplement: "Équipe A vs Équipe B | Elo A | Elo B"
      const parts = line.split('|').map(p => p.trim());

      if (parts.length < 3) continue;

      const teams = parts[0].split(/\s+vs\s+/i);
      if (teams.length !== 2) continue;

      const homeElo = parseFloat(parts[1]);
      const awayElo = parseFloat(parts[2]);

      if (isNaN(homeElo) || isNaN(awayElo)) continue;

      matches.push({
        homeTeam: teams[0].trim(),
        awayTeam: teams[1].trim(),
        homeElo,
        awayElo,
        homeForm: parts[3] ? parseFloat(parts[3]) : undefined,
        awayForm: parts[4] ? parseFloat(parts[4]) : undefined,
        league: parts[5] || 'Non spécifié'
      });
    }

    return matches;
  };

  // Système de prédiction basé sur priority-markets-system.cjs
  const predictGoals = (homeElo: number, awayElo: number, homeForm = 0, awayForm = 0): { expected: number; predictions: MarketPrediction[] } => {
    const eloAvg = (homeElo + awayElo) / 2;
    const eloDiff = Math.abs(homeElo - awayElo);

    // Données apprises depuis 132k matchs
    let avgGoals = 2.7;
    let over25Prob = 0.50;
    let over15Prob = 0.75;
    let under35Prob = 0.72;

    if (eloAvg < 1600) {
      avgGoals = 2.58;
      over25Prob = 0.475;
      over15Prob = 0.73;
    } else if (eloAvg < 1700) {
      avgGoals = 2.65;
      over25Prob = 0.49;
      over15Prob = 0.74;
    } else if (eloAvg < 1800) {
      avgGoals = 2.75;
      over25Prob = 0.52;
      over15Prob = 0.76;
    } else {
      avgGoals = 3.05;
      over25Prob = 0.58;
      over15Prob = 0.80;
    }

    // Ajustement forme
    const formeDiff = homeForm - awayForm;
    avgGoals += formeDiff * 0.05;

    return {
      expected: avgGoals,
      predictions: [
        {
          market: 'Over 0.5',
          probability: 92.7,
          recommendation: 'FORTE'
        },
        {
          market: 'Over 1.5',
          probability: over15Prob * 100,
          recommendation: over15Prob >= 0.75 ? 'OUI' : 'ÉVITER'
        },
        {
          market: 'Over 2.5',
          probability: over25Prob * 100,
          recommendation: over25Prob >= 0.55 ? 'OUI' : 'ÉVITER',
          warning: over25Prob < 0.50 ? '⚠️ RISQUÉ en ligues faibles' : undefined
        },
        {
          market: 'Under 3.5',
          probability: under35Prob * 100,
          recommendation: under35Prob >= 0.70 ? 'OUI' : 'ÉVITER'
        },
        {
          market: 'Under 4.5',
          probability: 85.8,
          recommendation: 'OUI'
        }
      ]
    };
  };

  const predictCorners = (homeElo: number, awayElo: number): { expected: number; predictions: MarketPrediction[] } => {
    const eloAvg = (homeElo + awayElo) / 2;
    const avgCorners = 10.2; // Moyenne réelle sur 132k matchs

    return {
      expected: avgCorners,
      predictions: [
        {
          market: 'Over 8.5',
          probability: 63.0,
          recommendation: 'ÉVITER'
        },
        {
          market: 'Over 9.5',
          probability: 52.0,
          recommendation: 'ÉVITER',
          warning: '⚠️ Marché aléatoire (50-52%)'
        },
        {
          market: 'Under 11.5',
          probability: 71.5,
          recommendation: 'OUI'
        },
        {
          market: 'Under 12.5',
          probability: 79.8,
          recommendation: 'OUI'
        }
      ]
    };
  };

  const predictFouls = (homeElo: number, awayElo: number): { expected: number; predictions: MarketPrediction[] } => {
    const avgFouls = 23.5;

    return {
      expected: avgFouls,
      predictions: [
        {
          market: 'Over 20.5',
          probability: 73.4,
          recommendation: 'OUI'
        },
        {
          market: 'Over 22.5',
          probability: 62.0,
          recommendation: 'ÉVITER'
        },
        {
          market: 'Under 26.5',
          probability: 68.0,
          recommendation: 'ÉVITER'
        }
      ]
    };
  };

  const predictThrowIns = (): { expected: number; predictions: MarketPrediction[] } => {
    return {
      expected: 45.0,
      predictions: [
        {
          market: 'Over 35.5',
          probability: 70.0,
          recommendation: 'ÉVITER',
          warning: '⚠️ Données estimées (non disponibles)'
        },
        {
          market: 'Over 40.5',
          probability: 55.0,
          recommendation: 'ÉVITER',
          warning: '⚠️ Données estimées (non disponibles)'
        }
      ]
    };
  };

  const predictDoubleChance = (homeElo: number, awayElo: number): MarketPrediction[] => {
    const eloDiff = homeElo - awayElo;

    let prob1X = 0.65;
    let prob2X = 0.65;
    let prob12 = 0.85;

    if (eloDiff > 150) {
      prob1X = 0.80;
      prob2X = 0.50;
    } else if (eloDiff > 75) {
      prob1X = 0.72;
      prob2X = 0.58;
    } else if (eloDiff < -150) {
      prob1X = 0.50;
      prob2X = 0.80;
    } else if (eloDiff < -75) {
      prob1X = 0.58;
      prob2X = 0.72;
    }

    return [
      {
        market: '1X (Domicile ou Nul)',
        probability: prob1X * 100,
        recommendation: prob1X >= 0.70 ? 'OUI' : 'ÉVITER'
      },
      {
        market: '2X (Extérieur ou Nul)',
        probability: prob2X * 100,
        recommendation: prob2X >= 0.70 ? 'OUI' : 'ÉVITER'
      },
      {
        market: '12 (Domicile ou Extérieur)',
        probability: prob12 * 100,
        recommendation: 'OUI'
      }
    ];
  };

  const handleAnalyze = () => {
    setLoading(true);
    setError('');
    setPredictions([]);

    setTimeout(() => {
      try {
        const matches = parseMatchData(inputData);

        if (matches.length === 0) {
          setError('Aucun match valide détecté. Format attendu: "Équipe A vs Équipe B | Elo A | Elo B"');
          setLoading(false);
          return;
        }

        const results: MatchPredictions[] = matches.map(match => ({
          match,
          goals: predictGoals(match.homeElo, match.awayElo, match.homeForm, match.awayForm),
          corners: predictCorners(match.homeElo, match.awayElo),
          fouls: predictFouls(match.homeElo, match.awayElo),
          throwIns: predictThrowIns(),
          doubleChance: predictDoubleChance(match.homeElo, match.awayElo)
        }));

        setPredictions(results);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors de l\'analyse. Vérifiez le format des données.');
        setLoading(false);
      }
    }, 500);
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'FORTE': return 'bg-green-600';
      case 'OUI': return 'bg-blue-600';
      case 'ÉVITER': return 'bg-orange-600';
      case 'NON': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-white/10 text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-400" />
              Prédictions Quotidiennes
            </h1>
            <p className="text-gray-300">Analysez plusieurs matchs du jour en une seule fois</p>
          </div>
        </div>

        {/* Input Section */}
        <Card className="mb-6 border-2 border-blue-500/30 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Données des Matchs
            </CardTitle>
            <CardDescription className="text-gray-300">
              Collez les données de vos matchs (un par ligne)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-sm text-gray-300">
              <p className="font-semibold mb-2">📋 Format attendu (un match par ligne):</p>
              <code className="block bg-slate-900/50 p-2 rounded mb-2">
                Équipe A vs Équipe B | Elo A | Elo B | Forme A | Forme B | Ligue
              </code>
              <p className="text-xs text-gray-400 mb-2">Les champs Forme et Ligue sont optionnels</p>
              <p className="font-semibold mb-1">Exemple:</p>
              <code className="block bg-slate-900/50 p-2 rounded text-xs">
                Manchester City vs Liverpool | 1850 | 1820 | 2.5 | 2.2 | Premier League<br/>
                PSG vs Marseille | 1780 | 1650 | 2.8 | 1.9 | Ligue 1<br/>
                Bayern vs Dortmund | 1900 | 1750
              </code>
            </div>

            <Textarea
              placeholder="Collez vos matchs ici..."
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              className="min-h-[200px] bg-slate-900/50 border-slate-700 text-white font-mono text-sm"
            />

            {error && (
              <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-300">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={loading || !inputData.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {loading ? 'Analyse en cours...' : 'Analyser les Matchs'}
            </Button>
          </CardContent>
        </Card>

        {/* Predictions */}
        {predictions.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-white">
              <Trophy className="h-6 w-6 text-yellow-400" />
              <h2 className="text-2xl font-bold">
                {predictions.length} Match{predictions.length > 1 ? 's' : ''} Analysé{predictions.length > 1 ? 's' : ''}
              </h2>
            </div>

            {predictions.map((pred, index) => (
              <Card key={index} className="border-2 border-blue-500/30 bg-slate-800/70">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white">
                        {pred.match.homeTeam} vs {pred.match.awayTeam}
                      </CardTitle>
                      <CardDescription className="text-gray-300 mt-1">
                        Elo: {pred.match.homeElo} - {pred.match.awayElo} | {pred.match.league}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Buts */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        ⚽ Buts
                        <span className="text-sm text-gray-400">({pred.goals.expected.toFixed(2)} attendus)</span>
                      </h3>
                      <div className="space-y-1">
                        {pred.goals.predictions.map((p, i) => (
                          <div key={i} className="bg-slate-900/50 rounded p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-300">{p.market}</span>
                              <Badge className={getRecommendationColor(p.recommendation)}>
                                {p.recommendation}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400">{p.probability.toFixed(1)}%</p>
                            {p.warning && <p className="text-xs text-orange-400 mt-1">{p.warning}</p>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Corners */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        🚩 Corners
                        <span className="text-sm text-gray-400">({pred.corners.expected.toFixed(1)} attendus)</span>
                      </h3>
                      <div className="space-y-1">
                        {pred.corners.predictions.map((p, i) => (
                          <div key={i} className="bg-slate-900/50 rounded p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-300">{p.market}</span>
                              <Badge className={getRecommendationColor(p.recommendation)}>
                                {p.recommendation}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400">{p.probability.toFixed(1)}%</p>
                            {p.warning && <p className="text-xs text-orange-400 mt-1">{p.warning}</p>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fautes */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        🟨 Fautes
                        <span className="text-sm text-gray-400">({pred.fouls.expected.toFixed(1)} attendues)</span>
                      </h3>
                      <div className="space-y-1">
                        {pred.fouls.predictions.map((p, i) => (
                          <div key={i} className="bg-slate-900/50 rounded p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-300">{p.market}</span>
                              <Badge className={getRecommendationColor(p.recommendation)}>
                                {p.recommendation}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400">{p.probability.toFixed(1)}%</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Touches */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        🔄 Touches
                        <span className="text-sm text-gray-400">({pred.throwIns.expected.toFixed(0)} attendues)</span>
                      </h3>
                      <div className="space-y-1">
                        {pred.throwIns.predictions.map((p, i) => (
                          <div key={i} className="bg-slate-900/50 rounded p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-300">{p.market}</span>
                              <Badge className={getRecommendationColor(p.recommendation)}>
                                {p.recommendation}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400">{p.probability.toFixed(1)}%</p>
                            {p.warning && <p className="text-xs text-orange-400 mt-1">{p.warning}</p>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Double Chance */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-white">🎯 Double Chance</h3>
                      <div className="space-y-1">
                        {pred.doubleChance.map((p, i) => (
                          <div key={i} className="bg-slate-900/50 rounded p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-300">{p.market}</span>
                              <Badge className={getRecommendationColor(p.recommendation)}>
                                {p.recommendation}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400">{p.probability.toFixed(1)}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Légende */}
            <Card className="border-blue-500/30 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white text-sm">📊 Légende des Recommandations</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600">FORTE</Badge>
                  <span className="text-gray-300">≥90% fiabilité - Très recommandé</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600">OUI</Badge>
                  <span className="text-gray-300">≥70% fiabilité - Recommandé</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-600">ÉVITER</Badge>
                  <span className="text-gray-300">&lt;70% fiabilité - Risqué</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-600">NON</Badge>
                  <span className="text-gray-300">&lt;50% fiabilité - Ne pas parier</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
