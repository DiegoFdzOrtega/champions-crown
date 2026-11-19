"use strict";
/* =====================================================================
   ATAQUES CON DIBUJO DE GEMINI, MONTADOS A MANO (assets/objetos/ataques/)
   - Pulso Umbrío: un RAYO de oscuridad que sale de la boca y llega hasta donde va el ataque (pulso_umbrio.png, 5 figuras:
     crece, rayo entero, se deshace en humo al acabar).
   - Brecha Negra (como Darkrai en el anime):
       1) bajo el que lo lanza se abre una MANCHA de sombra (brecha_mancha.png, 6 figuras),
       2) de ella salen TENTÁCULOS de sombra que avanzan ondulando hasta el rival (brecha_tentaculos.png, 9 figuras),
       3) al alcanzarlo lo encierra una ESFERA negra con pinchos que luego revienta (brecha_esfera.png, 6 figuras);
       al acabar, los tentáculos se recogen y la mancha se cierra.
   - Aerochorro: rayo de aire con anillos (aerochorro.png, 6 figuras). Listo para cuando algún Pokémon tenga el ataque.
   Si una imagen no carga, se ve el dibujo de antes. AG.on = false lo quita todo.
   ===================================================================== */
const AG = {
  on: true,
  pulso: {grosor: 40, fps: 14, largo: 190},                                     // largo: lo que mide el rayo detrás de la punta (px)                                                    // [AJUSTE] grosor del rayo (px) y velocidad de la animación
  aero: {grosor: 70, fps: 14, largo: 260},                                      // (largo: solo si no hay rayo continuo, en línea)
  brecha: {mancha: 150, tent: 72, esfera: 1.55, dura: 2.4, fps: 12},              // [AJUSTE] ancho de la mancha · grosor de los tentáculos · esfera (× alto del rival) · lo que dura la esfera (s)
  sombra: {a: .32, drop: 34},                                                     // [AJUSTE] sombra de los ataques en el suelo (opacidad, px por debajo)
  oscuro: .32,                                                                     // [AJUSTE] cuánto se oscurece el campo con Brecha Negra (0 = nada)
  img: {}
};
[['pulso', 'pulso_umbrio', 6], ['aero', 'aerochorro', 6], ['mancha', 'brecha_mancha', 6], ['tent', 'brecha_tentaculos', 6], ['esfera', 'brecha_esfera', 6], ['luz', 'pantalla_luz', 6], ['ga', 'golpe_aereo', 6]].forEach(([k, f, n]) => {
  const i = new Image(), o = AG.img[k] = {i, n, ok: false}; i.onload = () => { o.ok = true; o.fw = i.width / n; o.fh = i.height; }; i.src = 'assets/objetos/ataques/' + f + '.png?v=2';
});
const agOk = k => AG.on && AG.img[k] && AG.img[k].ok;
function agFrame(x, k, fr, dx, dy, w, h){ const S = AG.img[k]; x.drawImage(S.i, fr * S.fw, 0, S.fw, S.fh, dx, dy, w, h); }
const agMouth = f => typeof mouthOf === 'function' ? mouthOf(f) : [f.x, f.y - 16];
const agFoot = f => { const b = typeof bodyOf === 'function' ? bodyOf(f) : {foot: f.y + 20}; return [f.x, b.foot - 4]; };

