"use strict";
/* =====================================================================
   16) EQUIPOS DE LOS RIVALES: plantillas competitivas de los 8 líderes, el Alto Mando y el Campeón de Kanto
   Se carga DESPUÉS de data.js, moves.js y training.js. Aquí está TODO lo que define a cada rival:

     P(nº de Pokédex, 'Naturaleza', 'Habilidad', 'objeto', {EVs}, ['golpe', 'disparo', 'mejora', 'ataque fuerte'])

   Reglas (se comprueban solas al cargar la página: si algo falla, sale un aviso en la consola con validateTeams()):
   - 6 Pokémon por equipo, sin repetir especie.
   - IVs: todos a 31 (el máximo) en las 6 estadísticas.
   - EVs: máximo 252 en una estadística y 510 en total. El reparto sigue el papel del Pokémon (atacante, tanque...).
   - Naturaleza: la que mejor le va a su papel (sube lo que usa y baja lo que no usa).
   - Habilidad: la más competitiva que tiene en los juegos. De momento se muestra en el combate; no cambia el daño.
   - Objeto: uno de los de ITEMS (data.js), los mismos que usas tú. Los efectos son los de combat.js.
   - Movimientos: los 4 huecos del motor (1 golpe cuerpo a cuerpo, 2 disparo, 3 mejora, 4 ataque fuerte).

   Equipos canónicos: son los Pokémon que ese entrenador usa en los juegos oficiales (Rojo/Azul/Amarillo, Oro/Plata,
   Rojo Fuego/Verde Hoja y sus combates de revancha, Corazón/Alma, Let's Go, Stadium) y en el anime. Como en cada juego
   suelen llevar 4-5, el sexteto reúne a los de todas sus apariciones (por ejemplo Brock = su equipo de revancha de HGSS).
   En el combate, EVs y naturaleza se traducen en vida, daño, velocidad y resistencia con la misma fórmula que tus
   Pokémon (ver enemyBoost). El nivel del rival (FLOORS) y la dificultad (DIFF) se aplican encima, como antes.
   ===================================================================== */
const ALL31 = {hp:31, atk:31, def:31, spa:31, spd:31, spe:31};
const P = (dex, nat, ab, item, ev, mv) => ({dex, nat, ab, item, ev, iv:ALL31, mv});

