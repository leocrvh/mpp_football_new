import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';

const leagueUrl = process.env.MPP_LEAGUE_URL || 'https://mpp.football/leagues/mpp_challenge_UC8MVG4F';
const cookieHeader = process.env.MPP_COOKIE || '';
const out = 'data/mpp.json';

function clean(s) { return String(s ?? '').replace(/\s+/g, ' ').trim(); }

function parseCookieHeader(header) {
  return String(header || '')
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const eq = part.indexOf('=');
      if (eq === -1) return null;
      const name = part.slice(0, eq).trim();
      const value = part.slice(eq + 1).trim();
      if (!name || !value) return null;
      return {
        name,
        value,
        domain: '.mpp.football',
        path: '/',
        httpOnly: false,
        secure: true,
        sameSite: 'Lax'
      };
    })
    .filter(Boolean);
}

function extractFromJson(value) {
  const seen = new Set();
  const candidates = [];

  function getFirst(obj, keys) {
    for (const key of keys) {
      if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== '') return obj[key];
    }
    return undefined;
  }

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (seen.has(node)) return;
    seen.add(node);

    if (Array.isArray(node)) {
      const mapped = node.map((x, idx) => {
        if (!x || typeof x !== 'object') return null;

        const user = x.user || x.player || x.participant || x.member || x.profile || {};
        const name = getFirst(x, [
          'username', 'userName', 'nickname', 'name', 'displayName', 'pseudo',
          'playerName', 'fullName', 'login'
        ]) || getFirst(user, [
          'username', 'userName', 'nickname', 'name', 'displayName', 'pseudo',
          'playerName', 'fullName', 'login'
        ]);

        const points = getFirst(x, [
          'points', 'score', 'totalPoints', 'pts', 'rankPoints', 'total', 'value'
        ]);

        const rank = getFirst(x, [
          'rank', 'position', 'ranking', 'place'
        ]) ?? idx + 1;

        const diff = getFirst(x, [
          'diff', 'difference', 'goalAverage', 'delta', 'exactScores', 'perfectScores'
        ]) ?? '-';

        if (name && points !== undefined && !Number.isNaN(Number(points))) {
          return { rank, name: clean(name), points, diff };
        }
        return null;
      }).filter(Boolean);

      if (mapped.length >= 2) candidates.push(mapped);
      node.forEach(walk);
    } else {
      Object.values(node).forEach(walk);
    }
  }

  walk(value);
  return candidates.sort((a, b) => b.length - a.length)[0] || [];
}

function extractFromText(text) {
  const lines = text.split('\n').map(clean).filter(Boolean);
  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Formats possibles : "1 John 45", "1. John 45 pts", etc.
    const m = line.match(/^(\d{1,3})[\.\s-]+(.+?)\s+(\d{1,5})\s*(pts?|points?)?$/i);
    if (m) rows.push({ rank: Number(m[1]), name: clean(m[2]), points: Number(m[3]), diff: '-' });
  }
  return rows;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });

const cookies = parseCookieHeader(cookieHeader);
if (cookies.length) {
  await context.addCookies(cookies);
  console.log(`Cookie MPP chargé: ${cookies.length} cookie(s)`);
} else {
  console.log('Aucun cookie MPP fourni. Si la ligue est privée, le classement restera à 0 ligne.');
}

const page = await context.newPage();
const jsonResponses = [];

page.on('response', async response => {
  const ct = response.headers()['content-type'] || '';
  const url = response.url();
  if (!ct.includes('application/json')) return;
  try {
    const json = await response.json();
    jsonResponses.push({ url, json });
  } catch {}
});

let ranking = [];
let leagueName = 'MPP Challenge';

try {
  await page.goto(leagueUrl, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(8_000);

  const currentUrl = page.url();
  const pageTitle = await page.title();
  const bodyText = await page.locator('body').innerText({ timeout: 5_000 }).catch(() => '');

  console.log(`Page MPP ouverte: ${currentUrl}`);
  console.log(`Titre page: ${pageTitle}`);
  console.log(`Réponses JSON capturées: ${jsonResponses.length}`);

  const loginVisible = /connexion|connect|login|sign in|se connecter/i.test(bodyText);
  if (loginVisible) console.log('Attention: la page semble encore demander une connexion.');

  for (const item of jsonResponses) {
    const found = extractFromJson(item.json);
    if (found.length > ranking.length) {
      ranking = found;
      console.log(`Candidat classement trouvé via JSON: ${found.length} lignes depuis ${item.url}`);
    }
  }

  if (!ranking.length) {
    const state = await page.evaluate(() => ({
      localStorage: Object.fromEntries(Object.entries(localStorage)),
      sessionStorage: Object.fromEntries(Object.entries(sessionStorage)),
      text: document.body.innerText,
      title: document.title
    }));

    leagueName = state.title || leagueName;

    for (const store of [state.localStorage, state.sessionStorage]) {
      for (const value of Object.values(store)) {
        try {
          const found = extractFromJson(JSON.parse(value));
          if (found.length > ranking.length) ranking = found;
        } catch {}
      }
    }

    if (!ranking.length) ranking = extractFromText(state.text);
  }

  // Debug utile si ça reste à 0. Le fichier n'est pas affiché par le site, mais il sera dans le runner.
  if (!ranking.length) {
    await fs.mkdir('debug', { recursive: true });
    await page.screenshot({ path: 'debug/mpp-page.png', fullPage: true });
    await fs.writeFile('debug/mpp-text.txt', bodyText.slice(0, 20000));
    console.log('Debug écrit: debug/mpp-page.png et debug/mpp-text.txt');
  }
} catch (err) {
  console.error('Erreur scrape MPP:', err.message);
} finally {
  await browser.close();
}

ranking = ranking
  .filter(p => p.name && String(p.name).length <= 80)
  .map((p, i) => ({
    rank: Number(p.rank || i + 1),
    name: clean(p.name),
    points: Number(p.points),
    diff: p.diff ?? '-'
  }))
  .sort((a, b) => Number(a.rank || 9999) - Number(b.rank || 9999));

await fs.mkdir('data', { recursive: true });
await fs.writeFile(out, JSON.stringify({
  updatedAt: new Date().toISOString(),
  leagueUrl,
  leagueName,
  ranking
}, null, 2));

console.log(`Classement MPP écrit: ${ranking.length} lignes`);
