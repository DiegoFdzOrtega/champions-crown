"use strict";
/* =====================================================================
   CAMPO QUE SE ROMPE + RAYOS Y METEOROS (idea del vídeo «Brendan vs Steven», que pasó Diego)
   - MARCAS QUE SE QUEDAN: los ataques fuertes dejan huella en el suelo HASTA QUE ACABA EL COMBATE (el campo acaba destrozado):
       Terremoto ...... grieta desde el que ataca hasta el rival + un cráter con grietas y piedras donde golpea
       Hiperrayo ...... un rastro chamuscado (negro) a lo largo de todo el rayo
       Cometa Draco ... un cráter por cada meteoro que cae
       Trueno ......... una quemadura en forma de estrella con rayitas
     Se pintan UNA vez en un dibujo pequeño (pixelado) y luego solo se copian: no pesan. Como mucho SU.max a la vez (las más viejas se van).
   - TERREMOTO: dos anillos (uno blanco grueso) y una nube de polvo marrón que se queda un rato flotando.
   - HIPERRAYO: anillos blancos enroscados a lo largo del rayo y un aro alrededor del rival.
   - COMETA DRACO: un destello blanco enorme al caer.
   - TRUENO: una nube negra encima del rival de la que sale el rayo.
   - SONIDOS propios (js/music.js): quake, beam_ch, beam, trueno, meteoro, boom.
   Todo se ve también con los efectos HD apagados. SU.on = false lo apaga.
   ===================================================================== */
const SU = {on: true, max: 40, list: [], fx: [], g: null};               // [AJUSTE] encendido · cuántas marcas como mucho

function suReset(){ if(SU.g !== g){ SU.g = g; SU.list.length = 0; SU.fx.length = 0; } }   // combate nuevo: campo limpio
const suSnd = (n, k) => { try{ if(typeof Sfx !== 'undefined') Sfx.play(n, k); }catch(e){} };
function suRnd(seed){ let s = (seed * 9301 + 49297) % 233280 || 1; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }

