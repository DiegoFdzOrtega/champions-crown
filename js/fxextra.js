"use strict";
/* =====================================================================
   Impactos (qué se ve cuando el ataque llega al rival) y mejoras (hueco 3, sobre el propio Pokémon).
   ===================================================================== */
const IMP = FXR.impact, IMPT = {};            // IMP = por movimiento · IMPT = respaldo por tipo
const crown = (e, p, n, sp, up, o = {}) => { for(let i = 0; i < n; i++) fx.parts.push({x:e.x, y:e.y, vx:(Math.random() - .5) * sp, vy:-up * (.4 + Math.random() * .8), rise:0, grav:o.grav ?? 1.7, life:o.life || .6, max:o.life || .6, col:p[i % p.length], s:PXS * (o.s || (i % 3 ? 1 : 2)), drag:.96}); };
const flashDisc = (e, a, p, r0, r1, dur = .16) => { const u = clamp01(a / dur); if(a > dur + .12) return; ctx.globalAlpha = a < dur ? 1 : 1 - (a - dur) / .12; D(e.x, e.y, Math.round(lerp(r0, r1, ease(u))), p[2]); D(e.x, e.y, Math.round(lerp(r0, r1, ease(u)) * .65), p[3]); D(e.x, e.y, Math.round(lerp(r0, r1, ease(u)) * .35), p[4]); ctx.globalAlpha = 1; };
const ringsOut = (e, a, c, n, rmax, t0 = 0, dur = .4, ratio = .5, w = 2) => { for(let k = 0; k < n; k++){ const u = (a - t0 - k * .06) / dur; if(u <= 0 || u >= 1) continue; ctx.globalAlpha = 1 - u; Rg(e.x, e.y + 6, 4 + rmax * ease(u), c[k % c.length], (4 + rmax * ease(u)) * ratio, w); } ctx.globalAlpha = 1; };

// ---- anillo de lanzamiento (destello al disparar) ----
FXI.ring = (e, a) => { const u = clamp01(a / e.dur), p = fxPal(e.type); ctx.globalAlpha = 1 - u; Rg(e.x, e.y, 3 + 11 * e.k * ease(u), p[3], undefined, 2); Rg(e.x, e.y, 2 + 8 * e.k * ease(u), p[4], undefined, 1); ctx.globalAlpha = 1; };

// ===================== RESPALDO POR TIPO =====================
IMPT.normal = (e, a) => { hitStar(e.x, e.y, a, FXP.normal, e.k); once(e, () => fxBurst(e.x, e.y, ['#ffffff', '#d0d0d8'], 8, 120, undefined, 6.3, {life:.3})); };
IMPT.fuego = (e, a) => { const p = FXP.fuego; flashDisc(e, a, p, 4, 14 * e.k, .12); if(a < .5) for(let i = 0; i < 9; i++){ const v = HH(i, 1); puff(e.x + (HH(i, 2) - .5) * 40, e.y + (HH(i, 3) - .5) * 20 - a * 70 * (.4 + v), Math.round(3 + v * 4), clamp01(a / .5 + v * .2), p); } once(e, () => fxBurst(e.x, e.y, [p[2], p[3], p[4]], 8, 110, -Math.PI / 2, 3, {life:.5, rise:.3})); };
IMPT.agua = (e, a) => { const p = FXP.agua; ringsOut(e, a, [p[3], '#ffffff'], 2, 26 * e.k, 0, .4); once(e, () => crown(e, [p[2], p[3], '#ffffff'], 12, 130, 120)); D(e.x, e.y - 4, Math.round(6 * (1 - clamp01(a / .2))), p[3]); };
IMPT.planta = (e, a) => { const p = FXP.planta; if(a < .55){ ctx.globalAlpha = fade(a, .3, .25); for(let i = 0; i < 6; i++){ const an = i * 1.05 + 0.3, d = 8 + a * 80, x = e.x + Math.cos(an) * d, y = e.y + Math.sin(an) * d * .8; PolyO(rotp(x, y, an + a * 12, [[-6, 0], [-2, -3], [3, -3], [7, 0], [3, 3], [-2, 3]]), p[2], p[0]); } ctx.globalAlpha = 1; } hitStar(e.x, e.y, a, p, .8); };
IMPT.electrico = (e, a) => { const p = FXP.electrico, k = Math.floor(a * 30); if(a < .35){ ctx.globalAlpha = fade(a, .2, .15); for(let i = 0; i < 6; i++){ const t = i * 1.05 + HH(k, i) * .6; bolt(e.x, e.y, e.x + Math.cos(t) * 28 * e.k, e.y + Math.sin(t) * 28 * e.k, k + i, p, 0, 4, 5); } ctx.globalAlpha = 1; } flashDisc(e, a, p, 3, 10, .1); };
IMPT.hielo = (e, a) => { const p = FXP.hielo; if(a < .55){ ctx.globalAlpha = fade(a, .3, .25); for(let i = 0; i < 8; i++){ const an = i * .785 + .2, d = 8 + ease(clamp01(a / .3)) * (22 + (i % 2) * 8), s = 5 + (i % 3); PolyO(rotp(e.x + Math.cos(an) * d, e.y + Math.sin(an) * d, an, [[s, 0], [0, -s / 2.4], [-s, 0], [0, s / 2.4]]), p[3], p[1]); } ctx.globalAlpha = 1; } Star(e.x, e.y, 6, 0, 8 * (1 - clamp01(a / .4)), '#ffffff', 1); ringsOut(e, a, [p[3]], 1, 22, 0, .35); };
IMPT.lucha = (e, a) => { const p = FXP.lucha; hitStar(e.x, e.y, a, p, 1.3); ringsOut(e, a, [p[3], '#ffe8c0'], 2, 30, .04, .35); once(e, () => fx.shake = Math.max(fx.shake, 3)); };
IMPT.veneno = (e, a) => { const p = FXP.veneno; if(a < .6){ ctx.globalAlpha = fade(a, .3, .3); for(let i = 0; i < 6; i++){ const x = e.x + (HH(i, 1) - .5) * 40, y = e.y - a * 40 * (.4 + HH(i, 2)) + 6, r = 3 + (i % 3); Rg(x, y, r, p[3], undefined, 1); D(x - 1, y - 1, 1, '#ffffff'); } ctx.globalAlpha = 1; } ringsOut(e, a, [p[2]], 1, 22, 0, .4); once(e, () => crown(e, p.slice(2), 8, 100, 90)); };
IMPT.tierra = (e, a) => { const p = FXP.tierra; ringsOut(e, a, [p[3]], 1, 28, 0, .4); hitStar(e.x, e.y, a, p, .8); once(e, () => { crown(e, [p[1], p[2], p[3]], 12, 150, 130, {grav:2}); }); };
IMPT.volador = (e, a) => { const p = FXP.volador; slashMarks(e.x, e.y, a, {n:3, len:36, ang:-.7, gap:9, curve:6, cols:[p[0], p[3], '#ffffff'], w:1}); once(e, () => fxBurst(e.x, e.y, ['#ffffff', p[3]], 6, 70, undefined, 6.3, {life:.5})); };
IMPT.psiquico = (e, a) => { const p = FXP.psiquico; ringsOut(e, a, [p[2], p[3]], 3, 26, 0, .4, .8); flashDisc(e, a, p, 2, 8, .1); once(e, () => fxBurst(e.x, e.y, [p[2], p[3], '#7de3ff'], 8, 90, undefined, 6.3, {life:.5})); };
IMPT.bicho = (e, a) => { const p = FXP.bicho; hitStar(e.x, e.y, a, p, .9); ringsOut(e, a, [p[3]], 1, 20, .03, .3); once(e, () => fxBurst(e.x, e.y, [p[2], p[3], '#ffffff'], 8, 110, undefined, 6.3, {life:.35})); };
IMPT.roca = (e, a) => { const p = FXP.roca; hitStar(e.x, e.y, a, p, .9); once(e, () => { crown(e, [p[1], p[2], p[3], p[4]], 10, 150, 120, {grav:2}); fxBurst(e.x, e.y + 8, [p[3], p[4]], 6, 60, -Math.PI / 2, 3, {life:.5, s:2}); }); };
IMPT.fantasma = (e, a) => { const p = FXP.fantasma; if(a < .6){ ctx.globalAlpha = fade(a, .3, .3); for(let i = 0; i < 6; i++){ const x = e.x + (HH(i, 1) - .5) * 36, y = e.y + 8 - a * 50 * (.5 + HH(i, 2)); puff(x, y, 3 + (i % 3), .3 + a, p); } ctx.globalAlpha = 1; } ringsOut(e, a, [p[2]], 1, 24, 0, .4); };
IMPT.dragon = (e, a) => { const p = FXP.dragon; hitStar(e.x, e.y, a, p, 1.1); ringsOut(e, a, [p[3], p[2]], 2, 30, .02, .4); once(e, () => fxBurst(e.x, e.y, [p[2], p[3], '#ffffff'], 10, 130, undefined, 6.3, {life:.4})); };
IMPT.siniestro = (e, a) => { const p = FXP.siniestro; slashMarks(e.x, e.y, a, {n:2, len:40, ang:.8, gap:12, cols:[p[0], p[3], p[4]], w:2}); slashMarks(e.x, e.y, a - .05, {n:2, len:40, ang:-.8, gap:12, cols:[p[0], p[3], p[4]], w:2}); ringsOut(e, a, [p[3]], 1, 24, 0, .35); once(e, () => fxBurst(e.x, e.y, [p[1], p[2], p[3]], 8, 90, undefined, 6.3, {life:.5})); };
IMPT.acero = (e, a) => { const p = FXP.acero; flashDisc(e, a, p, 3, 11, .1); if(a < .3){ ctx.globalAlpha = fade(a, .15, .15); Ln(e.x - 24, e.y, e.x + 24, e.y, '#ffffff', 1); Ln(e.x, e.y - 24, e.x, e.y + 24, '#ffffff', 1); ctx.globalAlpha = 1; } ringsOut(e, a, [p[3]], 1, 24, .02, .3); once(e, () => fxBurst(e.x, e.y, ['#ffffff', '#ffe27a', p[3]], 10, 150, undefined, 6.3, {life:.3, s:1})); };
IMPT.hada = (e, a) => { const p = FXP.hada; if(a < .6){ ctx.globalAlpha = fade(a, .3, .3); for(let i = 0; i < 6; i++){ const an = i * 1.05 + a * 2, d = 6 + a * 55; Star(e.x + Math.cos(an) * d, e.y + Math.sin(an) * d, 4, 0, 4, i % 2 ? p[2] : '#ffffff', 1); } ctx.globalAlpha = 1; } flashDisc(e, a, p, 2, 9, .1); ringsOut(e, a, [p[3]], 1, 22, 0, .35); };
FXI._ = (e, a, type) => (IMPT[type] || IMPT.normal)(e, a);

