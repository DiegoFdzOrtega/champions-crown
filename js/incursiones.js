"use strict";
/* =====================================================================
   INCURSIONES SEMANALES · un legendario por semana, muy difícil, en un mapa grande. Ganarlo = poder capturarlo.
   (De momento, modo de 1 jugador. El online para 2-4 jugadores irá después con las mismas reglas que pvp.js.)

   CÓMO FUNCIONA
   - INC_LEGS: la lista de legendarios. Cada semana (de lunes a domingo) toca uno: incLeg(). Por ahora solo Darkrai.
   - Cada jugador lleva 3 Pokémon de su equipo activo (los elige en la pantalla de Incursiones). Si caen los 3, se acaba.
   - El combate usa el estadio grande con cámara que sigue a tu Pokémon (js/torreestadio.js) con OTRA imagen: el mapa del legendario.
     o.incursion = true · o.estRegion = true (para que torreestadio.js lo trate como estadio grande).
   - Obstáculos del mapa (rocas, grupos de pinos y troncos): son "pilares" que no se rompen (g.pil con mapa:true, js/combat.js):
     no se atraviesan, paran los disparos y la IA no dispara a través de ellos. El agua no se pisa pero los disparos pasan por encima.
     El jefe flota: atraviesa todo (agua incluida).
   - El jefe: más grande (INC.jefeK), mucha vida, 3 fases (INC.fase2 / fase3), escudo en la fase 2, furia en la 3 y límite de tiempo.
     Sus ataques propios (Pesadilla, Brecha Negra en anillo, tentáculos) avisan antes con una zona en el suelo.
   - Al ganar: pantalla de captura con su Ball (Ocaso Ball para Darkrai) y la probabilidad de INC.captura.
   - Intentos ILIMITADOS (se puede repetir todas las veces que quieras).
   - Guardado propio: save.inc {fallos:{dex:n}, ganadas, capturas} (se lee aquí mismo: state.js no conoce esta clave).
   Todos los números ajustables llevan [AJUSTE].
   ===================================================================== */
const INC = {
  piso: 30,                              // [AJUSTE] la fuerza base del jefe es la de un Campeón del piso 30 de la Torre (torreStats)
  hpMul: [4, 9, 14, 19],                 // [AJUSTE] vida del jefe × (1, 2, 3 o 4 jugadores)
  dmMul: .45,                            // [AJUSTE] daño de sus ataques normales (1 = el de un Campeón del piso; con 1 su ataque fuerte te deja K.O. de un golpe)
  tiempo: 300,                           // [AJUSTE] segundos antes de su ataque final (pierde todo el equipo)
  equipo: 3,                             // Pokémon por jugador
  jefeK: 3.2,                            // [AJUSTE] tamaño del jefe (× el de un Pokémon normal)
  fase2: .66, fase3: .33,                // [AJUSTE] vida a la que cambia de fase
  escudo: .12,                           // [AJUSTE] vida del escudo de la fase 2 (fracción de la vida máxima del jefe)
  escudoNoEficaz: .15,                   // [AJUSTE] lo que quita al escudo un golpe que NO es súper eficaz (1 = todo)
  pesadilla: {cada: [7, 4.5], r: 120, aviso: 1.5, dmg: .16, sueno: 2},       // [AJUSTE] cada (normal, furioso) · radio · segundos de aviso · daño (fracción de la vida máx.) · segundos dormido
  brecha: {cada: [17, 11], aviso: 2.2, vel: 640, dmg: .24, sueno: 2.5},      // [AJUSTE] anillo que se expande desde el jefe: cúbrete detrás de una roca
  tentaculos: {cada: 2.6, n: 3, r: 78, aviso: 1.1, dmg: .1, lejos: 230},    // [AJUSTE] solo con furia: zonas alrededor de ti
  malSueno: .045,                        // [AJUSTE] vida por segundo que pierdes dormido (habilidad Mal Sueño)
  furiaVel: 1.3,                         // [AJUSTE] velocidad con furia
  captura: {base: .30, porMon: .05, porFallo: .15, shiny: .01},             // [AJUSTE] probabilidad de captura
  premio: {bp: 1500, tickets: 3, chapaplata: 5},                            // [AJUSTE] premio por ganar (aunque falle la captura)
  repetidoBP: 500                        // [AJUSTE] si capturas uno que ya tenías (y no sale shiny)
};
// Mapa de Isla Lunanueva (assets/fondos/incursiones/lunanueva.webp, 5504 × 3072). Las medidas van en "cuadros" de 4 píxeles de la imagen
// (la imagen reducida a 1376 × 768): así se leen fácil sobre una cuadrícula. q = cuadros; el mundo = q × 4 × S.
const INC_MAP_LUNA = {
  src: 'assets/fondos/incursiones/lunanueva.webp', w: 5504, h: 3072, S: .8, luz: 1.35,                // [AJUSTE] S = tamaño del mundo respecto a la imagen · luz = brillo (la imagen es muy oscura)
  area: [105, 70, 1275, 695],            // por dónde se puede andar [x0, y0, x1, y1]
  agua: [[482, 118, 888, 292]],          // charca: no se pisa (el jefe flota por encima)
  jefe: [740, 205], yo: [690, 640],      // dónde sale cada uno (el jefe, en la isla de la charca)
  obst: [                                // [x, y, radio] rocas, grupos de pinos y troncos
    [278, 115, 18], [140, 185, 25], [943, 88, 12], [1197, 197, 22], [1015, 224, 12], [450, 322, 14], [862, 312, 20],
    [1205, 450, 12], [1045, 488, 12], [855, 522, 18], [145, 490, 8], [115, 548, 18], [262, 602, 12], [614, 566, 14], [1250, 532, 12], [1180, 648, 10],
    [150, 292, 40], [985, 393, 48], [617, 510, 40], [1135, 620, 30],
    [322, 236, 13], [348, 232, 13], [928, 235, 9], [1045, 150, 10], [1065, 158, 10], [955, 603, 13], [985, 598, 13], [1010, 592, 10], [543, 650, 12], [572, 658, 12]
  ]
};
const INC_LEGS = [
  {id: 'darkrai', dex: 491, nombre: 'Darkrai', lugar: 'Isla Lunanueva', juego: 'Pokémon Platino', ball: 'ocaso', col: '#8a5cff',
   mv: ['Garra Umbría', 'Pulso Umbrío', 'Brecha Negra', 'Bola Sombra'], mapa: INC_MAP_LUNA,
   frase: 'Dicen que quien duerme en esta isla sufre pesadillas sin fin...'}
];
const INC_BALLS = {ocaso: {n: 'Ocaso Ball', top: '#1f5a3a', top2: '#2f7a4e', dib: '#f0b030', bot: '#16181f'}};      // dibujo de cada Ball (hasta tener la imagen de Gemini)

// ---------------------------------------------------------------------
// SEMANA, INTENTOS Y GUARDADO
// ---------------------------------------------------------------------
(function incLoad(){
  let s = null; try{ s = JSON.parse(localStorage.getItem('arena2d_v2') || 'null'); }catch(e){}
  const o = s && s.inc && typeof s.inc === 'object' ? s.inc : {}, n = v => Math.max(0, Math.min(1e6, Math.floor(+v) || 0));
  const f = o.fallos && typeof o.fallos === 'object' ? o.fallos : {}, fl = {}; Object.keys(f).forEach(k => fl[k] = Math.min(20, n(f[k])));
  save.inc = {fallos: fl, ganadas: n(o.ganadas), capturas: n(o.capturas)};
})();
function incLunes(d){ const x = new Date(d || Date.now()); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }   // lunes de esta semana a las 00:00
const incSemana = () => Math.floor((incLunes().getTime() - new Date(2026, 0, 5).getTime()) / (7 * 864e5) + .5);   // nº de semana desde el lunes 5-1-2026
const incLeg = () => INC_LEGS[((incSemana() % INC_LEGS.length) + INC_LEGS.length) % INC_LEGS.length];
function incQueda(){                                                       // texto con lo que falta para el cambio de legendario
  const fin = incLunes(); fin.setDate(fin.getDate() + 7); const ms = fin - Date.now(), d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
  return d > 0 ? `${d} d ${h} h` : h > 0 ? `${h} h ${m} min` : `${m} min`;
}
function incProb(dex, vivos){ const C = INC.captura; return Math.min(1, C.base + C.porMon * vivos + C.porFallo * (save.inc.fallos[dex] || 0)); }

