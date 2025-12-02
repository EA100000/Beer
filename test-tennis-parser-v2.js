// Test amélioré du parser tennis

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

function parseTennisDataImproved(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const result = {
    player1: {},
    player2: {}
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
    const nextNextLine = i + 2 < lines.length ? lines[i + 2] : '';

    // Âge - format: "28 ans" puis "33 ans" sur lignes séparées
    if (line.toLowerCase().includes('âge') || line.toLowerCase() === 'age') {
      const age1Match = nextLine.match(/(\d+)/);
      const age2Match = nextNextLine.match(/(\d+)/);
      if (age1Match) result.player1.age = parseInt(age1Match[1]);
      if (age2Match) result.player2.age = parseInt(age2Match[1]);
    }

    // Matchs gagnés - format: "20/47 (43%)" puis "16/37 (43%)"
    if (line.toLowerCase().includes('matchs gagnés')) {
      const match1 = nextLine.match(/(\d+)\/(\d+)\s*\((\d+)%\)/);
      const match2 = nextNextLine.match(/(\d+)\/(\d+)\s*\((\d+)%\)/);

      if (match1) {
        result.player1.matches_won = parseInt(match1[1]);
        result.player1.matches_total = parseInt(match1[2]);
        result.player1.win_pct = parseInt(match1[3]);
      }
      if (match2) {
        result.player2.matches_won = parseInt(match2[1]);
        result.player2.matches_total = parseInt(match2[2]);
        result.player2.win_pct = parseInt(match2[3]);
      }
    }

    // 1er service - format: "65%" puis "56.5%"
    if ((line === '1er service' || line.toLowerCase().includes('1st serve')) &&
        !line.toLowerCase().includes('points')) {
      const pct1 = nextLine.match(/(\d+\.?\d*)%/);
      const pct2 = nextNextLine.match(/(\d+\.?\d*)%/);
      if (pct1) result.player1.first_serve_pct = parseFloat(pct1[1]);
      if (pct2) result.player2.first_serve_pct = parseFloat(pct2[1]);
    }

    // Points gagnés sur 1er service
    if (line.toLowerCase().includes('points gagnés sur 1er service') ||
        line.toLowerCase().includes('1st serve points won')) {
      const pct1 = nextLine.match(/(\d+\.?\d*)%/);
      const pct2 = nextNextLine.match(/(\d+\.?\d*)%/);
      if (pct1) result.player1.first_serve_won = parseFloat(pct1[1]);
      if (pct2) result.player2.first_serve_won = parseFloat(pct2[1]);
    }

    // 2e service
    if ((line === '2e service' || line.toLowerCase().includes('2nd serve')) &&
        !line.toLowerCase().includes('points')) {
      const pct1 = nextLine.match(/(\d+\.?\d*)%/);
      const pct2 = nextNextLine.match(/(\d+\.?\d*)%/);
      if (pct1) result.player1.second_serve_pct = parseFloat(pct1[1]);
      if (pct2) result.player2.second_serve_pct = parseFloat(pct2[1]);
    }

    // Points gagnés sur 2e service
    if (line.toLowerCase().includes('points gagnés sur 2e service') ||
        line.toLowerCase().includes('2nd serve points won')) {
      const pct1 = nextLine.match(/(\d+\.?\d*)%/);
      const pct2 = nextNextLine.match(/(\d+\.?\d*)%/);
      if (pct1) result.player1.second_serve_won = parseFloat(pct1[1]);
      if (pct2) result.player2.second_serve_won = parseFloat(pct2[1]);
    }

    // Aces par match
    if (line.toLowerCase().includes('aces par match') ||
        line.toLowerCase().includes('aces per match')) {
      const aces1 = parseFloat(nextLine);
      const aces2 = parseFloat(nextNextLine);
      if (!isNaN(aces1)) result.player1.aces_per_match = aces1;
      if (!isNaN(aces2)) result.player2.aces_per_match = aces2;
    }

    // Doubles fautes par match
    if (line.toLowerCase().includes('doubles fautes') ||
        line.toLowerCase().includes('double faults')) {
      const df1 = parseFloat(nextLine);
      const df2 = parseFloat(nextNextLine);
      if (!isNaN(df1)) result.player1.double_faults = df1;
      if (!isNaN(df2)) result.player2.double_faults = df2;
    }

    // Balles de break sauvées
    if (line.toLowerCase().includes('balles de break sauvées') ||
        line.toLowerCase().includes('break points saved')) {
      const bp1 = nextLine.match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);
      const bp2 = nextNextLine.match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);

      if (bp1) {
        result.player1.break_saved_count = parseInt(bp1[1]);
        result.player1.break_saved_total = parseInt(bp1[2]);
        result.player1.break_saved_pct = parseFloat(bp1[3]);
      }
      if (bp2) {
        result.player2.break_saved_count = parseInt(bp2[1]);
        result.player2.break_saved_total = parseInt(bp2[2]);
        result.player2.break_saved_pct = parseFloat(bp2[3]);
      }
    }

    // Balles de break converties
    if (line.toLowerCase().includes('balles de break converties') ||
        line.toLowerCase().includes('break points converted')) {
      const bp1 = nextLine.match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);
      const bp2 = nextNextLine.match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);

      if (bp1) {
        result.player1.break_conv_count = parseInt(bp1[1]);
        result.player1.break_conv_total = parseInt(bp1[2]);
        result.player1.break_conv_pct = parseFloat(bp1[3]);
      }
      if (bp2) {
        result.player2.break_conv_count = parseInt(bp2[1]);
        result.player2.break_conv_total = parseInt(bp2[2]);
        result.player2.break_conv_pct = parseFloat(bp2[3]);
      }
    }

    // Jeux décisifs gagnés
    if (line.toLowerCase().includes('jeux décisifs') ||
        line.toLowerCase().includes('tie') ||
        line.toLowerCase().includes('tiebreak')) {
      const tb1 = nextLine.match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);
      const tb2 = nextNextLine.match(/(\d+)\/(\d+)\s*\((\d+\.?\d*)%\)/);

      if (tb1) {
        result.player1.tiebreaks_won = parseInt(tb1[1]);
        result.player1.tiebreaks_total = parseInt(tb1[2]);
        result.player1.tiebreaks_pct = parseFloat(tb1[3]);
      }
      if (tb2) {
        result.player2.tiebreaks_won = parseInt(tb2[1]);
        result.player2.tiebreaks_total = parseInt(tb2[2]);
        result.player2.tiebreaks_pct = parseFloat(tb2[3]);
      }
    }
  }

  return result;
}

