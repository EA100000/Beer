import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TeamStats } from '@/types/football';

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
    { key: 'name', label: 'Nom de l\'équipe', type: 'text' },
    { key: 'sofascoreRating', label: 'Note Sofascore', type: 'number', step: '0.1' },
    { key: 'matches', label: 'Matchs joués', type: 'number' },
    { key: 'goalsScored', label: 'Buts marqués', type: 'number' },
    { key: 'goalsConceded', label: 'Buts encaissés', type: 'number' },
    { key: 'assists', label: 'Passes décisives', type: 'number' },
    { key: 'goalsPerMatch', label: 'Buts par match', type: 'number', step: '0.1' },
    { key: 'shotsOnTargetPerMatch', label: 'Tirs cadrés/match', type: 'number', step: '0.1' },
    { key: 'bigChancesPerMatch', label: 'Grosses occasions/match', type: 'number', step: '0.1' },
    { key: 'bigChancesMissedPerMatch', label: 'Grosses occasions ratées/match', type: 'number', step: '0.1' },
    { key: 'possession', label: 'Possession (%)', type: 'number', step: '0.1' },
    { key: 'accuracyPerMatch', label: 'Précision/match (%)', type: 'number', step: '0.1' },
    { key: 'longBallsAccuratePerMatch', label: 'Longues balles précises/match', type: 'number', step: '0.1' },
    { key: 'cleanSheets', label: 'Cage inviolée', type: 'number' },
    { key: 'goalsConcededPerMatch', label: 'Buts encaissés/match', type: 'number', step: '0.1' },
    { key: 'interceptionsPerMatch', label: 'Interceptions/match', type: 'number', step: '0.1' },
    { key: 'tacklesPerMatch', label: 'Tacles/match', type: 'number', step: '0.1' },
    { key: 'clearancesPerMatch', label: 'Dégagements/match', type: 'number', step: '0.1' },
    { key: 'penaltyConceded', label: 'Buts penalty concédés', type: 'number' },
    { key: 'throwInsPerMatch', label: 'Touches/match', type: 'number', step: '0.1' },
    { key: 'yellowCardsPerMatch', label: 'Cartons jaunes/match', type: 'number', step: '0.1' },
    { key: 'duelsWonPerMatch', label: 'Duels remportés/match', type: 'number', step: '0.1' },
    { key: 'offsidesPerMatch', label: 'Hors-jeux/match', type: 'number', step: '0.1' },
    { key: 'goalKicksPerMatch', label: 'Coups de pied de but/match', type: 'number', step: '0.1' },
    { key: 'redCardsPerMatch', label: 'Cartons rouges/match', type: 'number', step: '0.1' }
  ];

  return (
    <Card className="w-full shadow-soft border-primary/20 bg-gradient-field">
      <CardHeader className="bg-gradient-pitch text-primary-foreground rounded-t-lg">
        <CardTitle className="text-xl font-bold">{teamLabel}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inputFields.map(({ key, label, type, step }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`${teamLabel}-${key}`} className="text-sm font-medium text-foreground">
                {label}
              </Label>
              <Input
                id={`${teamLabel}-${key}`}
                type={type}
                step={step}
                value={team[key as keyof TeamStats]}
                onChange={(e) => handleChange(key as keyof TeamStats, e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/50 border-primary/30 bg-background/80"
                placeholder={`Entrer ${label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}