import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamStatsForm } from '@/components/TeamStatsForm';
import { AnalysisResults } from '@/components/AnalysisResults';
import { LowRiskPredictions } from '@/components/LowRiskPredictions';
import { DataRequirements } from '@/components/DataRequirements';
// import { ComprehensivePredictions } from '@/components/ComprehensivePredictions'; // Temporairement désactivé
import { ValidationMetrics } from '@/components/ValidationMetrics';
import { SystemImprovements } from '@/components/SystemImprovements';
import { PerfectPredictions } from '@/components/PerfectPredictions';
import { RealDataValidation } from '@/components/RealDataValidation';
import { UltraPrecisePredictions } from '@/components/UltraPrecisePredictions';
import { DataQualityIndicator } from '@/components/DataQualityIndicator';
import { PredictionFailureAnalysis } from '@/components/PredictionFailureAnalysis';
import { AdvancedImprovements } from '@/components/AdvancedImprovements';
import { PrecisionImprovementRoadmap } from '@/components/PrecisionImprovementRoadmap';
import { PerfectBetsDisplay } from '@/components/PerfectBetsDisplay';
import { Top10PredictionsPanel } from '@/components/Top10PredictionsPanel';
import { SofaScoreURLInput } from '@/components/SofaScoreURLInput';
import { SofaScoreTextInput } from '@/components/SofaScoreTextInput';
import { EnhancedOverUnderDisplay } from '@/components/EnhancedOverUnderDisplay';
import { TeamStats, AnalysisResult } from '@/types/football';
import { analyzeMatchSafe } from '@/utils/analyzeMatchSafe';
import { generatePerfectPredictions, PerfectPrediction } from '@/utils/perfectPredictions';
import { generateAllOverUnderPredictions, OverUnderPrediction } from '@/utils/enhancedOverUnder';
import { Activity, BarChart3, Brain, ArrowLeft } from 'lucide-react';
import heroImage from '@/assets/hero-football-analysis.jpg';

const defaultTeamStats: TeamStats = {
  name: '',
  sofascoreRating: 0,
  matches: 0,
  goalsScored: 0,
  goalsConceded: 0,
  assists: 0,
  goalsPerMatch: 0,
  shotsOnTargetPerMatch: 0,
  bigChancesPerMatch: 0,
  bigChancesMissedPerMatch: 0,
  possession: 0,
  accuracyPerMatch: 0,
  longBallsAccuratePerMatch: 0,
  cleanSheets: 0,
  goalsConcededPerMatch: 0,
  interceptionsPerMatch: 0,
  tacklesPerMatch: 0,
  clearancesPerMatch: 0,
  penaltyConceded: 0,
  throwInsPerMatch: 0,
  yellowCardsPerMatch: 0,
  duelsWonPerMatch: 0,
  offsidesPerMatch: 0,
  goalKicksPerMatch: 0,
  redCardsPerMatch: 0,
  foulsPerMatch: 0,
};

