"use strict";
/* =====================================================================
   CARAS DEL HUD: el retrato del Pokémon cambia de expresión según lo que pasa en el combate.
   Retratos de PMD Sprite Repository (https://sprites.pmdcollab.org · github.com/PMDCollab/SpriteCollab) y sus artistas.
   Archivos: assets/pokemon/<nº>/caras/<Expresión>.png (los baja tools/bajar_caras.ps1). Si falta una expresión se usa otra
   parecida (CARA_ALT) y, si no hay ninguna, el dibujo de siempre (Idle).
   Cuándo sale cada una (CARA_T = segundos que dura):
     Pain        al recibir un golpe                         · Shouting    al lanzar el ataque fuerte o megaevolucionar
     Determined  al atacar                                   · Joyous      al debilitar al rival (y al ganar)
     Dizzy       con un estado (parálisis, sueño, confusión…) · Worried    con poca vida (≤ 25 %)
     Angry       por debajo de la mitad de vida              · Normal      el resto del tiempo
   CARAS_ON = false lo apaga.
   ===================================================================== */
const CARAS_ON = true;
const CARA_LIST = ['Normal', 'Happy', 'Pain', 'Angry', 'Worried', 'Determined', 'Joyous', 'Shouting', 'Dizzy', 'Surprised'];
const CARA_ALT = {Shouting: ['Determined', 'Angry'], Joyous: ['Happy'], Happy: ['Joyous'], Worried: ['Pain'], Dizzy: ['Pain', 'Worried'], Determined: ['Angry'], Angry: ['Determined'], Surprised: ['Worried'], Pain: []};
const CARA_T = {Pain: .7, Determined: .6, Shouting: 1.1, Joyous: 1.8};
const caraImgs = {};
function caraImg(dex, e){                                   // la imagen (o null si no existe o aún no ha cargado)
  const d = parseInt(dex), k = d + '/' + e; let im = caraImgs[k];
  if(!im){ im = caraImgs[k] = new Image(); im.onload = () => im.ok = true; im.onerror = () => im.bad = true; im.src = `${CARPETA}/${d}/caras/${e}.png`; }
  return im.ok ? im : null;
}
function caraPick(dex, e){                                  // la expresión pedida o la parecida que exista
  for(const x of [e, ...(CARA_ALT[e] || []), 'Normal']){ const im = caraImg(dex, x); if(im) return im; }
  return null;
}
function caraState(f, list){                                // decide la expresión del Pokémon f (se guarda en f.cara)
  const now = performance.now() / 1000, C = f.cara || (f.cara = {e: 'Normal', until: 0, hp: f.hp, act: f.act, foe: null});
  const set = e => { if(CARA_T[e]) { C.e = e; C.until = now + CARA_T[e]; } };
  if(f.hp < C.hp - .5) set('Pain');                                                      // le han dado
  else if(f.act !== C.act && (f.act === 'Attack' || f.act === 'Shoot' || f.act === 'Charge')) set(f.lock > .35 || f.act === 'Charge' ? 'Shouting' : 'Determined');
  const foeList = list === g.p ? g.e : g.p, F = foeList && foeList[list === g.p ? g.ei : g.pi];
  if(F && F.dead && C.foe === F && !C.foeDead) set('Joyous');                           // acaba de debilitar al rival
  C.foeDead = !!(F && F.dead); C.foe = F; C.hp = f.hp; C.act = f.act;
  if(g.over && !f.dead && foeList && foeList.every(x => x.dead)) return 'Joyous';        // ha ganado
  if(f.dead) return 'Pain';
  if(now < C.until) return C.e;
  if(typeof hasStatus === 'function' && hasStatus(f)) return 'Dizzy';
  const r = f.hp / f.max;
  return r <= .25 ? 'Worried' : r <= .5 ? 'Angry' : 'Normal';
}
function caraDraw(c, f, x, y, w, h, e){                     // pinta la cara en el recuadro (o devuelve false si no hay)
  const im = caraPick(f.m.dex, e); if(!im) return false;
  const k = Math.min(w / im.width, h / im.height), dw = im.width * k, dh = im.height * k;
  c.save(); c.imageSmoothingEnabled = false; if(f.dead) c.filter = 'grayscale(1) brightness(.6)';
  c.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh); c.restore();
  return true;
}
// HUD de combate: el recuadro del retrato (x+8, y+10, 56×56 en render.js · hud)
{ const o = hud; hud = function(x, y, list, idx, col){
    o.apply(this, arguments);
    if(!CARAS_ON || !g) return;
    const f = list[idx]; if(!f) return;
    if(list !== myList() && typeof foeHidden === 'function' && foeHidden() && !FOE_SEEN.has(f)) return;
    const e = f.caraE = caraState(f, list);
    const ox = x + 8, oy = y + 10;
    if(!caraPick(f.m.dex, e)) return;                                                     // sin retratos: se queda el dibujo de siempre
    ctx.fillStyle = '#0a0d15'; ctx.fillRect(ox + 1, oy + 1, 54, 54);
    caraDraw(ctx, f, ox + 2, oy + 2, 52, 52, e);
    if(hasStatus(f)) statusChips(f, x+8, y+55, 27, 11, 6);                                  // el estado otra vez encima
  }; }
