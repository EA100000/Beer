import { Card } from "@/components/ui/card";

interface LiveStats {
  // STATS GLOBALES
  possession: { home: number; away: number };
  bigChances: { home: number; away: number };
  totalShots: { home: number; away: number };
  goalkeeperSaves: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  passes: { home: number; away: number };
  tackles: { home: number; away: number };
  freeKicks: { home: number; away: number };
  yellowCards: { home: number; away: number };

  // STATS TIRS
  shotsOnTarget: { home: number; away: number };
  shotsOnPost: { home: number; away: number };
  shotsOffTarget: { home: number; away: number };
  shotsBlocked: { home: number; away: number };
  shotsInsideBox: { home: number; away: number };
  shotsOutsideBox: { home: number; away: number };

  // STATS ATTAQUE
  bigChancesScored: { home: number; away: number };
  bigChancesMissed: { home: number; away: number };
  throughPasses: { home: number; away: number };
  touchesInBox: { home: number; away: number };
  tacklesInAttackingThird: { home: number; away: number };
  offsides: { home: number; away: number };

  // STATS PASSES
  accuratePasses: { home: number; away: number };
  touches: { home: number; away: number };
  opponentHalfPasses: { home: number; away: number };
  longBalls: { home: number; away: number };

  // STATS PASSES COMPLEXES
  passesInFinalThird: { home: number; away: number };
  crosses: { home: number; away: number };

  // STATS DUELS
  totalDuels: { home: number; away: number };
  ballsLost: { home: number; away: number };
  groundDuels: { home: number; away: number };
  aerialDuels: { home: number; away: number };

  // STATS DRIBBLES
  successfulDribbles: { home: number; away: number };

  // STATS DÉFENSE
  defensiveDuels: { home: number; away: number };
  interceptions: { home: number; away: number };
  ballsRecovered: { home: number; away: number };
  clearances: { home: number; away: number };

  // STATS GARDIEN
  greatSaves: { home: number; away: number };
  goalkeeperExits: { home: number; away: number };
  goalkeeperThrows: { home: number; away: number };
  goalkeeperKicks: { home: number; away: number };
}

interface LiveStatsDisplayProps {
  stats: LiveStats;
  homeTeam: string;
  awayTeam: string;
}

const StatRow = ({
  label,
  homeValue,
  awayValue
}: {
  label: string;
  homeValue: string | number;
  awayValue: string | number;
}) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-700">
    <span className="text-sm text-gray-300 flex-1">{label}</span>
    <div className="flex gap-4 items-center">
      <span className="text-sm font-semibold text-cyan-400 w-16 text-center">{homeValue}</span>
      <span className="text-gray-500">-</span>
      <span className="text-sm font-semibold text-orange-400 w-16 text-center">{awayValue}</span>
    </div>
  </div>
);

