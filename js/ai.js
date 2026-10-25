"use strict";
/* =====================================================================
   4b) IA DEL RIVAL (la llama update() de combat.js en cada fotograma)
   Qué hace (antes todos los rivales se movían y atacaban igual):
   - ESTILO de combate según el Pokémon: 'melee' (pegador: se pega a ti y usa el golpe), 'range' (tirador: mantiene la distancia y dispara)
     o 'hybrid' (mixto). Se decide con sus estadísticas base (Ataque contra Ataque Esp.) y el objeto que lleva (aiStyle).
   - Solo ataca cuando tiene sentido: el golpe cuerpo a cuerpo solo si estás a su alcance REAL (el mismo que usa melee() en combat.js);
     el disparo solo si estás lejos de ese alcance; la carrera para acercarse (pegador), para huir (tirador) o para esquivar un disparo tuyo.
   - Apunta con ventaja: dispara hacia donde vas a estar, no hacia donde estás (con más precisión cuanto mayor es el nivel de habilidad del combate).
   - Esquiva tus proyectiles con una carrera lateral si ve que le van a dar, y no se queda atrapado en las esquinas.
   - Gasta la energía con cabeza: no malgasta el ataque fuerte (E) ni la mejora (Q); la mejora la usa al entrar en combate.
   - La habilidad de cada combate (g.o.skill, ver DIFF en data.js) controla lo rápido que reacciona, cuánto esquiva y cuánto falla al apuntar.
   Solo la usan los jefes de la Historia (líderes, Alto Mando y Campeón; ver aiSmart). Los demás rivales usan enemyBasic (la IA sencilla de siempre).
   Para retocar la dificultad de la IA: los números marcados como [AJUSTE] de abajo.
   ===================================================================== */
const AI_TUNE = {
  on: true,                                                // [AJUSTE] interruptor: false = TODOS los rivales usan la IA sencilla de siempre (enemyBasic)
  agg: {lider: .8, alto: 1.2, campeon: 1.8}               // [AJUSTE] agresividad por tipo de rival: más alto = ataca antes y más seguido (1 = valor base)
};
// La IA con cabeza (enemyAI) solo la usan los jefes de la Historia: líderes, Alto Mando y Campeón (g.o.boss). Los demás rivales (Campo de Entrenamiento…) usan enemyBasic.
// Cuando CAMBIAS de Pokémon (js/swap.js) o el tuyo se DEBILITA, el rival no se te echa encima: se aleja mientras dura la animación y, cuando el cambio ya está completo, espera un momento antes de volver a atacar.
const AI_SWAP = {
  back: 430,                                               // [AJUSTE] distancia a la que se aparta mientras cambias (más alto = se aleja más)
  grace: .7                                                // [AJUSTE] segundos que tarda en poder atacar DESPUÉS de que tu nuevo Pokémon ya ha salido (0 = ataca en cuanto sale)
};
function aiRetreat(E, P, dt){                              // aléjate del jugador (o rodea hacia el centro si estás en una esquina)
  const ang = Math.atan2(P.y - E.y, P.x - E.x), dist = Math.hypot(P.x - E.x, P.y - E.y);
  let ax = -Math.cos(ang), ay = -Math.sin(ang), k = .9;
  if(E.x < 110 || E.x > W - 110 || E.y < 190 || E.y > H - 140){
    const px = Math.cos(ang + 1.57), py = Math.sin(ang + 1.57), sg = (px*(W/2 - E.x) + py*(H/2 - E.y)) >= 0 ? 1 : -1; ax = px*sg; ay = py*sg;
  }
  else if(dist >= AI_SWAP.back){ ax = Math.cos(ang + 1.57) * Math.sign(Math.sin(g.t*.8) || 1); ay = Math.sin(ang + 1.57) * Math.sign(Math.sin(g.t*.8) || 1); k = .25; }   // ya está lejos: solo da vueltas despacio
  move(E, ax, ay, dt, k);
  E.dir = dirOf(ang);
}
const aiAway = P => !!(P.ghost || P.dead);                  // tu Pokémon está cambiando O acaba de debilitarse: el rival se aparta
const aiNoAtk = P => !!(P.ghost || P.dead || (g.swGrace > 0));        // no ataca mientras cambias, mientras caes ni justo después
const aiSmart = () => !!(AI_TUNE.on && g.o.boss && AI_TUNE.agg[g.o.boss]);
// La IA sencilla de siempre: se acerca o se aleja, dispara y golpea al azar
function enemyBasic(E, P, dt){
  if(aiAway(P)) return aiRetreat(E, P, dt);                    // estás cambiando de Pokémon o te has debilitado: se aparta y no ataca
  const sk = g.o.skill, ang = Math.atan2(P.y-E.y, P.x-E.x), dist = Math.hypot(P.x-E.x, P.y-E.y);
  const want = dist > 240 ? 1 : dist < 140 ? -1 : 0, side = Math.sin(g.t*1.2 + g.ei*2);
  move(E, Math.cos(ang)*want + Math.cos(ang+1.57)*side, Math.sin(ang)*want + Math.sin(ang+1.57)*side, dt, .5 + .4*sk);
  E.dir = dirOf(ang);
  const err = (1-sk)*.6*(Math.random()-.5), r = Math.random;
  if(!aiNoAtk(P)){                             // tras el cambio espera un momento (AI_SWAP.grace) antes de atacar
    if(dist < 120 && r() < dt*6) use(E,1,ang,false);
    else if(r() < dt*(1+3*sk)) use(E,2,ang+err,false);
    if(r() < dt*.5*sk) use(E,4,ang+err,false);
    if(r() < dt*.25*sk) use(E,3,ang,false);
    if(r() < dt*.3*sk) use(E,0,ang+1.57,false);
  }
}
const aiReach = T => 90 + rad(T);                          // alcance real del golpe cuerpo a cuerpo (igual que en melee(), combat.js)

