"use strict";
/* =====================================================================
   ATAQUES NUEVOS (16-11-2026): Burbuja, Rayo Burbuja y Drenadoras. Dibujados por código.
   - Burbuja y Rayo Burbuja (Agua, clic derecho): una ristra de burbujas azules brillantes que serpentea detrás del disparo; al dar, estalla en espuma.
   - Drenadoras (Planta, Q, ataque de estado): tres semillas con estela; al dar brotan lianas alrededor del rival y queda «drenado»
     (js/status.js: pierde vida poco a poco y se la da a quien se las lanzó). Mientras dura: anillo de lianas a sus pies y gotas verdes que viajan hacia el otro Pokémon.
   Tablas de efectos de js/fx.js: FXR.flight = el proyectil · FXR.trail = su estela · FXR.impact = el impacto · FXC = duración del impacto.
   ===================================================================== */
// Burbuja azul brillante: cuerpo azul, borde oscuro, media luna clara arriba a la izquierda y un punto blanco
function nvBubble(x, y, r, A){
  if(r < 1 || A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fillStyle = '#2f6fe6'; ctx.fill(); ctx.lineWidth = Math.max(1.4, r * .3); ctx.strokeStyle = '#0b2a8a'; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r * .62, Math.PI * .95, Math.PI * 1.75); ctx.lineWidth = Math.max(1.2, r * .32); ctx.strokeStyle = '#8fc4ff'; ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x - r * .5), Math.round(y - r * .55), Math.max(1.5, r * .3), Math.max(1.5, r * .3));
  ctx.restore();
}
// Ristra de burbujas detrás del disparo. n = cuántas · gap = separación · r0 = radio de la primera · wob = cuánto serpentea
function nvBubbleStream(s, a, an, n, gap, r0, wob){
  const t = g.t, ca = Math.cos(an), sa = Math.sin(an), far = a * Math.hypot(s.vx || 0, s.vy || 0);
  for(let i = n - 1; i >= 0; i--){
    const back = i * gap; if(back > far + 4) continue;
    const side = Math.sin(t * 9 - i * .85) * wob * (.35 + i / n), r = (r0 - i * (r0 * .45 / n)) * (1 + .08 * Math.sin(t * 14 + i * 2));
    nvBubble(s.x - ca * back - sa * side, s.y - sa * back + ca * side, r, i > n - 3 ? .7 : 1);
  }
  for(let i = 0; i < 3; i++){                                          // anillitos de espuma que se quedan atrás
    const u = (t * 1.8 + i * .33) % 1, back = n * gap * (.4 + u * .7); if(back > far) continue;
    ctx.save(); ctx.globalAlpha = (1 - u) * .7; ctx.strokeStyle = '#bfe2ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(s.x - ca * back - sa * (HH(i, 3) - .5) * 26, s.y - sa * back + ca * (HH(i, 3) - .5) * 26, 2 + u * 5, 0, 6.283); ctx.stroke(); ctx.restore();
  }
}
function nvBubbleHit(e, a, big){                                       // estalla: espuma blanca, anillos de «pop» y burbujitas que suben
  const k = (e.k || 1) * (big ? 1.2 : 1), x = e.x, y = e.y;
  ctx.save();
  for(let i = 0; i < 10; i++){ const u = a / .32; if(u >= 1) break; const an = i * .628 + HH(i, 2), d = (6 + 26 * u) * k; ctx.globalAlpha = 1 - u; ctx.fillStyle = i % 3 ? '#ffffff' : '#bfe2ff'; const z = (5 - 3 * u) * k; ctx.fillRect(x + Math.cos(an) * d - z / 2, y + Math.sin(an) * d * .8 - z / 2, z, z); }
  for(let i = 0; i < 3; i++){ const u = (a - i * .09) / .4; if(u <= 0 || u >= 1) continue; ctx.globalAlpha = 1 - u; ctx.strokeStyle = i % 2 ? '#ffffff' : '#8fc4ff'; ctx.lineWidth = 2.5 * (1 - u) + 1; ctx.beginPath(); ctx.arc(x + (HH(i, 5) - .5) * 30 * k, y + (HH(i, 7) - .5) * 22 * k, (5 + 15 * u) * k, 0, 6.283); ctx.stroke(); }
  for(let i = 0; i < 7; i++){ const u = (a - HH(i, 9) * .15) / .55; if(u <= 0 || u >= 1) continue; nvBubble(x + (HH(i, 11) - .5) * 46 * k, y + 6 - u * 34 * k + (HH(i, 13) - .5) * 14, (2 + HH(i, 15) * 3.5) * k * (1 - u * .4), 1 - u); }
  ctx.restore();
}
FXR.flight['Burbuja']      = (s, a, an) => nvBubbleStream(s, a, an, 5, 15, 7.5, 5);
// Rayo Burbuja: en el combate es una RISTRA de burbujas sueltas (SHOT_KINDS.chorro, js/combat.js). Cada una es una burbuja en pixel art que se bambolea y deja anillitos; al dar hace «pop».
const NV_BUB = ['...oooo...', '.oollbboo.', '.olwwlbbo.', 'olwwlbbbbo', 'ollbbbbbbo', 'obbbbbbbdo', 'obbbbbbddo', '.obbbbddo.', '.oobdddoo.', '...oooo...'];
const NV_BUB_COL = {o:'#0e2f96', l:'#9fd0ff', w:'#ffffff', b:'#3b82f6', d:'#2459cf'};
let nvBubImg = null;
function nvBubSprite(){                                                // la burbuja ya dibujada (una sola vez)
  if(nvBubImg) return nvBubImg;
  const c = document.createElement('canvas'); c.width = c.height = 20; const x = c.getContext('2d');
  NV_BUB.forEach((row, j) => { for(let i = 0; i < 10; i++){ const ch = row[i]; if(ch !== '.'){ x.fillStyle = NV_BUB_COL[ch]; x.fillRect(i * 2, j * 2, 2, 2); } } });
  return nvBubImg = c;
}
FXR.flight['Rayo Burbuja'] = (s, a, an) => {
  const t = g.t, k = s.sd || 0, wob = Math.sin(t * 11 + k * 1.9) * 4 * Math.min(1, a * 5), x = s.x - Math.sin(an) * wob, y = s.y + Math.cos(an) * wob, z = 1 + .12 * Math.sin(t * 13 + k);
  ctx.save(); ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = .3; ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.ellipse(x, y + 20, 7, 3, 0, 0, 6.283); ctx.fill();          // su sombra en el suelo
  ctx.globalAlpha = 1; ctx.drawImage(nvBubSprite(), Math.round(x - 10 * z), Math.round(y - 10 * z), Math.round(20 * z), Math.round(20 * z));
  const u = (t * 2.4 + k * .37) % 1; ctx.globalAlpha = (1 - u) * .8; ctx.strokeStyle = '#cfe8ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x - Math.cos(an) * (10 + u * 16), y - Math.sin(an) * (10 + u * 16) + (HH(k, 3) - .5) * 10, 2 + u * 3, 0, 6.283); ctx.stroke();
  ctx.restore();
};
FXR.trail['Burbuja'] = null; FXR.trail['Rayo Burbuja'] = null;        // sin la estela de puntos de serie: la ristra ya es la estela
FXR.impact['Burbuja']      = (e, a) => nvBubbleHit(e, a, false);
FXR.impact['Rayo Burbuja'] = (e, a) => {                               // «pop»: anillo de puntos que se abre, salpicadura blanca y dos burbujitas
  const x = e.x + (HH(e.x * .37, 1) - .5) * 18, y = e.y + (HH(e.y * .41, 2) - .5) * 14, u = a / .38; if(u >= 1) return;
  ctx.save();
  for(let i = 0; i < 10; i++){ const an = i * .628, d = 5 + 15 * u; ctx.globalAlpha = 1 - u; ctx.fillStyle = i % 2 ? '#ffffff' : '#9fd0ff'; ctx.fillRect(Math.round(x + Math.cos(an) * d) - 1, Math.round(y + Math.sin(an) * d) - 1, 3, 3); }
  for(let i = 0; i < 5; i++){ const an = i * 1.257 + .5, d = 4 + 24 * u; ctx.globalAlpha = (1 - u) * .9; ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x + Math.cos(an) * d) - 1, Math.round(y + Math.sin(an) * d * .8 - 6 * u) - 1, 2, 2); }
  nvBubble(x - 8, y - 4 - u * 14, 3 * (1 - u * .5), 1 - u); nvBubble(x + 9, y + 2 - u * 10, 2.4 * (1 - u * .5), 1 - u);
  ctx.restore();
};
FXC['Burbuja'] = Object.assign(FXC['Burbuja'] || {}, {idur: .6}); FXC['Rayo Burbuja'] = Object.assign(FXC['Rayo Burbuja'] || {}, {idur: .4});

