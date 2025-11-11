#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ANALYSE COMPLETE OVER/UNDER - TOUTES LES STATISTIQUES
Trouve patterns fiables pour:
- Corners Over/Under
- Cartons Jaunes Over/Under
- Cartons Rouges Over/Under
- Tirs Over/Under
- Tirs Cadres Over/Under
- Fautes Over/Under
"""

import csv
import json
from collections import defaultdict
import statistics

def analyze_all_over_under_markets():
    """Analyse tous les marches Over/Under disponibles"""

    print("=" * 80)
    print("ANALYSE COMPLETE OVER/UNDER - TOUTES STATISTIQUES")
    print("=" * 80)

    matches = []
    print("\n[1/7] Chargement Matches.csv...")

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

    print(f"   -> {len(matches)} matchs charges")

    # PATTERNS A TESTER PAR MARCHE
    markets = {
        'corners': {
            'thresholds': [8.5, 9.5, 10.5, 11.5, 12.5],
            'home_col': 'HomeCorners',
            'away_col': 'AwayCorners',
            'patterns': {}
        },
        'yellow_cards': {
            'thresholds': [2.5, 3.5, 4.5, 5.5],
            'home_col': 'HomeYellow',
            'away_col': 'AwayYellow',
            'patterns': {}
        },
        'red_cards': {
            'thresholds': [0.5],
            'home_col': 'HomeRed',
            'away_col': 'AwayRed',
            'patterns': {}
        },
        'shots': {
            'thresholds': [18.5, 20.5, 22.5, 24.5],
            'home_col': 'HomeShots',
            'away_col': 'AwayShots',
            'patterns': {}
        },
        'shots_on_target': {
            'thresholds': [6.5, 7.5, 8.5, 9.5],
            'home_col': 'HomeTarget',
            'away_col': 'AwayTarget',
            'patterns': {}
        },
        'fouls': {
            'thresholds': [20.5, 22.5, 24.5, 26.5],
            'home_col': 'HomeFouls',
            'away_col': 'AwayFouls',
            'patterns': {}
        }
    }

    print("\n[2/7] Classification matchs par patterns...")

    # Pour chaque marche
    for market_name, market_data in markets.items():
        print(f"\n   Analyse {market_name}...")

        home_col = market_data['home_col']
        away_col = market_data['away_col']

        # Initialiser patterns
        for threshold in market_data['thresholds']:
            market_data['patterns'][threshold] = {
                'huge_elo_gap_300': [],
                'big_elo_gap_200': [],
                'moderate_elo_gap_100': [],
                'odds_very_low': [],
                'odds_low': [],
                'both_strong': [],
                'both_weak': [],
                'balanced_match': []
            }

        for match in matches:
            try:
                # Stats du match
                home_elo = float(match['HomeElo'])
                away_elo = float(match['AwayElo'])
                elo_diff = home_elo - away_elo
                elo_sum = home_elo + away_elo

                # Valeur du marche
                home_val = match.get(home_col)
                away_val = match.get(away_col)

                if not home_val or not away_val:
                    continue

                home_val = float(home_val)
                away_val = float(away_val)
                total_val = home_val + away_val

                # Cotes
                odd_home = float(match['OddHome']) if match.get('OddHome') else None

                # Tester chaque threshold
                for threshold in market_data['thresholds']:
                    is_over = total_val > threshold

                    match_data = {
                        'over': is_over,
                        'under': not is_over,
                        'total': total_val
                    }

                    # Pattern: Enorme diff Elo
                    if abs(elo_diff) > 300:
                        market_data['patterns'][threshold]['huge_elo_gap_300'].append(match_data)

                    # Pattern: Grosse diff Elo
                    if abs(elo_diff) > 200:
                        market_data['patterns'][threshold]['big_elo_gap_200'].append(match_data)

                    # Pattern: Diff Elo moderee
                    if abs(elo_diff) > 100:
                        market_data['patterns'][threshold]['moderate_elo_gap_100'].append(match_data)

                    # Pattern: Cote tres basse
                    if odd_home and odd_home < 1.3:
                        market_data['patterns'][threshold]['odds_very_low'].append(match_data)

                    # Pattern: Cote basse
                    if odd_home and odd_home < 1.5:
                        market_data['patterns'][threshold]['odds_low'].append(match_data)

                    # Pattern: Deux equipes fortes
                    if elo_sum > 3300:
                        market_data['patterns'][threshold]['both_strong'].append(match_data)

                    # Pattern: Deux equipes faibles
                    if elo_sum < 2900:
                        market_data['patterns'][threshold]['both_weak'].append(match_data)

                    # Pattern: Match equilibre
                    if abs(elo_diff) < 100:
                        market_data['patterns'][threshold]['balanced_match'].append(match_data)

            except:
                continue

    print("   -> Classification terminee")

    # CALCULER PRECISIONS
    print("\n[3/7] Calcul precisions pour chaque marche...")

    results = {}

    for market_name, market_data in markets.items():
        print(f"\n   {market_name}...")
        results[market_name] = {}

        for threshold in market_data['thresholds']:
            results[market_name][threshold] = []

            for pattern_name, matches_list in market_data['patterns'][threshold].items():
                if len(matches_list) < 50:  # Min 50 matchs
                    continue

                total = len(matches_list)
                over_count = sum(1 for m in matches_list if m['over'])
                under_count = sum(1 for m in matches_list if m['under'])

                over_pct = over_count / total * 100
                under_pct = under_count / total * 100

                avg_total = statistics.mean([m['total'] for m in matches_list])

                # Identifier predictions fiables (>=65%)
                predictions = []

                if over_pct >= 65:
                    predictions.append({
                        'type': f'OVER {threshold}',
                        'precision': round(over_pct, 2),
                        'pattern': pattern_name,
                        'sample_size': total,
                        'avg_value': round(avg_total, 2)
                    })

                if under_pct >= 65:
                    predictions.append({
                        'type': f'UNDER {threshold}',
                        'precision': round(under_pct, 2),
                        'pattern': pattern_name,
                        'sample_size': total,
                        'avg_value': round(avg_total, 2)
                    })

                if predictions:
                    results[market_name][threshold].extend(predictions)

    print("   -> Calculs termines")

    # FILTRER ET TRIER
    print("\n[4/7] Filtrage predictions fiables (>=65%)...")

    all_predictions = []

    for market_name, thresholds in results.items():
        for threshold, predictions in thresholds.items():
            for pred in predictions:
                all_predictions.append({
                    'market': market_name,
                    'threshold': threshold,
                    'prediction': pred['type'],
                    'pattern': pred['pattern'],
                    'precision': pred['precision'],
                    'sample_size': pred['sample_size'],
                    'avg_value': pred['avg_value']
                })

    # Trier par precision
    all_predictions.sort(key=lambda x: x['precision'], reverse=True)

    print(f"   -> {len(all_predictions)} predictions fiables trouvees")

    # CALCULER STATS PAR MARCHE
    print("\n[5/7] Calcul statistiques par marche...")

    market_stats = {}

    for market_name, market_data in markets.items():
        home_col = market_data['home_col']
        away_col = market_data['away_col']

        values = []
        for match in matches:
            try:
                home_val = match.get(home_col)
                away_val = match.get(away_col)
                if home_val and away_val:
                    values.append(float(home_val) + float(away_val))
            except:
                continue

        if values:
            market_stats[market_name] = {
                'mean': round(statistics.mean(values), 2),
                'median': round(statistics.median(values), 2),
                'min': round(min(values), 2),
                'max': round(max(values), 2),
                'std_dev': round(statistics.stdev(values), 2) if len(values) > 1 else 0
            }

    print("   -> Stats calculees")

    # SAUVEGARDER
    print("\n[6/7] Sauvegarde resultats...")

    output = {
        'total_matches': len(matches),
        'markets_analyzed': list(markets.keys()),
        'market_statistics': market_stats,
        'all_predictions': all_predictions[:50],  # Top 50
        'predictions_by_market': results,
        'summary': {
            'total_predictions_found': len(all_predictions),
            'excellent_predictions': len([p for p in all_predictions if p['precision'] >= 80]),
            'good_predictions': len([p for p in all_predictions if 70 <= p['precision'] < 80]),
            'acceptable_predictions': len([p for p in all_predictions if 65 <= p['precision'] < 70])
        }
    }

    with open('all_over_under_predictions.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print("   -> Sauvegarde: all_over_under_predictions.json")

    # AFFICHAGE TOP PREDICTIONS
    print("\n[7/7] TOP 20 PREDICTIONS OVER/UNDER FIABLES")
    print("=" * 80)

    for i, pred in enumerate(all_predictions[:20], 1):
        print(f"\n{i}. {pred['market'].upper()} - {pred['prediction']}")
        print(f"   Pattern: {pred['pattern']}")
        print(f"   Precision: {pred['precision']}%")
        print(f"   Echantillon: {pred['sample_size']} matchs")
        print(f"   Moyenne: {pred['avg_value']}")

        if pred['precision'] >= 80:
            eval_text = "EXCELLENT"
        elif pred['precision'] >= 75:
            eval_text = "TRES BON"
        elif pred['precision'] >= 70:
            eval_text = "BON"
        else:
            eval_text = "ACCEPTABLE"

        print(f"   Evaluation: {eval_text}")

    # STATISTIQUES PAR MARCHE
    print("\n" + "=" * 80)
    print("STATISTIQUES MOYENNES PAR MARCHE")
    print("=" * 80)

    for market_name, stats in market_stats.items():
        print(f"\n{market_name.upper()}:")
        print(f"  Moyenne: {stats['mean']}")
        print(f"  Mediane: {stats['median']}")
        print(f"  Min-Max: {stats['min']} - {stats['max']}")
        print(f"  Ecart-type: {stats['std_dev']}")

    print("\n" + "=" * 80)
    print("ANALYSE TERMINEE")
    print("=" * 80)

    return output

if __name__ == '__main__':
    results = analyze_all_over_under_markets()