// ---------------------------------------------------------------------
// PANTALLA DE INCURSIONES
// ---------------------------------------------------------------------
VIEWS.push('incv');
{ const d = document.createElement('div'); d.id = 'incv'; d.className = 'screen ui hide'; document.body.insertBefore(d, $('vs')); }
let incSel = null;                                                          // los 3 Pokémon elegidos (nº de Pokédex)
const incMons = () => team.filter(d => !hidden(d));
function incSelOk(){ const M = incMons(); if(!incSel) incSel = M.slice(0, INC.equipo); incSel = incSel.filter(d => M.includes(d)); return incSel; }
function openInc(){
  const el = $('incv'), L = incLeg(), M = incMons(), sel = incSelOk(), owned = save.box.includes(L.dex);
  if(!el.dataset.built){
    el.dataset.built = '1';
    el.addEventListener('click', e => { const b = e.target.closest('[data-inc]'); if(!b) return; const a = b.dataset.inc;
      if(a === 'back') goMain(); else if(a === 'team') openTeam('inc'); else if(a === 'go') incGo();
      else if(a === 'mon'){ const d = +b.dataset.d, i = incSel.indexOf(d); if(i >= 0) incSel.splice(i, 1); else if(incSel.length < INC.equipo) incSel.push(d); else { incSel.shift(); incSel.push(d); } openInc(); } });
    addEventListener('keydown', e => { if(e.code === 'Escape' && !$('incv').classList.contains('hide')){ e.preventDefault(); goMain(); } });
  }
  incImg(L);                                                                // empieza a cargar el mapa
  const C = INC.captura, fal = save.inc.fallos[L.dex] || 0;
  const mons = M.map(d => { const m = mon(d), i = sel.indexOf(d);
    return `<button class="inc-mon${i >= 0 ? ' on' : ''}" data-inc="mon" data-d="${d}" style="--c1:${TC[m.types[0]]};--c2:${TC[m.types[1] || m.types[0]]}">${i >= 0 ? `<i class="n">${i + 1}</i>` : ''}<canvas width="96" height="96" data-d="${d}"></canvas><b>${esc(m.name)}</b></button>`; }).join('');
  const ready = sel.length === INC.equipo;
  el.innerHTML = `<div class="inc" style="--lc:${L.col}">
    <header class="inc-top"><button class="inc-btn" data-inc="back">☰ Menú</button><div class="inc-ban"><h1>Incursión semanal</h1><p>Cambia de legendario en <b>${incQueda()}</b></p></div>
      <div class="inc-left"><b>${save.inc.ganadas}</b><small>Victorias</small></div></header>
    <section class="inc-hero">
      <div class="inc-map" style="background-image:url('${L.mapa.src}')"><i class="fog"></i></div>
      <canvas class="inc-boss" id="incBoss" width="320" height="320"></canvas>
      <div class="inc-info"><small class="k">Legendario de la semana</small><h2>${L.nombre}</h2><p class="lug">${L.lugar} · ${L.juego}</p><p class="fr">«${L.frase}»</p>
        <div class="inc-chips"><span>1 – 4 jugadores</span><span>${INC.equipo} Pokémon por jugador</span><span>${INC.tiempo / 60 | 0} min</span>${owned ? '<span class="got">✓ Ya lo tienes</span>' : ''}</div></div>
    </section>
    <div class="inc-cols">
      <section class="inc-box"><h3>Cómo se juega</h3><ul>
        <li><b>Te persigue</b> y marca en el suelo <b class="r">en rojo</b> dónde van a caer sus ataques en área: sal de ahí o esquiva con la carrera.</li>
        <li><b>Fase 2:</b> se protege con un <b>escudo</b> que solo rompen los ataques <b>súper eficaces</b> (Lucha, Bicho y Hada). Lanza <b>Brecha Negra</b>: un anillo enorme. <b>Escóndete detrás de una roca o un árbol</b>.</li>
        <li><b>Fase 3:</b> se <b>enfurece</b>: más rápido y salen tentáculos de sombra del suelo.</li>
        <li>Si te duerme, pierdes vida mientras duermes (<b>Mal Sueño</b>).</li>
        <li>Si pasan <b>${INC.tiempo / 60 | 0} minutos</b>, lanza su ataque final y perdéis.</li></ul></section>
      <section class="inc-box"><h3>Premio y captura</h3>
        <p>Al ganar: <b>${INC.premio.bp} BP</b>, <b>${INC.premio.tickets} tiradas</b> y <b>${INC.premio.chapaplata} chapas plateadas</b>, y un intento de captura con la <b>${INC_BALLS[L.ball].n}</b>.</p>
        <div class="inc-prob"><span>Base <b>${Math.round(C.base * 100)} %</b></span><span>+${Math.round(C.porMon * 100)} % por cada Pokémon tuyo en pie</span><span>+${Math.round(C.porFallo * 100)} % por cada fallo anterior${fal ? ` <b>(llevas ${fal})</b>` : ''}</span></div>
        <p class="sm">Puede salir shiny (${Math.round(C.shiny * 100)} %).</p></section>
      <section class="inc-box inc-team"><h3>Tus ${INC.equipo} Pokémon <small>${sel.length} / ${INC.equipo}</small></h3>
        <div class="inc-mons">${mons || '<p>Tu equipo está vacío.</p>'}</div>
        <div class="inc-tr"><label class="tw-sel"><select id="incTeamSel" aria-label="Equipo"></select></label><button class="inc-btn" data-inc="team">Editar equipo</button></div></section>
    </div>
    <div class="inc-go">${sel.length < INC.equipo ? `<p class="warn">Elige ${INC.equipo} Pokémon.</p>` : ''}
      <button class="inc-start" data-inc="go" ${ready ? '' : 'disabled'}><span>¡A la incursión!</span><small>Solo · ${L.nombre}</small></button>
      <p class="sm">Con amigos (2 – 4 jugadores): muy pronto.</p></div>
  </div>`;
  show('incv');
  if($('incTeamSel')) fillTeamSel('incTeamSel', () => { incSel = null; openInc(); });
  el.querySelectorAll('canvas[data-d]').forEach(c => paintSprite(c, +c.dataset.d, {sc: 3, fit: 88, shiny: useShiny(+c.dataset.d)}));
  incBossLoop();
}
function incBossLoop(){                                                      // el legendario flotando en la pantalla de Incursiones
  const c = $('incBoss'); if(!c) return; const L = incLeg(), x = c.getContext('2d'), t = performance.now() / 1000;
  x.clearRect(0, 0, c.width, c.height); x.imageSmoothingEnabled = false;
  const gr = x.createRadialGradient(160, 190, 10, 160, 190, 150); gr.addColorStop(0, L.col + '66'); gr.addColorStop(1, L.col + '00'); x.fillStyle = gr; x.fillRect(0, 0, 320, 320);
  if(!drawFrame(x, L.dex, 'Idle', t, 0, 160, 200 + Math.sin(t * 1.6) * 6, 5, 0, false)) paintSprite(c, L.dex, {sc: 6, fit: 280});
  if(!$('incv').classList.contains('hide')) requestAnimationFrame(incBossLoop);
}
// openTeam('inc'): al cerrar el equipo se vuelve aquí (team.js decide adónde volver con su parámetro; si no lo conoce, va al menú)
{ const o = openTeam; openTeam = function(from){ const r = o.apply(this, arguments); if(from === 'inc') incBackFromTeam = true; return r; }; }
let incBackFromTeam = false;
{ const o = goMain; goMain = function(){ if(incBackFromTeam && !$('teamv').classList.contains('hide')){ incBackFromTeam = false; incSel = null; return openInc(); } incBackFromTeam = false; return o.apply(this, arguments); }; }

