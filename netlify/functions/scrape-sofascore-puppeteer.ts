/**
 * Netlify Function avec Puppeteer pour scraper SofaScore
 * Cette fonction utilise un navigateur headless pour contourner les protections
 */

import type { Handler } from "@netlify/functions";
import chromium from 'chrome-aws-lambda';

interface TeamData {
  name: string;
  rating: number;
  matchesPlayed: number;
  goalsScored: number;
  goalsConceded: number;
  goalsPerMatch: number;
  possession: number;
  accuratePasses: number;
  passAccuracy: number;
  shotsOnTarget: number;
  bigChances: number;
  bigChancesMissed: number;
  cleanSheets: number;
  interceptions: number;
  tackles: number;
  clearances: number;
  yellowCards: number;
  redCards: number;
  fouls: number;
  offsides: number;
  corners: number;
}

const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const url = event.queryStringParameters?.url;

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL parameter is required' })
      };
    }

    // Lancer Puppeteer
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    // Aller sur la page SofaScore
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Attendre que les données se chargent
    await page.waitForTimeout(3000);

    // Extraire les données avec du JavaScript dans le navigateur
    const data = await page.evaluate(() => {
      // Cette fonction s'exécute dans le contexte de la page SofaScore

      // Fonction helper pour extraire du texte
      const getText = (selector: string): string => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim() || '';
      };

      // Fonction helper pour extraire un nombre
      const getNumber = (selector: string): number => {
        const text = getText(selector);
        const num = parseFloat(text.replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 0 : num;
      };

      // Extraire les noms des équipes
      const teamNames = document.querySelectorAll('.team-name, [class*="teamName"]');
      const homeTeamName = teamNames[0]?.textContent?.trim() || 'Home Team';
      const awayTeamName = teamNames[1]?.textContent?.trim() || 'Away Team';

      // Extraire toutes les statistiques
      // Note: Les sélecteurs CSS peuvent varier selon la version de SofaScore
      const stats = {
        homeTeam: {
          name: homeTeamName,
          rating: getNumber('[data-testid="home-rating"]'),
          matchesPlayed: getNumber('[data-testid="home-matches"]'),
          goalsScored: getNumber('[data-testid="home-goals-scored"]'),
          goalsConceded: getNumber('[data-testid="home-goals-conceded"]'),
          goalsPerMatch: getNumber('[data-testid="home-goals-per-match"]'),
          possession: getNumber('[data-testid="home-possession"]'),
          accuratePasses: getNumber('[data-testid="home-passes"]'),
          passAccuracy: getNumber('[data-testid="home-pass-accuracy"]'),
          shotsOnTarget: getNumber('[data-testid="home-shots-on-target"]'),
          bigChances: getNumber('[data-testid="home-big-chances"]'),
          bigChancesMissed: getNumber('[data-testid="home-big-chances-missed"]'),
          cleanSheets: getNumber('[data-testid="home-clean-sheets"]'),
          interceptions: getNumber('[data-testid="home-interceptions"]'),
          tackles: getNumber('[data-testid="home-tackles"]'),
          clearances: getNumber('[data-testid="home-clearances"]'),
          yellowCards: getNumber('[data-testid="home-yellow-cards"]'),
          redCards: getNumber('[data-testid="home-red-cards"]'),
          fouls: getNumber('[data-testid="home-fouls"]'),
          offsides: getNumber('[data-testid="home-offsides"]'),
          corners: getNumber('[data-testid="home-corners"]')
        },
        awayTeam: {
          name: awayTeamName,
          rating: getNumber('[data-testid="away-rating"]'),
          matchesPlayed: getNumber('[data-testid="away-matches"]'),
          goalsScored: getNumber('[data-testid="away-goals-scored"]'),
          goalsConceded: getNumber('[data-testid="away-goals-conceded"]'),
          goalsPerMatch: getNumber('[data-testid="away-goals-per-match"]'),
          possession: getNumber('[data-testid="away-possession"]'),
          accuratePasses: getNumber('[data-testid="away-passes"]'),
          passAccuracy: getNumber('[data-testid="away-pass-accuracy"]'),
          shotsOnTarget: getNumber('[data-testid="away-shots-on-target"]'),
          bigChances: getNumber('[data-testid="away-big-chances"]'),
          bigChancesMissed: getNumber('[data-testid="away-big-chances-missed"]'),
          cleanSheets: getNumber('[data-testid="away-clean-sheets"]'),
          interceptions: getNumber('[data-testid="away-interceptions"]'),
          tackles: getNumber('[data-testid="away-tackles"]'),
          clearances: getNumber('[data-testid="away-clearances"]'),
          yellowCards: getNumber('[data-testid="away-yellow-cards"]'),
          redCards: getNumber('[data-testid="away-red-cards"]'),
          fouls: getNumber('[data-testid="away-fouls"]'),
          offsides: getNumber('[data-testid="away-offsides"]'),
          corners: getNumber('[data-testid="away-corners"]')
        }
      };

      return stats;
    });

    await browser.close();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        success: true
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      })
    };
  }
};

export { handler };
