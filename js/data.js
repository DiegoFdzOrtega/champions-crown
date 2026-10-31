"use strict";
/* =====================================================================
   1) DATOS: aquí cambias Pokémon, pisos, ataques y carpeta de sprites
   ===================================================================== */
let W = 960;                  // ancho lógico: se adapta a la ventana (lo calcula resize())
const PVP_W = 960;            // ancho FIJO de la arena en un combate online (los dos jugadores deben simular exactamente el mismo campo, aunque sus ventanas sean distintas)
let LOCKW = 0;                // si no es 0, W vale siempre esto (lo pone draw() mientras haya un combate online) y la imagen se centra con barras a los lados
const H = 540;                // alto lógico fijo
const ESCALA = 2;             // los sprites se dibujan 2 veces más grandes
const CARPETA = 'pokemon';    // sprites: pokemon/<número de Pokédex>/Walk.png ...
const FONT = '"Press Start 2P","Courier New",monospace';

// Colores de los 18 tipos
const TC = {normal:'#a8a878',fuego:'#f08030',agua:'#6890f0',planta:'#78c850',electrico:'#f8d030',
  hielo:'#98d8d8',lucha:'#c03028',veneno:'#a040a0',tierra:'#e0c068',volador:'#a890f0',
  psiquico:'#f85888',bicho:'#a8b820',roca:'#b8a038',fantasma:'#705898',dragon:'#7038f8',
  siniestro:'#705848',acero:'#b8b8d0',hada:'#ee99ac'};

// Tabla de tipos: tipo del ataque -> [muy eficaz contra, poco eficaz contra, no afecta a]
const CH = {
  normal:[[],['roca','acero'],['fantasma']],
  fuego:[['planta','hielo','bicho','acero'],['fuego','agua','roca','dragon'],[]],
  agua:[['fuego','tierra','roca'],['agua','planta','dragon'],[]],
  planta:[['agua','tierra','roca'],['fuego','planta','veneno','volador','bicho','dragon','acero'],[]],
  electrico:[['agua','volador'],['electrico','planta','dragon'],['tierra']],
  hielo:[['planta','tierra','volador','dragon'],['fuego','agua','hielo','acero'],[]],
  lucha:[['normal','hielo','roca','siniestro','acero'],['veneno','volador','psiquico','bicho','hada'],['fantasma']],
  veneno:[['planta','hada'],['veneno','tierra','roca','fantasma'],['acero']],
  tierra:[['fuego','electrico','veneno','roca','acero'],['planta','bicho'],['volador']],
  volador:[['planta','lucha','bicho'],['electrico','roca','acero'],[]],
  psiquico:[['lucha','veneno'],['psiquico','acero'],['siniestro']],
  bicho:[['planta','psiquico','siniestro'],['fuego','lucha','veneno','volador','fantasma','acero','hada'],[]],
  roca:[['fuego','hielo','volador','bicho'],['lucha','tierra','acero'],[]],
  fantasma:[['psiquico','fantasma'],['siniestro'],['normal']],
  dragon:[['dragon'],['acero'],['hada']],
  siniestro:[['psiquico','fantasma'],['lucha','siniestro','hada'],[]],
  acero:[['hielo','roca','hada'],['fuego','agua','electrico','acero'],[]],
  hada:[['lucha','dragon','siniestro'],['fuego','veneno','acero'],[]]
};
// Si el rival tiene 2 tipos, los multiplicadores se multiplican entre sí
function eff(atk, defTypes){
  let m = 1; const c = CH[atk];
  for(const d of defTypes) m *= c[2].includes(d) ? 0 : c[0].includes(d) ? 2 : c[1].includes(d) ? .5 : 1;
  return m;
}

