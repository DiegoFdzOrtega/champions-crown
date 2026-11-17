"use strict";
/* =====================================================================
   LOS VOLADORES ALETEAN MÁS: los Pokémon de tipo Volador (y los que levitan con las alas) baten las alas más deprisa
   al moverse, también quietos un poco más rápido, y en la carrera aletean en vez de dar saltitos.
   VUELO.on = false lo apaga. VUELO.walk / VUELO.idle = cuánto más rápido (1 = como antes).
   ===================================================================== */
const VUELO = {on: true, walk: 1.9, idle: 1.5, dash: 2.6};
const VUELO_EXTRA = new Set([12, 15, 49, 166, 193, 267, 269, 284, 291, 313, 314, 329, 330, 380, 381, 414, 416, 469, 637, 666, 743]);   // con alas pero sin ser de tipo Volador (Butterfree, Beedrill, Flygon, Latios...)
const vueloEs = f => { const m = f && f.m; if(!m || typeof m.dex !== 'number') return false; if(VUELO_EXTRA.has(m.dex)) return true;
  const D = typeof DEX !== 'undefined' && DEX[m.dex - 1]; return !!(D && D.types && D.types.includes('volador')); };
if(typeof anPick === 'function'){ const o = anPick; anPick = function(f){
    const r = o.apply(this, arguments);
    try{ if(!VUELO.on || !f || f.dead || !vueloEs(f)) return r;
      const [a, t] = r;
      if((a === 'Walk' || a === 'Hop') && typeof anHas === 'function' && anHas(f, 'Hop')){     // al moverse: los cuadros del MEDIO del salto (alas batiendo en el aire), en bucle
        const S = sheet(f.m.dex, 'Hop', false), n = (S && S.info && S.info.n) || 10, a0 = Math.round(n * .5), a1 = Math.max(a0 + 2, Math.round(n * .9));      // los cuadros con las alas abiertas
        const k = Math.floor(g.t * ANIMS.Hop.fps * (a === 'Hop' ? VUELO.dash : VUELO.walk) / 1.4);
        return ['Hop', (a0 + k % (a1 - a0) + .5) / ANIMS.Hop.fps]; }
      if(a === 'Hop') return ['Walk', (f.at || 0) * VUELO.dash];
      if(a === 'Walk') return ['Walk', t * VUELO.walk];
      if(a === 'Idle') return ['Idle', t * VUELO.idle];
    }catch(e){}
    return r; }; }
