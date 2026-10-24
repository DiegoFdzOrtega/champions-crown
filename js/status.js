"use strict";
/* =====================================================================
   15) ESTADOS: paralizado, envenenado, quemado, dormido y confuso
   Se aplican con 6 ataques del hueco 3 (Q): Onda Trueno, Tóxico, Fuego Fatuo, Somnífero, Brecha Negra y Rayo Confuso.
   Cada uno lanza un proyectil SIN daño (se puede esquivar). Si impacta, el rival recibe el estado.
   Todos los números están en STX: cámbialos aquí para equilibrar el juego.
   Los dibujos de cada ataque están en js/fxstatus.js.
   ===================================================================== */
const STX = {
  speed: 440, r: 11,                                  // velocidad (px/s) y tamaño del proyectil de estado
  par: {dur: 5, spd: .5, fail: .25},                  // paralizado: se mueve a la mitad y el 25 % de los ataques fallan
  psn: {dur: 6, base: .003},                          // envenenado grave: pierde (base × (segundos + 1)) de la vida máxima por segundo → sube cada segundo (~6 % en total)
  brn: {dur: 8, tick: .005, melee: .5},               // quemado: pierde 0,5 % de la vida máxima por segundo (~4 %) y su golpe cuerpo a cuerpo hace la mitad
  slp: {dur: 2, imm: 5},                              // dormido: no se mueve ni ataca · imm = segundos que no se puede volver a dormir al despertar
  cnf: {dur: 4, self: .33, hit: .5}                   // confuso: el 33 % de los ataques se los hace a sí mismo (con la mitad de fuerza que su golpe normal)
};
// Ataques de estado. k = estado · dur = segundos (si no, el de STX) · immune = tipos a los que no afecta (polvos)
const STATUS_MOVES = {
  'Onda Trueno':  {k: 'par', desc: 'Lanza una onda eléctrica que paraliza al rival.'},
  'Tóxico':       {k: 'psn', desc: 'Lanza veneno que intoxica al rival: cada segundo pierde más vida.'},
  'Fuego Fatuo':  {k: 'brn', desc: 'Lanza llamas fantasmales que queman al rival.'},
  'Somnífero':    {k: 'slp', immune: ['planta'], desc: 'Lanza un polvo que duerme al rival.'},
  'Brecha Negra': {k: 'slp', dur: 2.5, desc: 'Lanza una esfera oscura que duerme al rival. Solo la usa Darkrai.'},
  'Rayo Confuso': {k: 'cnf', desc: 'Lanza una luz extraña que confunde al rival.'}
};
const STATUS_INFO = {
  par: {n: 'Paralizado',  txt: '¡Paralizado!',  ab: 'PAR', c: '#f8d030'},
  psn: {n: 'Envenenado',  txt: '¡Envenenado!',  ab: 'TOX', c: '#b85ee8'},
  brn: {n: 'Quemado',     txt: '¡Quemado!',     ab: 'QUE', c: '#ff7a1a'},
  slp: {n: 'Dormido',     txt: '¡Dormido!',     ab: 'DRM', c: '#8fb0ff'},
  cnf: {n: 'Confuso',     txt: '¡Confuso!',     ab: 'CNF', c: '#ff5fb0'}
};
const STATUS_IMMUNE = {par: ['electrico'], psn: ['veneno', 'acero'], brn: ['fuego'], slp: [], cnf: []};   // tipos que no pueden tener ese estado

const cant = f => f.stun > 0 || !!(f.st && f.st.k === 'slp');        // no puede moverse ni atacar (amedrentado o dormido)
const hasStatus = f => !!(f.st || f.cnf > 0);
const popAt = (T, txt, c) => g.pops.push({x: T.x, y: T.y - 150, txt, t: 1.1, c: c || '#fff', s: 11});
function clearStatus(f){ f.st = null; f.cnf = 0; }

// Daño directo del estado (veneno, quemadura, confusión): puede debilitar
function stDamage(f, amt){
  if(f.dead || amt <= 0) return;
  f.hp -= amt;
  if(f.hp <= 0){ f.hp = 0; f.dead = true; f.dt = 0; setAct(f, 'Faint', 99); clearStatus(f); }
}

