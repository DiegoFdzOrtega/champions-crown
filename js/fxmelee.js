"use strict";
/* =====================================================================
   Ataques cuerpo a cuerpo (hueco 1). Cada movimiento real tiene su propia animación.
   Se dibujan sobre el rival (e.x, e.y) y miran hacia e.ang. Algunos hacen que el atacante se lance hacia delante (FXC.lg).
   ===================================================================== */
const MEL = FXR.melee, dist2 = (f, T) => Math.hypot(T.x - f.x, T.y - f.y);
const lungeTo = (max, gap = 34) => (f, T) => Math.max(20, Math.min(max, dist2(f, T) - gap));

// ---- mandíbulas (Mordisco y Colmillos) ----
function jaws(e, a, o){
  const u = ease(clamp01(a / .17)), gap = lerp(34, 3, u), al = fade(a, .3, .12);
  if(al > 0){
    ctx.globalAlpha = al;
    for(const sd of [-1, 1]){
      const yb = e.y + sd * gap;
      R(e.x - 32, sd < 0 ? yb - 10 : yb, 32, 5, o.gum);
      for(let k = 0; k < 5; k++){ const cx = e.x + (k - 2) * 12, h = k === 2 ? 20 : k % 2 ? 14 : 17; PolyO([[cx - 6, yb], [cx + 6, yb], [cx, yb - sd * h]], o.tooth, o.edge); }
    }
    ctx.globalAlpha = 1;
  }
  if(o.extra) o.extra(e, a, u);
  if(a >= .17){ once(e, () => {}); hitStar(e.x, e.y, a, o.pal, .8, .17); if(!e.bit){ e.bit = 1; fxBurst(e.x, e.y, o.parts, 9, 130, undefined, 6.3, {life:.4}); } }
}
const JAW = {
  'Mordisco':   {pal:FXP.siniestro, gum:'#241338', tooth:'#f2eaff', edge:'#120a20', parts:['#4d3b5e', '#9a6fd0', '#e6d4ff', '#2b2236']},
  'Colmillo Ígneo': {pal:FXP.fuego, gum:'#7a1c0a', tooth:'#fff7d0', edge:'#5a1408', parts:FXP.fuego.slice(1), extra(e, a){
      if(a < .45) for(let i = 0; i < 9; i++){ const v = HH(i, 1); puff(e.x + (HH(i, 2) - .5) * 80, e.y + (HH(i, 3) - .5) * 36 - a * 50 * (.4 + v), 3 + (v * 3 | 0), clamp01(a / .45 + v * .3), FXP.fuego); } }},
  'Colmillo Rayo': {pal:FXP.electrico, gum:'#5a4300', tooth:'#fffbe0', edge:'#5a4300', parts:FXP.electrico.slice(1), extra(e, a, u){
      if(u > .6 && a < .4) for(let k = 0; k < 2; k++) bolt(e.x - 40, e.y - 8 + k * 16, e.x + 40, e.y + 8 - k * 16, Math.floor(a * 35) + k * 7, FXP.electrico, 1, 5); }},
  'Colmillo Hielo': {pal:FXP.hielo, gum:'#1a4670', tooth:'#f2fcff', edge:'#1a4670', parts:FXP.hielo.slice(1), extra(e, a, u){
      if(a > .12 && a < .5){ const al = fade(a, .3, .2); ctx.globalAlpha = al; for(let i = 0; i < 7; i++){ const an = i * .9 + .3, d = 14 + (a - .12) * 120 * (.6 + HH(i)), s = 5 + HH(i, 2) * 4; PolyO(rotp(e.x + Math.cos(an) * d, e.y + Math.sin(an) * d, an, [[0, -s], [2.5, 0], [0, s], [-2.5, 0]].map(([x, y]) => [y, x])), FXP.hielo[3], FXP.hielo[1]); } ctx.globalAlpha = 1; } }}
};
for(const k in JAW){ const o = JAW[k]; MEL[k] = (e, a) => jaws(e, a, o); FXC[k] = {dur:.5, lg:lungeTo(34, 46), lgd:.24}; }

