const DATA_URLS = {
  mpp: 'data/mpp.json',
  matches: 'data/matches.json'
};

const flagEmojiMap = {
  mexico: '🇲🇽', mexique: '🇲🇽',
  'south africa': '🇿🇦', 'afrique du sud': '🇿🇦',
  'korea republic': '🇰🇷', 'south korea': '🇰🇷', 'corée du sud': '🇰🇷', 'coree du sud': '🇰🇷',
  czechia: '🇨🇿', 'czech republic': '🇨🇿', tchéquie: '🇨🇿', tchequie: '🇨🇿',
  canada: '🇨🇦',
  'bosnia and herzegovina': '🇧🇦', 'bosnie-herzégovine': '🇧🇦', 'bosnie-herzegovine': '🇧🇦', bosnie: '🇧🇦',
  usa: '🇺🇸', 'united states': '🇺🇸', 'états-unis': '🇺🇸', 'etats-unis': '🇺🇸',
  qatar: '🇶🇦',
  switzerland: '🇨🇭', suisse: '🇨🇭',
  paraguay: '🇵🇾',
  brazil: '🇧🇷', brésil: '🇧🇷', bresil: '🇧🇷',
  france: '🇫🇷',
  argentina: '🇦🇷', argentine: '🇦🇷',
  england: '🏴', angleterre: '🏴',
  spain: '🇪🇸', espagne: '🇪🇸',
  germany: '🇩🇪', allemagne: '🇩🇪',
  portugal: '🇵🇹',
  japan: '🇯🇵', japon: '🇯🇵',
  morocco: '🇲🇦', maroc: '🇲🇦',
  tunisia: '🇹🇳', tunisie: '🇹🇳',
  netherlands: '🇳🇱', paysbas: '🇳🇱', 'pays-bas': '🇳🇱',
  belgium: '🇧🇪', belgique: '🇧🇪',
  croatia: '🇭🇷', croatie: '🇭🇷',
  denmark: '🇩🇰', danemark: '🇩🇰',
  poland: '🇵🇱', pologne: '🇵🇱',
  serbia: '🇷🇸', serbie: '🇷🇸',
  uruguay: '🇺🇾',
  ecuador: '🇪🇨', équateur: '🇪🇨', equateur: '🇪🇨',
  australia: '🇦🇺', australie: '🇦🇺',
  iran: '🇮🇷',
  saudiarabia: '🇸🇦', 'saudi arabia': '🇸🇦', 'arabie saoudite': '🇸🇦',
  senegal: '🇸🇳', sénégal: '🇸🇳',
  cameroon: '🇨🇲', cameroun: '🇨🇲',
  ghana: '🇬🇭',
  nigeria: '🇳🇬',
  ivorycoast: '🇨🇮', 'cote d ivoire': '🇨🇮', 'côte d’ivoire': '🇨🇮', 'côte d\'ivoire': '🇨🇮',
  chile: '🇨🇱', chili: '🇨🇱',
  colombia: '🇨🇴', colombie: '🇨🇴',
  peru: '🇵🇪', pérou: '🇵🇪', perou: '🇵🇪',
  wales: '🏴', galles: '🏴',
  scotland: '🏴', ecosse: '🏴', 'écosse': '🏴',
  turkey: '🇹🇷', turquie: '🇹🇷',
  ukraine: '🇺🇦',
  norway: '🇳🇴', norvège: '🇳🇴', norvege: '🇳🇴',
  sweden: '🇸🇪', suede: '🇸🇪', suède: '🇸🇪',
  austria: '🇦🇹', autriche: '🇦🇹'
};