function aiStyle(E){
  if(E.style) return E.style;
  const b = E.m.base || {atk:100, spa:100};
  let sc = b.atk - b.spa;                                  // + = físico (cuerpo a cuerpo) · − = especial (a distancia)
  if(E.item === 'cintaelec') sc += 30;                     // Cinta Elección: sus golpes cuerpo a cuerpo pegan más
  if(E.item === 'gafaselec' || E.item === 'gafasesp') sc -= 30;   // Gafas: sus disparos pegan más
  E.style = sc > 14 ? 'melee' : sc < -14 ? 'range' : 'hybrid';
  return E.style;
}

// ¿Algún proyectil tuyo va a darle? Devuelve el ángulo hacia el que debe esquivar (perpendicular al disparo) o null
function aiThreat(E){
  for(const s of g.shots){
    if(!s.mine || s.life <= 0) continue;
    const v2 = s.vx*s.vx + s.vy*s.vy, rx = E.x - s.x, ry = E.y - s.y, tca = (rx*s.vx + ry*s.vy) / v2;
    if(tca < 0 || tca > .55) continue;                      // ya pasó o aún está lejos
    const cx = rx - s.vx*tca, cy = ry - s.vy*tca;           // distancia mínima a la trayectoria
    if(Math.hypot(cx, cy) < rad(E) + s.r + 20){
      const side = (s.vx*ry - s.vy*rx) >= 0 ? -1 : 1;       // hacia el lado contrario al que cae el disparo
      return Math.atan2(s.vy, s.vx) + side * Math.PI / 2;
    }
  }
  return null;
}

