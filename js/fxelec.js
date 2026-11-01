"use strict";
/* =====================================================================
   ATAQUES ELÉCTRICOS ESTILO JUEGO (fxelec.js). Se carga ANTES de fxhd4.js, que los engancha en la tabla HERO4.
   Cómo son los rayos en los juegos de Pokémon: formas PLANAS, gruesas, en zigzag con ángulos muy marcados, amarillo vivo con
   CONTORNO oscuro y un centro claro; no son luz difusa. Aquí:
     Impactrueno ... bola amarilla con chispas; al impactar saltan rayitos en todas direcciones
     Onda Trueno ... bola con arcos; al impactar anillos amarillos que se abren alrededor del rival
     Rayo .......... zigzag doble y grueso; al impactar caen 3 rayos del cielo sobre el rival
     Trueno ........ bola con chispas; al impactar cae UN RAYO GIGANTE del cielo, destello de pantalla, anillo y rayos por el suelo
     Puño Trueno / Colmillo Rayo ... estallido con rayos que salen del golpe
     Carga ......... rayitos girando alrededor del Pokémon y chispas que suben
   Para cambiar el grosor de todos los rayos: EL_W (abajo).
   ===================================================================== */
const EL_COL = {edge:'#4a3000', main:'#ffd91a', core:'#fffbd0', star:'#ffe84a'};
let EL_W = .8;                                                         // multiplicador de grosor de todos los rayos
let EL_SZ = .68;                                                       // tamaño de los impactos (1 = el tamaño grande de antes)
// Dibuja una función de impacto reducida/ampliada alrededor de su centro (e.x, e.y)
const elScaleAt = (fn, S) => (e, a) => { ctx.save(); ctx.translate(e.x, e.y); ctx.scale(S, S); ctx.translate(-e.x, -e.y); try{ fn(e, a); }finally{ ctx.restore(); } };

