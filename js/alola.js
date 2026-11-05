"use strict";
/* =====================================================================
   24) ALOLA: 7 líderes (capitanes y kahunas de las pruebas), Alto Mando (4) y Campeón (Profesor Kukui), con sus equipos de 6 Pokémon
   Se carga DESPUÉS de kalos.js y ANTES de campo.js (que comprueba todos los equipos al final). No toca nada de las otras regiones.

   VERSIÓN DE REFERENCIA: Pokémon Sol y Luna. Los equipos son los de la lista que dio Diego (noviembre 2026).
   Orden de la región: Ilima (Normal) · Lana (Agua) · Kiawe (Fuego) · Mallow (Planta) · Sophocles (Eléctrico) · Acerola (Fantasma) · Mina (Hada).
   Alto Mando: Hala (Lucha) · Olivia (Roca) · Acerola (Fantasma) · Kahili (Volador). Campeón: Profesor Kukui.
   Retratos: lideres/Alola/<id>.png (ilima, lana, kiawe, mallow, sophocles, acerola, mina, hala, olivia, kahili, kukui). Acerola está dos veces (líder y Alto Mando):
   el Alto Mando usa el id 'acerola_am' y el mismo retrato (LEADER_FILE en data.js). Hapu y Nanu también tienen retrato en la carpeta, pero no están en esta lista.

   CÓMO ESTÁ HECHO (igual que kalos.js, ver teams.js):
     P(nº de Pokédex, 'Naturaleza', 'Habilidad', 'objeto', {EVs}, ['golpe', 'disparo', 'mejora', 'ataque fuerte'])
   - Cada Pokémon lleva IVs 31, EVs, naturaleza, habilidad, objeto y 4 movimientos (los más parecidos que permite el motor: 4 huecos golpe / disparo / mejora / fuerte).
   - SIN SPRITE (NO_SPRITE en data.js) o SIN FORMA DE ALOLA: se sustituye por el Pokémon más parecido. Cuando haya sprite, cámbialo aquí:
        Gumshoos (735, Ilima) → Raticate (20)          Shiinotic (756, Mallow) → Vileplume (45)
        Marowak de Alola (Kiawe) → Marowak (105)       Raichu de Alola (Sophocles) → Raichu (26)   (con movimientos de Fuego-Fantasma y Eléctrico-Psíquico)
   - Alola no tiene megaevoluciones: ningún Pokémon de aquí megaevoluciona.

   DIFICULTAD: lvl = nivel del rival · dn = índice de dificultad (DIFF en data.js). Alola: líderes lvl 157-163 (dn 9-15), Alto Mando lvl 165-168 (dn 18-20) y Kukui lvl 175 (dn 23).
   RECOMPENSA: REWARD_REGION['Alola'] (teams.js): 5 Chapas Doradas + 5 Plateadas + 10 tiradas de Gachapon por cada victoria.
   MÚSICA: pistas lider_alola / alto_alola / campeon_kukui en music.js (leen musica/Alola/: Combate Lideres, Combate Alto Mando, Combate Campeon, Victoria Lideres, Victoria Campeon).
   ===================================================================== */
