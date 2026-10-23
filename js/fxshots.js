"use strict";
/* =====================================================================
   Proyectiles y rayos (huecos 2 y 4): cómo se ve cada ataque real mientras vuela.
   · FXR.stream  = chorros / rayos / llamas que se estiran desde el atacante hasta la cabeza del proyectil
   · FXR.flight  = la "cabeza" del proyectil (bola, hojas, agujas, anillos...)
   · FXR.trail   = estela de partículas · FXR.cast = destello al lanzar
   ===================================================================== */
const STR = FXR.stream, FLT = FXR.flight, TRL = FXR.trail, CST = FXR.cast;
const NOCOLS = null;
// Geometría de un chorro: del origen hasta la cabeza (máximo L de largo). al = opacidad al apagarse.
function sg(e, L){
  const x1 = e.hx, y1 = e.hy, an = e.hang, d = Math.hypot(x1 - e.ox, y1 - e.oy), len = Math.min(d, L);
  return {x0:x1 - Math.cos(an) * len, y0:y1 - Math.sin(an) * len, x1, y1, len, an, px:-Math.sin(an), py:Math.cos(an), al:e.ended === undefined ? 1 : clamp01(1 - (e.t - e.ended) / (FXC[e.name]?.fade ?? .22))};
}
// Tubo recto de grosor w (px) con capas de color [[color, extraGrosor], ...] (de fuera hacia dentro)
function tube(G, w, layers, wob){
  const n = Math.ceil(G.len / PXS);
  for(const [c, dw] of layers){
    ctx.fillStyle = c;
    for(let i = 0; i <= n; i++){ const u = i / n, o = wob ? wob(u, i) : 0, ww = Math.max(1, Math.round((typeof w === 'function' ? w(u) : w) + dw));
      ctx.fillRect(snap(G.x0 + (G.x1 - G.x0) * u + G.px * o - ww * PXS / 2), snap(G.y0 + (G.y1 - G.y0) * u + G.py * o - ww * PXS / 2), ww * PXS, ww * PXS); }
  }
}
const pt = (G, u, o = 0) => [G.x0 + (G.x1 - G.x0) * u + G.px * o, G.y0 + (G.y1 - G.y0) * u + G.py * o];
// Anillo mirando en la dirección ang (elipse achatada a lo largo del avance)
function ringF(x, y, ang, r, ratio, c, w = 1){
  const n = Math.max(10, Math.ceil(6.283 * r * 1.2)), ca = Math.cos(ang), sa = Math.sin(ang);
  for(let i = 0; i < n; i++){ const th = i / n * 6.283, al = Math.sin(th) * r * ratio * PXS, pp = Math.cos(th) * r * PXS; R(x + ca * al - sa * pp - (w - 1) * PXS / 2, y + sa * al + ca * pp - (w - 1) * PXS / 2, w, w, c); }
}
const side = (x, y, ang, d, s) => [x + Math.cos(ang) * d - Math.sin(ang) * s, y + Math.sin(ang) * d + Math.cos(ang) * s];
// Bola de fuego con cola
function fball(x, y, r, ang, p, seed = 0, tail = 3){
  const k = Math.floor(g.t * 18);
  for(let i = tail; i >= 1; i--){ const d = i * r * .95 * PXS, j = (HH(seed + i, k) - .5) * r * PXS * .5;
    puff(x - Math.cos(ang) * d - Math.sin(ang) * j, y - Math.sin(ang) * d + Math.cos(ang) * j, Math.max(1, Math.round(r * (1 - i / (tail + 1) * .55))), i / (tail + 1), p); }
  orb(x, y, Math.max(2, Math.round(r * (1 + (HH(seed, k) - .5) * .25))), p);
}
const BLUE = ['#0a2a7a', '#1f64d6', '#5bb0ff', '#b5e4ff', '#ffffff'], SLUDGE = ['#2a0f3a', '#6b2a8a', '#9a4cc4', '#c9a0e8', '#f0d8ff'], MUD = ['#2a1a08', '#5a3a14', '#8a5a24', '#b88a4c', '#d9b878'], DARKP = ['#08060d', '#1c0f3a', '#3a2470', '#8b64d0', '#f2eaff'];

