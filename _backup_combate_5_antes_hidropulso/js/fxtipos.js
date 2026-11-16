"use strict";
/* =====================================================================
   FUEGO · AGUA · PLANTA · HIELO al estilo de los juegos (fxtipos.js). Se carga ANTES de fxhd4.js, que los engancha en HERO4.
   Mismo estilo que Llamarada y los eléctricos: formas PLANAS, contorno oscuro y 4 capas de color (oscuro, medio, claro, centro),
   sin luz difusa. Las corrientes (Lanzallamas, Hidrobomba, Rayo Solar...) son una cadena de «bultos» que se funden en una sola forma.
     Fuego ... Ascuas, Lanzallamas, Envite Ígneo, Puño Fuego, Colmillo Ígneo
     Agua .... Pistola Agua, Hidropulso, Hidrobomba, Acua Cola
     Planta .. Látigo Cepa, Rayo Solar
     Hielo ... Nieve Polvo, Ventisca, Puño Hielo, Colmillo Hielo
   TP_SZ = tamaño de los impactos (1 = grande). TP_W = grosor de las corrientes.
   ===================================================================== */
const TP = {
  fuego:['#4a0c00', '#e8380d', '#ff9a1f', '#ffe04a', '#fff8d6'],
  agua: ['#08245e', '#1f6fe0', '#52b8ff', '#c4ecff', '#ffffff'],
  hielo:['#0e3560', '#3f9ee0', '#94dcff', '#dff7ff', '#ffffff'],
  planta:['#0d3a14', '#2d9a38', '#66cf48', '#bdf47c', '#f6ffd6']
};
let TP_SZ = .7, TP_W = .65;
const tpScaleAt = (fn, S) => (e, a) => { ctx.save(); ctx.translate(e.x, e.y); ctx.scale(S, S); ctx.translate(-e.x, -e.y); try{ fn(e, a); }finally{ ctx.restore(); } };

// Bultos [x, y, r] → una forma plana: primero todos los contornos, luego las 4 capas de color
function tpLayers(list, pal, A){
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = A == null ? 1 : A;
  ctx.fillStyle = pal[0]; list.forEach(b => { ctx.beginPath(); ctx.arc(b[0], b[1], b[2] + 3, 0, 6.283); ctx.fill(); });
  [[1, pal[1]], [.8, pal[2]], [.58, pal[3]], [.32, pal[4]]].forEach(([k, col]) => { ctx.fillStyle = col; list.forEach(b => { ctx.beginPath(); ctx.arc(b[0], b[1] + (1 - k) * b[2] * .12, b[2] * k, 0, 6.283); ctx.fill(); }); });
  ctx.restore();
}
// Lengua de llama / gota apuntando a 'ang'
function tpTongue(x, y, len, w, ang, col, edge, A){
  ctx.save(); ctx.globalAlpha = A == null ? 1 : A; ctx.translate(x, y); ctx.rotate(ang);
  ctx.beginPath(); ctx.moveTo(len, 0); ctx.quadraticCurveTo(len * .35, -w, -w * .4, -w * .5); ctx.arc(-w * .4, 0, w * .5, -Math.PI / 2, Math.PI / 2, true); ctx.quadraticCurveTo(len * .35, w, len, 0); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); if(edge){ ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.stroke(); } ctx.restore();
}
// Cristal de hielo / pico de roca (dos caras)
function tpShard(x, y, w, h, tilt, pal, A){
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.globalAlpha = A;
  ctx.fillStyle = pal[1]; ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(w * .06, -h); ctx.lineTo(w / 2, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = pal[3]; ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(w * .06, -h); ctx.lineTo(-w * .1, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = pal[0]; ctx.lineWidth = 2; ctx.lineJoin = 'miter'; ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(w * .06, -h); ctx.lineTo(w / 2, 0); ctx.closePath(); ctx.stroke(); ctx.restore();
}
// Copo de nieve de 6 brazos con contorno
function tpFlake(x, y, r, rot, A){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = A; ctx.lineCap = 'round';
  for(const [col, w] of [[TP.hielo[0], 5], [TP.hielo[4], 2.4]]){ ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); for(let i = 0; i < 3; i++){ const a = i * Math.PI / 3; ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); ctx.lineTo(-Math.cos(a) * r, -Math.sin(a) * r); } ctx.stroke(); }
  ctx.restore();
}
function tpEllipse(x, y, rx, ry, A, w, pal){ ctx.save(); ctx.globalAlpha = A; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 6.283); ctx.strokeStyle = pal[0]; ctx.lineWidth = w + 5; ctx.stroke(); ctx.strokeStyle = pal[3]; ctx.lineWidth = w; ctx.stroke(); ctx.restore(); }
function tpDrops(x, y, a, n, spd, life, g0, pal, sz){
  ctx.save(); for(let i = 0; i < n; i++){ const t = a - HH(i, 41) * .06; if(t < 0 || t > life) continue; const an = -Math.PI * (.12 + .76 * HH(i, 42)), v = spd * (.5 + HH(i, 43)), r = (sz || 3.5) * (.7 + HH(i, 44) * .7);
    ctx.globalAlpha = 1 - t / life; const px = x + Math.cos(an) * v * t, py = y + Math.sin(an) * v * t + g0 * t * t; ctx.fillStyle = pal[0]; ctx.beginPath(); ctx.arc(px, py, r + 1.5, 0, 6.283); ctx.fill(); ctx.fillStyle = pal[3]; ctx.beginPath(); ctx.arc(px, py, r, 0, 6.283); ctx.fill(); }
  ctx.restore();
}

// Corriente de bultos del atacante al rival. o: {L, r0, r1, step, wob, sp, fps, deco(G, blobs, k, A)}
function tpStream(e, pal, o){
  const G = sg(e, o.L || 300); if(G.len < 6) return; const t = g.t, k = Math.floor(t * (o.fps || 16)), A = G.al, N = Math.max(3, Math.ceil(G.len / (o.step || 12))), blobs = [];
  for(let i = 0; i <= N; i++){ const u = i / N, side = Math.sin(t * (o.sp || 14) + i * .8) * (o.wob || 5) * (.3 + u), r = (o.r0 + (o.r1 - o.r0) * Math.pow(u, .8)) * TP_W + (HH(i, k) - .5) * (o.j || 4);
    blobs.push([G.x0 + (G.x1 - G.x0) * u + G.px * side, G.y0 + (G.y1 - G.y0) * u + G.py * side, Math.max(2, r)]); }
  tpLayers(blobs, pal, A); if(o.deco) o.deco(G, blobs, k, A, t);
}

// ================================ FUEGO ================================
function tpFireBall(x, y, r, an, A, tail){
  const t = g.t, k = Math.floor(t * 14), ca = Math.cos(an), sa = Math.sin(an), list = [];
  for(let i = 1; i <= (tail || 5); i++){ const d = i * r * .7; list.unshift([x - ca * d + (HH(i, k) - .5) * r * .4, y - sa * d + (HH(i, k + 3) - .5) * r * .4, Math.max(2.5, r * (1 - i * .15))]); }
  list.push([x, y, r]); tpLayers(list, TP.fuego, A);
  for(let i = 0; i < 4; i++) tpTongue(x - ca * r * .6 + (-sa) * (i - 1.5) * r * .3, y - sa * r * .6 + ca * (i - 1.5) * r * .3, r * (1.6 + HH(i, k) * 1.2), r * .38, an + Math.PI + (HH(i, k + 5) - .5) * .7, TP.fuego[2], TP.fuego[0], A);
}
function tpAscuasFlight(s, a, an){ ctx.save(); tpFireBall(s.x, s.y, 6, an, 1, 3); ctx.restore(); }
function tpFireHit(e, a, R, nt){      // estallido de fuego: bola + lenguas hacia arriba y a los lados + chispas
  const k = e.k || 1, x = e.x, y = e.y - 6, kk = Math.floor(a * 14); if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'fuego', k); }
  const u = clamp01(a / .5), life = a < .4 ? 1 : Math.max(0, 1 - (a - .4) / .25);
  if(life > 0){ const list = [[x, y, R * (.5 + .5 * Math.sin(Math.min(1, a / .2) * 1.57)) * life]];
    for(let i = 0; i < nt; i++){ const an = (i / nt) * 6.283, d = R * .8 * Math.min(1, a / .18); list.push([x + Math.cos(an) * d, y + Math.sin(an) * d * .7, R * .42 * life]); }
    tpLayers(list, TP.fuego);
    for(let i = 0; i < nt; i++){ const an = (i / nt) * 6.283 + HH(kk, i) * .3, d = R * .8 * Math.min(1, a / .18); tpTongue(x + Math.cos(an) * d, y + Math.sin(an) * d * .7, R * (.7 + HH(i, kk) * .5) * life, R * .24, -Math.PI / 2 + (Math.cos(an)) * .9, TP.fuego[2], TP.fuego[0]); } }
  ctx.save(); for(let i = 0; i < 12; i++){ const t = a - HH(i, 20) * .05; if(t < 0 || t > .7) continue; const an = HH(i, 21) * 6.283, v = 60 + HH(i, 22) * 110; ctx.globalAlpha = 1 - t / .7; ctx.fillStyle = i % 3 ? TP.fuego[3] : TP.fuego[2]; const sz = 3 + HH(i, 23) * 3; ctx.fillRect(x + Math.cos(an) * v * t - sz / 2, y + Math.sin(an) * v * t * .8 - 30 * t - sz / 2, sz, sz); } ctx.restore();
}
function tpAscuasHit(e, a){ tpFireHit(e, a, 17, 5); }
function tpEnviteFlight(s, a, an){
  ctx.save(); const r = 17, t = g.t; tpFireBall(s.x, s.y, r, an, 1, 7);
  for(let i = 0; i < 6; i++){ const u = (t * 2.4 + i * .17) % 1, d = 20 + u * 70; ctx.globalAlpha = 1 - u; ctx.fillStyle = i % 2 ? TP.fuego[3] : TP.fuego[2]; ctx.fillRect(s.x - Math.cos(an) * d + (HH(i, 9) - .5) * 30 - 2.5, s.y - Math.sin(an) * d + (HH(i, 10) - .5) * 30 - 2.5, 5, 5); }
  ctx.restore();
}
function tpEnviteHit(e, a){ tpFireHit(e, a, 40, 9); }
function tpLanzallamas(e){
  tpStream(e, TP.fuego, {L:300, r0:10, r1:25, step:7, wob:8, sp:16, j:4, deco(G, bl, k, A){
    bl.forEach((b, i) => { if(i % 3 === 1) tpTongue(b[0], b[1] - b[2] * .5, b[2] * (1.2 + HH(i, k)), b[2] * .35, -Math.PI / 2 + (HH(i, k + 4) - .5) * 1.4, TP.fuego[1], TP.fuego[0], A); });
    ctx.save(); ctx.globalAlpha = A; for(let i = 0; i < 6; i++){ const u = hdFract(i * .31 + g.t * 2.4), b = bl[Math.min(bl.length - 1, Math.floor(u * bl.length))]; ctx.fillStyle = i % 2 ? TP.fuego[3] : TP.fuego[2]; ctx.fillRect(b[0] + (HH(i, k) - .5) * b[2] * 2 - 2, b[1] - u * 18 - 2, 4, 4); } ctx.restore(); }});
}
function tpLanzaHit(e, a){ tpFireHit(e, a, 24, 6); }

