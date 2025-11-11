/**
 * Composant de sélection du contexte du match
 * Permet à l'utilisateur de spécifier l'enjeu, le niveau de compétition, etc.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { MatchContext, MatchImportance, CompetitionLevel } from '@/types/matchContext';
import { useState } from 'react';

interface MatchContextSelectorProps {
  onContextChange: (context: MatchContext) => void;
  initialContext?: MatchContext;
}

export function MatchContextSelector({ onContextChange, initialContext }: MatchContextSelectorProps) {
  const [context, setContext] = useState<MatchContext>(
    initialContext || {
      importance: 'CHAMPIONNAT',
      competitionLevel: 'PROFESSIONAL',
      isHomeTeamFightingRelegation: false,
      isAwayTeamFightingRelegation: false,
      isHomeTeamChampionshipContender: false,
      isAwayTeamChampionshipContender: false,
      isDerby: false,
      homeTeamMotivation: 70,
      awayTeamMotivation: 70,
    }
  );

  const updateContext = (updates: Partial<MatchContext>) => {
    const newContext = { ...context, ...updates };
    setContext(newContext);
    onContextChange(newContext);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contexte du Match</CardTitle>
        <CardDescription>
          Spécifiez l'enjeu et le contexte pour des prédictions ultra-précises
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enjeu du match */}
        <div className="space-y-2">
          <Label htmlFor="importance">Enjeu du Match</Label>
          <Select
            value={context.importance}
            onValueChange={(value: MatchImportance) => updateContext({ importance: value })}
          >
            <SelectTrigger id="importance">
              <SelectValue placeholder="Sélectionnez l'enjeu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AMICAL">Match Amical</SelectItem>
              <SelectItem value="CHAMPIONNAT">Championnat</SelectItem>
              <SelectItem value="COUPE_NATIONALE">Coupe Nationale</SelectItem>
              <SelectItem value="COUPE_INTERNATIONALE">Coupe Internationale (UCL, UEL)</SelectItem>
              <SelectItem value="QUALIFICATION">Match de Qualification</SelectItem>
              <SelectItem value="FINALE">Finale</SelectItem>
              <SelectItem value="PLAY_OFF">Play-off</SelectItem>
              <SelectItem value="DERBY">Derby</SelectItem>
              <SelectItem value="RELEGATION_BATTLE">Bataille de Relégation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Niveau de compétition */}
        <div className="space-y-2">
          <Label htmlFor="level">Niveau de Compétition</Label>
          <Select
            value={context.competitionLevel}
            onValueChange={(value: CompetitionLevel) => updateContext({ competitionLevel: value })}
          >
            <SelectTrigger id="level">
              <SelectValue placeholder="Sélectionnez le niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ELITE">Elite (Top 5 Ligues)</SelectItem>
              <SelectItem value="PROFESSIONAL">Professionnel</SelectItem>
              <SelectItem value="SEMI_PROFESSIONAL">Semi-Professionnel</SelectItem>
              <SelectItem value="AMATEUR">Amateur</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Derby */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Derby / Rivalité</Label>
            <div className="text-sm text-muted-foreground">
              Match entre équipes rivales
            </div>
          </div>
          <Switch
            checked={context.isDerby}
            onCheckedChange={(checked) => updateContext({ isDerby: checked })}
          />
        </div>

        {context.isDerby && (
          <div className="space-y-2 pl-4 border-l-2 border-primary">
            <Label htmlFor="rivalry">Intensité de la Rivalité</Label>
            <Select
              value={context.rivalryIntensity || 'MEDIUM'}
              onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME') =>
                updateContext({ rivalryIntensity: value })
              }
            >
              <SelectTrigger id="rivalry">
                <SelectValue placeholder="Intensité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Faible</SelectItem>
                <SelectItem value="MEDIUM">Moyenne</SelectItem>
                <SelectItem value="HIGH">Élevée</SelectItem>
                <SelectItem value="EXTREME">Extrême</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Contexte équipe domicile */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold">Équipe Domicile</h4>

          <div className="flex items-center justify-between">
            <Label>Course au Titre</Label>
            <Switch
              checked={context.isHomeTeamChampionshipContender}
              onCheckedChange={(checked) =>
                updateContext({ isHomeTeamChampionshipContender: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Lutte contre la Relégation</Label>
            <Switch
              checked={context.isHomeTeamFightingRelegation}
              onCheckedChange={(checked) =>
                updateContext({ isHomeTeamFightingRelegation: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Motivation</Label>
              <span className="text-sm font-medium">{context.homeTeamMotivation}/100</span>
            </div>
            <Slider
              value={[context.homeTeamMotivation]}
              onValueChange={([value]) => updateContext({ homeTeamMotivation: value })}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        {/* Contexte équipe extérieur */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold">Équipe Extérieur</h4>

          <div className="flex items-center justify-between">
            <Label>Course au Titre</Label>
            <Switch
              checked={context.isAwayTeamChampionshipContender}
              onCheckedChange={(checked) =>
                updateContext({ isAwayTeamChampionshipContender: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Lutte contre la Relégation</Label>
            <Switch
              checked={context.isAwayTeamFightingRelegation}
              onCheckedChange={(checked) =>
                updateContext({ isAwayTeamFightingRelegation: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Motivation</Label>
              <span className="text-sm font-medium">{context.awayTeamMotivation}/100</span>
            </div>
            <Slider
              value={[context.awayTeamMotivation]}
              onValueChange={([value]) => updateContext({ awayTeamMotivation: value })}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        {/* Info sur l'impact */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-900">
            <strong>Impact du contexte:</strong> Le système ajustera automatiquement les prédictions
            de corners, fautes, cartons et buts en fonction de l'enjeu du match. Par exemple, les
            finales ont tendance à avoir plus de cartons et moins de buts.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
