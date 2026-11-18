"use strict";
/* =====================================================================
   COSAS DEL VÍDEO «LANCE vs IRIS»:
   1) PULSO DRAGÓN: en vez de la bola, un rayo corto morado/rosa que sale de la boca, con anillos de energía que salen de ella y corren por el rayo.
   2) VENTISCA: un cono enorme de viento helado que sale de la boca y se abre hacia el rival: azul claro, con rayas blancas de viento,
      copos de nieve y trocitos de hielo; al acabar quedan motas de escarcha flotando. (El daño sigue siendo el de siempre: la ráfaga en abanico.)
   3) HUMO DE LA BOCA: después de Llamarada y de Hiperrayo sale humo gris de la boca un momento.
      (Lanzallamas no se toca.)
   4) POLVO AL FRENAR: al acabar la carrera derrapa y levanta una nube de polvo hacia delante; al aterrizar de un salto, polvo hacia los lados.
      Si existe assets/fx/polvo_freno.png (tira de 6 cuadros de Gemini), se usa ese dibujo.
   5) SALIDA DE LA POKÉ BALL: el Pokémon sale como silueta blanca brillante (con contorno de luz y destellos) y luego recupera el color.
   V8.<parte> = false apaga cada cosa.
   ===================================================================== */
const V8 = {pulso: true, ventisca: true, humo: true, polvo: true, salida: true};
const V8HUMO = /^(Llamarada|Hiperrayo|Sofoco|Onda [IÍ]gnea|Pirotecnia)$/;   // [AJUSTE] ataques que dejan humo en la boca (Lanzallamas NO)

// ---------------- 1) PULSO DRAGÓN ----------------
const V8IMG = {}; function v8Img(k, n){ const im = new Image(); im.onload = () => { im.n = n; im.fw = im.width / n; im.ok = true; }; im.src = 'assets/fx/' + k + '.png?v=1'; V8IMG[k] = im; }
v8Img('pd_anillo', 4); v8Img('ve_cono', 7); v8Img('hu_humo', 6);
const v8Ok = k => V8IMG[k] && V8IMG[k].ok;
if(typeof GM !== 'undefined'){ GM.meta.pd_rayo = {fw: 242, fh: 80, n: 4, b0: 14, b1: 66}; const im = new Image(); im.onload = () => { GM.meta.pd_rayo.ok = true; }; im.src = 'assets/fx/pd_rayo.png?v=1'; GM.img.pd_rayo = im; }   // cuerpo del rayo (Gemini)
if(typeof BEAMX !== 'undefined' && V8.pulso) BEAMX['Pulso Dragón'] = {T: .7, ancho: 15, dmg: 1, rec: 0, lento: .5, c: ['200,100,255', '#9a4cff', '#f2a8ff', '#ffffff'], onda: 'rgba(255,215,255,0)', corto: 1, drag: 1, sp: 'pd_rayo'};
function v8PulsoDraw(){                                                                                   // anillos de Gemini: uno en la boca y otros que corren por el rayo
  if(!v8Ok('pd_anillo')) return; const im = V8IMG.pd_anillo;
  [...g.p, ...g.e].forEach(f => { const b = f && f.burst; if(!b || !b.hb || !b.K.drag || b.x0 == null) return;
    const K = b.K, A = Math.min(1, b.t / .08, (K.T - b.t) / .15), W = K.ancho, L = Math.max(60, b.len), t = g.t;
    ctx.save(); ctx.translate(b.x0, b.y0); ctx.rotate(b.cur); ctx.imageSmoothingEnabled = false;
    const ring = (x, fr, h, a) => { const s = h / im.height; ctx.globalAlpha = A * a; ctx.drawImage(im, fr * im.fw, 0, im.fw, im.height, x - im.fw * s / 2, -h / 2, im.fw * s, h); };
    ring(6, Math.floor(t * 14) % 4, W * 5, 1);                                                             // en la boca, latiendo
    for(let i = 0; i < 3; i++){ const k = ((t * 1.6 + i / 3) % 1); ring(k * L, Math.min(3, Math.floor(k * 4)), W * (4.5 - 2 * k), 1 - k * .7); }   // salen y se agrandan
    ctx.restore(); });
}

