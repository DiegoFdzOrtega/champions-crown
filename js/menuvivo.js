"use strict";
/* =====================================================================
   MENÚ PRINCIPAL CON VIDA: la plaza del castillo (imágenes de Gemini en assets/menu/) detrás de los paneles del menú (js/mainmenu.js).
   Capas, de atrás a delante:
     cielo (cielo.webp) → estrellas que titilan → nubes que pasan (nube1..6.webp) → pájaros →
     el resto del paisaje (frente.webp: todo menos el cielo, así las nubes pasan POR DETRÁS del castillo y las montañas) →
     el rayo del castillo, el sol, las farolas y ventanas, la fuente, las cascadas, luciérnagas y pétalos →
     el globo (globo.webp) que flota → el chico y Eevee (chico.webp, eevee.webp) que respiran; Eevee de vez en cuando da un saltito.
   Todas las posiciones están medidas sobre la imagen grande (1672 x 941). MENV.on = false lo apaga y se ve el fondo de antes.
   ===================================================================== */
const MENV = {
  on: true,
  fps: 30,                                                                         // [AJUSTE] fotogramas por segundo de la escena (30 va sobrado y gasta la mitad)
  luz: 1,                                                                          // [AJUSTE] fuerza de las luces (farolas, ventanas, rayo)
  W: 1672, H: 941,
  foco: 1000,                                                                      // punto de la imagen (x) que se pone en el centro de la zona libre, a la derecha de los paneles
  img: {}
};
['cielo', 'frente', 'globo', 'chico', 'eevee', 'nube1', 'nube2', 'nube3', 'nube4', 'nube5', 'nube6'].forEach(k => {
  const i = new Image(), o = MENV.img[k] = {i, ok: false}; i.onload = () => { o.ok = true; }; i.src = 'assets/menu/' + k + '.webp?v=1';
});
// nubes: [cuál, y, tamaño, velocidad (px/s), salida]
const MENV_NUBES = [[1, 70, .95, 7, 0], [3, 175, .8, 10, .35], [5, 120, .75, 13, .62], [2, 35, .9, 6, .8], [4, 215, .7, 9, .15], [6, 150, .7, 12, .5]];
const MENV_FAROLAS = [[768, 462, 80], [1365, 460, 80]];                                                      // las dos farolas grandes
const MENV_LUCES = [[128, 522], [245, 520], [332, 585], [412, 580], [465, 573], [945, 475], [1195, 478], [970, 370], [1110, 370], [1138, 620], [718, 658]];   // farolillos pequeños
const MENV_VENTANAS = [[160, 580, 40], [242, 578, 40], [568, 560, 40], [1442, 545, 34], [1600, 525, 34], [1610, 380, 26], [1040, 330, 60], [905, 290, 30], [1180, 290, 30], [1040, 243, 40]];
const MENV_AZUL = [[945, 552], [1195, 552], [1250, 612]];                                                    // cristales azules de la plaza
// Cascadas: el agua animada de Gemini (cascada.webp, 6 figuras) recortada con la forma del agua de cada cascada (cascada_m0..2.webp), así los árboles de delante la tapan
// [x, y, ancho, alto de la máscara, x0, y0, x1, y1 del agua]
const MENV_CASCADAS = [[662, 320, 70, 100, 668, 329, 726, 417], [1414, 270, 58, 105, 1418, 275, 1466, 372], [1558, 255, 64, 92, 1563, 257, 1614, 343]];
const MENV_CAS = {fps: 6, alpha: .9, k: 3, c: []};                                 // k: calidad del recorte (veces el tamaño)
['cascada', 'cascada_m0', 'cascada_m1', 'cascada_m2'].forEach(k => { const i = new Image(), o = MENV.img[k] = {i, ok: false}; i.onload = () => { o.ok = true; }; i.src = 'assets/menu/' + k + '.webp?v=1'; });
const MENV_FUENTES = [[1065, 495, 34, 1], [947, 452, 14, .5], [1167, 455, 14, .5]];                          // x, y (arriba del chorro), anchura, tamaño
const menvH = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function menvCanvas(){                                                          // un lienzo fijo detrás de TODAS las pantallas del menú (encima del lienzo del juego, que entonces no dibuja nada)
  let c = $('menvC');
  if(!c){ c = document.createElement('canvas'); c.id = 'menvC'; const cv = $('c'); if(cv && cv.parentNode) cv.parentNode.insertBefore(c, cv.nextSibling); else document.body.prepend(c); }
  const m = $('main'); if(m) m.classList.add('mvivo');
  return c;
}
const menvShow = () => typeof g !== 'undefined' && !g && !['dexv', 'teamv', 'torrev'].some(v => $(v) && !$(v).classList.contains('hide'));   // fuera de combate y sin pantallas que tapan todo
// Encaje de la imagen en la pantalla: cubre todo y pone el castillo y el chico en la zona libre de la derecha (en pantallas estrechas, en el centro)
function menvFit(W, H){
  const s = Math.max(W / MENV.W, H / MENV.H), libre = W >= 1100 && !$('main').classList.contains('hide') ? Math.min(W, 640) : 0, tx = (libre + W) / 2;      // lo justo para cubrir la pantalla, sin ampliar de más
  let ox = tx - MENV.foco * s; ox = Math.max(W - MENV.W * s, Math.min(0, ox));                                   // si sobra imagen a los lados, el castillo va a la zona libre
  let oy = H - 900 * s; oy = Math.max(H - MENV.H * s, Math.min(0, oy));
  return {s, ox, oy};
}
function menvGlow(x, F, X, Y, r, col, a){
  if(a <= 0) return; const P = [F.ox + X * F.s, F.oy + Y * F.s], R = r * F.s, g2 = x.createRadialGradient(P[0], P[1], 0, P[0], P[1], R);
  g2.addColorStop(0, col.replace('A', Math.min(1, a).toFixed(3))); g2.addColorStop(1, col.replace('A', '0'));
  x.fillStyle = g2; x.fillRect(P[0] - R, P[1] - R, R * 2, R * 2);
}
function menvImg(x, F, o, X, Y, w, h){ if(o && o.ok) x.drawImage(o.i, F.ox + X * F.s, F.oy + Y * F.s, w * F.s, h * F.s); }

