"use strict";
/* =====================================================================
   8) MENÚ PRINCIPAL Y PANTALLAS: Historia, Equipo, Tienda, Pokédex, Gachapon...
   ===================================================================== */
// Iconos y avatar en pixel art: cada letra es un píxel
const ICONS = {
  story:["########","#..##..#","#..##..#","#..##..#","#..##..#","#..##..#","#..##..#","########"],
  team:["..####..",".#....#.","#......#","########","#..##..#","#......#",".#....#.","..####.."],
  shop:["..####..","..#..#..",".######.","#......#","#.####.#","#.#..#.#","#.####.#","########"],
  campo:["..####..",".#....#.","#..##..#","#.#..#.#","#.#..#.#","#..##..#",".#....#.","..####.."],
  tower:["...##...","..####..","..#..#..",".######.",".#.##.#.",".######.","##.##.##","########"],
  dex:["########","#......#","#.####.#","#.#..#.#","#.####.#","#......#","#..##..#","########"],
  gacha:["..####..",".#....#.","#.#..#.#","#......#","########","#.####.#","#.#..#.#","########"],
  rank:["########","#.####.#","#.####.#",".######.","..####..","...##...","..####..",".######."],
  friends:[".##.##..",".##.##..","..#.#...","####.###","####.###","#..#.#..","#..#.#..","........"],
  set:["...##...",".#.##.#.","..####..","###..###","###..###","..####..",".#.##.#.","...##..."],
  coin:["..####..",".######.","###..###","##.##.##","##.##.##","###..###",".######.","..####.."],
  ticket:["........","########","#.#.#.##","#.#.#.##","#.#.#.##","#.#.#.##","########","........"],
  profile:["..####..",".######.",".######.","..####..","...##...",".######.","########","########"],
  trophy:["##########","#.######.#","#.######.#","#.######.#",".#.####.#.","...####...","....##....","....##....","..######..","..######.."],
  lock:["..####..",".#....#.",".#....#.","########","########","###..###","###..###","########"]
};
ICONS.ach = ICONS.trophy;                       // el botón LOGROS usa el trofeo
const AVATAR = ["....kkkk....","...krrrrk...","..krrrrrrk..","..krrwwrrk..",".kkkkkkkkkk.",".kssssssssk.",".kskssssksk.",
                ".kssssssssk.","..kssssssk..",".kbbbbbbbbk.","kbbbwbbwbbbk","kbbbbbbbbbbk"];
const PAL_AVATAR = {k:'#0d1117', r:'#e23b3b', w:'#ffffff', s:'#f1c9a0', b:'#3ea6ff'};
const GACHA = [".....kkkkkk.....","...kkaaaaaakk...","..kaaapaaayaak..",".kaapppaayyyaak.",".kaapppaayyyaak.",".kawaaaapaaaaak.",
  ".kaaawwaapppaak.","..kaaawwaappak..","...kkaaaaaakk...","..kkrrrrrrrrkk..",".krrrrrrrrrrrrk.",".krrkkkkkkkkrrk.",
  ".krrkddddddkrrk.",".krrkddddddkrrk.",".krrrkkkkkkrrrk.",".krrrrrwwrrrrrk.",".krrrrrrrrrrrrk.",".kkkkkkkkkkkkkk."];
const PAL_GACHA = {k:'#0a0d14', a:'#8fd3ff', p:'#ff3ea5', y:'#ffcc33', w:'#ffffff', r:'#e23b3b', d:'#05070c'};

function bitmap(c, rows, col, pal){
  c.width = rows[0].length; c.height = rows.length;
  const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height);
  rows.forEach((row,j)=>[...row].forEach((ch,i)=>{ const k = pal ? pal[ch] : (ch === '#' ? col : null); if(k){ x.fillStyle = k; x.fillRect(i,j,1,1); } }));
}

