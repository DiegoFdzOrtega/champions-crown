"use strict";
/* =====================================================================
   CARTEL CON EL NOMBRE DEL ATAQUE (como en Pokémon Battlegrounds): al usar la E (ataque fuerte) o la Q (mejora),
   sale una etiqueta «¡Hidrobomba!» bajo el panel de vida de ese lado (tú a la izquierda, el rival a la derecha),
   con el borde del color del tipo. Entra deslizándose, se queda un momento y se va.
   Solo dibujo: no cambia nada del combate. CARTEL.on = false lo apaga.
   ===================================================================== */
const CARTEL = {on: true, dura: 1.6, teclas: [3, 4], y: .145, x: .012, tam: 12};   // [AJUSTE] segundos · qué ataques (3 = Q, 4 = E) · posición (fracción de la pantalla) · tamaño de letra

if(typeof use === 'function'){ const o = use; use = function(f, i){
  const cd0 = f && f.cd ? f.cd[i] : 0, r = o.apply(this, arguments);
  try{
    if(CARTEL.on && f && g && CARTEL.teclas.includes(i) && f.cd[i] > cd0 && !f.anFail){
      const lado = g.p && g.p.includes(f) ? 0 : 1, nm = typeof mvName === 'function' ? mvName(f, i) : '';
      if(nm){ g.carteles = g.carteles || []; g.carteles[lado] = {txt: '¡' + nm + '!', tipo: typeof mtype === 'function' ? mtype(f, i) : 'normal', t0: g.t}; }
    }
  }catch(e){}
  return r; }; }

function cartelDraw(){
  if(!CARTEL.on || !g || !g.carteles) return;
  for(let lado = 0; lado < 2; lado++){
    const c = g.carteles[lado]; if(!c) continue;
    const a = g.t - c.t0; if(a < 0 || a > CARTEL.dura){ g.carteles[lado] = null; continue; }
    const entra = Math.min(1, a / .14), sale = Math.min(1, (CARTEL.dura - a) / .25), k = 1 - Math.pow(1 - entra, 3);
    const s = CARTEL.tam; ctx.save(); ctx.font = `${s}px ${FONT}`;
    const tw = ctx.measureText(c.txt).width, w = tw + s * 2.2, h = s * 2.1, y = H * CARTEL.y;
    const x = lado === 0 ? W * CARTEL.x - (1 - k) * (w + 20) : W - W * CARTEL.x - w + (1 - k) * (w + 20);
    const col = (typeof TC !== 'undefined' && TC[c.tipo]) || '#ffffff';
    ctx.globalAlpha = sale;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; cartelPill(x + 2, y + 3, w, h); ctx.fill();                       // sombra
    ctx.fillStyle = '#f7f7f2'; cartelPill(x, y, w, h); ctx.fill();                                        // fondo claro
    ctx.lineWidth = 3; ctx.strokeStyle = col; cartelPill(x, y, w, h); ctx.stroke();                     // borde del color del tipo
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(lado === 0 ? x + s * .75 : x + w - s * .75, y + h / 2, s * .32, 0, 6.283); ctx.fill();   // puntito del tipo
    ctx.fillStyle = '#16181f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(c.txt, x + w / 2 + (lado === 0 ? s * .3 : -s * .3), y + h / 2 + 1);
    ctx.restore();
  }
}
function cartelPill(x, y, w, h){ const r = h / 2; ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arc(x + w - r, y + r, r, -1.5708, 1.5708); ctx.lineTo(x + r, y + h); ctx.arc(x + r, y + r, r, 1.5708, 4.7124); ctx.closePath(); }

// se dibuja junto al cartel grande (js/fxnuevos.js), ya en coordenadas de pantalla
if(typeof nvBannerDraw === 'function'){ const o = nvBannerDraw; nvBannerDraw = function(){ const r = o.apply(this, arguments); try{ cartelDraw(); }catch(e){} return r; }; }
