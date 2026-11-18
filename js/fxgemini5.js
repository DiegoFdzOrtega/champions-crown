"use strict";
/* =====================================================================
   SPRITES DE GEMINI (5.ª tanda): VENENO y FANTASMA. assets/fx/*.png con el fondo ya quitado. Usa gmDraw/gmOk (fxgemini.js), gmMove (fxgemini2.js) y g4Swap/g4F (fxgemini4.js).
     Bomba Lodo (bl_orb, bl_golpe) · Picotazo Veneno (pv_dardo, pv_golpe) · Lanzamugre (lm_bola, lm_grupo, lm_golpe: ristra de bolas de mugre y el campo se tiñe de morado)
     Puya Nociva (pn_puya, pn_golpe) · Lengüetazo (le_lengua, le_golpe) · Garra Umbría (gu_garra, gu_golpe) · Tinieblas (ti_rayo, ti_golpe) · Puño Sombra (ps_puno, ps_golpe)
   Mientras una imagen no ha cargado (o si falta), se ve el dibujo de antes. G5 = tamaños [AJUSTE].
   ===================================================================== */
const G5 = {bl: .5, blHit: .8, pv: .6, pvHit: .7, lm: .42, lmHit: 1, tinte: .14, ti: .55, tiHit: .7, pn: .6, pnHit: .9, le: .65, leHit: .65, gu: .6, guHit: .65, ps: .6, psHit: .65};
Object.assign(GM.meta, {bl_orb: {fw: 122, fh: 131, n: 5}, bl_golpe: {fw: 147, fh: 141, n: 6}, lm_bola: {fw: 123, fh: 120, n: 5}, lm_grupo: {fw: 129, fh: 90, n: 4}, lm_golpe: {fw: 163, fh: 130, n: 5}, pv_dardo: {fw: 153, fh: 56, n: 3}, pv_golpe: {fw: 120, fh: 119, n: 3}, le_lengua: {fw: 168, fh: 86, n: 5}, le_golpe: {fw: 167, fh: 155, n: 5}, gu_garra: {fw: 175, fh: 173, n: 5}, gu_golpe: {fw: 186, fh: 173, n: 5}, ti_rayo: {fw: 238, fh: 96, n: 4}, ti_golpe: {fw: 187, fh: 187, n: 4}, ps_puno: {fw: 190, fh: 96, n: 5}, ps_golpe: {fw: 173, fh: 167, n: 5}, pn_puya: {fw: 197, fh: 57, n: 4}, pn_golpe: {fw: 142, fh: 88, n: 4}});
['bl_orb', 'bl_golpe', 'lm_bola', 'lm_grupo', 'lm_golpe', 'pv_dardo', 'pv_golpe', 'le_lengua', 'le_golpe', 'gu_garra', 'gu_golpe', 'ti_rayo', 'ti_golpe', 'ps_puno', 'ps_golpe', 'pn_puya', 'pn_golpe'].forEach(k => { const im = new Image(); im.onload = () => { GM.meta[k].ok = true; }; im.src = `assets/fx/${k}.png?v=1`; GM.img[k] = im; });
// Dibuja un cuadro girado a «an»; si va hacia la izquierda se da la vuelta para no quedar boca abajo
function g5Rot(k, i, x, y, sc, an, A, flipX){
  const M = GM.meta[k]; if(!M.ok) return; const L = Math.cos(an) < 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(L ? an + Math.PI : an); if(L !== !!flipX) ctx.scale(-1, 1); ctx.globalAlpha = A; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(GM.img[k], i * M.fw, 0, M.fw, M.fh, -M.fw * sc / 2, -M.fh * sc / 2, M.fw * sc, M.fh * sc); ctx.restore();
}
const g5Hit = (k, sc, d, dy) => (e, a) => { const u = a / d; if(u >= 1) return; gmDraw(k, g4F(k, u), e.x, e.y - (dy == null ? 6 : dy), sc * (e.k || 1), 0, u > .85 ? (1 - u) / .15 : 1); };
const g5Dur = (n, d) => { FXC[n] = Object.assign({}, FXC[n], {idur: Math.max(d, (FXC[n] && FXC[n].idur) || 0)}); };