// Sombra del ataque en el suelo (como en el vídeo): el mismo dibujo en negro, aplastado y unos px más abajo
function agShadow(k, fr, x0, y0, x1, y1, T, alpha, drop){
  const L = Math.hypot(x1 - x0, y1 - y0) + 18, a = Math.atan2(y1 - y0, x1 - x0), D = drop == null ? AG.sombra.drop : drop; if(L < 4) return;
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = alpha * AG.sombra.a; ctx.filter = 'brightness(0)';
  ctx.translate(x0, y0 + D); ctx.scale(1, .55); ctx.rotate(a); if(Math.cos(a) < 0) ctx.scale(1, -1);
  agFrame(ctx, k, fr, -6, -T / 2, L, T * 1.3); ctx.restore();
}
// ---------------- Rayos (Pulso Umbrío, Aerochorro): del origen hasta la cabeza del ataque ----------------
const AG_RAYOS = [];                                                               // rayos que se están deshaciendo (cuando el ataque ya ha terminado)
function agBeam(k, fr, x0, y0, x1, y1, T, alpha){
  const L = Math.hypot(x1 - x0, y1 - y0) + 18, a = Math.atan2(y1 - y0, x1 - x0); if(L < 4) return;
  agShadow(k, fr, x0, y0, x1, y1, T, alpha);
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = alpha; ctx.translate(x0, y0); ctx.rotate(a); if(Math.cos(a) < 0) ctx.scale(1, -1);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = alpha; agFrame(ctx, k, fr, -6, -T / 2, L, T); ctx.restore();
}
function agBeamMove(name, k, cfg){
  const o = FXR.flight[name];
  const w = function(s, a, an){
    if(!agOk(k)) return o && (o.draw || o).apply(this, arguments);
    if(s.agx === undefined && s.o){ const m = agMouth(s.o); s.agx = m[0]; s.agy = m[1]; }
    const n = AG.img[k].n, grow = n - 2, fr = a < grow * .07 ? Math.min(grow - 1, Math.floor(a / .07)) : n - 2;      // las primeras crecen, luego el rayo entero
    const sp = Math.hypot(s.vx, s.vy) || 1, ux = s.vx / sp, uy = s.vy / sp;      // el rayo va recto en la dirección del disparo, detrás de la punta
    const L = Math.min(cfg.largo, sp * a + 24), x0 = s.x - ux * L, y0 = s.y - uy * L;
    agBeam(k, fr, x0, y0, s.x, s.y, cfg.grosor * (fr < grow ? .55 + .45 * fr / grow : 1 + .06 * Math.sin(g.t * 30)), 1);
    s.agLast = {x0, y0, x1: s.x, y1: s.y, k, T: cfg.grosor};
    if(!s.agReg){ s.agReg = 1; AG_RAYOS.push(s); }
  };
  if(o) Object.assign(w, o); delete w.draw; FXR.flight[name] = w;
  delete FXR.trail[name];                                                          // sin la estela de chispas de antes: el rayo ya llega hasta el origen
}

