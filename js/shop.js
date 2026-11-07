"use strict";
/* =====================================================================
   13) TIENDA «ESCAPARATE»: categorías a la izquierda, objetos en estantes en el centro y, a la derecha, el detalle del objeto
   elegido (descripción, qué hace el ataque, quién de tu equipo lo aprende, cantidad y comprar).
   Reutiliza: SHOP/ITEMS (data.js), buyMany()/maxBuy()/held()/used() (economy.js), panel() y toast() (menu.js),
   moveInfo() (moveinfo.js) y los MTs de training.js. Los estilos están al final de css/style.css (clases sa-...).
   ===================================================================== */
const shopSt = {cat:'oferta', sort:'reco', qty:{}, q:'', slot:'', type:'', sel:''};   // q = texto buscado · slot/type = filtros de MTs · sel = objeto elegido
const SHOP_TABS = [['oferta','⚡ Ofertas'], ['todo','Todo'], ['ticket','Tickets'], ['ataque','Ataque'], ['defensa','Defensa'], ['tipo','Tipos'], ['util','Utilidad'], ['mejora','Mejoras'], ['mega','Mega'], ['mt','MTs'], ['canje','Canje']];
// ---- OFERTAS DEL DÍA: 5 objetos con descuento que cambian cada día (a las 00:00). Salen de la fecha, así que son iguales para todos y no se guardan.
const SHOP_DESC = [20, 25, 30, 40, 50];                                          // posibles descuentos (%)
const shopToday = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
let SHOP_DEALS = {day:0, m:{}};
function shopDeals(){
  const day = shopToday(); if(SHOP_DEALS.day === day) return SHOP_DEALS.m;
  let a = day * 7919 % 2147483647 || 1; const r = () => (a = a * 16807 % 2147483647) / 2147483647;
  const pool = SHOP.filter(it => !['mt', 'canje', 'ticket', 'mega'].includes(it.cat)).map(it => [it, r()]).sort((x, y) => x[1] - y[1]).map(x => x[0]).slice(0, 5), m = {};
  const ds = SHOP_DESC.map(d => [d, r()]).sort((x, y) => x[1] - y[1]).map(x => x[0]);          // cada oferta, un descuento distinto
  pool.forEach((it, i) => m[it.id] = ds[i]);
  SHOP_DEALS = {day, m}; return m;
}
const shopPct = it => it.cat === 'canje' ? 0 : (shopDeals()[it.id] || 0);
const shopPrice = it => it.cat === 'canje' ? it.p : Math.max(1, Math.round(it.p * (100 - shopPct(it)) / 100));
const shopLeft = () => { const n = new Date(), m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1) - n, h = Math.floor(m / 36e5), mi = Math.floor(m % 36e5 / 6e4), se = Math.floor(m % 6e4 / 1e3); return [h, mi, se].map(v => String(v).padStart(2, '0')).join(':'); };
// ---- CANJE DE CHAPAS: las chapas (premios de Torre y Campo) también se pueden cambiar por cosas. cur = qué chapa se gasta · give = qué recibes · gn = cuánto
SHOP.push(
  {id:'cj_ticket',   n:'Ticket Gachapon',        cat:'canje', cur:'chapaplata', p:4,  give:'tickets',    gn:1,   d:'Cambia 4 Chapas Plateadas por 1 tirada del Gachapon.'},
  {id:'cj_bp',       n:'Saco de Puntos',         cat:'canje', cur:'chapaplata', p:2,  give:'bp',         gn:400, d:'Cambia 2 Chapas Plateadas por 400 Puntos de Batalla.', get icon(){ return CUR_SRC.bp; }},
  {id:'cj_estrella', n:'Estrella de Invocación', cat:'canje', cur:'chapaplata', p:8,  give:'estrella',   gn:1,   d:'Cambia 8 Chapas Plateadas por 1 Estrella para la Invocación.', icon:'iconos/estrella.webp'},
  {id:'cj_ticketl',  n:'Ticket Legendario',      cat:'canje', cur:'chapa',      p:6,  give:'ticketsL',   gn:1,   d:'Cambia 6 Chapas Doradas por un Ticket Gachapon Legendario.'},
  {id:'cj_estrellat',n:'Estrella Rosa',          cat:'canje', cur:'chapa',      p:12, give:'estrella_t', gn:1,   d:'Cambia 12 Chapas Doradas por 1 Estrella Rosa (Masters).', icon:'iconos/estrella_t.webp'}
);
const CJ_NAME = {chapaplata:'Chapas Plateadas', chapa:'Chapas Doradas'};
const SHOP_ICO = {oferta:'cintaelec', todo:'restos', ticket:'', ataque:'vidasfera', defensa:'chaleco', tipo:'gafasol', util:'cascabel', mejora:'chapa', mega:'mega_charizard_x', mt:'', canje:'chapaplata'};   // objeto que hace de icono de cada categoría
const TIER_NAME = {t1:'Común', t2:'Raro', t3:'Épico', t4:'Superior', leg:'Legendario'};
const tierOf = p => p >= 500 ? 'leg' : p >= 120 ? 't4' : p >= 100 ? 't3' : p >= 80 ? 't2' : 't1';   // rareza según el precio
const TIER_COL = {t1:'#9aa6b8', t2:'#3ea6ff', t3:'#a56bff', t4:'#ffcc33', leg:'#ffcc33', tk:'#ff3ea5'};
const ownOf = id => { const it = SHOP.find(x => x.id === id); if(it && it.cat === 'canje') return it.give === 'tickets' ? save.tickets : it.give === 'ticketsL' ? save.ticketsL : it.give === 'bp' ? 0 : held(it.give); return id === 'ticket_n' ? save.tickets : id === 'ticket_l' ? save.ticketsL : held(id); };
const shopCol = it => it.cat === 'mt' ? TC[MOVES[it.mv].t] : (ITEMS[it.id] && ITEMS[it.id].type) ? TC[ITEMS[it.id].type] : it.id === 'ticket_n' ? TIER_COL.tk : it.cat === 'canje' ? (it.cur === 'chapa' ? '#ffcc33' : '#c9d6f5') : TIER_COL[tierOf(it.p)];
const shopNote = {
  oferta:'Ofertas del día: 5 objetos rebajados. Cambian cada día a las 00:00.',
  canje:'Cambia tus Chapas (las de la Torre y el Campo de Entrenamiento) por tiradas, estrellas y Puntos. Ojo: las chapas también sirven para mejorar a tus Pokémon.',
  mega:'Piedras Activadoras: cada una solo sirve a su Pokémon. Para megaevolucionar en combate (tecla R) también necesitas el Mega-Aro (logro: Campeón de Teselia).',
  mt:'Todos los MTs, siempre a la venta y sin límite. Se usan en Equipo Pokémon > Ver datos.',
  mejora:'Las mejoras se gastan en Equipo Pokémon > Ver datos.',
  tipo:'Los objetos de tipo potencian un 20 % los ataques de ese tipo.',
  ticket:'Los tickets se gastan en el Gachapon.',
  _:'Cada Pokémon lleva un objeto. Puedes comprar varios del mismo.'};