Object.assign(TEAMS, {
  // ---------------- LÍDERES ----------------
  ilima: [     // Normal · Isla Melemele (Ilima). Gumshoos no tiene sprite → Raticate
    P( 20, 'Alegre',  'Agallas',       'cinturon', {atk:252, spe:252, hp:4}, ['Mordisco',      'Doble Filo',   'Danza Espada',  'Hiperrayo']),    // Raticate (en vez de Gumshoos)
    P(760, 'Firme',   'Peluche',       'aguante',  {hp:252, atk:252, def:4}, ['Golpe Roca',    'Doble Filo',   'Corpulencia',   'Terremoto']),    // Bewear
    P(143, 'Firme',   'Sebo',          'restos',   {hp:252, atk:252, def:4}, ['Golpe Cuerpo',  'Doble Filo',   'Amnesia',       'Terremoto']),    // Snorlax
    P(128, 'Alegre',  'Intimidación',  'cintaelec',{atk:252, spe:252, hp:4}, ['Cabezazo',      'Doble Filo',   'Danza Espada',  'Terremoto']),    // Tauros
    P(474, 'Modesta', 'Adaptable',     'vidasfera',{spa:252, spe:252, hp:4}, ['Ataque Rápido', 'Triataque',    'Maquinación',   'Trueno']),       // Porygon-Z
    P(773, 'Firme',   'Sistema Alfa',  'chaleco',  {hp:252, atk:252, def:4}, ['Mordisco',      'Triataque',    'Danza Espada',  'Hiperrayo'])     // Silvally
  ],
  lana: [      // Agua · Isla Akala (Lana)
    P(752, 'Firme',   'Absorbe Agua',  'aguante',  {hp:252, atk:252, def:4}, ['Tijera X',      'Hidropulso',   'Refugio',       'Hidrobomba']),   // Araquanid
    P(730, 'Modesta', 'Torrente',      'gafasesp', {spa:252, hp:252, def:4}, ['Carantoña',     'Hidropulso',   'Paz Mental',    'Hidrobomba']),   // Primarina
    P(130, 'Alegre',  'Intimidación',  'vidasfera',{atk:252, spe:252, hp:4}, ['Acua Cola',     'Dragoaliento', 'Danza Dragón',  'Terremoto']),    // Gyarados
    P(131, 'Modesta', 'Absorbe Agua',  'chaleco',  {hp:252, spa:252, def:4}, ['Golpe Cuerpo',  'Rayo Hielo',   'Danza Lluvia',  'Hidrobomba']),   // Lapras
    P(350, 'Modesta', 'Escama Especial','restos',  {hp:252, spa:252, def:4}, ['Acua Cola',     'Rayo Hielo',   'Paz Mental',    'Hidrobomba']),   // Milotic
    P(746, 'Modesta', 'Banco',         'gafasesp', {spa:252, spe:252, hp:4}, ['Mordisco',      'Hidropulso',   'Danza Lluvia',  'Hidrobomba'])    // Wishiwashi
  ],
  kiawe: [     // Fuego · Isla Akala (Kiawe). Marowak de Alola no tiene sprite → Marowak con movimientos de Fuego y Fantasma
    P(105, 'Firme',   'Cuerpo Maldito','vidasfera',{atk:252, hp:252, def:4}, ['Garra Umbría',  'Lanzallamas',  'Danza Espada',  'Llamarada']),    // Marowak (de Alola)
    P(758, 'Modesta', 'Corrosión',     'gafasesp', {spa:252, spe:252, hp:4}, ['Puya Nociva',   'Lanzallamas',  'Maquinación',   'Llamarada']),    // Salazzle
    P(776, 'Modesta', 'Caparazón',     'chaleco',  {spa:252, hp:252, def:4}, ['Garra Dragón',  'Lanzallamas',  'Danza Dragón',  'Llamarada']),    // Turtonator
    P( 59, 'Alegre',  'Intimidación',  'cinturon', {atk:252, spe:252, hp:4}, ['Ataque Rápido', 'Lanzallamas',  'Danza Espada',  'Envite Ígneo']), // Arcanine
    P(637, 'Modesta', 'Cuerpo Llama',  'vidasfera',{spa:252, spe:252, hp:4}, ['Tijera X',      'Zumbido',      'Danza Aleteo',  'Llamarada']),    // Volcarona
    P(727, 'Firme',   'Intimidación',  'cintaelec',{atk:252, hp:252, def:4}, ['Mordisco',      'Pulso Umbrío', 'Danza Espada',  'Envite Ígneo'])  // Incineroar
  ],
  mallow: [    // Planta · Isla Akala (Mallow). Shiinotic no tiene sprite → Vileplume
    P(763, 'Firme',   'Defensa Hoja',  'cintaelec',{atk:252, spe:252, hp:4}, ['Látigo Cepa',   'Hoja Afilada', 'Danza Espada',  'Onda Certera']), // Tsareena
    P(754, 'Alegre',  'Contrario',     'vidasfera',{atk:252, spe:252, hp:4}, ['Tijera X',      'Hoja Afilada', 'Danza Espada',  'Rayo Solar']),   // Lurantis
    P( 45, 'Modesta', 'Efecto Espora', 'chaleco',  {hp:252, spa:252, def:4}, ['Puya Nociva',   'Hoja Afilada', 'Somnífero',     'Rayo Solar']),   // Vileplume (en vez de Shiinotic)
    P(724, 'Firme',   'Espesura',      'cinturon', {atk:252, spe:252, hp:4}, ['Garra Umbría',  'Hoja Afilada', 'Danza Espada',  'Pájaro Osado']), // Decidueye
    P(470, 'Alegre',  'Clorofila',     'cintaelec',{atk:252, spe:252, hp:4}, ['Tijera X',      'Hoja Afilada', 'Danza Espada',  'Rayo Solar']),   // Leafeon
    P(781, 'Firme',   'Metalúrgico',   'restos',   {hp:252, atk:252, def:4}, ['Látigo Cepa',   'Tinieblas',    'Danza Espada',  'Bola Sombra'])   // Dhelmise
  ],
  sophocles: [ // Eléctrico · Isla Ula-Ula (Sophocles). Raichu de Alola no tiene sprite → Raichu con movimientos Psíquicos
    P(738, 'Modesta', 'Levitación',    'gafasesp', {spa:252, spe:252, hp:4}, ['Tijera X',      'Zumbido',      'Carga',         'Trueno']),       // Vikavolt
    P(777, 'Alegre',  'Pararrayos',    'cinturon', {atk:252, spe:252, hp:4}, ['Colmillo Rayo', 'Impactrueno',  'Carga',         'Trueno']),       // Togedemaru
    P( 26, 'Modesta', 'Elec. Estática','vidasfera',{spa:252, spe:252, hp:4}, ['Cabezazo Zen',  'Rayo',         'Paz Mental',    'Psíquico']),     // Raichu (de Alola)
    P(462, 'Modesta', 'Imán',          'gafaselec',{spa:252, hp:252, def:4}, ['Puño Bala',     'Rayo',         'Carga',         'Foco Resplandor']), // Magnezone
    P(466, 'Firme',   'Electromotor',  'cintaelec',{atk:252, spe:252, hp:4}, ['Puño Trueno',   'Rayo',         'Danza Espada',  'Terremoto']),    // Electivire
    P(604, 'Firme',   'Levitación',    'vidasfera',{hp:252, atk:252, def:4}, ['Colmillo Rayo', 'Lanzallamas',  'Danza Espada',  'Trueno'])        // Eelektross
  ],
  acerola: [   // Fantasma · Isla Ula-Ula (Acerola)
    P(778, 'Alegre',  'Disfraz',       'vidasfera',{atk:252, spe:252, hp:4}, ['Carantoña',     'Tinieblas',    'Danza Espada',  'Bola Sombra']),  // Mimikyu
    P(770, 'Modesta', 'Velo Arena',    'chaleco',  {hp:252, spa:252, def:4}, ['Puño Sombra',   'Disparo Lodo', 'Tormenta de Arena','Bola Sombra']), // Palossand
    P(781, 'Firme',   'Metalúrgico',   'restos',   {hp:252, atk:252, def:4}, ['Garra Umbría',  'Tinieblas',    'Maldición',     'Bola Sombra']),  // Dhelmise
    P(478, 'Modesta', 'Manto Níveo',   'gafasesp', {spa:252, spe:252, hp:4}, ['Garra Umbría',  'Rayo Hielo',   'Maldición',     'Bola Sombra']),  // Froslass
    P( 94, 'Modesta', 'Cuerpo Maldito','vidasfera',{spa:252, spe:252, hp:4}, ['Lengüetazo',    'Bomba Lodo',   'Hipnosis',      'Bola Sombra']),  // Gengar
    P(609, 'Modesta', 'Absorbe Fuego', 'gafaselec',{spa:252, spe:252, hp:4}, ['Puño Sombra',   'Lanzallamas',  'Maquinación',   'Bola Sombra'])   // Chandelure
  ],
  mina: [      // Hada · Isla Poni (Mina)
    P(743, 'Modesta', 'Polvo Escudo',  'gafasesp', {spa:252, spe:252, hp:4}, ['Carantoña',     'Zumbido',      'Danza Aleteo',  'Fuerza Lunar']), // Ribombee
    P(730, 'Modesta', 'Torrente',      'vidasfera',{spa:252, hp:252, def:4}, ['Carantoña',     'Voz Cautivadora','Paz Mental',  'Hidrobomba']),   // Primarina
    P(778, 'Firme',   'Disfraz',       'aguante',  {atk:252, spe:252, hp:4}, ['Garra Umbría',  'Viento Feérico','Danza Espada', 'Bola Sombra']),  // Mimikyu
    P(468, 'Modesta', 'Dicha',         'chaleco',  {hp:252, spa:252, def:4}, ['Ataque Ala',    'Tajo Aéreo',   'Paz Mental',    'Onda Certera']), // Togekiss
    P(700, 'Modesta', 'Piel Feérica',  'gafasesp', {hp:252, spa:252, def:4}, ['Carantoña',     'Voz Cautivadora','Paz Mental',  'Hiperrayo']),    // Sylveon
    P(786, 'Modesta', 'Psicogénesis',  'gafaselec',{spa:252, spe:252, hp:4}, ['Cabezazo Zen',  'Psicorrayo',   'Paz Mental',    'Fuerza Lunar'])  // Tapu Lele
  ],
  // ---------------- ALTO MANDO ----------------
  hala: [      // Lucha · Hala
    P(740, 'Firme',   'Corte Fuerte',  'cinturon', {hp:252, atk:252, def:4}, ['Puño Hielo',    'Lanzarrocas',  'Corpulencia',   'Terremoto']),    // Crabominable
    P(297, 'Firme',   'Agallas',       'aguante',  {hp:252, atk:252, def:4}, ['Golpe Roca',    'Esfera Aural', 'Corpulencia',   'Onda Certera']), // Hariyama
    P(760, 'Firme',   'Peluche',       'vidasfera',{hp:252, atk:252, def:4}, ['Golpe Roca',    'Esfera Aural', 'Corpulencia',   'Terremoto']),    // Bewear
    P( 57, 'Alegre',  'Irascible',     'cintaelec',{atk:252, spe:252, hp:4}, ['Golpe Roca',    'Esfera Aural', 'Danza Espada',  'Onda Certera']), // Primeape
    P( 62, 'Firme',   'Absorbe Agua',  'restos',   {hp:252, atk:252, def:4}, ['Golpe Roca',    'Hidropulso',   'Corpulencia',   'Hidrobomba']),   // Poliwrath
    P(784, 'Firme',   'Insonorizar',   'vidasfera',{atk:252, spe:252, hp:4}, ['Garra Dragón',  'Esfera Aural', 'Danza Dragón',  'Onda Certera'])  // Kommo-o
  ],
  olivia: [    // Roca · Olivia
    P(745, 'Alegre',  'Vista Lince',   'cintaelec',{atk:252, spe:252, hp:4}, ['Mordisco',      'Lanzarrocas',  'Danza Espada',  'Roca Afilada']), // Lycanroc
    P( 76, 'Firme',   'Cabeza Roca',   'casco',    {hp:252, atk:252, def:4}, ['Tumba Rocas',   'Lanzarrocas',  'Pulimento',     'Terremoto']),    // Golem
    P(476, 'Modesta', 'Robustez',      'chaleco',  {hp:252, spa:252, def:4}, ['Tumba Rocas',   'Bomba Imán',   'Onda Trueno',   'Foco Resplandor']), // Probopass
    P(526, 'Firme',   'Chorro Arena',  'restos',   {hp:252, atk:252, def:4}, ['Tumba Rocas',   'Lanzarrocas',  'Tormenta de Arena','Roca Afilada']), // Gigalith
    P(248, 'Firme',   'Chorro Arena',  'vidasfera',{atk:252, spe:252, hp:4}, ['Mordisco',      'Lanzarrocas',  'Danza Dragón',  'Terremoto']),    // Tyranitar
    P(567, 'Alegre',  'Derrotista',    'cinturon', {atk:252, spe:252, hp:4}, ['Ataque Ala',    'Lanzarrocas',  'Danza Espada',  'Roca Afilada'])  // Archeops
  ],
  acerola_am: [ // Fantasma · Acerola en el Alto Mando (id propio para no chocar con la líder; mismo retrato)
    P(770, 'Modesta', 'Velo Arena',    'chaleco',  {hp:252, spa:252, def:4}, ['Puño Sombra',   'Disparo Lodo', 'Tormenta de Arena','Bola Sombra']), // Palossand
    P(781, 'Firme',   'Metalúrgico',   'restos',   {hp:252, atk:252, def:4}, ['Garra Umbría',  'Tinieblas',    'Maldición',     'Bola Sombra']),  // Dhelmise
    P(478, 'Modesta', 'Manto Níveo',   'gafasesp', {spa:252, spe:252, hp:4}, ['Garra Umbría',  'Rayo Hielo',   'Maldición',     'Bola Sombra']),  // Froslass
    P(778, 'Alegre',  'Disfraz',       'vidasfera',{atk:252, spe:252, hp:4}, ['Carantoña',     'Tinieblas',    'Danza Espada',  'Bola Sombra']),  // Mimikyu
    P(426, 'Modesta', 'Liviano',       'gafasesp', {hp:252, spa:252, def:4}, ['Puño Sombra',   'Tinieblas',    'Paz Mental',    'Vendaval']),     // Drifblim
    P( 94, 'Modesta', 'Cuerpo Maldito','vidasfera',{spa:252, spe:252, hp:4}, ['Lengüetazo',    'Bomba Lodo',   'Hipnosis',      'Bola Sombra'])   // Gengar
  ],
  kahili: [    // Volador · Kahili
    P(733, 'Alegre',  'Vista Lince',   'cintaelec',{atk:252, spe:252, hp:4}, ['Ataque Ala',    'Lanzarrocas',  'Danza Espada',  'Pájaro Osado']), // Toucannon
    P(741, 'Modesta', 'Pasarela',      'gafasesp', {spa:252, spe:252, hp:4}, ['Ataque Ala',    'Lanzallamas',  'Danza Aleteo',  'Vendaval']),     // Oricorio
    P(630, 'Osada',   'Armadura Frágil','restos',  {hp:252, def:252, spa:4}, ['Mordisco',      'Pulso Umbrío', 'Viento Afín',   'Pulso Noche']),  // Mandibuzz
    P(169, 'Alegre',  'Infiltrador',   'vidasfera',{atk:252, spe:252, hp:4}, ['Puya Nociva',   'Tajo Aéreo',   'Danza Espada',  'Pájaro Osado']), // Crobat
    P(227, 'Osada',   'Robustez',      'casco',    {hp:252, def:252, spa:4}, ['Garra Metal',   'Tajo Aéreo',   'Defensa Férrea','Pájaro Osado']), // Skarmory
    P(663, 'Alegre',  'Cuerpo Llama',  'cinturon', {atk:252, spe:252, hp:4}, ['Ataque Ala',    'Lanzallamas',  'Danza Espada',  'Envite Ígneo'])  // Talonflame
  ],
  // ---------------- CAMPEÓN ----------------
  kukui: [     // Profesor Kukui, Campeón de Alola (tipos variados)
    P(745, 'Alegre',  'Vista Lince',   'cintaelec',{atk:252, spe:252, hp:4}, ['Ataque Rápido', 'Lanzarrocas',  'Danza Espada',  'Roca Afilada']), // Lycanroc
    P(628, 'Alegre',  'Vista Lince',   'cinturon', {atk:252, spe:252, hp:4}, ['Ataque Ala',    'Tajo Aéreo',   'Danza Espada',  'Pájaro Osado']), // Braviary
    P(462, 'Modesta', 'Imán',          'gafaselec',{spa:252, hp:252, def:4}, ['Puño Bala',     'Bomba Imán',   'Carga',         'Trueno']),       // Magnezone
    P(143, 'Firme',   'Sebo',          'restos',   {hp:252, atk:252, def:4}, ['Golpe Cuerpo',  'Doble Filo',   'Amnesia',       'Hiperrayo']),    // Snorlax
    P(727, 'Firme',   'Intimidación',  'vidasfera',{atk:252, hp:252, def:4}, ['Mordisco',      'Lanzallamas',  'Danza Espada',  'Envite Ígneo']), // Incineroar
    P(785, 'Modesta', 'Electrogénesis','gafasesp', {spa:252, spe:252, hp:4}, ['Colmillo Rayo', 'Rayo',         'Carga',         'Trueno'])        // Tapu Koko
  ]
});

