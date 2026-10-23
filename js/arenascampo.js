"use strict";
/* =====================================================================
   17c) ESTADIO DEL CAMPO DE ENTRENAMIENTO: el fondo de todos los combates del Campo (js/campo.js).
   Un estadio de entrenamiento al aire libre, de día y dibujado con código (sin imágenes), igual que las arenas de los líderes:
     - Cielo con nubes, grada con público de colores (algunos animan con los brazos) y banderines que ondean.
     - Vallas publicitarias con el emblema de una Poké Ball.
     - Césped segado en franjas, líneas blancas, círculo central con Poké Ball y dos zonas de tierra pisada donde se colocan los Pokémon.
     - Material de entrenamiento: conos, vallas de salto, neumáticos y un saco de golpeo.
     - A los lados, barreras acolchadas azules y blancas (se ven aunque el marcador tape el fondo).
   Se carga DESPUÉS de arenasjohto.js. Id de la arena: 'campo'. Cómo funciona build() / anim(): ver la cabecera de arenas.js.
   ===================================================================== */
function arOval(P, cx, cy, rx, ry, col, a){                       // óvalo relleno (a = transparencia)
  for(let dy = -ry; dy <= ry; dy++){ const half = Math.round(rx * Math.sqrt(1 - (dy / ry) * (dy / ry))); P.alpha(col, a, cx - half, cy + dy, half * 2 + 1, 1); }
}
function arRing(P, cx, cy, rx, ry, col, a){                        // borde de óvalo (línea de tiza)
  for(let k = 0; k < 360; k += 1){ const an = k * Math.PI / 180; P.alpha(col, a, Math.round(cx + Math.cos(an) * rx), Math.round(cy + Math.sin(an) * ry), 1, 1); }
}
function arBall(P, x, y, s){                                       // Poké Ball pixelada de s x s (s impar)
  const r = (s - 1) / 2;
  for(let j = -r; j <= r; j++) for(let i = -r; i <= r; i++){ const d = Math.hypot(i, j); if(d > r + .4) continue;
    P.px(d > r - .6 ? '#1a1a22' : j < 0 ? '#e0352b' : '#f4f4f4', x + r + i, y + r + j); }
  P.rect('#1a1a22', x, y + r, s, 1); P.px('#f4f4f4', x + r, y + r);
}

