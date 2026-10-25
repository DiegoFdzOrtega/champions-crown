"use strict";
/* =====================================================================
   EFECTOS de los 7 ataques de estado (js/status.js), dibujados por código en pixel art.
   Para cada ataque: FLT = el proyectil en vuelo · TRL = su estela · IMP = el impacto.
   Aparte: aura de cada estado sobre el Pokémon (fxStatusAura) y las etiquetas PAR · TOX · QUE · DRM · CNF (statusChips).
   Cuando tengas los sprites definitivos, solo hay que sustituir estas funciones (o dibujar la imagen en su lugar).
   ===================================================================== */
const STP = {                                                                    // paletas [contorno, sombra, base, luz, brillo]
  ghostFire: ['#1a0a4a', '#4a2fc8', '#7a6bff', '#c4b8ff', '#ffffff'],            // llama fantasma del anime: azul-violeta con corazón blanco
  dark:      ['#05030a', '#14082a', '#2a1250', '#5a2fa0', '#c8a8ff'],
  spore:     ['#3a5a1a', '#8fc84a', '#d4f08a', '#fff7b0', '#ffffff'],            // polvo del anime: verde-amarillo brillante
  confuse:   ['#2a0a4a', '#7a3cc8', '#b57aff', '#ffe066', '#ffffff'],            // luz espectral: morado y amarillo
  toxic:     ['#2a0a3a', '#6a1f9a', '#a23fd0', '#d98cf5', '#f6dcff'],            // veneno líquido morado
  hypno:     ['#3a0a5a', '#8a3cc8', '#d070e8', '#ff9ee0', '#ffffff']             // ondas hipnóticas del anime: rosa y violeta
};
const RAINBOW = ['#ff5fb0', '#ffe066', '#7de3ff', '#9fe23a'];

// Piezas propias de estos ataques (el resto sale de fxlib.js / fxshots.js)
// Llamita en forma de gota: cabeza redonda y cola que acaba en punta (mira hacia donde apunta ang; cola = detrás)
function flame(x, y, r, ang, p, k = 0){
  const w = Math.sin(g.t * 20 + k * 2.1) * r * .25, L = r * 2.4;
  const sh = f => [[r * f, 0], [r * .7 * f, -r * .75 * f], [0, -r * .95 * f], [-r * .8 * f, -r * .55 * f], [-L * f + w * f, 0], [-r * .8 * f, r * .55 * f], [0, r * .95 * f], [r * .7 * f, r * .75 * f]];
  PolyO(rotp(x, y, ang, sh(1)), p[1], p[0]);
  PolyO(rotp(x, y, ang, sh(.68)), p[2], p[2]);
  PolyO(rotp(x, y, ang, sh(.36)), p[4], p[4]);
}
// Anillo eléctrico irregular (como una onda de chispas)
function zring(x, y, r, k, p, ry){
  const n = 12; let px, py, fx0, fy0;
  for(let i = 0; i <= n; i++){
    const th = i / n * 6.283, rr = r + (HH(k, i % n) - .5) * 6, cx = x + Math.cos(th) * rr, cy = y + Math.sin(th) * rr * (ry || 1);
    if(i === 0){ fx0 = cx; fy0 = cy; } else Ln(px, py, i === n ? fx0 : cx, i === n ? fy0 : cy, i % 2 ? p[3] : p[2], 2);
    px = cx; py = cy;
  }
}
// Espiral de puntos (para el vacío y la confusión): dir = 1 gira hacia fuera, -1 hacia dentro
function spiral(x, y, r0, r1, t, n, turns, c, size, ry){
  for(let i = 0; i < n; i++){ const u = i / (n - 1), th = t + u * turns * 6.283, rr = r0 + (r1 - r0) * u; R(x + Math.cos(th) * rr - size / 2, y + Math.sin(th) * rr * (ry || 1) - size / 2, size, size, typeof c === 'function' ? c(u) : c); }
}
// Burbuja de veneno: anillo con brillo
function bubble(x, y, r, p){ Rg(x, y, r, p[0], undefined, 2); Rg(x, y, r - 1, p[3], undefined, 1); D(x - r * .4, y - r * .4, 1, '#ffffff'); }