// Botones del menú, en orden. 'lock' = cerrado.
const NAV = [
  {k:'story',   n:'HISTORIA',        c:'#ffcc33', d:'Recorre las regiones y vence a los líderes de gimnasio y al Alto Mando.', f:()=>`Combates de la Liga: ${progTotal()} / ${FLOORS.length}`},
  {k:'campo',   n:'CAMPO DE ENTRENAMIENTO', c:'#4ccf6a', d:`Vence a entrenadores todas las veces que quieras y gana ${rewardText({kind:'campo'})} por cada victoria.`, f:()=>`Chapas: ${held('chapaplata')} plateadas · ${held('chapa')} doradas`},
  {k:'team',    n:'EQUIPO POKÉMON',  c:'#3ea6ff', d:'Elige 3 Pokémon y equípales un objeto de combate.',                       f:()=>`Equipo: ${team.length} / 3`},
  {k:'shop',    n:'TIENDA',          c:'#ffcc33', d:'Compra tickets de Gachapon y objetos con tus Puntos de Batalla.',         f:()=>`Puntos de Batalla: ${save.bp}`},
  {k:'dex',     n:'POKÉDEX',         c:'#3ea6ff', d:'Tu colección de Pokémon desbloqueados.',                                  f:()=>`Desbloqueados: ${save.box.length} / ${DEX_TOTAL}`},
  {k:'gacha',   n:'GACHAPON',        c:'#ff3ea5', d:'Gasta tickets para conseguir Pokémon de cada región.',         f:()=>`Tickets: ${save.tickets} · Legendarios: ${save.ticketsL}`},
  {k:'set',     n:'AJUSTES',         c:'#9aa6b8', d:'Nombre, volumen, controles y pantalla completa.',                         f:()=>'Ajusta el juego a tu gusto'},
  {k:'rank',    n:'CLASIFICATORIA',  c:'#6d7899', d:'Aquí verás las mejores puntuaciones de todos los jugadores. Necesita cuentas de usuario, así que llegará cuando el juego esté en internet.', f:()=>'PRÓXIMAMENTE', soon:true},
  {k:'tower',   n:'TORRE BATALLA',   c:'#6d7899', d:'Se desbloquea al derrotar a los Campeones de todas las Ligas Pokémon (las 9 regiones de la Historia).', f:()=>leaguesWon() < REGIONS.length ? `BLOQUEADA · Ligas superadas: ${leaguesWon()} / ${REGIONS.length}` : 'Desbloqueada: pronto abrirá sus puertas', get lock(){ return leaguesWon() < REGIONS.length; }}
];
let navIdx = 0;
const thumbs = [], dexThumbs = [];                // miniaturas que se dibujan cuando cargan los sprites
const BACK = '<button id="btnBack3">← Menú</button>';

function pick(i){
  navIdx = i; const it = NAV[i];
  [...$('nav').children].forEach((b,j)=> b.classList.toggle('on', j === i));
  const inf = $('info'); inf.style.setProperty('--c', it.c);
  inf.innerHTML = `<h3>${it.n}</h3><p>${it.d}</p><p class="stat">${it.f()}</p>`;
}
function refreshHud(){
  $('pName').textContent = save.name; $('crumbs').innerHTML = crumbsHtml(''); refreshAvatars();     // nombre, migas de pan y avatar activo
  if(typeof dailyRefresh === 'function') dailyRefresh();
  $('bp').textContent = save.bp; $('tk').textContent = save.tickets + (save.ticketsL ? ` +${save.ticketsL}★` : ''); pick(navIdx);
}
function buildMain(){
  const nav = $('nav'); nav.innerHTML = '';
  NAV.forEach((it,i)=>{
    const b = document.createElement('button'); b.className = 'nb' + (it.lock ? ' lock' : '') + (it.soon ? ' soon' : ''); b.style.setProperty('--c', it.c);
    const c = document.createElement('canvas'); bitmap(c, ICONS[it.k], it.c); b.appendChild(c); b.append(it.n);
    b.onmouseenter = ()=>pick(i); b.onfocus = ()=>pick(i); b.onclick = ()=>enter(it.k); nav.appendChild(b);
  });
  bitmap($('icCoin'), ICONS.coin, '#ffcc33'); bitmap($('icTk'), ICONS.ticket, '#ff3ea5');
  refreshHud();
}
function enter(k){
  ({story:goRegions, campo:openCampo, team:openTeam, shop:openShop, dex:openDex, gacha:openGacha, profile:openProfile, ach:openAchievements, rank:()=>toast('La Clasificatoria llegará próximamente.'), friends:openFriends, bag:openBag, set:openSettings,
    tower:()=>toast(leaguesWon() < REGIONS.length ? `La Torre Batalla se desbloquea al derrotar todas las Ligas (${leaguesWon()}/${REGIONS.length} superadas).` : 'La Torre Batalla está desbloqueada: pronto abrirá sus puertas.')})[k]();
}
function goMain(){ refreshHud(); show('main'); }
function goStory(){ buildStory(); show('tower'); }
function goRegions(){ buildRegions(); show('regions'); }
function back(){
  if(!$('tower').classList.contains('hide')) goRegions();
  else if(!$('regions').classList.contains('hide') || !$('panel').classList.contains('hide') ||
          !$('dexv').classList.contains('hide') || !$('gachav').classList.contains('hide') || !$('teamv').classList.contains('hide')) goMain();
}
function mainKey(e){
  if(e.code === 'ArrowDown'){ navIdx = (navIdx+1) % NAV.length; [...$('nav').children][navIdx].focus(); e.preventDefault(); }
  if(e.code === 'ArrowUp'){ navIdx = (navIdx+NAV.length-1) % NAV.length; [...$('nav').children][navIdx].focus(); e.preventDefault(); }
}
function toast(msg){
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  setTimeout(()=>t.remove(), 2600);
}
// Abre el panel genérico con un título y un contenido
function panel(html){
  dexThumbs.length = 0; $('panelBody').classList.remove('wide'); $('panelBody').innerHTML = html + BACK; $('btnBack3').onclick = goMain; show('panel'); refreshAvatars();
}
function card(m, extra){                           // tarjeta de Pokémon con miniatura
  const d = document.createElement('div'); d.className = 'card';
  const c = document.createElement('canvas'); c.width = c.height = 64; d.appendChild(c);
  const b = document.createElement('b'); b.textContent = m.name; d.appendChild(b);
  d.append(m.types.join(' / ').toUpperCase()); if(extra){ d.appendChild(document.createElement('br')); d.append(extra); }
  return {d, c};
}

