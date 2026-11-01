"use strict";
/* =====================================================================
   ATAQUES FUERTES (botón E) AL ESTILO DE LOS JUEGOS
   Formas planas, contorno oscuro y 4 capas de color (sin brillos difusos). Tamaño moderado.
     Hiperrayo · Terremoto · Cometa Draco · Onda Certera · Lanzamugre · Megacuerno · Pulso Noche · Foco Resplandor · Fuerza Lunar
   Se enganchan en HERO4 (fxhd4.js). Este archivo se carga ANTES de fxhd4.js y DESPUÉS de fxtipos.js (usa sus ayudas: tpLayers,
   tpTongue, tpEllipse, HH, hdFract, clamp01, bodyOf, sg, once...). Paletas: [contorno, base, medio, claro, centro].
   ===================================================================== */
const FV = {
  normal: ['#6b2a00', '#ff7a1a', '#ffc83a', '#fff0b0', '#ffffff'],
  tierra: ['#2b1a08', '#8a5a24', '#c8964a', '#e8c27a', '#fff3d0'],
  dragon: ['#0f1a52', '#3b3fd1', '#5f6bff', '#7de3ff', '#f0ffff'],
  lucha:  ['#12306e', '#2e7be8', '#7ec3ff', '#d6efff', '#ffffff'],
  veneno: ['#2c0a42', '#7a2aa8', '#b05ae0', '#dba0f8', '#f4d8ff'],
  bicho:  ['#1c3a0c', '#5fa11e', '#9bd33f', '#d6f58a', '#f6ffd6'],
  sini:   ['#0a0612', '#2e1f4a', '#6a3fa8', '#b58cf0', '#efe3ff'],
  acero:  ['#1d2733', '#7a8fa8', '#b8c8dc', '#e6eef8', '#ffffff'],
  hada:   ['#6a1f55', '#e06ab8', '#ff9ee0', '#ffd6f4', '#ffffff']
};

