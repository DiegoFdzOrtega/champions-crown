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
        else snPlay('I_' + snType(mvn, type), big ? 1 : .7); } }catch(e){}
    return r; }; }
if(typeof shotClash === 'function'){ const o = shotClash; shotClash = function(){                // ¡CHOQUE! cuando un disparo se queda empujando a otro
    const before = g && g.shots ? g.shots.filter(s => s.hold > 0).length : 0, r = o.apply(this, arguments);
    try{ const now = g.shots.filter(s => s.hold > 0).length; if(now > before) snPlay('clash', 1); }catch(e){}
    return r; }; }
