"use strict";
/* =====================================================================
   19) HABILIDADES EN EL COMBATE (las de tus Pokémon y las de los rivales)
   Cada luchador tiene su habilidad en f.ab (tuyos: la que elijas con la Cápsula · rivales: la de su plantilla en teams.js).
   Aquí está TODO lo que hacen. Los números están en ABX (justo debajo): cámbialos para equilibrar el juego.
   Cómo se engancha al combate (combat.js, status.js, swap.js, render.js, ai.js solo llaman a estas funciones):
     abHit      cuando algo te golpea: inmunidades, daño que haces y recibes, esquivar        (la llama hit())
     abAfter    justo después del golpe: efectos al contacto, venganzas, Autoestima...         (la llama hit())
     abEnter    un Pokémon entra en combate (Intimidación, clima, trampas)                     (swap.js y startBattle)
     abExit     un Pokémon sale (Regeneración) y pierde sus subidas/bajadas                    (swap.js)
     abTick     cada fotograma (clima, Mudar, Impulso, Poder Solar...)                         (update() de combat.js)
     abSpeed · enCost · abTrapped · abFlinch · abStatusBlock ...  pequeñas consultas
   Las habilidades de los juegos por turnos se han adaptado al tiempo real (por ejemplo «un turno de cada dos» = espera el doble).
   Las que hablan de cosas que el juego no tiene (robar objetos, peso, explosiones, congelación) no hacen nada: la lista está en el README.
   ===================================================================== */
