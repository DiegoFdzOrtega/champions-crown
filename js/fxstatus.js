"use strict";
/* =====================================================================
   EFECTOS PROVISIONALES de los 6 ataques de estado (js/status.js), dibujados por código en pixel art.
   Para cada ataque: FLT = el proyectil en vuelo · TRL = su estela · IMP = el impacto.
   Aparte: aura de cada estado sobre el Pokémon (fxStatusAura) y las etiquetas PAR · TOX · QUE · DRM · CNF (statusChips).
   Cuando tengas los sprites definitivos, solo hay que sustituir estas funciones (o dibujar la imagen en su lugar).
   ===================================================================== */
const STP = {                                                                    // paletas [contorno, sombra, base, luz, brillo]
  ghostFire: ['#12063a', '#3b2fd1', '#6f6bff', '#b5b0ff', '#ffffff'],
  dark:      ['#05030a', '#14082a', '#2a1250', '#5a2fa0', '#c8a8ff'],
  spore:     ['#1f4a22', '#4fb04f', '#9fe58f', '#e4ffd0', '#ffffff'],
  confuse:   ['#5a0f3a', '#d42f86', '#ff5fb0', '#ffe066', '#ffffff']
};
const RAINBOW = ['#ff5fb0', '#ffe066', '#7de3ff', '#9fe23a'];

// ---------- Proyectiles en vuelo ----------
FLT['Onda Trueno'] = (s, a, an) => {
  const p = FXP.electrico, k = Math.floor(g.t * 24), c = Math.cos(an), n = Math.sin(an);
  for(let i = 0; i < 3; i++) ringF(s.x - c * i * 7, s.y - n * i * 7, an, 10 - i * 2, .5, i % 2 ? p[2] : p[3], 1);
  bolt(s.x - c * 20, s.y - n * 20, s.x + c * 10, s.y + n * 10, k, p, 0, 4, 5);
  orb(s.x, s.y, 3, p);
};
FLT['Tóxico'] = (s, a, an) => {
  const p = FXP.veneno, t = g.t * 9;
  orb(s.x, s.y, 6, p);
  for(let i = 0; i < 3; i++) D(s.x + Math.cos(t + i * 2.09) * 10, s.y + Math.sin(t * 1.3 + i * 2.09) * 8, 2, p[3]);
};
FLT['Fuego Fatuo'] = (s, a, an) => {
  const p = STP.ghostFire, t = g.t * 8;
  for(let i = 0; i < 3; i++) puff(s.x + Math.cos(t + i * 2.09) * 9, s.y + Math.sin(t + i * 2.09) * 9, 4, .15 + (i % 2) * .2, p);
  orb(s.x, s.y, 3, p);
};
FLT['Somnífero'] = (s, a, an) => {
  const p = STP.spore, k = Math.floor(g.t * 14);
  for(let i = 0; i < 7; i++) puff(s.x + (HH(i, k) - .5) * 22, s.y + (HH(i, k + 3) - .5) * 22, 3 + (i % 3), .2 + HH(i, 5) * .4, p);
  for(let i = 0; i < 4; i++) R(s.x + (HH(i, k + 7) - .5) * 28, s.y + (HH(i, k + 9) - .5) * 28, 1, 1, i % 2 ? '#ff9ee0' : '#ffffff');
};
FLT['Brecha Negra'] = (s, a, an) => {
  const p = STP.dark, t = g.t * 6;
  orb(s.x, s.y, 8, p);
  Rg(s.x, s.y, 12 + (g.t * 18 % 4), '#7a3cff', undefined, 1);
  for(let i = 0; i < 4; i++) { const u = t + i * 1.57; D(s.x + Math.cos(u) * 13, s.y + Math.sin(u) * 13, 2, p[4]); }
};
FLT['Rayo Confuso'] = (s, a, an) => {
  const p = STP.confuse, t = g.t * 7;
  orb(s.x, s.y, 5, p);
  for(let i = 0; i < 4; i++) { const u = t + i * 1.57; Spark(s.x + Math.cos(u) * 12, s.y + Math.sin(u) * 12, 2, RAINBOW[i]); }
};