const FV_POLVO = ['#3d2c18', '#9c8460', '#bfa880', '#dccfb0', '#efe6d0'];     // polvo: marrón grisáceo (no naranja)
// ---------- Ayudas ----------
function fvPoly(pts, fill, stroke, lw, A){
  ctx.save(); if(A != null) ctx.globalAlpha = A; ctx.beginPath(); pts.forEach((p, i) => ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1])); ctx.closePath();
  if(fill){ ctx.fillStyle = fill; ctx.fill(); } if(stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.lineJoin = 'miter'; ctx.stroke(); } ctx.restore();
}
function fvStar(x, y, R, n, rot, pal, A){                  // estrella plana de n puntas con 3 capas
  ctx.save(); ctx.globalAlpha = A == null ? 1 : A; ctx.translate(x, y); ctx.rotate(rot || 0);
  [[1, 3, pal[0]], [1, 0, pal[2]], [.62, 0, pal[3]], [.3, 0, pal[4]]].forEach(([sc, pad, col]) => { ctx.beginPath(); for(let i = 0; i < n * 2; i++){ const r = (i % 2 ? R * .46 : R) * sc + pad, an = i * Math.PI / n; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(an) * r, Math.sin(an) * r); } ctx.closePath(); ctx.fillStyle = col; ctx.fill(); });
  ctx.restore();
}
function fvRing(x, y, r, A, pal, w, sy){                    // anillo con contorno (sy < 1 = aplastado como en el suelo)
  ctx.save(); ctx.globalAlpha = A; ctx.beginPath(); ctx.ellipse(x, y, r, r * (sy || 1), 0, 0, 6.283); ctx.strokeStyle = pal[0]; ctx.lineWidth = w + 5; ctx.stroke(); ctx.strokeStyle = pal[3]; ctx.lineWidth = w; ctx.stroke(); ctx.restore();
}
function fvSpark(x, y, r, col, edge, A){                    // destello de 4 puntas
  ctx.save(); ctx.globalAlpha = A == null ? 1 : A; ctx.translate(x, y); ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * .28, -r * .28); ctx.lineTo(r, 0); ctx.lineTo(r * .28, r * .28); ctx.lineTo(0, r); ctx.lineTo(-r * .28, r * .28); ctx.lineTo(-r, 0); ctx.lineTo(-r * .28, -r * .28); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); if(edge){ ctx.strokeStyle = edge; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore();
}
function fvEmbers(x, y, a, n, spd, life, g0, cols, sz){     // brasas / trocitos que salen disparados y caen
  ctx.save(); for(let i = 0; i < n; i++){ const t = a - HH(i, 20) * .06; if(t < 0 || t > life) continue; const an = HH(i, 21) * 6.283, v = spd * (.5 + HH(i, 22)), s = (sz || 4) * (.7 + HH(i, 23) * .8);
    ctx.globalAlpha = 1 - t / life; ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(x + Math.cos(an) * v * t - s / 2, y + Math.sin(an) * v * t * .85 + g0 * t * t - s / 2, s, s); } ctx.restore();
}
function fvCharge(x, y, u, pal){                           // carga: motas que entran y una bola que crece
  const ease = 1 - Math.pow(1 - u, 2); ctx.save(); ctx.globalCompositeOperation = 'source-over';
  for(let i = 0; i < 10; i++){ const th = i * .628 + u * 4, rad = 62 * (1 - ease) * (.55 + .45 * HH(i, 1)) + 8; ctx.globalAlpha = Math.min(1, u * 5); ctx.fillStyle = i % 2 ? pal[3] : pal[2]; ctx.fillRect(x + Math.cos(th) * rad - 2.5, y - 4 + Math.sin(th) * rad * .85 - 2.5, 5, 5); }
  ctx.globalAlpha = 1; tpLayers([[x, y - 4, 5 + 15 * ease]], pal); ctx.restore();
}
// Rayo recto de grosor w con 5 capas. e.t cuenta desde que sale el ataque; CH = segundos de carga antes del rayo.
function fvBeam(e, pal, o){
  const t = e.t || 0, CH = o.CH || 0; if(t < CH){ fvCharge(e.ox, e.oy, t / CH, pal); return; }
  const G = sg(e, o.L || 340); if(G.len < 8) return; const A = G.al, gw = clamp01((t - CH) / .12), w = (o.w + Math.sin(g.t * 18) * 2) * gw, dx = Math.cos(G.an), dy = Math.sin(G.an), px = -dy, py = dx, N = 16;
  const half = u => (w / 2) * (u < .14 ? .5 + .5 * u / .14 : 1);
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  const poly = (sc, pad) => { ctx.beginPath(); for(let i = 0; i <= N; i++){ const u = i / N, h = half(u) * sc + pad; ctx[i ? 'lineTo' : 'moveTo'](G.x0 + dx * G.len * u + px * h, G.y0 + dy * G.len * u + py * h); }
    ctx.arc(G.x1, G.y1, half(1) * sc + pad, G.an - Math.PI / 2, G.an + Math.PI / 2); for(let i = N; i >= 0; i--){ const u = i / N, h = half(u) * sc + pad; ctx.lineTo(G.x0 + dx * G.len * u - px * h, G.y0 + dy * G.len * u - py * h); } ctx.closePath(); };
  ctx.globalAlpha = A; [[1, 3, pal[0]], [1, 0, pal[1]], [.7, 0, pal[2]], [.42, 0, pal[3]], [.18, 0, pal[4]]].forEach(([sc, pad, c]) => { ctx.fillStyle = c; poly(sc, pad); ctx.fill(); });
  if(o.deco) o.deco(G, w, A, dx, dy, px, py);
  tpLayers([[G.x0, G.y0, 9 * gw]], pal, A);
  ctx.restore();
}