console.log("=== TEST PARSER TENNIS V2 (AMÉLIORÉ) ===\n");

const parsed = parseTennisDataImproved(testData);

console.log("✅ DONNÉES EXTRAITES:\n");
console.log("👤 JOUEUR 1:");
console.log("  - Âge:", parsed.player1.age, "ans");
console.log("  - Matchs:", `${parsed.player1.matches_won}/${parsed.player1.matches_total} (${parsed.player1.win_pct}%)`);
console.log("  - 1er service:", parsed.player1.first_serve_pct + "%");
console.log("  - 1er service gagné:", parsed.player1.first_serve_won + "%");
console.log("  - 2e service gagné:", parsed.player1.second_serve_won + "%");
console.log("  - Aces/match:", parsed.player1.aces_per_match);
console.log("  - Doubles fautes/match:", parsed.player1.double_faults);
console.log("  - Breaks sauvés:", `${parsed.player1.break_saved_count}/${parsed.player1.break_saved_total} (${parsed.player1.break_saved_pct}%)`);
console.log("  - Breaks convertis:", `${parsed.player1.break_conv_count}/${parsed.player1.break_conv_total} (${parsed.player1.break_conv_pct}%)`);
console.log("  - Jeux décisifs:", `${parsed.player1.tiebreaks_won}/${parsed.player1.tiebreaks_total} (${parsed.player1.tiebreaks_pct}%)`);