// ===================== CHORROS Y RAYOS =====================
STR['Lanzallamas'] = (e, a) => {
  const G = sg(e, 240), p = FXP.fuego, N = Math.max(2, Math.floor(G.len / 8)), k = Math.floor(g.t * 20); ctx.globalAlpha = G.al;
  for(let i = 0; i <= N; i++){ const u = i / N, [x, y] = pt(G, 1 - u, 0);
    const o = (HH(i, k) - .5) * (4 + u * 16), l = (HH(i, k + 9) - .5) * 8, x2 = x + G.px * o + Math.cos(G.an) * l, y2 = y + G.py * o + Math.sin(G.an) * l;
    puff(x2, y2, Math.round(2 + (1 - u) * 6 + HH(i, k + 3) * 2), 1 - u, p); }
  ctx.globalAlpha = 1;
};
STR['Dragoaliento'] = (e, a) => {
  const G = sg(e, 220), p = FXP.dragon, N = Math.max(2, Math.floor(G.len / 8)); ctx.globalAlpha = G.al;
  for(let i = 0; i <= N; i++){ const u = i / N, [x, y] = pt(G, 1 - u, Math.sin(i * .9 + g.t * 14) * (3 + (1 - u) * 9));
    puff(x, y, Math.round(2 + (1 - u) * 5), 1 - u, [p[0], p[1], '#7a3cff', p[3], p[4]]); if(i % 4 === 0) Spark(x + Math.cos(i + g.t * 9) * 8, y + Math.sin(i * 2 + g.t * 9) * 8, 1, '#c8f4ff'); }
  ctx.globalAlpha = 1;
};
STR['Pistola Agua'] = (e, a) => {
  const G = sg(e, 230), p = FXP.agua; ctx.globalAlpha = G.al;
  tube(G, 2, [[p[0], 2], [p[2], 1], [p[3], -1]], (u, i) => Math.sin(i * .35 - g.t * 25) * .8 * PXS);
  for(let i = 0; i < 9; i++){ const u = ((i * .113 + g.t * 3.4) % 1), [x, y] = pt(G, u, (HH(i, 4) - .5) * 12); R(x, y, 1, 1, '#ffffff'); }
  D(G.x1, G.y1, 3, p[1]); D(G.x1, G.y1, 2, p[3]); ctx.globalAlpha = 1;
};
STR['Hidrobomba'] = (e, a) => {
  const G = sg(e, 260), p = FXP.agua; ctx.globalAlpha = G.al;
  tube(G, u => 6 + u * 2, [[p[0], 3], [p[1], 1], [p[2], -1], [p[3], -3]], (u, i) => Math.sin(i * .25 - g.t * 28) * 1.2 * PXS);
  for(let i = 0; i < 14; i++){ const u = ((i * .071 + g.t * 3.2) % 1), [x, y] = pt(G, u, Math.sin(i * 3) * 5 * PXS / 2); Ln(x, y, x + Math.cos(G.an) * 9, y + Math.sin(G.an) * 9, '#ffffff', 1); }
  const k = Math.floor(g.t * 16); for(let i = 0; i < 12; i++){ const u = HH(i, k), [x, y] = pt(G, u, (HH(i, k + 2) < .5 ? -1 : 1) * (11 + HH(i, k + 5) * 12)); R(x, y, 1 + (i % 2), 1 + (i % 2), i % 3 ? p[3] : '#ffffff'); }
  ctx.globalAlpha = 1;
};
STR['Nieve Polvo'] = (e, a) => {
  const G = sg(e, 230), p = FXP.hielo, N = Math.max(2, Math.floor(G.len / 5)); ctx.globalAlpha = G.al;
  for(let i = N; i >= 0; i--){ const u = i / N, v = 1 - u, [x, y] = pt(G, v, Math.sin(i * 1.7 + g.t * 7) * (2 + v * 12) + (HH(i, 1) - .5) * v * 10); R(x, y, 1 + (i % 3 === 0), 1 + (i % 3 === 0), i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? p[3] : p[2]); if(i % 9 === 0) Spark(x, y, 2, '#ffffff'); }
  ctx.globalAlpha = 1;
};
STR['Rayo'] = (e, a) => {
  const G = sg(e, 300), p = FXP.electrico, k = Math.floor(g.t * 28); ctx.globalAlpha = G.al;
  bolt(G.x0, G.y0, G.x1, G.y1, k, p, 1, 9, 8);
  bolt(G.x0, G.y0, G.x1, G.y1, k + 50, p, 0, 5, 7);
  for(let b = 0; b < 3; b++){ const u = .2 + HH(k, b) * .7, [x, y] = pt(G, u, 0), an = G.an + (HH(k, b + 5) - .5) * 2.4; bolt(x, y, x + Math.cos(an) * 30, y + Math.sin(an) * 30, k + b * 11, p, 0, 5, 6); }
  Spark(G.x1, G.y1, 5, '#ffffff'); D(G.x1, G.y1, 3, '#fff27a'); ctx.globalAlpha = 1;
};
STR['Rayo Hielo'] = (e, a) => {
  const G = sg(e, 270), p = FXP.hielo; ctx.globalAlpha = G.al;
  tube(G, 3, [[p[0], 3], [p[2], 1], [p[4], -1]]);
  for(let i = 0; i < 7; i++){ const u = ((i * .15 + g.t * 1.6) % 1), [x, y] = pt(G, u, (i % 2 ? 1 : -1) * 7), s = 6 - (i % 3);
    PolyO(rotp(x, y, G.an, [[s, 0], [0, -s / 2.2], [-s, 0], [0, s / 2.2]]), p[3], p[1]); }
  for(let i = 0; i < 8; i++){ const [x, y] = pt(G, (i * .137 + g.t * 2.3) % 1, (HH(i, 3) - .5) * 20); R(x, y, 1, 1, '#ffffff'); }
  Star(G.x1, G.y1, 6, 0, 8, p[1], 2); Star(G.x1, G.y1, 6, 0, 7, p[4], 1); D(G.x1, G.y1, 3, p[3]); ctx.globalAlpha = 1;
};
STR['Psicorrayo'] = (e, a) => {
  const G = sg(e, 250), cols = ['#ff5fb0', '#ffe066', '#7de3ff'], n = Math.ceil(G.len / 3); ctx.globalAlpha = G.al;
  for(let c = 0; c < 3; c++) for(let w = 0; w < 2; w++) for(let i = 0; i <= n; i++){ const u = i / n, o = Math.sin(u * G.len / 9 - g.t * 18 + c * 2.1) * 8, [x, y] = pt(G, u, o); R(x - (w ? 0 : 1) * PXS / 2, y - (w ? 0 : 1) * PXS / 2, w ? 1 : 3, w ? 1 : 3, w ? '#ffffff' : (c === 0 ? '#5a0f3a' : c === 1 ? '#8a6a00' : '#1f64d6')); }
  for(let c = 0; c < 3; c++) for(let i = 0; i <= n; i++){ const u = i / n, o = Math.sin(u * G.len / 9 - g.t * 18 + c * 2.1) * 8, [x, y] = pt(G, u, o); R(x, y, 2, 2, cols[c]); }
  orb(G.x1, G.y1, 6, FXP.psiquico); ctx.globalAlpha = 1;
};
STR['Hiperrayo'] = (e, a) => {
  const G = sg(e, 300), p = ['#7a3a00', '#ff7a1a', '#ffc83a', '#fff0c0', '#ffffff'], k = Math.floor(g.t * 24); ctx.globalAlpha = G.al;
  tube(G, u => 9 + Math.sin(u * 20 - g.t * 30) * 1, [[p[0], 4], [p[1], 2], [p[2], 0], [p[3], -3], [p[4], -6]]);
  for(let i = 0; i < 5; i++){ const u = ((i * .2 + g.t * 2.4) % 1), [x, y] = pt(G, u, 0); Ln(x + G.px * 17, y + G.py * 17, x - G.px * 17, y - G.py * 17, '#fff0c0', 1); Ln(x + G.px * 14, y + G.py * 14 + 2, x - G.px * 14, y - G.py * 14 + 2, p[1], 1); }
  for(let i = 0; i < 10; i++){ const [x, y] = pt(G, HH(i, k), (HH(i, k + 2) < .5 ? -1 : 1) * (14 + HH(i, k + 4) * 14)); R(x, y, 2, 2, i % 2 ? p[2] : '#ffffff'); }
  orb(G.x1, G.y1, 13 + (k % 2), p); Star(G.x1, G.y1, 8, 8, 20, '#fff0c0', 1); ctx.globalAlpha = 1;
};
STR['Rayo Solar'] = (e, a) => {
  const G = sg(e, 300), p = ['#7a6a00', '#d9c21f', '#fff27a', '#fffbd0', '#ffffff'], k = Math.floor(g.t * 20); ctx.globalAlpha = G.al;
  tube(G, 7, [[p[0], 3], [p[1], 1], [p[2], -1], [p[4], -4]], (u, i) => Math.sin(i * .2 - g.t * 20) * PXS);
  for(let i = 0; i < 14; i++){ const u = (i * .071 + g.t * 1.8) % 1, [x, y] = pt(G, u, Math.sin(i * 5 + g.t * 3) * 14); R(x, y, 1 + (i % 2), 1 + (i % 2), i % 3 ? '#9fe23a' : '#ffffff'); }
  orb(G.x1, G.y1, 10, p); Star(G.x1, G.y1, 8, 7, 16 + (k % 3) * 2, p[2], 1); ctx.globalAlpha = 1;
};
STR['Terremoto'] = (e, a) => {
  const G = sg(e, 330), p = FXP.tierra, n = Math.max(2, Math.ceil(G.len / 11)); ctx.globalAlpha = G.al;
  const pts = []; for(let i = 0; i <= n; i++){ const u = i / n, o = (HH(i, 2) - .5) * 12 * (i % 2 ? 1 : .6); pts.push(pt(G, u, o)); }
  for(let i = 0; i < n; i++){ Ln(pts[i][0], pts[i][1] + 14, pts[i + 1][0], pts[i + 1][1] + 14, p[0], 3); }
  for(let i = 0; i < n; i++){ Ln(pts[i][0], pts[i][1] + 14, pts[i + 1][0], pts[i + 1][1] + 14, '#120a04', 1); if(i % 2 === 0){ const [x, y] = pts[i]; Ln(x, y + 14, x + Math.cos(i * 2) * 10, y + 14 + Math.sin(i * 2) * 6, '#120a04', 1); } }
  const k = Math.floor(g.t * 14); for(let i = 0; i < 8; i++){ const u = HH(i, k), [x, y] = pt(G, u, (HH(i, k + 1) - .5) * 26); const h = Math.abs(Math.sin(g.t * 9 + i * 2)) * 14; PolyO([[x - 4, y + 14], [x - 2, y + 14 - h], [x + 3, y + 14 - h * .8], [x + 5, y + 14]], p[2], p[0]); }
  ringF(G.x1, G.y1 + 14, G.an, 18, .32, p[1], 2); ringF(G.x1, G.y1 + 14, G.an, 13, .32, p[3], 1);
  ctx.globalAlpha = 1;
};

