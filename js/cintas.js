"use strict";
/* =====================================================================
   CINTAS (como en los juegos): premios que gana CADA Pokémon por lo que hace con tu equipo.
   Se ganan al acabar un combate (todos los que estaban en tu equipo ese combate) y se ven en su ficha (Equipo › Ver datos):
   unas pocas junto al nombre y todas en la pestaña Resumen (las que faltan salen apagadas, con cómo se consiguen).
   Dibujos: pokesprite (assets/cintas/). Se guardan en save.rib[dex] = {id: fecha} y save.ribSt[dex] = {w: victorias, c: combates}.
   Para añadir una cinta nueva: una línea en CINTAS y la condición en cintasCheck().
   ===================================================================== */
const CINTA_REG = {Kanto: 'champion-ribbon', Johto: 'regional-champion-ribbon', Hoenn: 'hoenn-champion-ribbon', Sinnoh: 'sinnoh-champion-ribbon',
  Teselia: 'national-champion-ribbon', Kalos: 'kalos-champion-ribbon', Alola: 'alola-champion-ribbon', Galar: 'galar-champion-ribbon'};
const CINTAS = [
  ['gimnasio',   'winning-ribbon',           'Cinta Gimnasio',          'Ganó a un Líder de Gimnasio.'],
  ['altomando',  'victory-ribbon',           'Cinta Alto Mando',        'Venció a un miembro del Alto Mando.'],
  ...Object.entries(CINTA_REG).map(([r, f]) => ['campeon_' + r, f, 'Cinta Campeón de ' + r, `Estaba en el equipo que se proclamó Campeón de ${r}.`]),
  ['mundial',    'world-champion-ribbon',    'Cinta Campeón Mundial',   'Ha sido Campeón en todas las regiones.'],
  ['torre10',    'battle-tree-great-ribbon', 'Cinta Torre',             'Superó el piso 10 de la Torre Batalla.'],
  ['torre50',    'tower-master-ribbon',      'Cinta Maestro de la Torre','Completó los 50 pisos de la Torre Batalla.'],
  ['campo',      'training-ribbon',          'Cinta Entrenamiento',     'Ganó un combate en el Campo de Entrenamiento.'],
  ['online',     'battle-champion-ribbon',   'Cinta Combate Online',    'Ganó un combate online.'],
  ['mega',       'legend-ribbon',            'Cinta Mega',              'Megaevolucionó y ganó el combate.'],
  ['intacto',    'alert-ribbon',             'Cinta Intacto',           'Ganó un combate sin llegar a debilitarse.'],
  ['arrasador',  'shock-ribbon',             'Cinta Arrasador',         'Debilitó a 3 rivales en un mismo combate.'],
  ['habil',      'skillful-battler-ribbon',  'Cinta Luchador Hábil',    'Ha ganado 25 combates.'],
  ['experto',    'expert-battler-ribbon',    'Cinta Luchador Experto',  'Ha ganado 100 combates.'],
  ['amistad',    'best-friends-ribbon',      'Cinta Amistad',           'Ha combatido 50 veces contigo.'],
  ['esfuerzo',   'effort-ribbon',            'Cinta Esfuerzo',          'Tiene sus 510 EVs repartidos al máximo.'],
  ['perfeccion', 'gorgeous-royal-ribbon',    'Cinta Perfección',        'Tiene todos sus IV a 31.']
].map(([id, f, n, d]) => ({id, img: 'assets/cintas/' + f + '.png', n, d}));
const CINTA = Object.fromEntries(CINTAS.map(c => [c.id, c]));

const ribOf = d => (save.rib = save.rib || {})[d] || {};
const ribHas = (d, id) => !!ribOf(d)[id];
function ribGive(d, id, out){
  if(!CINTA[id] || ribHas(d, id)) return;
  (save.rib[d] = save.rib[d] || {})[id] = Date.now(); if(out) out.push([d, id]);
}
function ribStat(d){ const S = save.ribSt = save.ribSt || {}; return S[d] = S[d] || {w: 0, c: 0}; }
function ribRegions(){ return [...new Set(FLOORS.filter(F => F.kind === 'campeon').map(F => F.region))].filter(r => CINTA_REG[r]); }
// Cintas que no dependen del combate (entrenamiento) + Campeón Mundial
function ribPassive(d, out){
  try{ if(evSum(d) >= TRAIN.evTotal) ribGive(d, 'esfuerzo', out);
    if(ivSum(d) >= TRAIN.ivMax * 6) ribGive(d, 'perfeccion', out); }catch(e){}
  const regs = ribRegions(); if(regs.length && regs.every(r => ribHas(d, 'campeon_' + r))) ribGive(d, 'mundial', out);
}

// ---- Durante el combate: rivales que debilita cada uno de tus Pokémon ----
if(typeof hit === 'function'){ const o = hit; hit = function(T, dmg, type, A){
  const alive = T && !T.dead, r = o.apply(this, arguments);
  try{ if(alive && T.dead && A && g && A !== T) A.ribKo = (A.ribKo || 0) + 1; }catch(e){}
  return r; }; }

