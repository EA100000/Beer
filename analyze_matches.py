# -*- coding: utf-8 -*-
"""
Analyse approfondie des 230,558 matchs pour ameliorer les predictions
Objectif : Trouver les VRAIES logiques et patterns pour ne plus perdre
"""

import pandas as pd
import numpy as np
from scipy import stats
import json
import sys

# Fix encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("ANALYSE APPROFONDIE DES DONNEES REELLES")
print("=" * 80)
print()

# Charger les donnees
print("Chargement de Matches.csv (230,558 matchs)...")
df = pd.read_csv('Matches.csv')
print(f"OK {len(df):,} matchs charges")
print()

# Afficher les colonnes disponibles
print("COLONNES DISPONIBLES :")
print(df.columns.tolist())
print()

# Filtrer les matchs avec donnees completes
print("Filtrage des matchs avec donnees completes...")
required_cols = ['HomeFouls', 'AwayFouls', 'HomeCorners', 'AwayCorners',
                 'HomeYellow', 'AwayYellow']

df_clean = df.dropna(subset=required_cols)
print(f"OK {len(df_clean):,} matchs avec donnees completes ({len(df_clean)/len(df)*100:.1f}%)")
print()

# Calcul des totaux par match
df_clean['TotalFouls'] = df_clean['HomeFouls'] + df_clean['AwayFouls']
df_clean['TotalCorners'] = df_clean['HomeCorners'] + df_clean['AwayCorners']
df_clean['TotalYellow'] = df_clean['HomeYellow'] + df_clean['AwayYellow']

stats_dict = {}

# ============================================================================
# ANALYSE 1 : STATISTIQUES DESCRIPTIVES
# ============================================================================
print("=" * 80)
print("ANALYSE 1 : STATISTIQUES DESCRIPTIVES")
print("=" * 80)
print()

for market, col in [('Fautes', 'TotalFouls'),
                     ('Corners', 'TotalCorners'),
                     ('Cartons Jaunes', 'TotalYellow')]:

    data = df_clean[col]

    print(f"\n{market.upper()}")
    print("-" * 60)
    print(f"  Moyenne        : {data.mean():.2f}")
    print(f"  Mediane        : {data.median():.2f}")
    print(f"  Ecart-type     : {data.std():.2f}")
    print(f"  Min            : {data.min():.0f}")
    print(f"  Max            : {data.max():.0f}")
    print(f"  Q1 (25%)       : {data.quantile(0.25):.2f}")
    print(f"  Q3 (75%)       : {data.quantile(0.75):.2f}")
    print()
    print(f"  Distribution des seuils (% OVER) :")

    thresholds_dict = {}

    if market == 'Fautes':
        thresholds = [20.5, 22.5, 24.5, 26.5, 28.5, 30.5]
    elif market == 'Corners':
        thresholds = [8.5, 9.5, 10.5, 11.5, 12.5]
    else:  # Cartons Jaunes
        thresholds = [2.5, 3.5, 4.5, 5.5, 6.5]

    for threshold in thresholds:
        pct_over = (data > threshold).mean() * 100
        thresholds_dict[threshold] = round(pct_over, 2)
        print(f"    OVER {threshold:5.1f} : {pct_over:5.1f}% ({(data > threshold).sum():,} matchs)")

    stats_dict[market] = {
        'mean': round(data.mean(), 2),
        'median': round(data.median(), 2),
        'std': round(data.std(), 2),
        'min': int(data.min()),
        'max': int(data.max()),
        'q1': round(data.quantile(0.25), 2),
        'q3': round(data.quantile(0.75), 2),
        'thresholds': thresholds_dict
    }

# ============================================================================
# ANALYSE 2 : PATTERNS DOMICILE/EXTERIEUR
# ============================================================================
print("\n" + "=" * 80)
print("ANALYSE 2 : AVANTAGE DOMICILE/EXTERIEUR")
print("=" * 80)
print()

home_away_dict = {}

for market, home_col, away_col in [('Fautes', 'HomeFouls', 'AwayFouls'),
                                     ('Corners', 'HomeCorners', 'AwayCorners'),
                                     ('Cartons Jaunes', 'HomeYellow', 'AwayYellow')]:

    home_mean = df_clean[home_col].mean()
    away_mean = df_clean[away_col].mean()
    diff_pct = ((home_mean - away_mean) / away_mean) * 100

    print(f"\n{market} :")
    print(f"  Domicile : {home_mean:.2f} en moyenne")
    print(f"  Exterieur : {away_mean:.2f} en moyenne")
    print(f"  Difference : {diff_pct:+.1f}%")

    # Test statistique
    t_stat, p_value = stats.ttest_ind(df_clean[home_col], df_clean[away_col])
    print(f"  Significatif ? {'OUI' if p_value < 0.05 else 'NON'} (p = {p_value:.4f})")

    home_away_dict[market] = {
        'home_mean': round(home_mean, 2),
        'away_mean': round(away_mean, 2),
        'diff_pct': round(diff_pct, 2),
        'significant': p_value < 0.05,
        'p_value': round(p_value, 4)
    }

# ============================================================================
# ANALYSE 3 : VARIANCE ET STABILITE
# ============================================================================
print("\n" + "=" * 80)
print("ANALYSE 3 : VARIANCE ET STABILITE (COEFFICIENT DE VARIATION)")
print("=" * 80)
print()

variance_dict = {}

