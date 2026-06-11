import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';

const leagueUrl = process.env.MPP_LEAGUE_URL || 'https://mpp.football/leagues/mpp_challenge_UC8MVG4F';
const out = 'data/mpp.json';

function clean(s) { return String(s ?? '').replace(/\s+/g, ' ').trim(); }

function extractFromJson(value) {
  const seen = new Set();
  const candidates = [];

  function walk(node, path = '') {
    if (!node || typeof node !== 'object') return;
    if (seen.has(node)) return;
    seen.add(node);

    if (Array.isArray(node)) {
      const mapped = node.map((x, idx) => {
        if (!x || typeof x !== 'object') return null;
        const name = x.username || x.userName || x.nickname || x.name || x.displayName || x.pseudo || x.playerName || x.user?.username || x.user?.name;
        const points = x.points ?? x.score ?? x.totalPoints ?? x.pts ?? x.rankPoints;
        const rank = x.rank ?? x.position ?? x.ranking ?? idx + 1;
        if (name && points !== undefined) return { rank, name: clean(name), points, diff: x.diff ?? x.goalAverage ?? x.exactScores ?? x.perfectScores ?? '-' };
        return null;
      }).filter(Boolean);
      if (mapped.length >= 2) candidates.push(mapped);
      node.forEach((child, i) => walk(child, `${path}[${i}]`));
    } else {
      for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
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
    const m = line.match(/^(\d{1,3})[\.\s-]+(.+?)\s+(\d{1,5})\s*(pts?|points?)?$/i);
    if (m) rows.push({ rank: Number(m[1]), name: clean(m[2]), points: Number(m[3]), diff: '-' });
  }
  return rows;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const jsonResponses = [];

page.on('response', async response => {
  const ct = response.headers()['content-type'] || '';
  if (!ct.includes('application/json')) return;
  try { jsonResponses.push(await response.json()); } catch {}
});

let ranking = [];
let leagueName = 'MPP Challenge';
try {
  await page.goto(leagueUrl, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(8_000);

  for (const json of jsonResponses) {
    ranking = extractFromJson(json);
    if (ranking.length) break;
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
          ranking = extractFromJson(JSON.parse(value));
          if (ranking.length) break;
        } catch {}
      }
      if (ranking.length) break;
    }
    if (!ranking.length) ranking = extractFromText(state.text);
  }
} catch (err) {
  console.error('Erreur scrape MPP:', err.message);
} finally {
  await browser.close();
}

ranking = ranking
  .filter(p => p.name && String(p.name).length <= 50)
  .sort((a, b) => Number(a.rank || 9999) - Number(b.rank || 9999));

await fs.mkdir('data', { recursive: true });
await fs.writeFile(out, JSON.stringify({ updatedAt: new Date().toISOString(), leagueUrl, leagueName, ranking }, null, 2));
console.log(`Classement MPP écrit: ${ranking.length} lignes`);
