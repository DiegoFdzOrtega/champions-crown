"use strict";
/* =====================================================================
   10) POKÉDEX AVANZADA: pestañas por región, filtros, rejilla y panel de detalle
   ===================================================================== */
const dx = {region:'Todas', q:'', type:'', status:'all', rar:new Set(), sort:'num', sel:94, view:'normal', anim:'Idle', t0:0};
const own = d => save.box.includes(d);
const pad = d => String(d).padStart(4, '0');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const STAT_SHORT = {hp:'PS', atk:'Ataque', def:'Defensa', spa:'At.Esp.', spd:'Def.Esp.', spe:'Veloc.'};          // nombres cortos para que quepan en la ficha
const natureOf = d => NATURES[save.nat[d] ?? d % NATURES.length];

/* Dibuja el sprite de un Pokémon en un <canvas>, reintentando mientras carga la imagen.
   opts: {shiny, dark (silueta), fit (tamaño máximo), sc (escala), anim: true = animado}. */
function paintSprite(canvas, dex, opts = {}){
  let tries = 0;
  const w = canvas.width, h = canvas.height;
  const once = (t) => {
    const x = canvas.getContext('2d'); x.clearRect(0, 0, w, h);
    const ok = drawFrame(x, dex, 'Idle', t || 0, 0, w/2, h/2 + 2, opts.sc || 2, opts.fit || w - 8, opts.shiny);
    if(ok && opts.dark){ x.globalCompositeOperation = 'source-atop'; x.fillStyle = '#060a14'; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'source-over'; }
    return ok;
  };
  const tick = () => {
    if(once()) return;
    if(++tries < 24 && canvas.isConnected) setTimeout(tick, 250);
    else{                                                    // no hay sprite: círculo con un signo
      const x = canvas.getContext('2d'); x.clearRect(0, 0, w, h); x.fillStyle = opts.dark ? '#060a14' : '#2c3550';
      x.beginPath(); x.arc(w/2, h/2, w*.3, 0, 7); x.fill();
    }
  };
  tick();
}

