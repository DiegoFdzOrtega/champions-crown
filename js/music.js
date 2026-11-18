"use strict";
/* =====================================================================
   19) MÚSICA DINÁMICA: un tema para el menú y uno para cada tipo de combate (líderes, Alto Mando y Campeones de Kanto y Johto)

   CÓMO FUNCIONA (en sencillo)
   - Pones tus archivos de audio en la carpeta  assets/musica/  con el nombre de cada pista (ver MUSIC_TRACKS): assets/musica/menu.mp3,
     assets/musica/lider_kanto.mp3, assets/musica/lider_johto.mp3, assets/musica/alto_kanto.mp3, assets/musica/alto_johto.mp3, assets/musica/campeon_azul.mp3,
     assets/musica/campeon_lance.mp3 y assets/musica/campo.mp3. El juego los encuentra solo.
   - Si una pista NO tiene archivo, suena una música original "chiptune" que genera el propio juego (sin ficheros), así nunca hay silencio.
     Cuando añadas el archivo, empieza a usarse sin tocar nada más.
   - Los archivos no vienen incluidos: los temas oficiales de Pokémon son de Nintendo / Game Freak, así que tienes que poner tú los tuyos.

   TÉCNICA
   - Se usa la API Web Audio (AudioContext): los archivos se descargan y decodifican UNA vez y se repiten en bucle SIN cortes
     (mejor que <audio loop>, que suele dejar un hueco). Los cambios de pista son fundidos (fade out de la vieja + fade in de la nueva).
   - Los navegadores no dejan sonar nada hasta que el jugador hace clic o pulsa una tecla; la música empieza en ese primer gesto.
   - Si abres index.html con doble clic (file://) el navegador no deja leer los archivos con fetch(); entonces se usa un <audio> normal.
     (Mejor abrirlo con un servidor local o con GitHub Pages.)
   - Volumen (Ajustes › Audio): save.vol = GLOBAL, save.volMenu = música del menú, save.volBattle = música de combate, save.volSfx = efectos (0-100 cada uno) y save.mute = silenciar todo (tecla M).
     Volumen final de la música del menú = global x menú · de la de combate = global x combate · de los efectos = global x efectos. Pausa (Esc): la música baja de volumen.
   - EFECTOS DE SONIDO (Sfx): pitidos cortos generados por código, sin archivos: 'click' (botones), 'win', 'lose' (resultado del combate), 'logro' y 'mega' (megaevolución).
     Sfx.play('click'). Para añadir uno: una línea en SFX (lista de notas: f = frecuencia, at = cuándo, d = duración, w = onda, v = volumen, to = frecuencia final).
     GOLPES DE COMBATE (los lanza hit() en js/combat.js según la eficacia del tipo): 'hit' (normal), 'hit_super' (muy eficaz: más fuerte, crujido y doble impacto), 'hit_weak' (poco eficaz: sordo y flojo),
     'hit_none' (sin efecto/inmune), 'crit' (chispa extra del crítico), 'dodge' (esquiva), 'dash' (carrera con Espacio), 'faint' (se debilita). AL LANZAR un ataque (use() en combat.js): 'swing' (cuerpo a cuerpo), 'shot' (disparo), 'buff' (mejora Q), 'status' (ataque de estado) y 'strong' (ataque fuerte E, con carga y «bum»). Sfx.play(nombre, k): k = 0-1 baja el volumen (los ataques del rival de la Historia suenan a 0,6). Además de notas con osciladores, una nota puede ser ruido filtrado (n:1, ft = filtro, f/to = frecuencia, q) y x:1 hace que el tono baje en curva.

   PARA EL PROGRAMADOR
     Music.play('menu')     Music.battle(o)  (lo llama startBattle)     Music.scene('main')  (lo llama show())
     Music.stop(seg)        Music.setVolume(0-100) = global   Music.setMenuVolume(0-100)   Music.setBattleVolume(0-100)   Music.setSfxVolume(0-100)
     Music.setMute(bool)    Music.toggleMute()   Music.duck(true/false)   Sfx.play(nombre)
     Music.probe([ids])     promesa: para cada pista dice si usa 'archivo' o 'generada'
   ===================================================================== */

const MUSIC_DIR = 'assets/musica/';
const MUSIC_EXT = ['ogg', 'mp3'];     // extensiones que se buscan, en orden. Añade 'wav' si usas ese formato: ['ogg', 'mp3', 'wav']

