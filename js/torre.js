"use strict";
/* =====================================================================
   TORRE BATALLA: 50 pisos contra PERSONAJES del mundo Pokémon
   - Empiezas en el piso 1 con tu equipo de 3. Cada piso es un combate; al ganarlo subes al siguiente, hasta el piso 50.
   - Rivales: personajes de la Invocación que NO salen en la Historia (héroes, rivales, villanos y jefes de los equipos malvados,
     personajes del anime...; ni clases genéricas, ni Líderes, Alto Mando o Campeones). Van saliendo POR TURNOS en un orden
     barajado (save.tower.rot = cuántos llevas): siempre te toca alguien contra quien NO te has enfrentado todavía.
   - Cada 10 pisos (10, 20, 30, 40 y 50) un JEFE: un CAMPEÓN con sus 6 Pokémon (al azar, sin repetir en la subida).
   - La «subida» (los 50 rivales) se decide al empezar desde el piso 1 (torrePlan) y se ve en la torre: el siguiente rival a la vista,
     los demás en silueta. Tus Pokémon se CURAN en cada piso. Si pierdes, la subida acaba; lo ganado es tuyo.
   - Se abre al ser Campeón de KANTO (towerOpen), para poder farmear premios pronto.
   - save.tower = {best, total, runs, ms:{piso:1}, rot}. Se juega en el estadio de la Torre (js/pruebas.js · estTorre).
   - Equilibrio: TORRE_CURVA (dificultad), torreReward (premio por piso) y TORRE_HITOS (premios únicos).
   Se carga DESPUÉS de campo.js. El combate lo cierra torreEnd(), que llama endBattle (modes.js).
   ===================================================================== */
const TORRE_BOSS_CADA = 10;                         // cada cuántos pisos hay un Campeón
const TORRE_MAX = 50;                               // pisos de la Torre
const TORRE_EXTRA = [];                             // (compatibilidad) entrenadores extra con el formato de CAMPO

// Dificultad por piso (misma fórmula que la Historia y el Campo: DIFF en data.js). piso 1 ≈ Campo Fácil · piso 50 = muy difícil.
const TORRE_CURVA = {
  n:   f => 2 + f * .30,
  lvl: f => Math.min(180, 106 + 2 * f),
  jefe: {n: 3, lvl: 6}                              // los Campeones llevan +3 de n y +6 de nivel
};
function torreStats(f, boss){
  const D = DIFF.dificil, n = TORRE_CURVA.n(f) + (boss ? TORRE_CURVA.jefe.n : 0), lvl = TORRE_CURVA.lvl(f) + (boss ? TORRE_CURVA.jefe.lvl : 0), k = lvl / 100;
  return {lvl, hm:D.hm(n) * k, dm:D.dm(n) * k, skill:Math.min(1, D.skill(n)), spdm:1 + (k - 1) * .4};
}

// Premio por cada piso superado (sube con el piso): BP y Chapas Plateadas siempre, tiradas cada 3 pisos y, al vencer a un Campeón,
// Chapas Doradas, una tirada legendaria y Estrellas de Invocación. Claves: bp, tickets, ticketsL, chapaplata, chapa, estrella, estrella_t.
function torreReward(f){
  const r = {bp: 60 + 12 * f, chapaplata: 2 + Math.floor(f / 4)};
  if(f % 3 === 0) r.tickets = 1 + Math.floor(f / 15);
  if(f % TORRE_BOSS_CADA === 0){ r.bp += 400 + 40 * f; r.chapa = 5 + Math.floor(f / 5); r.ticketsL = 1; r.estrella = f >= TORRE_MAX ? 3 : 1; if(f >= 30) r.estrella_t = f >= TORRE_MAX ? 3 : 1; }
  return r;
}
// Premios ÚNICOS: la primera vez que superas ese piso
const TORRE_HITOS = [
  {f:10, bp:1500,  tickets:5,  estrella:2},
  {f:25, bp:4000,  tickets:15, ticketsL:2, estrella:3},
  {f:50, bp:20000, tickets:40, ticketsL:5, estrella_t:10}          // ¡Torre completada!
];

// ---- ¿Está abierta? Al ser Campeón de Kanto ----
const leaguesAvail = () => REGIONS.filter(r => FLOORS.some(F => F.region === r));
const towerOpen = () => champAny('Kanto');
const towerNeed = () => towerOpen() ? 0 : 1;