Object.assign(ARENAS, {

  // ---- Campo de Entrenamiento: estadio de entrenamiento de día, con césped, público y material de entrenamiento ----
  campo: {dark: .06,
    build(P, w, h, WH){
      // --- cielo y árboles lejanos ---
      for(let y = 0; y < 10; y++) P.rect(arMix('#4f9fe6', '#c4e6fa', y / 10), 0, y, w, 1);
      for(let x = 0; x < w; x += 3){ const hh = 2 + Math.round(Math.sin(x * .21) * 1.5 + Math.sin(x * .07) * 2 + 2); P.rect(x % 9 < 3 ? '#2f7a3a' : '#2a6a34', x, 10 - hh, 3, hh); }
      // --- grada: 4 filas de escalones con público ---
      const shirts = ['#d8352b', '#2b6bd8', '#f0c42a', '#f4f4f4', '#3aa84a', '#8a44c8', '#f08a2a'], skins = ['#f1c8a0', '#d89a6a', '#a8683a', '#f5d6b4'], hairs = ['#2a1a10', '#5a3a1a', '#c8a030', '#1a1a1a', '#8a2a1a'];
      const fans = [];
      for(let r = 0; r < 4; r++){ const y = 10 + r * 6;
        P.rect(r & 1 ? '#7d8392' : '#868c9b', 0, y, w, 6); P.alpha('#ffffff', .22, 0, y, w, 1); P.alpha('#000000', .25, 0, y + 5, w, 1);
        for(let x = 1 + (r % 2) * 2; x < w - 4; x += 5){ if(P.r() < .16) continue;                                  // algún asiento vacío
          const sh = shirts[(P.r() * shirts.length) | 0];
          P.rect(sh, x, y + 3, 4, 3); P.alpha('#000000', .2, x, y + 5, 4, 1);                                        // camiseta
          P.rect(skins[(P.r() * skins.length) | 0], x + 1, y + 1, 2, 2); P.rect(hairs[(P.r() * hairs.length) | 0], x + 1, y, 2, 1);   // cabeza y pelo
          if(P.r() < .22) fans.push([x, y]); } }
      for(let x = 22; x < w; x += 64){ P.rect('#b9bdca', x, 10, 4, 24); P.alpha('#ffffff', .3, x, 10, 1, 24); P.alpha('#000000', .25, x + 3, 10, 1, 24);   // pasillos de escaleras
        for(let y = 12; y < 34; y += 3) P.alpha('#000000', .2, x, y, 4, 1); }
      // --- vallas publicitarias con emblema Poké Ball ---
      P.rect('#1b3a82', 0, WH - 9, w, 8);
      const cols = ['#2358b8', '#c8302a', '#e8b82a', '#2358b8'];
      for(let x = 0, k = 0; x < w; x += 22, k++){ P.rect(cols[k % 4], x + 1, WH - 8, 20, 6); P.alpha('#ffffff', .25, x + 1, WH - 8, 20, 1); P.alpha('#000000', .3, x + 1, WH - 3, 20, 1); arBall(P, x + 8, WH - 7, 5); }
      P.rect('#f4f4f4', 0, WH - 1, w, 1); P.rect('#9a9eaa', 0, WH - 10, w, 1);
      // banderines (los asta; la tela se anima)
      const poles = []; for(let x = 40; x < w - 20; x += 64){ P.rect('#d8dae2', x, 3, 1, 8); poles.push([x, 3]); }
      // --- césped en franjas ---
      for(let y = WH, i = 0; y < h; y += 12, i++) P.rect(i & 1 ? '#3d9444' : '#46a24c', 0, y, w, Math.min(12, h - y));
      arSpeck(P, 0, WH, w, h - WH, 520, ['#52b058', '#37873d', '#4aa850', '#3b8e41']);
      for(let i = 0; i < 70; i++){ const x = P.r() * w, y = WH + 3 + P.r() * (h - WH - 6); P.px('#5ab860', x, y); P.px('#5ab860', x, y - 1); }                         // briznas
      // --- tierra pisada donde se colocan los Pokémon, y líneas de tiza ---
      const cx = Math.round(w / 2), cy = WH + 76, lx = Math.round(w * .22), rx = Math.round(w * .78), dy = WH + 82;
      [lx, rx].forEach(x => { arOval(P, x, dy, 30, 17, '#8a6a3e', .9); arOval(P, x, dy, 26, 14, '#a38250', .9); arSpeck(P, x - 28, dy - 16, 56, 32, 180, ['#b49060', '#8a6a3e', '#c4a272']); arRing(P, x, dy, 22, 11, '#f4f4f4', .6); });
      P.alpha('#f4f4f4', .75, 0, WH + 7, w, 1);                                                                                         // línea de banda
      arRing(P, cx, cy, 54, 34, '#f4f4f4', .75); arRing(P, cx, cy, 53, 33, '#f4f4f4', .35);                                          // círculo central
      for(let x = cx - 54; x <= cx + 54; x++) P.alpha('#f4f4f4', .7, x, cy, 1, 1);                                                        // línea del centro
      arOval(P, cx, cy, 8, 5, '#f4f4f4', .85); arRing(P, cx, cy, 8, 5, '#e0352b', .9);
      for(let x = cx - 7; x <= cx + 7; x++) P.alpha('#e0352b', .9, x, cy, 1, 1);
      P.rect('#f4f4f4', cx - 1, cy - 1, 3, 3); P.px('#1a1a22', cx, cy);
      for(let x = 10; x < w - 10; x += 14) P.alpha('#f4f4f4', .5, x, h - 14, 8, 1);                                                      // línea discontinua inferior
      // --- material de entrenamiento ---
      for(let k = 0; k < 5; k++){ const x = Math.round(w * .34) + k * 13, y = WH + 20;                                                    // fila de conos
        P.rect('#e8622a', x + 1, y, 3, 1); P.rect('#e8622a', x, y + 1, 5, 2); P.rect('#f4f4f4', x + 1, y + 1, 3, 1); P.rect('#c24a1a', x - 1, y + 3, 7, 1); P.alpha('#000000', .25, x, y + 4, 7, 1); }
      for(let k = 0; k < 2; k++){ const x = Math.round(w * .58) + k * 22, y = WH + 36;                                                    // vallas de salto
        P.rect('#d8dae2', x, y, 1, 7); P.rect('#d8dae2', x + 14, y, 1, 7); P.rect(k ? '#e8b82a' : '#e0352b', x, y + 1, 15, 2); P.alpha('#000000', .25, x - 1, y + 7, 17, 1); }
      const tire = (x, y) => { P.rect('#1a1a22', x, y, 12, 6); P.rect('#33343c', x + 1, y + 1, 10, 3); P.rect('#1a1a22', x + 4, y + 2, 4, 2); P.alpha('#ffffff', .15, x + 1, y, 10, 1); };
      tire(10, WH + 58); tire(11, WH + 53); tire(9, WH + 63);                                                                             // montón de neumáticos
      const bx = w - 26, by = WH + 40;                                                                                                    // saco de golpeo
      P.rect('#8a8e9c', bx + 5, by - 14, 2, 14); P.rect('#8a8e9c', bx - 2, by - 14, 16, 2); P.rect('#d8352b', bx + 1, by, 10, 20); P.rect('#f06a5e', bx + 2, by, 2, 20); P.rect('#8a1f1a', bx + 9, by, 2, 20);
      P.rect('#2a1a10', bx + 1, by + 8, 10, 1); P.alpha('#000000', .3, bx - 2, by + 21, 16, 2);
      for(let i = 0; i < 4; i++) P.px('#8a8e9c', bx + 6, by - 12 + i * 3 + 12);
      // --- barreras acolchadas a los lados ---
      [0, w - 8].forEach((x, i) => { for(let y = WH, k = 0; y < h; y += 14, k++){ P.rect(k & 1 ? '#f4f4f4' : '#2358b8', x, y, 8, 13); P.alpha('#ffffff', .3, x, y, 8, 1); P.alpha('#000000', .3, x, y + 12, 8, 1);
          P.alpha('#ffffff', .22, i ? x : x + 7, y, 1, 13); P.alpha('#000000', .35, i ? x + 7 : x, y, 1, 13); }
        for(let k = 0; k < 5; k++) P.alpha('#000000', .28 * (1 - k / 5), i ? x - 1 - k : x + 8 + k, WH, 1, h - WH); });
      arOcclude(P, w, WH);
      return {fans, poles};
    },
    anim(c, t, d, w){
      for(let i = 0; i < 4; i++){ const x = ((t * (4 + i * 1.5) + i * 83) % (w + 40)) - 20; arCloud(c, x, 0 + (i % 2) * 2, .35 + (i % 2) * .1, .75); }          // nubes lejanas
      d.poles.forEach(([x, y], i) => { for(let k = 0; k < 7; k++){ c.fillStyle = i % 2 ? '#e0352b' : '#f0c42a'; c.fillRect(x + 1 + k, Math.round(y + Math.sin(t * 6 + k * .7 + i) * 1 + k * .15), 1, Math.max(1, 3 - (k >> 1))); } });   // banderines que ondean
      d.fans.forEach(([x, y], i) => { const up = Math.sin(t * 5 + i * 1.7) > 0; c.fillStyle = '#f1c8a0'; c.fillRect(x - (i & 1 ? 0 : -3), y - (up ? 1 : 0), 1, up ? 3 : 2); });   // aficionados que levantan los brazos
    }}
});