// ---------------------------------------------------------------------
// PISTAS. name = cómo se muestra · ref = qué tema oficial encaja (orientativo, para que sepas qué buscar)
// file: nombre del archivo (sin extensión) si no quieres que se llame como la pista; así varias pistas pueden compartir el mismo archivo. Puede llevar carpeta: 'Kalos/Combate Lideres' = assets/musica/Kalos/Combate Lideres.ogg (una carpeta por región)
// win: id de la pista de victoria que suena (una vez) al ganar · once:true = esa pista no se repite
// loop: [inicio, fin] en segundos, si la pista tiene una intro que no debe repetirse (si no, repite entera)
// synth = receta de la música generada cuando no hay archivo: bpm, tónica (nº MIDI), escala, acordes (grados), ritmo, sonido...
// ---------------------------------------------------------------------
const SCALES = {major:[0,2,4,5,7,9,11], minor:[0,2,3,5,7,8,10], dorian:[0,2,3,5,7,9,10], phrygian:[0,1,3,5,7,8,10], harmonic:[0,2,3,5,7,8,11]};
const MUSIC_TRACKS = {
  menu:         {name:'Menú y gestión del equipo', ref:'Música tranquila de menús (p. ej. un Centro Pokémon o un pueblo de HGSS)',
                 synth:{seed:11, bpm:78,  root:60, scale:'major',    prog:[0,5,3,4],      bass:'calm',  lead:'calm',  pad:true, arp:false, drums:'none',   density:.45}},
  lider_kanto:  {name:'Líderes de Kanto', file:'Kanto/Combate Lideres y Alto Mando', win:'win_lider_kanto',          ref:'"Battle! Gym Leader" de Kanto (Corazón de Oro/Alma de Plata o Rojo Fuego/Verde Hoja)',
                 synth:{seed:21, bpm:148, root:57, scale:'minor',    prog:[0,5,3,4],      bass:'drive', lead:'drive', pad:false, arp:false, drums:'rock',   density:.7}},
  lider_johto:  {name:'Líderes de Johto', file:'Johto/Combate Lideres y Alto Mando', win:'win_lider_johto',          ref:'"Battle! Gym Leader" de Johto (Corazón de Oro/Alma de Plata)',
                 synth:{seed:22, bpm:152, root:62, scale:'dorian',   prog:[0,3,6,4],      bass:'drive', lead:'drive', pad:false, arp:false, drums:'rock',   density:.75}},
  alto_kanto:   {name:'Alto Mando de Kanto', file:'Kanto/Combate Lideres y Alto Mando', win:'win_lider_kanto',       ref:'"Battle! Elite Four" (Rojo Fuego/Verde Hoja o Corazón de Oro/Alma de Plata)',
                 synth:{seed:31, bpm:160, root:52, scale:'harmonic', prog:[0,5,6,4],      bass:'drive', lead:'drive', pad:false, arp:true,  drums:'double', density:.8}},
  alto_johto:   {name:'Alto Mando de Johto', file:'Johto/Combate Lideres y Alto Mando', win:'win_lider_johto',       ref:'"Battle! Elite Four" (Corazón de Oro/Alma de Plata)',
                 synth:{seed:32, bpm:164, root:54, scale:'phrygian', prog:[0,1,5,4],      bass:'drive', lead:'drive', pad:false, arp:true,  drums:'double', density:.8}},
  campeon_azul: {name:'Campeón Azul (Kanto)', file:'Kanto/Combate Campeon Azul',      ref:'"Battle! Champion" / Rival de Kanto (Rojo Fuego/Verde Hoja o Corazón de Oro/Alma de Plata)',
                 synth:{seed:41, bpm:172, root:55, scale:'minor',    prog:[0,5,2,6],      bass:'drive', lead:'epic',  pad:true,  arp:true,  drums:'double', density:.85}},
  campeon_lance:{name:'Campeón Lance (Johto)', file:'Johto/Combate Campeon',     ref:'"Battle! Champion" de Lance (Oro/Plata/Cristal o Corazón de Oro/Alma de Plata)',
                 synth:{seed:42, bpm:176, root:58, scale:'harmonic', prog:[0,5,3,6],      bass:'drive', lead:'epic',  pad:true,  arp:true,  drums:'double', density:.9}},
  lider_hoenn:  {name:'Líderes de Hoenn', file:'Hoenn/Combate Lideres', win:'win_lider_hoenn',          ref:'"Battle! Gym Leader" de Hoenn (Rubí/Zafiro/Esmeralda)',
                 synth:{seed:23, bpm:156, root:60, scale:'major',    prog:[0,4,5,3],      bass:'drive', lead:'drive', pad:false, arp:false, drums:'rock',   density:.78}},
  alto_hoenn:   {name:'Alto Mando de Hoenn', file:'Hoenn/Combate Alto Mando', win:'win_lider_hoenn',       ref:'"Battle! Elite Four" de Hoenn (Rubí/Zafiro/Esmeralda)',
                 synth:{seed:33, bpm:166, root:53, scale:'harmonic', prog:[0,6,5,4],      bass:'drive', lead:'drive', pad:false, arp:true,  drums:'double', density:.82}},
  campeon_plubio:{name:'Campeón Plubio (Hoenn)', file:'Hoenn/Combate Campeon', win:'win_campeon_hoenn',  ref:'"Battle! Champion" de Hoenn (Esmeralda)',
                 synth:{seed:43, bpm:174, root:57, scale:'major',    prog:[0,5,3,4],      bass:'drive', lead:'epic',  pad:true,  arp:true,  drums:'double', density:.9}},
  lider_sinnoh: {name:'Líderes de Sinnoh', file:'Sinnoh/Combate Lideres', win:'win_lider_sinnoh',          ref:'"Battle! Gym Leader" de Sinnoh (Diamante/Perla/Platino)',
                 synth:{seed:24, bpm:150, root:59, scale:'dorian',   prog:[0,5,4,3],      bass:'drive', lead:'drive', pad:false, arp:false, drums:'rock',   density:.78}},
  alto_sinnoh:  {name:'Alto Mando de Sinnoh', file:'Sinnoh/Combate Alto Mando', win:'win_lider_sinnoh',      ref:'"Battle! Elite Four" de Sinnoh (Diamante/Perla/Platino)',
                 synth:{seed:34, bpm:168, root:55, scale:'minor',    prog:[0,3,6,4],      bass:'drive', lead:'drive', pad:false, arp:true,  drums:'double', density:.82}},
  campeon_cintia:{name:'Campeona Cynthia (Sinnoh)', file:'Sinnoh/Combate Campeona Cintia', win:'win_campeon_sinnoh', ref:'"Battle! Champion" de Sinnoh (Diamante/Perla/Platino)',
                 synth:{seed:44, bpm:178, root:56, scale:'harmonic', prog:[0,5,6,4],      bass:'drive', lead:'epic',  pad:true,  arp:true,  drums:'double', density:.92}},
  lider_teselia:{name:'Líderes de Teselia', file:'Unova/Combate Lideres', win:'win_lider_teselia',          ref:'"Battle! Gym Leader" de Teselia (Negro/Blanco)',
                 synth:{seed:25, bpm:160, root:61, scale:'minor',    prog:[0,5,3,4],      bass:'drive', lead:'drive', pad:false, arp:false, drums:'rock',   density:.8}},
  alto_teselia: {name:'Alto Mando de Teselia', file:'Unova/Combate Alto Mando', win:'win_lider_teselia',     ref:'"Battle! Elite Four" de Teselia (Negro/Blanco)',
                 synth:{seed:35, bpm:170, root:56, scale:'harmonic', prog:[0,6,3,4],      bass:'drive', lead:'drive', pad:false, arp:true,  drums:'double', density:.84}},
  campeon_mirto:{name:'Campeón Mirto (Teselia)', file:'Unova/Combate Campeon', win:'win_campeon_teselia',   ref:'"Battle! Champion" de Teselia (Negro/Blanco)',
                 synth:{seed:45, bpm:180, root:58, scale:'minor',    prog:[0,5,6,4],      bass:'drive', lead:'epic',  pad:true,  arp:true,  drums:'double', density:.94}},
  // Temas de victoria (suenan UNA vez al ganar). Los que no tienen (Azul y Lance) usan el jingle de siempre
  win_lider_kanto:   {name:'Victoria: Líderes y Alto Mando de Kanto',   file:'Kanto/Victoria Lideres y Alto Mando',  once:true, ref:'"Victory! Gym Leader" de Kanto'},
  win_lider_johto:   {name:'Victoria: Líderes y Alto Mando de Johto',   file:'Johto/Victoria Lideres y Alto Mando',  once:true, ref:'"Victory! Gym Leader" de Johto'},
  win_lider_hoenn:   {name:'Victoria: Líderes y Alto Mando de Hoenn',   file:'Hoenn/Victoria Lideres y Alto Mando',  once:true, ref:'"Victory! Gym Leader" de Hoenn'},
  win_campeon_hoenn: {name:'Victoria: Campeón de Hoenn',                file:'Hoenn/Victoria Campeon',               once:true, ref:'"Victory! Champion" de Hoenn'},
  win_lider_sinnoh:  {name:'Victoria: Líderes y Alto Mando de Sinnoh',  file:'Sinnoh/Victoria Lideres y Alto Mando', once:true, ref:'"Victory! Gym Leader" (usada en Sinnoh)'},
  win_campeon_sinnoh:{name:'Victoria: Campeona de Sinnoh',              file:'Sinnoh/Victoria Campeona',             once:true, ref:'"Victory! Champion" de Sinnoh'},
  win_lider_teselia: {name:'Victoria: Líderes y Alto Mando de Teselia', file:'Unova/Victoria Lideres y Alto Mando',  once:true, ref:'"Victory! Gym Leader" de Teselia'},
  win_campeon_teselia:{name:'Victoria: Campeón de Teselia',             file:'Unova/Victoria Campeon',               once:true, ref:'"Victory! Champion" de Teselia'},
  // Kalos: los archivos están en la carpeta assets/musica/Kalos/ (una carpeta por región) con nombres que dicen para qué son. win = el tema de victoria que suena al ganar (once = suena una vez, sin repetir)
  lider_kalos:  {name:'Líderes de Kalos', file:'Kalos/Combate Lideres', win:'win_lider_kalos',          ref:'"Battle! Gym Leader" de Kalos (X/Y)',
                 synth:{seed:26, bpm:158, root:62, scale:'major',    prog:[0,4,5,3],      bass:'drive', lead:'drive', pad:false, arp:false, drums:'rock',   density:.8}},
  alto_kalos:   {name:'Alto Mando de Kalos', file:'Kalos/Combate Alto Mando', win:'win_lider_kalos',  ref:'"Battle! Elite Four" de Kalos (X/Y)',
                 synth:{seed:36, bpm:168, root:57, scale:'harmonic', prog:[0,5,6,4],      bass:'drive', lead:'drive', pad:false, arp:true,  drums:'double', density:.84}},
  campeon_dianta:{name:'Campeona Dianta (Kalos)', file:'Kalos/Combate Campeona', win:'win_campeon_kalos', ref:'"Battle! Champion" de Kalos (X/Y)',
                 synth:{seed:46, bpm:178, root:59, scale:'major',    prog:[0,5,3,4],      bass:'drive', lead:'epic',  pad:true,  arp:true,  drums:'double', density:.92}},
  win_lider_kalos:  {name:'Victoria: Líderes y Alto Mando de Kalos', file:'Kalos/Victoria Lideres',  once:true, ref:'"Victory! Gym Leader" de Kalos (X/Y)'},
  win_campeon_kalos:{name:'Victoria: Campeona de Kalos',            file:'Kalos/Victoria Campeona', once:true, ref:'"Victory! Champion" de Kalos (X/Y)'},
  // Alola: carpeta assets/musica/Alola/ con los mismos nombres que Kalos (Combate Lideres, Combate Alto Mando, Combate Campeon, Victoria Lideres, Victoria Campeon). Si falta un archivo suena la música generada de abajo
  lider_alola:  {name:'Líderes de Alola', file:'Alola/Combate Lideres', win:'win_lider_alola',          ref:'"Battle! Trainer / Kahuna" de Alola (Sol y Luna)',
                 synth:{seed:27, bpm:150, root:64, scale:'major',    prog:[0,3,4,5],      bass:'drive', lead:'drive', pad:false, arp:false, drums:'rock',   density:.8}},
  alto_alola:   {name:'Alto Mando de Alola', file:'Alola/Combate Alto Mando', win:'win_lider_alola',  ref:'"Battle! Elite Four" de Alola (Sol y Luna)',
                 synth:{seed:37, bpm:164, root:59, scale:'harmonic', prog:[0,4,5,3],      bass:'drive', lead:'drive', pad:false, arp:true,  drums:'double', density:.84}},
  campeon_kukui:{name:'Campeón Kukui (Alola)', file:'Alola/Combate Campeon', win:'win_campeon_alola', ref:'"Battle! Champion" de Alola (Sol y Luna)',
                 synth:{seed:47, bpm:176, root:62, scale:'major',    prog:[0,5,3,4],      bass:'drive', lead:'epic',  pad:true,  arp:true,  drums:'double', density:.92}},
  win_lider_alola:  {name:'Victoria: Líderes y Alto Mando de Alola', file:'Alola/Victoria Lideres',  once:true, ref:'"Victory! Trainer" de Alola (Sol y Luna)'},
  win_campeon_alola:{name:'Victoria: Campeón de Alola',            file:'Alola/Victoria Campeon', once:true, ref:'"Victory! Champion" de Alola (Sol y Luna)'},
  // Galar: carpeta assets/musica/Galar/ (Combate Lideres, Combate Campeon, Victoria Lideres, Victoria Campeon). Berto (Copa de Campeones) usa la de los líderes. Si falta un archivo suena la música generada
  lider_galar:  {name:'Líderes de Galar', file:'Galar/Combate Lideres', win:'win_lider_galar',          ref:'"Battle! Gym Leader" de Galar (Espada y Escudo)',
                 synth:{seed:28, bpm:158, root:62, scale:'minor',    prog:[0,5,3,4],      bass:'drive', lead:'drive', pad:false, arp:true,  drums:'rock',   density:.82}},
  alto_galar:   {name:'Copa de Campeones de Galar', file:'Galar/Combate Lideres', win:'win_lider_galar', ref:'"Battle! Champion Cup" de Galar (Espada y Escudo)',
                 synth:{seed:38, bpm:166, root:57, scale:'harmonic', prog:[0,4,5,3],      bass:'drive', lead:'drive', pad:false, arp:true,  drums:'double', density:.86}},
  campeon_galar:{name:'Campeón Lionel (Galar)', file:'Galar/Combate Campeon', win:'win_campeon_galar', ref:'"Battle! Champion Leon" de Galar (Espada y Escudo)',
                 synth:{seed:48, bpm:178, root:60, scale:'major',    prog:[0,5,3,4],      bass:'drive', lead:'epic',  pad:true,  arp:true,  drums:'double', density:.94}},
  win_lider_galar:  {name:'Victoria: Líderes de Galar', file:'Galar/Victoria Lideres',  once:true, ref:'"Victory! Gym Leader" de Galar (Espada y Escudo)'},
  win_campeon_galar:{name:'Victoria: Campeón de Galar', file:'Galar/Victoria Campeon', once:true, ref:'"Victory! Champion" de Galar (Espada y Escudo)'},
  torre:        {name:'Torre Batalla', file:'Kalos/Combate Alto Mando', win:'win_lider_kalos', ref:'"Battle! Elite Four" de Kalos (X/Y): épica, para subir piso a piso',
                 synth:{seed:58, bpm:150, root:57, scale:'minor',    prog:[0,5,3,4],      bass:'drive', lead:'epic',  pad:true,  arp:true,  drums:'double', density:.85}},
  campo:        {name:'Campo de Entrenamiento', file:'Alola/Combate Lideres', win:'win_lider_alola', ref:'"Battle! Trainer / Kahuna" de Alola (Sol y Luna). Para poner otra: cambia file por la ruta de tu archivo en assets/musica (sin .ogg)',
                 synth:{seed:51, bpm:138, root:60, scale:'major',    prog:[0,3,4,0],      bass:'drive', lead:'drive', pad:false, arp:false, drums:'rock',   density:.7}}
};

