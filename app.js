const DATA_URLS = { matches: 'data/matches.json' };

const countryCodeMap = {
  mexico:'mx', mexique:'mx', canada:'ca', usa:'us', 'united states':'us', 'états-unis':'us', 'etats-unis':'us',
  brazil:'br', brésil:'br', bresil:'br', france:'fr', argentina:'ar', argentine:'ar',
  england:'gb-eng', angleterre:'gb-eng', spain:'es', espagne:'es', germany:'de', allemagne:'de',
  portugal:'pt', japan:'jp', japon:'jp', morocco:'ma', maroc:'ma', tunisia:'tn', tunisie:'tn',
  paraguay:'py', qatar:'qa', switzerland:'ch', suisse:'ch',
  'south africa':'za', 'afrique du sud':'za', 'korea republic':'kr', 'south korea':'kr', 'corée du sud':'kr', 'coree du sud':'kr',
  czechia:'cz', tchéquie:'cz', tchequie:'cz', netherlands:'nl', 'pays-bas':'nl', paysbas:'nl',
  belgium:'be', belgique:'be', croatia:'hr', croatie:'hr', denmark:'dk', danemark:'dk',
  poland:'pl', pologne:'pl', serbia:'rs', serbie:'rs', uruguay:'uy',
  ecuador:'ec', equateur:'ec', australie:'au', australia:'au', iran:'ir',
  'arabie saoudite':'sa', 'saudi arabia':'sa', senegal:'sn', sénégal:'sn',
  cameroun:'cm', cameroon:'cm', ghana:'gh', nigeria:'ng', chili:'cl', chile:'cl',
  colombie:'co', colombia:'co', perou:'pe', pérou:'pe', ukraine:'ua', turquie:'tr', turkey:'tr'
};

const flagEmojiMap = {
  mexico:'🇲🇽', mexique:'🇲🇽', canada:'🇨🇦', usa:'🇺🇸', 'united states':'🇺🇸', 'états-unis':'🇺🇸', 'etats-unis':'🇺🇸',
  brazil:'🇧🇷', brésil:'🇧🇷', bresil:'🇧🇷', france:'🇫🇷', argentina:'🇦🇷', argentine:'🇦🇷',
  england:'🏴', angleterre:'🏴', spain:'🇪🇸', espagne:'🇪🇸', germany:'🇩🇪', allemagne:'🇩🇪',
  portugal:'🇵🇹', japan:'🇯🇵', japon:'🇯🇵', morocco:'🇲🇦', maroc:'🇲🇦', tunisia:'🇹🇳', tunisie:'🇹🇳'
};

