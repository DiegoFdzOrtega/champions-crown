"use strict";
/* =====================================================================
   20) HOENN: 8 líderes de gimnasio, Alto Mando (4) y Campeón (Plubio), con sus equipos de 6 Pokémon
   Se carga DESPUÉS de johto.js y ANTES de campo.js (que comprueba todos los equipos al final). No toca nada de Kanto ni de Johto.

   VERSIÓN DE REFERENCIA: Pokémon ESMERALDA (así el octavo líder es Galano/Juan y el Campeón es Plubio/Wallace). Fuentes: pokemondb.net/emerald,
   Bulbapedia y Serebii (Match Call de Esmeralda). Sprites: lideres/Hoenn/<Nombre>.png (Máximo y Leti no se usan: Máximo es el Campeón de Rubí/Zafiro
   y Leti ya va dentro del retrato de Vito_y_Leti).

   CÓMO ESTÁ HECHO (igual que Kanto y Johto, ver teams.js):
     P(nº de Pokédex, 'Naturaleza', 'Habilidad', 'objeto', {EVs}, ['golpe', 'disparo', 'mejora', 'ataque fuerte'])
   - LÍDERES: equipo de REVANCHA de Esmeralda (el último, con 6 Pokémon; el gimnasio normal solo lleva 2-4). Se mantiene el ORDEN oficial y el último es el As.
     Vito y Leti son DOS líderes en un combate doble; el motor solo permite un rival, así que forman un único equipo de 6 con sus Pokémon de la revancha.
   - ALTO MANDO Y CAMPEÓN: los 5 (Plubio 6) Pokémon oficiales de Esmeralda, en su orden. El Alto Mando lleva 5, así que se añade 1 Pokémon más de su
     misma temática (Sharpedo de Sixto, Dusknoir de Fátima, Froslass de Nívea, Dragonair de Dracón) para llegar a los 6 que pide el motor.
   - Especies repetidas: Norman (2 Slaking), Fátima (2 Dusclops y 2 Banette) y Nívea (2 Glalie y 2 Sealeo) las llevan repetidas EN EL JUEGO ORIGINAL.
     Por eso tienen la marca 'dupOk' (ver validateTeams en teams.js).
   - Los movimientos son los más parecidos que permite el motor (4 huecos: golpe / disparo / mejora / ataque fuerte, ver MOVESET en moves.js).

   DIFICULTAD (cambia estos números para equilibrar): lvl = nivel del rival · dn = índice de dificultad (DIFF en data.js).
     Kanto: dn 0-12 · Johto: dn 2-14 · Hoenn: empieza en dn 4 (Petra ≈ Blanca de Johto) y acaba en dn 16 (Plubio, el más duro de las tres Ligas).
   RECOMPENSA: REWARD_REGION.Hoenn (teams.js): 5 Chapas Doradas + 5 Plateadas + 10 tiradas de Gachapon por cada victoria (como Johto).
   ===================================================================== */
