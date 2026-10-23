"use strict";
/* =====================================================================
   17) ARENAS DE COMBATE (Kanto): un fondo pixel art distinto para cada líder, miembro del Alto Mando y Campeón.
   Inspirados en los gimnasios y salas de Rojo/Azul/Amarillo y Rojo Fuego/Verde Hoja, pero dibujados con código (sin imágenes).

   CÓMO FUNCIONA
   - drawArena(id, t) lo llama render.js cada frame. 'id' es el id del rival (brock, misty, lt_surge, erika, koga, sabrina, blaine,
     giovanni, lorelei, bruno, agatha, lance, azul). Si el id no existe se usa el fondo antiguo (arenaFallback).
   - Cada arena se dibuja UNA vez en un lienzo pequeño (alto 180 "píxeles de arte"; cada píxel se ve como 3x3 píxeles del juego)
     y se guarda en caché (arCache). Cada frame solo se estira ese lienzo y se pintan las pocas cosas animadas (llamas, agua, chispas...).
     Así el fondo casi no cuesta nada y mantiene el pixel art nítido.
   - Encima se pone una capa oscura + viñeta, y el borde de arriba/abajo se oscurece un poco: así los Pokémon, el HUD y la barra
     de ataques se leen siempre bien (y el estilo sigue siendo "dark pixel art").
   - Para añadir una arena: crea una entrada en ARENAS con build(P, w, h, WH) (dibuja lo fijo y devuelve datos) y, si quieres,
     anim(c, t, d, w) (lo que se mueve). Los helpers (arTiles, arBricks, arSpeck...) están justo debajo.
   ===================================================================== */
const AR_H = 180, AR_S = H / AR_H, AR_WALL = 36;           // alto del dibujo (en píxeles de arte), escala (x3) y alto de la pared del fondo
const arCache = {};
const ARENA_ALIAS = {surge:'lt_surge', blue:'azul', champion:'azul', campeon:'azul'};

// ---- Colores ----
const arHex = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
const arMix = (a, b, t) => { const A = arHex(a), B = arHex(b); return '#' + A.map((v, i) => Math.max(0, Math.min(255, Math.round(v + (B[i] - v) * t))).toString(16).padStart(2, '0')).join(''); };
const arLit = (c, t) => arMix(c, '#ffffff', t), arDrk = (c, t) => arMix(c, '#000000', t);