// Pokémon: se construyen desde js/pokedata.js (los 1025, con 6 estadísticas cada uno).
//  - Vida en combate = HP base + 75 (nivel 50): Dragonite 91 -> 166, como en la página de referencia.
//  - Ataque en combate = el mayor entre Ataque y At. Esp. · Velocidad en combate = 110 + Vel. base x 0,8.
//  - 'mv' = nombres de los 4 ataques (cercano, disparo, mejora, fuerte); 'mt' = tipos de ataque.
const TY = {nor:'normal',fue:'fuego',agu:'agua',pla:'planta',ele:'electrico',hie:'hielo',luc:'lucha',ven:'veneno',
  tie:'tierra',vol:'volador',psi:'psiquico',bic:'bicho',roc:'roca',fan:'fantasma',dra:'dragon',sin:'siniestro',ace:'acero',had:'hada'};
const TYPE_ES = {normal:'Normal',fuego:'Fuego',agua:'Agua',planta:'Planta',electrico:'Eléctrico',hielo:'Hielo',lucha:'Lucha',
  veneno:'Veneno',tierra:'Tierra',volador:'Volador',psiquico:'Psíquico',bicho:'Bicho',roca:'Roca',fantasma:'Fantasma',
  dragon:'Dragón',siniestro:'Siniestro',acero:'Acero',hada:'Hada'};

// Regiones: nombre y rango de la Pokédex nacional. El orden de POKE_RAW es el mismo.
const REGIONS_DEX = [
  {n:'Kanto',a:1,b:151},   {n:'Johto',a:152,b:251},  {n:'Hoenn',a:252,b:386},
  {n:'Sinnoh',a:387,b:493},{n:'Teselia',a:494,b:649},{n:'Kalos',a:650,b:721},
  {n:'Alola',a:722,b:809}, {n:'Galar',a:810,b:905},  {n:'Paldea',a:906,b:1025}
];
const REGION_DEX = Object.fromEntries(REGIONS_DEX.map(r => [r.n, [r.a, r.b]]));
const regionOf = dex => (REGIONS_DEX.find(r => dex >= r.a && dex <= r.b) || REGIONS_DEX[0]).n;

const DEX = [];
REGIONS_DEX.forEach(r => POKE_RAW[r.n].split('\n').forEach(line => {
  const [name, t, st] = line.split('|'), [hp,atk,def,spa,spd,spe] = st.split(',').map(Number);
  DEX.push({dex: DEX.length + 1, name, types: t.split(',').map(x => TY[x]), base:{hp,atk,def,spa,spd,spe},
            bst: hp+atk+def+spa+spd+spe, hp: hp + 75, atk: Math.max(atk, spa), spd: Math.round(110 + spe*.8)});
}));
const DEX_TOTAL = DEX.length;

/* Pokémon SIN sprites (de momento): no salen en el Gachapon, la Pokédex, el equipo ni el perfil. Siguen existiendo en los datos y, si ya los tenías,
   se quedan guardados en tu partida (no se pierde nada). Para volver a ponerlos: mete su carpeta pokemon/<nº>/ y borra su número de esta lista. */
const NO_SPRITE = new Set([
  514, 516, 520, 522, 523, 538, 558, 564, 565, 591, 592, 593, 616, 626, 668, 732,         // Teselia y Kalos
  735, 756, 765, 837, 838, 839, 866, 870, 878, 893,         // Alola y Galar
  931, 942, 943, 944, 947, 948, 949, 950, 954, 956, 962, 973, 986, 993, 999, 1001, 1002, 1008, 1014, 1022, 1023          // Paldea
]);
const hidden = d => NO_SPRITE.has(d);
const regionSize = (a, b) => { let n = b - a + 1; NO_SPRITE.forEach(d => { if(d >= a && d <= b) n--; }); return n; };      // Pokémon de un rango sin contar los ocultos
const DEX_SHOWN = regionSize(1, DEX_TOTAL);
const boxCount = () => save.box.filter(d => !hidden(d)).length;                                                              // Pokémon que tienes y se ven

