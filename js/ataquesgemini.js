"use strict";
/* =====================================================================
   ATAQUES CON DIBUJO DE GEMINI, MONTADOS A MANO (assets/objetos/ataques/)
   - Pulso Umbrío: un RAYO de oscuridad que sale de la boca y llega hasta donde va el ataque (pulso_umbrio.png, 5 figuras:
     crece, rayo entero, se deshace en humo al acabar).
   - Brecha Negra (como Darkrai en el vídeo): mancha, brazos con mano, esfera, Z y rotura (piezas en ataques/brecha/, ver BN).
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
[['pulso', 'pulso_umbrio', 6], ['aero', 'aerochorro', 6], ['ga', 'golpe_aereo', 6]].forEach(([k, f, n]) => {
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

// ---------------- Brecha Negra (piezas de Gemini en assets/objetos/ataques/brecha/bn_*.png) ----------------
//  1) bajo Darkrai se abre la MANCHA   2) de ella salen dos BRAZOS de sombra con la MANO abierta en la punta
//  3) al llegar, la mano se cierra y la ESFERA se cierra sobre el rival (se le ve dentro) y le salen las Z
//  4) los brazos lo sujetan mientras duerme y el campo se oscurece   5) la esfera se rompe, los brazos se recogen y la mancha se cierra
const BN = {
  mancha: 150,                 // [AJUSTE] ancho de la mancha (px)
  brazo: 78,                   // [AJUSTE] alto del dibujo del brazo (px; el antebrazo es ~80 % de esto)
  mano: 1.0,                   // [AJUSTE] tamaño de la mano (× grosor del brazo)
  esfera: 1.6, min: 86, max: 170,   // [AJUSTE] tamaño de la esfera (× alto del rival), mínimo y máximo (px)
  dura: 2.4,                   // [AJUSTE] lo que dura atrapado (s)
  flujo: 75,                   // [AJUSTE] lo rápido que corre la sombra por los brazos
  onda: .10,                   // [AJUSTE] cuánto ondulan los brazos
  curva: [.30, -.10],          // [AJUSTE] curva de cada brazo (+ = hacia arriba)
  img: {}
};
[['mancha', 6], ['mano', 4], ['esfera', 13], ['zzz', 4]].forEach(([k, n]) => {
  const i = new Image(), o = BN.img[k] = {i, n, ok: false}; i.onload = () => { o.ok = true; o.fw = i.width / n; o.fh = i.height; }; i.src = 'assets/objetos/ataques/brecha/bn_' + k + '.png?v=1';
});
function bnNegro(S){                                                            // copia en negro de la tira (para la sombra, sin ctx.filter, que es lento)
  if(S.negro || !S.ok) return S.negro; const c = document.createElement('canvas'); c.width = S.i.width; c.height = S.i.height;
  const x = c.getContext('2d'); x.drawImage(S.i, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height); return S.negro = c;
}
const bnOk = () => AG.on && ['mancha', 'mano', 'esfera'].every(k => BN.img[k].ok);
const bnFr = (k, fr, x, y, w, h) => { const S = BN.img[k]; ctx.drawImage(S.i, fr * S.fw, 0, S.fw, S.fh, x, y, w, h); };
const bnD = b => Math.min(BN.max, Math.max(BN.min, (b.foot - b.top) * BN.esfera));
const bnH = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };     // "azar" fijo (no toca Math.random: no afecta al online)

function bnCurve(x0, y0, x1, y1, bend){                     // curva del brazo (con su largo acumulado en cada punto)
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1; let nx = -dy / L, ny = dx / L; if(ny > 0){ nx = -nx; ny = -ny; }
  const cx = (x0 + x1) / 2 + nx * bend * L, cy = (y0 + y1) / 2 + ny * bend * L, P = []; let acc = 0, px = x0, py = y0;
  for(let i = 0; i <= 40; i++){ const t = i / 40, u = 1 - t, x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1; acc += Math.hypot(x - px, y - py); P.push([x, y, acc]); px = x; py = y; }
  return P;
}
function bnAt(P, s){
  for(let i = 1; i < P.length; i++) if(P[i][2] >= s || i === P.length - 1){
    const a = P[i - 1], b = P[i], k = b[2] > a[2] ? Math.max(0, Math.min(1, (s - a[2]) / (b[2] - a[2]))) : 0;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, Math.atan2(b[1] - a[1], b[0] - a[0])];
  }
}
// Un brazo: el MISMO dibujo de la mano de Gemini (bn_mano.png). Su antebrazo se alarga a lo largo de la curva en rodajas finas
// y en la punta va su mano tal cual, así brazo y mano son una sola pieza y no se nota ninguna unión.
const BN_MANO = {desde: 18, muneca: 125, der: [265, 232, 246, 209]};               // columnas del dibujo: inicio del antebrazo, muñeca y fin de la mano en cada figura
function bnArm(P, k, T, hand, alpha, sombra, seed, flip){
  const L = P[P.length - 1][2] * k, M = BN.img.mano; if(L < 4 || !M.ok) return;
  if(sombra){                                                                   // la sombra: una sola mancha lisa en el suelo (sin rodajas, así no salen rayas)
    const up = [], dn = []; for(let s = 0; s <= L; s += 6){ const [x, y, a] = bnAt(P, s), r = T * .5 * Math.min(1, .6 + s / 100) * (s > L - 12 ? .6 : 1), nx = -Math.sin(a), ny = Math.cos(a); up.push([x + nx * r, y + ny * r]); dn.push([x - nx * r, y - ny * r]); }
    ctx.save(); ctx.fillStyle = `rgba(10,0,20,${alpha.toFixed(3)})`; ctx.beginPath(); [...up, ...dn.reverse()].forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); ctx.restore(); return;
  }
  const IMG = M.i, sc = T / M.fh, fr = hand < 0 ? 0 : hand, x0 = fr * M.fw, st = 3;
  const de = BN_MANO.desde, mu = BN_MANO.muneca, der = BN_MANO.der[fr];
  const hl = Math.min(L * .55, (der - mu) * sc), La = L - hl;                   // lo que mide la mano · lo que mide el antebrazo
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = alpha;
  const onda = s => sombra ? 0 : Math.sin(s * .04 - g.t * 6 + seed) * T * BN.onda * Math.min(1, s / 50, Math.max(0, La - s) / 50);
  for(let s = 0; s < La; s += st){
    const [x, y, a] = bnAt(P, s), w = onda(s), nx = -Math.sin(a), ny = Math.cos(a);
    const u = de + (mu - de) * s / La, sw = Math.max(1, (mu - de) * st / La), ta = Math.min(1, .6 + s / 100);    // más fino donde sale de la mancha
    ctx.save(); ctx.translate(x + nx * w, y + ny * w); ctx.rotate(a); if(flip) ctx.scale(1, -1);
    ctx.drawImage(IMG, x0 + u, 0, sw, M.fh, -.5, -T * ta / 2, st + (sombra ? .6 : 1.2), T * ta); ctx.restore();
  }
  const [x, y] = bnAt(P, La), [x2, y2] = bnAt(P, L), a = Math.atan2(y2 - y, x2 - x);      // la mano, pegada a su propio antebrazo
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); if(flip) ctx.scale(1, -1);
  ctx.drawImage(IMG, x0 + mu, 0, der - mu, M.fh, -.6, -T / 2, hl + .6, T); ctx.restore();
  ctx.restore();
}
const BN_ROTURA = [];                                                            // esferas rompiéndose: {cx, foot, D, t0}
function bnSphere(cx, foot, D, a, rompe){
  const S = BN.img.esfera, h = D * S.fh / S.fw, y0 = foot + h * .06 - h;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  if(a < rompe){
    const fr = a < .24 ? Math.floor(a / .08) : a < .54 ? 3 + Math.min(2, Math.floor((a - .24) / .1)) : 6 + Math.floor((a - .54) * 8) % 7;
    const s = a < .24 ? 1.3 - .3 * a / .24 : 1;                                // el anillo se cierra sobre el rival
    bnFr('esfera', fr, cx - D * s / 2, y0 + h * (1 - s), D * s, h * s);
    const Z = BN.img.zzz;
    if(Z.ok && a > .6){ const zw = D * .5, zh = zw * Z.fh / Z.fw; ctx.globalAlpha = Math.min(1, (a - .6) / .2, (rompe - a) / .2);
      bnFr('zzz', Math.floor((a - .6) * 3.2) % 4, cx + D * .22, y0 - zh * .55, zw, zh); }
  } else {                                                                     // se rompe en pedazos
    const u = Math.min(1, (a - rompe) / .45), tt = u * .45, N = 4, fw = S.fw / N, fh = S.fh / N, pw = D / N, ph = h / N;
    for(let i = 0; i < N; i++) for(let j = 0; j < N; j++){
      const ox = (i + .5) / N - .5, oy = (j + .5) / N - .55, r = Math.hypot(ox, oy) || .1, v = 260 + bnH(i, j) * 180;
      const x = cx + ox * D + ox / r * v * tt, y = y0 + (j + .5) * ph + oy / r * v * tt + 420 * tt * tt;
      ctx.save(); ctx.globalAlpha = 1 - u; ctx.translate(x, y); ctx.rotate((bnH(j, i) - .5) * 7 * u);
      ctx.drawImage(S.i, 12 * S.fw + i * fw, j * fh, fw, fh, -pw / 2, -ph / 2, pw, ph); ctx.restore();
    }
    ctx.globalAlpha = (1 - u) * .8; ctx.strokeStyle = '#b48cff'; ctx.lineWidth = 4 * (1 - u) + 1;    // el golpe de la rotura
    ctx.beginPath(); ctx.ellipse(cx, y0 + h * .45, D * (.5 + u * .5), D * (.5 + u * .5), 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

const AG_BRECHA = [], AG_POST = [];                                              // AG_POST: lo que se dibuja después del brillo
function agBrechaStart(f, s){ if(!bnOk()) return; AG_BRECHA.push({f, s, t0: g.t, end: 0, hx: s.x, hy: s.y, ends: null}); }
function agBrechaDraw(suelo){
  if(!suelo) for(let i = BN_ROTURA.length - 1; i >= 0; i--){ const R = BN_ROTURA[i], u = g.t - R.t0; if(u > .5 || u < 0){ BN_ROTURA.splice(i, 1); continue; } bnSphere(R.cx, R.foot, R.D, 1 + u, 1); }
  for(let i = AG_BRECHA.length - 1; i >= 0; i--){
    const B = AG_BRECHA[i], f = B.f, alive = g.shots.includes(B.s) && B.s.life > 0;
    const T = B.T && !B.T.dead ? B.T : null, held = T && g.t - B.hitT < BN.dura - .3;
    if(alive && !B.T){ B.hx = B.s.x; B.hy = B.s.y; }
    else if(held) B.end = 0;
    else if(!B.end) B.end = g.t;
    const out = B.end ? g.t - B.end : 0, E = .4;                                 // al acabar: los brazos se recogen en E s y la mancha se cierra
    if(B.end && out > E + .35 || f.dead){ if(!suelo) AG_BRECHA.splice(i, 1); continue; }
    const [px, py] = agFoot(f), a = g.t - B.t0, dir = Math.sign(B.hx - px) || 1, mx = px + dir * 16, my = py - 2;
    if(held){ const b = typeof bodyOf === 'function' ? bodyOf(T) : {top: T.y - 40, foot: T.y + 20}, R = bnD(b) / 2, cy = b.foot - R * 1.05;
      B.ends = [[T.x - dir * R * .42, cy - R * .38, b.foot], [T.x - dir * R * .36, cy + R * .34, b.foot]]; }
    else if(!B.end || !B.ends) B.ends = [[B.hx, B.hy - 8, B.hy + 46], [B.hx, B.hy + 8, B.hy + 46]];
    const k = B.end ? Math.max(0, 1 - out / E) : 1, flip = dir < 0;
    if(suelo){
      const Mw = BN.mancha, Mh = Mw * BN.img.mancha.fh / BN.img.mancha.fw;
      const cierra = B.end && out > E * .6, s = cierra ? Math.max(0, 1 - (out - E * .6) / .45) : Math.min(1, a / .15);
      const fr = cierra ? 5 : a < .15 ? 0 : 1 + Math.floor(g.t * 7) % 4;
      ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = .96;
      bnFr('mancha', fr, mx - Mw * s / 2, my - Mh * .62 * s, Mw * s, Mh * s); ctx.restore();
      B.ends.forEach((e, j) => bnArm(bnCurve(mx, my, e[0], e[2], 0), k, BN.brazo * .4, 0, AG.sombra.a, true, j * 2.1, flip));     // sombra de los brazos en el suelo
      continue; }
    const hand = held ? Math.min(3, 1 + Math.floor((g.t - B.hitT) / .06)) : 0;
    B.ends.forEach((e, j) => bnArm(bnCurve(mx, my - 6, e[0], e[1], BN.curva[j]), k, BN.brazo * (j ? .85 : 1), hand, .97, false, j * 2.1, flip));
  }
}
function agBrechaFlight(){
  const o = FXR.flight['Brecha Negra'];
  const w = function(s, a, an){ if(!bnOk()) return o && (o.draw || o).apply(this, arguments); };      // la punta del ataque son las manos
  if(o) Object.assign(w, o); delete w.draw; FXR.flight['Brecha Negra'] = w; delete FXR.trail['Brecha Negra'];
  const oi = FXR.impact['Brecha Negra'];
  const wi = function(e, a){
    if(!bnOk()) return oi && (oi.draw || oi).apply(this, arguments);
    if(!e.agB){ e.agB = 1; const B = AG_BRECHA.find(B => !B.T && (!e.T || B.f !== e.T)); if(B){ B.T = e.T; B.hitT = g.t - a; B.end = 0; } }      // los brazos se quedan agarrando a este rival
    const T = e.T && !e.T.dead ? e.T : null, b = T && typeof bodyOf === 'function' ? bodyOf(T) : {top: e.y - 40, foot: e.y + 20};
    const cx = T ? T.x : e.x, D = bnD(b), rompe = BN.dura - .3;
    if(a < rompe) AG_POST.push(() => bnSphere(cx, b.foot, D, a, rompe));
    else if(!e.bnR){ e.bnR = 1; BN_ROTURA.push({cx, foot: b.foot, D, t0: g.t - (a - rompe)}); }
    if(typeof fx !== 'undefined' && (a < .02 || Math.abs(a - rompe) < .02)) fx.shake = Math.max(fx.shake, 5);
  };
  if(oi) Object.assign(wi, oi); delete wi.draw; FXR.impact['Brecha Negra'] = wi;
  FXC['Brecha Negra'] = Object.assign({}, FXC['Brecha Negra'] || {}, {idur: BN.dura});
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
      AG_POST.forEach(fn => fn()); agBrechaDraw(false); agLuzDraw(); agGaDraw(); } }catch(e){}
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
  'Aerochorro':   ['aero', 84]
};
if(AG.on && typeof BEAMX !== 'undefined'){
  BEAMX['Aerochorro'] = Object.assign({}, BEAMX['Hiperrayo'], {c: ['200,240,255', '#9ee8ff', '#e8fbff', '#ffffff'], onda: 'rgba(255,255,255,.9)'});
  // Pulso Umbrío como el Rayo Hielo: el disparo (clic derecho) es un rayo corto que sale de la boca, se mueve con el ratón y EMPUJA al rival
  BEAMX['Pulso Umbrío'] = Object.assign({}, BEAMX['Rayo Hielo'], {T: .95, ancho: 36, dmg: 1, cd: 2.2, lento: .45, c: ['150,60,220', '#5a1a9a', '#2a0a4a', '#000000'], onda: 'rgba(200,120,255,.8)', hielo: 0, empuja: 240});
  BEAMX['Psicorrayo'] = Object.assign({}, BEAMX['Rayo Hielo'], {T: .8, ancho: 30, dmg: 1, cd: 1.8, lento: .5, c: ['255,120,220', '#d048b0', '#ff8fd8', '#ffffff'], onda: 'rgba(255,220,250,.9)', hielo: 0});      // rayo continuo como Rayo Hielo, con las piezas pr_*
  // Rayo, Tinieblas y Dragoaliento: de disparo a rayo continuo de clic, como Rayo Hielo (sin congelar)
  BEAMX['Rayo'] = Object.assign({}, BEAMX['Rayo Hielo'], {T: .7, ancho: 26, dmg: 1, cd: 1.8, lento: .5, c: ['255,230,80', '#ffd23a', '#fff6a0', '#ffffff'], onda: 'rgba(255,255,220,.9)', hielo: 0});
  BEAMX['Tinieblas'] = Object.assign({}, BEAMX['Rayo Hielo'], {T: .8, ancho: 30, dmg: 1, cd: 1.8, lento: .5, c: ['150,60,200', '#6a2a9a', '#c27bff', '#ffffff'], onda: 'rgba(220,150,255,.8)', hielo: 0});
  BEAMX['Dragoaliento'] = Object.assign({}, BEAMX['Rayo Hielo'], {T: .8, ancho: 30, dmg: 1, cd: 1.8, lento: .5, c: ['60,220,200', '#1a9a8a', '#7fffe0', '#ffffff'], onda: 'rgba(200,255,245,.9)', hielo: 0});
  // [AJUSTE] recarga (s) de los rayos de clic: aquí, todos juntos, para equilibrarlos de un vistazo
  const RAYO_CD = {'Rayo Hielo': 3.2, 'Psicorrayo': 3.2, 'Pulso Dragón': 3.2, 'Rayo': 3.2, 'Tinieblas': 3.2, 'Dragoaliento': 3.2, 'Pulso Umbrío': 3.6};
  for(const n in RAYO_CD) if(BEAMX[n]) BEAMX[n].cd = RAYO_CD[n];
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
// ---- Pantalla de Luz como en el vídeo: una PARED DE HEXÁGONOS de cristal delante del Pokémon, mirando al rival ----
// Gemini dibuja un solo hexágono (pl_hex: 3 aparece + 3 brillo) y cómo se rompe (pl_hex_fin, 6); la pared la monta el juego.
const PLZ = {
  filas: 5, cols: 3,           // [AJUSTE] tamaño de la pared en hexágonos
  tam: .8, min: 46, max: 80,   // [AJUSTE] alto de cada hexágono (× alto del Pokémon), mínimo y máximo (px)
  junto: .62,                  // [AJUSTE] lo juntos que van (menos = se solapan más)
  lejos: .75,                  // [AJUSTE] a qué distancia del Pokémon se pone la pared (× ancho de la pared)
  sale: .035,                  // [AJUSTE] cada cuánto aparece el siguiente hexágono (s)
  fuerte: .7, luego: .5,       // [AJUSTE] segundos que se ve fuerte y opacidad después (medio transparente)
  img: {}
};
[['hex', 'pl_hex', 6], ['fin', 'pl_hex_fin', 6]].forEach(([k, f, n]) => { const i = new Image(), o = PLZ.img[k] = {i, n, ok: false}; i.onload = () => { o.ok = true; o.fw = i.width / n; o.fh = i.height; }; i.src = 'assets/objetos/ataques/' + f + '.png?v=1'; });
function plzCeldas(){                                                             // posiciones del panal (de abajo arriba)
  const C = []; for(let r = 0; r < PLZ.filas; r++) for(let c = 0; c < PLZ.cols; c++){ if(c % 2 && r === PLZ.filas - 1) continue; C.push([c - (PLZ.cols - 1) / 2, r, c % 2 ? .5 : 0]); }
  return C.sort((a, b) => b[1] - a[1] || Math.abs(a[0]) - Math.abs(b[0]));
}
const PLZ_CELDAS = plzCeldas();
function agLuzDraw(){
  const H = PLZ.img.hex, F = PLZ.img.fin; if(!AG.on || !H.ok) return;
  [...g.p, ...g.e].forEach(f => {
    const on = f && !f.dead && f.buff > 0 && f.qfx === (typeof Q_FX !== 'undefined' && Q_FX['Pantalla de Luz']);
    if(!on){ if(f && f.agLuz && !f.agLuz.end) f.agLuz.end = g.t; if(f && f.agLuz && f.agLuz.end && g.t - f.agLuz.end > .6) f.agLuz = null; if(!(f && f.agLuz)) return; }
    else if(!f.agLuz || f.agLuz.end) f.agLuz = {t0: g.t};
    const L = f.agLuz, a = g.t - L.t0, end = L.end ? g.t - L.end : -1;
    const b = typeof bodyOf === 'function' ? bodyOf(f) : {top: f.y - 50, foot: f.y + 20}, bh = b.foot - b.top;
    const hh = Math.max(PLZ.min, Math.min(PLZ.max, bh * PLZ.tam)), hw = hh * H.fw / H.fh, dx = hw * PLZ.junto * 1.05, dy = hh * PLZ.junto;
    let ux, uy; const E = typeof foe === 'function' ? foe(g.p.includes(f)) : null;                    // hacia el rival (si no, hacia donde mira)
    if(E && !E.dead){ const vx = E.x - f.x, vy = E.y - f.y, d = Math.hypot(vx, vy) || 1; ux = vx / d; uy = vy / d; } else { const D = typeof DIRV !== 'undefined' ? DIRV[f.dir || 0] : [1, 0]; ux = D[0]; uy = D[1]; }
    const ancho = dx * PLZ.cols, alto = dy * (PLZ.filas - 1) + hh, R = Math.max(bh * .45, ancho * PLZ.lejos);
    const cx = f.x + ux * R, base = b.foot + uy * R * .5;                           // la pared se apoya en el suelo, delante del Pokémon
    const op = a < PLZ.fuerte ? 1 : Math.max(PLZ.luego, 1 - (a - PLZ.fuerte) / .3 * (1 - PLZ.luego));
    ctx.save(); ctx.imageSmoothingEnabled = false;
    PLZ_CELDAS.forEach(([c, r, o], i) => {
      const x = cx + c * dx, y = base - hh / 2 - (r + o) * dy - 4;
      if(end >= 0){                                                                // se rompe: cada hexágono, un poco después del anterior
        const u = end - i * .02; if(u < 0){ ctx.globalAlpha = op; ctx.drawImage(H.i, 3 * H.fw, 0, H.fw, H.fh, x - hw / 2, y - hh / 2, hw, hh); return; }
        if(!F.ok) return; const fr = Math.floor(u / .06); if(fr > 5) return; const fw = hh * F.fw / F.fh * 1.05;
        ctx.globalAlpha = 1; ctx.drawImage(F.i, fr * F.fw, 0, F.fw, F.fh, x - fw / 2, y - hh * 1.05 / 2, fw, hh * 1.05); return; }
      const u = a - i * PLZ.sale; if(u < 0) return;
      const fr = u < .15 ? Math.floor(u / .05) : 3 + Math.floor((g.t * 6 + i * .7)) % 3;
      ctx.globalAlpha = u < .15 ? 1 : op; ctx.drawImage(H.i, fr * H.fw, 0, H.fw, H.fh, x - hw / 2, y - hh / 2, hw, hh);
    });
    ctx.restore();
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

/* =====================================================================
   PULSO UMBRÍO COMO EN EL VÍDEO (piezas de Gemini en assets/objetos/ataques/pu_*.png):
   1) en la boca nace un ORBE con espiral rosa (pu_orbe, 8 figuras: 4 crece, 4 gira) y se queda ahí mientras dura;
   2) sale disparado el RAYO: el cuerpo es una textura que se repite sin cortes (pu_cuerpo) y la energía corre hacia delante;
      el rayo se ENSANCHA a lo lejos (estrecho en la boca, gordo al final), como en el vídeo;
   3) COLLARES DE PINCHOS (pu_collar, 4 figuras) que avanzan por el rayo;
   4) donde golpea, una EXPLOSIÓN (pu_impacto, 6 figuras) que se repite mientras le da;
   5) debajo, la SOMBRA del rayo en el suelo; al acabar, el rayo se RECOGE hacia la boca, la sombra se desvanece
      y queda una QUEMADURA en el suelo (pu_marca) unos segundos. El campo se oscurece mientras dura.
   ===================================================================== */
