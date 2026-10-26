"use strict";
/* =====================================================================
   17e) ARENAS DE TESELIA: un fondo pixel art por cada combate de Teselia (Unova): los gimnasios (Gres, Esmalte, Porcelana, Mayólica, Fayenza, Loza, Teja y las DOS
   versiones de Caolín), el Alto Mando (Anís, Aza, Lotto, Catleya) y el Campeón Mirto. En total 14 fondos.
   Dibujadas con código (sin imágenes), igual que las de Kanto, Johto, Hoenn y Sinnoh. Se cargan DESPUÉS de arenassinnoh.js y usan sus ayudantes
   (arTiles, arBricks, arSpeck, arEll, arPool, arGlowC, arBeam, arMote, arMotes, arStars, arWeb, arCloud, arDragonHead...). Cómo funciona build() / anim(): ver la cabecera de arenas.js.

   El id de cada arena es el id del combate: gres (los tres hermanos), aloe, camus, camila, yakon, gerania, junco, iris (Blanco) e iris_negro (Negro),
   anis, aza, lotto, catleya y mirto. Qué fondo sale en cada combate lo decide floorFight() (modes.js): Gres usa 'gres' y Caolín alterna 'iris' / 'iris_negro'.

   REGLA (igual que Sinnoh): el centro del suelo (donde pelean los dos Pokémon) se deja LIMPIO; la decoración va en la pared del fondo, en las bandas de los
   lados y en el borde de arriba. El marcador tapa la parte de arriba a izquierda y derecha: lo importante se ve en el centro de arriba, en los lados y en el suelo.
   ===================================================================== */

// ---- Ayudantes nuevos (comunes a las arenas de Teselia) ----
function arDrape(P, x, y0, y1, ww, c1, c2, pleat){                                                   // cortina con pliegues (x = izquierda) y barra dorada arriba
  for(let i = 0; i < ww; i++){ const s = .5 + .5 * Math.sin(i * pleat); P.rect(arMix(c1, c2, s), x + i, y0, 1, y1 - y0); P.alpha('#000000', .18 * (1 - s), x + i, y0, 1, y1 - y0); }
  for(let i = 0; i < ww; i++){ const hy = y1 - 1 - Math.round(1.5 + 1.5 * Math.sin(i * pleat * .5)); P.rect(arDrk(c1, .45), x + i, hy, 1, y1 - hy); }
  P.rect('#e0b850', x - 1, y0 - 2, ww + 2, 2); P.rect('#fff0a0', x - 1, y0 - 2, ww + 2, 1); P.rect('#8a6a20', x - 1, y0, ww + 2, 1);
}
function arBook(P, x, y, w, h, shelf){                                                                // estante de libros (colores al azar) con tabla de madera
  P.rect(arDrk(shelf, .5), x, y, w, h); let bx = x + 1;
  while(bx < x + w - 2){ const bw = 2 + (P.r() * 2 | 0), bh = h - 3 - (P.r() * 4 | 0), col = ['#a83a2a', '#2a5a9a', '#2f7a3a', '#c8a030', '#6a3a8a', '#d8d0b8', '#8a5a2a'][(P.r() * 7) | 0];
    P.rect(col, bx, y + h - 1 - bh, bw, bh); P.alpha('#ffffff', .22, bx, y + h - 1 - bh, 1, bh); P.alpha('#000000', .25, bx + bw - 1, y + h - 1 - bh, 1, bh); bx += bw; }
  P.rect(shelf, x, y + h - 1, w, 1); P.rect(arLit(shelf, .25), x, y + h - 1, w, 1);
}
function arSteam(c, list, t, col, a){                                                                  // vaho/humo que sube (list = [x, y, fase])
  c.fillStyle = col;
  list.forEach(([x, y, ph], i) => { const k = (t * (.5 + ph * .5) + ph * 3) % 1; c.globalAlpha = a * (1 - k); const s = 1 + Math.floor(k * 3); c.fillRect(Math.round(x + Math.sin(t * 2 + i) * 2 + k * 3), Math.round(y - k * 16), s, s); });
  c.globalAlpha = 1;
}


function arHoney(P, x0, y0, w, h, r, fillFn, edge){                                                  // panal de hexágonos (flat-top) rellenos con fillFn(q, r) y borde fino
  const s3 = Math.sqrt(3);
  for(let y = y0; y < y0 + h; y++) for(let x = x0; x < x0 + w; x++){
    const q = (2 / 3 * x) / r, rr = (-x / 3 + s3 / 3 * y) / r, ss = -q - rr;
    let rq = Math.round(q), rr2 = Math.round(rr); const rs = Math.round(ss), dq = Math.abs(rq - q), dr = Math.abs(rr2 - rr), ds = Math.abs(rs - ss);
    if(dq > dr && dq > ds) rq = -rr2 - rs; else if(dr > ds) rr2 = -rq - rs;
    const cx = r * 1.5 * rq, cy = r * s3 * (rr2 + rq / 2), dx = Math.abs(x - cx), dy = Math.abs(y - cy), d = Math.max(dy / (r * s3 / 2), (s3 * dx + dy) / (s3 * r));
    P.px(d > .84 ? edge : fillFn(rq, rr2, d), x, y);
  }
}