// ---------------------------------------------------------------------
// EMPEZAR EL COMBATE
// ---------------------------------------------------------------------
const INC_CFG = {};                                                          // configuración del estadio grande para cada mapa (teUse, torreestadio.js)
function incCfg(L){
  const M = L.mapa; if(INC_CFG[M.src]) return INC_CFG[M.src];
  const W = Math.round(M.w * M.S), H = Math.round(M.h * M.S), q = v => v * 4 * M.S;
  return INC_CFG[M.src] = {src: M.src, w: M.w, h: M.h, S: M.S, org: [0, 0], W, H, B: {x0: 0, y0: 0, x1: W, y1: H}, inc: true, Z: .62, Zmin: .4,   // [AJUSTE] Z / Zmin: zoom de la cámara
    plat: [[M.yo[0] * 4, M.yo[1] * 4], [M.jefe[0] * 4, M.jefe[1] * 4]], img: null, map: M, q};
}
function incImg(L){ const C = incCfg(L); if(!C.img){ const im = new Image(); im.onload = () => { im.ok = true; if(typeof TE_EST !== 'undefined' && TE_EST === C) TE.stad = null; }; im.src = C.src; C.img = im; } return C.img; }
const incOn = () => !!(g && g.o && g.o.incursion);
const incBoss = () => incOn() ? g.e[0] : null;
function incGo(){
  const L = incLeg(), sel = incSelOk();
  if(sel.length < INC.equipo){ toast(`Elige ${INC.equipo} Pokémon.`); return; }
  const S = torreStats(INC.piso, true), n = 1;
  const o = {incursion: true, estRegion: true, incLeg: L.id, incTeam: sel.slice(), incN: n, floor: 0, n: -1, leader: '', arena: '', title: 'INCURSIÓN',
    sub: `INCURSIÓN · ${L.nombre.toUpperCase()}`, rival: L.nombre, leaderName: L.nombre,
    enemies: [P(L.dex, L.nat || 'Miedosa', '', null, L.ev || {spa: 252, spe: 252, hp: 4}, L.mv.slice())], hm: S.hm * INC.hpMul[n - 1], dm: S.dm * INC.dmMul, skill: Math.min(1, S.skill + .1), spdm: S.spdm, lvl: S.lvl};
  incImg(L); startBattle(o);
}
// startBattle: con TUS 3 Pokémon elegidos (sin tocar el equipo guardado), el mapa del legendario y las posiciones de salida
{ const o = startBattle; startBattle = function(o2, again){
    if(!o2 || !o2.incursion) return o.apply(this, arguments);
    const keep = team; team = o2.incTeam.slice();
    try{ o.call(this, o2, true); } finally { team = keep; }                  // again = true: no cuenta usos ni guarda (así el equipo de 3 nunca se guarda)
    if(!g || g.o !== o2) return;
    const L = INC_LEGS.find(x => x.id === o2.incLeg) || incLeg(), C = incCfg(L), M = L.mapa;
    teUse(C); LOCKW = TE.W; resize();
    TE.hp = new Map(); TE.hype = 0; TE.stad = null;
    g.p.forEach(f => { f.x = C.q(M.yo[0]); f.y = C.q(M.yo[1]); f.dir = 0; });
    const B = g.e[0]; B.x = C.q(M.jefe[0]); B.y = C.q(M.jefe[1]); B.dir = 4; B.boss = true;
    B.ghost = false; if(typeof lzOp !== 'undefined') lzOp = lzOp.filter(q => q.to !== B);    // Darkrai NO sale de una Ball: ya te está esperando en su isla (lanzar.js)
    TE.cam.t = 0; TE.cam.inc = false;                                       // la cámara de la incursión se coloca sola en Darkrai (ver abajo)
    g.pil = M.obst.map(([x, y, r]) => ({x: C.q(x), y: C.q(y), r: C.q(r), hp: 1e9, age: 0, fall: 0, hitT: 0, seed: 0, mapa: true}));   // obstáculos fijos (ver arriba)
    g.inc = {fase: 1, z: [], ring: null, t: {pes: 4, bre: 5, ten: 1.5}, shield: 0, shMax: 0, furia: false, banner: {txt: `¡${L.nombre.toUpperCase()} TE ESPERA!`, c: '#d9c8ff', t: 0}, fin: false, L};
    g.count = Math.max(g.count, 3.5);                                         // la cuenta atrás enseña el mapa entero
  }; }
// Al acabar: la incursión tiene su propio final
{ const o = endBattle; endBattle = function(won){ if(g && g.o && g.o.incursion) return incEnd(won); return o.apply(this, arguments); }; }
// Pausa: «Salir» vuelve a Incursiones
{ const o = exitBattle; exitBattle = function(){ if(!(g && g.o && g.o.incursion)) return o.apply(this, arguments); g = null; $('pause').classList.add('hide'); Music.duck(false); openInc(); }; }
{ const o = restartBattle; restartBattle = function(){
    if(!(g && g.o && g.o.incursion)) return o.apply(this, arguments);
    return o.apply(this, arguments); }; }
{ const o = enter; enter = function(k){ if(k === 'raid') return openInc(); return o.apply(this, arguments); }; }

// ---------------------------------------------------------------------
// MAPA: imagen con más luz, sin público ni entrenadores; límites y agua
// ---------------------------------------------------------------------
{ const o = teBuild; teBuild = function(){
    if(!(TE_EST && TE_EST.inc)) return o.apply(this, arguments);
    const B = TE.B, c = TE.stad = document.createElement('canvas'); c.width = B.x1 - B.x0; c.height = B.y1 - B.y0;
    const s = c.getContext('2d'); s.fillStyle = '#0b1018'; s.fillRect(0, 0, c.width, c.height);
    if(TE_EST.img && TE_EST.img.ok){ s.imageSmoothingEnabled = true; s.imageSmoothingQuality = 'high'; s.filter = `brightness(${TE_EST.map.luz || 1})`; s.drawImage(TE_EST.img, 0, 0, c.width, c.height); s.filter = 'none'; }
    else TE.stad = null;                                                     // aún no ha cargado: se vuelve a intentar en el siguiente cuadro
    if(!TE.dec || TE.dec.width !== TE.W){ TE.dec = document.createElement('canvas'); TE.dec.width = TE.W; TE.dec.height = TE.H; }
    if(!TE.stad){ TE.stad = document.createElement('canvas'); TE.stad.width = 2; TE.stad.height = 2; TE.stadTmp = true; } else TE.stadTmp = false;
  }; }
{ const o = teDraw; teDraw = function(){ if(TE.stadTmp && TE_EST.img && TE_EST.img.ok) TE.stad = null; return o.apply(this, arguments); }; }
{ const o = teFans; teFans = function(){ if(TE_EST && TE_EST.inc){ TE.crowd.length = 0; return; } return o.apply(this, arguments); }; }
{ const o = teTrainers; teTrainers = function(){ if(incOn()) return; return o.apply(this, arguments); }; }
{ const o = teCrater; teCrater = function(){ if(incOn()) return; return o.apply(this, arguments); }; }   // sin cráteres: el mapa ya es así de bonito
{ const o = prClamp; prClamp = function(f){
    o.apply(this, arguments); if(!incOn()) return;
    const C = TE_EST, M = C.map; if(!M) return; const a = M.area;
    f.x = Math.max(C.q(a[0]), Math.min(C.q(a[2]), f.x)); f.y = Math.max(C.q(a[1]), Math.min(C.q(a[3]), f.y));
    if(f.boss) return;
    for(const w of M.agua){                                                  // el agua: te quedas en la orilla más cercana
      const x0 = C.q(w[0]), y0 = C.q(w[1]), x1 = C.q(w[2]), y1 = C.q(w[3]), fy = f.y + 20;
      if(f.x > x0 && f.x < x1 && fy > y0 && fy < y1){ const d = [f.x - x0, x1 - f.x, fy - y0, y1 - fy], m = Math.min(...d);
        if(m === d[0]) f.x = x0; else if(m === d[1]) f.x = x1; else if(m === d[2]) f.y = y0 - 20; else f.y = y1 - 20; }
    }
  }; }