const ABX = {
  // --- daño que haces ---
  lowHp: 1 / 3, lowMul: 1.5,          // Mar Llamas · Torrente · Espesura · Enjambre: con 1/3 de vida o menos, ×1,5 en ataques de ese tipo
  adaptable: 1.07,                    // Adaptable: ataques de su propio tipo
  tecnico: 1.07,                       // Técnico: golpe (clic izq.) y disparo (clic dcho.), los ataques «flojos»
  puno: 1.15,                          // Puño Férreo: su golpe cuerpo a cuerpo
  energiaPura: 1.1,                   // Energía Pura (en los juegos duplica el Ataque; aquí solo ×1,1: en tiempo real cada 10 % de daño decide muchos combates)
  potBruta: 1.05,                      // Potencia Bruta: todos sus ataques, pero pierde sus efectos extra (amedrentar, veneno de Toque Tóxico...)
  agallas: 1.5,                       // Agallas: con un estado (paralizado, envenenado...)
  autoestima: .2, autoMax: 3,         // Autoestima: +20 % por cada rival vencido (máx. 3 veces)
  irascible: 1.25,                     // Irascible: tras recibir un crítico
  justiciero: .25, justMax: 3,        // Justiciero: +25 % cada vez que le pegan con un ataque Siniestro (máx. 3)
  competitivo: 1.3,                   // Competitivo: tras bajarle una estadística (Intimidación)
  analitico: 1.07,                     // Analítico: si el rival es más rápido que él
  poderSolar: 1.3, poderSolarDrain: .005,   // Poder Solar: con sol ×1,3 pero pierde el 0,5 % de su vida por segundo
  donFloral: 1.2,                     // Don Floral: con sol, daño ×1,2 y recibe ×1/1,2
  francotirador: 1.5,                 // Francotirador: los críticos hacen ×1,5 más
  normalidad: 1.05,                   // Normalidad: sus ataques son Normal y pegan ×1,05
  encadenado: 1.3,                    // Encadenado: Pin Misil (ataque de varios golpes)
  intim: .93, intimMin: .8,           // Intimidación: baja un 7 % el daño del rival (mínimo ×0,8 si entra varias veces)
  // --- daño que recibes ---
  superguardia: .75, cromolente: 1.5, ignorante: .5, sebo: .5, multiescala: .5, filtro: .75, escama: 1 / 1.5, piel: 1.25,
  absorb: .2,                         // Absorbe Agua/Fuego/Elec., Piel Seca: curan este % de la vida máxima en vez de recibir daño
  pararrayos: .2, pararrayosMax: 3,   // Pararrayos: +20 % de daño por cada ataque eléctrico absorbido (máx. 3)
  electromotor: 1.4,                  // Electromotor: velocidad ×1,4 tras absorber un ataque eléctrico
  impetuArena: 2,                     // Ímpetu Arena: velocidad ×2 con tormenta de arena (y no la sufre)
  evade: .25,                         // Manto Níveo (con granizo) · Velo Arena (con tormenta de arena): 25 % de esquivar
  // --- efectos al contacto ---
  contact: .2, contactBrn: .06, hedor: .1, cursed: .08, cursedCd: 3, toqueToxico: .2,
  pielTosca: .015,                    // Piel Tosca: quien le pega cuerpo a cuerpo pierde el 1,5 % de su vida máxima
  // --- tiempo real ---
  presion: 1.07,                     // Presión: el rival gasta un 7 % más de energía
  indolente: .45,                     // Indolente: tras un ataque no puede volver a atacar hasta pasado este tiempo (s)
  bromista: 1.5, bromistaCd: .7,      // Bromista: sus ataques de estado vuelan ×1,5 y se recargan antes (×0,7)
  impulso: .03, impulsoMax: .6,       // Impulso: +3 % de velocidad por segundo (hasta +60 %)
  mudar: .12,                         // Mudar: cada segundo, 12 % de curarse de un estado
  madrugar: .5, curaNatural: .6,      // Madrugar: el sueño dura la mitad · Cura Natural: sus estados duran un 40 % menos
  clima: 1.5, climaDur: 20,           // clima: velocidad ×1,5 (Clorofila, Nado Rápido) · duración del clima en segundos
  sol: {fuego: 1.5, agua: .5}, lluvia: {agua: 1.5, fuego: .5},     // el clima potencia o debilita esos tipos
  chip: .004, heal: .006,             // granizo/arena: pierde el 0,4 % de su vida por segundo · Cura Lluvia/Cuerpo Gélido/Piel Seca: recupera el 0,6 %
  regen: 1 / 3,                       // Regeneración: recupera este % de vida al salir del combate
  amor: 4, amorFail: .4,              // Gran Encanto: enamorado 4 s, el 50 % de sus ataques fallan
  sinGuarda: 1.5, ojo: 1.25, ojoAcc: 1.3     // Sin Guarda / Ojo Compuesto: proyectiles más fáciles de acertar (tamaño ×) · precisión de Hipnosis ×
};
const SOUND_MOVES = new Set(['Voz Cautivadora', 'Zumbido']);                       // ataques de sonido que Insonorizar bloquea
const PINCH = {'Mar Llamas': 'fuego', 'Torrente': 'agua', 'Espesura': 'planta', 'Enjambre': 'bicho'};
const IMMUNE_TYPE = {'Levitación': 'tierra', 'Absorbe Agua': 'agua', 'Piel Seca': 'agua', 'Absorbe Fuego': 'fuego', 'Absorbe Elec.': 'electrico', 'Pararrayos': 'electrico', 'Electromotor': 'electrico'};
const WX = {
  sun:  {n: 'SOL',     c: '#ffb347', msg: '¡El sol aprieta!'},
  rain: {n: 'LLUVIA',  c: '#6fb8ff', msg: '¡Empieza a llover!'},
  hail: {n: 'GRANIZO', c: '#cfeaff', msg: '¡Empieza a granizar!'},
  sand: {n: 'ARENA',   c: '#e0c07a', msg: '¡Se levanta una tormenta de arena!'}
};
const WX_OF = {'Sequía': 'sun', 'Llovizna': 'rain', 'Nevada': 'hail', 'Chorro Arena': 'sand'};

// ---------- utilidades ----------
const abAx = () => ({atk: 1, spd: 1, moxie: 0, just: 0, par: 0, anger: false, comp: false, light: false, t: 0});     // lo que cambia durante el combate (se pierde al salir)
const abPop = (f, txt, c) => { if(g) g.pops.push({x: f.x, y: f.y - 172, txt, t: 1.3, c: c || '#9be29b', s: 9}); };      // anuncio de la habilidad sobre el Pokémon
const abMold = A => !!(A && A.ab === 'Rompemoldes');                                  // ignora las habilidades defensivas del rival
const defAb = (T, A) => abMold(A) ? '' : (T.ab || '');                               // la habilidad defensiva que cuenta de verdad
const wxIs = k => !!(g && g.wx && g.wx.k === k);
const abOpp = f => g.p.includes(f) ? g.e[g.ei] : g.p[g.pi];                          // el rival que tiene delante
const abSide = f => g.p.includes(f) ? 'p' : 'e';
const abBlockStats = T => ['Cuerpo Puro', 'Humo Blanco', 'Corte Fuerte'].includes(T.ab) || !!(qOf(T) && qOf(T).mist);   // nadie le baja las estadísticas (Corte Fuerte: el Ataque)
const abSpeedOf = f => f.m.spd * (f.spdm || 1);
function abIndirect(f, amt){                                                         // daño que no viene de un golpe (Muro Mágico lo evita)
  if(f.dead || amt <= 0 || f.ab === 'Muro Mágico') return;
  f.hp -= amt;
  if(f.hp <= 0){ f.hp = 0; f.dead = true; f.dt = 0; setAct(f, 'Faint', 99); clearStatus(f); }
}

