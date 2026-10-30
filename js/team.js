"use strict";
/* =====================================================================
   12) EQUIPO POKÉMON: panel con los 3 huecos del equipo + selector "Añadir Pokémon" (tu colección por región).
   - Panel (#teamv): 3 huecos con sprite, objeto equipado, "Ver datos" (teamdata.js), "Cambiar" y quitar. Se cierra con "✕ Cerrar" o Esc.
   - Selector (#tmPick): ventana con toda tu colección, buscador, filtros, favoritos ★ y shiny ⭐. Al pulsar un Pokémon entra al equipo.
   Reutiliza: save.box (tus Pokémon), team (equipo de 3), save.equip (objetos), ITEMS, free()/held(), paintSprite() de pokedex.js.
   ===================================================================== */
// Regiones de ORIGEN de cada especie. Hisui sale de Galar: Wyrdeer, Kleavor, Ursaluna, Basculegion, Sneasler,
// Overqwil y Enamorus (nº 899-905) nacieron en Leyendas Arceus. No hay formas regionales separadas en los datos
// (Vulpix de Alola, etc.): cada especie aparece una sola vez, en su región original.
const TEAM_REGIONS = [
  {n:'Kanto', a:1, b:151, c:'#e23b3b'},   {n:'Johto', a:152, b:251, c:'#ffcc33'},   {n:'Hoenn', a:252, b:386, c:'#3ea6ff'},
  {n:'Sinnoh', a:387, b:493, c:'#9aa6ff'}, {n:'Teselia', a:494, b:649, c:'#f0e03a'}, {n:'Kalos', a:650, b:721, c:'#ff7ac8'},
  {n:'Alola', a:722, b:809, c:'#ff9a3a'},  {n:'Galar', a:810, b:898, c:'#c05cff'},   {n:'Hisui', a:899, b:905, c:'#7fd6c2'},
  {n:'Paldea', a:906, b:1025, c:'#4ccf6a'}
];
// ▶ Diseño de la pantalla de equipo: true = lista de equipos a la izquierda y los 3 Pokémon en fila a la derecha (CSS «#teamv.lista»).
//   false = el diseño de siempre (los 5 equipos arriba y 3 tarjetas altas). Si TEAM_HOUSE (casa.js) está en true, manda la casa.
const TEAM_LIST = true;
const tl = {q:'', order:'num', quick:'all', type:'', delAt:0};                                     // lista de equipos: búsqueda, orden y filtros (solo se ven, no se guardan)
const tm = {region:'Todas', q:'', type:'', rar:new Set(), fav:false, open:null, built:false, from:'', target:null};   // target = hueco que se sustituye (null = añadir)     // open = regiones desplegadas (Set)
const inRegion = (r, d) => d >= r.a && d <= r.b;
const ownedInTeamRegion = r => save.box.filter(d => inRegion(r, d) && !hidden(d));

