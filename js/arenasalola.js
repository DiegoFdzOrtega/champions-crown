"use strict";
/* =====================================================================
   17g) ARENAS DE ALOLA: un estadio pixel art por cada combate de Alola (Sol y Luna), con los lugares originales del juego:
   los 7 líderes de las pruebas, el Alto Mando (Hala, Olivia, Acerola y Kahili) y el Campeón, el Profesor Kukui. En total 12 fondos.
   Dibujadas con código (sin imágenes), igual que las de las demás regiones. Se cargan DESPUÉS de arenaskalos.js y usan los ayudantes de arenas.js y siguientes
   (arTiles, arBricks, arSpeck, arEll, arPool, arGlowC, arCone, arMote, arMotes, arStars, arBolt, arFluted, arPlank, arStrata, arLeaf, arVine, arFlow, arFall...).
   Cómo funciona build() / anim(): ver la cabecera de arenas.js.

   El id de cada arena es el id del combate (el mismo que en js/alola.js):
     ilima      Ilima · mansión de Ciudad Hau'oli (Normal)         lana     Lana · Colina Arroyuelo (Agua)
     kiawe      Kiawe · Parque Volcán Wela (Fuego)                 mallow   Mallow · Selva Frondosa (Planta)
     sophocles  Sophocles · Observatorio Hokulani (Eléctrico)      acerola  Acerola · Supermercado Ahorra Mucho (Fantasma)
     mina       Mina · Aldea Marina (Hada)
     hala       Hala · Poblado Iki (Lucha)                         olivia   Olivia · Ruinas de la Vida (Roca)
     acerola_am Acerola (Alto Mando) · trastienda del supermercado  kahili   Kahili · alturas de Alola y Aldea Marina (Volador)
     kukui      Profesor Kukui · Estadio Manalo (Campeón)

   REGLA (igual que las demás): el centro del suelo (donde pelean los dos Pokémon) se deja LIMPIO; la decoración va en la pared del fondo, en las bandas de los
   lados y en el borde de arriba. El marcador tapa la parte de arriba a izquierda y derecha: lo importante se ve en el centro de arriba, en los lados y en el suelo.
   ===================================================================== */

// ---- Ayudantes nuevos (comunes a las arenas de Alola) ----
function arPalm(P, x, y, hh, lean, leaf){                                                         // palmera: (x, y) = pie del tronco; hh = alto; lean = cuánto se inclina la copa (px)
  for(let i = 0; i < hh; i++){ const k = i / hh, xx = Math.round(x + lean * k * k); P.rect('#6a4a2a', xx, y - i, 2, 1); P.px('#8a6a3a', xx, y - i); if(i % 3 === 0) P.alpha('#000000', .3, xx, y - i, 2, 1); }
  const tx = Math.round(x + lean), ty = y - hh;
  [[-1, -.2], [-.8, -.75], [-.35, -1], [.35, -1], [.8, -.75], [1, -.2], [-.9, .2], [.9, .2]].forEach(([dx, dy], i) => {
    const L = 8 + (i % 3) * 2 + Math.round(hh / 14);
    for(let j = 0; j < L; j++){ const px = tx + dx * j * 1.15, py = ty + dy * j * .8 + j * j * .05; P.rect(i & 1 ? leaf : arDrk(leaf, .2), px, py, 2, 1); if(j % 2 === 0) P.px(arDrk(leaf, .4), px + (dx < 0 ? -1 : 2), py + 1); }
  });
  P.rect('#5a3a1e', tx - 1, ty, 3, 2); P.px('#7a5a2a', tx, ty + 2);
}
function arFrond(P, x, y, s, base, dir){                                                           // hoja grande hacia arriba-derecha (dir = 1) o arriba-izquierda (dir = -1)
  for(let i = 0; i < s; i++){ const k = i / s, ww = Math.max(1, Math.round(Math.sin(k * Math.PI) * s * .45)), px = x + dir * i * .6;
    P.rect(arDrk(base, .25), dir > 0 ? px - ww : px, y - i, ww, 1); P.rect(base, dir > 0 ? px : px - ww, y - i, ww, 1); P.rect(arLit(base, .25), dir > 0 ? px : px - Math.max(1, ww >> 1), y - i, Math.max(1, ww >> 1), 1); }
}
const AR_FONT = {T: ['###', '.#.', '.#.', '.#.', '.#.'], H: ['#.#', '#.#', '###', '#.#', '#.#'], R: ['##.', '#.#', '##.', '#.#', '#.#'], I: ['###', '.#.', '.#.', '.#.', '###'],
  F: ['###', '#..', '##.', '#..', '#..'], Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], E: ['###', '#..', '##.', '#..', '###'],
  G: ['.##', '#..', '#.#', '#.#', '.##'], A: ['.#.', '#.#', '###', '#.#', '#.#'], ' ': ['.', '.', '.', '.', '.']};
function arTxt(P, str, x, y, col, s){                                                              // letras diminutas (3x5 px) para carteles; devuelve el ancho
  let cx = x; for(const ch of str){ const g = AR_FONT[ch] || AR_FONT[' ']; arBitmap(P, g, cx, y, s, col, 1); cx += (g[0].length + 1) * s; } return cx - x;
}
function arDeck(P, x, y, w, h, base, ph, vary){                                                   // cubierta/suelo de tablas largas con juntas (ph = ancho de tabla)
  P.rect(arDrk(base, .45), x, y, w, h);
  for(let r = 0; r * ph < h; r++){ const yy = y + r * ph, hh = Math.min(ph - 1, y + h - yy); let px = x - ((r * 37) % 61);
    while(px < x + w){ const pw = 64 + (Math.abs(px * 7 + r * 13) % 50), k = (Math.abs(px * 3 + r * 5) % 7) / 7, c = arMix(base, (r + (px >> 4)) & 1 ? '#000000' : '#ffffff', vary * k);
      const x0 = Math.max(px, x), x1 = Math.min(px + pw - 1, x + w); if(x1 > x0){ P.rect(c, x0, yy, x1 - x0, hh); P.alpha('#ffffff', .12, x0, yy, x1 - x0, 1); for(let g = 0; g < 3; g++) P.alpha('#000000', .09, x0 + ((g * 23 + r * 11) % Math.max(1, x1 - x0)), yy + 1 + (g & 1), Math.min(20, x1 - x0), 1); } px += pw; } }
}
function arWave(P, x, y, w, col, a){ for(let i = 0; i < w; i++) P.alpha(col, a, x + i, y + Math.round(Math.sin(i * .5)), 1, 1); }       // trazo ondulado (olas, brillos del agua)

