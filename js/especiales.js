"use strict";
/* =====================================================================
   ANIMACIONES «SPECIAL» DE ALGUNOS POKÉMON (PMD Sprite Repository, las baja tools/bajar_anims.ps1).
   Cada Pokémon tiene la suya, distinta, así que aquí se dice a mano cuándo sale cada una:
     Graveler, Golem, Donphan ... se hacen bola y ruedan en la carrera (espacio) y en las embestidas
     Dragonite ................... vuela tumbado en la carrera
     Gurdurr ..................... golpea con su viga (clic de golpe)
     Ferrothorn .................. azota con sus látigos (clic de golpe)
     Terrakion ................... se encabrita al cargar la E
     Kyurem ...................... se alza al cargar la E
     Morpeko ..................... se pone en su forma hambrienta al cargar la E
   Algunas hojas (Terrakion, Morpeko) solo traen una fila (mirando de frente): se copian a las 8 direcciones.
   ESP.on = false lo apaga. Solo dibujo: no cambia nada del combate.
   ===================================================================== */
const ESP = {on: true, fps: 12};
['Special0', 'Special1'].forEach(k => { if(!ANIMS[k]) ANIMS[k] = {n: 6, w: 48, h: 48, fps: ESP.fps, loop: true}; });

// cuándo: rueda = carrera y embestida (en bucle) · golpe = clic de golpe (una vez) · carga = mientras carga la E (sube y se queda arriba) · mejora = la Q
const ESP_POKE = {
  75:  {anim: 'Special0', rueda: true},
  76:  {anim: 'Special0', rueda: true},
  232: {anim: 'Special0', rueda: true},
  149: {anim: 'Special0', rueda: true},
  533: {anim: 'Special1', golpe: true},
  598: {anim: 'Special0', golpe: true},
  639: {anim: 'Special0', carga: true, alto: [1, 2]},          // alto: cuadros en los que se queda mientras carga
  646: {anim: 'Special0', carga: true, alto: [4, 9]},
  877: {anim: 'Special0', carga: true, alto: [6, 8]}
};

// Hojas de una sola fila: se rehacen con la misma fila 8 veces (una por dirección) para que el juego las entienda
function espFila(dex, a){
  const k = dex + '/' + a; if(typeof sheets === 'undefined' || sheets[k]) return;
  const im = new Image(), C = document.createElement('canvas'); C.ok = false; C.bad = false; sheets[k] = C;
  im.onload = () => { try{
      if(im.height >= 8 * 16 && im.height % 8 === 0 && im.height / 8 >= 24){ C.width = im.width; C.height = im.height; C.getContext('2d').drawImage(im, 0, 0); }
      else { C.width = im.width; C.height = im.height * 8; const x = C.getContext('2d'); for(let r = 0; r < 8; r++) x.drawImage(im, 0, r * im.height); }
      C.info = analyze(C, a); C.ok = true; }catch(e){ C.bad = true; } };
  im.onerror = () => { C.bad = true; };
  im.src = `${CARPETA}/${dex}/${a}.png`;
}
[639, 877].forEach(d => espFila(d, 'Special0'));

const espHas = (f, P) => {
  if(!ESP.on || !P || !f || !f.m || f.shiny || f.dead) return false;
  if(!(AN.on && AN_HAS[f.m.dex] && AN_HAS[f.m.dex].has(P.anim))) return false;
  const S = sheet(f.m.dex, P.anim, false); return !!(S && S.ok && S.info);
};
function espFrame(f, P, fr){ const S = sheet(f.m.dex, P.anim, false); return [P.anim, (Math.max(0, Math.min(S.info.n - 1, fr)) + .5) / ANIMS[P.anim].fps]; }

if(typeof anPick === 'function'){ const o = anPick; anPick = function(f){
  const r = o.apply(this, arguments);
  try{
    const P = f && f.m && ESP_POKE[f.m.dex]; if(!P || !espHas(f, P)) return r;
    const S = sheet(f.m.dex, P.anim, false), n = S.info.n, t = g ? g.t : 0, base = f.act;
    if(P.rueda && ((f.dash > 0 && !f.jump) || (f.ride && !f.dead))) return [P.anim, t];                       // rueda / vuela (en bucle)
    if(P.golpe && base === 'Attack' && !f.anQuake && !f.tjJ) return espFrame(f, P, Math.floor((f.at || 0) * ANIMS[P.anim].fps * 1.4));
    const sube = (k0) => { const [a, b] = P.alto || [n - 1, n - 1], fr = Math.floor(k0 * ANIMS[P.anim].fps);   // sube hasta «alto» y allí se balancea
      return espFrame(f, P, fr <= a ? fr : a + Math.floor((fr - a) / 2) % (b - a + 1)); };
    if(P.carga && f.wind && base === 'Charge') return sube(f.at || 0);
    if(P.mejora && base === 'Charge' && !f.wind && f.anBuf) return sube(f.at || 0);
  }catch(e){}
  return r;
}; }
