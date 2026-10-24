"use strict";
/* =====================================================================
   17d) ARENAS DE SINNOH (versión 2, rediseño): un fondo pixel art detallado por cada líder, miembro del Alto Mando y Campeona de Sinnoh (13).
   Dibujadas con código (sin imágenes), igual que las de Kanto, Johto y Hoenn. Se cargan DESPUÉS de arenashoenn.js y usan sus ayudantes
   (arTiles, arSpeck, arCrack, arOcclude, arFlame, arColumn, arRocks, arPot, arStars...). El id de cada arena es el id del combate (roco, gardenia,
   brega, fantina, aceron, mananti, inverna, lectro, alecran, gaia, fausto, delos, cintia). Cómo funciona build() / anim(): ver la cabecera de arenas.js.

   Estas arenas NO usan el marco lateral automático (side): cada una dibuja sus propios laterales, mucho más anchos, con la decoración de su sala.
   REGLA: el centro del suelo (donde pelean los dos Pokémon) se deja LIMPIO; la decoración va en la pared del fondo, en las bandas de los lados y
   en el borde de arriba. El marcador tapa la parte de arriba a izquierda y derecha: lo importante se ve en el centro de arriba, en los lados y en el suelo.
   ===================================================================== */

// ---- Ayudantes nuevos (comunes a todas las arenas de Sinnoh) ----
const arRnd = (P, a, b) => a + P.r() * (b - a);
function arGrad(P, y0, y1, w, a, b){ for(let y = y0; y < y1; y++) P.rect(arMix(a, b, (y - y0) / Math.max(1, y1 - y0 - 1)), 0, y, w, 1); }          // degradado vertical (todo el ancho)
function arGradR(P, x, y, w, h, a, b){ for(let i = 0; i < h; i++) P.rect(arMix(a, b, i / Math.max(1, h - 1)), x, y + i, w, 1); }                  // degradado vertical en un rectángulo
function arEll(P, cx, cy, rx, ry, col, a){                                                                                                        // elipse rellena (con transparencia opcional)
  cx = Math.round(cx); cy = Math.round(cy);
  for(let y = -ry; y <= ry; y++){ const k = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry + .01)))); if(a === undefined) P.rect(col, cx - k, cy + y, k * 2 + 1, 1); else P.alpha(col, a, cx - k, cy + y, k * 2 + 1, 1); }
}
function arPool(P, cx, cy, rx, ry, col, a){ for(let i = 1; i <= 4; i++) arEll(P, cx, cy, rx * (5 - i) / 4, Math.max(1, ry * (5 - i) / 4), col, a / 3); }       // charco de luz sobre el suelo
function arGlowC(c, x, y, r, col, a){                                                                                                              // resplandor redondo animado (c = contexto)
  c.fillStyle = col;
  for(let k = 4; k >= 1; k--){ const rr = r * k / 4; c.globalAlpha = a * .24; for(let yy = -rr; yy <= rr; yy++){ const kx = Math.round(Math.sqrt(Math.max(0, rr * rr - yy * yy))); c.fillRect(Math.round(x - kx), Math.round(y + yy), kx * 2 + 1, 1); } }
  c.globalAlpha = 1;
}
function arBeam(P, x0, y0, x1, y1, w0, w1, col, a){                                                                                                // haz de luz inclinado
  const n = Math.max(1, y1 - y0); for(let i = 0; i <= n; i++){ const t = i / n, xc = x0 + (x1 - x0) * t, ww = w0 + (w1 - w0) * t; P.alpha(col, a * (1 - t * .55), xc - ww / 2, y0 + i, ww, 1); }
}
function arStrata(P, x, y, w, h, cols, amp){                                                                                                       // capas de roca onduladas
  const n = cols.length; P.rect(cols[0], x, y, w, h);
  for(let i = 0; i < w; i++) for(let k = 1; k < n; k++){
    const yy = y + Math.round(h * k / n + Math.sin(i * .045 + k * 1.7) * amp + Math.sin(i * .13 + k) * amp * .4);
    const yb = k === n - 1 ? y + h : y + Math.round(h * (k + 1) / n + Math.sin(i * .045 + (k + 1) * 1.7) * amp + Math.sin(i * .13 + k + 1) * amp * .4);
    P.rect(cols[k], x + i, yy, 1, yb - yy);
  }
}
function arPlank(P, x, y, w, h, base, ph, vary){                                                                                                   // suelo de tablas con juntas
  P.rect(arDrk(base, .4), x, y, w, h);
  for(let r = 0; r * ph < h; r++){ let px = x - ((r * 17) % 23);
    while(px < x + w){ const pw = 18 + (Math.abs(px * 7 + r * 13) % 14), k = (Math.abs(px * 3 + r * 5) % 5) / 5, c = arMix(base, (r + (px >> 3)) & 1 ? '#000000' : '#ffffff', vary * k);
      const x0 = Math.max(px, x), x1 = Math.min(px + pw - 1, x + w); if(x1 > x0) P.rect(c, x0, y + r * ph, x1 - x0, Math.min(ph - 1, y + h - (y + r * ph))); px += pw; } }
}
function arCrystal(P, x, y, hh, col){                                                                                                              // racimo de cristales (x,y = base)
  const lit = arLit(col, .45), drk = arDrk(col, .4);
  [[0, hh, 4], [-4, hh * .6 | 0, 3], [4, hh * .5 | 0, 3], [-7, hh * .35 | 0, 2]].forEach(([dx, hh2, ww]) => {
    for(let i = 0; i < hh2; i++){ const t = i / hh2, wi = Math.max(1, Math.round(ww * (1 - Math.pow(t, 1.6)))); P.rect(drk, x + dx - (wi >> 1) - 1, y - i, wi + 1, 1); P.rect(col, x + dx - (wi >> 1), y - i, Math.max(1, wi - 1), 1); P.px(lit, x + dx - (wi >> 1), y - i); }
  });
}
function arGear(c, cx, cy, r, teeth, ang, col, hub){                                                                                               // engranaje que gira (c = contexto)
  c.fillStyle = col;
  for(let i = 0; i < teeth; i++){ const a = ang + i * Math.PI * 2 / teeth; c.fillRect(Math.round(cx + Math.cos(a) * r) - 1, Math.round(cy + Math.sin(a) * r) - 1, 3, 3); }
  for(let k = 0; k < r * 7; k++){ const a = k * Math.PI * 2 / (r * 7); c.fillRect(Math.round(cx + Math.cos(a) * (r - 1)), Math.round(cy + Math.sin(a) * (r - 1)), 2, 2); }
  for(let s = 0; s < 4; s++){ const a = ang + s * Math.PI / 2; for(let k = 2; k < r - 2; k++) c.fillRect(Math.round(cx + Math.cos(a) * k), Math.round(cy + Math.sin(a) * k), 1, 1); }
  c.fillStyle = hub; c.fillRect(cx - 2, cy - 2, 5, 5); c.fillStyle = col; c.fillRect(cx - 1, cy - 1, 3, 3);
}
function arLine(c, x0, y0, x1, y1){ const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for(let i = 0; i <= n; i++){ const t = n ? i / n : 0; c.fillRect(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), 1, 1); } }
function arBolt(c, x0, y0, x1, y1, seed, col, glow){                                                                                               // rayo quebrado (c = contexto)
  const n = Math.max(4, Math.round(Math.hypot(x1 - x0, y1 - y0) / 4)); let px = x0, py = y0;
  for(let i = 1; i <= n; i++){ const t = i / n, nx = x0 + (x1 - x0) * t + (i < n ? (HH(seed, i) - .5) * 8 : 0), ny = y0 + (y1 - y0) * t + (i < n ? (HH(seed, i + 50) - .5) * 8 : 0);
    if(glow){ c.globalAlpha = .35; c.fillStyle = glow; arLine(c, px + 1, py, nx + 1, ny); arLine(c, px - 1, py, nx - 1, ny); c.globalAlpha = 1; }
    c.fillStyle = col; arLine(c, px, py, nx, ny); px = nx; py = ny; }
}
function arMote(c, list, t, w, col, a, sx, sy){                                                                                                    // motas de polvo/chispas que flotan
  const span = AR_H - AR_WALL; c.fillStyle = col;
  list.forEach(([x, y, ph]) => { c.globalAlpha = a * (.5 + .5 * Math.sin(t * 2 + ph * 9)); const xx = ((x + t * sx * (.4 + ph)) % w + w) % w, yy = (((y - AR_WALL) + t * sy * (.3 + ph)) % span + span) % span; c.fillRect(Math.floor(xx), Math.floor(AR_WALL + yy), 1, 1); });
  c.globalAlpha = 1;
}
const arMotes = (P, n, w, h) => Array.from({length: n}, () => [P.r() * w, AR_WALL + P.r() * (h - AR_WALL), P.r()]);

// ---- Borde de roca irregular a los lados (cada fila tiene su ancho; bulges = [y central, alto, saliente] de bultos) ----
function arRockEdge(P, w, h, y0, wid, bulges, base, hi, lo){
  const ex = y => wid + bulges.reduce((s, [yc, hh, aa]) => s + aa * Math.exp(-Math.pow((y - yc) / hh, 2)), 0) + Math.round(Math.sin(y * .31) * 1.5);
  for(let y = y0; y < h; y++){ const e = Math.max(3, Math.round(ex(y)));
    [0, 1].forEach(sd => {
      const x0 = sd ? w - e : 0; P.rect(base, x0, y, e, 1);
      for(let k = 0; k < e; k++){ const t = (sd ? e - 1 - k : k) / e; if(P.r() < .45) P.px(arMix(lo, hi, P.r() * (.2 + t * .7)), x0 + k, y); }
      P.px(hi, sd ? w - e : e - 1, y); P.alpha('#000000', .25, sd ? w - e - 1 : e, y, 1, 1); P.alpha('#000000', .14, sd ? w - e - 3 : e + 1, y, 2, 1);
    });
  }
  return ex;
}

