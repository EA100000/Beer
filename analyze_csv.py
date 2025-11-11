#!/usr/bin/env python3
"""
ANALYSE MASSIVE DE MATCHES.CSV
Extrait les VRAIS patterns statistiques de 230,557 matchs réels
pour améliorer la précision du système Pari365
"""

import csv
import json
from collections import defaultdict
from statistics import mean, stdev
import sys

def analyze_matches_csv(filename='Matches.csv'):
    """Analyse complète du fichier CSV"""

    print(f"🔍 Analyse de {filename}...")
    print("=" * 80)

    # Statistiques globales
    stats = {
        'total_matches': 0,
        'complete_data_matches': 0,
        'by_league': defaultdict(int),
        'by_year': defaultdict(int),

        # Over/Under 2.5
        'over25_yes': 0,
        'over25_no': 0,

        # BTTS
        'btts_yes': 0,
        'btts_no': 0,

        # Résultats
        'home_wins': 0,
        'draws': 0,
        'away_wins': 0,

        # Corrélations Elo -> Résultat
        'elo_diffs_home_win': [],
        'elo_diffs_draw': [],
        'elo_diffs_away_win': [],

        # Stats pour corrélations
        'corners_over25': [],
        'corners_under25': [],
        'fouls_over25': [],
        'fouls_under25': [],
        'shots_over25': [],
        'shots_under25': [],

        # BTTS correlations
        'corners_btts_yes': [],
        'corners_btts_no': [],

        # Goals distributions
        'total_goals_distribution': defaultdict(int),

        # Average stats per league
        'league_stats': defaultdict(lambda: {
            'avg_goals': [],
            'avg_corners': [],
            'avg_fouls': [],
            'avg_cards': []
        })
    }

    try:
        with open(filename, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for i, row in enumerate(reader):
                stats['total_matches'] += 1

                # Progress
                if stats['total_matches'] % 10000 == 0:
                    print(f"Traité: {stats['total_matches']:,} matchs...")

                try:
                    # Extraire données essentielles
                    league = row['Division']
                    date = row['MatchDate']

                    if date and len(date) >= 4:
                        year = int(date[:4])
                        stats['by_year'][year] += 1

                    stats['by_league'][league] += 1

                    # Données de match
                    ft_home = float(row['FTHome']) if row['FTHome'] else None
                    ft_away = float(row['FTAway']) if row['FTAway'] else None
                    result = row['FTResult']

                    # Elo ratings
                    home_elo = float(row['HomeElo']) if row['HomeElo'] else None
                    away_elo = float(row['AwayElo']) if row['AwayElo'] else None

                    # Stats détaillées
                    home_corners = float(row['HomeCorners']) if row['HomeCorners'] else None
                    away_corners = float(row['AwayCorners']) if row['AwayCorners'] else None
                    home_fouls = float(row['HomeFouls']) if row['HomeFouls'] else None
                    away_fouls = float(row['AwayFouls']) if row['AwayFouls'] else None
                    home_shots = float(row['HomeShots']) if row['HomeShots'] else None
                    away_shots = float(row['AwayShots']) if row['AwayShots'] else None
                    home_yellow = float(row['HomeYellow']) if row['HomeYellow'] else None
                    away_yellow = float(row['AwayYellow']) if row['AwayYellow'] else None

                    # Vérifier données complètes
                    has_complete_data = all([
                        ft_home is not None,
                        ft_away is not None,
                        home_corners is not None and home_corners > 0,
                        away_corners is not None and away_corners > 0,
                        home_fouls is not None and home_fouls > 0,
                        away_fouls is not None and away_fouls > 0
                    ])

                    if has_complete_data:
                        stats['complete_data_matches'] += 1

                    if ft_home is not None and ft_away is not None:
                        total_goals = ft_home + ft_away

                        # Over/Under 2.5
                        if total_goals > 2.5:
                            stats['over25_yes'] += 1
                        else:
                            stats['over25_no'] += 1

                        # BTTS
                        if ft_home > 0 and ft_away > 0:
                            stats['btts_yes'] += 1
                        else:
                            stats['btts_no'] += 1

                        # Résultats
                        if result == 'H':
                            stats['home_wins'] += 1
                        elif result == 'D':
                            stats['draws'] += 1
                        elif result == 'A':
                            stats['away_wins'] += 1

                        # Goals distribution
                        goals_bucket = int(total_goals)
                        if goals_bucket <= 10:
                            stats['total_goals_distribution'][goals_bucket] += 1

                        # Elo diff -> Résultat
                        if home_elo and away_elo:
                            elo_diff = home_elo - away_elo
                            if result == 'H':
                                stats['elo_diffs_home_win'].append(elo_diff)
                            elif result == 'D':
                                stats['elo_diffs_draw'].append(elo_diff)
                            elif result == 'A':
                                stats['elo_diffs_away_win'].append(elo_diff)

                        # Corrélations Corners/Fouls/Shots avec Over/Under
                        if has_complete_data:
                            total_corners = home_corners + away_corners
                            total_fouls = home_fouls + away_fouls

                            if total_goals > 2.5:
                                stats['corners_over25'].append(total_corners)
                                stats['fouls_over25'].append(total_fouls)
                                if home_shots and away_shots:
                                    stats['shots_over25'].append(home_shots + away_shots)
                            else:
                                stats['corners_under25'].append(total_corners)
                                stats['fouls_under25'].append(total_fouls)
                                if home_shots and away_shots:
                                    stats['shots_under25'].append(home_shots + away_shots)

                            # BTTS correlations
                            if ft_home > 0 and ft_away > 0:
                                stats['corners_btts_yes'].append(total_corners)
                            else:
                                stats['corners_btts_no'].append(total_corners)

                            # League stats
                            stats['league_stats'][league]['avg_goals'].append(total_goals)
                            stats['league_stats'][league]['avg_corners'].append(total_corners)
                            stats['league_stats'][league]['avg_fouls'].append(total_fouls)
                            if home_yellow and away_yellow:
                                stats['league_stats'][league]['avg_cards'].append(home_yellow + away_yellow)

                except (ValueError, KeyError) as e:
                    continue

    except FileNotFoundError:
        print(f"❌ Erreur: Fichier {filename} introuvable!")
        sys.exit(1)

    return stats

def generate_report(stats):
    """Génère un rapport détaillé"""

    print("\n" + "=" * 80)
    print("📊 RAPPORT D'ANALYSE - MATCHES.CSV")
    print("=" * 80)

    # Stats globales
    print("\n🔢 STATISTIQUES GLOBALES")
    print("-" * 80)
    print(f"Total matchs analysés: {stats['total_matches']:,}")
    print(f"Matchs avec données complètes: {stats['complete_data_matches']:,} "
          f"({stats['complete_data_matches']/stats['total_matches']*100:.1f}%)")

    # Par ligue
    print("\n🏆 RÉPARTITION PAR LIGUE (Top 10)")
    print("-" * 80)
    sorted_leagues = sorted(stats['by_league'].items(), key=lambda x: x[1], reverse=True)
    for i, (league, count) in enumerate(sorted_leagues[:10], 1):
        print(f"{i}. {league:10} : {count:,} matchs")

    # Par année
    print("\n📅 RÉPARTITION PAR ANNÉE")
    print("-" * 80)
    sorted_years = sorted(stats['by_year'].items())
    for year, count in sorted_years[-10:]:  # 10 dernières années
        print(f"{year}: {count:,} matchs")

    # Over/Under
    print("\n⚽ OVER/UNDER 2.5 GOALS")
    print("-" * 80)
    total_ou = stats['over25_yes'] + stats['over25_no']
    if total_ou > 0:
        print(f"Over 2.5:  {stats['over25_yes']:,} matchs ({stats['over25_yes']/total_ou*100:.1f}%)")
        print(f"Under 2.5: {stats['over25_no']:,} matchs ({stats['over25_no']/total_ou*100:.1f}%)")
        print(f"\n💡 INSIGHT: Probabilité baseline Over 2.5 = {stats['over25_yes']/total_ou*100:.1f}%")

    # BTTS
    print("\n🎯 BOTH TEAMS TO SCORE (BTTS)")
    print("-" * 80)
    total_btts = stats['btts_yes'] + stats['btts_no']
    if total_btts > 0:
        print(f"BTTS Oui: {stats['btts_yes']:,} matchs ({stats['btts_yes']/total_btts*100:.1f}%)")
        print(f"BTTS Non: {stats['btts_no']:,} matchs ({stats['btts_no']/total_btts*100:.1f}%)")
        print(f"\n💡 INSIGHT: Probabilité baseline BTTS Yes = {stats['btts_yes']/total_btts*100:.1f}%")

    # Résultats
    print("\n🏁 RÉSULTATS DES MATCHS")
    print("-" * 80)
    total_results = stats['home_wins'] + stats['draws'] + stats['away_wins']
    if total_results > 0:
        print(f"Victoires domicile: {stats['home_wins']:,} ({stats['home_wins']/total_results*100:.1f}%)")
        print(f"Nuls:               {stats['draws']:,} ({stats['draws']/total_results*100:.1f}%)")
        print(f"Victoires extérieur: {stats['away_wins']:,} ({stats['away_wins']/total_results*100:.1f}%)")

    # Distribution buts
    print("\n📈 DISTRIBUTION DES BUTS")
    print("-" * 80)
    for goals in sorted(stats['total_goals_distribution'].keys()):
        count = stats['total_goals_distribution'][goals]
        pct = count / total_results * 100 if total_results > 0 else 0
        bar = "█" * int(pct / 2)
        print(f"{goals} buts: {count:6,} ({pct:5.1f}%) {bar}")

    # Corrélations Elo
    print("\n🎲 CORRÉLATIONS ELO -> RÉSULTAT")
    print("-" * 80)
    if stats['elo_diffs_home_win']:
        print(f"Elo diff moyen (Victoire domicile): {mean(stats['elo_diffs_home_win']):.1f}")
    if stats['elo_diffs_draw']:
        print(f"Elo diff moyen (Nul):                {mean(stats['elo_diffs_draw']):.1f}")
    if stats['elo_diffs_away_win']:
        print(f"Elo diff moyen (Victoire extérieur): {mean(stats['elo_diffs_away_win']):.1f}")

    # Corrélations Corners
    print("\n🚩 CORRÉLATIONS CORNERS")
    print("-" * 80)
    if stats['corners_over25'] and stats['corners_under25']:
        avg_corners_over = mean(stats['corners_over25'])
        avg_corners_under = mean(stats['corners_under25'])
        print(f"Corners moyens (Over 2.5):  {avg_corners_over:.1f}")
        print(f"Corners moyens (Under 2.5): {avg_corners_under:.1f}")
        print(f"💡 INSIGHT: {avg_corners_over - avg_corners_under:+.1f} corners de différence!")

    if stats['corners_btts_yes'] and stats['corners_btts_no']:
        avg_corners_btts_yes = mean(stats['corners_btts_yes'])
        avg_corners_btts_no = mean(stats['corners_btts_no'])
        print(f"\nCorners moyens (BTTS Yes): {avg_corners_btts_yes:.1f}")
        print(f"Corners moyens (BTTS No):  {avg_corners_btts_no:.1f}")
        print(f"💡 INSIGHT: {avg_corners_btts_yes - avg_corners_btts_no:+.1f} corners de différence!")

    # Corrélations Fouls
    print("\n⚠️  CORRÉLATIONS FAUTES")
    print("-" * 80)
    if stats['fouls_over25'] and stats['fouls_under25']:
        avg_fouls_over = mean(stats['fouls_over25'])
        avg_fouls_under = mean(stats['fouls_under25'])
        print(f"Fautes moyennes (Over 2.5):  {avg_fouls_over:.1f}")
        print(f"Fautes moyennes (Under 2.5): {avg_fouls_under:.1f}")
        print(f"💡 INSIGHT: {avg_fouls_over - avg_fouls_under:+.1f} fautes de différence!")

    # Corrélations Shots
    print("\n🎯 CORRÉLATIONS TIRS")
    print("-" * 80)
    if stats['shots_over25'] and stats['shots_under25']:
        avg_shots_over = mean(stats['shots_over25'])
        avg_shots_under = mean(stats['shots_under25'])
        print(f"Tirs moyens (Over 2.5):  {avg_shots_over:.1f}")
        print(f"Tirs moyens (Under 2.5): {avg_shots_under:.1f}")
        print(f"💡 INSIGHT: {avg_shots_over - avg_shots_under:+.1f} tirs de différence!")

    # Stats par ligue
    print("\n🏟️  STATISTIQUES PAR LIGUE (Top 5)")
    print("-" * 80)
    top_leagues = ['F1', 'D1', 'E1', 'I1', 'SP1']
    for league in top_leagues:
        if league in stats['league_stats']:
            league_data = stats['league_stats'][league]
            if league_data['avg_goals']:
                print(f"\n{league} :")
                print(f"  Buts moyens:    {mean(league_data['avg_goals']):.2f}")
                print(f"  Corners moyens: {mean(league_data['avg_corners']):.2f}")
                print(f"  Fautes moyennes: {mean(league_data['avg_fouls']):.2f}")
                if league_data['avg_cards']:
                    print(f"  Cartons moyens:  {mean(league_data['avg_cards']):.2f}")

    # Insights finaux
    print("\n" + "=" * 80)
    print("💡 INSIGHTS CLÉS POUR AMÉLIORER LES ALGORITHMES")
    print("=" * 80)

    insights = []

    if stats['corners_over25'] and stats['corners_under25']:
        diff = mean(stats['corners_over25']) - mean(stats['corners_under25'])
        insights.append(f"1. Matchs Over 2.5 ont {diff:+.1f} corners de plus en moyenne")

    if stats['elo_diffs_home_win']:
        insights.append(f"2. Elo diff moyen victoire domicile: {mean(stats['elo_diffs_home_win']):.0f} points")

    over_pct = stats['over25_yes']/(stats['over25_yes'] + stats['over25_no'])*100
    insights.append(f"3. Baseline Over 2.5: {over_pct:.1f}% (ajuster seuils si système dévie)")

    btts_pct = stats['btts_yes']/(stats['btts_yes'] + stats['btts_no'])*100
    insights.append(f"4. Baseline BTTS Yes: {btts_pct:.1f}%")

    home_win_pct = stats['home_wins']/(stats['home_wins'] + stats['draws'] + stats['away_wins'])*100
    insights.append(f"5. Avantage domicile réel: {home_win_pct:.1f}%")

    for insight in insights:
        print(insight)

    print("\n" + "=" * 80)
    print("✅ ANALYSE TERMINÉE!")
    print("=" * 80)

    # Sauvegarder résultats JSON
    output = {
        'total_matches': stats['total_matches'],
        'complete_data_matches': stats['complete_data_matches'],
        'over25_probability': over_pct,
        'btts_yes_probability': btts_pct,
        'home_win_probability': home_win_pct,
        'avg_corners_over25': mean(stats['corners_over25']) if stats['corners_over25'] else 0,
        'avg_corners_under25': mean(stats['corners_under25']) if stats['corners_under25'] else 0,
        'avg_fouls_over25': mean(stats['fouls_over25']) if stats['fouls_over25'] else 0,
        'avg_fouls_under25': mean(stats['fouls_under25']) if stats['fouls_under25'] else 0,
        'elo_diff_home_win': mean(stats['elo_diffs_home_win']) if stats['elo_diffs_home_win'] else 0,
        'elo_diff_draw': mean(stats['elo_diffs_draw']) if stats['elo_diffs_draw'] else 0,
        'elo_diff_away_win': mean(stats['elo_diffs_away_win']) if stats['elo_diffs_away_win'] else 0,
    }

    with open('analysis_results.json', 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\n💾 Résultats sauvegardés dans: analysis_results.json")

if __name__ == '__main__':
    stats = analyze_matches_csv()
    generate_report(stats)
