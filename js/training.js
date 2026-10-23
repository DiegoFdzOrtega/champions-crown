"use strict";
/* =====================================================================
   15) ENTRENAMIENTO: IVs, EVs, naturaleza, habilidad y ataques de cada Pokémon (sin pantallas)
   Todo lo que se puede personalizar con objetos de la tienda vive aquí. Las pantallas están en team.js / teamdata.js.

   Qué se guarda en la partida (save) por número de Pokédex:
     save.iv[dex]  = {hp,atk,def,spa,spd,spe}  valores individuales ACTUALES, 0-31 por stat (como en los juegos; máx. 186 en total)
     save.ivBase[dex] = {...}                   los IV iniciales (0 en todos): el botón Restablecer vuelve a ellos
     save.ev[dex]  = {hp,atk,...}              puntos de esfuerzo: máx. 252 por stat y 510 en total (como en los juegos)
     save.evCap[dex] = {hp,atk,...}            los EVs de ese total que vienen de Chapas Plateadas (el resto viene de combates)
     save.capUsed[dex] = {gold:n, silver:n}    Chapas Doradas / Plateadas gastadas en ese Pokémon (Restablecer las devuelve)
     save.nat[dex] = nº de NATURES              (ya existía; las Mentas lo cambian)
     save.abil[dex]= 0 | 1                      cuál de sus 2 habilidades usa (las Cápsulas lo alternan)
     save.mv[dex]  = {1:'Nombre', 3:'Nombre'}   solo los huecos que has cambiado con MTs (el resto sigue como en data.js/moves.js)
     save.mtBought = {day, n:{idMT: comprados}} stock diario de MTs ya comprado hoy
   Los objetos consumibles (Chapa, Menta, Cápsula, MTs) se guardan en save.items como el resto de objetos.

   Efecto en combate (solo tus Pokémon): ver combatBoost(). Los números se cambian en TRAIN, justo debajo.
   ===================================================================== */
const TRAIN = {
  // Reglas reales de los juegos: cada IV va de 0 a 31 (total máx. 186). Cada EV hasta 252 útiles (255 en total teórico) y 510 entre todos.
  ivMax: 31, ivTotal: 186, chapaIV: 5,           // una Chapa Dorada sube un IV en +5 (máximo 31 por stat)
  chapaEV: 10,                                   // una Chapa Plateada suma +10 EV a un stat (como las vitaminas de los juegos)
  evCap: 252, evTotal: 510, evPerFoe: 0,         // EVs: tope por stat, tope total y EVs que da cada rival vencido (0 = los EVs solo se consiguen con Chapas Plateadas)
  power: .6,                                     // fracción del efecto "oficial" de IVs/EVs/naturaleza que se nota en combate (1 = igual que los juegos)
  mtStockEach: 3, mtPerSlot: 2,                  // cada MT del día tiene 3 unidades; salen 2 MTs por cada hueco de ataque (8 al día)
  price: {chapa: 60, plata: 40, menta: 120, capsula: 150, mt: {1: 80, 2: 90, 3: 70, 4: 130}}      // precios en Puntos de Batalla
};
const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
const SLOT_NAMES = {1: 'Golpe (clic izq.)', 2: 'Disparo (clic dcho.)', 3: 'Mejora (Q)', 4: 'Ataque fuerte (E)'};
const SLOT_SHORT = {1: 'Golpe', 2: 'Disparo', 3: 'Mejora', 4: 'Fuerte'};
const spend = id => { save.items[id] = held(id) - 1; if(save.items[id] <= 0) delete save.items[id]; };   // gasta 1 unidad de un consumible

