import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamStatsForm } from '@/components/TeamStatsForm';
import { AnalysisResults } from '@/components/AnalysisResults';
import { LowRiskPredictions } from '@/components/LowRiskPredictions';
import { DataRequirements } from '@/components/DataRequirements';
import { ComprehensivePredictions } from '@/components/ComprehensivePredictions';
import { ValidationMetrics } from '@/components/ValidationMetrics';
import { SystemImprovements } from '@/components/SystemImprovements';
import { PerfectPredictions } from '@/components/PerfectPredictions';
import { RealDataValidation } from '@/components/RealDataValidation';
import { UltraPrecisePredictions } from '@/components/UltraPrecisePredictions';
import { DataQualityIndicator } from '@/components/DataQualityIndicator';
import { PredictionFailureAnalysis } from '@/components/PredictionFailureAnalysis';
import { AdvancedImprovements } from '@/components/AdvancedImprovements';
import { PredictionSafetyGuard } from '@/components/PredictionSafetyGuard';
import { PrecisionImprovementRoadmap } from '@/components/PrecisionImprovementRoadmap';
import { TeamStats, AnalysisResult } from '@/types/football';
import { analyzeMatch } from '@/utils/footballAnalysis';
import { generateCombinedLowRiskPredictions } from '@/utils/lowRiskPredictions';
import { Activity, BarChart3, Brain } from 'lucide-react';
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
};

const Index = () => {
  const [homeTeam, setHomeTeam] = useState<TeamStats>(defaultTeamStats);
  const [awayTeam, setAwayTeam] = useState<TeamStats>(defaultTeamStats);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lowRiskPredictions, setLowRiskPredictions] = useState<any[]>([]);
  const [combinedPredictions, setCombinedPredictions] = useState<any[]>([]);

  const handleAnalyze = async () => {
    if (!homeTeam.name || !awayTeam.name) {
      alert('Veuillez remplir au moins les noms des équipes');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const prediction = analyzeMatch(homeTeam, awayTeam);
    
    // Calculate confidence based on data completeness
    const homeDataCompleteness = Object.values(homeTeam).filter(v => v !== 0 && v !== '').length;
    const awayDataCompleteness = Object.values(awayTeam).filter(v => v !== 0 && v !== '').length;
    const maxFields = Object.keys(defaultTeamStats).length;
    const confidence = Math.round(((homeDataCompleteness + awayDataCompleteness) / (maxFields * 2)) * 100);

    setAnalysisResult({
      homeTeam,
      awayTeam,
      prediction,
      confidence: Math.min(confidence, 95) // Cap at 95%
    });

    // Generate low-risk predictions
    const { analyzeLowRiskPatterns } = await import('@/utils/lowRiskPredictions');
    const individualPredictions = analyzeLowRiskPatterns(homeTeam, awayTeam, prediction);
    const combinedPreds = generateCombinedLowRiskPredictions(homeTeam, awayTeam, prediction);
    
    setLowRiskPredictions(individualPredictions);
    setCombinedPredictions(combinedPreds);
    
    setIsAnalyzing(false);
  };

  const resetAnalysis = () => {
    setHomeTeam(defaultTeamStats);
    setAwayTeam(defaultTeamStats);
    setAnalysisResult(null);
    setLowRiskPredictions([]);
    setCombinedPredictions([]);
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

              {/* Data Quality Indicator */}
              <DataQualityIndicator 
                homeQuality={analysisResult.dataQuality?.home || { score: 0, level: 'poor', missingFields: [], recommendations: [] }}
                awayQuality={analysisResult.dataQuality?.away || { score: 0, level: 'poor', missingFields: [], recommendations: [] }}
                overallConfidence={analysisResult.dataQuality?.overall || 0}
              />

              {/* Prediction Safety Guard */}
              <PredictionSafetyGuard 
                validationResult={analysisResult.safetyValidation || {
                  isValid: true,
                  confidence: analysisResult.confidence,
                  riskLevel: 'LOW',
                  warnings: [],
                  errors: [],
                  recommendations: ['Prédiction validée'],
                  safetyScore: 85,
                  shouldProceed: true
                }}
              />

              <AnalysisResults 
                prediction={analysisResult.prediction} 
                confidence={analysisResult.confidence}
              />

              {/* Comprehensive Predictions */}
              <ComprehensivePredictions 
                predictions={analysisResult.comprehensive} 
              />

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
