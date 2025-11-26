/**
 * TEST: Vérifier le VRAI parser intelligentMatchParser.ts
 */

import { parseIntelligentMatchData } from './src/utils/intelligentMatchParser.ts';

const sampleText = `
Aperçu du match
59% Possession 41%
1.29 Buts attendus (xG) 0.23
3 Grosses occasions 0
6 Total des tirs 4
0 Arrêts du gardien 1
2 Corner 0
6 Fautes 2
196 Passes 140
5 Tacles 4
3 Tirs cadrés 0
2 Tirs non cadrés 3
1 Tirs bloqués 1
0 Cartons jaunes 1
11/22 50% Duels au sol 48% 11/23
5/10 Dribbles 2/5
3 Interceptions 5
10 Dégagements 8
5 Balles perdues 8
38/66 58% Passes dans le tiers offensif 55% 11/20
10/15 Longs ballons 5/10
5/12 Centres 3/8
2 Passes en profondeur 1
15 Touches dans la surface 5
120 Touches 95
`;

console.log('🧪 TEST DU PARSER RÉEL intelligentMatchParser.ts\n');
console.log('='.repeat(70));

const result = parseIntelligentMatchData(sampleText);

console.log(`\n📊 QUALITÉ DES DONNÉES: ${result.dataQuality}%`);
console.log(`📝 CHAMPS MANQUANTS (${result.missingFields.length}): ${result.missingFields.join(', ')}`);

console.log('\n🔍 DONNÉES EXTRAITES:');
console.log('='.repeat(70));

const checkValue = (label, value, expected = null) => {
  const status = value > 0 || expected !== null ? '✅' : '⚠️';
  const display = expected !== null ? `${value} (attendu: ${expected})` : value;
  console.log(`${status} ${label.padEnd(30)} ${display}`);
};

// Vérifier extraction
checkValue('Possession Home', result.homePossession, 59);
checkValue('Possession Away', result.awayPossession, 41);
checkValue('xG Home', result.homeXG, 1.29);
checkValue('xG Away', result.awayXG, 0.23);
checkValue('Grosses occasions Home', result.homeBigChances, 3);
checkValue('Grosses occasions Away', result.awayBigChances, 0);
checkValue('Total tirs Home', result.homeTotalShots, 6);
checkValue('Total tirs Away', result.awayTotalShots, 4);
checkValue('Tirs cadrés Home', result.homeShotsOnTarget, 3);
checkValue('Tirs cadrés Away', result.awayShotsOnTarget, 0);
checkValue('Corners Home', result.homeCorners, 2);
checkValue('Corners Away', result.awayCorners, 0);
checkValue('Fautes Home', result.homeFouls, 6);
checkValue('Fautes Away', result.awayFouls, 2);
checkValue('Passes Home', result.homePasses, 196);
checkValue('Passes Away', result.awayPasses, 140);
checkValue('Tacles Home', result.homeTackles, 5);
checkValue('Tacles Away', result.awayTackles, 4);
checkValue('Duels sol gagnés Home', result.homeGroundDuelsWon, 11);
checkValue('Duels sol total Home', result.homeGroundDuelsTotal, 22);
checkValue('Duels sol gagnés Away', result.awayGroundDuelsWon, 11);
checkValue('Duels sol total Away', result.awayGroundDuelsTotal, 23);
checkValue('Dribbles réussis Home', result.homeDribbles, 5);
checkValue('Dribbles total Home', result.homeDribblesTotal, 10);
checkValue('Dribbles réussis Away', result.awayDribbles, 2);
checkValue('Dribbles total Away', result.awayDribblesTotal, 5);
checkValue('Interceptions Home', result.homeInterceptions, 3);
checkValue('Interceptions Away', result.awayInterceptions, 5);
checkValue('Dégagements Home', result.homeClearances, 10);
checkValue('Dégagements Away', result.awayClearances, 8);

console.log('='.repeat(70));
console.log(`\n${result.dataQuality >= 80 ? '✅' : '⚠️'} Qualité globale: ${result.dataQuality}%`);