// ---------------------------------------------------------------------
// IVs, EVs y estadísticas finales (fórmula de los juegos a nivel 50)
// ---------------------------------------------------------------------
function ivOf(d){                                                   // todos los Pokémon empiezan con IV 0 y EV 0: solo suben con Chapas
  if(!save.iv[d]){ const o = {}; STAT_KEYS.forEach(k => o[k] = 0); save.iv[d] = o; save.ivBase[d] = Object.assign({}, o); persist(); }
  if(!save.ivBase[d]) save.ivBase[d] = Object.assign({}, save.iv[d]);          // partidas antiguas: lo que haya ahora cuenta como base
  return save.iv[d];
}
const evOf = d => Object.assign({hp:0, atk:0, def:0, spa:0, spd:0, spe:0}, save.ev[d]);
const ivSum = d => STAT_KEYS.reduce((s, k) => s + ivOf(d)[k], 0);
const capOf = d => Object.assign({gold:0, silver:0}, save.capUsed[d]);        // chapas gastadas en un Pokémon
const evCapOf = d => Object.assign({hp:0, atk:0, def:0, spa:0, spd:0, spe:0}, save.evCap[d]);   // EVs que vienen de Chapas Plateadas
const evSum = d => STAT_KEYS.reduce((s, k) => s + evOf(d)[k], 0);
const natMult = (d, k) => { const n = natureOf(d); return n[1] === k ? 1.1 : n[2] === k ? .9 : 1; };
function realStat(d, k){                                            // estadística final a nivel 50 con IV, EV y naturaleza
  const b = mon(d).base[k], core = Math.floor((2 * b + ivOf(d)[k] + Math.floor(evOf(d)[k] / 4)) * .5);
  return k === 'hp' ? core + 60 : Math.floor((core + 5) * natMult(d, k));
}
function refStat(d, k){                                             // la misma estadística sin entrenar (IV 0, EV 0, naturaleza neutra): vale x1,00
  const core = Math.floor((2 * mon(d).base[k]) * .5); return k === 'hp' ? core + 60 : core + 5;
}
const statMult = (d, k) => 1 + (realStat(d, k) / refStat(d, k) - 1) * TRAIN.power;

// Multiplicadores que se aplican a tu Pokémon en combate: PS, daño (su mejor ataque), velocidad y resistencia
function combatBoost(d){
  const b = mon(d).base, ak = b.atk >= b.spa ? 'atk' : 'spa';
  return {hm: statMult(d, 'hp'), dm: statMult(d, ak), spdm: statMult(d, 'spe'), defm: (statMult(d, 'def') + statMult(d, 'spd')) / 2, ak};
}
// Al ganar un combate: cada rival vencido da EVs en su mejor estadística a todo tu equipo
function gainEVs(foeDex){
  if(TRAIN.evPerFoe <= 0) return;
  team.forEach(id => {
    const ev = evOf(id);
    foeDex.forEach(fd => {
      const b = mon(fd).base, k = STAT_KEYS.reduce((best, s) => b[s] > b[best] ? s : best, 'hp');
      const room = Math.min(TRAIN.evCap - ev[k], TRAIN.evTotal - STAT_KEYS.reduce((s, x) => s + ev[x], 0));
      if(room > 0) ev[k] += Math.min(room, TRAIN.evPerFoe);
    });
    save.ev[id] = ev;
  });
  persist();
}

