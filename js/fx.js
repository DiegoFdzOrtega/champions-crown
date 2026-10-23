"use strict";
/* =====================================================================
   13) MOTOR DE EFECTOS DE ATAQUE (pixel art dibujado por código, sin imágenes)
   Cada movimiento real tiene su propia animación (recetas en js/fxmoves.js).
   Aquí está lo común: lista de efectos, partículas, temblor, y los "ganchos" que usa el combate:
     fxMelee · fxShotStart · fxShot · fxHit · fxBuff · fxAura · fxLunge · fxUpdate · fxDraw
   Todo lo que se crea tiene duración limitada y se borra solo (hay además un máximo de efectos y de partículas).
   ===================================================================== */
const PXS = ESCALA;                                   // un "píxel" de efecto = un píxel del juego (2x2)
// Paleta de cada tipo: [contorno, sombra, base, luz, brillo]
const FXP = {
  normal:['#3b3b44','#9a9aa6','#d0d0d8','#f0f0f4','#ffffff'], fuego:['#5a1408','#c4300c','#ff7a1a','#ffc83a','#fff7c0'],
  agua:['#0b2d6b','#1f64d6','#3fa0ff','#9be0ff','#ffffff'],   planta:['#0f3d17','#2a8a2a','#5cd04a','#b5f07a','#f4ffd0'],
  electrico:['#5a4300','#d9a500','#ffd91f','#fff27a','#ffffff'], hielo:['#1a4670','#5eb7e6','#a5e8ff','#d9f8ff','#ffffff'],
  lucha:['#3a1408','#a8381a','#d9632a','#f2a35e','#ffe8c0'],  veneno:['#3a0f52','#8a2db8','#b85ee8','#e3a8ff','#fff0ff'],
  tierra:['#3d2810','#8a5a24','#c28a3c','#e8c27a','#fff3d0'], volador:['#31455f','#7f9ed6','#b6ccf2','#e0ecff','#ffffff'],
  psiquico:['#5a0f3a','#d42f86','#ff5fb0','#ffa8d8','#fff0fa'], bicho:['#2a3d08','#6a9a14','#9fd42a','#d4f26a','#fbffd0'],
  roca:['#2e2a1f','#7a7058','#b0a37a','#d9cea4','#f6efd2'],   fantasma:['#1c0f3a','#5b3a96','#8b64d0','#c4a8f2','#f2eaff'],
  dragon:['#101b52','#3b3fd1','#5f6bff','#7de3ff','#f0ffff'], siniestro:['#08060d','#2b2236','#4d3b5e','#9a6fd0','#e6d4ff'],
  acero:['#2a3340','#7a8798','#b3bfcf','#e3ebf5','#ffffff'],  hada:['#6a1f55','#e06ab8','#ff9ee0','#ffd6f4','#ffffff']
};
const FX_MAX = 140, FX_MAX_PARTS = 600;               // límites: evitan acumular objetos
const fx = {list:[], parts:[], shake:0};
// Tablas de recetas (se rellenan en fxmelee.js, fxshots.js y fxextra.js): una animación por cada movimiento real
const FXR = {melee:{}, stream:{}, impact:{}, buff:{}, aura:{}, flight:{}, trail:{}, cast:{}, shotStart:{}}, FXC = {}, FXI = {};
const fxPal = t => FXP[t] || FXP.normal;