// ---------- Drenadoras ----------
function nvSeed(x, y, r, rot){                                         // semilla marrón con una mota clara
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath(); ctx.ellipse(0, 0, r * 1.25, r * .85, 0, 0, 6.283); ctx.fillStyle = '#8a5a2b'; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = '#3d2410'; ctx.stroke();
  ctx.fillStyle = '#d9a86a'; ctx.fillRect(-r * .6, -r * .45, r * .6, r * .4);
  ctx.restore();
}
// Liana que brota del suelo en (x, y): crece con u (0..1), se riza hacia dir (−1 / 1) y lleva una hoja en la punta
function nvVine(x, y, h, dir, u, sway){
  if(u <= 0) return; const tipx = x + dir * h * .55 * u + sway, tipy = y - h * u, cx = x - dir * h * .25, cy = y - h * .7 * u;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(cx, cy, tipx, tipy);
  ctx.lineCap = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = '#14451c'; ctx.stroke(); ctx.lineWidth = 2.6; ctx.strokeStyle = '#3fae3a'; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(tipx, tipy, 5, 2.6, dir * .6, 0, 6.283); ctx.fillStyle = '#7ed957'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#14451c'; ctx.stroke();
}
FXR.flight['Drenadoras'] = (s, a, an) => {
  const t = g.t; ctx.save();
  for(let i = 0; i < 6; i++){ const u = (t * 2.2 + i / 6) % 1, back = 8 + u * 40; ctx.globalAlpha = 1 - u; ctx.fillStyle = i % 2 ? '#fff7b0' : '#bdf47c'; const z = 3 * (1 - u) + 1; ctx.fillRect(s.x - Math.cos(an) * back + (HH(i, 3) - .5) * 14 - z / 2, s.y - Math.sin(an) * back + (HH(i, 5) - .5) * 14 - z / 2, z, z); }
  ctx.globalAlpha = 1;
  for(let i = 0; i < 3; i++){ const ph = t * 7 + i * 2.094; nvSeed(s.x + Math.cos(ph) * 8, s.y + Math.sin(ph) * 6, 4.2, ph * 1.3); }
  ctx.restore();
};
FXR.trail['Drenadoras'] = {rate: 26, cols: ['#bdf47c', '#fff7b0', '#3fae3a'], life: .4, speed: 10, spread: 5, s: 1};
FXR.impact['Drenadoras'] = (e, a) => {                                 // brotan lianas alrededor del rival, lo envuelven un momento y se recogen
  const k = e.k || 1, grow = a < .3 ? a / .3 : a < .8 ? 1 : Math.max(0, 1 - (a - .8) / .3), x = e.x, y = e.y + 26;
  ctx.save(); ctx.globalAlpha = Math.min(1, grow * 1.5);
  for(let i = 0; i < 7; i++){ const an = i * .898 + .3, r = 30 * k, dir = Math.cos(an) > 0 ? -1 : 1; nvVine(x + Math.cos(an) * r, y + Math.sin(an) * r * .45, (30 + HH(i, 3) * 22) * k, dir, grow, Math.sin(a * 9 + i) * 2); }
  if(a < .35) for(let i = 0; i < 8; i++){ const u = a / .35, an = i * .785; ctx.globalAlpha = 1 - u; ctx.fillStyle = i % 2 ? '#bdf47c' : '#8a5a2b'; ctx.fillRect(x + Math.cos(an) * 34 * u * k - 2, y - 8 + Math.sin(an) * 18 * u * k - 2, 4, 4); }
  ctx.restore();
};
FXC['Drenadoras'] = Object.assign(FXC['Drenadoras'] || {}, {idur: 1.1});
// Mientras está «drenado» (lo llama fxStatusAura, js/fxstatus.js): anillo de lianas a sus pies y gotas verdes que viajan hacia quien se las lanzó
function nvLeechAura(f, hx, foot, bw){
  const t = g.t, R = bw * 1.25 + 8, src = f.lchBy;
  ctx.save();
  for(let i = 0; i < 12; i++){ const an = i * .5236 + t * .5, x = hx + Math.cos(an) * R, y = foot + Math.sin(an) * R * .4; ctx.lineCap = 'round'; ctx.lineWidth = 3.2; ctx.strokeStyle = i % 3 ? '#2f8a2c' : '#6a4a22'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an + 1.7) * 7, y + Math.sin(an + 1.7) * 3 - 3 - 2 * Math.sin(t * 5 + i)); ctx.stroke(); }
  if(src && !src.dead && !src.ghost && g && (src === g.p[g.pi] || src === g.e[g.ei])){
    for(let i = 0; i < 4; i++){ const u = (t * .9 + i * .25) % 1, x = hx + (src.x - hx) * u, y = (f.y - 10) + (src.y - 10 - (f.y - 10)) * u - Math.sin(u * Math.PI) * 26; ctx.globalAlpha = Math.min(1, u * 5, (1 - u) * 5); ctx.beginPath(); ctx.arc(x, y, 4.2, 0, 6.283); ctx.fillStyle = '#7ed957'; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = '#14451c'; ctx.stroke(); ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 2, y - 2.5, 1.6, 1.6); }
  }
  ctx.restore();
}

