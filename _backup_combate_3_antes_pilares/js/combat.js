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
  kbMelee: 360, kbShot: 160, kbBig: 560,      // [AJUSTE] empujón al recibir un golpe / un disparo / un ataque fuerte (px por segundo; se frena solo)
  kbDecay: 9, kbMax: 700,                     // [AJUSTE] lo rápido que se frena el empujón y su tope
  inv: .22, invFoe: .13,                      // [AJUSTE] segundos de invulnerabilidad al empezar la carrera (tú y el online / el rival de la IA)
  dodgeEn: 15, dodgeCd: 1,                    // [AJUSTE] premio por esquivar un ataque con la carrera: energía que recuperas y segundos que se le quitan a la espera de la carrera
  wind: .38, windFoe: .5, windLock: .4,       // [AJUSTE] carga del ataque fuerte antes de salir (tú y el online / el rival de la IA) · la IA deja de apuntar cuando queda este tramo (0,4 = el último 40 %)
  windSlow: .35                               // [AJUSTE] velocidad al andar mientras cargas el ataque fuerte (0,35 = 35 %)
};
const feelFoe = f => !g.pvp && g.e.includes(f);                      // ¿es un rival movido por la IA?
function dodgeOk(T){                                                 // ha esquivado un ataque con la carrera: aviso y premio (una vez por carrera)
  if(T.invUsed) return; T.invUsed = true;
  T.en = Math.min(100, T.en + FEEL.dodgeEn); T.cd[0] = Math.max(0, T.cd[0] - FEEL.dodgeCd);
  g.pops.push({x:T.x, y:T.y-120, txt:'¡ESQUIVA!', t:1, c:'#7fe3ff', s:12});
  Sfx.play('dodge'); fxBurst(T.x, T.y - 20, ['#7fe3ff', '#ffffff'], 8, 120);
}
function windFire(f){                                                // el ataque fuerte sale al acabar la carga
  const w = f.wind; f.wind = null; f.dir = dirOf(w.ang);
  Sfx.play('strong', w.vk);
  const s4 = shot(f, w.ang, w.dmg, 380, 22, w.type, w.mine); fxShotStart(f, s4, w.nm, true);
  if(w.nm === 'Surf') f.ride = {s:s4, a:w.ang, t:1.4}; else if(w.nm === 'Envite Ígneo' || w.nm === 'Pájaro Osado') f.ride = {s:s4, a:w.ang, t:1.2};   // Surf: el Pokémon se monta en la ola y viaja con ella
}
function feelTick(f, dt){                                            // cada fotograma, para los dos Pokémon en combate
  if(f.inv > 0) f.inv -= dt;
  if(f.wind){
    if(f.dead || f.ghost) f.wind = null;
    else if(cant(f)){ f.wind = null; g.pops.push({x:f.x, y:f.y-120, txt:'¡Interrumpido!', t:1, c:'#ff9a3a', s:11}); }     // amedrentado o dormido mientras cargaba: se pierde el ataque
    else if((f.wind.t -= dt) <= 0) windFire(f);
  }
  if(f.kx || f.ky){                                                  // empujón del último golpe
    if(f.dead || f.ghost){ f.kx = f.ky = 0; return; }
    if(!f.ride){ f.x = clamp(f.x + f.kx*dt, 50, W-50); f.y = clamp(f.y + f.ky*dt, 140, H-110); if(prOn()) prClamp(f); }
    const kd = Math.max(0, 1 - FEEL.kbDecay*dt); f.kx *= kd; f.ky *= kd;
    if(Math.abs(f.kx) + Math.abs(f.ky) < 4) f.kx = f.ky = 0;
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
  const mult = R.mult;
  const foeAtk = !g.pvp && !!(A && g.e.includes(A));                                              // (en un combate online nadie es «el rival»: no hay crítico extra)
  const scope = (A && A.item === 'periscopio') ? IFX.periscopio : 0;                                      // Periscopio: más probabilidad de crítico
  const crit = mult > 0 && !R.noCrit && Math.random() < (CRIT.chance + scope) * (big ? CRIT.big : 1) * (foeAtk ? CRIT.foe : 1);   // golpe crítico (solo si el golpe hace daño)
  let dealt = dmg * mult * (crit ? CRIT.mult * R.critMul : 1) * (T.item === 'chaleco' && !(A && A.ab === 'Infiltrador') ? .8 : 1)   // Chaleco Asalto: -20% de daño
              * R.out * R.inn                                                                          // habilidades: daño que haces y que recibes
              / (T.defm || 1)                                                                          // resistencia por IVs/EVs/naturaleza (solo tus Pokémon)
              * (A && A.item === 'cinturon' && mult >= 2 ? IFX.cinturon : 1);                              // Cinturón de Experto: +20% si es muy eficaz
  const robusto = defAb(T, A) === 'Robustez';                                                               // Robustez: con la vida al máximo siempre aguanta (no se gasta)
  if((robusto || (T.item === 'aguante' && !T.aguanteUsado)) && dealt > 0 && T.hp >= T.max - 1e-6 && dealt >= T.hp){      // Banda Aguante: sobrevive 1 vez con 1 PS
    dealt = T.hp - 1; g.pops.push({x:T.x, y:T.y-150, txt:'¡Aguanta!', t:1.2, c:'#ff7a7a', s:12});
    if(!robusto){ T.aguanteUsado = true; if(T.ab === 'Liviano' && T.ax){ T.ax.light = true; abPop(T, 'LIVIANO', '#ffe066'); } }
  }
  T.hp -= dealt;
  if(dealt > 0 && A && A !== T){                                                                       // retroceso: el golpe empuja al que lo recibe (FEEL)
    const ka = Math.atan2(T.y - A.y, T.x - A.x), kp = (big ? FEEL.kbBig : close ? FEEL.kbMelee * (A.kbK || 1) : FEEL.kbShot) * (mult >= 2 ? 1.25 : 1) * (crit ? 1.2 : 1);
    T.kx = clamp((T.kx || 0) + Math.cos(ka)*kp, -FEEL.kbMax, FEEL.kbMax); T.ky = clamp((T.ky || 0) + Math.sin(ka)*kp, -FEEL.kbMax, FEEL.kbMax);
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
  if(T.hp <= 0){ T.hp = 0; T.dead = true; T.dt = 0; setAct(T, 'Faint', 99); }
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
// DISPARO · speed = velocidad · r = tamaño · dmg = daño de cada proyectil · n3 + spread = cuántos salen y cuánto se abren
const SHOT_KINDS = {
  directo: {n:'Directo', speed:520, r:9,  dmg:1},                                  // el de siempre
  rafaga:  {n:'Ráfaga',  speed:540, r:7,  dmg:.4,  n3:3, spread:.17},              // [AJUSTE] tres pequeños en abanico: de cerca entran los tres (1,2 en total), de lejos uno
  veloz:   {n:'Veloz',   speed:780, r:6,  dmg:.95},                                // [AJUSTE] muy rápido y fino: casi no da tiempo a esquivarlo
  pesado:  {n:'Pesado',  speed:330, r:15, dmg:1.3}                                 // [AJUSTE] lento, grande y fuerte
};
const MELEE_BY = {lucha:'estocada', bicho:'estocada', volador:'estocada', veneno:'estocada', acero:'estocada', hielo:'estocada', electrico:'estocada',
                  agua:'giro', fuego:'giro', psiquico:'giro', hada:'giro', fantasma:'giro', dragon:'giro'};                       // los demás (normal, planta, tierra, roca, siniestro): barrido
const SHOT_BY = {electrico:'rafaga', bicho:'rafaga', planta:'rafaga', veneno:'rafaga', volador:'rafaga',
                 psiquico:'veloz', hielo:'veloz', acero:'veloz', hada:'veloz',
                 fuego:'pesado', fantasma:'pesado', siniestro:'pesado', lucha:'pesado', dragon:'pesado'};       // los demás (agua, roca, normal, tierra): directo
const meleeKind = f => MELEE_KINDS[MELEE_BY[mtype(f, 1)] || 'barrido'];
function shotKind(f){
  if(typeof FXR !== 'undefined' && FXR.stream && FXR.stream[mvName(f, 2)]) return SHOT_KINDS.veloz;      // los ataques que se dibujan como un chorro o un rayo continuo siempre son veloces (en abanico se verían mal)
  return SHOT_KINDS[SHOT_BY[mtype(f, 2)] || 'directo'];
}
function melee(f, ang, dmg, type, mine, mvn){
  const K = meleeKind(f), T = foe(mine), dx = T.x-f.x, dy = T.y-f.y;
  f.swing = {t0:g.t, k:K, ang, type};                                             // para dibujar la forma del golpe (swingDraw, render.js)
  if(K.lunge){ f.kx = (f.kx || 0) + Math.cos(ang)*K.lunge*FEEL.kbDecay; f.ky = (f.ky || 0) + Math.sin(ang)*K.lunge*FEEL.kbDecay; }      // estocada: avanza de verdad (usa el mismo empujón que el retroceso)
  if(T.dead || T.ghost || Math.hypot(dx,dy) > K.reach + rad(T)) return;
  let d = Math.abs(Math.atan2(dy,dx) - ang); d = Math.min(d, 2*Math.PI - d);
  if(d < K.arc){ f.kbK = K.kb; hit(T, dmg*K.dmg, type, f, true, false, mvn); f.kbK = 1; }
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
  if(f.dead || f.wind || cant(f) || f.cd[i] > 0 || f.en < cost) return;                   // amedrentado (Roca del Rey) o dormido: no puede atacar
  if(i > 0 && f.truant > 0) return;                                             // Indolente: espera tras su último ataque
  f.cd[i] = m.cd; f.en -= cost; f.dir = dirOf(ang);
  if(i > 0 && statusBlock(f)) return;                                           // paralizado (a veces no puede), confuso o enamorado: se pierde el ataque
  const nm = mvName(f, i), sm = i === 3 && STATUS_MOVES[nm];                    // sm: ataque de estado (js/status.js)
  if(i > 0){ f.lastUse = i; if(f.ab === 'Indolente') f.truant = ABX.indolente; }
  if(sm && f.ab === 'Bromista') f.cd[i] *= ABX.bromistaCd;                      // Bromista: sus ataques de estado se recargan antes
  const t0 = sm ? MOVES[nm].t : (f.ab === 'Normalidad' ? 'normal' : mtype(f, i)), t = (SKIN[f.ab] && t0 === 'normal') ? SKIN[f.ab] : t0, skin = t !== t0, shotMv = (i === 2 || i === 4), it = f.item, boost = ITEMS[it] && ITEMS[it].type === t ? IFX.tipo : 1;   // objetos de tipo
  const d = f.dmg * qAtk(f) * (skin ? ABX.skin : 1) * (it === 'vidasfera' ? 1.3 : 1) * boost
          * (it === 'cintaelec' && i === 1 ? IFX.cinta : 1) * (it === 'gafaselec' && shotMv ? IFX.gafaselec : 1) * (it === 'gafasesp' && shotMv ? IFX.gafasesp : 1);
  if(f.item === 'vidasfera' && (i === 1 || i === 2 || i === 4) && f.ab !== 'Cabeza Roca' && f.ab !== 'Muro Mágico') f.hp = Math.max(1, f.hp - f.max*.025);   // Vidasfera
  const vk = g.pvp || mine ? 1 : .6;                                            // volumen del sonido al lanzar: el del rival de la Historia, más suave
  Sfx.play(i === 0 ? 'dash' : i === 1 ? 'swing' : i === 2 ? 'shot' : i === 4 ? 'buff' : sm ? 'status' : 'buff', vk);      // (el sonido de cada ataque; el del golpe lo pone hit())
  if(i === 0){ f.dash = .25; f.da = ang; f.inv = feelFoe(f) ? FEEL.invFoe : FEEL.inv; f.invUsed = false; }      // la carrera esquiva: un instante sin recibir golpes
  if(i === 1){ setAct(f,'Attack',.45); fxMelee(f, ang, foe(mine), nm, t);  melee(f, ang, m.dmg*d*(f.st && f.st.k === 'brn' ? STX.brn.melee : 1), t, mine, nm); }   // quemado: golpe a la mitad
  if(i === 2){ setAct(f,'Shoot',.4); const K = shotKind(f), n = K.n3 || 1;        // disparo: según su forma (SHOT_KINDS)
    for(let j = 0; j < n; j++){ const s = shot(f, ang + (j - (n - 1) / 2) * (K.spread || 0), m.dmg*d*K.dmg, K.speed, K.r, t, mine); fxShotStart(f, s, nm, false); } }
  if(sm){ setAct(f,'Shoot',.4); const s = shot(f, ang, 0, STX.speed * (f.ab === 'Bromista' ? ABX.bromista : 1), STX.r, t, mine); s.status = nm; fxShotStart(f, s, nm, false); }   // ataque de estado: proyectil sin daño
  else if(i === 3){ setAct(f,'Charge',.6);  fxBuff(f, nm, t);                  qApply(f, nm); }      // mejora: cada ataque hace lo suyo (js/qmoves.js)
  if(i === 4){ const wt = feelFoe(f) ? FEEL.windFoe : FEEL.wind; setAct(f,'Charge', wt + .25); f.wind = {t:wt, T:wt, ang, dmg:m.dmg*d, type:t, mine, nm, vk}; }   // ataque fuerte: se carga un momento (se ve la línea en el suelo) y sale en windFire()
}

function move(f, dx, dy, dt, k){
  let boost = qSpd(f) * (f.item === 'panuelo' ? 1.35 : 1) * abSpeed(f);                  // mejora (Q) + Pañuelo + habilidad
  if(!g.pvp && g.e && g.e.includes(f)) boost = Math.min(boost, ENEMY_SPEED_BUFF_CAP);                // un rival no se hace imposible de cazar al sumar Agilidad + Pañuelo
  const l = Math.hypot(dx,dy), sp = f.m.spd * (f.spdm || 1) * boost * (f.st && f.st.k === 'par' ? STX.par.spd : 1);
  let vx = 0, vy = 0;
  if(f.ride){                                                                  // montado en Surf: va pegado a la ola hasta que se acaba o choca
    const r = f.ride; r.t -= dt;
    if(r.t <= 0 || r.s.life <= 0 || f.dead || cant(f)) f.ride = null;
    else{ f.x = clamp(r.s.x - Math.cos(r.a) * 8, 50, W-50); f.y = clamp(r.s.y - Math.sin(r.a) * 8, 140, H-110); if(prOn()) prClamp(f); f.mv = true; return; }
  }
  if(cant(f)){ f.mv = false; return; }                                          // amedrentado o dormido: no se mueve
  if(f.dash > 0){ vx = Math.cos(f.da)*sp*3; vy = Math.sin(f.da)*sp*3; }
  else if(l){ if(f.wind) k *= FEEL.windSlow; vx = dx/l*sp*k; vy = dy/l*sp*k; }
  f.mv = l > 0 || f.dash > 0;
  f.x = clamp(f.x + vx*dt, 50, W-50); f.y = clamp(f.y + vy*dt, 140, H-110); if(prOn()) prClamp(f);      // Campo de pruebas: no sale de las líneas del estadio (js/pruebas.js)
}

function update(dt){
  if(!g){ if(fx.list.length || fx.parts.length) fxClear(); return; }
  if(g.over || g.paused) return;                              // en pausa (Esc) nada se mueve
  g.t += dt;
  if(g.count > 0){ g.count -= dt; return; }
  if(g.mega){ megaTick(dt); return; }                        // megaevolución en marcha (js/mega.js): el combate se detiene hasta que acaba la animación
  g.clock += dt;
  const P = g.p[g.pi], E = g.e[g.ei];
  megaHint(g.pvp ? myMon() : P);                             // aviso «MEGAEVOLUCIÓN LISTA»

  if(g.pvp){ pvpControl(P, 'p', dt); pvpControl(E, 'e', dt); }          // combate online: cada bando lo mueven las pulsaciones de su jugador (js/pvp.js)
  else{
  if(!P.dead && !P.ghost){                       // ghost = en pleno cambio de Pokémon: sin controles hasta que termine la animación
    const dx = (ctlHeld('right')?1:0) - (ctlHeld('left')?1:0);            // teclas configurables (Ajustes › Controles, js/controls.js)
    const dy = (ctlHeld('down')?1:0) - (ctlHeld('up')?1:0);
    const mw = typeof mouseWorld === 'function' ? mouseWorld() : mouse, aim = Math.atan2(mw.y-P.y, mw.x-P.x);   // mouseWorld: en el Campo de pruebas el ratón va en la pantalla y el campo está reducido (js/pruebas.js)
    move(P, dx, dy, dt, 1); P.dir = dirOf(aim); if(P.wind) P.wind.ang = aim;      // mientras cargas el ataque fuerte sigues apuntando
    if(ctlHeld('melee')) use(P,1,aim,true);
    if(ctlHeld('shot')) use(P,2,aim,true);
    if(ctlHeld('dash')) use(P,0, (dx||dy) ? Math.atan2(dy,dx) : aim, true);
    if(ctlHeld('buff')) use(P,3,aim,true);
    if(ctlHeld('strong')) use(P,4,aim,true);
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
    statusTick(f, dt);                           // estados (js/status.js)
    abTick(f, dt);                               // habilidades (js/abilities.js): clima, Mudar, Impulso...
  }
  if(g.wx){ g.wx.t -= dt; if(g.wx.t <= 0) g.wx = null; }     // el clima dura ABX.climaDur segundos
  statusBench();                                 // quien espera en el banquillo no conserva estados
  for(const s of g.shots){                       // proyectiles
    s.x += s.vx*dt; s.y += s.vy*dt; s.life -= dt;
    const T = foe(s.mine);
    if(!s.dg && !T.dead && !T.ghost && Math.hypot(s.x-T.x, s.y-T.y) < rad(T) + s.r * abShotK(s, T)){
      if(T.inv > 0){ s.dg = true; dodgeOk(T); }                                  // esquivado con la carrera: el disparo pasa de largo y ya no puede darle
      else{ if(s.status) statusShotHit(T, s); else hit(T, s.dmg, s.type, s.o, false, s.r > 15, s.mvn); s.life = 0; }
    }
    if(s.x<0 || s.x>W || s.y<0 || s.y>H) s.life = 0;
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
  if(i===undefined || g.p[i].dead || i===g.pi || g.p[g.pi].dead) return;
  if(swapBusy()) return;                          // ya hay un cambio en marcha: no se empieza otro hasta que acabe la animación
  const trap = abTrapped(g.p[g.pi], g.e[g.ei]);   // Sombra Trampa · Trampa Arena · Imán del rival
  if(trap){ const P = g.p[g.pi]; g.pops.push({x:P.x, y:P.y - 150, txt:'¡' + trap.toUpperCase() + ': no puedes cambiar!', t:1.4, c:'#ff9a3a', s:10}); return; }
  if(g.swCd > 0){ g.swNote = 1.6; return; }       // aún en espera: se avisa en el HUD ("ESPERA 3 s") y no se cambia
  swapStart('p', i, false).vol = true;            // la animación (swap.js) hace el cambio: retirada, lanzamiento y apertura · vol = voluntario: al acabar empieza la espera de SWITCH_CD
}
