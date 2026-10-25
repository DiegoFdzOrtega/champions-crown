"use strict";
/* =====================================================================
   16b) CAMPO DE ENTRENAMIENTO: la zona para farmear Chapas Plateadas y Chapas Doradas
   Entrenadores normales (no líderes) con 3-4 Pokémon cada uno, repetibles todas las veces que quieras.
   Cada victoria da una recompensa FIJA: 1 ticket + BP y Chapas Plateadas y Doradas según la dificultad: Fácil 50 BP + 5+5, Media 100 BP + 10+10, Difícil 150 BP + 15+15 (REWARD.campo y REWARD_CAMPO en teams.js).
   Se carga DESPUÉS de teams.js (usa P(), ITEMS, MOVES, enemyBoost...). Los sprites están en la carpeta entrenadores/ (80x80).

   Cada entrenador es una entrada de CAMPO:
     {id, file, name, cls, theme, tier, arena, team:[P(...), ...]}
       id     nombre interno (único)           file   archivo de entrenadores/
       name   nombre en pantalla               cls    clase del entrenador (lo que se ve en su dibujo)
       theme  tema de su equipo (por qué lleva esos Pokémon)
       tier   1 = fácil · 2 = media · 3 = difícil (ver CAMPO_TIER: nivel y dificultad)
       arena  (ya no se usa) todos los combates del Campo se juegan en el estadio 'campo' (arenascampo.js)
       opt    true = solo aparece si existe su imagen (por si todavía no la has añadido)
       team   3-4 Pokémon: P(nº Pokédex, 'Naturaleza', 'Habilidad', 'objeto', {EVs}, ['golpe','disparo','mejora','ataque fuerte'])
   Reglas (igual que los equipos de los líderes; se comprueban al cargar con validateTeams()): sin repetir especie, IVs 31 (los pone P()),
   EV máx 252 por stat y 510 en total (reparto por papel: atacante = ataque/at. esp. + velocidad, tanque = PS + defensa), objeto de
   ITEMS (data.js; "Mineral Evolutivo" no existe en este juego, por eso no se usa) y los 4 movimientos de los 4 huecos del motor.
   DESBLOQUEO: la dificultad Media se abre al vencer a TODOS los entrenadores de Fácil, y la Difícil al vencer a todos los de Media
   (los entrenadores con opt:true no cuentan, porque pueden no tener imagen). Las victorias se guardan en save.campoWins {id:1}.
   Si prefieres que baste con vencer a UNO de cada dificultad, pon CAMPO_BASTA_UNO = true.
   Para añadir un entrenador: copia una entrada, cambia sus datos y pon su imagen en entrenadores/.
   ===================================================================== */
// Dificultad por nivel (tier): se calcula con la misma fórmula que la Historia (DIFF en data.js). lvl = nivel del rival, n = "posición" equivalente.
//   tier 1 ≈ Brock-Misty · tier 2 ≈ Erika-Koga · tier 3 ≈ Sabrina-Blaine (pero con 3-4 Pokémon en vez de 6, para poder repetirlo muchas veces)
const CAMPO_TIER = {1:{lvl:110, n:2, nombre:'Fácil'}, 2:{lvl:118, n:4, nombre:'Media'}, 3:{lvl:125, n:6, nombre:'Difícil'}};
function campoStats(T){
  const t = CAMPO_TIER[T.tier], D = DIFF.dificil, k = t.lvl / 100;
  return {lvl:t.lvl, hm:D.hm(t.n) * k, dm:D.dm(t.n) * k, skill:D.skill(t.n), spdm:1 + (k - 1) * .4};
}

