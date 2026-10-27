"use strict";
/* =====================================================================
   22) TESELIA (Unova): 8 líderes de gimnasio, Alto Mando (4) y Campeón (Mirto), con sus equipos de 6 Pokémon
   Se carga DESPUÉS de sinnoh.js y ANTES de campo.js (que comprueba todos los equipos al final). No toca nada de Kanto, Johto, Hoenn ni Sinnoh.

   VERSIÓN DE REFERENCIA: Pokémon NEGRO y BLANCO (y sus secuelas). Orden de los gimnasios: Gres (Zeo, Maíz y Millo), Esmalte (Aloe), Porcelana (Camus),
   Mayólica (Camila), Fayenza (Yakón), Loza (Gerania), Teja (Junco) y Caolín (Iris). Alto Mando: Anís, Aza, Lotto y Catleya. Campeón: Mirto.
   Fuentes: Pokémon Database (equipos de Negro/Blanco y Negro 2/Blanco 2), Bulbapedia (Torneo de Líderes de Teselia de Negro 2/Blanco 2: equipos de 6 con
   objeto, habilidad y movimientos, para Millo, Maíz, Zeo, Aloe y Camus) y el anime. Retratos: lideres/Unova/<Nombre>.png.

   CÓMO ESTÁ HECHO (igual que Kanto, Johto, Hoenn y Sinnoh, ver teams.js):
     P(nº de Pokédex, 'Naturaleza', 'Habilidad', 'objeto', {EVs}, ['golpe', 'disparo', 'mejora', 'ataque fuerte'])
   - LÍDERES: en los juegos llevan solo 2 o 3 Pokémon, así que aquí cada uno lleva un equipo de 6 con los Pokémon de su combate de Negro/Blanco, su
     revancha de Negro 2/Blanco 2 y su Torneo de Líderes. Los de Millo, Maíz, Zeo, Aloe y Camus son EXACTAMENTE los de ese torneo. El último del equipo
     es siempre el As.
       OJO: los de Camila, Yakón, Gerania, Junco e Iris no pude comprobarlos entero (el torneo no estaba disponible). Llevan los Pokémon de sus combates
       oficiales y los demás son los que más usan en los juegos y el anime. Si no coincide con tu juego, cámbialos aquí en TEAMS.
   - SIN SPRITE: los Pokémon de NO_SPRITE (data.js) no se ven en el menú (salen como un círculo). Por eso Simipour, Simisear, Crustle, Zebstrika, Jellicent, Throh y Bouffalant
     se han sustituido por Starmie, Magmortar, Pinsir, Manectric, Mismagius, Hariyama y Snorlax. Cuando tengas sus sprites, quítalos de NO_SPRITE y vuelve a ponerlos.
   - GRES: tiene TRES líderes (hermanos). Como en los juegos, van los tres, uno detrás de otro: Zeo (fuego), Maíz (agua) o Millo (planta).
   - CAOLÍN: hay dos versiones del gimnasio (Blanco: tradicional oriental · Negro: moderno y tecnológico). Cada intento sale una al azar.
   - ALTO MANDO Y CAMPEÓN: los 4-6 Pokémon oficiales de Negro/Blanco/Negro 2/Blanco 2 de cada uno, más 1-2 que usan en el anime o en otros juegos.
   - Especies repetidas entre equipos son normales; dentro de un mismo equipo no se repite ninguna.
   - Los movimientos son los más parecidos que permite el motor (4 huecos: golpe / disparo / mejora / ataque fuerte, ver MOVESET en moves.js).

   DIFICULTAD (cambia estos números para equilibrar): lvl = nivel del rival · dn = índice de dificultad (DIFF en data.js).
     Sinnoh: dn 6-18 · Teselia: empieza en dn 8 (Gres ≈ Roco + 2) y acaba en dn 20 (Mirto, el más duro de las cinco Ligas).
   RECOMPENSA: REWARD_REGION['Unova / Teselia'] (teams.js): 5 Chapas Doradas + 5 Plateadas + 10 tiradas de Gachapon por cada victoria.
   ===================================================================== */