// ====================== HIPERRAYO (normal) ======================
// Como en HeartGold: 1) una bola naranja con borde de llama se hincha mientras anillos y rayitas se cierran hacia ella (0,45 s),
// 2) sale un rayo MUY ancho naranja con el borde dentado, una doble hélice que gira por dentro y arcos que avanzan por el rayo,
// 3) al impactar NO hay explosión (pedido por Diego): solo el rayo.
const FV_HR = ['#5a1800', '#ff5a14', '#ffa526', '#ffe27a', '#ffffff'];
function fvHrCharge(e, u){
  const x = e.ox, y = e.oy - 4, ease = u * u, R = 6 + 24 * ease, k = Math.floor(g.t * 18);
  ctx.save();
  for(let i = 0; i < 12; i++){ const an = i * .5236 + HH(i, 7) * .3, far = 78 * (1 - ease) + R + 6, near = far - 16 - 10 * HH(i, 8);   // rayitas que se cierran hacia la bola
    ctx.globalAlpha = Math.min(1, u * 4); ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * far, y + Math.sin(an) * far * .85); ctx.lineTo(x + Math.cos(an) * near, y + Math.sin(an) * near * .85);
    ctx.strokeStyle = FV_HR[0]; ctx.lineWidth = 5; ctx.stroke(); ctx.strokeStyle = i % 2 ? FV_HR[3] : FV_HR[2]; ctx.lineWidth = 2.5; ctx.stroke(); }
  for(let r = 0; r < 3; r++){ const v = hdFract(u * 1.4 + r / 3); fvRing(x, y, R + 52 * (1 - v), (1 - v) * .9 * Math.min(1, u * 5), FV_HR, 4 - 2 * (1 - v)); }   // anillos que se cierran
  ctx.globalAlpha = 1;
  ctx.beginPath(); for(let i = 0; i < 16; i++){ const an = i * .3927, r = (R + 6 + ((i + k) % 2 ? 4 : 0)) * 1; ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(an) * r, y + Math.sin(an) * r); } ctx.closePath(); ctx.fillStyle = FV_HR[0]; ctx.fill();   // borde de llama
  tpLayers([[x, y, R]], FV_HR);
  ctx.restore();
}
function fvHiperrayo(e){
  const t = e.t || 0, CH = .45; if(t < CH){ fvHrCharge(e, t / CH); return; }
  const G = sg(e, 380); if(G.len < 8) return;
  const A = G.al, gw = clamp01((t - CH) / .1), W = Math.max(0, 40 * gw + Math.sin(g.t * 20) * 2), dx = Math.cos(G.an), dy = Math.sin(G.an), px = -dy, py = dx, N = 30, kk = Math.floor(g.t * 16), P = FV_HR;
  const half = (u, sc, pad) => { const ramp = u < .1 ? .45 + .55 * u / .1 : 1, jag = ((Math.floor(u * N) + kk) % 2 ? 1 : .86); return Math.max(0, (W / 2) * ramp * (sc === 1 ? jag : 1) * sc + pad); };
  const poly = (sc, pad) => { ctx.beginPath(); for(let i = 0; i <= N; i++){ const u = i / N, h = half(u, sc, pad); ctx[i ? 'lineTo' : 'moveTo'](G.x0 + dx * G.len * u + px * h, G.y0 + dy * G.len * u + py * h); }
    ctx.arc(G.x1, G.y1, half(1, sc, pad), G.an - Math.PI / 2, G.an + Math.PI / 2); for(let i = N; i >= 0; i--){ const u = i / N, h = half(u, sc, pad); ctx.lineTo(G.x0 + dx * G.len * u - px * h, G.y0 + dy * G.len * u - py * h); } ctx.closePath(); };
  ctx.save(); ctx.globalAlpha = A;
  [[1, 3, P[0]], [1, 0, P[1]], [.74, 0, P[2]], [.46, 0, P[3]], [.2, 0, P[4]]].forEach(([sc, pad, c]) => { ctx.fillStyle = c; poly(sc, pad); ctx.fill(); });
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for(let s = 0; s < 2; s++){                                                       // doble hélice que gira (la parte de delante más gruesa)
    let prev = null; for(let i = 0; i <= 40; i++){ const u = i / 40, ph = u * 16 - g.t * 24 + s * Math.PI, off = Math.sin(ph) * W * .3 * (u < .1 ? u / .1 : 1), front = Math.cos(ph) > 0, X = G.x0 + dx * G.len * u + px * off, Y = G.y0 + dy * G.len * u + py * off;
      if(prev && front){ ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(X, Y); ctx.strokeStyle = P[0]; ctx.lineWidth = 8; ctx.stroke(); ctx.strokeStyle = s ? P[3] : P[4]; ctx.lineWidth = 4; ctx.stroke(); } prev = [X, Y]; } }
  for(let i = 0; i < 5; i++){ const u = hdFract(i * .2 + g.t * 1.5), bx = G.x0 + dx * G.len * u, by = G.y0 + dy * G.len * u, h = W * .62 * (u < .1 ? u / .1 : 1);   // arcos que avanzan
    ctx.globalAlpha = A * (1 - u * .4); ctx.beginPath(); ctx.moveTo(bx - dx * 8 + px * h, by - dy * 8 + py * h); ctx.quadraticCurveTo(bx + dx * 12, by + dy * 12, bx - dx * 8 - px * h, by - dy * 8 - py * h);
    ctx.strokeStyle = P[0]; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = P[3]; ctx.lineWidth = 2.5; ctx.stroke(); }
  ctx.globalAlpha = A;
  for(let i = 0; i < 10; i++){ const u = hdFract(i * .1 + g.t * 2.1), off = (HH(i, 3) - .5) * W * 1.7; ctx.fillStyle = i % 2 ? P[3] : P[2]; ctx.fillRect(G.x0 + dx * G.len * u + px * off - 2.5, G.y0 + dy * G.len * u + py * off - 2.5, 5, 5); }
  fvStar(G.x0, G.y0, 22 * gw, 8, g.t * 3, P, A);                                   // boca del rayo
  fvStar(G.x1, G.y1, 20 * gw, 10, -g.t * 2.4, P, A);                               // punta
  ctx.restore();
}
function fvHiperrayoHit(e, a){ /* sin explosión al impactar (a petición de Diego): solo se ve el rayo */ }