// ---------------------------------------------------------------------
// Los 12 combates de Alola, en orden: 7 líderes, 4 del Alto Mando y el Campeón.
// id = nombre del retrato (lideres/Alola/<id>.png, ver LEADER_FILE en data.js) y de la arena (arenasalola.js, cuando se hagan los estadios)
// ---------------------------------------------------------------------
const ALOLA = 'Alola';
const AF = (id, leader, tag, kind, lvl, dn, place, extra) =>
  Object.assign({id, leader, tag, kind, lvl, diff: kind === 'lider' ? 'dificil' : 'muy_dificil', teams: TEAMS[id], region: ALOLA, idx: 0, dn, place}, extra);
FLOORS.push(
  AF('ilima',     'Ilima',     'Normal',    'lider', 157, 9,  'Isla Melemele'),
  AF('lana',      'Lana',      'Agua',      'lider', 158, 10, 'Isla Akala'),
  AF('kiawe',     'Kiawe',     'Fuego',     'lider', 159, 11, 'Isla Akala'),
  AF('mallow',    'Mallow',    'Planta',    'lider', 160, 12, 'Isla Akala'),
  AF('sophocles', 'Sophocles', 'Eléctrico', 'lider', 161, 13, 'Isla Ula-Ula'),
  AF('acerola',   'Acerola',   'Fantasma',  'lider', 162, 14, 'Isla Ula-Ula'),
  AF('mina',      'Mina',      'Hada',      'lider', 163, 15, 'Isla Poni'),
  // Alto Mando (MUY DIFÍCIL) y Campeón
  AF('hala',       'Hala',      'Lucha',    'alto',  165, 18, 'Liga Pokémon'),
  AF('olivia',     'Olivia',    'Roca',     'alto',  166, 19, 'Liga Pokémon'),
  AF('acerola_am', 'Acerola',   'Fantasma', 'alto',  167, 19, 'Liga Pokémon'),
  AF('kahili',     'Kahili',    'Volador',  'alto',  168, 20, 'Liga Pokémon'),
  AF('kukui',      'Kukui',     'Campeón',  'campeon', 170, 22, 'Liga Pokémon')        // (antes 175 · 23: era el más difícil del juego; ahora igual que Dianta)
);
floorsOf(ALOLA).forEach((F, i) => F.idx = i);                           // posición dentro de Alola (0 = Ilima)
