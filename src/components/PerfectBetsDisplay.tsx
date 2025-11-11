/**
 * AFFICHAGE ÉPURÉ - SEULEMENT LES MEILLEURS PARIS
 *
 * Design simple, clair, direct
 * Seulement les prédictions à 85%+
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PerfectPrediction } from '@/utils/perfectPredictions';
import { CheckCircle, TrendingUp, Star } from 'lucide-react';

interface PerfectBetsDisplayProps {
  predictions: PerfectPrediction[];
  homeTeam: string;
  awayTeam: string;
}

export function PerfectBetsDisplay({ predictions, homeTeam, awayTeam }: PerfectBetsDisplayProps) {
  if (predictions.length === 0) {
    return (
      <Card className="border-yellow-300 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">
            Aucun Paris Parfait Disponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700">
            Les statistiques fournies ne permettent pas de générer des paris à 85%+ de probabilité.
            Essayez de fournir plus de données (buts, tirs cadrés, possession, etc.)
          </p>
        </CardContent>
      </Card>
    );
  }

  const strongBets = predictions.filter(p => p.recommendation === 'STRONG');
  const goodBets = predictions.filter(p => p.recommendation === 'GOOD');

  return (
    <Card className="border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Star className="h-7 w-7" />
          ⚡ LES MEILLEURS PARIS - {homeTeam} vs {awayTeam}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">

        {/* Résumé */}
        <div className="bg-white rounded-lg p-4 border-2 border-green-300 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-green-700">
                {predictions.length} PARIS PARFAITS
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {strongBets.length} ultra-sûrs • {goodBets.length} très sûrs
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-green-600">85-95%</p>
              <p className="text-xs text-gray-600">Probabilité</p>
            </div>
          </div>
        </div>

        {/* ULTRA-SÛRS (90%+) */}
        {strongBets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-1 bg-green-600 rounded"></div>
              <h3 className="text-lg font-bold text-green-800">
                🔥 ULTRA-SÛRS (90%+)
              </h3>
            </div>

            {strongBets.map((pred, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 border-2 border-green-500 shadow hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between">
                  {/* Gauche : Prédiction */}
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 text-white rounded-full p-2">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">{pred.category}</div>
                      <div className="text-xl font-bold text-gray-900">
                        {pred.prediction}
                      </div>
                    </div>
                  </div>

                  {/* Centre : Probabilité */}
                  <div className="text-center px-6">
                    <div className="text-4xl font-black text-green-600">
                      {pred.probability}%
                    </div>
                    <div className="text-xs text-gray-500">Probabilité</div>
                  </div>

                  {/* Droite : Cote */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {pred.odds}
                    </div>
                    <div className="text-xs text-gray-500">Cote estimée</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TRÈS SÛRS (85-89%) */}
        {goodBets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-1 bg-blue-600 rounded"></div>
              <h3 className="text-lg font-bold text-blue-800">
                ✅ TRÈS SÛRS (85-89%)
              </h3>
            </div>

            {goodBets.map((pred, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 border-2 border-blue-400 shadow hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between">
                  {/* Gauche : Prédiction */}
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white rounded-full p-2">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">{pred.category}</div>
                      <div className="text-xl font-bold text-gray-900">
                        {pred.prediction}
                      </div>
                    </div>
                  </div>

                  {/* Centre : Probabilité */}
                  <div className="text-center px-6">
                    <div className="text-4xl font-black text-blue-600">
                      {pred.probability}%
                    </div>
                    <div className="text-xs text-gray-500">Probabilité</div>
                  </div>

                  {/* Droite : Cote */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {pred.odds}
                    </div>
                    <div className="text-xs text-gray-500">Cote estimée</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Combiné Suggéré */}
        {predictions.length >= 2 && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-5 border-2 border-purple-400 shadow">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-bold text-purple-900">
                💎 COMBINÉ RECOMMANDÉ
              </h3>
            </div>

            <div className="space-y-2 mb-4">
              {predictions.slice(0, 3).map((pred, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-purple-600">✓</span>
                  <span className="font-semibold text-purple-900">{pred.prediction}</span>
                  <span className="text-purple-700">({pred.probability}%)</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded p-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600">Probabilité Combinée</div>
                <div className="text-2xl font-black text-purple-600">
                  {Math.round(
                    predictions.slice(0, 3).reduce((acc, p) => acc * (p.probability / 100), 1) * 100
                  )}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Cote Totale</div>
                <div className="text-2xl font-black text-green-600">
                  {predictions.slice(0, 3).reduce((acc, p) => acc * p.odds, 1).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Gain pour 10€</div>
                <div className="text-2xl font-black text-blue-600">
                  {(10 * predictions.slice(0, 3).reduce((acc, p) => acc * p.odds, 1)).toFixed(0)}€
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conseil */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
          <p className="font-bold text-blue-900 mb-2">💡 CONSEIL :</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Miser 3-5% du bankroll sur les paris ULTRA-SÛRS</li>
            <li>• Miser 2-3% du bankroll sur les paris TRÈS SÛRS</li>
            <li>• Combiner 2-3 paris pour multiplier les gains</li>
            <li>• Ne JAMAIS dépasser 10% du bankroll sur un seul pari</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t">
          Système de Prédictions Parfaites - Filtrage strict 85%+ uniquement
        </div>
      </CardContent>
    </Card>
  );
}
