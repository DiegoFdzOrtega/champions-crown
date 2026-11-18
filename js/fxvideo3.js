"use strict";
/* =====================================================================
   MÁS COSAS DEL VÍDEO «ROJO vs CINTIA»:
   1) CAMBIO DE POKÉMON: la Poké Ball sale de la MANO del entrenador del estadio y lanza un rayito LÁSER rojo, recto y fino (núcleo blanco,
      brillo rojo, destellos en la punta) que alcanza al Pokémon y lo absorbe.
   2) DEBILITADO A CÁMARA LENTA: cada vez que cae un Pokémon (no solo el último): cámara lenta un instante, la cámara se acerca,
      destello blanco, aro en el suelo y polvo al caer.
   3) MEGAEVOLUCIÓN MÁS ÉPICA: el Mega-Aro del entrenador resuena con un rayo arcoíris hasta el Pokémon, la cámara se acerca, el Pokémon queda
      dentro de una ESFERA (huevo) de luz arcoíris que se va llenando de grietas, y en el destello la esfera se rompe en mil cristales
      y aparece el símbolo mega en grande.
   4) MENSAJES COMO EN LOS JUEGOS: «¡Es muy eficaz!», «No es muy eficaz...», «No afecta...» y «¡Un golpe crítico!» salen en un cuadro
      de texto blanco con borde (como el de la serie) que aparece con un saltito.
   V7.<parte> = false apaga cada cosa.
   ===================================================================== */
const V7 = {laser: true, ko: true, mega: true, msg: true, koSlow: .5, megaZoom: false, msgCd: 6, poco: false};   // msgCd = segundos mínimos entre dos mensajes · poco = enseñar «No es muy eficaz...»

// ---------------- 1) CAMBIO: rayo láser desde la mano del entrenador ----------------
if(typeof swapStart === 'function'){ const o = swapStart; swapStart = function(side, idx, quick){
  const s = o.apply(this, arguments);
  try{ if(s && V7.laser && typeof lzOrigin === 'function') s.O = lzOrigin(side); }catch(e){}
  return s; }; }
if(typeof swBeam === 'function'){ const o = swBeam; swBeam = function(ox, oy, tx, ty, t, power){
  if(!V7.laser) return o.apply(this, arguments);
  if(power <= 0) return;
  const L = Math.hypot(tx - ox, ty - oy), an = Math.atan2(ty - oy, tx - ox), fl = .85 + .15 * Math.sin(t * 70);
  ctx.save(); ctx.translate(ox, oy); ctx.rotate(an); ctx.lineCap = 'round';
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = .35 * power * fl; ctx.strokeStyle = '#ff2a1c'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(L, 0); ctx.stroke();   // brillo de fuera
  ctx.globalAlpha = .9 * power; ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 5; ctx.stroke();                                                            // el láser
  ctx.globalAlpha = power; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();                                                                 // núcleo blanco
  for(let k = 0; k < 6; k++){ const u = (k / 6 + t * 3) % 1; ctx.globalAlpha = power * (1 - u * .4); ctx.fillStyle = '#ffd0c4'; ctx.fillRect(L * u - 2, -1.5, 4, 3); }   // motas que corren
  const r = 9 * fl, G = ctx.createRadialGradient(L, 0, 0, L, 0, r * 2.4); G.addColorStop(0, 'rgba(255,255,255,1)'); G.addColorStop(.4, 'rgba(255,80,60,.8)'); G.addColorStop(1, 'rgba(255,40,30,0)');
  ctx.globalAlpha = power; ctx.fillStyle = G; ctx.beginPath(); ctx.arc(L, 0, r * 2.4, 0, 6.3); ctx.fill();                                                // destello en la punta
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; for(let k = 0; k < 4; k++){ const a = k * 1.57 + t * 9; ctx.beginPath(); ctx.moveTo(L, 0); ctx.lineTo(L + Math.cos(a) * r * 1.8, Math.sin(a) * r * 1.8); ctx.stroke(); }
  ctx.restore();
}; }

// ---------------- 2) DEBILITADO A CÁMARA LENTA ----------------
let V7ko = [];
if(typeof hit === 'function'){ const o = hit; hit = function(T){
  const alive = T && !T.dead, r = o.apply(this, arguments);
  try{ if(V7.ko && alive && T.dead && g && !g.pvp){
    if(!(g.slowT > 0)){ g.slowT = V7.koSlow; g.zoomAt = {x: T.x, y: T.y}; }
    const I = idleInfo(T.m.dex), fy = T.y + I.foot * ESCALA - 2;
    V7ko.push({x: T.x, y: T.y - 20, fy, t0: g.t});
    try{ fxBurst(T.x, fy - 4, ['#cdbb9a', '#a8916b', '#ece4d4'], 14, 160, 0, 6.3, {life: .6, s: 3, rise: -.2, drag: .86}); }catch(e){}
    fx.shake = Math.max(fx.shake, 10); if(typeof Sfx !== 'undefined') Sfx.play('impact4', .7);
  } }catch(e){}
  return r; }; }