// ================================ AGUA ================================
function tpSplash(e, a, R){
  const k = e.k || 1, x = e.x, y = e.y - 2; if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'agua', k); }
  for(let r = 0; r < 2; r++){ const v = clamp01((a - r * .1) / .55); if(v > 0 && v < 1){ const o = 1 - Math.pow(1 - v, 2); tpEllipse(x, y + 12, (10 + R * 1.7 * o) * k, (4 + R * .6 * o) * k, 1 - v, 4, TP.agua); } }
  if(a < .6){                                                   // columna de agua que sube y cae, con espuma en la base
    const u = clamp01(a / .6), h = Math.pow(Math.sin(u * Math.PI), .8) * R * 1.8 * k, list = [];
    for(let i = 0; i < 6; i++){ const f = i / 5; list.push([x + Math.sin(a * 20 + i) * 2, y + 8 - h * f, Math.max(3, R * (.46 - .3 * f) * k)]); }
    tpLayers(list, TP.agua, 1 - Math.max(0, u - .7) / .3);
    const foam = []; for(let i = 0; i < 7; i++){ const an = (i / 7) * 6.283, d = R * (.3 + .9 * (1 - Math.pow(1 - u, 2))) * k; foam.push([x + Math.cos(an) * d * 1.1, y + 10 + Math.sin(an) * d * .38, R * .2 * k * (1 - u * .5)]); }
    tpLayers(foam, ['#08245e', '#ffffff', '#ffffff', '#e8f8ff', '#ffffff'], 1 - Math.max(0, u - .7) / .3);
  }
  tpDrops(x, y, a, 16, 190 * k, .7, 420, TP.agua, 5);
}
function tpPistolaStream(e){ tpStream(e, TP.agua, {L:300, r0:4.5, r1:8, step:4, wob:2.5, sp:20, j:1.5, fps:18}); }
function tpPistolaHit(e, a){ tpSplash(e, a, 18); }
function tpHidropulsoFlight(s, a, an){
  ctx.save(); const t = g.t, r = 11 + Math.sin(t * 14) * 1; tpLayers([[s.x, s.y, r]], TP.agua);
  for(let i = 0; i < 3; i++){ const v = (t * 2.2 + i / 3) % 1; ctx.save(); ctx.translate(s.x, s.y); ctx.globalAlpha = 1 - v; ctx.beginPath(); ctx.arc(0, 0, r + 3 + v * 18, 0, 6.283); ctx.strokeStyle = TP.agua[0]; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = TP.agua[3]; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
function tpHidropulsoHit(e, a){ tpSplash(e, a, 26); const v = clamp01(a / .5); if(v < 1) tpEllipse(e.x, e.y - 6, 14 + 56 * v, 12 + 42 * v, 1 - v, 3, TP.agua); }
function tpHidrobomba(e){
  tpStream(e, TP.agua, {L:320, r0:9, r1:24, step:10, wob:6, sp:12, j:4, deco(G, bl, k, A){
    const foam = []; bl.forEach((b, i) => { if(i % 2 === 0){ const an = HH(i, k) * 6.283; foam.push([b[0] + Math.cos(an) * b[2] * .9, b[1] + Math.sin(an) * b[2] * .9, 3 + HH(i, k + 2) * 3]); } });
    tpLayers(foam, ['#08245e', '#ffffff', '#ffffff', '#e8f8ff', '#ffffff'], A); }});
}
function tpHidroHit(e, a){ tpSplash(e, a, 40); }

// ================================ PLANTA ================================
function tpLeaf(x, y, L, rot, A, big){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = A; const w = L * .42;
  ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.quadraticCurveTo(0, -w, L / 2, 0); ctx.quadraticCurveTo(0, w, -L / 2, 0); ctx.closePath(); ctx.fillStyle = TP.planta[2]; ctx.fill(); ctx.strokeStyle = TP.planta[0]; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = TP.planta[3]; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-L / 2 + 2, 0); ctx.lineTo(L / 2 - 3, 0); ctx.stroke(); ctx.restore();
}
function tpStar(x, y, R, n, rot, A, pal){
  if(R < 2) return; ctx.save(); ctx.globalAlpha = A; ctx.lineJoin = 'miter';
  const shape = (r, fill, edge) => { ctx.beginPath(); for(let i = 0; i < n * 2; i++){ const an = rot + i * Math.PI / n, rr = i % 2 ? r * .45 : r * (i % 4 ? .78 : 1); ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(an) * rr, y + Math.sin(an) * rr * .9); } ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if(edge){ ctx.strokeStyle = edge; ctx.lineWidth = 3; ctx.stroke(); } };
  shape(R, pal[2], pal[0]); shape(R * .6, pal[3], null); shape(R * .3, '#ffffff', null); ctx.restore();
}
function tpMeleeBurstGrass(e, a, t0){
  if(a < t0) return; const b = a - t0, x = e.x, y = e.y, u = clamp01(b / .5);
  tpStar(x, y, 46 * (1 - clamp01((b - .06) / .2)), 9, b * 2, b < .26 ? 1 : 0, TP.planta);
  for(let i = 0; i < 10; i++){ const an = (i / 10) * 6.283 + HH(i, 5) * .4, d = 14 + 78 * (1 - Math.pow(1 - u, 2)) * (.7 + HH(i, 6) * .6); tpLeaf(x + Math.cos(an) * d, y + Math.sin(an) * d * .8, 20, an + b * 8, 1 - u * u); }
}
function tpLatigoCepa(e, a){
  const f = e.fol, x0 = f.x, y0 = f.y - 6, tx = e.x, ty = e.y, L = Math.hypot(tx - x0, ty - y0) || 1, nx = -(ty - y0) / L, ny = (tx - x0) / L;
  const ext = clamp01(a / .14) * (1 - clamp01((a - .46) / .16)), A = 1 - clamp01((a - .56) / .1);
  [1, -.45].forEach((sd, vi) => {
    const e2 = clamp01((a - vi * .05) / .14) * (1 - clamp01((a - .46 - vi * .03) / .16)); if(e2 <= 0) return;
    const bend = Math.max(16, Math.min(46, L * .42)), cx = (x0 + tx) / 2 + nx * sd * bend, cy = (y0 + ty) / 2 + ny * sd * bend, ex = tx + nx * sd * 8, ey = ty + ny * sd * 8, pts = [];
    const crack = a > .14 && a < .46 ? Math.sin((a - .14) * 40) * 7 : 0;                          // el latigazo vibra al llegar
    for(let i = 0; i <= 18; i++){ const u = i / 18 * e2, bx = (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * cx + u * u * ex, by = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * cy + u * u * ey; pts.push([bx + nx * crack * sd * Math.sin(u * Math.PI), by + ny * crack * sd * Math.sin(u * Math.PI)]); }
    ctx.save(); ctx.globalAlpha = A; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for(const [col, w] of [[TP.planta[0], 15], [TP.planta[1], 10], [TP.planta[2], 6], [TP.planta[3], 2.6]]){ ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
    for(const j of [4, 9, 13]){ if(j < pts.length) tpLeaf(pts[j][0], pts[j][1] - 3, 13, (j % 2 ? 1 : -1) * .9 + sd * .3, A); }
    ctx.restore(); });
  tpMeleeBurstGrass(e, a, .13);
}
// Rayo Solar: 1) la luz del sol baja del cielo y se junta en el Pokémon (0,45 s), 2) sale un rayo ancho dorado con centro blanco
const TP_SOL = ['#9a6a00', '#ffc81a', '#fff27a', '#ffffff'];
function tpSpark4(x, y, r, A){ ctx.save(); ctx.globalAlpha = A; ctx.beginPath(); for(let i = 0; i < 8; i++){ const a = i * Math.PI / 4, rr = i % 2 ? r * .3 : r; ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = TP_SOL[0]; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore(); }
function tpSolOrb(x, y, r, A){ ctx.save(); ctx.globalAlpha = A; [[r + 3, TP_SOL[0]], [r, TP_SOL[1]], [r * .66, TP_SOL[2]], [r * .34, TP_SOL[3]]].forEach(([rr, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.283); ctx.fill(); }); ctx.restore(); }
function tpSolarCharge(x, y, u, A){
  const t = g.t, ease = 1 - Math.pow(1 - u, 2); ctx.save(); ctx.globalCompositeOperation = 'source-over';
  for(let i = 0; i < 4; i++){ const sx = x + (i - 1.5) * 70, w0 = 15 - u * 6; ctx.globalAlpha = A * (.2 + .25 * u); ctx.fillStyle = '#fff6a8'; ctx.beginPath(); ctx.moveTo(sx - w0, -10); ctx.lineTo(sx + w0, -10); ctx.lineTo(x + 7, y); ctx.lineTo(x - 7, y); ctx.closePath(); ctx.fill(); }   // rayos de luz del cielo
  for(let i = 0; i < 12; i++){ const th = i * .5236 + u * 4, rad = (110 * (1 - ease)) * (.55 + .45 * HH(i, 1)) + 6; tpSolOrb(x + Math.cos(th) * rad, y + Math.sin(th) * rad * .8 - 6, 4.5, A * Math.min(1, u * 4)); }   // motas de luz que entran
  tpSolOrb(x, y - 4, 7 + 20 * ease, A);
  for(let i = 0; i < 8; i++){ const an = i * .785 + t * 3, r0 = 12 + 20 * ease; ctx.globalAlpha = A * ease; ctx.strokeStyle = TP_SOL[0]; ctx.lineWidth = 6; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r0, y - 4 + Math.sin(an) * r0); ctx.lineTo(x + Math.cos(an) * (r0 + 14), y - 4 + Math.sin(an) * (r0 + 14)); ctx.stroke(); ctx.strokeStyle = TP_SOL[2]; ctx.lineWidth = 2.6; ctx.stroke(); }
  ctx.restore();
}
function tpRayoSolar(e){
  const CH = .45, t = e.t || 0, G = sg(e, 400), A = G.al;
  if(t < CH){ tpSolarCharge(e.ox, e.oy, t / CH, 1); return; }
  if(G.len < 8) return; const gw = clamp01((t - CH) / .12), w = (26 + Math.sin(g.t * 18) * 2.5) * gw, dx = Math.cos(G.an), dy = Math.sin(G.an), px = -dy, py = dx, N = 16;
  const half = u => (w / 2) * (u < .14 ? .5 + .5 * u / .14 : 1);
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  const poly = (sc, pad) => { ctx.beginPath(); for(let i = 0; i <= N; i++){ const u = i / N, h = half(u) * sc + pad; ctx[i ? 'lineTo' : 'moveTo'](G.x0 + dx * G.len * u + px * h, G.y0 + dy * G.len * u + py * h); }
    ctx.arc(G.x1, G.y1, half(1) * sc + pad, G.an - Math.PI / 2, G.an + Math.PI / 2); for(let i = N; i >= 0; i--){ const u = i / N, h = half(u) * sc + pad; ctx.lineTo(G.x0 + dx * G.len * u - px * h, G.y0 + dy * G.len * u - py * h); } ctx.closePath(); };
  ctx.globalAlpha = A; [[1, 3, TP_SOL[0]], [1, 0, TP_SOL[1]], [.66, 0, TP_SOL[2]], [.32, 0, TP_SOL[3]]].forEach(([sc, pad, c]) => { ctx.fillStyle = c; poly(sc, pad); ctx.fill(); });
  for(let i = 0; i < 9; i++){ const u = hdFract(i * .113 + g.t * 1.5), off = ((HH(i, 3) - .5)) * w * .9; tpSpark4(G.x0 + dx * G.len * u + px * off, G.y0 + dy * G.len * u + py * off, 4 + HH(i, 4) * 3, A); }     // destellos
  tpSolOrb(G.x0, G.y0, 14 * gw, A);                                                                                                     // la boca del rayo
  ctx.restore();
}
function tpRayoSolarHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 6, u = clamp01(a / .5); ctx.save();
  const R = (22 + 40 * (1 - Math.pow(1 - u, 2))) * k, A = 1 - Math.max(0, (a - .3) / .3);
  if(A > 0){ ctx.globalAlpha = A; ctx.fillStyle = '#7a5a00'; ctx.beginPath(); ctx.arc(x, y, R + 3, 0, 6.283); ctx.fill(); ctx.fillStyle = '#ffc81a'; ctx.beginPath(); ctx.arc(x, y, R, 0, 6.283); ctx.fill(); ctx.fillStyle = '#fff6a8'; ctx.beginPath(); ctx.arc(x, y, R * .62, 0, 6.283); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, R * .3, 0, 6.283); ctx.fill();
    for(let i = 0; i < 12; i++){ const an = i * .5236 + a * 2, L = R * (1.25 + .35 * (i % 2)); ctx.strokeStyle = '#7a5a00'; ctx.lineWidth = 7; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * R * .95, y + Math.sin(an) * R * .95); ctx.lineTo(x + Math.cos(an) * L, y + Math.sin(an) * L); ctx.stroke(); ctx.strokeStyle = '#fff27a'; ctx.lineWidth = 3.4; ctx.stroke(); } }
  for(let i = 0; i < 8; i++){ const t = a - HH(i, 50) * .05; if(t < 0 || t > .7) continue; const an = HH(i, 51) * 6.283, d = (20 + 80 * t) * k; tpLeaf(x + Math.cos(an) * d, y + Math.sin(an) * d * .8, 13, an + t * 9, 1 - t / .7); }
  ctx.restore();
}

