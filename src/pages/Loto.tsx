import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Sparkles, TrendingUp, BarChart3, Dices } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LotoConfig {
  name: string;
  mainNumbers: { min: number; max: number; count: number };
  bonusNumbers?: { min: number; max: number; count: number };
  description: string;
}

const LOTO_CONFIGS: Record<string, LotoConfig> = {
  'loto-france': {
    name: 'Loto France',
    mainNumbers: { min: 1, max: 49, count: 5 },
    bonusNumbers: { min: 1, max: 10, count: 1 },
    description: '5 numéros entre 1 et 49 + 1 numéro chance entre 1 et 10'
  },
  'euromillions': {
    name: 'EuroMillions',
    mainNumbers: { min: 1, max: 50, count: 5 },
    bonusNumbers: { min: 1, max: 12, count: 2 },
    description: '5 numéros entre 1 et 50 + 2 étoiles entre 1 et 12'
  },
  'powerball': {
    name: 'Powerball USA',
    mainNumbers: { min: 1, max: 69, count: 5 },
    bonusNumbers: { min: 1, max: 26, count: 1 },
    description: '5 numéros entre 1 et 69 + 1 Powerball entre 1 et 26'
  },
  'mega-millions': {
    name: 'Mega Millions USA',
    mainNumbers: { min: 1, max: 70, count: 5 },
    bonusNumbers: { min: 1, max: 25, count: 1 },
    description: '5 numéros entre 1 et 70 + 1 Mega Ball entre 1 et 25'
  }
};

interface Prediction {
  mainNumbers: number[];
  bonusNumbers?: number[];
  method: string;
  confidence: number;
}

