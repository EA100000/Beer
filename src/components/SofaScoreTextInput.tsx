import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TeamStats } from '@/types/football';
import { ClipboardPaste, Loader2, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { parseSofaScoreText } from '@/utils/sofascoreTextParser';

interface SofaScoreTextInputProps {
  onDataLoaded: (homeTeam: TeamStats, awayTeam: TeamStats) => void;
}

export function SofaScoreTextInput({ onDataLoaded }: SofaScoreTextInputProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleParse = () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!text.trim()) {
        throw new Error('Veuillez coller les statistiques SofaScore');
      }

      // Parser le texte
      const result = parseSofaScoreText(text);

      if (!result.success) {
        throw new Error(result.error || 'Impossible de parser les données');
      }

      // Notifier le parent
      onDataLoaded(result.homeTeam, result.awayTeam);
      setSuccess(true);

      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setSuccess(false);
        setText('');
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <ClipboardPaste className="h-5 w-5" />
          <CardTitle className="text-lg font-bold">
            Copier-Coller depuis SofaScore
          </CardTitle>
        </div>
        <p className="text-sm text-white/90 mt-1">
          Copiez toutes les statistiques depuis la page de comparaison SofaScore et collez-les ici
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Copy className="h-4 w-4" />
            <span>Sélectionnez et copiez TOUTES les statistiques depuis SofaScore</span>
          </div>

          <Textarea
            placeholder="Collez ici les statistiques copiées depuis SofaScore...

Exemple:
Equipe A Brugge et Equipe B ...
6,95 et 6,87
Matchs
4 4
Buts marqués
8 12
..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            disabled={loading}
          />

          <Button
            onClick={handleParse}
            disabled={loading || !text.trim()}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <ClipboardPaste className="h-4 w-4 mr-2" />
                Remplir les Formulaires
              </>
            )}
          </Button>
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
              ✅ Données chargées avec succès ! Les formulaires ont été remplis automatiquement.
            </AlertDescription>
          </Alert>
        )}

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-800 space-y-2">
            <p className="font-medium">📋 Instructions :</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Allez sur <a href="https://www.sofascore.com" target="_blank" rel="noopener noreferrer" className="underline">SofaScore.com</a></li>
              <li>Ouvrez une page de comparaison d'équipes</li>
              <li><strong>Sélectionnez TOUTES les statistiques</strong> (Ctrl+A ou Cmd+A)</li>
              <li>Copiez (Ctrl+C ou Cmd+C)</li>
              <li>Collez ici (Ctrl+V ou Cmd+V)</li>
              <li>Cliquez sur "Remplir les Formulaires"</li>
            </ol>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="text-sm text-green-800">
            <span className="font-medium">Solution 100% fonctionnelle !</span> Aucun blocage, aucune limitation.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
