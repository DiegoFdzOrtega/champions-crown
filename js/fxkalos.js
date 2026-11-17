"use strict";
/* =====================================================================
   ATAQUES DEL VÍDEO «ASH vs ALAIN» (que pasó Diego), dibujados por código con el mismo estilo:
   - RAYO HIELO: rayo azul con el borde de PINCHOS DE HIELO y un copo de nieve girando en la boca.
       Al dar: anillos de hielo enormes que se abren, cuchillas de hielo girando alrededor del rival, una estrella de hielo
       y, en el suelo, una mancha de escarcha con cristales que se queda (como las marcas de js/fxsuelo.js).
   Va ANTES de js/fxsuelo.js. KA.on = false vuelve a los de antes.
   ===================================================================== */
const KA = {on: true};
const KA_ICE = ['#0d3b6e', '#2f86d6', '#7fd0f5', '#d8f6ff', '#ffffff'];
const KA_FUEGO = ['#5a1400', '#e8461a', '#ff9a2a', '#ffe27a', '#fff8d8'];

function kaReplace(tab, name, fn){
  const o = tab[name], old = o && (o.draw || o);
  const w = function(e, a){ if(KA.on) return fn(e, a); if(old) return old.apply(this, arguments); };
  if(o) Object.assign(w, o); delete w.draw; tab[name] = w;
}
function kaPoly(pts, fill, edge, lw){ ctx.beginPath(); pts.forEach((p, i) => ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1])); ctx.closePath(); if(fill){ ctx.fillStyle = fill; ctx.fill(); } if(edge){ ctx.strokeStyle = edge; ctx.lineWidth = lw || 2; ctx.stroke(); } }
function kaFlake(x, y, r, rot, A){                                            // copo de nieve de 6 brazos
  if(r < 1) return; ctx.save(); ctx.globalAlpha = A; ctx.translate(x, y); ctx.rotate(rot); ctx.lineCap = 'round';
  for(const [col, lw] of [[KA_ICE[0], 5], [KA_ICE[4], 2.2]]){ ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    for(let i = 0; i < 6; i++){ const an = i * Math.PI / 3, c = Math.cos(an), s = Math.sin(an); ctx.moveTo(0, 0); ctx.lineTo(c * r, s * r);
      for(const q of [.5, .75]){ const bx = c * r * q, by = s * r * q, bl = r * .28; ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(an + .8) * bl, by + Math.sin(an + .8) * bl); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(an - .8) * bl, by + Math.sin(an - .8) * bl); } }
    ctx.stroke(); }
  ctx.fillStyle = KA_ICE[3]; ctx.beginPath(); ctx.arc(0, 0, r * .22, 0, 6.283); ctx.fill(); ctx.restore();
}

