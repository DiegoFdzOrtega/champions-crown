"use strict";
/* =====================================================================
   SONIDOS DEL GACHAPON (hechos con osciladores, como el resto: js/music.js; sin archivos)
   - Meter el ticket: moneda que cae.            - La máquina se agita: traqueteo de bolas.
   - Girar la manivela y la bola baja: clac-clac. - La bola sale por la ranura: ¡clonc!
   - Cada bote en el suelo: toc (más flojo en cada bote).
   - La bola se abre: ¡pop! y luego una fanfarria según lo que toque (común, poco común, rara, épica, legendaria o shiny).
   - Tocar la máquina en la pantalla del Gachapon: traqueteo corto.
   GS.on = false lo apaga. GS.k = volumen general de estos sonidos.
   Se engancha SIN tocar js/gachapon.js: envuelve sus funciones (startPull, showStage, impactFx, gcShake, showSummary).
   ===================================================================== */
const GS = {on: true, k: .8};
{
  const O = (w, f, at, d, v, to, x) => ({w, f, at, d, v, to, x});                      // nota: forma de onda, frecuencia, cuándo empieza, cuánto dura, volumen, hasta qué frecuencia
  const N = (ft, f, q, at, d, v, to) => ({n: 1, ft, f, q, at, d, v, to});               // ruido filtrado (golpes, traqueteo)
  const notas = (fs, paso, d, v, w) => fs.map((f, i) => O(w || 'triangle', f, i * paso, d, v));    // arpegio
  const GSFX = {
    g_coin:    [O('square', 1976, 0, .07, .22), O('square', 2637, .07, .22, .2), N('highpass', 5000, 1, 0, .05, .15)],                          // ¡clin-clin! (ticket dentro)
    g_rattle:  [0, .07, .13, .2, .26, .33, .4, .46, .53, .6].map((at, i) => N('bandpass', 1800 + (i % 3) * 700, 4, at, .045, .3 - i * .015))
                 .concat([N('lowpass', 500, 1, 0, .65, .25)]),                                                                        // bolas que chocan dentro de la cúpula
    g_crank:   [0, .16, .32, .48].map(at => N('bandpass', 1300, 3, at, .05, .45)).concat([0, .16, .32, .48].map(at => O('square', 180, at, .04, .12, 120))),   // manivela: clac-clac-clac
    g_clonk:   [O('sine', 240, 0, .2, .7, 90, 1), N('bandpass', 900, 2, 0, .08, .5), O('triangle', 480, 0, .1, .2, 200)],                // la bola sale por la ranura
    g_bounce:  [O('sine', 420, 0, .12, .7, 160, 1), N('bandpass', 1500, 2.5, 0, .05, .4)],                                               // toc contra el suelo
    g_quake:   [O('sine', 70, 0, .6, .9, 32, 1), N('lowpass', 600, .7, 0, .6, .7, 80)],                                                     // retumbo (legendaria)
    g_whoosh:  [N('bandpass', 400, 1.5, 0, .55, .45, 2200), O('sine', 300, 0, .55, .1, 900)],                                             // la bola sube al centro
    g_open:    [N('highpass', 2000, 1, 0, .07, .7), O('triangle', 600, 0, .18, .35, 1600), O('sine', 1200, .03, .2, .25, 2400)],          // ¡pop! se abre
    g_common:  notas([784, 1047], .1, .22, .35),                                                                                         // común: tilín
    g_uncommon:notas([659, 784, 1047], .09, .24, .38),
    g_rare:    notas([523, 659, 784, 1047, 1319], .08, .3, .4).concat([O('sine', 2093, .42, .4, .15)]),
    g_epic:    notas([523, 659, 784, 1047], .08, .25, .45, 'square').map(n => Object.assign(n, {v: .22}))
                 .concat([O('triangle', 523, .34, .9, .4), O('triangle', 659, .34, .9, .35), O('triangle', 784, .34, .9, .35), O('triangle', 1047, .34, 1, .35)]),
    g_legend:  [O('sawtooth', 130, 0, .5, .25, 260), N('bandpass', 300, 1, 0, .5, .4, 2400)]                                              // sube...
                 .concat(notas([523, 659, 784, 1047, 1319, 1568], .07, .22, .3, 'square').map(n => Object.assign(n, {at: n.at + .45, v: .2})))   // ...arpegio...
                 .concat([1047, 1319, 1568, 2093].map(f => O('triangle', f, .92, 1.4, .3)), [O('sine', 65, .92, .8, .7, 40, 1)]),             // ...y acorde grande con golpe grave
    g_shiny:   [2093, 2637, 3136, 3951, 3136, 3951, 4699].map((f, i) => O('sine', f, i * .07, .3, .25))                                    // destellos
                 .concat([N('highpass', 7000, 1, 0, .6, .2), O('triangle', 1047, .5, 1, .3), O('triangle', 1319, .5, 1, .28), O('triangle', 1568, .5, 1.1, .28)]),
    g_card:    [O('triangle', 1319, 0, .08, .2), O('sine', 1760, .04, .1, .15)]                                                             // cada carta del resumen de 10
  };
  if(typeof Music !== 'undefined' && Music.addSfx) Music.addSfx(GSFX);
}
const gsPlay = (n, k) => { if(GS.on && typeof Sfx !== 'undefined') try{ Sfx.play(n, GS.k * (k == null ? 1 : k)); }catch(e){} };
// Los sonidos de la máquina van con el RELOJ DE LA ANIMACIÓN (gx.e.t, en ms), no con el del ordenador: en un PC lento la animación va más despacio y así no se desfasan.
const GS_LINE = [[0, 'g_coin', 1], [T_SHAKE + 40, 'g_rattle', .9], [T_PICK + 150, 'g_rattle', .7], [T_SINK - 100, 'g_crank', 1], [T_CHUTE, 'g_clonk', 1]];
function gsWatch(){
  let i = 0; const E0 = gx.e;
  const tick = () => {
    if(!gx.anim || !gx.e || gx.e !== E0) return;                                    // se saltó, se cerró o empezó otra tirada
    while(i < GS_LINE.length && gx.e.t >= GS_LINE[i][0]){ gsPlay(GS_LINE[i][1], GS_LINE[i][2]); i++; }
    if(i < GS_LINE.length) requestAnimationFrame(tick);
  };
  tick();
}
const GS_RAR = {common: 'g_common', uncommon: 'g_uncommon', rare: 'g_rare', epic: 'g_epic', legendary: 'g_legend', shiny: 'g_shiny'};