// ---------------------------------------------------------------------
// QUÉ PISTA SUENA CON CADA ENTRENADOR (id del combate -> pista). Para darle una pista propia a uno: crea una pista nueva
// arriba (p. ej. 'brock') con su archivo assets/musica/brock.mp3 y cambia aquí su línea a 'brock'.
// ---------------------------------------------------------------------
const MUSIC_BY_TRAINER = {
  // Kanto: 8 líderes, Alto Mando (4) y Campeón
  brock:'lider_kanto', misty:'lider_kanto', lt_surge:'lider_kanto', erika:'lider_kanto', koga:'lider_kanto', sabrina:'lider_kanto', blaine:'lider_kanto', giovanni:'lider_kanto',
  lorelei:'alto_kanto', bruno:'alto_kanto', agatha:'alto_kanto', lance:'alto_kanto',
  azul:'campeon_azul',
  // Johto: 8 líderes, Alto Mando (4) y Campeón
  pegaso:'lider_johto', anton:'lider_johto', blanca:'lider_johto', morti:'lider_johto', anibal:'lider_johto', yasmina:'lider_johto', fredo:'lider_johto', debora:'lider_johto',
  mento:'alto_johto', j_koga:'alto_johto', j_bruno:'alto_johto', karen:'alto_johto',
  j_lance:'campeon_lance',
  // Hoenn: 8 líderes, Alto Mando (4) y Campeón
  petra:'lider_hoenn', marcial:'lider_hoenn', erico:'lider_hoenn', candela:'lider_hoenn', norman:'lider_hoenn', alana:'lider_hoenn', vitoleti:'lider_hoenn', galano:'lider_hoenn',
  sixto:'alto_hoenn', fatima:'alto_hoenn', nivea:'alto_hoenn', dracon:'alto_hoenn',
  plubio:'campeon_plubio',
  // Sinnoh: 8 líderes, Alto Mando (4) y Campeona
  roco:'lider_sinnoh', gardenia:'lider_sinnoh', fantina:'lider_sinnoh', brega:'lider_sinnoh', mananti:'lider_sinnoh', aceron:'lider_sinnoh', inverna:'lider_sinnoh', lectro:'lider_sinnoh',
  alecran:'alto_sinnoh', gaia:'alto_sinnoh', fausto:'alto_sinnoh', delos:'alto_sinnoh',
  cintia:'campeon_cintia',
  // Teselia: 8 líderes (Gres son tres hermanos: Zeo, Maíz y Millo), Alto Mando (4) y Campeón
  zeo:'lider_teselia', maiz:'lider_teselia', millo:'lider_teselia', aloe:'lider_teselia', camus:'lider_teselia', camila:'lider_teselia', yakon:'lider_teselia', gerania:'lider_teselia', junco:'lider_teselia', iris:'lider_teselia',
  anis:'alto_teselia', aza:'alto_teselia', lotto:'alto_teselia', catleya:'alto_teselia',
  mirto:'campeon_mirto',
  // Kalos: 8 líderes, Alto Mando (4) y Campeona
  violeta:'lider_kalos', lino:'lider_kalos', corelia:'lider_kalos', amaro:'lider_kalos', lem:'lider_kalos', valeria:'lider_kalos', astrid:'lider_kalos', edel:'lider_kalos',
  malva:'alto_kalos', narciso:'alto_kalos', tileo:'alto_kalos', agata:'alto_kalos',
  dianta:'campeon_dianta',
  // Alola: 7 líderes, Alto Mando (4; Acerola del Alto Mando = acerola_am) y Campeón Kukui
  ilima:'lider_alola', lana:'lider_alola', kiawe:'lider_alola', mallow:'lider_alola', sophocles:'lider_alola', acerola:'lider_alola', mina:'lider_alola',
  hala:'alto_alola', olivia:'alto_alola', acerola_am:'alto_alola', kahili:'alto_alola',
  kukui:'campeon_kukui',
  // Galar: 10 líderes, Berto (Copa de Campeones) y Campeón Lionel
  percy:'lider_galar', cathy:'lider_galar', naboru:'lider_galar', judith:'lider_galar', alistair:'lider_galar', sally:'lider_galar', morris:'lider_galar', mel:'lider_galar', nerio:'lider_galar', roy:'lider_galar',
  berto:'alto_galar', lionel:'campeon_galar'
};
// Si un combate nuevo (otra región) no está en la lista, se elige por región y tipo: lider_<región>, alto_<región>, campeon_<región>; si no existe, la de Kanto.
function musicTrackFor(o){
  if(o.torre && !o.boss) return 'torre';                                    // Torre Batalla: su propia pista (los jefes llevan la suya)
  if(o.campo) return 'campo';
  if(MUSIC_BY_TRAINER[o.leader]) return MUSIC_BY_TRAINER[o.leader];
  const F = FLOORS.find(x => x.id === o.leader), k = F ? ({lider:'lider', alto:'alto', campeon:'campeon'})[F.kind] : 'lider', r = F ? F.region.toLowerCase() : 'kanto';
  return [`${k}_${r}`, `${k}_kanto`, 'lider_kanto'].find(id => MUSIC_TRACKS[id]);
}