// ---------------- RAYO HIELO ----------------
function kaIceBeam(e){
  const G = sg(e, 460); if(G.len < 6) return;
  const A = G.al, t = e.t || 0, gw = clamp01(t / .08), W = 22 * gw, L = G.len, ca = Math.cos(G.an), sa = Math.sin(G.an), px = -sa, py = ca;
  ctx.save(); ctx.globalAlpha = A; ctx.lineJoin = 'miter';
  const n = Math.max(3, Math.floor(L / 16)), sh = Math.floor(g.t * 10);                // pinchos de hielo en los dos bordes, inclinados hacia atrás
  for(let i = 1; i < n; i++){ const u = i / n, side = i % 2 ? 1 : -1, bx = G.x0 + ca * L * u, by = G.y0 + sa * L * u, h = (11 + HH(i, 7 + (sh & 1)) * 12) * gw * (u < .12 ? u / .12 : 1);
    const b0 = [bx + px * side * W * .3 - ca * 7, by + py * side * W * .3 - sa * 7], b1 = [bx + px * side * W * .3 + ca * 5, by + py * side * W * .3 + sa * 5], tip = [bx + px * side * (W / 2 + h) - ca * 8, by + py * side * (W / 2 + h) - sa * 8];
    kaPoly([b0, tip, b1], KA_ICE[3], KA_ICE[0], 2); }
  ctx.lineCap = 'round';
  [[W + 6, KA_ICE[0]], [W, KA_ICE[1]], [W * .62, KA_ICE[2]], [W * .32, KA_ICE[4]]].forEach(([lw, c]) => { ctx.strokeStyle = c; ctx.lineWidth = Math.max(1, lw); ctx.beginPath(); ctx.moveTo(G.x0, G.y0); ctx.lineTo(G.x1, G.y1); ctx.stroke(); });
  for(let i = 0; i < 6; i++){ const u = (i / 6 + g.t * 2.2) % 1, o = (HH(i, 9) - .5) * W * .6; ctx.fillStyle = '#ffffff'; ctx.fillRect(G.x0 + ca * L * u + px * o - 2, G.y0 + sa * L * u + py * o - 2, 4, 4); }   // brillos que corren
  kaFlake(G.x0, G.y0, 13 * gw, g.t * 3, A);
  kaFlake(G.x1, G.y1, 9 * gw, -g.t * 4, A);
  ctx.restore();
}
function kaFrostPaint(x, y, r){                                                 // mancha de escarcha con cristales (se queda en el suelo)
  if(typeof suCanvas !== 'function') return null;
  const R = suRnd(Math.random() * 999), [c, s] = suCanvas(x - r * 1.8, y - r, x + r * 1.8, y + r);
  for(let i = 0; i < 7; i++){ const an = R() * 6.283, d = R() * r * .6; s.fillStyle = `rgba(215,245,255,${.18 + R() * .15})`; s.beginPath(); s.ellipse(x + Math.cos(an) * d, y + Math.sin(an) * d * .45, r * (.5 + R() * .4), r * (.22 + R() * .15), 0, 0, 6.283); s.fill(); }
  for(let i = 0; i < 9; i++){ const an = R() * 6.283, d = r * (.2 + R() * .9), cx = x + Math.cos(an) * d, cy = y + Math.sin(an) * d * .45, h = 6 + R() * 10, w = 3 + R() * 3;
    s.fillStyle = 'rgba(13,59,110,.75)'; s.beginPath(); s.moveTo(cx - w - 1, cy + 1); s.lineTo(cx, cy - h - 1); s.lineTo(cx + w + 1, cy + 1); s.closePath(); s.fill();
    s.fillStyle = 'rgba(200,240,255,.9)'; s.beginPath(); s.moveTo(cx - w, cy); s.lineTo(cx, cy - h); s.lineTo(cx + w, cy); s.closePath(); s.fill(); }
  return c;
}
function kaIceHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y;
  if(!e.kaD){ e.kaD = 1; if(typeof suAdd === 'function') suAdd(kaFrostPaint(x, y + 20, 34 * k)); }
  ctx.save();
  for(let r = 0; r < 3; r++){ const v = clamp01((a - r * .08) / .75); if(v <= 0 || v >= 1) continue; const o = 1 - Math.pow(1 - v, 2.4), R0 = (20 + 125 * o) * k;   // anillos de hielo que se abren
    ctx.globalAlpha = (1 - v) * .75; ctx.beginPath(); ctx.ellipse(x, y + 6, R0, R0 * .62, 0, 0, 6.283);
    ctx.strokeStyle = '#2a7f8f'; ctx.lineWidth = 12 * (1 - v) + 4; ctx.stroke(); ctx.strokeStyle = '#a8f0ee'; ctx.lineWidth = 8 * (1 - v) + 2; ctx.stroke(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke(); }
  if(a < .85){ const A = 1 - a / .85;                                          // cuchillas de hielo que giran alrededor y se cierran
    for(let i = 0; i < 6; i++){ const an = i * 1.047 + a * 5.5, rad = (95 - 60 * a) * k, cx = x + Math.cos(an) * rad, cy = y + 4 + Math.sin(an) * rad * .55, tg = an + Math.PI / 2, L0 = 42 * k, w0 = 11 * k;
      const c = Math.cos(tg), s = Math.sin(tg) * .55, nx = Math.cos(an), ny = Math.sin(an) * .55;
      ctx.globalAlpha = A; kaPoly([[cx - c * L0, cy - s * L0], [cx + nx * w0, cy + ny * w0], [cx + c * L0, cy + s * L0], [cx - nx * w0 * .4, cy - ny * w0 * .4]], '#c8fbff', '#0d3b6e', 3);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx - c * L0 * .8, cy - s * L0 * .8); ctx.lineTo(cx + c * L0 * .8, cy + s * L0 * .8); ctx.stroke(); } }
  if(a < .55){ const u = a / .55, Rr = (44 - 18 * u) * k;                       // estrella de hielo en el centro
    ctx.globalAlpha = 1 - u; ctx.save(); ctx.translate(x, y - 6); ctx.rotate(a * 2);
    for(const [sc, col] of [[1.12, KA_ICE[0]], [1, KA_ICE[2]], [.6, KA_ICE[4]]]){ ctx.beginPath(); for(let i = 0; i < 16; i++){ const rr = (i % 2 ? Rr * .32 : Rr) * sc, an = i * Math.PI / 8; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(an) * rr, Math.sin(an) * rr); } ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }
    ctx.restore(); }
  for(let i = 0; i < 12; i++){ const tt = a - HH(i, 30) * .05; if(tt < 0 || tt > .7) continue; const an = HH(i, 31) * 6.283, v = 110 + HH(i, 32) * 120, s = 4 + HH(i, 33) * 4;   // trocitos de hielo que saltan
    const qx = x + Math.cos(an) * v * tt, qy = y + Math.sin(an) * v * tt * .7 + 200 * tt * tt; ctx.globalAlpha = 1 - tt / .7; kaPoly([[qx - s, qy + s * .5], [qx, qy - s], [qx + s, qy + s * .5]], KA_ICE[3], KA_ICE[0], 1.5); }
  ctx.restore();
}

