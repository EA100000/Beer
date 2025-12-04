/**
 * SYSTÈME DE PRÉDICTION - MARCHÉS PRIORITAIRES
 *
 * Focus sur les 5 marchés demandés par l'utilisateur :
 * 1. Over/Under BUTS
 * 2. Over/Under CORNERS
 * 3. Over/Under FAUTES
 * 4. Over/Under TOUCHES (throw-ins)
 * 5. 1X ou 2X (Double Chance)
 *
 * Basé sur 132 411 matchs réels
 */

const fs = require('fs');
const path = require('path');

// Charger les données apprises
const DATA_FILE = path.join(__dirname, 'DATA_DRIVEN_FORMULAS.json');
const learnedData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

// ============================================================================
// 1. SYSTÈME BUTS (ULTRA-PRÉCIS)
// ============================================================================

class GoalsPredictor {
  constructor(data) {
    this.goalsByElo = data.goalsByElo;
  }

  predict(homeElo, awayElo, homeForm = 0, awayForm = 0) {
    const eloAvg = Math.round((homeElo + awayElo) / 2 / 50) * 50;
    const eloDiff = Math.abs(homeElo - awayElo);

    const bucket = this.goalsByElo[eloAvg] || this.goalsByElo[1500];

    if (!bucket || bucket.count === 0) {
      return this._fallback();
    }

    const avgGoals = bucket.total / bucket.count;
    const over25Prob = bucket.over25 / bucket.count;
    const over15Prob = bucket.over15 / bucket.count;
    const under35Prob = bucket.under35 / bucket.count;

    // Ajustements forme (si disponible)
    let adjustedGoals = avgGoals;
    if (homeForm && awayForm) {
      const formTotal = homeForm + awayForm;
      if (formTotal > 15) adjustedGoals += 0.3;
      if (formTotal < 5) adjustedGoals -= 0.2;
    }

    // Ajustement déséquilibre
    if (eloDiff > 300) adjustedGoals -= 0.2;

    const confidence = Math.min(95, 50 + Math.log(bucket.count) * 10);

    return {
      predictions: [
        {
          market: 'Over 0.5 Buts',
          probability: 92.7, // Quasi-garanti
          recommendation: 'FORTE',
          confidence: 95,
          expectedValue: adjustedGoals
        },
        {
          market: 'Over 1.5 Buts',
          probability: over15Prob * 100,
          recommendation: over15Prob >= 0.72 ? 'OUI' : 'NON',
          confidence: confidence,
          expectedValue: adjustedGoals
        },
        {
          market: 'Over 2.5 Buts',
          probability: over25Prob * 100,
          recommendation: over25Prob >= 0.53 ? 'OUI' : 'ÉVITER',
          confidence: confidence,
          expectedValue: adjustedGoals,
          warning: over25Prob < 0.50 ? '⚠️ RISQUÉ en ligues faibles' : null
        },
        {
          market: 'Under 3.5 Buts',
          probability: under35Prob * 100,
          recommendation: under35Prob >= 0.72 ? 'OUI' : 'NON',
          confidence: confidence,
          expectedValue: adjustedGoals
        },
        {
          market: 'Under 4.5 Buts',
          probability: 85.8, // Très fiable
          recommendation: 'OUI',
          confidence: 90,
          expectedValue: adjustedGoals
        }
      ],
      summary: {
        expectedGoals: adjustedGoals.toFixed(2),
        eloLevel: eloAvg,
        matchesInSample: bucket.count
      }
    };
  }

  _fallback() {
    return {
      predictions: [
        { market: 'Over 0.5 Buts', probability: 90, recommendation: 'OUI', confidence: 85 },
        { market: 'Over 1.5 Buts', probability: 73, recommendation: 'OUI', confidence: 70 },
        { market: 'Over 2.5 Buts', probability: 50, recommendation: 'ÉVITER', confidence: 50 },
        { market: 'Under 3.5 Buts', probability: 73, recommendation: 'OUI', confidence: 70 },
        { market: 'Under 4.5 Buts', probability: 85, recommendation: 'OUI', confidence: 85 }
      ],
      summary: { expectedGoals: '2.60', eloLevel: 'Unknown', matchesInSample: 0 }
    };
  }
}