// ---------------------------------------------------------------------
// HABILIDADES. Cada Pokémon tiene 2 posibles (la Cápsula alterna entre ellas).
// Para poner las oficiales de un Pokémon: ABILITIES[25] = ['Elec. Estática', 'Pararrayos'] (en data.js).
// Si no las tiene, se reparten según su tipo con este reparto. Por ahora solo informan (no cambian el combate).
// ---------------------------------------------------------------------
const ABIL_POOL = {
  normal:['Intimidación','Agallas','Adaptable'], fuego:['Mar Llamas','Absorbe Fuego','Cuerpo Llama'], agua:['Torrente','Absorbe Agua','Nado Rápido'],
  planta:['Espesura','Clorofila','Cura Natural'], electrico:['Elec. Estática','Pararrayos','Electromotor'], hielo:['Manto Níveo','Nevada','Presión'],
  lucha:['Foco Interno','Agallas','Impasible'], veneno:['Punto Tóxico','Hedor','Cuerpo Puro'], tierra:['Velo Arena','Chorro Arena','Robustez'],
  volador:['Vista Lince','Levitación','Presión'], psiquico:['Sincronía','Foco Interno','Muro Mágico'], bicho:['Enjambre','Ojo Compuesto','Polvo Escudo'],
  roca:['Robustez','Cabeza Roca','Roca Sólida'], fantasma:['Levitación','Cuerpo Maldito','Presión'], dragon:['Mudar','Presión','Multiescala'],
  siniestro:['Presión','Competitivo','Autoestima'], acero:['Cuerpo Puro','Robustez','Metal Pesado'], hada:['Gran Encanto','Espejo Mágico','Muro Mágico']
};
const ABIL_DESC = {
  'Intimidación':'Al entrar, baja el Ataque del rival.', 'Agallas':'Sube el Ataque si tiene un problema de estado.', 'Adaptable':'Potencia los ataques de su propio tipo.',
  'Mar Llamas':'Potencia el fuego cuando le quedan pocos PS.', 'Absorbe Fuego':'Los ataques de fuego le curan.', 'Cuerpo Llama':'Puede quemar a quien le toca.',
  'Torrente':'Potencia el agua cuando le quedan pocos PS.', 'Absorbe Agua':'Los ataques de agua le curan.', 'Nado Rápido':'Sube su Velocidad bajo la lluvia.',
  'Espesura':'Potencia la planta cuando le quedan pocos PS.', 'Clorofila':'Sube su Velocidad con sol.', 'Cura Natural':'Se cura de los estados al cambiar.',
  'Elec. Estática':'Puede paralizar a quien le toca.', 'Pararrayos':'Atrae y absorbe los ataques eléctricos.', 'Electromotor':'Los ataques eléctricos le suben la Velocidad.',
  'Manto Níveo':'Esquiva más con granizo.', 'Nevada':'Al entrar, hace que nieve.', 'Presión':'El rival gasta más energía al atacar.',
  'Foco Interno':'No se deja amedrentar.', 'Impasible':'Sube su Velocidad si lo amedrentan.', 'Punto Tóxico':'Puede envenenar a quien le toca.',
  'Hedor':'Sus golpes pueden amedrentar.', 'Cuerpo Puro':'Nadie le baja las estadísticas.', 'Velo Arena':'Esquiva más en tormenta de arena.',
  'Chorro Arena':'Al entrar, levanta una tormenta de arena.', 'Robustez':'Aguanta un golpe mortal con 1 PS.', 'Vista Lince':'Su precisión no baja.',
  'Levitación':'Flota: los ataques de tierra no le afectan.', 'Sincronía':'Pasa sus estados al rival.', 'Muro Mágico':'Solo le dañan los ataques directos.',
  'Enjambre':'Potencia el bicho cuando le quedan pocos PS.', 'Ojo Compuesto':'Sube su precisión.', 'Polvo Escudo':'Bloquea los efectos secundarios de los golpes.',
  'Cabeza Roca':'No sufre daño de retroceso.', 'Roca Sólida':'Recibe menos daño de los golpes muy eficaces.', 'Cuerpo Maldito':'Puede anular el ataque que lo golpea.',
  'Mudar':'Puede curarse de los estados.', 'Multiescala':'Recibe menos daño con los PS al máximo.', 'Competitivo':'Sube su At. Esp. si le bajan una estadística.',
  'Autoestima':'Sube su Ataque al vencer a un rival.', 'Metal Pesado':'Pesa el doble.', 'Gran Encanto':'Puede enamorar a quien le toca.', 'Espejo Mágico':'Refleja los movimientos de estado.'
};
function abilitiesOf(d){
  const m = mon(d), c = ABILITIES[d];
  if(Array.isArray(c) && c.length >= 2) return c.slice(0, 2);
  const p1 = ABIL_POOL[m.types[0]], p2 = ABIL_POOL[m.types[1] || m.types[0]];
  const a = typeof c === 'string' ? c : p1[d % 3];
  let b = p2[(d + 1) % 3]; if(b === a) b = [...p2, ...p1].find(x => x !== a);
  return [a, b];
}
const abilIdx = d => save.abil[d] === 1 ? 1 : 0;
const abilityOf = d => abilitiesOf(d)[abilIdx(d)];
const abilDesc = n => ABIL_DESC[n] || 'Sin descripción todavía.';

