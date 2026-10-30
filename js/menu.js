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
  {k:'story',   n:'HISTORIA',        c:'#ffcc33', d:'Recorre las regiones y vence a los líderes de gimnasio y al Alto Mando.', f:()=>`Combates de la Liga (${save.storyMode === 'facil' ? 'Fácil' : 'Difícil'}): ${progTotal()} / ${FLOORS.length}`},
  {k:'campo',   n:'CAMPO DE ENTRENAMIENTO', c:'#4ccf6a', d:`Vence a entrenadores todas las veces que quieras y gana 1 tirada de Gachapon + de ${REWARD_CAMPO[1].bp} a ${REWARD_CAMPO[3].bp} BP + de ${REWARD_CAMPO[1].chapa} a ${REWARD_CAMPO[3].chapa} Chapas Plateadas y Doradas (según la dificultad) por cada victoria.`, f:()=>`Chapas: ${held('chapaplata')} plateadas · ${held('chapa')} doradas`},
  {k:'team',    n:'EQUIPO POKÉMON',  c:'#3ea6ff', d:'Elige 3 Pokémon y equípales un objeto de combate.',                       f:()=>`Equipo: ${team.length} / 3`},
  {k:'shop',    n:'TIENDA',          c:'#ffcc33', d:'Compra tickets de Gachapon y objetos con tus Puntos de Batalla.',         f:()=>`Puntos de Batalla: ${save.bp}`},
  {k:'dex',     n:'POKÉDEX',         c:'#3ea6ff', d:'Tu colección de Pokémon desbloqueados.',                                  f:()=>`Desbloqueados: ${boxCount()} / ${DEX_SHOWN}`},
  {k:'gacha',   n:'GACHAPON',        c:'#ff3ea5', d:'Gasta tickets para conseguir Pokémon de cada región.',         f:()=>`Tickets: ${save.tickets} · Legendarios: ${save.ticketsL}`},
  {k:'set',     n:'AJUSTES',         c:'#9aa6b8', d:'Nombre, volumen, controles y pantalla completa.',                         f:()=>'Ajusta el juego a tu gusto'},
  {k:'rank',    n:'CLASIFICATORIA',  c:'#6d7899', d:'Aquí verás las mejores puntuaciones de todos los jugadores. Necesita cuentas de usuario, así que llegará cuando el juego esté en internet.', f:()=>'PRÓXIMAMENTE', soon:true},
  {k:'tower',   n:'TORRE BATALLA',   c:'#6d7899', d:'Se desbloquea al derrotar a los Campeones de todas las Ligas Pokémon (las 9 regiones de la Historia).', f:()=>leaguesWon() < REGIONS.length ? `BLOQUEADA · Ligas superadas: ${leaguesWon()} / ${REGIONS.length}` : 'Desbloqueada: pronto abrirá sus puertas', get lock(){ return leaguesWon() < REGIONS.length; }}
];
let navIdx = 0;
const thumbs = [], dexThumbs = [];                // miniaturas que se dibujan cuando cargan los sprites
const BACK = '<button id="btnBack3">← Menú</button>';       // se pone ARRIBA de cada panel (los botones de Menú/Volver van siempre arriba)

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
  dexThumbs.length = 0; $('panelBody').classList.remove('wide'); $('panelBody').innerHTML = BACK + html; $('btnBack3').onclick = goMain; show('panel'); refreshAvatars();
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
const REGION_IMG = {'Unova / Teselia':'Unova'};                        // mapa de cada región: region/tarjetas/<nombre>.webp (recortado para la tarjeta). Solo hace falta si el archivo se llama distinto
const leaguesWon = () => REGIONS.filter(champAny).length;      // Ligas superadas (save.champ). Con las 9 se desbloquea la Torre Batalla
function buildRegions(){
  const grid = $('rgrid'); grid.innerHTML = '';
  storyToggle($('rMode'), buildRegions);                                                            // botón Fácil / Difícil, cada una con su avance (js/dificultad.js)
  $('rTower').textContent = leaguesWon() < REGIONS.length ? `Torre Batalla: se desbloquea al derrotar a los Campeones de todas las Ligas (${leaguesWon()}/${REGIONS.length} superadas).` : 'Torre Batalla: ¡has superado todas las Ligas!';
  REGIONS.forEach((n,i)=>{
    const playable = floorsOf(n).length > 0, prev = REGIONS[i-1];                 // jugable = ya tiene combates en FLOORS (Kanto y Johto)
    const open = playable && (i === 0 || champOf(prev) || !!PREVIEW[n]);                      // se abre al ser Campeón de la región anterior
    const nL = floorsOf(n).filter(F => F.kind === 'lider').length || 8;                              // nº de líderes de la región (8 en casi todas; Teselia tiene 10)
    const rec = PREVIEW[n] ? 99 : progOf(n), done = open ? Math.min(nL, rec) : 0, elite = open && rec >= nL;
    const d = document.createElement('div'); d.className = 'rcard' + (open ? ' open' : ' lock');
    d.style.setProperty('--map', `url("../region/tarjetas/${REGION_IMG[n] || n}.webp")`);        // imagen de fondo de la tarjeta (ver .rcard::before en style.css)
    let pips = ''; for(let k=0;k<nL;k++) pips += `<i class="${k < done ? 'on' : ''}"></i>`;
    d.innerHTML = `<small>${i+1}</small><h3>${n}</h3><div class="pips${nL > 8 ? ' many' : ''}">${pips}</div>` +
      `<div class="elite${elite ? ' ready' : ''}">ALTO MANDO · ${elite ? 'LISTO' : 'BLOQUEADO'}</div>` +
      (open ? `<p>${done}/${nL} líderes${rec > nL ? ' · Liga ' + Math.min(5, rec - nL) + '/5' : ''}${champOf(n) ? ' · 🏆 Campeón' : ''}</p>` : `<p class="lk">${playable ? 'Vence la Liga de ' + prev : 'Próximamente'}</p>`);
    if(open){
      d.tabIndex = 0;
      const go = ()=>{ save.region = n; persist(); goStory(); };          // la región elegida es la del Gachapon
      d.onclick = e => {
        if(e.target.closest('.elite') && elite){ toast('Alto Mando de ' + n + ': ¡adelante!'); go(); }
        else if(e.target.closest('.elite')) toast('Vence a los ' + nL + ' líderes para desafiar al Alto Mando.');
        else go();
      };
      d.onkeydown = e => { if(e.code === 'Enter') go(); };
    }
    grid.appendChild(d);
  });
}

