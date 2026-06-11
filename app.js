const DATA_URLS = {
  mpp: 'data/mpp.json',
  matches: 'data/matches.json'
};

const flagMap = {
  'mexico': '🇲🇽', 'mexique': '🇲🇽', 'south africa': '🇿🇦', 'afrique du sud': '🇿🇦',
  'korea republic': '🇰🇷', 'south korea': '🇰🇷', 'corée du sud': '🇰🇷', 'czechia': '🇨🇿', 'tchéquie': '🇨🇿',
  'canada': '🇨🇦', 'bosnia and herzegovina': '🇧🇦', 'bosnie-herzégovine': '🇧🇦', 'bosnie': '🇧🇦',
  'usa': '🇺🇸', 'united states': '🇺🇸', 'états-unis': '🇺🇸', 'qatar': '🇶🇦', 'switzerland': '🇨🇭', 'suisse': '🇨🇭',
  'paraguay': '🇵🇾', 'brazil': '🇧🇷', 'brésil': '🇧🇷', 'france': '🇫🇷', 'argentina': '🇦🇷', 'argentine': '🇦🇷',
  'england': '🏴', 'angleterre': '🏴', 'spain': '🇪🇸', 'espagne': '🇪🇸', 'germany': '🇩🇪', 'allemagne': '🇩🇪',
  'portugal': '🇵🇹', 'japan': '🇯🇵', 'japon': '🇯🇵', 'morocco': '🇲🇦', 'maroc': '🇲🇦', 'tunisia': '🇹🇳', 'tunisie': '🇹🇳'
};

function $(id) { return document.getElementById(id); }
function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function flag(name, fallback) {
  if (fallback && /^https?:/i.test(fallback)) return `<img class="flag-img" src="${esc(fallback)}" alt="">`;
  return fallback || flagMap[String(name || '').toLowerCase()] || '⚽';
}
function fmtDate(value) {
  if (!value) return '--';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '--';
  return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

async function loadJson(url) {
  const res = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
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
    utcDate: event.date,
    localTime: event.date ? new Date(event.date).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }) : null,
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

async function loadEspnMatches() {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${todayKey()}&limit=100`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`ESPN: ${res.status}`);
  const json = await res.json();
  const matches = (json.events || []).map(mapEspnEvent);
  return { updatedAt: new Date().toISOString(), source: 'ESPN direct', matches };
}

function renderClock() {
  const now = new Date();
  $('clockTime').textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  $('clockDate').textContent = now.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' });
}

function renderRanking(data) {
  const players = Array.isArray(data?.ranking) ? data.ranking : [];
  $('leagueName').textContent = data?.leagueName || 'Classement';

  $('podium').innerHTML = players.slice(0, 3).map((p, i) => `
    <div class="podium-card">
      <div class="medal">${i + 1}</div>
      <div>
        <div class="podium-name">${esc(p.name)}</div>
        <div class="podium-points">${esc(p.points ?? '-')} points</div>
      </div>
    </div>`).join('') || '<div class="empty">Aucun classement disponible</div>';

  const maxRows = Math.max(8, Math.floor((window.innerHeight - 310) / 58));
  $('rankingBody').innerHTML = players.slice(0, maxRows).map((p, i) => `
    <tr>
      <td>${esc(p.rank ?? i + 1)}</td>
      <td><div class="player">${esc(p.name)}</div></td>
      <td>${esc(p.points ?? '-')}</td>
      <td>${esc(p.diff ?? p.delta ?? '-')}</td>
    </tr>`).join('') || `
    <tr><td colspan="4"><div class="empty">Le fichier <strong>data/mpp.json</strong> n'a pas encore de classement exploitable.</div></td></tr>`;
}

function normalizeStatus(status) {
  const s = String(status || '').toLowerCase();
  if (['live', 'in_play', 'playing', 'first_half', 'second_half', 'halftime'].some(x => s.includes(x))) return 'live';
  if (['finished', 'full_time', 'ft', 'terminé'].some(x => s.includes(x))) return 'finished';
  return 'scheduled';
}

function renderMatches(data) {
  const matches = Array.isArray(data?.matches) ? data.matches : [];
  const visible = matches.slice(0, 5);
  $('matches').innerHTML = visible.map(m => {
    const status = normalizeStatus(m.status);
    const score = (m.homeScore !== null && m.homeScore !== undefined && m.awayScore !== null && m.awayScore !== undefined)
      ? `${m.homeScore} - ${m.awayScore}` : 'vs';
    const time = m.localTime || (m.utcDate ? new Date(m.utcDate).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }) : '--:--');
    const badgeText = status === 'live' ? 'En direct' : status === 'finished' ? 'Terminé' : 'À venir';
    return `
      <article class="match-card ${status === 'live' ? 'live' : ''}">
        <div class="team home">
          <span class="flag">${flag(m.homeTeam, m.homeFlag)}</span>
          <span class="team-name">${esc(m.homeTeam || 'À définir')}</span>
        </div>
        <div class="center">
          <div class="score">${esc(score)}</div>
          <div class="time">${esc(time)}</div>
          <span class="badge ${status === 'live' ? 'live' : ''}">${badgeText}</span>
        </div>
        <div class="team away">
          <span class="team-name">${esc(m.awayTeam || 'À définir')}</span>
          <span class="flag">${flag(m.awayTeam, m.awayFlag)}</span>
        </div>
      </article>`;
  }).join('') || '<div class="empty">Aucun match aujourd’hui.<br>Le prochain passage automatique vérifiera à nouveau les données.</div>';
}

async function refresh() {
  try {
    const mpp = await loadJson(DATA_URLS.mpp);
    renderRanking(mpp);

    let matchesData = null;
    try {
      matchesData = await loadEspnMatches();
      $('status').textContent = 'Données chargées via ESPN';
    } catch (espnError) {
      console.warn('ESPN direct indisponible, utilisation du JSON local:', espnError);
      try {
        matchesData = await loadJson(DATA_URLS.matches);
        $('status').textContent = 'Données chargées via JSON local';
      } catch {
        matchesData = { matches: [] };
        $('status').textContent = 'Aucune donnée match disponible';
      }
    }

    renderMatches(matchesData);
    const updated = [mpp?.updatedAt, matchesData?.updatedAt].filter(Boolean).sort().pop();
    $('updatedAt').textContent = `Dernière mise à jour : ${fmtDate(updated)}`;
  } catch (err) {
    console.error(err);
    $('status').textContent = 'Erreur de chargement : vérifier data/mpp.json ou GitHub Actions';
  }
}

renderClock();
refresh();
setInterval(renderClock, 1000);
setInterval(refresh, 60_000);
