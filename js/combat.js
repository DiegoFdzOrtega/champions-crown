"use strict";
/* =====================================================================
   4) COMBATE EN TIEMPO REAL
   ===================================================================== */
const foe = mine => mine ? g.e[g.ei] : g.p[g.pi];
// ---- Combate online (js/pvp.js): «me» = el bando que controlas. En el modo normal siempre es 'p'; en un combate online el que lanzó el desafío es 'p' y el invitado es 'e'. ----
const meSide = () => (g && g.me) || 'p';
const myList = () => meSide() === 'p' ? g.p : g.e, oppList = () => meSide() === 'p' ? g.e : g.p;
const myIdx = () => meSide() === 'p' ? g.pi : g.ei, oppIdx = () => meSide() === 'p' ? g.ei : g.pi;
const myMon = () => myList()[myIdx()];
const myCd = () => meSide() === 'p' ? g.swCd : (g.swCdE || 0);                  // segundos que faltan para poder volver a cambiar de Pokémon
const rad = f => Math.max(26, idleInfo(f.m.dex).fw * ESCALA * .3);   // tamaño para recibir golpes
function setAct(f, name, dur){ f.act = name; f.at = 0; f.lock = dur; }

// ---- SENSACIÓN DE COMBATE: retroceso al recibir un golpe, esquiva con la carrera y aviso del ataque fuerte ----
// Todo esto forma parte del cálculo del combate (también online): si cambias un número, sube PVP_VER (js/pvp.js).
const FEEL = {
  kbMelee: 560, kbShot: 260, kbBig: 3000, kbBigMax: 6500, bigMax: 8000,      // [AJUSTE] empujón al recibir un golpe / un disparo / un ataque fuerte (px por segundo; se frena solo)
  kbDecay: 9, kbMax: 1700,                     // [AJUSTE] lo rápido que se frena el empujón y su tope
  inv: .22, invFoe: .13,                      // [AJUSTE] segundos de invulnerabilidad al empezar la carrera (tú y el online / el rival de la IA)
  dodgeEn: 15, dodgeCd: 1,                    // [AJUSTE] premio por esquivar un ataque con la carrera: energía que recuperas y segundos que se le quitan a la espera de la carrera
  wind: .38, windFoe: .5, windLock: .4,       // [AJUSTE] carga del ataque fuerte antes de salir (tú y el online / el rival de la IA) · la IA deja de apuntar cuando queda este tramo (0,4 = el último 40 %)
  windSlow: .35, windMax: 3.5, windK: 3,                              // [AJUSTE] velocidad al andar mientras cargas el ataque fuerte (0,35 = 35 %)
  koEn: 30, koCd: 1.5,                        // [AJUSTE] premio por debilitar a un rival con un ataque: energía que recuperas y segundos que se le quitan a la espera de la carrera
  ctr: .7, ctrK: 1.3,                         // [AJUSTE] contraataque: segundos que tienes tras esquivar para que tu siguiente ataque pegue más · cuánto más (1,3 = +30 %)
  slowT: .9, slowK: .3, zoom: .22,            // [AJUSTE] remate final (cae el último Pokémon de un bando; no en online): segundos de cámara lenta · velocidad durante ella · cuánto se acerca la cámara (0,22 = 22 %)
  chgMin: .5, chgT: 3.5, chgK: 1.6, chgKMax: 4.5, chgKb: 3.2, chgReach: 0, chgPush: 1200, chgPushMax: 3200, chgMax: 4000,   // [AJUSTE] golpe cargado (mantener el botón del golpe): segundos mínimos para que cuente · segundos para la carga máxima (se puede seguir manteniendo, ya no sube más) · daño mínimo y máximo · empujón mínimo y máximo (px/s; unos 9 px/s = 1 px de recorrido) · tope del empujón · alcance extra
  entryR: 150, entryKb: 520,                  // [AJUSTE] entrada con impacto: el Pokémon que entra al cambiar empuja al rival si lo tiene a esta distancia · fuerza del empujón
  blastR: 150, blastKb: 700,                  // [AJUSTE] onda del ataque fuerte al salir: aparta al rival si lo tienes a esta distancia (aunque el ataque no le dé) · fuerza del empujón
  slamV: 220, slamDmg: .12                    // [AJUSTE] estamparse contra un pilar: velocidad mínima del empujón para que cuente · vida que quita (0,12 = 12 % de la máxima; nunca debilita)
};
// LÍMITES DEL CAMPO: hasta dónde se mueven los Pokémon. Lo normal es 50 … W-50 y 140 … H-110; con la cámara lejana (FAR, js/render.js) el campo es más grande.
const farB = () => typeof farOn === 'function' && farOn();
const teB = () => typeof teOn === 'function' && teOn();          // estadio grande de la Torre (js/torreestadio.js): el campo ocupa todo el mundo
const bx0 = () => teB() ? 40 : farB() ? farBox().x0 + 40 : 50, bx1 = () => teB() ? W - 40 : farB() ? farBox().x1 - 40 : W - 50, by0 = () => teB() ? 30 : farB() ? farBox().y0 + 14 : 140, by1 = () => teB() ? TE.H - 16 : farB() ? farBox().y1 - 40 : H - 110;      // (farBox: el rectángulo del campo, js/render.js)
const feelFoe = f => !g.pvp && g.e.includes(f);                      // ¿es un rival movido por la IA?
function dodgeOk(T){                                                 // ha esquivado un ataque con la carrera: aviso y premio (una vez por carrera)
  if(T.invUsed) return; T.invUsed = true;
  T.en = Math.min(100, T.en + FEEL.dodgeEn); T.cd[0] = Math.max(0, T.cd[0] - FEEL.dodgeCd);
  T.ctr = FEEL.ctr;                                                  // y abre la ventana del contraataque (ver use())
  g.pops.push({x:T.x, y:T.y-120, txt:'¡ESQUIVA!', t:1, c:'#7fe3ff', s:12});
  Sfx.play('dodge'); fxBurst(T.x, T.y - 20, ['#7fe3ff', '#ffffff'], 8, 120);
}
function koBonus(A, T){                                              // A ha debilitado a T con un ataque
  A.en = Math.min(100, A.en + FEEL.koEn); A.cd[0] = Math.max(0, A.cd[0] - FEEL.koCd);
  if(!A.dead) g.pops.push({x:A.x, y:A.y-140, txt:'+ENERGÍA', t:1.1, c:'#ffe04a', s:11});
  if(!g.pvp && (g.p.includes(T) ? g.p : g.e).every(f => f.dead)){ g.slowT = FEEL.slowT; g.zoomAt = {x:T.x, y:T.y}; }      // era el último: remate a cámara lenta y con la cámara acercándose
}
const BIG_SPEED = {'Rayo Solar': 820, 'Hidrobomba': 820, 'Hiperrayo': 820};                                // [AJUSTE] ataques fuertes que van más deprisa que los demás (380): el Rayo Solar es un rayo, cruza la arena en un momento
// ---- PSÍQUICO: si el ataque da, atrapas al rival en el aire. Apuntas con el ratón y con un clic lo lanzas adonde quieras; al caer queda aturdido ----
const PSI = {hold: 1.5, fly: 1500, stun: 1, ai: .5, aiD: 340};      // [AJUSTE] segundos que lo tienes atrapado (si no haces clic, sale solo hacia el ratón) · velocidad del lanzamiento (px/s) · segundos aturdido al caer · lo que tarda la IA en lanzarte · lo lejos que te lanza la IA
function psiGrab(A, T, mine){
  if(!A || T.dead || T.ghost) return;
  T.psi = {by: A, mine, t: PSI.hold, ph: true, mx: T.x, my: T.y, ai: feelFoe(A)};
  T.kx = T.ky = 0; T.kbHit = false; T.burst = null; T.wind = null; T.boca = null; T.mh = false; T.mc = 0; if(T.ride){ T.ride.s.life = 0; T.ride = null; }
  g.pops.push({x: T.x, y: T.y - 150, txt: '¡ATRAPADO!', t: 1, c: '#ff8fd0', s: 11});
}
function psiCtl(f, held, mx, my){                                    // lo llaman los controles: ¿tengo a alguien atrapado? Entonces el clic del golpe es «lanzar» (y devuelve true)
  const T = [g.p[g.pi], g.e[g.ei]].find(t => t && t.psi && t.psi.by === f && !t.psi.fly); if(!T) return false;
  const p = T.psi; p.mx = mx; p.my = my; if(held && !p.ph) p.go = true; p.ph = held; f.mh = false; f.mc = 0; return true;
}
function psiTick(T, dt){
  const p = T.psi; if(!p) return;
  if(T.dead || T.ghost){ T.psi = null; return; }
  T.stun = Math.max(T.stun || 0, .12); T.kx = T.ky = 0;                                  // atrapado o volando: no puede hacer nada
  if(p.fly){
    const F = p.fly; F.t += dt; const u = Math.min(1, F.t / F.T), e = 1 - (1 - u) * (1 - u);
    T.x = F.x0 + (F.x1 - F.x0) * e; T.y = F.y0 + (F.y1 - F.y0) * e;
    if(u >= 1){                                                                          // cae: aturdido
      T.psi = null; T.stun = PSI.stun; fx.shake = Math.max(fx.shake, 7); Sfx.play('hit', 1);
      fxBurst(T.x, T.y, ['#ff5fb0', '#ffa8d8', '#7de3ff', '#ffffff'], 16, 170, undefined, 6.3, {life: .5});
      g.pops.push({x: T.x, y: T.y - 150, txt: '¡ATURDIDO!', t: 1, c: '#ffe04a', s: 11});
      for(const q of pilList()) if(Math.hypot(q.x - T.x, q.y - T.y) <= q.r + rad(T)) pilDamage(q, 1);
    }
    return;
  }
  p.t -= dt;
  if(p.ai){ const A = p.by, a = Math.atan2(T.y - A.y, T.x - A.x); p.mx = T.x + Math.cos(a) * PSI.aiD; p.my = T.y + Math.sin(a) * PSI.aiD; if(p.t <= PSI.hold - PSI.ai) p.go = true; }      // la IA te lanza lejos de ella
  if(p.by.dead || p.by.ghost) p.go = true;
  if(p.go || p.t <= 0){ const x1 = clamp(p.mx, bx0(), bx1()), y1 = clamp(p.my, by0(), by1()), d = Math.hypot(x1 - T.x, y1 - T.y); p.fly = {x0: T.x, y0: T.y, x1, y1, t: 0, T: Math.max(.12, d / PSI.fly)}; Sfx.play('dodge'); }
}
// ---- A BOCAJARRO (Lucha, ataque fuerte): no dispara. Te lanzas hacia donde apuntas y, si alcanzas al rival, le sueltas una ráfaga de golpes; el último lo manda lejos ----
// Como en los juegos, te deja con la defensa baja: durante unos segundos recibes más daño. Si la embestida no alcanza a nadie, se pierde.
const BOCA = {dash: .26, spd: 950, reach: 52, n: 7, gap: .085, last: .34, vuln: 1.25, vulnT: 3, ai: 210};      // [AJUSTE] segundos y velocidad de la embestida · distancia a la que engancha · nº de golpes · segundos entre golpes · parte del daño que lleva el último · daño que recibes después (×) y cuánto dura · distancia desde la que lo usa la IA
function bocaStart(f, w, wp){
  f.boca = {ph: 0, t: 0, ang: w.ang, dmg: w.dmg * (1 + (FEEL.windK - 1) * wp), type: w.type, mine: w.mine, nm: w.nm, i: 0, kbP: wp};
  setAct(f, 'Attack', BOCA.dash); Sfx.play('strong', w.vk); fxBurst(f.x, f.y, ['#ffffff', TC[w.type] || '#ffffff'], 8, 120, w.ang + Math.PI, .9, {life: .35});
}
function bocaEnd(f){ f.boca = null; f.vuln = BOCA.vulnT; g.pops.push({x: f.x, y: f.y - 150, txt: 'DEFENSA ↓', t: 1.1, c: '#ff9a3a', s: 10}); }
function bocaTick(f, dt){
  if(f.vuln > 0) f.vuln -= dt;
  const b = f.boca; if(!b) return;
  if(f.dead || f.ghost || cant(f)){ f.boca = null; return; }
  const T = foe(b.mine), near = () => !T.dead && !T.ghost && Math.hypot(T.x - f.x, T.y - f.y) < rad(T) + BOCA.reach;
  if(b.ph === 0){                                                    // embestida
    b.t += dt;
    if(near() && !(T.inv > 0)){ b.ph = 1; b.t = 0; }
    else if(b.t >= BOCA.dash){ f.boca = null; return; }              // no ha alcanzado a nadie
    else{ f.x = clamp(f.x + Math.cos(b.ang) * BOCA.spd * dt, bx0(), bx1()); f.y = clamp(f.y + Math.sin(b.ang) * BOCA.spd * dt, by0(), by1()); f.dir = dirOf(b.ang); f.mv = true; return; }
  }
  b.t -= dt;                                                         // ráfaga
  while(b.t <= 0 && f.boca){
    if(!near()) return bocaEnd(f);                                   // se ha escapado (carrera, cambio...)
    const last = b.i >= BOCA.n - 1; f.dir = dirOf(Math.atan2(T.y - f.y, T.x - f.x)); setAct(f, 'Attack', .12);
    fxBurst(T.x + (Math.random() - .5) * 30, T.y - 10 + (Math.random() - .5) * 36, ['#ffffff', '#ffe04a', TC[b.type] || '#ffffff'], last ? 14 : 5, last ? 190 : 110, undefined, 6.3, {life: .3});
    if(last){ f.kbP = b.kbP; hit(T, b.dmg * BOCA.last, b.type, f, true, true, b.nm); f.kbP = 0; fx.shake = Math.max(fx.shake, 9); return bocaEnd(f); }
    f.kbK = .01; hit(T, b.dmg * (1 - BOCA.last) / (BOCA.n - 1), b.type, f, true, false, b.nm); f.kbK = 1;
    if(!T.dead){ T.kx = T.ky = 0; T.stun = Math.max(T.stun || 0, BOCA.gap + .06); }      // lo tienes cogido hasta el último golpe
    fx.shake = Math.max(fx.shake, 3); b.i++; b.t += BOCA.gap;
  }
}
// ---- ATAQUE RÁPIDO: un salto cortísimo y muy rápido hacia el rival (si lo tienes cerca va directo a por él; si no, hacia donde apuntas). Golpea al tocarlo ----
const QUICK = {spd: 1150, t: .24, reach: 46, aim: 320};            // [AJUSTE] velocidad (px/s) · segundos que dura (≈ 275 px) · distancia a la que golpea · si el rival está más cerca que esto, va hacia él
function quickStart(f, ang, dmg, type, mine, nm){
  const T = foe(mine), d = Math.hypot(T.x - f.x, T.y - f.y);
  if(!T.dead && !T.ghost && d < QUICK.aim) ang = Math.atan2(T.y - f.y, T.x - f.x);
  f.quick = {ang, t: 0, dmg, type, mine, nm}; f.dir = dirOf(ang); setAct(f, 'Attack', QUICK.t + .1);
}
function quickTick(f, dt){
  const q = f.quick; if(!q) return;
  if(f.dead || f.ghost || cant(f)){ f.quick = null; return; }
  const T = foe(q.mine); q.t += dt;
  f.x = clamp(f.x + Math.cos(q.ang) * QUICK.spd * dt, bx0(), bx1()); f.y = clamp(f.y + Math.sin(q.ang) * QUICK.spd * dt, by0(), by1()); f.mv = true;
  fxBurst(f.x - Math.cos(q.ang) * 20, f.y, ['#ffffff', '#dfe8ff'], 2, 60, q.ang + Math.PI, .6, {life: .25});
  if(!T.dead && !T.ghost && Math.hypot(T.x - f.x, T.y - f.y) < rad(T) + QUICK.reach){ f.quick = null; hit(T, q.dmg, q.type, f, true, false, q.nm); return; }
  if(q.t >= QUICK.t) f.quick = null;
}
// ---- TUMBA ROCAS: lanza tres rocas en abanico, de corto alcance. Hacen daño y dejan al rival lento unos segundos ----
const ROCK = {n: 3, spread: .16, speed: 430, range: 340, r: 11, dmg: .45, slow: .55, t: 2.5};      // [AJUSTE] nº de rocas · cuánto se abren · velocidad · alcance (px) · tamaño · daño de cada una (1 = un golpe normal) · velocidad a la que se queda el rival (×) · segundos lento
function rockThrow(f, ang, dmg, type, mine){
  setAct(f, 'Shoot', .4);
  for(let j = 0; j < ROCK.n; j++){ const s = shot(f, ang + (j - (ROCK.n - 1) / 2) * ROCK.spread, dmg * ROCK.dmg, ROCK.speed, ROCK.r, type, mine); s.life = s.L = ROCK.range / ROCK.speed; s.slow = 1; fxShotStart(f, s, 'Lanzarrocas', false); }
}
// ---- TERREMOTO: no dispara. Golpea el suelo: una onda se abre a tu alrededor, agrieta el suelo y daña al rival si lo pilla dentro. En el aire (Vuelo, Golpe Cuerpo) no le da ----
const QUAKE = {R: 200, Rmax: 330, T: .4, ai: 210};                  // [AJUSTE] radio sin cargar y con la carga a tope · segundos que tarda la onda en llegar al borde · distancia desde la que lo usa la IA
function quakeStart(f, w, wp){
  const R = QUAKE.R + (QUAKE.Rmax - QUAKE.R) * wp;
  f.quake = {x: f.x, y: f.y + 22, t: 0, R, dmg: w.dmg * (1 + (FEEL.windK - 1) * wp), type: w.type, mine: w.mine, nm: w.nm, kbP: wp, done: false};
  setAct(f, 'Attack', .4); Sfx.play('strong', w.vk); Sfx.play('hit', 1); fx.shake = Math.max(fx.shake, 14);
  if(typeof fxAdd === 'function') fxAdd('impact', '_terremoto', {x: f.x, y: f.y + 22, dur: 2.2, R, type: w.type});
  for(const p of pilList()) if(Math.hypot(p.x - f.x, p.y - f.y) <= R + p.r) pilDamage(p, 2);
}
function quakeTick(f, dt){
  const q = f.quake; if(!q) return;
  q.t += dt; const T = foe(q.mine), d = Math.hypot(T.x - q.x, T.y + 22 - q.y), r = q.R * Math.min(1, q.t / QUAKE.T);
  if(!q.done && !T.dead && !T.ghost && d <= r + rad(T)){ q.done = true; if(!T.jump){ f.kbP = q.kbP; hit(T, q.dmg, q.type, f, false, true, q.nm); f.kbP = 0; } }      // saltando (o bajo tierra) no le da
  if(q.t >= QUAKE.T) f.quake = null;
}
// ---- VENTISCA: una ráfaga de viento helado en abanico, de alcance medio. Cada copo hace poco daño; si te pilla, puede CONGELARTE (no te mueves ni atacas) ----
const GUST = {n: 7, spread: .1, speed: 560, vary: .12, range: 430, r: 12, dmg: .24, frz: .3, frzT: 1.6};      // [AJUSTE] nº de copos · cuánto se abren · velocidad · cuánto cambia de uno a otro · alcance (px) · tamaño · daño de cada uno (× el del ataque fuerte) · probabilidad de congelar (una tirada por ráfaga) · segundos congelado
function gustStart(f, w, wp){
  const grp = {done: false}, dmg = w.dmg * (1 + (FEEL.windK - 1) * wp) * GUST.dmg;
  Sfx.play('strong', w.vk); f.swing = {t0: g.t, k: {reach: 60, arc: 1.2}, ang: w.ang, type: w.type, big: true};
  for(let j = 0; j < GUST.n; j++){ const sp = GUST.speed * (1 + (HH(j, 5) - .5) * 2 * GUST.vary), s = shot(f, w.ang + (j - (GUST.n - 1) / 2) * GUST.spread, dmg, sp, GUST.r, w.type, w.mine);
    s.life = s.L = GUST.range / sp; s.mvn = '_ventisca'; s.gust = grp; s.sd = j; s.kbS = .5; }
}
function gustHit(T, s){                                              // lo llama el bucle de disparos cuando un copo de Ventisca ha hecho daño
  const G = s.gust; if(G.done) return; G.done = true;
  if(Math.random() < GUST.frz && !(T.frz > 0)){ T.frz = GUST.frzT; T.stun = Math.max(T.stun || 0, GUST.frzT); T.kx = T.ky = 0; g.pops.push({x: T.x, y: T.y - 150, txt: '¡CONGELADO!', t: 1.2, c: '#9fe4ff', s: 11}); Sfx.play('hit_none', .8); }
}
// ---- ROCA AFILADA: lanza unas piedras pequeñas en abanico. Si alguna da, salen del suelo tres rocas afiladas bajo el rival, una detrás de otra, y cada una le quita vida ----
const STONE = {n: 4, spread: .09, speed: 600, r: 8, dmg: .1, spikes: 3, delay: .15, gap: .2, R: 54, sdmg: .32};      // [AJUSTE] nº de piedras · cuánto se abren · velocidad · tamaño · daño de cada piedra (× el del ataque fuerte) · nº de rocas que salen del suelo · segundos hasta la primera · segundos entre una y otra · radio en el que golpea cada roca · daño de cada roca
function stoneStart(f, w, wp){
  const full = w.dmg * (1 + (FEEL.windK - 1) * wp), grp = {done: false, dmg: full * STONE.sdmg, type: w.type, mine: w.mine, by: f, nm: w.nm, kbP: wp};
  Sfx.play('strong', w.vk); setAct(f, 'Shoot', .4);
  for(let j = 0; j < STONE.n; j++){ const s = shot(f, w.ang + (j - (STONE.n - 1) / 2) * STONE.spread, full * STONE.dmg, STONE.speed * (1 + (HH(j, 7) - .5) * .16), STONE.r, w.type, w.mine); s.edge = grp; s.kbS = .4; fxShotStart(f, s, 'Lanzarrocas', false); }
}
function stoneHit(T, s){                                             // una piedra ha dado: empiezan a salir las rocas del suelo (una sola vez por ataque)
  const G = s.edge; if(G.done) return; G.done = true;
  (g.spk = g.spk || []).push({i: 0, t: STONE.delay, G});
}
function spkTick(dt){                                                // lo llama update() cada fotograma
  if(!g.spk || !g.spk.length) return;
  for(const S of g.spk){
    S.t -= dt; const G = S.G, T = foe(G.mine);
    while(S.t <= 0 && S.i < STONE.spikes){
      const last = S.i === STONE.spikes - 1, x = T.x + (S.i - 1) * 16, y = T.y + 22;      // salen justo debajo de él, estén donde esté
      if(typeof fxAdd === 'function') fxAdd('impact', '_pincho', {x, y, dur: .9, type: G.type, seed: S.i * 3 + 1});
      fx.shake = Math.max(fx.shake, last ? 8 : 4); Sfx.play('hit', .7);
      if(!T.dead && !T.ghost && !T.jump){ if(G.by) G.by.kbP = G.kbP; hit(T, G.dmg, G.type, G.by, false, last, G.nm); if(G.by) G.by.kbP = 0; }      // (con la carrera se puede esquivar cada una)
      for(const p of pilList()) if(Math.hypot(p.x - x, p.y - (y - 22)) <= STONE.R + p.r) pilDamage(p, 1);
      S.i++; S.t += STONE.gap;
    }
  }
  g.spk = g.spk.filter(S => S.i < STONE.spikes);
}
const CLOSE_E = {'A Bocajarro': BOCA.ai, 'Terremoto': QUAKE.ai};      // ataques fuertes que solo sirven de cerca: la IA los usa a esta distancia o menos (js/ai.js)
const RIDE = {t: 4, turn: 7};                                       // [AJUSTE] Pájaro Osado y Envite Ígneo: segundos máximos de embestida · lo deprisa que giras (rad/s)
function rideStop(f, m, s, e){                                       // embestida dirigida: otro clic (golpe, disparo o E) la para. Devuelve true mientras dura
  const r = f.ride; if(!r || !r.free) return false;
  const stop = (m && !r.pm) || (s && !r.ps) || (e && !r.pe); r.pm = m; r.ps = s; r.pe = e;
  if(stop){ r.s.life = 0; f.ride = null; fxBurst(f.x, f.y, ['#ffffff', TC[r.s.type] || '#ffffff'], 10, 110, undefined, 6.3, {life:.4}); return false; }
  return true;
}
function windFire(f){                                                // el ataque fuerte sale al acabar la carga
  const w = f.wind; f.wind = null; f.dir = dirOf(w.ang);
  const wp0 = w.hold ? clamp(w.c / FEEL.windMax, 0, 1) : 0;
  if(w.nm === 'A Bocajarro') return bocaStart(f, w, wp0);
  if(w.nm === 'Terremoto') return quakeStart(f, w, wp0);                         // golpea el suelo
  if(w.nm === 'Roca Afilada') return stoneStart(f, w, wp0);                      // piedras + rocas del suelo
  if(w.nm === 'Ventisca') return gustStart(f, w, wp0);                           // ráfaga en abanico      // A Bocajarro no dispara: embestida y ráfaga
  const B = foe(w.mine), bd = Math.hypot(B.x - f.x, B.y - f.y);                  // onda al soltarlo: si el rival está encima, lo aparta (para quitártelo cuando viene cuerpo a cuerpo)
  f.swing = {t0:g.t, k:{reach:FEEL.blastR - 16, arc:3.2}, ang:w.ang, type:w.type, big:true}; fx.shake = Math.max(fx.shake, 4);
  const wp = w.hold ? clamp(w.c / FEEL.windMax, 0, 1) : 0;                       // cuánto has cargado (0..1)
  if(!w.hold && !B.dead && !B.ghost && !(B.inv > 0) && bd < FEEL.blastR){ const a = bd < .01 ? w.ang : Math.atan2(B.y - f.y, B.x - f.x); B.kx = clamp((B.kx || 0) + Math.cos(a) * FEEL.blastKb, -FEEL.kbMax, FEEL.kbMax); B.ky = clamp((B.ky || 0) + Math.sin(a) * FEEL.blastKb, -FEEL.kbMax, FEEL.kbMax); B.kbHit = true; setAct(B, 'Hurt', .3); }
  Sfx.play('strong', w.vk);
  const s4 = shot(f, w.ang, w.dmg * (1 + (FEEL.windK - 1) * wp), BIG_SPEED[w.nm] || 380, 22, w.type, w.mine); s4.kbP = wp; fxShotStart(f, s4, w.nm, true);
  if(w.nm === 'Surf') f.ride = {s:s4, a:w.ang, t:1.4}; else if(w.nm === 'Envite Ígneo' || w.nm === 'Pájaro Osado') f.ride = w.hold ? {s:s4, a:w.ang, t:RIDE.t, free:true, sp:Math.hypot(s4.vx, s4.vy), pm:true, ps:true, pe:true} : {s:s4, a:w.ang, t:1.2};      // tú: te lanzas y diriges la embestida · la IA: recto, como siempre   // Surf: el Pokémon se monta en la ola y viaja con ella
}
// ---- PILARES: de vez en cuando cae una columna del cielo. Para los disparos (los tuyos y los del rival), no se atraviesa andando y se ROMPE a golpes ----
// Solo en las arenas normales (Historia y Campo de Entrenamiento). En el Estadio (Torre, Clasificatoria, Campo de pruebas) y en el online NO hay pilares.
const PIL = {
  on: true,                                   // [AJUSTE] false = sin pilares en ningún combate
  r: 22,                                      // [AJUSTE] radio del pilar (el dibujo crece o encoge con él)
  body: 20,                                   // [AJUSTE] lo que ocupa un Pokémon al chocar con él
  hp: 3,                                      // [AJUSTE] golpes que aguanta (un disparo o un golpe = 1 · Ráfaga = medio cada uno · Pesado = 2 · el ataque fuerte lo revienta y sigue adelante)
  max: 2,                                     // [AJUSTE] cuántos puede haber a la vez
  first: [3, 6], every: [7, 12],              // [AJUSTE] segundos hasta que cae el primero / entre uno y el siguiente (al azar entre los dos números)
  life: 24,                                   // [AJUSTE] segundos que dura en pie si nadie lo rompe (parpadea antes de deshacerse)
  fall: .8,                                   // [AJUSTE] segundos que tarda en caer (se ve su sombra en el suelo: da tiempo a apartarse)
  dmg: .08, dmgR: 30, dmgKb: 420              // [AJUSTE] si te cae encima: vida que quita (0,08 = 8 % de la máxima; nunca debilita) · margen alrededor del pilar · empujón
};
const pilRnd = ([a, b]) => a + Math.random() * (b - a);
function pilList(){ return g && g.pil ? g.pil.filter(p => p.fall <= 0 && !p.gone) : []; }      // los pilares que ya están en pie
function pilSpawn(){                                                 // cae uno nuevo: en un sitio al azar, lejos de los dos Pokémon y de los otros pilares
  const P = g.p[g.pi], E = g.e[g.ei];
  for(let k = 0; k < 14; k++){
    const x = W * (.22 + Math.random() * .56), y = 190 + Math.random() * (H - 370);
    if(Math.hypot(x - P.x, y - P.y) < 120 || Math.hypot(x - E.x, y - E.y) < 120 || g.pil.some(p => Math.hypot(x - p.x, y - p.y) < 170)) continue;
    g.pil.push({x, y, r:PIL.r, hp:PIL.hp, age:0, fall:PIL.fall, hitT:0, seed:Math.random()}); return;
  }
}
function pilBreak(p){                                                // se hace pedazos
  if(p.gone) return; p.gone = true;
  (g.pilFx = g.pilFx || []).push({x:p.x, y:p.y, t0:g.t, seed:p.seed || 0, th:typeof pilTheme === 'function' ? pilTheme() : 'normal'});      // el dibujo del derrumbe (render.js)
  fxBurst(p.x, p.y, ['#c9ccd6', '#8d94a3', '#ffffff'], 18, 230); fx.shake = Math.max(fx.shake, 5); Sfx.play('hit_super', .6);
}
function pilDamage(p, n){ if(!n || p.gone) return; p.hp -= n; p.hitT = .14; if(p.hp <= 0) pilBreak(p); }
function pilTick(dt){
  if(g.pil === undefined){ g.pil = []; g.pilOn = PIL.on && !g.pvp && !(typeof prOn === 'function' && prOn()); g.pilT = pilRnd(PIL.first); }
  if(!g.pilOn) return;
  for(const p of g.pil){
    if(p.hitT > 0) p.hitT -= dt;
    if(p.fall > 0){ p.fall -= dt; if(p.fall <= 0){ fxBurst(p.x, p.y + 16, ['#b9ab8c', '#e6dcc4', '#ffffff'], 12, 150); fx.shake = Math.max(fx.shake, 6); Sfx.play('hit', .7); pilCrush(p); } }     // aterriza: polvo y temblor
    else if((p.age += dt) > PIL.life) pilBreak(p);
  }
  g.pil = g.pil.filter(p => !p.gone); if(g.pilFx) g.pilFx = g.pilFx.filter(f => g.t - f.t0 < 1.8);
  if((g.pilT -= dt) <= 0){ g.pilT = pilRnd(PIL.every); if(g.pil.length < PIL.max) pilSpawn(); }
}
function pilCrush(p){                                                // acaba de aterrizar: al Pokémon que pille debajo le hace daño y lo aparta
  for(const f of [g.p[g.pi], g.e[g.ei]]){
    const dx = f.x - p.x, dy = f.y - p.y, d = Math.hypot(dx, dy); if(f.dead || f.ghost || f.inv > 0 || d > p.r + PIL.dmgR) continue;
    f.hp = Math.max(1, f.hp - f.max * PIL.dmg); setAct(f, 'Hurt', .3);
    const a = d < .01 ? 0 : Math.atan2(dy, dx); f.kx = Math.cos(a) * PIL.dmgKb; f.ky = Math.sin(a) * PIL.dmgKb; f.kbHit = false;
    g.pops.push({x:f.x, y:f.y-120, txt:'¡PILAR!', t:1, c:'#c9ccd6', s:12});
  }
}
function pilBlocks(x0, y0, x1, y1, pad){                             // ¿hay un pilar entre esos dos puntos? (la IA lo usa para no disparar contra la piedra)
  for(const p of pilList()){
    const dx = x1 - x0, dy = y1 - y0, l2 = dx*dx + dy*dy || 1, t = clamp(((p.x - x0)*dx + (p.y - y0)*dy) / l2, 0, 1);
    if(Math.hypot(x0 + dx*t - p.x, y0 + dy*t - p.y) < p.r + (pad || 0)) return true;
  }
  return false;
}
function pilPush(f){                                                 // un Pokémon no puede meterse dentro de un pilar: se queda en su borde (y resbala alrededor)
  for(const p of pilList()){
    const dx = f.x - p.x, dy = f.y - p.y, d = Math.hypot(dx, dy), m = p.r + PIL.body;
    if(d < m){
      if(d < .01) f.x = p.x + m; else{ f.x = p.x + dx/d*m; f.y = p.y + dy/d*m; }
      if(f.kbHit && Math.hypot(f.kx || 0, f.ky || 0) > FEEL.slamV){                // un golpe lo ha estampado contra el pilar: daño extra, y el pilar también se resiente
        f.hp = Math.max(1, f.hp - f.max * FEEL.slamDmg); f.kx = f.ky = 0; f.kbHit = false; setAct(f, 'Hurt', .3); pilDamage(p, 1);
        fxBurst((f.x + p.x) / 2, (f.y + p.y) / 2, ['#c9ccd6', '#ffffff'], 10, 170); fx.shake = Math.max(fx.shake, 5); Sfx.play('hit', .8);
        g.pops.push({x:f.x, y:f.y-120, txt:'¡CONTRA EL PILAR!', t:1, c:'#ff9a3a', s:11});
      }
    }
  }
}