// Pokémon que pasan el buscador y el tipo, dentro de una región
function teamVisible(r){
  const q = tm.q.trim().toLowerCase().replace(/^#/, '');
  return ownedInTeamRegion(r).map(mon).filter(m =>
    (!q || m.name.toLowerCase().includes(q) || String(m.dex) === q) && (!tm.type || m.types.includes(tm.type)) && (!tm.rar.size || tm.rar.has(m.rar)) && (!tm.fav || save.fav.includes(m.dex))).sort((a, b) => a.dex - b.dex);
}

// ---- Estructura (se crea una vez): panel del equipo + ventana del selector + ventana de la ficha ----
function buildTeamShell(){
  $('teamv').innerHTML = `<canvas id="tmRoom" class="room" aria-hidden="true"></canvas>
    <div class="dx tmx">
    <div class="tmL">
    <header class="dxh tmhd"><div class="tmhl"><h1>Equipo Pokémon</h1><p class="tmhint">⠿ Arrastra las cajas para ordenar · el nº 1 sale primero al combate · cada equipo lleva sus propios objetos</p></div>
      <div class="tmbar"><span id="tmCount" class="tmcount"></span>
        <label class="tmsearch"><span aria-hidden="true">🔍</span><input id="tmSearch" placeholder="Buscar equipo o Pokémon" autocomplete="off"></label>
        <select id="tmOrder" title="Ordenar los equipos"><option value="num">Orden: número</option><option value="name">Orden: nombre</option><option value="fav">Orden: favoritos</option></select>
        <select id="tmFilt" title="Filtrar los equipos por tipo de Pokémon"></select>
        <button id="tmNew" class="tmnew" title="Crear un equipo nuevo">+ Nuevo equipo</button></div>
      <div class="tmhr"><span id="tmTotal"></span><button id="tmBack" class="tmclose" title="Cerrar (Esc)">✕ Cerrar</button></div></header>
    <section class="tmteams"><div id="tmQuick" class="tmquick"></div><div id="tmTabs" class="tmtabs"></div>
      <div class="tmdh"><label class="tmname"><i id="tmNum" class="tmnum"></i><span class="tmnl">Nombre del equipo</span> <input id="tmName" maxlength="14" autocomplete="off"></label>
        <div class="tmact"><button id="tmFav" title="Marcar el equipo como favorito">☆</button><button id="tmEdit" title="Cambiar el nombre">✏️</button><button id="tmDel" title="Borrar el equipo">🗑️</button></div></div></section>
    <div class="tmlp"></div><div class="tmrp"></div>
    <div id="tmChips" class="tmchips"></div>
    <div id="tmSel" class="tsd"></div>
    <div id="tmCov" class="tmcov"></div></div>
    <div class="tmR"><section class="tmtop"><div id="tmSlots" class="tmslots"></div></section>
    <p class="tmrh">⠿ Arrastra las tarjetas para ordenar · el nº 1 sale primero al combate · cada equipo lleva sus propios objetos</p></div></div>
    <div id="tmPick" class="tmm hide"><div class="dx tmmb">
      <header class="dxh"><h1 id="tmPickT">Añadir Pokémon</h1><span id="tmPickS"></span><button id="tmPickX" class="tmclose" title="Cerrar (Esc)">✕ Cerrar</button></header>
      <div class="tool"><input id="tmQ" placeholder="Buscar Pokémon por nombre" autocomplete="off"><select id="tmType"></select>
        <button id="tmAll">Desplegar todo</button><button id="tmNone">Contraer todo</button></div>
      <div id="tmRar" class="pills tmrar"></div>
      <div id="tmNav" class="tabs"></div>
      <div id="tmList" class="tmlist"></div></div></div>
    <div id="tmData" class="tmm hide"><div class="dx tmmb tmdb" id="tmDataB"></div></div>`;
  $('tmSlots').addEventListener('click', ddClick); $('tmSlots').addEventListener('keydown', ddKey);
  $('tmSel').addEventListener('click', ddClick); $('tmSel').addEventListener('keydown', ddKey); $('tmSel').addEventListener('click', selClick);   // la ficha de la casa (casa.js) lleva su propio desplegable y botones
  $('tmSlots').addEventListener('click', e => { if(e.target.closest('button, .idd')) return; const c = e.target.closest('.tslot[data-d]'); if(c){ tm.selD = +c.dataset.d; selUpdate(); } });   // clic en una tarjeta = verla en la ficha
  ['pointerdown','pointermove','pointerup','pointercancel'].forEach(t => $('tmSlots').addEventListener(t, slotDrag));   // arrastrar las cajas para ordenar el equipo   // desplegable de objetos (se reparte por eventos: las tarjetas se redibujan)
  document.addEventListener('click', e => { if(!e.target.closest('.idd')) closeDd(); });
  $('tmBack').onclick = closeTeam; $('tmPickX').onclick = closePick;
  $('tmTabs').onclick = e => { const b = e.target.closest('.tmtab'); if(!b || +b.dataset.i === save.tsel) return; closePick(); closeDd(); resetDel(); selectTeam(+b.dataset.i); renderTeamSlots(); };
  $('tmQuick').onclick = e => { const b = e.target.closest('[data-q]'); if(!b) return; tl.quick = b.dataset.q; renderTeamTabs(); };      // Todos / favoritos / completos / vacíos
  $('tmSearch').oninput = e => { tl.q = e.target.value; renderTeamTabs(); };
  $('tmOrder').onchange = e => { tl.order = e.target.value; renderTeamTabs(); };
  $('tmFilt').innerHTML = '<option value="">Todos los tipos</option>' + Object.keys(TYPE_ES).map(t => `<option value="${t}">${TYPE_ES[t]}</option>`).join('');
  $('tmFilt').onchange = e => { tl.type = e.target.value; renderTeamTabs(); };
  $('tmNew').onclick = newTeam;
  $('tmFav').onclick = () => { const t = save.teams[save.tsel]; t.fav = !t.fav; persist(); renderTeamTabs(); };
  $('tmEdit').onclick = () => { $('tmName').focus(); $('tmName').select(); };
  $('tmDel').onclick = delTeamClick;
  $('tmCov').addEventListener('click', e => { const b = e.target.closest('[data-act]'); if(!b || !tm.selD) return; if(b.dataset.act === 'data') openData(tm.selD); else openPick(team.indexOf(tm.selD)); });   // botones de abajo: actúan sobre el Pokémon elegido
  $('tmName').oninput = e => { const t = save.teams[save.tsel]; t.n = e.target.value.trim().slice(0, 14) || 'Equipo ' + (save.tsel + 1); persist(); const b = $('tmTabs').querySelector('.tmtab.on b'); if(b) b.textContent = t.n; $('tmTotal').textContent = teamTotalText(); };
  $('tmPick').onclick = e => { if(e.target === $('tmPick')) closePick(); };                  // clic fuera de la ventana = cerrar
  $('tmData').onclick = e => { if(e.target === $('tmData')) closeData(); };
  $('tmQ').oninput = e => { tm.q = e.target.value; renderTeamList(); };
  $('tmType').innerHTML = '<option value="">Todos los tipos</option>' + Object.keys(TYPE_ES).map(t => `<option value="${t}">${TYPE_ES[t]}</option>`).join('');
  $('tmType').onchange = e => { tm.type = e.target.value; renderTeamList(); };
  // Filtro de rareza: puedes marcar varias a la vez (Legendaria + Épica, etc.). Sin ninguna marcada = todas.
  // Etiqueta "Favoritos": muestra solo los Pokémon marcados con la estrella (los mismos favoritos de la Pokédex)
  $('tmRar').innerHTML = '<button class="pill fvpill" data-fav="1" style="--c:#ffcc33">★ Favoritos</button><span>Rareza:</span>' + RARITIES.map(r => `<button class="pill" data-k="${r.id}" style="--c:${r.col}">${r.ic} ${r.n}</button>`).join('') +
    '<button class="pill clr" data-k="">Quitar filtro</button>';
  $('tmRar').onclick = e => { const b = e.target.closest('.pill'); if(!b) return;
    if(b.dataset.fav){ tm.fav = !tm.fav; renderRarPills(); renderTeamNav(); renderTeamList(); return; }
    if(!b.dataset.k) tm.rar.clear(); else tm.rar.has(b.dataset.k) ? tm.rar.delete(b.dataset.k) : tm.rar.add(b.dataset.k);
    renderRarPills(); renderTeamNav(); renderTeamList(); };
  $('tmAll').onclick = () => { TEAM_REGIONS.forEach(r => tm.open.add(r.n)); syncOpen(); };
  $('tmNone').onclick = () => { tm.open.clear(); syncOpen(); };
  // Navegación rápida: filtra por región (y la despliega)
  $('tmNav').onclick = e => { const b = e.target.closest('.tab'); if(!b) return; tm.region = b.dataset.r;
    if(tm.region !== 'Todas') tm.open.add(tm.region); renderTeamNav(); renderTeamList(); };
  $('tmList').onclick = e => {
    const h = e.target.closest('.rhead');
    if(h){ const n = h.parentNode.dataset.r; tm.open.has(n) ? tm.open.delete(n) : tm.open.add(n); syncOpen(); return; }
    const sb = e.target.closest('.shb'); if(sb){ e.stopPropagation(); toggleShiny(+sb.closest('.tcard').dataset.d); return; }   // el ⭐ tampoco mete/saca del equipo
    const f = e.target.closest('.fvb'); if(f){ e.stopPropagation(); toggleFav(+f.closest('.tcard').dataset.d); return; }   // la estrella no mete/saca del equipo
    const c = e.target.closest('.tcard'); if(c) pickMon(+c.dataset.d);
  };
  tm.io = new IntersectionObserver(es => es.forEach(en => { if(en.isIntersecting){ tm.io.unobserve(en.target); paintTeamCard(en.target); } }),
    {root: $('tmList'), rootMargin: '200px'});
  tm.built = true;
}

// ---- Acciones (misma lógica de antes) ----
function pickMon(dex){                                                                            // elegir un Pokémon en el selector
  if(team.includes(dex)) return toast('Ya está en tu equipo.');
  if(tm.target !== null && tm.target < team.length){ delete save.equip[team[tm.target]]; team[tm.target] = dex; }   // "Cambiar": ocupa el hueco (el objeto del anterior se libera)
  else if(team.length < 3) team.push(dex);
  else return toast('El equipo está completo: usa "Cambiar" en uno de los huecos.');
  persist(); closePick(); renderTeamSlots(); toast(`${mon(dex).name} se une al equipo.`);
}
function removeMon(dex){                                                                          // quitar del equipo (siempre debe quedar al menos 1)
  if(team.length <= 1) return toast('El equipo necesita al menos 1 Pokémon.');
  team = team.filter(x => x !== dex); delete save.equip[dex]; persist(); renderTeamSlots();
}
function openPick(target){                                                                        // abre el selector (target = nº de hueco a sustituir, o null para añadir)
  tm.target = target; $('tmPickT').textContent = target !== null && target < team.length ? `Cambiar a ${mon(team[target]).name}` : 'Añadir Pokémon';
  $('tmPickS').textContent = `${boxCount()} Pokémon en tu colección`;
  $('tmPick').classList.remove('hide'); renderRarPills(); renderTeamNav(); renderTeamList();
}
function closePick(){ $('tmPick').classList.add('hide'); tm.target = null; }
function closeTeam(){ closePick(); closeData(true); closeDd(); teamBgStop(); tm.from === 'shop' ? openShop() : tm.from === 'story' ? goStory() : tm.from === 'campo' ? openCampo() : goMain(); }
// Esc cierra primero la ventana de arriba (ficha o selector) y por último el panel del equipo
addEventListener('keydown', e => {
  if(e.code !== 'Escape' || !tm.built || $('teamv').classList.contains('hide')) return;
  e.stopImmediatePropagation();
  if(tmDrag.on){ slotDragEnd(true); return; }                                                 // si estás arrastrando una caja, Esc la devuelve a su sitio
  if(document.querySelector('.iddl:not([hidden])')){ closeDd(); return; }                    // primero se cierra el desplegable de objetos
  if(!$('tmData').classList.contains('hide')) dataEsc(); else if(!$('tmPick').classList.contains('hide')) closePick(); else closeTeam();
}, true);
function toggleFav(dex){                                                                           // marca / desmarca favorito (save.fav, igual que en la Pokédex)
  const i = save.fav.indexOf(dex); if(i < 0) save.fav.push(dex); else save.fav.splice(i, 1);
  persist(); renderTeamSlots();
  if(tm.fav){ renderTeamNav(); renderTeamList(); } else refreshTeamCards();                         // con el filtro puesto, el Pokémon desmarcado desaparece de la lista
}
function toggleShiny(dex){                                                                         // alterna entre usar su versión shiny o la normal (solo si lo tienes shiny)
  if(!save.shiny.includes(dex)) return;
  const i = save.shinyOff.indexOf(dex); if(i < 0) save.shinyOff.push(dex); else save.shinyOff.splice(i, 1);
  persist(); renderTeamSlots(); refreshTeamCards();
  const c = $('tmList').querySelector(`.tcard[data-d="${dex}"]`); if(c) paintTeamCard(c);
}
function setItem(dex, id){ if(id) save.equip[dex] = id; else delete save.equip[dex]; persist(); renderTeamSlots(); refreshTeamCards(); }

// ---- Desplegable de objetos (estilizado, con icono y descripción de cada objeto) ----
function itemDd(dex){
  const it = save.equip[dex], ids = Object.keys(ITEMS).filter(id => (free(id) > 0 || it === id) && itemFits(dex, id));
  const img = id => `<img class="iimg" src="${imgOf(id)}" alt="" onerror="this.style.visibility='hidden'">`;
  const row = id => id
    ? `<li role="option" tabindex="-1" data-id="${id}"${id === it ? ' aria-selected="true"' : ''}>${img(id)}<div><b>${esc(ITEMS[id].n)}</b><small>${esc(ITEMS[id].d)}</small></div><em>×${held(id)}</em></li>`
    : `<li role="option" tabindex="-1" data-id=""${it ? '' : ' aria-selected="true"'}><span class="noimg">∅</span><div><b>Sin objeto</b><small>Quita el objeto equipado.</small></div></li>`;
  return `<div class="idd"><button type="button" class="iddb" aria-haspopup="listbox" aria-expanded="false">${it ? img(it) + `<span>${esc(ITEMS[it].n)}</span>` : '<span class="noimg">∅</span><span class="none">Sin objeto</span>'}<em>▾</em></button>
    <ul class="iddl" role="listbox" hidden>${['', ...ids].map(row).join('')}</ul></div>`;
}
function itemDesc(dex){
  const it = save.equip[dex];
  if(it) return `<div class="idesc">${`<img class="iimg" src="${imgOf(it)}" alt="" onerror="this.style.visibility='hidden'">`}<div><b>${esc(ITEMS[it].n)}</b><p>${esc(ITEMS[it].d)}</p><p class="og">${esc(ITEMS[it].og || '')}</p></div></div>`;
  const any = Object.keys(ITEMS).some(id => free(id) > 0);
  return `<div class="idesc none"><div><b>Sin objeto equipado</b><p>${any ? 'Abre el desplegable y elige uno de tus objetos.' : 'No tienes objetos libres. Compra más en la Tienda.'}</p></div></div>`;
}
function closeDd(){ document.querySelectorAll('.iddl:not([hidden])').forEach(l => { l.hidden = true; l.parentNode.querySelector('.iddb').setAttribute('aria-expanded', 'false'); l.closest('.tslot, .tsd').classList.remove('ddopen'); }); }
function openDd(dd){
  closeDd(); const l = dd.querySelector('.iddl'); l.hidden = false; dd.querySelector('.iddb').setAttribute('aria-expanded', 'true'); dd.closest('.tslot, .tsd').classList.add('ddopen');
  const r = dd.getBoundingClientRect(), need = l.offsetHeight + 12;                              // si no cabe debajo, se abre hacia arriba
  l.classList.toggle('up', r.bottom + need > innerHeight && r.top > innerHeight - r.bottom);
  const cur = l.querySelector('[aria-selected="true"]'); if(cur) cur.scrollIntoView({block:'nearest'});
}
function ddClick(e){
  const b = e.target.closest('.iddb'), li = e.target.closest('.iddl li');
  if(b){ const dd = b.parentNode; dd.querySelector('.iddl').hidden ? openDd(dd) : closeDd(); return; }
  if(li){ const d = +li.closest('[data-d]').dataset.d; closeDd(); setItem(d, li.dataset.id); }
}
function ddKey(e){                                                                                  // teclado: ↑ ↓ para moverse, Intro para elegir
  const dd = e.target.closest('.idd'); if(!dd) return;
  const items = [...dd.querySelectorAll('.iddl li')], i = items.indexOf(document.activeElement);
  if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
    e.preventDefault(); if(dd.querySelector('.iddl').hidden) openDd(dd);
    const n = e.key === 'ArrowDown' ? Math.min(items.length - 1, i + 1) : Math.max(0, i < 0 ? 0 : i - 1); items[n].focus();
  }else if((e.key === 'Enter' || e.key === ' ') && i >= 0){ e.preventDefault(); items[i].click(); }
}