// ---- HISTORIA: regiones ----
const REGIONS = ['Kanto','Johto','Hoenn','Sinnoh','Unova / Teselia','Kalos','Alola','Galar','Paldea'];
const leaguesWon = () => REGIONS.filter(r => save.champ[r]).length;      // Ligas superadas (save.champ). Con las 9 se desbloquea la Torre Batalla
function buildRegions(){
  const grid = $('rgrid'); grid.innerHTML = '';
  $('rTower').textContent = leaguesWon() < REGIONS.length ? `Torre Batalla: se desbloquea al derrotar a los Campeones de todas las Ligas (${leaguesWon()}/${REGIONS.length} superadas).` : 'Torre Batalla: ¡has superado todas las Ligas!';
  REGIONS.forEach((n,i)=>{
    const playable = floorsOf(n).length > 0, prev = REGIONS[i-1];                 // jugable = ya tiene combates en FLOORS (Kanto y Johto)
    const open = playable && (i === 0 || !!save.champ[prev]);                      // se abre al ser Campeón de la región anterior
    const rec = progOf(n), done = open ? Math.min(8, rec) : 0, elite = open && rec >= 8;
    const d = document.createElement('div'); d.className = 'rcard' + (open ? ' open' : ' lock');
    let pips = ''; for(let k=0;k<8;k++) pips += `<i class="${k < done ? 'on' : ''}"></i>`;
    d.innerHTML = `<small>${i+1}</small><h3>${n}</h3><div class="pips">${pips}</div>` +
      `<div class="elite${elite ? ' ready' : ''}">ALTO MANDO · ${elite ? 'LISTO' : 'BLOQUEADO'}</div>` +
      (open ? `<p>${done}/8 líderes${rec > 8 ? ' · Liga ' + (rec - 8) + '/5' : ''}${save.champ[n] ? ' · 🏆 Campeón' : ''}</p>` : `<p class="lk">${playable ? 'Vence la Liga de ' + prev : 'Próximamente'}</p>`);
    if(open){
      d.tabIndex = 0;
      const go = ()=>{ save.region = n; persist(); goStory(); };          // la región elegida es la del Gachapon
      d.onclick = e => {
        if(e.target.closest('.elite') && elite){ toast('Alto Mando de ' + n + ': ¡adelante!'); go(); }
        else if(e.target.closest('.elite')) toast('Vence a los 8 líderes para desafiar al Alto Mando.');
        else go();
      };
      d.onkeydown = e => { if(e.code === 'Enter') go(); };
    }
    grid.appendChild(d);
  });
}

