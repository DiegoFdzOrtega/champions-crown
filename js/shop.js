"use strict";
/* =====================================================================
   13) TIENDA: tickets y objetos de combate, con imagen, pestañas por categoría y orden.
   Reutiliza: SHOP/ITEMS (data.js), buy() y held()/used() (economy.js), panel() y toast() (menu.js).
   ===================================================================== */
const shopSt = {cat:'todo', sort:'reco', qty:{}};                              // qty = cantidad escrita en cada artículo
const SHOP_TABS = [['todo','Todo'], ['ticket','Tickets'], ['ataque','Ataque'], ['defensa','Defensa'], ['tipo','Tipos'], ['util','Utilidad'], ['mejora','Mejoras'], ['mt','MTs del día']];
const tierOf = p => p >= 500 ? 'leg' : p >= 120 ? 't4' : p >= 100 ? 't3' : p >= 80 ? 't2' : 't1';   // borde de la tarjeta según el precio
const ownOf = id => id === 'ticket_n' ? save.tickets : id === 'ticket_l' ? save.ticketsL : held(id);

function openShop(){
  panel(`<h1>Tienda</h1>
    <div class="sh-top">
      <div class="sh-bal"><canvas id="shCoin"></canvas><b id="shBp"></b><small>PUNTOS DE BATALLA</small></div>
      <div class="sh-bal tk"><canvas id="shTk"></canvas><b id="shTn"></b><small>TICKETS</small></div>
      <div class="sh-bal tk"><canvas id="shTl"></canvas><b id="shTL"></b><small>TICKETS LEGENDARIOS</small></div>
      <label class="sh-sort">Ordenar<select id="shSort"><option value="reco">Recomendado</option><option value="pa">Precio: de menor a mayor</option>
        <option value="pd">Precio: de mayor a menor</option><option value="nom">Nombre (A-Z)</option></select></label>
      <button id="shTeam">Equipar objetos →</button>
    </div>
    <div class="sh-tabs" id="shTabs"></div>
    <p class="help" id="shNote"></p>
    <div class="shop" id="shopGrid"></div>`);
  $('panelBody').classList.add('wide');
  bitmap($('shCoin'), ICONS.coin, '#ffcc33'); bitmap($('shTk'), ICONS.ticket, '#ff3ea5'); bitmap($('shTl'), ICONS.ticket, '#ffcc33');
  $('shSort').value = shopSt.sort;
  $('shSort').onchange = e => { shopSt.sort = e.target.value; drawShop(); };
  $('shTeam').onclick = () => openTeam('shop');
  $('shTabs').onclick = e => { const b = e.target.closest('button'); if(!b) return; shopSt.cat = b.dataset.c; drawShop(); };
  drawShop();
}

