import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OverUnderPrediction } from '@/utils/enhancedOverUnder';
import { TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle2, Shield } from 'lucide-react';

interface EnhancedOverUnderDisplayProps {
  predictions: OverUnderPrediction[];
}

export function EnhancedOverUnderDisplay({ predictions }: EnhancedOverUnderDisplayProps) {
  if (!predictions || predictions.length === 0) {
    return null;
  }

  // Séparer par niveau de confiance
  const highConfidence = predictions.filter(p => p.confidence >= 75);
  const mediumConfidence = predictions.filter(p => p.confidence >= 65 && p.confidence < 75);
  const lowConfidence = predictions.filter(p => p.confidence < 65);

  const marketIcons: Record<string, any> = {
    corners: '⚽',
    fouls: '⚠️',
    throwIns: '🤾',
    yellowCards: '🟨',
    goalKicks: '🥅',
    offsides: '🚩'
  };

  const marketNames: Record<string, string> = {
    corners: 'Corners',
    fouls: 'Fautes',
    throwIns: 'Touches',
    yellowCards: 'Cartons Jaunes',
    goalKicks: 'Dégagements',
    offsides: 'Hors-jeux'
  };

  const renderPrediction = (pred: OverUnderPrediction) => {
    const isOver = pred.prediction === 'OVER';
    const Icon = isOver ? TrendingUp : TrendingDown;
    const bgColor = isOver
      ? 'bg-gradient-to-r from-green-50 to-emerald-50'
      : 'bg-gradient-to-r from-blue-50 to-cyan-50';
    const borderColor = isOver ? 'border-green-300' : 'border-blue-300';
    const textColor = isOver ? 'text-green-700' : 'text-blue-700';

    // Badge de confiance
    let confidenceBadge = { color: '', text: '', variant: '' as any };
    if (pred.confidence >= 80) {
      confidenceBadge = { color: 'bg-green-600', text: 'Très Fiable', variant: 'default' };
    } else if (pred.confidence >= 75) {
      confidenceBadge = { color: 'bg-green-500', text: 'Fiable', variant: 'default' };
    } else if (pred.confidence >= 70) {
      confidenceBadge = { color: 'bg-yellow-500', text: 'Moyen', variant: 'secondary' };
    } else {
      confidenceBadge = { color: 'bg-orange-500', text: 'Prudence', variant: 'destructive' };
    }

    return (
      <div
        key={`${pred.market}-${pred.threshold}`}
        className={`p-4 rounded-lg border-2 ${borderColor} ${bgColor} transition-all hover:shadow-md`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{marketIcons[pred.market] || '📊'}</span>
            <div>
              <h4 className={`font-bold text-lg ${textColor}`}>
                {marketNames[pred.market] || pred.market}
              </h4>
              <p className="text-xs text-muted-foreground">
                Domicile: {pred.homeAvg} | Extérieur: {pred.awayAvg}
              </p>
            </div>
          </div>
          <Badge className={confidenceBadge.color}>
            {pred.confidence}%
          </Badge>
        </div>

        <div className={`flex items-center gap-3 mb-3 p-3 rounded-lg ${isOver ? 'bg-green-100' : 'bg-blue-100'}`}>
          <Icon className={`h-8 w-8 ${textColor}`} />
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${textColor}`}>
                {pred.prediction}
              </span>
              <span className="text-xl font-semibold text-gray-700">
                {pred.threshold}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Prédit: <strong>{pred.matchTotal}</strong> {' '}
              (Marge: <strong>+{pred.safetyMargin.toFixed(1)}</strong>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Target className="h-3 w-3 text-gray-500" />
          <span className="text-gray-600">
            Total prédit: {pred.matchTotal} = {pred.homeAvg} (Dom) + {pred.awayAvg} (Ext)
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full shadow-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6" />
          <div>
            <CardTitle className="text-2xl font-bold">
              🎯 Prédictions Over/Under Ultra-Précises
            </CardTitle>
            <p className="text-sm text-white/90 mt-1">
              Basées sur les vraies moyennes des équipes avec marges de sécurité
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-lg border-2 border-purple-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{highConfidence.length}</div>
            <div className="text-xs text-gray-600 mt-1">Haute Confiance (75%+)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{mediumConfidence.length}</div>
            <div className="text-xs text-gray-600 mt-1">Confiance Moyenne (65-74%)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{predictions.length}</div>
            <div className="text-xs text-gray-600 mt-1">Total Disponibles</div>
          </div>
        </div>

        {/* Prédictions haute confiance */}
        {highConfidence.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-bold text-green-700">
                🔥 Prédictions Très Fiables (75%+ confiance)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {highConfidence.map(renderPrediction)}
            </div>
          </div>
        )}

        {/* Prédictions confiance moyenne */}
        {mediumConfidence.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-bold text-yellow-700">
                ⚠️ Prédictions Moyennes (65-74% confiance)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mediumConfidence.map(renderPrediction)}
            </div>
          </div>
        )}

        {/* Prédictions confiance faible */}
        {lowConfidence.length > 0 && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Attention :</strong> {lowConfidence.length} prédiction(s) avec confiance {'<'}65% - Non recommandées
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Explications */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-900 space-y-2">
            <p className="font-bold">💡 Comment ça marche ?</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
              <li><strong>Moyenne Domicile + Moyenne Extérieur</strong> = Total prédit</li>
              <li><strong>Marge de sécurité</strong> : Distance minimum requise au seuil</li>
              <li><strong>Ajustement domicile/extérieur</strong> : +5% à domicile, -5% à l'extérieur</li>
              <li><strong>Seuils réels</strong> : Basés sur les cotes des bookmakers</li>
              <li><strong>Confiance</strong> : Calculée avec distance au seuil + stabilité des stats</li>
            </ul>
          </div>
        </div>

        {/* Avertissement */}
        <Alert className="border-orange-300 bg-orange-50">
          <Shield className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 text-sm">
            <strong>⚠️ Important :</strong> Ces prédictions sont basées sur les moyennes historiques.
            Les conditions du match (météo, enjeu, arbitre, blessures) peuvent influencer les résultats.
            Ne misez que ce que vous pouvez vous permettre de perdre.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
