"use strict";
/* =====================================================================
   17c) ARENAS DE HOENN: un fondo pixel art por cada líder, miembro del Alto Mando y Campeón de Hoenn (13 en total).
   Inspiradas en los gimnasios y en la Liga de Ever Grande de Rubí/Zafiro/Esmeralda, dibujadas con código (sin imágenes), igual que las de Kanto y Johto.
   Se carga DESPUÉS de arenasjohto.js: usa sus ayudantes (arTiles, arBricks, arSpeck, arCrack, arOcclude, arFlame, arColumn, arRocks, arCloud, arDragonHead...)
   y añade sus arenas a ARENAS. El id de cada arena es el id del combate (petra, marcial, erico, candela, norman, alana, vitoleti, galano,
   sixto, fatima, nivea, dracon, plubio). Cómo funciona build() / anim(): ver la cabecera de arenas.js.
   REGLA: el centro del suelo (donde pelean los dos Pokémon) se deja LIMPIO; la decoración va en la pared, en los lados y en los bordes.
   ===================================================================== */

// ---- Ayudantes nuevos ----
function arGlow(c, x, y, r, col, a){                                    // resplandor cuadrado por capas (c = contexto de dibujo)
  c.fillStyle = col;
  for(let k = 4; k >= 1; k--){ const rr = r * k / 4; c.globalAlpha = a * .22; c.fillRect(Math.floor(x - rr), Math.floor(y - rr), Math.ceil(rr * 2), Math.ceil(rr * 2)); }
  c.globalAlpha = 1;
}
function arStars(P, x, y, w, h, n, cols){ for(let i = 0; i < n; i++){ const s = P.r() < .12 ? 2 : 1; P.rect(cols[(P.r() * cols.length) | 0], x + P.r() * w, y + P.r() * h, s, s); } }
function arHang(P, x, y0, y1, col){ P.rect(col, x, y0, 1, y1 - y0); }                      // cadena o cuerda colgando
function arCone(P, x, y0, topW, botW, y1, col, a){                                          // haz de luz trapezoidal
  for(let y = y0; y < y1; y++){ const k = (y - y0) / (y1 - y0), ww = topW + (botW - topW) * k; P.alpha(col, a * (1 - k * .55), x - ww / 2, y, ww, 1); }
}
function arScales(P, x0, y0, w, h, sw, sh, base, edge){                                      // escamas (arcos que se solapan)
  P.rect(arDrk(base, .35), x0, y0, w, h);
  for(let row = 0; row * sh < h + sh; row++) for(let x = x0 - ((row & 1) ? sw / 2 : 0); x < x0 + w; x += sw){
    const y = y0 + row * sh; if(y >= y0 + h) continue;
    const col = arMix(base, P.r() < .5 ? '#000000' : '#ffffff', P.r() * .12), bw = Math.min(sw - 1, x0 + w - x), bx = Math.max(x, x0), bww = Math.min(bw, x + sw - 1 - bx), bh = Math.min(sh, y0 + h - y);
    if(bww < 1 || bh < 1) continue;
    P.rect(col, bx, y, bww, bh - 1); P.alpha(edge, .35, bx, y, bww, 1); P.alpha('#000000', .3, bx, y + bh - 2, bww, 1); P.alpha(edge, .18, bx + 1, y + 1, Math.max(1, bww - 2), 1);
  }
}