// ---- Placaje: el atacante embiste; estrella blanca de golpe ----
MEL['Placaje'] = (e, a) => {
  const f = e.fol, an = e.ang, al = fade(a, .08, .14);
  if(a < .22){                                                   // líneas de velocidad detrás del atacante
    ctx.globalAlpha = 1 - a / .26;
    for(let k = -2; k <= 2; k++){ const [x0, y0] = aim({x:f.x, y:f.y, ang:an}, -14 - Math.abs(k) * 6, k * 11), [x1, y1] = aim({x:f.x, y:f.y, ang:an}, -50 - HH(k) * 24, k * 11); Ln(x0, y0, x1, y1, k === 0 ? '#ffffff' : '#d0d0d8', 1); }
    ctx.globalAlpha = 1;
  }
  hitStar(e.x, e.y, a, FXP.normal, 1, .1);
  once(e, () => {}); if(a > .1 && !e.bit){ e.bit = 1; fxBurst(e.x, e.y, ['#ffffff', '#d0d0d8', '#f0f0f4'], 8, 120, undefined, 6.3, {life:.3}); }
};
FXC['Placaje'] = {dur:.42, lg:lungeTo(64, 36), lgd:.24};

// ---- Ataque Rápido: estela blanca + imágenes fantasma ----
MEL['Ataque Rápido'] = (e, a) => {
  const f = e.fol, d = e.lgD || (e.lgD = f.lg ? f.lg.d : 60), an = e.ang, lu = .26;
  if(a < lu + .2){
    for(let k = 1; k <= 4; k++){ const u = (a - k * .035) / lu; if(u <= 0 || u >= 1) continue; const s = Math.sin(Math.PI * u) * d; ghostOf(f, f.x + Math.cos(an) * s, f.y + Math.sin(an) * s, .3 - k * .05); }
    ctx.globalAlpha = fade(a, .15, .18);
    for(let k = -2; k <= 2; k++){ const b = {x:e.ox, y:e.oy, ang:an}, [x0, y0] = aim(b, 6, k * 10), [x1, y1] = aim(b, d * (.5 + .5 * clamp01(a / .13)), k * 10); Ln(x0, y0, x1, y1, k % 2 ? '#bfe8ff' : '#ffffff', 1); }
    ctx.globalAlpha = 1;
  }
  hitStar(e.x, e.y, a, FXP.normal, .75, .12);
};
FXC['Ataque Rápido'] = {dur:.5, lg:lungeTo(120, 34), lgd:.26};

// ---- Arañazo: tres marcas blancas ----
MEL['Arañazo'] = (e, a) => { slashMarks(e.x, e.y - 4, a, {n:3, len:66, ang:.95, gap:14, w:3, hold:.26, cols:['#3b3b44', '#e8e8f0', '#ffffff']}); once(e, () => fxBurst(e.x, e.y, ['#ffffff', '#d0d0d8'], 6, 90, undefined, 6.3, {life:.3, s:1})); };
FXC['Arañazo'] = {dur:.45, lg:lungeTo(26, 50), lgd:.2};

