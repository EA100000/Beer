# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pari365 is an AI-powered football match prediction system using machine learning and advanced statistical models to achieve 85-92% prediction accuracy. The application is built with React + TypeScript + Vite and uses shadcn/ui components for the interface.

## Core Architecture

### Prediction System Layers

The prediction engine is built on a multi-layered architecture that combines multiple statistical and ML approaches:

1. **Statistical Foundation** (`src/utils/footballAnalysis.ts`)
   - Poisson and Negative Binomial distributions for goal modeling
   - Dixon-Coles adjustment with time decay for score correlation
   - Bivariate Poisson for goal dependency modeling
   - Elo and TrueSkill rating systems for team strength
   - Monte Carlo simulation (50,000 iterations) for probability estimation

2. **Adaptive Intelligence** (`src/utils/smartDataImputation.ts`)
   - Smart data imputation using league-specific reference data
   - Automatic detection of competition level (Elite, Professional, Amateur, etc.)
   - Statistical correlation-based missing value estimation
   - Data quality assessment and validation

3. **Ultra-Precise Predictions** (`src/utils/ultraPrecisePredictions.ts`)
   - Advanced correlation matrices for corners, fouls, cards, throw-ins
   - Based on analysis of 200,000+ historical matches
   - Multi-factor prediction models considering:
     - Possession, shots, attacking play, intensity
     - Referee strictness, weather conditions, fatigue
     - Home advantage, form, motivation, rivalry

4. **Validation & Safety** (`src/utils/predictionValidationSystem.ts`)
   - Multi-level validation of predictions
   - Statistical anomaly detection
   - Risk level assessment (LOW/MEDIUM/HIGH/CRITICAL)
   - Safety scoring (0-100) for prediction reliability
   - Automatic blocking of unreliable predictions

5. **Advanced ML Models** (`src/utils/advancedMLModels.ts`, `src/utils/deepLearningModels.ts`)
   - XGBoost, LightGBM, CatBoost implementations
   - LSTM, Transformer, and CNN neural networks
   - Ensemble learning with stacking/blending
   - Hyperparameter optimization with Optuna

### Component Structure

**Main Application Flow:**
- `src/App.tsx` - React Query setup, routing, toast/tooltip providers
- `src/pages/Index.tsx` - Main page orchestrating all prediction components

**Prediction Display Components:**
- `ComprehensivePredictions.tsx` - Main prediction results display
- `LowRiskPredictions.tsx` - High-confidence, low-risk predictions only
- `UltraPrecisePredictions.tsx` - Advanced predictions with multiple factors
- `PerfectPredictions.tsx` - Perfect match scenario predictions

**Input & Validation:**
- `TeamStatsForm.tsx` - Form for entering team statistics (all fields optional)
- `DataQualityIndicator.tsx` - Visual indicator of data quality and completeness
- `PredictionSafetyGuard.tsx` - Safety warnings and validation alerts

**Analysis & Metrics:**
- `AnalysisResults.tsx` - Detailed analysis breakdown
- `ValidationMetrics.tsx` - Model performance metrics
- `PredictionFailureAnalysis.tsx` - Post-prediction failure analysis

### Type System

`src/types/football.ts` defines the core data structures:
- `TeamStats` - Comprehensive team statistics (28 fields including goals, possession, cards, duels, etc.)
- `MatchPrediction` - All prediction types (Over/Under, BTTS, Corners, Fouls, Cards, etc.)
- `DataQuality` - Data quality assessment with score, level, missing fields, recommendations
- `AnalysisResult` - Complete analysis output combining teams, predictions, confidence

## Development Commands

```bash
# Development server (runs on http://[::]:8080)
npm run dev

# Production build
npm run build

# Development build (with source maps)
npm run build:dev

# Linting
npm run lint

# Preview production build
npm run preview
```

## Build Configuration

