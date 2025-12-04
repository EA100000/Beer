# 🚨 CORRECTION CRITIQUE DU SYSTÈME LIVE

**Date**: 4 Décembre 2025
**Problème identifié**: Backtesting montre 49.7% de précision sur corners (pire qu'un tirage au sort)

---

## 🔍 BUGS IDENTIFIÉS

### BUG #1: Snapshots simulés au lieu des vrais
**Fichier**: `src/pages/Live.tsx:1033-1037`

**Avant** (CASSÉ):
```typescript
// simulé - dans une vraie app, on stockerait l'historique
const snapshots = [
  { minute: Math.max(0, match.liveData.minute - 15),
    value: Math.round(match.liveData.homeScore + match.liveData.awayScore) * 0.7 },
  { minute: match.liveData.minute,
    value: match.liveData.homeScore + match.liveData.awayScore }
];
```

**Après** (CORRIGÉ):
```typescript
// Snapshots RÉELS depuis l'historique des données collées
const snapshots = match.liveDataHistory.length > 0
  ? match.liveDataHistory.map(snap => ({
      minute: snap.data.minute,
      value: snap.data.homeScore + snap.data.awayScore
    }))
  : [fallback];
```

**Impact**: Validation hyper-fiabilité utilisait des données **FICTIVES** au lieu des vrais snapshots fournis !

---

## 📊 RÉSULTATS BACKTESTING (50K MATCHS RÉELS)

| Marché | Précision RÉELLE | Système prétend | Écart |
|--------|------------------|-----------------|-------|
| Over 2.5 buts | **52.0%** | 87% | -35% ❌ |
| Over 1.5 buts | **75.3%** | - | ✅ |
| Over 3.5 buts | **68.9%** | - | ⚠️ |
| Corners 9.5 | **49.7%** | 84% | -34% ❌ |
| Cartons 4.5 | **61.9%** | 79% | -17% ⚠️ |

### Patterns d'échec identifiés:

1. **3879 matchs** prévus "Over 2.5" finissent à 0-1 ou 1-0
2. **2921 matchs** prévus "Over 9.5 corners" finissent avec <8 corners
3. **4339 matchs** avec 6+ cartons non prévus

---

## 🎯 CORRECTIONS NÉCESSAIRES

### 1. Formule Corners (URGENTE)

**Problème**: Utilise seulement `cornerFrequency * minutesLeft`

**Manque**:
- Style de jeu (possession = plus de corners)
- Phase du match (fin de match = rush → plus de corners)
- Déséquilibre score (équipe menante attaque → corners)
- Enjeu du match

**Nouvelle formule proposée**:
```typescript
let projectedCorners = currentCorners + (cornerRate * minutesLeft);

// Ajustement possession (données LIVE)
const possessionDiff = Math.abs(homePossession - awayPossession);
if (possessionDiff > 15) projectedCorners += 1.5; // Domination

// Ajustement phase
if (minute > 75) projectedCorners *= 1.15; // Rush final

// Ajustement score
const scoreDiff = Math.abs(homeScore - awayScore);
if (scoreDiff >= 2 && minute > 60) {
  projectedCorners += 1.0; // Équipe menante attaque
}

// Ajustement attaques dangereuses (si disponible)
if (dangerousAttacks > 0) {
  const attackRatio = dangerousAttacks / minute;
  if (attackRatio > 1.2) projectedCorners += 1.5;
}
```

### 2. Formule Buts (URGENTE)

**Problème**: Over 2.5 = 52% (pile ou face)

**Manque**:
- Motivation/enjeu
- Météo
- Head-to-head
- Blessures clés

**Améliorations**:
```typescript
// Facteur intensité LIVE
const shotFrequency = totalShots / minute;
if (shotFrequency > 0.4) expectedGoals += 0.4; // Match intense
if (shotFrequency < 0.2) expectedGoals -= 0.3; // Match fermé

// Facteur efficacité
const shotAccuracy = shotsOnTarget / totalShots;
if (shotAccuracy > 0.4) expectedGoals += 0.3; // Finisseurs
if (shotAccuracy < 0.25) expectedGoals -= 0.2; // Mauvaise finition

// Facteur pression (xG si disponible)
if (xG > 0) {
  const xGDiff = actualGoals - xG;
  if (xGDiff < -0.5) expectedGoals += 0.3; // Sous-performance → rattrapage probable
}
```

### 3. Formule Cartons (AMÉLIORATION)

**Problème**: 61.9% (acceptable mais pas optimal)

**Améliorations**:
```typescript
// Intensité physique LIVE
const foulRate = totalFouls / minute;
if (foulRate > 0.35) expectedCards += 1.0; // Match physique
if (foulRate > 0.5) expectedCards += 1.5;  // Match très agressif

// Escalade de tension
if (liveDataHistory.length >= 2) {
  const recentFouls = liveDataHistory[liveDataHistory.length - 1].data.homeFouls +
                      liveDataHistory[liveDataHistory.length - 1].data.awayFouls;
  const previousFouls = liveDataHistory[liveDataHistory.length - 2].data.homeFouls +
                        liveDataHistory[liveDataHistory.length - 2].data.awayFouls;

  if (recentFouls - previousFouls > 3) {
    expectedCards += 0.8; // Escalade visible
  }
}

// Score serré en fin de match
if (minute > 70 && Math.abs(homeScore - awayScore) <= 1) {
  expectedCards += 0.5; // Tension finale
}
```

---

## 🚀 PLAN D'ACTION

1. ✅ **Corriger snapshots** (FAIT)
2. ⏳ **Améliorer formule corners** avec backtesting
3. ⏳ **Améliorer formule buts** avec backtesting
4. ⏳ **Améliorer formule cartons** avec backtesting
5. ⏳ **Re-tester sur 50k matchs** → Viser 70%+ précision

---

## 💡 PHILOSOPHIE

> **"Les calculs mathématiques doivent être PARFAITS. Les snapshots LIVE doivent AFFINER les prédictions, pas les ignorer."**

- PRÉ-MATCH: Lois statistiques robustes (Poisson, Dixon-Coles, Monte Carlo)
- LIVE: Ajustement avec données RÉELLES (snapshots minute 15, 30, 45, 60, 75)
- MARGE: Confiance ajustée selon qualité données et contexte

**Résultat attendu**: 70-75% précision (au lieu de 50%)
