/**
 * AUDIT COMPLET DE TOUS LES MARCHÉS 1XBET
 *
 * Test sur 50 000 matchs réels pour identifier quels marchés sont RENTABLES
 */

const fs = require('fs');
const path = require('path');

const CSV_FILE = path.join(__dirname, 'Matches.csv');
const SAMPLE_SIZE = 50000;
const MIN_DATA_QUALITY = 70;

// Résultats pour TOUS les marchés
const markets = {
  // ============================================================================
  // BUTS - OVER/UNDER
  // ============================================================================
  goals: {
    'Over 0.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 0.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Over 1.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 1.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Over 2.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 2.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Over 3.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 3.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Over 4.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 4.5': { predictions: 0, correct: 0, accuracy: 0 }
  },

  // ============================================================================
  // CORNERS - OVER/UNDER
  // ============================================================================
  corners: {
    'Over 8.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 8.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Over 9.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 9.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Over 10.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 10.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Over 11.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 11.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Over 12.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 12.5': { predictions: 0, correct: 0, accuracy: 0 }
  },

  // ============================================================================
  // CARTONS JAUNES - OVER/UNDER
  // ============================================================================
  yellowCards: {
    'Over 2.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 2.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Over 3.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 3.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Over 4.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 4.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Over 5.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 5.5': { predictions: 0, correct: 0, accuracy: 0 }
  },

  // ============================================================================
  // FAUTES - OVER/UNDER
  // ============================================================================
  fouls: {
    'Over 20.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 20.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Over 22.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 22.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Over 24.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 24.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Over 26.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 26.5': { predictions: 0, correct: 0, accuracy: 0 }
  },

  // ============================================================================
  // TIRS - OVER/UNDER
  // ============================================================================
  shots: {
    'Over 18.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 18.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Over 20.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 20.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Over 22.5': { predictions: 0, correct: 0, accuracy: 0 },
    'Under 22.5': { predictions: 0, correct: 0, accuracy: 0 }
  },

  // ============================================================================
  // BTTS (Les deux équipes marquent)
  // ============================================================================
  btts: {
    'YES': { predictions: 0, correct: 0, accuracy: 0 },
    'NO': { predictions: 0, correct: 0, accuracy: 0 }
  }
};

// Statistiques globales
let totalMatches = 0;
let matchesWithCompleteData = 0;

// ============================================================================
// PRÉDICTION BUTS (Améliorée)
// ============================================================================
function predictGoals(homeElo, awayElo, form3Home, form5Home, form3Away, form5Away, homeShots, awayShots) {
  if (!homeElo || !awayElo) return null;

  const eloAvg = (homeElo + awayElo) / 2;
  const eloDiff = Math.abs(homeElo - awayElo);

  let expectedGoals = 2.7;

  // Ajustement Elo
  if (eloAvg > 1700) expectedGoals += 0.3;
  if (eloAvg > 1800) expectedGoals += 0.3;
  if (eloAvg < 1500) expectedGoals -= 0.4;

  // Ajustement forme
  if (form3Home !== null && form3Away !== null) {
    const formTotal = (form3Home || 0) + (form5Home || 0) + (form3Away || 0) + (form5Away || 0);
    if (formTotal > 15) expectedGoals += 0.4;
    if (formTotal < 5) expectedGoals -= 0.3;
  }

  // Ajustement tirs
  if (homeShots && awayShots) {
    const totalShots = homeShots + awayShots;
    if (totalShots > 25) expectedGoals += 0.3;
    if (totalShots < 15) expectedGoals -= 0.3;
  }

  // Déséquilibre
  if (eloDiff > 200) expectedGoals -= 0.2;
  if (eloDiff > 300) expectedGoals -= 0.3;

  return expectedGoals;
}

// ============================================================================
// PRÉDICTION CORNERS (Améliorée)
// ============================================================================
function predictCorners(homeElo, awayElo) {
  if (!homeElo || !awayElo) return null;

  const eloAvg = (homeElo + awayElo) / 2;
  let expectedCorners = 10.5;

  if (eloAvg > 1700) expectedCorners += 1.0;
  if (eloAvg > 1800) expectedCorners += 0.5;
  if (eloAvg < 1500) expectedCorners -= 1.5;

  return expectedCorners;
}