// ---- TERRENO: el ATAQUE FUERTE (E) deja en el suelo una FRANJA RECTA por donde pasa, según su tipo (no al impactar: de camino). Dura unos segundos ----
// Las franjas dañinas afectan solo al BANDO CONTRARIO al que la creó; la de Planta cura al propio. El daño de Brasas y Veneno se multiplica por la tabla de tipos
// (las brasas queman más a un tipo Planta, casi nada a uno de Agua). Un ataque BORRA las franjas que cruza si su tipo es muy eficaz contra el de ellas (Agua apaga Brasas, Fuego derrite Hielo y quema Hierba...).
// Forma parte del cálculo del combate (también online: sube PVP_VER si lo cambias). La IA sale de las franjas que le perjudican (ai.js).
const TERR = {
  on: true, max: 6, w: 24,                    // [AJUSTE] false = sin terreno · cuántas franjas puede haber a la vez · mitad del ancho de la franja
  fuego:     {n:'Brasas',  t:6, st:'brn'},       // [AJUSTE] st = estado que pone al que pisa (quemado) · sigue mientras esté dentro    // [AJUSTE] quita vida por segundo (0,025 = 2,5 % de la máxima × eficacia de tipo; nunca debilita)
  veneno:    {n:'Tóxico',  t:8, dps:.015},
  hielo:     {n:'Hielo',   t:6, slip:.4},     // [AJUSTE] resbala: te mueves más deprisa y te cuesta frenar
  agua:      {n:'Charco',  t:6, slow:.7},     // [AJUSTE] frena (0,7 = al 70 % de la velocidad)
  electrico: {n:'Campo',   t:5, st:'par'},       // paraliza    // [AJUSTE] quita energía por segundo
  planta:    {n:'Hierba',  t:7, slow:.6}    // [AJUSTE] cura por segundo al bando que la creó
};
function terrNear(x, y, q){                                          // el punto de la franja q más cercano a (x, y)
  const dx = q.x1 - q.x0, dy = q.y1 - q.y0, l2 = dx*dx + dy*dy, t = l2 ? clamp(((x - q.x0)*dx + (y - q.y0)*dy) / l2, 0, 1) : 0;
  return {x: q.x0 + dx*t, y: q.y0 + dy*t};
}
const terrDist = (x, y, q) => { const n = terrNear(x, y, q); return Math.hypot(x - n.x, y - n.y); };
function terrTrail(s){                                               // un ataque fuerte que avanza: su franja crece con él
  const d = TERR[s.type]; if(!TERR.on || !d || !d.t) return;
  const y = s.y + 20;                                                // a la altura de los pies
  if(!s.tr){ s.tr = {x0:s.x, y0:y, x1:s.x, y1:y, w:TERR.w, type:s.type, mine:s.mine, t:0, T:d.t}; (g.terr = g.terr || []).push(s.tr); if(g.terr.length > TERR.max) g.terr.shift(); }
  s.tr.x1 = s.x; s.tr.y1 = y;
  g.terr = g.terr.filter(q => q === s.tr || !(eff(s.type, [q.type]) > 1 && terrDist(s.x, y, q) < q.w + TERR.w));      // apaga / derrite / quema las franjas que cruza
}
const terrOn = (f, q) => terrDist(f.x, f.y + 20, q) < q.w;                                                             // ¿tiene los pies dentro?
const terrFoe = (f, q) => g.p.includes(f) ? !q.mine : q.mine;                                                           // ¿esa franja la creó el bando contrario?
function terrHostile(f){ for(const q of g.terr || []){ const d = TERR[q.type]; if(!d.heal && terrFoe(f, q) && terrOn(f, q)) return terrNear(f.x, f.y + 20, q); } return null; }   // el punto de la franja que le está perjudicando (o null): la IA se aparta de él
function terrAge(dt){ if(g.terr && g.terr.length){ for(const q of g.terr) q.t += dt; g.terr = g.terr.filter(q => q.t < q.T); } }
function terrTick(f, dt){                                            // efecto de las franjas sobre un Pokémon, cada fotograma
  let slow = 1, slip = 0; if(f.tst > 0) f.tst -= dt;
  if(!f.dead && !f.ghost && !f.jump) for(const q of g.terr || []){
    if(!terrOn(f, q)) continue; const d = TERR[q.type];
    if(terrFoe(f, q)){
      if(d.dps && f.hp > 1) f.hp = Math.max(1, f.hp - f.max * d.dps * eff(q.type, f.m.types) * dt);
      if(d.st && !f.st && !(f.tst > 0)){ f.tst = 1.5; statusInflict(f, d.st, STX[d.st].dur, null); }      // fuego quema · eléctrico paraliza (si no tiene ya un estado)
      if(d.slow) slow = Math.min(slow, d.slow);
      if(d.slip) slip = Math.max(slip, d.slip);
    }
    else if(d.heal) f.hp = Math.min(f.max, f.hp + f.max * d.heal * dt);
  }
  f.tslow = slow;
  if(slip && !f.kbHit && f.lx !== undefined && dt > 0 && !f.ride){                                                         // hielo: se lleva parte de la velocidad que traía
    f.kx = clamp((f.x - f.lx) / dt * slip, -320, 320); f.ky = clamp((f.y - f.ly) / dt * slip, -320, 320);
  }
  f.lx = f.x; f.ly = f.y;
}

