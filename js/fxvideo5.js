"use strict";
/* =====================================================================
   MÁS COSAS DEL VÍDEO «LANCE vs IRIS» (dibujos de Gemini en assets/fx/):
   1) HIPERRAYO con anillos en espiral (hr_rayo.png).
   2) MARCAS EN EL SUELO que se quedan todo el combate (su_marca.png): grietas (Terremoto y golpes fuertes), quemaduras (fuego fuerte),
      cráteres (Tierra / Roca / Lucha fuertes y Roca Afilada). Máximo V9.marcas a la vez (las más viejas se van).
   3) PULSO UMBRÍO: al lanzarlo salen anillos oscuros en el suelo alrededor del que lo usa (pu_suelo.png).
   4) ROCA AFILADA NUEVA: golpea el suelo, la roca avanza por debajo de la tierra (polvo y piedrecitas por el camino) y cuando llega al rival
      (o al final del alcance) salen tres grupos de pinchos de piedra, uno detrás de otro (ra_pinchos.png). Se puede esquivar apartándose o saltando.
   V9.<parte> = false apaga cada cosa.
   ===================================================================== */
const V9 = {hiper: true, marcas: true, pulso: true, roca: true, max: 18};
const RA9 = {vel: 620, alcance: 560, radio: 48, pinchos: 3, espera: .08, entre: .2, R: 58, dmg: .42, esc: .95};   // [AJUSTE] velocidad bajo tierra · alcance · a qué distancia «encuentra» al rival · nº de grupos · s hasta el 1.º · s entre grupos · radio de daño · daño de cada grupo (× el del ataque) · tamaño del dibujo
const V9IMG = {}; function v9Img(k, n){ const im = new Image(); im.onload = () => { im.n = n; im.fw = im.width / n; im.ok = true; }; im.src = 'assets/fx/' + k + '.png?v=1'; V9IMG[k] = im; }
v9Img('su_marca', 6); v9Img('pu_suelo', 6); v9Img('ra_pinchos', 6); v9Img('ra_tierra', 6);
const v9Ok = k => V9IMG[k] && V9IMG[k].ok;
const v9Foot = f => { const I = idleInfo(f.m.dex); return f.y + I.foot * ESCALA - 4; };

// ---------------- 1) HIPERRAYO ----------------
if(V9.hiper && typeof GM !== 'undefined' && typeof BEAMX !== 'undefined' && BEAMX.Hiperrayo){
  GM.meta.hr_rayo = {fw: 237, fh: 135, n: 4, b0: 28, b1: 105}; const im = new Image(); im.onload = () => { GM.meta.hr_rayo.ok = true; }; im.src = 'assets/fx/hr_rayo.png?v=1'; GM.img.hr_rayo = im;
  BEAMX.Hiperrayo.sp = 'hr_rayo'; BEAMX.Hiperrayo.onda = 'rgba(0,0,0,0)'; }

// ---------------- 2) MARCAS EN EL SUELO ----------------
function v9Marca(x, y, kind, sc){                                                                 // kind: 'grieta' | 'quemadura' | 'crater'
  if(!V9.marcas || !g) return; const L = g.v9m || (g.v9m = []);
  if(L.some(m => Math.hypot(m.x - x, m.y - y) < 30 && m.kind === kind)) return;                   // no dos iguales encima
  const fr = kind === 'quemadura' ? 2 + (Math.random() < .5 ? 0 : 1) : kind === 'crater' ? 4 + (Math.random() < .5 ? 0 : 1) : (Math.random() < .5 ? 0 : 1);
  L.push({x, y, kind, fr, t0: g.t, sc: sc || 1, rot: (Math.random() - .5) * .8, flip: Math.random() < .5});
  while(L.length > V9.max) L.shift();
}
if(typeof hit === 'function'){ const o = hit; hit = function(T, dmg, type, A, close, big){
  const r = o.apply(this, arguments);
  try{ if(big && T && T.m && g && !g.pvp && !g.v9noMark){ const k = type === 'fuego' ? 'quemadura' : (type === 'tierra' || type === 'roca' || type === 'lucha') ? 'crater' : close ? 'grieta' : null;
    if(k) v9Marca(T.x + (Math.random() - .5) * 20, v9Foot(T), k, .9); } }catch(e){}
  return r; }; }
