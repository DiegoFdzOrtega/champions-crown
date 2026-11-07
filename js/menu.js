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
ICONS.pruebas = ["..####..","...##...","...##...","..#..#..",".#....#.","#.####.#","#.####.#",".######."];   // matraz: Campo de pruebas
ICONS.ach = ICONS.trophy;                       // el botón LOGROS usa el trofeo
const AVATAR = ["....kkkk....","...krrrrk...","..krrrrrrk..","..krrwwrrk..",".kkkkkkkkkk.",".kssssssssk.",".kskssssksk.",
                ".kssssssssk.","..kssssssk..",".kbbbbbbbbk.","kbbbwbbwbbbk","kbbbbbbbbbbk"];
const PAL_AVATAR = {k:'#0d1117', r:'#e23b3b', w:'#ffffff', s:'#f1c9a0', b:'#3ea6ff'};
const GACHA = [".....kkkkkk.....","...kkaaaaaakk...","..kaaapaaayaak..",".kaapppaayyyaak.",".kaapppaayyyaak.",".kawaaaapaaaaak.",
  ".kaaawwaapppaak.","..kaaawwaappak..","...kkaaaaaakk...","..kkrrrrrrrrkk..",".krrrrrrrrrrrrk.",".krrkkkkkkkkrrk.",
  ".krrkddddddkrrk.",".krrkddddddkrrk.",".krrrkkkkkkrrrk.",".krrrrrwwrrrrrk.",".krrrrrrrrrrrrk.",".kkkkkkkkkkkkkk."];
const PAL_GACHA = {k:'#0a0d14', a:'#8fd3ff', p:'#ff3ea5', y:'#ffcc33', w:'#ffffff', r:'#e23b3b', d:'#05070c'};

