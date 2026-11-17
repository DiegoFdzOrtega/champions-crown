"use strict";
/* =====================================================================
   MÁS SPRITES DE ATAQUES HECHOS CON GEMINI (assets/fx/*.png, fondo ya quitado). Usa gmDraw/gmOk de js/fxgemini.js.
     bs_orb · bs_cola · bs_golpe ........ BOLA SOMBRA: la bola con humo, su estela y el estallido de sombra
     fl_carga · fl_orb · fl_golpe ....... FUERZA LUNAR: la luna que se carga en la boca, la bola de luna y el golpe rosa
     pc_hoja · pc_estela · pc_golpe ..... PSICOCORTE (ataque NUEVO, Psíquico, clic derecho): la hoja en media luna, sus copias y el tajo en X
     it_bola · it_rayo · it_golpe ....... IMPACTRUENO: la bola eléctrica, el rayo en zigzag detrás y el chispazo
   Mientras una imagen no ha cargado (o si falta), se ve el dibujo de antes. GM.on = false (js/fxgemini.js) vuelve a los de código.
   ===================================================================== */
Object.assign(GM.meta, {
  bs_orb: {fw: 125, fh: 98, n: 4}, bs_cola: {fw: 127, fh: 63, n: 4}, bs_golpe: {fw: 141, fh: 135, n: 6},
  fl_orb: {fw: 109, fh: 113, n: 5}, fl_carga: {fw: 101, fh: 104, n: 5}, fl_golpe: {fw: 122, fh: 125, n: 8},
  pc_hoja: {fw: 94, fh: 155, n: 4}, pc_estela: {fw: 148, fh: 141, n: 4}, pc_golpe: {fw: 178, fh: 179, n: 5},
  it_bola: {fw: 101, fh: 106, n: 3}, it_rayo: {fw: 192, fh: 61, n: 4}, it_golpe: {fw: 136, fh: 103, n: 6}});
['bs_orb', 'bs_cola', 'bs_golpe', 'fl_orb', 'fl_carga', 'fl_golpe', 'pc_hoja', 'pc_estela', 'pc_golpe', 'it_bola', 'it_rayo', 'it_golpe'].forEach(k => {
  const im = new Image(); im.onload = () => { GM.meta[k].ok = true; }; im.src = `assets/fx/${k}.png?v=1`; GM.img[k] = im; });
const gmFrame = (k, u) => Math.min(GM.meta[k].n - 1, Math.floor(brClamp(u) * GM.meta[k].n));
// Pone `fl` y `im` en un ataque, pero solo cuando sus imágenes han cargado (si no, deja lo de antes)
function gmMove(name, keysF, fl, keysI, im){
  const oF = FXR.flight[name], oI = FXR.impact[name];
  const wF = function(s, a, an){ if(gmOk(...keysF)) return fl(s, a, an); const b = oF && (oF.draw || oF); if(b) return b.apply(this, arguments); };
  const wI = function(e, a){ if(gmOk(...keysI)) return im(e, a); const b = oI && (oI.draw || oI); if(b) return b.apply(this, arguments); };
  if(oF) Object.assign(wF, oF); if(oI) Object.assign(wI, oI); delete wF.draw; delete wI.draw; FXR.flight[name] = wF; FXR.impact[name] = wI;
}

// ---------------- BOLA SOMBRA ----------------
gmMove('Bola Sombra', ['bs_orb', 'bs_cola'], (s, a, an) => {
  const y = s.y - 6, fr = Math.floor(g.t * 12);
  gmDraw('bs_cola', fr, s.x - Math.cos(an) * 14, y - Math.sin(an) * 20, .72, an, .9, 1, .5);        // la estela de humo, detrás
  brGlow(s.x, y, 30, '120,70,200', .35);
  gmDraw('bs_orb', fr, s.x, y, .72, an, 1, .62, .5);
}, ['bs_golpe'], (e, a) => {
  const k = e.k || 1, u = a / .7; if(u >= 1) return;
  if(u < .2) brGlow(e.x, e.y - 4, 60 * k, '150,90,230', (1 - u / .2) * .7);
  gmDraw('bs_golpe', gmFrame('bs_golpe', u), e.x, e.y - 4, .9 * k, 0, u > .85 ? (1 - u) / .15 : 1);
});
FXC['Bola Sombra'] = Object.assign({}, FXC['Bola Sombra'], {idur: .75});