const Index = () => {
  const navigate = useNavigate();
  const [homeTeam, setHomeTeam] = useState<TeamStats>(defaultTeamStats);
  const [awayTeam, setAwayTeam] = useState<TeamStats>(defaultTeamStats);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lowRiskPredictions, setLowRiskPredictions] = useState<any[]>([]);
  const [combinedPredictions, setCombinedPredictions] = useState<any[]>([]);
  const [perfectBets, setPerfectBets] = useState<PerfectPrediction[]>([]);
  const [overUnderPredictions, setOverUnderPredictions] = useState<OverUnderPrediction[]>([]);

  const handleAnalyze = async () => {
    if (!homeTeam.name || !awayTeam.name) {
      alert('Veuillez remplir au moins les noms des équipes');
      return;
    }

    setIsAnalyzing(true);

    // Simulate analysis delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // 🛡️ MODE ULTRA-CONSERVATEUR ACTIVÉ PAR DÉFAUT
      // Confiance min: 90%, Safety score min: 90, Aversion pertes × 2.5
      const result = analyzeMatchSafe(homeTeam, awayTeam, {
        ultraConservative: true,  // ✅ ACTIVÉ
        checkLossAversion: true,  // ✅ ACTIVÉ
        stake: 100  // Mise par défaut pour calcul espérance
      });

      // Calculate confidence based on data completeness
      const homeDataCompleteness = Object.values(homeTeam).filter(v => v !== 0 && v !== '').length;
      const awayDataCompleteness = Object.values(awayTeam).filter(v => v !== 0 && v !== '').length;
      const maxFields = Object.keys(defaultTeamStats).length;
      const confidence = Math.round(((homeDataCompleteness + awayDataCompleteness) / (maxFields * 2)) * 100);

      // Afficher résultats validation ultra-conservatrice
      if (result.ultraConservative) {
        console.log('\n🛡️ ============ VALIDATION ULTRA-CONSERVATRICE ============');
        console.log('Approuvé:', result.ultraConservative.approved ? '✅ OUI' : '🚫 NON');
        console.log('Score final:', result.ultraConservative.finalScore + '/100');
        console.log('Confiance:', result.ultraConservative.confidence + '%');
        console.log('Recommandation:', result.ultraConservative.recommendation);

        if (result.ultraConservative.riskFactors.length > 0) {
          console.warn('⚠️ Facteurs de risque:', result.ultraConservative.riskFactors);
        }

        if (result.ultraConservative.penalties.length > 0) {
          console.warn('⚠️ Pénalités:', result.ultraConservative.penalties);
        }
      }

      // Afficher résultats aversion pertes
      if (result.lossAversion) {
        console.log('\n💰 ============ AVERSION AUX PERTES ============');
        console.log('EV standard:', result.lossAversion.expectedValue.toFixed(2) + '£');
        console.log('EV ajusté (perte × 2.5):', result.lossAversion.lossAversionAdjusted.toFixed(2) + '£');
        console.log('Recommandation:', result.lossAversion.recommendation === 'BET' ? '✅ PARIER' : '🚫 NE PAS PARIER');
        console.log('Message:', result.lossAversion.message);
      }

      setAnalysisResult({
        homeTeam,
        awayTeam,
        prediction: result.prediction,
        confidence: Math.min(confidence, 95), // Cap at 95%
        ultraConservative: result.ultraConservative,
        lossAversion: result.lossAversion
      });

    } catch (error: any) {
      // Prédiction bloquée par validation ultra-conservatrice
      console.error('🚫 PRÉDICTION BLOQUÉE:', error.message);
      alert(
        '🚫 PRÉDICTION REJETÉE (Mode Ultra-Conservateur)\n\n' +
        error.message + '\n\n' +
        'Le système a détecté un risque de perte trop élevé.\n' +
        'Critères ultra-stricts:\n' +
        '- Confiance minimum: 90%\n' +
        '- Safety score minimum: 90/100\n' +
        '- Aversion aux pertes: Perte pèse 2.5× plus lourd\n\n' +
        'Recommandation: NE PAS PARIER sur ce match.'
      );
      setIsAnalyzing(false);
      return;
    }

    // ⚡ PARIS PARFAITS : Seulement les meilleurs (85%+) + Double Chance
    const perfectBetsPredictions = generatePerfectPredictions(homeTeam, awayTeam);
    setPerfectBets(perfectBetsPredictions);

    // 🎯 OVER/UNDER ULTRA-PRÉCIS : Basé sur les moyennes réelles des équipes
    const overUnderPreds = generateAllOverUnderPredictions(homeTeam, awayTeam);
    setOverUnderPredictions(overUnderPreds);

    setIsAnalyzing(false);
  };

  const resetAnalysis = () => {
    setHomeTeam(defaultTeamStats);
    setAwayTeam(defaultTeamStats);
    setAnalysisResult(null);
    setLowRiskPredictions([]);
    setCombinedPredictions([]);
    setPerfectBets([]);
    setOverUnderPredictions([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-pitch text-primary-foreground overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <div className="flex-1" />
            </div>
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <Brain className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Analyseur Football Pro
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Algorithmes d'IA avancés pour des prédictions hyper-précises
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <Activity className="h-4 w-4" />
                <span>Poisson & Dixon-Coles</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <BarChart3 className="h-4 w-4" />
                <span>Monte-Carlo & Elo</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <Brain className="h-4 w-4" />
                <span>Ensemble Learning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {!analysisResult ? (
          <>
            {/* SofaScore Import Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up">
              {/* Option 1: Copier-Coller (RECOMMANDÉ) */}
              <SofaScoreTextInput
                onDataLoaded={(home, away) => {
                  setHomeTeam(home);
                  setAwayTeam(away);
                }}
              />

              {/* Option 2: URL (peut ne pas fonctionner) */}
              <SofaScoreURLInput
                onDataLoaded={(home, away) => {
                  setHomeTeam(home);
                  setAwayTeam(away);
                }}
              />
            </div>

            {/* Team Input Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="animate-slide-up">
                <TeamStatsForm
                  team={homeTeam}
                  teamLabel="Équipe Domicile"
                  onChange={setHomeTeam}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <TeamStatsForm
                  team={awayTeam}
                  teamLabel="Équipe Extérieur"
                  onChange={setAwayTeam}
                />
              </div>
            </div>

            {/* System Improvements */}
            <SystemImprovements />

            {/* Analyze Button */}
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                size="lg"
                className="bg-gradient-pitch hover:bg-primary-glow shadow-strong px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="mr-2 h-5 w-5 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5" />
                    Lancer l'Analyse
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Analysis Results */}
            <div className="space-y-6">
              {/* Match Header */}
              <Card className="border-primary/30 bg-gradient-field shadow-strong">
                <CardHeader className="bg-gradient-pitch text-primary-foreground rounded-t-lg">
                  <CardTitle className="text-center text-2xl font-bold">
                    {analysisResult.homeTeam.name} vs {analysisResult.awayTeam.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Analyse complétée avec {analysisResult.confidence}% de confiance
                  </p>
                </CardContent>
              </Card>

              {/* 🏆 TOP 10 PRÉDICTIONS - LES PLUS FIABLES (85-88%) */}
              <Top10PredictionsPanel
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                homeOdds={1.25}  // TODO: Ajouter champs cotes dans le formulaire
                awayOdds={8.50}
                bankroll={1000}
              />

              {/* ⚡ PARIS PARFAITS - SEULEMENT LES MEILLEURS (ÉPURÉ) */}
              <PerfectBetsDisplay
                predictions={perfectBets}
                homeTeam={analysisResult.homeTeam.name}
                awayTeam={analysisResult.awayTeam.name}
              />

              {/* 🎯 OVER/UNDER ULTRA-PRÉCIS - Basé sur vraies moyennes */}
              <EnhancedOverUnderDisplay predictions={overUnderPredictions} />

              {/* Data Quality Indicator */}
              <DataQualityIndicator
                homeQuality={analysisResult.dataQuality?.home || { score: 0, level: 'poor', missingFields: [], recommendations: [] }}
                awayQuality={analysisResult.dataQuality?.away || { score: 0, level: 'poor', missingFields: [], recommendations: [] }}
                overallConfidence={analysisResult.dataQuality?.overall || 0}
              />

              <AnalysisResults 
                prediction={analysisResult.prediction} 
                confidence={analysisResult.confidence}
              />

              {/* Comprehensive Predictions */}
              {/* Temporairement désactivé - propriété 'comprehensive' n'existe pas sur AnalysisResult */}
              {/* <ComprehensivePredictions
                predictions={analysisResult.comprehensive}
              /> */}

              {/* Data Requirements */}
              <DataRequirements 
                homeTeam={homeTeam}
                awayTeam={awayTeam}
              />

              {/* Low Risk Predictions */}
              <LowRiskPredictions 
                predictions={lowRiskPredictions}
                combinations={combinedPredictions}
              />

              {/* Perfect Predictions */}
              <PerfectPredictions 
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                league="premier-league"
              />

              {/* Ultra Precise Predictions */}
              <UltraPrecisePredictions 
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                league="premier-league"
              />

              {/* Real Data Validation */}
              <RealDataValidation />

              {/* Validation Metrics */}
              <ValidationMetrics />

              {/* Prediction Failure Analysis */}
              <PredictionFailureAnalysis />

              {/* Advanced Improvements */}
              <AdvancedImprovements />

              {/* Precision Improvement Roadmap */}
              <PrecisionImprovementRoadmap />

              {/* Reset Button */}
              <div className="text-center">
                <Button
                  onClick={resetAnalysis}
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold border-primary/50 hover:bg-primary/10"
                >
                  Nouvelle Analyse
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