// los obstáculos del mapa no se rompen ni se dibujan (ya están en la imagen); el jefe flota por encima de ellos
{ const o = pilBreak; pilBreak = function(p){ if(p && p.mapa) return; return o.apply(this, arguments); }; }
{ const o = pilDamage; pilDamage = function(p){ if(p && p.mapa) return; return o.apply(this, arguments); }; }
{ const o = pilDraw; pilDraw = function(p){ if(p && p.mapa) return; return o.apply(this, arguments); }; }
{ const o = pilPush; pilPush = function(f){ if(f && f.boss && incOn()) return; return o.apply(this, arguments); }; }
// el jefe, más grande
{ const o = szK; szK = function(dex){ const k = o.apply(this, arguments); return incOn() && g.e[0] && g.e[0].m.dex === dex ? k * INC.jefeK : k; }; }

// ---------------------------------------------------------------------
// EL JEFE: fases, escudo, furia y sus ataques en área
// ---------------------------------------------------------------------
{ const o = update; update = function(dt){
    const r = o.apply(this, arguments);
    if(incOn() && !g.over && !g.paused && g.count <= 0 && !g.mega){ try{ incTick(dt); }catch(e){ console.warn('Incursión:', e); } }
    return r;
  }; }
function incBanner(txt, c){ g.inc.banner = {txt, c: c || '#ff5a8a', t: 0}; fx.shake = Math.max(fx.shake, 10); Sfx.play('hit_super'); }
function incTick(dt){
  const I = g.inc, E = g.e[0], P = g.p[g.pi]; if(!I || !E) return;
  // el gran final por tiempo
  if(g.clock >= INC.tiempo && !I.fin){ I.fin = true; incBanner('¡PESADILLA ETERNA!', '#ff3e5f'); I.ring = {x: E.x, y: E.y, t: INC.brecha.aviso, r: 0, hit: true, fin: true};
    g.p.forEach(f => { if(!f.dead){ f.hp = 0; f.dead = true; f.dt = 0; setAct(f, 'Faint', 99); } }); }
  if(E.dead) { I.z.length = 0; return; }
  const k = E.hp / E.max;
  if(I.fase === 1 && k <= INC.fase2){ I.fase = 2; I.shMax = I.shield = E.max * INC.escudo; I.t.bre = 2.5; incBanner('¡ESCUDO DE SOMBRAS!', '#b48cff'); }
  if(I.fase === 2 && k <= INC.fase3){ I.fase = 3; I.furia = true; E.spdm = (E.spdm || 1) * INC.furiaVel; incBanner(`¡${g.o.rival.toUpperCase()} SE ENFURECE!`, '#ff3e5f'); }
  const F = I.furia ? 1 : 0, alive = P && !P.dead && !P.ghost;
  // Pesadilla: un charco oscuro bajo tus pies
  if((I.t.pes -= dt) <= 0){ I.t.pes = INC.pesadilla.cada[F]; if(alive) I.z.push({k: 'pes', x: P.x, y: P.y + 24, r: INC.pesadilla.r, T: INC.pesadilla.aviso, t: 0, dmg: INC.pesadilla.dmg, sl: INC.pesadilla.sueno}); }
  // Brecha Negra en anillo (fase 2 y 3)
  if(I.fase >= 2 && !I.ring && (I.t.bre -= dt) <= 0){ I.t.bre = INC.brecha.cada[F]; I.ring = {x: E.x, y: E.y, t: 0, r: 0, hit: false}; Sfx.play('charge'); }
  // tentáculos (furia)
  if(I.furia && (I.t.ten -= dt) <= 0){ const T = INC.tentaculos; I.t.ten = T.cada;
    if(alive) for(let i = 0; i < T.n; i++){ const a = Math.random() * 6.283, d = i === 0 ? 0 : 60 + Math.random() * T.lejos; I.z.push({k: 'ten', x: P.x + Math.cos(a) * d, y: P.y + 24 + Math.sin(a) * d * .7, r: T.r, T: T.aviso + i * .15, t: 0, dmg: T.dmg}); } }
  // zonas que estallan
  for(const z of I.z){ z.t += dt; if(z.t >= z.T && !z.done){ z.done = true; z.boom = 0;
      fxBurst(z.x, z.y - 10, z.k === 'pes' ? ['#5a2a9a', '#1a0a2a', '#ff5a8a'] : ['#2a0a3a', '#7a3aba', '#000000'], 16, 220); Sfx.play('hit', .7);
      if(alive && Math.hypot(P.x - z.x, (P.y + 24 - z.y) * 1.25) < z.r + 18) incHurt(P, z.dmg, z.x, z.y, z.sl); } }
  I.z = I.z.filter(z => !z.done || (z.boom += dt) < .45);
  // el anillo de la Brecha Negra
  const R = I.ring;
  if(R){
    R.t += dt;
    if(R.t < INC.brecha.aviso){ R.x = E.x; R.y = E.y; }                      // se está cargando: brilla alrededor del jefe
    else{
      R.r += INC.brecha.vel * dt;
      if(!R.hit && alive){ const d = Math.hypot(P.x - R.x, P.y - R.y);
        if(R.r >= d){ R.hit = true;
          if(pilBlocks(R.x, R.y, P.x, P.y, 4)) g.pops.push({x: P.x, y: P.y - 130, txt: '¡A CUBIERTO!', t: 1.2, c: '#7fe3ff', s: 12});
          else incHurt(P, INC.brecha.dmg, R.x, R.y, INC.brecha.sueno); } }
      if(R.r > Math.hypot(TE.W, TE.H)) I.ring = null;
    }
  }
  // Mal Sueño: dormido pierdes vida
  if(alive && P.st && P.st.k === 'slp') stDamage(P, P.max * INC.malSueno * dt, 'slp');
}
function incHurt(P, frac, x, y, sleep){                                    // daño de un ataque en área del jefe (fracción de tu vida máxima)
  if(P.dead || P.ghost) return;
  if(P.inv > 0){ dodgeOk(P); return; }
  const dmg = P.max * frac; P.hp -= dmg;
  const a = Math.atan2(P.y - y, P.x - x); P.kx = (P.kx || 0) + Math.cos(a) * 420; P.ky = (P.ky || 0) + Math.sin(a) * 420; P.kbHit = true;
  g.pops.push({x: P.x, y: P.y - 110, txt: '-' + Math.round(dmg), t: 1, c: '#ff7a9a', s: 13});
  fxBurst(P.x, P.y - 20, ['#ff5a8a', '#2a0a3a', '#ffffff'], 12, 200); fx.shake = Math.max(fx.shake, 7); Sfx.play('hit_super', .8);
  if(P.hp <= 0){ P.hp = 0; P.dead = true; P.dt = 0; setAct(P, 'Faint', 99); return; }
  setAct(P, 'Hurt', .3);
  if(sleep) statusInflict(P, 'slp', sleep, g.e[0]);
}
// ESCUDO: mientras dure, el jefe no pierde vida; los golpes súper eficaces lo rompen
{ const o = hit; hit = function(T, dmg, type){
    const I = incOn() && g.inc; if(!I || !T.boss || I.shield <= 0) return o.apply(this, arguments);
    const hp0 = T.hp, dead0 = T.dead; o.apply(this, arguments);
    const dealt = Math.max(0, hp0 - T.hp); T.hp = hp0; if(!dead0 && T.dead){ T.dead = false; T.dt = 0; setAct(T, 'Hurt', .3); }
    if(dealt <= 0) return;
    const sup = eff(type, T.m.types) >= 2; I.shield -= dealt * (sup ? 1 : INC.escudoNoEficaz);
    if(I.shield <= 0){ I.shield = 0; incBanner('¡ESCUDO ROTO!', '#7fe3ff'); fxBurst(T.x, T.y - 60, ['#b48cff', '#ffffff', '#7fe3ff'], 30, 320); setAct(T, 'Hurt', 1.2); T.stun = Math.max(T.stun || 0, 1.5); }
    else g.pops.push({x: T.x, y: T.y - 170, txt: sup ? '¡SÚPER EFICAZ!' : '¡ESCUDO!', t: .8, c: sup ? '#ffe066' : '#b48cff', s: 11});
  }; }