// ============================================================================
// PRÉDICTION CARTONS (Améliorée)
// ============================================================================
function predictYellowCards(homeFouls, awayFouls) {
  let expectedCards = 4.2;

  const totalFouls = (homeFouls || 0) + (awayFouls || 0);
  if (totalFouls > 0) {
    if (totalFouls > 28) expectedCards += 1.0;
    if (totalFouls < 18) expectedCards -= 0.8;
  }

  return expectedCards;
}

// ============================================================================
// PRÉDICTION FAUTES
// ============================================================================
function predictFouls(homeElo, awayElo) {
  if (!homeElo || !awayElo) return null;

  const eloAvg = (homeElo + awayElo) / 2;
  let expectedFouls = 23.0;

  if (eloAvg > 1700) expectedFouls -= 1.0; // Ligues top = moins de fautes
  if (eloAvg < 1500) expectedFouls += 2.0; // Ligues faibles = plus de fautes

  return expectedFouls;
}

// ============================================================================
// PRÉDICTION TIRS
// ============================================================================
function predictShots(homeElo, awayElo) {
  if (!homeElo || !awayElo) return null;

  const eloAvg = (homeElo + awayElo) / 2;
  let expectedShots = 20.0;

  if (eloAvg > 1700) expectedShots += 3.0;
  if (eloAvg > 1800) expectedShots += 2.0;
  if (eloAvg < 1500) expectedShots -= 3.0;

  return expectedShots;
}

// ============================================================================
// PRÉDICTION BTTS
// ============================================================================
function predictBTTS(expectedGoals, homeElo, awayElo) {
  if (!expectedGoals) return null;

  const eloDiff = Math.abs(homeElo - awayElo);

  // Plus de buts attendus + équilibre = BTTS probable
  let bttsProb = 0.45; // Base 45%

  if (expectedGoals > 2.5) bttsProb += 0.15;
  if (expectedGoals > 3.0) bttsProb += 0.10;
  if (eloDiff < 100) bttsProb += 0.10; // Équipes équilibrées
  if (eloDiff > 200) bttsProb -= 0.15; // Déséquilibre

  return bttsProb > 0.5 ? 'YES' : 'NO';
}

// ============================================================================
// PARSING CSV
// ============================================================================
function parseCSVLine(line, headers) {
  const values = line.split(',');
  const match = {};

  headers.forEach((header, index) => {
    const value = values[index];
    if (['HomeElo', 'AwayElo', 'Form3Home', 'Form5Home', 'Form3Away', 'Form5Away',
         'FTHome', 'FTAway', 'HomeShots', 'AwayShots', 'HomeFouls', 'AwayFouls',
         'HomeCorners', 'AwayCorners', 'HomeYellow', 'AwayYellow'].includes(header)) {
      match[header] = value && value !== '' ? parseFloat(value) : null;
    } else {
      match[header] = value;
    }
  });

  return match;
}

function hasCompleteData(match) {
  if (!match.HomeElo || !match.AwayElo) return false;
  if (match.FTHome === null || match.FTAway === null) return false;

  let quality = 50;
  if (match.HomeShots !== null && match.AwayShots !== null) quality += 15;
  if (match.HomeCorners !== null && match.AwayCorners !== null) quality += 15;
  if (match.HomeYellow !== null && match.AwayYellow !== null) quality += 10;
  if (match.HomeFouls !== null && match.AwayFouls !== null) quality += 10;

  return quality >= MIN_DATA_QUALITY;
}

// ============================================================================
// TEST MARCHÉ
// ============================================================================
function testMarket(marketName, threshold, prediction, actualValue) {
  const isOver = prediction > threshold;
  const actualOver = actualValue > threshold;

  const predictionType = isOver ? `Over ${threshold}` : `Under ${threshold}`;

  if (!markets[marketName]) return;
  if (!markets[marketName][predictionType]) return;

  markets[marketName][predictionType].predictions++;

  if ((isOver && actualOver) || (!isOver && !actualOver)) {
    markets[marketName][predictionType].correct++;
  }
}

