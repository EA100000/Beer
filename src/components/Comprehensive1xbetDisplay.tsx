import { Card } from "@/components/ui/card";
import { Comprehensive1xbetMarkets } from "@/utils/comprehensive1xbetMarkets";

interface Props {
  markets: Comprehensive1xbetMarkets;
  homeTeam: string;
  awayTeam: string;
}

export default function Comprehensive1xbetDisplay({ markets, homeTeam, awayTeam }: Props) {
  return (
    <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-purple-600">
      <h2 className="text-3xl font-bold text-purple-300 mb-6">
        🎯 TOUTES LES PRÉDICTIONS - {homeTeam} vs {awayTeam}
      </h2>

      {/* BUTS */}
      <div className="mb-6 p-4 bg-green-900/30 border border-green-600 rounded">
        <h3 className="text-xl font-bold text-green-400 mb-3">⚽ BUTS</h3>
        <div className="space-y-2">
          {markets.goals.totalGoals.predictions.map((pred, idx) => (
            <div key={idx} className="p-3 bg-slate-800 rounded border border-green-500">
              <div className="flex justify-between">
                <span className="text-white font-bold">
                  {pred.prediction} {pred.threshold} buts
                </span>
                <span className="text-green-400 font-bold">
                  {pred.confidence}% | Projeté: {pred.projected}
                </span>
              </div>
            </div>
          ))}
          {markets.goals.totalGoals.predictions.length === 0 && (
            <div className="text-red-400">Aucune prédiction buts</div>
          )}
        </div>
      </div>

      {/* CORNERS */}
      <div className="mb-6 p-4 bg-cyan-900/30 border border-cyan-600 rounded">
        <h3 className="text-xl font-bold text-cyan-400 mb-3">🚩 CORNERS</h3>
        <div className="space-y-2">
          {markets.corners.total.predictions.map((pred, idx) => (
            <div key={idx} className="p-3 bg-slate-800 rounded border border-cyan-500">
              <div className="flex justify-between">
                <span className="text-white font-bold">
                  {pred.prediction} {pred.threshold} corners
                </span>
                <span className="text-cyan-400 font-bold">
                  {pred.confidence}% | Projeté: {pred.projected}
                </span>
              </div>
            </div>
          ))}
          {markets.corners.total.predictions.length === 0 && (
            <div className="text-red-400">Aucune prédiction corners</div>
          )}
        </div>
      </div>

      {/* CARTONS */}
      <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-600 rounded">
        <h3 className="text-xl font-bold text-yellow-400 mb-3">🟨 CARTONS</h3>
        <div className="space-y-2">
          {markets.cards.yellowTotal.predictions.map((pred, idx) => (
            <div key={idx} className="p-3 bg-slate-800 rounded border border-yellow-500">
              <div className="flex justify-between">
                <span className="text-white font-bold">
                  {pred.prediction} {pred.threshold} cartons
                </span>
                <span className="text-yellow-400 font-bold">
                  {pred.confidence}% | Projeté: {pred.projected}
                </span>
              </div>
            </div>
          ))}
          {markets.cards.yellowTotal.predictions.length === 0 && (
            <div className="text-red-400">Aucune prédiction cartons</div>
          )}
        </div>
      </div>

      {/* FAUTES */}
      <div className="mb-6 p-4 bg-orange-900/30 border border-orange-600 rounded">
        <h3 className="text-xl font-bold text-orange-400 mb-3">⚠️ FAUTES</h3>
        <div className="space-y-2">
          {markets.fouls.total.predictions.map((pred, idx) => (
            <div key={idx} className="p-3 bg-slate-800 rounded border border-orange-500">
              <div className="flex justify-between">
                <span className="text-white font-bold">
                  {pred.prediction} {pred.threshold} fautes
                </span>
                <span className="text-orange-400 font-bold">
                  {pred.confidence}% | Projeté: {pred.projected}
                </span>
              </div>
            </div>
          ))}
          {markets.fouls.total.predictions.length === 0 && (
            <div className="text-red-400">Aucune prédiction fautes</div>
          )}
        </div>
      </div>

      {/* TIRS */}
      <div className="mb-6 p-4 bg-blue-900/30 border border-blue-600 rounded">
        <h3 className="text-xl font-bold text-blue-400 mb-3">🎯 TIRS</h3>
        <div className="space-y-2">
          {markets.shots.totalShots.predictions.map((pred, idx) => (
            <div key={idx} className="p-3 bg-slate-800 rounded border border-blue-500">
              <div className="flex justify-between">
                <span className="text-white font-bold">
                  {pred.prediction} {pred.threshold} tirs
                </span>
                <span className="text-blue-400 font-bold">
                  {pred.confidence}% | Projeté: {pred.projected}
                </span>
              </div>
            </div>
          ))}
          {markets.shots.totalShots.predictions.length === 0 && (
            <div className="text-red-400">Aucune prédiction tirs</div>
          )}
        </div>
      </div>

      {/* THROW-INS */}
      <div className="mb-6 p-4 bg-purple-900/30 border border-purple-600 rounded">
        <h3 className="text-xl font-bold text-purple-400 mb-3">👐 REMISES EN JEU</h3>
        <div className="space-y-2">
          {markets.throwIns.total.predictions.map((pred, idx) => (
            <div key={idx} className="p-3 bg-slate-800 rounded border border-purple-500">
              <div className="flex justify-between">
                <span className="text-white font-bold">
                  {pred.prediction} {pred.threshold} throw-ins
                </span>
                <span className="text-purple-400 font-bold">
                  {pred.confidence}% | Projeté: {pred.projected}
                </span>
              </div>
            </div>
          ))}
          {markets.throwIns.total.predictions.length === 0 && (
            <div className="text-red-400">Aucune prédiction throw-ins</div>
          )}
        </div>
      </div>

      {/* HORS-JEUX */}
      <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded">
        <h3 className="text-xl font-bold text-red-400 mb-3">🚫 HORS-JEUX</h3>
        <div className="space-y-2">
          {markets.offsides.total.predictions.map((pred, idx) => (
            <div key={idx} className="p-3 bg-slate-800 rounded border border-red-500">
              <div className="flex justify-between">
                <span className="text-white font-bold">
                  {pred.prediction} {pred.threshold} hors-jeux
                </span>
                <span className="text-red-400 font-bold">
                  {pred.confidence}% | Projeté: {pred.projected}
                </span>
              </div>
            </div>
          ))}
          {markets.offsides.total.predictions.length === 0 && (
            <div className="text-red-400">Aucune prédiction hors-jeux</div>
          )}
        </div>
      </div>

      {/* SCORE MI-TEMPS & FIN */}
      <div className="mb-6 p-4 bg-pink-900/30 border border-pink-600 rounded">
        <h3 className="text-xl font-bold text-pink-400 mb-3">⏱️ SCORES</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-800 rounded border border-pink-500">
            <p className="text-pink-300 font-bold mb-2">MI-TEMPS</p>
            <p className="text-3xl font-bold text-white">
              {markets.halfTimeFullTime.halfTime.homeScore}-{markets.halfTimeFullTime.halfTime.awayScore}
            </p>
            <p className="text-pink-400">Confiance: {markets.halfTimeFullTime.halfTime.confidence}%</p>
          </div>
          <div className="p-3 bg-slate-800 rounded border border-pink-500">
            <p className="text-pink-300 font-bold mb-2">FIN DE MATCH</p>
            <p className="text-3xl font-bold text-white">
              {markets.halfTimeFullTime.fullTime.homeScore}-{markets.halfTimeFullTime.fullTime.awayScore}
            </p>
            <p className="text-pink-400">Confiance: {markets.halfTimeFullTime.fullTime.confidence}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