const countryCodeMap = {
  mexico: 'mx', mexique: 'mx',
  'south africa': 'za', 'afrique du sud': 'za',
  'korea republic': 'kr', 'south korea': 'kr', 'corée du sud': 'kr', 'coree du sud': 'kr',
  czechia: 'cz', 'czech republic': 'cz', tchéquie: 'cz', tchequie: 'cz',
  canada: 'ca',
  'bosnia and herzegovina': 'ba', 'bosnie-herzégovine': 'ba', 'bosnie-herzegovine': 'ba', bosnie: 'ba',
  usa: 'us', 'united states': 'us', 'états-unis': 'us', 'etats-unis': 'us',
  qatar: 'qa',
  switzerland: 'ch', suisse: 'ch',
  paraguay: 'py',
  brazil: 'br', brésil: 'br', bresil: 'br',
  france: 'fr',
  argentina: 'ar', argentine: 'ar',
  england: 'gb-eng', angleterre: 'gb-eng',
  spain: 'es', espagne: 'es',
  germany: 'de', allemagne: 'de',
  portugal: 'pt',
  japan: 'jp', japon: 'jp',
  morocco: 'ma', maroc: 'ma',
  tunisia: 'tn', tunisie: 'tn',
  netherlands: 'nl', paysbas: 'nl', 'pays-bas': 'nl',
  belgium: 'be', belgique: 'be',
  croatia: 'hr', croatie: 'hr',
  denmark: 'dk', danemark: 'dk',
  poland: 'pl', pologne: 'pl',
  serbia: 'rs', serbie: 'rs',
  uruguay: 'uy',
  ecuador: 'ec', équateur: 'ec', equateur: 'ec',
  australia: 'au', australie: 'au',
  iran: 'ir',
  saudiarabia: 'sa', 'saudi arabia': 'sa', 'arabie saoudite': 'sa',
  senegal: 'sn', sénégal: 'sn', senegal: 'sn',
  cameroon: 'cm', cameroun: 'cm',
  ghana: 'gh',
  nigeria: 'ng',
  ivorycoast: 'ci', 'cote d ivoire': 'ci', 'côte d’ivoire': 'ci', 'côte d\'ivoire': 'ci',
  chile: 'cl', chili: 'cl',
  colombia: 'co', colombie: 'co',
  peru: 'pe', pérou: 'pe', perou: 'pe',
  wales: 'gb-wls', galles: 'gb-wls',
  scotland: 'gb-sct', ecosse: 'gb-sct', 'écosse': 'gb-sct',
  turkey: 'tr', turquie: 'tr',
  ukraine: 'ua',
  norway: 'no', norvège: 'no', norvege: 'no',
  sweden: 'se', suede: 'se', suède: 'se',
  austria: 'at', autriche: 'at'
};

function $(id) { return document.getElementById(id); }
function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function normalizeCountryName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function guessCountryCode(name) {
  const key = normalizeCountryName(name);
  return countryCodeMap[key] || null;
}

function guessEmojiFlag(name) {
  const key = normalizeCountryName(name);
  return flagEmojiMap[key] || '⚽';
}

function flagMarkup(name, explicitCode, fallbackUrl) {
  const code = explicitCode || guessCountryCode(name);
  if (code) {
    const safeName = esc(name || '');
    return `<img class="flag-img" src="https://flagcdn.com/w80/${code}.png" srcset="https://flagcdn.com/w160/${code}.png 2x" alt="Drapeau ${safeName}" loading="eager">`;
  }
  if (fallbackUrl && /^https?:/i.test(fallbackUrl)) {
    return `<img class="flag-img" src="${esc(fallbackUrl)}" alt="${esc(name || '')}" loading="eager">`;
  }
  return `<span class="flag-emoji">${guessEmojiFlag(name)}</span>`;
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

function parisDateKey(date = new Date(), offsetDays = 0) {
  const d = new Date(date.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(d).reduce((acc, p) => (acc[p.type] = p.value, acc), {});
  return `${parts.year}${parts.month}${parts.day}`;
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
    localTime: event.date ? new Date(event.date).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }) : null,
    status,
    group: event?.competitions?.[0]?.note?.headline || event?.season?.slug || '',
    homeTeam: home.team?.displayName || home.team?.shortDisplayName || home.team?.abbreviation || 'À définir',
    awayTeam: away.team?.displayName || away.team?.shortDisplayName || away.team?.abbreviation || 'À définir',
    homeFlagUrl: null,
    awayFlagUrl: null,
    homeCountryCode: guessCountryCode(home.team?.displayName || home.team?.shortDisplayName || home.team?.abbreviation),
    awayCountryCode: guessCountryCode(away.team?.displayName || away.team?.shortDisplayName || away.team?.abbreviation),
    homeScore: home.score ?? null,
    awayScore: away.score ?? null,
    note: event.status?.type?.shortDetail || event.status?.type?.detail || ''
  };
}

