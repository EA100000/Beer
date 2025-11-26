/**
 * TEST: Vérifier que le parser extrait bien toutes les variables
 */

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

// Simuler l'extraction
const regexTests = [
  { name: 'Possession', regex: /(\d+)%\s*Possession\s*(\d+)%/i, expected: ['59', '41'] },
  { name: 'xG', regex: /([\d.]+)\s*Buts attendus \(xG\)\s*([\d.]+)/i, expected: ['1.29', '0.23'] },
  { name: 'Grosses occasions', regex: /(\d+)\s*Grosses occasions\s*(\d+)/i, expected: ['3', '0'] },
  { name: 'Total tirs', regex: /(\d+)\s*Total des tirs\s*(\d+)/i, expected: ['6', '4'] },
  { name: 'Arrêts gardien', regex: /(\d+)\s*Arrêts du gardien\s*(\d+)/i, expected: ['0', '1'] },
  { name: 'Corner', regex: /(\d+)\s*Corner\s*(\d+)/i, expected: ['2', '0'] },
  { name: 'Fautes', regex: /(\d+)\s*Fautes\s*(\d+)/i, expected: ['6', '2'] },
  { name: 'Passes', regex: /(\d+)\s*Passes\s*(\d+)/i, expected: ['196', '140'] },
  { name: 'Tacles', regex: /(\d+)\s*Tacles\s*(\d+)/i, expected: ['5', '4'] },
  { name: 'Tirs cadrés', regex: /(\d+)\s*Tirs cadrés\s*(\d+)/i, expected: ['3', '0'] },
  { name: 'Duels au sol', regex: /(\d+)\/(\d+)\s*\d+%\s*Duels au sol\s*\d+%\s*(\d+)\/(\d+)/i, expected: ['11', '22', '11', '23'] },
  { name: 'Dribbles', regex: /(\d+)\/(\d+)\s*Dribbles\s*(\d+)\/(\d+)/i, expected: ['5', '10', '2', '5'] },
];

console.log('🧪 TEST D\'EXTRACTION DES VARIABLES\n');
console.log('='.repeat(60));

let extracted = 0;
let failed = 0;

regexTests.forEach(test => {
  const match = sampleText.match(test.regex);
  if (match) {
    const values = match.slice(1);
    const success = JSON.stringify(values) === JSON.stringify(test.expected);
    if (success) {
      console.log(`✅ ${test.name}: ${values.join(' - ')}`);
      extracted++;
    } else {
      console.log(`❌ ${test.name}: Attendu ${test.expected.join(' - ')}, reçu ${values.join(' - ')}`);
      failed++;
    }
  } else {
    console.log(`❌ ${test.name}: NON TROUVÉ`);
    failed++;
  }
});

console.log('='.repeat(60));
console.log(`\n📊 RÉSULTAT: ${extracted}/${regexTests.length} variables extraites (${failed} échecs)`);
console.log(`\n${extracted === regexTests.length ? '✅ TOUS LES TESTS PASSENT!' : '❌ CERTAINES VARIABLES NE SONT PAS EXTRAITES!'}`);
