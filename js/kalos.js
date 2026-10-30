"use strict";
/* =====================================================================
   23) KALOS: 8 líderes de gimnasio, Alto Mando (4) y Campeona (Dianta), con sus equipos de 6 Pokémon
   Se carga DESPUÉS de teselia.js y ANTES de campo.js (que comprueba todos los equipos al final). No toca nada de las otras regiones.

   VERSIÓN DE REFERENCIA: Pokémon X e Y. Gimnasios en orden: Novarte (Violeta), Relieve (Lino), Yantra (Corelia), Tiriópolis (Amaro), Luminalia (Lem),
   Romantis (Valeria), Anistar (Ástrid) y Fractal (Édel). Alto Mando: Malva, Narciso, Tileo y Ágata. Campeona: Dianta.
   Los nombres son los españoles de WikiDex. Los ids con los que se llaman los retratos son los de la carpeta lideres/kalos/ (LEADER_FILE en data.js):
   Violeta=viola · Lino=grant · Corelia=korrina · Amaro=ramos · Lem=clemont · Valeria=valerie · Ástrid=olympia · Édel=wulfric ·
   Malva=malva · Narciso=siebold · Tileo=wikstrom · Ágata=(sin retrato propio: usa drasna hasta que haya agata.png) · Dianta=diantha.
   Fuentes: WikiDex («Liga Pokémon (Kalos)»: equipos oficiales de la Liga con niveles) y Bulbapedia / Serebii (equipos de los líderes de X e Y y del Torneo).

   CÓMO ESTÁ HECHO (igual que las otras regiones, ver teams.js y teselia.js):
     P(nº de Pokédex, 'Naturaleza', 'Habilidad', 'objeto', {EVs}, ['golpe', 'disparo', 'mejora', 'ataque fuerte'])
   - EQUIPOS: los 6 Pokémon de cada entrenador son los que dio Diego (octubre 2026). Cada uno lleva IVs 31, EVs, naturaleza, habilidad, objeto y 4 movimientos.
     Nombres: en la lista de Diego, Lem se llama «Électra», Valeria «Ástrid» y Ástrid «Áureo»; aquí se mantienen los nombres del juego (WikiDex).
     El cuarto del Alto Mando es Ágata (acero) y sustituye a Drácena; Tileo lleva el equipo fantasma.
   - SIN SPRITE: Pyroar (668) está en NO_SPRITE (data.js); Malva lleva a Houndoom en su lugar (sin mega). Cuando Pyroar tenga sprite, cámbialo aquí.
   - MEGAEVOLUCIÓN: todo Pokémon que tiene mega disponible en el juego (tabla MEGA de js/mega.js) la lleva: se escribe con PM('clave', nº, ...) y su objeto es su
     Megapiedra (mega_<clave>). Megaevoluciona solo, a los MEGA_FOE_DELAY segundos de salir al campo, y solo UNO por combate (el primero que lo cumpla).
     Hoy: Lino (Tyranitar, Aerodactyl) · Corelia (Lucario, Gallade) · Lem (Manectric) · Valeria (Mawile, Gardevoir) · Édel (Glalie) · Tileo (Gengar) · Dianta (Gardevoir).
   - Los movimientos son los más parecidos que permite el motor (4 huecos: golpe / disparo / mejora / ataque fuerte, ver MOVESET en moves.js).

   DIFICULTAD: lvl = nivel del rival · dn = índice de dificultad (DIFF en data.js). Kalos: dn 8-15 los líderes, 17-19 el Alto Mando y 22 Dianta (la más dura).
   RECOMPENSA: REWARD_REGION['Kalos'] (teams.js): 5 Chapas Doradas + 5 Plateadas + 10 tiradas de Gachapon por cada victoria.
   ===================================================================== */
