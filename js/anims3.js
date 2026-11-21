"use strict";
/* =====================================================================
   MÁS ANIMACIONES DE PMD (3ª tanda, bajadas con tools/bajar_anims.ps1). Se suman a js/anims.js y js/anims2.js.
   Solo dibujo: no cambia nada del combate. Si a un Pokémon le falta alguna, se ve la de siempre.
   CUÁNDO SALE CADA UNA:
     Sink ........ al meterse bajo tierra con Excavar
     TumbleBack .. al recibir un golpe muy fuerte (se lleva de golpe ≥ AN3.fuerte de su vida)
     Shock ....... paralizado: de vez en cuando le recorre la descarga
     Laying / EventSleep ... dormido (solo si no tiene la animación Sleep de siempre)
     Dance ....... con las danzas (Danza Dragón, Danza Espada, Danza Lluvia...)
     Appeal ...... justo después de megaevolucionar, y al ganar si no tiene Pose
   AN3.on = false lo apaga.
   ===================================================================== */
const AN3 = {on: true, fuerte: .2, tumble: .6, appeal: 1.3, shockCada: 2.6, shockDura: .55};   // [AJUSTE]
Object.entries({
  Sink: {w: 32, h: 40, fps: 12, loop: false}, TumbleBack: {w: 48, h: 48, fps: 14, loop: false}, Shock: {w: 40, h: 40, fps: 14, loop: true},
  Laying: {w: 32, h: 32, fps: 4, loop: true}, EventSleep: {w: 32, h: 32, fps: 3, loop: true}, Dance: {w: 40, h: 40, fps: 12, loop: true},
  Appeal: {w: 40, h: 48, fps: 10, loop: false}
}).forEach(([k, v]) => { if(!ANIMS[k]) ANIMS[k] = Object.assign({n: 6}, v); });

// Muchas de estas hojas (Sink, TumbleBack, Laying, EventSleep...) solo traen UNA fila (mirando de frente). El juego necesita 8 filas
// (una por dirección): se rehacen copiando esa fila 8 veces. Así se ven (siempre de frente) en vez de descartarse.
const AN3_FILA = ['Sink', 'TumbleBack', 'Laying', 'EventSleep', 'Shock', 'Dance', 'Appeal'];
function an3Fila(dex, a){
  const k = dex + '/' + a; if(typeof sheets === 'undefined' || sheets[k]) return;
  const im = new Image(), C = document.createElement('canvas'); C.ok = false; C.bad = false; sheets[k] = C;
  im.onload = () => { try{
      if(im.height % 8 === 0 && im.height / 8 >= 16){ C.width = im.width; C.height = im.height; C.getContext('2d').drawImage(im, 0, 0); }
      else { C.width = im.width; C.height = im.height * 8; const x = C.getContext('2d'); for(let r = 0; r < 8; r++) x.drawImage(im, 0, r * im.height); }
      C.info = analyze(C, a); C.ok = true; }catch(e){ C.bad = true; } };
  im.onerror = () => { C.bad = true; };
  im.src = `${CARPETA}/${dex}/${a}.png`;
}
if(typeof preloadSheets === 'function'){ const o = preloadSheets; preloadSheets = function(dex){
  try{ const s = AN_HAS[dex]; if(s && AN3.on) AN3_FILA.forEach(a => { if(s.has(a)) an3Fila(dex, a); }); }catch(e){}
  return o.apply(this, arguments); }; }

// golpe muy fuerte: se apunta cuánto le quitó (solo para el dibujo)
if(typeof hit === 'function'){ const o = hit; hit = function(T){
  const hp0 = T ? T.hp : 0, r = o.apply(this, arguments);
  try{ if(T && g && T.max > 0 && hp0 - T.hp >= T.max * AN3.fuerte && T.hp > 0) T.anFuerte = g.t; }catch(e){}
  return r; }; }
// después de megaevolucionar: Appeal
if(typeof megaApply === 'function'){ const o = megaApply; megaApply = function(f){ const r = o.apply(this, arguments); try{ if(f && g) f.anAppeal = g.t; }catch(e){} return r; }; }

if(typeof anPick === 'function'){ const o = anPick; anPick = function(f){
  const r = o.apply(this, arguments);
  if(!AN3.on || !AN.on || !f || !f.m || f.dead || f.shiny || !g) return r;
  const has = x => anHas(f, x), base = f.act, t = g.t, quieto = base === 'Idle' || base === 'Walk';
  // Excavar: hundirse al principio
  if(f.jump && f.jump.K && f.jump.K.dig && f.jump.t < f.jump.K.up && has('Sink')) return ['Sink', f.jump.t];
  // golpe muy fuerte
  if(base === 'Hurt' && f.anFuerte != null && t - f.anFuerte < AN3.tumble && has('TumbleBack')) return ['TumbleBack', t - f.anFuerte];
  // megaevolución recién hecha
  if(f.anAppeal != null && t - f.anAppeal < AN3.appeal && quieto && has('Appeal')) return ['Appeal', t - f.anAppeal];
  // ganador sin Pose
  if(g.over && quieto && !has('Pose') && has('Appeal')){ const foes = g.p.includes(f) ? g.e : g.p;
    if(foes && foes.length && foes.every(x => x.dead)){ if(f.anGana == null) f.anGana = t; return ['Appeal', t - f.anGana]; } }
  // estados
  const st = f.st && f.st.k;
  if(st === 'slp' && quieto && !has('Sleep')){ if(has('Laying')) return ['Laying', f.at]; if(has('EventSleep')) return ['EventSleep', f.at]; }
  if(st === 'par' && quieto && has('Shock')){ const u = (t + (f.m.dex % 7) * .37) % AN3.shockCada; if(u < AN3.shockDura) return ['Shock', u]; }
  // danzas
  if(base === 'Charge' && !f.wind && f.anBuf && /danza|baile/i.test(f.anBuf) && has('Dance')) return ['Dance', f.at];
  return r;
}; }