// ---- Al acabar un combate ----
function cintasCheck(won){
  if(!g || g.ribDone || (g.o && g.o.pruebas)) return; g.ribDone = 1;
  const pv = !!g.pvp, side = pv ? (typeof pvp !== 'undefined' && pvp && pvp.me) || 'p' : 'p', mine = side === 'p' ? g.p : g.e;
  const iWon = pv ? (side === 'p') === !!won : !!won, o = g.o || {}, F = (!pv && !o.torre && !o.campo && typeof FLOORS !== 'undefined') ? FLOORS[o.n] : null;
  if(F && typeof PREVIEW !== 'undefined' && PREVIEW[F.region]) return;                              // modo ver: no cuenta
  const out = [];
  (mine || []).forEach(f => { if(!f || !f.m) return; const d = f.m.baseDex || f.m.dex; if(!save.box || !save.box.includes(d)) return;
    const S = ribStat(d); S.c++;
    if(S.c >= 50) ribGive(d, 'amistad', out);
    if(iWon){ S.w++;
      if(F && F.kind === 'lider') ribGive(d, 'gimnasio', out);
      if(F && F.kind === 'alto') ribGive(d, 'altomando', out);
      if(F && F.kind === 'campeon' && CINTA_REG[F.region]) ribGive(d, 'campeon_' + F.region, out);
      if(o.torre && o.torreFloor >= 10) ribGive(d, 'torre10', out);
      if(o.torre && o.torreFloor >= (typeof TORRE_MAX !== 'undefined' ? TORRE_MAX : 50)) ribGive(d, 'torre50', out);
      if(o.campo) ribGive(d, 'campo', out);
      if(pv) ribGive(d, 'online', out);
      if(f.megaDone) ribGive(d, 'mega', out);
      if(!f.dead) ribGive(d, 'intacto', out);
      if((f.ribKo || 0) >= 3) ribGive(d, 'arrasador', out);
      if(S.w >= 25) ribGive(d, 'habil', out);
      if(S.w >= 100) ribGive(d, 'experto', out);
    }
    ribPassive(d, out); });
  if(typeof persist === 'function') persist();
  if(out.length && typeof toast === 'function') setTimeout(() => {
    out.slice(0, 3).forEach(([d, id]) => toast(`🎀 ¡${mon(d).name} ha conseguido la ${CINTA[id].n}!`));
    if(out.length > 3) toast(`🎀 …y ${out.length - 3} cinta${out.length - 3 > 1 ? 's' : ''} más. Míralas en la ficha de cada Pokémon.`); }, 1600);
}
if(typeof endBattle === 'function'){ const o = endBattle; endBattle = function(won){ try{ cintasCheck(won); }catch(e){ console.warn('cintas', e); } return o.apply(this, arguments); }; }

// ---- En la ficha del Pokémon (teamdata.js) ----
const ribImg = (c, cls) => `<img class="${cls || 'rbi'}" src="${c.img}" alt="${c.n}" title="${c.n}: ${c.d}">`;
function ribStrip(d){
  const L = CINTAS.filter(c => ribHas(d, c.id)); if(!L.length) return '';
  return `<div class="rbstrip" data-act="tab" data-v="sum" title="${L.length} cinta${L.length > 1 ? 's' : ''} · pulsa para verlas todas">${L.slice(-5).map(c => ribImg(c)).join('')}${L.length > 5 ? `<em>+${L.length - 5}</em>` : ''}</div>`;
}
function ribSection(d){
  ribPassive(d, null);
  const has = CINTAS.filter(c => ribHas(d, c.id)).length, S = ribStat(d);
  return `<div class="rbsec"><h3>Cintas <small>${has} / ${CINTAS.length} · ${S.w} victoria${S.w === 1 ? '' : 's'} · ${S.c} combate${S.c === 1 ? '' : 's'}</small></h3>
    <div class="rbgrid">${CINTAS.map(c => { const ok = ribHas(d, c.id), when = ok ? new Date(ribOf(d)[c.id]).toLocaleDateString('es-ES') : '';
      return `<div class="rbc${ok ? ' on' : ''}" title="${c.d}">${ribImg(c, 'rbb')}<b>${ok ? c.n : '???'}</b><small>${ok ? when : c.d}</small></div>`; }).join('')}</div></div>`;
}
if(typeof dtSum === 'function'){ const o = dtSum; dtSum = function(){ const r = o.apply(this, arguments); try{ return r + ribSection(dt.dex); }catch(e){ return r; } }; }
if(typeof dtHead === 'function'){ const o = dtHead; dtHead = function(){ const r = o.apply(this, arguments);
  try{ const k = '<canvas id="dtSpr"', i = r.indexOf(k); return i < 0 ? r : r.slice(0, i) + ribStrip(dt.dex) + r.slice(i); }catch(e){ return r; } }; }   // abajo, dentro del cuadro del Pokémon
