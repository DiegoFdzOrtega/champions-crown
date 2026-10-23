"use strict";
/* =====================================================================
   Biblioteca de dibujo pixel art para los efectos de ataque.
   Todo se dibuja en cuadraditos de 2x2 (el mismo tamaño que los píxeles de los Pokémon).
   ===================================================================== */
// Polígono relleno por filas (cada fila = tiras de píxeles, así los bordes son nítidos aunque la figura esté girada)
function Poly(pts, c){
  ctx.fillStyle = c; let y0 = 1e9, y1 = -1e9; const n = pts.length;
  for(const p of pts){ if(p[1] < y0) y0 = p[1]; if(p[1] > y1) y1 = p[1]; }
  for(let y = snap(y0); y <= y1; y += PXS){
    const yc = y + PXS / 2, xs = [];
    for(let i = 0; i < n; i++){ const a = pts[i], b = pts[(i + 1) % n]; if((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + (yc - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
    xs.sort((p, q) => p - q);
    for(let k = 0; k + 1 < xs.length; k += 2){ const x0 = snap(xs[k]), x1 = snap(xs[k + 1]); ctx.fillRect(x0, y, Math.max(PXS, x1 - x0), PXS); }
  }
}
function PolyO(pts, c, oc){                                                      // polígono con contorno
  let cx = 0, cy = 0; for(const p of pts){ cx += p[0]; cy += p[1]; } cx /= pts.length; cy /= pts.length;
  Poly(pts.map(([x, y]) => { const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1; return [x + dx / d * PXS * 1.4, y + dy / d * PXS * 1.4]; }), oc);
  Poly(pts, c);
}
const rotp = (cx, cy, ang, pts) => { const co = Math.cos(ang), si = Math.sin(ang); return pts.map(([x, y]) => [cx + x * co - y * si, cy + x * si + y * co]); };
function Arc(x, y, r, a0, a1, c, w = 1){                                          // arco de círculo (r en píxeles)
  const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) * r * 1.3));
  for(let i = 0; i <= n; i++){ const a = a0 + (a1 - a0) * i / n; R(x + Math.cos(a) * r * PXS - (w - 1) * PXS / 2, y + Math.sin(a) * r * PXS - (w - 1) * PXS / 2, w, w, c); }
}
const fade = (a, t0, d) => a < t0 ? 1 : clamp01(1 - (a - t0) / d);
const once = (e, fn, k = '') => { if(!e['i' + k]){ e['i' + k] = 1; fn(); } };
const aim = (e, d, s = 0) => [e.x + Math.cos(e.ang) * d - Math.sin(e.ang) * s, e.y + Math.sin(e.ang) * d + Math.cos(e.ang) * s];

// Esfera de energía con capas (contorno, sombra, base, luz, brillo)
function orb(x, y, r, p, k = 0){
  D(x, y, r + 1, p[0]); D(x, y, r, p[1]); D(x - r * .12 * PXS, y - r * .12 * PXS, Math.max(1, r * .75), p[2]);
  D(x - r * .22 * PXS, y - r * .22 * PXS, Math.max(1, r * .48), p[3]); D(x - r * .28 * PXS, y - r * .28 * PXS, Math.max(1, r * .22), p[4]);
}
// Bocanada de fuego/humo: u=0 (recién salido, claro) .. 1 (apagándose, oscuro)
function puff(x, y, r, u, p){ D(x, y, r, ramp([p[4], p[3], p[2], p[1]], u)); if(r > 3) D(x - PXS, y - PXS, Math.max(1, r - 2), ramp([p[4], p[4], p[3], p[2]], u)); }
// Rayo en zigzag
function bolt(x0, y0, x1, y1, seed, p, w = 1, amp = 6, seg = 9){
  const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.ceil(L / (seg * PXS))), an = Math.atan2(y1 - y0, x1 - x0), px = -Math.sin(an), py = Math.cos(an), pts = [[x0, y0]];
  for(let i = 1; i < n; i++){ const u = i / n, o = (HH(seed, i) - .5) * 2 * amp * PXS * Math.min(1, Math.sin(u * Math.PI) * 1.6); pts.push([x0 + (x1 - x0) * u + px * o, y0 + (y1 - y0) * u + py * o]); }
  pts.push([x1, y1]);
  for(const [c, ww] of [[p[1], w + 2], [p[2], w + 1], [p[4], w]]) for(let i = 0; i < pts.length - 1; i++) Ln(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], c, ww);
  return pts;
}
// Marcas de garra/corte: n líneas paralelas, afinadas en las puntas, que se dibujan de una en una
function slashMarks(x, y, a, o){
  const n = o.n || 3, len = o.len || 46, an = o.ang ?? .95, gap = o.gap || 11, st = o.step || .045, hold = o.hold || .2, fd = o.fade || .16, c = o.cols;
  const al = fade(a, hold, fd); if(al <= 0) return; ctx.globalAlpha = al;
  const dx = Math.cos(an), dy = Math.sin(an), px = -dy, py = dx;
  for(let i = 0; i < n; i++){
    const off = (i - (n - 1) / 2) * gap, pr = clamp01((a - i * st) / (o.draw || .08)); if(pr <= 0) continue;
    const steps = Math.ceil(len / PXS);
    for(let j = 0; j <= steps * pr; j++){
      const u = j / steps, s = (u - .5) * len, bow = Math.sin(u * Math.PI) * (o.curve || 0), cx = x + dx * s + px * (off + bow), cy = y + dy * s + py * (off + bow);
      const w = 1 + Math.round(Math.sin(u * Math.PI) * (o.w || 2));
      R(cx - (w + 2) * PXS / 2, cy - (w + 2) * PXS / 2, w + 2, w + 2, c[0]);
    }
    for(let j = 0; j <= steps * pr; j++){
      const u = j / steps, s = (u - .5) * len, bow = Math.sin(u * Math.PI) * (o.curve || 0), cx = x + dx * s + px * (off + bow), cy = y + dy * s + py * (off + bow);
      const w = 1 + Math.round(Math.sin(u * Math.PI) * (o.w || 2));
      R(cx - w * PXS / 2, cy - w * PXS / 2, w, w, c[1]);
      if(w > 2) R(cx - PXS / 2, cy - PXS / 2, 1, 1, c[2]);
    }
  }
  ctx.globalAlpha = 1;
}
// Estrella de impacto de 8 puntas que crece y se apaga
function hitStar(x, y, a, p, big = 1, t0 = 0){
  const u = clamp01((a - t0) / .16); if(a < t0) return; const al = fade(a - t0, .14, .2); if(al <= 0) return; ctx.globalAlpha = al;
  const r1 = (6 + 14 * ease(u)) * big;
  Star(x, y, 8, 2, r1, p[1], 3); Star(x, y, 8, 2, r1 - 1, p[3], 1); D(x, y, 4 * big * (1 - u * .4), p[4]); Rg(x, y, 5 + 9 * u, p[2], undefined, 1);
  ctx.globalAlpha = 1;
}
// Imagen fantasma de un Pokémon (para Ataque Rápido, etc.)
function ghostOf(f, x, y, al){ ctx.save(); ctx.globalAlpha = al; drawFrame(ctx, f.m.dex, f.act, f.at, f.dir, x, y, ESCALA, 0, f.shiny); ctx.restore(); }
const bodyOf = f => { const I = idleInfo(f.m.dex); return {top:f.y + I.top * ESCALA, foot:f.y + I.foot * ESCALA, hw:I.fw * ESCALA * .36, I}; };