// ---------- Proyectiles en vuelo (estilo anime) ----------
FLT['Onda Trueno'] = (s, a, an) => {                                           // bola eléctrica rodeada de anillos de chispas que se expanden
  const p = FXP.electrico, k = Math.floor(g.t * 18);
  for(let j = 0; j < 2; j++){ const o = (g.t * 26 + j * 9) % 18; ctx.globalAlpha = 1 - o / 20; zring(s.x, s.y, 5 + o, k + j * 7, p); }
  ctx.globalAlpha = 1;
  for(let i = 0; i < 4; i++){ const t = HH(k, i) * 6.28; bolt(s.x, s.y, s.x + Math.cos(t) * 16, s.y + Math.sin(t) * 16, k + i, p, 0, 3, 4); }
  orb(s.x, s.y, 4, p);
};
FLT['Tóxico'] = (s, a, an) => {                                                // gota de veneno que chorrea, con burbujas
  const p = STP.toxic, w = Math.sin(g.t * 14), c = Math.cos(an), n = Math.sin(an);
  for(let i = 1; i <= 3; i++) orb(s.x - c * i * 6, s.y - n * i * 6 + i * 1.5, Math.max(2, 6 - i * 1.4), p);        // cola de gotas que cae un poco
  orb(s.x, s.y, 8 + (w > 0 ? 1 : 0), p);
  D(s.x - 3, s.y - 4, 2, p[4]);
  for(let i = 0; i < 3; i++){ const u = (g.t * 1.3 + i * .33) % 1; bubble(s.x + (HH(i, 3) - .5) * 20, s.y - 10 - u * 14, 2 + (i % 2), p); }
};
FLT['Fuego Fatuo'] = (s, a, an) => {                                           // tres llamitas fantasma que giran juntas
  const p = STP.ghostFire, t = g.t * 3.5;
  for(let i = 0; i < 3; i++){ const th = t + i * 2.09, x = s.x + Math.cos(th) * 12, y = s.y + Math.sin(th) * 12; flame(x, y, 6, an + Math.sin(th) * .5, p, i); }
  D(s.x, s.y, 2, p[4]);
  for(let i = 0; i < 3; i++){ const u = (g.t * 1.6 + i * .33) % 1; ctx.globalAlpha = 1 - u; D(s.x - Math.cos(an) * u * 20 + (HH(i, 5) - .5) * 8, s.y - Math.sin(an) * u * 20 - u * 10, 1, p[3]); }
  ctx.globalAlpha = 1;
};
FLT['Somnífero'] = (s, a, an) => {                                             // polvo brillante: nube suave con destellos
  const p = STP.spore, k = Math.floor(g.t * 12);
  for(let i = 0; i < 5; i++) puff(s.x + (HH(i, k) - .5) * 18, s.y + (HH(i, k + 3) - .5) * 18, 4 + (i % 2), .3 + HH(i, 5) * .4, p);
  for(let i = 0; i < 8; i++){ const x = s.x + (HH(i, k + 7) - .5) * 30, y = s.y + (HH(i, k + 9) - .5) * 30 + (g.t * 20 % 4); if(i % 3 === 0) Spark(x, y, 1, i % 2 ? '#ffffff' : '#fff7b0'); else R(x, y, 1, 1, i % 2 ? '#ffe9f8' : p[3]); }
};
FLT['Brecha Negra'] = (s, a, an) => {                                          // esfera de vacío con remolino morado
  const p = STP.dark, w = Math.sin(g.t * 10) > 0 ? 1 : 0;
  orb(s.x, s.y, 10 + w, DARKP);
  spiral(s.x, s.y, 2, 10, -g.t * 6, 14, 1.6, u => u < .5 ? p[3] : p[4], 2);
  Rg(s.x, s.y, 14 + w, '#7a3cff', undefined, 1);
  for(let i = 0; i < 4; i++){ const t = g.t * 4 + i * 1.57, r = 17 - ((g.t * 3 + i * .25) % 1) * 5; D(s.x + Math.cos(t) * r, s.y + Math.sin(t) * r, 1, p[4]); }
};
FLT['Rayo Confuso'] = (s, a, an) => {                                          // orbe espectral con cinta ondulante de luz detrás
  const p = STP.confuse, c = Math.cos(an), n = Math.sin(an);
  for(let i = 1; i <= 14; i++){ const d = i * 2.2, off = Math.sin(g.t * 16 - i * .6) * (2 + i * .5); ctx.globalAlpha = 1 - i / 15; D(s.x - c * d - n * off, s.y - n * d + c * off, Math.max(1, 3 - (i > 7 ? 1 : 0)), i % 2 ? p[3] : p[2]); }
  ctx.globalAlpha = 1;
  Rg(s.x, s.y, 8 + Math.sin(g.t * 14), p[2], undefined, 1);
  orb(s.x, s.y, 5, p);
  for(let i = 0; i < 3; i++){ const t = g.t * 6 + i * 2.09; Spark(s.x + Math.cos(t) * 11, s.y + Math.sin(t) * 11, 1, i === 0 ? '#ffffff' : p[3]); }
};
FLT['Hipnosis'] = (s, a, an) => {                                              // ondas hipnóticas (anillos rosa y violeta que se expanden) y, en el centro, el péndulo dorado que oscila
  const p = STP.hypno, c = Math.cos(an), n = Math.sin(an), sw = Math.sin(g.t * 11);
  for(let j = 0; j < 3; j++){ const u = (g.t * 1.7 + j / 3) % 1, r = 3 + 15 * u; ctx.globalAlpha = 1 - u * .8; Rg(s.x, s.y, r, j % 2 ? p[3] : p[2], r * .9, 2); }
  ctx.globalAlpha = 1;
  const px = s.x - n * sw * 8, py = s.y + c * sw * 8;                          // el péndulo se balancea de lado a lado, perpendicular al vuelo
  Ln(s.x, s.y - 1, px, py, p[4], 1);
  orb(px, py, 3, FXP.electrico); D(px - 1, py - 1, 1, '#ffffff');
  for(let i = 0; i < 2; i++){ const t = g.t * 5 + i * 3.14; Spark(s.x + Math.cos(t) * 13, s.y + Math.sin(t) * 13, 1, i ? '#ffffff' : p[3]); }
};