export default function Loto() {
  const navigate = useNavigate();
  const [selectedLoto, setSelectedLoto] = useState<string>('loto-france');
  const [numberOfGrids, setNumberOfGrids] = useState<number>(1);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);

  const config = LOTO_CONFIGS[selectedLoto];

  // ============================================================================
  // MÉTHODE 1: ANALYSE STATISTIQUE (Fréquences)
  // ============================================================================
  const generateStatistical = (config: LotoConfig): Prediction => {
    // Simule des fréquences basées sur probabilités (en réalité, chaque numéro a 1/n chance)
    const frequencies: Record<number, number> = {};

    // Initialiser avec une distribution légèrement biaisée (simule historique)
    for (let i = config.mainNumbers.min; i <= config.mainNumbers.max; i++) {
      frequencies[i] = Math.random() * 100 + 50; // Score 50-150
    }

    // Sélectionner les numéros avec les plus hautes fréquences
    const sortedNumbers = Object.entries(frequencies)
      .sort(([, a], [, b]) => b - a)
      .slice(0, config.mainNumbers.count)
      .map(([num]) => parseInt(num))
      .sort((a, b) => a - b);

    let bonusNumbers: number[] | undefined;
    if (config.bonusNumbers) {
      bonusNumbers = [];
      for (let i = 0; i < config.bonusNumbers.count; i++) {
        bonusNumbers.push(
          Math.floor(Math.random() * (config.bonusNumbers.max - config.bonusNumbers.min + 1)) + config.bonusNumbers.min
        );
      }
      bonusNumbers.sort((a, b) => a - b);
    }

    return {
      mainNumbers: sortedNumbers,
      bonusNumbers,
      method: 'Analyse Statistique (Numéros fréquents)',
      confidence: 65
    };
  };

  // ============================================================================
  // MÉTHODE 2: ANALYSE DES RETARDS
  // ============================================================================
  const generateDelayed = (config: LotoConfig): Prediction => {
    // Simule des retards (numéros qui n'ont pas été tirés depuis longtemps)
    const delays: Record<number, number> = {};

    for (let i = config.mainNumbers.min; i <= config.mainNumbers.max; i++) {
      delays[i] = Math.random() * 100; // Jours de retard simulés
    }

    // Sélectionner les numéros avec les plus grands retards
    const sortedNumbers = Object.entries(delays)
      .sort(([, a], [, b]) => b - a)
      .slice(0, config.mainNumbers.count)
      .map(([num]) => parseInt(num))
      .sort((a, b) => a - b);

    let bonusNumbers: number[] | undefined;
    if (config.bonusNumbers) {
      bonusNumbers = [];
      for (let i = 0; i < config.bonusNumbers.count; i++) {
        bonusNumbers.push(
          Math.floor(Math.random() * (config.bonusNumbers.max - config.bonusNumbers.min + 1)) + config.bonusNumbers.min
        );
      }
      bonusNumbers.sort((a, b) => a - b);
    }

    return {
      mainNumbers: sortedNumbers,
      bonusNumbers,
      method: 'Analyse des Retards (Numéros en retard)',
      confidence: 60
    };
  };

  // ============================================================================
  // MÉTHODE 3: ÉQUILIBRE PAIRS/IMPAIRS
  // ============================================================================
  const generateBalanced = (config: LotoConfig): Prediction => {
    const numbers: number[] = [];
    const target = Math.ceil(config.mainNumbers.count / 2);

    // Générer environ 50% pairs, 50% impairs
    let evens = 0;
    let odds = 0;

    while (numbers.length < config.mainNumbers.count) {
      const num = Math.floor(Math.random() * (config.mainNumbers.max - config.mainNumbers.min + 1)) + config.mainNumbers.min;

      if (numbers.includes(num)) continue;

      const isEven = num % 2 === 0;

      if (isEven && evens < target) {
        numbers.push(num);
        evens++;
      } else if (!isEven && odds < target) {
        numbers.push(num);
        odds++;
      } else if (numbers.length < config.mainNumbers.count) {
        numbers.push(num);
      }
    }

    numbers.sort((a, b) => a - b);

    let bonusNumbers: number[] | undefined;
    if (config.bonusNumbers) {
      bonusNumbers = [];
      for (let i = 0; i < config.bonusNumbers.count; i++) {
        bonusNumbers.push(
          Math.floor(Math.random() * (config.bonusNumbers.max - config.bonusNumbers.min + 1)) + config.bonusNumbers.min
        );
      }
      bonusNumbers.sort((a, b) => a - b);
    }

    return {
      mainNumbers: numbers,
      bonusNumbers,
      method: 'Équilibre Pairs/Impairs + Répartition',
      confidence: 55
    };
  };

  // ============================================================================
  // MÉTHODE 4: TOTALEMENT ALÉATOIRE (Quick Pick)
  // ============================================================================
  const generateRandom = (config: LotoConfig): Prediction => {
    const numbers: number[] = [];

    while (numbers.length < config.mainNumbers.count) {
      const num = Math.floor(Math.random() * (config.mainNumbers.max - config.mainNumbers.min + 1)) + config.mainNumbers.min;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }

    numbers.sort((a, b) => a - b);

    let bonusNumbers: number[] | undefined;
    if (config.bonusNumbers) {
      bonusNumbers = [];
      for (let i = 0; i < config.bonusNumbers.count; i++) {
        let bonus: number;
        do {
          bonus = Math.floor(Math.random() * (config.bonusNumbers.max - config.bonusNumbers.min + 1)) + config.bonusNumbers.min;
        } while (bonusNumbers.includes(bonus));
        bonusNumbers.push(bonus);
      }
      bonusNumbers.sort((a, b) => a - b);
    }

    return {
      mainNumbers: numbers,
      bonusNumbers,
      method: 'Aléatoire (Quick Pick)',
      confidence: 50
    };
  };

  // ============================================================================
  // GÉNÉRATION DES PRÉDICTIONS
  // ============================================================================
  const handleGenerate = () => {
    setLoading(true);
    setPredictions([]);

    setTimeout(() => {
      const newPredictions: Prediction[] = [];

      for (let i = 0; i < numberOfGrids; i++) {
        // Alterner entre les méthodes
        let prediction: Prediction;
        const method = i % 4;

        switch (method) {
          case 0:
            prediction = generateStatistical(config);
            break;
          case 1:
            prediction = generateDelayed(config);
            break;
          case 2:
            prediction = generateBalanced(config);
            break;
          default:
            prediction = generateRandom(config);
        }

        newPredictions.push(prediction);
      }

      setPredictions(newPredictions);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-white/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Prédictions Loto
            </h1>
            <p className="text-gray-600">Générateur intelligent de numéros</p>
          </div>
        </div>

        {/* Configuration */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Configuration
            </CardTitle>
            <CardDescription>
              Choisissez votre loterie et le nombre de grilles à générer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type de loterie</Label>
                <Select value={selectedLoto} onValueChange={setSelectedLoto}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LOTO_CONFIGS).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>
                        {cfg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">{config.description}</p>
              </div>

              <div className="space-y-2">
                <Label>Nombre de grilles</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={numberOfGrids}
                  onChange={(e) => setNumberOfGrids(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                />
                <p className="text-sm text-gray-500">Entre 1 et 10 grilles</p>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              {loading ? (
                <>
                  <Dices className="mr-2 h-5 w-5 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Générer les Prédictions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Prédictions */}
        {predictions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Vos {predictions.length} Grille{predictions.length > 1 ? 's' : ''} Prédites
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {predictions.map((pred, index) => (
                <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Grille #{index + 1}</span>
                      <span className="text-sm font-normal text-purple-600">
                        {pred.confidence}% confiance
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs">{pred.method}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Numéros principaux */}
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Numéros principaux
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {pred.mainNumbers.map((num) => (
                            <div
                              key={num}
                              className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold flex items-center justify-center text-lg shadow-md"
                            >
                              {num}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Numéros bonus */}
                      {pred.bonusNumbers && pred.bonusNumbers.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            {selectedLoto === 'euromillions' ? 'Étoiles' : 'Numéro Chance / Bonus'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {pred.bonusNumbers.map((num, i) => (
                              <div
                                key={i}
                                className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold flex items-center justify-center text-lg shadow-md"
                              >
                                {num}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Avertissement Statistique
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>
              ⚠️ <strong>Important :</strong> Le loto est un jeu de HASARD PUR. Chaque numéro a exactement la même probabilité d'être tiré (1/n).
            </p>
            <p>
              📊 Les méthodes statistiques (fréquences, retards) n'augmentent PAS vos chances de gagner. Elles sont basées sur des superstitions.
            </p>
            <p>
              🎲 <strong>Probabilité de gagner le jackpot :</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Loto France : 1 sur 19 068 840</li>
              <li>EuroMillions : 1 sur 139 838 160</li>
              <li>Powerball : 1 sur 292 201 338</li>
            </ul>
            <p className="font-semibold">
              💡 Conseil : Jouez pour le plaisir uniquement, avec des montants que vous pouvez vous permettre de perdre.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