// Estos Pokémon tienen ataques con nombre propio (los demás los genera moves.js según su tipo)
const CUSTOM = {
  94:{mv:['Lengüetazo','Bomba Lodo','Maldición','Bola Sombra']},
  149:{mv:['Garra Dragón','Pulso Dragón','Danza Dragón','Cometa Draco'], mt:['dragon','dragon','dragon']},
  59:{mv:['Colmillo Ígneo','Lanzallamas','Agilidad','Envite Ígneo']},
  6:{mv:['Garra Dragón','Lanzallamas','Danza Espada','Llamarada'], mt:['dragon','fuego','fuego']},
  9:{mv:['Cabezazo','Hidropulso','Refugio','Hidrobomba']},
  143:{mv:['Golpe Cuerpo','Doble Filo','Amnesia','Hiperrayo']}
};
Object.entries(CUSTOM).forEach(([d,o]) => Object.assign(DEX[d-1], o));
const mon = dex => DEX[dex - 1];
const ROSTER = [3,6,9].map(mon);      // tu equipo inicial: Venusaur, Charizard y Blastoise (la caja empieza solo con estos 3)

// ---- Rareza: se calcula sola con las estadísticas totales (BST) y estas listas ----
const RARITIES = [
  {id:'legendary', n:'Legendaria', ic:'🔮', col:'#ff3ea5'},
  {id:'epic',      n:'Épica',      ic:'🔥', col:'#ffcc33'},
  {id:'rare',      n:'Rara',       ic:'💎', col:'#3ea6ff'},
  {id:'uncommon',  n:'Poco común', ic:'🔷', col:'#4ccf9a'},
  {id:'common',    n:'Común',      ic:'⚪', col:'#9aa6b8'}
];
const RAR = Object.fromEntries(RARITIES.map((r,i) => [r.id, {...r, rank:i}]));
// Legendarios y míticos (nº de Pokédex)
const LEGENDARY = new Set([144,145,146,150,151, 243,244,245,249,250,251, 377,378,379,380,381,382,383,384,385,386,
  480,481,482,483,484,485,486,487,488,489,490,491,492,493, 494,638,639,640,641,642,643,644,645,646,647,648,649,
  716,717,718,719,720,721, 772,773,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800,801,802,803,804,805,806,807,808,809,
  888,889,890,891,892,893,894,895,896,897,898, 1001,1002,1003,1004,1007,1008,1009,1010,1014,1015,1016,1017,1020,1021,1022,1023,1024,1025]);
// Pseudolegendarios (los 10 de 600 puntos base): cuentan como Legendarios
[149,248,373,376,445,635,706,784,887,998].forEach(d => LEGENDARY.add(d));
// Épicos: evoluciones finales de los iniciales y todo lo que pase de 580 puntos base
const EPIC = new Set([3,6,9,154,157,160,254,257,260,389,392,395,497,500,503,
  652,655,658,724,727,730,812,815,818,908,911,914]);
function rarityOf(dex){
  if(LEGENDARY.has(dex)) return 'legendary';
  const b = mon(dex).bst;
  return EPIC.has(dex) || b >= 580 ? 'epic' : b >= 500 ? 'rare' : b >= 400 ? 'uncommon' : 'common';
}
DEX.forEach(m => m.rar = rarityOf(m.dex));

// ---- Naturalezas (solo se muestran en la Pokédex: suben un 10% una estadística y bajan otra) ----
const NATURES = [
  ['Fuerte'],['Huraña','atk','def'],['Audaz','atk','spe'],['Firme','atk','spa'],['Pícara','atk','spd'],
  ['Osada','def','atk'],['Dócil'],['Plácida','def','spe'],['Agitada','def','spa'],['Floja','def','spd'],
  ['Miedosa','spe','atk'],['Activa','spe','def'],['Seria'],['Alegre','spe','spa'],['Ingenua','spe','spd'],
  ['Modesta','spa','atk'],['Mansa','spa','def'],['Tímida'],['Afable','spa','spe'],['Alocada','spa','spd'],
  ['Serena','spd','atk'],['Amable','spd','def'],['Cauta','spd','spa'],['Grosera','spd','spe'],['Rara']
];
// Descripción y habilidad de cada Pokémon: rellénalas por número, p. ej. LORE[25] = '...'; ABILITIES[25] = 'Elec. Estática'
const LORE = {}, ABILITIES = {};
ABILITIES[529] = ABILITIES[530] = ['Ímpetu Arena', 'Cuerpo Puro'];   // Drilbur y Excadrill: Ímpetu Arena (Sand Rush) dobla la Velocidad en tormenta de arena
const STAT_NAMES = {hp:'PS', atk:'Ataque', def:'Defensa', spa:'At. Esp.', spd:'Def. Esp.', spe:'Velocidad'};

