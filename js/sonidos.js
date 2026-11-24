"use strict";
/* =====================================================================
   MÁS SONIDOS DE COMBATE (los sonidos están en js/music.js, hechos con osciladores, sin archivos):
   - Al LANZAR un disparo suena el de su tipo (L_fuego, L_agua...) además del de siempre.
   - Al DAR, una capa del tipo (I_fuego, I_agua...) encima del golpe de siempre.
   - Ataques con su sonido propio: mordiscos y colmillos (bite / crunch), cuernos (horn), cortes y garras (slash),
     viento (wind), velocidad (speed), hojas (leaves), ondas oscuras (pulse). Y ¡CHOQUE! cuando dos disparos chocan.
   SN.on = false lo apaga (quedan los de siempre). SN.k = volumen de estas capas.
   ===================================================================== */
const SN = {on: true, k: .65};
const SN_MOVE = [                                                              // [nombre (expresión), sonido al lanzar/golpear]
  [/triturar|colmillo/i, 'crunch'], [/mordisco|mordida/i, 'bite'],
  [/cuerno|cornada|megacuerno|perforador/i, 'horn'],
  [/garra|corte|cuchillada|tajo|zarpazo|psicocorte|hoja aguda|filo/i, 'slash'],
  [/tornado|vendaval|huracán|remolino|viento|aire afilado/i, 'wind'],
  [/velocidad extrema|ataque rápido|ataque ala|golpe aéreo|carrera/i, 'speed'],
  [/hoja afilada|lluevehojas|hojas mágicas|danza pétalo/i, 'leaves'],
  [/hidropulso/i, 'hpulse'],                                                   // antes caía en «pulso» y sonaba como Pulso Umbrío
  [/pulso umbrío|pulso/i, 'pulse']];
const snMove = nm => { for(const [re, s] of SN_MOVE) if(re.test(nm || '')) return s; return null; };
const snPlay = (n, k) => { if(SN.on && typeof Sfx !== 'undefined') try{ Sfx.play(n, SN.k * (k == null ? 1 : k)); }catch(e){} };
const snType = (nm, t) => (typeof MOVES !== 'undefined' && MOVES[nm] && MOVES[nm].t) || t;      // el tipo del ATAQUE (lo que se ve), no el del Pokémon
const snVol = f => (g && g.e && g.e.includes(f) && !g.pvp) ? .8 : 1;            // los del rival un poco más bajos

if(typeof fxShotStart === 'function'){ const o = fxShotStart; fxShotStart = function(f, s, name, big){
    const r = o.apply(this, arguments);
    try{ const m = snMove(name), k = snVol(f); if(m) snPlay(m, k); else if(s && s.type) snPlay('L_' + snType(name, s.type), k * (big ? 1 : .8)); }catch(e){}
    return r; }; }
if(typeof fxMelee === 'function'){ const o = fxMelee; fxMelee = function(f, ang, T, name, type){
    const r = o.apply(this, arguments);
    try{ const m = snMove(name); if(m) snPlay(m, snVol(f)); }catch(e){}
    return r; }; }
if(typeof hit === 'function'){ const o = hit; hit = function(T, dmg, type, A, close, big, mvn){
    const hp0 = T ? T.hp : 0, r = o.apply(this, arguments);
    try{ if(T && T.hp < hp0 && type){ const m = snMove(mvn); if(close && (m === 'bite' || m === 'crunch')) snPlay('crunch', .9);
        else if(m === 'hpulse') snPlay('hpulse_hit', big ? 1 : .85);
        else snPlay('I_' + snType(mvn, type), big ? 1 : .7); } }catch(e){}
    return r; }; }
if(typeof shotClash === 'function'){ const o = shotClash; shotClash = function(){                // ¡CHOQUE! cuando un disparo se queda empujando a otro
    const before = g && g.shots ? g.shots.filter(s => s.hold > 0).length : 0, r = o.apply(this, arguments);
    try{ const now = g.shots.filter(s => s.hold > 0).length; if(now > before) snPlay('clash', 1); }catch(e){}
    return r; }; }

/* ---- SONIDOS DE AGUA (23-11-2026): burbujas de verdad en vez de ruido filtrado ----
   Una burbuja es un tono puro corto que sube muy deprisa (asi suena el agua de verdad). Se usan en:
   hpulse (Hidropulso al lanzar: burbujas + el «wub» del pulso), hpulse_hit (al dar: chapoteo + ondas que se alejan),
   y se refuerzan L_agua / I_agua (todos los ataques de agua). Posiciones fijas, sin Math.random: no afecta al online. */
addEventListener('DOMContentLoaded', () => { if(typeof Music === 'undefined' || !Music.addSfx) return;      // music.js se carga despues que este archivo
  const bub = (at, f, v, d) => ({w: 'sine', f, to: f * 2.4, x: 1, at, d: d || .05, v});                       // una burbuja
  const bubs = (t0, n, f0, v) => Array.from({length: n}, (_, i) => bub(t0 + i * .028 + ((i * 7) % 5) * .006, f0 * (1 + ((i * 3) % 5) * .18), v * (1 - i / (n * 1.6))));
  const swoosh = (at, d, v) => ({n: 1, ft: 'bandpass', f: 700, to: 2400, q: 1.1, at, d, v});
  const splash = (at, v) => [{n: 1, ft: 'lowpass', f: 3200, to: 500, q: .8, at, d: .32, v}, {n: 1, ft: 'highpass', f: 3500, at, d: .12, v: v * .45}];
  Music.addSfx({
    hpulse: [swoosh(0, .22, .3), {w: 'sine', f: 190, to: 120, at: 0, d: .3, v: .45}, {w: 'sine', f: 380, to: 240, at: .02, d: .22, v: .14},     // sale la esfera: «wub» grave
             ...bubs(.01, 9, 520, .32)],                                                                                                     // y burbujas
    hpulse_hit: [...splash(0, .55), {w: 'sine', f: 240, to: 150, at: 0, d: .22, v: .5},                                                        // chapoteo al reventar
                 {w: 'sine', f: 200, to: 140, at: .14, d: .2, v: .32}, {w: 'sine', f: 170, to: 120, at: .28, d: .22, v: .2},                 // 3 ondas que se alejan
                 ...bubs(.05, 11, 680, .26)],                                                                                                // gotas y burbujas
    L_agua: [swoosh(0, .2, .32), {n: 1, ft: 'bandpass', f: 1500, q: 3, at: .05, d: .1, v: .14}, ...bubs(.02, 6, 560, .26)],                    // chorro + burbujas
    I_agua: [...splash(0, .6), {w: 'sine', f: 150, to: 90, at: 0, d: .16, v: .4}, ...bubs(.04, 8, 720, .24)]                                     // chapoteo + gotas
  });
});