const StatSection = ({
  title,
  count,
  color,
  children
}: {
  title: string;
  count: number;
  color: string;
  children: React.ReactNode
}) => (
  <div className="mb-4">
    <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${color}`}>
      <span className="text-xl">📊</span>
      <span>{title}</span>
      <span className="text-xs bg-gray-700 px-2 py-1 rounded">{count} variables</span>
    </h3>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

export default function LiveStatsDisplay({ stats, homeTeam, awayTeam }: LiveStatsDisplayProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-cyan-600">
      {/* En-tête */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cyan-300 flex items-center gap-3">
          <span className="text-3xl">📈</span>
          <span>STATISTIQUES LIVE COMPLÈTES</span>
        </h2>
        <div className="flex justify-between mt-3 text-sm">
          <span className="text-cyan-400 font-bold">{homeTeam}</span>
          <span className="text-orange-400 font-bold">{awayTeam}</span>
        </div>
      </div>

      {/* 1. STATS GLOBALES */}
      <StatSection title="1. STATS GLOBALES" count={9} color="text-cyan-300">
        <StatRow label="✅ Possession" homeValue={`${stats.possession.home}%`} awayValue={`${stats.possession.away}%`} />
        <StatRow label="✅ Grosses occasions" homeValue={stats.bigChances.home} awayValue={stats.bigChances.away} />
        <StatRow label="✅ Total des tirs" homeValue={stats.totalShots.home} awayValue={stats.totalShots.away} />
        <StatRow label="✅ Corner" homeValue={stats.corners.home} awayValue={stats.corners.away} />
        <StatRow label="✅ Fautes" homeValue={stats.fouls.home} awayValue={stats.fouls.away} />
        <StatRow label="✅ Passes" homeValue={stats.passes.home} awayValue={stats.passes.away} />
        <StatRow label="✅ Tacles" homeValue={stats.tackles.home} awayValue={stats.tackles.away} />
        <StatRow label="✅ Coups francs" homeValue={stats.freeKicks.home} awayValue={stats.freeKicks.away} />
        <StatRow label="✅ Cartons jaunes" homeValue={stats.yellowCards.home} awayValue={stats.yellowCards.away} />
      </StatSection>

      {/* 2. STATS TIRS */}
      <StatSection title="2. STATS TIRS" count={6} color="text-red-400">
        <StatRow label="✅ Tirs cadrés" homeValue={stats.shotsOnTarget.home} awayValue={stats.shotsOnTarget.away} />
        <StatRow label="✅ Frappe sur le poteau" homeValue={stats.shotsOnPost.home} awayValue={stats.shotsOnPost.away} />
        <StatRow label="✅ Tirs non cadrés" homeValue={stats.shotsOffTarget.home} awayValue={stats.shotsOffTarget.away} />
        <StatRow label="✅ Tirs bloqués" homeValue={stats.shotsBlocked.home} awayValue={stats.shotsBlocked.away} />
        <StatRow label="✅ Tirs dans la surface" homeValue={stats.shotsInsideBox.home} awayValue={stats.shotsInsideBox.away} />
        <StatRow label="✅ Tirs en dehors de la surface" homeValue={stats.shotsOutsideBox.home} awayValue={stats.shotsOutsideBox.away} />
      </StatSection>

      {/* 3. STATS ATTAQUE */}
      <StatSection title="3. STATS ATTAQUE" count={6} color="text-orange-400">
        <StatRow label="✅ Grosses occasions réalisées" homeValue={stats.bigChancesScored.home} awayValue={stats.bigChancesScored.away} />
        <StatRow label="✅ Grosses occasions manquées" homeValue={stats.bigChancesMissed.home} awayValue={stats.bigChancesMissed.away} />
        <StatRow label="✅ Passes en profondeur" homeValue={stats.throughPasses.home} awayValue={stats.throughPasses.away} />
        <StatRow label="✅ Touches dans la surface de réparation adversaire" homeValue={stats.touchesInBox.home} awayValue={stats.touchesInBox.away} />
        <StatRow label="✅ Tacles reçus dans le tiers offensif" homeValue={stats.tacklesInAttackingThird.home} awayValue={stats.tacklesInAttackingThird.away} />
        <StatRow label="✅ Hors-jeux" homeValue={stats.offsides.home} awayValue={stats.offsides.away} />
      </StatSection>

      {/* 4. STATS PASSES */}
      <StatSection title="4. STATS PASSES" count={4} color="text-green-400">
        <StatRow label="✅ Passe précise" homeValue={stats.accuratePasses.home} awayValue={stats.accuratePasses.away} />
        <StatRow label="✅ Touches" homeValue={stats.touches.home} awayValue={stats.touches.away} />
        <StatRow label="✅ Passes vers le tiers offensif" homeValue={stats.opponentHalfPasses.home} awayValue={stats.opponentHalfPasses.away} />
        <StatRow label="✅ Longs ballons" homeValue={stats.longBalls.home} awayValue={stats.longBalls.away} />
      </StatSection>

      {/* 5. STATS PASSES COMPLEXES */}
      <StatSection title="5. STATS PASSES COMPLEXES" count={2} color="text-emerald-400">
        <StatRow label="✅ Passes dans le tiers offensif" homeValue={stats.passesInFinalThird.home} awayValue={stats.passesInFinalThird.away} />
        <StatRow label="✅ Transversales" homeValue={stats.crosses.home} awayValue={stats.crosses.away} />
      </StatSection>

      {/* 6. STATS DUELS */}
      <StatSection title="6. STATS DUELS" count={4} color="text-yellow-400">
        <StatRow label="✅ Duels" homeValue={`${stats.totalDuels.home}%`} awayValue={`${stats.totalDuels.away}%`} />
        <StatRow label="✅ Perte de balle" homeValue={stats.ballsLost.home} awayValue={stats.ballsLost.away} />
        <StatRow label="✅ Duels au sol" homeValue={stats.groundDuels.home} awayValue={stats.groundDuels.away} />
        <StatRow label="✅ Duels aériens" homeValue={stats.aerialDuels.home} awayValue={stats.aerialDuels.away} />
      </StatSection>

      {/* 7. STATS DRIBBLES */}
      <StatSection title="7. STATS DRIBBLES" count={1} color="text-purple-400">
        <StatRow label="✅ Dribbles" homeValue={stats.successfulDribbles.home} awayValue={stats.successfulDribbles.away} />
      </StatSection>

      {/* 8. STATS DÉFENSE */}
      <StatSection title="8. STATS DÉFENSE" count={4} color="text-blue-400">
        <StatRow label="✅ Tacles gagnés" homeValue={`${stats.defensiveDuels.home}%`} awayValue={`${stats.defensiveDuels.away}%`} />
        <StatRow label="✅ Interceptions" homeValue={stats.interceptions.home} awayValue={stats.interceptions.away} />
        <StatRow label="✅ Récupérations" homeValue={stats.ballsRecovered.home} awayValue={stats.ballsRecovered.away} />
        <StatRow label="✅ Dégagements" homeValue={stats.clearances.home} awayValue={stats.clearances.away} />
      </StatSection>

      {/* 9. STATS GARDIEN */}
      <StatSection title="9. STATS GARDIEN" count={5} color="text-indigo-400">
        <StatRow label="✅ Arrêts du gardien" homeValue={stats.goalkeeperSaves.home} awayValue={stats.goalkeeperSaves.away} />
        <StatRow label="✅ Grands arrêts" homeValue={stats.greatSaves.home} awayValue={stats.greatSaves.away} />
        <StatRow label="✅ Sorties aériennes" homeValue={stats.goalkeeperExits.home} awayValue={stats.goalkeeperExits.away} />
        <StatRow label="✅ Dégagements des poings" homeValue={stats.goalkeeperThrows.home} awayValue={stats.goalkeeperThrows.away} />
        <StatRow label="✅ Coup de pied de but" homeValue={stats.goalkeeperKicks.home} awayValue={stats.goalkeeperKicks.away} />
      </StatSection>

      {/* Footer avec total */}
      <div className="mt-6 pt-4 border-t border-cyan-600">
        <p className="text-center text-cyan-300 font-bold">
          📊 TOTAL: 42 VARIABLES EXTRAITES
        </p>
      </div>
    </Card>
  );
}