// ---------- clima ----------
function abWeather(k, src){
  g.wx = {k, t: ABX.climaDur};
  g.pops.push({x: W / 2, y: 190, txt: WX[k].msg, t: 1.6, c: WX[k].c, s: 12});
  if(src) abPop(src, src.ab.toUpperCase());
}

// ---------- entrar y salir ----------
function abEnter(f){
  if(!g || !f || f.dead) return;
  f.ax = abAx();
  const T = abOpp(f), a = f.ab;
  if(WX_OF[a]) abWeather(WX_OF[a], f);
  if(a === 'Intimidación' && T && !T.dead){
    if(abBlockStats(T) && !abMold(f)){ abPop(f, 'INTIMIDACIÓN'); abPop(T, T.ab.toUpperCase() + ': no le afecta', '#c8c8d4'); }
    else{
      T.ax.atk = Math.max(ABX.intimMin, T.ax.atk * ABX.intim); abPop(f, 'INTIMIDACIÓN', '#ffb35a'); popAt(T, '¡Ataque bajó!', '#ff8a8a');
      if(T.ab === 'Competitivo'){ T.ax.comp = true; abPop(T, 'COMPETITIVO'); }
    }
  }
  if(a === 'Presión') abPop(f, 'PRESIÓN', '#c9d6f5');
  if(['Sombra Trampa', 'Trampa Arena', 'Imán'].includes(a)) abPop(f, a.toUpperCase(), '#c9d6f5');
}
function abExit(f){                                                                  // el Pokémon se retira (cambio): sus subidas y bajadas se pierden
  if(!f) return;
  if(f.ab === 'Regeneración' && !f.dead) f.hp = Math.min(f.max, f.hp + f.max * ABX.regen);
  f.ax = abAx(); f.truant = 0;
}

// ---------- trampas: no puedes cambiar de Pokémon a mano ----------
function abTrapped(f, T){                                                            // f = el que quiere irse · T = el rival que tiene delante
  if(!T || T.dead || f.ab === 'Sombra Trampa') return '';
  const ty = f.m.types;
  if(T.ab === 'Sombra Trampa' && !ty.includes('fantasma')) return T.ab;
  if(T.ab === 'Trampa Arena' && !ty.includes('volador') && f.ab !== 'Levitación') return T.ab;
  if(T.ab === 'Imán' && ty.includes('acero')) return T.ab;
  return '';
}

// ---------- amedrentar ----------
function abFlinch(T, A, chance, secs){                                               // intenta amedrentar a T. Devuelve true si lo consigue
  if(!A || A.ab === 'Potencia Bruta') return false;
  if(A.ab === 'Dicha') chance *= 2;
  if(Math.random() >= chance) return false;
  if(T.ab === 'Foco Interno' || (T.ab === 'Polvo Escudo' && !abMold(A))){ abPop(T, T.ab.toUpperCase(), '#c8c8d4'); return false; }
  T.stun = secs; setAct(T, 'Hurt', secs); popAt(T, '¡Amedrentado!', '#ffd24a');
  if(T.ab === 'Impasible'){ T.ax.spd = 1.4; abPop(T, 'IMPASIBLE'); }
  return true;
}