// ---------------- LANZALLAMAS: cuerda de fuego trenzada ----------------
function kaFlame(e){
  const G = sg(e, 420); if(G.len < 6) return;
  const A = G.al, t = e.t || 0, L = G.len, ca = Math.cos(G.an), sa = Math.sin(G.an), px = -sa, py = ca, W = 26 * clamp01(t / .1), N = Math.max(16, Math.floor(L / 4));
  const runs = [[], []];                                                         // tramos de detrás [0] y de delante [1] de las dos llamas
  for(let s = 0; s < 2; s++){ let cur = null, side = null;
    for(let i = 0; i <= N; i++){ const u = i / N, ramp = u < .12 ? .35 + .65 * u / .12 : 1, ph = u * L / 26 - g.t * 15 + s * Math.PI, dep = Math.cos(ph), off = Math.sin(ph) * W * .4 * ramp;
      const q = [G.x0 + ca * L * u + px * off, G.y0 + sa * L * u + py * off, W * .36 * ramp], f = dep > 0 ? 1 : 0;
      if(f !== side){ if(cur) cur.push(q); cur = [q]; runs[f].push({s, p: cur}); side = f; } else cur.push(q); } }
  ctx.save(); ctx.globalAlpha = A * .35; ctx.strokeStyle = KA_FUEGO[2]; ctx.lineCap = 'round'; ctx.lineWidth = W * 1.5; ctx.beginPath(); ctx.moveTo(G.x0, G.y0); ctx.lineTo(G.x1, G.y1); ctx.stroke();   // calor alrededor
  ctx.lineJoin = 'round';
  const draw = (list, front) => [[2.6, 5, KA_FUEGO[0]], [2, 0, front ? KA_FUEGO[1] : '#c8380f'], [1.25, 0, KA_FUEGO[2]], [.55, 0, front ? KA_FUEGO[3] : KA_FUEGO[2]]].forEach(([k, pad, col]) => {
    ctx.strokeStyle = col; list.forEach(r => { if(r.p.length < 2) return; const w = r.p.reduce((m, q) => m + q[2], 0) / r.p.length; ctx.lineWidth = Math.max(1, w * k + pad); ctx.beginPath(); r.p.forEach((q, i) => ctx[i ? 'lineTo' : 'moveTo'](q[0], q[1])); ctx.stroke(); }); });
  ctx.globalAlpha = A * .85; draw(runs[0], false);
  ctx.globalAlpha = A; draw(runs[1], true);
  if(typeof tpTongue === 'function') for(let i = 0; i < 7; i++){ const an = G.an + (i - 3) * .32 + Math.sin(g.t * 12 + i) * .08, len = (28 + HH(i, Math.floor(g.t * 14)) * 20) * clamp01(t / .15) * (1 - Math.abs(i - 3) * .12);   // estallido de llamas en la punta
    tpTongue(G.x1 - ca * 4, G.y1 - sa * 4, len, 10, an, i % 2 ? KA_FUEGO[2] : KA_FUEGO[3], KA_FUEGO[0], A); }
  if(typeof tpLayers === 'function') tpLayers([[G.x1, G.y1, 12 * clamp01(t / .1)], [G.x0 + ca * 6, G.y0 + sa * 6, 9 * clamp01(t / .1)]], KA_FUEGO, A);
  for(let i = 0; i < 10; i++){ const u = (i / 10 + g.t * 1.8) % 1, o = (HH(i, 12) - .5) * W * 1.8; ctx.globalAlpha = A * (1 - u); ctx.fillStyle = i % 2 ? KA_FUEGO[3] : KA_FUEGO[2]; ctx.fillRect(G.x0 + ca * L * u + px * o - 2, G.y0 + sa * L * u + py * o - 2 - u * 12, 4, 4); }   // brasas
  ctx.restore();
}

kaReplace(FXR.stream, 'Rayo Hielo', kaIceBeam);
kaReplace(FXR.impact, 'Rayo Hielo', kaIceHit);
// (Lanzallamas se queda como estaba: el chorro de llamitas de js/fxnuevos.js. kaFlame se deja aquí por si algún día se quiere usar.)
FXC['Rayo Hielo'] = Object.assign({}, FXC['Rayo Hielo'], {idur: 1});                // que dé tiempo a ver los anillos y las cuchillas