function enemyAI(E, P, dt){
  const sk = g.o.skill, r = Math.random, st = aiStyle(E);
  const dx = P.x - E.x, dy = P.y - E.y, dist = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), reach = aiReach(P);
  // velocidad del jugador (suavizada), para apuntar a donde va a estar
  const pv = E.pv || (E.pv = {x:P.x, y:P.y, vx:0, vy:0, who:g.pi});
  if(dt > 0 && pv.who === g.pi){ pv.vx += (clamp((P.x - pv.x)/dt, -450, 450) - pv.vx) * .2; pv.vy += (clamp((P.y - pv.y)/dt, -450, 450) - pv.vy) * .2; } else { pv.vx = pv.vy = 0; pv.who = g.pi; }
  pv.x = P.x; pv.y = P.y;
  const aimAt = spd => { const lead = dist / spd * (.55 + .4*sk); return Math.atan2(P.y + pv.vy*lead - E.y, P.x + pv.vx*lead - E.x) + (1 - sk) * .5 * (r() - .5); };

  if(aiAway(P)) return aiRetreat(E, P, dt);                  // estás cambiando de Pokémon o te has debilitado: se aparta y no ataca

  // ---- Movimiento: cada estilo mantiene su distancia y da vueltas alrededor (cambia de sentido de vez en cuando) ----
  E.orbT = (E.orbT === undefined ? 0 : E.orbT) - dt; if(E.orbT <= 0){ E.orbT = .9 + r()*1.6; E.orb = r() < .5 ? 1 : -1; }
  let want, mag;
  if(st === 'melee'){ want = dist > reach*.78 ? 1 : dist < reach*.4 ? -.6 : 0; mag = dist > reach*1.6 ? .15 : .55; }
  else if(st === 'range'){ want = dist > 400 ? 1 : dist < 250 ? -1 : 0; mag = .8; }
  else { want = dist > 300 ? 1 : dist < 170 ? -1 : 0; mag = .6; }
  if(want < 0 && (E.x < 110 || E.x > W - 110 || E.y < 190 || E.y > H - 140)){            // arrinconado: en vez de retroceder, rodea hacia el centro
    const px = Math.cos(ang + 1.57), py = Math.sin(ang + 1.57);
    E.orb = (px*(W/2 - E.x) + py*(H/2 - E.y)) >= 0 ? 1 : -1; want = 0; mag = 1;
  }
  const th = aiThreat(E);
  if(th !== null && r() < sk) move(E, Math.cos(th), Math.sin(th), dt, .5 + .4*sk);        // esquiva andando…
  else move(E, Math.cos(ang)*want + Math.cos(ang + 1.57)*E.orb*mag, Math.sin(ang)*want + Math.sin(ang + 1.57)*E.orb*mag, dt, .5 + .4*sk);
  E.dir = dirOf(ang);

  // ---- Ataques ----
  if(aiNoAtk(P)) return;                                   // no ataca justo después de tu cambio (AI_SWAP.grace)
  const can = i => E.cd[i] <= 0 && E.en >= enCost(E, i) && !cant(E), rate = k => dt * k * (.6 + .6*sk) * AI_TUNE.agg[g.o.boss];   // rate(k): probabilidad por fotograma (k veces por segundo)
  if(th !== null && can(0) && r() < rate(5)) return use(E, 0, th, false);                 // …y con una carrera si hace falta (cuesta 2 s volver a poder)
  if(dist <= reach - 6 && can(1) && r() < rate(7)) return use(E, 1, ang, false);         // golpe: solo si estás de verdad a su alcance
  if(st !== 'melee' && dist < reach*.9 && can(0) && r() < rate(1.5)) return use(E, 0, ang + Math.PI + E.orb*.9, false);     // tirador con el rival encima: huye con la carrera
  if(st === 'melee' && dist > reach*2 && can(0) && r() < rate(1.2)) return use(E, 0, ang, false);                              // pegador lejos: se lanza con la carrera
  if(!(E.buff > 0) && can(3) && dist < 450 && (st === 'melee' || E.en >= 55) && r() < rate(.9)) return use(E, 3, ang, false);   // mejora (Q): al entrar en combate
  if(can(4) && dist > 130 && dist < 560 && (st !== 'melee' || dist > reach*1.5) && r() < rate(1.1)) return use(E, 4, aimAt(380), false);   // ataque fuerte (E)
  const needE = E.cd[4] < 1.5 ? 40 : 0;                                                    // guarda energía para el E si está a punto de poder usarlo
  if(can(2) && dist > reach*(st === 'melee' ? 2.2 : 1.15) && dist < 620 && E.en >= enCost(E, 2) + (st === 'melee' ? 36 : needE) && r() < rate(2.2)) use(E, 2, aimAt(520), false);   // disparo
}
