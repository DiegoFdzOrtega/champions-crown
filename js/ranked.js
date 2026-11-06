"use strict";
/* =====================================================================
   25) CLASIFICATORIA (combates online con puntos y rangos)
   QUÉ HAY:
   - 7 RANGOS (RK_TIERS) según tus Puntos de Clasificación (PC): Bronce, Plata, Oro, Platino, Diamante, Maestro y Challenger. Emblemas en rangos/<id>.webp.
   - Ganar = +RK_WIN PC · perder (o abandonar) = −RK_LOSS PC (nunca por debajo de 0). Un combate cancelado por desconexión no cuenta.
     Se guarda en save.ranked = {pts, w, l, streak, best} (la partida normal, así también va a la nube) y, si la base de datos lo permite,
     en la tabla profiles (rank_pts, rank_w, rank_l) para la tabla de los mejores (SQL en el README, sección «Clasificatoria»).
   - BUSCAR RIVAL: canal de Supabase Realtime «ranked». Quien busca se apunta con presence {name, pts, since, v}. Todos ven la misma cola ordenada por
     quién llegó antes y se emparejan de dos en dos (1º con 2º, 3º con 4º...). El primero de cada pareja (host) manda «found» al otro; este contesta «ok»
     y los dos salen de la cola y empiezan el combate online de siempre (js/pvp.js) con match.ranked = true. Si el otro no contesta en 6 s, se vuelve a intentar.
     Solo se emparejan jugadores con la misma versión del combate (PVP_VER).
   - Pantalla #rankv sobre la ilustración fondos/clasificatoria.webp (sala de combate con 3 pedestales y una consola): tus Pokémon van sobre los pedestales
     y el botón BUSCAR CONTRINCANTE sobre la consola (rkFit los coloca según dónde quede la imagen, RK_BG). Izquierda: tu rango y estadísticas.
     Derecha: escalera de rangos y tabla de los mejores. Abajo: Hitos de Temporada (RK_HITOS: premios al ganar 5, 10 y 20 combates).
     Al buscar sale el radar y al encontrar rival el cartel VS, en un panel de cristal en el centro.
   ===================================================================== */
const RK_TIERS = [
  {id:'bronce',     n:'Bronce',     min:0,    c:'#d0844e'},
  {id:'plata',      n:'Plata',      min:150,  c:'#c8d4e8'},
  {id:'oro',        n:'Oro',        min:300,  c:'#ffcc33'},
  {id:'platino',    n:'Platino',    min:450,  c:'#3ee0c8'},
  {id:'diamante',   n:'Diamante',   min:600,  c:'#6ab8ff'},
  {id:'maestro',    n:'Maestro',    min:750,  c:'#c47aff'},
  {id:'challenger', n:'Challenger', min:1000, c:'#7af0ff'}
];
const RK_WIN = 30, RK_LOSS = 15, RK_SEASON = 'Temporada 1';
const RK_TIPS = ['Gana combates para subir de rango: +30 PC por victoria y −15 PC por derrota.', 'Abandonar un combate cuenta como derrota.', 'Elige el equipo antes de buscar: no se puede cambiar durante la búsqueda.',
  'Los dos jugadores tenéis que tener la misma versión del juego. Si algo falla, recargad con Ctrl+F5.', 'En combate, Esc abre el menú para abandonar.', 'Un buen equipo cubre muchos tipos: míralo en Equipo Pokémon › Análisis competitivo.'];
const rk = {phase:'idle', ch:null, t0:0, tick:0, n:0, offer:null, match:null, cd:0, tip:0, top:null, topErr:'', topAt:0};
const rkTier = p => RK_TIERS.reduce((a, t) => p >= t.min ? t : a, RK_TIERS[0]);
const rkNext = p => RK_TIERS.find(t => t.min > p) || null;
const rkImg = t => `rangos/${t.id}.webp`;
const rkData = () => { const r = save.ranked || (save.ranked = {pts:0, w:0, l:0, streak:0, best:0, hitos:{}}); return r; };
const rkMMSS = ms => { const s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const rkEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));

