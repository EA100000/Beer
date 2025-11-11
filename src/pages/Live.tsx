import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TeamStats } from '@/types/football';
import { generateAllOverUnderPredictions, OverUnderPrediction } from '@/utils/enhancedOverUnder';
import { parseSofaScoreText } from '@/utils/sofascoreTextParser';
import { boostConfidenceWithML } from '@/utils/advancedConfidenceBooster';

interface LiveMatchData {
  homeScore: number;
  awayScore: number;
  minute: number;
  homePossession: number;
  awayPossession: number;
  homeOffsides: number;
  awayOffsides: number;
  homeCorners: number;
  awayCorners: number;
  homeFouls: number;
  awayFouls: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeTotalShots: number;
  awayTotalShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
}

interface ScorePrediction {
  homeGoals: number;
  awayGoals: number;
  confidence: number;
  reasoning: string;
}

interface BTTSPrediction {
  prediction: 'YES' | 'NO';
  confidence: number;
  reasoning: string;
  homeGoalProbability: number;
  awayGoalProbability: number;
}

interface LiveMatch {
  id: number;
  homeTeam: TeamStats | null;
  awayTeam: TeamStats | null;
  liveData: LiveMatchData;
  predictions: OverUnderPrediction[];
  scorePrediction: ScorePrediction | null;
  bttsPrediction: BTTSPrediction | null;
  livePredictions: {
    corners: OverUnderPrediction[];
    fouls: OverUnderPrediction[];
    yellowCards: OverUnderPrediction[];
    offsides: OverUnderPrediction[];
    totalShots: OverUnderPrediction[];
    goals: OverUnderPrediction[];
  };
  preMatchDataEntered: boolean;
}

const defaultLiveData: LiveMatchData = {
  homeScore: 0,
  awayScore: 0,
  minute: 0,
  homePossession: 0,
  awayPossession: 0,
  homeOffsides: 0,
  awayOffsides: 0,
  homeCorners: 0,
  awayCorners: 0,
  homeFouls: 0,
  awayFouls: 0,
  homeYellowCards: 0,
  awayYellowCards: 0,
  homeTotalShots: 0,
  awayTotalShots: 0,
  homeShotsOnTarget: 0,
  awayShotsOnTarget: 0,
};