const CAMPO = [
  // ===================== DIFICULTAD 1 · FÁCIL (3 Pokémon) =====================
  {id:'cafetero', file:'cafemaster.png', name:'Maestro Cafetero', cls:'Maestro Café', theme:'Dulces y lácteos de cafetería', tier:1, arena:'erika', team:[
    P(685, 'Modesta', 'Velo Dulce',     'gafaselec', {spa:252, spe:252, hp:4}, ['Carantoña',     'Voz Cautivadora', 'Campo Neblinoso', 'Fuerza Lunar']),    // Slurpuff: nata y caramelo
    P(584, 'Miedosa', 'Manto Níveo',    'gafasesp',  {spa:252, spe:252, hp:4}, ['Colmillo Hielo','Rayo Hielo',      'Neblina',         'Ventisca']),        // Vanilluxe: helado
    P( 40, 'Modesta', 'Competitivo',    'restos',    {hp:252, spa:252, def:4}, ['Golpe Cuerpo',  'Voz Cautivadora', 'Paz Mental',      'Fuerza Lunar'])     // Wigglytuff: algodón de azúcar (antes Blissey, demasiado dura para el nivel fácil)
  ]},
  {id:'panadera', file:'panadero.png', name:'Panadera', cls:'Panadero', theme:'Horno, bollería y leche', tier:1, arena:'blaine', team:[
    P(869, 'Modesta', 'Velo Dulce',     'gafasesp',  {hp:252, spa:252, def:4}, ['Carantoña',     'Viento Feérico',  'Campo Neblinoso', 'Fuerza Lunar']),    // Alcremie: tarta de nata
    P(241, 'Osada',   'Sebo',           'restos',    {hp:252, def:252, atk:4}, ['Golpe Cuerpo',  'Disparo Lodo',    'Corpulencia',     'Terremoto']),       // Miltank: leche
    P(323, 'Modesta', 'Escudo Magma',   'gafaselec', {hp:252, spa:252, def:4}, ['Excavar',       'Lanzallamas',     'Día Soleado',     'Llamarada'])        // Camerupt: el horno
  ]},
  {id:'vaquera', file:'cowgirl.png', name:'Vaquera', cls:'Vaquera', theme:'Ganado, caballos y praderas', tier:1, arena:'giovanni', team:[
    P(128, 'Alegre',  'Intimidación',   'cintaelec', {atk:252, spe:252, hp:4}, ['Cabezazo',      'Doble Filo',      'Danza Espada',    'Terremoto']),       // Tauros: el toro
    P( 78, 'Alegre',  'Absorbe Fuego',  'panuelo',   {atk:252, spe:252, hp:4}, ['Colmillo Ígneo','Lanzallamas',     'Danza Espada',    'Envite Ígneo']),    // Rapidash: el caballo
    P(673, 'Firme',   'Herbívoro',      'casco',     {hp:252, atk:252, def:4}, ['Látigo Cepa',   'Hoja Afilada',    'Desarrollo',      'Rayo Solar'])       // Gogoat: la cabra de monte
  ]},
  {id:'ciclista', file:'cyclistf.png', name:'Ciclista', cls:'Ciclista', theme:'Velocidad pura', tier:1, arena:'lt_surge', team:[
    P(135, 'Miedosa', 'Absorbe Elec.',  'gafaselec', {spa:252, spe:252, hp:4}, ['Colmillo Rayo', 'Rayo',            'Carga',           'Trueno']),          // Jolteon: el más veloz de los Eevee
    P( 85, 'Alegre',  'Madrugar',       'panuelo',   {atk:252, spe:252, hp:4}, ['Ataque Ala',    'Doble Filo',      'Agilidad',        'Pájaro Osado']),    // Dodrio: carrera a pie
    P(291, 'Alegre',  'Impulso',        'periscopio',{atk:252, spe:252, hp:4}, ['Tijera X',      'Doble Filo',      'Danza Espada',    'Megacuerno'])       // Ninjask: Impulso
  ]},
  {id:'golfista', file:'golfer.png', name:'Golfista', cls:'Golfista', theme:'Bolas, palos y viento', tier:1, arena:'erika', team:[
    P(103, 'Modesta', 'Clorofila',      'gafaselec', {hp:252, spa:252, def:4}, ['Cabezazo Zen',  'Hoja Afilada',    'Desarrollo',      'Rayo Solar']),      // Exeggutor: los cocos
    P( 91, 'Firme',   'Encadenado',     'cinturon',  {atk:252, spe:252, hp:4}, ['Colmillo Hielo','Lanzarrocas',     'Pulimento',       'Roca Afilada']),    // Cloyster: la bola
    P(279, 'Modesta', 'Llovizna',       'gafasesp',  {hp:252, spa:252, spd:4}, ['Ataque Ala',    'Hidropulso',      'Danza Lluvia',    'Hidrobomba'])       // Pelipper: el viento y el agua
  ]},
  {id:'pescador', file:'fisherman-gen3.png', name:'Pescador', cls:'Pescador', theme:'Lagos y ríos', tier:1, arena:'misty', team:[
    P(130, 'Alegre',  'Intimidación',   'vidasfera', {atk:252, spe:252, hp:4}, ['Acua Cola',    'Hidropulso',      'Danza Dragón',    'Terremoto']),       // Gyarados: la gran pesca
    P(350, 'Modesta', 'Escama Especial','restos',    {hp:252, spa:252, def:4}, ['Acua Cola',    'Hidropulso',      'Refugio',         'Hidrobomba']),      // Milotic
    P(119, 'Alegre',  'Nado Rápido',    'casco',     {atk:252, spe:252, hp:4}, ['Acua Cola',    'Pistola Agua',    'Danza Lluvia',    'Hidrobomba'])       // Seaking
  ]},
  {id:'cameraman', file:'cameraman.png', name:'Reportero', cls:'Cámara', theme:'Flashes, pantallas y electrónica', tier:1, arena:'lt_surge', team:[
    P(479, 'Modesta', 'Levitación',     'gafaselec', {spa:252, spe:252, hp:4}, ['Lengüetazo',   'Rayo',            'Carga',           'Trueno']),          // Rotom: la tele
    P(462, 'Modesta', 'Imán',           'gafasesp',  {hp:252, spa:252, def:4}, ['Garra Metal',  'Bomba Imán',      'Defensa Férrea',  'Foco Resplandor']), // Magnezone: los objetivos
    P(474, 'Miedosa', 'Adaptable',      'periscopio',{spa:252, spe:252, hp:4}, ['Cabezazo',     'Triataque',       'Afilar',          'Hiperrayo'])        // Porygon-Z: el píxel
  ]},
  {id:'mochilera', file:'mochilero.png', name:'Mochilera', cls:'Mochilera', theme:'Excursión y aventura', tier:1, arena:'erika', team:[
    P(214, 'Alegre',  'Agallas',        'cintaelec', {atk:252, spe:252, hp:4}, ['Tijera X',     'Esfera Aural',    'Danza Espada',    'Megacuerno']),      // Heracross: el escarabajo de su mochila
    P( 59, 'Alegre',  'Intimidación',   'cinturon',  {atk:252, spe:252, hp:4}, ['Colmillo Ígneo','Doble Filo',     'Danza Espada',    'Envite Ígneo']),    // Arcanine: el compañero de viaje
    P(399, 'Alegre',  'Simple',         'restos',    {hp:252, atk:252, def:4}, ['Golpe Cuerpo', 'Doble Filo',      'Danza Espada',    'Hiperrayo'])        // Bibarel: el castor trabajador
  ]},
  {id:'infielder', file:'infielder.png', name:'Jugador de Béisbol', cls:'Jugador de béisbol', theme:'Bates, pelotas y reflejos', tier:1, arena:'giovanni', team:[
    P(812, 'Alegre',  'Espesura',       'cintaelec', {atk:252, spe:252, hp:4}, ['Látigo Cepa',  'Hoja Afilada',    'Danza Espada',    'Terremoto']),       // Rillaboom: el bate
    P(398, 'Alegre',  'Intimidación',   'vidasfera', {atk:252, spe:252, hp:4}, ['Ataque Ala',   'Doble Filo',      'Danza Espada',    'Pájaro Osado']),    // Staraptor: el lanzamiento
    P(257, 'Alegre',  'Mar Llamas',     'periscopio',{atk:252, spe:252, hp:4}, ['Colmillo Ígneo','Esfera Aural',   'Danza Espada',    'Envite Ígneo'])     // Blaziken: el bateador
  ]},
  {id:'cazabichos', file:'bugcatcher.png', opt:true, name:'Cazabichos', cls:'Cazabichos', theme:'Insectos', tier:1, arena:'erika', team:[
    P(212, 'Firme',   'Experto',        'cinturon',  {hp:252, atk:252, def:4}, ['Tijera X',     'Bomba Imán',      'Danza Espada',    'Megacuerno']),      // Scizor
    P( 12, 'Modesta', 'Ojo Compuesto',  'gafasesp',  {spa:252, spe:252, hp:4}, ['Ataque Ala',   'Zumbido',         'Danza Aleteo',    'Psíquico']),        // Butterfree
    P(469, 'Modesta', 'Cromolente',     'gafaselec', {spa:252, spe:252, hp:4}, ['Ataque Ala',   'Zumbido',         'Danza Aleteo',    'Megacuerno'])       // Yanmega
  ]},

  // ===================== DIFICULTAD 2 · MEDIA (4 Pokémon) =====================
  {id:'montanero', file:'hiker-gen4.png', name:'Montañero', cls:'Montañero', theme:'Roca, cuevas y montaña', tier:2, arena:'brock', team:[
    P(464, 'Firme',   'Roca Sólida',    'casco',     {hp:252, atk:252, spd:4}, ['Tumba Rocas',  'Lanzarrocas',     'Pulimento',       'Terremoto']),       // Rhyperior
    P(208, 'Osada',   'Cabeza Roca',    'restos',    {hp:252, def:252, atk:4}, ['Garra Metal',  'Lanzarrocas',     'Defensa Férrea',  'Terremoto']),       // Steelix
    P( 76, 'Firme',   'Robustez',       'aguante',   {hp:252, atk:252, def:4}, ['Tumba Rocas',  'Disparo Lodo',    'Pulimento',       'Roca Afilada']),    // Golem
    P( 68, 'Firme',   'Agallas',        'cinturon',  {atk:252, hp:252, spd:4}, ['Golpe Roca',   'Esfera Aural',    'Corpulencia',     'Onda Certera'])     // Machamp: los músculos del montañero
  ]},
  {id:'marinero', file:'sailor.png', name:'Marinero', cls:'Marinero', theme:'Mar y puerto', tier:2, arena:'misty', team:[
    P( 62, 'Firme',   'Absorbe Agua',   'cinturon',  {hp:252, atk:252, spd:4}, ['Acua Cola',    'Hidropulso',      'Corpulencia',     'Hidrobomba']),      // Poliwrath: el marinero fortachón
    P( 73, 'Modesta', 'Cuerpo Puro',    'restos',    {hp:252, spa:252, spd:4}, ['Puya Nociva',  'Bomba Lodo',      'Armadura Ácida',  'Hidrobomba']),      // Tentacruel
    P( 99, 'Alegre',  'Corte Fuerte',   'periscopio',{atk:252, spe:252, hp:4}, ['Acua Cola',    'Doble Filo',      'Danza Espada',    'Hidrobomba']),      // Kingler
    P(319, 'Alegre',  'Piel Tosca',     'vidasfera', {atk:252, spe:252, hp:4}, ['Mordisco',     'Hidropulso',      'Maquinación',     'Pulso Noche'])      // Sharpedo
  ]},
  {id:'surfista', file:'surfer.png', name:'Surfista', cls:'Surfista', theme:'Olas y playa', tier:2, arena:'misty', team:[
    P(260, 'Firme',   'Torrente',       'restos',    {hp:252, atk:252, spd:4}, ['Acua Cola',    'Disparo Lodo',    'Refugio',         'Terremoto']),       // Swampert
    P(121, 'Miedosa', 'Cura Natural',   'gafaselec', {spa:252, spe:252, hp:4}, ['Cabezazo Zen', 'Hidropulso',      'Danza Lluvia',    'Hidrobomba']),      // Starmie
    P(230, 'Modesta', 'Nado Rápido',    'vidasfera', {spa:252, spe:252, hp:4}, ['Garra Dragón', 'Hidropulso',      'Danza Lluvia',    'Hidrobomba']),      // Kingdra
    P(419, 'Alegre',  'Nado Rápido',    'cintaelec', {atk:252, spe:252, hp:4}, ['Acua Cola',    'Hidropulso',      'Danza Lluvia',    'Hidrobomba'])       // Floatzel: el surfero
  ]},
  {id:'snowboarder', file:'snowboarder.png', name:'Snowboarder', cls:'Snowboarder', theme:'Nieve y hielo', tier:2, arena:'lorelei', team:[
    P(461, 'Alegre',  'Presión',        'vidasfera', {atk:252, spe:252, hp:4}, ['Colmillo Hielo','Pulso Umbrío',   'Danza Espada',    'Pulso Noche']),     // Weavile
    P(473, 'Firme',   'Capa Nieve',     'cinturon',  {hp:252, atk:252, spd:4}, ['Colmillo Hielo','Nieve Polvo',    'Danza Espada',    'Terremoto']),       // Mamoswine
    P(460, 'Modesta', 'Nevada',         'gafaselec', {hp:252, spa:252, def:4}, ['Colmillo Hielo','Hoja Afilada',   'Desarrollo',      'Ventisca']),        // Abomasnow
    P(478, 'Miedosa', 'Cuerpo Maldito', 'gafasesp',  {spa:252, spe:252, hp:4}, ['Lengüetazo',   'Rayo Hielo',      'Maldición',       'Ventisca'])         // Froslass
  ]},
  {id:'karateka', file:'karateka.png', name:'Karateka', cls:'Karateka', theme:'Artes marciales', tier:2, arena:'bruno', team:[
    P(448, 'Alegre',  'Impasible',      'vidasfera', {atk:252, spe:252, hp:4}, ['Golpe Roca',   'Esfera Aural',    'Danza Espada',    'Onda Certera']),    // Lucario
    P(107, 'Alegre',  'Puño Férreo',    'cintaelec', {atk:252, spe:252, hp:4}, ['Golpe Roca',   'Triataque',       'Corpulencia',     'Onda Certera']),    // Hitmonchan
    P(620, 'Alegre',  'Foco Interno',   'periscopio',{atk:252, spe:252, hp:4}, ['Golpe Roca',   'Triataque',       'Danza Espada',    'Onda Certera']),    // Mienshao
    P(534, 'Firme',   'Agallas',        'casco',     {hp:252, atk:252, spd:4}, ['Golpe Roca',   'Disparo Lodo',    'Corpulencia',     'Onda Certera'])     // Conkeldurr
  ]},
  {id:'guitarrista', file:'guitarist-gen4.png', name:'Guitarrista', cls:'Guitarrista', theme:'Sonido y electricidad', tier:2, arena:'lt_surge', team:[
    P(466, 'Alegre',  'Electromotor',   'cintaelec', {atk:252, spe:252, hp:4}, ['Colmillo Rayo','Esfera Aural',    'Danza Espada',    'Terremoto']),       // Electivire
    P(295, 'Modesta', 'Insonorizar',    'gafaselec', {hp:252, spa:252, def:4}, ['Cabezazo',     'Triataque',       'Afilar',          'Hiperrayo']),       // Exploud: el altavoz
    P(849, 'Modesta', 'Punk Rock',      'flecha',    {spa:252, spe:252, hp:4}, ['Puya Nociva',  'Bomba Lodo',      'Carga',           'Trueno']),          // Toxtricity: la guitarra
    P(441, 'Modesta', 'Vista Lince',    'gafasesp',  {spa:252, spe:252, hp:4}, ['Ataque Ala',   'Tornado',         'Maquinación',     'Pájaro Osado'])     // Chatot: el que canta
  ]},
  {id:'jugador', file:'gambler.png', name:'Jugador', cls:'Jugador', theme:'Casino, suerte y cartas', tier:2, arena:'sabrina', team:[
    P( 53, 'Alegre',  'Flexibilidad',   'roca',      {atk:252, spe:252, hp:4}, ['Arañazo',      'Doble Filo',      'Danza Espada',    'Hiperrayo']),       // Persian: Pay Day
    P(302, 'Modesta', 'Bromista',       'gafasol',   {hp:252, spa:252, def:4}, ['Garra Umbría', 'Pulso Umbrío',    'Maquinación',     'Pulso Noche']),     // Sableye: las gemas
    P(468, 'Modesta', 'Bendición',      'gafasesp',  {spa:252, spe:252, hp:4}, ['Ataque Ala',   'Viento Feérico',  'Agilidad',        'Onda Certera']),    // Togekiss: la buena suerte
    P(122, 'Miedosa', 'Filtro',         'cuchara',   {spa:252, spe:252, hp:4}, ['Cabezazo Zen', 'Psicorrayo',      'Paz Mental',      'Psíquico'])         // Mr. Mime: el truco de cartas
  ]},
  {id:'motoristas', file:'hooligans.png', name:'Moteros', cls:'Gamberros', theme:'Veneno y bandas callejeras', tier:2, arena:'koga', team:[
    P(110, 'Osada',   'Levitación',     'restos',    {hp:252, def:252, spa:4}, ['Puya Nociva',  'Bomba Lodo',      'Armadura Ácida',  'Lanzamugre']),      // Weezing: el humo de la moto
    P(229, 'Miedosa', 'Absorbe Fuego',  'gafasol',   {spa:252, spe:252, hp:4}, ['Mordisco',     'Lanzallamas',     'Maquinación',     'Pulso Noche']),     // Houndoom: el perro de la banda
    P(435, 'Firme',   'Hedor',          'cinturon',  {hp:252, atk:252, spd:4}, ['Mordisco',     'Bomba Lodo',      'Maquinación',     'Pulso Noche']),     // Skuntank: el olor
    P(452, 'Firme',   'Armadura Batalla','periscopio',{hp:252, atk:252, def:4},['Puya Nociva',  'Disparo Lodo',    'Danza Espada',    'Terremoto'])        // Drapion: el matón
  ]},
  {id:'criador', file:'pokemonbreeder-gen4.png', name:'Criador Pokémon', cls:'Criador Pokémon', theme:'Eevee y sus evoluciones', tier:2, arena:'erika', team:[
    P(134, 'Modesta', 'Absorbe Agua',   'restos',    {hp:252, spa:252, def:4}, ['Acua Cola',    'Hidropulso',      'Danza Lluvia',    'Hidrobomba']),      // Vaporeon
    P(197, 'Cauta',   'Sincronía',      'cascabel',  {hp:252, spd:252, def:4}, ['Mordisco',     'Pulso Umbrío',    'Maquinación',     'Pulso Noche']),     // Umbreon
    P(470, 'Alegre',  'Clorofila',      'cintaelec', {atk:252, spe:252, hp:4}, ['Látigo Cepa',  'Doble Filo',      'Danza Espada',    'Terremoto']),       // Leafeon
    P(700, 'Modesta', 'Piel Feérica',   'gafasesp',  {hp:252, spa:252, def:4}, ['Carantoña',    'Voz Cautivadora', 'Campo Neblinoso', 'Fuerza Lunar'])     // Sylveon
  ]},
  {id:'medium', file:'psychic-gen6.png', name:'Médium', cls:'Médium', theme:'Poderes psíquicos', tier:2, arena:'sabrina', team:[
    P(282, 'Modesta', 'Sincronía',      'cuchara',   {spa:252, spe:252, hp:4}, ['Cabezazo Zen', 'Viento Feérico',  'Paz Mental',      'Psíquico']),        // Gardevoir
    P(579, 'Modesta', 'Muro Mágico',    'gafaselec', {hp:252, spa:252, def:4}, ['Cabezazo Zen', 'Psicorrayo',      'Paz Mental',      'Psíquico']),        // Reuniclus
    P(178, 'Miedosa', 'Sincronía',      'gafasesp',  {spa:252, spe:252, hp:4}, ['Ataque Ala',   'Confusión',       'Paz Mental',      'Psíquico']),        // Xatu
    P(678, 'Miedosa', 'Bromista',       'cuchara',   {spa:252, spe:252, hp:4}, ['Cabezazo Zen', 'Psicorrayo',      'Paz Mental',      'Psíquico'])         // Meowstic
  ]},
  {id:'coleccionista', file:'collector.png', name:'Coleccionista', cls:'Coleccionista', theme:'Antigüedades y objetos misteriosos', tier:2, arena:'agatha', team:[
    P(437, 'Osada',   'Levitación',     'restos',    {hp:252, def:252, spd:4}, ['Garra Metal',  'Psicorrayo',      'Defensa Férrea',  'Psíquico']),        // Bronzong: la campana antigua
    P(609, 'Modesta', 'Absorbe Fuego',  'gafaselec', {spa:252, spe:252, hp:4}, ['Lengüetazo',   'Lanzallamas',     'Maquinación',     'Bola Sombra']),     // Chandelure: la lámpara
    P(681, 'Modesta', 'Cambio Táctico', 'aguante',   {hp:252, spa:252, spd:4}, ['Garra Metal',  'Tinieblas',       'Defensa Férrea',  'Bola Sombra']),     // Aegislash: la espada antigua
    P(442, 'Modesta', 'Presión',        'gafasol',   {hp:252, spa:252, def:4}, ['Mordisco',     'Pulso Umbrío',    'Maquinación',     'Pulso Noche'])      // Spiritomb: la piedra clave
  ]},

  // ===================== DIFICULTAD 3 · DIFÍCIL (4 Pokémon) =====================
  {id:'guay', file:'entrenador-guay.png', name:'Entrenador Guay', cls:'Entrenador guay', theme:'Los cuatro pseudolegendarios', tier:3, arena:'lance', team:[
    P(445, 'Alegre',  'Piel Tosca',     'cintaelec', {atk:252, spe:252, hp:4}, ['Garra Dragón', 'Disparo Lodo',    'Danza Espada',    'Terremoto']),       // Garchomp
    P(376, 'Firme',   'Cuerpo Puro',    'vidasfera', {atk:252, hp:252, spd:4}, ['Garra Metal',  'Bomba Imán',      'Danza Espada',    'Terremoto']),       // Metagross
    P(373, 'Alegre',  'Intimidación',   'cinturon',  {atk:252, spe:252, hp:4}, ['Garra Dragón', 'Pulso Dragón',    'Danza Dragón',    'Terremoto']),       // Salamence
    P(248, 'Firme',   'Chorro Arena',   'aguante',   {atk:252, hp:252, spd:4}, ['Mordisco',     'Lanzarrocas',     'Pulimento',       'Roca Afilada'])     // Tyranitar
  ]},
  {id:'li', file:'li.png', name:'Maestro Li', cls:'Maestro monje', theme:'Meditación y artes del espíritu', tier:3, arena:'sabrina', team:[
    P(308, 'Alegre',  'Energía Pura',   'cinturon',  {atk:252, spe:252, hp:4}, ['Cabezazo Zen', 'Esfera Aural',    'Agilidad',        'Onda Certera']),    // Medicham: meditación
    P( 65, 'Miedosa', 'Foco Interno',   'cuchara',   {spa:252, spe:252, hp:4}, ['Cabezazo Zen', 'Psicorrayo',      'Paz Mental',      'Psíquico']),        // Alakazam
    P(199, 'Modesta', 'Regeneración',   'restos',    {hp:252, spa:252, def:4}, ['Cabezazo Zen', 'Hidropulso',      'Amnesia',         'Psíquico']),        // Slowking: el sabio
    P(297, 'Firme',   'Agallas',        'casco',     {hp:252, atk:252, spd:4}, ['Golpe Roca',   'Disparo Lodo',    'Corpulencia',     'Onda Certera'])     // Hariyama: la fuerza tranquila
  ]},
  {id:'magnus', file:'magnus.png', name:'Maestro Magnus', cls:'Maestro samurái', theme:'Espadas y honor', tier:3, arena:'azul', team:[
    P(503, 'Alegre',  'Torrente',       'vidasfera', {atk:252, spe:252, hp:4}, ['Acua Cola',    'Hidropulso',      'Danza Espada',    'Hidrobomba']),      // Samurott: la vieira-sable
    P(625, 'Firme',   'Rebelión',       'cinturon',  {atk:252, hp:252, spe:4}, ['Garra Metal',  'Pulso Umbrío',    'Danza Espada',    'Pulso Noche']),     // Bisharp: el filo
    P(589, 'Firme',   'Enjambre',       'casco',     {hp:252, atk:252, spd:4}, ['Tijera X',     'Bomba Imán',      'Defensa Férrea',  'Megacuerno']),      // Escavalier: la armadura
    P(983, 'Firme',   'Rebelión',       'aguante',   {hp:252, atk:252, spd:4}, ['Mordisco',     'Bomba Imán',      'Danza Espada',    'Pulso Noche'])      // Kingambit: el general
  ]},
  {id:'ocultista', file:'hexmaniac.png', name:'Ocultista', cls:'Ocultista', theme:'Fantasmas, maldiciones y sombras', tier:3, arena:'agatha', team:[
    P( 94, 'Miedosa', 'Cuerpo Maldito', 'gafasesp',  {spa:252, spe:252, hp:4}, ['Lengüetazo',   'Bomba Lodo',      'Maquinación',     'Bola Sombra']),     // Gengar: la sombra que ríe
    P(429, 'Miedosa', 'Levitación',     'cinturon',  {spa:252, spe:252, hp:4}, ['Garra Umbría', 'Psicorrayo',      'Paz Mental',      'Bola Sombra']),     // Mismagius: el hechizo
    P(609, 'Modesta', 'Absorbe Fuego',  'gafaselec', {spa:252, hp:252, spe:4}, ['Lengüetazo',   'Lanzallamas',     'Fuego Fatuo',     'Llamarada']),       // Chandelure: la llama de las almas
    P(477, 'Firme',   'Presión',        'restos',    {hp:252, atk:252, spd:4}, ['Puño Sombra',  'Pulso Umbrío',    'Maldición',       'Bola Sombra'])      // Dusknoir: el que se lleva las almas
  ]},
  {id:'ivor', file:'ivor.png', name:'Ivor', cls:'Luchador de puños', theme:'Puños de fuego, hielo, trueno y sombra', tier:3, arena:'bruno', team:[
    P(534, 'Firme',   'Agallas',        'chaleco',   {hp:252, atk:252, spd:4}, ['Puño Hielo',   'Lanzarrocas',     'Corpulencia',     'Onda Certera']),    // Conkeldurr: el puño de hormigón
    P(392, 'Alegre',  'Mar Llamas',     'vidasfera', {atk:252, spe:252, hp:4}, ['Puño Fuego',   'Lanzallamas',     'Danza Espada',    'Envite Ígneo']),    // Infernape: el mono de fuego
    P(448, 'Alegre',  'Justiciero',     'cinturon',  {atk:252, spe:252, hp:4}, ['Puño Trueno',  'Esfera Aural',    'Danza Espada',    'Onda Certera']),    // Lucario: el aura
    P(979, 'Firme',   'Foco Interno',   'aguante',   {hp:252, atk:252, spd:4}, ['Puño Sombra',  'Tinieblas',       'Corpulencia',     'Onda Certera'])     // Annihilape: la furia
  ]},
  {id:'kamado', file:'kamado.png', name:'Maestro Kamado', cls:'Maestro herrero', theme:'Forja, brasas y fuego eterno', tier:3, arena:'blaine', team:[
    P(839, 'Osada',   'Cuerpo Llama',   'restos',    {hp:252, def:252, spa:4}, ['Puño Fuego',   'Lanzallamas',     'Defensa Férrea',  'Llamarada']),       // Coalossal: el carbón vivo
    P(157, 'Modesta', 'Mar Llamas',     'gafasesp',  {spa:252, spe:252, hp:4}, ['Colmillo Ígneo','Lanzallamas',    'Día Soleado',     'Llamarada']),       // Typhlosion: la forja en la espalda
    P(637, 'Miedosa', 'Cuerpo Llama',   'cuchara',   {spa:252, spe:252, hp:4}, ['Tijera X',     'Lanzallamas',     'Danza Aleteo',    'Llamarada']),       // Volcarona: el sol pequeño
    P(467, 'Modesta', 'Cuerpo Llama',   'gafaselec', {spa:252, hp:252, spe:4}, ['Puño Trueno',  'Rayo',            'Fuego Fatuo',     'Llamarada'])           // Magmortar: el cañón de lava
  ]},
  {id:'kimono', file:'kimonogirl.png', name:'Chica Kimono', cls:'Bailarina', theme:'Danza, elegancia y kimonos', tier:3, arena:'sabrina', team:[
    P(350, 'Modesta', 'Escama Especial','gafasesp',  {hp:252, spa:252, spe:4}, ['Acua Cola',    'Rayo Hielo',      'Neblina',         'Hidrobomba']),      // Milotic: la belleza del agua
    P(282, 'Modesta', 'Sincronía',      'cuchara',   {spa:252, hp:252, spd:4}, ['Cabezazo Zen', 'Psicorrayo',      'Paz Mental',      'Fuerza Lunar']),    // Gardevoir: la bailarina de la luna
    P(549, 'Modesta', 'Clorofila',      'periscopio',{spa:252, spe:252, hp:4}, ['Látigo Cepa',  'Hoja Afilada',    'Danza Aleteo',    'Rayo Solar']),      // Lilligant: la danza de las flores
    P( 38, 'Miedosa', 'Absorbe Fuego',  'gafasol',   {spa:252, spe:252, hp:4}, ['Colmillo Ígneo','Lanzallamas',    'Fuego Fatuo',     'Llamarada'])        // Ninetales: las nueve colas
  ]},
  {id:'palmer', file:'palmer.png', name:'Palmer', cls:'Magnate de la Torre', theme:'Pesos pesados de la torre de batalla', tier:3, arena:'giovanni', team:[
    P(143, 'Firme',   'Sebo',           'restos',    {hp:252, atk:252, spd:4}, ['Golpe Cuerpo', 'Rayo Hielo',      'Amnesia',         'Hiperrayo']),       // Snorlax: el muro que duerme
    P(149, 'Alegre',  'Multiescala',    'cinturon',  {atk:252, spe:252, hp:4}, ['Garra Dragón', 'Pulso Dragón',    'Danza Dragón',    'Terremoto']),       // Dragonite: el dragón cartero
    P(464, 'Firme',   'Roca Sólida',    'casco',     {hp:252, atk:252, def:4}, ['Tumba Rocas',  'Disparo Lodo',    'Pulimento',       'Roca Afilada']),    // Rhyperior: el taladro
    P(473, 'Alegre',  'Manto Níveo',    'vidasfera', {atk:252, spe:252, hp:4}, ['Colmillo Hielo','Rayo Hielo',     'Maldición',       'Terremoto'])        // Mamoswine: el mamut helado
  ]},
  {id:'veterano', file:'veteran.png', name:'Veterano', cls:'Veterano', theme:'Los iniciales de Kanto y su fiel Arcanine', tier:3, arena:'azul', team:[
    P(  6, 'Miedosa', 'Mar Llamas',     'gafasesp',  {spa:252, spe:252, hp:4}, ['Garra Dragón', 'Lanzallamas',     'Danza Dragón',    'Llamarada']),       // Charizard: el dragón de fuego
    P(  9, 'Modesta', 'Torrente',       'restos',    {hp:252, spa:252, def:4}, ['Acua Cola',    'Hidropulso',      'Refugio',         'Hidrobomba']),      // Blastoise: el cañón de agua
    P(  3, 'Modesta', 'Espesura',       'chaleco',   {hp:252, spa:252, def:4}, ['Látigo Cepa',  'Bomba Lodo',      'Desarrollo',      'Rayo Solar']),      // Venusaur: la flor gigante
    P( 59, 'Alegre',  'Intimidación',   'cinturon',  {atk:252, spe:252, hp:4}, ['Colmillo Ígneo','Lanzallamas',    'Agilidad',        'Envite Ígneo'])     // Arcanine: el compañero
  ]},
  {id:'wikstrom', file:'wikstrom.png', name:'Duque Wikstrom', cls:'Caballero de acero', theme:'Armaduras, espadas y acero', tier:3, arena:'azul', team:[
    P(681, 'Modesta', 'Cambio Táctico', 'aguante',   {hp:252, spa:252, spd:4}, ['Garra Metal',  'Tinieblas',       'Danza Espada',    'Foco Resplandor']), // Aegislash: la espada del duque
    P(212, 'Firme',   'Técnico',        'vidasfera', {atk:252, hp:252, spe:4}, ['Puño Bala',    'Bomba Imán',      'Danza Espada',    'Megacuerno']),      // Scizor: el puño de acero
    P(823, 'Osada',   'Presión',        'restos',    {hp:252, def:252, atk:4}, ['Ataque Ala',   'Tajo Aéreo',      'Defensa Férrea',  'Pájaro Osado']),    // Corviknight: el corcel blindado
    P(530, 'Alegre',  'Chorro Arena',   'cinturon',  {atk:252, spe:252, hp:4}, ['Excavar',      'Bomba Imán',      'Danza Espada',    'Terremoto'])        // Excadrill: el taladro de acero
  ]}
];

