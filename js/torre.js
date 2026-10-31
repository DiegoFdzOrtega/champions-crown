"use strict";
/* =====================================================================
   TORRE BATALLA: subida infinita por pisos
   - Empiezas en el piso 1 con tu equipo de 3. Cada piso es un combate contra un rival; al vencerlo sube el siguiente (sin límite).
   - Tus Pokémon se CURAN POR COMPLETO en cada piso (cada combate empieza con toda la vida, como siempre).
   - Si pierdes, la subida termina. Lo que hayas ganado ya es tuyo: las recompensas se dan en CADA piso superado y suben con el piso.
   - Se guarda tu récord (piso más alto superado) en save.tower = {best, total, runs, ms:{piso:1}} (va a la nube con la partida).
   - Se abre al vencer a los Campeones de TODAS las Ligas que ya existen en el juego (towerOpen). Hoy son 6; al añadir Alola, Galar y Paldea pedirá 9 sola.
   - Rivales: los entrenadores del Campo de Entrenamiento (CAMPO, campo.js) + los que añadas en TORRE_EXTRA (mismo formato, con su sprite en entrenadores/).
     Cada TORRE_BOSS_CADA pisos sale un JEFE: un miembro del Alto Mando (y, desde el piso TORRE_CAMPEONES_DESDE, también los Campeones), con sus 6 Pokémon.
   - TODO el equilibrio está en las tablas de aquí abajo: TORRE_CURVA (dificultad), torreReward (premio por piso) y TORRE_HITOS (premios únicos).
   Se carga DESPUÉS de campo.js (usa CAMPO, DIFF, FLOORS...). El combate lo cierra torreEnd(), que llama endBattle (modes.js).
   ===================================================================== */
const TORRE_BOSS_CADA = 10;                         // cada cuántos pisos hay jefe
const TORRE_CAMPEONES_DESDE = 30;                   // a partir de este piso los jefes pueden ser Campeones (antes, solo Alto Mando)
const TORRE_EXTRA = [];                             // entrenadores nuevos: {id, file, name, cls, theme, tier, team:[P(...)...]} igual que en CAMPO (campo.js)

// Dificultad por piso. Usa la misma fórmula que la Historia y el Campo (DIFF en data.js): n = «posición» equivalente y lvl = nivel equivalente.
//   piso 1 ≈ Campo Fácil · piso 10 ≈ Campo Difícil · piso ~40 ≈ la Campeona Dianta · más arriba, cada vez más fuerte (sin tope: es infinita).
const TORRE_CURVA = {
  n:   f => 2 + f * .30,                            // sube sin parar: así la Torre acaba siendo imposible
  lvl: f => Math.min(180, 106 + 2 * f),             // nivel equivalente (tope 180; después solo sube n)
  jefe: {n: 3, lvl: 6}                              // los jefes llevan +3 de n y +6 de nivel
};
function torreStats(f, boss){
  const D = DIFF.dificil, n = TORRE_CURVA.n(f) + (boss ? TORRE_CURVA.jefe.n : 0), lvl = TORRE_CURVA.lvl(f) + (boss ? TORRE_CURVA.jefe.lvl : 0), k = lvl / 100;
  return {lvl, hm:D.hm(n) * k, dm:D.dm(n) * k, skill:Math.min(1, D.skill(n)), spdm:1 + (k - 1) * .4};
}

// Premio por cada piso superado (sube con el piso). Claves: bp, tickets, chapaplata, chapa (como el resto de recompensas del juego).
function torreReward(f){
  const r = {bp: 20 + 4 * f};
  if(f % 5 === 0) r.tickets = 1 + Math.floor(f / 10);                                // cada 5 pisos: tiradas de Gachapon
  if(f % TORRE_BOSS_CADA === 0){ r.chapaplata = Math.min(30, f / 2); r.chapa = Math.min(20, Math.floor(f / 5)); }   // al vencer a un jefe: chapas
  return r;
}
// Premios ÚNICOS: la primera vez que superas ese piso. (ticketsL = tickets legendarios)
const TORRE_HITOS = [
  {f:10,  bp:300},
  {f:25,  bp:800,   tickets:5},
  {f:50,  bp:2000,  tickets:10,  ticketsL:1},
  {f:75,  bp:5000,  tickets:20,  ticketsL:2},
  {f:100, bp:10000, tickets:40,  ticketsL:3}
];

