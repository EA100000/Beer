/**
 * BACKTESTING RÉEL SUR 230K MATCHS
 *
 * Objectif: Identifier POURQUOI les paris sont perdus
 * Méthode: Tester CHAQUE prédiction du système vs résultats réels
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================
const CSV_FILE = path.join(__dirname, 'Matches.csv');
const SAMPLE_SIZE = 50000; // Tester sur 50k matchs les plus récents
const MIN_DATA_QUALITY = 70; // Seulement matchs avec données complètes

// ============================================================================
// STATISTIQUES GLOBALES
// ============================================================================
const stats = {
  totalMatches: 0,
  matchesWithCompleteData: 0,

  // BUTS
  overUnder25: {
    predictions: { over: 0, under: 0 },
    correct: { over: 0, under: 0 },
    wrong: { over: 0, under: 0 },
    accuracy: { over: 0, under: 0 }
  },

  overUnder15: {
    predictions: { over: 0, under: 0 },
    correct: { over: 0, under: 0 },
    wrong: { over: 0, under: 0 },
    accuracy: { over: 0, under: 0 }
  },

  overUnder35: {
    predictions: { over: 0, under: 0 },
    correct: { over: 0, under: 0 },
    wrong: { over: 0, under: 0 },
    accuracy: { over: 0, under: 0 }
  },

  // CORNERS
  cornersOver95: {
    predictions: { over: 0, under: 0 },
    correct: { over: 0, under: 0 },
    wrong: { over: 0, under: 0 },
    accuracy: { over: 0, under: 0 }
  },

  cornersOver105: {
    predictions: { over: 0, under: 0 },
    correct: { over: 0, under: 0 },
    wrong: { over: 0, under: 0 },
    accuracy: { over: 0, under: 0 }
  },

  cornersOver115: {
    predictions: { over: 0, under: 0 },
    correct: { over: 0, under: 0 },
    wrong: { over: 0, under: 0 },
    accuracy: { over: 0, under: 0 }
  },

  // CARTONS
  cardsOver35: {
    predictions: { over: 0, under: 0 },
    correct: { over: 0, under: 0 },
    wrong: { over: 0, under: 0 },
    accuracy: { over: 0, under: 0 }
  },

  cardsOver45: {
    predictions: { over: 0, under: 0 },
    correct: { over: 0, under: 0 },
    wrong: { over: 0, under: 0 },
    accuracy: { over: 0, under: 0 }
  },

  // FAUTES
  foulsOver225: {
    predictions: { over: 0, under: 0 },
    correct: { over: 0, under: 0 },
    wrong: { over: 0, under: 0 },
    accuracy: { over: 0, under: 0 }
  },

  // PATTERNS D'ÉCHEC
  failurePatterns: {
    highScoringGamesUnpredicted: [],  // Matchs 4+ buts non prévus
    lowScoringGamesMispredicted: [],  // Matchs 0-1 buts prévus Over
    cornerBustGames: [],              // Corners < 8 prévus Over 9.5
    cardHeavyGames: [],               // 6+ cartons non prévus
  },

  // ANALYSE PAR LIGUE
  leaguePerformance: {}
};

// ============================================================================
// MODÈLE DE PRÉDICTION (SIMPLIFIÉ POUR BACKTESTING)
// ============================================================================

/**
 * Prédire Over/Under 2.5 basé sur historique récent
 */