const TEAMS = {
  // ---------------- LÍDERES DE GIMNASIO ----------------
  brock: [   // Roca. Equipo de revancha de HGSS: Golem, Relicanth, Omastar, Kabutops, Onix, Rampardos
    P( 95, 'Osada',   'Robustez',       'casco',     {hp:252, def:252, atk:4},          ['Tumba Rocas',   'Lanzarrocas', 'Defensa Férrea', 'Terremoto']),       // Onix: tanque con Casco Dentado
    P(139, 'Modesta', 'Nado Rápido',    'gafaselec', {hp:252, spa:252, def:4},          ['Acua Cola',     'Lanzarrocas', 'Danza Lluvia',   'Hidrobomba']),      // Omastar: atacante especial
    P(141, 'Alegre',  'Nado Rápido',    'aguante',   {atk:252, spe:252, hp:4},          ['Acua Cola',     'Lanzarrocas', 'Danza Espada',   'Roca Afilada']),    // Kabutops: barredor con Banda Aguante
    P(369, 'Osada',   'Cabeza Roca',    'restos',    {hp:252, def:252, atk:4},          ['Acua Cola',     'Lanzarrocas', 'Amnesia',        'Roca Afilada']),    // Relicanth: tanque
    P(409, 'Firme',   'Potencia Bruta', 'vidasfera', {atk:252, spe:252, hp:4},          ['Cabezazo Zen',  'Lanzarrocas', 'Pulimento',      'Roca Afilada']),    // Rampardos: cañón de cristal
    P( 76, 'Audaz',   'Robustez',       'cinturon',  {hp:252, atk:252, def:4},          ['Excavar',       'Lanzarrocas', 'Pulimento',      'Terremoto'])        // Golem: as del equipo
  ],
  misty: [   // Agua. Revancha de HGSS: Starmie, Quagsire, Lapras, Lanturn, Floatzel, Milotic
    P(171, 'Modesta', 'Absorbe Elec.',  'cascabel',  {hp:252, spa:252, def:4},          ['Colmillo Rayo', 'Rayo',        'Danza Lluvia',   'Hidrobomba']),      // Lanturn
    P(195, 'Osada',   'Ignorante',      'restos',    {hp:252, def:252, atk:4},          ['Acua Cola',     'Disparo Lodo','Amnesia',        'Terremoto']),       // Quagsire: tanque
    P(419, 'Alegre',  'Nado Rápido',    'cintaelec', {atk:252, spe:252, hp:4},          ['Acua Cola',     'Hidropulso',  'Danza Lluvia',   'Hidrobomba']),      // Floatzel: bajo la lluvia
    P(131, 'Modesta', 'Absorbe Agua',   'chaleco',   {hp:252, spa:252, spd:4},          ['Colmillo Hielo','Rayo',        'Danza Lluvia',   'Ventisca']),        // Lapras
    P(121, 'Miedosa', 'Cura Natural',   'panuelo',   {spa:252, spe:252, hp:4},          ['Cabezazo Zen',  'Rayo Hielo',  'Agilidad',       'Hidrobomba']),      // Starmie: rápido
    P(350, 'Modesta', 'Escama Especial','gafaselec', {hp:252, spa:252, def:4},          ['Acua Cola',     'Rayo Hielo',  'Paz Mental',     'Hidrobomba'])       // Milotic: as
  ],
  lt_surge: [   // Eléctrico. Revancha de HGSS: Raichu, Manectric, Magnezone, Electrode, Pachirisu, Electivire
    P(417, 'Serena',  'Absorbe Elec.',  'restos',    {hp:252, spd:252, def:4},          ['Colmillo Rayo', 'Rayo',        'Carga',          'Trueno']),          // Pachirisu: aguanta
    P(101, 'Miedosa', 'Elec. Estática', 'aguante',   {spa:252, spe:252, hp:4},          ['Ataque Rápido', 'Rayo',        'Agilidad',       'Trueno']),          // Electrode: el más veloz
    P(310, 'Miedosa', 'Pararrayos',     'cinturon',  {spa:252, spe:252, hp:4},          ['Colmillo Rayo', 'Rayo',        'Agilidad',       'Trueno']),          // Manectric
    P( 26, 'Miedosa', 'Pararrayos',     'panuelo',   {spa:252, spe:252, hp:4},          ['Colmillo Rayo', 'Rayo',        'Carga',          'Trueno']),          // Raichu
    P(462, 'Modesta', 'Analítico',      'gafaselec', {hp:252, spa:252, def:4},          ['Garra Metal',   'Rayo',        'Defensa Férrea', 'Foco Resplandor']), // Magnezone
    P(466, 'Firme',   'Electromotor',   'vidasfera', {atk:252, spe:252, hp:4},          ['Colmillo Rayo', 'Rayo',        'Danza Espada',   'Terremoto'])        // Electivire: as
  ],
  erika: [   // Planta. Revancha de HGSS: Shiftry, Jumpluff, Victreebel, Bellossom, Tangrowth, Roserade
    P(189, 'Alegre',  'Clorofila',      'cinturon',  {atk:252, spe:252, hp:4},          ['Látigo Cepa',   'Tajo Aéreo',  'Danza Espada',   'Rayo Solar']),      // Jumpluff
    P( 71, 'Firme',   'Clorofila',      'vidasfera', {atk:252, spe:252, hp:4},          ['Látigo Cepa',   'Bomba Lodo',  'Desarrollo',     'Rayo Solar']),      // Victreebel
    P(182, 'Modesta', 'Clorofila',      'gafasesp',  {spa:252, spe:252, hp:4},          ['Látigo Cepa',   'Hoja Afilada','Danza Aleteo',   'Rayo Solar']),      // Bellossom
    P(465, 'Osada',   'Regeneración',   'restos',    {hp:252, def:252, spa:4},          ['Látigo Cepa',   'Hoja Afilada','Desarrollo',     'Rayo Solar']),      // Tangrowth: tanque
    P(275, 'Alegre',  'Clorofila',      'gafasol',   {atk:252, spe:252, hp:4},          ['Mordisco',      'Hoja Afilada','Danza Espada',   'Pulso Noche']),     // Shiftry
    P(407, 'Miedosa', 'Técnico',        'flecha',    {spa:252, spe:252, hp:4},          ['Puya Nociva',   'Bomba Lodo',  'Danza Aleteo',   'Rayo Solar'])       // Roserade: as
  ],
  koga: [    // Veneno. Gimnasio (Weezing, Muk), Alto Mando de Oro/Plata (Ariados, Venomoth, Forretress, Muk, Crobat) y Let's Go
    P(168, 'Alegre',  'Francotirador',  'periscopio',{atk:252, spe:252, hp:4},          ['Tijera X',      'Pin Misil',   'Danza Espada',   'Megacuerno']),      // Ariados: críticos con Periscopio
    P(205, 'Osada',   'Robustez',       'casco',     {hp:252, def:252, atk:4},          ['Garra Metal',   'Bomba Imán',  'Defensa Férrea', 'Foco Resplandor']), // Forretress: tanque
    P(110, 'Osada',   'Levitación',     'chaleco',   {hp:252, def:252, spa:4},          ['Puya Nociva',   'Lanzallamas', 'Armadura Ácida', 'Lanzamugre']),      // Weezing
    P( 89, 'Firme',   'Toque Tóxico',   'flecha',    {hp:252, atk:252, def:4},          ['Puya Nociva',   'Bomba Lodo',  'Corpulencia',    'Lanzamugre']),      // Muk
    P( 49, 'Miedosa', 'Cromolente',     'gafaselec', {spa:252, spe:252, hp:4},          ['Tijera X',      'Zumbido',     'Danza Aleteo',   'Psíquico']),        // Venomoth
    P(169, 'Alegre',  'Infiltrador',    'panuelo',   {atk:252, spe:252, hp:4},          ['Puya Nociva',   'Tajo Aéreo',  'Viento Afín',    'Pájaro Osado'])     // Crobat: as
  ],
  sabrina: [ // Psíquico. Revancha de HGSS: Alakazam, Espeon, Mr. Mime, Jynx, Wobbuffet, Gallade
    P(122, 'Modesta', 'Filtro',         'cuchara',   {spa:252, spe:252, hp:4},          ['Cabezazo Zen',  'Confusión',   'Paz Mental',     'Psíquico']),        // Mr. Mime
    P(202, 'Serena',  'Sombra Trampa',  'restos',    {hp:252, spd:252, def:4},          ['Cabezazo Zen',  'Tinieblas',   'Amnesia',        'Psíquico']),        // Wobbuffet: tanque
    P(124, 'Miedosa', 'Piel Seca',      'gafaselec', {spa:252, spe:252, hp:4},          ['Cabezazo Zen',  'Rayo Hielo',  'Paz Mental',     'Psíquico']),        // Jynx
    P(196, 'Miedosa', 'Espejo Mágico',  'panuelo',   {spa:252, spe:252, hp:4},          ['Cabezazo Zen',  'Psicorrayo',  'Agilidad',       'Bola Sombra']),     // Espeon: rebota estados
    P(475, 'Firme',   'Justiciero',     'cintaelec', {atk:252, spe:252, hp:4},          ['Golpe Roca',    'Psicorrayo',  'Danza Espada',   'Psíquico']),        // Gallade
    P( 65, 'Miedosa', 'Muro Mágico',    'vidasfera', {spa:252, spe:252, hp:4},          ['Cabezazo Zen',  'Psicorrayo',  'Paz Mental',     'Psíquico'])         // Alakazam: as
  ],
  blaine: [  // Fuego. Revancha de HGSS: Torkoal, Camerupt, Rapidash, Magcargo, Houndoom, Magmortar
    P(219, 'Modesta', 'Cuerpo Llama',   'chaleco',   {hp:252, spa:252, def:4},          ['Colmillo Ígneo','Lanzarrocas', 'Amnesia',        'Llamarada']),       // Magcargo
    P(324, 'Osada',   'Sequía',         'restos',    {hp:252, def:252, spa:4},          ['Colmillo Ígneo','Lanzallamas', 'Día Soleado',    'Llamarada']),       // Torkoal: tanque con sol
    P( 78, 'Alegre',  'Absorbe Fuego',  'cinturon',  {atk:252, spe:252, hp:4},          ['Colmillo Ígneo','Ascuas',      'Danza Espada',   'Envite Ígneo']),    // Rapidash
    P(323, 'Modesta', 'Roca Sólida',    'gafaselec', {hp:252, spa:252, def:4},          ['Colmillo Ígneo','Lanzallamas', 'Tormenta de Arena','Terremoto']),     // Camerupt
    P(229, 'Miedosa', 'Absorbe Fuego',  'gafasol',   {spa:252, spe:252, hp:4},          ['Mordisco',      'Lanzallamas', 'Maquinación',    'Pulso Noche']),     // Houndoom
    P(467, 'Modesta', 'Cuerpo Llama',   'vidasfera', {hp:252, spa:252, spe:4},          ['Golpe Roca',    'Rayo',        'Día Soleado',    'Llamarada'])        // Magmortar: as
  ],
  giovanni: [ // Tierra. Gimnasio de Verde (Rhydon, Dugtrio, Nidoqueen, Nidoking), Amarillo (Persian), Silph S.A. (Kangaskhan)
    P( 53, 'Alegre',  'Técnico',        'periscopio',{atk:252, spe:252, hp:4},          ['Ataque Rápido', 'Triataque',   'Danza Espada',   'Hiperrayo']),       // Persian
    P( 51, 'Alegre',  'Trampa Arena',   'aguante',   {atk:252, spe:252, hp:4},          ['Excavar',       'Disparo Lodo','Danza Espada',   'Terremoto']),       // Dugtrio: el más rápido
    P( 31, 'Modesta', 'Potencia Bruta', 'chaleco',   {hp:252, spa:252, def:4},          ['Puya Nociva',   'Bomba Lodo',  'Tormenta de Arena','Terremoto']),     // Nidoqueen
    P( 34, 'Modesta', 'Potencia Bruta', 'vidasfera', {spa:252, spe:252, hp:4},          ['Puya Nociva',   'Rayo Hielo',  'Maquinación',    'Terremoto']),       // Nidoking
    P(115, 'Firme',   'Intrépido',      'cintaelec', {hp:252, atk:252, def:4},          ['Golpe Cuerpo',  'Doble Filo',  'Danza Espada',   'Terremoto']),       // Kangaskhan
    P(112, 'Firme',   'Cabeza Roca',    'cinturon',  {hp:252, atk:252, def:4},          ['Excavar',       'Lanzarrocas', 'Danza Espada',   'Terremoto'])        // Rhydon: el as de Giovanni
  ],

  // ---------------- ALTO MANDO Y CAMPEÓN ----------------
  lorelei: [ // Hielo. RBY + revancha de FRLG (Piloswine)
    P(221, 'Firme',   'Sebo',           'cinturon',  {hp:252, atk:252, spe:4},          ['Colmillo Hielo','Lanzarrocas', 'Tormenta de Arena','Terremoto']),     // Piloswine
    P( 91, 'Firme',   'Encadenado',     'aguante',   {atk:252, spe:252, hp:4},          ['Colmillo Hielo','Pin Misil',   'Danza Espada',   'Roca Afilada']),    // Cloyster
    P( 80, 'Osada',   'Regeneración',   'chaleco',   {hp:252, def:252, spd:4},          ['Cabezazo Zen',  'Hidropulso',  'Amnesia',        'Psíquico']),        // Slowbro: tanque
    P( 87, 'Modesta', 'Sebo',           'restos',    {hp:252, spa:252, spd:4},          ['Acua Cola',     'Rayo Hielo',  'Danza Lluvia',   'Ventisca']),        // Dewgong
    P(124, 'Miedosa', 'Piel Seca',      'gafaselec', {spa:252, spe:252, hp:4},          ['Cabezazo Zen',  'Rayo Hielo',  'Paz Mental',     'Ventisca']),        // Jynx
    P(131, 'Modesta', 'Absorbe Agua',   'cascabel',  {hp:252, spa:252, def:4},          ['Acua Cola',     'Rayo',        'Danza Lluvia',   'Ventisca'])         // Lapras: as
  ],
  bruno: [   // Lucha. RBY, Oro/Plata (Hitmontop), revancha de FRLG (Steelix) y anime
    P( 95, 'Firme',   'Cabeza Roca',    'aguante',   {hp:252, atk:252, def:4},          ['Tumba Rocas',   'Lanzarrocas', 'Tormenta de Arena','Terremoto']),     // Onix
    P(208, 'Firme',   'Potencia Bruta', 'casco',     {hp:252, atk:252, def:4},          ['Garra Metal',   'Lanzarrocas', 'Defensa Férrea', 'Terremoto']),       // Steelix: tanque
    P(106, 'Alegre',  'Liviano',        'vidasfera', {atk:252, spe:252, hp:4},          ['Golpe Roca',    'Esfera Aural','Corpulencia',    'Onda Certera']),    // Hitmonlee
    P(107, 'Alegre',  'Puño Férreo',    'cinturon',  {atk:252, spe:252, hp:4},          ['Golpe Roca',    'Rayo Hielo',  'Danza Espada',   'Onda Certera']),    // Hitmonchan
    P(237, 'Firme',   'Intimidación',   'roca',      {hp:252, atk:252, def:4},          ['Golpe Roca',    'Lanzarrocas', 'Corpulencia',    'Onda Certera']),    // Hitmontop
    P( 68, 'Firme',   'Agallas',        'cintaelec', {hp:252, atk:252, def:4},          ['Golpe Roca',    'Lanzarrocas', 'Corpulencia',    'Onda Certera'])     // Machamp: as
  ],
  agatha: [  // Fantasma. RBY (Gengar, Golbat, Haunter, Arbok) y revancha de FRLG (Crobat, Misdreavus)
    P( 42, 'Alegre',  'Infiltrador',    'flecha',    {atk:252, spe:252, hp:4},          ['Mordisco',      'Tajo Aéreo',  'Viento Afín',    'Lanzamugre']),      // Golbat
    P(200, 'Modesta', 'Levitación',     'gafasesp',  {hp:252, spa:252, spd:4},          ['Lengüetazo',    'Pulso Umbrío','Paz Mental',     'Bola Sombra']),     // Misdreavus
    P( 24, 'Firme',   'Intimidación',   'restos',    {hp:252, atk:252, def:4},          ['Puya Nociva',   'Bomba Lodo',  'Armadura Ácida', 'Lanzamugre']),      // Arbok
    P(169, 'Alegre',  'Infiltrador',    'roca',      {atk:252, spe:252, hp:4},          ['Mordisco',      'Tajo Aéreo',  'Agilidad',       'Pájaro Osado']),    // Crobat
    P( 93, 'Miedosa', 'Levitación',     'gafaselec', {spa:252, spe:252, hp:4},          ['Lengüetazo',    'Bomba Lodo',  'Maldición',      'Bola Sombra']),     // Haunter
    P( 94, 'Miedosa', 'Cuerpo Maldito', 'vidasfera', {spa:252, spe:252, hp:4},          ['Garra Umbría',  'Bomba Lodo',  'Maquinación',    'Bola Sombra'])      // Gengar: as
  ],
  lance: [   // Dragón. RBY (Dragonair), Oro/Plata (Charizard) y revancha de FRLG (Kingdra)
    P(130, 'Alegre',  'Intimidación',   'cinturon',  {atk:252, spe:252, hp:4},          ['Acua Cola',     'Dragoaliento','Danza Dragón',   'Terremoto']),       // Gyarados
    P(230, 'Modesta', 'Nado Rápido',    'gafaselec', {spa:252, spe:252, hp:4},          ['Acua Cola',     'Pulso Dragón','Danza Lluvia',   'Hidrobomba']),      // Kingdra
    P(142, 'Alegre',  'Presión',        'panuelo',   {atk:252, spe:252, hp:4},          ['Ataque Ala',    'Lanzarrocas', 'Agilidad',       'Roca Afilada']),    // Aerodactyl
    P(  6, 'Miedosa', 'Poder Solar',    'gafasesp',  {spa:252, spe:252, hp:4},          ['Ataque Ala',    'Lanzallamas', 'Día Soleado',    'Llamarada']),       // Charizard
    P(148, 'Modesta', 'Escama Especial','restos',    {hp:252, spa:252, spe:4},          ['Garra Dragón',  'Pulso Dragón','Danza Dragón',   'Cometa Draco']),    // Dragonair
    P(149, 'Firme',   'Multiescala',    'cintaelec', {atk:252, spe:252, hp:4},          ['Garra Dragón',  'Rayo',        'Danza Dragón',   'Terremoto'])        // Dragonite: as
  ],
  azul: [    // Campeón. Equipo de la Liga Pokémon de Rojo/Azul/Amarillo (sin el inicial, que depende de tu elección)
    P( 18, 'Alegre',  'Vista Lince',    'panuelo',   {atk:252, spe:252, hp:4},          ['Ataque Ala',    'Tajo Aéreo',  'Agilidad',       'Pájaro Osado']),    // Pidgeot
    P( 65, 'Miedosa', 'Muro Mágico',    'gafasesp',  {spa:252, spe:252, hp:4},          ['Cabezazo Zen',  'Esfera Aural','Paz Mental',     'Psíquico']),        // Alakazam
    P(112, 'Firme',   'Cabeza Roca',    'chaleco',   {hp:252, atk:252, def:4},          ['Excavar',       'Lanzarrocas', 'Danza Espada',   'Terremoto']),       // Rhydon
    P(103, 'Modesta', 'Clorofila',      'gafaselec', {hp:252, spa:252, spe:4},          ['Látigo Cepa',   'Psicorrayo',  'Desarrollo',     'Rayo Solar']),      // Exeggutor
    P(130, 'Alegre',  'Intimidación',   'aguante',   {atk:252, spe:252, hp:4},          ['Mordisco',      'Rayo',        'Danza Dragón',   'Hidrobomba']),      // Gyarados
    P( 59, 'Alegre',  'Intimidación',   'vidasfera', {atk:252, spe:252, hp:4},          ['Colmillo Ígneo','Lanzallamas', 'Danza Espada',   'Envite Ígneo'])     // Arcanine: as
  ]
};
FLOORS.forEach(F => { if(TEAMS[F.id]) F.teams = TEAMS[F.id]; });      // el motor lee F.teams (modes.js)

