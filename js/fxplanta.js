"use strict";
/* =====================================================================
   FRANJA DE HIERBA (el terreno que deja un ataque fuerte de planta, TERR.planta en combat.js).
   En vez del rectángulo con hierba dibujada: una mata de hierba alta y espesa, briznas sueltas de verde oscuro (raíz) a verde claro
   (punta), con el borde irregular y el viento pasando en ola a lo largo de la franja. El efecto en el combate es el mismo.
   FP.on = false lo apaga (se ve lo de siempre).
   ===================================================================== */
const FP = {on: true, dens: 3.4, alto: 1, viento: 1};                     // [AJUSTE] encendido · briznas por píxel de largo (más = más espesa) · altura · fuerza del viento
const FP_COL = ['#1f5a1c', '#2f7d27', '#47a332', '#6cc63c', '#9ee35a', '#d4ff8c'];   // de la raíz a la punta

function fpFranja(q){
  const dx = q.x1 - q.x0, dy = q.y1 - q.y0, len = Math.hypot(dx, dy); if(len < 6) return;
  const key = Math.round(len / 20);
  if(!q.fpl || q.fpKey !== key){                                            // las briznas se colocan una vez (y otra si la franja crece)
    q.fpKey = key; const seed = q.fpSeed || (q.fpSeed = Math.random() * 100), n = Math.round(len * FP.dens / 2) + 24, B = [], M = [];
    for(let i = 0; i < n; i++){
      const u = HH(i, seed), side = (HH(i, seed + 1) - .5) * 2, edge = .6 + .4 * Math.abs(Math.sin(u * 7 + seed)) * (.7 + .3 * Math.sin(u * 23 + seed * 2));
      if(Math.abs(side) > edge) continue;                                    // borde irregular: fuera de la silueta no crece
      const big = 1 - Math.abs(side) / edge * .65;
      B.push({u, o: side * q.w * 1.45, h: (14 + big * 22 + HH(i, seed + 3) * 14) * FP.alto, w: 1.6 + HH(i, seed + 4) * 1.5,
              p: HH(i, seed + 5) * 6.28, lean: (HH(i, seed + 6) - .5) * .7, c: Math.min(FP_COL.length - 1, 2 + Math.floor(HH(i, seed + 7) * 4))});
    }
    for(let i = 0; i < Math.max(3, len / 26); i++) M.push({u: HH(i, seed + 9), o: (HH(i, seed + 10) - .5) * q.w * 1.6, r: q.w * (.7 + HH(i, seed + 11) * .6)});   // manchas de tierra/hierba baja debajo
    q.fpl = B; q.fpm = M;
  }
  const a = clamp(Math.min(q.t / .25, (q.T - q.t) / .8), 0, 1); if(a <= 0) return;
  const ux = dx / len, uy = dy / len, t = g.t, grow = Math.min(1, q.t / .35), P = (u, o) => [q.x0 + ux * u * len - uy * o, q.y0 + uy * u * len + ux * o * .7];
  ctx.save();
  ctx.globalAlpha = .55 * a; ctx.fillStyle = '#1d4a18';                     // la base oscura (la hierba tapa el suelo)
  for(const m of q.fpm){ const [x, y] = P(m.u, m.o); ctx.beginPath(); ctx.ellipse(x, y, m.r * 1.5, m.r * .75, Math.atan2(dy, dx), 0, 6.3); ctx.fill(); }
  const pts = q.fpl.map(b => { const [x, y] = P(b.u, b.o); return {b, x, y}; }).sort((m, n) => m.y - n.y);
  ctx.globalAlpha = a;
  for(const {b, x, y} of pts){
    const h = b.h * grow * (.4 + .6 * a); if(h < 2) continue;
    const wave = Math.sin(t * 2.4 - b.u * len * .025) * .32 * FP.viento, flick = Math.sin(t * 7 + b.p) * .06;   // ola de viento que recorre la franja + temblor
    const ang = b.lean + wave + flick, tx = x + Math.sin(ang) * h, ty = y - Math.cos(ang) * h, mx = x + Math.sin(ang * .45) * h * .55, my = y - Math.cos(ang * .45) * h * .55;
    ctx.fillStyle = FP_COL[b.c - 2];                                         // brizna: base ancha, curva, punta fina
    ctx.beginPath(); ctx.moveTo(x - b.w, y); ctx.quadraticCurveTo(mx - b.w * .5, my, tx, ty); ctx.quadraticCurveTo(mx + b.w * .5, my, x + b.w, y); ctx.fill();
    ctx.fillStyle = FP_COL[b.c];                                             // brillo en la mitad de arriba
    ctx.beginPath(); ctx.moveTo(mx - b.w * .35, my); ctx.quadraticCurveTo((mx + tx) / 2, (my + ty) / 2, tx, ty); ctx.lineTo(mx + b.w * .35, my); ctx.fill();
  }
  ctx.restore();
}
if(typeof terrDraw === 'function'){ const o = terrDraw; terrDraw = function(){
    if(!FP.on || !g || !g.terr || !g.terr.some(q => q.type === 'planta')) return o.apply(this, arguments);
    const all = g.terr; g.terr = all.filter(q => q.type !== 'planta');
    try{ o.apply(this, arguments); } finally { g.terr = all; }
    ctx.save(); terrClip(); try{ all.forEach(q => { if(q.type === 'planta') fpFranja(q); }); }catch(e){} ctx.restore();
  }; }