// ================================ HIELO ================================
function tpIceBurst(e, a, R, n){
  const k = e.k || 1, x = e.x, y = e.y + 6; if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'hielo', k); }
  const up = 1 - Math.pow(1 - clamp01(a / .16), 3), down = clamp01((a - .6) / .3), A = 1 - down * .7;
  for(let i = 0; i < n; i++){ const an = (i / n) * 6.283 + HH(i, 3) * .3, rad = i === 0 ? 0 : (14 + HH(i, 4) * 22) * R / 30, px = x + Math.cos(an) * rad * 1.2, py = y + Math.sin(an) * rad * .45, h = (i === 0 ? R * 1.5 : R * (.7 + HH(i, 6) * .6)) * up * (1 - down * down);
    if(h > 1) tpShard(px, py, 9 + HH(i, 8) * 6 + (i === 0 ? 5 : 0), h, (HH(i, 9) - .5) * .5, TP.hielo, A); }
  for(let i = 0; i < 6; i++){ const t = a - HH(i, 60) * .05; if(t < 0 || t > .8) continue; const an = -Math.PI * (.1 + .8 * HH(i, 61)), v = 50 + HH(i, 62) * 90; tpFlake(x + Math.cos(an) * v * t, y - 14 + Math.sin(an) * v * t + 70 * t * t, 5 + HH(i, 63) * 3, t * 5 + i, 1 - t / .8); }
  const v = clamp01(a / .5); if(v < 1) tpEllipse(x, y + 4, (10 + R * 1.5 * (1 - Math.pow(1 - v, 2))), (4 + R * .5 * (1 - Math.pow(1 - v, 2))), 1 - v, 3, TP.hielo);
}
function tpNieveStream(e){
  tpStream(e, TP.hielo, {L:300, r0:6, r1:20, step:12, wob:7, sp:10, j:5, deco(G, bl, k, A, t){
    for(let i = 0; i < 7; i++){ const u = hdFract(i * .17 + t * 1.3), b = bl[Math.min(bl.length - 1, Math.floor(u * bl.length))]; tpFlake(b[0] + (HH(i, k) - .5) * b[2] * 2, b[1] + (HH(i, k + 3) - .5) * b[2] * 2, 5 + HH(i, 7) * 3, t * 4 + i, A); } }});
}
function tpRayoHieloHit(e, a){ tpIceBurst(e, a, 36, 8); }
function tpNieveHit(e, a){ tpIceBurst(e, a, 22, 5); }
function tpVentiscaFlight(s, a, an){
  ctx.save(); const t = g.t, k = Math.floor(t * 12), list = [[s.x, s.y, 20]]; for(let i = 0; i < 8; i++){ const th = t * 7 + i * .785, rr = 22 + HH(i, k) * 6; list.push([s.x + Math.cos(th) * rr, s.y + Math.sin(th) * rr * .8, 9 + HH(i, 5) * 4]); }
  for(let i = 1; i <= 4; i++) list.unshift([s.x - Math.cos(an) * i * 14, s.y - Math.sin(an) * i * 14 + (HH(i, k) - .5) * 8, 14 - i * 2]);
  tpLayers(list, TP.hielo);
  for(let i = 0; i < 6; i++){ const th = -t * 5 + i * 1.05, rr = 34 + (i % 2) * 8; tpFlake(s.x + Math.cos(th) * rr, s.y + Math.sin(th) * rr * .8, 6, t * 3 + i, 1); }
  ctx.restore();
}
function tpVentiscaHit(e, a){ tpIceBurst(e, a, 48, 9); }

