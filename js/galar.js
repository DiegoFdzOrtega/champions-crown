"use strict";
/* =====================================================================
   25) GALAR: 10 líderes de gimnasio, Berto (Copa de Campeones) y el Campeón Lionel, con sus equipos de 6 Pokémon
   Se carga DESPUÉS de alola.js y ANTES de campo.js (que comprueba todos los equipos al final). No toca nada de las otras regiones.

   VERSIÓN DE REFERENCIA: Pokémon Espada y Escudo. Los equipos son los de la lista que dio Diego (noviembre 2026).
   Orden: Percy (Planta) · Cathy (Agua) · Naboru (Fuego) · Judith (Lucha) · Alistair (Fantasma) · Sally (Hada) · Morris (Roca) · Mel (Hielo)
          · Nerio (Siniestro) · Roy (Dragón). Copa de Campeones: Berto (Hada). Campeón: Lionel.
   (En la lista el líder de Fuego salía como «Nerio»: en España es Naboru (Kabu). Nerio es el de tipo Siniestro (Piers).)
   Judith y Alistair (y Morris y Mel) son de versiones distintas en el juego original: aquí están los cuatro.
   Galar no tiene Alto Mando: Berto (Copa de Campeones) ocupa ese hueco (kind 'alto'), y en la Liga sale como «Copa de Campeones».
   Retratos: assets/lideres/Galar/<id>.png (percy, cathy, naboru, judith, alistair, sally, morris, mel, nerio, roy, berto, lionel).

   CÓMO ESTÁ HECHO (igual que alola.js, ver teams.js):
     P(nº de Pokédex, 'Naturaleza', 'Habilidad', 'objeto', {EVs}, ['golpe', 'disparo', 'mejora', 'ataque fuerte'])
   - SIN SPRITE (NO_SPRITE en data.js) o SIN FORMA DE GALAR: se sustituye por el Pokémon más parecido. Cuando haya sprite, cámbialo aquí:
        Coalossal (839, Naboru) → Torkoal (324)        Coalossal (839, Morris) → Rhyperior (464)
        Falinks (870, Judith) → Hawlucha (701)          Mr. Rime (866, Lionel) → Mr. Mime (122) con movimientos de Hielo
        Yamask, Weezing, Darmanitan y Rapidash de Galar → su forma normal, con movimientos del tipo de Galar
          (Tierra-Fantasma, Veneno-Hada, Hielo y Psíquico-Hada).
   - «Pokémon inicial evolucionado» de Lionel → Inteleon (el de Naboru ya es Cinderace y el de Percy, Rillaboom).
   - Charizard Gigamax de Lionel: el juego no tiene Gigamax, así que megaevoluciona a Mega-Charizard X (el único de Galar que lo hace).

   DIFICULTAD: líderes lvl 164-173 (dn 11-18), Berto lvl 175 (dn 20) y Lionel lvl 176 (dn 23).
   RECOMPENSA: REWARD_REGION['Galar'] (teams.js). MÚSICA: lider_galar / alto_galar / campeon_galar (music.js, carpeta assets/musica/Galar/).
   ===================================================================== */
