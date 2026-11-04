"use strict";
/* =====================================================================
   EFECTOS HD (prototipo): una capa que se pone ENCIMA de los efectos de siempre (fx.js, fxmelee.js, fxshots.js...)
   y los hace más vistosos SIN tocar ninguna de sus recetas. Si algo falla o lo apagas, el juego se ve como antes.
   Qué añade:
     1) BRILLO (bloom): todo lo que dibuja un efecto «sangra» luz alrededor, como en los juegos de Pokémon modernos.
     2) LUZ en los proyectiles: un halo suave del color del tipo que ilumina el suelo por donde pasan.
     3) GOLPE: al impactar salen un destello, una estrella de picos, una onda de choque en el suelo, líneas de velocidad y chispas.
     4) CARGA: antes de un disparo (y más en los fuertes) la energía del tipo se concentra en el atacante.
     5) CONGELADO (hit-stop): un instante de pausa al conectar un golpe fuerte o muy eficaz (solo contra la IA; en online no, para no desincronizar).
     6) DESTELLO de pantalla en golpes muy eficaces.
   Interruptor: fxhd.on (true/false). Se recuerda en localStorage 'arena2d_fxhd' ('0' = apagado).
   ===================================================================== */
const fxhd = {on: (() => { try{ return localStorage.getItem('arena2d_fxhd') !== '0'; }catch(e){ return true; } })(), stop:0, hits:[], charges:[], flash:null, glow:.55};      // glow = cuánta luz suman los brillos (1 = mucho, 0 = nada)
function fxhdSet(v){ fxhd.on = !!v; try{ localStorage.setItem('arena2d_fxhd', v ? '1' : '0'); }catch(e){} }

const hdrnd = (a, b) => a + Math.random() * (b - a);
const hdHex = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

// ---------------------------------------------------------------------
// 1) BRILLO (bloom). Truco: se guarda una copia pequeña del cuadro ANTES de dibujar los efectos; después se resta a la imagen final.
// Lo que queda es solo lo que han dibujado los efectos. Eso se desenfoca (a dos tamaños) y se suma encima con mezcla «lighter» (la luz se suma).
// ---------------------------------------------------------------------
const hdBl = {A:null, H:null, S:null, S2:null, on:false};
const hdCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(2, w); c.height = Math.max(2, h); return c; };
const fxhdLive = () => fx.list.length > 0 || fx.parts.length > 0 || fxhd.hits.length > 0 || fxhd.charges.length > 0 || !!fxhd.flash;

function fxhdBegin(){
  hdBl.on = fxhd.on && !LOWFX && !!g && fxhdLive();                                   // en modo rendimiento (state.js) no hay bloom: los halos de fxhdDraw siguen
  if(!hdBl.on) return;
  const w = cv.width >> 1, h = cv.height >> 1;
  if(!hdBl.A || hdBl.A.width !== w || hdBl.A.height !== h){ hdBl.A = hdCanvas(w, h); hdBl.H = hdCanvas(w, h); hdBl.S = hdCanvas(w >> 1, h >> 1); hdBl.S2 = hdCanvas(w >> 3, h >> 3); }
  const a = hdBl.A.getContext('2d'); a.globalCompositeOperation = 'copy'; a.drawImage(cv, 0, 0, w, h);
}
function fxhdEnd(){
  if(!hdBl.on) return;
  try{
    const w = hdBl.H.width, h = hdBl.H.height, hc = hdBl.H.getContext('2d');
    hc.globalCompositeOperation = 'copy'; hc.drawImage(cv, 0, 0, w, h);
    hc.globalCompositeOperation = 'difference'; hc.drawImage(hdBl.A, 0, 0);
    hc.globalCompositeOperation = 'source-over';
    const s1 = hdBl.S.getContext('2d'), s2 = hdBl.S2.getContext('2d');
    const fl = !LOWFX;                                                                 // en modo rendimiento sin filtros: el desenfoque sale solo de reducir y ampliar
    s1.globalCompositeOperation = 'copy'; if(fl) s1.filter = 'blur(2px) brightness(1.25)'; s1.drawImage(hdBl.H, 0, 0, hdBl.S.width, hdBl.S.height); if(fl) s1.filter = 'none';
    s2.globalCompositeOperation = 'copy'; if(fl) s2.filter = 'blur(2px) brightness(1.4)'; s2.drawImage(hdBl.H, 0, 0, hdBl.S2.width, hdBl.S2.height); if(fl) s2.filter = 'none';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = LOWFX ? 'low' : 'high';
    ctx.globalAlpha = (fl ? .6 : .8) * fxhd.glow; ctx.drawImage(hdBl.S, 0, 0, cv.width, cv.height);
    ctx.globalAlpha = (fl ? .5 : .7) * fxhd.glow; ctx.drawImage(hdBl.S2, 0, 0, cv.width, cv.height);
    ctx.restore();
  }catch(e){ hdBl.on = false; }
}