// ================================ GOLPES CUERPO A CUERPO ================================
let TP_MS = .95;                                                     // tamaño del estallido de los golpes
function tpMeleeBurst(e, a, t0, type){
  if(a < t0) return; const b = a - t0, x = e.x, y = e.y; ctx.save(); ctx.translate(x, y); ctx.scale(TP_MS, TP_MS); ctx.translate(-x, -y);
  tpStar(x, y - 4, 46 * (1 - clamp01((b - .06) / .22)), 9, b * 2.5, b < .28 ? 1 : 0, TP[type]);
  if(type === 'fuego') tpFireHit({x, y: y + 6, k:1, hdDec:1}, b, 32, 7);
  else if(type === 'agua') tpSplash({x, y: y + 4, k:1, hdDec:1}, b, 26);
  else tpIceBurst({x, y: y - 6, k:1, hdDec:1}, b, 34, 7);
  ctx.restore();
}
// Adorno que rodea al puño: llamas detrás / cristales alrededor
function tpFistAura(type, q, ang, al){
  const k = Math.floor(g.t * 14), ca = Math.cos(ang), sa = Math.sin(ang);
  if(type === 'fuego'){ const list = []; for(let i = 1; i <= 5; i++) list.push([q.x - ca * i * 11 + (HH(i, k) - .5) * 6, q.y - sa * i * 11 + (HH(i, k + 2) - .5) * 6, Math.max(3, 13 - i * 1.8)]); tpLayers(list.reverse(), TP.fuego, al);
    for(let i = 0; i < 4; i++) tpTongue(q.x - ca * 8 + (-sa) * (i - 1.5) * 8, q.y - sa * 8 + ca * (i - 1.5) * 8, 20 + HH(i, k) * 12, 6, ang + Math.PI + (HH(i, k + 3) - .5) * .8, TP.fuego[2], TP.fuego[0], al); }
  else for(let i = 0; i < 5; i++){ const an = ang + Math.PI / 2 + (i - 2) * .55 + (i > 2 ? Math.PI : 0) * 0, off = 14; tpShard(q.x + Math.cos(ang + (i - 2) * .6) * off, q.y + Math.sin(ang + (i - 2) * .6) * off, 8, 16 + (i % 2) * 6, ang + (i - 2) * .6 + Math.PI / 2, TP.hielo, al); }
}
function tpPuno(type){ return (e, a) => { const q = punchPos(e, a), al = fade(a, .38, .14); if(al > 0){ tpFistAura(type, q, e.ang, al); fist(q.x, q.y, e.ang, FXP[type], al, 1.5); } tpMeleeBurst(e, a, .12, type); }; }
function tpColmillo(name, type){ return (e, a) => {
  ctx.save(); ctx.translate(e.x, e.y); ctx.scale(1.6, 1.6); ctx.translate(-e.x, -e.y); jaws(e, a, Object.assign({}, JAW[name], {extra:null})); ctx.restore();
  const al = fade(a, .3, .12); if(al > 0){ const k = Math.floor(g.t * 14); for(let i = 0; i < 6; i++){ const bx = e.x + (i - 2.5) * 22, sd = i % 2 ? 1 : -1, by = e.y + sd * 30 * (1 - clamp01(a / .17)) * 1.6 + sd * 6;
      if(type === 'fuego') tpTongue(bx, by - sd * 4, 16 + HH(i, k) * 12, 6, -Math.PI / 2 * sd, TP.fuego[2], TP.fuego[0], al); else tpShard(bx, by, 8, 14 + HH(i, 3) * 8, sd < 0 ? 0 : Math.PI, TP.hielo, al); } }
  tpMeleeBurst(e, a, .17, type); }; }
function tpAcuaCola(e, a){
  const an = e.ang, x = e.x - Math.cos(an) * 6, y = e.y - Math.sin(an) * 6, sw = clamp01(a / .2), A = a < .34 ? 1 : Math.max(0, 1 - (a - .34) / .16);
  if(A > 0){ ctx.save(); ctx.globalAlpha = A; ctx.lineCap = 'round'; const a0 = an - 1.5, a1 = a0 + 3 * sw;
    for(const [col, w] of [[TP.agua[0], 26], [TP.agua[1], 19], [TP.agua[2], 12], [TP.agua[3], 5]]){ ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(x, y, 58, a0, a1); ctx.stroke(); }
    for(let i = 0; i < 6; i++){ const aa = a0 + (a1 - a0) * (i / 5); tpLayers([[x + Math.cos(aa) * 72, y + Math.sin(aa) * 72, 5]], ['#08245e', '#ffffff', '#ffffff', '#e8f8ff', '#ffffff'], A); } ctx.restore(); }
  tpMeleeBurst(e, a, .13, 'agua');
}
// Que el golpe dure lo bastante para verse entero
['Puño Fuego', 'Colmillo Ígneo', 'Puño Hielo', 'Colmillo Hielo', 'Acua Cola'].forEach(n => { if(FXC[n]) FXC[n] = Object.assign({}, FXC[n], {dur:.8}); });
FXC['Látigo Cepa'] = Object.assign({}, FXC['Látigo Cepa'], {dur:.75});

// Reducir los impactos al tamaño pedido (TP_SZ)
tpAscuasHit = tpScaleAt(tpAscuasHit, TP_SZ); tpEnviteHit = tpScaleAt(tpEnviteHit, TP_SZ); tpLanzaHit = tpScaleAt(tpLanzaHit, TP_SZ);
tpPistolaHit = tpScaleAt(tpPistolaHit, TP_SZ); tpHidropulsoHit = tpScaleAt(tpHidropulsoHit, TP_SZ); tpHidroHit = tpScaleAt(tpHidroHit, TP_SZ);
tpRayoSolarHit = tpScaleAt(tpRayoSolarHit, TP_SZ); tpNieveHit = tpScaleAt(tpNieveHit, TP_SZ); tpRayoHieloHit = tpScaleAt(tpRayoHieloHit, TP_SZ); tpVentiscaHit = tpScaleAt(tpVentiscaHit, TP_SZ);

// Rayo Hielo: rayo ancho azul claro con centro blanco, cristales que salen de los bordes y copos; en la boca, un racimo de cristales
function tpRayoHielo(e){
  const G = sg(e, 380); if(G.len < 8) return; const A = G.al, t = g.t, k = Math.floor(t * 14), w = 46 + Math.sin(t * 16) * 3, dx = Math.cos(G.an), dy = Math.sin(G.an), px = -dy, py = dx, N = 16;
  const half = u => (w / 2) * (u < .12 ? .45 + .55 * u / .12 : 1);
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  const poly = (sc, pad) => { ctx.beginPath(); for(let i = 0; i <= N; i++){ const u = i / N, h = half(u) * sc + pad; ctx[i ? 'lineTo' : 'moveTo'](G.x0 + dx * G.len * u + px * h, G.y0 + dy * G.len * u + py * h); }
    ctx.arc(G.x1, G.y1, half(1) * sc + pad, G.an - Math.PI / 2, G.an + Math.PI / 2); for(let i = N; i >= 0; i--){ const u = i / N, h = half(u) * sc + pad; ctx.lineTo(G.x0 + dx * G.len * u - px * h, G.y0 + dy * G.len * u - py * h); } ctx.closePath(); };
  ctx.globalAlpha = A; [[1, 3, TP.hielo[0]], [1, 0, TP.hielo[1]], [.7, 0, TP.hielo[2]], [.42, 0, TP.hielo[3]], [.18, 0, '#ffffff']].forEach(([sc, pad, c]) => { ctx.fillStyle = c; poly(sc, pad); ctx.fill(); });
  const nC = Math.max(3, Math.round(G.len / 30));                                              // cristales que salen de los lados
  for(let i = 0; i < nC; i++){ const u = (i + .5) / nC, sd = i % 2 ? 1 : -1, off = half(u) - 1, bx = G.x0 + dx * G.len * u + px * off * sd, by = G.y0 + dy * G.len * u + py * off * sd, hh = 20 + HH(i, k >> 1) * 14;
    tpShard(bx, by, 14, hh, Math.atan2(py * sd, px * sd) + Math.PI / 2 + (HH(i, 7) - .5) * .5, TP.hielo, A); }
  for(let i = 0; i < 12; i++){ const u = hdFract(i * .09 + t * 1.2), off = (HH(i, 3) - .5) * w * 1.4; tpFlake(G.x0 + dx * G.len * u + px * off, G.y0 + dy * G.len * u + py * off, 7 + HH(i, 5) * 4, t * 3 + i, A); }
  for(let i = 0; i < 4; i++){ const an = G.an + Math.PI + (i - 1.5) * .6; tpShard(G.x0, G.y0, 12, 24, an + Math.PI / 2, TP.hielo, A); }        // racimo en la boca
  for(let i = 0; i < 7; i++){ const u = hdFract(i / 7 + t * .7), ph = u * 12 + t * 6, off = Math.sin(ph) * w * .62; tpShard(G.x0 + dx * G.len * u + px * off, G.y0 + dy * G.len * u + py * off, 8, 15, G.an + Math.PI / 2 + Math.cos(ph) * .8, TP.hielo, A); }
  tpLayers([[G.x0 - dx * 4, G.y0 - dy * 4, 18]], TP.hielo, A);
  ctx.restore();
}

