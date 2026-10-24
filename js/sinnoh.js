"use strict";
/* =====================================================================
   21) SINNOH: 8 líderes de gimnasio, Alto Mando (4) y Campeona (Cintia), con sus equipos de 6 Pokémon
   Se carga DESPUÉS de hoenn.js y ANTES de campo.js (que comprueba todos los equipos al final). No toca nada de Kanto, Johto ni Hoenn.

   VERSIÓN DE REFERENCIA: Pokémon PLATINO (orden de líderes: Roco, Gardenia, Fantina, Brega, Mananti, Acerón, Inverna, Lectro). Nombres en español de
   Diamante/Perla/Platino. Fuentes: Bulbapedia (combates de la Zona de Batalla de Platino y Alto Mando), Serebii (Alto Mando de Platino) y WikiDex.
   Retratos: lideres/Sinnoh/<Nombre>.png.

   CÓMO ESTÁ HECHO (igual que Kanto, Johto y Hoenn, ver teams.js):
     P(nº de Pokédex, 'Naturaleza', 'Habilidad', 'objeto', {EVs}, ['golpe', 'disparo', 'mejora', 'ataque fuerte'])
   - LÍDERES: equipo de REVANCHA de Platino (Zona de Batalla, 5 Pokémon). El motor pide 6, así que se añade 1 Pokémon que ese líder usa en
     Diamante/Perla/Platino (Roco: Rhyperior · Gardenia: Leafeon · Fantina: Rotom · Brega: Toxicroak · Mananti: Gastrodon · Acerón: Bronzong ·
     Inverna: Medicham · Lectro: Ambipom). El último del equipo es siempre el As.
       OJO: la lista de Lectro es la menos segura: Jolteon y Raichu (nv. 61) están confirmados y Lanturn aparece en sus revanchas; Luxray y Electivire
       (su As) son los de su equipo normal de Platino. Si ves que no coincide con tu juego, cámbialos en TEAMS.lectro.
   - ALTO MANDO Y CAMPEONA: los 5 (Cintia 6) Pokémon oficiales de Platino tras la Pokédex Nacional, en su orden. El Alto Mando lleva 5, así que se
     añade 1 Pokémon más de su equipo de Diamante/Perla (Beautifly de Alecrán, Quagsire de Gaia, Lopunny de Fausto, Girafarig de Delos).
   - Especies repetidas entre equipos son normales (p. ej. Medicham de Brega e Inverna); dentro de un mismo equipo no se repite ninguna.
   - Los movimientos son los más parecidos que permite el motor (4 huecos: golpe / disparo / mejora / ataque fuerte, ver MOVESET en moves.js).

   DIFICULTAD (cambia estos números para equilibrar): lvl = nivel del rival · dn = índice de dificultad (DIFF en data.js).
     Kanto: dn 0-12 · Johto: dn 2-14 · Hoenn: dn 4-16 · Sinnoh: empieza en dn 6 (Roco ≈ Candela de Hoenn) y acaba en dn 18 (Cintia, la más dura de las cuatro Ligas).
   RECOMPENSA: REWARD_REGION.Sinnoh (teams.js): 5 Chapas Doradas + 5 Plateadas + 10 tiradas de Gachapon por cada victoria (como Johto y Hoenn).
   ===================================================================== */