async function fetchEspnDate(dateKey) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateKey}&limit=100`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`ESPN ${dateKey}: ${res.status}`);
  const json = await res.json();
  return (json.events || []).map(mapEspnEvent);
}

async function loadEspnMatches() {
  const keys = [parisDateKey(new Date(), -1), parisDateKey(new Date(), 0), parisDateKey(new Date(), 1)];
  const all = (await Promise.all(keys.map(fetchEspnDate))).flat();
  const seen = new Set();
  const matches = all.filter(m => {
    const key = m.id || `${m.utcDate}-${m.homeTeam}-${m.awayTeam}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
  if (['finished', 'full_time', 'ft', 'terminé', 'termine'].some(x => s.includes(x))) return 'finished';
  return 'scheduled';
}

function parisParts(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(date).reduce((acc, p) => (acc[p.type] = p.value, acc), {});
}

function dayKeyFromParts(parts) {
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function classifyMatch(match, todayKey, yesterdayKey, tomorrowKey) {
  const d = new Date(match.utcDate);
  if (Number.isNaN(d.getTime())) return null;
  const p = parisParts(d);
  const key = dayKeyFromParts(p);
  const hour = Number(p.hour);

  if (key === yesterdayKey && hour >= 18) return 'Résultats de la veille';
  if (key === todayKey && hour < 12) return 'Résultats de la nuit';
  if (key === todayKey) return 'Matchs du jour';
  if (key === tomorrowKey && hour < 6) return 'Cette nuit';
  return null;
}

function getParisDayKeys() {
  const now = new Date();
  const asIsoKey = offset => {
    const compact = parisDateKey(now, offset);
    return `${compact.slice(0,4)}-${compact.slice(4,6)}-${compact.slice(6,8)}`;
  };
  return { yesterday: asIsoKey(-1), today: asIsoKey(0), tomorrow: asIsoKey(1) };
}

function renderMatchCard(m) {
  const status = normalizeStatus(m.status);
  const score = (m.homeScore !== null && m.homeScore !== undefined && m.awayScore !== null && m.awayScore !== undefined)
    ? `${m.homeScore} - ${m.awayScore}` : 'vs';
  const time = m.localTime || (m.utcDate ? new Date(m.utcDate).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }) : '--:--');
  const badgeText = status === 'live' ? 'En direct' : status === 'finished' ? 'Terminé' : 'À venir';
  const subline = m.group ? `<div class="match-group">${esc(m.group)}</div>` : '';
  return `
    <article class="match-card ${status === 'live' ? 'live' : ''}">
      <div class="team home">
        <span class="flag">${flagMarkup(m.homeTeam, m.homeCountryCode || m.homeFlagCode, m.homeFlagUrl || m.homeFlag)}</span>
        <span class="team-name">${esc(m.homeTeam || 'À définir')}</span>
      </div>
      <div class="center">
        ${subline}
        <div class="score">${esc(score)}</div>
        <div class="time">${esc(time)}</div>
        <span class="badge ${status === 'live' ? 'live' : ''}">${badgeText}</span>
      </div>
      <div class="team away">
        <span class="team-name">${esc(m.awayTeam || 'À définir')}</span>
        <span class="flag">${flagMarkup(m.awayTeam, m.awayCountryCode || m.awayFlagCode, m.awayFlagUrl || m.awayFlag)}</span>
      </div>
    </article>`;
}

function renderMatches(data) {
  const matches = Array.isArray(data?.matches) ? data.matches : [];
  const { yesterday, today, tomorrow } = getParisDayKeys();
  const order = ['Résultats de la veille', 'Résultats de la nuit', 'Matchs du jour', 'Cette nuit'];
  const groups = Object.fromEntries(order.map(label => [label, []]));

  matches
    .filter(m => m.utcDate)
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
    .forEach(m => {
      const label = classifyMatch(m, today, yesterday, tomorrow);
      if (label) groups[label].push(m);
    });

  let html = '';
  for (const label of order) {
    const list = groups[label];
    if (!list.length) continue;
    html += `<div class="match-section"><div class="section-title">${label}</div>${list.slice(0, 3).map(renderMatchCard).join('')}</div>`;
  }

  $('matches').innerHTML = html || '<div class="empty">Aucun match dans la fenêtre affichée.<br>Le dashboard vérifie la veille au soir, cette nuit, aujourd’hui et la nuit prochaine.</div>';
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