Object.assign(ARENAS, {

  // ---- Roco · Gimnasio de Ciudad Pirita (Roca): mina subterránea con raíles, vagonetas, pilares rocosos, cristales y lámparas mineras ----
  roco: {dark: .24,
    build(P, w, h, WH){
      P.rect('#5b4735', 0, WH, w, h - WH);                                                                                       // suelo de tierra y grava
      arSpeck(P, 0, WH, w, h - WH, 1300, ['#6f5842', '#4b3a2b', '#7d6249', '#3f3024', '#8a6e52']);
      for(let i = 0; i < 80; i++){ const sx = arRnd(P, 14, w - 28), sy = arRnd(P, WH + 6, h - 5), sw = 5 + (P.r() * 10 | 0), sh = 3 + (P.r() * 4 | 0), c = ['#6a5540', '#74604a', '#5f4b38'][i % 3];
        P.rect('#2e2318', sx, sy + 1, sw, sh); P.rect(c, sx, sy, sw, sh - 1); P.alpha('#ffffff', .13, sx, sy, sw, 1); }                         // lajas sueltas
      for(let i = 0; i < 12; i++) arCrack(P, P.r() * w, WH + 8 + P.r() * (h - WH - 16), 8 + P.r() * 16, '#2e2217', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .4);
      // pared del fondo: capas de roca
      arStrata(P, 0, 0, w, WH, ['#3a2c20', '#4a382a', '#33261b', '#54402f', '#2e231a', '#46352a', '#3a2c20'], 2);
      arSpeck(P, 0, 0, w, WH, 420, ['#1a1410', '#6a5238', '#2a2018', '#7a6048']);
      for(let i = 0; i < 12; i++){ const x = P.r() * (w - 24), y = 2 + P.r() * (WH - 14); P.rect('#14100c', x, y, 8 + P.r() * 12, 2); P.rect('#26221e', x + 1, y, 5, 1); }       // vetas de carbón
      for(let i = 0; i < 6; i++) arCrack(P, P.r() * w, 3 + P.r() * (WH - 10), 10 + P.r() * 10, '#dfe6ea', 1, 0, .5);                                   // vetas de cuarzo
      // túnel central con marco de madera y los raíles que salen de él
      const cx = Math.round(w / 2);
      P.rect('#0a0806', cx - 22, 6, 44, WH - 6); for(let y = 6; y < WH; y++) P.alpha('#1a1208', .5 * (1 - (y - 6) / (WH - 6)), cx - 22, y, 44, 1);
      P.rect('#2a2018', cx - 26, 4, 5, WH - 4); P.rect('#2a2018', cx + 21, 4, 5, WH - 4);
      P.rect('#6b4a2a', cx - 25, 5, 3, WH - 5); P.rect('#6b4a2a', cx + 22, 5, 3, WH - 5); P.rect('#8a6038', cx - 25, 5, 1, WH - 5); P.rect('#8a6038', cx + 22, 5, 1, WH - 5);
      P.rect('#6b4a2a', cx - 28, 2, 57, 4); P.rect('#8a6038', cx - 28, 2, 57, 1); P.alpha('#000000', .4, cx - 28, 5, 57, 1);
      for(let k = 0; k < 4; k++){ P.rect('#6b4a2a', cx - 22 + k, 6 + k, 1, 1); P.rect('#6b4a2a', cx + 21 - k, 6 + k, 1, 1); }
      for(let i = 0; i < 5; i++) P.rect('#1a1612', cx - 14 + i * 7, 14 + i % 2 * 3, 2, 2);
      const RY = WH + 16;
      for(let x = 14; x < w - 14; x += 8){ P.rect('#3a2616', x, RY - 2, 3, 10); P.rect('#5a3c22', x, RY - 2, 3, 1); }                                // traviesas
      [0, 5].forEach(o => { P.rect('#26262c', 10, RY + o, w - 20, 2); P.rect('#b4bac4', 10, RY + o, w - 20, 1); P.alpha('#ffffff', .3, 10, RY + o, w - 20, 1); });   // raíles
      const RX = w - 38;
      for(let y = RY + 12; y < h - 2; y += 8){ P.rect('#3a2616', RX - 2, y, 10, 3); P.rect('#5a3c22', RX - 2, y, 10, 1); }                       // ramal vertical
      [0, 5].forEach(o => { P.rect('#26262c', RX + o, RY + 8, 2, h - RY - 8); P.rect('#b4bac4', RX + o, RY + 8, 1, h - RY - 8); });
      // cristales incrustados en la pared
      const cr = [];
      [[.12, '#5ae0ff'], [.2, '#ffb347'], [.3, '#ff7ad9'], [.7, '#5ae0ff'], [.8, '#9aff7a'], [.9, '#ff7ad9']].forEach(([k, col], i) => { const x = Math.round(w * k), hh = 9 + (i * 5) % 7; arCrystal(P, x, WH - 1, hh, col); cr.push([x - 1, Math.round(WH - hh * .6), col]); });
      // lámparas mineras colgantes con su charco de luz
      const lamps = [];
      [.34, .66, .06, .94].forEach((k, i) => { const x = Math.round(w * k), y = i < 2 ? 15 : 22; P.rect('#26262c', x, 0, 1, y - 1); P.rect('#3a3a42', x - 3, y - 1, 7, 2); P.rect('#4a4a52', x - 3, y, 7, 7); P.rect('#ffd36a', x - 2, y + 1, 5, 5); P.px('#ffffff', x - 1, y + 2); P.rect('#26262c', x - 4, y + 7, 9, 1);
        lamps.push([x, y + 3]); arPool(P, x, WH + (i < 2 ? 26 : 34), i < 2 ? 46 : 30, i < 2 ? 14 : 12, '#ffd36a', .2); });
      // vigas y puntales de madera en la pared
      [.2, .8].forEach(k => { const x = Math.round(w * k); P.rect('#4a3220', x - 3, 0, 7, WH); P.rect('#6b4a2a', x - 2, 0, 5, WH); P.rect('#8a6038', x - 2, 0, 1, WH); P.alpha('#000000', .35, x + 2, 0, 2, WH); P.rect('#2a2a30', x - 3, 10, 7, 1); P.rect('#2a2a30', x - 3, 24, 7, 1); });
      P.rect('#4a3220', 0, 0, w, 3); P.rect('#6b4a2a', 0, 0, w, 1); P.rect('#2a2018', 0, WH - 3, w, 3);
      arOcclude(P, w, WH);
      // lados: paredes de roca con pilares y bloques
      arRockEdge(P, w, h, WH - 6, 9, [[78, 16, 11], [150, 12, 9], [44, 8, 5]], '#3a2c20', '#7a6048', '#241a12');
      [[78, 11], [150, 8]].forEach(([y, r]) => { [0, 1].forEach(sd => { const x = sd ? w - 14 : 14; arEll(P, x, y, r, r + 3, '#52402e'); arEll(P, x - 1, y - 2, r - 2, r, '#6a5238'); P.alpha('#000000', .3, x - r, y + 5, r * 2 + 1, 4); for(let k = 0; k < 4; k++) P.rect('#2e231a', x - r + 1, y - 6 + k * 4, r * 2 - 2, 1); }); });   // pilares rocosos
      arRocks(P, 16, h - 3, 4, '#6b5238'); arRocks(P, w - 40, h - 3, 3, '#5e4630');
      // vagoneta aparcada (izquierda) y vagoneta cargada de cristales (derecha, sobre el ramal)
      const cart = (x, y, load) => { P.rect('#1a1612', x - 2, y + 9, 4, 2); P.rect('#1a1612', x + 13, y + 9, 4, 2); P.rect('#4a3220', x - 1, y, 17, 9); P.rect('#6b4a2a', x, y, 15, 8); P.rect('#8a6038', x, y, 15, 1); P.rect('#3a3a42', x - 1, y + 3, 17, 1); P.rect('#3a3a42', x - 1, y + 7, 17, 1);
        for(let i = 0; i < 7; i++){ const hh = 3 + (i * 3) % 4; P.rect(load[i % load.length], x + i * 2, y - hh, 3, hh + 1); P.px('#ffffff', x + i * 2, y - hh); } P.rect('#8a8f98', x + 1, y + 10, 4, 3); P.rect('#8a8f98', x + 10, y + 10, 4, 3); P.rect('#4a4a52', x + 2, y + 11, 2, 1); P.rect('#4a4a52', x + 11, y + 11, 2, 1); };
      cart(44, RY - 8, ['#14100c', '#26221e']); cart(w - 52, h - 40, ['#5ae0ff', '#ff7ad9', '#ffd36a', '#9aff7a']);
      // barriles, cajas y picos apoyados
      P.rect('#6b4a2a', 24, WH + 4, 9, 11); P.rect('#8a6038', 25, WH + 5, 7, 9); P.rect('#2a2a30', 24, WH + 7, 9, 1); P.rect('#2a2a30', 24, WH + 12, 9, 1);
      P.rect('#6b4a2a', w - 34, WH + 8, 12, 9); P.rect('#8a6038', w - 33, WH + 9, 10, 7); P.rect('#4a3220', w - 34, WH + 12, 12, 1);
      P.rect('#6a4a2a', 30, h - 28, 1, 14); P.rect('#9aa0aa', 27, h - 29, 7, 1); P.rect('#9aa0aa', 27, h - 28, 1, 2);
      return {lamps, cr, motes: arMotes(P, 36, w, h)};
    },
    anim(c, t, d, w){
      d.lamps.forEach(([x, y], i) => arGlowC(c, x, y, 13 + Math.sin(t * 7 + i * 2) * 1.6, '#ffcf5a', .3));
      d.cr.forEach(([x, y, col], i) => { const s = Math.sin(t * 2.2 + i * 1.9); if(s > .55){ c.globalAlpha = (s - .55) * 2.2; c.fillStyle = '#ffffff'; c.fillRect(x, y, 1, 1); c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 3); } c.globalAlpha = 1; arGlowC(c, x, y + 3, 7, col, .12 + .06 * s); });
      arMote(c, d.motes, t, w, '#e0c8a0', .45, 3, 5); }},

  // ---- Gardenia · Gimnasio de Ciudad Vetusta (Planta): jardín botánico interior con árboles enormes, raíces, enredaderas, flores y rayos de sol ----
  gardenia: {dark: .06,
    build(P, w, h, WH){
      P.rect('#4a9a3e', 0, WH, w, h - WH);                                                                                       // césped
      arSpeck(P, 0, WH, w, h - WH, 1600, ['#5aae4a', '#3f8a38', '#6dbb58', '#357a30', '#7ccb64']);
      for(let i = 0; i < 160; i++){ const x = P.r() * w, y = WH + 6 + P.r() * (h - WH - 8), c = ['#ff7ac8', '#ffe066', '#ffffff', '#ff9a5a', '#c89aff'][i % 5]; P.px(c, x, y); if(i % 3 === 0) P.px(arDrk(c, .2), x + 1, y); }   // flores en el prado
      for(let i = 0; i < 2; i++) for(let x = 22; x < w - 22; x += 9){ const y = WH + 5 + i * (h - WH - 20); P.rect('#6e7a5a', x, y + 1, 8, 4); P.rect(i ? '#c8c4a0' : '#d4d0aa', x, y, 8, 4); P.alpha('#ffffff', .25, x, y, 8, 1); }   // sendero de losas
      for(let i = 0; i < 18; i++) arCrack(P, P.r() * w, WH + 10 + P.r() * (h - WH - 20), 3, '#2f6a2c', 1, 0, .4);
      // pared de cristal del invernadero con costillas de hierro
      for(let y = 0; y < WH; y++) P.rect(arMix('#bfe8f0', '#9ad8b0', y / WH), 0, y, w, 1);
      arEll(P, w * .5, 6, 70, 12, '#ffffff', .35);
      for(let x = 0; x < w; x += 30){ P.rect('#d8ece4', x, 0, 1, WH - 4); P.alpha('#ffffff', .22, x + 1, 0, 12, WH - 4); }
      [8, 22].forEach(y => P.rect('#d8ece4', 0, y, w, 1));
      for(let x = 15; x < w; x += 60){ P.rect('#2a4a3a', x, 0, 3, WH); P.rect('#3a6a52', x, 0, 1, WH); }
      // árboles enormes: troncos al fondo con raíces anchas
      [.24, .5, .76].forEach((k, i) => { const x = Math.round(w * k), tw = i === 1 ? 20 : 16;
        P.rect('#4a3220', x - tw / 2, 4, tw, WH - 2); P.rect('#6b4a2a', x - tw / 2 + 2, 4, tw - 6, WH - 2); P.rect('#8a6038', x - tw / 2 + 3, 4, 2, WH - 2); P.alpha('#000000', .3, x + tw / 2 - 4, 4, 4, WH - 2);
        for(let y = 6; y < WH - 3; y += 3) P.px('#2a1c10', x - tw / 2 + 5 + (y * 5) % (tw - 10), y);
        for(let k2 = 0; k2 < 9; k2++){ P.rect('#4a3220', x - tw / 2 - k2 - 1, WH - 4 + k2 * .6, 3, 3 + k2 * .3); P.rect('#4a3220', x + tw / 2 + k2 - 2, WH - 4 + k2 * .6, 3, 3 + k2 * .3); }
        arEll(P, x, WH - 1, tw / 2 + 12, 3, '#3a2616'); });
      // bóveda de follaje que cuelga del techo
      for(let x = -6; x < w + 6; x += 6){ const r = 7 + (Math.abs(x * 13) % 7), y = 2 + (Math.abs(x * 7) % 8); arEll(P, x, y, r + 2, r - 1, '#1f5a2a'); arEll(P, x, y - 1, r, r - 2, '#2f7a3a'); arEll(P, x - 2, y - 2, r - 3, r - 4, '#4fb85a'); for(let k = 0; k < 4; k++) P.px('#8be07a', x - 5 + k * 3, y - 3 + (k % 2)); }
      // columnas de piedra cubiertas de musgo con enredaderas
      [.14, .86].forEach(k => { const x = Math.round(w * k); arColumn(P, x - 5, 8, WH + 2, 11, '#a8aa98'); for(let m = 0; m < 14; m++) P.rect(['#3f8a38', '#5aae4a', '#2f7a3a'][m % 3], x - 5 + (m * 5) % 10, 12 + (m * 7) % 22, 2 + m % 2, 1 + m % 2);
        for(let k2 = 0; k2 < 30; k2++) P.px('#2f7a3a', x - 4 + Math.round(Math.sin(k2 * .5) * 4 + 4), 8 + k2); });
      // setos y macetas junto a la pared
      for(let x = -4; x < w; x += 9){ const hh = 6 + ((x * 5) & 3); P.rect('#2f7a3a', x, WH - hh + 3, 10, hh); P.rect('#3f9a4a', x + 1, WH - hh + 3, 7, hh - 2); P.px('#6dbb58', x + 3, WH - hh + 4); }
      [.31, .69].forEach(k => arPot(P, Math.round(w * k) - 4, WH - 3, '#ff7ac8'));
      arOcclude(P, w, WH);
      // lados: troncos gigantes con raíces que invaden el suelo, helechos y enredaderas
      [0, 1].forEach(sd => { const bx = sd ? w - 20 : 0;
        P.rect('#3a2616', bx, WH - 6, 20, h - WH + 6); P.rect('#5a3c22', bx + (sd ? 3 : 1), WH - 6, 14, h - WH + 6);
        for(let y = WH - 6; y < h; y++) for(let k = 0; k < 3; k++) P.px(['#2a1a10', '#7a5632', '#4a3220'][(y + k) % 3], bx + 2 + ((y * 7 + k * 5) % 15), y);
        P.rect('#8a6038', sd ? bx + 3 : bx + 1, WH - 6, 1, h - WH + 6); P.alpha('#000000', .35, sd ? bx : bx + 16, WH - 6, 4, h - WH + 6);
        [[72, 14], [128, 18]].forEach(([ry, rl]) => { for(let k = 0; k < rl; k++){ const dx = sd ? -k - 2 : 20 + k, dy = Math.round(Math.sin(k * .35) * 3); P.rect('#4a3220', bx + dx, ry + dy, 3, 4 - (k > rl * .6 ? 1 : 0)); P.px('#7a5632', bx + dx, ry + dy); P.alpha('#000000', .25, bx + dx, ry + dy + 4, 3, 1); } });
        for(let k = 0; k < 6; k++){ const vx = bx + (sd ? 4 : 14) + Math.round(Math.sin(k) * 3); for(let y = WH; y < 80 + k * 14; y += 1) P.px('#2f7a3a', vx + Math.round(Math.sin(y * .25 + k) * 1.5), y); }
        for(let k = 0; k < 7; k++){ const fy = 56 + k * 17; for(let l = 0; l < 6; l++) arEll(P, bx + (sd ? -2 : 22) + (sd ? -1 : 1) * l * 2, fy + l, 3, 1, ['#3f9a4a', '#2f7a3a', '#5aae4a'][l % 3]); }
      });
      // rayos de sol atravesando la vegetación
      [[.2, .13], [.42, .3], [.6, .5], [.8, .74]].forEach(([k, e], i) => { arBeam(P, w * k, 0, w * e + 20, h - 6, 10 + i * 2, 30 + i * 4, '#fff6b0', .16); arPool(P, w * e + 22, h - 24 - i * 10, 22, 7, '#fff6b0', .22); });
      return {motes: arMotes(P, 46, w, h), beams: [[.2, .13], [.42, .3], [.6, .5], [.8, .74]]};
    },
    anim(c, t, d, w){
      d.beams.forEach(([k, e], i) => { c.globalAlpha = .05 + .045 * Math.sin(t * .9 + i * 1.7); c.fillStyle = '#fffbd0'; for(let y = 0; y < AR_H; y += 2){ const tt = y / AR_H; c.fillRect(Math.round(w * k + (w * e + 20 - w * k) * tt - 6), y, 12 + tt * 24, 1); } });
      c.globalAlpha = 1; arMote(c, d.motes, t, w, '#fff8a8', .75, 5, 7);
      for(let i = 0; i < 9; i++){ const x = (i * 83 + t * (7 + i)) % (w + 20) - 10, y = AR_WALL + ((i * 47 + t * (9 + i * 2)) % (AR_H - AR_WALL - 10)); c.fillStyle = i % 2 ? '#ffb3d9' : '#ffffff'; c.globalAlpha = .8; c.fillRect(Math.floor(x), Math.floor(y), 2, 1); c.fillRect(Math.floor(x) + 1, Math.floor(y) + 1, 1, 1); } c.globalAlpha = 1; }},

  // ---- Brega · Gimnasio de Ciudad Rocavelo (Lucha): dojo con tatami, suelo de madera, vigas, estandartes y zonas de entrenamiento ----
  brega: {dark: .1,
    build(P, w, h, WH){
      arPlank(P, 0, WH, w, h - WH, '#9a6a3a', 5, .16);                                                                           // marco de tablas de madera
      P.alpha('#fff0c0', .06, 0, WH, w, h - WH);
      const tx0 = 26, tx1 = w - 26, ty0 = WH + 10, ty1 = h - 6;                                                                  // zona de tatami
      P.rect('#2a1a0e', tx0 - 2, ty0 - 2, tx1 - tx0 + 4, ty1 - ty0 + 4);
      for(let r = 0, y = ty0; y < ty1; r++, y += 22){ for(let x = tx0 - (r % 2) * 22; x < tx1; x += 44){ const xx = Math.max(x, tx0), ww = Math.min(x + 43, tx1) - xx, hh = Math.min(21, ty1 - y); if(ww <= 0 || hh <= 0) continue;
        P.rect('#5e6e3c', xx, y, ww, hh); P.rect((r + (x / 44 | 0)) & 1 ? '#d2c892' : '#cac08a', xx + 1, y + 1, ww - 2, hh - 2); P.rect('#7a8a4c', xx, y, ww, 1); P.rect('#7a8a4c', xx, y + hh - 1, ww, 1);
        for(let k = 2; k < hh - 2; k += 2) P.alpha('#8a7a44', .16, xx + 1, y + k, ww - 2, 1); } }
      P.alpha('#fff4c0', .12, tx0, ty0, tx1 - tx0, 18);
      const mx = Math.round(w / 2), my = Math.round((ty0 + ty1) / 2);
      for(let a = 0; a < 360; a += 2){ const px = mx + Math.cos(a * Math.PI / 180) * 66, py = my + Math.sin(a * Math.PI / 180) * 27; P.alpha('#8a2a1a', .2, px, py, 2, 1); }      // círculo de combate (suave)
      // pared del fondo: friso de madera y paneles shoji iluminados
      P.rect('#3a2412', 0, 0, w, WH); arGradR(P, 0, 6, w, WH - 18, '#ffe9a8', '#f2d98a');
      for(let x = 0; x < w; x += 24){ P.rect('#f6ecc8', x + 1, 7, 22, WH - 20); P.alpha('#ffffff', .3, x + 1, 7, 22, 3); for(let g = 0; g < 4; g++) P.rect('#5a3a1c', x + g * 6, 7, 1, WH - 20); for(let g = 0; g < 4; g++) P.rect('#5a3a1c', x + 1, 7 + g * 5, 22, 1); P.rect('#4a2e16', x, 6, 1, WH - 18); }
      P.rect('#4a2e16', 0, 4, w, 3); P.rect('#6a4222', 0, 4, w, 1); P.rect('#4a2e16', 0, WH - 12, w, 3); P.rect('#6a4222', 0, WH - 12, w, 1); P.rect('#2a1a0e', 0, 0, w, 4);
      arPlank(P, 0, WH - 9, w, 9, '#6a4222', 4, .12); P.rect('#2a1a0e', 0, WH - 1, w, 1);
      for(let x = 12; x < w; x += 92){ P.rect('#5a3a1c', x, 0, 6, WH); P.rect('#8a5a2c', x + 1, 0, 3, WH); P.rect('#a87a3c', x + 1, 0, 1, WH); P.alpha('#000000', .35, x + 4, 0, 2, WH); }
      // estandartes de tela roja con el símbolo del puño
      [[.3, 14], [.5, 20], [.7, 14]].forEach(([k, bw]) => { const x = Math.round(w * k - bw / 2); P.rect('#3a2412', x - 2, 3, bw + 4, 2); P.rect('#8a1a1a', x, 5, bw, 26); P.rect('#b02424', x + 1, 5, bw - 2, 25); P.rect('#d8c070', x, 31, bw, 1); for(let f = 0; f < bw; f += 2) P.px('#d8c070', x + f, 32);
        P.alpha('#000000', .22, x + bw - 3, 5, 3, 26); P.rect('#f6ecc8', x + bw / 2 - 1, 9, 2, 14); P.rect('#f6ecc8', x + 3, 12, bw - 6, 2); P.rect('#f6ecc8', x + 4, 19, bw - 8, 2); P.rect('#f6ecc8', x + 3, 25, 3, 3); P.rect('#f6ecc8', x + bw - 6, 25, 3, 3); });
      arOcclude(P, w, WH);
      // lados: columnas de madera con cuerdas, sacos, muñecos de entrenamiento y soportes de armas
      [0, 1].forEach(sd => { const bx = sd ? w - 24 : 0;
        arPlank(P, bx, WH - 2, 24, h - WH + 2, '#7a4e26', 5, .18); P.rect('#2a1a0e', sd ? bx : bx + 23, WH - 2, 1, h - WH + 2); P.alpha('#000000', .3, sd ? bx - 4 : bx + 24, WH, 4, h - WH);
        for(let y = WH + 8; y < h - 4; y += 38){ const px = sd ? bx + 1 : bx + 19; P.rect('#5a3a1c', px - 1, y, 6, 26); P.rect('#8a5a2c', px, y, 3, 26); P.rect('#a87a3c', px, y, 1, 26); for(let k = 0; k < 4; k++) P.rect('#d8c8a0', px - 1, y + 5 + k * 5, 6, 1); }
      });
      // muñeco de madera de entrenamiento (izquierda) y soporte de bokken (derecha)
      P.rect('#5a3a1c', 8, h - 52, 5, 36); P.rect('#8a5a2c', 9, h - 52, 3, 36); P.rect('#6a4222', 3, h - 44, 15, 3); P.rect('#6a4222', 3, h - 36, 15, 3); P.rect('#6a4222', 6, h - 28, 9, 3); P.rect('#d8c070', 8, h - 54, 5, 2); P.rect('#3a2412', 5, h - 16, 11, 3);
      P.rect('#3a2412', w - 21, h - 56, 14, 3); P.rect('#3a2412', w - 21, h - 40, 14, 3); P.rect('#3a2412', w - 21, h - 56, 2, 19); P.rect('#3a2412', w - 9, h - 56, 2, 19);
      for(let k = 0; k < 4; k++){ P.rect('#c8a070', w - 19 + k * 3, h - 62, 2, 19); P.rect('#e8c898', w - 19 + k * 3, h - 62, 1, 19); P.rect('#3a2412', w - 19 + k * 3, h - 44, 2, 3); }
      P.rect('#3a5a6a', 6, WH + 6, 9, 11); P.rect('#5a8aa0', 7, WH + 6, 7, 10); P.rect('#3a5a6a', 5, WH + 5, 11, 2); P.alpha('#ffffff', .3, 7, WH + 7, 1, 8);       // tinaja de agua
      [.2, .8].forEach(k => arPool(P, Math.round(w * k), WH + 20, 36, 11, '#ffe7a0', .2));
      return {bags: [[Math.round(w * .13), 62, 11], [Math.round(w * .87), 62, 11], [Math.round(w * .24), 24, 8], [Math.round(w * .76), 24, 8]], lamps: [Math.round(w * .3), Math.round(w * .5), Math.round(w * .7)], motes: arMotes(P, 24, w, h)};
    },
    anim(c, t, d, w){
      d.bags.forEach(([x, len, r], i) => { const a = Math.sin(t * 1.6 + i * 1.4) * .12, bx = x + Math.sin(a) * len, by = Math.cos(a) * len;
        c.fillStyle = '#2a2018'; arLine(c, x, 0, bx, by); c.fillStyle = '#7a1a1a'; c.fillRect(Math.round(bx - r / 2), Math.round(by), r, r + 6); c.fillStyle = '#b02424'; c.fillRect(Math.round(bx - r / 2 + 1), Math.round(by), r - 3, r + 5); c.fillStyle = '#d8c070'; c.fillRect(Math.round(bx - r / 2), Math.round(by + 3), r, 1); c.fillRect(Math.round(bx - r / 2), Math.round(by + r + 2), r, 1); c.globalAlpha = .22; c.fillStyle = '#000000'; c.fillRect(Math.round(bx + r / 2 - 3), Math.round(by), 3, r + 6); c.globalAlpha = 1; });
      d.lamps.forEach((x, i) => arGlowC(c, x, 22, 12 + Math.sin(t * 3 + i) * 1, '#ffe7a0', .18));
      arMote(c, d.motes, t, w, '#fff0c0', .4, 2, 4); }},

  // ---- Fantina · Gimnasio de Ciudad Corazón (Fantasma): teatro encantado con cortinas, balcones, candelabros flotantes y luces violetas ----
  fantina: {dark: .3,
    build(P, w, h, WH){
      P.rect('#201428', 0, WH, w, h - WH);
      for(let x = 0; x < w; x += 22){ P.rect('#2a1a36', x, WH, 11, h - WH); P.rect('#150c1c', x + 11, WH, 1, h - WH); }                  // tablas del escenario
      for(let y = WH + 20; y < h; y += 26) P.alpha('#0a0510', .25, 0, y, w, 1);
      for(let i = 0; i < 160; i++) P.px(['#3a2450', '#150c1c', '#4a3068'][i % 3], P.r() * w, WH + P.r() * (h - WH));
      [.5, .2, .8].forEach((k, i) => arPool(P, w * k, WH + 24 + i * 26, 70 - i * 14, 20 - i * 3, '#b070ff', .22));                  // focos violetas en el suelo
      for(let x = 20; x < w - 20; x += 36){ P.rect('#6a4a2a', x, h - 8, 8, 4); P.rect('#ffcf7a', x + 1, h - 8, 6, 2); }                          // candilejas
      // telón de fondo: cielo nocturno con luna y mansión
      for(let y = 0; y < WH; y++) P.rect(arMix('#1a1030', '#3a2256', y / WH), 0, y, w, 1);
      arStars(P, 0, 0, w, WH - 10, 50, ['#ffffff', '#d8c8ff', '#9a8aff']);
      arEll(P, w * .5, 15, 11, 11, '#e8defa'); arEll(P, w * .5 + 3, 13, 9, 9, '#f6f0ff'); arEll(P, w * .5 + 5, 12, 3, 3, '#cdbcea'); arEll(P, w * .5 - 3, 17, 2, 2, '#cdbcea');
      arPool(P, w * .5, 15, 30, 22, '#c8a8ff', .2);
      for(let x = 0; x < w; x += 1){ const th = 8 + Math.round(Math.abs(Math.sin(x * .07)) * 6 + (x % 17 < 3 ? 6 : 0)); P.rect('#0d0716', x, WH - th - 2, 1, th + 2); }
      for(let x = 20; x < w - 20; x += 40){ P.rect('#0d0716', x, WH - 24, 9, 22); P.rect('#0d0716', x + 3, WH - 30, 3, 6); P.rect('#ffd36a', x + 3, WH - 18, 2, 3); }
      // cortinas de terciopelo recogidas con borlas, y cenefa superior
      [0, 1].forEach(sd => { const cw = Math.round(w * .13);
        for(let i = 0; i < cw; i++){ const x = sd ? w - 1 - i : i, k = Math.sin(i * .9) * .5 + .5, col = arMix('#4a1238', '#8a2a5a', k * (1 - i / cw * .3)); P.rect(col, x, 0, 1, WH + Math.round(Math.sin(i * .5) * 3)); P.alpha('#000000', .35 * (1 - k), x, 0, 1, WH); }
        const tx = sd ? w - cw - 2 : cw + 1; P.rect('#d8b060', tx - 2, 24, 4, 3); for(let f = 0; f < 4; f++) P.px('#d8b060', tx - 1 + f % 2, 27 + f); });
      for(let x = 0; x < w; x += 8){ P.rect('#5a1238', x, 0, 8, 7); P.rect('#8a2a5a', x, 0, 8, 4); P.rect('#d8b060', x, 6, 8, 1); P.rect('#d8b060', x + 3, 7, 2, 2); P.px('#d8b060', x + 3, 9); }
      arOcclude(P, w, WH);
      // lados: palcos con barandilla dorada, terciopelo rojo y espectadores fantasma
      const ghosts = [];
      [0, 1].forEach(sd => { const bx = sd ? w - 30 : 0;
        P.rect('#150c1c', bx, WH - 2, 30, h - WH + 2); P.alpha('#7a4aa8', .1, bx, WH - 2, 30, h - WH + 2);
        for(let tier = 0; tier < 2; tier++){ const y = WH + 10 + tier * 58, ph = 44;
          P.rect('#d8b060', bx + 2, y - 5, 26, 2); P.rect('#3a2412', bx + 2, y - 3, 26, ph + 5);
          P.rect('#08040c', bx + 5, y, 20, ph); arEll(P, bx + 15, y + 4, 10, 6, '#08040c'); P.rect('#6a1a3a', bx + 5, y + 32, 20, 12); P.rect('#8a2a5a', bx + 5, y + 32, 20, 2);
          P.rect('#d8b060', bx + 2, y + ph, 26, 2); for(let k = 0; k < 7; k++) P.rect('#d8b060', bx + 3 + k * 4, y + ph + 2, 1, 5);
          const gx = bx + 11 + (tier ? 3 : 0), gy = y + 14; arEll(P, gx + 3, gy + 4, 5, 6, '#b8a0e8', .3); P.rect('#b8a0e8', gx - 2, gy + 6, 11, 8); P.alpha('#b8a0e8', .25, gx - 2, gy + 6, 11, 8); P.rect('#08040c', gx + 1, gy + 3, 2, 2); P.rect('#08040c', gx + 5, gy + 3, 2, 2); ghosts.push([gx + 2, gy + 3]); }
      });
      return {flames: [[.28, 64], [.72, 64], [.4, 44], [.6, 44]], ghosts, motes: arMotes(P, 40, w, h)};
    },
    anim(c, t, d, w){
      d.flames.forEach(([k, yy], i) => { const x = Math.round(w * k), y = yy + Math.round(Math.sin(t * 1.4 + i * 1.7) * 3);
        c.fillStyle = '#d8b060'; c.fillRect(x - 7, y, 15, 2); c.fillRect(x, y - 5, 1, 6); c.fillRect(x - 2, y + 2, 5, 1); c.fillRect(x - 1, y + 3, 3, 3);
        [-6, 0, 6].forEach((dx, j) => { c.fillStyle = '#f0e8ff'; c.fillRect(x + dx - 1, y - 6, 3, 5); arFlame(c, x + dx, y - 6, t, i * 3 + j, '#b070ff', '#f0e0ff'); });
        arGlowC(c, x, y - 6, 16, '#a060ff', .14 + .04 * Math.sin(t * 3 + i)); });
      d.ghosts.forEach(([x, y], i) => { if(Math.sin(t * .8 + i * 2.3) > -.5){ c.fillStyle = '#ffffff'; c.fillRect(x, y, 1, 1); c.fillRect(x + 4, y, 1, 1); } });
      arMote(c, d.motes, t, w, '#c8a8ff', .55, 2, -3); }}
});