// ===================== CABEZAS DE PROYECTIL (vuelo) =====================
FLT['Lanzallamas'] = (s, a, an) => { const k = Math.floor(g.t * 18); puff(s.x, s.y, 7, .1, FXP.fuego); puff(s.x + (HH(k) - .5) * 6, s.y + (HH(k, 3) - .5) * 6, 4, 0, FXP.fuego); };
FLT['Dragoaliento'] = (s, a, an) => { orb(s.x, s.y, 6, FXP.dragon); };
FLT['Pistola Agua'] = (s, a, an) => { /* el chorro ya lo dibuja */ };
FLT['Hidrobomba'] = (s, a, an) => { Rg(s.x, s.y, 10 + (g.t * 20 % 4), '#9be0ff', undefined, 1); };
FLT['Nieve Polvo'] = (s, a, an) => { Spark(s.x, s.y, 3, '#ffffff'); };
FLT['Rayo'] = (s) => {};
FLT['Rayo Hielo'] = (s) => {};
FLT['Psicorrayo'] = (s) => {};
FLT['Hiperrayo'] = (s) => {};
FLT['Rayo Solar'] = (s) => {};
FLT['Terremoto'] = (s) => {};
FLT['Ascuas'] = (s, a, an) => { [[0, 0], [-7, -10], [-7, 10]].forEach(([d, o], i) => { const [x, y] = side(s.x, s.y, an, d, o); fball(x, y, 4, an, FXP.fuego, i * 3, 3); }); };
FLT['Llamarada'] = (s, a, an) => { fball(s.x, s.y, 13, an, FXP.fuego, 1, 5); const k = Math.floor(g.t * 18); for(let i = 0; i < 5; i++) R(s.x - Math.cos(an) * (10 + HH(i, k) * 24) + (HH(i, k + 3) - .5) * 24, s.y - Math.sin(an) * (10 + HH(i, k) * 24) + (HH(i, k + 2) - .5) * 24, 1, 1, '#ffe27a'); };
FLT['Envite Ígneo'] = (s, a, an) => {
  const p = FXP.fuego, k = Math.floor(g.t * 18);
  for(let i = 7; i >= 1; i--){ const [x, y] = side(s.x, s.y, an, -i * 11, (HH(i, k) - .5) * 14); puff(x, y, 14 - i, i / 8, p); }
  orb(s.x, s.y, 14, p); for(let i = 0; i < 7; i++){ const t = i / 7 * 6.28 + g.t * 8, [x, y] = side(s.x, s.y, an, Math.cos(t) * 8 - 6, Math.sin(t) * 18); puff(x, y, 5, .3, p); }
};
FLT['Impactrueno'] = (s, a, an) => { const k = Math.floor(g.t * 30), p = FXP.electrico; for(let i = 0; i < 5; i++){ const t = HH(k, i) * 6.28; bolt(s.x, s.y, s.x + Math.cos(t) * 20, s.y + Math.sin(t) * 20, k + i, p, 0, 4, 5); } orb(s.x, s.y, 5, p); };
FLT['Trueno'] = (s, a, an) => { const k = Math.floor(g.t * 30), p = FXP.electrico; for(let i = 0; i < 7; i++){ const t = HH(k, i) * 6.28; bolt(s.x, s.y, s.x + Math.cos(t) * 34, s.y + Math.sin(t) * 34, k + i, p, 1, 6, 6); } orb(s.x, s.y, 11, p); Star(s.x, s.y, 4, 8, 18, '#ffffff', 1); };
FLT['Hoja Afilada'] = (s, a, an) => {
  const p = FXP.planta;
  [[0, 0], [-10, -14], [-10, 14]].forEach(([d, o], i) => { const [x, y] = side(s.x, s.y, an, d, o), r = g.t * 14 + i * 2.1;
    PolyO(rotp(x, y, r, [[-11, 0], [-4, -5], [5, -5], [12, 0], [5, 5], [-4, 5]]), p[2], p[0]); Ln(...rotp(x, y, r, [[-8, 0]])[0], ...rotp(x, y, r, [[9, 0]])[0], p[4], 1); });
};
FLT['Esfera Aural'] = (s, a, an) => { orb(s.x, s.y, 9, BLUE); for(let i = 0; i < 3; i++){ const t = g.t * 9 + i * 2.1; D(s.x + Math.cos(t) * 14, s.y + Math.sin(t) * 14, 1, '#ffffff'); } Rg(s.x, s.y, 12 + (g.t * 12 % 3), BLUE[2], undefined, 1); };
FLT['Onda Certera'] = (s, a, an) => { orb(s.x, s.y, 16, BLUE); for(let i = 0; i < 5; i++){ const t = g.t * 7 + i * 1.26; D(s.x + Math.cos(t) * 22, s.y + Math.sin(t) * 22, 2, '#ffffff'); } Rg(s.x, s.y, 19 + (g.t * 12 % 4), BLUE[3], undefined, 1); Star(s.x, s.y, 6, 12, 20, BLUE[3], 1); };
FLT['Triataque'] = (s, a, an) => {
  const cols = [['#5a1408', '#ff5a2a', '#ffb09a'], ['#5a4300', '#ffd91f', '#fffbe0'], ['#1a4670', '#6fd4ff', '#e6faff']];
  for(let i = 0; i < 3; i++){ const t = g.t * 8 + i * 2.094, x = s.x + Math.cos(t) * 11, y = s.y + Math.sin(t) * 11; PolyO(rotp(x, y, t + 1.57, [[0, -8], [7, 6], [-7, 6]]), cols[i][1], cols[i][0]); Poly(rotp(x, y, t + 1.57, [[0, -3], [3, 3], [-3, 3]]), cols[i][2]); }
};
FLT['Picotazo Veneno'] = (s, a, an) => { const p = FXP.veneno; [-.32, 0, .32].forEach((da, i) => { const aa = an + da, [x, y] = side(s.x, s.y, an, -4 + Math.abs(da) * -10, Math.sin(da) * 22); Ln(x - Math.cos(aa) * 13, y - Math.sin(aa) * 13, x, y, p[0], 3); Ln(x - Math.cos(aa) * 12, y - Math.sin(aa) * 12, x, y, p[3], 1); PolyO(rotp(x, y, aa, [[8, 0], [0, -3], [0, 3]]), p[4], p[0]); }); };
FLT['Pin Misil'] = (s, a, an) => { [-11, 0, 11].forEach((o, i) => { const [x, y] = side(s.x, s.y, an, -i * 4 + 4, o); Ln(x - Math.cos(an) * 16, y - Math.sin(an) * 16, x, y, '#2a3d08', 2); Ln(x - Math.cos(an) * 15, y - Math.sin(an) * 15, x, y, '#e8f8c0', 1); PolyO(rotp(x, y, an, [[7, 0], [0, -3], [0, 3]]), '#ffffff', '#2a3d08'); }); };
FLT['Bomba Lodo'] = (s, a, an) => { const w = Math.sin(g.t * 16) * 1; orb(s.x, s.y, 8 + (w > 0 ? 1 : 0), SLUDGE); for(let i = 0; i < 3; i++){ const t = g.t * 5 + i * 2.1; Rg(s.x + Math.cos(t) * 12, s.y + Math.sin(t) * 12, 2, SLUDGE[3], undefined, 1); } };
FLT['Disparo Lodo'] = (s, a, an) => { orb(s.x, s.y, 7, MUD); for(let i = 0; i < 3; i++){ const t = g.t * 8 + i * 2.1; D(s.x + Math.cos(t) * 12, s.y + Math.sin(t) * 12, 2, i % 2 ? MUD[1] : MUD[2]); } };
FLT['Lanzamugre'] = (s, a, an) => { const w = Math.sin(g.t * 14); orb(s.x, s.y, 13 + (w > 0 ? 1 : 0), SLUDGE); for(let i = 0; i < 4; i++){ const t = g.t * 4 + i * 1.57; Rg(s.x + Math.cos(t) * 17, s.y + Math.sin(t) * 17, 3, SLUDGE[3], undefined, 1); D(s.x + Math.cos(t * 1.3) * 8, s.y + Math.sin(t * 1.3) * 8, 2, SLUDGE[4]); } };
FLT['Tajo Aéreo'] = (s, a, an) => { const p = FXP.volador; [[18, 0], [14, -14]].forEach(([r, d], i) => { const cx = s.x - Math.cos(an) * (12 + (i ? 14 : 0)), cy = s.y - Math.sin(an) * (12 + (i ? 14 : 0)); Arc(cx, cy, r, an - 1, an + 1, p[1], 4); Arc(cx, cy, r, an - 1, an + 1, p[3], 2); Arc(cx, cy, r + 1, an - .8, an + .8, '#ffffff', 1); }); };
FLT['Tornado'] = (s, a, an) => {
  const p = FXP.volador; for(let k = 0; k < 7; k++){ const y = s.y + 14 - k * 5, w = 3 + k * 1.8, x = s.x + Math.sin(g.t * 9 + k * .9) * 2 * PXS; Rg(x, y, w, k % 2 ? p[3] : '#ffffff', w * .32, 1); Rg(x, y, w - 1, p[2], (w - 1) * .32, 1); }
  for(let i = 0; i < 4; i++){ const t = g.t * 11 + i * 1.57; R(s.x + Math.cos(t) * 15, s.y - 6 + Math.sin(t) * 5, 1, 1, '#ffffff'); }
};
FLT['Confusión'] = (s, a, an) => { const p = FXP.psiquico; for(let k = 0; k < 3; k++){ const r = 4 + ((g.t * 22 + k * 7) % 21); ctx.globalAlpha = 1 - r / 25; Rg(s.x, s.y, r, k % 2 ? p[3] : p[2], undefined, 2); } ctx.globalAlpha = 1; orb(s.x, s.y, 4, p); };
FLT['Psíquico'] = (s, a, an) => { const p = FXP.psiquico; orb(s.x, s.y, 12, p); for(let k = 0; k < 3; k++){ const r = 8 + ((g.t * 16 + k * 6) % 18); ctx.globalAlpha = 1 - (r - 8) / 18; Rg(s.x, s.y, r, '#7de3ff', undefined, 1); ctx.globalAlpha = 1; } for(let i = 0; i < 6; i++){ const t = g.t * 5 + i * 1.05; R(s.x + Math.cos(t) * 19, s.y + Math.sin(t) * 19, 1, 1, i % 2 ? '#ffe066' : '#ffffff'); } };
FLT['Zumbido'] = (s, a, an) => { const p = FXP.bicho; for(let k = 0; k < 3; k++){ const d = 6 + k * 9 + (g.t * 40 % 9), r = 7 + k * 2; ctx.globalAlpha = 1 - (k * 9 + (g.t * 40 % 9)) / 32; Arc(s.x + Math.cos(an) * d - Math.cos(an) * 12, s.y + Math.sin(an) * d - Math.sin(an) * 12, r, an - .9, an + .9, k % 2 ? '#ffe066' : p[2], 2); } ctx.globalAlpha = 1; };
FLT['Voz Cautivadora'] = (s, a, an) => { const p = FXP.hada; for(let k = 0; k < 3; k++){ const o = (g.t * 34 + k * 11) % 33, d = o - 6; ctx.globalAlpha = 1 - o / 36; Arc(s.x + Math.cos(an) * d - Math.cos(an) * 12, s.y + Math.sin(an) * d - Math.sin(an) * 12, 8 + o * .15, an - 1.1, an + 1.1, p[2], 2); } ctx.globalAlpha = 1; heart(s.x, s.y, 1, p); };
FLT['Lanzarrocas'] = (s, a, an) => { const p = FXP.roca; [[0, 0, 8], [-14, 9, 6]].forEach(([d, o, r], i) => { const [x, y] = side(s.x, s.y, an, d, o), rr = g.t * (7 + i * 3); PolyO(rotp(x, y, rr, [[-r, -r * .3], [-r * .3, -r], [r * .8, -r * .6], [r, r * .4], [r * .1, r], [-r * .8, r * .7]]), p[2], p[0]); Poly(rotp(x, y, rr, [[-r * .6, -r * .3], [-r * .2, -r * .8], [r * .4, -r * .5], [0, -r * .1]]), p[4]); }); };
FLT['Tinieblas'] = (s, a, an) => { const k = Math.floor(g.t * 20); orb(s.x, s.y, 7, DARKP); for(let i = 0; i < 8; i++){ const t = i * .785 + g.t * 2, L = 12 + HH(i, k) * 14; Ln(s.x + Math.cos(t) * 9, s.y + Math.sin(t) * 9, s.x + Math.cos(t) * L, s.y + Math.sin(t) * L, i % 2 ? DARKP[3] : DARKP[2], 1); } };
FLT['Bola Sombra'] = (s, a, an) => { const w = Math.sin(g.t * 12); orb(s.x, s.y, 14 + (w > 0 ? 1 : 0), DARKP); for(let i = 0; i < 3; i++){ const t = g.t * 6 + i * 2.1; Arc(s.x, s.y, 8, t, t + 1.4, DARKP[4], 1); } D(s.x - 4, s.y - 5, 2, '#ffffff'); for(let i = 0; i < 4; i++){ const t = g.t * 3 + i * 1.57; puff(s.x + Math.cos(t) * 18, s.y + Math.sin(t) * 18, 2, .5, FXP.fantasma); } };
FLT['Pulso Dragón'] = (s, a, an) => { const p = FXP.dragon; for(let k = 3; k >= 0; k--){ const d = -k * 9 + ((g.t * 30) % 9) * 0, x = s.x + Math.cos(an) * d, y = s.y + Math.sin(an) * d; ctx.globalAlpha = 1 - k * .22; ringF(x, y, an, 11 - k * 1.5, .45, k % 2 ? p[3] : p[2], 2); } ctx.globalAlpha = 1; orb(s.x, s.y, 6, p); };
FLT['Pulso Umbrío'] = (s, a, an) => { const p = FXP.siniestro; orb(s.x, s.y, 8, ['#000000', '#08060d', '#1c0f3a', '#4d3b5e', '#9a6fd0']); for(let k = 0; k < 3; k++) for(let r = 4; r < 16; r += 1){ const t = k * 2.094 + r * .4 + g.t * 9; R(s.x + Math.cos(t) * r * PXS, s.y + Math.sin(t) * r * PXS, 1, 1, r < 9 ? '#4d3b5e' : '#9a6fd0'); } ringF(s.x, s.y, an, 14, .4, '#9a6fd0', 1); };
FLT['Hidropulso'] = (s, a, an) => { const p = FXP.agua; for(let k = 3; k >= 0; k--){ const x = s.x - Math.cos(an) * k * 10, y = s.y - Math.sin(an) * k * 10; ctx.globalAlpha = 1 - k * .22; ringF(x, y, an, 12 - k * 2, .45, k % 2 ? '#ffffff' : p[3], 1); } ctx.globalAlpha = 1; D(s.x, s.y, 8, p[1]); D(s.x, s.y, 7, p[2]); D(s.x - 3, s.y - 3, 2, '#ffffff'); };
FLT['Pulso Noche'] = (s, a, an) => { const p = FXP.siniestro; for(let k = 0; k < 3; k++){ const r = 8 + ((g.t * 24 + k * 10) % 30); ctx.globalAlpha = 1 - (r - 8) / 30; Rg(s.x, s.y, r, p[3], undefined, 2); } ctx.globalAlpha = 1; orb(s.x, s.y, 13, ['#000000', '#08060d', p[1], p[2], p[3]]); };
FLT['Bomba Imán'] = (s, a, an) => { const p = FXP.acero, k = Math.floor(g.t * 25); orb(s.x, s.y, 8, p); R(s.x - 4, s.y - 1, 3, 2, '#e0443a'); R(s.x + 1, s.y - 1, 3, 2, '#3a6ae0'); for(let i = 0; i < 2; i++){ const t = HH(k, i) * 6.28; bolt(s.x, s.y, s.x + Math.cos(t) * 18, s.y + Math.sin(t) * 18, k + i, FXP.electrico, 0, 4, 5); } };
FLT['Viento Feérico'] = (s, a, an) => { const p = FXP.hada; for(let i = 0; i < 16; i++){ const t = g.t * 8 + i * .8, r = 3 + i * .9; R(s.x - Math.cos(an) * i * 1.2 * PXS + Math.cos(t) * r, s.y - Math.sin(an) * i * 1.2 * PXS + Math.sin(t) * r, 1, 1, i % 3 ? p[3] : '#ffffff'); } Star(s.x, s.y, 5, 0, 6, p[1], 2); Star(s.x, s.y, 5, 0, 5, '#ffffff', 1); };
FLT['Doble Filo'] = (s, a, an) => { const p = FXP.normal; for(let i = 3; i >= 1; i--){ const [x, y] = side(s.x, s.y, an, -i * 12, 0); ctx.globalAlpha = 1 - i * .25; Ln(x, y - 6, x - Math.cos(an) * 14, y - 6 - Math.sin(an) * 14 + 6, '#ffffff', 2); ctx.globalAlpha = 1; } orb(s.x, s.y, 9, p); for(let i = 0; i < 4; i++){ const t = g.t * 12 + i * 1.57; Spark(s.x + Math.cos(t) * 13, s.y + Math.sin(t) * 13, 2, '#ffe066'); } };
FLT['Ventisca'] = (s, a, an) => {
  const p = FXP.hielo, k = Math.floor(g.t * 16);
  for(let i = 0; i < 9; i++){ const t = g.t * 3 + i * .7, r = 12 + (i % 3) * 5; D(s.x + Math.cos(t) * r, s.y + Math.sin(t) * r * .8, 4 + (i % 3), i % 2 ? '#e8faff' : p[3]); }
  for(let i = 0; i < 40; i++){ const t = g.t * (3 + (i % 3)) + i * 1.9, r = 6 + (i * 7 % 30); R(s.x + Math.cos(t) * r, s.y + Math.sin(t) * r * .8, 1 + (i % 3 === 0), 1 + (i % 3 === 0), i % 3 ? '#ffffff' : p[2]); }
  for(let i = 0; i < 6; i++){ const x = s.x + (HH(i, k) - .5) * 52, y = s.y + (HH(i, k + 2) - .5) * 40; Ln(x, y, x - 8, y + 5, p[3], 1); }
  orb(s.x, s.y, 9, p); Star(s.x, s.y, 6, 5, 14 + k % 3, '#ffffff', 1);
};
FLT['Pájaro Osado'] = (s, a, an) => {
  const p = FXP.volador, flap = Math.sin(g.t * 24) * 3;
  for(let i = 1; i <= 4; i++){ const [x0, y0] = side(s.x, s.y, an, -i * 12, -10), [x1, y1] = side(s.x, s.y, an, -i * 12, 10); ctx.globalAlpha = 1 - i * .2; Ln(x0, y0, x0 - Math.cos(an) * 12, y0 - Math.sin(an) * 12, '#ffffff', 1); Ln(x1, y1, x1 - Math.cos(an) * 12, y1 - Math.sin(an) * 12, '#ffffff', 1); ctx.globalAlpha = 1; }
  PolyO(rotp(s.x, s.y, an, [[-4, -4], [-30, -30 - flap], [-14, -22 - flap], [-16, -6], [-6, -2]]), p[3], p[0]);
  PolyO(rotp(s.x, s.y, an, [[-4, 4], [-30, 30 + flap], [-14, 22 + flap], [-16, 6], [-6, 2]]), p[3], p[0]);
  PolyO(rotp(s.x, s.y, an, [[16, 0], [8, -8], [-16, -5], [-24, 0], [-16, 5], [8, 8]]), '#ffffff', p[0]);
  Poly(rotp(s.x, s.y, an, [[14, 0], [18, -2], [18, 2]]), '#ffb347'); D(s.x + Math.cos(an) * 8 - Math.sin(an) * 3, s.y + Math.sin(an) * 8 + Math.cos(an) * 3, 1, '#102040');
};
FLT['Megacuerno'] = (s, a, an) => {
  const p = FXP.bicho; for(let i = -1; i <= 1; i++){ const [x0, y0] = side(s.x, s.y, an, -6, i * 12), [x1, y1] = side(s.x, s.y, an, -34, i * 12); Ln(x0, y0, x1, y1, '#d4f26a', 1); }
  PolyO(rotp(s.x, s.y, an, [[34, 0], [6, -9], [-14, -9], [-14, 9], [6, 9]]), p[3], p[0]); Poly(rotp(s.x, s.y, an, [[30, 0], [4, -3], [-10, -3], [-10, 0]]), '#ffffff');
  Poly(rotp(s.x, s.y, an, [[-14, -10], [-20, -14], [-20, 14], [-14, 10]]), p[2]); orb(s.x - Math.cos(an) * 10, s.y - Math.sin(an) * 10, 6, p);
};
FLT['Roca Afilada'] = (s, a, an) => {
  const p = FXP.roca; orb(s.x, s.y, 8, p);
  for(let i = 0; i < 6; i++){ const t = g.t * 6 + i * 1.047; PolyO(rotp(s.x + Math.cos(t) * 14, s.y + Math.sin(t) * 14, t, [[9, 0], [-4, -4], [-4, 4]]), p[3], p[0]); }
};
FLT['Cometa Draco'] = (s, a, an) => {
  const p = FXP.dragon; for(let i = 6; i >= 1; i--){ const [x, y] = side(s.x, s.y, an, -i * 11, Math.sin(g.t * 10 + i) * 4); puff(x, y, Math.max(2, 12 - i * 1.5), i / 7, ['#101b52', '#3b3fd1', '#7a3cff', '#7de3ff', '#f0ffff']); }
  orb(s.x, s.y, 13, ['#101b52', '#3b3fd1', '#5f6bff', '#a9f0ff', '#ffffff']); Star(s.x, s.y, 5, 10, 20, '#7de3ff', 1);
};
FLT['Foco Resplandor'] = (s, a, an) => { const p = FXP.acero; orb(s.x, s.y, 10, p); Star(s.x, s.y, 8, 10, 19 + (Math.floor(g.t * 20) % 3), '#ffffff', 1); Star(s.x, s.y, 4, 8, 14, p[3], 2); Rg(s.x, s.y, 13 + (g.t * 10 % 3), p[3], undefined, 1); };
FLT['Fuerza Lunar'] = (s, a, an) => {
  const p = FXP.hada; orb(s.x, s.y, 14, p);
  Poly(rotp(s.x, s.y, g.t * 2, [[-3, -9], [4, -7], [8, 0], [4, 7], [-3, 9], [2, 5], [4, 0], [2, -5]]), '#ffffff');
  for(let i = 0; i < 5; i++){ const t = g.t * 5 + i * 1.26; Spark(s.x + Math.cos(t) * 21, s.y + Math.sin(t) * 21, 2, i % 2 ? '#ffffff' : p[3]); }
};
function heart(x, y, k, p){ const s = [[-2, -2], [-1, -2], [1, -2], [2, -2], [-3, -1], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [3, -1], [-3, 0], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [3, 0], [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1], [-1, 2], [0, 2], [1, 2], [0, 3]]; for(const [dx, dy] of s) R(x + dx * PXS * k, y + dy * PXS * k, k, k, p[2]); R(x - 2 * PXS * k, y - 1 * PXS * k, k, k, '#ffffff'); }