// ---- Arrastrar para ordenar el equipo ----
// Se agarra una caja (en cualquier sitio menos botones y el desplegable de objetos), se arrastra hasta otro hueco y se suelta.
// Mientras se arrastra, las otras cajas se apartan para dejar sitio. Al soltar se reordena `team` (el nº 1 sale primero al combate) y se guarda.
const tmDrag = {ready:false, on:false};
function slotDrag(e){
  const D = tmDrag, box = $('tmSlots');
  if(e.type === 'pointerdown'){
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    const card = e.target.closest('.tslot[data-d]'); if(!card || team.length < 2) return;
    if(e.target.closest('button, .idd, input, select, textarea, a')) return;                         // los botones y el desplegable funcionan como siempre
    const cards = [...box.querySelectorAll('.tslot')];
    Object.assign(D, {ready:true, on:false, id:e.pointerId, card, cards, x0:e.clientX, y0:e.clientY, from:+card.dataset.i, to:+card.dataset.i, n:team.length, rects:cards.map(c => c.getBoundingClientRect())});
    return;
  }
  if(!D.ready || e.pointerId !== D.id) return;
  const dx = e.clientX - D.x0, dy = e.clientY - D.y0;
  if(e.type === 'pointermove'){
    if(!D.on){
      if(Math.hypot(dx, dy) < 8) return;                                                             // un clic normal no es un arrastre
      D.on = true; closeDd(); try{ D.card.setPointerCapture(D.id); }catch(_){ }
      D.card.classList.add('dragging'); box.classList.add('sorting');
    }
    D.card.style.transform = `translate(${dx}px, ${dy}px) scale(1.03)`;
    let best = D.from, bd = Infinity;                                                                // hueco (ocupado) cuyo centro está más cerca del puntero
    for(let i = 0; i < D.n; i++){ const r = D.rects[i], d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)); if(d < bd){ bd = d; best = i; } }
    D.to = best;
    D.cards.forEach((c, j) => {                                                                      // las demás cajas se apartan
      if(j === D.from || j >= D.n) return;
      const k = D.from < D.to && j > D.from && j <= D.to ? j - 1 : D.from > D.to && j >= D.to && j < D.from ? j + 1 : j;
      c.style.transform = k === j ? '' : `translate(${D.rects[k].left - D.rects[j].left}px, ${D.rects[k].top - D.rects[j].top}px)`;
    });
    return;
  }
  slotDragEnd(e.type === 'pointercancel');                                                           // pointerup / pointercancel
}
function slotDragEnd(cancel){
  const D = tmDrag; if(!D.ready) return; D.ready = false;
  if(!D.on) return;
  D.on = false; const box = $('tmSlots'), {from, to} = D;
  box.addEventListener('click', stopOnce, true); setTimeout(() => box.removeEventListener('click', stopOnce, true), 80);   // el clic que llega al soltar no debe abrir nada
  box.classList.remove('sorting'); D.card.classList.remove('dragging');
  if(cancel || from === to){                                                                          // sin cambios: todo vuelve a su sitio
    D.cards.forEach(c => { c.style.transform = ''; }); return;
  }
  const [d] = team.splice(from, 1); team.splice(to, 0, d); persist();
  renderTeamSlots();
  const land = box.querySelector(`.tslot[data-i="${to}"]`); if(land) land.classList.add('landed');
  toast(`${mon(d).name} ahora es el nº ${to + 1} del equipo.`);
}
const stopOnce = ev => ev.stopPropagation();