// Descripción de las habilidades nuevas (las que ya existían en training.js se quedan como estaban)
Object.assign(ABIL_DESC, {
  'Potencia Bruta':'Sus ataques con efecto extra pegan más fuerte, pero pierden ese efecto.', 'Ignorante':'Ignora las mejoras de estadísticas del rival.',
  'Absorbe Elec.':'Los ataques eléctricos le curan.', 'Escama Especial':'Aumenta su Defensa si tiene un problema de estado.',
  'Analítico':'Pega más fuerte si es el último en moverse.', 'Regeneración':'Recupera salud al salir del combate.',
  'Francotirador':'Sus golpes críticos hacen más daño.', 'Toque Tóxico':'Sus golpes pueden envenenar.', 'Cromolente':'Los ataques poco eficaces hacen más daño.',
  'Infiltrador':'Sus ataques ignoran las barreras del rival.', 'Filtro':'Recibe menos daño de los ataques muy eficaces.',
  'Sombra Trampa':'El rival no puede huir ni cambiar de Pokémon.', 'Piel Seca':'El agua le cura, el fuego le daña más.',
  'Justiciero':'Sube su Ataque al recibir ataques Siniestro.', 'Sequía':'Al entrar, hace que haga sol.', 'Técnico':'Potencia sus ataques flojos.',
  'Trampa Arena':'El rival no puede huir ni cambiar de Pokémon.', 'Intrépido':'Ataca incluso a los Pokémon Fantasma con golpes normales.',
  'Sebo':'Recibe menos daño de ataques de Fuego y Hielo.', 'Encadenado':'Sus ataques de varios golpes siempre pegan al máximo.',
  'Liviano':'Sube su Velocidad al perder su objeto.', 'Puño Férreo':'Potencia sus ataques de puño.', 'Poder Solar':'Con sol pega más fuerte, pero pierde salud.',
  'Nado Rápido':'Sube su Velocidad bajo la lluvia.', 'Absorbe Fuego':'Los ataques de fuego le curan.'
});