// ---------------------------------------------------------------------
// ATAQUES (MTs). Cada MT enseña un movimiento de MOVES y sustituye al que el Pokémon tenga en ese hueco.
// ---------------------------------------------------------------------
const movesOf = d => { const l = mon(d).mv.slice(); Object.entries(save.mv[d] || {}).forEach(([s, n]) => l[s - 1] = n); return l; };
const movesChanged = d => Object.keys(save.mv[d] || {}).length > 0;
// El Pokémon tal como entra en combate: con sus ataques cambiados (y el tipo de cada ataque, que sale del propio movimiento)
function playerMon(d){
  const m = mon(d); if(!movesChanged(d)) return m;
  const mt = (m.mt || [m.types[0], m.types[1] || m.types[0], m.types[0]]).slice();
  Object.entries(save.mv[d]).forEach(([s, n]) => { const k = {1:0, 2:1, 4:2}[s]; if(k !== undefined && MOVES[n]) mt[k] = MOVES[n].t; });
  return Object.assign({}, m, {mv: movesOf(d), mt});
}
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const MT_LIST = Object.keys(MOVES).sort((a, b) => a.localeCompare(b, 'es'));
const MT_ID = {}; MT_LIST.forEach(n => MT_ID['mt_' + slug(n)] = n);       // 'mt_lanzallamas' -> 'Lanzallamas'
const mtId = n => 'mt_' + slug(n);
const mtMove = id => MT_ID[id] || null;
const myMTs = slot => Object.keys(save.items).filter(id => MT_ID[id] && held(id) > 0 && MOVES[MT_ID[id]].s === slot);

