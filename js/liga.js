"use strict";
/* =====================================================================
   LIGA (Historia) NUEVA — de momento solo KANTO
   - Arriba, en grande, el rival que toca (retrato, tipo, frase, su equipo oculto con «?», recompensa y «¡COMBATIR!»).
   - Abajo, el «Camino de la Liga»: 8 medallas (lideres/<Región>/Medallas/), 4 puertas del Alto Mando y la sala del Campeón.
     Pulsando una medalla o una puerta ya superada se ve ese rival (con su equipo ya descubierto) para repetirlo.
   - Para activarlo en otra región: añádela a LIGA_NEW y rellena su tabla en LIGA_INFO (frase, lugar y medalla de cada uno).
   - buildStory (menu.js) sigue construyendo la pantalla de siempre; aquí solo se añade la nueva y se ocultan las partes antiguas.
   ===================================================================== */
const LIGA_NEW = new Set(['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova / Teselia', 'Kalos', 'Alola']);
// medal = nombre del archivo lideres/<Región>/Medallas/Medalla_<medal>.webp (tal cual está en la carpeta: «Drag%3Fn» incluido). Sin medalla: sale el color de su tipo.
// place = solo hace falta si el combate no lo trae ya (los de Kanto). q = la frase que dice en la ficha.
const LIGA_INFO = {
  // ---- Kanto ----
  brock:    {place:'Gimnasio de Ciudad Plateada', medal:'Roca',      q:'Mi defensa es dura como la roca. ¡A ver si eres capaz de romperla!'},
  misty:    {place:'Gimnasio de Ciudad Celeste',  medal:'Cascada',   q:'Mis Pokémon de agua te van a arrastrar. ¡Prepárate para mojarte!'},
  lt_surge: {place:'Gimnasio de Ciudad Carmín',   medal:'Trueno',    q:'¡Eh, chaval! La electricidad me salvó en la guerra. ¡Te voy a dejar frito!'},
  erika:    {place:'Gimnasio de Ciudad Azulona',  medal:'Arco%3Fris', q:'Las flores no se rinden ante la lluvia... ni yo ante ti.'},
  koga:     {place:'Gimnasio de Ciudad Fucsia',   medal:'Alma',      q:'Un ninja no lucha de frente. El veneno hará el trabajo por mí.'},
  sabrina:  {place:'Gimnasio de Ciudad Azafrán',  medal:'Pantano',   q:'Ya sabía que vendrías. También sé cómo acabará este combate.'},
  blaine:   {place:'Gimnasio de Isla Canela',     medal:'Volcan',    q:'¡Ja! Espero que hayas traído Antiquemar, porque aquí arde todo.'},
  giovanni: {place:'Gimnasio de Ciudad Verde',    medal:'Tierra',    q:'Has llegado lejos, pero aquí termina tu camino.'},
  lorelei:  {place:'Meseta Añil', q:'Nadie aguanta mis Pokémon de hielo. Te dejaré congelado.'},
  bruno:    {place:'Meseta Añil', q:'¡Hemos entrenado hasta el límite! ¡Siente nuestra fuerza!'},
  agatha:   {place:'Meseta Añil', q:'¿Crees que puedes vencer a una veterana como yo? Ja, ja... ¡Inténtalo!'},
  lance:    {place:'Meseta Añil', q:'Los dragones son Pokémon casi invencibles. ¿Estás preparado?'},
  azul:     {place:'Sala del Campeón · Meseta Añil', q:'He estado esperándote. Soy el mejor entrenador del mundo... ¡y te lo voy a demostrar!'},
  // ---- Johto ----
  pegaso:  {medal:'Cefiro',    q:'Mis pájaros dominan el cielo. Desde aquí arriba se ve todo muy pequeño.'},
  anton:   {medal:'Colmena',   q:'Los Pokémon bicho son más fuertes de lo que parecen. ¡Te lo demostraré!'},
  blanca:  {medal:'Planicie',  q:'¡No me subestimes por ser mona! Mis Pokémon pegan fuerte.'},
  morti:   {medal:'Niebla',    q:'He visto tu derrota en la niebla. Veamos si el futuro se cumple.'},
  anibal:  {medal:'Tormenta',  q:'¡Mis puños rompen olas! ¿Tienes músculo para aguantarlos?'},
  yasmina: {medal:'Mineral',   q:'El acero no se dobla. Ni mis Pokémon ni yo daremos un paso atrás.'},
  fredo:   {q:'El invierno lo vuelve todo más duro. Como mis Pokémon.'},
  debora:  {medal:'Drag%3Fn',  q:'Soy la mejor entrenadora de dragones del mundo. ¡No pienso perder!'},
  mento:   {q:'Puedo leer tu mente... y ya sé qué Pokémon vas a sacar.'},
  j_koga:  {q:'Las artes ninja no perdonan errores. Un descuido y estás acabado.'},
  j_bruno: {q:'¡Más entrenamiento, más fuerza! ¡No hay más secreto!'},
  karen:   {q:'Pokémon fuertes, Pokémon débiles... Los de verdad son los que gustan a su entrenador.'},
  j_lance: {q:'Te he estado observando. Veamos si de verdad mereces este título.'},
  // ---- Hoenn ----
  petra:    {medal:'Piedra',     q:'Las rocas tardan miles de años en formarse. Mi paciencia, también.'},
  marcial:  {medal:'Puño',  q:'¡Las olas me han hecho fuerte! ¿Aguantarás el golpe?'},
  erico:    {medal:'Dinamo',     q:'¡Ja, ja! Este viejo todavía tiene muchos voltios dentro.'},
  candela:  {medal:'Calor',      q:'¡Me quemo de ganas de combatir! No te enfríes ahora.'},
  norman:   {medal:'Equilibrio', q:'Un líder no regala medallas, ni siquiera a quien le cae bien.'},
  alana:    {q:'Mis Pokémon y yo volamos juntos. ¿Podrás alcanzarnos?'},
  vitoleti: {medal:'Mente',      q:'Dos mentes, un solo combate. Nunca nos has visto separados.'},
  galano:   {medal:'Lluvia',     q:'La belleza del agua puede ser tu perdición.'},
  sixto:    {q:'Las sombras esconden mucha fuerza. Ya lo verás.'},
  fatima:   {q:'Mis fantasmas tienen ganas de jugar contigo... para siempre.'},
  nivea:    {q:'El hielo es bonito y frío, igual que un combate perfecto.'},
  dracon:   {q:'¡Los dragones y yo somos uno! ¡Ruge conmigo!'},
  plubio:   {q:'Me gustan las piedras raras. Y los entrenadores raros como tú.'},
  // ---- Sinnoh ----
  roco:     {medal:'Lignito',    q:'Las piedras de esta ciudad son duras. Mis Pokémon, más.'},
  gardenia: {medal:'Bosque',     q:'¡Las plantas crecen fuertes con mucho cariño! Te enseñaré cómo.'},
  fantina:  {medal:'Reliquia',   q:'Mes fantômes... ¡ah, mis fantasmas! Bailan contigo.'},
  brega:    {medal:'Adoquin',    q:'¡El combate se gana con el corazón! ¡Y con los puños!'},
  mananti:  {medal:'Cienaga',    q:'¡Ja, ja! ¡Que suba la marea, que vienen mis Pokémon de agua!'},
  aceron:   {medal:'Mina',       q:'El acero aguanta golpes que tú no imaginas.'},
  inverna:  {medal:'Carambano',  q:'Fuera hace frío, pero dentro mi corazón arde por combatir.'},
  lectro:   {medal:'Faro',       q:'Me aburría mucho... hasta ahora. Enséñame algo que me despierte.'},
  alecran:  {q:'Los bichos son hermosos. Y peligrosos, si los subestimas.'},
  gaia:     {q:'La tierra me da fuerza. ¡Prepárate para temblar!'},
  fausto:   {q:'¡Mi fuego no se apaga nunca! ¡Arde, arde!'},
  delos:    {q:'Esto no es un combate cualquiera. Concéntrate o perderás.'},
  cintia:   {q:'Cuando vi tu equipo supe que llegarías aquí. Ahora, demuéstrame todo.'},
  // ---- Teselia ----
  zeo:     {medal:'Trio',      q:'¡Nuestro restaurante está que arde! ¿Pides combate?'},
  maiz:    {medal:'Trio',      q:'Fluye como el agua. Así se sirve un buen combate.'},
  millo:   {medal:'Trio',      q:'¡Nuestros Pokémon están en su punto! Aquí tienes tu ración.'},
  aloe:    {medal:'Base',      q:'Un museo enseña el pasado. Mis Pokémon, cómo vas a perder.'},
  camus:   {medal:'%3Flitro',  q:'Un combate es una obra de arte. Pintemos la nuestra.'},
  camila:  {medal:'Voltio',    q:'¡Bienvenido al escenario! Prepárate para un combate eléctrico.'},
  yakon:   {medal:'Temblor',   q:'Aquí abajo no hay atajos. Solo tierra y trabajo duro.'},
  gerania: {medal:'Jet',       q:'¡Despegamos! A ver si aguantas a esta velocidad.'},
  junco:   {medal:'Candelizo', q:'El frío templa el espíritu. Quieto... y ataca.'},
  iris:    {medal:'Leyenda',   q:'¡Mis dragones y yo vamos a ganar! ¡Seguro, seguro!'},
  anis:    {q:'Esta historia aún no tiene final... ¿lo escribimos juntos?'},
  aza:     {q:'He dejado atrás el miedo. Ya solo queda luchar.'},
  lotto:   {q:'La oscuridad nunca juega limpio. Y yo tampoco.'},
  catleya: {q:'Tengo un poco de sueño... pero no tanto como para perder.'},
  mirto:   {q:'He viajado mucho buscando la verdad. A ver qué me enseñas tú.'},
  // ---- Kalos ----
  violeta: {medal:'Insecto_29', q:'Te voy a fotografiar en el momento en que pierdas.'},
  lino:    {medal:'Muro_29',    q:'Una pared se escala paso a paso. ¿Llegarás arriba?'},
  corelia: {medal:'Lid_29',     q:'¡Tengo la megaevolución de mi lado! ¡Vamos con todo!'},
  amaro:   {medal:'Hoja_29',    q:'Un jardín necesita tiempo. Mi victoria, no tanto.'},
  lem:     {medal:'Voltaje_29', q:'¡La ciencia es el futuro! Y mis inventos, también.'},
  valeria: {medal:'Hada_29',    q:'Las hadas son delicadas... hasta que se enfadan.'},
  astrid:  {medal:'Psique_29',  q:'Las estrellas ya han decidido quién ganará.'},
  edel:    {medal:'Iceberg_29', q:'El hielo es el mejor escudo. Rompe el mío si puedes.'},
  malva:   {q:'Las noticias de hoy: un aspirante quemado en la Liga.'},
  narciso: {q:'El agua es arte. Prepárate para mi obra maestra.'},
  tileo:   {q:'Un combate es una cosecha de experiencia. Recojamos la nuestra.'},
  agata:   {q:'Los dragones respetan a quien tiene coraje. ¿Tú lo tienes?'},
  dianta:  {q:'En el escenario y en el combate, siempre doy lo mejor de mí.'},
  // ---- Alola: capitanes con pruebas; en vez de medallas dan Cristales Z (lideres/Alola/Medallas/) ----
  ilima:     {medal:'Normastal', q:'Mi prueba es la primera, pero no la más fácil.'},
  lana:      {medal:'Hidrostal', q:'Shhh... algo enorme está a punto de picar.'},
  kiawe:     {medal:'Pirostal', q:'¡El fuego de mis bailes te va a dejar sin aliento!'},
  mallow:    {medal:'Fitostal', q:'¡Tengo lista una receta especial solo para ti!'},
  sophocles: {medal:'Electrostal', q:'Mis cálculos dicen que vas a perder. Casi seguro.'},
  acerola:   {medal:'Espectrostal', q:'Je, je... mis fantasmitas quieren jugar contigo.'},
  mina:      {medal:'Feeristal', q:'Pintar y combatir se parecen mucho: hay que saber mezclar.'},
  hala:      {q:'¡Ha ha! ¡Esta isla tiene mucha fuerza que enseñarte!'},
  olivia:    {q:'Las rocas brillan como joyas. Mi equipo, también.'},
  acerola_am:{q:'Ahora soy del Alto Mando... ¡y mis fantasmas son más fuertes!'},
  kahili:    {q:'Un golpe perfecto, como en el golf. ¡Allá voy!'},
  kukui:     {q:'¡Woo! ¡Llevo mucho esperando este combate!'}
};
const liga = {sel: null, reg: ''};                                       // sel = combate que se ve arriba (null = el siguiente)

