"use strict";
/* =====================================================================
   ESTADIO GRANDE DE LA TORRE BATALLA (prototipo) · TE_NEW = true lo activa; false = vuelve el estadio de siempre (js/pruebas.js)
   Idea: un estadio visto desde arriba, mucho más grande que la pantalla, y la CÁMARA SIGUE a tu Pokémon.
     - El mundo del combate mide TE.W × TE.H (1900 × 1250). Alrededor del campo: muro con cinta LED, grada llena de público
       (bota cuando hay golpes), pantalla gigante con la imagen del combate en directo, dos pantallas con los entrenadores
       y sus Poké Balls, Pokémon espectadores y las plataformas de los entrenadores en los fondos.
     - El estadio fijo se pinta UNA vez en un lienzo (TE.stad); los destrozos del combate (cráteres) en otro (TE.dec) y no se borran.
     - Engancha con el modo «estadio» de pruebas.js (prOn() ya es true en la Torre: g.o.estTorre) y sustituye su cámara,
       su fondo, sus límites y el paso pantalla ↔ mundo. Nada de esto se usa fuera de la Torre.
   ===================================================================== */
const TE_NEW = true;
const TE = {
  W: 1854,                       // ancho del campo (sale de la imagen del estadio: ver TE_EST)
  H: 820,                        // alto del campo (875 con la imagen vieja, estadio.webp)
  Z: .64,                        // [AJUSTE] cuánto se acerca la cámara (1 = el mundo a tamaño normal; más = Pokémon más grandes y se ve menos campo)
  Zmin: .48,                     // [AJUSTE] lo más que se aleja cuando el rival está lejos
  tile: 190,                     // ancho de la zona de baldosas de cada fondo
  B: {x0: -300, x1: 2157, y0: -483, y1: 1154},     // bordes del estadio entero = la imagen (la cámara no enseña nada de fuera)
  cam: {x: 950, y: 600, z: .5, t: 0},
  ranked: true,                  // [AJUSTE] también en la Clasificatoria online (los dos jugadores tienen que tener esta versión)
  stad: null, dec: null, crowd: [], hype: 0, hp: new Map(), feed: null, feedN: 0
};
// Piezas dibujadas (assets/fondos/torre/): hierba, baldosas y grada se repiten para cubrir el estadio entero. Mientras no cargan, se usa el dibujo hecho con código.
const TE_IMG = {}; ['hierba', 'baldosas', 'grada', 'barandilla'].forEach(k => { const im = new Image(); im.onload = () => { im.ok = true; if(['hierba', 'baldosas', 'grada', 'barandilla'].every(n => TE_IMG[n].ok)) TE.stad = null; }; im.src = 'assets/fondos/torre/' + k + '.png?v=1'; TE_IMG[k] = im; });
const teTex = () => ['hierba', 'baldosas', 'grada', 'barandilla'].every(n => TE_IMG[n].ok);
const WL_ = 40;
const teOn = () => TE_NEW && !!(g && g.o && (g.o.estTorre || g.o.pruebas || g.o.estCampo || g.o.estRegion || (g.o.estadio && TE.ranked)));      // Torre, Campo de pruebas y Clasificatoria online
const teTitle = () => !g || !g.o ? '' : g.o.estTorre ? `TORRE · PISO ${g.o.torreFloor || g.o.floor}` : g.o.pruebas ? 'CAMPO DE PRUEBAS' : g.o.estCampo ? 'CAMPO DE ENTRENAMIENTO' : g.o.estRegion ? (g.o.sub || '') : 'CLASIFICATORIA';
const teFoe = () => g.me === 'e' ? g.p[g.pi] : g.e[g.ei];

// ---------------------------------------------------------------------
// ESTADIO FIJO (se pinta una vez)
// ---------------------------------------------------------------------
let teSeed = 11; const teR = () => (teSeed = (teSeed * 16807) % 2147483647) / 2147483647;
const TE_SHIRT = ['#e8493a', '#3ea6ff', '#ffcc33', '#4ccf6a', '#b36bff', '#ff7ad9', '#f0803c', '#e8eeff', '#2d3b5c', '#7af0ff', '#c9d6f5', '#ff4d6d'];
const TE_SKIN = ['#f3c9a0', '#e0a878', '#b97c50', '#8a5a3a', '#f7d9bd'], TE_HAIR = ['#2a1a10', '#5a3a20', '#d9b060', '#111111', '#8a3020', '#c9c9c9', '#3a2a6a'];
// IMAGEN DEL ESTADIO (assets/fondos/torre/estadio.webp, 2048 × 1365). Medidas en píxeles de la imagen; el mundo es (px - org) × S.
// Estadio VACÍO (assets/fondos/torre/estadio_vacio.webp, de «estadio vacio.png»): el público lo pone el juego (teFans). Medidas en píxeles de la imagen a 2048x1365.
// (La imagen vieja con el público pintado era estadio.webp: org [252, 418], jumbo [834, 62, 1213, 241], sideP [[716,76,810,156],[716,172,810,238]], sideE [[1237,76,1332,156],[1237,172,1332,238]],
//  led [405, 402, 1643, 417], plat [[327, 830], [1721, 830]], y TE.H 875, TE.B {x0:-302, x1:2155, y0:-502, y1:1136}.)
const TE_EST_A = {src: 'assets/fondos/torre/estadio_vacio.webp?v=1', w: 2048, h: 1365, S: 1.2, org: [250, 403], W: 1854, H: 820, B: {x0: -300, x1: 2157, y0: -483, y1: 1154},   // org = esquina de arriba a la izquierda del campo (donde empieza el suelo de piedra)
  jumbo: [831, 51, 1218, 219], sideP: [[714, 69, 811, 149], [714, 160, 811, 236]], sideE: [[1233, 69, 1330, 149], [1233, 160, 1330, 236]],   // pantallas negras de la imagen
  led: [400, 379, 1612, 394], plat: [[322, 792], [1729, 792]], sprites: true,
  crowd: {rows: [                                                            // público de entrenadores sentado en los bancos (como en las regiones). [x0, x1, y, mira]
      ...[78, 112, 146, 178].flatMap(y => [[165, 690, y, 'd'], [1360, 1990, y, 'd']]), ...[242, 274, 306].map(y => [175, 1990, y, 'd']),
      ...[1158, 1190, 1222, 1262, 1294, 1328].map(y => [165, 1990, y, 'u'])],
    cols: [...[70, 110, 150, 190].map(x => [x, 360, 1120, 'r']), ...[1858, 1898, 1938, 1978].map(x => [x, 360, 1120, 'l'])],
    holes: [[180, 0, 212, 330], [425, 0, 460, 330], [1588, 0, 1622, 330], [1836, 0, 1866, 330],
            [425, 1140, 460, 1365], [722, 1140, 757, 1365], [998, 1140, 1050, 1365], [1290, 1140, 1325, 1365], [1586, 1140, 1622, 1365],
            [60, 680, 230, 810], [1818, 680, 1990, 810]],
    dx: 26, dy: 24, dyS: 30, dens: .85, sc: .95}};                                         // cinta LED encima del campo · dónde está cada entrenador (en el cuadro blanco de piedra de su lado)                                         // cinta LED encima del campo · dónde está cada entrenador (en el cuadro blanco de piedra de su lado)
// ESTADIO DE LAS REGIONES (todas menos Kanto): assets/fondos/torre/estadio_galar.webp (1677 × 938), de «Estadio pixelado futurista vacío».
// Sin pantallas ni cinta LED; el público son entrenadores en sprite de mapa (assets/entrenadores_mini/publico.png) y cada entrenador está en el área pequeña de su lado.
const TE_EST_G = {src: 'assets/fondos/torre/estadio_galar.webp?v=2', w: 1677, h: 938, S: 1.4, Z: .5, Zmin: .4,   // Z / Zmin: [AJUSTE] zoom de la cámara en este estadio (menos = se ve más campo)
  org: [184, 245], W: 1834, H: 724, B: {x0: -258, x1: 2090, y0: -343, y1: 970},
  plat: [[216, 548], [1460, 548]], sprites: true,                              // dónde está cada entrenador (dentro del área pequeña de su lado)
  crowd: {rows: [                                                              // filas de asientos: [x0, x1, y, mira] (mira: d = hacia abajo/de frente · u = de espaldas · r / l = de perfil)
      ...[34, 54, 74, 94, 114].map(y => [150, 1530, y, 'd']), ...[858, 878, 898, 918].map(y => [140, 1540, y, 'u'])],
    cols: [...[30, 55, 80].map(x => [x, 175, 790, 'r']), ...[1597, 1622, 1647].map(x => [x, 175, 790, 'l'])],
    holes: [[100, 0, 162, 140], [402, 0, 462, 140], [668, 0, 730, 140], [938, 0, 1000, 140], [1206, 0, 1270, 140], [1512, 0, 1575, 140],
            [95, 840, 158, 938], [405, 840, 465, 938], [672, 840, 732, 938], [942, 840, 1004, 938], [1210, 840, 1272, 938], [1515, 840, 1578, 938],
            [0, 385, 100, 430], [1577, 385, 1677, 430]],
    dx: 30, dy: 24, dyS: 32, dens: .82, sc: 1.15}};                          // separación en las filas · en los lados · cuánta grada se llena · tamaño de cada persona