// ====================== TERREMOTO (tierra) ======================
function fvTerremoto(e){
  const G = sg(e, 330), A = G.al, p = FV.tierra, n = Math.max(3, Math.ceil(G.len / 12)), k = Math.floor(g.t * 10), gy = 14, pts = [];
  for(let i = 0; i <= n; i++){ const u = i / n, o = (HH(i, 2 + (k & 1)) - .5) * 14 * (i % 2 ? 1 : .6); pts.push([G.x0 + (G.x1 - G.x0) * u + G.px * o, G.y0 + (G.y1 - G.y0) * u + G.py * o + gy]); }
  ctx.save(); ctx.globalAlpha = A; ctx.lineJoin = 'miter'; ctx.lineCap = 'round';
  for(const [col, lw] of [[p[1], 15], [p[0], 10], ['#050302', 4]]){ ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach((q, i) => ctx[i ? 'lineTo' : 'moveTo'](q[0], q[1])); ctx.stroke(); }
  for(let i = 1; i < n; i += 2){ const q = pts[i], an = HH(i, 6) * 6.283; ctx.strokeStyle = p[0]; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] + Math.cos(an) * 12, q[1] + Math.sin(an) * 7); ctx.stroke(); }   // grietas que se ramifican
  for(let i = 0; i < 7; i++){ const u = HH(i, k), j = Math.min(n, Math.floor(u * n)), q = pts[j], h = Math.abs(Math.sin(g.t * 9 + i * 2)) * 15, w = 5 + HH(i, 8) * 3;   // rocas que saltan
    fvPoly([[q[0] - w, q[1]], [q[0] - w * .5, q[1] - h - 3], [q[0] + w * .6, q[1] - h], [q[0] + w, q[1]]], p[2], p[0], 2); }
  for(let i = 0; i < 5; i++){ const u = hdFract(i * .2 + g.t * 1.2), q = pts[Math.min(n, Math.floor(u * n))], r = 5 + 7 * u; ctx.globalAlpha = A * (1 - u) * .9; tpLayers([[q[0], q[1] - 8 - u * 12, r]], FV_POLVO); }   // polvo
  ctx.restore();
}
function fvTerremotoHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y + 14, p = FV.tierra; if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'tierra', k); fx.shake = Math.max(fx.shake, 9); }
  for(let r = 0; r < 3; r++){ const v = clamp01((a - r * .1) / .55); if(v > 0 && v < 1){ const o = 1 - Math.pow(1 - v, 2); fvRing(x, y, (14 + 96 * o) * k, 1 - v, p, 5 - 2 * v, .4); } }
  const gr = 1 - Math.pow(1 - clamp01(a / .25), 2), fa = 1 - clamp01((a - .6) / .35);
  ctx.save(); ctx.globalAlpha = fa; ctx.lineCap = 'round'; ctx.lineJoin = 'miter';
  for(let i = 0; i < 8; i++){ const an = i * .785 + .2, L = (34 + HH(i, 5) * 50) * gr * k; const pts = [[x, y]]; for(let s = 1; s <= 4; s++) pts.push([x + Math.cos(an) * L * s / 4 + (HH(i, s) - .5) * 10, y + Math.sin(an) * L * .45 * s / 4 + (HH(i, s + 4) - .5) * 4]);
    for(const [col, lw] of [[p[1], 9], [p[0], 5], ['#050302', 2]]){ ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach((q, j) => ctx[j ? 'lineTo' : 'moveTo'](q[0], q[1])); ctx.stroke(); } }
  ctx.restore();
  for(let i = 0; i < 11; i++){ const t = a - HH(i, 30) * .05; if(t < 0 || t > .85) continue; const vx = (HH(i, 31) - .5) * 190, vy = -150 - HH(i, 32) * 150, rx = x + vx * t, ry = y - 6 + vy * t + 520 * t * t, rot = t * 9 + i, s = 6 + HH(i, 33) * 6;
    ctx.save(); ctx.translate(rx, ry); ctx.rotate(rot); fvPoly([[-s, s * .6], [-s * .3, -s], [s, -s * .4], [s * .7, s * .8]], i % 2 ? p[2] : p[3], p[0], 2, 1 - t / .85); ctx.restore(); }
  for(let i = 0; i < 6; i++){ const t = a - .04 * i; if(t < 0 || t > .6) continue; const u = t / .6, ox = (HH(i, 40) - .5) * 90 * k; ctx.save(); ctx.globalAlpha = 1 - u; tpLayers([[x + ox, y - 6 - 26 * u, (10 + 14 * u) * k]], FV_POLVO); ctx.restore(); }
}