// ---- Garras ----
MEL['Garra Dragón'] = (e, a) => {
  slashMarks(e.x, e.y - 4, a, {n:3, len:60, ang:.8, gap:13, curve:12, w:3, cols:[FXP.dragon[0], FXP.dragon[2], '#f0ffff']});
  if(a > .1 && a < .5){ ctx.globalAlpha = fade(a, .22, .26) * .7; Rg(e.x, e.y, 9 + (a - .1) * 55, FXP.dragon[3], 7 + (a - .1) * 35, 1); Rg(e.x, e.y, 6 + (a - .1) * 40, FXP.dragon[2], 5 + (a - .1) * 25, 1); ctx.globalAlpha = 1; }
  once(e, () => fxBurst(e.x, e.y, [FXP.dragon[2], FXP.dragon[3], '#ffffff'], 8, 110, undefined, 6.3, {life:.4}));
};
FXC['Garra Dragón'] = {dur:.55, lg:lungeTo(30, 50), lgd:.22};
MEL['Garra Metal'] = (e, a) => {
  slashMarks(e.x, e.y - 4, a, {n:3, len:54, ang:.65, gap:12, w:2, cols:[FXP.acero[0], FXP.acero[2], '#ffffff']});
  if(a < .16){ ctx.globalAlpha = 1 - a / .16; const x = e.x - 34 + a / .16 * 68; Poly([[x - 4, e.y - 30], [x + 6, e.y - 30], [x + 2, e.y + 30], [x - 8, e.y + 30]], '#ffffff'); ctx.globalAlpha = 1; }
  once(e, () => fxBurst(e.x, e.y, ['#ffffff', '#ffe27a', FXP.acero[3]], 10, 150, undefined, 6.3, {life:.3, s:1}));
  if(a > .06) hitStar(e.x, e.y, a, FXP.acero, .6, .06);
};
FXC['Garra Metal'] = {dur:.45, lg:lungeTo(26, 50), lgd:.2};
MEL['Garra Umbría'] = (e, a) => {
  if(a < .46){ ctx.globalAlpha = fade(a, .15, .3) * .55; D(e.x, e.y, 15 + a * 14, '#1c0f3a'); D(e.x, e.y, 10 + a * 8, '#3a2470'); ctx.globalAlpha = 1; }
  slashMarks(e.x, e.y - 4, a, {n:3, len:62, ang:-.85, gap:13, curve:-13, w:3, hold:.24, fade:.2, cols:['#1c0f3a', '#5b3a96', '#f2eaff']});
  once(e, () => fxBurst(e.x, e.y, ['#5b3a96', '#8b64d0', '#c4a8f2'], 8, 80, undefined, 6.3, {life:.5, rise:.6}));
};
FXC['Garra Umbría'] = {dur:.6, lg:lungeTo(26, 50), lgd:.2};

// ---- Golpe Roca: puño + grietas + escombros ----
MEL['Golpe Roca'] = (e, a) => {
  const p = FXP.lucha, u = ease(clamp01(a / .1));
  if(a < .26){ const x = lerp(e.fol.x, e.x, u), y = lerp(e.fol.y, e.y - 4, u); ctx.globalAlpha = fade(a, .16, .1);
    R(x - 14, y - 11, 14, 11, p[0]); R(x - 12, y - 9, 12, 9, p[2]); R(x - 12, y - 9, 12, 3, p[3]);
    for(let k = 0; k < 4; k++) R(x - 12 + k * 6 + 1, y - 9, 1, 5, p[1]); R(x - 3, y - 2, 6, 4, p[1]); R(x - 15, y - 3, 3, 5, p[2]); ctx.globalAlpha = 1; }
  if(a >= .1){
    const v = ease(clamp01((a - .1) / .12)), al = fade(a, .4, .2); ctx.globalAlpha = al;
    for(let i = 0; i < 7; i++){ const an = i * .9 + .2 + HH(i) * .4, L = (16 + HH(i, 5) * 22) * v; let px = e.x, py = e.y + 8;
      for(let sg = 1; sg <= 3; sg++){ const nx = e.x + Math.cos(an) * L * sg / 3 + (HH(i, sg) - .5) * 8, ny = e.y + 8 + Math.sin(an) * L * .6 * sg / 3 + (HH(i, sg + 4) - .5) * 4; Ln(px, py, nx, ny, '#2b1a0c', 1); px = nx; py = ny; } }
    Rg(e.x, e.y + 8, 10 + v * 30, '#f2a35e', 5 + v * 14, 1); ctx.globalAlpha = 1;
    hitStar(e.x, e.y - 2, a, p, 1, .1);
    once(e, () => { for(let i = 0; i < 9; i++) fx.parts.push({x:e.x, y:e.y, vx:(Math.random() - .5) * 150, vy:-60 - Math.random() * 100, rise:0, grav:1.6, life:.7, max:.7, col:['#7a7058', '#b0a37a', '#d9cea4', '#3d2810'][i % 4], s:PXS * (1 + (i % 3 === 0)), drag:.97}); });
  }
};
FXC['Golpe Roca'] = {dur:.6, lg:lungeTo(40, 46), lgd:.22, shake:2};