/* ======================= ESTILO HEARTGOLD (Oro HeartGold, 4.ª gen) =======================
   Ascuas · Envite Ígneo · Hidropulso: formas redondas y llamativas, contorno oscuro, sin brillos difusos.
   Ascuas = tres bolitas de fuego que se persiguen · Envite = el Pokémon envuelto en llamas · Hidropulso = esfera con ondas. */
// Bolita de fuego "de dibujo": cuerpo redondo + lengua de llama hacia atrás
function hgFireDrop(x, y, r, an, A, k){
  const ca = Math.cos(an), sa = Math.sin(an);
  for(let i = 0; i < 3; i++) tpTongue(x - ca * r * .7 + (-sa) * (i - 1) * r * .45, y - sa * r * .7 + ca * (i - 1) * r * .45, r * (2 + HH(i, k) * .8), r * .62, an + Math.PI + (i - 1) * .22, i === 1 ? TP.fuego[2] : TP.fuego[1], TP.fuego[0], A);
  tpLayers([[x, y, r]], TP.fuego, A);
}
function hgAscuasFlight(s, a, an){
  ctx.save(); const k = Math.floor(g.t * 14), px = -Math.sin(an), py = Math.cos(an);
  [[0, 0, 10], [-17, 1, 8.5], [-32, -1, 7]].forEach(([d, ph, r], i) => { const o = Math.sin(g.t * 11 + i * 2.1) * 11, x = s.x + Math.cos(an) * d + px * o, y = s.y + Math.sin(an) * d + py * o; hgFireDrop(x, y, r, an, 1, k + i); });
  ctx.restore();
}
function hgAscuasHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 4, kk = Math.floor(a * 12); if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'fuego', k); }
  const life = a < .35 ? 1 : Math.max(0, 1 - (a - .35) / .25);
  if(life > 0){ [[-17, 4, 9], [0, -3, 12], [17, 5, 9]].forEach(([dx, dy, r], i) => { const rr = r * life * (.6 + .4 * Math.min(1, a / .1)), fl = Math.sin(a * 26 + i * 2) * 2;
      tpTongue(x + dx, y + dy + rr * .5, rr * 2.6 + fl, rr * .8, -Math.PI / 2 + (i - 1) * .35, TP.fuego[1], TP.fuego[0]);
      tpTongue(x + dx, y + dy + rr * .5, rr * 1.6 + fl, rr * .5, -Math.PI / 2 + (i - 1) * .35, TP.fuego[3], null);
      tpLayers([[x + dx, y + dy, rr]], TP.fuego); }); }
  ctx.save(); for(let i = 0; i < 9; i++){ const t = a - HH(i, 30) * .04; if(t < 0 || t > .5) continue; const an = -Math.PI * (.1 + .8 * HH(i, 31)), v = 50 + HH(i, 32) * 70; ctx.globalAlpha = 1 - t / .5; ctx.fillStyle = i % 2 ? TP.fuego[3] : TP.fuego[2]; ctx.fillRect(x + Math.cos(an) * v * t - 2, y + Math.sin(an) * v * t - 2, 4, 4); } ctx.restore();
}

/* ======================= SEGÚN LAS DESCRIPCIONES DE DIEGO: Rayo Hielo · Envite Ígneo · Lanzallamas ======================= */
// ---- Rayo Hielo: carga de partículas de hielo en la boca → rayo con núcleo blanco → explosión de cristales + capa de hielo ----
function hgIceCharge(x, y, u){
  const ease = 1 - Math.pow(1 - u, 2); ctx.save(); ctx.globalCompositeOperation = 'source-over';
  for(let i = 0; i < 12; i++){ const th = i * .5236 + u * 5, rad = 64 * (1 - ease) * (.55 + .45 * HH(i, 1)) + 10, px = x + Math.cos(th) * rad, py = y + Math.sin(th) * rad * .85 - 4;
    if(i % 2) tpFlake(px, py, 5, th * 2, Math.min(1, u * 5)); else tpShard(px, py, 6, 10, th + Math.PI / 2 + Math.PI, TP.hielo, Math.min(1, u * 5)); }
  tpLayers([[x, y - 4, 4 + 13 * ease]], TP.hielo); ctx.restore();
}
function hgRayoHielo(e){
  const CH = .3, t = e.t || 0; if(t < CH){ hgIceCharge(e.ox, e.oy, t / CH); return; }
  tpRayoHielo(e); const G = sg(e, 380); if(G.len > 8) tpLayers([[G.x0, G.y0, 12]], TP.hielo, G.al);
}
function hgRayoHieloHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 6, T = e.T; if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'hielo', k); }
  const grow = 1 - Math.pow(1 - clamp01(a / .16), 3), fadeA = 1 - clamp01((a - .6) / .35);
  if(fadeA > 0){ for(let i = 0; i < 16; i++){ const th = (i / 16) * 6.283 + HH(i, 3) * .25, L = (34 + HH(i, 4) * 42 + (i % 2) * 14) * grow * k; tpShard(x + Math.cos(th) * 8, y + Math.sin(th) * 8, 11 + HH(i, 5) * 6, L, th + Math.PI / 2, TP.hielo, fadeA); }
    tpLayers([[x, y, 15 * (1 - clamp01((a - .2) / .25)) * k]], TP.hielo, fadeA); }
  if(T){ const b = bodyOf(T), cx = T.x, top = b.top - 4, foot = b.foot + 3, hw = b.hw * 1.1, sa = (a < .1 ? a / .1 : 1) * (1 - clamp01((a - .7) / .25)) ;   // capa de hielo translúcida sobre el rival
    if(sa > 0){ ctx.save(); ctx.globalAlpha = sa; ctx.beginPath(); ctx.moveTo(cx - hw, foot); ctx.lineTo(cx - hw * 1.05, top + (foot - top) * .35); ctx.lineTo(cx - hw * .5, top + 4); ctx.lineTo(cx, top - 6); ctx.lineTo(cx + hw * .5, top + 4); ctx.lineTo(cx + hw * 1.05, top + (foot - top) * .35); ctx.lineTo(cx + hw, foot); ctx.closePath();
      ctx.fillStyle = 'rgba(150,215,255,.58)'; ctx.fill(); ctx.strokeStyle = TP.hielo[0]; ctx.lineWidth = 4; ctx.stroke(); ctx.strokeStyle = TP.hielo[3]; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - hw * .7, top + (foot - top) * .3); ctx.lineTo(cx - hw * .35, top + 12); ctx.moveTo(cx - hw * .75, top + (foot - top) * .5); ctx.lineTo(cx - hw * .6, top + (foot - top) * .42); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(cx + hw * .2, top + 6); ctx.lineTo(cx + hw * .7, top + (foot - top) * .35); ctx.lineTo(cx + hw * .35, top + (foot - top) * .6); ctx.closePath(); ctx.fill(); ctx.restore(); } }
  for(let i = 0; i < 8; i++){ const t = a - HH(i, 60) * .05; if(t < 0 || t > .8) continue; const an = -Math.PI * (.1 + .8 * HH(i, 61)), v = 60 + HH(i, 62) * 110; tpFlake(x + Math.cos(an) * v * t, y + Math.sin(an) * v * t + 80 * t * t, 5 + HH(i, 63) * 3, t * 6 + i, 1 - t / .8); }
}
// ---- Envite Ígneo: el Pokémon, envuelto en llamas que crecen, sale disparado dejando una estela; al chocar, explosión circular con ondas ----
FXR.melee['_hgEngulf'] = (e, a) => {
  const f = e.fol; if(!f) return; if(a > .3 && !f.ride){ if(e.endAt === undefined) e.endAt = a; if(a - e.endAt > .25){ e.dead = true; return; } }
  const P = e.pal || TP.fuego, b = bodyOf(f), top = b.top, foot = b.foot, hh = (foot - top) / 2, cy = top + hh, cx = f.x, k = Math.floor(a * 16), inten = .45 + .55 * clamp01(a / .35), m = clamp01(a / .18);
  const al = (a < .08 ? a / .08 : 1) * (e.endAt === undefined ? 1 : Math.max(0, 1 - (a - e.endAt) / .25)), dir = e.dir || 0;
  const vx = (1 - m) * 0 + m * -Math.cos(dir), vy = (1 - m) * -1 + m * -Math.sin(dir), tang = Math.atan2(vy, vx), N = 13;
  ctx.save(); ctx.globalAlpha = al;
  for(let pass = 0; pass < 3; pass++) for(let i = 0; i < N; i++){
    const an = (i / N) * 6.283 + a * 2.5, x = cx + Math.cos(an) * b.hw * 1.0, y = cy + Math.sin(an) * hh * .95;
    const L = hh * (1 + .9 * m + HH(i, k) * .6) * inten * (pass === 0 ? 1 : pass === 1 ? .72 : .45), W = Math.max(7, b.hw * .5) * inten * (pass === 0 ? 1 : pass === 1 ? .7 : .42);
    tpTongue(x, y, L, W, tang + (HH(i, k + 7) - .5) * .5, pass === 0 ? P[1] : pass === 1 ? P[2] : P[3], pass === 0 ? P[0] : null, al);
  }
  ctx.restore();
};
(function(){ const old = FXR.cast['Envite Ígneo'] || FXR.cast['_'];
  FXR.cast['Envite Ígneo'] = (f, s, name, big, ox, oy, ang) => {
    if(!fxhd.on) return old(f, s, name, big, ox, oy, ang);
    fxAdd('melee', '_hgEngulf', {fol:f, x:f.x, y:f.y, dur:2, type:'fuego', dir:ang, pal:TP.fuego}); fx.shake = Math.max(fx.shake, 2); }; })();