Object.assign(TEAMS, {
  // ---------------- GRES: los tres hermanos (te toca uno) ----------------
  maiz: [     // Agua · Cress (Maíz). Torneo de Líderes: Crawdaunt, Samurott, Azumarill, Slowking, Seismitoad + Simipour (su Pokémon de siempre, siempre abre con él)
    P(342, 'Alegre',  'Armadura Batalla','panuelo',  {atk:252, spe:252, hp:4}, ['Mordisco',      'Hidropulso',  'Danza Espada',  'Hidrobomba']),    // Crawdaunt: Pañuelo Elección
    P(503, 'Firme',   'Torrente',        'restos',   {hp:252, atk:252, def:4}, ['Acua Cola',     'Hidropulso',  'Danza Espada',  'Megacuerno']),    // Samurott: Concha Filo + Megacuerno
    P(184, 'Firme',   'Sebo',            'cintaelec',{atk:252, hp:252, def:4}, ['Acua Cola',     'Voz Cautivadora','Corpulencia','Hidrobomba']),   // Azumarill: Banda Elección
    P(199, 'Modesta', 'Ritmo Propio',    'gafasesp', {hp:252, spa:252, def:4}, ['Cabezazo Zen',  'Rayo Hielo',  'Maquinación',   'Psíquico']),      // Slowking
    P(537, 'Modesta', 'Nado Rápido',     'restos',   {hp:252, spa:252, def:4}, ['Puya Nociva',   'Disparo Lodo','Danza Lluvia',  'Hidrobomba']),    // Seismitoad: lluvia
    P(121, 'Modesta', 'Absorbe Agua',    'vidasfera',{spa:252, spe:252, hp:4}, ['Acua Cola',     'Psicorrayo',  'Danza Lluvia',  'Hidrobomba'])     // Starmie: As (en vez de Simipour, que aún no tiene sprite)
  ],
  zeo: [      // Fuego · Chili (Zeo). Torneo de Líderes: Heatmor, Darmanitan, Arcanine, Camerupt, Emboar + Simisear
    P(631, 'Modesta', 'Absorbe Fuego',   'aguante',  {spa:252, spe:252, hp:4}, ['Colmillo Ígneo','Lanzallamas', 'Día Soleado',   'Llamarada']),     // Heatmor: Banda Aguante
    P(555, 'Alegre',  'Mar Llamas',      'vidasfera',{atk:252, spe:252, hp:4}, ['Puño Fuego',    'Lanzarrocas', 'Danza Espada',  'Envite Ígneo']),  // Darmanitan: Vidasfera
    P( 59, 'Modesta', 'Intimidación',    'gafasesp', {spa:252, spe:252, hp:4}, ['Colmillo Ígneo','Pulso Dragón','Día Soleado',   'Llamarada']),     // Arcanine
    P(323, 'Modesta', 'Roca Sólida',     'chaleco',  {hp:252, spa:252, def:4}, ['Tumba Rocas',   'Lanzallamas', 'Día Soleado',   'Terremoto']),     // Camerupt
    P(500, 'Firme',   'Mar Llamas',      'cintaelec',{atk:252, hp:252, def:4}, ['Puño Fuego',    'Rayo',        'Corpulencia',   'Envite Ígneo']),  // Emboar: Cinturón Experto
    P(467, 'Modesta', 'Cuerpo Llama',    'vidasfera',{spa:252, hp:252, def:4}, ['Puño Fuego',    'Lanzallamas', 'Día Soleado',   'Llamarada'])      // Magmortar: As (en vez de Simisear, que aún no tiene sprite)
  ],
  millo: [    // Planta · Cilan. Torneo de Líderes: Ferrothorn, Serperior, Jumpluff, Whimsicott, Lilligant + Simisage
    P(598, 'Firme',   'Piel Tosca',      'casco',    {hp:252, atk:252, def:4}, ['Látigo Cepa',   'Bomba Imán',  'Defensa Férrea','Terremoto']),    // Ferrothorn: Espinas de Hierro
    P(497, 'Modesta', 'Espesura',        'restos',   {spa:252, spe:252, hp:4}, ['Látigo Cepa',   'Pulso Dragón','Desarrollo',    'Rayo Solar']),    // Serperior
    P(189, 'Alegre',  'Clorofila',       'aguante',  {atk:252, spe:252, hp:4}, ['Látigo Cepa',   'Viento Feérico','Desarrollo',  'Rayo Solar']),    // Jumpluff: Banda Aguante
    P(547, 'Modesta', 'Bromista',        'restos',   {hp:252, spa:252, def:4}, ['Carantoña',     'Tornado',     'Desarrollo',    'Rayo Solar']),    // Whimsicott: Bromista
    P(549, 'Modesta', 'Clorofila',       'vidasfera',{spa:252, spe:252, hp:4}, ['Látigo Cepa',   'Hoja Afilada','Danza Aleteo',  'Rayo Solar']),    // Lilligant: Danza Aleteo
    P(512, 'Modesta', 'Espesura',        'vidasfera',{spa:252, spe:252, hp:4}, ['Mordisco',      'Hoja Afilada','Desarrollo',    'Rayo Solar'])     // Simisage: As (Gema Planta)
  ],
  // ---------------- LÍDERES ----------------
  aloe: [     // Normal · Ciudad Esmalte (Lenora). Torneo de Líderes: Braviary, Cinccino, Kangaskhan, Sawsbuck, Lickilicky + Watchog
    P(628, 'Alegre',  'Vista Lince',     'vidasfera',{atk:252, spe:252, hp:4}, ['Ataque Ala',    'Doble Filo',  'Viento Afín',   'Pájaro Osado']),  // Braviary
    P(573, 'Alegre',  'Técnico',         'vidasfera',{atk:252, spe:252, hp:4}, ['Ataque Rápido', 'Rayo',        'Afilar',        'Onda Certera']),  // Cinccino: Técnico
    P(115, 'Firme',   'Intrépido',       'chaleco',  {hp:252, atk:252, def:4}, ['Puño Hielo',    'Doble Filo',  'Corpulencia',   'Terremoto']),     // Kangaskhan
    P(586, 'Alegre',  'Clorofila',       'panuelo',  {atk:252, spe:252, hp:4}, ['Cabezazo',      'Rayo',        'Danza Espada',  'Megacuerno']),    // Sawsbuck: Pañuelo Elección
    P(463, 'Modesta', 'Ritmo Propio',    'gafasesp', {hp:252, spa:252, def:4}, ['Lengüetazo',    'Rayo Hielo',  'Amnesia',       'Hidrobomba']),    // Lickilicky
    P(505, 'Alegre',  'Vista Lince',     'aguante',  {atk:252, spe:252, hp:4}, ['Mordisco',      'Triataque',   'Afilar',        'Hiperrayo'])      // Watchog: As (Banda Aguante)
  ],
  camus: [    // Bicho · Ciudad Porcelana (Burgh). Torneo de Líderes: Vespiquen, Crustle, Heracross, Accelgor, Durant + Leavanny
    P(416, 'Osada',   'Presión',         'restos',   {hp:252, def:252, spd:4}, ['Tijera X',      'Zumbido',     'Danza Aleteo',  'Megacuerno']),    // Vespiquen
    P(127, 'Firme',   'Ojo Compuesto',   'vidasfera',{hp:252, atk:252, def:4}, ['Tijera X',      'Zumbido',     'Danza Aleteo',  'Megacuerno']),    // Pinsir (en vez de Crustle, sin sprite)
    P(214, 'Alegre',  'Agallas',         'panuelo',  {atk:252, spe:252, hp:4}, ['Garra Umbría',  'Lanzarrocas', 'Corpulencia',   'Megacuerno']),    // Heracross: Pañuelo Elección
    P(617, 'Miedosa', 'Viscosidad',      'gafasesp', {spa:252, spe:252, hp:4}, ['Ataque Rápido', 'Zumbido',     'Agilidad',      'Onda Certera']),  // Accelgor
    P(632, 'Alegre',  'Enjambre',        'cintaelec',{atk:252, spe:252, hp:4}, ['Garra Metal',   'Pin Misil',   'Danza Espada',  'Megacuerno']),    // Durant
    P(542, 'Alegre',  'Enjambre',        'aguante',  {atk:252, spe:252, hp:4}, ['Tijera X',      'Hoja Afilada','Danza Espada',  'Megacuerno'])     // Leavanny: As (Banda Aguante)
  ],
  camila: [   // Eléctrico · Ciudad Mayólica (Elesa). Negro/Blanco: Emolga, Zebstrika (+ Flaaffy en las secuelas) · extras: Galvantula, Eelektross, Jolteon
    P(587, 'Miedosa', 'Electromotor',    'gafasesp', {spa:252, spe:252, hp:4}, ['Ataque Rápido', 'Tajo Aéreo',  'Carga',         'Trueno']),        // Emolga
    P(596, 'Miedosa', 'Ojo Compuesto',   'gafaselec',{spa:252, spe:252, hp:4}, ['Colmillo Rayo', 'Zumbido',     'Carga',         'Trueno']),        // Galvantula
    P(181, 'Modesta', 'Pararrayos',      'restos',   {hp:252, spa:252, def:4}, ['Puño Trueno',   'Rayo',        'Carga',         'Trueno']),        // Ampharos (su Flaaffy de Negro 2/Blanco 2)
    P(604, 'Modesta', 'Levitación',      'vidasfera',{hp:252, spa:252, def:4}, ['Colmillo Rayo', 'Lanzallamas', 'Carga',         'Trueno']),        // Eelektross
    P(135, 'Miedosa', 'Absorbe Elec.',   'gafaselec',{spa:252, spe:252, hp:4}, ['Colmillo Rayo', 'Rayo',        'Carga',         'Trueno']),        // Jolteon
    P(310, 'Modesta', 'Electromotor',    'vidasfera',{spa:252, spe:252, hp:4}, ['Colmillo Rayo', 'Rayo',        'Carga',         'Trueno'])         // Manectric: As (en vez de Zebstrika, sin sprite)
  ],
  yakon: [    // Tierra · Ciudad Fayenza (Clay). Negro/Blanco: Krokorok, Palpitoad, Excadrill (+ Sandslash en las secuelas) · extra: Hippowdon
    P( 28, 'Firme',   'Velo Arena',      'chaleco',  {hp:252, atk:252, def:4}, ['Excavar',       'Disparo Lodo','Danza Espada',  'Terremoto']),     // Sandslash
    P(537, 'Modesta', 'Nado Rápido',     'restos',   {hp:252, spa:252, def:4}, ['Puya Nociva',   'Hidropulso',  'Amnesia',       'Terremoto']),     // Seismitoad (su Palpitoad evolucionado)
    P(553, 'Alegre',  'Autoestima',      'vidasfera',{atk:252, spe:252, hp:4}, ['Mordisco',      'Disparo Lodo','Danza Espada',  'Terremoto']),     // Krookodile (su Krokorok evolucionado)
    P(450, 'Osada',   'Chorro Arena',    'restos',   {hp:252, def:252, spd:4}, ['Mordisco',      'Disparo Lodo','Tormenta de Arena','Terremoto']), // Hippowdon (extra): levanta la arena
    P(464, 'Firme',   'Cabeza Roca',     'casco',    {hp:252, atk:252, def:4}, ['Tumba Rocas',   'Disparo Lodo','Corpulencia',   'Terremoto']),     // Rhyperior (extra)
    P(530, 'Alegre',  'Ímpetu Arena',    'cinturon', {atk:252, spe:252, hp:4}, ['Excavar',       'Bomba Imán',  'Danza Espada',  'Terremoto'])      // Excadrill: As, doble de rápido con la arena
  ],
  gerania: [  // Volador · Ciudad Loza (Skyla). Negro/Blanco: Swoobat, Unfezant, Swanna (+ Skarmory en las secuelas) · extras: Sigilyph, Mandibuzz
    P(528, 'Modesta', 'Ignorante',       'gafasesp', {hp:252, spa:252, def:4}, ['Cabezazo Zen',  'Tajo Aéreo',  'Amnesia',       'Psíquico']),      // Swoobat
    P(521, 'Alegre',  'Vista Lince',     'periscopio',{atk:252, spe:252, hp:4},['Ataque Ala',    'Tajo Aéreo',  'Viento Afín',   'Pájaro Osado']),  // Unfezant
    P(227, 'Osada',   'Robustez',        'restos',   {hp:252, def:252, spd:4}, ['Garra Metal',   'Tajo Aéreo',  'Defensa Férrea','Pájaro Osado']),  // Skarmory
    P(561, 'Modesta', 'Muro Mágico',     'gafasesp', {spa:252, spe:252, hp:4}, ['Cabezazo Zen',  'Tajo Aéreo',  'Viento Afín',   'Psíquico']),      // Sigilyph (extra)
    P(630, 'Osada',   'Presión',         'chaleco',  {hp:252, def:252, spd:4}, ['Ataque Ala',    'Pulso Umbrío','Maquinación',   'Pulso Noche']),   // Mandibuzz (extra)
    P(581, 'Modesta', 'Vista Lince',     'gafaselec',{spa:252, spe:252, hp:4}, ['Ataque Ala',    'Tajo Aéreo',  'Danza Lluvia',  'Hidrobomba'])     // Swanna: As
  ],
  junco: [    // Hielo · Ciudad Teja (Brycen). Negro/Blanco: Vanillish, Cryogonal, Beartic · extras: Glalie, Weavile, Mamoswine
    P(615, 'Modesta', 'Levitación',      'gafasesp', {spa:252, spe:252, hp:4}, ['Colmillo Hielo','Rayo Hielo',  'Neblina',       'Ventisca']),      // Cryogonal
    P(584, 'Modesta', 'Nevada',          'gafasesp', {hp:252, spa:252, def:4}, ['Colmillo Hielo','Rayo Hielo',  'Armadura Ácida','Ventisca']),      // Vanilluxe (su Vanillish evolucionado)
    P(362, 'Modesta', 'Cuerpo Gélido',   'restos',   {hp:252, spa:252, def:4}, ['Colmillo Hielo','Rayo Hielo',  'Amnesia',       'Ventisca']),      // Glalie (extra)
    P(461, 'Alegre',  'Presión',         'periscopio',{atk:252, spe:252, hp:4},['Puño Hielo',    'Pulso Umbrío','Danza Espada',  'Ventisca']),      // Weavile (extra)
    P(473, 'Firme',   'Manto Níveo',     'casco',    {hp:252, atk:252, def:4}, ['Colmillo Hielo','Disparo Lodo','Corpulencia',   'Terremoto']),     // Mamoswine (extra)
    P(614, 'Firme',   'Manto Níveo',     'vidasfera',{hp:252, atk:252, def:4}, ['Puño Hielo',    'Hidropulso',  'Corpulencia',   'Ventisca'])       // Beartic: As
  ],
  iris: [     // Dragón · Ciudad Caolín (Lirio/Iris). Negro/Blanco: Fraxure, Druddigon, Haxorus · su equipo de Campeona de Negro 2/Blanco 2
    P(621, 'Firme',   'Piel Tosca',      'restos',   {hp:252, atk:252, def:4}, ['Garra Dragón',  'Dragoaliento','Danza Espada',  'Terremoto']),     // Druddigon
    P(567, 'Alegre',  'Robustez',        'vidasfera',{atk:252, spe:252, hp:4}, ['Ataque Ala',    'Lanzarrocas', 'Danza Espada',  'Roca Afilada']),  // Archeops
    P(131, 'Modesta', 'Absorbe Agua',    'chaleco',  {hp:252, spa:252, spd:4}, ['Colmillo Hielo','Hidropulso',  'Paz Mental',    'Ventisca']),      // Lapras
    P(306, 'Firme',   'Robustez',        'casco',    {hp:252, atk:252, def:4}, ['Garra Metal',   'Lanzarrocas', 'Defensa Férrea','Terremoto']),     // Aggron
    P(635, 'Modesta', 'Levitación',      'gafasesp', {spa:252, spe:252, hp:4}, ['Mordisco',      'Pulso Dragón','Maquinación',   'Cometa Draco']),  // Hydreigon
    P(612, 'Alegre',  'Rompemoldes',     'vidasfera',{atk:252, spe:252, hp:4}, ['Garra Dragón',  'Dragoaliento','Danza Dragón',  'Terremoto'])      // Haxorus: As
  ],
  // ---------------- ALTO MANDO ----------------
  anis: [     // Fantasma (Shauntal). Negro/Blanco: Cofagrigus, Jellicent, Golurk, Chandelure · Negro 2/Blanco 2: Drifblim · extra: Gengar
    P(563, 'Osada',   'Presión',         'restos',   {hp:252, def:252, spd:4}, ['Garra Umbría',  'Pulso Umbrío','Maldición',     'Bola Sombra']),   // Cofagrigus
    P(426, 'Modesta', 'Liviano',         'restos',   {hp:252, spa:252, def:4}, ['Lengüetazo',    'Tornado',     'Maldición',     'Bola Sombra']),   // Drifblim
    P(623, 'Firme',   'Puño Férreo',     'vidasfera',{hp:252, atk:252, def:4}, ['Puño Sombra',   'Disparo Lodo','Corpulencia',   'Terremoto']),     // Golurk
    P(429, 'Modesta', 'Levitación',      'restos',   {spa:252, spe:252, hp:4}, ['Garra Umbría',  'Tinieblas',   'Maldición',     'Bola Sombra']),   // Mismagius (en vez de Jellicent, sin sprite)
    P( 94, 'Miedosa', 'Cuerpo Maldito',  'vidasfera',{spa:252, spe:252, hp:4}, ['Lengüetazo',    'Bomba Lodo',  'Maquinación',   'Bola Sombra']),   // Gengar (extra)
    P(609, 'Miedosa', 'Absorbe Fuego',   'gafaselec',{spa:252, spe:252, hp:4}, ['Lengüetazo',    'Lanzallamas', 'Maquinación',   'Bola Sombra'])    // Chandelure: As
  ],
  aza: [      // Lucha (Marshal). Negro/Blanco: Throh, Sawk, Conkeldurr, Mienshao · extras: Lucario, Machamp
    P(620, 'Alegre',  'Foco Interno',    'panuelo',  {atk:252, spe:252, hp:4}, ['Golpe Roca',    'Esfera Aural','Corpulencia',   'Onda Certera']),  // Mienshao
    P(297, 'Firme',   'Agallas',         'casco',    {hp:252, atk:252, def:4}, ['Golpe Roca',    'Esfera Aural','Corpulencia',   'Onda Certera']),  // Hariyama (en vez de Throh, sin sprite)
    P(539, 'Alegre',  'Foco Interno',    'cintaelec',{atk:252, spe:252, hp:4}, ['Puño Hielo',    'Esfera Aural','Corpulencia',   'Onda Certera']),  // Sawk
    P(448, 'Alegre',  'Justiciero',      'cinturon', {atk:252, spe:252, hp:4}, ['Puño Bala',     'Esfera Aural','Danza Espada',  'Onda Certera']),  // Lucario (extra)
    P( 68, 'Firme',   'Sin Guarda',      'chaleco',  {hp:252, atk:252, def:4}, ['Puño Trueno',   'Lanzarrocas', 'Corpulencia',   'Onda Certera']),  // Machamp (extra)
    P(534, 'Firme',   'Agallas',         'vidasfera',{hp:252, atk:252, def:4}, ['Golpe Roca',    'Lanzarrocas', 'Corpulencia',   'Onda Certera'])   // Conkeldurr: As
  ],
  lotto: [    // Siniestro (Grimsley). Negro/Blanco: Scrafty, Liepard, Krookodile, Bisharp · Negro 2/Blanco 2: Mandibuzz · extra: Houndoom
    P(510, 'Miedosa', 'Bromista',        'panuelo',  {spa:252, spe:252, hp:4}, ['Mordisco',      'Pulso Umbrío','Maquinación',   'Pulso Noche']),   // Liepard
    P(630, 'Osada',   'Presión',         'restos',   {hp:252, def:252, spd:4}, ['Ataque Ala',    'Pulso Umbrío','Maquinación',   'Pulso Noche']),   // Mandibuzz
    P(229, 'Miedosa', 'Absorbe Fuego',   'gafasesp', {spa:252, spe:252, hp:4}, ['Mordisco',      'Lanzallamas', 'Maquinación',   'Pulso Noche']),   // Houndoom (extra)
    P(560, 'Firme',   'Autoestima',      'vidasfera',{hp:252, atk:252, def:4}, ['Mordisco',      'Esfera Aural','Corpulencia',   'Onda Certera']),  // Scrafty
    P(553, 'Alegre',  'Autoestima',      'casco',    {atk:252, spe:252, hp:4}, ['Mordisco',      'Disparo Lodo','Danza Espada',  'Terremoto']),     // Krookodile
    P(625, 'Alegre',  'Justiciero',      'aguante',  {atk:252, spe:252, hp:4}, ['Garra Metal',   'Pulso Umbrío','Danza Espada',  'Pulso Noche'])    // Bisharp: As
  ],
  catleya: [  // Psíquico (Caitlin). Negro/Blanco: Gothitelle, Sigilyph, Reuniclus, Musharna · extras: Espeon, Gardevoir
    P(561, 'Miedosa', 'Muro Mágico',     'gafasesp', {spa:252, spe:252, hp:4}, ['Cabezazo Zen',  'Psicorrayo',  'Paz Mental',    'Psíquico']),      // Sigilyph
    P(518, 'Modesta', 'Sincronía',       'restos',   {hp:252, spa:252, def:4}, ['Cabezazo Zen',  'Confusión',   'Paz Mental',    'Psíquico']),      // Musharna
    P(196, 'Miedosa', 'Sincronía',       'gafaselec',{spa:252, spe:252, hp:4}, ['Cabezazo Zen',  'Psicorrayo',  'Paz Mental',    'Psíquico']),      // Espeon (extra)
    P(282, 'Modesta', 'Espejo Mágico',   'gafasesp', {spa:252, spe:252, hp:4}, ['Cabezazo Zen',  'Voz Cautivadora','Paz Mental', 'Fuerza Lunar']),   // Gardevoir (extra)
    P(579, 'Modesta', 'Muro Mágico',     'restos',   {hp:252, spa:252, def:4}, ['Cabezazo Zen',  'Esfera Aural','Paz Mental',    'Psíquico']),      // Reuniclus
    P(576, 'Modesta', 'Sombra Trampa',   'gafasesp', {hp:252, spa:252, def:4}, ['Cabezazo Zen',  'Psicorrayo',  'Paz Mental',    'Psíquico'])       // Gothitelle: As
  ],
  // ---------------- CAMPEÓN ----------------
  mirto: [    // Campeón de Teselia (Alder, Negro/Blanco): Accelgor, Bouffalant, Druddigon, Vanilluxe, Escavalier, Volcarona
    P(617, 'Miedosa', 'Viscosidad',      'gafaselec',{spa:252, spe:252, hp:4}, ['Ataque Rápido', 'Zumbido',     'Danza Aleteo',  'Onda Certera']),  // Accelgor
    P(143, 'Firme',   'Intimidación',    'vidasfera',{atk:252, hp:252, def:4}, ['Golpe Cuerpo',  'Doble Filo',  'Amnesia',       'Terremoto']),     // Snorlax (en vez de Bouffalant, sin sprite)
    P(621, 'Firme',   'Piel Tosca',      'casco',    {hp:252, atk:252, def:4}, ['Garra Dragón',  'Dragoaliento','Danza Espada',  'Terremoto']),     // Druddigon
    P(584, 'Modesta', 'Nevada',          'gafasesp', {hp:252, spa:252, def:4}, ['Colmillo Hielo','Rayo Hielo',  'Armadura Ácida','Ventisca']),      // Vanilluxe
    P(589, 'Firme',   'Enjambre',        'chaleco',  {hp:252, atk:252, def:4}, ['Tijera X',      'Bomba Imán',  'Danza Espada',  'Megacuerno']),    // Escavalier
    P(637, 'Modesta', 'Cuerpo Llama',    'vidasfera',{spa:252, spe:252, hp:4}, ['Tijera X',      'Zumbido',     'Danza Aleteo',  'Llamarada'])      // Volcarona: As
  ]
});

