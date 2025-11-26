/**
 * FORMULAIRE LIVE INTELLIGENT
 *
 * Coller les données brutes → Extraction automatique → Affichage parfait
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseIntelligentMatchData, ParsedMatchData } from '@/utils/intelligentMatchParser';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface IntelligentLiveFormProps {
  onDataParsed: (data: ParsedMatchData) => void;
}

export default function IntelligentLiveForm({ onDataParsed }: IntelligentLiveFormProps) {
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedMatchData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Inputs manuels pour score et minute
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [minute, setMinute] = useState(0);

  const handleParse = () => {
    const data = parseIntelligentMatchData(rawText);

    // Ajouter score et minute manuels
    data.homeScore = homeScore;
    data.awayScore = awayScore;
    data.minute = minute;

    setParsedData(data);
    setShowPreview(true);
  };

  const handleConfirm = () => {
    if (parsedData) {
      onDataParsed(parsedData);
    }
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 90) return 'text-green-600';
    if (quality >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityLabel = (quality: number) => {
    if (quality >= 90) return 'Excellente';
    if (quality >= 70) return 'Bonne';
    if (quality >= 50) return 'Moyenne';
    return 'Faible';
  };

  return (
    <div className="space-y-6">
      {/* ÉTAPE 1: COLLER LES DONNÉES */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Étape 1: Coller les données du match
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="rawText">Données brutes (Sofascore, etc.)</Label>
            <Textarea
              id="rawText"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Collez ici les données du match (possession, tirs, corners, etc.)..."
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Collez directement le texte de Sofascore ou tout autre format. L'IA va extraire automatiquement toutes les variables.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="homeScore">Score Domicile</Label>
              <Input
                id="homeScore"
                type="number"
                value={homeScore}
                onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="awayScore">Score Extérieur</Label>
              <Input
                id="awayScore"
                type="number"
                value={awayScore}
                onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="minute">Minute</Label>
              <Input
                id="minute"
                type="number"
                value={minute}
                onChange={(e) => setMinute(parseInt(e.target.value) || 0)}
                min="0"
                max="90"
              />
            </div>
          </div>

          <Button
            onClick={handleParse}
            disabled={!rawText.trim()}
            className="w-full"
            size="lg"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Extraire les données automatiquement
          </Button>
        </CardContent>
      </Card>

      {/* ÉTAPE 2: PRÉVISUALISATION */}
      {showPreview && parsedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Étape 2: Vérification des données extraites
              </span>
              <span className={`text-sm font-normal ${getQualityColor(parsedData.dataQuality)}`}>
                Qualité: {getQualityLabel(parsedData.dataQuality)} ({parsedData.dataQuality}%)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Alertes qualité */}
            {parsedData.dataQuality < 70 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Attention:</strong> Qualité des données moyenne ({parsedData.dataQuality}%).
                  Champs manquants: {parsedData.missingFields.join(', ')}.
                  Les valeurs manquantes seront mises à 0 par défaut.
                </AlertDescription>
              </Alert>
            )}

            {parsedData.dataQuality >= 90 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Excellent!</strong> Toutes les données clés ont été extraites avec succès.
                </AlertDescription>
              </Alert>
            )}

            {/* Aperçu des données */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Score */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-xs text-blue-600 font-semibold mb-1">SCORE</div>
                <div className="text-2xl font-bold text-blue-900">
                  {parsedData.homeScore} - {parsedData.awayScore}
                </div>
                <div className="text-xs text-blue-600">Minute {parsedData.minute}</div>
              </div>

              {/* Possession */}
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-xs text-purple-600 font-semibold mb-1">POSSESSION</div>
                <div className="text-2xl font-bold text-purple-900">
                  {parsedData.homePossession}% - {parsedData.awayPossession}%
                </div>
              </div>

              {/* xG */}
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-xs text-green-600 font-semibold mb-1">xG</div>
                <div className="text-2xl font-bold text-green-900">
                  {parsedData.homeXG.toFixed(2)} - {parsedData.awayXG.toFixed(2)}
                </div>
              </div>

              {/* Tirs */}
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-xs text-orange-600 font-semibold mb-1">TIRS TOTAUX</div>
                <div className="text-2xl font-bold text-orange-900">
                  {parsedData.homeTotalShots} - {parsedData.awayTotalShots}
                </div>
                <div className="text-xs text-orange-600">
                  Cadrés: {parsedData.homeShotsOnTarget} - {parsedData.awayShotsOnTarget}
                </div>
              </div>

              {/* Corners */}
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-xs text-red-600 font-semibold mb-1">CORNERS</div>
                <div className="text-2xl font-bold text-red-900">
                  {parsedData.homeCorners} - {parsedData.awayCorners}
                </div>
              </div>

              {/* Fautes */}
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-xs text-yellow-600 font-semibold mb-1">FAUTES</div>
                <div className="text-2xl font-bold text-yellow-900">
                  {parsedData.homeFouls} - {parsedData.awayFouls}
                </div>
              </div>

              {/* Passes */}
              <div className="bg-indigo-50 p-3 rounded-lg">
                <div className="text-xs text-indigo-600 font-semibold mb-1">PASSES</div>
                <div className="text-2xl font-bold text-indigo-900">
                  {parsedData.homePasses} - {parsedData.awayPasses}
                </div>
                <div className="text-xs text-indigo-600">
                  Précises: {parsedData.homeAccuratePasses} - {parsedData.awayAccuratePasses}
                </div>
              </div>

              {/* Tacles */}
              <div className="bg-cyan-50 p-3 rounded-lg">
                <div className="text-xs text-cyan-600 font-semibold mb-1">TACLES</div>
                <div className="text-2xl font-bold text-cyan-900">
                  {parsedData.homeTackles} - {parsedData.awayTackles}
                </div>
                <div className="text-xs text-cyan-600">
                  Gagnés: {parsedData.homeTacklesWonPercentage}% - {parsedData.awayTacklesWonPercentage}%
                </div>
              </div>

              {/* Gardien */}
              <div className="bg-pink-50 p-3 rounded-lg">
                <div className="text-xs text-pink-600 font-semibold mb-1">ARRÊTS</div>
                <div className="text-2xl font-bold text-pink-900">
                  {parsedData.homeGoalkeeperSaves} - {parsedData.awayGoalkeeperSaves}
                </div>
              </div>
            </div>

            {/* Détails supplémentaires (repliables) */}
            <details className="bg-gray-50 p-4 rounded-lg">
              <summary className="cursor-pointer font-semibold text-gray-700">
                Voir toutes les statistiques extraites ({Object.keys(parsedData).length - 2} variables)
              </summary>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div><span className="font-medium">Grosses occasions:</span> {parsedData.homeBigChances} - {parsedData.awayBigChances}</div>
                <div><span className="font-medium">Occasions réalisées:</span> {parsedData.homeBigChancesScored} - {parsedData.awayBigChancesScored}</div>
                <div><span className="font-medium">Occasions manquées:</span> {parsedData.homeBigChancesMissed} - {parsedData.awayBigChancesMissed}</div>
                <div><span className="font-medium">Tirs bloqués:</span> {parsedData.homeShotsBlocked} - {parsedData.awayShotsBlocked}</div>
                <div><span className="font-medium">Tirs surface:</span> {parsedData.homeShotsInsideBox} - {parsedData.awayShotsInsideBox}</div>
                <div><span className="font-medium">Tirs extérieur:</span> {parsedData.homeShotsOutsideBox} - {parsedData.awayShotsOutsideBox}</div>
                <div><span className="font-medium">Tirs poteau:</span> {parsedData.homeShotsOnPost} - {parsedData.awayShotsOnPost}</div>
                <div><span className="font-medium">Passes profondeur:</span> {parsedData.homeThroughBalls} - {parsedData.awayThroughBalls}</div>
                <div><span className="font-medium">Touches surface:</span> {parsedData.homeTouchesInBox} - {parsedData.awayTouchesInBox}</div>
                <div><span className="font-medium">Duels gagnés:</span> {parsedData.homeDuelsWon} - {parsedData.awayDuelsWon}</div>
                <div><span className="font-medium">Duels au sol:</span> {parsedData.homeGroundDuelsWon}/{parsedData.homeGroundDuelsTotal} - {parsedData.awayGroundDuelsWon}/{parsedData.awayGroundDuelsTotal}</div>
                <div><span className="font-medium">Duels aériens:</span> {parsedData.homeAerialDuelsWon}/{parsedData.homeAerialDuelsTotal} - {parsedData.awayAerialDuelsWon}/{parsedData.awayAerialDuelsTotal}</div>
                <div><span className="font-medium">Dribbles:</span> {parsedData.homeDribbles}/{parsedData.homeDribblesTotal} - {parsedData.awayDribbles}/{parsedData.awayDribblesTotal}</div>
                <div><span className="font-medium">Balles perdues:</span> {parsedData.homeBallsLost} - {parsedData.awayBallsLost}</div>
                <div><span className="font-medium">Interceptions:</span> {parsedData.homeInterceptions} - {parsedData.awayInterceptions}</div>
                <div><span className="font-medium">Récupérations:</span> {parsedData.homeRecoveries} - {parsedData.awayRecoveries}</div>
                <div><span className="font-medium">Dégagements:</span> {parsedData.homeClearances} - {parsedData.awayClearances}</div>
                <div><span className="font-medium">Coups francs:</span> {parsedData.homeFreeKicks} - {parsedData.awayFreeKicks}</div>
                <div><span className="font-medium">Buts évités:</span> {parsedData.homeGoalsPrevented.toFixed(2)} - {parsedData.awayGoalsPrevented.toFixed(2)}</div>
                <div><span className="font-medium">Coup de pied but:</span> {parsedData.homeGoalKicks} - {parsedData.awayGoalKicks}</div>
              </div>
            </details>

            {/* Boutons d'action */}
            <div className="flex gap-4">
              <Button
                onClick={() => setShowPreview(false)}
                variant="outline"
                className="flex-1"
              >
                Modifier les données
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1"
                size="lg"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirmer et analyser
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
