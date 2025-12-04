import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Radio, Trophy, Sparkles } from 'lucide-react';

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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pari Pré-Match */}
          <Card
            className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all cursor-pointer"
            onClick={() => navigate('/pre-match')}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-8 w-8 text-green-500" />
                <CardTitle className="text-2xl text-white">Pari Pré-Match</CardTitle>
              </div>
              <CardDescription className="text-slate-300">
                Analyse avant le match avec données complètes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-300 mb-6">
                <li>• Copier-coller depuis SofaScore</li>
                <li>• Prédictions Over/Under (98% confiance)</li>
                <li>• Corners, Fautes, Cartons</li>
                <li>• Top 10 des meilleures prédictions</li>
              </ul>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/pre-match')}
              >
                Accéder aux Paris Pré-Match
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
                <CardTitle className="text-2xl text-white">Pari Live</CardTitle>
              </div>
              <CardDescription className="text-slate-300">
                Suivi de 4 matchs en direct simultanément
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-300 mb-6">
                <li>• 4 matchs en temps réel</li>
                <li>• Mise à jour manuelle des stats</li>
                <li>• Prédictions adaptatives</li>
                <li>• Alertes sur opportunités</li>
              </ul>
              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => navigate('/live')}
              >
                Accéder aux Paris Live
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
                <CardTitle className="text-2xl text-white">Tennis</CardTitle>
              </div>
              <CardDescription className="text-slate-300">
                Prédictions pour matchs de tennis ATP/WTA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-300 mb-6">
                <li>• Vainqueur et score prédit</li>
                <li>• Total jeux Over/Under</li>
                <li>• Total Aces prédits</li>
                <li>• Break de service</li>
              </ul>
              <Button
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                onClick={() => navigate('/tennis')}
              >
                Accéder à l'Analyse Tennis
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
                <CardTitle className="text-2xl text-white">Loto</CardTitle>
              </div>
              <CardDescription className="text-slate-300">
                Générateur de numéros pour loteries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-300 mb-6">
                <li>• Loto France, EuroMillions</li>
                <li>• Powerball, Mega Millions</li>
                <li>• 4 méthodes de génération</li>
                <li>• Jusqu'à 10 grilles</li>
              </ul>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => navigate('/loto')}
              >
                Générer des Numéros
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