// ---- GOLPE CARGADO: al pulsar el golpe sale uno normal; si MANTIENES el botón se carga y, al soltar (o al llenarse), sale uno más fuerte que empuja mucho ----
function meleeInput(f, held, ang, mine, dt){                         // lo llaman el control del jugador (update) y el del online (pvpControl)
  if(held){                                                          // mantienes el clic: cargas todo lo que quieras (el daño y el empujón dejan de subir en chgT) y NO sale hasta que sueltas
    if(!f.mh){ f.mh = true; f.mc = 0; return; }
    f.mc = (f.mc || 0) + dt;
    if(f.mc > .3 && !f.dead && !cant(f)){ if(f.act !== 'Charge') setAct(f, 'Charge', .2); else f.lock = .2; }      // mientras mantienes, el Pokémon se queda en su pose de cargar
  }
  else{ if(f.mh){ if(f.mc >= FEEL.chgMin) meleeCharged(f, ang, mine); else use(f, 1, ang, mine); } f.mh = false; f.mc = 0; }      // al soltar: golpe normal (toque corto) o cargado; solo pega si el rival está a su alcance
}
function meleeCharged(f, ang, mine){ f.chgP = clamp((f.mc - FEEL.chgMin) / (FEEL.chgT - FEEL.chgMin), 0, 1); f.mc = 0; f.chg = true; use(f, 1, ang, mine); f.chg = false; }