// ---------------- Brecha Negra ----------------
const AG_BRECHA = [], AG_POST = [];                                              // AG_POST: lo que se dibuja después del brillo                                                              // {f, s, t0, end, hx, hy}
function agBrechaStart(f, s){ if(!agOk('mancha') || !agOk('tent')) return; AG_BRECHA.push({f, s, t0: g.t, end: 0, hx: s.x, hy: s.y}); }
function agTentacles(x0, y0, x1, y1, T, alpha){
  const S = AG.img.tent, L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0), tw = T * S.fw / S.fh;
  if(L < 4) return; const fr = Math.floor(g.t * AG.brecha.fps) % S.n;
  const pinta = sombra => { ctx.save(); ctx.imageSmoothingEnabled = false;
    if(sombra){ ctx.globalAlpha = alpha * AG.sombra.a; ctx.filter = 'brightness(0)'; ctx.translate(x0, y0 + AG.sombra.drop * .7); ctx.scale(1, .55); } else { ctx.globalAlpha = alpha; ctx.translate(x0, y0); }
    ctx.rotate(a); if(Math.cos(a) < 0) ctx.scale(1, -1); ctx.beginPath(); ctx.rect(0, -T, L, T * 2); ctx.clip();
    for(let d = 0, i = 0; d < L; d += tw - 2, i++) agFrame(ctx, 'tent', (fr + i * 3) % S.n, d, -T / 2, tw, T);        // en trozos (no estirado), así no se deforman las ondas
    ctx.restore(); };
  pinta(true); pinta(false);
}
function agBrechaDraw(suelo){
  for(let i = AG_BRECHA.length - 1; i >= 0; i--){
    const B = AG_BRECHA[i], f = B.f, alive = g.shots.includes(B.s) && B.s.life > 0;
    const agarra = B.T && !B.T.dead && g.t - B.hitT < AG.brecha.dura - .25;      // ha atrapado al rival: los brazos lo sujetan mientras dura la esfera
    if(alive){ B.hx = B.s.x; B.hy = B.s.y; }
    else if(agarra){ const b = typeof bodyOf === 'function' ? bodyOf(B.T) : {top: B.T.y - 40, foot: B.T.y + 20}; B.hx = B.T.x; B.hy = (b.top + b.foot) / 2; B.end = 0; }
    else if(!B.end) B.end = g.t;
    const out = B.end ? g.t - B.end : 0, E = .35;                                  // al acabar: se recogen en E segundos
    if(B.end && out > E + .3 || f.dead){ if(!suelo) AG_BRECHA.splice(i, 1); continue; }
    if(suelo){
      const [px, py] = agFoot(f), a = g.t - B.t0, M = AG.brecha.mancha;          // 1) la mancha bajo el que lo lanza
      const mf = B.end ? (out > E ? 5 : 3 + (Math.floor(g.t * 6) % 2)) : a < .3 ? Math.min(2, Math.floor(a / .1)) : 3 + (Math.floor(g.t * 6) % 2);
      ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = B.end && out > E ? Math.max(0, 1 - (out - E) / .3) : .95;
      agFrame(ctx, 'mancha', mf, px - M / 2, py - M * .32, M, M * .64); ctx.restore();
      continue; }
    const [px, py] = agFoot(f);
    const [mx, my] = [px, py - 6], k = B.end ? Math.max(0, 1 - out / E) : 1;      // 2) los tentáculos, de la mancha a la cabeza del ataque
    if(k > 0) agTentacles(mx, my, mx + (B.hx - mx) * k, my + (B.hy - my) * k, AG.brecha.tent, .95);
  }
}
function agBrechaFlight(){
  const o = FXR.flight['Brecha Negra'];
  const w = function(s, a, an){
    if(!agOk('esfera') || !agOk('tent')) return o && (o.draw || o).apply(this, arguments);
    ctx.save(); ctx.imageSmoothingEnabled = false; const T = 26; agFrame(ctx, 'esfera', 0, s.x - T / 2, s.y - T / 2, T, T); ctx.restore();      // la punta: una bolita negra
  };
  if(o) Object.assign(w, o); delete w.draw; FXR.flight['Brecha Negra'] = w; delete FXR.trail['Brecha Negra'];
  const oi = FXR.impact['Brecha Negra'];
  const wi = function(e, a){                                                       // 3) la esfera encierra al rival y luego revienta
    if(!agOk('esfera')) return oi && (oi.draw || oi).apply(this, arguments);
    if(!e.agB){ e.agB = 1; const B = AG_BRECHA.find(B => !B.T && (!e.T || B.f !== e.T)); if(B){ B.T = e.T; B.hitT = g.t - a; B.end = 0; } }      // los brazos se quedan agarrando a este rival
    const T = e.T && !e.T.dead ? e.T : null, b = T && typeof bodyOf === 'function' ? bodyOf(T) : {top: e.y - 40, foot: e.y + 20};
    const cx = T ? T.x : e.x, cy = (b.top + b.foot) / 2, D = Math.min(150, Math.max(70, (b.foot - b.top) * AG.brecha.esfera)), dura = AG.brecha.dura;
    const fr = a < .3 ? Math.min(2, Math.floor(a / .1)) : a < dura - .25 ? 3 + (Math.floor(g.t * AG.brecha.fps / 2) % 2) : 5;
    const s = a < .3 ? .4 + .6 * a / .3 : fr === 5 ? 1 + (a - (dura - .25)) * 1.2 : 1;
    AG_POST.push(() => { ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = fr === 5 ? Math.max(0, 1 - (a - (dura - .25)) / .25) : .96;
      agFrame(ctx, 'esfera', fr, cx - D * s / 2, cy - D * s / 2, D * s, D * s); ctx.restore(); });
    if(a < .02 && typeof fx !== 'undefined') fx.shake = Math.max(fx.shake, 5);
  };
  if(oi) Object.assign(wi, oi); delete wi.draw; FXR.impact['Brecha Negra'] = wi;
  FXC['Brecha Negra'] = Object.assign({}, FXC['Brecha Negra'] || {}, {idur: AG.brecha.dura});
}