// ---- Herramientas de dibujo pixel art (todo se ajusta a la rejilla de PXS) ----
const HH = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };   // "azar" estable
const snap = v => Math.round(v / PXS) * PXS;
function R(x, y, w, h, c){ ctx.fillStyle = c; ctx.fillRect(snap(x), snap(y), w * PXS, h * PXS); }          // w, h en píxeles
function D(x, y, r, c){                                                                                      // círculo, r en píxeles
  ctx.fillStyle = c; const cx = snap(x), cy = snap(y), r2 = r * r + r * .6;
  for(let j = -r; j <= r; j++){ const w = Math.floor(Math.sqrt(Math.max(0, r2 - j * j))); ctx.fillRect(cx - w * PXS, cy + j * PXS, (2 * w + 1) * PXS, PXS); }
}
function Ln(x0, y0, x1, y1, c, w = 1){
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / PXS));
  for(let i = 0; i <= n; i++){ const u = i / n; R(x0 + (x1 - x0) * u - (w - 1) * PXS / 2, y0 + (y1 - y0) * u - (w - 1) * PXS / 2, w, w, c); }
}
function Rg(x, y, r, c, ry, w = 1){                                                                          // anillo (elipse si ry)
  ry = ry ?? r; const n = Math.max(10, Math.ceil(6.283 * Math.max(r, ry))); for(let i = 0; i < n; i++){ const a = i / n * 6.283; R(x + Math.cos(a) * r * PXS - (w - 1) * PXS / 2, y + Math.sin(a) * ry * PXS - (w - 1) * PXS / 2, w, w, c); }
}
function Star(x, y, n, r0, r1, c, w = 1){ for(let i = 0; i < n; i++){ const a = i * 6.283 / n; Ln(x + Math.cos(a) * r0 * PXS, y + Math.sin(a) * r0 * PXS, x + Math.cos(a) * r1 * PXS, y + Math.sin(a) * r1 * PXS, c, w); } }
function Spark(x, y, s, c){ R(x - PXS / 2, y - s * PXS - PXS / 2, 1, 2 * s + 1, c); R(x - s * PXS - PXS / 2, y - PXS / 2, 2 * s + 1, 1, c); }            // destello en cruz
function local(x, y, ang, fn){ ctx.save(); ctx.translate(x, y); ctx.rotate(ang); fn(); ctx.restore(); }
const lerp = (a, b, u) => a + (b - a) * u, clamp01 = u => Math.max(0, Math.min(1, u)), ease = u => 1 - (1 - u) * (1 - u);
// Color según progreso u (0..1) dentro de una lista de colores
const ramp = (cols, u) => cols[Math.min(cols.length - 1, Math.floor(clamp01(u) * cols.length))];

// ---- Carga de efectos ----
// Los efectos no necesitan precarga (se dibujan por código): solo se vacía la lista al empezar cada combate.
function fxClear(){ fx.list.length = 0; fx.parts.length = 0; fx.shake = 0; }

// Crea un efecto. kind = 'melee' | 'stream' | 'impact' | 'buff' | 'cast' ... ; name = nombre del movimiento (receta)
function fxAdd(kind, name, o){
  if(fx.list.length >= FX_MAX) fx.list.shift();
  const e = Object.assign({kind, name, x:0, y:0, ang:0, t:0, dur:.5, delay:0, type:'normal', k:1, seed:Math.random() * 100}, o);
  fx.list.push(e); return e;
}
// Partículas sueltas (cuadraditos de pixel)
function fxBurst(x, y, cols, n, speed, ang, spread, o = {}){
  for(let i = 0; i < n && fx.parts.length < FX_MAX_PARTS; i++){
    const a = (ang ?? 0) + (Math.random() - .5) * (spread ?? 6.3), v = speed * (.35 + Math.random() * .65), life = (o.life || .45) * (.6 + Math.random() * .6);
    fx.parts.push({x, y, vx:Math.cos(a) * v, vy:Math.sin(a) * v, rise:o.rise || 0, grav:o.grav || 0, life, max:life, col:cols[(Math.random() * cols.length) | 0], s:PXS * (o.s || (Math.random() < .3 ? 2 : 1)), drag:o.drag ?? .93});
  }
}
const fxCols = (t, a = 1, b = 4) => fxPal(t).slice(a, b + 1);

// ---- Datos de un movimiento ----
const fxMeleeAt = (f, ang, T) => {                                                // dónde cae el golpe: sobre el rival si está cerca
  const d = Math.hypot(T.x - f.x, T.y - f.y);
  return d < 160 ? {x:T.x, y:T.y - 6} : {x:f.x + Math.cos(ang) * 70, y:f.y + Math.sin(ang) * 70 - 6};
};