// ---------- el golpe: inmunidades, daño que haces y recibes ----------
function abHit(T, A, type, mult, close, big, mvn){
  const R = {mult, out: 1, inn: 1, noCrit: false, critMul: 1, imm: '', dodge: false};
  const aAb = A ? (A.ab || '') : '', dAb = defAb(T, A), slot = close ? 1 : big ? 4 : 2;
  const pierce = abMold(A) || aAb === 'Infiltrador';                                  // ignora las reducciones de daño del rival
  // Intrépido: Normal y Lucha golpean a los Fantasma
  if(aAb === 'Intrépido' && R.mult === 0 && (type === 'normal' || type === 'lucha')) R.mult = eff(type, T.m.types.filter(t => t !== 'fantasma'));
  // inmunidades (y las que curan o suben algo)
  if(dAb && IMMUNE_TYPE[dAb] === type) R.imm = dAb;
  else if(dAb === 'Insonorizar' && SOUND_MOVES.has(mvn)) R.imm = dAb;
  if(R.imm){
    R.heal = ['Absorbe Agua', 'Piel Seca', 'Absorbe Fuego', 'Absorbe Elec.', 'Pararrayos', 'Electromotor'].includes(R.imm);
    if(['Absorbe Agua', 'Piel Seca', 'Absorbe Fuego', 'Absorbe Elec.'].includes(R.imm)){ T.hp = Math.min(T.max, T.hp + T.max * ABX.absorb); popAt(T, '+PS', '#7dff9a'); }
    if(R.imm === 'Pararrayos'){ T.ax.par = Math.min(ABX.pararrayosMax, T.ax.par + 1); popAt(T, '¡Potencia subió!', '#ffe066'); }
    if(R.imm === 'Electromotor'){ T.ax.spd = Math.max(T.ax.spd, ABX.electromotor); popAt(T, '¡Velocidad subió!', '#ffe066'); }
    return R;
  }
  // esquivar con el clima
  if((dAb === 'Manto Níveo' && wxIs('hail')) || (dAb === 'Velo Arena' && wxIs('sand'))){
    if(!['Vista Lince', 'Sin Guarda', 'Ojo Compuesto'].includes(aAb) && Math.random() < ABX.evade){ R.dodge = dAb; return R; }
  }
  // ---- daño que haces ----
  if(A){
    const at = A.ax || abAx();
    R.out *= at.atk;                                                                  // Intimidación recibida
    if(PINCH[aAb] === type && A.hp <= A.max * ABX.lowHp) R.out *= ABX.lowMul;
    if(aAb === 'Adaptable' && A.m.types.includes(type)) R.out *= ABX.adaptable;
    if(aAb === 'Técnico' && slot <= 2) R.out *= ABX.tecnico;
    if(aAb === 'Puño Férreo' && close) R.out *= ABX.puno;
    if(aAb === 'Energía Pura') R.out *= ABX.energiaPura;
    if(aAb === 'Potencia Bruta') R.out *= ABX.potBruta;
    if(aAb === 'Agallas' && A.st) R.out *= ABX.agallas;
    if(aAb === 'Autoestima') R.out *= 1 + ABX.autoestima * at.moxie;
    if(aAb === 'Irascible' && at.anger) R.out *= ABX.irascible;
    if(aAb === 'Justiciero') R.out *= 1 + ABX.justiciero * at.just;
    if(aAb === 'Competitivo' && at.comp) R.out *= ABX.competitivo;
    if(aAb === 'Pararrayos') R.out *= 1 + ABX.pararrayos * at.par;
    if(aAb === 'Analítico' && abSpeedOf(A) < abSpeedOf(T)) R.out *= ABX.analitico;
    if(aAb === 'Poder Solar' && wxIs('sun')) R.out *= ABX.poderSolar;
    if(aAb === 'Don Floral' && wxIs('sun')) R.out *= ABX.donFloral;
    if(aAb === 'Normalidad') R.out *= ABX.normalidad;
    if(aAb === 'Encadenado' && mvn === 'Pin Misil') R.out *= ABX.encadenado;
    if(aAb === 'Francotirador') R.critMul = ABX.francotirador;
    if(aAb === 'Cromolente' && R.mult > 0 && R.mult < 1) R.out *= ABX.cromolente;                  // «poco eficaz» pasa a normal
  }
  // clima sobre los tipos
  if(wxIs('sun') && ABX.sol[type]) R.out *= ABX.sol[type];
  if(wxIs('rain') && ABX.lluvia[type]) R.out *= ABX.lluvia[type];
  // ---- daño que recibes ----
  if(dAb === 'Armadura Batalla') R.noCrit = true;
  if(dAb === 'Superguardia' && R.mult < 2) R.inn *= ABX.superguardia;          // solo los ataques muy eficaces le hacen daño de verdad
  if(!pierce){
    if(dAb === 'Sebo' && (type === 'fuego' || type === 'hielo')) R.inn *= ABX.sebo;
    if(dAb === 'Multiescala' && T.hp >= T.max - 1e-6) R.inn *= ABX.multiescala;
    if((dAb === 'Filtro' || dAb === 'Roca Sólida') && R.mult >= 2) R.inn *= ABX.filtro;
  }
  if(dAb === 'Piel Seca' && type === 'fuego') R.inn *= ABX.piel;
  if(dAb === 'Escama Especial' && T.st) R.inn *= ABX.escama;
  if(dAb === 'Don Floral' && wxIs('sun')) R.inn /= ABX.donFloral;
  if(dAb === 'Ignorante' && A) R.inn /= 1 + (qAtk(A) - 1) * ABX.ignorante;                     // ignora parte de la mejora de ataque (Q) del rival
  if(qOf(T) && qOf(T).def) R.inn *= qOf(T).def;                                                 // mejora de defensa (Q) de quien recibe el golpe
  return R;
}