let TE_EST = TE_EST_A;
const teR2W = q => ({x: (q[0] - TE_EST.org[0]) * TE_EST.S, y: (q[1] - TE_EST.org[1]) * TE_EST.S, w: (q[2] - q[0]) * TE_EST.S, h: (q[3] - q[1]) * TE_EST.S});
let TE_JUMBO, TE_SIDE, TE_LED;
function teDerive(){                                                         // pantallas y cinta LED del estadio que toca (el de las regiones no tiene)
  TE_JUMBO = TE_EST.jumbo ? teR2W(TE_EST.jumbo) : null; TE_LED = TE_EST.led ? teR2W(TE_EST.led) : null;
  TE_SIDE = TE_EST.sideP ? [{s: 'p', a: teR2W(TE_EST.sideP[0]), b: teR2W(TE_EST.sideP[1])}, {s: 'e', a: teR2W(TE_EST.sideE[0]), b: teR2W(TE_EST.sideE[1])}] : [];
}
teDerive();
[TE_EST_A, TE_EST_G].forEach(cfg => { const im = new Image(); im.onload = () => { im.ok = true; if(TE_EST === cfg) TE.stad = null; }; im.src = cfg.src; cfg.img = im; });
function teUse(cfg){                                                         // cambia de estadio (antes de empezar el combate)
  if(TE_EST === cfg) return;
  TE_EST = cfg; TE.W = cfg.W; TE.H = cfg.H; TE.B = cfg.B; TE.Z = cfg.Z || .64; TE.Zmin = cfg.Zmin || .48; teDerive(); TE.stad = null; TE.crowd.length = 0;
}
const teCfgFor = o => o && o.estRegion ? TE_EST_G : TE_EST_A;
const TE_PUB = {cols: 4}; { const im = new Image(); im.onload = () => { TE_PUB.ok = true; TE_PUB.n = (im.height / 32) * TE_PUB.cols; if(TE_EST.sprites) TE.stad = null; }; im.src = 'assets/entrenadores_mini/publico.png?v=2'; TE_PUB.img = im; }   // público: 4 personas por fila, 4 cuadros de 32 cada una (frente, frente andando, espalda, perfil)
const TE_FANS = [[150, -250, '#4a7a9a'], [1850, -110, '#e8c33a'], [-200, 120, '#f08aa8'], [2190, 400, '#6abf6a'], [640, 690, '#8a6ad8'], [1500, 650, '#e07850']];   // Pokémon espectadores (bultos)

function teBuild(){
  if(TE_EST.img && TE_EST.img.ok){                                             // el estadio es la imagen tal cual
    const B = TE.B, c = TE.stad = document.createElement('canvas'); c.width = B.x1 - B.x0; c.height = B.y1 - B.y0;
    const s = c.getContext('2d'); s.imageSmoothingEnabled = true; s.imageSmoothingQuality = 'high'; s.drawImage(TE_EST.img, 0, 0, c.width, c.height);
    teFans(); TE.dec = document.createElement('canvas'); TE.dec.width = TE.W; TE.dec.height = TE.H; return;
  }
  const B = TE.B, w = B.x1 - B.x0, h = B.y1 - B.y0;
  const c = TE.stad = document.createElement('canvas'); c.width = w; c.height = h;
  const s = c.getContext('2d'); s.translate(-B.x0, -B.y0);
  const R = (x, y, ww, hh, col) => { s.fillStyle = col; s.fillRect(Math.round(x), Math.round(y), Math.round(ww), Math.round(hh)); };
  teSeed = 11; TE.crowd.length = 0;
  R(B.x0, B.y0, w, h, '#0b0f1a');
  // grada: filas alternas y asientos (arriba, abajo, izquierda, derecha)
  const ROW = 13, WL = 40;
  const band = (x0, y0, x1, y1, dir) => {
    const horiz = dir === 'n' || dir === 's', len = horiz ? y1 - y0 : x1 - x0;
    for(let r = 0; r * ROW < len; r++){
      const sh = 18 + (r % 2) * 7, col = `rgb(${sh},${sh + 6},${sh + 22})`;
      if(horiz){ const y = dir === 'n' ? y1 - (r + 1) * ROW : y0 + r * ROW; R(x0, y, x1 - x0, ROW, col); R(x0, y + ROW - 3, x1 - x0, 3, '#06080f');
        for(let x = x0 + 3; x < x1 - 8; x += 8) teSeat(x, y + 2, r); }
      else { const x = dir === 'w' ? x1 - (r + 1) * ROW : x0 + r * ROW; R(x, y0, ROW, y1 - y0, col); R(dir === 'w' ? x : x + ROW - 3, y0, 3, y1 - y0, '#06080f');
        for(let y = y0 + 3; y < y1 - 8; y += 9) teSeat(x + 3, y, r); }
    }
  };
  const TX = teTex();
  if(TX){                                                                   // grada dibujada: el público se repite por todas partes y la barandilla mira al campo
    s.imageSmoothingEnabled = false;
    s.fillStyle = s.createPattern(TE_IMG.grada, 'repeat');
    s.fillRect(B.x0, B.y0, w, -WL - B.y0); s.fillRect(B.x0, TE.H + WL, w, B.y1 - TE.H - WL); s.fillRect(B.x0, -WL, -WL - B.x0, TE.H + WL * 2); s.fillRect(TE.W + WL, -WL, B.x1 - TE.W - WL, TE.H + WL * 2);
    const rl = TE_IMG.barandilla, rh = rl.height;
    s.save(); s.fillStyle = s.createPattern(rl, 'repeat-x'); s.translate(0, -WL - rh); s.fillRect(B.x0, 0, w, rh); s.restore();                              // arriba
    s.save(); s.translate(0, TE.H + WL + rh); s.scale(1, -1); s.fillStyle = s.createPattern(rl, 'repeat-x'); s.fillRect(B.x0, 0, w, rh); s.restore();       // abajo
    s.save(); s.translate(-WL - rh, TE.H + WL); s.rotate(-Math.PI / 2); s.fillStyle = s.createPattern(rl, 'repeat-x'); s.fillRect(0, 0, TE.H + WL * 2, rh); s.restore();   // izquierda
    s.save(); s.translate(TE.W + WL + rh, -WL); s.rotate(Math.PI / 2); s.fillStyle = s.createPattern(rl, 'repeat-x'); s.fillRect(0, 0, TE.H + WL * 2, rh); s.restore();   // derecha
    const vg = s.createLinearGradient(0, B.y0, 0, -WL); vg.addColorStop(0, 'rgba(5,7,15,.55)'); vg.addColorStop(1, 'rgba(5,7,15,0)'); s.fillStyle = vg; s.fillRect(B.x0, B.y0, w, -WL - B.y0);   // las filas de atrás, más oscuras
  } else { band(B.x0, B.y0, B.x1, -WL, 'n'); band(B.x0, TE.H + WL, B.x1, B.y1, 's'); band(B.x0, -WL, -WL, TE.H + WL, 'w'); band(TE.W + WL, -WL, B.x1, TE.H + WL, 'e'); }
  // pasillos con escalones (cortan la grada)
  const aisle = (x, y, ww, hh, vert) => { R(x, y, ww, hh, '#1c2234'); s.fillStyle = '#262e45';
    if(vert) for(let yy = y; yy < y + hh; yy += 8) s.fillRect(x, yy, ww, 3); else for(let xx = x; xx < x + ww; xx += 8) s.fillRect(xx, y, 3, hh);
    teCut(x - 10, y - 12, ww + 10, hh + 12); };
  for(let x = 120; x < TE.W; x += 440){ aisle(x, B.y0, 22, -WL - B.y0, true); aisle(x + 200, TE.H + WL, 22, B.y1 - TE.H - WL, true); }
  for(let y = 200; y < TE.H; y += 420){ aisle(B.x0, y, -WL - B.x0, 22, false); aisle(TE.W + WL, y, B.x1 - TE.W - WL, 22, false); }
  // muro alrededor del campo con borde de peligro amarillo y negro
  R(-WL, -WL, TE.W + WL * 2, TE.H + WL * 2, '#151a28'); R(-WL + 3, -WL + 3, TE.W + WL * 2 - 6, TE.H + WL * 2 - 6, '#1d2336');
  const hz = (x, y, ww, hh) => { s.save(); s.beginPath(); s.rect(x, y, ww, hh); s.clip(); R(x, y, ww, hh, '#14110a'); s.fillStyle = '#e8b830';
    const vert = hh > ww, L = vert ? hh : ww, T = vert ? ww : hh;
    for(let i = -T; i < L + T; i += 14){ s.beginPath(); if(vert){ s.moveTo(x, y + i); s.lineTo(x, y + i + 7); s.lineTo(x + T, y + i + 7 + T); s.lineTo(x + T, y + i + T); } else { s.moveTo(x + i, y + T); s.lineTo(x + i + 7, y + T); s.lineTo(x + i + 7 + T, y); s.lineTo(x + i + T, y); } s.fill(); }
    s.restore(); };
  hz(-6, -6, TE.W + 12, 6); hz(-6, TE.H, TE.W + 12, 6); hz(-6, 0, 6, TE.H); hz(TE.W, 0, 6, TE.H);
  // campo: hierba a franjas con briznas
  if(TX){ s.fillStyle = s.createPattern(TE_IMG.hierba, 'repeat'); s.fillRect(0, 0, TE.W, TE.H);
    R(0, 0, TE.W, TE.H, 'rgba(4,22,12,.38)');                                                       // más oscura y apagada (como de noche)
    for(let i = 0; i < 14; i++) if(i % 2) R(i * TE.W / 14, 0, TE.W / 14, TE.H, 'rgba(255,255,255,.035)'); }   // franjas de cortacésped
  else for(let i = 0; i < 14; i++) R(i * TE.W / 14, 0, TE.W / 14 + 1, TE.H, i % 2 ? '#2c6a3a' : '#2f7340');
  for(let i = 0; i < (TX ? 0 : 9000); i++){ const x = teR() * TE.W, y = teR() * TE.H, v = teR();
    s.fillStyle = v < .5 ? 'rgba(18,60,30,.55)' : v < .85 ? 'rgba(70,140,80,.35)' : 'rgba(200,230,170,.18)'; s.fillRect(x | 0, y | 0, 1, v < .9 ? 2 : 1); }
  // baldosas de piedra en los dos fondos (donde empieza cada Pokémon)
  [[0, 1], [TE.W - TE.tile, -1]].forEach(([x, d]) => {
    R(x, 0, TE.tile, TE.H, '#6f7686');
    if(TX){ s.fillStyle = s.createPattern(TE_IMG.baldosas, 'repeat'); s.fillRect(x, 0, TE.tile, TE.H); R(x, 0, TE.tile, TE.H, 'rgba(10,14,30,.22)'); }
    else for(let yy = 0, k = 0; yy < TE.H; yy += 34, k++) for(let xx = x - (k % 2 ? 17 : 0); xx < x + TE.tile; xx += 34){
      const cx = Math.max(x, xx), cw = Math.min(x + TE.tile, xx + 33) - cx; if(cw <= 0) continue;
      R(cx, yy, cw, 33, teR() < .5 ? '#7d8495' : '#757c8d'); R(cx, yy + 30, cw, 3, '#5c6272'); }
    const gx = d > 0 ? x + TE.tile : x, gr = s.createLinearGradient(gx, 0, gx - 12 * d, 0); gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    s.fillStyle = gr; s.fillRect(d > 0 ? gx - 12 : gx, 0, 12, TE.H);
  });
  // líneas blancas pixeladas: banda, medio campo, círculo central y áreas
  s.fillStyle = 'rgba(235,245,255,.92)'; const L = 4, lx = TE.tile;
  s.fillRect(lx, 18, TE.W - lx * 2, L); s.fillRect(lx, TE.H - 18 - L, TE.W - lx * 2, L); s.fillRect(TE.W / 2 - L / 2, 18, L, TE.H - 36);
  const circ = (cx, cy, r) => { for(let a = 0; a < 6.283; a += 1.2 / r) s.fillRect(Math.round(cx + Math.cos(a) * r - L / 2), Math.round(cy + Math.sin(a) * r - L / 2), L, L); };
  circ(TE.W / 2, TE.H / 2, 170); circ(TE.W / 2, TE.H / 2, 40); s.fillRect(TE.W / 2 - 6, TE.H / 2 - 6, 12, 12);
  s.strokeStyle = 'rgba(235,245,255,.85)'; s.lineWidth = L;
  [26, TE.W - TE.tile + 26].forEach(x => { s.strokeRect(x, TE.H / 2 - 220, TE.tile - 52, 440); s.strokeRect(x + 30, TE.H / 2 - 100, TE.tile - 112, 200); });
  // plataformas de los entrenadores (fuera del muro, en los fondos)
  [[-WL - 120, '#4a8cff'], [TE.W + WL + 20, '#ff4a5a']].forEach(([x, col]) => { const y = TE.H / 2 - 70;
    R(x, y, 100, 140, '#2a3146'); R(x + 6, y + 6, 88, 128, '#3a4260'); s.strokeStyle = col; s.lineWidth = 3; s.strokeRect(x + 11, y + 11, 78, 118); teCut(x - 16, y - 20, 132, 176); });
  // marcos de las pantallas (el contenido se pinta en vivo)
  [TE_JUMBO, ...TE_SIDE].forEach(r => { R(r.x - 16, r.y - 16, r.w + 32, r.h + 32, '#0e121e'); R(r.x - 10, r.y - 10, r.w + 20, r.h + 20, '#2a3554'); R(r.x - 4, r.y - 4, r.w + 8, r.h + 8, '#05070c');
    R(r.x + r.w / 2 - 20, r.y + r.h + 16, 40, 40, '#151a28'); teCut(r.x - 30, r.y - 30, r.w + 50, r.h + 90); });
  // Pokémon espectadores (bultos simpáticos en la grada)
  if(!TX) TE_FANS.forEach(([x, y, col]) => { R(x - 22, y - 16, 44, 34, '#06080f'); R(x - 20, y - 20, 40, 34, col); R(x - 12, y - 12, 5, 5, '#111'); R(x + 7, y - 12, 5, 5, '#111'); R(x - 20, y + 8, 40, 6, 'rgba(0,0,0,.25)'); teCut(x - 30, y - 28, 60, 52); });
  TE.dec = document.createElement('canvas'); TE.dec.width = TE.W; TE.dec.height = TE.H;
}
// PÚBLICO sobre la grada de la imagen: gente grande y animada (la pintada en la imagen es tan pequeña que no se distingue)
const TE_CROWD = {z: 1.9, dens: .8, dx: 17, dy: 21,                        // [AJUSTE] tamaño de cada persona · cuánta grada se llena (0..1) · separación (px de la imagen)
  bands: [[40, 50, 700, 187], [1347, 50, 2007, 187], [53, 230, 2000, 327], [40, 342, 207, 1147], [1840, 342, 2008, 1147], [45, 1152, 2003, 1340]],   // zonas con gradas [x0, y0, x1, y1] en píxeles de la imagen
  holes: [[85, 685, 230, 805], [1818, 685, 1965, 805], [985, 1140, 1060, 1365], [700, 187, 1347, 232]]};                                         // túneles, escaleras y bajo las pantallas: sin gente
