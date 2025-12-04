import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Radio, Trophy, Sparkles, Calendar } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white">Pari365</h1>
          <p className="text-xl text-slate-300">Système de prédiction intelligent basé sur 113,972 matchs réels</p>
          <p className="text-lg text-slate-400">Précision : 78-98% selon les marchés</p>
        </div>

        {/* Rangée 1: Prédictions Quotidiennes - Featured */}
        <Card
          className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border-2 border-blue-500 hover:border-blue-400 transition-all cursor-pointer shadow-lg"
          onClick={() => navigate('/daily')}
        >
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-10 w-10 text-blue-400" />
              <div>
                <CardTitle className="text-3xl text-white">Prédictions Quotidiennes</CardTitle>
                <CardDescription className="text-blue-200 text-base">
                  🔥 Analysez tous vos matchs du jour en une seule fois
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-slate-200">
                <li>• Collez plusieurs matchs à la fois</li>
                <li>• Format simple: Équipe vs Équipe | Elo | Elo</li>
                <li>• 5 marchés prioritaires analysés</li>
              </ul>
              <ul className="space-y-2 text-slate-200">
                <li>• ⚽ Buts (Over/Under 0.5 à 4.5)</li>
                <li>• 🚩 Corners, 🟨 Fautes, 🔄 Touches</li>
                <li>• 🎯 Double Chance (1X, 2X, 12)</li>
              </ul>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 mt-4 text-lg h-12"
              onClick={() => navigate('/daily')}
            >
              Analyser mes Matchs du Jour
            </Button>
          </CardContent>
        </Card>

        {/* Rangée 2: Autres analyses */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pari Pré-Match */}
          <Card
            className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all cursor-pointer"
            onClick={() => navigate('/pre-match')}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-8 w-8 text-green-500" />
                <CardTitle className="text-xl text-white">Pari Pré-Match</CardTitle>
              </div>
              <CardDescription className="text-slate-300 text-sm">
                Analyse avant le match
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-slate-300 text-sm mb-4">
                <li>• Copier-coller SofaScore</li>
                <li>• Over/Under 98% confiance</li>
                <li>• Corners, Fautes, Cartons</li>
              </ul>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/pre-match')}
              >
                Accéder
              </Button>
            </CardContent>
          </Card>

          {/* Pari Live */}
          <Card
            className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all cursor-pointer"
            onClick={() => navigate('/live')}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Radio className="h-8 w-8 text-red-500" />
                <CardTitle className="text-xl text-white">Pari Live</CardTitle>
              </div>
              <CardDescription className="text-slate-300 text-sm">
                4 matchs en direct
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-slate-300 text-sm mb-4">
                <li>• Temps réel</li>
                <li>• Prédictions adaptatives</li>
                <li>• Alertes opportunités</li>
              </ul>
              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => navigate('/live')}
              >
                Accéder
              </Button>
            </CardContent>
          </Card>

          {/* Tennis */}
          <Card
            className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all cursor-pointer"
            onClick={() => navigate('/tennis')}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <CardTitle className="text-xl text-white">Tennis</CardTitle>
              </div>
              <CardDescription className="text-slate-300 text-sm">
                Matchs ATP/WTA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-slate-300 text-sm mb-4">
                <li>• Vainqueur prédit</li>
                <li>• Total jeux Over/Under</li>
                <li>• Aces et Breaks</li>
              </ul>
              <Button
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                onClick={() => navigate('/tennis')}
              >
                Accéder
              </Button>
            </CardContent>
          </Card>

          {/* Loto */}
          <Card
            className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all cursor-pointer"
            onClick={() => navigate('/loto')}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-8 w-8 text-purple-500" />
                <CardTitle className="text-xl text-white">Loto</CardTitle>
              </div>
              <CardDescription className="text-slate-300 text-sm">
                Générateur loteries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-slate-300 text-sm mb-4">
                <li>• Loto France, EuroMillions</li>
                <li>• Powerball, Mega Millions</li>
                <li>• 4 méthodes génération</li>
              </ul>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => navigate('/loto')}
              >
                Accéder
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-slate-400 text-sm">
          <p>Données calibrées sur 113,972 matchs réels • Coefficients de variation réels • Facteurs domicile/extérieur précis</p>
        </div>
      </div>
    </div>
  );
}
