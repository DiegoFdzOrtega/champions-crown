"use strict";
/* =====================================================================
   HIDROBOMBA DE BLASTOISE POR SUS DOS CAÑONES (como en el anime): en vez de un chorro desde la boca, salen dos
   chorros (algo más finos), uno de cada cañón de la espalda, paralelos hacia donde apunta.
   Solo dibujo: dónde y cuánto pega se sigue calculando igual que antes (desde la boca), así el online no cambia.
   CANON.on = false lo apaga.
   ===================================================================== */
const CANON = {on: true, dex: [9], ancho: .62, lado: 15, alto: .62, delante: 4};   // [AJUSTE] grosor de cada chorro (× el normal) · separación de los cañones (px) · altura (fracción del cuerpo, desde los pies) · cuánto salen hacia delante
function canonPuntos(f, ang){
  const bo = typeof bodyOf === 'function' ? bodyOf(f) : {top: f.y - 60, foot: f.y + 20};
  const cx = f.x + Math.cos(ang) * CANON.delante, cy = bo.foot - (bo.foot - bo.top) * CANON.alto + Math.sin(ang) * CANON.delante * .5;
  const px = -Math.sin(ang), py = Math.cos(ang) * .8;                       // perpendicular (aplastada: la vista es un poco desde arriba)
  return [[cx + px * CANON.lado, cy + py * CANON.lado], [cx - px * CANON.lado, cy - py * CANON.lado]];
}
if(typeof puDraw === 'function'){ const o = puDraw; puDraw = function(f, P){
  const b = f && f.burst;
  if(!CANON.on || !b || b.nm !== 'Hidrobomba' || !f.m || !CANON.dex.includes(f.m.dex)) return o.apply(this, arguments);
  const x0 = b.x0, y0 = b.y0, P2 = Object.assign({}, P, {base: P.base * CANON.ancho}), pts = canonPuntos(f, b.cur);
  // primero el cañón de detrás (según hacia dónde mira), para que el de delante quede encima
  pts.sort((a, c) => a[1] - c[1]);
  try{ for(const [x, y] of pts){ b.x0 = x; b.y0 = y; o.call(this, f, P2); } }
  finally { b.x0 = x0; b.y0 = y0; }
}; }