// ---------- Estelas ----------
TRL['Onda Trueno']  = {rate: 40, cols: ['#ffd91f', '#fff27a', '#ffffff'], life: .2, speed: 30};
TRL['Tóxico']       = {rate: 30, cols: ['#8a2db8', '#b85ee8', '#e3a8ff'], life: .4, rise: .3, speed: 18, s: 2};
TRL['Fuego Fatuo']  = {rate: 36, cols: ['#3b2fd1', '#6f6bff', '#b5b0ff'], life: .4, rise: .4, speed: 18};
TRL['Somnífero']    = {rate: 34, cols: ['#9fe58f', '#e4ffd0', '#ff9ee0'], life: .5, rise: .2, speed: 16, s: 1};
TRL['Brecha Negra'] = {rate: 44, cols: ['#2a1250', '#5a2fa0', '#14082a'], life: .5, speed: 16, s: 2};
TRL['Rayo Confuso'] = {rate: 40, cols: RAINBOW, life: .35, speed: 24};

// ---------- Impactos ----------
IMP['Onda Trueno'] = (e, a) => {
  const p = FXP.electrico, k = Math.floor(a * 30);
  flashDisc(e, a, p, 4, 16, .1); ringsOut(e, a, [p[3], '#ffffff'], 2, 30, 0, .35);
  if(a < .35){ ctx.globalAlpha = fade(a, .2, .15); for(let i = 0; i < 5; i++){ const t = i * 1.26 + HH(k, i) * .6; bolt(e.x, e.y, e.x + Math.cos(t) * 26, e.y + Math.sin(t) * 26, k + i, p, 0, 4, 5); } ctx.globalAlpha = 1; }
};
IMP['Tóxico'] = (e, a) => {
  const p = FXP.veneno;
  flashDisc(e, a, p, 4, 16, .1);
  once(e, () => crown(e, [p[2], p[3], '#ffffff', p[1]], 12, 120, 110, {life: .6}));
  ringsOut(e, a, [p[3]], 1, 26, 0, .4);
};
IMP['Fuego Fatuo'] = (e, a) => {
  const p = STP.ghostFire;
  flashDisc(e, a, p, 4, 14, .1);
  if(a < .6) for(let i = 0; i < 6; i++){ const v = HH(i, 1), u = clamp01(a / .6 + v * .15); puff(e.x + (HH(i, 2) - .5) * 28, e.y + 8 - a * 50 * (.4 + v), Math.round(3 + (1 - u) * 3), u, p); }
};
IMP['Somnífero'] = (e, a) => {
  const p = STP.spore;
  if(a < .7){ ctx.globalAlpha = fade(a, .35, .35); for(let i = 0; i < 9; i++){ const t = i * .7 + a * 2; puff(e.x + Math.cos(t) * (6 + a * 26), e.y + Math.sin(t) * (4 + a * 14) - 4, 4, .3 + HH(i, 2) * .4, p); } ctx.globalAlpha = 1; }
  once(e, () => fxBurst(e.x, e.y - 6, ['#9fe58f', '#ff9ee0', '#ffffff'], 12, 90, undefined, undefined, {rise: .3, life: .6}));
};
IMP['Brecha Negra'] = (e, a) => {
  const p = STP.dark, u = clamp01(a / .25);
  ctx.globalAlpha = a < .3 ? 1 : fade(a, .3, .3);
  D(e.x, e.y, Math.round(6 + 20 * ease(u)), p[1]); D(e.x, e.y, Math.round(4 + 14 * ease(u)), p[2]); D(e.x, e.y, Math.round(2 + 7 * ease(u)), p[0]);
  ctx.globalAlpha = 1;
  ringsOut(e, a, ['#7a3cff', p[3]], 3, 44, .05, .5);
};
IMP['Rayo Confuso'] = (e, a) => {
  const p = STP.confuse;
  flashDisc(e, a, p, 4, 16, .1); ringsOut(e, a, RAINBOW, 3, 34, 0, .45);
  if(a < .5){ ctx.globalAlpha = fade(a, .25, .25); for(let i = 0; i < 6; i++){ const t = i * 1.05 + a * 6; Spark(e.x + Math.cos(t) * (8 + a * 36), e.y + Math.sin(t) * (8 + a * 36), 2, RAINBOW[i % 4]); } ctx.globalAlpha = 1; }
};