function predictOver25(homeElo, awayElo, form3Home, form5Home, form3Away, form5Away, homeShots, awayShots) {
  // Qualité des données
  const hasShots = homeShots > 0 && awayShots > 0;
  const hasForm = (form3Home !== null && form3Away !== null);
  const hasElo = homeElo > 1400 && awayElo > 1400;

  if (!hasElo) return null; // Données insuffisantes

  // Calcul xG estimé basé sur Elo et forme
  const eloAvg = (homeElo + awayElo) / 2;
  const eloDiff = Math.abs(homeElo - awayElo);

  // Base: Ligue moyenne = 2.7 buts
  let expectedGoals = 2.7;

  // Ajustement Elo (ligues fortes = plus de buts)
  if (eloAvg > 1700) expectedGoals += 0.3;
  if (eloAvg > 1800) expectedGoals += 0.3;
  if (eloAvg < 1500) expectedGoals -= 0.4;

  // Ajustement forme
  if (hasForm) {
    const formHome = (form3Home || 0) + (form5Home || 0);
    const formAway = (form3Away || 0) + (form5Away || 0);
    const formTotal = formHome + formAway;

    if (formTotal > 15) expectedGoals += 0.4; // Équipes en forme
    if (formTotal < 5) expectedGoals -= 0.3;  // Équipes en crise
  }

  // Ajustement tirs (si disponible)
  if (hasShots) {
    const totalShots = homeShots + awayShots;
    if (totalShots > 25) expectedGoals += 0.3;
    if (totalShots < 15) expectedGoals -= 0.3;
  }

  // Déséquilibre (gros écart Elo = moins de buts)
  if (eloDiff > 200) expectedGoals -= 0.2;
  if (eloDiff > 300) expectedGoals -= 0.3;

  // Prédiction finale
  const confidence = 55 + (hasShots ? 10 : 0) + (hasForm ? 10 : 0);

  return {
    prediction: expectedGoals > 2.5 ? 'OVER' : 'UNDER',
    expectedGoals: expectedGoals,
    confidence: confidence
  };
}

/**
 * Prédire corners Over/Under 9.5
 */
function predictCorners95(homeElo, awayElo, homeCorners, awayCorners) {
  if (!homeCorners || !awayCorners) return null;

  const totalCorners = homeCorners + awayCorners;
  const eloAvg = (homeElo + awayElo) / 2;

  // Moyenne historique: 10.5 corners
  let expectedCorners = 10.5;

  // Ajustement Elo
  if (eloAvg > 1700) expectedCorners += 1.0; // Ligues top
  if (eloAvg < 1500) expectedCorners -= 1.5; // Ligues faibles

  return {
    prediction: expectedCorners > 9.5 ? 'OVER' : 'UNDER',
    expectedCorners: expectedCorners,
    confidence: 65
  };
}

/**
 * Prédire cartons Over/Under 4.5
 */
function predictCards45(homeYellow, awayYellow, homeRed, awayRed, homeFouls, awayFouls) {
  const totalCards = (homeYellow || 0) + (awayYellow || 0) + (homeRed || 0) * 2 + (awayRed || 0) * 2;
  const totalFouls = (homeFouls || 0) + (awayFouls || 0);

  // Moyenne historique: 4.2 cartons
  let expectedCards = 4.2;

  // Ajustement fautes (si disponible)
  if (totalFouls > 0) {
    if (totalFouls > 28) expectedCards += 1.0; // Match physique
    if (totalFouls < 18) expectedCards -= 0.8; // Match calme
  }

  return {
    prediction: expectedCards > 4.5 ? 'OVER' : 'UNDER',
    expectedCards: expectedCards,
    confidence: totalFouls > 0 ? 70 : 55
  };
}

// ============================================================================
// LECTURE ET PARSING CSV
// ============================================================================

function parseCSVLine(line, headers) {
  const values = line.split(',');
  const match = {};

  headers.forEach((header, index) => {
    const value = values[index];

    // Parser les nombres
    if (['HomeElo', 'AwayElo', 'Form3Home', 'Form5Home', 'Form3Away', 'Form5Away',
         'FTHome', 'FTAway', 'HTHome', 'HTAway',
         'HomeShots', 'AwayShots', 'HomeTarget', 'AwayTarget',
         'HomeFouls', 'AwayFouls', 'HomeCorners', 'AwayCorners',
         'HomeYellow', 'AwayYellow', 'HomeRed', 'AwayRed'].includes(header)) {
      match[header] = value && value !== '' ? parseFloat(value) : null;
    } else {
      match[header] = value;
    }
  });

  return match;
}

function hasCompleteData(match) {
  // Minimum requis: Elo, Score final
  if (!match.HomeElo || !match.AwayElo) return false;
  if (match.FTHome === null || match.FTAway === null) return false;

  // Calculer score de qualité
  let quality = 50;

  if (match.HomeShots !== null && match.AwayShots !== null) quality += 15;
  if (match.HomeCorners !== null && match.AwayCorners !== null) quality += 15;
  if (match.HomeYellow !== null && match.AwayYellow !== null) quality += 10;
  if (match.HomeFouls !== null && match.AwayFouls !== null) quality += 10;

  return quality >= MIN_DATA_QUALITY;
}

// ============================================================================
// BACKTESTING
// ============================================================================

