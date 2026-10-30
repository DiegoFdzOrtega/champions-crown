"use strict";
/* =====================================================================
   19) MÚSICA DINÁMICA: un tema para el menú y uno para cada tipo de combate (líderes, Alto Mando y Campeones de Kanto y Johto)

   CÓMO FUNCIONA (en sencillo)
   - Pones tus archivos de audio en la carpeta  musica/  con el nombre de cada pista (ver MUSIC_TRACKS): musica/menu.mp3,
     musica/lider_kanto.mp3, musica/lider_johto.mp3, musica/alto_kanto.mp3, musica/alto_johto.mp3, musica/campeon_azul.mp3,
     musica/campeon_lance.mp3 y musica/campo.mp3. El juego los encuentra solo.
   - Si una pista NO tiene archivo, suena una música original "chiptune" que genera el propio juego (sin ficheros), así nunca hay silencio.
     Cuando añadas el archivo, empieza a usarse sin tocar nada más.
   - Los archivos no vienen incluidos: los temas oficiales de Pokémon son de Nintendo / Game Freak, así que tienes que poner tú los tuyos.

   TÉCNICA
   - Se usa la API Web Audio (AudioContext): los archivos se descargan y decodifican UNA vez y se repiten en bucle SIN cortes
     (mejor que <audio loop>, que suele dejar un hueco). Los cambios de pista son fundidos (fade out de la vieja + fade in de la nueva).
   - Los navegadores no dejan sonar nada hasta que el jugador hace clic o pulsa una tecla; la música empieza en ese primer gesto.
   - Si abres index.html con doble clic (file://) el navegador no deja leer los archivos con fetch(); entonces se usa un <audio> normal.
     (Mejor abrirlo con un servidor local o con GitHub Pages.)
   - Volumen (Ajustes › Audio): save.vol = GLOBAL, save.volMusic = música, save.volSfx = efectos (0-100 cada uno) y save.mute = silenciar todo (tecla M).
     Volumen final de la música = global x música · de los efectos = global x efectos. Pausa (Esc): la música baja de volumen.
   - EFECTOS DE SONIDO (Sfx): pitidos cortos generados por código, sin archivos: 'click' (botones), 'win', 'lose' (resultado del combate), 'logro' y 'mega' (megaevolución).
     Sfx.play('click'). Para añadir uno: una línea en SFX (lista de notas: f = frecuencia, at = cuándo, d = duración, w = onda, v = volumen, to = frecuencia final).

   PARA EL PROGRAMADOR
     Music.play('menu')     Music.battle(o)  (lo llama startBattle)     Music.scene('main')  (lo llama show())
     Music.stop(seg)        Music.setVolume(0-100) = global   Music.setMusicVolume(0-100)   Music.setSfxVolume(0-100)
     Music.setMute(bool)    Music.toggleMute()   Music.duck(true/false)   Sfx.play(nombre)
     Music.probe([ids])     promesa: para cada pista dice si usa 'archivo' o 'generada'
   ===================================================================== */

const MUSIC_DIR = 'musica/';
const MUSIC_EXT = ['ogg', 'mp3'];     // extensiones que se buscan, en orden. Añade 'wav' si usas ese formato: ['ogg', 'mp3', 'wav']

// ---------------------------------------------------------------------
// PISTAS. name = cómo se muestra · ref = qué tema oficial encaja (orientativo, para que sepas qué buscar)
// file: nombre del archivo (sin extensión) si no quieres que se llame como la pista; así varias pistas pueden compartir el mismo archivo. Puede llevar carpeta: 'Kalos/Combate Lideres' = musica/Kalos/Combate Lideres.ogg (una carpeta por región)
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
  campeon_cintia:{name:'Campeona Cintia (Sinnoh)', file:'Sinnoh/Combate Campeona Cintia', win:'win_campeon_sinnoh', ref:'"Battle! Champion" de Sinnoh (Diamante/Perla/Platino)',
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
  // Kalos: los archivos están en la carpeta musica/Kalos/ (una carpeta por región) con nombres que dicen para qué son. win = el tema de victoria que suena al ganar (once = suena una vez, sin repetir)
  lider_kalos:  {name:'Líderes de Kalos', file:'Kalos/Combate Lideres', win:'win_lider_kalos',          ref:'"Battle! Gym Leader" de Kalos (X/Y)',
                 synth:{seed:26, bpm:158, root:62, scale:'major',    prog:[0,4,5,3],      bass:'drive', lead:'drive', pad:false, arp:false, drums:'rock',   density:.8}},
  alto_kalos:   {name:'Alto Mando de Kalos', file:'Kalos/Combate Alto Mando', win:'win_lider_kalos',  ref:'"Battle! Elite Four" de Kalos (X/Y)',
                 synth:{seed:36, bpm:168, root:57, scale:'harmonic', prog:[0,5,6,4],      bass:'drive', lead:'drive', pad:false, arp:true,  drums:'double', density:.84}},
  campeon_dianta:{name:'Campeona Dianta (Kalos)', file:'Kalos/Combate Campeona', win:'win_campeon_kalos', ref:'"Battle! Champion" de Kalos (X/Y)',
                 synth:{seed:46, bpm:178, root:59, scale:'major',    prog:[0,5,3,4],      bass:'drive', lead:'epic',  pad:true,  arp:true,  drums:'double', density:.92}},
  win_lider_kalos:  {name:'Victoria: Líderes y Alto Mando de Kalos', file:'Kalos/Victoria Lideres',  once:true, ref:'"Victory! Gym Leader" de Kalos (X/Y)'},
  win_campeon_kalos:{name:'Victoria: Campeona de Kalos',            file:'Kalos/Victoria Campeona', once:true, ref:'"Victory! Champion" de Kalos (X/Y)'},
  campo:        {name:'Campo de Entrenamiento',    ref:'"Battle! Trainer" (entrenador normal)',
                 synth:{seed:51, bpm:138, root:60, scale:'major',    prog:[0,3,4,0],      bass:'drive', lead:'drive', pad:false, arp:false, drums:'rock',   density:.7}}
};