Object.assign(ARENAS, {

  // ---- Ilima · mansión de Ciudad Hau'oli (Normal): salón señorial de paredes crema y zócalo de madera, grandes ventanales al jardín cuidado, cortinas, lámpara de araña y alfombra granate ----
  ilima: {dark: .04,
    build(P, w, h, WH){
      const mx = Math.round(w / 2);
      arTiles(P, 0, WH, w, h - WH, 22, 18, (x, y) => (x + y) & 1 ? '#efe4cc' : '#e0d2b2', '#b8a784', .1);                          // suelo de mármol ajedrezado
      arSpeck(P, 0, WH, w, h - WH, 260, ['#fff6e0', '#cdbd98']);
      arEll(P, mx, 108, 118, 40, '#4a1220'); arEll(P, mx, 108, 114, 37, '#7e2234'); arRing(P, mx, 108, 108, 34, '#e0b850', .9); arRing(P, mx, 108, 100, 30, '#e0b850', .5);   // alfombra oval con ribete dorado
      for(let k = -4; k <= 4; k++){ P.alpha('#e0b850', .32, mx + k * 22 - 1, 107, 3, 3); P.alpha('#e0b850', .2, mx + k * 22, 103, 1, 1); P.alpha('#e0b850', .2, mx + k * 22, 111, 1, 1); }
      arGradR(P, 0, 0, w, WH, '#f6eedb', '#e6dbc0');                                                                              // pared crema
      P.rect('#fffaf0', 0, 0, w, 3); P.rect('#d8c9a0', 0, 3, w, 1); P.rect('#e0b850', 0, 4, w, 1);                                  // cornisa
      P.rect('#7a4a28', 0, WH - 8, w, 8); P.rect('#a8743e', 0, WH - 9, w, 1);                                                       // zócalo de madera
      for(let x = 0; x < w; x += 14){ P.rect('#8e5a32', x + 1, WH - 7, 12, 5); P.alpha('#ffffff', .2, x + 1, WH - 7, 12, 1); P.alpha('#000000', .25, x + 1, WH - 3, 12, 1); }
      const n = Math.max(3, Math.floor((w - 96) / 50)), sp = (w - 96) / n, beams = [];
      for(let i = 0; i < n; i++){ const wx = Math.round(48 + sp * (i + .5) - 11);                                                   // ventanales al jardín
        P.rect('#c9b98e', wx - 3, 3, 28, 30); P.rect('#fffaf0', wx - 2, 4, 26, 28);
        arGradR(P, wx, 6, 22, 16, '#7ccaf0', '#d4f2ff'); P.rect('#4aa04a', wx, 22, 22, 8); P.rect('#2f7a3a', wx, 22, 22, 3);
        arPalm(P, wx + 5 + (i % 2) * 10, 26, 9, 2, '#3fa04a'); for(let k = 0; k < 4; k++) P.px(['#ff7ab8', '#ffd84a', '#ff5a4a', '#ffffff'][(i + k) & 3], wx + 2 + k * 5, 26 + (k & 1));
        P.rect('#fffaf0', wx + 10, 6, 2, 24); P.rect('#fffaf0', wx, 16, 22, 2); P.alpha('#ffffff', .35, wx + 2, 7, 5, 8);
        P.rect('#d8c9a0', wx - 4, 32, 30, 2); beams.push(wx + 11);
        if(i < n - 1){ const px = Math.round(48 + sp * (i + 1) - 6); P.rect('#c9a040', px, 8, 12, 17); P.rect('#6a4a22', px + 1, 9, 10, 15); arGradR(P, px + 2, 10, 8, 6, '#8ac4e8', '#d8ecf4'); P.rect('#5a9a4a', px + 2, 16, 8, 7); P.rect('#3a6a3a', px + 4, 14, 3, 3); } }
      beams.forEach((bx, i) => arBeam(P, bx, WH, bx - 22, h - 6, 14, 40, '#fff4c8', .075));                                       // haces de luz de las ventanas sobre el suelo
      arDrape(P, 6, 4, WH - 9, 14, '#a82434', '#d84458', .95); arDrape(P, w - 20, 4, WH - 9, 14, '#a82434', '#d84458', .95);          // cortinas
      P.rect('#e0b850', mx, 0, 1, 6); const lamp = [[mx - 11, 9], [mx - 5, 11], [mx + 1, 11], [mx + 7, 9]];                          // lámpara de araña
      P.rect('#c9a040', mx - 12, 7, 25, 2); P.rect('#e0b850', mx - 8, 9, 17, 2); P.rect('#8a6a20', mx - 6, 11, 13, 1);
      lamp.forEach(([lx, ly]) => { P.rect('#fff4c0', lx, ly - 3, 2, 3); P.rect('#e0b850', lx, ly, 2, 3); }); for(let k = 0; k < 7; k++) P.px('#d8f0ff', mx - 9 + k * 3, 14 + (k % 3));
      [0, 1].forEach(sd => { const bx = sd ? w - 32 : 0;                                                                              // bandas laterales
        for(let k = 0; k < 32; k += 4){ P.rect(k & 4 ? '#6a3e22' : '#7e4e2a', bx + k, WH + 2, 4, h - WH - 2); P.alpha('#ffffff', .12, bx + k, WH + 2, 1, h - WH - 2); P.alpha('#000000', .3, bx + k + 3, WH + 2, 1, h - WH - 2); } P.rect('#c9a040', sd ? bx : bx + 31, WH + 2, 1, h - WH - 2);
        arEll(P, bx + 16, WH + 62, 9, 4, '#8a6a20'); P.rect('#c9a040', bx + 8, WH + 54, 17, 8); P.rect('#e0b850', bx + 9, WH + 54, 15, 2); arPalm(P, bx + 16, WH + 55, 36, sd ? -4 : 4, '#2f9a44');   // maceta dorada con palmera
        P.rect('#cbbf9e', bx + 8, WH + 118, 17, 24); P.rect('#e8dcc0', bx + 9, WH + 118, 15, 3); P.rect('#a89a74', bx + 8, WH + 140, 17, 2);                  // pedestal con jarrón de porcelana
        arEll(P, bx + 16, WH + 108, 6, 9, '#f4f4ff'); arEll(P, bx + 16, WH + 106, 5, 5, '#3a6ad8', .55); P.rect('#f4f4ff', bx + 13, WH + 96, 7, 3); arFlow(P, bx + 16, WH + 92, '#ff7ab8'); arFlow(P, bx + 12, WH + 94, '#ffd84a'); arFlow(P, bx + 20, WH + 94, '#ffffff');
        arShade(P, bx, sd, 32, WH, h); });
      arOcclude(P, w, WH); return {lamp, beams, motes: arMotes(P, 26, w, h)};
    },
    anim(c, t, d, w){
      d.lamp.forEach(([lx, ly], i) => arGlowC(c, lx + 1, ly - 2, 8 + Math.sin(t * 3 + i) * 1.2, '#ffe8a0', .32));
      for(let k = 0; k < 9; k++){ const s = Math.sin(t * 2.6 + k * 1.9); if(s > .6){ c.globalAlpha = (s - .6) * 2.2; c.fillStyle = '#ffffff'; c.fillRect(d.lamp[0][0] - 3 + k * 3, 13 + (k % 3) * 2, 1, 1); } } c.globalAlpha = 1;
      arMote(c, d.motes, t, w, '#fff6c8', .55, 2, -3); }},

  // ---- Lana · Colina Arroyuelo (Agua): estanque natural entre cascadas y selva tropical. Pasarela de tablas de madera con barandilla de cuerda, nenúfares y flores de loto ----
  lana: {dark: .06,
    build(P, w, h, WH){
      const mx = Math.round(w / 2), falls = [];
      arGradR(P, 0, WH, w, h - WH, '#44b6cc', '#1d7aa4');                                                                          // agua
      for(let i = 0; i < 120; i++) arWave(P, P.r() * w, WH + 4 + P.r() * (h - WH - 6), 3 + (P.r() * 7 | 0), '#c8f4ff', .22);
      arGradR(P, 0, 0, w, WH, '#14452e', '#2a6a40');                                                                               // selva del fondo
      arStrata(P, 0, 8, w, WH - 6, ['#54503e', '#625e48', '#48463a', '#706a52'], 2);                                                // acantilado
      for(let i = 0; i < w / 4; i++){ const x = i * 4 + (P.r() * 3 | 0); P.alpha(['#2f7a3a', '#3f9a4a', '#58b85a'][(P.r() * 3) | 0], .7, x, 8 + (P.r() * (WH - 12) | 0), 3, 2); }  // musgo
      [[mx - 96, 10], [mx - 6, 26], [mx + 92, 12]].forEach(([fx, fw]) => {                                                           // cascadas del fondo
        P.rect('#6ac0d8', fx, 6, fw, WH - 4); P.rect('#bfeaf8', fx + 1, 6, Math.max(2, fw - 4), WH - 4); P.alpha('#ffffff', .5, fx + 2, 6, 2, WH - 4);
        arEll(P, fx + fw / 2, WH + 1, fw * .9 + 4, 4, '#e8faff', .85); arEll(P, fx + fw / 2, WH + 2, fw * .6 + 2, 2, '#ffffff', .9); falls.push([fx, fw]); });
      P.rect('#0e3a24', 0, 0, w, 9);                                                                                               // dosel
      for(let x = -2; x < w; x += 5){ arFrond(P, x, 15 + (HH(x, 3) * 7 | 0), 11 + (HH(x, 5) * 7 | 0), ['#1f7a3a', '#2f9a4a', '#3fae58', '#176a30'][(HH(x, 7) * 4) | 0], HH(x, 9) < .5 ? 1 : -1); }
      for(let i = 0; i < 18; i++) arVine(P, 6 + ((i * 59) % (w - 12)), 8, 6 + (i * 5) % 14, '#2f6a2a', ['#3fa84a', '#58c05a'][i & 1]);
      const dx0 = 60, dy0 = WH + 28, dw = w - 120, dh = h - WH - 52;                                                                // cubierta de madera sobre el estanque
      P.alpha('#000000', .3, dx0 + 2, dy0 + dh + 4, dw, 6);
      arDeck(P, dx0, dy0, dw, dh, '#a77a4a', 8, .2); P.rect('#5a3a20', dx0, dy0 + dh, dw, 5); P.rect('#3a2414', dx0, dy0 + dh + 3, dw, 2); P.alpha('#ffffff', .15, dx0, dy0 + dh, dw, 1);
      P.rect('#6a4626', dx0, dy0, 3, dh); P.rect('#6a4626', dx0 + dw - 3, dy0, 3, dh); P.alpha('#000000', .35, dx0, dy0, dw, 2);
      for(let k = 0; k <= 4; k++){ const px = dx0 + Math.round(k * (dw - 5) / 4);                                                      // postes y cuerda de la barandilla
        P.rect('#5a3a1e', px, dy0 - 12, 5, 14); P.rect('#8a6a3a', px, dy0 - 12, 2, 14); P.rect('#4a2e18', px - 1, dy0 - 13, 7, 2);
        if(k < 4){ const nx = dx0 + Math.round((k + 1) * (dw - 5) / 4); for(let i = 0; i <= nx - px - 5; i++) P.px('#d8c898', px + 5 + i, dy0 - 9 + Math.round(Math.sin(i / (nx - px - 5) * Math.PI) * 3)); } }
      [[34, WH + 62], [w - 34, WH + 78], [30, h - 30]].forEach(([qx, qy]) => { arEll(P, qx, qy + 5, 15, 5, '#3a2414'); arEll(P, qx, qy + 3, 15, 5, '#7a5230'); arEll(P, qx, qy, 14, 5, '#a77a4a'); for(let k = -12; k <= 12; k += 6) P.alpha('#3a2414', .5, qx + k, qy - 4, 1, 8); P.rect('#5a3a1e', qx - 14, qy - 9, 4, 11); P.rect('#5a3a1e', qx + 10, qy - 9, 4, 11); P.rect('#d8c898', qx - 14, qy - 8, 28, 1); });  // muelles redondos
      const pads = [[mx - 60, WH + 14], [mx + 70, WH + 12], [mx + 130, h - 12], [mx - 120, h - 10], [56, WH + 100], [w - 54, WH + 120], [20, WH + 36], [w - 20, WH + 40], [mx - 40, h - 8], [mx + 30, h - 7]];
      pads.forEach(([px, py], i) => { arEll(P, px, py + 1, 8, 3, '#176a30'); arEll(P, px, py, 7, 3, ['#2f9a44', '#3fae58'][i & 1]); P.rect('#44b6cc', px + 2, py - 1, 3, 1); if(i % 2 === 0){ arFlow(P, px - 1, py - 2, '#ff9ad0', '#ffe060'); } });   // nenúfares y lotos
      [0, 1].forEach(sd => { const bx = sd ? w - 26 : 0;                                                                              // orillas rocosas
        arStrata(P, bx, 0, 26, WH + 18, ['#54503e', '#625e48', '#48463a', '#706a52'], 2); arRocks(P, bx + 3, WH + 24, 4, '#6a664e'); arRocks(P, bx + 5, h - 2, 4, '#6a664e');
        for(let k = 0; k < 4; k++) arFrond(P, bx + 6 + k * 5, WH + 22, 14 + k * 2, ['#2f9a44', '#3fae58', '#1f7a3a', '#58b85a'][k], sd ? -1 : 1);
        const fx = sd ? w - 12 : 8; P.rect('#8ad8f0', fx, 0, 5, WH + 20); P.rect('#d8f6ff', fx + 1, 0, 2, WH + 20); falls.push([fx, 5, WH + 20]);
        arEll(P, fx + 2, WH + 22, 9, 3, '#e8faff', .8); });
      arOcclude(P, w, WH); return {falls, pads, sparks: Array.from({length: 40}, () => [P.r() * w, WH + 3 + P.r() * (h - WH - 6), P.r()]), mist: arMotes(P, 16, w, h)};
    },
    anim(c, t, d, w){
      d.falls.forEach(([fx, fw, ey], i) => { const e = ey || AR_WALL + 2; for(let k = 0; k < 10; k++){ const yy = (k * 9 + t * 60 + i * 7) % e; c.globalAlpha = .75; c.fillStyle = '#f0fdff'; c.fillRect(fx + 1 + (k * 5) % Math.max(2, fw - 2), Math.floor(yy), 1, 4); }
        c.globalAlpha = .35 + .25 * Math.sin(t * 6 + i); c.fillStyle = '#ffffff'; c.fillRect(fx - 2, e - 1 + (ey ? 2 : 1), fw + 4, 1); }); c.globalAlpha = 1;
      d.sparks.forEach(([x, y, ph]) => { const s = Math.sin(t * 2.4 + ph * 20); if(s > .55){ c.globalAlpha = (s - .55) * 2; c.fillStyle = '#ffffff'; c.fillRect(Math.floor(x), Math.floor(y), 1, 1); } }); c.globalAlpha = 1;
      d.pads.forEach(([px, py], i) => { const k = (t * .5 + i * .31) % 1; c.globalAlpha = .45 * (1 - k); c.strokeStyle = '#e8faff'; c.lineWidth = 1; c.beginPath(); c.ellipse(px, py + 1, 8 + k * 9, 3 + k * 3, 0, 0, 6.283); c.stroke(); }); c.globalAlpha = 1;
      arMote(c, d.mist, t, w, '#e8faff', .45, 2, -2); }},

  // ---- Kiawe · Parque Volcán Wela (Fuego): ladera volcánica de roca negra, cráter brillando al fondo, ríos de lava a los lados, antorchas de bambú y brasas en el aire ----
  kiawe: {dark: .1,
    build(P, w, h, WH){
      const mx = Math.round(w / 2), cx = mx + 26;
      arGradR(P, 0, 0, w, WH, '#2a0e1c', '#e0602a');                                                                               // cielo de ceniza y atardecer
      for(let i = 0; i < 24; i++) P.alpha('#1a0a10', .35, (i * 37) % w, 2 + (i * 11) % 22, 16 + (i * 7) % 22, 3);                      // nubes de ceniza
      for(let x = 0; x < w; x++){                                                                                                  // montañas: cordillera y volcán con cráter
        const bg = 7 + 5 * Math.sin(x * .05) + 3 * Math.sin(x * .13 + 1), cone = Math.min(31, 44 - Math.abs(x - cx) * .62), c2 = 30 - Math.abs(x - 70) * .5, c3 = 20 - Math.abs(x - (w - 90)) * .45;
        const top = WH - Math.max(bg, cone, c2, c3, 0); P.rect('#241216', x, top, 1, WH - top + 2); P.px('#7a4030', x, top); if(HH(x, 3) < .25) P.px('#4a2a26', x, top + 2); }
      for(let k = 0; k < 4; k++){ let lx = cx - 3 + k * 2, ly = WH - 30; for(let i = 0; i < 28; i++){ P.px(i < 6 ? '#ffb030' : '#e8501a', lx, ly); if(P.r() < .3) lx += k < 2 ? -1 : 1; ly++; if(ly >= WH) break; } }   // coladas de lava por la ladera
      P.rect('#ffb030', cx - 7, WH - 31, 15, 2); P.rect('#ffe890', cx - 4, WH - 31, 9, 1);                                           // boca del cráter
      P.rect('#3a2a28', 0, WH, w, h - WH);                                                                                         // suelo de basalto
      for(let i = 0; i < 260; i++){ const ex = P.r() * w, ey = WH + P.r() * (h - WH), er = 5 + P.r() * 13; arEll(P, ex, ey, er, Math.max(2, er * .42), ['#4a3a38', '#2a1c1c', '#524240', '#32221f'][(P.r() * 4) | 0], .55); }
      arSpeck(P, 0, WH, w, h - WH, 620, ['#4a3836', '#1c1010', '#6a5048', '#7a6058']);
      const grietas = [[40, 60, 16, 1, 1], [70, 150, 20, 1, -1], [w - 70, 70, 18, -1, 1], [w - 50, 140, 22, -1, -1], [mx - 120, 160, 18, 1, 0], [mx + 110, 46, 16, 1, 0], [mx - 30, 168, 22, 1, 0]];
      grietas.forEach(([gx, gy, ln, dx, dy]) => { arCrack(P, gx, gy, ln, '#c8401a', dx || 1, dy, .5); arCrack(P, gx, gy + 1, ln, '#ff8a2a', dx || 1, dy, .5); });        // grietas de lava
      const lava = [];
      [0, 1].forEach(sd => { const bx = sd ? w - 38 : 0;                                                                            // ríos de lava laterales con orillas de roca
        for(let y = WH; y < h; y++){ const xc = bx + 19 + Math.round(Math.sin(y * .09 + sd * 2) * 6), ww = 13 + Math.round(Math.sin(y * .17) * 3);
          P.rect('#1a0e0e', xc - ww / 2 - 3, y, ww + 6, 1); P.rect('#c8401a', xc - ww / 2 - 1, y, ww + 2, 1); P.rect('#ff7a1a', xc - ww / 2 + 1, y, ww - 2, 1); P.rect('#ffc040', xc - ww / 4, y, ww / 2, 1); lava.push([xc, y, ww]); }
        arRocks(P, bx + 2, WH + 30, 4, '#4a3836'); arRocks(P, bx + 4, h - 4, 4, '#4a3836'); arPool(P, bx + 19, WH + 90, 26, 60, '#ff7a1a', .09);
        [[WH + 34], [WH + 100]].forEach(([ty]) => { const tx = sd ? bx + 3 : bx + 35; P.rect('#8a6a3a', tx, ty, 2, 24); P.rect('#6a4a2a', tx, ty, 1, 24); P.rect('#3a2a20', tx - 3, ty - 2, 8, 3); P.rect('#5a4030', tx - 2, ty + 8, 6, 1); P.rect('#5a4030', tx - 2, ty + 15, 6, 1); });   // antorchas de bambú
        arShade(P, bx, sd, 38, WH, h); });
      P.alpha('#ff7a1a', .05, 0, WH, w, h - WH);
      arOcclude(P, w, WH); return {cx, lava, torch: [[36, WH + 34], [36, WH + 100], [w - 34, WH + 34], [w - 34, WH + 100]], embers: arMotes(P, 34, w, h), smoke: Array.from({length: 7}, (_, i) => [cx - 6 + i * 2, i / 7])};
    },
    anim(c, t, d, w){
      arGlowC(c, d.cx, AR_WALL - 29, 18 + Math.sin(t * 2) * 2, '#ff8a2a', .4);
      d.smoke.forEach(([sx, ph], i) => { const k = (t * .18 + ph) % 1; c.globalAlpha = .38 * (1 - k); c.fillStyle = '#1a0e12'; const s = 6 + k * 14; c.fillRect(Math.round(sx + Math.sin(t + i) * 4 + k * 14 - s / 2), Math.round(AR_WALL - 32 - k * 30), Math.round(s), Math.round(s * .6)); }); c.globalAlpha = 1;
      d.lava.forEach(([x, y, ww], i) => { const s = Math.sin(t * 3 + i * .9 + y * .4); if(s > .72){ c.globalAlpha = .8; c.fillStyle = s > .9 ? '#fff0a0' : '#ffd060'; c.fillRect(Math.round(x - ww / 3 + (i * 7) % Math.max(2, Math.round(ww * .6))), y, 2, 1); } }); c.globalAlpha = 1;
      d.torch.forEach(([x, y], i) => { arFlame(c, x, y - 3, t, i, '#ff8a2a', '#ffe890'); arGlowC(c, x, y - 6, 12, '#ff8a2a', .22); });
      arMote(c, d.embers, t, w, '#ffb040', .95, 3, -14); }},

  // ---- Mallow · Selva Frondosa (Planta): selva densa de árboles gigantes con raíces enormes, hojas inmensas, flores tropicales, un camino de tierra y haces de luz entre las copas ----
  mallow: {dark: .1,
    build(P, w, h, WH){
      const mx = Math.round(w / 2);
      P.rect('#3a6a2a', 0, WH, w, h - WH); arSpeck(P, 0, WH, w, h - WH, 700, ['#4a8a38', '#2f5a24', '#58a044', '#386a2c']);
      arEll(P, mx, 112, 150, 50, '#6a4a2a'); arEll(P, mx, 110, 142, 46, '#86623a'); arSpeck(P, mx - 140, 70, 280, 80, 220, ['#9a7648', '#6a4a2a', '#a68450']);
      for(let i = 0; i < 70; i++){ const gx = P.r() * w, gy = WH + 8 + P.r() * (h - WH - 10); if(Math.pow((gx - mx) / 138, 2) + Math.pow((gy - 110) / 44, 2) < 1) continue; P.rect(['#58a044', '#4a8a38', '#7ac05a'][i % 3], gx, gy - 3, 1, 3); P.rect(['#58a044', '#4a8a38'][i & 1], gx + 2, gy - 4, 1, 4); P.px('#7ac05a', gx + 1, gy - 2); }   // matas de hierba            // camino de tierra
      for(let i = 0; i < 16; i++){ const an = i / 16 * 6.283; arRocks(P, mx + Math.cos(an) * 152, 111 + Math.sin(an) * 52, 1, '#7a766a'); }
      arGradR(P, 0, 0, w, WH, '#0c3220', '#245e30');                                                                                // fondo de selva umbría
      for(let i = 0; i < 6; i++){ const tx = Math.round(w * (.1 + i * .16)) + (i % 2) * 8, tw = 11 + (i % 3) * 3;                    // troncos del fondo
        P.rect('#2a2018', tx, 0, tw, WH + 3); for(let k = 1; k < tw - 1; k += 3) P.alpha('#5a4630', .6, tx + k, 0, 1, WH + 3); P.alpha('#3fa84a', .22, tx, 0, tw, WH + 3);
        for(let r = 0; r < 7; r++){ const rr = r * 1.7; P.rect('#2a2018', tx - rr, WH + 2 - r * .5, rr + 2, 2 + (r >> 1)); P.rect('#2a2018', tx + tw - 2, WH + 2 - r * .5, rr + 2, 2 + (r >> 1)); } }
      for(let x = -2; x < w; x += 4){ [[4, 12], [11, 14]].forEach(([yy, s], q) => arFrond(P, x + q * 2, yy + 8 + (HH(x, q + 3) * 8 | 0), s + (HH(x, q + 6) * 7 | 0), ['#1a6a30', '#2a8a40', '#3fa84a', '#14562a', '#58c05a'][(HH(x, q + 8) * 5) | 0], HH(x, q + 1) < .5 ? 1 : -1)); }   // dosel de hojas
      for(let i = 0; i < 22; i++) arVine(P, 8 + ((i * 53) % (w - 16)), 14, 8 + (i * 7) % 18, '#2f6a2a', ['#3fa84a', '#58c05a'][i & 1]);
      [mx - 90, mx - 12, mx + 70].forEach((fx, i) => { P.rect('#2f6a2a', fx, WH - 12, 2, 12); arEll(P, fx + 1, WH - 15, 6, 4, ['#ff5a7a', '#ffb02a', '#ff7ae0'][i], .95); arEll(P, fx + 1, WH - 15, 3, 2, '#ffe060'); });          // flores gigantes
      const sh = [mx - 52, mx + 40, mx + 104]; sh.forEach(sx => arCone(P, sx, 0, 8, 40, h - 8, '#fff6b8', .13));                      // haces de luz
      [0, 1].forEach(sd => { const bx = sd ? w - 34 : 0, dir = sd ? -1 : 1;                                                          // troncos gigantes de los lados con raíces
        P.rect('#4a301c', bx, 0, 34, h); for(let k = 0; k < 34; k += 3){ P.alpha(k % 2 ? '#2a1a0e' : '#7a5230', .55, bx + k, 0, 1, h); } for(let y = 0; y < h; y += 7) P.alpha('#2a1a0e', .35, bx + ((y * 5) % 28), y, 4, 2);
        P.alpha('#3fa84a', .45, bx + (sd ? 0 : 20), 0, 14, h); for(let i = 0; i < 26; i++) P.alpha('#58c05a', .6, bx + (sd ? 0 : 18) + (HH(i, 4) * 14 | 0), HH(i, 5) * h | 0, 3, 2);
        for(let r = 0; r < 14; r++){ const rr = r * 2; P.rect('#4a301c', sd ? bx - rr : bx + 34, h - 14 + r, rr + 1, 1); P.rect('#4a301c', sd ? bx - rr * .6 : bx + 34, WH + 70 + r, rr * .6 + 1, 1); }
        arFrond(P, sd ? bx - 3 : bx + 36, WH + 40, 22, '#2f9a44', dir); arFrond(P, sd ? bx - 6 : bx + 40, WH + 44, 18, '#3fae58', dir); arFrond(P, sd ? bx - 2 : bx + 34, h - 8, 26, '#1f7a3a', dir); arFrond(P, sd ? bx - 12 : bx + 44, h - 6, 20, '#58c05a', dir);
        [['#ff4a5a', 22], ['#ffb02a', 54], ['#ff7ae0', 100], ['#ffffff', 136]].forEach(([col, fy], i) => arFlow(P, sd ? bx - 8 - (i % 2) * 6 : bx + 42 + (i % 2) * 6, WH + fy, col));
        arShade(P, bx, sd, 34, WH, h); });
      arOcclude(P, w, WH); return {sh, flies: Array.from({length: 14}, (_, i) => [20 + P.r() * (w - 40), WH + 6 + P.r() * (h - WH - 12), P.r()]), leaves: Array.from({length: 14}, (_, i) => [P.r() * w, P.r() * AR_H, P.r()]), pollen: arMotes(P, 26, w, h)};
    },
    anim(c, t, d, w){
      d.sh.forEach((sx, i) => { c.globalAlpha = .05 + .04 * Math.sin(t * 1.4 + i * 2); c.fillStyle = '#fff6b8'; for(let y = 0; y < 150; y += 2){ const ww = 8 + y * .22; c.fillRect(Math.round(sx - ww / 2), y, Math.round(ww), 2); } }); c.globalAlpha = 1;
      d.flies.forEach(([x, y, ph], i) => { const fx = x + Math.sin(t * .8 + ph * 9) * 8, fy = y + Math.cos(t * .6 + ph * 7) * 5, a = .5 + .5 * Math.sin(t * 3 + i); arGlowC(c, fx, fy, 3, '#d8ff6a', .5 * a); c.globalAlpha = a; c.fillStyle = '#f4ffb0'; c.fillRect(Math.round(fx), Math.round(fy), 1, 1); }); c.globalAlpha = 1;
      arFall(c, d.leaves, t, w, '#3fa84a', .85, 2, 5, 2); arMote(c, d.pollen, t, w, '#fff6b8', .6, 2, -2); }},

  // ---- Sophocles · Observatorio Hokulani (Eléctrico): interior de la cúpula de acero con la rendija abierta al cielo estrellado, gran telescopio, consolas y racks con luces, bobinas y un anillo de luz en el suelo ----
  sophocles: {dark: .1,
    build(P, w, h, WH){
      const mx = Math.round(w / 2), orbs = [], leds = [], bars = [];
      arTiles(P, 0, WH, w, h - WH, 18, 18, (x, y) => (x + y) & 1 ? '#3c4560' : '#343c56', '#171c2e', .12); arSpeck(P, 0, WH, w, h - WH, 300, ['#5a6486', '#222a40', '#4a5472']);
      arRing(P, mx, 108, 112, 39, '#4af0ff', .55); arRing(P, mx, 108, 111, 38, '#4af0ff', .25); arRing(P, mx, 108, 104, 35, '#ffe04a', .4); arRing(P, mx, 108, 58, 21, '#4af0ff', .22);   // anillo de luz en el suelo
      for(let k = 0; k < 12; k++){ const an = k / 12 * 6.283; P.alpha('#4af0ff', .5, mx + Math.cos(an) * 112 - 1, 108 + Math.sin(an) * 39 - 1, 3, 3); }
      arGradR(P, 0, 0, w, WH, '#1f2740', '#3a4668');                                                                                // cúpula de acero
      for(let k = -14; k <= 14; k++){ for(let i = 0; i < WH; i++){ const xx = Math.round(mx + k * 3 + k * 5 * (i / WH)); P.alpha(k & 1 ? '#8a98c0' : '#0e1428', .35, xx, i, 1, 1); } }   // costillas radiales
      for(let y = 6; y < WH; y += 9) P.alpha('#0e1428', .35, 0, y, w, 1);
      for(let y = 0; y < WH - 4; y++){ const ww = 56 + Math.round(y * 1.3); P.rect(arMix('#050a22', '#2a4090', y / WH), mx - ww / 2, y, ww, 1); P.px('#8a98c0', mx - ww / 2 - 1, y); P.px('#8a98c0', mx + ww / 2, y); }   // rendija abierta al cielo
      arStars(P, mx - 34, 0, 68, WH - 6, 54, ['#ffffff', '#bfe0ff', '#ffe9a0']);
            for(let i = 0; i < 30; i++){ const t = i / 29, xc = mx + 38 - 32 * t, yy = WH - 2 - 30 * t, ww = 13 - 4 * t; P.rect('#9aa6bc', xc - ww / 2, yy, ww, 2); P.rect('#d8dee8', xc - ww / 2 + 1, yy, ww - 3, 2); P.alpha('#ffffff', .5, xc - ww / 2 + 1, yy, 2, 2); P.alpha('#000000', .3, xc + ww / 2 - 2, yy, 2, 2); }   // tubo del telescopio
      P.rect('#6a7288', mx + 30, WH - 6, 18, 6); P.rect('#4a5268', mx + 28, WH - 3, 22, 3); P.rect('#ffe04a', mx + 33, WH - 5, 3, 1); P.rect('#4af0ff', mx + 39, WH - 5, 3, 1);
      P.rect('#b8c4d8', mx + 4, 5, 10, 2); P.rect('#4af0ff', mx + 5, 5, 8, 1);                                                      // lente
      P.rect('#10162a', 0, WH - 15, w, 15); P.rect('#5a6486', 0, WH - 15, w, 1);                                                  // banco de monitores corrido
      for(let x = 40; x < w - 40; x += 17){ if(Math.abs(x - mx) < 36) continue; P.rect('#05080f', x, WH - 14, 14, 10); const cc = ['#4af0ff', '#4aff9a', '#ffe04a'][(x / 17 | 0) % 3];
        for(let k = 0; k < 4; k++) P.alpha(cc, .85, x + 1, WH - 13 + k * 2, 3 + ((x + k * 5) % 9), 1); bars.push([x + 1, WH - 13, cc]); P.rect('#2a3250', x + 5, WH - 4, 4, 2); }
      [0, 1].forEach(sd => { const bx = sd ? w - 36 : 0;                                                                              // racks de servidores y bobinas
        P.rect('#1a2036', bx, WH, 36, h - WH);
        for(let y = WH + 4; y < h - 12; y += 15){ P.rect('#0c1020', bx + 3, y, 30, 12); P.rect('#3a4468', bx + 3, y, 30, 1);
          for(let k = 0; k < 6; k++){ P.rect('#222a44', bx + 5, y + 2 + k * 1.6, 17, 1); } for(let k = 0; k < 4; k++){ const lx = bx + 25 + k * 2, ly = y + 3 + (k % 2) * 4; leds.push([lx, ly, ['#4aff9a', '#ffe04a', '#ff5a4a', '#4af0ff'][k]]); P.px('#10162a', lx, ly); } }
        const ox = sd ? bx + 8 : bx + 28, oy = WH + 76; P.rect('#5a6486', ox - 1, oy, 3, 30); P.rect('#8a98c0', ox - 1, oy, 1, 30); P.rect('#2a3250', ox - 5, oy + 29, 11, 3); P.rect('#3a4468', ox - 3, oy - 3, 7, 4); arEll(P, ox, oy - 6, 4, 4, '#aab6d8'); orbs.push([ox, oy - 6]);   // bobina Tesla
        for(let i = 0; i < 3; i++) arCrack(P, bx + (sd ? 4 : 30), h - 10 + i, 1, '#ffe04a', 0, 1, 0);
        arShade(P, bx, sd, 36, WH, h); });
      arOcclude(P, w, WH); return {mx, orbs, leds, bars, ring: [mx, 108, 112, 39], stars: Array.from({length: 24}, () => [mx - 32 + P.r() * 64, P.r() * (WH - 8), P.r()])};
    },
    anim(c, t, d, w){
      d.stars.forEach(([x, y, ph]) => { const s = Math.sin(t * 3 + ph * 30); c.globalAlpha = Math.max(0, s) * .9; c.fillStyle = '#ffffff'; c.fillRect(Math.round(x), Math.round(y), 1, 1); }); c.globalAlpha = 1;
      d.leds.forEach(([x, y, col], i) => { if(Math.sin(t * 4 + i * 1.7) > -.2){ c.fillStyle = col; c.fillRect(x, y, 1, 1); } });
      d.bars.forEach(([x, y, col], i) => { const k = Math.floor(t * 6 + i) % 4; c.globalAlpha = .9; c.fillStyle = col; c.fillRect(x + 8, y + k * 2, 3 + (i % 3), 1); }); c.globalAlpha = 1;
      d.orbs.forEach(([x, y], i) => { arGlowC(c, x, y, 7 + Math.sin(t * 8 + i) * 1.5, '#8ae8ff', .45); if(Math.sin(t * 5 + i * 2.4) > .55) arBolt(c, x, y, x + (i ? -9 : 9) + Math.sin(t * 30) * 3, y - 8 + Math.cos(t * 23) * 3, Math.floor(t * 14) + i, '#fffbc0', '#4af0ff'); });
      const [rx, ry, a, b] = d.ring; const an = t * .9; arGlowC(c, rx + Math.cos(an) * a, ry + Math.sin(an) * b, 3, '#4af0ff', .7); arGlowC(c, rx + Math.cos(an + 3.14) * a, ry + Math.sin(an + 3.14) * b, 3, '#ffe04a', .6); }},

  // ---- Acerola · Supermercado Ahorra Mucho (Fantasma): súper abandonado de la ruta 14. Estanterías casi vacías con productos viejos, carros volcados, telarañas, tubos fluorescentes que parpadean y fantasmas ----
  acerola: {dark: .38,
    build(P, w, h, WH){
      const mx = Math.round(w / 2), tubes = [];
      arTiles(P, 0, WH, w, h - WH, 20, 20, (x, y) => (x + y) & 1 ? '#66766a' : '#566658', '#262e26', .08);                          // linóleo sucio
      for(let i = 0; i < 46; i++) arEll(P, P.r() * w, WH + 6 + P.r() * (h - WH - 8), 6 + P.r() * 14, 2 + P.r() * 5, ['#2a2418', '#1c241c', '#3a3220'][i % 3], .25);        // manchas y mugre
      arSpeck(P, 0, WH, w, h - WH, 420, ['#7a8a7a', '#1c221c', '#4a5848']); [[30, 70, 18, 1, 1], [w - 40, 120, 20, -1, 1], [mx - 100, 150, 16, 1, 0], [mx + 80, 168, 18, 1, 0]].forEach(([gx, gy, ln, dx, dy]) => arCrack(P, gx, gy, ln, '#12161a', dx, dy, .5));
      P.rect('#4a5a50', 0, 0, w, WH); for(let x = 0; x < w; x += 12) P.alpha('#000000', .12, x, 0, 1, WH);                                // pared de azulejo mugriento
      P.rect('#8a2a2a', mx - 40, 3, 80, 12); P.rect('#4a1414', mx - 40, 14, 80, 1); P.rect('#c8a0a0', mx - 40, 3, 80, 1);                   // cartel
      arTxt(P, 'THRIFTY MEGAMART', mx - 33, 6, '#e8e0c8', 1); P.alpha('#000000', .35, mx - 14, 3, 6, 12); P.rect('#4a5a50', mx + 30, 2, 12, 4);   // letras y un trozo roto
      [[10, mx - 46], [mx + 46, w - 10]].forEach(([x0, x1]) => { for(let x = x0; x < x1 - 14; x += 20){                                    // estanterías del fondo
        P.rect('#2a2418', x, 17, 18, WH - 18); [0, 1, 2].forEach(r => { const sy = 18 + r * 6; P.rect('#6a5a3a', x, sy + 5, 18, 1);
          for(let k = 0; k < 5; k++){ if(P.r() < .45) continue; const bh = 3 + (P.r() * 3 | 0); P.rect(['#a86a3a', '#4a6a8a', '#8a8a4a', '#9a4a4a', '#5a7a5a'][(P.r() * 5) | 0], x + 1 + k * 3, sy + 5 - bh, 2 + (P.r() * 2 | 0), bh); } }); P.rect('#1a1610', x, 17, 1, WH - 18); } });
      P.rect('#06080a', mx - 28, 16, 56, WH - 16); P.rect('#2a3230', mx - 28, 16, 56, 1); P.alpha('#8a2aff', .1, mx - 28, 16, 56, WH - 16);          // pasillo oscuro del fondo
      for(let x = 22; x < w - 22; x += 56){ if(Math.abs(x + 11 - mx) < 20 && false) continue; P.rect('#10140f', x - 2, 0, 26, 4); P.rect('#7a8a76', x, 1, 22, 2); tubes.push([x, 1, 22]); P.rect('#1a1e18', x + 10, 4, 1, 1); }   // tubos fluorescentes
      [[mx - 70, 22], [mx + 62, 30]].forEach(([hx, hl]) => { arHang(P, hx, 4, 4 + hl, '#5a625a'); arHang(P, hx + 14, 4, 4 + hl - 4, '#5a625a'); P.rect('#d8d0a8', hx, 4 + hl, 15, 6); P.rect('#6a5a3a', hx, 4 + hl, 15, 1); P.rect('#a83a2a', hx + 2, 4 + hl + 2, 4, 2); P.rect('#2a6a3a', hx + 8, 4 + hl + 2, 4, 2); });   // carteles de pasillo colgando
      arWeb(P, 12, 10, 14, 6, 4, '#d8e0d8', .35); arWeb(P, w - 12, 10, 14, 6, 4, '#d8e0d8', .35);
      [0, 1].forEach(sd => { const bx = sd ? w - 36 : 0, dir = sd ? -1 : 1;                                                           // bandas laterales: carros volcados, cajas y congelador
        P.rect('#303a34', bx, WH, 36, h - WH); arBricks(P, bx, WH, 36, h - WH, 12, 8, '#3a463e', '#1a201c', .12);
        if(!sd){ [[WH + 40, 0], [WH + 112, 1]].forEach(([cy, k]) => { for(let i = 0; i < 18; i++){ P.rect('#aab4b8', bx + 4 + i, cy + (k ? i * .3 : -i * .3), 1, 8); } P.rect('#aab4b8', bx + 4, cy + (k ? 0 : -5), 19, 1); P.rect('#6a7478', bx + 6, cy + 9, 3, 3); P.rect('#6a7478', bx + 18, cy + 9, 3, 3); P.rect('#aab4b8', bx + 2, cy - 2, 5, 1); }); }
        else { P.rect('#8a9aa0', bx + 4, WH + 30, 30, 50); P.rect('#0a1418', bx + 6, WH + 34, 26, 42); P.alpha('#8ae8ff', .22, bx + 6, WH + 34, 26, 42); P.rect('#d8e8ee', bx + 4, WH + 30, 30, 2); P.alpha('#ffffff', .2, bx + 8, WH + 36, 2, 38);
          P.rect('#5a6a70', bx + 6, WH + 100, 28, 12); P.rect('#1a2024', bx + 6, WH + 100, 28, 3); P.rect('#e8e0c8', bx + 8, WH + 94, 3, 6); }
        [[WH + 140, 14], [WH + 8, 10]].forEach(([by, bw], i) => { P.rect('#a08a5a', bx + 5 + i * 9, by, bw, 9); P.rect('#6a5a38', bx + 5 + i * 9, by, bw, 1); P.alpha('#000000', .3, bx + 5 + i * 9, by + 6, bw, 3); });
        for(let k = 0; k < 6; k++) P.rect(['#a83a2a', '#c8c8c0', '#3a6a9a'][k % 3], bx + 6 + (k * 5) % 24, h - 5 - (k % 2) * 3, 3, 4);
        arShade(P, bx, sd, 36, WH, h); });
      arOcclude(P, w, WH); return {tubes, mx, wisps: arMotes(P, 18, w, h)};
    },
    anim(c, t, d, w){
      d.tubes.forEach(([x, y, ww], i) => { const f = Math.sin(t * 17 + i * 5) * Math.sin(t * 5.3 + i * 2.1), on = (i === 1) ? f > .1 : (Math.sin(t * .9 + i * 2) > -.55 || f > .6);
        if(on){ c.fillStyle = '#e8f8d8'; c.fillRect(x, y, ww, 2); c.globalAlpha = .08 + (i === 1 ? .04 * f : 0); for(let k = 0; k < 100; k++){ const cw = 18 + k * .5; c.fillRect(Math.round(x + ww / 2 - cw / 2), 3 + k, Math.round(cw), 1); } c.globalAlpha = 1; } });
      const gx = d.mx + Math.sin(t * .35) * 80, gy = 26 + Math.sin(t * .8) * 3; c.globalAlpha = .2 + .08 * Math.sin(t * 2); c.fillStyle = '#d8c8ff'; c.fillRect(Math.round(gx - 5), Math.round(gy - 6), 10, 9); c.fillRect(Math.round(gx - 4), Math.round(gy + 3), 2, 3); c.fillRect(Math.round(gx), Math.round(gy + 3), 2, 4); c.fillRect(Math.round(gx + 3), Math.round(gy + 3), 2, 3);
      c.globalAlpha = .7; c.fillStyle = '#1a0a2a'; c.fillRect(Math.round(gx - 3), Math.round(gy - 3), 2, 2); c.fillRect(Math.round(gx + 2), Math.round(gy - 3), 2, 2); c.globalAlpha = 1;
      arMote(c, d.wisps, t, w, '#b88aff', .8, 4, -6); }},

  // ---- Mina · Aldea Marina (Hada): barcos amarrados convertidos en casitas de colores pastel, banderines, farolillos, velas pintadas y una cubierta de madera con adornos de cuento de hadas ----
  mina: {dark: .02,
    build(P, w, h, WH){
      const mx = Math.round(w / 2), flags = [], lamps = [];
      arGradR(P, 0, 0, w, WH - 8, '#ffbcd8', '#c4e4ff');                                                                           // cielo pastel
      [[20, 6, .7], [90, 14, .5], [150, 4, .8], [230, 12, .6], [300, 6, .7], [380, 13, .5]].forEach(([x, y, s]) => { if(x < w) arCloud(P.c, x, y, s, .85); });
      arGradR(P, 0, WH - 10, w, 10, '#62d0ec', '#2a9ac8'); for(let i = 0; i < 40; i++) arWave(P, P.r() * w, WH - 9 + P.r() * 8, 3 + (P.r() * 5 | 0), '#e8faff', .4);   // mar
      const cols = [['#ff9ac0', '#fff0a0', '#e0709a'], ['#7ad8d0', '#ffe0f0', '#3aa8a0'], ['#ffc86a', '#d8f0ff', '#e89a3a'], ['#b89aff', '#fff4d8', '#8a6ad8'], ['#8ae0a0', '#ffe8e0', '#4ab870']];
      const nShips = Math.max(5, Math.floor(w / 80));
      for(let i = 0; i < nShips; i++){ const bx = Math.round(14 + i * (w - 80) / (nShips - 1)), [roof, wall, hull] = cols[i % 5], hy = WH - 6, big = i % 2;
        for(let r = 0; r < 7; r++){ const inset = Math.round((6 - r) * .7); P.rect(hull, bx + inset, hy + r - 3, 46 - inset * 2, 1); } P.rect(arDrk(hull, .35), bx + 3, hy + 3, 40, 1); P.rect(arLit(hull, .35), bx, hy - 3, 46, 1);   // casco
        const ww2 = big ? 26 : 22, wh2 = big ? 14 : 11, wx = bx + 10 + (big ? 0 : 2), wy = hy - 3 - wh2;
        P.rect(wall, wx, wy, ww2, wh2); P.alpha('#000000', .15, wx + ww2 - 4, wy, 4, wh2); P.rect('#ffe890', wx + 3, wy + 3, 4, 4); P.rect('#ffe890', wx + ww2 - 8, wy + 3, 4, 4); P.rect('#8a5a30', wx + (ww2 >> 1) - 1, wy + wh2 - 5, 3, 5); P.rect('#fff', wx + 4, wy + 4, 1, 1);
        for(let r = 0; r < 8; r++){ const rw = ww2 + 6 - r * 3; if(rw < 2) break; P.rect(roof, wx - 3 + r * 1.5, wy - r - 1, rw, 1); } P.rect(arLit(roof, .4), wx - 3, wy - 1, ww2 + 6, 1);   // tejado
        const mastX = wx + (ww2 >> 1), my = wy - 9; P.rect('#6a4a2a', mastX, my - 6, 1, 8); flags.push([mastX + 1, my - 6, roof]);
        lamps.push([bx + 4, hy - 1], [bx + 41, hy - 1]); P.rect('#6a4a2a', bx + 4, hy - 3, 1, 2); P.rect('#6a4a2a', bx + 41, hy - 3, 1, 2); }
      for(let x = 0; x < w - 40; x += 60){ for(let i = 0; i <= 60; i++){ const yy = 4 + Math.round(Math.sin(i / 60 * Math.PI) * 4); P.px('#fff0f8', x + i, yy); if(i % 6 === 3) P.rect(['#ff7ab8', '#ffd84a', '#7ad8d0', '#b89aff'][(i / 6 | 0) % 4], x + i - 1, yy + 1, 3, 3); } }   // banderines
      arDeck(P, 0, WH, w, h - WH, '#dcb07e', 9, .14); for(let i = 0; i < 40; i++) P.alpha('#ffffff', .12, P.r() * w, WH + 4 + P.r() * (h - WH), 5, 1);       // cubierta
      arRing(P, mx, 108, 120, 42, '#ff7ab8', .6); arRing(P, mx, 108, 116, 40, '#ff7ab8', .35); arRing(P, mx, 108, 70, 24, '#4ac8c0', .45);          // dibujo pintado en la cubierta
      for(let k = 0; k < 16; k++){ const an = k / 16 * 6.283; P.alpha(['#ff9ad0', '#7ad8d0', '#ffd84a', '#b89aff'][k & 3], .45, Math.round(mx + Math.cos(an) * 120) - 1, Math.round(108 + Math.sin(an) * 42) - 1, 3, 3); }
      [0, 1].forEach(sd => { const bx = sd ? w - 34 : 0;                                                                              // bandas: mástil con vela pintada, barriles, caballete
        P.rect('#c89a64', bx, WH, 34, h - WH); for(let y = WH; y < h; y += 9) P.alpha('#000000', .18, bx, y, 34, 1);
        P.rect('#7a4a28', sd ? bx + 24 : bx + 2, WH - 6, 8, h - WH + 6); P.rect('#a8743e', sd ? bx + 24 : bx + 2, WH - 6, 2, h - WH + 6); P.rect('#ffd84a', sd ? bx + 25 : bx + 3, WH + 30, 6, 1); P.rect('#ffd84a', sd ? bx + 25 : bx + 3, WH + 90, 6, 1);
        arDrape(P, sd ? bx + 2 : bx + 12, WH + 6, WH + 76, 20, sd ? '#ffb0d8' : '#a8e8f0', '#ffffff', .45);                              // vela pintada
        arEll(P, sd ? bx + 12 : bx + 22, WH + 42, 4, 4, '#ff7ab8'); arFlow(P, sd ? bx + 12 : bx + 22, WH + 42, '#ffd84a', '#ff7ab8'); P.rect('#7ad8d0', sd ? bx + 6 : bx + 16, WH + 56, 10, 3); P.rect('#b89aff', sd ? bx + 8 : bx + 18, WH + 24, 6, 3);
        P.rect('#8a5a30', sd ? bx + 6 : bx + 14, WH + 106, 16, 20); P.rect('#6a4220', sd ? bx + 6 : bx + 14, WH + 112, 16, 2); P.rect('#6a4220', sd ? bx + 6 : bx + 14, WH + 120, 16, 2); arEll(P, sd ? bx + 14 : bx + 22, WH + 106, 8, 2, '#a8743e');
        arPot(P, sd ? bx + 4 : bx + 14, h - 20, '#ff7ab8');
        arShade(P, bx, sd, 34, WH, h); });
      arOcclude(P, w, WH); return {flags, lamps, sp: arMotes(P, 28, w, h), sea: Array.from({length: 26}, () => [P.r() * w, WH - 9 + P.r() * 8, P.r()])};
    },
    anim(c, t, d, w){
      d.flags.forEach(([x, y, col], i) => { c.fillStyle = col; const k = Math.round(Math.sin(t * 5 + i * 1.3) * 1); c.fillRect(x, y, 4, 2); c.fillRect(x + 4, y + k, 2, 2); c.fillRect(x + 6, y + k * 2, 1, 1); });
      d.lamps.forEach(([x, y], i) => { const a = .5 + .5 * Math.sin(t * 2.5 + i * 1.7); arGlowC(c, x, y, 5, '#fff0a0', .35 * a); c.globalAlpha = .6 + .4 * a; c.fillStyle = '#fff6b8'; c.fillRect(x, y, 1, 2); c.globalAlpha = 1; });
      d.sea.forEach(([x, y, ph]) => { const s = Math.sin(t * 2.2 + ph * 20); if(s > .5){ c.globalAlpha = (s - .5) * 2; c.fillStyle = '#ffffff'; c.fillRect(Math.floor(x), Math.floor(y), 2, 1); } }); c.globalAlpha = 1;
      arMote(c, d.sp, t, w, '#ffd0f0', .8, 3, -4); arMote(c, d.sp.map(([x, y, p]) => [(x + 40) % w, y, p]), t, w, '#d8fff4', .6, -3, -3); }},

  // ---- Hala · Poblado Iki (Lucha): aldea tradicional hawaiana al atardecer. Chozas de paja con vigas de madera, tótems tiki tallados, antorchas de bambú, guirnaldas de flores y un círculo ceremonial de piedras de lava ----
  hala: {dark: .06,
    build(P, w, h, WH){
      const mx = Math.round(w / 2);
      arGradR(P, 0, 0, w, WH - 8, '#e8884a', '#fcd48a'); arEll(P, mx - 78, WH - 10, 12, 12, '#fff2b8', .9); arEll(P, mx - 78, WH - 10, 18, 18, '#fff2b8', .25);   // atardecer
      arGradR(P, 0, WH - 8, w, 8, '#4a9ac0', '#7ac4d8'); for(let i = 0; i < 24; i++) arWave(P, P.r() * w, WH - 7 + P.r() * 6, 3 + (P.r() * 5 | 0), '#ffe8b0', .5);          // mar
      for(let i = 0; i < 7; i++) arPalm(P, 16 + i * Math.round((w - 40) / 6) + (i % 2) * 7, WH - 2, 22 + (i % 3) * 5, (i % 2 ? -3 : 3), ['#2a8a3a', '#3a9a44', '#1f7a34'][i % 3]);   // palmeras
      [[mx - 112, 40, 20], [mx - 30, 48, 24], [mx + 56, 42, 22]].forEach(([hx, hw, hh]) => {                                         // chozas de paja
        P.rect('#6a4220', hx, WH - 12, hw, 12); P.rect('#8a5a30', hx + 2, WH - 12, 2, 12); P.rect('#8a5a30', hx + hw - 4, WH - 12, 2, 12); P.rect('#1a0e08', hx + (hw >> 1) - 4, WH - 10, 8, 10);
        for(let r = 0; r < hh - 6; r++){ const rw = hw + 8 - Math.round(r * (hw + 8) / (hh - 4)); if(rw < 2) break; P.rect(r % 2 ? '#c8a048' : '#b48a38', hx - 4 + Math.round(r * (hw + 8) / (hh - 4) / 2), WH - 13 - r, rw, 1); if(r % 3 === 0) P.alpha('#fff0a0', .3, hx - 3 + (r >> 1), WH - 13 - r, rw - 2, 1); }
        P.rect('#4a2e14', hx - 4, WH - 13, hw + 8, 1); for(let k = 0; k < hw + 8; k += 3) P.px('#8a6a28', hx - 4 + k, WH - 12); });
      for(let x = 14; x < w - 14; x += 22){ if(HH(x, 2) < .5) continue; for(let i = 0; i <= 22; i++) P.px(['#ff5a7a', '#ffd84a', '#ffffff', '#ff9a3a'][((x + i) / 2 | 0) % 4], x + i, WH - 6 + Math.round(Math.sin(i / 22 * Math.PI) * 3)); }   // guirnaldas de flores
      P.rect('#d8b878', 0, WH, w, h - WH); arSpeck(P, 0, WH, w, h - WH, 520, ['#e8cc94', '#b89458', '#c8a468']);
      arEll(P, mx, 108, 134, 48, '#a08050'); arEll(P, mx, 108, 130, 45, '#e4c88e'); arSpeck(P, mx - 126, 66, 252, 84, 180, ['#f0d8a0', '#c8a468']);       // círculo ceremonial
      for(let k = 0; k < 56; k++){ const an = k / 56 * 6.283, sx = Math.round(mx + Math.cos(an) * 133), sy = Math.round(108 + Math.sin(an) * 47); P.rect('#2a2220', sx - 3, sy - 1, 7, 5); P.rect('#4a3c36', sx - 2, sy - 2, 5, 4); P.alpha('#ffffff', .22, sx - 2, sy - 2, 3, 1); }   // piedras de lava
      const torch = [];
      [0, 1].forEach(sd => { const bx = sd ? w - 34 : 0;                                                                              // bandas: tótems tiki y antorchas
        P.rect('#c8a468', bx, WH, 34, h - WH); arSpeck(P, bx, WH, 34, h - WH, 140, ['#e8cc94', '#9a7a48']);
        [[WH + 16, '#c83a2a'], [WH + 80, '#2a8a9a']].forEach(([ty, pc], q) => { const tx = bx + 7;
          for(let b = 0; b < 3; b++){ const by = ty + b * 18; P.rect('#4a2e14', tx, by, 20, 18); P.rect('#7a4a28', tx + 1, by + 1, 18, 16); P.alpha('#ffffff', .12, tx + 1, by + 1, 18, 1); P.rect(pc, tx + 3, by + 3, 14, 2); P.rect('#f4ecd0', tx + 5, by + 6, 4, 3); P.rect('#f4ecd0', tx + 11, by + 6, 4, 3); P.rect('#1a0e08', tx + 7, by + 7, 2, 2); P.rect('#1a0e08', tx + 13, by + 7, 2, 2); P.rect('#1a0e08', tx + 6, by + 12, 8, 3); P.rect('#f4ecd0', tx + 7, by + 12, 1, 2); P.rect('#f4ecd0', tx + 9, by + 12, 1, 2); P.rect('#f4ecd0', tx + 11, by + 12, 1, 2); }
          P.rect(pc, tx - 4, ty + 22, 4, 6); P.rect(pc, tx + 20, ty + 22, 4, 6); P.rect('#4a2e14', tx - 1, ty - 2, 22, 2); });
        const qx = sd ? bx + 2 : bx + 30; [WH + 60, WH + 130].forEach(ty => { P.rect('#8a6a3a', qx, ty, 2, 26); P.rect('#6a4a2a', qx, ty, 1, 26); P.rect('#3a2a20', qx - 3, ty - 2, 8, 3); P.rect('#5a4030', qx - 1, ty + 9, 4, 1); P.rect('#5a4030', qx - 1, ty + 17, 4, 1); torch.push([qx + 1, ty - 3]); });
        arShade(P, bx, sd, 34, WH, h); });
      arOcclude(P, w, WH); return {torch, embers: arMotes(P, 24, w, h), petals: Array.from({length: 12}, () => [P.r() * w, P.r() * AR_H, P.r()]), sun: [mx - 78, WH - 10]};
    },
    anim(c, t, d, w){
      arGlowC(c, d.sun[0], d.sun[1], 20 + Math.sin(t) * 1.5, '#fff0a0', .22);
      d.torch.forEach(([x, y], i) => { arFlame(c, x, y, t, i, '#ff8a2a', '#ffe890'); arGlowC(c, x, y - 4, 11, '#ff8a2a', .22); });
      arMote(c, d.embers, t, w, '#ffb040', .85, 2, -9); arFall(c, d.petals, t, w, '#ff7a9a', .8, 4, 5, 2); }},

  // ---- Olivia · Ruinas de la Vida (Roca): ruinas antiguas de Alola en la selva. Muralla de bloques gigantes, monolitos tallados con glifos que brillan, escalinata, suelo de losas con musgo y un círculo de runas ----
  olivia: {dark: .12,
    build(P, w, h, WH){
      const mx = Math.round(w / 2), runes = [];
      arTiles(P, 0, WH, w, h - WH, 30, 24, (x, y) => ['#7c7666', '#726c5c', '#847e6c', '#6a6454'][(x * 3 + y * 5) % 4], '#26241e', .1); arSpeck(P, 0, WH, w, h - WH, 400, ['#9a9480', '#3a362c', '#8a8470']);
      for(let i = 0; i < 40; i++) arEll(P, P.r() * w, WH + 6 + P.r() * (h - WH - 10), 5 + P.r() * 12, 2 + P.r() * 4, ['#3a7a34', '#4a8a3a', '#2f6a2c'][i % 3], .3);   // musgo
      [[40, 56, 18, 1, 1], [w - 60, 100, 22, -1, 1], [mx - 150, 150, 16, 1, 0], [mx + 120, 160, 18, 1, 0], [mx + 40, 64, 14, 1, 0]].forEach(([gx, gy, ln, dx, dy]) => arCrack(P, gx, gy, ln, '#1a1812', dx, dy, .5));
      arRing(P, mx, 108, 112, 38, '#5af0d0', .4); arRing(P, mx, 108, 104, 34, '#5af0d0', .22);                                      // círculo de runas
      for(let k = 0; k < 14; k++){ const an = k / 14 * 6.283, rx = Math.round(mx + Math.cos(an) * 108), ry = Math.round(108 + Math.sin(an) * 36); P.rect('#2a2820', rx - 2, ry - 2, 5, 5); P.alpha('#5af0d0', .55, rx - 1, ry - 1, 3, 3); runes.push([rx, ry]); }
      arGradR(P, 0, 0, w, WH, '#5a9aa0', '#a8d0b4');                                                                                // cielo brumoso
      for(let i = 0; i < 30; i++) arEll(P, (i * 41) % w, 12 + (i * 7) % 18, 12 + (i % 4) * 5, 6 + (i % 3) * 2, ['#1f5a34', '#2a6a3a', '#164a2a'][i % 3], .9);                // selva detrás
      arBricks(P, 0, 12, w, WH - 12, 24, 12, '#8a8272', '#46423a', .16); P.alpha('#2f6a2c', .3, 0, 12, w, WH - 12); for(let i = 0; i < 36; i++) arEll(P, (i * 37) % w, 14 + (i * 11) % 18, 5, 2, '#3f8a3a', .6);   // muralla con musgo
      for(let s = 0; s < 6; s++){ const sw = 112 - s * 15; P.rect(arDrk('#a09680', s * .04), mx - sw / 2, WH - 5 - s * 5, sw, 5); P.rect('#d0c6aa', mx - sw / 2, WH - 5 - s * 5, sw, 1); P.alpha('#000000', .3, mx - sw / 2, WH - 1 - s * 5, sw, 1); }   // escalinata
      P.rect('#0e0c0a', mx - 11, 6, 22, WH - 24); P.alpha('#5af0d0', .1, mx - 11, 6, 22, WH - 24);                                  // hornacina oscura
      [mx - 56, mx + 44].forEach((px, i) => { P.rect('#4a463c', px - 1, 0, 16, WH - 4); P.rect('#8a8272', px, 0, 14, WH - 4); P.alpha('#ffffff', .15, px, 0, 3, WH - 4); P.alpha('#000000', .3, px + 11, 0, 3, WH - 4);   // monolitos
        arBitmap(P, ['.###.', '#...#', '#.#.#', '#..##', '.####'], px + 4, 6 + i * 2, 1, '#2a2820', 1); arBitmap(P, ['#.#.#', '.###.', '..#..', '.###.', '#.#.#'], px + 4, 17, 1, '#2a2820', 1); runes.push([px + 6, 10 + i * 2], [px + 6, 19]); });
      P.rect('#46423a', mx - 70, 0, 140, 5); P.rect('#8a8272', mx - 70, 0, 140, 4); for(let k = 0; k < 14; k++) P.rect('#2a2820', mx - 66 + k * 10, 1, 3, 2);   // dintel con muescas
      for(let i = 0; i < 18; i++) arVine(P, 8 + ((i * 57) % (w - 16)), 0, 6 + (i * 5) % 20, '#2f6a2a', ['#3fa84a', '#58c05a'][i & 1]);
      [0, 1].forEach(sd => { const bx = sd ? w - 32 : 0;                                                                              // bandas: rocas enormes y columnas rotas
        arRockEdge(P, w, h, WH, 24, [[WH + 44, 22, 8], [WH + 118, 24, 10]], '#7a7262', '#a89e88', '#4a463c');
        const cx = sd ? w - 18 : 18; arColumn(P, cx - 5, WH + 66, WH + 112, 11, '#8a8272'); P.rect('#6a6454', cx - 7, WH + 112, 15, 3); arRocks(P, cx - 12, WH + 118, 4, '#7a7262'); arRocks(P, sd ? w - 28 : 4, h - 4, 4, '#6a6454');
        P.alpha('#2f6a2c', .5, cx - 5, WH + 66, 11, 12); arFlow(P, cx - 9, WH + 120, '#ff5a7a'); arFlow(P, cx + 9, WH + 124, '#ffffff');
        arShade(P, bx, sd, 32, WH, h); });
      arOcclude(P, w, WH); return {runes, mx, motes: arMotes(P, 24, w, h)};
    },
    anim(c, t, d, w){
      const k = .5 + .5 * Math.sin(t * 1.6); c.globalAlpha = .12 + .3 * k; c.strokeStyle = '#8affe8'; c.lineWidth = 1; c.beginPath(); c.ellipse(d.mx, 108, 112, 38, 0, 0, 6.283); c.stroke(); c.globalAlpha = 1;
      d.runes.forEach(([x, y], i) => { arGlowC(c, x, y, 5, '#5af0d0', .22 + .2 * Math.sin(t * 1.6 + i * .5)); });
      for(let i = 0; i < 3; i++){ c.globalAlpha = .06 + .03 * Math.sin(t + i); c.fillStyle = '#fff6c8'; for(let y = 0; y < 150; y += 2){ const ww = 8 + y * .2; c.fillRect(Math.round(d.mx - 130 + i * 110 - ww / 2 + y * .15), y, Math.round(ww), 2); } } c.globalAlpha = 1;
      arMote(c, d.motes, t, w, '#fff6c8', .6, 2, -3); }},

  // ---- Acerola (Alto Mando) · trastienda del Supermercado Ahorra Mucho (Fantasma): almacén oscuro con luz espectral, estanterías rotas, cartel desgarrado, un congelador abierto que brilla, llamas fantasma y ojos en la oscuridad ----
  acerola_am: {dark: .42,
    build(P, w, h, WH){
      const mx = Math.round(w / 2), eyes = [], wisp = [];
      arTiles(P, 0, WH, w, h - WH, 20, 20, (x, y) => (x + y) & 1 ? '#2e2840' : '#282236', '#0e0a16', .06); arSpeck(P, 0, WH, w, h - WH, 320, ['#4a4262', '#14101e', '#3a3252']);
      for(let i = 0; i < 40; i++) arEll(P, P.r() * w, WH + 6 + P.r() * (h - WH - 8), 6 + P.r() * 14, 2 + P.r() * 5, '#0c0812', .35);
      [[26, 60, 20, 1, 1], [w - 50, 110, 22, -1, 1], [mx - 130, 160, 18, 1, 0], [mx + 70, 170, 20, 1, 0]].forEach(([gx, gy, ln, dx, dy]) => { arCrack(P, gx, gy, ln, '#b06aff', dx, dy, .5); arCrack(P, gx, gy + 1, ln, '#0a0610', dx, dy, .5); });
      arRing(P, mx, 108, 114, 40, '#b06aff', .55); arRing(P, mx, 108, 108, 37, '#b06aff', .25); arRing(P, mx, 108, 64, 23, '#b06aff', .28);               // círculo espectral
      for(let k = 0; k < 10; k++){ const an = k / 10 * 6.283; P.alpha('#e0c8ff', .5, Math.round(mx + Math.cos(an) * 114) - 1, Math.round(108 + Math.sin(an) * 40) - 1, 3, 3); if(Math.abs(Math.cos(an)) > .6) wisp.push([Math.round(mx + Math.cos(an + .3) * 124), Math.round(108 + Math.sin(an + .3) * 46)]); }
      P.rect('#2c2838', 0, 0, w, WH); for(let x = 0; x < w; x += 16){ P.alpha('#000000', .2, x, 0, 1, WH); } for(let y = 6; y < WH; y += 12) P.alpha('#000000', .15, 0, y, w, 1);   // pared de hormigón
      [7, 15].forEach((py, i) => { P.rect('#463e5a', 0, py, w, 3); P.rect('#6a5e88', 0, py, w, 1); P.alpha('#000000', .35, 0, py + 2, w, 1); for(let x = 12 + i * 20; x < w; x += 70) P.rect('#2a2238', x, py - 1, 3, 5); });   // tuberías
      [[10, mx - 36], [mx + 36, w - 10]].forEach(([x0, x1], q) => { for(let x = x0; x < x1 - 14; x += 22){ P.rect('#1a1626', x, 18, 20, WH - 19); P.rect('#3a3252', x, 18, 1, WH - 19); P.rect('#3a3252', x + 19, 18, 1, WH - 19);
        [0, 1, 2].forEach(r => { const sy = 20 + r * 5; P.rect('#4a4262', x, sy + 4, 20, 1); if(P.r() < .8){ const bw = 6 + (P.r() * 8 | 0), bh = 3 + (P.r() * 2 | 0), bxx = x + 1 + (P.r() * 8 | 0); P.rect('#7a6a52', bxx, sy + 4 - bh, bw, bh); P.alpha('#000000', .3, bxx, sy + 3 - bh + bh - 1, bw, 1); if(P.r() < .25) eyes.push([bxx + 2, sy + 4 - bh + 1, ['#ffe04a', '#ff4a4a', '#b06aff'][(P.r() * 3) | 0]]); } }); } });
      P.rect('#0a0812', mx - 20, 14, 40, WH - 14); P.rect('#cfd4e0', mx - 22, 14, 2, WH - 14); P.rect('#cfd4e0', mx + 20, 14, 2, WH - 14); P.rect('#cfd4e0', mx - 22, 12, 44, 2); arCone(P, mx, 14, 36, 120, h - 10, '#b88aff', .16); arPool(P, mx, WH + 30, 50, 16, '#b88aff', .3);   // congelador abierto
      P.rect('#e8e0c8', mx - 14, 17, 28, 5); arTxt(P, 'THRIFTY', mx - 13, 18, '#4a1a1a', 1); P.alpha('#2c2838', 1, mx + 3, 16, 5, 3); P.alpha('#000000', .3, mx - 14, 21, 28, 2);                    // cartel desgarrado
      [[mx - 86, 24], [mx + 72, 28]].forEach(([cx2, cl]) => { arHang(P, cx2, 3, 3 + cl, '#5a5272'); for(let k = 0; k < cl; k += 4) P.px('#8a7eaa', cx2 + 1, 3 + k); wisp.push([cx2, 3 + cl + 2]); });                    // cadenas con llamas
      [0, 1].forEach(sd => { const bx = sd ? w - 36 : 0;                                                                              // bandas: estantes caídos, cajas y carros
        P.rect('#1e1a2c', bx, WH, 36, h - WH); arBricks(P, bx, WH, 36, h - WH, 12, 8, '#2e2842', '#100c1c', .12);
        for(let i = 0; i < 26; i++){ const sx = bx + 4 + i, sy = WH + 36 + (sd ? -i * .8 : i * .8); P.rect('#4a4262', sx, sy, 1, 4); } P.rect('#4a4262', bx + 4, WH + 36, 26, 1);        // estantería inclinada
        P.rect('#7a6a52', bx + 6, WH + 76, 14, 10); P.rect('#5a4a38', bx + 6, WH + 76, 14, 1); P.rect('#7a6a52', bx + 16, WH + 66, 12, 9); P.rect('#5a4a38', bx + 22, WH + 100, 12, 8);
        for(let i = 0; i < 14; i++) P.rect('#8a9aa0', bx + 4 + i, WH + 120 + (sd ? i * .3 : -i * .3), 1, 8); P.rect('#8a9aa0', bx + 4, WH + 118, 15, 1); P.rect('#5a6a70', bx + 6, WH + 129, 3, 3); P.rect('#5a6a70', bx + 15, WH + 129, 3, 3);
        eyes.push([bx + (sd ? 12 : 22), WH + 46, '#ff4a4a'], [bx + (sd ? 16 : 26), WH + 46, '#ff4a4a']);
        arShade(P, bx, sd, 36, WH, h); });
      arOcclude(P, w, WH); return {eyes, wisp, mx, fog: arMotes(P, 22, w, h), sp: arMotes(P, 16, w, h)};
    },
    anim(c, t, d, w){
      d.wisp.forEach(([x, y], i) => { arFlame(c, x, y, t, i, '#9a4aff', '#e8d0ff'); arGlowC(c, x, y - 4, 10, '#a05aff', .26); });
      d.eyes.forEach(([x, y, col], i) => { if(Math.sin(t * 1.3 + i * 2.7) > -.7){ c.fillStyle = col; c.fillRect(x, y, 1, 1); c.fillRect(x + 3, y, 1, 1); c.globalAlpha = .25; c.fillRect(x - 1, y - 1, 3, 3); c.fillRect(x + 2, y - 1, 3, 3); c.globalAlpha = 1; } });
      const k = .5 + .5 * Math.sin(t * 1.3); c.globalAlpha = .25 + .35 * k; c.strokeStyle = '#d8b8ff'; c.lineWidth = 1; c.beginPath(); c.ellipse(d.mx, 108, 114, 40, 0, 0, 6.283); c.stroke(); c.globalAlpha = 1;
      arMote(c, d.fog, t, w, '#a07aff', .4, 5, -3); arMote(c, d.sp, t, w, '#e8d0ff', .8, 3, -7); }},

  // ---- Kahili · alturas de Alola y Aldea Marina (Volador): plataforma de madera elevada sobre el mar, con el cielo y el océano a los lados, nubes que pasan, gaviotas, mástiles con banderolas y barandilla de cuerda ----
  kahili: {dark: 0,
    build(P, w, h, WH){
      const mx = Math.round(w / 2), flags = [], dkx = 36, dkw = w - 72, dkb = h - 18;
      arGradR(P, 0, 0, w, h, '#3a8ee0', '#a8dcff');                                                                                 // cielo (a todo el alto: se ve a los lados y bajo la plataforma)
      arGradR(P, 0, WH - 14, w, 14, '#78d8f0', '#2a8ac8'); for(let i = 0; i < 60; i++) arWave(P, P.r() * w, WH - 13 + P.r() * 12, 3 + (P.r() * 6 | 0), '#f4ffff', .5);           // horizonte marino
      [[mx - 150, 9, 30, 5, '#3a9a7a'], [mx + 118, 7, 24, 4, '#4aaa84'], [mx - 40, 10, 16, 3, '#5ab090']].forEach(([ix, iy, rw, rh, col]) => { arEll(P, ix, WH - 11, rw, rh, col, .8); arEll(P, ix + 3, WH - 13, rw * .5, rh * .7, arLit(col, .2), .7); });   // islas lejanas
      for(let i = 0; i < 4; i++){ const sx = [mx - 90, mx + 10, mx + 70, mx - 190][i]; if(sx < 10 || sx > w - 20) continue; P.rect('#f4ecd0', sx, WH - 17, 1, 6); arBitmap(P, ['.#', '##', '##', '##'], sx + 1, WH - 17, 1, '#ffffff', 1); }   // barcos lejanos
      P.alpha('#ffffff', .3, 0, WH - 8, w, 1);
      [[8, 5, .9, 120], [60, 18, .6, 80], [140, 10, 1, 140], [220, 22, .7, 100], [300, 6, .8, 130], [380, 16, .6, 90]].forEach(([x, y, s]) => arCloud(P.c, x, y, s, .9));
      [[10, 70, 1.3], [w - 60, 100, 1.2], [20, 140, 1], [w - 40, 150, 1.4]].forEach(([x, y, s]) => arCloud(P.c, x, y, s, .85));   // nubes junto a la plataforma
      P.rect('#06182e', 0, h - 4, w, 4); P.alpha('#2a8ac8', .8, 0, h - 16, w, 12);
      P.alpha('#000000', .18, dkx + 2, dkb + 7, dkw, 6);
      arDeck(P, dkx, WH, dkw, dkb - WH, '#e2bc80', 9, .16); P.rect('#8a5a30', dkx, dkb, dkw, 5); P.rect('#5a3a1e', dkx, dkb + 3, dkw, 2); P.alpha('#ffffff', .25, dkx, dkb, dkw, 1);   // plataforma elevada
      for(let k = 0; k < 8; k++){ P.rect('#6a4626', dkx + 6 + k * Math.round((dkw - 18) / 7), dkb + 5, 4, 7); }
      arRing(P, mx, 108, 112, 38, '#ffffff', .4); arRing(P, mx, 108, 108, 36, '#8ad0ff', .3);                                         // marca de viento pintada
      for(let k = 0; k < 4; k++){ const yy = 86 + k * 14; for(let i = 0; i < 40; i++){ P.alpha('#ffffff', .12, mx - 120 + i * 6 + (k & 1) * 3, yy + Math.round(Math.sin(i * .4 + k) * 2), 4, 1); } }
      P.rect('#8a5a30', dkx, WH - 6, dkw, 2); P.rect('#c89a64', dkx, WH - 6, dkw, 1);                                              // barandilla del fondo
      for(let x = dkx; x <= dkx + dkw - 3; x += 16){ P.rect('#6a4626', x, WH - 8, 3, 8); P.rect('#a8743e', x, WH - 8, 1, 8); if(x + 16 <= dkx + dkw){ for(let i = 0; i < 13; i++) P.px('#e8d8a8', x + 3 + i, WH - 4 + Math.round(Math.sin(i / 13 * Math.PI) * 2)); } }
      [0, 1].forEach(sd => { const bx = sd ? w - 36 : 0, px = sd ? dkx + dkw - 4 : dkx - 1;                                         // lados abiertos: mástiles, barandilla y cuerdas
        P.rect('#6a4626', px, WH - 10, 5, dkb - WH + 12); P.rect('#a8743e', px, WH - 10, 2, dkb - WH + 12); P.rect('#4a2e18', px - 1, WH - 11, 7, 2);
        for(let y = WH + 12; y < dkb - 8; y += 14){ for(let i = 0; i < 12; i++) P.px('#e8d8a8', sd ? px + 5 + i : px - 1 - i, y + Math.round(Math.sin(i / 12 * Math.PI) * 3)); }
        const mxp = sd ? bx + 26 : bx + 10; P.rect('#7a4a28', mxp, 0, 5, h - 24); P.rect('#a8743e', mxp, 0, 2, h - 24); for(let y = 14; y < h - 30; y += 12) P.rect('#e8d8a8', mxp - 4, y, 13, 1);   // mástil con crucetas
        arDrape(P, sd ? mxp - 16 : mxp + 6, 18, 80, 14, '#ffffff', '#cfe8ff', .5); flags.push([sd ? mxp - 6 : mxp + 6, 8, sd ? '#ff7a8a' : '#ffd84a']); });
      arOcclude(P, w, WH); return {flags, clouds: [[20, 8, .9], [150, 24, .7], [290, 12, 1], [60, 30, .6]], birds: Array.from({length: 5}, (_, i) => [P.r() * w, 10 + P.r() * 90, .5 + P.r() * .6]), sea: Array.from({length: 24}, () => [P.r() * w, WH - 13 + P.r() * 12, P.r()])};
    },
    anim(c, t, d, w){
      d.clouds.forEach(([x, y, s], i) => arCloud(c, (((x + t * (3 + i)) % (w + 60)) + w + 60) % (w + 60) - 30, y, s, .5));
      d.birds.forEach(([x, y, sp], i) => { const bx = (((x + t * 12 * sp) % (w + 20)) + w + 20) % (w + 20) - 10, by = y + Math.sin(t * .8 + i) * 4, fl = Math.sin(t * 7 + i * 2) > 0 ? 1 : -1; c.fillStyle = '#f4f4ff'; c.fillRect(Math.round(bx), Math.round(by), 2, 1); c.fillRect(Math.round(bx) - 2, Math.round(by) - fl, 2, 1); c.fillRect(Math.round(bx) + 2, Math.round(by) - fl, 2, 1); });
      d.flags.forEach(([x, y, col], i) => { c.fillStyle = col; const k = Math.round(Math.sin(t * 6 + i) * 1); c.fillRect(x, y, 5, 3); c.fillRect(x + 5, y + k, 3, 2); c.fillRect(x + 8, y + k * 2, 2, 1); });
      d.sea.forEach(([x, y, ph]) => { const s = Math.sin(t * 2.4 + ph * 20); if(s > .5){ c.globalAlpha = (s - .5) * 2; c.fillStyle = '#ffffff'; c.fillRect(Math.floor(x), Math.floor(y), 2, 1); } }); c.globalAlpha = 1; }},

  // ---- Kukui · Estadio Manalo (Campeón): enorme estadio de la Liga de Alola en el monte Lanakila. Gradas de tres alturas llenas de gente, torres de focos, columnas con oro, estandartes con el símbolo de la Liga, cumbres nevadas al fondo y un campo de piedra dorada ----
  kukui: {dark: .02,
    build(P, w, h, WH){
      const mx = Math.round(w / 2), towers = [], crowd = [];
      arTiles(P, 0, WH, w, h - WH, 24, 22, (x, y) => (x + y) & 1 ? '#dccaa0' : '#d0bd92', '#a08c64', .1); arSpeck(P, 0, WH, w, h - WH, 300, ['#f0e0b8', '#b8a478']);
      arEll(P, mx, 108, 80, 29, '#e8dcc0', .3); for(let dy = -29; dy <= 0; dy++){ const hf = Math.round(80 * Math.sqrt(1 - dy * dy / 841)); P.alpha('#e04a3a', .2, mx - hf, 108 + dy, hf * 2 + 1, 1); }     // símbolo de la Liga: Poké Ball en el suelo
      P.alpha('#1a1a22', .4, mx - 80, 107, 161, 3); arEll(P, mx, 108, 15, 6, '#f4f4f4', .6); arRing(P, mx, 108, 15, 6, '#1a1a22', .7); arRing(P, mx, 108, 80, 29, '#1a1a22', .45); arRing(P, mx, 108, 124, 44, '#e0b850', .8); arRing(P, mx, 108, 120, 42, '#e0b850', .4);
      arGradR(P, 0, 0, w, WH, '#4a74d0', '#f4cc90');                                                                                // cielo de atardecer
      for(let x = 0; x < w; x++){ const pk = 8 + 6 * Math.sin(x * .031) + 4 * Math.sin(x * .09 + 2) + Math.max(0, 8 - Math.abs(x - mx) * .16), top = Math.round(WH - 22 - pk); P.rect('#8a9ac8', x, top, 1, 14); P.rect('#ffffff', x, top, 1, Math.max(1, Math.round(pk * .3))); if(HH(x, 5) < .3) P.px('#b8c4e8', x, top + 4); }   // cumbres nevadas
      P.rect('#a89870', 0, 12, w, WH - 12); P.rect('#6a5a3a', 0, 12, w, 1);                                                          // muro de las gradas
      [[14, 7, 2], [21, 7, 1.6], [28, 8, 1.2]].forEach(([ty, th, s], r) => { const base = ['#d8c8a0', '#c8b890', '#b8a880'][r]; P.rect(base, 0, ty, w, th); P.rect('#7a6a48', 0, ty + th - 1, w, 1); P.alpha('#ffffff', .3, 0, ty, w, 1);   // tres gradas con gente
        for(let x = 1; x < w - 1; x += 3){ if(P.r() < .12) continue; const col = ['#e84a4a', '#4a8ae8', '#ffd84a', '#ffffff', '#4ac88a', '#ff8a2a', '#c86aff', '#ff7ab8'][(P.r() * 8) | 0]; P.rect('#f0c8a0', x, ty + 1, 2, 2); P.rect(col, x, ty + 3, 2, th - 4); crowd.push([x, ty + 1, r]); } });
      for(let k = 0; k < 6; k++){ const bx = Math.round(w * (.12 + k * .152)); if(Math.abs(bx - mx) < 6) continue; P.rect('#7a6a48', bx - 1, 0, 14, 2); P.rect('#d8381f', bx, 2, 12, 22); P.rect('#f4f4f4', bx + 1, 2, 10, 1); P.rect('#1a1a22', bx, 24, 12, 1); arBall(P, bx + 3, 8, 7); P.rect('#ffd84a', bx, 20, 12, 2); }   // estandartes de la Liga
      P.rect('#6a5a3a', mx - 36, 0, 72, 3); P.rect('#d8381f', mx - 34, 3, 68, 10); P.rect('#ffd84a', mx - 34, 12, 68, 1); arBall(P, mx - 5, 4, 9); for(let k = 0; k < 4; k++){ P.rect('#ffd84a', mx - 30 + k * 4, 6, 2, 4); P.rect('#ffd84a', mx + 16 + k * 4, 6, 2, 4); }   // gran cartel central
      P.rect('#6a5a3a', 0, WH - 4, w, 4); for(let x = 0; x < w; x += 20){ P.rect(['#e84a4a', '#4a8ae8', '#ffd84a', '#4ac88a'][(x / 20 | 0) % 4], x + 1, WH - 3, 18, 2); P.alpha('#ffffff', .4, x + 1, WH - 3, 18, 1); }        // vallas publicitarias
      [0, 1].forEach(sd => { const bx = sd ? w - 36 : 0, cx = sd ? w - 17 : 17;                                                       // bandas: torre de focos y columna dorada
        P.rect('#8a7a56', bx, WH, 36, h - WH); arTiles(P, bx, WH, 36, h - WH, 12, 12, (x, y) => (x + y) & 1 ? '#9a8a64' : '#8e7e5a', '#5a4a30', .12);
        arFluted(P, cx - 7, WH + 8, WH + 84, 14, '#e8dcc0', '#e0b850'); arFluted(P, cx - 7, WH + 100, h - 10, 14, '#e8dcc0', '#e0b850');
        P.rect('#d8381f', cx - 4, WH + 40, 8, 26); arBall(P, cx - 3, WH + 44, 7); P.rect('#ffd84a', cx - 4, WH + 64, 8, 2);
        const tx = sd ? bx + 4 : bx + 30; P.rect('#5a4a30', tx, 0, 3, WH + 6); for(let k = 0; k < 4; k++){ P.rect('#2a2418', tx - 4 + (k & 1) * 0, 2 + k * 5, 11, 4); P.rect('#fff6c8', tx - 3, 3 + k * 5, 9, 2); } towers.push([tx + 1, 12]);
        arShade(P, bx, sd, 36, WH, h); });
      arOcclude(P, w, WH); return {towers, crowd, mx, conf: Array.from({length: 22}, () => [P.r() * w, P.r() * AR_H, P.r()]), flags: [mx - 3]};
    },
    anim(c, t, d, w){
      d.crowd.forEach(([x, y, r], i) => { if(Math.sin(t * (2 + r * .4) + i * .37 + x * .09) > .8){ c.fillStyle = '#f0c8a0'; c.fillRect(x, y - 1, 2, 1); } });
      for(let k = 0; k < 4; k++){ const s = Math.sin(t * 1.7 + k * 5.3), fx = (k * 97 + Math.floor(t * 1.7 + k * 5.3 / 6.283) * 53) % (w - 40) + 20; if(s > .92){ c.globalAlpha = (s - .92) * 12; c.fillStyle = '#ffffff'; c.fillRect(fx, 14 + (k * 7) % 18, 2, 2); c.fillRect(fx - 1, 15 + (k * 7) % 18, 4, 0); c.globalAlpha = 1; } }
      d.towers.forEach(([x, y], i) => arGlowC(c, x, y, 14 + Math.sin(t * 2 + i) * 1.5, '#fff6c8', .38));
      ['#e84a4a', '#4a8ae8', '#ffd84a', '#4ac88a'].forEach((col, i) => arFall(c, d.conf.filter((_, j) => j % 4 === i), t, w, col, .9, 3, 8, 2)); }},

});