// ---- RIVALES: personajes de la Invocación que no salen en la Historia (uno por personaje), en un orden barajado fijo ----
let TORRE_RIV = null;
function torreRivales(){
  if(TORRE_RIV) return TORRE_RIV;
  const L = (typeof INV_LIST !== 'undefined' ? INV_LIST : []).filter(x => x.t !== 'C' && x.n !== '???' && !['ch', 'am', 'gy', 'ma'].some(t => invHas(x, t)));
  const R = invSeeded(20261106), byName = new Map();
  L.map(x => [x, R()]).sort((a, b) => a[1] - b[1]).forEach(([x]) => { if(!byName.has(x.n)) byName.set(x.n, x); });   // una versión de cada personaje
  return TORRE_RIV = [...byName.values()];
}
// Tipos que le pegan a cada personaje: primero los famosos (por su archivo), luego por palabras de su clase, y los villanos, Siniestro/Veneno
const TORRE_FIRMA = {giovanni:['tierra'], archie:['agua', 'siniestro'], maxie:['fuego', 'tierra'], cyrus:['siniestro', 'hielo'], ghetsis:['dragon', 'siniestro'], lysandre:['fuego'],
  guzma:['bicho'], lusamine:['hada', 'veneno'], rose:['acero'], n:['dragon', 'normal'], silver:['siniestro'], ash:['electrico', 'fuego', 'volador'], colress:['acero', 'electrico'],
  xerosic:['veneno'], zinnia:['dragon'], wally:['psiquico'], mars:['veneno'], jupiter:['veneno'], saturn:['veneno'], volo:['fantasma'], kieran:['dragon', 'planta'], carmine:['planta'],
  arven:['planta', 'acero'], penny:['hada'], hop:['normal'], bede:['hada', 'psiquico'], marnie:['siniestro'], gladion:['siniestro'], hau:['normal'], lillie:['hada'], tierno:['normal'],
  shauna:['hada'], sina:['hielo'], dexio:['psiquico'], cheren:['normal'], bianca:['normal'], barry:['fuego'], brendan:['planta'], may:['agua'], lyra:['agua'], ethan:['fuego'],
  green:['planta'], leaf:['planta'], yellow:['electrico'], petrel:['veneno'], proton:['veneno'], archer:['siniestro'], ariana:['veneno'], courtney:['fuego'], tabitha:['fuego'],
  shelly:['agua'], matt:['agua'], plumeria:['veneno'], faba:['psiquico'], wicke:['psiquico'], phyco:['tierra'], dulse:['dragon'], soliera:['acero'], zossie:['electrico']};
