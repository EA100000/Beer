// TEST DU PARSER AVEC VOS DONNÉES RÉELLES
// Pour exécuter: node test-parser.js

const testData = `Aperçu du match
59%
Possession
41%
3
Grosses occasions
3
22
Total des tirs
7
1
Arrêts du gardien
4
3
Corner
0
8
Fautes
7
473
Passes
334
22
Tacles
22
7
Coups francs
7
3
Cartons jaunes
1
Tirs
Real Madrid
Paris FC
Eva Maria Navarro
E. M. Navarro
83'
xG
-
xGOT
-
Résultat
Manqué
Situation
Corner
Type de tir
Droitier
Zone de but
En haut à droite
22
Total des tirs
7
4
Tirs cadrés
2
1
Frappe sur le poteau
0
16
Tirs non cadrés
4
2
Tirs bloqués
1
17
Tirs dans la surface
5
5
Tirs en dehors de la surface
2
Attaque
Real Madrid
Paris FC
Plus forte concentration d'actions
Plus faible concentration d'actions
0
Grosses occasions réalisées
1
3
Grosses occasions manquées
2
2
Passes en profondeur
0
37
Touches dans la surface de réparation adversaire
20
3
Tacles reçus dans le tiers offensif
1
0
Hors-jeux
3
Passes
18%
45%
37%
403
Passe précise
254
27
Touches
16
76
Passes vers le tiers offensif
33
102/135
76%
Passes dans le tiers offensif
55%
30/55
19/36
53%
Longs ballons
41%
17/41
4/26
15%
Transversales
60%
3/5
Duels
51%
Duels
49%
14
Perte de balle
7
41/75
55%
Duels au sol
45%
34/75
6/17
35%
Duels aériens
65%
11/17
12/20
60%
Dribbles
29%
6/21
Défense
55%
Tacles gagnés
55%
22
Total de tacles
22
3
Interceptions
6
51
Récupérations
54
6
Dégagements
35
1
Erreurs menant à un tir
0
Garder les buts
1
Arrêts du gardien
4
0
Grands arrêts
2
1
Sorties aériennes
1
0
Dégagements des poings
1
4
Coup de pied de but
15`;

