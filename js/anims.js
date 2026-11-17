"use strict";
/* =====================================================================
   ANIMACIONES EXTRA DE LOS POKÉMON (PMD Sprite Repository: sprites.pmdcollab.org). Las baja tools/bajar_anims.ps1 a
   assets/pokemon/<nº>/<Animación>.png y apunta en assets/pokemon/anims.json qué tiene cada uno. El juego solo pide las que existen;
   si a un Pokémon le falta una, se ve la de siempre (Idle, Walk, Attack, Shoot, Charge, Hurt, Faint). Los shiny usan las de siempre
   (sus colores solo están en esas hojas).
   CUÁNDO SALE CADA UNA:
     Strike / Swing / Kick / Head / Double .. el golpe (clic izquierdo) según el ataque: puño, zarpazo, patada, cabezazo, doble golpe
     Rotate .................................. golpes giratorios (Giro Rápido, Torbellino...)
     Hop ..................................... la carrera (espacio)
     Twirl / DeepBreath ...................... las mejoras (Q): danzas · el resto (coger aire)
     Tumble .................................. al salir despedido por un golpe fuerte
     Pain .................................... con un estado que hace daño (quemado, envenenado) al recibir un golpe
     Sleep ................................... dormido
     Pose .................................... el ganador al acabar el combate
     LookUp / Nod / Sit ...................... si se queda quieto un rato, de vez en cuando
   AN.on = false lo apaga.
   ===================================================================== */
const AN = {on: true, idleWait: 4.5, kbBig: 9};                              // [AJUSTE] encendido · segundos quieto antes de los gestos · empujón para «salir rodando»
const AN_EXTRA = {
  Strike:{w:48, h:48, fps:20, loop:false}, Swing:{w:48, h:48, fps:20, loop:false}, Kick:{w:48, h:48, fps:20, loop:false}, Head:{w:48, h:48, fps:20, loop:false},
  Double:{w:48, h:48, fps:22, loop:false}, Rotate:{w:40, h:40, fps:18, loop:true},  Hop:{w:32, h:48, fps:14, loop:true},       Twirl:{w:40, h:40, fps:16, loop:false},
  DeepBreath:{w:32, h:40, fps:9, loop:false}, Tumble:{w:48, h:48, fps:14, loop:false}, Pain:{w:40, h:40, fps:10, loop:false}, Cringe:{w:40, h:40, fps:10, loop:false},
  Sleep:{w:32, h:32, fps:3, loop:true}, Pose:{w:40, h:48, fps:8, loop:false}, LookUp:{w:32, h:40, fps:6, loop:false}, Nod:{w:32, h:40, fps:7, loop:false},
  Sit:{w:32, h:40, fps:6, loop:false}, Float:{w:32, h:40, fps:6, loop:true}
};
Object.entries(AN_EXTRA).forEach(([k, v]) => { if(!ANIMS[k]) ANIMS[k] = Object.assign({n: 6}, v); });
const AN_BASE = ['Idle', 'Walk', 'Attack', 'Shoot', 'Charge', 'Hurt', 'Faint'];
let AN_HAS = {};                                                            // '6' -> Set('Hop', 'Sleep', ...)
fetch(`${CARPETA}/anims.json?v=` + Date.now().toString().slice(0, 7)).then(r => r.ok ? r.json() : {}).then(j => { const o = {}; Object.entries(j || {}).forEach(([d, l]) => o[d] = new Set(l)); AN_HAS = o; }).catch(() => {});
const anHas = (f, a) => AN.on && !f.shiny && typeof f.m.dex === 'number' && !!(AN_HAS[f.m.dex] && AN_HAS[f.m.dex].has(a));

// Golpe según el nombre del ataque
const AN_MELEE = [[/patada|pisot/i, 'Kick'], [/cabeza|testarazo|cornada|megacuerno|cuerno/i, 'Head'], [/doble|dos |combo|furia/i, 'Double'],
  [/garra|corte|cuchill|tajo|zarpazo|cola|l[aá]tigo|hoja|espada|guada|filo|ala/i, 'Swing'], [/./, 'Strike']];
const anMelee = nm => { for(const [re, a] of AN_MELEE) if(re.test(nm || '')) return a; return 'Strike'; };

// Qué animación se ve AHORA (y desde cuándo, para el cuadro)
function anPick(f){
  const a = f.act;
  if(!AN.on || !f.m || f.dead) return [a, f.at];
  if(f.spin && anHas(f, 'Rotate')) return ['Rotate', f.at];
  if(g && g.over){ const foes = g.p.includes(f) ? g.e : g.p;               // el que gana posa
    if(foes && foes.length && foes.every(x => x.dead) && anHas(f, 'Pose')){ const now = performance.now() / 1000; if(f.anOver0 === undefined) f.anOver0 = now; return ['Pose', now - f.anOver0]; } }
  if(a === 'Attack' && f.anMv){ const m = anMelee(f.anMv); if(anHas(f, m)) return [m, f.at]; }
  if(a === 'Charge' && !f.wind && f.anBuf){ const m = /danza|baile/i.test(f.anBuf) ? 'Twirl' : 'DeepBreath'; if(anHas(f, m)) return [m, f.at]; }
  if(a === 'Hurt'){
    if(f.anTumble && anHas(f, 'Tumble')) return ['Tumble', f.at];
    if(f.st && (f.st.k === 'brn' || f.st.k === 'psn' || f.st.k === 'tox') && anHas(f, 'Pain')) return ['Pain', f.at];
  }
  if((a === 'Walk' || a === 'Idle') && f.dash > 0 && anHas(f, 'Hop')) return ['Hop', .25 - f.dash];
  if(f.st && f.st.k === 'slp' && (a === 'Idle' || a === 'Walk') && anHas(f, 'Sleep')) return ['Sleep', f.at];
  if(a === 'Idle' && f.at > AN.idleWait && !(g && g.count > 0)){              // gestos de vez en cuando si se queda quieto
    const per = 6, k = Math.floor((f.at - AN.idleWait) / per), u = (f.at - AN.idleWait) - k * per, opts = ['LookUp', 'Nod', 'Sit'].filter(x => anHas(f, x));
    if(opts.length && u < 2.2) return [opts[(k + (f.m.dex | 0)) % opts.length], u];
  }
  return [a, f.at];
}
// Se apunta qué ataque/mejora hizo y si el golpe le lanzó lejos (para elegir la animación). En el combate primero va setAct('Attack') y luego fxMelee.
{ const o = setAct; setAct = function(f, name){ const r = o.apply(this, arguments); if(f){ if(name === 'Hurt') f.anTumble = Math.hypot(f.kx || 0, f.ky || 0) > AN.kbBig; if(name === 'Attack') f.anMv = null; } return r; }; }
{ const o = fxMelee; fxMelee = function(f, ang, T, name){ const r = o.apply(this, arguments); if(f) f.anMv = name; return r; }; }
{ const o = fxBuff; fxBuff = function(f, name){ if(f) f.anBuf = name; return o.apply(this, arguments); }; }
// Solo se precargan las que existen (si no, cientos de peticiones que darían «no encontrado»)
{ const o = preloadSheets; preloadSheets = function(dex, shiny){
    AN_BASE.forEach(a => { sheet(dex, a, false); if(shiny) sheet(dex, a, true); });
    const s = AN_HAS[dex]; if(s && AN.on) s.forEach(a => sheet(dex, a, false));
  }; }