// ============================================================================
// 2. SYSTÈME CORNERS (AMÉLIORÉ)
// ============================================================================

class CornersPredictor {
  constructor(data) {
    this.cornersByElo = data.cornersByElo;
  }

  predict(homeElo, awayElo, possession = null, attackingStyle = 'normal') {
    const eloAvg = Math.round((homeElo + awayElo) / 2 / 50) * 50;
    const bucket = this.cornersByElo[eloAvg] || this.cornersByElo[1500];

    if (!bucket || bucket.count === 0) {
      return this._fallback();
    }

    const avgCorners = bucket.total / bucket.count;
    const over95Prob = bucket.over95 / bucket.count;
    const over85Prob = bucket.over85 / bucket.count;

    // Ajustements possession (si disponible)
    let adjustedCorners = avgCorners;
    if (possession !== null) {
      const possessionDiff = Math.abs(possession.home - possession.away);
      if (possessionDiff > 20) adjustedCorners += 1.0;
    }

    // Ajustement style
    if (attackingStyle === 'offensive') adjustedCorners += 0.8;
    if (attackingStyle === 'defensive') adjustedCorners -= 0.5;

    const confidence = Math.min(90, 50 + Math.log(bucket.count) * 8);

    return {
      predictions: [
        {
          market: 'Over 8.5 Corners',
          probability: over85Prob * 100,
          recommendation: over85Prob >= 0.65 ? 'OUI' : 'ÉVITER',
          confidence: confidence,
          expectedValue: adjustedCorners
        },
        {
          market: 'Over 9.5 Corners',
          probability: over95Prob * 100,
          recommendation: 'ÉVITER', // 52-57% = aléatoire
          confidence: confidence,
          expectedValue: adjustedCorners,
          warning: '⚠️ Précision 52-57% (presque aléatoire)'
        },
        {
          market: 'Under 11.5 Corners',
          probability: 71.5,
          recommendation: 'OUI',
          confidence: 75,
          expectedValue: adjustedCorners
        },
        {
          market: 'Under 12.5 Corners',
          probability: 79.8,
          recommendation: 'OUI',
          confidence: 85,
          expectedValue: adjustedCorners
        }
      ],
      summary: {
        expectedCorners: adjustedCorners.toFixed(1),
        eloLevel: eloAvg,
        matchesInSample: bucket.count
      }
    };
  }

  _fallback() {
    return {
      predictions: [
        { market: 'Over 8.5 Corners', probability: 63, recommendation: 'LIMITE', confidence: 60 },
        { market: 'Over 9.5 Corners', probability: 53, recommendation: 'ÉVITER', confidence: 50 },
        { market: 'Under 11.5 Corners', probability: 72, recommendation: 'OUI', confidence: 70 },
        { market: 'Under 12.5 Corners', probability: 80, recommendation: 'OUI', confidence: 80 }
      ],
      summary: { expectedCorners: '10.2', eloLevel: 'Unknown', matchesInSample: 0 }
    };
  }
}

// ============================================================================
// 3. SYSTÈME FAUTES (DONNÉES PARTIELLES)
// ============================================================================