const PU = {
  boca: .38, fin: 1.3,                // [AJUSTE] grosor del rayo en la boca y al final (× el grosor base)
  base: 72,                            // [AJUSTE] grosor base (px)
  sale: .14, recoge: .16,              // [AJUSTE] lo que tarda en salir y en recogerse (s)
  corre: 520,                          // [AJUSTE] velocidad a la que corre la energía por el rayo (px/s)
  collar: {cada: 90, vel: 380, fps: 10, tam: 1.55},      // [AJUSTE] collares: cada cuántos px, velocidad y tamaño
  aura: .2, late: .07, motas: 1,      // [AJUSTE] brillo de alrededor · cuánto late el grosor · cantidad de humo negro que suelta (0 = nada)
  orbe: 1.4,                          // [AJUSTE] tamaño del orbe (× grosor en la boca... sobre el grosor base)
  sombra: {drop: 52, a: .42, ancho: .55},     // [AJUSTE] sombra en el suelo: px por debajo, opacidad y ancho (× el del rayo)
  marca: {dura: 3, alto: 115, entra: .25},   // [AJUSTE] lo que dura la quemadura (s), su alto (px, sin aplastar) y lo que tarda en aparecer
  img: {}
};
function rgCarga(P, pre, v){ [['cuerpo', pre + '_cuerpo', 1], ['collar', pre + '_collar', 4], ['orbe', pre + '_orbe', 8], ['imp', pre + '_impacto', 6], ['marca', pre + '_marca', 1]].forEach(([k, f, n]) => {
  if(k === 'orbe' && P.sinOrbe){ P.img.orbe = {ok: false}; return; }               // sin bola propia: en la boca va la de la carga de la E (js/cargas.js)
  const i = new Image(), o = P.img[k] = {i, n, ok: false}; i.onload = () => { o.ok = true; o.fw = i.width / n; o.fh = i.height; }; i.src = 'assets/objetos/ataques/' + f + '.png?v=' + v;
}); }
PU.col = {sombra: '14,0,26', motas: ['#12041e', '#b05cff'], ondas: ['#c27bff', '#2a0a40'], brillo: 'rgba(230,140,255,.85)'};
rgCarga(PU, 'pu', 1);
// ---- Psicorrayo: el mismo montaje con sus piezas rosas (pr_*.png) ----
const RG_PSI = Object.assign({}, PU, {
  boca: .45, fin: 1.15, base: 62, corre: 640,
  collar: {cada: 85, vel: 460, fps: 10, tam: 1.5},
  aura: .25, late: .06, motas: 1, orbe: 1.3,
  sombra: {drop: 52, a: .3, ancho: .5},
  marca: {dura: 2.5, alto: 95, entra: .2},
  col: {sombra: '60,0,50', motas: ['#ffffff', '#ff6fd0'], ondas: ['#ff8fe0', '#7de3ff'], brillo: 'rgba(255,190,240,.9)'},
  img: {}
});
rgCarga(RG_PSI, 'pr', 1);
// ---- Los demás rayos de clic (cada uno con sus 5 piezas de una hoja de Gemini) ----
const rgNuevo = (pre, o) => { const P = Object.assign({}, PU, {collar: {cada: 85, vel: 440, fps: 10, tam: 1.45}, aura: .22, late: .06, motas: 1, orbe: 1.3,
  sombra: {drop: 52, a: .3, ancho: .5}, marca: {dura: 2.5, alto: 95, entra: .2}}, o, {img: {}}); rgCarga(P, pre, o.v || 1); return P; };