// ====================== COMETA DRACO (dragón) ======================
function fvCometaFlight(s, a, an){
  ctx.save(); const t = g.t, k = Math.floor(t * 14), ca = Math.cos(an), sa = Math.sin(an), px = -sa, py = ca, P = FV.dragon;
  for(let i = 0; i < 3; i++){ const o = (i - 1) * 9; tpTongue(s.x - ca * 6 + px * o, s.y - sa * 6 + py * o, 62 + HH(i, k) * 22 - Math.abs(i - 1) * 14, 8, an + Math.PI + (i - 1) * .12, i === 1 ? P[3] : P[2], P[0]); }
  tpLayers([[s.x, s.y, 14], [s.x - ca * 6, s.y - sa * 6, 11]], P);
  for(let i = 0; i < 5; i++){ const u = (t * 2.2 + i / 5) % 1, d = 18 + u * 70, o = (HH(i, 12) - .5) * 28; fvSpark(s.x - ca * d + px * o, s.y - sa * d + py * o, 5 * (1 - u) + 2, i % 2 ? P[4] : P[3], null, 1 - u); }
  ctx.restore();
}
function fvCometaHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 6, P = FV.dragon; if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'normal', k); }
  const N = 5; for(let i = 0; i < N; i++){
    const t0 = i * .09, fall = .2, tx = x + (i === 0 ? 0 : (HH(i, 50) - .5) * 100) * k, ty = y + (i === 0 ? 0 : (HH(i, 51) - .5) * 44), t = a - t0;
    if(t >= 0 && t < fall){ const u = t / fall, sx = tx + 150 * (1 - u), sy = ty - 330 * (1 - u), ang = Math.atan2(ty - sy, tx - sx);       // meteoro que cae del cielo
      tpTongue(sx, sy, 60, 9, ang + Math.PI, P[2], P[0]); tpLayers([[sx, sy, i === 0 ? 11 : 8]], P); }
    else if(t >= fall && t < fall + .45){ const v = (t - fall) / .45, R = (i === 0 ? 48 : 30) * (1 - Math.pow(1 - clamp01(v / .35), 3)) * k;
      if(v < .6) fvStar(tx, ty, R, 8, v, P, 1 - clamp01((v - .35) / .25)); fvRing(tx, ty, (10 + (i === 0 ? 72 : 44) * v) * k, 1 - v, P, 4 - 2 * v, .7); if(i === 0) once(e, () => fx.shake = Math.max(fx.shake, 6), 's'); } }
  for(let i = 0; i < 8; i++){ const t = a - .2 - HH(i, 60) * .1; if(t < 0 || t > .6) continue; const an = HH(i, 61) * 6.283, d = 20 + 70 * t; fvSpark(x + Math.cos(an) * d, y + Math.sin(an) * d * .8, 5, i % 2 ? P[4] : P[3], P[0], 1 - t / .6); }
}

// ====================== ONDA CERTERA (lucha) ======================
function fvOndaFlight(s, a, an){
  ctx.save(); const t = g.t, P = FV.lucha, r = 14 + Math.sin(t * 12);
  for(let i = 0; i < 3; i++){ const v = (t * 2 + i / 3) % 1; ctx.save(); ctx.globalAlpha = 1 - v; ctx.beginPath(); ctx.arc(s.x, s.y, r + 3 + v * 14, 0, 6.283); ctx.strokeStyle = P[0]; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = P[3]; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
  tpLayers([[s.x, s.y, r]], P);
  ctx.strokeStyle = P[4]; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; for(let i = 0; i < 2; i++){ const th = t * 7 + i * Math.PI; ctx.beginPath(); ctx.arc(s.x, s.y, r * .72, th, th + 1.1); ctx.stroke(); }
  for(let i = 0; i < 4; i++){ const th = t * 4 + i * 1.57; fvSpark(s.x + Math.cos(th) * (r + 10), s.y + Math.sin(th) * (r + 10), 4, P[4], null); }
  ctx.restore();
}
function fvOndaHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 6, P = FV.lucha; if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'normal', k); fx.shake = Math.max(fx.shake, 6); }
  const u = 1 - Math.pow(1 - clamp01(a / .16), 3), life = a < .35 ? 1 : Math.max(0, 1 - (a - .35) / .25);
  if(life > 0){ fvStar(x, y, 46 * u * life * k, 8, a * 2, P); tpLayers([[x, y, 20 * u * life * k]], P); }
  for(let r = 0; r < 2; r++){ const v = clamp01((a - r * .09) / .5); if(v > 0 && v < 1){ const o = 1 - Math.pow(1 - v, 2); fvRing(x, y, (20 + (r ? 56 : 80) * o) * k, 1 - v, P, 5 - 2 * v); } }
  for(let i = 0; i < 10; i++){ const t = a - HH(i, 70) * .05; if(t < 0 || t > .6) continue; const an = (i / 10) * 6.283, d = (22 + 70 * t) * k; fvSpark(x + Math.cos(an) * d, y + Math.sin(an) * d, 5, i % 2 ? P[4] : P[3], P[0], 1 - t / .6); }
}