// ---------------------------------------------------------------------
// De las plantillas al combate. Misma fórmula que tus Pokémon (training.js: realStat / statMult) pero leyendo los IVs,
// EVs y naturaleza de la plantilla. ENEMY_POWER es cuánto se nota en los rivales (igual que TRAIN.power en los tuyos).
// Para que los rivales sean más fáciles o difíciles sin tocar sus datos, cambia este número (0 = no se nota nada).
// ---------------------------------------------------------------------
const ENEMY_POWER = TRAIN.power;
function specStat(s, k){
  const nat = NATURES.find(n => n[0] === s.nat) || [], b = mon(s.dex).base[k];
  const core = Math.floor((2 * b + s.iv[k] + Math.floor((s.ev[k] || 0) / 4)) * .5);
  return k === 'hp' ? core + 60 : Math.floor((core + 5) * (nat[1] === k ? 1.1 : nat[2] === k ? .9 : 1));
}
const specMult = (s, k) => 1 + (specStat(s, k) / refStat(s.dex, k) - 1) * ENEMY_POWER;
const ENEMY_SPEED_CAP = 1.25;                                       // tope del extra de velocidad (con IV 31 + 252 EV un Pokémon lento llegaría a x1,5 y se haría injugable)
function enemyBoost(s){                                            // vida, daño (su ataque principal), velocidad y resistencia
  if(!s || typeof s === 'number') return {hm:1, dm:1, spdm:1, defm:1};
  const b = mon(s.dex).base, e = s.ev, ak = (e.spa || 0) !== (e.atk || 0) ? ((e.spa || 0) > (e.atk || 0) ? 'spa' : 'atk') : (b.atk >= b.spa ? 'atk' : 'spa');   // el ataque donde invierte sus EVs
  return {hm:specMult(s, 'hp'), dm:specMult(s, ak), spdm:Math.min(ENEMY_SPEED_CAP, specMult(s, 'spe')), defm:(specMult(s, 'def') + specMult(s, 'spd')) / 2};
}