// Historia de Kanto: 8 líderes + Alto Mando (4) + Campeón. 'id' es el nombre de su imagen (ver LEADER_PATHS).
//  kind: 'lider' | 'alto' | 'campeon'   lvl: nivel del equipo rival   diff: clave de DIFF (dificultad)
//  teams: se rellena solo desde js/teams.js (plantillas con naturaleza, habilidad, objeto, IVs, EVs y movimientos de cada Pokémon).
//         Aquí también vale un número de Pokédex (movimientos automáticos) o {dex, mv:[golpe, disparo, mejora, ataque fuerte]}.
const LIDER = (id, leader, tag, teams) => ({id, leader, tag, kind:'lider', lvl:120, diff:'dificil', teams});
const FLOORS = [
  LIDER('brock',    'Brock',     'Roca',      []),
  LIDER('misty',    'Misty',     'Agua',      []),
  LIDER('lt_surge', 'Lt. Surge', 'Eléctrico', []),
  LIDER('erika',    'Erika',     'Planta',    []),
  LIDER('koga',     'Koga',      'Veneno',    []),
  LIDER('sabrina',  'Sabrina',   'Psíquico',  []),
  LIDER('blaine',   'Blaine',    'Fuego',     []),
  LIDER('giovanni', 'Giovanni',  'Tierra',    []),

  // ---- Alto Mando (MUY DIFÍCIL): equipos fijos de 6, siempre los mismos ----
  {id:'lorelei', leader:'Lorelei', tag:'Hielo', kind:'alto', lvl:125, diff:'muy_dificil', teams:[]},
  {id:'bruno', leader:'Bruno', tag:'Lucha', kind:'alto', lvl:127, diff:'muy_dificil', teams:[]},
  {id:'agatha', leader:'Agatha', tag:'Fantasma', kind:'alto', lvl:130, diff:'muy_dificil', teams:[]},
  {id:'lance', leader:'Lance', tag:'Dragón', kind:'alto', lvl:132, diff:'muy_dificil', teams:[]},

  // ---- Campeón de la Liga: Azul. Equipo fijo, el más difícil de todos ----
  {id:'azul', leader:'Azul', tag:'Campeón', kind:'campeon', lvl:135, diff:'muy_dificil', teams:[]}
];

// Cada combate de la Historia tiene: region (Kanto, Johto...), idx (posición dentro de su región: 0 = primer líder),
// dn (índice de dificultad: sube el vida/daño del rival, ver DIFF) y place (ciudad, solo para mostrar). Kanto: dn = idx.
FLOORS.forEach((F, i) => { F.region = 'Kanto'; F.idx = i; F.dn = i; });
const floorsOf = region => FLOORS.filter(F => F.region === region);                    // combates de una región, en orden
/* MODO VER (temporal): las regiones que pongas en true se abren y se ven TODOS sus combates (como si ya los hubieras superado), sin tocar tu progreso.
   Sirve para mirar equipos y estadios. Al ganar en una región en modo ver NO se guarda progreso, EVs, trofeo ni recompensas. Para quitarlo: Sinnoh: false. */