// Pone el estado k a T. Devuelve true si se ha puesto.
function statusInflict(T, k, dur){
  if(T.dead || T.ghost) return false;
  const inf = STATUS_INFO[k];
  if(STATUS_IMMUNE[k].some(t => T.m.types.includes(t))){ popAt(T, 'Inmune', '#c8c8d4'); return false; }
  if(k === 'cnf'){
    if(T.cnf > 0){ popAt(T, 'Ya está confuso', '#c8c8d4'); return false; }
    T.cnf = dur;
  } else {
    if(T.st){ popAt(T, 'Ya tiene un estado', '#c8c8d4'); return false; }
    if(k === 'slp' && T.slpImm > 0){ popAt(T, 'No se duerme', '#c8c8d4'); return false; }
    T.st = {k, t: dur, el: 0};
  }
  popAt(T, inf.txt, inf.c);
  return true;
}

// Un proyectil de estado ha tocado a T
function statusShotHit(T, s){
  const sm = STATUS_MOVES[s.status];
  if(T.dead || T.ghost) return;
  if(eff(s.type, T.m.types) === 0 || (sm.immune && sm.immune.some(t => T.m.types.includes(t)))){     // el tipo del ataque no le afecta (Tierra · Normal · Acero · Planta)
    popAt(T, 'Sin efecto', '#c8c8d4'); fxBurst(T.x, T.y - 6, ['#ffffff', '#c8c8d4'], 6, 70); return;
  }
  if(statusInflict(T, sm.k, sm.dur || STX[sm.k].dur)) fxHit(T, s.status, s.type, 1, false, false, s.o);
  else fxBurst(T.x, T.y - 6, ['#ffffff', '#c8c8d4'], 5, 60);
}

// Al intentar atacar: paralizado (falla) o confuso (se golpea). Devuelve true si el ataque se pierde.
function statusBlock(f){
  if(f.st && f.st.k === 'par' && Math.random() < STX.par.fail){
    popAt(f, '¡No se puede mover!', STATUS_INFO.par.c); fxBurst(f.x, f.y - 20, ['#ffd91f', '#fff27a', '#ffffff'], 8, 110); return true;
  }
  if(f.cnf > 0 && Math.random() < STX.cnf.self){
    popAt(f, '¡Se hirió a sí mismo!', STATUS_INFO.cnf.c); fxBurst(f.x, f.y - 20, ['#ff5fb0', '#ffa8d8', '#ffffff'], 10, 120);
    stDamage(f, MV[1].dmg * f.dmg * STX.cnf.hit / (f.defm || 1));
    if(!f.dead) setAct(f, 'Hurt', .3);
    return true;
  }
  return false;
}

// Cada fotograma, solo para quien está en combate
function statusTick(f, dt){
  if(f.dead){ clearStatus(f); return; }
  if(f.slpImm > 0) f.slpImm -= dt;
  if(f.cnf > 0) f.cnf -= dt;
  const s = f.st; if(!s) return;
  s.t -= dt; s.el += dt;
  if(s.k === 'psn') stDamage(f, f.max * STX.psn.base * (1 + Math.floor(s.el)) * dt);
  if(s.k === 'brn') stDamage(f, f.max * STX.brn.tick * dt);
  if(s.k === 'slp' && !f.dead){ f.mv = false; f.at = 0; }                       // dormido: imagen quieta
  if(s.t <= 0 && f.st){
    if(s.k === 'slp'){ f.slpImm = STX.slp.imm; if(!f.dead) popAt(f, '¡Despertó!', '#c9d6f5'); }
    f.st = null;
  }
}
// Los que están en el banquillo pierden sus estados al salir del combate
function statusBench(){
  for(const f of g.p.concat(g.e)){ if(f !== g.p[g.pi] && f !== g.e[g.ei] && hasStatus(f)) clearStatus(f); }
}

// Texto del hueco en «Ver datos / Cambiar ataque» y en la Pokédex
const slotDesc = (sl, n) => (sl === 3 && STATUS_MOVES[n]) ? 'Estado al rival (proyectil sin daño)' : SLOT_DESC[sl];
