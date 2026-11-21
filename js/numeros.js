"use strict";
/* =====================================================================
   NÚMEROS DE DAÑO COMO EN POKÉMON BATTLEGROUNDS: blancos, grandes, con un borde negro grueso, que dan un saltito al
   salir y suben un poco. Cuanto más daño, más grandes. (Los avisos «¡Es muy eficaz!» siguen igual: js/fxvideo3.js.)
   Solo dibujo. NUM.on = false vuelve a los de antes.
   ===================================================================== */
const NUM = {on: true, min: 13, max: 24, porDano: .09, borde: 4, color: '#ffffff', bordeCol: '#101014'};   // [AJUSTE] tamaño mínimo y máximo (px) · cuánto crece por punto de daño · grosor del borde · colores
if(typeof popStyled === 'function'){ const o = popStyled; popStyled = function(p, x, y){
  if(!NUM.on || !p || !/^\d+$/.test(p.txt)) return o.apply(this, arguments);
  if(p.n0 == null) p.n0 = p.t; const age = p.n0 - p.t, out = Math.min(1, p.t / .25);
  const pop = age < .08 ? .5 + .9 * (age / .08) : age < .18 ? 1.4 - .4 * ((age - .08) / .1) : 1;      // salta grande y se asienta
  const fs = Math.round(Math.min(NUM.max, NUM.min + (+p.txt) * NUM.porDano));
  ctx.save(); ctx.font = `${fs}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.translate(x, y - age * 18); ctx.scale(pop, pop); ctx.globalAlpha = out;
  ctx.lineJoin = 'round'; ctx.lineWidth = NUM.borde * 2; ctx.strokeStyle = NUM.bordeCol; ctx.strokeText(p.txt, 0, 0);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillText(p.txt, 1.5, 2.5);                                    // sombra
  ctx.fillStyle = p.c && p.c !== '#ffe066' && p.c !== '#ffffff' && /^#(ff9|ffb|ffd|ff6)/i.test(p.c) ? '#fff2a8' : NUM.color;   // críticos/naranjas: blanco un poco amarillo
  ctx.fillText(p.txt, 0, 0);
  ctx.restore(); return true;
}; }