// ===================== ESTELAS =====================
TRL._ = {rate:26, cols:s => fxCols(s.type), life:.3, speed:20, spread:3};
TRL['Lanzallamas'] = false; TRL['Pistola Agua'] = false; TRL['Hidrobomba'] = false; TRL['Rayo'] = false; TRL['Rayo Hielo'] = false; TRL['Psicorrayo'] = false; TRL['Hiperrayo'] = false; TRL['Rayo Solar'] = false; TRL['Nieve Polvo'] = false; TRL['Dragoaliento'] = false;
TRL['Ascuas'] = {rate:50, cols:['#ff7a1a', '#ffc83a', '#c4300c'], life:.4, rise:.5, speed:20};
TRL['Llamarada'] = {rate:70, cols:['#ff7a1a', '#ffc83a', '#fff7c0', '#c4300c'], life:.5, rise:.4, speed:40, s:2};
TRL['Envite Ígneo'] = {rate:70, cols:['#ff7a1a', '#ffc83a', '#c4300c'], life:.5, rise:.5, speed:50, s:2};
TRL['Hoja Afilada'] = {rate:34, cols:['#5cd04a', '#b5f07a', '#2a8a2a'], life:.5, speed:30, spread:4};
TRL['Impactrueno'] = {rate:40, cols:['#ffd91f', '#fff27a', '#ffffff'], life:.2, speed:30};
TRL['Trueno'] = {rate:60, cols:['#ffd91f', '#fff27a', '#ffffff'], life:.25, speed:50, s:2};
TRL['Bola Sombra'] = {rate:44, cols:['#5b3a96', '#8b64d0', '#1c0f3a'], life:.5, rise:.3, speed:20, s:2};
TRL['Bomba Lodo'] = {rate:34, cols:['#9a4cc4', '#6b2a8a'], life:.5, speed:10, spread:6, s:2};
TRL['Lanzamugre'] = {rate:44, cols:['#9a4cc4', '#6b2a8a', '#c9a0e8'], life:.55, speed:12, spread:6, s:2};
TRL['Disparo Lodo'] = {rate:30, cols:['#8a5a24', '#5a3a14'], life:.45, speed:15, s:2};
TRL['Ventisca'] = {rate:70, cols:['#ffffff', '#d9f8ff', '#a5e8ff'], life:.6, speed:60, spread:5};
TRL['Psíquico'] = {rate:40, cols:['#ff5fb0', '#ffa8d8', '#7de3ff'], life:.4, speed:25, spread:6};
TRL['Cometa Draco'] = {rate:60, cols:['#5f6bff', '#7de3ff', '#f0ffff'], life:.5, speed:40, s:2};
TRL['Pájaro Osado'] = {rate:50, cols:['#ffffff', '#b6ccf2'], life:.5, speed:60, spread:3};
TRL['Fuerza Lunar'] = {rate:44, cols:['#ff9ee0', '#ffffff', '#ffd6f4'], life:.5, speed:25, spread:5};