function menvFrame(t){
  const c = menvCanvas(); if(!c) return;
  const W = c.clientWidth, H = c.clientHeight; if(!W || !H) return;
  const dpr = Math.min(1.5, window.devicePixelRatio || 1);
  if(c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)){ c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
  const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  const F = menvFit(W, H), I = MENV.img, L = MENV.luz;
  // 1. cielo
  if(I.cielo.ok) menvImg(x, F, I.cielo, 0, 0, MENV.W, MENV.H); else { x.fillStyle = '#2a2470'; x.fillRect(0, 0, W, H); }
  // 2. estrellas arriba del todo
  x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = '#ffffff';
  for(let i = 0; i < 40; i++){ const a = .2 + .8 * Math.max(0, Math.sin(t * (.6 + menvH(i) * 1.4) + i * 3)); x.globalAlpha = a * .8 * (1 - menvH(i + 40) * .5);
    const X = F.ox + menvH(i + 7) * MENV.W * F.s, Y = F.oy + menvH(i + 19) * 120 * F.s, z = menvH(i + 3) > .85 ? 2 : 1; x.fillRect(X, Y, z * F.s * 2, z * F.s * 2); }
  x.restore();
  // 3. nubes (pasan por detrás de todo lo demás)
  MENV_NUBES.forEach(([k, y, sc, v, ph]) => { const o = I['nube' + k]; if(!o.ok) return; const w = o.i.width * sc, h = o.i.height * sc, span = MENV.W + w + 200;
    const X = MENV.W + 100 - ((t * v + ph * span) % span); x.globalAlpha = .95; menvImg(x, F, o, X, y, w, h); x.globalAlpha = 1; });
  // 4. pájaros: una bandada cruza de vez en cuando
  { const per = 26, u = (t % per) / 14; if(u < 1){ x.save(); x.strokeStyle = '#2a1840'; x.lineWidth = Math.max(1, 2 * F.s);
      for(let j = 0; j < 5; j++){ const X = -60 + u * (MENV.W + 120) - j * 26 - (j % 2) * 8, Y = 150 + j * 9 + Math.sin(t * 2 + j) * 4, al = Math.sin(t * 9 + j * 1.7) * 4;
        const px = F.ox + X * F.s, py = F.oy + Y * F.s, w = 9 * F.s; x.beginPath(); x.moveTo(px - w, py - al * F.s); x.lineTo(px, py); x.lineTo(px + w, py - al * F.s); x.stroke(); }
      x.restore(); } }
  // 5. el paisaje (todo menos el cielo)
  menvImg(x, F, I.frente, 0, 0, MENV.W, MENV.H);
  // 6. luces
  x.save(); x.globalCompositeOperation = 'lighter';
  menvGlow(x, F, 1455, 212, 90, 'rgba(255,200,120,A)', (.25 + .06 * Math.sin(t * .8)) * L);                 // el sol
  { const a = (.45 + .2 * Math.sin(t * 2.2) + .1 * Math.sin(t * 7.3)) * L;                                  // el rayo del castillo
    const X = F.ox + 1042 * F.s, Y0 = F.oy + 0, Y1 = F.oy + 200 * F.s, g2 = x.createLinearGradient(0, Y0, 0, Y1);
    g2.addColorStop(0, 'rgba(160,220,255,0)'); g2.addColorStop(.6, `rgba(170,225,255,${(a * .6).toFixed(3)})`); g2.addColorStop(1, `rgba(220,245,255,${a.toFixed(3)})`);
    x.fillStyle = g2; x.fillRect(X - 7 * F.s, Y0, 14 * F.s, Y1 - Y0); menvGlow(x, F, 1042, 185, 45, 'rgba(170,225,255,A)', a * .8); }
  MENV_VENTANAS.forEach(([X, Y, r], i) => menvGlow(x, F, X, Y, r, 'rgba(255,190,90,A)', (.16 + .08 * Math.sin(t * (.7 + menvH(i) * .8) + i * 2)) * L));
  MENV_FAROLAS.forEach(([X, Y, r], i) => { const fl = menvH(Math.floor(t * 9) + i * 13) < .05 ? .55 : 1; menvGlow(x, F, X, Y, r, 'rgba(255,200,110,A)', (.42 + .06 * Math.sin(t * 5 + i)) * fl * L); });
  MENV_LUCES.forEach(([X, Y], i) => menvGlow(x, F, X, Y, 26, 'rgba(255,190,90,A)', (.35 + .12 * Math.sin(t * (3 + menvH(i) * 3) + i)) * L));
  MENV_AZUL.forEach(([X, Y], i) => menvGlow(x, F, X, Y, 22, 'rgba(120,190,255,A)', (.3 + .2 * Math.sin(t * 1.6 + i * 2)) * L));
  menvGlow(x, F, 1040, 243, 30, 'rgba(255,255,255,A)', (.12 + .1 * Math.sin(t * 1.3)) * L);                    // la Poké Ball del castillo
  x.restore();
  // 7. agua: cascadas y fuentes
  { const Sp = I.cascada, fr = Math.floor(t * MENV_CAS.fps) % 6, K = MENV_CAS.k;
    MENV_CASCADAS.forEach(([X, Y, w, h, a, b, c2, d], j) => {
      const M = I['cascada_m' + j]; if(!Sp.ok || !M.ok) return;
      let o = MENV_CAS.c[j]; if(!o){ o = MENV_CAS.c[j] = document.createElement('canvas'); o.width = w * K; o.height = h * K; }
      const q = o.getContext('2d'), fw = Sp.i.width / 6, fh = Sp.i.height;
      q.globalCompositeOperation = 'source-over'; q.clearRect(0, 0, o.width, o.height);
      q.drawImage(Sp.i, fr * fw, 0, fw, fh, (a - X - 3) * K, (b - Y - 6) * K, (c2 - a + 6) * K, (d - b + 14) * K);      // el agua estirada sobre la cascada
      q.globalCompositeOperation = 'destination-in'; q.drawImage(M.i, 0, 0, o.width, o.height);                        // solo donde hay agua en el dibujo
      x.globalAlpha = MENV_CAS.alpha; x.drawImage(o, F.ox + X * F.s, F.oy + Y * F.s, w * F.s, h * F.s); x.globalAlpha = 1;
      x.save(); x.globalCompositeOperation = 'lighter'; menvGlow(x, F, (a + c2) / 2, d - 6, (c2 - a) * .7, 'rgba(230,245,255,A)', .12 + .06 * Math.sin(t * 3 + j)); x.restore();
    }); }
  MENV_FUENTES.forEach(([X, Y, w, k], j) => { x.save(); x.fillStyle = '#e8f6ff';                              // gotas que suben y caen
    for(let i = 0; i < 14 * k + 4; i++){ const per = 1.1, u = ((t + menvH(i + j * 50) * per) % per) / per, dx = (menvH(i * 3 + j) - .5) * w, py = Y + 30 * k - Math.sin(u * Math.PI) * 32 * k;
      x.globalAlpha = .75 * (1 - u * .5); x.fillRect(F.ox + (X + dx * u * 1.6) * F.s, F.oy + py * F.s, Math.max(1, 2.5 * F.s), Math.max(1, 2.5 * F.s)); }
    x.restore(); });
  // 8. luciérnagas y pétalos
  x.save(); x.globalCompositeOperation = 'lighter';
  for(let i = 0; i < 22; i++){ const X = 80 + menvH(i + 100) * 1500 + Math.sin(t * .5 + i) * 30, Y = 430 + menvH(i + 140) * 380 + Math.sin(t * .9 + i * 2) * 14;
    menvGlow(x, F, X, Y, 9, 'rgba(255,230,120,A)', .7 * Math.max(0, Math.sin(t * 1.5 + i * 1.9))); }
  x.restore();
  x.save(); const PET = ['#ff9ccf', '#ffd1e8', '#fff2a8'];
  for(let i = 0; i < 16; i++){ const per = 9 + menvH(i) * 6, u = ((t + menvH(i + 60) * per) % per) / per, X = menvH(i + 70) * 700 + u * 260 + Math.sin(t * 1.4 + i) * 20, Y = 120 + u * 800;
    x.globalAlpha = .85 * Math.min(1, (1 - u) * 4); x.fillStyle = PET[i % 3]; x.fillRect(F.ox + X * F.s, F.oy + Y * F.s, 5 * F.s, 4 * F.s); }
  x.restore();
  // 9. el globo
  if(I.globo.ok){ const h = 115, w = h * I.globo.i.width / I.globo.i.height, X = 1290 + Math.sin(t / 9) * 70, Y = 95 + Math.sin(t * .8) * 8;
    x.save(); x.translate(F.ox + (X + w / 2) * F.s, F.oy + (Y + h) * F.s); x.rotate(Math.sin(t * .8 + 1) * .03); x.drawImage(I.globo.i, -w / 2 * F.s, -h * F.s, w * F.s, h * F.s); x.restore();
    x.save(); x.globalCompositeOperation = 'lighter'; menvGlow(x, F, X + w * .5, Y + h * .53, 16, 'rgba(255,170,60,A)', .5 + .35 * Math.abs(Math.sin(t * 6))); x.restore(); }
  // 10. el chico y Eevee
  const sombra = (X, Y, r) => { x.save(); x.fillStyle = 'rgba(20,10,40,.35)'; x.beginPath(); x.ellipse(F.ox + X * F.s, F.oy + Y * F.s, r * F.s, r * .28 * F.s, 0, 0, 6.283); x.fill(); x.restore(); };
  if(I.chico.ok){ const h = 195, w = h * I.chico.i.width / I.chico.i.height, X = 905, Y = 760, b = 1 + .012 * Math.sin(t * 2.2);
    sombra(X, Y, 42); x.save(); x.translate(F.ox + X * F.s, F.oy + Y * F.s); x.scale(1, b); x.drawImage(I.chico.i, -w / 2 * F.s, -h * F.s, w * F.s, h * F.s); x.restore(); }
  if(I.eevee.ok){ const h = 92, w = h * I.eevee.i.width / I.eevee.i.height, X = 985, Y = 758, per = 7, u = t % per, hop = u < .45 ? Math.sin(u / .45 * Math.PI) * 14 : 0, b = 1 + .025 * Math.sin(t * 3.1);
    sombra(X, Y, 30 - hop * .6); x.save(); x.translate(F.ox + X * F.s, F.oy + (Y - hop) * F.s); x.scale(1 + (b - 1) * -.5, b); x.drawImage(I.eevee.i, -w / 2 * F.s, -h * F.s, w * F.s, h * F.s); x.restore(); }
}
let menvLast = 0;
(function menvLoop(now){
  requestAnimationFrame(menvLoop);
  if(typeof $ !== 'function') return;
  const c = $('menvC');
  if(!MENV.on || !$('main') || !menvShow()){ if(c) c.style.display = 'none'; if(!MENV.on && $('main')) $('main').classList.remove('mvivo'); return; }
  if(now - menvLast < 1000 / MENV.fps - 2) return; menvLast = now;
  try{ menvFrame(now / 1000); }catch(e){}
  if(c) c.style.display = 'block';
})(0);
// con la escena puesta, el fondo antiguo (js/background.js) no se dibuja
if(typeof menuBg === 'function'){ const _menuBg = menuBg; menuBg = function(){ if(MENV.on) return; return _menuBg.apply(this, arguments); }; }
