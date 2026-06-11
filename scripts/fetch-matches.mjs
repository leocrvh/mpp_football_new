import fs from 'node:fs/promises';

const out = 'data/matches.json';

function parisDateKey(date = new Date(), offsetDays = 0) {
  const d = new Date(date.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(d).reduce((acc, p) => (acc[p.type] = p.value, acc), {});
  return `${parts.year}${parts.month}${parts.day}`;
}

function isoFromCompact(key) {
  return `${key.slice(0,4)}-${key.slice(4,6)}-${key.slice(6,8)}`;
}

function mapEspnEvent(event) {
  const comp = event?.competitions?.[0] || {};
  const competitors = comp.competitors || [];
  const home = competitors.find(c => c.homeAway === 'home') || competitors[0] || {};
  const away = competitors.find(c => c.homeAway === 'away') || competitors[1] || {};
  const state = event?.status?.type?.state || comp?.status?.type?.state || 'pre';
  const completed = event?.status?.type?.completed || comp?.status?.type?.completed || false;
  let status = 'scheduled';
  if (completed) status = 'finished';
  else if (state === 'in') status = 'live';

  return {
    id: event.id,
    utcDate: event.date,
    localTime: event.date ? new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }) : null,
    status,
    group: event.season?.slug || '',
    homeTeam: home.team?.displayName || home.team?.shortDisplayName || home.team?.abbreviation || 'À définir',
    awayTeam: away.team?.displayName || away.team?.shortDisplayName || away.team?.abbreviation || 'À définir',
    homeFlag: home.team?.logo || null,
    awayFlag: away.team?.logo || null,
    homeScore: home.score ?? null,
    awayScore: away.score ?? null,
    note: event.status?.type?.shortDetail || event.status?.type?.detail || ''
  };
}

async function fetchEspnDate(dateKey) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateKey}&limit=100`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ESPN ${dateKey} HTTP ${res.status}`);
  const json = await res.json();
  return (json.events || []).map(mapEspnEvent);
}

async function fetchEspn() {
  const keys = [parisDateKey(new Date(), -1), parisDateKey(new Date(), 0), parisDateKey(new Date(), 1)];
  const all = (await Promise.all(keys.map(fetchEspnDate))).flat();
  const seen = new Set();
  return all.filter(m => {
    const key = m.id || `${m.utcDate}-${m.homeTeam}-${m.awayTeam}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mapFootballData(match) {
  return {
    id: String(match.id || ''),
    utcDate: match.utcDate,
    localTime: match.utcDate ? new Date(match.utcDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }) : null,
    status: match.status,
    group: match.group || match.stage || '',
    homeTeam: match.homeTeam?.shortName || match.homeTeam?.name,
    awayTeam: match.awayTeam?.shortName || match.awayTeam?.name,
    homeScore: match.score?.fullTime?.home ?? match.score?.regularTime?.home ?? null,
    awayScore: match.score?.fullTime?.away ?? match.score?.regularTime?.away ?? null
  };
}

async function fetchFootballData() {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) throw new Error('FOOTBALL_DATA_TOKEN absent');
  const from = isoFromCompact(parisDateKey(new Date(), -1));
  const to = isoFromCompact(parisDateKey(new Date(), 1));
  const url = `https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${from}&dateTo=${to}`;
  const res = await fetch(url, { headers: { 'X-Auth-Token': token } });
  if (!res.ok) throw new Error(`football-data.org HTTP ${res.status}`);
  const json = await res.json();
  return (json.matches || []).map(mapFootballData);
}

let matches = [];
let source = '';
try {
  matches = await fetchEspn();
  source = 'ESPN';
} catch (e1) {
  console.warn('ESPN indisponible:', e1.message);
  try {
    matches = await fetchFootballData();
    source = 'football-data.org';
  } catch (e2) {
    console.warn('football-data.org indisponible:', e2.message);
  }
}

matches.sort((a, b) => new Date(a.utcDate || 0) - new Date(b.utcDate || 0));
await fs.mkdir('data', { recursive: true });
await fs.writeFile(out, JSON.stringify({
  updatedAt: new Date().toISOString(),
  source,
  window: 'veille 18h -> lendemain 06h Europe/Paris',
  matches
}, null, 2));
console.log(`Matches écrits: ${matches.length} depuis ${source || 'aucune source'}`);