// ---- Pintar una marca en un dibujo pequeño (la mitad de resolución = píxeles gordos, como el resto del juego) ----
function suCanvas(x0, y0, x1, y1){
  const c = document.createElement('canvas'); c.width = Math.max(2, Math.ceil((x1 - x0) / 2)); c.height = Math.max(2, Math.ceil((y1 - y0) / 2));
  const s = c.getContext('2d'); s.scale(.5, .5); s.translate(-x0, -y0); c.wx = x0; c.wy = y0; c.ww = c.width * 2; c.wh = c.height * 2; return [c, s];
}
function suCrack(s, R, x, y, an, L, w){                                       // grieta quebrada con alguna rama
  let px = x, py = y; s.strokeStyle = 'rgba(28,20,13,.8)'; s.lineWidth = w; s.lineCap = 'square'; s.beginPath(); s.moveTo(px, py);
  const n = 3 + (R() * 2 | 0);
  for(let i = 1; i <= n; i++){ const d = L * i / n, j = (R() - .5) * L * .35; px = x + Math.cos(an) * d - Math.sin(an) * j; py = y + (Math.sin(an) * d + Math.cos(an) * j) * .55; s.lineTo(px, py);
    if(R() < .35){ const ba = an + (R() < .5 ? -1 : 1) * (.5 + R() * .6), bl = L * (.2 + R() * .25); s.moveTo(px, py); s.lineTo(px + Math.cos(ba) * bl, py + Math.sin(ba) * bl * .55); s.moveTo(px, py); } }
  s.stroke();
}
function suPebbles(s, R, x, y, rx, ry, n){                                   // piedrecitas sueltas alrededor
  for(let i = 0; i < n; i++){ const an = R() * 6.283, d = .5 + R() * .7, px = x + Math.cos(an) * rx * d, py = y + Math.sin(an) * ry * d, z = 2 + (R() * 3 | 0) * 2;
    s.fillStyle = 'rgba(30,24,19,.85)'; s.beginPath(); s.moveTo(px - z, py + z * .6); s.lineTo(px, py - z * .8); s.lineTo(px + z, py + z * .6); s.closePath(); s.fill();
    s.fillStyle = 'rgba(150,140,128,.7)'; s.fillRect(px - 1, py - z * .4, 2, 2); }
}
function suPaintCrater(x, y, r){
  const R = suRnd(Math.random() * 999), [c, s] = suCanvas(x - r * 2.2, y - r * 1.3, x + r * 2.2, y + r * 1.3), ry = r * .46;
  for(let i = 0; i < 7; i++) suCrack(s, R, x + Math.cos(i * .9) * r * .8, y + Math.sin(i * .9) * ry * .8, i * .9 + (R() - .5) * .4, r * (.5 + R() * .7), 2.5);
  s.fillStyle = 'rgba(215,200,172,.28)'; s.beginPath(); s.ellipse(x, y + ry * .1, r * 1.45, ry * 1.5, 0, 0, 6.283); s.fill();   // tierra levantada alrededor (se ve en suelo oscuro)
  s.fillStyle = 'rgba(30,22,15,.7)'; s.beginPath(); s.ellipse(x, y, r * 1.08, ry * 1.12, 0, 0, 6.283); s.fill();        // borde
  s.fillStyle = 'rgba(92,72,50,.5)'; s.beginPath(); s.ellipse(x, y, r, ry, 0, 0, 6.283); s.fill();                      // hoyo
  s.fillStyle = 'rgba(28,20,13,.42)'; s.beginPath(); s.ellipse(x, y - ry * .18, r * .86, ry * .7, 0, Math.PI, 6.283); s.fill();   // sombra de la pared de arriba
  s.fillStyle = 'rgba(225,210,185,.55)'; s.beginPath(); s.ellipse(x, y + ry * .55, r * .8, ry * .38, 0, 0, Math.PI); s.fill();    // labio claro de abajo
  for(let i = 0; i < 14; i++){ const an = R() * 6.283, d = R() * .8; s.fillStyle = R() < .5 ? 'rgba(30,22,15,.5)' : 'rgba(150,130,100,.45)'; s.fillRect(x + Math.cos(an) * r * d, y + Math.sin(an) * ry * d, 3, 3); }
  suPebbles(s, R, x, y, r * 1.7, ry * 1.9, 6 + (R() * 5 | 0));
  return c;
}
function suPaintGrieta(x0, y0, x1, y1){
  const R = suRnd(Math.random() * 999), m = 40, [c, s] = suCanvas(Math.min(x0, x1) - m, Math.min(y0, y1) - m, Math.max(x0, x1) + m, Math.max(y0, y1) + m);
  const L = Math.hypot(x1 - x0, y1 - y0), an = Math.atan2(y1 - y0, x1 - x0), n = Math.max(4, Math.round(L / 22)), px = -Math.sin(an), py = Math.cos(an), pts = [];
  for(let i = 0; i <= n; i++){ const u = i / n, o = (R() - .5) * 16; pts.push([x0 + (x1 - x0) * u + px * o, y0 + (y1 - y0) * u + py * o]); }
  for(let i = 0; i < n; i += 2){ s.fillStyle = 'rgba(80,62,44,.22)'; s.beginPath(); s.ellipse(pts[i][0], pts[i][1], 16 + R() * 10, 7 + R() * 4, an, 0, 6.283); s.fill(); }   // tierra removida
  s.lineJoin = 'miter'; s.lineCap = 'square';
  [['rgba(70,54,38,.45)', 9], ['rgba(28,20,13,.85)', 4]].forEach(([col, w]) => { s.strokeStyle = col; s.lineWidth = w; s.beginPath(); pts.forEach((q, i) => s[i ? 'lineTo' : 'moveTo'](q[0], q[1])); s.stroke(); });
  for(let i = 1; i < n; i++) if(R() < .6) suCrack(s, R, pts[i][0], pts[i][1], an + (R() < .5 ? -1 : 1) * (.7 + R() * .8), 14 + R() * 20, 2.5);
  for(let i = 0; i < n; i++) if(R() < .5) suPebbles(s, R, pts[i][0], pts[i][1], 18, 10, 2);
  return c;
}
function suPaintBurn(x0, y0, x1, y1, w, hot){
  const R = suRnd(Math.random() * 999), m = w * 1.2, [c, s] = suCanvas(Math.min(x0, x1) - m, Math.min(y0, y1) - m, Math.max(x0, x1) + m, Math.max(y0, y1) + m);
  const L = Math.hypot(x1 - x0, y1 - y0), an = Math.atan2(y1 - y0, x1 - x0), n = Math.max(6, Math.round(L / 7)), px = -Math.sin(an), py = Math.cos(an);
  for(let i = 0; i <= n; i++){ const u = i / n, o = (R() - .5) * w * .7, cx = x0 + (x1 - x0) * u + px * o, cy = y0 + (y1 - y0) * u + py * o * .6, rr = w * (.25 + R() * .3) * (u < .08 ? .5 + u * 6 : 1);
    s.fillStyle = `rgba(22,15,10,${(hot ? .16 : .12) + R() * .1})`; s.beginPath(); s.ellipse(cx, cy, rr * 1.4, rr * .75, an, 0, 6.283); s.fill(); }
  for(let i = 0; i < n * 2; i++){ const u = R(), o = (R() - .5) * w * 1.3; s.fillStyle = R() < .7 ? 'rgba(15,10,6,.55)' : (hot ? 'rgba(255,150,60,.35)' : 'rgba(120,90,60,.4)'); s.fillRect(x0 + (x1 - x0) * u + px * o, y0 + (y1 - y0) * u + py * o * .6, 3, 3); }
  if(hot){ const cx = x1, cy = y1; for(let i = 0; i < 6; i++) suCrack(s, R, cx, cy, i * 1.05 + R() * .4, w * (.6 + R() * .5), 2.5); }
  return c;
}
function suPaintScorch(x, y, r){
  const R = suRnd(Math.random() * 999), [c, s] = suCanvas(x - r * 2, y - r * 1.2, x + r * 2, y + r * 1.2);
  s.fillStyle = 'rgba(20,14,10,.4)'; s.beginPath(); for(let i = 0; i < 20; i++){ const an = i * .314, d = r * (i % 2 ? .45 : .9 + R() * .4); s[i ? 'lineTo' : 'moveTo'](x + Math.cos(an) * d, y + Math.sin(an) * d * .5); } s.closePath(); s.fill();
  s.fillStyle = 'rgba(15,10,6,.45)'; s.beginPath(); s.ellipse(x, y, r * .45, r * .22, 0, 0, 6.283); s.fill();
  for(let i = 0; i < 9; i++) suCrack(s, R, x, y, i * .7 + R() * .3, r * (.9 + R() * .9), 2.5);
  for(let i = 0; i < 12; i++){ const an = R() * 6.283, d = R() * r * 1.4; s.fillStyle = R() < .6 ? 'rgba(15,10,6,.6)' : 'rgba(255,240,140,.45)'; s.fillRect(x + Math.cos(an) * d, y + Math.sin(an) * d * .5, 3, 3); }
  return c;
}
function suAdd(c){ if(!SU.on || !g || !c) return; suReset(); SU.list.push({c, born: g.t}); if(SU.list.length > SU.max) SU.list.shift(); }
const suCrater = (x, y, r) => suAdd(suPaintCrater(x, y, r));
const suGrieta = (x0, y0, x1, y1) => suAdd(suPaintGrieta(x0, y0, x1, y1));
const suBurn = (x0, y0, x1, y1, w, hot) => suAdd(suPaintBurn(x0, y0, x1, y1, w, hot));
const suScorch = (x, y, r) => suAdd(suPaintScorch(x, y, r));