// Los disparos que llegan a una roca o un árbol del mapa se paran (también los fuertes: la piedra del mapa no se rompe)
{ const o = update; update = function(dt){
    if(incOn() && g.shots && g.pil){ for(const s of g.shots) if(s.life > 0) for(const p of g.pil) if(p.mapa && Math.hypot(s.x - p.x, s.y - p.y) < p.r + s.r * .5){ s.life = 0; fxBurst(s.x, s.y, ['#c9ccd6', '#ffffff'], 6, 100); break; } }
    return o.apply(this, arguments);
  }; }

// ---------------------------------------------------------------------
// DIBUJO: zonas de aviso, anillo, escudo y furia (en el suelo del mapa) + barra del jefe (en la pantalla)
// ---------------------------------------------------------------------
{ const o = terrDraw; terrDraw = function(){ o.apply(this, arguments); if(incOn() && g.inc) incGround(); }; }
function incGround(){
  const I = g.inc, E = g.e[0], t = performance.now() / 1000; ctx.save();
  for(const z of I.z){                                                     // zona de aviso: se llena hasta que estalla
    const k = Math.min(1, z.t / z.T);
    if(!z.done){
      ctx.save(); ctx.translate(z.x, z.y); ctx.scale(1, .8);
      ctx.fillStyle = z.k === 'pes' ? `rgba(40,8,60,${.25 + k * .3})` : `rgba(20,0,30,${.3 + k * .3})`; ctx.beginPath(); ctx.arc(0, 0, z.r, 0, 7); ctx.fill();
      ctx.fillStyle = `rgba(255,60,110,${.18 + k * .3})`; ctx.beginPath(); ctx.arc(0, 0, z.r * k, 0, 7); ctx.fill();
      ctx.strokeStyle = `rgba(255,70,120,${.7 + .3 * Math.sin(t * 14)})`; ctx.lineWidth = 4; ctx.setLineDash([12, 8]); ctx.lineDashOffset = -t * 40; ctx.beginPath(); ctx.arc(0, 0, z.r, 0, 7); ctx.stroke();
      ctx.restore();
    } else {                                                               // estallido
      const b = z.boom / .45; ctx.save(); ctx.translate(z.x, z.y); ctx.scale(1, .8); ctx.globalAlpha = 1 - b;
      const gr = ctx.createRadialGradient(0, 0, 4, 0, 0, z.r * (1 + b * .4)); gr.addColorStop(0, '#ff5a8a'); gr.addColorStop(.5, '#4a1a7a'); gr.addColorStop(1, 'rgba(10,0,20,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, z.r * (1 + b * .4), 0, 7); ctx.fill(); ctx.restore();
    }
  }
  const R = I.ring;
  if(R){
    if(R.t < INC.brecha.aviso){                                              // carga: remolino oscuro bajo el jefe que crece
      const k = R.t / INC.brecha.aviso; ctx.save(); ctx.translate(R.x, R.y + 30); ctx.scale(1, .7);
      for(let i = 0; i < 3; i++){ ctx.strokeStyle = `rgba(150,90,255,${.3 + .5 * k})`; ctx.lineWidth = 6 - i * 1.5; ctx.beginPath(); ctx.arc(0, 0, 60 + i * 30 + k * 80 + Math.sin(t * 8 + i) * 6, t * 3 + i, t * 3 + i + 4.5); ctx.stroke(); }
      ctx.restore();
      if(Math.sin(t * 12) > 0) g.pops.push({x: R.x, y: R.y - 240, txt: '¡BRECHA NEGRA! ¡CÚBRETE!', t: .05, c: '#ff5a8a', s: 12});
    } else {                                                               // el anillo que avanza
      ctx.save(); ctx.translate(R.x, R.y); ctx.scale(1, .75);
      ctx.shadowColor = '#8a5cff'; ctx.shadowBlur = 24; ctx.strokeStyle = 'rgba(20,0,40,.85)'; ctx.lineWidth = 46; ctx.beginPath(); ctx.arc(0, 0, R.r, 0, 7); ctx.stroke();
      ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(170,110,255,.9)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, R.r + 20, 0, 7); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,80,140,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, Math.max(0, R.r - 22), 0, 7); ctx.stroke();
      ctx.restore();
    }
  }
  if(E && !E.dead){
    const I2 = idleInfo(E.m.dex), cy = E.y + (I2.top + I2.foot) * ESCALA / 2, rr = Math.max(80, I2.fw * ESCALA * .55);
    if(I.furia){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 3;                  // furia: llamas de sombra alrededor (contornos que tiemblan)
      for(let i = 0; i < 5; i++){ const a = t * 2 + i * 1.25; ctx.strokeStyle = i % 2 ? 'rgba(255,50,100,.45)' : 'rgba(150,70,255,.45)';
        ctx.beginPath(); ctx.ellipse(E.x + Math.cos(a) * 8, cy + Math.sin(a * 1.3) * 6, rr * (1 + .1 * Math.sin(t * 7 + i)), rr * (1.2 + .1 * Math.cos(t * 6 + i)), 0, 0, 7); ctx.stroke(); }
      const gl = ctx.createRadialGradient(E.x, E.y + 30, 10, E.x, E.y + 30, rr * 1.2); gl.addColorStop(0, 'rgba(255,40,90,.22)'); gl.addColorStop(1, 'rgba(255,40,90,0)');
      ctx.fillStyle = gl; ctx.beginPath(); ctx.ellipse(E.x, E.y + 30, rr * 1.2, rr * .5, 0, 0, 7); ctx.fill(); ctx.restore(); }
    if(I.shield > 0){ ctx.save(); const p = .5 + .2 * Math.sin(t * 4), k = I.shield / I.shMax;
      ctx.fillStyle = `rgba(140,90,255,${.12 + .1 * p})`; ctx.strokeStyle = `rgba(190,150,255,${.6 + .3 * p})`; ctx.lineWidth = 4;
      ctx.beginPath(); for(let i = 0; i <= 6; i++){ const a = i / 6 * 6.283 + t * .4; ctx.lineTo(E.x + Math.cos(a) * rr * 1.25, cy + Math.sin(a) * rr * 1.35); } ctx.fill(); ctx.stroke();
      ctx.globalAlpha = .5 * k; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(E.x, cy, rr * 1.1, t, t + 1.2); ctx.stroke(); ctx.restore(); }
  }
  ctx.restore();
}
{ const o = prFront; prFront = function(){ o.apply(this, arguments); if(incOn() && g.inc) incHud(); }; }
// Marco de la barra del jefe: la barra de energía del HUD (assets/iconos/hud/energia.png, de Gemini) teñida de morado (o de rojo con furia)
const INC_BAR = {}; { const im = new Image(); im.onload = () => INC_BAR.ok = true; im.src = 'assets/iconos/hud/energia.png?v=1'; INC_BAR.img = im; }
function incBarImg(furia){
  const k = furia ? 'red' : 'pur'; if(INC_BAR[k] || !INC_BAR.ok) return INC_BAR[k] || null;
  const im = INC_BAR.img, c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
  const x = c.getContext('2d'); x.filter = furia ? 'hue-rotate(150deg) saturate(1.5)' : 'hue-rotate(65deg) saturate(1.25)'; x.drawImage(im, 0, 0); return INC_BAR[k] = c;
}
let incHudT = 0;
function incHud(){
  const I = g.inc, E = g.e[0], SW = PR.SW, t = performance.now() / 1000; if(!E) return;
  const dt = Math.min(.05, incHudT ? t - incHudT : 0); incHudT = t;
  if(I.banner && (I.banner.t += dt) > 2.6) I.banner = null;               // el cartel grande avanza con el reloj real (también en la cuenta atrás y al acabar)
  ctx.save();
  if(!g.cap){
    // reloj arriba en el centro (la misma pieza del HUD que el resto de combates)
    const tw = 150, th = tw * 96 / 280, tx = SW / 2 - tw / 2, s = Math.max(0, INC.tiempo - g.clock) | 0, red = s < 30 && Math.sin(t * 8) > 0;
    if(typeof TE_HUDI !== 'undefined' && TE_HUDI.timer && TE_HUDI.timer.ok){ ctx.imageSmoothingEnabled = true; ctx.drawImage(TE_HUDI.timer, tx, 2, tw, th); }
    else { ctx.fillStyle = 'rgba(8,11,20,.85)'; ctx.fillRect(tx, 2, tw, th); }
    text(`${s / 60 | 0}:${String(s % 60).padStart(2, '0')}`, SW / 2, 2 + th * .62, 15, red ? '#ff5a5a' : '#ffffff', 'center');
    // barra del jefe
    const w = Math.min(640, SW * .52), h = w * 105 / 1580, x = SW / 2 - w / 2, y = th + 16, k = Math.max(0, E.hp / E.max), fr = incBarImg(I.furia);
    const ix = x + w * .035, iw = w * .93, iy = y + h * .3, ih = h * .42;
    if(fr){ ctx.imageSmoothingEnabled = true; ctx.drawImage(fr, x, y, w, h); } else { ctx.fillStyle = '#120a26'; ctx.fillRect(x, y, w, h); }
    ctx.fillStyle = '#0a0618'; ctx.fillRect(ix, iy, iw, ih);
    const gr = ctx.createLinearGradient(0, iy, 0, iy + ih); gr.addColorStop(0, I.furia ? '#ff8a9a' : '#c49cff'); gr.addColorStop(.45, I.furia ? '#ff3e5f' : '#8a4cff'); gr.addColorStop(1, I.furia ? '#a0102a' : '#4a1ab0');
    ctx.fillStyle = gr; ctx.fillRect(ix, iy, iw * k, ih);
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(ix, iy, iw * k, 2);
    if(I.shield > 0){ ctx.fillStyle = `rgba(220,205,255,${.55 + .2 * Math.sin(t * 5)})`; ctx.fillRect(ix, iy, iw * k * (I.shield / I.shMax), ih * .38); }
    [INC.fase2, INC.fase3].forEach(f => { ctx.fillStyle = '#0a0618'; ctx.fillRect(ix + iw * f - 2, iy - 2, 4, ih + 4); ctx.fillStyle = '#ffe08a'; ctx.fillRect(ix + iw * f - 1, iy - 1, 2, ih + 2); });   // marcas de las fases
    // nombre y fase encima de la barra
    textO(g.o.rival.toUpperCase(), x + w * .05, y - 2, 10, I.furia ? '#ff8a9a' : '#e4d4ff', 'left');
    textO(I.shield > 0 ? 'ESCUDO · usa ataques súper eficaces' : I.furia ? 'FASE 3 · FURIA' : `FASE ${I.fase} / 3`, x + w * .95, y - 2, 8, I.shield > 0 ? '#d9c8ff' : I.furia ? '#ff8a9a' : '#b9c6e8', 'right');
  }
  // cartel grande (cambio de fase, inicio, final)
  if(I.banner){ const b = I.banner, a = Math.max(0, Math.min(1, b.t * 4, (2.6 - b.t) * 2)), sc = 1 + Math.max(0, .3 - b.t) * 2;
    ctx.globalAlpha = a; const gb = ctx.createLinearGradient(0, 0, SW, 0); gb.addColorStop(0, 'rgba(10,0,20,0)'); gb.addColorStop(.25, 'rgba(10,0,20,.7)'); gb.addColorStop(.75, 'rgba(10,0,20,.7)'); gb.addColorStop(1, 'rgba(10,0,20,0)');
    ctx.fillStyle = gb; ctx.fillRect(0, H * .36, SW, 64);
    ctx.save(); ctx.translate(SW / 2, H * .36 + 42); ctx.scale(sc, sc); textO(b.txt, 0, 0, 20, b.c, 'center'); ctx.restore(); }
  ctx.restore();
}
// En la incursión no hace falta el panel del rival (arriba a la derecha) ni el marcador del centro: los sustituye la barra del jefe
{ const o = hud; hud = function(x, y, list){ if(incOn() && list === oppList()) return; return o.apply(this, arguments); }; }
{ const o = teCenter; teCenter = function(){ if(incOn()) return; return o.apply(this, arguments); }; }
{ const o = teArrow; teArrow = function(){ if(incOn() && g.cap) return; return o.apply(this, arguments); }; }
// CÁMARA de la incursión: nunca enseña lo de fuera del mapa (sin bordes negros). Al empezar, mira a Darkrai en su isla y baja hasta ti.
{ const o = teCamStep; teCamStep = function(){
    if(!incOn()) return o.apply(this, arguments);
    const now = performance.now() / 1000, dt = Math.min(.05, TE.cam.t ? now - TE.cam.t : .016); TE.cam.t = now;
    const c = TE.cam, M = myMon(), E = g.e[0], SW = teSW(), cover = Math.max(SW / TE.W, H / TE.H) * 1.01;
    let tz = TE.Z, tx, ty, sp = 4.5;
    if(g.count > 0){ const intro = g.count > 1.7; tx = intro ? E.x : M.x; ty = intro ? E.y - 60 : M.y - 40; tz = TE.Z * (intro ? 1.05 : 1); sp = intro ? 6 : 2.2; }
    else if(g.cap){ tx = E.x; ty = E.y - 40; tz = TE.Z * 1.1; sp = 3; }
    else{ const dx = Math.abs(E.x - M.x), dy = Math.abs(E.y - M.y), zf = Math.min(SW / (dx + 700), (H - 130) / (dy + 440));
      tz = Math.max(Math.max(cover, TE.Zmin), Math.min(TE.Z, zf)); tx = M.x + (E.x - M.x) * .3; ty = M.y + (E.y - M.y) * .3 - 40 / tz; }
    tz = Math.max(cover, tz);
    if(!c.inc){ c.inc = true; c.x = tx; c.y = ty; c.z = tz; }                  // el primer cuadro empieza ya en Darkrai (sin barrido desde el centro)
    c.z += (tz - c.z) * Math.min(1, dt * 2); const k = Math.min(1, dt * sp); c.x += (tx - c.x) * k; c.y += (ty - c.y) * k;
    const hw = SW / 2 / c.z, hh = H / 2 / c.z, B = TE.B;
    c.x = Math.max(B.x0 + hw, Math.min(B.x1 - hw, c.x)); c.y = Math.max(B.y0 + hh, Math.min(B.y1 - hh, c.y));
  }; }