Object.assign(ARENAS, {

  // ---- Gres · Zeo, Maíz y Millo (Ciudad Gres): el restaurante con mesas, mostrador y cocina; el combate es sobre un suelo ajedrezado entre cortinas de colores (verde, roja y azul) ----
  gres: {dark: .1,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 16, 16, (x, y) => (x + y) & 1 ? '#e6dcc4' : '#4a3229', '#2c1c16', .08);                         // suelo ajedrezado
      arSpeck(P, 0, WH, w, h - WH, 260, ['#ffffff', '#d8cdb4', '#5a4036']);
      P.rect('#dcc89c', 0, 0, w, WH); for(let x = 0; x < w; x += 12){ P.alpha('#b89860', .32, x, 0, 2, WH - 7); P.alpha('#fff0c8', .2, x + 2, 0, 1, WH - 7); }  // papel pintado con rayas
      arGradR(P, 0, 0, w, 14, '#8a6a3a', '#dcc89c');
      P.rect('#6a4228', 0, WH - 8, w, 8); P.rect('#8a5a36', 0, WH - 8, w, 1); P.rect('#4a2c1a', 0, WH - 2, w, 2);                       // zócalo de madera
      for(let x = 4; x < w; x += 14) P.alpha('#000000', .25, x, WH - 7, 1, 5);
      [['#2f9a4e', '#6ad88a', .27], ['#cf3a28', '#ff7a5a', .5], ['#2f6ad0', '#7aaaff', .73]].forEach(([c1, c2, k]) => {                  // tres cortinas, una por hermano
        const cx = Math.round(w * k); P.rect('#2a1a10', cx - 26, 0, 52, WH - 7); P.rect('#5a3a22', cx - 25, 1, 50, WH - 9); arDrape(P, cx - 23, 5, WH - 8, 21, c1, c2, .85); arDrape(P, cx + 2, 5, WH - 8, 21, c1, c2, .85);
        P.rect('#ffe9b0', cx - 2, 7, 4, WH - 16); P.alpha('#ffffff', .3, cx - 1, 7, 1, WH - 16); P.rect('#e0b850', cx - 24, 20, 5, 3); P.rect('#e0b850', cx + 19, 20, 5, 3);   // luz del escenario y recogidas
      });
      const lamps = [.14, .385, .615, .86].map(k => Math.round(w * k));                                                                  // lámparas colgantes
      lamps.forEach(x => { arHang(P, x, 0, 14, '#3a2a1a'); P.rect('#d8b050', x - 5, 14, 11, 3); P.rect('#fff0a0', x - 4, 14, 9, 1); P.rect('#ffe08a', x - 3, 17, 7, 2); arCone(P, x, 19, 8, 36, h - 6, '#ffe9a0', .09); });
      // lado izquierdo: mesas con mantel, sillas y velas
      const tables = [], steam = [], cand = [];
      [0, 1].forEach(sd => { const bx = sd ? w - 46 : 0;
        P.rect('#2a1a12', bx, WH - 6, 46, h - WH + 6); P.alpha('#8a5a36', .35, bx, WH - 6, 46, h - WH + 6); for(let y = WH; y < h; y += 8) P.alpha('#000000', .2, bx, y, 46, 1);
        if(!sd){ [[WH + 26, '#f4f0e6', '#cf3a28'], [WH + 84, '#f4f0e6', '#2f6ad0']].forEach(([ty, cl, ac]) => {                                // mesas con mantel y plato
          const tx = 6; P.rect('#3a2418', tx + 2, ty + 12, 3, 16); P.rect('#3a2418', tx + 30, ty + 12, 3, 16);
          arEll(P, tx + 18, ty + 8, 22, 9, '#000000', .25); arEll(P, tx + 18, ty + 5, 21, 8, cl); arEll(P, tx + 18, ty + 5, 21, 8, ac, .25); P.alpha('#ffffff', .5, tx + 6, ty, 22, 1);
          for(let i = 0; i < 5; i++){ const dx = tx + 6 + i * 5; P.rect(ac, dx, ty + 12, 3, 4); } arEll(P, tx + 12, ty + 5, 4, 2, '#ffffff'); arEll(P, tx + 12, ty + 5, 2, 1, '#e8d8b0');
          P.rect('#e8d8b0', tx + 22, ty - 1, 2, 5); cand.push([tx + 23, ty - 2]);
          [[-3, 6], [38, 6]].forEach(([dx, dy]) => { P.rect('#6a3a1a', tx + dx, ty + dy, 5, 10); P.rect('#8a5a2a', tx + dx, ty + dy, 5, 3); P.rect('#4a2a12', tx + dx, ty + dy + 10, 1, 8); P.rect('#4a2a12', tx + dx + 4, ty + dy + 10, 1, 8); });   // sillas
          tables.push(tx); }); }
        else {                                                                                                                              // lado derecho: mostrador y cocina
          P.rect('#5a3a22', bx + 4, WH + 6, 38, 92); P.rect('#7a5232', bx + 4, WH + 6, 38, 4); P.rect('#3a2418', bx + 4, WH + 8, 38, 1);
          for(let k = 0; k < 4; k++){ const sy = WH + 18 + k * 22; P.rect('#2a1a12', bx + 8, sy, 30, 18); P.rect('#4a3020', bx + 9, sy + 1, 28, 16); P.rect('#d8d0c0', bx + 11, sy + 12, 8, 4); P.rect('#cf3a28', bx + 23, sy + 10, 9, 6); P.rect('#e0b850', bx + 24, sy + 10, 7, 1); }
          [[bx + 12, WH + 112], [bx + 28, WH + 112]].forEach(([sx, sy]) => { P.rect('#2a2a30', sx, sy, 2, 14); P.rect('#cf3a28', sx - 3, sy - 3, 9, 4); P.rect('#ff7a5a', sx - 3, sy - 3, 9, 1); });          // taburetes
          P.rect('#8a8a96', bx + 2, WH - 20, 42, 3); [0, 1, 2].forEach(k => { const px = bx + 8 + k * 13; P.rect('#2a2a30', px, WH - 17, 1, 5); P.rect('#6a6a76', px - 4, WH - 12, 9, 5); P.rect('#9a9aa6', px - 4, WH - 12, 9, 1); steam.push([px, WH - 12, k / 3]); });   // ollas colgadas
        } });
      for(let i = 0; i < 40; i++) P.px(['#ffe9a0', '#ffffff'][i & 1], arRnd(P, 0, w), arRnd(P, WH, h));
      arOcclude(P, w, WH); return {lamps, cand, steam, motes: arMotes(P, 24, w, h)};
    },
    anim(c, t, d, w){
      d.lamps.forEach((x, i) => arGlowC(c, x, 19, 9 + Math.sin(t * 2 + i) * 1, '#ffd870', .24));
      d.cand.forEach(([x, y], i) => arFlame(c, x, y, t, i, '#ffb030', '#fff0a0'));
      arSteam(c, d.steam, t, '#ffffff', .4); arMote(c, d.motes, t, w, '#ffe9b0', .5, 2, -3); }},

  // ---- Aloe · Ciudad Esmalte: museo y biblioteca con estanterías de libros, vitrinas con fósiles y una sala de combate rodeada de decoración arqueológica ----
  aloe: {dark: .14,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 24, 24, (x, y) => (x + y) & 1 ? '#c8b08a' : '#bfa57c', '#8a7452', .1);                              // suelo de piedra arenisca
      arSpeck(P, 0, WH, w, h - WH, 520, ['#d8c29a', '#a88f66', '#8a7452']);
      const mx = Math.round(w / 2), ey = Math.round((WH + h) / 2) + 4;
      for(let a = 0; a < 720; a++){ const an = a * Math.PI / 360; [[74, 40, .22], [58, 31, .16]].forEach(([rx, ry, al]) => P.alpha('#6a4a22', al, mx + Math.cos(an) * rx, ey + Math.sin(an) * ry, 1, 1)); }    // mosaico espiral muy tenue
      for(let k = 0; k < 8; k++){ const an = k * Math.PI / 4; for(let q = 22; q < 74; q++) P.alpha('#6a4a22', .1, mx + Math.cos(an) * q, ey + Math.sin(an) * q * .54, 1, 1); }
      P.rect('#6a4a2a', 0, 0, w, WH); arGradR(P, 0, 0, w, WH, '#7a5a36', '#4a3220');                                                       // pared de madera oscura
      const shelves = [];
      for(let sec = 0; sec < 4; sec++){ const x0 = 6 + sec * Math.round((w - 12) / 4), ww = Math.round((w - 12) / 4) - 6;
        if(sec === 1 || sec === 2){ P.rect('#1a1208', x0, 4, ww, WH - 8); P.rect('#3a2a18', x0 + 1, 5, ww - 2, WH - 10); P.rect('#1a2a3a', x0 + 3, 7, ww - 6, WH - 14); P.alpha('#9ad8ff', .25, x0 + 3, 7, ww - 6, WH - 14);   // vitrina con esqueleto de fósil
          P.alpha('#ffffff', .3, x0 + 5, 8, 2, WH - 16); const fx = x0 + ww / 2, fy = WH - 12;
          if(sec === 1){ for(let k = 0; k < 7; k++){ arEll(P, fx, fy - 8, 14 - k * 2, 5 + (k > 4 ? 0 : 1), k & 1 ? '#c8b890' : '#a89a70', 1 - k * .05); } for(let k = 0; k < 8; k++) P.rect('#d8cdb0', fx - 14 + k * 4, fy - 14, 1, 11); }
          else { arEll(P, fx, fy - 9, 11, 8, '#a89a70'); arEll(P, fx, fy - 9, 8, 5, '#c8b890'); arEll(P, fx, fy - 9, 5, 3, '#a89a70'); arEll(P, fx, fy - 9, 2, 1, '#c8b890'); P.rect('#8a7a58', fx - 14, fy - 2, 28, 2); }
        } else { for(let r = 0; r < 3; r++) arBook(P, x0, 4 + r * 10, ww, 10, '#8a5a2a'); }
      }
      P.rect('#e0b850', 0, 2, w, 2); P.rect('#fff0a0', 0, 2, w, 1); P.rect('#3a2418', 0, WH - 6, w, 6); P.rect('#6a4a2a', 0, WH - 6, w, 1);
      const lamps = [.25, .5, .75].map(k => Math.round(w * k)); lamps.forEach(x => { arHang(P, x, 0, 8, '#2a1a10'); P.rect('#2a5a3a', x - 5, 8, 11, 4); P.rect('#4a9a6a', x - 5, 8, 11, 1); P.rect('#ffe08a', x - 3, 12, 7, 2); arCone(P, x, 14, 8, 40, h - 6, '#ffe9a0', .08); });
      [0, 1].forEach(sd => { const bx = sd ? w - 44 : 0;                                                                                      // lados: estanterías altas, vitrinas con huesos y columnas
        P.rect('#2a1c10', bx, WH - 6, 44, h - WH + 6); arGradR(P, bx, WH - 6, 44, h - WH + 6, '#4a3220', '#2a1c10');
        for(let r = 0; r < 5; r++) arBook(P, sd ? bx + 6 : bx + 2, WH + r * 30 - 2, 36, 12, '#8a5a2a'), P.rect('#3a2418', sd ? bx + 6 : bx + 2, WH + r * 30 + 11, 36, 4);
        arColumn(P, sd ? bx + 33 : bx + 1, WH - 8, h + 4, 10, '#d8c8a0');
      });
      for(let i = 0; i < 24; i++) P.px('#e8d8b0', arRnd(P, 0, w), arRnd(P, WH, h));
      arOcclude(P, w, WH);
      return {lamps, motes: arMotes(P, 40, w, h)};
    },
    anim(c, t, d, w){ d.lamps.forEach((x, i) => arGlowC(c, x, 12, 8 + Math.sin(t * 1.7 + i) * 1, '#ffd870', .24)); arMote(c, d.motes, t, w, '#fff2c8', .55, 2, -2); }}
});