function hgRushFlight(s, a, an, P){       // estela de fuego y chispas detrás del Pokémon (que va pegado al proyectil)
  ctx.save(); const t = g.t, k = Math.floor(t * 16), ca = Math.cos(an), sa = Math.sin(an), px = -sa, py = ca;
  for(let i = 0; i < 7; i++){ const o = (i - 3) * 13, L = 80 + HH(i, k) * 40 - Math.abs(i - 3) * 12; tpTongue(s.x - ca * 26 + px * o, s.y - sa * 26 + py * o, L, 12 - Math.abs(i - 3), an + Math.PI + (i - 3) * .07, i === 3 ? P[2] : P[1], P[0]); }
  for(let i = 0; i < 12; i++){ const u = (t * 2.8 + i / 12) % 1, d = 20 + u * 110, o = (HH(i, 11) - .5) * 46; ctx.globalAlpha = 1 - u; ctx.fillStyle = i % 2 ? P[3] : P[2]; const sz = 3 + (1 - u) * 4; ctx.fillRect(s.x - ca * d + px * o - sz / 2, s.y - sa * d + py * o - sz / 2, sz, sz); }
  ctx.restore();
}
function hgRushHit(e, a, P, ty, fe){
  const k = e.k || 1, x = e.x, y = e.y - 6; if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, ty, k); fx.shake = Math.max(fx.shake, 7); }
  const u = 1 - Math.pow(1 - clamp01(a / .2), 3), life = a < .42 ? 1 : Math.max(0, 1 - (a - .42) / .3), R = 54 * u * k;
  if(life > 0){ const list = [[x, y, R * .62 * life]]; for(let i = 0; i < 12; i++){ const an = (i / 12) * 6.283 + a * 2; list.push([x + Math.cos(an) * R * .62, y + Math.sin(an) * R * .62, R * .36 * life]); } tpLayers(list, P);
    for(let i = 0; i < 8; i++){ const an = (i / 8) * 6.283 + .4 + a, d = R * .95; tpTongue(x + Math.cos(an) * d, y + Math.sin(an) * d, 26 * life, 8 * life, an, P[2], P[0]); } }
  for(let r = 0; r < 2; r++){ const v = clamp01((a - r * .09) / .5); if(v > 0 && v < 1){ const o = 1 - Math.pow(1 - v, 2), rr = (28 + (r ? 78 : 108) * o) * k; ctx.save(); ctx.globalAlpha = 1 - v; ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.283); ctx.strokeStyle = P[0]; ctx.lineWidth = 11 - 5 * v; ctx.stroke(); ctx.strokeStyle = r ? P[3] : P[2]; ctx.lineWidth = 6 - 3 * v; ctx.stroke(); ctx.restore(); } }   // ondas de choque circulares
  const v2 = clamp01(a / .5); if(v2 < 1) tpEllipse(x, e.y + 12, 18 + 110 * v2, 7 + 30 * v2, 1 - v2, 4, P);
  ctx.save(); for(let i = 0; i < 28; i++){ const t = a - HH(i, 20) * .06; if(t < 0 || t > .85) continue; const an = HH(i, 21) * 6.283, v = 80 + HH(i, 22) * 170; ctx.globalAlpha = 1 - t / .85; ctx.fillStyle = i % 3 ? P[3] : P[2]; const sz = 4 + HH(i, 23) * 5; ctx.fillRect(x + Math.cos(an) * v * t - sz / 2, y + Math.sin(an) * v * t * .85 + 90 * t * t - sz / 2, sz, sz); } ctx.restore();   // brasas
  if(fe){ ctx.save(); for(let i = 0; i < 14; i++){ const t = a - HH(i, 90) * .05; if(t < 0 || t > .9) continue; const an = HH(i, 91) * 6.283, v = 60 + HH(i, 92) * 120, px = x + Math.cos(an) * v * t, py = y + Math.sin(an) * v * t * .8 + 40 * t * t, rot = an + t * 8; ctx.globalAlpha = 1 - t / .9; ctx.translate(px, py); ctx.rotate(rot); ctx.beginPath(); ctx.ellipse(0, 0, 9, 3.4, 0, 0, 6.283); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = P[0]; ctx.lineWidth = 2; ctx.stroke(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.restore(); ctx.save(); } ctx.restore(); }
}
function hgEnviteFlight(s, a, an){ hgRushFlight(s, a, an, TP.fuego); }
function hgEnviteHit(e, a){ hgRushHit(e, a, TP.fuego, 'fuego', false); }
// ---- Pájaro Osado: igual de rápido que el Envite, pero envuelto en viento y plumas (azul y blanco) ----
TP.volador = ['#1d2f66', '#4f7fe0', '#a4c6ff', '#e4efff', '#ffffff'];
(function(){ const old = FXR.cast['Pájaro Osado'] || FXR.cast['_'];
  FXR.cast['Pájaro Osado'] = (f, s, name, big, ox, oy, ang) => {
    if(!fxhd.on) return old(f, s, name, big, ox, oy, ang);
    fxAdd('melee', '_hgEngulf', {fol:f, x:f.x, y:f.y, dur:2, type:'volador', dir:ang, pal:TP.volador}); fx.shake = Math.max(fx.shake, 2); }; })();
