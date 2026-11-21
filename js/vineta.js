"use strict";
/* =====================================================================
   VIÑETA DE CÓMIC AL USAR LA E (como en Pokémon Battlegrounds): durante un instante cruza la pantalla una franja clara
   con líneas negras que salen hacia el Pokémon, su silueta negra en grande y el nombre del ataque en letras gordas.
   Entra deslizándose, se queda un momento y se va. No para el combate (es solo dibujo, encima de todo).
   Para que no canse: como mucho una cada VIN.cada segundos. VIN.on = false la apaga; VIN.rival = false solo sale con la tuya.
   ===================================================================== */
const VIN = {on: false, rival: true, dura: .62, cada: 5, alto: .34, tam: 30};   // [AJUSTE] segundos · separación mínima entre viñetas · alto de la franja (fracción de la pantalla) · tamaño de las letras
let vinV = null, vinUlt = -99;
if(typeof use === 'function'){ const o = use; use = function(f, i){
  const cd0 = f && f.cd ? f.cd[i] : 0, r = o.apply(this, arguments);
  try{
    if(VIN.on && g && f && i === 4 && f.cd[i] > cd0 && !f.anFail && g.t - vinUlt > VIN.cada){
      const mio = g.p && g.p.includes(f);
      if(mio || VIN.rival){ vinUlt = g.t; vinV = {f, mio, t0: g.t, nm: typeof mvName === 'function' ? mvName(f, i) : '', tipo: typeof mtype === 'function' ? mtype(f, i) : 'normal', sil: vinSilueta(f)}; }
    }
  }catch(e){}
  return r; }; }
function vinSilueta(f){                                          // la silueta negra del Pokémon (de su cuadro de ataque), en un lienzo aparte
  try{ const C = document.createElement('canvas'); C.width = 340; C.height = 340; const c = C.getContext('2d');
    drawFrame(c, f.m.dex, 'Attack', .15, 2, 170, 210, 8, 250, false);
    c.globalCompositeOperation = 'source-in'; c.fillStyle = '#0c0a10'; c.fillRect(0, 0, 340, 340); return C; }catch(e){ return null; }
}
function vinDraw(){
  const V = vinV; if(!VIN.on || !V || !g) return;
  const a = g.t - V.t0; if(a < 0 || a > VIN.dura){ vinV = null; return; }
  const entra = Math.min(1, a / .09), sale = Math.min(1, (VIN.dura - a) / .12), k = 1 - Math.pow(1 - entra, 3);
  const hB = H * VIN.alto, y0 = H * .5 - hB / 2, dir = V.mio ? 1 : -1, off = (1 - k) * W * dir * -1, sk = H * .06;
  const px = V.mio ? W * .72 : W * .28, py = y0 + hB * .55;                                   // de dónde salen las líneas (detrás de la silueta)
  ctx.save(); ctx.globalAlpha = sale; ctx.translate(off, 0);
  ctx.beginPath(); ctx.moveTo(-20, y0 + sk); ctx.lineTo(W + 20, y0 - sk); ctx.lineTo(W + 20, y0 + hB - sk); ctx.lineTo(-20, y0 + hB + sk); ctx.closePath();
  ctx.fillStyle = '#0c0a10'; ctx.save(); ctx.translate(0, 4); ctx.fill(); ctx.restore();       // borde negro de la franja
  ctx.fillStyle = '#f5f0e4'; ctx.fill(); ctx.save(); ctx.clip();
  ctx.fillStyle = '#0c0a10';                                                                      // líneas de velocidad hacia la silueta
  for(let i = 0; i < 26; i++){ const an = i / 26 * 6.283 + ((i * 53) % 11) / 11 * .2, L = W * (.8 + ((i * 37) % 10) / 20), w = .018 + ((i * 13) % 7) / 300;
    ctx.beginPath(); ctx.moveTo(px + Math.cos(an) * 46, py + Math.sin(an) * 46); ctx.lineTo(px + Math.cos(an - w) * L, py + Math.sin(an - w) * L); ctx.lineTo(px + Math.cos(an + w) * L, py + Math.sin(an + w) * L); ctx.fill(); }
  if(V.sil){ const s = hB * 1.25 / 300; ctx.save(); ctx.translate(px, py + hB * .05); ctx.scale(V.mio ? s : -s, s); ctx.drawImage(V.sil, -170, -190); ctx.restore(); }
  ctx.restore();
  // el nombre del ataque, grande, inclinado
  if(V.nm){ const col = (typeof TC !== 'undefined' && TC[V.tipo]) || '#ffd84a', tx = V.mio ? W * .3 : W * .7;
    ctx.save(); ctx.translate(tx + (1 - k) * 40 * dir, y0 + hB * .52); ctx.transform(1, 0, -.18, 1, 0, 0); ctx.font = `${VIN.tam}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const t = V.nm.toUpperCase() + '!'; ctx.lineJoin = 'round'; ctx.lineWidth = 9; ctx.strokeStyle = '#0c0a10'; ctx.strokeText(t, 0, 0);
    ctx.fillStyle = '#fff6c8'; ctx.fillText(t, 0, 0); ctx.globalAlpha = sale * .55; ctx.fillStyle = col; ctx.fillText(t, 0, 3); ctx.restore(); }
  ctx.restore();
}
// encima de todo, ya en coordenadas de pantalla (junto a los carteles, js/fxnuevos.js)
if(typeof nvBannerDraw === 'function'){ const o = nvBannerDraw; nvBannerDraw = function(){ const r = o.apply(this, arguments); try{ vinDraw(); }catch(e){} return r; }; }
