"use strict";
/* =====================================================================
   13) TIENDA «ESCAPARATE»: categorías a la izquierda, objetos en estantes en el centro y, a la derecha, el detalle del objeto
   elegido (descripción, qué hace el ataque, quién de tu equipo lo aprende, cantidad y comprar).
   Reutiliza: SHOP/ITEMS (data.js), buyMany()/maxBuy()/held()/used() (economy.js), panel() y toast() (menu.js),
   moveInfo() (moveinfo.js) y los MTs de training.js. Los estilos están al final de css/style.css (clases sa-...).
   ===================================================================== */
const shopSt = {cat:'todo', sort:'reco', qty:{}, q:'', slot:'', type:'', sel:''};   // q = texto buscado · slot/type = filtros de MTs · sel = objeto elegido
const SHOP_TABS = [['todo','Todo'], ['ticket','Tickets'], ['ataque','Ataque'], ['defensa','Defensa'], ['tipo','Tipos'], ['util','Utilidad'], ['mejora','Mejoras'], ['mt','MTs']];
const tierOf = p => p >= 500 ? 'leg' : p >= 120 ? 't4' : p >= 100 ? 't3' : p >= 80 ? 't2' : 't1';   // rareza según el precio
const TIER_COL = {t1:'#9aa6b8', t2:'#3ea6ff', t3:'#a56bff', t4:'#ffcc33', leg:'#ffcc33', tk:'#ff3ea5'};
const ownOf = id => id === 'ticket_n' ? save.tickets : id === 'ticket_l' ? save.ticketsL : held(id);
const shopCol = it => it.cat === 'mt' ? TC[MOVES[it.mv].t] : (ITEMS[it.id] && ITEMS[it.id].type) ? TC[ITEMS[it.id].type] : it.id === 'ticket_n' ? TIER_COL.tk : TIER_COL[tierOf(it.p)];
const shopNote = {
  mt:'Todos los MTs, siempre a la venta y sin límite. Se usan en Equipo Pokémon > Ver datos.',
  mejora:'Las mejoras se gastan en Equipo Pokémon > Ver datos.',
  tipo:'Los objetos de tipo potencian un 20 % los ataques de ese tipo.',
  ticket:'Los tickets se gastan en el Gachapon.',
  _:'Cada Pokémon lleva un objeto. Puedes comprar varios del mismo.'};

function openShop(){
  panel(`<div class="sa">
    <div class="sa-awn"><div class="sa-sign">★ TIENDA ★</div>
      <div class="sa-bal"><div><canvas id="shCoin"></canvas><b id="shBp"></b></div><div class="tk"><canvas id="shTk"></canvas><b id="shTn"></b></div><div class="tl"><canvas id="shTl"></canvas><b id="shTL"></b></div></div></div>
    <div class="sa-body">
      <nav class="sa-cats" id="shTabs"></nav>
      <section class="sa-mid">
        <div class="sa-filt">
          <label>Buscar <input id="shQ" type="text" maxlength="30" autocomplete="off" placeholder="Nombre…"></label>
          <label class="mtf">Hueco <select id="shSlot"><option value="">Todos</option>${[1,2,3,4].map(k => `<option value="${k}">${SLOT_NAMES[k]}</option>`).join('')}</select></label>
          <label class="mtf">Tipo <select id="shType"><option value="">Todos</option>${Object.keys(TYPE_ES).map(t => `<option value="${t}">${TYPE_ES[t]}</option>`).join('')}</select></label>
          <label>Ordenar <select id="shSort"><option value="reco">Recomendado</option><option value="pa">Precio ↑</option><option value="pd">Precio ↓</option><option value="nom">Nombre (A-Z)</option></select></label>
          <button type="button" id="shClr">Quitar filtros</button><button type="button" id="shTeam">Equipar objetos →</button>
        </div>
        <p class="sa-note" id="shNote"></p>
        <div class="sa-shelf" id="shopGrid"></div>
      </section>
      <aside class="sa-det" id="shDet"></aside>
    </div></div>`);
  $('panelBody').classList.add('wide');
  bitmap($('shCoin'), ICONS.coin, '#ffcc33'); bitmap($('shTk'), ICONS.ticket, '#ff3ea5'); bitmap($('shTl'), ICONS.ticket, '#ffcc33');
  $('shSort').value = shopSt.sort;
  $('shSort').onchange = e => { shopSt.sort = e.target.value; drawShop(); };
  $('shTeam').onclick = () => openTeam('shop');
  $('shQ').value = shopSt.q; $('shSlot').value = shopSt.slot; $('shType').value = shopSt.type;
  $('shQ').oninput = e => { shopSt.q = e.target.value; drawShop(); };
  $('shSlot').onchange = e => { shopSt.slot = e.target.value; drawShop(); };
  $('shType').onchange = e => { shopSt.type = e.target.value; drawShop(); };
  $('shClr').onclick = () => { shopSt.q = ''; shopSt.slot = ''; shopSt.type = ''; $('shQ').value = ''; $('shSlot').value = ''; $('shType').value = ''; drawShop(); };
  $('shTabs').onclick = e => { const b = e.target.closest('[data-c]'); if(!b) return; shopSt.cat = b.dataset.c; drawShop(); };
  drawShop();
}