// ---- ¿Está abierta? ----
const leaguesAvail = () => REGIONS.filter(r => FLOORS.some(F => F.region === r));          // Ligas que ya existen en el juego
const towerOpen = () => { const a = leaguesAvail(); return a.length > 0 && a.every(champAny); };
const towerNeed = () => leaguesAvail().filter(r => !champAny(r)).length;

// ---- La subida (solo vive en memoria: al cerrar la página, empiezas otra) ----
const torreRun = {floor:0, last:[]};
const torrePool = () => CAMPO.filter(T => !T.opt).concat(TORRE_EXTRA);
function torrePick(f){                                                                   // elige el rival del piso f (sin repetir los últimos 6)
  if(f % TORRE_BOSS_CADA === 0){
    const bosses = FLOORS.filter(F => (F.kind === 'alto' || (f >= TORRE_CAMPEONES_DESDE && F.kind === 'campeon')) && TEAMS[F.id]);
    const fresh = bosses.filter(F => !torreRun.last.includes('b:' + F.id)), list = fresh.length ? fresh : bosses;
    const F = list[Math.floor(Math.random() * list.length)]; return {boss:F};
  }
  const tier = f < 10 ? [1, 1, 2] : f < 25 ? [1, 2, 2, 3] : [2, 3, 3];                    // los primeros pisos, rivales fáciles; más arriba, los difíciles
  let pool = torrePool().filter(T => tier.includes(T.tier) && !torreRun.last.includes(T.id));
  if(!pool.length) pool = torrePool().filter(T => !torreRun.last.includes(T.id));
  if(!pool.length) pool = torrePool();
  return {T: pool[Math.floor(Math.random() * pool.length)]};
}
function torreFight(f){
  if(!towerOpen()){ toast('La Torre Batalla todavía está cerrada.'); return; }
  if(team.length !== 3){ toast('Elige 3 Pokémon en EQUIPO POKÉMON para subir a la Torre.'); return; }
  if(f === 1){ torreRun.last = []; save.tower.runs++; persist(); }                         // nueva subida
  torreRun.floor = f;
  const pick = torrePick(f), boss = !!pick.boss, S = torreStats(f, boss);
  let o, vs;
  if(boss){
    const F = pick.boss, arena = F.arenas ? F.arenas[Math.floor(Math.random() * F.arenas.length)] : F.arena;
    torreRun.last.push('b:' + F.id);
    o = {torre:true, torreFloor:f, floor:f, n:-1, leader:F.id, boss:F.kind, arena, leaderName:F.leader, title:'TORRE BATALLA', sub:`PISO ${f} · JEFE · ${F.leader.toUpperCase()}`, enemies:TEAMS[F.id], hm:S.hm, dm:S.dm, skill:S.skill, spdm:S.spdm, lvl:S.lvl};
    vs = {name:F.leader, id:F.id, enemies:TEAMS[F.id], label:`TORRE · PISO ${f} · JEFE`, music:o};
  }else{
    const T = pick.T; torreRun.last.push(T.id); if(torreRun.last.length > 6) torreRun.last.shift();
    o = {torre:true, torreFloor:f, floor:f, n:-1, leader:'torre_' + T.id, arena:'campo', leaderName:T.name, portrait:'entrenadores/' + T.file, title:'TORRE BATALLA', sub:`PISO ${f} · ${T.name.toUpperCase()}`, enemies:T.team, hm:S.hm, dm:S.dm, skill:S.skill, spdm:S.spdm, lvl:S.lvl};
    vs = {name:T.name, path:'entrenadores/' + T.file, enemies:T.team, label:`TORRE · PISO ${f}`, music:o};
  }
  vs.go = () => startBattle(o);
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
    TORRE_HITOS.forEach(h => { if(f >= h.f && !tw.ms[h.f]){ tw.ms[h.f] = 1;                         // premio único del hito (si saltas de piso, no se pierde ninguno)
      Object.entries(h).forEach(([k, v]) => { if(k !== 'f') r[k] = (r[k] || 0) + v; }); chips.push({t:`¡Premio único del piso ${h.f}!`, c:'#ffcc33'}); } });
    torreGive(r); tw.total++;
    const rec = f > tw.best; if(rec){ tw.best = f; chips.push({t:`¡NUEVO RÉCORD: piso ${f}!`, c:'#ff3ea5'}); } else chips.push({t:`Tu récord: piso ${tw.best}`, c:'#8fb3e8'});
    if((f + 1) % TORRE_BOSS_CADA === 0) chips.push({t:'¡El siguiente piso tiene jefe!', c:'#ff9a3a'});
    persist(); if(typeof achSync === 'function') achSync(); refreshHud();
    victoryScreen({title:`¡Piso ${f} superado!`, sub:o.leaderName, rewards:lastReward, chips, leader:o.leader, path:o.portrait});
    add(`Subir al piso ${f + 1}`, () => torreFight(f + 1), true);
  }else{
    resultClear(); $('rTitle').textContent = `Has caído en el piso ${f}`;
    $('rText').textContent = `${o.leaderName} ha ganado. Has superado ${f - 1} piso${f - 1 === 1 ? '' : 's'} en esta subida. Tu récord: piso ${tw.best}. Tus Pokémon se curan solos: vuelve a subir cuando quieras.`;
    add('Volver a subir (piso 1)', () => torreFight(1), true);
  }
  add('La Torre', () => { g = null; openTorre(); });
  add('Menú', () => { g = null; goMain(); });
  setTimeout(() => { show('result'); Sfx.play(won ? 'win' : 'lose'); }, 900);
}

