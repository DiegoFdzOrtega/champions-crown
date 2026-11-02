"use strict";
/* =====================================================================
   17e) EL ESTADIO: la arena de los combates de CLASIFICATORIA (js/ranked.js → js/pvp.js). Id de la arena: 'estadio'.
   Los combates online amistosos siguen usando el Coliseo (js/arenaspvp.js).

   PARA VOLVER ATRÁS: pon RANKED_ESTADIO = false y la Clasificatoria vuelve a usar el Coliseo de siempre.

   Igual que las demás arenas, todo está dibujado con código (sin imágenes) y es SOLO VISUAL: no cambia nada del combate
   (los Pokémon se mueven por el mismo campo y los dos jugadores simulan exactamente lo mismo).
     - Cubierta con estructura metálica, focos colgados y haces de luz que barren el campo.
     - Grada alta llena de público (azul a la izquierda, rojo a la derecha), con la ola, barras de luz y flashes de cámara.
     - Dos videomarcadores colgados con un rótulo que se desplaza y un ecualizador.
     - Banda de pantallas LED a pie de grada con anuncios (marcas inventadas) que pasan.
     - Suelo en perspectiva (se estrecha hacia el fondo) con líneas de neón, la gran Poké Ball del centro y los dos círculos de salida.
     - Drones con cámara sobrevolando la grada.
   Va a resolución fina (h: 270 → cada píxel de arte se ve x2). Se carga DESPUÉS de arenaspvp.js (usa arOval, arRing y arBall de arenascampo.js).
   ===================================================================== */
const RANKED_ESTADIO = true;                                     // false = la Clasificatoria usa el Coliseo de siempre
const ESTADIO_ADS = ['CHAMPIONS CROWN', 'LIGA CLASIFICATORIA', 'CROWN CUP', 'TORRE BATALLA', 'BATALLA TV', 'RUTA AL CAMPEÓN'];   // anuncios de la banda LED (marcas inventadas)

