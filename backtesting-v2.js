/**
 * BACKTESTING v2.0 - SYSTÈME HYPER-FIABILITÉ
 *
 * OBJECTIF: Valider que le système v2.0 atteint 99.5%+ de précision
 * BASE: 230,558 matchs (Matches.csv)
 * NOUVEAUTÉ: Intègre les 5 couches de sécurité (v2.0)
 */

import fs from 'fs';

// ============================================================================
// CONFIGURATION
// ============================================================================
const CSV_PATH = './Matches.csv';
const NUM_MATCHES_TO_TEST = 50000;
const MIN_DATA_QUALITY = 0.7;

// ============================================================================
// COUCHE #1: Validation Croisée Entre Marchés
// ============================================================================
function validateCrossMarketConsistency(projections) {
  const issues = [];
  let score = 100;

  // RÈGLE #1: Buts élevés → Corners élevés
  if (projections.totalGoals > 3.0 && projections.totalCorners < 9.0) {
    issues.push('Buts élevés mais corners bas');
    score -= 25;
  }

  // RÈGLE #2: Buts bas → Corners bas/moyens
  if (projections.totalGoals < 2.0 && projections.totalCorners > 12.0) {
    issues.push('Buts bas mais corners élevés');
    score -= 20;
  }

  // RÈGLE #3: Tirs élevés → Au moins quelques buts
  if (projections.totalShots > 22.0 && projections.totalGoals < 1.5) {
    issues.push('Tirs élevés mais buts très bas');
    score -= 30;
  }

  // RÈGLE #4: Fautes élevées → Cartons élevés
  if (projections.totalFouls > 28.0 && projections.totalCards < 3.0) {
    issues.push('Fautes élevées mais cartons bas');
    score -= 15;
  }

  // RÈGLE #5: Cartons élevés → Fautes élevées
  if (projections.totalCards > 5.0 && projections.totalFouls < 20.0) {
    issues.push('Cartons élevés mais fautes basses');
    score -= 20;
  }

  // RÈGLE #6: Corners très bas → Pas de buts élevés
  if (projections.totalCorners < 7.0 && projections.totalGoals > 3.5) {
    issues.push('Corners très bas mais buts élevés');
    score -= 25;
  }

  // RÈGLE #7: Conversion réaliste
  const estimatedShotsOnTarget = projections.totalShots * 0.35;
  if (projections.totalGoals > estimatedShotsOnTarget * 0.5) {
    issues.push('Conversion irréaliste');
    score -= 20;
  }

  return { score: Math.max(0, score), issues };
}

// ============================================================================
// COUCHE #2: Détection Anomalies Statistiques
// ============================================================================
function detectStatisticalAnomalies(marketName, projected, currentValue, minute) {
  const anomalies = [];
  let score = 100;

  const minutesRemaining = 90 - minute;
  const rate = minutesRemaining > 0 ? (projected - currentValue) / minutesRemaining : 0;

  const LIMITS = {
    'buts': { maxTotal: 8.0, p99: 6.0, maxRate: 0.06 },
    'corners': { maxTotal: 18.0, p99: 16.0, maxRate: 0.18 },
    'fautes': { maxTotal: 38.0, p99: 35.0, maxRate: 0.35 },
    'cartons': { maxTotal: 9.0, p99: 7.0, maxRate: 0.10 },
    'tirs': { maxTotal: 32.0, p99: 28.0, maxRate: 0.30 }
  };

  let limits = LIMITS['buts'];
  if (marketName.toLowerCase().includes('corner')) limits = LIMITS['corners'];
  else if (marketName.toLowerCase().includes('fau') || marketName.toLowerCase().includes('foul')) limits = LIMITS['fautes'];
  else if (marketName.toLowerCase().includes('carton') || marketName.toLowerCase().includes('card')) limits = LIMITS['cartons'];
  else if (marketName.toLowerCase().includes('tir') || marketName.toLowerCase().includes('shot')) limits = LIMITS['tirs'];

  // ANOMALIE #1: Valeur > Max absolu
  if (projected > limits.maxTotal) {
    anomalies.push(`Projeté ${projected.toFixed(1)} > Max ${limits.maxTotal}`);
    score -= 50;
  }

  // ANOMALIE #2: Valeur > P99
  if (projected > limits.p99) {
    anomalies.push(`Projeté ${projected.toFixed(1)} > P99 ${limits.p99}`);
    score -= 20;
  }

  // ANOMALIE #3: Taux irréaliste
  if (rate > limits.maxRate) {
    anomalies.push(`Taux ${rate.toFixed(3)}/min > Max ${limits.maxRate}/min`);
    score -= 40;
  }

  // ANOMALIE #4: Taux actuel anormal
  const currentRate = minute > 0 ? currentValue / minute : 0;
  if (currentRate > limits.maxRate * 1.2) {
    anomalies.push(`Taux actuel ${currentRate.toFixed(3)}/min élevé`);
    score -= 15;
  }

  // ANOMALIE #5: Projection négative
  if (projected < currentValue && minutesRemaining > 10) {
    anomalies.push('Projection < Actuel');
    score -= 60;
  }

  // ANOMALIE #6: Valeur actuelle > P99
  if (currentValue > limits.p99) {
    anomalies.push(`Actuel ${currentValue} > P99`);
    score -= 25;
  }

  return { score: Math.max(0, score), anomalies };
}

