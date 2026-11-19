"use strict";
/* =====================================================================
   VIDA EN LA SALA DE LA CLASIFICATORIA (fondo assets/fondos/clasificatoria.webp, js/ranked.js)
   Un lienzo encima de la imagen (y debajo de los Pokémon y los paneles) que anima:
   - las pantallas de las consolas: gráficas que avanzan, barras que suben y bajan, líneas de texto y una raya de escaneo;
   - la pantalla colgada de arriba: un anillo que gira y barras;
   - las luces del techo (laten y alguna falla), los flashes de cámara del público,
   - el brillo de los 6 huecos de la consola, el botón central que gira y una luz que recorre el borde de la consola.
   Posiciones medidas sobre la imagen a 1600x760. RKV.on = false lo apaga.
   ===================================================================== */
const RKV = {on: true, k: 1, pantallas: true};       // pantallas: false = no se dibuja nada en las pantallas
const RKV_IW = 1600, RKV_IH = 1600 * 1519 / 3200;
const RKV_SCR = [                                                              // pantallas: 4 esquinas (arriba izq., arriba der., abajo der., abajo izq.), medidas al píxel sobre la imagen con las pantallas apagadas
  {q: [[4, 278], [97, 278], [125, 340], [34, 341]], k: 'graf', c: '#5dff9a'},
  {q: [[129, 281], [237, 280], [263, 333], [156, 333]], k: 'barras', c: '#7fd8ff'},
  {q: [[242, 279], [303, 279], [318, 333], [262, 333]], k: 'texto', c: '#7fd8ff'},
  {q: [[318, 279], [418, 276], [440, 332], [338, 332]], k: 'graf', c: '#ffd36a'},
  {q: [[422, 277], [492, 278], [518, 330], [444, 331]], k: 'texto', c: '#9ef0ff'},
  {q: [[1124, 276], [1219, 277], [1211, 326], [1100, 327]], k: 'barras', c: '#5dff9a'},
  {q: [[1221, 277], [1302, 277], [1284, 326], [1213, 326]], k: 'graf', c: '#9ef0ff'},
  {q: [[1340, 277], [1480, 277], [1450, 338], [1306, 334]], k: 'campo', c: '#7fe7ff'},
  {q: [[1522, 277], [1600, 276], [1600, 342], [1490, 341]], k: 'texto', c: '#7fd8ff'},
  {q: [[1128, 149], [1235, 140], [1240, 188], [1138, 197]], k: 'anillo', c: '#8fd4ff'}
];
const RKV_LUZ = [[125, 120], [505, 97], [380, 150], [637, 172], [808, 177], [980, 172], [1108, 97], [1265, 147], [1485, 120]];
const RKV_GENTE = [[0, 180, 330, 265], [380, 165, 1220, 235], [1290, 180, 1600, 265]];      // zonas del público (flashes de cámara)
const rvH = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function rkvCanvas(){
  const root = $('rkRoot'); if(!root) return null;
  let c = $('rkVida');
  if(!c){ c = document.createElement('canvas'); c.id = 'rkVida'; c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:-1'; root.style.isolation = 'isolate';      // z-index -1 + isolate: encima del fondo de la sala, debajo de todo lo demás
    const bg = root.querySelector('.rk-bg'); if(bg && bg.nextSibling) root.insertBefore(c, bg.nextSibling); else root.prepend(c); }
  return c;
}
function rkvQuad(x, q, S){ x.beginPath(); q.forEach(([a, b], i) => { const X = S.ox + a * S.k, Y = S.oy + b * S.k; i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.closePath(); }
function rkvScreen(x, P, i, t, S){
  const q = P.q, [p0, p1, p2, p3] = q, m = 3;                                    // m = margen dentro del cristal (en píxeles de la imagen a 1600)
  const x0 = Math.max(p0[0], p3[0]) + m, x1 = Math.min(p1[0], p2[0]) - m, y0 = Math.max(p0[1], p1[1]) + m, y1 = Math.min(p2[1], p3[1]) - m;      // el rectángulo recto que cabe dentro de la pantalla inclinada
  const L = S.ox + x0 * S.k, T = S.oy + y0 * S.k, w = (x1 - x0) * S.k, h = (y1 - y0) * S.k;
  x.save(); rkvQuad(x, q, S); x.clip();                                          // nada se sale del cristal
  x.globalAlpha = .07; x.fillStyle = P.c; rkvQuad(x, q, S); x.fill(); x.globalAlpha = 1;      // la pantalla encendida: un brillo muy suave de su color
  x.globalCompositeOperation = 'lighter'; x.shadowColor = P.c; x.shadowBlur = 4 * S.k; x.strokeStyle = P.c; x.fillStyle = P.c; x.lineWidth = Math.max(1, S.k * 1.2);
  if(P.k === 'graf'){                                                          // gráfica que avanza hacia la izquierda
    x.globalAlpha = .7; x.beginPath();
    for(let j = 0; j <= 40; j++){ const u = j / 40, v = t * 1.2 + u * 5 + i, yy = .55 + .22 * Math.sin(v * 2.1) + .12 * Math.sin(v * 5.3 + i) ; const px = L + u * w, py = T + h * Math.min(.92, Math.max(.12, yy)); j ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.stroke(); x.globalAlpha = .1; x.lineTo(L + w, T + h); x.lineTo(L, T + h); x.fill();
  } else if(P.k === 'barras'){                                                 // barras que suben y bajan
    const n = 9; for(let j = 0; j < n; j++){ const v = .25 + .65 * Math.abs(Math.sin(t * (1.3 + rvH(j + i) * 1.5) + j * 1.7)); x.globalAlpha = .45; x.fillRect(L + (j + .2) * w / n, T + h * (1 - v * .85), w / n * .6, h * v * .85); }
  } else if(P.k === 'texto'){                                                  // líneas de texto que se van escribiendo
    const n = 5, step = Math.floor(t * 3); for(let j = 0; j < n; j++){ const len = .3 + .6 * rvH(j * 7 + Math.floor((t * 3 + j) / n) * 13 + i); x.globalAlpha = j === step % n ? .75 : .38; x.fillRect(L + w * .08, T + h * (.14 + j * .16), w * .84 * len, Math.max(1, h * .06)); }
  } else if(P.k === 'campo'){                                                  // mini estadio con un punto que se mueve (el radar del campo)
    x.globalAlpha = .7; x.strokeRect(L + w * .2, T + h * .18, w * .6, h * .64); x.beginPath(); x.moveTo(L + w * .5, T + h * .18); x.lineTo(L + w * .5, T + h * .82); x.stroke();
    for(let j = 0; j < 2; j++){ const px = L + w * (.5 + .25 * Math.sin(t * (1.1 + j * .4) + j * 2)), py = T + h * (.5 + .22 * Math.cos(t * (1.6 + j * .3) + j)); x.globalAlpha = 1; x.fillStyle = j ? '#ff6a6a' : '#6ad0ff'; x.beginPath(); x.arc(px, py, Math.max(1.5, S.k * 2.5), 0, 6.283); x.fill(); }
  } else if(P.k === 'anillo'){                                                 // anillo que gira + barras
    const cx = L + w * .18, cy = T + h * .55, r = h * .32; x.globalAlpha = .7; x.beginPath(); x.arc(cx, cy, r, t * 2.4, t * 2.4 + 4.4); x.stroke();
    for(let j = 0; j < 3; j++){ x.globalAlpha = .45; x.fillRect(L + w * .38, T + h * (.25 + j * .22), w * (.25 + .3 * Math.abs(Math.sin(t * 1.4 + j))), Math.max(1, h * .1)); }
  }
  const sy = T + ((t * .35 + i * .13) % 1) * h; x.globalAlpha = .12; x.fillStyle = '#ffffff'; x.fillRect(L, sy, w, Math.max(1, h * .04));      // raya de escaneo
  x.restore();
}
function rkvGlow(x, X, Y, r, col, a){ const g2 = x.createRadialGradient(X, Y, 0, X, Y, r); g2.addColorStop(0, col.replace('A', a.toFixed(3))); g2.addColorStop(1, col.replace('A', '0')); x.fillStyle = g2; x.fillRect(X - r, Y - r, r * 2, r * 2); }
function rkvFrame(){
  if(!RKV.on || typeof $ !== 'function' || !$('rankv') || $('rankv').classList.contains('hide')) return;
  const root = $('rkRoot'), c = rkvCanvas(); if(!root || !c) return;
  const W = root.offsetWidth, H = root.offsetHeight, B = RK_BG; if(!W || !H) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if(c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)){ c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
  const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
  const s = Math.max(W / B.w, H / B.h), S = {ox: (W - B.w * s) / 2, oy: (H - B.h * s) / 2, k: B.w * s / RKV_IW}, t = performance.now() / 1000;
  if(RKV.pantallas) RKV_SCR.forEach((P, i) => rkvScreen(x, P, i, t, S));
  x.save(); x.globalCompositeOperation = 'lighter';
  RKV_LUZ.forEach(([a, b], i) => { const fail = rvH(Math.floor(t * 6) + i * 31) < .03; rkvGlow(x, S.ox + a * S.k, S.oy + b * S.k, 26 * S.k, 'rgba(190,225,255,A)', fail ? .05 : (.32 + .12 * Math.sin(t * 1.7 + i)) * RKV.k); });
  for(let j = 0; j < 7; j++){                                                   // flashes de cámara en el público
    const per = 1.8 + rvH(j) * 2.5, ph = (t + rvH(j + 9) * per) % per; if(ph > .14) continue;
    const c2 = Math.floor((t + rvH(j + 9) * per) / per), Z = RKV_GENTE[(j + c2) % RKV_GENTE.length], fx = Z[0] + rvH(j * 5 + c2) * (Z[2] - Z[0]), fy = Z[1] + rvH(j * 11 + c2) * (Z[3] - Z[1]);
    rkvGlow(x, S.ox + fx * S.k, S.oy + fy * S.k, 14 * S.k, 'rgba(255,255,255,A)', (1 - ph / .14) * .9);
  }
  const P6 = B.ped || [];                                                       // brillo de los huecos de la consola
  P6.forEach(([fx, fy], i) => { const X = S.ox + fx * B.w * s, Y = S.oy + fy * B.h * s, r = B.pedW * B.w * s * .55, a = .18 + .14 * Math.sin(t * 2.2 - i * .7);
    x.save(); x.translate(X, Y); x.scale(1, .32); rkvGlow(x, 0, 0, r * 1.25, 'rgba(90,180,255,A)', a); x.restore(); });
  if(B.ring){ const X = S.ox + B.ring[0] * B.w * s, Y = S.oy + B.ring[1] * B.h * s, r = .026 * B.w * s;            // botón central: arco que gira
    x.save(); x.translate(X, Y); x.scale(1, .45); x.strokeStyle = 'rgba(140,220,255,.8)'; x.lineWidth = Math.max(1.5, 3 * S.k); x.beginPath(); x.arc(0, 0, r, t * 2, t * 2 + 1.8); x.stroke(); x.beginPath(); x.arc(0, 0, r, t * 2 + 3.14, t * 2 + 4.94); x.stroke(); x.restore(); }
  { const y = S.oy + 535 * S.k, a = S.ox + 485 * S.k, b = S.ox + 1135 * S.k, u = (t * .25) % 1, X = a + (b - a) * u;      // luz que recorre el borde de la consola
    x.save(); x.translate(X, y); x.scale(3, .35); rkvGlow(x, 0, 0, 40 * S.k, 'rgba(120,200,255,A)', .5); x.restore(); }
  x.restore();
}
(function rkvLoop(){ try{ rkvFrame(); }catch(e){} requestAnimationFrame(rkvLoop); })();