// Dibuja pestañas y tarjetas (se vuelve a llamar al cambiar de pestaña u orden)
function drawShop(){
  refreshMtShop(); shopSt.day = dayNumber();                                    // MTs del día (se renuevan solos cada 24 h)
  $('shTabs').innerHTML = SHOP_TABS.map(([k,n]) => {
    const c = SHOP.filter(it => k === 'todo' || it.cat === k).length;
    return `<button data-c="${k}" class="${shopSt.cat === k ? 'on' : ''}">${n} <small>${c}</small></button>`; }).join('');
  let list = SHOP.filter(it => shopSt.cat === 'todo' || it.cat === shopSt.cat);
  if(shopSt.sort === 'pa') list.sort((a,b) => a.p - b.p); else if(shopSt.sort === 'pd') list.sort((a,b) => b.p - a.p);
  else if(shopSt.sort === 'nom') list.sort((a,b) => a.n.localeCompare(b.n, 'es'));
  $('shNote').innerHTML = shopSt.cat === 'mt' ? 'Los MTs cambian solos cada 24 horas (a medianoche): <b>8 al día</b>, con pocas unidades de cada uno. Los ataques de estado nuevos están <b>siempre a la venta</b> (hasta ' + TRAIN.mtFixedEach + ' al día de cada uno). Se renuevan en <b id="shClock"></b>. Se usan en Equipo Pokémon > Ver datos.' :
    shopSt.cat === 'mejora' ? 'Las mejoras se gastan en Equipo Pokémon > Ver datos: Chapa Dorada = más IV, Menta = otra naturaleza, Cápsula = otra habilidad.' :
    shopSt.cat === 'tipo' ? 'Los objetos de tipo potencian un 20% los ataques de ese tipo. Mira el tipo de tus ataques en el combate.' :
    shopSt.cat === 'ticket' ? 'Los tickets se gastan en el Gachapon.' : 'Cada Pokémon lleva un objeto. Puedes comprar varios del mismo para equipárselos a más de un Pokémon.';
  shopClock();
  const grid = $('shopGrid'); grid.innerHTML = '';
  list.forEach(it => {
    const isItem = !!ITEMS[it.id], d = document.createElement('div');
    d.className = 'scard ' + (isItem || it.icon ? tierOf(it.p) : it.id === 'ticket_l' ? 'leg' : 'tk'); d.dataset.id = it.id;
    const pic = document.createElement('div'); pic.className = 'sc-img';
    if(isItem){ const im = new Image(); im.alt = it.n; im.src = imgOf(it.id); im.onerror = () => im.style.visibility = 'hidden'; pic.appendChild(im); }
    else if(it.icon){ const im = new Image(); im.alt = it.n; im.onerror = () => { const f = trainFallback(it.icon); if(f && im.src !== f) im.src = f; }; im.src = it.icon; pic.appendChild(im); }            // mejoras y MTs: icono propio
    else { const c = document.createElement('canvas'); bitmap(c, ICONS.ticket, it.id === 'ticket_l' ? '#ffcc33' : '#ff3ea5'); pic.appendChild(c); }
    const tags = it.cat === 'mt' ? `<span class="sc-tag">MT</span><span class="sc-tag ty" style="background:${TC[MOVES[it.mv].t]}">${TYPE_ES[MOVES[it.mv].t]}</span><span class="sc-tag">${SLOT_SHORT[MOVES[it.mv].s]}</span>` :
                 it.cat === 'mejora' ? '<span class="sc-tag">Mejora</span>' : isItem ? `<span class="sc-tag">${ITEM_CATS[it.cat]}</span>` + (ITEMS[it.id].type ? `<span class="sc-tag ty" style="background:${TC[ITEMS[it.id].type]}">${TYPE_ES[ITEMS[it.id].type]}</span>` : '')
                        : '<span class="sc-tag">Ticket</span>';
    const info = document.createElement('div'); info.className = 'sc-info';
    info.innerHTML = `<h3></h3><div class="sc-tags">${tags}</div><p class="sc-d"></p>` + (isItem ? '<p class="sc-og"></p>' : '') + '<p class="own"></p>';
    info.querySelector('h3').textContent = it.n; info.querySelector('.sc-d').textContent = it.d;
    if(isItem) info.querySelector('.sc-og').textContent = ITEMS[it.id].og;
    const q = document.createElement('div'); q.className = 'qty';                // cantidad: se puede escribir directamente (o usar − + Máx)
    q.innerHTML = '<span>Cantidad</span><button type="button" class="qm" aria-label="Una menos">−</button><input class="qi" type="text" inputmode="numeric" maxlength="4" autocomplete="off" aria-label="Cantidad a comprar"><button type="button" class="qp" aria-label="Una más">+</button><button type="button" class="qx" title="Comprar todo lo que puedas">Máx</button>';
    const qi = q.querySelector('.qi'); qi.value = shopQty(it.id);
    const setQ = v => { shopSt.qty[it.id] = Math.max(1, Math.min(9999, Math.floor(+v) || 1)); updateShop(); };
    qi.oninput = () => { const v = qi.value.replace(/\D/g, '').slice(0, 4); if(v !== qi.value) qi.value = v; shopSt.qty[it.id] = Math.max(1, +v || 1); updateShop(true); };   // mientras escribes no se toca el cuadro
    qi.onblur = () => { qi.value = shopQty(it.id); };
    qi.onfocus = () => qi.select();
    qi.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); doBuy(); } };
    q.querySelector('.qm').onclick = () => setQ(shopQty(it.id) - 1);
    q.querySelector('.qp').onclick = () => setQ(shopQty(it.id) + 1);
    q.querySelector('.qx').onclick = () => setQ(Math.max(1, maxBuy(it.id)));
    const b = document.createElement('button'); b.className = 'buy';
    const doBuy = () => { const n = shopQty(it.id), k = n <= maxBuy(it.id) ? buyMany(it.id, n) : 0;
      if(k){ toast(`Comprado: ${k > 1 ? k + ' × ' : ''}${it.n} (−${it.p * k} PB)`); shopSt.qty[it.id] = 1; refreshHud(); updateShop(); d.classList.add('bought'); setTimeout(() => d.classList.remove('bought'), 500); }
      else{ toast(buyError(it.id, n)); if(!SHOP.find(x => x.id === it.id)) drawShop(); } };
    b.onclick = doBuy;
    d.append(pic, info, q, b); grid.appendChild(d);
  });
  updateShop();
}

