"use strict";
/* =====================================================================
   VIDA EN LOS ESTADIOS NUEVOS (js/render.js, EST): efectos suaves encima de cada imagen, por debajo de los Pokémon.
   - Brock: polvo flotando y un rayo de luz que entra por arriba.     - Misty: destellos en el agua.
   - Surge: chispas en las vallas, rayos en la puerta y lámparas que parpadean.   - Erika: pétalos que caen.
   - Koga: farolillos que titilan y niebla morada.                     - Sabrina: luz de neón que recorre el suelo y motas de neón.
   - Blaine: brasas que suben y fuego que titila.                      - Giovanni: flechas del suelo que se encienden y polvo.
   - Lorelei: nieve, cristales que brillan y lámparas.                 - Bruno: lámparas cálidas y polvo.
   - Agatha: fuegos fatuos que brillan y niebla morada.          - Lance: braseros de fuego azul y destellos dorados.                - Azul: paneles de luz (estAzulFx, js/render.js).
   JOHTO: - Pegaso: plumas que vuela el viento y rachas de aire.        - Antón: hojas que caen, luciérnagas y telarañas que brillan.
   - Blanca: confeti rosa y el emblema que late.                       - Morti: velas que titilan, fuegos fatuos y niebla morada.
   - Aníbal: la cascada cae y brilla, y salpica.                       - Yasmina: luces de las vigas que parpadean y un reflejo que recorre el suelo de acero.
   - Fredo: nieve, cristales que brillan y frío en la puerta.          - Débora: braseros, brasas que suben y grietas de lava que laten.
   HOENN: Petra, Marcial, Erico, Candela, Norman, Alana, Vito y Leti, Galano y el Alto Mando (Sixto, Fátima, Nívea, Dracón).
   Todas las posiciones están medidas sobre la imagen a 1024x572. VIDA.on = false lo apaga todo; VIDA.k = intensidad general.
   ===================================================================== */
const VIDA = {on: true, k: 1};
const vH = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };       // número «al azar» pero siempre el mismo para cada i
const vMod = (a, n) => ((a % n) + n) % n;

function vGlow(S, x, y, r, col, a){                                   // halo de luz redondo (se suma a lo que hay debajo)
  const X = x * S.sx, Y = y * S.sy, R = r * S.sx, gr = ctx.createRadialGradient(X, Y, 0, X, Y, R);
  gr.addColorStop(0, col.replace('A', (a * VIDA.k).toFixed(3))); gr.addColorStop(1, col.replace('A', '0'));
  ctx.fillStyle = gr; ctx.fillRect(X - R, Y - R, R * 2, R * 2);
}
// Motas que se mueven por una zona [x0, y0, x1, y1]: vy > 0 caen, vy < 0 suben · sw = cuánto se balancean · f = 'pet' para pétalos que giran
function vMotas(S, n, Z, o){
  const [x0, y0, x1, y1] = Z, w = x1 - x0, h = y1 - y0, t = S.t;
  for(let i = 0; i < n; i++){
    const sp = .6 + .8 * vH(i + 7 + (o.seed || 0)), yy = vMod(vH(i + 99 + (o.seed || 0)) * h + t * o.vy * sp, h), y = y0 + yy;
    const x = x0 + vMod(vH(i + (o.seed || 0)) * w + t * (o.vx || 0) * sp + Math.sin(t * (o.swf || 1.3) + i * 2.1) * (o.sw || 0), w);
    const edge = Math.min(1, yy / 25, (h - yy) / 25), a = (o.a || .6) * edge * (o.tw ? .55 + .45 * Math.sin(t * 4 + i) : 1) * VIDA.k;
    if(a <= .01) continue;
    const col = o.col[i % o.col.length], s = (o.s || 2) * (.7 + .6 * vH(i + 31)) * S.sx;
    ctx.globalAlpha = a; ctx.fillStyle = col;
    if(o.f === 'pet'){ const k = Math.abs(Math.cos(t * 2.6 + i)); ctx.fillRect(Math.round(x * S.sx - s * k / 2), Math.round(y * S.sy), Math.max(1, Math.round(s * (k + .3))), Math.max(1, Math.round(s * .8))); }
    else ctx.fillRect(Math.round(x * S.sx), Math.round(y * S.sy), Math.max(1, Math.round(s)), Math.max(1, Math.round(s)));
  }
  ctx.globalAlpha = 1;
}
// Destellos (estrellita de 4 puntas) que aparecen y se apagan en sitios al azar de unas zonas, o en puntos fijos
function vBrillos(S, n, zonas, col, o){
  o = o || {}; const t = S.t;
  for(let i = 0; i < n; i++){
    const per = (o.per || 1.6) + vH(i + 5) * 1.2, ph = vH(i + 17) * per, c = Math.floor((t + ph) / per), fr = ((t + ph) / per) % 1;
    const k = Math.sin(Math.PI * Math.min(1, fr * 1.6)); if(fr > .62) continue;
    let x, y;
    if(o.puntos){ const p = o.puntos[i % o.puntos.length]; x = p[0] + (vH(i * 7 + c) - .5) * (o.r || 12); y = p[1] + (vH(i * 11 + c) - .5) * (o.r || 12); }
    else { const Z = zonas[Math.floor(vH(i * 3 + c * 1.7) * zonas.length) % zonas.length]; x = Z[0] + vH(i * 13 + c) * (Z[2] - Z[0]); y = Z[1] + vH(i * 29 + c) * (Z[3] - Z[1]); }
    const X = Math.round(x * S.sx), Y = Math.round(y * S.sy), L = Math.max(1, Math.round((o.s || 4) * k * S.sx));
    ctx.globalAlpha = Math.min(1, k * (o.a || .9) * VIDA.k); ctx.fillStyle = col;
    ctx.fillRect(X - L, Y, L * 2 + 1, 1); ctx.fillRect(X, Y - L, 1, L * 2 + 1); ctx.fillRect(X - 1, Y - 1, 3, 3);
  }
  ctx.globalAlpha = 1;
}
// Luces que titilan (farolillos, lámparas, fuego): f = velocidad del parpadeo
function vLuces(S, P, r, col, a, f){
  P.forEach((p, i) => { const fl = .72 + .18 * Math.sin(S.t * (f || 3) + i * 1.9) + .1 * Math.sin(S.t * (f || 3) * 2.7 + i); vGlow(S, p[0], p[1], r * (.9 + .1 * fl), col, a * fl); });
}
// Niebla: manchas grandes y suaves que van de lado a lado por una franja
function vNiebla(S, n, Z, col, a){
  const [x0, y0, x1, y1] = Z, w = x1 - x0;
  for(let i = 0; i < n; i++){
    const x = x0 + vMod(vH(i + 3) * w + S.t * (6 + vH(i) * 8) * (i % 2 ? 1 : -1), w), y = y0 + vH(i + 41) * (y1 - y0);
    vGlow(S, x, y, 45 + vH(i + 9) * 40, col, a * (.6 + .4 * Math.sin(S.t * .7 + i)));
  }
}
// Rayos eléctricos cortos dentro de una zona (cambian varias veces por segundo)
function vRayos(S, Z, n, col){
  const t = S.t, c = Math.floor(t * 9);
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, S.sx); ctx.globalAlpha = .85 * VIDA.k;
  for(let i = 0; i < n; i++){
    if(vH(c * 3 + i * 17) > .45) continue;                            // no siempre hay rayo
    let x = Z[0] + vH(c + i * 5) * (Z[2] - Z[0]), y = Z[1] + vH(c * 2 + i) * (Z[3] - Z[1]); const ang = vH(c + i * 9) * 6.283, L = 10 + vH(c * 7 + i) * 18;
    ctx.beginPath(); ctx.moveTo(x * S.sx, y * S.sy);
    for(let k = 1; k <= 4; k++){ x += Math.cos(ang) * L / 4 + (vH(c * 11 + i * 3 + k) - .5) * 8; y += Math.sin(ang) * L / 4 + (vH(c * 13 + i * 7 + k) - .5) * 8; ctx.lineTo(x * S.sx, y * S.sy); }
    ctx.stroke();
  }
  ctx.restore();
}

