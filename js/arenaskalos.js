"use strict";
/* =====================================================================
   17f) ARENAS DE KALOS: un fondo pixel art por cada combate de Kalos (X e Y): los 8 gimnasios (Novarte, Relieve, Yantra, Tiriópolis, Luminalia, Romantis,
   Anistar y Fractal), el Alto Mando (Malva, Narciso, Tileo, Ágata) y la Campeona Dianta. En total 13 fondos.
   Dibujadas con código (sin imágenes), igual que las de las otras regiones, y con el espíritu de los gimnasios «vivos» de Blanco y Negro: cada sala tiene
   algo que se mueve (agua, luces, engranajes, pétalos, nieve, estrellas...). Se cargan DESPUÉS de arenasteselia.js y usan los ayudantes de arenas.js y
   siguientes (arTiles, arBricks, arSpeck, arEll, arPool, arGlowC, arCone, arMote, arMotes, arStars, arGear, arBolt, arScales, arDragonHead, arFluted...).
   Cómo funciona build() / anim(): ver la cabecera de arenas.js.

   El id de cada arena es el id del combate: violeta, lino, corelia, amaro, lem, valeria, astrid, edel, malva, narciso, tileo (fantasma), agata (acero) y dianta.

   REGLA (igual que las demás): el centro del suelo (donde pelean los dos Pokémon) se deja LIMPIO; la decoración va en la pared del fondo, en las bandas de los
   lados y en el borde de arriba. El marcador tapa la parte de arriba a izquierda y derecha: lo importante se ve en el centro de arriba, en los lados y en el suelo.
   ===================================================================== */

// ---- Ayudantes nuevos (comunes a las arenas de Kalos) ----
function arLeaf(P, x, y, s, base){                                                                    // hoja grande (dos mitades) apuntando hacia arriba-derecha
  for(let i = 0; i < s; i++){ const k = i / s, ww = Math.max(1, Math.round(Math.sin(k * Math.PI) * s * .45)); P.rect(arDrk(base, .25), x + i * .6 - ww, y - i, ww, 1); P.rect(base, x + i * .6, y - i, ww, 1); P.rect(arLit(base, .25), x + i * .6, y - i, Math.max(1, ww >> 1), 1); }
}
function arVine(P, x, y0, len, col, leafCol){                                                         // enredadera que cuelga con hojitas
  for(let i = 0; i < len; i++){ const sx = Math.round(Math.sin(i * .3 + x) * 2); P.rect(arDrk(col, .2), x + sx, y0 + i, 2, 1); if(i % 5 === 2){ P.rect(leafCol, x + sx + 2, y0 + i, 3, 2); P.rect(arLit(leafCol, .3), x + sx + 2, y0 + i, 2, 1); P.rect(leafCol, x + sx - 3, y0 + i + 1, 3, 2); } }
}
function arFlow(P, x, y, col, ctr){                                                                   // flor pequeña (pétalos y centro)
  [[0, -2], [2, 0], [0, 2], [-2, 0]].forEach(([dx, dy]) => P.rect(col, x + dx - 1, y + dy - 1, 2, 2)); P.rect(ctr || '#ffe060', x - 1, y - 1, 2, 2); P.px(arLit(col, .5), x - 3, y - 3);
}
function arFall(c, list, t, w, col, a, sx, sy, sz){                                                  // cosas que caen (pétalos, hojas, nieve): list = [x, y, fase]
  const span = AR_H - 8; c.fillStyle = col;
  list.forEach(([x, y, ph], i) => { c.globalAlpha = a; const xx = (((x + t * sx * (.5 + ph) + Math.sin(t * 1.6 + i) * 4) % w) + w) % w, yy = (((y + t * sy * (.5 + ph)) % span) + span) % span + 4;
    c.fillRect(Math.floor(xx), Math.floor(yy), sz, sz); if(sz > 1 && i % 3 === 0) c.fillRect(Math.floor(xx) + 1, Math.floor(yy) + 1, sz, 1); });
  c.globalAlpha = 1;
}
function arRect3(P, x, y, ww, hh, col){ P.rect(arDrk(col, .45), x, y, ww, hh); P.rect(col, x + 1, y + 1, ww - 2, hh - 2); P.alpha('#ffffff', .28, x + 1, y + 1, ww - 2, 1); }  // panel con bisel
function arShade(P, bx, sd, wd, WH, h){ for(let i = 0; i < 9; i++) P.alpha('#000000', .3 * (1 - i / 9), sd ? bx - 1 - i : bx + wd + i, WH, 1, h - WH); }                      // sombra que separa la banda lateral del suelo