const PREVIEW = {Sinnoh: false, 'Unova / Teselia': false, Kalos: false};
// HISTORIA CON DOS AVANCES (js/dificultad.js): cada dificultad ('facil' / 'dificil') tiene su propio progreso y sus propias Ligas superadas.
// Difícil usa los campos de siempre (save.record, save.prog, save.champ: así las partidas antiguas siguen intactas) y Fácil usa save.easy = {record, prog, champ}.
// trk(m) devuelve el objeto de la dificultad m (por defecto, la que tienes activa en save.storyMode): trk().record · trk().prog · trk().champ
const trk = m => (m || save.storyMode) === 'facil' ? save.easy : save;
// Lo que superas en DIFÍCIL cuenta también en FÁCIL (no al revés): el avance de Fácil es el mejor de los dos, así quien ya iba en Difícil lo tiene todo hecho en Fácil.
const champOf = (region, m) => { const f = (m || save.storyMode) === 'facil'; return !!trk(m).champ[region] || (f && !!save.champ[region]); };      // ¿eres Campeón de esa región en esa dificultad?
const champAny = region => champOf(region, 'facil') || champOf(region, 'dificil');                   // en cualquiera de las dos: lo usan trofeos, Torre Batalla, logros y el perfil
const progRaw = (T, region) => region === 'Kanto' ? T.record : ((T.prog && T.prog[region]) || 0);
const progOf = (region, m) => { const f = (m || save.storyMode) === 'facil', v = progRaw(trk(m), region); return f ? Math.max(v, progRaw(save, region)) : v; };      // combates ya superados en esa región (Kanto usa record, así no se pierde ninguna partida). En Fácil cuenta también lo de Difícil
const progAny = region => Math.max(progOf(region, 'facil'), progOf(region, 'dificil'));              // el mejor de los dos avances      // combates ya superados en esa región (Kanto sigue usando save.record, así no se pierde ninguna partida)
const setProg = (region, n, m) => { const T = trk(m); if(region === 'Kanto') T.record = n; else T.prog[region] = n; };
const progTotal = () => REGIONS_PLAYED().reduce((a, r) => a + progOf(r), 0);
const REGIONS_PLAYED = () => [...new Set(FLOORS.map(F => F.region))];

// Dificultad. El motor no tiene niveles: el nivel se traduce en multiplicadores de vida (hm), daño (dm) y velocidad,
// proporcionales al nivel (nivel 120 = x1,20 respecto al nivel 100 de tus Pokémon). 'n' es la posición en la Historia (0 = Brock).
// Para ajustar la dificultad de toda la Historia basta con tocar estos números.
const DIFF = {
  dificil:     {n:'DIFÍCIL',     hm:n => .70 + n*.06,       dm:n => .85 + n*.04,       skill:n => Math.min(1, .60 + n*.05)},
  muy_dificil: {n:'MUY DIFÍCIL', hm:n => 1.15 + (n-8)*.04,  dm:n => 1.20 + (n-8)*.04,  skill:n => 1}
};
// Dificultad FÁCIL de la Historia (save.storyMode === 'facil', se alterna con el botón de la pantalla Historia; ver js/dificultad.js): multiplicadores que se aplican ENCIMA de la dificultad normal.
// hm = vida del rival · dm = daño del rival · skill = lo rápido y bien que reacciona · spdm = su velocidad. Para equilibrarlo basta con tocar estos cuatro números (1 = igual que en Difícil).
const EASY = {hm:.60, dm:.50, skill:.70, spdm:.90};
function floorStats(n){
  const F = FLOORS[n], D = DIFF[F.diff], k = F.lvl / 100, d = F.dn ?? n;                // d = índice de dificultad del combate (F.dn)
  const E = (typeof save !== 'undefined' && save.storyMode === 'facil') ? EASY : {hm:1, dm:1, skill:1, spdm:1};
  return {lvl:F.lvl, hm:D.hm(d)*k*E.hm, dm:D.dm(d)*k*E.dm, skill:D.skill(d)*E.skill, spdm:(1 + (k-1)*.4)*E.spdm};
}

// Dónde buscar los retratos de líderes, Alto Mando y Campeón. Se prueba cada ruta en orden; {id} es el 'id' de arriba
// (p. ej. lorelei). Añade aquí la ruta de tu carpeta de sprites si es otra.
const LEADER_PATHS = ['lideres/{Region}/{Id2}.png', 'lideres/{Region}/{Id}.png', 'lideres/{Region}/{id}.png', 'lideres/{id}.png',
                      'sprites/kanto/{Id}.png', 'sprites/kanto/{id}.png', 'Torre Batalla/sprites/kanto/{Id}.png',
                      'lideres/Kanto/{Id2}.png'];            // último recurso: el retrato de Kanto (sirve para Koga, Bruno y Lance, que también están en Johto)
