"use strict";
/* =====================================================================
   13b) MOCHILA: pantalla para ver todo lo que tienes (tickets, mejoras, MTs y objetos de combate).
   Se abre desde la barra de arriba (Perfil › Logros › Amigos › Mochila). Solo se mira; los objetos se usan en Equipo Pokémon.
   Reutiliza: save.items / held() / used() (economy.js), ITEMS y CONS (data.js, training.js), imgOf(), itemName(), panel() y userBar().
   ===================================================================== */
const bagSt = {q:''};

function bagSections(){
  const q = bagSt.q.trim().toLowerCase(), has = n => !q || n.toLowerCase().includes(q), out = [];
  const tk = [['ticket_n', 'Ticket Gachapon', save.tickets, 'Se gasta en el Gachapon para conseguir Pokémon.'], ['ticket_l', 'Ticket Legendario', save.ticketsL, 'Se gasta en el Gachapon para intentar un Pokémon legendario.']]
    .filter(([, n, c]) => c > 0 && has(n)).map(([id, n, c, d]) => ({id, n, c, d, tk: id === 'ticket_l' ? '#ffcc33' : '#ff3ea5'}));
  if(tk.length) out.push({t:'Tickets', list:tk});
  const up = Object.keys(CONS).filter(id => held(id) > 0 && has(CONS[id].n)).map(id => ({id, n:CONS[id].n, c:held(id), d:CONS[id].d, img:CONS[id].icon}));
  if(up.length) out.push({t:'Mejoras', list:up, note:'Se usan en Equipo Pokémon › Ver datos.'});
  const mt = Object.keys(MT_ID).filter(id => held(id) > 0 && has(itemName(id))).sort((a, b) => itemName(a).localeCompare(itemName(b), 'es'))
    .map(id => { const mv = MOVES[MT_ID[id]]; return {id, mt:true, n:itemName(id), c:held(id), d:`Enseña «${MT_ID[id]}» a un Pokémon. Se usa en Equipo Pokémon › Ver datos.`, img:trainIcon(id), tags:[[TYPE_ES[mv.t], TC[mv.t]], [SLOT_SHORT[mv.s]]]}; });
  if(mt.length) out.push({t:'MTs', list:mt});
  for(const cat of Object.keys(ITEM_CATS)){
    const l = Object.keys(ITEMS).filter(id => ITEMS[id].cat === cat && held(id) > 0 && has(ITEMS[id].n)).map(id => ({id, n:ITEMS[id].n, c:held(id), eq:used(id), d:ITEMS[id].d, og:ITEMS[id].og, img:imgOf(id)}));
    if(l.length) out.push({t:'Objetos de ' + ITEM_CATS[cat].toLowerCase(), list:l});
  }
  return out;
}

// MT de la mochila: «Enseñar a un Pokémon» enseña la lista de tu equipo con ✓ (compatible) o ✕. Usa la misma comprobación (teachCheck) y la misma pantalla de confirmación que Ver datos.
function teachRow(id){
  const n = mtMove(id), w = document.createElement('div'); w.className = 'bag-teach';
  const open = document.createElement('button'); open.textContent = 'Enseñar a un Pokémon'; w.appendChild(open);
  const row = document.createElement('div'); row.className = 'bag-who hide'; w.appendChild(row);
  open.onclick = () => row.classList.toggle('hide');
  team.forEach(d => {
    const err = teachCheck(d, n), b = document.createElement('button');
    b.className = 'bag-pk' + (err ? ' no' : ''); b.textContent = `${mon(d).name} ${err ? (err === NO_LEARN ? '✕' : '·') : '✓'}`;
    b.title = err || `Abrir «Cambiar ataque» de ${mon(d).name}`;
    b.onclick = () => err ? toast(err) : (openTeam(), openDataMoves(d, MOVES[n].s, 'mt:' + id));
    row.appendChild(b);
  });
  return w;
}
function drawBag(){
  const secs = bagSections(), box = $('bagList'); box.innerHTML = '';
  if(!secs.length){ box.innerHTML = `<p class="help">${bagSt.q.trim() ? 'No hay nada con ese nombre.' : 'Tu mochila está vacía. Compra objetos en la Tienda o consigue chapas venciendo a los líderes.'}</p>`; return; }
  secs.forEach(s => {
    const h = document.createElement('h2'); h.textContent = s.t; box.appendChild(h);
    if(s.note){ const p = document.createElement('p'); p.className = 'help'; p.textContent = s.note; box.appendChild(p); }
    const g = document.createElement('div'); g.className = 'bag-grid'; box.appendChild(g);
    s.list.forEach(it => {
      const d = document.createElement('div'); d.className = 'bag-it'; d.dataset.id = it.id;
      const pic = document.createElement('div'); pic.className = 'bag-img';
      if(it.tk){ const c = document.createElement('canvas'); bitmap(c, ICONS.ticket, it.tk); pic.appendChild(c); }
      else { const im = new Image(); im.alt = it.n; im.src = it.img; pic.appendChild(im); }
      const n = document.createElement('b'); n.className = 'bag-n'; n.textContent = '×' + it.c; pic.appendChild(n);
      const info = document.createElement('div'); info.className = 'bag-info';
      const h3 = document.createElement('h3'); h3.textContent = it.n; info.appendChild(h3);
      if(it.tags){ const t = document.createElement('div'); t.className = 'sc-tags'; it.tags.forEach(([x, col]) => { const sp = document.createElement('span'); sp.className = 'sc-tag' + (col ? ' ty' : ''); if(col) sp.style.background = col; sp.textContent = x; t.appendChild(sp); }); info.appendChild(t); }
      const p = document.createElement('p'); p.textContent = it.d; info.appendChild(p);
      if(it.eq !== undefined){ const e = document.createElement('p'); e.className = 'bag-eq'; e.innerHTML = `Equipados <b>${it.eq}</b> · Libres <b>${it.c - it.eq}</b>`; info.appendChild(e); }
      if(it.mt) info.appendChild(teachRow(it.id));
      d.append(pic, info); g.appendChild(d);
    });
  });
}

function openBag(){
  panel(userBar('bag') + `<h1>Mochila</h1>
    <div class="bag-top"><div class="sh-bal"><canvas id="bgCoin"></canvas><b id="bgBp"></b><small>PUNTOS DE BATALLA</small></div>
      <label class="sh-sort">Buscar<input id="bagQ" type="text" maxlength="30" placeholder="Nombre del objeto…" autocomplete="off"></label>
      <button id="bagShop">Ir a la Tienda →</button><button id="bagTeam">Equipo Pokémon →</button></div>
    <div id="bagList"></div>`);
  $('panelBody').classList.add('wide');
  bitmap($('bgCoin'), ICONS.coin, '#ffcc33'); $('bgBp').textContent = save.bp;
  $('bagQ').value = bagSt.q; $('bagQ').oninput = e => { bagSt.q = e.target.value; drawBag(); };
  $('bagShop').onclick = openShop; $('bagTeam').onclick = () => openTeam();
  drawBag();
}