// ---- Acua Cola: cola de agua que barre ----
MEL['Acua Cola'] = (e, a) => {
  const p = FXP.agua, pr = clamp01(a / .2), c = {x:(e.fol.x + e.x) / 2, y:(e.fol.y + e.y) / 2};
  const a0 = e.ang - 1.7, a1 = a0 + 3.4 * ease(pr), al = fade(a, .26, .2); ctx.globalAlpha = al;
  Arc(c.x, c.y, 34, a0, a1, p[0], 6); Arc(c.x, c.y, 34, a0, a1, p[2], 4); Arc(c.x, c.y, 33, a0, a1, p[3], 2);
  const n = 14; for(let i = 0; i < n; i++){ const an = a0 + (a1 - a0) * i / n; if(HH(i, Math.floor(a * 30)) > .55) R(c.x + Math.cos(an) * 41, c.y + Math.sin(an) * 41, 1, 1, '#ffffff'); }
  ctx.globalAlpha = 1; if(a > .1) hitStar(e.x, e.y, a, p, .8, .1);
  once(e, () => fxBurst(e.x, e.y, [p[2], p[3], '#ffffff'], 12, 130, e.ang, 3.2, {life:.5, grav:1}));
};
FXC['Acua Cola'] = {dur:.55, lg:lungeTo(30, 50), lgd:.24};

