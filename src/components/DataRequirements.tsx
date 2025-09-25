import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  Target,
  BarChart3,
  Shield
} from 'lucide-react';

interface DataRequirementsProps {
  homeTeam: any;
  awayTeam: any;
}

export function DataRequirements({ homeTeam, awayTeam }: DataRequirementsProps) {
  // Fonction pour vérifier la disponibilité des données
  const checkDataAvailability = (team: any, field: string) => {
    const value = team[field];
    if (value === undefined || value === null || value === 0 || value === '') {
      return { available: false, level: 'missing' };
    }
    if (typeof value === 'number' && value > 0) {
      return { available: true, level: 'good' };
    }
    return { available: true, level: 'basic' };
  };

  // Données essentielles pour les prédictions de base
  const essentialData = [
    { field: 'name', label: 'Nom de l\'équipe', required: true },
    { field: 'sofascoreRating', label: 'Rating SofaScore', required: true },
    { field: 'matches', label: 'Nombre de matchs', required: true },
    { field: 'goalsPerMatch', label: 'Buts par match', required: true },
    { field: 'goalsConcededPerMatch', label: 'Buts encaissés par match', required: true }
  ];

  // Données importantes pour les prédictions avancées
  const importantData = [
    { field: 'possession', label: 'Possession (%)', required: false },
    { field: 'accuracyPerMatch', label: 'Précision des passes (%)', required: false },
    { field: 'shotsOnTargetPerMatch', label: 'Tirs cadrés par match', required: false },
    { field: 'bigChancesPerMatch', label: 'Grosses occasions par match', required: false }
  ];

  // Données optionnelles pour les prédictions spécialisées
  const optionalData = [
    { field: 'interceptionsPerMatch', label: 'Interceptions par match', required: false },
    { field: 'tacklesPerMatch', label: 'Tacles par match', required: false },
    { field: 'yellowCardsPerMatch', label: 'Cartons jaunes par match', required: false },
    { field: 'throwInsPerMatch', label: 'Touches par match', required: false },
    { field: 'clearancesPerMatch', label: 'Dégagements par match', required: false },
    { field: 'duelsWonPerMatch', label: 'Duels remportés par match', required: false },
    { field: 'offsidesPerMatch', label: 'Hors-jeux par match', required: false },
    { field: 'goalKicksPerMatch', label: 'Coups de pied de but par match', required: false },
    { field: 'redCardsPerMatch', label: 'Cartons rouges par match', required: false }
  ];

  const getStatusIcon = (level: string) => {
    switch (level) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'basic': return <Info className="h-4 w-4 text-blue-600" />;
      case 'missing': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusText = (level: string) => {
    switch (level) {
      case 'good': return 'Disponible';
      case 'basic': return 'Partiel';
      case 'missing': return 'Manquant';
      default: return 'Inconnu';
    }
  };

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'missing': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Calculer le score de complétude des données
  const calculateCompleteness = (team: any, dataList: any[]) => {
    const available = dataList.filter(item => 
      checkDataAvailability(team, item.field).available
    ).length;
    return Math.round((available / dataList.length) * 100);
  };

  const homeEssential = calculateCompleteness(homeTeam, essentialData);
  const awayEssential = calculateCompleteness(awayTeam, essentialData);
  const homeImportant = calculateCompleteness(homeTeam, importantData);
  const awayImportant = calculateCompleteness(awayTeam, importantData);

  const overallCompleteness = Math.round((homeEssential + awayEssential + homeImportant + awayImportant) / 4);

  return (
    <div className="space-y-6">
      {/* Score de complétude global */}
      <Card className="border-primary/30 bg-gradient-field shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Complétude des Données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Score global</span>
              <span className={`text-2xl font-bold ${
                overallCompleteness >= 80 ? 'text-green-600' :
                overallCompleteness >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {overallCompleteness}%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{homeEssential}%</div>
                <div className="text-sm text-muted-foreground">Données essentielles - Domicile</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary-glow">{awayEssential}%</div>
                <div className="text-sm text-muted-foreground">Données essentielles - Extérieur</div>
              </div>
            </div>

            <Alert className="border-accent/30">
              <AlertDescription>
                {overallCompleteness >= 80 ? 
                  '✅ Données excellentes - Toutes les prédictions disponibles' :
                  overallCompleteness >= 60 ?
                  '⚠️ Données correctes - Prédictions de base disponibles' :
                  '❌ Données insuffisantes - Prédictions limitées'
                }
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Données essentielles */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Données Essentielles (Recommandées)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {essentialData.map((item, index) => {
              const homeStatus = checkDataAvailability(homeTeam, item.field);
              const awayStatus = checkDataAvailability(awayTeam, item.field);
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(homeStatus.level)}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(homeStatus.level)}>
                      Domicile: {getStatusText(homeStatus.level)}
                    </Badge>
                    <Badge className={getStatusColor(awayStatus.level)}>
                      Extérieur: {getStatusText(awayStatus.level)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Données importantes */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Target className="h-5 w-5" />
            Données Importantes (Optionnelles)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {importantData.map((item, index) => {
              const homeStatus = checkDataAvailability(homeTeam, item.field);
              const awayStatus = checkDataAvailability(awayTeam, item.field);
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(homeStatus.level)}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(homeStatus.level)}>
                      Domicile: {getStatusText(homeStatus.level)}
                    </Badge>
                    <Badge className={getStatusColor(awayStatus.level)}>
                      Extérieur: {getStatusText(awayStatus.level)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Données optionnelles */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Shield className="h-5 w-5" />
            Données Optionnelles (Spécialisées)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optionalData.map((item, index) => {
              const homeStatus = checkDataAvailability(homeTeam, item.field);
              const awayStatus = checkDataAvailability(awayTeam, item.field);
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(homeStatus.level)}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(homeStatus.level)}>
                      Domicile: {getStatusText(homeStatus.level)}
                    </Badge>
                    <Badge className={getStatusColor(awayStatus.level)}>
                      Extérieur: {getStatusText(awayStatus.level)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card className="border-accent/30 bg-gradient-field shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overallCompleteness < 60 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Données insuffisantes :</strong> Ajoutez au minimum le nom, le rating, 
                  le nombre de matchs, et les buts marqués/encaissés pour chaque équipe.
                </AlertDescription>
              </Alert>
            )}
            
            {overallCompleteness >= 60 && overallCompleteness < 80 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Données correctes :</strong> Vous pouvez obtenir des prédictions de base. 
                  Ajoutez la possession et la précision pour plus de prédictions.
                </AlertDescription>
              </Alert>
            )}
            
            {overallCompleteness >= 80 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Données excellentes :</strong> Toutes les prédictions sont disponibles. 
                  Vous pouvez parier avec confiance sur les prédictions à faible risque.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
