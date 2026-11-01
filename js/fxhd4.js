"use strict";
/* =====================================================================
   ANIMACIONES PROPIAS (HD) de ataques concretos. A diferencia de fxhd3.js (que solo AÑADE detalles a todas), aquí cada ataque se dibuja
   entero con su forma y su movimiento, como hicimos con Lanzallamas e Hidrobomba (fxhd2.js):
     Rayo ......... relámpago en zigzag que cambia 25 veces por segundo, con ramas y chispas
     Trueno ....... bola crepitante; al impactar CAE un rayo del cielo con columna de luz y arcos por el suelo
     Hoja Afilada . ráfaga de hojas que giran en espiral; al impactar dos cortes cruzados y hojas volando
     Bola Sombra .. esfera oscura con remolino, estela de imágenes fantasma y volutas; al impactar se «traga» la luz y revienta
     Roca Afilada . trozos de roca que giran; al impactar salen PILARES de piedra del suelo
     Psíquico ..... orbe con anillos de colores; al impactar anillos giroscópicos alrededor del rival y estallido
     Rayo Hielo ... rayo con cristales que brotan a los lados; al impactar nacen cristales de hielo del suelo
   Con fxhd.on = false se usa la receta de siempre (se guarda en hdOld4). Para añadir otro ataque: una función por parte y una línea en HERO4 (abajo del todo).
   Reglas de dibujo: los proyectiles (FLT) NO están dentro de ctx.save, así que cada función hace su propio save/restore.
   ===================================================================== */
const hd4rand = (n, i) => HH(n, i);
const hdCol4 = (hex) => hdCol(hex);

