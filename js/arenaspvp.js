"use strict";
/* =====================================================================
   17d) EL COLISEO: el estadio del combate online (js/pvp.js). Id de la arena: 'coliseo'.
   Un estadio de noche con focos, dibujado con código (sin imágenes), igual que las demás arenas:
     - Grada de 5 filas llena de público: la mitad izquierda va de azul (el bando del retador) y la derecha de rojo (el del invitado).
       Hacen "la ola", agitan barras de luz del color de su equipo y sacan flashes de cámara. Hay banderas con una Poké Ball colgando del techo.
     - Focos en la cubierta cuyos haces de luz barren el campo despacio.
     - Suelo de paneles oscuros, teñido de azul a la izquierda y de rojo a la derecha (se ve a qué lado juegas). Líneas de neón: el borde,
       la línea del medio y el círculo central, con una gran POKÉ BALL pintada en el centro (su botón late).
     - Dos círculos de salida, uno de cada color, donde empieza cada Pokémon.
     - Vallas con el emblema de la Poké Ball y barreras acolchadas azul (izquierda) y roja (derecha) a los lados.
   Se carga DESPUÉS de arenascampo.js (usa sus arOval, arRing y arBall). Cómo funciona build() / anim(): ver la cabecera de arenas.js.
   ===================================================================== */