// ---------------------------------------------------------------------
// QUÉ PISTA SUENA CON CADA ENTRENADOR (id del combate -> pista). Para darle una pista propia a uno: crea una pista nueva
// arriba (p. ej. 'brock') con su archivo musica/brock.mp3 y cambia aquí su línea a 'brock'.
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
  dianta:'campeon_dianta'
};
// Si un combate nuevo (otra región) no está en la lista, se elige por región y tipo: lider_<región>, alto_<región>, campeon_<región>; si no existe, la de Kanto.
function musicTrackFor(o){
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
  const clamp01 = v => Math.max(0, Math.min(1, v));
  // Volumen final. Curva suave (el oído no es lineal) y un tope para que la música no tape los efectos.
  const curve = v => Math.pow(clamp01((+v) / 100), 1.6);
  const vol = () => (save.mute ? 0 : curve(save.vol ?? 100) * curve(save.volMusic ?? 70) * .6) * (ducked ? .35 : 1);     // música = global x música
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
    els.forEach(h => { h.el.volume = clamp01(h.level * vol() / .6); });
  }

  // ---- Un "manejador" por pista que suena: {id, kind, ramp(a, seg), stop()} ----
  function rampNode(g, to, secs){ const t = ctx.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(to, t + Math.max(.01, secs)); }
  function makeBuffer(id, src){
    const g = ctx.createGain(); g.gain.value = 0; g.connect(master);
    const s = ctx.createBufferSource(); s.buffer = src.buf; s.loop = !MUSIC_TRACKS[id].once;                                       // bucle sin cortes
    const lp = MUSIC_TRACKS[id].loop; if(lp){ s.loopStart = lp[0]; s.loopEnd = lp[1]; }
    s.connect(g); s.start();
    return {id, kind:'file', ramp:(to, secs) => rampNode(g, to, secs), stop(){ try{ s.stop(); }catch(e){} g.disconnect(); }};
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
  function noise(out, t, dur, peak, hp){
    if(!noiseBuf){ noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for(let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
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
    return {id, kind:'generada', ramp:(to, secs) => rampNode(g, to, secs), stop(){ clearInterval(timer); g.disconnect(); }};
  }

  // ---- Carga: archivo de musica/ si existe; si no, música generada ----
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
  function setMusicVolume(v){ save.volMusic = pct(v); persist(); applyVol(); }
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
    lose:  [{f:392, at:0, d:.22, w:'sawtooth', v:.4}, {f:330, at:.22, d:.22, w:'sawtooth', v:.4}, {f:262, at:.44, d:.5, w:'sawtooth', v:.4, to:200}]
  };
  function sfx(name){
    const notes = SFX[name]; if(!notes || !unlocked || !ensureCtx()) return;
    const lvl = sfxVol(); if(lvl <= 0) return;
    if(ctx.state === 'suspended') ctx.resume().catch(() => {});
    const t0 = ctx.currentTime + .005;
    notes.forEach(n => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = n.w; o.frequency.setValueAtTime(n.f, t0 + n.at);
      if(n.to) o.frequency.linearRampToValueAtTime(n.to, t0 + n.at + n.d);
      g.gain.setValueAtTime(.0001, t0 + n.at); g.gain.linearRampToValueAtTime(n.v * lvl, t0 + n.at + .01); g.gain.exponentialRampToValueAtTime(.0001, t0 + n.at + n.d);
      o.connect(g); g.connect(analyser); o.start(t0 + n.at); o.stop(t0 + n.at + n.d + .05);
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
  return {play, stop, battle, win, scene, setVolume, setMusicVolume, setSfxVolume, setMute, toggleMute, duck, probe, status, level, unlock, sfx};
})();
const Sfx = {play: name => Music.sfx(name)};