// ---- Látigo Cepa: dos lianas que azotan ----
MEL['Látigo Cepa'] = (e, a) => {
  const p = FXP.planta, f = e.fol;
  [-1, 1].forEach((sd, vi) => {
    const t0 = vi * .07, pr = ease(clamp01((a - t0) / .13)); if(pr <= 0) return; const al = fade(a - t0, .2, .15); ctx.globalAlpha = al;
    const x0 = f.x, y0 = f.y - 6, x2 = e.x + sd * 10, y2 = e.y, mx = (x0 + x2) / 2 - Math.sin(e.ang) * sd * 46, my = (y0 + y2) / 2 + Math.cos(e.ang) * sd * 46, n = Math.ceil(Math.hypot(x2 - x0, y2 - y0) / 4);
    for(let pass = 0; pass < 3; pass++) for(let i = 0; i <= n * pr; i++){ const u = i / n, x = (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * mx + u * u * x2, y = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * my + u * u * y2, w = pass === 0 ? 5 : pass === 1 ? 3 : 1; R(x - w * PXS / 2, y - w * PXS / 2, w, w, [p[0], p[2], p[3]][pass]); if(pass === 1 && i % 7 === 3) R(x + sd * 3, y - 3, 1, 2, p[3]); }
    const ux = pr, tx = (1 - ux) * (1 - ux) * x0 + 2 * ux * (1 - ux) * mx + ux * ux * x2, ty = (1 - ux) * (1 - ux) * y0 + 2 * ux * (1 - ux) * my + ux * ux * y2;
    PolyO(rotp(tx, ty, e.ang, [[8, 0], [0, -4], [-5, 0], [0, 4]]), p[3], p[0]);
    ctx.globalAlpha = 1;
  });
  hitStar(e.x, e.y, a, p, .9, .14);
  once(e, () => fxBurst(e.x, e.y, [p[2], p[3], p[4]], 7, 110, undefined, 6.3, {life:.45, grav:.6}));
};
FXC['Látigo Cepa'] = {dur:.5, lg:lungeTo(18, 60), lgd:.2};

// ---- Puya Nociva: pinchazo morado ----
MEL['Puya Nociva'] = (e, a) => {
  const p = FXP.veneno, u = ease(clamp01(a / .1)), f = e.fol, al = fade(a, .2, .16); ctx.globalAlpha = al;
  const tipX = lerp(f.x + Math.cos(e.ang) * 20, e.x, u), tipY = lerp(f.y + Math.sin(e.ang) * 20, e.y, u), L = Math.min(48, dist2({x:f.x, y:f.y}, {x:tipX, y:tipY}));
  PolyO(rotp(tipX, tipY, e.ang, [[0, 0], [-L * .8, -5], [-L, 0], [-L * .8, 5]]), p[3], p[0]);
  PolyO(rotp(tipX, tipY, e.ang, [[0, 0], [-L * .5, -2], [-L * .55, 2]]), p[4], p[2]);
  D(tipX - Math.cos(e.ang) * 20, tipY - Math.sin(e.ang) * 20, 7, p[2]); ctx.globalAlpha = 1;
  if(a > .1){ hitStar(e.x, e.y, a, p, .9, .1); once(e, () => { for(let i = 0; i < 8; i++) fx.parts.push({x:e.x, y:e.y, vx:(Math.random() - .5) * 110, vy:-30 - Math.random() * 70, rise:0, grav:1.8, life:.6, max:.6, col:p[2 + (i % 3)], s:PXS * 2, drag:.96}); }); }
};
FXC['Puya Nociva'] = {dur:.5, lg:lungeTo(40, 46), lgd:.18};

// ---- Excavar: se esconde, avanza bajo tierra y sale con tierra ----
MEL['Excavar'] = (e, a) => {
  const f = e.fol, p = FXP.tierra, I = idleInfo(f.m.dex), fy = f.y + I.foot * ESCALA - 4;
  if(a < .26){                                                    // agujero y tierra levantada donde estaba
    ctx.globalAlpha = fade(a, .16, .1); D(f.x, fy, 14, p[0]); D(f.x, fy, 11, '#2a1a08'); Rg(f.x, fy, 15, p[2], 6, 2); ctx.globalAlpha = 1;
    once(e, () => fxBurst(f.x, fy, [p[1], p[2], p[3]], 10, 90, -Math.PI / 2, 2.4, {life:.45, grav:1.4}));
    const L = Math.hypot(e.x - f.x, e.y - f.y), n = 6;                // montículos que corren hacia el rival
    for(let i = 0; i < n; i++){ const u = clamp01((a * 1.1 - i * .015) / .24) * .85 + i * .02; if(u <= 0 || u > .98) continue; const mx = lerp(f.x, e.x, u), my = lerp(fy, e.y + 10, u);
      Poly([[mx - 14, my + 2], [mx - 8, my - 6], [mx + 8, my - 6], [mx + 14, my + 2]], p[1]); Poly([[mx - 10, my + 2], [mx - 6, my - 4], [mx + 4, my - 4], [mx + 8, my + 2]], p[2]); R(mx - 4, my - 4, 3, 1, p[3]); }
  }
  const b = .26;
  if(a >= b){                                                     // sale de golpe bajo el rival
    const v = ease(clamp01((a - b) / .12)), al = fade(a, b + .2, .2); ctx.globalAlpha = al;
    D(e.x, e.y + 10, 16 + v * 8, p[0]); D(e.x, e.y + 10, 12 + v * 8, '#2a1a08');
    for(let i = 0; i < 8; i++){ const an = -Math.PI / 2 + (i - 3.5) * .28, d = (14 + HH(i) * 30) * v; PolyO(rotp(e.x + Math.cos(an) * d * .8, e.y + 8 + Math.sin(an) * d * 1.5 - v * 10, i, [[-4, -3], [4, -4], [5, 3], [-3, 4]]), p[2 + (i % 2)], p[0]); }
    Rg(e.x, e.y + 10, 14 + v * 28, p[3], 6 + v * 12, 1); ctx.globalAlpha = 1;
    hitStar(e.x, e.y - 2, a, p, 1, b);
    once(e, () => { fxBurst(e.x, e.y + 6, [p[1], p[2], p[3], '#ffffff'], 16, 160, -Math.PI / 2, 3.4, {life:.55, grav:1.6}); fx.shake = Math.max(fx.shake, 5); }, 'b');
  }
};
FXC['Excavar'] = {dur:.75, hide:.26, lg:lungeTo(150, 20), lgw:.26, lgd:.32};

// ---- Ataque Ala: dos alas blancas que se cierran ----
MEL['Ataque Ala'] = (e, a) => {
  const p = FXP.volador, pr = ease(clamp01(a / .16)), al = fade(a, .26, .16); ctx.globalAlpha = al;
  for(const sd of [-1, 1]){ const px = e.x + sd * 42, py = e.y - 4;
    for(let k = 0; k < 6; k++){ const an = (sd < 0 ? 0 : Math.PI) + sd * (-1.2 + k * .38 - pr * 1.0 + .5), L = 22 + (k === 2 || k === 3 ? 12 : 0) - Math.abs(k - 2.5) * 2;
      Ln(px, py, px + Math.cos(an) * L * -sd * -1, py + Math.sin(an) * L, '#31455f', 3); }
    for(let k = 0; k < 6; k++){ const an = (sd < 0 ? 0 : Math.PI) + sd * (-1.2 + k * .38 - pr * 1.0 + .5), L = 22 + (k === 2 || k === 3 ? 12 : 0) - Math.abs(k - 2.5) * 2;
      Ln(px, py, px + Math.cos(an) * L * -sd * -1, py + Math.sin(an) * L, k % 2 ? '#e0ecff' : '#ffffff', 1); } }
  ctx.globalAlpha = 1; hitStar(e.x, e.y, a, p, .8, .16);
  once(e, () => { for(let i = 0; i < 8; i++) fx.parts.push({x:e.x + (Math.random() - .5) * 40, y:e.y - 10, vx:(Math.random() - .5) * 60, vy:-20 - Math.random() * 20, rise:0, grav:.5, life:.8, max:.8, col:i % 2 ? '#ffffff' : '#b6ccf2', s:PXS * 2, drag:.97}); });
};
FXC['Ataque Ala'] = {dur:.6, lg:lungeTo(40, 46), lgd:.22};

// ---- Cabezazo Zen: aura rosa en la cabeza ----
MEL['Cabezazo Zen'] = (e, a) => {
  const p = FXP.psiquico, al = fade(a, .22, .22); ctx.globalAlpha = al * .9;
  const u = clamp01(a / .3); Rg(e.x, e.y, 6 + 24 * ease(u), p[2], 4 + 17 * ease(u), 2); Rg(e.x, e.y, 3 + 16 * ease(u), p[3], 2 + 11 * ease(u), 1);
  ctx.globalAlpha = 1; hitStar(e.x, e.y, a, p, 1, .1);
  const f = e.fol; if(a < .24){ ctx.globalAlpha = .7 * fade(a, .1, .14); D(f.x + Math.cos(e.ang) * 18, f.y - 10 + Math.sin(e.ang) * 18, 10, p[3]); D(f.x + Math.cos(e.ang) * 18, f.y - 10 + Math.sin(e.ang) * 18, 6, p[4]); ctx.globalAlpha = 1; }
  once(e, () => fxBurst(e.x, e.y, [p[2], p[3], p[4]], 9, 90, undefined, 6.3, {life:.45}));
};
FXC['Cabezazo Zen'] = {dur:.5, lg:lungeTo(48, 42), lgd:.24};

// ---- Cabezazo: choque con estrellitas amarillas ----
MEL['Cabezazo'] = (e, a) => {
  hitStar(e.x, e.y, a, FXP.normal, 1, .1);
  if(a > .1){ ctx.globalAlpha = fade(a, .3, .2); for(let k = 0; k < 4; k++){ const an = a * 9 + k * 1.57, x = e.x + Math.cos(an) * 22, y = e.y - 18 + Math.sin(an) * 8; Star(x, y, 4, 0, 5, '#b8860b', 2); Star(x, y, 4, 0, 4, '#ffe066', 1); Star(x, y, 4, 0, 4, '#ffe066', 1); D(x, y, 1, '#fff7c0'); } ctx.globalAlpha = 1; }
  once(e, () => fxBurst(e.x, e.y, ['#ffffff', '#ffe066'], 8, 110, undefined, 6.3, {life:.35}));
};
FXC['Cabezazo'] = {dur:.55, lg:lungeTo(54, 40), lgd:.24};

// ---- Golpe Cuerpo: aplastamiento con ondas ----
MEL['Golpe Cuerpo'] = (e, a) => {
  const p = FXP.normal;
  if(a > .1){ const u = clamp01((a - .1) / .3); ctx.globalAlpha = (1 - u) * .9; Rg(e.x, e.y + 10, 12 + 38 * ease(u), '#ffffff', 5 + 16 * ease(u), 2); Rg(e.x, e.y + 10, 6 + 26 * ease(u), p[2], 3 + 11 * ease(u), 1); ctx.globalAlpha = 1; }
  hitStar(e.x, e.y, a, p, 1.3, .1);
  once(e, () => { fxBurst(e.x, e.y + 12, ['#f0f0f4', '#c8c8d8', '#9a9aa8'], 14, 110, undefined, 6.3, {life:.5, rise:.3, s:2}); fx.shake = Math.max(fx.shake, 4); });
};
FXC['Golpe Cuerpo'] = {dur:.55, lg:lungeTo(64, 36), lgd:.26};

// ---- Tijera X: dos cuchillas cruzadas ----
MEL['Tijera X'] = (e, a) => {
  const p = FXP.bicho, c = [p[0], p[3], '#ffffff'];
  slashMarks(e.x, e.y - 2, a, {n:1, len:70, ang:.75, w:3, hold:.28, fade:.16, cols:c});
  if(a > .07) slashMarks(e.x, e.y - 2, a - .07, {n:1, len:70, ang:-.75, w:3, hold:.24, fade:.16, cols:c});
  if(a > .12){ hitStar(e.x, e.y, a, p, .8, .12); once(e, () => fxBurst(e.x, e.y, [p[2], p[3], '#ffffff'], 10, 130, undefined, 6.3, {life:.35})); }
};
FXC['Tijera X'] = {dur:.5, lg:lungeTo(36, 46), lgd:.2};

// ---- Tumba Rocas: caen rocas sobre el rival ----
MEL['Tumba Rocas'] = (e, a) => {
  const p = FXP.roca, sp = [[-26, 4], [-10, -8], [10, -9], [26, 3], [-16, 12], [12, 12]];
  sp.forEach(([ox, oy], i) => {
    const t0 = i * .045, u = clamp01((a - t0) / .17); if(a < t0) return; const y = lerp(e.y + oy - 130, e.y + oy, u * u), al = fade(a, .46 + i * .01, .14); ctx.globalAlpha = al;
    const s = 9 + (i % 3) * 2; PolyO([[ox + e.x - s, y], [ox + e.x - s * .4, y - s], [ox + e.x + s * .7, y - s * .8], [ox + e.x + s, y + s * .2], [ox + e.x + s * .3, y + s * .9], [ox + e.x - s * .8, y + s * .7]], p[2], p[0]);
    Poly([[ox + e.x - s * .4, y - s * .7], [ox + e.x + s * .5, y - s * .6], [ox + e.x, y - s * .1], [ox + e.x - s * .6, y - s * .1]], p[4]); ctx.globalAlpha = 1;
    if(u >= 1 && !e['l' + i]){ e['l' + i] = 1; fxBurst(e.x + ox, e.y + oy + 6, [p[1], p[2], p[3]], 5, 80, -Math.PI / 2, 2, {life:.4, grav:1.2}); fx.shake = Math.max(fx.shake, 2); }
  });
  if(a > .5){ once(e, () => fxBurst(e.x, e.y, [p[2], p[3], p[4]], 12, 140, undefined, 6.3, {life:.5, grav:1.4})); }
};
FXC['Tumba Rocas'] = {dur:.7, lg:lungeTo(10, 70), lgd:.2};

// ---- Lengüetazo: lengua larga ----
MEL['Lengüetazo'] = (e, a) => {
  const p = FXP.fantasma, f = e.fol, pr = a < .12 ? ease(a / .12) : a < .26 ? 1 : clamp01(1 - (a - .26) / .12); if(pr <= 0 && a > .3) return;
  const x0 = f.x + Math.cos(e.ang) * 14, y0 = f.y - 8 + Math.sin(e.ang) * 14, x1 = lerp(x0, e.x, pr), y1 = lerp(y0, e.y - 2, pr), n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3);
  for(let i = 0; i <= n; i++){ const u = i / n, w = Math.sin(u * 9 + a * 30) * 3 * (u), x = lerp(x0, x1, u) - Math.sin(e.ang) * w, y = lerp(y0, y1, u) + Math.cos(e.ang) * w; R(x - 4, y - 4, 4, 4, '#6a1f55'); }
  for(let i = 0; i <= n; i++){ const u = i / n, w = Math.sin(u * 9 + a * 30) * 3 * (u), x = lerp(x0, x1, u) - Math.sin(e.ang) * w, y = lerp(y0, y1, u) + Math.cos(e.ang) * w; R(x - 3, y - 3, 3, 3, '#e06a9a'); R(x - 3, y - 3, 1, 1, '#ffb0cf'); }
  D(x1, y1, 4, '#6a1f55'); D(x1, y1, 3, '#e06a9a');
  if(a > .12){ const u = clamp01((a - .12) / .3); ctx.globalAlpha = fade(a, .2, .24); for(let k = 0; k < 6; k++){ const an = k * 1.05 + a * 6, d = 12 + u * 14; Spark(e.x + Math.cos(an) * d, e.y + Math.sin(an) * d * .7, 2, k % 2 ? p[3] : p[4]); } ctx.globalAlpha = 1; }
};
FXC['Lengüetazo'] = {dur:.5, lg:lungeTo(28, 60), lgd:.2};

