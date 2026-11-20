"use strict";
/* =====================================================================
   ATAQUES DEL VÍDEO «ROJO vs AZUL» (sprites de Gemini en assets/fx/, el movimiento en código). Usa gmDraw/gmOk (js/fxgemini.js),
   brGlow/brRing/brEase (js/fxbrendan.js) y suAdd/suCanvas (js/fxsuelo.js).
   - TORNADO / VENDAVAL: un tornadito vuela hacia el rival; al dar, NUBE de tormenta encima, EMBUDO de viento que lo atrapa
     (lo levanta) y polvo abajo. «¡ATRAPADO!».
   - MEGACUERNO: ya no es un disparo. El Pokémon EMBISTE en línea recta envuelto en un aura verde con forma de punta de flecha,
     levantando polvo; al chocar, estrella de pinchos verdes.
   - TERREMOTO: se levanta un círculo de LOSAS de piedra que crece hacia fuera con la onda, con polvo; en el centro queda
     el suelo agrietado (se queda hasta el final del combate).
   - VELOCIDAD EXTREMA (NUEVO, Normal, golpe): cruza al rival TRES veces a toda velocidad en zigzag, dejando COPIAS suyas
     (su propio sprite), polvo y LÍNEAS QUEMADAS en el suelo que se quedan. Ataque Rápido también deja copias.
   - MORDISCOS: Mordisco y Triturar (NUEVO, Siniestro) → mandíbulas moradas; Colmillo Rayo / Hielo / Ígneo → amarillas, de hielo, de fuego.
   - HOJA AFILADA: un cono de hojas girando con hojitas sueltas; al dar, explosión de hojas.
   - PULSO UMBRÍO: anillos dentados que salen en fila; humo oscuro en la boca; estrella morada al dar.
   En el combate online, Megacuerno y Velocidad Extrema funcionan como antes (no desincronizar). G3.on = false apaga todo.
   ===================================================================== */
const G3 = {on: true};
{ const M = {to_nube: {fw: 249, fh: 126, n: 4}, to_embudo: {fw: 121, fh: 226, n: 8}, to_polvo: {fw: 200, fh: 102, n: 4}, mc_aura: {fw: 263, fh: 201, n: 4},
    mc_polvo: {fw: 124, fh: 106, n: 4}, mc_golpe: {fw: 250, fh: 240, n: 5}, tq_losa: {fw: 158, fh: 152, n: 6}, tq_fija: {fw: 203, fh: 204, n: 3},
    tq_polvo: {fw: 209, fh: 142, n: 4}, tq_grieta: {fw: 629, fh: 325, n: 1}, ve_salida: {fw: 237, fh: 203, n: 4}, ve_polvo: {fw: 243, fh: 90, n: 4},
    ve_golpe: {fw: 156, fh: 157, n: 5}, mo_osc: {fw: 178, fh: 172, n: 6}, mo_ray: {fw: 179, fh: 168, n: 5}, mo_hie: {fw: 178, fh: 170, n: 5},
    mo_fue: {fw: 184, fh: 168, n: 5}, ho_hoja: {fw: 73, fh: 89, n: 10}, ho_var: {fw: 67, fh: 83, n: 5}, ho_cono: {fw: 239, fh: 154, n: 4},
    ho_golpe: {fw: 193, fh: 190, n: 5}, pu_aro: {fw: 102, fh: 215, n: 4}, pu_humo: {fw: 141, fh: 132, n: 4}, pu_golpe: {fw: 141, fh: 140, n: 5}, mc_cuerno: {fw: 219, fh: 128, n: 4}, mc_cuerno2: {fw: 338, fh: 169, n: 3}, mc_brillo: {fw: 103, fh: 114, n: 5}};
  Object.assign(GM.meta, M);
  Object.keys(M).forEach(k => { const im = new Image(); im.onload = () => { GM.meta[k].ok = true; }; im.src = `assets/fx/${k}.png?v=2`; GM.img[k] = im; }); }