// ---- HISTORIA: líderes de la región ----
function buildStory(){
  $('stTitle').textContent = 'Historia · ' + save.region;
  const bar = $('teamBar'); bar.innerHTML = ''; thumbs.length = 0;
  team.forEach(id=>{
    const m = mon(id), {d,c} = card(m, save.equip[id] ? ITEMS[save.equip[id]].n : 'Sin objeto');
    thumbs.push({c,m,s:useShiny(id)}); bar.appendChild(d);
  });
  const ready = team.length === 3;
  $('teamWarn').textContent = ready ? '' : 'Elige 3 Pokémon en EQUIPO POKÉMON para poder combatir.';
  const fl = $('floors'), fl2 = $('floors2'), fl3 = $('floors3'); fl.innerHTML = ''; fl2.innerHTML = ''; fl3.innerHTML = '';   // líderes arriba, Alto Mando (con el Campeón) debajo
  const rec = progOf(save.region);
  FLOORS.forEach((F,gi)=>{                                          // gi = posición global (la que usa floorFight)
    if(F.region !== save.region) return;
    const i = F.idx, locked = i > rec, done = i < rec;
    const d = document.createElement('div'); d.className = 'lcard' + (done ? ' done' : '') + (locked ? ' locked' : '');
    const im = new Image(); im.alt = F.leader; loadLeaderInto(im, F.id, ()=>{ im.style.visibility = 'hidden'; });
    const t = document.createElement('div');
    t.innerHTML = `<h3>${done ? '★ ' : ''}${i+1}. ${F.leader}</h3><p>${F.kind === 'lider' ? 'Líder ' + F.tag : F.kind === 'alto' ? 'Alto Mando · ' + F.tag : 'Campeón de la Liga Pokémon'}${F.place ? ' · ' + F.place : ''} · 6 Pokémon${rewardText(F) ? '<br>Recompensa: ' + rewardText(F) : ''}</p>`;
    const b = document.createElement('button'); b.textContent = locked ? 'Bloqueado' : done ? 'Repetir' : 'Retar';
    b.disabled = locked || !ready; b.onclick = ()=>floorFight(gi);
    d.append(im, t, b); (F.kind === 'lider' ? fl : F.kind === 'alto' ? fl2 : fl3).appendChild(d);
  });
}

// ---- TIENDA: ver shop.js ----

// ---- CLASIFICATORIA, AMIGOS, AJUSTES ----
function openRank(){
  panel(`<h1>Clasificatoria</h1><table class="tbl"><tr><th>#</th><th>Entrenador</th><th>Líderes vencidos</th></tr>` +
    `<tr><td>1</td><td id="rkName"></td><td>${save.record}</td></tr>` + [2,3,4,5].map(n=>`<tr><td>${n}</td><td>---</td><td>---</td></tr>`).join('') + `</table>`);
  $('rkName').textContent = save.name;
}
function openFriends(){ panel(userBar('friends') + `<h1>Amigos</h1><p>Todavía no tienes contactos.</p><p class="help">Aquí irán tu lista de amigos, tu perfil y las funciones sociales.</p>`); }
// ---- AJUSTES: solo dos bloques, Pantalla completa y Audio (global, música, efectos y silenciar) ----
const fsOn = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
function openSettings(){
  const canFs = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  panel(`<h1>Ajustes</h1>
    <h2>Pantalla</h2>
    <label class="chk"><input id="fs" type="checkbox"${fsOn() ? ' checked' : ''}${canFs ? '' : ' disabled'}> Pantalla completa</label>
    ${canFs ? '' : '<p class="help">Tu navegador no permite la pantalla completa en esta página.</p>'}
    <h2>Audio</h2>
    <label>Volumen general: <b id="volN"></b><br><input id="vol" type="range" min="0" max="100" value="${save.vol}"></label>
    <label>Música: <b id="volMN"></b><br><input id="volM" type="range" min="0" max="100" value="${save.volMusic}"></label>
    <label>Efectos de sonido: <b id="volSN"></b><br><input id="volS" type="range" min="0" max="100" value="${save.volSfx}"></label>
    <label class="chk"><input id="mute" type="checkbox"${save.mute ? ' checked' : ''}> Silenciar todo el audio (tecla M)</label>`);
  const pct = (id, v) => { $(id).textContent = v + '%'; };
  pct('volN', save.vol); pct('volMN', save.volMusic); pct('volSN', save.volSfx);
  $('vol').oninput  = e => { Music.setVolume(e.target.value); pct('volN', save.vol); };
  $('volM').oninput = e => { Music.setMusicVolume(e.target.value); pct('volMN', save.volMusic); };
  $('volS').oninput = e => { Music.setSfxVolume(e.target.value); pct('volSN', save.volSfx); };
  $('volS').onchange = () => Sfx.play('click');                                      // al soltar el deslizador de efectos se oye cómo suenan
  $('mute').onchange = e => Music.setMute(e.target.checked);
  $('fs').onchange = e => {
    const el = document.documentElement;
    if(e.target.checked){ const r = (el.requestFullscreen || el.webkitRequestFullscreen).call(el); if(r && r.catch) r.catch(() => { e.target.checked = false; toast('El navegador no ha permitido la pantalla completa.'); }); }
    else if(fsOn()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  };
}
// El interruptor sigue al navegador (por ejemplo si sales de la pantalla completa con Esc o F11)
document.addEventListener('fullscreenchange', () => { const c = document.getElementById('fs'); if(c) c.checked = fsOn(); });