// ---------------------------------------------------------------------
// Dibujo de las capas (se llama entre fxhdBegin y fxhdEnd, ya dentro del temblor de pantalla)
// ---------------------------------------------------------------------
function glowAt(x, y, r, col, a){                                  // halo suave (degradado radial) que SUMA luz
  const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
  a *= fxhd.glow; gr.addColorStop(0, hdHex(col, a)); gr.addColorStop(.35, hdHex(col, a * .45)); gr.addColorStop(1, hdHex(col, 0));
  ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
let hdLast = performance.now();
function fxhdDraw(){
  const now = performance.now(), dt = Math.min(.05, (now - hdLast) / 1000); hdLast = now;
  if(!fxhd.on || !g) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  // 2) luz de los proyectiles
  for(const s of g.shots){
    if(typeof HERO4 !== 'undefined' && HERO4[s.mvn] && HERO4[s.mvn].flt) continue;                    // animación propia: sin halo genérico
    const P = fxPal(s.type), fl = .85 + .15 * Math.sin(g.t * 30 + s.x);
    glowAt(s.x, s.y, s.r * 5 * fl, P[3], .4);
    glowAt(s.x, s.y + 10, s.r * 6.5, P[2], .12);                       // reflejo en el suelo
  }
  // 4) carga: chispas que viajan hacia el atacante
  fxhd.charges.forEach(c => {
    c.t += dt; const u = clamp01(c.t / c.dur), P = fxPal(c.type), f = c.f;
    if(!f) return; const cx = f.x + (c.ox || 0), cy = f.y - 8;
    glowAt(cx, cy, 24 + 26 * c.k * Math.sin(u * Math.PI * .5 + .2), P[3], .08 + .22 * u * c.k);
    c.p.forEach(p => {
      const v = clamp01((c.t - p.d) / (c.dur - p.d)); if(v <= 0 || v >= 1) return;
      const e = v * v, r = p.r0 * (1 - e), x = cx + Math.cos(p.a + v * 1.6) * r, y = cy + Math.sin(p.a + v * 1.6) * r * .8;
      const tx = cx + Math.cos(p.a + (v - .12) * 1.6) * p.r0 * (1 - (v - .12) * (v - .12)), ty = cy + Math.sin(p.a + (v - .12) * 1.6) * p.r0 * (1 - (v - .12) * (v - .12)) * .8;
      ctx.strokeStyle = hdHex(P[4], .9 * (1 - v * .4)); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
    });
  });
  fxhd.charges = fxhd.charges.filter(c => c.t < c.dur);
  // 3) golpes
  fxhd.hits.forEach(h => {
    h.t += dt; const u = clamp01(h.t / h.dur), P = fxPal(h.type), k = h.k;
    const out = 1 - Math.pow(1 - u, 3);                               // sale rápido y se frena
    // destello central
    glowAt(h.x, h.y, (14 + 20 * k) * (.4 + out * .6), P[3], (1 - u) * .2);
    // anillos: onda de choque aplastada (perspectiva del suelo)
    ctx.lineCap = 'round';
    [[0, 1, P[4]], [.12, 1.45, P[3]]].forEach(([dl, sc, col]) => {
      const v = clamp01((h.t - dl) / (h.dur * .9)); if(v <= 0 || v >= 1) return; const o = 1 - Math.pow(1 - v, 3);
      ctx.strokeStyle = hdHex(col, (1 - v) * .9); ctx.lineWidth = 1 + 5 * (1 - v) * k;
      ctx.beginPath(); ctx.ellipse(h.x, h.y + 10, (8 + 52 * k * sc) * o, (3 + 20 * k * sc) * o, 0, 0, 6.283); ctx.stroke();
    });
    // estrella de picos: afilados, un poco girados
    const L = (14 + 30 * k) * (.25 + out * .9) * (1 - u * .55);
    ctx.fillStyle = hdHex(P[4], (1 - u) * .95);
    for(let i = 0; i < h.n; i++){
      const a = h.rot + i * 6.283 / h.n, len = L * (i % 2 ? .55 : 1), w = (3.2 + 2.6 * k) * (1 - u);
      ctx.beginPath(); ctx.moveTo(h.x + Math.cos(a) * len, h.y + Math.sin(a) * len);
      ctx.lineTo(h.x + Math.cos(a + 1.57) * w, h.y + Math.sin(a + 1.57) * w); ctx.lineTo(h.x + Math.cos(a - 1.57) * w, h.y + Math.sin(a - 1.57) * w); ctx.closePath(); ctx.fill();
    }
    // líneas de velocidad (rayas que salen disparadas)
    ctx.lineWidth = 2; ctx.strokeStyle = hdHex(P[3], (1 - u) * .8);
    h.lines.forEach(l => { const r0 = 10 + l.o * out * 30, r1 = r0 + l.len * (1 - u * .5) * (.4 + out);
      ctx.beginPath(); ctx.moveTo(h.x + Math.cos(l.a) * r0, h.y + Math.sin(l.a) * r0); ctx.lineTo(h.x + Math.cos(l.a) * r1, h.y + Math.sin(l.a) * r1); ctx.stroke(); });
    // chispas con estela, con algo de gravedad
    h.sp.forEach(s => {
      const tt = h.t; if(tt > s.life) return; const q = tt / s.life, x = h.x + s.vx * tt, y = h.y + s.vy * tt + 160 * tt * tt;
      const x2 = x - s.vx * .045, y2 = y - (s.vy + 320 * tt) * .045;
      ctx.strokeStyle = hdHex(q < .5 ? P[4] : P[3], 1 - q); ctx.lineWidth = s.w * (1 - q * .6); ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x, y); ctx.stroke();
    });
  });
  fxhd.hits = fxhd.hits.filter(h => h.t < h.dur);
  ctx.restore();
  // 6) destello de pantalla (en coordenadas del juego, cubre todo el campo)
  if(fxhd.flash){
    const fl = fxhd.flash; fl.t += dt; const u = clamp01(fl.t / fl.dur);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = hdHex(fl.col, (1 - u) * (1 - u) * fl.a); ctx.fillRect(-20, -20, W + 40, H + 40); ctx.restore();
    if(u >= 1) fxhd.flash = null;
  }
}

