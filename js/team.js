"use strict";
/* =====================================================================
   12) EQUIPO POKÉMON, ESTILO «PC DE POKÉMON»
   Una sola pantalla con tres zonas (CSS al final de style.css, bajo «Equipo Pokémon estilo PC», clases pc-, pcs-, pct-, pci-):
     · izquierda  → MIS EQUIPOS: lista de hasta 18 equipos (buscador, filtros, crear, borrar, favorito, nombre)
     · centro     → EQUIPO ACTIVO (los 3 huecos) y debajo LA CAJA: toda tu colección en rejilla con buscador, tipo, región, rareza, orden y favoritos
     · derecha    → FICHA del Pokémon que tengas marcado (de tu equipo o de la caja): estadísticas, ataques, objeto, naturaleza, habilidad y los botones
   Cómo se prepara un equipo:
     · clic en un Pokémon de la caja = verlo en la ficha. Desde la ficha: «Añadir al equipo» (o «Sustituir a ...» si el equipo está completo)
     · doble clic en la caja = añadirlo directamente
     · ARRASTRAR un Pokémon de la caja hasta un hueco lo mete (o sustituye al que había). Arrastrar un hueco sobre otro cambia el orden (el nº 1 sale primero al combate)
   Los datos son los de siempre: save.box (colección), team (equipo de 3), save.teams/tsel (hasta 18 equipos, state.js), save.equip (objetos del equipo activo).
   Se abre con openTeam(from): from = 'shop' / 'story' / 'campo' para volver a esa pantalla al cerrar. La ventana «Ver datos» (entrenamiento, ataques...) es teamdata.js.
   El fondo ya no es la casa ni la habitación (js/casa.js y js/room.js siguen en el proyecto pero esta pantalla no los usa).
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
const tl = {q:'', quick:'all', delAt:0};                                                          // lista de equipos: búsqueda y filtro rápido (solo se ven, no se guardan)
const tm = {region:'Todas', q:'', type:'', rar:new Set(), fav:false, sh:false, order:'num', selD:null, selSlot:null, from:'', built:false};   // caja: filtros · selD = Pokémon que se ve en la ficha · selSlot = hueco vacío marcado
const inRegion = (r, d) => d >= r.a && d <= r.b;
const typeBadges = m => m.types.map(t => `<span class="tb" style="background:${TC[t]}">${TYPE_ES[t]}</span>`).join('');
const closePick = () => {};                                                                       // (ya no hay ventana de selección; teamdata.js aún lo llama)
const pad3 = d => String(d).padStart(3, '0');

// ---- Estructura (se crea una vez) ----
function buildTeamShell(){
  $('teamv').innerHTML = `<div class="pc">
    <header class="pc-top"><div class="pc-tt"><h1>Equipo Pokémon</h1><span id="pcSub" class="pc-sub"></span></div>
      <button id="tmBack" class="pcb pc-x" title="Cerrar (Esc)">✕ Cerrar</button></header>
    <div class="pc-body">
      <aside class="pc-teams">
        <div class="pc-th"><b>Equipos</b><span id="tmCount" class="pc-cnt"></span><button id="tmNew" class="pcb main" title="Crear un equipo nuevo">+ Nuevo</button></div>
        <label class="pc-search"><span aria-hidden="true">🔍</span><input id="tmSearch" placeholder="Buscar equipo" autocomplete="off"></label>
        <div id="tmQuick" class="pc-quick"></div>
        <div id="tmTabs" class="pc-tlist"></div>
      </aside>
      <main class="pc-main">
        <section class="pc-active">
          <div class="pc-ah"><label class="pc-name"><i id="tmNum" class="pc-num"></i><input id="tmName" maxlength="14" autocomplete="off" aria-label="Nombre del equipo"></label>
            <div class="pc-act"><button id="tmFav" class="pcb" title="Marcar el equipo como favorito">☆</button><button id="tmDel" class="pcb" title="Borrar el equipo">🗑️</button></div>
            <span class="pc-hint">Arrastra un Pokémon de la caja a un hueco · arrastra los huecos para ordenar · el nº 1 sale primero</span></div>
          <div id="tmSlots" class="pc-slots"></div>
          <div id="tmCov" class="pc-cov"></div>
        </section>
        <section class="pc-box">
          <div class="pc-bf">
            <label class="pc-search"><span aria-hidden="true">🔍</span><input id="pcQ" placeholder="Buscar en la caja (nombre o nº)" autocomplete="off"></label>
            <select id="pcType" title="Filtrar por tipo"></select>
            <select id="pcOrder" title="Ordenar la caja"><option value="num">Orden: número</option><option value="name">Orden: nombre</option><option value="rar">Orden: rareza</option><option value="used">Orden: más usados</option><option value="fav">Orden: favoritos</option></select>
            <button id="pcFav" class="pcb tog" title="Solo favoritos">★ Favoritos</button><button id="pcSh" class="pcb tog" title="Solo los que tienes shiny">⭐ Shiny</button>
          </div>
          <div id="tmRar" class="pc-rar"></div>
          <div id="tmNav" class="pc-regs"></div>
          <div id="tmList" class="pc-grid"></div>
          <div id="pcCnt" class="pc-cnt2"></div>
        </section>
      </main>
      <aside id="tmSel" class="pc-insp"></aside>
    </div></div>
    <div id="tmData" class="tmm hide"><div class="dx tmmb tmdb" id="tmDataB"></div></div>`;
  $('tmSlots').addEventListener('click', slotClick);
  $('tmSel').addEventListener('click', ddClick); $('tmSlots').addEventListener('click', ddClick); $('tmSlots').addEventListener('keydown', ddKey); $('tmSel').addEventListener('keydown', ddKey); $('tmSel').addEventListener('click', selClick);
  ['pointerdown','pointermove','pointerup','pointercancel'].forEach(t => $('tmSlots').addEventListener(t, slotDrag));   // arrastrar los huecos para ordenar el equipo
  $('tmList').addEventListener('pointerdown', boxDragStart);                                                              // arrastrar un Pokémon de la caja a un hueco
  document.addEventListener('click', e => { if(!e.target.closest('.idd')) closeDd(); });
  $('tmBack').onclick = closeTeam;
  $('tmTabs').onclick = e => { const b = e.target.closest('.pc-trow'); if(!b || +b.dataset.i === save.tsel) return; closeDd(); resetDel(); selectTeam(+b.dataset.i); tm.selD = team[0] || null; tm.selSlot = null; renderTeamSlots(); };
  $('tmQuick').onclick = e => { const b = e.target.closest('[data-q]'); if(!b) return; tl.quick = b.dataset.q; renderTeamTabs(); };      // Todos / favoritos / completos / vacíos
  $('tmSearch').oninput = e => { tl.q = e.target.value; renderTeamTabs(); };
  $('tmNew').onclick = newTeam;
  $('tmFav').onclick = () => { const t = save.teams[save.tsel]; t.fav = !t.fav; persist(); renderTeamTabs(); };
  $('tmDel').onclick = delTeamClick;
  $('tmName').oninput = e => { const t = save.teams[save.tsel]; t.n = e.target.value.trim().slice(0, 14) || 'Equipo ' + (save.tsel + 1); persist(); const b = $('tmTabs').querySelector('.pc-trow.on b'); if(b) b.textContent = t.n; $('pcSub').textContent = teamTotalText(); };
  $('tmData').onclick = e => { if(e.target === $('tmData')) closeData(); };
  // ---- Filtros de la caja ----
  $('pcType').innerHTML = '<option value="">Todos los tipos</option>' + Object.keys(TYPE_ES).map(t => `<option value="${t}">${TYPE_ES[t]}</option>`).join('');
  $('pcQ').oninput = e => { tm.q = e.target.value; renderBox(); };
  $('pcType').onchange = e => { tm.type = e.target.value; renderBox(); };
  $('pcOrder').onchange = e => { tm.order = e.target.value; renderBox(); };
  $('pcFav').onclick = () => { tm.fav = !tm.fav; renderBox(); };
  $('pcSh').onclick = () => { tm.sh = !tm.sh; renderBox(); };
  // Rareza: puedes marcar varias a la vez (Legendaria + Épica, etc.). Sin ninguna marcada = todas.
  $('tmRar').innerHTML = '<span>Rareza</span>' + RARITIES.map(r => `<button class="pc-pill" data-k="${r.id}" style="--c:${r.col}">${r.ic} ${r.n}</button>`).join('') + '<button class="pc-pill clr" data-k="">Quitar filtro</button>';
  $('tmRar').onclick = e => { const b = e.target.closest('.pc-pill'); if(!b) return;
    if(!b.dataset.k) tm.rar.clear(); else tm.rar.has(b.dataset.k) ? tm.rar.delete(b.dataset.k) : tm.rar.add(b.dataset.k);
    renderBox(); };
  $('tmNav').onclick = e => { const b = e.target.closest('.pc-rg'); if(!b) return; tm.region = b.dataset.r; renderBox(); };      // pestañas de región
  $('tmList').onclick = e => {
    const c = e.target.closest('.pct'); if(!c) return; const d = +c.dataset.d;
    tm.selD = d; tm.selSlot = null; closeDd(); markBox(); renderSel(); markSlots();
  };
  $('tmList').ondblclick = e => { const c = e.target.closest('.pct'); if(c) quickAdd(+c.dataset.d); };
  $('tmList').onkeydown = e => { if((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('pct')){ e.preventDefault(); e.target.click(); } };
  tm.io = new IntersectionObserver(es => es.forEach(en => { if(en.isIntersecting){ tm.io.unobserve(en.target); paintTeamCard(en.target); } }), {root: $('tmList'), rootMargin: '300px'});
  tm.built = true;
}

// ---- Acciones ----
function placeAt(dex, i){                                                                         // mete un Pokémon en el hueco i (vacío = añade; ocupado = sustituye) o, si ya está en el equipo, lo mueve ahí
  const cur = team.indexOf(dex);
  if(cur >= 0){
    if(cur === i) return;
    const [d] = team.splice(cur, 1); team.splice(Math.min(i, team.length), 0, d); persist();
    tm.selD = dex; renderTeamSlots(); toast(`${mon(dex).name} ahora es el nº ${team.indexOf(dex) + 1} del equipo.`); return;
  }
  if(i >= team.length){ if(team.length >= 3) return toast('El equipo está completo.'); team.push(dex); }
  else{ delete save.equip[team[i]]; team[i] = dex; }                                              // sustituir: el objeto del anterior se libera
  persist(); tm.selD = dex; tm.selSlot = null; renderTeamSlots(); toast(`${mon(dex).name} se une al equipo.`);
}
function quickAdd(dex){                                                                           // doble clic en la caja
  if(team.includes(dex)){ tm.selD = dex; return renderTeamSlots(); }
  if(team.length >= 3) return toast('El equipo está completo: arrástralo a un hueco o usa «Sustituir a...» en la ficha.');
  placeAt(dex, team.length);
}
function removeMon(dex){                                                                          // quitar del equipo (siempre debe quedar al menos 1)
  if(team.length <= 1) return toast('El equipo necesita al menos 1 Pokémon.');
  team = team.filter(x => x !== dex); delete save.equip[dex]; if(tm.selD === dex) tm.selD = team[0]; persist(); renderTeamSlots();
}
function openPick(){ const q = $('pcQ'); if(q) q.focus(); }                                      // (compatibilidad) lleva al buscador de la caja
function closeTeam(){ closeData(true); closeDd(); slotDragEnd(true); teamBgStop(); tm.from === 'shop' ? openShop() : tm.from === 'story' ? goStory() : tm.from === 'campo' ? openCampo() : goMain(); }
// Esc cierra primero lo de arriba (desplegable, ficha «Ver datos») y por último la pantalla del equipo
addEventListener('keydown', e => {
  if(e.code !== 'Escape' || !tm.built || $('teamv').classList.contains('hide')) return;
  e.stopImmediatePropagation();
  if(tmDrag.on){ slotDragEnd(true); return; }                                                 // si estás arrastrando un hueco, Esc lo devuelve a su sitio
  if(bd.on){ boxDragEnd({type:'pointercancel'}); return; }                                    // lo mismo con un Pokémon de la caja
  if(document.querySelector('.iddl:not([hidden])')){ closeDd(); return; }                    // primero se cierra el desplegable de objetos
  if(!$('tmData').classList.contains('hide')) dataEsc(); else closeTeam();
}, true);
function toggleFav(dex){                                                                           // marca / desmarca favorito (save.fav, igual que en la Pokédex)
  const i = save.fav.indexOf(dex); if(i < 0) save.fav.push(dex); else save.fav.splice(i, 1);
  persist(); if(tm.fav) renderBox(); else markBox(); renderSlots(); renderSel();
}
function toggleShiny(dex){                                                                         // alterna entre usar su versión shiny o la normal (solo si lo tienes shiny)
  if(!save.shiny.includes(dex)) return;
  const i = save.shinyOff.indexOf(dex); if(i < 0) save.shinyOff.push(dex); else save.shinyOff.splice(i, 1);
  persist(); renderTeamSlots();
  const c = $('tmList').querySelector(`.pct[data-d="${dex}"]`); if(c) paintTeamCard(c);
}
function setItem(dex, id){ if(id) save.equip[dex] = id; else delete save.equip[dex]; persist(); renderTeamSlots(); }

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
  return `<div class="idesc none"><div><b>Sin objeto equipado</b><p>${any ? 'Elígelo en el recuadro de este Pokémon, arriba en el equipo.' : 'No tienes objetos libres. Compra más en la Tienda.'}</p></div></div>`;
}
function closeDd(){ document.querySelectorAll('.iddl:not([hidden])').forEach(l => { l.hidden = true; l.parentNode.querySelector('.iddb').setAttribute('aria-expanded', 'false'); const h = l.closest('.pc-insp'); if(h) h.classList.remove('ddopen'); }); }
function openDd(dd){
  closeDd(); const l = dd.querySelector('.iddl'); l.hidden = false; dd.querySelector('.iddb').setAttribute('aria-expanded', 'true'); const h = dd.closest('.pc-insp'); if(h) h.classList.add('ddopen');
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

// ---- Arrastrar los huecos para ordenar el equipo ----
// Se agarra un hueco (en cualquier sitio menos botones), se arrastra hasta otro y se suelta. Mientras se arrastra, los demás se apartan.
// Al soltar se reordena `team` (el nº 1 sale primero al combate) y se guarda.
const tmDrag = {ready:false, on:false};
function slotDrag(e){
  const D = tmDrag, box = $('tmSlots');
  if(e.type === 'pointerdown'){
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    const card = e.target.closest('.pcs[data-d]'); if(!card || team.length < 2) return;
    if(e.target.closest('button, input, select, textarea, a, .idd')) return;
    const cards = [...box.querySelectorAll('.pcs')];
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
    let best = D.from, bd2 = Infinity;                                                               // hueco (ocupado) cuyo centro está más cerca del puntero
    for(let i = 0; i < D.n; i++){ const r = D.rects[i], d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)); if(d < bd2){ bd2 = d; best = i; } }
    D.to = best;
    D.cards.forEach((c, j) => {                                                                      // los demás se apartan
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
  if(cancel || from === to){ D.cards.forEach(c => { c.style.transform = ''; }); return; }          // sin cambios: todo vuelve a su sitio
  const [d] = team.splice(from, 1); team.splice(to, 0, d); persist();
  renderTeamSlots();
  const land = box.querySelector(`.pcs[data-i="${to}"]`); if(land) land.classList.add('landed');
  toast(`${mon(d).name} ahora es el nº ${to + 1} del equipo.`);
}
const stopOnce = ev => ev.stopPropagation();

// ---- Arrastrar un Pokémon de la caja a un hueco (solo con ratón o lápiz; con el dedo se usa la ficha) ----
const bd = {ready:false, on:false};
function boxDragStart(e){
  if(e.pointerType === 'touch' || (e.pointerType === 'mouse' && e.button !== 0)) return;
  const t = e.target.closest('.pct'); if(!t) return;
  Object.assign(bd, {ready:true, on:false, id:e.pointerId, t, d:+t.dataset.d, x0:e.clientX, y0:e.clientY, over:null});
  addEventListener('pointermove', boxDragMove); addEventListener('pointerup', boxDragEnd); addEventListener('pointercancel', boxDragEnd);
}
function boxDragMove(e){
  if(!bd.ready || e.pointerId !== bd.id) return;
  if(!bd.on){
    if(Math.hypot(e.clientX - bd.x0, e.clientY - bd.y0) < 8) return;
    bd.on = true; closeDd();
    const g = document.createElement('canvas'); g.width = g.height = 96; g.className = 'pc-ghost'; const src = bd.t.querySelector('canvas');
    try{ g.getContext('2d').drawImage(src, 0, 0); }catch(_){ }
    document.body.appendChild(g); bd.g = g; document.body.classList.add('pc-dragging');
  }
  bd.g.style.left = e.clientX + 'px'; bd.g.style.top = e.clientY + 'px';
  const el = document.elementFromPoint(e.clientX, e.clientY), s = el && el.closest('#tmSlots .pcs');
  bd.over = s ? +s.dataset.i : null;
  $('tmSlots').querySelectorAll('.pcs').forEach(c => c.classList.toggle('drop', s === c));
}
function boxDragEnd(e){
  removeEventListener('pointermove', boxDragMove); removeEventListener('pointerup', boxDragEnd); removeEventListener('pointercancel', boxDragEnd);
  if(!bd.ready) return; bd.ready = false;
  if(!bd.on) return;                                                                                  // un clic normal lo gestiona el evento click
  bd.on = false; if(bd.g) bd.g.remove(); document.body.classList.remove('pc-dragging');
  $('tmSlots').querySelectorAll('.pcs').forEach(c => c.classList.remove('drop'));
  const list = $('tmList'); list.addEventListener('click', stopOnce, true); setTimeout(() => list.removeEventListener('click', stopOnce, true), 80);
  if(e.type === 'pointerup' && bd.over !== null) placeAt(bd.d, bd.over);
}

// ---- Lista de equipos (izquierda) ----
const teamTotalText = () => `${save.teams[save.tsel].n} · ${team.length}/3 · ${boxCount()} Pokémon en la caja`;
function teamVisibleList(){                                                                       // equipos que pasan la búsqueda y el filtro rápido
  const q = tl.q.trim().toLowerCase();
  return save.teams.map((t, i) => ({t, i, mons: i === save.tsel ? team : t.mons})).filter(({t, mons}) =>
    (tl.quick !== 'fav' || t.fav) && (tl.quick !== 'full' || mons.length >= 3) && (tl.quick !== 'empty' || !mons.length) &&
    (!q || t.n.toLowerCase().includes(q) || mons.some(d => mon(d).name.toLowerCase().includes(q))));
}
function renderTeamTabs(){
  const L = teamVisibleList(), cur = save.teams[save.tsel];
  $('tmTabs').innerHTML = L.map(({t, i, mons}) => `<div class="pc-trow${i === save.tsel ? ' on' : ''}" data-i="${i}" role="button" tabindex="0" title="${esc(t.n)}"><span class="n">${String(i + 1).padStart(2, '0')}</span><b>${esc(t.n)}</b>${t.fav ? '<i class="f">★</i>' : ''}` +
      `<span class="ms">${mons.length ? mons.map(d => `<canvas width="96" height="96" data-d="${d}"></canvas>`).join('') : '<em>Vacío</em>'}</span></div>`).join('') || '<p class="pc-none">Ningún equipo coincide con la búsqueda o el filtro.</p>';
  $('tmTabs').querySelectorAll('canvas').forEach(c => paintSprite(c, +c.dataset.d, {sc:6, fit:94, shiny:useShiny(+c.dataset.d)}));
  $('tmQuick').innerHTML = [['all', 'Todos'], ['fav', '★ Favoritos'], ['full', 'Completos'], ['empty', 'Vacíos']].map(([k, n]) => `<button data-q="${k}"${tl.quick === k ? ' class="on"' : ''}>${n}</button>`).join('');
  $('tmCount').textContent = `${save.teams.length}/${TEAM_MAX}`;
  $('tmNew').disabled = save.teams.length >= TEAM_MAX;
  if(document.activeElement !== $('tmName')) $('tmName').value = cur.n;
  $('tmNum').textContent = String(save.tsel + 1).padStart(2, '0');
  const fv = $('tmFav'); fv.textContent = cur.fav ? '★' : '☆'; fv.classList.toggle('on', !!cur.fav); fv.title = cur.fav ? 'Quitar el equipo de favoritos' : 'Marcar el equipo como favorito';
}
// Crear y borrar equipos (hasta TEAM_MAX; siempre queda al menos 1). Borrar pide pulsar dos veces el cubo.
function newTeam(){
  if(save.teams.length >= TEAM_MAX) return toast(`Máximo ${TEAM_MAX} equipos.`);
  teamSync(); save.teams.push({n:'Equipo ' + (save.teams.length + 1), mons:[], equip:{}});
  Object.assign(tl, {q:'', quick:'all'}); $('tmSearch').value = '';                                    // se quitan los filtros para que se vea el equipo nuevo
  closeDd(); resetDel(); selectTeam(save.teams.length - 1); tm.selD = null; tm.selSlot = 0; renderTeamSlots();
  const on = $('tmTabs').querySelector('.pc-trow.on'); if(on) on.scrollIntoView({block:'nearest'});
  $('tmName').focus(); $('tmName').select();
}
function resetDel(){ tl.delAt = 0; const b = $('tmDel'); if(!b) return; b.classList.remove('arm'); b.textContent = '🗑️'; }
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
  closeDd(); tm.selD = team[0] || null; renderTeamSlots(); toast(`Equipo «${name}» borrado.`);
}
// ---- Debilidades compartidas del equipo (tabla de tipos CH de data.js): tipos a los que 2 o más de tus Pokémon son débiles / resisten ----
function renderCov(){
  const ms = team.map(mon), el = $('tmCov');
  if(!ms.length){ el.innerHTML = '<em class="cvnone">Añade Pokémon para ver las debilidades y la cobertura del equipo.</em>'; return; }
  const weak = [], res = [];
  Object.keys(CH).forEach(t => { const w = ms.filter(m => eff(t, m.types) > 1).length, r = ms.filter(m => eff(t, m.types) < 1).length; if(w >= 2) weak.push([t, w]); if(r >= 2) res.push([t, r]); });
  weak.sort((a, b) => b[1] - a[1]);
  const chip = ([t, n]) => `<span class="tb" style="background:${TC[t]}">${TYPE_ES[t]} <i>${n}/${ms.length}</i></span>`;
  const mvTypes = new Set(team.flatMap(d => movesOf(d).map(n => (MOVES[n] || {}).t).filter(Boolean))), all = Object.keys(CH);       // cobertura de ataque: tipos a los que alguno de tus ataques hace daño súper efectivo
  const miss = all.filter(t => ![...mvTypes].some(a => eff(a, [t]) > 1));
  const lone = '<em class="cvnone">hacen falta 2 Pokémon</em>';
  el.innerHTML = `<span class="cvg"><span class="cvl ${weak.length ? 'bad' : 'ok'}">${weak.length || ms.length < 2 ? 'Débiles a' : '✓ Sin debilidades compartidas'}</span>${ms.length < 2 ? lone : weak.map(chip).join('')}</span>` +
    `<span class="cvg"><span class="cvl good">Resisten</span>${ms.length < 2 ? lone : res.length ? res.map(chip).join('') : '<em class="cvnone">ninguno compartido</em>'}</span>` +
    `<span class="cvg"><span class="cvl ${miss.length ? 'warn' : 'ok'}">Cobertura ${all.length - miss.length}/${all.length}</span>${miss.length ? `<em class="cvnone">sin respuesta: ${miss.map(t => TYPE_ES[t]).join(', ')}</em>` : ''}</span>`;
}
// Selector «Equipo» de las pantallas de Historia y Campo (cambia el equipo activo y vuelve a dibujar la pantalla)
function fillTeamSel(id, after){
  const s = $(id); if(!s) return;
  s.innerHTML = save.teams.map((t, i) => `<option value="${i}">${esc(t.n)}${t.mons.length || i === save.tsel ? '' : ' (vacío)'}</option>`).join('');
  s.value = save.tsel; s.onchange = e => { selectTeam(+e.target.value); after(); };
}

// ---- Equipo activo: los 3 huecos ----
function renderTeamSlots(){
  if(!team.includes(tm.selD) && !(tm.selD && save.box.includes(tm.selD))) tm.selD = team[0] || null;       // la ficha enseña un Pokémon del equipo o de la caja
  $('pcSub').textContent = teamTotalText(); renderTeamTabs(); renderCov(); renderSlots(); renderSel(); markBox();
}
function renderSlots(){
  $('tmSlots').innerHTML = [0, 1, 2].map(i => {
    const dex = team[i];
    if(!dex) return `<article class="pcs empty${tm.selSlot === i && !tm.selD ? ' sel' : ''}" data-i="${i}"><i class="pcs-n">${i + 1}</i><div class="pcs-e"><b>Hueco libre</b><small>Arrastra aquí un Pokémon de la caja, o márcalo y pulsa «Añadir al equipo»</small></div></article>`;
    const m = mon(dex);
    return `<article class="pcs${dex === tm.selD ? ' sel' : ''}" data-d="${dex}" data-i="${i}"><i class="pcs-n">${i + 1}</i>
      <button class="pcs-x" title="Quitar del equipo">✕</button>
      <div class="pcs-sp"><canvas width="128" height="128"></canvas>${save.shiny.includes(dex) && useShiny(dex) ? '<em class="pcs-sh" title="Versión shiny">⭐</em>' : ''}</div>
      <div class="pcs-in"><b>${esc(m.name)}${save.fav.includes(dex) ? ' <em class="fvs">★</em>' : ''}</b><div class="tbs">${typeBadges(m)}</div>
        <small class="pcs-lb">Objeto</small>${itemDd(dex)}</div></article>`;
  }).join('');
  $('tmSlots').querySelectorAll('.pcs[data-d]').forEach(s => paintSprite(s.querySelector('canvas'), +s.dataset.d, {sc:6, fit:128, shiny: useShiny(+s.dataset.d)}));
}
function markSlots(){ $('tmSlots').querySelectorAll('.pcs').forEach(c => c.classList.toggle('sel', c.dataset.d ? +c.dataset.d === tm.selD : (tm.selSlot === +c.dataset.i && !tm.selD))); }
function slotClick(e){
  const c = e.target.closest('.pcs'); if(!c || e.target.closest('.idd')) return;
  if(e.target.closest('.pcs-x')){ removeMon(+c.dataset.d); return; }
  closeDd();
  if(c.dataset.d){ tm.selD = +c.dataset.d; tm.selSlot = null; } else { tm.selD = null; tm.selSlot = +c.dataset.i; }
  markSlots(); markBox(); renderSel();
}

// ---- Ficha del Pokémon marcado (derecha) ----
const SEL_COL = {hp:'#e8602c', atk:'#ffd24a', def:'#4ccf6a', spa:'#9aa6ff', spd:'#3ea6ff', spe:'#ff7ac8'}, SEL_LBL = {hp:'PS', atk:'ATQ', def:'DEF', spa:'AT.E', spd:'DEF.E', spe:'VEL'};
function renderSel(){
  const d = tm.selD, el = $('tmSel');
  if(!d){
    el.removeAttribute('data-d');
    el.innerHTML = `<div class="pci-empty"><b>${tm.selSlot !== null ? 'Hueco libre' : 'Ningún Pokémon marcado'}</b><p>Pulsa un Pokémon de la caja para ver su ficha. Desde aquí podrás añadirlo al equipo.</p><p>También puedes <em>arrastrarlo</em> hasta un hueco, o hacer <em>doble clic</em> para añadirlo directamente.</p></div>`;
    return;
  }
  const m = mon(d), r = RAR[m.rar], nat = natureOf(d), ab = abilityOf(d), iv = ivOf(d), ev = evOf(d), eq = save.equip[d], M = eq && ITEMS[eq] && ITEMS[eq].mega ? MEGA[ITEMS[eq].mega] : null;
  const canMega = Object.values(MEGA).some(x => x.dex === d), idx = team.indexOf(d), inTeam = idx >= 0, hasSh = save.shiny.includes(d);
  const moves = movesOf(d).map(n => { const t = (MOVES[n] || {}).t || m.types[0]; return `<div class="pcm big" style="--c:${TC[t]}"><b>${esc(n)}</b><em>${TYPE_ES[t].toUpperCase()}</em></div>`; }).join('');
  const stats = STAT_KEYS.map(k => { const v = realStat(d, k); return `<div class="tss" title="${SEL_LBL[k]}: EV ${ev[k]} · IV ${iv[k]}"><u style="color:${SEL_COL[k]}">${SEL_LBL[k]}</u><i><s style="width:${Math.min(100, v / 2)}%;background:${SEL_COL[k]}"></s></i><b>${v}</b></div>`; }).join('');
  const evT = STAT_KEYS.reduce((n, k) => n + (ev[k] || 0), 0), ivT = STAT_KEYS.reduce((n, k) => n + (iv[k] || 0), 0);
  const acts = inTeam
    ? `<button class="pcb main" data-act="data">Ver datos</button><button class="pcb" data-act="rm">✕ Quitar del equipo</button>`
    : team.length < 3
      ? `<button class="pcb main" data-act="add">＋ Añadir al equipo</button><button class="pcb" data-act="data">Ver datos</button>`
      : `<div class="pci-rep"><small>El equipo está completo. Sustituir a:</small>${team.map((x, i) => `<button class="pcb" data-act="rep" data-i="${i}">${i + 1} · ${esc(mon(x).name)}</button>`).join('')}</div><button class="pcb" data-act="data">Ver datos</button>`;
  el.dataset.d = d;
  el.innerHTML = `<div class="pci-spr" style="--r:${r.col}"><canvas width="160" height="160"></canvas><span class="rb pci-rar" style="--c:${r.col}">${r.ic} ${r.n}</span></div>
    <h2>${esc(m.name)} <small>#${pad3(d)}</small></h2>
    <div class="tbs pci-ty">${typeBadges(m)}${canMega ? '<span class="tb mgb">MEGA</span>' : ''}</div>
    <div class="pci-ch"><span title="${esc(abilDesc(ab))}"><em>Habilidad</em><b>${esc(ab)}</b></span><span title="${esc(natText(nat))}"><em>Naturaleza</em><b>${esc(nat[0])}</b></span></div>
    <div class="pci-tg"><button class="pcb tog${save.fav.includes(d) ? ' on' : ''}" data-act="fav">${save.fav.includes(d) ? '★ Favorito' : '☆ Favorito'}</button>${hasSh ? `<button class="pcb tog${useShiny(d) ? ' on' : ''}" data-act="sh">⭐ ${useShiny(d) ? 'Shiny' : 'Normal'}</button>` : ''}</div>
    ${inTeam ? `<h3>Objeto</h3><div class="pci-item">${eq ? `<img class="iimg" src="${imgOf(eq)}" alt="" onerror="this.style.visibility='hidden'"><b>${esc(ITEMS[eq].n)}</b>` : '<span class="none">Sin objeto</span>'}</div>` : ''}
    <h3>Ataques</h3><div class="pci-mv">${moves}</div>
    <h3>Estadísticas</h3><div class="tsdst">${stats}</div><div class="pci-evs"><span>EV <b>${evT}</b>/510</span><span>IV <b>${ivT}</b>/186</span></div>
    ${M ? `<div class="tsdmega">${esc(M.form)}: ATQ ${M.base[1]} · AT.E ${M.base[3]} · VEL ${M.base[5]} · ${esc(M.ab)}</div>` : ''}
    <div class="pci-acts">${acts}</div>`;
  paintSprite(el.querySelector('canvas'), d, {sc:6, fit:160, shiny:useShiny(d)});
}
function selClick(e){
  const b = e.target.closest('[data-act]'), d = +$('tmSel').dataset.d; if(!b || !d) return;
  const a = b.dataset.act;
  if(a === 'data') openData(d);
  else if(a === 'add') placeAt(d, team.length);
  else if(a === 'rep') placeAt(d, +b.dataset.i);
  else if(a === 'rm') removeMon(d);
  else if(a === 'fav') toggleFav(d);
  else if(a === 'sh') toggleShiny(d);
}

// ---- La caja: toda tu colección en rejilla ----
function boxFiltered(){
  const q = plain(tm.q.trim()).replace(/^#/, ''), num = /^\d+$/.test(q), R = tm.region === 'Todas' ? null : TEAM_REGIONS.find(r => r.n === tm.region);
  let L = save.box.filter(d => mon(d) && !hidden(d)).map(mon).filter(m =>
    (!R || inRegion(R, m.dex)) && (!q || (num ? String(m.dex).startsWith(String(+q)) : plain(m.name).includes(q))) && (!tm.type || m.types.includes(tm.type)) &&
    (!tm.rar.size || tm.rar.has(m.rar)) && (!tm.fav || save.fav.includes(m.dex)) && (!tm.sh || save.shiny.includes(m.dex)));
  const o = tm.order;
  L.sort(o === 'name' ? (a, b) => a.name.localeCompare(b.name, 'es') : o === 'rar' ? (a, b) => RAR[b.rar].rank - RAR[a.rar].rank || a.dex - b.dex :
         o === 'used' ? (a, b) => (save.used[b.dex] || 0) - (save.used[a.dex] || 0) || a.dex - b.dex : o === 'fav' ? (a, b) => (save.fav.includes(b.dex) ? 1 : 0) - (save.fav.includes(a.dex) ? 1 : 0) || a.dex - b.dex : (a, b) => a.dex - b.dex);
  return L;
}
function tileHtml(m){
  return `<div class="pct" data-d="${m.dex}" role="button" tabindex="0" style="--r:${RAR[m.rar].col}" title="${esc(m.name)}"><i class="pct-n">${pad3(m.dex)}</i><em class="pct-tag"></em>
    <canvas width="96" height="96"></canvas><b>${esc(m.name)}</b><span class="pct-t">${m.types.map(t => `<u style="background:${TC[t]}" title="${TYPE_ES[t]}"></u>`).join('')}</span><span class="pct-in"></span></div>`;
}
function paintTeamCard(c){ const d = +c.dataset.d; paintSprite(c.querySelector('canvas'), d, {sc:6, fit:92, shiny: useShiny(d)}); }
function renderBox(){
  // controles
  $('pcQ').value !== tm.q && ($('pcQ').value = tm.q); $('pcType').value = tm.type; $('pcOrder').value = tm.order;
  $('pcFav').classList.toggle('on', tm.fav); $('pcSh').classList.toggle('on', tm.sh);
  [...$('tmRar').querySelectorAll('.pc-pill[data-k]')].forEach(b => b.classList.toggle('on', tm.rar.has(b.dataset.k)));
  $('tmRar').querySelector('.clr').style.display = tm.rar.size ? '' : 'none';
  const keep = d => (!tm.rar.size || tm.rar.has(mon(d).rar)) && (!tm.fav || save.fav.includes(d)) && (!tm.sh || save.shiny.includes(d)) && (!tm.type || mon(d).types.includes(tm.type));
  $('tmNav').innerHTML = [{n:'Todas', a:1, b:1025, c:'#ffcc33'}, ...TEAM_REGIONS].map(r => { const n = save.box.filter(d => !hidden(d) && (r.n === 'Todas' || inRegion(r, d)) && keep(d)).length;
    return `<button class="pc-rg${tm.region === r.n ? ' on' : ''}${n ? '' : ' dim'}" data-r="${r.n}" style="--c:${r.c}">${r.n} <small>${n}</small></button>`; }).join('');
  // rejilla
  tm.io.disconnect();
  const L = boxFiltered();
  $('tmList').innerHTML = L.length ? L.map(tileHtml).join('') : `<p class="pc-none">${tm.fav && !save.fav.length ? 'Aún no tienes favoritos: márcalos con ☆ en la ficha de un Pokémon.' : 'Ningún Pokémon coincide con los filtros.'}</p>`;
  $('tmList').querySelectorAll('.pct').forEach(c => tm.io.observe(c));
  $('pcCnt').textContent = `${L.length} de ${boxCount()} Pokémon`;
  $('tmList').scrollTop = 0; markBox();
}
function markBox(){                                                                                // marca (sin reconstruir) qué Pokémon están en el equipo, cuál se ve en la ficha y cuáles son favoritos / shiny
  $('tmList').querySelectorAll('.pct').forEach(c => {
    const d = +c.dataset.d, i = team.indexOf(d);
    c.classList.toggle('in', i >= 0); c.classList.toggle('cur', d === tm.selD); c.classList.toggle('fav', save.fav.includes(d)); c.classList.toggle('shiny', save.shiny.includes(d));
    c.querySelector('.pct-in').textContent = i >= 0 ? i + 1 : '';
    c.querySelector('.pct-tag').textContent = (save.shiny.includes(d) ? '⭐' : '') + (save.fav.includes(d) ? '★' : '');
  });
}

function openTeam(from){                                                                          // from = 'shop' (Tienda), 'story' (Historia) o 'campo' (Campo de Entrenamiento): al cerrar se vuelve a esa pantalla
  if(!tm.built) buildTeamShell();
  tm.from = from === 'shop' || from === 'story' || from === 'campo' ? from : '';
  const tv = $('teamv'); tv.classList.remove('casa', 'lista'); tv.classList.add('pcv');
  $('tmData').classList.add('hide'); closeDd();
  tm.selD = team[0] || null; tm.selSlot = null;
  renderTeamSlots(); renderBox(); show('teamv');
}