// ===================== IMPACTOS PROPIOS DE CADA MOVIMIENTO =====================
IMP['Lanzallamas'] = (e, a) => { const p = FXP.fuego; if(a < .55) for(let i = 0; i < 11; i++){ const v = HH(i, 1), u = clamp01(a / .55 + v * .15); puff(e.x + (HH(i, 2) - .5) * 34, e.y + 8 - a * 60 * (.4 + v) + (HH(i, 5) - .5) * 8, Math.round(3 + (1 - u) * 5), u, p); } once(e, () => fxBurst(e.x, e.y, [p[3], p[4]], 7, 90, -Math.PI / 2, 3, {life:.5, rise:.5})); };
IMP['Ascuas'] = (e, a) => { const p = FXP.fuego; flashDisc(e, a, p, 2, 8, .1); if(a < .4) for(let i = 0; i < 4; i++){ const an = i * 1.57 + .5, d = 4 + a * 45; fball(e.x + Math.cos(an) * d, e.y + Math.sin(an) * d, 3, an, p, i, 2); } once(e, () => fxBurst(e.x, e.y, [p[2], p[3], p[4]], 8, 100, undefined, 6.3, {life:.4, rise:.3})); };
IMP['Envite Ígneo'] = (e, a) => { const p = FXP.fuego; flashDisc(e, a, p, 6, 22 * e.k, .14); if(a < .6) for(let i = 0; i < 12; i++){ const an = i * .52, d = 8 + ease(clamp01(a / .5)) * 38, u = clamp01(a / .55); puff(e.x + Math.cos(an) * d, e.y + Math.sin(an) * d * .8, Math.round(6 * (1 - u * .7)), u, p); } ringsOut(e, a, [p[3], p[2]], 2, 40, .04, .45); once(e, () => { fxBurst(e.x, e.y, [p[2], p[3], p[4]], 14, 170, undefined, 6.3, {life:.5}); fx.shake = Math.max(fx.shake, 5); }); };
IMP['Llamarada'] = (e, a) => {
  const p = FXP.fuego, S = [[[-32, -14], [32, -14]], [[0, -14], [-30, 30]], [[0, -4], [28, 30]]], al = fade(a, .55, .3); if(al <= 0) return; ctx.globalAlpha = al;
  S.forEach(([[x0, y0], [x1, y1]], i) => { const pr = ease(clamp01((a - i * .09) / .2)); if(pr <= 0) return; const xe = lerp(x0, x1, pr), ye = lerp(y0, y1, pr);
    Ln(e.x + x0, e.y + y0 - 4, e.x + xe, e.y + ye - 4, p[1], 7); Ln(e.x + x0, e.y + y0 - 4, e.x + xe, e.y + ye - 4, p[2], 5); Ln(e.x + x0, e.y + y0 - 4, e.x + xe, e.y + ye - 4, p[3], 3); Ln(e.x + x0, e.y + y0 - 4, e.x + xe, e.y + ye - 4, p[4], 1);
    const n = Math.ceil(Math.hypot(xe - x0, ye - y0) / 9), k = Math.floor(a * 18); for(let j = 0; j <= n; j++){ const u = j / n; puff(e.x + lerp(x0, xe, u) + (HH(j, k + i) - .5) * 8, e.y + lerp(y0, ye, u) - 4 - HH(j, k) * 7, 3, .3 + HH(j, k + 3) * .5, p); } });
  ctx.globalAlpha = 1; flashDisc(e, a, p, 5, 16, .1); once(e, () => { fxBurst(e.x, e.y, [p[2], p[3], p[4]], 16, 170, undefined, 6.3, {life:.6, rise:.3}); });
};
IMP['Pistola Agua'] = (e, a) => { const p = FXP.agua; ringsOut(e, a, [p[3]], 1, 18, 0, .3); once(e, () => crown(e, [p[2], p[3], '#ffffff'], 9, 100, 100, {life:.5})); D(e.x, e.y - 3, Math.round(4 * (1 - clamp01(a / .15))), '#ffffff'); };
IMP['Hidrobomba'] = (e, a) => { const p = FXP.agua; flashDisc(e, a, p, 5, 18, .12); ringsOut(e, a, [p[3], '#ffffff', p[2]], 3, 44, 0, .5); once(e, () => { crown(e, [p[2], p[3], '#ffffff', p[1]], 22, 220, 190, {life:.8}); fx.shake = Math.max(fx.shake, 3); }); if(a < .35) Star(e.x, e.y, 8, 4, 12 + a * 30, '#ffffff', 1); };
IMP['Impactrueno'] = (e, a) => { const p = FXP.electrico, k = Math.floor(a * 32); if(a < .38){ ctx.globalAlpha = fade(a, .26, .12); for(let i = 0; i < 7; i++){ const t = i * .9 + HH(k, i) * .8, L = 18 + HH(k, i + 3) * 14; bolt(e.x + Math.cos(t) * 4, e.y - 6 + Math.sin(t) * 4, e.x + Math.cos(t) * L, e.y - 6 + Math.sin(t) * L, k + i, p, 0, 4, 5); } const b = bodyOf(e.T); bolt(e.x - b.hw * .6, b.top + 8, e.x + b.hw * .5, b.foot - 6, k + 40, p, 0, 5, 6); ctx.globalAlpha = 1; } flashDisc(e, a, p, 3, 10, .1); };
IMP['Rayo'] = (e, a) => { const p = FXP.electrico, k = Math.floor(a * 34), b = bodyOf(e.T); if(a < .55){ ctx.globalAlpha = fade(a, .38, .17); for(let i = 0; i < 4; i++) bolt(e.x + (i - 1.5) * b.hw * .7, b.top - 6, e.x + (HH(k, i) - .5) * b.hw, b.foot, k + i * 9, p, 1, 6, 8); for(let i = 0; i < 5; i++){ const t = i * 1.26 + HH(k, i); bolt(e.x, e.y, e.x + Math.cos(t) * 36, e.y + Math.sin(t) * 30, k + i + 3, p, 0, 5, 6); } ctx.globalAlpha = 1; } flashDisc(e, a, p, 4, 15, .12); ringsOut(e, a, [p[3]], 1, 30, 0, .3); once(e, () => fx.shake = Math.max(fx.shake, 5)); };
IMP['Trueno'] = (e, a) => {
  const p = FXP.electrico, k = Math.floor(a * 30);
  if(a < .08){ ctx.globalAlpha = .55 * (1 - a / .08); ctx.fillStyle = '#fffbd0'; ctx.fillRect(-20, -20, W + 40, H + 40); ctx.globalAlpha = 1; }
  if(a < .5){ ctx.globalAlpha = fade(a, .3, .2); const sx = e.x + 14 * Math.sin(e.seed); bolt(sx, -10, e.x, e.y + 4, k, p, 3, 14, 12); bolt(sx + 2, -10, e.x + 2, e.y + 4, k + 7, p, 1, 9, 10);
    for(let i = 0; i < 3; i++){ const u = .25 + i * .22, bx = lerp(sx, e.x, u), by = lerp(-10, e.y, u), t = (i % 2 ? 1 : -1) * (.7 + HH(k, i) * .6); bolt(bx, by, bx + Math.cos(t) * 48, by + 40, k + i * 5, p, 0, 6, 8); } ctx.globalAlpha = 1; }
  flashDisc(e, a, p, 6, 22, .16); ringsOut(e, a, [p[3], '#ffffff'], 2, 44, 0, .4); once(e, () => { fxBurst(e.x, e.y, [p[2], p[3], '#ffffff'], 16, 190, undefined, 6.3, {life:.4}); fx.shake = Math.max(fx.shake, 10); });
};
IMP['Hoja Afilada'] = (e, a) => { const p = FXP.planta; slashMarks(e.x, e.y - 2, a, {n:3, len:46, ang:-.6, gap:9, cols:[p[0], p[3], '#ffffff'], w:1, step:.03}); if(a < .5){ ctx.globalAlpha = fade(a, .25, .25); for(let i = 0; i < 5; i++){ const u = clamp01((a - i * .03) / .3), x = e.x - 30 + u * 60, y = e.y - 18 + u * 36 + (i - 2) * 8; PolyO(rotp(x, y, a * 14 + i, [[-6, 0], [-2, -3], [3, -3], [7, 0], [3, 3], [-2, 3]]), p[2], p[0]); } ctx.globalAlpha = 1; } };
IMP['Rayo Hielo'] = (e, a) => {
  const p = FXP.hielo, b = bodyOf(e.T), al = fade(a, .6, .3), h = (b.foot - b.top); if(al <= 0) return; ctx.globalAlpha = al * .85;
  const grow = ease(clamp01(a / .18)), sp = [[-.9, .7], [-.5, 1], [-.1, .8], [.3, 1.05], [.75, .75], [.95, .55]];
  sp.forEach(([ox, hh], i) => { const x = e.x + ox * b.hw * 1.3, base = b.foot - 4, top = base - h * hh * grow, w = 7 + (i % 2) * 3; PolyO([[x - w, base], [x - w * .6, top + 8], [x, top], [x + w * .6, top + 9], [x + w, base]], p[2], p[1]); Poly([[x - w * .5, base - 4], [x - w * .3, top + 12], [x - w * .1, top + 6], [x - w * .1, base - 6]], p[3]); });
  ctx.globalAlpha = al; Poly([[e.x - b.hw, b.foot - 4], [e.x + b.hw, b.foot - 4], [e.x + b.hw * .8, b.foot + 2], [e.x - b.hw * .8, b.foot + 2]], p[1]);
  for(let i = 0; i < 4; i++){ const s = (Math.floor(a * 8) + i) % 4; Spark(e.x + (i - 1.5) * b.hw * .6, b.top + h * (.2 + .2 * s), 2, '#ffffff'); } ctx.globalAlpha = 1;
  once(e, () => fxBurst(e.x, e.y, [p[3], p[4], p[2]], 10, 100, undefined, 6.3, {life:.5}));
};
IMP['Nieve Polvo'] = (e, a) => { const p = FXP.hielo; for(let i = 0; i < 16; i++){ const t = a * 5 + i * .8, r = 6 + i * 1.5; ctx.globalAlpha = fade(a, .35, .2); R(e.x + Math.cos(t) * r, e.y + Math.sin(t) * r * .7 - 6, 1 + (i % 3 === 0), 1 + (i % 3 === 0), i % 2 ? '#ffffff' : p[2]); } ctx.globalAlpha = 1; };
IMP['Ventisca'] = (e, a) => {
  const p = FXP.hielo, b = bodyOf(e.T), al = fade(a, .55, .3); if(al <= 0) return; ctx.globalAlpha = al;
  for(let i = 0; i < 46; i++){ const t = a * (4 + i % 4) + i * 2.3, r = 8 + (i * 5 % 40) * (0.5 + a), x = e.x + Math.cos(t) * r, y = e.y - 4 + Math.sin(t) * r * .75; R(x, y, 1 + (i % 4 === 0), 1 + (i % 4 === 0), i % 3 ? '#ffffff' : i % 3 === 1 ? p[3] : p[2]); }
  const k = Math.floor(a * 16); for(let i = 0; i < 8; i++){ const x = e.x + (HH(i, k) - .5) * 90, y = e.y + (HH(i, k + 2) - .5) * 70; Ln(x, y, x - 14, y + 7, '#ffffff', 1); Spark(x + 4, y - 4, 2, p[3]); }
  ctx.globalAlpha = 1; ringsOut(e, a, [p[3]], 2, 40, 0, .4); once(e, () => fx.shake = Math.max(fx.shake, 4));
};
IMP['Psíquico'] = (e, a) => {
  const p = FXP.psiquico, b = bodyOf(e.T), cy = (b.top + b.foot) / 2; const al = fade(a, .55, .25); if(al <= 0) return; ctx.globalAlpha = al;
  for(let k = 0; k < 4; k++){ const u = ((a * 1.6 + k * .25) % 1), r = lerp(44, 8, u); Rg(e.x, cy, r, k % 2 ? '#7de3ff' : p[2], r * .8, 2); Rg(e.x, cy, r - 1, k % 2 ? '#ffffff' : p[3], (r - 1) * .8, 1); }
  for(let i = 0; i < 8; i++){ const t = i * .785 + a * 4, r = 30 - ((a * 2) % 1) * 20; Spark(e.x + Math.cos(t) * r, cy + Math.sin(t) * r * .8, 2, i % 2 ? '#ffffff' : '#ffe066'); }
  ctx.globalAlpha = 1; flashDisc({x:e.x, y:cy}, a, p, 3, 14, .1); once(e, () => fx.shake = Math.max(fx.shake, 4));
};
IMP['Bola Sombra'] = (e, a) => { const p = FXP.fantasma; const u = clamp01(a / .2); ctx.globalAlpha = a < .22 ? 1 : fade(a, .22, .2); D(e.x, e.y, Math.round(6 + 18 * ease(u)), DARKP[1]); D(e.x, e.y, Math.round(4 + 13 * ease(u)), DARKP[2]); D(e.x, e.y, Math.round(2 + 6 * ease(u)), DARKP[3]); ctx.globalAlpha = 1;
  ringsOut(e, a, [DARKP[3], p[3]], 2, 36, .05, .45); if(a < .6) for(let i = 0; i < 8; i++){ const t = i * .785 + a * 3, d = 6 + a * 60; puff(e.x + Math.cos(t) * d, e.y + Math.sin(t) * d * .7, 4, .5 + a, p); } once(e, () => { fxBurst(e.x, e.y, [DARKP[2], DARKP[3], DARKP[4]], 14, 140, undefined, 6.3, {life:.5}); fx.shake = Math.max(fx.shake, 5); }); };