Object.assign(ARENAS, {

  // ---- Camus · Ciudad Porcelana: gimnasio artístico blanco con cortinas translúcidas, estructuras de tela de araña y formas de panal ----
  camus: {dark: .05,
    build(P, w, h, WH){
      const tone = ['#f8f5ec', '#f2eddc', '#fbf3cf'];
      arHoney(P, 0, WH, w, h - WH, 11, (q, r) => tone[((q - r) % 3 + 3) % 3], '#e0d49a');                                                  // suelo de panal blanco-crema
      arSpeck(P, 0, WH, w, h - WH, 160, ['#ffffff', '#efe6bc']);
      arHoney(P, 0, 0, w, WH, 7, (q, r) => ['#fffdf4', '#fbf1c4', '#f4e9b0'][((q + r * 2) % 3 + 3) % 3], '#d8bf5a');                       // pared de panal dorado
      arGradR(P, 0, 0, w, 12, '#8a7a50', '#fffdf4'); P.alpha('#ffffff', .25, 0, 12, w, WH - 14);
      P.rect('#d8c88a', 0, WH - 6, w, 6); P.rect('#fff6c8', 0, WH - 6, w, 1); P.rect('#a8923a', 0, WH - 2, w, 2);                            // zócalo
      [.2, .8].forEach(k => { const cx = Math.round(w * k);                                                                                  // cortinas translúcidas (lila muy pálido)
        P.rect('#c8b8a0', cx - 17, 1, 36, 2); for(let i = 0; i < 32; i++){ const sh = .5 + .5 * Math.sin(i * .9); P.alpha(i < 16 ? '#d8c8f0' : '#d8c8f0', .28 + .3 * sh, cx - 15 + i, 3, 1, WH - 9); P.alpha('#ffffff', .25 * sh, cx - 15 + i, 3, 1, WH - 9); }
        P.alpha('#8a7ab0', .35, cx - 15, WH - 8, 32, 2); });
      const webs = [[.5, 12, 22], [.06, WH + 6, 26], [.94, WH + 6, 26], [.38, 4, 12], [.62, 4, 12]];                                         // telas de araña grandes
      webs.forEach(([k, y, r]) => arWeb(P, Math.round(w * k), y, r, 10, 4, '#8a8a9a', .55));
      P.c.fillStyle = '#9a9aaa'; P.c.globalAlpha = .4; [[.5, 0], [.06, 0], [.94, 0]].forEach(([k]) => arLine(P.c, Math.round(w * k), 0, Math.round(w * k), 9)); P.c.globalAlpha = 1;       // hilos de los que cuelgan
      const ls = [.13, .87]; ls.forEach(k => { const lx = Math.round(w * k); arHang(P, lx, 0, 6, '#8a7a50'); P.rect('#fff6c8', lx - 4, 6, 9, 3); P.rect('#f4d870', lx - 3, 9, 7, 2); });
      [0, 1].forEach(sd => { const bx = sd ? w - 40 : 0;                                                                                       // lados: columnas de panal con hilo
        arHoney(P, bx, WH - 6, 40, h - WH + 6, 6, (q, r) => ['#f4e9b0', '#e8d890', '#fbf1c4'][((q + r) % 3 + 3) % 3], '#b89a30');
        for(let i = 0; i < 18; i++) P.alpha('#000000', .32 * (1 - i / 18), sd ? bx + i : bx + 39 - i, WH, 1, h - WH);
        P.alpha('#fff6c8', .5, sd ? bx : bx + 39, WH, 1, h - WH);
        arWeb(P, sd ? bx + 6 : bx + 34, h - 40, 24, 9, 4, '#9a9aaa', .5); arWeb(P, sd ? bx + 8 : bx + 32, WH + 50, 20, 8, 3, '#9a9aaa', .45);
      });
      for(let i = 0; i < 34; i++) P.px(['#ffffff', '#fbf1c4'][i & 1], arRnd(P, 0, w), arRnd(P, WH, h));
      arOcclude(P, w, WH); return {ls: ls.map(k => Math.round(w * k)), sp: Array.from({length: 18}, () => [arRnd(P, 8, w - 8), arRnd(P, 2, h - 6), P.r()]), motes: arMotes(P, 26, w, h)};
    },
    anim(c, t, d, w){
      d.ls.forEach((x, i) => arGlowC(c, x, 9, 9 + Math.sin(t * 2 + i), '#fff0a0', .26));
      d.sp.forEach(([x, y, ph], i) => { const k = Math.sin(t * 2.2 + ph * 8 + i); if(k > .72){ c.globalAlpha = (k - .72) * 3; c.fillStyle = '#ffffff'; c.fillRect(Math.round(x), Math.round(y), 1, 1); c.fillRect(Math.round(x) - 1, Math.round(y), 3, 1); c.fillRect(Math.round(x), Math.round(y) - 1, 1, 3); c.globalAlpha = 1; } });
      arMote(c, d.motes, t, w, '#ffe890', .55, 2, -3); }},

  // ---- Camila · Ciudad Mayólica: parque de atracciones cubierto con raíles de montaña rusa, vagones, plataformas metálicas y luces de colores ----
  camila: {dark: .22,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 24, 24, (x, y) => (x + y) & 1 ? '#262a52' : '#1e2244', '#12142c', .1);                                      // suelo ajedrezado azul noche
      arSpeck(P, 0, WH, w, h - WH, 240, ['#3a4090', '#10122a', '#ffd84a']);
      arGradR(P, 0, 0, w, WH, '#0c0a22', '#241a52'); arStars(P, 0, 0, w, WH - 6, 26, ['#ffffff', '#ffe890', '#a8c8ff']);
      const ty = x => Math.round(WH - 15 - 9 * Math.sin(x * .035) - 4 * Math.sin(x * .11 + 1));                                              // raíl de la montaña rusa (ondulante)
      for(let x = 0; x < w; x += 9){ const y = ty(x); P.rect('#4a4a64', x, y + 2, 1, WH - 8 - y); if(x % 18 === 0) for(let k = 0; k < WH - 9 - y; k += 4) P.px('#6a6a88', x + (k & 4 ? 1 : 0), y + 3 + k); }           // soportes
      for(let x = 0; x < w; x++){ const y = ty(x); P.rect('#c8c8de', x, y, 1, 1); P.rect('#6a6a88', x, y + 1, 1, 1); P.rect('#c8c8de', x, y + 3, 1, 1); if(x % 4 === 0) P.rect('#8a8aa8', x, y + 1, 1, 3); }
      P.rect('#1a1a30', 0, WH - 7, w, 7); P.rect('#4a4a70', 0, WH - 7, w, 1); for(let x = 0; x < w; x += 6) P.rect(x & 4 ? '#ffd84a' : '#1a1a30', x, WH - 3, 3, 2);   // barandilla con franjas
      const cols = ['#ff4a6a', '#ffd84a', '#4ad8ff', '#8aff6a', '#c86aff'], bulbs = [];
      for(let x = 6; x < w; x += 13){ const y = 3 + Math.round(Math.sin(x * .06) * 2); bulbs.push([x, y, (x / 13 | 0) % 5]); P.rect('#3a3a4a', x - 6, y - 1, 13, 1); }          // guirnalda de bombillas
      [0, 1].forEach(sd => { const bx = sd ? w - 38 : 0;                                                                                       // lados: plataforma metálica con barandilla, remaches, escalera
        P.rect('#14162e', bx, WH - 6, 38, h - WH + 6); arGradR(P, bx, WH - 6, 38, h - WH + 6, '#2a2e58', '#14162e');
        for(let y = WH; y < h; y += 12){ P.rect('#4a4e80', bx, y, 38, 2); P.rect('#6a6ea8', bx, y, 38, 1); for(let x = 3; x < 38; x += 8) P.px('#9a9ed0', bx + x, y + 1); }
        P.rect(sd ? '#ffd84a' : '#ffd84a', sd ? bx : bx + 33, WH, 5, h - WH); for(let y = WH; y < h; y += 8) P.rect('#1a1a30', sd ? bx : bx + 33, y, 5, 4);
        for(let k = 0; k < 3; k++){ const yy = WH + 24 + k * 50; P.rect('#2a2e58', sd ? bx + 8 : bx + 6, yy, 22, 6); P.rect('#6a6ea8', sd ? bx + 8 : bx + 6, yy, 22, 1); for(let q = 0; q < 5; q++) P.rect('#6a6ea8', (sd ? bx + 9 : bx + 7) + q * 4, yy + 6, 1, 8); }
        arPool(P, sd ? bx + 40 : bx - 2, h - 30, 22, 30, sd ? '#ff4a8a' : '#4ad8ff', .12);
      });
      arPool(P, w / 2, WH + 8, 110, 12, '#8a5aff', .1);
      arOcclude(P, w, WH); return {bulbs, cols, ty, motes: arMotes(P, 30, w, h)};
    },
    anim(c, t, d, w){
      d.bulbs.forEach(([x, y, k], i) => { const on = (Math.floor(t * 3 + i) % 3) !== 0; c.fillStyle = d.cols[k]; c.globalAlpha = on ? 1 : .3; c.fillRect(x - 1, y, 3, 3); if(on) arGlowC(c, x, y + 1, 6, d.cols[k], .2); c.globalAlpha = 1; });
      [0, 1, 2].forEach(i => { const x = ((t * 36 + i * 150) % (w + 80)) - 40, y = d.ty(x) - 5; c.fillStyle = ['#ff4a6a', '#ffd84a', '#4ad8ff'][i]; c.fillRect(Math.round(x), y, 16, 4); c.fillStyle = '#ffffff'; c.fillRect(Math.round(x) + 2, y + 1, 3, 1); c.fillRect(Math.round(x) + 9, y + 1, 3, 1); c.fillStyle = '#222230'; c.fillRect(Math.round(x) + 2, y + 4, 3, 2); c.fillRect(Math.round(x) + 11, y + 4, 3, 2); });
      arMote(c, d.motes, t, w, '#ffd84a', .5, 3, -4); }},

  // ---- Yakón · Ciudad Fayenza: mina subterránea con paredes rocosas, suelo de tierra, cintas transportadoras, vagonetas y maquinaria ----
  yakon: {dark: .24,
    build(P, w, h, WH){
      arGradR(P, 0, WH, w, h - WH, '#6a4a30', '#4a3220'); arSpeck(P, 0, WH, w, h - WH, 620, ['#7a5a3a', '#3a2616', '#8a6a46', '#2a1a0e']);        // suelo de tierra
      for(let i = 0; i < 16; i++){ const x = arRnd(P, 52, w - 52), y = arRnd(P, WH + 6, h - 6); arEll(P, x, y, 7, 3, '#2a1a0e', .2); }
      for(let k = 0; k < 7; k++) P.alpha('#2a1a0e', .35, 60 + k * 50, h - 5, 22, 2);                                                           // surcos de las ruedas
      arStrata(P, 0, 0, w, WH, ['#5a4636', '#4a382a', '#6a5440', '#3a2a1e'], 3); arSpeck(P, 0, 0, w, WH, 260, ['#7a6450', '#2a1c12', '#8a7460']);
      for(let x = 14; x < w; x += 58){ P.rect('#2a1a0e', x, 0, 6, WH); P.rect('#6a4a2a', x + 1, 0, 4, WH); P.rect('#8a6a3a', x + 1, 0, 1, WH); }       // postes de madera
      P.rect('#2a1a0e', 0, 7, w, 4); P.rect('#6a4a2a', 0, 7, w, 3); P.rect('#8a6a3a', 0, 7, w, 1);                                            // viga
      P.rect('#1a1a1e', 0, WH - 12, w, 7); P.rect('#3a3a44', 0, WH - 12, w, 1); P.rect('#14141a', 0, WH - 6, w, 1);                            // cinta transportadora
      for(let x = 0; x < w; x += 24){ P.rect('#4a4a58', x, WH - 5, 3, 5); P.rect('#2a2a34', x + 1, WH - 5, 1, 5); }
      for(let i = 0; i < 9; i++){ const x = 30 + i * 44, rs = 3 + (i * 7 % 4); P.rect(['#6a6a74', '#8a6a3a', '#5a5a64'][i % 3], x, WH - 12 - rs, rs + 2, rs); }          // piedras (se mueven en anim, estas son fijas de fondo)
      const lamps = [.2, .5, .8].map(k => Math.round(w * k)); lamps.forEach(x => { arHang(P, x, 11, 17, '#1a1a1e'); P.rect('#3a3a44', x - 4, 17, 9, 3); P.rect('#ffd048', x - 3, 20, 7, 2); arCone(P, x, 21, 8, 40, h - 6, '#ffe08a', .08); });
      arRockEdge(P, w, h, WH - 6, 22, [[WH + 40, 26, 8], [h - 40, 24, 9]], '#4a3a30', '#8a7a68', '#2a1e16');
      [0, 1].forEach(sd => { const bx = sd ? w - 44 : 4;                                                                                       // maquinaria y vagonetas (sobre la roca, sin pisar el centro)
        const vy = WH + 70; P.rect('#2a2a30', bx + 2, vy + 14, 34, 3); for(let q = 0; q < 6; q++) P.rect('#1a1a1e', bx + 3 + q * 6, vy + 17, 2, 3);       // vagoneta
        P.rect('#5a5a66', bx + 4, vy, 30, 14); P.rect('#7a7a88', bx + 4, vy, 30, 2); P.rect('#3a3a44', bx + 4, vy + 12, 30, 2); [0, 1, 2, 3].forEach(q => P.rect('#3a3a44', bx + 8 + q * 7, vy + 2, 1, 10));
        for(let q = 0; q < 10; q++){ const ox = bx + 5 + q * 3; P.rect(['#ff7a2a', '#7ad8ff', '#8a8a96', '#ffd048', '#c86aff'][q % 5], ox, vy - 3 - (q % 3), 3, 3 + (q % 3)); }
        P.rect('#2a2a30', bx + 6, vy + 14, 6, 6); P.rect('#2a2a30', bx + 26, vy + 14, 6, 6); P.rect('#6a6a78', bx + 8, vy + 16, 2, 2); P.rect('#6a6a78', bx + 28, vy + 16, 2, 2);
        const my = WH + 118; P.rect('#8a5a1a', bx + 2, my, 38, 22); P.rect('#c88a2a', bx + 2, my, 38, 3); P.rect('#4a2e0a', bx + 2, my + 19, 38, 3); P.rect('#1a1a1e', bx + 8, my + 7, 12, 8); P.rect('#ffd048', bx + 28, my + 6, 6, 6);   // caldera/máquina
        for(let q = 0; q < 4; q++) P.rect('#1a1a1e', bx + 4 + q * 9, my - 8, 3, 8);
        arRocks(P, sd ? bx - 2 : bx + 38, h - 12, 5, '#5a4a3a'); });
      for(let i = 0; i < 40; i++) P.px(['#ffd048', '#ffffff', '#c88a2a'][i % 3], arRnd(P, 0, w), arRnd(P, WH, h));
      arOcclude(P, w, WH);
      return {lamps, gears: [[Math.round(w * .35), 22, 6], [Math.round(w * .65), 22, -5]], dust: arMotes(P, 40, w, h)};
    },
    anim(c, t, d, w){
      d.lamps.forEach((x, i) => arGlowC(c, x, 21, 8 + Math.sin(t * 1.5 + i), '#ffd070', .26));
      d.gears.forEach(([x, y, sp], i) => arGear(c, x, y, 7, 8, t * sp * .3, '#5a5a66', '#2a2a30'));
      c.fillStyle = '#6a6a74'; for(let i = 0; i < 12; i++){ const x = ((i * 40 + t * 30) % (w + 20)) - 10; c.fillRect(Math.round(x), 28, 3, 2); c.fillRect(Math.round(x) + 6, 27, 2, 3); }   // pedruscos sobre la cinta
      arMote(c, d.dust, t, w, '#b89a70', .45, 2, -2); }},

  // ---- Gerania · Ciudad Loza: hangar aeroportuario con plataformas elevadas, estructuras metálicas, grandes ventanales y elementos de aviación ----
  gerania: {dark: .08,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 32, 32, (x, y) => (x + y) & 1 ? '#8a909c' : '#818794', '#5a606c', .1); arSpeck(P, 0, WH, w, h - WH, 320, ['#a0a6b2', '#6a707c', '#b8bec8']);   // suelo de hormigón
      for(let x = 0; x < w; x += 20) P.alpha('#ffd84a', .5, x + 4, h - 7, 12, 2);                                                               // línea amarilla discontinua de rodaje
      P.rect('#a8aebb', 0, 0, w, WH); for(let x = 0; x < w; x += 6){ P.alpha('#ffffff', .22, x, 0, 1, WH - 6); P.alpha('#000000', .2, x + 3, 0, 1, WH - 6); }      // chapa ondulada
      const wins = [.2, .5, .8].map(k => Math.round(w * k));
      wins.forEach(cx => { P.rect('#3a4050', cx - 36, 3, 72, WH - 10); arGradR(P, cx - 34, 5, 68, WH - 14, '#5aa8f0', '#d4ecff'); P.rect('#3a4050', cx - 1, 5, 2, WH - 14); P.rect('#3a4050', cx - 34, 17, 68, 1); });
      for(let x = -10; x < w; x += 44){ for(let k = 0; k < 18; k++){ P.rect('#4a5060', x + k * 2, 2 + k * 1.2, 2, 2); P.rect('#4a5060', x + 36 - k * 2, 2 + k * 1.2, 2, 2); } }    // cerchas diagonales
      P.rect('#4a5060', 0, 0, w, 3); P.rect('#6a7080', 0, 0, w, 1);
      P.rect('#3a4050', 0, WH - 6, w, 6); for(let x = 0; x < w; x += 8) P.rect(x & 8 ? '#ffd84a' : '#2a2a30', x, WH - 5, 4, 3);                    // franjas de peligro
      const lamps = [.1, .35, .65, .9].map(k => Math.round(w * k)); lamps.forEach(x => { arHang(P, x, 3, 11, '#2a2a30'); P.rect('#3a4050', x - 6, 11, 13, 3); P.rect('#fff6c8', x - 5, 14, 11, 2); arCone(P, x, 16, 9, 40, h - 6, '#ffffff', .07); });
      [0, 1].forEach(sd => { const bx = sd ? w - 46 : 0;                                                                                         // plataforma elevada con rejilla, barandilla y escalera
        P.rect('#3a4050', bx, WH - 6, 46, h - WH + 6); arGradR(P, bx, WH - 6, 46, h - WH + 6, '#5a6070', '#3a4050');
        for(let y = WH; y < h; y += 4) P.alpha('#000000', .22, bx, y, 46, 1); for(let x = 0; x < 46; x += 4) P.alpha('#000000', .15, bx + x, WH, 1, h - WH);
        const ex = sd ? bx : bx + 40; P.rect('#ffd84a', ex, WH, 6, h - WH); for(let y = WH; y < h; y += 8) P.rect('#2a2a30', ex, y, 6, 4);
        for(let q = 0; q < 6; q++){ const px = bx + (sd ? 6 : 2) + q * 6; P.rect('#d8d8e0', px, WH + 1, 2, 10); } P.rect('#e8e8f0', bx + (sd ? 6 : 2), WH + 1, 32, 2);   // barandilla
        for(let q = 0; q < 3; q++){ const yy = WH + 40 + q * 38; if(sd){ P.rect('#cf3a28', bx + 8, yy, 12, 18); P.rect('#ff6a4a', bx + 8, yy, 12, 2); P.rect('#2a2a30', bx + 8, yy + 8, 12, 2); } else { P.rect('#2a2a30', bx + 6, yy + 4, 14, 14); P.rect('#4a4a56', bx + 8, yy + 6, 10, 10); P.rect('#6a6a76', bx + 11, yy + 9, 4, 4); } }   // bidones / neumáticos
        P.rect('#cf3a28', sd ? bx + 28 : bx + 4, WH + 130, 12, 12); P.rect('#ffffff', sd ? bx + 30 : bx + 6, WH + 134, 8, 3);
      });
      for(let i = 0; i < 26; i++) P.px('#ffffff', arRnd(P, 0, w), arRnd(P, WH, h));
      arOcclude(P, w, WH); return {wins, lamps, mt: arMotes(P, 18, w, h)};
    },
    anim(c, t, d, w){
      d.wins.forEach((cx, i) => { c.save(); c.beginPath(); c.rect(cx - 34, 5, 68, AR_WALL - 14); c.clip(); arCloud(c, cx - 30 + ((t * 5 + i * 20) % 90) - 10, 14 + (i & 1) * 4, 1, .9); arCloud(c, cx + ((t * 3 + i * 40) % 90) - 44, 10, 1, .8); c.restore(); });
      d.lamps.forEach((x, i) => arGlowC(c, x, 16, 8 + Math.sin(t * 1.5 + i), '#ffffff', .2));
      const on = Math.sin(t * 5) > 0; c.fillStyle = '#ff3a3a'; c.globalAlpha = on ? 1 : .25; c.fillRect(3, 4, 3, 3); c.fillRect(w - 7, 4, 3, 3); c.globalAlpha = 1;
      arMote(c, d.mt, t, w, '#ffffff', .35, 1, -1); }}
});