Object.assign(TEAMS, {
  // ---------------- LÍDERES DE GIMNASIO (revancha de Esmeralda) ----------------
  petra: [    // Roca · Ciudad Férrica (Roxanne). Revancha 4: Aerodactyl, Golem, Omastar, Kabutops, Steelix, Nosepass
    P(142, 'Alegre',  'Presión',        'panuelo',   {atk:252, spe:252, hp:4}, ['Ataque Ala',   'Lanzarrocas', 'Agilidad',      'Hiperrayo']),     // Aerodactyl
    P( 76, 'Firme',   'Cabeza Roca',    'casco',     {hp:252, atk:252, def:4}, ['Golpe Roca',   'Lanzarrocas', 'Pulimento',     'Terremoto']),     // Golem
    P(139, 'Modesta', 'Nado Rápido',    'gafasesp',  {hp:252, spa:252, def:4}, ['Tumba Rocas',  'Rayo Hielo',  'Danza Lluvia',  'Hidrobomba']),    // Omastar
    P(141, 'Alegre',  'Armadura Batalla','aguante',  {atk:252, spe:252, hp:4}, ['Tumba Rocas',  'Rayo Hielo',  'Danza Espada',  'Hidrobomba']),    // Kabutops
    P(208, 'Firme',   'Cabeza Roca',    'cinturon',  {hp:252, atk:252, def:4}, ['Garra Metal',  'Lanzarrocas', 'Defensa Férrea','Roca Afilada']),  // Steelix
    P(299, 'Osada',   'Imán',           'restos',    {hp:252, def:252, spd:4}, ['Tumba Rocas',  'Lanzarrocas', 'Defensa Férrea','Roca Afilada'])   // Nosepass: As (su Pokémon de siempre)
  ],
  marcial: [  // Lucha · Pueblo Azuliza (Brawly). Revancha 4: Hitmonlee, Hitmonchan, Machamp, Medicham, Hitmontop, Hariyama
    P(106, 'Alegre',  'Liviano',        'periscopio',{atk:252, spe:252, hp:4}, ['Golpe Roca',   'Esfera Aural','Corpulencia',   'Terremoto']),     // Hitmonlee
    P(107, 'Alegre',  'Vista Lince',    'cintaelec', {atk:252, spe:252, hp:4}, ['Golpe Roca',   'Rayo Hielo',  'Corpulencia',   'Envite Ígneo']),  // Hitmonchan
    P( 68, 'Firme',   'Agallas',        'chaleco',   {hp:252, atk:252, def:4}, ['Golpe Roca',   'Lanzarrocas', 'Corpulencia',   'Onda Certera']),  // Machamp
    P(308, 'Alegre',  'Energía Pura',   'cinturon',  {atk:252, spe:252, hp:4}, ['Golpe Roca',   'Psicorrayo',  'Paz Mental',    'Psíquico']),      // Medicham
    P(237, 'Firme',   'Intimidación',   'casco',     {atk:252, hp:252, spe:4}, ['Mordisco',     'Esfera Aural','Corpulencia',   'Onda Certera']),  // Hitmontop
    P(297, 'Firme',   'Sebo',           'aguante',   {hp:252, atk:252, def:4}, ['Ataque Rápido','Esfera Aural','Corpulencia',   'Terremoto'])      // Hariyama: As
  ],
  erico: [    // Eléctrico · Ciudad Malvalona (Wattson). Revancha 4: Electabuzz, Raichu, Ampharos, Electrode, Magneton, Manectric
    P(125, 'Alegre',  'Elec. Estática', 'cintaelec', {atk:252, spe:252, hp:4}, ['Golpe Roca',   'Rayo',        'Carga',         'Trueno']),        // Electabuzz
    P( 26, 'Miedosa', 'Elec. Estática', 'cascabel',  {spa:252, spe:252, hp:4}, ['Placaje',      'Impactrueno', 'Danza Lluvia',  'Trueno']),        // Raichu
    P(181, 'Modesta', 'Elec. Estática', 'gafaselec', {hp:252, spa:252, def:4}, ['Colmillo Rayo','Rayo',        'Carga',         'Trueno']),        // Ampharos
    P(101, 'Miedosa', 'Insonorizar',    'panuelo',   {spa:252, spe:252, hp:4}, ['Tumba Rocas',  'Rayo',        'Danza Lluvia',  'Trueno']),        // Electrode: rapidísimo
    P( 82, 'Modesta', 'Imán',           'chaleco',   {hp:252, spa:252, def:4}, ['Garra Metal',  'Bomba Imán',  'Danza Lluvia',  'Trueno']),        // Magneton
    P(310, 'Miedosa', 'Pararrayos',     'vidasfera', {spa:252, spe:252, hp:4}, ['Mordisco',     'Rayo',        'Carga',         'Trueno'])         // Manectric: As
  ],
  candela: [  // Fuego · Pueblo Lavacalda (Flannery). Revancha 4: Arcanine, Magcargo, Houndoom, Rapidash, Camerupt, Torkoal
    P( 59, 'Alegre',  'Intimidación',   'cinturon',  {atk:252, spe:252, hp:4}, ['Colmillo Ígneo','Lanzallamas','Día Soleado',   'Llamarada']),     // Arcanine
    P(219, 'Modesta', 'Cuerpo Llama',   'restos',    {hp:252, spa:252, def:4}, ['Tumba Rocas',  'Lanzallamas', 'Día Soleado',   'Llamarada']),     // Magcargo
    P(229, 'Miedosa', 'Absorbe Fuego',  'gafasol',   {spa:252, spe:252, hp:4}, ['Mordisco',     'Lanzallamas', 'Día Soleado',   'Rayo Solar']),    // Houndoom
    P( 78, 'Alegre',  'Absorbe Fuego',  'panuelo',   {atk:252, spe:252, hp:4}, ['Colmillo Ígneo','Lanzallamas','Agilidad',      'Pájaro Osado']),  // Rapidash
    P(323, 'Modesta', 'Escudo Magma',   'chaleco',   {hp:252, spa:252, def:4}, ['Excavar',      'Lanzallamas', 'Día Soleado',   'Terremoto']),     // Camerupt
    P(324, 'Osada',   'Humo Blanco',    'aguante',   {hp:252, def:252, spa:4}, ['Colmillo Ígneo','Lanzallamas','Día Soleado',   'Llamarada'])      // Torkoal: As
  ],
  norman: [   // Normal · Ciudad Petalia (el padre del jugador). Revancha 4: Slaking, Blissey, Kangaskhan, Tauros, Spinda, Slaking (¡dos Slaking!)
    P(289, 'Firme',   'Indolente',      'aguante',   {hp:252, atk:252, def:4}, ['Golpe Cuerpo', 'Rayo Hielo',  'Afilar',        'Llamarada']),     // Slaking (Lv 57)
    P(242, 'Osada',   'Cura Natural',   'restos',    {hp:252, def:252, spd:4}, ['Golpe Cuerpo', 'Voz Cautivadora','Paz Mental',  'Onda Certera']),  // Blissey: tanque
    P(115, 'Firme',   'Foco Interno',   'cinturon',  {hp:252, atk:252, def:4}, ['Ataque Rápido','Esfera Aural','Corpulencia',    'Onda Certera']),  // Kangaskhan
    P(128, 'Alegre',  'Intimidación',   'panuelo',   {atk:252, spe:252, hp:4}, ['Golpe Cuerpo', 'Doble Filo',  'Danza Espada',  'Terremoto']),     // Tauros
    P(327, 'Alegre',  'Ritmo Propio',   'periscopio',{atk:252, hp:252, spe:4}, ['Placaje',      'Doble Filo',  'Paz Mental',    'Hiperrayo']),     // Spinda
    P(289, 'Alegre',  'Indolente',      'vidasfera', {atk:252, spa:252, hp:4}, ['Placaje',      'Lanzallamas', 'Afilar',        'Hiperrayo'])      // Slaking (Lv 60): As
  ],
  alana: [    // Volador · Ciudad Arborada (Winona). Revancha 4: Noctowl, Tropius, Pelipper, Dragonite, Skarmory, Altaria
    P(164, 'Modesta', 'Vista Lince',    'gafasesp',  {hp:252, spa:252, spd:4}, ['Ataque Ala',   'Psicorrayo',  'Paz Mental',    'Psíquico']),      // Noctowl
    P(357, 'Modesta', 'Clorofila',      'cuchara',   {hp:252, spa:252, def:4}, ['Látigo Cepa',  'Tajo Aéreo',  'Día Soleado',   'Rayo Solar']),    // Tropius
    P(279, 'Modesta', 'Vista Lince',    'gafaselec', {hp:252, spa:252, def:4}, ['Ataque Ala',   'Hidropulso',  'Danza Lluvia',  'Hidrobomba']),    // Pelipper
    P(149, 'Firme',   'Foco Interno',   'cintaelec', {atk:252, spe:252, hp:4}, ['Garra Dragón', 'Rayo',        'Danza Dragón',  'Hiperrayo']),     // Dragonite
    P(227, 'Osada',   'Robustez',       'casco',     {hp:252, def:252, spd:4}, ['Garra Metal',  'Tajo Aéreo',  'Defensa Férrea','Pájaro Osado']),  // Skarmory
    P(334, 'Alegre',  'Cura Natural',   'vidasfera', {atk:252, hp:252, spe:4}, ['Ataque Ala',   'Dragoaliento','Danza Dragón',  'Pájaro Osado'])   // Altaria: As
  ],
  vitoleti: [ // Psíquico · Ciudad Algaria (Tate y Liza, combate doble). Revancha 4: Hypno, Claydol, Slowking, Xatu, Lunatone, Solrock
    P( 97, 'Modesta', 'Insomnio',       'gafasesp',  {hp:252, spa:252, def:4}, ['Cabezazo Zen', 'Psicorrayo',  'Paz Mental',    'Psíquico']),      // Hypno
    P(344, 'Osada',   'Levitación',     'chaleco',   {hp:252, def:252, spd:4}, ['Excavar',      'Psicorrayo',  'Paz Mental',    'Terremoto']),     // Claydol
    P(199, 'Modesta', 'Ritmo Propio',   'restos',    {hp:252, spa:252, def:4}, ['Cabezazo Zen', 'Hidropulso',  'Paz Mental',    'Psíquico']),      // Slowking
    P(178, 'Miedosa', 'Sincronía',      'gafaselec', {spa:252, spe:252, hp:4}, ['Ataque Ala',   'Psicorrayo',  'Paz Mental',    'Psíquico']),      // Xatu
    P(337, 'Modesta', 'Levitación',     'aguante',   {hp:252, spa:252, def:4}, ['Tumba Rocas',  'Psicorrayo',  'Paz Mental',    'Terremoto']),     // Lunatone (la Luna de Liza)
    P(338, 'Firme',   'Levitación',     'vidasfera', {hp:252, atk:252, spe:4}, ['Tumba Rocas',  'Lanzallamas', 'Día Soleado',   'Rayo Solar'])     // Solrock (el Sol de Tate): As
  ],
  galano: [   // Agua · Arrecípolis (Juan/Wallace en otras versiones). Revancha 4: Lapras, Whiscash, Politoed, Walrein, Crawdaunt, Kingdra
    P(131, 'Modesta', 'Absorbe Agua',   'restos',    {hp:252, spa:252, def:4}, ['Colmillo Hielo','Rayo Hielo', 'Neblina',        'Hidrobomba']),    // Lapras
    P(340, 'Firme',   'Despiste',       'chaleco',   {hp:252, atk:252, def:4}, ['Excavar',      'Hidropulso',  'Danza Lluvia',  'Terremoto']),     // Whiscash
    P(186, 'Modesta', 'Absorbe Agua',   'gafasesp',  {hp:252, spa:252, def:4}, ['Acua Cola',    'Hidropulso',  'Danza Lluvia',  'Hidrobomba']),    // Politoed
    P(365, 'Modesta', 'Sebo',           'cascabel',  {hp:252, spa:252, spd:4}, ['Colmillo Hielo','Hidropulso', 'Amnesia',        'Ventisca']),      // Walrein
    P(342, 'Firme',   'Corte Fuerte',   'cinturon',  {atk:252, spe:252, hp:4}, ['Acua Cola',    'Pulso Umbrío','Danza Espada',  'Hidrobomba']),    // Crawdaunt
    P(230, 'Modesta', 'Nado Rápido',    'vidasfera', {spa:252, spe:252, hp:4}, ['Acua Cola',    'Rayo Hielo',  'Danza Lluvia',  'Hidrobomba'])     // Kingdra: As
  ],

  // ---------------- ALTO MANDO Y CAMPEÓN DE HOENN (Esmeralda) ----------------
  sixto: [    // Siniestro (Sidney). Esmeralda: Mightyena, Cacturne, Shiftry, Crawdaunt, Absol + Sharpedo (el que lleva en Rubí/Zafiro)
    P(262, 'Alegre',  'Intimidación',   'cinturon',  {atk:252, spe:252, hp:4}, ['Mordisco',     'Pulso Umbrío','Maquinación',   'Pulso Noche']),   // Mightyena
    P(332, 'Alegre',  'Velo Arena',     'aguante',   {atk:252, spe:252, hp:4}, ['Mordisco',     'Hoja Afilada','Maquinación',   'Pulso Noche']),   // Cacturne
    P(275, 'Firme',   'Clorofila',      'cintaelec', {atk:252, spe:252, hp:4}, ['Mordisco',     'Hoja Afilada','Danza Espada',  'Rayo Solar']),    // Shiftry
    P(342, 'Firme',   'Corte Fuerte',   'casco',     {atk:252, spe:252, hp:4}, ['Acua Cola',    'Pulso Umbrío','Danza Espada',  'Hidrobomba']),    // Crawdaunt
    P(319, 'Alegre',  'Piel Tosca',     'periscopio',{atk:252, spe:252, hp:4}, ['Mordisco',     'Hidropulso',  'Danza Lluvia',  'Hidrobomba']),    // Sharpedo (extra)
    P(359, 'Alegre',  'Presión',        'vidasfera', {atk:252, spe:252, hp:4}, ['Mordisco',     'Pulso Umbrío','Danza Espada',  'Pulso Noche'])    // Absol: As
  ],
  fatima: [   // Fantasma (Phoebe). Esmeralda: Dusclops, Banette, Banette, Sableye, Dusclops + Dusknoir (la evolución de su As)
    P(356, 'Osada',   'Presión',        'restos',    {hp:252, def:252, spd:4}, ['Garra Umbría', 'Tinieblas',   'Maldición',     'Bola Sombra']),   // Dusclops (Lv 48)
    P(354, 'Firme',   'Insomnio',       'cinturon',  {atk:252, spe:252, hp:4}, ['Garra Umbría', 'Pulso Umbrío','Maldición',     'Bola Sombra']),   // Banette (1.º)
    P(354, 'Modesta', 'Insomnio',       'gafasesp',  {spa:252, spe:252, hp:4}, ['Lengüetazo',   'Tinieblas',   'Maquinación',   'Pulso Noche']),   // Banette (2.º)
    P(302, 'Modesta', 'Vista Lince',    'gafasol',   {hp:252, spa:252, spd:4}, ['Garra Umbría', 'Pulso Umbrío','Paz Mental',    'Bola Sombra']),   // Sableye
    P(356, 'Modesta', 'Presión',        'chaleco',   {hp:252, spa:252, def:4}, ['Lengüetazo',   'Bomba Lodo',  'Maldición',     'Bola Sombra']),   // Dusclops (Lv 51)
    P(477, 'Firme',   'Presión',        'vidasfera', {hp:252, atk:252, def:4}, ['Garra Umbría', 'Psicorrayo',  'Maldición',     'Bola Sombra'])    // Dusknoir: As (extra)
  ],
  nivea: [    // Hielo (Glacia). Esmeralda: Glalie, Sealeo, Glalie, Sealeo, Walrein + Froslass
    P(362, 'Modesta', 'Foco Interno',   'gafaselec', {hp:252, spa:252, def:4}, ['Colmillo Hielo','Rayo Hielo', 'Neblina',        'Ventisca']),      // Glalie (Lv 50)
    P(364, 'Modesta', 'Sebo',           'restos',    {hp:252, spa:252, spd:4}, ['Placaje',      'Nieve Polvo', 'Neblina',       'Ventisca']),      // Sealeo (Lv 50)
    P(362, 'Alegre',  'Foco Interno',   'cintaelec', {atk:252, spe:252, hp:4}, ['Colmillo Hielo','Rayo Hielo', 'Danza Espada',  'Ventisca']),      // Glalie (Lv 52)
    P(364, 'Modesta', 'Sebo',           'chaleco',   {hp:252, spa:252, def:4}, ['Colmillo Hielo','Hidropulso', 'Neblina',       'Ventisca']),      // Sealeo (Lv 52)
    P(478, 'Miedosa', 'Manto Níveo',    'gafasesp',  {spa:252, spe:252, hp:4}, ['Colmillo Hielo','Rayo Hielo', 'Maldición',      'Bola Sombra']),   // Froslass (extra)
    P(365, 'Modesta', 'Sebo',           'cascabel',  {hp:252, spa:252, def:4}, ['Colmillo Hielo','Hidropulso', 'Amnesia',        'Ventisca'])       // Walrein: As
  ],
  dracon: [   // Dragón (Drake). Esmeralda: Shelgon, Altaria, Kingdra, Flygon, Salamence + Dragonair
    P(148, 'Modesta', 'Mudar',          'restos',    {hp:252, spa:252, spe:4}, ['Garra Dragón', 'Pulso Dragón','Danza Dragón',  'Cometa Draco']),  // Dragonair (extra)
    P(372, 'Firme',   'Cabeza Roca',    'casco',     {hp:252, def:252, atk:4}, ['Garra Dragón', 'Dragoaliento','Danza Dragón',  'Cometa Draco']),  // Shelgon
    P(334, 'Alegre',  'Cura Natural',   'aguante',   {atk:252, hp:252, spe:4}, ['Ataque Ala',   'Dragoaliento','Danza Dragón',  'Cometa Draco']),  // Altaria
    P(230, 'Modesta', 'Nado Rápido',    'gafasesp',  {spa:252, spe:252, hp:4}, ['Acua Cola',    'Pulso Dragón','Danza Lluvia',  'Hidrobomba']),    // Kingdra
    P(330, 'Alegre',  'Levitación',     'cinturon',  {atk:252, spe:252, hp:4}, ['Garra Dragón', 'Dragoaliento','Danza Dragón',  'Terremoto']),     // Flygon
    P(373, 'Alegre',  'Intimidación',   'vidasfera', {atk:252, spe:252, hp:4}, ['Ataque Ala',   'Pulso Dragón','Danza Dragón',  'Cometa Draco'])   // Salamence: As
  ],
  plubio: [   // Campeón de Esmeralda (Wallace). Wailord, Tentacruel, Whiscash, Ludicolo, Gyarados, Milotic
    P(321, 'Modesta', 'Velo Agua',      'restos',    {hp:252, spa:252, def:4}, ['Acua Cola',    'Hidropulso',  'Danza Lluvia',  'Hidrobomba']),    // Wailord
    P( 73, 'Modesta', 'Cuerpo Puro',    'gafasesp',  {spa:252, spe:252, hp:4}, ['Puya Nociva',  'Bomba Lodo',  'Danza Lluvia',  'Hidrobomba']),    // Tentacruel
    P(340, 'Firme',   'Despiste',       'chaleco',   {hp:252, atk:252, def:4}, ['Excavar',      'Hidropulso',  'Danza Lluvia',  'Terremoto']),     // Whiscash
    P(272, 'Modesta', 'Cura Lluvia',    'cuchara',   {hp:252, spa:252, def:4}, ['Látigo Cepa',  'Hidropulso',  'Danza Lluvia',  'Rayo Solar']),    // Ludicolo
    P(130, 'Alegre',  'Intimidación',   'cinturon',  {atk:252, spe:252, hp:4}, ['Acua Cola',    'Dragoaliento','Danza Dragón',  'Hidrobomba']),    // Gyarados
    P(350, 'Modesta', 'Escama Especial','gafaselec', {hp:252, spa:252, spe:4}, ['Acua Cola',    'Rayo Hielo',  'Danza Lluvia',  'Hidrobomba'])     // Milotic: As
  ]
});
// Equipos con especies repetidas en el juego original (ver validateTeams en teams.js)
['norman', 'fatima', 'nivea'].forEach(id => { TEAMS[id].dupOk = true; });