// ===================== LANZAMIENTO (destello en la boca) =====================
CST._ = (f, s, name, big, ox, oy, ang) => {
  fxBurst(ox, oy, fxCols(s.type), big ? 14 : 7, big ? 160 : 110, ang, 1.5, {life:.3});
  fxAdd('impact', 'ring', {x:ox, y:oy, type:s.type, dur:.28, k:big ? 1.3 : .7});
};
for(const n of ['Lanzallamas', 'Pistola Agua', 'Hidrobomba', 'Rayo', 'Rayo Hielo', 'Psicorrayo', 'Hiperrayo', 'Rayo Solar', 'Dragoaliento', 'Nieve Polvo']) CST[n] = (f, s, name, big, ox, oy, ang) => {
  const c = fxCols(s.type); fxBurst(ox, oy, c, 8, 90, ang, 1.2, {life:.25});
};
CST['Terremoto'] = (f, s, name, big, ox, oy, ang) => { const I = idleInfo(f.m.dex); fxAdd('impact', 'ring', {x:f.x, y:f.y + I.foot * ESCALA - 4, type:'tierra', dur:.4, k:1.4}); fxBurst(f.x, f.y + I.foot * ESCALA - 4, FXP.tierra.slice(1), 12, 110, -Math.PI / 2, 3, {life:.4, grav:1}); fx.shake = Math.max(fx.shake, 4); };
CST['Trueno'] = (f, s, name, big, ox, oy, ang) => { fxBurst(ox, oy, FXP.electrico.slice(1), 10, 140, ang, 2, {life:.25}); fxAdd('impact', 'ring', {x:ox, y:oy, type:'electrico', dur:.3, k:1.2}); };
CST['Pájaro Osado'] = (f, s, name, big, ox, oy, ang) => { fxBurst(f.x, f.y, ['#ffffff', '#b6ccf2', '#e0ecff'], 12, 110, undefined, 6.3, {life:.5}); };