// ---- Tu equipo (3 tarjetas grandes) ----
const teamTotalText = () => `${save.teams[save.tsel].n} · ${team.length}/3 • ${boxCount()} Pokémon`;
// ---- Pestañas de los 5 equipos (con los Pokémon de cada uno en miniatura) ----
function teamVisibleList(){                                                                       // equipos que pasan la búsqueda y los filtros, en el orden elegido
  const q = tl.q.trim().toLowerCase();
  const L = save.teams.map((t, i) => ({t, i, mons: i === save.tsel ? team : t.mons})).filter(({t, mons}) =>
    (tl.quick !== 'fav' || t.fav) && (tl.quick !== 'full' || mons.length >= 3) && (tl.quick !== 'empty' || !mons.length) &&
    (!tl.type || mons.some(d => mon(d).types.includes(tl.type))) &&
    (!q || t.n.toLowerCase().includes(q) || mons.some(d => mon(d).name.toLowerCase().includes(q))));
  if(tl.order === 'name') L.sort((a, b) => a.t.n.localeCompare(b.t.n, 'es') || a.i - b.i);
  else if(tl.order === 'fav') L.sort((a, b) => (b.t.fav ? 1 : 0) - (a.t.fav ? 1 : 0) || a.i - b.i);
  return L;
}
function renderTeamTabs(){
  const L = teamVisibleList(), cur = save.teams[save.tsel];
  $('tmTabs').innerHTML = L.map(({t, i, mons}) => `<button class="tmtab${i === save.tsel ? ' on' : ''}" data-i="${i}" title="${esc(t.n)}"><span class="tmt-n">${String(i + 1).padStart(2, '0')}</span><b>${esc(t.n)}</b>${t.fav ? '<i class="tmt-f">★</i>' : ''}` +
      `<span class="tmt-m">${mons.length ? mons.map(d => `<canvas width="36" height="36" data-d="${d}"></canvas>`).join('') : '<em>Vacío</em>'}</span></button>`).join('') || '<p class="tmnone">Ningún equipo coincide con la búsqueda o el filtro.</p>';
  $('tmTabs').querySelectorAll('canvas').forEach(c => paintSprite(c, +c.dataset.d, {sc:2, fit:34, shiny:useShiny(+c.dataset.d)}));
  $('tmQuick').innerHTML = [['all', 'Todos'], ['fav', '★ Favoritos'], ['full', 'Completos'], ['empty', 'Vacíos']].map(([k, n]) => `<button data-q="${k}"${tl.quick === k ? ' class="on"' : ''}>${n}</button>`).join('');
  $('tmCount').textContent = `${save.teams.length} Equipos`;
  $('tmNew').disabled = save.teams.length >= TEAM_MAX;
  if(document.activeElement !== $('tmName')) $('tmName').value = cur.n;
  $('tmNum').textContent = String(save.tsel + 1).padStart(2, '0');
  const fv = $('tmFav'); fv.textContent = cur.fav ? '★' : '☆'; fv.classList.toggle('on', !!cur.fav); fv.title = cur.fav ? 'Quitar el equipo de favoritos' : 'Marcar el equipo como favorito';
}
// Crear y borrar equipos (hasta TEAM_MAX; siempre queda al menos 1). Borrar pide pulsar dos veces el cubo.
function newTeam(){
  if(save.teams.length >= TEAM_MAX) return toast(`Máximo ${TEAM_MAX} equipos.`);
  teamSync(); save.teams.push({n:'Equipo ' + (save.teams.length + 1), mons:[], equip:{}});
  Object.assign(tl, {q:'', quick:'all', type:''}); $('tmSearch').value = ''; $('tmFilt').value = '';              // se quitan los filtros para que se vea el equipo nuevo
  closePick(); closeDd(); resetDel(); selectTeam(save.teams.length - 1); renderTeamSlots();
  const on = $('tmTabs').querySelector('.tmtab.on'); if(on) on.scrollIntoView({block:'nearest'});
  $('tmName').focus(); $('tmName').select();
}
function resetDel(){ tl.delAt = 0; const b = $('tmDel'); b.classList.remove('arm'); b.textContent = '🗑️'; }
function delTeamClick(){
  if(save.teams.length <= 1) return toast('Necesitas al menos 1 equipo.');
  if(tl.delAt && Date.now() - tl.delAt < 3500){ resetDel(); return delTeam(save.tsel); }
  const b = $('tmDel'); tl.delAt = Date.now(); b.classList.add('arm'); b.textContent = '¿Borrar?';
  setTimeout(() => { if(tl.delAt && Date.now() - tl.delAt >= 3400) resetDel(); }, 3500);
}
function delTeam(i){
  teamSync(); const name = save.teams[i].n; save.teams.splice(i, 1);
  save.tsel = save.tsel > i ? save.tsel - 1 : save.tsel === i ? Math.min(i, save.teams.length - 1) : save.tsel;
  const T = save.teams[save.tsel]; team = T.mons; save.equip = T.equip; persist();
  closePick(); closeDd(); renderTeamSlots(); toast(`Equipo «${name}» borrado.`);
}
// ---- Debilidades compartidas del equipo (tabla de tipos CH de data.js): tipos a los que 2 o más de tus Pokémon son débiles / resisten ----
function renderCov(){
  const ms = team.map(mon), el = $('tmCov');
  if(!ms.length){ el.innerHTML = ''; return; }
  const weak = [], res = [];
  Object.keys(CH).forEach(t => { const w = ms.filter(m => eff(t, m.types) > 1).length, r = ms.filter(m => eff(t, m.types) < 1).length; if(w >= 2) weak.push([t, w]); if(r >= 2) res.push([t, r]); });
  weak.sort((a, b) => b[1] - a[1]);
  const chip = ([t, n]) => `<span class="tb" style="background:${TC[t]}">${TYPE_ES[t]} <i>${n}/${ms.length}</i></span>`;
  // Cobertura de ataque (la enseña la casa): tipos a los que alguno de los ataques de tu equipo les hace daño súper efectivo
  const mvTypes = new Set(team.flatMap(d => movesOf(d).map(n => (MOVES[n] || {}).t).filter(Boolean))), all = Object.keys(CH);
  const miss = all.filter(t => ![...mvTypes].some(a => eff(a, [t]) > 1));
  const lone = '<em class="cvnone">Hacen falta 2 Pokémon</em>';
  const rows = `<div class="cvr"><span class="cvwk"><span class="cvl ${weak.length ? 'bad' : 'ok'}">${weak.length || ms.length < 2 ? 'Debilidades' : '✓ Sin debilidades compartidas'}</span>${ms.length < 2 ? lone : weak.map(chip).join('')}</span>` +
    `<span class="cvres"><span class="cvl good">Resistencias</span>${ms.length < 2 ? lone : res.length ? res.map(chip).join('') : '<em class="cvnone">Ninguna compartida</em>'}</span></div>`;
  el.innerHTML = `<h5 class="cvh">Cobertura del equipo</h5>${rows}<div class="cvo"><span class="ok">Cubre ${all.length - miss.length}/${all.length} tipos</span>` +
    (miss.length ? ` · <span class="bad cvmiss">Sin respuesta: ${miss.map(t => TYPE_ES[t].toUpperCase()).join(', ')}</span>` : '') + '</div>' +
    '<div class="cvbtns"><button class="main" data-act="data">Ver detalles</button><button data-act="chg">Cambiar</button></div>';       // botones de abajo: actúan sobre el Pokémon elegido
}
// Selector «Equipo» de las pantallas de Historia y Campo (cambia el equipo activo y vuelve a dibujar la pantalla)
function fillTeamSel(id, after){
  const s = $(id); if(!s) return;
  s.innerHTML = save.teams.map((t, i) => `<option value="${i}">${esc(t.n)}${t.mons.length || i === save.tsel ? '' : ' (vacío)'}</option>`).join('');
  s.value = save.tsel; s.onchange = e => { selectTeam(+e.target.value); after(); };
}