// ---- HISTORIA: líderes de la región ----
const TYPE_OF_TAG = Object.fromEntries(Object.entries(TYPE_ES).map(([k, v]) => [v, k]));            // 'Roca' → 'roca' (color del líder: TC)
const tagColor = F => F.kind === 'campeon' ? '#ffcc33' : (TC[TYPE_OF_TAG[F.tag]] || '#8fb3e8');
function buildStory(){
  const R = save.region, fls = FLOORS.map((F, gi) => ({F, gi})).filter(x => x.F.region === R);
  const rec = PREVIEW[R] ? 99 : progOf(R);                                // modo ver (data.js): todos los combates abiertos
  const cnt = k => fls.filter(x => x.F.kind === k).length, doneK = k => fls.filter(x => x.F.kind === k && x.F.idx < rec).length;
  const champDone = champOf(R);
  // ---- banner de la región: imagen de fondo, título y contadores ----
  $('stTitle').textContent = 'Historia · ' + R + ' · ' + (save.storyMode === 'facil' ? 'Fácil' : 'Difícil');
  $('stBanner').style.setProperty('--map', `url("../region/tarjetas/${REGION_IMG[R] || R}.webp")`);
  $('stChips').innerHTML =
    `<span class="stc"><b>★ ${doneK('lider')}/${cnt('lider')}</b> líderes</span><span class="stc"><b>${doneK('alto')}/${cnt('alto')}</b> Alto Mando</span><span class="stc${champDone ? ' gold' : ''}"><b>${champDone ? '🏆' : '0/1'}</b> Campeón</span>`;
  // ---- camino: un punto por combate (✓ hecho · dorado = el siguiente · candado = bloqueado) ----
  const nextI = fls.findIndex(x => x.F.idx >= rec), nextF = nextI >= 0 ? fls[nextI].F : null;
  $('stPath').innerHTML = '<div class="stp-line">' + fls.map(({F}, k) => {
      const st = F.idx < rec ? 'done' : F.idx === rec ? 'cur' : 'lock', col = st === 'lock' ? '' : `style="--c:${tagColor(F)}"`;
      const lab = F.kind === 'campeon' ? '♛' : F.kind === 'alto' ? 'AM' : F.idx + 1;
      return `<i class="stp ${st} ${F.kind}" ${col} title="${st === 'lock' ? '???' : esc(F.leader)}">${st === 'done' ? '✓' : st === 'lock' ? '🔒' : lab}</i>`;
    }).join('') + '</div>' +
    `<p class="stp-next">${nextF ? `Siguiente: <b>${esc(nextF.leader)}</b>${nextF.kind === 'lider' ? ' · Líder ' + esc(nextF.tag) : nextF.kind === 'alto' ? ' · Alto Mando' : ' · Campeón'}${nextF.place ? ' · ' + esc(nextF.place) : ''}` : '¡Has vencido a todos en esta región!'}</p>`;
  // ---- tu equipo (compacto) ----
  fillTeamSel('stTeamSel', buildStory);                                                  // selector de equipo (team.js)
  const bar = $('teamBar'); bar.innerHTML = ''; thumbs.length = 0;
  team.forEach(id=>{
    const m = mon(id), d = document.createElement('div'); d.className = 'card';           // carta compacta: miniatura + nombre + tipos + objeto
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const nm = document.createElement('b'); nm.textContent = m.name;
    const ty = document.createElement('span'); ty.className = 'tt'; ty.textContent = m.types.join(' / ').toUpperCase();
    const it = document.createElement('span'); it.className = 'ti'; it.textContent = save.equip[id] ? ITEMS[save.equip[id]].n : 'Sin objeto';
    d.append(c, nm, ty, it); thumbs.push({c,m,s:useShiny(id)}); bar.appendChild(d);
  });
  const ready = team.length === 3;
  $('teamWarn').textContent = ready ? '' : 'Elige 3 Pokémon en EQUIPO POKÉMON para poder combatir.';
  const fl = $('floors'), fl2 = $('floors2'), fl3 = $('floors3'); fl.innerHTML = ''; fl2.innerHTML = ''; fl3.innerHTML = '';   // líderes arriba, Alto Mando (con el Campeón) debajo
  fls.forEach(({F, gi}) => {                                         // gi = posición global (la que usa floorFight)
    const i = F.idx, locked = i > rec, done = i < rec, cur = i === rec;
    const d = document.createElement('div'); d.className = 'lcard ' + F.kind + (done ? ' done' : '') + (cur ? ' cur' : '') + (locked ? ' locked mystery' : '');      // mystery: los rivales que aún no te toca ver salen ocultos (silueta y «???»)
    d.style.setProperty('--tc', locked ? '#556080' : tagColor(F));
    const fr = document.createElement('div'); fr.className = 'lc-img';
    const im = new Image(); im.alt = locked ? '???' : F.leader; loadLeaderInto(im, F.id, ()=>{ im.style.visibility = 'hidden'; });
    fr.appendChild(im); if(locked){ const lk = document.createElement('span'); lk.className = 'lc-lock'; lk.textContent = '🔒'; fr.appendChild(lk); } else if(done){ const md = document.createElement('span'); md.className = 'lc-medal'; md.textContent = F.kind === 'campeon' ? '♛' : '★'; fr.appendChild(md); }
    const t = document.createElement('div'); t.className = 'lc-body';
    if(locked) t.innerHTML = `<h3><em>${i+1}.</em> ???</h3><p class="lc-sub">${F.kind === 'lider' ? 'Líder de gimnasio' : F.kind === 'alto' ? 'Alto Mando' : 'Campeón de la Liga Pokémon'} · ??? · 6 Pokémon</p><p class="lc-hint">Vence al anterior para descubrir quién es.</p>`;      // no se ve nombre, tipo ni lugar hasta que le toque
    else{
      const ty = TYPE_OF_TAG[F.tag], badge = F.kind === 'campeon' ? '<span class="tb" style="background:#b8860b">Campeón</span>' : ty ? `<span class="tb" style="background:${TC[ty]}">${esc(F.tag)}</span>` : '';
      t.innerHTML = `<h3><em>${i+1}.</em> ${esc(F.leader)}</h3><p class="lc-sub">${badge}<span>${F.kind === 'lider' ? 'Líder de gimnasio' : F.kind === 'alto' ? 'Alto Mando' : 'Liga Pokémon'}${F.place ? ' · ' + esc(F.place) : ''}</span></p>`;
      const mini = document.createElement('div'); mini.className = 'lc-mini'; mini.title = 'Los 6 Pokémon del rival';       // los 6 Pokémon del rival en miniatura (se dibujan con el resto de miniaturas, ui.js)
      (F.teams || []).slice(0, 6).forEach(e => { const dx = typeof e === 'number' ? e : e.dex, c = document.createElement('canvas'); c.width = c.height = 64; mini.appendChild(c); thumbs.push({c, m: mon(dx), s: false}); });
      t.appendChild(mini);
      const rw = typeof rewardOf === 'function' ? rewardOf(F) : null;
      if(rw){ const row = document.createElement('div'); row.className = 'lc-rw'; row.title = 'Recompensa: ' + rewardText(F);
        Object.entries(rw).forEach(([id, n]) => { const c = document.createElement('span'); c.className = 'rwm'; c.appendChild(rwIcon(id, (RW_LOOK[id] || {}).c || '#ffcc33')); c.append('×' + n); row.appendChild(c); });
        t.appendChild(row); }
    }
    const b = document.createElement('button'); b.className = 'lc-btn ' + (locked ? 'lock' : done ? 'rep' : 'go'); b.textContent = locked ? '🔒 Bloqueado' : done ? 'Repetir' : 'Retar';
    b.disabled = locked || !ready; b.onclick = ()=>floorFight(gi);
    d.append(fr, t, b); (F.kind === 'lider' ? fl : F.kind === 'alto' ? fl2 : fl3).appendChild(d);
  });
}