function $(id){ return document.getElementById(id); }
function esc(value){ return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function normalizeName(value){ return String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim(); }
function guessCountryCode(name){ return countryCodeMap[normalizeName(name)] || null; }
function flagMarkup(name, explicitCode, fallbackUrl){
  const code = explicitCode || guessCountryCode(name);
  if (code) return `<img class="flag-img" src="https://flagcdn.com/w80/${code}.png" srcset="https://flagcdn.com/w160/${code}.png 2x" alt="">`;
  if (fallbackUrl && /^https?:/i.test(fallbackUrl)) return `<img class="flag-img" src="${esc(fallbackUrl)}" alt="">`;
  return `<span class="flag-emoji">${flagEmojiMap[normalizeName(name)] || '⚽'}</span>`;
}
function fmtDate(value){
  if (!value) return '--';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '--';
  return d.toLocaleString('fr-FR', { dateStyle:'short', timeStyle:'short' });
}
async function loadJson(url){
  const res = await fetch(`${url}?t=${Date.now()}`, { cache:'no-store' });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}
function parisDateKey(date = new Date(), offsetDays = 0){
  const d = new Date(date.getTime() + offsetDays * 86400000);
  const parts = new Intl.DateTimeFormat('fr-FR', { timeZone:'Europe/Paris', year:'numeric', month:'2-digit', day:'2-digit' })
    .formatToParts(d).reduce((acc,p)=>(acc[p.type]=p.value,acc),{});
  return `${parts.year}${parts.month}${parts.day}`;
}
function mapEspnEvent(event){
  const comp = event?.competitions?.[0] || {};
  const competitors = comp.competitors || [];
  const home = competitors.find(c => c.homeAway === 'home') || competitors[0] || {};
  const away = competitors.find(c => c.homeAway === 'away') || competitors[1] || {};
  const state = event?.status?.type?.state || comp?.status?.type?.state || 'pre';
  const completed = event?.status?.type?.completed || comp?.status?.type?.completed || false;
  return {
    id:event.id,
    utcDate:event.date,
    localTime:event.date ? new Date(event.date).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}) : null,
    status: completed ? 'finished' : state === 'in' ? 'live' : 'scheduled',
    group: event?.competitions?.[0]?.note?.headline || event?.season?.slug || '',
    homeTeam: home.team?.displayName || home.team?.shortDisplayName || home.team?.abbreviation || 'À définir',
    awayTeam: away.team?.displayName || away.team?.shortDisplayName || away.team?.abbreviation || 'À définir',
    homeScore: home.score ?? null,
    awayScore: away.score ?? null
  };
}
async function fetchEspnDate(dateKey){
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateKey}&limit=100`;
  const res = await fetch(url, { cache:'no-store' });
  if (!res.ok) throw new Error(`ESPN ${dateKey}: ${res.status}`);
  const json = await res.json();
  return (json.events || []).map(mapEspnEvent);
}
async function loadEspnMatches(){
  const keys = [parisDateKey(new Date(), -1), parisDateKey(new Date(), 0), parisDateKey(new Date(), 1)];
  const all = (await Promise.all(keys.map(fetchEspnDate))).flat();
  const seen = new Set();
  return { updatedAt:new Date().toISOString(), source:'ESPN direct', matches: all.filter(m => {
    const key = m.id || `${m.utcDate}-${m.homeTeam}-${m.awayTeam}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }) };
}
function renderClock(){
  const now = new Date();
  $('clockTime').textContent = now.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
  $('clockDate').textContent = now.toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long' });
}
function normalizeStatus(status){
  const s = String(status || '').toLowerCase();
  if (['live','in_play','playing','first_half','second_half','halftime'].some(x => s.includes(x))) return 'live';
  if (['finished','full_time','ft','terminé','termine'].some(x => s.includes(x))) return 'finished';
  return 'scheduled';
}
function parisParts(date){
  return new Intl.DateTimeFormat('fr-FR', { timeZone:'Europe/Paris', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23' })
    .formatToParts(date).reduce((acc,p)=>(acc[p.type]=p.value,acc),{});
}
function dayKey(parts){ return `${parts.year}-${parts.month}-${parts.day}`; }
function classifyMatch(match, todayKey, yesterdayKey, tomorrowKey){
  const d = new Date(match.utcDate);
  if (Number.isNaN(d.getTime())) return null;
  const p = parisParts(d), key = dayKey(p), hour = Number(p.hour);
  if (key === yesterdayKey && hour >= 18) return 'Résultats de la veille';
  if (key === todayKey && hour < 12) return 'Résultats de la nuit';
  if (key === todayKey) return 'Matchs du jour';
  if (key === tomorrowKey && hour < 6) return 'Cette nuit';
  return null;
}
function getParisDayKeys(){
  const asIso = offset => {
    const compact = parisDateKey(new Date(), offset);
    return `${compact.slice(0,4)}-${compact.slice(4,6)}-${compact.slice(6,8)}`;
  };
  return { yesterday:asIso(-1), today:asIso(0), tomorrow:asIso(1) };
}
function renderMatchCard(m){
  const status = normalizeStatus(m.status);
  const score = (m.homeScore !== null && m.homeScore !== undefined && m.awayScore !== null && m.awayScore !== undefined) ? `${m.homeScore} - ${m.awayScore}` : 'vs';
  const time = m.localTime || (m.utcDate ? new Date(m.utcDate).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}) : '--:--');
  const badgeText = status === 'live' ? 'En direct' : status === 'finished' ? 'Terminé' : 'À venir';
  const subline = m.group ? `<div class="match-group">${esc(m.group)}</div>` : '';
  return `<article class="match-card ${status === 'live' ? 'live' : ''}">
    <div class="team home"><span class="flag">${flagMarkup(m.homeTeam)}</span><span class="team-name">${esc(m.homeTeam)}</span></div>
    <div class="center">${subline}<div class="score">${esc(score)}</div><div class="time">${esc(time)}</div><span class="badge ${status === 'live' ? 'live' : ''}">${badgeText}</span></div>
    <div class="team away"><span class="team-name">${esc(m.awayTeam)}</span><span class="flag">${flagMarkup(m.awayTeam)}</span></div>
  </article>`;
}
function renderMatches(data){
  const matches = Array.isArray(data?.matches) ? data.matches : [];
  const { yesterday, today, tomorrow } = getParisDayKeys();
  const order = ['Résultats de la veille', 'Résultats de la nuit', 'Matchs du jour', 'Cette nuit'];
  const groups = Object.fromEntries(order.map(label => [label, []]));
  matches.filter(m => m.utcDate).sort((a,b)=>new Date(a.utcDate)-new Date(b.utcDate)).forEach(m => {
    const label = classifyMatch(m, today, yesterday, tomorrow);
    if (label) groups[label].push(m);
  });
  let html = '';
  for (const label of order){
    const list = groups[label];
    if (list.length) html += `<div class="match-section"><div class="section-title">${label}</div>${list.slice(0,6).map(renderMatchCard).join('')}</div>`;
  }
  $('matches').innerHTML = html || '<div class="empty">Aucun match dans la fenêtre affichée.</div>';
}
async function refresh(){
  try{
    let data;
    try{
      data = await loadEspnMatches();
      $('status').textContent = 'Données matchs chargées via ESPN';
    } catch(e){
      console.warn(e);
      data = await loadJson(DATA_URLS.matches);
      $('status').textContent = 'Données matchs chargées via JSON local';
    }
    renderMatches(data);
    $('updatedAt').textContent = `Dernière mise à jour : ${fmtDate(data?.updatedAt)}`;
  } catch(err){
    console.error(err);
    $('status').textContent = 'Erreur de chargement des matchs';
  }
}
renderClock();
refresh();
setInterval(renderClock, 1000);
setInterval(refresh, 60000);
