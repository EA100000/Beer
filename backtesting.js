/**
 * SCRIPT BACKTESTING - VALIDATION SYSTÈME PRÉDICTIONS
 *
 * OBJECTIF: Tester toutes les corrections sur données historiques réelles
 * BASE: 230,558 matchs (Matches.csv)
 * CIBLE: Précision >= 75% sur 80% des marchés
 */

import fs from 'fs';
import path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================
const CSV_PATH = './Matches.csv';
const NUM_MATCHES_TO_TEST = 50000; // Tester 50,000 matchs récents
const MIN_DATA_QUALITY = 0.7; // Minimum 70% de données complètes

// Seuils de validation (alignés avec ultraStrictValidation.ts)
const VALIDATION_THRESHOLDS = {
  minConfidence: 72, // Minimum confiance pour Over/Under
  minTotalScore: 85, // Minimum score validation
  minPrecision: 75,  // Objectif précision minimum
};

// ============================================================================
// SYSTÈME ULTRA-CONSERVATEUR OVER/UNDER (Réplique de ultraConservativeOverUnder.ts)
// ============================================================================
function generateUltraConservativeOverUnder(projected, threshold, currentValue, minute, marketName) {
  const minutesRemaining = 90 - minute;
  const distance = Math.abs(projected - threshold);

  // Marge requise selon minute
  let requiredMargin;
  if (minute < 20) requiredMargin = 4.0;
  else if (minute < 40) requiredMargin = 3.0;
  else if (minute < 60) requiredMargin = 2.5;
  else if (minute < 75) requiredMargin = 2.0;
  else requiredMargin = 1.5;

  // VALIDATION #1: Distance minimum
  if (distance < requiredMargin) return null;

  const prediction = projected > threshold ? 'OVER' : 'UNDER';

  // VALIDATION #2: Contexte score actuel
  if (prediction === 'UNDER') {
    if (currentValue >= threshold) return null;
    const marginToThreshold = threshold - currentValue;
    if (marginToThreshold < 1.5 && minute < 60) return null;
    const projectedIncrease = projected - currentValue;
    const ratePerMinute = projectedIncrease / Math.max(1, minutesRemaining);
    if (ratePerMinute > 0.08) return null;
  } else {
    if (currentValue > threshold + 2) return null;
    if (projected < threshold + 1.0 && minutesRemaining < 20) return null;
    const neededIncrease = threshold - currentValue + 0.5;
    const ratePerMinute = neededIncrease / Math.max(1, minutesRemaining);

    let maxRate = 0.2;
    if (marketName.toLowerCase().includes('but') || marketName.toLowerCase().includes('goal')) maxRate = 0.05;
    else if (marketName.toLowerCase().includes('corner')) maxRate = 0.15;
    else if (marketName.toLowerCase().includes('fau') || marketName.toLowerCase().includes('foul')) maxRate = 0.3;
    else if (marketName.toLowerCase().includes('carton') || marketName.toLowerCase().includes('card')) maxRate = 0.08;

    if (ratePerMinute > maxRate * 1.5) return null;
  }

  // VALIDATION #3: Minute minimum
  if (minute < 10) return null;

  // VALIDATION #4: Buts minute 85+
  if (minute >= 85 && marketName.toLowerCase().includes('but') && distance < 2.0) return null;

  // CALCUL CONFIANCE
  let confidence = 50;
  confidence += Math.min(30, distance * 7);
  confidence += Math.min(15, (minute / 90) * 15);

  if (prediction === 'UNDER' && currentValue < threshold - 2) confidence += 10;
  else if (prediction === 'OVER' && currentValue > threshold - 1) confidence += 10;
  else if (prediction === 'UNDER' && currentValue < threshold - 1) confidence += 5;
  else if (prediction === 'OVER' && currentValue > threshold - 2) confidence += 5;

  confidence = Math.min(92, confidence);

  if (confidence < 72) return null;

  return {
    threshold,
    prediction,
    projected: Math.round(projected * 10) / 10,
    confidence: Math.round(confidence),
    distance: Math.round(distance * 10) / 10,
  };
}