// ============================================================================
// COUCHE #3: Patterns Historiques
// ============================================================================
function validateHistoricalPattern(minute, currentValue, projected) {
  const warnings = [];
  let score = 100;

  const PROGRESS = { 15: 0.15, 30: 0.33, 45: 0.48, 60: 0.65, 75: 0.82, 85: 0.92 };
  const milestones = [15, 30, 45, 60, 75, 85];
  const closest = milestones.reduce((p, c) => Math.abs(c - minute) < Math.abs(p - minute) ? c : p);
  const expected = PROGRESS[closest];
  const actual = projected > 0 ? currentValue / projected : 0;

  // Progrès lent
  if (actual < expected - 0.20 && minute > 30) {
    warnings.push('Progrès lent');
    score -= 15;
  }

  // Progrès rapide
  if (actual > expected + 0.25 && minute < 75) {
    warnings.push('Progrès rapide');
    score -= 20;
  }

  // Début explosif
  if (minute < 20 && actual > 0.35) {
    warnings.push('Début explosif');
    score -= 10;
  }

  // Fin stagnante
  if (minute > 70 && actual < 0.75 && projected > currentValue + 1.0) {
    warnings.push('Fin stagnante');
    score -= 15;
  }

  return { score: Math.max(0, score), warnings };
}

// ============================================================================
// COUCHE #4: Volatilité (simplifié pour backtesting)
// ============================================================================
function analyzeVolatility(minute, marketName) {
  // Simulation: Volatilité moyenne
  // Dans une vraie app, on utiliserait l'historique des snapshots
  return { score: 85, level: 'LOW' }; // Conservateur
}

// ============================================================================
// COUCHE #5: Score Composite
// ============================================================================
function calculateHyperReliabilityScore(prediction, allProjections, minute) {
  const crossVal = validateCrossMarketConsistency(allProjections);
  const anomalies = detectStatisticalAnomalies(
    prediction.marketName,
    prediction.projected,
    prediction.currentValue,
    minute
  );
  const patterns = validateHistoricalPattern(minute, prediction.currentValue, prediction.projected);
  const volatility = analyzeVolatility(minute, prediction.marketName);

  // Normaliser confiance (72-92% → 0-100)
  const confidenceNorm = ((prediction.confidence - 72) / (92 - 72)) * 100;

  // Score composite (pondéré)
  const overall =
    crossVal.score * 0.20 +
    anomalies.score * 0.30 +
    patterns.score * 0.20 +
    volatility.score * 0.15 +
    confidenceNorm * 0.15;

  return {
    overall: Math.round(overall),
    crossVal: crossVal.score,
    anomalies: anomalies.score,
    patterns: patterns.score,
    volatility: volatility.score,
    isApproved: overall >= 90 // SEUIL 90/100
  };
}

// ============================================================================
// SYSTÈME ULTRA-CONSERVATEUR v1.0
// ============================================================================
function generateUltraConservativeOverUnder(projected, threshold, currentValue, minute, marketName) {
  const minutesRemaining = 90 - minute;
  const distance = Math.abs(projected - threshold);

  let requiredMargin;
  if (minute < 20) requiredMargin = 4.0;
  else if (minute < 40) requiredMargin = 3.0;
  else if (minute < 60) requiredMargin = 2.5;
  else if (minute < 75) requiredMargin = 2.0;
  else requiredMargin = 1.5;

  if (distance < requiredMargin) return null;

  const prediction = projected > threshold ? 'OVER' : 'UNDER';

  // Validations contexte
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

  if (minute < 10) return null;
  if (minute >= 85 && marketName.toLowerCase().includes('but') && distance < 2.0) return null;

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
    marketName
  };
}