// Camino en zigzag marcado (signo alterno + tamaño al azar); más fino hacia las puntas
function elPts(x0, y0, x1, y1, seed, n, amp){
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, p = [[x0, y0]];
  for(let i = 1; i < n; i++){ const u = i / n, s = (i % 2 ? 1 : -1) * (.45 + .55 * HH(seed, i)), tp = Math.pow(Math.sin(Math.PI * u), .5); p.push([x0 + dx * u + nx * amp * s * tp, y0 + dy * u + ny * amp * s * tp]); }
  p.push([x1, y1]); return p;
}
function elStroke(pts, col, w, A){
  ctx.globalAlpha = A; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'miter'; ctx.miterLimit = 8; ctx.lineCap = 'butt';
  ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
}
// Rayo = contorno oscuro + amarillo + centro claro
function elBolt(pts, w, A){ w *= EL_W; elStroke(pts, EL_COL.edge, w + 6, A); elStroke(pts, EL_COL.main, w, A); elStroke(pts, EL_COL.core, Math.max(1.5, w * .38), A); }
// Ramitas que salen del rayo principal
function elForks(pts, seed, count, len, w, A){
  for(let b = 0; b < count; b++){
    const i = 1 + Math.floor(HH(seed, b + 20) * (pts.length - 2)), [px, py] = pts[i], main = Math.atan2(pts[pts.length - 1][1] - pts[0][1], pts[pts.length - 1][0] - pts[0][0]),
      an = main + (b % 2 ? 1 : -1) * (.5 + HH(seed, b + 30) * .8), L = len * (.6 + HH(seed, b + 40) * .7);
    elBolt(elPts(px, py, px + Math.cos(an) * L, py + Math.sin(an) * L, seed * 3 + b, 3, L * .22), w, A);
  }
}
// Estrella de picos plana con contorno (destello del golpe)
function elStar(x, y, R, n, rot, A){
  if(R < 2) return; ctx.save(); ctx.globalAlpha = A; ctx.lineJoin = 'miter';
  const shape = (r, fill, edge) => { ctx.beginPath(); for(let i = 0; i < n * 2; i++){ const a = rot + i * Math.PI / n, rr = i % 2 ? r * .42 : r * (i % 4 ? .78 : 1); ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr * .9); } ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if(edge){ ctx.strokeStyle = edge; ctx.lineWidth = 3; ctx.stroke(); } };
  shape(R, EL_COL.star, EL_COL.edge); shape(R * .55, '#ffffff', null); ctx.restore();
}
// Bola eléctrica: disco amarillo con contorno y rayitos cortos alrededor (cambian ~18 veces por segundo)
function elBall(x, y, r, A, nb){
  const k = Math.floor(g.t * 18);
  for(let i = 0; i < (nb || 6); i++){ const an = HH(k, i) * 6.283, L = r * (1.7 + HH(k, i + 9) * 1.2); elBolt(elPts(x + Math.cos(an) * r * .6, y + Math.sin(an) * r * .6, x + Math.cos(an) * L, y + Math.sin(an) * L, k * 7 + i, 3, r * .45), Math.max(2.5, r * .28), A); }
  ctx.globalAlpha = A; ctx.fillStyle = EL_COL.edge; ctx.beginPath(); ctx.arc(x, y, r + 3, 0, 6.283); ctx.fill();
  ctx.fillStyle = EL_COL.main; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, r * .5, 0, 6.283); ctx.fill();
}
// Rayitos que salen en todas direcciones desde un punto
function elBurst(x, y, a, t0, t1, n, L0, L1, w, ry){
  if(a < t0 || a > t1) return; const u = (a - t0) / (t1 - t0), k = Math.floor(a * 20), A = 1 - u * u;
  for(let i = 0; i < n; i++){ const an = (i / n) * 6.283 + HH(k, i) * .5, L = (L0 + (L1 - L0) * Math.min(1, u * 2.2)) * (.7 + HH(i, 5) * .5);
    elBolt(elPts(x, y, x + Math.cos(an) * L, y + Math.sin(an) * L * (ry || 1), k * 11 + i, 4, L * .2), w, A); }
}
function elRing(x, y, rx, ry, A, w){ ctx.globalAlpha = A; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 6.283); ctx.strokeStyle = EL_COL.edge; ctx.lineWidth = w + 5; ctx.stroke(); ctx.strokeStyle = EL_COL.main; ctx.lineWidth = w; ctx.stroke(); }
function elSparks(x, y, a, n, spd, life, g0){
  for(let i = 0; i < n; i++){ const d0 = HH(i, 31) * .08, t = a - d0; if(t < 0 || t > life) continue; const an = HH(i, 32) * 6.283, v = spd * (.5 + HH(i, 33));
    ctx.globalAlpha = 1 - t / life; ctx.fillStyle = i % 2 ? EL_COL.core : EL_COL.main; const s = 3 + HH(i, 34) * 3; ctx.fillRect(x + Math.cos(an) * v * t - s / 2, y + Math.sin(an) * v * t * .8 + (g0 || 0) * t * t - s / 2, s, s); }
}

// ------------------------------ Impactrueno ------------------------------
function elImpactruenoFlight(s){ ctx.save(); ctx.globalCompositeOperation = 'source-over'; elBall(s.x, s.y, 9, 1, 5); ctx.restore(); }
function elImpactruenoHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 6;
  elStar(x, y, 30 * k * (1 - clamp01((a - .12) / .2)), 9, a * 3, a < .32 ? 1 : 0);
  elBurst(x, y, a, 0, .5, 7, 26 * k, 60 * k, 5, .85);
  elSparks(x, y, a, 10, 120 * k, .5, 80);
}