// ---- ENTRADA CON IMPACTO: el Pokémon que entra al cambiar cae con fuerza y empuja al rival (y pica los pilares) que tenga cerca. Lo llama swap.js ----
function entryImpact(f, side){
  const T = side === 'p' ? g.e[g.ei] : g.p[g.pi];
  fxBurst(f.x, f.y + 18, ['#e6dcc4', '#ffffff', '#b9ab8c'], 14, 190); fx.shake = Math.max(fx.shake, 5);
  if(T && !T.dead && !T.ghost && !(T.inv > 0)){
    const dx = T.x - f.x, dy = T.y - f.y, d = Math.hypot(dx, dy);
    if(d < FEEL.entryR){ const a = d < .01 ? 0 : Math.atan2(dy, dx); T.kx = (T.kx || 0) + Math.cos(a) * FEEL.entryKb; T.ky = (T.ky || 0) + Math.sin(a) * FEEL.entryKb; T.kbHit = true; setAct(T, 'Hurt', .3); }
  }
  for(const p of pilList()) if(Math.hypot(p.x - f.x, p.y - f.y) < FEEL.entryR * .7) pilDamage(p, 1);
}

// ---- CHOQUE DE DISPAROS: si un disparo tuyo y uno del rival se encuentran, gana el más fuerte y el otro se deshace ----
// Fuerza de cada uno = su tamaño (ataque fuerte 3 · Pesado 1,5 · normal 1 · Ráfaga 0,5) × la eficacia de SU tipo contra el tipo del otro (Agua contra Fuego ×2, Fuego contra Agua ×0,5...).
// Si uno supera al otro por CLASH.win, sigue adelante (algo más flojo) y el otro se destruye; si van parejos, se anulan los dos. Chocan TODOS los disparos (también los de estado, con fuerza 0,75)
// y un golpe cuerpo a cuerpo puede CORTAR un disparo que le llegue si lo supera (fuerza 1 × su eficacia de tipo): ver melee().
// Durante un instante se quedan empujándose: el que gana va avanzando sobre el otro. Forma parte del cálculo del combate (también online: sube PVP_VER si lo cambias).
const CLASH = {win: 1.5, keep: .85, near: 24, hold: .22, holdBig: .45, push: .18};        // [AJUSTE] ventaja para ganar · daño que conserva el ganador · margen para que dos disparos que se cruzan lleguen a chocar · segundos empujándose (normal / dos ataques fuertes) · cuánto avanza mientras empuja
const shotPow = s => s.status ? .75 : s.r > 15 ? 3 : (s.pw || 1);
function shotClash(){
  const L = g.shots;
  for(let i = 0; i < L.length; i++){
    const a = L[i]; if(a.life <= 0 || a.hold > 0) continue;
    for(let j = i + 1; j < L.length; j++){
      const b = L[j]; if(b.life <= 0 || b.hold > 0 || a.mine === b.mine || Math.hypot(a.x - b.x, a.y - b.y) > a.r + b.r + CLASH.near) continue;
      const ea = eff(a.type, [b.type]), eb = eff(b.type, [a.type]), pa = shotPow(a) * ea, pb = shotPow(b) * eb, big = a.r > 15 && b.r > 15, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      a.hold = b.hold = big ? CLASH.holdBig : CLASH.hold; a.rival = b; b.rival = a;
      a.lose = !(pa >= pb * CLASH.win); b.lose = !(pb >= pa * CLASH.win);                    // parejos: pierden los dos
      fxBurst(mx, my, [TC[a.type] || '#ffffff', TC[b.type] || '#ffffff', '#ffffff'], big ? 16 : 7, big ? 240 : 150);
      Sfx.play(big ? 'crit' : 'hit_none', .7);
      if(big){ fx.shake = Math.max(fx.shake, 6); g.pops.push({x:mx, y:my - 46, txt:'¡CHOQUE!', t:.9, c:'#ffffff', s:13}); }
      const w = a.lose ? (b.lose ? null : b) : a;                                            // si lo ha decidido la tabla de tipos, se avisa (con el color del tipo que gana)
      if(w && (w === a ? ea : eb) > (w === a ? eb : ea)) g.pops.push({x:mx, y:my - (big ? 68 : 40), txt:'¡VENTAJA DE TIPO!', t:1, c:TC[w.type] || '#ffffff', s:10});
      break;
    }
  }
}
function clashHold(s, dt){                                           // un disparo que está empujándose con otro
  s.hold -= dt;
  const o = s.rival;
  if(!s.lose && o){ const k = CLASH.push * dt; s.x += s.vx*k; s.y += s.vy*k; o.x += s.vx*k; o.y += s.vy*k; }       // el que gana avanza y arrastra al otro
  if((s.spk = (s.spk || 0) - dt) <= 0){ s.spk = .05; fxBurst(s.x, s.y, [TC[s.type] || '#ffffff', '#ffffff'], 2, 150); }
  if(s.hold <= 0){
    s.hold = 0; s.rival = null;
    if(s.lose){ s.life = 0; fxBurst(s.x, s.y, [TC[s.type] || '#ffffff', '#ffffff'], s.r > 15 ? 16 : 8, 210); }
    else{ s.dmg *= CLASH.keep; Sfx.play('hit_super', .6); }
  }
}
// ---- GOLPE GIRATORIO (Torbellino): en vez de un golpe, el Pokémon gira un rato sobre sí mismo lanzando agua alrededor. Puede moverse mientras gira ----
// Golpea varias veces a lo que tenga dentro de su radio; el último golpe empuja. El dibujo (cuatro brazos de agua en espiral) está en js/fxnuevos.js.
const SPIN = {T: 1.1, n: 6, R: 104, dmg: .27, kb: .22, kbEnd: 1.3, chgR: 1.2, rot: 14};      // [AJUSTE] segundos que dura · golpes que da · radio · daño de cada golpe (1 = un golpe normal; 0,27 × 6 = 1,6 si entran todos) · empujón de cada golpe / del último · radio extra si va cargado · velocidad a la que gira el Pokémon
const SPIN_MOVE = {'Torbellino': 1};                                 // ataques cuerpo a cuerpo que son un giro
function spinStart(f, dmg, type, mine, nm){
  f.spin = {t: 0, T: SPIN.T, k: 0, n: SPIN.n, gap: (SPIN.T - .15) / SPIN.n, next: .12, dmg: dmg * SPIN.dmg, type, mine, nm, R: SPIN.R * (f.chg ? SPIN.chgR : 1)};
  f.cd[1] = Math.max(f.cd[1], SPIN.T + .25); setAct(f, 'Attack', SPIN.T);
}
function spinTick(f, dt){
  const s = f.spin; if(!s) return;
  if(f.dead || f.ghost || cant(f)){ f.spin = null; return; }
  s.t += dt; f.dir = dirOf(s.t * SPIN.rot);                          // gira de verdad: va pasando por sus 8 direcciones
  while(s.t >= s.next && s.k < s.n){
    s.k++; s.next += s.gap; const T = foe(s.mine), last = s.k === s.n;
    if(!T.dead && !T.ghost && Math.hypot(T.x - f.x, T.y - f.y) <= s.R + rad(T)){ f.kbK = last ? SPIN.kbEnd : SPIN.kb; hit(T, s.dmg, s.type, f, true, false, s.nm); f.kbK = 1; }
    if(last) for(const p of pilList()) if(Math.hypot(p.x - f.x, p.y - f.y) <= s.R + p.r) pilDamage(p, 1);      // al acabar también pica los pilares que pille
  }
  if(s.t >= s.T) f.spin = null;
}
// ---- SALTO (Golpe Cuerpo, Vuelo): salta fuera de la pantalla, eliges dónde caer moviéndote y aterriza golpeando en círculo ----
// Mientras está en el aire no se le puede golpear, no puede atacar ni cambiar, y pasa por encima de pilares y franjas. El rival ve la diana en el suelo y tiene que apartarse.
const JUMP = {up: .25, air: .75, down: .22, R: 92, dmg: 1.8, kb: 1.7, spd: 1.25, cd: 4};      // [AJUSTE] segundos subiendo / en el aire / cayendo · radio del golpe al caer · daño (1 = un golpe normal) · empujón · velocidad a la que te mueves en el aire · espera hasta el siguiente salto
const JUMP_MOVE = {'Golpe Cuerpo': {}, 'Vuelo': {air: 1, R: 76, dmg: 1.55, spd: 1.6}, 'Excavar': {dig: 1, up: .3, air: 1.1, down: .2, R: 84, dmg: 1.7, spd: 1.35}};        // [AJUSTE] ataques cuerpo a cuerpo que son un salto, y lo que cada uno cambia de JUMP (Vuelo: más tiempo arriba y más rápido, cae en menos sitio)
function jumpStart(f, dmg, type, mine, nm){
  const K = Object.assign({}, JUMP, JUMP_MOVE[nm]);
  f.jump = {t: 0, K, T: K.up + K.air + K.down, dmg: dmg * K.dmg, type, mine, nm, R: K.R};
  f.cd[1] = Math.max(f.cd[1], K.cd); f.inv = Math.max(f.inv || 0, .1); f.invUsed = true; f.burst = null; f.kx = f.ky = 0; setAct(f, 'Attack', K.up);
}
function jumpTick(f, dt){
  const j = f.jump; if(!j) return;
  if(f.dead || f.ghost){ f.jump = null; return; }
  j.t += dt;
  if(j.t < j.T){ f.inv = Math.max(f.inv, .05); f.invUsed = true; return; }       // en el aire: intocable (y sin el premio de esquivar con la carrera)
  f.jump = null; f.inv = 0; setAct(f, 'Attack', .3);                              // aterriza
  const T = foe(j.mine);
  if(typeof fxAdd === 'function') fxAdd('impact', '_salto', {x: f.x, y: f.y + 22, dur: 1.5, R: j.R, type: j.type});
  fx.shake = Math.max(fx.shake, 9); Sfx.play('hit', 1);
  if(!T.dead && !T.ghost && Math.hypot(T.x - f.x, T.y - f.y) <= j.R + rad(T)){ f.kbK = j.K.kb; hit(T, j.dmg, j.type, f, true, false, j.nm); f.kbK = 1; }
  for(const p of pilList()) if(Math.hypot(p.x - f.x, p.y - f.y) <= j.R + p.r) pilDamage(p, 1);
}
function burstTick(f, dt){                                           // ristra de proyectiles en marcha (SHOT_KINDS.chorro): suelta uno cada K.gap segundos, hacia donde apuntes en ese momento
  const b = f.burst; if(!b) return;
  if(f.dead || f.ghost || cant(f)){ f.burst = null; return; }
  b.t -= dt;
  while(b.t <= 0 && b.i < b.n){
    const K = b.K, j = b.i++, s = shot(f, b.ang + Math.sin(j * 2.4) * K.spread, b.dmg, K.speed * (1 + Math.sin(j * 1.7) * K.vary), K.r, b.type, b.mine);
    s.pw = K.pw; s.pd = K.pd; s.kbS = K.kb; s.sd = j; if(K.range) s.life = s.L = K.range / (K.speed * (1 + Math.sin(j * 1.7) * K.vary));      // alcance limitado: se apaga al llegar
    if(K.jet){ s.mvn = b.nm; s.jet = 1; } else fxShotStart(f, s, b.nm, false);                        // chorro: sin destello ni rayo por cada llama, solo su dibujo
    b.t += K.gap;
  }
  if(b.i >= b.n) f.burst = null;
}
function feelTick(f, dt){                                            // cada fotograma, para los dos Pokémon en combate
  if(f.inv > 0) f.inv -= dt;
  burstTick(f, dt); spinTick(f, dt); jumpTick(f, dt); psiTick(f, dt); bocaTick(f, dt); quickTick(f, dt); quakeTick(f, dt); if(f.rslow > 0) f.rslow -= dt; if(f.frz > 0) f.frz -= dt;
  if(f.ctr > 0) f.ctr -= dt;
  if(f.wind){
    if(f.dead || f.ghost) f.wind = null;
    else if(cant(f)){ f.wind = null; g.pops.push({x:f.x, y:f.y-120, txt:'¡Interrumpido!', t:1, c:'#ff9a3a', s:11}); }     // amedrentado o dormido mientras cargaba: se pierde el ataque
    else if(f.wind.hold){                                             // tú: mantienes E cargando lo que quieras (sube hasta windMax) y sale al soltar; no sale antes de la carga mínima
      f.wind.c += dt; if(f.act !== 'Charge') setAct(f, 'Charge', .2); else f.lock = .2;
      if(!f.eh && f.wind.c >= FEEL.wind) windFire(f);
    }
    else if((f.wind.t -= dt) <= 0) windFire(f);
  }
  if(f.kx || f.ky){                                                  // empujón del último golpe
    if(f.dead || f.ghost){ f.kx = f.ky = 0; f.kbHit = false; return; }
    if(!f.ride){ f.x = clamp(f.x + f.kx*dt, bx0(), bx1()); f.y = clamp(f.y + f.ky*dt, by0(), by1()); if(prOn()) prClamp(f); }
    const kd = Math.max(0, 1 - FEEL.kbDecay*dt); f.kx *= kd; f.ky *= kd;
    if(Math.abs(f.kx) + Math.abs(f.ky) < 4){ f.kx = f.ky = 0; f.kbHit = false; }
  }
}

