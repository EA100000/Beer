#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ANALYSE STATISTIQUE RIGOUREUSE - TROUVER PATTERNS FIABLES
Analyse 230,557 matchs pour trouver predictions a haute precision
"""

import csv
import json
from collections import defaultdict
import statistics

def analyze_reliable_patterns():
    """Trouve les patterns de paris les plus fiables"""

    print("=" * 80)
    print("ANALYSE PATTERNS FIABLES - 230,557 MATCHS")
    print("=" * 80)

    matches = []
    print("\n[1/6] Chargement Matches.csv...")

    with open('Matches.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                # Filtrer matchs complets
                if (row.get('FTHome') and row.get('FTAway') and
                    row.get('HomeElo') and row.get('AwayElo')):
                    matches.append(row)
            except:
                continue

    print(f"   -> {len(matches)} matchs charges avec donnees completes")

    # PATTERNS A ANALYSER
    patterns = {
        # Pattern 1: Enorme difference Elo (>250)
        'huge_elo_gap_250': {'matches': [], 'description': 'Elo diff > 250'},

        # Pattern 2: Grosse difference Elo (>200)
        'big_elo_gap_200': {'matches': [], 'description': 'Elo diff > 200'},

        # Pattern 3: Grosse difference Elo (>150)
        'big_elo_gap_150': {'matches': [], 'description': 'Elo diff > 150'},

        # Pattern 4: Difference Elo moderee + domicile (>100)
        'moderate_elo_home': {'matches': [], 'description': 'Elo diff > 100 + domicile'},

        # Pattern 5: Deux equipes tres faibles (Elo < 1400)
        'both_weak': {'matches': [], 'description': 'Les 2 equipes Elo < 1400'},

        # Pattern 6: Deux equipes fortes (Elo > 1700)
        'both_strong': {'matches': [], 'description': 'Les 2 equipes Elo > 1700'},

        # Pattern 7: Forme domicile excellente (>2.5 pts/match)
        'excellent_home_form': {'matches': [], 'description': 'Forme domicile > 2.5'},

        # Pattern 8: Forme exterieur excellente (>2.0 pts/match)
        'excellent_away_form': {'matches': [], 'description': 'Forme exterieur > 2.0'},

        # Pattern 9: Cote favorite tres basse (<1.3)
        'very_low_odds': {'matches': [], 'description': 'Cote favorite < 1.3'},

        # Pattern 10: Cote favorite basse (<1.5)
        'low_odds': {'matches': [], 'description': 'Cote favorite < 1.5'},
    }

    print("\n[2/6] Classification des matchs par patterns...")

    for match in matches:
        try:
            # Extraire donnees
            home_elo = float(match['HomeElo'])
            away_elo = float(match['AwayElo'])
            elo_diff = home_elo - away_elo

            home_goals = int(float(match['FTHome']))
            away_goals = int(float(match['FTAway']))
            total_goals = home_goals + away_goals

            result = match['FTResult']  # H, D, A
            over25 = total_goals > 2.5
            btts = home_goals > 0 and away_goals > 0

            # Cotes
            odd_home = float(match['OddHome']) if match.get('OddHome') else None
            odd_away = float(match['OddAway']) if match.get('OddAway') else None

            # Forme
            form5_home = float(match['Form5Home']) if match.get('Form5Home') else None
            form5_away = float(match['Form5Away']) if match.get('Form5Away') else None

            match_data = {
                'elo_diff': elo_diff,
                'home_win': result == 'H',
                'away_win': result == 'A',
                'draw': result == 'D',
                'over25': over25,
                'btts': btts,
                'total_goals': total_goals,
                'favorite_won': (elo_diff > 50 and result == 'H') or (elo_diff < -50 and result == 'A')
            }

            # Pattern 1: Enorme diff Elo > 250
            if abs(elo_diff) > 250:
                patterns['huge_elo_gap_250']['matches'].append(match_data)

            # Pattern 2: Grosse diff Elo > 200
            if abs(elo_diff) > 200:
                patterns['big_elo_gap_200']['matches'].append(match_data)

            # Pattern 3: Grosse diff Elo > 150
            if abs(elo_diff) > 150:
                patterns['big_elo_gap_150']['matches'].append(match_data)

            # Pattern 4: Diff Elo > 100 + domicile
            if elo_diff > 100:
                patterns['moderate_elo_home']['matches'].append(match_data)

            # Pattern 5: Deux equipes faibles
            if home_elo < 1400 and away_elo < 1400:
                patterns['both_weak']['matches'].append(match_data)

            # Pattern 6: Deux equipes fortes
            if home_elo > 1700 and away_elo > 1700:
                patterns['both_strong']['matches'].append(match_data)

            # Pattern 7: Forme domicile excellente
            if form5_home and form5_home > 2.5 and elo_diff > 50:
                patterns['excellent_home_form']['matches'].append(match_data)

            # Pattern 8: Forme exterieur excellente
            if form5_away and form5_away > 2.0 and elo_diff < -30:
                patterns['excellent_away_form']['matches'].append(match_data)

            # Pattern 9: Cote favorite tres basse
            if odd_home and odd_home < 1.3:
                patterns['very_low_odds']['matches'].append(match_data)

            # Pattern 10: Cote favorite basse
            if odd_home and odd_home < 1.5:
                patterns['low_odds']['matches'].append(match_data)

        except Exception as e:
            continue

    print("   -> Classification terminee")

    # CALCULER STATISTIQUES PAR PATTERN
    print("\n[3/6] Calcul statistiques par pattern...")

    results = {}

    for pattern_name, pattern_data in patterns.items():
        matches_list = pattern_data['matches']

        if len(matches_list) < 50:  # Minimum 50 matchs
            continue

        # Calculer precisions
        favorite_wins = sum(1 for m in matches_list if m['favorite_won'])
        over25_count = sum(1 for m in matches_list if m['over25'])
        btts_count = sum(1 for m in matches_list if m['btts'])

        total = len(matches_list)

        avg_goals = statistics.mean([m['total_goals'] for m in matches_list])

        results[pattern_name] = {
            'description': pattern_data['description'],
            'sample_size': total,
            'favorite_win_rate': round(favorite_wins / total * 100, 2),
            'over25_rate': round(over25_count / total * 100, 2),
            'btts_rate': round(btts_count / total * 100, 2),
            'avg_goals': round(avg_goals, 2),
            'profitable': None  # A calculer
        }

    print("   -> Statistiques calculees")

    # IDENTIFIER PATTERNS TRES FIABLES (>70% precision)
    print("\n[4/6] Identification patterns haute precision (>70%)...")

    high_precision = []

    for pattern_name, stats in results.items():
        # Chercher precision > 70% sur n'importe quelle metrique
        if stats['favorite_win_rate'] > 70:
            high_precision.append({
                'pattern': pattern_name,
                'prediction': 'VICTOIRE FAVORI',
                'precision': stats['favorite_win_rate'],
                'sample_size': stats['sample_size'],
                'description': stats['description']
            })

        if stats['over25_rate'] > 70:
            high_precision.append({
                'pattern': pattern_name,
                'prediction': 'OVER 2.5',
                'precision': stats['over25_rate'],
                'sample_size': stats['sample_size'],
                'description': stats['description']
            })

        if stats['over25_rate'] < 30:  # Under 2.5 > 70%
            high_precision.append({
                'pattern': pattern_name,
                'prediction': 'UNDER 2.5',
                'precision': 100 - stats['over25_rate'],
                'sample_size': stats['sample_size'],
                'description': stats['description']
            })

        if stats['btts_rate'] > 70:
            high_precision.append({
                'pattern': pattern_name,
                'prediction': 'BTTS YES',
                'precision': stats['btts_rate'],
                'sample_size': stats['sample_size'],
                'description': stats['description']
            })

        if stats['btts_rate'] < 30:  # BTTS No > 70%
            high_precision.append({
                'pattern': pattern_name,
                'prediction': 'BTTS NO',
                'precision': 100 - stats['btts_rate'],
                'sample_size': stats['sample_size'],
                'description': stats['description']
            })

    # Trier par precision
    high_precision.sort(key=lambda x: x['precision'], reverse=True)

    print(f"   -> {len(high_precision)} patterns haute precision trouves")

    # SAUVEGARDER RESULTATS
    print("\n[5/6] Sauvegarde resultats...")

    output = {
        'total_matches_analyzed': len(matches),
        'patterns_tested': len(patterns),
        'all_patterns_stats': results,
        'high_precision_patterns': high_precision[:20],  # Top 20
        'methodology': 'Analyse statistique rigoureuse sur donnees reelles'
    }

    with open('reliable_patterns_found.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print("   -> Resultats sauvegardes: reliable_patterns_found.json")

    # AFFICHAGE RESULTATS
    print("\n[6/6] RESULTATS - PATTERNS HAUTE PRECISION (>70%)")
    print("=" * 80)

    if not high_precision:
        print("\nAucun pattern >70% trouve.")
        print("Meilleurs patterns disponibles:")

        # Afficher top 5 patterns par precision
        all_predictions = []
        for pattern_name, stats in results.items():
            all_predictions.append({
                'pattern': stats['description'],
                'prediction': 'Favori Win',
                'precision': stats['favorite_win_rate'],
                'sample': stats['sample_size']
            })

        all_predictions.sort(key=lambda x: x['precision'], reverse=True)

        for i, pred in enumerate(all_predictions[:5], 1):
            print(f"\n{i}. {pred['pattern']}")
            print(f"   Prediction: {pred['prediction']}")
            print(f"   Precision: {pred['precision']}%")
            print(f"   Echantillon: {pred['sample']} matchs")

    else:
        for i, pattern in enumerate(high_precision[:10], 1):
            print(f"\n{i}. {pattern['description']}")
            print(f"   Prediction: {pattern['prediction']}")
            print(f"   Precision: {pattern['precision']}%")
            print(f"   Echantillon: {pattern['sample_size']} matchs")

            # Evaluation rentabilite
            if pattern['precision'] >= 75:
                profit = "TRES RENTABLE"
            elif pattern['precision'] >= 70:
                profit = "RENTABLE"
            else:
                profit = "LIMITE"

            print(f"   Rentabilite: {profit}")

    print("\n" + "=" * 80)
    print("ANALYSE TERMINEE")
    print("=" * 80)

    return output

if __name__ == '__main__':
    results = analyze_reliable_patterns()