const g3 = (...k) => G3.on && gmOk(...k);
const g3F = (k, u) => Math.min(GM.meta[k].n - 1, Math.floor(brClamp(u) * GM.meta[k].n));
function g3Move(name, keysF, fl, keysI, im){                                  // como gmMove (js/fxgemini2.js): solo si las imágenes han cargado
  const oF = FXR.flight[name], oI = FXR.impact[name];
  const wF = function(s, a, an){ if(fl && g3(...keysF)) return fl(s, a, an); const b = oF && (oF.draw || oF); if(b) return b.apply(this, arguments); };
  const wI = function(e, a){ if(im && g3(...keysI)) return im(e, a); const b = oI && (oI.draw || oI); if(b) return b.apply(this, arguments); };
  if(oF) Object.assign(wF, oF); if(oI) Object.assign(wI, oI); delete wF.draw; delete wI.draw; FXR.flight[name] = wF; FXR.impact[name] = wI;
}
const g3Learn = (N, type, extra) => { if(typeof LEARN === 'undefined' || typeof DEX === 'undefined') return;
  const ids = new Set(type ? DEX.filter(m => m.types.includes(type)).map(m => m.dex) : []); extra.forEach(d => ids.add(d)); LEARN[N] = [...ids].sort((p, q) => p - q).join(','); };

// =====================================================================  TORNADO / VENDAVAL
const TO = {dur: 1.3, lift: 1.45, rise: .62, H: 170, throwX: 120};    // [AJUSTE] segundos del tornado · del vuelo del rival · parte en la que sube · altura (px) · lo lejos que sale despedido
// El rival sube dando vueltas por el embudo hasta arriba y sale despedido hacia un lado, cayendo cerca del pie del tornado
function toLiftH(L, u){ if(u < TO.rise){ const v = u / TO.rise, e = v * v * (3 - 2 * v); return L.H * e + Math.sin(g.t * 9) * 3 * e; }
  const v = (u - TO.rise) / (1 - TO.rise); return L.H * (1 - v * v) + 40 * Math.sin(v * Math.PI); }
function toLiftX(L, u){ if(u < TO.rise){ const v = u / TO.rise; return Math.sin(g.t * 13) * (8 + 16 * v); } return L.side * TO.throwX * ((u - TO.rise) / (1 - TO.rise)); }
if(typeof fxLift === 'function'){ const o = fxLift; fxLift = function(f){
    const L = f && f.lift; if(!L || !L.tor) return o.apply(this, arguments);
    const a = g.t - L.t0, u = a / L.dur;
    if(u >= 1){ if(!L.done){ L.done = 1; f.x = clamp(f.x + L.side * TO.throwX, bx0(), bx1()); if(L.dir0 != null) f.dir = L.dir0;           // aterriza donde ha caído
        try{ fxBurst(f.x, brFoot(f), ['#b9ab8c', '#e6dcc4', '#8a7a62'], 12, 140, -Math.PI / 2, 3, {life: .5, s: 2}); fx.shake = Math.max(fx.shake, 5); if(typeof snPlay === 'function') snPlay('I_tierra', .8); }catch(e){} }
      f.lift = null; return 0; }
    if(u < TO.rise) f.dir = Math.floor(g.t * 16) % 8;                                                                         // da vueltas mientras sube
    else if(L.dir0 != null) f.dir = L.dir0;
    return Math.max(0, toLiftH(L, u)); }; }
if(typeof fxLunge === 'function'){ const o = fxLunge; fxLunge = function(f){
    const r = o.apply(this, arguments), L = f && f.lift; if(!L || !L.tor) return r;
    const u = (g.t - L.t0) / L.dur; if(u >= 0 && u < 1) r.x += toLiftX(L, u); return r; }; }
