"use strict";
/* =====================================================================
   10) POKÉDEX AVANZADA: pestañas por región, filtros, rejilla y panel de detalle
   ===================================================================== */
const dx = {region:'Todas', q:'', type:'', status:'all', rar:new Set(), sort:'num', sel:94, view:'normal', t0:0};
const own = d => save.box.includes(d);
const pad = d => String(d).padStart(4, '0');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
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
    m.dex >= R[0] && m.dex <= R[1] &&
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
    <header class="dxh"><button id="dxBack">← Menú</button><h1>Pokédex</h1><span id="dxTotal"></span></header>
    <div class="dxc">
      <section class="dxl">
        <div id="dxTabs" class="tabs"></div>
        <div class="tool"><input id="dxQ" placeholder="Buscar por nombre o nº" autocomplete="off"><select id="dxType"></select><span id="dxCount"></span></div>
        <div class="pills" id="dxStatus"></div>
        <div class="pills" id="dxRar"></div>
        <div class="pills" id="dxSort"></div>
        <div id="dxGrid" class="dgrid"></div>
      </section>
      <aside id="dxDet" class="ddet"></aside>
    </div></div>`;
  $('dxBack').onclick = goMain;
  $('dxQ').oninput = e => { dx.q = e.target.value; renderGrid(); };
  $('dxType').innerHTML = '<option value="">Todos los tipos</option>' + Object.keys(TYPE_ES).map(t => `<option value="${t}">${TYPE_ES[t]}</option>`).join('');
  $('dxType').onchange = e => { dx.type = e.target.value; renderGrid(); };
  const pills = (id, items, get, set) => {
    $(id).innerHTML = items.map(([k, label]) => `<button class="pill" data-k="${k}">${label}</button>`).join('');
    $(id).onclick = e => { const b = e.target.closest('.pill'); if(b){ set(b.dataset.k); renderPills(); renderGrid(); } };
  };
  pills('dxStatus', [['all','Todos'],['have','Tengo'],['miss','Me faltan'],['shiny','⭐ Shiny'],['fav','★ Favoritos']], 0, k => dx.status = k);
  pills('dxRar', RARITIES.map(r => [r.id, `${r.ic} ${r.n}`]), 0, k => dx.rar.has(k) ? dx.rar.delete(k) : dx.rar.add(k));
  pills('dxSort', [['num','Nº'],['name','Nombre'],['rar','Rareza'],['recent','Recién conseguidos'],['used','Más usados']], 0, k => dx.sort = k);
  $('dxGrid').onclick = e => { const c = e.target.closest('.dcard'); if(c){ dx.sel = +c.dataset.d; dx.view = 'normal'; markSel(); renderDetail(); } };
  $('dxDet').onclick = e => {
    const b = e.target.closest('[data-act]'); if(!b) return;
    if(b.dataset.act === 'view'){ dx.view = b.dataset.v; renderDetail(); }
    if(b.dataset.act === 'fav'){ const i = save.fav.indexOf(dx.sel); if(i < 0) save.fav.push(dx.sel); else save.fav.splice(i, 1); persist(); renderGrid(); renderDetail(); }
  };
  dx.io = new IntersectionObserver(es => es.forEach(en => { if(en.isIntersecting){ dx.io.unobserve(en.target); paintCard(en.target); } }), {root: $('dxGrid'), rootMargin: '300px'});
  dx.built = true;
}
function paintCard(card){
  const d = +card.dataset.d, o = own(d);
  paintSprite(card.querySelector('canvas'), d, {sc:2, fit:56, shiny: o && save.shiny.includes(d), dark: !o});
}

// ---- Partes que cambian ----
function renderPills(){
  const on = (id, f) => [...$(id).children].forEach(b => b.classList.toggle('on', f(b.dataset.k)));
  on('dxStatus', k => k === dx.status); on('dxRar', k => dx.rar.has(k)); on('dxSort', k => k === dx.sort);
  [...$('dxRar').children].forEach(b => b.style.setProperty('--c', RAR[b.dataset.k].col));
}
function renderTabs(){
  const tabs = [['Todas', 1, DEX_TOTAL], ...REGIONS_DEX.map(r => [r.n, r.a, r.b])];
  $('dxTabs').innerHTML = tabs.map(([n, a, b]) => {
    const have = save.box.filter(d => d >= a && d <= b).length;
    return `<button class="tab${dx.region === n ? ' on' : ''}" data-r="${n}">${n} <small>${have}/${b - a + 1}</small></button>`;
  }).join('');
  $('dxTabs').onclick = e => { const b = e.target.closest('.tab'); if(b){ dx.region = b.dataset.r; renderTabs(); renderGrid(); } };
}
function renderGrid(){
  const l = dexList();
  $('dxCount').textContent = `${l.length} Pokémon`;
  $('dxTotal').textContent = `Tienes ${save.box.length} de ${DEX_TOTAL} · ${save.shiny.length} shiny`;
  dx.io.disconnect();
  const g = $('dxGrid');
  g.innerHTML = l.map(m => {
    const o = own(m.dex), r = RAR[m.rar];
    return `<div class="dcard${o ? '' : ' no'}${m.dex === dx.sel ? ' sel' : ''}" data-d="${m.dex}" style="--c:${r.col}">
      <i class="dn">#${pad(m.dex)}</i><canvas width="64" height="64"></canvas><b>${o ? esc(m.name) : '???'}</b>
      ${o ? '<span class="ball"></span>' : ''}${save.fav.includes(m.dex) ? '<em class="fv">★</em>' : ''}${save.shiny.includes(m.dex) ? '<em class="sh">⭐</em>' : ''}</div>`;
  }).join('') || '<p class="empty">Ningún Pokémon coincide con los filtros.</p>';
  g.querySelectorAll('.dcard').forEach(c => dx.io.observe(c));
}
function markSel(){ $('dxGrid').querySelectorAll('.dcard').forEach(c => c.classList.toggle('sel', +c.dataset.d === dx.sel)); }

function renderDetail(){
  const m = mon(dx.sel), o = own(m.dex), r = RAR[m.rar], nat = natureOf(m.dex), shiny = dx.view === 'shiny';
  const stats = ['hp', 'atk', 'spa', 'def', 'spd', 'spe'].map(k => {
    const v = m.base[k], tag = !o ? '' : nat[1] === k ? '<u class="up">▲ +10%</u>' : nat[2] === k ? '<u class="dn2">▼ −10%</u>' : '';
    const col = v < 50 ? '#e8493a' : v < 80 ? '#f0903a' : v < 100 ? '#e8c33a' : v < 130 ? '#4ccf6a' : '#3ea6ff';
    return `<div class="st"><span>${STAT_NAMES[k]}</span><div class="bar"><i style="width:${o ? Math.min(100, v / 1.8) : 0}%;background:${col}"></i></div><b>${o ? v : '???'}</b>${tag}</div>`;
  }).join('');
  const total = STAT_KEYS.reduce((a, k) => a + m.base[k], 0);
  const mv = o ? movesOf(m.dex) : m.mv;                                                  // los que tiene tu Pokémon ahora (con MT incluidos)
  const moves = [1, 2, 3, 4].map(s => { const n = mv[s - 1], t = (MOVES[n] || {}).t || m.types[0];
    return o ? `<div class="mvrow"><span class="sl">${SLOT_SHORT[s]}</span><b>${esc(n)}</b><span class="tb" style="background:${TC[t]}">${TYPE_ES[t]}</span></div>`
             : `<div class="mvrow"><span class="sl">${SLOT_SHORT[s]}</span><b>???</b></div>`; }).join('');
  $('dxDet').style.setProperty('--c', r.col);
  $('dxDet').innerHTML = `
    <div class="viewer${shiny && o ? ' shiny' : ''}"><canvas id="dxSpr" width="224" height="224"></canvas>${shiny && o ? '<s></s><s></s><s></s><s></s><s></s><s></s>' : ''}</div>
    <div class="vbtn"><button data-act="view" data-v="normal" class="pill${shiny ? '' : ' on'}">Normal</button>
      <button data-act="view" data-v="shiny" class="pill${shiny ? ' on' : ''}" ${o ? '' : 'disabled'}>⭐ Shiny${o && !save.shiny.includes(m.dex) ? ' (vista previa)' : ''}</button></div>
    <p class="meta">#${pad(m.dex)} · ${regionOf(m.dex)}</p>
    <h2>${o ? esc(m.name) : '???'}</h2>
    <button class="favb${save.fav.includes(m.dex) ? ' on' : ''}" data-act="fav" ${o ? '' : 'disabled'}>${save.fav.includes(m.dex) ? '★ En favoritos' : '⭐ Marcar como favorito'}</button>
    <div class="badges"><span class="rb" style="--c:${r.col}">${r.ic} ${r.n}</span>${o ? m.types.map(t => `<span class="tb" style="background:${TC[t]}">${TYPE_ES[t]}</span>`).join('') : '<span class="tb unk">???</span>'}</div>
    <h3>Estadísticas base ${o ? `<small class="dxtot">Total ${total}</small>` : ''}</h3><div class="stats">${stats}</div>
    <h3>Ataques</h3><div class="dxmv">${moves}</div>
    <div class="dinfo"><p><span>Naturaleza</span> ${o ? `${nat[0]}${nat[1] ? ` <small>(▲ ${STAT_NAMES[nat[1]]} · ▼ ${STAT_NAMES[nat[2]]})</small>` : ' <small>(neutra)</small>'}` : '???'}</p>
      <p><span>Habilidad</span> ${o ? `<em class="soft">${esc(abilityOf(m.dex))}</em>` : '???'}</p>
      <p class="lore">${o ? esc(LORE[m.dex] || 'Sin descripción todavía. Puedes añadirla en LORE (data.js).') : 'Consíguelo en el Gachapon para ver sus datos.'}</p></div>`;
  dx.t0 = performance.now();
  dx.spr = $('dxSpr'); dx.sprO = o; dx.sprShiny = shiny && o;
  paintSprite(dx.spr, m.dex, {sc:5, fit:200, shiny: shiny && o, dark: !o});
}
// El sprite grande se anima (solo cuando la pantalla se ve)
setInterval(() => {
  if($('dexv').classList.contains('hide') || !dx.spr || !dx.spr.isConnected || !dx.sprO) return;
  const x = dx.spr.getContext('2d'), t = (performance.now() - dx.t0) / 1000;
  x.clearRect(0, 0, 224, 224); drawFrame(x, dx.sel, 'Idle', t, 0, 112, 114, 5, 200, dx.sprShiny);
}, 120);

function openDex(){
  if(!dx.built) buildDexShell();
  if(!own(dx.sel)) dx.sel = save.box[save.box.length - 1] || 94;
  $('dxQ').value = dx.q; $('dxType').value = dx.type;
  renderTabs(); renderPills(); renderGrid(); renderDetail(); show('dexv');
}