// ---- Pincel: rect/px/alpha en coordenadas de arte (enteras) ----
function arPainter(c){
  const r = rng(11), rect = (col, x, y, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  return {c, r, rect, px: (col, x, y) => rect(col, x, y, 1, 1),
    alpha: (col, a, x, y, w, h) => { c.globalAlpha = a; rect(col, x, y, w, h); c.globalAlpha = 1; }};
}
// Baldosas con biselado y junta: colFn(tx, ty) devuelve el color de cada una
function arTiles(P, x0, y0, w, h, tw, th, colFn, grout, bev){
  bev = bev === undefined ? .14 : bev; P.rect(grout, x0, y0, w, h);
  for(let ty = 0; ty * th < h; ty++) for(let tx = 0; tx * tw < w; tx++){
    const x = x0 + tx * tw, y = y0 + ty * th, ww = Math.min(tw, x0 + w - x) - 1, hh = Math.min(th, y0 + h - y) - 1; if(ww <= 0 || hh <= 0) continue;
    P.rect(colFn(tx, ty), x, y, ww, hh);
    if(bev){ P.alpha('#ffffff', bev, x, y, ww, 1); P.alpha('#ffffff', bev, x, y, 1, hh); P.alpha('#000000', bev, x, y + hh - 1, ww, 1); P.alpha('#000000', bev, x + ww - 1, y, 1, hh); }
  }
}
// Ladrillos (filas desencajadas)
function arBricks(P, x0, y0, w, h, bw, bh, base, mortar, vary){
  vary = vary === undefined ? .1 : vary; P.rect(mortar, x0, y0, w, h);
  for(let row = 0; row * bh < h; row++){
    const y = y0 + row * bh, off = (row & 1) ? -Math.floor(bw / 2) : 0;
    for(let x = x0 + off; x < x0 + w; x += bw){
      const bx = Math.max(x, x0), ex = Math.min(x + bw, x0 + w), bhh = Math.min(bh, y0 + h - y) - 1; if(ex - bx < 2 || bhh < 1) continue;
      P.rect(arMix(base, P.r() < .5 ? '#000000' : '#ffffff', P.r() * vary), bx, y, ex - bx - 1, bhh);
      P.alpha('#ffffff', .1, bx, y, ex - bx - 1, 1); P.alpha('#000000', .18, bx, y + bhh - 1, ex - bx - 1, 1);
    }
  }
}
// Puntitos al azar (textura)
function arSpeck(P, x, y, w, h, n, cols){ for(let i = 0; i < n; i++) P.px(cols[(P.r() * cols.length) | 0], x + P.r() * w, y + P.r() * h); }
// Línea quebrada (grietas, cables, lava)
function arCrack(P, x, y, len, col, dirx, diry, wob){
  for(let i = 0; i < len; i++){
    P.px(col, x, y);
    if(P.r() < wob){ if(dirx) y += P.r() < .5 ? -1 : 1; else x += P.r() < .5 ? -1 : 1; }
    x += dirx; y += diry;
  }
}
// Sombra de la pared sobre el suelo y borde inferior de la pared
function arOcclude(P, w, WH){
  for(let i = 0; i < 9; i++) P.alpha('#000000', .3 * (1 - i / 9), 0, WH + i, w, 1);
  P.rect('#000000', 0, WH - 1, w, 1); P.alpha('#000000', .3, 0, WH - 3, w, 2);
}
// Paredes laterales: bordean el campo por izquierda y derecha (así se ve el estilo de la sala aunque el marcador tape la pared del fondo)
function arSides(P, w, h, WH, S){
  const sw = 6;
  [0, w - 7].forEach((x, i) => {
    arBricks(P, x, WH - 2, sw + 1, h - WH + 2, sw + 1, 6, S.base, S.mortar, .1);
    P.alpha('#ffffff', .12, i ? x : x + sw, WH, 1, h - WH); P.alpha('#000000', .35, i ? x : x + sw - 1, WH, 1, h - WH);
    for(let k = 0; k < 4; k++) P.alpha('#000000', .3 * (1 - k / 4), i ? x - 1 - k : x + sw + 1 + k, WH, 1, h - WH);
  });
}
function arFlame(c, x, y, t, i, a, b){                                       // llama animada de 3 px de ancho
  const h = Math.max(3, Math.floor(5 + Math.sin(t * 9 + i * 2) * 1.4 + Math.sin(t * 15 + i) * 1));
  c.globalAlpha = .1; c.fillStyle = a; c.fillRect(Math.floor(x - 6), Math.floor(y - 11), 13, 15); c.globalAlpha = 1;
  c.fillStyle = a; c.fillRect(Math.floor(x - 1), Math.floor(y - h), 3, h); c.fillStyle = b; c.fillRect(Math.floor(x), Math.floor(y - h * .65), 1, Math.floor(h * .65));
  c.fillStyle = a; c.fillRect(Math.floor(x), Math.floor(y - h - 1), 1, 1);
}
function arTorch(P, x, y, col){ P.rect('#2a2a30', x - 1, y, 3, 1); P.rect(col || '#6b4a2a', x, y, 1, 5); P.rect('#2a2a30', x - 2, y + 5, 5, 1); }
function arPot(P, x, y, flower){                                              // maceta con planta
  P.rect('#8a3f1f', x, y + 3, 8, 6); P.rect('#b5562c', x + 1, y + 3, 6, 5); P.rect('#d06a3a', x - 1, y, 10, 3); P.rect('#6e2f16', x + 1, y + 9, 6, 1);
  P.rect('#2f7a3a', x + 1, y - 5, 6, 5); P.rect('#3f9a4a', x + 2, y - 7, 4, 3); P.px(flower, x + 2, y - 6); P.px(flower, x + 5, y - 4); P.px(arLit(flower, .5), x + 3, y - 7);
}
function arRocks(P, x, y, n, base){                                           // montoncito de rocas
  for(let i = 0; i < n; i++){ const rw = 6 + (P.r() * 8 | 0), rh = 4 + (P.r() * 5 | 0), rx = x + i * 5 - (P.r() * 3 | 0), ry = y - rh;
    P.rect(arDrk(base, .35), rx, ry + 1, rw, rh); P.rect(base, rx + 1, ry, rw - 2, rh - 1); P.alpha('#ffffff', .25, rx + 1, ry, rw - 3, 1); }
}
function arColumn(P, x, y0, y1, w, base){                                     // columna de mármol con capitel y base
  P.rect(arDrk(base, .25), x, y0 + 3, w, y1 - y0 - 6); P.rect(base, x + 1, y0 + 3, w - 3, y1 - y0 - 6); P.rect(arLit(base, .3), x + 2, y0 + 3, 2, y1 - y0 - 6);
  for(let yy = y0 + 6; yy < y1 - 6; yy += 4) P.alpha('#000000', .12, x + 1, yy, w - 2, 1);
  P.rect(arLit(base, .12), x - 2, y0, w + 4, 3); P.rect(arDrk(base, .3), x - 2, y0 + 2, w + 4, 1);
  P.rect(arLit(base, .12), x - 2, y1 - 3, w + 4, 3); P.rect(arDrk(base, .3), x - 2, y1 - 1, w + 4, 1);
}

// =====================================================================
//  LAS 13 ARENAS
// =====================================================================
const ARENAS = {

  // ---- Brock · Ciudad Plateada: piedra gris lisa, pared de ladrillo sobria ----
  brock: {dark: .18, side:{base:'#4b4e57', mortar:'#2a2c32'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 16, 16, (x, y) => (x + y) & 1 ? '#5f636d' : '#575b65', '#383b43');
      arSpeck(P, 0, WH, w, h - WH, 420, ['#6b6f79', '#4f525b', '#666a74']);
      arBricks(P, 0, 0, w, WH, 14, 6, '#4b4e57', '#2a2c32', .09);
      P.rect('#35373e', 0, WH - 4, w, 4); P.rect('#6a6d77', 0, WH - 4, w, 1);                       // zócalo
      P.rect('#262830', w / 2 - 12, 8, 24, WH - 12); P.rect('#33353d', w / 2 - 10, 10, 20, WH - 14); P.rect('#6a6d77', w / 2 - 12, 6, 24, 2);   // portón de piedra
      P.rect('#262830', w / 2 - 1, 10, 2, WH - 14);
      arRocks(P, 6, WH + 2, 4, '#6a6d77'); arRocks(P, w - 30, WH + 2, 4, '#6a6d77');                // rocas decorativas
      arOcclude(P, w, WH); return {};
    }},

  // ---- Misty · Ciudad Celeste: baldosas azules en cuadrícula, piscina y bordes limpios ----
  misty: {dark: .2,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 12, 12, (x, y) => (x + y) & 1 ? '#2f78bd' : '#2a6aa8', '#8fcbf0', .1);
      const water = [[0, 0, w, WH - 6], [0, WH, 11, h - WH], [w - 11, WH, 11, h - WH]];
      water.forEach(([x, y, ww, hh]) => { P.rect('#1f86d0', x, y, ww, hh);
        for(let yy = y + 2; yy < y + hh; yy += 4) for(let xx = x + ((yy >> 2) & 1) * 3; xx < x + ww; xx += 7) P.rect('#4aa8ea', xx, yy, 3, 1); });
      P.rect('#cfd9e6', 0, WH - 6, w, 5); P.rect('#ffffff', 0, WH - 6, w, 1); P.rect('#9aa8ba', 0, WH - 2, w, 2);           // borde de piscina
      P.rect('#cfd9e6', 11, WH, 2, h - WH); P.rect('#9aa8ba', 13, WH, 1, h - WH); P.rect('#cfd9e6', w - 13, WH, 2, h - WH); P.rect('#9aa8ba', w - 14, WH, 1, h - WH);
      for(let i = 0; i < 3; i++){ const px = Math.round(w * (.22 + i * .28)) - 8;                                             // plataformas redondas
        P.rect('#9aa8ba', px, 8, 18, 12); P.rect('#cfd9e6', px + 2, 7, 14, 12); P.rect('#ffffff', px + 4, 8, 6, 1); }
      arOcclude(P, w, WH); return {water};
    },
    anim(c, t, d){ c.fillStyle = '#9fdcff'; c.globalAlpha = .5;
      d.water.forEach(([x, y, ww, hh], k) => { for(let i = 0; i < Math.max(3, ww / 30); i++){
        const px = x + ((i * 53 + t * 9 + k * 17) % ww), py = y + 2 + ((i * 29 + k * 7) % Math.max(1, hh - 4));
        c.fillRect(Math.floor(px), Math.floor(py), 3, 1); } });
      c.globalAlpha = 1; }},

  // ---- Lt. Surge · Ciudad Carmín: metal oscuro con paneles eléctricos y pared militar ----
  lt_surge: {dark: .2, side:{base:'#5a5e64', mortar:'#2a2c30'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 16, 16, (x, y) => (x + y) & 1 ? '#2f343d' : '#292d35', '#14171c');
      for(let y = WH; y < h; y += 16) for(let x = 0; x < w; x += 16){ P.px('#4a505c', x + 2, y + 2); P.px('#4a505c', x + 12, y + 2); P.px('#4a505c', x + 2, y + 12); P.px('#4a505c', x + 12, y + 12); }
      const panels = [], cols = Math.floor(w / 16);
      [[2, 1], [cols - 4, 1], [4, 5], [cols - 6, 5], [Math.floor(cols / 2) - 1, 3], [1, 8], [cols - 3, 8], [Math.floor(cols / 2), 9]].forEach(([tx, ty]) => { panels.push([tx * 16 + 1, WH + ty * 16 + 1]); });
      panels.forEach(([x, y]) => { P.rect('#e8c33a', x, y, 14, 14); P.rect('#16191f', x + 1, y + 1, 12, 12);
        [[3, 9], [5, 6], [7, 8], [9, 4], [10, 6]].forEach(([a, b]) => P.px('#ffe066', x + a, y + b)); P.rect('#ffe066', x + 6, y + 3, 2, 3); P.rect('#ffe066', x + 5, y + 6, 4, 1); P.rect('#ffe066', x + 6, y + 7, 2, 3); });
      arBricks(P, 0, 0, w, WH, 12, 6, '#5a5e64', '#2a2c30', .08);
      P.rect('#3a3d42', 0, WH / 2 - 2, w, 4); P.rect('#6e7279', 0, WH / 2 - 2, w, 1);                                    // banda de acero
      for(let x = 3; x < w; x += 10) P.px('#9aa0a8', x, WH / 2);
      const coils = [];
      [14, w - 14].forEach(x => { P.rect('#2a2c30', x - 1, 6, 3, WH - 8); P.rect('#3f4349', x - 4, WH - 6, 9, 4); P.rect('#d0d6de', x - 3, 4, 7, 4); P.rect('#ffffff', x - 2, 5, 2, 2); coils.push([x, 6]); });
      P.rect('#1c1e22', w / 2 - 14, 5, 28, 16); P.rect('#e8c33a', w / 2 - 14, 5, 28, 2); P.rect('#0e2a40', w / 2 - 12, 8, 24, 11);
      P.rect('#6e7279', w / 2 - 14, WH - 4, 28, 1);
      P.rect('#35373e', 0, WH - 4, w, 4); P.rect('#6e7279', 0, WH - 4, w, 1);
      arOcclude(P, w, WH); return {panels, coils};
    },
    anim(c, t, d, w){
      d.panels.forEach(([x, y], i) => { const a = Math.max(0, Math.sin(t * 4 + i * 1.7)); c.globalAlpha = .22 * a; c.fillStyle = '#ffe066'; c.fillRect(x, y, 14, 14); });
      c.globalAlpha = 1; c.fillStyle = '#6fe8ff';
      d.coils.forEach(([x, y], i) => { if(Math.sin(t * 7 + i * 3) > .55){ let px = x, py = y; for(let k = 0; k < 6; k++){ c.fillRect(px, py, 1, 2); px += (Math.sin(t * 40 + k + i) > 0 ? 2 : -2); py += 2; } } });
      c.fillStyle = '#6fe8ff'; c.globalAlpha = .7 + .3 * Math.sin(t * 3); c.fillRect(Math.floor(w / 2 - 10), 10, 4, 1); c.fillRect(Math.floor(w / 2 - 4), 12, 9, 1); c.fillRect(Math.floor(w / 2 - 10), 14, 6, 1); c.globalAlpha = 1; }},

  // ---- Erika · Ciudad Azulona: madera clara, tatami, setos recortados y macetas ----
  erika: {dark: .2,
    build(P, w, h, WH){
      P.rect('#8a6738', 0, WH, w, h - WH);
      for(let y = WH, row = 0; y < h; y += 6, row++){
        for(let x = -(row * 11) % 28; x < w; x += 28){ const col = ['#c39a60', '#bb925a', '#c9a066', '#b78d56'][(P.r() * 4) | 0];
          P.rect(col, Math.max(0, x), y, Math.min(27, w - x) - (x < 0 ? -x : 0), 5); P.alpha('#ffffff', .12, Math.max(0, x), y, 27, 1); }
        P.alpha('#000000', .2, 0, y + 5, w, 1); }
      arSpeck(P, 0, WH, w, h - WH, 160, ['#a97f48', '#d0a96e']);
      const tw = 40, th = 20, tx0 = Math.round(w / 2 - tw * 2), ty0 = WH + 30;                                              // alfombra de tatami
      for(let j = 0; j < 3; j++) for(let i = 0; i < 4; i++){ const x = tx0 + i * tw, y = ty0 + j * th;
        P.rect('#3d4a2a', x, y, tw - 1, th - 1); P.rect(((i + j) & 1) ? '#a8b074' : '#9aa468', x + 1, y + 1, tw - 3, th - 3);
        for(let k = 3; k < tw - 3; k += 3) P.alpha('#000000', .07, x + k, y + 1, 1, th - 3); }
      P.rect('#2a6a34', 0, 0, w, WH);                                                                                      // seto del fondo
      for(let i = 0; i < w * 2.2; i++){ const x = P.r() * w, y = P.r() * (WH - 3), s = 2 + (P.r() * 3 | 0);
        P.rect(['#2f7a3a', '#3a8f45', '#256030', '#44a050'][(P.r() * 4) | 0], x, y, s, s - 1); }
      P.rect('#1b4a24', 0, WH - 5, w, 5); P.rect('#3a8f45', 0, 0, w, 1);
      for(let x = 0; x < w; x += 14) P.rect('#44a050', x, 2, 5, 2);
      for(let i = 0; i < 40; i++) P.px(['#ff7aa8', '#ffe066', '#ffffff'][(P.r() * 3) | 0], P.r() * w, 3 + P.r() * (WH - 10));  // flores
      [0, w - 9].forEach(x => { P.rect('#2a6a34', x, WH, 9, h - WH); for(let k = 0; k < 40; k++) P.rect(['#2f7a3a', '#3a8f45', '#256030'][(P.r() * 3) | 0], x + P.r() * 8, WH + P.r() * (h - WH), 3, 2);
        P.rect('#1b4a24', x === 0 ? 8 : x, WH, 1, h - WH); });
      [[12, WH - 3], [w / 2 - 36, WH - 3], [w / 2 + 28, WH - 3], [w - 22, WH - 3]].forEach(([x, y], i) => arPot(P, Math.round(x), y, ['#ff7aa8', '#ffe066', '#ff5a7a', '#ffffff'][i]));
      arOcclude(P, w, WH); return {};
    }},

  // ---- Koga · Ciudad Fucsia: baldosas oscuras geométricas, paredes moradas de ninja ----
  koga: {dark: .22, side:{base:'#4c2f70', mortar:'#2c1a44'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 12, 12, (x, y) => (x + y) & 1 ? '#2b2338' : '#241d30', '#120e1a', .08);
      for(let y = WH; y < h; y += 12) for(let x = 0; x < w; x += 12){ const cx = x + 5, cy = y + 5;                           // rombo en cada baldosa
        [[0, -4], [-1, -3], [1, -3], [-2, -2], [2, -2], [-3, -1], [3, -1], [-4, 0], [4, 0], [-3, 1], [3, 1], [-2, 2], [2, 2], [-1, 3], [1, 3], [0, 4]].forEach(([a, b]) => P.px('#4f3d73', cx + a, cy + b)); }
      P.rect('#3a2358', 0, 0, w, WH);
      for(let x = 0; x < w; x += 6){ P.rect('#4c2f70', x, 0, 5, WH); P.rect('#5d3a86', x, 0, 1, WH); P.rect('#2c1a44', x + 5, 0, 1, WH); }
      P.rect('#1c1230', 0, 0, w, 5); P.rect('#6a4a96', 0, 5, w, 1);
      P.rect('#1c1230', 0, WH - 5, w, 5); P.rect('#6a4a96', 0, WH - 5, w, 1);
      const cx = Math.round(w / 2);                                                                                          // emblema ninja: estrella de 4 puntas
      P.rect('#140b22', cx - 11, 8, 22, 22); P.rect('#2c1a44', cx - 10, 9, 20, 20);
      for(let k = -8; k <= 8; k++){ const m = Math.max(0, 3 - Math.floor(Math.abs(k) / 3)); P.rect('#d9c8f5', cx - m, 19 + k, m * 2 + 1, 1); P.rect('#d9c8f5', cx + k, 19 - m, 1, m * 2 + 1); }
      P.rect('#2c1a44', cx - 1, 18, 3, 3);
      [[14, 14], [w - 14, 14]].forEach(([x, y]) => { P.rect('#1c1230', x - 1, y - 10, 3, 2); P.rect('#7a4aa8', x - 4, y - 8, 9, 12); P.rect('#a878d8', x - 3, y - 7, 2, 10); P.rect('#1c1230', x - 4, y + 4, 9, 2); });   // faroles
      arOcclude(P, w, WH); return {lamps: [[14, 6], [w - 14, 6]]};
    },
    anim(c, t, d, w){ c.fillStyle = '#9a6bd8';
      for(let i = 0; i < 7; i++){ const px = ((i * 71 + t * (5 + i)) % (w + 40)) - 20, py = AR_WALL + 20 + ((i * 37) % 90) + Math.sin(t * .8 + i) * 4;
        c.globalAlpha = .08 + .04 * Math.sin(t + i); c.fillRect(Math.floor(px), Math.floor(py), 34, 5); c.fillRect(Math.floor(px + 6), Math.floor(py - 2), 20, 2); }
      c.globalAlpha = .35 + .15 * Math.sin(t * 3); c.fillStyle = '#c99aff'; d.lamps.forEach(([x, y]) => c.fillRect(x - 3, y + 1, 7, 8)); c.globalAlpha = 1; }},

  // ---- Sabrina · Ciudad Azafrán: baldosas psicodélicas en anillos y pared de ojos ----
  sabrina: {dark: .2, side:{base:'#2c1c5c', mortar:'#0a0618'},
    build(P, w, h, WH){
      const pal = ['#8a2a9a', '#2f2a8a', '#2a8aa0', '#b0308f'], ts = 14, cols = Math.ceil(w / ts), rows = Math.ceil((h - WH) / ts), cx = cols / 2, cy = rows / 2;
      arTiles(P, 0, WH, w, h - WH, ts, ts, (x, y) => { const d = Math.max(Math.abs(x - cx), Math.abs(y - cy)) | 0, c = pal[d % 4]; return ((x + y) & 1) ? c : arDrk(c, .35); }, '#0e0a1e', .1);
      P.rect('#1e1440', 0, 0, w, WH);
      for(let x = 0; x < w; x += 20){ P.rect('#2c1c5c', x, 0, 10, WH); P.alpha('#ffffff', .05, x, 0, 10, WH); }
      for(let k = 0; k < 18; k++) P.px('#ffe066', P.r() * w, P.r() * (WH - 4));
      for(let x = 28; x < w - 20; x += 56){                                                                                  // ojo
        P.rect('#0a0618', x - 11, 12, 23, 12); P.rect('#e8dcff', x - 9, 14, 19, 8); P.rect('#0a0618', x - 6, 12, 13, 2); P.rect('#0a0618', x - 6, 22, 13, 2);
        P.rect('#b0308f', x - 3, 14, 7, 8); P.rect('#0a0618', x - 1, 16, 3, 4); P.px('#ffffff', x - 2, 15); }
      P.rect('#0a0618', 0, WH - 4, w, 4); P.rect('#6a3ab0', 0, WH - 4, w, 1);
      const pads = [[Math.round(w * .12), WH + 22], [Math.round(w * .88), WH + 22], [Math.round(w * .12), h - 24], [Math.round(w * .88), h - 24]];   // teletransportadores
      pads.forEach(([x, y]) => { for(let rr = 9; rr > 0; rr -= 3){ for(let a = 0; a < 40; a++){ const an = a / 40 * 6.283; P.px(rr % 2 ? '#e8a0ff' : '#6fe8ff', x + Math.cos(an) * rr, y + Math.sin(an) * rr * .6); } } P.px('#ffffff', x, y); });
      arOcclude(P, w, WH); return {ts, cols, rows, cx, cy, pads};
    },
    anim(c, t, d){ c.fillStyle = '#ffffff';
      for(let y = 0; y < d.rows; y++) for(let x = 0; x < d.cols; x++){ const dd = Math.max(Math.abs(x - d.cx), Math.abs(y - d.cy)), v = Math.sin(dd * .9 - t * 2.4);
        if(v > .82){ c.globalAlpha = (v - .82) * .9; c.fillRect(x * d.ts, AR_WALL + y * d.ts, d.ts - 1, d.ts - 1); } }
      c.globalAlpha = .4 + .3 * Math.sin(t * 4); c.fillStyle = '#e8a0ff'; d.pads.forEach(([x, y]) => c.fillRect(x - 3, y - 1, 7, 3)); c.globalAlpha = 1; }},

  // ---- Blaine · Isla Canela: piedra volcánica con grietas de magma ----
  blaine: {dark: .12, side:{base:'#4d2a22', mortar:'#1c0f0c'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 20, 20, (x, y) => ['#2e2220', '#281d1b', '#33261f'][(x * 7 + y * 3) % 3], '#120b0a', .08);
      arSpeck(P, 0, WH, w, h - WH, 300, ['#3d2c28', '#1c1312', '#4a3328']);
      const glowC = document.createElement('canvas'); glowC.width = w; glowC.height = h; const G = arPainter(glowC.getContext('2d')); G.r = P.r;
      const lava = (x, y, len, dx, dy, thick) => { arCrack(G, x, y, len, '#ff8a1a', dx, dy, .35); };
      for(let i = 0; i < 9; i++){ const x0 = P.r() * w, y0 = WH + 8 + P.r() * (h - WH - 16), dir = P.r() < .5;
        lava(x0, y0, 30 + P.r() * 50, dir ? 1 : 0, dir ? 0 : 1); lava(x0, y0, 20 + P.r() * 30, dir ? -1 : 0, dir ? 0 : -1); }
      const img = G.c.getImageData(0, 0, w, h).data;                                                                         // núcleo caliente y borde de cada grieta
      for(let y = 1; y < h - 1; y++) for(let x = 1; x < w - 1; x++) if(img[(y * w + x) * 4 + 3] > 0){
        P.px('#ffb43a', x, y);
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { if(!img[((y + b) * w + x + a) * 4 + 3]) P.alpha('#7a2a10', .85, x + a, y + b, 1, 1); }); }
      P.rect('#3a1f1a', 0, 0, w, WH);                                                                                        // pared de roca de fuego
      for(let i = 0; i < w / 3; i++){ const x = P.r() * w, y = P.r() * WH, s = 4 + (P.r() * 9 | 0); P.rect(['#4d2a22', '#5a3228', '#3d211b', '#6a3a2a'][(P.r() * 4) | 0], x, y, s, s * .6); }
      for(let i = 0; i < 4; i++){ const x = Math.round(w * (.14 + i * .24)) + (P.r() * 8 | 0); for(let y = 0; y < WH - 4; y++){ P.rect('#ff7a1a', x + (y % 7 < 2 ? 1 : 0), y, 3, 1); P.px('#ffd060', x + 1, y); }   // cascadas de lava
        P.rect('#ff7a1a', x - 3, WH - 6, 9, 3); P.rect('#ffd060', x - 1, WH - 6, 5, 1); }
      P.rect('#1c0f0c', 0, WH - 4, w, 4);
      arOcclude(P, w, WH);
      return {glow: glowC, flames: [[w * .14, WH - 6], [w * .38, WH - 6], [w * .62, WH - 6], [w * .86, WH - 6]]};
    },
    anim(c, t, d, w){
      c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .22 + .16 * Math.sin(t * 2.2); c.drawImage(d.glow, 0, 0); c.restore();
      c.fillStyle = '#ffb43a';
      for(let i = 0; i < 22; i++){ const x = (i * 47.3 + Math.sin(t * .7 + i) * 6) % w, yy = ((t * (10 + i % 5 * 3) + i * 31) % 150), y = 175 - yy;
        c.globalAlpha = Math.max(0, 1 - yy / 150) * .9; c.fillRect(Math.floor(x), Math.floor(y), 1, 1); }
      c.globalAlpha = 1; d.flames.forEach(([x, y], i) => arFlame(c, x + 1, y, t, i, '#ff7a1a', '#ffd060')); }},

  // ---- Giovanni · Ciudad Verde: metal gris con emblema y terminales de ordenador ----
  giovanni: {dark: .2, side:{base:'#3a404c', mortar:'#1a1d24'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 16, 16, (x, y) => (x + y) & 1 ? '#585e69' : '#4f5560', '#2a2e36');
      arSpeck(P, 0, WH, w, h - WH, 300, ['#646a76', '#454a54']);
      const cx = Math.round(w / 2), cy = WH + 66;                                                                           // emblema del gimnasio (G en círculo)
      for(let a = 0; a < 360; a += 1){ const an = a * Math.PI / 180; for(let rr = 30; rr <= 34; rr++) P.px(rr > 32 ? '#6a1a1a' : '#a82a2a', cx + Math.cos(an) * rr, cy + Math.sin(an) * rr * .78); }
      for(let a = 0; a < 360; a += 2){ const an = a * Math.PI / 180; P.px('#2a2e36', cx + Math.cos(an) * 26, cy + Math.sin(an) * 26 * .78); }
      const G = ['.#####.', '##...##', '##.....', '##.###.', '##...##', '##...##', '.#####.'];                          // letra G de 7x7 ampliada x3
      G.forEach((row, j) => [...row].forEach((ch, i) => { if(ch === '#') P.rect('#b83232', cx - 10 + i * 3, cy - 10 + j * 3, 3, 3); }));
      P.alpha('#000000', .2, cx - 10, cy - 10 + 21, 21, 1);
      for(let i = 0; i < 4; i++){ const a = i * Math.PI / 2 + Math.PI / 4; P.rect('#a82a2a', cx + Math.cos(a) * 38 - 1, cy + Math.sin(a) * 38 * .78 - 1, 3, 3); }
      P.rect('#2d323c', 0, 0, w, WH);                                                                                       // pared de acero con terminales
      for(let x = 0; x < w; x += 24){ P.rect('#3a404c', x, 0, 23, WH); P.alpha('#ffffff', .07, x, 0, 23, 1); P.alpha('#000000', .3, x + 23, 0, 1, WH); }
      const screens = [];
      for(let x = 14; x < w - 24; x += 40){ P.rect('#1a1d24', x, 8, 30, 18); P.rect('#0c2418', x + 2, 10, 26, 12); P.rect('#4a505c', x + 6, 26, 18, 3); P.rect('#22262e', x + 2, 29, 26, 3);
        for(let k = 0; k < 4; k++) P.rect('#3ee08a', x + 4, 12 + k * 3, 6 + ((x + k * 5) % 12), 1);
        P.px('#ff5a5a', x + 3, 24); screens.push([x + 2, 10]); }
      P.rect('#1c1f26', 0, WH - 4, w, 4); P.rect('#6a707c', 0, WH - 4, w, 1);
      arOcclude(P, w, WH); return {screens};
    },
    anim(c, t, d){ d.screens.forEach(([x, y], i) => { c.fillStyle = '#3ee08a'; const k = Math.floor(t * 3 + i) % 4; c.globalAlpha = .9; c.fillRect(x + 2, y + 1 + k * 3, 4 + (Math.floor(t * 6 + i * 3) % 14), 1);
      c.globalAlpha = .12; c.fillRect(x, y, 26, 12); }); c.globalAlpha = 1; }},

  // ---- Lorelei · Alto Mando (Hielo): suelo de bloques de hielo, muro de piedra helada ----
  lorelei: {dark: .24, side:{base:'#4f80a3', mortar:'#2b4c66'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 14, 14, (x, y) => (x + y) & 1 ? '#9ad6ee' : '#8bc9e5', '#5aa0c4', .22);
      for(let i = 0; i < 26; i++){ const x = P.r() * w, y = WH + 6 + P.r() * (h - WH - 12); arCrack(P, x, y, 10 + P.r() * 16, '#e4f6ff', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .4); }
      for(let i = 0; i < 40; i++){ const x = P.r() * w, y = WH + P.r() * (h - WH); P.rect('#d8f2ff', x, y, 3, 1); }
      arBricks(P, 0, 0, w, WH, 22, 10, '#4f80a3', '#2b4c66', .08);
      P.alpha('#ffffff', .1, 0, 0, w, WH);
      for(let x = 2; x < w; x += 9 + (P.r() * 6 | 0)){ const len = 3 + (P.r() * 7 | 0);                                       // carámbanos
        for(let k = 0; k < len; k++){ P.rect(k > len - 3 ? '#ffffff' : '#bfeaff', x + Math.floor(k / 3) * 0, 0 + k, Math.max(1, 3 - Math.floor(k / 3)), 1); } }
      P.rect('#2b4c66', 0, WH - 4, w, 4); P.rect('#9ad6ee', 0, WH - 4, w, 1);
      for(let x = 0; x < w; x += 26) P.rect('#e8f8ff', x, WH - 7, 12 + (x % 9), 3);                                         // nieve en el zócalo
      const spark = []; for(let i = 0; i < 26; i++) spark.push([P.r() * w | 0, WH + 4 + (P.r() * (h - WH - 8) | 0), P.r() * 6]);
      arOcclude(P, w, WH); return {spark};
    },
    anim(c, t, d){ c.fillStyle = '#ffffff'; d.spark.forEach(([x, y, ph]) => { const a = Math.sin(t * 2.4 + ph); if(a > .4){ c.globalAlpha = a; c.fillRect(x, y, 1, 1);
      if(a > .85){ c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 3); } } }); c.globalAlpha = 1; }},

  // ---- Bruno · Alto Mando (Lucha): roca maciza marrón, cueva de bloques pesados ----
  bruno: {dark: .2, side:{base:'#523826', mortar:'#22150a'},
    build(P, w, h, WH){
      P.rect('#3a2616', 0, WH, w, h - WH);
      for(let y = WH, row = 0; y < h; y += 22, row++){ for(let x = -(row * 17) % 46; x < w; x += 46){ const bw = 44, bh = 20, col = ['#6e4b2e', '#654529', '#5b3e26', '#70502f'][(P.r() * 4) | 0], xx = Math.max(0, x);
        P.rect(col, xx, y, Math.min(bw, w - xx) - (x < 0 ? 0 : 0), bh); P.alpha('#ffffff', .1, xx, y, bw, 1); P.alpha('#000000', .25, xx, y + bh - 1, bw, 1);
        arCrack(P, xx + 4 + (P.r() * 30 | 0), y + 3, 8 + (P.r() * 8 | 0), '#2a190c', 0, 1, .4); } }
      arSpeck(P, 0, WH, w, h - WH, 320, ['#7c5836', '#4a3220', '#3a2616']);
      arBricks(P, 0, 0, w, WH, 20, 11, '#523826', '#22150a', .12);
      P.alpha('#000000', .25, 0, 0, w, 6);
      for(let i = 0; i < 5; i++){ const x = Math.round(w * (.08 + i * .21)); for(let k = 0; k < 8; k++) P.rect('#6a4a30', x - 4 + Math.floor(k / 2), WH - 12 + k, 8 - k, 1); }    // estalagmitas junto a la pared
      P.rect('#22150a', 0, WH - 4, w, 4); P.rect('#6a4a30', 0, WH - 4, w, 1);
      const torches = [[Math.round(w * .27), 11], [Math.round(w * .73), 11]];
      torches.forEach(([x, y]) => { arTorch(P, x, y + 2, '#4a3020'); });
      arRocks(P, 8, WH + 2, 3, '#6a4a30'); arRocks(P, w - 26, WH + 2, 3, '#6a4a30');
      arOcclude(P, w, WH); return {torches};
    },
    anim(c, t, d){ d.torches.forEach(([x, y], i) => arFlame(c, x, y + 2, t, i, '#ff9a2a', '#ffe066')); }},

  // ---- Agatha · Alto Mando (Fantasma): piedra sepulcral oscura, ladrillo antiguo agrietado, velas ----
  agatha: {dark: .26, side:{base:'#41364a', mortar:'#1b1521'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 14, 14, (x, y) => (x + y) & 1 ? '#302c3b' : '#27232f', '#100e16', .08);
      for(let i = 0; i < 30; i++){ arCrack(P, P.r() * w, WH + 4 + P.r() * (h - WH - 8), 6 + P.r() * 14, '#100e16', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .4); }
      arSpeck(P, 0, WH, w, h - WH, 120, ['#3a3a30', '#2a3a30']);
      arBricks(P, 0, 0, w, WH, 12, 6, '#41364a', '#1b1521', .1);
      for(let i = 0; i < 12; i++) arCrack(P, P.r() * w, P.r() * (WH - 8), 6 + P.r() * 8, '#17111d', 0, 1, .5);
      [[0, 1], [w - 1, -1]].forEach(([x, s]) => { for(let k = 0; k < 14; k++){ P.alpha('#d8d4e8', .5, x + s * k * .9, k * .9, 1, 1); P.alpha('#d8d4e8', .4, x + s * k * .5, k, 1, 1); P.alpha('#d8d4e8', .4, x + s * k, k * .5, 1, 1); } });   // telarañas
      P.rect('#1b1521', 0, WH - 4, w, 4); P.rect('#5a4c68', 0, WH - 4, w, 1);
      const candles = [];                                                                                                    // candelabros
      [Math.round(w * .22), Math.round(w * .5), Math.round(w * .78)].forEach(x => { P.rect('#2a2a34', x - 1, 20, 3, 10); P.rect('#5a5a68', x - 5, 18, 11, 2); P.rect('#5a5a68', x - 3, WH - 6, 7, 2);
        [-4, 0, 4].forEach(dx => { P.rect('#d8d4c0', x + dx, 14, 1, 4); candles.push([x + dx, 14]); }); });
      [Math.round(w * .09), Math.round(w * .91)].forEach(x => { P.rect('#58546a', x - 5, WH - 12, 11, 12); P.rect('#6a6680', x - 4, WH - 14, 9, 3); P.rect('#6a6680', x - 3, WH - 16, 7, 2); P.rect('#2a2634', x - 1, WH - 10, 3, 1); P.rect('#2a2634', x - 1, WH - 7, 3, 1); });   // lápidas
      arOcclude(P, w, WH); return {candles};
    },
    anim(c, t, d, w){ d.candles.forEach(([x, y], i) => arFlame(c, x, y, t, i, i % 2 ? '#9a6bff' : '#7a4ad8', '#e8d8ff'));
      for(let i = 0; i < 3; i++){ const x = ((t * (7 + i * 3) + i * 120) % (w + 40)) - 20, y = 70 + i * 28 + Math.sin(t * 1.3 + i) * 6;
        c.globalAlpha = .16 + .07 * Math.sin(t * 2 + i); c.fillStyle = '#c8b8ff'; c.fillRect(Math.floor(x), Math.floor(y), 8, 9); c.fillRect(Math.floor(x - 1), Math.floor(y + 4), 10, 6);
        c.fillStyle = '#10101a'; c.fillRect(Math.floor(x + 2), Math.floor(y + 2), 1, 2); c.fillRect(Math.floor(x + 5), Math.floor(y + 2), 1, 2); }
      c.globalAlpha = 1; }},

  // ---- Lance · Alto Mando (Dragón): piedra pulida oscura, alfombra roja, muralla de castillo ----
  lance: {dark: .18, side:{base:'#50536e', mortar:'#1e2036'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 18, 18, (x, y) => (x + y) & 1 ? '#2f3150' : '#292b46', '#13142a', .12);
      for(let y = WH; y < h; y += 18) P.alpha('#ffffff', .05, 0, y + 6, w, 2);
      const cx = Math.round(w / 2), cw = 30;
      P.rect('#c9a227', cx - cw / 2 - 2, WH, cw + 4, h - WH); P.rect('#8a1f2a', cx - cw / 2, WH, cw, h - WH);                // alfombra roja con borde dorado
      for(let y = WH + 6; y < h; y += 12){ P.rect('#c9a227', cx - 1, y, 3, 1); P.rect('#c9a227', cx - 2, y + 1, 5, 1); P.rect('#c9a227', cx - 1, y + 2, 3, 1); P.rect('#6a1520', cx - cw / 2, y + 6, cw, 1); }
      P.rect('#0a1030', 0, 0, w, 10);                                                                                        // cielo nocturno tras las almenas
      for(let i = 0; i < 22; i++) P.px('#e8eeff', P.r() * w, P.r() * 8);
      arBricks(P, 0, 10, w, WH - 10, 16, 8, '#50536e', '#1e2036', .08);
      for(let x = 0; x < w; x += 16){ P.rect('#50536e', x, 4, 11, 7); P.alpha('#ffffff', .12, x, 4, 11, 1); P.alpha('#000000', .25, x + 10, 4, 1, 7); P.rect('#0a1030', x + 11, 4, 5, 6); }   // almenas
      P.rect('#1e2036', 0, 9, w, 2);
      [Math.round(w * .2), Math.round(w * .8)].forEach(x => { P.rect('#8a1f2a', x - 7, 12, 14, 18); P.rect('#6a1520', x - 7, 12, 2, 18); P.rect('#c9a227', x - 7, 12, 14, 2);        // estandartes
        for(let k = 0; k < 4; k++) P.rect('#c9a227', x - 4 + k, 16 + k * 2, 8 - k * 2, 1); P.px('#c9a227', x - 1, 27); P.px('#c9a227', x, 28); P.px('#c9a227', x + 1, 27); });
      [Math.round(w * .35), Math.round(w * .65)].forEach(x => { P.rect('#0a1030', x - 3, 14, 7, 14); P.rect('#1e2036', x - 4, 13, 9, 1); P.rect('#1e2036', x - 4, 28, 9, 1); P.px('#e8eeff', x, 18); P.px('#e8eeff', x + 2, 22); });   // aspilleras
      P.rect('#1e2036', 0, WH - 4, w, 4); P.rect('#6a6e90', 0, WH - 4, w, 1);
      const torches = [[Math.round(w * .08), 18], [Math.round(w * .5), 18], [Math.round(w * .92), 18]];
      torches.forEach(([x, y]) => arTorch(P, x, y, '#5a4030'));
      arOcclude(P, w, WH); return {torches};
    },
    anim(c, t, d){ d.torches.forEach(([x, y], i) => arFlame(c, x, y, t, i, '#ff8a2a', '#ffe066')); }},

  // ---- Azul · Campeón: baldosas claras con estrella, columnas clásicas y altar al fondo ----
  azul: {dark: .34,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 16, 16, (x, y) => (x + y) & 1 ? '#d6d2c2' : '#c8c4b2', '#8a8678', .16);
      const cx = Math.round(w / 2), cy = WH + 70;                                                                           // estrella de 8 puntas inscrita en un círculo
      for(let a = 0; a < 360; a++){ const an = a * Math.PI / 180; P.px('#c9a227', cx + Math.cos(an) * 44, cy + Math.sin(an) * 44 * .72); P.px('#4a6fb5', cx + Math.cos(an) * 42, cy + Math.sin(an) * 42 * .72); }
      for(let k = 0; k < 8; k++){ const an = k * Math.PI / 4 + Math.PI / 8; for(let rr = 0; rr < 40; rr++){ const m = Math.max(0, 5 - rr * 5 / 40); for(let o = -m; o <= m; o += 1) P.px(k % 2 ? '#4a6fb5' : '#2f4f95', cx + Math.cos(an) * rr - Math.sin(an) * o, cy + (Math.sin(an) * rr + Math.cos(an) * o) * .72); } }
      for(let a = 0; a < 360; a += 3){ const an = a * Math.PI / 180; P.px('#e8c33a', cx + Math.cos(an) * 8, cy + Math.sin(an) * 8 * .72); }
      P.rect('#2a3358', 0, 0, w, WH);                                                                                       // pared azul noche con paneles
      for(let x = 0; x < w; x += 30){ P.rect('#323d6a', x + 2, 4, 26, WH - 10); P.alpha('#ffffff', .08, x + 2, 4, 26, 1); P.alpha('#000000', .3, x + 2, WH - 7, 26, 1); }
      P.rect('#1a2040', 0, WH - 4, w, 4); P.rect('#a8a498', 0, WH - 4, w, 1);
      const ax = cx;                                                                                                         // altar con escalones y copa
      P.rect('#8a8678', ax - 26, WH - 8, 52, 8); P.rect('#b8b4a4', ax - 24, WH - 10, 48, 3); P.rect('#8a8678', ax - 18, WH - 14, 36, 4); P.rect('#b8b4a4', ax - 16, WH - 16, 32, 3);
      P.rect('#8a8678', ax - 5, 14, 10, 4); P.rect('#d8d4c4', ax - 4, 12, 8, 3);
      P.rect('#6a6658', ax - 2, 22, 5, 8); P.rect('#c9a227', ax - 8, 18, 17, 4); P.rect('#e8c33a', ax - 6, 18, 13, 2); P.rect('#8a6a10', ax - 6, 21, 13, 1); P.rect('#6a6658', ax - 3, 29, 7, 2);
      [Math.round(w * .06), w - Math.round(w * .06) - 14].forEach(x => arColumn(P, x, 0, h - 6, 14, '#d8d4c4'));            // columnas a los lados
      arOcclude(P, w, WH); return {fire: [ax, 18]};
    },
    anim(c, t, d){ arFlame(c, d.fire[0], d.fire[1], t, 1, '#4aa8ff', '#e8f6ff'); }}
};

