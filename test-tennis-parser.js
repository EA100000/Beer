// Test du parser tennis avec les données fournies

const testData = `Général
Âge
28 ans
33 ans
Taille
1,93 cm
1,83 cm
Performance
Matchs gagnés
20/47 (43%)
16/37 (43%)
Tournois remportés
0/34 (0%)
0/25 (0%)
Service
1er service
65%
56.5%
Points gagnés sur 1er service
60.5%
67.6%
2e service
89.2%
91.5%
Points gagnés sur 2e service
45.2%
47.1%
Aces par match
1.6
4.5
Doubles fautes par match
2.6
2.7
Métriques de pression
Balles de break sauvées
207/359 (57.7%)
146/229 (63.8%)
Balles de break converties
134/355 (37.7%)
79/223 (35.4%)
Jeux décisifs gagnés
1/7 (14.3%)
10/15 (66.7%)`;

console.log("=== TEST PARSER TENNIS ===\n");
console.log("Données brutes:\n", testData);
console.log("\n" + "=".repeat(50) + "\n");

// Simulation du parser (version simplifiée pour test)
function parseSimple(text) {
  const lines = text.split('\n').filter(l => l.trim());

  const result = {
    player1: {},
    player2: {}
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    if (line.includes('Âge') || line.includes('Age')) {
      const ages = lines[i+1].trim().split(/\s+/);
      result.player1.age = parseInt(ages[0]);
      result.player2.age = parseInt(ages[1]);
    }

    if (line.includes('Matchs gagnés')) {
      const matches = lines[i+1].trim().split(/\s+/);
      result.player1.matches = matches[0];
      result.player2.matches = matches[1];

      // Extraire %
      const p1Match = matches[0].match(/\((\d+)%\)/);
      const p2Match = matches[1].match(/\((\d+)%\)/);
      if (p1Match) result.player1.win_pct = parseInt(p1Match[1]);
      if (p2Match) result.player2.win_pct = parseInt(p2Match[1]);
    }

    if (line.includes('1er service') && !line.includes('Points')) {
      const serve = lines[i+1].trim().split(/\s+/);
      result.player1.first_serve = serve[0];
      result.player2.first_serve = serve[1];
    }

    if (line.includes('Points gagnés sur 1er service')) {
      const pts = lines[i+1].trim().split(/\s+/);
      result.player1.first_serve_won = parseFloat(pts[0]);
      result.player2.first_serve_won = parseFloat(pts[1]);
    }

    if (line.includes('Aces par match')) {
      const aces = lines[i+1].trim().split(/\s+/);
      result.player1.aces = parseFloat(aces[0]);
      result.player2.aces = parseFloat(aces[1]);
    }

    if (line.includes('Doubles fautes')) {
      const df = lines[i+1].trim().split(/\s+/);
      result.player1.double_faults = parseFloat(df[0]);
      result.player2.double_faults = parseFloat(df[1]);
    }

    if (line.includes('Balles de break sauvées')) {
      const saved = lines[i+1].trim().split(/\s+/);
      const p1 = saved[0].match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);
      const p2 = saved[1].match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);

      if (p1) {
        result.player1.break_saved = p1[1] + '/' + p1[2];
        result.player1.break_saved_pct = parseFloat(p1[3]);
      }
      if (p2) {
        result.player2.break_saved = p2[1] + '/' + p2[2];
        result.player2.break_saved_pct = parseFloat(p2[3]);
      }
    }

    if (line.includes('Balles de break converties')) {
      const conv = lines[i+1].trim().split(/\s+/);
      const p1 = conv[0].match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);
      const p2 = conv[1].match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);

      if (p1) {
        result.player1.break_conv = p1[1] + '/' + p1[2];
        result.player1.break_conv_pct = parseFloat(p1[3]);
      }
      if (p2) {
        result.player2.break_conv = p2[1] + '/' + p2[2];
        result.player2.break_conv_pct = parseFloat(p2[3]);
      }
    }

    if (line.includes('Jeux décisifs') || line.includes('Tie')) {
      const tb = lines[i+1].trim().split(/\s+/);
      const p1 = tb[0].match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);
      const p2 = tb[1].match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);

      if (p1) {
        result.player1.tiebreaks = p1[1] + '/' + p1[2];
        result.player1.tiebreaks_pct = parseFloat(p1[3]);
      }
      if (p2) {
        result.player2.tiebreaks = p2[1] + '/' + p2[2];
        result.player2.tiebreaks_pct = parseFloat(p2[3]);
      }
    }

    i++;
  }

  return result;
}

const parsed = parseSimple(testData);