const TORRE_AFIN = [
  [/aqua|swimmer|fisher|sailor|surfer|scuba|diver|tuber|beauty|firefighter/, ['agua']],
  [/magma|firebreather|kindler|flare/, ['fuego']],
  [/bug/, ['bicho']],
  [/bird|skytrainer|pilot/, ['volador']],
  [/psychic|sage|medium|mystic|channeler/, ['psiquico', 'fantasma']],
  [/hex|ghost/, ['fantasma']],
  [/blackbelt|battlegirl|crush|karate|roughneck|bodybuilder|hoopster|striker|linebacker/, ['lucha']],
  [/hiker|ruin|worker|backpacker|cyclist|biker/, ['roca', 'tierra', 'acero']],
  [/^ski|snow|boarder|workerice/, ['hielo']],
  [/dragon|tamer/, ['dragon']],
  [/skull|punk|streetthug|delinquent|ruffian|rocket|galactic|plasma|yell|star/, ['veneno', 'siniestro']],
  [/engineer|guitarist|rocker|scientist|gamer/, ['electrico', 'acero']],
  [/gardener|aroma|farmer|breeder|ranger|picnicker|camper/, ['planta', 'bicho', 'normal']],
  [/fairy|lady|idol|madame|parasol|dancer|model/, ['hada', 'normal']]
];
let TORRE_SETS = null;                                                                   // todos los Pokémon ya preparados del juego (líderes y Campo), uno por especie
function torreSets(){
  if(TORRE_SETS) return TORRE_SETS;
  const seen = new Set(), out = [];
  [...Object.values(TEAMS), ...CAMPO.map(T => T.team)].forEach(t => (t || []).forEach(s => { if(s && s.dex && mon(s.dex) && !seen.has(s.dex)){ seen.add(s.dex); out.push(s); } }));
  return TORRE_SETS = out;
}
function torreEquipo(x, n){                                                              // n Pokémon distintos, con los tipos que le pegan a ese personaje si hay bastantes
  const base = x.f.split('-')[0], af = TORRE_FIRMA[base] || (TORRE_AFIN.find(([re]) => re.test(x.f)) || [null, null])[1] || (invHas(x, 'vi') ? ['siniestro', 'veneno'] : null), all = torreSets();
  const mix = l => l.map(s => [s, Math.random()]).sort((a, b) => a[1] - b[1]).map(p => p[0]);
  const fit = af ? mix(all.filter(s => mon(s.dex).types.some(t => af.includes(t)))) : [];
  const out = fit.slice(0, Math.max(n - 1, Math.min(n, fit.length)));                  // casi todo de su tipo y alguno de otro, para que no sea tan previsible
  for(const s of mix(all)){ if(out.length >= n) break; if(!out.includes(s)) out.push(s); }
  return out;
}
// ---- La subida: los 50 rivales, decididos al empezar ----
// Pisos normales: los siguientes personajes de la lista (desde save.tower.rot). Pisos 10/20/30/40/50: Campeones distintos al azar.
function torrePlanFrom(rot){
  const L = torreRivales(), champs = FLOORS.filter(F => F.kind === 'campeon' && TEAMS[F.id]), R = invSeeded(rot * 31 + 7);
  const cs = champs.map(F => [F, R()]).sort((a, b) => a[1] - b[1]).map(p => p[0]);
  const plan = []; let k = 0, b = 0;
  for(let f = 1; f <= TORRE_MAX; f++){
    if(f % TORRE_BOSS_CADA === 0){ const F = cs[b++ % cs.length]; plan.push({boss:true, id:F.id, name:F.leader}); }
    else { const x = L[(rot + k++) % L.length]; plan.push({id:'inv_' + x.f, x, name:x.n, path:invUrl(x.f)}); }
  }
  return plan;
}
const torreRun = {floor:0, active:false, plan:null};                                     // la subida en marcha (solo en memoria)
const torrePlan = () => torreRun.active && torreRun.plan ? torreRun.plan : torrePlanFrom(save.tower.rot || 0);
function torreFight(f){
  if(!towerOpen()){ toast('La Torre Batalla se abre al ser Campeón de Kanto.'); return; }
  if(team.length !== 3){ toast('Elige 3 Pokémon en EQUIPO POKÉMON para subir a la Torre.'); return; }
  if(f === 1 || !torreRun.active || !torreRun.plan){ f = 1; torreRun.plan = torrePlanFrom(save.tower.rot || 0); torreRun.active = true; save.tower.runs++; persist(); }   // nueva subida
  torreRun.floor = f;
  const P = torreRun.plan[f - 1], boss = !!P.boss, S = torreStats(f, boss);
  let o, vs;
  if(boss){
    const F = FLOORS.find(x => x.id === P.id);
    o = {torre:true, estTorre:true, torreFloor:f, floor:f, n:-1, leader:F.id, boss:F.kind, arena:F.arena, leaderName:F.leader, rival:F.leader, title:'TORRE BATALLA', sub:`PISO ${f} · CAMPEÓN · ${F.leader.toUpperCase()}`, enemies:TEAMS[F.id], hm:S.hm, dm:S.dm, skill:S.skill, spdm:S.spdm, lvl:S.lvl};
    const im = new Image(); loadLeaderInto(im, F.id); im.onload = () => { o.portrait = im.src; };                 // su retrato para la pantalla del estadio
    vs = {name:F.leader, id:F.id, enemies:TEAMS[F.id], label:`TORRE · PISO ${f} · CAMPEÓN`, music:o};
  }else{
    save.tower.rot = (save.tower.rot || 0) + 1; persist();                               // ya te has enfrentado a este personaje: el próximo será otro
    const team2 = P.team || (P.team = torreEquipo(P.x, f < 15 ? 3 : 4));
    o = {torre:true, estTorre:true, torreFloor:f, floor:f, n:-1, leader:'torre_' + P.id, arena:'campo', leaderName:P.name, rival:P.name, portrait:P.path, title:'TORRE BATALLA', sub:`PISO ${f} · ${P.name.toUpperCase()}`, enemies:team2, hm:S.hm, dm:S.dm, skill:S.skill, spdm:S.spdm, lvl:S.lvl};
    vs = {name:P.name, path:P.path, enemies:team2, label:`TORRE · PISO ${f}`, music:o};
  }
  vs.go = () => prGo(o);                                                                  // se juega en el ESTADIO de la Torre (js/pruebas.js · fondos/estadio_torre.webp)
  vsIntro(vs);
}