function teFans(){
  if(TE_EST.sprites) return teFansSpr();
  teSeed = 7; TE.crowd.length = 0; const C = TE_CROWD;
  C.bands.forEach(([a, b, c, d]) => { for(let y = b; y < d; y += C.dy) for(let x = a + ((y / C.dy | 0) % 2) * C.dx / 2; x < c; x += C.dx){
    if(teR() > C.dens || C.holes.some(([h0, h1, h2, h3]) => x > h0 && x < h2 && y > h1 && y < h3)) continue;
    const w = teR2W([x, y, x, y]); TE.crowd.push({x: w.x, y: w.y, s: TE_SHIRT[(teR() * 12) | 0], k: TE_SKIN[(teR() * 5) | 0], h: TE_HAIR[(teR() * 7) | 0], p: teR() * 6.28, wave: teR() < .12}); } });
}
const TE_PUB_NO = [89, 97, 103, 104, 107, 108, 110, 113, 115, 116, 119, 125, 126, 189, 192];   // [AJUSTE] de publico.png, los que no son personas (bichos, estatuas, bultos): no se sientan en la grada
function teFansSpr(){                                                        // público de entrenadores (estadio de las regiones)
  teSeed = 9; TE.crowd.length = 0; const C = TE_EST.crowd, n = TE_PUB.n || 200, hole = (x, y) => C.holes.some(([a, b, c, d]) => x > a && x < c && y > b && y < d);
  const ok = Array.from({length: n}, (_, i) => i).filter(i => !TE_PUB_NO.includes(i));
  const add = (x, y, face) => { if(teR() > C.dens || hole(x, y)) return; const w = teR2W([x, y, x, y]); TE.crowd.push({x: w.x, y: w.y, i: ok[(teR() * ok.length) | 0], face, p: teR() * 6.28, wave: teR() < .1}); };
  C.rows.forEach(([x0, x1, y, face]) => { for(let x = x0 + (teR() * 6 | 0); x < x1; x += C.dx) add(x, y, face); });
  C.cols.forEach(([x, y0, y1, face]) => { for(let y = y0; y < y1; y += C.dyS || C.dy) add(x, y, face); });
  TE.crowd.sort((a, b) => a.y - b.y);
}
function teSeat(x, y, row){ if(teTex() || teR() < .13) return; TE.crowd.push({x, y, s: TE_SHIRT[(teR() * 12) | 0], k: TE_SKIN[(teR() * 5) | 0], h: TE_HAIR[(teR() * 7) | 0], p: teR() * 6.28}); }
function teCut(x, y, w, h){ for(let i = TE.crowd.length - 1; i >= 0; i--){ const q = TE.crowd[i]; if(q.x > x && q.x < x + w && q.y > y && q.y < y + h) TE.crowd.splice(i, 1); } }