// ---------------------------------------------------------------------
// Recompensa fija por cada victoria (se concede en modes.js > endBattle y campo.js > campoEnd). Cada clave es un id de save.items,
// salvo 'tickets' (tiradas del Gachapon) y 'bp' (Puntos de Batalla). Los combates de la Historia NO dan BP: solo tickets (y chapas).
// Para dársela también al Alto Mando o al Campeón: línea 'alto' o 'campeon'. once:true = solo la primera victoria.
// ---------------------------------------------------------------------
const REWARD = {
  once: false,
  lider:   {chapa:5, chapaplata:5, tickets:10},    // Líderes de gimnasio: 10 tiradas de Gachapon (+ las chapas de siempre), sin BP
  alto:    {tickets:10},                           // Alto Mando: 10 tiradas de Gachapon
  campeon: {tickets:10},                           // Campeón: 10 tiradas de Gachapon
  campo:   {tickets:1, bp:50, chapaplata:5, chapa:5}   // Campo de Entrenamiento (campo.js): 1 tirada de Gachapon + 50 BP + 5 Plateadas + 5 Doradas por cada victoria, sin límite
};
// Recompensa propia de una región: sustituye a la de arriba para TODOS sus combates (líderes, Alto Mando y Campeón).
// 'tickets' = tiradas del Gachapon (Ticket Normal). Johto: 5 Chapas Doradas + 5 Plateadas + 10 tiradas por cada victoria.
// Para que se den solo la primera vez, pon REWARD.once = true (vale para todas las recompensas).
const REWARD_REGION = {
  Johto: {chapa:5, chapaplata:5, tickets:10},
  Hoenn: {chapa:5, chapaplata:5, tickets:10}
};
const REWARD_NAMES = {chapa:'Chapas Doradas', chapaplata:'Chapas Plateadas', tickets:'tiradas de Gachapon', bp:'Puntos de Batalla (BP)'};
const rewardOf = F => REWARD_REGION[F.region] || REWARD[F.kind];
function giveReward(F, firstTime){
  let r = rewardOf(F); if(!r || (REWARD.once && !firstTime)) return '';
  const dbl = r.tickets && typeof firstWinToday === 'function' && firstWinToday();            // primera victoria del día: tickets x2 (daily.js)
  if(dbl) r = Object.assign({}, r, {tickets:r.tickets * DAILY.firstWinMult});
  Object.entries(r).forEach(([id, n]) => { if(id === 'tickets') save.tickets += n; else if(id === 'bp') save.bp += n; else save.items[id] = held(id) + n; });
  return Object.entries(r).map(([id, n]) => `+${n} ${REWARD_NAMES[id]}`).join(' · ') + (dbl ? ` · ¡Primera victoria del día: tickets x${DAILY.firstWinMult}!` : '');
}
const rewardText = F => rewardOf(F) ? Object.entries(rewardOf(F)).map(([id, n]) => `${n} ${REWARD_NAMES[id]}`).join(' + ') : '';