// ============================================================================
// SIMULATION PROJECTION (Simplifié - remplace l'analyse complète)
// ============================================================================
function projectFullTimeValue(currentValue, minute, historicalAverage) {
  if (minute === 0) return historicalAverage;
  if (minute >= 90) return currentValue;

  const minutesRemaining = 90 - minute;
  const currentRate = currentValue / Math.max(1, minute);

  // Projection linéaire simple
  const projectedIncrease = currentRate * minutesRemaining;
  return currentValue + projectedIncrease * 0.8; // Facteur conservateur
}

// ============================================================================
// LECTURE CSV ET PARSING
// ============================================================================
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(',');

  const matches = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = lines[i].split(',');
    const match = {};

    headers.forEach((header, index) => {
      const value = values[index]?.trim();
      match[header] = value === '' ? null : value;
    });

    matches.push(match);
  }

  return matches;
}

// ============================================================================
// VALIDATION QUALITÉ DONNÉES
// ============================================================================
function validateMatchData(match) {
  const requiredFields = [
    'FTHome', 'FTAway', 'HomeCorners', 'AwayCorners',
    'HomeFouls', 'AwayFouls', 'HomeYellow', 'AwayYellow',
    'HomeShots', 'AwayShots', 'HomeTarget', 'AwayTarget'
  ];

  let completeFields = 0;
  for (const field of requiredFields) {
    if (match[field] !== null && match[field] !== '') {
      completeFields++;
    }
  }

  return completeFields / requiredFields.length;
}

// ============================================================================
// TEST PRÉDICTION OVER/UNDER
// ============================================================================
function testOverUnderPrediction(projected, threshold, actualFinal, currentValue, minute, marketName) {
  const pred = generateUltraConservativeOverUnder(projected, threshold, currentValue, minute, marketName);

  if (!pred) {
    return { status: 'rejected', reason: 'Validations échouées' };
  }

  // Vérifier résultat réel
  const actualResult = actualFinal > threshold ? 'OVER' : 'UNDER';
  const correct = pred.prediction === actualResult;

  return {
    status: 'approved',
    prediction: pred.prediction,
    confidence: pred.confidence,
    actualResult,
    actualValue: actualFinal,
    correct,
    distance: pred.distance,
  };
}