Object.assign(TEAMS, {
  // ---------------- LÍDERES DE GIMNASIO (revancha de Platino) ----------------
  roco: [     // Roca · Ciudad Pirita (Roark). Revancha: Aerodactyl, Probopass, Rampardos, Golem, Tyranitar + Rhyperior (extra)
    P(142, 'Alegre',  'Presión',        'panuelo',   {atk:252, spe:252, hp:4}, ['Ataque Ala',   'Lanzarrocas', 'Agilidad',       'Roca Afilada']),  // Aerodactyl
    P(476, 'Osada',   'Robustez',       'restos',    {hp:252, def:252, spd:4}, ['Tumba Rocas',  'Bomba Imán',  'Defensa Férrea', 'Foco Resplandor']), // Probopass
    P(409, 'Firme',   'Potencia Bruta', 'vidasfera', {atk:252, spe:252, hp:4}, ['Cabezazo Zen', 'Lanzarrocas', 'Pulimento',      'Roca Afilada']),  // Rampardos (su Cranidos de siempre)
    P( 76, 'Firme',   'Robustez',       'casco',     {hp:252, atk:252, def:4}, ['Excavar',      'Lanzarrocas', 'Pulimento',      'Roca Afilada']),  // Golem
    P(464, 'Firme',   'Cabeza Roca',    'chaleco',   {hp:252, atk:252, def:4}, ['Tumba Rocas',  'Disparo Lodo','Corpulencia',    'Terremoto']),     // Rhyperior (extra)
    P(248, 'Alegre',  'Chorro Arena',   'aguante',   {atk:252, spe:252, hp:4}, ['Mordisco',     'Lanzarrocas', 'Danza Dragón',   'Roca Afilada'])   // Tyranitar: As
  ],
  gardenia: [ // Planta · Ciudad Vetusta (Gardenia). Revancha: Jumpluff, Cherrim, Bellossom, Torterra, Roserade + Leafeon (extra)
    P(189, 'Alegre',  'Clorofila',      'cinturon',  {atk:252, spe:252, hp:4}, ['Látigo Cepa',  'Tajo Aéreo',  'Desarrollo',     'Rayo Solar']),    // Jumpluff
    P(421, 'Modesta', 'Don Floral',      'gafasol',   {spa:252, spe:252, hp:4}, ['Látigo Cepa',  'Hoja Afilada','Día Soleado',    'Rayo Solar']),    // Cherrim (su Cherubi)
    P(182, 'Modesta', 'Clorofila',      'restos',    {hp:252, spa:252, def:4}, ['Látigo Cepa',  'Hoja Afilada','Danza Aleteo',   'Rayo Solar']),    // Bellossom
    P(470, 'Alegre',  'Clorofila',      'cintaelec', {atk:252, spe:252, hp:4}, ['Látigo Cepa',  'Hoja Afilada','Danza Espada',   'Rayo Solar']),    // Leafeon (extra)
    P(389, 'Firme',   'Espesura',       'aguante',   {hp:252, atk:252, def:4}, ['Látigo Cepa',  'Disparo Lodo','Desarrollo',     'Terremoto']),     // Torterra (su Turtwig)
    P(407, 'Miedosa', 'Técnico',        'flecha',    {spa:252, spe:252, hp:4}, ['Puya Nociva',  'Hoja Afilada','Desarrollo',     'Rayo Solar'])     // Roserade: As
  ],
  fantina: [  // Fantasma · Ciudad Corazón (Fantina). Revancha: Banette, Mismagius, Drifblim, Dusknoir, Gengar + Rotom (extra)
    P(354, 'Firme',   'Insomnio',       'cinturon',  {atk:252, spe:252, hp:4}, ['Garra Umbría', 'Pulso Umbrío','Maldición',      'Bola Sombra']),   // Banette
    P(429, 'Miedosa', 'Levitación',     'gafasesp',  {spa:252, spe:252, hp:4}, ['Lengüetazo',   'Tinieblas',   'Maquinación',    'Bola Sombra']),   // Mismagius (su Misdreavus)
    P(426, 'Modesta', 'Liviano',        'restos',    {hp:252, spa:252, def:4}, ['Lengüetazo',   'Tornado',     'Maldición',      'Bola Sombra']),   // Drifblim
    P(477, 'Firme',   'Presión',        'chaleco',   {hp:252, atk:252, def:4}, ['Garra Umbría', 'Pulso Umbrío','Maldición',      'Bola Sombra']),   // Dusknoir (su Duskull)
    P(479, 'Modesta', 'Levitación',     'gafaselec', {spa:252, spe:252, hp:4}, ['Lengüetazo',   'Rayo',        'Carga',          'Bola Sombra']),   // Rotom (extra)
    P( 94, 'Miedosa', 'Levitación',     'vidasfera', {spa:252, spe:252, hp:4}, ['Lengüetazo',   'Bomba Lodo',  'Maldición',      'Bola Sombra'])    // Gengar (su Haunter): As
  ],
  brega: [    // Lucha · Ciudad Rocavelo (Maylene). Revancha: Hitmontop, Breloom, Medicham, Machamp, Lucario + Toxicroak (extra)
    P(237, 'Firme',   'Intimidación',   'casco',     {atk:252, hp:252, spe:4}, ['Ataque Rápido','Esfera Aural','Corpulencia',    'Onda Certera']),  // Hitmontop
    P(286, 'Alegre',  'Técnico',        'cintaelec', {atk:252, spe:252, hp:4}, ['Golpe Roca',   'Hoja Afilada','Corpulencia',    'Onda Certera']),  // Breloom
    P(308, 'Alegre',  'Energía Pura',   'cinturon',  {atk:252, spe:252, hp:4}, ['Golpe Roca',   'Esfera Aural','Paz Mental',     'Onda Certera']),  // Medicham (su Meditite)
    P(454, 'Alegre',  'Piel Seca',      'periscopio',{atk:252, spe:252, hp:4}, ['Puya Nociva',  'Bomba Lodo',  'Corpulencia',    'Onda Certera']),  // Toxicroak (extra)
    P( 68, 'Firme',   'Sin Guarda',     'chaleco',   {hp:252, atk:252, def:4}, ['Golpe Roca',   'Lanzarrocas', 'Corpulencia',    'Onda Certera']),  // Machamp (su Machoke)
    P(448, 'Alegre',  'Justiciero',     'vidasfera', {atk:252, spe:252, hp:4}, ['Garra Metal',  'Esfera Aural','Danza Espada',   'Onda Certera'])   // Lucario: As
  ],
  mananti: [  // Agua · Ciudad Pradera (Crasher Wake). Revancha: Sharpedo, Quagsire, Floatzel, Gyarados, Ludicolo + Gastrodon (extra)
    P(319, 'Alegre',  'Piel Tosca',     'periscopio',{atk:252, spe:252, hp:4}, ['Acua Cola',    'Pulso Umbrío','Danza Lluvia',   'Hidrobomba']),   // Sharpedo
    P(195, 'Osada',   'Humedad',        'restos',    {hp:252, def:252, spd:4}, ['Excavar',      'Hidropulso',  'Amnesia',        'Terremoto']),     // Quagsire
    P(423, 'Modesta', 'Viscosidad',     'chaleco',   {hp:252, spa:252, def:4}, ['Acua Cola',    'Disparo Lodo','Danza Lluvia',   'Hidrobomba']),    // Gastrodon (extra)
    P(419, 'Alegre',  'Nado Rápido',    'cintaelec', {atk:252, spe:252, hp:4}, ['Acua Cola',    'Esfera Aural','Agilidad',       'Hidrobomba']),    // Floatzel (su Buizel)
    P(130, 'Alegre',  'Intimidación',   'aguante',   {atk:252, spe:252, hp:4}, ['Acua Cola',    'Dragoaliento','Danza Dragón',   'Terremoto']),     // Gyarados (su Magikarp)
    P(272, 'Modesta', 'Nado Rápido',    'vidasfera', {spa:252, spe:252, hp:4}, ['Acua Cola',    'Hoja Afilada','Danza Lluvia',   'Hidrobomba'])     // Ludicolo: As
  ],
  aceron: [   // Acero · Ciudad Canal (Byron). Revancha: Skarmory, Magnezone, Steelix, Bastiodon, Aggron + Bronzong (extra)
    P(227, 'Osada',   'Robustez',       'casco',     {hp:252, def:252, spd:4}, ['Ataque Ala',   'Bomba Imán',  'Defensa Férrea', 'Pájaro Osado']),  // Skarmory
    P(462, 'Modesta', 'Imán',           'gafaselec', {hp:252, spa:252, def:4}, ['Garra Metal',  'Bomba Imán',  'Carga',          'Trueno']),        // Magnezone (su Magneton)
    P(437, 'Osada',   'Levitación',     'restos',    {hp:252, def:252, spd:4}, ['Garra Metal',  'Psicorrayo',  'Defensa Férrea', 'Terremoto']),     // Bronzong (extra; su Bronzor)
    P(208, 'Firme',   'Cabeza Roca',    'aguante',   {hp:252, atk:252, def:4}, ['Garra Metal',  'Disparo Lodo','Defensa Férrea', 'Terremoto']),     // Steelix
    P(411, 'Osada',   'Robustez',       'chaleco',   {hp:252, def:252, atk:4}, ['Tumba Rocas',  'Bomba Imán',  'Defensa Férrea', 'Foco Resplandor']), // Bastiodon (su Bastiodon de Platino)
    P(306, 'Firme',   'Cabeza Roca',    'vidasfera', {hp:252, atk:252, def:4}, ['Garra Metal',  'Lanzarrocas', 'Defensa Férrea', 'Roca Afilada'])   // Aggron: As
  ],
  inverna: [  // Hielo · Ciudad Puntaneva (Candice). Revancha: Weavile, Mamoswine, Abomasnow, Froslass, Glaceon + Medicham (extra)
    P(308, 'Alegre',  'Energía Pura',   'cinturon',  {atk:252, spe:252, hp:4}, ['Golpe Roca',   'Psicorrayo',  'Paz Mental',     'Psíquico']),      // Medicham (extra; su Medicham de Diamante/Perla)
    P(461, 'Alegre',  'Presión',        'cintaelec', {atk:252, spe:252, hp:4}, ['Colmillo Hielo','Pulso Umbrío','Danza Espada',  'Pulso Noche']),   // Weavile (su Sneasel)
    P(473, 'Firme',   'Despiste',       'cinturon',  {hp:252, atk:252, spe:4}, ['Colmillo Hielo','Disparo Lodo','Neblina',       'Terremoto']),     // Mamoswine
    P(460, 'Modesta', 'Nevada',         'gafasesp',  {hp:252, spa:252, def:4}, ['Látigo Cepa',  'Rayo Hielo',  'Neblina',        'Ventisca']),      // Abomasnow (su Snover)
    P(478, 'Miedosa', 'Manto Níveo',    'gafaselec', {spa:252, spe:252, hp:4}, ['Lengüetazo',   'Nieve Polvo', 'Maldición',      'Ventisca']),      // Froslass
    P(471, 'Modesta', 'Manto Níveo',    'vidasfera', {hp:252, spa:252, def:4}, ['Colmillo Hielo','Rayo Hielo', 'Neblina',        'Ventisca'])       // Glaceon: As
  ],
  lectro: [   // Eléctrico · Ciudad Marina (Volkner). Revancha: Jolteon, Raichu, Lanturn, Luxray, Electivire + Ambipom (extra)
    P(424, 'Alegre',  'Técnico',        'cintaelec', {atk:252, spe:252, hp:4}, ['Ataque Rápido','Doble Filo',  'Agilidad',       'Hiperrayo']),     // Ambipom (extra; su Ambipom de Diamante/Perla)
    P(135, 'Miedosa', 'Absorbe Elec.',  'panuelo',   {spa:252, spe:252, hp:4}, ['Colmillo Rayo','Rayo',        'Carga',          'Trueno']),        // Jolteon
    P( 26, 'Miedosa', 'Elec. Estática', 'cascabel',  {spa:252, spe:252, hp:4}, ['Ataque Rápido','Rayo',        'Agilidad',       'Trueno']),        // Raichu
    P(171, 'Modesta', 'Absorbe Elec.',  'restos',    {hp:252, spa:252, def:4}, ['Colmillo Rayo','Hidropulso',  'Danza Lluvia',   'Trueno']),        // Lanturn
    P(405, 'Firme',   'Intimidación',   'cinturon',  {atk:252, spe:252, hp:4}, ['Colmillo Rayo','Pulso Umbrío','Carga',          'Trueno']),        // Luxray (su Luxray)
    P(466, 'Firme',   'Electromotor',   'vidasfera', {atk:252, spe:252, hp:4}, ['Colmillo Rayo','Rayo',        'Danza Espada',   'Onda Certera'])   // Electivire: As
  ],

  // ---------------- ALTO MANDO Y CAMPEONA DE SINNOH (Platino) ----------------
  alecran: [  // Bicho (Aaron). Platino: Yanmega, Scizor, Vespiquen, Heracross, Drapion + Beautifly (de Diamante/Perla)
    P(267, 'Modesta', 'Enjambre',       'gafasesp',  {spa:252, spe:252, hp:4}, ['Tijera X',     'Zumbido',     'Danza Aleteo',   'Megacuerno']),    // Beautifly (extra)
    P(469, 'Modesta', 'Cromolente',     'panuelo',   {spa:252, spe:252, hp:4}, ['Ataque Ala',   'Zumbido',     'Danza Aleteo',   'Megacuerno']),    // Yanmega
    P(212, 'Firme',   'Técnico',        'cintaelec', {atk:252, hp:252, spe:4}, ['Tijera X',     'Bomba Imán',  'Danza Espada',   'Megacuerno']),    // Scizor
    P(416, 'Osada',   'Presión',        'restos',    {hp:252, def:252, spa:4}, ['Tijera X',     'Pin Misil',   'Danza Aleteo',   'Megacuerno']),    // Vespiquen
    P(214, 'Firme',   'Agallas',        'vidasfera', {atk:252, spe:252, hp:4}, ['Tijera X',     'Esfera Aural','Corpulencia',    'Megacuerno']),    // Heracross
    P(452, 'Firme',   'Armadura Batalla','periscopio',{atk:252, spe:252, hp:4}, ['Mordisco',     'Bomba Lodo',  'Danza Espada',   'Pulso Noche'])    // Drapion: As
  ],
  gaia: [     // Tierra (Bertha). Platino: Whiscash, Gliscor, Golem, Rhyperior, Hippowdon + Quagsire (de Diamante/Perla). As: Rhyperior (el de más nivel)
    P(195, 'Osada',   'Absorbe Agua',   'restos',    {hp:252, def:252, spd:4}, ['Excavar',      'Hidropulso',  'Amnesia',        'Terremoto']),     // Quagsire (extra)
    P(340, 'Firme',   'Despiste',       'chaleco',   {hp:252, atk:252, def:4}, ['Excavar',      'Hidropulso',  'Danza Lluvia',   'Terremoto']),     // Whiscash
    P(472, 'Alegre',  'Corte Fuerte',   'cinturon',  {atk:252, spe:252, hp:4}, ['Ataque Ala',   'Disparo Lodo','Danza Espada',   'Terremoto']),     // Gliscor
    P( 76, 'Firme',   'Robustez',       'aguante',   {hp:252, atk:252, def:4}, ['Excavar',      'Lanzarrocas', 'Pulimento',      'Terremoto']),     // Golem
    P(450, 'Osada',   'Chorro Arena',   'casco',     {hp:252, def:252, atk:4}, ['Mordisco',     'Disparo Lodo','Tormenta de Arena','Terremoto']),  // Hippowdon
    P(464, 'Firme',   'Cabeza Roca',    'vidasfera', {atk:252, hp:252, def:4}, ['Excavar',      'Lanzarrocas', 'Pulimento',      'Terremoto'])      // Rhyperior: As
  ],
  fausto: [   // Fuego (Flint). Platino: Houndoom, Flareon, Rapidash, Infernape, Magmortar + Lopunny (de Diamante/Perla)
    P(428, 'Alegre',  'Flexibilidad',   'cintaelec', {atk:252, spe:252, hp:4}, ['Ataque Rápido','Esfera Aural','Agilidad',       'Onda Certera']),  // Lopunny (extra)
    P(229, 'Miedosa', 'Absorbe Fuego',  'gafasol',   {spa:252, spe:252, hp:4}, ['Mordisco',     'Lanzallamas', 'Día Soleado',    'Pulso Noche']),   // Houndoom
    P(136, 'Alegre',  'Absorbe Fuego',  'chaleco',   {hp:252, atk:252, def:4}, ['Colmillo Ígneo','Lanzallamas','Danza Espada',   'Envite Ígneo']),  // Flareon
    P( 78, 'Alegre',  'Absorbe Fuego',  'panuelo',   {atk:252, spe:252, hp:4}, ['Colmillo Ígneo','Lanzallamas','Agilidad',       'Envite Ígneo']),  // Rapidash
    P(392, 'Alegre',  'Mar Llamas',     'cinturon',  {atk:252, spe:252, hp:4}, ['Golpe Roca',   'Lanzallamas', 'Danza Espada',   'Envite Ígneo']),  // Infernape
    P(467, 'Modesta', 'Cuerpo Llama',   'gafasesp',  {hp:252, spa:252, def:4}, ['Colmillo Ígneo','Rayo',       'Día Soleado',    'Llamarada'])      // Magmortar: As
  ],
  delos: [    // Psíquico (Lucian). Platino: Mr. Mime, Espeon, Bronzong, Alakazam, Gallade + Girafarig (de Diamante/Perla)
    P(122, 'Modesta', 'Filtro',         'restos',    {hp:252, spa:252, def:4}, ['Cabezazo Zen', 'Voz Cautivadora','Paz Mental',  'Psíquico']),      // Mr. Mime
    P(203, 'Modesta', 'Madrugar',       'gafasesp',  {spa:252, spe:252, hp:4}, ['Cabezazo',     'Psicorrayo',  'Paz Mental',     'Psíquico']),      // Girafarig (extra)
    P(196, 'Miedosa', 'Sincronía',      'gafaselec', {spa:252, spe:252, hp:4}, ['Cabezazo Zen', 'Psicorrayo',  'Paz Mental',     'Psíquico']),      // Espeon
    P(437, 'Osada',   'Levitación',     'chaleco',   {hp:252, def:252, spd:4}, ['Cabezazo Zen', 'Bomba Imán',  'Paz Mental',     'Psíquico']),      // Bronzong
    P( 65, 'Miedosa', 'Foco Interno',   'panuelo',   {spa:252, spe:252, hp:4}, ['Cabezazo Zen', 'Esfera Aural','Paz Mental',     'Psíquico']),      // Alakazam
    P(475, 'Firme',   'Justiciero',     'vidasfera', {atk:252, spe:252, hp:4}, ['Cabezazo Zen', 'Esfera Aural','Danza Espada',   'Onda Certera'])   // Gallade: As
  ],
  cintia: [   // Campeona de Sinnoh (Cynthia, Platino): Spiritomb, Roserade, Togekiss, Lucario, Milotic, Garchomp
    P(442, 'Osada',   'Presión',        'restos',    {hp:252, def:252, spd:4}, ['Garra Umbría', 'Pulso Umbrío','Maldición',      'Bola Sombra']),   // Spiritomb
    P(407, 'Miedosa', 'Técnico',        'gafasesp',  {spa:252, spe:252, hp:4}, ['Puya Nociva',  'Bomba Lodo',  'Desarrollo',     'Rayo Solar']),    // Roserade
    P(468, 'Modesta', 'Dicha',          'gafaselec', {hp:252, spa:252, def:4}, ['Ataque Ala',   'Tajo Aéreo',  'Viento Afín',    'Fuerza Lunar']),  // Togekiss
    P(448, 'Alegre',  'Foco Interno',   'cinturon',  {atk:252, spe:252, hp:4}, ['Garra Metal',  'Esfera Aural','Danza Espada',   'Foco Resplandor']), // Lucario
    P(350, 'Modesta', 'Escama Especial','chaleco',   {hp:252, spa:252, def:4}, ['Acua Cola',    'Hidropulso',  'Paz Mental',     'Hidrobomba']),    // Milotic
    P(445, 'Alegre',  'Piel Tosca',     'vidasfera', {atk:252, spe:252, hp:4}, ['Garra Dragón', 'Dragoaliento','Danza Dragón',   'Terremoto'])      // Garchomp: As
  ]
});