Object.assign(ARENAS, {

  // ---- Acerón · Gimnasio de Ciudad Canal (Acero): fábrica industrial con plataformas, engranajes, tuberías, cadenas, grúa, maquinaria y vapor ----
  aceron: {dark: .22,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 14, 14, (x, y) => ['#4e5666', '#485060', '#545c6c', '#444c5c'][(x * 5 + y * 3) % 4], '#2a3038', .1);                      // suelo de chapa
      for(let y = WH; y < h; y += 14) for(let x = 0; x < w; x += 14){ P.rect('#6a7486', x + 3, y + 3, 8, 1); P.rect('#6a7486', x + 6, y + 1, 1, 12); P.px('#2a3038', x + 12, y + 12); }          // dibujo de chapa lagrimada
      arSpeck(P, 0, WH, w, h - WH, 500, ['#3a4250', '#5e6676', '#2a3038']);
      for(let i = 0; i < 6; i++) arEll(P, arRnd(P, 30, w - 30), arRnd(P, WH + 16, h - 12), 8 + P.r() * 8, 3 + P.r() * 3, '#14181e', .3);                       // manchas de aceite
      // pasillo de seguridad con franjas amarillas y negras alrededor del patio
      const hz = (x0, y0, ww, hh) => { for(let y = y0; y < y0 + hh; y++) for(let x = x0; x < x0 + ww; x++) P.px(((x + y) >> 2) & 1 ? '#e8c020' : '#22242a', x, y); P.alpha('#000000', .25, x0, y0 + hh - 1, ww, 1); };
      hz(26, WH + 8, w - 52, 3); hz(26, h - 8, w - 52, 3); hz(26, WH + 8, 3, h - WH - 8); hz(w - 29, WH + 8, 3, h - WH - 8);
      // pared del fondo: paneles remachados, tuberías, pasarela y horno
      arBricks(P, 0, 0, w, WH, 22, 10, '#323946', '#1a1e26', .08);
      for(let x = 0; x < w; x += 22) for(let y = 2; y < WH; y += 10){ P.px('#5a6478', x + 2, y + 2); P.px('#5a6478', x + 19, y + 2); }
      [[5, '#8a3a2a'], [12, '#9a6a3a'], [17, '#5a6678']].forEach(([y, col]) => { P.rect(arDrk(col, .4), 0, y, w, 5); P.rect(col, 0, y, w, 3); P.rect(arLit(col, .35), 0, y, w, 1); for(let x = 14; x < w; x += 46){ P.rect(arDrk(col, .5), x, y - 1, 3, 7); P.rect(arLit(col, .2), x, y - 1, 1, 7); } });
      P.rect('#20252d', 0, 24, w, 3); P.rect('#6a7486', 0, 24, w, 1);                                                                                          // pasarela metálica
      for(let x = 0; x < w; x += 6){ P.rect('#3a4250', x, 27, 1, 5); P.rect('#6a7486', x, 22, 1, 3); } P.rect('#8a94a6', 0, 21, w, 1); P.rect('#6a7486', 0, 23, w, 1);
      for(let x = 0; x < w; x += 40) P.rect('#20252d', x, 24, 3, WH - 24);
      const fx = Math.round(w * .5);
      P.rect('#14100e', fx - 17, 12, 34, WH - 12); P.rect('#3a4250', fx - 19, 10, 38, 3); P.rect('#3a4250', fx - 19, 10, 3, WH - 10); P.rect('#3a4250', fx + 16, 10, 3, WH - 10);
      P.rect('#ff7a1a', fx - 14, 17, 28, WH - 18); P.rect('#ffb040', fx - 10, 21, 20, WH - 22); P.rect('#fff2a0', fx - 5, 26, 10, WH - 27);
      for(let x = fx - 14; x < fx + 14; x += 4) P.rect('#14100e', x, 17, 1, WH - 17);                                                                          // rejilla del horno
      arPool(P, fx, WH + 14, 54, 12, '#ff9030', .22);
      // lados: calderas, tuberías verticales, válvulas y cajas
      [0, 1].forEach(sd => { const bx = sd ? w - 30 : 0;
        P.rect('#262c36', bx, WH - 2, 30, h - WH + 2); P.alpha('#000000', .25, sd ? bx - 3 : bx + 30, WH, 3, h - WH);
        arBricks(P, bx, WH - 2, 30, h - WH + 2, 15, 8, '#3a4250', '#20252d', .08);
        const px = sd ? bx + 3 : bx + 21; [0, 7].forEach(o => { P.rect('#5a6678', px + o * (sd ? 1 : -1), WH - 2, 5, h - WH + 2); P.rect('#8a94a6', px + o * (sd ? 1 : -1), WH - 2, 1, h - WH + 2); P.alpha('#000000', .3, px + o * (sd ? 1 : -1) + 4, WH - 2, 1, h - WH + 2); });
        for(let y = WH + 14; y < h - 8; y += 34){ const x0 = sd ? bx + 1 : bx + 17; P.rect('#3a4250', x0 - 1, y, 14, 4); P.rect('#8a94a6', x0 - 1, y, 14, 1); P.rect('#c03a2a', x0 + 4, y - 5, 3, 5); P.rect('#e8c020', x0 + 3, y - 6, 5, 2); }                                // bridas y válvulas
        const ty = 66, tx = sd ? bx + 4 : bx + 4;
        P.rect('#2a313c', tx - 1, ty - 1, 24, 46); arEll(P, tx + 11, ty + 8, 12, 9, '#6a7486'); P.rect('#6a7486', tx, ty + 8, 23, 22); arEll(P, tx + 11, ty + 30, 12, 8, '#4e5666'); P.rect('#8a94a6', tx + 2, ty + 5, 3, 28);        // caldera
        for(let k = 0; k < 3; k++){ P.rect('#3a4250', tx, ty + 12 + k * 7, 23, 2); for(let r = 0; r < 5; r++) P.px('#a0aabc', tx + 2 + r * 5, ty + 12 + k * 7); }
        arEll(P, tx + 14, ty + 4, 4, 4, '#e8ecf4'); arEll(P, tx + 14, ty + 4, 3, 3, '#1a1e26'); P.rect('#c03a2a', tx + 14, ty + 3, 3, 1);                              // manómetro
      });
      // cajas y barriles de la fábrica
      for(let i = 0; i < 3; i++){ P.rect('#6a5230', 32 + i * 9, h - 22 - (i === 1 ? 7 : 0), 9, 9); P.rect('#8a6a3a', 33 + i * 9, h - 21 - (i === 1 ? 7 : 0), 7, 7); P.rect('#4a3820', 32 + i * 9, h - 18 - (i === 1 ? 7 : 0), 9, 1); }
      P.rect('#3a5a8a', w - 46, h - 24, 7, 11); P.rect('#5a82b8', w - 45, h - 24, 5, 10); P.rect('#2a3a5a', w - 46, h - 20, 7, 1);
      arOcclude(P, w, WH);
      return {fx, gears: [[Math.round(w * .33), 13, 8, 1], [Math.round(w * .67), 13, 8, -1], [Math.round(w * .4), 17, 5, -1], [Math.round(w * .6), 17, 5, 1]], vents: [[26, WH + 10], [w - 26, WH + 10], [32, h - 20], [w - 32, h - 20]], chains: [Math.round(w * .22), Math.round(w * .78), Math.round(w * .45)], motes: arMotes(P, 24, w, h)};
    },
    anim(c, t, d, w){
      d.gears.forEach(([x, y, r, dir], i) => arGear(c, x, y, r, r + 4, t * .8 * dir + i, i % 2 ? '#5a6678' : '#7a8498', '#262c36'));
      arGlowC(c, d.fx, 30, 22 + Math.sin(t * 8) * 2, '#ff8a2a', .24 + .05 * Math.sin(t * 11));
      d.chains.forEach((x, i) => { const a = Math.sin(t * 1.3 + i) * 3; c.fillStyle = '#5a6678'; for(let k = 0; k < 18; k++){ const xx = Math.round(x + a * k / 18), yy = 3 + k * 2; c.fillRect(xx, yy, 1, 1); c.fillRect(xx + (k & 1), yy + 1, 1, 1); } c.fillStyle = '#e8c020'; c.fillRect(Math.round(x + a) - 2, 40, 5, 3); });
      d.vents.forEach(([vx, vy], i) => { for(let k = 0; k < 6; k++){ const ph = ((t * .5 + i * .27 + k / 6) % 1), s = 2 + ph * 7; c.globalAlpha = (1 - ph) * .35; c.fillStyle = '#e8eef6'; c.fillRect(Math.round(vx - s / 2 + Math.sin(k * 3 + t) * 2 + (i % 2 ? -ph * 4 : ph * 4)), Math.round(vy - ph * 32), Math.round(s), Math.round(s * .8)); } c.globalAlpha = 1; });
      if(Math.sin(t * 5) > .85){ c.fillStyle = '#ffd36a'; for(let k = 0; k < 4; k++) c.fillRect(Math.round(d.fx - 18 + HH(Math.floor(t * 9), k) * 36), 30 + Math.round(HH(k, Math.floor(t * 9)) * 24), 1, 1); }
      arMote(c, d.motes, t, w, '#e8d8b0', .35, 2, 4); }},

  // ---- Mananti · Gimnasio de Ciudad Pradera (Agua): pabellón elegante de mármol blanco construido alrededor del agua, con canales, cascadas y puentes ----
  mananti: {dark: .1,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 18, 18, (x, y) => (x + y) & 1 ? '#c8dce6' : '#b8d0dc', '#86a8bc', .14);                                                     // mármol claro
      arSpeck(P, 0, WH, w, h - WH, 420, ['#e8f2f6', '#bcd0da', '#f4fafc']);
      for(let i = 0; i < 12; i++) arCrack(P, P.r() * w, WH + 20 + P.r() * (h - WH - 30), 8 + P.r() * 10, '#a8c0cc', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .3);
      // cenefa azul en el suelo (greca con olas)
      for(let x = 40; x < w - 40; x += 6){ P.rect('#6aa8d0', x, WH + 12, 4, 1); P.rect('#6aa8d0', x + 2, WH + 13, 2, 1); P.rect('#6aa8d0', x, h - 13, 4, 1); P.rect('#6aa8d0', x + 2, h - 14, 2, 1); }
      // pared del fondo: pabellón de columnas blancas con arcos de cristal azul que dan al mar
      for(let y = 0; y < WH; y++) P.rect(arMix('#bfe4f6', '#6ab0e0', y / WH), 0, y, w, 1);
      arEll(P, w * .5, 10, 60, 8, '#ffffff', .3);
      for(let x = 0; x < w; x += 4) P.rect('#5a9ad0', x, 22 + Math.round(Math.sin(x * .3) * 1), 2, 1);                                                          // horizonte de olas
      const cw = 52;
      for(let x = 8; x < w - 20; x += cw){ P.rect('#eef6fa', x, 4, 4, WH - 4); P.rect('#ffffff', x, 4, 1, WH - 4); P.alpha('#7aa8c8', .5, x + 3, 4, 1, WH - 4); P.rect('#d4e6ee', x - 2, 2, 8, 3); P.rect('#d4e6ee', x - 2, WH - 4, 8, 4);
        for(let a = 0; a < cw - 8; a++){ const yy = 5 + Math.round(Math.sqrt(Math.max(0, 1 - Math.pow((a - (cw - 8) / 2) / ((cw - 8) / 2), 2))) * -6) + 6; P.px('#eef6fa', x + 4 + a, yy); P.px('#d4e6ee', x + 4 + a, yy + 1); } }
      P.rect('#eef6fa', 0, 0, w, 3); P.rect('#ffffff', 0, 0, w, 1); P.rect('#9ab8c8', 0, 3, w, 1);
      // estanque del fondo con cascadas desde la pared y un puente de madera
      const py = WH - 2, ph = 14;
      P.rect('#d4e6ee', 0, py - 2, w, 2); P.rect('#ffffff', 0, py - 2, w, 1);
      for(let y = 0; y < ph; y++) P.rect(arMix('#4aa8e0', '#2a78c0', y / ph), 0, py + y, w, 1);
      P.rect('#9ab8c8', 0, py + ph, w, 2); P.rect('#eef6fa', 0, py + ph + 2, w, 1);
      const bxm = Math.round(w / 2);
      P.rect('#6a4a2a', bxm - 30, py - 4, 60, 3); P.rect('#8a6038', bxm - 30, py - 4, 60, 1);
      for(let x = bxm - 30; x <= bxm + 30; x += 6){ P.rect('#6a4a2a', x, py - 10, 2, 7); P.rect('#8a6038', x, py - 10, 1, 7); } P.rect('#8a6038', bxm - 30, py - 11, 61, 2); P.rect('#6a4a2a', bxm - 30, py - 9, 61, 1);
      P.alpha('#000000', .25, bxm - 30, py - 1, 60, 3);
      // lados: canales de agua con bordillo de piedra, puentecillos y fuentes
      const wat = [];
      [0, 1].forEach(sd => { const cx0 = sd ? w - 34 : 8, cwd = 26;
        P.rect('#d4e6ee', cx0 - 3, py - 2, cwd + 6, h - py + 2); P.rect('#ffffff', cx0 - 3, py - 2, cwd + 6, 1); P.rect('#9ab8c8', cx0 - 3, py - 2, 1, h - py + 2); P.rect('#9ab8c8', cx0 + cwd + 2, py - 2, 1, h - py + 2);
        for(let y = py + 2; y < h; y++) P.rect(arMix('#4aa8e0', '#2a78c0', (y - py) / (h - py)), cx0, y, cwd, 1); P.alpha('#000000', .2, cx0, py + 2, 2, h - py);
        wat.push([cx0, py + 2, cwd, h - py - 2]);
        for(let br = 0; br < 2; br++){ const by = 74 + br * 54; P.rect('#d4e6ee', cx0 - 3, by, cwd + 6, 11); P.rect('#ffffff', cx0 - 3, by, cwd + 6, 1); P.rect('#9ab8c8', cx0 - 3, by + 10, cwd + 6, 1); for(let k = 0; k < cwd + 6; k += 4) P.rect('#eef6fa', cx0 - 3 + k, by - 4, 2, 4); P.rect('#eef6fa', cx0 - 3, by - 5, cwd + 6, 1); P.alpha('#000000', .25, cx0, by + 11, cwd, 3); }
        const lx = sd ? cx0 - 8 : cx0 + cwd + 4; for(let k = 0; k < 2; k++){ arEll(P, lx + 2, 52 + k * 82, 4, 3, '#eef6fa'); P.rect('#eef6fa', lx, 52 + k * 82, 5, 5); arEll(P, lx + 2, 51 + k * 82, 3, 2, '#7ac0f0'); }       // fuentes
      });
      // cascadas de la pared (lados del puente)
      const falls = [Math.round(w * .3), Math.round(w * .7), Math.round(w * .14), Math.round(w * .86)];
      falls.forEach(x => { P.rect('#c8dce6', x - 4, 8, 9, 4); P.rect('#eef6fa', x - 3, 12, 7, 2); arEll(P, x, 12, 4, 2, '#8ac8f0'); });
      arPool(P, w * .5, WH + 20, 140, 26, '#ffffff', .12);
      arOcclude(P, w, WH);
      return {wat, falls, py, ph, motes: arMotes(P, 26, w, h)};
    },
    anim(c, t, d, w){
      d.wat.forEach(([x, y, ww, hh], i) => { c.fillStyle = '#ffffff'; for(let k = 0; k < 14; k++){ const yy = y + ((k * 13 + t * 9 * (i ? -1 : 1)) % hh + hh) % hh, xx = x + 2 + Math.round((Math.sin(yy * .3 + t + k) * .5 + .5) * (ww - 8)); c.globalAlpha = .35; c.fillRect(xx, Math.round(yy), 4 + k % 3, 1); } c.globalAlpha = 1; });
      c.fillStyle = '#ffffff'; for(let k = 0; k < 30; k++){ const xx = (k * 53 + t * (4 + k % 3)) % w, yy = d.py + 1 + (k * 7) % (d.ph - 2); c.globalAlpha = .3; c.fillRect(Math.floor(xx), yy, 3, 1); } c.globalAlpha = 1;
      d.falls.forEach((x, i) => { for(let k = 0; k < 9; k++){ const yy = 13 + ((k * 4 + t * 26 + i * 3) % 24); c.globalAlpha = .75; c.fillStyle = k % 2 ? '#ffffff' : '#bfe4f8'; c.fillRect(x - 2 + (k % 2), Math.round(yy), 4 - (k % 2), 3); } c.globalAlpha = .4; c.fillStyle = '#ffffff'; c.fillRect(x - 5, d.py - 1, 11, 2); c.globalAlpha = 1; });
      for(let k = 0; k < 6; k++){ c.fillStyle = '#ffffff'; c.globalAlpha = .5 * Math.abs(Math.sin(t * 2 + k * 2)); c.fillRect(Math.round(w * (.2 + k * .12)), 8 + (k * 5) % 12, 1, 1); } c.globalAlpha = 1;
      arMote(c, d.motes, t, w, '#ffffff', .5, 1, 2); }},

  // ---- Inverna · Gimnasio de Ciudad Puntaneva (Hielo): caverna glacial con suelo de hielo, cristales enormes, columnas congeladas y nieve ----
  inverna: {dark: .12,
    build(P, w, h, WH){
      for(let y = WH; y < h; y++) P.rect(arMix('#a4d2ec', '#6aa8d2', (y - WH) / (h - WH)), 0, y, w, 1);                                                           // hielo brillante
      for(let i = 0; i < 26; i++){ const x = arRnd(P, 0, w), y = arRnd(P, WH, h); P.alpha('#ffffff', .1 + P.r() * .1, x, y, 10 + P.r() * 30, 1 + (P.r() * 2 | 0)); }
      for(let i = 0; i < 16; i++) arCrack(P, arRnd(P, 20, w - 20), arRnd(P, WH + 6, h - 6), 10 + P.r() * 22, '#e8fbff', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .5);
      for(let i = 0; i < 10; i++) arCrack(P, arRnd(P, 20, w - 20), arRnd(P, WH + 6, h - 6), 10 + P.r() * 18, '#6aa8cc', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .5);
      for(let k = 0; k < 4; k++) arBeam(P, w * (.1 + k * .28), WH, w * (.1 + k * .28) + 40, h, 6, 22, '#ffffff', .12);                                         // destellos sobre el hielo
      for(let i = 0; i < 400; i++) P.px(['#ffffff', '#bfe4f4', '#7ab8dc'][i % 3], P.r() * w, WH + P.r() * (h - WH));
      // pared de hielo translúcido: capas azules con luz detrás
      for(let y = 0; y < WH; y++) P.rect(arMix('#5aa0d0', '#cfeaf8', y / WH), 0, y, w, 1);
      for(let x = 0; x < w; x += 7){ const hh = WH - 6 + Math.round(Math.sin(x * .2) * 4); P.rect(arMix('#8ac8ec', '#e8fbff', (x % 21) / 21), x, 6, 5, hh); P.alpha('#ffffff', .35, x, 6, 1, hh); P.alpha('#2a6aa0', .3, x + 4, 6, 1, hh); }
      arPool(P, w * .5, 18, 90, 20, '#ffffff', .3);
      // gran cristal central y cristales en la pared
      arCrystal(P, Math.round(w * .5), WH, 32, '#7ad8ff'); arCrystal(P, Math.round(w * .5) - 16, WH, 20, '#bfeaff'); arCrystal(P, Math.round(w * .5) + 15, WH, 22, '#9ae0ff');
      [.2, .35, .65, .8].forEach((k, i) => arCrystal(P, Math.round(w * k), WH, 12 + i % 2 * 5, i % 2 ? '#b8f0ff' : '#8ad0ff'));
      // carámbanos del techo
      for(let x = 2; x < w; x += 4 + (x * 7) % 5){ const len = 5 + (x * 11) % 14; for(let k = 0; k < len; k++){ const wi = Math.max(1, Math.round(3 * (1 - k / len))); P.rect(k % 3 ? '#e8fbff' : '#b8e6f8', x - (wi >> 1), k, wi, 1); } }
      // columnas congeladas
      [.12, .88, .32, .68].forEach((k, i) => { if(i > 1) return; const x = Math.round(w * k); P.rect('#6aa8cc', x - 6, 6, 13, WH + 2); P.rect('#bfe6f6', x - 5, 6, 10, WH + 2); P.rect('#ffffff', x - 4, 6, 2, WH + 2); P.alpha('#2a6aa0', .35, x + 2, 6, 4, WH + 2); for(let y = 10; y < WH; y += 6) P.alpha('#2a6aa0', .25, x - 5, y, 10, 1); P.rect('#8ac8ec', x - 8, 4, 17, 3); P.rect('#8ac8ec', x - 8, WH, 17, 3); });
      arOcclude(P, w, WH);
      // lados: acantilados de hielo con cristales y pilares congelados
      arRockEdge(P, w, h, WH - 6, 10, [[70, 18, 13], [138, 14, 11], [36, 8, 6]], '#7ab6dc', '#e8fbff', '#3a7aa8');
      [[70, 14], [138, 12]].forEach(([y, r], i) => { [0, 1].forEach(sd => { const x = sd ? w - 26 : 26; arCrystal(P, x, y + 16, 26 + i * 4, ['#7ad8ff', '#bfeaff'][(i + sd) % 2]); arCrystal(P, sd ? x + 9 : x - 9, y + 22, 16, '#9ae0ff'); }); });
      [[104, 7], [168, 8]].forEach(([y, r]) => [0, 1].forEach(sd => { const x = sd ? w - 22 : 22; arEll(P, x, y, r + 4, r + 1, '#eaf8ff'); arEll(P, x - 2, y - 1, r, r - 1, '#ffffff'); }));         // montones de nieve
      for(let i = 0; i < 4; i++){ arEll(P, 18 + i * 9, h - 2, 9, 5, '#f4fbff'); arEll(P, w - 18 - i * 9, h - 2, 9, 5, '#eaf8ff'); }
      return {flakes: arMotes(P, 70, w, h), cry: [[w * .5, WH - 20], [w * .5 - 16, WH - 12], [w * .5 + 15, WH - 13], [w * .2, WH - 8], [w * .8, WH - 8]]};
    },
    anim(c, t, d, w){
      d.cry.forEach(([x, y], i) => { const s = Math.sin(t * 2.4 + i * 1.7); arGlowC(c, Math.round(x), Math.round(y), 9, '#bff0ff', .1 + .06 * s); if(s > .6){ c.globalAlpha = (s - .6) * 2.4; c.fillStyle = '#ffffff'; x = Math.round(x); y = Math.round(y); c.fillRect(x, y, 1, 1); c.fillRect(x - 2, y, 5, 1); c.fillRect(x, y - 2, 1, 5); c.globalAlpha = 1; } });
      c.fillStyle = '#ffffff'; const span = AR_H;
      d.flakes.forEach(([x, y, ph], i) => { const yy = ((y + t * (6 + ph * 10)) % span), xx = ((x + Math.sin(t * .8 + ph * 12) * 4 + t * 2) % w + w) % w; c.globalAlpha = .55 + .35 * ph; c.fillRect(Math.floor(xx), Math.floor(yy), 1 + (ph > .8 ? 1 : 0), 1 + (ph > .8 ? 1 : 0)); });
      c.globalAlpha = 1; }},

  // ---- Lectro · Gimnasio de Ciudad Marina (Eléctrico): central eléctrica futurista con generadores, cables, bobinas, paneles y descargas ----
  lectro: {dark: .26,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 16, 16, (x, y) => (x + y) & 1 ? '#1e2638' : '#222c40', '#0e1420', .1);                                                       // suelo metálico oscuro
      arSpeck(P, 0, WH, w, h - WH, 500, ['#2a3650', '#161c2c', '#34425e']);
      // circuitos luminosos en el suelo: líneas que salen de los lados hacia el centro (sin llegar a él)
      const tr = [];
      [[WH + 22, 1], [WH + 52, -1], [h - 40, 1], [h - 18, -1], [WH + 80, 1]].forEach(([y, dir], i) => { const x0 = dir > 0 ? 24 : w - 24, len = 40 + (i * 23) % 40; for(let k = 0; k < len; k++){ const xx = x0 + dir * k; const yy = y + (k > len * .55 ? Math.round((k - len * .55) * (i % 2 ? .6 : -.6)) : 0); P.px(i % 2 ? '#2ad8ff' : '#ffe14a', xx, yy); P.alpha(i % 2 ? '#2ad8ff' : '#ffe14a', .25, xx, yy - 1, 1, 3); } P.rect(i % 2 ? '#2ad8ff' : '#ffe14a', x0 + dir * len - 1, y + (len * .45) * (i % 2 ? .6 : -.6) - 1, 3, 3); tr.push([x0, y, dir, len, i]); });
      for(let i = 0; i < 24; i++){ const x = arRnd(P, 30, w - 30), y = arRnd(P, WH + 8, h - 8); P.px('#2ad8ff', x, y); P.px('#0e1420', x + 1, y); }
      // pared del fondo: paneles, monitores, tubos de neón y reactor central
      P.rect('#161c2c', 0, 0, w, WH); arBricks(P, 0, 0, w, WH, 18, 9, '#1c2438', '#0e1420', .08);
      for(let x = 8; x < w - 20; x += 36){ const sx = x + ((x * 7) % 5); P.rect('#0a0e18', sx - 1, 6, 22, 14); P.rect('#0e2a3a', sx, 7, 20, 12); for(let k = 0; k < 9; k++){ const bh = 2 + Math.abs(Math.sin(k * 1.7 + x)) * 8 | 0; P.rect(k % 3 ? '#2ad8ff' : '#7affc8', sx + 1 + k * 2, 18 - bh, 1, bh); } P.alpha('#ffffff', .15, sx, 7, 20, 2); }
      [4, 22].forEach((y, i) => { P.rect(i ? '#ffe14a' : '#2ad8ff', 0, y, w, 1); P.alpha(i ? '#ffe14a' : '#2ad8ff', .3, 0, y + 1, w, 2); P.alpha(i ? '#ffe14a' : '#2ad8ff', .15, 0, y - 2, w, 2); });
      const rx = Math.round(w * .5);
      P.rect('#0a0e18', rx - 13, 3, 27, WH - 1); P.rect('#3a4a6a', rx - 15, 2, 31, 4); P.rect('#3a4a6a', rx - 15, WH - 4, 31, 5); P.rect('#1a2a40', rx - 11, 6, 23, WH - 11); P.rect('#bfe8ff', rx - 3, 6, 7, WH - 11); P.rect('#ffffff', rx - 1, 6, 3, WH - 11);
      arPool(P, rx, WH + 12, 70, 14, '#4ad8ff', .22);
      [.3, .7].forEach(k => { const gx = Math.round(w * k); P.rect('#2a3650', gx - 11, 8, 23, WH - 8); P.rect('#3a4a6a', gx - 10, 9, 21, 6); P.rect('#0a0e18', gx - 6, 18, 13, 12); P.rect('#ffe14a', gx - 5, 19, 11, 10); P.rect('#ffffff', gx - 3, 21, 7, 6); for(let k2 = 0; k2 < 4; k2++) P.rect('#1a2236', gx - 10 + k2 * 6, 9, 1, 6); });
      // lados: bobinas Tesla, transformadores y haces de cables
      const coils = [];
      [0, 1].forEach(sd => { const bx = sd ? w - 34 : 0;
        P.rect('#10151f', bx, WH - 2, 34, h - WH + 2); P.alpha('#000000', .3, sd ? bx - 3 : bx + 34, WH, 3, h - WH); arBricks(P, bx, WH - 2, 34, h - WH + 2, 17, 8, '#1a2236', '#0a0e18', .08);
        for(let y = WH + 6; y < h - 6; y += 24) for(let k = 0; k < 2; k++) { P.rect('#e8c020', sd ? bx + 1 + k * 3 : bx + 29 - k * 3, y, 2, 4); P.rect('#14181e', sd ? bx + 1 + k * 3 : bx + 29 - k * 3, y + 4, 2, 4); }
        const cx = sd ? bx + 17 : bx + 17, base = h - 30;
        P.rect('#2a3650', cx - 11, base, 23, 14); P.rect('#3a4a6a', cx - 11, base, 23, 2); P.rect('#ffe14a', cx - 6, base + 5, 3, 3); P.rect('#2ad8ff', cx + 2, base + 5, 3, 3);
        for(let r = 0; r < 12; r++){ const rw = 12 - Math.floor(r * .6), y = base - 3 - r * 3; P.rect('#8a5a2a', cx - (rw >> 1), y, rw, 2); P.rect('#d89a4a', cx - (rw >> 1), y, rw, 1); P.alpha('#000000', .3, cx + (rw >> 1) - 1, y, 1, 2); }
        arEll(P, cx, base - 41, 10, 3, '#9aa6c0'); arEll(P, cx, base - 42, 8, 2, '#d0d8ea'); P.rect('#9aa6c0', cx - 1, base - 46, 3, 4); P.rect('#e8f0ff', cx - 1, base - 47, 3, 2);
        coils.push([cx, base - 47]);
        for(let k = 0; k < 4; k++){ P.rect('#07090f', sd ? bx - 2 - k * 0 : bx + 30, WH + 14 + k * 22, 6, 3); P.rect('#2a3650', sd ? bx : bx + 31, WH + 14 + k * 22, 5, 1); }
      });
      for(let i = 0; i < 5; i++) arCrack(P, 36 + i * 14, h - 3, 18, '#07090f', 1, 0, .3);                                                                       // cables por el suelo
      arCrack(P, 36, h - 6, w - 72, '#07090f', 1, 0, .3);
      arOcclude(P, w, WH);
      return {coils, rx, tr, motes: arMotes(P, 20, w, h)};
    },
    anim(c, t, d, w){
      const fl = Math.floor(t * 14);
      arGlowC(c, d.rx, 18, 20 + Math.sin(t * 6) * 2, '#bfe8ff', .22 + .06 * Math.sin(t * 9));
      d.tr.forEach(([x0, y, dir, len, i]) => { const k = Math.floor((t * 24 + i * 13) % (len + 20)); if(k < len){ c.fillStyle = '#ffffff'; c.fillRect(x0 + dir * k, y + (k > len * .55 ? Math.round((k - len * .55) * (i % 2 ? .6 : -.6)) : 0), 2, 1); } });
      const [a, b] = d.coils, g1 = Math.round(w * .3), g2 = Math.round(w * .7);
      if(Math.sin(t * 3.1) > -.2){ arBolt(c, g1 + 11, 24, d.rx - 14, 22, fl, '#e8f8ff', '#4ad8ff'); arBolt(c, g2 - 11, 24, d.rx + 14, 22, fl + 7, '#e8f8ff', '#4ad8ff'); }
      if(Math.sin(t * 1.3) > .1) arBolt(c, a[0], a[1], a[0] + (a[0] < w / 2 ? 14 : -14), a[1] - 24, fl + 3, '#fff4a0', '#ffe14a');
      if(Math.sin(t * 1.7 + 2) > .1) arBolt(c, b[0], b[1], b[0] + (b[0] < w / 2 ? 14 : -14), b[1] - 24, fl + 5, '#fff4a0', '#ffe14a');
      if(Math.sin(t * .9 + 1) > .4) arBolt(c, a[0], a[1], b[0], b[1], fl + 9, '#e8f8ff', '#4ad8ff');
      arGlowC(c, a[0], a[1] + 1, 10, '#4ad8ff', .2); arGlowC(c, b[0], b[1] + 1, 10, '#4ad8ff', .2);
      arMote(c, d.motes, t, w, '#7ae8ff', .6, 3, -6); }}
});