Object.assign(ARENAS, {

  // ---- Petra (Roxanne) · Gimnasio de Ciudad Férrica: cueva-taller de roca, suelo de tierra, lámparas colgantes y peñascos ----
  petra: {dark: .16, side:{base:'#5b4736', mortar:'#241a12'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 18, 14, (x, y) => ['#9a7a54', '#8f7050', '#a3835c', '#87694a'][(x * 7 + y * 3) % 4], '#5e4630', .08);
      arSpeck(P, 0, WH, w, h - WH, 520, ['#b8966a', '#6e5338', '#a58660', '#c9a878']);
      for(let i = 0; i < 9; i++) arCrack(P, P.r() * w, WH + 6 + P.r() * (h - WH - 12), 8 + P.r() * 14, '#4e3a26', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .4);       // grietas del suelo
      P.rect('#3a2c22', 0, 0, w, WH);                                                                            // pared de roca estratificada
      for(let y = 0; y < WH; y += 6){ P.rect(['#4a392c', '#3f3025', '#54422f'][(y / 6 | 0) % 3], 0, y, w, 5); P.alpha('#000000', .3, 0, y + 5, w, 1); }
      for(let i = 0; i < w / 2; i++){ const x = P.r() * w, y = P.r() * WH, s = 2 + (P.r() * 5 | 0); P.rect(['#5d4836', '#35281e', '#675039', '#2c2018'][(P.r() * 4) | 0], x, y, s, 1 + (s >> 1)); }
      for(let i = 0; i < 14; i++){ const x = P.r() * w, y = 4 + P.r() * (WH - 12); P.px('#7fd0e8', x, y); P.px('#bdeaf5', x + 1, y); P.px('#4aa0c0', x, y + 1); }            // vetas de cristal azul
      for(let x = 3; x < w; x += 10 + (x * 7 % 9)){ const len = 4 + (x * 11 % 9); for(let k = 0; k < len; k++) P.rect('#2a1f17', x + Math.floor(k / 4) * .5, k, Math.max(1, 3 - Math.floor(k / 3)), 1); }   // estalactitas
      const cx = Math.round(w / 2);                                                                              // emblema de piedra tallado en el fondo
      P.rect('#2a1f17', cx - 15, 8, 30, 24); P.rect('#6f5a44', cx - 14, 9, 28, 22); P.rect('#85705a', cx - 12, 11, 24, 18);
      P.rect('#3c2f24', cx - 1, 11, 2, 18); P.rect('#3c2f24', cx - 12, 19, 24, 2); P.rect('#3c2f24', cx - 5, 15, 10, 10); P.rect('#85705a', cx - 3, 17, 6, 6);
      P.rect('#2f241b', 0, WH - 5, w, 5); P.rect('#6f5a44', 0, WH - 5, w, 1);                                      // zócalo
      arRocks(P, 4, h - 6, 4, '#7a6650'); arRocks(P, w - 30, h - 6, 4, '#7a6650'); arRocks(P, 8, WH + 22, 3, '#6f5a44'); arRocks(P, w - 26, WH + 22, 3, '#6f5a44');   // peñascos en las esquinas
      const lamps = [0.2, 0.38, 0.62, 0.8].map(k => Math.round(w * k));
      lamps.forEach(x => { arHang(P, x, 0, 14, '#1a1410'); P.rect('#1a1410', x - 3, 14, 7, 2); P.rect('#d8962e', x - 2, 16, 5, 6); P.rect('#ffd36a', x - 1, 17, 3, 4); P.rect('#1a1410', x - 3, 22, 7, 1); });
      arOcclude(P, w, WH); return {lamps};
    },
    anim(c, t, d, w){
      d.lamps.forEach((x, i) => arGlow(c, x, 19, 11 + Math.sin(t * 7 + i * 2) * 1.5, '#ffb84a', .55));
      c.fillStyle = '#d8c09a'; for(let i = 0; i < 26; i++){ const x = (i * 41 + Math.sin(t * .7 + i) * 8) % w, y = ((i * 29 + t * (4 + i % 4)) % (AR_H - 30)) + 20; c.globalAlpha = .35; c.fillRect(Math.floor(x), Math.floor(y), 1, 1); }   // polvo en el aire
      c.globalAlpha = 1; }},

  // ---- Marcial (Brawly) · Gimnasio de Pueblo Azuliza: sala oscura de surfista con ring, tablas de surf y focos ----
  marcial: {dark: .3,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 44, 11, (x, y) => ['#2c3346', '#283042', '#313a50'][(x * 3 + y) % 3], '#10141f', .1);                  // lona del ring
      arSpeck(P, 0, WH, w, h - WH, 260, ['#3a4560', '#1c2233']);
      P.rect('#141826', 0, 0, w, WH);                                                                            // pared oscura
      for(let x = 0; x < w; x += 14) P.alpha('#000000', .35, x, 0, 1, WH);
      for(let i = 0; i < w / 40; i++){ const x = 14 + i * 40 + (i * 13 % 7), c1 = ['#e8553a', '#2fa8d8', '#f0c43a', '#3ac18a'][i % 4];                // tablas de surf apoyadas
        P.rect('#0a0c14', x - 1, 6, 9, WH - 6); P.rect(c1, x, 7, 7, WH - 8); P.rect(arLit(c1, .35), x + 2, 8, 2, WH - 12); P.rect('#ffffff', x + 3, 10, 1, WH - 14); P.rect(arDrk(c1, .4), x, WH - 5, 7, 2); }
      [Math.round(w * .3), Math.round(w * .7)].forEach(x => { arHang(P, x, 0, 12, '#555a6a'); P.rect('#8a4a2a', x - 4, 12, 9, 15); P.rect('#b8683a', x - 3, 12, 6, 15); P.rect('#d89060', x - 2, 13, 2, 13); P.rect('#555a6a', x - 4, 12, 9, 1); });   // sacos de boxeo
      P.rect('#0c0f18', 0, WH - 4, w, 4);
      const post = (x, side) => { P.rect('#c0392b', x, WH + 2, 4, h - WH - 14); P.rect('#e8604f', x + 1, WH + 2, 1, h - WH - 14); P.rect('#6e1f17', x + 3, WH + 2, 1, h - WH - 14); };
      post(2, 0); post(w - 6, 1);                                                                                // postes del ring
      [WH + 6, h - 14].forEach(y => { P.rect('#f3f3f3', 6, y, w - 12, 1); P.rect('#c0392b', 6, y + 2, w - 12, 1); P.rect('#2c5fb8', 6, y + 4, w - 12, 1); P.alpha('#000000', .3, 6, y + 5, w - 12, 2); });   // cuerdas
      arOcclude(P, w, WH); return {lights: [Math.round(w * .18), Math.round(w * .5), Math.round(w * .82)]};
    },
    anim(c, t, d, w){
      d.lights.forEach((x, i) => { const a = .18 + .06 * Math.sin(t * 1.3 + i * 2); const sw = Math.sin(t * .6 + i * 1.7) * 12;
        for(let y = 0; y < AR_H - 20; y += 2){ const k = y / (AR_H - 20); c.globalAlpha = a * (1 - k * .6); c.fillStyle = '#fff4c0'; const ww = 10 + k * 70; c.fillRect(Math.floor(x + sw * k - ww / 2), y, Math.ceil(ww), 2); } });          // focos que se balancean
      c.globalAlpha = 1; }},

  // ---- Erico (Wattson) · Gimnasio de Ciudad Malvalona: acero con franjas de peligro, barreras eléctricas y bobinas Tesla ----
  erico: {dark: .14,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 16, 16, (x, y) => (x + y) & 1 ? '#4a5260' : '#434b58', '#1a1f28', .14);
      arSpeck(P, 0, WH, w, h - WH, 220, ['#5a6472', '#363d49']);
      for(let x = 0; x < w; x += 12){ P.rect('#f2c316', x, WH, 6, 4); P.rect('#1a1a1a', x + 6, WH, 6, 4); P.rect('#f2c316', x, h - 4, 6, 4); P.rect('#1a1a1a', x + 6, h - 4, 6, 4); }      // franjas de peligro
      P.rect('#232a36', 0, 0, w, WH);                                                                            // pared tecnológica
      for(let x = 0; x < w; x += 22){ P.rect('#2f3847', x + 1, 3, 20, WH - 9); P.rect('#171c25', x + 1, 3, 20, 1); P.alpha('#ffffff', .08, x + 1, 4, 20, 1);
        for(let k = 0; k < 4; k++) for(let j = 0; j < 3; j++){ const on = (x * 3 + k * 7 + j * 5) % 5; P.px(on < 2 ? '#3ad6ff' : on < 3 ? '#f2c316' : '#2a3342', x + 4 + k * 4, 8 + j * 5); } }              // paneles de luces
      P.rect('#f2c316', 0, WH - 6, w, 2); P.rect('#1a1a1a', 0, WH - 4, w, 4);
      const coil = (x) => { P.rect('#3a3f4a', x - 3, 6, 7, WH + 10); P.rect('#5c6575', x - 2, 6, 2, WH + 10); for(let y = 10; y < WH + 14; y += 4) P.rect('#b8793a', x - 4, y, 9, 2); P.rect('#6b727f', x - 6, WH + 14, 13, 4); P.rect('#d8e6ff', x - 3, 0, 7, 6); P.rect('#ffffff', x - 2, 1, 3, 3); };
      coil(10); coil(w - 11); coil(Math.round(w * .3)); coil(Math.round(w * .7));                               // bobinas Tesla
      [WH + 12, h - 14].forEach(y => { for(let x = 14; x < w - 14; x += 30) P.rect('#2a313d', x, y - 2, 4, 5); });         // postes de las barreras
      arOcclude(P, w, WH); return {coils: [10, Math.round(w * .3), Math.round(w * .7), w - 11]};
    },
    anim(c, t, d, w){
      const arc = (x1, y1, x2, y2, seed, col) => { c.fillStyle = col; let x = x1, y = y1; const n = Math.max(6, Math.abs(x2 - x1) / 4 | 0);
        for(let i = 0; i < n; i++){ x += (x2 - x1) / n; y = y1 + (y2 - y1) * i / n + Math.sin(seed * 13 + i * 2.1) * 3; c.fillRect(Math.floor(x), Math.floor(y), 2, 1); } };
      const ph = Math.floor(t * 9);
      for(let i = 0; i < d.coils.length - 1; i++) if((ph + i) % 3 !== 0){ c.globalAlpha = .9; arc(d.coils[i], 3, d.coils[i + 1], 3, ph * .7 + i, '#9fe8ff'); c.globalAlpha = .4; arc(d.coils[i], 3, d.coils[i + 1], 3, ph * .7 + i + 5, '#ffffff'); }
      [AR_WALL + 12, AR_H - 14].forEach((y, k) => { for(let x = 16; x < w - 14; x += 30){ const on = (ph + (x >> 4) + k) % 4 !== 0;
        c.globalAlpha = on ? .85 : .2; arc(x + 2, y, x + 30, y, ph + x, '#3ad6ff'); c.globalAlpha = on ? .35 : 0; c.fillStyle = '#3ad6ff'; c.fillRect(x + 2, y - 2, 28, 5); } });     // barreras eléctricas
      c.globalAlpha = 1; }},

  // ---- Candela (Flannery) · Gimnasio de Pueblo Lavacalda: roca volcánica cálida, boca de volcán, aguas termales y vapor ----
  candela: {dark: .1, side:{base:'#6a2a1c', mortar:'#2a0e08'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 20, 16, (x, y) => ['#a8553a', '#9c4b32', '#b25e42', '#92432c'][(x * 5 + y * 3) % 4], '#4e1c12', .08);
      arSpeck(P, 0, WH, w, h - WH, 420, ['#c97a52', '#6e2a1a', '#d89060']);
      for(let i = 0; i < 12; i++) arCrack(P, P.r() * w, WH + 6 + P.r() * (h - WH - 12), 8 + P.r() * 16, '#ff8a2a', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .4);       // grietas incandescentes
      P.rect('#2c120c', 0, 0, w, WH);                                                                            // pared volcánica
      for(let i = 0; i < w / 2; i++){ const x = P.r() * w, y = P.r() * WH, s = 3 + (P.r() * 7 | 0); P.rect(['#3a1a12', '#44211a', '#2a110b', '#522a1e'][(P.r() * 4) | 0], x, y, s, s * .6); }
      const cx = Math.round(w / 2);                                                                              // boca del volcán al fondo
      P.rect('#140806', cx - 28, 4, 56, WH - 6); P.rect('#ff5a1a', cx - 26, 16, 52, WH - 18); P.rect('#ff9a2a', cx - 22, 22, 44, WH - 24); P.rect('#ffd060', cx - 14, 28, 28, WH - 30);
      for(let k = 0; k < 6; k++) P.rect('#140806', cx - 28 + k * 9, 4, 5, 14 - k % 3 * 3);
      for(let x = 4; x < w; x += 11 + (x * 5 % 8)){ const len = 4 + (x * 7 % 9); for(let k = 0; k < len; k++) P.rect('#1c0b07', x + Math.floor(k / 4) * .5, k, Math.max(1, 3 - Math.floor(k / 3)), 1); }
      P.rect('#2a0e08', 0, WH - 4, w, 4); P.rect('#ff7a1a', 0, WH - 4, w, 1);
      [[14, WH + 20], [w - 14, WH + 20], [14, h - 22], [w - 14, h - 22]].forEach(([x, y]) => { P.rect('#3a140c', x - 11, y - 5, 22, 10); P.rect('#7ad0e0', x - 10, y - 4, 20, 8); P.rect('#bdeaf2', x - 8, y - 3, 16, 2); P.alpha('#ffffff', .4, x - 9, y - 4, 18, 1); });   // aguas termales
      [[28, h - 12], [w - 28, h - 12]].forEach(([x, y]) => { P.rect('#e8b070', x - 8, y - 3, 17, 7); P.rect('#ff9a2a', x - 7, y - 2, 15, 5); P.rect('#ffd060', x - 4, y - 1, 9, 3); });        // plataformas de teletransporte
      arOcclude(P, w, WH);
      return {vents: [[Math.round(w * .2), AR_WALL + 10], [Math.round(w * .8), AR_WALL + 10], [Math.round(w * .5), AR_H - 6]], pools: [[14, AR_WALL + 20], [w - 14, AR_WALL + 20], [14, AR_H - 22], [w - 14, AR_H - 22]], cx};
    },
    anim(c, t, d, w){
      arGlow(c, d.cx, 36, 30 + Math.sin(t * 3) * 3, '#ff8a2a', .3);
      c.fillStyle = '#ffffff'; d.pools.forEach(([x, y], k) => { for(let i = 0; i < 5; i++){ const f = ((t * .5 + i * .2 + k * .13) % 1); c.globalAlpha = .55 * (1 - f); c.fillRect(Math.floor(x - 6 + i * 3 + Math.sin(t * 2 + i) * 2), Math.floor(y - 4 - f * 24), 3, 2); } });       // vapor
      d.vents.forEach(([x, y], k) => { for(let i = 0; i < 6; i++){ const f = ((t * .6 + i * .17 + k * .3) % 1); c.globalAlpha = .45 * (1 - f); c.fillRect(Math.floor(x + Math.sin(t * 2 + i * 1.3) * 3), Math.floor(y - f * 26), 3 + (f * 3 | 0), 2); } });
      c.fillStyle = '#ffb43a'; for(let i = 0; i < 16; i++){ const x = (i * 37) % w, y = AR_H - ((t * (7 + i % 4) * 2 + i * 23) % (AR_H - 30)); c.globalAlpha = .7; c.fillRect(Math.floor(x + Math.sin(t + i) * 5), Math.floor(y), 1, 2); }          // chispas
      c.globalAlpha = 1; }},

  // ---- Norman · Gimnasio de Ciudad Petalia: sala luminosa y familiar con puertas de pruebas, parqué y círculo central ----
  norman: {dark: .04, side:{base:'#d8c8a0', mortar:'#8a7a58'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 28, 10, (x, y) => ['#c99a62', '#bd8e58', '#d2a46c', '#b5864f'][((x * 3 + y * 5) + (y & 1 ? 2 : 0)) % 4], '#7a5632', .1);          // parqué
      for(let y = WH + 4; y < h; y += 20) P.alpha('#ffffff', .07, 0, y, w, 1);
      P.rect('#ece2c8', 0, 0, w, WH);                                                                            // pared crema
      for(let x = 0; x < w; x += 8) P.alpha('#a89870', .18, x, 0, 1, WH - 8);
      P.rect('#3e8a52', 0, WH - 10, w, 8); P.rect('#5cb070', 0, WH - 10, w, 1); P.rect('#2a6a3a', 0, WH - 3, w, 1);                // friso verde
      const cols = ['#e04a4a', '#e8903a', '#e8d03a', '#4ac06a', '#3a9ae0', '#a05ad8'];
      for(let i = 0; i < 7; i++){ const x = Math.round(w * (.1 + i * .13)) - 7;                                      // puertas de las pruebas
        P.rect('#5a3a22', x - 1, 4, 16, WH - 14); P.rect('#8a5a34', x, 5, 14, WH - 16); P.rect('#a87040', x + 1, 6, 5, WH - 18); P.rect('#6e4526', x + 7, 6, 6, WH - 18); P.px('#f2d060', x + 12, 17);
        P.rect(cols[i % 6], x + 3, 8, 8, 5); P.rect(arLit(cols[i % 6], .5), x + 4, 9, 3, 2); }
      [Math.round(w * .04), Math.round(w * .96)].forEach(x => arPot(P, x - 4, WH + 4, '#ff8aa8'));
      P.rect('#b9a37a', 0, 0, w, 3); P.rect('#8a7448', 0, 3, w, 1);
      const cx = Math.round(w / 2), cy = Math.round(WH + (h - WH) / 2);                                           // círculo central del suelo
      for(let a = 0; a < 360; a += 3){ const r = 46, x = cx + Math.cos(a * Math.PI / 180) * r * 1.9, y = cy + Math.sin(a * Math.PI / 180) * r * .9; P.alpha('#ffffff', .5, x, y, 2, 1); }
      P.alpha('#ffffff', .4, cx - 90, cy, 180, 1);
      arOcclude(P, w, WH); return {lights: [.15, .5, .85].map(k => Math.round(w * k))};
    },
    anim(c, t, d, w){
      d.lights.forEach((x, i) => { c.globalAlpha = .1 + .03 * Math.sin(t * 1.5 + i); c.fillStyle = '#fff8d0'; for(let y = 0; y < 120; y += 2) c.fillRect(Math.floor(x - 14 - y * .25), y, Math.ceil(28 + y * .5), 2); });     // luz que entra
      c.fillStyle = '#ffffff'; for(let i = 0; i < 12; i++){ const x = (i * 53 + t * 3) % w, y = AR_WALL + 10 + ((i * 31 + t * 2) % (AR_H - AR_WALL - 20)); c.globalAlpha = .25 + .2 * Math.sin(t * 2 + i); c.fillRect(Math.floor(x), Math.floor(y), 1, 1); }
      c.globalAlpha = 1; }},

  // ---- Alana (Winona) · Gimnasio de Ciudad Arborada: casa en las copas de los árboles, plataforma de madera, hojas y viento ----
  alana: {dark: .04,
    build(P, w, h, WH){
      const sky = ['#8ccbf0', '#9ed6f4', '#b3e0f7', '#c9ebfa']; sky.forEach((c1, i) => P.rect(c1, 0, i * (WH / 4), w, Math.ceil(WH / 4) + 1));                                    // cielo
      for(let i = 0; i < 6; i++) arCloud(P.c, 10 + i * (w / 6) + (i * 17 % 20), 6 + (i % 3) * 7, .7, .85);
      for(let x = 0; x < w; x += 3){ const hh = 14 + Math.sin(x * .09) * 5 + Math.sin(x * .31) * 3; P.rect('#2f7a3a', x, WH - hh, 3, hh); P.rect('#3f9a4a', x, WH - hh, 3, 3); }                          // copas lejanas
      for(let i = 0; i < w / 3; i++){ const x = P.r() * w, y = P.r() * (WH - 10) + 6; if(y > WH - 18) P.px(['#25652f', '#56b05a', '#2f7a3a'][(P.r() * 3) | 0], x, y); }
      [Math.round(w * .09), Math.round(w * .5), Math.round(w * .91)].forEach(x => { P.rect('#4a3322', x - 7, 0, 14, WH); P.rect('#6a4a30', x - 6, 0, 5, WH); P.rect('#33231a', x + 4, 0, 3, WH); for(let y = 4; y < WH; y += 7) P.alpha('#000000', .25, x - 6, y, 12, 1); });           // troncos
      for(let x = 0; x < w; x += 4){ const hh = 6 + (x * 7 % 9); for(let k = 0; k < hh; k++) P.rect(k % 3 ? '#2f8a3c' : '#3fa84c', x - (k % 2), k, 5, 1); }                                              // dosel de hojas
      for(let x = 6; x < w; x += 17 + (x * 3 % 11)){ const len = 8 + (x * 5 % 10); P.rect('#2a6a34', x, 8, 1, len); for(let k = 0; k < len; k += 3) P.rect('#4cb05a', x - 1, 8 + k, 3, 1); }               // lianas
      P.rect('#6a4a2a', 0, WH - 2, w, 3);
      arTiles(P, 0, WH + 1, w, h - WH - 1, 60, 9, (x, y) => ['#b57e48', '#a97241', '#be8850', '#9f6a3a'][(x * 3 + y * 5) % 4], '#4e3018', .1);                                            // tablas de la plataforma
      for(let y = WH + 1; y < h; y += 9) for(let x = 8 + (y * 7 % 40); x < w; x += 60) P.rect('#4e3018', x, y + 3, 2, 2);
      arSpeck(P, 0, WH, w, h - WH, 160, ['#7fb25a', '#c99560']);
      [WH + 9, h - 18].forEach(y => { P.rect('#e8d29a', 0, y, w, 2); P.rect('#8a6a3a', 0, y + 2, w, 1); for(let x = 6; x < w; x += 44){ P.rect('#6a4a2a', x, y - 5, 4, 12); P.rect('#8a6a3a', x, y - 5, 1, 12); } });          // barandilla de cuerda
      [0, w - 8].forEach(x => { P.rect('#4a3322', x, WH, 8, h - WH); P.rect('#6a4a30', x + 1, WH, 3, h - WH); P.rect('#2f8a3c', x, h - 12, 8, 12); });
      for(let i = 0; i < 70; i++){ const x = P.r() * w, y = WH + 4 + P.r() * (h - WH - 8), c1 = ['#56b05a', '#8ed06a', '#3f9a4a', '#d8a83a'][(P.r() * 4) | 0]; P.rect(c1, x, y, 2, 1); P.px(arDrk(c1, .3), x + 1, y + 1); }     // hojas caídas sobre la madera
      for(let x = 0; x < w; x += 3){ const hh = 3 + (x * 7 % 5); P.rect(x % 6 ? '#2f8a3c' : '#3fa84c', x, h - hh, 4, hh); }                                                 // follaje que asoma bajo la plataforma
      arOcclude(P, w, WH); return {};
    },
    anim(c, t, d, w){
      for(let i = 0; i < 16; i++){ const x = ((i * 61 + t * (18 + i % 5 * 4)) % (w + 30)) - 15, y = 14 + ((i * 37) % (AR_H - 30)) + Math.sin(t * 2 + i) * 6;
        c.globalAlpha = .85; c.fillStyle = i % 3 ? '#56b05a' : '#8ed06a'; c.fillRect(Math.floor(x), Math.floor(y), 2, 1); c.fillRect(Math.floor(x) + 1, Math.floor(y) + 1, 1, 1); }                       // hojas arrastradas por el viento
      c.fillStyle = '#ffffff'; for(let i = 0; i < 6; i++){ const x = ((i * 83 + t * 40) % (w + 60)) - 30, y = 20 + i * 24; c.globalAlpha = .22; c.fillRect(Math.floor(x), y, 24 + i * 3, 1); }              // rayas de viento
      c.globalAlpha = 1; }},

  // ---- Vito y Leti (Tate y Liza) · Gimnasio de Ciudad Algaria: sala espacial con el Sol y la Luna, suelo de cristal y estrellas ----
  vitoleti: {dark: .22, side:{base:'#3a2f6a', mortar:'#120c2c'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 20, 20, (x, y) => (x + y) & 1 ? '#b9b0e8' : '#aaa0de', '#6a5fb0', .14);                                  // suelo de cristal lavanda
      for(let x = 0; x < w; x += 20) P.alpha('#7af0ff', .35, x, WH, 1, h - WH); for(let y = WH; y < h; y += 20) P.alpha('#ff7ae8', .3, 0, y, w, 1);   // cuadrícula luminosa
      P.rect('#0c0a24', 0, 0, w, WH);                                                                            // espacio
      for(let y = 0; y < WH; y += 3) P.alpha('#3a1a6a', .5 * (y / WH), 0, y, w, 3);
      arStars(P, 0, 0, w, WH - 4, 160, ['#ffffff', '#cfe8ff', '#ffe8cf', '#9fb0ff']);
      const sx = Math.round(w * .2), mx = Math.round(w * .8);
      P.rect('#ffb42a', sx - 11, 6, 22, 22); P.rect('#ffd860', sx - 9, 8, 18, 18); P.rect('#fff0a0', sx - 5, 12, 10, 10);                      // el Sol (Tate)
      for(let k = 0; k < 8; k++){ const a = k * .785; P.rect('#ffb42a', sx + Math.cos(a) * 17 - 1, 17 + Math.sin(a) * 17 - 1, 3, 3); }
      P.rect('#d8e6ff', mx - 11, 6, 22, 22); P.rect('#0c0a24', mx - 4, 4, 18, 22); P.rect('#d8e6ff', mx - 11, 8, 5, 18); P.rect('#aab8e8', mx - 11, 10, 2, 14); P.rect('#ffffff', mx - 10, 10, 2, 8);   // la Luna creciente (Liza)
      const px = Math.round(w * .5); P.rect('#3a5aa8', px - 12, 14, 24, 24); P.rect('#4f7ad0', px - 10, 14, 20, 22); P.rect('#6a9af0', px - 8, 15, 8, 6); P.rect('#2a4488', px + 4, 22, 8, 12); P.rect('#d8e6ff', px - 18, 24, 36, 1);  // planeta con anillo
      arStars(P, 0, WH + 2, w, h - WH - 4, 90, ['#ffffff', '#cfe8ff', '#ffe8cf']);                                  // estrellas reflejadas en el cristal
      for(let i = 0; i < 6; i++){ const x = P.r() * w, y = WH + 6 + P.r() * (h - WH - 14); P.alpha('#ffffff', .25, x, y, 12 + P.r() * 14, 1); }
      P.rect('#2a2260', 0, WH - 5, w, 5); P.rect('#7a6ae0', 0, WH - 5, w, 1);
      const cr = (x, y, s, c1) => { P.rect(arDrk(c1, .3), x, y + s, 5, s * 2); P.rect(c1, x + 1, y, 3, s * 3); P.rect(arLit(c1, .5), x + 1, y, 1, s * 2); P.rect(arDrk(c1, .5), x + 4, y + 1, 1, s * 2); };
      cr(4, h - 26, 4, '#8a7af0'); cr(11, h - 20, 3, '#ff7ae0'); cr(w - 10, h - 26, 4, '#7af0ff'); cr(w - 17, h - 20, 3, '#8a7af0');         // cristales psíquicos
      const cx = Math.round(w / 2), cy = Math.round(WH + (h - WH) / 2);                                           // emblema Sol/Luna en el suelo (tenue)
      for(let a = 0; a < 360; a += 3){ const x = cx + Math.cos(a * Math.PI / 180) * 38 * 1.9, y = cy + Math.sin(a * Math.PI / 180) * 38 * .85; P.alpha(a < 180 ? '#ffb42a' : '#aab8ff', .5, x, y, 2, 1); }
      arOcclude(P, w, WH); return {stars: Array.from({length: 22}, () => [P.r() * w, P.r() * (WH - 6), P.r() * 6.28]), orbs: Array.from({length: 6}, (_, i) => [w * (.1 + i * .16), P.r() * 6.28])};
    },
    anim(c, t, d, w){
      c.fillStyle = '#ffffff'; d.stars.forEach(([x, y, ph]) => { c.globalAlpha = .4 + .6 * Math.max(0, Math.sin(t * 2.2 + ph)); c.fillRect(Math.floor(x), Math.floor(y), 1, 1); if(Math.sin(t * 2.2 + ph) > .85){ c.fillRect(Math.floor(x) - 1, Math.floor(y), 3, 1); c.fillRect(Math.floor(x), Math.floor(y) - 1, 1, 3); } });
      const f = (t * .18) % 1; if(f < .25){ const k = f / .25, x = w * .9 - k * 140, y = 4 + k * 24; c.globalAlpha = 1 - k; c.fillRect(Math.floor(x), Math.floor(y), 3, 1); c.globalAlpha = (1 - k) * .4; c.fillRect(Math.floor(x) + 3, Math.floor(y) - 1, 12, 1); }          // estrella fugaz
      d.orbs.forEach(([x, ph], i) => { const y = AR_H - 20 - ((t * 5 + ph * 10 + i * 20) % (AR_H - AR_WALL - 20)); c.globalAlpha = .6; c.fillStyle = i % 2 ? '#ff7ae0' : '#7af0ff'; c.fillRect(Math.floor(x + Math.sin(t + ph) * 4), Math.floor(y), 2, 2); });          // luces psíquicas
      c.globalAlpha = 1; }},

  // ---- Galano (Juan) · Gimnasio de Arrecípolis: losas de hielo sobre el agua, templo claro con arcos y cortinas de agua ----
  galano: {dark: .06,
    build(P, w, h, WH){
      P.rect('#1c5a9a', 0, WH, w, h - WH);                                                                       // agua profunda
      for(let y = WH; y < h; y += 3) P.alpha('#7ad0f0', .12 + .1 * Math.sin(y * .7), 0, y, w, 1);
      arTiles(P, 6, WH + 8, w - 12, h - WH - 18, 26, 20, (x, y) => ['#d6f1fb', '#c9ebf8', '#e0f6fd', '#bfe5f4'][(x * 5 + y * 3) % 4], '#1c5a9a', .18);          // losas de hielo
      for(let i = 0; i < 14; i++) arCrack(P, 8 + P.r() * (w - 16), WH + 10 + P.r() * (h - WH - 22), 6 + P.r() * 12, '#7ab4d0', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .4);
      for(let i = 0; i < 10; i++) P.alpha('#ffffff', .4, 8 + P.r() * (w - 30), WH + 10 + P.r() * (h - WH - 22), 8 + P.r() * 10, 1);
      P.rect('#e8dcc0', 0, 0, w, WH);                                                                            // templo de piedra clara
      for(let y = 0; y < WH; y += 6) P.alpha('#8a7a58', .2, 0, y + 5, w, 1);
      for(let x = 0; x < w; x += 30){ const cx = x + 15; P.rect('#c9bb9a', x + 2, 5, 26, WH - 8); P.rect('#3ab0e0', x + 5, 9, 20, WH - 12); P.rect('#7ad8f4', x + 7, 11, 16, WH - 14); P.rect('#c9bb9a', x + 5, 7, 20, 2); P.rect('#3ab0e0', cx - 6, 7, 12, 3); P.rect('#7ad8f4', cx - 4, 7, 8, 2);
        P.rect('#e8dcc0', cx - 1, 13, 2, WH - 16); }                                                                // arcos con luz de agua
      for(let x = 0; x < w; x += 30) arColumn(P, x - 1, 0, WH, 5, '#e8dcc0');
      P.rect('#8a7a58', 0, WH - 4, w, 4); P.rect('#f4ead0', 0, WH - 4, w, 1);
      [0, w - 12].forEach(x => { arColumn(P, x + 1, WH - 2, h, 9, '#d8cca8'); P.alpha('#3ab0e0', .4, x, WH, 12, h - WH); });                                  // pilares laterales en el agua
      arOcclude(P, w, WH); return {};
    },
    anim(c, t, d, w){
      for(let y = AR_WALL + 3; y < AR_H; y += 5){ const sp = Math.sin(t * 1.6 + y * .8); c.globalAlpha = .22; c.fillStyle = '#ffffff'; c.fillRect(Math.floor((y * 23 + t * 14) % w), y, 14, 1); c.fillRect(Math.floor((y * 37 + t * 9 + 60) % w), y + 1, 8 + (sp > 0 ? 4 : 0), 1); }   // reflejos del agua
      c.fillStyle = '#d8f4ff'; for(let i = 0; i < 14; i++){ const f = (t * .45 + i * .27) % 1; c.globalAlpha = .6 * Math.sin(f * 3.14); c.fillRect(Math.floor((i * 67) % w), Math.floor(AR_WALL + 6 + ((i * 41) % (AR_H - AR_WALL - 14))), 2, 2); }              // destellos del hielo
      c.fillStyle = '#7ad8f4'; for(let x = 10; x < w; x += 30) for(let k = 0; k < 4; k++){ c.globalAlpha = .3; c.fillRect(x + 7 + ((k * 5 + Math.floor(t * 8)) % 16), 11 + ((Math.floor(t * 12) + k * 7) % 22), 1, 3); }                  // cortinas de agua
      c.globalAlpha = 1; }},

  // ---- Sixto (Sidney) · Liga de Hoenn, Siniestro: escenario negro con cortinas rojas, focos y lámpara de pinchos ----
  sixto: {dark: .3,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 18, 18, (x, y) => (x + y) & 1 ? '#1a1a22' : '#121218', '#07070b', .2);                                   // damero negro
      for(let i = -4; i < w / 14; i++){ for(let k = 0; k < h - WH; k += 1) P.alpha('#a31d2a', .14, i * 14 + k * .6, WH + k, 3, 1); }                  // franjas rojas diagonales
      P.alpha('#ffffff', .05, 0, WH + 3, w, 1);
      P.rect('#0c0c12', 0, 0, w, WH);                                                                            // pared negra
      for(let x = 0; x < w; x += 20) P.rect('#15151d', x + 1, 3, 18, WH - 8);
      const mx = Math.round(w / 2); P.rect('#d8d8e8', mx - 12, 6, 24, 24); P.rect('#0c0c12', mx - 5, 4, 20, 26); P.rect('#d8d8e8', mx - 12, 9, 6, 18); P.rect('#9a9ab0', mx - 12, 11, 2, 14);     // luna creciente
      [[Math.round(w * .3), 12], [Math.round(w * .7), 12], [Math.round(w * .18), 20], [Math.round(w * .82), 20]].forEach(([x, y]) => { P.rect('#050508', x - 4, y, 9, 3); P.rect('#050508', x - 8, y + 2, 5, 2); P.rect('#050508', x + 4, y + 2, 5, 2); P.rect('#050508', x - 1, y - 3, 3, 3); });     // murciélagos
      [0, w - 24].forEach((x, i) => { for(let k = 0; k < 24; k++){ const col = arMix('#7a1620', '#2a0508', Math.abs(Math.sin(k * 1.1)) * .8); P.rect(col, x + k, 0, 1, WH + 40 - Math.abs(12 - k) * 1.2); }               // cortinas rojas
        P.rect('#3a0a10', x, WH + 38, 24, 2); });
      P.rect('#0a0a10', 0, WH - 4, w, 4); P.rect('#6a1620', 0, WH - 4, w, 1);
      arOcclude(P, w, WH); return {lights: [.28, .5, .72].map(k => Math.round(w * k))};
    },
    anim(c, t, d, w){
      d.lights.forEach((x, i) => { const sw = Math.sin(t * .8 + i * 2.1) * 26;
        for(let y = 0; y < AR_H - 30; y += 2){ const k = y / (AR_H - 30); c.globalAlpha = .13 * (1 - k * .5); c.fillStyle = i === 1 ? '#ffffff' : '#ff6a7a'; const ww = 8 + k * 56; c.fillRect(Math.floor(x + sw * k - ww / 2), y, Math.ceil(ww), 2); } });          // focos que barren la sala
      c.fillStyle = '#ff3a4a'; for(let i = 0; i < 14; i++){ const x = (i * 59 + Math.sin(t + i) * 6) % w, y = AR_H - ((t * (6 + i % 4) * 2 + i * 31) % (AR_H - 20)); c.globalAlpha = .55; c.fillRect(Math.floor(x), Math.floor(y), 1, 1); }          // brasas
      c.globalAlpha = 1; }},

  // ---- Fátima (Phoebe) · Liga de Hoenn, Fantasma: sala fría de piedra con fuegos fatuos morados, ventanales y niebla ----
  fatima: {dark: .3, side:{base:'#3a4a58', mortar:'#10181f'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 22, 22, (x, y) => ['#2b3d4d', '#273847', '#314556'][(x * 5 + y * 3) % 3], '#0d141a', .1);
      arSpeck(P, 0, WH, w, h - WH, 260, ['#3d556a', '#1c2a36']);
      const cx = Math.round(w / 2), cy = Math.round(WH + (h - WH) / 2);                                           // círculo de invocación tenue
      for(let a = 0; a < 360; a += 2){ const x = cx + Math.cos(a * Math.PI / 180) * 44 * 1.9, y = cy + Math.sin(a * Math.PI / 180) * 44 * .85; P.alpha('#b07af0', .35, x, y, 2, 1); }
      P.rect('#18222c', 0, 0, w, WH);                                                                            // pared
      arBricks(P, 0, 0, w, WH, 16, 6, '#222f3b', '#0f161d', .1);
      for(let x = 14; x < w - 14; x += 56){ P.rect('#0a1016', x, 3, 20, WH - 8); P.rect('#6a7adf', x + 2, 5, 16, WH - 14); P.rect('#aab8ff', x + 4, 7, 12, WH - 18); P.rect('#d8e0ff', x + 7, 8, 6, 5); P.rect('#0a1016', x + 9, 5, 2, WH - 14); P.rect('#0a1016', x + 2, 16, 16, 2);        // ventanales con luna
        P.rect('#0a1016', x - 1, 1, 22, 3); }
      for(let x = 40; x < w - 20; x += 112){ P.rect('#3a2a4a', x, WH - 14, 4, 12); P.rect('#6a4a8a', x - 2, WH - 16, 8, 3); }                       // candelabros
      P.rect('#0a1016', 0, WH - 4, w, 4); P.rect('#4a5a6e', 0, WH - 4, w, 1);
      [[6, WH + 14], [w - 6, WH + 14], [6, h - 18], [w - 6, h - 18]].forEach(([x, y]) => { P.rect('#2a3440', x - 3, y, 7, 14); P.rect('#4a5a6e', x - 2, y, 2, 14); P.rect('#1a222b', x - 4, y - 2, 9, 3); });       // lápidas-pilar
      arOcclude(P, w, WH); return {fires: [[Math.round(w * .2), 28], [Math.round(w * .8), 28], [8, WH + 12], [w - 8, WH + 12], [8, h - 20], [w - 8, h - 20]], wisps: Array.from({length: 7}, () => [P.r() * w, P.r() * 6.28, 8 + P.r() * 8])};
    },
    anim(c, t, d, w){
      d.fires.forEach(([x, y], i) => { arGlow(c, x, y - 4, 10 + Math.sin(t * 6 + i) * 1.5, '#9a6af0', .45); arFlame(c, x, y, t, i, '#9a5af0', '#e8d8ff'); });
      c.fillStyle = '#b8c8e8'; for(let i = 0; i < 9; i++){ const f = (t * .06 + i * .13) % 1, x = ((f * (w + 80)) - 40), y = AR_H - 24 + Math.sin(t * .9 + i * 2) * 4 - (i % 3) * 8; c.globalAlpha = .12; c.fillRect(Math.floor(x), Math.floor(y), 44, 4); c.fillRect(Math.floor(x) + 8, Math.floor(y) - 3, 28, 3); }       // niebla
      d.wisps.forEach(([x, ph, r], i) => { const xx = x + Math.sin(t * .7 + ph) * r * 2, yy = AR_WALL + 14 + ((Math.sin(t * .5 + ph * 2) + 1) / 2) * (AR_H - AR_WALL - 40); c.globalAlpha = .55; c.fillStyle = '#c8a8ff'; c.fillRect(Math.floor(xx), Math.floor(yy), 2, 2); c.globalAlpha = .2; c.fillRect(Math.floor(xx) - 1, Math.floor(yy) - 1, 4, 4); });  // luces fatuas
      c.globalAlpha = 1; }},

  // ---- Nívea (Glacia) · Liga de Hoenn, Hielo: salón de cristal helado con columnas, suelo de mármol azul y nieve ----
  nivea: {dark: .1, side:{base:'#8ac8e8', mortar:'#3a6e92'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 24, 24, (x, y) => (x + y) & 1 ? '#b8def2' : '#abd5ec', '#6aa6c8', .14);                                  // mármol azul
      for(let y = WH; y < h; y += 24) for(let x = 0; x < w; x += 24){ const cx = x + 11, cy = y + 11; P.alpha('#ffffff', .22, cx - 6, cy, 13, 1); P.alpha('#ffffff', .22, cx, cy - 6, 1, 13); P.alpha('#ffffff', .15, cx - 4, cy - 4, 1, 1); P.alpha('#ffffff', .15, cx + 4, cy + 4, 1, 1); }  // copos grabados
      for(let i = 0; i < 8; i++) P.alpha('#ffffff', .3, P.r() * w, WH + 8 + P.r() * (h - WH - 16), 14 + P.r() * 16, 2);
      for(let y = 0; y < WH; y++) P.rect(arMix('#1b4a7a', '#4a8ac0', y / WH), 0, y, w, 1);                       // pared azul degradada
      for(let x = 0; x < w; x += 4) P.alpha(['#7af0d0', '#7ab0ff', '#c8a0ff'][(x >> 2) % 3], .16 + .1 * Math.sin(x * .05), x, 0, 4, WH - 6);             // aurora
      for(let x = 20; x < w; x += 50) arColumn(P, x, 0, WH, 8, '#cfe9f6');
      for(let i = 0; i < w / 26; i++){ const x = 8 + i * 26 + (i * 7 % 9), hh = 8 + (i * 11 % 10);                                                           // cristales de hielo
        P.rect('#5ea4d0', x, WH - hh, 5, hh); P.rect('#bfe8fa', x + 1, WH - hh, 2, hh); P.rect('#ffffff', x + 1, WH - hh, 1, hh - 3); P.rect('#3a78a8', x + 4, WH - hh + 2, 1, hh); }
      for(let x = 4; x < w; x += 12 + (x * 5 % 7)){ const len = 5 + (x * 11 % 9); for(let k = 0; k < len; k++) P.rect('#e0f6ff', x + Math.floor(k / 5) * .5, k, Math.max(1, 3 - Math.floor(k / 3)), 1); }
      P.rect('#2a5a86', 0, WH - 4, w, 4); P.rect('#dff6ff', 0, WH - 4, w, 1);
      arOcclude(P, w, WH); return {sp: Array.from({length: 18}, () => [P.r() * w, AR_WALL + P.r() * (h - AR_WALL), P.r() * 6.28])};
    },
    anim(c, t, d, w){
      c.fillStyle = '#ffffff'; for(let i = 0; i < 34; i++){ const x = ((i * 47 + Math.sin(t * .8 + i) * 8 + t * (3 + i % 3)) % (w + 20)) - 10, y = ((i * 31 + t * (10 + i % 5)) % (AR_H + 10)) - 5; c.globalAlpha = .65; c.fillRect(Math.floor(x), Math.floor(y), 1 + (i % 7 === 0 ? 1 : 0), 1 + (i % 7 === 0 ? 1 : 0)); }   // nieve
      d.sp.forEach(([x, y, ph]) => { const a = Math.max(0, Math.sin(t * 2.4 + ph * 4)); if(a > .6){ c.globalAlpha = a; c.fillRect(Math.floor(x), Math.floor(y) - 1, 1, 3); c.fillRect(Math.floor(x) - 1, Math.floor(y), 3, 1); } });
      c.globalAlpha = 1; }},

  // ---- Dracón (Drake) · Liga de Hoenn, Dragón: sala marina de escamas azules con estatuas de dragón y braseros turquesa ----
  dracon: {dark: .22, side:{base:'#1f4a5e', mortar:'#08181f'},
    build(P, w, h, WH){
      arScales(P, 0, WH, w, h - WH, 14, 8, '#1f5a74', '#7ad0e8');                                                // suelo de escamas
      const cx = Math.round(w / 2), cy = Math.round(WH + (h - WH) / 2);
      for(let a = 0; a < 360; a += 2){ const x = cx + Math.cos(a * Math.PI / 180) * 46 * 1.9, y = cy + Math.sin(a * Math.PI / 180) * 46 * .85; P.alpha('#ffd060', .4, x, y, 2, 1); }      // aro dorado
      P.rect('#0e2a38', 0, 0, w, WH);                                                                            // pared
      arScales(P, 0, 0, w, WH, 12, 7, '#16445a', '#5ab8d8');
      for(let x = 28; x < w - 10; x += 74){ arColumn(P, x, 0, WH, 8, '#2a6a86'); }
      arDragonHead(P, Math.round(w * .16), 11, 1, '#2f7a96', '#7affea'); arDragonHead(P, Math.round(w * .84), 11, -1, '#2f7a96', '#7affea');      // estatuas
      const mx = Math.round(w / 2); P.rect('#0a1c26', mx - 17, 6, 34, WH - 10); P.rect('#16445a', mx - 15, 8, 30, WH - 14);                          // emblema de dragón en el centro
      P.rect('#ffd060', mx - 11, 12, 22, 3); P.rect('#ffd060', mx - 3, 12, 6, 16); P.rect('#ffd060', mx - 11, 22, 8, 3); P.rect('#ffd060', mx + 3, 22, 8, 3); P.rect('#fff0a0', mx - 1, 13, 2, 13);
      P.rect('#0a1c26', 0, WH - 4, w, 4); P.rect('#5ab8d8', 0, WH - 4, w, 1);
      const braz = (x, y) => { P.rect('#10242e', x - 5, y + 4, 11, 3); P.rect('#2a6a86', x - 4, y + 7, 9, 2); P.rect('#10242e', x - 1, y + 8, 3, 6); P.rect('#10242e', x - 5, y + 14, 11, 2); };
      braz(8, WH + 12); braz(w - 9, WH + 12); braz(8, h - 28); braz(w - 9, h - 28);
      arOcclude(P, w, WH); return {fires: [[8, WH + 16], [w - 9, WH + 16], [8, h - 24], [w - 9, h - 24]], eyes: [[Math.round(w * .16) + 8, 17], [Math.round(w * .84) - 8, 17]]};
    },
    anim(c, t, d, w){
      d.fires.forEach(([x, y], i) => { arGlow(c, x, y - 4, 12 + Math.sin(t * 6 + i) * 1.5, '#4af0d0', .45); arFlame(c, x, y, t, i, '#30d8c0', '#e8fffa'); arFlame(c, x + 2, y, t + .4, i + 3, '#30d8c0', '#e8fffa'); });
      d.eyes.forEach(([x, y]) => arGlow(c, x, y, 4 + Math.sin(t * 3) * 1, '#7affea', .55));
      c.fillStyle = '#7affea'; for(let i = 0; i < 18; i++){ const x = (i * 43) % w, y = AR_H - ((t * (7 + i % 4) * 2 + i * 27) % (AR_H - 20)); c.globalAlpha = .6; c.fillRect(Math.floor(x + Math.sin(t + i) * 5), Math.floor(y), 1, 2); }          // chispas turquesa
      c.globalAlpha = 1; }},

  // ---- Plubio (Wallace) · Liga de Hoenn, Campeón: salón de mármol con columnas de cristal llenas de agua y burbujas, y la puerta del Salón de la Fama ----
  plubio: {dark: .12, side:{base:'#cfe3ee', mortar:'#6a96ac'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 26, 22, (x, y) => (x + y) & 1 ? '#e9f6fb' : '#dceef7', '#8ab8cc', .12);                                  // mármol blanco-azulado
      for(let y = WH + 11; y < h; y += 22) for(let x = 0; x < w; x += 6){ P.alpha('#2aa0d8', .35, x, y + Math.round(Math.sin(x * .35) * 2), 3, 1); }                  // onda de agua incrustada
      for(let x = 0; x < w; x += 26) P.alpha('#ffd060', .45, x, WH, 1, h - WH);                                  // vetas doradas
      P.rect('#d4e6ef', 0, 0, w, WH);                                                                            // pared
      for(let x = 0; x < w; x += 12) P.alpha('#8ab8cc', .25, x, 0, 1, WH - 6);
      const mx = Math.round(w / 2);                                                                              // puerta al Salón de la Fama
      P.rect('#b88a2a', mx - 19, 2, 38, WH - 4); P.rect('#0e2a4a', mx - 16, 5, 32, WH - 7); P.rect('#2a7ad0', mx - 14, 7, 28, WH - 9); P.rect('#7ad0ff', mx - 10, 10, 20, WH - 12); P.rect('#ffffff', mx - 6, 12, 12, WH - 14); P.rect('#b88a2a', mx - 1, 5, 2, WH - 7);
      P.rect('#ffd060', mx - 19, 2, 38, 2);
      [.2, .35, .65, .8].forEach(k => { const x = Math.round(w * k) - 8; P.rect('#8ab8cc', x - 1, 4, 18, WH - 6); P.rect('#bfe8f8', x, 5, 16, WH - 8); P.rect('#2aa0d8', x + 2, 8, 12, WH - 12); P.rect('#7ad8f8', x + 3, 9, 4, WH - 14); P.rect('#ffd060', x - 2, 2, 20, 3); P.rect('#ffd060', x - 2, WH - 4, 20, 2); });   // vitrinas de agua
      P.rect('#b88a2a', 0, WH - 4, w, 4); P.rect('#ffd060', 0, WH - 4, w, 1);
      const col = x => { P.rect('#8ab8cc', x - 2, WH + 2, 14, h - WH - 4); P.rect('#bfe8f8', x - 1, WH + 3, 12, h - WH - 6); P.rect('#2aa0d8', x + 1, WH + 5, 8, h - WH - 10); P.rect('#7ad8f8', x + 2, WH + 6, 2, h - WH - 12); P.rect('#ffd060', x - 3, WH + 1, 16, 3); P.rect('#ffd060', x - 3, h - 5, 16, 3); };
      col(2); col(w - 14);                                                                                       // columnas de cristal con agua
      arOcclude(P, w, WH);
      return {cols: [2, w - 14], vit: [.2, .35, .65, .8].map(k => Math.round(w * k) - 8), door: mx};
    },
    anim(c, t, d, w){
      c.fillStyle = '#ffffff'; d.cols.forEach((x, k) => { for(let i = 0; i < 7; i++){ const f = (t * .4 + i * .15 + k * .3) % 1; c.globalAlpha = .7; c.fillRect(Math.floor(x + 3 + ((i * 3 + k) % 6) + Math.sin(t * 2 + i) * 1), Math.floor(AR_H - 10 - f * (AR_H - AR_WALL - 16)), 1 + (i % 2), 1 + (i % 2)); } });      // burbujas
      d.vit.forEach((x, k) => { for(let i = 0; i < 3; i++){ const f = (t * .35 + i * .33 + k * .2) % 1; c.globalAlpha = .7; c.fillRect(Math.floor(x + 4 + ((i * 4 + k) % 8)), Math.floor(AR_WALL - 8 - f * 20), 1, 1); } });
      arGlow(c, d.door, 20, 20 + Math.sin(t * 2) * 2, '#bfe8ff', .22);
      c.fillStyle = '#ffd060'; for(let i = 0; i < 14; i++){ const f = (t * .5 + i * .31) % 1; c.globalAlpha = .7 * Math.sin(f * 3.14); c.fillRect(Math.floor((i * 71) % w), Math.floor(AR_WALL + 8 + ((i * 37) % (AR_H - AR_WALL - 20))), 1, 1); }          // destellos dorados
      c.globalAlpha = 1; }}
});