IMP['Terremoto'] = (e, a) => {
  const p = FXP.tierra, cy = e.y + 14, al = fade(a, .55, .3);
  for(let k = 0; k < 3; k++){ const u = (a - k * .1) / .5; if(u <= 0 || u >= 1) continue; ctx.globalAlpha = (1 - u) * al; Rg(e.x, cy, 8 + 100 * ease(u), k ? p[3] : p[2], (8 + 100 * ease(u)) * .45, 3); Rg(e.x, cy, 8 + 100 * ease(u) - 2, p[0], (8 + 100 * ease(u) - 2) * .45, 1); }
  ctx.globalAlpha = al; const gr = ease(clamp01(a / .25));
  for(let i = 0; i < 9; i++){ const an = i * .7 + .2, L = (30 + HH(i, 5) * 60) * gr; let px = e.x, py = cy; for(let sg = 1; sg <= 4; sg++){ const nx = e.x + Math.cos(an) * L * sg / 4 + (HH(i, sg) - .5) * 10, ny = cy + Math.sin(an) * L * .5 * sg / 4 + (HH(i, sg + 4) - .5) * 4; Ln(px, py, nx, ny, '#120a04', 1); px = nx; py = ny; } }
  ctx.globalAlpha = 1;
  once(e, () => { for(let i = 0; i < 14; i++) fx.parts.push({x:e.x + (Math.random() - .5) * 120, y:cy + (Math.random() - .5) * 40, vx:(Math.random() - .5) * 40, vy:-120 - Math.random() * 120, rise:0, grav:2.2, life:.8, max:.8, col:[p[1], p[2], p[3], p[4]][i % 4], s:PXS * (1 + (i % 3 === 0)), drag:.98}); fx.shake = Math.max(fx.shake, 12); });
};
IMP['Hiperrayo'] = (e, a) => { const p = ['#7a3a00', '#ff7a1a', '#ffc83a', '#fff0c0', '#ffffff']; flashDisc(e, a, p, 6, 34, .16); ringsOut(e, a, ['#fff0c0', p[2], p[1]], 3, 60, .05, .5); const al = fade(a, .3, .3); ctx.globalAlpha = al; Star(e.x, e.y, 10, 12, 26 + a * 30, p[3], 1); Star(e.x, e.y, 6, 8, 20 + a * 20, p[2], 2); ctx.globalAlpha = 1; once(e, () => { fxBurst(e.x, e.y, p.slice(1), 24, 230, undefined, 6.3, {life:.6, s:2}); fx.shake = Math.max(fx.shake, 12); }); };
IMP['Rayo Solar'] = (e, a) => { const p = ['#7a6a00', '#d9c21f', '#fff27a', '#fffbd0', '#ffffff']; flashDisc(e, a, p, 5, 24, .14); Star(e.x, e.y, 12, 8, 24 + a * 36, '#fffbd0', 1); ringsOut(e, a, [p[2], '#9fe23a'], 2, 46, .03, .45); once(e, () => { fxBurst(e.x, e.y, [p[2], '#9fe23a', '#ffffff'], 16, 170, undefined, 6.3, {life:.6}); fx.shake = Math.max(fx.shake, 7); }); };
IMP['Cometa Draco'] = (e, a) => {
  const p = FXP.dragon, off = [[0, 0, 0], [-34, -14, .08], [30, -18, .16], [-12, 24, .24], [38, 18, .32], [-44, 12, .4]];
  off.forEach(([ox, oy, d], i) => { const u = (a - d) / .16; if(u < -1.6) return; const tx = e.x + ox, ty = e.y + oy;
    if(u < 0){ const v = -u; if(v < 1.6){ const sx = tx + 40 + v * 60, sy = ty - 70 - v * 100; Ln(sx, sy, sx + 22, sy - 32, '#3b3fd1', 3); Ln(sx, sy, sx + 22, sy - 32, '#7de3ff', 1); orb(sx, sy, 6, ['#101b52', '#3b3fd1', '#5f6bff', '#a9f0ff', '#ffffff']); } }
    else if(u < 1.4){ ctx.globalAlpha = fade(u, .3, 1.1); flashDisc({x:tx, y:ty}, u * .16, p, 3, 14, .1); Rg(tx, ty + 4, 6 + u * 20, p[3], (6 + u * 20) * .5, 2); ctx.globalAlpha = 1; if(!e['m' + i]){ e['m' + i] = 1; fxBurst(tx, ty, [p[2], p[3], '#ffffff'], 8, 130, undefined, 6.3, {life:.4}); fx.shake = Math.max(fx.shake, 5); } } });
};
IMP['Roca Afilada'] = (e, a) => {
  const p = FXP.roca, al = fade(a, .55, .25); if(al <= 0) return; ctx.globalAlpha = al; const gr = ease(clamp01(a / .14));
  for(let i = 0; i < 7; i++){ const an = i / 7 * 6.28 + .3, r = i === 6 ? 0 : 30, x = e.x + Math.cos(an) * r, y = e.y + 12 + Math.sin(an) * r * .5, h = (26 + HH(i, 2) * 14) * gr, w = 7 + HH(i, 3) * 3; PolyO([[x - w, y], [x - 1, y - h], [x + 2, y - h * .85], [x + w, y]], p[2], p[0]); Poly([[x - w * .6, y - 2], [x - 1, y - h + 3], [x - 1, y - 2]], p[4]); }
  ctx.globalAlpha = 1; ringsOut(e, a, [p[3]], 1, 38, 0, .35); once(e, () => { crown(e, [p[2], p[3], p[4]], 10, 140, 130, {grav:2}); fx.shake = Math.max(fx.shake, 6); });
};
IMP['Lanzamugre'] = (e, a) => {
  const al = fade(a, .75, .25); if(al <= 0) return; ctx.globalAlpha = al; const gr = ease(clamp01(a / .18));
  D(e.x, e.y + 8, Math.round(16 * gr), SLUDGE[0]); D(e.x, e.y + 8, Math.round(14 * gr), SLUDGE[1]); D(e.x - 2, e.y + 7, Math.round(10 * gr), SLUDGE[2]);
  for(let i = 0; i < 5; i++){ const t = (a * 1.4 + i * .2) % 1; Rg(e.x + (i - 2) * 8, e.y + 6 - t * 26, 2 + i % 2, SLUDGE[3], undefined, 1); }
  ctx.globalAlpha = 1; once(e, () => { crown(e, [SLUDGE[2], SLUDGE[3], SLUDGE[1]], 16, 170, 130, {life:.7, s:2}); fx.shake = Math.max(fx.shake, 5); });
};
IMP['Pulso Noche'] = (e, a) => { const p = FXP.siniestro; for(let k = 0; k < 3; k++){ const u = (a - k * .08) / .5; if(u <= 0 || u >= 1) continue; ctx.globalAlpha = 1 - u; Rg(e.x, e.y, 8 + 64 * ease(u), k % 2 ? p[3] : '#08060d', undefined, 3); Rg(e.x, e.y, 6 + 64 * ease(u), p[2], undefined, 1); } ctx.globalAlpha = 1; flashDisc(e, a, ['#000000', '#08060d', p[1], p[2], p[3]], 5, 16, .14); once(e, () => { fxBurst(e.x, e.y, [p[2], p[3], '#08060d'], 16, 190, undefined, 6.3, {life:.5}); fx.shake = Math.max(fx.shake, 7); }); };
IMP['Fuerza Lunar'] = (e, a) => { const p = FXP.hada; flashDisc(e, a, p, 6, 24, .14); const al = fade(a, .3, .3); ctx.globalAlpha = al; Poly(rotp(e.x, e.y - 6, 0, [[-5, -14], [3, -12], [9, -3], [8, 7], [3, 13], [-5, 14], [3, 6], [5, -1], [3, -8]]), '#ffffff'); for(let i = 0; i < 8; i++){ const t = i * .785 + a * 3, d = 12 + a * 70; Star(e.x + Math.cos(t) * d, e.y + Math.sin(t) * d, 4, 0, 4 + (i % 2) * 2, i % 2 ? p[2] : '#ffffff', 1); } ctx.globalAlpha = 1; ringsOut(e, a, [p[3], p[2]], 2, 42, .04, .45); once(e, () => { fxBurst(e.x, e.y, [p[2], p[3], '#ffffff'], 14, 150, undefined, 6.3, {life:.6}); fx.shake = Math.max(fx.shake, 6); }); };
IMP['Onda Certera'] = (e, a) => { flashDisc(e, a, BLUE, 6, 26, .15); ringsOut(e, a, [BLUE[3], '#ffffff'], 3, 50, .03, .45); Star(e.x, e.y, 8, 10, 24 + a * 40, BLUE[3], 1); once(e, () => { fxBurst(e.x, e.y, [BLUE[2], BLUE[3], '#ffffff'], 18, 190, undefined, 6.3, {life:.5}); fx.shake = Math.max(fx.shake, 8); }); };
IMP['Foco Resplandor'] = (e, a) => { const p = FXP.acero; flashDisc(e, a, p, 5, 22, .14); const al = fade(a, .2, .25); ctx.globalAlpha = al; Ln(e.x - 40, e.y, e.x + 40, e.y, '#ffffff', 2); Ln(e.x, e.y - 40, e.x, e.y + 40, '#ffffff', 2); Star(e.x, e.y, 4, 4, 26, p[3], 1); ctx.globalAlpha = 1; ringsOut(e, a, [p[3]], 2, 36, .03, .35); once(e, () => { fxBurst(e.x, e.y, ['#ffffff', '#ffe27a', p[3]], 14, 190, undefined, 6.3, {life:.35, s:1}); fx.shake = Math.max(fx.shake, 6); }); };
IMP['Pájaro Osado'] = (e, a) => { const p = FXP.volador; hitStar(e.x, e.y, a, p, 1.5); ringsOut(e, a, ['#ffffff', p[3]], 2, 44, .03, .4); if(a < .7){ ctx.globalAlpha = fade(a, .35, .35); for(let i = 0; i < 8; i++){ const t = i * .785, d = 10 + a * 40, x = e.x + Math.cos(t) * d, y = e.y + Math.sin(t) * d + a * 30; PolyO(rotp(x, y, t + a * 4, [[-5, 0], [0, -2], [5, 0], [0, 2]]), '#ffffff', p[1]); } ctx.globalAlpha = 1; } once(e, () => fx.shake = Math.max(fx.shake, 7)); };
IMP['Megacuerno'] = (e, a) => { const p = FXP.bicho; hitStar(e.x, e.y, a, p, 1.3); const al = fade(a, .25, .2); ctx.globalAlpha = al; for(let i = 0; i < 3; i++){ const t = (i - 1) * .55 + e.ang; Ln(e.x - Math.cos(t) * 8, e.y - Math.sin(t) * 8, e.x + Math.cos(t) * 40, e.y + Math.sin(t) * 40, '#ffffff', 1); Ln(e.x - Math.cos(t) * 8, e.y - Math.sin(t) * 8, e.x + Math.cos(t) * 32, e.y + Math.sin(t) * 32, p[3], 2); } ctx.globalAlpha = 1; ringsOut(e, a, [p[3]], 2, 36, .04, .4); once(e, () => { fxBurst(e.x, e.y, [p[2], p[3], '#ffffff'], 14, 170, undefined, 6.3, {life:.4}); fx.shake = Math.max(fx.shake, 7); }); };
IMP['Doble Filo'] = (e, a) => { hitStar(e.x, e.y, a, FXP.normal, 1.5); ringsOut(e, a, ['#ffffff', '#ffe066'], 2, 36, .02, .4); once(e, () => { fxBurst(e.x, e.y, ['#ffffff', '#ffe066', '#d0d0d8'], 14, 180, undefined, 6.3, {life:.4}); fx.shake = Math.max(fx.shake, 6); }); };
IMP['Triataque'] = (e, a) => { const cols = ['#ff5a2a', '#ffd91f', '#6fd4ff']; if(a < .5){ ctx.globalAlpha = fade(a, .25, .25); for(let i = 0; i < 3; i++){ const t = a * 6 + i * 2.094, d = 6 + a * 40; PolyO(rotp(e.x + Math.cos(t) * d, e.y + Math.sin(t) * d, t, [[0, -7], [6, 5], [-6, 5]]), cols[i], '#2a2a33'); } ctx.globalAlpha = 1; } hitStar(e.x, e.y, a, FXP.normal, .8); };
IMP['Esfera Aural'] = (e, a) => { flashDisc(e, a, BLUE, 4, 16, .12); ringsOut(e, a, [BLUE[3]], 2, 32, 0, .4); once(e, () => fxBurst(e.x, e.y, [BLUE[2], BLUE[3], '#ffffff'], 12, 140, undefined, 6.3, {life:.4})); };
IMP['Tinieblas'] = (e, a) => { const k = Math.floor(a * 20); ctx.globalAlpha = fade(a, .3, .3); for(let i = 0; i < 10; i++){ const t = i * .628 + HH(k, i) * .3, L = 20 + HH(k, i + 2) * 22; Ln(e.x + Math.cos(t) * 4, e.y + Math.sin(t) * 4, e.x + Math.cos(t) * L, e.y + Math.sin(t) * L, i % 2 ? DARKP[3] : DARKP[2], 1); } ctx.globalAlpha = 1; D(e.x, e.y, 6, DARKP[1]); D(e.x, e.y, 3, DARKP[3]); ringsOut(e, a, [DARKP[3]], 1, 28, 0, .35); };
IMP['Pulso Umbrío'] = (e, a) => { const p = FXP.siniestro; for(let k = 0; k < 2; k++){ const u = (a - k * .08) / .4; if(u <= 0 || u >= 1) continue; ctx.globalAlpha = 1 - u; Rg(e.x, e.y, 6 + 38 * ease(u), '#9a6fd0', undefined, 2); } ctx.globalAlpha = 1; flashDisc(e, a, ['#000000', '#08060d', '#1c0f3a', '#4d3b5e', '#9a6fd0'], 3, 14, .12); once(e, () => fxBurst(e.x, e.y, ['#4d3b5e', '#9a6fd0', '#e6d4ff'], 10, 110, undefined, 6.3, {life:.45})); };
IMP['Pulso Dragón'] = (e, a) => { const p = FXP.dragon; for(let k = 0; k < 3; k++){ const u = (a - k * .07) / .4; if(u <= 0 || u >= 1) continue; ctx.globalAlpha = 1 - u; Rg(e.x, e.y, 5 + 38 * ease(u), k % 2 ? p[3] : p[2], undefined, 2); } ctx.globalAlpha = 1; flashDisc(e, a, p, 3, 14, .12); Star(e.x, e.y, 6, 4, 14 + a * 30, p[3], 1); once(e, () => fxBurst(e.x, e.y, [p[2], p[3], '#ffffff'], 10, 120, undefined, 6.3, {life:.4})); };
IMP['Hidropulso'] = (e, a) => { const p = FXP.agua; for(let k = 0; k < 3; k++){ const u = (a - k * .08) / .45; if(u <= 0 || u >= 1) continue; ctx.globalAlpha = 1 - u; Rg(e.x, e.y + 4, 5 + 34 * ease(u), k % 2 ? '#ffffff' : p[3], (5 + 34 * ease(u)) * .6, 2); } ctx.globalAlpha = 1; once(e, () => crown(e, [p[2], p[3], '#ffffff'], 10, 110, 100)); };
IMP['Confusión'] = (e, a) => { const p = FXP.psiquico; ringsOut(e, a, [p[2], p[3]], 3, 26, 0, .45, .8); for(let i = 0; i < 4; i++){ const t = a * 8 + i * 1.57; Star(e.x + Math.cos(t) * 18, e.y - 14 + Math.sin(t) * 6, 4, 0, 4, i % 2 ? '#ffe066' : '#ffffff', 1); } };
IMP['Psicorrayo'] = (e, a) => { const p = FXP.psiquico; flashDisc(e, a, p, 4, 16, .14); ringsOut(e, a, ['#ff5fb0', '#ffe066', '#7de3ff'], 3, 38, 0, .45, .8); };
IMP['Voz Cautivadora'] = (e, a) => { const p = FXP.hada; ringsOut(e, a, [p[2], p[3]], 2, 28, 0, .4); ctx.globalAlpha = fade(a, .3, .3); for(let i = 0; i < 4; i++){ const t = (a * 1.2 + i * .25) % 1; heart(e.x + (i - 1.5) * 12, e.y - 6 - t * 34, 1, p); } ctx.globalAlpha = 1; };
IMP['Viento Feérico'] = (e, a) => { const p = FXP.hada; ctx.globalAlpha = fade(a, .3, .3); for(let i = 0; i < 12; i++){ const t = a * 6 + i * .52, r = 6 + i * 2.4 * (a + .4); R(e.x + Math.cos(t) * r, e.y + Math.sin(t) * r * .7, 1 + (i % 4 === 0), 1 + (i % 4 === 0), i % 3 ? p[3] : '#ffffff'); if(i % 4 === 0) Star(e.x + Math.cos(t) * r, e.y + Math.sin(t) * r * .7, 4, 0, 3, p[2], 1); } ctx.globalAlpha = 1; };
IMP['Bomba Imán'] = (e, a) => { const p = FXP.acero; flashDisc(e, a, p, 3, 13, .1); ringsOut(e, a, [p[3]], 1, 24, 0, .3); const k = Math.floor(a * 30); if(a < .3) for(let i = 0; i < 4; i++){ const t = HH(k, i) * 6.28; bolt(e.x, e.y, e.x + Math.cos(t) * 24, e.y + Math.sin(t) * 24, k + i, FXP.electrico, 0, 4, 5); } };
IMP['Tajo Aéreo'] = (e, a) => { const p = FXP.volador; slashMarks(e.x, e.y, a, {n:2, len:44, ang:-.9, gap:12, curve:8, cols:[p[0], p[3], '#ffffff'], w:2}); once(e, () => fxBurst(e.x, e.y, ['#ffffff', p[3]], 8, 120, undefined, 6.3, {life:.35})); };
IMP['Tornado'] = (e, a) => { const p = FXP.volador, al = fade(a, .4, .2); ctx.globalAlpha = al; for(let k = 0; k < 7; k++){ const y = e.y + 14 - k * 6, w = 4 + k * 2.2, x = e.x + Math.sin(a * 12 + k) * 2 * PXS; Rg(x, y, w, k % 2 ? p[3] : '#ffffff', w * .3, 1); } ctx.globalAlpha = 1; };
IMP['Zumbido'] = (e, a) => { const p = FXP.bicho; for(let k = 0; k < 3; k++){ const u = (a - k * .07) / .35; if(u <= 0 || u >= 1) continue; ctx.globalAlpha = 1 - u; Rg(e.x, e.y, 5 + 28 * ease(u), k % 2 ? '#ffe066' : p[2], undefined, 2); } ctx.globalAlpha = 1; hitStar(e.x, e.y, a, p, .6); };
IMP['Pin Misil'] = (e, a) => { hitStar(e.x, e.y, a, FXP.bicho, .8); ctx.globalAlpha = fade(a, .15, .2); for(let i = 0; i < 3; i++){ const x = e.x + (i - 1) * 12, y = e.y - 10 + (i % 2) * 8; Ln(x - 6, y - 6, x + 6, y + 6, '#2a3d08', 2); Ln(x - 5, y - 5, x + 5, y + 5, '#e8f8c0', 1); } ctx.globalAlpha = 1; };
IMP['Picotazo Veneno'] = (e, a) => { const p = FXP.veneno; ctx.globalAlpha = fade(a, .2, .25); for(let i = 0; i < 3; i++){ const x = e.x + (i - 1) * 11, y = e.y - 12; Ln(x, y - 8, x, y + 12, p[0], 3); Ln(x, y - 7, x, y + 11, p[3], 1); } ctx.globalAlpha = 1; hitStar(e.x, e.y, a, p, .6); once(e, () => crown(e, p.slice(2), 6, 70, 60)); };
IMP['Bomba Lodo'] = (e, a) => { const al = fade(a, .5, .25); ctx.globalAlpha = al; const gr = ease(clamp01(a / .15)); D(e.x, e.y + 6, Math.round(11 * gr), SLUDGE[0]); D(e.x, e.y + 6, Math.round(9 * gr), SLUDGE[1]); D(e.x - 1, e.y + 5, Math.round(6 * gr), SLUDGE[2]); ctx.globalAlpha = 1; once(e, () => crown(e, [SLUDGE[2], SLUDGE[3], SLUDGE[1]], 12, 130, 110, {life:.6, s:2})); };
IMP['Disparo Lodo'] = (e, a) => { ctx.globalAlpha = fade(a, .4, .2); const gr = ease(clamp01(a / .15)); D(e.x, e.y + 6, Math.round(10 * gr), MUD[1]); D(e.x - 1, e.y + 5, Math.round(7 * gr), MUD[2]); ctx.globalAlpha = 1; once(e, () => crown(e, [MUD[2], MUD[3], MUD[4], MUD[1]], 12, 120, 110, {life:.6, grav:2, s:2})); };
IMP['Lanzarrocas'] = (e, a) => { const p = FXP.roca; hitStar(e.x, e.y, a, p, .8); once(e, () => crown(e, [p[1], p[2], p[3], p[4]], 10, 130, 110, {grav:2.2})); };
IMP['Dragoaliento'] = (e, a) => { const p = FXP.dragon; if(a < .5) for(let i = 0; i < 9; i++){ const v = HH(i, 1), u = clamp01(a / .5 + v * .2); puff(e.x + (HH(i, 2) - .5) * 32, e.y + 6 - a * 55 * (.4 + v), Math.round(2 + (1 - u) * 4), u, [p[0], p[1], '#7a3cff', p[3], p[4]]); } ringsOut(e, a, [p[3]], 1, 24, 0, .35); };