// ---------------------------------------------------------------------
// Ganchos: se «envuelven» las funciones de fx.js para añadir lo nuestro sin cambiarlas
// ---------------------------------------------------------------------
const hdFxHit = fxHit;
fxHit = function(T, name, type, mult, big, close, A){
  hdFxHit(T, name, type, mult, big, close, A);
  if(!fxhd.on || mult === 0) return;
  const k = (mult >= 2 ? 1.3 : mult < 1 ? .6 : 1) * (big ? 1.25 : close ? .9 : 1), n = mult >= 2 || big ? 10 : 8;
  const ang = A ? Math.atan2(T.y - A.y, T.x - A.x) : 0;
  if(!(typeof HERO4 !== 'undefined' && HERO4[name] && (HERO4[name].imp || HERO4[name].mel)))                         // los ataques con animación propia (fxhd4.js) no llevan el impacto genérico
  fxhd.hits.push({x:T.x, y:T.y - 6, type, k, n, rot:hdrnd(0, 6.28), t:0, dur:.34 + .12 * k,
    lines:Array.from({length: Math.round(9 + 8 * k)}, () => ({a:hdrnd(0, 6.28), o:hdrnd(0, 1), len:hdrnd(14, 34) * k})),
    sp:Array.from({length: Math.round(8 + 10 * k)}, () => { const a = ang + hdrnd(-1.5, 1.5) + (Math.random() < .35 ? Math.PI : 0), v = hdrnd(90, 300) * (.6 + .4 * k); return {vx:Math.cos(a) * v, vy:Math.sin(a) * v - hdrnd(20, 110), life:hdrnd(.28, .6), w:hdrnd(1.5, 3.2)}; })});
  if(!g.pvp && (mult >= 2 || big)) fxhd.stop = Math.max(fxhd.stop, big ? .085 : .06);          // congelado del golpe (no en online)
  if(mult >= 2) fxhd.flash = {t:0, dur:.2, col:fxPal(type)[3], a:.05};
};
const hdFxShotStart = fxShotStart;
fxShotStart = function(f, s, name, big){
  hdFxShotStart(f, s, name, big);
  if(!fxhd.on) return;
  const dur = big ? .55 : .28, ang = Math.atan2(s.vy, s.vx);
  fxhd.charges.push({f, type:s.type, t:0, dur, k:big ? 1.2 : .6, ox:Math.cos(ang) * 14, p:Array.from({length: big ? 22 : 10}, () => ({a:hdrnd(0, 6.28), r0:hdrnd(46, 96) * (big ? 1.2 : .8), d:hdrnd(0, dur * .5)}))});
};
const hdFxClear = fxClear;
fxClear = function(){ hdFxClear(); fxhd.hits.length = 0; fxhd.charges.length = 0; fxhd.flash = null; fxhd.stop = 0; };