// ---------- Estelas ----------
TRL['Onda Trueno']  = {rate: 40, cols: ['#ffd91f', '#fff27a', '#ffffff'], life: .2, speed: 30};
TRL['Tóxico']       = {rate: 30, cols: ['#a23fd0', '#6a1f9a', '#d98cf5'], life: .5, speed: 8, spread: 5, s: 2};
TRL['Fuego Fatuo']  = {rate: 44, cols: ['#4a2fc8', '#7a6bff', '#c4b8ff'], life: .45, rise: .5, speed: 16};
TRL['Somnífero']    = {rate: 40, cols: ['#d4f08a', '#fff7b0', '#ffe9f8'], life: .6, rise: -.3, speed: 14, spread: 6, s: 1};
TRL['Brecha Negra'] = {rate: 44, cols: ['#2a1250', '#5a2fa0', '#14082a'], life: .5, rise: .3, speed: 18, s: 2};
TRL['Rayo Confuso'] = {rate: 30, cols: ['#b57aff', '#ffe066', '#ffffff'], life: .35, speed: 14, s: 1};
TRL['Hipnosis']     = {rate: 34, cols: ['#d070e8', '#ff9ee0', '#8a3cc8'], life: .4, speed: 12, spread: 4, s: 1};

// ---------- Impactos (estilo anime) ----------
IMP['Onda Trueno'] = (e, a) => {                                               // anillos eléctricos que salen del rival + chispas recorriendo el cuerpo
  const p = FXP.electrico, k = Math.floor(a * 30), b = bodyOf(e.T);
  flashDisc(e, a, p, 3, 10, .1);
  for(let j = 0; j < 3; j++){ const u = (a - j * .07) / .4; if(u <= 0 || u >= 1) continue; ctx.globalAlpha = 1 - u; zring(e.x, e.y, 6 + 30 * ease(u), k + j * 5, p, .55); }
  ctx.globalAlpha = 1;
  if(a < .55){ ctx.globalAlpha = fade(a, .3, .25);
    for(let i = 0; i < 3; i++){ const xo = (i - 1) * b.hw * .7; bolt(e.x + xo + (HH(k, i) - .5) * 6, b.top + 4, e.x + xo + (HH(k, i + 4) - .5) * 8, b.foot - 4, k + i * 3, p, 0, 4, 6); }
    for(let i = 0; i < 5; i++) Spark(e.x + (HH(k, i + 9) - .5) * b.hw * 2.2, b.top + HH(k, i + 12) * (b.foot - b.top), 1, i % 2 ? '#ffffff' : p[3]);
    ctx.globalAlpha = 1; }
};
IMP['Tóxico'] = (e, a) => {                                                    // el veneno salpica y chorrea por el cuerpo; burbujas que suben
  const p = STP.toxic, b = bodyOf(e.T), gr = ease(clamp01(a / .12));
  ctx.globalAlpha = fade(a, .5, .3);
  D(e.x, e.y, Math.round(12 * gr), p[1]); D(e.x, e.y, Math.round(9 * gr), p[2]); D(e.x - 2, e.y - 2, Math.round(4 * gr), p[3]);
  for(let i = 0; i < 4; i++){ const xo = (i - 1.5) * 9, len = Math.min(1, a / .35) * (14 + HH(i, 1) * 14), y0 = b.top + 8 + HH(i, 2) * 8;
    R(e.x + xo - 1, y0, 3, len, p[1]); R(e.x + xo, y0, 1, len, p[3]); D(e.x + xo, y0 + len, 2, p[2]); }
  ctx.globalAlpha = 1;
  if(a < .7) for(let i = 0; i < 4; i++){ const u = clamp01(a / .7 + HH(i, 4) * .1); ctx.globalAlpha = 1 - u; bubble(e.x + (i - 1.5) * 10, e.y - u * 34, 3 - (i % 2), p); }
  ctx.globalAlpha = 1;
  once(e, () => crown(e, [p[2], p[3], p[4], p[1]], 12, 120, 100, {life: .6}));
};
IMP['Fuego Fatuo'] = (e, a) => {                                               // llamitas azules que se alzan alrededor del rival y titilan
  const p = STP.ghostFire, b = bodyOf(e.T);
  flashDisc(e, a, p, 2, 7, .08);
  if(a < .75) for(let i = 0; i < 6; i++){
    const u = clamp01((a - i * .03) / .7); if(u <= 0) continue; ctx.globalAlpha = u < .6 ? 1 : (1 - u) / .4;
    const th = i * 1.047 + a * 2.5, x = e.x + Math.cos(th) * (b.hw * .9), y = b.foot - 6 - u * (b.foot - b.top) * .7 + Math.sin(th) * 4;
    flame(x, y, 7 + (i % 2), 1.5708, p, i); }
  ctx.globalAlpha = 1;
  ringsOut(e, a, [p[2], p[3]], 2, 26, 0, .45);
};
IMP['Somnífero'] = (e, a) => {                                                 // lluvia de polvo brillante que cae sobre el rival
  const p = STP.spore, b = bodyOf(e.T);
  if(a < .8){ ctx.globalAlpha = fade(a, .45, .35);
    for(let i = 0; i < 22; i++){ const u = (a * 1.1 + HH(i, 1) * .5) % 1, x = e.x + (HH(i, 2) - .5) * b.hw * 2.6 + Math.sin(a * 6 + i) * 3, y = b.top - 14 + u * (b.foot - b.top + 14);
      if(i % 4 === 0) Spark(x, y, 1, i % 8 === 0 ? '#ffffff' : '#fff7b0'); else R(x, y, 1 + (i % 3 === 0), 1 + (i % 3 === 0), i % 2 ? p[3] : '#ffe9f8'); }
    for(let i = 0; i < 4; i++) puff(e.x + (i - 1.5) * 12, b.top - 6 + a * 18, 5, .35 + HH(i, 3) * .3, p);
    ctx.globalAlpha = 1; }
  if(a > .15 && a < .8){ ctx.globalAlpha = fade(a, .5, .3); const u = (a - .15) / .65; text('z', e.x + 14 + u * 8, b.top - 6 - u * 18, 8, '#c9d6f5', 'center'); text('Z', e.x + 20 + u * 10, b.top - 12 - u * 22, 11, '#c9d6f5', 'center'); ctx.globalAlpha = 1; }
};
IMP['Brecha Negra'] = (e, a) => {                                              // el vacío se abre bajo el rival y lo absorbe: anillos que se cierran
  const p = STP.dark, b = bodyOf(e.T), u = clamp01(a / .25);
  ctx.globalAlpha = a < .35 ? 1 : fade(a, .35, .3);
  Rg(e.x, b.foot - 4, 6 + 34 * ease(u), p[1], (6 + 34 * ease(u)) * .45, 3);
  D(e.x, e.y, Math.round(5 + 15 * ease(u)), p[1]); D(e.x, e.y, Math.round(3 + 10 * ease(u)), p[2]); D(e.x, e.y, Math.round(1 + 6 * ease(u)), p[0]);
  spiral(e.x, e.y, 2, 22 * ease(u), a * 8, 22, 2, v => v < .5 ? p[3] : p[4], 2);
  ctx.globalAlpha = 1;
  for(let k = 0; k < 3; k++){ const v = ((a * 1.6 + k * .33) % 1); ctx.globalAlpha = (1 - v) * fade(a, .45, .3); Rg(e.x, e.y, 4 + 38 * (1 - v), k % 2 ? p[3] : '#7a3cff', undefined, 1); }
  ctx.globalAlpha = 1;
  once(e, () => fxBurst(e.x, e.y, [p[2], p[3], p[4]], 8, 90, undefined, 6.3, {life: .5}));
};
IMP['Rayo Confuso'] = (e, a) => {                                              // destello y espirales de luz que dan vueltas a la cabeza del rival
  const p = STP.confuse, b = bodyOf(e.T), hy = b.top + 2;
  flashDisc(e, a, p, 3, 12, .1);
  ringsOut(e, a, [p[2], p[3]], 2, 28, 0, .4, .8);
  if(a < .7){ ctx.globalAlpha = fade(a, .4, .3);
    spiral(e.x, hy, 3, 18, a * 7, 18, 2.2, v => v < .5 ? p[2] : p[3], 2, .4);
    for(let i = 0; i < 3; i++){ const t = a * 7 + i * 2.09; Star(e.x + Math.cos(t) * 20, hy + Math.sin(t) * 8, 4, 0, 3, i % 2 ? '#ffffff' : p[3], 1); }
    ctx.globalAlpha = 1; }
};
IMP['Hipnosis'] = (e, a) => {                                                  // anillos que se cierran sobre la cabeza del rival, ojos en espiral y el péndulo que se balancea; luego se duerme
  const p = STP.hypno, b = bodyOf(e.T), hy = b.top + 2;
  flashDisc(e, a, p, 3, 11, .1);
  if(a < .75){ ctx.globalAlpha = fade(a, .5, .25);
    for(let j = 0; j < 3; j++){ const u = ((a * 1.5 + j / 3) % 1), r = 30 * (1 - u) + 4; ctx.globalAlpha *= 1; Rg(e.x, hy, r, j % 2 ? p[3] : p[2], r * .4, 2); }
    spiral(e.x, hy, 2, 15, a * 6, 18, 2.2, v => v < .5 ? p[3] : p[4], 2, .45);
    const sw = Math.sin(a * 16), px = e.x + sw * 14, py = hy - 30 + Math.abs(sw) * 4;                 // péndulo dorado sobre la cabeza
    Ln(e.x, hy - 42, px, py, p[4], 1); orb(px, py, 3, FXP.electrico); D(px - 1, py - 1, 1, '#ffffff');
    ctx.globalAlpha = 1; }
  if(a > .3 && a < .85){ ctx.globalAlpha = fade(a, .55, .3); const u = (a - .3) / .55; text('z', e.x + 14 + u * 8, b.top - 6 - u * 18, 8, '#c9d6f5', 'center'); text('Z', e.x + 20 + u * 10, b.top - 12 - u * 22, 11, '#c9d6f5', 'center'); ctx.globalAlpha = 1; }
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
  if(f.lov > 0){
    for(let i = 0; i < 3; i++){ const u = (t * .8 + i * .33) % 1; ctx.globalAlpha = 1 - u; Spark(hx + (HH(i, 7) - .5) * bw * 1.6, top - 4 - u * 26, 2, '#ff7ab8'); D(hx + (HH(i, 7) - .5) * bw * 1.6, top - 4 - u * 26, 1, '#ffffff'); }
  }
  ctx.restore();
}

// Etiquetas pequeñas con el estado (PAR · TOX · QUE · DRM · CNF)
function statusChips(f, x, y, w, h, size){
  const list = []; if(f.st) list.push(f.st.k); if(f.cnf > 0) list.push('cnf'); if(f.lov > 0) list.push('lov');
  list.forEach((k, i) => {
    const inf = STATUS_INFO[k], cx = x + i * (w + 3);
    ctx.fillStyle = 'rgba(8,10,16,.88)'; ctx.fillRect(cx, y, w, h);
    ctx.fillStyle = inf.c; ctx.fillRect(cx, y, w, 1); ctx.fillRect(cx, y + h - 1, w, 1); ctx.fillRect(cx, y, 1, h); ctx.fillRect(cx + w - 1, y, 1, h);
    text(inf.ab, cx + w / 2, y + h - 3, size || 6, inf.c, 'center');
  });
}