// ---- Las marcas se dibujan en el suelo, debajo de los Pokémon y del fuego ----
function suGround(){
  if(!g) return; suReset(); if(!SU.on || !SU.list.length) return;
  ctx.save(); if(typeof terrClip === 'function') terrClip(); ctx.imageSmoothingEnabled = false;
  const n = SU.list.length;
  SU.list.forEach((m, i) => { const old = n >= SU.max && i < 4 ? .35 + i * .15 : 1; ctx.globalAlpha = Math.min(1, (g.t - m.born) / .18) * old; const c = m.c; ctx.drawImage(c, c.wx, c.wy, c.ww, c.wh); });
  ctx.restore();
}
if(typeof fxhdGround === 'function'){ const o = fxhdGround; fxhdGround = function(){ try{ suGround(); }catch(e){} return o.apply(this, arguments); }; }

// ---- Efectos que se quedan un rato (polvo del Terremoto) y que van por encima ----
const SU_POLVO = ['#3d2c18', '#8a7658', '#a8936e', '#c9b893', '#e3d8bf'];
function suFxDraw(){
  if(!g || !SU.fx.length) return;
  SU.fx = SU.fx.filter(f => g.t - f.t0 < f.dur);
  for(const f of SU.fx){
    const a = g.t - f.t0, u = a / f.dur;
    if(f.k === 'rosa'){                                                         // nube rosa del Psíquico (js/fxbrendan.js)
      const A = u < .15 ? u / .15 : 1 - (u - .15) / .85, list = f.p.map(p => [p[0] + p[3] * a * 14, p[1] - a * 10, p[2] * (.6 + .6 * Math.min(1, a / .3))]);
      tpLayers(list, ['#c0509a', '#e88ac8', '#f6b0dc', '#ffd6f0', '#fff0fa'], A * .75);
    }
    if(f.k === 'polvo'){                                                         // nube de polvo: bultos que se hinchan, suben un poco y se deshacen
      const A = u < .1 ? u / .1 : Math.pow(1 - (u - .1) / .9, 1.3), list = f.p.map(p => [p[0] + p[3] * a * 10, p[1] - a * (8 + p[4] * 10), p[2] * (.55 + .45 * Math.min(1, a / .35)) * (1 + u * .25)]).sort((m, n) => m[1] - n[1]);
      tpLayers(list, SU_POLVO, A * .9);
    }
  }
}
if(typeof fxDraw === 'function'){ const o = fxDraw; fxDraw = function(){ const r = o.apply(this, arguments); try{ suFxDraw(); }catch(e){} return r; }; }

