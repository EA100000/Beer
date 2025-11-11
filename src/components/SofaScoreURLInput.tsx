import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TeamStats } from '@/types/football';
import { Link, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { convertToTeamStats } from '@/utils/sofascoreScraper';
import { fetchComparisonStats } from '@/utils/sofascoreAPI';

interface SofaScoreURLInputProps {
  onDataLoaded: (homeTeam: TeamStats, awayTeam: TeamStats) => void;
}

export function SofaScoreURLInput({ onDataLoaded }: SofaScoreURLInputProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFetchData = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validation URL
      if (!url) {
        throw new Error('Veuillez entrer une URL SofaScore');
      }

      if (!url.includes('sofascore.com') || !url.includes('/team/compare')) {
        throw new Error('URL invalide. Utilisez un lien de comparaison SofaScore');
      }

      // Appel au backend Netlify Function
      // En développement, on peut simuler les données
      const isDevelopment = window.location.hostname === 'localhost';

      // Utiliser l'API SofaScore directement (via proxy CORS)
      const result = await fetchComparisonStats(url);

      if (!result.success) {
        throw new Error(result.error || 'Impossible de récupérer les données');
      }

      // Convertir en TeamStats
      const homeTeam = convertToTeamStats(result.homeTeam);
      const awayTeam = convertToTeamStats(result.awayTeam);

      // Notifier le parent
      onDataLoaded(homeTeam, awayTeam);
      setSuccess(true);

      // Réinitialiser après 3 secondes
      setTimeout(() => setSuccess(false), 3000);

      // Code mort - pour éviter les erreurs de compilation
      if (false && isDevelopment) {
        // PRODUCTION : Appel au backend
        const response = await fetch(`/.netlify/functions/scrape-sofascore?url=${encodeURIComponent(url)}`);

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erreur inconnue');
        }

        onDataLoaded(data.homeTeam, data.awayTeam);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <CardTitle className="text-lg font-bold">
            Remplissage Automatique depuis SofaScore
          </CardTitle>
        </div>
        <p className="text-sm text-white/90 mt-1">
          Collez l'URL de comparaison SofaScore pour remplir automatiquement les statistiques des deux équipes
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link className="h-4 w-4" />
            <span>Exemple : https://www.sofascore.com/fr/football/team/compare?ids=...</span>
          </div>

          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://www.sofascore.com/fr/football/team/compare?ids=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              disabled={loading}
            />
            <Button
              onClick={handleFetchData}
              disabled={loading || !url}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Remplir Auto
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Données chargées avec succès ! Les formulaires ont été remplis automatiquement.
            </AlertDescription>
          </Alert>
        )}

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-800 space-y-1">
            <p className="font-medium">Comment obtenir l'URL de comparaison :</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Allez sur <a href="https://www.sofascore.com" target="_blank" rel="noopener noreferrer" className="underline">SofaScore.com</a></li>
              <li>Recherchez les deux équipes</li>
              <li>Cliquez sur "Comparer" entre les deux équipes</li>
              <li>Copiez l'URL de la page de comparaison</li>
              <li>Collez-la ici et cliquez sur "Remplir Auto"</li>
            </ol>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="text-sm text-green-800">
            <span className="font-medium">Gain de temps énorme !</span> Plus besoin de saisir manuellement 20+ champs par équipe.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