// Actualiza saldos, "Tienes / Equipados" y botones SIN volver a crear las tarjetas (así no se pierde la posición)
const shopQty = id => Math.max(1, shopSt.qty[id] || 1);
function updateShop(typing){
  $('shBp').textContent = save.bp; $('shTn').textContent = save.tickets; $('shTL').textContent = save.ticketsL;
  $('shopGrid').querySelectorAll('.scard').forEach(d => {
    const it = SHOP.find(x => x.id === d.dataset.id), n = ownOf(it.id), eq = ITEMS[it.id] ? used(it.id) : 0;
    const left = it.cat === 'mt' ? mtLeft(it.id) : 1, sold = left <= 0, want = shopQty(it.id), tot = it.p * want, max = maxBuy(it.id), ok = want <= max;
    d.querySelector('.own').innerHTML = (ITEMS[it.id] ? `Tienes <b>${n}</b> · Equipados <b>${eq}</b>` : `Tienes <b>${n}</b>`) + (it.cat === 'mt' ? ` · Quedan <b>${Math.max(0, left)}</b> hoy` : '');
    const qi = d.querySelector('.qi'); if(!typing && document.activeElement !== qi) qi.value = want;
    d.querySelector('.qm').disabled = sold || want <= 1; d.querySelector('.qx').disabled = max < 1 || sold;
    const b = d.querySelector('.buy'); b.disabled = sold || !ok;
    b.innerHTML = sold ? 'Agotado hoy' : ok ? `Comprar ${want > 1 ? '× ' + want + ' · ' : '· '}<b>${tot}</b> PB`
      : (it.cat === 'mt' && left < want && save.bp >= tot ? `Solo quedan <b>${left}</b> hoy` : `Te faltan <b>${tot - save.bp}</b> PB`);
    d.classList.toggle('poor', save.bp < it.p);
  });
}

// Cuenta atrás hasta el cambio de stock de los MTs (si cambia el día con la tienda abierta, se redibuja)
function shopClock(){
  const c = document.getElementById('shClock'); if(!c) return;
  const t = Math.max(0, Math.floor((nextReset() - Date.now()) / 1000)), p = n => String(n).padStart(2, '0');
  c.textContent = `${p(Math.floor(t / 3600))}:${p(Math.floor(t % 3600 / 60))}:${p(t % 60)}`;
}
setInterval(() => {
  const grid = document.getElementById('shopGrid'); if(!grid || !grid.isConnected || $('panel').classList.contains('hide')) return;
  if(shopSt.day !== dayNumber()) drawShop(); else shopClock();
}, 1000);