// ---------------------------------------------------------------------
// Los 13 combates de Hoenn, en orden: 8 líderes, 4 del Alto Mando y el Campeón.
// id = nombre del retrato (lideres/Hoenn/<Nombre>.png, ver LEADER_FILE en data.js) y de la arena (arenashoenn.js)
// ---------------------------------------------------------------------
const HF = (id, leader, tag, kind, lvl, dn, place) =>
  ({id, leader, tag, kind, lvl, diff: kind === 'lider' ? 'dificil' : 'muy_dificil', teams: TEAMS[id], region: 'Hoenn', idx: 0, dn, place});
FLOORS.push(
  HF('petra',    'Petra',        'Roca',      'lider', 127, 4,  'Ciudad Férrica'),
  HF('marcial',  'Marcial',      'Lucha',     'lider', 128, 5,  'Pueblo Azuliza'),
  HF('erico',    'Erico',        'Eléctrico', 'lider', 129, 6,  'Ciudad Malvalona'),
  HF('candela',  'Candela',      'Fuego',     'lider', 130, 7,  'Pueblo Lavacalda'),
  HF('norman',   'Norman',       'Normal',    'lider', 131, 8,  'Ciudad Petalia'),
  HF('alana',    'Alana',        'Volador',   'lider', 132, 9,  'Ciudad Arborada'),
  HF('vitoleti', 'Vito y Leti',  'Psíquico',  'lider', 133, 10, 'Ciudad Algaria'),
  HF('galano',   'Galano',       'Agua',      'lider', 134, 11, 'Arrecípolis'),
  // Alto Mando (MUY DIFÍCIL) y Campeón
  HF('sixto',    'Sixto',        'Siniestro', 'alto',  135, 11, 'Liga Pokémon'),
  HF('fatima',   'Fátima',       'Fantasma',  'alto',  136, 12, 'Liga Pokémon'),
  HF('nivea',    'Nívea',        'Hielo',     'alto',  137, 13, 'Liga Pokémon'),
  HF('dracon',   'Dracón',       'Dragón',    'alto',  138, 14, 'Liga Pokémon'),
  HF('plubio',   'Plubio',       'Campeón',   'campeon', 145, 16, 'Liga Pokémon')
);
floorsOf('Hoenn').forEach((F, i) => F.idx = i);                          // posición dentro de Hoenn (0 = Petra)

// Descripción de las habilidades nuevas
Object.assign(ABIL_DESC, {
  'Armadura Batalla':'Los golpes críticos no le afectan.', 'Cabeza Roca':'No sufre daño de retroceso.', 'Insonorizar':'Los ataques de sonido no le hacen nada.',
  'Escudo Magma':'No puede congelarse.', 'Humo Blanco':'Ningún rival puede bajarle las estadísticas.', 'Indolente':'Solo ataca un turno de cada dos.',
  'Insomnio':'No puede dormirse.', 'Despiste':'No se deja enamorar ni provocar.', 'Corte Fuerte':'Su Ataque no puede bajar.',
  'Piel Tosca':'Daña a quien lo toca.', 'Velo Agua':'No puede quemarse.', 'Cura Lluvia':'Recupera salud cuando llueve.'
});