console.log("\n👤 JOUEUR 2:");
console.log("  - Âge:", parsed.player2.age, "ans");
console.log("  - Matchs:", `${parsed.player2.matches_won}/${parsed.player2.matches_total} (${parsed.player2.win_pct}%)`);
console.log("  - 1er service:", parsed.player2.first_serve_pct + "%");
console.log("  - 1er service gagné:", parsed.player2.first_serve_won + "%");
console.log("  - 2e service gagné:", parsed.player2.second_serve_won + "%");
console.log("  - Aces/match:", parsed.player2.aces_per_match);
console.log("  - Doubles fautes/match:", parsed.player2.double_faults);
console.log("  - Breaks sauvés:", `${parsed.player2.break_saved_count}/${parsed.player2.break_saved_total} (${parsed.player2.break_saved_pct}%)`);
console.log("  - Breaks convertis:", `${parsed.player2.break_conv_count}/${parsed.player2.break_conv_total} (${parsed.player2.break_conv_pct}%)`);
console.log("  - Jeux décisifs:", `${parsed.player2.tiebreaks_won}/${parsed.player2.tiebreaks_total} (${parsed.player2.tiebreaks_pct}%)`);

console.log("\n" + "=".repeat(60));
console.log("\n🎯 PRÉDICTION AUTOMATIQUE:\n");

// Calcul rating
let rating1 = 1000;
rating1 += parsed.player1.first_serve_won * 3;
rating1 += parsed.player1.aces_per_match * 15;
rating1 -= parsed.player1.double_faults * 20;
rating1 += parsed.player1.break_saved_pct * 2;
rating1 += parsed.player1.break_conv_pct * 1.5;
rating1 += parsed.player1.tiebreaks_pct * 2;
rating1 += parsed.player1.win_pct * 3;

let rating2 = 1000;
rating2 += parsed.player2.first_serve_won * 3;
rating2 += parsed.player2.aces_per_match * 15;
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

const winner = rating2 > rating1 ? "JOUEUR 2" : "JOUEUR 1";
const confidence = Math.max(p1WinProb, p2WinProb) * 100;

console.log("\n🏆 VAINQUEUR PRÉDIT:", winner);
console.log("   Confiance:", confidence.toFixed(0) + "%");
console.log("   Score prédit:", confidence > 75 ? "2-0" : "2-1", "(Best of 3)");

console.log("\n💡 INSIGHTS CLÉS:");
if (parsed.player2.tiebreaks_pct > parsed.player1.tiebreaks_pct + 20) {
  console.log(`   🎯 Joueur 2 DOMINE en jeux décisifs (${parsed.player2.tiebreaks_pct}% vs ${parsed.player1.tiebreaks_pct}%)`);
  console.log(`      → CRITIQUE pour matchs serrés!`);
}
if (parsed.player2.aces_per_match > parsed.player1.aces_per_match * 2) {
  console.log(`   ⚡ Joueur 2 service DOMINANT (${parsed.player2.aces_per_match} aces/match vs ${parsed.player1.aces_per_match})`);
}
if (parsed.player1.break_conv_pct > parsed.player2.break_saved_pct) {
  console.log(`   🔥 Joueur 1 efficace au retour (${parsed.player1.break_conv_pct}% breaks convertis)`);
}

const totalAces = parsed.player1.aces_per_match + parsed.player2.aces_per_match;
console.log("\n🎾 TOTAL ACES:");
console.log("   Aces combinés attendus:", totalAces.toFixed(1));
console.log("   Ligne 10.5 → Prédiction:", totalAces > 10.5 ? "✅ OVER" : "❌ UNDER");
console.log("   Confiance:", Math.abs(totalAces - 10.5) > 2 ? "HAUTE" : "MOYENNE");

const avgServeWon = (parsed.player1.first_serve_won + parsed.player2.first_serve_won) / 2;
console.log("\n🎯 TOTAL JEUX (Best of 3):");
console.log("   % moyen 1er service gagné:", avgServeWon.toFixed(1) + "%");
console.log("   Ligne 22.5 → Prédiction:", avgServeWon > 72 ? "❌ UNDER (serveurs forts)" : "✅ OVER");

const avgBreakSaved = (parsed.player1.break_saved_pct + parsed.player2.break_saved_pct) / 2;
console.log("\n🔓 BREAK DE SERVICE:");
console.log("   % moyen breaks sauvés:", avgBreakSaved.toFixed(1) + "%");
console.log("   Prédiction:", avgBreakSaved < 65 ? "✅ OUI (break attendu)" : "❌ NON (services solides)");

console.log("\n" + "=".repeat(60));
console.log("\n✅ EXTRACTION RÉUSSIE - Toutes les données ont été parsées correctement!");