Object.assign(TEAMS, {
  // ---------------- LÍDERES ----------------
  percy: [     // Planta · Pueblo Hoja Turf (Percy / Milo)
    P(829, 'Modesta', 'Regenerador',   'restos',   {hp:252, spa:252, def:4}, ['Látigo Cepa',   'Hoja Afilada', 'Desarrollo',    'Rayo Solar']),   // Gossifleur
    P(830, 'Modesta', 'Regenerador',   'chaleco',  {hp:252, spa:252, def:4}, ['Látigo Cepa',   'Hoja Afilada', 'Drenadoras',    'Rayo Solar']),   // Eldegoss
    P(812, 'Firme',   'Espesura',      'cintaelec',{atk:252, spe:252, hp:4}, ['Látigo Cepa',   'Hoja Afilada', 'Danza Espada',  'Terremoto']),    // Rillaboom
    P(842, 'Modesta', 'Gula',          'restos',   {hp:252, spa:252, def:4}, ['Golpe Cuerpo',  'Pulso Dragón', 'Desarrollo',    'Rayo Solar']),   // Appletun
    P(547, 'Modesta', 'Bromista',      'gafasesp', {spa:252, spe:252, hp:4}, ['Carantoña',     'Viento Feérico','Viento Afín',  'Fuerza Lunar']), // Whimsicott
    P(598, 'Osada',   'Punta Acero',   'casco',    {hp:252, def:252, atk:4}, ['Garra Metal',   'Hoja Afilada', 'Defensa Férrea','Foco Resplandor']) // Ferrothorn
  ],
  cathy: [     // Agua · Pueblo Amura (Cathy / Nessa)
    P(118, 'Alegre',  'Nado Rápido',   'aguante',  {atk:252, spe:252, hp:4}, ['Acua Cola',     'Hidropulso',   'Danza Lluvia',  'Megacuerno']),   // Goldeen
    P(846, 'Alegre',  'Nado Rápido',   'cinturon', {atk:252, spe:252, hp:4}, ['Mordisco',      'Pistola Agua', 'Agilidad',      'Hidrobomba']),   // Arrokuda
    P(834, 'Firme',   'Mandíbula Fuerte','vidasfera',{atk:252, hp:252, def:4}, ['Acua Cola',   'Lanzarrocas',  'Danza Espada',  'Roca Afilada']), // Drednaw
    P(768, 'Firme',   'Retirada',      'cintaelec',{atk:252, hp:252, def:4}, ['Tijera X',      'Shuriken de Agua','Danza Espada','Megacuerno']),   // Golisopod
    P(748, 'Osada',   'Ensañamiento',  'restos',   {hp:252, def:252, spa:4}, ['Puya Nociva',   'Bomba Lodo',   'Refugio',       'Hidrobomba']),   // Toxapex
    P(847, 'Alegre',  'Nado Rápido',   'vidasfera',{atk:252, spe:252, hp:4}, ['Acua Cola',     'Hidropulso',   'Danza Lluvia',  'Hidrobomba'])    // Barraskewda
  ],
  naboru: [    // Fuego · Ciudad Engranaje (Naboru / Kabu). Coalossal no tiene sprite → Torkoal
    P( 38, 'Modesta', 'Sequía',        'gafasesp', {spa:252, spe:252, hp:4}, ['Colmillo Ígneo','Lanzallamas',  'Día Soleado',   'Llamarada']),    // Ninetales
    P( 59, 'Alegre',  'Intimidación',  'cinturon', {atk:252, spe:252, hp:4}, ['Colmillo Ígneo','Lanzallamas',  'Danza Espada',  'Envite Ígneo']), // Arcanine
    P(851, 'Firme',   'Absorbe Fuego', 'vidasfera',{atk:252, hp:252, def:4}, ['Tijera X',      'Lanzallamas',  'Corpulencia',   'Envite Ígneo']), // Centiskorch
    P(324, 'Osada',   'Caparazón',     'restos',   {hp:252, def:252, spa:4}, ['Tumba Rocas',   'Lanzallamas',  'Día Soleado',   'Llamarada']),    // Torkoal (en vez de Coalossal)
    P(609, 'Modesta', 'Absorbe Fuego', 'gafaselec',{spa:252, spe:252, hp:4}, ['Puño Sombra',   'Lanzallamas',  'Maquinación',   'Bola Sombra']),  // Chandelure
    P(815, 'Alegre',  'Líbero',        'cintaelec',{atk:252, spe:252, hp:4}, ['Puño Fuego',    'Ascuas',       'Agilidad',      'Envite Ígneo'])  // Cinderace
  ],
  judith: [    // Lucha · Pueblo Plié (Judith / Bea). Falinks no tiene sprite → Hawlucha
    P(237, 'Firme',   'Intimidación',  'casco',    {hp:252, atk:252, def:4}, ['Golpe Roca',    'Esfera Aural', 'Corpulencia',   'Terremoto']),    // Hitmontop
    P(675, 'Firme',   'Puño Férreo',   'vidasfera',{atk:252, hp:252, def:4}, ['Mordisco',      'Pulso Umbrío', 'Corpulencia',   'Pulso Noche']),  // Pangoro
    P(865, 'Firme',   'Impasible',     'cinturon', {atk:252, spe:252, hp:4}, ['Golpe Roca',    'Tajo Aéreo',   'Danza Espada',  'A Bocajarro']),  // Sirfetch'd
    P( 68, 'Firme',   'Indefenso',     'cintaelec',{atk:252, hp:252, def:4}, ['Puño Trueno',   'Esfera Aural', 'Corpulencia',   'Onda Certera']), // Machamp
    P(701, 'Alegre',  'Liviano',       'aguante',  {atk:252, spe:252, hp:4}, ['Ataque Ala',    'Esfera Aural', 'Danza Espada',  'Pájaro Osado']), // Hawlucha (en vez de Falinks)
    P(853, 'Firme',   'Experto',       'restos',   {hp:252, atk:252, def:4}, ['Golpe Roca',    'Esfera Aural', 'Corpulencia',   'A Bocajarro'])   // Grapploct
  ],
  alistair: [  // Fantasma · Pueblo Plié (Alistair / Allister). Yamask de Galar → Yamask con movimientos de Tierra y Fantasma
    P(562, 'Osada',   'Cuerpo Maldito','chaleco',  {hp:252, def:252, atk:4}, ['Garra Umbría',  'Disparo Lodo', 'Maldición',     'Terremoto']),    // Yamask (de Galar)
    P(778, 'Alegre',  'Disfraz',       'vidasfera',{atk:252, spe:252, hp:4}, ['Carantoña',     'Tinieblas',    'Danza Espada',  'Bola Sombra']),  // Mimikyu
    P(864, 'Modesta', 'Cuerpo Mortal', 'gafasesp', {spa:252, hp:252, def:4}, ['Lengüetazo',    'Lanzarrocas',  'Maldición',     'Bola Sombra']),  // Cursola
    P( 94, 'Modesta', 'Cuerpo Maldito','vidasfera',{spa:252, spe:252, hp:4}, ['Lengüetazo',    'Bomba Lodo',   'Hipnosis',      'Bola Sombra']),  // Gengar
    P(887, 'Alegre',  'Cuerpo Puro',   'cintaelec',{atk:252, spe:252, hp:4}, ['Garra Dragón',  'Pulso Dragón', 'Danza Dragón',  'Bola Sombra']),  // Dragapult
    P(681, 'Osada',   'Cambio Táctico','restos',   {hp:252, def:252, atk:4}, ['Garra Metal',   'Tinieblas',    'Danza Espada',  'Bola Sombra'])   // Aegislash
  ],
  sally: [     // Hada · Pueblo Ballonlea (Sally / Opal). Weezing de Galar → Weezing con movimientos de Veneno y Hada
    P(110, 'Osada',   'Levitación',    'restos',   {hp:252, def:252, spa:4}, ['Puya Nociva',   'Viento Feérico','Campo Neblinoso','Lanzamugre']), // Weezing (de Galar)
    P(303, 'Firme',   'Intimidación',  'casco',    {atk:252, hp:252, def:4}, ['Garra Metal',   'Viento Feérico','Danza Espada', 'Foco Resplandor']), // Mawile
    P(468, 'Modesta', 'Dicha',         'chaleco',  {hp:252, spa:252, def:4}, ['Ataque Ala',    'Tajo Aéreo',   'Paz Mental',    'Fuerza Lunar']), // Togekiss
    P(869, 'Modesta', 'Velo Dulce',    'restos',   {hp:252, spa:252, def:4}, ['Carantoña',     'Voz Cautivadora','Campo Neblinoso','Fuerza Lunar']), // Alcremie
    P(861, 'Firme',   'Bromista',      'cinturon', {atk:252, hp:252, def:4}, ['Carantoña',     'Pulso Umbrío', 'Danza Espada',  'Pulso Noche']),  // Grimmsnarl
    P(858, 'Modesta', 'Espejo Mágico', 'gafasesp', {spa:252, hp:252, def:4}, ['Cabezazo Zen',  'Psicorrayo',   'Paz Mental',    'Fuerza Lunar'])  // Hatterene
  ],
  morris: [    // Roca · Ciudad Auriga (Morris / Gordie). Coalossal no tiene sprite → Rhyperior
    P(689, 'Firme',   'Garra Dura',    'vidasfera',{atk:252, spe:252, hp:4}, ['Acua Cola',     'Lanzarrocas',  'Danza Espada',  'Roca Afilada']), // Barbaracle
    P(213, 'Osada',   'Robustez',      'restos',   {hp:252, def:252, atk:4}, ['Tumba Rocas',   'Pin Misil',    'Defensa Férrea','Megacuerno']),   // Shuckle
    P(874, 'Firme',   'Fuerza Mineral','cintaelec',{atk:252, hp:252, def:4}, ['Golpe Cuerpo',  'Lanzarrocas',  'Pulimento',     'Roca Afilada']), // Stonjourner
    P(464, 'Firme',   'Roca Sólida',   'casco',    {hp:252, atk:252, def:4}, ['Excavar',       'Lanzarrocas',  'Pulimento',     'Terremoto']),    // Rhyperior (en vez de Coalossal)
    P(248, 'Firme',   'Chorro Arena',  'chaleco',  {atk:252, hp:252, def:4}, ['Mordisco',      'Lanzarrocas',  'Danza Dragón',  'Roca Afilada']), // Tyranitar
    P(834, 'Firme',   'Caparazón',     'aguante',  {atk:252, hp:252, def:4}, ['Acua Cola',     'Hidropulso',   'Danza Espada',  'Terremoto'])     // Drednaw
  ],
  mel: [       // Hielo · Ciudad Auriga (Mel / Melony). Darmanitan de Galar → Darmanitan con movimientos de Hielo
    P(873, 'Modesta', 'Polvo Hielo',   'gafasesp', {spa:252, spe:252, hp:4}, ['Tijera X',      'Rayo Hielo',   'Danza Aleteo',  'Ventisca']),     // Frosmoth
    P(555, 'Alegre',  'Monotema',      'cintaelec',{atk:252, spe:252, hp:4}, ['Puño Hielo',    'Nieve Polvo',  'Danza Espada',  'Envite Ígneo']), // Darmanitan (de Galar)
    P(875, 'Firme',   'Cara de Hielo', 'restos',   {atk:252, hp:252, def:4}, ['Colmillo Hielo','Hidropulso',   'Danza Espada',  'Ventisca']),     // Eiscue
    P(131, 'Modesta', 'Absorbe Agua',  'chaleco',  {hp:252, spa:252, def:4}, ['Golpe Cuerpo',  'Rayo Hielo',   'Danza Lluvia',  'Hidrobomba']),   // Lapras
    P(471, 'Modesta', 'Manto Níveo',   'gafaselec',{spa:252, spe:252, hp:4}, ['Colmillo Hielo','Rayo Hielo',   'Paz Mental',    'Ventisca']),     // Glaceon
    P(478, 'Modesta', 'Manto Níveo',   'vidasfera',{spa:252, spe:252, hp:4}, ['Garra Umbría',  'Rayo Hielo',   'Maldición',     'Bola Sombra'])   // Froslass
  ],
  nerio: [     // Siniestro · Pueblo Pujanza (Nerio / Piers)
    P(560, 'Firme',   'Mudar',         'restos',   {hp:252, atk:252, def:4}, ['Mordisco',      'Esfera Aural', 'Corpulencia',   'A Bocajarro']),  // Scrafty
    P(687, 'Firme',   'Respondón',     'vidasfera',{atk:252, hp:252, def:4}, ['Mordisco',      'Psicorrayo',   'Maquinación',   'Pulso Noche']),  // Malamar
    P(435, 'Modesta', 'Hedor',         'casco',    {hp:252, spa:252, def:4}, ['Puya Nociva',   'Bomba Lodo',   'Maquinación',   'Lanzamugre']),   // Skuntank
    P(862, 'Firme',   'Agallas',       'cintaelec',{atk:252, spe:252, hp:4}, ['Mordisco',      'Doble Filo',   'Danza Espada',  'Pulso Noche']),  // Obstagoon
    P(861, 'Firme',   'Bromista',      'cinturon', {atk:252, hp:252, def:4}, ['Carantoña',     'Pulso Umbrío', 'Danza Espada',  'Pulso Noche']),  // Grimmsnarl
    P(248, 'Firme',   'Chorro Arena',  'vidasfera',{atk:252, spe:252, hp:4}, ['Mordisco',      'Lanzarrocas',  'Danza Dragón',  'Terremoto'])     // Tyranitar
  ],
  roy: [       // Dragón · Ciudad Puntera (Roy / Raihan)
    P(526, 'Firme',   'Chorro Arena',  'restos',   {hp:252, atk:252, def:4}, ['Tumba Rocas',   'Lanzarrocas',  'Tormenta de Arena','Roca Afilada']), // Gigalith
    P(330, 'Alegre',  'Levitación',    'cinturon', {atk:252, spe:252, hp:4}, ['Garra Dragón',  'Dragoaliento', 'Danza Dragón',  'Terremoto']),    // Flygon
    P(844, 'Osada',   'Expulsarena',   'casco',    {hp:252, def:252, atk:4}, ['Excavar',       'Disparo Lodo', 'Tormenta de Arena','Roca Afilada']), // Sandaconda
    P(884, 'Modesta', 'Metalúrgico',   'gafasesp', {spa:252, spe:252, hp:4}, ['Garra Metal',   'Pulso Dragón', 'Maquinación',   'Foco Resplandor']), // Duraludon
    P(887, 'Alegre',  'Cuerpo Puro',   'vidasfera',{atk:252, spe:252, hp:4}, ['Garra Dragón',  'Pulso Dragón', 'Danza Dragón',  'Cometa Draco']), // Dragapult
    P(612, 'Firme',   'Rompemoldes',   'cintaelec',{atk:252, spe:252, hp:4}, ['Garra Dragón',  'Pulso Dragón', 'Danza Dragón',  'Terremoto'])     // Haxorus
  ],
  // ---------------- COPA DE CAMPEONES ----------------
  berto: [     // Hada · Berto (Bede), en la Copa de Campeones. Rapidash de Galar → Rapidash con movimientos Psíquicos y de Hada
    P(303, 'Osada',   'Intimidación',  'casco',    {hp:252, def:252, atk:4}, ['Garra Metal',   'Viento Feérico','Defensa Férrea','Fuerza Lunar']), // Mawile
    P(282, 'Modesta', 'Rastro',        'gafasesp', {spa:252, spe:252, hp:4}, ['Cabezazo Zen',  'Voz Cautivadora','Paz Mental',  'Fuerza Lunar']), // Gardevoir
    P( 78, 'Alegre',  'Fuga',          'cintaelec',{atk:252, spe:252, hp:4}, ['Cabezazo Zen',  'Viento Feérico','Agilidad',     'Megacuerno']),   // Rapidash (de Galar)
    P(700, 'Modesta', 'Piel Feérica',  'chaleco',  {hp:252, spa:252, def:4}, ['Carantoña',     'Voz Cautivadora','Paz Mental',  'Hiperrayo']),    // Sylveon
    P(858, 'Modesta', 'Espejo Mágico', 'vidasfera',{spa:252, hp:252, def:4}, ['Cabezazo Zen',  'Psicorrayo',   'Paz Mental',    'Psíquico']),     // Hatterene
    P(869, 'Modesta', 'Velo Dulce',    'restos',   {hp:252, spa:252, def:4}, ['Carantoña',     'Viento Feérico','Campo Neblinoso','Fuerza Lunar']) // Alcremie
  ],
  // ---------------- CAMPEÓN ----------------
  lionel: [    // Lionel (Leon), Campeón de Galar. Mr. Rime no tiene sprite → Mr. Mime con movimientos de Hielo. Charizard «Gigamax» → Mega-Charizard X
    P(681, 'Osada',   'Cambio Táctico','restos',   {hp:252, def:252, atk:4}, ['Garra Metal',   'Tinieblas',    'Danza Espada',  'Foco Resplandor']), // Aegislash
    P(887, 'Alegre',  'Cuerpo Puro',   'vidasfera',{atk:252, spe:252, hp:4}, ['Garra Dragón',  'Pulso Dragón', 'Danza Dragón',  'Bola Sombra']),  // Dragapult
    P(612, 'Firme',   'Rompemoldes',   'cintaelec',{atk:252, spe:252, hp:4}, ['Garra Dragón',  'Pulso Dragón', 'Danza Dragón',  'Terremoto']),    // Haxorus
    P(122, 'Modesta', 'Insonorizar',   'gafasesp', {spa:252, spe:252, hp:4}, ['Puño Hielo',    'Rayo Hielo',   'Paz Mental',    'Psíquico']),     // Mr. Mime (en vez de Mr. Rime)
    P(818, 'Modesta', 'Francotirador', 'gafaselec',{spa:252, spe:252, hp:4}, ['Acua Cola',     'Shuriken de Agua','Agilidad',   'Hidrobomba']),   // Inteleon (su inicial evolucionado)
    PM('charizard_x', 6, 'Firme', 'Mar Llamas', 'mega_charizard_x', {atk:252, spe:252, hp:4}, ['Garra Dragón', 'Lanzallamas', 'Danza Dragón', 'Envite Ígneo'])   // Charizard (Gigamax → Mega-Charizard X)
  ]
});