// ---- Enganches: se añade lo nuevo DESPUÉS de lo que ya dibujaba cada ataque (con HD o sin HD) ----
function suWrap(tab, name, after, before){
  const o = tab[name]; if(!o) return; const base = o.draw || o;
  const w = function(e, a){ let r; if(before){ r = before(e, a, () => base.apply(this, arguments)); } else r = base.apply(this, arguments); try{ if(after) after(e, a); }catch(err){} return r; };
  Object.assign(w, o); delete w.draw; tab[name] = w;
}
const suEnded = e => e.ended !== undefined;

// TERREMOTO: la grieta del suelo (del que ataca al rival) se queda; al golpear: cráter, anillos y nube de polvo
suWrap(FXR.stream, 'Terremoto', e => {
  const G = sg(e, 330); if(G.len > 20) e.suG = G;
  if(!e.suOn){ e.suOn = 1; suSnd('quake', .8); }
  if(suEnded(e) && !e.suDone && e.suG){ e.suDone = 1; const q = e.suG; suGrieta(q.x0, q.y0 + 14, q.x1, q.y1 + 14); }
});
suWrap(FXR.impact, 'Terremoto', (e, a) => {
  const k = e.k || 1, x = e.x, y = e.y + 14;
  if(!e.suDone){ e.suDone = 1; suCrater(x, y + 4, 30 * k); suSnd('boom', .7);
    const p = []; for(let i = 0; i < 9; i++){ const an = i / 9 * 6.283 + HH(i, 3), d = 18 + HH(i, 4) * 34; p.push([x + Math.cos(an) * d * k, y - 4 + Math.sin(an) * d * .45 * k, (13 + HH(i, 5) * 10) * k, Math.cos(an), HH(i, 6)]); }
    p.push([x, y - 8, 20 * k, 0, .5]); SU.fx.push({k: 'polvo', t0: g.t, dur: 1.7, p}); }
  ctx.save(); ctx.lineWidth = 1;
  for(let r = 0; r < 2; r++){ const v = clamp01((a - r * .09) / .6); if(v <= 0 || v >= 1) continue; const o = 1 - Math.pow(1 - v, 2.2), R0 = (18 + 100 * o) * k;
    ctx.globalAlpha = 1 - v; ctx.beginPath(); ctx.ellipse(x, y, R0, R0 * .42, 0, 0, 6.283);
    ctx.strokeStyle = r ? '#e8dcc4' : '#ffffff'; ctx.lineWidth = r ? 4 : 8 * (1 - v * .6); ctx.stroke(); }
  ctx.restore();
});

// HIPERRAYO: sonidos y, al acabar, el rastro chamuscado se queda (el dibujo del rayo está en js/fxbrendan.js)
suWrap(FXR.stream, 'Hiperrayo', e => {
  if(!e.suOn){ e.suOn = 1; suSnd('beam', .9); }
  const G = sg(e, 900); if(G.len < 8) return; if(G.len > 30) e.suG = G;
  if(suEnded(e) && !e.suDone && e.suG){ e.suDone = 1; const q = e.suG; suBurn(q.x0, q.y0 + 18, q.x1, q.y1 + 18, 44, true); }
}, (e, a, run) => (typeof brHRBeam === 'function' && typeof BR !== 'undefined' && BR.on) ? brHRBeam(e) : run());      // el rayo se dibuja con brHRBeam (js/fxbrendan.js), con o sin efectos HD