// Suma una recompensa a la partida y la deja en lastReward para la pantalla de victoria
function torreGive(r){
  Object.entries(r).forEach(([id, n]) => { if(id === 'tickets') save.tickets += n; else if(id === 'ticketsL') save.ticketsL += n; else if(id === 'bp') save.bp += n; else save.items[id] = held(id) + n; });
  lastReward = {list:Object.entries(r), dbl:false};
}
function torreEnd(won){                                                                  // lo llama endBattle (modes.js) cuando el combate es de la Torre
  g.over = true;
  const o = g.o, f = o.torreFloor, tw = save.tower, b = $('rBtns'); b.innerHTML = '';
  const add = (t, fn, main) => { const x = document.createElement('button'); x.textContent = t; if(main) x.className = 'main'; x.onclick = fn; b.appendChild(x); };
  if(won){
    const r = Object.assign({}, torreReward(f)), chips = [];
    TORRE_HITOS.forEach(h => { if(f >= h.f && !tw.ms[h.f]){ tw.ms[h.f] = 1;
      Object.entries(h).forEach(([k, v]) => { if(k !== 'f') r[k] = (r[k] || 0) + v; }); chips.push({t:`¡Premio único del piso ${h.f}!`, c:'#ffcc33'}); } });
    torreGive(r); tw.total++;
    const rec = f > tw.best; if(rec){ tw.best = f; chips.push({t:`¡NUEVO RÉCORD: piso ${f}!`, c:'#ff3ea5'}); } else chips.push({t:`Tu récord: piso ${tw.best}`, c:'#8fb3e8'});
    if(f >= TORRE_MAX){ chips.push({t:'¡TORRE COMPLETADA!', c:'#ffd84a'}); torreRun.active = false; torreRun.plan = null; }
    else if((f + 1) % TORRE_BOSS_CADA === 0) chips.push({t:'¡El siguiente piso es un Campeón!', c:'#ff9a3a'});
    persist(); if(typeof achSync === 'function') achSync(); refreshHud();
    victoryScreen({title:`¡Piso ${f} superado!`, sub:o.leaderName, rewards:lastReward, chips, leader:o.leader, path:o.portrait});
    if(f < TORRE_MAX) add(`Subir al piso ${f + 1}`, () => torreFight(f + 1), true); else add('Volver a subir (piso 1)', () => torreFight(1), true);
  }else{
    torreRun.active = false; torreRun.plan = null;
    resultClear(); $('rTitle').textContent = `Has caído en el piso ${f}`;
    $('rText').textContent = `${o.leaderName} ha ganado. Has superado ${f - 1} piso${f - 1 === 1 ? '' : 's'} en esta subida. Tu récord: piso ${tw.best}. En la próxima subida te esperan personajes nuevos.`;
    add('Volver a subir (piso 1)', () => torreFight(1), true);
  }
  add('La Torre', () => { g = null; openTorre(); });
  add('Menú', () => { g = null; goMain(); });
  setTimeout(() => { show('result'); Sfx.play(won ? 'win' : 'lose'); }, 900);
}

// ---- PANTALLA DE LA TORRE ----
const TORRE_RWN = {bp:() => 'BP', tickets:n => n === 1 ? 'tirada' : 'tiradas', ticketsL:n => n === 1 ? 'legendaria' : 'legendarias', chapa:n => n === 1 ? 'dorada' : 'doradas',
  chapaplata:n => n === 1 ? 'plateada' : 'plateadas', estrella:n => n === 1 ? 'estrella' : 'estrellas', estrella_t:n => n === 1 ? 'estrella rosa' : 'estrellas rosas'};   // (chapas doradas/plateadas, estrellas de Invocación)