// ============================================================================
// PROJECTION
// ============================================================================
function projectFullTimeValue(currentValue, minute, historicalAverage) {
  if (minute === 0) return historicalAverage;
  if (minute >= 90) return currentValue;
  const minutesRemaining = 90 - minute;
  const currentRate = currentValue / Math.max(1, minute);
  const projectedIncrease = currentRate * minutesRemaining;
  return currentValue + projectedIncrease * 0.8;
}

// ============================================================================
// PARSING CSV
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
// VALIDATION QUALITÉ
// ============================================================================
function validateMatchData(match) {
  const required = ['FTHome', 'FTAway', 'HomeCorners', 'AwayCorners', 'HomeFouls', 'AwayFouls',
    'HomeYellow', 'AwayYellow', 'HomeShots', 'AwayShots', 'HomeTarget', 'AwayTarget'];
  let complete = 0;
  for (const field of required) {
    if (match[field] !== null && match[field] !== '') complete++;
  }
  return complete / required.length;
}

// ============================================================================
// BACKTESTING PRINCIPAL
// ============================================================================
function runBacktesting() {
  console.log('🚀 BACKTESTING v2.0 - SYSTÈME HYPER-FIABILITÉ\n');
  console.log('━'.repeat(80));

  const allMatches = parseCSV(CSV_PATH);
  console.log(`📂 ${allMatches.length.toLocaleString()} matchs chargés`);

  const validMatches = allMatches
    .filter(match => validateMatchData(match) >= MIN_DATA_QUALITY)
    .reverse()
    .slice(0, NUM_MATCHES_TO_TEST);

  console.log(`✅ ${validMatches.length.toLocaleString()} matchs valides sélectionnés\n`);
  console.log('━'.repeat(80));

  const results = {
    totalGoals: { v1: { total: 0, correct: 0, approved: 0 }, v2: { total: 0, correct: 0, approved: 0 } },
    corners: { v1: { total: 0, correct: 0, approved: 0 }, v2: { total: 0, correct: 0, approved: 0 } },
    cards: { v1: { total: 0, correct: 0, approved: 0 }, v2: { total: 0, correct: 0, approved: 0 } },
    fouls: { v1: { total: 0, correct: 0, approved: 0 }, v2: { total: 0, correct: 0, approved: 0 } },
    shots: { v1: { total: 0, correct: 0, approved: 0 }, v2: { total: 0, correct: 0, approved: 0 } }
  };

  const AVERAGES = { goals: 2.69, corners: 10.4, cards: 3.5, fouls: 22.0, shots: 20.0 };
  const testMinutes = [45, 60, 75];

  console.log('\n🧪 TESTS EN COURS (Snapshots: 45min, 60min, 75min)...\n');

  validMatches.forEach((match, idx) => {
    if (idx % 5000 === 0) console.log(`Progress: ${idx}/${validMatches.length}`);

    const actualGoals = parseFloat(match.FTHome) + parseFloat(match.FTAway);
    const actualCorners = parseFloat(match.HomeCorners) + parseFloat(match.AwayCorners);
    const actualCards = parseFloat(match.HomeYellow) + parseFloat(match.AwayYellow);
    const actualFouls = parseFloat(match.HomeFouls) + parseFloat(match.AwayFouls);
    const actualShots = parseFloat(match.HomeShots) + parseFloat(match.AwayShots);

    testMinutes.forEach(minute => {
      const ratio = minute / 90;
      const currentGoals = Math.round(actualGoals * ratio * 0.9);
      const currentCorners = Math.round(actualCorners * ratio * 0.9);
      const currentCards = Math.round(actualCards * ratio * 0.9);
      const currentFouls = Math.round(actualFouls * ratio * 0.9);
      const currentShots = Math.round(actualShots * ratio * 0.9);

      const projectedGoals = projectFullTimeValue(currentGoals, minute, AVERAGES.goals);
      const projectedCorners = projectFullTimeValue(currentCorners, minute, AVERAGES.corners);
      const projectedCards = projectFullTimeValue(currentCards, minute, AVERAGES.cards);
      const projectedFouls = projectFullTimeValue(currentFouls, minute, AVERAGES.fouls);
      const projectedShots = projectFullTimeValue(currentShots, minute, AVERAGES.shots);

      const allProjections = {
        totalGoals: projectedGoals,
        totalCorners: projectedCorners,
        totalFouls: projectedFouls,
        totalCards: projectedCards,
        totalShots: projectedShots
      };

      // Test Buts
      results.totalGoals.v1.total++;
      results.totalGoals.v2.total++;
      const v1Goals = generateUltraConservativeOverUnder(projectedGoals, 2.5, currentGoals, minute, 'Total Buts');
      if (v1Goals) {
        results.totalGoals.v1.approved++;
        const actualResult = actualGoals > 2.5 ? 'OVER' : 'UNDER';
        if (v1Goals.prediction === actualResult) results.totalGoals.v1.correct++;

        // v2.0: Validation hyper-fiabilité
        const reliabilityScore = calculateHyperReliabilityScore(
          { marketName: 'Total Buts', projected: projectedGoals, currentValue: currentGoals, confidence: v1Goals.confidence },
          allProjections,
          minute
        );
        if (reliabilityScore.isApproved) {
          results.totalGoals.v2.approved++;
          if (v1Goals.prediction === actualResult) results.totalGoals.v2.correct++;
        }
      }

      // Test Corners
      results.corners.v1.total++;
      results.corners.v2.total++;
      const v1Corners = generateUltraConservativeOverUnder(projectedCorners, 10.5, currentCorners, minute, 'Corners Total');
      if (v1Corners) {
        results.corners.v1.approved++;
        const actualResult = actualCorners > 10.5 ? 'OVER' : 'UNDER';
        if (v1Corners.prediction === actualResult) results.corners.v1.correct++;

        const reliabilityScore = calculateHyperReliabilityScore(
          { marketName: 'Corners Total', projected: projectedCorners, currentValue: currentCorners, confidence: v1Corners.confidence },
          allProjections,
          minute
        );
        if (reliabilityScore.isApproved) {
          results.corners.v2.approved++;
          if (v1Corners.prediction === actualResult) results.corners.v2.correct++;
        }
      }

      // Test Cartons
      results.cards.v1.total++;
      results.cards.v2.total++;
      const v1Cards = generateUltraConservativeOverUnder(projectedCards, 3.5, currentCards, minute, 'Cartons Total');
      if (v1Cards) {
        results.cards.v1.approved++;
        const actualResult = actualCards > 3.5 ? 'OVER' : 'UNDER';
        if (v1Cards.prediction === actualResult) results.cards.v1.correct++;

        const reliabilityScore = calculateHyperReliabilityScore(
          { marketName: 'Cartons Total', projected: projectedCards, currentValue: currentCards, confidence: v1Cards.confidence },
          allProjections,
          minute
        );
        if (reliabilityScore.isApproved) {
          results.cards.v2.approved++;
          if (v1Cards.prediction === actualResult) results.cards.v2.correct++;
        }
      }

      // Test Fautes
      results.fouls.v1.total++;
      results.fouls.v2.total++;
      const v1Fouls = generateUltraConservativeOverUnder(projectedFouls, 24.5, currentFouls, minute, 'Fautes Total');
      if (v1Fouls) {
        results.fouls.v1.approved++;
        const actualResult = actualFouls > 24.5 ? 'OVER' : 'UNDER';
        if (v1Fouls.prediction === actualResult) results.fouls.v1.correct++;

        const reliabilityScore = calculateHyperReliabilityScore(
          { marketName: 'Fautes Total', projected: projectedFouls, currentValue: currentFouls, confidence: v1Fouls.confidence },
          allProjections,
          minute
        );
        if (reliabilityScore.isApproved) {
          results.fouls.v2.approved++;
          if (v1Fouls.prediction === actualResult) results.fouls.v2.correct++;
        }
      }

      // Test Tirs
      results.shots.v1.total++;
      results.shots.v2.total++;
      const v1Shots = generateUltraConservativeOverUnder(projectedShots, 20.5, currentShots, minute, 'Tirs Total');
      if (v1Shots) {
        results.shots.v1.approved++;
        const actualResult = actualShots > 20.5 ? 'OVER' : 'UNDER';
        if (v1Shots.prediction === actualResult) results.shots.v1.correct++;

        const reliabilityScore = calculateHyperReliabilityScore(
          { marketName: 'Tirs Total', projected: projectedShots, currentValue: currentShots, confidence: v1Shots.confidence },
          allProjections,
          minute
        );
        if (reliabilityScore.isApproved) {
          results.shots.v2.approved++;
          if (v1Shots.prediction === actualResult) results.shots.v2.correct++;
        }
      }
    });
  });

  console.log(`\n✅ ${validMatches.length.toLocaleString()} matchs testés\n`);
  console.log('━'.repeat(80));

  // RÉSULTATS
  console.log('\n📊 COMPARAISON v1.0 vs v2.0\n');
  console.log('━'.repeat(80));

  const markets = {
    totalGoals: 'Total Buts 2.5',
    corners: 'Corners 10.5',
    cards: 'Cartons 3.5',
    fouls: 'Fautes 24.5',
    shots: 'Tirs 20.5'
  };

  let v1TotalApproved = 0, v1TotalCorrect = 0;
  let v2TotalApproved = 0, v2TotalCorrect = 0;

  Object.keys(results).forEach(market => {
    const v1 = results[market].v1;
    const v2 = results[market].v2;
    const precV1 = v1.approved > 0 ? (v1.correct / v1.approved * 100) : 0;
    const precV2 = v2.approved > 0 ? (v2.correct / v2.approved * 100) : 0;
    const appV1 = (v1.approved / v1.total * 100);
    const appV2 = (v2.approved / v2.total * 100);

    v1TotalApproved += v1.approved;
    v1TotalCorrect += v1.correct;
    v2TotalApproved += v2.approved;
    v2TotalCorrect += v2.correct;

    console.log(`\n${markets[market]}`);
    console.log(`  v1.0: ${v1.correct}/${v1.approved} (${precV1.toFixed(1)}%) | Approbation: ${appV1.toFixed(1)}%`);
    console.log(`  v2.0: ${v2.correct}/${v2.approved} (${precV2.toFixed(1)}%) | Approbation: ${appV2.toFixed(1)}%`);
    console.log(`  Gain: ${(precV2 - precV1).toFixed(1)}% précision | ${(appV2 - appV1).toFixed(1)}% approbation`);
  });

  console.log('\n' + '━'.repeat(80));
  console.log('\n🎯 RÉSUMÉ GLOBAL\n');

  const v1Precision = v1TotalApproved > 0 ? (v1TotalCorrect / v1TotalApproved * 100) : 0;
  const v2Precision = v2TotalApproved > 0 ? (v2TotalCorrect / v2TotalApproved * 100) : 0;

  console.log(`v1.0 (Ultra-Conservateur): ${v1Precision.toFixed(2)}% précision | ${v1TotalApproved.toLocaleString()} approuvées`);
  console.log(`v2.0 (Hyper-Fiabilité):    ${v2Precision.toFixed(2)}% précision | ${v2TotalApproved.toLocaleString()} approuvées`);
  console.log(`\nGain v2.0: ${(v2Precision - v1Precision).toFixed(2)}% précision`);

  console.log('\n' + '━'.repeat(80));
  console.log('\n🏆 VERDICT FINAL\n');

  if (v2Precision >= 99.5) {
    console.log('✅ ✅ ✅ OBJECTIF ATTEINT: v2.0 >= 99.5% précision!');
    console.log('Recommandation: DÉPLOYER v2.0 EN PRODUCTION');
  } else if (v2Precision >= v1Precision) {
    console.log(`✅ AMÉLIORATION: v2.0 (${v2Precision.toFixed(2)}%) > v1.0 (${v1Precision.toFixed(2)}%)`);
    console.log('Recommandation: v2.0 est meilleur, mais ajuster seuils pour 99.5%+');
  } else {
    console.log(`⚠️ RÉGRESSION: v2.0 (${v2Precision.toFixed(2)}%) < v1.0 (${v1Precision.toFixed(2)}%)`);
    console.log('Recommandation: Réviser pondération des 5 couches');
  }

  console.log('\n' + '━'.repeat(80));
  console.log('\n✨ Backtesting v2.0 terminé!\n');
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