// ---------------- 2) VENTISCA ----------------
let V8vent = [], V8OC = null;
if(typeof gustStart === 'function'){ const o = gustStart; gustStart = function(f, w){
  const r = o.apply(this, arguments);
  try{ if(V8.ventisca) V8vent.push({f, ang: w.ang, t0: g.t, dur: .95}); }catch(e){}
  return r; }; }
if(typeof FXR !== 'undefined' && FXR.flight){ const of = FXR.flight._ventisca; FXR.flight._ventisca = function(){ if(!V8.ventisca && of) return of.apply(this, arguments); }; }   // el copo de antes ya no se ve (lo tapa el cono)
if(typeof FXR !== 'undefined' && FXR.trail && FXR.trail._ventisca){ const T0 = FXR.trail._ventisca; FXR.trail._ventisca = Object.assign({}, T0, {rate: 6}); }
function v8Flake(x, y, r, rot){ ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
  for(let k = 0; k < 6; k++){ const a = k * Math.PI / 3; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.moveTo(Math.cos(a) * r * .55, Math.sin(a) * r * .55); ctx.lineTo(Math.cos(a + .5) * r * .8, Math.sin(a + .5) * r * .8); } ctx.stroke(); ctx.restore(); }
function v8VentDraw(){
  if(!v8Ok('ve_cono')) return; const im = V8IMG.ve_cono;
  for(let i = V8vent.length - 1; i >= 0; i--){ const V = V8vent[i], f = V.f, u = (g.t - V.t0) / V.dur;
    if(u >= 1 || u < 0 || !f || f.dead){ if(u >= 1 && f){ v8Escarcha(V); } V8vent.splice(i, 1); continue; }
    const [mx, my] = mouthOf(f), R = typeof GUST !== 'undefined' ? GUST.range : 430, s = R / im.fw, fr = Math.min(im.n - 1, Math.floor(u * im.n));   // el cono de Gemini, del tamaño del alcance
    ctx.save(); ctx.translate(mx, my); ctx.rotate(V.ang); if(Math.cos(V.ang) < 0) ctx.scale(1, -1); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = .92;
    ctx.drawImage(im, fr * im.fw, 0, im.fw, im.height, 0, -im.height * s / 2, im.fw * s, im.height * s); ctx.restore(); }
}
function v8Escarcha(V){                                                                                  // motas de escarcha que se quedan flotando
  try{ const [mx, my] = mouthOf(V.f), R = typeof GUST !== 'undefined' ? GUST.range : 430;
    for(let k = 1; k <= 5; k++){ const d = R * k / 5.5; fxBurst(mx + Math.cos(V.ang) * d, my + Math.sin(V.ang) * d, ['#ffffff', '#d9f4ff', '#a8dcff'], 5, 40, 0, 6.3, {life: .9, s: 2, rise: .15, drag: .9}); } }catch(e){}
}