// Copie simplifiée de la fonction parseLiveStats
function parseLiveStatsTest(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const warnings = [];

  const result = {
    possession: { home: 0, away: 0 },
    corners: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
    yellowCards: { home: 0, away: 0 },
    offsides: { home: 0, away: 0 },
    totalShots: { home: 0, away: 0 },
    shotsOnTarget: { home: 0, away: 0 },
    bigChances: { home: 0, away: 0 },
    passes: { home: 0, away: 0 },
    tackles: { home: 0, away: 0 },
    goalkeeperSaves: { home: 0, away: 0 },
    shotsBlocked: { home: 0, away: 0 },
    shotsOffTarget: { home: 0, away: 0 },
    freeKicks: { home: 0, away: 0 },
    shotsOnPost: { home: 0, away: 0 },
    shotsInsideBox: { home: 0, away: 0 },
    shotsOutsideBox: { home: 0, away: 0 },
    perte: { home: 0, away: 0 },
    touches: { home: 0, away: 0 },
    passesVersOffensif: { home: 0, away: 0 },
    longsBallons: { home: 0, away: 0 },
    transversales: { home: 0, away: 0 },
    duelsSol: { home: 0, away: 0 },
    duelsAeriens: { home: 0, away: 0 },
    dribbles: { home: 0, away: 0 },
    taclesGagnes: { home: 0, away: 0 },
    interceptions: { home: 0, away: 0 },
    recuperations: { home: 0, away: 0 },
    degagements: { home: 0, away: 0 },
    sortiesAeriennes: { home: 0, away: 0 },
    degagementsPoings: { home: 0, away: 0 },
    coupPiedBut: { home: 0, away: 0 },
    passesPrecises: { home: 0, away: 0 }
  };

  const findStat = (keywords) => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      const keywordFound = keywords.some(kw => line.includes(kw.toLowerCase()));

      if (keywordFound) {
        // Fractions
        const fractionMatch = lines[i].match(/(\d+)\/\d+.*?(\d+)\/\d+/);
        if (fractionMatch) {
          return [parseInt(fractionMatch[1]), parseInt(fractionMatch[2])];
        }

        // Pourcentages
        const percentMatch = lines[i].match(/(\d+)%.*?(\d+)%/);
        if (percentMatch) {
          return [parseInt(percentMatch[1]), parseInt(percentMatch[2])];
        }

        // Inline
        const inlineMatch = lines[i].match(/^(\d+)\s+\w+.*?\s+(\d+)$/);
        if (inlineMatch) {
          return [parseInt(inlineMatch[1]), parseInt(inlineMatch[2])];
        }

        // Format SofaScore - valeur AVANT
        if (i > 0) {
          const prevLine = parseInt(lines[i - 1]);
          if (!isNaN(prevLine)) {
            for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
              const nextNum = parseInt(lines[j]);
              if (!isNaN(nextNum) && lines[j].trim() === nextNum.toString()) {
                return [prevLine, nextNum];
              }
            }
          }
        }

        // Lignes suivantes
        const values = [];
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const num = parseInt(lines[j]);
          if (!isNaN(num) && lines[j].trim() === num.toString()) {
            values.push(num);
            if (values.length === 2) {
              return [values[0], values[1]];
            }
          }
        }
      }
    }
    return null;
  };

  // EXTRACTION
  const possession = findStat(['possession']);
  if (possession) result.possession = { home: possession[0], away: possession[1] };

  const corners = findStat(['corner']);
  if (corners) result.corners = { home: corners[0], away: corners[1] };

  const fouls = findStat(['fautes']);
  if (fouls) result.fouls = { home: fouls[0], away: fouls[1] };

  const yellowCards = findStat(['cartons jaunes']);
  if (yellowCards) result.yellowCards = { home: yellowCards[0], away: yellowCards[1] };

  const offsides = findStat(['hors-jeux']);
  if (offsides) result.offsides = { home: offsides[0], away: offsides[1] };

  const totalShots = findStat(['total des tirs']);
  if (totalShots) result.totalShots = { home: totalShots[0], away: totalShots[1] };

  const shotsOnTarget = findStat(['tirs cadrés']);
  if (shotsOnTarget) result.shotsOnTarget = { home: shotsOnTarget[0], away: shotsOnTarget[1] };

  const bigChances = findStat(['grosses occasions']);
  if (bigChances) result.bigChances = { home: bigChances[0], away: bigChances[1] };

  const passes = findStat(['passes']);
  if (passes) result.passes = { home: passes[0], away: passes[1] };

  const tackles = findStat(['tacles']);
  if (tackles) result.tackles = { home: tackles[0], away: tackles[1] };

  const saves = findStat(['arrêts du gardien']);
  if (saves) result.goalkeeperSaves = { home: saves[0], away: saves[1] };

  const shotsBlocked = findStat(['tirs bloqués']);
  if (shotsBlocked) result.shotsBlocked = { home: shotsBlocked[0], away: shotsBlocked[1] };

  const shotsOff = findStat(['tirs non cadrés']);
  if (shotsOff) result.shotsOffTarget = { home: shotsOff[0], away: shotsOff[1] };

  const freeKicks = findStat(['coups francs']);
  if (freeKicks) result.freeKicks = { home: freeKicks[0], away: freeKicks[1] };

  const shotsPost = findStat(['frappe sur le poteau']);
  if (shotsPost) result.shotsOnPost = { home: shotsPost[0], away: shotsPost[1] };

  const shotsInside = findStat(['tirs dans la surface']);
  if (shotsInside) result.shotsInsideBox = { home: shotsInside[0], away: shotsInside[1] };

  const shotsOutside = findStat(['tirs en dehors de la surface']);
  if (shotsOutside) result.shotsOutsideBox = { home: shotsOutside[0], away: shotsOutside[1] };

  const perte = findStat(['perte de balle']);
  if (perte) result.perte = { home: perte[0], away: perte[1] };

  const touches = findStat(['touches']);
  if (touches) result.touches = { home: touches[0], away: touches[1] };

  const passesOff = findStat(['passes vers le tiers offensif']);
  if (passesOff) result.passesVersOffensif = { home: passesOff[0], away: passesOff[1] };

  const longBalls = findStat(['longs ballons']);
  if (longBalls) result.longsBallons = { home: longBalls[0], away: longBalls[1] };

  const transv = findStat(['transversales']);
  if (transv) result.transversales = { home: transv[0], away: transv[1] };

  const groundDuels = findStat(['duels au sol']);
  if (groundDuels) result.duelsSol = { home: groundDuels[0], away: groundDuels[1] };

  const aerialDuels = findStat(['duels aériens']);
  if (aerialDuels) result.duelsAeriens = { home: aerialDuels[0], away: aerialDuels[1] };

  const dribbles = findStat(['dribbles']);
  if (dribbles) result.dribbles = { home: dribbles[0], away: dribbles[1] };

  const taclesWon = findStat(['tacles gagnés']);
  if (taclesWon) result.taclesGagnes = { home: taclesWon[0], away: taclesWon[1] };

  const interceptions = findStat(['interceptions']);
  if (interceptions) result.interceptions = { home: interceptions[0], away: interceptions[1] };

  const recup = findStat(['récupérations']);
  if (recup) result.recuperations = { home: recup[0], away: recup[1] };

  const clearances = findStat(['dégagements']);
  if (clearances) result.degagements = { home: clearances[0], away: clearances[1] };

  const aerial = findStat(['sorties aériennes']);
  if (aerial) result.sortiesAeriennes = { home: aerial[0], away: aerial[1] };

  const punches = findStat(['dégagements des poings']);
  if (punches) result.degagementsPoings = { home: punches[0], away: punches[1] };

  const goalKicks = findStat(['coup de pied de but']);
  if (goalKicks) result.coupPiedBut = { home: goalKicks[0], away: goalKicks[1] };

  const accuratePass = findStat(['passe précise']);
  if (accuratePass) result.passesPrecises = { home: accuratePass[0], away: accuratePass[1] };

  // COMPTEUR
  let statsFound = 0;
  for (const key in result) {
    if (result[key].home > 0 || result[key].away > 0) {
      statsFound++;
    }
  }

  return { result, statsFound, totalVariables: Object.keys(result).length };
}