export default function Live() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<LiveMatch[]>([
    { id: 1, homeTeam: null, awayTeam: null, liveData: { ...defaultLiveData }, predictions: [], scorePrediction: null, bttsPrediction: null, livePredictions: { corners: [], fouls: [], yellowCards: [], offsides: [], totalShots: [], goals: [] }, preMatchDataEntered: false },
    { id: 2, homeTeam: null, awayTeam: null, liveData: { ...defaultLiveData }, predictions: [], scorePrediction: null, bttsPrediction: null, livePredictions: { corners: [], fouls: [], yellowCards: [], offsides: [], totalShots: [], goals: [] }, preMatchDataEntered: false },
    { id: 3, homeTeam: null, awayTeam: null, liveData: { ...defaultLiveData }, predictions: [], scorePrediction: null, bttsPrediction: null, livePredictions: { corners: [], fouls: [], yellowCards: [], offsides: [], totalShots: [], goals: [] }, preMatchDataEntered: false },
    { id: 4, homeTeam: null, awayTeam: null, liveData: { ...defaultLiveData }, predictions: [], scorePrediction: null, bttsPrediction: null, livePredictions: { corners: [], fouls: [], yellowCards: [], offsides: [], totalShots: [], goals: [] }, preMatchDataEntered: false }
  ]);

  const [preMatchText, setPreMatchText] = useState<Record<number, string>>({});
  const [liveText, setLiveText] = useState<Record<number, string>>({});
  const [alertsTriggered, setAlertsTriggered] = useState<Record<number, { min35: boolean; min45: boolean; min80: boolean; min90: boolean }>>({});

  // Fonction pour jouer un son d'alerte
  const playAlert = () => {
    // Créer un beep sonore avec Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Fréquence du beep
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    // Triple beep pour attirer l'attention
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 800;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc2.start();
      osc2.stop(audioContext.currentTime + 0.5);
    }, 600);

    setTimeout(() => {
      const osc3 = audioContext.createOscillator();
      const gain3 = audioContext.createGain();
      osc3.connect(gain3);
      gain3.connect(audioContext.destination);
      osc3.frequency.value = 1000; // Plus aigu pour le dernier
      osc3.type = 'sine';
      gain3.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc3.start();
      osc3.stop(audioContext.currentTime + 0.5);
    }, 1200);
  };

  // Vérifier et déclencher les alertes selon la minute
  const checkAndTriggerAlerts = (matchId: number, minute: number) => {
    const alerts = alertsTriggered[matchId] || { min35: false, min45: false, min80: false, min90: false };

    // Alerte à 35' (10min avant mi-temps)
    if (minute >= 35 && minute < 45 && !alerts.min35) {
      playAlert();
      setAlertsTriggered(prev => ({
        ...prev,
        [matchId]: { ...alerts, min35: true }
      }));
      alert('⚠️ ALERTE 35\' - Il reste 10 minutes avant la mi-temps! Préparez vos paris mi-temps.');
    }

    // Alerte à 45' (mi-temps)
    if (minute >= 45 && minute < 50 && !alerts.min45) {
      playAlert();
      setAlertsTriggered(prev => ({
        ...prev,
        [matchId]: { ...alerts, min45: true }
      }));
      alert('⚽ MI-TEMPS (45\') - Consultez les prédictions spéciales mi-temps ci-dessous!');
    }

    // Alerte à 80' (10min avant fin)
    if (minute >= 80 && minute < 90 && !alerts.min80) {
      playAlert();
      setAlertsTriggered(prev => ({
        ...prev,
        [matchId]: { ...alerts, min80: true }
      }));
      alert('🔥 ALERTE 80\' - Il reste 10 minutes! Prédictions de fin de match ULTRA-SÉCURISÉES disponibles!');
    }

    // Alerte à 90' (fin de match)
    if (minute >= 90 && !alerts.min90) {
      playAlert();
      setAlertsTriggered(prev => ({
        ...prev,
        [matchId]: { ...alerts, min90: true }
      }));
      alert('⏱️ FIN DU MATCH (90\') - Match terminé! Vérifiez vos paris.');
    }
  };

  const loadPreMatchData = (matchId: number) => {
    const text = preMatchText[matchId];
    if (!text) return;

    const result = parseSofaScoreText(text);
    if (result.homeTeam && result.awayTeam) {
      setMatches(prev => prev.map(m =>
        m.id === matchId
          ? { ...m, homeTeam: result.homeTeam!, awayTeam: result.awayTeam!, preMatchDataEntered: true }
          : m
      ));
    }
  };

  const loadLiveData = (matchId: number) => {
    const text = liveText[matchId];
    if (!text) return;

    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    // Parser le texte live - extraire les valeurs numériques séquentiellement
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    // IMPORTANT: Préserver le score et la minute existants
    const liveData: LiveMatchData = {
      ...match.liveData  // Garder les données existantes (score, minute)
    };

    // Fonction pour extraire 2 nombres après une ligne keyword
    const extractTwoNumbers = (keyword: string): [number, number] | null => {
      const idx = lines.findIndex(l => l.toLowerCase().includes(keyword.toLowerCase()));
      if (idx === -1) return null;

      // Chercher dans la ligne suivante
      for (let i = idx + 1; i < Math.min(idx + 5, lines.length); i++) {
        const nums = lines[i].match(/(\d+)/g);
        if (nums && nums.length >= 2) {
          return [parseInt(nums[0]), parseInt(nums[1])];
        }
      }
      return null;
    };

    // Possession (format: ligne "49%" puis ligne "51%")
    const possIdx = lines.findIndex(l => l.toLowerCase().includes('possession'));
    if (possIdx !== -1 && lines[possIdx + 1] && lines[possIdx + 2]) {
      const home = lines[possIdx + 1].match(/(\d+)%/);
      const away = lines[possIdx + 2].match(/(\d+)%/);
      if (home && away) {
        liveData.homePossession = parseInt(home[1]);
        liveData.awayPossession = parseInt(away[1]);
      }
    }

    // Hors-jeu (format: 0Hors-jeu\n2)
    const offsideIdx = lines.findIndex(l => l.toLowerCase().includes('hors-jeu'));
    if (offsideIdx !== -1) {
      const offLine = lines[offsideIdx];
      const match1 = offLine.match(/^(\d+)/);
      const nextLine = lines[offsideIdx + 1];
      if (match1 && nextLine) {
        const match2 = nextLine.match(/^(\d+)/);
        if (match2) {
          liveData.homeOffsides = parseInt(match1[1]);
          liveData.awayOffsides = parseInt(match2[1]);
        }
      }
    }

    // Corners (format: 6Corners\n3)
    const cornerIdx = lines.findIndex(l => l.toLowerCase().includes('corners'));
    if (cornerIdx !== -1) {
      const cornerLine = lines[cornerIdx];
      const match1 = cornerLine.match(/^(\d+)/);
      const nextLine = lines[cornerIdx + 1];
      if (match1 && nextLine) {
        const match2 = nextLine.match(/^(\d+)/);
        if (match2) {
          liveData.homeCorners = parseInt(match1[1]);
          liveData.awayCorners = parseInt(match2[1]);
        }
      }
    }

    // Tirs totaux - Plusieurs formats possibles
    // Format 1: "Nombre total de tirs" avec ligne suivante "9 1"
    // Format 2: "14 Nombre total de tirs" puis ligne "9"
    // Format 3: Juste "Tirs" avec format séquentiel
    let shotsIdx = lines.findIndex(l => l.toLowerCase().includes('nombre total de tirs'));
    if (shotsIdx !== -1) {
      // Format séquentiel: ligne actuelle a un chiffre, ligne suivante a l'autre
      const currentLine = lines[shotsIdx];
      const match1 = currentLine.match(/^(\d+)/);

      if (match1) {
        // Format: "14 Nombre total de tirs" puis ligne "9"
        const nextLine = lines[shotsIdx + 1];
        if (nextLine) {
          const match2 = nextLine.match(/^(\d+)/);
          if (match2) {
            liveData.homeTotalShots = parseInt(match1[1]);
            liveData.awayTotalShots = parseInt(match2[1]);
          }
        }
      } else {
        // Format: "Nombre total de tirs" puis ligne "9 1"
        const nextLine = lines[shotsIdx + 1];
        if (nextLine) {
          const nums = nextLine.match(/(\d+)/g);
          if (nums && nums.length >= 2) {
            liveData.homeTotalShots = parseInt(nums[0]);
            liveData.awayTotalShots = parseInt(nums[1]);
          }
        }
      }
    } else {
      // Essayer avec "Tirs" seul (format court)
      shotsIdx = lines.findIndex(l => l.toLowerCase() === 'tirs' || (l.toLowerCase().includes('tirs') && !l.toLowerCase().includes('cadré')));
      if (shotsIdx !== -1) {
        const shotsLine = lines[shotsIdx];
        const match1 = shotsLine.match(/^(\d+)/);
        const nextLine = lines[shotsIdx + 1];
        if (match1 && nextLine) {
          const match2 = nextLine.match(/^(\d+)/);
          if (match2) {
            liveData.homeTotalShots = parseInt(match1[1]);
            liveData.awayTotalShots = parseInt(match2[1]);
          }
        }
      }
    }

    // Tirs cadrés - Plusieurs formats possibles
    // Format 1: "a puerta" avec "3 1" sur même ligne
    // Format 2: "Tirs cadrés" format séquentiel
    // Format 3: "Tirs\na puerta" format séquentiel
    let onTargetIdx = lines.findIndex(l => l.toLowerCase().includes('a puerta') || l.toLowerCase().includes('cadrés') || l.toLowerCase().includes('cadres'));
    if (onTargetIdx !== -1) {
      const onTargetLine = lines[onTargetIdx];

      // D'abord essayer sur la même ligne
      const nums = onTargetLine.match(/(\d+)/g);
      if (nums && nums.length >= 2) {
        liveData.homeShotsOnTarget = parseInt(nums[0]);
        liveData.awayShotsOnTarget = parseInt(nums[1]);
      } else if (nums && nums.length === 1) {
        // Format séquentiel: un chiffre sur cette ligne, un sur la suivante
        const nextLine = lines[onTargetIdx + 1];
        if (nextLine) {
          const match2 = nextLine.match(/^(\d+)/);
          if (match2) {
            liveData.homeShotsOnTarget = parseInt(nums[0]);
            liveData.awayShotsOnTarget = parseInt(match2[1]);
          }
        }
      }
    }

    // Fautes (format: "9Fautes" puis ligne "10")
    const foulsIdx = lines.findIndex(l => l.toLowerCase().includes('fautes') && !l.toLowerCase().includes('hors'));
    if (foulsIdx !== -1) {
      const foulsLine = lines[foulsIdx];
      const homeMatch = foulsLine.match(/^(\d+)/);
      const nextLine = lines[foulsIdx + 1];
      if (homeMatch && nextLine) {
        const awayMatch = nextLine.match(/^(\d+)/);
        if (awayMatch) {
          liveData.homeFouls = parseInt(homeMatch[1]);
          liveData.awayFouls = parseInt(awayMatch[1]);
        }
      }
    }

    // Cartons jaunes (format: "0Cartons jaunes" puis ligne "2")
    const yellowIdx = lines.findIndex(l => l.toLowerCase().includes('cartons jaunes'));
    if (yellowIdx !== -1) {
      const yellowLine = lines[yellowIdx];
      const homeMatch = yellowLine.match(/^(\d+)/);
      const nextLine = lines[yellowIdx + 1];
      if (homeMatch && nextLine) {
        const awayMatch = nextLine.match(/^(\d+)/);
        if (awayMatch) {
          liveData.homeYellowCards = parseInt(homeMatch[1]);
          liveData.awayYellowCards = parseInt(awayMatch[1]);
        }
      }
    }

    // DEBUG: Afficher les données parsées
    console.log('📊 Données Live Chargées pour Match', matchId, ':', {
      Possession: `${liveData.homePossession}% - ${liveData.awayPossession}%`,
      Corners: `${liveData.homeCorners} - ${liveData.awayCorners}`,
      Fautes: `${liveData.homeFouls} - ${liveData.awayFouls}`,
      'Cartons Jaunes': `${liveData.homeYellowCards} - ${liveData.awayYellowCards}`,
      'Hors-jeux': `${liveData.homeOffsides} - ${liveData.awayOffsides}`,
      'Tirs Totaux': `${liveData.homeTotalShots} - ${liveData.awayTotalShots}`,
      'Tirs Cadrés': `${liveData.homeShotsOnTarget} - ${liveData.awayShotsOnTarget}`
    });

    setMatches(prev => prev.map(m =>
      m.id === matchId ? { ...m, liveData } : m
    ));
  };

  const predictFinalScore = (match: LiveMatch): ScorePrediction => {
    if (!match.homeTeam || !match.awayTeam) {
      return { homeGoals: 0, awayGoals: 0, confidence: 0, reasoning: '' };
    }

    const minutesLeft = 90 - match.liveData.minute;
    const currentHomeGoals = match.liveData.homeScore;
    const currentAwayGoals = match.liveData.awayScore;

    // Si très peu de temps restant, le score actuel = score final
    if (minutesLeft <= 5) {
      return {
        homeGoals: currentHomeGoals,
        awayGoals: currentAwayGoals,
        confidence: 95,
        reasoning: `Fin de match proche - Score actuel maintenu: ${currentHomeGoals}-${currentAwayGoals} (${match.liveData.minute}')`
      };
    }

    // Calculer le taux de buts par minute pour chaque équipe
    const homeGoalRate = currentHomeGoals / Math.max(1, match.liveData.minute);
    const awayGoalRate = currentAwayGoals / Math.max(1, match.liveData.minute);

    // Calculer aussi basé sur tirs cadrés (meilleur indicateur)
    const homeShotRate = match.liveData.homeShotsOnTarget / Math.max(1, match.liveData.minute);
    const awayShotRate = match.liveData.awayShotsOnTarget / Math.max(1, match.liveData.minute);

    // Prédire les buts restants (moyenne entre taux de buts et taux de tirs cadrés)
    const expectedHomeGoalsFromRate = homeGoalRate * minutesLeft;
    const expectedHomeGoalsFromShots = (homeShotRate * minutesLeft) * 0.3; // 30% de conversion
    const expectedHomeGoalsLeft = (expectedHomeGoalsFromRate + expectedHomeGoalsFromShots) / 2;

    const expectedAwayGoalsFromRate = awayGoalRate * minutesLeft;
    const expectedAwayGoalsFromShots = (awayShotRate * minutesLeft) * 0.3;
    const expectedAwayGoalsLeft = (expectedAwayGoalsFromRate + expectedAwayGoalsFromShots) / 2;

    // IMPORTANT: Toujours ajouter au score ACTUEL (jamais partir de 0)
    const finalHomeGoals = Math.max(currentHomeGoals, Math.round(currentHomeGoals + expectedHomeGoalsLeft));
    const finalAwayGoals = Math.max(currentAwayGoals, Math.round(currentAwayGoals + expectedAwayGoalsLeft));

    let confidence = 60;
    if (match.liveData.minute > 75) confidence = 85;
    else if (match.liveData.minute > 60) confidence = 75;
    else if (match.liveData.minute > 30) confidence = 65;

    const reasoning = `Actuel: ${currentHomeGoals}-${currentAwayGoals} (${match.liveData.minute}') | Tirs cadrés: ${match.liveData.homeShotsOnTarget}-${match.liveData.awayShotsOnTarget} | ${minutesLeft}min restantes`;

    return { homeGoals: finalHomeGoals, awayGoals: finalAwayGoals, confidence, reasoning };
  };

  const predictBTTS = (match: LiveMatch): BTTSPrediction => {
    if (!match.homeTeam || !match.awayTeam) {
      return { prediction: 'NO', confidence: 0, reasoning: '', homeGoalProbability: 0, awayGoalProbability: 0 };
    }

    const minutesLeft = 90 - match.liveData.minute;
    const currentHomeGoals = match.liveData.homeScore;
    const currentAwayGoals = match.liveData.awayScore;

    // ========================================================================
    // SCÉNARIOS DÉJÀ DÉCIDÉS
    // ========================================================================

    // Si les deux équipes ont déjà marqué
    if (currentHomeGoals > 0 && currentAwayGoals > 0) {
      return {
        prediction: 'YES',
        confidence: 99,
        reasoning: `Les deux équipes ont déjà marqué (${currentHomeGoals}-${currentAwayGoals})`,
        homeGoalProbability: 100,
        awayGoalProbability: 100
      };
    }

    // Si une équipe n'a pas marqué et il reste < 5 minutes
    if (minutesLeft <= 5 && (currentHomeGoals === 0 || currentAwayGoals === 0)) {
      return {
        prediction: 'NO',
        confidence: 95,
        reasoning: `Moins de 5 minutes restantes - Une équipe n'a pas encore marqué (${currentHomeGoals}-${currentAwayGoals})`,
        homeGoalProbability: currentHomeGoals > 0 ? 100 : 20,
        awayGoalProbability: currentAwayGoals > 0 ? 100 : 20
      };
    }

    // ========================================================================
    // CALCUL DES PROBABILITÉS DE MARQUER
    // ========================================================================

    // Taux de buts pré-match (par 90 minutes)
    const homeGoalsRate = match.homeTeam.goalsPerMatch / 90;
    const awayGoalsRate = match.awayTeam.goalsPerMatch / 90;

    // Ajustement basé sur les données live (tirs cadrés = meilleur indicateur)
    const homeShotsDangerFactor = match.liveData.homeShotsOnTarget > 5 ? 1.3 : match.liveData.homeShotsOnTarget > 3 ? 1.15 : 1.0;
    const awayShotsDangerFactor = match.liveData.awayShotsOnTarget > 5 ? 1.3 : match.liveData.awayShotsOnTarget > 3 ? 1.15 : 1.0;

    // Probabilité de marquer dans le temps restant
    const homeExpectedGoals = homeGoalsRate * minutesLeft * homeShotsDangerFactor;
    const awayExpectedGoals = awayGoalsRate * minutesLeft * awayShotsDangerFactor;

    // Convertir en probabilité (formule de Poisson simplifiée)
    const homeGoalProbability = currentHomeGoals > 0 ? 100 : Math.min(95, (1 - Math.exp(-homeExpectedGoals)) * 100);
    const awayGoalProbability = currentAwayGoals > 0 ? 100 : Math.min(95, (1 - Math.exp(-awayExpectedGoals)) * 100);

    // Probabilité que les DEUX marquent
    const bttsYesProbability = (homeGoalProbability * awayGoalProbability) / 100;

    // ========================================================================
    // DÉCISION BTTS YES/NO
    // ========================================================================

    let prediction: 'YES' | 'NO';
    let baseConfidence: number;

    if (bttsYesProbability > 50) {
      prediction = 'YES';
      baseConfidence = bttsYesProbability;
    } else {
      prediction = 'NO';
      baseConfidence = 100 - bttsYesProbability;
    }

    // Bonus de confiance selon le temps écoulé
    if (match.liveData.minute > 75) baseConfidence = Math.min(95, baseConfidence + 10);
    else if (match.liveData.minute > 60) baseConfidence = Math.min(90, baseConfidence + 5);

    // Bonus si une équipe domine fortement (possession)
    const possessionGap = Math.abs(match.liveData.homePossession - match.liveData.awayPossession);
    if (possessionGap > 30) {
      // Grande domination = moins de chances pour l'équipe faible de marquer
      if (prediction === 'NO') baseConfidence += 5;
    }

    // Bonus si beaucoup de tirs cadrés pour les deux
    const totalShotsOnTarget = match.liveData.homeShotsOnTarget + match.liveData.awayShotsOnTarget;
    if (totalShotsOnTarget > 10 && prediction === 'YES') baseConfidence += 8;

    baseConfidence = Math.min(95, baseConfidence);

    const reasoning = `Score: ${currentHomeGoals}-${currentAwayGoals} (${match.liveData.minute}') | ` +
                      `Prob Dom: ${Math.round(homeGoalProbability)}% | Prob Ext: ${Math.round(awayGoalProbability)}% | ` +
                      `Tirs cadrés: ${match.liveData.homeShotsOnTarget}-${match.liveData.awayShotsOnTarget}`;

    return {
      prediction,
      confidence: Math.round(baseConfidence),
      reasoning,
      homeGoalProbability: Math.round(homeGoalProbability),
      awayGoalProbability: Math.round(awayGoalProbability)
    };
  };

  const analyzeLiveMatch = (matchId: number) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || !match.homeTeam || !match.awayTeam) return;

    // ============================================================================
    // ANALYSE HYBRIDE: PRÉ-MATCH + LIVE = PRÉCISION MAXIMALE
    // ============================================================================

    // 1. Prédictions pré-match (basées sur moyennes historiques des équipes)
    const predictions = generateAllOverUnderPredictions(match.homeTeam, match.awayTeam);

    // 2. Prédiction du score final
    const scorePrediction = predictFinalScore(match);

    // 2b. Prédiction BTTS (Both Teams To Score)
    const bttsPrediction = predictBTTS(match);

    // 3. Prédictions HYBRIDES: Combiner tendances pré-match + réalité live
    const livePredictions = {
      corners: [] as OverUnderPrediction[],
      fouls: [] as OverUnderPrediction[],
      yellowCards: [] as OverUnderPrediction[],
      offsides: [] as OverUnderPrediction[],
      totalShots: [] as OverUnderPrediction[],
      goals: [] as OverUnderPrediction[]
    };

    const minutesPlayed = match.liveData.minute;
    const minutesLeft = 90 - minutesPlayed;
    const progressRatio = minutesPlayed / 90; // % du match joué

    // ============================================================================
    // CORNERS HYBRIDES: Données live + tendances pré-match
    // ============================================================================
    const currentTotalCorners = match.liveData.homeCorners + match.liveData.awayCorners;

    // Taux actuel du match
    const liveCornerRate = currentTotalCorners / Math.max(1, minutesPlayed);

    // Taux attendu selon pré-match (estimation basée sur possession et attaque)
    const homeCornerAvgPreMatch = Math.max(4, match.homeTeam.possession / 10 + match.homeTeam.goalsPerMatch * 0.8);
    const awayCornerAvgPreMatch = Math.max(4, match.awayTeam.possession / 10 + match.awayTeam.goalsPerMatch * 0.8);
    const preMatchCornerRate = (homeCornerAvgPreMatch + awayCornerAvgPreMatch) / 90;

    // FUSION: Plus on avance dans le match, plus on fait confiance au live
    const hybridCornerRate = (liveCornerRate * progressRatio) + (preMatchCornerRate * (1 - progressRatio));
    const projectedTotalCorners = Math.round(currentTotalCorners + (hybridCornerRate * minutesLeft));

    [8.5, 9.5, 10.5, 11.5, 12.5].forEach(threshold => {
      if (Math.abs(projectedTotalCorners - threshold) >= 1) {
        const prediction: 'OVER' | 'UNDER' = projectedTotalCorners > threshold ? 'OVER' : 'UNDER';
        const distance = Math.abs(projectedTotalCorners - threshold);

        // Confiance de base
        let confidence = 60 + (distance * 10);
        if (minutesPlayed > 60) confidence += 10;
        if (minutesPlayed > 75) confidence += 10;
        confidence = Math.min(95, confidence);

        // ⚡ BOOST ML: Algorithmes avancés pour atteindre 85-99%
        confidence = boostConfidenceWithML(
          confidence,
          projectedTotalCorners,
          threshold,
          prediction,
          'corners',
          match.liveData,
          { home: match.homeTeam, away: match.awayTeam }
        );

        livePredictions.corners.push({
          market: 'corners',
          predicted: projectedTotalCorners,
          threshold,
          prediction,
          confidence: Math.round(confidence),
          safetyMargin: distance,
          homeAvg: match.liveData.homeCorners,
          awayAvg: match.liveData.awayCorners,
          matchTotal: projectedTotalCorners
        });
      }
    });

    // ============================================================================
    // FAUTES HYBRIDES: Données live + tendances pré-match
    // ============================================================================
    const currentTotalFouls = match.liveData.homeFouls + match.liveData.awayFouls;

    // Taux actuel du match
    const liveFoulRate = currentTotalFouls / Math.max(1, minutesPlayed);

    // Taux attendu selon pré-match (données directes depuis SofaScore)
    const preMatchFoulRate = (match.homeTeam.foulsPerMatch + match.awayTeam.foulsPerMatch) / 90;

    // FUSION: Plus on avance dans le match, plus on fait confiance au live
    const hybridFoulRate = (liveFoulRate * progressRatio) + (preMatchFoulRate * (1 - progressRatio));
    const projectedTotalFouls = Math.round(currentTotalFouls + (hybridFoulRate * minutesLeft));

    [22.5, 24.5, 26.5, 28.5].forEach(threshold => {
      if (Math.abs(projectedTotalFouls - threshold) >= 1.5) {
        const prediction: 'OVER' | 'UNDER' = projectedTotalFouls > threshold ? 'OVER' : 'UNDER';
        const distance = Math.abs(projectedTotalFouls - threshold);

        // Confiance de base
        let confidence = 60 + (distance * 8);
        if (minutesPlayed > 60) confidence += 10;
        if (minutesPlayed > 75) confidence += 10;
        confidence = Math.min(95, confidence);

        // ⚡ BOOST ML: Algorithmes avancés pour atteindre 85-99%
        confidence = boostConfidenceWithML(
          confidence,
          projectedTotalFouls,
          threshold,
          prediction,
          'fouls',
          match.liveData,
          { home: match.homeTeam, away: match.awayTeam }
        );

        livePredictions.fouls.push({
          market: 'fouls',
          predicted: projectedTotalFouls,
          threshold,
          prediction,
          confidence: Math.round(confidence),
          safetyMargin: distance,
          homeAvg: match.liveData.homeFouls,
          awayAvg: match.liveData.awayFouls,
          matchTotal: projectedTotalFouls
        });
      }
    });

    // ============================================================================
    // CARTONS JAUNES HYBRIDES: Données live + tendances pré-match
    // ============================================================================
    const currentTotalYellow = match.liveData.homeYellowCards + match.liveData.awayYellowCards;

    // Taux actuel du match
    const liveYellowRate = currentTotalYellow / Math.max(1, minutesPlayed);

    // Taux attendu selon pré-match (données directes depuis SofaScore)
    const preMatchYellowRate = (match.homeTeam.yellowCardsPerMatch + match.awayTeam.yellowCardsPerMatch) / 90;

    // FUSION: Plus on avance dans le match, plus on fait confiance au live
    const hybridYellowRate = (liveYellowRate * progressRatio) + (preMatchYellowRate * (1 - progressRatio));
    const projectedTotalYellow = Math.round(currentTotalYellow + (hybridYellowRate * minutesLeft));

    [2.5, 3.5, 4.5, 5.5].forEach(threshold => {
      if (Math.abs(projectedTotalYellow - threshold) >= 0.5) {
        const prediction: 'OVER' | 'UNDER' = projectedTotalYellow > threshold ? 'OVER' : 'UNDER';
        const distance = Math.abs(projectedTotalYellow - threshold);

        // Confiance de base
        let confidence = 55 + (distance * 12);
        if (minutesPlayed > 60) confidence += 10;
        if (minutesPlayed > 75) confidence += 10;
        confidence = Math.min(95, confidence);

        // ⚡ BOOST ML: Algorithmes avancés pour atteindre 85-99%
        confidence = boostConfidenceWithML(
          confidence,
          projectedTotalYellow,
          threshold,
          prediction,
          'yellowCards',
          match.liveData,
          { home: match.homeTeam, away: match.awayTeam }
        );

        livePredictions.yellowCards.push({
          market: 'yellowCards',
          predicted: projectedTotalYellow,
          threshold,
          prediction,
          confidence: Math.round(confidence),
          safetyMargin: distance,
          homeAvg: match.liveData.homeYellowCards,
          awayAvg: match.liveData.awayYellowCards,
          matchTotal: projectedTotalYellow
        });
      }
    });

    // ============================================================================
    // HORS-JEUX (OFFSIDES) HYBRIDES: Données live + tendances pré-match
    // ============================================================================
    const currentTotalOffsides = match.liveData.homeOffsides + match.liveData.awayOffsides;

    // Taux actuel du match
    const liveOffsidesRate = currentTotalOffsides / Math.max(1, minutesPlayed);

    // Taux attendu selon pré-match (estimation basée sur offsides moyens)
    const homeOffsidesAvg = match.homeTeam.offsidesPerMatch || 2; // Estimation par défaut
    const awayOffsidesAvg = match.awayTeam.offsidesPerMatch || 2;
    const preMatchOffsidesRate = (homeOffsidesAvg + awayOffsidesAvg) / 90;

    // FUSION: Plus on avance dans le match, plus on fait confiance au live
    const hybridOffsidesRate = (liveOffsidesRate * progressRatio) + (preMatchOffsidesRate * (1 - progressRatio));
    const projectedTotalOffsides = Math.round(currentTotalOffsides + (hybridOffsidesRate * minutesLeft));

    [2.5, 3.5, 4.5, 5.5].forEach(threshold => {
      if (Math.abs(projectedTotalOffsides - threshold) >= 0.5) {
        const prediction: 'OVER' | 'UNDER' = projectedTotalOffsides > threshold ? 'OVER' : 'UNDER';
        const distance = Math.abs(projectedTotalOffsides - threshold);

        // Confiance de base
        let confidence = 55 + (distance * 10);
        if (minutesPlayed > 60) confidence += 8;
        if (minutesPlayed > 75) confidence += 8;
        confidence = Math.min(90, confidence);

        // ⚡ BOOST ML: Algorithmes avancés pour atteindre 85-99%
        confidence = boostConfidenceWithML(
          confidence,
          projectedTotalOffsides,
          threshold,
          prediction,
          'offsides',
          match.liveData,
          { home: match.homeTeam, away: match.awayTeam }
        );

        livePredictions.offsides.push({
          market: 'offsides',
          predicted: projectedTotalOffsides,
          threshold,
          prediction,
          confidence: Math.round(confidence),
          safetyMargin: distance,
          homeAvg: match.liveData.homeOffsides,
          awayAvg: match.liveData.awayOffsides,
          matchTotal: projectedTotalOffsides
        });
      }
    });

    // ============================================================================
    // TIRS TOTAUX HYBRIDES: Utilisation de possession + données live
    // ============================================================================
    const currentTotalShots = match.liveData.homeTotalShots + match.liveData.awayTotalShots;

    // Taux actuel du match
    const liveShotsRate = currentTotalShots / Math.max(1, minutesPlayed);

    // Ajustement basé sur POSSESSION LIVE (haute possession = plus de tirs)
    const possessionDominance = Math.abs(match.liveData.homePossession - match.liveData.awayPossession);
    const possessionBoost = possessionDominance > 20 ? 1.15 : possessionDominance > 10 ? 1.08 : 1.0;

    // Taux attendu selon pré-match (estimation: ~12-16 tirs par match en moyenne)
    const preMatchShotsRate = 14 / 90; // Moyenne standard

    // FUSION avec boost de possession
    const hybridShotsRate = ((liveShotsRate * progressRatio) + (preMatchShotsRate * (1 - progressRatio))) * possessionBoost;
    const projectedTotalShots = Math.round(currentTotalShots + (hybridShotsRate * minutesLeft));

    // Calcul de la PRÉCISION DES TIRS (shots on target / total shots) pour ajuster confiance
    const shotAccuracy = currentTotalShots > 0
      ? ((match.liveData.homeShotsOnTarget + match.liveData.awayShotsOnTarget) / currentTotalShots)
      : 0.35; // 35% précision par défaut

    [18.5, 20.5, 22.5, 24.5].forEach(threshold => {
      if (Math.abs(projectedTotalShots - threshold) >= 1.5) {
        const prediction: 'OVER' | 'UNDER' = projectedTotalShots > threshold ? 'OVER' : 'UNDER';
        const distance = Math.abs(projectedTotalShots - threshold);

        // Confiance de base + facteurs spéciaux (précision + possession)
        let confidence = 58 + (distance * 8);
        if (minutesPlayed > 60) confidence += 8;
        if (minutesPlayed > 75) confidence += 8;
        if (shotAccuracy > 0.4) confidence += 5;
        if (possessionDominance > 15) confidence += 5;
        confidence = Math.min(92, confidence);

        // ⚡ BOOST ML: Algorithmes avancés pour atteindre 85-99%
        confidence = boostConfidenceWithML(
          confidence,
          projectedTotalShots,
          threshold,
          prediction,
          'totalShots',
          match.liveData,
          { home: match.homeTeam, away: match.awayTeam }
        );

        livePredictions.totalShots.push({
          market: 'totalShots',
          predicted: projectedTotalShots,
          threshold,
          prediction,
          confidence: Math.round(confidence),
          safetyMargin: distance,
          homeAvg: match.liveData.homeTotalShots,
          awayAvg: match.liveData.awayTotalShots,
          matchTotal: projectedTotalShots
        });
      }
    });

    // ============================================================================
    // BUTS (GOALS) OVER/UNDER: Prédiction hybride du total de buts
    // ============================================================================
    const currentTotalGoals = match.liveData.homeScore + match.liveData.awayScore;

    // Taux actuel de buts par minute
    const liveGoalRate = currentTotalGoals / Math.max(1, minutesPlayed);

    // Taux attendu selon pré-match (moyenne des buts des deux équipes)
    const preMatchGoalRate = (match.homeTeam.goalsPerMatch + match.awayTeam.goalsPerMatch) / 90;

    // FUSION: Plus on avance dans le match, plus on fait confiance au live
    const hybridGoalRate = (liveGoalRate * progressRatio) + (preMatchGoalRate * (1 - progressRatio));
    const projectedTotalGoals = currentTotalGoals + (hybridGoalRate * minutesLeft);

    // Ajustement basé sur les tirs cadrés (indicateur de dangerosité)
    const totalShotsOnTarget = match.liveData.homeShotsOnTarget + match.liveData.awayShotsOnTarget;
    const dangerFactor = totalShotsOnTarget > 8 ? 1.1 : totalShotsOnTarget > 5 ? 1.05 : 1.0;
    const adjustedProjectedGoals = projectedTotalGoals * dangerFactor;

    [0.5, 1.5, 2.5, 3.5, 4.5].forEach(threshold => {
      const distance = Math.abs(adjustedProjectedGoals - threshold);

      // Seuil minimum de distance pour avoir confiance
      if (distance >= 0.3) {
        const prediction: 'OVER' | 'UNDER' = adjustedProjectedGoals > threshold ? 'OVER' : 'UNDER';

        // Confiance de base
        let confidence = 50 + (distance * 25);

        // Bonus selon le temps écoulé
        if (minutesPlayed > 75) confidence += 20;
        else if (minutesPlayed > 60) confidence += 15;
        else if (minutesPlayed > 45) confidence += 10;

        // Bonus si le score actuel est déjà très éloigné du seuil
        const currentDistance = Math.abs(currentTotalGoals - threshold);
        if (currentDistance > 1.5) confidence += 10;

        // Bonus si les tirs cadrés confirment la tendance
        if (totalShotsOnTarget > 10 && prediction === 'OVER') confidence += 8;
        if (totalShotsOnTarget < 4 && prediction === 'UNDER') confidence += 8;

        confidence = Math.min(95, confidence);

        // ⚡ BOOST ML: Algorithmes avancés pour atteindre 85-99%
        confidence = boostConfidenceWithML(
          confidence,
          adjustedProjectedGoals,
          threshold,
          prediction,
          'goals',
          match.liveData,
          { home: match.homeTeam, away: match.awayTeam }
        );

        // Scénarios ultra-garantis pour les buts
        // Si minute > 85 et score actuel déjà satisfait le pari
        if (minutesPlayed > 85) {
          if (prediction === 'OVER' && currentTotalGoals > threshold) {
            confidence = Math.max(confidence, 98);
          }
          if (prediction === 'UNDER' && currentTotalGoals < threshold && distance > 1) {
            confidence = Math.max(confidence, 97);
          }
        }

        livePredictions.goals.push({
          market: 'goals',
          predicted: Math.round(adjustedProjectedGoals * 10) / 10,
          threshold,
          prediction,
          confidence: Math.round(confidence),
          safetyMargin: distance,
          homeAvg: match.liveData.homeScore,
          awayAvg: match.liveData.awayScore,
          matchTotal: adjustedProjectedGoals
        });
      }
    });

    // MISE À JOUR: Conserver TOUTES les données existantes (score, minute, etc.)
    setMatches(prev => prev.map(m =>
      m.id === matchId
        ? {
            ...m,
            predictions,
            scorePrediction,
            bttsPrediction,
            livePredictions,
            // IMPORTANT: Ne PAS toucher à liveData (préserver score et minute)
          }
        : m
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <Radio className="h-6 w-6 text-red-500 animate-pulse" />
            <h1 className="text-3xl font-bold text-white">Paris Live - 4 Matchs</h1>
          </div>
          <div className="w-24"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {matches.map((match) => (
            <Card key={match.id} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Match {match.id}</span>
                  {match.homeTeam && match.awayTeam && (
                    <span className="text-sm font-normal">
                      {match.homeTeam.name} vs {match.awayTeam.name}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ÉTAPE 1: Données Pré-Match */}
                {!match.preMatchDataEntered && (
                  <div className="space-y-2">
                    <Label className="text-white font-semibold">1. Données Pré-Match (SofaScore)</Label>
                    <Textarea
                      placeholder="Collez les données pré-match de SofaScore..."
                      value={preMatchText[match.id] || ''}
                      onChange={(e) => setPreMatchText(prev => ({ ...prev, [match.id]: e.target.value }))}
                      className="bg-slate-700 text-white border-slate-600 h-24"
                    />
                    <Button
                      onClick={() => loadPreMatchData(match.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={!preMatchText[match.id]}
                    >
                      Charger Données Pré-Match
                    </Button>
                  </div>
                )}

                {/* ÉTAPE 2: Données Live */}
                {match.preMatchDataEntered && (
                  <>
                    <div className="bg-green-900/20 border border-green-700 rounded p-2">
                      <p className="text-green-400 text-xs">✓ Données pré-match chargées</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-semibold">2. Score & Minute</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          placeholder="Score Dom"
                          value={match.liveData.homeScore === 0 ? '0' : (match.liveData.homeScore || '')}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                            setMatches(prev => prev.map(m =>
                              m.id === match.id ? { ...m, liveData: { ...m.liveData, homeScore: val } } : m
                            ));
                          }}
                          className="bg-slate-700 text-white border-slate-600"
                        />
                        <Input
                          type="number"
                          placeholder="Score Ext"
                          value={match.liveData.awayScore === 0 ? '0' : (match.liveData.awayScore || '')}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                            setMatches(prev => prev.map(m =>
                              m.id === match.id ? { ...m, liveData: { ...m.liveData, awayScore: val } } : m
                            ));
                          }}
                          className="bg-slate-700 text-white border-slate-600"
                        />
                        <Input
                          type="number"
                          placeholder="Minute"
                          value={match.liveData.minute || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setMatches(prev => prev.map(m =>
                              m.id === match.id ? { ...m, liveData: { ...m.liveData, minute: val } } : m
                            ));
                            // Déclencher les alertes automatiques
                            checkAndTriggerAlerts(match.id, val);
                          }}
                          className="bg-slate-700 text-white border-slate-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-semibold">2b. Tirs (Saisie Manuelle - Optionnel)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="grid grid-cols-2 gap-1">
                          <Input
                            type="number"
                            placeholder="Tirs Dom"
                            value={match.liveData.homeTotalShots || ''}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setMatches(prev => prev.map(m =>
                                m.id === match.id ? { ...m, liveData: { ...m.liveData, homeTotalShots: val } } : m
                              ));
                            }}
                            className="bg-slate-700 text-white border-slate-600 text-xs"
                          />
                          <Input
                            type="number"
                            placeholder="Tirs Ext"
                            value={match.liveData.awayTotalShots || ''}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setMatches(prev => prev.map(m =>
                                m.id === match.id ? { ...m, liveData: { ...m.liveData, awayTotalShots: val } } : m
                              ));
                            }}
                            className="bg-slate-700 text-white border-slate-600 text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <Input
                            type="number"
                            placeholder="Cadrés Dom"
                            value={match.liveData.homeShotsOnTarget || ''}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setMatches(prev => prev.map(m =>
                                m.id === match.id ? { ...m, liveData: { ...m.liveData, homeShotsOnTarget: val } } : m
                              ));
                            }}
                            className="bg-slate-700 text-white border-slate-600 text-xs"
                          />
                          <Input
                            type="number"
                            placeholder="Cadrés Ext"
                            value={match.liveData.awayShotsOnTarget || ''}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setMatches(prev => prev.map(m =>
                                m.id === match.id ? { ...m, liveData: { ...m.liveData, awayShotsOnTarget: val } } : m
                              ));
                            }}
                            className="bg-slate-700 text-white border-slate-600 text-xs"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">💡 Entrez les tirs ici si le copier-coller ne fonctionne pas</p>
                    </div>

                    {/* Indicateurs de moments critiques */}
                    {match.liveData.minute > 0 && (
                      <div className="space-y-2">
                        {/* Alerte 35-45 (Approche mi-temps) */}
                        {match.liveData.minute >= 35 && match.liveData.minute < 45 && (
                          <div className="bg-yellow-900/30 border border-yellow-600 rounded p-3 animate-pulse">
                            <div className="flex items-center gap-2 text-yellow-400 font-bold">
                              <span className="text-2xl">⚠️</span>
                              <span>APPROCHE MI-TEMPS - {45 - match.liveData.minute} minutes restantes!</span>
                            </div>
                          </div>
                        )}

                        {/* Mi-temps 45-50 */}
                        {match.liveData.minute >= 45 && match.liveData.minute < 50 && (
                          <div className="bg-blue-900/30 border border-blue-600 rounded p-3">
                            <div className="flex items-center gap-2 text-blue-400 font-bold">
                              <span className="text-2xl">⚽</span>
                              <span>MI-TEMPS - Prédictions spéciales disponibles ci-dessous</span>
                            </div>
                          </div>
                        )}

                        {/* Alerte 80-90 (Fin de match proche) */}
                        {match.liveData.minute >= 80 && match.liveData.minute < 90 && (
                          <div className="bg-red-900/30 border border-red-600 rounded p-3 animate-pulse">
                            <div className="flex items-center gap-2 text-red-400 font-bold">
                              <span className="text-2xl">🔥</span>
                              <span>FIN DE MATCH PROCHE - {90 - match.liveData.minute} minutes restantes! Paris sécurisés disponibles!</span>
                            </div>
                          </div>
                        )}

                        {/* Match terminé 90+ */}
                        {match.liveData.minute >= 90 && (
                          <div className="bg-green-900/30 border border-green-600 rounded p-3">
                            <div className="flex items-center gap-2 text-green-400 font-bold">
                              <span className="text-2xl">⏱️</span>
                              <span>MATCH TERMINÉ - Vérifiez vos résultats!</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-white font-semibold">3. Stats Live (coller)</Label>
                      <Textarea
                        placeholder="Possession de balle&#10;49%&#10;51%&#10;0Hors-jeu&#10;2&#10;6Corners&#10;3&#10;..."
                        value={liveText[match.id] || ''}
                        onChange={(e) => setLiveText(prev => ({ ...prev, [match.id]: e.target.value }))}
                        className="bg-slate-700 text-white border-slate-600 h-32 text-xs"
                      />
                      <Button
                        onClick={() => loadLiveData(match.id)}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        disabled={!liveText[match.id]}
                      >
                        Charger Stats Live
                      </Button>
                    </div>

                    {/* Affichage Stats Live - TOUTES LES DONNÉES */}
                    <div className="grid grid-cols-3 gap-2 text-xs text-white">
                      <div className="bg-slate-700/30 p-2 rounded">
                        <div className="text-slate-400">Possession</div>
                        <div className="font-bold">{match.liveData.homePossession}% - {match.liveData.awayPossession}%</div>
                      </div>
                      <div className="bg-slate-700/30 p-2 rounded">
                        <div className="text-slate-400">Corners</div>
                        <div className="font-bold">{match.liveData.homeCorners} - {match.liveData.awayCorners}</div>
                      </div>
                      <div className="bg-slate-700/30 p-2 rounded">
                        <div className="text-slate-400">Fautes</div>
                        <div className="font-bold">{match.liveData.homeFouls} - {match.liveData.awayFouls}</div>
                      </div>
                      <div className="bg-slate-700/30 p-2 rounded">
                        <div className="text-slate-400">Cartons J.</div>
                        <div className="font-bold">{match.liveData.homeYellowCards} - {match.liveData.awayYellowCards}</div>
                      </div>
                      <div className="bg-slate-700/30 p-2 rounded">
                        <div className="text-slate-400">Hors-jeux</div>
                        <div className="font-bold">{match.liveData.homeOffsides} - {match.liveData.awayOffsides}</div>
                      </div>
                      <div className="bg-slate-700/30 p-2 rounded">
                        <div className="text-slate-400">Tirs</div>
                        <div className="font-bold">{match.liveData.homeTotalShots} - {match.liveData.awayTotalShots}</div>
                      </div>
                      <div className="bg-slate-700/30 p-2 rounded">
                        <div className="text-slate-400">Tirs cadrés</div>
                        <div className="font-bold">{match.liveData.homeShotsOnTarget} - {match.liveData.awayShotsOnTarget}</div>
                      </div>
                      <div className="bg-slate-700/30 p-2 rounded">
                        <div className="text-slate-400">Précision Tirs</div>
                        <div className="font-bold">
                          {match.liveData.homeTotalShots + match.liveData.awayTotalShots > 0
                            ? Math.round((match.liveData.homeShotsOnTarget + match.liveData.awayShotsOnTarget) / (match.liveData.homeTotalShots + match.liveData.awayTotalShots) * 100)
                            : 0}%
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => analyzeLiveMatch(match.id)}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      🔴 Analyser Live
                    </Button>

                    {/* Score Final Prédit + Over/Under Buts */}
                    {match.scorePrediction && (
                      <div className="space-y-2">
                        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-2 border-blue-600 rounded-lg p-4">
                          <h4 className="text-base font-bold text-blue-300 mb-3 flex items-center gap-2">
                            <span className="text-2xl">🎯</span>
                            <span>SCORE FINAL PRÉDIT</span>
                          </h4>
                          <div className="text-4xl font-bold text-white text-center mb-2">
                            {match.scorePrediction.homeGoals} - {match.scorePrediction.awayGoals}
                          </div>
                          <div className="text-sm text-center text-blue-200 font-semibold mb-2">
                            Confiance: {match.scorePrediction.confidence}%
                          </div>
                          <div className="text-xs text-slate-300 text-center">
                            {match.scorePrediction.reasoning}
                          </div>
                        </div>

                        {/* Over/Under Buts - TOP 2 Prédictions */}
                        {match.livePredictions.goals.length > 0 && (
                          <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-2 border-green-600 rounded-lg p-4">
                            <h4 className="text-base font-bold text-green-300 mb-3 flex items-center gap-2">
                              <span className="text-2xl">⚽</span>
                              <span>OVER/UNDER BUTS</span>
                            </h4>
                            <div className="space-y-2">
                              {match.livePredictions.goals
                                .sort((a, b) => b.confidence - a.confidence)
                                .slice(0, 2)
                                .map((pred, idx) => (
                                  <div
                                    key={`g-${idx}`}
                                    className={`${pred.confidence >= 90 ? 'bg-green-800/40 border-green-500' : 'bg-green-900/30 border-green-700'} border-2 p-3 rounded-lg`}
                                  >
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-white font-bold text-base">
                                        {pred.prediction} {pred.threshold} Buts
                                      </span>
                                      <span className={`text-lg font-bold ${pred.confidence >= 90 ? 'text-green-300' : 'text-green-400'}`}>
                                        {pred.confidence}%
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-300">
                                      Projeté: {pred.predicted} buts | Score actuel: {pred.homeAvg}-{pred.awayAvg}
                                    </div>
                                    {pred.confidence >= 95 && (
                                      <div className="mt-2 text-xs font-bold text-green-300 animate-pulse">
                                        🔥 ULTRA SÉCURISÉ - Confiance maximale!
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* BTTS (Both Teams To Score) */}
                        {match.bttsPrediction && (
                          <div className={`bg-gradient-to-r ${match.bttsPrediction.prediction === 'YES' ? 'from-yellow-900/40 to-amber-900/40 border-yellow-600' : 'from-gray-900/40 to-slate-900/40 border-gray-600'} border-2 rounded-lg p-4`}>
                            <h4 className={`text-base font-bold mb-3 flex items-center gap-2 ${match.bttsPrediction.prediction === 'YES' ? 'text-yellow-300' : 'text-gray-300'}`}>
                              <span className="text-2xl">🎲</span>
                              <span>LES DEUX ÉQUIPES MARQUENT (BTTS)</span>
                            </h4>
                            <div className={`${match.bttsPrediction.confidence >= 90 ? (match.bttsPrediction.prediction === 'YES' ? 'bg-yellow-800/40 border-yellow-500' : 'bg-gray-800/40 border-gray-500') : (match.bttsPrediction.prediction === 'YES' ? 'bg-yellow-900/30 border-yellow-700' : 'bg-gray-900/30 border-gray-700')} border-2 p-3 rounded-lg`}>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-white font-bold text-lg">
                                  {match.bttsPrediction.prediction === 'YES' ? '✅ OUI' : '❌ NON'} - Les deux marquent
                                </span>
                                <span className={`text-xl font-bold ${match.bttsPrediction.confidence >= 90 ? (match.bttsPrediction.prediction === 'YES' ? 'text-yellow-300' : 'text-gray-300') : (match.bttsPrediction.prediction === 'YES' ? 'text-yellow-400' : 'text-gray-400')}`}>
                                  {match.bttsPrediction.confidence}%
                                </span>
                              </div>
                              <div className="text-xs text-slate-300 mb-2">
                                {match.bttsPrediction.reasoning}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className={`p-2 rounded ${match.bttsPrediction.prediction === 'YES' ? 'bg-yellow-900/20' : 'bg-gray-900/20'}`}>
                                  <div className="text-slate-400">Prob. Domicile marque:</div>
                                  <div className="font-bold text-white">{match.bttsPrediction.homeGoalProbability}%</div>
                                </div>
                                <div className={`p-2 rounded ${match.bttsPrediction.prediction === 'YES' ? 'bg-yellow-900/20' : 'bg-gray-900/20'}`}>
                                  <div className="text-slate-400">Prob. Extérieur marque:</div>
                                  <div className="font-bold text-white">{match.bttsPrediction.awayGoalProbability}%</div>
                                </div>
                              </div>
                              {match.bttsPrediction.confidence >= 95 && (
                                <div className={`mt-2 text-xs font-bold animate-pulse ${match.bttsPrediction.prediction === 'YES' ? 'text-yellow-300' : 'text-gray-300'}`}>
                                  🔥 ULTRA SÉCURISÉ - Confiance maximale!
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Prédictions HYBRIDES (Live + Pré-Match) - TOUTES LES DONNÉES UTILISÉES */}
                    {(match.livePredictions.corners.length > 0 || match.livePredictions.fouls.length > 0 || match.livePredictions.yellowCards.length > 0 || match.livePredictions.offsides.length > 0 || match.livePredictions.totalShots.length > 0) && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-orange-300">⚡ PRÉDICTIONS HYBRIDES (Pré-Match + Live = Précision Maximale)</h4>

                        {match.livePredictions.corners.slice(0, 2).map((pred, idx) => (
                          <div key={`c-${idx}`} className="bg-orange-900/20 border border-orange-800 p-2 rounded text-xs">
                            <div className="flex justify-between text-white">
                              <span className="font-semibold">Corners {pred.prediction} {pred.threshold} (projeté: {pred.predicted})</span>
                              <span className="text-orange-400">{pred.confidence}%</span>
                            </div>
                          </div>
                        ))}

                        {match.livePredictions.fouls.slice(0, 2).map((pred, idx) => (
                          <div key={`f-${idx}`} className="bg-orange-900/20 border border-orange-800 p-2 rounded text-xs">
                            <div className="flex justify-between text-white">
                              <span className="font-semibold">Fautes {pred.prediction} {pred.threshold} (projeté: {pred.predicted})</span>
                              <span className="text-orange-400">{pred.confidence}%</span>
                            </div>
                          </div>
                        ))}

                        {match.livePredictions.yellowCards.slice(0, 2).map((pred, idx) => (
                          <div key={`y-${idx}`} className="bg-orange-900/20 border border-orange-800 p-2 rounded text-xs">
                            <div className="flex justify-between text-white">
                              <span className="font-semibold">Cartons J. {pred.prediction} {pred.threshold} (projeté: {pred.predicted})</span>
                              <span className="text-orange-400">{pred.confidence}%</span>
                            </div>
                          </div>
                        ))}

                        {match.livePredictions.offsides.slice(0, 2).map((pred, idx) => (
                          <div key={`o-${idx}`} className="bg-orange-900/20 border border-orange-800 p-2 rounded text-xs">
                            <div className="flex justify-between text-white">
                              <span className="font-semibold">Hors-jeux {pred.prediction} {pred.threshold} (projeté: {pred.predicted})</span>
                              <span className="text-orange-400">{pred.confidence}%</span>
                            </div>
                          </div>
                        ))}

                        {match.livePredictions.totalShots.slice(0, 2).map((pred, idx) => (
                          <div key={`s-${idx}`} className="bg-orange-900/20 border border-orange-800 p-2 rounded text-xs">
                            <div className="flex justify-between text-white">
                              <span className="font-semibold">Tirs Totaux {pred.prediction} {pred.threshold} (projeté: {pred.predicted})</span>
                              <span className="text-orange-400">{pred.confidence}%</span>
                            </div>
                            <div className="text-slate-400 text-xs mt-1">
                              Possession: {match.liveData.homePossession}%-{match.liveData.awayPossession}% | Précision: {Math.round((match.liveData.homeShotsOnTarget + match.liveData.awayShotsOnTarget) / Math.max(1, match.liveData.homeTotalShots + match.liveData.awayTotalShots) * 100)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Prédictions Pré-Match */}
                    {match.predictions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-slate-300">📋 Prédictions Pré-Match</h4>
                        {match.predictions.slice(0, 3).map((pred, idx) => (
                          <div key={idx} className="bg-slate-700/50 p-2 rounded text-xs">
                            <div className="flex justify-between text-white">
                              <span className="font-semibold">
                                {pred.market === 'fouls' ? 'Fautes' : pred.market === 'corners' ? 'Corners' : pred.market === 'yellowCards' ? 'Cartons J.' : pred.market.toUpperCase()}{' '}
                                {pred.prediction} {pred.threshold}
                              </span>
                              <span className={pred.confidence >= 90 ? 'text-green-400' : pred.confidence >= 75 ? 'text-yellow-400' : 'text-slate-400'}>
                                {pred.confidence}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