// Sonido del golpe según la eficacia (js/music.js: hit, hit_super, hit_weak, hit_none) + chispa si es crítico + caída si se debilita
function hitSfx(mult, crit, dead){
  Sfx.play(mult === 0 ? 'hit_none' : mult >= 2 ? 'hit_super' : mult < 1 ? 'hit_weak' : 'hit');
  if(crit) Sfx.play('crit');
  if(dead) setTimeout(() => Sfx.play('faint'), 230);
}
function hit(T, dmg, type, A, close, big, mvn){       // A = quien ataca · close = golpe cuerpo a cuerpo · mvn = nombre del movimiento (solo para el efecto visual)
  if(T.dead || T.ghost) return;                       // ghost: está entrando o saliendo con la animación de cambio (swap.js): no recibe golpes
  if(T.inv > 0){ dodgeOk(T); return; }                // en plena carrera (FEEL.inv): lo esquiva
  const R = abHit(T, A, type, eff(type, T.m.types), close, big, mvn);                                     // habilidades (js/abilities.js): inmunidades, daño que haces y recibes, esquivar
  if(R.imm || R.dodge){                                                                                   // la habilidad lo ha parado
    if(!R.heal) g.pops.push({x:T.x, y:T.y-110, txt: R.dodge ? '¡Esquivó!' : 'Sin efecto', t:.9});
    Sfx.play(R.dodge ? 'dodge' : 'hit_none');
    abPop(T, (R.imm || R.dodge).toUpperCase()); fxBurst(T.x, T.y - 20, ['#ffffff', '#c8c8d4'], 6, 70); return;
  }
  const mult = R.mult * (typeof wgDmg === 'function' ? wgDmg(mvn, T, A) : 1);      // ataques de peso (js/pesos.js): Patada Baja, Hierba Lazo, Golpe Calor, Cuerpo Pesado
  const foeAtk = !g.pvp && !!(A && g.e.includes(A));                                              // (en un combate online nadie es «el rival»: no hay crítico extra)
  const scope = (A && A.item === 'periscopio') ? IFX.periscopio : 0;                                      // Periscopio: más probabilidad de crítico
  const crit = mult > 0 && !R.noCrit && Math.random() < (CRIT.chance + scope) * (big ? CRIT.big : 1) * (foeAtk ? CRIT.foe : 1);   // golpe crítico (solo si el golpe hace daño)
  let dealt = dmg * mult * (crit ? CRIT.mult * R.critMul : 1) * (T.item === 'chaleco' && !(A && A.ab === 'Infiltrador') ? .8 : 1)   // Chaleco Asalto: -20% de daño
              * R.out * R.inn * (T.vuln > 0 ? BOCA.vuln : 1)                                                                          // habilidades: daño que haces y que recibes
              / (T.defm || 1)                                                                          // resistencia por IVs/EVs/naturaleza (solo tus Pokémon)
              * (A && A.item === 'cinturon' && mult >= 2 ? IFX.cinturon : 1);                              // Cinturón de Experto: +20% si es muy eficaz
  const robusto = defAb(T, A) === 'Robustez';                                                               // Robustez: con la vida al máximo siempre aguanta (no se gasta)
  if((robusto || (T.item === 'aguante' && !T.aguanteUsado)) && dealt > 0 && T.hp >= T.max - 1e-6 && dealt >= T.hp){      // Banda Aguante: sobrevive 1 vez con 1 PS
    dealt = T.hp - 1; g.pops.push({x:T.x, y:T.y-150, txt:'¡Aguanta!', t:1.2, c:'#ff7a7a', s:12});
    if(!robusto){ T.aguanteUsado = true; if(T.ab === 'Liviano' && T.ax){ T.ax.light = true; abPop(T, 'LIVIANO', '#ffe066'); } }
  }
  T.hp -= dealt;
  if(dealt > 0 && A && A !== T){                                                                       // retroceso: el golpe empuja al que lo recibe (FEEL)
    const ka = Math.atan2(T.y - A.y, T.x - A.x), kM = A.kbCh ? FEEL.chgMax : big ? FEEL.bigMax : FEEL.kbMax, kp = A.kbCh ? FEEL.chgPush + (FEEL.chgPushMax - FEEL.chgPush) * (A.chgP || 0) : ((big ? FEEL.kbBig + (FEEL.kbBigMax - FEEL.kbBig) * (A.kbP || 0) : close ? FEEL.kbMelee * (A.kbK || 1) : FEEL.kbShot * (A.kbS || 1)) * (mult >= 2 ? 1.25 : 1) * (crit ? 1.2 : 1));
    const kw = typeof wgK === 'function' ? wgK(T, A) : 1;                                                    // peso (js/pesos.js): los pesados casi no se mueven, los ligeros vuelan
    T.kx = clamp((T.kx || 0) + Math.cos(ka)*kp*kw, -kM, kM); T.ky = clamp((T.ky || 0) + Math.sin(ka)*kp*kw, -kM, kM); T.kbHit = true;
    if(!g.pvp && typeof fxhd !== 'undefined') fxhd.stop = Math.max(fxhd.stop, crit ? .07 : close ? .03 : 0);   // congelado del golpe también en críticos y cuerpo a cuerpo (js/fxhd.js; no en online)
  }
  if(mvn === 'Vendaval' && mult > 0 && T.hp > 0) T.lift = {t0:g.t, dur:1.1};                                  // Vendaval: el rival sale levantado por los aires un momento (solo visual: fxLift en fxtipos.js)
  if(A && A.item === 'roca' && mult > 0 && T.hp > 0) abFlinch(T, A, IFX.rocaProb, IFX.rocaStun);          // Roca del Rey: amedrenta (js/abilities.js: Foco Interno, Polvo Escudo, Dicha...)
  if(A && !A.dead){
    if(A.item === 'cascabel') A.hp = Math.min(A.max, A.hp + dealt*.15);                      // Cascabel Concha
    if(close && T.item === 'casco' && dealt > 0 && A.ab !== 'Muro Mágico') A.hp = Math.max(1, A.hp - A.max*.08);      // Casco Dentado
  }
  const txt = mult===0 ? 'Sin efecto' : mult>=2 ? '¡Muy eficaz!' : mult<1 ? 'Poco eficaz' : '';
  if(txt) g.pops.push({x:T.x, y:T.y-110, txt, t:.9});
  if(crit){                                                                                           // aviso, chispas y temblor extra
    g.pops.push({x:T.x, y:T.y-132, txt:'¡CRÍTICO!', t:1.1, c:'#ff9a3a', s:13});
    fxBurst(T.x, T.y-30, ['#ffe066', '#ffffff', '#ff9a3a'], 14, 200); fx.shake = Math.max(fx.shake, 7);
  }
  fxHit(T, mvn, type, mult, big, close, A);                                                          // efecto visual del impacto
  hitSfx(mult, crit, T.hp <= 0);                                                                       // sonido del impacto
  if(T.hp <= 0){ T.hp = 0; T.dead = true; T.dt = 0; setAct(T, 'Faint', 99); if(A && A !== T) koBonus(A, T); }
  else if(mult > 0) setAct(T, 'Hurt', .3);
  abAfter(T, A, dealt, type, close, crit, big);                                                       // habilidades: efectos al contacto, venganzas, Autoestima...
}
// GOLPE CUERPO A CUERPO: alcance (además del tamaño del rival) y ángulo de acierto a cada lado de donde apuntas (en radianes; 1,3 ≈ 75°).
// Antes era 90 y 1 (≈57°): costaba mucho acertar. La IA usa el mismo alcance (ai.js) y el online también (PVP_VER sube al cambiarlo).
const MELEE = {reach:115, arc:1.3};
// ---- FORMAS DE ATAQUE: cada TIPO golpea y dispara a su manera (el tipo del golpe y el del disparo los da mtype) ----
// Forman parte del cálculo del combate (también online): si cambias un número o un reparto, sube PVP_VER (js/pvp.js). La IA las tiene en cuenta (ai.js).
// GOLPE · reach = alcance · arc = ángulo de acierto a cada lado (radianes; 3,2 = todo alrededor) · dmg = daño (1 = el de siempre) · kb = empujón · lunge = lo que avanza el que golpea
const MELEE_KINDS = {
  barrido:  {n:'Barrido',  reach:110, arc:1.9, dmg:.9,  kb:1},                    // [AJUSTE] ancho: difícil de fallar, pega algo menos
  estocada: {n:'Estocada', reach:170, arc:.6,  dmg:1.1, kb:1.1,  lunge:46},       // [AJUSTE] largo y estrecho: hay que apuntar; el Pokémon se lanza hacia delante
  giro:     {n:'Giro',     reach:100, arc:3.2, dmg:.85, kb:1.35}                  // [AJUSTE] todo alrededor: corto, pega menos y empuja más (para quitarte al rival de encima)
};
// DISPARO · speed = velocidad · r = tamaño · dmg = daño de cada proyectil · n3 + spread = cuántos salen y cuánto se abren · pw = fuerza en un choque de disparos (CLASH) · pd = lo que le quita a un pilar (PIL)
const SHOT_KINDS = {
  directo: {n:'Directo', speed:520, r:9,  dmg:1},                                  // el de siempre
  rafaga:  {n:'Ráfaga',  speed:540, r:7,  dmg:.4,  n3:3, spread:.17, pw:.5, pd:.5},              // [AJUSTE] tres pequeños en abanico: de cerca entran los tres (1,2 en total), de lejos uno
  veloz:   {n:'Veloz',   speed:780, r:6,  dmg:.95},                                // [AJUSTE] muy rápido y fino: casi no da tiempo a esquivarlo
  pesado:  {n:'Pesado',  speed:330, r:15, dmg:1.3, pw:1.5, pd:2},                                // [AJUSTE] lento, grande y fuerte
  chorro:  {n:'Chorro',  speed:430, r:7,  dmg:.15, burst:9, gap:.065, spread:.07, vary:.12, pw:.35, pd:.34, kb:.16},      // [AJUSTE] una RISTRA: burst proyectiles seguidos, uno cada gap segundos (1,35 de daño si entran todos) · spread = cuánto se abren · vary = cuánto cambia la velocidad de uno a otro · kb = empujón de cada uno
  llama:   {n:'Llama',   speed:480, r:8,  dmg:.1,  burst:16, gap:.055, spread:.09, vary:.1, pw:.3, pd:.25, kb:.1, range:250, jet:1}      // [AJUSTE] CHORRO SOSTENIDO (Lanzallamas): 16 llamas seguidas durante 0,9 s que salen de donde estés y hacia donde apuntes en cada momento (1,6 de daño si entran todas) · range = hasta dónde llega (px) · jet = se dibuja como chorro (js/fxnuevos.js)
};
const SHOT_MOVE = {'Rayo Burbuja':'chorro', 'Lanzallamas':'llama'};                                           // ataques con una forma propia, sea cual sea su tipo
const MELEE_BY = {lucha:'estocada', bicho:'estocada', volador:'estocada', veneno:'estocada', acero:'estocada', hielo:'estocada', electrico:'estocada',
                  agua:'giro', fuego:'giro', psiquico:'giro', hada:'giro', fantasma:'giro', dragon:'giro'};                       // los demás (normal, planta, tierra, roca, siniestro): barrido