Object.assign(ARENAS, {

  // ---- Violeta · Ciudad Novarte (Bicho): invernadero enorme y luminoso. Cristal con marcos de hierro, enredaderas gigantes, flores que flotan y un haz de luz que cae del techo ----
  violeta: {dark: .04,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 20, 20, (x, y) => (x + y) & 1 ? '#d8e0bc' : '#cdd6ae', '#8a9a66', .1);                        // suelo de losas claras
      arSpeck(P, 0, WH, w, h - WH, 420, ['#e8f0c8', '#b8c690', '#9aaa70']);
      arGradR(P, 0, 0, w, WH, '#bfe6ee', '#e8f8ee');                                                                              // cielo visto a través del cristal
      for(let x = 0; x < w; x += 22){ P.rect('#3a5a3a', x, 0, 2, WH); P.alpha('#ffffff', .4, x + 2, 0, 1, WH); }                       // marcos verticales
      [10, 22].forEach(y => P.rect('#3a5a3a', 0, y, w, 2)); for(let x = 0; x < w; x += 22) P.alpha('#ffffff', .35, x + 4, 2, 5, 3);   // marcos horizontales y reflejos del cristal
      P.rect('#2a4a2a', 0, WH - 7, w, 7); P.rect('#4a7a4a', 0, WH - 7, w, 1);                                                          // muro bajo con macetero corrido
      for(let x = 3; x < w; x += 9) arLeaf(P, x, WH - 7, 8, ['#2f8a3a', '#3fa84a', '#58c05a'][(x / 9 | 0) % 3]);
      for(let i = 0; i < 26; i++){ const x = 6 + ((i * 53) % (w - 12)); arVine(P, x, 0, 8 + (i * 7) % 20, '#2f6a2a', ['#3fa84a', '#58c05a'][i & 1]); }   // enredaderas gigantes
      for(let i = 0; i < 18; i++) arFlow(P, 6 + ((i * 37) % (w - 12)), 8 + ((i * 11) % 22), ['#ff7ab8', '#ffd84a', '#ff9a4a', '#c07aff'][i % 4]);
      const mx = Math.round(w / 2); arCone(P, mx, 0, 30, 110, h - 4, '#fff6b8', .18); arPool(P, mx, h - 40, 64, 26, '#fff6b8', .22);   // haz de luz cenital
      [0, 1].forEach(sd => { const bx = sd ? w - 40 : 0;                                                                                // bandas laterales con parterres
        P.rect('#4a3a22', bx, WH + 2, 40, h - WH - 2); P.alpha('#2a8a3a', .4, bx, WH + 2, 40, h - WH - 2);
        for(let k = 0; k < 7; k++){ const py = WH + 8 + k * 21; arEll(P, bx + 20, py + 8, 17, 7, '#3a2a18'); arEll(P, bx + 20, py + 6, 16, 6, '#5a3a1e'); [-9, -3, 4, 10].forEach((dx, j) => { arLeaf(P, bx + 20 + dx, py + 5, 8, j & 1 ? '#3fa84a' : '#2f8a3a'); arFlow(P, bx + 20 + dx + 2, py - 4, ['#ff7ab8', '#ffd84a', '#c07aff', '#ff9a4a'][(k + j) % 4]); }); }
        arShade(P, bx, sd, 40, WH, h); });
      arOcclude(P, w, WH); return {mx, petals: arMotes(P, 26, w, h), fl: Array.from({length: 14}, (_, i) => [8 + ((i * 41) % (w - 16)), 14 + (i * 13) % 150, i / 14])};
    },
    anim(c, t, d, w){
      arGlowC(c, d.mx, 6, 20 + Math.sin(t * 1.5) * 2, '#fffbd0', .3);
      arFall(c, d.fl, t, w, '#ff9ad0', .85, 4, 6, 2); arFall(c, d.fl.map(([x, y, p]) => [x + 17, y + 40, p]), t, w, '#ffe45a', .8, -3, 5, 2);
      arMote(c, d.petals, t, w, '#fffbd0', .6, 3, -4); }},

  // ---- Lino · Ciudad Relieve (Roca): rocódromo excavado en la roca viva. Paredes escarpadas con presas de colores, cascadas a los lados y luces de neón y antorchas ----
  lino: {dark: .22,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 24, 20, (x, y) => ['#5a5248', '#524a40', '#625a4e'][(x * 3 + y) % 3], '#2a2620', .1);                // suelo de roca tallada
      arSpeck(P, 0, WH, w, h - WH, 520, ['#7a7062', '#3a342c', '#6a6256']);
      arStrata(P, 0, 0, w, WH + 2, ['#4a4238', '#5a5044', '#3e382f', '#6a5e50', '#4a4238'], 3);                                          // pared escarpada
      for(let i = 0; i < 30; i++){ const x = 4 + ((i * 47) % (w - 8)), y = 4 + ((i * 13) % (WH - 10)), col = ['#ff5a4a', '#ffd84a', '#4ac8ff', '#7aff7a', '#ff7ae0'][i % 5];
        P.rect(arDrk(col, .4), x, y + 1, 4, 3); P.rect(col, x, y, 4, 3); P.alpha('#ffffff', .4, x, y, 2, 1); }                              // presas de escalada
      for(let k = 0; k < 6; k++){ const x = 24 + k * Math.round((w - 48) / 5); P.alpha('#101018', .35, x, 0, 2, WH); }                      // cuerdas de seguridad
      P.rect('#1a1a22', 0, WH - 3, w, 3); P.rect('#ff4ad8', 0, WH - 3, w, 1);                                                             // tira de neón
      const falls = [];
      [0, 1].forEach(sd => { const bx = sd ? w - 38 : 0;                                                                                  // cascadas laterales
        P.rect('#3a342c', bx, 0, 38, h); arStrata(P, bx, 0, 38, h, ['#4a4238', '#5a5044', '#3e382f', '#6a5e50'], 2);
        const fx = bx + 12; P.rect('#2a8ac8', fx, 0, 14, WH + 40); P.rect('#6acaff', fx + 2, 0, 3, WH + 40); P.alpha('#ffffff', .4, fx + 8, 0, 2, WH + 40); falls.push(fx);
        arEll(P, fx + 7, WH + 46, 16, 6, '#1a6aa8'); arEll(P, fx + 7, WH + 45, 14, 5, '#4ab0f0', .8); arPool(P, fx + 7, WH + 60, 30, 10, '#4ab0f0', .25);
        arTorch(P, sd ? bx + 5 : bx + 33, WH + 76, '#6b4a2a'); arRocks(P, bx + 4, h - 6, 4, '#6a6256');
        arShade(P, bx, sd, 38, WH, h); });
      arPool(P, Math.round(w / 2), h - 30, 70, 20, '#ff9a5a', .08);
      arOcclude(P, w, WH); return {falls, torch: [[5, WH + 76], [w - 5, WH + 76]], motes: arMotes(P, 14, w, h)};
    },
    anim(c, t, d, w){
      d.falls.forEach((fx, i) => { for(let k = 0; k < 14; k++){ const yy = ((k * 11 + t * 70 + i * 5) % (AR_WALL + 44)); c.globalAlpha = .75; c.fillStyle = '#e8faff'; c.fillRect(fx + 2 + (k * 5) % 11, Math.floor(yy), 1, 4); } c.globalAlpha = 1; arMote(c, [[fx + 7, AR_WALL + 44, .2], [fx + 3, AR_WALL + 44, .6]], t, w, '#ffffff', .6, 0, -6); });
      d.torch.forEach(([x, y], i) => { arFlame(c, x, y, t, i, '#ff9a30', '#ffe890'); arGlowC(c, x, y - 4, 10, '#ff9a30', .18); });
      c.globalAlpha = .35 + .2 * Math.sin(t * 5); c.fillStyle = '#ff4ad8'; c.fillRect(0, AR_WALL - 3, w, 1); c.globalAlpha = 1; }},

  // ---- Corelia · Ciudad Yantra (Lucha): pista de patinaje con luces LED y dojo a la vez. Suelo brillante, barandillas metálicas, estatuas de Lucario y paneles luminosos ----
  corelia: {dark: .16,
    build(P, w, h, WH){
      const hue = ['#ff4a7a', '#ffb02a', '#4ae0ff', '#7a5aff', '#4aff9a'];
      arTiles(P, 0, WH, w, h - WH, 16, 16, (x, y) => arMix('#1c2030', hue[(x + y * 2) % 5], .16), '#0c0e18', .12);                       // pista de baldosas con tinte LED
      for(let y = WH + 6; y < h; y += 32) P.alpha('#ffffff', .05, 0, y, w, 1);
      P.rect('#262c44', 0, 0, w, WH); for(let x = 0; x < w; x += 26){ P.rect('#12182a', x, 3, 22, WH - 12); P.rect(hue[(x / 26 | 0) % 5], x + 1, 4, 20, WH - 14); P.alpha('#000000', .45, x + 1, 4, 20, WH - 14); }   // paneles de luz
      P.rect('#0a0c16', 0, WH - 8, w, 8); P.rect('#9aa4c0', 0, WH - 8, w, 2); P.rect('#ffffff', 0, WH - 8, w, 1);                       // barandilla metálica del fondo
      for(let x = 6; x < w; x += 18){ P.rect('#6a7490', x, WH - 8, 2, 8); P.alpha('#ffffff', .4, x, WH - 8, 1, 8); }
      const luc = ['....##.....##....', '....###...###....', '.....#######.....', '....#########....', '....##.###.##....', '.....#######.....', '......#####......', '.....#######.....', '....#########....', '....###.#.###....', '...####.#.####...', '...###..#..###...', '...###.....###...', '..####.....####..'];
      [0, 1].forEach(i => { const sx = i ? w - 52 : 8, sy = WH - 30; P.rect('#2a3050', sx - 3, sy + 42, 40, 8); P.rect('#3a4268', sx - 3, sy + 42, 40, 2);     // estatuas de Lucario sobre pedestal
        arBitmap(P, luc, sx, sy + 8, 2, '#3a6ad8', 1); P.rect('#ffd84a', sx + 14, sy + 14, 4, 3); P.rect('#ffd84a', sx + 20, sy + 14, 4, 3); });
      [0, 1].forEach(sd => { const bx = sd ? w - 7 : 0; P.rect('#9aa4c0', bx, WH + 4, 7, h - WH - 4); P.rect('#5a6480', bx + (sd ? 0 : 5), WH + 4, 2, h - WH - 4); P.alpha('#ffffff', .3, bx + (sd ? 5 : 1), WH + 4, 1, h - WH - 4); });   // vallas metálicas laterales
      arOcclude(P, w, WH); return {hue, led: Array.from({length: 22}, (_, i) => [10 + i * Math.round((w - 20) / 21), h - 8])};
    },
    anim(c, t, d, w){
      for(let i = 0; i < 22; i++){ const k = (Math.sin(t * 3 - i * .5) + 1) / 2; c.globalAlpha = .25 + .6 * k; c.fillStyle = d.hue[i % 5]; c.fillRect(d.led[i][0], d.led[i][1], 5, 2); c.globalAlpha = .1 * k; c.fillRect(d.led[i][0] - 3, d.led[i][1] - 6, 11, 8); }
      for(let x = 0; x < w; x += 26){ const k = (Math.sin(t * 2.4 + x * .1) + 1) / 2; c.globalAlpha = .28 * k; c.fillStyle = d.hue[(x / 26 | 0) % 5]; c.fillRect(x + 1, 4, 20, AR_WALL - 14); }
      c.globalAlpha = 1; }},

  // ---- Amaro · Ciudad Tiriópolis (Planta): enorme estructura de madera en la copa de un árbol milenario. Plataformas colgadas con cuerdas y hojas gigantes que se mecen ----
  amaro: {dark: .08,
    build(P, w, h, WH){
      arPlank(P, 0, WH, w, h - WH, '#9a6a3a', 11, .22);                                                                                    // suelo de tablones
      arSpeck(P, 0, WH, w, h - WH, 380, ['#b88a52', '#7a4e2a', '#a87a46']);
      arGradR(P, 0, 0, w, WH, '#8ad0f0', '#d8f4ff');                                                                                      // cielo entre las ramas
      for(let i = 0; i < 6; i++) arEll(P, 30 + i * 52 + (i * 9) % 20, 8 + (i * 7) % 12, 14, 3, '#ffffff', .6);
      [w * .22, w * .5, w * .78].forEach(x => { for(let k = 0; k < 7; k++) arEll(P, x + (k - 3) * 9, 12 + Math.abs(k - 3) * 2, 16, 12, ['#2f8a3a', '#3fa84a', '#58c05a', '#2a7a34'][k % 4]); });   // copa de hojas
      P.rect('#4a2e1a', 0, WH - 6, w, 6); P.rect('#6a4a2a', 0, WH - 6, w, 1);                                                             // viga
      for(let x = 8; x < w; x += 20) P.rect('#5a3a20', x, WH - 14, 3, 8); P.rect('#7a5a30', 0, WH - 14, w, 2);                             // barandilla del fondo
      [0, 1].forEach(sd => { const bx = sd ? w - 44 : 0;                                                                                  // tronco milenario y ramas en los lados
        P.rect('#3a2414', bx, 0, 44, h); arStrata(P, bx, 0, 44, h, ['#4a3220', '#5a3e28', '#3a2414', '#6a4a30'], 2);
        for(let y = 10; y < h; y += 16) P.alpha('#000000', .25, bx + 6 + (y % 20), y, 2, 12);
        for(let k = 0; k < 5; k++){ const ly = WH + 10 + k * 28; arLeaf(P, sd ? bx + 4 : bx + 38, ly + 10, 16, ['#3fa84a', '#58c05a', '#2f8a3a'][k % 3]); arHang(P, sd ? bx + 14 : bx + 30, ly, ly + 14, '#c8a870'); }
        arShade(P, bx, sd, 44, WH, h); });
      [20, 46, 74].forEach(x => P.rect('#c8a870', Math.round(w * x / 100), 0, 1, WH - 14));
      arOcclude(P, w, WH); return {sway: [[w * .3, WH + 2], [w * .62, WH - 2], [w * .86, WH + 6]], leaves: arMotes(P, 18, w, h), sun: Math.round(w * .5)};
    },
    anim(c, t, d, w){
      arGlowC(c, d.sun, 4, 24, '#fff6b0', .22);
      d.sway.forEach(([x, y], i) => { const s = Math.round(Math.sin(t * 1.3 + i * 2) * 3); c.fillStyle = '#58c05a'; c.fillRect(Math.round(x) + s, y, 8, 2); c.fillStyle = '#3fa84a'; c.fillRect(Math.round(x) + s + 2, y + 2, 6, 1); });
      arFall(c, d.leaves, t, w, '#58c05a', .8, 6, 7, 2); arMote(c, d.leaves, t, w, '#fff6b0', .35, 2, -3); }},

  // ---- Lem · Ciudad Luminalia (Eléctrico): torre tecnológica. Engranajes gigantes girando, pantallas holográficas flotantes y circuitos de energía que recorren las paredes ----
  lem: {dark: .2,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 20, 20, (x, y) => (x + y) & 1 ? '#2a3244' : '#252c3c', '#10141e', .12);                               // suelo de planchas metálicas
      const cir = [];
      for(let i = 0; i < 14; i++){ const x = 4 + Math.round(i * (w - 8) / 13), y = WH + 6 + ((i * 29) % (h - WH - 12)), dir = i & 1; for(let k = 0; k < 18 + (i % 4) * 8; k++) P.alpha('#4ae0ff', .5, x + (dir ? 0 : k), y + (dir ? k : 0), 1, 1); cir.push([x, y, dir]); }   // pistas del circuito
      P.rect('#1a2030', 0, 0, w, WH); for(let x = 0; x < w; x += 14) P.alpha('#4ae0ff', .12, x, 0, 1, WH); for(let y = 6; y < WH; y += 10) P.alpha('#4ae0ff', .1, 0, y, w, 1);
      P.rect('#0a0e18', 0, WH - 4, w, 4); P.rect('#ffd84a', 0, WH - 4, w, 1);
      const scr = [[Math.round(w * .5) - 38, 4, 30, 20], [Math.round(w * .5) + 8, 6, 30, 20]];
      scr.forEach(([x, y, ww, hh]) => { arRect3(P, x, y, ww, hh, '#0e2a3a'); P.alpha('#4ae0ff', .25, x + 2, y + 2, ww - 4, hh - 4); for(let k = 0; k < 5; k++) P.rect('#9af0ff', x + 4, y + 4 + k * 3, 6 + (k * 5) % 16, 1); });
      [0, 1].forEach(sd => { const bx = sd ? w - 36 : 0; P.rect('#141a28', bx, WH - 2, 36, h - WH + 2); P.alpha('#4ae0ff', .08, bx, WH, 36, h - WH);
        for(let k = 0; k < 5; k++){ const y = WH + 8 + k * 30; arRect3(P, bx + 6, y, 24, 16, '#1c3a4a'); P.alpha('#4ae0ff', .35, bx + 8, y + 3, 20, 10); P.rect('#ffd84a', bx + 9, y + 12, 6, 1); }
        arShade(P, bx, sd, 36, WH, h); });
      arOcclude(P, w, WH); return {cir, gears: [[34, 16, 12, 10, 1], [w - 34, 14, 14, 12, -1], [Math.round(w * .5), 8, 8, 8, 1]], scr, motes: arMotes(P, 18, w, h)};
    },
    anim(c, t, d, w){
      d.gears.forEach(([x, y, r, n, dir], i) => arGear(c, x, y, r, n, t * .6 * dir + i, '#5a6a88', '#ffd84a'));
      d.cir.forEach(([x, y, dir], i) => { const k = (t * 40 + i * 9) % 36; c.fillStyle = '#e8ffff'; c.globalAlpha = .9; c.fillRect(Math.round(x + (dir ? 0 : k)), Math.round(y + (dir ? k : 0)), 2, 2); c.globalAlpha = 1; });
      d.scr.forEach(([x, y, ww, hh], i) => { c.globalAlpha = .25 + .2 * Math.sin(t * 6 + i * 3); c.fillStyle = '#9af0ff'; c.fillRect(x + 3, Math.round(y + 3 + ((t * 14) % (hh - 6))), ww - 6, 1); c.globalAlpha = 1; });
      if(Math.sin(t * 7) > .8) arBolt(c, 40, AR_WALL + 6, 66, AR_WALL + 44, Math.floor(t * 7), '#ffffff', '#ffd84a');
      arMote(c, d.motes, t, w, '#9af0ff', .6, 4, -6); }},

  // ---- Valeria · Ciudad Romantis (Hada): pasarela de moda de alta costura con aire de cuento nipón. Celosías de madera y cerezos en flor cuyos pétalos caen durante el combate ----
  valeria: {dark: .06,
    build(P, w, h, WH){
      arPlank(P, 0, WH, w, h - WH, '#e6c8b0', 14, .12);                                                                                   // pasarela de madera clara
      arSpeck(P, 0, WH, w, h - WH, 300, ['#f8e0cc', '#d8b698', '#ffffff']);
      P.rect('#f6e8dc', 0, 0, w, WH); for(let x = 0; x < w; x += 8) P.rect('#a8764a', x, 0, 1, WH - 5); for(let y = 4; y < WH - 4; y += 8) P.rect('#a8764a', 0, y, w, 1);       // celosía de madera (shoji)
      for(let x = 0; x < w; x += 40){ P.rect('#7a4e2c', x, 0, 3, WH - 4); P.alpha('#ffffff', .3, x + 1, 0, 1, WH - 4); }
      P.rect('#7a4e2c', 0, WH - 5, w, 5); P.rect('#a8764a', 0, WH - 5, w, 1);
      [[22, 0], [w - 22, 1], [Math.round(w * .5), 2]].forEach(([x, k]) => { P.rect('#4a2e22', x - 2, 8, 4, WH - 12); for(let i = 0; i < 9; i++){ const bx = x + Math.round(Math.sin(i * 2.1 + k) * 15), by = 4 + (i * 5) % 20; arEll(P, bx, by, 9 + (i % 3) * 2, 6 + (i % 2) * 2, ['#ffb8d0', '#ff9ac0', '#ffd0e0', '#ff88b4'][i % 4]); } });   // cerezos
      [0, 1].forEach(sd => { const bx = sd ? w - 40 : 0;                                                                                  // costados: biombos
        arTiles(P, bx, WH, 40, h - WH, 20, 20, (x, y) => (x + y) & 1 ? '#f4dcc8' : '#ecd0ba', '#b89478', .1);
        for(let k = 0; k < 4; k++){ const y = WH + 8 + k * 34; P.rect('#7a4e2c', bx + 6, y, 28, 26); P.rect('#f6e8dc', bx + 8, y + 2, 24, 22); for(let q = 0; q < 24; q += 6) P.rect('#a8764a', bx + 8 + q, y + 2, 1, 22); P.rect('#ff7aa8', bx + 17, y + 8, 5, 5); P.px('#ffd0e0', bx + 18, y + 9); }
        arShade(P, bx, sd, 40, WH, h); });
      const lan = [Math.round(w * .3), Math.round(w * .7)]; lan.forEach(x => { arHang(P, x, 0, 8, '#4a2e22'); arEll(P, x, 13, 6, 6, '#ff5a6a'); P.rect('#4a2e22', x - 3, 7, 6, 1); P.rect('#4a2e22', x - 3, 19, 6, 1); P.alpha('#ffffff', .4, x - 3, 10, 2, 5); });
      arOcclude(P, w, WH); return {lan, petals: Array.from({length: 40}, (_, i) => [(i * 79) % w, (i * 23) % (AR_H - 12), i / 40])};
    },
    anim(c, t, d, w){
      d.lan.forEach((x, i) => arGlowC(c, x, 13, 12 + Math.sin(t * 2 + i) * 1.5, '#ff9a8a', .3));
      arFall(c, d.petals, t, w, '#ffb8d0', .9, 8, 9, 2); arFall(c, d.petals.map(([x, y, p]) => [x + 31, y + 70, p]), t, w, '#ff88b4', .85, 6, 7, 2); }},

  // ---- Ástrid · Ciudad Anistar (Psíquico): observatorio astronómico. Suelo de cristal sobre el cosmos y un planetario con galaxias que giran, estrellas fugaces y anillos estelares ----
  astrid: {dark: .12,
    build(P, w, h, WH){
      arGradR(P, 0, WH, w, h - WH, '#14102c', '#0a0820');                                                                                 // el cosmos bajo el cristal
      for(let i = 0; i < 4; i++) arEll(P, [w * .2, w * .75, w * .5, w * .9][i], [WH + 40, WH + 90, h - 20, WH + 20][i], 44 + i * 10, 18 + i * 4, ['#5a2a9a', '#2a4aaa', '#9a2a7a', '#2a8aaa'][i], .16);   // nebulosas
      arStars(P, 0, WH, w, h - WH, 160, ['#ffffff', '#cfe0ff', '#ffe8cf', '#d8b8ff']);
      for(let x = 0; x < w; x += 28) P.alpha('#9ad8ff', .14, x, WH, 1, h - WH); for(let y = WH + 6; y < h; y += 26) P.alpha('#9ad8ff', .12, 0, y, w, 1);   // juntas del cristal
      arGradR(P, 0, 0, w, WH, '#0a0820', '#2a2060'); arStars(P, 0, 0, w, WH - 4, 70, ['#ffffff', '#cfe0ff', '#ffd8f0']);
      const mx = Math.round(w / 2);
      [[mx - 66, 14, 8, '#ff9a5a'], [mx + 64, 16, 6, '#5ac8ff']].forEach(([x, y, r, col]) => { arEll(P, x, y, r, r, col); arEll(P, x - 2, y - 2, r * .5, r * .5, arLit(col, .45), .7); arEll(P, x, y, r * 2, r * .5, '#ffe8b0', .45); });   // planetas con anillo
      P.rect('#3a3470', 0, WH - 5, w, 5); P.rect('#8a7ad8', 0, WH - 5, w, 1);                                                             // marco de la cúpula
      for(let x = 0; x < w; x += 36){ P.rect('#4a4490', x, 0, 2, WH - 5); P.alpha('#ffffff', .25, x + 2, 0, 1, WH - 5); }
      [0, 1].forEach(sd => { const bx = sd ? w - 34 : 0; P.rect('#0a0820', bx, WH, 34, h - WH); arEll(P, bx + 17, WH + 60, 14, 14, '#2a2060'); arEll(P, bx + 17, WH + 60, 28, 5, '#8a7ad8', .5); P.rect('#4a4490', bx + 15, WH + 66, 4, 60);   // telescopios
        arEll(P, bx + 17, WH + 140, 10, 10, '#3a2a80'); arEll(P, bx + 17, WH + 140, 22, 4, '#8a7ad8', .4);
        arShade(P, bx, sd, 34, WH, h); });
      arOcclude(P, w, WH); return {gal: [[mx, 16, 14], [28, 20, 8], [w - 30, 22, 9]]};
    },
    anim(c, t, d, w){
      d.gal.forEach(([x, y, r], gi) => { for(let a = 0; a < 3; a++) for(let k = 2; k < r; k++){ const an = t * .5 * (gi % 2 ? -1 : 1) + a * 2.09 + k * .22; c.globalAlpha = .75 - k / r * .5; c.fillStyle = ['#d8c8ff', '#ffd8f0', '#bfe8ff'][a]; c.fillRect(Math.round(x + Math.cos(an) * k), Math.round(y + Math.sin(an) * k * .45), 1, 1); } });
      c.globalAlpha = 1; const k = (t * .6) % 1; if(k < .35){ const x = 20 + ((t * 53) % (w - 60)) + k * 120, y = 2 + k * 40; for(let i = 0; i < 12; i++){ c.globalAlpha = 1 - i / 12; c.fillStyle = '#ffffff'; c.fillRect(Math.round(x - i * 3), Math.round(y - i * 1.2), 2, 1); } c.globalAlpha = 1; }
      for(let i = 0; i < 30; i++){ c.globalAlpha = .3 + .7 * Math.abs(Math.sin(t * 2 + i * 1.9)); c.fillStyle = '#ffffff'; c.fillRect(Math.floor((i * 97) % w), AR_WALL + 4 + (i * 53) % (AR_H - AR_WALL - 8), 1, 1); } c.globalAlpha = 1; }},

  // ---- Édel · Ciudad Fractal (Hielo): laberinto ártico bajo la ventisca. Suelo de hielo pulido que refleja el entorno, muros de bloques de hielo y, al fondo, un paisaje nevado con pinos escarchados ----
  edel: {dark: .1,
    build(P, w, h, WH){
      arGradR(P, 0, WH, w, h - WH, '#bfe4f4', '#8ac8e8');                                                                                 // hielo pulido
      for(let i = 0; i < 40; i++){ const x = (i * 71) % w, y = WH + 4 + (i * 37) % (h - WH - 8); P.alpha('#ffffff', .22, x, y, 8 + (i % 5) * 6, 1); }   // reflejos en el suelo
      arCrack(P, 40, WH + 40, 60, '#e8faff', 1, 0, .3); arCrack(P, w - 120, h - 40, 70, '#e8faff', 1, 0, .3);
      arGradR(P, 0, 0, w, WH, '#9ac8e8', '#e4f4ff');                                                                                      // cielo nevado
      for(let x = 0; x < w; x += 26){ const hh = 12 + (x * 7) % 14; for(let k = 0; k < hh; k++){ const ww = Math.round((k / hh) * 9) + 1; P.rect('#2a5a4a', x + 6 - ww / 2, WH - 8 - hh + k, ww, 1); P.alpha('#ffffff', .8, x + 6 - ww / 2, WH - 8 - hh + k, Math.max(1, ww - 2), 1); } P.rect('#4a2e22', x + 5, WH - 8, 2, 4); }   // pinos escarchados
      arEll(P, Math.round(w * .5), WH - 6, w * .6, 8, '#ffffff', .5);
      arBricks(P, 0, WH - 4, w, 6, 12, 6, '#b8e4f8', '#7ac0e0', .12);                                                                   // zócalo de bloques de hielo
      [0, 1].forEach(sd => { const bx = sd ? w - 44 : 0; arBricks(P, bx, WH - 2, 44, h - WH + 2, 14, 9, '#a8d8f0', '#6ab0d8', .14);          // muros de hielo del laberinto
        P.alpha('#ffffff', .25, bx, WH, 44, 2); for(let k = 0; k < 6; k++){ const y = WH + 10 + k * 26; P.alpha('#ffffff', .3, bx + 4 + (k * 13) % 30, y, 6, 2); }
        for(let i = 0; i < 9; i++) P.alpha('#2a6a9a', .3 * (1 - i / 9), sd ? bx - 1 - i : bx + 44 + i, WH, 1, h - WH);
        for(let k = 0; k < 4; k++) arCrystal(P, sd ? bx + 6 + k * 10 : bx + 10 + k * 8, h - 4, 12 + (k * 5) % 8, '#9ae0ff'); });
      arOcclude(P, w, WH); return {snow: Array.from({length: 90}, (_, i) => [(i * 83) % w, (i * 29) % (AR_H - 10), i / 90])};
    },
    anim(c, t, d, w){
      arFall(c, d.snow, t, w, '#ffffff', .95, 14, 22, 2); arFall(c, d.snow.map(([x, y, p]) => [x + 40, y + 20, p * .6]), t, w, '#e8f6ff', .8, 10, 16, 1);
      c.globalAlpha = .1 + .06 * Math.sin(t * 1.4); c.fillStyle = '#ffffff'; c.fillRect(0, AR_WALL, w, 1); c.globalAlpha = 1; }}
});