// ---------------------------------------------------------------------
// DESTROZOS que se quedan (cráteres y terrones donde pega cada golpe)
// ---------------------------------------------------------------------
function teCrater(x, y, r){
  if(!TE.dec || x < 0 || y < 0 || x > TE.W || y > TE.H) return;
  const d = TE.dec.getContext('2d'), stone = x < TE.tile || x > TE.W - TE.tile, n = 7;
  d.save(); d.translate(x, y);
  d.fillStyle = stone ? 'rgba(40,40,48,.7)' : 'rgba(70,45,30,.8)';
  d.beginPath(); for(let i = 0; i < n; i++){ const a = i / n * 6.283, rr = r * (.75 + Math.random() * .35); d.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * .75); } d.fill();
  d.fillStyle = stone ? 'rgba(20,20,28,.6)' : 'rgba(40,24,14,.8)'; d.beginPath(); d.ellipse(0, 0, r * .45, r * .32, 0, 0, 6.3); d.fill();
  d.strokeStyle = 'rgba(10,10,10,.5)'; d.lineWidth = 1.5;
  for(let i = 0; i < 4; i++){ const a = Math.random() * 6.28; d.beginPath(); d.moveTo(Math.cos(a) * r * .8, Math.sin(a) * r * .6); d.lineTo(Math.cos(a) * r * (1.3 + Math.random() * .6), Math.sin(a) * r * (1 + Math.random() * .5)); d.stroke(); }
  for(let i = 0; i < 5; i++){ const a = Math.random() * 6.28, k = r * (1.1 + Math.random() * .7), sz = 3 + Math.random() * 4;
    d.fillStyle = stone ? '#8a90a0' : '#3f6a3a'; d.fillRect(Math.cos(a) * k, Math.sin(a) * k, sz, sz * .8); d.fillStyle = 'rgba(0,0,0,.4)'; d.fillRect(Math.cos(a) * k, Math.sin(a) * k + sz * .8, sz, 1.5); }
  d.restore();
}
function teWatch(){                                     // cada vez que un Pokémon pierde vida: cráter bajo sus pies y el público se viene arriba
  [...g.p, ...g.e].forEach(f => {
    const was = TE.hp.get(f); TE.hp.set(f, f.hp);
    if(was === undefined || f.hp >= was) return;
    const dmg = (was - f.hp) / (f.max || 100);
    teCrater(f.x + (Math.random() - .5) * 30, f.y + 30, 10 + Math.min(1, dmg * 4) * 16);
    TE.hype = Math.min(1, TE.hype + .2 + dmg * 2);
  });
}

// ---------------------------------------------------------------------
// CÁMARA
// ---------------------------------------------------------------------
const teSW = () => PR.SW;
const TE_HUDH = 120;                                                     // alto (en pantalla) que ocupa el HUD de arriba
function teCamStep(){
  const now = performance.now() / 1000, dt = Math.min(.05, TE.cam.t ? now - TE.cam.t : .016); TE.cam.t = now;
  const c = TE.cam, M = myMon(), O = teFoe(), B = TE.B, SW = teSW();
  const fit = teFitZ();                                                  // el campo entero ajustado a la pantalla (al empezar el combate)
  let tz, tx, ty;
  if(g.count > 0 && !g.over){ tz = fit; tx = TE.W / 2; ty = TE.H / 2 - 30; }   // cuenta atrás: el campo entero; al empezar, la cámara se acerca un poco
  else {                                                                  // en combate: sigue sobre todo a tu Pokémon y abre el plano para que quepan los dos
    const dx = M && O ? Math.abs(O.x - M.x) : 0, dy = M && O ? Math.abs(O.y - M.y) : 0;
    const zf = Math.min(SW / (dx + 560), (H - TE_HUDH) / (dy + 360));       // zoom que encuadra a los dos con margen
    tz = Math.max(Math.max(fit, TE.Zmin), Math.min(TE.Z, zf));
    tx = M ? M.x + (O ? (O.x - M.x) * .35 : 0) : TE.W / 2; ty = M ? M.y + (O ? (O.y - M.y) * .35 : 0) : TE.H / 2;
    ty -= TE_HUDH / 2 / tz;                                                 // el HUD tapa la parte de arriba: la cámara sube un poco para que se vea la grada de arriba
  }
  c.z += (tz - c.z) * Math.min(1, dt * (g.count > 0 ? 3 : 1.4));          // el acercamiento es suave
  const k = Math.min(1, dt * 4.5); c.x += (tx - c.x) * k; c.y += (ty - c.y) * k;   // la cámara te sigue
  const hw = SW / 2 / c.z, hh = H / 2 / c.z;
  c.x = (B.x1 - B.x0) > hw * 2 ? Math.max(B.x0 + hw, Math.min(B.x1 - hw, c.x)) : (B.x0 + B.x1) / 2;
  c.y = (B.y1 - B.y0) > hh * 2 ? Math.max(B.y0 + hh, Math.min(B.y1 - hh, c.y)) : (B.y0 + B.y1) / 2;
  TE.hype = Math.max(0, TE.hype - dt * .45);
}
const teFitZ = () => Math.min(teSW() / (TE.W + 160), H / (TE.H + 260));        // zoom con el que el campo entero (y un poco de grada) cabe en la pantalla
const teW2S = (x, y) => { const c = TE.cam, SW = teSW(); return [(x - c.x) * c.z + SW / 2, (y - c.y) * c.z + H / 2]; };
const teS2W = (x, y) => { const c = TE.cam, SW = teSW(); return {x: (x - SW / 2) / c.z + c.x, y: (y - H / 2) / c.z + c.y}; };