Object.assign(ARENAS, {

  // ---- Junco · Ciudad Teja: cueva helada con suelo resbaladizo, bloques de hielo, paredes congeladas y tonos azules y blancos ----
  junco: {dark: .1,
    build(P, w, h, WH){
      arGradR(P, 0, WH, w, h - WH, '#c8ecfa', '#92c8e8');                                                                                      // suelo de hielo liso
      for(let i = 0; i < 26; i++){ const x = arRnd(P, 20, w - 20), y = arRnd(P, WH + 4, h - 4), l = 14 + (P.r() * 30 | 0); for(let k = 0; k < l; k++) P.alpha('#ffffff', .22 * (1 - k / l), x + k, y - k * .35, 1, 1); }   // brillos de hielo pulido
      arSpeck(P, 0, WH, w, h - WH, 200, ['#ffffff', '#7ab4dc', '#e8f8ff']);
      for(let i = 0; i < 9; i++){ const sd = i & 1; arCrack(P, sd ? w - 46 - (P.r() * 22 | 0) : 46 + (P.r() * 22 | 0), arRnd(P, WH + 10, h - 10), 18 + (P.r() * 24 | 0), '#5a98c8', sd ? -1 : 1, P.r() < .5 ? -1 : 1, .4); }   // grietas por los lados
      arStrata(P, 0, 0, w, WH, ['#cfeefa', '#b4dff4', '#e8f8ff', '#9acaec'], 3); arSpeck(P, 0, 0, w, WH, 140, ['#ffffff', '#7ab4dc']);       // pared helada
      for(let x = 6; x < w; x += 11){ const l = 6 + ((x * 7) % 11); for(let k = 0; k < l; k++){ const wi = Math.max(1, 4 - (k * 4 / l | 0)); P.rect(k < 2 ? '#ffffff' : '#c8ecfa', x - (wi >> 1), k, wi, 1); P.px('#7ab4dc', x + (wi >> 1), k); } }   // carámbanos
      arCrystal(P, Math.round(w * .3), WH - 2, 13, '#8adcff'); arCrystal(P, Math.round(w * .7), WH - 2, 12, '#aaf0ff'); arCrystal(P, Math.round(w * .5), WH - 2, 9, '#8adcff');
      P.rect('#6aa4d0', 0, WH - 4, w, 4); P.rect('#e8f8ff', 0, WH - 4, w, 1);
      arRockEdge(P, w, h, WH - 6, 22, [[WH + 36, 24, 9], [h - 46, 26, 10]], '#9ccce8', '#f0fbff', '#5a90c0');                                    // paredes de hielo a los lados
      [0, 1].forEach(sd => { const bx = sd ? w - 42 : 4;                                                                                       // bloques de hielo apilados
        [[0, 70, 24, 22], [8, 48, 18, 22], [22, 62, 16, 12], [-2, 128, 30, 26], [12, 108, 18, 20]].forEach(([dx, dy, bw, bh]) => { const x = sd ? bx + 10 - dx : bx + dx, y = WH + dy;
          P.rect('#5a90c0', x, y, bw, bh); P.rect('#bfe8fa', x + 1, y + 1, bw - 2, bh - 2); P.rect('#ffffff', x + 1, y + 1, bw - 2, 2); P.alpha('#ffffff', .5, x + 2, y + 3, 2, bh - 6); P.alpha('#5a90c0', .45, x + bw - 5, y + 3, 4, bh - 5); P.px('#ffffff', x + bw - 4, y + 5); });
      });
      arPool(P, w * .5, WH + 14, 90, 10, '#e8f8ff', .18);
      arOcclude(P, w, WH); return {cr: [[Math.round(w * .3), WH - 12], [Math.round(w * .7), WH - 11], [Math.round(w * .5), WH - 8]], snow: arMotes(P, 46, w, h), sp: Array.from({length: 22}, () => [arRnd(P, 10, w - 10), arRnd(P, WH + 4, h - 4), P.r()])};
    },
    anim(c, t, d, w){
      d.cr.forEach(([x, y], i) => arGlowC(c, x, y, 8 + Math.sin(t * 2 + i) * 1.5, '#aaf0ff', .26));
      d.sp.forEach(([x, y, ph], i) => { const k = Math.sin(t * 2 + ph * 9 + i); if(k > .75){ c.globalAlpha = (k - .75) * 4; c.fillStyle = '#ffffff'; c.fillRect(Math.round(x) - 1, Math.round(y), 3, 1); c.fillRect(Math.round(x), Math.round(y) - 1, 1, 3); c.globalAlpha = 1; } });
      arMote(c, d.snow, t, w, '#ffffff', .75, 3, 9); }},

  // ---- Iris · Ciudad Caolín (Blanco): gimnasio de arquitectura oriental tradicional, suelo de madera, tejados curvos, estatuas y decoración de dragones ----
  iris: {dark: .1,
    build(P, w, h, WH){
      arPlank(P, 0, WH, w, h - WH, '#a8743e', 9, .22); arSpeck(P, 0, WH, w, h - WH, 160, ['#c89058', '#6a4422']);                                // suelo de madera
      for(let a = 0; a < 640; a++){ const an = a * Math.PI / 320; P.alpha('#f0c878', .1, w / 2 + Math.cos(an) * 90, (WH + h) / 2 + 2 + Math.sin(an) * 50, 1, 1); }                    // aro tenue en el suelo
      P.rect('#8a1a18', 0, 0, w, WH); for(let x = 0; x < w; x += 4) P.alpha('#000000', .12, x, 0, 1, WH);                                      // pared roja lacada
      [.22, .5, .78].forEach(k => { const cx = Math.round(w * k), ww = k === .5 ? 76 : 48;                                                     // paneles shoji con dragón dorado
        P.rect('#3a1410', cx - ww / 2 - 2, 10, ww + 4, WH - 17); P.rect('#f2e6c4', cx - ww / 2, 12, ww, WH - 21); for(let x = 0; x <= ww; x += 8) P.rect('#6a3a22', cx - ww / 2 + x, 12, 1, WH - 21); for(let y = 12; y < WH - 9; y += 8) P.rect('#6a3a22', cx - ww / 2, y, ww, 1);
        if(k === .5){ arRing(P, cx, 20, 12, 9, '#d8a830', .9); arRing(P, cx, 20, 9, 7, '#d8a830', .6); arBitmap(P, ['..###..', '.#...#.', '#..#..#', '#.###.#', '#..#..#', '.#...#.', '..###..'], cx - 7, 16, 2, '#d8a830', .9); } });
      for(let x = 0; x < w; x++){ const e = Math.round(8 - 4 * Math.pow(Math.abs(((x % 120) / 120) - .5) * 2, 1.6)); P.rect('#2a3a52', x, 0, 1, e); P.rect('#3e5272', x, e - 1, 1, 1); if(x % 6 === 0) P.rect('#1a2638', x, 0, 1, e); }   // tejado curvo de tejas
      P.rect('#d8a830', 0, 9, w, 1); P.rect('#6a1210', 0, 10, w, 2);
      [.07, .36, .64, .93].forEach(k => { const x = Math.round(w * k) - 3; P.rect('#b02a20', x, 11, 7, WH - 11); P.rect('#d8483a', x + 1, 11, 2, WH - 11); P.rect('#6a1210', x + 5, 11, 2, WH - 11); P.rect('#d8a830', x - 1, 11, 9, 2); });   // pilares rojos
      const lan = [.15, .85, .43, .57].map(k => Math.round(w * k)); lan.forEach((x, i) => { const y = 14 + (i > 1 ? 4 : 0); arHang(P, x, 10, y, '#3a2a1a'); P.rect('#d8a830', x - 4, y, 9, 1); P.rect('#d0301c', x - 4, y + 1, 9, 6); P.rect('#ff6a4a', x - 3, y + 2, 2, 4); P.rect('#d8a830', x - 4, y + 7, 9, 1); });
      arDragonHead(P, Math.round(w * .5) - 60, 22, -1, '#c8b890', '#ffd84a'); arDragonHead(P, Math.round(w * .5) + 60, 22, 1, '#c8b890', '#ffd84a');
      [0, 1].forEach(sd => { const bx = sd ? w - 42 : 0;                                                                                       // lados: celosía, estatua de dragón en pedestal y escalón de piedra
        P.rect('#3a1410', bx, WH - 6, 42, h - WH + 6); arGradR(P, bx, WH - 6, 42, h - WH + 6, '#6a1e18', '#3a1410');
        for(let y = WH; y < h; y += 14){ P.rect('#d8a830', bx, y, 42, 1); } for(let x = 0; x < 42; x += 14) P.rect('#d8a830', bx + x, WH, 1, h - WH);
        P.rect('#c8b890', sd ? bx + 6 : bx + 4, WH + 62, 32, 8); P.rect('#e8dcb8', sd ? bx + 6 : bx + 4, WH + 62, 32, 2); P.rect('#8a7a58', sd ? bx + 6 : bx + 4, WH + 68, 32, 2);
        arDragonHead(P, sd ? bx + 32 : bx + 10, WH + 46, sd ? -1 : 1, '#c8b890', '#ffd84a');
        P.rect('#c8b890', sd ? bx + 6 : bx + 4, WH + 140, 32, 8); P.rect('#e8dcb8', sd ? bx + 6 : bx + 4, WH + 140, 32, 2); arDragonHead(P, sd ? bx + 32 : bx + 10, WH + 124, sd ? -1 : 1, '#c8b890', '#ffd84a');
        for(let i = 0; i < 14; i++) P.alpha('#000000', .3 * (1 - i / 14), sd ? bx + i : bx + 41 - i, WH, 1, h - WH);
      });
      arOcclude(P, w, WH); return {lan, motes: arMotes(P, 24, w, h)};
    },
    anim(c, t, d, w){ d.lan.forEach((x, i) => arGlowC(c, x, 19 + (i > 1 ? 4 : 0), 8 + Math.sin(t * 1.8 + i) * 1, '#ff7a3a', .3)); arMote(c, d.motes, t, w, '#ffd890', .5, 2, -2); }},

  // ---- Iris · Ciudad Caolín (Negro): gimnasio moderno con plataformas mecánicas, estructuras metálicas y ambientación tecnológica de dragones ----
  iris_negro: {dark: .2,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 24, 24, (x, y) => (x + y) & 1 ? '#222834' : '#1c212c', '#0c0f16', .1);                                      // suelo de metal oscuro
      for(let x = 0; x < w; x += 24) P.alpha('#4adcff', .22, x, WH, 1, h - WH); for(let y = WH; y < h; y += 24) P.alpha('#4adcff', .22, 0, y, w, 1);   // rejilla luminosa
      arSpeck(P, 0, WH, w, h - WH, 160, ['#4adcff', '#a86aff', '#10131b']);
      P.rect('#14181f', 0, 0, w, WH); for(let x = 0; x < w; x += 20){ P.rect('#222834', x + 1, 2, 18, WH - 8); P.rect('#3a4254', x + 1, 2, 18, 1); P.rect('#0c0f16', x + 19, 2, 1, WH - 8); }   // paneles
      [.2, .5, .8].forEach(k => { const cx = Math.round(w * k), ww = k === .5 ? 70 : 44;                                                       // pantallas con dragón holográfico
        P.rect('#0c0f16', cx - ww / 2 - 2, 4, ww + 4, WH - 12); arGradR(P, cx - ww / 2, 6, ww, WH - 16, '#0a2a44', '#0a1a30');
        for(let y = 7; y < WH - 10; y += 3) P.alpha('#4adcff', .12, cx - ww / 2, y, ww, 1);
        arDragonHead(P, cx - (k === .5 ? 12 : 10), 9, 1, '#2a9ac8', '#a8ffff'); });
      P.rect('#0c0f16', 0, WH - 6, w, 6); for(let x = 0; x < w; x += 12) P.rect('#a86aff', x, WH - 4, 6, 1);
      const pipes = [.08, .35, .65, .92].map(k => Math.round(w * k)); pipes.forEach(x => { P.rect('#3a4254', x - 2, 0, 5, WH - 6); P.rect('#6a7490', x - 2, 0, 1, WH - 6); P.rect('#14181f', x + 2, 0, 1, WH - 6); for(let y = 6; y < WH - 8; y += 10) P.rect('#4adcff', x - 3, y, 7, 1); });
      [0, 1].forEach(sd => { const bx = sd ? w - 42 : 0;                                                                                       // lados: plataformas mecánicas con luces y estructura metálica
        P.rect('#10131b', bx, WH - 6, 42, h - WH + 6); arGradR(P, bx, WH - 6, 42, h - WH + 6, '#262c3a', '#10131b');
        for(let k = 0; k < 4; k++){ const yy = WH + 8 + k * 40, x = sd ? bx + 4 : bx + 2; P.rect('#0c0f16', x, yy, 36, 14); P.rect('#3a4254', x + 1, yy + 1, 34, 8); P.rect('#6a7490', x + 1, yy + 1, 34, 1); P.rect('#4adcff', x + 2, yy + 11, 32, 1); P.alpha('#4adcff', .25, x + 2, yy + 12, 32, 3); for(let q = 0; q < 4; q++) P.rect('#14181f', x + 4 + q * 8, yy + 3, 5, 4); }
        for(let i = 0; i < 14; i++) P.alpha('#000000', .35 * (1 - i / 14), sd ? bx + i : bx + 41 - i, WH, 1, h - WH);
        P.rect('#a86aff', sd ? bx : bx + 41, WH, 1, h - WH);
      });
      arPool(P, w / 2, WH + 10, 100, 10, '#4adcff', .1);
      arOcclude(P, w, WH); return {pipes, gears: [[Math.round(w * .5) - 44, h - 14], [Math.round(w * .5) + 44, h - 14]], motes: arMotes(P, 36, w, h)};
    },
    anim(c, t, d, w){
      d.pipes.forEach((x, i) => { const y = ((t * 20 + i * 11) % (AR_WALL - 8)); c.fillStyle = '#a8ffff'; c.globalAlpha = .8; c.fillRect(x, Math.round(y), 1, 3); c.globalAlpha = 1; });
      d.gears.forEach(([x, y], i) => arGear(c, x, y, 8, 8, t * (i ? -.6 : .6), '#3a4254', '#4adcff'));
      c.globalAlpha = .1 + .08 * Math.sin(t * 2); c.fillStyle = '#4adcff'; c.fillRect(0, AR_WALL + 2, w, 2); c.globalAlpha = 1;
      arMote(c, d.motes, t, w, '#a8ffff', .6, 3, -5); }},

  // ---- Anís · Alto Mando (Fantasma): mansión-biblioteca embrujada con llamas moradas, telarañas y luz de luna ----
  anis: {dark: .3,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 24, 24, (x, y) => (x + y) & 1 ? '#2c2440' : '#251e38', '#120e1e', .1); arSpeck(P, 0, WH, w, h - WH, 240, ['#3a3058', '#14101e', '#8a6ad8']);   // suelo oscuro violeta
      for(let a = 0; a < 700; a++){ const an = a * Math.PI / 350; P.alpha('#a86aff', .12, w / 2 + Math.cos(an) * 80, (WH + h) / 2 + 3 + Math.sin(an) * 44, 1, 1); }   // círculo espiritual tenue
      arGradR(P, 0, 0, w, WH, '#1c1630', '#322648'); for(let x = 0; x < w; x += 8) P.alpha('#000000', .2, x, 0, 1, WH);                           // empapelado oscuro
      [.22, .5, .78].forEach(k => { const cx = Math.round(w * k), ww = k === .5 ? 40 : 26;                                                      // ventanas ojivales con luna
        P.rect('#0c0814', cx - ww / 2 - 2, 3, ww + 4, WH - 10); arGradR(P, cx - ww / 2, 5, ww, WH - 14, '#10143a', '#2a2f6a'); if(k === .5){ arEll(P, cx + 5, 14, 7, 7, '#e8e4ff'); arEll(P, cx + 7, 13, 5, 5, '#10143a'); arEll(P, cx + 5, 14, 7, 7, '#ffffff', .25); }
        P.rect('#0c0814', cx - 1, 5, 2, WH - 14); P.rect('#0c0814', cx - ww / 2, 16, ww, 1); arStars(P, cx - ww / 2, 5, ww, 12, 5, ['#ffffff', '#a8b0ff']); });
      [.08, .36, .64, .92].forEach(k => { const x = Math.round(w * k); arDrape(P, x - 8, 3, WH - 8, 16, '#4a1a6a', '#8a3ab0', .8); });                                    // cortinas moradas
      P.rect('#1a1228', 0, WH - 6, w, 6); P.rect('#4a3a68', 0, WH - 6, w, 1);
      const ch = [Math.round(w * .5)]; arHang(P, ch[0], 0, 4, '#2a1c3a'); P.rect('#3a2a4a', ch[0] - 14, 4, 29, 2); [-12, 0, 12].forEach(dx => { P.rect('#e8dcc8', ch[0] + dx, 1, 2, 3); });   // araña de luces
      arWeb(P, 14, 6, 22, 9, 4, '#c8c0e0', .5); arWeb(P, w - 14, 6, 22, 9, 4, '#c8c0e0', .5);
      const cands = [];
      [0, 1].forEach(sd => { const bx = sd ? w - 44 : 0;                                                                                       // lados: estanterías de libros viejos y candelabros
        P.rect('#1a1228', bx, WH - 6, 44, h - WH + 6); arGradR(P, bx, WH - 6, 44, h - WH + 6, '#2e2244', '#1a1228');
        for(let r = 0; r < 4; r++){ arBook(P, sd ? bx + 6 : bx + 2, WH + r * 38 - 2, 36, 14, '#4a3a58'); P.rect('#14101e', sd ? bx + 6 : bx + 2, WH + r * 38 + 12, 36, 3); }
        const cy = WH + 76; P.rect('#3a2e50', sd ? bx + 28 : bx + 12, cy + 4, 4, 26); P.rect('#6a5a88', sd ? bx + 22 : bx + 6, cy + 2, 16, 3); [0, 1, 2].forEach(q => { const cx = (sd ? bx + 24 : bx + 8) + q * 6; P.rect('#e8dcc8', cx, cy - 6, 2, 8); cands.push([cx + 1, cy - 7]); });    // candelabro
        const cy2 = WH + 150; P.rect('#3a2e50', sd ? bx + 28 : bx + 12, cy2 + 4, 4, 18); P.rect('#6a5a88', sd ? bx + 24 : bx + 8, cy2 + 2, 12, 3); [0, 1].forEach(q => { const cx = (sd ? bx + 26 : bx + 10) + q * 6; P.rect('#e8dcc8', cx, cy2 - 6, 2, 8); cands.push([cx + 1, cy2 - 7]); });
        for(let i = 0; i < 14; i++) P.alpha('#000000', .4 * (1 - i / 14), sd ? bx + i : bx + 43 - i, WH, 1, h - WH);
      });
      arOcclude(P, w, WH); return {cands, ch, wisps: arMotes(P, 28, w, h)};
    },
    anim(c, t, d, w){
      d.cands.forEach(([x, y], i) => { arGlowC(c, x, y - 3, 8 + Math.sin(t * 3 + i) * 1.5, '#a86aff', .26); arFlame(c, x, y, t, i, '#b86aff', '#f0d8ff'); });
      d.ch.forEach(x => [-12, 0, 12].forEach((dx, i) => arFlame(c, x + dx + 1, 1, t, i, '#b86aff', '#f0d8ff')));
      arMote(c, d.wisps, t, w, '#c8a0ff', .7, 3, -6); }}
});