// ---------------------------------------------------------------------
// Dibujo: se llama desde render.js en cada frame
// ---------------------------------------------------------------------
function arBuild(A, w){
  const c = document.createElement('canvas'); c.width = w; c.height = AR_H;
  const x = c.getContext('2d'), P = arPainter(x); x.imageSmoothingEnabled = false;
  const data = A.build(P, w, AR_H, AR_WALL) || {};
  if(A.side) arSides(P, w, AR_H, AR_WALL, A.side);
  return {c, w, data};
}
function drawArena(id, t){
  id = ARENA_ALIAS[id] || id; const A = ARENAS[id];
  if(!A){ arenaFallback(); return; }
  const w = Math.ceil(W / AR_S) + 1; let e = arCache[id];
  if(!e || e.w !== w) e = arCache[id] = arBuild(A, w);                                                                         // solo se redibuja si cambia el ancho de la ventana
  ctx.imageSmoothingEnabled = false; ctx.drawImage(e.c, 0, 0, w * AR_S, H);
  if(A.anim){ ctx.save(); ctx.scale(AR_S, AR_S); try{ A.anim(ctx, t || 0, e.data, w); }catch(err){} ctx.restore(); }          // un fallo visual nunca para el juego
  ctx.fillStyle = `rgba(6,8,16,${A.dark === undefined ? .2 : A.dark})`; ctx.fillRect(0, 0, W, H);                             // luz ambiente oscura
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, Math.hypot(W, H) * .55);                            // viñeta
  v.addColorStop(0, 'rgba(3,4,10,0)'); v.addColorStop(1, 'rgba(3,4,10,.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  const top = ctx.createLinearGradient(0, 0, 0, 150); top.addColorStop(0, 'rgba(3,4,10,.4)'); top.addColorStop(1, 'rgba(3,4,10,0)');   // zona del marcador
  ctx.fillStyle = top; ctx.fillRect(0, 0, W, 150);
  const bot = ctx.createLinearGradient(0, H - 100, 0, H); bot.addColorStop(0, 'rgba(3,4,10,0)'); bot.addColorStop(1, 'rgba(3,4,10,.4)');   // zona de la barra de ataques
  ctx.fillStyle = bot; ctx.fillRect(0, H - 100, W, 100);
}