const shopSnd = n => { try{ if(typeof Sfx !== 'undefined') Sfx.play(n); }catch(e){} };     // suena un efecto (música.js · Sfx)
// ---- EL VENDEDOR: cambia de pose y dice una frase según lo que hagas (imágenes iconos/vendedor_*.webp) ----
const SHOP_V = {hi:'vendedor_hola', ok:'vendedor_ok', joy:'vendedor_feliz', sorry:'vendedor_perdon', idle:'vendedor_reposo'};
const SHOP_SAY = {
  hi:['¡Bienvenido! Mira lo que quieras.', '¡Hola! ¿Qué te pongo hoy?', '¡Pasa, pasa! Hoy hay ofertas.'],
  ok:['¡Buena elección!', '¡Excelente compra!', '¡Se nota que sabes de esto!', '¡Eso te vendrá genial!'],
  joy:['¡Menudo chollo te llevas!', '¡Una oferta de las buenas!', '¡Eso sí que es ahorrar!'],
  sorry:['Uy... te faltan puntos.', 'Vuelve cuando tengas más, ¿vale?', 'Mmm, hoy no te llega...'],
  idle:['Si necesitas algo, dímelo.', 'Tómate tu tiempo.', 'Todo a buen precio, ¿eh?']};
let shopVT = 0;
const shopSay = (m, txt) => {
  const im = $('shVimg'), bx = $('shSay'); if(!im || !bx) return;
  const L = SHOP_SAY[m]; im.src = 'iconos/' + SHOP_V[m] + '.webp?v=1'; bx.textContent = txt || L[Math.floor(Math.random() * L.length)];
  bx.classList.remove('pop'); void bx.offsetWidth; bx.classList.add('pop'); im.classList.remove('hop'); void im.offsetWidth; if(m === 'joy' || m === 'ok') im.classList.add('hop');
  clearTimeout(shopVT); if(m !== 'idle') shopVT = setTimeout(() => shopSay('idle'), 5000);
};
let shopTimer = 0;
function openShop(){
  panel(`<div class="sa">
    <div class="sa-awn"><div class="sa-sign">★ TIENDA ★</div>
      <div class="sa-bal"><div><canvas id="shCoin"></canvas><b id="shBp"></b></div><div class="tk"><canvas id="shTk"></canvas><b id="shTn"></b></div><div class="tl"><canvas id="shTl"></canvas><b id="shTL"></b></div><div class="cp"><img id="shCp" alt="Chapas plateadas"><b id="shCpn"></b></div><div class="co"><img id="shCo" alt="Chapas doradas"><b id="shCon"></b></div></div></div>
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
      <div class="sa-right"><aside class="sa-det" id="shDet"></aside><div class="sa-vend" id="shVend"><div class="sa-say" id="shSay"></div><div class="sa-stage"><img id="shVimg" alt="Vendedor" draggable="false"><div class="sa-reg"><i></i></div><div class="sa-coins"></div><div class="sa-counter"><span class="sa-cn-top"></span><span class="sa-cn-front"></span></div></div></div></div>
    </div></div>`);
  $('panelBody').classList.add('wide', 'shopv');                    // la tienda ocupa toda la parte de arriba (sin hueco encima)
  bitmap($('shCoin'), ICONS.coin, '#ffcc33'); bitmap($('shTk'), ICONS.ticket, '#ff3ea5'); bitmap($('shTl'), ICONS.ticket, '#ffcc33');
  $('shCp').src = imgOf('chapaplata'); $('shCo').src = imgOf('chapa');
  clearInterval(shopTimer); shopTimer = setInterval(() => { if(!$('shNote')){ clearInterval(shopTimer); return; } const cd = $('shCd'); if(cd) cd.textContent = shopLeft(); }, 1000);
  $('shSort').value = shopSt.sort;
  $('shSort').onchange = e => { shopSt.sort = e.target.value; drawShop(); };
  $('shTeam').onclick = () => openTeam('shop');
  $('shQ').value = shopSt.q; $('shSlot').value = shopSt.slot; $('shType').value = shopSt.type;
  $('shQ').oninput = e => { shopSt.q = e.target.value; drawShop(); };
  $('shSlot').onchange = e => { shopSt.slot = e.target.value; drawShop(); };
  $('shType').onchange = e => { shopSt.type = e.target.value; drawShop(); };
  $('shClr').onclick = () => { shopSt.q = ''; shopSt.slot = ''; shopSt.type = ''; $('shQ').value = ''; $('shSlot').value = ''; $('shType').value = ''; drawShop(); };
  $('shTabs').onclick = e => { const b = e.target.closest('[data-c]'); if(!b) return; shopSt.cat = b.dataset.c; drawShop(); };
  Object.values(SHOP_V).forEach(n => { new Image().src = 'iconos/' + n + '.webp?v=1'; });       // se cargan ya, para que el cambio de pose no parpadee
  drawShop(); shopSay('hi');
}