const Music = (() => {
  const FADE = 1.4;                                              // segundos del fundido al cambiar de pista
  let ctx = null, master = null, analyser = null, cur = null, want = null, token = 0, ducked = false, unlocked = false, noiseBuf = null;
  const cache = {};                                              // id -> promesa de {kind:'buffer'|'element'|'synth', ...}
  const els = new Set();                                         // pistas que usan <audio> (se ajusta su volumen a mano)
  const live = new Set();                                        // pistas WebAudio que están sonando (buffer o generadas)
  const clamp01 = v => Math.max(0, Math.min(1, v));
  // Volumen final. Curva suave (el oído no es lineal) y un tope para que la música no tape los efectos.
  const curve = v => Math.pow(clamp01((+v) / 100), 1.6);
  // Música = general x (menú o combate) . Cada pista lleva su propio volumen: 'menu' usa save.volMenu; todas las demás (combates y victorias) usan save.volBattle.
  const gv = () => (save.mute ? 0 : curve(save.vol ?? 100)) * (ducked ? .35 : 1);                                    // parte común a todas las pistas
  const tv = id => curve(id === 'menu' ? (save.volMenu ?? 70) : (save.volBattle ?? 70));                              // parte de cada pista
  const vol = () => gv() * .9;                                                                                       // ganancia del canal maestro (.9 deja un poco de margen para que la música generada no sature)
  const sfxVol = () => save.mute ? 0 : curve(save.vol ?? 100) * curve(save.volSfx ?? 80) * .5;                       // efectos = global x efectos

  function ensureCtx(){
    if(ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return false;
    ctx = new AC(); master = ctx.createGain(); analyser = ctx.createAnalyser(); analyser.fftSize = 512;
    master.connect(analyser); analyser.connect(ctx.destination); master.gain.value = vol();
    return true;
  }
  function applyVol(){
    if(master){ const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setTargetAtTime(vol(), t, .05); }
    els.forEach(h => { h.el.volume = clamp01(h.level * tv(h.id) * gv()); });
    live.forEach(h => { if(h.setLevel) h.setLevel(); });                                  // pistas WebAudio: reajusta su volumen propio (menú / combate)
  }

  // ---- Un "manejador" por pista que suena: {id, kind, ramp(a, seg), stop()} ----
  function rampNode(g, to, secs){ const t = ctx.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(to, t + Math.max(.01, secs)); }
  function makeBuffer(id, src){
    const g = ctx.createGain(); g.gain.value = 0; g.connect(master);
    const s = ctx.createBufferSource(); s.buffer = src.buf; s.loop = !MUSIC_TRACKS[id].once;                                       // bucle sin cortes
    const lp = MUSIC_TRACKS[id].loop; if(lp){ s.loopStart = lp[0]; s.loopEnd = lp[1]; }
    s.connect(g); s.start();
    return webaudioHandle({id, kind:'file', stop(){ try{ s.stop(); }catch(e){} g.disconnect(); }}, g);
  }
  // Pista WebAudio con volumen propio: ramp(a, seg) sube/baja el nivel relativo (0-1) y el volumen de su tipo (menú / combate) se multiplica aparte
  function webaudioHandle(h, g){
    h.rel = 0;
    h.ramp = (to, secs) => { h.rel = to; rampNode(g, to * tv(h.id), secs); };
    h.setLevel = () => { const t = ctx.currentTime; g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(h.rel * tv(h.id), t, .05); };
    const st = h.stop; h.stop = () => { live.delete(h); st(); }; live.add(h);
    return h;
  }
  function makeElement(id, src){
    const el = new Audio(src.url); el.loop = !(MUSIC_TRACKS[id] && MUSIC_TRACKS[id].once); el.volume = 0; const h = {id, kind:'file', el, level:0, timer:0};
    els.add(h); el.play().catch(() => {});
    h.ramp = (to, secs) => { clearInterval(h.timer); const from = h.level, t0 = performance.now();
      h.timer = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / (Math.max(.01, secs) * 1000)); h.level = from + (to - from) * k; applyVol(); if(k >= 1) clearInterval(h.timer); }, 40); };
    h.stop = () => { clearInterval(h.timer); el.pause(); els.delete(h); };
    return h;
  }

  // ---- Música generada (original, sin archivos) ----
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function tone(out, type, m, t, dur, peak, atk, rel){
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = mtof(m);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + (atk || .005)); g.gain.setValueAtTime(peak, t + Math.max(atk || .005, dur - (rel || .04))); g.gain.linearRampToValueAtTime(0, t + dur + .02);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .05);
  }
  // Ruido blanco de 1 s. OJO: NO usa Math.random. En el combate online (js/pvp.js) Math.random se cambia por el azar compartido mientras se calcula cada paso, y los golpes
  // suenan dentro de ese paso: si el ruido se creara con Math.random, el primer golpe gastaría números del azar compartido solo en el ordenador que aún no lo tuviera creado y los dos combates se descuadrarían.
  function getNoise(){
    if(noiseBuf) return noiseBuf;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noiseBuf.getChannelData(0); let a = 123456789;
    for(let i = 0; i < d.length; i++){ a ^= a << 13; a ^= a >>> 17; a ^= a << 5; d[i] = ((a >>> 0) / 4294967296) * 2 - 1; }
    return noiseBuf;
  }
  function noise(out, t, dur, peak, hp){
    getNoise();
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noiseBuf; s.loop = true; f.type = 'highpass'; f.frequency.value = hp;
    g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + dur + .02);
  }
  function kick(out, t){
    const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + .12);
    g.gain.setValueAtTime(.55, t); g.gain.exponentialRampToValueAtTime(.001, t + .2); o.connect(g); g.connect(out); o.start(t); o.stop(t + .22);
  }
  const DRUMS = {                                                // 16 pasos por compás: k = bombo, s = caja, h = platillo
    none:   {k:'', s:'', h:''},
    rock:   {k:'x...x..x..x.....', s:'....x.......x...', h:'x.x.x.x.x.x.x.x.'},
    double: {k:'x..xx..xx..x..x.', s:'....x.......x..x', h:'xxxxxxxxxxxxxxxx'}
  };
  // Compone el plan de 8 compases (siempre igual para la misma pista: la semilla fija la melodía)
  function compose(S){
    const R = rng(S.seed), sc = SCALES[S.scale], note = d => S.root + 12 * Math.floor(d / 7) + sc[((d % 7) + 7) % 7];
    const motif = chordDeg => {                                  // 2 compases (32 pasos) de melodía que pasea por la escala
      let pos = chordDeg + 7, out = [];
      for(let s = 0; s < 32; s++){
        const strong = s % 8 === 0, on = s % 2 === 0 ? R() < S.density + .2 : R() < S.density * .35;
        if(strong || on){ if(strong){ pos = chordDeg + 7 + [0, 2, 4, 7][(R() * 4) | 0]; } else { pos += [-2, -1, -1, 1, 1, 2][(R() * 6) | 0]; pos = Math.max(chordDeg + 3, Math.min(chordDeg + 12, pos)); } out.push(pos); }
        else out.push(null);
      }
      return out;
    };
    const A = motif(S.prog[0]), B = motif(S.prog[S.prog.length - 1]), plan = [];
    for(let b = 0; b < 8; b++){
      const d = S.prog[b % S.prog.length], chord = [d, d + 2, d + 4].map(note), mel = (b < 4 ? (b < 2 ? A : A.map((v, i) => i > 22 ? B[i] : v)) : (b < 6 ? B : A)), half = (b % 2) * 16, steps = [];
      for(let s = 0; s < 16; s++){
        const m = mel[half + s], arpI = [0, 1, 2, 1][s % 4], oct = S.lead === 'epic' && b >= 4 ? 12 : 0;
        steps.push({
          lead: m === null ? null : note(m) + oct, arp: S.arp ? chord[arpI] + 12 : null,
          bass: S.bass === 'calm' ? (s % 8 === 0 ? chord[0] - 24 : null) : (s % 2 === 0 ? chord[0] - 24 + (s % 8 === 6 ? 12 : 0) : null),
          pad: S.pad && s === 0 ? chord.map(c => c - 12) : null,
          k: DRUMS[S.drums].k[s] === 'x', sn: DRUMS[S.drums].s[s] === 'x', h: DRUMS[S.drums].h[s] === 'x'
        });
      }
      plan.push(steps);
    }
    return plan;
  }
  function makeSynth(id){
    const S = MUSIC_TRACKS[id].synth, plan = compose(S), g = ctx.createGain(); g.gain.value = 0; g.connect(master);
    const spb = 60 / S.bpm / 4, lead = S.lead === 'calm' ? 'triangle' : 'square';
    let step = 0, next = ctx.currentTime + .08;
    const timer = setInterval(() => {                            // programa las notas con 0,6 s de antelación (así no se entrecorta)
      while(next < ctx.currentTime + .6){
        const e = plan[Math.floor(step / 16) % plan.length][step % 16], t = next;
        if(e.lead !== null) tone(g, lead, e.lead, t, spb * (S.lead === 'calm' ? 3.2 : 1.6), S.lead === 'calm' ? .11 : .075, .01, .05);
        if(e.arp !== null) tone(g, 'square', e.arp, t, spb * .8, .035, .004, .03);
        if(e.bass !== null) tone(g, 'triangle', e.bass, t, spb * (S.bass === 'calm' ? 7 : 1.7), .2, .006, .05);
        if(e.pad) e.pad.forEach(m => tone(g, 'sine', m, t, spb * 15.5, .045, .25, .4));
        if(e.k) kick(g, t); if(e.sn) noise(g, t, .12, .22, 1500); if(e.h) noise(g, t, .035, .06, 7000);
        step++; next += spb;
      }
    }, 120);
    return webaudioHandle({id, kind:'generada', stop(){ clearInterval(timer); g.disconnect(); }}, g);
  }

  // ---- Carga: archivo de assets/musica/ si existe; si no, música generada ----
  const probeElement = url => new Promise(res => { const a = new Audio(); const done = ok => { clearTimeout(tm); a.onerror = a.oncanplaythrough = null; res(ok); }; const tm = setTimeout(() => done(false), 4000);
    a.oncanplaythrough = () => done(true); a.onerror = () => done(false); a.preload = 'auto'; a.src = url; });
  function load(id){
    return cache[id] || (cache[id] = (async () => {
      for(const ext of MUSIC_EXT){
        const url = encodeURI(MUSIC_DIR + ((MUSIC_TRACKS[id] && MUSIC_TRACKS[id].file) || id) + '.' + ext);          // (file puede llevar carpeta y espacios: 'Kalos/Combate Lideres')
        try{
          if(location.protocol === 'file:'){ if(await probeElement(url)) return {kind:'element', url}; continue; }      // file://: fetch no puede leer archivos locales
          const r = await fetch(url); if(!r.ok) continue;
          return {kind:'buffer', buf: await ctx.decodeAudioData(await r.arrayBuffer())};
        }catch(e){ console.warn('Música: no se pudo leer', url, e.message || e); }
      }
      return {kind:'synth'};
    })());
  }
  const make = (id, src) => src.kind === 'buffer' ? makeBuffer(id, src) : src.kind === 'element' ? makeElement(id, src) : makeSynth(id);
  function fadeOut(h, secs){ if(!h || h.dying) return; h.dying = true; h.ramp(0, secs); setTimeout(() => h.stop(), secs * 1000 + 100); }

  // ---- API ----
  function play(id, secs){
    want = id; if(!MUSIC_TRACKS[id] || !unlocked || !ensureCtx()) return;
    if(cur && cur.id === id && !cur.dying) return;                                  // ya suena
    const my = ++token;
    load(id).then(src => {
      if(my !== token) return;                                                      // mientras cargaba se pidió otra cosa
      const old = cur, h = make(id, src); cur = h; h.ramp(1, secs ?? FADE); fadeOut(old, secs ?? FADE);
    });
  }
  function stop(secs){ want = null; token++; if(cur){ fadeOut(cur, secs ?? FADE); cur = null; } }
  function battle(o){ play(musicTrackFor(o), .8); }
  function win(o){                                                                  // tema de victoria (una vez) del combate o; devuelve una promesa: true si suena, false si no tiene (entonces suena el jingle)
    const t = MUSIC_TRACKS[musicTrackFor(o)], id = t && t.win;
    if(!id || !MUSIC_TRACKS[id] || !unlocked || !ensureCtx()) return Promise.resolve(false);
    const my = ++token;
    return load(id).then(src => {
      if(my !== token || src.kind === 'synth') return false;                        // se pidió otra cosa o no hay archivo
      const old = cur, h = make(id, src); cur = h; want = null; h.ramp(1, .4); fadeOut(old, .4); return true;
    });
  }
  function scene(w){                                                                // lo llama show(): 'none' = combate, 'result' = pantalla final, el resto = menús
    if(w === 'none') return;
    if(w === 'result'){ stop(1.6); return; }
    play('menu');
  }
  const pct = v => Math.max(0, Math.min(100, Math.round(+v || 0)));
  function setVolume(v){ save.vol = pct(v); persist(); applyVol(); }                // volumen GLOBAL
  function setMenuVolume(v){ save.volMenu = pct(v); persist(); applyVol(); }          // música del menú
  function setBattleVolume(v){ save.volBattle = pct(v); persist(); applyVol(); }      // música de combate (y de victoria)
  function setSfxVolume(v){ save.volSfx = pct(v); persist(); }

  // ---- Efectos de sonido: notas sueltas con osciladores (sin archivos) ----
  const SFX = {
    click: [{f:880, at:0, d:.045, w:'square', v:.35}],
    logro: [{f:523, at:0, d:.12, w:'triangle', v:.8}, {f:659, at:.1, d:.12, w:'triangle', v:.8}, {f:784, at:.2, d:.12, w:'triangle', v:.8}, {f:1047, at:.3, d:.4, w:'triangle', v:.9}],
    win:   [{f:523, at:0, d:.14, w:'square', v:.5}, {f:659, at:.14, d:.14, w:'square', v:.5}, {f:784, at:.28, d:.14, w:'square', v:.5}, {f:1047, at:.42, d:.5, w:'square', v:.55}],
    recall:[{f:1500, at:0, d:.38, w:'sawtooth', v:.28, to:260}, {f:900, at:.05, d:.3, w:'square', v:.12, to:200}],
    sendout:[{f:500, at:0, d:.1, w:'triangle', v:.5, to:900}, {f:1200, at:.08, d:.25, w:'triangle', v:.5, to:1800}, {f:1800, at:.2, d:.3, w:'sine', v:.35}],
    mega:  [{f:180, at:0, d:1.5, w:'sawtooth', v:.2, to:900}, {f:360, at:0, d:1.5, w:'triangle', v:.22, to:1800},                                          // subida de energía hasta el destello (1,5 s)
            ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({f:1200 + i * 150, at:.3 + i * .12, d:.1, w:'sine', v:.18})),                                       // brillos
            {f:523, at:1.5, d:1.1, w:'triangle', v:.55}, {f:659, at:1.5, d:1.1, w:'triangle', v:.5}, {f:784, at:1.5, d:1.1, w:'triangle', v:.5}, {f:1047, at:1.55, d:1.2, w:'square', v:.28}],   // acorde final
    lose:  [{f:392, at:0, d:.22, w:'sawtooth', v:.4}, {f:330, at:.22, d:.22, w:'sawtooth', v:.4}, {f:262, at:.44, d:.5, w:'sawtooth', v:.4, to:200}],
    // ---- Golpes de combate (como en los juegos: seco, fuerte y crujiente, o sordo y flojo). n:1 = ruido con filtro (ft = tipo, f = frecuencia, to = frecuencia final, q = resonancia); x:1 = el tono baja en curva (golpe de verdad) ----
    hit:      [{f:190, to:55, x:1, at:0, d:.15, w:'sine', v:.95},                                                        // 'tump' medio
               {n:1, ft:'bandpass', f:1900, to:900, q:.8, at:0, d:.08, v:.6}, {n:1, ft:'lowpass', f:900, to:300, at:0, d:.13, v:.45}],
    hit_super:[{f:240, to:45, x:1, at:0, d:.24, w:'sine', v:1}, {f:95, to:60, x:1, at:0, d:.14, w:'square', v:.3},       // golpe fuerte y pesado...
               {n:1, ft:'highpass', f:1300, at:0, d:.18, v:.85}, {n:1, ft:'bandpass', f:5200, to:1600, q:1.2, at:0, d:.22, v:.55},   // ...con crujido agudo...
               {f:170, to:40, x:1, at:.075, d:.22, w:'sine', v:.85}, {n:1, ft:'bandpass', f:3200, to:1400, q:1, at:.075, d:.12, v:.5}],   // ...y un segundo impacto encima
    hit_weak: [{f:120, to:62, x:1, at:0, d:.13, w:'sine', v:.5}, {n:1, ft:'lowpass', f:520, to:220, at:0, d:.11, v:.32}],    // flojo y apagado
    hit_none: [{n:1, ft:'bandpass', f:420, to:260, q:.7, at:0, d:.09, v:.16}, {f:95, to:70, x:1, at:0, d:.08, w:'sine', v:.14}],   // casi nada: no le hace daño
    crit:     [{n:1, ft:'highpass', f:2600, at:0, d:.07, v:.55}, {f:1760, at:.01, d:.09, w:'triangle', v:.28}, {f:2349, at:.07, d:.14, w:'triangle', v:.25}],   // se suma al golpe
    dash:     [{n:1, ft:'bandpass', f:300, to:3800, q:1.8, at:0, d:.14, v:1.5}, {n:1, ft:'bandpass', f:3600, to:700, q:1.3, at:.1, d:.2, v:.85},
               {f:900, to:2600, at:0, d:.12, w:'sine', v:.14}, {n:1, ft:'lowpass', f:600, to:120, at:0, d:.14, v:.6},   // carrera (como el vídeo de Rojo vs Cintia): '¡fiuuush!' que sube y baja...
               {f:150, to:55, x:1, at:0, d:.09, w:'sine', v:.6}, {n:1, ft:'highpass', f:6000, at:.02, d:.1, v:.2}, {f:2093, to:3136, at:.04, d:.08, w:'triangle', v:.07}],   // ...con el golpe del pie, el aire y un brillo
    dash_old: [{n:1, ft:'bandpass', f:500, to:2600, q:1.1, at:0, d:.2, v:1.1}, {n:1, ft:'lowpass', f:900, to:250, at:0, d:.16, v:.35}],   // la carrera de antes
    charge2:  [{f:110, to:440, at:0, d:2, w:'sawtooth', v:.1}, {f:220, to:880, at:0, d:2, w:'sine', v:.1}, {n:1, ft:'bandpass', f:200, to:3200, q:3, at:0, d:2, v:.4},   // carga del ataque fuerte (2 s): sube y sube...
               {n:1, ft:'lowpass', f:180, to:420, at:0, d:2, v:.35}, {n:1, ft:'highpass', f:6000, at:1.5, d:.5, v:.16}],                                                       // ...con un retumbo debajo
    swords:   [{n:1, ft:'bandpass', f:900, to:3000, q:2, at:0, d:.25, v:.6}, {f:2637, to:3520, at:.18, d:.18, w:'triangle', v:.18}, {f:3136, at:.3, d:.25, w:'sine', v:.16},   // Danza Espada: «¡sshing!» de espadas...
               {n:1, ft:'highpass', f:6000, at:.3, d:.3, v:.25}, {f:3951, at:.45, d:.3, w:'sine', v:.12}, {f:523, to:1046, at:.95, d:.35, w:'triangle', v:.2}, {f:784, to:1568, at:1.05, d:.35, w:'triangle', v:.18}],   // ...y sube el Ataque
    v_ready:  [{f:1568, at:0, d:.1, w:'triangle', v:.22}, {f:2093, at:.05, d:.22, w:'sine', v:.2}, {n:1, ft:'highpass', f:5000, at:0, d:.16, v:.18}],   // el ataque fuerte ya está cargado: ¡tin!
    impact4:  [{f:75, to:28, x:1, at:0, d:.55, w:'sine', v:1}, {n:1, ft:'lowpass', f:2400, to:90, at:0, d:.5, v:.9}, {n:1, ft:'highpass', f:3000, at:0, d:.12, v:.65},   // golpe de «cuadro de impacto»: ¡BUM! grave...
               {f:55, to:30, x:1, at:.09, d:.4, w:'square', v:.22}, {n:1, ft:'bandpass', f:5200, to:1500, q:1, at:.02, d:.25, v:.4}],          // ...con crujido
    canto:    [{f:1047, at:0, d:.24, w:'sine', v:.2}, {f:1319, at:.24, d:.24, w:'sine', v:.2}, {f:1568, at:.48, d:.34, w:'sine', v:.22}, {f:1319, at:.82, d:.22, w:'sine', v:.18},
               {f:1175, at:1.04, d:.22, w:'sine', v:.18}, {f:1047, at:1.26, d:.5, w:'sine', v:.2}, {f:523, at:0, d:.7, w:'triangle', v:.07}, {f:392, at:.7, d:1.05, w:'triangle', v:.07}],   // Canto: nana suave (do-mi-sol-mi-re-do)
    aura_cast:[{f:300, to:1200, at:0, d:.22, w:'sine', v:.25}, {f:305, to:1215, at:0, d:.22, w:'triangle', v:.12}, {n:1, ft:'bandpass', f:800, to:4200, q:2, at:0, d:.22, v:.35}, {f:1760, at:.2, d:.12, w:'sine', v:.15}],   // la esfera se forma en las manos
    dodge:    [{n:1, ft:'bandpass', f:600, to:3200, q:1.5, at:0, d:.22, v:1.2}],
    // ---- Al LANZAR un ataque (antes del golpe): cada uno suena distinto para que se oiga qué se está usando ----
    swing:    [{n:1, ft:'bandpass', f:700, to:2300, q:1.3, at:0, d:.14, v:1.3}, {n:1, ft:'highpass', f:2500, at:.02, d:.07, v:.3}],       // cuerpo a cuerpo: un 'fffsh' de golpe de brazo, más corto y agudo que el dash
    shot:     [{f:1100, to:320, x:1, at:0, d:.14, w:'triangle', v:.5}, {n:1, ft:'bandpass', f:2400, to:900, q:1, at:0, d:.07, v:.35}],       // disparo: 'piú' que cae
    buff:     [{f:523, at:0, d:.14, w:'triangle', v:.38}, {f:784, at:.08, d:.16, w:'triangle', v:.36}, {f:1175, at:.16, d:.28, w:'sine', v:.34}, {n:1, ft:'highpass', f:5000, at:.1, d:.25, v:.12}],   // mejora: brillo que sube
    status:   [{f:330, to:520, at:0, d:.3, w:'sine', v:.4}, {f:335, to:515, at:.02, d:.3, w:'triangle', v:.2}, {n:1, ft:'bandpass', f:1500, to:700, q:2, at:0, d:.25, v:.2}],       // ataque de estado: onda rara que sube
    strong:   [{f:110, to:420, at:0, d:.28, w:'sawtooth', v:.32}, {n:1, ft:'bandpass', f:400, to:3000, q:1.2, at:0, d:.28, v:.5},            // ataque fuerte: se carga...
               {f:140, to:45, x:1, at:.26, d:.26, w:'sine', v:.9}, {n:1, ft:'lowpass', f:1400, to:200, at:.26, d:.2, v:.5}],                 // ...y sale con un 'bum'                                          // 'fiuuu' de esquiva
    faint:    [{f:640, to:70, x:1, at:0, d:.5, w:'triangle', v:.55}, {f:320, to:50, x:1, at:0, d:.55, w:'sine', v:.5}, {n:1, ft:'lowpass', f:1200, to:150, at:0, d:.35, v:.25}]   // se debilita: baja y se apaga
  };
  // ---- Invocación (animación del templo): todo generado por código, sin archivos ----
  // Cada nota suena con un golpe y luego se apaga, así que lo que "crece" (la carga) se hace con muchos trocitos cada vez más fuertes y agudos.
  const invSfx = (() => {
    const T = {}, CH = {C:1.5, R:2.1, E:2.8, L:3.6}, P = [784, 880, 1047, 1175, 1319, 1568, 1760, 2093];   // notas de la escala (pentatónica)
    const bell = (f, at, d, v) => [{f, at, d, w:'sine', v}, {f:f * 2, at, d:d * .7, w:'sine', v:v * .35}, {f:f * 3.01, at, d:d * .4, w:'triangle', v:v * .12}];
    const lerp = (a, b, k) => a * Math.pow(b / a, k);
    T.inv_open = [{n:1, ft:'lowpass', f:250, to:1100, q:.7, at:0, d:1.1, v:.3}, {f:110, at:0, d:1.1, w:'sine', v:.3}, {f:165, at:.1, d:1, w:'triangle', v:.15}, ...bell(1319, .3, .8, .12), ...bell(1760, .55, .8, .1)];
    for(const t in CH){
      const s = CH[t], n = [], K = Math.round(s / .09);
      for(let i = 0; i < K; i++){ const k = i / K, at = i * .09;
        n.push({f:lerp(110, 900, k), at, d:.13, w:'sine', v:.1 + .3 * k});                          // tono que sube
        n.push({f:lerp(55, 330, k), at, d:.13, w:'sawtooth', v:.03 + .09 * k});                     // grave que sube
        n.push({n:1, ft:'bandpass', f:lerp(300, 4500, k), q:1.6, at, d:.13, v:.08 + .25 * k});     // viento que sube
      }
      const B = 8 + Math.round(s * 6);
      for(let i = 0; i < B; i++){ const at = s * (1 - Math.pow(1 - i / B, 2)); n.push({f:130, to:48, x:1, at, d:.12, w:'sine', v:.3 + .5 * i / B}); }   // latidos cada vez más seguidos
      if(t === 'E' || t === 'L') for(let at = s * .4, i = 0; at < s - .1; at += .13, i++) n.push(...bell(P[(i * 3) % 8], at, .35, .1 + .08 * (at / s)));    // destellos
      if(t === 'L') for(let i = 0; i < K; i++){ const k = i / K; n.push({f:lerp(220, 1800, k), at:i * .09, d:.13, w:'triangle', v:.04 + .16 * k}); }    // segunda subida más aguda
      T['inv_ch_' + t] = n;
    }
    T.inv_win = [0, 1, 2, 3, 4].flatMap(i => bell([784, 988, 1175, 1319, 1568][i], i * .09, .7, .24));                        // las 5 ventanas se encienden
    T.inv_boom = [{f:160, to:38, x:1, at:0, d:1.1, w:'sine', v:1}, {n:1, ft:'lowpass', f:3500, to:150, q:.8, at:0, d:1.2, v:.85}, {n:1, ft:'bandpass', f:5000, to:1200, q:.8, at:0, d:.18, v:.6},
      ...bell(2093, .12, 1, .16), ...bell(2637, .2, 1, .14), ...bell(3136, .3, 1, .12), ...bell(4186, .42, 1, .1),
      ...[.55, .75, .95, 1.2].map((at, i) => ({f:1300 - i * 120, to:650, x:1, at, d:.18, w:'sine', v:.24 - i * .03}))];                // gotas en el agua
    T.inv_rev_C = [...bell(784, 0, .5, .3), ...bell(1047, .12, .6, .3)];
    T.inv_rev_R = [523, 659, 784, 1047].flatMap((f, i) => bell(f, i * .09, .7, .28));
    T.inv_rev_E = [{f:523, at:0, d:1.4, w:'triangle', v:.28}, {f:659, at:0, d:1.4, w:'triangle', v:.24}, {f:784, at:0, d:1.4, w:'triangle', v:.24}, ...[0, 1, 2, 3, 4].flatMap(i => bell(P[i + 2], .1 + i * .09, .6, .2)), {n:1, ft:'highpass', f:6000, at:.1, d:1, v:.1}];
    T.inv_rev_L = [{f:65, at:0, d:2, w:'sine', v:.55}, ...[262, 330, 392, 523].map(f => ({f, at:0, d:2.4, w:'triangle', v:.26})), ...[262, 330, 392, 523].map(f => ({f:f * 2, at:.25, d:2, w:'sine', v:.14})),
      ...Array.from({length:12}, (_, i) => bell(P[i % 8] * (i > 7 ? 2 : 1), .15 + i * .085, .5, .16)).flat(), ...bell(2093, 1.1, 1.6, .3), {n:1, ft:'highpass', f:6000, at:.2, d:1.5, v:.12}];
    const whoosh = [{n:1, ft:'bandpass', f:600, to:2800, q:1.2, at:0, d:.12, v:.22}];
    T.inv_flip_C = [...whoosh, {f:880, at:.04, d:.07, w:'sine', v:.2}];
    T.inv_flip_R = [...whoosh, ...bell(1047, .05, .5, .26)];
    T.inv_flip_E = [...whoosh, ...[784, 988, 1175].flatMap((f, i) => bell(f, .05 + i * .07, .6, .22)), {n:1, ft:'highpass', f:6000, at:.05, d:.4, v:.1}];
    T.inv_flip_L = [...whoosh, {f:90, to:40, x:1, at:.04, d:.5, w:'sine', v:.6}, ...[0, 1, 2, 3, 4].flatMap(i => bell(P[i + 3], .08 + i * .07, .7, .2)), {n:1, ft:'highpass', f:6000, at:.05, d:.6, v:.12}];
    T.inv_deal = [{n:1, ft:'bandpass', f:500, to:3000, q:1, at:0, d:.35, v:.3}, ...[0, 1, 2, 3, 4].map(i => ({f:880 + i * 110, at:.05 + i * .06, d:.06, w:'sine', v:.1}))];
    return T;
  })();
  Object.assign(SFX, invSfx);
  // ---- SONIDOS DE LA TIENDA (js/shop.js): moneda, caja registradora, oferta, canje, error y un toque suave al elegir ----
  const shopSfx = (() => {
    const T = {}, bell = (f, at, d, v) => [{f, at, d, w:'sine', v}, {f:f * 2, at, d:d * .7, w:'sine', v:v * .35}, {f:f * 3.01, at, d:d * .4, w:'triangle', v:v * .12}];
    const coin = (at, v) => [{f:1319, at, d:.07, w:'square', v:v * .35}, ...bell(1976, at + .05, .5, v), ...bell(2637, at + .05, .35, v * .5)];        // «tin» de moneda
    T.shop_buy = [{n:1, ft:'bandpass', f:3000, q:2, at:0, d:.05, v:.2}, ...coin(0, .24), ...coin(.09, .2), ...bell(1047, .2, .6, .22), ...bell(1568, .28, .8, .24)];   // ¡cha-ching!
    T.shop_deal = [...T.shop_buy, ...[0, 1, 2, 3, 4, 5].flatMap(i => bell(2093 * Math.pow(1.122, i), .38 + i * .06, .35, .12)), {n:1, ft:'highpass', f:6500, at:.38, d:.5, v:.09}];   // + destellos de oferta
    T.shop_canje = [{f:140, to:60, x:1, at:0, d:.16, w:'sine', v:.5}, {n:1, ft:'bandpass', f:1800, q:1.5, at:0, d:.06, v:.25}, ...bell(784, .14, .6, .24), ...bell(1175, .22, .7, .24), ...bell(1568, .3, .9, .22)];   // sello + campanitas
    T.shop_fail = [{f:196, at:0, d:.14, w:'square', v:.14}, {f:147, at:.12, d:.22, w:'square', v:.14}];
    T.shop_pick = [{f:1175, at:0, d:.04, w:'sine', v:.1}, {f:1568, at:.03, d:.05, w:'sine', v:.08}];
    return T;
  })();
  Object.assign(SFX, shopSfx);
  // ---- SONIDOS POR TIPO Y POR ATAQUE (js/sonidos.js): L_<tipo> al lanzar, I_<tipo> al dar, y algunos ataques con el suyo propio ----
  { const B = (f, q, at, d, v, to) => ({n:1, ft:'bandpass', f, q, at, d, v, to}), H = (f, at, d, v, to) => ({n:1, ft:'highpass', f, at, d, v, to}), Lp = (f, at, d, v, to) => ({n:1, ft:'lowpass', f, at, d, v, to}),
          O = (w, f, at, d, v, to, x) => ({w, f, at, d, v, to, x});
    Object.assign(SFX, {
      L_fuego:     [Lp(1800, 0, .35, .6, 600), B(3000, 2, .03, .05, .3), B(2600, 2, .12, .05, .25), B(3400, 2, .2, .04, .2)],            // fuego que ruge y chisporrotea
      L_agua:      [B(900, 2, 0, .18, .6, 2200), O('sine', 600, 0, .12, .25, 1400), B(1600, 3, .1, .08, .25, 800)],                   // chorro de agua
      L_planta:    [H(3500, 0, .3, .35), B(5000, 3, .05, .04, .2), B(4500, 3, .13, .04, .2), B(5200, 3, .21, .04, .18)],               // hojas que cortan el aire
      L_electrico: [O('square', 1800, 0, .12, .22, 300), H(4000, 0, .08, .4), O('sawtooth', 120, 0, .15, .2), H(5000, .07, .04, .3)],  // chispazo
      L_hielo:     [O('sine', 2600, 0, .18, .25, 3400), O('sine', 3900, .05, .15, .18), H(6000, 0, .1, .25)],                         // cristal
      L_psiquico:  [O('sine', 500, 0, .32, .28, 1500), O('sine', 527, 0, .32, .28, 1560), O('triangle', 250, 0, .3, .12, 750)],       // zumbido psíquico (dos tonos que «baten»)
      L_fantasma:  [O('triangle', 300, 0, .45, .28, 170), O('sine', 312, 0, .45, .25, 180), B(800, 4, 0, .4, .2, 500)],              // lamento
      L_dragon:    [O('sawtooth', 110, 0, .42, .33, 70), Lp(900, 0, .42, .4, 300), O('square', 220, 0, .2, .08, 140)],               // rugido
      L_siniestro: [O('sawtooth', 90, 0, .38, .33, 55), O('square', 180, 0, .38, .1, 110), Lp(600, 0, .32, .3)],                     // golpe oscuro
      L_hada:      [O('sine', 1568, 0, .22, .22), O('sine', 2093, .06, .22, .2), O('sine', 2637, .12, .28, .18)],                     // campanillas
      L_acero:     [O('square', 1250, 0, .25, .1), O('sine', 1870, 0, .32, .2), B(3000, 4, 0, .05, .3)],                              // metal
      L_roca:      [Lp(700, 0, .25, .55, 200), B(1500, 2, .04, .04, .35), B(1200, 2, .1, .04, .3)],                                   // piedras
      L_tierra:    [O('sine', 70, 0, .35, .55, 40, 1), Lp(400, 0, .35, .5, 120)],                                                     // tierra
      L_volador:   [B(600, 1.5, 0, .3, .55, 1800)],                                                                                    // ráfaga de viento
      L_veneno:    [O('sine', 300, 0, .08, .3, 700), O('sine', 400, .09, .08, .25, 900), O('sine', 350, .17, .08, .22, 800)],           // burbujas
      L_bicho:     [O('sawtooth', 220, 0, .25, .14), O('square', 228, 0, .25, .07), H(4000, 0, .15, .12)],                             // zumbido
      L_lucha:     [B(500, 1.2, 0, .12, .5, 1500)],                                                                                    // golpe de aire
      I_fuego:     [Lp(2500, 0, .3, .7, 300), B(3000, 2, .05, .04, .35), B(2000, 2, .1, .05, .3)],                                     // estallido de fuego
      I_agua:      [B(1200, 1.5, 0, .25, .7, 300), B(2600, 3, .05, .1, .3), B(2200, 3, .12, .08, .25)],                                // chapoteo
      I_electrico: [H(3000, 0, .06, .6), O('square', 90, 0, .2, .25), H(4500, .08, .04, .4), H(4000, .14, .04, .3)],                   // descarga
      I_hielo:     [H(5000, 0, .08, .55), O('sine', 3100, 0, .2, .2), O('sine', 4200, .04, .2, .15), B(2500, 3, .06, .05, .3)],          // se rompe el hielo
      I_roca:      [Lp(900, 0, .3, .7, 150), B(1400, 2, .05, .05, .4), B(900, 2, .12, .06, .35), B(1200, 2, .2, .05, .25)],           // crujido de piedras
      I_psiquico:  [O('sine', 1500, 0, .25, .25, 400), O('sine', 1560, 0, .25, .25, 420), H(5000, 0, .05, .3)],
      I_fantasma:  [Lp(500, 0, .35, .45, 120), O('triangle', 200, 0, .35, .25, 90)],
      I_siniestro: [Lp(400, 0, .3, .5, 90), O('sawtooth', 70, 0, .3, .25, 45)],
      I_hada:      [O('sine', 2637, 0, .3, .22), O('sine', 3136, .05, .3, .2), H(6000, 0, .1, .25)],
      I_planta:    [B(4000, 2, 0, .06, .4), B(3500, 2, .05, .06, .35), B(4500, 2, .1, .06, .3)],
      bite:        [B(2500, 3, 0, .03, .6), O('square', 300, .01, .08, .35, 80, 1), H(3000, .02, .05, .4)],                          // ¡ÑAM! (mordisco)
      crunch:      [B(2500, 3, 0, .03, .7), O('square', 260, .01, .1, .4, 60, 1), H(3000, .02, .05, .45), B(1200, 2, .07, .05, .45), B(900, 2, .12, .06, .4)],   // mordisco que cruje (Triturar, colmillos)
      horn:        [O('sawtooth', 200, 0, .3, .2, 600), B(500, 1, 0, .35, .5, 2000)],                                                 // carga con el cuerno
      wind:        [B(400, 2, 0, .8, .55, 1200), B(1200, 3, .3, .7, .35, 500), B(700, 2, .5, .6, .25, 1400)],                         // tornado
      speed:       [H(1500, 0, .12, .6, 6000), O('sine', 900, 0, .1, .15, 2400)],                                                     // ¡ZAS! (a toda velocidad)
      leaves:      [0, .06, .12, .18, .24, .3, .36].map((at, i) => B(4200 + (i % 3) * 600, 3, at, .05, .25)),                        // lluvia de hojas
      pulse:       [0, .13, .26].map(at => O('sawtooth', 95, at, .11, .28, 60)).concat([Lp(500, 0, .4, .25)]),                       // ondas oscuras
      slash:       [H(3000, 0, .08, .6, 8000), O('sine', 2500, 0, .06, .2, 1200)],                                                   // corte
      clash:       [O('square', 1000, 0, .3, .14), O('sine', 1500, 0, .35, .2), B(2500, 3, 0, .08, .5)]                              // ¡CHOQUE!
    }); }
  // ---- ATAQUES FUERTES (js/fxsuelo.js): Terremoto, Hiperrayo, Trueno y Cometa Draco, con golpes graves y crujidos como en el vídeo ----
  Object.assign(SFX, {
    quake:   [{f:62, to:34, x:1, at:0, d:1.1, w:'sine', v:1}, {n:1, ft:'lowpass', f:420, to:80, q:.7, at:0, d:1.3, v:.95},                 // retumbo largo
              {f:120, to:45, x:1, at:.22, d:.25, w:'sine', v:.7}, {f:110, to:40, x:1, at:.48, d:.25, w:'sine', v:.55},                    // sacudidas
              ...[.12, .3, .41, .6, .74].map((at, i) => ({n:1, ft:'bandpass', f:1800 + i * 300, q:2, at, d:.06, v:.22}))],               // piedras que crujen
    boom:    [{f:120, to:34, x:1, at:0, d:.5, w:'sine', v:1}, {n:1, ft:'lowpass', f:2600, to:110, q:.7, at:0, d:.55, v:.9}, {n:1, ft:'bandpass', f:4200, to:1400, q:.8, at:0, d:.08, v:.45}],
    beam_ch: [{f:160, to:820, at:0, d:.45, w:'sawtooth', v:.16}, {n:1, ft:'bandpass', f:400, to:2600, q:1.4, at:0, d:.45, v:.32}],           // se carga
    beam:    [{n:1, ft:'bandpass', f:1600, q:1, at:0, d:.09, v:.6}, {n:1, ft:'lowpass', f:2000, to:500, q:.8, at:0, d:1.1, v:.75},           // sale el rayo y ruge
              {f:92, to:68, at:0, d:1.1, w:'sawtooth', v:.24}, {f:184, to:140, at:0, d:.9, w:'square', v:.07}, {n:1, ft:'highpass', f:4500, at:0, d:.5, v:.14}],
    trueno:  [{n:1, ft:'highpass', f:2600, at:0, d:.09, v:.95}, {n:1, ft:'bandpass', f:1300, to:280, q:.8, at:0, d:.28, v:.85},             // ¡CRAC!
              {f:78, to:38, x:1, at:.02, d:.9, w:'sine', v:.85}, {n:1, ft:'lowpass', f:650, to:70, at:.05, d:1.4, v:.75},                  // y el trueno que retumba
              {n:1, ft:'highpass', f:3200, at:.13, d:.05, v:.5}, {n:1, ft:'highpass', f:3200, at:.21, d:.04, v:.4}],
    meteoro: [{n:1, ft:'bandpass', f:3200, to:450, q:1.5, at:0, d:.24, v:.55}, {f:900, to:200, at:0, d:.24, w:'sine', v:.12}],             // silbido al caer
    skid:    [{n:1, ft:'bandpass', f:1100, to:280, q:1.2, at:0, d:.38, v:.5}, {f:140, to:60, x:1, at:0, d:.2, w:'sine', v:.55}]                // ¡derribado!: se arrastra por el suelo
  });
  const sfxLast = {};                                                                // anti-saturación: el mismo efecto no suena dos veces en menos de 45 ms (ráfagas de varios golpes)
  function sfx(name, k){                                                           // k (opcional, 0-1): lo bajito que suena (los ataques del rival de la Historia suenan más suaves)
    const notes = SFX[name]; if(!notes || !unlocked || !ensureCtx()) return;
    const lvl = sfxVol() * (k === undefined ? 1 : k); if(lvl <= 0) return;
    if(ctx.state === 'suspended') ctx.resume().catch(() => {});
    const t0 = ctx.currentTime + .005;
    const now = ctx.currentTime; if(sfxLast[name] && now - sfxLast[name] < .045) return; sfxLast[name] = now;
    notes.forEach(n => {
      const g = ctx.createGain(), a = t0 + n.at, e = a + n.d; let src;
      if(n.n){                                                                       // ruido filtrado (golpes, crujidos, 'fiu')
        getNoise();
        src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
        const fl = ctx.createBiquadFilter(); fl.type = n.ft || 'lowpass'; fl.Q.value = n.q || 1; fl.frequency.setValueAtTime(n.f, a);
        if(n.to) fl.frequency.exponentialRampToValueAtTime(n.to, e);
        src.connect(fl); fl.connect(g);
      }else{
        src = ctx.createOscillator(); src.type = n.w; src.frequency.setValueAtTime(n.f, a);
        if(n.to) n.x ? src.frequency.exponentialRampToValueAtTime(n.to, e) : src.frequency.linearRampToValueAtTime(n.to, e);
        src.connect(g);
      }
      g.gain.setValueAtTime(.0001, a); g.gain.linearRampToValueAtTime(n.v * lvl, a + (n.n || n.x ? .004 : .01)); g.gain.exponentialRampToValueAtTime(.0001, e);
      g.connect(analyser); src.start(a); src.stop(e + .05);
    });
  }
  function setMute(m){ save.mute = !!m; persist(); applyVol(); }
  const toggleMute = () => { setMute(!save.mute); return save.mute; };
  function duck(on){ ducked = !!on; applyVol(); }
  function probe(ids){ ensureCtx(); return Promise.all((ids || Object.keys(MUSIC_TRACKS)).map(id => load(id).then(s => [id, s.kind === 'synth' ? 'generada' : 'archivo']))).then(a => Object.fromEntries(a)); }
  function status(){ return {id: cur && cur.id, kind: cur && cur.kind, want, unlocked, ctx: ctx && ctx.state, vol: vol(), sfx: sfxVol()}; }
  function level(){ if(!analyser) return 0; const d = new Uint8Array(analyser.fftSize); analyser.getByteTimeDomainData(d); let s = 0; for(const v of d) s += (v - 128) * (v - 128); return Math.sqrt(s / d.length) / 128; }

  // El navegador solo deja sonar tras un clic o una tecla: en el primer gesto se activa y empieza lo que estaba pedido
  function unlock(){                                                                // se llama en cada gesto: la 1ª vez activa el audio; las demás reactivan si el navegador lo suspendió
    unlocked = true; ensureCtx();
    if(ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    if(want) play(want);
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, unlock, {passive: true}));
  return {play, stop, battle, win, scene, setVolume, setMenuVolume, setBattleVolume, setSfxVolume, setMute, toggleMute, duck, probe, status, level, unlock, sfx};
})();
const Sfx = {play: (name, k) => Music.sfx(name, k)};