const SHOT_BY = {electrico:'rafaga', bicho:'rafaga', planta:'rafaga', veneno:'rafaga', volador:'rafaga',
                 psiquico:'veloz', hielo:'veloz', acero:'veloz', hada:'veloz',
                 fuego:'pesado', fantasma:'pesado', siniestro:'pesado', lucha:'pesado', dragon:'pesado'};       // los demás (agua, roca, normal, tierra): directo
const meleeKind = f => MELEE_KINDS[MELEE_BY[mtype(f, 1)] || 'barrido'];
function shotKind(f){
  if(SHOT_MOVE[mvName(f, 2)]) return SHOT_KINDS[SHOT_MOVE[mvName(f, 2)]];
  if(typeof FXR !== 'undefined' && FXR.stream && FXR.stream[mvName(f, 2)]) return SHOT_KINDS.veloz;      // los ataques que se dibujan como un chorro o un rayo continuo siempre son veloces (en abanico se verían mal)
  return SHOT_KINDS[SHOT_BY[mtype(f, 2)] || 'directo'];
}
function melee(f, ang, dmg, type, mine, mvn){
  const K0 = meleeKind(f), K = f.chg ? Object.assign({}, K0, {reach: K0.reach + FEEL.chgReach, kb: K0.kb * FEEL.chgKb}) : K0, T = foe(mine), dx = T.x-f.x, dy = T.y-f.y;      // cargado: llega más lejos y empuja mucho más
  f.swing = {t0:g.t, k:K, ang, type, big:!!f.chg};                                             // para dibujar la forma del golpe (swingDraw, render.js)
  if(K.lunge){ f.kx = (f.kx || 0) + Math.cos(ang)*K.lunge*FEEL.kbDecay; f.ky = (f.ky || 0) + Math.sin(ang)*K.lunge*FEEL.kbDecay; }      // estocada: avanza de verdad (usa el mismo empujón que el retroceso)
  for(const p of pilList()){                                                      // el golpe también pica los pilares que pille
    let pa = Math.abs(Math.atan2(p.y - f.y, p.x - f.x) - ang); pa = Math.min(pa, 2*Math.PI - pa);
    if(Math.hypot(p.x - f.x, p.y - f.y) <= K.reach + p.r && pa < K.arc){ pilDamage(p, 1); fxBurst(p.x, p.y - 10, ['#c9ccd6', '#ffffff'], 5, 110); }
  }
  for(const s of g.shots){                                                        // el golpe CORTA los disparos del rival que pille si los supera (CLASH): fuerza 1 × eficacia de su tipo contra el del disparo
    if(s.mine === mine || s.life <= 0 || s.hold > 0) continue;
    let sa = Math.abs(Math.atan2(s.y - f.y, s.x - f.x) - ang); sa = Math.min(sa, 2*Math.PI - sa);
    if(Math.hypot(s.x - f.x, s.y - f.y) > K.reach + s.r || sa >= K.arc) continue;
    if(eff(type, [s.type]) >= shotPow(s) * eff(s.type, [type]) * CLASH.win){
      s.life = 0; fxBurst(s.x, s.y, [TC[type] || '#ffffff', TC[s.type] || '#ffffff', '#ffffff'], 10, 190); Sfx.play('hit_super', .6);
      g.pops.push({x:s.x, y:s.y - 40, txt:'¡CORTADO!', t:.9, c:TC[type] || '#ffffff', s:11});
    }
  }
  if(T.dead || T.ghost || Math.hypot(dx,dy) > K.reach + rad(T)) return;
  let d = Math.abs(Math.atan2(dy,dx) - ang); d = Math.min(d, 2*Math.PI - d);
  if(d < K.arc){ f.kbK = K.kb; f.kbCh = !!f.chg; hit(T, dmg*K.dmg, type, f, true, false, mvn); f.kbK = 1; f.kbCh = false; if(f.chg){ g.pops.push({x:T.x, y:T.y-146, txt:'¡CARGADO!', t:1, c:'#ffe04a', s:12}); if(!g.pvp && typeof fxhd !== 'undefined') fxhd.stop = Math.max(fxhd.stop, .09); } }
}
function shot(f, ang, dmg, speed, r, type, mine){
  const s = {x:f.x, y:f.y, vx:Math.cos(ang)*speed, vy:Math.sin(ang)*speed, dmg, r, type, mine, life:2, o:f, t0:g.t, acc:0};
  g.shots.push(s); return s;
}
// Tipo de cada ataque: usa los tipos del Pokémon (o los que pongas en 'mt')
function mtype(f, i){
  const m = f.m, k = {1:0, 2:1, 4:2}[i];
  return (m.mt && k !== undefined) ? m.mt[k] : (i === 2 ? (m.types[1] || m.types[0]) : m.types[0]);
}