// ------------------------------ Onda Trueno ------------------------------
function elOndaFlight(s, a, an){
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; elBall(s.x, s.y, 8, 1, 4);
  for(let r = 0; r < 2; r++){ const v = (g.t * 2.2 + r * .5) % 1; ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(an); ctx.globalAlpha = 1 - v; ctx.beginPath(); ctx.ellipse(10 + v * 18, 0, 3 + v * 4, 6 + v * 12, 0, -1.2, 1.2); ctx.strokeStyle = EL_COL.edge; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = EL_COL.main; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
function elOndaHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 4;
  for(let r = 0; r < 3; r++){ const v = clamp01((a - r * .13) / .5); if(v <= 0 || v >= 1) continue; const o = 1 - Math.pow(1 - v, 2); elRing(x, y, (16 + 62 * o) * k, (8 + 28 * o) * k, 1 - v, 3.5); }
  const kk = Math.floor(a * 20); if(a < .6) for(let i = 0; i < 5; i++){ const an = (i / 5) * 6.283 + kk * .7, rx = 26 * k, ry = 22 * k; const x0 = x + Math.cos(an) * rx, y0 = y + Math.sin(an) * ry, x1 = x + Math.cos(an + .9) * rx, y1 = y + Math.sin(an + .9) * ry; elBolt(elPts(x0, y0, x1, y1, kk * 5 + i, 3, 8), 3, 1 - a / .6); }
  elSparks(x, y, a, 8, 70 * k, .55, 0);
}

// ------------------------------ Rayo ------------------------------
function elRayo(e){
  const G = sg(e, 340); if(G.len < 8) return; const A = G.al, k = Math.floor(g.t * 22), n = Math.max(7, Math.round(G.len / 30));
  const main = elPts(G.x0, G.y0, G.x1, G.y1, k, n, 22), second = elPts(G.x0, G.y0, G.x1, G.y1, k + 91, n + 1, 15);
  elBolt(second, 3, A); elBolt(main, 6, A); elForks(main, k, 4, 40, 3, A);
  elStar(G.x0, G.y0, 8 + (k % 2) * 2, 8, k, A);
  elStar(G.x1, G.y1, 16 + (k % 2) * 3, 10, k * .7, A);
}
function elRayoHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 6, kk = Math.floor(a * 18);
  if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'electrico', k); }
  if(a < .5){ const A = a < .4 ? 1 : 1 - (a - .4) / .1;           // 3 rayos que caen del cielo sobre el rival
    [-30, 4, 34].forEach((ox, i) => { if(((kk + i) % 3) === 2) return; const bx = x + ox * k + (HH(kk, i) - .5) * 10; elBolt(elPts(bx + (i - 1) * 16, y - 230, bx, y + 8, kk * 3 + i, 6, 20), 6, A); }); }
  elStar(x, y, 40 * k * (1 - clamp01((a - .1) / .3)), 10, a * 2, a < .4 ? 1 : 0);
  elBurst(x, y, a, .04, .55, 6, 26 * k, 62 * k, 4.5, .85);
  elSparks(x, y, a, 10, 130 * k, .5, 90);
}

// ------------------------------ Trueno ------------------------------
function elTruenoFlight(s){ ctx.save(); ctx.globalCompositeOperation = 'source-over'; elBall(s.x, s.y, 14, 1, 8); ctx.restore(); }
function elTruenoHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 4, kk = Math.floor(a * 20);
  if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'electrico', k * 1.3); }
  if(a < .07){ ctx.globalAlpha = .28 * (1 - a / .07); ctx.fillStyle = "#fffbd0"; ctx.fillRect(-W, -H, W * 3, H * 3); }            // destello de pantalla, muy corto
  if(a < .5){                                                                                                                     // el rayo gigante (se vuelve a «tirar» varias veces)
    const A = a < .4 ? 1 : 1 - (a - .4) / .1, bx = x + (HH(2, 1) - .5) * 14, w = 15 + (kk % 2) * 3;
    const main = elPts(bx + (HH(kk, 3) - .5) * 40, y - 640, x, y + 6, kk, 8, 46);
    elBolt(main, w, A); elForks(main, kk, 3, 90, 7, A);
  }
  elStar(x, y, 66 * k * (1 - clamp01((a - .1) / .28)), 12, a * 2, a < .38 ? 1 : 0);
  for(let r = 0; r < 2; r++){ const v = clamp01((a - .05 - r * .1) / .5); if(v > 0 && v < 1){ const o = 1 - Math.pow(1 - v, 2); elRing(x, y + 14, (12 + 100 * o) * k, (5 + 36 * o) * k, 1 - v, 4); } }
  if(a > .06 && a < .7){ const u = (a - .06) / .64, A = 1 - u * u; for(let i = 0; i < 6; i++){ const an = (i / 6) * 6.283 + HH(kk, i) * .4, L = (34 + 70 * Math.min(1, u * 2)) * k * (.7 + HH(i, 7) * .5);    // rayos que corren por el suelo
      elBolt(elPts(x, y + 12, x + Math.cos(an) * L * 1.25, y + 12 + Math.sin(an) * L * .42, kk * 5 + i, 4, 9), 4.5, A); } }
  elSparks(x, y, a, 16, 170 * k, .6, 120);
}