// ---------- Cartel de los ataques fuertes y carga del Rayo Solar (como en Poké Arena 2D) ----------
// [AJUSTE] Ataques que anuncian su nombre en grande y oscurecen la pantalla un instante al empezar a cargarse: nombre -> color del texto. Añade aquí los que quieras.
const NV_BANNER = {'Rayo Solar': '#f4ffd6'};
const NV_BANNER_T = 1.05;                                              // segundos que dura el cartel
function nvBigStart(f, nm, type){ if(NV_BANNER[nm] && g) g.banner = {txt: '¡' + nm + '!', c: NV_BANNER[nm], t0: g.t}; }      // lo llama use() (js/combat.js) al empezar el ataque fuerte
function nvBannerDraw(){                                               // lo llama draw() (js/render.js), ya fuera del campo: en coordenadas de pantalla
  const b = g && g.banner; if(!b) return; const a = g.t - b.t0; if(a < 0 || a > NV_BANNER_T){ g.banner = null; return; }
  const A = Math.min(1, a / .1, (NV_BANNER_T - a) / .25), pop = 1 + .25 * Math.max(0, 1 - a / .14);
  ctx.save();
  ctx.globalAlpha = .34 * A; ctx.fillStyle = '#04120a'; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = A; ctx.translate(W / 2, 168); ctx.scale(pop, pop);
  if(typeof textO === 'function') textO(b.txt, 0, 0, 26, b.c, 'center'); else text(b.txt, 0, 0, 26, b.c, 'center');
  ctx.restore();
}
function nvWindFx(f, w){                                               // lo llama windDraw() (js/render.js) mientras se carga un ataque fuerte
  const bm = NV_BEAMS[w.nm], sol = w.nm === 'Rayo Solar' && typeof tpSolarCharge === 'function'; if(!sol && !(bm && bm.big)) return;
  const k = Math.max(.05, Math.min(1, w.hold ? .3 + (w.c || 0) / (FEEL.windMax || 3.5) : 1 - w.t / w.T));
  if(sol) tpSolarCharge(f.x, f.y - 6, k, 1); else nvCharge(f.x, f.y - 6, k, bm.pal, 1);
}