function use(f, i, ang, mine){
  const m = MV[i], cost = enCost(f, i);                                         // enCost: Presión del rival
  if(f.dead || f.wind || f.jump || (f.ride && f.ride.free) || f.boca || f.quick || cant(f) || f.cd[i] > 0 || f.en < cost) return;                   // amedrentado (Roca del Rey) o dormido: no puede atacar
  if(i > 0 && f.truant > 0) return;                                             // Indolente: espera tras su último ataque
  f.cd[i] = m.cd; f.en -= cost; f.dir = dirOf(ang);
  if(i > 0 && statusBlock(f)) return;                                           // paralizado (a veces no puede), confuso o enamorado: se pierde el ataque
  const nm = mvName(f, i), sm = i === 3 && STATUS_MOVES[nm];                    // sm: ataque de estado (js/status.js)
  if(i > 0){ f.lastUse = i; if(f.ab === 'Indolente') f.truant = ABX.indolente; }
  if(sm && f.ab === 'Bromista') f.cd[i] *= ABX.bromistaCd;                      // Bromista: sus ataques de estado se recargan antes
  const t0 = sm ? MOVES[nm].t : (f.ab === 'Normalidad' ? 'normal' : mtype(f, i)), t = (SKIN[f.ab] && t0 === 'normal') ? SKIN[f.ab] : t0, skin = t !== t0, shotMv = (i === 2 || i === 4), it = f.item, boost = ITEMS[it] && ITEMS[it].type === t ? IFX.tipo : 1;   // objetos de tipo
  let ck = 1; if(f.ctr > 0 && (i === 1 || i === 2 || i === 4)){ ck = FEEL.ctrK; f.ctr = 0; g.pops.push({x:f.x, y:f.y-120, txt:'¡CONTRA!', t:1, c:'#7fe3ff', s:12}); }      // contraataque: acabas de esquivar y este ataque pega más
  const d = ck * f.dmg * qAtk(f) * (skin ? ABX.skin : 1) * (it === 'vidasfera' ? 1.3 : 1) * boost
          * (it === 'cintaelec' && i === 1 ? IFX.cinta : 1) * (it === 'gafaselec' && shotMv ? IFX.gafaselec : 1) * (it === 'gafasesp' && shotMv ? IFX.gafasesp : 1);
  if(f.item === 'vidasfera' && (i === 1 || i === 2 || i === 4) && f.ab !== 'Cabeza Roca' && f.ab !== 'Muro Mágico') f.hp = Math.max(1, f.hp - f.max*.025);   // Vidasfera
  const vk = g.pvp || mine ? 1 : .6;                                            // volumen del sonido al lanzar: el del rival de la Historia, más suave
  Sfx.play(i === 0 ? 'dash' : i === 1 ? 'swing' : i === 2 ? 'shot' : i === 4 ? 'buff' : sm ? 'status' : 'buff', vk);      // (el sonido de cada ataque; el del golpe lo pone hit())
  if(i === 0){ f.dash = .25; f.da = ang; f.inv = feelFoe(f) ? FEEL.invFoe : FEEL.inv; f.invUsed = false; }      // la carrera esquiva: un instante sin recibir golpes
  if(i === 1 && JUMP_MOVE[nm]) jumpStart(f, m.dmg*d*(f.chg ? FEEL.chgK + (FEEL.chgKMax - FEEL.chgK) * (f.chgP || 0) : 1)*(f.st && f.st.k === 'brn' ? STX.brn.melee : 1), t, mine, nm);      // salto (Golpe Cuerpo, Vuelo): ver JUMP
  else if(i === 1 && nm === 'Ataque Rápido') quickStart(f, ang, m.dmg*d*(f.chg ? FEEL.chgK + (FEEL.chgKMax - FEEL.chgK) * (f.chgP || 0) : 1)*(f.st && f.st.k === 'brn' ? STX.brn.melee : 1), t, mine, nm);      // salto hacia el rival: ver QUICK
  else if(i === 1 && nm === 'Tumba Rocas') rockThrow(f, ang, m.dmg*d*(f.chg ? FEEL.chgK + (FEEL.chgKMax - FEEL.chgK) * (f.chgP || 0) : 1), t, mine);      // lanza rocas: ver ROCK
  else if(i === 1 && SPIN_MOVE[nm]) spinStart(f, m.dmg*d*(f.chg ? FEEL.chgK + (FEEL.chgKMax - FEEL.chgK) * (f.chgP || 0) : 1)*(f.st && f.st.k === 'brn' ? STX.brn.melee : 1), t, mine, nm);      // golpe giratorio (Torbellino): ver SPIN
  else if(i === 1){ setAct(f,'Attack',.45); fxMelee(f, ang, foe(mine), nm, t);  melee(f, ang, m.dmg*d*(f.chg ? FEEL.chgK + (FEEL.chgKMax - FEEL.chgK) * (f.chgP || 0) : 1)*(f.st && f.st.k === 'brn' ? STX.brn.melee : 1), t, mine, nm); }   // quemado: golpe a la mitad
  if(i === 2 && shotKind(f).burst){ const K = shotKind(f); setAct(f, 'Shoot', K.burst * K.gap + .15); f.burst = {K, n:K.burst, i:0, t:0, ang, dmg:m.dmg*d*K.dmg, type:t, mine, nm}; }      // ristra (Rayo Burbuja): los proyectiles van saliendo en burstTick()
  else if(i === 2){ setAct(f,'Shoot',.4); const K = shotKind(f), n = K.n3 || 1;        // disparo: según su forma (SHOT_KINDS)
    for(let j = 0; j < n; j++){ const s = shot(f, ang + (j - (n - 1) / 2) * (K.spread || 0), m.dmg*d*K.dmg, K.speed, K.r, t, mine); if(K.pw) s.pw = K.pw; if(K.pd) s.pd = K.pd; fxShotStart(f, s, nm, false); } }
  if(sm){ setAct(f,'Shoot',.4); const s = shot(f, ang, 0, STX.speed * (f.ab === 'Bromista' ? ABX.bromista : 1), STX.r, t, mine); s.status = nm; s.pd = 0; fxShotStart(f, s, nm, false); }   // ataque de estado: proyectil sin daño
  else if(i === 3){ setAct(f,'Charge',.6);  fxBuff(f, nm, t);                  qApply(f, nm); }      // mejora: cada ataque hace lo suyo (js/qmoves.js)
  if(i === 4){ if(typeof nvBigStart === 'function') nvBigStart(f, nm, t);      // cartel del ataque (js/fxnuevos.js)
    const wt = feelFoe(f) ? FEEL.windFoe : FEEL.wind; setAct(f,'Charge', wt + .25); f.wind = {t:wt, T:wt, ang, dmg:m.dmg*d, type:t, mine, nm, vk, hold:!feelFoe(f), c:0}; }   // ataque fuerte: se carga un momento (se ve la línea en el suelo) y sale en windFire()
}

function move(f, dx, dy, dt, k){
  let boost = qSpd(f) * (f.item === 'panuelo' ? 1.35 : 1) * abSpeed(f);                  // mejora (Q) + Pañuelo + habilidad
  if(!g.pvp && g.e && g.e.includes(f)) boost = Math.min(boost, ENEMY_SPEED_BUFF_CAP);                // un rival no se hace imposible de cazar al sumar Agilidad + Pañuelo
  const l = Math.hypot(dx,dy), sp = f.m.spd * (f.spdm || 1) * boost * (f.st && f.st.k === 'par' ? STX.par.spd : 1);
  let vx = 0, vy = 0;
  if(f.boca || f.quick){ return; }                                                        // A Bocajarro: la embestida y la ráfaga lo mueven (bocaTick)
  if(f.ride && f.ride.free){                                                   // Pájaro Osado / Envite Ígneo: vas con el ataque, lo diriges con las teclas hasta golpear, chocar o hacer otro clic
    const r = f.ride; r.t -= dt;
    if(r.t <= 0 || r.s.life <= 0 || f.dead || cant(f)){ r.s.life = 0; f.ride = null; }
    else{
      if(l){ let d = Math.atan2(dy, dx) - r.a; d = Math.atan2(Math.sin(d), Math.cos(d)); r.a += clamp(d, -RIDE.turn * dt, RIDE.turn * dt); }
      r.s.vx = Math.cos(r.a) * r.sp; r.s.vy = Math.sin(r.a) * r.sp; r.s.life = Math.max(r.s.life, .5);
      r.s.x = clamp(r.s.x, bx0(), bx1()); r.s.y = clamp(r.s.y, by0(), by1());                      // no sale de la arena: la embestida se queda en la pared hasta que giras
      f.x = r.s.x - Math.cos(r.a) * 8; f.y = r.s.y - Math.sin(r.a) * 8; f.dir = dirOf(r.a); f.mv = true; return;
    }
  }
  if(f.ride){                                                                  // montado en Surf: va pegado a la ola hasta que se acaba o choca
    const r = f.ride; r.t -= dt;
    if(r.t <= 0 || r.s.life <= 0 || f.dead || cant(f)) f.ride = null;
    else{ f.x = clamp(r.s.x - Math.cos(r.a) * 8, bx0(), bx1()); f.y = clamp(r.s.y - Math.sin(r.a) * 8, by0(), by1()); if(prOn()) prClamp(f); f.mv = true; return; }
  }
  if(cant(f)){ f.mv = false; return; }                                          // amedrentado o dormido: no se mueve
  if(f.dash > 0){ vx = Math.cos(f.da)*sp*3; vy = Math.sin(f.da)*sp*3; }
  else if(l){ if(f.wind) k *= FEEL.windSlow; if(f.jump) k *= f.jump.K.spd; else if(f.tslow) k *= f.tslow; if(f.rslow > 0 && !f.jump) k *= ROCK.slow; vx = dx/l*sp*k; vy = dy/l*sp*k; }
  f.mv = l > 0 || f.dash > 0;
  f.x = clamp(f.x + vx*dt, bx0(), bx1()); f.y = clamp(f.y + vy*dt, by0(), by1()); if(prOn()) prClamp(f);      // Campo de pruebas: no sale de las líneas del estadio (js/pruebas.js)
}