// El campo `mega` lo ignora de momento todo el código: se añade a la plantilla con Object.assign para no cambiar P()
const PM = (mega, ...a) => Object.assign(P(...a), {mega});
Object.assign(TEAMS, {
  // ---------------- LÍDERES ----------------
  violeta: [   // Bicho · Ciudad Novarte (Viola). Sin megaevoluciones disponibles (Heracross y Pinsir no tienen mega en el juego)
    P(666, 'Modesta', 'Ojo Compuesto', 'gafasesp', {spa:252, spe:252, hp:4}, ['Ataque Ala',    'Zumbido',      'Danza Aleteo',  'Psíquico']),     // Vivillon
    P(596, 'Modesta', 'Ojo Compuesto', 'gafasesp', {spa:252, spe:252, hp:4}, ['Tijera X',      'Zumbido',      'Carga',         'Trueno']),       // Galvantula
    P(545, 'Alegre',  'Impulso',       'vidasfera',{atk:252, spe:252, hp:4}, ['Puya Nociva',   'Pin Misil',    'Danza Espada',  'Megacuerno']),   // Scolipede
    P(214, 'Firme',   'Agallas',       'aguante',  {atk:252, spe:252, hp:4}, ['Golpe Roca',    'Pin Misil',    'Danza Espada',  'Megacuerno']),   // Heracross
    P(127, 'Firme',   'Rompemoldes',   'chaleco',  {atk:252, hp:252, def:4}, ['Tijera X',      'Pin Misil',    'Danza Espada',  'Terremoto']),    // Pinsir
    P(637, 'Modesta', 'Cuerpo Llama',  'vidasfera',{spa:252, spe:252, hp:4}, ['Colmillo Ígneo','Zumbido',      'Danza Aleteo',  'Llamarada'])     // Volcarona
  ],
  lino: [      // Roca · Ciudad Relieve (Grant). Megas: Tyranitar y Aerodactyl
    P(697, 'Firme',   'Mandíbula Fuerte','vidasfera',{atk:252, spe:252, hp:4}, ['Garra Dragón',  'Lanzarrocas',  'Danza Dragón',  'Roca Afilada']), // Tyrantrum
    P(699, 'Modesta', 'Manto Níveo',   'gafasesp', {spa:252, hp:252, def:4}, ['Tumba Rocas',   'Rayo Hielo',   'Pulimento',     'Ventisca']),     // Aurorus
    PM('tyranitar', 248, 'Firme', 'Chorro Arena', 'mega_tyranitar', {atk:252, spe:252, hp:4}, ['Mordisco', 'Lanzarrocas', 'Danza Dragón', 'Terremoto']),   // Tyranitar (Tyranitarita)
    PM('aerodactyl', 142, 'Alegre', 'Presión', 'mega_aerodactyl', {atk:252, spe:252, hp:4}, ['Tumba Rocas', 'Lanzarrocas', 'Danza Espada', 'Roca Afilada']), // Aerodactyl (Aerodactylita)
    P(346, 'Osada',   'Ventosas',      'restos',   {hp:252, def:252, spa:4}, ['Látigo Cepa',   'Lanzarrocas',  'Amnesia',       'Rayo Solar']),   // Cradily
    P(464, 'Firme',   'Roca Sólida',   'casco',    {atk:252, hp:252, def:4}, ['Tumba Rocas',   'Lanzarrocas',  'Pulimento',     'Terremoto'])     // Rhyperior
  ],
  corelia: [   // Lucha · Ciudad Yantra (Korrina). Megas: Lucario y Gallade
    PM('lucario', 448, 'Alegre', 'Justiciero', 'mega_lucario', {atk:252, spe:252, hp:4}, ['Garra Metal', 'Esfera Aural', 'Corpulencia', 'Onda Certera']),   // Lucario (Lucarionita)
    P(701, 'Alegre',  'Rompemoldes',   'vidasfera',{atk:252, spe:252, hp:4}, ['Ataque Ala',    'Esfera Aural', 'Corpulencia',   'Pájaro Osado']), // Hawlucha
    P(675, 'Firme',   'Rompemoldes',   'casco',    {hp:252, atk:252, def:4}, ['Golpe Roca',    'Pulso Umbrío', 'Corpulencia',   'Terremoto']),    // Pangoro
    P(620, 'Alegre',  'Foco Interno',  'cintaelec',{atk:252, spe:252, hp:4}, ['Golpe Roca',    'Esfera Aural', 'Corpulencia',   'Onda Certera']), // Mienshao
    PM('gallade', 475, 'Firme', 'Foco Interno', 'mega_gallade', {atk:252, spe:252, hp:4}, ['Cabezazo Zen', 'Esfera Aural', 'Danza Espada', 'Onda Certera']),   // Gallade (Galladita)
    P(214, 'Firme',   'Agallas',       'restos',   {hp:252, atk:252, def:4}, ['Golpe Roca',    'Pin Misil',    'Danza Espada',  'Megacuerno'])    // Heracross
  ],
  amaro: [     // Planta · Ciudad Tiriópolis (Ramos). Sin megas (Venusaur tiene mega en los juegos, pero aún no está en el juego)
    P(673, 'Firme',   'Espesura',      'aguante',  {hp:252, atk:252, def:4}, ['Látigo Cepa',   'Hoja Afilada', 'Desarrollo',    'Terremoto']),    // Gogoat
    P(709, 'Firme',   'Cosecha',       'restos',   {hp:252, atk:252, def:4}, ['Puño Sombra',   'Hoja Afilada', 'Maldición',     'Terremoto']),    // Trevenant
    P(711, 'Firme',   'Cosecha',       'vidasfera',{atk:252, spe:252, hp:4}, ['Puño Sombra',   'Bomba Lodo',   'Maldición',     'Bola Sombra']),  // Gourgeist
    P(598, 'Osada',   'Punta Acero',   'restos',   {hp:252, def:252, atk:4}, ['Látigo Cepa',   'Bomba Imán',   'Defensa Férrea','Rayo Solar']),   // Ferrothorn
    P(  3, 'Modesta', 'Clorofila',     'gafasesp', {hp:252, spa:252, def:4}, ['Látigo Cepa',   'Bomba Lodo',   'Desarrollo',    'Rayo Solar']),   // Venusaur
    P(652, 'Firme',   'Espesura',      'casco',    {hp:252, atk:252, def:4}, ['Golpe Roca',    'Hoja Afilada', 'Desarrollo',    'Terremoto'])     // Chesnaught
  ],
  lem: [       // Eléctrico · Ciudad Luminalia (Clemont; en tu lista, Électra). Mega: Manectric
    P(695, 'Modesta', 'Piel Seca',     'vidasfera',{spa:252, spe:252, hp:4}, ['Colmillo Rayo', 'Rayo',         'Carga',         'Trueno']),       // Heliolisk
    P( 82, 'Modesta', 'Imán',          'gafasesp', {spa:252, spe:252, hp:4}, ['Puño Bala',     'Bomba Imán',   'Carga',         'Trueno']),       // Magneton
    PM('manectric', 310, 'Modesta', 'Intimidación', 'mega_manectric', {spa:252, spe:252, hp:4}, ['Colmillo Rayo', 'Lanzallamas', 'Carga', 'Trueno']),   // Manectric (Manectita)
    P(181, 'Modesta', 'Pararrayos',    'restos',   {hp:252, spa:252, def:4}, ['Puño Trueno',   'Rayo',         'Carga',         'Foco Resplandor']), // Ampharos
    P(479, 'Modesta', 'Levitación',    'chaleco',  {hp:252, spa:252, def:4}, ['Lengüetazo',    'Rayo',         'Carga',         'Bola Sombra']),  // Rotom
    P(462, 'Modesta', 'Analítico',     'gafasesp', {spa:252, spe:252, hp:4}, ['Puño Bala',     'Bomba Imán',   'Carga',         'Trueno'])        // Magnezone
  ],
  valeria: [   // Hada · Ciudad Romantis (Valerie; en tu lista, «Ástrid»). Megas: Mawile y Gardevoir
    P(700, 'Modesta', 'Piel Feérica',  'gafasesp', {hp:252, spa:252, def:4}, ['Carantoña',     'Voz Cautivadora','Paz Mental',  'Fuerza Lunar']), // Sylveon
    P(671, 'Modesta', 'Velo Flor',     'restos',   {hp:252, spa:252, def:4}, ['Látigo Cepa',   'Viento Feérico','Desarrollo',   'Fuerza Lunar']), // Florges
    PM('mawile', 303, 'Firme', 'Intimidación', 'mega_mawile', {atk:252, hp:252, def:4}, ['Garra Metal', 'Viento Feérico', 'Defensa Férrea', 'Terremoto']),   // Mawile (Mawilita)
    P(707, 'Osada',   'Bromista',      'restos',   {hp:252, def:252, spa:4}, ['Carantoña',     'Bomba Imán',   'Defensa Férrea','Foco Resplandor']), // Klefki
    PM('gardevoir', 282, 'Modesta', 'Sincronía', 'mega_gardevoir', {spa:252, spe:252, hp:4}, ['Cabezazo Zen', 'Voz Cautivadora', 'Paz Mental', 'Psíquico']),   // Gardevoir (Gardevoirita)
    P(184, 'Alegre',  'Gran Fuerza',   'vidasfera',{atk:252, hp:252, def:4}, ['Acua Cola',     'Viento Feérico','Danza Lluvia', 'Hidrobomba'])    // Azumarill
  ],
  astrid: [    // Psíquico · Ciudad Anistar (Olympia; en tu lista, Áureo). Sin megas (Metagross tiene mega en los juegos, pero aún no está)
    P(678, 'Modesta', 'Competitivo',   'gafasesp', {spa:252, spe:252, hp:4}, ['Cabezazo Zen',  'Psicorrayo',   'Paz Mental',    'Psíquico']),     // Meowstic
    P(199, 'Modesta', 'Ritmo Propio',  'restos',   {hp:252, spa:252, def:4}, ['Cabezazo Zen',  'Rayo Hielo',   'Paz Mental',    'Psíquico']),     // Slowking
    P(196, 'Modesta', 'Sincronía',     'vidasfera',{spa:252, spe:252, hp:4}, ['Cabezazo Zen',  'Psicorrayo',   'Paz Mental',    'Psíquico']),     // Espeon
    P(687, 'Firme',   'Contrario',     'aguante',  {atk:252, hp:252, def:4}, ['Cabezazo Zen',  'Pulso Umbrío', 'Danza Espada',  'Terremoto']),    // Malamar
    P(579, 'Modesta', 'Dicha',         'restos',   {hp:252, spa:252, def:4}, ['Cabezazo Zen',  'Psicorrayo',   'Paz Mental',    'Psíquico']),     // Reuniclus
    P(376, 'Firme',   'Cuerpo Puro',   'cintaelec',{atk:252, hp:252, def:4}, ['Puño Bala',     'Psicorrayo',   'Defensa Férrea','Terremoto'])     // Metagross
  ],
  edel: [      // Hielo · Ciudad Fractal (Wulfric). Mega: Glalie
    P(713, 'Firme',   'Cuerpo Gélido', 'casco',    {hp:252, atk:252, def:4}, ['Colmillo Hielo','Rayo Hielo',   'Neblina',       'Terremoto']),    // Avalugg
    P(460, 'Firme',   'Nevada',        'restos',   {hp:252, atk:252, def:4}, ['Puño Hielo',    'Rayo Hielo',   'Neblina',       'Terremoto']),    // Abomasnow
    P(461, 'Alegre',  'Presión',       'vidasfera',{atk:252, spe:252, hp:4}, ['Colmillo Hielo','Rayo Hielo',   'Maquinación',   'Ventisca']),     // Weavile
    P(473, 'Firme',   'Sebo',          'chaleco',  {hp:252, atk:252, def:4}, ['Puño Hielo',    'Lanzarrocas',  'Neblina',       'Terremoto']),    // Mamoswine
    PM('glalie', 362, 'Modesta', 'Cuerpo Gélido', 'mega_glalie', {spa:252, spe:252, hp:4}, ['Colmillo Hielo', 'Rayo Hielo', 'Neblina', 'Ventisca']),   // Glalie (Glalitita)
    P(699, 'Modesta', 'Manto Níveo',   'gafasesp', {spa:252, hp:252, def:4}, ['Tumba Rocas',   'Rayo Hielo',   'Neblina',       'Ventisca'])      // Aurorus
  ],
  // ---------------- ALTO MANDO ----------------
  malva: [     // Fuego · Malva. Pyroar no tiene sprite (NO_SPRITE en data.js): lo sustituye Houndoom. Cuando tenga sprite, cámbialo aquí por P(668, ...)
    P(663, 'Alegre',  'Mar Llamas',    'vidasfera',{atk:252, spe:252, hp:4}, ['Ataque Ala',    'Tajo Aéreo',   'Viento Afín',   'Pájaro Osado']), // Talonflame
    P(229, 'Modesta', 'Absorbe Fuego', 'gafasesp', {spa:252, spe:252, hp:4}, ['Colmillo Ígneo','Lanzallamas',  'Día Soleado',   'Llamarada']),    // Houndoom (en vez de Pyroar)
    P(609, 'Modesta', 'Absorbe Fuego', 'gafaselec',{spa:252, spe:252, hp:4}, ['Lengüetazo',    'Lanzallamas',  'Maldición',     'Bola Sombra']),  // Chandelure
    P(637, 'Modesta', 'Cuerpo Llama',  'vidasfera',{spa:252, spe:252, hp:4}, ['Colmillo Ígneo','Zumbido',      'Danza Aleteo',  'Llamarada']),    // Volcarona
    P(324, 'Modesta', 'Sequía',        'restos',   {hp:252, spa:252, def:4}, ['Colmillo Ígneo','Lanzallamas',  'Día Soleado',   'Llamarada']),    // Torkoal
    P(655, 'Modesta', 'Llama Fuerte',  'gafasesp', {spa:252, spe:252, hp:4}, ['Puño Fuego',    'Lanzallamas',  'Paz Mental',    'Psíquico'])      // Delphox
  ],
  narciso: [   // Agua · Narciso (Siebold). Sin megas
    P(693, 'Modesta', 'Megadisparo',   'gafasesp', {spa:252, spe:252, hp:4}, ['Acua Cola',     'Hidropulso',   'Danza Lluvia',  'Hidrobomba']),   // Clawitzer
    P(130, 'Alegre',  'Intimidación',  'aguante',  {atk:252, spe:252, hp:4}, ['Acua Cola',     'Hidropulso',   'Danza Dragón',  'Hidrobomba']),   // Gyarados
    P(121, 'Modesta', 'Absorbe Agua',  'vidasfera',{spa:252, spe:252, hp:4}, ['Acua Cola',     'Psicorrayo',   'Danza Lluvia',  'Hidrobomba']),   // Starmie
    P(230, 'Modesta', 'Francotirador', 'gafasesp', {spa:252, spe:252, hp:4}, ['Acua Cola',     'Pulso Dragón', 'Danza Dragón',  'Hidrobomba']),   // Kingdra
    P(689, 'Firme',   'Piel Tosca',    'cintaelec',{atk:252, hp:252, def:4}, ['Acua Cola',     'Lanzarrocas',  'Pulimento',     'Roca Afilada']), // Barbaracle
    P(658, 'Alegre',  'Cambio Táctico','vidasfera',{spa:252, spe:252, hp:4}, ['Mordisco',      'Shuriken de Agua','Maquinación','Hidrobomba'])    // Greninja
  ],
  tileo: [     // Fantasma · Tileo. Mega: Gengar. (Retrato de Wikstrom y fondo de salón encantado)
    P(426, 'Modesta', 'Detonación',    'gafasesp', {hp:252, spa:252, def:4}, ['Lengüetazo',    'Tinieblas',    'Maldición',     'Bola Sombra']),  // Drifblim
    P(711, 'Firme',   'Cosecha',       'restos',   {hp:252, atk:252, def:4}, ['Puño Sombra',   'Bomba Lodo',   'Maldición',     'Bola Sombra']),  // Gourgeist
    P(681, 'Modesta', 'Cambio Táctico','vidasfera',{hp:252, spa:252, def:4}, ['Garra Metal',   'Tinieblas',    'Defensa Férrea','Bola Sombra']),  // Aegislash
    P(609, 'Modesta', 'Absorbe Fuego', 'gafasesp', {spa:252, spe:252, hp:4}, ['Lengüetazo',    'Lanzallamas',  'Maldición',     'Bola Sombra']),  // Chandelure
    P(709, 'Firme',   'Cosecha',       'aguante',  {hp:252, atk:252, def:4}, ['Puño Sombra',   'Hoja Afilada', 'Maldición',     'Terremoto']),    // Trevenant
    PM('gengar', 94, 'Modesta', 'Cuerpo Maldito', 'mega_gengar', {spa:252, spe:252, hp:4}, ['Lengüetazo', 'Bomba Lodo', 'Maldición', 'Bola Sombra'])   // Gengar (Gengarita)
  ],
  agata: [     // Acero · Ágata (cuarta del Alto Mando en esta lista). Sin megas (Metagross tiene mega en los juegos, pero aún no está)
    P(707, 'Osada',   'Bromista',      'restos',   {hp:252, def:252, spa:4}, ['Carantoña',     'Bomba Imán',   'Defensa Férrea','Foco Resplandor']), // Klefki
    P(462, 'Modesta', 'Analítico',     'gafasesp', {spa:252, spe:252, hp:4}, ['Puño Bala',     'Bomba Imán',   'Carga',         'Trueno']),       // Magnezone
    P(476, 'Modesta', 'Roca Sólida',   'chaleco',  {hp:252, spa:252, def:4}, ['Tumba Rocas',   'Bomba Imán',   'Defensa Férrea','Foco Resplandor']), // Probopass
    P(411, 'Osada',   'Robustez',      'restos',   {hp:252, def:252, atk:4}, ['Tumba Rocas',   'Lanzarrocas',  'Defensa Férrea','Foco Resplandor']), // Bastiodon
    P(601, 'Firme',   'Cuerpo Puro',   'vidasfera',{atk:252, spe:252, hp:4}, ['Garra Metal',   'Bomba Imán',   'Defensa Férrea','Foco Resplandor']), // Klinklang
    P(376, 'Firme',   'Cuerpo Puro',   'cintaelec',{atk:252, hp:252, def:4}, ['Puño Bala',     'Psicorrayo',   'Defensa Férrea','Terremoto'])     // Metagross
  ],
  // ---------------- CAMPEONA ----------------
  dianta: [    // Dianta (Diantha), Campeona de Kalos. Mega: Gardevoir
    PM('gardevoir', 282, 'Modesta', 'Sincronía', 'mega_gardevoir', {spa:252, spe:252, hp:4}, ['Cabezazo Zen', 'Voz Cautivadora', 'Paz Mental', 'Psíquico']),   // Gardevoir (Gardevoirita)
    P(706, 'Modesta', 'Hidratación',   'chaleco',  {hp:252, spa:252, def:4}, ['Garra Dragón',  'Bomba Lodo',   'Danza Dragón',  'Cometa Draco']), // Goodra
    P(701, 'Alegre',  'Rompemoldes',   'aguante',  {atk:252, spe:252, hp:4}, ['Ataque Ala',    'Esfera Aural', 'Corpulencia',   'Pájaro Osado']), // Hawlucha
    P(697, 'Firme',   'Mandíbula Fuerte','vidasfera',{atk:252, spe:252, hp:4}, ['Garra Dragón',  'Lanzarrocas',  'Danza Dragón',  'Roca Afilada']), // Tyrantrum
    P(699, 'Modesta', 'Manto Níveo',   'gafasesp', {spa:252, hp:252, def:4}, ['Tumba Rocas',   'Rayo Hielo',   'Pulimento',     'Ventisca']),     // Aurorus
    P(711, 'Firme',   'Cosecha',       'restos',   {hp:252, atk:252, def:4}, ['Puño Sombra',   'Bomba Lodo',   'Maldición',     'Bola Sombra'])   // Gourgeist
  ]
});