// ---------- Aura del estado sobre el Pokémon (mientras dura) ----------
function fxStatusAura(f, I){
  const t = g.t, hx = f.x, top = f.y + I.top * ESCALA, foot = f.y + I.foot * ESCALA, bw = Math.max(18, I.fw * ESCALA * .3);
  const k = f.st && f.st.k;
  ctx.save();
  if(k === 'par'){
    const p = FXP.electrico, n = Math.floor(t * 12);
    ctx.globalAlpha = .55 + .45 * Math.sin(t * 30);
    for(let i = 0; i < 3; i++){ const a1 = HH(n, i) * 6.283, x0 = hx + Math.cos(a1) * bw, y0 = f.y + Math.sin(a1) * bw * .8; bolt(x0, y0, x0 + (HH(n, i + 4) - .5) * 24, y0 + (HH(n, i + 8) - .5) * 24, n + i, p, 0, 3, 4); }
  } else if(k === 'psn'){
    const p = FXP.veneno;
    for(let i = 0; i < 6; i++){ const u = (t * .7 + i * .17) % 1; ctx.globalAlpha = 1 - u; D(hx + (HH(i, 1) - .5) * bw * 1.8, foot - u * (foot - top), 2 + (i % 2), i % 2 ? p[3] : p[2]); }
  } else if(k === 'brn'){
    const p = FXP.fuego, n = Math.floor(t * 14);
    for(let i = 0; i < 3; i++) puff(hx + (i - 1) * bw * .9 + (HH(n, i) - .5) * 4, foot - 6 - (HH(n, i + 3)) * 10, 3 + (i % 2), HH(n, i + 6) * .5, p);
  } else if(k === 'slp'){
    for(let i = 0; i < 3; i++){ const u = (t * .55 + i * .33) % 1; ctx.globalAlpha = u < .8 ? 1 : (1 - u) * 5; text(i % 2 ? 'z' : 'Z', hx + 10 + u * 22, top - 4 - u * 28, 7 + i * 2, '#c9d6f5', 'center'); }
  }
  if(f.cnf > 0){
    for(let i = 0; i < 3; i++){ const a1 = t * 5 + i * 2.09, x = hx + Math.cos(a1) * 22, y = top - 8 + Math.sin(a1) * 6; ctx.globalAlpha = 1; Spark(x, y, 2, RAINBOW[i]); D(x, y, 1, '#ffffff'); }
  }
  ctx.restore();
}

// Etiquetas pequeñas con el estado (PAR · TOX · QUE · DRM · CNF)
function statusChips(f, x, y, w, h, size){
  const list = []; if(f.st) list.push(f.st.k); if(f.cnf > 0) list.push('cnf');
  list.forEach((k, i) => {
    const inf = STATUS_INFO[k], cx = x + i * (w + 3);
    ctx.fillStyle = 'rgba(8,10,16,.88)'; ctx.fillRect(cx, y, w, h);
    ctx.fillStyle = inf.c; ctx.fillRect(cx, y, w, 1); ctx.fillRect(cx, y + h - 1, w, 1); ctx.fillRect(cx, y, 1, h); ctx.fillRect(cx + w - 1, y, 1, h);
    text(inf.ab, cx + w / 2, y + h - 3, size || 6, inf.c, 'center');
  });
}