// ---------- después del golpe ----------
function abAfter(T, A, dealt, type, close, crit, big){
  if(T.ax && crit && T.ab === 'Irascible'){ T.ax.anger = true; abPop(T, 'IRASCIBLE', '#ff8a8a'); }
  if(T.ax && type === 'siniestro' && T.ab === 'Justiciero' && dealt > 0){ T.ax.just = Math.min(ABX.justMax, T.ax.just + 1); abPop(T, 'JUSTICIERO', '#ffe066'); }
  if(!A || A.dead) return;
  const dAb = defAb(T, A), aAb = A.ab || '';
  if(T.dead && A.ax && aAb === 'Autoestima'){ A.ax.moxie = Math.min(ABX.autoMax, A.ax.moxie + 1); abPop(A, 'AUTOESTIMA', '#ffe066'); }
  if(T.dead || dealt <= 0) return;
  if(close){
    // lo que le pasa a quien golpea cuerpo a cuerpo
    const k = ABX.contact;
    if(dAb === 'Elec. Estática' && Math.random() < k) statusInflict(A, 'par', STX.par.dur, T);
    if(dAb === 'Cuerpo Llama' && Math.random() < ABX.contactBrn) statusInflict(A, 'brn', STX.brn.dur, T);
    if(dAb === 'Punto Tóxico' && Math.random() < k) statusInflict(A, 'psn', STX.psn.dur, T);
    if(dAb === 'Gran Encanto' && Math.random() < k) statusInflict(A, 'lov', ABX.amor, T);
    if(dAb === 'Efecto Espora' && Math.random() < k){ const s = rnd(['slp', 'psn', 'par']); statusInflict(A, s, STX[s].dur, T); }
    if(dAb === 'Piel Tosca') abIndirect(A, A.max * ABX.pielTosca);
    // lo que hace quien golpea
    if(aAb === 'Toque Tóxico' && dAb !== 'Polvo Escudo' && Math.random() < ABX.toqueToxico) statusInflict(T, 'psn', STX.psn.dur, A);
    if(aAb === 'Hedor') abFlinch(T, A, ABX.hedor, IFX.rocaStun);
  }
  if(dAb === 'Cuerpo Maldito' && A.lastUse > 0 && Math.random() < ABX.cursed){
    A.cd[A.lastUse] = Math.max(A.cd[A.lastUse], ABX.cursedCd); abPop(T, 'CUERPO MALDITO', '#c9a0ff'); popAt(A, '¡Ataque anulado!', '#c9a0ff');
  }
}

// ---------- cada fotograma ----------
function abTick(f, dt){
  if(f.dead || !f.ax) return;
  const a = f.ab || '';
  f.ax.t += dt;
  if(f.truant > 0) f.truant -= dt;
  if(g.wx){
    const k = g.wx.k, ty = f.m.types;
    if(k === 'sand' && !ty.some(t => ['roca', 'tierra', 'acero'].includes(t)) && !['Velo Arena', 'Ímpetu Arena'].includes(a)) abIndirect(f, f.max * ABX.chip * dt);
    if(k === 'hail' && !ty.includes('hielo') && !['Manto Níveo', 'Cuerpo Gélido'].includes(a)) abIndirect(f, f.max * ABX.chip * dt);
    if(k === 'rain' && (a === 'Cura Lluvia' || a === 'Piel Seca')) f.hp = Math.min(f.max, f.hp + f.max * ABX.heal * dt);
    if(k === 'hail' && a === 'Cuerpo Gélido') f.hp = Math.min(f.max, f.hp + f.max * ABX.heal * dt);
    if(k === 'sun' && (a === 'Poder Solar' || a === 'Piel Seca')) abIndirect(f, f.max * ABX.poderSolarDrain * dt);
  }
  if(a === 'Mudar' && hasStatus(f) && Math.random() < ABX.mudar * dt){ clearStatus(f); abPop(f, 'MUDAR', '#c9d6f5'); }
}