// Nombre de archivo del retrato cuando no coincide con el id (Koga, Bruno y Lance de Johto tienen id propio para no chocar con los de Kanto).
// Se prueban todos los nombres de la lista: lideres/Johto/Pegaso.png, lideres/Johto/Morti.png (o Moti.png)...
const LEADER_FILE = {j_koga:['koga'], j_bruno:['bruno'], j_lance:['lance'], morti:['morti', 'moti'], anton:['anton', 'antón'], anibal:['anibal', 'aníbal'], debora:['debora', 'débora'],
                     // Hoenn: los archivos llevan tilde y el de Vito y Leti es un solo retrato (lideres/Hoenn/Vito_y_Leti.png)
                     fatima:['fátima'], nivea:['nívea'], dracon:['dracón'], vitoleti:['Vito_y_Leti'],
                     // Sinnoh: los de Acerón y Alecrán llevan tilde (lideres/Sinnoh/Acerón.png, lideres/Sinnoh/Alecrán.png)
                     aceron:['acerón'], alecran:['alecrán'],
                     // Teselia: Anís, Maíz y Yakón llevan tilde (lideres/Unova/Anís.png, Maíz.png, Yakón.png)
                     anis:['anís'], maiz:['maíz'], yakon:['yakón'], millo:['cilan'], iris:['lirio'],
                     // Kalos: los archivos están en minúsculas con el nombre inglés (lideres/kalos/viola.png...) · Ástrid y Édel llevan tilde en el juego pero no en el archivo
                     violeta:['viola'], lino:['grant'], corelia:['korrina'], amaro:['ramos'], lem:['clemont'], valeria:['valerie'], astrid:['olympia'], edel:['wulfric'],
                     narciso:['siebold'], tileo:['wikstrom'], agata:['agata', 'drasna'], dianta:['diantha']};
// Carpeta de retratos de cada región cuando no se llama igual que ella (la región se llama 'Unova / Teselia' pero la carpeta es lideres/Unova)
const REGION_DIR = {'Unova / Teselia':'Unova', Kalos:'kalos'};

// Gachapon: cada región tiene su banner. Los Pokémon que salen son los de su rango de Pokédex.
const BANNERS = Object.fromEntries(Object.keys(REGION_DEX).map(r => [r, r]));   // el banner solo lleva el nombre de la región
// Probabilidad de cada rareza en una tirada. El resto de Pokémon sale "Común". Shiny es aparte.
const GACHA_RATES = {legendary:.01, epic:.04, rare:.15, uncommon:.30, common:.50};
const SHINY_RATE = .01;
// AMULETO ARCOÍRIS: al completar la Pokédex de una región (logro «Pokédex de ...») te dan el Amuleto Arcoíris de esa región. Mientras lo tengas, las tiradas del
// Gachapon de ESA región sacan shiny con CHARM_RATE en vez de SHINY_RATE (3 % en vez de 1 %: el triple, como en los juegos). Se guarda en save.charms {Región:true}.
const CHARM_RATE = .03, CHARM_IMG = 'objetos/amuleto/Amuleto_Iris.png';
const PITY_MAX = 70;          // tiradas sin legendaria: a la nº 70 sale una sí o sí
const DUP_BP = {common:5, uncommon:10, rare:25, epic:60, legendary:150};   // monedas (PB) por un repetido