// ---------------------------------------------------------------------
// COMBATE Y RECOMPENSA
// ---------------------------------------------------------------------
const campoById = id => CAMPO.find(T => T.id === id);
const CAMPO_BASTA_UNO = false;                                                        // false = hay que vencer a todos los de la dificultad · true = basta con uno
const campoNeeded = tier => CAMPO.filter(T => T.tier === tier && !T.opt);              // entrenadores que cuentan para superar una dificultad
const campoDone = tier => campoNeeded(tier).filter(T => save.campoWins[T.id]).length;  // cuántos de ellos has vencido
const campoCleared = tier => { const n = campoNeeded(tier).length; return n > 0 && (CAMPO_BASTA_UNO ? campoDone(tier) >= 1 : campoDone(tier) >= n); };
const campoOpen = tier => tier <= 1 || campoCleared(tier - 1);                         // Fácil siempre abierta · Media tras Fácil · Difícil tras Media
function campoFight(id){
  const T = campoById(id), S = campoStats(T);
  if(!campoOpen(T.tier)){ toast('Esta dificultad está bloqueada: supera antes la anterior.'); return; }
  startBattle({
    campo:true, campoId:id, floor:0, n:-1, leader:'campo_' + id, arena:'campo', portrait:'entrenadores/' + T.file,
    title:'CAMPO DE ENTRENAMIENTO', sub:`${T.name.toUpperCase()} · ${CAMPO_TIER[T.tier].nombre.toUpperCase()}`,
    enemies:T.team, hm:S.hm, dm:S.dm, skill:S.skill, spdm:S.spdm, lvl:S.lvl
  });
}
function campoEnd(won){                                    // lo llama endBattle (modes.js) cuando el combate es del Campo de Entrenamiento
  g.over = true;
  const o = g.o, T = campoById(o.campoId), b = $('rBtns'); b.innerHTML = '';
  const add = (t, fn, main) => { const x = document.createElement('button'); x.textContent = t; if(main) x.className = 'main'; x.onclick = fn; b.appendChild(x); };
  if(won){
    const before = campoCleared(T.tier); save.campoWins[T.id] = 1;
    giveReward({kind:'campo', tier:T.tier}, false); save.stats.campo = (save.stats.campo || 0) + 1; persist(); achSync(); refreshHud();   // 1 tirada + BP y chapas según la dificultad (Fácil 50 BP + 5+5 · Media 100 + 10+10 · Difícil 150 + 15+15), siempre; cuenta para los logros · la pantalla de victoria (victoria.js) las enseña con iconos
    const chips = [];
    if(!T.opt){
      const nd = campoNeeded(T.tier).length;
      if(!before && campoCleared(T.tier)) chips.push({t: T.tier < 3 ? `¡Has superado la dificultad ${CAMPO_TIER[T.tier].nombre}! Se desbloquea la ${CAMPO_TIER[T.tier + 1].nombre}.` : `¡Has superado la dificultad ${CAMPO_TIER[T.tier].nombre}: el Campo completo!`, c:'#ffcc33'});
      else if(!CAMPO_BASTA_UNO && !campoCleared(T.tier)) chips.push({t:`${CAMPO_TIER[T.tier].nombre}: ${campoDone(T.tier)} de ${nd} entrenadores vencidos`, c:'#4ccf6a'});
    }
    victoryScreen({title:`¡Has vencido a ${T.name}!`, sub:'', rewards:lastReward, chips, leader:o.leader, path:o.portrait});
    add('Otra vez', () => campoFight(T.id), true);
  }else{
    resultClear(); $('rTitle').textContent = `${T.name} ha ganado esta vez`; $('rText').textContent = 'Cambia el equipo o los objetos e inténtalo otra vez.';
    add('Reintentar', () => campoFight(T.id), true);
  }
  add('Campo de Entrenamiento', () => { g = null; openCampo(); });
  add('Menú', () => { g = null; goMain(); });
  setTimeout(() => { show('result'); Sfx.play(won ? 'win' : 'lose'); }, 900);
}