// ---------------- BOMBA LODO ----------------
gmMove('Bomba Lodo', ['bl_orb'], (s, a, an) => { gmDraw('bl_orb', Math.floor(g.t * 8), s.x, s.y - 6, G5.bl, 0, 1); }, ['bl_golpe'], g5Hit('bl_golpe', G5.blHit, .7, 0));
g5Dur('Bomba Lodo', .7);
// ---------------- PICOTAZO VENENO (los tres dardos de siempre, ahora con el sprite) ----------------
gmMove('Picotazo Veneno', ['pv_dardo'], (s, a, an) => { g5Rot('pv_dardo', 1, s.x, s.y - 6, G5.pv, an, 1); }, ['pv_golpe'], g5Hit('pv_golpe', G5.pvHit, .45));
// ---------------- LANZAMUGRE: ristra de bolas de mugre + el campo se tiñe de morado ----------------
gmMove('Lanzamugre', ['lm_bola', 'lm_grupo'], (s, a, an) => {
  ctx.save(); ctx.globalAlpha = G5.tinte; ctx.fillStyle = '#7a2a9a'; ctx.fillRect(-W, -H, W * 3, H * 3); ctx.restore();   // el cielo / campo morado mientras vuela
  const ux = Math.cos(an), uy = Math.sin(an), fr = Math.floor(g.t * 7);
  for(let i = 3; i >= 1; i--){ const d = i * 34, wob = Math.sin(g.t * 9 + i * 2) * 8;          // bolas y grupos de mugre que van detrás
    gmDraw(i % 2 ? 'lm_grupo' : 'lm_bola', (fr + i) % (i % 2 ? 4 : 5), s.x - ux * d - uy * wob, s.y - 6 - uy * d + ux * wob, G5.lm * (1 - i * .12), 0, 1 - i * .15); }
  gmDraw('lm_bola', fr % 5, s.x, s.y - 6, G5.lm, 0, 1);
  ctx.save(); ctx.fillStyle = '#3a1450'; for(let i = 0; i < 6; i++){ const p = (g.t * 2 + i / 6) % 1, x = s.x - ux * p * 120 + (HH(i, 3) - .5) * 40, y = s.y - 6 - uy * p * 120 + (HH(i, 5) - .5) * 40 + p * 20;   // gotitas sueltas
    ctx.globalAlpha = 1 - p; ctx.fillRect(x - 3, y - 3, 6, 6); } ctx.restore();
}, ['lm_golpe'], (e, a) => { const u = a / 1; if(u >= 1) return;
  gmDraw('lm_golpe', g4F('lm_golpe', u), e.x, e.y + 8, G5.lmHit * (e.k || 1), 0, u > .8 ? (1 - u) / .2 : 1);
  if(u < .6){ ctx.save(); ctx.globalAlpha = G5.tinte * (1 - u / .6); ctx.fillStyle = '#7a2a9a'; ctx.fillRect(-W, -H, W * 3, H * 3); ctx.restore(); } });
g5Dur('Lanzamugre', 1);
// ---------------- TINIEBLAS (la sombra con tentáculos) ----------------
gmMove('Tinieblas', ['ti_rayo'], (s, a, an) => { g5Rot('ti_rayo', Math.floor(g.t * 10) % 4, s.x, s.y - 6, G5.ti, an, 1, true); }, ['ti_golpe'], g5Hit('ti_golpe', G5.tiHit, .7));
g5Dur('Tinieblas', .7);

// ---------------- GOLPES (cuerpo a cuerpo) ----------------
// Fase 1 (hasta t1): el sprite del ataque va del atacante al rival. Fase 2: el golpe en el rival.
function g5Melee(nm, kA, kH, scA, scH, t1, dH, opt){
  g4Swap(FXR.melee, nm, [kA, kH], (e, a) => {
    const f = e.fol, an = e.ang;
    if(a < t1 && f){ const u = a / t1, ox = f.x + Math.cos(an) * 20, oy = f.y - 10 + Math.sin(an) * 12, x = ox + (e.x - ox) * (opt && opt.fijo ? 1 : u * .85), y = oy + (e.y - 6 - oy) * (opt && opt.fijo ? 1 : u * .85);
      const i = Math.min(GM.meta[kA].n - 1, Math.floor(u * GM.meta[kA].n));
      if(opt && opt.fijo) gmDraw(kA, i, e.x, e.y - 8, scA, 0, 1); else g5Rot(kA, i, x, y, scA, an, 1); }
    if(a >= t1 * .7){ const u = (a - t1 * .7) / dH; if(u < 1) gmDraw(kH, g4F(kH, u), e.x, e.y - 6, scH, 0, u > .85 ? (1 - u) / .15 : 1); }
  });
}
g5Melee('Puya Nociva', 'pn_puya', 'pn_golpe', G5.pn, G5.pnHit, .18, .35);
g5Melee('Lengüetazo', 'le_lengua', 'le_golpe', G5.le, G5.leHit, .22, .35);
g5Melee('Garra Umbría', 'gu_garra', 'gu_golpe', G5.gu, G5.guHit, .22, .4, {fijo: 1});
g5Melee('Puño Sombra', 'ps_puno', 'ps_golpe', G5.ps, G5.psHit, .2, .42);