if(typeof quakeStart === 'function'){ const o = quakeStart; quakeStart = function(f){ const r = o.apply(this, arguments);
  try{ if(f && f.m && !g.pvp){ const y = v9Foot(f); v9Marca(f.x, y, 'grieta', 1.3); v9Marca(f.x - 70, y + 10, 'grieta', .9); v9Marca(f.x + 70, y - 8, 'grieta', .9); } }catch(e){}
  return r; }; }
function v9MarcasDraw(){
  if(!g || !g.v9m || !v9Ok('su_marca')) return; const im = V9IMG.su_marca;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  for(const m of g.v9m){ const a = Math.min(1, (g.t - m.t0) / .25), s = .55 * m.sc;
    ctx.save(); ctx.translate(m.x, m.y); ctx.scale(m.flip ? -1 : 1, .55); ctx.rotate(m.rot); ctx.globalAlpha = .8 * a;
    ctx.drawImage(im, m.fr * im.fw, 0, im.fw, im.height, -im.fw * s / 2, -im.height * s / 2, im.fw * s, im.height * s); ctx.restore(); }
  ctx.restore();
}

// ---------------- 3) PULSO UMBRÍO: anillos en el suelo ----------------
let V9pu = [];
if(typeof fxShotStart === 'function'){ const o = fxShotStart; fxShotStart = function(f, s, name){
  try{ if(V9.pulso && g && f && f.m && name === 'Pulso Umbrío' && !V9pu.some(P => P.f === f && g.t - P.t0 < .3)) V9pu.push({f, x: f.x, y: v9Foot(f), t0: g.t}); }catch(e){}
  return o.apply(this, arguments); }; }
function v9PulsoDraw(){
  if(!v9Ok('pu_suelo')) { V9pu = []; return; } const im = V9IMG.pu_suelo, D = .65;
  V9pu = V9pu.filter(P => g.t - P.t0 < D);
  ctx.save(); ctx.imageSmoothingEnabled = false;
  for(const P of V9pu){ const u = (g.t - P.t0) / D, fr = Math.min(im.n - 1, Math.floor(u * im.n)), s = 1.1;
    ctx.save(); ctx.translate(P.x, P.y); ctx.scale(1, .45); ctx.globalAlpha = .9;
    ctx.drawImage(im, fr * im.fw, 0, im.fw, im.height, -im.fw * s / 2, -im.height * s / 2, im.fw * s, im.height * s); ctx.restore(); }
  ctx.restore();
}