// EXÉCUTION DU TEST
console.log('🧪 TEST DU PARSER AVEC DONNÉES REAL MADRID vs PARIS FC\n');
console.log('='.repeat(60));

const testResult = parseLiveStatsTest(testData);

console.log(`\n📊 RÉSULTAT: ${testResult.statsFound}/${testResult.totalVariables} VARIABLES EXTRAITES\n`);
console.log('='.repeat(60));

console.log('\n✅ VARIABLES EXTRAITES:\n');
for (const [key, value] of Object.entries(testResult.result)) {
  if (value.home > 0 || value.away > 0) {
    console.log(`  ${key.padEnd(25)} ${value.home} - ${value.away}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log(`\n🎯 TAUX DE RÉUSSITE: ${Math.round((testResult.statsFound / testResult.totalVariables) * 100)}%`);

if (testResult.statsFound >= 30) {
  console.log('\n✅ EXCELLENT! Le parser fonctionne parfaitement!');
} else if (testResult.statsFound >= 20) {
  console.log('\n✅ BON! Le parser extrait la majorité des données');
} else if (testResult.statsFound >= 10) {
  console.log('\n⚠️  MOYEN. Le parser a besoin d\'ajustements');
} else {
  console.log('\n❌ PROBLÈME. Le parser ne fonctionne pas correctement');
}

console.log('\n' + '='.repeat(60));