function hgBraveFlight(s, a, an){ hgRushFlight(s, a, an, TP.volador); }
function hgBraveHit(e, a){ hgRushHit(e, a, TP.volador, 'normal', true); }
// ---- Lanzallamas: acumula fuego en la boca → chorro ondulante con explosiones y brasas → llamas que envuelven al rival y humo/ceniza ----
function hgFireCharge(x, y, u){
  const ease = 1 - Math.pow(1 - u, 2), k = Math.floor(g.t * 16); ctx.save(); ctx.globalCompositeOperation = 'source-over';
  for(let i = 0; i < 10; i++){ const th = i * .628 + u * 4, rad = 56 * (1 - ease) * (.55 + .45 * HH(i, 1)) + 8; ctx.fillStyle = i % 2 ? TP.fuego[3] : TP.fuego[2]; ctx.globalAlpha = Math.min(1, u * 5); ctx.fillRect(x + Math.cos(th) * rad - 2.5, y - 4 + Math.sin(th) * rad * .85 - 2.5, 5, 5); }
  ctx.globalAlpha = 1; const r = 4 + 13 * ease;
  for(let i = 0; i < 4; i++) tpTongue(x + (i - 1.5) * r * .4, y - 4, r * (1.1 + HH(i, k) * .8), r * .45, -Math.PI / 2 + (i - 1.5) * .35, TP.fuego[2], TP.fuego[0]);
  tpLayers([[x, y - 4, r]], TP.fuego); ctx.restore();
}
function hgLanzallamas(e){
  const CH = .3, t = e.t || 0; if(t < CH){ hgFireCharge(e.ox, e.oy, t / CH); return; }
  tpLanzallamas(e); const G = sg(e, 300); if(G.len < 8) return; const A = G.al, dx = Math.cos(G.an), dy = Math.sin(G.an), px = -dy, py = dx, k = Math.floor(g.t * 8);
  tpLayers([[G.x0, G.y0, 11]], TP.fuego, A);
  ctx.save(); ctx.globalAlpha = A;
  for(let i = 0; i < 4; i++){ const ph = hdFract(g.t * 2.2 + i * .25), u = .25 + .7 * HH(i, k), off = (HH(i, k + 5) - .5) * 26, x = G.x0 + dx * G.len * u + px * off, y = G.y0 + dy * G.len * u + py * off, r = 4 + ph * 12; ctx.globalAlpha = A * (1 - ph); tpLayers([[x, y, r]], TP.fuego); }   // pequeñas explosiones de fuego
  for(let i = 0; i < 12; i++){ const u = hdFract(i * .083 + g.t * 1.8), off = (HH(i, 3) - .5) * 40; ctx.globalAlpha = A * (1 - u * .6); ctx.fillStyle = i % 2 ? TP.fuego[3] : TP.fuego[2]; const sz = 3 + HH(i, 4) * 3; ctx.fillRect(G.x0 + dx * G.len * u + px * off - sz / 2, G.y0 + dy * G.len * u + py * off - u * 26 - sz / 2, sz, sz); }   // brasas
  ctx.restore();
}
function hgLanzaHit(e, a){
  const k = e.k || 1, T = e.T, x = e.x, y = e.y - 6; if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'fuego', k); }
  const b = T ? bodyOf(T) : {hw:30, top:y - 40, foot:y + 30}, cx = T ? T.x : x, top = b.top, foot = b.foot, hh = foot - top, kk = Math.floor(a * 14);
  const al = (a < .08 ? a / .08 : 1) * (1 - clamp01((a - .5) / .3));
  if(al > 0){ ctx.save(); ctx.globalAlpha = al; for(let pass = 0; pass < 3; pass++) for(let i = 0; i < 9; i++){ const fx0 = cx + ((i / 8) - .5) * b.hw * 2.0, fy = foot - 4 - (i % 3) * hh * .1, L = hh * (.55 + HH(i, kk) * .5) * (pass === 0 ? 1 : pass === 1 ? .72 : .45), W = (b.hw * .42) * (pass === 0 ? 1 : pass === 1 ? .7 : .42);
      tpTongue(fx0, fy, L, W, -Math.PI / 2 + (HH(i, kk + 4) - .5) * .5, pass === 0 ? TP.fuego[1] : pass === 1 ? TP.fuego[2] : TP.fuego[3], pass === 0 ? TP.fuego[0] : null, al); } ctx.restore(); }
  for(let i = 0; i < 6; i++){ const t = a - .3 - i * .05; if(t < 0 || t > .8) continue; const u = t / .8, px = cx + (HH(i, 70) - .5) * b.hw * 1.5 + Math.sin(t * 5 + i) * 6, py = top - 6 - 60 * u, r = 8 + 12 * u; ctx.save(); ctx.globalAlpha = (1 - u) * .85; ctx.beginPath(); ctx.arc(px, py, r + 2, 0, 6.283); ctx.fillStyle = '#2a2a2a'; ctx.fill(); ctx.beginPath(); ctx.arc(px, py, r, 0, 6.283); ctx.fillStyle = '#7d7d7d'; ctx.fill(); ctx.beginPath(); ctx.arc(px - r * .25, py - r * .25, r * .5, 0, 6.283); ctx.fillStyle = '#b5b5b5'; ctx.fill(); ctx.restore(); }   // humo
  ctx.save(); for(let i = 0; i < 16; i++){ const t = a - .15 - HH(i, 80) * .3; if(t < 0 || t > .9) continue; ctx.globalAlpha = 1 - t / .9; ctx.fillStyle = i % 3 ? '#4a4a4a' : '#9a9a9a'; const sz = 2 + HH(i, 81) * 3; ctx.fillRect(cx + (HH(i, 82) - .5) * b.hw * 2 + Math.sin(t * 6 + i) * 8 - sz / 2, top + hh * .4 - t * 55 - sz / 2, sz, sz); } ctx.restore();                  // ceniza
}
// Hidropulso: esfera de agua con ondas que salen de ella
function hgHidropulsoFlight(s, a, an){
  ctx.save(); const t = g.t, r = 16 + Math.sin(t * 12) * 1.2;
  for(let i = 0; i < 3; i++){ const v = (t * 1.8 + i / 3) % 1, rr = r + 4 + v * 26; ctx.save(); ctx.translate(s.x, s.y); ctx.globalAlpha = 1 - v; ctx.beginPath(); ctx.arc(0, 0, rr, 0, 6.283); ctx.strokeStyle = TP.agua[0]; ctx.lineWidth = 8; ctx.stroke(); ctx.strokeStyle = TP.agua[3]; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
  tpLayers([[s.x, s.y, r]], TP.agua);
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(s.x - r * .35, s.y - r * .4, r * .22, r * .14, -.6, 0, 6.283); ctx.fill();     // reflejo
  for(let i = 0; i < 4; i++){ const ph = t * 4 + i * 1.57, bx = s.x + Math.cos(ph) * (r + 10), by = s.y + Math.sin(ph) * (r + 10); tpLayers([[bx, by, 3.2]], TP.agua); }          // burbujitas orbitando
  ctx.restore();
}
function hgHidropulsoHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 6; if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'agua', k); }
  for(let i = 0; i < 3; i++){ const v = clamp01((a - i * .1) / .5); if(v > 0 && v < 1){ const o = 1 - Math.pow(1 - v, 2); tpEllipse(x, y, (14 + 62 * o) * k, (12 + 50 * o) * k, 1 - v, 5, TP.agua); } }
  const u = clamp01(a / .22), life = a < .3 ? 1 : Math.max(0, 1 - (a - .3) / .25);
  if(life > 0) tpLayers([[x, y, 24 * (.5 + .5 * u) * life * k]], TP.agua);
  tpDrops(x, y, a, 14, 200 * k, .7, 420, TP.agua, 5.5);
}

/* ======================= VENDAVAL (botón E): remolino que levanta al rival ======================= */
const TP_VT = ['#3b4f7a', '#8fb0d8', '#cfe2f5', '#f2f8ff', '#ffffff'];
function fxLift(f){                                   // cuánto se eleva el sprite de un Pokémon atrapado por el Vendaval (px)
  const L = f.lift; if(!L) return 0; const a = g.t - L.t0; if(a >= L.dur || a < 0){ if(a >= L.dur) f.lift = null; return 0; }
  const u = a / L.dur, h = u < .25 ? 1 - Math.pow(1 - u / .25, 2) : u < .75 ? 1 : 1 - Math.pow((u - .75) / .25, 2);
  return 62 * h + Math.sin(g.t * 9) * 3 * h;
}
function hgFunnel(x, baseY, h, wBase, wTop, al, T0){      // embudo plano: contorno oscuro, relleno translúcido, bandas que giran
  const N = 14, edge = u => wBase + (wTop - wBase) * Math.pow(u, 1.25) + Math.sin(g.t * 8 + u * 6) * 2.2, sway = u => Math.sin(g.t * 6 + u * 4) * 5 * u;
  ctx.save(); ctx.globalAlpha = al; ctx.beginPath();
  for(let i = 0; i <= N; i++){ const u = i / N; ctx[i ? 'lineTo' : 'moveTo'](x + sway(u) - edge(u), baseY - h * u); }
  for(let i = N; i >= 0; i--){ const u = i / N; ctx.lineTo(x + sway(u) + edge(u), baseY - h * u); } ctx.closePath();
  ctx.fillStyle = 'rgba(207,226,245,.38)'; ctx.fill(); ctx.strokeStyle = TP_VT[0]; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
  for(let i = 0; i < 6; i++){ const u = hdFract(i / 6 + g.t * 1.3) * .95 + .03, w = edge(u), cx = x + sway(u), cy = baseY - h * u;
    ctx.beginPath(); ctx.ellipse(cx, cy, w, w * .24, 0, 0, Math.PI); ctx.strokeStyle = TP_VT[0]; ctx.lineWidth = 5; ctx.stroke(); ctx.strokeStyle = TP_VT[3]; ctx.lineWidth = 2.4; ctx.stroke(); }
  ctx.restore();
}
function hgVendavalFlight(s, a, an){
  ctx.save(); const t = g.t; hgFunnel(s.x, s.y + 20, 62, 5, 22, 1);
  for(let i = 0; i < 6; i++){ const th = t * 9 + i * 1.05, rr = 16 + (i % 3) * 5; ctx.fillStyle = i % 2 ? TP_VT[4] : TP_VT[2]; ctx.fillRect(s.x + Math.cos(th) * rr - 2.5, s.y - 12 + Math.sin(th) * rr * .28 - 20 * ((i % 3) / 3) - 2.5, 5, 5); }
  for(let i = 0; i < 3; i++){ const u = (t * 2 + i / 3) % 1; ctx.globalAlpha = 1 - u; ctx.strokeStyle = TP_VT[3]; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); const x0 = s.x - Math.cos(an) * (24 + u * 50), y0 = s.y + 6 + i * 6 - 10; ctx.moveTo(x0, y0); ctx.lineTo(x0 - 18, y0); ctx.stroke(); }
  ctx.restore();
}
function hgVendavalHit(e, a){
  const T = e.T, b = T ? bodyOf(T) : {hw:30, top:e.y - 50, foot:e.y + 20}, cx = T ? T.x : e.x, foot = b.foot + 4, h = (b.foot - b.top) * 1.35 + 60, k = e.k || 1;
  const grow = 1 - Math.pow(1 - clamp01(a / .22), 3), al = (a < .12 ? a / .12 : 1) * (1 - clamp01((a - .85) / .3));
  if(al > 0){ hgFunnel(cx, foot, h * grow, 12, (b.hw + 26) * grow, al);
    ctx.save(); ctx.globalAlpha = al; for(let i = 0; i < 12; i++){ const th = g.t * 8 + i * .52, u = hdFract(i * .17 + g.t * .9), rr = (b.hw + 14) * (.5 + u * .8); ctx.fillStyle = i % 3 ? TP_VT[4] : TP_VT[1]; ctx.fillRect(cx + Math.cos(th) * rr - 2.5, foot - u * h * grow + Math.sin(th) * rr * .22 - 2.5, 5, 5); } ctx.restore(); }
  const v = clamp01(a / .55); if(v < 1) tpEllipse(cx, foot, (18 + 70 * v) * k, (6 + 20 * v) * k, 1 - v, 4, {0:TP_VT[0], 3:TP_VT[3]});
}