// ---------- RAYOS al estilo del Rayo Solar: Hidrobomba, Hiperrayo, Rayo Hielo, Psicorrayo, Pistola Agua y Rayo ----------
// Todos se dibujan con la misma receta (nvBeam): centro blanco, dos capas de color y un borde oscuro y dentado que tiembla, una bola brillante en la boca y, al acabarse, se afinan.
// [AJUSTE] pal = [borde, color, color claro, casi blanco, blanco] · w = grosor · deco = lo que salta de los bordes ('spark' destellos · 'drop' gotas) · jag = cuánto se dentan los bordes (1 = normal)
//          big = ataque fuerte (E): además lleva cartel con su nombre, bola de carga mientras mantienes la E y va más deprisa (BIG_SPEED, js/combat.js) · banner = color del cartel
// Para que un rayo vuelva a verse como antes, borra su línea de aquí.
const NV_BEAMS = {
  'Hidrobomba':   {pal:['#0b2a8a', '#2f6fe6', '#6fb0ff', '#d6ecff', '#ffffff'], w:36, deco:'drop',  big:true, banner:'#d6ecff'},
  'Hiperrayo':    {pal:['#8a3a00', '#ff8a1f', '#ffd24a', '#fff4c4', '#ffffff'], w:36, deco:'spark', big:true, banner:'#fff0c8'},
  'Rayo Hielo':   {pal:['#1c4a6c', '#5ab4e0', '#a5e3f0', '#e8fbff', '#ffffff'], w:17, deco:'spark'},
  'Psicorrayo':   {pal:['#5a1050', '#d048b0', '#ff8fd8', '#ffd6f2', '#ffffff'], w:17, deco:'spark'},
  'Pistola Agua': {pal:['#0b2a8a', '#2f6fe6', '#6fb0ff', '#d6ecff', '#ffffff'], w:15, deco:'drop'},
  'Rayo':         {pal:['#6a5800', '#f2c81a', '#fff27a', '#fffbd0', '#ffffff'], w:16, deco:'spark', jag:1.7}
};
function nvOrb(x, y, r, pal, A){ if(r < 1) return; ctx.save(); ctx.globalAlpha = A; [[r + 3, pal[0]], [r, pal[1]], [r * .66, pal[3]], [r * .34, pal[4]]].forEach(([rr, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.283); ctx.fill(); }); ctx.restore(); }
function nvSpark(x, y, r, pal, A){ ctx.save(); ctx.globalAlpha = A; ctx.beginPath(); for(let i = 0; i < 8; i++){ const a = i * Math.PI / 4, rr = i % 2 ? r * .3 : r; ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = pal[0]; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore(); }
function nvCharge(x, y, u, pal, A){                                    // bola de carga: crece, con halo, motas que entran y destellos girando
  const t = g.t, ease = 1 - Math.pow(1 - u, 2), R = 8 + 15 * ease; ctx.save(); ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = A * .35; ctx.fillStyle = pal[3]; ctx.beginPath(); ctx.arc(x, y - 4, R + 12 + Math.sin(t * 20) * 2, 0, 6.283); ctx.fill();
  ctx.globalAlpha = A * .8; ctx.strokeStyle = pal[3]; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y - 4, R + 18 - 8 * ((t * 2.2) % 1), 0, 6.283); ctx.stroke();
  for(let i = 0; i < 8; i++){ const th = i * .785 + u * 5, rad = (70 * (1 - ease)) * (.5 + .5 * HH(i, 1)) + R; nvOrb(x + Math.cos(th) * rad, y - 4 + Math.sin(th) * rad * .8, 3.2, pal, A * Math.min(1, u * 4) * (1 - ease * .6)); }
  nvOrb(x, y - 4, R, pal, A);
  for(let i = 0; i < 5; i++){ const an = i * 1.257 + t * 2.4, rr = R + 12 + 5 * Math.sin(t * 7 + i); nvSpark(x + Math.cos(an) * rr, y - 4 + Math.sin(an) * rr * .85, 5 + 2 * Math.sin(t * 11 + i * 2), pal, A * (.6 + .4 * Math.sin(t * 9 + i))); }
  ctx.restore();
}
function nvBeam(e, c){
  const CH = c.big ? .1 : 0, t = e.t || 0, G = sg(e, 2400), A = G.al, pal = c.pal;
  if(t < CH){ nvCharge(e.ox, e.oy, t / CH, pal, 1); return; }
  if(G.len < 8) return;
  const gw = Math.min(1, (t - CH) / .1), w = (c.w + Math.sin(g.t * 18) * c.w * .07) * gw * (.25 + .75 * A), dx = Math.cos(G.an), dy = Math.sin(G.an), px = -dy, py = dx, N = Math.max(8, Math.ceil(G.len / 20)), fr = Math.floor(g.t * 16), jg = (c.jag || 1) * c.w / 34 * gw;
  const half = u => (w / 2) * (u < .06 ? .55 + .45 * u / .06 : 1);
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  const poly = (sc, pad, jag, sd) => { ctx.beginPath();
    for(let i = 0; i <= N; i++){ const u = i / N, h = half(u) * sc + pad + (HH(i * 3 + fr * 7, sd) - .5) * jag; ctx[i ? 'lineTo' : 'moveTo'](G.x0 + dx * G.len * u + px * h, G.y0 + dy * G.len * u + py * h); }
    ctx.arc(G.x1, G.y1, Math.max(1, half(1) * sc + pad), G.an - Math.PI / 2, G.an + Math.PI / 2);
    for(let i = N; i >= 0; i--){ const u = i / N, h = half(u) * sc + pad + (HH(i * 3 + fr * 7, sd + 9) - .5) * jag; ctx.lineTo(G.x0 + dx * G.len * u - px * h, G.y0 + dy * G.len * u - py * h); }
    ctx.closePath(); };
  const pd = c.w / 34;
  ctx.globalAlpha = Math.min(1, A * 1.6);
  [[1, 6 * pd, 13, 1, pal[0]], [1, 3 * pd, 11, 1, pal[1]], [.82, 0, 6, 2, pal[2]], [.58, 0, 3, 3, pal[3]], [.32, 0, 0, 4, pal[4]]].forEach(([sc, pad, jag, sd, col]) => { ctx.fillStyle = col; poly(sc, pad, jag * jg, sd); ctx.fill(); });
  for(let i = 0, n = c.big ? 10 : 6; i < n; i++){                      // lo que salta de los bordes
    const u = (i * .113 + g.t * 1.7) % 1, off = (i % 2 ? 1 : -1) * (w * .5 + 3 + HH(i, 3) * 9 * pd), x = G.x0 + dx * G.len * u + px * off, y = G.y0 + dy * G.len * u + py * off;
    if(c.deco === 'drop'){ if(i % 3) nvBubble(x, y, (2.2 + HH(i, 4) * 2.6) * Math.max(.7, pd), A); else { ctx.globalAlpha = A; ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 2, y - 2, 4, 4); } }
    else if(i % 3) nvSpark(x, y, (3 + HH(i, 4) * 3) * Math.max(.75, pd), pal, A); else { ctx.globalAlpha = A; ctx.fillStyle = pal[i % 2 ? 1 : 2]; ctx.fillRect(x - 2.5, y - 2.5, 5, 5); }
  }
  ctx.globalAlpha = A * .4; ctx.fillStyle = pal[3]; ctx.beginPath(); ctx.arc(G.x0, G.y0, c.w * .88 * gw, 0, 6.283); ctx.fill();       // halo de la boca
  nvOrb(G.x0, G.y0, c.w * .56 * gw * (.5 + .5 * A), pal, Math.min(1, A * 1.6));                                                       // la bola de la boca del rayo
  ctx.restore();
}
Object.entries(NV_BEAMS).forEach(([n, c]) => {                          // con los efectos HD encendidos se usa nvBeam; apagados, el dibujo de siempre
  const old = FXR.stream[n]; if(!old) return; const of = old.draw || old;
  const w = (e, a, ...r) => (typeof fxhd !== 'undefined' && fxhd.on) ? nvBeam(e, c) : of(e, a, ...r);
  Object.assign(w, old); w.draw = undefined; FXR.stream[n] = w;
  if(c.banner) NV_BANNER[n] = c.banner;
});