// ---------------------------------------------------------------------
// FINAL: derrota, o victoria + captura
// ---------------------------------------------------------------------
function incEnd(won){
  if(g.over) return; g.over = true;
  const o = g.o, L = INC_LEGS.find(x => x.id === o.incLeg) || incLeg(), vivos = g.p.filter(f => !f.dead).length;
  if(!won){
    const b = $('rBtns'); b.innerHTML = ''; resultClear();
    $('rTitle').textContent = `${L.nombre} ha ganado esta vez`;
    $('rText').textContent = g.inc && g.inc.fin ? 'Se acabó el tiempo: su Pesadilla Eterna os ha dormido a todos. Hay que bajarle la vida más rápido.' : 'Han caído tus 3 Pokémon. Prueba con Pokémon de tipo Lucha, Bicho o Hada: son súper eficaces contra él y rompen su escudo.';
    const add = (t, fn, main) => { const x = document.createElement('button'); x.textContent = t; if(main) x.className = 'main'; x.onclick = fn; b.appendChild(x); };
    add('Reintentar', () => { g = null; incGo(); }, true);
    add('Incursiones', () => { g = null; openInc(); }); add('Menú', () => { g = null; goMain(); });
    setTimeout(() => { show('result'); Sfx.play('lose'); }, 900); return;
  }
  const P = INC.premio; save.bp += P.bp; save.tickets += P.tickets; save.items.chapaplata = (save.items.chapaplata || 0) + P.chapaplata;
  save.inc.ganadas++; persist(); if(typeof refreshHud === 'function') refreshHud();
  const E = g.e[0]; E.dead = false; E.hp = 0; E.st = null; setAct(E, 'Hurt', 1e9);           // no se desmaya: se queda en el mapa, agotado, esperando la Ball
  if(g.inc){ g.inc.z.length = 0; g.inc.ring = null; g.inc.banner = {txt: `¡${L.nombre.toUpperCase()} ESTÁ AGOTADO!`, c: '#ffe08a', t: 0}; }
  g.cap = {L, vivos, p: incProb(L.dex, vivos), fase: 'ask', t: 0};
  setTimeout(() => incAsk(), 1500);
}
// ---- CAPTURA EN EL MISMO MAPA: pregunta → lanzas la Ball → gira (sacudidas) → estrellas, o se rompe y se escapa ----
function incPanel(html){                                                     // panel pequeño abajo, sobre el combate (el mapa se sigue viendo)
  let ov = $('incCap'); if(!ov){ ov = document.createElement('div'); ov.id = 'incCap'; document.body.appendChild(ov); }
  ov.innerHTML = `<div class="cap-res">${html}</div>`; return ov;
}
function incAsk(){
  const C = g && g.cap; if(!C) return; const L = C.L;
  const ov = incPanel(`<h2>¿Quieres atrapar a ${L.nombre}?</h2><p>Lanzarás una <b>${(INC_BALLS[L.ball] || INC_BALLS.ocaso).n}</b>. Probabilidad de captura: <b>${Math.round(C.p * 100)} %</b></p>
    <div class="cap-btns"><button class="main" data-c="si">Sí</button><button data-c="no">No</button></div>`);
  ov.querySelector('[data-c="si"]').focus();
  ov.onclick = e => { const b = e.target.closest('[data-c]'); if(!b) return; ov.innerHTML = ''; if(b.dataset.c === 'si') incThrow(); else incCapResult(L, null, false, `Has dejado marchar a ${L.nombre}.`); };
}
function incThrow(){
  const C = g.cap, L = C.L, ok = Math.random() < C.p, shiny = ok && Math.random() < INC.captura.shiny;
  Object.assign(C, {fase: 'ball', t0: performance.now(), ok, shiny, shakes: ok ? 3 : Math.floor(Math.random() * 3), sfx: {}});      // si falla, se rompe tras 0, 1 o 2 sacudidas
  let res = '';
  if(ok){
    const nuevo = !save.box.includes(L.dex);
    if(nuevo){ save.box.push(L.dex); save.nat[L.dex] = Math.floor(Math.random() * NATURES.length); }
    if(shiny && !save.shiny.includes(L.dex)) save.shiny.push(L.dex);
    if(!nuevo && !shiny){ save.bp += INC.repetidoBP; res = `Ya lo tenías: +${INC.repetidoBP} BP.`; }
    else res = nuevo ? `¡${L.nombre} se une a tu colección!${shiny ? ' ¡Y es SHINY!' : ''}` : `¡Ahora también lo tienes SHINY!`;
    save.inc.fallos[L.dex] = 0; save.inc.capturas++;
  } else { save.inc.fallos[L.dex] = (save.inc.fallos[L.dex] || 0) + 1; res = `La próxima vez tendrás un ${Math.round(INC.captura.porFallo * 100)} % más de probabilidad.`; }
  C.res = res; persist(); if(typeof achSync === 'function') achSync();
}
// tiempos (segundos desde el lanzamiento)
const INC_CAP = {vuela: .8, dentro: 1.4, suelo: 1.9, espera: .5, sacudida: .95};
{ const o = prFront; prFront = function(){ o.apply(this, arguments); if(g && g.cap && g.cap.fase !== 'ask') try{ incCapDraw(); }catch(e){ console.warn(e); } }; }
function incCapDraw(){
  const C = g.cap, E = g.e[0], P = myMon(), T = INC_CAP, t = (performance.now() - C.t0) / 1000, B = INC_BALLS[C.L.ball] || INC_BALLS.ocaso, c = TE.cam, SW = PR.SW;
  const once = (k, fn) => { if(!C.sfx[k]){ C.sfx[k] = 1; fn(); } };
  const foot = E.y + 30, end = T.suelo + T.espera + C.shakes * T.sacudida;
  E.hide = t >= T.vuela && !(C.fase === 'fin' && !C.ok && t > end + .25) ? 1e9 : 0;               // dentro de la Ball no se dibuja el de siempre
  ctx.save(); ctx.translate(SW / 2, H / 2); ctx.scale(c.z, c.z); ctx.translate(-c.x, -c.y);   // a partir de aquí, coordenadas del mapa
  // el legendario entrando en la Ball: se encoge hacia ella con luz roja
  if(t >= T.vuela && t < T.dentro){ const k = (t - T.vuela) / (T.dentro - T.vuela);
    ctx.save(); ctx.translate(E.x, E.y - 60); ctx.scale(1 - k, 1 - k); ctx.translate(-E.x, -(E.y - 60)); ctx.globalAlpha = 1 - k * .5;
    drawFrame(ctx, E.m.dex, 'Hurt', t, E.dir, E.x, E.y, ESCALA, 0, E.shiny); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createRadialGradient(E.x, E.y - 60, 4, E.x, E.y - 60, 160 * (1 - k) + 20); gr.addColorStop(0, 'rgba(255,80,80,.9)'); gr.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(E.x, E.y - 60, 160 * (1 - k) + 20, 0, 7); ctx.fill(); ctx.restore(); }
  // la Ball
  let bx, by, rot = 0, broken = false;
  if(t < T.vuela){ const k = t / T.vuela; bx = P.x + (E.x - P.x) * k; by = (P.y - 40) + (E.y - 90 - (P.y - 40)) * k - Math.sin(k * Math.PI) * 220; rot = k * 14; once('lanza', () => Sfx.play('click')); }
  else if(t < T.suelo){ const k = Math.max(0, (t - T.dentro) / (T.suelo - T.dentro)); bx = E.x; by = E.y - 90 + k * (foot - (E.y - 90)) - (k > .7 ? Math.sin((k - .7) / .3 * Math.PI) * 26 : 0); once('dentro', () => { Sfx.play('hit_super'); fxBurst(E.x, E.y - 60, ['#ff5a5a', '#ffffff'], 18, 220); }); }
  else { bx = E.x; by = foot; const st = t - T.suelo - T.espera;
    if(st > 0 && st < C.shakes * T.sacudida){ const ph = st % T.sacudida; if(ph < .5) rot = Math.sin(ph / .5 * Math.PI * 2) * .5; for(let i = 0; i < C.shakes; i++) if(st > i * T.sacudida) once('s' + i, () => Sfx.play('click')); } }
  if(t > end){
    if(C.fase !== 'fin'){ C.fase = 'fin'; if(C.ok){ Sfx.play('win'); } else { Sfx.play('hit_super'); fx.shake = Math.max(fx.shake, 10); } setTimeout(() => { if(g && g.cap) incCapResult(C.L, C.ok, C.shiny, C.res); }, C.ok ? 1300 : 1600); }
    const k = t - end;
    if(C.ok){                                                                // ¡capturado!: la Ball quieta y estrellas que saltan
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for(let i = 0; i < 7; i++){ const a = -Math.PI / 2 + (i - 3) * .42, d = 30 + Math.min(1, k * 2) * 90, sx = bx + Math.cos(a) * d, sy = by - 20 + Math.sin(a) * d + k * k * 60;
        ctx.globalAlpha = Math.max(0, 1 - k * .7); incStar(sx, sy, 12 - i % 2 * 4, k * 4 + i); }
      ctx.restore();
    } else {                                                                 // se rompe: las dos mitades salen volando, destello, y el legendario sale y se va
      broken = true; const d = Math.min(1, k * 2.5);
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - k * .8);
      incHalf(bx - d * 70, by - d * 40 + d * d * 60, 26, -d * 3, B, true); incHalf(bx + d * 70, by - d * 30 + d * d * 60, 26, d * 3, B, false); ctx.restore();
      if(k < .4){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,255,255,${1 - k / .4})`; ctx.beginPath(); ctx.arc(bx, by, 40 + k * 400, 0, 7); ctx.fill(); ctx.restore(); }
      if(k > .25){ const f = Math.min(1, (k - .25) / 1.2); E.hide = 1e9;    // vuelve a salir y se desvanece hacia arriba
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - f); drawFrame(ctx, E.m.dex, 'Idle', t, E.dir, E.x, E.y - f * 160, ESCALA, 0, E.shiny); ctx.restore(); }
    }
  }
  if(!broken && t < T.vuela + .05 || (!broken && t >= T.dentro)) incBallDraw(ctx, bx, by, 26, rot, B, t >= T.vuela && t < T.dentro);
  ctx.restore();
}
function incStar(x, y, r, a){ ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = '#ffe680'; ctx.beginPath();
  for(let i = 0; i < 10; i++){ const rr = i % 2 ? r * .45 : r, q = i / 10 * 6.283 - Math.PI / 2; ctx.lineTo(Math.cos(q) * rr, Math.sin(q) * rr); } ctx.closePath(); ctx.fill(); ctx.restore(); }
function incHalf(x, y, r, rot, B, top){                                     // media Ball (al romperse)
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = top ? B.top : B.bot; ctx.beginPath(); ctx.arc(0, 0, r, top ? Math.PI : 0, top ? 0 : Math.PI); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 2; ctx.stroke(); if(top){ ctx.strokeStyle = B.dib; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -r * .2, r * .5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); } ctx.restore(); }

function incBallDraw(x, bx, by, r, rot, B, glow){                           // la Ball dibujada (Ocaso Ball: verde arriba con marcas doradas, negra abajo)
  x.save(); x.translate(bx, by); x.rotate(rot);
  x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.ellipse(0, r * 1.05, r * .9, r * .22, 0, 0, 7); x.fill();
  x.fillStyle = B.bot; x.beginPath(); x.arc(0, 0, r, 0, Math.PI); x.fill();
  const gt = x.createLinearGradient(0, -r, 0, 0); gt.addColorStop(0, B.top2); gt.addColorStop(1, B.top); x.fillStyle = gt; x.beginPath(); x.arc(0, 0, r, Math.PI, 0); x.fill();
  x.strokeStyle = B.dib; x.lineWidth = r * .13; x.beginPath(); x.arc(-r * .48, -r * .2, r * .42, Math.PI * 1.05, Math.PI * 1.75); x.stroke(); x.beginPath(); x.arc(r * .48, -r * .2, r * .42, Math.PI * 1.25, Math.PI * 1.95); x.stroke();
  x.fillStyle = '#0a0a0e'; x.fillRect(-r, -r * .1, r * 2, r * .2);
  x.fillStyle = '#0a0a0e'; x.beginPath(); x.arc(0, 0, r * .34, 0, 7); x.fill(); x.fillStyle = glow ? '#ff6a6a' : '#e8eef8'; x.beginPath(); x.arc(0, 0, r * .22, 0, 7); x.fill();
  x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.ellipse(-r * .4, -r * .55, r * .22, r * .12, -.6, 0, 7); x.fill();
  x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = Math.max(1.5, r * .06); x.beginPath(); x.arc(0, 0, r, 0, 7); x.stroke();
  x.restore();
}
function incCapResult(L, ok, shiny, res){                                  // ok: true capturado · false se escapó · null no lo intentaste
  const P = INC.premio, h = ok ? `¡${L.nombre} capturado!` : ok === false ? `¡${L.nombre} se ha escapado!` : 'Incursión superada';
  const ov = incPanel(`<h2>${h}</h2><p>${res} Premio de la incursión: +${P.bp} BP · +${P.tickets} tiradas · +${P.chapaplata} chapas plateadas.</p><div class="cap-btns"><button class="main" data-c="inc">Incursiones</button><button data-c="menu">Menú</button></div>`);
  ov.querySelector('.cap-res').classList.toggle('ok', !!ok);
  ov.onclick = e => { const b = e.target.closest('[data-c]'); if(!b) return; ov.remove(); g = null; b.dataset.c === 'inc' ? openInc() : goMain(); };
}
// ---------------------------------------------------------------------
// MENÚ PRINCIPAL: tarjeta de la incursión de la semana (columna de la derecha)
// ---------------------------------------------------------------------
{ const o = mmRender; mmRender = function(){
    o.apply(this, arguments);
    const R = document.querySelector('#mm2 .m2-right'); if(!R || R.querySelector('.m2-inc')) return;
    const L = incLeg();
    R.insertAdjacentHTML('afterbegin', `<button class="m2-news m2-inc" data-mm="go" data-k="raid" style="--lc:${L.col}">
      <span class="h"><span>Incursión semanal</span><i>${incQueda()}</i></span>
      <span class="ib"><canvas width="96" height="96" data-dinc="${L.dex}"></canvas><span><b>${L.nombre}</b><small>${L.lugar} · 1 – 4 jugadores</small><small>Intentos ilimitados</small></span></span>
      <span class="a">¡Derrótalo y captúralo! →</span></button>`);
    const c = R.querySelector('canvas[data-dinc]'); if(c) paintSprite(c, L.dex, {sc: 4, fit: 92});
  }; }
if(typeof mmRender === 'function' && $('mm2')) mmRender();