function renderTeamSlots(){
  $('tmTotal').textContent = teamTotalText(); renderTeamTabs(); renderCov();
  if(!team.includes(tm.selD)) tm.selD = team[0];                                                  // Pokémon que se ve en la ficha de la casa
  $('tmSlots').innerHTML = [0, 1, 2].map(i => {
    const dex = team[i];
    if(!dex) return `<article class="tslot empty" data-i="${i}"><i class="tsn">${i + 1}</i><button class="addbtn">＋ Añadir Pokémon</button><p>Hueco libre. Elige uno de tu colección.</p></article>`;
    const m = mon(dex), nat = natureOf(dex), ab = abilityOf(dex);
    const eq = save.equip[dex];
    return `<article class="tslot${dex === tm.selD ? ' sel' : ''}" data-d="${dex}" data-i="${i}"><i class="tsn">${i + 1}</i>
      <span class="tsit">${eq ? `<img class="iimg" src="${imgOf(eq)}" alt="" title="${esc(ITEMS[eq].n)}" onerror="this.style.visibility='hidden'">` : ''}</span>
      <button class="x" title="Quitar del equipo">✕</button>
      ${save.shiny.includes(dex) ? `<button class="shs${useShiny(dex) ? ' on' : ''}" title="${useShiny(dex) ? 'Usando su versión shiny: púlsalo para usar la normal' : 'Usando la versión normal: púlsalo para usar la shiny'}">⭐</button>` : ''}
      <div class="tshead"><div class="tsprite"><canvas width="128" height="128"></canvas></div>
        <div class="tsinfo"><b>${esc(m.name)}${save.fav.includes(dex) ? ' <em class="fvs">★</em>' : ''}</b><div class="tbs">${typeBadges(m)}</div></div></div>
      <div class="tschips"><span class="chip" title="${esc(natText(nat))}"><em>Naturaleza</em><b>${esc(nat[0])}</b></span><span class="chip" title="${esc(abilDesc(ab))}"><em>Habilidad</em><b>${esc(ab)}</b></span></div>
      <div class="tsitem"><label>Objeto</label>${itemDd(dex)}${itemDesc(dex)}</div>
      <div class="tsmv">${movesOf(dex).map(n => { const t = (MOVES[n] || {}).t || m.types[0]; return `<div class="tsm" style="--c:${TC[t]}"><b>${esc(n)}</b><em>${TYPE_ES[t].toUpperCase()}</em></div>`; }).join('')}</div>
      <div class="tsbtns"><button class="bdata main">Ver datos</button><button class="bchg">Cambiar</button>
        ${save.shiny.includes(dex) ? `<button class="sbtn${useShiny(dex) ? ' on' : ''}" title="${useShiny(dex) ? 'Usando su versión shiny: púlsalo para usar la normal' : 'Usando la versión normal: púlsalo para usar la shiny'}">⭐ ${useShiny(dex) ? 'Shiny' : 'Normal'}</button>` : ''}</div></article>`;
  }).join('');
  $('tmSlots').querySelectorAll('.tslot').forEach(s => {
    const i = +s.dataset.i, d = +s.dataset.d;
    if(!d){ s.querySelector('.addbtn').onclick = () => openPick(null); return; }
    paintSprite(s.querySelector('canvas'), d, {sc:6, fit:128, shiny: useShiny(d)});                 // mismos sprites del usuario, en más grande
    const sbt = s.querySelector('.sbtn'); if(sbt) sbt.onclick = () => toggleShiny(d);
    const shs = s.querySelector('.shs'); if(shs) shs.onclick = () => toggleShiny(d);
    s.querySelector('.x').onclick = () => removeMon(d);
    s.querySelector('.bdata').onclick = () => openData(d);
    s.querySelector('.bchg').onclick = () => openPick(i);
  });
  renderSel();
}