// ---------------------------------------------------------------------
// Los 12 combates de Galar, en orden: 10 líderes, Berto (Copa de Campeones) y el Campeón Lionel.
// ---------------------------------------------------------------------
const GALAR = 'Galar';
const GF = (id, leader, tag, kind, lvl, dn, place, extra) =>
  Object.assign({id, leader, tag, kind, lvl, diff: kind === 'lider' ? 'dificil' : 'muy_dificil', teams: TEAMS[id], region: GALAR, idx: 0, dn, place}, extra);
FLOORS.push(
  GF('percy',    'Percy',    'Planta',    'lider', 164, 11, 'Pueblo Hoja Turf'),
  GF('cathy',    'Cathy',    'Agua',      'lider', 165, 11, 'Pueblo Amura'),
  GF('naboru',   'Naboru',   'Fuego',     'lider', 166, 12, 'Ciudad Engranaje'),
  GF('judith',   'Judith',   'Lucha',     'lider', 167, 13, 'Pueblo Plié'),
  GF('alistair', 'Alistair', 'Fantasma',  'lider', 168, 14, 'Pueblo Plié'),
  GF('sally',    'Sally',    'Hada',      'lider', 169, 15, 'Pueblo Ballonlea'),
  GF('morris',   'Morris',   'Roca',      'lider', 170, 16, 'Ciudad Auriga'),
  GF('mel',      'Mel',      'Hielo',     'lider', 171, 16, 'Ciudad Auriga'),
  GF('nerio',    'Nerio',    'Siniestro', 'lider', 172, 17, 'Pueblo Pujanza'),
  GF('roy',      'Roy',      'Dragón',    'lider', 173, 18, 'Ciudad Puntera'),
  // Copa de Campeones (MUY DIFÍCIL) y Campeón
  GF('berto',    'Berto',    'Hada',      'alto',  175, 20, 'Estadio de Puntera'),
  GF('lionel',   'Lionel',   'Campeón',   'campeon', 176, 23, 'Estadio de Puntera')
);
floorsOf(GALAR).forEach((F, i) => F.idx = i);                           // posición dentro de Galar (0 = Percy)
// Frases de cada uno en la pantalla de la Liga: LIGA_INFO en liga.js