function toStorm(x, gy, a, k, A){                                             // nube + embudo + polvo, con los pies del embudo en (x, gy)
  const fr = Math.floor(g.t * 14), sc = 1 * k, H = 235 * k;
  gmDraw('to_polvo', Math.floor(g.t * 8), x, gy + 8, .9 * k, 0, A * .95, .5, .8);
  ctx.save(); ctx.globalAlpha = A; ctx.imageSmoothingEnabled = false; const M = GM.meta.to_embudo;              // embudo estirado entre la nube y el suelo
  ctx.drawImage(GM.img.to_embudo, (fr % M.n) * M.fw, 0, M.fw, M.fh, x - M.fw * sc / 2, gy - H, M.fw * sc, H); ctx.restore();
  gmDraw('to_nube', Math.floor(g.t * 6), x, gy - H - 4, 1.1 * k, 0, A, .5, .6);
}
FXR.impact._toStorm = (e, a) => {
  if(!g3('to_nube', 'to_embudo', 'to_polvo')) return;
  const T = e.T, u = a / e.dur, A = u < .12 ? u / .12 : u > .8 ? (1 - u) / .2 : 1, x = T ? T.x : e.x, gy = T ? brFoot(T) : e.y + 20;
  toStorm(x, gy, a, e.k || 1, A);
  if(T && T.m && T.lift && T.lift.tor && !T.dead){                             // el Pokémon atrapado se ve DENTRO del tornado, por delante del viento
    const lg = fxLunge(T), h = fxLift(T); if(T.lift) try{ ctx.save(); ctx.globalAlpha = .92; drawFrame(ctx, T.m.dex, 'Hurt', T.at || 0, T.dir, T.x + lg.x, T.y + lg.y - h, ESCALA, 0, T.shiny); ctx.restore(); }catch(err){} }
};
for(const N of ['Tornado', 'Vendaval']){
  g3Move(N, ['to_embudo'], (s, a, an) => { gmDraw('to_embudo', Math.floor(g.t * 16), s.x, s.y + 8, .3, 0, 1, .5, .95); }, null, null);
  const oI = FXR.impact[N]; FXR.impact[N] = function(e, a){ const b = oI && (oI.draw || oI); if(!(G3.on && g3('to_nube', 'to_embudo')) && b) return b.apply(this, arguments);
    if(a < .25 && b) b.apply(this, arguments); };                                                  // el destello del golpe de antes, cortito
  if(oI) Object.assign(FXR.impact[N], oI); delete FXR.impact[N].draw;
}
if(typeof hit === 'function'){ const o = hit; hit = function(T, dmg, type, A, close, big, mvn){
    const hp0 = T ? T.hp : 0, r = o.apply(this, arguments);
    try{ if(G3.on && T && T.hp < hp0 && !T.dead){
        if((mvn === 'Tornado' || mvn === 'Vendaval') && g3('to_nube', 'to_embudo')){ if(!T.lift) T.lift = {t0: g.t, dur: TO.lift, tor: 1, H: TO.H * (mvn === 'Vendaval' ? 1.25 : 1), side: (A && A.x > T.x) ? -1 : 1, dir0: T.dir};
          fxAdd('impact', '_toStorm', {x: T.x, y: T.y, T, dur: TO.dur, k: mvn === 'Vendaval' ? 1.25 : 1}); g.pops.push({x: T.x, y: T.y - 140, txt: '¡ATRAPADO!', t: 1, c: '#e8f0ff', s: 11});
          if(typeof snPlay === 'function') snPlay('wind', 1); }
        const J = JAWS[mvn]; if(close && J && g3(J)) fxAdd('impact', '_jaws', {x: T.x, y: T.y, T, key: J, dur: .5});
      } }catch(e){}
    return r; }; }

// =====================================================================  MORDISCOS (mandíbulas)
const JAWS = {'Mordisco': 'mo_osc', 'Triturar': 'mo_osc', 'Colmillo Rayo': 'mo_ray', 'Colmillo Hielo': 'mo_hie', 'Colmillo Ígneo': 'mo_fue', 'Colmillo Veneno': 'mo_osc'};
FXR.impact._jaws = (e, a) => {
  const T = e.T, u = a / e.dur, x = T ? T.x : e.x, y = T ? T.y - 28 : e.y - 28, k = e.key, n = GM.meta[k].n;
  const fr = u < .55 ? Math.floor(u / .55 * (n - 2)) : u < .7 ? n - 2 : n - 1;      // se cierran · ¡ÑAM! · se rompen
  const shake = fr === n - 2 ? (Math.random() - .5) * 6 : 0;
  gmDraw(k, fr, x + shake, y, .75, 0, u > .85 ? (1 - u) / .15 : 1);
};
{ const N = 'Triturar';
  if(typeof MOVES !== 'undefined' && !MOVES[N]) MOVES[N] = {t: 'siniestro', s: 1};
  FXC[N] = Object.assign({}, FXC['Mordisco'] || {});
  g3Learn(N, 'siniestro', [9, 24, 59, 130, 160, 229, 248, 262, 319, 373, 445, 395, 260, 230, 186, 142, 382, 643, 644, 718, 889, 890, 979, 984]); }

