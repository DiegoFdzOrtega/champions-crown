"use strict";
/* =====================================================================
   MEJORAS DE LA TECLA Q: lo que hace de verdad cada ataque (antes todos daban lo mismo: +30 % de daño y +25 % de velocidad).
   Cada ataque dura DUR segundos y puede tener:
     atk  = el daño que haces se multiplica por esto          spd = tu velocidad se multiplica por esto
     def  = el daño que recibes se multiplica por esto        (0,6 = recibes un 40 % menos)
     mist = nadie te puede bajar las estadísticas (Intimidación) · noStatus = nadie te puede poner un estado (parálisis, sueño...)
     wx   = cambia el clima ('sun', 'rain' o 'sand'; dura lo mismo que el de las habilidades, ABX.climaDur)
     tx   = el texto que sale sobre el Pokémon al usarlo
   Los ataques de estado (Onda Trueno, Hipnosis...) no están aquí: van por js/status.js.
   Para cambiar un número, edítalo en esta tabla. Lo que no esté en la tabla usa Q_DEFAULT.
   ===================================================================== */
const Q_DUR = 5;
const Q_DEFAULT = {atk: 1.3, spd: 1.25, tx: '¡Mejora!'};
const Q_FX = {
  // ---- Ataque ----
  'Afilar':        {atk: 1.3,  tx: '¡Ataque subió!'},
  'Danza Espada':  {atk: 1.4,  tx: '¡Ataque subió mucho!'},
  'Desarrollo':    {atk: 1.35, tx: '¡Ataque subió!'},
  'Maquinación':   {atk: 1.4,  tx: '¡Ataque subió mucho!'},
  'Corpulencia':   {atk: 1.2, def: .9, tx: '¡Ataque y defensa subieron!'},
  'Danza Dragón':  {atk: 1.25, spd: 1.3, tx: '¡Ataque y velocidad subieron!'},
  // ---- Velocidad ----
  'Agilidad':      {spd: 1.9,  tx: '¡Velocidad subió mucho!'},
  'Pulimento':     {spd: 1.9,  tx: '¡Velocidad subió mucho!'},
  'Viento Afín':   {spd: 1.6, atk: 1.15, tx: '¡Velocidad subió!'},
  // ---- Defensa ----
  'Defensa Férrea':{def: .7,  tx: '¡Defensa subió mucho!'},
  'Armadura Ácida':{def: .7,  tx: '¡Defensa subió mucho!'},
  'Amnesia':       {def: .72, tx: '¡Defensa subió mucho!'},
  'Refugio':       {def: .8,  tx: '¡Defensa subió!'},
  'Neblina':       {def: .8, mist: true, tx: '¡Nadie le baja las estadísticas!'},
  'Campo Neblinoso':{def: .8, noStatus: true, tx: '¡Protegido de los estados!'},
  // ---- Mixtas ----
  'Paz Mental':    {atk: 1.2, def: .9, tx: '¡Poder y defensa subieron!'},
  'Carga':         {atk: 1.25, def: .9,  tx: '¡Cargado de energía!'},
  'Danza Aleteo':  {atk: 1.2, def: .88, spd: 1.2, tx: '¡Todo subió un poco!'},
  'Maldición':     {atk: 1.25, def: .85, spd: .85, tx: '¡Más fuerte pero más lento!'},
  // ---- Clima (solo cambian el tiempo; mira WX en abilities.js) ----
  'Día Soleado':   {wx: 'sun', atk: 1.1,  tx: '¡Sol!'},
  'Danza Lluvia':  {wx: 'rain', def: .9, tx: '¡Lluvia!'},
  'Tormenta de Arena': {wx: 'sand', def: .9, tx: '¡Tormenta de arena!'}
};
const qOf = f => (f.buff > 0 && f.qfx) ? f.qfx : null;                          // la mejora activa de ese Pokémon (o nada)
const qAtk = f => { const q = qOf(f); return q && q.atk || 1; };
const qSpd = f => { const q = qOf(f); return q && q.spd || 1; };
const qDef = f => { const q = qOf(f); return q && q.def || 1; };
function qApply(f, nm){                                                          // se llama al usar la tecla Q (si no es un ataque de estado)
  const q = Q_FX[nm] || Q_DEFAULT; f.buff = Q_DUR; f.qfx = q;
  if(q.tx) popAt(f, q.tx, q.def && !q.atk ? '#7dd3ff' : q.spd && !q.atk ? '#ffe066' : q.wx ? '#ffd27a' : '#ff9a7a');
  if(q.wx && g) abWeather(q.wx, null);
}
// Texto para la tienda: lo que hace la mejora
function qLines(nm){
  const q = Q_FX[nm] || Q_DEFAULT, o = [], pc = x => Math.round(Math.abs(x - 1) * 100);
  if(q.atk) o.push(`${q.atk > 1 ? '+' : '−'}${pc(q.atk)} % de daño que haces`);
  if(q.spd) o.push(`${q.spd > 1 ? '+' : '−'}${pc(q.spd)} % de velocidad`);
  if(q.def) o.push(`recibes un ${pc(q.def)} % menos de daño`);
  if(q.mist) o.push('nadie te puede bajar las estadísticas (Intimidación)');
  if(q.noStatus) o.push('nadie te puede poner un estado (parálisis, sueño, veneno...)');
  const wxN = {sun: 'sol', rain: 'lluvia', sand: 'una tormenta de arena'};
  const head = q.wx ? [`Cambia el clima a ${wxN[q.wx]} durante ${ABX.climaDur} s (afecta a los dos Pokémon).`] : [];
  return {head, list: o, dur: q.wx ? 0 : Q_DUR};
}