// ---- Fondo de la sala (fondos/clasificatoria.webp) y sitios de la imagen donde se colocan las cosas (fracciones del ancho y del alto de la imagen) ----
const RK_BG = {w:3200, h:1519, ped:[[.395, .5], [.505, .479], [.615, .5]], pedW:.107, ring:[.51, .589], con:[.5075, .714, .415, .079], hit:[.5, .9]};
const RK_HITOS = [{n:5, bp:1000, t:'1000 BP'}, {n:10, tk:10, t:'10 tickets'}, {n:20, tl:3, t:'3 tickets legendarios'}];     // Hitos de Temporada: premios al ganar 5, 10 y 20 combates (una vez)
const RK_ICON = {                                                                                                              // iconitos (SVG) de las estadísticas
  w:'<svg viewBox="0 0 24 24"><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" fill="currentColor"/></svg>',
  l:'<svg viewBox="0 0 24 24"><path d="M4 4l16 16M20 4L4 20" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  s:'<svg viewBox="0 0 24 24"><path d="M12 2c1 4 6 6 6 12a6 6 0 01-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" fill="currentColor"/></svg>'};

// ---- Pantalla ----
function openRanked(autoSearch){
  if(!$('rankv').dataset.built) rkBuild();
  show('rankv'); rkRender(); rkLoadTop();
  if(autoSearch === true) setTimeout(rkSearch, 300);
}
function rkBuild(){
  const el = $('rankv'); el.dataset.built = '1';
  el.innerHTML = `<div class="rk" id="rkRoot">
    <div class="rk-bg" aria-hidden="true"></div>
    <div class="rk-stage" id="rkStage"></div>
    <header class="rk-top"><button id="rkBack" class="rk-btn ghost">☰ Menú</button>
      <div class="rk-banner"><h1>Clasificatoria</h1><span>${RK_SEASON}</span></div><div id="rkOnline" class="rk-on"></div></header>
    <aside class="rk-me" id="rkMe"></aside>
    <aside class="rk-side"><section class="rk-panel rk-lad"><h3>Rangos</h3><div id="rkLadder" class="rk-ladder"></div></section>
      <section class="rk-panel rk-topp"><h3>Mejores jugadores</h3><div id="rkTop" class="rk-toplist"></div></section></aside>
    <main class="rk-mid" id="rkMid"></main>
  </div>`;
  $('rkBack').onclick = rkClose;
  const act = e => { const b = e.target.closest('[data-act]'); if(!b) return; const a = b.dataset.act;
    if(a === 'search') rkSearch(); else if(a === 'cancel') rkCancel(); else if(a === 'team') openTeam('rank'); else if(a === 'login') (typeof openAccount === 'function' ? openAccount() : goMain()); };
  $('rkMid').addEventListener('click', act); $('rkStage').addEventListener('click', act);
  addEventListener('keydown', e => { if(e.code === 'Escape' && !$('rankv').classList.contains('hide')){ e.preventDefault(); rk.phase === 'search' ? rkCancel() : rk.phase === 'idle' && rkClose(); } });
  addEventListener('resize', () => { if(!$('rankv').classList.contains('hide')) rkFit(); });
}
function rkClose(){ rkCancel(true); goMain(); }
function rkRender(){ rkRenderMe(); rkRenderStage(); rkRenderMid(); rkRenderLadder(); rkRenderTop(); rkRenderOnline(); rkFit(); }
// Coloca el fondo «a pantalla completa» (cubrir) y pone cada cosa del escenario en su sitio de la imagen (pedestales, consola...)
function rkFit(){
  const root = $('rkRoot'); if(!root || !root.offsetWidth) return;
  const W = root.offsetWidth, H = root.offsetHeight, B = RK_BG, s = Math.max(W / B.w, H / B.h), ox = (W - B.w * s) / 2, oy = (H - B.h * s) / 2;
  root.style.setProperty('--bgs', `${Math.ceil(B.w * s)}px ${Math.ceil(B.h * s)}px`); root.style.setProperty('--bgp', `${Math.round(ox)}px ${Math.round(oy)}px`);
  const X = f => ox + f * B.w * s, Y = f => oy + f * B.h * s, PW = B.pedW * B.w * s;
  root.style.setProperty('--ped', PW + 'px');
  root.querySelectorAll('[data-at]').forEach(e => { const [k, i] = e.dataset.at.split(':'); let x, y;
    if(k === 'ped'){ [x, y] = B.ped[+i]; } else if(k === 'ring'){ [x, y] = B.ring; e.style.width = (.37 * B.w * s) + 'px'; e.style.setProperty('--gap', (.094 * B.w * s) + 'px'); } else if(k === 'con'){ [x, y] = B.con; e.style.width = (B.con[2] * B.w * s * .86) + 'px'; } else if(k === 'hit'){ [x, y] = B.hit; }
    e.style.left = X(x) + 'px'; e.style.top = Y(y) + 'px'; });
}
function rkRenderOnline(){
  const el = $('rkOnline'); if(!el) return;
  const on = typeof cloud !== 'undefined' && cloud.user && cloud.rt;
  el.innerHTML = on ? `<i class="dot ok"></i>Conectado como <b>${rkEsc(cloud.name)}</b>` : `<i class="dot"></i>Sin conexión`;
}
function rkRenderMe(){
  const r = rkData(), t = rkTier(r.pts), nx = rkNext(r.pts), games = r.w + r.l, wr = games ? Math.round(r.w / games * 100) : 0;
  const pr = nx ? (r.pts - t.min) / (nx.min - t.min) : 1, segs = 5;
  $('rkMe').innerHTML = `<div class="rk-card" style="--rc:${t.c}">
      <small class="rk-lbl">Tu rango</small>
      <div class="rk-emb"><img src="${rkImg(t)}" alt="${t.n}"></div>
      <h2 style="color:${t.c}">${t.n}</h2>
      <div class="rk-pts"><b>${r.pts}</b> PC</div>
      <div class="rk-bar"><div class="segs">${Array.from({length: segs}, (_, k) => `<i style="--f:${Math.max(0, Math.min(1, pr * segs - k))}"></i>`).join('')}</div>${nx ? `<img src="${rkImg(nx)}" alt="${nx.n}" title="${nx.n}">` : ''}</div>
      <div class="rk-barl"><span>${t.min}</span><small>${nx ? `Te faltan <b>${nx.min - r.pts} PC</b> para <span style="color:${nx.c}">${nx.n}</span>` : '¡Rango máximo!'}</small><span>${nx ? nx.min : ''}</span></div>
    </div>
    <div class="rk-stats">
      <div class="st w">${RK_ICON.w}<b>${r.w}</b><small>Victorias</small></div>
      <div class="st l">${RK_ICON.l}<b>${r.l}</b><small>Derrotas</small></div>
      <div class="st s">${RK_ICON.s}<b>${r.streak > 0 ? '+' + r.streak : r.streak}</b><small>Racha · ${wr}% ganadas</small></div>
    </div>
    <div class="rk-panel rk-rules"><h3>Cómo funciona</h3><p>Gana: <b class="w">+${RK_WIN} PC</b> | Pierde: <b class="l">−${RK_LOSS} PC</b></p><p>Si se corta la conexión, el combate no cuenta. Abandonar cuenta como derrota.</p><p class="best">Mejor puntuación: <b>${r.best} PC</b></p></div>`;
}
function rkCanPlay(){
  if(typeof cloud === 'undefined' || !cloud.ok) return ['nocloud', 'No hay conexión con el servidor del juego.'];
  if(!cloud.user || !cloud.name) return ['login', 'Para jugar la Clasificatoria necesitas una cuenta. Entra en «Amigos» para crearla o iniciar sesión.'];
  if(!cloud.rt) return ['wait', 'Conectando con el servidor... espera un momento.'];
  if(team.length !== 3) return ['team', 'Necesitas un equipo de 3 Pokémon.'];
  return null;
}
// El escenario: tus 3 Pokémon sobre los pedestales, el selector de equipo junto al aro central, el botón grande en la consola y los Hitos de Temporada
function rkRenderStage(){
  const st = $('rkStage'), idle = rk.phase === 'idle', bad = rkCanPlay(), r = rkData();
  st.classList.toggle('dim', !idle);
  const order = [1, 0, 2];                                                                                  // el nº 1 (líder) va en el pedestal del centro
  st.innerHTML = order.map((ti, pi) => { const d = team[ti];
      if(!d) return `<div class="rk-ped empty" data-at="ped:${pi}"><span>Hueco ${ti + 1}</span></div>`;
      const m = mon(d); return `<div class="rk-ped${ti === 0 ? ' lead' : ''}" data-at="ped:${pi}" style="--c1:${TC[m.types[0]]}"><canvas width="200" height="200" data-d="${d}"></canvas><b class="plate">${rkEsc(m.name)}</b></div>`; }).join('') +
    (idle ? `<div class="rk-ringrow" data-at="ring:0"><div class="half l"><button class="rk-link" data-act="team">Equipo Pokémon <i>▾</i></button></div><i class="rk-ring" style="--p:${Math.round((rkNext(r.pts) ? (r.pts - rkTier(r.pts).min) / (rkNext(r.pts).min - rkTier(r.pts).min) : 1) * 100)}" title="Progreso hacia el siguiente rango"><i></i></i><div class="half r"><label class="rk-link gold">Equipo <select id="rkTeamSel"></select></label></div></div>
      <div class="rk-console" data-at="con:0">${bad && bad[0] !== 'login' ? `<p class="rk-warn">${rkEsc(bad[1])}</p>` : ''}
        <button class="rk-go" data-act="${bad && bad[0] === 'login' ? 'login' : 'search'}" ${bad && bad[0] !== 'login' ? 'disabled' : ''}><i class="spark s1"></i><i class="spark s2"></i><span>${bad && bad[0] === 'login' ? 'Iniciar sesión' : 'Buscar contrincante'}</span></button>
        <small class="rk-hint">Te emparejaremos con otro jugador que esté buscando. +${RK_WIN} PC si ganas, ${RK_LOSS} PC menos si pierdes.</small></div>` : '') +
    `<div class="rk-hitos" data-at="hit:0"><h3>Hitos de Temporada</h3><div class="rk-hline">${RK_HITOS.map((h, k) => { const got = r.w >= h.n, pct = Math.min(1, r.w / h.n);
      return `<div class="hito${got ? ' got' : ''}"><img src="${rkImg(RK_TIERS[[2, 4, 6][k]])}" alt=""><b>Gana ${h.n} combates</b><small>${got ? '✓ ' : ''}${h.t}</small><i class="hp"><s style="width:${pct * 100}%"></s></i></div>`; }).join('')}</div></div>`;
  if(idle && typeof fillTeamSel === 'function') fillTeamSel('rkTeamSel', rkRender);
  st.querySelectorAll('canvas[data-d]').forEach(c => typeof hbPaint === 'function' ? hbPaint(c, +c.dataset.d, useShiny(+c.dataset.d)) : paintSprite(c, +c.dataset.d, {sc:8, fit:190, shiny: useShiny(+c.dataset.d)}));
}
function rkRenderMid(){
  const el = $('rkMid'), r = rkData(), t = rkTier(r.pts);
  el.classList.toggle('on', rk.phase !== 'idle');
  if(rk.phase === 'search'){
    const tip = RK_TIPS[rk.tip % RK_TIPS.length];
    el.innerHTML = `<div class="rk-glass rk-search">
      <div class="rk-radar" style="--rc:${t.c}"><i class="ring r1"></i><i class="ring r2"></i><i class="ring r3"></i><i class="sweep"></i>${[0, 1, 2, 3, 4].map(k => `<i class="blip b${k}"></i>`).join('')}<img src="${rkImg(t)}" alt=""></div>
      <h2 class="rk-dots">Buscando contrincante</h2>
      <div class="rk-timer" id="rkTimer">${rkMMSS(Date.now() - rk.t0)}</div>
      <p class="rk-q" id="rkQ">${rk.n > 1 ? `<b>${rk.n}</b> jugadores buscando ahora mismo` : 'Esperando a otro jugador...'}</p>
      <p class="rk-tip">${rkEsc(tip)}</p>
      <button class="rk-btn" data-act="cancel">Cancelar búsqueda</button></div>`;
    return;
  }
  if(rk.phase === 'found' && rk.match){
    const o = rk.match.opp, ot = rkTier(o.pts || 0);
    el.innerHTML = `<div class="rk-glass rk-found">
      <h2>¡Rival encontrado!</h2>
      <div class="rk-vs"><div class="rk-side-p me" style="--rc:${t.c}"><img src="${rkImg(t)}" alt=""><b>${rkEsc(cloud.name)}</b><span style="color:${t.c}">${t.n} · ${r.pts} PC</span></div>
        <div class="rk-vsx">VS</div>
        <div class="rk-side-p op" style="--rc:${ot.c}"><img src="${rkImg(ot)}" alt=""><b>${rkEsc(o.name)}</b><span style="color:${ot.c}">${ot.n} · ${o.pts || 0} PC</span></div></div>
      <div class="rk-cd" id="rkCd">${rk.cd}</div><p class="rk-q">El combate empieza enseguida...</p></div>`;
    return;
  }
  el.innerHTML = '';
}
function rkRenderLadder(){
  const p = rkData().pts, cur = rkTier(p);
  $('rkLadder').innerHTML = RK_TIERS.slice().reverse().map(t => { const nx = rkNext(t.min);
    return `<div class="rk-rung${t === cur ? ' cur' : ''}${p >= t.min ? ' got' : ''}" style="--rc:${t.c}"><span class="gem"><img src="${rkImg(t)}" alt=""></span><b>${t.n}</b><small>${nx ? `${t.min} – ${nx.min - 1}` : `${t.min}+`} PC</small>${t === cur ? '<em>TÚ</em>' : ''}</div>`; }).join('');
}
async function rkLoadTop(){
  if(typeof cloud === 'undefined' || !cloud.sb || !cloud.user) { rk.top = null; rk.topErr = 'login'; rkRenderTop(); return; }
  if(Date.now() - rk.topAt < 15000 && rk.top) return rkRenderTop();
  try{
    const {data, error} = await cloud.sb.from('profiles').select('username, rank_pts, rank_w, rank_l').order('rank_pts', {ascending:false}).limit(10);
    if(error) throw error;
    rk.top = (data || []).filter(x => (x.rank_w || 0) + (x.rank_l || 0) > 0); rk.topErr = ''; rk.topAt = Date.now();
  }catch(e){ rk.top = null; rk.topErr = 'sql'; }
  rkRenderTop();
}
function rkRenderTop(){
  const el = $('rkTop'); if(!el) return;
  if(!rk.top){ el.innerHTML = `<p class="rk-none">${rk.topErr === 'login' ? 'Inicia sesión para ver la tabla.' : 'La tabla de los mejores aún no está disponible.'}</p>`; return; }
  if(!rk.top.length){ el.innerHTML = '<p class="rk-none">Todavía nadie ha jugado. ¡Sé el primero!</p>'; return; }
  el.innerHTML = rk.top.map((x, i) => { const t = rkTier(x.rank_pts || 0), me = typeof cloud !== 'undefined' && x.username === cloud.name;
    return `<div class="rk-row${me ? ' me' : ''}"><i class="n${i < 3 ? ' m' + i : ''}">${i + 1}</i><img src="${rkImg(t)}" alt="${t.n}" title="${t.n}"><b>${rkEsc(x.username)}</b><span>${x.rank_pts || 0} PC</span></div>`; }).join('');
}

// ---- Buscar rival (canal «ranked» de Supabase Realtime) ----
function rkSearch(){
  const bad = rkCanPlay(); if(bad){ if(typeof toast === 'function') toast(bad[1]); rkRender(); return; }
  if(cloudBusy() || cloud.chal){ if(typeof toast === 'function') toast('Ya tienes un combate o un desafío en marcha.'); return; }
  if(rk.ch) rkCancel(true);
  rk.phase = 'search'; rk.t0 = Date.now(); rk.n = 1; rk.offer = null; rk.match = null; rk.tip = Math.floor(Math.random() * RK_TIPS.length);
  const r = rkData(), ch = cloud.sb.channel('ranked', {config: {presence: {key: cloud.user.id}, broadcast: {self: false}}});
  ch.on('presence', {event: 'sync'}, () => { if(rk.ch === ch) rkSync(); })
    .on('broadcast', {event: 'found'}, m => { if(rk.ch === ch) rkOnFound(m.payload); })
    .on('broadcast', {event: 'ok'}, m => { if(rk.ch === ch) rkOnOk(m.payload); })
    .subscribe(st => { if(st === 'SUBSCRIBED' && rk.ch === ch) ch.track({name: cloud.name, pts: r.pts, since: rk.t0, v: PVP_VER}); });
  rk.ch = ch;
  clearInterval(rk.tick); rk.tick = setInterval(rkTick, 1000);
  rkRender(); if(typeof Sfx !== 'undefined' && Sfx.play) try{ Sfx.play('click'); }catch(e){}
}
function rkTick(){
  if(rk.phase !== 'search') return;
  if(typeof cloud !== 'undefined' && cloud.match && (!rk.match || cloud.match.id !== rk.match.id)){ rkCancel(); return; }    // aceptaste un desafío de un amigo
  const t = $('rkTimer'); if(t) t.textContent = rkMMSS(Date.now() - rk.t0);
  if((Math.floor((Date.now() - rk.t0) / 1000) % 7) === 6){ rk.tip++; const p = document.querySelector('#rkMid .rk-tip'); if(p) p.textContent = '💡 ' + RK_TIPS[rk.tip % RK_TIPS.length]; }
}
function rkQueue(){
  const st = rk.ch.presenceState();
  return Object.keys(st).map(k => ({uid: k, ...(st[k][0] || {})})).filter(x => x.v === PVP_VER && x.since).sort((a, b) => a.since - b.since || (a.uid < b.uid ? -1 : 1));
}
function rkSync(){
  if(rk.phase !== 'search' || !rk.ch) return;
  const q = rkQueue(); rk.n = q.length;
  const qe = $('rkQ'); if(qe) qe.innerHTML = rk.n > 1 ? `<b>${rk.n}</b> jugadores buscando ahora mismo` : 'Esperando a otro jugador...';
  const i = q.findIndex(x => x.uid === cloud.user.id); if(i < 0 || i % 2 || i + 1 >= q.length || rk.offer) return;      // solo el primero de cada pareja propone
  const o = q[i + 1], id = 'rk' + Math.random().toString(36).slice(2, 10);
  rk.offer = {id, opp: {uid: o.uid, name: o.name, pts: o.pts || 0}, timer: setTimeout(() => { rk.offer = null; rkSync(); }, 6000)};
  rk.ch.send({type: 'broadcast', event: 'found', payload: {id, from: cloud.user.id, to: o.uid, name: cloud.name, pts: rkData().pts}});
}
function rkOnFound(p){
  if(!p || p.to !== cloud.user.id || rk.phase !== 'search') return;
  rk.ch.send({type: 'broadcast', event: 'ok', payload: {id: p.id, from: cloud.user.id, to: p.from}});
  rkMatch({id: p.id, opp: {uid: p.from, name: p.name || '(jugador)', pts: +p.pts || 0}, host: false});
}
function rkOnOk(p){
  const O = rk.offer; if(!p || p.to !== cloud.user.id || !O || O.id !== p.id || rk.phase !== 'search') return;
  clearTimeout(O.timer); rk.offer = null; rkMatch({id: O.id, opp: O.opp, host: true});
}
function rkLeaveQueue(){
  if(rk.offer){ clearTimeout(rk.offer.timer); rk.offer = null; }
  if(rk.ch){ const ch = rk.ch; rk.ch = null; try{ ch.untrack(); }catch(e){} try{ cloud.sb.removeChannel(ch); }catch(e){} }
  clearInterval(rk.tick);
}
function rkCancel(quiet){
  const was = rk.phase === 'search'; rkLeaveQueue(); clearInterval(rk.cdT);
  if(rk.phase !== 'found') rk.phase = 'idle';
  if(!quiet && was && !$('rankv').classList.contains('hide')) rkRender();
}
function rkMatch(m){
  rkLeaveQueue(); rk.phase = 'found'; rk.match = m; rk.cd = 3; rkRender();
  if(typeof Sfx !== 'undefined' && Sfx.play) try{ Sfx.play('win'); }catch(e){}
  clearInterval(rk.cdT);
  rk.cdT = setInterval(() => {
    rk.cd--; const c = $('rkCd'); if(c) c.textContent = rk.cd > 0 ? rk.cd : '¡YA!';
    if(rk.cd > 0) return;
    clearInterval(rk.cdT); rk.phase = 'idle';
    cloud.match = {id: m.id, opp: {uid: m.opp.uid, name: m.opp.name}, host: m.host, ranked: true, oppPts: m.opp.pts};
    if(typeof cloudOnMatch === 'function') cloudOnMatch(cloud.match);
  }, 1000);
}

// ---- Resultado (lo llama pvpFinish de js/pvp.js en los combates de Clasificatoria) ----
function rkResult(iWon){
  const r = rkData(), before = rkTier(r.pts), d = iWon ? RK_WIN : -Math.min(RK_LOSS, r.pts);
  r.pts += d; if(iWon){ r.w++; r.streak = r.streak > 0 ? r.streak + 1 : 1; } else { r.l++; r.streak = r.streak < 0 ? r.streak - 1 : -1; }
  r.best = Math.max(r.best, r.pts);
  r.hitos = r.hitos || {};
  RK_HITOS.forEach(h => { if(r.w >= h.n && !r.hitos[h.n]){ r.hitos[h.n] = 1; save.bp += h.bp || 0; save.tickets += h.tk || 0; save.ticketsL += h.tl || 0;
    if(typeof toast === 'function') setTimeout(() => toast(`¡Hito de Temporada! Has ganado ${h.n} combates: +${h.t}`), 2500); } });
  persist(); rkPush(); if(typeof achSync === 'function') achSync();
  const after = rkTier(r.pts), up = RK_TIERS.indexOf(after) > RK_TIERS.indexOf(before), down = RK_TIERS.indexOf(after) < RK_TIERS.indexOf(before);
  return {d, pts: r.pts, tier: after, up, down, text: `${d >= 0 ? '+' : '−'}${Math.abs(d)} PC · ${after.n} ${r.pts} PC` + (up ? ` · ¡Has subido a ${after.n}!` : down ? ` · Has bajado a ${after.n}` : '')};
}
async function rkPush(){                                                                                 // copia tus puntos en la tabla pública (para la tabla de los mejores)
  if(typeof cloud === 'undefined' || !cloud.sb || !cloud.user) return;
  const r = rkData(); rk.topAt = 0;
  try{ await cloud.sb.from('profiles').update({rank_pts: r.pts, rank_w: r.w, rank_l: r.l}).eq('id', cloud.user.id); }catch(e){}
}
