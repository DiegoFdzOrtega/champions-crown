"use strict";
/* =====================================================================
   LOS VOLADORES ALETEAN MÁS: los Pokémon de tipo Volador (y los que levitan con las alas) baten las alas más deprisa
   al moverse, también quietos un poco más rápido, y en la carrera aletean en vez de dar saltitos.
   VUELO.on = false lo apaga. VUELO.walk / VUELO.idle = cuánto más rápido (1 = como antes).
   ===================================================================== */
const VUELO = {on: true, walk: 1.9, idle: 1.5, dash: 2.6, desde: .2, hasta: .8, quieto: 1.1, alto: 4, bote: .3};      // alto: a cuántos px del suelo vuela (px del dibujo: en pantalla son unas 4 veces más) · bote: cuánto sube y baja al aletear (0 = nada, 1 = todo el salto)      // quieto: lo rápido que aletea parado (0 = parado se queda posado con su dibujo de siempre)      // desde / hasta: qué parte del salto se usa para aletear (0.2 a 0.8 = los cuadros del medio)
const VUELO_EXTRA = new Set([12, 15, 49, 166, 193, 267, 269, 284, 291, 313, 314, 329, 330, 380, 381, 414, 416, 469, 637, 666, 743]);   // con alas pero sin ser de tipo Volador (Butterfree, Beedrill, Flygon, Latios...)
const vueloEs = f => { const m = f && f.m; if(!m || typeof m.dex !== 'number') return false; if(VUELO_EXTRA.has(m.dex)) return true;
  const D = typeof DEX !== 'undefined' && DEX[m.dex - 1]; return !!(D && D.types && D.types.includes('volador')); };
if(typeof anPick === 'function'){ const o = anPick; anPick = function(f){
    const r = o.apply(this, arguments);
    try{ if(!VUELO.on || !f || f.dead || !vueloEs(f)) return r;
      const [a, t] = r;
      if((a === 'Walk' || a === 'Hop' || (a === 'Idle' && VUELO.quieto)) && typeof anHas === 'function' && anHas(f, 'Hop')){      // quieto también: vuela en el sitio     // al moverse: los cuadros del salto que están en el aire, de ida y vuelta (alas abajo → arriba → abajo...)
        const S = sheet(f.m.dex, 'Hop', false), n = (S && S.info && S.info.n) || 10;
        const a0 = Math.max(1, Math.round(n * VUELO.desde)), a1 = Math.min(n - 2, Math.round(n * VUELO.hasta) - 1), L = Math.max(1, a1 - a0);      // sin el primero ni el último (en el suelo)
        const k = Math.floor(g.t * ANIMS.Hop.fps * (a === 'Hop' ? VUELO.dash : a === 'Idle' ? VUELO.quieto : VUELO.walk) / 1.4) % (2 * L), fr = k < L ? a0 + k : a1 - (k - L);      // ida y vuelta: así baten las alas y no pegan saltos
        return ['Hop', (fr + .5) / ANIMS.Hop.fps]; }
      if(a === 'Hop') return ['Walk', (f.at || 0) * VUELO.dash];
      if(a === 'Walk') return ['Walk', t * VUELO.walk];
      if(a === 'Idle') return ['Idle', t * VUELO.idle];
    }catch(e){}
    return r; }; }

// ---- Altura de vuelo: los dibujos del salto llevan pintada la altura del salto (el pájaro sube mucho y se separa de su sombra).
//      Se mide en cada cuadro lo alto que está el Pokémon y se baja para que vuele siempre a VUELO.alto px del suelo (con un poco de bote).
const VUELO_ALT = {};
function vueloLift(dex, dir){                                                   // → [subida de cada cuadro] en px del dibujo, o null si aún no ha cargado
  const k = dex + ':' + dir; if(VUELO_ALT[k]) return VUELO_ALT[k];
  const im = sheet(dex, 'Hop', false); if(!im || !im.ok || !im.info) return null;
  const I = im.info, d = (dir + 1) * I.fh > im.height ? 0 : dir, c = document.createElement('canvas'); c.width = im.width; c.height = I.fh;
  const x = c.getContext('2d'); x.drawImage(im, 0, d * I.fh, im.width, I.fh, 0, 0, im.width, I.fh); const A = x.getImageData(0, 0, im.width, I.fh).data;
  const bottom = f => { for(let j = I.fh - 1; j >= 0; j--) for(let i = f * I.fw; i < (f + 1) * I.fw; i++) if(A[(j * im.width + i) * 4 + 3] > 40) return j; return I.fh - 1; };
  const B = []; for(let f = 0; f < I.n; f++) B.push(bottom(f)); const b0 = Math.max(B[0], B[I.n - 1]);
  return VUELO_ALT[k] = B.map(b => b0 - b);
}
if(typeof drawF === 'function' && typeof drawFrame === 'function'){
  let cur = null;
  const oF = drawF; drawF = function(f){ cur = VUELO.on && vueloEs(f) ? f : null; try{ return oF.apply(this, arguments); } finally { cur = null; } };
  const oD = drawFrame; drawFrame = function(c, dex, anim, t, dir, x, y, sc){
    if(cur && anim === 'Hop' && cur.m && cur.m.dex === dex){
      try{ const L = vueloLift(dex, dir); if(L){ const n = L.length, fr = Math.floor(t * ANIMS.Hop.fps) % n, a0 = Math.max(1, Math.round(n * VUELO.desde)), a1 = Math.min(n - 2, Math.round(n * VUELO.hasta) - 1);
        let lo = Infinity; for(let i = a0; i <= a1; i++) lo = Math.min(lo, L[i]);
        const want = VUELO.alto + Math.max(0, L[fr] - lo) * VUELO.bote; y += (L[fr] - want) * sc; } }catch(e){}
    }
    return oD.apply(this, arguments.length ? [c, dex, anim, t, dir, x, y, sc, ...[].slice.call(arguments, 8)] : arguments);
  };
}