- **Vite** with React SWC plugin for fast compilation
- **TypeScript** with relaxed rules (noImplicitAny: false, strictNullChecks: false)
- **Path alias**: `@/*` maps to `src/*`
- Development mode includes `lovable-tagger` component tagger

## Key Technical Decisions

### Smart Data Handling

The system is designed to work with **partial data** - not all fields in TeamStats are required. The smart imputation system:
- Detects competition level from available data (rating, possession, etc.)
- Uses league-specific reference data (Premier League, Bundesliga, La Liga, Serie A, Ligue 1)
- Applies statistical correlations to estimate missing values
- Provides quality scores and recommendations for data improvement

### Prediction Validation

All predictions go through multi-level validation:
1. Input data validation (completeness, consistency, ranges)
2. Statistical anomaly detection (outliers, inconsistencies)
3. Confidence mismatch detection (predicted vs actual confidence)
4. Model agreement checking (multiple models should agree)
5. Safety score calculation (0-100, threshold: 50)

**Important**: Predictions with safety scores below 50 should be flagged or blocked.

### Statistical Models

The core prediction engine (`analyzeMatch` in footballAnalysis.ts) combines:
- **Poisson Process**: Base goal rate calculation
- **Dixon-Coles**: Low-score adjustment (0-0, 0-1, 1-0, 1-1)
- **Monte Carlo**: 50,000 simulations for robust probability estimation
- **Ensemble Methods**: Multiple models voting on final predictions

### Performance Targets

According to the README, the system achieves:
- Over/Under 2.5: 87% accuracy (82-98% confidence)
- BTTS: 83% accuracy (75-92% confidence)
- Corners: 84% accuracy (70-90% confidence)
- Fouls: 81% accuracy (75-90% confidence)
- Yellow Cards: 79% accuracy (78-95% confidence)
- Throw-ins: 76% accuracy (72-90% confidence)

## UI Components

The project uses **shadcn/ui** components. All components are in `src/components/ui/`:
- Standard components: Button, Card, Input, Select, Tabs, etc.
- Data visualization: Chart (Recharts-based)
- Feedback: Toast/Sonner for notifications, Dialog for modals
- Layout: Sidebar, Resizable panels, Accordion

To add new shadcn components, follow the shadcn/ui documentation.

## Code Style

- TypeScript with loose type checking (project uses `noImplicitAny: false`)
- Functional React components with hooks
- TailwindCSS for styling with custom classes via `lib/utils.ts` (`cn()` function)
- Explicit imports from `@/` path alias
- ESLint configured with React hooks and React refresh plugins

## Data Flow

1. User enters team statistics in `TeamStatsForm` (optional fields)
2. `smartDataImputation` fills missing values based on league standards
3. `analyzeMatch` runs core statistical analysis and Monte Carlo simulation
4. `ultraPrecisePredictions` applies advanced correlation models
5. `predictionValidationSystem` validates outputs and calculates safety scores
6. Results displayed in `ComprehensivePredictions` and other prediction components
7. `DataQualityIndicator` shows data completeness and recommendations

## Future Enhancements

The README outlines a 5-phase roadmap to reach 99% accuracy:
1. Advanced ML Models (XGBoost, LightGBM, CatBoost) → 92%
2. Hyperparameter Optimization (Optuna) → 95%
3. Feature Engineering (temporal/contextual features) → 97%
4. Ensemble Learning (stacking/blending) → 98%
5. Advanced Validation (Time Series CV, Monte Carlo CV) → 99%

Code for phases 1-2 exists in `advancedMLModels.ts`, `deepLearningModels.ts`, and `hyperparameterOptimization.ts` but may need integration work.

## Important Notes

- The system prioritizes safety over accuracy - predictions with low confidence are automatically flagged
- All fields in TeamStats are optional - the system adapts to available data
- The statistical models are designed for professional football leagues (top 5 European leagues)
- Monte Carlo simulations use 50,000 iterations by default for production-level accuracy
- The validation system uses multiple thresholds to catch anomalies at different severity levels