// ---------------------------------------------------------------------
// DIBUJOS DE LOS ENTRENADORES: se usan los de assets/sprites_entrenadores/ (los mismos de la Invocación, con su nombre en inglés)
//   - Retrato (Liga, pantalla VS, menú): assets/sprites_entrenadores/<nombre>.png si no hay retrato en assets/lideres/Galar/<id>.png
//   - Muñeco del estadio: Cathy y Berto tienen muñeco pequeño (entrenadores_mini: nessa, bede); el resto sale con su sprite de combate
// ---------------------------------------------------------------------
const GALAR_SPR = {percy:'milo', cathy:'nessa', naboru:'kabu', judith:'bea', alistair:'allister', sally:'opal', morris:'gordie', mel:'melony',
                   nerio:'piers', roy:'raihan', berto:'bede', lionel:'leon'};
Object.entries(GALAR_SPR).forEach(([id, f]) => { LEADER_FILE[id] = [f]; });
{ const o = loadLeaderInto; loadLeaderInto = function(im, id, onfail){            // Galar: primero assets/lideres/Galar/<id>.png y, si no está, su sprite (sin probar todas las rutas de LEADER_PATHS)
    if(!GALAR_SPR[id]) return o.apply(this, arguments);
    const list = [`assets/lideres/Galar/${id}.png`, `assets/sprites_entrenadores/${GALAR_SPR[id]}.png`]; let k = 0;
    im.onerror = () => { if(++k < list.length) im.src = list[k]; else if(onfail) onfail(); };
    im.src = list[0]; }; }
if(typeof MINI_ALIAS !== 'undefined') Object.assign(MINI_ALIAS, {cathy: 'nessa', berto: 'bede'});
const GALAR_IMG = {};
const galarImg = id => { const f = GALAR_SPR[id]; if(!f) return null;
  if(!GALAR_IMG[id]){ const im = new Image(); im.onload = () => { im.ok = true; }; im.src = `assets/sprites_entrenadores/${f}.png`; GALAR_IMG[id] = im; }
  return GALAR_IMG[id].ok ? GALAR_IMG[id] : null; };
document.addEventListener('DOMContentLoaded', () => { if(typeof teTrainerOf === 'function'){ const o = teTrainerOf; teTrainerOf = function(ids){   // (torreestadio.js se carga después)
  const r = o.apply(this, arguments); if(r) return r;
  for(const id of ids || []){ const im = galarImg(String(id || '')); if(im) return {im}; }
  return null; }; } });

