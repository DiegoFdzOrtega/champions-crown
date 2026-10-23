"use strict";
/* =====================================================================
   18) JOHTO: 8 líderes de gimnasio, Alto Mando (4) y Campeón (Lance), con sus equipos de 6 Pokémon
   Se carga DESPUÉS de teams.js (usa P, TEAMS, ABIL_DESC, REWARD_REGION...) y ANTES de campo.js (que comprueba todos los equipos al final).

   CÓMO ESTÁ HECHO (igual que Kanto, ver teams.js):
     P(nº de Pokédex, 'Naturaleza', 'Habilidad', 'objeto', {EVs}, ['golpe', 'disparo', 'mejora', 'ataque fuerte'])
   - 6 Pokémon por entrenador, sin repetir especie · IVs 31 · EVs de 252 como máximo por estadística y 510 en total
   - Equipos canónicos: los de Oro/Plata/Cristal y HeartGold/SoulSilver. Los 8 líderes llevan su equipo de REVANCHA de HGSS
     (el del Dojo Lucha de Ciudad Azafrán, con los 6 Pokémon de cada uno). Mento, Koga, Bruno y Karen llevan sus 5 Pokémon de la Liga
     de Johto + 1 más de su misma temática. Lance lleva sus Pokémon de la Liga (Gyarados, Dragonite, Aerodactyl, Charizard) + Dragonair y Kingdra
     (los de su combate múltiple con Débora en la Guarida del Dragón).
   - El último de cada lista es el As del equipo.

   DIFICULTAD (cambia estos números para equilibrar):
     lvl = nivel del rival (más nivel = más vida y daño)   dn = índice de dificultad (ver DIFF en data.js; Kanto va de 0 a 12)
     Johto empieza en dn 2 (Pegaso ≈ Giovanni) y acaba en dn 14 (Lance, algo más duro que Azul).
   RECOMPENSA: REWARD_REGION.Johto (teams.js): 5 Chapas Doradas + 5 Plateadas + 10 tiradas de Gachapon por cada victoria.
   ===================================================================== */