// ===================== MEJORAS (hueco 3): animación sobre el propio Pokémon =====================
// Cada "tipo de mejora" se dibuja igual en la explosión inicial (0.9 s) y como aura (5 s).
const BUFFK = {};
const spin = (t, i, n, sp = 1) => t * sp + i * 6.283 / n;
BUFFK.glint = (f, b, t, p) => {                                          // Afilar: brillos metálicos que barren el cuerpo
  const u = (t * 1.6) % 1, x = f.x - b.hw + u * b.hw * 2; Poly([[x - 2, b.top], [x + 6, b.top], [x + 2, b.foot], [x - 6, b.foot]], '#ffffff');
  for(let i = 0; i < 4; i++){ const k = Math.floor(t * 5) + i; Spark(f.x + (HH(k, 1) - .5) * b.hw * 2, b.top + HH(k, 2) * (b.foot - b.top), 2 + (k % 2), i % 2 ? '#ffffff' : p[3]); } };
BUFFK.swords = (f, b, t, p) => {                                         // Danza Espada: espadas girando alrededor
  const cy = (b.top + b.foot) / 2; for(let i = 0; i < 6; i++){ const th = spin(t, i, 6, 3), x = f.x + Math.cos(th) * (b.hw + 16), y = cy + Math.sin(th) * 16 - 4 + Math.sin(t * 4 + i) * 3;
    PolyO([[x - 2, y - 16], [x + 2, y - 16], [x + 3, y + 4], [x - 3, y + 4]], '#e3ebf5', '#2a3340'); Poly([[x - 1, y - 14], [x, y - 14], [x, y + 2], [x - 1, y + 2]], '#ffffff'); R(x - 6, y + 4, 6, 2, '#ffcc33'); R(x - 1, y + 6, 2, 4, '#a8381a'); } };