// ---- TIENDA: ver shop.js ----

// ---- CLASIFICATORIA, AMIGOS, AJUSTES ----
function openRank(){
  panel(`<h1>Clasificatoria</h1><table class="tbl"><tr><th>#</th><th>Entrenador</th><th>Líderes vencidos</th></tr>` +
    `<tr><td>1</td><td id="rkName"></td><td>${save.record}</td></tr>` + [2,3,4,5].map(n=>`<tr><td>${n}</td><td>---</td><td>---</td></tr>`).join('') + `</table>`);
  $('rkName').textContent = save.name;
}
// openFriends() (Amigos y cuenta) está en js/cloudui.js
// ---- AJUSTES: Pantalla completa, Audio (general, música del menú, música de combate, efectos y silenciar) y Controles (js/controls.js) ----
const fsOn = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
function openSettings(){
  const canFs = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  panel(`<h1>Ajustes</h1>
    <h2>Pantalla</h2>
    <label class="chk"><input id="fs" type="checkbox"${fsOn() ? ' checked' : ''}${canFs ? '' : ' disabled'}> Pantalla completa</label>
    ${canFs ? '' : '<p class="help">Tu navegador no permite la pantalla completa en esta página.</p>'}
    <h2>Audio</h2>
    <label>Volumen general: <b id="volN"></b><br><input id="vol" type="range" min="0" max="100" value="${save.vol}"></label>
    <label>Música del menú: <b id="volMN"></b><br><input id="volM" type="range" min="0" max="100" value="${save.volMenu}"></label>
    <label>Música de combate: <b id="volBN"></b><br><input id="volB" type="range" min="0" max="100" value="${save.volBattle}"></label>
    <label>Efectos de sonido: <b id="volSN"></b><br><input id="volS" type="range" min="0" max="100" value="${save.volSfx}"></label>
    <label class="chk"><input id="mute" type="checkbox"${save.mute ? ' checked' : ''}> Silenciar todo el audio (tecla M)</label>
    ${ctlSettingsHtml()}`);
  const pct = (id, v) => { $(id).textContent = v + '%'; };
  pct('volN', save.vol); pct('volMN', save.volMenu); pct('volBN', save.volBattle); pct('volSN', save.volSfx);
  $('vol').oninput  = e => { Music.setVolume(e.target.value); pct('volN', save.vol); };
  $('volM').oninput = e => { Music.setMenuVolume(e.target.value); pct('volMN', save.volMenu); };
  $('volB').oninput = e => { Music.setBattleVolume(e.target.value); pct('volBN', save.volBattle); };
  ctlSettingsBind();
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
