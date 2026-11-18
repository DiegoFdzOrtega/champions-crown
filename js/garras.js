"use strict";
/* =====================================================================
   GARRAS (dibujos de Gemini en assets/fx/):
     Garra Dragón ... zarpazo morado y azul (gd_garra) + estallido con las tres marcas (gd_golpe)
     Garra Metal .... zarpazo plateado con brillo y chispas de metal (gm_garra)
     Arañazo ........ tres arañazos blancos y dorados (ar_garra)
   Y la ESTELA al lanzarse sobre el rival (js/lanzarse.js): líneas de velocidad con polvo detrás y onda delante (lg_estela).
   El zarpazo se dibuja en el rival y se voltea según hacia dónde golpeas. GA.<x> = tamaños.
   ===================================================================== */
const GA_FN = {};
const GA = {gd: .36, gdHit: .55, gm: .62, ar: .55, estela: .7};
Object.assign(GM.meta, {gd_garra: {fw: 221, fh: 324, n: 5}, gd_golpe: {fw: 178, fh: 187, n: 6}, gm_garra: {fw: 173, fh: 116, n: 5}, ar_garra: {fw: 175, fh: 160, n: 4}, lg_estela: {fw: 262, fh: 76, n: 3}});
['gd_garra', 'gd_golpe', 'gm_garra', 'ar_garra', 'lg_estela'].forEach(k => { const im = new Image(); im.onload = () => { GM.meta[k].ok = true; }; im.src = `assets/fx/${k}.png?v=1`; GM.img[k] = im; });
function gaDraw(k, i, x, y, sc, flip, A){                                                          // dibuja un cuadro, volteado si golpeas hacia la izquierda
  const M = GM.meta[k], im = GM.img[k]; if(!M || !M.ok) return; i = Math.max(0, Math.min(M.n - 1, i));
  ctx.save(); ctx.translate(x, y); if(flip) ctx.scale(-1, 1); ctx.globalAlpha *= A == null ? 1 : A; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(im, i * M.fw, 0, M.fw, M.fh, -M.fw * sc / 2, -M.fh * sc / 2, M.fw * sc, M.fh * sc); ctx.restore();
}
// zarpazo (kA, dura tA s) y, si hay, golpe (kH, empieza en hA y dura dH s)
function gaClaw(nm, kA, scA, tA, kH, scH, hA, dH){
  const keys = kH ? [kA, kH] : [kA];
  g4Swap(FXR.melee, nm, keys, () => {});                                                          // (en la capa de efectos no se dibuja: quedaría tapado por el rival)
  GA_FN[nm] = {keys, fn: (e, a) => {
    const flip = Math.cos(e.ang || 0) < 0, x = e.x, y = e.y - 10;
    if(a < tA){ const u = a / tA; gaDraw(kA, Math.floor(u * GM.meta[kA].n), x, y, scA, flip, u > .85 ? (1 - u) / .15 : 1); }
    if(kH && a >= hA){ const u = (a - hA) / dH; if(u < 1) gaDraw(kH, Math.floor(u * GM.meta[kH].n), x, y + 4, scH, flip, u > .85 ? (1 - u) / .15 : 1); }
  }};
}
function gaTopDraw(){                                                                              // los zarpazos, ENCIMA de los Pokémon
  for(const e of fx.list){ const G = e.kind === 'melee' && GA_FN[e.name]; if(!G || e.t < e.delay || !gmOk(...G.keys)) continue;
    ctx.save(); try{ G.fn(e, e.t - e.delay); }catch(err){} ctx.restore(); }
}
if(typeof megaDraw === 'function'){ const o = megaDraw; megaDraw = function(){ const r = o.apply(this, arguments); try{ if(g) gaTopDraw(); }catch(e){} return r; }; }
gaClaw('Garra Dragón', 'gd_garra', GA.gd, .3, 'gd_golpe', GA.gdHit, .12, .42);
gaClaw('Garra Metal', 'gm_garra', GA.gm, .45);
gaClaw('Arañazo', 'ar_garra', GA.ar, .32);

// Estela al lanzarse: guarda hacia dónde va y dibuja las líneas de velocidad detrás (la onda, delante)
if(typeof lgTick === 'function'){ const o = lgTick; lgTick = function(dt){
  [...g.p, ...g.e].forEach(f => { const L = f && f.v13l; if(L){ const T = foe(L.mine); if(T) L.ang = Math.atan2(T.y - f.y, T.x - f.x); } });
  return o.apply(this, arguments); }; }
if(typeof lgDraw === 'function'){ const o = lgDraw; lgDraw = function(){
  const r = o.apply(this, arguments);
  if(GM.meta.lg_estela && GM.meta.lg_estela.ok) [...g.p, ...g.e].forEach(f => { const L = f && f.v13l; if(!L || L.ang == null) return;
    const M = GM.meta.lg_estela, sc = GA.estela, fr = Math.min(M.n - 1, Math.floor(L.t / .07));
    ctx.save(); ctx.translate(f.x, f.y - 6); ctx.rotate(L.ang); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = .9;
    ctx.drawImage(GM.img.lg_estela, fr * M.fw, 0, M.fw, M.fh, -M.fw * sc + 18, -M.fh * sc / 2, M.fw * sc, M.fh * sc); ctx.restore(); });
  return r; }; }