// ---- Piezas reutilizables ----
// Camino en zigzag (lista de puntos) con ramas. seed cambia con el tiempo para que parpadee.
function hd4BoltPts(x0, y0, x1, y1, seed, amp, n){
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, pts = [[x0, y0]];
  for(let i = 1; i < n; i++){ const u = i / n, o = (hd4rand(seed, i) - .5) * 2 * amp * Math.sin(Math.PI * u) ** .6; pts.push([x0 + dx * u + nx * o, y0 + dy * u + ny * o]); }
  pts.push([x1, y1]); return pts;
}
function hd4Stroke(pts, col, w, a){ ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
// Rayo completo: 3 capas (aura azul, amarillo, núcleo blanco) + ramas
function hd4Lightning(x0, y0, x1, y1, seed, amp, n, A, thick, branches){
  const pts = hd4BoltPts(x0, y0, x1, y1, seed, amp, n);
  hd4Stroke(pts, '#7a4300', 9 * thick, A); hd4Stroke(pts, '#ffd21a', 5.6 * thick, A); hd4Stroke(pts, '#fff6b0', 2.4 * thick, A);                // estilo de los juegos: contorno oscuro, amarillo plano, centro claro
  for(let b = 0; b < branches; b++){ const i = 1 + Math.floor(hd4rand(seed, b + 20) * (pts.length - 2)), [px, py] = pts[i], an = Math.atan2(y1 - y0, x1 - x0) + (hd4rand(seed, b + 30) - .5) * 2.2, L = (18 + hd4rand(seed, b + 40) * 26) * thick;
    const bp = hd4BoltPts(px, py, px + Math.cos(an) * L, py + Math.sin(an) * L, seed * 7 + b, 6, 4);
    hd4Stroke(bp, '#7a4300', 5 * thick, A); hd4Stroke(bp, '#ffd21a', 2.6 * thick, A); }
}
// Polígono relleno con 2 caras (luz/sombra) para rocas y cristales
function hd4Shard(cx, cy, baseW, h, tilt, light, dark, edge, a){
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt); ctx.globalAlpha = a;
  ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(-baseW / 2, 0); ctx.lineTo(baseW * .06, -h); ctx.lineTo(baseW / 2, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = light; ctx.beginPath(); ctx.moveTo(-baseW / 2, 0); ctx.lineTo(baseW * .06, -h); ctx.lineTo(-baseW * .08, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = edge; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-baseW / 2, 0); ctx.lineTo(baseW * .06, -h); ctx.lineTo(baseW / 2, 0); ctx.stroke(); ctx.restore();
}
// Pilares que salen del suelo alrededor de (x,y). u = 0..1 de la animación
function hd4Pillars(x, y, a, k, light, dark, edge, count, maxH, dust){
  const up = clamp01(a / .16), down = clamp01((a - .62) / .3), ease = 1 - Math.pow(1 - up, 3);
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  for(let i = 0; i < count; i++){
    const ang = (i / count) * 6.283 + hd4rand(i, 2) * .4, rad = i === 0 ? 0 : (22 + hd4rand(i, 4) * 26) * k, px = x + Math.cos(ang) * rad * 1.15, py = y + 12 + Math.sin(ang) * rad * .45;
    const dl = hd4rand(i, 6) * .07, v = clamp01((a - dl) / .16), e = 1 - Math.pow(1 - v, 3), h = (i === 0 ? maxH * 1.2 : maxH * (.55 + hd4rand(i, 8) * .5)) * e * (1 - down * down), w = (10 + hd4rand(i, 10) * 8) * k * (i === 0 ? 1.4 : 1);
    if(h < 1) continue; hd4Shard(px, py, w, h, (hd4rand(i, 12) - .5) * .4, light, dark, edge, 1 - down * .6);
  }
  if(dust) for(let i = 0; i < 10; i++){ const t = a - hd4rand(i, 3) * .06; if(t < 0 || t > .7) continue; const u = t / .7, dx = (hd4rand(i, 5) - .5) * 90 * k; hdPut(hdBlob(176, 150, 110), x + dx * (.3 + u), y + 10 - u * 22, (8 + 14 * u) * k, (1 - u) * .38); }
  ctx.restore();
}

// ---------------------------------------------------------------------
// RAYO (chorro): relámpago largo, cambia 25 veces por segundo
// ---------------------------------------------------------------------
// (Rayo y Trueno se dibujan ahora en fxelec.js)

// ---------------------------------------------------------------------
// HOJA AFILADA: ráfaga de hojas en espiral + dos cortes cruzados
// ---------------------------------------------------------------------
function hdLeafShape(x, y, r, rot, a, light, dark){                    // hoja con nervio central y dos tonos
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = Math.min(1, a);
  ctx.fillStyle = dark; ctx.strokeStyle = '#17501a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-r, 0); ctx.quadraticCurveTo(0, -r * .62, r, 0); ctx.quadraticCurveTo(0, r * .62, -r, 0); ctx.fill(); ctx.stroke();
  ctx.fillStyle = light; ctx.beginPath(); ctx.moveTo(-r, 0); ctx.quadraticCurveTo(0, -r * .62, r, 0); ctx.quadraticCurveTo(0, -r * .1, -r, 0); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-r * .85, 0); ctx.lineTo(r * .9, 0); ctx.stroke(); ctx.restore();
}
function hdHojaFlight(s, a, an){
  ctx.save(); const t = g.t, ca = Math.cos(an), sa = Math.sin(an);
  ctx.globalCompositeOperation = 'lighter'; hdPut(hdBlob(120, 230, 90), s.x, s.y, 34, .3);
  for(let i = 0; i < 14; i++){ const u = hdFract(i * .31 + t * 2.4), d = u * 70, o = Math.sin(i * 3 + t * 7) * (6 + u * 10); hdPut(hdBlob(150, 240, 110), s.x - ca * d - sa * o, s.y - sa * d + ca * o, 3 + 4 * (1 - u), (1 - u) * .55); }   // estela de brillos
  ctx.globalCompositeOperation = 'source-over';
  const N = 6; for(let i = 0; i < N; i++){                              // espiral: las hojas más atrasadas giran más abierto
    const lag = (i % 3) * 14, th = t * 11 + i * 6.283 / N, rad = 11 + 5 * Math.sin(t * 6 + i), bx = s.x - ca * lag, by = s.y - sa * lag, X = bx - sa * Math.cos(th) * rad, Y = by + ca * Math.cos(th) * rad, depth = Math.sin(th);
    hdLeafShape(X, Y, 9 + 2 * depth, an + th * 1.3, .95, i % 2 ? '#b8f58a' : '#8fe05c', i % 2 ? '#3f9a35' : '#2f8a2c'); }
  ctx.restore();
}
function hdHojaHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y; if(!e.hdDec){ e.hdDec = 1; hdDecal(x, y, 'planta', k); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for(let c = 0; c < 2; c++){ const v = clamp01((a - c * .07) / .22); if(v <= 0) continue; const L = 62 * k * (1 - Math.pow(1 - v, 3)), fade = Math.max(0, 1 - (a - c * .07) / .4), an = (c ? .7 : -.7) - .1;   // dos cortes cruzados
    ctx.save(); ctx.translate(x, y); ctx.rotate(an); ctx.globalAlpha = fade; const gr = ctx.createLinearGradient(-L, 0, L, 0); gr.addColorStop(0, 'rgba(200,255,160,0)'); gr.addColorStop(.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(120,230,90,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(-L, 0); ctx.quadraticCurveTo(0, -7 * k, L, 0); ctx.quadraticCurveTo(0, 2, -L, 0); ctx.fill(); ctx.restore(); }
  hdPut(hdBlob(130, 230, 90), x, y, (18 + 18 * a * 3) * k, Math.max(0, 1 - a / .5) * .5);
  ctx.globalCompositeOperation = 'source-over';
  for(let j = 0; j < 16; j++){ const an = -Math.PI * (.05 + .9 * hd4rand(j, 6)), v = 60 + hd4rand(j, 8) * 170, tt = a, X = x + Math.cos(an) * v * tt, Y = y - 4 + Math.sin(an) * v * tt + 240 * tt * tt;
    hdLeafShape(X, Y, 5 + hd4rand(j, 3) * 4, tt * (8 + hd4rand(j, 9) * 8) + j, Math.max(0, 1 - tt / (.55 + hd4rand(j, 1) * .3)), j % 2 ? '#b8f58a' : '#8fe05c', '#3f9a35'); }
  ctx.restore();
}

// ---------------------------------------------------------------------
// BOLA SOMBRA: esfera oscura con remolino y estela fantasma
// ---------------------------------------------------------------------
function hdSombraFlight(s, a, an){
  ctx.save(); const t = g.t, ca = Math.cos(an), sa = Math.sin(an), R_ = 15 + 1.2 * Math.sin(t * 9);
  ctx.globalCompositeOperation = 'source-over';
  for(let i = 6; i >= 1; i--){ const d = i * 11, wob = Math.sin(t * 8 + i) * 4; hdPut(hdBlob(40, 14, 78), s.x - ca * d - sa * wob, s.y - sa * d + ca * wob, R_ * (1 - i * .09), .5 * (1 - i / 7)); }   // imágenes fantasma
  hdPut(hdBlob(26, 8, 52), s.x, s.y, R_ * 1.6, .35); ctx.globalAlpha = 1; ctx.fillStyle = '#2a0f55'; ctx.strokeStyle = '#08020f'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(s.x, s.y, R_, 0, 6.283); ctx.fill(); ctx.stroke();   // esfera con contorno negro
  hdPut(hdBlob(18, 6, 40), s.x, s.y, R_ * .9, .9);
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for(let i = 0; i < 5; i++){ const th = t * (6 + i) * (i % 2 ? -1 : 1) + i * 1.3, rr = R_ * (.28 + .13 * i); ctx.strokeStyle = i % 2 ? 'rgba(235,150,255,.85)' : 'rgba(150,90,255,.95)'; ctx.lineWidth = 1.6 + (i % 2); ctx.globalAlpha = .9 - i * .1;
    ctx.beginPath(); ctx.arc(s.x, s.y, rr, th, th + 1.2 + i * .15); ctx.stroke(); }                          // remolino interior (5 espirales)
  hdPut(hdBlob(170, 90, 255), s.x, s.y, R_ * 2.1, .28);
  hdPut(hdBlob(255, 255, 255), s.x - 5, s.y - 6, 4, .55);                                              // brillo
  if(Math.sin(t * 3.1) > .55){ ctx.fillStyle = '#e9b8ff'; ctx.globalAlpha = .9; ctx.beginPath(); ctx.ellipse(s.x - 4 + ca * 4, s.y - 1 + sa * 4, 2, 3, 0, 0, 6.283); ctx.ellipse(s.x + 4 + ca * 4, s.y - 1 + sa * 4, 2, 3, 0, 0, 6.283); ctx.fill(); }   // ojos que parpadean
  for(let i = 0; i < 5; i++){ const th = t * 4 + i * 1.257, rr = R_ * 1.5 + 4 * Math.sin(t * 5 + i); hdPut(hdBlob(190, 110, 255), s.x + Math.cos(th) * rr, s.y + Math.sin(th) * rr, 4, .55); }
  ctx.restore();
}
function hdSombraHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y; if(!e.hdDec){ e.hdDec = 1; hdDecal(x, y, 'fantasma', k * 1.2); }
  ctx.save();
  const imp = clamp01(a / .14), ex = clamp01((a - .14) / .6), out = 1 - Math.pow(1 - ex, 3);
  ctx.globalCompositeOperation = 'source-over';
  if(a < .14) hdPut(hdBlob(16, 5, 34), x, y, (34 - 20 * imp) * k, .95);              // se contrae (se traga la luz)
  else { hdPut(hdBlob(30, 10, 60), x, y, (16 + 40 * out) * k, (1 - ex) * .85);
    for(let j = 0; j < 8; j++){ const an = j * .785 + hd4rand(j, 2) * .4, d = (10 + 48 * out) * k * (.6 + hd4rand(j, 4) * .6); hdPut(hdBlob(26, 8, 50), x + Math.cos(an) * d, y + Math.sin(an) * d * .8, (9 + 6 * out) * k, (1 - ex) * .65); } }
  ctx.globalCompositeOperation = 'lighter';
  if(a >= .14){ ctx.lineWidth = 3; for(let r = 0; r < 2; r++){ const v = clamp01((a - .14 - r * .08) / .5); if(v <= 0 || v >= 1) continue; ctx.globalAlpha = (1 - v) * .9; ctx.strokeStyle = r ? '#e3a6ff' : '#9a64ff';
      ctx.beginPath(); ctx.ellipse(x, y, (8 + 62 * k) * (1 - Math.pow(1 - v, 2)), (6 + 44 * k) * (1 - Math.pow(1 - v, 2)), 0, 0, 6.283); ctx.stroke(); }
    hdPut(hdBlob(190, 110, 255), x, y, (20 + 14 * out) * k, (1 - ex) * .5);
    for(let j = 0; j < 7; j++){ const an = j * .9 + hd4rand(j, 6), d = (14 + 60 * out) * k, X = x + Math.cos(an + out * 1.4) * d, Y = y + Math.sin(an + out * 1.4) * d * .8 - ex * 20;   // volutas que giran
      hdPut(hdBlob(210, 130, 255), X, Y, 5, (1 - ex) * .8); } }
  ctx.restore();
}

// ---------------------------------------------------------------------
// ROCA AFILADA: trozos girando + pilares de piedra
// ---------------------------------------------------------------------
function hdRocaFlight(s, a, an){
  ctx.save(); const t = g.t, ca = Math.cos(an), sa = Math.sin(an);
  ctx.globalCompositeOperation = 'source-over';
  for(let i = 0; i < 8; i++){ const u = hdFract(i * .27 + t * 1.8), d = u * 60; hdPut(hdBlob(170, 150, 120), s.x - ca * d + (hd4rand(i, 3) - .5) * 14, s.y - sa * d + (hd4rand(i, 4) - .5) * 14 + u * 8, 4 + 6 * u, (1 - u) * .4); }   // polvo
  hdPut(hdBlob(120, 100, 70), s.x, s.y, 20, .35);
  const N = 4; for(let i = 0; i < N; i++){ const th = t * 6 + i * 6.283 / N, rad = i === 0 ? 0 : 15, X = s.x + Math.cos(th) * rad, Y = s.y + Math.sin(th) * rad * .8, sz = i === 0 ? 14 : 8;
    ctx.save(); ctx.translate(X, Y); ctx.rotate(t * 5 + i * 1.7); ctx.fillStyle = '#8a6535'; ctx.beginPath(); ctx.moveTo(0, -sz); ctx.lineTo(sz * .7, -sz * .1); ctx.lineTo(sz * .35, sz * .85); ctx.lineTo(-sz * .6, sz * .5); ctx.lineTo(-sz * .75, -sz * .3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e6c88a'; ctx.beginPath(); ctx.moveTo(0, -sz); ctx.lineTo(sz * .7, -sz * .1); ctx.lineTo(0, sz * .1); ctx.lineTo(-sz * .75, -sz * .3); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#1e150a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -sz); ctx.lineTo(sz * .7, -sz * .1); ctx.lineTo(sz * .35, sz * .85); ctx.lineTo(-sz * .6, sz * .5); ctx.lineTo(-sz * .75, -sz * .3); ctx.closePath(); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
function hdRocaHit(e, a){
  const k = e.k || 1; if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'roca', k * 1.3); }
  hd4Pillars(e.x, e.y, a, k, '#a89a74', '#5e5038', '#241c10', 7, 70, true);
  ctx.save(); ctx.fillStyle = '#b3a37a'; for(let j = 0; j < 12; j++){ const an = -Math.PI * (.1 + .8 * hd4rand(j, 6)), v = 90 + hd4rand(j, 8) * 160, tt = a; ctx.globalAlpha = Math.max(0, 1 - tt / .7); ctx.save(); ctx.translate(e.x + Math.cos(an) * v * tt, e.y + Math.sin(an) * v * tt + 380 * tt * tt); ctx.rotate(tt * 9 + j); const s = 2 + hd4rand(j, 3) * 3; ctx.fillRect(-s, -s, s * 2, s * 2); ctx.restore(); }
  ctx.restore();
}

// ---------------------------------------------------------------------
// PSÍQUICO: orbe con anillos + giroscopio alrededor del rival
// ---------------------------------------------------------------------
function hdPsiFlight(s, a, an){
  ctx.save(); const t = g.t; ctx.globalCompositeOperation = 'lighter';
  hdPut(hdBlob(255, 60, 170), s.x, s.y, 34, .3); hdPut(hdBlob(255, 110, 200), s.x, s.y, 17, .6); hdPut(hdBlob(255, 220, 245), s.x, s.y, 6, .6);
  for(let r = 0; r < 3; r++){ const v = hdFract(t * 1.6 + r / 3); ctx.globalAlpha = (1 - v) * .85; ctx.lineWidth = 2.2; ctx.strokeStyle = r % 2 ? '#7de3ff' : '#ff8fd0'; ctx.beginPath(); ctx.ellipse(s.x, s.y, 10 + 26 * v, (10 + 26 * v) * .5, an + Math.PI / 2, 0, 6.283); ctx.stroke(); }   // ondas hacia delante
  for(let i = 0; i < 8; i++){ const th = t * 6 + i * .785, rr = 16 + 5 * Math.sin(t * 4 + i * 2); hdPut(hdBlob(i % 2 ? 125 : 255, i % 2 ? 227 : 120, 255), s.x + Math.cos(th) * rr, s.y + Math.sin(th) * rr * .8, 3.5, .8); }
  ctx.restore();
}
function hdPsiHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 4; if(!e.hdDec){ e.hdDec = 1; hdDecal(x, y + 16, 'fantasma', k * .9); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const u = clamp01(a / .85), grow = 1 - Math.pow(1 - clamp01(a / .2), 3), fade = a < .55 ? 1 : Math.max(0, 1 - (a - .55) / .3);
  for(let r = 0; r < 3; r++){ const tilt = r * 1.05, spin = a * (7 + r * 2) * (r % 2 ? -1 : 1), R_ = (30 + 14 * r) * k * grow; ctx.strokeStyle = ['#ff8fd0', '#7de3ff', '#ffe066'][r]; ctx.lineWidth = 3 - r * .5; ctx.globalAlpha = fade * .9;
    ctx.beginPath(); ctx.ellipse(x, y, R_, R_ * (.32 + .25 * Math.abs(Math.sin(spin))), tilt + spin * .3, 0, 6.283); ctx.stroke();
    const th = spin * 2; hdPut(hdBlob(255, 255, 255), x + Math.cos(th) * R_ * Math.cos(tilt + spin * .3), y + Math.sin(th) * R_ * .45, 4.5, fade); }                  // la perla que recorre cada anillo
  hdPut(hdBlob(255, 120, 200), x, y, (20 + 14 * grow) * k, fade * .35);
  if(a > .55){ const v = clamp01((a - .55) / .3); ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = (1 - v) * .9; ctx.beginPath(); ctx.ellipse(x, y, (30 + 90 * v) * k, (12 + 40 * v) * k, 0, 0, 6.283); ctx.stroke();      // estallido final
    hdPut(hdBlob(255, 200, 235), x, y, (24 + 40 * v) * k, (1 - v) * .5); }
  ctx.restore();
}

// ---------------------------------------------------------------------
// RAYO HIELO (chorro): rayo helado con cristales que brotan + cristales del suelo en el impacto
// ---------------------------------------------------------------------
function hdRayoHielo(e){
  const G = sg(e, 300); if(G.len < 8) return;
  const A = G.al, t = g.t, ca = Math.cos(G.an), sa = Math.sin(G.an), N = Math.max(10, Math.round(G.len / 8));
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  for(let i = 0; i < 12; i++){ const u = hdFract(i * .27 + t * .8), [x, y] = pt(G, u, (hd4rand(i, 2) - .5) * 26); hdPut(hdBlob(150, 200, 235), x, y - u * 8, 10 + 14 * u, A * .2 * (1 - u * .4)); }   // niebla helada
  ctx.globalCompositeOperation = 'lighter';
  for(let i = 0; i < N; i++){ const u = i / N, [x, y] = pt(G, u, Math.sin(i * .7 - t * 9) * 2.2), w = 8 + 10 * u; hdPut(hdBlob(40, 130, 255), x, y, w * 1.7, A * .4); hdPut(hdBlob(130, 205, 255), x, y, w * .85, A * .65); hdPut(hdBlob(235, 250, 255), x, y, w * .35, A * .7); }
  ctx.globalCompositeOperation = 'source-over';
  const C = Math.floor(G.len / 20); for(let i = 0; i < C; i++){ const u = (i + .5) / C, side = i % 2 ? 1 : -1, grow = clamp01((G.len / 300) * 3 - (1 - u) * .6 + .5), [x, y] = pt(G, u, 0), L = (10 + hd4rand(i, 3) * 12) * (.5 + u * .7) * grow;   // cristales laterales
    const tx = x + G.px * side * L * 1.6, ty = y + G.py * side * L * 1.6; ctx.globalAlpha = A * .95; ctx.fillStyle = '#d6f4ff'; ctx.strokeStyle = '#4aa8ff'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x - ca * 4, y - sa * 4); ctx.lineTo(tx, ty); ctx.lineTo(x + ca * 4, y + sa * 4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.globalCompositeOperation = 'lighter';
  hdPut(hdBlob(60, 150, 255), G.x1, G.y1, 30, A * .45); hdPut(hdBlob(220, 245, 255), G.x1, G.y1, 10, A * .6);
  ctx.fillStyle = '#ffffff'; for(let j = 0; j < 10; j++){ const u = hdFract(j * .41 + t * 1.5), [x, y] = pt(G, .3 + u * .7, (hd4rand(j, 5) - .5) * 40); ctx.globalAlpha = A * (1 - u); hdStar4(x, y - u * 8, 2.5 + 2 * hd4rand(j, 2), A * (1 - u)); }
  ctx.restore();
}
function hdHieloHit(e, a){
  const k = e.k || 1; if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'hielo', k * 1.3); }
  hd4Pillars(e.x, e.y, a, k, '#e9fbff', '#6fc0f0', '#2b7fc4', 8, 62, false);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const u = clamp01(a / .9);
  hdPut(hdBlob(150, 215, 255), e.x, e.y, (20 + 26 * u) * k, (1 - u) * .5); ctx.fillStyle = '#ffffff';
  for(let j = 0; j < 12; j++){ const an = j * .52 + hd4rand(j, 6), v = 40 + hd4rand(j, 8) * 90; hdStar4(e.x + Math.cos(an) * v * a, e.y + Math.sin(an) * v * a * .8 - a * 20, 3 + hd4rand(j, 3) * 3, Math.max(0, 1 - a / .75)); }
  ctx.restore();
}

// ---------------------------------------------------------------------
// SURF (MT): ola ancha que avanza por el campo (como la del vídeo de referencia): banda de agua con espuma, cresta curva delante,
// líneas de corriente dentro y gotas que saltan. Es más ANCHA que alta; el centro va más adelantado que los bordes (frente convexo).
// ---------------------------------------------------------------------
const hdSurfGeo = e => {                                                  // geometría de la ola: el frente va 34 px por delante del Pokémon (él va montado en la parte delantera)
  const G = sg(e, 250); if(G.len < 10) return null; const ca = Math.cos(G.an), sa = Math.sin(G.an);
  G.x1 += ca * 34; G.y1 += sa * 34; G.len += 34; G.ca = ca; G.sa = sa; G.WH = 100; G.grow = clamp01(G.len / 90); G.len = Math.max(G.len, 0);
  return G;
};
// SURF como en los juegos: una pared de agua formada por BANDAS (azul oscuro → azul → celeste → blanco). El borde delantero de cada banda son ONDAS
// (festones) de espuma con contorno azul oscuro. Todo se dibuja en un sistema de coordenadas girado: x = hacia delante (0 = frente), y = a lo ancho.
const HD_SURF_BANDS = [{d:158, c:'#1b57b3'}, {d:122, c:'#2b80d9'}, {d:86, c:'#4fb0f0'}, {d:50, c:'#9fe0ff'}, {d:14, c:'#ffffff'}];
function hdScallops(W, step, d, t, k){                                    // camino de los festones de un borde (en coordenadas locales)
  const n = Math.ceil(2 * W / step), f = v => -Math.pow(Math.abs(v) / W, 1.7) * 24;
  for(let i = 0; i < n; i++){ const vc = -W + step * (i + .5), xc = -d + f(vc) + Math.sin(t * 7 + i * 1.3 + k) * 2.2, r = step / 2 * (1 + .1 * Math.sin(t * 9 + i * 2 + k)); ctx.arc(xc, vc, r, -Math.PI / 2, Math.PI / 2, false); }
}
function hdSurfDraw(e, top){
  const G = hdSurfGeo(e); if(!G) return; const t = g.t, A = G.al, W = G.WH * G.grow, step = 22, L = G.len;
  ctx.save(); ctx.translate(G.x1, G.y1); ctx.rotate(G.an); ctx.globalCompositeOperation = 'source-over'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if(!top){
    ctx.fillStyle = 'rgba(10,40,110,.18)'; ctx.beginPath(); ctx.ellipse(-L / 2, 12, L / 2, W * .8, 0, 0, 6.283); ctx.fill();   // sombra en el suelo
    for(let bi = HD_SURF_BANDS.length - 1; bi >= 0; bi--){ const B = HD_SURF_BANDS[bi]; if(B.d > L - 8) continue;       // de delante hacia atrás: los festones de cada banda tapan el final de la de delante
      const last = bi === 0 || HD_SURF_BANDS[bi - 1].d > L - 8, rear = last ? Math.max(L, B.d + 40) : B.d + 36;
      ctx.globalAlpha = A; if(last){ const gr = ctx.createLinearGradient(-B.d, 0, -rear, 0); gr.addColorStop(0, B.c); gr.addColorStop(.55, B.c); gr.addColorStop(1, 'rgba(27,87,179,0)'); ctx.fillStyle = gr; } else ctx.fillStyle = B.c; ctx.beginPath(); ctx.moveTo(-rear, -W); ctx.lineTo(-B.d, -W); hdScallops(W, step, B.d, t, bi * 2); ctx.lineTo(-rear, W); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#0b3a8c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-B.d, -W); hdScallops(W, step, B.d, t, bi * 2); ctx.stroke(); }       // contorno de los festones
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2;                                    // rayitas de corriente
    for(let q = 0; q < 14; q++){ const x = -hdFract(hd4rand(q, 2) + t * 1.2) * L, y = (hd4rand(q, 5) - .5) * 1.7 * W; ctx.globalAlpha = A * .8 * Math.sin(Math.PI * clamp01(-x / L)); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 13, y); ctx.stroke(); }
  } else {
    ctx.globalAlpha = A; [['#0b3a8c', 6], ['#ffffff', 3]].forEach(([c, lw]) => { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(0, -W); hdScallops(W, step, 4, t, 9); ctx.stroke(); });   // festón de espuma sobre todo lo demás
    for(let j = 0; j < 20; j++){ const u = hdFract(j * .37 + t * 1.6), X = 6 + u * 36, Y = (hd4rand(j, 8) - .5) * 1.9 * W - Math.sin(u * 3.14) * 18;      // gotas con contorno
      ctx.globalAlpha = A * (1 - u * .7); ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#0b3a8c'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(X, Y, 2 + hd4rand(j, 5) * 2.2, 0, 6.283); ctx.fill(); ctx.stroke(); }
  }
  ctx.restore();
}
const hdSurfBody = e => hdSurfDraw(e, false), hdSurf = e => hdSurfDraw(e, true);
// Se llama desde fxhdGround (fxhd3.js): dibuja el cuerpo de todas las olas de Surf que haya (debajo de los Pokémon)
function hdSurfUnder(){ if(!fxhd.on || !g) return; for(const e of fx.list) if(e.kind === 'stream' && e.name === 'Surf' && !e.dead && e.t >= (e.delay || 0)){ try{ hdSurfBody(e); }catch(err){} } }
function hdSurfHit(e, a){
  const k = (e.k || 1) * 1.2, x = e.x, y = e.y, ca = Math.cos(e.ang || 0), sa = Math.sin(e.ang || 0); if(!e.hdDec){ e.hdDec = 1; hdDecal(x, y, 'agua', k * 1.4); }
  hdSplash(Object.assign({}, e, {k}), a);
  ctx.save(); const u = clamp01(a / .6), out = 1 - Math.pow(1 - u, 2);                     // la ola «lava» al rival y sigue de largo (festón de espuma que avanza)
  if(u < 1){ ctx.translate(x, y + 6); ctx.rotate(e.ang || 0); ctx.globalAlpha = 1 - u; ctx.lineJoin = 'round'; [['#0b3a8c', 6], ['#ffffff', 3]].forEach(([c, lw]) => { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(out * 110, -80); hdScallops(80, 22, -out * 110, g.t, 3); ctx.stroke(); }); }
  ctx.restore();
}


// ---------------------------------------------------------------------
// LLAMARADA (Fire Blast): como en los juegos. Una bola de fuego grande con cola de llamas que, al chocar, estalla en una llama con forma
// del kanji «大» (el símbolo del Daimonji). Todo plano, con contorno rojo oscuro y 4 capas (rojo, naranja, amarillo, blanco).
// ---------------------------------------------------------------------
const HD_FIRE = ['#4a0c00', '#e8380d', '#ff9a1f', '#ffe04a', '#fff8d6'];      // contorno, rojo, naranja, amarillo, centro
// Un «bulto» de llama: círculo con contorno. Se pintan primero todos los contornos y luego los rellenos, para que se fundan en una sola forma
function hd4Blobs(list, layers){
  layers.forEach(([grow, col]) => { ctx.fillStyle = col; list.forEach(b => { ctx.beginPath(); ctx.arc(b[0], b[1], Math.max(.5, b[2] * grow + (grow === 1 ? 0 : 0)), 0, 6.283); ctx.fill(); }); });
}
function hd4FireLayers(list){
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  list.forEach(b => { ctx.fillStyle = HD_FIRE[0]; ctx.beginPath(); ctx.arc(b[0], b[1], b[2] + 3, 0, 6.283); ctx.fill(); });
  [[1, HD_FIRE[1]], [.8, HD_FIRE[2]], [.58, HD_FIRE[3]], [.32, HD_FIRE[4]]].forEach(([k, col]) => { ctx.fillStyle = col; list.forEach(b => { ctx.beginPath(); ctx.arc(b[0], b[1] + (1 - k) * b[2] * .12, b[2] * k, 0, 6.283); ctx.fill(); }); });
  ctx.restore();
}
// Lengua de llama (gota con la punta hacia 'ang')
function hd4Tongue(x, y, len, w, ang, col, edge){
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.beginPath(); ctx.moveTo(len, 0); ctx.quadraticCurveTo(len * .35, -w, -w * .4, -w * .5); ctx.arc(-w * .4, 0, w * .5, -Math.PI / 2, Math.PI / 2, true); ctx.quadraticCurveTo(len * .35, w, len, 0); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); if(edge){ ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.stroke(); } ctx.restore();
}
function hdLlamaFlight(s, a, an){
  const t = g.t, ca = Math.cos(an), sa = Math.sin(an), k = Math.floor(t * 14);
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // cola: bultos que se hacen pequeños hacia atrás y se mueven como llamas
  const tail = []; for(let i = 1; i <= 7; i++){ const d = i * 9, r = 15 - i * 1.6 + hd4rand(i, k) * 2; tail.push([s.x - ca * d + (hd4rand(i, k + 2) - .5) * 7 + (-sa) * Math.sin(t * 18 + i) * 3, s.y - sa * d + (hd4rand(i, k + 4) - .5) * 7 + ca * Math.sin(t * 18 + i) * 3, Math.max(3, r)]); }
  hd4FireLayers(tail.reverse());
  // lenguas que salen hacia atrás
  for(let i = 0; i < 5; i++){ const off = (i - 2) * 6, an2 = an + Math.PI + (hd4rand(i, k + 6) - .5) * .7; hd4Tongue(s.x + (-sa) * off - ca * 6, s.y + ca * off - sa * 6, 26 + hd4rand(i, k + 8) * 18, 7, an2, HD_FIRE[2], HD_FIRE[0]); }
  // bola principal (más grande que antes)
  const R = 17 + Math.sin(t * 22) * 1;
  hd4FireLayers([[s.x, s.y, R]]);
  // brasas sueltas
  for(let i = 0; i < 6; i++){ const u = hdFract(t * 2.2 + i * .17), d = 18 + u * 60; ctx.globalAlpha = 1 - u; ctx.fillStyle = i % 2 ? HD_FIRE[3] : HD_FIRE[2]; const px = s.x - ca * d + (hd4rand(i, 9) - .5) * 30, py = s.y - sa * d + (hd4rand(i, 10) - .5) * 30 - u * 8; ctx.fillRect(px - 2, py - 2, 4, 4); }
  ctx.restore();
}
// Los 3 trazos de «大» (coordenadas relativas, mitad de ancho 1): barra, trazo hacia abajo-izquierda, trazo hacia abajo-derecha
const HD_DAI = [[[-1.05, -.34], [1.05, -.34]], [[-.02, -.62], [-.1, -.34], [-.95, .95]], [[.02, -.34], [.3, .3], [.95, .95]]];
function hdLlamaHit(e, a){
  const k = e.k || 1, U = 62 * k, cx = e.x, cy = e.y - 8, lock = k >= 0;
  if(!e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, 'fuego', k * 1.2); }
  const grow = n => clamp01((a - n * .07) / .22), ease3 = v => 1 - Math.pow(1 - v, 3);
  const life = a < .78 ? 1 : Math.max(0, 1 - (a - .78) / .3);                       // se mantiene y se apaga
  const t = g.t, kk = Math.floor(t * 16);
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  // bola de fuego central que estalla
  if(a < .3){ const r = (14 + 46 * ease3(a / .3)) * k * (1 - Math.max(0, (a - .18) / .12)); hd4FireLayers([[cx, cy, Math.max(2, r)]]); }
  if(life > 0){
    const blobs = [], tong = [];
    HD_DAI.forEach((st, si) => {
      const pr = ease3(grow(si)); if(pr <= 0) return;
      // puntos a lo largo del trazo (polilínea) hasta el progreso pr
      const segs = []; let L = 0; for(let i = 1; i < st.length; i++){ const l = Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]); segs.push(l); L += l; }
      const N = Math.ceil(L * 9);
      for(let j = 0; j <= N; j++){ const u = j / N; if(u > pr) break; let d = u * L, i = 0; while(i < segs.length - 1 && d > segs[i]){ d -= segs[i]; i++; }
        const q = segs[i] ? d / segs[i] : 0, x = st[i][0] + (st[i + 1][0] - st[i][0]) * q, y = st[i][1] + (st[i + 1][1] - st[i][1]) * q, nx = hd4rand(j + si * 40, kk) - .5, ny = hd4rand(j + si * 40, kk + 5) - .5,
          taper = .75 + .25 * Math.sin(Math.PI * u), r = (13 + 4 * hd4rand(j, kk + 3)) * k * taper * life;
        blobs.push([cx + x * U + nx * 5, cy + y * U + ny * 5, r]);
        if(j % 3 === 0) tong.push([cx + x * U + nx * 6, cy + y * U - r * .5, (18 + hd4rand(j, kk + 7) * 18) * k * life, 7 * k, -Math.PI / 2 + (nx) * 1.2]);
      }
    });
    tong.forEach(([x, y, L, w, an]) => hd4Tongue(x, y, L, w, an, HD_FIRE[1], HD_FIRE[0]));            // llamas que suben por encima
    hd4FireLayers(blobs);
    tong.forEach(([x, y, L, w, an], i) => { if(i % 2 === 0) hd4Tongue(x, y + 2, L * .6, w * .55, an, HD_FIRE[3], null); });
  }
  // chispas / brasas que saltan
  for(let i = 0; i < 18; i++){ const d0 = hd4rand(i, 20) * .06, tt = a - d0; if(tt < 0 || tt > .8) continue; const an = hd4rand(i, 21) * 6.283, v = 70 + hd4rand(i, 22) * 150; ctx.globalAlpha = 1 - tt / .8; ctx.fillStyle = i % 3 ? HD_FIRE[3] : HD_FIRE[2]; const sz = 3 + hd4rand(i, 23) * 3; ctx.fillRect(cx + Math.cos(an) * v * tt * k - sz / 2, cy + Math.sin(an) * v * tt * k * .8 - 60 * tt * tt * 0 - sz / 2, sz, sz); }
  // humo oscuro al final
  if(a > .55){ const u = clamp01((a - .55) / .5); for(let i = 0; i < 5; i++){ ctx.globalAlpha = (1 - u) * .45; ctx.fillStyle = '#3a2a26'; ctx.beginPath(); ctx.arc(cx + (i - 2) * 26 * k + Math.sin(t * 3 + i) * 4, cy - 10 - u * (30 + i * 6), (10 + 8 * u) * k, 0, 6.283); ctx.fill(); } }
  ctx.restore();
}