function runBacktest() {
  console.log('🚀 DÉMARRAGE DU BACKTESTING RÉEL');
  console.log('📂 Fichier:', CSV_FILE);
  console.log('🎯 Échantillon:', SAMPLE_SIZE, 'matchs les plus récents');
  console.log('📊 Qualité minimum:', MIN_DATA_QUALITY + '%');
  console.log('');

  // Lire CSV
  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  const headers = lines[0].split(',');
  console.log('✅ Headers:', headers.length, 'colonnes');
  console.log('✅ Total matchs CSV:', lines.length - 1);
  console.log('');

  // Prendre les N derniers matchs (plus récents)
  const matchLines = lines.slice(-SAMPLE_SIZE);

  console.log('🔄 Traitement de', matchLines.length, 'matchs...\n');

  matchLines.forEach((line, index) => {
    if (index === 0) return; // Skip header si présent

    const match = parseCSVLine(line, headers);
    stats.totalMatches++;

    // Vérifier qualité données
    if (!hasCompleteData(match)) {
      return;
    }

    stats.matchesWithCompleteData++;

    // ========================================================================
    // TEST 1: OVER/UNDER 2.5 BUTS
    // ========================================================================
    const pred25 = predictOver25(
      match.HomeElo, match.AwayElo,
      match.Form3Home, match.Form5Home, match.Form3Away, match.Form5Away,
      match.HomeShots, match.AwayShots
    );

    if (pred25) {
      const actualGoals = match.FTHome + match.FTAway;
      const actualResult = actualGoals > 2.5 ? 'OVER' : 'UNDER';

      if (pred25.prediction === 'OVER') {
        stats.overUnder25.predictions.over++;
        if (actualResult === 'OVER') {
          stats.overUnder25.correct.over++;
        } else {
          stats.overUnder25.wrong.over++;
          // Pattern d'échec: prévu Over mais Under réel
          if (actualGoals <= 1) {
            stats.failurePatterns.lowScoringGamesMispredicted.push({
              match: `${match.HomeTeam} vs ${match.AwayTeam}`,
              date: match.MatchDate,
              predicted: pred25.expectedGoals.toFixed(2),
              actual: actualGoals,
              confidence: pred25.confidence
            });
          }
        }
      } else {
        stats.overUnder25.predictions.under++;
        if (actualResult === 'UNDER') {
          stats.overUnder25.correct.under++;
        } else {
          stats.overUnder25.wrong.under++;
          // Pattern d'échec: prévu Under mais Over réel
          if (actualGoals >= 4) {
            stats.failurePatterns.highScoringGamesUnpredicted.push({
              match: `${match.HomeTeam} vs ${match.AwayTeam}`,
              date: match.MatchDate,
              predicted: pred25.expectedGoals.toFixed(2),
              actual: actualGoals,
              confidence: pred25.confidence
            });
          }
        }
      }
    }

    // ========================================================================
    // TEST 2: OVER/UNDER 1.5 BUTS
    // ========================================================================
    if (pred25) {
      const actualGoals = match.FTHome + match.FTAway;
      const actualResult = actualGoals > 1.5 ? 'OVER' : 'UNDER';
      const prediction = pred25.expectedGoals > 1.5 ? 'OVER' : 'UNDER';

      if (prediction === 'OVER') {
        stats.overUnder15.predictions.over++;
        if (actualResult === 'OVER') stats.overUnder15.correct.over++;
        else stats.overUnder15.wrong.over++;
      } else {
        stats.overUnder15.predictions.under++;
        if (actualResult === 'UNDER') stats.overUnder15.correct.under++;
        else stats.overUnder15.wrong.under++;
      }
    }

    // ========================================================================
    // TEST 3: OVER/UNDER 3.5 BUTS
    // ========================================================================
    if (pred25) {
      const actualGoals = match.FTHome + match.FTAway;
      const actualResult = actualGoals > 3.5 ? 'OVER' : 'UNDER';
      const prediction = pred25.expectedGoals > 3.5 ? 'OVER' : 'UNDER';

      if (prediction === 'OVER') {
        stats.overUnder35.predictions.over++;
        if (actualResult === 'OVER') stats.overUnder35.correct.over++;
        else stats.overUnder35.wrong.over++;
      } else {
        stats.overUnder35.predictions.under++;
        if (actualResult === 'UNDER') stats.overUnder35.correct.under++;
        else stats.overUnder35.wrong.under++;
      }
    }

    // ========================================================================
    // TEST 4: CORNERS OVER/UNDER 9.5
    // ========================================================================
    if (match.HomeCorners !== null && match.AwayCorners !== null) {
      const predCorners = predictCorners95(match.HomeElo, match.AwayElo, match.HomeCorners, match.AwayCorners);

      if (predCorners) {
        const actualCorners = match.HomeCorners + match.AwayCorners;
        const actualResult = actualCorners > 9.5 ? 'OVER' : 'UNDER';

        if (predCorners.prediction === 'OVER') {
          stats.cornersOver95.predictions.over++;
          if (actualResult === 'OVER') {
            stats.cornersOver95.correct.over++;
          } else {
            stats.cornersOver95.wrong.over++;
            // Pattern d'échec corners
            if (actualCorners < 8) {
              stats.failurePatterns.cornerBustGames.push({
                match: `${match.HomeTeam} vs ${match.AwayTeam}`,
                date: match.MatchDate,
                predicted: predCorners.expectedCorners.toFixed(1),
                actual: actualCorners
              });
            }
          }
        } else {
          stats.cornersOver95.predictions.under++;
          if (actualResult === 'UNDER') {
            stats.cornersOver95.correct.under++;
          } else {
            stats.cornersOver95.wrong.under++;
          }
        }
      }
    }

    // ========================================================================
    // TEST 5: CARTONS OVER/UNDER 4.5
    // ========================================================================
    if (match.HomeYellow !== null && match.AwayYellow !== null) {
      const predCards = predictCards45(
        match.HomeYellow, match.AwayYellow,
        match.HomeRed, match.AwayRed,
        match.HomeFouls, match.AwayFouls
      );

      if (predCards) {
        const actualCards = match.HomeYellow + match.AwayYellow +
                           (match.HomeRed || 0) * 2 + (match.AwayRed || 0) * 2;
        const actualResult = actualCards > 4.5 ? 'OVER' : 'UNDER';

        if (predCards.prediction === 'OVER') {
          stats.cardsOver45.predictions.over++;
          if (actualResult === 'OVER') stats.cardsOver45.correct.over++;
          else stats.cardsOver45.wrong.over++;
        } else {
          stats.cardsOver45.predictions.under++;
          if (actualResult === 'UNDER') stats.cardsOver45.correct.under++;
          else stats.cardsOver45.wrong.under++;
        }

        // Pattern d'échec cartons excessifs
        if (actualCards >= 6 && predCards.prediction === 'UNDER') {
          stats.failurePatterns.cardHeavyGames.push({
            match: `${match.HomeTeam} vs ${match.AwayTeam}`,
            date: match.MatchDate,
            predicted: predCards.expectedCards.toFixed(1),
            actual: actualCards
          });
        }
      }
    }

    // Progress
    if (stats.totalMatches % 5000 === 0) {
      console.log(`⏳ Traité: ${stats.totalMatches} matchs (${stats.matchesWithCompleteData} avec données complètes)`);
    }
  });

  // ========================================================================
  // CALCUL DES PRÉCISIONS
  // ========================================================================

  function calcAccuracy(market) {
    const totalOver = market.correct.over + market.wrong.over;
    const totalUnder = market.correct.under + market.wrong.under;

    market.accuracy.over = totalOver > 0 ? (market.correct.over / totalOver * 100) : 0;
    market.accuracy.under = totalUnder > 0 ? (market.correct.under / totalUnder * 100) : 0;
    market.accuracy.total = (market.correct.over + market.correct.under) /
                            (totalOver + totalUnder) * 100;
  }

  calcAccuracy(stats.overUnder25);
  calcAccuracy(stats.overUnder15);
  calcAccuracy(stats.overUnder35);
  calcAccuracy(stats.cornersOver95);
  calcAccuracy(stats.cardsOver45);

  // ========================================================================
  // RAPPORT FINAL
  // ========================================================================

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎯 RÉSULTATS DU BACKTESTING RÉEL');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`📊 Matchs analysés: ${stats.totalMatches}`);
  console.log(`✅ Matchs avec données complètes: ${stats.matchesWithCompleteData}`);
  console.log('');

  console.log('───────────────────────────────────────────────────────────────');
  console.log('⚽ OVER/UNDER 2.5 BUTS');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`Over 2.5: ${stats.overUnder25.predictions.over} prédictions → ${stats.overUnder25.correct.over} correctes → ${stats.overUnder25.accuracy.over.toFixed(1)}% précision`);
  console.log(`Under 2.5: ${stats.overUnder25.predictions.under} prédictions → ${stats.overUnder25.correct.under} correctes → ${stats.overUnder25.accuracy.under.toFixed(1)}% précision`);
  console.log(`📈 PRÉCISION GLOBALE: ${stats.overUnder25.accuracy.total.toFixed(1)}%`);
  console.log('');

  console.log('───────────────────────────────────────────────────────────────');
  console.log('⚽ OVER/UNDER 1.5 BUTS');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`Over 1.5: ${stats.overUnder15.predictions.over} prédictions → ${stats.overUnder15.correct.over} correctes → ${stats.overUnder15.accuracy.over.toFixed(1)}% précision`);
  console.log(`Under 1.5: ${stats.overUnder15.predictions.under} prédictions → ${stats.overUnder15.correct.under} correctes → ${stats.overUnder15.accuracy.under.toFixed(1)}% précision`);
  console.log(`📈 PRÉCISION GLOBALE: ${stats.overUnder15.accuracy.total.toFixed(1)}%`);
  console.log('');

  console.log('───────────────────────────────────────────────────────────────');
  console.log('⚽ OVER/UNDER 3.5 BUTS');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`Over 3.5: ${stats.overUnder35.predictions.over} prédictions → ${stats.overUnder35.correct.over} correctes → ${stats.overUnder35.accuracy.over.toFixed(1)}% précision`);
  console.log(`Under 3.5: ${stats.overUnder35.predictions.under} prédictions → ${stats.overUnder35.correct.under} correctes → ${stats.overUnder35.accuracy.under.toFixed(1)}% précision`);
  console.log(`📈 PRÉCISION GLOBALE: ${stats.overUnder35.accuracy.total.toFixed(1)}%`);
  console.log('');

  console.log('───────────────────────────────────────────────────────────────');
  console.log('🚩 CORNERS OVER/UNDER 9.5');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`Over 9.5: ${stats.cornersOver95.predictions.over} prédictions → ${stats.cornersOver95.correct.over} correctes → ${stats.cornersOver95.accuracy.over.toFixed(1)}% précision`);
  console.log(`Under 9.5: ${stats.cornersOver95.predictions.under} prédictions → ${stats.cornersOver95.correct.under} correctes → ${stats.cornersOver95.accuracy.under.toFixed(1)}% précision`);
  console.log(`📈 PRÉCISION GLOBALE: ${stats.cornersOver95.accuracy.total.toFixed(1)}%`);
  console.log('');

  console.log('───────────────────────────────────────────────────────────────');
  console.log('🟨 CARTONS OVER/UNDER 4.5');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`Over 4.5: ${stats.cardsOver45.predictions.over} prédictions → ${stats.cardsOver45.correct.over} correctes → ${stats.cardsOver45.accuracy.over.toFixed(1)}% précision`);
  console.log(`Under 4.5: ${stats.cardsOver45.predictions.under} prédictions → ${stats.cardsOver45.correct.under} correctes → ${stats.cardsOver45.accuracy.under.toFixed(1)}% précision`);
  console.log(`📈 PRÉCISION GLOBALE: ${stats.cardsOver45.accuracy.total.toFixed(1)}%`);
  console.log('');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚨 PATTERNS D\'ÉCHEC IDENTIFIÉS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  console.log(`❌ Matchs à faible score mal prédits (Over 2.5 prédit, ≤1 but réel): ${stats.failurePatterns.lowScoringGamesMispredicted.length}`);
  if (stats.failurePatterns.lowScoringGamesMispredicted.length > 0) {
    console.log('   Top 5 exemples:');
    stats.failurePatterns.lowScoringGamesMispredicted.slice(0, 5).forEach(game => {
      console.log(`   - ${game.match} (${game.date}): prévu ${game.predicted} buts → réel ${game.actual} buts`);
    });
  }
  console.log('');

  console.log(`❌ Matchs à haut score non prévus (Under 2.5 prédit, ≥4 buts réel): ${stats.failurePatterns.highScoringGamesUnpredicted.length}`);
  if (stats.failurePatterns.highScoringGamesUnpredicted.length > 0) {
    console.log('   Top 5 exemples:');
    stats.failurePatterns.highScoringGamesUnpredicted.slice(0, 5).forEach(game => {
      console.log(`   - ${game.match} (${game.date}): prévu ${game.predicted} buts → réel ${game.actual} buts`);
    });
  }
  console.log('');

  console.log(`❌ Matchs avec peu de corners (Over 9.5 prédit, <8 réel): ${stats.failurePatterns.cornerBustGames.length}`);
  if (stats.failurePatterns.cornerBustGames.length > 0) {
    console.log('   Top 5 exemples:');
    stats.failurePatterns.cornerBustGames.slice(0, 5).forEach(game => {
      console.log(`   - ${game.match} (${game.date}): prévu ${game.predicted} corners → réel ${game.actual} corners`);
    });
  }
  console.log('');

  console.log(`❌ Matchs avec cartons excessifs non prévus (Under 4.5 prédit, ≥6 réel): ${stats.failurePatterns.cardHeavyGames.length}`);
  if (stats.failurePatterns.cardHeavyGames.length > 0) {
    console.log('   Top 5 exemples:');
    stats.failurePatterns.cardHeavyGames.slice(0, 5).forEach(game => {
      console.log(`   - ${game.match} (${game.date}): prévu ${game.predicted} cartons → réel ${game.actual} cartons`);
    });
  }
  console.log('');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('💡 RECOMMANDATIONS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // Recommandations basées sur résultats
  if (stats.overUnder25.accuracy.total < 65) {
    console.log('⚠️  Over/Under 2.5: PRÉCISION INSUFFISANTE (<65%)');
    console.log('   → Améliorer les facteurs: forme récente, intensité, motivation');
    console.log('');
  }

  if (stats.cornersOver95.accuracy.total < 60) {
    console.log('⚠️  Corners: PRÉCISION INSUFFISANTE (<60%)');
    console.log('   → Les corners dépendent fortement du style de jeu (possession, attaque)');
    console.log('');
  }

  if (stats.cardsOver45.accuracy.total < 60) {
    console.log('⚠️  Cartons: PRÉCISION INSUFFISANTE (<60%)');
    console.log('   → Ajouter: historique arbitre, rivalité équipes, enjeu du match');
    console.log('');
  }

  // Identifier les marchés RENTABLES
  const profitableMarkets = [];

  if (stats.overUnder25.accuracy.over >= 65) {
    profitableMarkets.push(`✅ Over 2.5 buts (${stats.overUnder25.accuracy.over.toFixed(1)}%)`);
  }
  if (stats.overUnder25.accuracy.under >= 65) {
    profitableMarkets.push(`✅ Under 2.5 buts (${stats.overUnder25.accuracy.under.toFixed(1)}%)`);
  }
  if (stats.cornersOver95.accuracy.over >= 60) {
    profitableMarkets.push(`✅ Over 9.5 corners (${stats.cornersOver95.accuracy.over.toFixed(1)}%)`);
  }
  if (stats.cardsOver45.accuracy.over >= 60) {
    profitableMarkets.push(`✅ Over 4.5 cartons (${stats.cardsOver45.accuracy.over.toFixed(1)}%)`);
  }

  if (profitableMarkets.length > 0) {
    console.log('💰 MARCHÉS RENTABLES (Précision ≥60-65%):');
    profitableMarkets.forEach(market => console.log(`   ${market}`));
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════════');

  // Sauvegarder rapport
  const report = {
    date: new Date().toISOString(),
    sampleSize: stats.totalMatches,
    completeData: stats.matchesWithCompleteData,
    results: {
      overUnder25: stats.overUnder25,
      overUnder15: stats.overUnder15,
      overUnder35: stats.overUnder35,
      cornersOver95: stats.cornersOver95,
      cardsOver45: stats.cardsOver45
    },
    failurePatterns: stats.failurePatterns,
    profitableMarkets: profitableMarkets
  };

  fs.writeFileSync(
    path.join(__dirname, 'BACKTESTING_REPORT.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('');
  console.log('✅ Rapport sauvegardé: BACKTESTING_REPORT.json');
}

// ============================================================================
// EXÉCUTION
// ============================================================================

try {
  runBacktest();
} catch (error) {
  console.error('❌ ERREUR:', error.message);
  console.error(error.stack);
}
