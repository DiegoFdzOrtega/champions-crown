"use strict";
/* =====================================================================
   EMBESTIDAS CON DIBUJO (sprites de Gemini en assets/objetos):
   - Envite Ígneo: mientras mantienes la E, el fuego se junta alrededor del Pokémon y forma un anillo (envite_carga.png, 6 figuras);
     al soltar sales disparado dentro de una BOLA DE FUEGO con cola (envite_igneo.png, 4 figuras).
   - Pájaro Osado: sales disparado dentro de un COMETA DE LUZ con rayas de viento (pajaro_osado.png, 4 figuras), como en Pokémon Sol y Luna.
   El cometa va pegado al Pokémon y gira hacia donde lo diriges. Si una imagen no carga, se ve el fénix dibujado de antes (js/fxtipos.js).
   ===================================================================== */
const EMB = {
  fps: 12,                                                                     // [AJUSTE] figuras por segundo de la animación
  sc: 1.15,                                                                    // [AJUSTE] tamaño del cometa (1 = tamaño de la imagen)
  core: .8,                                                                    // [AJUSTE] dónde está el centro brillante del cometa (0 = cola, 1 = punta): ahí va el Pokémon
  up: 20,                                                                      // [AJUSTE] cuánto sube el cometa para quedar a la altura del cuerpo (px)
  alpha: .93,                                                                  // [AJUSTE] opacidad del cometa
  carga: 1.7,                                                                  // [AJUSTE] tamaño del anillo de carga respecto al cuerpo
  img: {}
};
[['Envite Ígneo', 'assets/objetos/envite_igneo.png', 4], ['Pájaro Osado', 'assets/objetos/pajaro_osado.png', 4], ['_carga', 'assets/objetos/envite_carga.png', 6]].forEach(([k, src, n]) => {
  const i = new Image(), o = EMB.img[k] = {i, n, ok: false}; i.onload = () => { o.ok = true; o.fw = i.width / n; o.fh = i.height; }; i.src = src + '?v=1';
});
function embComet(s, a, an, nm, old){
  const S = EMB.img[nm]; if(!S || !S.ok) return old(s, a, an);
  const fr = Math.floor(g.t * EMB.fps) % S.n, left = Math.cos(an) < 0;
  ctx.save();
  ctx.globalAlpha = EMB.alpha * Math.min(1, a / .1); ctx.imageSmoothingEnabled = false;
  ctx.translate(s.x, s.y - EMB.up); ctx.rotate(an); if(left) ctx.scale(1, -1);           // hacia la izquierda: se voltea para que no quede boca abajo
  ctx.scale(EMB.sc, EMB.sc);
  ctx.drawImage(S.i, fr * S.fw, 0, S.fw, S.fh, -S.fw * EMB.core, -S.fh / 2, S.fw, S.fh);
  ctx.restore();
}
if(typeof HERO4 !== 'undefined'){
  [['Envite Ígneo', typeof hgEnviteFlight === 'function' ? hgEnviteFlight : null], ['Pájaro Osado', typeof hgBraveFlight === 'function' ? hgBraveFlight : null]].forEach(([nm, old]) => {
    if(HERO4[nm] && old){ HERO4[nm].flt = (s, a, an) => embComet(s, a, an, nm, old); HERO4[nm].sc = 1; }
  });
}
// Carga de Envite Ígneo: el anillo de fuego se forma alrededor del Pokémon mientras mantienes la E
if(typeof nvWindFx === 'function'){
  const oldWind = nvWindFx;
  nvWindFx = function(f, w){
    const S = EMB.img._carga;
    if(w && w.nm === 'Envite Ígneo' && S.ok){
      const k = Math.max(0, Math.min(1, w.hold ? (w.c || 0) / (FEEL.wind || 1) : 1 - w.t / w.T));           // 0 → 1 hasta que la carga está lista
      const fr = k < 1 ? Math.min(4, Math.floor(k * 5)) : 4 + (Math.floor(g.t * 10) % 2);                    // al estar lista, parpadea entre las dos últimas
      const b = typeof bodyOf === 'function' ? bodyOf(f) : {top: f.y - 50, foot: f.y + 20}, cy = (b.top + b.foot) / 2, H2 = (b.foot - b.top) * EMB.carga, W2 = H2 * S.fw / S.fh;
      ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = .95;
      ctx.drawImage(S.i, fr * S.fw, 0, S.fw, S.fh, f.x - W2 / 2, cy - H2 / 2, W2, H2);
      ctx.restore();
      return;
    }
    return oldWind.apply(this, arguments);
  };
}
// Al lanzarse ya no salen las llamas dibujadas que envolvían al Pokémon (js/fxtipos.js, _hgEngulf): taparían el cometa
if(typeof FXR !== 'undefined' && FXR.cast) ['Envite Ígneo', 'Pájaro Osado'].forEach(nm => {
  const old = FXR.cast[nm]; if(!old) return;
  const w = function(f){ if(EMB.img[nm] && EMB.img[nm].ok){ fx.shake = Math.max(fx.shake, 3); return; } return old.apply(this, arguments); };
  Object.assign(w, old); FXR.cast[nm] = w;
});