// ---------------------------------------------------------------------
// Comprobación de las reglas. Devuelve la lista de problemas ([] = todo bien).
// ---------------------------------------------------------------------
function validateTeams(){
  const bad = [], keys = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  const lists = FLOORS.map(F => [F.id, TEAMS[F.id], [6]]).concat(typeof CAMPO !== 'undefined' ? CAMPO.map(T => ['campo/' + T.id, T.team, [3, 4]]) : []);   // líderes: 6 Pokémon · Campo de Entrenamiento: 3 o 4
  lists.forEach(([id, t, sizes]) => {
    if(!t){ bad.push(`${id}: sin plantilla`); return; }
    if(!sizes.includes(t.length)) bad.push(`${id}: tiene ${t.length} Pokémon (deben ser ${sizes.join(' o ')})`);
    if(!t.dupOk && new Set(t.map(s => s.dex)).size !== t.length) bad.push(`${id}: especie repetida`);      // dupOk: equipos que repiten especie en el juego original (Hoenn: Norman, Fátima, Nívea)
    t.forEach(s => {
      const n = `${id}/${mon(s.dex).name}`, ev = keys.map(k => s.ev[k] || 0), tot = ev.reduce((a, b) => a + b, 0);
      if(keys.some(k => s.iv[k] !== 31)) bad.push(`${n}: los IVs deben ser 31`);
      if(ev.some(v => v > 252 || v < 0)) bad.push(`${n}: EV por encima de 252`);
      if(tot > 510) bad.push(`${n}: EVs ${tot} > 510`);
      if(!NATURES.some(x => x[0] === s.nat)) bad.push(`${n}: naturaleza desconocida ${s.nat}`);
      if(!ITEMS[s.item]) bad.push(`${n}: objeto desconocido ${s.item}`);
      if(!s.ab) bad.push(`${n}: sin habilidad`);
      if(!s.mv || s.mv.length !== 4) bad.push(`${n}: necesita 4 movimientos`);
      else s.mv.forEach((m, i) => { if(!MOVES[m]) bad.push(`${n}: movimiento desconocido ${m}`); else if(MOVES[m].s !== i + 1) bad.push(`${n}: ${m} no es del hueco ${i + 1}`); });
    });
  });
  return bad;
}
// (la comprobación al cargar se hace al final de campo.js, cuando ya están los equipos de los líderes y los del Campo de Entrenamiento)