Object.assign(ARENAS, {
  estadio: {dark: .06, h: 270, wall: 64,
    build(P, w, h, WH){
      const cx = Math.round(w / 2), cy = 146, pick = a => a[(P.r() * a.length) | 0];
      // ---- suelo en perspectiva (píxel a píxel con ImageData: rápido y se hace una sola vez) ----
      const TOP = WH + 4, BOT = h - 6, XT = 40, XB = 8;                                     // trapecio del campo: estrecho arriba, ancho abajo
      const edge = y => { const t = Math.max(0, Math.min(1, (y - TOP) / (BOT - TOP))); return [XT + (XB - XT) * t, w - XT + (XT - XB) * t]; };
      const img = P.c.createImageData(w, h), D = img.data, hex = s => arHex(s);
      const base = hex('#1a2340'), dk = hex('#151d36'), blue = hex('#2f6bff'), red = hex('#ff4a3a'), track = hex('#0a0e1a');
      for(let y = WH; y < h; y++){
        const [xl, xr] = edge(y), t = (y - TOP) / (BOT - TOP), v = Math.floor(Math.pow(Math.max(0, t), .75) * 9);   // filas de paneles: más juntas al fondo
        for(let x = 0; x < w; x++){
          const i = (y * w + x) * 4; let c;
          if(y < TOP || x < xl || x > xr) c = track;
          else{
            const u = Math.floor((x - xl) / (xr - xl) * 14), chk = (u + v) & 1, k = Math.abs(x - cx) / ((xr - xl) / 2), tint = x < cx ? blue : red, a = .2 * Math.pow(k, 1.3);
            const b = chk ? base : dk;
            c = [0, 1, 2].map(j => b[j] + (tint[j] - b[j]) * a);
          }
          D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; D[i + 3] = 255;
        }
      }
      P.c.putImageData(img, 0, 0);
      for(let k = 0; k < 5; k++) arOval(P, cx, cy + 4, 150 - k * 26, 62 - k * 10, '#9fc0ff', .022);     // charco de luz de los focos
      // juntas de los paneles: líneas que convergen hacia el fondo
      const seg = (x0, y0, x1, y1, col, a) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0; for(let s = 0; s <= n; s++){ const q = n ? s / n : 0; P.alpha(col, a, Math.round(x0 + (x1 - x0) * q), Math.round(y0 + (y1 - y0) * q), 1, 1); } };
      for(let u = 1; u < 14; u++){ const [lt, rt] = edge(TOP), [lb, rb] = edge(BOT); seg(lt + (rt - lt) * u / 14, TOP, lb + (rb - lb) * u / 14, BOT, '#000000', .25); }
      for(let v = 1; v < 9; v++){ const y = Math.round(TOP + Math.pow(v / 9, 1 / .75) * (BOT - TOP)), [xl, xr] = edge(y); P.alpha('#000000', .25, xl, y, xr - xl, 1); }
      // ---- líneas de neón: borde del campo, línea del medio, círculo central ----
      const neon = (x0, y0, x1, y1, col) => { seg(x0, y0 - 1, x1, y1 - 1, col, .18); seg(x0, y0 + 1, x1, y1 + 1, col, .18); seg(x0 - 1, y0, x1 - 1, y1, col, .18); seg(x0 + 1, y0, x1 + 1, y1, col, .18); seg(x0, y0, x1, y1, '#e6f0ff', .9); };
      { const [lt, rt] = edge(TOP + 6), [lb, rb] = edge(BOT - 4);
        neon(lt, TOP + 6, cx, TOP + 6, '#4f8bff'); neon(cx, TOP + 6, rt, TOP + 6, '#ff6a4a');
        neon(lb, BOT - 4, cx, BOT - 4, '#4f8bff'); neon(cx, BOT - 4, rb, BOT - 4, '#ff6a4a');
        neon(lt, TOP + 6, lb, BOT - 4, '#4f8bff'); neon(rt, TOP + 6, rb, BOT - 4, '#ff6a4a');
        neon(cx, TOP + 6, cx, BOT - 4, '#cfe2ff'); }
      arRing(P, cx, cy, 63, 33, '#6fa2ff', .25); arRing(P, cx, cy, 62, 32, '#e6f0ff', .85); arRing(P, cx, cy, 30, 16, '#cfe2ff', .55);
      // ---- la gran Poké Ball del centro ----
      const rx = 21, ry = 12;
      arOval(P, cx, cy, rx + 4, ry + 3, '#9cc4ff', .2);
      for(let dy = -ry; dy <= ry; dy++){ const half = Math.round(rx * Math.sqrt(1 - (dy / ry) * (dy / ry)));
        const col = dy < -1 ? (dy < -ry * .55 ? '#ff5a4a' : '#e0352b') : dy > 1 ? (dy > ry * .55 ? '#cfd4e4' : '#f4f4f4') : '#10131f';
        P.alpha(col, .93, cx - half, cy + dy, half * 2 + 1, 1); }
      P.alpha('#ffffff', .5, cx - 13, cy - 8, 6, 1); P.alpha('#ffffff', .35, cx - 14, cy - 7, 2, 1);
      arRing(P, cx, cy, rx, ry, '#10131f', 1);
      arOval(P, cx, cy, 5, 3, '#10131f', 1); arOval(P, cx, cy, 3, 2, '#f4f4f4', 1);
      // ---- círculos de salida de cada bando ----
      [[Math.round(w * .25), '#4f8bff'], [Math.round(w * .75), '#ff6a4a']].forEach(([x, col]) => {
        arOval(P, x, cy, 26, 13, col, .14); arRing(P, x, cy, 26, 13, col, .35); arRing(P, x, cy, 25, 12, col, .95); arRing(P, x, cy, 13, 6, col, .5); });
      // ---- pista exterior: barreras con tira de luz a lo largo del borde del campo ----
      for(let y = TOP; y < h; y++){ const [xl, xr] = edge(y);
        P.alpha('#4f8bff', .55, xl - 4, y, 1, 1); P.alpha('#ff6a4a', .55, xr + 4, y, 1, 1);
        P.alpha('#000000', .35, 0, y, Math.max(0, xl - 5), 1); P.alpha('#000000', .35, xr + 5, y, w, 1); }

      // ---- GRADA (de 0 a WH): cubierta, público y banda LED ----
      const SH = {L: ['#2b6bd8', '#4f8bff', '#1f4fb0', '#2b6bd8', '#f4f4f4'], R: ['#d8352b', '#ff6a4a', '#a8231c', '#d8352b', '#f4f4f4'], M: ['#f0c42a', '#8a44c8', '#3aa84a', '#f4f4f4', '#2b6bd8', '#d8352b']};
      const skins = ['#f1c8a0', '#d89a6a', '#a8683a', '#f5d6b4'], hairs = ['#2a1a10', '#5a3a1a', '#c8a030', '#1a1a1a', '#8a2a1a'];
      P.rect('#070a14', 0, 0, w, WH);
      const fans = [], rows = [[13, 4, 4], [17, 4, 4], [21, 5, 5], [26, 5, 5], [31, 6, 5], [37, 6, 6], [43, 6, 6]];   // [y, alto, paso]: más grandes cuanto más cerca
      const aisles = []; for(let a = 26; a < w - 20; a += 70) aisles.push(a);
      rows.forEach(([y, rh, st], r) => {
        P.rect(r & 1 ? '#232a42' : '#2a3150', 0, y, w, rh); P.alpha('#ffffff', .1, 0, y, w, 1); P.alpha('#000000', .3, 0, y + rh - 1, w, 1);
        for(let x = 1 + (r % 2) * 2; x < w - 4; x += st){
          if(P.r() < .08 || aisles.some(a => x + st > a && x < a + 5)) continue;
          const t = x / w, set = t < .42 ? (P.r() < .8 ? 'L' : 'M') : t > .58 ? (P.r() < .8 ? 'R' : 'M') : 'M', sh = pick(SH[set]), bw = st - 1, hh = Math.max(2, rh - 3);
          P.rect(sh, x, y + rh - hh, bw, hh); P.alpha('#ffffff', .15, x, y + rh - hh, bw, 1);          // camiseta
          const hw = Math.max(1, bw - 2); P.rect(pick(skins), x + 1, y + rh - hh - 2, hw, 2); P.rect(pick(hairs), x + 1, y + rh - hh - 2, hw, 1);   // cabeza
          fans.push({x, y: y + rh - hh - 2, r, set, bw});
        }
        P.alpha('#05070f', .5 - r * .07, 0, y - 2, w, rh + 2);                                         // las filas de arriba, más lejos y oscuras
      });
      aisles.forEach(a => { P.rect('#353d5c', a, 13, 5, 36); P.alpha('#ffffff', .2, a, 13, 1, 36); for(let y = 15; y < 49; y += 3) P.alpha('#000000', .25, a, y, 5, 1); });
      // cubierta: viga metálica en celosía con focos
      P.rect('#141a2c', 0, 0, w, 11); P.rect('#2a3352', 0, 1, w, 1); P.rect('#2a3352', 0, 9, w, 1);
      for(let x = 0; x < w; x += 8){ for(let k = 0; k < 8; k++){ P.px('#2a3352', x + k, 1 + k); P.px('#2a3352', x + 7 - k, 1 + k); } }
      const lamps = []; for(let x = 30; x < w - 20; x += 60){ P.rect('#0b0f1c', x - 6, 10, 13, 4); P.rect('#aab4d8', x - 5, 11, 11, 2); P.rect('#ffffff', x - 4, 12, 9, 1); lamps.push({x}); }
      // estandartes colgados (uno por bando y otros en medio)
      [[.12, '#4f8bff'], [.88, '#ff6a4a'], [.42, '#f0c42a'], [.58, '#b06cff']].forEach(([k, col]) => { const x = Math.round(w * k) - 5;
        P.rect('#d8dae2', x - 1, 11, 12, 1); P.rect('#10152a', x, 12, 10, 15); P.rect(col, x, 12, 10, 2); P.rect(col, x + 2, 26, 6, 2); P.rect(col, x + 4, 28, 2, 1);
        arBall(P, x + 2, 16, 7); P.alpha('#000000', .35, x + 9, 12, 1, 15); });
      // videomarcadores (el contenido se pinta en anim)
      const screens = [{x: Math.round(w * .3) - 26, col: '#4f8bff'}, {x: Math.round(w * .7) - 26, col: '#ff6a4a'}];
      screens.forEach(S => { S.y = 16; S.w = 52; S.h = 26;
        P.rect('#5a6488', S.x + 10, 11, 1, 5); P.rect('#5a6488', S.x + S.w - 11, 11, 1, 5);           // cables
        P.rect('#0b0f1c', S.x - 2, S.y - 2, S.w + 4, S.h + 4); P.rect('#2a3352', S.x - 1, S.y - 1, S.w + 2, S.h + 2); P.rect(S.col, S.x - 1, S.y - 1, S.w + 2, 1);
        P.rect('#060914', S.x, S.y, S.w, S.h); });
      // banda LED a pie de grada (los anuncios se mueven en anim) y barandilla
      P.rect('#0b0f1c', 0, WH - 15, w, 13); P.rect('#cfe2ff', 0, WH - 15, w, 1); P.rect('#05070c', 0, WH - 13, w, 9);
      P.rect('#2a3352', 0, WH - 3, w, 3); P.rect('#8fd0ff', 0, WH - 3, w, 1);
      arOcclude(P, w, WH);
      // ---- grada baja, delante (público de espaldas en las esquinas de abajo) ----
      P.rect('#10152a', 0, h - 8, w, 8); P.rect('#cfe2ff', 0, h - 8, w, 1);
      for(let x = 2; x < w - 6; x += 6){ if(P.r() < .1) continue; const t = x / w, set = t < .42 ? 'L' : t > .58 ? 'R' : 'M', sh = pick(SH[set]);
        P.rect(sh, x, h - 4, 5, 4); P.rect(pick(hairs), x + 1, h - 7, 3, 3); fans.push({x, y: h - 7, r: 9, set, bw: 5}); }
      return {fans, lamps, screens, cx, cy, WH};
    },
    anim(c, t, d, w){
      // ---- haces de los focos barriendo el campo ----
      c.save(); c.globalCompositeOperation = 'lighter';
      d.lamps.forEach((L, i) => {
        const tx = L.x + Math.sin(t * .4 + i * 1.9) * 70, g = c.createLinearGradient(0, 13, 0, 250); g.addColorStop(0, 'rgba(190,215,255,.08)'); g.addColorStop(1, 'rgba(190,215,255,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(L.x - 3, 13); c.lineTo(L.x + 3, 13); c.lineTo(tx + 26, 250); c.lineTo(tx - 26, 250); c.closePath(); c.fill(); });
      c.restore();
      // ---- público: la ola, barras de luz y flashes ----
      const hs = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); }, STICK = {L: '#6fb0ff', R: '#ff8a6a', M: '#ffe26a'}, step = Math.floor(t * 5);
      d.fans.forEach((f, i) => {
        if(Math.sin(t * 1.6 - f.x * .025 + f.r * .4) > .85){ c.fillStyle = '#f1c8a0'; c.fillRect(f.x - 1, f.y - 1, 1, 2); c.fillRect(f.x + f.bw, f.y - 1, 1, 2); }
        if(i % 5 === 0){ c.globalAlpha = .45 + .55 * Math.max(0, Math.sin(t * 3 + i)); c.fillStyle = STICK[f.set]; c.fillRect(f.x + f.bw - 1, f.y - 2, 1, 2); c.globalAlpha = 1; }
        if(hs(i, step) < .01){ c.fillStyle = 'rgba(255,255,255,.95)'; c.fillRect(f.x, f.y + 1, 2, 2); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(f.x - 2, f.y + 1, 6, 1); }
      });
      // ---- videomarcadores: rótulo que se desplaza y ecualizador ----
      c.font = `4px ${FONT}`; c.textBaseline = 'alphabetic';
      d.screens.forEach((S, k) => {
        c.save(); c.beginPath(); c.rect(S.x, S.y, S.w, S.h); c.clip();
        const gr = c.createLinearGradient(0, S.y, 0, S.y + S.h); gr.addColorStop(0, k ? '#2a0c14' : '#0b1638'); gr.addColorStop(1, '#05070f'); c.fillStyle = gr; c.fillRect(S.x, S.y, S.w, S.h);
        c.fillStyle = S.col; c.textAlign = 'center'; c.fillText(k ? 'ROJO' : 'AZUL', S.x + S.w / 2, S.y + 7);
        const msg = 'CLASIFICATORIA · CHAMPIONS CROWN · ', mw = c.measureText(msg).width, off = (t * 14 + k * 40) % mw;
        c.fillStyle = '#ffcc33'; c.textAlign = 'left'; c.fillText(msg + msg, S.x - off, S.y + 14);
        for(let b = 0; b < 12; b++){ const hh = 2 + Math.floor((.5 + .5 * Math.sin(t * 6 + b * 1.3 + k)) * (.5 + .5 * Math.sin(t * 2.3 + b)) * 8);
          c.fillStyle = b % 3 ? S.col : '#e6f0ff'; c.globalAlpha = .85; c.fillRect(S.x + 3 + b * 4, S.y + S.h - 2 - hh, 3, hh); }
        c.globalAlpha = 1;
        for(let y = S.y; y < S.y + S.h; y += 2){ c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(S.x, y, S.w, 1); }        // líneas de pantalla
        c.restore();
      });
      // ---- banda LED: anuncios que pasan ----
      { const y = d.WH - 13, txt = ESTADIO_ADS.map(s => s + '   ◆   ').join(''), tw = c.measureText(txt).width, off = (t * 22) % tw;
        c.save(); c.beginPath(); c.rect(0, y, w, 9); c.clip();
        c.textAlign = 'left'; const COLS = ['#ffcc33', '#6fb0ff', '#ff8a6a', '#9be29b'];
        let x = -off; for(let rep = 0; rep < 3 && x < w; rep++) ESTADIO_ADS.forEach((s, i) => { const seg = s + '   ◆   '; c.fillStyle = COLS[i % COLS.length]; c.fillText(seg, x, y + 7); x += c.measureText(seg).width; });
        for(let xx = 0; xx < w; xx += 2){ c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(xx, y, 1, 9); }                     // rejilla de LEDs
        c.restore(); }
      // ---- drones con cámara sobre la grada ----
      [[.2, 1], [.78, -1]].forEach(([k, s], i) => {
        const x = Math.round(w * k + Math.sin(t * .5 * s + i * 2) * 40), y = Math.round(36 + Math.sin(t * 1.1 + i) * 5), blink = Math.floor(t * 3 + i) % 2;
        c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x - 6, y + 8, 12, 1);
        c.fillStyle = '#9aa6c8'; c.fillRect(x - 7, y - 1, 4, 1); c.fillRect(x + 4, y - 1, 4, 1);                          // hélices
        c.fillStyle = '#3a4466'; c.fillRect(x - 5, y, 10, 3); c.fillStyle = '#6a7699'; c.fillRect(x - 4, y, 8, 1);       // cuerpo
        c.fillStyle = '#10131f'; c.fillRect(x - 1, y + 3, 3, 2);                                                         // cámara
        c.fillStyle = blink ? '#ff4a4a' : '#4ccf6a'; c.fillRect(x - 5, y + 1, 1, 1); c.fillStyle = blink ? '#4ccf6a' : '#ff4a4a'; c.fillRect(x + 4, y + 1, 1, 1);
      });
      // ---- el neón respira y el botón de la Poké Ball late ----
      c.strokeStyle = `rgba(150,190,255,${.1 + .08 * Math.sin(t * 2)})`; c.lineWidth = 2; c.beginPath(); c.ellipse(d.cx, d.cy, 62, 32, 0, 0, Math.PI * 2); c.stroke();
      c.fillStyle = `rgba(140,210,255,${.25 + .25 * Math.sin(t * 3)})`; c.beginPath(); c.ellipse(d.cx, d.cy, 3, 2, 0, 0, Math.PI * 2); c.fill();
    }}
});