// ---- Columna acanalada con capitel y base dorados (para el templo de Cintia) ----
function arFluted(P, x, y0, y1, ww, base, gold){
  P.rect(arDrk(base, .35), x, y0, ww, y1 - y0); P.rect(base, x + 1, y0, ww - 3, y1 - y0);
  for(let k = 2; k < ww - 2; k += 3){ P.alpha('#000000', .28, x + k, y0 + 4, 1, y1 - y0 - 8); P.alpha('#ffffff', .1, x + k + 1, y0 + 4, 1, y1 - y0 - 8); }
  P.alpha('#ffffff', .18, x + 1, y0, 2, y1 - y0); P.alpha('#000000', .35, x + ww - 3, y0, 3, y1 - y0);
  [[y0, 1], [y1 - 4, 0]].forEach(([yy]) => { P.rect(arDrk(gold, .35), x - 3, yy, ww + 6, 4); P.rect(gold, x - 3, yy, ww + 6, 2); P.rect(arLit(gold, .35), x - 3, yy, ww + 6, 1); });
  P.rect(gold, x - 1, y0 + 4, ww + 2, 1); P.rect(gold, x - 1, y1 - 5, ww + 2, 1);
}

Object.assign(ARENAS, {

  // ---- Alecrán · Alto Mando (Bicho): bosque primitivo y exuberante con troncos gigantes, raíces, telarañas, capullos, plantas exóticas y rayos de luz ----
  alecran: {dark: .26,
    build(P, w, h, WH){
      P.rect('#2a4222', 0, WH, w, h - WH);                                                                                       // suelo del bosque
      arSpeck(P, 0, WH, w, h - WH, 1500, ['#35542a', '#1e3318', '#4a6a30', '#3a2a1a', '#5a3e22', '#6a8a3a']);
      for(let i = 0; i < 90; i++){ const x = P.r() * w, y = WH + 4 + P.r() * (h - WH - 8); P.rect(['#7a5a2a', '#8a4a1a', '#a08a2a', '#5a3a1a'][i % 4], x, y, 2 + (i % 2), 1); }       // hojas secas
      for(let i = 0; i < 9; i++) arCrack(P, arRnd(P, 20, w - 20), arRnd(P, WH + 8, h - 6), 22 + P.r() * 24, '#4a3220', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .6);        // raíces por el suelo
      for(let i = 0; i < 9; i++) arCrack(P, arRnd(P, 20, w - 20), arRnd(P, WH + 8, h - 6), 14 + P.r() * 20, '#6a4a2a', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .6);
      for(let i = 0; i < 22; i++){ const fx = arRnd(P, 24, w - 24), fy = arRnd(P, WH + 10, h - 8); for(let l = 0; l < 5; l++){ const a = l * 1.25 - 2.5; for(let k = 0; k < 5; k++) P.px(['#3f8a38', '#5aae4a', '#2f7a3a'][k % 3], fx + Math.cos(a) * k * 1.2, fy + Math.sin(a) * k * .7); } }   // helechos
      for(let i = 0; i < 16; i++){ const mx = arRnd(P, 24, w - 24), my = arRnd(P, WH + 12, h - 8); P.rect('#e8e0c8', mx, my, 1, 2); P.rect(i % 3 ? '#c8402a' : '#8ad0ff', mx - 1, my - 1, 3, 1); P.px('#ffffff', mx, my - 1); }  // setas
      // pared del fondo: penumbra, troncos gigantes, raíces y bóveda de hojas
      for(let y = 0; y < WH; y++) P.rect(arMix('#0e1e12', '#244a28', y / WH), 0, y, w, 1);
      arEll(P, w * .5, WH - 8, 120, 14, '#8ae070', .08);
      const tr = [.1, .3, .5, .7, .9];
      tr.forEach((k, i) => { const x = Math.round(w * k), tw = i % 2 ? 18 : 24;
        P.rect('#2a1c10', x - tw / 2, 0, tw, WH + 2); P.rect('#4a3220', x - tw / 2 + 2, 0, tw - 6, WH + 2); P.rect('#6a4a2a', x - tw / 2 + 3, 0, 2, WH + 2); P.alpha('#000000', .35, x + tw / 2 - 5, 0, 5, WH);
        for(let y = 2; y < WH; y += 3) P.px('#1a1008', x - tw / 2 + 4 + (y * 7) % (tw - 8), y);
        for(let r = 0; r < 12; r++){ P.rect('#3a2616', x - tw / 2 - r - 1, WH - 6 + r * .5, 2, 6 + r * .4); P.rect('#3a2616', x + tw / 2 + r - 1, WH - 6 + r * .5, 2, 6 + r * .4); }
        arEll(P, x, WH + 1, tw / 2 + 14, 3, '#2a1a0e'); });
      for(let x = -6; x < w + 6; x += 7){ const r = 8 + (Math.abs(x * 11) % 7), y = 1 + (Math.abs(x * 5) % 6); arEll(P, x, y, r + 2, r - 1, '#0e2a14'); arEll(P, x, y - 1, r, r - 2, '#1e4a24'); arEll(P, x - 2, y - 2, r - 3, r - 4, '#2e6a30'); }
      // telarañas entre los troncos (con rocío) y capullos colgando
      [[.2, 22, 15], [.4, 18, 13], [.6, 20, 14], [.8, 24, 16]].forEach(([k, cy, r]) => arWeb(P, Math.round(w * k), cy, r, 10, 4, '#e8f4e8', .5));
      const cocoons = [];
      [.2, .4, .6, .8].forEach((k, i) => { const x = Math.round(w * k), ly = 22 + (i % 2) * 2; P.rect('#e8f4e8', x, 2, 1, ly - 6); arEll(P, x, ly, 3, 6, '#d8e8d0'); arEll(P, x - 1, ly - 1, 2, 4, '#f4faf0'); for(let k2 = 0; k2 < 3; k2++) P.alpha('#7aa088', .5, x - 3, ly - 3 + k2 * 3, 7, 1); cocoons.push([x, ly]); });
      // plantas exóticas junto a la pared: flores gigantes y bromelias
      [[.16, '#ff5a8a'], [.36, '#ff9a2a'], [.64, '#5ab0ff'], [.84, '#c85aff']].forEach(([k, col]) => { const x = Math.round(w * k); for(let l = 0; l < 7; l++){ const a = l * .5 - 1.5; for(let q = 0; q < 8; q++) P.px(['#2f7a3a', '#3f9a4a', '#1f5a2a'][q % 3], x + Math.sin(a) * q * 1.4, WH + 1 - q * Math.cos(a) * 1.1); }
        arEll(P, x, WH - 8, 4, 3, col); arEll(P, x, WH - 8, 2, 1, arLit(col, .5)); P.px('#ffe066', x, WH - 8); });
      arOcclude(P, w, WH);
      // lados: troncos enormes con raíces y telarañas en las esquinas
      [0, 1].forEach(sd => { const bx = sd ? w - 26 : 0;
        P.rect('#2a1c10', bx, WH - 6, 26, h - WH + 6); P.rect('#4a3220', bx + (sd ? 4 : 1), WH - 6, 20, h - WH + 6);
        for(let y = WH - 6; y < h; y++) for(let k = 0; k < 4; k++) P.px(['#1a1008', '#7a5632', '#3a2616', '#5a3c22'][(y + k) % 4], bx + 2 + ((y * 7 + k * 5) % 22), y);
        P.rect('#6a4a2a', sd ? bx + 4 : bx + 1, WH - 6, 1, h - WH + 6); P.alpha('#000000', .4, sd ? bx : bx + 21, WH - 6, 5, h - WH + 6);
        [[88, 16], [146, 20]].forEach(([ry, rl]) => { for(let k = 0; k < rl; k++){ const dx = sd ? -k - 1 : 26 + k, dy = Math.round(Math.sin(k * .4) * 3 + k * .15); P.rect('#3a2616', bx + dx, ry + dy, 3, 5 - (k > rl * .6 ? 2 : 0)); P.px('#6a4a2a', bx + dx, ry + dy); P.alpha('#000000', .3, bx + dx, ry + dy + 5, 3, 1); } });
        for(let k = 0; k < 6; k++){ const vx = bx + (sd ? 6 : 16) + Math.round(Math.sin(k * 2) * 4); for(let y = WH; y < 60 + k * 18; y++) P.px('#1f5a2a', vx + Math.round(Math.sin(y * .22 + k) * 1.5), y); }
        arWeb(P, sd ? bx - 6 : bx + 32, WH + 14, 26, 11, 5, '#e8f4e8', .35);
        [[WH + 40, 5], [WH + 80, 4], [WH + 110, 6]].forEach(([cy, rr]) => { const cx2 = sd ? bx - 3 : bx + 29; P.rect('#e8f4e8', cx2, cy - rr - 8, 1, 8); arEll(P, cx2, cy, 3, rr, '#d8e8d0'); arEll(P, cx2 - 1, cy - 1, 2, rr - 2, '#f4faf0'); cocoons.push([cx2, cy]); });
      });
      // rayos de luz entre los árboles
      [[.15, .1], [.38, .3], [.58, .52], [.82, .78]].forEach(([k, e], i) => { arBeam(P, w * k, 0, w * e + 18, h - 4, 8 + i * 2, 26 + i * 3, '#d8ffa0', .15); arPool(P, w * e + 20, h - 22 - i * 8, 20, 6, '#d8ffa0', .2); });
      return {cocoons, beams: [[.15, .1], [.38, .3], [.58, .52], [.82, .78]], flies: Array.from({length: 22}, () => [P.r() * w, AR_WALL + 8 + P.r() * (h - AR_WALL - 16), P.r()]), spores: arMotes(P, 30, w, h)};
    },
    anim(c, t, d, w){
      d.beams.forEach(([k, e], i) => { c.globalAlpha = .045 + .04 * Math.sin(t * .8 + i * 2); c.fillStyle = '#e8ffb0'; for(let y = 0; y < AR_H; y += 2){ const tt = y / AR_H; c.fillRect(Math.round(w * k + (w * e + 18 - w * k) * tt - 5), y, 10 + tt * 22, 1); } }); c.globalAlpha = 1;
      d.flies.forEach(([x, y, ph], i) => { const xx = Math.round(x + Math.sin(t * .7 + ph * 20) * 10), yy = Math.round(y + Math.cos(t * .9 + ph * 15) * 6), on = .5 + .5 * Math.sin(t * 2.2 + ph * 30); arGlowC(c, xx, yy, 4, '#d8ff6a', .22 * on); c.globalAlpha = on; c.fillStyle = '#f4ffb0'; c.fillRect(xx, yy, 1, 1); c.globalAlpha = 1; });
      d.cocoons.forEach(([x, y], i) => { if(Math.sin(t * 1.7 + i * 2) > .8){ c.fillStyle = '#ffffff'; c.fillRect(x - 2, y - 2, 1, 1); } });
      arMote(c, d.spores, t, w, '#c8f0a0', .4, 2, 3); }},

  // ---- Gaia · Alto Mando (Tierra): enorme caverna geológica con acantilados, capas de roca, pilares naturales, grietas y formaciones minerales ----
  gaia: {dark: .22,
    build(P, w, h, WH){
      P.rect('#9a7448', 0, WH, w, h - WH);                                                                                       // suelo de arenisca
      arSpeck(P, 0, WH, w, h - WH, 1400, ['#a98255', '#8a6438', '#b89260', '#7a5530', '#c8a070']);
      for(let k = 0; k < 9; k++){ const y = WH + 14 + k * 17; for(let x = 20; x < w - 20; x += 3){ P.alpha(k % 2 ? '#6a4a28' : '#c8a070', .22, x, y + Math.round(Math.sin(x * .05 + k) * 3), 3, 1); } }          // vetas horizontales
      for(let i = 0; i < 60; i++){ const sx = arRnd(P, 20, w - 20), sy = arRnd(P, WH + 6, h - 5), sw = 3 + (P.r() * 7 | 0), sh = 2 + (P.r() * 3 | 0), c = ['#b89260', '#a07a4a', '#8a6438'][i % 3]; P.rect('#4a3018', sx, sy + 1, sw, sh); P.rect(c, sx, sy, sw, sh - 1); P.alpha('#ffffff', .15, sx, sy, sw, 1); }
      for(let i = 0; i < 16; i++) arCrack(P, arRnd(P, 20, w - 20), arRnd(P, WH + 6, h - 6), 10 + P.r() * 22, '#3a2412', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .5);
      for(let i = 0; i < 4; i++) arCrack(P, arRnd(P, 40, w - 40), arRnd(P, WH + 20, h - 20), 16 + P.r() * 16, '#ff9a3a', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .5);   // grietas con brillo cálido
      // pared del fondo: acantilado de capas de roca multicolor con abertura de luz
      arStrata(P, 0, 0, w, WH, ['#7a5230', '#a07040', '#5a3a22', '#b88a50', '#8a4a2a', '#c8a06a', '#6a4228', '#9a6a3a'], 3);
      arSpeck(P, 0, 0, w, WH, 500, ['#3a2412', '#d8b080', '#5a3a22']);
      const ox = Math.round(w * .5);
      for(let y = 4; y < WH; y++){ const half = 30 - Math.max(0, (14 - y)) * 2 - (y < 10 ? (10 - y) * 3 : 0); P.rect(arMix('#ffe9b0', '#d89a50', y / WH), ox - half, y, half * 2, 1); }
      P.rect('#2a1a10', ox - 33, 3, 4, WH); P.rect('#2a1a10', ox + 30, 3, 4, WH);
      arEll(P, ox, WH - 2, 38, 8, '#ffe9b0', .25);
      for(let x = 3; x < w; x += 5 + (x * 7) % 5){ const len = 4 + (x * 13) % 16; for(let k = 0; k < len; k++){ const wi = Math.max(1, Math.round(4 * (1 - k / len))); P.rect(k % 2 ? '#6a4228' : '#8a5a34', x - (wi >> 1), k, wi, 1); } }     // estalactitas
      // pilares naturales (estalactita + estalagmita unidas)
      [.22, .78].forEach(k => { const x = Math.round(w * k); for(let y = 0; y < WH + 4; y++){ const wi = 8 + Math.round(Math.abs(Math.cos((y / (WH + 4)) * Math.PI)) * 5); P.rect('#4a2e1a', x - (wi >> 1) - 1, y, wi + 2, 1); P.rect('#8a5a34', x - (wi >> 1), y, wi - 1, 1); P.rect('#b8844e', x - (wi >> 1), y, 2, 1); }
        arEll(P, x, WH + 2, 11, 3, '#4a2e1a'); });
      // formaciones minerales: cuarzo, ámbar y geodas
      const gl = [];
      [[.12, '#e8f0ff'], [.34, '#ffb347'], [.66, '#c8a0ff'], [.88, '#7ae8c8']].forEach(([k, col]) => { arCrystal(P, Math.round(w * k), WH - 1, 10, col); gl.push([Math.round(w * k) - 1, WH - 7, col]); });
      [[.3, 18], [.7, 20]].forEach(([k, y]) => { const x = Math.round(w * k); arEll(P, x, y, 7, 6, '#3a2412'); arEll(P, x, y, 5, 4, '#c8a0ff'); arEll(P, x, y, 3, 2, '#e8d8ff'); P.px('#ffffff', x - 1, y - 1); });
      for(let i = 0; i < 5; i++) arCrack(P, P.r() * w, 4 + P.r() * 28, 10 + P.r() * 8, '#3a9a6a', 1, 0, .5);                                      // malaquita
      arOcclude(P, w, WH);
      // lados: acantilados escalonados con terrazas de roca
      [0, 1].forEach(sd => { const steps = [[WH - 6, 26], [66, 20], [96, 25], [126, 19], [152, 23]];
        steps.forEach(([y, wd], i) => { const yEnd = i < steps.length - 1 ? steps[i + 1][0] : h, x0 = sd ? w - wd : 0, cols = ['#6a4228', '#8a5a34', '#5a3a22', '#9a6a3a', '#7a4a2a'];
          P.rect(cols[i], x0, y, wd, yEnd - y); for(let k = 0; k < wd; k += 2) P.alpha('#000000', .12, x0 + k, y, 1, yEnd - y);
          P.rect('#c8a070', x0, y, wd, 2); P.rect('#e8c898', x0, y, wd, 1); P.rect('#2a1a10', x0, yEnd - 2, wd, 2); P.alpha('#000000', .25, sd ? x0 - 3 : x0 + wd, y, 3, yEnd - y);
          for(let q = 0; q < 6; q++) P.px(['#3a2412', '#d8b080', '#1a1008'][q % 3], x0 + P.r() * wd, y + 3 + P.r() * (yEnd - y - 5)); });
        [[88, 3], [118, 2]].forEach(([y, n]) => { const x = sd ? w - 20 : 14; arCrystal(P, x, y, 12, ['#c8a0ff', '#ffb347'][sd]); }); });
      arRocks(P, 28, h - 3, 4, '#8a5a34'); arRocks(P, w - 52, h - 3, 3, '#7a4e2a');
      return {gl, dust: arMotes(P, 40, w, h), ox};
    },
    anim(c, t, d, w){
      c.globalAlpha = .06 + .03 * Math.sin(t * .8); c.fillStyle = '#fff0c0'; for(let y = 4; y < AR_H; y += 2){ const tt = y / AR_H; c.fillRect(Math.round(d.ox - 24 + tt * 0), y, 48 + tt * 70, 1); } c.globalAlpha = 1;
      d.gl.forEach(([x, y, col], i) => { const s = Math.sin(t * 2.1 + i * 2); arGlowC(c, x, y + 3, 7, col, .1 + .06 * s); if(s > .65){ c.globalAlpha = (s - .65) * 2.8; c.fillStyle = '#ffffff'; c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 3); c.globalAlpha = 1; } });
      arMote(c, d.dust, t, w, '#e8c898', .5, 1, 7);
      c.fillStyle = '#a07a4a'; for(let k = 0; k < 4; k++){ const xx = (k * 117 + 40) % (w - 80) + 40, ph = (t * .7 + k * .3) % 1; c.globalAlpha = 1 - ph; c.fillRect(xx, Math.round(AR_WALL - 4 + ph * 24), 1, 2); } c.globalAlpha = 1; }},

  // ---- Fausto ("Faiano", Alto Mando de Fuego): cámara volcánica con roca negra, ríos de lava en los laterales, grietas incandescentes, cenizas y brasas ----
  fausto: {dark: .18,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 22, 22, (x, y) => ['#3a2624', '#34201e', '#40302a', '#2e1c1a'][(x * 3 + y * 5) % 4], '#140808', .14);                   // basalto negro
      arSpeck(P, 0, WH, w, h - WH, 700, ['#5a3a30', '#1e1010', '#6a4a3a', '#14080a']);
      const cr = [];
      for(let i = 0; i < 12; i++){ const x0 = arRnd(P, 52, w - 52), y0 = WH + 6 + P.r() * (h - WH - 12), len = 8 + P.r() * 16, dx = P.r() < .5 ? 1 : 0, dy = dx ? (P.r() < .5 ? 1 : 0) : 1;
        arCrack(P, x0 - 1, y0, len, '#8a1a08', dx, dy, .5); arCrack(P, x0, y0, len, '#ff6a1a', dx, dy, .5); arCrack(P, x0, y0, len / 2, '#ffd060', dx, dy, .5); cr.push([x0, y0]); }
      // pared del fondo: columnas de basalto y la boca del volcán
      P.rect('#1a0e0e', 0, 0, w, WH);
      for(let x = 0; x < w; x += 9){ const hh = WH - 2 - ((x * 7) % 5); P.rect('#2a1a1a', x, 0, 8, hh + 2); P.rect('#3a2828', x + 1, 0, 3, hh + 2); P.rect('#14080a', x + 8, 0, 1, hh + 2); P.alpha('#000000', .3, x + 5, 0, 3, hh + 2); for(let y = 6; y < hh; y += 9) P.rect('#14080a', x, y, 8, 1); }
      const vx = Math.round(w * .5);
      for(let y = 0; y < WH; y++){ const half = 34 - Math.round(Math.max(0, 8 - y) * 3); P.rect(arMix('#ff4a0a', '#ffb040', y / WH), vx - half, y, half * 2, 1); }
      P.rect('#2a1a1a', vx - 36, 0, 3, WH); P.rect('#2a1a1a', vx + 34, 0, 3, WH);
      for(let x = vx - 30; x < vx + 30; x++){ const hh = 6 + Math.round(Math.abs(Math.sin(x * .25)) * 6 + Math.max(0, 12 - Math.abs(x - vx)) * .6); P.rect('#1a0e0e', x, WH - hh, 1, hh); }       // silueta del volcán
      for(let k = 0; k < 5; k++){ P.alpha('#3a2a28', .6, vx - 6 + k * 3, 4 + k * 2, 8 - k, 4); }
      arPool(P, vx, WH + 18, 80, 16, '#ff7a2a', .28);
      [.28, .72].forEach(k => { const x = Math.round(w * k); P.rect('#ff6a1a', x - 3, 0, 7, WH); P.rect('#ffb040', x - 2, 0, 3, WH); P.rect('#fff0a0', x - 1, 0, 1, WH); arEll(P, x, WH - 1, 7, 2, '#ff9a2a'); });  // cascadas de lava
      arOcclude(P, w, WH);
      // lados: ríos de lava con orillas de roca, puentes de basalto y pinchos de obsidiana
      const lava = [];
      [0, 1].forEach(sd => { const lx = sd ? w - 36 : 6, lw = 30;
        P.rect('#140808', lx - 5, WH - 2, lw + 10, h - WH + 2); P.rect('#3a2624', lx - 4, WH - 2, 1, h - WH + 2); P.rect('#3a2624', lx + lw + 3, WH - 2, 1, h - WH + 2);
        for(let y = WH; y < h; y++){ const e = 2 + Math.round(Math.sin(y * .3 + sd) * 2); P.rect('#6a1a08', lx - e + 3, y, lw + e * 2 - 6, 1); P.rect('#d8460a', lx + 1, y, lw - 2, 1); }
        for(let i = 0; i < 90; i++) P.px(['#ff7a1a', '#ffb040', '#fff0a0', '#a82a08'][i % 4], lx + 1 + P.r() * (lw - 2), WH + P.r() * (h - WH));
        for(let i = 0; i < 16; i++){ const bx2 = lx + 4 + P.r() * (lw - 8), by2 = WH + 8 + P.r() * (h - WH - 16), br = 3 + (P.r() * 4 | 0); arEll(P, bx2, by2, br + 1, 2 + (br >> 1), '#8a2a0a'); arEll(P, bx2, by2, br, 1 + (br >> 1), '#2a100a'); P.rect('#4a1c10', bx2 - br + 1, by2 - 1, br, 1); }
        for(let i = 0; i < 8; i++) arCrack(P, lx + 3 + P.r() * (lw - 6), WH + P.r() * (h - WH - 10), 8 + P.r() * 10, '#ffd060', 0, 1, .6);
        lava.push([lx, WH, lw, h - WH]);
        for(let k = 0; k < 3; k++){ const rx = sd ? lx - 9 : lx + lw + 4, ry = WH + 20 + k * 52; P.rect('#14080a', rx, ry, 5, 18); P.rect('#2a1a1a', rx + 1, ry, 3, 16); P.rect('#4a3030', rx + 1, ry, 1, 14); for(let t2 = 0; t2 < 8; t2++) P.rect('#14080a', rx + 1 + (t2 % 2), ry - t2, 3 - (t2 > 4 ? 1 : 0), 1); }    // pinchos de obsidiana
        for(let k = 0; k < 2; k++){ const by = 74 + k * 62; P.rect('#14080a', lx - 5, by, lw + 10, 12); P.rect('#2a1a1a', lx - 4, by, lw + 8, 10); P.rect('#4a3030', lx - 4, by, lw + 8, 1); for(let q = 0; q < lw + 8; q += 5) P.rect('#14080a', lx - 4 + q, by + 1, 1, 9); P.alpha('#000000', .35, lx - 5, by + 12, lw + 10, 3); }                // puentes de basalto
      });
      arRocks(P, 54, h - 3, 3, '#3a2624'); arRocks(P, w - 70, h - 3, 3, '#34201e');
      return {lava, cr, vx, embers: Array.from({length: 46}, () => [P.r() * w, AR_WALL + P.r() * (h - AR_WALL), P.r()]), ash: arMotes(P, 40, w, h)};
    },
    anim(c, t, d, w){
      d.lava.forEach(([x, y, ww, hh], i) => { for(let k = 0; k < 22; k++){ const yy = y + ((k * 17 + t * (5 + k % 4) * (i ? -1 : 1)) % hh + hh) % hh, xx = x + 1 + Math.round((Math.sin(k * 2.3 + t * .8 + i) * .5 + .5) * (ww - 6)); c.globalAlpha = .6; c.fillStyle = k % 3 ? '#ffb040' : '#fff0a0'; c.fillRect(xx, Math.round(yy), 3 + k % 3, 1); } c.globalAlpha = 1; arGlowC(c, x + ww / 2, y + hh / 2, 36, '#ff6a1a', .06 + .02 * Math.sin(t * 2 + i)); });
      arGlowC(c, d.vx, 16, 40 + Math.sin(t * 2) * 3, '#ff7a2a', .22 + .05 * Math.sin(t * 3));
      d.embers.forEach(([x, y, ph]) => { const yy = AR_H - (((AR_H - y) + t * (8 + ph * 16)) % (AR_H - 4)), xx = x + Math.sin(t * 1.3 + ph * 20) * 5; c.globalAlpha = .4 + .5 * ph * Math.abs(Math.sin(t * 3 + ph * 9)); c.fillStyle = ph > .6 ? '#ffd060' : '#ff7a1a'; c.fillRect(Math.floor(xx), Math.floor(yy), 1, 1); });
      c.globalAlpha = 1; arMote(c, d.ash, t, w, '#8a8a8a', .35, 2, 6);
      d.cr.forEach(([x, y], i) => { const s = Math.sin(t * 2.2 + i * 1.3); if(s > .3) arGlowC(c, x + 4, y + 3, 5, '#ff8a2a', .08 * s); }); }},

  // ---- Delos · Alto Mando (Psíquico): dimensión misteriosa con plataformas geométricas, anillos luminosos, esferas flotantes y un fondo espacial violeta y azul ----
  delos: {dark: .1,
    build(P, w, h, WH){
      for(let y = 0; y < h; y++) P.rect(arMix('#0a0626', '#1a1262', y / h), 0, y, w, 1);                                       // espacio
      [[.2, 40, '#a050ff', 90, 34], [.8, 60, '#3a6aff', 100, 40], [.5, 150, '#ff50c8', 120, 30], [.1, 140, '#3ad0ff', 70, 30], [.9, 20, '#a050ff', 60, 24]].forEach(([k, y, col, rx, ry]) => arPool(P, w * k, y, rx, ry, col, .26));    // nebulosas
      arStars(P, 0, 0, w, h, 260, ['#ffffff', '#d8c8ff', '#9ab0ff', '#ffd8ff']);
      // plataforma central de cristal con dibujo simétrico
      const px0 = 24, px1 = w - 24, py0 = WH + 2, py1 = h - 4, mx = Math.round(w / 2), my = Math.round((py0 + py1) / 2);
      P.rect('#08041c', px0 - 2, py0 - 2, px1 - px0 + 4, py1 - py0 + 4);
      P.rect('#2a2470', px0, py0, px1 - px0, py1 - py0); arGradR(P, px0, py0, px1 - px0, py1 - py0, '#3a2e90', '#241c64');
      for(let x = px0; x < px1; x += 20){ P.alpha('#8a7aff', .22, x, py0, 1, py1 - py0); } for(let y = py0; y < py1; y += 20){ P.alpha('#8a7aff', .22, px0, y, px1 - px0, 1); }
      for(let a = 0; a < 360; a += 1){ const r1 = 62, r2 = 40, cs = Math.cos(a * Math.PI / 180), sn = Math.sin(a * Math.PI / 180); P.alpha('#b8a8ff', .28, mx + cs * r1 * 1.5, my + sn * r1 * .7, 1, 1); P.alpha('#7ad8ff', .22, mx + cs * r2 * 1.5, my + sn * r2 * .7, 1, 1); }
      for(let k = 0; k < 12; k++){ const a = k * Math.PI / 6; for(let q = 40; q < 62; q++) P.alpha('#b8a8ff', .18, mx + Math.cos(a) * q * 1.5, my + Math.sin(a) * q * .7, 1, 1); }
      [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([fx, fy]) => { const cx = fx ? px1 - 14 : px0 + 14, cy = fy ? py1 - 12 : py0 + 12; P.rect('#8a7aff', cx - 5, cy - 1, 11, 3); P.rect('#8a7aff', cx - 1, cy - 5, 3, 11); P.alpha('#ffffff', .4, cx - 1, cy - 1, 3, 3); });                // marcas en las esquinas
      P.rect('#7ad8ff', px0, py0, px1 - px0, 1); P.rect('#7ad8ff', px0, py1 - 1, px1 - px0, 1); P.rect('#7ad8ff', px0, py0, 1, py1 - py0); P.rect('#7ad8ff', px1 - 1, py0, 1, py1 - py0);
      P.alpha('#7ad8ff', .25, px0 - 3, py0 - 3, px1 - px0 + 6, 2); P.alpha('#7ad8ff', .25, px0 - 3, py1 + 1, px1 - px0 + 6, 2);
      for(let i = 0; i < 220; i++) P.px(['#8a7aff', '#b8a8ff', '#5a4ac8'][i % 3], px0 + P.r() * (px1 - px0), py0 + P.r() * (py1 - py0));
      // plataformas flotantes geométricas a los lados (simétricas)
      const plats = [];
      [[8, 60, 14], [10, 110, 18], [6, 150, 12]].forEach(([dx, y, sz]) => [0, 1].forEach(sd => { const x = sd ? w - dx - sz : dx; P.rect('#08041c', x - 1, y - 1, sz + 2, 8); P.rect('#4a3ec8', x, y, sz, 5); P.rect('#8a7aff', x, y, sz, 1); P.rect('#241c64', x + 1, y + 5, sz - 2, 3); P.rect('#1a1250', x + 2, y + 8, sz - 4, 2); P.rect('#7ad8ff', x + (sz >> 1) - 1, y + 1, 2, 2); plats.push([x + (sz >> 1), y - 6]); }));
      // anillos luminosos y obeliscos de cristal en la pared del fondo
      [.28, .72].forEach(k => { const x = Math.round(w * k); for(let y = 4; y < WH - 4; y++){ const hw = Math.round(7 - Math.abs(y - (WH / 2)) * .35); if(hw > 0){ P.rect('#6a5ae0', x - hw, y, hw * 2, 1); P.rect('#b8a8ff', x - hw, y, 2, 1); P.rect('#3a2eaa', x + hw - 2, y, 2, 1); } } });
      P.alpha('#ffffff', .2, w * .28 - 1, 6, 1, 20); P.alpha('#ffffff', .2, w * .72 - 1, 6, 1, 20);
      arOcclude(P, w, WH);
      return {mx, my: Math.round(WH * .5), rings: [[Math.round(w * .5), 17, 58, 14], [Math.round(w * .5), 17, 38, 9]], plats, orbs: [[.38, 44, 3], [.62, 44, 3], [.12, 90, 4], [.88, 90, 4], [.2, 30, 2], [.8, 30, 2]], stars: Array.from({length: 40}, () => [P.r() * w, P.r() * h, P.r()]), motes: arMotes(P, 24, w, h)};
    },
    anim(c, t, d, w){
      d.stars.forEach(([x, y, ph]) => { const s = Math.sin(t * 2 + ph * 40); if(s > .3){ c.globalAlpha = (s - .3) * 1.2; c.fillStyle = '#ffffff'; c.fillRect(Math.round(x), Math.round(y), 1, 1); c.fillRect(Math.round(x) - 1, Math.round(y), 3, 1); } }); c.globalAlpha = 1;
      d.rings.forEach(([x, y, rx, ry], i) => { for(let a = 0; a < 90; a++){ const ang = a * Math.PI * 2 / 90 + t * (i ? -.5 : .4); if(((a >> 2) + (i * 3)) % 3 === 0) continue; const px = x + Math.cos(ang) * rx, py = y + Math.sin(ang) * ry; c.globalAlpha = .55 + .35 * Math.sin(ang * 2 + t); c.fillStyle = i ? '#7ad8ff' : '#c8b8ff'; c.fillRect(Math.round(px), Math.round(py), 2, 1); } }); c.globalAlpha = 1;
      d.plats.forEach(([x, y], i) => { const by = y + Math.round(Math.sin(t * 1.4 + i) * 1); arGlowC(c, x, by, 6, '#7ad8ff', .14); c.fillStyle = '#e8f8ff'; c.fillRect(x - 1, by - 1, 3, 3); });
      d.orbs.forEach(([k, y, r], i) => { const x = Math.round(w * k), yy = Math.round(y + Math.sin(t * 1.1 + i * 1.7) * 3); arGlowC(c, x, yy, r * 3.2, i % 2 ? '#7ad8ff' : '#d080ff', .3); c.fillStyle = i % 2 ? '#c8f4ff' : '#f0d0ff'; for(let q = -r; q <= r; q++){ const kx = Math.round(Math.sqrt(r * r - q * q)); c.fillRect(x - kx, yy + q, kx * 2 + 1, 1); } c.fillStyle = '#ffffff'; c.fillRect(x - 1, yy - 1, 1, 1); });
      const pulse = (t * 28) % 180; c.globalAlpha = .55; c.fillStyle = '#e8f8ff'; for(let k = 0; k < 8; k++){ const x = 24 + ((pulse + k * 60) % (w - 48)); c.fillRect(Math.round(x), AR_WALL + 2, 3, 1); c.fillRect(Math.round(x), AR_H - 5, 3, 1); } c.globalAlpha = 1;
      arMote(c, d.motes, t, w, '#d8c8ff', .5, 3, -4); }},

  // ---- Cintia · Liga Pokémon (Campeona): el templo antiguo de la cima de Sinnoh, con columnas colosales, escalinata, suelo de mármol negro, símbolos ancestrales, relieves y rayos de luz dorada ----
  cintia: {dark: .12,
    build(P, w, h, WH){
      const GOLD = '#d8b050', GL = '#f0d078', GD = '#8a6a20', CREAM = '#f0e4c0', mx = Math.round(w / 2);
      // suelo: mármol negro con vetas y embutido de oro
      arTiles(P, 0, WH, w, h - WH, 28, 28, (x, y) => (x + y) & 1 ? '#202028' : '#1a1a22', '#0a0a10', .12);
      arSpeck(P, 0, WH, w, h - WH, 700, ['#2a2a34', '#14141c', '#3a3a46']);
      for(let i = 0; i < 26; i++){ const x = arRnd(P, 20, w - 20), y = arRnd(P, WH + 4, h - 4); arCrack(P, x, y, 14 + P.r() * 28, '#5a5a6a', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .5); P.alpha('#ffffff', .1, x, y, 4, 1); }
      for(let y = WH; y < h; y += 28) P.alpha(GOLD, .2, 0, y, w, 1); for(let x = 0; x < w; x += 28) P.alpha(GOLD, .2, x, WH, 1, h - WH);                    // juntas doradas
      // gran emblema ancestral en el centro del suelo (muy tenue para no molestar al combate)
      const ey = Math.round((WH + h) / 2) + 6;
      for(let a = 0; a < 720; a++){ const an = a * Math.PI / 360; [[78, 38, .3], [62, 30, .2], [46, 22, .2]].forEach(([rx, ry, al]) => P.alpha(GL, al, mx + Math.cos(an) * rx, ey + Math.sin(an) * ry, 1, 1)); }
      for(let k = 0; k < 12; k++){ const an = k * Math.PI / 6; for(let q = 46; q < 78; q++) P.alpha(GL, .1, mx + Math.cos(an) * q, ey + Math.sin(an) * q * .49, 1, 1); }
      for(let k = 0; k < 3; k++){ const an = k * Math.PI * 2 / 3 - Math.PI / 2; for(let q = 0; q < 46; q++) P.alpha(GL, .14, mx + Math.cos(an) * q, ey + Math.sin(an) * q * .49, 1, 1); }
      // greca dorada en los bordes del suelo
      for(let x = 36; x < w - 36; x += 6){ [WH + 8, h - 8].forEach(yy => { P.rect(GD, x, yy, 4, 1); P.rect(GOLD, x, yy - 1, 1, 3); P.rect(GOLD, x + 3, yy - 1, 1, 3); P.rect(GOLD, x, yy - 1, 4, 1); }); }
      // pared del fondo: muro de piedra oscura con friso de relieves
      P.rect('#14141a', 0, 0, w, WH); arBricks(P, 0, 0, w, WH, 20, 9, '#1c1c24', '#0c0c12', .1);
      for(let x = 0; x < w; x += 5){ const k = (x / 5 | 0) % 8; P.rect('#2a2a34', x, 4, 4, 6); P.rect('#3a3a46', x, 4, 4, 1); if(k % 4 === 0){ P.rect(GOLD, x + 1, 5, 2, 4); P.px(GL, x + 1, 5); } else if(k % 4 === 2){ P.rect('#585864', x, 6, 4, 2); P.rect(GD, x + 1, 5, 2, 1); } }       // friso con figuras en relieve
      P.rect(GD, 0, 3, w, 1); P.rect(GOLD, 0, 10, w, 1); P.rect(GD, 0, 11, w, 1);
      // ventanales altos con luz dorada
      const wins = [.2, .35, .65, .8];
      wins.forEach(k => { const x = Math.round(w * k); P.rect('#3a3a46', x - 8, 11, 17, WH - 9); P.rect(GD, x - 7, 12, 15, WH - 10);
        for(let y = 13; y < WH - 1; y++){ const hw = y < 20 ? Math.round(Math.sqrt(Math.max(0, 49 - Math.pow(20 - y, 2) * 1.2))) : 6; if(hw > 0) P.rect(arMix('#fff2b8', '#e8b860', (y - 13) / (WH - 13)), x - hw, y, hw * 2 + 1, 1); }
        P.rect('#3a3a46', x, 13, 1, WH - 13); P.rect('#3a3a46', x - 6, 24, 13, 1); P.alpha('#ffffff', .4, x - 4, 15, 3, 7); });
      // portal central con escalinata
      P.rect('#08080c', mx - 15, 12, 31, WH - 12); for(let y = 12; y < WH; y++){ const hw = y < 20 ? Math.round(Math.sqrt(Math.max(0, 225 - Math.pow(20 - y, 2) * 3))) : 15; P.rect('#08080c', mx - hw, y, hw * 2 + 1, 1); P.rect(arMix('#ffe9a0', '#a87a20', (y - 12) / (WH - 12)), mx - hw + 3, y, Math.max(0, hw * 2 - 5), 1); }
      P.rect(GOLD, mx - 17, 10, 35, 2); P.rect(GL, mx - 17, 10, 35, 1); arEll(P, mx, 20, 4, 4, '#ffffff', .6);
      for(let s = 0; s < 6; s++){ const sy = WH - 18 + s * 3, sw = 48 + s * 6; P.rect('#0a0a10', mx - sw / 2 - 1, sy, sw + 2, 3); P.rect(s % 2 ? '#3a3a46' : '#46465a', mx - sw / 2, sy, sw, 2); P.rect('#6a6a7a', mx - sw / 2, sy, sw, 1); P.rect(GD, mx - sw / 2, sy + 2, sw, 1); }
      // columnas colosales a los lados del portal y en los costados
      [.42, .58].forEach(k => arFluted(P, Math.round(w * k) - 5 - (k < .5 ? 8 : -8), 2, WH - 2, 10, '#3a3a46', GOLD));
      arOcclude(P, w, WH);
      [0, 1].forEach(sd => { const bx = sd ? w - 40 : 0;
        P.rect('#0e0e14', bx, WH - 4, 40, h - WH + 4); arBricks(P, bx, WH - 4, 40, h - WH + 4, 20, 9, '#1a1a22', '#0a0a10', .08); P.alpha('#000000', .3, sd ? bx - 3 : bx + 40, WH, 3, h - WH);
        arFluted(P, sd ? bx + 22 : bx + 6, WH + 20, 100, 11, '#4a4a58', GOLD);                                                              // columna del fondo
        arFluted(P, sd ? bx + 10 : bx - 2, WH - 6, h + 4, 20, '#585866', GOLD);                                                              // columna colosal delantera
        for(let g = 0; g < 3; g++){ const gy = WH + 34 + g * 34, gx = (sd ? bx + 20 : bx + 8); P.rect(GD, gx + 1, gy + 1, 9, 9); P.rect(GOLD, gx, gy, 9, 9); P.rect('#2a2a34', gx + 2, gy + 2, 5, 5); P.rect(GL, gx + 4, gy + 2, 1, 5); P.rect(GL, gx + 2, gy + 4, 5, 1); }  // símbolos ancestrales tallados
        const brx = sd ? bx + 27 : bx + 11; P.rect('#2a2a34', brx - 5, 106, 13, 3); P.rect(GOLD, brx - 6, 104, 15, 3); P.rect(GD, brx - 4, 109, 9, 6); P.rect(GOLD, brx - 2, 115, 5, 2);                                                         // brasero
      });
      // haces de luz dorada que entran por los ventanales y se reflejan en el suelo
      wins.forEach((k, i) => { const x = w * k; arBeam(P, x, 18, x + (i < 2 ? 46 : -46), h - 2, 12, 34, '#ffd870', .11); arPool(P, x + (i < 2 ? 52 : -52), h - 26 - (i % 2) * 24, 34, 8, '#ffd870', .26); });
      return {mx, wins, braz: [[Math.round(sdX(w, 0)), 104], [Math.round(sdX(w, 1)), 104]], dust: arMotes(P, 60, w, h), ey};
    },
    anim(c, t, d, w){
      d.wins.forEach((k, i) => { c.globalAlpha = .05 + .035 * Math.sin(t * .7 + i * 1.5); c.fillStyle = '#fff2b8'; const x = w * k, dir = i < 2 ? 1 : -1; for(let y = 18; y < AR_H; y += 2){ const tt = (y - 18) / (AR_H - 20); c.fillRect(Math.round(x + dir * 46 * tt - 6 - tt * 12), y, 12 + tt * 24, 1); } }); c.globalAlpha = 1;
      arGlowC(c, d.mx, 26, 17 + Math.sin(t * 2) * 2, '#ffd36a', .3 + .08 * Math.sin(t * 3));
      d.braz.forEach(([x, y], i) => { arFlame(c, x, y, t, i, '#ffb030', '#fff0a0'); arFlame(c, x - 3, y, t, i + 2, '#ff8a1a', '#ffd060'); arFlame(c, x + 3, y, t, i + 4, '#ff8a1a', '#ffd060'); arGlowC(c, x, y - 4, 16, '#ffa030', .2 + .06 * Math.sin(t * 7 + i)); });
      c.fillStyle = '#fff2b8'; d.dust.forEach(([x, y, ph], i) => { const xx = ((x + Math.sin(t * .5 + ph * 20) * 6 + t * 2) % w + w) % w, yy = AR_WALL + (((y - AR_WALL) + t * (2 + ph * 5)) % (AR_H - AR_WALL)); c.globalAlpha = (.3 + .6 * ph) * (.5 + .5 * Math.sin(t * 2 + ph * 30)); c.fillRect(Math.floor(xx), Math.floor(yy), 1, 1); }); c.globalAlpha = 1;
      const g = .5 + .5 * Math.sin(t * 1.2); c.globalAlpha = .12 + .1 * g; c.fillStyle = '#f0d078'; for(let k = 0; k < 3; k++){ const an = k * Math.PI * 2 / 3 - Math.PI / 2 + t * .1; for(let q = 8; q < 46; q += 2) c.fillRect(Math.round(d.mx + Math.cos(an) * q), Math.round(d.ey + Math.sin(an) * q * .49), 1, 1); } c.globalAlpha = 1; }}
});
function sdX(w, sd){ return sd ? w - 40 + 27 : 11; }