// ---------------- 3) HUMO DE LA BOCA ----------------
let V8smk = [], V8puf = [];
function v8Humo(f, nm, delay){ if(!V8.humo || !f || !V8HUMO.test(nm || '')) return; if(V8smk.some(S => S.f === f && g.t - S.t0 < .6)) return; V8smk.push({f, t0: g.t + (delay || 0), dur: 1.5, acc: 0}); }
if(typeof fxShotStart === 'function'){ const o = fxShotStart; fxShotStart = function(f, s, name){ try{ if(g) v8Humo(f, name, .35); }catch(e){} return o.apply(this, arguments); }; }
if(typeof windFire === 'function'){ const o = windFire; windFire = function(f){ const nm = f && f.wind && f.wind.nm, r = o.apply(this, arguments); try{ if(g) v8Humo(f, nm, nm === 'Hiperrayo' && typeof BEAMX !== 'undefined' ? BEAMX.Hiperrayo.T : .45); }catch(e){} return r; }; }
function v8HumoTick(dt){
  for(let i = V8smk.length - 1; i >= 0; i--){ const S = V8smk[i], f = S.f, u = g.t - S.t0; if(u < 0) continue;
    if(u > S.dur || !f || f.dead || f.ghost){ V8smk.splice(i, 1); continue; }
    S.acc += dt * 7 * (1 - u / S.dur * .6);
    while(S.acc >= 1){ S.acc--; const [mx, my] = mouthOf(f), dv = typeof DIRV !== 'undefined' ? DIRV[f.dir || 0] : [1, 0];
      V8puf.push({x: mx + dv[0] * 6, y: my + dv[1] * 4, vx: dv[0] * 45 + (Math.random() - .5) * 50, vy: -60 - Math.random() * 50, r0: 7 + Math.random() * 4, r1: 24 + Math.random() * 16, t: 0, L: 1 + Math.random() * .6, c: Math.random() < .3 ? 95 : 62}); } }
  for(const p of V8puf){ p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .97; p.vy *= .985; }
  V8puf = V8puf.filter(p => p.t < p.L);
}
function v8HumoDraw(){
  if(!v8Ok('hu_humo')) return; const im = V8IMG.hu_humo; ctx.save(); ctx.imageSmoothingEnabled = false;
  for(const p of V8puf){ const k = p.t / p.L, fr = Math.min(im.n - 1, Math.floor(k * im.n)), h = p.r1 * 2 / im.height * im.height, s = p.r1 * 2.2 / im.height;
    ctx.globalAlpha = .9; ctx.drawImage(im, fr * im.fw, 0, im.fw, im.height, p.x - im.fw * s / 2, p.y - im.height * s / 2, im.fw * s, im.height * s); }
  ctx.restore();
}