// ---------------- Enganches ----------------
if(AG.on && typeof FXR !== 'undefined'){
  agBeamMove('Pulso Umbrío', 'pulso', AG.pulso);
  agBeamMove('Aerochorro', 'aero', AG.aero);
  agBrechaFlight();
  if(typeof fxShotStart === 'function'){ const o = fxShotStart; fxShotStart = function(f, s, name){ const r = o.apply(this, arguments); try{ if(name === 'Brecha Negra' && f) agBrechaStart(f, s); }catch(e){} return r; }; }
  if(typeof fxhdGround === 'function'){ const o = fxhdGround; fxhdGround = function(){ const r = o.apply(this, arguments); try{ if(g && AG.on) agBrechaDraw(true); }catch(e){} return r; }; }      // la mancha, en el suelo (debajo de los Pokémon)
  if(typeof fxhdEnd === 'function'){ const o = fxhdEnd; fxhdEnd = function(){ const r = o.apply(this, arguments);
    try{ if(g && AG.on){
      const kp = [...g.p, ...g.e].some(f => f && f.burst && f.burst.hb && f.burst.nm === 'Pulso Umbrío') ? .55 : 0;
      const k = Math.max(kp, AG_BRECHA.reduce((m, B) => Math.max(m, B.end ? Math.max(0, 1 - (g.t - B.end) / .4) : Math.min(1, (g.t - B.t0) / .25)), 0));      // el campo se oscurece mientras dura (como en el vídeo)
      if(k > 0 && AG.oscuro){ ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(14,4,30,${(AG.oscuro * k).toFixed(3)})`; ctx.fillRect(0, 0, cv.width, cv.height); ctx.restore(); }
      agBrechaDraw(false); AG_POST.forEach(fn => fn()); agLuzDraw(); agGaDraw(); } }catch(e){}
    AG_POST.length = 0; return r; }; }
  if(typeof fxDraw === 'function'){ const o = fxDraw; fxDraw = function(){
    if(g && AG.on){
      for(let i = AG_RAYOS.length - 1; i >= 0; i--){                              // rayos que ya han acabado: se deshacen en humo (la última figura)
        const s = AG_RAYOS[i], alive = g.shots.includes(s) && s.life > 0;
        if(alive) continue; if(!s.agEnd) s.agEnd = g.t; const u = (g.t - s.agEnd) / .45, L = s.agLast;      // el rayo aguanta un poco al golpear y luego se deshace en humo
        if(u >= 1 || !L){ AG_RAYOS.splice(i, 1); continue; }
        try{ agBeam(L.k, u < .45 ? AG.img[L.k].n - 2 : AG.img[L.k].n - 1, L.x0, L.y0, L.x1, L.y1, L.T * (u < .45 ? 1 - u * .5 : 1 + u * .3), u < .45 ? 1 : (1 - u) / .55); }catch(e){}
      }
    }
    return o.apply(this, arguments); }; }
}

// ---- Rayo continuo con el dibujo de Gemini: la boca del rayo (el primer 38 % de la figura) una vez, y el cuerpo repetido hasta donde llegue.
//      Así no se estira ni se deforma por largo que sea.
// Cuerpo del rayo: el corte del rayo de Gemini (una tira de 1 px con sus colores de arriba abajo, *_cuerpo.png) estirado a lo largo:
// así es un rayo continuo, sin cortes. Encima, adornos que avanzan por el rayo (como en el vídeo) y la boca del rayo del dibujo de Gemini.
const AG_CUERPO = {};
[['pulso', 'pulso_umbrio_cuerpo'], ['aero', 'aerochorro_cuerpo']].forEach(([k, f]) => { const i = new Image(), o = AG_CUERPO[k] = {i, ok: false}; i.onload = () => { o.ok = true; }; i.src = 'assets/objetos/ataques/' + f + '.png?v=1'; });
const AG_DECO = {
  pulso: {cuerpo: .5, cada: 95, vel: 300, aro: (x, h, W, t) => {                     // collares de pinchos oscuros (como el Pulso Umbrío del vídeo)
    const rx = W * .11, ry = h * .78, n = 14; ctx.beginPath();
    for(let j = 0; j <= n * 2; j++){ const a = j / (n * 2) * 6.283, r = j % 2 ? 1 : 1.32; const px = x + Math.cos(a) * rx * r, py = Math.sin(a) * ry * r; j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.fillStyle = '#1a0630'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#b44cff'; ctx.stroke(); },
    rayas: ['#ff2a55', '#ffffff']},
  aero: {cuerpo: .56, cada: 80, vel: 420, aro: (x, h, W, t) => {                      // anillos de viento
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(235,252,255,.95)'; ctx.beginPath(); ctx.ellipse(x, 0, W * .09, h * .78, 0, 0, 6.283); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(120,200,255,.9)'; ctx.beginPath(); ctx.ellipse(x - 4, 0, W * .07, h * .66, 0, 0, 6.283); ctx.stroke(); },
    rayas: ['rgba(255,255,255,.9)', 'rgba(150,220,255,.9)']}
};
function agBeamTile(k, fr, L, W, A){
  const S = AG.img[k], C = AG_CUERPO[k], D = AG_DECO[k], t = g.t; if(!C || !C.ok || !D) return;
  const h = W * D.cuerpo * (A == null ? 1 : .4 + .6 * A), cap = S.fw * .3, capW = cap * W / S.fh;
  ctx.drawImage(C.i, 0, 0, C.i.width, C.i.height, capW * .5, -h / 2, Math.max(0, L - capW * .5), h);          // el cuerpo, de una pieza
  ctx.save(); ctx.beginPath(); ctx.rect(capW * .5, -W, Math.max(0, L - capW * .5), W * 2); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';                                                                        // brillo que recorre el rayo
  for(let s = 0; s < 3; s++){ const y = (s - 1) * h * .22, ph = t * 30 + s * 2; ctx.strokeStyle = D.rayas[s % 2]; ctx.globalAlpha = .55; ctx.lineWidth = s === 1 ? 2.5 : 1.5;
    ctx.beginPath(); for(let x = 0; x <= L; x += 10){ const yy = y + Math.sin(x * .03 - ph) * h * .06; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke(); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = A == null ? 1 : A;
  const off = (t * D.vel) % D.cada; for(let x = capW + off; x < L - 10; x += D.cada) D.aro(x, h, W, t);           // adornos que avanzan
  ctx.restore();
  ctx.drawImage(S.i, fr * S.fw, 0, cap, S.fh, -6, -W / 2, capW, W);                                             // la boca del rayo (dibujo de Gemini)
  ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createRadialGradient(L, 0, 0, L, 0, h * 1.1);         // la punta brilla
  gr.addColorStop(0, k === 'pulso' ? 'rgba(220,120,255,.9)' : 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.fillRect(L - h * 1.1, -h * 1.1, h * 2.2, h * 2.2);
  ctx.globalCompositeOperation = 'source-over';
}
// ---- Aerochorro como el Hiperrayo: rayo continuo que sale de la boca durante un rato y se gira con el ratón (js/fxvideo2.js, BEAMX),
//      pero dibujado con el sprite de Gemini (crece, rayo entero con los anillos, al final se deshace en viento) ----
const AG_RAYO = {                                                                   // rayos continuos con dibujo: nombre → [imagen, grosor (px)]
  'Aerochorro':   ['aero', 84],
  'Pulso Umbrío': ['pulso', 64]
};
if(AG.on && typeof BEAMX !== 'undefined'){
  BEAMX['Aerochorro'] = Object.assign({}, BEAMX['Hiperrayo'], {c: ['200,240,255', '#9ee8ff', '#e8fbff', '#ffffff'], onda: 'rgba(255,255,255,.9)'});
  // Pulso Umbrío como el Rayo Hielo: el disparo (clic derecho) es un rayo corto que sale de la boca, se mueve con el ratón y EMPUJA al rival
  BEAMX['Pulso Umbrío'] = Object.assign({}, BEAMX['Rayo Hielo'], {T: .75, ancho: 20, dmg: 1, lento: .45, c: ['150,60,220', '#5a1a9a', '#2a0a4a', '#000000'], onda: 'rgba(200,120,255,.8)', hielo: 0, empuja: 240});
  if(typeof hb6Tick === 'function'){ const o = hb6Tick; hb6Tick = function(f, dt){ const r = o.apply(this, arguments);
    try{ const b = f.burst; if(b && b.K && b.K.empuja && b.hitOn){ const T = foe(b.mine); if(T && !T.dead){ T.x += Math.cos(b.cur) * b.K.empuja * dt; T.y += Math.sin(b.cur) * b.K.empuja * dt * .7; } } }catch(e){}
    return r; }; }
  if(typeof hb6Draw === 'function'){ const o = hb6Draw; hb6Draw = function(){
    if(!g) return o.apply(this, arguments);
    const L = [...g.p, ...g.e].filter(f => f && f.burst && f.burst.hb && AG_RAYO[f.burst.nm] && agOk(AG_RAYO[f.burst.nm][0]) && f.burst.x0 != null), B = L.map(f => f.burst);
    L.forEach(f => { f.burst = null; }); try{ o.apply(this, arguments); } finally { L.forEach((f, i) => { f.burst = B[i]; }); }      // los demás rayos, como siempre
    L.forEach(f => { const b = f.burst, K = b.K, [k, gro] = AG_RAYO[b.nm], n = AG.img[k].n, W = gro * (1 + .05 * Math.sin(g.t * 40));
      const fr = b.t < .14 ? Math.floor(b.t / .07) : b.t > K.T - .15 ? n - 1 : 2 + (Math.floor(g.t * AG.aero.fps) % 3);       // empieza · rayo (figuras 3-5) · se deshace
      const A = b.t > K.T - .15 ? Math.max(0, (K.T - b.t) / .15) : 1, Lb = b.len * Math.min(1, b.t / .12);      // sale disparado (crece en 0,12 s) y al acabar se apaga
      { const h = W * AG_DECO[k].cuerpo; ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(10,0,20,${(.3 * A).toFixed(3)})`;      // sombra en el suelo
        ctx.translate(b.x0, b.y0 + 44); ctx.scale(1, .5); ctx.rotate(b.cur); ctx.beginPath(); ctx.ellipse(Lb / 2, 0, Lb / 2, h * .8, 0, 0, 6.283); ctx.fill(); ctx.restore(); }
      ctx.save(); ctx.translate(b.x0, b.y0); ctx.rotate(b.cur); if(Math.cos(b.cur) < 0) ctx.scale(1, -1); ctx.imageSmoothingEnabled = false; ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = A; agBeamTile(k, Math.min(fr, n - 2), Lb, W, A); ctx.restore(); });
  }; }
}