// Imagen grande del objeto (objetos con foto, mejoras y MTs con icono, tickets dibujados en píxeles)
function shopPic(it, cls){
  const isItem = !!ITEMS[it.id], box = document.createElement('span'); box.className = cls;
  if(isItem){ const im = new Image(); im.alt = it.n; im.src = imgOf(it.id); im.onerror = () => im.style.visibility = 'hidden'; box.appendChild(im); }
  else if(it.icon){ const im = new Image(); im.alt = it.n; im.onerror = () => { const f = trainFallback(it.icon); if(f && im.src !== f) im.src = f; }; im.src = it.icon; box.appendChild(im); }
  else { const c = document.createElement('canvas'); bitmap(c, ICONS.ticket, it.id === 'ticket_l' ? '#ffcc33' : '#ff3ea5'); box.appendChild(c); }
  return box;
}

// Dibuja categorías y estantes (se vuelve a llamar al cambiar de categoría, filtro u orden)
function drawShop(){
  refreshMtShop();                                                              // todos los MTs a la venta
  $('shTabs').innerHTML = SHOP_TABS.map(([k,n]) => {
    const c = SHOP.filter(it => k === 'todo' || it.cat === k).length;
    return `<div class="sa-cat${shopSt.cat === k ? ' on' : ''}" data-c="${k}" tabindex="0">${n}<small>${c}</small></div>`; }).join('');
  const mtTab = shopSt.cat === 'mt', qn = shopSt.q.trim().toLowerCase();
  document.querySelectorAll('.sa-filt .mtf').forEach(l => l.style.display = mtTab ? '' : 'none');          // Hueco y Tipo solo en la pestaña MTs
  let list = SHOP.filter(it => (shopSt.cat === 'todo' || it.cat === shopSt.cat)
    && (!qn || it.n.toLowerCase().includes(qn))
    && (!mtTab || ((!shopSt.slot || MOVES[it.mv].s === +shopSt.slot) && (!shopSt.type || MOVES[it.mv].t === shopSt.type))));
  if(shopSt.sort === 'pa') list.sort((a,b) => a.p - b.p); else if(shopSt.sort === 'pd') list.sort((a,b) => b.p - a.p);
  else if(shopSt.sort === 'nom') list.sort((a,b) => a.n.localeCompare(b.n, 'es'));
  $('shNote').textContent = (shopNote[shopSt.cat] || shopNote._) + (mtTab ? ` (${list.length} ataques)` : '');
  const grid = $('shopGrid'); grid.innerHTML = '';
  if(!list.length){ grid.innerHTML = '<p class="sa-empty">No hay nada con esos filtros.</p>'; }
  if(!list.some(it => it.id === shopSt.sel)) shopSt.sel = list[0] ? list[0].id : '';          // si el elegido ya no se ve, elige el primero
  list.forEach(it => {
    const d = document.createElement('div'); d.className = 'sa-sl'; d.dataset.id = it.id; d.tabIndex = 0; d.style.setProperty('--c', shopCol(it));
    d.append(shopPic(it, 'sa-pic'));
    const nm = document.createElement('span'); nm.className = 'sa-nm'; nm.textContent = it.n.replace(/^MT /, ''); d.appendChild(nm);
    if(it.cat === 'mt'){ const t = document.createElement('i'); t.className = 'sa-ty'; t.style.background = TC[MOVES[it.mv].t]; t.title = TYPE_ES[MOVES[it.mv].t]; d.appendChild(t); }
    const pr = document.createElement('span'); pr.className = 'sa-tag'; pr.textContent = it.p + ' PB'; d.appendChild(pr);
    const ow = document.createElement('em'); ow.className = 'sa-own'; d.appendChild(ow);
    const pick = () => { shopSt.sel = it.id; shopMark(); renderDet(); };
    d.onclick = pick; d.onkeydown = e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); pick(); } };
    grid.appendChild(d);
  });
  shopMark(); renderDet(); updateShop();
}
function shopMark(){ $('shopGrid').querySelectorAll('.sa-sl').forEach(d => d.classList.toggle('sel', d.dataset.id === shopSt.sel)); }

