"use strict";
/* =====================================================================
   RELIEVE DE LOS POKÉMON (como en Pokémon Battlegrounds): un contorno oscuro alrededor de cada sprite que lo despega
   del suelo y le da volumen, más una luz suave arriba y una sombra suave abajo.
   Se hace UNA vez por hoja al cargarla (js/sprites.js): la imagen se cambia por un lienzo ya preparado, así que
   dibujar cada cuadro cuesta lo mismo que antes. Solo dibujo.
   RELIEVE.on = false lo apaga (hay que recargar la página).
   ===================================================================== */
const RELIEVE = {on: true, borde: 1, color: 'rgba(22,14,28,.95)', luz: .16, sombra: .18};   // [AJUSTE] grosor del contorno (px de la hoja) · color · luz arriba · sombra abajo (0 = nada)
function relieveHoja(im){
  const w = im.width, h = im.height, b = RELIEVE.borde;
  const O = document.createElement('canvas'); O.width = w; O.height = h; const o = O.getContext('2d');
  for(let dy = -b; dy <= b; dy++) for(let dx = -b; dx <= b; dx++) if(dx || dy) o.drawImage(im, dx, dy);       // la silueta, un poco más gorda
  o.globalCompositeOperation = 'source-in'; o.fillStyle = RELIEVE.color; o.fillRect(0, 0, w, h);
  const C = document.createElement('canvas'); C.width = w; C.height = h; const c = C.getContext('2d');
  c.drawImage(O, 0, 0); c.drawImage(im, 0, 0);
  if(RELIEVE.luz || RELIEVE.sombra){                                                                   // volumen: luz por arriba (desplazada) y sombra por abajo, solo dentro del dibujo
    const L = document.createElement('canvas'); L.width = w; L.height = h; const l = L.getContext('2d');
    if(RELIEVE.sombra){ l.drawImage(im, 0, 0); l.globalCompositeOperation = 'source-in'; l.fillStyle = '#000'; l.fillRect(0, 0, w, h);
      l.globalCompositeOperation = 'destination-out'; l.drawImage(im, 0, -2); c.globalAlpha = RELIEVE.sombra; c.drawImage(L, 0, 0); }   // borde de abajo
    if(RELIEVE.luz){ l.globalCompositeOperation = 'source-over'; l.clearRect(0, 0, w, h); l.drawImage(im, 0, 0); l.globalCompositeOperation = 'source-in'; l.fillStyle = '#fff'; l.fillRect(0, 0, w, h);
      l.globalCompositeOperation = 'destination-out'; l.drawImage(im, 0, 2); c.globalAlpha = RELIEVE.luz; c.drawImage(L, 0, 0); }       // borde de arriba
    c.globalAlpha = 1;
  }
  return C;
}
if(RELIEVE.on && typeof sheet === 'function'){ const o = sheet; sheet = function(dex, a, shiny){
  const k = dex + '/' + (shiny ? 's/' : '') + a, nueva = !sheets[k], im = o.apply(this, arguments);
  if(nueva && im && im instanceof HTMLImageElement){
    const ol = im.onload; im.onload = function(){ if(ol) ol.apply(this, arguments);
      try{ if(im.ok && !im.bad){ const C = relieveHoja(im); C.info = im.info; C.ok = true; C.bad = false; C.relieve = 1; if(sheets[k] === im) sheets[k] = C; } }catch(e){} };
  }
  return sheets[k] || im; }; }