BUFFK.sun = (f, b, t, p) => {                                            // Día Soleado: rayos de sol desde arriba
  ctx.globalAlpha *= .26; for(let i = 0; i < 5; i++){ const x = f.x + (i - 2) * 22, w = 6 + (i % 2) * 4, pulse = .6 + .4 * Math.sin(t * 4 + i); Poly([[x - w * .4, b.top - 110], [x + w * .4, b.top - 110], [x + w * pulse * 1.6, b.foot], [x - w * pulse * 1.6, b.foot]], i % 2 ? '#fff27a' : '#ffd91f'); }
  ctx.globalAlpha /= .26; Rg(f.x, b.foot, 30 + Math.sin(t * 5) * 3, '#ffd91f', 10, 2); for(let i = 0; i < 6; i++){ const u = (t * .8 + i * .17) % 1; R(f.x + (HH(i, 1) - .5) * 70, b.top - 20 + u * (b.foot - b.top + 20), 1, 1, '#ffffff'); } D(f.x, b.top - 26, 6, '#ffd91f'); Star(f.x, b.top - 26, 8, 8, 14 + Math.sin(t * 8) * 2, '#fff27a', 1); };
BUFFK.speed = (f, b, t, p) => {                                          // Agilidad: líneas de velocidad
  for(let i = 0; i < 8; i++){ const u = (t * 2.4 + i * .13) % 1, y = b.top + (i * 7 % (b.foot - b.top)), x = f.x + b.hw + 10 - u * (b.hw * 2 + 70); ctx.globalAlpha *= (1 - u); Ln(x, y, x + 22 + (i % 3) * 6, y, i % 2 ? '#ffffff' : '#bfe8ff', 1); ctx.globalAlpha /= (1 - u + 1e-6); } };
