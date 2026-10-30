"use strict";
/* =====================================================================
   23) KALOS: 8 líderes de gimnasio, Alto Mando (4) y Campeona (Dianta), con sus equipos de 6 Pokémon
   Se carga DESPUÉS de teselia.js y ANTES de campo.js (que comprueba todos los equipos al final). No toca nada de las otras regiones.

   VERSIÓN DE REFERENCIA: Pokémon X e Y. Gimnasios en orden: Novarte (Violeta), Relieve (Lino), Yantra (Corelia), Tiriópolis (Amaro), Luminalia (Lem),
   Romantis (Valeria), Anistar (Ástrid) y Fractal (Édel). Alto Mando: Malva, Narciso, Tileo y Drácena. Campeona: Dianta.
   Los nombres son los españoles de WikiDex. Los ids con los que se llaman los retratos son los de la carpeta lideres/kalos/ (LEADER_FILE en data.js):
   Violeta=viola · Lino=grant · Corelia=korrina · Amaro=ramos · Lem=clemont · Valeria=valerie · Ástrid=olympia · Édel=wulfric ·
   Malva=malva · Narciso=siebold · Tileo=wikstrom · Drácena=drasna · Dianta=diantha.
   Fuentes: WikiDex («Liga Pokémon (Kalos)»: equipos oficiales de la Liga con niveles) y Bulbapedia / Serebii (equipos de los líderes de X e Y y del Torneo).

   CÓMO ESTÁ HECHO (igual que las otras regiones, ver teams.js y teselia.js):
     P(nº de Pokédex, 'Naturaleza', 'Habilidad', 'objeto', {EVs}, ['golpe', 'disparo', 'mejora', 'ataque fuerte'])
   - LÍDERES: en los juegos llevan 2-3 Pokémon, así que aquí cada uno lleva 6: los de X e Y más otros que usan en el anime y los juegos. El último es el As.
   - ALTO MANDO Y CAMPEONA: los 4 (Dianta, 6) Pokémon oficiales de X e Y, más 2 por Alto Mando de otros juegos.
   - SIN SPRITE: Pyroar (668) está en NO_SPRITE (data.js); Malva lleva a Houndoom en su lugar. Cuando tenga sprite, cámbialo aquí.
   - MEGAEVOLUCIÓN (fase siguiente): los Pokémon que megaevolucionan en X e Y (Lucario de Corelia, Gardevoir de Dianta, Manectric...) llevan el campo `mega`
     con el id de su forma (ver MEGA en js/mega.js). El motor todavía NO la usa: es solo el dato preparado.
   - Los movimientos son los más parecidos que permite el motor (4 huecos: golpe / disparo / mejora / ataque fuerte, ver MOVESET en moves.js).

   DIFICULTAD: lvl = nivel del rival · dn = índice de dificultad (DIFF en data.js). Kalos: dn 8-15 los líderes, 17-19 el Alto Mando y 22 Dianta (la más dura).
   RECOMPENSA: REWARD_REGION['Kalos'] (teams.js): 5 Chapas Doradas + 5 Plateadas + 10 tiradas de Gachapon por cada victoria.
   ===================================================================== */