// ---------------------------------------------------------------------
// Los 13 combates de Teselia, en orden: 8 líderes, 4 del Alto Mando y el Campeón.
// id = nombre del retrato (lideres/Unova/<Nombre>.png, ver LEADER_FILE en data.js) y de la arena (arenasteselia.js)
// Gres: 'trio' = los tres hermanos, uno al azar. Caolín: 'arenas' = las dos versiones del gimnasio, una al azar.
// ---------------------------------------------------------------------
const TESELIA = 'Unova / Teselia';
const TF = (id, leader, tag, kind, lvl, dn, place, extra) =>
  Object.assign({id, leader, tag, kind, lvl, diff: kind === 'lider' ? 'dificil' : 'muy_dificil', teams: TEAMS[id], region: TESELIA, idx: 0, dn, place}, extra);
FLOORS.push(
  // Ciudad Gres: los tres hermanos, tres combates seguidos (comparten el fondo del restaurante)
  TF('zeo',     'Zeo',      'Fuego',     'lider', 143, 7,  'Ciudad Gres', {arena: 'gres'}),
  TF('maiz',    'Maíz',     'Agua',      'lider', 143, 8,  'Ciudad Gres', {arena: 'gres'}),
  TF('millo',   'Millo',    'Planta',    'lider', 144, 8,  'Ciudad Gres', {arena: 'gres'}),
  TF('aloe',    'Aloe',     'Normal',    'lider', 145, 9,  'Ciudad Esmalte'),
  TF('camus',   'Camus',    'Bicho',     'lider', 146, 10, 'Ciudad Porcelana'),
  TF('camila',  'Camila',   'Eléctrico', 'lider', 147, 11, 'Ciudad Mayólica'),
  TF('yakon',   'Yakón',    'Tierra',    'lider', 148, 12, 'Ciudad Fayenza'),
  TF('gerania', 'Gerania',  'Volador',   'lider', 149, 13, 'Ciudad Loza'),
  TF('junco',   'Junco',    'Hielo',     'lider', 150, 14, 'Ciudad Teja'),
  TF('iris',    'Iris',     'Dragón',    'lider', 151, 15, 'Ciudad Caolín', {arenas: ['iris', 'iris_negro']}),
  // Alto Mando (MUY DIFÍCIL) y Campeón
  TF('anis',    'Anís',     'Fantasma',  'alto',  152, 15, 'Liga Pokémon'),
  TF('aza',     'Aza',      'Lucha',     'alto',  153, 16, 'Liga Pokémon'),
  TF('lotto',   'Lotto',    'Siniestro', 'alto',  154, 17, 'Liga Pokémon'),
  TF('catleya', 'Catleya',  'Psíquico',  'alto',  155, 18, 'Liga Pokémon'),
  TF('mirto',   'Mirto',    'Campeón',   'campeon', 162, 20, 'Liga Pokémon')
);
floorsOf(TESELIA).forEach((F, i) => F.idx = i);                          // posición dentro de Teselia (0 = Gres)

// ---- Partidas ya terminadas: si una región tiene un combate nuevo (como cuando Gres pasó de 1 a 3 combates), quien ya es Campeón de ella la sigue teniendo completa ----
// El progreso se guarda como un NÚMERO de combates superados, así que al añadir combates el número viejo se quedaba corto y parecía que se reiniciaba la región.
// Ser Campeón (save.champ) significa que venciste a todos, así que el progreso se sube al total. Funciona para todas las regiones y para los combates que añadamos en el futuro.
(function healProgress(){
  let fixed = false;
  Object.keys(save.champ || {}).forEach(R => { const n = floorsOf(R).length; if(save.champ[R] && n && progOf(R) < n){ setProg(R, n); fixed = true; } });
  if(fixed) persist();
})();