// ---------------- 4) POLVO AL FRENAR / ATERRIZAR ----------------
let V8dust = [];
const V8DIMG = new Image(); let V8Dok = false; V8DIMG.onload = () => { V8Dok = V8DIMG.width > 0; }; V8DIMG.src = 'assets/fx/polvo_freno.png?v=1';
function v8Polvo(f, dir, big){
  const I = idleInfo(f.m.dex), fy = f.y + I.foot * ESCALA - 2, w = Math.max(40, I.fw * ESCALA * .5);
  if(V8Dok){ V8dust.push({img: 1, x: f.x + (dir == null ? 0 : Math.cos(dir) * 18), y: fy, t: 0, L: .5, sc: big ? 1.3 : 1, flip: dir != null && Math.cos(dir) < 0}); return; }
  const n = big ? 12 : 9;
  for(let k = 0; k < n; k++){ let vx, vy;
    if(dir == null){ const s = k % 2 ? 1 : -1; vx = s * (120 + Math.random() * 140); vy = -(Math.random() * 12); }      // aterrizar: hacia los dos lados
    else { const a = dir + (Math.random() - .5) * 1.1, sp = 160 + Math.random() * 160; vx = Math.cos(a) * sp; vy = Math.sin(a) * sp * .35 - Math.random() * 10; }   // frenar: hacia delante
    V8dust.push({x: f.x + (Math.random() - .5) * w * .6, y: fy - Math.random() * 4, vx, vy, r0: 4 + Math.random() * 4, r1: 18 + Math.random() * (big ? 18 : 12), t: 0, L: .55 + Math.random() * .35}); }
}
function v8PolvoTick(dt){
  if(V8.polvo) [...g.p, ...g.e].forEach(f => { if(!f || !f.m || f.ghost) return;
    const dashing = f.dash > 0, jumping = !!f.jump;
    if(f.v8dash && !dashing && !f.dead && !(g.t - (f.v8pt || -9) < .3)){ f.v8pt = g.t; v8Polvo(f, f.da, false); }
    if(f.v8jump && !jumping && !f.dead) v8Polvo(f, null, true);
    f.v8dash = dashing; f.v8jump = jumping; });
  for(const p of V8dust){ p.t += dt; if(!p.img){ p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .93; p.vy *= .93; } }
  V8dust = V8dust.filter(p => p.t < p.L);
}
function v8PolvoDraw(){
  for(const p of V8dust){ const k = p.t / p.L;
    if(p.img){ const n = 6, fw = V8DIMG.width / n, fh = V8DIMG.height, fr = Math.min(n - 1, Math.floor(k * n)), s = 64 * p.sc / fh * 1.6;
      ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(p.x, p.y); if(p.flip) ctx.scale(-1, 1); ctx.drawImage(V8DIMG, fr * fw, 0, fw, fh, -fw * s / 2, -fh * s * .8, fw * s, fh * s); ctx.restore(); continue; }
    const r = p.r0 + (p.r1 - p.r0) * Math.sqrt(k), a = (k < .12 ? k / .12 : 1 - (k - .12) / .88) * .75;
    ctx.globalAlpha = a; ctx.fillStyle = '#d9cbb0'; ctx.beginPath(); ctx.ellipse(p.x, p.y - r * .4, r, r * .7, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#efe6d4'; ctx.beginPath(); ctx.ellipse(p.x - r * .2, p.y - r * .6, r * .6, r * .45, 0, 0, 6.3); ctx.fill(); }
  ctx.globalAlpha = 1;
}

// ---------------- 5) SALIDA DE LA POKÉ BALL ----------------
let V8sw = null;
if(typeof SWAP !== 'undefined') SWAP.open = .9;
if(typeof swDrawOne === 'function'){ const o = swDrawOne; swDrawOne = function(s){ V8sw = s; try{ return o.apply(this, arguments); } finally { V8sw = null; } }; }
if(typeof swSprite === 'function'){ const o = swSprite; swSprite = function(f, x, y, sc, tint, amt, alpha){
  const s = V8sw; if(!V8.salida || !s || tint !== '#ffffff' || f !== s.to) return o.apply(this, arguments);
  const ou = (s.t - s.tR - s.tT) / s.tO, pu = Math.max(0, Math.min(1, (ou - .22) / .55)), wt = pu < .55 ? 1 : 1 - (pu - .55) / .45;   // blanco del todo hasta la mitad y luego recupera el color
  if(wt > .05){ for(const [dx, dy] of [[-3, 0], [3, 0], [0, -3], [0, 3]]) o.call(this, f, x + dx, y + dy, sc, '#bfe6ff', 1, alpha * .45 * wt); }   // contorno de luz
  o.call(this, f, x, y, sc, '#ffffff', wt, alpha);
  if(wt > .05){ const I = idleInfo(f.m.dex), h = (I.foot - I.top) * ESCALA * sc; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;   // destellos alrededor
    for(let k = 0; k < 5; k++){ const ph = (g.t * 3 + HH(k, 3)) % 1, r = 3 + 7 * Math.sin(ph * Math.PI), px = x + (HH(k, 7) - .5) * h * 1.1, py = y + (I.top + I.foot) / 2 * ESCALA * sc + (HH(k, 9) - .5) * h;
      ctx.globalAlpha = wt * Math.sin(ph * Math.PI); ctx.beginPath(); ctx.moveTo(px - r, py); ctx.lineTo(px + r, py); ctx.moveTo(px, py - r * 1.3); ctx.lineTo(px, py + r * 1.3); ctx.stroke(); }
    ctx.restore(); }
}; }

// ---------------- enganches ----------------
let V8last = 0;
function v8Tick(){ if(!g) return; const dt = Math.min(.05, Math.max(0, g.t - V8last)); V8last = g.t; if(dt <= 0) return; v8HumoTick(dt); v8PolvoTick(dt); }
if(typeof windDraw === 'function'){ const o = windDraw; windDraw = function(){ const r = o.apply(this, arguments); try{ if(g) v8Tick(); }catch(e){} return r; }; }
if(typeof megaDraw === 'function'){ const o = megaDraw; megaDraw = function(){ const r = o.apply(this, arguments);                                                    // encima de los Pokémon
  try{ if(g){ if(V8.pulso) v8PulsoDraw(); v8PolvoDraw(); if(V8.ventisca) v8VentDraw(); v8HumoDraw(); } }catch(e){} return r; }; }