// El campo `mega` lo ignora de momento todo el código: se añade a la plantilla con Object.assign para no cambiar P()
const PM = (mega, ...a) => Object.assign(P(...a), {mega});
Object.assign(TEAMS, {
  // ---------------- LÍDERES ----------------
  violeta: [   // Bicho · Ciudad Novarte (Viola). X e Y: Surskit y Vivillon · aquí también los bichos de su fotografía y del anime
    P(284, 'Modesta', 'Intimidación',  'gafasesp', {spa:252, spe:252, hp:4}, ['Ataque Ala',    'Zumbido',      'Danza Lluvia',  'Hidrobomba']),   // Masquerain
    P( 12, 'Modesta', 'Ojo Compuesto', 'restos',   {hp:252, spa:252, def:4}, ['Ataque Ala',    'Zumbido',      'Paz Mental',    'Psíquico']),     // Butterfree
    P(267, 'Modesta', 'Enjambre',      'gafasesp', {spa:252, spe:252, hp:4}, ['Tijera X',      'Zumbido',      'Danza Aleteo',  'Megacuerno']),   // Beautifly
    P(168, 'Firme',   'Enjambre',      'aguante',  {atk:252, spe:252, hp:4}, ['Puya Nociva',   'Pin Misil',    'Armadura Ácida','Megacuerno']),   // Ariados
    P(637, 'Modesta', 'Cuerpo Llama',  'vidasfera',{spa:252, spe:252, hp:4}, ['Colmillo Ígneo','Zumbido',      'Danza Aleteo',  'Llamarada']),    // Volcarona
    P(666, 'Modesta', 'Ojo Compuesto', 'chaleco',  {spa:252, spe:252, hp:4}, ['Ataque Ala',    'Tornado',      'Danza Aleteo',  'Megacuerno'])    // Vivillon: As
  ],
  lino: [      // Roca · Ciudad Relieve (Grant). X e Y: Amaura y Tyrunt (fósiles) · aquí sus formas finales y otros fósiles
    P( 76, 'Firme',   'Robustez',      'casco',    {hp:252, atk:252, def:4}, ['Tumba Rocas',   'Lanzarrocas',  'Defensa Férrea','Terremoto']),    // Golem
    P(348, 'Firme',   'Cabeza Roca',   'aguante',  {atk:252, spe:252, hp:4}, ['Tijera X',      'Lanzarrocas',  'Pulimento',     'Roca Afilada']), // Armaldo
    P(409, 'Firme',   'Cabeza Roca',   'vidasfera',{atk:252, spe:252, hp:4}, ['Tumba Rocas',   'Lanzarrocas',  'Pulimento',     'Terremoto']),    // Rampardos
    P(346, 'Osada',   'Ventosas',      'restos',   {hp:252, def:252, spa:4}, ['Látigo Cepa',   'Lanzarrocas',  'Amnesia',       'Rayo Solar']),   // Cradily
    P(699, 'Modesta', 'Manto Níveo',   'gafasesp', {spa:252, hp:252, def:4}, ['Tumba Rocas',   'Rayo Hielo',   'Pulimento',     'Ventisca']),     // Aurorus
    P(697, 'Firme',   'Piel Tosca',    'vidasfera',{atk:252, spe:252, hp:4}, ['Garra Dragón',  'Lanzarrocas',  'Danza Dragón',  'Roca Afilada'])  // Tyrantrum: As
  ],
  corelia: [   // Lucha · Ciudad Yantra (Korrina). X e Y: Mienfoo, Machoke y Hawlucha · el As es su Lucario (megaevoluciona)
    P(620, 'Alegre',  'Foco Interno',  'cintaelec',{atk:252, spe:252, hp:4}, ['Golpe Roca',    'Esfera Aural', 'Corpulencia',   'Onda Certera']),  // Mienshao
    P( 68, 'Firme',   'Intrépido',     'chaleco',  {hp:252, atk:252, def:4}, ['Golpe Roca',    'Esfera Aural', 'Corpulencia',   'Terremoto']),    // Machamp
    P(701, 'Alegre',  'Gran Encanto',  'vidasfera',{atk:252, spe:252, hp:4}, ['Ataque Ala',    'Esfera Aural', 'Corpulencia',   'Pájaro Osado']), // Hawlucha
    P(308, 'Firme',   'Foco Interno',  'aguante',  {atk:252, spe:252, hp:4}, ['Cabezazo Zen',  'Esfera Aural', 'Paz Mental',    'Onda Certera']), // Medicham
    P(237, 'Firme',   'Intimidación',  'restos',   {hp:252, atk:252, def:4}, ['Golpe Roca',    'Esfera Aural', 'Corpulencia',   'Terremoto']),    // Hitmontop
    PM('lucario', 448, 'Alegre', 'Justiciero','gafasesp',{atk:252, spe:252, hp:4}, ['Garra Metal',   'Esfera Aural', 'Corpulencia',   'Onda Certera'])   // Lucario: As (Lucarita)
  ],
  amaro: [     // Planta · Ciudad Tiriópolis (Ramos). X e Y: Weepinbell, Gogoat y Jumpluff
    P(189, 'Alegre',  'Clorofila',     'aguante',  {atk:252, spe:252, hp:4}, ['Látigo Cepa',   'Viento Feérico','Desarrollo',   'Rayo Solar']),   // Jumpluff
    P( 71, 'Modesta', 'Clorofila',     'vidasfera',{spa:252, spe:252, hp:4}, ['Látigo Cepa',   'Bomba Lodo',   'Desarrollo',    'Rayo Solar']),   // Victreebel
    P(357, 'Modesta', 'Clorofila',     'restos',   {hp:252, spa:252, def:4}, ['Ataque Ala',    'Hoja Afilada', 'Desarrollo',    'Rayo Solar']),   // Tropius
    P(272, 'Modesta', 'Llovizna',      'gafasesp', {spa:252, spe:252, hp:4}, ['Acua Cola',     'Hoja Afilada', 'Danza Lluvia',  'Hidrobomba']),   // Ludicolo
    P(465, 'Firme',   'Clorofila',     'chaleco',  {hp:252, atk:252, def:4}, ['Látigo Cepa',   'Hoja Afilada', 'Desarrollo',    'Terremoto']),    // Tangrowth
    P(673, 'Firme',   'Espesura',      'casco',    {hp:252, atk:252, def:4}, ['Látigo Cepa',   'Hoja Afilada', 'Desarrollo',    'Terremoto'])     // Gogoat: As
  ],
  lem: [       // Eléctrico · Ciudad Luminalia (Clemont). X e Y: Emolga, Magneton y Heliolisk
    P(702, 'Alegre',  'Pararrayos',    'aguante',  {atk:252, spe:252, hp:4}, ['Puño Trueno',   'Rayo',         'Carga',         'Trueno']),       // Dedenne
    P(587, 'Modesta', 'Absorbe Elec.', 'gafaselec',{spa:252, spe:252, hp:4}, ['Ataque Ala',    'Rayo',         'Carga',         'Trueno']),       // Emolga
    P(405, 'Firme',   'Intimidación',  'vidasfera',{atk:252, spe:252, hp:4}, ['Colmillo Rayo', 'Rayo',         'Carga',         'Trueno']),       // Luxray
    P(462, 'Modesta', 'Imán',          'gafasesp', {spa:252, spe:252, hp:4}, ['Puño Bala',     'Bomba Imán',   'Carga',         'Trueno']),       // Magnezone
    P(181, 'Modesta', 'Pararrayos',    'restos',   {hp:252, spa:252, def:4}, ['Puño Trueno',   'Rayo',         'Carga',         'Foco Resplandor']), // Ampharos
    P(695, 'Modesta', 'Piel Seca',     'vidasfera',{spa:252, spe:252, hp:4}, ['Colmillo Rayo', 'Rayo',         'Carga',         'Trueno'])        // Heliolisk: As
  ],
  valeria: [   // Hada · Ciudad Romantis (Valerie). X e Y: Spritzee, Mawile y Sylveon
    P(210, 'Firme',   'Intimidación',  'chaleco',  {hp:252, atk:252, def:4}, ['Carantoña',     'Viento Feérico','Corpulencia',  'Terremoto']),    // Granbull
    P(303, 'Firme',   'Intimidación',  'aguante',  {atk:252, hp:252, def:4}, ['Garra Metal',   'Viento Feérico','Defensa Férrea','Terremoto']),   // Mawile
    P( 36, 'Modesta', 'Muro Mágico',   'restos',   {hp:252, spa:252, def:4}, ['Carantoña',     'Viento Feérico','Campo Neblinoso','Fuerza Lunar']), // Clefable
    P(468, 'Modesta', 'Dicha',         'gafasesp', {hp:252, spa:252, def:4}, ['Ataque Ala',    'Viento Feérico','Paz Mental',   'Fuerza Lunar']), // Togekiss
    P(282, 'Modesta', 'Sincronía',     'vidasfera',{spa:252, spe:252, hp:4}, ['Cabezazo Zen',  'Voz Cautivadora','Paz Mental',  'Fuerza Lunar']), // Gardevoir
    P(700, 'Modesta', 'Piel Feérica',  'gafasesp', {hp:252, spa:252, def:4}, ['Carantoña',     'Voz Cautivadora','Paz Mental',  'Fuerza Lunar'])  // Sylveon: As
  ],
  astrid: [    // Psíquico · Ciudad Anistar (Olympia). X e Y: Sigilyph, Slowking y Meowstic
    P(561, 'Modesta', 'Impulso',       'gafasesp', {spa:252, spe:252, hp:4}, ['Ataque Ala',    'Psicorrayo',   'Paz Mental',    'Psíquico']),     // Sigilyph
    P(199, 'Modesta', 'Ritmo Propio',  'restos',   {hp:252, spa:252, def:4}, ['Cabezazo Zen',  'Rayo Hielo',   'Paz Mental',    'Psíquico']),     // Slowking
    P(606, 'Modesta', 'Analítico',     'gafaselec',{spa:252, hp:252, def:4}, ['Cabezazo Zen',  'Psicorrayo',   'Paz Mental',    'Psíquico']),     // Beheeyem
    P(576, 'Modesta', 'Sin Guarda',    'chaleco',  {hp:252, spa:252, def:4}, ['Cabezazo Zen',  'Confusión',    'Paz Mental',    'Psíquico']),     // Gothitelle
    PM('alakazam', 65, 'Modesta', 'Sincronía',  'gafasesp',{spa:252, spe:252, hp:4}, ['Cabezazo Zen', 'Psicorrayo', 'Paz Mental', 'Psíquico']),    // Alakazam
    P(678, 'Modesta', 'Cromolente',    'vidasfera',{spa:252, spe:252, hp:4}, ['Cabezazo Zen',  'Psicorrayo',   'Paz Mental',    'Psíquico'])      // Meowstic: As
  ],
  edel: [      // Hielo · Ciudad Fractal (Wulfric). X e Y: Abomasnow, Cryogonal y Avalugg
    P(460, 'Firme',   'Nevada',        'restos',   {hp:252, atk:252, def:4}, ['Puño Hielo',    'Rayo Hielo',   'Neblina',       'Ventisca']),     // Abomasnow
    P(615, 'Modesta', 'Levitación',    'gafasesp', {spa:252, spe:252, hp:4}, ['Colmillo Hielo','Rayo Hielo',   'Neblina',       'Ventisca']),     // Cryogonal
    P(461, 'Alegre',  'Presión',       'vidasfera',{atk:252, spe:252, hp:4}, ['Colmillo Hielo','Rayo Hielo',   'Maquinación',   'Pulso Noche']),  // Weavile
    P(471, 'Modesta', 'Cuerpo Gélido', 'gafasesp', {spa:252, spe:252, hp:4}, ['Colmillo Hielo','Rayo Hielo',   'Neblina',       'Ventisca']),     // Glaceon
    P(365, 'Firme',   'Sebo',          'chaleco',  {hp:252, atk:252, def:4}, ['Puño Hielo',    'Rayo Hielo',   'Neblina',       'Terremoto']),    // Walrein
    P(713, 'Firme',   'Cuerpo Gélido', 'casco',    {hp:252, atk:252, def:4}, ['Colmillo Hielo','Rayo Hielo',   'Tormenta de Arena','Terremoto'])  // Avalugg: As
  ],
  // ---------------- ALTO MANDO (los 4 de la Liga, más 2 de otros juegos) ----------------
  malva: [     // Fuego · Malva. Liga: Pyroar, Torkoal, Chandelure, Talonflame (Pyroar no tiene sprite: lo sustituye Houndoom)
    P(229, 'Modesta', 'Absorbe Fuego', 'gafasesp', {spa:252, spe:252, hp:4}, ['Colmillo Ígneo','Lanzallamas',  'Día Soleado',   'Llamarada']),    // Houndoom (en vez de Pyroar)
    P(324, 'Modesta', 'Sequía',        'restos',   {hp:252, spa:252, def:4}, ['Colmillo Ígneo','Lanzallamas',  'Día Soleado',   'Llamarada']),    // Torkoal
    P(323, 'Modesta', 'Roca Sólida',   'chaleco',  {hp:252, spa:252, def:4}, ['Tumba Rocas',   'Lanzallamas',  'Día Soleado',   'Terremoto']),    // Camerupt
    P( 59, 'Modesta', 'Intimidación',  'vidasfera',{spa:252, spe:252, hp:4}, ['Colmillo Ígneo','Pulso Dragón', 'Día Soleado',   'Llamarada']),    // Arcanine
    P(609, 'Modesta', 'Cuerpo Llama',  'gafaselec',{spa:252, spe:252, hp:4}, ['Puño Sombra',   'Lanzallamas',  'Maldición',     'Bola Sombra']),  // Chandelure
    P(663, 'Alegre',  'Mar Llamas',    'vidasfera',{atk:252, spe:252, hp:4}, ['Ataque Ala',    'Tajo Aéreo',   'Viento Afín',   'Pájaro Osado'])  // Talonflame: As
  ],
  narciso: [   // Agua · Narciso (Siebold). Liga: Clawitzer, Gyarados, Starmie, Barbaracle
    P(693, 'Modesta', 'Megadisparo',   'gafasesp', {spa:252, spe:252, hp:4}, ['Acua Cola',     'Hidropulso',   'Danza Lluvia',  'Hidrobomba']),   // Clawitzer
    P(130, 'Alegre',  'Intimidación',  'aguante',  {atk:252, spe:252, hp:4}, ['Acua Cola',     'Hidropulso',   'Danza Dragón',  'Terremoto']),    // Gyarados
    P(121, 'Modesta', 'Absorbe Agua',  'vidasfera',{spa:252, spe:252, hp:4}, ['Acua Cola',     'Psicorrayo',   'Danza Lluvia',  'Hidrobomba']),   // Starmie
    P(350, 'Modesta', 'Escama Especial','restos',  {hp:252, spa:252, def:4}, ['Acua Cola',     'Hidropulso',   'Danza Lluvia',  'Hidrobomba']),   // Milotic
    P(230, 'Modesta', 'Francotirador', 'gafasesp', {spa:252, spe:252, hp:4}, ['Acua Cola',     'Pulso Dragón', 'Danza Dragón',  'Hidrobomba']),   // Kingdra
    P(689, 'Firme',   'Piel Tosca',    'cintaelec',{atk:252, hp:252, def:4}, ['Acua Cola',     'Lanzarrocas',  'Pulimento',     'Roca Afilada'])  // Barbaracle: As
  ],
  tileo: [     // Acero · Tileo (Wikstrom). Liga: Klefki, Probopass, Scizor, Aegislash
    P(707, 'Osada',   'Bromista',      'restos',   {hp:252, def:252, spa:4}, ['Carantoña',     'Bomba Imán',   'Defensa Férrea','Foco Resplandor']), // Klefki
    P(476, 'Modesta', 'Roca Sólida',   'chaleco',  {hp:252, spa:252, def:4}, ['Tumba Rocas',   'Bomba Imán',   'Defensa Férrea','Foco Resplandor']), // Probopass
    P(625, 'Firme',   'Intrépido',     'vidasfera',{atk:252, spe:252, hp:4}, ['Garra Metal',   'Pulso Umbrío', 'Maquinación',   'Pulso Noche']),    // Bisharp
    P(212, 'Firme',   'Técnico',       'aguante',  {atk:252, hp:252, def:4}, ['Puño Bala',     'Pin Misil',    'Danza Espada',  'Megacuerno']),     // Scizor
    P(376, 'Firme',   'Cuerpo Puro',   'cintaelec',{atk:252, hp:252, def:4}, ['Puño Bala',     'Psicorrayo',   'Defensa Férrea','Terremoto']),      // Metagross
    P(681, 'Modesta', 'Cambio Táctico','vidasfera',{hp:252, spa:252, def:4}, ['Garra Metal',   'Tinieblas',    'Defensa Férrea','Bola Sombra'])     // Aegislash: As
  ],
  dracena: [   // Dragón · Drácena (Drasna). Liga: Dragalge, Altaria, Druddigon, Noivern
    P(691, 'Modesta', 'Toque Tóxico',  'gafasesp', {spa:252, spe:252, hp:4}, ['Puya Nociva',   'Pulso Dragón', 'Danza Dragón',  'Lanzamugre']),   // Dragalge
    P(334, 'Modesta', 'Cura Natural',  'restos',   {hp:252, spa:252, def:4}, ['Ataque Ala',    'Dragoaliento', 'Danza Dragón',  'Cometa Draco']), // Altaria
    P(621, 'Firme',   'Piel Tosca',    'casco',    {hp:252, atk:252, def:4}, ['Garra Dragón',  'Lanzarrocas',  'Danza Espada',  'Terremoto']),    // Druddigon
    P(330, 'Alegre',  'Levitación',    'aguante',  {atk:252, spe:252, hp:4}, ['Garra Dragón',  'Lanzarrocas',  'Danza Dragón',  'Terremoto']),    // Flygon
    P(612, 'Alegre',  'Rompemoldes',   'vidasfera',{atk:252, spe:252, hp:4}, ['Garra Dragón',  'Pulso Dragón', 'Danza Dragón',  'Terremoto']),    // Haxorus
    P(715, 'Modesta', 'Infiltrador',   'gafasesp', {spa:252, spe:252, hp:4}, ['Ataque Ala',    'Pulso Dragón', 'Danza Dragón',  'Cometa Draco'])  // Noivern: As
  ],
  // ---------------- CAMPEONA ----------------
  dianta: [    // Dianta (Diantha), Campeona de Kalos. Liga: Hawlucha, Aurorus, Tyrantrum, Gourgeist, Goodra, Gardevoir (megaevoluciona)
    P(701, 'Alegre',  'Gran Encanto',  'aguante',  {atk:252, spe:252, hp:4}, ['Ataque Ala',    'Esfera Aural', 'Corpulencia',   'Pájaro Osado']), // Hawlucha
    P(699, 'Modesta', 'Manto Níveo',   'gafasesp', {spa:252, hp:252, def:4}, ['Tumba Rocas',   'Rayo Hielo',   'Pulimento',     'Ventisca']),     // Aurorus
    P(697, 'Firme',   'Piel Tosca',    'vidasfera',{atk:252, spe:252, hp:4}, ['Garra Dragón',  'Lanzarrocas',  'Danza Dragón',  'Roca Afilada']), // Tyrantrum
    P(711, 'Firme',   'Cosecha',       'restos',   {hp:252, atk:252, def:4}, ['Puño Sombra',   'Bomba Lodo',   'Maldición',     'Bola Sombra']),  // Gourgeist
    P(706, 'Modesta', 'Hidratación',   'chaleco',  {hp:252, spa:252, def:4}, ['Garra Dragón',  'Pulso Dragón', 'Danza Dragón',  'Cometa Draco']), // Goodra
    PM('gardevoir', 282, 'Modesta', 'Sincronía','gafasesp',{spa:252, spe:252, hp:4}, ['Cabezazo Zen', 'Voz Cautivadora', 'Paz Mental', 'Fuerza Lunar'])   // Gardevoir: As (Gardevoirita)
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
  KF('tileo',   'Tileo',   'Acero',     'alto',  162, 19, 'Liga Pokémon'),
  KF('dracena', 'Drácena', 'Dragón',    'alto',  163, 19, 'Liga Pokémon'),
  KF('dianta',  'Dianta',  'Campeona',  'campeon', 170, 22, 'Liga Pokémon')
);
floorsOf(KALOS).forEach((F, i) => F.idx = i);                           // posición dentro de Kalos (0 = Violeta)
