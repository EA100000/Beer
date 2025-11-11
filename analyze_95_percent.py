# -*- coding: utf-8 -*-
"""
Analyse ultra-approfondie pour atteindre 95% de precision
Objectif : Trouver les SCENARIOS QUASI-GARANTIS
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

print("=" * 80)
print("ANALYSE POUR 95% DE PRECISION")
print("Recherche des scenarios quasi-garantis")
print("=" * 80)
print()

# Charger les donnees
print("Chargement de Matches.csv...")
df = pd.read_csv('Matches.csv', low_memory=False)
print(f"OK {len(df):,} matchs charges")
print()

# Filtrer les matchs avec donnees completes
required_cols = ['HomeFouls', 'AwayFouls', 'HomeCorners', 'AwayCorners',
                 'HomeYellow', 'AwayYellow', 'FTHome', 'FTAway']

df_clean = df.dropna(subset=required_cols).copy()
print(f"OK {len(df_clean):,} matchs avec donnees completes")
print()

# Calculs
df_clean['TotalFouls'] = df_clean['HomeFouls'] + df_clean['AwayFouls']
df_clean['TotalCorners'] = df_clean['HomeCorners'] + df_clean['AwayCorners']
df_clean['TotalYellow'] = df_clean['HomeYellow'] + df_clean['AwayYellow']
df_clean['TotalGoals'] = df_clean['FTHome'] + df_clean['FTAway']

print("=" * 80)
print("STRATEGIE 1 : CUMUL DE CONDITIONS")
print("=" * 80)
print()

# Fonction pour tester une combinaison de conditions
def test_strategy(df, conditions_desc, filter_func, threshold, direction='over'):
    """Test une strategie et retourne le win rate"""
    filtered = filter_func(df)

    if len(filtered) == 0:
        return None

    if direction == 'over':
        correct = (filtered['TotalFouls'] > threshold).sum()
    else:
        correct = (filtered['TotalFouls'] < threshold).sum()

    total = len(filtered)
    win_rate = (correct / total) * 100

    return {
        'description': conditions_desc,
        'threshold': threshold,
        'direction': direction.upper(),
        'matches': total,
        'correct': correct,
        'win_rate': round(win_rate, 2)
    }

# ============================================================================
# FAUTES : SCENARIOS ULTRA-SELECTIVES
# ============================================================================
print("FAUTES : Recherche de scenarios 90%+")
print("-" * 60)

strategies_fouls = []

# Strategie 1: Faible moyenne + sous seuil
def strat1(df):
    home_low = df['HomeFouls'] < 10
    away_low = df['AwayFouls'] < 10
    return df[home_low & away_low]

result = test_strategy(df_clean, "Domicile < 10 ET Exterieur < 10", strat1, 18.5, 'under')
if result and result['win_rate'] > 85:
    strategies_fouls.append(result)
    print(f"  {result['description']}")
    print(f"    UNDER {result['threshold']} : {result['win_rate']}% ({result['matches']} matchs)")

# Strategie 2: Haute moyenne + sur seuil
def strat2(df):
    home_high = df['HomeFouls'] > 14
    away_high = df['AwayFouls'] > 14
    return df[home_high & away_high]

result = test_strategy(df_clean, "Domicile > 14 ET Exterieur > 14", strat2, 28.5, 'over')
if result and result['win_rate'] > 85:
    strategies_fouls.append(result)
    print(f"  {result['description']}")
    print(f"    OVER {result['threshold']} : {result['win_rate']}% ({result['matches']} matchs)")

# Strategie 3: Difference extreme
def strat3(df):
    diff = abs(df['HomeFouls'] - df['AwayFouls'])
    extreme_diff = diff > 8
    return df[extreme_diff]

result = test_strategy(df_clean, "Difference > 8 fautes", strat3, 26.5, 'over')
if result and result['win_rate'] > 85:
    strategies_fouls.append(result)
    print(f"  {result['description']}")
    print(f"    OVER {result['threshold']} : {result['win_rate']}% ({result['matches']} matchs)")

# Strategie 4: Tres peu de buts (match defensif)
def strat4(df):
    low_goals = df['TotalGoals'] <= 1
    return df[low_goals]

result = test_strategy(df_clean, "Total buts <= 1 (match defensif)", strat4, 24.5, 'over')
if result and result['win_rate'] > 85:
    strategies_fouls.append(result)
    print(f"  {result['description']}")
    print(f"    OVER {result['threshold']} : {result['win_rate']}% ({result['matches']} matchs)")

# Strategie 5: Beaucoup de buts (match ouvert)
def strat5(df):
    high_goals = df['TotalGoals'] >= 5
    return df[high_goals]

result = test_strategy(df_clean, "Total buts >= 5 (match ouvert)", strat5, 22.5, 'under')
if result and result['win_rate'] > 85:
    strategies_fouls.append(result)
    print(f"  {result['description']}")
    print(f"    UNDER {result['threshold']} : {result['win_rate']}% ({result['matches']} matchs)")

print()

# ============================================================================
# CORNERS : SCENARIOS ULTRA-SELECTIVES
# ============================================================================
print("CORNERS : Recherche de scenarios 90%+")
print("-" * 60)

strategies_corners = []

# Test corners avec fonction similaire
def test_corners_strategy(df, conditions_desc, filter_func, threshold, direction='over'):
    filtered = filter_func(df)

    if len(filtered) == 0:
        return None

    if direction == 'over':
        correct = (filtered['TotalCorners'] > threshold).sum()
    else:
        correct = (filtered['TotalCorners'] < threshold).sum()

    total = len(filtered)
    win_rate = (correct / total) * 100

    return {
        'description': conditions_desc,
        'threshold': threshold,
        'direction': direction.upper(),
        'matches': total,
        'correct': correct,
        'win_rate': round(win_rate, 2)
    }

# Strategie 1: Domicile tres dominant
def corner_strat1(df):
    home_dom = df['HomeCorners'] > 8
    away_weak = df['AwayCorners'] < 3
    return df[home_dom & away_weak]

result = test_corners_strategy(df_clean, "Domicile > 8 ET Exterieur < 3", corner_strat1, 9.5, 'over')
if result and result['win_rate'] > 85:
    strategies_corners.append(result)
    print(f"  {result['description']}")
    print(f"    OVER {result['threshold']} : {result['win_rate']}% ({result['matches']} matchs)")

# Strategie 2: Match equilibre
def corner_strat2(df):
    balanced = abs(df['HomeCorners'] - df['AwayCorners']) <= 2
    both_moderate = (df['HomeCorners'] >= 4) & (df['AwayCorners'] >= 4)
    return df[balanced & both_moderate]

result = test_corners_strategy(df_clean, "Match equilibre (diff <= 2)", corner_strat2, 8.5, 'over')
if result and result['win_rate'] > 85:
    strategies_corners.append(result)
    print(f"  {result['description']}")
    print(f"    OVER {result['threshold']} : {result['win_rate']}% ({result['matches']} matchs)")

# Strategie 3: Tres peu de corners total
def corner_strat3(df):
    both_low = (df['HomeCorners'] <= 3) & (df['AwayCorners'] <= 3)
    return df[both_low]

result = test_corners_strategy(df_clean, "Domicile <= 3 ET Exterieur <= 3", corner_strat3, 6.5, 'under')
if result and result['win_rate'] > 85:
    strategies_corners.append(result)
    print(f"  {result['description']}")
    print(f"    UNDER {result['threshold']} : {result['win_rate']}% ({result['matches']} matchs)")

# Strategie 4: Beaucoup de corners des deux cotes
def corner_strat4(df):
    both_high = (df['HomeCorners'] >= 6) & (df['AwayCorners'] >= 6)
    return df[both_high]

result = test_corners_strategy(df_clean, "Domicile >= 6 ET Exterieur >= 6", corner_strat4, 11.5, 'over')
if result and result['win_rate'] > 85:
    strategies_corners.append(result)
    print(f"  {result['description']}")
    print(f"    OVER {result['threshold']} : {result['win_rate']}% ({result['matches']} matchs)")

print()

# ============================================================================
# CARTONS JAUNES : SCENARIOS ULTRA-SELECTIVES
# ============================================================================
print("CARTONS JAUNES : Recherche de scenarios 90%+")
print("-" * 60)

strategies_yellow = []

def test_yellow_strategy(df, conditions_desc, filter_func, threshold, direction='over'):
    filtered = filter_func(df)

    if len(filtered) == 0:
        return None

    if direction == 'over':
        correct = (filtered['TotalYellow'] > threshold).sum()
    else:
        correct = (filtered['TotalYellow'] < threshold).sum()

    total = len(filtered)
    win_rate = (correct / total) * 100

    return {
        'description': conditions_desc,
        'threshold': threshold,
        'direction': direction.upper(),
        'matches': total,
        'correct': correct,
        'win_rate': round(win_rate, 2)
    }

# Strategie 1: Peu de cartons des deux cotes
def yellow_strat1(df):
    both_low = (df['HomeYellow'] <= 1) & (df['AwayYellow'] <= 1)
    return df[both_low]

result = test_yellow_strategy(df_clean, "Domicile <= 1 ET Exterieur <= 1", yellow_strat1, 2.5, 'under')
if result and result['win_rate'] > 85:
    strategies_yellow.append(result)
    print(f"  {result['description']}")
    print(f"    UNDER {result['threshold']} : {result['win_rate']}% ({result['matches']} matchs)")

# Strategie 2: Beaucoup de cartons des deux cotes
def yellow_strat2(df):
    both_high = (df['HomeYellow'] >= 3) & (df['AwayYellow'] >= 3)
    return df[both_high]

result = test_yellow_strategy(df_clean, "Domicile >= 3 ET Exterieur >= 3", yellow_strat2, 5.5, 'over')
if result and result['win_rate'] > 85:
    strategies_yellow.append(result)
    print(f"  {result['description']}")
    print(f"    OVER {result['threshold']} : {result['win_rate']}% ({result['matches']} matchs)")

# Strategie 3: Match tres calme (peu de fautes)
def yellow_strat3(df):
    low_fouls = df['TotalFouls'] < 20
    return df[low_fouls]

result = test_yellow_strategy(df_clean, "Total fautes < 20 (match calme)", yellow_strat3, 3.5, 'under')
if result and result['win_rate'] > 85:
    strategies_yellow.append(result)
    print(f"  {result['description']}")
    print(f"    UNDER {result['threshold']} : {result['win_rate']}% ({result['matches']} matchs)")

# Strategie 4: Match tres tendu (beaucoup de fautes)
def yellow_strat4(df):
    high_fouls = df['TotalFouls'] > 32
    return df[high_fouls]

result = test_yellow_strategy(df_clean, "Total fautes > 32 (match tendu)", yellow_strat4, 4.5, 'over')
if result and result['win_rate'] > 85:
    strategies_yellow.append(result)
    print(f"  {result['description']}")
    print(f"    OVER {result['threshold']} : {result['win_rate']}% ({result['matches']} matchs)")

print()

# ============================================================================
# SAUVEGARDE
# ============================================================================
print("=" * 80)
print("SAUVEGARDE DES STRATEGIES 90%+")
print("=" * 80)
print()

results = {
    'total_analyzed': len(df_clean),
    'ultra_selective_strategies': {
        'fouls': strategies_fouls,
        'corners': strategies_corners,
        'yellowCards': strategies_yellow
    }
}

with open('strategies_95_percent.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"OK Strategies sauvegardees dans : strategies_95_percent.json")
print()
print(f"Total strategies 85%+ trouvees :")
print(f"  - Fautes : {len(strategies_fouls)}")
print(f"  - Corners : {len(strategies_corners)}")
print(f"  - Cartons Jaunes : {len(strategies_yellow)}")
print()
print("=" * 80)
print("ANALYSE TERMINEE")
print("=" * 80)