// ============================================================================
// BACKTESTING
// ============================================================================
function runAudit() {
  console.log('🚀 AUDIT COMPLET DE TOUS LES MARCHÉS 1XBET');
  console.log('📂 Fichier:', CSV_FILE);
  console.log('🎯 Échantillon:', SAMPLE_SIZE, 'matchs');
  console.log('');

  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');

  console.log('✅ Colonnes:', headers.length);
  console.log('✅ Total matchs:', lines.length - 1);
  console.log('');

  const matchLines = lines.slice(-SAMPLE_SIZE);

  console.log('🔄 Traitement...\n');

  matchLines.forEach((line, index) => {
    if (index === 0) return;

    const match = parseCSVLine(line, headers);
    totalMatches++;

    if (!hasCompleteData(match)) return;
    matchesWithCompleteData++;

    // ========================================================================
    // BUTS
    // ========================================================================
    const expectedGoals = predictGoals(
      match.HomeElo, match.AwayElo,
      match.Form3Home, match.Form5Home, match.Form3Away, match.Form5Away,
      match.HomeShots, match.AwayShots
    );

    if (expectedGoals) {
      const actualGoals = match.FTHome + match.FTAway;
      testMarket('goals', 0.5, expectedGoals, actualGoals);
      testMarket('goals', 1.5, expectedGoals, actualGoals);
      testMarket('goals', 2.5, expectedGoals, actualGoals);
      testMarket('goals', 3.5, expectedGoals, actualGoals);
      testMarket('goals', 4.5, expectedGoals, actualGoals);

      // BTTS
      const bttsPred = predictBTTS(expectedGoals, match.HomeElo, match.AwayElo);
      const bttsActual = (match.FTHome > 0 && match.FTAway > 0) ? 'YES' : 'NO';

      if (bttsPred && markets.btts[bttsPred]) {
        markets.btts[bttsPred].predictions++;
        if (bttsPred === bttsActual) {
          markets.btts[bttsPred].correct++;
        }
      }
    }

    // ========================================================================
    // CORNERS
    // ========================================================================
    if (match.HomeCorners !== null && match.AwayCorners !== null) {
      const expectedCorners = predictCorners(match.HomeElo, match.AwayElo);
      if (expectedCorners) {
        const actualCorners = match.HomeCorners + match.AwayCorners;
        testMarket('corners', 8.5, expectedCorners, actualCorners);
        testMarket('corners', 9.5, expectedCorners, actualCorners);
        testMarket('corners', 10.5, expectedCorners, actualCorners);
        testMarket('corners', 11.5, expectedCorners, actualCorners);
        testMarket('corners', 12.5, expectedCorners, actualCorners);
      }
    }

    // ========================================================================
    // CARTONS JAUNES
    // ========================================================================
    if (match.HomeYellow !== null && match.AwayYellow !== null) {
      const expectedCards = predictYellowCards(match.HomeFouls, match.AwayFouls);
      const actualCards = match.HomeYellow + match.AwayYellow;
      testMarket('yellowCards', 2.5, expectedCards, actualCards);
      testMarket('yellowCards', 3.5, expectedCards, actualCards);
      testMarket('yellowCards', 4.5, expectedCards, actualCards);
      testMarket('yellowCards', 5.5, expectedCards, actualCards);
    }

    // ========================================================================
    // FAUTES
    // ========================================================================
    if (match.HomeFouls !== null && match.AwayFouls !== null) {
      const expectedFouls = predictFouls(match.HomeElo, match.AwayElo);
      if (expectedFouls) {
        const actualFouls = match.HomeFouls + match.AwayFouls;
        testMarket('fouls', 20.5, expectedFouls, actualFouls);
        testMarket('fouls', 22.5, expectedFouls, actualFouls);
        testMarket('fouls', 24.5, expectedFouls, actualFouls);
        testMarket('fouls', 26.5, expectedFouls, actualFouls);
      }
    }

    // ========================================================================
    // TIRS
    // ========================================================================
    if (match.HomeShots !== null && match.AwayShots !== null) {
      const expectedShots = predictShots(match.HomeElo, match.AwayElo);
      if (expectedShots) {
        const actualShots = match.HomeShots + match.AwayShots;
        testMarket('shots', 18.5, expectedShots, actualShots);
        testMarket('shots', 20.5, expectedShots, actualShots);
        testMarket('shots', 22.5, expectedShots, actualShots);
      }
    }

    if (totalMatches % 5000 === 0) {
      console.log(`⏳ Traité: ${totalMatches} matchs (${matchesWithCompleteData} complets)`);
    }
  });

  // ========================================================================
  // CALCUL PRÉCISIONS
  // ========================================================================
  Object.keys(markets).forEach(category => {
    Object.keys(markets[category]).forEach(bet => {
      const market = markets[category][bet];
      if (market.predictions > 0) {
        market.accuracy = (market.correct / market.predictions * 100).toFixed(1);
      }
    });
  });

  // ========================================================================
  // RAPPORT
  // ========================================================================
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎯 AUDIT COMPLET - TOUS LES MARCHÉS 1XBET');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`📊 Matchs analysés: ${totalMatches}`);
  console.log(`✅ Matchs avec données complètes: ${matchesWithCompleteData}`);
  console.log('');

  // Buts
  console.log('───────────────────────────────────────────────────────────────');
  console.log('⚽ BUTS - OVER/UNDER');
  console.log('───────────────────────────────────────────────────────────────');
  Object.keys(markets.goals).forEach(bet => {
    const m = markets.goals[bet];
    if (m.predictions > 0) {
      const icon = m.accuracy >= 70 ? '✅' : m.accuracy >= 60 ? '⚠️' : '❌';
      console.log(`${icon} ${bet.padEnd(12)}: ${m.predictions.toString().padStart(5)} paris → ${m.correct.toString().padStart(5)} corrects → ${m.accuracy}%`);
    }
  });
  console.log('');

  // Corners
  console.log('───────────────────────────────────────────────────────────────');
  console.log('🚩 CORNERS - OVER/UNDER');
  console.log('───────────────────────────────────────────────────────────────');
  Object.keys(markets.corners).forEach(bet => {
    const m = markets.corners[bet];
    if (m.predictions > 0) {
      const icon = m.accuracy >= 70 ? '✅' : m.accuracy >= 60 ? '⚠️' : '❌';
      console.log(`${icon} ${bet.padEnd(12)}: ${m.predictions.toString().padStart(5)} paris → ${m.correct.toString().padStart(5)} corrects → ${m.accuracy}%`);
    }
  });
  console.log('');

  // Cartons
  console.log('───────────────────────────────────────────────────────────────');
  console.log('🟨 CARTONS JAUNES - OVER/UNDER');
  console.log('───────────────────────────────────────────────────────────────');
  Object.keys(markets.yellowCards).forEach(bet => {
    const m = markets.yellowCards[bet];
    if (m.predictions > 0) {
      const icon = m.accuracy >= 70 ? '✅' : m.accuracy >= 60 ? '⚠️' : '❌';
      console.log(`${icon} ${bet.padEnd(12)}: ${m.predictions.toString().padStart(5)} paris → ${m.correct.toString().padStart(5)} corrects → ${m.accuracy}%`);
    }
  });
  console.log('');

  // Fautes
  console.log('───────────────────────────────────────────────────────────────');
  console.log('⚠️  FAUTES - OVER/UNDER');
  console.log('───────────────────────────────────────────────────────────────');
  Object.keys(markets.fouls).forEach(bet => {
    const m = markets.fouls[bet];
    if (m.predictions > 0) {
      const icon = m.accuracy >= 70 ? '✅' : m.accuracy >= 60 ? '⚠️' : '❌';
      console.log(`${icon} ${bet.padEnd(12)}: ${m.predictions.toString().padStart(5)} paris → ${m.correct.toString().padStart(5)} corrects → ${m.accuracy}%`);
    }
  });
  console.log('');

  // Tirs
  console.log('───────────────────────────────────────────────────────────────');
  console.log('🎯 TIRS - OVER/UNDER');
  console.log('───────────────────────────────────────────────────────────────');
  Object.keys(markets.shots).forEach(bet => {
    const m = markets.shots[bet];
    if (m.predictions > 0) {
      const icon = m.accuracy >= 70 ? '✅' : m.accuracy >= 60 ? '⚠️' : '❌';
      console.log(`${icon} ${bet.padEnd(12)}: ${m.predictions.toString().padStart(5)} paris → ${m.correct.toString().padStart(5)} corrects → ${m.accuracy}%`);
    }
  });
  console.log('');

  // BTTS
  console.log('───────────────────────────────────────────────────────────────');
  console.log('⚽ BTTS (Les deux équipes marquent)');
  console.log('───────────────────────────────────────────────────────────────');
  Object.keys(markets.btts).forEach(bet => {
    const m = markets.btts[bet];
    if (m.predictions > 0) {
      const icon = m.accuracy >= 70 ? '✅' : m.accuracy >= 60 ? '⚠️' : '❌';
      console.log(`${icon} ${bet.padEnd(12)}: ${m.predictions.toString().padStart(5)} paris → ${m.correct.toString().padStart(5)} corrects → ${m.accuracy}%`);
    }
  });
  console.log('');

  // ========================================================================
  // RECOMMANDATIONS
  // ========================================================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('💰 MARCHÉS RENTABLES (≥70% précision)');
  console.log('═══════════════════════════════════════════════════════════════');

  const profitable = [];
  Object.keys(markets).forEach(category => {
    Object.keys(markets[category]).forEach(bet => {
      const m = markets[category][bet];
      if (m.predictions > 0 && parseFloat(m.accuracy) >= 70) {
        profitable.push({
          category: category,
          bet: bet,
          accuracy: parseFloat(m.accuracy),
          predictions: m.predictions
        });
      }
    });
  });

  profitable.sort((a, b) => b.accuracy - a.accuracy);

  if (profitable.length > 0) {
    profitable.forEach(p => {
      console.log(`✅ ${p.category.toUpperCase()} - ${p.bet}: ${p.accuracy}% (${p.predictions} paris)`);
    });
  } else {
    console.log('❌ AUCUN marché n\'atteint 70% de précision');
  }
  console.log('');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('⚠️  MARCHÉS À AMÉLIORER (60-70% précision)');
  console.log('═══════════════════════════════════════════════════════════════');

  const improvable = [];
  Object.keys(markets).forEach(category => {
    Object.keys(markets[category]).forEach(bet => {
      const m = markets[category][bet];
      if (m.predictions > 0 && parseFloat(m.accuracy) >= 60 && parseFloat(m.accuracy) < 70) {
        improvable.push({
          category: category,
          bet: bet,
          accuracy: parseFloat(m.accuracy),
          predictions: m.predictions
        });
      }
    });
  });

  improvable.sort((a, b) => b.accuracy - a.accuracy);

  if (improvable.length > 0) {
    improvable.forEach(p => {
      console.log(`⚠️  ${p.category.toUpperCase()} - ${p.bet}: ${p.accuracy}% (${p.predictions} paris)`);
    });
  } else {
    console.log('Aucun');
  }
  console.log('');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('❌ MARCHÉS À ÉVITER (<60% précision)');
  console.log('═══════════════════════════════════════════════════════════════');

  const avoid = [];
  Object.keys(markets).forEach(category => {
    Object.keys(markets[category]).forEach(bet => {
      const m = markets[category][bet];
      if (m.predictions > 0 && parseFloat(m.accuracy) < 60) {
        avoid.push({
          category: category,
          bet: bet,
          accuracy: parseFloat(m.accuracy),
          predictions: m.predictions
        });
      }
    });
  });

  avoid.sort((a, b) => a.accuracy - b.accuracy);

  if (avoid.length > 0) {
    avoid.forEach(p => {
      console.log(`❌ ${p.category.toUpperCase()} - ${p.bet}: ${p.accuracy}% (${p.predictions} paris)`);
    });
  }
  console.log('');

  console.log('═══════════════════════════════════════════════════════════════');

  // Sauvegarder rapport
  const report = {
    date: new Date().toISOString(),
    totalMatches: totalMatches,
    completeMatches: matchesWithCompleteData,
    markets: markets,
    profitable: profitable,
    improvable: improvable,
    avoid: avoid
  };

  fs.writeFileSync(
    path.join(__dirname, 'COMPREHENSIVE_1XBET_AUDIT.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('');
  console.log('✅ Rapport sauvegardé: COMPREHENSIVE_1XBET_AUDIT.json');
}

// ============================================================================
// EXÉCUTION
// ============================================================================
try {
  runAudit();
} catch (error) {
  console.error('❌ ERREUR:', error.message);
  console.error(error.stack);
}