// ---------------- FUERZA LUNAR ----------------
FXR.impact._flCast = (e, a) => { if(!gmOk('fl_carga')) return; const u = a / e.dur; gmDraw('fl_carga', gmFrame('fl_carga', u), e.x, e.y, .6, 0, u > .8 ? (1 - u) / .2 : 1); };
{ const o = FXR.cast['Fuerza Lunar'] || FXR.cast['_']; FXR.cast['Fuerza Lunar'] = function(f, s, name, big, ox, oy, ang){ const r = o && o.apply(this, arguments); if(GM.on) fxAdd('impact', '_flCast', {x: ox, y: oy - 6, dur: .3}); return r; }; }
gmMove('Fuerza Lunar', ['fl_orb'], (s, a, an) => {
  const y = s.y - 6;
  brGlow(s.x, y, 40, '255,180,230', .45);
  gmDraw('fl_orb', Math.floor(g.t * 10), s.x, y, .68, 0, 1);
}, ['fl_golpe'], (e, a) => {
  const k = e.k || 1, u = a / .85; if(u >= 1) return;
  if(u < .25) brGlow(e.x, e.y - 4, 80 * k, '255,200,240', (1 - u / .25) * .8);
  gmDraw('fl_golpe', gmFrame('fl_golpe', u), e.x, e.y - 4, (u > .35 && u < .65 ? 1.15 : .95) * k, 0, 1);
});
FXC['Fuerza Lunar'] = Object.assign({}, FXC['Fuerza Lunar'], {idur: .9});

// ---------------- PSICOCORTE (nuevo) ----------------
{ const N = 'Psicocorte';
  if(typeof MOVES !== 'undefined' && !MOVES[N]) MOVES[N] = {t: 'psiquico', s: 2};
  if(typeof SHOT_MOVE !== 'undefined') SHOT_MOVE[N] = 'veloz';                 // una hoja rápida y fina, sea cual sea el tipo del Pokémon
  if(typeof TRL !== 'undefined') TRL[N] = false;
  FXR.flight[N] = (s, a, an) => {
    const y = s.y - 6, fr = Math.floor(g.t * 14);
    if(gmOk('pc_hoja', 'pc_estela')){ gmDraw('pc_estela', fr, s.x, y, .58, an, .8, .85, .5); gmDraw('pc_hoja', fr, s.x, y, .58, an, 1, .6, .5); return; }
    ctx.save(); ctx.translate(s.x, y); ctx.rotate(an); ctx.fillStyle = '#ff8fd8'; ctx.beginPath(); ctx.arc(0, 0, 16, -1.2, 1.2); ctx.arc(-8, 0, 14, 1.1, -1.1, true); ctx.fill(); ctx.restore();   // por si no carga la imagen
  };
  FXR.impact[N] = (e, a) => { const k = e.k || 1, u = a / .55; if(u >= 1) return;
    if(gmOk('pc_golpe')) gmDraw('pc_golpe', gmFrame('pc_golpe', u), e.x, e.y - 6, .8 * k, 0, 1);
    if(u < .3) brGlow(e.x, e.y - 6, 50 * k, '255,150,230', (1 - u / .3) * .6); };
  FXC[N] = Object.assign({}, FXC['Psicorrayo'] || {}, {idur: .6, shake: 2});
  if(typeof LEARN !== 'undefined' && typeof DEX !== 'undefined'){                // la aprenden los de tipo Psíquico y los de siempre (Gallade, Absol, Lucario, Kabutops...)
    const ids = new Set(DEX.filter(m => m.types.includes('psiquico')).map(m => m.dex));
    [140, 141, 150, 307, 308, 359, 448, 475, 624, 625, 798, 983].forEach(d => ids.add(d));
    LEARN[N] = [...ids].sort((p, q) => p - q).join(',');
  }
}

// ---------------- IMPACTRUENO ----------------
gmMove('Impactrueno', ['it_bola', 'it_rayo'], (s, a, an) => {
  const y = s.y - 6, fr = Math.floor(g.t * 18);
  gmDraw('it_rayo', fr, s.x, y, .45, an, .9, .95, .5);                         // el zigzag detrás de la bola
  brGlow(s.x, y, 22, '255,240,120', .5);
  gmDraw('it_bola', fr, s.x, y, .42, 0, 1);
}, ['it_golpe'], (e, a) => {
  const k = e.k || 1, u = a / .5; if(u >= 1) return;
  gmDraw('it_golpe', gmFrame('it_golpe', u), e.x, e.y - 6, .75 * k, 0, 1);
});