// ====================== LANZAMUGRE (veneno) ======================
function fvLanzamugreFlight(s, a, an){
  ctx.save(); const t = g.t, k = Math.floor(t * 10), P = FV.veneno, ca = Math.cos(an), sa = Math.sin(an), list = [[s.x, s.y, 15 + Math.sin(t * 10)]];
  for(let i = 0; i < 5; i++){ const th = t * 5 + i * 1.256; list.push([s.x + Math.cos(th) * 11, s.y + Math.sin(th) * 11, 6 + HH(i, k) * 3]); }
  for(let i = 0; i < 3; i++){ const u = (t * 2.4 + i / 3) % 1, d = 18 + u * 46; ctx.globalAlpha = 1 - u; tpLayers([[s.x - ca * d + (HH(i, 4) - .5) * 14, s.y - sa * d + u * 14 + (HH(i, 5) - .5) * 14, 5 * (1 - u * .5)]], P); }
  ctx.globalAlpha = 1; tpLayers(list, P);
  for(let i = 0; i < 3; i++){ const bx = s.x + (HH(i, 9) - .5) * 20, by = s.y - 15 - ((t * 24 + i * 9) % 18); ctx.globalAlpha = 1 - ((t * 24 + i * 9) % 18) / 18; ctx.beginPath(); ctx.arc(bx, by, 3, 0, 6.283); ctx.strokeStyle = P[0]; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = P[4]; ctx.lineWidth = 1.2; ctx.stroke(); }
  ctx.restore();
}
function fvLanzamugreHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 6, P = FV.veneno; if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'veneno', k); fx.shake = Math.max(fx.shake, 4); }
  const u = 1 - Math.pow(1 - clamp01(a / .14), 3), life = a < .55 ? 1 : Math.max(0, 1 - (a - .55) / .3);
  if(life > 0){ const list = [[x, y, 18 * u * life * k]]; for(let i = 0; i < 9; i++){ const an = (i / 9) * 6.283 + .3, d = (24 + HH(i, 3) * 12) * u * k; list.push([x + Math.cos(an) * d, y + Math.sin(an) * d * .8, (9 + HH(i, 4) * 5) * life * k]); }
    ctx.save(); ctx.globalAlpha = life; tpLayers(list, P); ctx.restore();
    for(let i = 0; i < 6; i++){ const an = i * 1.05 + .5, dx0 = x + Math.cos(an) * 26 * k, L = (14 + 26 * clamp01((a - .1) / .4)) * (.7 + HH(i, 8) * .6) * k; tpTongue(dx0, y + Math.sin(an) * 20 * k, L, 5, Math.PI / 2, P[2], P[0], life); } }
  const v = clamp01(a / .5); if(v < 1){ ctx.save(); ctx.globalAlpha = 1 - clamp01((a - .5) / .4); ctx.beginPath(); ctx.ellipse(x, e.y + 12, (14 + 44 * v) * k, (5 + 14 * v) * k, 0, 0, 6.283); ctx.fillStyle = P[0]; ctx.fill(); ctx.beginPath(); ctx.ellipse(x, e.y + 11, (10 + 40 * v) * k, (3 + 12 * v) * k, 0, 0, 6.283); ctx.fillStyle = P[1]; ctx.fill(); ctx.restore(); }
  for(let i = 0; i < 7; i++){ const t = a - .1 - HH(i, 80) * .2; if(t < 0 || t > .7) continue; const bx = x + (HH(i, 81) - .5) * 70 * k, by = y - 10 - 60 * t; ctx.save(); ctx.globalAlpha = 1 - t / .7; ctx.beginPath(); ctx.arc(bx, by, 4 + HH(i, 82) * 4, 0, 6.283); ctx.strokeStyle = P[0]; ctx.lineWidth = 3.5; ctx.stroke(); ctx.strokeStyle = P[3]; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore(); }
}

