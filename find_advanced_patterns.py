#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ANALYSE AVANCEE - TROUVER TOUS LES PATTERNS FIABLES
Cherche patterns >65% precision pour Over/Under, BTTS, Resultats
"""

import csv
import json
from collections import defaultdict
import statistics

def analyze_advanced_patterns():
    """Analyse approfondie pour trouver patterns 65%+ precision"""

    print("=" * 80)
    print("ANALYSE AVANCEE - PATTERNS 65%+ PRECISION")
    print("=" * 80)

    matches = []
    print("\n[1/5] Chargement Matches.csv...")

    with open('Matches.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                if (row.get('FTHome') and row.get('FTAway') and
                    row.get('HomeElo') and row.get('AwayElo')):
                    matches.append(row)
            except:
                continue

    print(f"   -> {len(matches)} matchs charges")

    # PATTERNS AVANCES
    patterns = {
        # OVER/UNDER patterns
        'elo_sum_high': [],  # Somme Elo > 3400
        'elo_sum_low': [],  # Somme Elo < 2800
        'elo_close_high': [],  # Diff < 50 + Somme > 3300
        'elo_close_low': [],  # Diff < 50 + Somme < 2900
        'huge_favorite_home': [],  # Elo diff > 300 domicile
        'huge_favorite_away': [],  # Elo diff < -250 exterieur
        'balanced_strong': [],  # Diff < 100 + Somme > 3300
        'balanced_weak': [],  # Diff < 100 + Somme < 2900

        # BTTS patterns
        'both_avg_elo': [],  # Les 2 dans 1500-1600 (moyenne)
        'one_very_strong_one_avg': [],  # Un > 1800, autre 1400-1600
        'odds_balanced': [],  # Cotes equilibrees (1.8-2.5 pour home/away)

        # Resultat patterns
        'massive_elo_400': [],  # Diff > 400
        'massive_elo_300': [],  # Diff > 300
        'odds_extreme': [],  # Cote < 1.2
        'form_momentum': [],  # Forme > 2.5 vs < 1.5
    }

    print("\n[2/5] Classification patterns...")

    for match in matches:
        try:
            home_elo = float(match['HomeElo'])
            away_elo = float(match['AwayElo'])
            elo_diff = home_elo - away_elo
            elo_sum = home_elo + away_elo

            home_goals = int(float(match['FTHome']))
            away_goals = int(float(match['FTAway']))
            total_goals = home_goals + away_goals

            result = match['FTResult']
            over25 = total_goals > 2.5
            under25 = not over25
            btts = home_goals > 0 and away_goals > 0

            odd_home = float(match['OddHome']) if match.get('OddHome') else None
            odd_away = float(match['OddAway']) if match.get('OddAway') else None

            match_data = {
                'over25': over25,
                'under25': under25,
                'btts_yes': btts,
                'btts_no': not btts,
                'home_win': result == 'H',
                'away_win': result == 'A',
                'draw': result == 'D',
                'total_goals': total_goals
            }

            # Pattern: Somme Elo elevee (equipes fortes)
            if elo_sum > 3400:
                patterns['elo_sum_high'].append(match_data)

            # Pattern: Somme Elo faible (equipes faibles)
            if elo_sum < 2800:
                patterns['elo_sum_low'].append(match_data)

            # Pattern: Match equilibre entre equipes fortes
            if abs(elo_diff) < 50 and elo_sum > 3300:
                patterns['elo_close_high'].append(match_data)

            # Pattern: Match equilibre entre equipes faibles
            if abs(elo_diff) < 50 and elo_sum < 2900:
                patterns['elo_close_low'].append(match_data)

            # Pattern: Enorme favori domicile
            if elo_diff > 300:
                patterns['huge_favorite_home'].append(match_data)

            # Pattern: Enorme favori exterieur
            if elo_diff < -250:
                patterns['huge_favorite_away'].append(match_data)

            # Pattern: Equipes fortes equilibrees
            if abs(elo_diff) < 100 and elo_sum > 3300:
                patterns['balanced_strong'].append(match_data)

            # Pattern: Equipes faibles equilibrees
            if abs(elo_diff) < 100 and elo_sum < 2900:
                patterns['balanced_weak'].append(match_data)

            # Pattern: Deux equipes moyennes
            if 1500 <= home_elo <= 1600 and 1500 <= away_elo <= 1600:
                patterns['both_avg_elo'].append(match_data)

            # Pattern: Une forte, une moyenne
            if ((home_elo > 1800 and 1400 <= away_elo <= 1600) or
                (away_elo > 1800 and 1400 <= home_elo <= 1600)):
                patterns['one_very_strong_one_avg'].append(match_data)

            # Pattern: Cotes equilibrees
            if odd_home and odd_away and 1.8 <= odd_home <= 2.5 and 1.8 <= odd_away <= 2.5:
                patterns['odds_balanced'].append(match_data)

            # Pattern: Diff Elo massive
            if abs(elo_diff) > 400:
                patterns['massive_elo_400'].append(match_data)

            if abs(elo_diff) > 300:
                patterns['massive_elo_300'].append(match_data)

            # Pattern: Cote extreme
            if odd_home and odd_home < 1.2:
                patterns['odds_extreme'].append(match_data)

        except:
            continue

    print("   -> Classification terminee")

    # CALCULER PRECISIONS
    print("\n[3/5] Calcul precisions...")

    results = []

    for pattern_name, matches_list in patterns.items():
        if len(matches_list) < 30:  # Min 30 matchs
            continue

        total = len(matches_list)

        # Over/Under
        over25_count = sum(1 for m in matches_list if m['over25'])
        under25_count = sum(1 for m in matches_list if m['under25'])

        # BTTS
        btts_yes_count = sum(1 for m in matches_list if m['btts_yes'])
        btts_no_count = sum(1 for m in matches_list if m['btts_no'])

        # Resultats
        home_win_count = sum(1 for m in matches_list if m['home_win'])
        away_win_count = sum(1 for m in matches_list if m['away_win'])
        draw_count = sum(1 for m in matches_list if m['draw'])

        over25_pct = over25_count / total * 100
        under25_pct = under25_count / total * 100
        btts_yes_pct = btts_yes_count / total * 100
        btts_no_pct = btts_no_count / total * 100
        home_win_pct = home_win_count / total * 100
        away_win_pct = away_win_count / total * 100
        draw_pct = draw_count / total * 100

        avg_goals = statistics.mean([m['total_goals'] for m in matches_list])

        # Identifier predictions fiables (>65%)
        predictions_fiables = []

        if over25_pct >= 65:
            predictions_fiables.append({
                'type': 'Over 2.5',
                'precision': round(over25_pct, 2)
            })

        if under25_pct >= 65:
            predictions_fiables.append({
                'type': 'Under 2.5',
                'precision': round(under25_pct, 2)
            })

        if btts_yes_pct >= 65:
            predictions_fiables.append({
                'type': 'BTTS Yes',
                'precision': round(btts_yes_pct, 2)
            })

        if btts_no_pct >= 65:
            predictions_fiables.append({
                'type': 'BTTS No',
                'precision': round(btts_no_pct, 2)
            })

        if home_win_pct >= 65:
            predictions_fiables.append({
                'type': 'Home Win',
                'precision': round(home_win_pct, 2)
            })

        if away_win_pct >= 65:
            predictions_fiables.append({
                'type': 'Away Win',
                'precision': round(away_win_pct, 2)
            })

        if predictions_fiables:
            results.append({
                'pattern': pattern_name,
                'sample_size': total,
                'avg_goals': round(avg_goals, 2),
                'predictions': predictions_fiables,
                'all_stats': {
                    'over25': round(over25_pct, 2),
                    'under25': round(under25_pct, 2),
                    'btts_yes': round(btts_yes_pct, 2),
                    'btts_no': round(btts_no_pct, 2),
                    'home_win': round(home_win_pct, 2),
                    'away_win': round(away_win_pct, 2),
                    'draw': round(draw_pct, 2)
                }
            })

    # Trier par precision max
    results.sort(key=lambda x: max([p['precision'] for p in x['predictions']]), reverse=True)

    print(f"   -> {len(results)} patterns fiables trouves")

    # SAUVEGARDER
    print("\n[4/5] Sauvegarde resultats...")

    output = {
        'total_matches': len(matches),
        'patterns_found': len(results),
        'reliable_patterns': results
    }

    with open('advanced_patterns_found.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print("   -> Sauvegarde: advanced_patterns_found.json")

    # AFFICHAGE
    print("\n[5/5] TOP PATTERNS FIABLES (65%+ PRECISION)")
    print("=" * 80)

    for i, pattern in enumerate(results[:15], 1):
        print(f"\n{i}. PATTERN: {pattern['pattern']}")
        print(f"   Echantillon: {pattern['sample_size']} matchs")
        print(f"   Moyenne buts: {pattern['avg_goals']}")

        for pred in pattern['predictions']:
            print(f"   -> {pred['type']}: {pred['precision']}% precision")

        # Evaluation
        max_precision = max([p['precision'] for p in pattern['predictions']])

        if max_precision >= 80:
            eval_text = "EXCELLENT"
        elif max_precision >= 75:
            eval_text = "TRES BON"
        elif max_precision >= 70:
            eval_text = "BON"
        else:
            eval_text = "ACCEPTABLE"

        print(f"   Evaluation: {eval_text}")

    print("\n" + "=" * 80)
    print("ANALYSE TERMINEE")
    print("=" * 80)

    return output

if __name__ == '__main__':
    results = analyze_advanced_patterns()