// ---------------------------------------------------------------------------------------------
// OBJETOS DE COMBATE (se compran en la TIENDA y se equipan en EQUIPO POKÉMON; 1 por Pokémon)
//   n: nombre oficial en español · img: archivo de la carpeta objetos/ · cat: pestaña de la tienda
//   p: precio en Puntos de Batalla · d: lo que hace en ESTE juego · og: lo que hace en los juegos de Pokémon
//   type: (solo objetos de tipo) tipo de ataque que potencian
// Para añadir uno nuevo: copia una línea, ponle un id nuevo, su imagen en objetos/ y programa su efecto en combat.js
// (los números de cada efecto están en IFX, justo debajo).
// ---------------------------------------------------------------------------------------------
const ITEM_CATS = {ataque:'Ataque', defensa:'Defensa', tipo:'Tipos', util:'Utilidad'};
const ITEMS = {
  // --- Ataque
  vidasfera: {n:'Vidasfera',          img:'life_orb.png',      cat:'ataque',  p:120, d:'+30% de daño, pero cada ataque te quita un 2,5% de salud.',                       og:'En los juegos: +30% de daño y pierdes 10% de PS por ataque.'},
  cintaelec: {n:'Cinta Elección',     img:'choice_band.png',   cat:'ataque',  p:120, d:'+40% de daño en tus golpes cuerpo a cuerpo (clic izquierdo).',                      og:'En los juegos: +50% de Ataque, pero solo puedes usar un movimiento.'},
  gafaselec: {n:'Gafas Elección',     img:'choice_specs.png',  cat:'ataque',  p:120, d:'+40% de daño en tus disparos (clic derecho y ataque fuerte E).',                    og:'En los juegos: +50% de Ataque Especial, pero solo puedes usar un movimiento.'},
  gafasesp:  {n:'Gafas Especiales',   img:'gafas_especiales.png',  cat:'ataque',  p:50,  d:'+15% de daño en tus disparos (clic derecho y ataque fuerte E).',                    og:'En los juegos: +10% de potencia en los movimientos especiales.'},
  cinturon:  {n:'Cinturón de Experto',img:'black-belt.png',   cat:'ataque',  p:100, d:'+20% de daño cuando tu golpe es muy eficaz (x2 o más).',                            og:'En los juegos: +20% de daño en movimientos supereficaces.'},
  periscopio:{n:'Periscopio',         img:'Periscopio.png',    cat:'ataque',  p:80,  d:'Tus golpes críticos son más probables: +7% (de 4,5% a 11,5%).',                     og:'En los juegos: sube un nivel el índice de golpe crítico.'},
  // --- Defensa
  chaleco:   {n:'Chaleco Asalto',     img:'assault_vest.png',  cat:'defensa', p:120, d:'Recibes un 20% menos de daño.',                                                     og:'En los juegos: +50% de Defensa Especial, pero no deja usar movimientos de estado.'},
  aguante:   {n:'Banda Aguante',      img:'Banda_aguante.png', cat:'defensa', p:120, d:'Una vez por combate: si un golpe te iba a debilitar estando con la salud al máximo, te quedas con 1 PS.', og:'En los juegos: aguanta un golpe mortal con 1 PS y se consume.'},
  casco:     {n:'Casco Dentado',      img:'Casco_Dentado.png', cat:'defensa', p:80,  d:'Quien te golpea de cerca pierde un 8% de su salud máxima.',                         og:'En los juegos: el atacante que te toca pierde 1/6 de sus PS.'},
  // --- Tipos (+20% de daño en los ataques de ese tipo)
  gafasol:   {n:'Gafas de Sol',       img:'black_glasses.png', cat:'tipo',    p:50,  type:'siniestro', d:'+20% de daño en tus ataques de tipo Siniestro.',                       og:'En los juegos: +20% de potencia en movimientos Siniestro.'},
  flecha:    {n:'Flecha Venenosa',    img:'poison_barb.png',   cat:'tipo',    p:50,  type:'veneno',    d:'+20% de daño en tus ataques de tipo Veneno.',                          og:'En los juegos: +20% de potencia en movimientos Veneno.'},
  cuchara:   {n:'Cuchara Torcida',    img:'twisted_spoon.png', cat:'tipo',    p:50,  type:'psiquico',  d:'+20% de daño en tus ataques de tipo Psíquico.',                        og:'En los juegos: +20% de potencia en movimientos Psíquico.'},
  // --- Utilidad
  restos:    {n:'Restos',             img:'leftovers.png',     cat:'util',    p:80,  d:'Recuperas un 0,4% de tu salud máxima cada segundo.',                                og:'En los juegos: recupera 1/16 de los PS cada turno.'},
  cascabel:  {n:'Cascabel Concha',    img:'Cascabel_concha.png',cat:'util',   p:80,  d:'Recuperas un 15% del daño que infliges.',                                           og:'En los juegos: cura 1/8 del daño que causas.'},
  panuelo:   {n:'Pañuelo Elección',   img:'choice_scarf.png',  cat:'util',    p:80,  d:'+35% de velocidad.',                                                                og:'En los juegos: +50% de Velocidad, pero solo puedes usar un movimiento.'},
  roca:      {n:'Roca del Rey',       img:'kings_rock.png',    cat:'util',    p:100, d:'Cada golpe tiene un 10% de amedrentar al rival: no puede moverse ni atacar durante 0,6 s.', og:'En los juegos: 10% de probabilidad de amedrentar al rival.'}
};
// Números de los efectos (los usa combat.js). Cámbialos aquí para equilibrar.
const IFX = {tipo:1.2, cinta:1.4, gafaselec:1.4, gafasesp:1.15, cinturon:1.2, rocaProb:.10, rocaStun:.6, periscopio:.07, restos:.004};    // restos = fracción de la vida máxima que se recupera cada segundo (.004 = 0,4%)
const imgOf = id => ITEMS[id] ? 'objetos/' + ITEMS[id].img : (typeof trainIcon === 'function' ? trainIcon(id) : '');   // consumibles y MTs: iconos de training.js                // ruta de la imagen de un objeto