BUFFK.rain = (f, b, t, p) => {                                           // Danza Lluvia: gotas y ondas
  for(let i = 0; i < 18; i++){ const u = (t * 1.6 + i * .077) % 1, x = f.x + (HH(i, 3) - .5) * 130, y = b.top - 90 + u * (b.foot - b.top + 90); Ln(x, y, x - 2, y + 6, '#3fa0ff', 1); R(x - 2, y + 6, 1, 1, '#9be0ff'); }
  for(let k = 0; k < 2; k++){ const u = (t * 1.3 + k * .5) % 1; ctx.globalAlpha *= (1 - u); Rg(f.x + (k ? 18 : -22), b.foot, 3 + u * 14, '#9be0ff', (3 + u * 14) * .4, 1); ctx.globalAlpha /= (1 - u + 1e-6); } };
BUFFK.shell = (f, b, t, p) => {                                          // Refugio: caparazón brillante
  const cy = (b.top + b.foot) / 2, rx = b.hw + 8, ry = (b.foot - b.top) / 2 + 6; ctx.globalAlpha *= .22; Poly(Array.from({length:24}, (_, i) => [f.x + Math.cos(i / 24 * 6.28) * rx, cy + Math.sin(i / 24 * 6.28) * ry]), '#9be0ff'); ctx.globalAlpha /= .22;
  Rg(f.x, cy, rx / PXS, '#1f64d6', ry / PXS, 2); Rg(f.x, cy, rx / PXS - 1, '#9be0ff', ry / PXS - 1, 1); const a = t * 3 % 6.28; Arc(f.x, cy, rx / PXS - 3, a, a + 1, '#ffffff', 2); Spark(f.x - rx * .5, cy - ry * .5, 3, '#ffffff'); };