function update(dt){
  if(!g){ if(fx.list.length || fx.parts.length) fxClear(); return; }
  if(g.over || g.paused) return;                              // en pausa (Esc) nada se mueve
  if(g.slowT > 0){ g.slowT -= dt; dt *= FEEL.slowK; }         // remate final a cámara lenta (FEEL)
  g.t += dt;
  if(g.count > 0){ g.count -= dt; return; }
  if(g.mega){ megaTick(dt); return; }                        // megaevolución en marcha (js/mega.js): el combate se detiene hasta que acaba la animación
  g.clock += dt;
  pilTick(dt);                                               // pilares que caen y se rompen (PIL)
  terrAge(dt);                                               // zonas de terreno que se van gastando (TERR)
  const P = g.p[g.pi], E = g.e[g.ei];
  megaHint(g.pvp ? myMon() : P);                             // aviso «MEGAEVOLUCIÓN LISTA»

  if(g.pvp){ pvpControl(P, 'p', dt); pvpControl(E, 'e', dt); }          // combate online: cada bando lo mueven las pulsaciones de su jugador (js/pvp.js)
  else{
  if(!P.dead && !P.ghost){                       // ghost = en pleno cambio de Pokémon: sin controles hasta que termine la animación
    const dx = (ctlHeld('right')?1:0) - (ctlHeld('left')?1:0);            // teclas configurables (Ajustes › Controles, js/controls.js)
    const dy = (ctlHeld('down')?1:0) - (ctlHeld('up')?1:0);
    const mw = typeof mouseWorld === 'function' ? mouseWorld() : mouse, aim = Math.atan2(mw.y-P.y, mw.x-P.x);   // mouseWorld: en el Campo de pruebas el ratón va en la pantalla y el campo está reducido (js/pruebas.js)
    move(P, dx, dy, dt, 1); P.dir = dirOf(aim); if(P.burst) P.burst.ang = aim; if(P.wind) P.wind.ang = aim;      // mientras cargas el ataque fuerte sigues apuntando
    if(P.ride && P.ride.free){ if(rideStop(P, ctlHeld('melee'), ctlHeld('shot'), ctlHeld('strong'))){ P.mh = false; P.mc = 0; P.eh = false; } }      // en plena embestida: solo se oye «otro clic = parar»
    else{
    if(!psiCtl(P, ctlHeld('melee'), mw.x, mw.y))             // con un rival atrapado por Psíquico, el clic lo lanza hacia el ratón
    meleeInput(P, ctlHeld('melee'), aim, true, dt);          // golpe normal al pulsar; cargado si lo mantienes
    if(ctlHeld('shot')) use(P,2,aim,true);
    if(ctlHeld('dash')) use(P,0, (dx||dy) ? Math.atan2(dy,dx) : aim, true);
    if(ctlHeld('buff')) use(P,3,aim,true);
    P.eh = ctlHeld('strong'); if(P.eh) use(P,4,aim,true);
    }
  }
  if(!E.dead && !E.ghost){ if(aiSmart()) enemyAI(E, P, dt); else enemyBasic(E, P, dt); megaAI(E, dt); }
  }       // IA del rival (js/ai.js): estilo de combate, distancias, esquiva y uso inteligente de Q/E (no actúa mientras su Pokémon entra con la animación de cambio)
  for(const f of [P,E]){                         // tiempos de cada uno
    for(let i=0;i<5;i++) f.cd[i] = Math.max(0, f.cd[i]-dt);
    if(f.item === 'restos' && !f.dead) f.hp = Math.min(f.max, f.hp + f.max*IFX.restos*dt);   // Restos (IFX.restos en data.js)
    if(f.dash > 0 && !f.dead && (f.fxd = (f.fxd || 0) - dt) <= 0){ f.fxd = .045; fxDust(f); }          // polvo al correr
    if(f.stun > 0) f.stun -= dt;
    f.en = Math.min(100, f.en + EN_REGEN*dt); f.buff -= dt; f.dash -= dt; f.at += dt; f.lock -= dt;
    if(!f.dead && f.lock <= 0){ const w = f.mv ? 'Walk' : 'Idle'; if(f.act !== w){ f.act = w; f.at = 0; } }
    feelTick(f, dt);                             // esquiva, carga del ataque fuerte y retroceso (FEEL)
    if(!f.dead && !f.ghost && !f.jump) pilPush(f);          // pilares: no se atraviesan
    terrTick(f, dt);                             // terreno: brasas, hielo, charco...
    statusTick(f, dt);                           // estados (js/status.js)
    abTick(f, dt);                               // habilidades (js/abilities.js): clima, Mudar, Impulso...
  }
  if(g.wx){ g.wx.t -= dt; if(g.wx.t <= 0) g.wx = null; }     // el clima dura ABX.climaDur segundos
  statusBench();                                 // quien espera en el banquillo no conserva estados
  const PL = pilList();
  spkTick(dt);                                   // rocas que salen del suelo (Roca Afilada)
  shotClash();                                   // disparos tuyos y del rival que se encuentran (CLASH)
  for(const s of g.shots){                       // proyectiles
    if(s.hold > 0){ clashHold(s, dt); continue; }                                          // empujándose con otro disparo: no avanza ni golpea
    s.x += s.vx*dt; s.y += s.vy*dt; s.life -= dt;
    if(s.r > 15 && !s.status) terrTrail(s);                                               // el ataque fuerte deja su rastro de terreno por donde pasa (TERR)
    for(const p of PL) if(s.life > 0 && !p.gone && Math.hypot(s.x - p.x, s.y - p.y) < p.r + s.r * .7){       // choca con un pilar
      if(s.r > 15){ pilBreak(p); s.dmg *= .75; }                                           // el ataque fuerte lo revienta y sigue (algo más flojo)
      else{ s.life = 0; fxBurst(s.x, s.y, ['#c9ccd6', '#ffffff', TC[s.type] || '#ffffff'], 7, 110); Sfx.play('hit_none', .5); pilDamage(p, s.pd === undefined ? 1 : s.pd); }
    }
    const T = foe(s.mine);
    if(s.life > 0 && !s.dg && !T.dead && !T.ghost && Math.hypot(s.x-T.x, s.y-T.y) < rad(T) + s.r * abShotK(s, T)){
      if(T.inv > 0){ s.dg = true; dodgeOk(T); }                                  // esquivado con la carrera: el disparo pasa de largo y ya no puede darle
      else{ if(s.status) statusShotHit(T, s); else{ if(s.o){ s.o.kbP = s.kbP || 0; s.o.kbS = s.kbS || 1; } const hp0 = T.hp; hit(T, s.dmg, s.type, s.o, false, s.r > 15, s.mvn); if(s.o){ s.o.kbP = 0; s.o.kbS = 1; } if(s.mvn === 'Psíquico' && T.hp < hp0 && T.hp > 0) psiGrab(s.o, T, s.mine); if(s.slow && T.hp < hp0 && T.hp > 0){ T.rslow = ROCK.t; g.pops.push({x: T.x, y: T.y - 150, txt: 'LENTO', t: 1, c: '#c9b28a', s: 10}); } if(s.gust && T.hp < hp0 && T.hp > 0) gustHit(T, s); if(s.edge && T.hp < hp0 && T.hp > 0) stoneHit(T, s); } s.life = 0; }
    }
    if(s.x < bx0() - 50 || s.x > bx1() + 50 || s.y < by0() - 140 || s.y > by1() + 110) s.life = 0;      // sale del campo (con el campo normal: 0 … W y 0 … H)
  }
  g.shots = g.shots.filter(s => s.life > 0);
  g.pops.forEach(p => p.t -= dt); g.pops = g.pops.filter(p => p.t > 0);
  fxUpdate(dt);
  swapUpdate(dt);                                // animación de cambio de Pokémon (swap.js)
  if(g.swGrace > 0) g.swGrace = Math.max(0, g.swGrace - dt);        // margen del rival tras tu cambio (AI_SWAP.grace, ai.js)
  if(g.swCd > 0) g.swCd = Math.max(0, g.swCd - dt);                  // espera entre cambios (SWITCH_CD)
  if(g.swCdE > 0) g.swCdE = Math.max(0, g.swCdE - dt);               // lo mismo para el bando 'e' (solo combates online)
  if(g.swNote > 0) g.swNote -= dt;

  if(E.dead){ E.dt += dt; if(E.dt > 1){ const n = g.e.findIndex(f=>!f.dead); if(n<0) return endBattle(true);  swapStart('e', n, true); } }
  if(P.dead){ P.dt += dt; if(P.dt > 1){ const n = g.p.findIndex(f=>!f.dead); if(n<0) return endBattle(false); swapStart('p', n, true); } }
}

const SWITCH_CD = 5;                              // segundos de espera entre un cambio tuyo y el siguiente (empieza a contar cuando el nuevo Pokémon ya ha salido)
function switchMon(i){                            // cambio VOLUNTARIO (teclas 1 2 3 · R · clic en los cuadritos del HUD). El cambio por debilitamiento no pasa por aquí.
  if(!g || g.over || g.paused || g.count > 0) return;
  if(g.pvp){ if(i !== undefined) pvpEvent('sw', i); return; }       // combate online: el cambio se manda como pulsación y lo hacen los dos a la vez (js/pvp.js)
  if(i === undefined){ for(let k=1;k<=3;k++){ const j=(g.pi+k)%3; if(!g.p[j].dead){ i=j; break; } } }
  if(i===undefined || g.p[i].dead || i===g.pi || g.p[g.pi].dead || g.p[g.pi].jump) return;      // (en pleno salto no se puede cambiar)
  if(swapBusy()) return;                          // ya hay un cambio en marcha: no se empieza otro hasta que acabe la animación
  const trap = abTrapped(g.p[g.pi], g.e[g.ei]);   // Sombra Trampa · Trampa Arena · Imán del rival
  if(trap){ const P = g.p[g.pi]; g.pops.push({x:P.x, y:P.y - 150, txt:'¡' + trap.toUpperCase() + ': no puedes cambiar!', t:1.4, c:'#ff9a3a', s:10}); return; }
  if(g.swCd > 0){ g.swNote = 1.6; return; }       // aún en espera: se avisa en el HUD ("ESPERA 3 s") y no se cambia
  swapStart('p', i, false).vol = true;            // la animación (swap.js) hace el cambio: retirada, lanzamiento y apertura · vol = voluntario: al acabar empieza la espera de SWITCH_CD
}