// ====================== MEGACUERNO (bicho) ======================
function fvMegaHorn(x, y, an, L, W, P, A){
  ctx.save(); ctx.globalAlpha = A == null ? 1 : A; ctx.translate(x, y); ctx.rotate(an);
  fvPoly([[L, 0], [-L * .35, -W], [-L * .35, W]], P[2], P[0], 3);
  fvPoly([[L, 0], [-L * .35, -W], [-L * .35, -W * .15]], P[3], null);
  ctx.strokeStyle = P[0]; ctx.lineWidth = 2.5; for(let i = 0; i < 4; i++){ const px = -L * .3 + ((i * L * .3 + g.t * 70) % (L * 1.1)), hw = W * (1 - (px + L * .35) / (L * 1.35)); if(hw > 1){ ctx.beginPath(); ctx.moveTo(px, -hw); ctx.lineTo(px, hw); ctx.stroke(); } }
  ctx.restore();
}
function fvMegaFlight(s, a, an){
  ctx.save(); const t = g.t, P = FV.bicho, ca = Math.cos(an), sa = Math.sin(an), px = -sa, py = ca;
  for(let i = 0; i < 4; i++){ const o = (i - 1.5) * 10, d = 30 + HH(i, Math.floor(t * 14)) * 22; ctx.strokeStyle = P[3]; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(s.x - ca * 26 + px * o, s.y - sa * 26 + py * o); ctx.lineTo(s.x - ca * (26 + d) + px * o, s.y - sa * (26 + d) + py * o); ctx.stroke(); }
  fvMegaHorn(s.x, s.y, an, 36, 12, P);
  ctx.restore();
}
function fvMegaHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 6, P = FV.bicho; if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'normal', k); fx.shake = Math.max(fx.shake, 6); }
  const u = 1 - Math.pow(1 - clamp01(a / .14), 3), life = a < .35 ? 1 : Math.max(0, 1 - (a - .35) / .25);
  if(life > 0){ for(let i = 0; i < 6; i++){ const an = (i / 6) * 6.283 + .4; fvMegaHorn(x + Math.cos(an) * 10, y + Math.sin(an) * 10, an, 50 * u * life * k, 10 * life, P, life); }
    fvStar(x, y, 22 * u * life * k, 8, a * 3, P, life); }
  const v = clamp01(a / .45); if(v < 1) fvRing(x, y, (16 + 56 * (1 - Math.pow(1 - v, 2))) * k, 1 - v, P, 4);
  fvEmbers(x, y, a, 12, 120, .6, 80, [P[3], P[2], P[4]], 4);
}

// ====================== PULSO NOCHE (siniestro) ======================
function fvNocheFlight(s, a, an){
  ctx.save(); const t = g.t, P = FV.sini;
  for(let i = 0; i < 3; i++){ const v = (t * 1.8 + i / 3) % 1, r = 8 + v * 26; ctx.save(); ctx.globalAlpha = 1 - v * .8; ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, 6.283); ctx.strokeStyle = P[3]; ctx.lineWidth = 8; ctx.stroke(); ctx.strokeStyle = P[0]; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); }
  tpLayers([[s.x, s.y, 11]], [P[3], P[1], P[0], P[0], P[0]]);
  for(let i = 0; i < 4; i++){ const th = t * 5 + i * 1.57; ctx.fillStyle = i % 2 ? P[3] : P[2]; ctx.fillRect(s.x + Math.cos(th) * 20 - 2, s.y + Math.sin(th) * 20 - 2, 4, 4); }
  ctx.restore();
}
function fvNocheHit(e, a){
  const T = e.T, b = T ? bodyOf(T) : {hw:30, top:e.y - 50, foot:e.y + 20}, cx = T ? T.x : e.x, cy = (b.top + b.foot) / 2, k = e.k || 1, P = FV.sini; if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'normal', k); }
  for(let r = 0; r < 3; r++){ const v = clamp01((a - r * .1) / .55); if(v > 0 && v < 1){ const o = 1 - Math.pow(1 - v, 2), rr = (16 + 70 * o) * k; ctx.save(); ctx.globalAlpha = 1 - v; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.283); ctx.strokeStyle = P[3]; ctx.lineWidth = 11 - 4 * v; ctx.stroke(); ctx.strokeStyle = P[0]; ctx.lineWidth = 7 - 3 * v; ctx.stroke(); ctx.restore(); } }
  const al = (a < .1 ? a / .1 : 1) * (1 - clamp01((a - .5) / .3));
  if(al > 0) for(let i = 0; i < 9; i++){ const x = cx + ((i / 8) - .5) * b.hw * 2.2, L = (b.foot - b.top) * (.5 + HH(i, Math.floor(a * 12)) * .5) * (.5 + a), by = b.foot - 2 - (i % 3) * 4;
    tpTongue(x, by, L, 9, -Math.PI / 2 + (HH(i, 3) - .5) * .5, P[1], P[3], al); tpTongue(x, by, L * .65, 5, -Math.PI / 2 + (HH(i, 3) - .5) * .5, P[0], null, al); }
  fvEmbers(cx, cy, a, 12, 70, .7, -30, [P[3], P[2], P[4]], 4);
}