// Panel de la derecha: el objeto elegido
function renderDet(){
  const box = $('shDet'), it = SHOP.find(x => x.id === shopSt.sel);
  dexThumbs.length = 0;                                                         // miniaturas de los Pokémon de este panel (se dibujan solas)
  if(!it){ box.innerHTML = '<p class="sa-empty">Elige un objeto de los estantes.</p>'; return; }
  const isItem = !!ITEMS[it.id], col = shopCol(it);
  box.style.setProperty('--c', col); box.innerHTML = '';
  const big = document.createElement('div'); big.className = 'sa-big'; big.appendChild(shopPic(it, 'sa-bigpic')); box.appendChild(big);
  const h = document.createElement('h2'); h.textContent = it.n; box.appendChild(h);
  const tags = document.createElement('div'); tags.className = 'sa-tags';
  tags.innerHTML = it.cat === 'mt' ? `<span>MT</span><span class="ty" style="background:${TC[MOVES[it.mv].t]}">${TYPE_ES[MOVES[it.mv].t]}</span><span>${SLOT_SHORT[MOVES[it.mv].s]}</span>` :
    it.cat === 'mejora' ? '<span>Mejora</span>' : isItem ? `<span>${ITEM_CATS[it.cat]}</span>` + (ITEMS[it.id].type ? `<span class="ty" style="background:${TC[ITEMS[it.id].type]}">${TYPE_ES[ITEMS[it.id].type]}</span>` : '') : '<span>Ticket</span>';
  box.appendChild(tags);
  const p = document.createElement('p'); p.className = 'sa-d'; p.textContent = it.d; box.appendChild(p);
  if(isItem){ const og = document.createElement('p'); og.className = 'sa-og'; og.textContent = ITEMS[it.id].og; box.appendChild(og); }
  if(it.cat === 'mt'){
    const inf = moveInfo(it.mv), mv = document.createElement('div'); mv.className = 'sa-mv';
    mv.innerHTML = `<b>Qué es</b><p></p><b>Qué hace aquí</b><ul>${inf.game.map(() => '<li></li>').join('')}</ul>`;
    mv.querySelector('p').textContent = inf.real; mv.querySelectorAll('li').forEach((li, k) => li.textContent = inf.game[k]);
    box.appendChild(mv);
    const who = team.filter(dx => LEARN_SET[it.mv] && LEARN_SET[it.mv].has(dx)), mine = save.box.filter(dx => LEARN_SET[it.mv] && LEARN_SET[it.mv].has(dx) && !hidden(dx)).length;
    const can = document.createElement('div'); can.className = 'sa-can' + (who.length ? '' : ' no');
    can.innerHTML = (who.length ? '✔ Tu equipo puede aprenderla' : '✖ Nadie de tu equipo puede aprenderla') + `<small>${mine} de tus ${save.box.filter(dx => !hidden(dx)).length} Pokémon la aprenden</small>`;
    if(who.length){ const row = document.createElement('div'); row.className = 'sa-mini';
      who.forEach(dx => { const f = document.createElement('div'), c = document.createElement('canvas'); c.width = c.height = 64; f.appendChild(c); f.append(mon(dx).name); row.appendChild(f); dexThumbs.push({c, m:mon(dx), s:useShiny(dx)}); });
      can.appendChild(row); }
    box.appendChild(can);
  }
  const own = document.createElement('p'); own.className = 'sa-ownln'; own.id = 'shOwn'; box.appendChild(own);
  const q = document.createElement('div'); q.className = 'qty';
  q.innerHTML = '<span>Cantidad</span><button type="button" class="qm" aria-label="Una menos">−</button><input class="qi" type="text" inputmode="numeric" maxlength="4" autocomplete="off" aria-label="Cantidad a comprar"><button type="button" class="qp" aria-label="Una más">+</button><button type="button" class="qx" title="Comprar todo lo que puedas pagar">Máx</button>';
  const qi = q.querySelector('.qi'); qi.value = shopQty(it.id);
  const setQ = v => { shopSt.qty[it.id] = Math.max(1, Math.min(9999, Math.floor(+v) || 1)); updateShop(); };
  qi.oninput = () => { const v = qi.value.replace(/\D/g, '').slice(0, 4); if(v !== qi.value) qi.value = v; shopSt.qty[it.id] = Math.max(1, +v || 1); updateShop(true); };
  qi.onblur = () => { qi.value = shopQty(it.id); }; qi.onfocus = () => qi.select();
  qi.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); doBuy(); } };
  q.querySelector('.qm').onclick = () => setQ(shopQty(it.id) - 1);
  q.querySelector('.qp').onclick = () => setQ(shopQty(it.id) + 1);
  q.querySelector('.qx').onclick = () => setQ(Math.max(1, maxBuy(it.id)));
  const b = document.createElement('button'); b.className = 'sa-buy'; b.id = 'shBuy';
  const doBuy = () => { const n = shopQty(it.id), k = n <= maxBuy(it.id) ? buyMany(it.id, n) : 0;
    if(k){ toast(`Comprado: ${k > 1 ? k + ' × ' : ''}${it.n} (−${it.p * k} PB)`); shopSt.qty[it.id] = 1; refreshHud(); updateShop(); box.classList.add('bought'); setTimeout(() => box.classList.remove('bought'), 500); }
    else toast(buyError(it.id, n)); };
  b.onclick = doBuy;
  box.append(q, b); updateShop();
}

