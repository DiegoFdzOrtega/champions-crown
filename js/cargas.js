"use strict";
/* =====================================================================
   CARGA DE LOS ATAQUES FUERTES (la E) CON DIBUJO, UNA POR TIPO (sprites de Gemini en assets/objetos/cargas/carga2_<tipo>.png)
   Mientras mantienes la E, alrededor del Pokémon se forma un remolino del color de su tipo (6 figuras en una fila):
   las 4 primeras crecen según lo cargado y, cuando el ataque ya está listo, parpadea entre las 2 últimas.
   Todos los ataques E de un mismo tipo usan la misma carga. Los que ya tienen la suya propia la mantienen (CARGA.propias).
   Si falta la imagen de un tipo, se ve la carga de siempre (la dibujada con código).
   ===================================================================== */
const CARGA = {
  // Hoja de Gemini por tipo (assets/objetos/cargas/carga2_<tipo>.png): 3 figuras = chispa, espiral pequeña, espiral con su elemento.
  tipos: ['normal', 'fuego', 'agua', 'planta', 'electrico', 'hielo', 'lucha', 'veneno', 'tierra', 'volador', 'psiquico', 'bicho', 'roca', 'fantasma', 'dragon', 'siniestro', 'acero', 'hada'],
  propias: ['Envite Ígneo'],                                                   // ataques con carga propia dibujada (js/embestida.js, js/fxnuevos.js)
  cuerpoPx: 96,                                                                    // [AJUSTE] ataques de cuerpo: tamaño de la bola alrededor del Pokémon (px)
  alpha: .97,                                                                      // [AJUSTE] opacidad
  cuerpo: /envite|p[aá]jaro osado|voltio cruel|giga ?impacto|doble filo|placaje|terremoto|magnitud|megacuerno|a[eé]rea|vuelo|bote|golpe cuerpo|cuerpo pesado|carga|embestida|pu[ñn]o|patada|machada|demolici[oó]n|martillo|cabezazo|tajo|garra|colmillo|lanzarse|ida y vuelta|u-turn/i,
  boca: {px: 62},                                                  // [AJUSTE] ataques de boca: tamaño de la bola completa (px), igual para todos
  pasos: [.22, .55],                                                               // [AJUSTE] cuánto hay que cargar para pasar a la figura 2 y a la 3
  chispas: 14,                                                                     // [AJUSTE] chispas que se juntan hacia la bola mientras carga
  img: {}
};
CARGA.tipos.forEach(t => { const i = new Image(), o = CARGA.img[t] = {i, ok: false}; i.onload = () => { o.ok = true; o.fw = i.width / 3; o.fh = i.height; }; i.src = 'assets/objetos/cargas/carga2_' + t + '.png?v=1'; });
const cgK = w => Math.max(0, Math.min(1, w.hold ? (w.c || 0) / (FEEL.wind || 1) : 1 - w.t / w.T));      // 0 → 1 hasta que el ataque está listo
const cgH = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };
// La bola: figura según lo cargado, late, chispas del color del tipo que se juntan hacia ella y, al estar lista, destellos.
function cargaDibuja(S, type, cx, cy, T, k, ready){
  const fr = k < CARGA.pasos[0] ? 0 : k < CARGA.pasos[1] ? 1 : 2, col = (typeof TC !== 'undefined' && TC[type]) || '#ffffff';
  const late = 1 + (fr === 2 ? .05 : .03) * Math.sin(g.t * (ready ? 22 : 12)), D = T * (.82 + .18 * k) * late;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  if(k > .05){ const N = Math.round(CARGA.chispas * (ready ? 1.4 : .5 + k)); ctx.fillStyle = col;      // las chispas vienen de fuera hacia el centro
    for(let i = 0; i < N; i++){ const p = (g.t * (1.3 + cgH(i, 2)) + cgH(i, 1)) % 1, an = cgH(i, 3) * 6.283 + g.t * .6, r = T * (.95 - .55 * p), z = Math.max(2, Math.round(T / 30 * (1 - p * .4)));
      ctx.globalAlpha = Math.min(1, p * 3) * .9; ctx.fillRect(Math.round(cx + Math.cos(an) * r - z / 2), Math.round(cy + Math.sin(an) * r * .8 - z / 2), z, z); } }
  ctx.globalAlpha = CARGA.alpha; ctx.drawImage(S.i, fr * S.fw, 0, S.fw, S.fh, cx - D / 2, cy - D / 2, D, D);
  if(ready){                                                                      // lista: brilla y salen anillos de su color
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .25 + .2 * Math.sin(g.t * 22); ctx.drawImage(S.i, 2 * S.fw, 0, S.fw, S.fh, cx - D / 2, cy - D / 2, D, D);
    ctx.globalCompositeOperation = 'source-over'; const u = (g.t * 2.2) % 1; ctx.globalAlpha = (1 - u) * .8; ctx.strokeStyle = col; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, D * (.35 + u * .45), 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
}

if(typeof nvWindFx === 'function'){
  const oldCarga = nvWindFx;
  nvWindFx = function(f, w){
    const S = w && !CARGA.propias.includes(w.nm) ? CARGA.img[w.type] : null;
    if(S && S.ok && !CARGA.cuerpo.test(w.nm || '')) return;                                       // de boca: lo dibuja cargaBoca() (más abajo), encima del Pokémon
    if(!S || !S.ok) return oldCarga.apply(this, arguments);
    const k = cgK(w), ready = w.hold ? w.c >= FEEL.wind : k > .3;                                  // de cuerpo: la bola rodea al Pokémon
    const b = typeof bodyOf === 'function' ? bodyOf(f) : {top: f.y - 50, foot: f.y + 20};
    cargaDibuja(S, w.type, f.x, (b.top + b.foot) / 2, CARGA.cuerpoPx, k, ready);
  };
}

// ---- Ataques de boca: la bola nace en la boca y va creciendo (sustituye a la bola de color de js/fxvideo.js, v5ChgTop) ----
const cargaSpr = f => { const w = f && f.wind; if(!w || CARGA.propias.includes(w.nm) || CARGA.cuerpo.test(w.nm || '')) return null; const S = CARGA.img[w.type]; return S && S.ok ? S : null; };
const cargaCuerpo = f => { const w = f && f.wind; if(!w || CARGA.propias.includes(w.nm) || !CARGA.cuerpo.test(w.nm || '')) return false; const S = CARGA.img[w.type]; return !!(S && S.ok); };
function cargaBoca(f, S){
  const w = f.wind, k = cgK(w), ready = w.hold ? w.c >= FEEL.wind : k > .3;
  if(ready && !f.cgR){ f.cgR = 1; if(w.hold && typeof Sfx !== 'undefined') Sfx.play('v_ready', .8); }
  const a = w.ang || 0, [mx, my] = typeof mouthOf === 'function' ? mouthOf(f) : [f.x, f.y - 16];
  const b = typeof bodyOf === 'function' ? bodyOf(f) : {top: f.y - 50, foot: f.y + 20}, T = CARGA.boca.px;      // mismo tamaño en todos los Pokémon (como la Hidrobomba de Lapras)
  cargaDibuja(S, w.type, mx + Math.cos(a) * T * .3, my + Math.sin(a) * T * .22, T, k, ready);
}
if(typeof v5ChgTop === 'function'){
  const oldTop = v5ChgTop;
  v5ChgTop = function(){
    const L = g ? [...g.p, ...g.e].filter(f => f && f.wind && !f.dead && !f.ghost && (cargaSpr(f) || cargaCuerpo(f) || CARGA.propias.includes(f.wind.nm))) : [];
    L.forEach(f => { f.ghost = true; });                                                         // la bola de siempre no se dibuja para estos
    try{ oldTop.apply(this, arguments); } finally { L.forEach(f => { f.ghost = false; }); }
    L.forEach(f => { try{ const S = cargaSpr(f); if(S) cargaBoca(f, S); }catch(e){} });                // los de cuerpo ya llevan su bola alrededor (nvWindFx): sin la bola vieja en la boca
    if(g) [...g.p, ...g.e].forEach(f => { if(f && !f.wind) f.cgR = 0; });
  };
}