class FoulsPredictor {
  predict(homeElo, awayElo, expectedIntensity = 'medium') {
    const eloAvg = (homeElo + awayElo) / 2;

    // Formule basée sur Elo (ligues faibles = plus de fautes)
    let expectedFouls = 23.0;
    if (eloAvg > 1700) expectedFouls -= 1.0;
    if (eloAvg > 1800) expectedFouls -= 1.0;
    if (eloAvg < 1500) expectedFouls += 2.0;

    // Ajustement intensité
    if (expectedIntensity === 'high') expectedFouls += 2.0;
    if (expectedIntensity === 'low') expectedFouls -= 2.0;

    return {
      predictions: [
        {
          market: 'Over 20.5 Fautes',
          probability: 73.4,
          recommendation: expectedFouls > 20.5 ? 'OUI' : 'NON',
          confidence: 75,
          expectedValue: expectedFouls
        },
        {
          market: 'Over 22.5 Fautes',
          probability: 63.6,
          recommendation: expectedFouls > 22.5 ? 'LIMITE' : 'NON',
          confidence: 65,
          expectedValue: expectedFouls
        },
        {
          market: 'Under 26.5 Fautes',
          probability: 64.0,
          recommendation: expectedFouls < 26.5 ? 'LIMITE' : 'NON',
          confidence: 65,
          expectedValue: expectedFouls
        }
      ],
      summary: {
        expectedFouls: expectedFouls.toFixed(1),
        eloLevel: eloAvg.toFixed(0),
        note: '⚠️ Données partielles (beaucoup de matchs sans fautes dans CSV)'
      }
    };
  }
}

// ============================================================================
// 4. SYSTÈME TOUCHES (THROW-INS) - ESTIMÉ
// ============================================================================

class ThrowInsPredictor {
  predict(possession = null, attackingStyle = 'normal') {
    // Moyenne historique : 45 throw-ins/match
    let expectedThrowIns = 45.0;

    // Ajustement possession (si disponible)
    if (possession !== null) {
      const totalPossession = possession.home + possession.away;
      if (totalPossession < 90) expectedThrowIns -= 3.0; // Peu de possession = moins de touches
    }

    // Ajustement style
    if (attackingStyle === 'direct') expectedThrowIns += 3.0;
    if (attackingStyle === 'possession') expectedThrowIns -= 2.0;

    return {
      predictions: [
        {
          market: 'Over 35.5 Throw-ins',
          probability: 65,
          recommendation: expectedThrowIns > 35.5 ? 'LIMITE' : 'NON',
          confidence: 60,
          expectedValue: expectedThrowIns,
          warning: '⚠️ Pas de données réelles (CSV ne contient pas throw-ins)'
        },
        {
          market: 'Over 40.5 Throw-ins',
          probability: 55,
          recommendation: 'ÉVITER',
          confidence: 50,
          expectedValue: expectedThrowIns,
          warning: '⚠️ Estimation théorique uniquement'
        },
        {
          market: 'Over 45.5 Throw-ins',
          probability: 45,
          recommendation: 'NON',
          confidence: 50,
          expectedValue: expectedThrowIns
        }
      ],
      summary: {
        expectedThrowIns: expectedThrowIns.toFixed(0),
        note: '⚠️ AUCUNE DONNÉE RÉELLE - Basé sur moyenne historique (45/match)'
      }
    };
  }
}

// ============================================================================
// 5. SYSTÈME 1X / 2X (DOUBLE CHANCE)
// ============================================================================

class DoubleChancePredictor {
  predict(homeElo, awayElo, homeForm = 0, awayForm = 0) {
    const eloDiff = homeElo - awayElo;

    // Calcul probabilités de base (formule Elo)
    const homeWinProb = 1 / (1 + Math.pow(10, -eloDiff / 400));
    const awayWinProb = 1 - homeWinProb;
    const drawProb = 0.27; // Moyenne ~27% des matchs

    // Ajustements forme
    let adjustedHomeWin = homeWinProb;
    let adjustedAwayWin = awayWinProb;

    if (homeForm && awayForm) {
      const formDiff = homeForm - awayForm;
      if (formDiff > 5) adjustedHomeWin += 0.05;
      if (formDiff < -5) adjustedAwayWin += 0.05;
    }

    // Double Chance
    const chance1X = (adjustedHomeWin + drawProb) * 100; // Home ou Draw
    const chance2X = (adjustedAwayWin + drawProb) * 100; // Away ou Draw
    const chance12 = (adjustedHomeWin + adjustedAwayWin) * 100; // Home ou Away

    return {
      predictions: [
        {
          market: '1X (Home ou Draw)',
          probability: chance1X,
          recommendation: chance1X >= 70 ? 'OUI' : chance1X >= 60 ? 'LIMITE' : 'NON',
          confidence: 75,
          situation: eloDiff > 100 ? 'Home favori' : 'Équilibré'
        },
        {
          market: '2X (Away ou Draw)',
          probability: chance2X,
          recommendation: chance2X >= 70 ? 'OUI' : chance2X >= 60 ? 'LIMITE' : 'NON',
          confidence: 75,
          situation: eloDiff < -100 ? 'Away favori' : 'Équilibré'
        },
        {
          market: '12 (Home ou Away)',
          probability: chance12,
          recommendation: chance12 >= 85 ? 'OUI' : 'LIMITE',
          confidence: 70,
          situation: 'Pas de nul attendu'
        }
      ],
      summary: {
        homeWinProb: (adjustedHomeWin * 100).toFixed(1) + '%',
        drawProb: (drawProb * 100).toFixed(1) + '%',
        awayWinProb: (adjustedAwayWin * 100).toFixed(1) + '%',
        eloDifference: eloDiff
      }
    };
  }
}