// ---- Ficha del Pokémon elegido (la enseña la casa a la izquierda; con la habitación antigua está oculta por CSS) ----
const SEL_COL = {hp:'#e8602c', atk:'#ffd24a', def:'#4ccf6a', spa:'#9aa6ff', spd:'#3ea6ff', spe:'#ff7ac8'}, SEL_LBL = {hp:'PS', atk:'ATQ', def:'DEF', spa:'AT.E', spd:'DEF.E', spe:'VEL'};
function renderSel(){
  const d = tm.selD, el = $('tmSel'), ch = $('tmChips');
  ch.innerHTML = `<span title="Chapas Doradas (suben IVs)">🥇 ×${held('chapa')}</span><span title="Chapas Plateadas (suben EVs)">🥈 ×${held('chapaplata')}</span><span title="Ligas Pokémon superadas">🏆 ${leaguesWon()}/${REGIONS.length}</span>`;
  if(!d){ el.removeAttribute('data-d'); el.innerHTML = '<p class="tsdempty">Tu equipo está vacío.<br>Añade un Pokémon con los botones de la derecha.</p>'; return; }
  const m = mon(d), nat = natureOf(d), ab = abilityOf(d), iv = ivOf(d), ev = evOf(d), eq = save.equip[d], M = eq && ITEMS[eq] && ITEMS[eq].mega ? MEGA[ITEMS[eq].mega] : null;
  const canMega = Object.values(MEGA).some(x => x.dex === d);
  const moves = movesOf(d).map(n => { const t = (MOVES[n] || {}).t || m.types[0]; return `<div class="tsm" style="--c:${TC[t]}"><b>${esc(n)}</b><em>${TYPE_ES[t].toUpperCase()}</em></div>`; }).join('');
  const stats = STAT_KEYS.map(k => { const v = realStat(d, k); return `<div class="tss"><u style="color:${SEL_COL[k]}">${SEL_LBL[k]}</u><i><s style="width:${Math.min(100, v / 2)}%;background:${SEL_COL[k]}"></s></i><b>${v}</b><em>${ev[k]}/${iv[k]}</em></div>`; }).join('');
  el.dataset.d = d;
  el.innerHTML = `<h2>${esc(m.name)}${save.fav.includes(d) ? ' <em class="fvs">★</em>' : ''}</h2>
    <div class="tsdty">${typeBadges(m)}${canMega ? '<span class="tb mgb">MEGA</span>' : ''}</div>
    <div class="tsdspr"><canvas width="128" height="128"></canvas></div>
    <div class="tsdch"><span title="${esc(abilDesc(ab))}">✨ ${esc(ab)}</span><span title="${esc(natText(nat))}">🌿 ${esc(nat[0])}</span></div>
    ${itemDd(d)}
    <h3>Ataques</h3><div class="tsdmv">${moves}</div>
    <h3>Estadísticas <small>· EV / IV</small></h3><div class="tsdst">${stats}</div>
    ${M ? `<div class="tsdmega">${esc(M.form)}: ATQ ${M.base[1]} · AT.E ${M.base[3]} · VEL ${M.base[5]} · ${esc(M.ab)}</div>` : ''}
    <div class="tsdbt"><button class="bchg">Cambiar</button><button class="bdata main">Ver datos</button></div>
    <div class="tsdbt2">${save.shiny.includes(d) ? `<button class="sbtn${useShiny(d) ? ' on' : ''}">⭐ ${useShiny(d) ? 'Shiny' : 'Normal'}</button>` : ''}<button class="x">✕ Quitar del equipo</button></div>`;
  paintSprite(el.querySelector('canvas'), d, {sc:6, fit:128, shiny:useShiny(d)});
}
function selUpdate(){                                                                              // cambia el Pokémon visto sin redibujar las tarjetas (así el arrastre no se rompe)
  $('tmSlots').querySelectorAll('.tslot[data-d]').forEach(c => c.classList.toggle('sel', +c.dataset.d === tm.selD));
  closeDd(); renderSel();
}
function selClick(e){
  const d = +$('tmSel').dataset.d; if(!d) return;
  if(e.target.closest('.bdata')) openData(d);
  else if(e.target.closest('.bchg')) openPick(team.indexOf(d));
  else if(e.target.closest('.sbtn')) toggleShiny(d);
  else if(e.target.closest('.x')) removeMon(d);
}
const typeBadges = m => m.types.map(t => `<span class="tb" style="background:${TC[t]}">${TYPE_ES[t]}</span>`).join('');