// ---- PANTALLA DE LA TORRE ----
const torreRw = r => Object.entries(r).map(([id, n]) => `${n} ${({bp:'BP', tickets:n === 1 ? 'tirada' : 'tiradas', ticketsL:n === 1 ? 'legendaria' : 'legendarias', chapa:n === 1 ? 'Chapa Dorada' : 'Chapas Doradas', chapaplata:n === 1 ? 'Chapa Plateada' : 'Chapas Plateadas'})[id] || id}`).join(' · ');
function openTorre(){
  const ready = team.length === 3, tw = save.tower, next = tw.best + 1, nextBoss = Math.ceil(next / TORRE_BOSS_CADA) * TORRE_BOSS_CADA;
  panel(`<div class="stbanner twbanner"><h1>Torre Batalla</h1>
      <p>Sube piso a piso sin parar. En cada piso tus Pokémon se curan por completo, pero los rivales son cada vez más fuertes. Si pierdes, la subida termina y empiezas otra desde el piso 1: lo que hayas ganado ya es tuyo.</p>
      <div class="stchips"><span class="stc gold"><b>Récord: piso ${tw.best}</b></span><span class="stc"><b>${tw.total}</b> pisos superados en total</span><span class="stc"><b>${tw.runs}</b> subidas</span>
        <label class="tsel cp-sel">Equipo <select id="twTeamSel"></select></label><button id="twTeam" class="cp-team">Equipo Pokémon →</button></div></div>
    <p id="twWarn" class="warn"></p>
    <div class="tw-go"><button id="twStart" class="main">Empezar la subida (piso 1)</button><span class="help">Próximo jefe: piso ${TORRE_BOSS_CADA}${tw.best >= TORRE_BOSS_CADA ? ` · el siguiente que te falta por superar: piso ${nextBoss}` : ''}</span></div>
    <h2 class="sth">Recompensas</h2>
    <p class="help">Cada piso superado da premio, y cuanto más alto, más. Ejemplos de lo que da un piso: piso 1 → ${torreRw(torreReward(1))} · piso 5 → ${torreRw(torreReward(5))} · piso 10 (jefe) → ${torreRw(torreReward(10))} · piso 30 (jefe) → ${torreRw(torreReward(30))}.</p>
    <h2 class="sth">Premios únicos</h2>
    <p class="help">La primera vez que superas cada uno de estos pisos, ganas un premio extra:</p>
    <div id="twHitos" class="tw-hitos"></div>`);
  $('panelBody').classList.add('wide');
  fillTeamSel('twTeamSel', openTorre); $('twTeam').onclick = () => openTeam('torre');
  $('twWarn').textContent = ready ? '' : 'Elige 3 Pokémon en EQUIPO POKÉMON para poder subir.';
  $('twStart').disabled = !ready; $('twStart').onclick = () => torreFight(1);
  $('twHitos').innerHTML = TORRE_HITOS.map(h => { const got = !!tw.ms[h.f], r = Object.assign({}, h); delete r.f;
    return `<div class="tw-h${got ? ' got' : ''}"><b>Piso ${h.f}</b><span>${torreRw(r)}</span><em>${got ? '✓ Conseguido' : tw.best >= h.f ? '' : 'Te faltan ' + (h.f - tw.best) + ' pisos'}</em></div>`; }).join('');
}
