"use strict";
/* =====================================================================
   RAYAS DE VELOCIDAD (como en Pokémon Battlegrounds): cuando un Pokémon se mueve rápido (la carrera, al lanzarse a
   pegar, al salir despedido...) le salen detrás tres rayas oscuras cortas en la dirección contraria a la que va.
   Solo dibujo. MOV.on = false lo apaga.
   ===================================================================== */
const MOV = {on: true, min: 380, largo: .1, max: 70, dura: .14, color: '40,26,16', alfa: .75, sep: 10};   // [AJUSTE] velocidad mínima (px/s) · largo (× velocidad) · largo máximo · lo que tardan en irse · color · opacidad · separación
function movRayas(f){
  if(!MOV.on || !f || !f.m || f.dead || f.ghost || !g) return;
  const L = typeof fxLunge === 'function' ? fxLunge(f) : {x: 0, y: 0}, x = f.x + L.x, y = f.y + L.y, t = g.t;
  const M = f.mov || (f.mov = {x, y, t, vx: 0, vy: 0, on: -1});
  const dt = t - M.t;
  if(dt > 0 && dt < .2){ const vx = (x - M.x) / dt, vy = (y - M.y) / dt; M.vx += (vx - M.vx) * .5; M.vy += (vy - M.vy) * .5; }
  else if(dt >= .2){ M.vx = 0; M.vy = 0; }
  M.x = x; M.y = y; M.t = t;
  const sp = Math.hypot(M.vx, M.vy);
  if(sp > MOV.min){ M.on = t; M.a = Math.atan2(M.vy, M.vx); M.sp = sp; }
  const u = (t - M.on) / MOV.dura; if(M.on < 0 || u >= 1) return;
  const c = Math.cos(M.a), s = Math.sin(M.a), len = Math.min(MOV.max, M.sp * MOV.largo) * (1 - u * .5), I = typeof idleInfo === 'function' ? idleInfo(f.m.dex) : null;
  const cy = y - (I ? I.fh * ESCALA * .12 : 10), back = (I ? I.fw * ESCALA * .22 : 18);
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(${MOV.color},${MOV.alfa * (1 - u)})`;
  [[-1, .8, 2.5], [0, 1, 3], [1, .65, 2.5]].forEach(([k, l, w]) => {
    const ox = x - c * back - s * k * MOV.sep, oy = cy - s * back * .6 + c * k * MOV.sep * .6;
    ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox - c * len * l, oy - s * len * l * .6); ctx.stroke(); });
  ctx.restore();
}
// se dibujan encima del polvo y de los efectos (si no, el polvo de la carrera las tapa)
if(typeof fxDraw === 'function'){ const o = fxDraw; fxDraw = function(){ const r = o.apply(this, arguments); try{ if(g && g.p && g.e) [g.p[g.pi], g.e[g.ei]].forEach(movRayas); }catch(e){} return r; }; }