// COMETA DRACO: destello blanco enorme + un cráter por cada meteoro (mismas posiciones que fvCometaHit, js/fxfuertes.js)
suWrap(FXR.impact, 'Cometa Draco', (e, a) => {
  const k = e.k || 1, x = e.x, y = e.y - 6;
  if(e.suN === undefined){ e.suN = 0; suSnd('meteoro', .8); }
  for(let i = e.suN; i < 5; i++){ if(a < i * .09 + .2) break; const tx = x + (i === 0 ? 0 : (HH(i, 50) - .5) * 100) * k, ty = y + (i === 0 ? 0 : (HH(i, 51) - .5) * 44);
    suCrater(tx, ty + 22, (i === 0 ? 30 : 16) * k); suSnd('boom', i ? .5 : .9); e.suN = i + 1; }
  if(a > .18 && a < .6){ const u = (a - .18) / .42, R0 = (90 + 90 * u) * k, A = 1 - u;
    ctx.save(); const gr = ctx.createRadialGradient(x, y, 0, x, y, R0); gr.addColorStop(0, `rgba(255,255,255,${A})`); gr.addColorStop(.45, `rgba(255,250,215,${A * .85})`); gr.addColorStop(1, 'rgba(255,240,180,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, R0, 0, 6.283); ctx.fill(); ctx.restore(); }
});

// TRUENO: nube negra encima del rival (el rayo sale de ella) y una quemadura en el suelo
const SU_NUBE = ['#14151c', '#30333f', '#4a4e5c', '#666b7a', '#858a98'];
suWrap(FXR.impact, 'Trueno', (e, a) => {
  const k = e.k || 1, x = e.x + (HH(2, 1) - .5) * 14, cy = e.y - 4 - 175;
  if(!e.suDone){ e.suDone = 1; suScorch(e.x, e.y + 16, 30 * k); suSnd('trueno', .9); }
  const A = Math.min(1, a / .06) * (a > .6 ? Math.max(0, 1 - (a - .6) / .35) : 1); if(A <= 0) return;
  const puffs = [[-44, 6, 22], [-22, -8, 28], [6, -14, 32], [34, -6, 27], [54, 6, 20], [-10, 8, 24], [22, 8, 24]].map(([dx, dy, r]) => [x + dx + Math.sin(g.t * 2 + dx) * 2, cy + dy, r]);
  tpLayers(puffs, SU_NUBE, A);
  if(a < .5 && (Math.floor(a * 20) % 3 === 0)){ ctx.save(); ctx.globalAlpha = A * .5; ctx.fillStyle = '#fff6b0'; ctx.beginPath(); ctx.ellipse(x + 4, cy + 6, 30, 12, 0, 0, 6.283); ctx.fill(); ctx.restore(); }   // fogonazo dentro de la nube
}, (e, a, run) => { ctx.save(); ctx.beginPath(); ctx.rect(-1e4, e.y - 4 - 175 + 4, 3e4, 3e4); ctx.clip(); try{ run(); } finally { ctx.restore(); } });   // el rayo no asoma por encima de la nube

// TERREMOTO de verdad (en el combate es una onda desde el que ataca: FXR.impact._terremoto, js/fxnuevos.js): en el centro queda un cráter
// grande con grietas largas hacia fuera, y sale la nube de polvo. (La grieta «del atacante al rival» es solo para cuando se dibuja como rayo.)
function suPaintQuake(x, y, R){
  const Rr = suRnd(Math.random() * 999), [c, s] = suCanvas(x - R, y - R * .7, x + R, y + R * .7), n = 9;
  for(let i = 0; i < n; i++){ const an = i / n * 6.283 + Rr() * .4; suCrack(s, Rr, x + Math.cos(an) * 20, y + Math.sin(an) * 10, an, R * (.45 + Rr() * .4), 3.5); }
  for(let i = 0; i < 6; i++){ const an = Rr() * 6.283, d = R * (.3 + Rr() * .45); suPebbles(s, Rr, x + Math.cos(an) * d, y + Math.sin(an) * d * .5, 14, 7, 2); }
  const cr = suPaintCrater(x, y, 34); s.save(); s.setTransform(1, 0, 0, 1, 0, 0); s.drawImage(cr, (cr.wx - c.wx) / 2, (cr.wy - c.wy) / 2); s.restore();
  return c;
}
{ const o = FXR.impact._terremoto; if(o){ const w = function(e, a){ const r = o.apply(this, arguments);
      try{ if(!e.suDone && g){ e.suDone = 1; const R = Math.min(260, e.R || 200); suAdd(suPaintQuake(e.x, e.y, R * .8)); suSnd('quake', .9);
        const p = []; for(let i = 0; i < 11; i++){ const an = i / 11 * 6.283 + HH(i, 3), d = 20 + HH(i, 4) * 40; p.push([e.x + Math.cos(an) * d, e.y - 10 + Math.sin(an) * d * .45, 14 + HH(i, 5) * 12, Math.cos(an), HH(i, 6)]); }
        p.push([e.x, e.y - 14, 24, 0, .5]); SU.fx.push({k: 'polvo', t0: g.t, dur: 1.9, p}); } }catch(err){}
      return r; }; Object.assign(w, o); FXR.impact._terremoto = w; } }