// ---------------------------------------------------------------------
// GANCHOS DEL COMBATE
// ---------------------------------------------------------------------
// Ataque cuerpo a cuerpo (hueco 1)
function fxMelee(f, ang, T, name, type){
  const p = fxMeleeAt(f, ang, T), R_ = FXR.melee[name] || FXR.melee['Placaje'], cfg = FXC[name] || {};
  const e = fxAdd('melee', FXR.melee[name] ? name : 'Placaje', {x:p.x, y:p.y, ang, fol:f, type, dur:cfg.dur || .4, T, ox:f.x, oy:f.y});
  const lg = typeof cfg.lg === 'function' ? cfg.lg(f, T) : cfg.lg;
  if(lg) f.lg = {t:-(cfg.lgw || 0), dur:cfg.lgd || .28, d:lg, ang};            // el atacante se lanza hacia delante (solo visual)
  if(cfg.hide) f.hide = cfg.hide;                                              // Excavar: desaparece bajo tierra
  if(R_.start) R_.start(e, f, T);
}
// Disparo (huecos 2 y 4): crea los efectos que acompañan al proyectil (corriente, rayo, carga...)
function fxShotStart(f, s, name, big){
  s.mvn = name; const ang = Math.atan2(s.vy, s.vx), ox = s.x + Math.cos(ang) * 26, oy = s.y + Math.sin(ang) * 26 - 6;
  (FXR.cast[name] || FXR.cast['_'])(f, s, name, big, ox, oy, ang);
  if(FXR.stream[name]) fxAdd('stream', name, {shot:s, fol:f, type:s.type, dur:4, big, ox, oy, hx:s.x, hy:s.y, hang:ang});
  if(FXR.shotStart[name]) FXR.shotStart[name](f, s, big);
}
// Dibujo del proyectil en vuelo (devuelve false si no hay receta)
function fxShot(s){
  const fl = FXR.flight[s.mvn]; if(!fl) return false;
  const a = g.t - s.t0, ang = Math.atan2(s.vy, s.vx);
  try{ fl(s, a, ang, s.type); }catch(e){ ctx.restore(); return false; }
  return true;
}
// Impacto sobre el objetivo T. big = proyectil grande · close = cuerpo a cuerpo
function fxHit(T, name, type, mult, big, close, A){
  const k = (mult >= 2 ? 1.25 : mult < 1 ? .75 : 1), mine = g && g.p.includes(T);
  if(mult === 0){ fxBurst(T.x, T.y - 6, ['#ffffff', '#c8c8d4'], 6, 70); return; }
  if(!close){
    const im = FXR.impact[name] ? name : '_';
    fxAdd('impact', im, {x:T.x, y:T.y - 6, type, k, big, dur:FXC[name]?.idur || .6, ang:A ? Math.atan2(T.y - A.y, T.x - A.x) : 0, T, mv:name});
  } else fxBurst(T.x, T.y - 6, fxCols(type), 5, 90);
  fx.shake = Math.max(fx.shake, (big ? 8 : 3) * k + (mine ? 1 : 0) + (FXC[name]?.shake || 0));
}
// Mejora (hueco 3): animación sobre el usuario + aura mientras dura el efecto
function fxBuff(f, name, type){ const I = idleInfo(f.m.dex); fxAdd('buff', FXR.buff[name] ? name : '_', {x:f.x, y:f.y + I.foot * ESCALA - 6, fol:f, type, dur:.9}); f.auraName = FXR.aura[name] ? name : '_'; f.auraType = type; fx.shake = Math.max(fx.shake, 1.5); }
// Aura mientras dura la mejora (5 s). Devuelve false si no hay receta (se usa el anillo sencillo)
function fxAura(f, I){
  const r = FXR.aura[f.auraName] || FXR.aura['_']; if(typeof r !== 'function') return false;
  try{ r(f, I, g.t, f.auraType || f.m.types[0], Math.min(1, f.buff)); }catch(e){ ctx.restore(); }   // un fallo visual nunca debe parar el juego
  return true;
}
// Desplazamiento visual del atacante al lanzarse (no cambia su posición real ni la mecánica)
function fxLunge(f){
  if(!f.lg) return {x:0, y:0};
  const u = f.lg.t / f.lg.dur, s = Math.sin(Math.PI * clamp01(u)) * f.lg.d;
  return {x:Math.cos(f.lg.ang) * s, y:Math.sin(f.lg.ang) * s};
}
// El carga del polvo al correr
function fxDust(f){ const I = idleInfo(f.m.dex); fxBurst(f.x, f.y + I.foot * ESCALA - 4, ['#f0f0f8', '#c8c8d8', '#9a9aa8'], 3, 40, -Math.PI / 2, 1.6, {life:.35, s:2, rise:-.3, drag:.9}); }