// Actualiza saldos, «Tienes», cantidad y botón SIN volver a crear nada (así no se pierde la posición)
const shopQty = id => Math.max(1, shopSt.qty[id] || 1);
function updateShop(typing){
  if(!$('shBp')) return;
  $('shBp').textContent = save.bp; $('shTn').textContent = save.tickets; $('shTL').textContent = save.ticketsL;
  $('shopGrid').querySelectorAll('.sa-sl').forEach(d => {
    const n = ownOf(d.dataset.id), it = SHOP.find(x => x.id === d.dataset.id);
    d.querySelector('.sa-own').textContent = n > 0 ? '×' + n : ''; d.classList.toggle('poor', !!it && save.bp < it.p);
  });
  const it = SHOP.find(x => x.id === shopSt.sel), box = $('shDet'); if(!it || !box.querySelector('.qi')) return;
  const n = ownOf(it.id), eq = ITEMS[it.id] ? used(it.id) : 0, want = shopQty(it.id), tot = it.p * want, max = maxBuy(it.id), ok = want <= max;
  $('shOwn').innerHTML = ITEMS[it.id] ? `Tienes <b>${n}</b> · Equipados <b>${eq}</b>` : `Tienes <b>${n}</b>`;
  const qi = box.querySelector('.qi'); if(!typing && document.activeElement !== qi) qi.value = want;
  box.querySelector('.qm').disabled = want <= 1; box.querySelector('.qx').disabled = max < 1;
  const b = $('shBuy'); b.disabled = !ok;
  b.innerHTML = ok ? `Comprar ${want > 1 ? '× ' + want + ' · ' : '· '}<b>${tot}</b> PB` : `Te faltan <b>${tot - save.bp}</b> PB`;
}