function v7KoDraw(){
  for(let i = V7ko.length - 1; i >= 0; i--){ const k = V7ko[i], u = (g.t - k.t0) / .7; if(u >= 1 || u < 0){ V7ko.splice(i, 1); continue; }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const G = ctx.createRadialGradient(k.x, k.y, 0, k.x, k.y, 140); G.addColorStop(0, `rgba(255,255,255,${.9 * (1 - u)})`); G.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = G; ctx.beginPath(); ctx.arc(k.x, k.y, 140, 0, 6.3); ctx.fill();
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1 - u; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4 * (1 - u) + 1;
    const R = 20 + 110 * u; ctx.beginPath(); ctx.ellipse(k.x, k.fy, R, R * .36, 0, 0, 6.3); ctx.stroke();
    ctx.restore(); }
}

// ---------------- 3) MEGAEVOLUCIÓN ----------------
let V7m = null;                                                                                    // cristales de la esfera rota
function v7MegaDraw(){
  const m = g.mega; if(!m){ if(V7m && V7m.parts.length){ v7Shards(.016); } else V7m = null; return; }
  const f = m.f, t = m.t, T = MEGA_T, I = idleInfo(f.m.dex), foot = f.y + I.foot * ESCALA, top = f.y + I.top * ESCALA, mid = (foot + top) / 2;
  const R = Math.max(60, (foot - top) * .75, I.fw * ESCALA * .6);
  if(!V7m || V7m.m !== m) V7m = {m, parts: [], broke: false};
  ctx.save();
  if(t < T.flash){
    // rayo arcoíris desde el Mega-Aro del entrenador
    const side = typeof megaSide === 'function' ? megaSide(f) : (g.p.includes(f) ? 'p' : 'e'), O = typeof lzOrigin === 'function' ? lzOrigin(side) : null, ru = Math.min(1, t / .5);
    if(O && t < T.flash - .2){ ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      const tx = O.x + (f.x - O.x) * ru, ty = O.y + (mid - O.y) * ru;
      for(let i = 0; i < 3; i++){ ctx.globalAlpha = .7; ctx.strokeStyle = hue(t * 300 + i * 120, 1, 65); ctx.lineWidth = 6 - i * 2; ctx.beginPath(); ctx.moveTo(O.x, O.y);
        for(let k = 1; k <= 12; k++){ const u = k / 12; ctx.lineTo(O.x + (tx - O.x) * u + Math.sin(u * 9 + t * 20 + i * 2) * 4, O.y + (ty - O.y) * u + Math.cos(u * 9 + t * 20 + i * 2) * 4); } ctx.stroke(); }
      const Gk = ctx.createRadialGradient(O.x, O.y, 0, O.x, O.y, 26); Gk.addColorStop(0, 'rgba(255,255,255,1)'); Gk.addColorStop(1, hue(t * 300, 0));
      ctx.globalAlpha = 1; ctx.fillStyle = Gk; ctx.beginPath(); ctx.arc(O.x, O.y, 26, 0, 6.3); ctx.fill(); }
    // esfera de luz que envuelve al Pokémon y se agrieta
    const e = Math.max(0, Math.min(1, (t - .35) / .6)); if(e > 0){
      ctx.globalCompositeOperation = 'lighter';
      const Gs = ctx.createRadialGradient(f.x, mid, R * .2, f.x, mid, R * e); Gs.addColorStop(0, 'rgba(255,255,255,0)'); Gs.addColorStop(.75, `rgba(255,230,255,${.18 * e})`); Gs.addColorStop(1, `rgba(255,255,255,${.55 * e})`);
      ctx.fillStyle = Gs; ctx.beginPath(); ctx.ellipse(f.x, mid, R * e, R * e * 1.08, 0, 0, 6.3); ctx.fill();
      ctx.globalCompositeOperation = 'source-over'; ctx.lineWidth = 3;
      for(let a = 0; a < 6.28; a += .2){ ctx.strokeStyle = hue(a * 57 + t * 260, .95, 68); ctx.beginPath(); ctx.ellipse(f.x, mid, R * e, R * e * 1.08, 0, a, a + .22); ctx.stroke(); }   // borde arcoíris
      const cr = Math.max(0, (t - (T.flash - .6)) / .6); if(cr > 0){ ctx.strokeStyle = `rgba(255,255,255,${.95})`; ctx.lineWidth = 2;                       // grietas
        for(let i = 0; i < 9; i++){ const a0 = HH(i, 7) * 6.28; let x = f.x + Math.cos(a0) * R * .95, y = mid + Math.sin(a0) * R * 1.03; ctx.beginPath(); ctx.moveTo(x, y);
          const n = Math.ceil(5 * cr); for(let k = 0; k < n; k++){ const a = a0 + Math.PI + (HH(i * 5 + k, 3) - .5) * 1.4; x += Math.cos(a) * R * .16; y += Math.sin(a) * R * .16; ctx.lineTo(x, y); } ctx.stroke(); } }
    }
  } else if(!V7m.broke){                                                                           // ¡se rompe! cristales en todas direcciones
    V7m.broke = true;
    for(let i = 0; i < 46; i++){ const a = Math.random() * 6.28, sp = 220 + Math.random() * 420;
      V7m.parts.push({x: f.x + Math.cos(a) * R * .9, y: mid + Math.sin(a) * R, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, r: Math.random() * 6.28, vr: (Math.random() - .5) * 14, s: 5 + Math.random() * 9, h: Math.random() * 360, life: 1 + Math.random() * .6}); }
  }
  if(t >= T.flash){                                                                                // símbolo mega grande que se estampa y se apaga
    const k = (t - T.flash) / 1.1; if(k < 1){ const sc = 1.6 - .5 * Math.min(1, k * 3), A = k < .15 ? k / .15 : 1 - (k - .15) / .85;
      ctx.globalAlpha = A; ctx.lineWidth = 6; ctx.lineCap = 'round';
      for(let j = 0; j < 2; j++){ ctx.strokeStyle = hue(j * 180 + t * 200, 1, 70); ctx.beginPath();
        for(let a = 0; a <= 6.4; a += .08){ const r = (70 + 14 * Math.sin(a * 3 + j * Math.PI)) * sc, x = f.x + Math.cos(a) * r, y = mid + Math.sin(a) * r; a ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(f.x, mid, 10 * sc, 0, 6.3); ctx.fill(); }
  }
  v7Shards(.016);
  ctx.restore();
}
function v7Shards(dt){
  if(!V7m) return; ctx.save();
  V7m.parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt; p.r += p.vr * dt; p.life -= dt;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    ctx.fillStyle = hue(p.h + g.t * 200, .85, 80); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, -p.s); ctx.lineTo(p.s * .6, 0); ctx.lineTo(0, p.s * .8); ctx.lineTo(-p.s * .5, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); });
  V7m.parts = V7m.parts.filter(p => p.life > 0); ctx.restore();
}
if(typeof megaDraw === 'function'){ const o = megaDraw; megaDraw = function(){
  const r = o.apply(this, arguments);
  try{ if(g){ if(V7.mega) v7MegaDraw(); if(V7.ko) v7KoDraw(); } }catch(e){}
  return r; }; }