// =====================================================================
//  LA LIGA POKÉMON DE KALOS: Alto Mando (Malva, Narciso, Tileo, Ágata) y Campeona (Dianta)
// =====================================================================
Object.assign(ARENAS, {

  // ---- Malva · Fuego: sala de obsidiana con canales de lava, pebeteros encendidos y estandartes de llamas ----
  malva: {dark: .26,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 22, 22, (x, y) => (x + y) & 1 ? '#2a1a1c' : '#241618', '#0e0808', .1);                                // suelo de obsidiana
      for(let i = 0; i < 14; i++) arCrack(P, 24 + (i * 61) % (w - 48), WH + 6 + (i * 37) % (h - WH - 14), 22 + (i * 7) % 26, i & 1 ? '#ff6a1a' : '#ff9a3a', 1, 1, .35);   // grietas de lava
      arSpeck(P, 0, WH, w, h - WH, 300, ['#4a2a2a', '#1a0e0e', '#6a3a2a']);
      arBricks(P, 0, 0, w, WH, 14, 7, '#3a2220', '#140a0a', .15);                                                                           // pared de roca volcánica
      [[.2, '#c83a1a'], [.5, '#e8641a'], [.8, '#c83a1a']].forEach(([k, col]) => { const x = Math.round(w * k); P.rect('#1a0e0a', x - 9, 2, 18, WH - 8); P.rect(col, x - 8, 3, 16, WH - 10); for(let i = 0; i < 4; i++) P.rect('#ffd84a', x - 6 + i * 4, 6 + (i & 1) * 3, 2, 10); P.rect('#ffd84a', x - 8, 3, 16, 1); });   // estandartes
      P.rect('#14090a', 0, WH - 4, w, 4); P.rect('#ff6a1a', 0, WH - 4, w, 1);
      const fl = [];
      [0, 1].forEach(sd => { const bx = sd ? w - 40 : 0; P.rect('#14090a', bx, 0, 40, h); arBricks(P, bx, WH - 2, 40, h - WH + 2, 13, 8, '#341c1a', '#0e0606', .15);
        P.rect('#c8340a', bx + 10, WH + 16, 20, h - WH - 32); P.rect('#ff7a1a', bx + 12, WH + 18, 16, h - WH - 36); P.alpha('#ffe06a', .5, bx + 16, WH + 22, 8, h - WH - 44);   // canal de lava
        [WH + 2, h - 14].forEach(y => { P.rect('#2a2a30', bx + 14, y, 12, 8); P.rect('#6a6a76', bx + 12, y, 16, 2); fl.push([bx + 20, y]); });     // pebeteros
        arShade(P, bx, sd, 40, WH, h); });
      arPool(P, Math.round(w / 2), h - 28, 80, 22, '#ff5a1a', .08);
      arOcclude(P, w, WH); return {fl, embers: arMotes(P, 26, w, h), lava: [[10, WH + 16, 20, h - WH - 32], [w - 30, WH + 16, 20, h - WH - 32]]};
    },
    anim(c, t, d, w){
      d.lava.forEach(([x, y, ww, hh], i) => { c.globalAlpha = .18 + .12 * Math.sin(t * 3 + i); c.fillStyle = '#ffe06a'; c.fillRect(x + 2, y + ((t * 12 + i * 20) % hh), ww - 4, 3); c.globalAlpha = 1; });
      d.fl.forEach(([x, y], i) => { arFlame(c, x, y, t, i, '#ff7a1a', '#ffe06a'); arGlowC(c, x, y - 6, 14, '#ff7a1a', .22); });
      arMote(c, d.embers, t, w, '#ffb04a', .8, 3, -14); }},

  // ---- Narciso · Agua: sala-acuario con grandes peceras al fondo, luz de agua en el suelo y burbujas ----
  narciso: {dark: .16,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 22, 22, (x, y) => (x + y) & 1 ? '#2a5a8a' : '#2a6a9a', '#143a5a', .1);                                // suelo azul de azulejos
      arSpeck(P, 0, WH, w, h - WH, 400, ['#6ac0ea', '#1a4a7a', '#8adaf8']);
      arGradR(P, 0, 0, w, WH, '#1a6aa8', '#0a3a6a');                                                                                       // peceras: un solo ventanal corrido
      for(let x = 0; x < w; x += 54){ P.rect('#0e2a4a', x, 0, 3, WH - 4); P.alpha('#8adaf8', .5, x + 3, 0, 1, WH - 4); }
      for(let x = 4; x < w; x += 22) arEll(P, x + 7, WH - 7, 5, 3, ['#d8c8a0', '#e8a0b0', '#a0d0c8'][(x / 22 | 0) % 3], .8);               // corales y rocas del fondo
      P.rect('#0e2a4a', 0, WH - 4, w, 4); P.rect('#4aa8e8', 0, WH - 4, w, 1);
      const fish = Array.from({length: 9}, (_, i) => [(i * 71) % w, 6 + (i * 5) % (WH - 16), .4 + (i % 4) * .22, ['#ffb030', '#ff6a6a', '#9af0ff', '#ffe060'][i % 4]]);
      [0, 1].forEach(sd => { const bx = sd ? w - 42 : 0; P.rect('#0e2a4a', bx, WH - 2, 42, h - WH + 2); arGradR(P, bx + 4, WH + 6, 34, h - WH - 12, '#1a7ac0', '#0a4a8a'); P.rect('#8adaf8', bx + 4, WH + 6, 34, 1); P.alpha('#ffffff', .25, bx + 8, WH + 8, 2, h - WH - 18);   // peceras laterales
        for(let k = 0; k < 4; k++){ const y = WH + 20 + k * 36; arEll(P, bx + 16 + (k % 2) * 8, y, 4, 2, '#ffb030'); P.rect('#ffb030', bx + 20 + (k % 2) * 8, y, 3, 1); }
        arShade(P, bx, sd, 42, WH, h); });
      arOcclude(P, w, WH); return {fish, bub: arMotes(P, 22, w, h)};
    },
    anim(c, t, d, w){
      for(let k = 0; k < 7; k++){ const y = AR_WALL + 8 + k * 22 + Math.sin(t + k) * 4; c.globalAlpha = .1; c.fillStyle = '#d8faff'; for(let x = 0; x < w; x += 2) c.fillRect(x, Math.round(y + Math.sin(x * .09 + t * 2 + k) * 3), 2, 1); }
      c.globalAlpha = 1;
      d.fish.forEach(([x, y, sp, col], i) => { const xx = ((x + t * 14 * sp) % (w + 20)) - 10; c.fillStyle = col; c.fillRect(Math.round(xx), Math.round(y + Math.sin(t * 2 + i) * 2), 5, 2); c.fillRect(Math.round(xx) - 2, Math.round(y + Math.sin(t * 2 + i) * 2) - 1, 2, 4); });
      arMote(c, d.bub, t, w, '#d8faff', .6, 1, -10); }},

  // ---- Ágata · Acero: cámara acorazada. Planchas de acero con remaches, engranajes enormes y focos que barren la sala ----
  agata: {dark: .24,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 30, 30, (x, y) => (x + y) & 1 ? '#6a7288' : '#5e667c', '#2a3040', .22);                                 // planchas de acero
      for(let y = WH; y < h; y += 30) for(let x = 0; x < w; x += 30) [[3, 3], [24, 3], [3, 24], [24, 24]].forEach(([dx, dy]) => { P.px('#aab4cc', x + dx, y + dy); P.px('#2a3040', x + dx + 1, y + dy + 1); });   // remaches
      arSpeck(P, 0, WH, w, h - WH, 360, ['#8a92aa', '#4a5268', '#a8b2c8']);
      P.rect('#3a4258', 0, 0, w, WH); for(let x = 0; x < w; x += 18){ P.alpha('#000000', .3, x, 0, 1, WH); P.alpha('#ffffff', .12, x + 1, 0, 1, WH); } for(let y = 8; y < WH; y += 9) P.alpha('#000000', .25, 0, y, w, 1);
      P.rect('#1a2030', 0, WH - 4, w, 4); P.rect('#c8d0e8', 0, WH - 4, w, 1);
      [.25, .75].forEach(k => { const x = Math.round(w * k); P.rect('#1a2030', x - 8, 2, 16, WH - 8); P.rect('#aab4cc', x - 1, 3, 2, 22); P.rect('#aab4cc', x - 6, 12, 12, 2); P.rect('#ffd84a', x - 1, 24, 2, 2); });   // estandartes con espada
      const mx = Math.round(w / 2); arCone(P, mx - 46, 0, 8, 38, h - 6, '#d8e8ff', .1); arCone(P, mx + 46, 0, 8, 38, h - 6, '#d8e8ff', .1);
      [0, 1].forEach(sd => { const bx = sd ? w - 38 : 0; P.rect('#1a2030', bx, WH - 2, 38, h - WH + 2); arBricks(P, bx + 2, WH, 34, h - WH, 17, 10, '#4a5268', '#1a2030', .12);
        arShade(P, bx, sd, 38, WH, h); });
      arOcclude(P, w, WH); return {gears: [[24, 18, 14, 10, 1], [w - 24, 18, 14, 10, -1], [mx - 24, 20, 9, 8, -1], [mx + 24, 20, 9, 8, 1]], sw: mx};
    },
    anim(c, t, d, w){
      d.gears.forEach(([x, y, r, n, dir], i) => arGear(c, x, y, r, n, t * .35 * dir + i, '#8a94b0', '#ffd84a'));
      const sx = ((t * 40) % (w + 60)) - 30; c.globalAlpha = .12; c.fillStyle = '#ffffff'; c.fillRect(Math.round(sx), AR_WALL, 16, AR_H - AR_WALL); c.globalAlpha = 1; }},

  // ---- Tileo · Fantasma: salón encantado. Muro de piedra con ventanales ojivales y luna llena, candelabros de llama violeta, telarañas y luces que flotan ----
  tileo: {dark: .3,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 24, 24, (x, y) => (x + y) & 1 ? '#2a2238' : '#241c32', '#0e0a18', .1);                                  // suelo de losas violetas
      arSpeck(P, 0, WH, w, h - WH, 420, ['#4a3e68', '#16102a', '#5a4e78']);
      const mx = Math.round(w / 2); for(let a = 0; a < 720; a++){ const an = a * Math.PI / 360; P.alpha('#9a6aff', .12, mx + Math.cos(an) * 92, Math.round((WH + h) / 2) + Math.sin(an) * 54, 1, 1); }   // círculo mágico
      for(let i = 0; i < 9; i++) arCrack(P, 24 + (i * 67) % (w - 48), WH + 8 + (i * 41) % (h - WH - 16), 14 + (i * 5) % 18, '#3a2e58', 1, 1, .5);        // grietas
      arBricks(P, 0, 0, w, WH, 14, 7, '#2e2640', '#120e1c', .15);                                                                           // muro de piedra oscura
      [.25, .5, .75].forEach((k, n) => { const x = Math.round(w * k);                                                                      // ventanales ojivales
        P.rect('#0a0814', x - 10, 5, 20, WH - 10); arGradR(P, x - 8, 8, 16, WH - 14, n === 1 ? '#8a7ac8' : '#4a3a8a', '#1e1442'); P.rect('#0a0814', x - 1, 8, 2, WH - 14); P.rect('#0a0814', x - 8, 20, 16, 2);
        P.rect('#0a0814', x - 6, 5, 12, 3); P.px('#0a0814', x - 8, 8); P.px('#0a0814', x + 7, 8); });
      arEll(P, mx, 14, 7, 7, '#efeaff', .9); arEll(P, mx + 3, 12, 5, 5, '#8a7ac8', .6);                                                       // luna llena tras el ventanal central
      P.rect('#0e0a18', 0, WH - 4, w, 4); P.rect('#9a6aff', 0, WH - 4, w, 1);
      for(let i = 0; i < 2; i++){ const cx = i ? w - 4 : 4, dir = i ? -1 : 1; for(let k = 0; k < 18; k++){ P.alpha('#d8d0f0', .35, cx + dir * k * .9, 1 + k * .9, 1, 1); P.alpha('#d8d0f0', .35, cx + dir * k * .6, 1 + k * 1.2, 1, 1); } }   // telarañas en las esquinas
      const fl = [];
      [0, 1].forEach(sd => { const bx = sd ? w - 40 : 0; P.rect('#0c0814', bx, 0, 40, h); arBricks(P, bx, WH - 2, 40, h - WH + 2, 13, 8, '#2a2238', '#0a0612', .15);
        [WH + 8, h - 22].forEach(y => { P.rect('#1a1228', bx + 17, y + 6, 6, 18); P.rect('#6a5a98', bx + 12, y + 22, 16, 3); P.rect('#6a5a98', bx + 10, y + 6, 20, 2);       // candelabro: pie, brazo y 3 velas
          [11, 19, 27].forEach(dx => { P.rect('#e8e0f8', bx + dx - 1, y + 1, 3, 5); fl.push([bx + dx, y]); }); });
        arShade(P, bx, sd, 40, WH, h); });
      arPool(P, mx, h - 30, 80, 22, '#9a6aff', .1);
      arOcclude(P, w, WH); return {fl, wisps: arMotes(P, 26, w, h), mist: arMotes(P, 14, w, h)};
    },
    anim(c, t, d, w){
      d.fl.forEach(([x, y], i) => { arFlame(c, x, y, t, i, '#b08aff', '#f0e4ff'); arGlowC(c, x, y - 5, 12, '#9a6aff', .22); });
      arMote(c, d.wisps, t, w, '#c8b8ff', .7, 3, -9);
      arMote(c, d.mist, t, w, '#8a7ac8', .35, 6, -3); c.globalAlpha = .07 + .03 * Math.sin(t * .8); c.fillStyle = '#9a7aff'; c.fillRect(0, AR_H - 46, w, 46); c.globalAlpha = 1; }},

  // ---- Dianta · Campeona: gran salón de la Liga. Suelo de mármol con incrustaciones doradas, columnas acanaladas, lámparas de araña y ventanales ----
  dianta: {dark: .1,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 24, 24, (x, y) => (x + y) & 1 ? '#f4f0e8' : '#e8e2d6', '#c8b078', .12);                                  // suelo de mármol
      arSpeck(P, 0, WH, w, h - WH, 300, ['#ffffff', '#d8d0c0', '#c8c0b0']);
      const mx = Math.round(w / 2), ey = Math.round((WH + h) / 2) + 2;
      for(let a = 0; a < 720; a++){ const an = a * Math.PI / 360; P.alpha('#c8a040', .45, mx + Math.cos(an) * 96, ey + Math.sin(an) * 56, 1, 1); P.alpha('#c8a040', .25, mx + Math.cos(an) * 80, ey + Math.sin(an) * 47, 1, 1); }   // mosaico dorado
      P.rect('#e8dcc8', 0, 0, w, WH); arGradR(P, 0, 0, w, WH, '#f8f0e0', '#d8c8a8');
      for(let i = 0; i < 5; i++){ const x = Math.round(w * (i + .5) / 5); P.rect('#7ab0e8', x - 10, 4, 20, WH - 12); arGradR(P, x - 10, 4, 20, WH - 12, '#bfe4ff', '#7ab0e8'); P.rect('#c8a040', x - 11, 3, 22, 1); P.rect('#c8a040', x - 1, 4, 2, WH - 12); }   // ventanales
      P.rect('#c8a040', 0, WH - 4, w, 4); P.rect('#fff0a0', 0, WH - 4, w, 1);
      const lamps = [Math.round(w * .3), Math.round(w * .7)]; lamps.forEach(x => { arHang(P, x, 0, 12, '#c8a040'); P.rect('#c8a040', x - 6, 12, 13, 2); for(let k = -2; k <= 2; k++){ P.rect('#fff0a0', x + k * 3, 8, 1, 4); } arEll(P, x, 16, 5, 3, '#fff6c8', .8); });
      [0, 1].forEach(sd => { const bx = sd ? w - 40 : 0; arTiles(P, bx, WH, 40, h - WH, 20, 20, (x, y) => (x + y) & 1 ? '#e8e2d6' : '#dcd4c4', '#c8b078', .1); P.rect('#a82a30', bx + 10, WH + 4, 20, h - WH - 8); P.rect('#c8a040', bx + 10, WH + 4, 20, 1); P.rect('#c8a040', bx + 10, h - 5, 20, 1);   // alfombra roja lateral
        for(let k = 0; k < 4; k++) arFluted(P, sd ? bx + 30 : bx + 4, WH + 6 + k * 40 - (k ? 0 : 0), WH + 6 + k * 40 + 28, 6, '#f4f0e8', '#c8a040');
        arShade(P, bx, sd, 40, WH, h); });
      arOcclude(P, w, WH); return {lamps, sp: arMotes(P, 24, w, h)};
    },
    anim(c, t, d, w){
      d.lamps.forEach((x, i) => arGlowC(c, x, 15, 12 + Math.sin(t * 2 + i) * 1.5, '#fff0a0', .3));
      arMote(c, d.sp, t, w, '#fff6c8', .7, 3, -4); const k = (t * .5) % 1; c.globalAlpha = .12 * Math.sin(k * Math.PI); c.fillStyle = '#ffffff'; c.fillRect(Math.round(k * (w + 40)) - 20, AR_WALL, 14, AR_H - AR_WALL); c.globalAlpha = 1; }}
});
