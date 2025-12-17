// Test simple pour vérifier les prédictions
const projected = 10;
const thresholds = [8.5, 9.5, 10.5, 11.5, 12.5];
const minute = 30;
const currentValue = 5;

const predictions = thresholds.map(threshold => {
  const distance = Math.abs(projected - threshold);
  const prediction = projected > threshold ? 'OVER' : 'UNDER';

  // Calcul confiance
  let confidence = 50 + (distance * 8) + ((minute / 90) * 20);
  confidence = Math.min(95, confidence);

  return {
    threshold,
    prediction,
    projected: Math.round(projected * 10) / 10,
    confidence: Math.round(confidence),
    distance: Math.round(distance * 10) / 10,
    reasoning: `✅ ${prediction} ${threshold} | Projeté: ${projected.toFixed(1)} | Min: ${minute}/90`
  };
});

console.log('Nombre de prédictions:', predictions.length);
console.log('Prédictions:', JSON.stringify(predictions, null, 2));

const bestPick = predictions.length > 0
  ? predictions.reduce((best, curr) => curr.confidence > best.confidence ? curr : best)
  : null;

console.log('\nBest Pick:', bestPick);