// ---------------- 4) MENSAJES COMO EN LOS JUEGOS ----------------
const V7MSG = {'¡Muy eficaz!': ['¡Es muy eficaz!', '#c0392b'], 'Poco eficaz': ['No es muy eficaz...', '#56606e'], 'Sin efecto': ['No afecta...', '#56606e'], '¡CRÍTICO!': ['¡Un golpe crítico!', '#d35400']};
function popStyled(p, x, y){
  const M = V7.msg && V7MSG[p.txt]; if(!M) return false;
  if(p.v7ok == null){                                                                              // ¿se enseña este? no si hace poco que salió otro (o si es «poco eficaz» y está apagado)
    const crit = p.txt === '¡CRÍTICO!', k = crit ? 'c' : 'e', last = (g.v7msg = g.v7msg || {})[k];
    p.v7ok = !(p.txt === 'Poco eficaz' && !V7.poco) && !(last != null && g.t - last < V7.msgCd) && !g.pops.some(q => q !== p && q.v7ok && q.t > .2);
    if(p.v7ok) g.v7msg[k] = g.t; }
  if(!p.v7ok) return true;                                                                         // repetido: no se dibuja nada
  if(p.t0 == null) p.t0 = p.t; const age = p.t0 - p.t, out = Math.min(1, p.t / .2);
  const pop = age < .12 ? .6 + .5 * (age / .12) : age < .2 ? 1.1 - .1 * ((age - .12) / .08) : 1;   // saltito al aparecer
  const fs = 9; ctx.save(); ctx.font = `${fs}px ${FONT}`; const w = ctx.measureText(M[0]).width + 22, h = fs + 16;
  ctx.translate(x, y - 6); ctx.scale(pop, pop); ctx.globalAlpha = out;
  const rr = (X, Y, Wd, Hd, r) => { ctx.beginPath(); ctx.moveTo(X + r, Y); ctx.arcTo(X + Wd, Y, X + Wd, Y + Hd, r); ctx.arcTo(X + Wd, Y + Hd, X, Y + Hd, r); ctx.arcTo(X, Y + Hd, X, Y, r); ctx.arcTo(X, Y, X + Wd, Y, r); ctx.closePath(); };
  ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(-w / 2 + 2, -h / 2 + 3, w, h, 6); ctx.fill();                  // sombra
  ctx.fillStyle = '#3a4a6a'; rr(-w / 2, -h / 2, w, h, 6); ctx.fill();                                  // borde exterior (azul oscuro)
  ctx.fillStyle = '#9fb4d8'; rr(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 5); ctx.fill();                  // borde claro
  ctx.fillStyle = '#ffffff'; rr(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 4); ctx.fill();                  // fondo blanco
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#d6dbe3'; ctx.fillText(M[0], 1, 2);   // sombra del texto (como en los juegos)
  ctx.fillStyle = M[1]; ctx.fillText(M[0], 0, 1);
  ctx.restore(); return true;
}
