"use strict";
/* =====================================================================
   CARGA DE LOS ATAQUES FUERTES (la E) CON DIBUJO, UNA POR TIPO (sprites de Gemini en assets/objetos/cargas/carga_<tipo>.png)
   Mientras mantienes la E, alrededor del Pokémon se forma un remolino del color de su tipo (6 figuras en una fila):
   las 4 primeras crecen según lo cargado y, cuando el ataque ya está listo, parpadea entre las 2 últimas.
   Todos los ataques E de un mismo tipo usan la misma carga. Los que ya tienen la suya propia la mantienen (CARGA.propias).
   Si falta la imagen de un tipo, se ve la carga de siempre (la dibujada con código).
   ===================================================================== */
const CARGA = {
  tipos: ['fuego', 'agua', 'planta', 'electrico', 'hielo', 'lucha', 'veneno', 'tierra', 'volador', 'psiquico', 'bicho', 'roca', 'fantasma'],   // [AJUSTE] los tipos que ya tienen imagen: añade aquí el nombre cuando llegue una nueva
  propias: ['Envite Ígneo', 'Rayo Solar'],                                     // ataques con carga propia dibujada (js/embestida.js, js/fxnuevos.js)
  tam: 1.95,                                                                       // [AJUSTE] tamaño respecto al alto del Pokémon
  min: 95,                                                                         // [AJUSTE] tamaño mínimo (px), para que en los Pokémon pequeños también se vea
  alpha: .95,                                                                      // [AJUSTE] opacidad
  // Ataques que NO salen de la boca (te lanzas con todo el cuerpo o golpeas el suelo): su remolino va alrededor del Pokémon.
  // Todos los demás salen de la boca: el remolino nace pequeño en la boca y crece hasta que lo lanzas (en lugar de la bola de js/fxvideo.js).
  cuerpo: /envite|p[aá]jaro osado|voltio cruel|giga ?impacto|doble filo|placaje|terremoto|magnitud|megacuerno|a[eé]rea|vuelo|bote|golpe cuerpo|cuerpo pesado|carga|embestida|pu[ñn]o|patada|machada|demolici[oó]n|martillo|cabezazo|tajo|garra|colmillo|lanzarse|ida y vuelta|u-turn/i,
  boca: {min: 16, max: 1.05, maxPx: 120, giro: 2.2},                               // [AJUSTE] en la boca: tamaño al empezar (px) · al estar listo (× alto del Pokémon, como mucho maxPx) · lo que gira
  img: {}
};
CARGA.tipos.forEach(t => { const i = new Image(), o = CARGA.img[t] = {i, ok: false}; i.onload = () => { o.ok = true; o.fw = i.width / 6; o.fh = i.height; }; i.src = 'assets/objetos/cargas/carga_' + t + '.png?v=2'; });

if(typeof nvWindFx === 'function'){
  const oldCarga = nvWindFx;
  nvWindFx = function(f, w){
    const S = w && !CARGA.propias.includes(w.nm) ? CARGA.img[w.type] : null;
    if(S && S.ok && !CARGA.cuerpo.test(w.nm || '')) return;                                       // de boca: lo dibuja cargaBoca() (más abajo), encima del Pokémon
    if(!S || !S.ok) return oldCarga.apply(this, arguments);
    const k = Math.max(0, Math.min(1, w.hold ? (w.c || 0) / (FEEL.wind || 1) : 1 - w.t / w.T));             // 0 → 1 hasta que el ataque está listo
    const fr = k < 1 ? Math.min(3, Math.floor(k * 4)) : 4 + (Math.floor(g.t * 10) % 2);                    // listo: parpadea entre las dos últimas
    const b = typeof bodyOf === 'function' ? bodyOf(f) : {top: f.y - 50, foot: f.y + 20}, cy = (b.top + b.foot) / 2;
    const T = Math.max(CARGA.min, (b.foot - b.top) * CARGA.tam);
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = CARGA.alpha;
    ctx.drawImage(S.i, fr * S.fw, 0, S.fw, S.fh, f.x - T / 2, cy - T / 2, T, T);
    ctx.restore();
  };
}

// ---- Ataques de boca: el remolino nace en la boca y va creciendo (sustituye a la bola de color de js/fxvideo.js, v5ChgTop) ----
const cargaSpr = f => { const w = f && f.wind; if(!w || CARGA.propias.includes(w.nm) || CARGA.cuerpo.test(w.nm || '')) return null; const S = CARGA.img[w.type]; return S && S.ok ? S : null; };
function cargaBoca(f, S){
  const w = f.wind, k = Math.max(0, Math.min(1, w.hold ? (w.c || 0) / (FEEL.wind || 1) : 1 - w.t / w.T)), ready = w.hold ? w.c >= FEEL.wind : k > .3;
  if(ready && !f.cgR){ f.cgR = 1; if(w.hold && typeof Sfx !== 'undefined') Sfx.play('v_ready', .8); }
  const fr = k < 1 ? Math.min(3, Math.floor(k * 4)) : 4 + (Math.floor(g.t * 10) % 2);
  const a = w.ang || 0, [mx, my] = typeof mouthOf === 'function' ? mouthOf(f) : [f.x, f.y - 16], ox = mx + Math.cos(a) * 10, oy = my + Math.sin(a) * 7;
  const b = typeof bodyOf === 'function' ? bodyOf(f) : {top: f.y - 50, foot: f.y + 20}, big = Math.min(CARGA.boca.maxPx, (b.foot - b.top) * CARGA.boca.max);
  const e = 1 - Math.pow(1 - k, 2), T = CARGA.boca.min + (big - CARGA.boca.min) * e + (ready ? 3 * Math.sin(g.t * 30) : 0);
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = CARGA.alpha; ctx.translate(ox, oy); ctx.rotate(g.t * CARGA.boca.giro);
  ctx.drawImage(S.i, fr * S.fw, 0, S.fw, S.fh, -T / 2, -T / 2, T, T); ctx.restore();
}
if(typeof v5ChgTop === 'function'){
  const oldTop = v5ChgTop;
  v5ChgTop = function(){
    const L = g ? [...g.p, ...g.e].filter(f => f && f.wind && !f.dead && !f.ghost && cargaSpr(f)) : [];
    L.forEach(f => { f.ghost = true; });                                                         // la bola de siempre no se dibuja para estos
    try{ oldTop.apply(this, arguments); } finally { L.forEach(f => { f.ghost = false; }); }
    L.forEach(f => { try{ cargaBoca(f, cargaSpr(f)); }catch(e){} });
    if(g) [...g.p, ...g.e].forEach(f => { if(f && !f.wind) f.cgR = 0; });
  };
}