Object.assign(ARENAS, {

  // ---- Aza · Alto Mando (Lucha): dojo de madera con estandartes, sacos de arena colgando, muñecos de entrenamiento y rastrillo de armas ----
  aza: {dark: .1,
    build(P, w, h, WH){
      arPlank(P, 0, WH, w, h - WH, '#c89a5e', 9, .18); arSpeck(P, 0, WH, w, h - WH, 150, ['#e0b878', '#8a5a2a']);                               // suelo de tablas claras
      for(let a = 0; a < 640; a++){ const an = a * Math.PI / 320; P.alpha('#8a1a18', .18, w / 2 + Math.cos(an) * 94, (WH + h) / 2 + 2 + Math.sin(an) * 52, 1, 1); P.alpha('#8a1a18', .14, w / 2 + Math.cos(an) * 93, (WH + h) / 2 + 2 + Math.sin(an) * 51, 1, 1); }   // aro de combate tenue
      P.rect('#d8b888', 0, 0, w, WH); for(let x = 0; x < w; x += 12){ P.alpha('#8a5a2a', .3, x, 0, 1, WH - 6); P.alpha('#fff0c8', .2, x + 1, 0, 1, WH - 6); }   // paneles de madera clara
      P.rect('#4a2a14', 0, 0, w, 4); P.rect('#6a3e1e', 0, 0, w, 1);
      [.15, .37, .63, .85].forEach(k => { const cx = Math.round(w * k);                                                                         // estandartes colgantes
        P.rect('#3a2210', cx - 10, 4, 21, 2); P.rect('#b02a20', cx - 9, 6, 19, WH - 13); P.rect('#d84a3a', cx - 9, 6, 2, WH - 13); P.rect('#6a1210', cx + 8, 6, 2, WH - 13); for(let q = 0; q < 5; q++) P.rect('#b02a20', cx - 9 + q * 4, WH - 7, 3, 2 + (q & 1));
        arEll(P, cx, 17, 6, 6, '#f4ecd8'); arEll(P, cx, 17, 4, 4, '#b02a20'); P.rect('#f4ecd8', cx - 1, 12, 3, 11); P.rect('#f4ecd8', cx - 5, 16, 11, 3); });
      P.rect('#4a2a14', 0, WH - 6, w, 6); P.rect('#8a5a2a', 0, WH - 6, w, 1);
      const sw = [];
      [0, 1].forEach(sd => { const bx = sd ? w - 44 : 0;                                                                                        // lados: madera, sacos de arena, muñeco de madera y armas
        P.rect('#3a2210', bx, WH - 6, 44, h - WH + 6); arGradR(P, bx, WH - 6, 44, h - WH + 6, '#7a4a24', '#3a2210'); for(let y = WH; y < h; y += 12) P.alpha('#000000', .25, bx, y, 44, 1);
        P.rect('#2a1a0e', bx, WH + 1, 44, 3);
        [[WH + 10], [WH + 108]].forEach(([yy], q) => { const sx = bx + 12 + q * 12 + (sd ? 6 : 0); P.rect('#6a6a74', sx + 8, yy - 6, 1, 8); P.rect('#6a3a1a', sx, yy + 2, 17, 38); P.rect('#8a5a2a', sx + 1, yy + 2, 4, 38); P.rect('#3a1e0a', sx + 13, yy + 2, 4, 38); P.rect('#d8c8a0', sx, yy + 12, 17, 2); P.rect('#d8c8a0', sx, yy + 28, 17, 2); sw.push([sx + 8, yy - 6]); });   // saco de arena
        const dx = sd ? bx + 10 : bx + 14, dy = WH + 62; P.rect('#6a4222', dx + 8, dy, 6, 46); P.rect('#8a5a2a', dx + 8, dy, 2, 46); P.rect('#6a4222', dx - 2, dy + 8, 26, 5); P.rect('#8a5a2a', dx - 2, dy + 8, 26, 1); P.rect('#6a4222', dx + 2, dy + 24, 18, 4); arEll(P, dx + 11, dy - 3, 5, 5, '#a8743e'); P.rect('#3a2210', dx + 4, dy + 46, 14, 3);   // muñeco de madera
        const rx = sd ? bx + 14 : bx + 12, ry = WH + 150; P.rect('#2a1a0e', rx, ry, 22, 24); P.rect('#4a2a14', rx + 1, ry + 1, 20, 22); [0, 1, 2].forEach(q => { P.rect('#8a5a2a', rx + 4 + q * 6, ry - 8, 2, 28); P.rect('#d8d8e0', rx + 4 + q * 6, ry - 11, 2, 4); });   // rastrillo de bastones
        for(let i = 0; i < 12; i++) P.alpha('#000000', .35 * (1 - i / 12), sd ? bx + i : bx + 43 - i, WH, 1, h - WH);
      });
      arOcclude(P, w, WH); return {sw, motes: arMotes(P, 22, w, h)};
    },
    anim(c, t, d, w){ d.sw.forEach(([x, y], i) => { const sx = Math.round(Math.sin(t * 1.6 + i * 2) * 2); c.fillStyle = '#3a1e0a'; c.globalAlpha = .55; c.fillRect(x - 8 + sx, y + 36, 17, 3); c.globalAlpha = 1; }); arMote(c, d.motes, t, w, '#f0d8a0', .45, 2, -2); }},

  // ---- Lotto · Alto Mando (Siniestro): salón de casino con moqueta roja, cortinas de terciopelo, luces de neón y máquinas tragaperras ----
  lotto: {dark: .26,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 24, 24, (x, y) => (x + y) & 1 ? '#5a0e1e' : '#4a0a18', '#2a0610', .1); arSpeck(P, 0, WH, w, h - WH, 260, ['#7a1a2c', '#2a0610', '#e0b040']);     // moqueta roja
      for(let x = 12; x < w; x += 24) for(let y = WH + 12; y < h; y += 24) P.alpha('#e0b040', .2, x - 1, y - 1, 3, 3);                           // dibujo dorado de rombos
      arGradR(P, 0, 0, w, WH, '#14080c', '#2a0c18'); for(let x = 0; x < w; x += 10){ P.rect('#3a1220', x, 0, 4, WH - 6); P.alpha('#e0b040', .35, x + 4, 0, 1, WH - 6); }   // pared negra con listas
      const suits = [['..#.#..', '.#####.', '#######', '#######', '.#####.', '..###..', '...#...'], ['...#...', '..###..', '.#####.', '#######', '.#####.', '..###..', '...#...'], ['..###..', '.#####.', '#######', '#######', '..###..', '...#...', '..###..'], ['...#...', '..###..', '.#####.', '#######', '#######', '...#...', '..###..']];
      const nx = [.18, .32, .68, .82].map(k => Math.round(w * k)); nx.forEach((x, i) => { P.rect('#0a0408', x - 12, 6, 24, 22); arBitmap(P, suits[i], x - 7, 9, 2, i & 1 ? '#ff3a7a' : '#3ae8ff', .95); });
      P.rect('#0a0408', Math.round(w * .5) - 34, 4, 68, 24); P.rect('#ffd048', Math.round(w * .5) - 32, 6, 64, 1); P.rect('#ffd048', Math.round(w * .5) - 32, 26, 64, 1); [0, 1, 2].forEach(i => { P.rect('#ffd048', Math.round(w * .5) - 22 + i * 15, 10, 12, 12); P.rect('#0a0408', Math.round(w * .5) - 21 + i * 15, 11, 10, 10); arBitmap(P, ['..#..', '.###.', '#####', '..#..'], Math.round(w * .5) - 20 + i * 15, 12, 2, '#ff3a3a', 1); });   // marcador "777"/ruleta
      [.05, .95].forEach(k => { const x = Math.round(w * k); arDrape(P, x - (k < .5 ? 0 : 18), 3, WH - 6, 18, '#7a0e2a', '#c8244a', .8); });
      P.rect('#2a0c18', 0, WH - 6, w, 6); P.rect('#e0b040', 0, WH - 6, w, 1);
      const lamps = [.25, .75].map(k => Math.round(w * k)); lamps.forEach(x => { arHang(P, x, 0, 4, '#2a2a30'); P.rect('#e0b040', x - 8, 4, 17, 2); [-6, 0, 6].forEach(dx => { P.rect('#fff0b0', x + dx - 1, 6, 3, 3); }); arCone(P, x, 9, 14, 50, h - 6, '#ffe9a0', .06); });
      const bulbs = [];
      [0, 1].forEach(sd => { const bx = sd ? w - 44 : 0;                                                                                        // lados: tragaperras y mesa de ruleta
        P.rect('#14080c', bx, WH - 6, 44, h - WH + 6); arGradR(P, bx, WH - 6, 44, h - WH + 6, '#2a0c18', '#14080c');
        [WH + 4, WH + 64].forEach((yy, q) => { const sx = bx + (sd ? 10 : 6); P.rect('#1a1a24', sx, yy, 26, 50); P.rect('#6a1a28', sx + 1, yy + 1, 24, 48); P.rect('#ffd048', sx + 1, yy + 1, 24, 2); P.rect('#0a0408', sx + 3, yy + 10, 20, 16); [0, 1, 2].forEach(r => { P.rect('#f4f0e0', sx + 4 + r * 6, yy + 11, 5, 14); P.rect(['#ff3a3a', '#ffd048', '#3ae8ff'][(r + q) % 3], sx + 5 + r * 6, yy + 15, 3, 6); });
          P.rect('#ffd048', sx + 8, yy + 32, 10, 4); P.rect('#3a3a48', sx + 22, yy + 12, 2, 14); arEll(P, sx + 23, yy + 11, 3, 3, '#ff3a3a'); for(let r = 0; r < 4; r++){ bulbs.push([sx + 3 + r * 6, yy + 4]); } });
        const ty = WH + 132, tx = bx + (sd ? 4 : 2); P.rect('#0a2a1a', tx, ty, 40, 30); P.rect('#1a5a3a', tx + 1, ty + 1, 38, 28); arEll(P, tx + 20, ty + 15, 12, 12, '#3a2a1a'); arEll(P, tx + 20, ty + 15, 9, 9, '#c8244a'); arEll(P, tx + 20, ty + 15, 5, 5, '#14080c'); P.rect('#e0b040', tx + 19, ty + 14, 3, 3);   // ruleta
        for(let i = 0; i < 12; i++) P.alpha('#000000', .4 * (1 - i / 12), sd ? bx + i : bx + 43 - i, WH, 1, h - WH);
      });
      arPool(P, w * .25, WH + 14, 50, 8, '#ffe9a0', .08); arPool(P, w * .75, WH + 14, 50, 8, '#ffe9a0', .08);
      arOcclude(P, w, WH); return {nx, lamps, bulbs, motes: arMotes(P, 22, w, h)};
    },
    anim(c, t, d, w){
      d.nx.forEach((x, i) => { const fl = Math.sin(t * 7 + i * 4) > -.8 ? 1 : .35; arGlowC(c, x, 18, 11, i & 1 ? '#ff3a7a' : '#3ae8ff', .22 * fl); });
      d.bulbs.forEach(([x, y], i) => { c.fillStyle = (Math.floor(t * 4) + i) % 3 === 0 ? '#ffffff' : '#ffd048'; c.fillRect(x, y, 2, 2); });
      arMote(c, d.motes, t, w, '#ffd890', .4, 2, -3); }},

  // ---- Catleya · Alto Mando (Psíquico): sala serena con cielo estrellado, esferas flotantes, espejos de plata y runas brillantes ----
  catleya: {dark: .22,
    build(P, w, h, WH){
      arGradR(P, 0, WH, w, h - WH, '#2a2060', '#1a1445'); arTiles(P, 0, WH, w, h - WH, 28, 28, (x, y) => (x + y) & 1 ? 'rgba(0,0,0,0)' : '#2e2670', '#1a1445', .05);
      for(let i = 0; i < 4; i++) P.alpha('#ffffff', .05, 0, WH + 20 + i * 46, w, 6);
      arSpeck(P, 0, WH, w, h - WH, 200, ['#6a5ad8', '#a898ff', '#10092a']);
      for(let a = 0; a < 700; a++){ const an = a * Math.PI / 350; [[96, 52, .18], [66, 36, .14]].forEach(([rx, ry, al]) => P.alpha('#e8a0ff', al, w / 2 + Math.cos(an) * rx, (WH + h) / 2 + 2 + Math.sin(an) * ry, 1, 1)); }   // círculos de runas tenues
      for(let k = 0; k < 6; k++){ const an = k * Math.PI / 3 + .3; for(let q = 40; q < 96; q++) P.alpha('#e8a0ff', .09, w / 2 + Math.cos(an) * q, (WH + h) / 2 + 2 + Math.sin(an) * q * .54, 1, 1); }
      arGradR(P, 0, 0, w, WH, '#0a0626', '#2a1a68'); arStars(P, 0, 0, w, WH - 6, 60, ['#ffffff', '#d8c8ff', '#a8b8ff']);
      arEll(P, Math.round(w * .5), 16, 14, 14, '#e8e0ff'); arEll(P, Math.round(w * .5) + 5, 14, 11, 11, '#1a1050'); arEll(P, Math.round(w * .5), 16, 14, 14, '#ffffff', .18);   // luna creciente
      [.16, .84].forEach(k => { const x = Math.round(w * k); P.rect('#c8d0e8', x - 14, 3, 28, WH - 10); P.rect('#6a76a0', x - 14, 3, 28, 1); arGradR(P, x - 12, 5, 24, WH - 14, '#a8b8e8', '#6a78b8'); for(let q = 0; q < 8; q++) P.alpha('#ffffff', .5 - q * .05, x - 10 + q * 3, 6 + q * 2, 2, WH - 18 - q * 2); });   // espejos de plata
      [.3, .7].forEach(k => { const x = Math.round(w * k); arDrape(P, x - 9, 3, WH - 8, 18, '#6a4ab0', '#c8a8ff', .75); });
      P.rect('#1a1040', 0, WH - 6, w, 6); P.rect('#8a78e8', 0, WH - 6, w, 1);
      const orbs = [];
      [0, 1].forEach(sd => { const bx = sd ? w - 42 : 0;                                                                                        // lados: pilares de cristal violeta y esferas flotantes
        P.rect('#10092a', bx, WH - 6, 42, h - WH + 6); arGradR(P, bx, WH - 6, 42, h - WH + 6, '#251a5a', '#10092a');
        for(let q = 0; q < 4; q++){ const yy = WH + 26 + q * 40, x = bx + (sd ? 20 : 20) + (q & 1 ? -6 : 6); arCrystal(P, x, yy + 22, 20, q & 1 ? '#c898ff' : '#98b8ff'); orbs.push([x, yy - 6, q]); }
        for(let k = 0; k < 6; k++){ const yy = WH + 6 + k * 28; P.rect('#e8a0ff', sd ? bx + 2 : bx + 38, yy, 2, 8); P.rect('#e8a0ff', sd ? bx + 2 : bx + 38, yy + 4, 5, 1); }   // runas
        for(let i = 0; i < 12; i++) P.alpha('#000000', .35 * (1 - i / 12), sd ? bx + i : bx + 41 - i, WH, 1, h - WH);
      });
      arOcclude(P, w, WH); return {orbs, motes: arMotes(P, 40, w, h)};
    },
    anim(c, t, d, w){
      d.orbs.forEach(([x, y, q], i) => { const yy = y + Math.round(Math.sin(t * 1.4 + i * 1.7) * 3); arGlowC(c, x, yy, 9, '#d8a8ff', .3); c.fillStyle = '#f0e0ff'; c.fillRect(x - 3, yy - 1, 7, 3); c.fillRect(x - 2, yy - 2, 5, 5); c.fillStyle = '#ffffff'; c.fillRect(x - 1, yy - 1, 2, 2); });
      arMote(c, d.motes, t, w, '#e0c8ff', .65, 2, -5); }},

  // ---- Mirto · Campeón: gran salón de la Liga con suelo de mármol, columnas y vidrieras de llamas, estandartes y braseros ----
  mirto: {dark: .12,
    build(P, w, h, WH){
      arTiles(P, 0, WH, w, h - WH, 32, 32, (x, y) => (x + y) & 1 ? '#e8dcc0' : '#d8c8a4', '#a89870', .1); arSpeck(P, 0, WH, w, h - WH, 220, ['#f4ecd8', '#b8a880', '#fff6e0']);               // mármol
      for(let a = 0; a < 760; a++){ const an = a * Math.PI / 380; P.alpha('#8a1a18', .2, w / 2 + Math.cos(an) * 100, (WH + h) / 2 + 2 + Math.sin(an) * 56, 1, 1); P.alpha('#c89a20', .22, w / 2 + Math.cos(an) * 96, (WH + h) / 2 + 2 + Math.sin(an) * 54, 1, 1); }   // emblema de la Liga (aro)
      P.rect('#6a3a22', 0, 0, w, WH); for(let x = 0; x < w; x += 6) P.alpha('#000000', .15, x, 0, 1, WH);                                      // pared de madera noble
      [.2, .5, .8].forEach(k => { const cx = Math.round(w * k), ww = k === .5 ? 44 : 32;                                                       // vidrieras de llamas (anaranjado + dorado)
        P.rect('#2a1a10', cx - ww / 2 - 2, 3, ww + 4, WH - 9); for(let y = 5; y < WH - 8; y++){ const t = (y - 5) / (WH - 13); P.rect(arMix('#ffd84a', '#e8421a', t), cx - ww / 2, y, ww, 1); }
        for(let q = 0; q < 6; q++){ const fx = cx - ww / 2 + 4 + q * (ww - 8) / 5; P.rect('#ff7a1a', fx, 14 + (q & 1) * 3, 4, 12); P.rect('#ffe890', fx + 1, 18 + (q & 1) * 3, 2, 8); }
        P.rect('#2a1a10', cx - 1, 5, 2, WH - 13); P.rect('#2a1a10', cx - ww / 2, 16, ww, 1); P.rect('#2a1a10', cx - ww / 2, 24, ww, 1); });
      [.07, .35, .65, .93].forEach(k => arFluted(P, Math.round(w * k) - 4, 3, WH - 6, 9, '#e8dcc0', '#c89a20'));
      [.08, .92].forEach(k => { const x = Math.round(w * k); P.rect('#8a1a18', x - 8 + (k < .5 ? 12 : -12), 6, 16, WH - 14); P.rect('#c89a20', x - 8 + (k < .5 ? 12 : -12), 6, 16, 2); arBitmap(P, ['..#..', '.###.', '#####', '.###.', '..#..'], x - 5 + (k < .5 ? 12 : -12), 12, 2, '#ffd84a', .9); });   // estandartes
      P.rect('#4a2a14', 0, WH - 6, w, 6); P.rect('#c89a20', 0, WH - 6, w, 1);
      const fl = [];
      [0, 1].forEach(sd => { const bx = sd ? w - 44 : 0;                                                                                        // lados: braseros dorados y columnas
        P.rect('#3a2210', bx, WH - 6, 44, h - WH + 6); arGradR(P, bx, WH - 6, 44, h - WH + 6, '#6a3e22', '#3a2210'); for(let y = WH; y < h; y += 14) P.alpha('#000000', .22, bx, y, 44, 1);
        arFluted(P, sd ? bx + 30 : bx + 2, WH + 2, h + 4, 12, '#e8dcc0', '#c89a20');
        [WH + 54, WH + 134].forEach(yy => { const bxx = sd ? bx + 10 : bx + 20; P.rect('#c89a20', bxx, yy, 14, 3); P.rect('#8a6a10', bxx + 4, yy + 3, 6, 14); P.rect('#c89a20', bxx + 2, yy + 17, 10, 3); P.rect('#3a2210', bxx + 1, yy - 2, 12, 2); fl.push([bxx + 7, yy - 2]); });
        for(let i = 0; i < 12; i++) P.alpha('#000000', .35 * (1 - i / 12), sd ? bx + i : bx + 43 - i, WH, 1, h - WH);
      });
      for(let i = 0; i < 4; i++) arBeam(P, Math.round(w * (.2 + .3 * (i % 3))) - 4, WH, Math.round(w * (.2 + .3 * (i % 3))) + 20 - (i * 8), h - 8, 14, 30, '#ffb04a', .05);
      arOcclude(P, w, WH); return {fl, wins: [.2, .5, .8].map(k => Math.round(w * k)), embers: arMotes(P, 34, w, h)};
    },
    anim(c, t, d, w){
      d.fl.forEach(([x, y], i) => { arGlowC(c, x, y - 4, 11 + Math.sin(t * 3 + i) * 1.5, '#ff8a2a', .3); arFlame(c, x, y, t, i, '#ff8a2a', '#ffe890'); arFlame(c, x - 3, y, t, i + 3, '#ff5a1a', '#ffd048'); arFlame(c, x + 3, y, t, i + 5, '#ff5a1a', '#ffd048'); });
      d.wins.forEach((x, i) => arGlowC(c, x, 18, 16 + Math.sin(t * 1.5 + i) * 2, '#ffb04a', .12));
      arMote(c, d.embers, t, w, '#ffb04a', .7, 2, -9); }}
});
