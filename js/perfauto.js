"use strict";
/* =====================================================================
   RENDIMIENTO AUTOMÁTICO EN PC (Ajustes › Modo rendimiento = «Auto»)
   Si en un combate los cuadros tardan demasiado (menos de ~40 fps durante 2 segundos seguidos), baja la calidad sola, en dos pasos:
     1) quita el brillo (bloom, js/fxhd.js) y los desenfoques (shadowBlur / filter) del lienzo, que son lo que más cuesta a la tarjeta gráfica;
     2) si sigue yendo mal, dibuja el combate a resolución 1× (en vez de hasta 2,5×).
   Se recuerda en localStorage 'arena2d_perf_lvl' para no empezar con tirones la próxima vez. Al elegir otra opción en Ajustes se olvida.
   En móviles ya está el modo rendimiento de siempre (LOWFX, state.js) y esto no hace nada.
   ===================================================================== */
const PERF = {lvl:0, low:false, ema:16.7, bad:0};
(function(){
  if(LOWFX || perfPref() !== 'auto') return;
  const KEY = 'arena2d_perf_lvl';
  const P = CanvasRenderingContext2D.prototype;
  for(const k of ['shadowBlur', 'filter']){                                    // en nivel 1+ se ignoran (como en el móvil)
    const d = Object.getOwnPropertyDescriptor(P, k); if(!d || !d.set) continue;
    try{ Object.defineProperty(ctx, k, {configurable:true, get(){ return PERF.low ? (k === 'filter' ? 'none' : 0) : d.get.call(this); }, set(v){ if(!PERF.low) d.set.call(this, v); }}); }catch(e){}
  }
  function setLvl(n, why){
    n = Math.max(0, Math.min(2, n | 0)); if(n === PERF.lvl) return;
    PERF.lvl = n; PERF.low = n >= 1;
    if(PERF.low){ try{ CanvasRenderingContext2D.prototype.__lookupSetter__('shadowBlur').call(ctx, 0); CanvasRenderingContext2D.prototype.__lookupSetter__('filter').call(ctx, 'none'); }catch(e){} }
    const dpr = n >= 2 ? 1 : 2.5; if(dpr !== PERF_DPR){ PERF_DPR = dpr; try{ resize(); }catch(e){} }
    try{ localStorage.setItem(KEY, String(n)); }catch(e){}
    if(why && typeof toast === 'function') toast(n === 1 ? 'El combate iba a tirones: he quitado el brillo de los ataques para que vaya fluido (Ajustes › Modo rendimiento).'
                                                   : 'Seguía yendo a tirones: ahora el combate se dibuja a menos resolución (Ajustes › Modo rendimiento).');
  }
  setLvl(+(localStorage.getItem(KEY) || 0) || 0, false);
  if(typeof perfSet === 'function'){ const _ps = perfSet; perfSet = function(v){ try{ localStorage.removeItem(KEY); }catch(e){} return _ps.apply(this, arguments); }; }
  let last = 0;
  function tick(t){
    const dt = last ? t - last : 16.7; last = t;
    const live = typeof g !== 'undefined' && g && !g.over && !(g.count > 0) && document.visibilityState === 'visible'
      && document.getElementById('pause') && document.getElementById('pause').classList.contains('hide');
    if(live && dt < 250){
      PERF.ema += (dt - PERF.ema) * .05;
      if(PERF.ema > 25){ PERF.bad += dt; if(PERF.bad > 2000 && PERF.lvl < 2){ setLvl(PERF.lvl + 1, true); PERF.bad = 0; PERF.ema = 16.7; } }
      else PERF.bad = Math.max(0, PERF.bad - dt);
    } else { PERF.ema = 16.7; PERF.bad = 0; }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
