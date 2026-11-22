"use strict";
/* =====================================================================
   GOLPE AÉREO (rehecho con Gemini, 23-11-2026): como en el anime.
     1) detrás del Pokémon que ataca, una ESTELA blanca de velocidad (viene disparado hacia el rival);
     2) sobre el rival, un TAJO en media luna blanco;
     3) un DESTELLO de estrella donde le da y BRILLOS con rachas de aire alrededor;
     4) en el suelo queda un ARAÑAZO doble que se va borrando.
   Imágenes: assets/objetos/ataques/e/ga2_{estela,tajo,golpe,brillos,marca}.png (6 cuadros por fila).
   Solo es dibujo: no cambia cuándo ni cuánto pega (igual en los dos ordenadores del online).
   Sustituye a las rayas de manga que llenaban la pantalla (agGaDraw, js/ataquesgemini.js).
   ===================================================================== */
const GA2 = {on: true, estela: 190, tajo: 175, golpe: 150, brillos: 175, marca: 120, marcaDura: 2.5, dur: .75};   // [AJUSTE] anchos en px y duraciones (s)
const GA2_IMG = {};
['estela', 'tajo', 'golpe', 'brillos', 'marca'].forEach(k => { const im = new Image(); im.onload = () => { im.ok = true; im.fw = im.width / 6; }; im.src = `assets/objetos/ataques/e/ga2_${k}.png?v=1`; GA2_IMG[k] = im; });
const ga2Ok = () => ['estela', 'tajo', 'golpe', 'brillos', 'marca'].every(k => GA2_IMG[k].ok);
function ga2Fr(k, fr, x, y, w, A, rot, flip){                         // cuadro fr de la fila k, centrado en (x, y), de ancho w
  const im = GA2_IMG[k]; if(!im || !im.ok || A <= 0 || fr < 0 || fr > 5.999) return; const h = w * im.height / im.fw, f = fr | 0;
  ctx.save(); ctx.globalAlpha = Math.min(1, A); ctx.translate(x, y); if(rot) ctx.rotate(rot); if(flip) ctx.scale(-1, 1);
  ctx.drawImage(im, f * im.fw, 0, im.fw, im.height, -w / 2, -h / 2, w, h); ctx.restore();
}
if(GA2.on && typeof agGaDraw === 'function') agGaDraw = function(){};     // quita las rayas de manga antiguas que llenaban la pantalla
// Al acertar: se apunta dónde estaban los dos y se dibuja encima
if(GA2.on && typeof hit === 'function'){ const o = hit; hit = function(T, dmg, type, A, close, big, mvn){
  const r = o.apply(this, arguments);
  try{ if(mvn === 'Golpe Aéreo' && g && T && A && ga2Ok()){
    const ang = Math.atan2(T.y - A.y, T.x - A.x);
    fxAdd('impact', '_ga2', {x: T.x, y: T.y, ax: A.x, ay: A.y, ang, t0: g.t, dur: GA2.dur});
    ga2Marca(T.x, T.y + 14, ang);
  } }catch(e){}
  return r; }; }
FXR.impact._ga2 = e => {
  const u = g.t - e.t0, izq = Math.cos(e.ang) < 0, rot = izq ? e.ang + Math.PI : e.ang;
  const bx = e.ax - Math.cos(e.ang) * GA2.estela * .35, by = e.ay - 26 - Math.sin(e.ang) * GA2.estela * .35;
  ga2Fr('estela', u / .3 * 6, bx, by, GA2.estela, 1, rot, izq);                                        // estela detrás del que ataca
  ga2Fr('tajo', u / .36 * 6, e.x, e.y - 30, GA2.tajo, 1, 0, izq);                                       // tajo en media luna
  if(u > .04) ga2Fr('golpe', (u - .04) / .36 * 6, e.x, e.y - 30, GA2.golpe, 1);                        // destello
  if(u > .1) ga2Fr('brillos', Math.floor((u - .1) * 12) % 6, e.x, e.y - 34, GA2.brillos, u > .55 ? (GA2.dur - u) / (GA2.dur - .55) : 1);
};
// El arañazo va en el suelo (debajo de los Pokémon)
let ga2Marcas = [], ga2G = null;
function ga2Marca(x, y, ang){ if(ga2G !== g){ ga2G = g; ga2Marcas = []; } ga2Marcas.push({x, y, flip: Math.cos(ang) < 0, t0: g.t}); if(ga2Marcas.length > 20) ga2Marcas.shift(); }
function ga2MarcasDib(){
  if(!g || g !== ga2G || !ga2Marcas.length) return;
  for(let i = ga2Marcas.length - 1; i >= 0; i--){ const m = ga2Marcas[i], u = (g.t - m.t0) / GA2.marcaDura; if(u >= 1){ ga2Marcas.splice(i, 1); continue; }
    ga2Fr('marca', Math.min(5, u * 6), m.x, m.y, GA2.marca, u < .7 ? 1 : (1 - u) / .3, 0, m.flip); }
}
if(typeof fxhdGround === 'function'){ const o = fxhdGround; fxhdGround = function(){ const r = o.apply(this, arguments); try{ ga2MarcasDib(); }catch(e){} return r; }; }