BUFFK.sprout = (f, b, t, p) => {                                         // Desarrollo: crece, anillos verdes
  for(let k = 0; k < 2; k++){ const u = (t * 1.1 + k * .5) % 1; ctx.globalAlpha *= (1 - u); Rg(f.x, b.foot, 8 + u * 30, '#5cd04a', (8 + u * 30) * .35, 2); ctx.globalAlpha /= (1 - u + 1e-6); }
  for(let i = 0; i < 5; i++){ const u = (t * .9 + i * .2) % 1, x = f.x + (i - 2) * 16, y = b.foot - u * (b.foot - b.top) * 1.1; PolyO(rotp(x, y, -.8 + (i % 2) * 1.6, [[-5, 0], [0, -3], [5, 0], [0, 3]]), '#b5f07a', '#0f3d17'); }
  const u = (t * 1.2) % 1; Poly([[f.x - 5, b.top - 4 - u * 12], [f.x, b.top - 14 - u * 12], [f.x + 5, b.top - 4 - u * 12], [f.x + 2, b.top - 4 - u * 12], [f.x + 2, b.top + 4], [f.x - 2, b.top + 4], [f.x - 2, b.top - 4 - u * 12]], '#b5f07a'); };
BUFFK.charge = (f, b, t, p) => {                                         // Carga: chispas girando
  const cy = (b.top + b.foot) / 2, k = Math.floor(t * 25); for(let i = 0; i < 4; i++){ const th = spin(t, i, 4, 5), x = f.x + Math.cos(th) * (b.hw + 8), y = cy + Math.sin(th) * (b.foot - b.top) / 2.4; Spark(x, y, 3, '#fff27a'); D(x, y, 1, '#ffffff');
    const th2 = spin(t, i + 1, 4, 5); bolt(x, y, f.x + Math.cos(th2) * (b.hw + 8), cy + Math.sin(th2) * (b.foot - b.top) / 2.4, k + i, FXP.electrico, 0, 4, 6); } };
BUFFK.mist = (f, b, t, p) => {                                           // Neblina: bruma blanca alrededor de los pies
  for(let i = 0; i < 10; i++){ const th = spin(t, i, 10, .9), x = f.x + Math.cos(th) * (b.hw + 14), y = b.foot - 2 + Math.sin(th) * 10 - (i % 3) * 5; ctx.globalAlpha *= .4; D(x, y, 4 + (i % 3), i % 2 ? '#eaf8ff' : '#bfe8ff'); ctx.globalAlpha /= .4; }
  for(let i = 0; i < 4; i++){ const u = (t * .6 + i * .25) % 1; ctx.globalAlpha *= .5 * (1 - u); D(f.x + Math.sin(i * 2 + t) * b.hw, b.foot - u * 30, 3, '#ffffff'); ctx.globalAlpha /= (.5 * (1 - u) + 1e-6); } };
BUFFK.bulk = (f, b, t, p) => {                                           // Corpulencia: pulsos naranjas y flechas hacia arriba
  const u = (t * 1.5) % 1; ctx.globalAlpha *= (1 - u); Rg(f.x, b.foot, 10 + u * 34, '#f2a35e', (10 + u * 34) * .35, 3); ctx.globalAlpha /= (1 - u + 1e-6);
  for(let i = 0; i < 3; i++){ const v = (t * 1.2 + i * .33) % 1, x = f.x + (i - 1) * 22, y = b.foot - v * (b.foot - b.top + 14); ctx.globalAlpha *= (1 - v * .8); Poly([[x, y - 8], [x + 7, y], [x + 3, y], [x + 3, y + 8], [x - 3, y + 8], [x - 3, y], [x - 7, y]], '#ff7a3a'); Poly([[x, y - 5], [x + 4, y - 1], [x - 4, y - 1]], '#ffe8c0'); ctx.globalAlpha /= (1 - v * .8 + 1e-6); } };
BUFFK.acid = (f, b, t, p) => {                                           // Armadura Ácida: gotas moradas resbalando
  for(let i = 0; i < 7; i++){ const x = f.x + (i - 3) * b.hw / 3, u = (t * .8 + i * .21) % 1, y = b.top + u * (b.foot - b.top); PolyO([[x, y - 5], [x + 3, y], [x, y + 3], [x - 3, y]], '#b85ee8', '#3a0f52'); R(x - 1, y - 1, 1, 1, '#ffffff'); }
  for(let i = 0; i < 4; i++){ const th = spin(t, i, 4, 1.4); Rg(f.x + Math.cos(th) * (b.hw + 8), (b.top + b.foot) / 2 + Math.sin(th) * 18, 3, '#e3a8ff', undefined, 1); } };
BUFFK.sand = (f, b, t, p) => {                                           // Tormenta de Arena: remolino de arena
  for(let i = 0; i < 40; i++){ const th = spin(t, i, 40, 3) * (1 + (i % 3) * .2), r = b.hw + 8 + (i % 4) * 7, u = i / 40, x = f.x + Math.cos(th) * r, y = b.foot - u * (b.foot - b.top) + Math.sin(th) * r * .35; R(x, y, 1 + (i % 5 === 0), 1 + (i % 5 === 0), i % 3 ? '#c28a3c' : i % 3 === 1 ? '#e8c27a' : '#8a5a24'); } };
BUFFK.wind = (f, b, t, p) => {                                           // Viento Afín: arcos de viento
  for(let i = 0; i < 4; i++){ const u = (t * 1.3 + i * .25) % 1, y = b.top + 8 + i * (b.foot - b.top) / 4, x = f.x + b.hw + 20 - u * (b.hw * 2 + 50); ctx.globalAlpha *= Math.sin(u * 3.14); Arc(x, y, 9, 3.4, 6.0, '#e0ecff', 1); Ln(x - 20, y + 9, x + 4, y + 9, '#b6ccf2', 1); ctx.globalAlpha /= (Math.sin(u * 3.14) + 1e-6); } };
BUFFK.calm = (f, b, t, p) => {                                           // Paz Mental: ondas rosas y brillos tranquilos
  for(let k = 0; k < 3; k++){ const u = (t * .9 + k * .33) % 1; ctx.globalAlpha *= (1 - u); Rg(f.x, (b.top + b.foot) / 2, b.hw + u * 24, k % 2 ? '#7de3ff' : '#ff5fb0', (b.foot - b.top) / 2 / PXS + u * 14, 1); ctx.globalAlpha /= (1 - u + 1e-6); }
  for(let i = 0; i < 5; i++){ const u = (t * .5 + i * .2) % 1; Spark(f.x + Math.sin(i * 3 + t) * b.hw, b.foot - u * (b.foot - b.top + 20), 2, i % 2 ? '#ffffff' : '#ffa8d8'); } };
BUFFK.amnesia = (f, b, t, p) => {                                        // Amnesia: espiral sobre la cabeza
  for(let i = 0; i < 18; i++){ const th = i * .55 + t * 6, r = 1 + i * .55; R(f.x + Math.cos(th) * r * PXS, b.top - 18 + Math.sin(th) * r * PXS * .45, 1 + (i > 12), 1 + (i > 12), i % 2 ? '#ffa8d8' : '#ff5fb0'); }
  for(let i = 0; i < 4; i++){ const th = spin(t, i, 4, 2); Spark(f.x + Math.cos(th) * (b.hw + 4), (b.top + b.foot) / 2 + Math.sin(th) * 14, 2, '#ffe066'); } };