// ---------------- Pantalla de Luz (Latios y Latias, tecla Q): un muro de hexágonos delante del Pokémon mientras dura ----------------
if(typeof Q_FX !== 'undefined') Q_FX['Pantalla de Luz'] = {def: .6, tx: '¡Pantalla de Luz!'};
function agLuzDraw(){
  if(!agOk('luz')) return; const S = AG.img.luz;
  [...g.p, ...g.e].forEach(f => {
    const on = f && !f.dead && f.buff > 0 && f.qfx === (typeof Q_FX !== 'undefined' && Q_FX['Pantalla de Luz']);
    if(!on){ if(f && f.agLuz && !f.agLuz.end) f.agLuz.end = g.t; if(f && f.agLuz && f.agLuz.end && g.t - f.agLuz.end > .3) f.agLuz = null; if(!(f && f.agLuz)) return; }
    else if(!f.agLuz || f.agLuz.end) f.agLuz = {t0: g.t};
    const L = f.agLuz, a = g.t - L.t0, end = L.end ? g.t - L.end : -1;
    const fr = end >= 0 ? 5 : a < .3 ? Math.floor(a / .1) : 3 + (Math.floor(g.t * 6) % 2);
    const b = typeof bodyOf === 'function' ? bodyOf(f) : {top: f.y - 50, foot: f.y + 20}, H2 = Math.max(70, (b.foot - b.top) * 1.25), W2 = H2 * S.fw / S.fh;
    const D = typeof DIRV !== 'undefined' ? DIRV[f.dir || 0] : [1, 0], cx = f.x + D[0] * 34, cy = (b.top + b.foot) / 2 + D[1] * 14;
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = (end >= 0 ? Math.max(0, 1 - end / .3) : 1) * .82;
    ctx.translate(cx, cy); if(Math.abs(D[0]) > .5) ctx.scale(.55, 1);                                    // de lado se ve el muro de canto
    agFrame(ctx, 'luz', fr, -W2 / 2, -H2 / 2, W2, H2); ctx.restore();
  });
}
// ---------------- Golpe Aéreo (Swellow y Taillow, golpe): al acertar, la pantalla se llena de rayas de manga y el tajo ----------------
const AG_GA = {t: -9, dur: .45};
if(AG.on && typeof hit === 'function'){ const o = hit; hit = function(T, dmg, type, A, close, big, mvn){
  const r = o.apply(this, arguments);
  try{ if(mvn === 'Golpe Aéreo' && agOk('ga') && g){ AG_GA.t = g.t; if(!g.pvp && typeof fxhd !== 'undefined') fxhd.stop = Math.max(fxhd.stop || 0, .12); if(typeof fx !== 'undefined') fx.shake = Math.max(fx.shake, 6); } }catch(e){}
  return r; }; }
function agGaDraw(){
  const u = (g.t - AG_GA.t) / AG_GA.dur; if(u < 0 || u >= 1 || !agOk('ga')) return;
  const fr = Math.min(5, Math.floor(u * 6)), w = cv.width, h = cv.height;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = .55 * (1 - u); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = u > .75 ? (1 - u) / .25 : 1; ctx.imageSmoothingEnabled = true; agFrame(ctx, 'ga', fr, 0, 0, w, h); ctx.restore();
}