// =====================================================================  TERREMOTO (losas en círculo + grieta)
if(typeof suPaintQuake === 'function'){ const old = suPaintQuake; suPaintQuake = function(x, y, R){         // la grieta del centro: el dibujo de Gemini
    if(!g3('tq_grieta')) return old.apply(this, arguments);
    const M = GM.meta.tq_grieta, w = Math.min(320, R * 1.2), h = w * M.fh / M.fw, [c, s] = suCanvas(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
    s.imageSmoothingEnabled = false; s.drawImage(GM.img.tq_grieta, x - w / 2, y - h / 2, w, h); return c; }; }
{ const o = FXR.impact._terremoto; if(o){ const w = function(e, a){
    const r = o.apply(this, arguments);
    try{ if(g3('tq_losa', 'tq_polvo')){
        const R = Math.min(330, e.R || 200), Tw = (typeof QUAKE !== 'undefined' ? QUAKE.T : .4) * 1.4, life = .75, list = [];
        for(const [ring, n] of [[.55, 8], [1, 14]]) for(let i = 0; i < n; i++){        // tres anillos de losas: salen cuando llega la onda
          const an = i / n * 6.283 + ring * 3 + HH(i, ring * 10) * .3, rr = R * ring * (.92 + .16 * HH(i, 7)), t0 = Tw * ring, v = (a - t0) / life;
          if(v < 0 || v >= 1) continue; list.push([e.x + Math.cos(an) * rr, e.y + Math.sin(an) * rr * .5, v, i]); }
        list.sort((p, q) => p[1] - q[1]);
        for(const [x, y, v, i] of list){ gmDraw('tq_losa', Math.min(5, Math.floor(v * 6)), x, y, .32, 0, v > .85 ? (1 - v) / .15 : 1, .5, .85);
          if(i % 4 === 0 && v > .15) gmDraw('tq_polvo', Math.min(3, Math.floor((v - .15) / .85 * 4)), x, y - 6, .3, 0, .85, .5, .8); }
      } }catch(err){}
    return r; }; Object.assign(w, o); FXR.impact._terremoto = w; } }

// =====================================================================  MEGACUERNO (embestida) y VELOCIDAD EXTREMA (zigzag) — mismo motor de carrera
const DASH = {mc: {spd: 1250, t: .5, reach: 48, aura: true}, ve: {spd: 2100, legs: 3, reach: 52, over: 110, k: .45}};
function dashStart(f, kind, dmg, type, mine, nm, ang, big){
  const T = foe(mine), legs = [];
  if(kind === 've'){ let px = f.x, py = f.y;
    for(let i = 0; i < DASH.ve.legs; i++){ const a0 = i === 0 ? Math.atan2(T.y - py, T.x - px) : Math.atan2(T.y - py, T.x - px) + (i % 2 ? .5 : -.5),
        ex = clamp(T.x + Math.cos(a0) * DASH.ve.over, bx0(), bx1()), ey = clamp(T.y + Math.sin(a0) * DASH.ve.over * .8, by0(), by1()); legs.push([ex, ey]); px = ex; py = ey; } }
  else { const a0 = T && !T.dead ? Math.atan2(T.y - f.y, T.x - f.x) : ang; legs.push([clamp(f.x + Math.cos(a0) * DASH.mc.spd * DASH.mc.t, bx0(), bx1()), clamp(f.y + Math.sin(a0) * DASH.mc.spd * DASH.mc.t, by0(), by1())]); }
  f.dsh = {kind, legs, i: 0, t: 0, dmg, type, mine, nm, big, hit: -1, trail: [], from: [f.x, f.y]};
  f.quick = null; setAct(f, 'Walk', 1.2); dashLeg(f);
}
function dashLeg(f){ const D = f.dsh, [ex, ey] = D.legs[D.i]; D.ang = Math.atan2(ey - f.y, ex - f.x); D.from = [f.x, f.y]; f.dir = dirOf(D.ang);
  if(D.kind === 've'){ fxAdd('impact', '_veOut', {x: f.x, y: f.y - 20, ang: D.ang, dur: .3}); if(typeof snPlay === 'function') snPlay('speed', 1); } else if(typeof snPlay === 'function') snPlay('horn', 1); }
function dashEndLeg(f){ const D = f.dsh;
  if(Math.hypot(f.x - D.from[0], f.y - D.from[1]) > 40 && typeof suBurn === 'function') suBurn(D.from[0], brFoot(f) - (f.y - D.from[1]), f.x, brFoot(f), D.kind === 've' ? 8 : 26, false);   // las líneas quemadas que se quedan
}
function dashTick(f, dt){
  const D = f.dsh; if(!D) return;
  if(f.dead || cant(f) || !g || g.over){ f.dsh = null; return; }
  const P = D.kind === 've' ? DASH.ve : DASH.mc, T = foe(D.mine), [ex, ey] = D.legs[D.i], d = Math.hypot(ex - f.x, ey - f.y), st = P.spd * dt;
  D.t += dt; f.mv = true;
  if(d <= st){ f.x = ex; f.y = ey; } else { f.x += (ex - f.x) / d * st; f.y += (ey - f.y) / d * st; }
  D.trail.push({x: f.x, y: f.y, t: g.t, act: f.act, at: f.at, dir: f.dir});
  if(D.kind === 'mc' && Math.floor(g.t * 18) !== D.dust){ D.dust = Math.floor(g.t * 18); fxAdd('impact', '_mcPolvo', {x: f.x - Math.cos(D.ang) * 30, y: brFoot(f), dur: .45}); }
  if(D.hit !== D.i && !T.dead && !T.ghost && Math.hypot(T.x - f.x, T.y - f.y) < rad(T) + P.reach){
    D.hit = D.i;
    if(T.inv > 0){ if(typeof dodgeOk === 'function') dodgeOk(T); }
    else { const last = D.kind === 'mc' || D.i === D.legs.length - 1; f.kbP = last ? 1 : 0; hit(T, D.dmg * (D.kind === 've' ? DASH.ve.k : 1), D.type, f, true, D.big && last, D.nm); f.kbP = 0;
      fxAdd('impact', D.kind === 've' ? '_veHit' : '_mcHit', {x: T.x, y: T.y - 20, dur: .5}); }
    if(D.kind === 'mc'){ dashEndLeg(f); f.dsh = null; setAct(f, 'Idle', 0); return; } }
  if(d <= st || (D.kind === 'mc' && D.t > P.t)){ dashEndLeg(f); D.i++; if(D.i >= D.legs.length){ f.dsh = null; setAct(f, 'Idle', 0); return; } dashLeg(f); }
}
if(typeof move === 'function'){ const o = move; move = function(f){ if(f && f.dsh) return; return o.apply(this, arguments); }; }   // mientras embiste no se mueve con las teclas
{ const o = use; use = function(f){ if(f && f.dsh) return; return o.apply(this, arguments); }; }                                    // ni ataca
if(typeof feelTick === 'function'){ const o = feelTick; feelTick = function(f, dt){ const r = o.apply(this, arguments);
    try{ dashTick(f, dt); if(f.quick && G3.on){ (f.qTrail = f.qTrail || []).push({x: f.x, y: f.y, t: g.t, act: f.act, at: f.at, dir: f.dir}); } }catch(e){} return r; }; }
// Velocidad Extrema: en el combate usa la salida de Ataque Rápido (combat.js); aquí se cambia por el zigzag
{ const N = 'Velocidad Extrema';
  if(typeof MOVES !== 'undefined' && !MOVES[N]) MOVES[N] = {t: 'normal', s: 1};
  FXC[N] = Object.assign({}, FXC['Ataque Rápido'] || {});
  g3Learn(N, null, [58, 59, 149, 448, 264, 386, 493, 384, 146, 244, 245, 243, 850, 851, 39, 52, 53, 128, 263, 133, 196, 197, 470, 471, 700, 135, 134, 136]);
  if(typeof quickStart === 'function'){ const o = quickStart; quickStart = function(f, ang, dmg, type, mine, nm){
      if(G3.on && nm === N) return dashStart(f, 've', dmg * 1.3, type, mine, nm, ang, true);
      return o.apply(this, arguments); }; } }
// Megacuerno: al soltar la E (como Cometa Draco en js/fxbrendan.js)
if(typeof windFire === 'function'){ const o = windFire; windFire = function(f){
    const w = f.wind; if(G3.on && w && w.nm === 'Megacuerno'){ f.wind = null; f.dir = dirOf(w.ang);
      const wp = w.hold ? Math.max(0, Math.min(1, w.c / FEEL.windMax)) : 0; return dashStart(f, 'mc', w.dmg * (1 + (FEEL.windK - 1) * wp), w.type, w.mine, w.nm, w.ang, true); }
    return o.apply(this, arguments); }; }
FXR.impact._veOut = (e, a) => { if(g3('ve_salida')) gmDraw('ve_salida', g3F('ve_salida', a / e.dur), e.x, e.y, .4, e.ang, 1 - a / e.dur, .6, .5); };
FXR.impact._veHit = (e, a) => { if(g3('ve_golpe')) gmDraw('ve_golpe', g3F('ve_golpe', a / e.dur), e.x, e.y, .6, 0, 1); };
// El cuerno apuntando hacia donde embiste (si va a la izquierda se da la vuelta en espejo, para que siga curvado hacia arriba)
function mcHorn(x, y, ang, sc, A){
  const M = GM.meta.mc_cuerno2, im = GM.img.mc_cuerno2, L = Math.cos(ang) < 0, fr = Math.floor(g.t * 12) % M.n;
  ctx.save(); ctx.globalAlpha = A; ctx.imageSmoothingEnabled = false; ctx.translate(x, y);
  if(L){ ctx.scale(-1, 1); ctx.rotate(-(Math.PI - ang)); } else ctx.rotate(ang);
  ctx.scale(sc, sc); ctx.drawImage(im, fr * M.fw, 0, M.fw, M.fh, -M.fw * .42, -M.fh * .62, M.fw, M.fh); ctx.restore();
}
FXR.impact._mcHit = (e, a) => { if(!g3('mc_golpe')) return; const u = a / e.dur; if(g3('mc_brillo') && u < .35) gmDraw('mc_brillo', g3F('mc_brillo', u / .35), e.x, e.y - 10, .7, 0, 1); if(u < .2) brGlow(e.x, e.y, 90, '160,255,140', (1 - u / .2) * .7); gmDraw('mc_golpe', g3F('mc_golpe', u), e.x, e.y, .62, 0, 1); };
FXR.impact._mcPolvo = (e, a) => { if(g3('mc_polvo')) gmDraw('mc_polvo', g3F('mc_polvo', a / e.dur), e.x, e.y, .3, 0, .9, .5, .9); };
// Las copias del Pokémon (su propio sprite) por donde ha pasado, el aura verde del Megacuerno y el polvo
function dashDraw(){
  if(!g || !g.p || !g.e || !G3.on) return;
  for(const f of [g.p[g.pi], g.e[g.ei]]){ if(!f || !f.m) continue;
    for(const key of ['dsh', 'qTrail']){
      const L = key === 'dsh' ? (f.dsh ? f.dsh.trail : f.dshOld) : f.qTrail; if(!L || !L.length) continue;
      const life = key === 'dsh' && f.dsh && f.dsh.kind === 'mc' ? .18 : .32;
      for(let i = L.length - 1; i >= 0; i--){ const p = L[i], age = g.t - p.t; if(age > life){ L.splice(0, i + 1); break; }
        if(i % 2) continue;
        ctx.save(); ctx.globalAlpha = .55 * (1 - age / life); try{ drawFrame(ctx, f.m.dex, 'Walk', p.at || 0, p.dir, p.x, p.y, ESCALA, 0, f.shiny); }catch(e){} ctx.restore(); }
    }
    const D = f.dsh; if(D) f.dshOld = D.trail;
    if(D && D.kind === 've' && g3('ve_polvo')) gmDraw('ve_polvo', Math.floor(g.t * 12), f.x - Math.cos(D.ang) * 30, brFoot(f) - 6, .45, D.ang, .9, 1, .5);
    if(D && D.kind === 'mc' && g3('mc_aura')) gmDraw('mc_aura', Math.floor(g.t * 14), f.x - Math.cos(D.ang) * 10, f.y - 26 + Math.sin(D.ang) * 10, .42, D.ang, .55, .78, .5);   // aura detrás
    if(D && D.kind === 'mc' && g3('mc_cuerno2')) mcHorn(f.x + Math.cos(D.ang) * 24, f.y - 30 + Math.sin(D.ang) * 16, D.ang, .4, 1);                              // el CUERNO delante
  }
}
if(typeof fxDraw === 'function'){ const o = fxDraw; fxDraw = function(){ const r = o.apply(this, arguments); try{ dashDraw(); }catch(e){} return r; }; }

// =====================================================================  HOJA AFILADA (y Lluevehojas, si algún día está)
for(const N of ['Hoja Afilada', 'Lluevehojas', 'Hojas Mágicas']){
  g3Move(N, ['ho_cono', 'ho_hoja'], (s, a, an) => {
    const y = s.y - 6;
    gmDraw('ho_cono', Math.floor(g.t * 14), s.x, y, .45, an, .95, .92, .5);
    for(let i = 0; i < 4; i++){ const t = g.t * 9 + i * 1.57, r = 20 + 5 * Math.sin(g.t * 5 + i); gmDraw(i % 2 ? 'ho_hoja' : 'ho_var', Math.floor(g.t * 20 + i * 3), s.x + Math.cos(t) * r, y + Math.sin(t) * r * .7, .3, t, 1); }
  }, ['ho_golpe'], (e, a) => { const u = a / .6; if(u < 1) gmDraw('ho_golpe', g3F('ho_golpe', u), e.x, e.y - 6, .5 * (e.k || 1), 0, 1); });
}

// =====================================================================  PULSO UMBRÍO
FXR.impact._puCast = (e, a) => { if(g3('pu_humo')) gmDraw('pu_humo', g3F('pu_humo', a / e.dur), e.x, e.y, .4, 0, 1 - a / e.dur * .5); };
{ const o = FXR.cast['Pulso Umbrío'] || FXR.cast['_']; FXR.cast['Pulso Umbrío'] = function(f, s, name, big, ox, oy, ang){ const r = o && o.apply(this, arguments); if(G3.on) fxAdd('impact', '_puCast', {x: ox, y: oy, dur: .4}); return r; }; }
g3Move('Pulso Umbrío', ['pu_aro'], (s, a, an) => {
  const y = s.y - 6, fr = Math.floor(g.t * 12), ca = Math.cos(an), sa = Math.sin(an), dist = Math.min(1, a * 3);
  for(let k = 3; k >= 0; k--){ const d = k * 34 * dist, sc = .45 * (1 - k * .14); if(k && d < 6) continue;      // la fila de anillos: los de atrás, más pequeños
    gmDraw('pu_aro', fr + k, s.x - ca * d, y - sa * d, sc, an, 1 - k * .2); }
}, ['pu_golpe'], (e, a) => { const u = a / .6; if(u < 1) gmDraw('pu_golpe', g3F('pu_golpe', u), e.x, e.y - 6, .5 * (e.k || 1), 0, 1); });

// =====================================================================  MEGACUERNO como disparo (solo en el combate online, donde no embiste)
g3Move('Megacuerno', ['mc_cuerno2'], (s, a, an) => { mcHorn(s.x, s.y - 6, an, .32, 1); },
  ['mc_golpe'], (e, a) => { const u = a / .55; if(u < 1) gmDraw('mc_golpe', g3F('mc_golpe', u), e.x, e.y - 6, .55 * (e.k || 1), 0, 1); });
