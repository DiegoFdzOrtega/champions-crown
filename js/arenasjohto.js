"use strict";
/* =====================================================================
   17b) ARENAS DE JOHTO: un fondo pixel art por cada líder, miembro del Alto Mando y Campeón de Johto (13 en total).
   Inspiradas en los gimnasios y salas de Oro/Plata/Cristal y HeartGold/SoulSilver, dibujadas con código (sin imágenes), igual que las de Kanto.
   Se carga DESPUÉS de arenas.js: usa sus ayudantes (arTiles, arBricks, arSpeck, arCrack, arOcclude, arFlame, arTorch, arColumn, arRocks...) y
   añade sus arenas a ARENAS. El id de cada arena es el id del combate (pegaso, anton, blanca, morti, anibal, yasmina, fredo, debora,
   mento, j_koga, j_bruno, karen, j_lance). Cómo funciona build() / anim(): ver la cabecera de arenas.js.
   ===================================================================== */

// ---- Ayudantes nuevos ----
function arCloud(c, x, y, s, a){                                  // nube pixelada (c = contexto de dibujo)
  c.globalAlpha = a; const r = (dx, dy, w, h, col) => { c.fillStyle = col; c.fillRect(Math.floor(x + dx * s), Math.floor(y + dy * s), Math.ceil(w * s), Math.ceil(h * s)); };
  r(0, 4, 28, 5, '#ffffff'); r(4, 2, 9, 4, '#ffffff'); r(11, 0, 10, 6, '#ffffff'); r(19, 3, 9, 4, '#ffffff'); r(2, 8, 24, 2, '#c9dff2'); c.globalAlpha = 1;
}
function arWeb(P, cx, cy, r, spokes, rings, col, a){              // tela de araña vista desde arriba (ovalada)
  for(let k = 0; k < spokes; k++){ const an = k / spokes * 6.283; for(let d = 1; d < r; d++) P.alpha(col, a, cx + Math.cos(an) * d, cy + Math.sin(an) * d * .7, 1, 1); }
  for(let q = 1; q <= rings; q++){ const rr = r * q / rings;
    for(let k = 0; k < spokes; k++){ const a1 = k / spokes * 6.283, a2 = (k + 1) / spokes * 6.283;
      for(let s = 0; s <= 6; s++){ const an = a1 + (a2 - a1) * s / 6, sag = 1 - .1 * Math.sin(s / 6 * Math.PI); P.alpha(col, a * .8, cx + Math.cos(an) * rr * sag, cy + Math.sin(an) * rr * .7 * sag, 1, 1); } } }
}
const AR_CLEFAIRY = ['#.......#', '##.....##', '#########', '#########', '.#######.', '.#######.', '..#####..', '.#.###.#.', '.##...##.'];   // silueta de Clefairy (orejas, cabeza, cuerpo, pies)
function arBitmap(P, rows, x, y, s, col, a){                       // dibuja un dibujo de '#' con píxeles de s x s
  rows.forEach((row, j) => { for(let i = 0; i < row.length; i++) if(row[i] === '#') P.alpha(col, a, x + i * s, y + j * s, s, s); });
}
function arDragonHead(P, x, y, dir, base, glow){                   // cabeza de dragón de piedra mirando a la derecha (dir = 1) o a la izquierda (-1)
  const R = (dx, dy, w, h, col) => P.rect(col, x + dx * dir - (dir < 0 ? w : 0), y + dy, w, h);
  const lit = arLit(base, .25), drk = arDrk(base, .4);
  R(0, 2, 4, 3, base); R(2, 0, 4, 3, base); R(-1, 4, 3, 3, drk);                                              // cuernos
  R(2, 4, 11, 9, base); R(2, 4, 11, 2, lit); R(2, 11, 11, 2, drk);                                             // cráneo
  R(13, 6, 8, 5, base); R(13, 6, 8, 1, lit); R(13, 10, 8, 1, drk); R(19, 7, 1, 1, '#000000');                    // hocico y fosa nasal
  R(11, 11, 9, 3, drk); [12, 14, 16, 18].forEach(k => R(k, 11, 1, 2, '#e8e0d0'));                                // mandíbula y colmillos
  R(8, 6, 3, 2, glow); R(9, 6, 1, 1, '#ffffff');                                                                // ojo brillante
  R(5, 8, 5, 1, drk); R(4, 10, 4, 1, drk);                                                                      // escamas
}