BUFFK.quiver = (f, b, t, p) => {                                         // Danza Aleteo: alas brillantes y destellos
  const fl = 1 + Math.sin(t * 12) * .15, cy = (b.top + b.foot) / 2; ctx.globalAlpha *= .8;
  for(const sd of [-1, 1]){ const x = f.x + sd * (b.hw * .5 + 2), pts = [[0, 6], [sd * 24 * fl, -4], [sd * 36 * fl, -30 * fl], [sd * 22 * fl, -26 * fl], [sd * 8, -10]].map(([a, c]) => [x + a, cy + c]);
    PolyO(pts, '#b5f07a', '#2a3d08'); Poly([[x + sd * 4, cy - 2], [x + sd * 22 * fl, -22 * fl + cy], [x + sd * 14, cy - 8]], '#f4ffd0');
    PolyO([[x, cy + 8], [x + sd * 22 * fl, cy + 4], [x + sd * 28 * fl, cy + 18], [x + sd * 8, cy + 14]], '#9fd42a', '#2a3d08'); }
  ctx.globalAlpha /= .8; for(let i = 0; i < 6; i++){ const th = spin(t, i, 6, 2.5); Spark(f.x + Math.cos(th) * (b.hw + 20), cy + Math.sin(th) * 20, 2, ['#ff9ee0', '#7de3ff', '#ffe066', '#b5f07a', '#ffffff', '#ffa8d8'][i]); } };
BUFFK.polish = (f, b, t, p) => {                                         // Pulimento: destellos de pulido
  const u = (t * 1.5) % 1, y = b.top + u * (b.foot - b.top); Ln(f.x - b.hw, y + 8, f.x + b.hw, y - 8, '#fff3d0', 2);
  for(let i = 0; i < 6; i++){ const k = Math.floor(t * 6) + i; Star(f.x + (HH(k, 1) - .5) * b.hw * 2, b.top + HH(k, 2) * (b.foot - b.top), 4, 0, 3 + k % 3, i % 2 ? '#ffffff' : '#e8c27a', 1); } };
BUFFK.curse = (f, b, t, p) => {                                          // Maldición: llamas moradas girando
  for(let i = 0; i < 6; i++){ const th = spin(t, i, 6, 2.2), x = f.x + Math.cos(th) * (b.hw + 12), y = (b.top + b.foot) / 2 + Math.sin(th) * 20 - Math.abs(Math.sin(t * 6 + i)) * 4; puff(x, y, 4, .3 + (i % 2) * .3, FXP.fantasma); }
  Rg(f.x, b.foot, 20 + Math.sin(t * 4) * 3, '#5b3a96', 8, 2); };
BUFFK.dragonDance = (f, b, t, p) => {                                    // Danza Dragón: doble hélice azul
  for(let i = 0; i < 30; i++){ const u = i / 30, ph = t * 5 + u * 10, y = b.foot - u * (b.foot - b.top + 10); for(const s of [0, Math.PI]) R(f.x + Math.cos(ph + s) * (b.hw + 8), y, 1 + (i % 4 === 0), 1 + (i % 4 === 0), i % 2 ? '#7de3ff' : '#5f6bff'); }
  Rg(f.x, b.foot, 22 + Math.sin(t * 6) * 2, '#3b3fd1', 8, 2); };
BUFFK.scheme = (f, b, t, p) => {                                         // Maquinación: llamas oscuras + ojos
  for(let i = 0; i < 8; i++){ const u = (t * 1.2 + HH(i, 7)) % 1, x = f.x + (i - 3.5) * b.hw / 3.5, y = b.foot - u * (b.foot - b.top + 14); puff(x, y, 3, u, ['#08060d', '#1c0f3a', '#3a2470', '#8b64d0', '#f2eaff']); }
  const y = b.top - 12; Poly([[f.x - 12, y - 2], [f.x - 4, y + 2], [f.x - 4, y + 5], [f.x - 12, y + 3]], '#ff3a5a'); Poly([[f.x + 12, y - 2], [f.x + 4, y + 2], [f.x + 4, y + 5], [f.x + 12, y + 3]], '#ff3a5a'); };
BUFFK.iron = (f, b, t, p) => {                                           // Defensa Férrea: placas metálicas brillantes
  const cy = (b.top + b.foot) / 2; for(let i = 0; i < 6; i++){ const th = spin(t, i, 6, 1.5), x = f.x + Math.cos(th) * (b.hw + 10), y = cy + Math.sin(th) * (b.foot - b.top) / 2.6; PolyO([[x, y - 8], [x + 6, y], [x, y + 8], [x - 6, y]], '#b3bfcf', '#2a3340'); Poly([[x - 1, y - 5], [x + 2, y - 1], [x - 1, y + 1], [x - 3, y - 2]], '#ffffff'); }
  const u = (t * 1.3) % 1; Poly([[f.x - b.hw + u * b.hw * 2 - 2, b.top], [f.x - b.hw + u * b.hw * 2 + 4, b.top], [f.x - b.hw + u * b.hw * 2 + 1, b.foot], [f.x - b.hw + u * b.hw * 2 - 5, b.foot]], '#ffffff'); };
BUFFK.fieldMist = (f, b, t, p) => {                                      // Campo Neblinoso: neblina rosa en el suelo
  ctx.globalAlpha *= .2; D(f.x, b.foot - 4, 34, '#ffd6f4'); D(f.x, b.foot - 4, 24, '#ffe9fa'); ctx.globalAlpha /= .2; Rg(f.x, b.foot, 40, '#ff9ee0', 14, 2);
  for(let i = 0; i < 8; i++){ const u = (t * .5 + i * .125) % 1; Spark(f.x + (HH(i, 1) - .5) * 80, b.foot - u * 40, 2, i % 2 ? '#ffffff' : '#ff9ee0'); } };
BUFFK._ = (f, b, t, p) => {
  Rg(f.x, b.foot, 22 + Math.sin(t * 5) * 2, p[2], 8, 2); for(let i = 0; i < 5; i++){ const u = (t * .9 + i * .2) % 1; Spark(f.x + Math.sin(i * 2.4) * b.hw, b.foot - u * (b.foot - b.top + 14), 2, i % 2 ? p[3] : '#ffffff'); } };
const BUFFMAP = {
  'Afilar':'glint', 'Danza Espada':'swords', 'Día Soleado':'sun', 'Agilidad':'speed', 'Danza Lluvia':'rain', 'Refugio':'shell', 'Desarrollo':'sprout', 'Carga':'charge', 'Neblina':'mist', 'Corpulencia':'bulk',
  'Armadura Ácida':'acid', 'Tormenta de Arena':'sand', 'Viento Afín':'wind', 'Paz Mental':'calm', 'Amnesia':'amnesia', 'Danza Aleteo':'quiver', 'Pulimento':'polish', 'Maldición':'curse', 'Danza Dragón':'dragonDance',
  'Maquinación':'scheme', 'Defensa Férrea':'iron', 'Campo Neblinoso':'fieldMist'
};
const BUFFPAL = {Afilar:FXP.normal, Agilidad:FXP.psiquico, 'Día Soleado':FXP.fuego, Carga:FXP.electrico, Neblina:FXP.hielo};
for(const n in BUFFMAP){
  const fn = BUFFK[BUFFMAP[n]];
  FXR.aura[n] = (f, I, t, type, k) => { const b = bodyOf(f); ctx.save(); ctx.globalAlpha = .55 + .45 * k; fn(f, b, t, BUFFPAL[n] || fxPal(type)); ctx.restore(); };
  FXR.buff[n] = (e, a, type) => { const f = e.fol, b = bodyOf(f), u = clamp01(a / .9); ctx.globalAlpha = 1 - u * u; fn(f, b, g.t, BUFFPAL[n] || fxPal(type)); ctx.globalAlpha = (1 - u) * .8; Rg(f.x, b.foot, 8 + 46 * ease(u), fxPal(type)[3], (8 + 46 * ease(u)) * .35, 2); ctx.globalAlpha = 1; };
}
FXR.aura._ = (f, I, t, type, k) => { const b = bodyOf(f); ctx.save(); ctx.globalAlpha = .55 + .45 * k; BUFFK._(f, b, t, fxPal(type)); ctx.restore(); };
FXR.buff._ = (e, a, type) => { const f = e.fol, b = bodyOf(f), u = clamp01(a / .9); ctx.globalAlpha = 1 - u * u; BUFFK._(f, b, g.t, fxPal(type)); ctx.globalAlpha = (1 - u) * .8; Rg(f.x, b.foot, 8 + 46 * ease(u), fxPal(type)[3], (8 + 46 * ease(u)) * .35, 2); ctx.globalAlpha = 1; };