// ------------------------------ Golpes cuerpo a cuerpo ------------------------------
function elMeleeBurst(e, a, t0){
  const x = e.x, y = e.y;
  if(a < t0) return; const b = a - t0;
  ctx.save(); ctx.translate(x, y); ctx.scale(EL_SZ, EL_SZ); ctx.translate(-x, -y);
  elStar(x, y, 38 * (1 - clamp01((b - .06) / .2)), 9, b * 3, b < .26 ? 1 : 0);
  elBurst(x, y, b, 0, .4, 7, 28, 62, 5, .85);
  elSparks(x, y, b, 10, 130, .45, 80);
  ctx.restore();
}
function elPunoTrueno(e, a){
  const p = FXP.electrico, q = punchPos(e, a), al = fade(a, .36, .14);
  if(al > 0){ ctx.globalAlpha = al; fist(q.x, q.y, e.ang, p, al); ctx.globalAlpha = 1; }
  elMeleeBurst(e, a, .12);
}
function elColmilloRayo(e, a){
  const o = Object.assign({}, JAW['Colmillo Rayo'], {extra:null}); jaws(e, a, o);
  elMeleeBurst(e, a, .17);
}

// ------------------------------ Carga (mejora) ------------------------------
function elCarga(f, A){
  const b = bodyOf(f), cy = (b.top + b.foot) / 2, rx = b.hw + 12, ry = (b.foot - b.top) / 2 + 4, t = g.t, k = Math.floor(t * 16);
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.translate(f.x, b.foot); ctx.scale(.85, .85); ctx.translate(-f.x, -b.foot);
  elRing(f.x, b.foot, rx + 6 + Math.sin(t * 6) * 2, (rx + 6) * .34, A * .9, 3);
  for(let i = 0; i < 5; i++){ const a0 = t * 4.5 + i * 1.2566, a1 = a0 + .85;
    elBolt(elPts(f.x + Math.cos(a0) * rx, cy + Math.sin(a0) * ry, f.x + Math.cos(a1) * rx, cy + Math.sin(a1) * ry, k * 5 + i, 4, 8), 3.5, A); }
  for(let i = 0; i < 6; i++){ const u = (t * 1.1 + i * .17) % 1, x = f.x + (HH(i, 3) - .5) * (b.hw * 2 + 16), y = b.foot - u * (b.foot - b.top + 20); ctx.globalAlpha = A * (1 - u); ctx.fillStyle = EL_COL.edge; ctx.fillRect(x - 4, y - 4, 8, 8); ctx.fillStyle = i % 2 ? EL_COL.core : EL_COL.main; ctx.fillRect(x - 2.5, y - 2.5, 5, 5); }
  ctx.restore();
}
function elCargaBuff(e, a){ const u = clamp01(a / .9); elCarga(e.fol, 1 - u * u); }
function elCargaAura(f, I, t, type, k){ elCarga(f, .55 + .45 * k); }

// Reducir los impactos al tamaño pedido (EL_SZ)
elImpactruenoHit = elScaleAt(elImpactruenoHit, EL_SZ); elOndaHit = elScaleAt(elOndaHit, EL_SZ); elRayoHit = elScaleAt(elRayoHit, EL_SZ); elTruenoHit = elScaleAt(elTruenoHit, EL_SZ + .06);