// ---------------------------------------------------------------------
// CADA FOTOGRAMA
// ---------------------------------------------------------------------
function fxUpdate(dt){
  for(const e of fx.list){
    e.t += dt;
    if(e.shot){                                                              // efectos ligados a un proyectil (corriente, rayo)
      const s = e.shot, alive = s.life > 0 && g.shots.includes(s);
      if(alive){ e.hx = s.x; e.hy = s.y; e.hang = Math.atan2(s.vy, s.vx); } else if(e.ended === undefined) e.ended = e.t;
      if(e.ended !== undefined && e.t - e.ended > (FXC[e.name]?.fade ?? .22)) e.dead = true;
    }
    if(e.t > e.delay + e.dur && !e.shot) e.dead = true;
    if(e.t > 4.5) e.dead = true;
  }
  fx.list = fx.list.filter(e => !e.dead);                                    // se eliminan al terminar
  for(const f of [...g.p, ...g.e]){                                          // movimientos visuales de los Pokémon
    if(f.lg){ f.lg.t += dt; if(f.lg.t >= f.lg.dur) f.lg = null; }
    if(f.hide > 0) f.hide -= dt;
  }
  for(const s of g.shots){                                                   // estela detrás de cada proyectil
    const tr = FXR.trail[s.mvn] === undefined ? FXR.trail._ : FXR.trail[s.mvn]; if(!tr) continue;
    s.acc = (s.acc || 0) + dt; const step = 1 / (tr.rate || 40);
    while(s.acc > step){
      s.acc -= step; if(fx.parts.length >= FX_MAX_PARTS) break;
      const a = Math.atan2(s.vy, s.vx), c = typeof tr.cols === 'function' ? tr.cols(s) : tr.cols;
      fxBurst(s.x - Math.cos(a) * s.r * .6, s.y - Math.sin(a) * s.r * .6, c, 1, tr.speed || 25, a + Math.PI, tr.spread ?? 2.5, {life:tr.life || .35, rise:tr.rise || 0, s:tr.s});
    }
  }
  for(const p of fx.parts){ p.life -= dt; p.x += p.vx * dt; p.y += (p.vy - p.rise * 60 + p.grav * 120 * (1 - p.life / p.max)) * dt; p.vx *= p.drag; p.vy *= p.drag; }
  fx.parts = fx.parts.filter(p => p.life > 0);
  fx.shake = Math.max(0, fx.shake - dt * 30);
}

function fxDraw(){
  ctx.imageSmoothingEnabled = false;
  for(const e of fx.list){
    if(e.t < e.delay) continue; const a = e.t - e.delay;
    const r = e.kind === 'melee' ? FXR.melee[e.name] : e.kind === 'stream' ? FXR.stream[e.name] : e.kind === 'impact' ? (FXR.impact[e.name] || FXI[e.name]) : FXR.buff[e.name];
    const fn = r && (r.draw || r);
    ctx.save(); try{ if(typeof fn === 'function') fn(e, a, e.type); }catch(err){ e.dead = true; } ctx.restore();
  }
  for(const p of fx.parts){ ctx.globalAlpha = Math.min(1, p.life / p.max * 1.6); ctx.fillStyle = p.col; ctx.fillRect(snap(p.x), snap(p.y), p.s, p.s); }
  ctx.globalAlpha = 1;
}
// Temblor de pantalla: se aplica solo al campo (no al HUD)
function fxShakeApply(){ if(fx.shake > .3) ctx.translate((Math.random() - .5) * fx.shake, (Math.random() - .5) * fx.shake); }