// ---------------------------------------------------------------------
// Los 13 combates de Kalos, en orden: 8 líderes, 4 del Alto Mando y la Campeona.
// id = nombre del retrato (lideres/kalos/<id>.png, ver LEADER_FILE en data.js) y de la arena (arenaskalos.js)
// ---------------------------------------------------------------------
const KALOS = 'Kalos';
const KF = (id, leader, tag, kind, lvl, dn, place, extra) =>
  Object.assign({id, leader, tag, kind, lvl, diff: kind === 'lider' ? 'dificil' : 'muy_dificil', teams: TEAMS[id], region: KALOS, idx: 0, dn, place}, extra);
FLOORS.push(
  KF('violeta', 'Violeta', 'Bicho',     'lider', 150, 8,  'Ciudad Novarte'),
  KF('lino',    'Lino',    'Roca',      'lider', 151, 9,  'Ciudad Relieve'),
  KF('corelia', 'Corelia', 'Lucha',     'lider', 152, 10, 'Ciudad Yantra'),
  KF('amaro',   'Amaro',   'Planta',    'lider', 153, 11, 'Ciudad Tiriópolis'),
  KF('lem',     'Lem',     'Eléctrico', 'lider', 154, 12, 'Ciudad Luminalia'),
  KF('valeria', 'Valeria', 'Hada',      'lider', 155, 13, 'Ciudad Romantis'),
  KF('astrid',  'Ástrid',  'Psíquico',  'lider', 156, 14, 'Ciudad Anistar'),
  KF('edel',    'Édel',    'Hielo',     'lider', 157, 15, 'Ciudad Fractal'),
  // Alto Mando (MUY DIFÍCIL) y Campeona
  KF('malva',   'Malva',   'Fuego',     'alto',  160, 17, 'Liga Pokémon'),
  KF('narciso', 'Narciso', 'Agua',      'alto',  161, 18, 'Liga Pokémon'),
  KF('tileo',   'Tileo',   'Fantasma',  'alto',  162, 19, 'Liga Pokémon'),
  KF('agata',   'Ágata',   'Acero',     'alto',  163, 19, 'Liga Pokémon'),
  KF('dianta',  'Dianta',  'Campeona',  'campeon', 170, 22, 'Liga Pokémon')
);
floorsOf(KALOS).forEach((F, i) => F.idx = i);                           // posición dentro de Kalos (0 = Violeta)
