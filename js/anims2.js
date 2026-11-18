"use strict";
/* =====================================================================
   MÁS ANIMACIONES DE PMD (se suman a las de js/anims.js). Si a un Pokémon le falta alguna, se ve la de siempre.
   Las nuevas (Ricochet, Emit, Withdraw, RearUp, LeapForth, HitGround, Wake, LostBalance, Trip) las baja tools/bajar_anims.ps1
   (vuelve a ejecutarlo: solo baja lo que falta). Cringe y Float ya estaban bajadas y ahora se usan.
   CUÁNDO SALE CADA UNA:
     Ricochet ..... golpes rápidos que rebotan: Ataque Rápido, Puño Bala, Velocidad Extrema, Ataque Ala
     Emit ......... ataques de estado (Hipnosis, Tóxico, Onda Trueno...) y disparos psíquicos (Confusión, Psicorrayo...)
     Withdraw ..... mejoras de esconderse: Refugio, Defensa Férrea, Armadura Ácida
     RearUp ....... cargando un ataque fuerte físico (Envite Ígneo, Terremoto, Megacuerno, A Bocajarro...)
     LeapForth .... lanzado hacia delante en Envite Ígneo / Pájaro Osado / Surf
     HitGround .... al golpear el suelo con Terremoto
     Wake ......... al despertarse
     LostBalance .. paralizado sin poder moverse · Trip: confuso, se hace daño a sí mismo
     Cringe ....... amedrentado (Roca del Rey...)
     Float ........ los de tipo Fantasma y los que levitan, flotando en vez de estar quietos
   AN2.on = false lo apaga.
   ===================================================================== */
const AN2 = {on: true, wake: .7, fail: .7};
Object.entries({
  Ricochet:{w:48, h:48, fps:20, loop:false}, Emit:{w:40, h:40, fps:12, loop:false}, Withdraw:{w:40, h:40, fps:12, loop:false},
  RearUp:{w:40, h:48, fps:10, loop:false}, LeapForth:{w:48, h:48, fps:14, loop:true}, HitGround:{w:48, h:48, fps:16, loop:false},
  Wake:{w:40, h:40, fps:10, loop:false}, LostBalance:{w:40, h:40, fps:12, loop:false}, Trip:{w:40, h:40, fps:12, loop:false}
}).forEach(([k, v]) => { if(!ANIMS[k]) ANIMS[k] = Object.assign({n: 6}, v); });

const AN2_RICO = /ataque r[aá]pido|pu[ñn]o bala|velocidad extrema|ataque ala|rel[aá]mpago/i;
const AN2_WITH = /refugio|defensa f[eé]rrea|armadura [aá]cida/i;
const AN2_REAR = /envite|terremoto|megacuerno|bocajarro|p[aá]jaro osado|roca afilada|cuerpo pesado|golpe calor|gigaimpacto|pu[ñn]o/i;
const an2Status = nm => typeof STATUS_MOVES !== 'undefined' && !!STATUS_MOVES[nm];
const an2Psi = nm => /confusi[oó]n|psicorrayo|ps[ií]quico|paz mental/i.test(nm || '');

// Lo que hace cada uno, para elegir
if(typeof fxShotStart === 'function'){ const o = fxShotStart; fxShotStart = function(f, s, name){ if(f){ f.anShot = name; } return o.apply(this, arguments); }; }
if(typeof statusBlock === 'function'){ const o = statusBlock; statusBlock = function(f){
  const par = f && f.st && f.st.k === 'par', r = o.apply(this, arguments);
  if(r && f && g){ f.anFail = {t: g.t, k: par ? 'LostBalance' : 'Trip'}; f.at = 0; }
  return r; }; }
if(typeof quakeStart === 'function'){ const o = quakeStart; quakeStart = function(f){ if(f) f.anQuake = 1; return o.apply(this, arguments); }; }
{ const o = setAct; setAct = function(f, name){ const r = o.apply(this, arguments); if(f && name === 'Attack') f.anQuake = 0; return r; }; }

{ const o = anPick; anPick = function(f){
  const r = o.apply(this, arguments);
  if(!AN2.on || !AN.on || !f || !f.m || f.dead || f.shiny) return r;
  const a = r[0], has = x => anHas(f, x), base = f.act, t = g ? g.t : 0;
  // estados
  const slp = !!(f.st && f.st.k === 'slp');
  if(f.anWasSlp && !slp) f.anWake = t; f.anWasSlp = slp;
  if(f.stun > 0 && !slp && has('Cringe')) return ['Cringe', (f.at || 0) % 1];
  if(f.anFail && t - f.anFail.t < AN2.fail && has(f.anFail.k)) return [f.anFail.k, t - f.anFail.t];
  if(f.anWake && t - f.anWake < AN2.wake && (base === 'Idle' || base === 'Walk') && has('Wake')) return ['Wake', t - f.anWake];
  // ataques
  if(f.ride && has('LeapForth')) return ['LeapForth', f.at];
  if(base === 'Attack' && f.anQuake && has('HitGround')) return ['HitGround', f.at];
  if(base === 'Attack' && f.anMv && AN2_RICO.test(f.anMv) && has('Ricochet')) return ['Ricochet', f.at];
  if(base === 'Shoot' && !f.burst && f.anShot && (an2Status(f.anShot) || an2Psi(f.anShot)) && has('Emit')) return ['Emit', f.at];
  if(base === 'Charge' && !f.wind && f.anBuf && AN2_WITH.test(f.anBuf) && has('Withdraw')) return ['Withdraw', f.at];
  if(base === 'Charge' && f.wind && AN2_REAR.test(f.wind.nm || '') && has('RearUp')) return ['RearUp', f.at];
  // flotar (Fantasma / Levitación) en vez de estar quieto
  if(a === 'Idle' && has('Float') && ((f.m.types || []).includes('fantasma') || f.ab === 'Levitación')) return ['Float', f.at];
  return r;
}; }