// ---- Carantoña: nube de pelea con estrellas ----
MEL['Carantoña'] = (e, a) => {
  const p = FXP.hada, al = fade(a, .46, .2); ctx.globalAlpha = al;
  for(let i = 0; i < 9; i++){ const an = i * .7 + a * 7, d = 14 + HH(i, Math.floor(a * 14)) * 12, r = 7 + (i % 3) * 2; D(e.x + Math.cos(an) * d, e.y + Math.sin(an) * d * .7, r, i % 2 ? '#fff0fa' : '#e9d4f0'); }
  D(e.x, e.y, 12, '#ffffff'); ctx.globalAlpha = 1;
  const k = Math.floor(a * 16); for(let i = 0; i < 3; i++){ const an = HH(k, i) * 6.3, d = 20 + HH(k, i + 3) * 18, x = e.x + Math.cos(an) * d, y = e.y + Math.sin(an) * d * .7; if(a < .5){ if((k + i) % 2) Star(x, y, 5, 0, 6, p[1], 2), Star(x, y, 5, 0, 5, '#ffe066', 1); else { R(x - 3, y - 3, 5, 5, p[1]); R(x - 2, y - 2, 3, 3, p[3]); } } }
  once(e, () => fxBurst(e.x, e.y, [p[2], p[3], '#ffffff'], 10, 100, undefined, 6.3, {life:.5}));
};
FXC['Carantoña'] = {dur:.65, lg:lungeTo(32, 56), lgd:.24};