Object.assign(ARENAS, {
  coliseo: {dark: .1,
    build(P, w, h, WH){
      const cx = Math.round(w / 2), cy = WH + 72, fh = h - WH;
      const pick = a => a[(P.r() * a.length) | 0];
      // --- grada: 5 filas de escalones con público (azul a la izquierda, rojo a la derecha, mezcla en el centro) ---
      P.rect('#0d1020', 0, 0, w, WH);
      const SH = {L: ['#2b6bd8', '#4f8bff', '#1f4fb0', '#2b6bd8', '#f4f4f4'], R: ['#d8352b', '#ff6a4a', '#a8231c', '#d8352b', '#f4f4f4'], M: ['#f0c42a', '#8a44c8', '#3aa84a', '#f4f4f4', '#2b6bd8', '#d8352b']};
      const skins = ['#f1c8a0', '#d89a6a', '#a8683a', '#f5d6b4'], hairs = ['#2a1a10', '#5a3a1a', '#c8a030', '#1a1a1a', '#8a2a1a'];
      const aisles = []; for(let a = 30; a < w - 30; a += 78) aisles.push(a);                          // escaleras entre bloques de asientos
      const fans = [];
      for(let r = 0; r < 5; r++){ const y = 2 + r * 5;
        P.rect(r & 1 ? '#262c44' : '#2d3450', 0, y, w, 5); P.alpha('#ffffff', .12, 0, y, w, 1); P.alpha('#000000', .3, 0, y + 4, w, 1);
        for(let x = 1 + (r % 2) * 2; x < w - 12; x += 5){
          if(P.r() < .1 || aisles.some(a => x + 4 > a && x < a + 5)) continue;                         // algún asiento vacío
          const t = x / w, set = t < .4 ? (P.r() < .78 ? 'L' : 'M') : t > .6 ? (P.r() < .78 ? 'R' : 'M') : 'M', sh = pick(SH[set]);
          P.rect(sh, x, y + 2, 4, 3); P.alpha('#ffffff', .16, x, y + 2, 4, 1); P.alpha('#000000', .22, x, y + 4, 4, 1);   // camiseta
          P.rect(pick(skins), x + 1, y, 2, 2); P.rect(pick(hairs), x + 1, y, 2, 1);                                    // cabeza y pelo
          fans.push({x, y, r, set, c: sh}); }
        P.alpha('#05070f', .4 - r * .07, 0, y, w, 5); }                                                // las filas de arriba, más lejos y oscuras
      aisles.forEach(a => { P.rect('#3a4263', a, 2, 5, 25); P.alpha('#ffffff', .25, a, 2, 1, 25); P.alpha('#000000', .3, a + 4, 2, 1, 25); for(let y = 4; y < 27; y += 3) P.alpha('#000000', .25, a, y, 5, 1); });
      // banderas con una Poké Ball colgadas del techo
      [.26, .74].forEach((k, i) => { const x = Math.round(w * k) - 5; P.rect('#d8dae2', x - 1, 2, 12, 1); P.rect('#141a30', x, 3, 10, 14); P.rect(i ? '#ff6a4a' : '#4f8bff', x, 3, 10, 1); P.rect(i ? '#ff6a4a' : '#4f8bff', x, 16, 10, 1);
        arBall(P, x + 2, 7, 5); P.alpha('#000000', .35, x + 10, 3, 1, 14); });
      // vallas publicitarias con emblema Poké Ball (azul a la izquierda, rojas a la derecha, doradas en el centro) y tira de luz
      P.rect('#10152a', 0, WH - 9, w, 8);
      for(let x = 0; x < w; x += 22){ const k = (x + 11) / w, col = k < .45 ? '#2358b8' : k > .55 ? '#c8302a' : '#e8b82a';
        P.rect(col, x + 1, WH - 8, 20, 6); P.alpha('#ffffff', .25, x + 1, WH - 8, 20, 1); P.alpha('#000000', .3, x + 1, WH - 3, 20, 1); arBall(P, x + 8, WH - 7, 5); }
      P.alpha('#8fd0ff', .8, 0, WH - 10, w, 1); P.rect('#f4f4f4', 0, WH - 1, w, 1);
      // focos en la cubierta
      const lamps = []; for(let x = 22; x < w - 10; x += 44){ P.rect('#aab4d8', x - 4, 0, 9, 2); P.rect('#ffffff', x - 3, 1, 7, 1); P.rect('#05070f', x - 4, 2, 9, 1); lamps.push({x}); }

      // --- suelo: paneles oscuros teñidos por equipo (azul izquierda · rojo derecha) ---
      arTiles(P, 0, WH, w, fh, 24, 16, () => arMix('#1b2440', P.r() < .5 ? '#ffffff' : '#000000', .015 + P.r() * .045), '#0e1427', .06);
      arSpeck(P, 0, WH, w, fh, 300, ['#2a3558', '#141a30', '#232d4d']);
      for(let x = 0; x < w; x++){ const k = Math.abs(x - cx) / cx; P.alpha(x < cx ? '#2f6bff' : '#ff4a3a', .22 * Math.pow(k, 1.2), x, WH, 1, fh); }
      for(let k = 0; k < 4; k++) arOval(P, cx, cy, 130 - k * 24, 54 - k * 9, '#9fc0ff', .024);          // charco de luz de los focos
      // --- líneas de neón: borde, línea del medio y círculos ---
      const line = (x, y, ww, hh) => { P.alpha('#6fa2ff', .18, x - 1, y - 1, ww + 2, hh + 2); P.alpha('#cfe2ff', .8, x, y, ww, hh); };
      line(14, WH + 8, w - 28, 1); line(14, h - 10, w - 28, 1); line(14, WH + 8, 1, fh - 17); line(w - 15, WH + 8, 1, fh - 17);
      line(cx, WH + 8, 1, fh - 17);                                                                      // línea del medio: separa los dos bandos
      arRing(P, cx, cy, 51, 33, '#6fa2ff', .22); arRing(P, cx, cy, 50, 32, '#cfe2ff', .85); arRing(P, cx, cy, 24, 15, '#cfe2ff', .6);   // círculo grande y círculo de la Poké Ball
      // --- la gran Poké Ball del centro, pintada en el suelo ---
      const rx = 17, ry = 11;
      arOval(P, cx, cy, rx + 3, ry + 3, '#9cc4ff', .2);
      for(let dy = -ry; dy <= ry; dy++){ const half = Math.round(rx * Math.sqrt(1 - (dy / ry) * (dy / ry)));
        const col = dy < -1 ? (dy < -ry * .55 ? '#ff5a4a' : '#e0352b') : dy > 1 ? (dy > ry * .55 ? '#cfd4e4' : '#f4f4f4') : '#10131f';
        P.alpha(col, .93, cx - half, cy + dy, half * 2 + 1, 1); }
      P.alpha('#ffffff', .5, cx - 11, cy - 7, 5, 1); P.alpha('#ffffff', .35, cx - 12, cy - 6, 2, 1);        // brillo
      arRing(P, cx, cy, rx, ry, '#10131f', 1);
      arOval(P, cx, cy, 4, 3, '#10131f', 1); arOval(P, cx, cy, 3, 2, '#f4f4f4', 1); P.px('#9cc4ff', cx, cy);   // botón
      // --- círculos de salida de cada bando ---
      [[Math.round(w * .22), '#4f8bff'], [Math.round(w * .78), '#ff6a4a']].forEach(([x, col]) => {
        arOval(P, x, cy, 19, 11, col, .12); arRing(P, x, cy, 19, 11, col, .35); arRing(P, x, cy, 18, 10, col, .9); arRing(P, x, cy, 9, 5, col, .5); });
      // --- grada baja, delante: público visto de espaldas, tras una barrera (se ve en las esquinas, por los lados de la barra de ataques) ---
      P.rect('#10152a', 0, h - 9, w, 9); P.rect('#cfe2ff', 0, h - 9, w, 1); P.alpha('#000000', .35, 0, h - 8, w, 1);
      for(let r = 0; r < 2; r++){ const y = h - 8 + r * 4;
        for(let x = 1 + r * 2; x < w - 12; x += 5){ if(P.r() < .08) continue;
          const t = x / w, set = t < .4 ? (P.r() < .78 ? 'L' : 'M') : t > .6 ? (P.r() < .78 ? 'R' : 'M') : 'M', sh = pick(SH[set]);
          P.rect(sh, x, y + 2, 4, 2); P.alpha('#ffffff', .14, x, y + 2, 4, 1); P.rect(pick(hairs), x + 1, y, 2, 2);               // hombros y nuca
          fans.push({x, y, r: r + 5, set, c: sh}); }
        P.alpha('#05070f', .12 - r * .08, 0, y, w, 4); }
      // --- barreras acolchadas a los lados: azul (izquierda) y roja (derecha) ---
      [0, w - 8].forEach((x, i) => { const col = i ? '#c8302a' : '#2358b8';
        for(let y = WH, k = 0; y < h; y += 14, k++){ P.rect(k & 1 ? '#e8ecff' : col, x, y, 8, 13); P.alpha('#ffffff', .3, x, y, 8, 1); P.alpha('#000000', .3, x, y + 12, 8, 1); }
        P.alpha(i ? '#ff6a4a' : '#4f8bff', .55, i ? x : x + 7, WH, 1, fh); P.alpha('#000000', .35, i ? x + 7 : x, WH, 1, fh);
        for(let k = 0; k < 5; k++) P.alpha('#000000', .3 * (1 - k / 5), i ? x - 1 - k : x + 8 + k, WH, 1, fh); });
      arOcclude(P, w, WH);
      return {fans, lamps, cx, cy};
    },
    anim(c, t, d, w){
      // --- haces de los focos barriendo el campo (luz aditiva suave) ---
      c.save(); c.globalCompositeOperation = 'lighter';
      d.lamps.forEach((L, i) => { if(i % 2) return;
        const tx = L.x + Math.sin(t * .45 + i * 1.7) * 55 + (i % 4 ? 18 : -18), g = c.createLinearGradient(0, 2, 0, 178); g.addColorStop(0, 'rgba(190,215,255,.10)'); g.addColorStop(1, 'rgba(190,215,255,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(L.x - 2, 2); c.lineTo(L.x + 2, 2); c.lineTo(tx + 16, 178); c.lineTo(tx - 16, 178); c.closePath(); c.fill(); });
      c.restore();
      // --- público: la ola, barras de luz y flashes de cámara ---
      const hs = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); }, STICK = {L: '#6fb0ff', R: '#ff8a6a', M: '#ffe26a'}, step = Math.floor(t * 5);
      d.fans.forEach((f, i) => {
        if(Math.sin(t * 1.7 - f.x * .03 + f.r * .5) > .86){ c.fillStyle = '#f1c8a0'; c.fillRect(f.x, f.y, 1, 2); c.fillRect(f.x + 3, f.y, 1, 2); }           // la ola: levantan los brazos
        if(i % 5 === 0){ c.globalAlpha = .45 + .55 * Math.max(0, Math.sin(t * 3 + i)); c.fillStyle = STICK[f.set]; c.fillRect(f.x + 3, f.y - 1, 1, 2); c.globalAlpha = 1; }   // barra de luz
        if(hs(i, step) < .012){ c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(f.x + 1, f.y + 1, 2, 2); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(f.x - 1, f.y + 1, 6, 1); }   // flash de cámara
      });
      // --- el neón respira y el botón de la Poké Ball late ---
      c.strokeStyle = `rgba(150,190,255,${.1 + .08 * Math.sin(t * 2)})`; c.lineWidth = 2; c.beginPath(); c.ellipse(d.cx, d.cy, 50, 32, 0, 0, Math.PI * 2); c.stroke();
      c.fillStyle = `rgba(140,210,255,${.2 + .2 * Math.sin(t * 3)})`; c.beginPath(); c.ellipse(d.cx, d.cy, 6, 4, 0, 0, Math.PI * 2); c.fill();
    }}
});