console.log("DONNÉES EXTRAITES:\n");
console.log("JOUEUR 1:");
console.log("  - Âge:", parsed.player1.age, "ans");
console.log("  - Matchs gagnés:", parsed.player1.matches, `(${parsed.player1.win_pct}%)`);
console.log("  - 1er service gagné:", parsed.player1.first_serve_won + "%");
console.log("  - Aces/match:", parsed.player1.aces);
console.log("  - Doubles fautes/match:", parsed.player1.double_faults);
console.log("  - Breaks sauvés:", parsed.player1.break_saved, `(${parsed.player1.break_saved_pct}%)`);
console.log("  - Breaks convertis:", parsed.player1.break_conv, `(${parsed.player1.break_conv_pct}%)`);
console.log("  - Jeux décisifs:", parsed.player1.tiebreaks, `(${parsed.player1.tiebreaks_pct}%)`);

console.log("\nJOUEUR 2:");
console.log("  - Âge:", parsed.player2.age, "ans");
console.log("  - Matchs gagnés:", parsed.player2.matches, `(${parsed.player2.win_pct}%)`);
console.log("  - 1er service gagné:", parsed.player2.first_serve_won + "%");
console.log("  - Aces/match:", parsed.player2.aces);
console.log("  - Doubles fautes/match:", parsed.player2.double_faults);
console.log("  - Breaks sauvés:", parsed.player2.break_saved, `(${parsed.player2.break_saved_pct}%)`);
console.log("  - Breaks convertis:", parsed.player2.break_conv, `(${parsed.player2.break_conv_pct}%)`);
console.log("  - Jeux décisifs:", parsed.player2.tiebreaks, `(${parsed.player2.tiebreaks_pct}%)`);

console.log("\n" + "=".repeat(50));
console.log("\nPRÉDICTION RAPIDE:");
console.log("\n🎯 ANALYSE:");

// Rating joueur 1
let rating1 = 1000;
rating1 += parsed.player1.first_serve_won * 3;
rating1 += parsed.player1.aces * 15;
rating1 -= parsed.player1.double_faults * 20;
rating1 += parsed.player1.break_saved_pct * 2;
rating1 += parsed.player1.break_conv_pct * 1.5;
rating1 += parsed.player1.tiebreaks_pct * 2;
rating1 += parsed.player1.win_pct * 3;

// Rating joueur 2
let rating2 = 1000;
rating2 += parsed.player2.first_serve_won * 3;
rating2 += parsed.player2.aces * 15;
rating2 -= parsed.player2.double_faults * 20;
rating2 += parsed.player2.break_saved_pct * 2;
rating2 += parsed.player2.break_conv_pct * 1.5;
rating2 += parsed.player2.tiebreaks_pct * 2;
rating2 += parsed.player2.win_pct * 3;

console.log("Rating Joueur 1:", rating1.toFixed(0));
console.log("Rating Joueur 2:", rating2.toFixed(0));

const p1WinProb = rating1 / (rating1 + rating2);
const p2WinProb = rating2 / (rating1 + rating2);

console.log("\nProbabilité victoire J1:", (p1WinProb * 100).toFixed(1) + "%");
console.log("Probabilité victoire J2:", (p2WinProb * 100).toFixed(1) + "%");

console.log("\n🏆 VAINQUEUR PRÉDIT:", rating2 > rating1 ? "JOUEUR 2" : "JOUEUR 1");
console.log("   Confiance:", (Math.max(p1WinProb, p2WinProb) * 100).toFixed(0) + "%");

console.log("\n💡 INSIGHTS CLÉS:");
if (parsed.player2.tiebreaks_pct > parsed.player1.tiebreaks_pct + 20) {
  console.log(`   ✅ Joueur 2 domine en jeux décisifs (${parsed.player2.tiebreaks_pct}% vs ${parsed.player1.tiebreaks_pct}%)`);
}
if (parsed.player2.aces > parsed.player1.aces * 2) {
  console.log(`   ✅ Joueur 2 service dominant (${parsed.player2.aces} aces/match vs ${parsed.player1.aces})`);
}
if (parsed.player1.break_conv_pct > parsed.player2.break_saved_pct) {
  console.log(`   ✅ Joueur 1 efficace au retour (${parsed.player1.break_conv_pct}% breaks convertis)`);
}

// Total aces
const totalAces = parsed.player1.aces + parsed.player2.aces;
console.log("\n🎾 TOTAL ACES PRÉDIT:", totalAces.toFixed(1), "aces combinés");
console.log("   Ligne 10.5 → Prédiction:", totalAces > 10.5 ? "OVER" : "UNDER");

// Total games
const avgServeWon = (parsed.player1.first_serve_won + parsed.player2.first_serve_won) / 2;
console.log("\n🎯 TOTAL JEUX (Best of 3):");
console.log("   Service moyen gagné:", avgServeWon.toFixed(1) + "%");
console.log("   Ligne 22.5 → Prédiction:", avgServeWon > 72 ? "UNDER (serveurs forts)" : "OVER");

console.log("\n" + "=".repeat(50));