const VIDA_FX = {
  brock(S){
    ctx.globalCompositeOperation = 'lighter';
    const p = .055 + .02 * Math.sin(S.t * .6);                        // rayo de luz que baja desde la entrada de arriba
    const gr = ctx.createLinearGradient(0, 0, 0, 330 * S.sy); gr.addColorStop(0, `rgba(255,236,190,${p * VIDA.k})`); gr.addColorStop(1, 'rgba(255,236,190,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(440 * S.sx, 0); ctx.lineTo(585 * S.sx, 0); ctx.lineTo(690 * S.sx, 330 * S.sy); ctx.lineTo(335 * S.sx, 330 * S.sy); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 34, [60, 20, 970, 470], {vy: -4, vx: 3, sw: 10, col: ['#fff3d6', '#e8d2a8'], a: .5, s: 2, tw: 1});
  },
  misty(S){
    vBrillos(S, 26, [[15, 190, 150, 560], [880, 190, 1010, 560], [150, 465, 445, 525], [580, 465, 885, 525], [360, 150, 440, 185], [585, 150, 665, 185]], '#ffffff', {s: 4, per: 1.3});
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[60, 300], [960, 300], [300, 495], [730, 495]], 90, 'rgba(120,230,255,A)', .07, 1.1);   // reflejo suave que sube y baja en el agua
    ctx.globalCompositeOperation = 'source-over';
  },
  lt_surge(S){
    ctx.globalCompositeOperation = 'lighter';
    const on = vH(Math.floor(S.t * 7)) > .12;                          // las lámparas de la pared fallan de vez en cuando
    vLuces(S, [[55, 90], [970, 90]], 45, 'rgba(255,220,90,A)', on ? .45 : .12, 9);
    vLuces(S, [[512, 60]], 120, 'rgba(140,220,255,A)', .16 + .08 * Math.sin(S.t * 5), 6);
    ctx.globalCompositeOperation = 'source-over';
    vRayos(S, [445, 15, 580, 100], 3, '#d8f6ff');
    vBrillos(S, 14, [[175, 112, 330, 148], [685, 112, 840, 148]], '#e6fbff', {s: 3, per: .6});
  },
  erika(S){
    vMotas(S, 26, [0, -10, 1024, 560], {vy: 16, vx: 9, sw: 18, swf: 1.1, col: ['#ffb7d2', '#ff8fb8', '#fff0f5', '#ffd1e3'], a: .9, s: 4, f: 'pet'});
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[512, 40]], 200, 'rgba(255,245,200,A)', .07, .5);
    ctx.globalCompositeOperation = 'source-over';
  },
  koga(S){
    vNiebla(S, 8, [0, 120, 1024, 470], 'rgba(150,80,200,A)', .10);
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[228, 186], [616, 132], [797, 186], [130, 397], [893, 397]], 42, 'rgba(255,110,230,A)', .35, 4);
    ctx.globalCompositeOperation = 'source-over';
  },
  sabrina(S){
    ctx.save(); ctx.beginPath();                                        // una luz de neón que recorre la cuadrícula del suelo
    [[232, 195], [795, 195], [895, 437], [128, 437]].forEach(([x, y], i) => i ? ctx.lineTo(x * S.sx, y * S.sy) : ctx.moveTo(x * S.sx, y * S.sy)); ctx.closePath(); ctx.clip();
    const k = vMod(S.t * .28, 1.6) - .3, X = (128 + k * 770) * S.sx, gr = ctx.createLinearGradient(X - 120 * S.sx, 0, X + 120 * S.sx, 0);
    gr.addColorStop(0, 'rgba(80,255,255,0)'); gr.addColorStop(.5, `rgba(80,255,255,${.16 * VIDA.k})`); gr.addColorStop(1, 'rgba(80,255,255,0)');
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[420, 150], [605, 150]], 55, 'rgba(160,230,255,A)', .3, 2.2);
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 22, [0, 0, 1024, 560], {vy: -9, sw: 8, col: ['#6ff6ff', '#ff7bf0', '#b98bff'], a: .55, s: 2, tw: 1});
  },
  blaine(S){
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[213, 156]], 50, 'rgba(255,150,40,A)', .45, 7);
    vLuces(S, [[167, 163], [838, 152]], 26, 'rgba(120,255,140,A)', .22, 2);
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 40, [0, 0, 1024, 572], {vy: -22, sw: 12, swf: 1.8, col: ['#ffb347', '#ff7a1a', '#ffe08a'], a: .9, s: 3, tw: 1});
  },
  giovanni(S){
    ctx.globalCompositeOperation = 'lighter';
    const P = [[510, 175], [166, 295], [857, 295], [18, 465], [1000, 465], [292, 555], [722, 555]];
    P.forEach((p, i) => vGlow(S, p[0], p[1], 26, 'rgba(255,210,60,A)', .3 * Math.max(0, Math.sin(S.t * 2.2 - i * .9))));      // las flechas del suelo se encienden en cadena
    vLuces(S, [[420, 18], [592, 18]], 40, 'rgba(255,60,60,A)', .18, 1.5);
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 26, [40, 30, 990, 560], {vy: 3, vx: -4, sw: 8, col: ['#d9d2c4', '#bfb6a6'], a: .4, s: 2, tw: 1});
  },
  lorelei(S){
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[103, 110], [84, 140], [65, 172], [48, 202], [30, 236], [12, 268], [912, 113], [932, 148], [950, 180], [970, 210], [992, 245], [1015, 278]], 22, 'rgba(255,220,120,A)', .3, 2.5);
    ctx.globalCompositeOperation = 'source-over';
    vBrillos(S, 12, null, '#ffffff', {puntos: [[232, 165], [105, 255], [918, 258], [103, 468], [946, 468], [290, 512], [728, 515], [940, 400]], s: 5, per: 1.4, r: 14});
    vMotas(S, 45, [0, -10, 1024, 572], {vy: 18, vx: -5, sw: 14, col: ['#ffffff', '#e2f6ff'], a: .85, s: 3});
  },
  bruno(S){
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[70, 165], [28, 235], [8, 270], [930, 147], [968, 212], [995, 240], [1018, 272]], 26, 'rgba(255,190,90,A)', .35, 3.5);
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 26, [60, 40, 970, 520], {vy: -3, vx: 4, sw: 10, col: ['#ffe2b0', '#f2c98c'], a: .45, s: 2, tw: 1});
  },
  lance(S){
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[213, 182], [810, 182], [115, 415], [908, 415]], 50, 'rgba(150,210,255,A)', .5, 5);       // braseros de fuego azul
    vLuces(S, [[512, 30]], 90, 'rgba(160,140,255,A)', .14, 1.2);                                           // la puerta del fondo
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 30, [0, 0, 1024, 560], {vy: -6, sw: 10, col: ['#ffe9a0', '#fff6d0', '#ffd25a'], a: .7, s: 2, tw: 1});      // destellos dorados en el aire
  },
  agatha(S){
    vNiebla(S, 9, [0, 150, 1024, 560], 'rgba(170,90,230,A)', .11);
    ctx.globalCompositeOperation = 'lighter';
    const P = [[283, 133], [713, 122], [138, 232], [902, 215], [940, 345], [85, 395], [185, 483], [835, 490]];
    P.forEach((p, i) => vGlow(S, p[0], p[1] + Math.sin(S.t * 1.6 + i) * 4, 30, 'rgba(190,140,255,A)', .28 + .14 * Math.sin(S.t * 2.3 + i * 1.7)));
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 18, [0, 100, 1024, 560], {vy: -7, sw: 14, col: ['#d8b8ff', '#a77cff'], a: .5, s: 2, tw: 1});
  },
  // ---------------- JOHTO ----------------
  pegaso(S){
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[512, 10]], 220, 'rgba(255,250,220,A)', .08, .4);                                           // luz del cielo
    ctx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.fillStyle = '#ffffff';                                                                  // rachas de viento: rayitas que cruzan
    for(let i = 0; i < 7; i++){ const per = 3 + vH(i) * 3, fr = vMod(S.t / per + vH(i + 4), 1), y = 150 + vH(i * 9 + Math.floor(S.t / per + vH(i + 4))) * 330, x = -120 + fr * 1270, L = 60 + vH(i + 2) * 70;
      ctx.globalAlpha = .22 * Math.sin(Math.PI * fr) * VIDA.k; ctx.fillRect(x * S.sx, y * S.sy, L * S.sx, Math.max(1, S.sy)); }
    ctx.restore();
    vMotas(S, 14, [0, 60, 1024, 560], {vy: 10, vx: 28, sw: 14, swf: 1.4, col: ['#ffffff', '#eef4ff'], a: .85, s: 5, f: 'pet', seed: 3});      // plumas
  },
  anton(S){
    vMotas(S, 22, [0, -10, 1024, 560], {vy: 14, vx: 6, sw: 20, swf: 1, col: ['#e8762c', '#c9441e', '#f2b33a', '#9c5a22'], a: .9, s: 4, f: 'pet', seed: 11});   // hojas
    vBrillos(S, 10, null, '#ffffff', {puntos: [[320, 135], [398, 125], [610, 125], [697, 135], [100, 55], [920, 60], [50, 330], [962, 335], [290, 505], [735, 505]], s: 3, per: 1.8, r: 18, a: .7});   // telarañas
    ctx.globalCompositeOperation = 'lighter';
    for(let i = 0; i < 12; i++){ const x = 60 + vH(i + 50) * 900 + Math.sin(S.t * .7 + i) * 30, y = 150 + vH(i + 70) * 340 + Math.sin(S.t * 1.1 + i * 2) * 18;     // luciérnagas
      vGlow(S, x, y, 9, 'rgba(200,255,120,A)', .55 * Math.max(0, Math.sin(S.t * 1.8 + i * 1.3))); }
    ctx.globalCompositeOperation = 'source-over';
  },
  blanca(S){
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[512, 48]], 60, 'rgba(255,170,220,A)', .35 + .15 * Math.sin(S.t * 2.2), 2);                 // el emblema de la pared
    vLuces(S, [[408, 140], [606, 140]], 30, 'rgba(255,230,190,A)', .35, 2.5);                               // farolillos
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 30, [0, -10, 1024, 560], {vy: 12, vx: 3, sw: 16, swf: 1.2, col: ['#ff9ccf', '#ffd6ec', '#fff2a8', '#c8f2e0'], a: .8, s: 3, f: 'pet', seed: 21});   // confeti
    vBrillos(S, 8, [[150, 160, 880, 450]], '#ffffff', {s: 4, per: 1.5, a: .7});
  },
  morti(S){
    vNiebla(S, 7, [0, 120, 200, 560], 'rgba(150,90,230,A)', .12); vNiebla(S, 7, [830, 120, 1024, 560], 'rgba(150,90,230,A)', .12);
    vNiebla(S, 6, [80, 470, 950, 572], 'rgba(120,80,220,A)', .10);
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[412, 58], [458, 40], [565, 40], [605, 55], [370, 150], [642, 152], [158, 195], [185, 180], [840, 188], [858, 196], [80, 420], [945, 420], [270, 540], [700, 540]], 16, 'rgba(255,200,255,A)', .5, 6);   // velas
    vLuces(S, [[408, 135], [606, 135], [120, 210], [895, 210], [45, 400], [975, 400]], 24, 'rgba(210,160,255,A)', .4, 2.4);                 // farolillos
    const P = [[150, 300], [880, 290], [330, 470], [690, 470], [512, 150]];                                  // fuegos fatuos que flotan
    P.forEach((p, i) => vGlow(S, p[0] + Math.sin(S.t * .8 + i) * 25, p[1] + Math.sin(S.t * 1.5 + i * 2) * 10, 16, 'rgba(150,170,255,A)', .45 * Math.max(0, Math.sin(S.t * .9 + i * 1.7))));
    ctx.globalCompositeOperation = 'source-over';
  },
  anibal(S){
    ctx.save(); ctx.beginPath(); ctx.rect(482 * S.sx, 0, 62 * S.sx, 78 * S.sy); ctx.clip();                    // el agua de la cascada cae
    ctx.fillStyle = '#ffffff';
    for(let i = 0; i < 14; i++){ const x = 484 + vH(i + 3) * 58, y = vMod(vH(i + 8) * 110 + S.t * (140 + vH(i) * 60), 110) - 20;
      ctx.globalAlpha = .35 * VIDA.k; ctx.fillRect(x * S.sx, y * S.sy, Math.max(1, 2 * S.sx), 16 * S.sy); }
    ctx.restore();
    vBrillos(S, 10, [[430, 62, 595, 100]], '#ffffff', {s: 4, per: .9});                                       // espuma del pozo
    vMotas(S, 10, [440, 40, 590, 100], {vy: -12, sw: 8, col: ['#e8f8ff', '#bfe9ff'], a: .6, s: 2, seed: 5});   // salpicaduras
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[512, 70]], 80, 'rgba(140,220,255,A)', .14, 1.3);
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 20, [80, 120, 950, 520], {vy: -3, vx: 3, sw: 10, col: ['#ffe9c7', '#e3cfa8'], a: .35, s: 2, tw: 1});      // polvo del dojo
  },
  yasmina(S){
    ctx.save(); ctx.beginPath();                                                                             // un reflejo de luz que recorre el suelo de acero
    [[150, 160], [880, 160], [1000, 470], [30, 470]].forEach(([x, y], i) => i ? ctx.lineTo(x * S.sx, y * S.sy) : ctx.moveTo(x * S.sx, y * S.sy)); ctx.closePath(); ctx.clip();
    const k = vMod(S.t * .22, 1.6) - .3, X = (30 + k * 970) * S.sx, gr = ctx.createLinearGradient(X - 90 * S.sx, 0, X + 90 * S.sx, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, `rgba(255,255,255,${.12 * VIDA.k})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.globalCompositeOperation = 'lighter';
    const L = [[20, 42], [60, 42], [100, 42], [905, 42], [945, 42], [985, 42], [20, 482], [60, 482], [100, 482], [930, 482], [970, 482], [1005, 482], [235, 150], [325, 150], [700, 150], [790, 150]];
    L.forEach((p, i) => vGlow(S, p[0], p[1], 9, i % 2 ? 'rgba(90,240,255,A)' : 'rgba(255,230,80,A)', vH(Math.floor(S.t * 3) + i * 7) > .3 ? .7 : .12));      // lucecitas que parpadean
    vLuces(S, [[512, 28]], 60, 'rgba(200,230,255,A)', .2, 1.5);
    ctx.globalCompositeOperation = 'source-over';
  },
  fredo(S){
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[512, 40]], 70, 'rgba(120,200,255,A)', .2, .9);                                              // frío que sale de la puerta
    ctx.globalCompositeOperation = 'source-over';
    vBrillos(S, 12, null, '#ffffff', {puntos: [[168, 185], [855, 185], [48, 395], [975, 395], [195, 470], [830, 470], [370, 170], [128, 405], [895, 405]], s: 5, per: 1.4, r: 14});
    vBrillos(S, 8, [[180, 215, 830, 425]], '#ffffff', {s: 3, per: 1.7, a: .6});                              // destellos en el hielo
    vMotas(S, 45, [0, -10, 1024, 572], {vy: 18, vx: -5, sw: 14, col: ['#ffffff', '#e2f6ff'], a: .85, s: 3, seed: 7});
  },
  debora(S){
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[407, 135], [612, 135], [418, 30], [598, 30], [52, 400], [972, 400], [290, 495], [733, 495]], 34, 'rgba(255,150,40,A)', .5, 7);      // braseros
    const C = [[30, 360], [990, 360], [150, 200], [875, 200], [230, 550], [790, 550], [995, 420], [20, 420]];       // grietas de lava que laten
    C.forEach((p, i) => vGlow(S, p[0], p[1], 40, 'rgba(255,90,20,A)', .16 + .1 * Math.sin(S.t * 1.6 + i * 1.3)));
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 34, [0, 0, 1024, 572], {vy: -20, sw: 12, swf: 1.8, col: ['#ffb347', '#ff7a1a', '#ffe08a'], a: .85, s: 3, tw: 1});      // brasas
  },
  // ---------------- ALTO MANDO Y CAMPEÓN DE JOHTO ----------------
  mento(S){                                                                                                 // paneles de teletransporte que laten, ventanas azules, destellos rosas
    ctx.globalCompositeOperation = 'lighter';
    [[208, 144], [728, 128], [792, 184], [215, 180]].forEach((p, i) => vGlow(S, p[0], p[1] + Math.sin(S.t * 1.3 + i) * 4, 40, 'rgba(120,240,255,A)', .3 + .2 * Math.sin(S.t * 2.4 + i * 1.7)));
    vLuces(S, [[495, 34], [530, 34], [600, 120], [625, 120], [300, 500], [740, 500], [20, 300], [1005, 300]], 18, 'rgba(110,190,255,A)', .45, 2);
    ctx.globalCompositeOperation = 'source-over';
    vBrillos(S, 14, [[90, 200, 930, 450]], '#ffffff', {s: 3, per: 1.6, a: .7});
    vMotas(S, 20, [0, 60, 1024, 560], {vy: -8, sw: 12, col: ['#ffd6f5', '#c8f4ff', '#ffffff'], a: .6, s: 2, tw: 1});
  },
  j_koga(S){                                                                                                // charcos de veneno que burbujean y niebla morada
    vNiebla(S, 7, [0, 120, 220, 560], 'rgba(120,60,170,A)', .12); vNiebla(S, 7, [800, 120, 1024, 560], 'rgba(120,60,170,A)', .12);
    ctx.globalCompositeOperation = 'lighter';
    [[784, 216], [168, 424], [912, 456], [120, 445]].forEach((p, i) => vGlow(S, p[0], p[1], 34, 'rgba(110,255,90,A)', .18 + .12 * Math.sin(S.t * 2 + i)));
    ctx.globalCompositeOperation = 'source-over';
    [[784, 216], [168, 424], [912, 456]].forEach((p, j) => vMotas(S, 5, [p[0] - 26, p[1] - 30, p[0] + 26, p[1] + 4], {vy: -14, sw: 4, col: ['#8cff5a', '#c8ff9a'], a: .8, s: 3, seed: 40 + j}));
    vMotas(S, 16, [0, 80, 1024, 560], {vy: -5, vx: 3, sw: 10, col: ['#b98cff', '#7ad65a'], a: .4, s: 2, tw: 1});
  },
  j_bruno(S){                                                                                               // torres de lava que laten y brasas que suben
    ctx.globalCompositeOperation = 'lighter';
    [[32, 99], [992, 99], [32, 347], [992, 347]].forEach((p, i) => vGlow(S, p[0], p[1], 70, 'rgba(255,110,20,A)', .32 + .16 * Math.sin(S.t * 1.7 + i * 1.3)));
    vLuces(S, [[230, 110], [790, 110], [400, 30], [630, 30]], 40, 'rgba(255,140,40,A)', .22, 1.2);
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 30, [0, 60, 1024, 572], {vy: -22, sw: 12, swf: 1.6, col: ['#ffb347', '#ff7a1a', '#ffe08a'], a: .85, s: 3, tw: 1});
  },
  karen(S){                                                                                                 // el suelo de estrellas titila, ventanas azules y polvo dorado
    vBrillos(S, 34, [[100, 195, 930, 455]], '#ffe58a', {s: 4, per: 1.3, a: .9});
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[505, 30], [535, 30], [20, 330], [1005, 330], [460, 100], [570, 100]], 22, 'rgba(90,150,255,A)', .4, 1.6);
    vGlow(S, 80, 60, 120, 'rgba(160,20,60,A)', .12); vGlow(S, 944, 60, 120, 'rgba(160,20,60,A)', .12);
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 18, [0, 0, 1024, 560], {vy: 6, sw: 10, col: ['#ffe58a', '#ffffff'], a: .55, s: 2, tw: 1});
  },
  j_lance(S){                                                                                               // el salón dorado brilla: destellos en el oro, la puerta y la alfombra
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[512, 40]], 60, 'rgba(160,120,255,A)', .22 + .1 * Math.sin(S.t * 1.5), 1);
    vLuces(S, [[60, 200], [964, 200], [60, 420], [964, 420], [250, 90], [775, 90]], 46, 'rgba(255,210,90,A)', .22, 1.4);
    ctx.globalCompositeOperation = 'source-over';
    vBrillos(S, 18, [[0, 40, 140, 540], [884, 40, 1024, 540], [300, 470, 724, 560]], '#fff4c0', {s: 5, per: 1.4});
    vMotas(S, 24, [0, 0, 1024, 572], {vy: -6, sw: 12, col: ['#ffe58a', '#ffd040', '#ffffff'], a: .7, s: 2, tw: 1});
  },
  // ---------------- HOENN ----------------
  petra(S){                                                                                                 // antorchas que titilan y polvo de roca
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[100, 122], [45, 190], [918, 118], [968, 182]], 42, 'rgba(255,140,40,A)', .4, 3.4);
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 22, [0, 60, 1024, 560], {vy: -5, vx: 3, sw: 10, col: ['#e8d8c8', '#c8b8a8'], a: .45, s: 2});
  },
  marcial(S){                                                                                               // lámparas y polvo de entrenamiento
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[55, 92], [968, 92]], 46, 'rgba(255,230,170,A)', .35, 1.2);
    vGlow(S, 512, 75, 70, 'rgba(140,150,255,A)', .12 + .06 * Math.sin(S.t * 1.4));
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 24, [0, 60, 1024, 560], {vy: -6, vx: 4, sw: 12, col: ['#f0e6d0', '#d6c9a8'], a: .45, s: 2});
  },
  erico(S){                                                                                                 // arcos entre las bobinas, puntas que brillan e interruptores de rayo que se encienden
    ctx.globalCompositeOperation = 'lighter';
    [[178, 165], [112, 195], [157, 195], [48, 330], [92, 330], [848, 165], [867, 195], [910, 195], [930, 330], [975, 330]].forEach((p, i) => vGlow(S, p[0], p[1], 22, 'rgba(120,240,255,A)', .3 + .25 * Math.max(0, Math.sin(S.t * 5 + i * 2.3))));
    [[110, 295], [905, 295], [135, 440], [875, 440]].forEach((p, i) => vGlow(S, p[0], p[1], 26, 'rgba(255,230,60,A)', .18 + .22 * Math.max(0, Math.sin(S.t * 2.2 + i * 1.6))));
    ctx.globalCompositeOperation = 'source-over';
    vRayos(S, [100, 180, 190, 225], 3, '#9ff6ff'); vRayos(S, [40, 320, 110, 355], 2, '#9ff6ff');
    vRayos(S, [835, 180, 925, 225], 3, '#9ff6ff'); vRayos(S, [915, 320, 985, 355], 2, '#9ff6ff');
    vBrillos(S, 10, [[30, 150, 200, 380], [825, 150, 995, 380]], '#e0fbff', {s: 3, per: 1, a: .8});
  },
  candela(S){                                                                                               // vapor que sale de los respiraderos, lámparas y calor
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[50, 98], [970, 98]], 46, 'rgba(255,140,40,A)', .4, 2.6);
    ctx.globalCompositeOperation = 'source-over';
    [[145, 222], [85, 350], [135, 450], [878, 222], [940, 350], [885, 450]].forEach((p, j) => {
      vGlow(S, p[0], p[1] - 40, 40, 'rgba(255,255,255,A)', .1 + .06 * Math.sin(S.t * 1.8 + j));
      vMotas(S, 7, [p[0] - 18, p[1] - 90, p[0] + 18, p[1]], {vy: -26, sw: 8, swf: 1.6, col: ['#ffffff', '#f2e6e6'], a: .5, s: 5, seed: 60 + j * 9});
    });
    vMotas(S, 18, [0, 100, 1024, 572], {vy: -14, sw: 10, col: ['#ffb347', '#ff7a1a'], a: .6, s: 2, tw: 1});
  },
  norman(S){                                                                                                // farolillos de papel y motas de polvo en la luz
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[52, 100], [968, 100], [410, 12], [615, 12]], 40, 'rgba(255,210,140,A)', .38, 1.4);
    vLuces(S, [[512, 20]], 200, 'rgba(255,230,190,A)', .07, .5);
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 26, [100, 40, 924, 520], {vy: 5, vx: 2, sw: 10, col: ['#fff1d6', '#ffe0b0'], a: .5, s: 2, tw: 1});
  },
  alana(S){                                                                                                 // rachas de viento, plumas y luz del cielo
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[512, 20]], 220, 'rgba(220,245,255,A)', .1, .4);
    vLuces(S, [[55, 92], [968, 92], [592, 18]], 26, 'rgba(200,240,255,A)', .35, 1.2);
    ctx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.fillStyle = '#ffffff';
    for(let i = 0; i < 6; i++){ const per = 3 + vH(i) * 3, fr = vMod(S.t / per + vH(i + 4), 1), y = 160 + vH(i * 9 + Math.floor(S.t / per + vH(i + 4))) * 300, x = -120 + fr * 1270, L = 60 + vH(i + 2) * 70;
      ctx.globalAlpha = .22 * Math.sin(Math.PI * fr) * VIDA.k; ctx.fillRect(x * S.sx, y * S.sy, L * S.sx, Math.max(1, S.sy)); }
    ctx.restore();
    vMotas(S, 12, [0, 60, 1024, 560], {vy: 10, vx: 26, sw: 14, swf: 1.4, col: ['#ffffff', '#e6f6ff'], a: .8, s: 5, f: 'pet', seed: 8});
  },
  vitoleti(S){                                                                                              // teletransportes que laten, baldosas de colores y el corazón
    ctx.globalCompositeOperation = 'lighter';
    [[120, 285], [895, 285], [140, 452], [882, 452]].forEach((p, i) => vGlow(S, p[0], p[1], 40, 'rgba(150,230,255,A)', .25 + .2 * Math.sin(S.t * 2.4 + i * 1.6)));
    [[160, 233, '255,120,220'], [865, 233, '255,170,80'], [93, 363, '255,120,200'], [928, 363, '90,255,160']].forEach((p, i) => vGlow(S, p[0], p[1], 24, 'rgba(' + p[2] + ',A)', .2 + .15 * Math.sin(S.t * 3 + i)));
    vGlow(S, 512, 72, 40, 'rgba(255,120,180,A)', .25 + .15 * Math.sin(S.t * 3));
    vLuces(S, [[55, 100], [968, 100]], 30, 'rgba(220,235,255,A)', .3, 1.2);
    ctx.globalCompositeOperation = 'source-over';
    vBrillos(S, 14, [[100, 180, 925, 420]], '#ffd6f5', {s: 3, per: 1.5, a: .7});
    vMotas(S, 16, [0, 60, 1024, 560], {vy: -8, sw: 12, col: ['#ffd6f5', '#c8f4ff', '#ffffff'], a: .5, s: 2, tw: 1});
  },
  galano(S){                                                                                                // las cascadas caen y salpican, y el hielo brilla
    [[90, 215, 108, 290], [918, 215, 938, 290]].forEach((Z, j) => {
      vMotas(S, 10, Z, {vy: 90, sw: 2, col: ['#ffffff', '#bfeaff'], a: .7, s: 2, seed: 20 + j * 7});
      vMotas(S, 6, [Z[0] - 14, Z[3] - 12, Z[2] + 14, Z[3] + 6], {vy: -14, sw: 6, col: ['#ffffff', '#d8f4ff'], a: .6, s: 2, seed: 50 + j * 7, tw: 1});
    });
    ctx.globalCompositeOperation = 'lighter';
    vGlow(S, 512, 15, 30, 'rgba(120,200,255,A)', .3 + .15 * Math.sin(S.t * 2));
    ctx.globalCompositeOperation = 'source-over';
    vBrillos(S, 22, [[130, 175, 910, 410], [20, 340, 80, 390], [940, 380, 1005, 430], [160, 150, 205, 195], [830, 165, 875, 205]], '#ffffff', {s: 4, per: 1.5, a: .85});
  },
  sixto(S){                                                                                                 // luces ámbar que laten, la vidriera brilla y motas oscuras
    ctx.globalCompositeOperation = 'lighter';
    const L = []; [50, 100, 150, 200, 250].forEach(y => { L.push([55, y + 15]); L.push([968, y + 15]); });
    vLuces(S, L, 14, 'rgba(255,180,70,A)', .5, 2);
    vLuces(S, [[447, 100], [576, 100]], 26, 'rgba(255,170,60,A)', .4, 2.6);
    vGlow(S, 512, 25, 70, 'rgba(255,150,200,A)', .14 + .08 * Math.sin(S.t * 1.3));
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 20, [0, 60, 1024, 560], {vy: -5, vx: 3, sw: 10, col: ['#ffcf80', '#a0784a'], a: .45, s: 2, tw: 1});
  },
  fatima(S){                                                                                                // velas de fuego morado, niebla y fuegos fatuos
    vNiebla(S, 8, [0, 380, 1024, 572], 'rgba(150,90,220,A)', .14);
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[68, 95], [68, 215], [165, 92], [446, 98], [576, 98], [845, 92], [955, 95], [955, 215]], 26, 'rgba(190,120,255,A)', .5, 3.2);
    vGlow(S, 512, 25, 70, 'rgba(255,160,230,A)', .12 + .06 * Math.sin(S.t * 1.2));
    [[260, 140], [770, 140], [60, 420], [965, 420]].forEach((p, i) => vGlow(S, p[0] + Math.sin(S.t * .8 + i) * 20, p[1] + Math.sin(S.t * 1.3 + i) * 8, 22, 'rgba(200,150,255,A)', .3 + .15 * Math.sin(S.t * 2 + i)));
    ctx.globalCompositeOperation = 'source-over';
    vMotas(S, 18, [0, 100, 1024, 560], {vy: -8, sw: 14, col: ['#d8b8ff', '#a77cff'], a: .5, s: 2, tw: 1});
  },
  nivea(S){                                                                                                 // nieve que cae, cristales que brillan y lámparas frías
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[75, 210], [948, 210], [445, 98], [578, 98]], 26, 'rgba(190,235,255,A)', .4, 1.4);
    vGlow(S, 512, 25, 70, 'rgba(170,220,255,A)', .14 + .06 * Math.sin(S.t * 1.2));
    ctx.globalCompositeOperation = 'source-over';
    vBrillos(S, 24, [[95, 195, 930, 412], [60, 280, 100, 320], [730, 485, 770, 530], [960, 420, 1005, 450]], '#ffffff', {s: 4, per: 1.4, a: .9});
    vMotas(S, 40, [0, 0, 1024, 572], {vy: 22, vx: 6, sw: 14, swf: 1, col: ['#ffffff', '#e6f6ff'], a: .8, s: 3});
  },
  dracon(S){                                                                                                // braseros y antorchas, brasas que suben y el borde rojo que late
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[447, 150], [576, 150]], 50, 'rgba(255,120,30,A)', .5, 3.6);
    vLuces(S, [[85, 58], [75, 205], [935, 58], [948, 205], [420, 10], [603, 10], [447, 100], [576, 100]], 30, 'rgba(255,140,40,A)', .4, 3.2);
    vGlow(S, 512, 25, 70, 'rgba(255,60,40,A)', .14 + .08 * Math.sin(S.t * 1.4));
    ctx.globalCompositeOperation = 'source-over';
    [[447, 150], [576, 150]].forEach((p, j) => vMotas(S, 8, [p[0] - 16, p[1] - 60, p[0] + 16, p[1] - 4], {vy: -30, sw: 6, col: ['#ffb347', '#ff7a1a', '#ffe08a'], a: .9, s: 3, seed: 70 + j * 5, tw: 1}));
    vMotas(S, 26, [0, 60, 1024, 572], {vy: -18, sw: 12, swf: 1.6, col: ['#ffb347', '#ff7a1a', '#ffe08a'], a: .7, s: 2, tw: 1});
  },
  plubio(S){                                                                                                // salón de mármol: lámparas doradas, la vidriera brilla y destellos en el suelo
    ctx.globalCompositeOperation = 'lighter';
    vLuces(S, [[88, 62], [75, 210], [935, 62], [948, 210], [420, 12], [603, 12], [447, 105], [576, 105], [447, 155], [576, 155]], 30, 'rgba(255,215,120,A)', .38, 1.4);
    vGlow(S, 512, 30, 80, 'rgba(120,170,255,A)', .16 + .08 * Math.sin(S.t * 1.3));
    ctx.globalCompositeOperation = 'source-over';
    vBrillos(S, 20, [[90, 192, 935, 418], [0, 130, 60, 400], [964, 130, 1024, 400]], '#ffffff', {s: 4, per: 1.5, a: .85});
    vMotas(S, 22, [0, 0, 1024, 572], {vy: -6, sw: 12, col: ['#ffe58a', '#ffffff', '#cfe0ff'], a: .6, s: 2, tw: 1});
  }
};
function estVida(E, id){
  if(!VIDA.on || !E || !VIDA_FX[id]) return;
  const S = {sx: W / E.w, sy: H / E.h, t: g ? g.t : performance.now() / 1000};
  ctx.save(); ctx.imageSmoothingEnabled = false;
  try{ VIDA_FX[id](S); }catch(e){}
  ctx.restore();
}