// ---------- Torbellino (como el «Tifón Hídrico» de Poké Arena 2D): el Pokémon gira sobre sí mismo y lanza cuatro brazos de agua en espiral ----------
// La mecánica (cuánto dura, cada cuánto golpea, hasta dónde llega) está en SPIN, js/combat.js. Lo llama windDraw() (js/render.js) mientras dura el giro (f.spin).
const NV_SPRAY = ['#1848b8', '#2f6fe6', '#2f6fe6', '#6fb0ff', '#6fb0ff', '#dff1ff', '#ffffff'];
function nvSpinDraw(f){
  const s = f.spin, t = s.t, R = s.R, A = Math.min(1, t / .12, (s.T - t) / .18), grow = Math.min(1, t / .16), rot = t * 10.5, fr = Math.floor(g.t * 18);
  if(A <= 0) return;
  ctx.save(); ctx.globalAlpha = .28 * A; ctx.fillStyle = '#0b2a8a'; ctx.beginPath(); ctx.ellipse(f.x, f.y + 22, R * .62 * grow, R * .24 * grow, 0, 0, 6.283); ctx.fill();      // agua en el suelo
  for(let k = 0; k < 4; k++){
    const base = rot + k * 1.5708, N = 16;
    for(let j = 0; j <= N; j++){
      const u = j / N, r = (16 + (R - 16) * u) * grow, an = base - u * 1.25, cx = f.x + Math.cos(an) * r, cy = f.y - 4 + Math.sin(an) * r * .86, wd = 20 - 11 * u;     // el brazo se curva hacia atrás y se afina
      for(let q = 0; q < 9; q++){                                        // cada tramo: unos cuantos cuadraditos de espuma alrededor de la línea
        const h1 = HH(j * 7 + q + k * 31, fr), h2 = HH(j * 5 + q * 3 + k * 17, fr + 4), z = 4 + Math.floor(h1 * 4), edge = Math.abs(h2 - .5) * 2;
        ctx.globalAlpha = A * (u > .85 ? (1 - u) / .15 * .9 + .1 : 1);
        ctx.fillStyle = NV_SPRAY[Math.min(6, Math.floor(edge * 3 + h1 * 2.2 + (u > .75 ? 1 : 0)))];
        ctx.fillRect(Math.round(cx + (h2 - .5) * wd * 2 - z / 2), Math.round(cy + (h1 - .5) * wd * 1.6 - z / 2), z, z);
      }
    }
    const tipA = base - 1.25, tx = f.x + Math.cos(tipA) * R * grow, ty = f.y - 4 + Math.sin(tipA) * R * grow * .86;      // gotas que salen despedidas de la punta
    for(let q = 0; q < 4; q++){ const u = (g.t * 3 + q * .25 + k * .13) % 1; ctx.globalAlpha = A * (1 - u); ctx.fillStyle = q % 2 ? '#ffffff' : '#6fb0ff'; ctx.fillRect(Math.round(tx + Math.cos(tipA - 1.3) * u * 26 + (HH(q, k) - .5) * 10), Math.round(ty + Math.sin(tipA - 1.3) * u * 22 + (HH(q, k + 5) - .5) * 10), 3, 3); }
  }
  ctx.restore();
}

// ---------- Torbellino de la familia de Squirtle: se mete en el caparazón y es el caparazón el que gira ----------
// Solo cambia el dibujo (no la mecánica). Lo llama drawF() (js/render.js) en lugar del sprite mientras dura el giro. Los cuatro agujeros del borde coinciden con los cuatro brazos de agua.
const NV_SHELL = {7: ['#f4e4b0', '#b89858'], 8: ['#f4e4b0', '#b89858'], 9: ['#d0d8f0', '#7080b8']};      // [AJUSTE] quién se mete en el caparazón: nº de Pokédex → color del borde (claro, sombra)
function nvShellDraw(f, lg){
  const s = f.spin, C = NV_SHELL[parseInt(f.m.dex)]; if(!s || !C || s.t < .09 || s.t > s.T - .1) return false;      // al empezar y al acabar se ve el Pokémon normal (entra y sale)
  const I = idleInfo(f.m.dex), pop = Math.min(1, .55 + (s.t - .09) / .1 * .45), rx = Math.max(7, Math.min(14, Math.round(I.fw * .42))) * pop, ry = rx * .8, P = ESCALA, rot = s.t * 10.5;
  const X = Math.round(f.x + lg.x), Y = Math.round(f.y + lg.y + Math.sin(s.t * 30) * 1.5), n = Math.ceil(rx) + 1, cr = Math.cos(-rot), sr = Math.sin(-rot);
  for(let pass = 0; pass < 2; pass++) for(let py = -n; py <= n; py++) for(let px = -n; px <= n; px++){       // pasada 0: el canto de abajo (le da grosor) · pasada 1: el caparazón visto desde arriba
    const u = px / rx, v = py / ry, r = Math.hypot(u, v); if(r > 1) continue;
    let col;
    if(pass === 0) col = r > .86 ? '#181420' : C[1];
    else {
      const a = Math.atan2(v, u) - rot, q = ((a % 1.5708) + 1.5708) % 1.5708, hole = Math.min(q, 1.5708 - q) < .3, u2 = u * cr - v * sr, v2 = u * sr + v * cr;
      if(r > .88) col = '#181420';
      else if(r > .7) col = hole ? (r < .8 ? '#6fb0ff' : '#1c2c70') : (u + v < -.2 ? C[0] : C[1]);                 // borde claro, con los 4 agujeros por los que sale el agua
      else if(r > .62) col = '#4a2408';
      else { const a2 = Math.atan2(v2, u2), k = ((a2 % 1.0472) + 1.0472) % 1.0472, line = Math.abs(r - .3) < .07 || (r > .3 && Math.min(k, 1.0472 - k) * r < .075); col = line ? '#5a2c08' : (u * -.6 + v * -.7 > .22 ? '#c87830' : '#9c5412'); }      // placas marrones: giran con el caparazón; el brillo se queda arriba a la izquierda
    }
    ctx.fillStyle = col; ctx.fillRect(X + px * P, Y + py * P + (pass ? -P : P), P, P);
  }
  ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.globalAlpha = .55;                             // dos rayitas de velocidad alrededor
  for(let k = 0; k < 2; k++){ const a = rot * 1.3 + k * 3.1416; ctx.beginPath(); ctx.ellipse(X, Y, (rx + 3) * P, (ry + 3) * P, 0, a, a + .7); ctx.stroke(); }
  ctx.restore();
  return true;
}