Object.assign(TEAMS, {
  // ---------------- LÍDERES DE GIMNASIO ----------------
  pegaso: [   // Volador · Ciudad Malva. Revancha de HGSS: Staraptor, Pelipper, Honchkrow, Noctowl, Swellow, Pidgeot
    P(279, 'Modesta', 'Llovizna',      'gafaselec', {hp:252, spa:252, def:4}, ['Ataque Ala',   'Hidropulso', 'Danza Lluvia', 'Hidrobomba']),    // Pelipper: lluvia + Hidrobomba
    P(164, 'Modesta', 'Cromolente',    'gafasesp',  {hp:252, spa:252, spd:4}, ['Ataque Ala',   'Triataque',  'Paz Mental',   'Psíquico']),      // Noctowl
    P(277, 'Alegre',  'Agallas',       'cintaelec', {atk:252, spe:252, hp:4}, ['Ataque Rápido','Tajo Aéreo', 'Danza Espada', 'Pájaro Osado']),  // Swellow
    P(430, 'Firme',   'Autoestima',    'gafasol',   {atk:252, hp:252, spe:4}, ['Mordisco',     'Tajo Aéreo', 'Danza Espada', 'Pájaro Osado']),  // Honchkrow
    P(398, 'Alegre',  'Intimidación',  'vidasfera', {atk:252, spe:252, hp:4}, ['Ataque Ala',   'Tajo Aéreo', 'Viento Afín',  'Pájaro Osado']),  // Staraptor
    P( 18, 'Alegre',  'Vista Lince',   'panuelo',   {atk:252, spe:252, hp:4}, ['Ataque Ala',   'Tajo Aéreo', 'Agilidad',     'Pájaro Osado'])   // Pidgeot: As (su Pokémon más fuerte en HGSS)
  ],
  anton: [    // Bicho · Pueblo Azalea. Revancha de HGSS: Shedinja, Vespiquen, Pinsir, Heracross, Yanmega, Scizor
    P(292, 'Alegre',  'Superguardia',  'periscopio',{atk:252, spe:252, hp:4}, ['Tijera X',      'Tinieblas',  'Danza Aleteo', 'Megacuerno']),  // Shedinja: solo le hace daño lo muy eficaz
    P(416, 'Serena',  'Presión',       'restos',    {hp:252, spd:252, def:4}, ['Tijera X',      'Zumbido',    'Danza Aleteo', 'Megacuerno']),  // Vespiquen: aguanta
    P(127, 'Firme',   'Rompemoldes',   'cintaelec', {atk:252, spe:252, hp:4}, ['Tijera X',      'Pin Misil',  'Danza Espada', 'Megacuerno']),  // Pinsir
    P(214, 'Firme',   'Agallas',       'vidasfera', {atk:252, hp:252, spe:4}, ['Tijera X',      'Esfera Aural','Danza Espada','Onda Certera']),// Heracross
    P(469, 'Miedosa', 'Impulso',       'panuelo',   {spa:252, spe:252, hp:4}, ['Ataque Ala',    'Zumbido',    'Danza Aleteo', 'Megacuerno']),  // Yanmega: rapidísimo
    P(212, 'Firme',   'Técnico',       'aguante',   {hp:252, atk:252, def:4}, ['Garra Metal',   'Pin Misil',  'Danza Espada', 'Megacuerno'])   // Scizor: As
  ],
  blanca: [   // Normal · Ciudad Trigal. Revancha de HGSS: Bibarel, Lickilicky, Clefable, Girafarig, Delcatty, Miltank
    P(301, 'Alegre',  'Normalidad',    'cintaelec', {atk:252, spe:252, hp:4}, ['Ataque Rápido','Triataque',   'Danza Espada', 'Hiperrayo']),    // Delcatty
    P(400, 'Firme',   'Ignorante',     'restos',    {hp:252, atk:252, def:4}, ['Placaje',      'Hidropulso',  'Danza Espada', 'Terremoto']),    // Bibarel
    P(463, 'Osada',   'Ritmo Propio',  'chaleco',   {hp:252, def:252, atk:4}, ['Placaje',      'Disparo Lodo','Amnesia',      'Terremoto']),    // Lickilicky: tanque
    P(203, 'Modesta', 'Foco Interno',  'gafaselec', {spa:252, spe:252, hp:4}, ['Cabezazo Zen', 'Psicorrayo',  'Paz Mental',   'Psíquico']),     // Girafarig
    P( 36, 'Modesta', 'Muro Mágico',   'cascabel',  {hp:252, spa:252, def:4}, ['Carantoña',    'Voz Cautivadora','Paz Mental','Fuerza Lunar']), // Clefable (el Clefairy de su gimnasio, evolucionado)
    P(241, 'Firme',   'Intrépido',     'vidasfera', {hp:252, atk:252, spe:4}, ['Golpe Cuerpo', 'Doble Filo',  'Danza Espada', 'Terremoto'])     // Miltank: la famosa As de Blanca
  ],
  morti: [    // Fantasma · Ciudad Iris. Revancha de HGSS: Drifblim, Dusknoir, Sableye, Mismagius, Gengar (y Haunter, el de su gimnasio, en vez del 2º Gengar)
    P(426, 'Modesta', 'Liviano',       'gafasesp',  {hp:252, spa:252, spd:4}, ['Lengüetazo',   'Tornado',     'Maldición',    'Bola Sombra']),   // Drifblim
    P(302, 'Modesta', 'Bromista',      'gafasol',   {hp:252, spa:252, spd:4}, ['Garra Umbría', 'Pulso Umbrío','Paz Mental',   'Pulso Noche']),   // Sableye
    P(477, 'Osada',   'Presión',       'chaleco',   {hp:252, def:252, atk:4}, ['Garra Umbría', 'Tinieblas',   'Maldición',    'Bola Sombra']),   // Dusknoir: tanque
    P(429, 'Miedosa', 'Levitación',    'aguante',   {spa:252, spe:252, hp:4}, ['Lengüetazo',   'Pulso Umbrío','Maquinación',  'Bola Sombra']),   // Mismagius
    P( 93, 'Miedosa', 'Levitación',    'gafaselec', {spa:252, spe:252, hp:4}, ['Lengüetazo',   'Bomba Lodo',  'Paz Mental',   'Bola Sombra']),   // Haunter
    P( 94, 'Miedosa', 'Levitación',    'vidasfera', {spa:252, spe:252, hp:4}, ['Garra Umbría', 'Bomba Lodo',  'Maquinación',  'Bola Sombra'])    // Gengar: As
  ],
  anibal: [   // Lucha · Ciudad Orquídea. Revancha de HGSS: Breloom, Medicham, Hitmonchan, Hitmonlee, Primeape, Poliwrath
    P(286, 'Alegre',  'Técnico',       'periscopio',{atk:252, spe:252, hp:4}, ['Golpe Roca',    'Hoja Afilada','Danza Espada', 'Onda Certera']),  // Breloom
    P(308, 'Alegre',  'Energía Pura',  'cinturon',  {atk:252, spe:252, hp:4}, ['Golpe Roca',    'Psicorrayo',  'Corpulencia',  'Onda Certera']),  // Medicham
    P(107, 'Alegre',  'Puño Férreo',   'cintaelec', {atk:252, spe:252, hp:4}, ['Golpe Roca',    'Rayo Hielo',  'Danza Espada', 'Onda Certera']),  // Hitmonchan
    P(106, 'Alegre',  'Liviano',       'aguante',   {atk:252, spe:252, hp:4}, ['Golpe Roca',    'Esfera Aural','Corpulencia',  'Onda Certera']),  // Hitmonlee
    P( 57, 'Firme',   'Irascible',     'casco',     {hp:252, atk:252, def:4}, ['Golpe Roca',    'Lanzarrocas', 'Corpulencia',  'Onda Certera']),  // Primeape
    P( 62, 'Firme',   'Absorbe Agua',  'restos',    {hp:252, atk:252, def:4}, ['Golpe Roca',    'Hidropulso',  'Corpulencia',  'Hidrobomba'])     // Poliwrath: As
  ],
  yasmina: [  // Acero · Ciudad Olivo. Revancha de HGSS: Bronzong, Skarmory, Empoleon, Metagross, Magnezone, Steelix
    P(437, 'Osada',   'Levitación',    'restos',    {hp:252, def:252, spd:4}, ['Garra Metal',   'Psicorrayo',  'Defensa Férrea','Foco Resplandor']), // Bronzong
    P(227, 'Osada',   'Robustez',      'casco',     {hp:252, def:252, spd:4}, ['Garra Metal',   'Tajo Aéreo',  'Defensa Férrea','Pájaro Osado']),    // Skarmory
    P(395, 'Modesta', 'Torrente',      'gafasesp',  {hp:252, spa:252, def:4}, ['Garra Metal',   'Hidropulso',  'Danza Lluvia',  'Hidrobomba']),      // Empoleon
    P(376, 'Firme',   'Cuerpo Puro',   'vidasfera', {atk:252, hp:252, spe:4}, ['Cabezazo Zen',  'Bomba Imán',  'Defensa Férrea','Terremoto']),       // Metagross
    P(462, 'Modesta', 'Imán',          'chaleco',   {hp:252, spa:252, def:4}, ['Garra Metal',   'Rayo',        'Defensa Férrea','Foco Resplandor']), // Magnezone (su Magnemite del gimnasio)
    P(208, 'Firme',   'Potencia Bruta','aguante',   {hp:252, atk:252, def:4}, ['Garra Metal',   'Lanzarrocas', 'Defensa Férrea','Terremoto'])        // Steelix: As (su Pokémon de siempre)
  ],
  fredo: [    // Hielo · Pueblo Caoba. Revancha de HGSS: Abomasnow, Glalie, Froslass, Walrein, Dewgong, Mamoswine
    P(460, 'Modesta', 'Nevada',        'gafaselec', {hp:252, spa:252, def:4}, ['Colmillo Hielo','Hoja Afilada','Desarrollo',  'Ventisca']),      // Abomasnow: trae la nieve
    P(362, 'Modesta', 'Cuerpo Gélido', 'periscopio',{hp:252, spa:252, def:4}, ['Colmillo Hielo','Rayo Hielo',  'Neblina',      'Ventisca']),      // Glalie
    P(478, 'Miedosa', 'Cuerpo Maldito','aguante',   {spa:252, spe:252, hp:4}, ['Colmillo Hielo','Rayo Hielo',  'Maldición',    'Bola Sombra']),   // Froslass
    P(365, 'Modesta', 'Sebo',          'restos',    {hp:252, spa:252, spd:4}, ['Colmillo Hielo','Hidropulso',  'Amnesia',      'Ventisca']),      // Walrein: tanque
    P( 87, 'Modesta', 'Sebo',          'cascabel',  {hp:252, spa:252, def:4}, ['Acua Cola',     'Rayo Hielo',  'Danza Lluvia', 'Ventisca']),      // Dewgong (el de su gimnasio)
    P(473, 'Firme',   'Sebo',          'vidasfera', {atk:252, spe:252, hp:4}, ['Colmillo Hielo','Lanzarrocas', 'Danza Espada', 'Terremoto'])      // Mamoswine: As
  ],
  debora: [   // Dragón · Ciudad Endrino. Revancha de HGSS: Dragonair, Aerodactyl, Charizard, Kingdra, Gyarados, Dragonite
    P(148, 'Modesta', 'Mudar',         'restos',    {hp:252, spa:252, spe:4}, ['Garra Dragón',  'Pulso Dragón','Danza Dragón', 'Cometa Draco']),  // Dragonair (en su gimnasio lleva tres)
    P(142, 'Alegre',  'Presión',       'aguante',   {atk:252, spe:252, hp:4}, ['Ataque Ala',    'Lanzarrocas', 'Agilidad',     'Roca Afilada']),  // Aerodactyl
    P(  6, 'Miedosa', 'Poder Solar',   'gafasesp',  {spa:252, spe:252, hp:4}, ['Ataque Ala',    'Lanzallamas', 'Día Soleado',  'Llamarada']),     // Charizard
    P(230, 'Modesta', 'Nado Rápido',   'chaleco',   {hp:252, spa:252, spe:4}, ['Acua Cola',     'Pulso Dragón','Danza Lluvia', 'Hidrobomba']),    // Kingdra
    P(130, 'Alegre',  'Intimidación',  'cinturon',  {atk:252, spe:252, hp:4}, ['Acua Cola',     'Dragoaliento','Danza Dragón', 'Terremoto']),     // Gyarados
    P(149, 'Firme',   'Multiescala',   'cintaelec', {atk:252, spe:252, hp:4}, ['Garra Dragón',  'Rayo',        'Danza Dragón', 'Terremoto'])      // Dragonite: As
  ],

  // ---------------- ALTO MANDO Y CAMPEÓN DE JOHTO ----------------
  mento: [    // Psíquico (Will). Oro/Plata/HGSS: Xatu, Jynx, Exeggutor, Slowbro (y otro Xatu) + Espeon y Wobbuffet
    P(202, 'Serena',  'Sombra Trampa', 'chaleco',   {hp:252, spd:252, def:4}, ['Cabezazo Zen',  'Confusión',   'Amnesia',      'Psíquico']),      // Wobbuffet: tanque
    P( 80, 'Osada',   'Regeneración',  'restos',    {hp:252, def:252, spd:4}, ['Cabezazo Zen',  'Hidropulso',  'Paz Mental',   'Psíquico']),      // Slowbro
    P(103, 'Modesta', 'Clorofila',     'cuchara',   {hp:252, spa:252, spe:4}, ['Cabezazo Zen',  'Psicorrayo',  'Desarrollo',   'Rayo Solar']),    // Exeggutor
    P(196, 'Miedosa', 'Sincronía',     'vidasfera', {spa:252, spe:252, hp:4}, ['Cabezazo Zen',  'Psicorrayo',  'Paz Mental',   'Psíquico']),      // Espeon
    P(124, 'Miedosa', 'Piel Seca',     'gafasesp',  {spa:252, spe:252, hp:4}, ['Cabezazo Zen',  'Rayo Hielo',  'Paz Mental',   'Psíquico']),      // Jynx
    P(178, 'Miedosa', 'Espejo Mágico', 'gafaselec', {spa:252, spe:252, hp:4}, ['Cabezazo Zen',  'Tornado',     'Paz Mental',   'Psíquico'])       // Xatu: As (lleva dos en la Liga)
  ],
  karen: [    // Siniestro (Karen). Oro/Plata/HGSS: Umbreon, Vileplume, Gengar, Murkrow, Houndoom + Weavile
    P( 45, 'Modesta', 'Efecto Espora', 'chaleco',   {hp:252, spa:252, def:4}, ['Látigo Cepa',   'Bomba Lodo',  'Desarrollo',   'Rayo Solar']),    // Vileplume
    P(198, 'Alegre',  'Bromista',      'aguante',   {atk:252, spe:252, hp:4}, ['Mordisco',      'Tajo Aéreo',  'Maquinación',  'Pájaro Osado']),  // Murkrow
    P(197, 'Serena',  'Sincronía',     'restos',    {hp:252, spd:252, def:4}, ['Mordisco',      'Pulso Umbrío','Paz Mental',   'Pulso Noche']),   // Umbreon: tanque
    P(461, 'Alegre',  'Presión',       'cintaelec', {atk:252, spe:252, hp:4}, ['Mordisco',      'Rayo Hielo',  'Danza Espada', 'Pulso Noche']),   // Weavile
    P( 94, 'Miedosa', 'Levitación',    'gafaselec', {spa:252, spe:252, hp:4}, ['Garra Umbría',  'Bomba Lodo',  'Maquinación',  'Bola Sombra']),   // Gengar
    P(229, 'Miedosa', 'Absorbe Fuego', 'vidasfera', {spa:252, spe:252, hp:4}, ['Mordisco',      'Lanzallamas', 'Maquinación',  'Pulso Noche'])    // Houndoom: As
  ],
  j_lance: [  // Campeón (Lance). Liga de Oro/Plata/HGSS: Gyarados, Dragonite, Aerodactyl, Charizard + Dragonair y Kingdra (combate múltiple de HGSS)
    P(148, 'Modesta', 'Escama Especial','cascabel', {hp:252, spa:252, spe:4}, ['Garra Dragón',  'Pulso Dragón','Danza Dragón', 'Cometa Draco']),  // Dragonair
    P(230, 'Modesta', 'Nado Rápido',   'gafaselec', {spa:252, spe:252, hp:4}, ['Acua Cola',     'Pulso Dragón','Danza Lluvia', 'Hidrobomba']),    // Kingdra
    P(142, 'Alegre',  'Presión',       'panuelo',   {atk:252, spe:252, hp:4}, ['Ataque Ala',    'Lanzarrocas', 'Agilidad',     'Roca Afilada']),  // Aerodactyl
    P(  6, 'Miedosa', 'Poder Solar',   'vidasfera', {spa:252, spe:252, hp:4}, ['Ataque Ala',    'Lanzallamas', 'Día Soleado',  'Llamarada']),     // Charizard
    P(130, 'Alegre',  'Intimidación',  'cinturon',  {atk:252, spe:252, hp:4}, ['Mordisco',      'Dragoaliento','Danza Dragón', 'Hidrobomba']),    // Gyarados
    P(149, 'Firme',   'Multiescala',   'cintaelec', {atk:252, spe:252, hp:4}, ['Garra Dragón',  'Rayo',        'Danza Dragón', 'Terremoto'])      // Dragonite: As (lleva tres en la Liga)
  ]
});
// Koga y Bruno llevan en Johto exactamente el mismo equipo de 6 que en Kanto (en Oro/Plata son sus mismos Pokémon: Ariados, Venomoth, Forretress, Muk, Crobat / Hitmontop,
// Hitmonlee, Hitmonchan, Onix, Machamp). Se copia para que cada uno pueda cambiarse por separado.
TEAMS.j_koga = TEAMS.koga.map(s => ({...s}));
TEAMS.j_bruno = TEAMS.bruno.map(s => ({...s}));

