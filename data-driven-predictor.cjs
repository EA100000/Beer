/**
 * SYSTÈME DE PRÉDICTION BASÉ SUR LES DONNÉES RÉELLES
 *
 * Au lieu d'utiliser des formules théoriques, ce système APPREND
 * directement des 230 000 matchs réels pour faire des prédictions.
 */

const fs = require('fs');
const path = require('path');

const CSV_FILE = path.join(__dirname, 'Matches.csv');

// ============================================================================
// APPRENTISSAGE À PARTIR DES DONNÉES RÉELLES
// ============================================================================

const learningData = {
  // Buts par tranche de Elo moyen
  goalsByElo: {},

  // Corners par tranche de Elo moyen
  cornersByElo: {},

  // Cartons par nombre de fautes
  cardsByFouls: {},

  // BTTS par Elo diff
  bttsByEloDiff: {},

  // Formules apprises
  formulas: {
    goals: null,
    corners: null,
    cards: null,
    fouls: null
  }
};

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

function learnFromData() {
  console.log('📚 APPRENTISSAGE À PARTIR DES 230K MATCHS RÉELS...\n');

  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');

  // Initialiser les buckets
  for (let elo = 1400; elo <= 2000; elo += 50) {
    learningData.goalsByElo[elo] = { total: 0, count: 0, over25: 0, over15: 0, under35: 0 };
    learningData.cornersByElo[elo] = { total: 0, count: 0, over95: 0, over85: 0 };
  }

  for (let fouls = 0; fouls <= 40; fouls += 2) {
    learningData.cardsByFouls[fouls] = { total: 0, count: 0, over25: 0, over45: 0 };
  }

  for (let diff = 0; diff <= 500; diff += 50) {
    learningData.bttsByEloDiff[diff] = { bttsYes: 0, bttsNo: 0, total: 0 };
  }

  let processed = 0;
  let valid = 0;

  // Parcourir TOUS les matchs
  lines.slice(1).forEach((line, index) => {
    processed++;

    const match = parseCSVLine(line, headers);

    // Validation
    if (!match.HomeElo || !match.AwayElo || match.FTHome === null || match.FTAway === null) {
      return;
    }

    valid++;

    const eloAvg = Math.round((match.HomeElo + match.AwayElo) / 2 / 50) * 50;
    const eloDiff = Math.round(Math.abs(match.HomeElo - match.AwayElo) / 50) * 50;
    const totalGoals = match.FTHome + match.FTAway;

    // APPRENDRE BUTS
    if (learningData.goalsByElo[eloAvg]) {
      learningData.goalsByElo[eloAvg].total += totalGoals;
      learningData.goalsByElo[eloAvg].count++;
      if (totalGoals > 2.5) learningData.goalsByElo[eloAvg].over25++;
      if (totalGoals > 1.5) learningData.goalsByElo[eloAvg].over15++;
      if (totalGoals < 3.5) learningData.goalsByElo[eloAvg].under35++;
    }

    // APPRENDRE CORNERS
    if (match.HomeCorners !== null && match.AwayCorners !== null) {
      const totalCorners = match.HomeCorners + match.AwayCorners;
      if (learningData.cornersByElo[eloAvg]) {
        learningData.cornersByElo[eloAvg].total += totalCorners;
        learningData.cornersByElo[eloAvg].count++;
        if (totalCorners > 9.5) learningData.cornersByElo[eloAvg].over95++;
        if (totalCorners > 8.5) learningData.cornersByElo[eloAvg].over85++;
      }
    }

    // APPRENDRE CARTONS
    if (match.HomeFouls !== null && match.AwayFouls !== null &&
        match.HomeYellow !== null && match.AwayYellow !== null) {
      const totalFouls = Math.round((match.HomeFouls + match.AwayFouls) / 2) * 2;
      const totalCards = match.HomeYellow + match.AwayYellow;

      if (learningData.cardsByFouls[totalFouls]) {
        learningData.cardsByFouls[totalFouls].total += totalCards;
        learningData.cardsByFouls[totalFouls].count++;
        if (totalCards > 2.5) learningData.cardsByFouls[totalFouls].over25++;
        if (totalCards > 4.5) learningData.cardsByFouls[totalFouls].over45++;
      }
    }

    // APPRENDRE BTTS
    const btts = (match.FTHome > 0 && match.FTAway > 0);
    if (learningData.bttsByEloDiff[eloDiff]) {
      learningData.bttsByEloDiff[eloDiff].total++;
      if (btts) learningData.bttsByEloDiff[eloDiff].bttsYes++;
      else learningData.bttsByEloDiff[eloDiff].bttsNo++;
    }

    if (processed % 50000 === 0) {
      console.log(`⏳ Traité: ${processed} matchs (${valid} valides)`);
    }
  });

  console.log(`\n✅ Apprentissage terminé: ${valid} matchs valides sur ${processed}\n`);

  // ========================================================================
  // GÉNÉRER LES FORMULES OPTIMALES
  // ========================================================================

  console.log('🧮 GÉNÉRATION DES FORMULES OPTIMALES...\n');

  // FORMULE BUTS
  console.log('───────────────────────────────────────────────────────────────');
  console.log('⚽ BUTS PAR TRANCHE ELO MOYEN (DONNÉES RÉELLES)');
  console.log('───────────────────────────────────────────────────────────────');

  Object.keys(learningData.goalsByElo).forEach(elo => {
    const data = learningData.goalsByElo[elo];
    if (data.count > 0) {
      const avgGoals = data.total / data.count;
      const over25Pct = (data.over25 / data.count * 100).toFixed(1);
      const over15Pct = (data.over15 / data.count * 100).toFixed(1);
      const under35Pct = (data.under35 / data.count * 100).toFixed(1);

      console.log(`Elo ${elo}: ${avgGoals.toFixed(2)} buts/match (${data.count} matchs)`);
      console.log(`  → Over 2.5: ${over25Pct}%`);
      console.log(`  → Over 1.5: ${over15Pct}%`);
      console.log(`  → Under 3.5: ${under35Pct}%`);
    }
  });
  console.log('');

  // FORMULE CORNERS
  console.log('───────────────────────────────────────────────────────────────');
  console.log('🚩 CORNERS PAR TRANCHE ELO MOYEN (DONNÉES RÉELLES)');
  console.log('───────────────────────────────────────────────────────────────');

  Object.keys(learningData.cornersByElo).forEach(elo => {
    const data = learningData.cornersByElo[elo];
    if (data.count > 0) {
      const avgCorners = data.total / data.count;
      const over95Pct = (data.over95 / data.count * 100).toFixed(1);
      const over85Pct = (data.over85 / data.count * 100).toFixed(1);

      console.log(`Elo ${elo}: ${avgCorners.toFixed(2)} corners/match (${data.count} matchs)`);
      console.log(`  → Over 9.5: ${over95Pct}%`);
      console.log(`  → Over 8.5: ${over85Pct}%`);
    }
  });
  console.log('');

  // FORMULE CARTONS
  console.log('───────────────────────────────────────────────────────────────');
  console.log('🟨 CARTONS PAR NOMBRE DE FAUTES (DONNÉES RÉELLES)');
  console.log('───────────────────────────────────────────────────────────────');

  Object.keys(learningData.cardsByFouls).forEach(fouls => {
    const data = learningData.cardsByFouls[fouls];
    if (data.count > 10) { // Minimum 10 matchs pour être significatif
      const avgCards = data.total / data.count;
      const over25Pct = (data.over25 / data.count * 100).toFixed(1);
      const over45Pct = (data.over45 / data.count * 100).toFixed(1);

      console.log(`${fouls} fautes: ${avgCards.toFixed(2)} cartons/match (${data.count} matchs)`);
      console.log(`  → Over 2.5: ${over25Pct}%`);
      console.log(`  → Over 4.5: ${over45Pct}%`);
    }
  });
  console.log('');

  // FORMULE BTTS
  console.log('───────────────────────────────────────────────────────────────');
  console.log('⚽ BTTS PAR DIFFÉRENCE ELO (DONNÉES RÉELLES)');
  console.log('───────────────────────────────────────────────────────────────');

  Object.keys(learningData.bttsByEloDiff).forEach(diff => {
    const data = learningData.bttsByEloDiff[diff];
    if (data.total > 0) {
      const bttsYesPct = (data.bttsYes / data.total * 100).toFixed(1);
      const bttsNoPct = (data.bttsNo / data.total * 100).toFixed(1);

      console.log(`Diff Elo ${diff}: BTTS YES ${bttsYesPct}% / NO ${bttsNoPct}% (${data.total} matchs)`);
    }
  });
  console.log('');

  // ========================================================================
  // CRÉER FONCTIONS DE PRÉDICTION OPTIMALES
  // ========================================================================

  learningData.formulas.goals = function(eloAvg) {
    const bucket = Math.round(eloAvg / 50) * 50;
    const data = learningData.goalsByElo[bucket];

    if (data && data.count > 0) {
      return {
        expected: data.total / data.count,
        over25Probability: data.over25 / data.count,
        over15Probability: data.over15 / data.count,
        under35Probability: data.under35 / data.count,
        confidence: Math.min(95, 50 + Math.log(data.count) * 10)
      };
    }

    // Fallback
    return {
      expected: 2.7,
      over25Probability: 0.52,
      over15Probability: 0.75,
      under35Probability: 0.72,
      confidence: 50
    };
  };

  learningData.formulas.corners = function(eloAvg) {
    const bucket = Math.round(eloAvg / 50) * 50;
    const data = learningData.cornersByElo[bucket];

    if (data && data.count > 0) {
      return {
        expected: data.total / data.count,
        over95Probability: data.over95 / data.count,
        over85Probability: data.over85 / data.count,
        confidence: Math.min(95, 50 + Math.log(data.count) * 10)
      };
    }

    return {
      expected: 10.5,
      over95Probability: 0.50,
      over85Probability: 0.63,
      confidence: 50
    };
  };

  learningData.formulas.cards = function(totalFouls) {
    const bucket = Math.round(totalFouls / 2) * 2;
    const data = learningData.cardsByFouls[bucket];

    if (data && data.count > 10) {
      return {
        expected: data.total / data.count,
        over25Probability: data.over25 / data.count,
        over45Probability: data.over45 / data.count,
        confidence: Math.min(95, 50 + Math.log(data.count) * 10)
      };
    }

    // Formule basée sur fautes (apprise)
    return {
      expected: 2.0 + (totalFouls - 23) * 0.05,
      over25Probability: 0.50 + (totalFouls - 23) * 0.01,
      over45Probability: 0.30 + (totalFouls - 23) * 0.015,
      confidence: 60
    };
  };

  learningData.formulas.btts = function(eloDiff) {
    const bucket = Math.round(eloDiff / 50) * 50;
    const data = learningData.bttsByEloDiff[bucket];

    if (data && data.total > 0) {
      return {
        yesProbability: data.bttsYes / data.total,
        noProbability: data.bttsNo / data.total,
        confidence: Math.min(95, 50 + Math.log(data.total) * 10)
      };
    }

    return {
      yesProbability: 0.50,
      noProbability: 0.50,
      confidence: 50
    };
  };

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✅ FORMULES OPTIMALES GÉNÉRÉES À PARTIR DES DONNÉES RÉELLES');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Sauvegarder
  fs.writeFileSync(
    path.join(__dirname, 'DATA_DRIVEN_FORMULAS.json'),
    JSON.stringify({
      goalsByElo: learningData.goalsByElo,
      cornersByElo: learningData.cornersByElo,
      cardsByFouls: learningData.cardsByFouls,
      bttsByEloDiff: learningData.bttsByEloDiff
    }, null, 2)
  );

  console.log('✅ Données sauvegardées: DATA_DRIVEN_FORMULAS.json\n');

  return learningData;
}

// ============================================================================
// EXÉCUTION
// ============================================================================

try {
  const data = learnFromData();

  // Test des formules
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 TEST DES FORMULES SUR EXEMPLES');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('Test 1: Match Premier League (Elo moyen 1750)');
  const test1 = data.formulas.goals(1750);
  console.log(`  Buts attendus: ${test1.expected.toFixed(2)}`);
  console.log(`  Over 2.5: ${(test1.over25Probability * 100).toFixed(1)}%`);
  console.log(`  Confiance: ${test1.confidence.toFixed(0)}%\n`);

  console.log('Test 2: Match physique (28 fautes)');
  const test2 = data.formulas.cards(28);
  console.log(`  Cartons attendus: ${test2.expected.toFixed(2)}`);
  console.log(`  Over 2.5: ${(test2.over25Probability * 100).toFixed(1)}%`);
  console.log(`  Confiance: ${test2.confidence.toFixed(0)}%\n`);

} catch (error) {
  console.error('❌ ERREUR:', error.message);
  console.error(error.stack);
}