// ---------- CHORRO SOSTENIDO (Lanzallamas): un chorro de fuego que sigue saliendo mientras te mueves y gira contigo ----------
// La mecánica es SHOT_KINDS.llama (js/combat.js): muchas llamas pequeñas seguidas, de poco alcance. Aquí solo se dibuja cada una: nace pequeña y casi blanca, crece, se pone naranja y roja y acaba en humo.
const NV_JET = {'Lanzallamas': ['#fff6b0', '#ffe04a', '#ffb02a', '#ff7a1f', '#d9381a', '#6a3a34']};      // [AJUSTE] colores del chorro, de la boca a la punta. Para dar chorro a otro ataque: añádelo aquí y en SHOT_MOVE (combat.js)
function nvJetFlight(s, a, an, pal){
  const fr = Math.floor(g.t * 20), sd = (s.sd || 0) * 13;
  ctx.save();
  for(let k = 2; k >= 0; k--){                                         // cada llama se pinta 3 veces (ella y dos rastros por detrás): así el chorro queda seguido, sin huecos
    const back = k * .018, u = 1 - (s.life + back) / s.L; if(u < .07 || u > 1) continue;      // los primeros píxeles (dentro del cuerpo) no se pintan
    const x = s.x - s.vx * back, y = s.y - 4 - s.vy * back, R = 6 + 17 * u, al = u > .7 ? Math.max(0, (1 - u) / .3) : 1, ci = u * 4.3, n = 6 + Math.floor(u * 5);
    for(let q = 0; q < n; q++){
      const h1 = HH(sd + q + k * 41, fr), h2 = HH(sd + q * 3 + 7 + k * 17, fr + 2), h3 = HH(sd + q * 5 + k, 3), z = Math.round((5 + h3 * 5) * (.7 + u * .7)), dx = (h1 - .5) * 2 * R, dy = (h2 - .5) * 2 * R * .8 - u * u * 12;      // las llamas del final suben un poco
      ctx.globalAlpha = al * .92; ctx.fillStyle = pal[Math.min(5, Math.max(0, Math.floor(ci + (Math.hypot(dx, dy) / R) * 1.5 - .4 + (h3 - .5))))];
      ctx.fillRect(Math.round((x + dx) / 2) * 2 - (z >> 1), Math.round((y + dy) / 2) * 2 - (z >> 1), z, z);
    }
    if(u < .5){ ctx.globalAlpha = 1; ctx.fillStyle = pal[0]; const z = Math.round(6 + u * 8); ctx.fillRect(Math.round(x / 2) * 2 - (z >> 1), Math.round(y / 2) * 2 - (z >> 1), z, z); }      // núcleo claro cerca de la boca
  }
  ctx.restore();
}
for(const n in NV_JET){
  const oldF = FXR.flight[n], oldI = FXR.impact[n];
  FXR.flight[n] = (s, a, an, type) => { if(s.jet) nvJetFlight(s, a, an, NV_JET[n]); else if(oldF) oldF(s, a, an, type); };
  if(oldI) FXR.impact[n] = (e, a, type) => {                         // el chorro golpea muchas veces seguidas: la explosión del impacto solo se pinta una de cada tantas (si no, tapa todo)
    if(e.nvSkip === undefined){ const T = e.T; e.nvSkip = !!(T && T.nvImpT !== undefined && Math.abs(g.t - T.nvImpT) < .32); if(!e.nvSkip && T) T.nvImpT = g.t; }
    if(!e.nvSkip) oldI(e, a, type);
  };
}

// ---------- SALTO (Golpe Cuerpo, Vuelo): el Pokémon salta fuera de la pantalla, una diana en el suelo marca dónde va a caer y aterriza con un golpe en círculo ----------
// La mecánica está en JUMP (js/combat.js). Aquí: cuánto sube el sprite (nvJumpLift, lo usa drawF), la diana del suelo (nvJumpDraw, lo llama windDraw) y el impacto al caer (FXR.impact._salto).
const NV_JUMP_H = 680;                                               // [AJUSTE] altura del salto en px (tiene que sacarlo de la pantalla)
function nvJumpLift(f){
  const j = f.jump, K = j.K, t = j.t;
  if(K.dig){ const d0 = t - (j.T - K.down); return d0 > 0 ? 54 * Math.sin(Math.min(1, d0 / K.down) * 3.1416) : 0; }      // Excavar: no sube; al salir da un brinco
  if(t < K.up) return NV_JUMP_H * Math.pow(t / K.up, 1.7);
  const d = t - (j.T - K.down); return d < 0 ? NV_JUMP_H : NV_JUMP_H * (1 - Math.pow(Math.min(1, d / K.down), 2));
}
function nvJumpDraw(f){
  const j = f.jump, K = j.K, p = Math.min(1, j.t / j.T), R = j.R, x = f.x, y = f.y + 22, bad = j.mine === (g.me === 'e'), col = bad ? '#ff3b30' : (TC[j.type] || '#ffffff'), pul = .7 + .3 * Math.sin(g.t * 14);
  ctx.save(); ctx.translate(x, y); ctx.scale(1, .8);
  ctx.globalAlpha = .1 + .22 * p; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.283); ctx.fill();                 // la zona donde va a caer: se va llenando
  ctx.globalAlpha = .9; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([14, 9]); ctx.lineDashOffset = -g.t * 40; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
  ctx.globalAlpha = .85 * pul; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, Math.max(2, R * (1 - p)), 0, 6.283); ctx.stroke();      // aro que se cierra: cuando llega al centro, cae
  for(let k = 0; k < 4; k++){ const a = k * 1.5708 + .785; ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * .82, Math.sin(a) * R * .82); ctx.lineTo(Math.cos(a) * R * 1.08, Math.sin(a) * R * 1.08); ctx.stroke(); }
  ctx.globalAlpha = .15 + .4 * p; ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(0, 0, 10 + R * .42 * p, 0, 6.283); ctx.fill();      // la sombra del que cae, cada vez más grande
  ctx.restore();
  if(K.dig){ nvDigDraw(f); return; }                              // Excavar: en vez de rayas de caída, el montículo de tierra que se mueve
  const d = j.t - (j.T - K.down);
  if(d > 0){ const h = nvJumpLift(f); ctx.save(); ctx.fillStyle = '#ffffff'; for(let k = 0; k < 5; k++){ ctx.globalAlpha = .55 - k * .08; ctx.fillRect(Math.round(f.x + (k - 2) * 11), Math.round(f.y - h - 70 - HH(k, 3) * 50), 3, 46 + HH(k, 5) * 30); } ctx.restore(); }      // rayas de velocidad mientras cae
  else if(j.t < K.up){ ctx.save(); ctx.fillStyle = '#e6dcc4'; for(let k = 0; k < 6; k++){ const u = j.t / K.up; ctx.globalAlpha = .8 * (1 - u); ctx.fillRect(Math.round(f.x + (k - 2.5) * 12 * (1 + u)), Math.round(f.y + 20 - u * 14 - HH(k, 7) * 8), 5, 5); } ctx.restore(); }      // polvo al despegar
}
FXR.impact._salto = (e, a, type) => {                                // al caer: onda que se abre, polvo hacia fuera y grietas en el suelo que se van borrando
  const R = e.R || 90, u = Math.min(1, a / e.dur), sd = Math.floor(e.seed || 0), col = TC[type] || '#ffffff';
  ctx.save(); ctx.translate(e.x, e.y); ctx.scale(1, .8);
  ctx.lineCap = 'butt'; ctx.strokeStyle = 'rgba(24,16,10,1)'; ctx.lineWidth = 3; ctx.globalAlpha = .6 * Math.pow(1 - u, .7);
  for(let k = 0; k < 8; k++){ let an = k * .785 + HH(sd, k) * .5, r = 6, px = Math.cos(an) * r, py = Math.sin(an) * r; const L = R * (.55 + .5 * HH(sd + 3, k)) * Math.min(1, a / .08);
    ctx.beginPath(); ctx.moveTo(px, py); for(let s = 0; s < 5 && r < L; s++){ r += L / 5; an += (HH(sd + s, k + 9) - .5) * .7; px = Math.cos(an) * r; py = Math.sin(an) * r; ctx.lineTo(Math.round(px / 2) * 2, Math.round(py / 2) * 2); } ctx.stroke(); }
  if(a < .45){ const q = a / .45; ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6 * (1 - q) + 2; ctx.beginPath(); ctx.arc(0, 0, R * (.35 + 1.05 * q), 0, 6.283); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R * (.2 + .9 * q), 0, 6.283); ctx.stroke(); }
  ctx.restore();
  if(a < .7){ const q = a / .7; for(let k = 0; k < 14; k++){ const an = k * .449 + HH(sd, k + 20), d = R * .45 + q * (60 + 70 * HH(sd, k + 30)), z = Math.round(9 - q * 5);
    ctx.globalAlpha = .9 * (1 - q); ctx.fillStyle = k % 3 ? '#e6dcc4' : '#b9ab8c'; ctx.fillRect(Math.round(e.x + Math.cos(an) * d), Math.round(e.y + Math.sin(an) * d * .8 - Math.sin(q * 3.1416) * 22), z, z); } }
  ctx.globalAlpha = 1;
};