// Imagen grande del objeto (objetos con foto, mejoras y MTs con icono, tickets dibujados en píxeles)
function shopPic(it, cls){
  const isItem = !!ITEMS[it.id], box = document.createElement('span'); box.className = cls;
  if(isItem){ const im = new Image(); im.alt = it.n; im.src = imgOf(it.id); im.onerror = () => im.style.visibility = 'hidden'; box.appendChild(im); }
  else if(it.icon){ const im = new Image(); im.alt = it.n; im.onerror = () => { const f = trainFallback(it.icon); if(f && im.src !== f) im.src = f; }; im.src = it.icon; box.appendChild(im); }
  else { const c = document.createElement('canvas'); bitmap(c, ICONS.ticket, it.id === 'ticket_l' || it.id === 'cj_ticketl' ? '#ffcc33' : '#ff3ea5'); box.appendChild(c); }
  return box;
}

// Dibuja categorías y estantes (se vuelve a llamar al cambiar de categoría, filtro u orden)
function drawShop(){
  refreshMtShop();                                                              // todos los MTs a la venta
  $('shTabs').innerHTML = SHOP_TABS.map(([k,n]) => {
    const c = k === 'oferta' ? Object.keys(shopDeals()).length : SHOP.filter(it => k === 'todo' ? it.cat !== 'canje' : it.cat === k).length;
    const ic = k === 'ticket' ? CUR_SRC.ticket : SHOP_ICO[k] ? imgOf(SHOP_ICO[k]) : '', hot = k === 'oferta' ? ' hot' : '';
    return `<div class="sa-cat${shopSt.cat === k ? ' on' : ''}${hot}" data-c="${k}" tabindex="0">${ic ? `<img src="${ic}" alt="" onerror="this.style.visibility='hidden'">` : '<i class="ph"></i>'}<span>${n.replace('⚡ ', '')}</span><small>${c}</small></div>`; }).join('');
  const mtTab = shopSt.cat === 'mt', qn = shopSt.q.trim().toLowerCase();
  document.querySelectorAll('.sa-filt .mtf').forEach(l => l.style.display = mtTab ? '' : 'none');          // Hueco y Tipo solo en la pestaña MTs
  let list = SHOP.filter(it => (shopSt.cat === 'oferta' ? shopPct(it) > 0 : shopSt.cat === 'todo' ? it.cat !== 'canje' : it.cat === shopSt.cat)
    && (!qn || it.n.toLowerCase().includes(qn))
    && (!mtTab || ((!shopSt.slot || MOVES[it.mv].s === +shopSt.slot) && (!shopSt.type || MOVES[it.mv].t === shopSt.type))));
  if(shopSt.sort === 'pa') list.sort((a,b) => shopPrice(a) - shopPrice(b)); else if(shopSt.sort === 'pd') list.sort((a,b) => shopPrice(b) - shopPrice(a));
  else if(shopSt.sort === 'nom') list.sort((a,b) => a.n.localeCompare(b.n, 'es'));
  if(shopSt.cat === 'oferta') $('shNote').innerHTML = `<span class="sa-hot">⚡ OFERTAS DEL DÍA</span><span class="sa-cd">Terminan en <b id="shCd">${shopLeft()}</b></span><em>5 objetos rebajados · cambian a las 00:00</em>`;
  else $('shNote').textContent = (shopNote[shopSt.cat] || shopNote._) + (mtTab ? ` (${list.length} ataques)` : '');
  $('shNote').classList.toggle('hero', shopSt.cat === 'oferta');
  const grid = $('shopGrid'); grid.innerHTML = '';
  if(!list.length){ grid.innerHTML = '<p class="sa-empty">No hay nada con esos filtros.</p>'; }
  if(!list.some(it => it.id === shopSt.sel)) shopSt.sel = list[0] ? list[0].id : '';          // si el elegido ya no se ve, elige el primero
  list.forEach(it => {
    const d = document.createElement('div'); d.className = 'sa-sl'; d.dataset.id = it.id; d.tabIndex = 0; d.style.setProperty('--c', shopCol(it));
    d.append(shopPic(it, 'sa-pic'));
    const nm = document.createElement('span'); nm.className = 'sa-nm'; nm.textContent = it.n.replace(/^MT /, ''); d.appendChild(nm);
    if(it.cat === 'mt'){ const t = document.createElement('i'); t.className = 'sa-ty'; t.style.background = TC[MOVES[it.mv].t]; t.title = TYPE_ES[MOVES[it.mv].t]; d.appendChild(t); }
    const pr = document.createElement('span'), pc = shopPct(it); pr.className = 'sa-tag';
    const cico = it.cat === 'canje' ? imgOf(it.cur) : (typeof CUR_SRC !== 'undefined' ? CUR_SRC.bp : '');
    pr.innerHTML = `<img src="${cico}" alt="" onerror="this.style.display='none'">${pc ? `<s>${it.p}</s>` : ''}<b>${shopPrice(it)}</b>`; d.appendChild(pr);
    const rr = document.createElement('i'); rr.className = 'sa-rar'; rr.textContent = it.cat === 'canje' ? 'Canje' : it.cat === 'mt' ? 'MT' : TIER_NAME[tierOf(it.p)]; d.appendChild(rr);
    if(pc){ const of = document.createElement('b'); of.className = 'sa-off'; of.textContent = '-' + pc + '%'; d.appendChild(of); }
    const ow = document.createElement('em'); ow.className = 'sa-own'; d.appendChild(ow);
    const pick = () => { shopSt.sel = it.id; shopSnd('shop_pick'); shopMark(); renderDet(); const have = it.cat === 'canje' ? held(it.cur) : save.bp, cu = it.cat === 'canje' ? CJ_NAME[it.cur] : 'PB'; if(have < shopPrice(it)) shopSay('sorry', `Te faltan ${shopPrice(it) - have} ${cu} para esto.`); };
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
  tags.innerHTML = it.cat === 'canje' ? `<span>Canje</span><span>${it.cur === 'chapa' ? 'Chapas Doradas' : 'Chapas Plateadas'}</span>` : it.cat === 'mt' ? `<span>MT</span><span class="ty" style="background:${TC[MOVES[it.mv].t]}">${TYPE_ES[MOVES[it.mv].t]}</span><span>${SLOT_SHORT[MOVES[it.mv].s]}</span>` :
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
  if(shopPct(it)){ const dl = document.createElement('p'); dl.className = 'sa-deal'; dl.innerHTML = `⚡ Oferta del día <b>-${shopPct(it)}%</b> · antes ${it.p} PB`; box.appendChild(dl); }
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
    if(k){ shopSnd(it.cat === 'canje' ? 'shop_canje' : shopPct(it) ? 'shop_deal' : 'shop_buy'); shopSay(it.cat === 'canje' ? 'ok' : shopPct(it) ? 'joy' : 'ok', it.cat === 'canje' ? '¡Trato hecho! Gracias por las chapas.' : ''); toast(`${it.cat === 'canje' ? 'Canjeado' : 'Comprado'}: ${k > 1 ? k + ' × ' : ''}${it.n} (−${shopPrice(it) * k} ${it.cat === 'canje' ? CJ_NAME[it.cur] : 'PB'})`); shopSt.qty[it.id] = 1; refreshHud(); updateShop(); box.classList.add('bought'); setTimeout(() => box.classList.remove('bought'), 500); }
    else { shopSnd('shop_fail'); shopSay('sorry'); toast(buyError(it.id, n)); } };
  b.onclick = doBuy;
  box.append(q, b); updateShop();
}

// Actualiza saldos, «Tienes», cantidad y botón SIN volver a crear nada (así no se pierde la posición)
const shopQty = id => Math.max(1, shopSt.qty[id] || 1);
function updateShop(typing){
  if(!$('shBp')) return;
  $('shBp').textContent = save.bp; $('shTn').textContent = save.tickets; $('shTL').textContent = save.ticketsL; $('shCpn').textContent = held('chapaplata'); $('shCon').textContent = held('chapa');
  $('shopGrid').querySelectorAll('.sa-sl').forEach(d => {
    const n = ownOf(d.dataset.id), it = SHOP.find(x => x.id === d.dataset.id);
    d.querySelector('.sa-own').textContent = n > 0 ? '×' + n : ''; d.classList.toggle('poor', !!it && (it.cat === 'canje' ? held(it.cur) : save.bp) < shopPrice(it));
  });
  const it = SHOP.find(x => x.id === shopSt.sel), box = $('shDet'); if(!it || !box.querySelector('.qi')) return;
  const n = ownOf(it.id), eq = ITEMS[it.id] ? used(it.id) : 0, want = shopQty(it.id), tot = shopPrice(it) * want, max = maxBuy(it.id), ok = want <= max, unit = it.cat === 'canje' ? CJ_NAME[it.cur] : 'PB', have = it.cat === 'canje' ? held(it.cur) : save.bp;
  $('shOwn').innerHTML = ITEMS[it.id] ? `Tienes <b>${n}</b> · Equipados <b>${eq}</b>` : `Tienes <b>${n}</b>`;
  const qi = box.querySelector('.qi'); if(!typing && document.activeElement !== qi) qi.value = want;
  box.querySelector('.qm').disabled = want <= 1; box.querySelector('.qx').disabled = max < 1;
  const b = $('shBuy'); b.disabled = !ok;
  b.innerHTML = ok ? `${it.cat === 'canje' ? 'Canjear' : 'Comprar'} ${want > 1 ? '× ' + want + ' · ' : '· '}<b>${tot}</b> ${unit}` : `Te faltan <b>${tot - have}</b> ${unit}`;
}