// ICONOS NUEVOS de monedas y tickets (carpeta iconos/): si se pide el dibujo de la moneda o del ticket, se pinta la imagen en su lugar.
// Color del ticket: rosa = normal, dorado = legendario, cian = variocolor. CUR_IMG = false vuelve a los iconos pixelados de siempre.
const CUR_IMG = true;
const CUR_SRC = {bp:'iconos/bp.webp', ticket:'iconos/ticket.webp', ticket_l:'iconos/ticket_l.webp', ticket_s:'iconos/ticket_s.webp'};
const CUR_IM = {}; if(CUR_IMG) for(const k in CUR_SRC){ const im = new Image(); im.src = CUR_SRC[k]; CUR_IM[k] = im; }
const curKey = (rows, col) => !CUR_IMG || typeof ICONS === 'undefined' ? '' : rows === ICONS.coin ? 'bp' : rows === ICONS.ticket ? (/^#(ffcc33|ffd|ffe)/i.test(col || '') ? 'ticket_l' : /^#(7af0ff|3ee0c8)/i.test(col || '') ? 'ticket_s' : 'ticket') : '';
function bitmap(c, rows, col, pal){
  const ck = curKey(rows, col);
  if(ck){                                                     // icono nuevo (imagen): se dibuja en cuanto carga
    c.width = c.height = 64; c.classList.add('curimg');
    const im = CUR_IM[ck], draw = () => { const x = c.getContext('2d'); x.clearRect(0, 0, 64, 64); x.imageSmoothingEnabled = true; x.drawImage(im, 0, 0, 64, 64); };
    if(im.complete && im.naturalWidth) draw(); else im.addEventListener('load', draw, {once:true});
    return;
  }
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
  {k:'gacha',   n:'GACHAPON',        c:'#ff3ea5', d:'Gasta tickets para conseguir Pokémon de cada región.',         f:()=>`Tickets: ${save.tickets} · Legendarios: ${save.ticketsL}` + (save.ticketsS ? ` · Variocolor: ${save.ticketsS}` : '')},
  {k:'set',     n:'AJUSTES',         c:'#9aa6b8', d:'Nombre, volumen, controles y pantalla completa.',                         f:()=>'Ajusta el juego a tu gusto'},
  {k:'rank',    n:'CLASIFICATORIA',  c:'#ffcc33', d:'Combates online contra otros jugadores por puntos: sube de Bronce a Challenger. Necesitas una cuenta.', f:()=>{ const r = save.ranked || {pts:0}, t = typeof rkTier === 'function' ? rkTier(r.pts) : null; return t ? `Rango: ${t.n} · ${r.pts} PC` : 'Combates online por puntos'; }},
  {k:'tower',   n:'TORRE BATALLA',   c:'#ff9a3a', d:'50 pisos contra personajes del mundo Pokémon (héroes, rivales, villanos, anime...) y un Campeón cada 10 pisos. Tus Pokémon se curan en cada piso y cada piso da premios. Se abre al ser Campeón de Kanto.', f:()=>towerOpen() ? `Tu récord: piso ${save.tower.best}` : 'BLOQUEADA · Sé Campeón de Kanto', get lock(){ return !towerOpen(); }}
  // {k:'pruebas', n:'CAMPO DE PRUEBAS', c:'#b06cff', d:'Zona de pruebas: combate contra la IA en el estadio nuevo (Torre Batalla). No da recompensas ni cambia tu progreso.', f:()=>'Estadio nuevo · en pruebas'}   // js/pruebas.js · OCULTO: quita las // (y pon una coma al final de la línea de arriba) para volver a enseñarlo
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
  $('pName').textContent = trainerName(); $('crumbs').innerHTML = crumbsHtml(''); refreshAvatars();     // nombre, migas de pan y avatar activo
  if(typeof dailyRefresh === 'function') dailyRefresh();
  $('bp').textContent = save.bp; $('tk').textContent = save.tickets + (save.ticketsL ? ` +${save.ticketsL}★` : '') + (save.ticketsS ? ` +${save.ticketsS}✦` : ''); pick(navIdx);
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
  ({story:goRegions, campo:openCampo, team:openTeam, shop:openShop, dex:openDex, gacha:openGacha, profile:openProfile, ach:openAchievements, rank:()=>openRanked(), pruebas:openPruebas, friends:openFriends, account:openAccount, bag:openBag, set:openSettings,
    tower:()=>towerOpen() ? openTorre() : toast('La Torre Batalla se abre al ser Campeón de Kanto.')})[k]();
}
function goMain(){ refreshHud(); show('main'); if(typeof cloudGiftsCheck === 'function') cloudGiftsCheck(); }      // al volver al menú, mira si te han regalado algo (js/gifts.js)
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
// Los avisos salen de UNO EN UNO: si llega otro mientras hay uno en pantalla, espera su turno (así nunca se pisan).
const toastQ = []; let toastOn = false;
function toast(msg){ toastQ.push(msg); if(!toastOn) toastNext(); }
function toastNext(){
  const msg = toastQ.shift(); if(msg === undefined){ toastOn = false; return; }
  toastOn = true;
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  setTimeout(()=>{ t.remove(); setTimeout(toastNext, 200); }, 2600);
}
// Abre el panel genérico con un título y un contenido
function panel(html){
  dexThumbs.length = 0; $('panelBody').classList.remove('wide', 'shopv'); $('panelBody').innerHTML = BACK + html; $('btnBack3').onclick = goMain; show('panel'); refreshAvatars();
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
  $('rTower').textContent = !towerOpen() ? 'Torre Batalla: se abre al ser Campeón de Kanto.' : 'Torre Batalla: ¡abierta! Pulsa «Torre Batalla» en el menú principal.';
  // Medallas de una región: la medalla real de cada líder (lideres/<Región>/Medallas/), los retratos del Alto Mando y del Campeón.
  // Lo que aún no has vencido sale apagado (silueta); lo siguiente por superar parpadea. Si falta una imagen, sale un círculo del color del tipo.
  const medals = (n, nL, rec, cur) => {
    const fl = floorsOf(n), dir = encodeURIComponent((typeof REGION_DIR !== 'undefined' && REGION_DIR[n]) || n), R0 = save.region;
    const nextIdx = cur ? rec : -1;
    const stc = f => (f.idx < rec ? ' on' : f.idx === nextIdx ? ' nx' : '');
    let lead = '', elite = '', champ = '';
    fl.forEach(f => {
      if(f.kind === 'lider'){
        const md = (typeof LIGA_INFO !== 'undefined' && (LIGA_INFO[f.id] || {}).medal) || '';
        lead += md ? `<img class="mimg${stc(f)}" data-src="lideres/${dir}/Medallas/Medalla_${encodeURIComponent(md)}.webp" data-c="${tagColor(f)}" alt="" title="${esc(f.leader)}">`
                   : `<span class="mimg mc${stc(f)}" style="--c:${tagColor(f)}"></span>`;
      } else {
        save.region = n; const paths = leaderPaths(f.id); save.region = R0;                 // leaderPaths usa la región activa: se cambia un instante
        const im = `<img class="mpor${stc(f)}${f.kind === 'campeon' ? ' ch' : ''}" data-p='${JSON.stringify(paths)}' alt="" title="${esc(f.leader)}">`;
        if(f.kind === 'alto') elite += im; else champ += im;
      }
    });
    return `<div class="mrow">${lead}</div><div class="mrow mr2"><div class="mel">${elite}</div>${champ ? `<div class="mch"><b>♛</b>${champ}</div>` : ''}</div>`;
  };
  const hydrate = root => {
    root.querySelectorAll('img.mimg').forEach(im => { im.onerror = () => { im.onerror = null; const s = document.createElement('span'); s.className = im.className.replace('mimg', 'mimg mc'); s.style.setProperty('--c', im.dataset.c); im.replaceWith(s); }; im.src = im.dataset.src; });
    root.querySelectorAll('img.mpor').forEach(im => { const L = JSON.parse(im.dataset.p); let k = 0; im.onerror = () => { if(++k < L.length) im.src = L[k]; else im.style.visibility = 'hidden'; }; im.src = L[0]; });
  };
  const items = [];
  REGIONS.forEach((n,i)=>{
    const total = floorsOf(n).length, playable = total > 0, prev = REGIONS[i-1];       // jugable = ya tiene combates en FLOORS
    const open = playable && (i === 0 || champOf(prev) || !!PREVIEW[n]);                      // se abre al ser Campeón de la región anterior
    const nL = floorsOf(n).filter(F => F.kind === 'lider').length || 8;                              // nº de líderes de la región (8 en casi todas; Teselia tiene 10)
    const rec = PREVIEW[n] ? 99 : progOf(n), done = open ? Math.min(nL, rec) : 0, elite = open ? Math.max(0, Math.min(4, rec - nL)) : 0;
    const champ = open && champOf(n), st = champ ? 'done' : open ? 'now' : 'lock';
    const pct = open && total ? Math.round(Math.min(rec, total) / total * 100) : 0;
    items.push({n, i, total, playable, prev, open, nL, rec, done, elite, champ, st, pct});
    const d = document.createElement('div'); d.className = 'rcard ' + st + (open ? ' open' : ' lock');
    d.style.setProperty('--map', `url("../region/tarjetas/${REGION_IMG[n] || n}.webp")`);        // imagen de fondo de la tarjeta (ver .rcard::before en style.css)
    const badge = champ ? '★ COMPLETADA' : open ? 'EN CURSO' : playable ? 'BLOQUEADA' : 'PRÓXIMAMENTE';
    d.title = open ? `${done}/${nL} líderes · Liga ${Math.max(0, Math.min(5, rec - nL))}/5${champ ? ' · Campeón' : ''}` : (playable ? 'Vence la Liga de ' + prev : 'Próximamente');
    d.innerHTML = `<small>${i+1}</small><span class="rbadge ${st}">${badge}</span>` +
      (open ? '' : '<span class="rlock">🔒</span>') +
      `<div class="rinfo"><h3>${n}</h3><div class="rbar"><i style="width:${pct}%"></i></div></div>`;
    hydrate(d);
    if(open){
      d.tabIndex = 0;
      const go = ()=>{ save.region = n; persist(); goStory(); };          // la región elegida es la del Gachapon
      d.onclick = go;
      d.onkeydown = e => { if(e.code === 'Enter') go(); };
    }
    grid.appendChild(d);
  });
  // ---- resumen de arriba: regiones superadas y combates ----
  const won = items.filter(x => x.champ).length, played = items.filter(x => x.open), totalAll = items.reduce((a, x) => a + x.total, 0);
  const recAll = items.reduce((a, x) => a + (x.open ? Math.min(x.rec, x.total) : 0), 0), pAll = totalAll ? Math.round(recAll / totalAll * 100) : 0;
  $('rSum').innerHTML = `<div class="rs-big"><b>${won}</b> / ${REGIONS.length} regiones</div><div class="rs-bar"><i style="width:${pAll}%"></i></div><span>${recAll} de ${totalAll} combates</span>`;
  // ---- tarjeta destacada: «Continúa aquí» (la primera región abierta sin completar; si están todas, la última) ----
  const cur = played.find(x => !x.champ) || played[played.length - 1], F = $('rFeat'); F.innerHTML = '';
  if(cur){
    const all = !!cur.champ, fls = floorsOf(cur.n), nextF = all ? null : fls.find(f => f.idx >= cur.rec);
    const nx = all ? 'Has superado todas las Ligas disponibles. ¡Puedes repasarlas cuando quieras!' : nextF ? `Siguiente: <b>${esc(nextF.leader)}</b>${nextF.kind === 'lider' ? ' · Líder ' + esc(nextF.tag) : nextF.kind === 'alto' ? ' · Alto Mando' : ' · Campeón'}${nextF.place ? ' · ' + esc(nextF.place) : ''}` : '';
    const d = document.createElement('div'); d.className = 'rfeat'; d.tabIndex = 0;
    d.style.setProperty('--map', `url("../region/tarjetas/${REGION_IMG[cur.n] || cur.n}.webp")`);
    d.innerHTML = `<div class="rf-in"><div><span class="rf-tag">${all ? 'TODO AL DÍA' : 'CONTINÚA AQUÍ'}</span><h2>${cur.n}</h2><p>${nx}</p></div>` +
      `<div><div class="mdls${cur.nL > 8 ? ' many' : ''}">${medals(cur.n, cur.nL, cur.rec, !all)}</div><button class="rf-go" type="button">${all ? '↻ Repasar' : '▶ Continuar'}</button></div></div>`;
    const go = ()=>{ save.region = cur.n; persist(); goStory(); };
    d.onclick = go; d.onkeydown = e => { if(e.code === 'Enter') go(); };
    hydrate(d); F.appendChild(d);
  }
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
  $('rkName').textContent = trainerName();
}
// openFriends() (Amigos) y openAccount() (Cuenta) están en js/cloudui.js
// ---- AJUSTES: Pantalla completa, Audio (general, música del menú, música de combate, efectos y silenciar) y Controles (js/controls.js) ----
const fsOn = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
let stgTab = 'acc';                                                       // sección de Ajustes abierta (se recuerda mientras juegas)
const STG_ICO = {
  cred: '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  acc: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
  pan: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  aud: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  ctl: '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="5"/><path d="M7 10v4M5 12h4"/><circle cx="16" cy="11" r="1"/><circle cx="18" cy="13" r="1"/></svg>',
  mus: '<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
  sfx: '<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  swd: '<svg viewBox="0 0 24 24"><path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/></svg>'};
function openSettings(){
  const canFs = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  const logged = typeof cloud !== 'undefined' && cloud.user, nm = logged && cloud.name;
  const google = logged && typeof cloudHasGoogle === 'function' && cloudHasGoogle();
  const sw = (id, on, t, d, dis) => `<label class="sw${dis ? ' dis' : ''}"><span class="swT"><b>${t}</b>${d ? `<small>${d}</small>` : ''}</span><input id="${id}" type="checkbox"${on ? ' checked' : ''}${dis ? ' disabled' : ''}><i></i></label>`;
  const sl = (id, ico, t, v) => `<div class="sl"><span class="slI">${STG_ICO[ico]}</span><span class="slT">${t}</span><input id="${id}" type="range" min="0" max="100" value="${v}"><b id="${id}N"></b></div>`;
  const NAV = [['acc', 'Cuenta'], ['pan', 'Pantalla'], ['aud', 'Audio'], ['ctl', 'Controles'], ['cred', 'Créditos']];
  panel(`<div class="stg"><h1>Ajustes</h1>
    <div class="stgL">
      <nav class="stgNav">${NAV.map(([k, n]) => `<button data-s="${k}" class="${stgTab === k ? 'on' : ''}">${STG_ICO[k]}<span>${n}</span></button>`).join('')}</nav>
      <div class="stgBody">
        <section class="stgS" data-s="acc"><h2>Cuenta</h2>
          <div class="stgAcc"><img class="av" alt=""><div class="stgWho"><b>${nm ? esc(nm) : logged ? 'Sin nombre de jugador' : 'Invitado'}</b>
            <small class="${logged ? 'ok' : ''}">${logged ? '● Partida guardada en la nube' + (google ? ' · Google vinculado' : '') : 'Tu partida solo está en este navegador'}</small></div>
            <button id="setAcc" class="${logged ? '' : 'main'}">${logged ? 'Gestionar cuenta' : 'Entrar o crear cuenta'}</button></div>
          ${logged ? '' : '<p class="stgTip">Con una cuenta guardas tu progreso, juegas desde el móvil y puedes añadir amigos y jugar la Clasificatoria.</p>'}
        </section>
        <section class="stgS" data-s="pan"><h2>Pantalla</h2>
          <div class="stgCard">
            ${sw('fs', fsOn(), 'Pantalla completa', canFs ? 'Oculta las barras del navegador.' : 'Tu navegador no lo permite en esta página.', !canFs)}
            ${sw('fxhd', fxhd.on, 'Efectos de ataque mejorados', 'Brillos y marcas en el suelo. Desactívalo si el juego va lento.')}
          </div>
          <div class="stgCard"><div class="sw stgPerf"><span class="swT"><b>Modo rendimiento</b><small>Menos resolución y sin los brillos más pesados: el combate va mucho más fluido en móviles. ${LOWFX ? '<em class="ok">Ahora está activado.</em>' : 'Ahora está desactivado.'}</small></span>
            <div class="seg" id="perfSeg">${[['auto', 'Auto'], ['1', 'Sí'], ['0', 'No']].map(([v, n]) => `<button data-v="${v}" class="${perfPref() === v ? 'on' : ''}">${n}</button>`).join('')}</div></div></div>
        </section>
        <section class="stgS" data-s="aud"><h2>Audio</h2>
          <div class="stgCard">
            ${sl('vol', 'aud', 'Volumen general', save.vol)}
            ${sl('volM', 'mus', 'Música del menú', save.volMenu)}
            ${sl('volB', 'swd', 'Música de combate', save.volBattle)}
            ${sl('volS', 'sfx', 'Efectos de sonido', save.volSfx)}
          </div>
          <div class="stgCard">${sw('mute', save.mute, 'Silenciar todo', 'Atajo: tecla M')}</div>
        </section>
        <section class="stgS" data-s="ctl">${ctlSettingsHtml()}</section>
        <section class="stgS" data-s="cred"><h2>Créditos</h2>
          <div class="stgCard stgCred">
            <p><b>Champions Crown</b> es un juego de fans, gratuito y sin ánimo de lucro, hecho por Diego Fernández Ortega.</p>
            <p><b>Sprites de entrenadores</b> (Invocación): <a href="https://play.pokemonshowdown.com/sprites/trainers/" target="_blank" rel="noopener">Pokémon Showdown</a> y los artistas que los dibujaron.</p>
            <p><b>Datos de Pokémon, movimientos y evoluciones:</b> <a href="https://github.com/smogon/pokemon-showdown" target="_blank" rel="noopener">Pokémon Showdown</a> (Smogon).</p>
            <p class="stgTip">Pokémon y sus personajes son © Nintendo, Game Freak, Creatures y The Pokémon Company. Este juego no está afiliado a ellos.</p>
          </div>
        </section>
      </div>
    </div></div>`);
  $('panelBody').classList.add('wide');
  const showTab = k => { stgTab = k; document.querySelectorAll('.stgNav button').forEach(b => b.classList.toggle('on', b.dataset.s === k)); document.querySelectorAll('.stgS').forEach(x => x.classList.toggle('on', x.dataset.s === k)); };
  document.querySelector('.stgNav').onclick = e => { const b = e.target.closest('button'); if(b) showTab(b.dataset.s); };
  showTab(stgTab);
  const pct = (id, v) => { $(id + 'N').textContent = v + '%'; $(id).style.setProperty('--v', v + '%'); };
  [['vol', save.vol], ['volM', save.volMenu], ['volB', save.volBattle], ['volS', save.volSfx]].forEach(([id, v]) => pct(id, v));
  $('vol').oninput  = e => { Music.setVolume(e.target.value); pct('vol', save.vol); };
  $('volM').oninput = e => { Music.setMenuVolume(e.target.value); pct('volM', save.volMenu); };
  $('volB').oninput = e => { Music.setBattleVolume(e.target.value); pct('volB', save.volBattle); };
  ctlSettingsBind();
  $('volS').oninput = e => { Music.setSfxVolume(e.target.value); pct('volS', save.volSfx); };
  $('volS').onchange = () => Sfx.play('click');                                      // al soltar el deslizador de efectos se oye cómo suenan
  $('mute').onchange = e => Music.setMute(e.target.checked);
  $('fxhd').onchange = e => fxhdSet(e.target.checked);
  $('perfSeg').onclick = e => { const b = e.target.closest('button'); if(!b || b.classList.contains('on')) return; perfSet(b.dataset.v);   // modo rendimiento (state.js): se aplica al recargar
    $('perfSeg').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    const now = b.dataset.v === '1' || (b.dataset.v === 'auto' && perfAuto());
    if(now !== LOWFX) toast('Recarga la página para aplicar el modo rendimiento.'); };
  $('setAcc').onclick = openAccount;                                // Ajustes › Cuenta (js/cloudui.js)
  $('fs').onchange = e => {
    const el = document.documentElement;
    if(e.target.checked){ const r = (el.requestFullscreen || el.webkitRequestFullscreen).call(el); if(r && r.catch) r.catch(() => { e.target.checked = false; toast('El navegador no ha permitido la pantalla completa.'); }); }
    else if(fsOn()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  };
}
// El interruptor sigue al navegador (por ejemplo si sales de la pantalla completa con Esc o F11)
document.addEventListener('fullscreenchange', () => { const c = document.getElementById('fs'); if(c) c.checked = fsOn(); });