// ---------------------------------------------------------------------
// Los 13 combates de Johto, en orden: 8 líderes, 4 del Alto Mando y el Campeón. id = nombre del retrato (lideres/Johto/<Id>.png) y de la arena (arenasjohto.js)
// ---------------------------------------------------------------------
const JF = (id, leader, tag, kind, lvl, dn, place) =>
  ({id, leader, tag, kind, lvl, diff: kind === 'lider' ? 'dificil' : 'muy_dificil', teams: TEAMS[id], region: 'Johto', idx: 0, dn, place});
FLOORS.push(
  JF('pegaso',  'Pegaso',  'Volador',   'lider', 123, 2, 'Ciudad Malva'),
  JF('anton',   'Antón',   'Bicho',     'lider', 124, 3, 'Pueblo Azalea'),
  JF('blanca',  'Blanca',  'Normal',    'lider', 125, 4, 'Ciudad Trigal'),
  JF('morti',   'Morti',   'Fantasma',  'lider', 126, 5, 'Ciudad Iris'),
  JF('anibal',  'Aníbal',  'Lucha',     'lider', 127, 6, 'Ciudad Orquídea'),
  JF('yasmina', 'Yasmina', 'Acero',     'lider', 128, 7, 'Ciudad Olivo'),
  JF('fredo',   'Fredo',   'Hielo',     'lider', 129, 8, 'Pueblo Caoba'),
  JF('debora',  'Débora',  'Dragón',    'lider', 130, 9, 'Ciudad Endrino'),
  // Alto Mando (MUY DIFÍCIL) y Campeón
  JF('mento',   'Mento',   'Psíquico',  'alto',  131, 9,  'Liga Pokémon'),
  JF('j_koga',  'Koga',    'Veneno',    'alto',  132, 10, 'Liga Pokémon'),
  JF('j_bruno', 'Bruno',   'Lucha',     'alto',  133, 11, 'Liga Pokémon'),
  JF('karen',   'Karen',   'Siniestro', 'alto',  134, 12, 'Liga Pokémon'),
  JF('j_lance', 'Lance',   'Campeón',   'campeon', 140, 14, 'Liga Pokémon')
);
floorsOf('Johto').forEach((F, i) => F.idx = i);                          // posición dentro de Johto (0 = Pegaso)

// Descripción de las habilidades nuevas
Object.assign(ABIL_DESC, {
  'Llovizna':'Al entrar, hace que llueva.', 'Impulso':'Su Velocidad sube con el tiempo.', 'Superguardia':'Solo le dañan los ataques muy eficaces.',
  'Rompemoldes':'Sus ataques ignoran las habilidades defensivas del rival.', 'Energía Pura':'Duplica su Ataque.', 'Irascible':'Si recibe un golpe crítico, su Ataque sube al máximo.',
  'Cuerpo Gélido':'Recupera salud cuando graniza.', 'Imán':'Atrapa a los Pokémon de acero: no pueden huir.', 'Bromista':'Sus movimientos de estado van primero.',
  'Efecto Espora':'Puede dormir, envenenar o paralizar a quien le toca.', 'Normalidad':'Todos sus ataques pasan a ser de tipo Normal.', 'Ritmo Propio':'No se deja confundir.'
});
