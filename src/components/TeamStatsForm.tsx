import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TeamStats } from '@/types/football';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Brain,
  Target,
  Zap
} from 'lucide-react';

interface TeamStatsFormProps {
  team: TeamStats;
  teamLabel: string;
  onChange: (team: TeamStats) => void;
}

export function TeamStatsForm({ team, teamLabel, onChange }: TeamStatsFormProps) {
  const handleChange = (field: keyof TeamStats, value: string) => {
    const numValue = field === 'name' ? value : parseFloat(value) || 0;
    onChange({
      ...team,
      [field]: numValue
    });
  };

  const inputFields = [
    { 
      key: 'name', 
      label: 'Nom de l\'équipe', 
      type: 'text', 
      required: true,
      importance: 'critical',
      description: 'Identifiant unique de l\'équipe'
    },
    { 
      key: 'sofascoreRating', 
      label: 'Note Sofascore', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'high',
      description: 'Améliore significativement la précision des prédictions'
    },
    { 
      key: 'matches', 
      label: 'Matchs joués', 
      type: 'number',
      required: false,
      importance: 'high',
      description: 'Nombre de matchs de la saison'
    },
    { 
      key: 'goalsScored', 
      label: 'Buts marqués', 
      type: 'number',
      required: false,
      importance: 'high',
      description: 'Total des buts marqués'
    },
    { 
      key: 'goalsConceded', 
      label: 'Buts encaissés', 
      type: 'number',
      required: false,
      importance: 'high',
      description: 'Total des buts encaissés'
    },
    { 
      key: 'assists', 
      label: 'Passes décisives', 
      type: 'number',
      required: false,
      importance: 'medium',
      description: 'Total des passes décisives'
    },
    { 
      key: 'goalsPerMatch', 
      label: 'Buts par match', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'critical',
      description: 'Moyenne de buts marqués par match'
    },
    { 
      key: 'shotsOnTargetPerMatch', 
      label: 'Tirs cadrés/match', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'high',
      description: 'Moyenne de tirs cadrés par match'
    },
    { 
      key: 'bigChancesPerMatch', 
      label: 'Grosses occasions/match', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'medium',
      description: 'Moyenne de grosses occasions par match'
    },
    { 
      key: 'bigChancesMissedPerMatch', 
      label: 'Grosses occasions ratées/match', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'low',
      description: 'Moyenne de grosses occasions ratées par match'
    },
    { 
      key: 'possession', 
      label: 'Possession (%)', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'high',
      description: 'Pourcentage de possession moyenne'
    },
    { 
      key: 'accuracyPerMatch', 
      label: 'Précision/match (%)', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'medium',
      description: 'Pourcentage de précision des passes'
    },
    { 
      key: 'longBallsAccuratePerMatch', 
      label: 'Longues balles précises/match', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'low',
      description: 'Moyenne de longues balles précises par match'
    },
    { 
      key: 'cleanSheets', 
      label: 'Cage inviolée', 
      type: 'number',
      required: false,
      importance: 'medium',
      description: 'Nombre de matchs sans encaisser de but'
    },
    { 
      key: 'goalsConcededPerMatch', 
      label: 'Buts encaissés/match', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'critical',
      description: 'Moyenne de buts encaissés par match'
    },
    { 
      key: 'interceptionsPerMatch', 
      label: 'Interceptions/match', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'medium',
      description: 'Moyenne d\'interceptions par match'
    },
    { 
      key: 'tacklesPerMatch', 
      label: 'Tacles/match', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'high',
      description: 'Moyenne de tacles par match'
    },
    { 
      key: 'clearancesPerMatch', 
      label: 'Dégagements/match', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'medium',
      description: 'Moyenne de dégagements par match'
    },
    { 
      key: 'penaltyConceded', 
      label: 'Buts penalty concédés', 
      type: 'number',
      required: false,
      importance: 'low',
      description: 'Nombre de buts sur penalty concédés'
    },
    { 
      key: 'throwInsPerMatch', 
      label: 'Touches/match', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'medium',
      description: 'Moyenne de touches par match'
    },
    { 
      key: 'yellowCardsPerMatch', 
      label: 'Cartons jaunes/match', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'high',
      description: 'Moyenne de cartons jaunes par match'
    },
    { 
      key: 'duelsWonPerMatch', 
      label: 'Duels remportés/match', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'medium',
      description: 'Moyenne de duels remportés par match'
    },
    { 
      key: 'offsidesPerMatch', 
      label: 'Hors-jeux/match', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'low',
      description: 'Moyenne de hors-jeux par match'
    },
    { 
      key: 'goalKicksPerMatch', 
      label: 'Coups de pied de but/match', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'low',
      description: 'Moyenne de coups de pied de but par match'
    },
    { 
      key: 'redCardsPerMatch', 
      label: 'Cartons rouges/match', 
      type: 'number', 
      step: '0.1',
      required: false,
      importance: 'medium',
      description: 'Moyenne de cartons rouges par match'
    }
  ];

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-gray-500';
      default: return 'text-gray-600';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'critical': return <Target className="h-3 w-3" />;
      case 'high': return <Zap className="h-3 w-3" />;
      case 'medium': return <Info className="h-3 w-3" />;
      case 'low': return <AlertCircle className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full shadow-soft border-primary/20 bg-gradient-field">
      <CardHeader className="bg-gradient-pitch text-primary-foreground rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{teamLabel}</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Brain className="h-4 w-4" />
            <span>Champs optionnels - IA adaptative</span>
          </div>
        </div>
        <p className="text-sm text-primary-foreground/80 mt-2">
          L'algorithme s'adapte automatiquement aux données disponibles. 
          Plus vous renseignez de champs, plus les prédictions sont précises.
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Légende des niveaux d'importance */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Niveaux d'Importance des Champs</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Critique</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Élevé</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Moyen</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Faible</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inputFields.map(({ key, label, type, step, required, importance, description }) => {
            const hasValue = team[key as keyof TeamStats] && team[key as keyof TeamStats] !== 0;
            const isEmpty = !team[key as keyof TeamStats] || team[key as keyof TeamStats] === 0;
            
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label 
                    htmlFor={`${teamLabel}-${key}`} 
                    className={`text-sm font-medium ${required ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <div className="flex items-center gap-1">
                    {hasValue ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-gray-400" />
                    )}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getImportanceBadge(importance)}`}
                    >
                      {getImportanceIcon(importance)}
                      <span className="ml-1 capitalize">{importance}</span>
                    </Badge>
                  </div>
                </div>
                
                <Input
                  id={`${teamLabel}-${key}`}
                  type={type}
                  step={step}
                  value={team[key as keyof TeamStats] || ''}
                  onChange={(e) => handleChange(key as keyof TeamStats, e.target.value)}
                  className={`transition-all duration-200 focus:ring-2 focus:ring-primary/50 border-primary/30 bg-background/80 ${
                    hasValue 
                      ? 'border-green-300 bg-green-50/50' 
                      : isEmpty && importance === 'critical'
                      ? 'border-orange-300 bg-orange-50/50'
                      : 'border-gray-300'
                  }`}
                  placeholder={required ? `Obligatoire: ${label.toLowerCase()}` : `Optionnel: ${label.toLowerCase()}`}
                />
                
                <div className="text-xs text-muted-foreground">
                  {description}
                  {isEmpty && !required && (
                    <span className="block text-blue-600 mt-1">
                      💡 L'IA calculera automatiquement cette valeur
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Information sur l'adaptation automatique */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="space-y-2">
              <div className="text-sm font-medium text-green-800">
                Intelligence Adaptative Active
              </div>
              <div className="text-xs text-green-700 space-y-1">
                <p>
                  • <strong>Champs vides</strong> : L'IA utilise des corrélations statistiques pour les inférer
                </p>
                <p>
                  • <strong>Données partielles</strong> : L'algorithme s'adapte et optimise les prédictions
                </p>
                <p>
                  • <strong>Niveau de compétition</strong> : Détecté automatiquement pour ajuster les calculs
                </p>
                <p>
                  • <strong>Confiance dynamique</strong> : Ajustée selon la qualité des données disponibles
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}