// ---------------------------------------------------------------------
// DIBUJO EN VIVO (en coordenadas del mundo, ya con la cámara puesta)
// ---------------------------------------------------------------------
function teDraw(){
  if(!TE.stad) teBuild();
  const c = TE.cam, SW = teSW(), hw = SW / 2 / c.z, hh = H / 2 / c.z, x0 = c.x - hw, y0 = c.y - hh, x1 = c.x + hw, y1 = c.y + hh, B = TE.B, t = performance.now() / 1000;
  ctx.imageSmoothingEnabled = false;
  const sx = Math.max(B.x0, x0), sy = Math.max(B.y0, y0), sw = Math.min(B.x1, x1) - sx, sh = Math.min(B.y1, y1) - sy;
  if(sw > 0 && sh > 0) ctx.drawImage(TE.stad, sx - B.x0, sy - B.y0, sw, sh, sx, sy, sw, sh);
  ctx.drawImage(TE.dec, 0, 0);
  // público visible: bota (más con los buenos golpes) y levanta los brazos
  const hy = TE.hype, sp = 4 + hy * 8, amp = 1 + hy * 4;
  if(TE_EST.sprites){ if(TE_PUB.ok) teCrowdSpr(x0, y0, x1, y1, t, sp, amp, hy); }
  else { const Z = TE_EST.img && TE_EST.img.ok ? TE_CROWD.z : 1;
  for(const q of TE.crowd){
    if(q.x < x0 - 20 || q.x > x1 + 10 || q.y < y0 - 20 || q.y > y1 + 10) continue;
    const j = (Math.max(0, Math.sin(t * sp + q.p)) * amp | 0) * Z, X = q.x, Y = q.y - j, up = q.wave || (hy > .45 && (q.p * 10 | 0) % 3 === 0);
    if(Z > 1){ ctx.fillStyle = 'rgba(4,6,12,.75)'; ctx.fillRect(X - 1, Y - 1, 6 * Z + 2, 8 * Z + 2); }                         // contorno oscuro: se distingue sobre la grada pintada
    ctx.fillStyle = q.s; ctx.fillRect(X, Y + 4 * Z, 6 * Z, 4 * Z);
    ctx.fillStyle = q.k; ctx.fillRect(X + Z, Y, 4 * Z, 4 * Z);
    ctx.fillStyle = q.h; ctx.fillRect(X + Z, Y, 4 * Z, 1.5 * Z);
    if(up){ const w = Math.sin(t * 9 + q.p) > 0 ? Z : 0; ctx.fillStyle = q.k; ctx.fillRect(X - Z - w, Y - 3 * Z, 1.5 * Z, 5 * Z); ctx.fillRect(X + 5.5 * Z + w, Y - 3 * Z, 1.5 * Z, 5 * Z); }
  } }
  if(TE.hype > .25 && teTex()){                                            // flashes de cámara en la grada
    const n = TE.hype * 14 | 0; ctx.fillStyle = '#ffffff';
    for(let i = 0; i < n; i++){ const fx = x0 + Math.random() * (x1 - x0), fy = y0 + Math.random() * (y1 - y0);
      if(fx > -WL_ && fx < TE.W + WL_ && fy > -WL_ && fy < TE.H + WL_) continue; ctx.globalAlpha = .5 + Math.random() * .5; ctx.fillRect(fx, fy, 3, 3); ctx.globalAlpha = .25; ctx.fillRect(fx - 3, fy - 3, 9, 9); }
    ctx.globalAlpha = 1; }
  if(y0 < 0 && TE_LED) teLed(t);
  if(y0 < -180 && TE_JUMBO){ teJumbo(t); TE_SIDE.forEach(r => teSide(r)); }
  teTrainers(t);
}
function teCrowdSpr(x0, y0, x1, y1, t, sp, amp, hy){                       // cada persona: su sprite mirando al campo; bota y, si el combate se calienta, se levanta
  const S = TE_EST.crowd.sc * 2, im = TE_PUB.img, C = TE_PUB.cols;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  for(const q of TE.crowd){
    if(q.x < x0 - 40 || q.x > x1 + 40 || q.y < y0 - 40 || q.y > y1 + 60) continue;
    const j = Math.max(0, Math.sin(t * sp + q.p)) * amp * 1.4, up = q.wave || (hy > .45 && (q.p * 10 | 0) % 3 === 0);
    const cell = q.face === 'd' ? (up && Math.sin(t * 8 + q.p) > 0 ? 1 : 0) : q.face === 'u' ? 2 : 3;
    const sx = ((q.i % C) * 4 + cell) * 32, sy = Math.floor(q.i / C) * 32, w = 32 * S, h = 32 * S;
    ctx.save(); ctx.translate(Math.round(q.x), Math.round(q.y - j - (up ? 4 : 0)));
    if(q.face === 'r') ctx.scale(-1, 1);
    ctx.drawImage(im, sx, sy, 32, 32, -w / 2, -h + 6 * S, w, h); ctx.restore();
  }
  ctx.restore();
}
function teLed(t){                                                         // cinta LED encima del campo (la franja con cuadritos de la imagen)
  const M = myMon(), O = teFoe(), R = TE_LED;
  const msg = TE.hype > .6 ? '   ¡QUÉ GOLPE!   ¡QUÉ GOLPE!   ¡QUÉ GOLPE!   '
    : `   ${g.o.estTorre ? 'TORRE BATALLA · PISO ' + (g.o.torreFloor || '') : g.o.pruebas ? 'CAMPO DE PRUEBAS' : g.o.estCampo ? 'CAMPO DE ENTRENAMIENTO' : 'CLASIFICATORIA'} · ${(M ? M.m.name : '').toUpperCase()} VS ${(O ? O.m.name : '').toUpperCase()} · ${(g.o.rival || '').toUpperCase()}   `;
  ctx.fillStyle = '#14070b'; ctx.fillRect(R.x, R.y, R.w, R.h);
  ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
  ctx.font = `${Math.round(R.h * .62)}px ${FONT}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillStyle = TE.hype > .6 ? '#ffe680' : '#ff5a6a';
  const tw = ctx.measureText(msg).width, off = (t * 70) % tw;
  for(let xx = R.x - off; xx < R.x + R.w; xx += tw) ctx.fillText(msg, xx, R.y + R.h / 2 + 1);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; for(let yy = R.y; yy < R.y + R.h; yy += 2) ctx.fillRect(R.x, yy, R.w, 1);
  ctx.restore(); ctx.textBaseline = 'alphabetic';
}
function teScan(r){ ctx.fillStyle = 'rgba(0,0,0,.2)'; for(let yy = r.y; yy < r.y + r.h; yy += 3) ctx.fillRect(r.x, yy, r.w, 1); }
function teMonPic(f, x, y, w, h){                                          // retrato del Pokémon (el de la Pokédex)
  if(!f) return;
  if(typeof caraPick === 'function' && CARAS_ON){ const c = caraPick(f.m.dex, f.caraE || 'Normal'); if(c){ ctx.save(); ctx.imageSmoothingEnabled = false; const k = Math.min(w / c.width, h / c.height); ctx.drawImage(c, x + (w - c.width * k) / 2, y + (h - c.height * k) / 2, c.width * k, c.height * k); ctx.restore(); return; } }
  const im = single(f.m.dex); if(!im || !im.ok) return;
  const k = Math.min(w / im.width, h / im.height); ctx.drawImage(im, x + (w - im.width * k) / 2, y + (h - im.height * k) / 2, im.width * k, im.height * k);
}
function teJumbo(t){                                                       // pantalla gigante: los dos Pokémon y el combate en directo
  const r = TE_JUMBO, M = myMon(), O = teFoe(), pw = Math.round(r.w * .22);
  ctx.fillStyle = '#0a1226'; ctx.fillRect(r.x, r.y, r.w, r.h);
  [[M, r.x + 8, '#4a8cff'], [O, r.x + r.w - pw - 8, '#ff4a5a']].forEach(([f, x, col]) => {
    ctx.fillStyle = '#121a33'; ctx.fillRect(x, r.y + 8, pw, r.h - 16); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, r.y + 9.5, pw - 3, r.h - 19);
    teMonPic(f, x + 10, r.y + 20, pw - 20, r.h - 90);
    if(!f) return;
    ctx.font = `8px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff'; ctx.fillText(f.m.name.toUpperCase().slice(0, 12), x + pw / 2, r.y + r.h - 46);
    ctx.fillStyle = '#05070c'; ctx.fillRect(x + 12, r.y + r.h - 34, pw - 24, 9);
    const k = Math.max(0, f.hp / f.max); ctx.fillStyle = k > .5 ? '#4ccf6a' : k > .2 ? '#ffcc33' : '#e8493a'; ctx.fillRect(x + 12, r.y + r.h - 34, (pw - 24) * k, 9);
  });
  // imagen en directo (se renueva cada 4 cuadros)
  const fx = r.x + pw + 16, fw = r.w - pw * 2 - 32, fh = r.h - 16;
  if(!TE.feed){ TE.feed = document.createElement('canvas'); TE.feed.width = fw; TE.feed.height = fh; }
  if(M && O && (TE.feedN++ % 4 === 0)){
    const F = TE.feed.getContext('2d'), cx = (M.x + O.x) / 2, cy = (M.y + O.y) / 2, z = Math.min(.7, fw / (Math.abs(O.x - M.x) + 260));
    F.setTransform(1, 0, 0, 1, 0, 0); F.fillStyle = '#000'; F.fillRect(0, 0, fw, fh);
    F.setTransform(z, 0, 0, z, fw / 2 - cx * z, fh / 2 - cy * z); F.imageSmoothingEnabled = false;
    const B = TE.B; F.drawImage(TE.stad, -B.x0 + cx - fw / 2 / z, -B.y0 + cy - fh / 2 / z, fw / z, fh / z, cx - fw / 2 / z, cy - fh / 2 / z, fw / z, fh / z);
    F.drawImage(TE.dec, 0, 0);
    [O, M].forEach(f => { const im = single(f.m.dex); if(f.dead) return; if(im && im.ok){ const s = 70 / Math.max(im.width, im.height); F.drawImage(im, f.x - im.width * s / 2, f.y - im.height * s, im.width * s, im.height * s); } });
    F.fillStyle = '#ffffff'; (g.shots || []).forEach(s => { F.beginPath(); F.arc(s.x, s.y, 8, 0, 7); F.fill(); });
  }
  ctx.drawImage(TE.feed, fx, r.y + 8, fw, fh);
  ctx.fillStyle = '#e8493a'; ctx.fillRect(fx + 6, r.y + 14, 40, 14); ctx.fillStyle = '#fff'; ctx.font = `7px ${FONT}`; ctx.textAlign = 'left'; ctx.fillText('LIVE', fx + 11, r.y + 25);
  const s = g.clock | 0; ctx.textAlign = 'center'; ctx.font = `12px ${FONT}`; ctx.fillStyle = '#ffe680'; ctx.fillText(`${s / 60 | 0}:${String(s % 60).padStart(2, '0')}`, fx + fw / 2, r.y + 28);
  teScan(r);
  if(TE.hype > .7){ ctx.fillStyle = `rgba(255,255,255,${(TE.hype - .7) * .6})`; ctx.fillRect(r.x, r.y, r.w, r.h); }
  ctx.textAlign = 'left';
}
const teImgs = {};
function teTrainerImg(side){
  if(side === 'e') return g.o.portrait || g.o.leader ? leaderImg(g.o.leader || 'torre_rival', g.o.portrait) : null;
  const gg = typeof skinOf === 'function' ? skinOf() : 'm', url = typeof invSkin === 'function' && invSkin(gg) ? invUrl(gg.slice(2)) : 'assets/avatares/' + (VS_SKINS[gg] || VS_SKINS.m);
  if(!teImgs[url]){ const im = new Image(); im.onload = () => im.ok = true; im.src = url; teImgs[url] = im; }
  return teImgs[url];
}
function teSide(r){                                                        // pantallas de los lados: arriba el entrenador, abajo su equipo
  const col = r.s === 'p' ? '#3ea6ff' : '#e8493a', list = r.s === 'p' ? myList() : (g.me === 'e' ? g.p : g.e), im = teTrainerImg(r.s), A = r.a, Bq = r.b;
  ctx.fillStyle = '#0a1226'; ctx.fillRect(A.x, A.y, A.w, A.h); ctx.fillRect(Bq.x, Bq.y, Bq.w, Bq.h);
  if(im && im.ok){ const k = Math.min((A.w - 8) / im.width, (A.h - 8) / im.height); ctx.drawImage(im, A.x + A.w / 2 - im.width * k / 2, A.y + A.h / 2 - im.height * k / 2, im.width * k, im.height * k); }
  ctx.fillStyle = col; ctx.fillRect(A.x, A.y + A.h - 3, A.w, 3);
  const n = (list || []).length, rr = Math.min(Bq.h * .28, Bq.w / (n * 2.4 || 1));
  (list || []).forEach((f, i) => { const bx = Bq.x + Bq.w * (i + .5) / n, by = Bq.y + Bq.h / 2, dead = f.dead;
    ctx.fillStyle = dead ? '#3a3f4f' : '#e8493a'; ctx.beginPath(); ctx.arc(bx, by, rr, Math.PI, 0); ctx.fill(); ctx.fillStyle = dead ? '#5a5f6f' : '#eeeeee'; ctx.beginPath(); ctx.arc(bx, by, rr, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#111'; ctx.fillRect(bx - rr, by - 1.5, rr * 2, 3); ctx.beginPath(); ctx.arc(bx, by, rr * .35, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx, by, rr * .2, 0, 7); ctx.fill(); });
  teScan(A); teScan(Bq);
}
function teTrainerOf(ids){                                                  // el muñeco pequeño del combate (assets/entrenadores_mini/todos.png)
  for(const id0 of ids){
    if(!id0) continue; const id = String(id0).replace(/^torre_/, '').replace(/^inv_/, '').replace(/^i:/, '');
    if(typeof MINI !== 'undefined' && MINI.ok){ let i = miniIdx(id); if(i < 0 && typeof INV_TEAM_KEY !== 'undefined'){ const en = Object.keys(INV_TEAM_KEY).find(k => INV_TEAM_KEY[k] === id); if(en) i = miniIdx(en); } if(i >= 0) return {i}; }   // los líderes van en español (pegaso) y en la imagen en inglés (falkner)
  }
  return null;
}
function teTrainers(t){                                                    // tú y el rival de pie en sus plataformas
  const sk = typeof skinOf === 'function' ? skinOf() : save.gender;
  const me = teTrainerOf([sk, save.gender === 'f' ? 'f' : 'm']);
  const foe = teTrainerOf([g.o.foeSkin, g.o.leader, g.o.rival, (g.o.portrait || '').split('/').pop().replace(/\.\w+$/, ''), g.o.leaderName && g.o.leaderName.toLowerCase()]);
  const s = 2.2, P0 = teR2W([...TE_EST.plat[0], 0, 0]), P1 = teR2W([...TE_EST.plat[1], 0, 0]), y = P0.y + 8;
  const sw = g.pvp && g.me === 'e';                                          // online siendo el invitado: tus Pokémon salen a la derecha, y tu entrenador también
  [[sw ? foe : me, P0.x, true], [sw ? me : foe, P1.x, false]].forEach(([T, x, right]) => {
    if(!T) return; const bob = Math.sin(t * 2.4 + (right ? 0 : 1.7)) > .6 ? -2 : 0;
    ctx.save(); ctx.translate(x, y + bob); ctx.imageSmoothingEnabled = false;
    if(right) ctx.scale(-1, 1); ctx.drawImage(MINI.img, (T.i % MINI.cols) * 32, Math.floor(T.i / MINI.cols) * 32, 32, 32, -16 * s, -30 * s, 32 * s, 32 * s);
    ctx.restore();
  });
}
function teArrow(){                                                        // flecha en el borde hacia el rival cuando no se ve
  const O = teFoe(); if(!O || O.dead || g.count > 0) return;
  const SW = teSW(), [sx, sy] = teW2S(O.x, O.y - 30);
  if(sx > 0 && sx < SW && sy > 0 && sy < H) return;
  const a = Math.atan2(sy - H / 2, sx - SW / 2), ax = Math.max(30, Math.min(SW - 30, sx)), ay = Math.max(110, Math.min(H - 120, sy)), p = .7 + .3 * Math.sin(performance.now() / 150);
  ctx.save(); ctx.translate(ax, ay); ctx.rotate(a); ctx.globalAlpha = p; ctx.fillStyle = '#ff4a5a'; ctx.strokeStyle = '#05070c'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-10, -12); ctx.lineTo(-5, 0); ctx.lineTo(-10, 12); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}

// ---------------------------------------------------------------------
// ENGANCHES con el modo estadio (pruebas.js) y render.js. Fuera de la Torre, todo sigue como antes.
// ---------------------------------------------------------------------
{ const o = prBack; prBack = function(){ if(!teOn()) return o.apply(this, arguments); ctx.fillStyle = '#05070c'; ctx.fillRect(0, 0, PR.SW, H); }; }
{ const o = prCam; prCam = function(){ if(!teOn()) return o.apply(this, arguments);
    teCamStep(); teWatch(); const c = TE.cam; ctx.translate(PR.SW / 2, H / 2); ctx.scale(c.z, c.z); ctx.translate(-c.x, -c.y); teDraw(); }; }
{ const o = prW2S; prW2S = function(x, y){ return teOn() ? teW2S(x, y) : o.apply(this, arguments); }; }
{ const o = mouseWorld; mouseWorld = function(){ return teOn() ? teS2W(mouse.x, mouse.y) : o.apply(this, arguments); }; }
{ const o = prClamp; prClamp = function(f){ if(!teOn()) return o.apply(this, arguments);
    f.x = Math.max(40, Math.min(TE.W - 40, f.x)); f.y = Math.max(30, Math.min(TE.H - 16, f.y)); }; }
{ const o = prBarAlpha; prBarAlpha = function(){ if(!teOn()) return o.apply(this, arguments);
    const SW = PR.SW, behind = [g.p[g.pi], g.e[g.ei]].some(f => { if(!f || f.dead) return false; const [sx, sy] = teW2S(f.x, f.y); return sy > H - 150 && Math.abs(sx - SW / 2) < 330; });
    PR.barA = (PR.barA || 1) + ((behind ? .35 : 1) - (PR.barA || 1)) * .15; return PR.barA; }; }
{ const o = prFront; prFront = function(){ o.apply(this, arguments); if(teOn()) teArrow(); }; }
{ const o = terrClip; terrClip = function(){ if(!teOn()) return o.apply(this, arguments); ctx.beginPath(); ctx.rect(0, 0, TE.W, TE.H); ctx.clip(); }; }
function teStart(){                                                          // deja el estadio listo para un combate nuevo (Torre, pruebas y Clasificatoria)
  TE.hp = new Map(); TE.hype = 0; if(TE.dec) TE.dec.getContext('2d').clearRect(0, 0, TE.W, TE.H);
  g.p.forEach(f => { f.x = 230; f.y = TE.H / 2 + 10; }); g.e.forEach(f => { f.x = TE.W - 230; f.y = TE.H / 2 + 10; });   // delante de su entrenador
  TE.cam.x = TE.W / 2; TE.cam.y = TE.H / 2 - 30; TE.cam.z = teFitZ(); TE.cam.t = 0;                                     // empieza ya en el plano del campo (sin barrido)
}
const teWants = o => TE_NEW && !!(o && (o.estTorre || o.pruebas || o.estCampo || o.estRegion));
{ const o = startBattle; startBattle = function(o2){                       // combates en el estadio grande (también al reintentar): estadio que toca, ancho del mundo y posiciones de salida
    if(!teWants(o2)) return o.apply(this, arguments);
    teUse(teCfgFor(o2)); LOCKW = TE.W; resize();
    const r = o.apply(this, arguments); teStart(); return r;
  }; }
{ const o = prGo; prGo = function(o2){
    if(!teWants(o2)) return o.apply(this, arguments);
    startBattle(o2);
  }; }

// ---------------------------------------------------------------------
// HUD FINO (como el del vídeo): barras estrechas arriba que casi no tapan el estadio. TE.hud = false vuelve al HUD de siempre.
//   [cara] NOMBRE  TIPO TIPO           ← tarjeta oscura con el borde cortado en diagonal
//          ████████████ PS 98/155
//          ▔▔▔▔▔▔ energía
//   ● ● ● (tu equipo: círculos pequeños; se pulsan para cambiar, como antes)
// ---------------------------------------------------------------------
TE.hud = true;
TE.hudAll = true;                                                          // [AJUSTE] true = este HUD (vida + equipo) en TODOS los combates · false = solo en la Torre
const teHudOn = () => TE.hud && (TE.hudAll || teOn()) && !!g;
const TEH = {w: 300, h: 50, ico: 34, gap: 6, iy: 62};
function teCard(x, y, w, h, col, right){                                  // tarjeta con el lado de dentro cortado en diagonal
  ctx.beginPath();
  if(right){ ctx.moveTo(x + 16, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); }
  else { ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - 16, y + h); ctx.lineTo(x, y + h); }
  ctx.closePath(); ctx.fillStyle = 'rgba(8,11,20,.82)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = col; ctx.fillRect(right ? x + w - 3 : x, y, 3, h);
}
function teHud(x, y, list, idx, col){
  const f = list[idx]; if(!f) return;
  const mine = list === myList(), right = !mine, W0 = TEH.w, X = right ? x + 340 - W0 : x, r = Math.max(0, f.hp / f.max), t = performance.now() / 1000;
  const hid = !mine && typeof foeHidden === 'function' && foeHidden(); if(!mine) FOE_SEEN.add(f);
  teCard(X, y, W0, TEH.h, f.m.isMega ? hue(t * 140, .85) : col, right);
  // cara (o el dibujo de siempre)
  const px = right ? X + W0 - 48 : X + 6, py = y + 5;
  ctx.fillStyle = '#05070c'; ctx.fillRect(px, py, 40, 40);
  const e = f.caraE = (typeof caraState === 'function' && CARAS_ON) ? caraState(f, list) : 'Normal';
  if(!(typeof caraDraw === 'function' && CARAS_ON && caraDraw(ctx, f, px + 1, py + 1, 38, 38, e))) drawFrame(ctx, f.m.dex, 'Idle', 0, 0, px + 20, py + 22, 1.5, 36, f.shiny);
  ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.strokeRect(px + .5, py + .5, 39, 39);
  if(hasStatus(f)) statusChips(f, px, py + 30, 20, 9, 5);
  // nombre y tipos
  const tx = right ? X + W0 - 56 : X + 54, al = right ? 'right' : 'left';
  text(f.m.name.toUpperCase(), tx, y + 15, f.m.name.length > 10 ? 7 : 8, '#ffffff', al);
  ctx.font = `8px ${FONT}`; const nw = ctx.measureText(f.m.name.toUpperCase()).width;
  let cx = right ? tx - nw - 8 : tx + nw + 8;
  f.m.types.forEach(tp => { const lab = (TYPE_ES[tp] || tp).toUpperCase(); ctx.font = `5px ${FONT}`; const w = ctx.measureText(lab).width + 8;
    const bx = right ? cx - w : cx; ctx.fillStyle = TC[tp]; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, y + 7, w, 9, 4) : ctx.rect(bx, y + 7, w, 9); ctx.fill();
    text(lab, bx + w / 2, y + 14, 5, '#10141e', 'center'); cx = right ? bx - 4 : bx + w + 4; });
  // vida y energía
  const bw = W0 - 70 - 14, bx = right ? X + 18 : X + 54, by = y + 22;
  ctx.fillStyle = '#05070c'; ctx.fillRect(bx, by, bw, 10);
  const hc = r > .5 ? '#4ccf6a' : r > .2 ? '#e8c33a' : '#e8493a';
  ctx.fillStyle = hc; right ? ctx.fillRect(bx + bw * (1 - r), by, bw * r, 10) : ctx.fillRect(bx, by, bw * r, 10);
  ctx.fillStyle = 'rgba(255,255,255,.18)'; right ? ctx.fillRect(bx + bw * (1 - r), by, bw * r, 3) : ctx.fillRect(bx, by, bw * r, 3);
  text(`${Math.ceil(f.hp)}/${Math.ceil(f.max)}`, right ? bx + 4 : bx + bw - 4, by + 8, 6, '#ffffff', right ? 'left' : 'right');
  if(r <= .2 && !f.dead) text('POCA VIDA', right ? bx + bw - 4 : bx + 4, by + 8, 5, '#ffffff', right ? 'right' : 'left');
  ctx.fillStyle = '#05070c'; ctx.fillRect(bx, by + 13, bw, 4); ctx.fillStyle = '#4fb3ff'; right ? ctx.fillRect(bx + bw * (1 - f.en / 100), by + 13, bw * f.en / 100, 4) : ctx.fillRect(bx, by + 13, bw * f.en / 100, 4);
  text('ENERGÍA', right ? bx + bw : bx, by + 25, 4, '#7fa8d8', right ? 'right' : 'left');
  // equipo: círculos pequeños (los tuyos se pulsan para cambiar de Pokémon)
  list.forEach((u, i) => {
    const R = teIcoRect(i, right, x), cx2 = R.x + R.w / 2, cy2 = R.y + R.h / 2;
    ctx.fillStyle = 'rgba(8,11,20,.85)'; ctx.beginPath(); ctx.arc(cx2, cy2, R.w / 2, 0, 7); ctx.fill();
    ctx.strokeStyle = i === idx ? '#ffcc33' : 'rgba(255,255,255,.3)'; ctx.lineWidth = i === idx ? 2 : 1; ctx.beginPath(); ctx.arc(cx2, cy2, R.w / 2 - .5, 0, 7); ctx.stroke();
    if(hid && !FOE_SEEN.has(u)){ text('?', cx2, cy2 + 4, 8, '#8a94b0', 'center'); return; }
    ctx.save(); ctx.beginPath(); ctx.arc(cx2, cy2, R.w / 2 - 2, 0, 7); ctx.clip(); ctx.globalAlpha = u.dead ? .35 : 1;
    if(!(typeof caraDraw === 'function' && CARAS_ON && caraDraw(ctx, u, R.x + 2, R.y + 2, R.w - 4, R.h - 4, u.dead ? 'Pain' : (u.caraE || 'Normal')))) drawFrame(ctx, u.m.dex, 'Idle', 0, 0, cx2, cy2 + 2, 1, R.w - 6, u.shiny);
    ctx.restore();
    if(u.dead){ ctx.strokeStyle = '#e8493a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx2 - 7, cy2 - 7); ctx.lineTo(cx2 + 7, cy2 + 7); ctx.moveTo(cx2 + 7, cy2 - 7); ctx.lineTo(cx2 - 7, cy2 + 7); ctx.stroke(); }
    else { ctx.fillStyle = '#05070c'; ctx.fillRect(R.x + 3, R.y + R.h + 1, R.w - 6, 3); ctx.fillStyle = '#4ccf6a'; ctx.fillRect(R.x + 3, R.y + R.h + 1, (R.w - 6) * u.hp / u.max, 3); }
    if(!right){ const can = !u.dead && i !== idx, wait = can && myCd() > 0;
      if(wait){ ctx.fillStyle = 'rgba(5,7,12,.6)'; ctx.beginPath(); ctx.arc(cx2, cy2, R.w / 2 - 1, 0, 7); ctx.fill(); text(String(Math.ceil(myCd())), cx2, cy2 + 4, 9, '#ffcc33', 'center'); }
      text(ctlShort('sw' + (i + 1)).slice(0, 1), R.x, R.y + 6, 5, can ? '#c9d6f5' : 'rgba(201,214,245,.4)'); }
    teMegaM(u, R, i, list);
  });
  teExtras(f, list, x, right);
}
function teIcoRect(i, right, x){                                          // dónde va el círculo i del equipo (en coordenadas del HUD, antes de HUD_SCALE)
  const s = TEH.ico, st = s + TEH.gap; return right ? {x: x + 340 - s - 8 - i * st, y: 10 + TEH.iy, w: s, h: s} : {x: 18 + i * st, y: 10 + TEH.iy, w: s, h: s};
}
function teCenter(s){                                                     // marcador del centro: solo el reloj y el piso
  hudAt(W / 2, 0, () => {
    const w = 110, x = W / 2 - w / 2;
    ctx.fillStyle = 'rgba(8,11,20,.82)'; ctx.beginPath(); ctx.moveTo(x - 10, 6); ctx.lineTo(x + w + 10, 6); ctx.lineTo(x + w, 40); ctx.lineTo(x, 40); ctx.closePath(); ctx.fill();
    text(`${(s / 60 | 0)}:${String(s % 60).padStart(2, '0')}`, W / 2, 30, 14, '#ffffff', 'center');
    text(teTitle(), W / 2, 52, 6, '#c9d6f5', 'center');
  });
}
{ const o = hud; hud = function(x, y, list, idx, col){ if(teHudOn()) return teHud(x, y, list, idx, col); return o.apply(this, arguments); }; }
{ const o = hudIconRect; hudIconRect = function(i){ if(!teHudOn()) return o.apply(this, arguments); const k = HUD_SCALE, R = teIcoRect(i, false, 10); return {x: R.x * k, y: R.y * k, w: R.w * k, h: R.h * k}; }; }

// ---- HUD con las piezas dibujadas (assets/iconos/hud/: panel, reloj, aro y etiqueta). Si no cargan, se usa el HUD fino de arriba ----
const TE_HUDI = {}; ['panel', 'timer', 'ring', 'tag'].forEach(k => { const im = new Image(); im.onload = () => im.ok = true; im.src = 'assets/iconos/hud/' + k + '.png?v=1'; TE_HUDI[k] = im; });
const teHudOk = () => ['panel', 'timer', 'ring'].every(k => TE_HUDI[k].ok);
const TE_SLOT = {por: [.0597, .149, .2489, .840], hp: [.2865, .202, .899, .493], en: [.290, .681, .821, .819]};   // huecos del panel (fracciones de su ancho y alto)
function teHudImg(x, y, list, idx, col){
  const f = list[idx]; if(!f) return;
  const mine = list === myList(), right = !mine, W0 = 300, PH = W0 * TE_HUDI.panel.height / TE_HUDI.panel.width, X = right ? x + 340 - W0 : x, r = Math.max(0, f.hp / f.max);
  const hid = !mine && typeof foeHidden === 'function' && foeHidden(); if(!mine) FOE_SEEN.add(f);
  ctx.save(); ctx.imageSmoothingEnabled = true; if(right){ ctx.translate(X + W0, y); ctx.scale(-1, 1); ctx.drawImage(TE_HUDI.panel, 0, 0, W0, PH); } else ctx.drawImage(TE_HUDI.panel, X, y, W0, PH); ctx.restore();
  if(right){ ctx.fillStyle = '#ff4a5a'; ctx.fillRect(X + W0 - W0 * .029, y + PH * .07, W0 * .02, PH * .86); ctx.fillStyle = '#ffffff55'; ctx.fillRect(X + W0 - W0 * .029, y + PH * .07, W0 * .006, PH * .86); }       // el rival: acento rojo (la pieza lo trae azul)
  const sl = q => ({x: right ? X + W0 - q[2] * W0 : X + q[0] * W0, y: y + q[1] * PH, w: (q[2] - q[0]) * W0, h: (q[3] - q[1]) * PH});
  // retrato
  const P = sl(TE_SLOT.por), e = f.caraE = (typeof caraState === 'function' && CARAS_ON) ? caraState(f, list) : 'Normal';
  if(!(typeof caraDraw === 'function' && CARAS_ON && caraDraw(ctx, f, P.x + 1, P.y + 1, P.w - 2, P.h - 2, e))) drawFrame(ctx, f.m.dex, 'Idle', 0, 0, P.x + P.w / 2, P.y + P.h / 2 + 3, 1.5, P.h - 6, f.shiny);
  if(f.m.isMega){ ctx.strokeStyle = hue(performance.now() / 1000 * 140, .85); ctx.lineWidth = 2; ctx.strokeRect(P.x, P.y, P.w, P.h); }
  if(hasStatus(f)) statusChips(f, P.x, P.y + P.h - 10, Math.min(24, P.w / 2), 9, 5);
  // hueco grande: nombre y tipos arriba, vida abajo
  const Hs = sl(TE_SLOT.hp), al = right ? 'right' : 'left', nx = right ? Hs.x + Hs.w - 4 : Hs.x + 4;
  text(f.m.name.toUpperCase(), nx, Hs.y + 9, f.m.name.length > 10 ? 6 : 7, '#ffffff', al);
  ctx.font = `${f.m.name.length > 10 ? 6 : 7}px ${FONT}`; let cx = right ? nx - ctx.measureText(f.m.name.toUpperCase()).width - 5 : nx + ctx.measureText(f.m.name.toUpperCase()).width + 5;
  f.m.types.forEach(tp => { const lab = (TYPE_ES[tp] || tp).toUpperCase(); ctx.font = `4px ${FONT}`; const w = ctx.measureText(lab).width + 6, bx = right ? cx - w : cx;
    ctx.fillStyle = TC[tp]; ctx.fillRect(bx, Hs.y + 2, w, 8); text(lab, bx + w / 2, Hs.y + 8, 4, '#10141e', 'center'); cx = right ? bx - 3 : bx + w + 3; });
  text(`${Math.ceil(f.hp)}/${Math.ceil(f.max)}`, right ? Hs.x + 4 : Hs.x + Hs.w - 4, Hs.y + 9, 5, '#c9d6f5', right ? 'left' : 'right');
  const by = Hs.y + Hs.h * .55, bh = Hs.h * .38, bw = Hs.w - 6, bx = Hs.x + 3, hc = r > .5 ? '#4ccf6a' : r > .2 ? '#e8c33a' : '#e8493a';
  ctx.fillStyle = '#05070c'; ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = hc; right ? ctx.fillRect(bx + bw * (1 - r), by, bw * r, bh) : ctx.fillRect(bx, by, bw * r, bh);
  ctx.fillStyle = 'rgba(255,255,255,.2)'; right ? ctx.fillRect(bx + bw * (1 - r), by, bw * r, bh * .35) : ctx.fillRect(bx, by, bw * r, bh * .35);
  // hueco pequeño: energía
  const En = sl(TE_SLOT.en), ew = (En.w - 4) * f.en / 100;
  ctx.fillStyle = '#4fb3ff'; right ? ctx.fillRect(En.x + 2 + (En.w - 4) - ew, En.y + 2, ew, En.h - 4) : ctx.fillRect(En.x + 2, En.y + 2, ew, En.h - 4);
  // equipo: aros dibujados con el Pokémon dentro
  list.forEach((u, i) => {
    const R = teIcoRect(i, right, x), cx2 = R.x + R.w / 2, cy2 = R.y + R.h / 2;
    ctx.drawImage(TE_HUDI.ring, R.x, R.y, R.w, R.h);
    ctx.save(); ctx.beginPath(); ctx.arc(cx2, cy2, R.w * .4, 0, 7); ctx.clip();
    if(!(hid && !FOE_SEEN.has(u))){ ctx.globalAlpha = u.dead ? .35 : 1;
      if(!(typeof caraDraw === 'function' && CARAS_ON && caraDraw(ctx, u, R.x + 3, R.y + 3, R.w - 6, R.h - 6, u.dead ? 'Pain' : (u.caraE || 'Normal')))) drawFrame(ctx, u.m.dex, 'Idle', 0, 0, cx2, cy2 + 2, 1, R.w - 8, u.shiny); }
    ctx.restore();
    if(i === idx){ ctx.strokeStyle = '#ffcc33'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx2, cy2, R.w * .47, 0, 7); ctx.stroke(); }
    if(hid && !FOE_SEEN.has(u)) text('?', cx2, cy2 + 4, 8, '#8a94b0', 'center');
    else if(u.dead){ ctx.strokeStyle = '#e8493a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx2 - 7, cy2 - 7); ctx.lineTo(cx2 + 7, cy2 + 7); ctx.moveTo(cx2 + 7, cy2 - 7); ctx.lineTo(cx2 - 7, cy2 + 7); ctx.stroke(); }
    else { ctx.fillStyle = '#05070c'; ctx.fillRect(R.x + 4, R.y + R.h + 1, R.w - 8, 3); ctx.fillStyle = '#4ccf6a'; ctx.fillRect(R.x + 4, R.y + R.h + 1, (R.w - 8) * u.hp / u.max, 3); }
    if(!right){ const can = !u.dead && i !== idx, wait = can && myCd() > 0;
      if(wait){ ctx.fillStyle = 'rgba(5,7,12,.6)'; ctx.beginPath(); ctx.arc(cx2, cy2, R.w * .4, 0, 7); ctx.fill(); text(String(Math.ceil(myCd())), cx2, cy2 + 4, 9, '#ffcc33', 'center'); }
      text(ctlShort('sw' + (i + 1)).slice(0, 1), R.x - 2, R.y + 6, 5, can ? '#c9d6f5' : 'rgba(201,214,245,.4)'); }
    teMegaM(u, R, i, list);
  });
  teExtras(f, list, x, right);
}
function teMegaM(u, R, i, list){                                          // «M» de megaevolución en su aro: arcoíris = lista · rosa = ya megaevolucionó · gris = otra mega ya usada
  const ready = u.megaKey && !u.megaDone && !u.dead, done = u.m.isMega; if(!(ready || done)) return;
  const blocked = ready && typeof megaUsed === 'function' && megaUsed(list === g.p ? 'p' : 'e'), mx = R.x + R.w - 11, my = R.y - 2;
  ctx.fillStyle = done ? '#ff6ad8' : blocked ? '#3a4258' : hue(performance.now() / 1000 * 200 + i * 60, .95); ctx.fillRect(mx, my, 11, 10); text('M', mx + 2, my + 8, 6, blocked ? '#7a86a6' : '#10141e');
}
function teExtras(f, list, x, right){                                     // objeto y habilidad (debajo de los aros) y el aviso de cambio
  const R0 = teIcoRect(0, right, x); let ty = R0.y + R0.h + 14, tx = right ? x + 340 - 8 : 18;
  const parts = []; if(f.item && typeof ITEMS !== 'undefined' && ITEMS[f.item]) parts.push(ITEMS[f.item].n.toUpperCase()); if(f.ab) parts.push(f.ab.toUpperCase());
  const im = f.item && typeof itemImg === 'function' && itemImg(f.item);
  if(im && im.ok){ ctx.imageSmoothingEnabled = false; ctx.drawImage(im, right ? tx - 12 : tx, ty - 9, 12, 12); tx += right ? -15 : 15; }
  if(parts.length) text(parts.join(' · '), tx, ty, 5, '#c9d6f5', right ? 'right' : 'left');
  if(list === myList()){ const hv = hudIconAt(mouse.x, mouse.y);
    if(g.swNote > 0) text(`ESPERA ${Math.ceil(myCd())} s PARA CAMBIAR`, 18, ty + 11, 6, '#ff9a3a');
    else if(hv >= 0 && hv !== myIdx() && !list[hv].dead) text(myCd() > 0 ? `ESPERA ${Math.ceil(myCd())} s` : `CAMBIAR A ${list[hv].m.name.toUpperCase()}`, 18, ty + 11, 6, '#7dffa0'); }
}
{ const o = teHud; teHud = function(){ if(teHudOk()){ TEH.iy = 300 * TE_HUDI.panel.height / TE_HUDI.panel.width + 6; return teHudImg.apply(this, arguments); } TEH.iy = 62; return o.apply(this, arguments); }; }
{ const o = teCenter; teCenter = function(s){ if(!teHudOk()) return o.apply(this, arguments);
    hudAt(W / 2, 0, () => { const w = 150, h = w * TE_HUDI.timer.height / TE_HUDI.timer.width, x = W / 2 - w / 2;
      ctx.imageSmoothingEnabled = true; ctx.drawImage(TE_HUDI.timer, x, 4, w, h);
      text(`${(s / 60 | 0)}:${String(s % 60).padStart(2, '0')}`, W / 2, 4 + h * .55, 13, '#ffffff', 'center');
      text(teTitle(), W / 2, 4 + h + 10, 6, '#c9d6f5', 'center'); }); }; }