const RG_HIELO = rgNuevo('rh', {boca: .5, fin: 1.1, base: 56, corre: 600, col: {sombra: '0,40,70', motas: ['#ffffff', '#9ee8ff'], ondas: ['#c8f4ff', '#5fc8f0'], brillo: 'rgba(210,245,255,.9)'}});
const RG_DRAGON = rgNuevo('pdr', {boca: .45, fin: 1.15, base: 64, corre: 620, col: {sombra: '30,0,60', motas: ['#ffffff', '#9a7cff'], ondas: ['#b48cff', '#4c6cff'], brillo: 'rgba(200,170,255,.9)'}});
const RG_TINIEB = rgNuevo('ti', {boca: .45, fin: 1.2, base: 60, corre: 520, col: {sombra: '20,0,30', motas: ['#14051f', '#c27bff'], ondas: ['#d07bff', '#2a0a40'], brillo: 'rgba(220,150,255,.85)'}});
const RG_DRAGOA = rgNuevo('da', {boca: .45, fin: 1.2, base: 62, corre: 580, col: {sombra: '0,40,35', motas: ['#e8fff8', '#3fe0c8'], ondas: ['#7fffe0', '#1a9a8a'], brillo: 'rgba(180,255,240,.9)'}});
const RG_RAYO = rgNuevo('ry', {boca: .5, fin: 1.1, base: 54, corre: 760, late: .1, v: 2, marca: {dura: 2.5, alto: 80, entra: .2},      // marca propia: suelo quemado con grietas amarillas (ry_marca)
  col: {sombra: '40,30,0', motas: ['#ffffff', '#ffe14a'], ondas: ['#fff6a0', '#ffb020'], brillo: 'rgba(255,250,200,.95)'}});