// ---------- consultas ----------
function abSpeed(f){                                                                 // multiplicador de velocidad de la habilidad
  let k = f.ax ? f.ax.spd : 1;
  const a = f.ab;
  if(a === 'Clorofila' && wxIs('sun')) k *= ABX.clima;
  if(a === 'Nado Rápido' && wxIs('rain')) k *= ABX.clima;
  if(a === 'Ímpetu Arena' && wxIs('sand')) k *= ABX.impetuArena;
  if(a === 'Impulso' && f.ax) k *= 1 + Math.min(ABX.impulsoMax, f.ax.t * ABX.impulso);
  if(a === 'Liviano' && f.ax && f.ax.light) k *= 1.5;
  return k;
}
function enCost(f, i){                                                               // energía que cuesta de verdad un ataque (Presión del rival)
  const T = g && g.p ? abOpp(f) : null;
  return MV[i].en * (T && !T.dead && T.ab === 'Presión' ? ABX.presion : 1);
}
function abShotK(s, T){                                                              // tamaño extra de un proyectil al acertar (Sin Guarda, Ojo Compuesto)
  const A = s.o; let k = 1;
  if((A && A.ab === 'Sin Guarda') || T.ab === 'Sin Guarda') k = ABX.sinGuarda;
  else if(A && A.ab === 'Ojo Compuesto') k = ABX.ojo;
  return k;
}
function abAcc(A, T, acc){                                                           // precisión de Hipnosis
  if((A && A.ab === 'Sin Guarda') || T.ab === 'Sin Guarda') return 1;
  return Math.min(1, acc * (A && A.ab === 'Ojo Compuesto' ? ABX.ojoAcc : 1));
}

// ---------- estados: inmunidades y reacciones ----------
const AB_STATUS_IMMUNE = {slp: ['Insomnio'], par: ['Flexibilidad'], brn: ['Velo Agua'], cnf: ['Ritmo Propio'], lov: ['Despiste']};
function abStatusBlock(T, k, src){                                                   // true = no puede tener ese estado por su habilidad
  if(!AB_STATUS_IMMUNE[k] || !AB_STATUS_IMMUNE[k].includes(T.ab) || abMold(src)) return false;
  abPop(T, T.ab.toUpperCase() + ': inmune', '#c8c8d4'); return true;
}
function abStatusDur(T, k, dur){                                                     // cuánto dura un estado en este Pokémon
  if(k === 'slp' && T.ab === 'Madrugar') dur *= ABX.madrugar;
  if(T.ab === 'Cura Natural') dur *= ABX.curaNatural;
  return dur;
}
function abStatusAfter(T, k, dur, src){                                              // Sincronía: devuelve par / psn / brn a quien se lo puso
  if(T.ab === 'Sincronía' && src && !src.dead && ['par', 'psn', 'brn'].includes(k) && !abMold(src)){ abPop(T, 'SINCRONÍA', '#ffe066'); statusInflict(src, k, dur); }
}

// ---------- dibujo del clima ----------
function abDrawWeather(){
  if(!g || !g.wx) return;
  const w = g.wx, t = g.t, a = Math.min(1, w.t / 2, (ABX.climaDur - w.t) / 1 + .2);
  ctx.save();
  if(w.k === 'sun'){
    ctx.globalAlpha = .12 * a; ctx.fillStyle = '#ffb347'; ctx.fillRect(0, 0, W, H);
    const gr = ctx.createRadialGradient(80, 60, 10, 80, 60, 520); gr.addColorStop(0, 'rgba(255,230,140,.5)'); gr.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.globalAlpha = a; ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  } else if(w.k === 'rain'){
    ctx.globalAlpha = .1 * a; ctx.fillStyle = '#10305a'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = .55 * a; ctx.strokeStyle = '#9fd0ff'; ctx.lineWidth = 1.5; ctx.beginPath();
    for(let i = 0; i < 90; i++){ const x = (i * 97 + t * 160) % (W + 80) - 40, y = (i * 53 + t * 900) % (H + 40) - 20; ctx.moveTo(x, y); ctx.lineTo(x - 7, y + 20); }
    ctx.stroke();
  } else if(w.k === 'hail'){
    ctx.globalAlpha = .1 * a; ctx.fillStyle = '#bfe3ff'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = .85 * a; ctx.fillStyle = '#ffffff';
    for(let i = 0; i < 70; i++){ const x = (i * 131 + t * 60 + Math.sin(t + i) * 12) % W, y = (i * 61 + t * 190) % H; ctx.fillRect(Math.round(x), Math.round(y), 3, 3); }
  } else if(w.k === 'sand'){
    ctx.globalAlpha = .16 * a; ctx.fillStyle = '#c89a4a'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = .5 * a; ctx.fillStyle = '#e8c984';
    for(let i = 0; i < 80; i++){ const x = (i * 113 + t * 520) % (W + 60) - 30, y = (i * 47 + Math.sin(t * 2 + i) * 14) % H; ctx.fillRect(Math.round(x), Math.round(y < 0 ? y + H : y), 12, 2); }
  }
  ctx.restore();
}
function abDrawHud(){                                                                // «LLUVIA 14»: clima activo, centrado arriba
  if(!g || !g.wx) return;
  const w = g.wx, bw = 150, x = W / 2 - bw / 2, y = 62;      // debajo del marcador de piso
  ctx.fillStyle = 'rgba(8,10,16,.85)'; ctx.fillRect(x, y, bw, 22);
  ctx.fillStyle = WX[w.k].c; ctx.fillRect(x, y, bw, 2); ctx.fillRect(x, y + 20, bw, 2);
  text(`${WX[w.k].n} ${Math.ceil(w.t)}`, W / 2, y + 16, 9, WX[w.k].c, 'center');
}