// ---------------- 4) ROCA AFILADA ----------------
let V9ra = [], V9sp = [];
if(typeof stoneStart === 'function'){ const o = stoneStart; stoneStart = function(f, w, wp){
  if(!V9.roca || !v9Ok('ra_pinchos') || (g && g.pvp)) return o.apply(this, arguments);
  const full = w.dmg * (1 + (FEEL.windK - 1) * wp);
  f.anQuake = 1; setAct(f, 'Attack', .45); f.dir = dirOf(w.ang);
  if(typeof Sfx !== 'undefined'){ Sfx.play('strong', w.vk); Sfx.play('hit', .6); } fx.shake = Math.max(fx.shake, 6);
  const y = v9Foot(f), x = f.x + Math.cos(w.ang) * 20;
  try{ fxBurst(x, y, ['#b9a07a', '#8a7556', '#d8c6a4'], 14, 180, 0, 6.3, {life: .5, s: 3, rise: -.2, drag: .86}); }catch(e){}
  v9Marca(x, y, 'grieta', .8);
  V9ra.push({x, y, ang: w.ang, d: 0, step: 0, G: {dmg: full * RA9.dmg, type: w.type, mine: w.mine, by: f, nm: w.nm, kbP: wp}});
}; }
function v9Erupt(x, y, G){
  for(let i = 0; i < RA9.pinchos; i++){ const dx = (i - 1) * 22 * Math.cos(G.ang9 || 0), dy = (i - 1) * 10;
    V9sp.push({x: x + dx + (Math.random() - .5) * 8, y: y + dy, t: -(RA9.espera + i * RA9.entre), G, last: i === RA9.pinchos - 1, hit: false, sc: RA9.esc * (i === RA9.pinchos - 1 ? 1.15 : 1)}); }
}
function v9RocaTick(dt){
  for(let i = V9ra.length - 1; i >= 0; i--){ const R = V9ra[i], G = R.G, T = foe(G.mine);
    R.d += RA9.vel * dt; const hx = R.x + Math.cos(R.ang) * R.d, hy = R.y + Math.sin(R.ang) * R.d;
    while(R.step * 38 < R.d){ R.step++; const px = R.x + Math.cos(R.ang) * R.step * 38, py = R.y + Math.sin(R.ang) * R.step * 38;    // por debajo de la tierra: polvo y piedrecitas
      try{ fxBurst(px, py, ['#b9a07a', '#8a7556', '#6b5a44'], 4, 90, -Math.PI / 2, 1.8, {life: .4, s: 2, rise: -.3, drag: .9}); }catch(e){}
      if(R.step % 2) V9sp.push({x: px, y: py, t: 0, mini: 1, sc: v9Ok('ra_tierra') ? .5 : .32}); }   // la tierra se levanta por donde pasa
    const tf = T && !T.dead && !T.ghost ? v9Foot(T) : 0, near = T && !T.dead && !T.ghost && Math.hypot(T.x - hx, tf - hy) < RA9.radio;
    if(near || R.d >= RA9.alcance){ G.ang9 = R.ang; v9Erupt(near ? T.x : hx, near ? tf : hy, G); V9ra.splice(i, 1); }
  }
  for(const S of V9sp){ const t0 = S.t; S.t += dt;
    if(!S.mini && t0 < 0 && S.t >= 0){                                                             // sale un grupo de pinchos: daño si el rival está encima
      const G = S.G, T = foe(G.mine); fx.shake = Math.max(fx.shake, S.last ? 9 : 5); if(typeof Sfx !== 'undefined') Sfx.play('hit', .8);
      try{ fxBurst(S.x, S.y - 10, ['#b9a07a', '#8a7556', '#d8c6a4', '#7a7066'], 12, 220, -Math.PI / 2, 2.4, {life: .55, s: 3, rise: -.4, drag: .88}); }catch(e){}
      if(T && !T.dead && !T.ghost && !T.jump && Math.hypot(T.x - S.x, v9Foot(T) - S.y) <= RA9.R){ if(G.by) G.by.kbP = G.kbP; g.v9noMark = 1; hit(T, G.dmg, G.type, G.by, false, S.last, G.nm); g.v9noMark = 0; if(G.by) G.by.kbP = 0; }
      if(typeof pilList === 'function') for(const p of pilList()) if(Math.hypot(p.x - S.x, p.y - S.y) <= RA9.R + p.r) pilDamage(p, 1);
      if(S.last) v9Marca(S.x, S.y, 'crater', 1); } }
  V9sp = V9sp.filter(S => S.t < (S.mini ? (v9Ok('ra_tierra') ? .55 : .35) : .8));
}
function v9RocaDraw(){
  if(!V9sp.length || !v9Ok('ra_pinchos')) return; const im = V9IMG.ra_pinchos;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  for(const S of V9sp.slice().sort((a, b) => a.y - b.y)){ if(S.t < 0) continue;
    if(S.mini && v9Ok('ra_tierra')){ const it = V9IMG.ra_tierra, fr = Math.min(it.n - 1, Math.floor(S.t / .55 * it.n)), s = S.sc;
      ctx.drawImage(it, fr * it.fw, 0, it.fw, it.height, S.x - it.fw * s / 2, S.y - it.height * s + 4 * s, it.fw * s, it.height * s); continue; }
    const D = S.mini ? .35 : .8, fr = S.mini ? Math.min(2, Math.floor(S.t / D * 3)) : Math.min(im.n - 1, Math.floor(S.t / D * im.n)), s = S.sc;
    ctx.drawImage(im, fr * im.fw, 0, im.fw, im.height, S.x - im.fw * s / 2, S.y - im.height * s + 6 * s, im.fw * s, im.height * s); }
  ctx.restore();
}
if(typeof spkTick === 'function'){ const o = spkTick; spkTick = function(dt){ const r = o.apply(this, arguments); try{ if(g && !g.paused) v9RocaTick(dt); }catch(e){} return r; }; }

// ---------------- enganches de dibujo ----------------
if(typeof fxhdGround === 'function'){ const o = fxhdGround; fxhdGround = function(){ const r = o.apply(this, arguments); try{ if(g){ v9MarcasDraw(); v9PulsoDraw(); } }catch(e){} return r; }; }   // en el suelo, debajo de todo
if(typeof megaDraw === 'function'){ const o = megaDraw; megaDraw = function(){ const r = o.apply(this, arguments); try{ if(g) v9RocaDraw(); }catch(e){} return r; }; }
