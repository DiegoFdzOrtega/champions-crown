"use strict";
/* =====================================================================
   CORTE BLANCO EN LOS GOLPES A MELÉ (como Scizor en Pokémon Battlegrounds): al pegar, un arco blanco fino barre por
   delante del Pokémon hacia el rival, con un par de rayitas blancas. Va encima del dibujo de cada ataque.
   Solo dibujo. CORTE.on = false lo apaga.
   ===================================================================== */
const CORTE = {on: true, ini: .04, fin: .3, R: 34, barre: 2.4, grosor: 7, alfa: .95};   // [AJUSTE] cuándo empieza y acaba (fracción del golpe... en s) · radio · ángulo que barre (rad) · grosor · opacidad
function corteDib(e, a){
  const u = (a - CORTE.ini) / (CORTE.fin - CORTE.ini); if(u <= 0 || u >= 1) return;
  const f = e.fol, L = f && typeof fxLunge === 'function' ? fxLunge(f) : {x: 0, y: 0};
  const cx = f ? f.x + L.x + Math.cos(e.ang) * 18 : e.x, cy = f ? f.y + L.y - 10 + Math.sin(e.ang) * 10 : e.y;
  const lado = (e.corteL ??= ((Math.floor((e.cT0 || 0) * 7) % 2) ? 1 : -1));                  // unas veces de arriba abajo y otras al revés
  const a0 = e.ang - CORTE.barre / 2 * lado, a1 = a0 + CORTE.barre * lado * Math.min(1, u * 1.6), tail = a0 + CORTE.barre * lado * Math.max(0, u * 1.6 - .6);
  const A = CORTE.alfa * (u < .7 ? 1 : (1 - u) / .3);
  ctx.save(); ctx.lineCap = 'round'; ctx.translate(cx, cy); ctx.scale(1, .75);
  const N = 10; for(let i = 0; i < N; i++){                                                  // arco que se afina por la cola
    const t0 = tail + (a1 - tail) * i / N, t1 = tail + (a1 - tail) * (i + 1) / N, w = CORTE.grosor * (.25 + .75 * (i + 1) / N);
    ctx.strokeStyle = `rgba(255,255,255,${A * (.35 + .65 * (i + 1) / N)})`; ctx.lineWidth = w;
    ctx.beginPath(); ctx.arc(0, 0, CORTE.R, Math.min(t0, t1), Math.max(t0, t1)); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${A * .8})`; ctx.lineWidth = 1.5;          // rayitas de velocidad
  for(let k = -1; k <= 1; k += 2){ const px = cx + Math.cos(e.ang) * (CORTE.R + 6) + Math.sin(e.ang) * k * 12, py = cy + Math.sin(e.ang) * (CORTE.R + 6) * .75 - Math.cos(e.ang) * k * 9;
    const l = 16 * (1 - u); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - Math.cos(e.ang) * l, py - Math.sin(e.ang) * l * .75); ctx.stroke(); }
  ctx.restore();
}
if(typeof fxDraw === 'function'){ const o = fxDraw; fxDraw = function(){ const r = o.apply(this, arguments);
  try{ if(CORTE.on && fx && fx.list) for(const e of fx.list){ if(e.kind !== 'melee' || e.t < (e.delay || 0)) continue; if(e.cT0 == null) e.cT0 = g.t; corteDib(e, e.t - (e.delay || 0)); } }catch(err){}
  return r; }; }

// MARCAS DE ARAÑAZO EN EL SUELO (como en el vídeo): al golpear, tres rayas oscuras cortas en el suelo bajo el que recibe,
// que se quedan como el resto de marcas del suelo (js/fxsuelo.js). CORTE.marcas = false las quita.
CORTE.marcas = true;
function cortePintaArañazo(x, y, ang){
  if(typeof suCanvas !== 'function') return null;
  const R = 26, [c, s] = suCanvas(x - R - 6, y - R - 6, x + R + 6, y + R + 6), pa = ang + Math.PI / 2 + .5;   // rayas cruzadas al golpe
  s.lineCap = 'round';
  for(let k = -1; k <= 1; k++){ const ox = Math.cos(ang) * k * 7, oy = Math.sin(ang) * k * 5, L = R * (k ? .78 : 1);
    const x0 = x + ox - Math.cos(pa) * L, y0 = y + oy - Math.sin(pa) * L * .55, x1 = x + ox + Math.cos(pa) * L, y1 = y + oy + Math.sin(pa) * L * .55;
    s.strokeStyle = 'rgba(30,20,12,.55)'; s.lineWidth = 3; s.beginPath(); s.moveTo(x0, y0); s.lineTo(x1, y1); s.stroke();
    s.strokeStyle = 'rgba(255,240,215,.22)'; s.lineWidth = 1; s.beginPath(); s.moveTo(x0, y0 + 2); s.lineTo(x1, y1 + 2); s.stroke(); }   // borde claro (relieve)
  return c;
}
if(typeof hit === 'function'){ const o = hit; hit = function(T, dmg, type, A, close){
  const r = o.apply(this, arguments);
  try{ if(CORTE.on && CORTE.marcas && close && T && A && A !== T && typeof suAdd === 'function'){ const b = typeof bodyOf === 'function' ? bodyOf(T) : {foot: T.y + 20};
      suAdd(cortePintaArañazo(T.x, b.foot - 2, Math.atan2(T.y - A.y, T.x - A.x))); } }catch(e){}
  return r; }; }