// ---------- descripciones (las que se ven en la tarjeta del Pokémon y en la Pokédex; las de tiempo real se han reescrito) ----------
Object.assign(ABIL_DESC, {
  'Intimidación': 'Al entrar, baja un 7 % el daño del rival.',
  'Presión': 'El rival gasta un 7 % más de energía al atacar.',
  'Indolente': 'Tras cada ataque tiene que esperar medio segundo antes del siguiente.',
  'Bromista': 'Sus ataques de estado vuelan más rápido y se recargan antes.',
  'Analítico': 'Pega un 7 % más fuerte si el rival es más rápido que él.',
  'Madrugar': 'El sueño le dura la mitad.',
  'Cura Natural': 'Los estados le duran un 40 % menos.',
  'Mudar': 'Cada segundo tiene un 12 % de curarse de un estado.',
  'Liviano': 'Sube su Velocidad al gastar su Banda Aguante.',
  'Impulso': 'Su Velocidad sube poco a poco mientras está en combate.',
  'Infiltrador': 'Sus ataques ignoran las reducciones de daño del rival (Multiescala, Filtro, Sebo...).',
  'Sin Guarda': 'Los proyectiles suyos y los que recibe aciertan más fácil y Hipnosis no falla.',
  'Ojo Compuesto': 'Sus proyectiles aciertan más fácil y Hipnosis falla menos.',
  'Vista Lince': 'Ignora la esquiva del rival (Manto Níveo, Velo Arena).',
  'Cabeza Roca': 'No se hace daño con la Vidasfera.',
  'Encadenado': 'Pin Misil (ataque de varios golpes) pega más fuerte.',
  'Potencia Bruta': 'Todos sus ataques pegan un 5 % más, pero pierde sus efectos extra (amedrentar, veneno...).',
  'Puño Férreo': 'Su golpe cuerpo a cuerpo pega un 15 % más.',
  'Técnico': 'Su golpe y su disparo (los ataques flojos) pegan un 7 % más.',
  'Energía Pura': 'Sus ataques pegan un 10 % más.',
  'Agallas': 'Pega un 50 % más fuerte si tiene un problema de estado.',
  'Adaptable': 'Los ataques de su propio tipo pegan un 7 % más.',
  'Competitivo': 'Si le bajan el daño (Intimidación), pega un 30 % más.',
  'Autoestima': 'Cada rival que vence le sube el daño un 20 % (hasta 3 veces).',
  'Irascible': 'Si recibe un golpe crítico, su daño sube un 25 %.',
  'Justiciero': 'Cada ataque Siniestro que recibe le sube el daño un 25 % (hasta 3 veces).',
  'Pararrayos': 'Absorbe los ataques eléctricos y cada uno le sube el daño un 20 % (hasta 3 veces).',
  'Electromotor': 'Absorbe los ataques eléctricos y le suben la Velocidad.',
  'Absorbe Agua': 'Los ataques de agua no le dañan: le curan un 20 %.',
  'Absorbe Fuego': 'Los ataques de fuego no le dañan: le curan un 20 %.',
  'Absorbe Elec.': 'Los ataques eléctricos no le dañan: le curan un 20 %.',
  'Piel Seca': 'El agua le cura (ataques y lluvia); el fuego le pega más y el sol le quita vida.',
  'Sebo': 'Recibe la mitad de daño de ataques de Fuego y Hielo.',
  'Multiescala': 'Recibe la mitad de daño si tiene la vida al máximo.',
  'Filtro': 'Recibe un 25 % menos de daño de los ataques muy eficaces.',
  'Roca Sólida': 'Recibe un 25 % menos de daño de los ataques muy eficaces.',
  'Robustez': 'Si tiene la vida al máximo, aguanta un golpe mortal con 1 PS.',
  'Superguardia': 'Los ataques que no son muy eficaces le hacen un 25 % menos.',
  'Escama Especial': 'Con un problema de estado recibe un tercio menos de daño.',
  'Muro Mágico': 'No sufre daño indirecto (veneno, quemadura, clima, retroceso).',
  'Armadura Batalla': 'Los golpes críticos no le afectan.',
  'Levitación': 'Flota: los ataques de tierra no le afectan.',
  'Insonorizar': 'Los ataques de sonido (Voz Cautivadora, Zumbido) no le hacen nada.',
  'Piel Tosca': 'Quien le pega cuerpo a cuerpo pierde un 1,5 % de su vida.',
  'Cuerpo Maldito': 'Al recibir un golpe, un 8 % de anular durante 3 s el último ataque del rival.',
  'Sombra Trampa': 'Mientras está en combate no puedes cambiar de Pokémon (salvo los Fantasma).',
  'Trampa Arena': 'Mientras está en combate no puedes cambiar de Pokémon (salvo los Voladores y los que levitan).',
  'Imán': 'Mientras está en combate no puedes cambiar un Pokémon de tipo Acero.',
  'Normalidad': 'Todos sus ataques pasan a ser Normal y pegan un 5 % más.',
  'Rompemoldes': 'Ignora las habilidades defensivas del rival (inmunidades, Multiescala, Sebo...).',
  'Ignorante': 'Recibe menos daño de un rival con la mejora (Q) activa.',
  'Sincronía': 'Pasa a quien se lo pone el estado que reciba (paralizado, envenenado o quemado).',
  'Espejo Mágico': 'Refleja los ataques de estado de vuelta a quien los lanza.',
  'Gran Encanto': 'Al contacto, un 20 % de enamorar al rival: el 40 % de sus ataques fallan durante 4 s.',
  'Despiste': 'No se deja enamorar.',
  'Dicha': 'Dobla la probabilidad de amedrentar y de envenenar de sus ataques.',
  'Humedad': 'Todavía no hace nada (el juego no tiene explosiones).',
  'Viscosidad': 'Todavía no hace nada (el juego no tiene robos de objeto).',
  'Metal Pesado': 'Todavía no hace nada (el juego no tiene peso).',
  'Escudo Magma': 'Todavía no hace nada (el juego no tiene congelación).',
  'Humo Blanco': 'Ningún rival puede bajarle las estadísticas (Intimidación).',
  'Cuerpo Puro': 'Ningún rival puede bajarle las estadísticas (Intimidación).',
  'Corte Fuerte': 'El Ataque no le puede bajar (Intimidación).',
  'Foco Interno': 'No se deja amedrentar.',
  'Impasible': 'Si lo amedrentan, sube su Velocidad.',
  'Polvo Escudo': 'Los efectos extra de los golpes que recibe (amedrentar, veneno...) no le afectan.',
  'Hedor': 'Sus golpes cuerpo a cuerpo tienen un 10 % de amedrentar.',
  'Toque Tóxico': 'Sus golpes cuerpo a cuerpo pueden envenenar.',
  'Cromolente': 'Los ataques poco eficaces pegan un 50 % más fuerte (casi como los normales).',
  'Francotirador': 'Sus golpes críticos hacen más daño.',
  'Intrépido': 'Normal y Lucha le dan a los Fantasma.',
  'Manto Níveo': 'Esquiva el 25 % de los golpes con granizo y no sufre el granizo.',
  'Velo Arena': 'Esquiva el 25 % de los golpes en tormenta de arena y no la sufre.',
  'Ímpetu Arena': 'Con tormenta de arena duplica su Velocidad y no la sufre.',
  'Poder Solar': 'Con sol pega un 30 % más, pero pierde vida cada segundo.',
  'Don Floral': 'Con sol pega y aguanta un 20 % más.',
  'Cuerpo Gélido': 'Recupera vida cuando graniza y no sufre el granizo.',
  'Cura Lluvia': 'Recupera vida cuando llueve.',
  'Regeneración': 'Recupera un tercio de su vida al salir del combate.'
});