/* ======================= HIPNOSIS (MT, hueco Q): ondas hipnóticas que salen del lanzador y un remolino que duerme al rival ======================= */
const TP_HY = ['#3a0f5c', '#a63fd8', '#e27bf0', '#ffc4f6', '#ffffff'];
function hgWaveArc(x, y, r, an, spread, al, w){        // un arco de onda: contorno oscuro, rosa, centro claro
  ctx.save(); ctx.globalAlpha = al; ctx.lineCap = 'round';
  for(const [col, lw] of [[TP_HY[0], w + 5], [TP_HY[2], w], [TP_HY[4], Math.max(1.5, w * .35)]]){ ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(x, y, r, an - spread, an + spread); ctx.stroke(); }
  ctx.restore();
}
function hgHipnosisFlight(s, a, an){
  ctx.save(); const t = g.t;
  for(let i = 0; i < 4; i++){ const u = (t * 1.5 + i / 4) % 1, r = 8 + u * 34; hgWaveArc(s.x - Math.cos(an) * 8, s.y - Math.sin(an) * 8, r, an, 1.0 - .15 * u, (1 - u) * .95 + .05, 5 - 2 * u); }
  tpLayers([[s.x, s.y, 7 + Math.sin(t * 12)]], TP_HY);
  for(let i = 0; i < 3; i++){ const th = t * 6 + i * 2.09; ctx.fillStyle = i ? TP_HY[3] : TP_HY[4]; ctx.fillRect(s.x + Math.cos(th) * 17 - 2, s.y + Math.sin(th) * 17 - 2, 4, 4); }
  ctx.restore();
}
function hgSwirl(x, y, R, rot, al){                     // espiral hipnótica plana con contorno
  ctx.save(); ctx.globalAlpha = al; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for(const [col, lw] of [[TP_HY[0], 7], [TP_HY[2], 3.5], [TP_HY[4], 1.5]]){ ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    for(let i = 0; i <= 60; i++){ const th = i / 60 * 2.5 * 6.283, r = R * (i / 60); ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(th + rot) * r, y + Math.sin(th + rot) * r * .8); } ctx.stroke(); }
  ctx.restore();
}
function hgHipnosisHit(e, a){
  const T = e.T, b = T ? bodyOf(T) : {hw:30, top:e.y - 50, foot:e.y + 20}, cx = T ? T.x : e.x, cy = (b.top + b.foot) / 2, k = e.k || 1;
  const al = (a < .1 ? a / .1 : 1) * (1 - clamp01((a - .65) / .25));
  if(al > 0){ hgSwirl(cx, cy, (b.hw + 14) * (.6 + .4 * clamp01(a / .2)), -a * 9, al * .85);
    for(let i = 0; i < 3; i++){ const u = (a * 1.6 + i / 3) % 1, r = (b.hw + 40) * (1 - u); ctx.save(); ctx.globalAlpha = al * u; ctx.beginPath(); ctx.ellipse(cx, cy, r, r * .8, 0, 0, 6.283); ctx.strokeStyle = TP_HY[0]; ctx.lineWidth = 7; ctx.stroke(); ctx.strokeStyle = TP_HY[3]; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); } }
  for(let i = 0; i < 3; i++){ const t = a - .3 - i * .14; if(t < 0 || t > .8) continue; const u = t / .8, x = cx + b.hw * .5 + i * 9 + u * 10, y = b.top - 4 - u * 34 - i * 8, sz = 12 + i * 4; ctx.save(); ctx.globalAlpha = 1 - clamp01((u - .6) / .4); text('Z', x + 1.5, y + 1.5, sz, TP_HY[0], 'center'); text('Z', x, y, sz, TP_HY[3], 'center'); ctx.restore(); }
}

/* ======================= HIDROBOMBA como en la captura (Pokémon DS): chorro grande pálido con borde azul marino irregular, remolino en la boca y espuma ======================= */
const TP_HB = ['#0b1f44', '#6db4e0', '#b5e0f4', '#e1f4fb', '#ffffff'];
function hgHidrobomba(e){
  const G = sg(e, 300); if(G.len < 8) return; const t = g.t, k = Math.floor(t * 12), A = G.al, dx = Math.cos(G.an), dy = Math.sin(G.an), px = -dy, py = dx, N = 18;
  const half = (u, i) => (7 + 13 * Math.pow(u, .85)) * (u < .08 ? .55 + .45 * u / .08 : 1) + (HH(i, k) - .5) * 4;      // más ancho cuanto más lejos
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  const poly = (sc, pad, sd) => { ctx.beginPath(); for(let i = 0; i <= N; i++){ const u = i / N, h = half(u, i + sd) * sc + pad; ctx[i ? 'lineTo' : 'moveTo'](G.x0 + dx * G.len * u + px * h, G.y0 + dy * G.len * u + py * h); }
    ctx.arc(G.x1, G.y1, half(1, 3) * sc + pad, G.an - Math.PI / 2, G.an + Math.PI / 2); for(let i = N; i >= 0; i--){ const u = i / N, h = half(u, i + sd + 40) * sc + pad; ctx.lineTo(G.x0 + dx * G.len * u - px * h, G.y0 + dy * G.len * u - py * h); } ctx.closePath(); };
  ctx.globalAlpha = A; [[1, 4, TP_HB[0], 30], [1, 0, TP_HB[1], 0], [.8, 0, TP_HB[2], 7], [.55, 0, TP_HB[3], 13], [.26, 0, TP_HB[4], 19]].forEach(([sc, pad, c, sd]) => { ctx.fillStyle = c; poly(sc, pad, sd); ctx.fill(); });
  ctx.lineCap = 'round'; for(let i = 0; i < 7; i++){ const u0 = hdFract(i * .131 + t * 1.6), len = .12 + HH(i, 5) * .12, off = (HH(i, 6) - .5) * 1.1;       // vetas blancas que corren por el chorro
    const w0 = half(u0, i), w1 = half(Math.min(1, u0 + len), i); ctx.strokeStyle = TP_HB[4]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(G.x0 + dx * G.len * u0 + px * w0 * off * .8, G.y0 + dy * G.len * u0 + py * w0 * off * .8); ctx.lineTo(G.x0 + dx * G.len * Math.min(1, u0 + len) + px * w1 * off * .8, G.y0 + dy * G.len * Math.min(1, u0 + len) + py * w1 * off * .8); ctx.stroke(); }
  for(let i = 0; i < 9; i++){ const u = .1 + .9 * HH(i, 9), sd = i % 2 ? 1 : -1, h = half(u, i) * (.95 + HH(i, k) * .3), x = G.x0 + dx * G.len * u + px * h * sd, y = G.y0 + dy * G.len * u + py * h * sd, r = 2.5 + HH(i, 10) * 3;   // espuma en los bordes
    ctx.fillStyle = TP_HB[0]; ctx.beginPath(); ctx.arc(x, y, r + 2, 0, 6.283); ctx.fill(); ctx.fillStyle = TP_HB[4]; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); }
  for(let r = 0; r < 3; r++){ const rot = t * 5 * (r % 2 ? -1 : 1) + r, rr = 16 + r * 8, W = half(.04, 0) + 6 + r * 3;    // remolino de agua en la boca
    ctx.save(); ctx.translate(G.x0, G.y0); ctx.rotate(G.an); ctx.beginPath(); ctx.ellipse(r * 3, 0, 5 + r * 1.5, W, 0, rot, rot + 4.3); ctx.strokeStyle = TP_HB[0]; ctx.lineWidth = 6 - r; ctx.stroke(); ctx.strokeStyle = TP_HB[3]; ctx.lineWidth = 3 - r * .5; ctx.stroke(); ctx.restore(); }
  for(let i = 0; i < 10; i++){ const u = hdFract(i * .1 + t * 1.3), sd = (HH(i, 12) - .5) * 2, h = half(u, i) * (1.1 + HH(i, 13) * .6) * sd; ctx.globalAlpha = A * (1 - u * .4); ctx.fillStyle = i % 2 ? TP_HB[4] : TP_HB[3]; const sz = 3 + HH(i, 14) * 3; ctx.fillRect(G.x0 + dx * G.len * u + px * h - sz / 2, G.y0 + dy * G.len * u + py * h - u * 14 - sz / 2, sz, sz); }
  ctx.restore();
}