hdLlamaHit = tpScaleAt(hdLlamaHit, .8);                       // un poco más pequeño (tpScaleAt está en fxtipos.js)

// ---------------------------------------------------------------------
// Se enganchan: con HD apagado se ve lo de siempre
// ---------------------------------------------------------------------
const HERO4 = {
  'Ascuas':        {flt:hgAscuasFlight, imp:hgAscuasHit, sc:1, idur:.8},
  'Hipnosis':      {flt:hgHipnosisFlight, imp:hgHipnosisHit, sc:1.25, idur:1.1},
  'Hiperrayo':     {str:fvHiperrayo, flt:() => {}, imp:fvHiperrayoHit, idur:.2},
  'Terremoto':     {str:fvTerremoto, flt:() => {}, imp:fvTerremotoHit, idur:1},
  'Cometa Draco':  {flt:fvCometaFlight, imp:fvCometaHit, sc:1, idur:1.1},
  'Onda Certera':  {flt:fvOndaFlight, imp:fvOndaHit, sc:1, idur:.9},
  'Lanzamugre':    {flt:fvLanzamugreFlight, imp:fvLanzamugreHit, sc:1, idur:1},
  'Megacuerno':    {flt:fvMegaFlight, imp:fvMegaHit, sc:1, idur:.9},
  'Pulso Noche':   {flt:fvNocheFlight, imp:fvNocheHit, sc:1, idur:.9},
  'Foco Resplandor':{flt:fvFocoFlight, imp:fvFocoHit, sc:1, idur:.9},
  'Fuerza Lunar':  {flt:fvLunaFlight, imp:fvLunaHit, sc:1, idur:1},
  'Vendaval':      {flt:hgVendavalFlight, imp:hgVendavalHit, sc:1, idur:1.3},
  'Pájaro Osado':  {flt:hgBraveFlight, imp:hgBraveHit, sc:1, idur:1},
  'Envite Ígneo':  {flt:hgEnviteFlight, imp:hgEnviteHit, sc:1, idur:1},
  'Puño Fuego':    {mel:tpPuno('fuego')},
  'Colmillo Ígneo':{mel:tpColmillo('Colmillo Ígneo', 'fuego')},
  'Pistola Agua':  {str:tpPistolaStream, flt:() => {}, imp:tpPistolaHit, idur:.8},
  'Hidropulso':    {flt:hgHidropulsoFlight, imp:hgHidropulsoHit, sc:1, idur:.9},
  'Hidrobomba':    {str:hgHidrobomba, flt:() => {}, imp:tpHidroHit, idur:.9},
  'Acua Cola':     {mel:tpAcuaCola},
  'Látigo Cepa':   {mel:tpLatigoCepa},
  'Rayo Solar':    {str:tpRayoSolar, flt:() => {}, imp:tpRayoSolarHit, idur:.8},
  'Nieve Polvo':   {str:tpNieveStream, flt:() => {}, imp:tpNieveHit, idur:.9},
  'Ventisca':      {flt:tpVentiscaFlight, imp:tpVentiscaHit, sc:.72, idur:1},
  'Puño Hielo':    {mel:tpPuno('hielo')},
  'Colmillo Hielo':{mel:tpColmillo('Colmillo Hielo', 'hielo')},
  'Rayo':          {str:elRayo, imp:elRayoHit, idur:.7},
  'Impactrueno':   {flt:elImpactruenoFlight, imp:elImpactruenoHit, sc:.95, idur:.7},
  'Onda Trueno':   {flt:elOndaFlight, imp:elOndaHit, sc:.95, idur:.85},
  'Puño Trueno':   {mel:elPunoTrueno},
  'Colmillo Rayo': {mel:elColmilloRayo},
  'Carga':         {buf:elCargaBuff, aura:elCargaAura},
  'Trueno':        {flt:elTruenoFlight, imp:elTruenoHit, sc:.8, idur:1},
  'Hoja Afilada':  {flt:hdHojaFlight, imp:hdHojaHit},
  'Bola Sombra':   {flt:hdSombraFlight, imp:hdSombraHit},
  'Roca Afilada':  {flt:hdRocaFlight, imp:hdRocaHit},
  'Psíquico':      {flt:hdPsiFlight, imp:hdPsiHit},
  'Llamarada':     {flt:hdLlamaFlight, imp:hdLlamaHit, sc:.85, idur:1.1}
};
// Surf nace con las recetas de Hidrobomba (así, con HD apagado, se ve el chorro de siempre) y con HD encendido usa la ola ancha
['Surf'].forEach(n => { STR[n] = STR['Hidrobomba']; FLT[n] = FLT['Hidrobomba']; FXR.impact[n] = FXR.impact['Hidrobomba']; CST[n] = CST['Hidrobomba']; TRL[n] = TRL['Hidrobomba']; FXC[n] = Object.assign({}, FXC['Hidrobomba']); });
HERO4['Surf'] = {str:hdSurf, flt:() => {}, imp:hdSurfHit};
// Vendaval nace con las recetas del Tornado (con HD apagado se ve el remolino de siempre) y con HD encendido usa el remolino grande que levanta al rival
['Vendaval'].forEach(n => { FLT[n] = FLT['Tornado']; FXR.impact[n] = FXR.impact['Tornado']; CST[n] = CST['Tornado']; TRL[n] = TRL['Tornado']; FXC[n] = Object.assign({}, FXC['Tornado']); });
const hdOld4 = {};
Object.entries(HERO4).forEach(([n, h]) => {
  const o = hdOld4[n] = {s:STR[n], f:FLT[n], i:FXR.impact[n]}, pick = r => (r && (r.draw || r));
  if(h.str && o.s){ const old = pick(o.s); const w = (e, a, ...r) => fxhd.on ? h.str(e, a) : old(e, a, ...r); Object.assign(w, o.s); STR[n] = w; }
  if(h.flt && o.f){ const old = pick(o.f); const w = (s, a, an, ...r) => { if(!fxhd.on) return old(s, a, an, ...r); const sc = (h.sc || 1.6); ctx.save(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.translate(s.x, s.y); ctx.scale(sc, sc); ctx.translate(-s.x, -s.y); try{ h.flt(s, a, an); }finally{ ctx.restore(); } }; Object.assign(w, o.f); FLT[n] = w; }
  if(h.imp){ const old = o.i && pick(o.i); const w = (e, a, ...r) => { if(!fxhd.on) return old && old(e, a, ...r); return h.imp(e, a); }; if(o.i) Object.assign(w, o.i); FXR.impact[n] = w; }
  if(h.mel && FXR.melee[n]){ const old = pick(FXR.melee[n]), om = FXR.melee[n]; const w = (e, a, ...r) => fxhd.on ? h.mel(e, a) : old(e, a, ...r); Object.assign(w, om); FXR.melee[n] = w; }
  if(h.buf && FXR.buff[n]){ const old = pick(FXR.buff[n]), ob = FXR.buff[n]; const w = (e, a, ...r) => fxhd.on ? h.buf(e, a) : old(e, a, ...r); Object.assign(w, ob); FXR.buff[n] = w; }
  if(h.aura && FXR.aura[n]){ const old = pick(FXR.aura[n]), oa = FXR.aura[n]; const w = (f, I, t, type, k) => fxhd.on ? h.aura(f, I, t, type, k) : old(f, I, t, type, k); Object.assign(w, oa); FXR.aura[n] = w; }
  FXC[n] = Object.assign({}, FXC[n], {idur: Math.max(FXC[n]?.idur || 0, h.imp ? (h.idur || .9) : 0) || undefined});
});