// ---- Rayos grandes de la E (hoja de Gemini de 4 filas: cuerpo, anillos, impacto, marca; la bola de la boca es la de la carga) ----
const RG_HIPER = rgNuevo('hr', {sinOrbe: 1, boca: .5, fin: 1.25, base: 92, corre: 700, orbe: .95, collar: {cada: 110, vel: 520, fps: 10, tam: 1.4}, marca: {dura: 3, alto: 110, entra: .25}, col: {sombra: '60,20,0', motas: ['#fff3c0', '#ff7a14'], ondas: ['#ffd24a', '#ff5a10'], brillo: 'rgba(255,220,150,.95)'}});
const RG_HIDRO = rgNuevo('hb', {sinOrbe: 1, boca: .5, fin: 1.25, base: 86, corre: 640, orbe: .95, collar: {cada: 110, vel: 480, fps: 10, tam: 1.4}, marca: {dura: 3, alto: 110, entra: .25}, col: {sombra: '0,30,70', motas: ['#ffffff', '#7cc8ff'], ondas: ['#eaf8ff', '#2f7fe0'], brillo: 'rgba(200,235,255,.9)'}});
const RG_SOLAR = rgNuevo('rs', {sinOrbe: 1, boca: .5, fin: 1.25, base: 90, corre: 700, orbe: .95, collar: {cada: 110, vel: 520, fps: 10, tam: 1.4}, marca: {dura: 3, alto: 110, entra: .25}, col: {sombra: '40,40,0', motas: ['#ffffff', '#c8ff5a'], ondas: ['#fff6a0', '#7fd63a'], brillo: 'rgba(255,255,200,.95)'}});
const RG_FOCO = rgNuevo('fr', {sinOrbe: 1, boca: .5, fin: 1.2, base: 84, corre: 680, orbe: .95, collar: {cada: 110, vel: 500, fps: 10, tam: 1.4}, marca: {dura: 3, alto: 110, entra: .25}, col: {sombra: '20,30,50', motas: ['#ffffff', '#c8d4f0'], ondas: ['#ffffff', '#9aa8c8'], brillo: 'rgba(235,242,255,.95)'}});
const RAYOS_G = {'Hiperrayo': RG_HIPER, 'Hidrobomba': RG_HIDRO, 'Rayo Solar': RG_SOLAR, 'Foco Resplandor': RG_FOCO, 'Pulso Umbrío': PU, 'Psicorrayo': RG_PSI, 'Rayo Hielo': RG_HIELO, 'Pulso Dragón': RG_DRAGON, 'Tinieblas': RG_TINIEB, 'Dragoaliento': RG_DRAGOA, 'Rayo': RG_RAYO};   // [AJUSTE] rayos montados con piezas de Gemini: nombre → su configuración
if(typeof v8PulsoDraw === 'function'){ const o = v8PulsoDraw; v8PulsoDraw = function(){ if(puOk(RG_DRAGON)) return; return o.apply(this, arguments); }; }      // los anillos viejos del Pulso Dragón, fuera (ya van en las piezas nuevas)
const puOk = P => AG.on && P && ['cuerpo', 'collar', 'imp'].every(k => P.img[k].ok) && (P.sinOrbe || P.img.orbe.ok);
const PU_RESTOS = [];                  // sombras que se desvanecen y quemaduras: {x0, y0, a, L, t0, tipo}
const puW = (P, x, L) => P.base * (P.boca + (P.fin - P.boca) * Math.min(1, x / Math.max(1, L)));
function puCuerpo(P, L, Lmax, t){         // en el sistema del rayo (x a lo largo); el ancho crece con la distancia
  const S = P.img.cuerpo, seg = 6, off = (t * P.corre) % 1e6;
  for(let x = 0; x < L; x += seg){
    const w = Math.min(seg, L - x), h = puW(P, x + w / 2, Lmax), k = h / S.fh;      // escala de la textura en este trozo
    let sx = ((x - off) / k) % S.fw; if(sx < 0) sx += S.fw; let sw = w / k, dx = x;
    while(sw > 0.01){ const take = Math.min(sw, S.fw - sx); ctx.drawImage(S.i, sx, 0, take, S.fh, dx, -h / 2, take * k + .6, h); dx += take * k; sw -= take; sx = 0; }
  }
}
function puPoly(P, b, L, Lmax, drop){     // contorno del rayo en el mundo (para la sombra)
  const c = Math.cos(b.cur), s = Math.sin(b.cur), A = [], Q = [];
  for(let x = 0; x <= L; x += Math.max(8, L / 20)){ const h = puW(P, x, Lmax) / 2 * P.sombra.ancho, cx = b.x0 + c * x, cy = b.y0 + s * x + drop; A.push([cx - s * h, cy + c * h * .5]); Q.push([cx + s * h, cy - c * h * .5]); }
  return A.concat(Q.reverse());
}
function puShadow(poly, a, col){ if(poly.length < 3) return; ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(${col || '14,0,26'},${a.toFixed(3)})`; ctx.beginPath(); poly.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); ctx.restore(); }
function puFrame(P, k, fr, cx, cy, w, h, rot){ const S = P.img[k]; ctx.save(); ctx.translate(cx, cy); if(rot) ctx.rotate(rot); ctx.drawImage(S.i, fr * S.fw, 0, S.fw, S.fh, -w / 2, -h / 2, w, h); ctx.restore(); }
function puDraw(f, P){
  const b = f.burst, K = b.K, t = b.t, T = K.T; let Lmax = Math.max(60, b.len), toca = false;
  { const E = foe(b.mine); if(E && !E.dead && !E.ghost){                         // el rayo se para en el cuerpo del rival (como en el vídeo), aunque sea grande
      const bo = typeof bodyOf === 'function' ? bodyOf(E) : {top: E.y - 50, foot: E.y + 20}, cy = (bo.top + bo.foot) / 2, ux = Math.cos(b.cur), uy = Math.sin(b.cur);
      const px = E.x - b.x0, py = cy - b.y0, u = px * ux + py * uy, v = Math.abs(-px * uy + py * ux), rad = Math.max(26, (bo.foot - bo.top) * .45);
      if(u > 0 && u < 900 && v < rad + P.base * P.fin * .4){ Lmax = Math.max(40, u - rad * .3); toca = true; } } }
  const salir = Math.min(1, t / P.sale), rec = t > T - P.recoge ? Math.max(0, (T - t) / P.recoge) : 1;
  const L = Lmax * (1 - Math.pow(1 - salir, 3)) * rec;                         // sale disparado y al final se recoge hacia la boca
  b.puPoly = puPoly(P, b, L, Lmax, P.sombra.drop); b.puL = L;
  puShadow(b.puPoly, P.sombra.a, P.col.sombra);                                              // la sombra en el suelo
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalCompositeOperation = 'source-over';
  ctx.translate(b.x0, b.y0); ctx.rotate(b.cur); if(Math.cos(b.cur) < 0) ctx.scale(1, -1);
  if(L > 4){
    const lat = 1 + P.late * Math.sin(g.t * 38);                               // el rayo late
    if(P.aura){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = P.aura; ctx.scale(1, 1.75 * lat); puCuerpo(P, L, Lmax, g.t * .7); ctx.restore(); }      // el brillo morado de alrededor
    ctx.save(); ctx.scale(1, lat); puCuerpo(P, L, Lmax, g.t); ctx.restore();       // el cuerpo
    const N = Math.floor(L / 12 * P.motas);                                    // humo negro y chispas moradas que se escapan del rayo (en píxeles, como el resto)
    for(let i = 0; i < N; i++){
      const p = (g.t * 2.4 + bnH(i, 7)) % 1, x = (bnH(i, 3) * L + g.t * P.corre * .5) % L, w = puW(P, x, Lmax), sd = bnH(i, 5) < .5 ? -1 : 1;
      const y = sd * (w * .32 + p * w * .55), z = Math.round(4 + bnH(i, 9) * 6) * (1 - p * .5);
      ctx.globalAlpha = (1 - p) * .9; ctx.fillStyle = P.col.motas[i % 2]; ctx.fillRect(Math.round(x - p * 30), Math.round(y - z / 2), z, z);
    }
    ctx.globalAlpha = 1;
    const C = P.img.collar, fr = Math.floor(g.t * P.collar.fps) % C.n, off = (g.t * P.collar.vel) % P.collar.cada;
    for(let x = 40 + off; x < L - 20; x += P.collar.cada){ const h = puW(P, x, Lmax) * P.collar.tam; puFrame(P, 'collar', fr, x, 0, h * C.fw / C.fh * .62, h); }      // collares que avanzan
    ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createRadialGradient(L, 0, 0, L, 0, puW(P, L, Lmax));                 // la punta brilla
    gr.addColorStop(0, P.col.brillo); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.fillRect(L - 80, -80, 160, 160); ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  ctx.save(); ctx.imageSmoothingEnabled = false;                                // el orbe en la boca
  const O = P.img.orbe, ofr = t < .16 ? Math.min(3, Math.floor(t / .04)) : 4 + Math.floor(g.t * 14) % 4, od = P.base * P.orbe * (t < .16 ? .5 + t / .32 : 1) * (.6 + .4 * rec);
  ctx.globalAlpha = Math.min(1, rec * 1.5);
  if(O.ok) puFrame(P, 'orbe', ofr, b.x0, b.y0, od, od, 0);
  else { const C = typeof CARGA !== 'undefined' && CARGA.img[b.type]; if(C && C.ok){ const d = (CARGA.boca.px || od) * (.6 + .4 * rec) * (1 + .05 * Math.sin(g.t * 22)); ctx.drawImage(C.i, 2 * C.fw, 0, C.fw, C.fh, b.x0 - d / 2, b.y0 - d / 2, d, d); } }      // la bola de la carga de la E
  ctx.restore();
  if(toca && L > Lmax * .9){                                                // explosión donde golpea
    const I = P.img.imp, ifr = Math.floor(g.t * 16) % 3 + (Math.floor(g.t * 3) % 2), d = puW(P, Lmax, Lmax) * 1.45;
    ctx.save(); ctx.imageSmoothingEnabled = false; puFrame(P, 'imp', ifr, b.x0 + Math.cos(b.cur) * Lmax, b.y0 + Math.sin(b.cur) * Lmax, d, d, 0); ctx.restore();
    b.puHit = {x: b.x0 + Math.cos(b.cur) * Lmax, y: b.y0 + Math.sin(b.cur) * Lmax, d};
    ctx.save(); ctx.lineWidth = 4; for(let k = 0; k < 2; k++){ const u = (g.t * 4 + k * .5) % 1;          // ondas de choque oscuras que salen del golpe
      ctx.globalAlpha = (1 - u) * .8; ctx.strokeStyle = P.col.ondas[k]; ctx.beginPath(); ctx.ellipse(b.puHit.x, b.puHit.y, d * (.3 + u * .7), d * (.3 + u * .7) * .8, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
    if(!g.pvp && typeof fx !== 'undefined') fx.shake = Math.max(fx.shake || 0, 2.5);
  }
  if(t > T - .06 && !b.puEnd){ b.puEnd = 1;                                     // al acabar: la sombra se desvanece, queda la quemadura y el humo del golpe
    PU_RESTOS.push({P, tipo: 'sombra', poly: puPoly(P, b, Lmax, Lmax, P.sombra.drop), t0: g.t});
    if(P.marca.dura > 0) PU_RESTOS.push({P, tipo: 'marca', x0: b.x0, y0: b.y0 + P.sombra.drop, a: b.cur, L: Lmax, t0: g.t});
    if(b.puHit) PU_RESTOS.push({P, tipo: 'humo', ...b.puHit, t0: g.t});
  }
}
if(AG.on && typeof hb6Draw === 'function'){ const o = hb6Draw; hb6Draw = function(){
  if(!g) return o.apply(this, arguments);
  const L = [...g.p, ...g.e].filter(f => f && f.burst && f.burst.hb && puOk(RAYOS_G[f.burst.nm]) && f.burst.x0 != null), B = L.map(f => f.burst);
  L.forEach(f => { f.burst = null; }); try{ o.apply(this, arguments); } finally { L.forEach((f, i) => { f.burst = B[i]; }); }
  L.forEach(f => { try{ puDraw(f, RAYOS_G[f.burst.nm]); }catch(e){} });
  for(let i = PU_RESTOS.length - 1; i >= 0; i--){ const R = PU_RESTOS[i], u = g.t - R.t0, P = R.P;   // sombras y humo que se van
    if(R.tipo === 'sombra'){ if(u > .6){ PU_RESTOS.splice(i, 1); continue; } puShadow(R.poly, P.sombra.a * (1 - u / .6), P.col.sombra); }
    else if(R.tipo === 'humo'){ if(u > .3){ PU_RESTOS.splice(i, 1); continue; } ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = 1 - u / .3; puFrame(P, 'imp', 3 + Math.min(2, Math.floor(u / .1)), R.x, R.y, R.d * 1.1, R.d * 1.1, 0); ctx.restore(); }
  }
}; }
// la quemadura va en el suelo (debajo de los Pokémon)
if(AG.on && typeof fxhdGround === 'function'){ const o = fxhdGround; fxhdGround = function(){ const r = o.apply(this, arguments);
  try{ if(g) for(let i = PU_RESTOS.length - 1; i >= 0; i--){ const R = PU_RESTOS[i], P = R.P; if(R.tipo !== 'marca' || !P.img.marca.ok) continue; const u = (g.t - R.t0) / P.marca.dura;
    if(u >= 1){ PU_RESTOS.splice(i, 1); continue; }
    // la quemadura con su forma de verdad (sin estirarla): copias seguidas a lo largo del rayo, una sí una no dada la vuelta, que aparecen desde la boca hacia el golpe
    const S = P.img.marca, h = P.marca.alto, w = h * S.fw / S.fh, paso = w * .7, ve = Math.min(1, (g.t - R.t0) / P.marca.entra);
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = .9 * Math.min(1, (1 - u) * 3);
    ctx.translate(R.x0, R.y0); ctx.scale(1, .55); ctx.rotate(R.a); ctx.beginPath(); ctx.rect(0, -h, R.L * ve + w * .15, h * 2); ctx.clip();
    for(let x = -w * .15, i = 0; x < R.L * ve; x += paso, i++){ ctx.save(); ctx.translate(x + w / 2, 0); if(i % 2) ctx.scale(-1, 1); const k = i % 3 === 1 ? .82 : 1; ctx.drawImage(S.i, 0, 0, S.fw, S.fh, -w / 2, -h * k / 2, w, h * k); ctx.restore(); }
    ctx.restore(); } }catch(e){}
  return r; }; }