// ---------------------------------------------------------------------
// Los 13 combates de Sinnoh, en orden: 8 líderes, 4 del Alto Mando y la Campeona.
// id = nombre del retrato (lideres/Sinnoh/<Nombre>.png, ver LEADER_FILE en data.js) y de la arena (arenassinnoh.js)
// ---------------------------------------------------------------------
const SF = (id, leader, tag, kind, lvl, dn, place) =>
  ({id, leader, tag, kind, lvl, diff: kind === 'lider' ? 'dificil' : 'muy_dificil', teams: TEAMS[id], region: 'Sinnoh', idx: 0, dn, place});
FLOORS.push(
  SF('roco',     'Roco',     'Roca',      'lider', 135, 6,  'Ciudad Pirita'),
  SF('gardenia', 'Gardenia', 'Planta',    'lider', 136, 7,  'Ciudad Vetusta'),
  SF('fantina',  'Fantina',  'Fantasma',  'lider', 137, 8,  'Ciudad Corazón'),
  SF('brega',    'Brega',    'Lucha',     'lider', 138, 9,  'Ciudad Rocavelo'),
  SF('mananti',  'Mananti',  'Agua',      'lider', 139, 10, 'Ciudad Pradera'),
  SF('aceron',   'Acerón',   'Acero',     'lider', 140, 11, 'Ciudad Canal'),
  SF('inverna',  'Inverna',  'Hielo',     'lider', 141, 12, 'Ciudad Puntaneva'),
  SF('lectro',   'Lectro',   'Eléctrico', 'lider', 142, 13, 'Ciudad Marina'),
  // Alto Mando (MUY DIFÍCIL) y Campeona
  SF('alecran',  'Alecrán',  'Bicho',     'alto',  143, 13, 'Liga Pokémon'),
  SF('gaia',     'Gaia',     'Tierra',    'alto',  144, 14, 'Liga Pokémon'),
  SF('fausto',   'Fausto',   'Fuego',     'alto',  145, 15, 'Liga Pokémon'),
  SF('delos',    'Delos',    'Psíquico',  'alto',  146, 16, 'Liga Pokémon'),
  SF('cintia',   'Cintia',   'Campeona',  'campeon', 153, 18, 'Liga Pokémon')
);
floorsOf('Sinnoh').forEach((F, i) => F.idx = i);                          // posición dentro de Sinnoh (0 = Roco)

// Descripción de las habilidades nuevas
Object.assign(ABIL_DESC, {
  'Don Floral':'Con sol, sube sus estadísticas y las de sus aliados.', 'Sin Guarda':'Sus ataques y los del rival nunca fallan.', 'Humedad':'Impide las explosiones a su alrededor.',
  'Viscosidad':'No se le puede quitar el objeto.', 'Flexibilidad':'No puede quedarse paralizado.', 'Madrugar':'Se despierta antes de un sueño.',
  'Dicha':'Hace más probables los efectos secundarios de sus ataques.'
});