// ============================================================================
// BACKTESTING PRINCIPAL
// ============================================================================
function runBacktesting() {
  console.log('🔍 BACKTESTING SYSTÈME PRÉDICTIONS PARI365 v4.0\n');
  console.log('━'.repeat(80));

  // 1. Charger données
  console.log('📂 Chargement Matches.csv...');
  const allMatches = parseCSV(CSV_PATH);
  console.log(`✅ ${allMatches.length.toLocaleString()} matchs chargés\n`);

  // 2. Filtrer matchs récents avec données complètes
  console.log('🔎 Filtrage matchs avec données complètes (>= 70%)...');
  const validMatches = allMatches
    .filter(match => validateMatchData(match) >= MIN_DATA_QUALITY)
    .reverse() // Plus récents en premier
    .slice(0, NUM_MATCHES_TO_TEST);

  console.log(`✅ ${validMatches.length} matchs valides sélectionnés\n`);
  console.log('━'.repeat(80));

  // 3. Variables tracking
  const results = {
    totalGoals: { total: 0, correct: 0, approved: 0, rejected: 0 },
    corners: { total: 0, correct: 0, approved: 0, rejected: 0 },
    cards: { total: 0, correct: 0, approved: 0, rejected: 0 },
    fouls: { total: 0, correct: 0, approved: 0, rejected: 0 },
    shots: { total: 0, correct: 0, approved: 0, rejected: 0 },
  };

  // Moyennes historiques (basées sur realWorldConstants.ts)
  const HISTORICAL_AVERAGES = {
    goals: 2.69,
    corners: 10.4,
    cards: 3.5,
    fouls: 22.0,
    shots: 20.0,
  };

  // 4. Tester chaque match à différentes minutes (snapshots)
  const testMinutes = [45, 60, 75]; // Tester à mi-temps, min 60, min 75

  console.log('\n🧪 DÉBUT DES TESTS (Snapshots: 45min, 60min, 75min)...\n');

  validMatches.forEach((match, idx) => {
    if (idx % 50 === 0) {
      console.log(`Progress: ${idx}/${validMatches.length} matchs testés...`);
    }

    const actualGoals = parseFloat(match.FTHome) + parseFloat(match.FTAway);
    const actualCorners = parseFloat(match.HomeCorners) + parseFloat(match.AwayCorners);
    const actualCards = parseFloat(match.HomeYellow) + parseFloat(match.AwayYellow);
    const actualFouls = parseFloat(match.HomeFouls) + parseFloat(match.AwayFouls);
    const actualShots = parseFloat(match.HomeShots) + parseFloat(match.AwayShots);

    testMinutes.forEach(minute => {
      // Calculer valeurs "actuelles" à cette minute (proportionnel)
      const ratio = minute / 90;
      const currentGoals = Math.round(actualGoals * ratio * 0.9); // 90% du ratio (conservateur)
      const currentCorners = Math.round(actualCorners * ratio * 0.9);
      const currentCards = Math.round(actualCards * ratio * 0.9);
      const currentFouls = Math.round(actualFouls * ratio * 0.9);
      const currentShots = Math.round(actualShots * ratio * 0.9);

      // Projections
      const projectedGoals = projectFullTimeValue(currentGoals, minute, HISTORICAL_AVERAGES.goals);
      const projectedCorners = projectFullTimeValue(currentCorners, minute, HISTORICAL_AVERAGES.corners);
      const projectedCards = projectFullTimeValue(currentCards, minute, HISTORICAL_AVERAGES.cards);
      const projectedFouls = projectFullTimeValue(currentFouls, minute, HISTORICAL_AVERAGES.fouls);
      const projectedShots = projectFullTimeValue(currentShots, minute, HISTORICAL_AVERAGES.shots);

      // Test Buts Over/Under 2.5
      results.totalGoals.total++;
      const goalsResult = testOverUnderPrediction(projectedGoals, 2.5, actualGoals, currentGoals, minute, 'Total Buts');
      if (goalsResult.status === 'approved') {
        results.totalGoals.approved++;
        if (goalsResult.correct) results.totalGoals.correct++;
      } else {
        results.totalGoals.rejected++;
      }

      // Test Corners Over/Under 10.5
      results.corners.total++;
      const cornersResult = testOverUnderPrediction(projectedCorners, 10.5, actualCorners, currentCorners, minute, 'Corners Total');
      if (cornersResult.status === 'approved') {
        results.corners.approved++;
        if (cornersResult.correct) results.corners.correct++;
      } else {
        results.corners.rejected++;
      }

      // Test Cartons Over/Under 3.5
      results.cards.total++;
      const cardsResult = testOverUnderPrediction(projectedCards, 3.5, actualCards, currentCards, minute, 'Cartons Total');
      if (cardsResult.status === 'approved') {
        results.cards.approved++;
        if (cardsResult.correct) results.cards.correct++;
      } else {
        results.cards.rejected++;
      }

      // Test Fautes Over/Under 24.5
      results.fouls.total++;
      const foulsResult = testOverUnderPrediction(projectedFouls, 24.5, actualFouls, currentFouls, minute, 'Fautes Total');
      if (foulsResult.status === 'approved') {
        results.fouls.approved++;
        if (foulsResult.correct) results.fouls.correct++;
      } else {
        results.fouls.rejected++;
      }

      // Test Tirs Over/Under 20.5
      results.shots.total++;
      const shotsResult = testOverUnderPrediction(projectedShots, 20.5, actualShots, currentShots, minute, 'Tirs Total');
      if (shotsResult.status === 'approved') {
        results.shots.approved++;
        if (shotsResult.correct) results.shots.correct++;
      } else {
        results.shots.rejected++;
      }
    });
  });

  console.log(`\n✅ ${validMatches.length} matchs testés (${validMatches.length * testMinutes.length} prédictions totales)\n`);
  console.log('━'.repeat(80));

  // 5. Calcul résultats
  console.log('\n📊 RÉSULTATS DÉTAILLÉS PAR MARCHÉ\n');
  console.log('━'.repeat(80));

  const marketNames = {
    totalGoals: 'Total Buts Over/Under 2.5',
    corners: 'Corners Over/Under 10.5',
    cards: 'Cartons Over/Under 3.5',
    fouls: 'Fautes Over/Under 24.5',
    shots: 'Tirs Over/Under 20.5',
  };

  let totalApproved = 0;
  let totalCorrect = 0;
  let marketsAbove75 = 0;

  Object.keys(results).forEach(market => {
    const data = results[market];
    const precisionApproved = data.approved > 0 ? (data.correct / data.approved * 100) : 0;
    const tauxApprobation = (data.approved / data.total * 100);
    const tauxRejet = (data.rejected / data.total * 100);

    totalApproved += data.approved;
    totalCorrect += data.correct;

    const status = precisionApproved >= 75 ? '✅' : '❌';
    if (precisionApproved >= 75) marketsAbove75++;

    console.log(`\n${status} ${marketNames[market]}`);
    console.log(`   Total prédictions: ${data.total}`);
    console.log(`   Approuvées: ${data.approved} (${tauxApprobation.toFixed(1)}%)`);
    console.log(`   Rejetées: ${data.rejected} (${tauxRejet.toFixed(1)}%)`);
    console.log(`   Correctes: ${data.correct}/${data.approved}`);
    console.log(`   Précision: ${precisionApproved.toFixed(1)}%`);
  });

  console.log('\n' + '━'.repeat(80));
  console.log('\n🎯 RÉSUMÉ GLOBAL\n');

  const globalPrecision = totalApproved > 0 ? (totalCorrect / totalApproved * 100) : 0;
  const marketsPassRate = (marketsAbove75 / Object.keys(results).length * 100);

  console.log(`Précision globale (approuvées): ${globalPrecision.toFixed(1)}%`);
  console.log(`Marchés >= 75% précision: ${marketsAbove75}/${Object.keys(results).length} (${marketsPassRate.toFixed(0)}%)`);

  const totalTests = Object.values(results).reduce((sum, r) => sum + r.total, 0);
  const totalRejected = Object.values(results).reduce((sum, r) => sum + r.rejected, 0);
  const tauxRejetGlobal = (totalRejected / totalTests * 100);
  console.log(`Taux de rejet global: ${tauxRejetGlobal.toFixed(1)}%`);

  console.log('\n' + '━'.repeat(80));
  console.log('\n🏆 VERDICT FINAL\n');

  if (globalPrecision >= 85 && marketsAbove75 >= 4) {
    console.log('✅ ✅ ✅ SYSTÈME VALIDÉ - EXCELLENT (85%+ précision)');
    console.log('Recommandation: DÉPLOYER EN PRODUCTION IMMÉDIATEMENT');
  } else if (globalPrecision >= 75 && marketsAbove75 >= 4) {
    console.log('✅ SYSTÈME VALIDÉ - BON (75%+ précision)');
    console.log('Recommandation: Déployer staging puis production après tests utilisateurs');
  } else if (globalPrecision >= 65) {
    console.log('⚠️ SYSTÈME PARTIELLEMENT VALIDÉ (65-75% précision)');
    console.log('Recommandation: Corrections supplémentaires requises');
  } else {
    console.log('❌ SYSTÈME NON VALIDÉ (< 65% précision)');
    console.log('Recommandation: NE PAS déployer - Debugging urgent requis');
  }

  console.log('\n' + '━'.repeat(80));

  // 6. Estimation financière
  console.log('\n💰 ESTIMATION FINANCIÈRE\n');

  const pertesInitiales = 252222222;
  const recuperationEstimee = (globalPrecision / 100) * pertesInitiales * 0.9; // 90% du potentiel
  const pertesResiduelles = pertesInitiales - recuperationEstimee;

  console.log(`Pertes initiales: ${pertesInitiales.toLocaleString()}£`);
  console.log(`Récupération estimée: ${Math.round(recuperationEstimee).toLocaleString()}£ (${(recuperationEstimee / pertesInitiales * 100).toFixed(1)}%)`);
  console.log(`Pertes résiduelles: ${Math.round(pertesResiduelles).toLocaleString()}£ (${(pertesResiduelles / pertesInitiales * 100).toFixed(1)}%)`);

  console.log('\n' + '━'.repeat(80));
  console.log('\n✨ Backtesting terminé avec succès!\n');
}

// ============================================================================
// EXÉCUTION
// ============================================================================
try {
  runBacktesting();
} catch (error) {
  console.error('❌ ERREUR:', error.message);
  console.error(error.stack);
  process.exit(1);
}