// ====================== FOCO RESPLANDOR (acero) ======================
function fvFocoFlight(s, a, an){
  ctx.save(); const t = g.t, P = FV.acero, ca = Math.cos(an), sa = Math.sin(an), px = -sa, py = ca;
  for(let i = 0; i < 3; i++){ const o = (i - 1) * 7, d = 40 + HH(i, Math.floor(t * 16)) * 26; ctx.strokeStyle = P[0]; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(s.x - ca * 10 + px * o, s.y - sa * 10 + py * o); ctx.lineTo(s.x - ca * (10 + d) + px * o, s.y - sa * (10 + d) + py * o); ctx.stroke(); ctx.strokeStyle = P[4]; ctx.lineWidth = 2; ctx.stroke(); }
  fvStar(s.x, s.y, 24, 8, t * 3, P); tpLayers([[s.x, s.y, 10]], P);
  ctx.restore();
}
function fvFocoHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 6, P = FV.acero; if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'normal', k); fx.shake = Math.max(fx.shake, 6); }
  const u = 1 - Math.pow(1 - clamp01(a / .14), 3), life = a < .3 ? 1 : Math.max(0, 1 - (a - .3) / .3);
  if(life > 0){ tpLayers([[x, y, 24 * u * life * k]], P);
    ctx.save(); ctx.globalAlpha = life; ctx.lineCap = 'round'; for(let i = 0; i < 4; i++){ const an = i * .785 + .3, L = 66 * u * k; ctx.strokeStyle = P[0]; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x - Math.cos(an) * L, y - Math.sin(an) * L); ctx.lineTo(x + Math.cos(an) * L, y + Math.sin(an) * L); ctx.stroke(); ctx.strokeStyle = P[4]; ctx.lineWidth = 3; ctx.stroke(); } ctx.restore(); }
  const v = clamp01(a / .5); if(v < 1) fvRing(x, y, (18 + 60 * (1 - Math.pow(1 - v, 2))) * k, 1 - v, P, 4);
  for(let i = 0; i < 9; i++){ const t = a - .08 - HH(i, 90) * .15; if(t < 0 || t > .6) continue; const an = HH(i, 91) * 6.283, d = 20 + 64 * t; fvSpark(x + Math.cos(an) * d, y + Math.sin(an) * d * .85, 5, i % 2 ? P[4] : P[3], P[0], 1 - t / .6); }
}

// ====================== FUERZA LUNAR (hada) ======================
function fvMoon(x, y, R, rot, pal, A){                     // luna creciente (abierta hacia la derecha antes de girar)
  ctx.save(); ctx.globalAlpha = A == null ? 1 : A; ctx.translate(x, y); ctx.rotate(rot || 0);
  const path = k => { ctx.beginPath(); ctx.arc(0, 0, R * k, .9, 2 * Math.PI - .9); const c = .45 * R * k, ri = .8 * R * k; ctx.arc(c, 0, ri, -1.36, 1.36, true); ctx.closePath(); };
  path(1); ctx.fillStyle = pal[0]; ctx.lineWidth = 6; ctx.strokeStyle = pal[0]; ctx.stroke(); ctx.fill(); path(1); ctx.fillStyle = pal[3]; ctx.fill(); path(.7); ctx.fillStyle = pal[4]; ctx.fill();
  ctx.restore();
}
function fvLunaFlight(s, a, an){
  ctx.save(); const t = g.t, P = FV.hada, r = 13 + Math.sin(t * 10);
  for(let i = 0; i < 3; i++){ const v = (t * 1.6 + i / 3) % 1; ctx.save(); ctx.globalAlpha = 1 - v; ctx.beginPath(); ctx.arc(s.x, s.y, r + 3 + v * 16, 0, 6.283); ctx.strokeStyle = P[0]; ctx.lineWidth = 5; ctx.stroke(); ctx.strokeStyle = P[2]; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore(); }
  tpLayers([[s.x, s.y, r]], P); fvMoon(s.x, s.y, r * .85, an + Math.PI, P);
  for(let i = 0; i < 4; i++){ const th = t * 4 + i * 1.57; fvSpark(s.x + Math.cos(th) * (r + 12), s.y + Math.sin(th) * (r + 12), 5, i % 2 ? P[4] : P[3], P[0]); }
  ctx.restore();
}
function fvLunaHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 6, P = FV.hada; if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'normal', k); fx.shake = Math.max(fx.shake, 5); }
  const u = 1 - Math.pow(1 - clamp01(a / .16), 3), life = a < .38 ? 1 : Math.max(0, 1 - (a - .38) / .3);
  if(life > 0){ fvStar(x, y, 44 * u * life * k, 8, a * 1.2, P); tpLayers([[x, y, 18 * u * life * k]], P);
    const T = e.T, top = T ? bodyOf(T).top : y - 40; fvMoon(x, top - 26 - 8 * u, 24 * u * k, -.5, P, life); }
  for(let r = 0; r < 2; r++){ const v = clamp01((a - r * .09) / .5); if(v > 0 && v < 1){ const o = 1 - Math.pow(1 - v, 2); fvRing(x, y, (20 + (r ? 52 : 78) * o) * k, 1 - v, P, 5 - 2 * v); } }
  for(let i = 0; i < 12; i++){ const t = a - HH(i, 70) * .08; if(t < 0 || t > .8) continue; const bx = x + (HH(i, 71) - .5) * 110 * k, by = y - 70 * k + 120 * t * (.6 + HH(i, 72) * .6); fvSpark(bx, by, 4 + HH(i, 73) * 3, i % 2 ? P[4] : P[3], P[0], 1 - t / .8); }
}
