import { Card } from "@/components/ui/card";
import { Comprehensive1xbetMarkets } from "@/utils/comprehensive1xbetMarkets";

interface Props {
  markets: Comprehensive1xbetMarkets;
  homeTeam: string;
  awayTeam: string;
}

const MarketSection = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className={`text-xl font-bold mb-3 ${color} flex items-center gap-2`}>
      <span>⚽</span>
      <span>{title}</span>
    </h3>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

const PredictionRow = ({
  label,
  prediction,
  threshold,
  projected,
  confidence
}: {
  label: string;
  prediction: string;
  threshold?: number;
  projected?: number;
  confidence: number;
}) => {
  const confidenceColor = confidence >= 90 ? 'text-green-400' :
                          confidence >= 80 ? 'text-cyan-400' :
                          confidence >= 70 ? 'text-yellow-400' :
                          'text-orange-400';

  const confidenceBg = confidence >= 90 ? 'bg-green-900/30 border-green-600' :
                       confidence >= 80 ? 'bg-cyan-900/30 border-cyan-600' :
                       confidence >= 70 ? 'bg-yellow-900/30 border-yellow-600' :
                       'bg-orange-900/30 border-orange-600';

  return (
    <div className={`p-3 rounded border ${confidenceBg}`}>
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <span className="text-white font-semibold">{label}</span>
          {threshold !== undefined && (
            <span className="text-gray-400 text-sm ml-2">
              (Seuil: {threshold})
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {projected !== undefined && (
            <span className="text-gray-300 text-sm">
              Projeté: <span className="font-bold">{projected}</span>
            </span>
          )}
          <span className={`font-bold text-lg ${confidenceColor}`}>
            {prediction}
          </span>
          <span className={`${confidenceColor} text-sm font-semibold`}>
            {confidence}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default function Comprehensive1xbetDisplay({ markets, homeTeam, awayTeam }: Props) {
  return (
    <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-purple-600">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-purple-300 flex items-center gap-3">
          <span className="text-4xl">🎯</span>
          <span>TOUS LES MARCHÉS 1XBET</span>
        </h2>
        <div className="flex justify-between mt-3 text-sm">
          <span className="text-cyan-400 font-bold">{homeTeam}</span>
          <span className="text-purple-400 font-bold">vs</span>
          <span className="text-orange-400 font-bold">{awayTeam}</span>
        </div>
      </div>

      {/* ========== MI-TEMPS / FIN DE MATCH ========== */}
      <div className="mb-8 p-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-2 border-purple-500 rounded-lg">
        <h3 className="text-2xl font-bold text-purple-300 mb-4 flex items-center gap-2">
          <span>⏱️</span>
          <span>SCORE EXACT - MI-TEMPS & FIN DE MATCH</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-cyan-900/30 border-2 border-cyan-600 rounded">
            <p className="text-cyan-300 font-bold text-sm mb-2">MI-TEMPS (45')</p>
            <p className="text-4xl font-bold text-white mb-2">
              {markets.halfTimeFullTime.halfTime.homeScore} - {markets.halfTimeFullTime.halfTime.awayScore}
            </p>
            <p className="text-cyan-400 text-sm">
              Confiance: <span className="font-bold">{markets.halfTimeFullTime.halfTime.confidence}%</span>
            </p>
            <p className="text-gray-400 text-xs mt-2">{markets.halfTimeFullTime.halfTime.reasoning}</p>
          </div>

          <div className="p-4 bg-green-900/30 border-2 border-green-600 rounded">
            <p className="text-green-300 font-bold text-sm mb-2">FIN DE MATCH (90')</p>
            <p className="text-4xl font-bold text-white mb-2">
              {markets.halfTimeFullTime.fullTime.homeScore} - {markets.halfTimeFullTime.fullTime.awayScore}
            </p>
            <p className="text-green-400 text-sm">
              Confiance: <span className="font-bold">{markets.halfTimeFullTime.fullTime.confidence}%</span>
            </p>
            <p className="text-gray-400 text-xs mt-2">{markets.halfTimeFullTime.fullTime.reasoning}</p>
          </div>
        </div>

        {markets.halfTimeFullTime.isInFirstHalf && (
          <p className="text-yellow-300 text-sm mt-3 text-center">
            ⏰ 1ère Mi-Temps en cours - {markets.halfTimeFullTime.minutesMT} minutes restantes jusqu'à la MT
          </p>
        )}
      </div>

      {/* ========== BUTS ========== */}
      <MarketSection title="⚽ BUTS (GOALS)" color="text-green-400">
        <div className="mb-3">
          <p className="text-green-300 font-bold">
            Score Exact Projeté: {markets.goals.exactScore.fullTime} (Confiance: {markets.goals.exactScore.confidence}%)
          </p>
        </div>
        {markets.goals.totalGoals.bestPick && (
          <PredictionRow
            label="Total Buts (Meilleur Pick)"
            prediction={markets.goals.totalGoals.bestPick.prediction}
            threshold={markets.goals.totalGoals.bestPick.threshold}
            projected={markets.goals.totalGoals.predictions[0]?.projected}
            confidence={markets.goals.totalGoals.bestPick.confidence}
          />
        )}
        {markets.goals.homeGoals.bestPick && (
          <PredictionRow
            label={`Buts ${homeTeam}`}
            prediction={markets.goals.homeGoals.bestPick.prediction}
            threshold={markets.goals.homeGoals.bestPick.threshold}
            projected={markets.goals.homeGoals.predictions[0]?.projected}
            confidence={markets.goals.homeGoals.bestPick.confidence}
          />
        )}
        {markets.goals.awayGoals.bestPick && (
          <PredictionRow
            label={`Buts ${awayTeam}`}
            prediction={markets.goals.awayGoals.bestPick.prediction}
            threshold={markets.goals.awayGoals.bestPick.threshold}
            projected={markets.goals.awayGoals.predictions[0]?.projected}
            confidence={markets.goals.awayGoals.bestPick.confidence}
          />
        )}
      </MarketSection>

      {/* ========== CORNERS ========== */}
      <MarketSection title="🚩 CORNERS" color="text-cyan-400">
        {markets.corners.total.bestPick && (
          <PredictionRow
            label="Total Corners"
            prediction={markets.corners.total.bestPick.prediction}
            threshold={markets.corners.total.bestPick.threshold}
            projected={markets.corners.total.predictions[0]?.projected}
            confidence={markets.corners.total.bestPick.confidence}
          />
        )}
        {markets.corners.firstHalf.bestPick && (
          <PredictionRow
            label="Corners 1ère Mi-Temps"
            prediction={markets.corners.firstHalf.bestPick.prediction}
            threshold={markets.corners.firstHalf.bestPick.threshold}
            projected={markets.corners.firstHalf.predictions[0]?.projected}
            confidence={markets.corners.firstHalf.bestPick.confidence}
          />
        )}
        {markets.corners.secondHalf.bestPick && (
          <PredictionRow
            label="Corners 2ème Mi-Temps"
            prediction={markets.corners.secondHalf.bestPick.prediction}
            threshold={markets.corners.secondHalf.bestPick.threshold}
            projected={markets.corners.secondHalf.predictions[0]?.projected}
            confidence={markets.corners.secondHalf.bestPick.confidence}
          />
        )}
      </MarketSection>

      {/* ========== TIRS ========== */}
      <MarketSection title="🎯 TIRS (SHOTS)" color="text-red-400">
        {markets.shots.totalShots.bestPick && (
          <PredictionRow
            label="Total Tirs"
            prediction={markets.shots.totalShots.bestPick.prediction}
            threshold={markets.shots.totalShots.bestPick.threshold}
            projected={markets.shots.totalShots.predictions[0]?.projected}
            confidence={markets.shots.totalShots.bestPick.confidence}
          />
        )}
        {markets.shots.shotsOnTarget.bestPick && (
          <PredictionRow
            label="Tirs Cadrés Total"
            prediction={markets.shots.shotsOnTarget.bestPick.prediction}
            threshold={markets.shots.shotsOnTarget.bestPick.threshold}
            projected={markets.shots.shotsOnTarget.predictions[0]?.projected}
            confidence={markets.shots.shotsOnTarget.bestPick.confidence}
          />
        )}
        {markets.shots.shotsOffTarget.bestPick && (
          <PredictionRow
            label="Tirs Non Cadrés Total"
            prediction={markets.shots.shotsOffTarget.bestPick.prediction}
            threshold={markets.shots.shotsOffTarget.bestPick.threshold}
            projected={markets.shots.shotsOffTarget.predictions[0]?.projected}
            confidence={markets.shots.shotsOffTarget.bestPick.confidence}
          />
        )}
      </MarketSection>

      {/* ========== FAUTES ========== */}
      <MarketSection title="⚠️ FAUTES (FOULS)" color="text-yellow-400">
        {markets.fouls.total.bestPick && (
          <PredictionRow
            label="Total Fautes"
            prediction={markets.fouls.total.bestPick.prediction}
            threshold={markets.fouls.total.bestPick.threshold}
            projected={markets.fouls.total.predictions[0]?.projected}
            confidence={markets.fouls.total.bestPick.confidence}
          />
        )}
      </MarketSection>

      {/* ========== CARTONS ========== */}
      <MarketSection title="🟨 CARTONS (CARDS)" color="text-orange-400">
        {markets.cards.yellowTotal.bestPick && (
          <PredictionRow
            label="Total Cartons Jaunes"
            prediction={markets.cards.yellowTotal.bestPick.prediction}
            threshold={markets.cards.yellowTotal.bestPick.threshold}
            projected={markets.cards.yellowTotal.predictions[0]?.projected}
            confidence={markets.cards.yellowTotal.bestPick.confidence}
          />
        )}
        {markets.cards.totalCards.bestPick && (
          <PredictionRow
            label="Total Cartons (Jaunes + Rouges×2)"
            prediction={markets.cards.totalCards.bestPick.prediction}
            threshold={markets.cards.totalCards.bestPick.threshold}
            projected={markets.cards.totalCards.predictions[0]?.projected}
            confidence={markets.cards.totalCards.bestPick.confidence}
          />
        )}
      </MarketSection>

      {/* ========== TOUCHES ========== */}
      <MarketSection title="🤾 TOUCHES (THROW-INS)" color="text-blue-400">
        {markets.throwIns.total.bestPick && (
          <PredictionRow
            label="Total Touches"
            prediction={markets.throwIns.total.bestPick.prediction}
            threshold={markets.throwIns.total.bestPick.threshold}
            projected={markets.throwIns.total.predictions[0]?.projected}
            confidence={markets.throwIns.total.bestPick.confidence}
          />
        )}
      </MarketSection>

      {/* ========== HORS-JEUX ========== */}
      <MarketSection title="🚫 HORS-JEUX (OFFSIDES)" color="text-pink-400">
        {markets.offsides.total.bestPick && (
          <PredictionRow
            label="Total Hors-jeux"
            prediction={markets.offsides.total.bestPick.prediction}
            threshold={markets.offsides.total.bestPick.threshold}
            projected={markets.offsides.total.predictions[0]?.projected}
            confidence={markets.offsides.total.bestPick.confidence}
          />
        )}
      </MarketSection>

      {/* ========== MARCHÉS SPÉCIAUX ========== */}
      <MarketSection title="✨ MARCHÉS SPÉCIAUX" color="text-purple-400">
        <PredictionRow
          label="BTTS (Both Teams To Score)"
          prediction={markets.specialMarkets.btts.prediction}
          confidence={markets.specialMarkets.btts.confidence}
        />
        <PredictionRow
          label={`Clean Sheet ${homeTeam}`}
          prediction={markets.specialMarkets.homeCleanSheet.prediction}
          confidence={markets.specialMarkets.homeCleanSheet.confidence}
        />
        <PredictionRow
          label={`Clean Sheet ${awayTeam}`}
          prediction={markets.specialMarkets.awayCleanSheet.prediction}
          confidence={markets.specialMarkets.awayCleanSheet.confidence}
        />
        <PredictionRow
          label="Les 2 Équipes Marquent 2+ Buts"
          prediction={markets.specialMarkets.bothTeamsScore2Plus.prediction}
          confidence={markets.specialMarkets.bothTeamsScore2Plus.confidence}
        />
      </MarketSection>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-purple-600">
        <p className="text-center text-purple-300 font-bold text-lg">
          🎯 TOUS LES MARCHÉS 1XBET COUVERTS - PRÉDICTIONS ULTRA-COMPLÈTES!
        </p>
      </div>
    </Card>
  );
}