const SHOP = [
  {id:'ticket_n', n:'Ticket Gachapon Normal',    d:'1 tirada en el Gachapon de la región que elijas.', p:50,  cat:'ticket'},
  {id:'ticket_l', n:'Ticket Gachapon Legendario', d:'Una tirada x10 con al menos una Legendaria garantizada.', p:500, cat:'ticket'},
  ...Object.keys(ITEMS).map(id => ({id, n:ITEMS[id].n, d:ITEMS[id].d, p:ITEMS[id].p, cat:ITEMS[id].cat}))
];

// Hojas de sprites: velocidad (fps) y tamaño por defecto. El tamaño real se detecta solo (sprites.js).
const ANIMS = {
  Idle:  {w:32, h:40, n:3,  fps:4,  loop:true},
  Walk:  {w:40, h:40, n:6,  fps:10, loop:true},
  Attack:{w:64, h:72, n:11, fps:24, loop:false},
  Shoot: {w:32, h:32, n:6,  fps:16, loop:false},
  Charge:{w:32, h:40, n:10, fps:16, loop:false},
  Hurt:  {w:40, h:56, n:2,  fps:8,  loop:false},
  Faint: {w:32, h:24, n:4,  fps:6,  loop:false}
};

// Los 5 ataques (mismas teclas que la página de referencia)
// GOLPES CRÍTICOS. Cada golpe que acierta tiene 'chance' de ser crítico y hacer 'mult' veces más daño.
//  chance: probabilidad base (0.045 = 4,5 %)   mult: daño extra (1.5 = +50 %)
//  big: multiplica la probabilidad en los ataques fuertes (E). 1 = igual que los demás.
//  foe: multiplica la probabilidad cuando ataca el RIVAL. 1 = igual que tú; 0.5 = la mitad; 0 = el rival nunca da críticos.
const CRIT = {chance:.045, mult:1.5, big:1, foe:1};   // (el Periscopio suma +IFX.periscopio a 'chance')
const MV = [
  {n:'Carrera', key:'ESP',    cd:2,  en:0},
  {n:'Garra',   key:'CLIC',   cd:.5, en:8,  dmg:14},
  {n:'Pulso',   key:'CLIC D', cd:.8, en:14, dmg:12},
  {n:'Danza',   key:'Q',      cd:10, en:20},
  {n:'Meteoro', key:'E',      cd:8,  en:40, dmg:42}
];
const EN_REGEN = 12;                       // energía que recuperas por segundo (la barra azul). Ataque Q cuesta 20 y E cuesta 40: se ve cuánto falta en la barra de abajo
const mvName = (f,i) => i === 0 ? 'Carrera' : (f.m.mv && f.m.mv[i-1]) || MV[i].n;