/* =====================================================================
   ATAQUES NUEVOS (16-11-2026, tanda 2): Excavar (montículo), Terremoto (grietas) y Ventisca (ráfaga). Mecánica en js/combat.js: JUMP_MOVE.Excavar, QUAKE, GUST.
   ===================================================================== */
// ---------- EXCAVAR: mientras va bajo tierra se ve un montículo marrón que avanza y echa terrones; al salir, la tierra salta ----------
function nvDigDraw(f){
  const j = f.jump, K = j.K, t = j.t, x = f.x, y = f.y + 22, out = t - (j.T - K.down);
  ctx.save();
  if(t < K.up + .1){ const u = Math.min(1, t / K.up); for(let k = 0; k < 9; k++){ const an = -3.1416 * (.15 + .7 * HH(k, 3)), v = 40 + 70 * HH(k, 5); ctx.globalAlpha = 1 - u; ctx.fillStyle = k % 2 ? '#8a5a2b' : '#5c3a1a'; ctx.fillRect(Math.round(x + Math.cos(an) * v * u), Math.round(y + Math.sin(an) * v * u + 60 * u * u), 6, 6); } }      // se mete: terrones hacia arriba
  if(out < 0){                                                       // bajo tierra: montículo que tiembla
    const wob = Math.sin(g.t * 26) * 2;
    ctx.globalAlpha = 1; ctx.fillStyle = '#3d2610'; ctx.beginPath(); ctx.ellipse(x, y + 4, 34, 12, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#5c3a1a'; ctx.beginPath(); ctx.ellipse(x + wob, y - 2, 28, 13, 0, 3.1416, 6.283); ctx.fill();
    ctx.fillStyle = '#8a5a2b'; ctx.beginPath(); ctx.ellipse(x + wob - 4, y - 5, 17, 8, 0, 3.1416, 6.283); ctx.fill();
    for(let k = 0; k < 6; k++){ const p = (g.t * 2.2 + k / 6) % 1, an = -3.1416 * (.2 + .6 * HH(k, 9)); ctx.globalAlpha = 1 - p; ctx.fillStyle = k % 2 ? '#8a5a2b' : '#b9895a'; ctx.fillRect(Math.round(x + Math.cos(an) * (16 + 26 * p)), Math.round(y - 4 + Math.sin(an) * 30 * p + 34 * p * p), 4, 4); }
  } else { const u = Math.min(1, out / K.down); for(let k = 0; k < 14; k++){ const an = -3.1416 * (.08 + .84 * HH(k, 13)), v = 70 + 110 * HH(k, 15); ctx.globalAlpha = 1 - u * .7; ctx.fillStyle = k % 3 ? '#8a5a2b' : '#5c3a1a'; const z = 5 + HH(k, 17) * 5; ctx.fillRect(Math.round(x + Math.cos(an) * v * u), Math.round(y + Math.sin(an) * v * u + 90 * u * u), z, z); } }      // sale: la tierra revienta
  ctx.restore();
}
// ---------- TERREMOTO: grietas largas y ramificadas que salen de donde golpea, onda de polvo que se abre y piedras que saltan. Las grietas se quedan un rato y se van borrando ----------
FXR.impact._terremoto = (e, a, type) => {
  const R = e.R || 200, u = Math.min(1, a / e.dur), sd = Math.floor(e.seed || 0) + 7, grow = Math.min(1, a / .3), fadeC = a < e.dur * .6 ? 1 : Math.max(0, 1 - (a - e.dur * .6) / (e.dur * .4));
  ctx.save(); ctx.translate(e.x, e.y); ctx.scale(1, .8); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  for(let pass = 0; pass < 2; pass++){                               // grieta: trazo ancho oscuro y, encima, un hilo de luz naranja al principio
    ctx.strokeStyle = pass ? '#ff9a3a' : 'rgba(20,12,6,1)'; ctx.globalAlpha = pass ? Math.max(0, 1 - a / .5) * .9 : .8 * fadeC; if(ctx.globalAlpha <= 0) continue;
    for(let k = 0; k < 11; k++){ let an = k * .571 + HH(sd, k) * .4, r = 10, px = Math.cos(an) * r, py = Math.sin(an) * r; const L = R * (.7 + .35 * HH(sd + 3, k)) * grow, st = 7;
      ctx.lineWidth = pass ? 2 : 6; ctx.beginPath(); ctx.moveTo(px, py);
      for(let s = 0; s < st && r < L; s++){ r += L / st; an += (HH(sd + s, k + 9) - .5) * .8; px = Math.cos(an) * r; py = Math.sin(an) * r; ctx.lineTo(Math.round(px / 2) * 2, Math.round(py / 2) * 2);
        if(!pass && s % 2 === 1){ const ba = an + (HH(sd + s, k + 40) > .5 ? .9 : -.9), bl = L * .22; ctx.moveTo(px, py); ctx.lineTo(Math.round((px + Math.cos(ba) * bl) / 2) * 2, Math.round((py + Math.sin(ba) * bl) / 2) * 2); ctx.moveTo(px, py); } }
      ctx.stroke(); }
  }
  if(a < .5){ const q = a / .5; ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 9 * (1 - q) + 2; ctx.beginPath(); ctx.arc(0, 0, R * Math.min(1, a / .4), 0, 6.283); ctx.stroke();      // la onda (va a la vez que el daño)
    ctx.strokeStyle = TC[type] || '#c9a45c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, R * Math.min(1, a / .4) * .86, 0, 6.283); ctx.stroke(); }
  ctx.restore();
  if(a < .9){ const q = a / .9; for(let k = 0; k < 22; k++){ const an = k * .2856 + HH(sd, k + 20), d = R * (.2 + .75 * HH(sd, k + 25)), hgt = Math.sin(q * 3.1416) * (30 + 50 * HH(sd, k + 30)), z = Math.round(4 + 7 * HH(sd, k + 35));
    ctx.globalAlpha = 1 - q; ctx.fillStyle = k % 3 === 0 ? '#6e6253' : k % 3 === 1 ? '#a8977c' : '#e6dcc4'; ctx.fillRect(Math.round(e.x + Math.cos(an) * d), Math.round(e.y + Math.sin(an) * d * .8 - hgt), z, z); } }      // piedras y polvo que saltan
  ctx.globalAlpha = 1;
};
// ---------- VENTISCA: cada copo de la ráfaga es una racha de viento (rayas blancas y azules) con un cristal de nieve delante ----------
FXR.flight._ventisca = (s, a, an) => {
  const ca = Math.cos(an), sa = Math.sin(an), px = -sa, py = ca, k = s.sd || 0, fade = s.L ? Math.min(1, s.life / (s.L * .3)) : 1;
  ctx.save(); ctx.lineCap = 'round';
  for(let i = 0; i < 3; i++){ const o = (i - 1) * 7 + Math.sin(g.t * 20 + k + i) * 3, L = 34 + HH(k, i) * 26; ctx.globalAlpha = (.75 - i * .15) * fade; ctx.strokeStyle = i === 1 ? '#ffffff' : '#9fdcff'; ctx.lineWidth = i === 1 ? 4 : 3;
    ctx.beginPath(); ctx.moveTo(s.x + px * o, s.y + py * o); ctx.lineTo(s.x - ca * L + px * o * 1.6, s.y - sa * L + py * o * 1.6); ctx.stroke(); }
  ctx.globalAlpha = fade; ctx.translate(s.x, s.y); ctx.rotate(g.t * 6 + k); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5;
  for(let i = 0; i < 3; i++){ ctx.rotate(1.047); ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.stroke(); }
  ctx.fillStyle = '#d6f2ff'; ctx.fillRect(-2, -2, 4, 4);
  ctx.restore(); return true;
};
FXR.trail._ventisca = {rate: 26, cols: ['#ffffff', '#bfe8ff', '#7fc6f2'], life: .4, speed: 30, spread: 8, s: 2};

// ---------- ROCA AFILADA: una roca puntiaguda que sale del suelo de golpe, se queda un momento y se deshace en cascotes ----------
FXR.impact._pincho = (e, a, type) => {
  const sd = Math.floor(e.seed || 0), up = Math.min(1, a / .1), out = a < .55 ? 1 : Math.max(0, 1 - (a - .55) / .35), h = (74 + HH(sd, 1) * 22) * (1 - Math.pow(1 - up, 3)) * (.35 + .65 * out), w = 22 + HH(sd, 2) * 8, lean = (HH(sd, 3) - .5) * 16, x = e.x, y = e.y;
  ctx.save(); ctx.globalAlpha = Math.min(1, out * 1.6); ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(20,12,6,.55)'; ctx.beginPath(); ctx.ellipse(x, y + 2, w * 1.3, w * .45, 0, 0, 6.283); ctx.fill();                                    // el agujero del suelo
  ctx.beginPath(); ctx.moveTo(x - w, y); ctx.lineTo(x - w * .45 + lean * .4, y - h * .55); ctx.lineTo(x + lean, y - h); ctx.lineTo(x + w * .55 + lean * .4, y - h * .5); ctx.lineTo(x + w, y); ctx.closePath();
  ctx.strokeStyle = '#2b2119'; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = '#8c7a62'; ctx.fill();                                                        // la roca
  ctx.beginPath(); ctx.moveTo(x + lean, y - h); ctx.lineTo(x + w * .55 + lean * .4, y - h * .5); ctx.lineTo(x + w, y); ctx.lineTo(x + w * .15, y); ctx.closePath(); ctx.fillStyle = '#5e5142'; ctx.fill();      // cara en sombra
  ctx.beginPath(); ctx.moveTo(x - w * .6, y - 4); ctx.lineTo(x - w * .3 + lean * .4, y - h * .5); ctx.lineTo(x + lean * .9, y - h * .92); ctx.strokeStyle = '#d8ccb6'; ctx.lineWidth = 3; ctx.stroke();      // filo claro
  ctx.restore();
  if(a < .5){ const q = a / .5; for(let k = 0; k < 9; k++){ const an = -3.1416 * (.1 + .8 * HH(sd + k, 11)), v = 50 + 80 * HH(sd + k, 13), z = Math.round(4 + 4 * HH(sd + k, 15)); ctx.globalAlpha = 1 - q; ctx.fillStyle = k % 2 ? '#a8977c' : '#6e6253'; ctx.fillRect(Math.round(x + Math.cos(an) * v * q), Math.round(y + Math.sin(an) * v * q + 110 * q * q), z, z); } }      // cascotes que saltan al salir
  ctx.globalAlpha = 1;
};