// ---- Stock diario: cambia solo a medianoche (hora local). Sale del nº de día, así no depende de nada guardado. ----
const DAY_MS = 86400000;
const dayNumber = (t = Date.now()) => { const d = new Date(t); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS); };
const nextReset = (t = Date.now()) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime(); };
function mulberry(a){ return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mtStock(day = dayNumber()){
  const r = mulberry(day * 7919 + 20241), out = [];
  for(let s = 1; s <= 4; s++){
    const pool = MT_LIST.filter(n => MOVES[n].s === s);
    for(let i = pool.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    out.push(...pool.slice(0, TRAIN.mtPerSlot));
  }
  return out;
}
function mtBoughtToday(){ const d = dayNumber(); if(!save.mtBought || save.mtBought.day !== d) save.mtBought = {day: d, n: {}}; return save.mtBought.n; }
const mtLeft = id => TRAIN.mtStockEach - (mtBoughtToday()[id] || 0);

// ---------------------------------------------------------------------
// Objetos de mejora e iconos (dibujados en píxeles, sin imágenes externas)
// ---------------------------------------------------------------------
function gridIcon(rows, pal){
  let r = ''; rows.forEach((row, y) => [...row].forEach((c, x) => { if(pal[c]) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${pal[c]}"/>`; }));
  return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges">${r}</svg>`);
}
function discRows(inner){                                          // disco de 12x12 (chapa y MT); inner(r, dx, dy) decide el color de cada punto
  const rows = [];
  for(let y = 0; y < 12; y++){ let s = ''; for(let x = 0; x < 12; x++){ const dx = x - 5.5, dy = y - 5.5; s += inner(Math.hypot(dx, dy), dx, dy); } rows.push(s); }
  return rows;
}
const capIcon = pal => gridIcon(discRows((r, dx, dy) => r > 6 ? '.' : r > 5.2 ? 'o' : (dx + dy < -4 && r < 4.6) ? 'h' : (r > 4.2 || dx + dy > 4.5) ? 'd' : 'y'), pal);
const ICON_CAP = capIcon({o:'#7a4a00', y:'#ffcc33', h:'#fff3a8', d:'#d49a12'});            // dorada
const ICON_PLATA = capIcon({o:'#3a4350', y:'#c8d0dc', h:'#ffffff', d:'#8d97a8'});          // plateada
const ICON_MINT = gridIcon(['....oooo....', '..oogggglo..', '.oggggghllo.', 'oggghggggllo', 'ogghgggggllo', 'oggggggggllo', 'oggggggglllo', '.oggggglllo.', '..oggglllo..', '...ooollo...', '.....ss.....', '.....ss.....'],
  {o:'#0e4a24', g:'#4ccf6a', h:'#bff5c8', l:'#2f9a4c', s:'#8a5a2a'});
const ICON_CAPSULE = gridIcon(['............', '............', '..oooooooo..', '.orrhrwwbbo.', 'orrhrrwwbbbo', 'orrrrrwwbbbo', 'orrrrrwwbbbo', 'orrrrrwwbbbo', '.orrrrwwbbo.', '..oooooooo..', '............', '............'],
  {o:'#1a1a2e', r:'#e8493a', h:'#ffb3a8', w:'#f4f4f4', b:'#3ea6ff'});
const mtIcon = color => gridIcon(discRows((r, dx, dy) => r > 6 ? '.' : r > 5.2 ? 'o' : r < 1.5 ? 'o' : r < 2.4 ? 'd' : r < 3.3 ? 'w' : (dx + dy < -3 && r < 5) ? 'h' : 'c'),
  {o:'#101a33', c:color, w:'#f4f4f4', d:'#34405f', h:'#ffffff99'});
// Imágenes de tus carpetas: objetos/mts/<tipo en inglés>.png, objetos/mentas/<stat>.png y objetos/ivs/*.png.
// Si falta un archivo, se usa el icono dibujado en píxeles de arriba (trainFallback), así nunca sale un hueco vacío.
const TYPE_EN = {normal:'normal', fuego:'fire', agua:'water', planta:'grass', electrico:'electric', hielo:'ice', lucha:'fighting', veneno:'poison', tierra:'ground',
  volador:'flying', psiquico:'psychic', bicho:'bug', roca:'rock', fantasma:'ghost', dragon:'dragon', siniestro:'dark', acero:'steel', hada:'fairy'};
const MINT_FILE = {atk:'attack', def:'defense', spa:'special-attack', spd:'special-defense', spe:'speed'};    // la menta depende de la estadística que sube la naturaleza
const mintImg = n => 'objetos/mentas/' + (MINT_FILE[n[1]] || 'neutral') + '.png';                             // n = una entrada de NATURES
const IMG_CAPSULE = 'objetos/ivs/ability-capsule.png', IMG_CHAPA = 'objetos/ivs/chapa-dorada.png', IMG_PLATA = 'objetos/ivs/Chapa-plateada.png';       // (la Chapa Dorada aún no tiene imagen: usa el icono dibujado; si la creas con ese nombre, se usará sola)
function trainFallback(src){                                                                                   // icono dibujado equivalente a una imagen que no se ha podido cargar
  src = decodeURI(String(src || '')); let m;
  if((m = src.match(/objetos\/mts\/([a-z]+)\.png/))){ const t = Object.keys(TYPE_EN).find(k => TYPE_EN[k] === m[1]); return mtIcon(TC[t] || '#aaa'); }
  if(/objetos\/mentas\//.test(src)) return ICON_MINT;
  if(src.includes(IMG_CAPSULE)) return ICON_CAPSULE;
  if(src.includes(IMG_CHAPA)) return ICON_CAP;
  if(src.includes(IMG_PLATA)) return ICON_PLATA;
  return '';
}
document.addEventListener('error', e => { const i = e.target; if(i && i.tagName === 'IMG'){ const f = trainFallback(i.getAttribute('src')); if(f) i.src = f; } }, true);
const CONS = {
  chapa:   {n:'Chapa Dorada',          icon:IMG_CHAPA, p:TRAIN.price.chapa,   d:`Sube un IV (valor individual) de un Pokémon en +${TRAIN.chapaIV}. Máximo ${TRAIN.ivMax} por stat. Se usa en Equipo Pokémon > Ver datos.`},
  chapaplata:{n:'Chapa Plateada',      icon:IMG_PLATA, p:TRAIN.price.plata,   d:`Suma +${TRAIN.chapaEV} EVs (puntos de esfuerzo) a un stat. Máximo ${TRAIN.evCap} por stat y ${TRAIN.evTotal} en total. Se usa en Equipo Pokémon > Ver datos.`},
  menta:   {n:'Menta',                 icon:'objetos/mentas/neutral.png',    p:TRAIN.price.menta,   d:'Cambia la naturaleza de un Pokémon por la que elijas. Se usa en Equipo Pokémon > Ver datos.'},
  capsula: {n:'Cápsula de Habilidad',  icon:IMG_CAPSULE, p:TRAIN.price.capsula, d:'Cambia la habilidad de un Pokémon por su otra habilidad. Se usa en Equipo Pokémon > Ver datos.'}
};
const trainIcon = id => CONS[id] ? CONS[id].icon : MT_ID[id] ? 'objetos/mts/' + TYPE_EN[MOVES[MT_ID[id]].t] + '.png' : '';
const itemName = id => CONS[id] ? CONS[id].n : MT_ID[id] ? 'MT ' + MT_ID[id] : (ITEMS[id] ? ITEMS[id].n : id);
Object.keys(CONS).forEach(id => SHOP.push({id, n:CONS[id].n, d:CONS[id].d, p:CONS[id].p, cat:'mejora', icon:CONS[id].icon}));

// Reemplaza en la tienda los MTs del día (se llama al abrir la tienda y cuando cambia el día)
function refreshMtShop(){
  for(let i = SHOP.length - 1; i >= 0; i--) if(SHOP[i].cat === 'mt') SHOP.splice(i, 1);
  mtStock().forEach(n => { const mv = MOVES[n];
    SHOP.push({id:mtId(n), n:'MT ' + n, p:TRAIN.price.mt[mv.s], cat:'mt', mv:n, icon:trainIcon(mtId(n)),
      d:`Enseña «${n}» (${TYPE_ES[mv.t]}) en el hueco de ${SLOT_NAMES[mv.s]}. Se gasta al usarla.`}); });
}
function buyError(id, n){                                             // por qué ha fallado una compra
  const it = SHOP.find(s => s.id === id);
  if(!it) return 'Ese MT ya no está a la venta: el stock ha cambiado.';
  if(it.cat === 'mt' && mtLeft(id) <= 0) return 'Agotado hasta mañana.';
  if(it.cat === 'mt' && n > mtLeft(id) && save.bp >= it.p * n) return `Solo quedan ${mtLeft(id)} de este MT hoy.`;
  return 'No tienes suficientes Puntos de Batalla.';
}

// ---------------------------------------------------------------------
// Acciones de personalización. Devuelven '' si todo fue bien, o el motivo del fallo.
// ---------------------------------------------------------------------
function useChapa(d, k){                                                    // Chapa Dorada: +IV
  if(held('chapa') < 1) return 'No tienes Chapas Doradas. Compra en la Tienda > Mejoras.';
  const iv = ivOf(d); if(iv[k] >= TRAIN.ivMax) return `El IV de ${STAT_NAMES[k]} ya está al máximo (${TRAIN.ivMax}).`;
  iv[k] = Math.min(TRAIN.ivMax, iv[k] + TRAIN.chapaIV);
  const c = capOf(d); c.gold++; save.capUsed[d] = c; spend('chapa'); persist(); return '';
}
function evRoom(d, k){ return Math.max(0, Math.min(TRAIN.evCap - evOf(d)[k], TRAIN.evTotal - evSum(d))); }   // cuántos EVs caben aún en ese stat
function useChapaPlata(d, k){                                               // Chapa Plateada: +EV
  if(held('chapaplata') < 1) return 'No tienes Chapas Plateadas. Compra en la Tienda > Mejoras.';
  const room = evRoom(d, k);
  if(room <= 0) return evOf(d)[k] >= TRAIN.evCap ? `Los EVs de ${STAT_NAMES[k]} ya están al máximo (${TRAIN.evCap}).` : `Ya tiene el máximo de EVs en total (${TRAIN.evTotal}).`;
  const add = Math.min(TRAIN.chapaEV, room), ev = evOf(d), cp = evCapOf(d);
  ev[k] += add; cp[k] += add; save.ev[d] = ev; save.evCap[d] = cp;
  const c = capOf(d); c.silver++; save.capUsed[d] = c; spend('chapaplata'); persist(); return '';
}
// Restablecer: vuelve atrás lo que hicieron las chapas y devuelve las chapas gastadas (los IV de nacimiento y los EVs de combate no se pierden)
function resetIVs(d){
  const c = capOf(d); if(c.gold < 1) return 'No has gastado Chapas Doradas en este Pokémon.';
  ivOf(d); save.iv[d] = Object.assign({}, save.ivBase[d]);
  save.items.chapa = held('chapa') + c.gold; c.gold = 0; save.capUsed[d] = c; persist(); return '';
}
function resetEVs(d){
  const c = capOf(d); if(c.silver < 1) return 'No has gastado Chapas Plateadas en este Pokémon.';
  const ev = evOf(d), cp = evCapOf(d); STAT_KEYS.forEach(k => ev[k] = Math.max(0, ev[k] - cp[k]));
  save.ev[d] = ev; delete save.evCap[d];
  save.items.chapaplata = held('chapaplata') + c.silver; c.silver = 0; save.capUsed[d] = c; persist(); return '';
}
function useMenta(d, idx){
  if(held('menta') < 1) return 'No tienes Mentas. Compra en la Tienda > Mejoras.';
  if(!NATURES[idx]) return 'Naturaleza no válida.';
  if(natureOf(d) === NATURES[idx]) return 'Ya tiene esa naturaleza.';
  save.nat[d] = idx; spend('menta'); persist(); return '';
}
function useCapsula(d, i){
  if(held('capsula') < 1) return 'No tienes Cápsulas de Habilidad. Compra en la Tienda > Mejoras.';
  if(i === abilIdx(d) || !abilitiesOf(d)[i]) return 'Ya tiene esa habilidad.';
  save.abil[d] = i; spend('capsula'); persist(); return '';
}
function useMT(d, id){
  const n = mtMove(id); if(!n || held(id) < 1) return 'No tienes ese MT.';
  const s = MOVES[n].s; if(movesOf(d)[s - 1] === n) return 'Ya conoce ese movimiento.';
  save.mv[d] = save.mv[d] || {}; save.mv[d][s] = n;
  if(mon(d).mv[s - 1] === n) delete save.mv[d][s];                  // si vuelve a ser el original, no hace falta guardarlo
  if(!Object.keys(save.mv[d]).length) delete save.mv[d];
  spend(id); persist(); return '';
}
function resetMoves(d){ delete save.mv[d]; persist(); }             // volver a los ataques originales (gratis, el MT usado no se devuelve)