const torreRw = r => Object.entries(r).map(([id, n]) => `${n} ${TORRE_RWN[id] ? TORRE_RWN[id](n) : id}`).join(' · ');
// Pantalla #torrev sobre la ilustración fondos/torre_dia.webp (de 8:00 a 19:59) o torre_noche.webp (de 20:00 a 7:59).
// Los pisos van DENTRO del cristal de la torre (twFit los coloca encima de la imagen): se ven 10 y con las flechas se cambia de tramo.
// Cada piso enseña a su rival: los vencidos en esta subida y el siguiente, a la vista; los demás, en silueta; los Campeones con corona.
const TW_BG = {w:2880, h:1607, glass:{x:.436, y:.2195, w:.128, h:.5605}};               // dónde está el cristal de la torre en la imagen (en fracciones)
const twNight = () => { const h = new Date().getHours(); return h >= 20 || h < 8; };
const TW_ICO = {
  boss:'<svg viewBox="0 0 24 24"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill="currentColor"/></svg>',
  gift:'<svg viewBox="0 0 24 24"><path d="M4 11h16v10H4zM3 7h18v4H3zM12 7v14M12 7c-2-4-6-4-6-1s4 1 6 1c2 0 6 2 6-1s-4-3-6 1" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  who:'<svg viewBox="0 0 24 32"><circle cx="12" cy="8" r="6" fill="currentColor"/><path d="M1 32c0-9 5-15 11-15s11 6 11 15z" fill="currentColor"/></svg>',
  up:'<svg viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  dn:'<svg viewBox="0 0 24 24"><path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
let twPage = -1;                                                                          // tramo de 10 pisos que estás mirando (−1 = el de tu siguiente piso)
const twNext = () => torreRun.active ? Math.min(TORRE_MAX, torreRun.floor + 1) : 1;      // el siguiente combate
const twCurPage = () => twPage >= 0 ? twPage : Math.floor((twNext() - 1) / 10);
function openTorre(){
  const el = $('torrev');
  if(!el.dataset.built){
    el.dataset.built = '1';
    el.addEventListener('click', e => { const b = e.target.closest('[data-tw]'); if(!b) return; const a = b.dataset.tw;
      if(a === 'back') goMain(); else if(a === 'team') openTeam('torre'); else if(a === 'go') torreFight(twNext()); else if(a === 'new'){ torreRun.active = false; torreFight(1); }
      else if(a === 'up' || a === 'dn' || a === 'pg'){ const z = a === 'pg' ? +b.dataset.z : twCurPage() + (a === 'up' ? 1 : -1); twPage = Math.max(0, Math.min(TORRE_MAX / 10 - 1, z)); twRenderTower(); } });
    addEventListener('keydown', e => { if(e.code === 'Escape' && !$('torrev').classList.contains('hide')){ e.preventDefault(); goMain(); } });
    addEventListener('resize', () => { if(!$('torrev').classList.contains('hide')) twFit(); });
  }
  twPage = -1;
  const tw = save.tower, ready = team.length === 3, open = towerOpen(), run = torreRun.active, nx = twNext();
  const nextBoss = Math.ceil(nx / TORRE_BOSS_CADA) * TORRE_BOSS_CADA, hNext = TORRE_HITOS.find(h => !tw.ms[h.f]), P = torrePlan(), rivN = P[nx - 1];
  const ej = [1, 3, 10, 30, 50].map(f => `<div class="tw-rw${f % TORRE_BOSS_CADA ? '' : ' boss'}"><b>Piso ${f}${f % TORRE_BOSS_CADA ? '' : ' · Campeón'}</b><span>${torreRw(torreReward(f))}</span></div>`).join('');
  const hit = TORRE_HITOS.map(h => { const got = !!tw.ms[h.f], r = Object.assign({}, h), pct = Math.min(1, tw.best / h.f); delete r.f;
    return `<div class="tw-h${got ? ' got' : ''}${h.f === TORRE_MAX ? ' fin' : ''}"><div class="hd"><b>Piso ${h.f}${h.f === TORRE_MAX ? ' · ¡cima!' : ''}</b><em>${got ? '✓ Conseguido' : `${Math.min(tw.best, h.f)} / ${h.f}`}</em></div><span>${torreRw(r)}</span><i class="hp"><s style="width:${pct * 100}%"></s></i></div>`; }).join('');
  const mons = [1, 0, 2].map(ti => { const d = team[ti]; if(!d) return `<div class="tw-mon empty"><span>Hueco ${ti + 1}</span></div>`;
    const m = mon(d); return `<div class="tw-mon${ti === 0 ? ' lead' : ''}" style="--c1:${TC[m.types[0]]}"><canvas width="160" height="160" data-d="${d}"></canvas><b>${esc(m.name)}</b>${ti === 0 ? '<small>Líder</small>' : ''}</div>`; }).join('');
  const seen = Math.min(tw.rot || 0, torreRivales().length);
  el.innerHTML = `<div class="tw2 ${twNight() ? 'night' : 'day'}" id="twRoot">
    <div class="tw-glass" id="twGlass"></div>
    <div class="tw-nav" id="twNav"></div>
    <header class="tw-top"><button class="tw-btn" data-tw="back">☰ Menú</button>
      <div class="tw-banner"><h1>Torre Batalla</h1></div>
      <div class="tw-rec"><b>Récord: piso ${tw.best}</b></div></header>
    <aside class="tw-left">
      <section class="tw-panel"><h3>Tu equipo</h3><div class="tw-team">${mons}</div>
        <div class="tw-row"><label class="tw-sel"><select id="twTeamSel" aria-label="Equipo" ${run ? 'disabled' : ''}></select></label><button class="tw-btn wide" data-tw="team" ${run ? 'disabled' : ''}>Equipo Pokémon</button></div></section>
      <section class="tw-panel"><h3>Reglas</h3><ul class="tw-rules">
        <li><i>❤</i><span>Tus Pokémon se <b>curan del todo</b> en cada piso.</span></li>
        <li><i class="o">${TW_ICO.boss}</i><span>Cada <b>${TORRE_BOSS_CADA} pisos</b>, un <b class="o">Campeón</b>.</span></li>
        <li><i>★</i><span>Rivales <b>nuevos</b> en cada subida. Si pierdes, empiezas de nuevo, pero <b>lo ganado es tuyo</b>.</span></li></ul></section>
      <div class="tw-start">${!open ? '<p class="tw-warn">Se abre al ser Campeón de Kanto.</p>' : !ready ? '<p class="tw-warn">Elige 3 Pokémon en Equipo Pokémon.</p>' : ''}
        <button class="tw-go" data-tw="go" ${open && ready ? '' : 'disabled'}><span>${run ? 'Seguir' : '¡Subir!'}</span><small>${run ? `Piso ${nx}` : 'Empiezas en el piso 1'} · contra ${esc(rivN.boss ? 'un Campeón' : rivN.name)}</small></button>
        ${run ? '<button class="tw-btn" data-tw="new">Empezar otra subida (piso 1)</button>' : ''}</div>
    </aside>
    <aside class="tw-right">
      <section class="tw-panel tw-stats"><div class="st"><b>${tw.best}</b><small>Récord</small></div><div class="st"><b>${seen}</b><small>Rivales vistos</small></div><div class="st"><b>${tw.runs}</b><small>Subidas</small></div></section>
      <section class="tw-panel"><h3>Próximos objetivos</h3><div class="tw-goals">
        <div class="tw-goal boss">${TW_ICO.boss}<span>Siguiente Campeón<b>Piso ${nextBoss}</b></span></div>
        ${hNext ? `<div class="tw-goal gift">${TW_ICO.gift}<span>Premio único<b>Piso ${hNext.f}</b></span></div>` : '<div class="tw-goal gift">★<span>¡Torre<b>completada!</b></span></div>'}</div></section>
      <section class="tw-panel"><h3>Premio por piso</h3><div class="tw-rws">${ej}</div></section>
      <section class="tw-panel tw-hits"><h3>Premios únicos</h3>${hit}</section>
    </aside>
  </div>`;
  show('torrev');
  fillTeamSel('twTeamSel', openTorre);
  el.querySelectorAll('canvas[data-d]').forEach(c => typeof hbPaint === 'function' ? hbPaint(c, +c.dataset.d, useShiny(+c.dataset.d)) : paintSprite(c, +c.dataset.d, {sc:4, fit:150, shiny: useShiny(+c.dataset.d)}));
  twRenderTower(); twFit();
}
// Los 10 pisos del tramo que miras, dentro del cristal, con su rival, y la barra de tramos al lado
function twRenderTower(){
  const tw = save.tower, pg = twCurPage(), lo = pg * 10 + 1, nx = twNext(), P = torrePlan(), hitos = Object.fromEntries(TORRE_HITOS.map(h => [h.f, h])), out = [];
  for(let f = lo + 9; f >= lo; f--){
    const p = P[f - 1], boss = !!p.boss, h = hitos[f], done = torreRun.active && f < nx, isNx = f === nx, show = done || isNx, rec = f === tw.best;
    const pic = boss ? (show ? `<img class="pic" data-lid="${p.id}" alt="">` : `<span class="who">${TW_ICO.who}</span>`) : `<img class="pic${show ? '' : ' sil'}" src="${p.path}" alt="" loading="lazy">`;
    out.push(`<div class="tw-fl${boss ? ' boss' : ''}${done ? ' done' : ''}${isNx ? ' next' : ''}${f === TORRE_MAX ? ' top' : ''}">
      <span class="no">${f}</span>${boss ? `<span class="crown">${TW_ICO.boss}</span>` : ''}
      <span class="nm">${show ? esc(p.name) : boss ? 'Campeón' : '???'}</span>
      ${h ? `<span class="gf${tw.ms[f] ? ' got' : ''}">${TW_ICO.gift}</span>` : ''}${done ? '<span class="ok">✓</span>' : ''}${pic}
      ${isNx ? `<span class="tag nx">${torreRun.active ? 'Siguiente' : 'Primer rival'}</span>` : rec ? '<span class="tag rec">Récord</span>' : ''}</div>`);
  }
  $('twGlass').innerHTML = `<div class="tw-zn"><span>Pisos ${lo} - ${lo + 9}</span></div><div class="tw-fls">${out.join('')}</div>`;
  $('twGlass').querySelectorAll('img[data-lid]').forEach(im => loadLeaderInto(im, im.dataset.lid));
  const pages = Array.from({length: TORRE_MAX / 10}, (_, i) => i).reverse();
  $('twNav').innerHTML = `<button class="tw-arr" data-tw="up" ${pg >= TORRE_MAX / 10 - 1 ? 'disabled' : ''} aria-label="Pisos de arriba">${TW_ICO.up}</button>
    <div class="tw-zbar">${pages.map(i => { const a = i * 10 + 1, full = tw.best >= a + 9, part = tw.best >= a;
      return `<button data-tw="pg" data-z="${i}" class="${i === pg ? 'on' : ''}${full ? ' full' : part ? ' part' : ''}" title="Pisos ${a}-${a + 9}"><i>${TW_ICO.boss}</i><small>${a}-${a + 9}</small></button>`; }).join('')}</div>
    <button class="tw-arr" data-tw="dn" ${pg <= 0 ? 'disabled' : ''} aria-label="Pisos de abajo">${TW_ICO.dn}</button>`;
}
// Coloca el fondo (cubre la pantalla; si sobra alto, se recorta el CIELO y no la entrada) y pone los pisos encima del cristal
function twFit(){
  const root = $('twRoot'); if(!root || !root.offsetWidth) return;
  const W = root.offsetWidth, H = root.offsetHeight, B = TW_BG, s = Math.max(W / B.w, H / B.h), iw = B.w * s, ih = B.h * s, ox = (W - iw) / 2, oy = H - ih;   // pegado abajo
  root.style.setProperty('--bgs', `${Math.ceil(iw)}px ${Math.ceil(ih)}px`); root.style.setProperty('--bgp', `${Math.round(ox)}px ${Math.round(oy)}px`);
  const G = B.glass, gx = ox + G.x * iw, gy = Math.max(oy + G.y * ih, root.querySelector('.tw-banner').getBoundingClientRect().bottom - root.getBoundingClientRect().top + 6), gw = G.w * iw, gh = oy + (G.y + G.h) * ih - gy;
  Object.assign($('twGlass').style, {left: gx + 'px', top: gy + 'px', width: gw + 'px', height: gh + 'px'});
  const nav = $('twNav'); nav.style.left = (gx + gw + Math.max(8, gw * .08)) + 'px'; nav.style.top = gy + 'px'; nav.style.height = gh + 'px';
}