const _buildStoryOld = buildStory;
buildStory = function(){
  _buildStoryOld();
  const on = LIGA_NEW.has(save.region);
  $('tower').classList.toggle('lgmode', on);
  let box = $('lgNew');
  if(!on){ if(box) box.innerHTML = ''; return; }
  if(!box){ box = document.createElement('div'); box.id = 'lgNew'; document.querySelector('#tower .stteam').before(box); }
  if(liga.reg !== save.region){ liga.reg = save.region; liga.sel = null; }
  ligaRender();
};

function ligaRender(){
  const R = save.region, fls = FLOORS.map((F, gi) => ({F, gi})).filter(x => x.F.region === R);
  const rec = PREVIEW[R] ? 99 : progOf(R), ready = team.length === 3, champ = champOf(R);
  const st = F => F.idx < rec ? 'done' : F.idx === rec ? 'cur' : 'lock';
  const nextK = fls.findIndex(x => x.F.idx >= rec);
  let k = liga.sel != null ? fls.findIndex(x => x.gi === liga.sel) : -1;
  if(k < 0 || st(fls[k].F) === 'lock') k = nextK >= 0 ? nextK : fls.length - 1;      // todo vencido: se ve al Campeón
  const {F, gi} = fls[k], S = st(F), I = LIGA_INFO[F.id] || {};
  const kc = F.kind === 'alto' ? '#a35cff' : F.kind === 'campeon' ? '#ffcc33' : tagColor(F);
  const ty = TYPE_OF_TAG[F.tag], cnt = kd => fls.filter(x => x.F.kind === kd), doneK = kd => cnt(kd).filter(x => x.F.idx < rec).length;
  const pos = cnt(F.kind).findIndex(x => x.gi === gi) + 1;
  const ALO = R === 'Alola', kind = F.kind === 'lider' ? `${ALO ? 'Capitán' : 'Líder de gimnasio'} · ${pos}/${cnt('lider').length}` : F.kind === 'alto' ? `Alto Mando · ${pos}/${cnt('alto').length}` : 'Campeón de la Liga';
  const badge = F.kind === 'campeon' ? '<span class="tb" style="background:#b8860b">Campeón</span>' : ty ? `<span class="tb" style="background:${TC[ty]}">${esc(F.tag)}</span>` : '';
  const showTeam = S === 'done';                                                     // su equipo solo se descubre cuando ya le has ganado
  const balls = (F.teams || []).slice(0, 6).map(e => showTeam ? `<canvas width="64" height="64" data-d="${typeof e === 'number' ? e : e.dex}"></canvas>` : '<i>?</i>').join('') || '<i>?</i>'.repeat(6);
  const rw = typeof rewardOf === 'function' ? rewardOf(F) : null;
  const medal = f => `lideres/${encodeURIComponent((typeof REGION_DIR !== 'undefined' && REGION_DIR[R]) || R)}/Medallas/Medalla_${encodeURIComponent((LIGA_INFO[f.id] || {}).medal || '')}.webp`;
  const node = ({F: f, gi: g}) => { const s = st(f), sel = g === gi;
    const tyc = tagColor(f), hasM = !!(LIGA_INFO[f.id] || {}).medal;
    const img = f.kind !== 'lider' ? `<img class="lg-por-s" data-leader="${f.id}" alt="">` : hasM ? `<img class="lg-med" data-src="${medal(f)}" alt="" data-c="${tyc}">` : `<span class="lg-noimg" style="--c:${tyc}"></span>`;
    return `<button class="lg-n ${f.kind} ${s}${sel ? ' sel' : ''}" data-gi="${g}" ${s === 'lock' ? 'disabled' : ''} title="${s === 'lock' ? '???' : esc(f.leader)}">${f.kind === 'campeon' ? '<span class="crown">♛</span>' : ''}<span class="md">${img}</span><small>${s === 'lock' ? '???' : esc(f.leader)}</small>${s === 'done' ? '<i class="ck">✓</i>' : ''}</button>`; };
  const seg = kd => `<div class="lg-seg">${cnt(kd).map(node).join('')}</div>`;
  $('lgNew').innerHTML = `<div class="lg" style="--kc:${kc}">
    <div class="lg-top"><h1>Liga de ${esc(R)}<small>Modo ${save.storyMode === 'facil' ? 'Fácil' : 'Difícil'}</small></h1>
      <div class="lg-prog"><span><b>${doneK('lider')}/${cnt('lider').length}</b> ${R === 'Alola' ? 'Cristales Z' : 'medallas'}</span><span><b>${doneK('alto')}/${cnt('alto').length}</b> Alto Mando</span><span class="${champ ? 'gold' : ''}"><b>${champ ? '🏆' : '0/1'}</b> Campeón</span></div></div>
    <div class="lg-hero ${F.kind}" style="--map:url(&quot;${new URL('region/' + encodeURIComponent((typeof REGION_IMG !== 'undefined' && REGION_IMG[R]) || R) + '.webp', document.baseURI).href}&quot;)">
      <div class="lg-por"><img id="lgPor" alt="${esc(F.leader)}"></div>
      <div class="lg-info"><span class="lg-kind">${F.kind === 'campeon' ? '♛ ' : ''}${kind}${S === 'done' ? ' · <b>✓ Vencido</b>' : ''}</span>
        <div class="lg-name">${esc(F.leader)}</div>
        <div class="lg-sub">${badge}<span>${esc(I.place || F.place || '')}</span></div>
        ${I.q ? `<p class="lg-quote">«${esc(I.q)}»</p>` : ''}
        <div class="lg-rt"><small>Su equipo${showTeam ? '' : ' · se descubre al vencerle'}</small><div class="lg-balls">${balls}</div></div></div>
      <div class="lg-side">
        ${rw ? `<div class="lg-rw"><small>Recompensa${F.kind === 'alto' ? ' · Alto Mando ×2' : F.kind === 'campeon' ? ' · Campeón ×3' : ''}</small><div id="lgRw"></div></div>` : '<span></span>'}
        <button class="lg-go${S === 'done' ? ' rep' : ''}" id="lgGo" ${ready ? '' : 'disabled'}>${S === 'done' ? 'Repetir combate' : '¡COMBATIR!'}</button>
        ${ready ? '' : '<p class="warn lg-warn">Elige 3 Pokémon en tu equipo para combatir.</p>'}
      </div>
    </div>
    <div class="lg-road"><h3>Camino de la Liga</h3>
      <div class="lg-path${fls.length > 13 ? ' many' : ''}">${seg('lider')}<i class="lg-sep${doneK('lider') < cnt('lider').length ? ' off' : ''}"></i>${seg('alto')}<i class="lg-sep${doneK('alto') < cnt('alto').length ? ' off' : ''}"></i>${seg('campeon')}</div>
    </div></div>`;
  // imágenes: retrato grande, medallas (si falta la medalla, el icono del tipo) y retratos pequeños
  const por = $('lgPor'); loadLeaderInto(por, F.id, () => { por.style.visibility = 'hidden'; });
  $('lgNew').querySelectorAll('img.lg-med').forEach(im => { im.onerror = () => { im.onerror = null; const sp = document.createElement('span'); sp.className = 'lg-noimg'; sp.style.setProperty('--c', im.dataset.c); im.replaceWith(sp); }; im.src = im.dataset.src; });
  $('lgNew').querySelectorAll('img.lg-por-s').forEach(im => loadLeaderInto(im, im.dataset.leader, () => { im.style.visibility = 'hidden'; }));
  $('lgNew').querySelectorAll('canvas[data-d]').forEach(c => paintSprite(c, +c.dataset.d, {sc:2, fit:56}));
  if(rw) Object.entries(rw).forEach(([id, n]) => { const c = document.createElement('span'); c.className = 'rwm'; c.title = REWARD_NAMES[id] || id; c.appendChild(rwIcon(id, (RW_LOOK[id] || {}).c || '#ffcc33')); c.append('×' + n); $('lgRw').appendChild(c); });
  $('lgGo').onclick = () => floorFight(gi);
  $('lgNew').querySelector('.lg-path').onclick = e => { const b = e.target.closest('.lg-n'); if(!b || b.disabled) return; liga.sel = +b.dataset.gi; ligaRender(); };
}