Object.assign(ARENAS, {

  // ---- Pegaso · Ciudad Malva: estadio en altura de madera, con cielo, nubes y viento ----
  pegaso: {dark: .08,
    build(P, w, h, WH){
      for(let y = 0; y < WH; y++) P.rect(arMix('#4f9fe6', '#d4eeff', y / WH), 0, y, w, 1);                       // cielo
      for(let x = 0; x < w; x++){ const hh = 5 + Math.sin(x * .05) * 3 + Math.sin(x * .13) * 2; P.rect('#8fb4d4', x, WH - 8 - hh, 1, hh + 4); }   // colinas lejanas
      for(let i = 0; i < 6; i++) arCloud(P.c, 8 + i * w / 6 + (P.r() * 16 | 0), 6 + (P.r() * 12 | 0), 1, .5);       // nubes lejanas
      P.rect('#6e4524', 0, 6, w, 5); P.rect('#8a5a30', 0, 6, w, 1); P.rect('#3e2612', 0, 10, w, 1);                // gran viga horizontal
      for(let x = 14; x < w; x += 54){ P.rect('#6e4524', x, 6, 6, WH - 6); P.rect('#8a5a30', x, 6, 1, WH - 6); P.rect('#3e2612', x + 5, 6, 1, WH - 6);   // postes
        for(let k = 0; k < 9; k++){ P.px('#6e4524', x + 6 + k, 11 + k); P.px('#6e4524', x - 1 - k, 11 + k); } }     // riostras en diagonal
      P.rect('#5a3a1c', 0, WH, w, h - WH);                                                                          // tarima
      for(let y = WH, row = 0; y < h; y += 9, row++){ const off = (row * 17) % 46;
        for(let x = -off; x < w; x += 46){ const x0 = Math.max(0, x), x1 = Math.min(w, x + 45); if(x1 <= x0) continue;
          P.rect(['#a2713f', '#9a6a3a', '#8f6033', '#a87a46'][(P.r() * 4) | 0], x0, y, x1 - x0, 8); P.alpha('#ffffff', .14, x0, y, x1 - x0, 1); P.alpha('#000000', .28, x0, y + 7, x1 - x0, 1); } }
      arSpeck(P, 0, WH, w, h - WH, 220, ['#b58654', '#7a4f28']);
      [0, w - 12].forEach((x, i) => { for(let y = WH; y < h; y++) P.rect(arMix('#5aa8ee', '#dff0ff', (y - WH) / (h - WH)), x, y, 12, 1);                  // el estadio flota: a los lados solo hay cielo
        P.rect('#5a3a1c', i ? x - 4 : x + 12, WH, 4, h - WH); P.rect('#a87a46', i ? x - 4 : x + 12, WH, 1, h - WH); P.alpha('#000000', .3, i ? x - 5 : x + 16, WH, 1, h - WH); });
      P.rect('#3e2612', 0, WH - 3, w, 3); P.rect('#a06a38', 0, WH - 13, w, 2); P.rect('#7a4a24', 0, WH - 7, w, 2);   // barandilla del borde
      for(let x = 4; x < w; x += 22){ P.rect('#8a5a30', x, WH - 14, 3, 14); P.rect('#b07a44', x, WH - 14, 1, 14); }
      arOcclude(P, w, WH); return {};
    },
    anim(c, t, d, w){
      for(let i = 0; i < 5; i++){ const x = ((t * (5 + i * 2) + i * 97) % (w + 60)) - 30; arCloud(c, x, 4 + ((i * 11) % (AR_WALL - 16)), 1 + (i % 2) * .4, .85 - .1 * (i % 3)); }   // nubes que pasan
      c.fillStyle = '#ffffff'; c.globalAlpha = .17;
      for(let i = 0; i < 10; i++){ const x = ((t * (70 + i * 9) + i * 53) % (w + 30)) - 15, y = AR_WALL + 8 + ((i * 37) % 120); c.fillRect(Math.floor(x), y, 14 + (i % 3) * 6, 1); }   // rachas de viento
      c.save(); c.beginPath(); c.rect(0, AR_WALL, 12, AR_H - AR_WALL); c.rect(w - 12, AR_WALL, 12, AR_H - AR_WALL); c.clip();                  // nubes que suben por los lados
      for(let i = 0; i < 6; i++){ const y = AR_H - ((t * (7 + i) + i * 40) % (AR_H - AR_WALL + 20)) + 10; arCloud(c, i % 2 ? w - 22 : -10, y, .8, .9); }
      c.restore(); c.globalAlpha = 1; }},

  // ---- Antón · Pueblo Azalea: bosque interior con telarañas por el suelo ----
  anton: {dark: .22, side:{base:'#3a2a1a', mortar:'#1a120a'},
    build(P, w, h, WH){
      P.rect('#2b2d18', 0, WH, w, h - WH);                                                                          // suelo de tierra y hojas
      arSpeck(P, 0, WH, w, h - WH, 700, ['#3a3d1e', '#222414', '#4a4a22', '#1d2a14', '#5a3f22']);
      for(let i = 0; i < 90; i++){ const x = P.r() * w, y = WH + 3 + P.r() * (h - WH - 6); P.rect(['#2f5a22', '#3d7228', '#264a1c'][(P.r() * 3) | 0], x, y, 1, 2 + (P.r() * 2 | 0)); P.px('#55902f', x, y); }   // briznas de hierba
      for(let i = 0; i < 40; i++) P.rect(['#6b4a1e', '#7a5a22', '#8a6a2a'][(P.r() * 3) | 0], P.r() * w, WH + 3 + P.r() * (h - WH - 8), 3, 2);   // hojas secas
      [[.16, 44, 36], [.84, 100, 38], [.5, 136, 30], [.34, 78, 22], [.66, 56, 22]].forEach(([fx, dy, r], i) => arWeb(P, Math.round(w * fx), WH + dy, r, 10, 5, '#e8eef0', i < 3 ? .5 : .32));   // telarañas en el suelo
      P.rect('#183a1a', 0, 0, w, WH);                                                                               // pared de bosque
      for(let i = 0; i < w * 1.6; i++){ const x = P.r() * w, y = P.r() * (WH - 2), s = 3 + (P.r() * 5 | 0); P.rect(['#1f5226', '#256a2c', '#18441e', '#2d7a34'][(P.r() * 4) | 0], x, y, s, s - 1); }   // hojas
      for(let x = 12; x < w; x += 46){ const tx = x + (P.r() * 12 | 0); P.rect('#3e2a18', tx, 0, 7, WH); P.rect('#5a3e24', tx, 0, 2, WH); P.rect('#241608', tx + 6, 0, 1, WH);   // troncos
        for(let k = 0; k < 6; k++) P.px('#241608', tx + 1 + (k * 3) % 6, 3 + k * 5); }
      for(let i = 0; i < 24; i++){ const x = P.r() * w; for(let y = 0; y < 8 + P.r() * 14; y++) P.px('#2f8a3a', x + (y % 5 < 2 ? 1 : 0), y); }                 // lianas
      P.rect('#0f2a12', 0, WH - 5, w, 5); P.alpha('#7ad05a', .35, 0, WH - 5, w, 1);
      for(let i = 0; i < 5; i++){ const x = Math.round(w * (.1 + i * .2)); P.alpha('#fff6b0', .07, x, 0, 16, WH); P.alpha('#fff6b0', .05, x + 3, WH, 20, 30); }     // haces de luz
      arOcclude(P, w, WH);
      return {flies: Array.from({length: 14}, (_, i) => [P.r() * w, WH + 8 + P.r() * (h - WH - 30), P.r() * 6.28])};
    },
    anim(c, t, d){
      d.flies.forEach(([x, y, ph], i) => { const a = .35 + .65 * Math.max(0, Math.sin(t * 1.7 + ph * 3)); c.globalAlpha = a * .25; c.fillStyle = '#d8ff70'; c.fillRect(Math.floor(x + Math.sin(t * .6 + ph) * 14) - 1, Math.floor(y + Math.cos(t * .5 + ph) * 8) - 1, 4, 4);
        c.globalAlpha = a; c.fillStyle = '#f4ffb0'; c.fillRect(Math.floor(x + Math.sin(t * .6 + ph) * 14), Math.floor(y + Math.cos(t * .5 + ph) * 8), 2, 2); });
      c.globalAlpha = 1; }},

  // ---- Blanca · Ciudad Trigal: tarima pulida con el dibujo de Clefairy repetido, pared rosa con estrellas ----
  blanca: {dark: .1, side:{base:'#d9739b', mortar:'#8a3a5c'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 20, 20, (x, y) => (x + y) & 1 ? '#f3dccb' : '#ecd0bb', '#c9a58c', .16);               // tarima pulida
      for(let y = WH; y < h; y += 20) P.alpha('#ffffff', .1, 0, y + 5, w, 3);
      for(let ty = 0, y = WH; y < h; ty++, y += 20) for(let tx = 0, x = 0; x < w; tx++, x += 20) if(((tx + ty) & 1) === 0) arBitmap(P, AR_CLEFAIRY, x + 5, y + 5, 1, '#e88fb0', .85);   // Clefairy recortado en el suelo
      P.rect('#e08aa8', 0, 0, w, WH);                                                                               // pared rosa
      for(let x = 0; x < w; x += 18){ P.rect('#f4b3c9', x, 0, 9, WH); P.alpha('#ffffff', .15, x, 0, 1, WH); }
      for(let i = 0; i < 26; i++){ const x = P.r() * w, y = 4 + P.r() * (WH - 14); P.px('#fff3b0', x, y); P.px('#fff3b0', x - 1, y); P.px('#fff3b0', x + 1, y); P.px('#fff3b0', x, y - 1); P.px('#fff3b0', x, y + 1); }   // estrellitas
      const cx = Math.round(w / 2);
      P.rect('#8a3a5c', cx - 15, 4, 31, 26); P.rect('#fff0f5', cx - 14, 5, 29, 24); arBitmap(P, AR_CLEFAIRY, cx - 14, 8, 3, '#e88fb0', 1);   // cartel con Clefairy grande
      P.rect('#c9a227', cx - 15, 4, 31, 1); P.rect('#c9a227', cx - 15, 29, 31, 1);
      P.rect('#8a3a5c', 0, WH - 4, w, 4); P.rect('#ffd0e0', 0, WH - 4, w, 1);
      arOcclude(P, w, WH); return {};
    },
    anim(c, t, d, w){ for(let i = 0; i < 16; i++){ const a = Math.max(0, Math.sin(t * 2.2 + i * 1.9)); if(a < .5) continue;
        const x = (i * 83 + Math.floor(t * .4 + i) * 47) % w, y = AR_WALL + 6 + ((i * 59 + Math.floor(t * .4 + i) * 31) % 130); c.globalAlpha = a; c.fillStyle = '#ffffff';
        c.fillRect(x, y, 1, 3); c.fillRect(x - 1, y + 1, 3, 1); } c.globalAlpha = 1; }},

  // ---- Morti · Ciudad Iris: templo de madera oscura, pantallas de papel, niebla y espíritus ----
  morti: {dark: .22, side:{base:'#3a2820', mortar:'#150d0a'},
    build(P, w, h, WH){
      P.rect('#1f1614', 0, WH, w, h - WH);                                                                          // suelo de madera oscura
      for(let y = WH, row = 0; y < h; y += 10, row++){ const off = (row * 29) % 62;
        for(let x = -off; x < w; x += 62){ const x0 = Math.max(0, x), x1 = Math.min(w, x + 61); if(x1 <= x0) continue;
          P.rect(['#3a2b25', '#33251f', '#40302a', '#2e2220'][(P.r() * 4) | 0], x0, y, x1 - x0, 9); P.alpha('#ffffff', .06, x0, y, x1 - x0, 1); P.alpha('#000000', .35, x0, y + 9, x1 - x0, 1); } }
      arSpeck(P, 0, WH, w, h - WH, 260, ['#3d2d26', '#1a1210']);
      const cx = Math.round(w / 2), cy = WH + 72;                                                                    // círculo ritual tenue
      for(let a = 0; a < 360; a += 2){ const an = a * Math.PI / 180; P.alpha('#9a6bd8', .45, cx + Math.cos(an) * 40, cy + Math.sin(an) * 40 * .6, 1, 1); P.alpha('#9a6bd8', .3, cx + Math.cos(an) * 28, cy + Math.sin(an) * 28 * .6, 1, 1); }
      for(let k = 0; k < 6; k++){ const an = k * Math.PI / 3; for(let d = 0; d < 28; d++) P.alpha('#9a6bd8', .3, cx + Math.cos(an) * d * 1.4, cy + Math.sin(an) * d * .84, 1, 1); }
      P.rect('#2a1d19', 0, 0, w, WH);                                                                               // pared del templo
      for(let x = 0; x < w; x += 40){ P.rect('#4a2f24', x, 0, 7, WH); P.rect('#6a4434', x, 0, 1, WH); P.rect('#1a100c', x + 6, 0, 1, WH);                // pilares
        P.rect('#5a4a6a', x + 8, 5, 31, WH - 12); P.alpha('#ffffff', .1, x + 8, 5, 31, WH - 12);                                                  // papel de las puertas
        for(let k = 0; k < 31; k += 5) P.rect('#2a1d19', x + 8 + k, 5, 1, WH - 12); for(let k = 0; k < WH - 12; k += 6) P.rect('#2a1d19', x + 8, 5 + k, 31, 1); }
      P.rect('#150d0a', 0, 0, w, 5); P.rect('#6a4434', 0, 5, w, 1); P.rect('#150d0a', 0, WH - 6, w, 6); P.rect('#6a4434', 0, WH - 6, w, 1);
      const lamps = []; for(let x = 3; x < w; x += 40){ P.rect('#2a2a34', x, 7, 1, 4); P.rect('#6a4a8a', x - 3, 11, 7, 7); P.rect('#a878d8', x - 2, 12, 2, 5); lamps.push([x, 17]); }   // farolillos
      arOcclude(P, w, WH); return {lamps};
    },
    anim(c, t, d, w){
      d.lamps.forEach(([x, y], i) => arFlame(c, x, y, t, i, '#b48aff', '#f0e4ff'));
      c.fillStyle = '#cdbfe8';
      for(let i = 0; i < 8; i++){ const px = ((i * 71 + t * (4 + i)) % (w + 60)) - 30, py = AR_WALL + 12 + ((i * 41) % 110) + Math.sin(t * .7 + i) * 4;      // niebla
        c.globalAlpha = .08 + .04 * Math.sin(t + i); c.fillRect(Math.floor(px), Math.floor(py), 48, 6); c.fillRect(Math.floor(px + 8), Math.floor(py - 2), 28, 2); }
      for(let i = 0; i < 4; i++){ const x = ((t * (6 + i * 2) + i * 130) % (w + 40)) - 20, y = 80 + i * 24 + Math.sin(t * 1.2 + i) * 7;                      // espíritus
        c.globalAlpha = .2 + .08 * Math.sin(t * 2 + i); c.fillStyle = '#e0d0ff'; c.fillRect(Math.floor(x), Math.floor(y), 5, 5); c.fillRect(Math.floor(x + 1), Math.floor(y + 5), 3, 4); c.fillRect(Math.floor(x - 2), Math.floor(y + 8), 3, 2);
        c.fillStyle = '#20102f'; c.fillRect(Math.floor(x + 1), Math.floor(y + 2), 1, 1); c.fillRect(Math.floor(x + 3), Math.floor(y + 2), 1, 1); }
      c.globalAlpha = 1; }},

  // ---- Aníbal · Ciudad Orquídea: dojo de artes marciales con una cascada al fondo ----
  anibal: {dark: .14,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 40, 14, (x, y) => ((x + y) & 1) ? '#d0a066' : '#c69658', '#8a6030', .12);              // suelo de dojo pulido
      arSpeck(P, 0, WH, w, h - WH, 200, ['#dcb078', '#b88a4e']);
      const rx = Math.round(w / 2), rw = 150, ry = WH + 22, rh = 100;                                              // cuadrilátero marcado con cuerda
      [[rx - rw / 2, ry, rw, 2], [rx - rw / 2, ry + rh, rw, 2], [rx - rw / 2, ry, 2, rh], [rx + rw / 2 - 2, ry, 2, rh]].forEach(([x, y, ww, hh]) => { P.rect('#f4ead8', x, y, ww, hh); P.alpha('#000000', .25, x, y + hh - 1, ww, 1); });
      P.rect('#5a5048', 0, 0, w, WH);                                                                               // acantilado
      for(let i = 0; i < w / 3; i++){ const x = P.r() * w, y = P.r() * WH, s = 4 + (P.r() * 8 | 0); P.rect(['#6a5f56', '#7a6e64', '#54493f', '#82766a'][(P.r() * 4) | 0], x, y, s, s * .55); }
      for(let y = 6; y < WH; y += 9) P.alpha('#000000', .2, 0, y, w, 1);
      const wx = Math.round(w / 2) - 22, ww2 = 44;                                                                  // cascada
      P.rect('#2a4a6a', wx - 3, 0, ww2 + 6, WH - 2); P.rect('#4aa6e8', wx, 0, ww2, WH - 2);
      for(let x = wx + 2; x < wx + ww2; x += 5) P.rect('#8ad0f8', x, 0, 1, WH - 2);
      P.rect('#1f6aa6', 0, WH - 8, w, 8); P.rect('#4aa6e8', wx - 14, WH - 8, ww2 + 28, 8); P.alpha('#ffffff', .6, wx - 10, WH - 8, ww2 + 20, 2);   // remanso
      [0, w - 12].forEach((x, i) => { P.rect('#2a4a6a', x, WH, 12, h - WH); P.rect('#4aa6e8', i ? x + 1 : x, WH, 11, h - WH);                           // cascadas a los lados del dojo
        for(let k = 1; k < 12; k += 4) P.rect('#8ad0f8', x + k, WH, 1, h - WH); P.rect('#6a5a48', i ? x - 3 : x + 12, WH, 3, h - WH); P.alpha('#000000', .3, i ? x - 3 : x + 14, WH, 1, h - WH);
        P.alpha('#ffffff', .6, x, h - 6, 12, 2); });
      [Math.round(w * .2), Math.round(w * .8)].forEach(x => { P.rect('#a82a2a', x - 7, 6, 15, 20); P.rect('#d44a4a', x - 7, 6, 15, 2); P.rect('#f4ead8', x - 2, 11, 5, 3); P.rect('#f4ead8', x - 1, 14, 3, 6); });   // pendones rojos
      P.rect('#2a1a0c', 0, WH - 4, w, 4);
      arOcclude(P, w, WH); return {wx, ww2, w};
    },
    anim(c, t, d){
      c.fillStyle = '#e8f8ff';
      for(let i = 0; i < 24; i++){ const x = d.wx + 1 + ((i * 7) % (d.ww2 - 2)), y = (t * (46 + (i % 5) * 7) + i * 19) % (AR_WALL - 8); c.globalAlpha = .75; c.fillRect(x, Math.floor(y), 1, 5); }
      for(let k = 0; k < 2; k++) for(let i = 0; i < 16; i++){ const x = (k ? d.w - 12 : 0) + 1 + ((i * 5) % 10), y = AR_WALL + ((t * (60 + (i % 4) * 9) + i * 23) % (AR_H - AR_WALL)); c.globalAlpha = .7; c.fillRect(x, Math.floor(y), 1, 6); }   // agua cayendo por los lados
      for(let i = 0; i < 12; i++){ const a = (t * 1.5 + i * .7) % 1.2; c.globalAlpha = Math.max(0, .6 - a * .5); c.fillRect(d.wx - 8 + ((i * 11) % (d.ww2 + 16)), AR_WALL - 12 - Math.floor(a * 7), 2, 2); }     // salpicaduras
      c.globalAlpha = 1; }},

  // ---- Yasmina · Ciudad Olivo: acero pulido, tuberías, un engranaje enorme y luces de aviso ----
  yasmina: {dark: .16, side:{base:'#5b6470', mortar:'#222830'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 24, 24, (x, y) => (x + y) & 1 ? '#868e9a' : '#7d8591', '#3a3f48', .2);                // placas de acero
      for(let y = WH; y < h; y += 24) for(let x = 0; x < w; x += 24){ [[3, 3], [19, 3], [3, 19], [19, 19]].forEach(([a, b]) => { P.px('#c8d0da', x + a, y + b); P.px('#3a3f48', x + a + 1, y + b + 1); }); }
      for(let y = WH; y < h; y += 24) P.alpha('#ffffff', .07, 0, y + 8, w, 6);
      P.rect('#555e6a', 0, 0, w, WH);                                                                               // pared de acero
      for(let x = 0; x < w; x += 22){ P.rect('#626c78', x, 0, 21, WH); P.alpha('#ffffff', .12, x, 0, 21, 1); P.alpha('#000000', .3, x + 21, 0, 1, WH); }
      [9, 19, 29].forEach((y, i) => { P.rect('#2a3038', 0, y, w, 4); P.rect(i % 2 ? '#a8b2be' : '#c0cad6', 0, y, w, 1); P.rect('#6a7480', 0, y + 2, w, 1); });   // tuberías
      for(let x = 12; x < w; x += 44) for(let y = 7; y < 32; y += 10) P.px('#d8e0ea', x, y);
      const cx = Math.round(w / 2), cy = 17;                                                                         // engranaje
      for(let k = 0; k < 12; k++){ const an = k * Math.PI / 6; P.rect('#9aa4b0', cx + Math.cos(an) * 14 - 2, cy + Math.sin(an) * 14 - 2, 5, 5); }
      for(let a = 0; a < 360; a += 3){ const an = a * Math.PI / 180; for(let r = 6; r < 12; r += 1) P.px(r < 7 ? '#d0d8e2' : '#8c96a2', cx + Math.cos(an) * r, cy + Math.sin(an) * r); }
      P.rect('#2a3038', cx - 3, cy - 3, 7, 7); P.rect('#c0cad6', cx - 1, cy - 1, 3, 3);
      [8, w - 22].forEach(x => arColumn(P, x, 0, WH - 4, 14, '#9aa4b0'));
      P.rect('#2a3038', 0, WH - 4, w, 4); P.rect('#aab4c0', 0, WH - 4, w, 1);
      const leds = []; for(let x = 26; x < w - 20; x += 36) leds.push([x, WH - 9]); leds.forEach(([x, y]) => P.rect('#1a1e24', x - 1, y - 1, 5, 4));
      arOcclude(P, w, WH); return {leds};
    },
    anim(c, t, d, w){
      d.leds.forEach(([x, y], i) => { c.fillStyle = Math.sin(t * 2 + i * 2.3) > 0 ? '#5aff7a' : '#ff4a4a'; c.fillRect(x, y, 3, 2); });
      const gx = ((t * 55) % (w + 160)) - 80; c.save(); c.beginPath(); c.rect(0, AR_WALL, w, AR_H - AR_WALL); c.clip();       // brillo que barre el suelo
      c.globalAlpha = .13; c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(gx, AR_WALL); c.lineTo(gx + 30, AR_WALL); c.lineTo(gx - 20, AR_H); c.lineTo(gx - 50, AR_H); c.closePath(); c.fill();
      c.globalAlpha = .07; c.beginPath(); c.moveTo(gx + 40, AR_WALL); c.lineTo(gx + 48, AR_WALL); c.lineTo(gx, AR_H); c.lineTo(gx - 8, AR_H); c.closePath(); c.fill(); c.restore(); c.globalAlpha = 1; }},

  // ---- Fredo · Pueblo Caoba: pista de hielo cristalino rodeada de bloques helados ----
  fredo: {dark: .1, side:{base:'#7ac0e0', mortar:'#2a5a80'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 22, 18, (x, y) => ['#bfe8f7', '#b2e0f2', '#c8edfa', '#a9dbef'][(x * 5 + y * 3) % 4], '#8cc8e2', .1);   // hielo
      for(let y = WH; y < h; y += 18) P.alpha('#ffffff', .12, 0, y + 4, w, 2);
      for(let i = 0; i < 16; i++) arCrack(P, P.r() * w, WH + 4 + P.r() * (h - WH - 8), 10 + P.r() * 22, '#f4fcff', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .45);            // grietas
      for(let i = 0; i < 10; i++){ const x = P.r() * w, y = WH + 6 + P.r() * (h - WH - 12); P.alpha('#ffffff', .22, x, y, 18 + P.r() * 20, 2); }                          // reflejos
      P.rect('#24507a', 0, 0, w, WH);                                                                               // pared de cueva helada
      for(let i = 0; i < w / 2; i++){ const x = P.r() * w, y = P.r() * WH, s = 3 + (P.r() * 7 | 0); P.rect(['#2d5f8a', '#356b98', '#1f4670', '#3f78a6'][(P.r() * 4) | 0], x, y, s, s * .6); }
      for(let x = 2; x < w; x += 9 + (x * 7 % 6)){ const len = 7 + (x * 13 % 12); for(let k = 0; k < len; k++) P.rect('#dff6ff', x + Math.floor(k / 5) * .5, k + 2, Math.max(1, 3 - Math.floor(k / 4)), 1); }   // carámbanos
      P.rect('#143a5e', 0, WH - 4, w, 4); P.rect('#bfe8f7', 0, WH - 4, w, 1);
      const blocks = [[6, WH - 4, 16, 14], [26, WH - 2, 12, 11], [w - 24, WH - 5, 18, 15], [w - 42, WH - 1, 12, 10], [Math.round(w * .45), WH - 3, 14, 12]];        // bloques de hielo
      blocks.forEach(([x, y, bw, bh]) => { P.rect('#6ab8de', x, y, bw, bh); P.rect('#9fdcf4', x + 1, y + 1, bw - 3, bh - 3); P.alpha('#ffffff', .55, x + 1, y + 1, bw - 4, 1); P.alpha('#ffffff', .35, x + 1, y + 1, 1, bh - 4); P.alpha('#1f5a8a', .5, x, y + bh - 1, bw, 1); P.px('#ffffff', x + 3, y + 3); P.px('#ffffff', x + 4, y + 4); });
      [0, w - 11].forEach((x, i) => { for(let y = WH; y < h; y += 12){ const bh = 12 - ((y * 7) % 3);                                                  // bloques de hielo apilados a los lados
        P.rect('#5aa8d0', x, y, 11, bh); P.rect('#8fd0ee', i ? x + 1 : x, y + 1, 9, bh - 3); P.alpha('#ffffff', .55, x + 1, y + 1, 8, 1); P.alpha('#ffffff', .3, x + 1, y + 1, 1, bh - 4); P.alpha('#1f5a8a', .5, x, y + bh - 1, 11, 1); P.px('#ffffff', x + 3, y + 3); } });
      arOcclude(P, w, WH);
      return {sp: Array.from({length: 18}, () => [P.r() * w, AR_WALL + P.r() * (h - AR_WALL), P.r() * 6.28])};
    },
    anim(c, t, d, w){
      c.fillStyle = '#ffffff';
      for(let i = 0; i < 22; i++){ const x = ((i * 47 + t * (6 + i % 4) ) % (w + 20)) - 10, y = ((i * 31 + t * (14 + i % 5)) % (AR_H + 10)) - 5; c.globalAlpha = .55; c.fillRect(Math.floor(x), Math.floor(y), 1, 1); }     // copos
      d.sp.forEach(([x, y, ph]) => { const a = Math.max(0, Math.sin(t * 2.4 + ph * 4)); if(a > .6){ c.globalAlpha = a; c.fillRect(Math.floor(x), Math.floor(y) - 1, 1, 3); c.fillRect(Math.floor(x) - 1, Math.floor(y), 3, 1); } });   // destellos del hielo
      c.globalAlpha = 1; }},

  // ---- Débora · Ciudad Endrino: cueva de dragón con estatuas, sobre una plataforma rodeada de lava ----
  debora: {dark: .16, side:{base:'#3a2626', mortar:'#140a0a'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 22, 22, (x, y) => ['#3a2e2e', '#342929', '#403333'][(x * 5 + y * 3) % 3], '#160d0d', .1);        // plataforma de piedra
      arSpeck(P, 0, WH, w, h - WH, 260, ['#4a3a3a', '#1f1414']);
      for(let i = 0; i < 12; i++) arCrack(P, 16 + P.r() * (w - 32), WH + 14 + P.r() * (h - WH - 30), 8 + P.r() * 16, '#ff6a1a', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .4);    // grietas de lava
      P.rect('#ff7a1a', 0, WH, w, 7); P.rect('#ffb43a', 0, WH + 2, w, 2); P.rect('#5a2a14', 0, WH + 6, w, 2);                                                           // lava de arriba
      P.rect('#ff7a1a', 0, h - 10, w, 10); P.rect('#ffb43a', 0, h - 7, w, 2); P.rect('#5a2a14', 0, h - 11, w, 2);                                                       // lava de abajo
      [0, w - 14].forEach(x => { P.rect('#ff7a1a', x, WH, 14, h - WH); P.rect('#ffb43a', x + 4, WH, 3, h - WH); P.rect('#ff4a1a', x + 9, WH, 2, h - WH); P.rect('#5a2a14', x === 0 ? 14 : x - 2, WH, 2, h - WH); });      // lava de los lados
      P.rect('#241616', 0, 0, w, WH);                                                                               // pared de cueva
      for(let i = 0; i < w / 3; i++){ const x = P.r() * w, y = P.r() * WH, s = 4 + (P.r() * 9 | 0); P.rect(['#341f1f', '#3d2626', '#2a1818', '#472c2c'][(P.r() * 4) | 0], x, y, s, s * .6); }
      for(let x = 4; x < w; x += 12 + (x * 5 % 9)){ const len = 5 + (x * 11 % 12); for(let k = 0; k < len; k++) P.rect('#2a1a1a', x + Math.floor(k / 5) * .5, k, Math.max(1, 4 - Math.floor(k / 3)), 1); }     // estalactitas
      arDragonHead(P, Math.round(w * .13), 12, 1, '#6a5a52', '#ff5a1a'); arDragonHead(P, Math.round(w * .87), 12, -1, '#6a5a52', '#ff5a1a');               // estatuas de dragón
      P.rect('#ff7a1a', 0, WH - 8, w, 4); P.rect('#ffb43a', 0, WH - 8, w, 1); P.rect('#ff4a1a', 0, WH - 4, w, 4);                                                       // río de lava al pie de la pared
      arOcclude(P, w, WH);
      return {embers: Array.from({length: 22}, () => [P.r() * w, P.r() * 6.28, 4 + P.r() * 6])};
    },
    anim(c, t, d, w){
      c.fillStyle = '#ffd060';
      for(let i = 0; i < 40; i++){ const x = (i * 29 + t * 8) % w, a = Math.max(0, Math.sin(t * 2 + i * 1.3)); c.globalAlpha = a * .8; c.fillRect(Math.floor(x), AR_WALL + (i % 2 ? 2 : AR_H - AR_WALL - 8 + 0) + (i % 3), 2, 1); }      // brillos en la lava
      d.embers.forEach(([x, ph, sp], i) => { const y = AR_H - ((t * sp * 3 + ph * 20) % (AR_H - 20)); c.globalAlpha = .75; c.fillStyle = i % 2 ? '#ffb43a' : '#ff6a1a'; c.fillRect(Math.floor(x + Math.sin(t + ph) * 6), Math.floor(y), 1, 2); });   // chispas
      c.globalAlpha = 1; }},

  // ---- Mento (Will) · Liga de Johto, Psíquico: sala mística con columnas, alfombra púrpura y cristales flotantes ----
  mento: {dark: .22, side:{base:'#3a2a6a', mortar:'#120a28'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 18, 18, (x, y) => (x + y) & 1 ? '#2e2058' : '#281c4c', '#100a24', .12);
      arSpeck(P, 0, WH, w, h - WH, 140, ['#6a4ab8', '#3a2a70']);
      const cx = Math.round(w / 2), cw = 34;                                                                         // alfombra púrpura con borde dorado
      P.rect('#c9a227', cx - cw / 2 - 2, WH, cw + 4, h - WH); P.rect('#7a2fb0', cx - cw / 2, WH, cw, h - WH);
      for(let y = WH + 8; y < h; y += 22){ for(let a = 0; a < 360; a += 12){ const an = a * Math.PI / 180; P.px('#e8c33a', cx + Math.cos(an) * 8, y + Math.sin(an) * 5); } P.rect('#e8c33a', cx - 1, y - 1, 3, 3); P.rect('#5a1f88', cx - cw / 2, y + 11, cw, 1); }
      P.rect('#1a1040', 0, 0, w, WH);                                                                               // pared violeta con cortinas
      for(let x = 0; x < w; x += 16){ P.rect('#3a2a7a', x, 0, 8, WH); P.alpha('#ffffff', .08, x, 0, 2, WH); P.alpha('#000000', .3, x + 8, 0, 8, WH); }
      P.rect('#120a28', 0, 0, w, 5); P.rect('#c9a227', 0, 5, w, 1);
      for(let i = 0; i < 24; i++) P.px('#e8dcff', P.r() * w, 7 + P.r() * (WH - 14));
      for(let a = 0; a < 360; a += 3){ const an = a * Math.PI / 180; P.px('#b08aff', cx + Math.cos(an) * 12, 18 + Math.sin(an) * 9); }
      P.rect('#f0e4ff', cx - 4, 15, 9, 6); P.rect('#6a3ab0', cx - 2, 16, 5, 4); P.rect('#120a28', cx - 1, 17, 3, 2);                                          // ojo místico
      P.rect('#120a28', 0, WH - 4, w, 4); P.rect('#8a6ad8', 0, WH - 4, w, 1);
      [Math.round(w * .07), w - Math.round(w * .07) - 14, Math.round(w * .27), w - Math.round(w * .27) - 14].forEach((x, i) => arColumn(P, x, i < 2 ? 0 : 4, i < 2 ? h - 6 : WH + 6, 14, '#b8a8e8'));   // columnas
      arOcclude(P, w, WH);
      return {orbs: [[Math.round(w * .17), 26], [Math.round(w * .83), 26], [Math.round(w * .4), 22], [Math.round(w * .6), 22]]};
    },
    anim(c, t, d){
      d.orbs.forEach(([x, y], i) => { const yy = y + Math.sin(t * 1.3 + i * 1.7) * 3;
        c.globalAlpha = .18 + .06 * Math.sin(t * 2 + i); c.fillStyle = '#c99aff'; c.fillRect(Math.floor(x) - 6, Math.floor(yy) - 6, 13, 13); c.globalAlpha = .9; c.fillStyle = '#e8d8ff'; c.fillRect(Math.floor(x) - 2, Math.floor(yy) - 2, 5, 5);
        c.fillStyle = '#ffffff'; c.fillRect(Math.floor(x) - 1, Math.floor(yy) - 1, 2, 2); });
      c.globalAlpha = 1; }},

  // ---- Koga · Liga de Johto, Veneno: sala ninja en una cueva, llena de sombras ----
  j_koga: {dark: .3, side:{base:'#26222f', mortar:'#0c0a12'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 26, 16, (x, y) => ['#1c1a24', '#18161f', '#201e2a'][(x * 3 + y * 5) % 3], '#0a0910', .08);
      for(let i = 0; i < 18; i++) arCrack(P, P.r() * w, WH + 4 + P.r() * (h - WH - 8), 6 + P.r() * 14, '#08070d', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .4);
      arSpeck(P, 0, WH, w, h - WH, 160, ['#2a2736', '#121018']);
      P.rect('#14121c', 0, 0, w, WH);                                                                               // pared de cueva
      for(let i = 0; i < w / 3; i++){ const x = P.r() * w, y = P.r() * WH, s = 4 + (P.r() * 8 | 0); P.rect(['#1c1a26', '#242130', '#100f18', '#2a2638'][(P.r() * 4) | 0], x, y, s, s * .6); }
      for(let x = 3; x < w; x += 11 + (x * 3 % 8)){ const len = 5 + (x * 7 % 13); for(let k = 0; k < len; k++) P.rect('#0c0a12', x + Math.floor(k / 5) * .5, k, Math.max(1, 3 - Math.floor(k / 4)), 1); }          // estalactitas
      const cx = Math.round(w / 2);                                                                                 // shuriken grande grabado
      for(let k = -9; k <= 9; k++){ const m = Math.max(0, 3 - Math.floor(Math.abs(k) / 3)); P.alpha('#8a7aa8', .7, cx - m, 20 + k, m * 2 + 1, 1); P.alpha('#8a7aa8', .7, cx + k, 20 - m, 1, m * 2 + 1); } P.rect('#14121c', cx - 1, 19, 3, 3);
      [Math.round(w * .2), Math.round(w * .8)].forEach(x => { P.rect('#cfc8b8', x - 7, 8, 14, 20); P.rect('#a8a090', x - 7, 8, 14, 1); P.rect('#a82a2a', x - 1, 11, 3, 3); P.rect('#a82a2a', x - 1, 16, 3, 5); P.rect('#6a4a2a', x - 8, 6, 16, 2); P.rect('#6a4a2a', x - 8, 28, 16, 2); });   // pergaminos
      const lamps = []; [Math.round(w * .07), Math.round(w * .93), Math.round(w * .36), Math.round(w * .64)].forEach(x => { P.rect('#2a2a34', x - 1, 10, 3, 1); P.rect('#3a3048', x - 3, 11, 7, 8); P.rect('#6a4a98', x - 2, 12, 2, 6); lamps.push([x, 18]); });   // faroles
      P.rect('#0c0a12', 0, WH - 4, w, 4); P.rect('#3a3550', 0, WH - 4, w, 1);
      arOcclude(P, w, WH); return {lamps};
    },
    anim(c, t, d, w){
      d.lamps.forEach(([x, y], i) => arFlame(c, x, y, t, i, '#8a5ad8', '#e0ccff'));
      c.fillStyle = '#000000';
      for(let i = 0; i < 6; i++){ const x = ((t * (9 + i * 3) + i * 90) % (w + 80)) - 40, y = AR_WALL + 20 + ((i * 43) % 100) + Math.sin(t * .6 + i) * 5;                         // sombras que pasan
        c.globalAlpha = .28; c.fillRect(Math.floor(x), Math.floor(y), 46, 9); c.fillRect(Math.floor(x + 8), Math.floor(y - 4), 22, 5); c.fillRect(Math.floor(x + 14), Math.floor(y + 9), 18, 4); }
      const g = (t * .5) % 4; if(g < .2){ c.globalAlpha = 1 - g * 5; c.fillStyle = '#dfe6f0'; const gx = Math.floor((t * 37) % w), gy = AR_WALL + 30 + Math.floor((t * 17) % 90); c.fillRect(gx, gy, 5, 1); c.fillRect(gx + 2, gy - 2, 1, 5); }   // destello de un shuriken
      c.globalAlpha = 1; }},

  // ---- Bruno · Liga de Johto, Lucha: arena de roca maciza, losas enormes y rocas por todas partes ----
  j_bruno: {dark: .16, side:{base:'#6b645a', mortar:'#2a2620'},
    build(P, w, h, WH){
      P.rect('#4a443c', 0, WH, w, h - WH);
      for(let y = WH, row = 0; y < h; y += 26, row++){ const off = (row * 31) % 64;
        for(let x = -off; x < w; x += 64){ const x0 = Math.max(0, x), x1 = Math.min(w, x + 63); if(x1 <= x0) continue;
          P.rect(['#8a8174', '#7e7568', '#938a7c', '#776e62'][(P.r() * 4) | 0], x0, y, x1 - x0, 25); P.alpha('#ffffff', .12, x0, y, x1 - x0, 1); P.alpha('#000000', .28, x0, y + 24, x1 - x0, 1); P.alpha('#000000', .2, x1 - 1, y, 1, 25);
          arCrack(P, x0 + 6 + (P.r() * 40 | 0), y + 3, 10 + (P.r() * 10 | 0), '#3a342c', 0, 1, .4); } }
      arSpeck(P, 0, WH, w, h - WH, 320, ['#9a9082', '#5a5248', '#6a6256']);
      P.rect('#3a342c', 0, 0, w, WH);                                                                               // pared de roca
      for(let i = 0; i < w / 2; i++){ const x = P.r() * w, y = P.r() * WH, s = 5 + (P.r() * 10 | 0); P.rect(['#6b645a', '#5e574e', '#756d62', '#524b43'][(P.r() * 4) | 0], x, y, s, s * .65); P.alpha('#ffffff', .1, x, y, s, 1); }
      for(let i = 0; i < 6; i++){ const x = Math.round(w * (.06 + i * .175)); for(let k = 0; k < 9; k++) P.rect('#4a443c', x - 5 + Math.floor(k / 2), WH - 14 + k, 10 - k, 1); }   // picos de roca
      P.rect('#2a2620', 0, WH - 4, w, 4); P.rect('#8a8174', 0, WH - 4, w, 1);
      arRocks(P, 6, WH + 2, 4, '#8a8174'); arRocks(P, w - 34, WH + 2, 4, '#8a8174'); arRocks(P, 10, h - 20, 3, '#7e7568'); arRocks(P, w - 30, h - 20, 3, '#7e7568');   // rocas grandes
      const torches = [[Math.round(w * .28), 12], [Math.round(w * .72), 12]]; torches.forEach(([x, y]) => arTorch(P, x, y + 2, '#4a3a2a'));
      arOcclude(P, w, WH); return {torches};
    },
    anim(c, t, d, w){
      d.torches.forEach(([x, y], i) => arFlame(c, x, y + 2, t, i, '#ff9a2a', '#ffe066'));
      c.fillStyle = '#cdbfa8';
      for(let i = 0; i < 26; i++){ const x = (i * 41 + Math.sin(t * .5 + i) * 9 + t * 3) % w, y = AR_H - ((t * (5 + i % 5) + i * 13) % (AR_H - AR_WALL)); c.globalAlpha = .35; c.fillRect(Math.floor(x), Math.floor(y), 1, 1); }                // polvo
      c.globalAlpha = 1; }},

  // ---- Karen · Liga de Johto, Siniestro: sala elegante de mármol negro con ventanales a la noche ----
  karen: {dark: .34, side:{base:'#241c3a', mortar:'#0a0814'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 18, 18, (x, y) => (x + y) & 1 ? '#262434' : '#1d1b2a', '#0a0910', .1);                // mármol negro
      for(let i = 0; i < 26; i++) arCrack(P, P.r() * w, WH + 4 + P.r() * (h - WH - 8), 8 + P.r() * 18, '#6a6a88', P.r() < .5 ? 1 : 0, P.r() < .5 ? 1 : 0, .5);   // vetas plateadas
      for(let y = WH; y < h; y += 18) P.alpha('#ffffff', .04, 0, y + 6, w, 2);
      P.rect('#101428', 0, 0, w, WH);                                                                               // pared azul noche
      for(let x = 0; x < w; x += 20){ P.alpha('#ffffff', .05, x, 0, 1, WH); }
      const wins = [], n = 3;
      for(let i = 0; i < n; i++){ const x = Math.round(w * (.2 + i * .3)), ww = 26;                                  // ventanales con noche estrellada
        P.rect('#3a3050', x - ww / 2 - 2, 3, ww + 4, WH - 5); P.rect('#080c24', x - ww / 2, 5, ww, WH - 8);
        for(let k = 0; k < 14; k++){ const sx = x - ww / 2 + 1 + P.r() * (ww - 2), sy = 6 + P.r() * (WH - 12); P.px('#e8eeff', sx, sy); wins.push([sx, sy, P.r() * 6.28]); }
        P.rect('#3a3050', x, 5, 1, WH - 8); P.rect('#3a3050', x - ww / 2, 16, ww, 1);
        if(i === 1){ for(let a = 0; a < 360; a += 4){ const an = a * Math.PI / 180; P.px('#fff6c8', x + Math.cos(an) * 6 - 2, 13 + Math.sin(an) * 6); } for(let a = 0; a < 360; a += 4){ const an = a * Math.PI / 180; P.px('#080c24', x + Math.cos(an) * 5 + 1, 12 + Math.sin(an) * 5); } } }   // luna creciente
      [Math.round(w * .05), w - Math.round(w * .05) - 12].forEach(x => { P.rect('#3a1f5a', x, 0, 12, WH); P.rect('#4f2c7a', x + 2, 0, 3, WH); P.rect('#2a1440', x + 9, 0, 2, WH); P.rect('#c9a227', x, 0, 12, 1); });   // cortinas
      P.rect('#08070d', 0, WH - 4, w, 4); P.rect('#6a6a88', 0, WH - 4, w, 1);
      const flames = [];
      [Math.round(w * .1), Math.round(w * .5), Math.round(w * .9)].forEach(x => { P.rect('#2a2a38', x - 1, 20, 3, 10); P.rect('#6a6a88', x - 5, 18, 11, 2); P.rect('#6a6a88', x - 3, WH - 6, 7, 2);
        [-4, 0, 4].forEach(dx => { P.rect('#d8d4e8', x + dx, 14, 1, 4); flames.push([x + dx, 14]); }); });
      arOcclude(P, w, WH); return {flames, stars: wins};
    },
    anim(c, t, d){
      d.flames.forEach(([x, y], i) => arFlame(c, x, y, t, i, i % 2 ? '#b08aff' : '#8a5ad8', '#f0e4ff'));
      c.fillStyle = '#ffffff'; d.stars.forEach(([x, y, ph]) => { const a = Math.max(0, Math.sin(t * 1.8 + ph * 3)); if(a > .4){ c.globalAlpha = a; c.fillRect(Math.floor(x) - 1, Math.floor(y), 3, 1); c.fillRect(Math.floor(x), Math.floor(y) - 1, 1, 3); } });
      c.globalAlpha = 1; }},

  // ---- Lance · Campeón de Johto: sala del trono de los dragones ----
  j_lance: {dark: .24, side:{base:'#4a3a3a', mortar:'#1c1212'},
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 18, 18, (x, y) => (x + y) & 1 ? '#2e1c24' : '#26161c', '#120a0e', .12);               // mármol oscuro
      for(let y = WH; y < h; y += 18) P.alpha('#c9a227', .1, 0, y + 8, w, 1);
      const cx = Math.round(w / 2), cw = 34;                                                                         // alfombra roja con greca dorada
      P.rect('#c9a227', cx - cw / 2 - 2, WH, cw + 4, h - WH); P.rect('#9a1f2a', cx - cw / 2, WH, cw, h - WH);
      for(let y = WH + 7; y < h; y += 14){ P.rect('#e8c33a', cx - 5, y, 11, 1); P.rect('#e8c33a', cx - 2, y - 2, 5, 1); P.rect('#e8c33a', cx - 2, y + 2, 5, 1); P.rect('#e8c33a', cx - 1, y - 1, 3, 3); P.rect('#6a1520', cx - cw / 2, y + 7, cw, 1); }
      P.rect('#2a1c1c', 0, 0, w, WH);                                                                               // muro del trono
      arBricks(P, 0, 0, w, WH, 16, 8, '#4a3a3a', '#1c1212', .08);
      P.rect('#c9a227', 0, 3, w, 1); P.rect('#c9a227', 0, WH - 8, w, 1);
      [0, 1, 2].forEach(k => P.rect(k % 2 ? '#8a6a1a' : '#c9a227', cx - 30 + k * 4, WH - 6 + k * 2, 60 - k * 8, 2));     // escalones
      P.rect('#3a2a2a', cx - 12, 8, 24, WH - 14); P.rect('#4a3636', cx - 11, 7, 22, 3); P.rect('#6a1520', cx - 8, 12, 16, WH - 20);   // trono (respaldo y asiento)
      P.rect('#c9a227', cx - 12, 8, 24, 1); P.rect('#c9a227', cx - 12, WH - 8, 24, 1);
      for(let k = 0; k < 6; k++){ P.rect('#4a3636', cx - 22 - k * 2, 9 + k * 2, 10, 2); P.rect('#4a3636', cx + 12 + k * 2, 9 + k * 2, 10, 2); }                   // alas de dragón del respaldo
      P.rect('#e8c33a', cx - 2, 14, 5, 5); P.rect('#9a1f2a', cx - 1, 15, 3, 3);
      arDragonHead(P, Math.round(w * .1), 14, 1, '#8a7a6a', '#ffcc33'); arDragonHead(P, Math.round(w * .9), 14, -1, '#8a7a6a', '#ffcc33');                          // estatuas de dragón
      [Math.round(w * .24), Math.round(w * .76)].forEach(x => { P.rect('#9a1f2a', x - 7, 8, 14, 18); P.rect('#6a1520', x - 7, 8, 2, 18); P.rect('#c9a227', x - 7, 8, 14, 2);
        for(let k = 0; k < 4; k++) P.rect('#c9a227', x - 4 + k, 12 + k * 2, 8 - k * 2, 1); });                                                                    // estandartes
      P.rect('#1c1212', 0, WH - 4, w, 4); P.rect('#8a6a4a', 0, WH - 4, w, 1);
      [Math.round(w * .04), w - Math.round(w * .04) - 14].forEach(x => arColumn(P, x, 0, h - 6, 14, '#a8968a'));
      const torches = [Math.round(w * .36), Math.round(w * .64)].map(x => { arTorch(P, x, 14, '#5a4030'); return [x, 14]; });
      arOcclude(P, w, WH); return {torches};
    },
    anim(c, t, d){ d.torches.forEach(([x, y], i) => arFlame(c, x, y, t, i, '#ff8a2a', '#ffe066')); }}
});