// ---------------------------------------------------------------------
// PANTALLA
// ---------------------------------------------------------------------
let campoTab = 0;                                                                     // dificultad que se está viendo (1, 2 o 3)
const campoColor = T => TC[mon(T.team[0].dex).types[0]] || '#8fb3e8';                  // color de la tarjeta = tipo del primer Pokémon del entrenador
const campoNext = () => { for(const t of [1, 2, 3]) if(campoOpen(t)){ const T = campoNeeded(t).find(x => !save.campoWins[x.id]); if(T) return T; } return null; };   // primer entrenador sin vencer
function openCampo(){
  const ready = team.length === 3;
  if(!(campoTab && campoOpen(campoTab) && !campoCleared(campoTab))){                  // al entrar se abre la primera dificultad que aún no has superado
    campoTab = [1, 2, 3].find(t => campoOpen(t) && !campoCleared(t)) || 3;
  }
  panel(`<div class="stbanner cpbanner"><h1>Campo de Entrenamiento</h1>
      <p>Combate todas las veces que quieras: perder no cuesta nada y cada victoria da siempre la misma recompensa. Gasta las Chapas en Equipo Pokémon › Ver datos para subir los IV y EV de tus Pokémon.</p>
      <div class="cp-rw"><span id="cpLab" class="cp-lab">Cada victoria:</span><span id="cpRw" class="lc-rw"></span></div>
      <div class="stchips"><span class="stc"><i id="cpIcoS"></i><b id="cmpS"></b> Chapas Plateadas</span><span class="stc gold"><i id="cpIcoG"></i><b id="cmpG"></b> Chapas Doradas</span>
        <label class="tsel cp-sel">Equipo <select id="cpTeamSel"></select></label><button id="cmpTeam" class="cp-team">Equipo Pokémon →</button></div></div>
    <p id="cmpWarn" class="warn"></p>
    <div id="cpTabs" class="cptabs"></div><div id="cpNote" class="cp-note"></div><div id="cmpList"></div>`);
  $('panelBody').classList.add('wide');
  $('cmpS').textContent = held('chapaplata'); $('cmpG').textContent = held('chapa'); $('cmpTeam').onclick = () => openTeam('campo');
  $('cpIcoS').appendChild(rwIcon('chapaplata', '#c9d6f5')); $('cpIcoG').appendChild(rwIcon('chapa', '#ffcc33'));
  fillTeamSel('cpTeamSel', openCampo);
  $('cmpWarn').textContent = ready ? '' : 'Elige 3 Pokémon en EQUIPO POKÉMON para poder combatir.';
  renderCampo();
}
function renderCampo(){
  const ready = team.length === 3, tier = campoTab, open = campoOpen(tier), nd = campoNeeded(tier).length;
  $('cpLab').textContent = 'Cada victoria (' + CAMPO_TIER[tier].nombre + '):'; $('cpRw').innerHTML = '';                      // la recompensa cambia con la dificultad
  Object.entries(rewardOf({kind:'campo', tier})).forEach(([id, n]) => { const c = document.createElement('span'); c.className = 'rwm'; c.title = REWARD_NAMES[id]; c.appendChild(rwIcon(id, (RW_LOOK[id] || {}).c || '#ffcc33')); c.append('×' + n); $('cpRw').appendChild(c); });
  dexThumbs.length = 0;
  // ---- pestañas de dificultad ----
  const tabs = $('cpTabs'); tabs.innerHTML = '';
  [1, 2, 3].forEach(t => {
    const o = campoOpen(t), n = campoNeeded(t).length, dn = campoDone(t), b = document.createElement('button');
    b.className = 'cptab' + (t === tier ? ' on' : '') + (o ? '' : ' lock') + (campoCleared(t) ? ' ok' : '');
    b.innerHTML = `<span class="cpt-n">${o ? '' : '🔒 '}${CAMPO_TIER[t].nombre}</span><span class="cpt-s">${'★'.repeat(t)} · nivel ${CAMPO_TIER[t].lvl}</span>` +
      `<span class="cpt-bar"><i style="width:${n ? Math.round(dn / n * 100) : 0}%"></i></span><span class="cpt-c">${campoCleared(t) ? '✓ Superada' : dn + ' de ' + n + ' vencidos'}</span>`;
    b.onclick = () => { campoTab = t; renderCampo(); };
    tabs.appendChild(b);
  });
  // ---- aviso + botón «ir al siguiente» ----
  const note = $('cpNote'); note.innerHTML = '';
  const prev = tier > 1 ? CAMPO_TIER[tier - 1].nombre : '', msg = document.createElement('span');
  msg.className = open ? 'cp-prog' : 'cp-lock';
  msg.textContent = !open ? `🔒 Bloqueada: vence a los ${campoNeeded(tier - 1).length} entrenadores de la dificultad ${prev} para desbloquearla (${campoDone(tier - 1)} de ${campoNeeded(tier - 1).length}).`
    : campoCleared(tier) ? '✓ Dificultad superada: puedes repetir los combates cuando quieras.' : `Entrenadores vencidos: ${campoDone(tier)} de ${nd}`;
  note.appendChild(msg);
  const nx = campoNext();
  if(nx){ const nb = document.createElement('button'); nb.className = 'cp-next'; nb.textContent = `Ir al siguiente sin vencer: ${nx.name} →`;
    nb.onclick = () => { campoTab = nx.tier; renderCampo(); const c = document.querySelector('#cmpList .lcard.cur'); if(c) c.scrollIntoView({behavior:'smooth', block:'center'}); };
    note.appendChild(nb); }
  // ---- tarjetas ----
  const list = $('cmpList'); list.innerHTML = '';
  const grid = document.createElement('div'); grid.className = 'lgrid cp'; list.appendChild(grid);
  const first = open ? campoNeeded(tier).find(x => !save.campoWins[x.id]) : null;
  CAMPO.filter(T => T.tier === tier).forEach(T => {
    const won = !!save.campoWins[T.id], col = campoColor(T);
    const d = document.createElement('div'); d.className = 'lcard campoc' + (won ? ' done' : '') + (first && first.id === T.id ? ' cur' : '') + (open ? '' : ' locked'); d.dataset.id = T.id; d.style.setProperty('--tc', col);
    const fr = document.createElement('div'); fr.className = 'lc-img';
    const im = new Image(); im.alt = T.name; im.src = 'entrenadores/' + T.file; fr.appendChild(im);
    if(T.opt){ d.classList.add('hide'); im.onload = () => d.classList.remove('hide'); }                      // opcional: solo se ve si existe su imagen
    else im.onerror = () => { im.style.visibility = 'hidden'; };
    if(won){ const md = document.createElement('span'); md.className = 'lc-medal'; md.textContent = '✓'; fr.appendChild(md); }
    const t = document.createElement('div'); t.className = 'lc-body';
    t.innerHTML = `<h3></h3><p class="lc-sub"><span class="tb"></span><span class="cp-th"></span></p>`;
    t.querySelector('h3').textContent = T.name; const tb = t.querySelector('.tb'); tb.textContent = T.cls; tb.style.background = col;
    t.querySelector('.cp-th').textContent = `${T.theme} · ${T.team.length} Pokémon`;
    const mini = document.createElement('div'); mini.className = 'lc-mini'; mini.title = 'Los Pokémon del entrenador (al pasar el ratón, su objeto)';
    T.team.forEach(sl => { const m = mon(sl.dex), c = document.createElement('canvas'); c.width = c.height = 64; c.title = `${m.name} · ${ITEMS[sl.item].n}`; mini.appendChild(c); dexThumbs.push({c, m}); });
    t.appendChild(mini);
    const bt = document.createElement('button'); bt.className = 'lc-btn ' + (!open ? 'lock' : won ? 'rep' : 'go'); bt.textContent = !open ? '🔒 Bloqueado' : won ? 'Repetir' : 'Combatir';
    bt.disabled = !ready || !open; bt.onclick = () => campoFight(T.id);
    d.append(fr, t, bt); grid.appendChild(d);
  });
}

// Comprobación de las reglas al cargar (junto con los equipos de los líderes)
{ const bad = validateTeams(); if(bad.length) console.warn('Plantillas de rivales con problemas:\n' + bad.join('\n')); }