function renderRarPills(){
  [...$('tmRar').querySelectorAll('.pill[data-k]')].forEach(b => b.classList.toggle('on', tm.rar.has(b.dataset.k)));
  $('tmRar').querySelector('.fvpill').classList.toggle('on', tm.fav);
  $('tmRar').querySelector('.clr').style.display = tm.rar.size ? '' : 'none';
}
// ---- Navegación rápida por regiones (con contador) ----
function renderTeamNav(){
  $('tmNav').innerHTML = [{n:'Todas', a:1, b:1025}, ...TEAM_REGIONS].map(r => {
    const keep = d => (!tm.rar.size || tm.rar.has(mon(d).rar)) && (!tm.fav || save.fav.includes(d)), n = r.n === 'Todas' ? save.box.filter(d => !hidden(d) && keep(d)).length : ownedInTeamRegion(r).filter(keep).length;
    return `<button class="tab${tm.region === r.n ? ' on' : ''}${n ? '' : ' dim'}" data-r="${r.n}">${r.n} <small>${n}</small></button>`; }).join('');
}

// ---- Lista de regiones plegables ----
function renderTeamList(){
  tm.io.disconnect();
  const searching = tm.q.trim() || tm.type || tm.rar.size || tm.fav;
  const regs = TEAM_REGIONS.filter(r => tm.region === 'Todas' || tm.region === r.n);
  const html = regs.map(r => {
    const list = teamVisible(r), total = ownedInTeamRegion(r).length, size = regionSize(r.a, r.b);
    if(searching && !list.length) return '';                                   // con búsqueda, se ocultan las regiones sin resultados
    const open = tm.open.has(r.n) && list.length;
    return `<section class="treg${open ? ' open' : ''}${list.length ? '' : ' none'}" data-r="${r.n}" style="--c:${r.c}">
      <button class="rhead"><b>${r.n}</b><span>${searching ? list.length + ' de ' : ''}${total} Pokémon <small>(de ${size} en la región)</small></span><em>▾</em></button>
      <div class="rbody"><div class="rin">${list.length ? `<div class="tgrid">${list.map(cardHtml).join('')}</div>` :
        '<p class="tmempty">Aún no tienes Pokémon de esta región. Consíguelos en el Gachapon.</p>'}</div></div></section>`;
  }).join('');
  $('tmList').innerHTML = html || `<p class="tmempty">${tm.fav && !save.fav.length ? 'Aún no tienes favoritos: pulsa la ☆ de una tarjeta para añadirlo.' : 'Ningún Pokémon coincide con la búsqueda.'}</p>`;
  $('tmList').querySelectorAll('.tcard').forEach(c => tm.io.observe(c));
  refreshTeamCards();
}
function cardHtml(m){
  return `<div class="tcard" data-d="${m.dex}" style="--r:${RAR[m.rar].col}"><i class="num"></i>
    <canvas width="64" height="64"></canvas><b>${esc(m.name)}</b><div class="tbs">${typeBadges(m)}</div>
    <small>PS ${m.hp} · ATQ ${m.atk} · VEL ${m.spd}</small><span class="itag"></span><button class="shb" title="">⭐</button><button class="fvb" title="Marcar como favorito">☆</button></div>`;
}
function paintTeamCard(c){ const d = +c.dataset.d; paintSprite(c.querySelector('canvas'), d, {sc:2, fit:60, shiny: useShiny(d)}); }

