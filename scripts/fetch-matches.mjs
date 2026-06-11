import fs from 'node:fs/promises';

const out = 'data/matches.json';
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const date = `${yyyy}-${mm}-${dd}`;

function mapFootballData(match) {
  return {
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

function mapWorldCup26(match) {
  const home = match.homeTeam || match.home_team || match.team1 || match.home || match.team_a || {};
  const away = match.awayTeam || match.away_team || match.team2 || match.away || match.team_b || {};
  return {
    utcDate: match.utcDate || match.date || match.datetime || match.kickoff || null,
    localTime: match.time || match.localTime || null,
    status: match.status || match.state || 'scheduled',
    group: match.group || match.stage || '',
    homeTeam: home.name_en || home.name || home.title || match.home_team_name || match.home || 'À définir',
    awayTeam: away.name_en || away.name || away.title || match.away_team_name || match.away || 'À définir',
    homeScore: match.homeScore ?? match.home_score ?? match.score1 ?? null,
    awayScore: match.awayScore ?? match.away_score ?? match.score2 ?? null
  };
}

async function fetchFootballData() {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) throw new Error('FOOTBALL_DATA_TOKEN absent');
  const url = `https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${date}&dateTo=${date}`;
  const res = await fetch(url, { headers: { 'X-Auth-Token': token } });
  if (!res.ok) throw new Error(`football-data.org HTTP ${res.status}`);
  const json = await res.json();
  return (json.matches || []).map(mapFootballData);
}

async function fetchOpenWorldCupApi() {
  const res = await fetch('https://worldcup26.ir/get/games');
  if (!res.ok) throw new Error(`worldcup26.ir HTTP ${res.status}`);
  const json = await res.json();
  const arr = Array.isArray(json) ? json : (json.data || json.games || json.matches || []);
  return arr
    .map(mapWorldCup26)
    .filter(m => {
      if (!m.utcDate) return false;
      const d = new Date(m.utcDate);
      if (Number.isNaN(d.getTime())) return false;
      return d.toISOString().slice(0, 10) === date;
    });
}

let matches = [];
let source = '';
try {
  matches = await fetchFootballData();
  source = 'football-data.org';
} catch (e1) {
  console.warn('football-data.org indisponible:', e1.message);
  try {
    matches = await fetchOpenWorldCupApi();
    source = 'worldcup26.ir';
  } catch (e2) {
    console.warn('worldcup26.ir indisponible:', e2.message);
  }
}

matches.sort((a, b) => new Date(a.utcDate || 0) - new Date(b.utcDate || 0));
await fs.mkdir('data', { recursive: true });
await fs.writeFile(out, JSON.stringify({ updatedAt: new Date().toISOString(), source, matches }, null, 2));
console.log(`Matches écrits: ${matches.length}`);