for market, col in [('Fautes', 'TotalFouls'),
                     ('Corners', 'TotalCorners'),
                     ('Cartons Jaunes', 'TotalYellow')]:

    mean = df_clean[col].mean()
    std = df_clean[col].std()
    cv = (std / mean) * 100  # Coefficient de variation en %

    print(f"\n{market} :")
    print(f"  Moyenne        : {mean:.2f}")
    print(f"  Ecart-type     : {std:.2f}")
    print(f"  Coef. Variation: {cv:.1f}%")
    print(f"  Stabilite      : {'TRES STABLE' if cv < 20 else 'STABLE' if cv < 30 else 'VOLATILE'}")

    variance_dict[market] = {
        'mean': round(mean, 2),
        'std': round(std, 2),
        'cv': round(cv, 2),
        'stability': 'TRES STABLE' if cv < 20 else 'STABLE' if cv < 30 else 'VOLATILE'
    }

# ============================================================================
# ANALYSE 4 : MEILLEURS SEUILS
# ============================================================================
print("\n" + "=" * 80)
print("ANALYSE 4 : MEILLEURS SEUILS POUR MAXIMISER LE WIN RATE")
print("=" * 80)
print()

best_thresholds_dict = {}

for market, col in [('Fautes', 'TotalFouls'),
                     ('Corners', 'TotalCorners'),
                     ('Cartons Jaunes', 'TotalYellow')]:

    data = df_clean[col]
    mean = data.mean()

    print(f"\n{market} (Moyenne : {mean:.2f}) :")
    print("-" * 60)

    if market == 'Fautes':
        test_thresholds = np.arange(18.5, 34.5, 1.0)
    elif market == 'Corners':
        test_thresholds = np.arange(6.5, 16.5, 0.5)
    else:
        test_thresholds = np.arange(1.5, 8.5, 0.5)

    best_over = None
    best_over_rate = 0
    best_under = None
    best_under_rate = 0

    for threshold in test_thresholds:
        over_rate = (data > threshold).mean() * 100
        under_rate = (data < threshold).mean() * 100

        over_confidence = abs(over_rate - 50)
        under_confidence = abs(under_rate - 50)

        if over_confidence > best_over_rate and over_rate > 50:
            best_over = threshold
            best_over_rate = over_rate

        if under_confidence > best_under_rate and under_rate > 50:
            best_under = threshold
            best_under_rate = under_rate

    print(f"  Meilleur OVER  : {best_over:.1f} (win rate : {best_over_rate:.1f}%)")
    print(f"  Meilleur UNDER : {best_under:.1f} (win rate : {best_under_rate:.1f}%)")

    best_thresholds_dict[market] = {
        'best_over': round(best_over, 1),
        'best_over_rate': round(best_over_rate, 1),
        'best_under': round(best_under, 1),
        'best_under_rate': round(best_under_rate, 1)
    }

# ============================================================================
# SAUVEGARDE DES RESULTATS
# ============================================================================
print("\n" + "=" * 80)
print("SAUVEGARDE DES RESULTATS")
print("=" * 80)
print()

results = {
    'total_matches': len(df_clean),
    'statistics': stats_dict,
    'home_away_effect': home_away_dict,
    'variance_analysis': variance_dict,
    'best_thresholds': best_thresholds_dict
}

with open('real_data_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print("OK Resultats sauvegardes dans : real_data_analysis.json")
print()

# ============================================================================
# RECOMMANDATIONS
# ============================================================================
print("=" * 80)
print("RECOMMANDATIONS POUR AMELIORER LES ALGORITHMES")
print("=" * 80)
print()

fautes_cv_real = variance_dict['Fautes']['cv'] / 100
corners_cv_real = variance_dict['Corners']['cv'] / 100
yellows_cv_real = variance_dict['Cartons Jaunes']['cv'] / 100

fautes_home_boost = (home_away_dict['Fautes']['home_mean'] / home_away_dict['Fautes']['away_mean'] - 1)
corners_home_boost = (home_away_dict['Corners']['home_mean'] / home_away_dict['Corners']['away_mean'] - 1)

recommendations = {
    'coefficients_variation': {
        'fouls': round(fautes_cv_real, 3),
        'corners': round(corners_cv_real, 3),
        'yellowCards': round(yellows_cv_real, 3)
    },
    'home_boost': {
        'fouls': round(fautes_home_boost, 3),
        'corners': round(corners_home_boost, 3)
    },
    'optimal_thresholds': best_thresholds_dict
}

print("1. COEFFICIENTS DE VARIATION (a utiliser dans enhancedOverUnder.ts) :")
print(f"   fouls: {fautes_cv_real:.3f}  (actuellement : 0.15)")
print(f"   corners: {corners_cv_real:.3f}  (actuellement : 0.28)")
print(f"   yellowCards: {yellows_cv_real:.3f}  (actuellement : 0.32)")
print()

print("2. AJUSTEMENTS DOMICILE/EXTERIEUR (a utiliser) :")
print(f"   Fautes : Domicile {fautes_home_boost:+.1%}, Exterieur {-fautes_home_boost:+.1%}")
print(f"   Corners : Domicile {corners_home_boost:+.1%}, Exterieur {-corners_home_boost:+.1%}")
print()

print("3. SEUILS OPTIMAUX (meilleur win rate) :")
for market, data in best_thresholds_dict.items():
    print(f"   {market} :")
    print(f"     OVER {data['best_over']:.1f} : {data['best_over_rate']:.1f}% de win rate")
    print(f"     UNDER {data['best_under']:.1f} : {data['best_under_rate']:.1f}% de win rate")
print()

with open('recommendations.json', 'w', encoding='utf-8') as f:
    json.dump(recommendations, f, indent=2, ensure_ascii=False)

print("OK Recommandations sauvegardees dans : recommendations.json")
print()

print("=" * 80)
print("ANALYSE TERMINEE !")
print("=" * 80)
print()
print("Fichiers generes :")
print("   - real_data_analysis.json : Statistiques detaillees")
print("   - recommendations.json : Recommandations d'amelioration")
print()
print("Prochaine etape : Integrer ces insights dans enhancedOverUnder.ts")