// ---- Filtros y orden ----
function dexList(){
  const R = dx.region === 'Todas' ? [1, DEX_TOTAL] : REGION_DEX[dx.region];
  const q = dx.q.trim().toLowerCase().replace(/^#/, ''), num = /^\d+$/.test(q);
  let l = DEX.filter(m =>
    m.dex >= R[0] && m.dex <= R[1] && !hidden(m.dex) &&
    (!q || (num ? String(m.dex).startsWith(String(+q)) : m.name.toLowerCase().includes(q))) &&
    (!dx.type || m.types.includes(dx.type)) &&
    (dx.status === 'all' || (dx.status === 'have' ? own(m.dex) : dx.status === 'miss' ? !own(m.dex) :
      dx.status === 'shiny' ? save.shiny.includes(m.dex) : save.fav.includes(m.dex))) &&
    (!dx.rar.size || dx.rar.has(m.rar)));
  const num_ = (a, b) => a.dex - b.dex;
  if(dx.sort === 'name') l.sort((a, b) => a.name.localeCompare(b.name));
  else if(dx.sort === 'rar') l.sort((a, b) => RAR[a.rar].rank - RAR[b.rar].rank || num_(a, b));
  else if(dx.sort === 'recent') l.sort((a, b) => save.box.indexOf(b.dex) - save.box.indexOf(a.dex) || num_(a, b));   // los que no tienes quedan al final
  else if(dx.sort === 'used') l.sort((a, b) => (save.used[b.dex] || 0) - (save.used[a.dex] || 0) || num_(a, b));
  else l.sort(num_);
  return l;
}

// ---- Estructura de la pantalla (se crea una sola vez) ----
function buildDexShell(){
  $('dexv').innerHTML = `<div class="dx">
    <header class="dxh"><button id="dxBack">← Menú</button><h1>Pokédex</h1><div id="dxTotal" class="dxprog"></div></header>
    <div class="dxc">
      <section class="dxl">
        <div id="dxTabs" class="tabs"></div>
        <div class="tool"><input id="dxQ" placeholder="Buscar por nombre o nº" autocomplete="off"><select id="dxType" title="Tipo"></select><select id="dxStatus" title="Mostrar"></select><select id="dxSort" title="Orden"></select></div>
        <div class="tool2"><div class="pills" id="dxRar"></div><span id="dxCount"></span></div>
        <div id="dxGrid" class="dgrid"></div>
      </section>
      <aside id="dxDet" class="ddet"></aside>
    </div></div>`;
  $('dxBack').onclick = goMain;
  $('dxQ').oninput = e => { dx.q = e.target.value; renderGrid(); };
  $('dxType').innerHTML = '<option value="">Tipo: todos</option>' + Object.keys(TYPE_ES).map(t => `<option value="${t}">${TYPE_ES[t]}</option>`).join('');
  $('dxType').onchange = e => { dx.type = e.target.value; renderGrid(); };
  const opts = (id, items, set) => { $(id).innerHTML = items.map(([k, label]) => `<option value="${k}">${label}</option>`).join(''); $(id).onchange = e => { set(e.target.value); renderGrid(); }; };
  opts('dxStatus', [['all','Ver: todos'],['have','Ver: los que tengo'],['miss','Ver: los que me faltan'],['shiny','Ver: shiny'],['fav','Ver: favoritos']], k => dx.status = k);
  opts('dxSort', [['num','Orden: Nº'],['name','Orden: nombre'],['rar','Orden: rareza'],['recent','Orden: recientes'],['used','Orden: más usados']], k => dx.sort = k);
  $('dxRar').innerHTML = RARITIES.map(r => `<button class="pill" data-k="${r.id}">${r.ic} ${r.n}</button>`).join('');
  $('dxRar').onclick = e => { const b = e.target.closest('.pill'); if(b){ const k = b.dataset.k; dx.rar.has(k) ? dx.rar.delete(k) : dx.rar.add(k); renderPills(); renderGrid(); } };
  $('dxGrid').onclick = e => { const c = e.target.closest('.dcard'); if(c){ dx.sel = +c.dataset.d; dx.view = 'normal'; dx.anim = 'Idle'; markSel(); renderDetail(); } };
  $('dxDet').onclick = e => {
    const b = e.target.closest('[data-act]'); if(!b) return;
    if(b.dataset.act === 'view'){ dx.view = b.dataset.v; renderDetail(); }
    if(b.dataset.act === 'anim'){ dx.anim = b.dataset.v; dx.t0 = performance.now(); renderDetail(); }
    if(b.dataset.act === 'gacha') openGacha();
    if(b.dataset.act === 'tab'){ dx.tab = b.dataset.v; renderDetail(); }
    if(b.dataset.act === 'go'){ dx.sel = +b.dataset.v; dx.view = 'normal'; dx.anim = 'Idle'; markSel(); renderDetail(); const c = $('dxGrid').querySelector(`.dcard[data-d="${dx.sel}"]`); if(c) c.scrollIntoView({block:'nearest', behavior:'smooth'}); }
    if(b.dataset.act === 'fav'){ const i = save.fav.indexOf(dx.sel); if(i < 0) save.fav.push(dx.sel); else save.fav.splice(i, 1); persist(); renderGrid(); renderDetail(); }
  };
  dx.io = new IntersectionObserver(es => es.forEach(en => { if(en.isIntersecting){ dx.io.unobserve(en.target); paintCard(en.target); } }), {root: $('dxGrid'), rootMargin: '300px'});
  dx.built = true;
}
function paintCard(card){
  const d = +card.dataset.d, o = own(d);
  paintSprite(card.querySelector('canvas'), d, {sc:2, fit:56, shiny: o && save.shiny.includes(d), dark: !o});
}

// ---- Ayudantes visuales ----
const LIGHT_T = new Set(['electrico', 'tierra', 'hielo', 'acero', 'normal', 'hada', 'roca', 'bicho', 'planta', 'volador']);   // tipos de color claro: llevan letra oscura para que se lean
const tb = t => `<span class="tb${LIGHT_T.has(t) ? ' lt' : ''}" style="background:${TC[t]}">${TYPE_ES[t]}</span>`;
const pct = (a, b) => b ? Math.round(a / b * 1000) / 10 : 0;

// Cadena evolutiva (js/evos.js): devuelve las etapas [[base], [fase 1...], [fase 2...]] sin los Pokémon ocultos
function evoChain(d){
  if(typeof EVO_PREV === 'undefined') return [];
  let root = d; while(EVO_PREV[root]) root = EVO_PREV[root];
  const kids = p => Object.keys(EVO_PREV).filter(k => EVO_PREV[k] === p).map(Number).filter(k => k <= DEX_TOTAL && !hidden(k));
  const stages = []; let cur = [root];
  while(cur.length){ stages.push(cur); cur = cur.flatMap(kids); }
  return stages.length > 1 ? stages : [];
}
// Descripción de la ficha: la de LORE (data.js) si existe; si no, una hecha con sus datos
function loreOf(m){
  if(LORE[m.dex]) return LORE[m.dex];
  const ty = m.types.map(t => TYPE_ES[t]).join(' y ');
  const best = STAT_KEYS.reduce((a, k) => m.base[k] > m.base[a] ? k : a, 'hp');
  const prev = typeof EVO_PREV !== 'undefined' && EVO_PREV[m.dex] && mon(EVO_PREV[m.dex]);
  const kids = typeof EVO_PREV !== 'undefined' ? Object.keys(EVO_PREV).filter(k => EVO_PREV[k] === m.dex && +k <= DEX_TOTAL).map(k => mon(+k).name) : [];
  return `Pokémon de tipo ${ty} originario de ${regionOf(m.dex)}.` +
    (prev ? ` Evoluciona de ${prev.name}.` : '') +
    (kids.length ? ` Puede evolucionar a ${kids.slice(0, 3).join(', ')}${kids.length > 3 ? ' y más' : ''}.` : '') +
    ` Destaca por ${{hp:'sus PS', atk:'su Ataque', def:'su Defensa', spa:'su Ataque Especial', spd:'su Defensa Especial', spe:'su Velocidad'}[best]} (${m.base[best]}).`;
}

// ---- Partes que cambian ----
function renderPills(){
  [...$('dxRar').children].forEach(b => { b.classList.toggle('on', dx.rar.has(b.dataset.k)); b.style.setProperty('--c', RAR[b.dataset.k].col); });
  $('dxStatus').value = dx.status; $('dxSort').value = dx.sort;
}
function renderTabs(){
  const tabs = [['Todas', 1, DEX_TOTAL], ...REGIONS_DEX.map(r => [r.n, r.a, r.b])];
  $('dxTabs').innerHTML = tabs.map(([n, a, b]) => {
    const have = save.box.filter(d => d >= a && d <= b && !hidden(d)).length, tot = regionSize(a, b);
    return `<button class="tab${dx.region === n ? ' on' : ''}${have >= tot ? ' full' : ''}" data-r="${n}" style="--p:${pct(have, tot)}%">${n} <small>${have}/${tot}</small></button>`;
  }).join('');
  $('dxTabs').onclick = e => { const b = e.target.closest('.tab'); if(b){ dx.region = b.dataset.r; renderTabs(); renderGrid(); } };
}
function renderTotal(){
  const have = boxCount(), sh = save.shiny.filter(d => !hidden(d)).length, p = pct(have, DEX_SHOWN);
  $('dxTotal').innerHTML = `<span class="dxpN"><b>${have}</b> / ${DEX_SHOWN}<em>${p}%</em></span><span class="dxpBar"><i style="width:${p}%"></i></span><span class="dxpS">⭐ ${sh} shiny</span>`;
}
function renderGrid(){
  const l = dexList();
  $('dxCount').textContent = `${l.length} Pokémon`;
  renderTotal();
  dx.io.disconnect();
  const g = $('dxGrid');
  g.innerHTML = l.map(m => {
    const o = own(m.dex), r = RAR[m.rar], t1 = TC[m.types[0]], t2 = TC[m.types[1] || m.types[0]];
    return `<div class="dcard${o ? '' : ' no'}${m.dex === dx.sel ? ' sel' : ''}" data-d="${m.dex}" style="--c:${r.col};--t1:${t1};--t2:${t2}" title="${o ? esc(m.name) : '???'}">
      <i class="dn">${m.dex}</i><canvas width="64" height="64"></canvas><b>${o ? esc(m.name) : '???'}</b>
      ${save.fav.includes(m.dex) ? '<em class="fv">★</em>' : ''}${save.shiny.includes(m.dex) ? '<em class="sh">✦</em>' : ''}</div>`;
  }).join('') || '<p class="empty">Ningún Pokémon coincide con los filtros.</p>';
  g.querySelectorAll('.dcard').forEach(c => dx.io.observe(c));
}
function markSel(){ $('dxGrid').querySelectorAll('.dcard').forEach(c => c.classList.toggle('sel', +c.dataset.d === dx.sel)); }

// Debilidades y resistencias del Pokémon (tabla de tipos CH y eff() de data.js; si tiene 2 tipos se multiplican)
function weakRows(types){
  const g = {4:[], 2:[], .5:[], .25:[], 0:[]};
  Object.keys(CH).forEach(t => { const m = eff(t, types); if(g[m]) g[m].push(t); });
  const rows = [[4, '×4', 'Muy débil', 'w4'], [2, '×2', 'Débil', 'w2'], [.5, '×½', 'Resiste', 'r'], [.25, '×¼', 'Resiste mucho', 'r'], [0, '×0', 'Inmune', 'i']];
  return rows.filter(([k]) => g[k].length).map(([k, x, lab, cl]) =>
    `<div class="wk ${cl}"><span class="wx">${x}</span><span class="wl">${lab}</span><span class="wt">${g[k].map(tb).join('')}</span></div>`).join('');
}
const DX_ANIMS = [['Idle', 'Reposo'], ['Attack', 'Ataque'], ['Hurt', 'Herido']];
const DX_TABS = [['stats', 'Datos'], ['weak', 'Combate'], ['moves', 'Ataques']];
function renderDetail(){
  const m = mon(dx.sel), o = own(m.dex), r = RAR[m.rar], nat = natureOf(m.dex), shiny = dx.view === 'shiny', fav = save.fav.includes(m.dex);
  const t1 = TC[m.types[0]], t2 = TC[m.types[1] || m.types[0]];
  const stats = STAT_KEYS.map(k => {
    const v = m.base[k], tag = !o ? '' : nat[1] === k ? '<u class="up">▲</u>' : nat[2] === k ? '<u class="dn2">▼</u>' : '<u></u>';
    const col = v < 50 ? '#e8493a' : v < 80 ? '#f0903a' : v < 100 ? '#e8c33a' : v < 130 ? '#4ccf6a' : '#3ea6ff';
    return `<div class="st"><span title="${STAT_NAMES[k]}">${STAT_SHORT[k]}</span><b>${o ? v : '?'}</b><div class="bar"><i style="width:${o ? Math.min(100, v / 1.8) : 0}%;background:${col}"></i></div>${tag}</div>`;
  }).join('');
  const total = STAT_KEYS.reduce((a, k) => a + m.base[k], 0);
  const mv = o ? movesOf(m.dex) : m.mv;
  const moves = [1, 2, 3, 4].map(s => { const n = mv[s - 1], t = (MOVES[n] || {}).t || m.types[0];
    return o ? `<div class="mvrow" style="--t:${TC[t]}"><span class="sl">${SLOT_SHORT[s]}</span><b>${esc(n)}</b>${tb(t)}</div>`
             : `<div class="mvrow"><span class="sl">${SLOT_SHORT[s]}</span><b>???</b></div>`; }).join('');
  const chain = evoChain(m.dex);
  const evo = chain.length ? `<div class="dxevo${chain.some(st => st.length > 3) ? ' wide' : ''}">${chain.map(st => `<div class="evs${st.length > 3 ? ' many' : ''}">${st.map(d => { const ow = own(d);
      return `<button class="evm${d === m.dex ? ' on' : ''}${ow ? '' : ' no'}" data-act="go" data-v="${d}" title="${ow ? esc(mon(d).name) : '???'}"><canvas width="56" height="56" data-evo="${d}"></canvas><small>${ow ? esc(mon(d).name) : '???'}</small></button>`; }).join('')}</div>`).join('<i class="evar">›</i>')}</div>` : '';
  const tab = o ? dx.tab || 'stats' : 'stats';
  const body = !o ? `<div class="dxlock"><p>Aún no tienes este Pokémon.</p><button class="gob" data-act="gacha">Consíguelo en el Gachapon →</button></div>`
    : tab === 'weak' ? `<div class="dxw">${weakRows(m.types)}</div>`
    : tab === 'moves' ? `<div class="dxmv">${moves}</div>`
    : `<div class="stats">${stats}<div class="sttot"><span>Total</span><b>${total}</b></div></div>
       <div class="dinfo"><p><span>Naturaleza</span> ${nat[0]}${nat[1] ? ` <small>▲ ${STAT_NAMES[nat[1]]} · ▼ ${STAT_NAMES[nat[2]]}</small>` : ' <small>(neutra)</small>'}</p>
         <p><span>Habilidad</span> <em class="soft">${esc(abilityOf(m.dex))}</em></p></div>
       <p class="lore">${esc(loreOf(m))}</p>`;
  $('dxDet').style.setProperty('--c', r.col); $('dxDet').style.setProperty('--t1', t1); $('dxDet').style.setProperty('--t2', t2);
  $('dxDet').classList.toggle('locked', !o);
  $('dxDet').innerHTML = `
    <div class="dhero">
      <div class="dhtop"><span class="meta">Nº ${pad(m.dex)} · ${regionOf(m.dex)}</span>
        ${o ? `<button class="favi${fav ? ' on' : ''}" data-act="fav" title="${fav ? 'Quitar de favoritos' : 'Marcar como favorito'}">${fav ? '★' : '☆'}</button>` : ''}</div>
      <div class="viewer${shiny && o ? ' shiny' : ''}"><canvas id="dxSpr" width="144" height="144"></canvas>${shiny && o ? '<s></s><s></s><s></s><s></s><s></s><s></s>' : ''}</div>
      <h2>${o ? esc(m.name) : '???'}</h2>
      <div class="badges"><span class="rb" style="--c:${r.col}">${r.ic} ${r.n}</span>${o ? m.types.map(tb).join('') : '<span class="tb unk">???</span>'}</div>
      ${o ? `<div class="dctl"><div class="seg"><button data-act="view" data-v="normal" class="${shiny ? '' : 'on'}">Normal</button><button data-act="view" data-v="shiny" class="${shiny ? 'on' : ''}">✦ Shiny${save.shiny.includes(m.dex) ? '' : ' <small>(previa)</small>'}</button></div>
        <div class="seg">${DX_ANIMS.map(([k, n]) => `<button data-act="anim" data-v="${k}" class="${dx.anim === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>` : ''}
    </div>
    ${evo ? `<h3>Evolución</h3>${evo}` : ''}
    ${o ? `<div class="dtabs">${DX_TABS.map(([k, n]) => `<button data-act="tab" data-v="${k}" class="${tab === k ? 'on' : ''}">${n}</button>`).join('')}</div>` : ''}
    <div class="dbody">${body}</div>`;
  dx.t0 = performance.now();
  dx.spr = $('dxSpr'); dx.sprO = o; dx.sprShiny = shiny && o;
  paintSprite(dx.spr, m.dex, {sc:3, fit:128, shiny: shiny && o, dark: !o});
  $('dxDet').querySelectorAll('canvas[data-evo]').forEach(c => { const d = +c.dataset.evo; paintSprite(c, d, {sc:2, fit:52, dark: !own(d)}); });
}
// El sprite grande se anima (solo cuando la pantalla se ve)
setInterval(() => {
  if(typeof $ !== 'function' || !$('dexv') || $('dexv').classList.contains('hide') || !dx.spr || !dx.spr.isConnected || !dx.sprO) return;
  const x = dx.spr.getContext('2d'), t = (performance.now() - dx.t0) / 1000;
  const idle = sheet(dx.sel, 'Idle', dx.sprShiny), I = idle && idle.ok && idle.info;       // la escala sale de la hoja de Reposo: así el Pokémon no se encoge en Ataque/Herido (sus fotogramas son más grandes)
  const sc = I ? Math.min(3, 128 / Math.max(I.fw, I.fh)) : 3;
  x.clearRect(0, 0, 144, 144); drawFrame(x, dx.sel, dx.anim, t, 0, 72, 74, sc, 0, dx.sprShiny);
}, 120);

function openDex(){
  if(!dx.built) buildDexShell();
  if(!own(dx.sel)) dx.sel = save.box[save.box.length - 1] || 94;
  $('dxQ').value = dx.q; $('dxType').value = dx.type;
  renderTabs(); renderPills(); renderGrid(); renderDetail(); show('dexv');
}