if(typeof startPull === 'function'){ const o = startPull; startPull = function(mode){
    const was = gx.anim, r = o.apply(this, arguments);
    try{ if(!was && gx.anim) gsWatch(); }catch(e){}
    return r; }; }
if(typeof showStage === 'function'){ const o = showStage; showStage = function(s){
    const prev = $('gOv') && $('gOv').dataset.stage, r = o.apply(this, arguments);
    try{
      if(s === 'center' && prev !== 'center') gsPlay('g_whoosh', .8);
      if(s === 'open' && prev !== 'open') gsPlay('g_open');
      if(s === 'reveal' && prev !== 'reveal' && gx.best){ const k = gx.best.shiny ? 'shiny' : gx.best.rarity; gsPlay(GS_RAR[k] || 'g_common'); }
    }catch(e){}
    return r; }; }
if(typeof impactFx === 'function'){ const o = impactFx; impactFx = function(kind, x, y, q, k){
    const r = o.apply(this, arguments);
    try{ gsPlay('g_bounce', Math.max(.25, k || 0)); if(kind === 'legendary' && k >= 1) gsPlay('g_quake'); }catch(e){}
    return r; }; }
if(typeof gcShake === 'function'){ const o = gcShake; gcShake = function(){ const r = o.apply(this, arguments); gsPlay('g_rattle', .6); return r; }; }
if(typeof showSummary === 'function'){ const o = showSummary; showSummary = function(){
    const r = o.apply(this, arguments);
    try{ gx.res.forEach((x, i) => { const t = setTimeout(() => gsPlay(x.shiny || RAR[x.rarity].rank <= 1 ? 'g_rare' : 'g_card', x.shiny || RAR[x.rarity].rank <= 1 ? .6 : 1), 60 + i * 70); gx.timers.push(t); }); }catch(e){}
    return r; }; }