// ============================================================================
// SYSTÈME COMPLET
// ============================================================================

class PriorityMarketsSystem {
  constructor(learnedData) {
    this.goalsPredictor = new GoalsPredictor(learnedData);
    this.cornersPredictor = new CornersPredictor(learnedData);
    this.foulsPredictor = new FoulsPredictor();
    this.throwInsPredictor = new ThrowInsPredictor();
    this.doubleChancePredictor = new DoubleChancePredictor();
  }

  predictAll(matchData) {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🎯 PRÉDICTIONS - MARCHÉS PRIORITAIRES');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Match: ${matchData.homeTeam} vs ${matchData.awayTeam}`);
    console.log(`Elo: ${matchData.homeElo} vs ${matchData.awayElo}`);
    console.log('');

    // 1. BUTS
    console.log('───────────────────────────────────────────────────────────────');
    console.log('⚽ OVER/UNDER BUTS');
    console.log('───────────────────────────────────────────────────────────────');
    const goals = this.goalsPredictor.predict(
      matchData.homeElo,
      matchData.awayElo,
      matchData.homeForm,
      matchData.awayForm
    );
    console.log(`Buts attendus: ${goals.summary.expectedGoals}`);
    console.log(`Niveau Elo: ${goals.summary.eloLevel} (${goals.summary.matchesInSample} matchs échantillon)`);
    goals.predictions.forEach(p => {
      const icon = p.recommendation === 'OUI' || p.recommendation === 'FORTE' ? '✅' :
                   p.recommendation === 'LIMITE' ? '⚠️' : '❌';
      console.log(`${icon} ${p.market}: ${p.probability.toFixed(1)}% | ${p.recommendation} (${p.confidence}% confiance)`);
      if (p.warning) console.log(`   ${p.warning}`);
    });
    console.log('');

    // 2. CORNERS
    console.log('───────────────────────────────────────────────────────────────');
    console.log('🚩 OVER/UNDER CORNERS');
    console.log('───────────────────────────────────────────────────────────────');
    const corners = this.cornersPredictor.predict(
      matchData.homeElo,
      matchData.awayElo,
      matchData.possession,
      matchData.attackingStyle
    );
    console.log(`Corners attendus: ${corners.summary.expectedCorners}`);
    console.log(`Niveau Elo: ${corners.summary.eloLevel} (${corners.summary.matchesInSample} matchs échantillon)`);
    corners.predictions.forEach(p => {
      const icon = p.recommendation === 'OUI' ? '✅' :
                   p.recommendation === 'LIMITE' ? '⚠️' : '❌';
      console.log(`${icon} ${p.market}: ${p.probability.toFixed(1)}% | ${p.recommendation} (${p.confidence}% confiance)`);
      if (p.warning) console.log(`   ${p.warning}`);
    });
    console.log('');

    // 3. FAUTES
    console.log('───────────────────────────────────────────────────────────────');
    console.log('⚠️  OVER/UNDER FAUTES');
    console.log('───────────────────────────────────────────────────────────────');
    const fouls = this.foulsPredictor.predict(
      matchData.homeElo,
      matchData.awayElo,
      matchData.expectedIntensity
    );
    console.log(`Fautes attendues: ${fouls.summary.expectedFouls}`);
    console.log(`${fouls.summary.note}`);
    fouls.predictions.forEach(p => {
      const icon = p.recommendation === 'OUI' ? '✅' :
                   p.recommendation === 'LIMITE' ? '⚠️' : '❌';
      console.log(`${icon} ${p.market}: ${p.probability.toFixed(1)}% | ${p.recommendation} (${p.confidence}% confiance)`);
    });
    console.log('');

    // 4. THROW-INS
    console.log('───────────────────────────────────────────────────────────────');
    console.log('🤾 OVER/UNDER THROW-INS (Touches)');
    console.log('───────────────────────────────────────────────────────────────');
    const throwIns = this.throwInsPredictor.predict(
      matchData.possession,
      matchData.attackingStyle
    );
    console.log(`Throw-ins attendus: ${throwIns.summary.expectedThrowIns}`);
    console.log(`${throwIns.summary.note}`);
    throwIns.predictions.forEach(p => {
      const icon = p.recommendation === 'LIMITE' ? '⚠️' : '❌';
      console.log(`${icon} ${p.market}: ${p.probability.toFixed(1)}% | ${p.recommendation} (${p.confidence}% confiance)`);
      if (p.warning) console.log(`   ${p.warning}`);
    });
    console.log('');

    // 5. DOUBLE CHANCE
    console.log('───────────────────────────────────────────────────────────────');
    console.log('🎲 DOUBLE CHANCE (1X / 2X / 12)');
    console.log('───────────────────────────────────────────────────────────────');
    const doubleChance = this.doubleChancePredictor.predict(
      matchData.homeElo,
      matchData.awayElo,
      matchData.homeForm,
      matchData.awayForm
    );
    console.log(`Probabilités: Home ${doubleChance.summary.homeWinProb} | Draw ${doubleChance.summary.drawProb} | Away ${doubleChance.summary.awayWinProb}`);
    console.log(`Différence Elo: ${doubleChance.summary.eloDifference}`);
    doubleChance.predictions.forEach(p => {
      const icon = p.recommendation === 'OUI' ? '✅' :
                   p.recommendation === 'LIMITE' ? '⚠️' : '❌';
      console.log(`${icon} ${p.market}: ${p.probability.toFixed(1)}% | ${p.recommendation} (${p.confidence}% confiance)`);
      console.log(`   Situation: ${p.situation}`);
    });
    console.log('');

    console.log('═══════════════════════════════════════════════════════════════');

    return { goals, corners, fouls, throwIns, doubleChance };
  }
}

// ============================================================================
// TEST
// ============================================================================

console.log('🚀 SYSTÈME DE PRÉDICTION - MARCHÉS PRIORITAIRES\n');
console.log('Basé sur 132 411 matchs réels analysés\n');

const system = new PriorityMarketsSystem(learnedData);

// Test 1: Match Premier League
console.log('\n');
system.predictAll({
  homeTeam: 'Manchester City',
  awayTeam: 'Liverpool',
  homeElo: 1850,
  awayElo: 1820,
  homeForm: 12,
  awayForm: 10,
  possession: { home: 58, away: 42 },
  attackingStyle: 'offensive',
  expectedIntensity: 'medium'
});

// Test 2: Match Ligue faible
console.log('\n');
system.predictAll({
  homeTeam: 'Équipe Moyenne',
  awayTeam: 'Équipe Faible',
  homeElo: 1450,
  awayElo: 1420,
  homeForm: 6,
  awayForm: 4,
  possession: null,
  attackingStyle: 'normal',
  expectedIntensity: 'medium'
});

console.log('\n✅ Tests terminés\n');