// Actualiza (sin reconstruir) qué tarjetas están en el equipo y qué objeto llevan
function refreshTeamCards(){
  $('tmList').querySelectorAll('.tcard').forEach(c => {
    const d = +c.dataset.d, i = team.indexOf(d), it = save.equip[d];
    c.classList.toggle('sel', i >= 0); c.querySelector('.num').textContent = i >= 0 ? i + 1 : '';
    c.querySelector('.itag').innerHTML = it ? `<img class="iimg" src="${imgOf(it)}" alt="" onerror="this.style.visibility='hidden'">${esc(ITEMS[it].n)}` : '';
    c.classList.toggle('shiny', save.shiny.includes(d)); c.classList.toggle('shon', useShiny(d));
    c.querySelector('.shb').title = useShiny(d) ? 'Usando su versión shiny (púlsalo para usar la normal)' : 'Usando la versión normal (púlsalo para usar la shiny)';
    const fv = save.fav.includes(d), fb = c.querySelector('.fvb');
    c.classList.toggle('fav', fv); fb.textContent = fv ? '★' : '☆'; fb.title = fv ? 'Quitar de favoritos' : 'Marcar como favorito';
  });
}
// Despliega/pliega con transición (solo cambia clases)
function syncOpen(){
  $('tmList').querySelectorAll('.treg').forEach(s => s.classList.toggle('open', tm.open.has(s.dataset.r) && !s.classList.contains('none')));
}

function openTeam(from){                                                                          // from = 'shop' (Tienda), 'story' (Historia) o 'campo' (Campo de Entrenamiento): al cerrar se vuelve a esa pantalla
  if(!tm.built) buildTeamShell();
  tm.from = from === 'shop' || from === 'story' || from === 'campo' ? from : '';
  if(!tm.open) tm.open = new Set(team.map(d => (TEAM_REGIONS.find(r => inRegion(r, d)) || {}).n).filter(Boolean));   // el selector empieza con las regiones de tu equipo abiertas
  if(!tm.open.size) tm.open.add('Kanto');
  closePick(); $('tmData').classList.add('hide');
  $('tmQ').value = tm.q; $('tmType').value = tm.type;
  renderTeamSlots(); show('teamv'); teamBgStart($('tmRoom'));
  $('teamv').classList.toggle('lista', TEAM_LIST && !$('teamv').classList.contains('casa'));                                     // fondo: la casa (casa.js) o, con TEAM_HOUSE=false, la habitación antigua (room.js)
}
