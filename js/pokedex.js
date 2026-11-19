"use strict";
/* =====================================================================
   10) POKÉDEX (rediseño): cabecera estilo Pokédex, filtros, rejilla y ficha de detalle.
   - Botón «Solo evolución final»: enseña solo los Pokémon que ya no evolucionan más.
   - En la ficha: cadena evolutiva con la etiqueta FINAL y un botón para saltar a la evolución final.
   - ◀ ▶ (o las flechas del teclado) pasan al Pokémon anterior / siguiente de la lista.
   - En pantallas estrechas (móvil) la ficha se abre encima de la rejilla y se cierra con ✕.
   Estilos: css/pokedex.css (todas las clases empiezan por pdx-).
   ===================================================================== */
const dx = {region:'Todas', q:'', type:'', status:'all', rar:new Set(), sort:'num', sel:94, view:'normal', anim:'Idle', t0:0, fin:false, tab:'stats'};
const own = d => save.box.includes(d);
const pad = d => String(d).padStart(4, '0');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const STAT_SHORT = {hp:'PS', atk:'Ataque', def:'Defensa', spa:'At. Esp.', spd:'Def. Esp.', spe:'Velocidad'};
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

// ---- Evoluciones (js/evos.js) ----
let EVO_KIDS = null;                                       // EVO_KIDS[nº] = Pokémon a los que evoluciona (sin los ocultos)
function evoKids(d){
  if(!EVO_KIDS){
    EVO_KIDS = {};
    if(typeof EVO_PREV !== 'undefined') Object.keys(EVO_PREV).forEach(k => { const c = +k, p = EVO_PREV[k]; if(c <= DEX_TOTAL && !hidden(c)) (EVO_KIDS[p] = EVO_KIDS[p] || []).push(c); });
  }
  return EVO_KIDS[d] || [];
}
const isFinal = d => !evoKids(d).length;                   // ya no evoluciona más (incluye a los que no evolucionan nunca)
const evoFinals = d => isFinal(d) ? [d] : evoKids(d).flatMap(evoFinals);
// Cadena evolutiva: devuelve las etapas [[base], [fase 1...], [fase 2...]]
function evoChain(d){
  if(typeof EVO_PREV === 'undefined') return [];
  let root = d; while(EVO_PREV[root]) root = EVO_PREV[root];
  const stages = []; let cur = [root];
  while(cur.length){ stages.push(cur); cur = cur.flatMap(evoKids); }
  return stages.length > 1 ? stages : [];
}

// ---- Filtros y orden ----
function dexList(){
  const R = dx.region === 'Todas' ? [1, DEX_TOTAL] : REGION_DEX[dx.region];
  const q = dx.q.trim().toLowerCase().replace(/^#/, ''), num = /^\d+$/.test(q);
  let l = DEX.filter(m =>
    m.dex >= R[0] && m.dex <= R[1] && !hidden(m.dex) &&
    (!q || (num ? String(m.dex).startsWith(String(+q)) : m.name.toLowerCase().includes(q))) &&
    (!dx.type || m.types.includes(dx.type)) &&
    (!dx.fin || isFinal(m.dex)) &&
    (dx.status === 'all' || (dx.status === 'have' ? own(m.dex) : dx.status === 'miss' ? !own(m.dex) :
      dx.status === 'shiny' ? save.shiny.includes(m.dex) : save.fav.includes(m.dex))) &&
    (!dx.rar.size || dx.rar.has(m.rar)));
  const num_ = (a, b) => a.dex - b.dex;
  if(dx.sort === 'name') l.sort((a, b) => a.name.localeCompare(b.name));
  else if(dx.sort === 'rar') l.sort((a, b) => RAR[a.rar].rank - RAR[b.rar].rank || num_(a, b));
  else if(dx.sort === 'recent') l.sort((a, b) => save.box.indexOf(b.dex) - save.box.indexOf(a.dex) || num_(a, b));   // los que no tienes quedan al final
  else if(dx.sort === 'used') l.sort((a, b) => (save.used[b.dex] || 0) - (save.used[a.dex] || 0) || num_(a, b));
  else if(dx.sort === 'total') l.sort((a, b) => STAT_KEYS.reduce((s, k) => s + b.base[k], 0) - STAT_KEYS.reduce((s, k) => s + a.base[k], 0) || num_(a, b));
  else l.sort(num_);
  return l;
}

// ---- Ayudantes visuales ----
const LIGHT_T = new Set(['electrico', 'tierra', 'hielo', 'acero', 'normal', 'hada', 'roca', 'bicho', 'planta', 'volador']);   // tipos de color claro: llevan letra oscura
const tIcon = (t, c) => `<img class="${c || 'pdx-ti'}" src="assets/iconos/tipos/${t}.png" alt="" loading="lazy">`;          // icono redondo del tipo (assets/iconos/tipos)
const tb = t => `<span class="pdx-tb${LIGHT_T.has(t) ? ' lt' : ''}" style="background:${TC[t]}">${tIcon(t)}${TYPE_ES[t]}</span>`;
const pct = (a, b) => b ? Math.round(a / b * 1000) / 10 : 0;
// Descripción de la ficha: la de LORE (data.js) si existe; si no, una hecha con sus datos
function loreOf(m){
  if(LORE[m.dex]) return LORE[m.dex];
  const ty = m.types.map(t => TYPE_ES[t]).join(' y ');
  const best = STAT_KEYS.reduce((a, k) => m.base[k] > m.base[a] ? k : a, 'hp');
  const prev = typeof EVO_PREV !== 'undefined' && EVO_PREV[m.dex] && mon(EVO_PREV[m.dex]);
  const kids = evoKids(m.dex).map(k => mon(k).name);
  return `Pokémon de tipo ${ty} originario de ${regionOf(m.dex)}.` +
    (prev ? ` Evoluciona de ${prev.name}.` : '') +
    (kids.length ? ` Puede evolucionar a ${kids.slice(0, 3).join(', ')}${kids.length > 3 ? ' y más' : ''}.` : '') +
    ` Destaca por ${{hp:'sus PS', atk:'su Ataque', def:'su Defensa', spa:'su Ataque Especial', spd:'su Defensa Especial', spe:'su Velocidad'}[best]} (${m.base[best]}).`;
}
const pdxNarrow = () => window.matchMedia('(max-width: 900px)').matches;

// ---- Estructura de la pantalla (se crea una sola vez) ----
function buildDexShell(){
  $('dexv').innerHTML = `<div class="pdx">
    <header class="pdx-top">
      <div class="pdx-lens"><i></i></div><div class="pdx-leds"><i></i><i></i><i></i></div>
      <h1>Pokédex</h1>
      <div id="dxTotal" class="pdx-prog"></div>
      <button id="dxBack" class="pdx-back">◀ Menú</button>
    </header>
    <div class="pdx-main">
      <section class="pdx-list">
        <div id="dxTabs" class="pdx-regions"></div>
        <div class="pdx-tools">
          <label class="pdx-search"><input id="dxQ" placeholder="Buscar nombre o nº" autocomplete="off"></label>
          <select id="dxStatus" title="Mostrar"></select><select id="dxSort" title="Orden"></select>
          <button id="dxFin" class="pdx-fin" title="Solo los Pokémon que ya no evolucionan más">▲ Evolución final</button>
        </div>
        <div id="dxTypes" class="pdx-types"></div>
        <div class="pdx-tools2"><div class="pdx-rars" id="dxRar"></div><span id="dxCount" class="pdx-count"></span></div>
        <div id="dxGrid" class="pdx-grid"></div>
      </section>
      <aside id="dxDet" class="pdx-det"></aside>
    </div></div>`;
  $('dxBack').onclick = goMain;
  $('dxQ').oninput = e => { dx.q = e.target.value; renderGrid(); };
  const opts = (id, items, set) => { $(id).innerHTML = items.map(([k, label]) => `<option value="${k}">${label}</option>`).join(''); $(id).onchange = e => { set(e.target.value); renderGrid(); }; };
  opts('dxStatus', [['all','Todos'],['have','Los que tengo'],['miss','Me faltan'],['shiny','Shiny'],['fav','Favoritos']], k => dx.status = k);
  opts('dxSort', [['num','Orden: Nº'],['name','Orden: nombre'],['total','Orden: más fuertes'],['rar','Orden: rareza'],['recent','Orden: recientes'],['used','Orden: más usados']], k => dx.sort = k);
  $('dxFin').onclick = () => { dx.fin = !dx.fin; renderPills(); renderGrid(); };
  $('dxTypes').innerHTML = `<button class="pdx-ty" data-t="">Todos</button>` + Object.keys(TYPE_ES).map(t => `<button class="pdx-ty${LIGHT_T.has(t) ? ' lt' : ''}" data-t="${t}" style="--c:${TC[t]}">${tIcon(t)}${TYPE_ES[t]}</button>`).join('');
  $('dxTypes').onclick = e => { const b = e.target.closest('.pdx-ty'); if(b){ dx.type = dx.type === b.dataset.t ? '' : b.dataset.t; renderPills(); renderGrid(); } };
  $('dxRar').innerHTML = RARITIES.map(r => `<button class="pdx-rar" data-k="${r.id}" style="--c:${r.col}">${r.ic} ${r.n}</button>`).join('');
  $('dxRar').onclick = e => { const b = e.target.closest('.pdx-rar'); if(b){ const k = b.dataset.k; dx.rar.has(k) ? dx.rar.delete(k) : dx.rar.add(k); renderPills(); renderGrid(); } };
  $('dxGrid').onclick = e => { const c = e.target.closest('.pdx-card'); if(c) dexGo(+c.dataset.d, true); };
  $('dxDet').onclick = e => {
    const b = e.target.closest('[data-act]'); if(!b) return;
    const a = b.dataset.act;
    if(a === 'view'){ dx.view = b.dataset.v; renderDetail(); }
    if(a === 'anim'){ dx.anim = b.dataset.v; dx.t0 = performance.now(); renderDetail(); }
    if(a === 'gacha') openGacha();
    if(a === 'tab'){ dx.tab = b.dataset.v; renderDetail(); }
    if(a === 'go') dexGo(+b.dataset.v);
    if(a === 'final'){ const f = evoFinals(dx.sel); if(f.length) dexGo(f[0]); }
    if(a === 'step') dexStep(+b.dataset.v);
    if(a === 'close') $('dxDet').classList.remove('open');
    if(a === 'fav'){ const i = save.fav.indexOf(dx.sel); if(i < 0) save.fav.push(dx.sel); else save.fav.splice(i, 1); persist(); renderGrid(); renderDetail(); }
  };
  dx.io = new IntersectionObserver(es => es.forEach(en => { if(en.isIntersecting){ dx.io.unobserve(en.target); paintCard(en.target); } }), {root: $('dxGrid'), rootMargin: '300px'});
  document.addEventListener('keydown', e => {                // ← → para pasar de Pokémon (solo con la Pokédex abierta y sin escribir en el buscador)
    if($('dexv').classList.contains('hide') || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if(e.key === 'ArrowLeft' || e.key === 'ArrowRight'){ dexStep(e.key === 'ArrowLeft' ? -1 : 1); e.preventDefault(); }
    if(e.key === 'Escape' && $('dxDet').classList.contains('open')){ $('dxDet').classList.remove('open'); e.stopPropagation(); }
  });
  dx.built = true;
}
function paintCard(card){
  const d = +card.dataset.d, o = own(d);
  paintSprite(card.querySelector('canvas'), d, {sc:2, fit:60, shiny: o && save.shiny.includes(d), dark: !o});
}
function dexGo(d, fromGrid){
  dx.sel = d; dx.view = 'normal'; dx.anim = 'Idle'; markSel(); renderDetail();
  if(!fromGrid){ const c = $('dxGrid').querySelector(`.pdx-card[data-d="${d}"]`); if(c) c.scrollIntoView({block:'nearest', behavior:'smooth'}); }
  if(pdxNarrow()) $('dxDet').classList.add('open');
}
function dexStep(k){                                       // anterior / siguiente según la lista que se ve
  const l = dexList(); if(!l.length) return;
  const i = l.findIndex(m => m.dex === dx.sel), j = i < 0 ? 0 : (i + k + l.length) % l.length;
  dexGo(l[j].dex);
}

// ---- Partes que cambian ----
function renderPills(){
  [...$('dxRar').children].forEach(b => b.classList.toggle('on', dx.rar.has(b.dataset.k)));
  [...$('dxTypes').children].forEach(b => b.classList.toggle('on', dx.type === b.dataset.t));
  $('dxFin').classList.toggle('on', dx.fin);
  $('dxStatus').value = dx.status; $('dxSort').value = dx.sort;
}
function renderTabs(){
  const tabs = [['Todas', 1, DEX_TOTAL], ...REGIONS_DEX.map(r => [r.n, r.a, r.b])];
  $('dxTabs').innerHTML = tabs.map(([n, a, b]) => {
    const have = save.box.filter(d => d >= a && d <= b && !hidden(d)).length, tot = regionSize(a, b);
    return `<button class="pdx-reg${dx.region === n ? ' on' : ''}${have >= tot ? ' full' : ''}" data-r="${n}" style="--p:${pct(have, tot)}%"><b>${n}</b><small>${have}/${tot}</small><i></i></button>`;
  }).join('');
  $('dxTabs').onclick = e => { const b = e.target.closest('.pdx-reg'); if(b){ dx.region = b.dataset.r; renderTabs(); renderGrid(); } };
}
function renderTotal(){
  const have = boxCount(), sh = save.shiny.filter(d => !hidden(d)).length, p = pct(have, DEX_SHOWN);
  $('dxTotal').innerHTML = `<span class="pdx-pn"><b>${have}</b>/${DEX_SHOWN}</span><span class="pdx-pbar"><i style="width:${p}%"></i></span><span class="pdx-pp">${p}%</span><span class="pdx-ps"><i></i>${sh} shiny</span>`;
}
function renderGrid(){
  const l = dexList();
  $('dxCount').textContent = `${l.length} Pokémon`;
  renderTotal();
  dx.io.disconnect();
  const g = $('dxGrid');
  g.innerHTML = l.map(m => {
    const o = own(m.dex), r = RAR[m.rar], t1 = TC[m.types[0]], t2 = TC[m.types[1] || m.types[0]];
    return `<button class="pdx-card${o ? '' : ' no'}${m.dex === dx.sel ? ' sel' : ''}" data-d="${m.dex}" style="--r:${r.col};--t1:${t1};--t2:${t2}" title="${o ? esc(m.name) : '???'}">
      <span class="pdx-n">#${String(m.dex).padStart(3, '0')}</span><span class="pdx-gem" title="${r.n}"></span>
      <canvas width="64" height="64"></canvas>
      <b>${o ? esc(m.name) : '???'}</b>
      <span class="pdx-cti">${m.types.map(t => tIcon(t)).join('')}</span>
      <span class="pdx-tbar"><i></i><i></i></span>
      ${save.fav.includes(m.dex) ? '<em class="fv">★</em>' : ''}${o && save.shiny.includes(m.dex) ? '<em class="sh"></em>' : ''}</button>`;
  }).join('') || '<p class="pdx-empty">Ningún Pokémon coincide con los filtros.</p>';
  g.querySelectorAll('.pdx-card').forEach(c => dx.io.observe(c));
}
function markSel(){ $('dxGrid').querySelectorAll('.pdx-card').forEach(c => c.classList.toggle('sel', +c.dataset.d === dx.sel)); }

// Debilidades y resistencias (tabla de tipos CH y eff() de data.js; con 2 tipos se multiplican)
function weakRows(types){
  const g = {4:[], 2:[], .5:[], .25:[], 0:[]};
  Object.keys(CH).forEach(t => { const m = eff(t, types); if(g[m]) g[m].push(t); });
  const rows = [[4, '×4', 'Muy débil', 'w4'], [2, '×2', 'Débil', 'w2'], [.5, '×½', 'Resiste', 'r'], [.25, '×¼', 'Resiste mucho', 'r'], [0, '×0', 'Inmune', 'i']];
  return rows.filter(([k]) => g[k].length).map(([k, x, lab, cl]) =>
    `<div class="pdx-wk ${cl}"><span class="wx">${x}</span><span class="wl">${lab}</span><span class="wt">${g[k].map(tb).join('')}</span></div>`).join('');
}
const DX_ANIMS = [['Idle', 'Reposo'], ['Attack', 'Ataque'], ['Hurt', 'Herido']];
const DX_TABS = [['stats', 'Datos'], ['weak', 'Combate'], ['moves', 'Ataques']];
const statCol = v => v < 50 ? '#e8493a' : v < 80 ? '#f0903a' : v < 100 ? '#e8c33a' : v < 130 ? '#4ccf6a' : '#3ea6ff';
function renderDetail(){
  const m = mon(dx.sel), o = own(m.dex), r = RAR[m.rar], nat = natureOf(m.dex), shiny = dx.view === 'shiny', fav = save.fav.includes(m.dex);
  const t1 = TC[m.types[0]], t2 = TC[m.types[1] || m.types[0]];
  const total = STAT_KEYS.reduce((a, k) => a + m.base[k], 0);
  const stats = STAT_KEYS.map(k => {
    const v = m.base[k], tag = !o ? '' : nat[1] === k ? '<u class="up">▲</u>' : nat[2] === k ? '<u class="dn">▼</u>' : '<u></u>';
    return `<div class="pdx-st"><span title="${STAT_NAMES[k]}">${STAT_SHORT[k]}</span><b>${o ? v : '?'}</b><div class="bar"><i style="width:${o ? Math.min(100, v / 1.8) : 0}%;background:${statCol(v)}"></i></div>${tag}</div>`;
  }).join('');
  const mv = o ? movesOf(m.dex) : m.mv;
  const moves = [1, 2, 3, 4].map(s => { const n = mv[s - 1], t = (MOVES[n] || {}).t || m.types[0];
    return o ? `<div class="pdx-mv" style="--t:${TC[t]}"><span class="sl">${SLOT_SHORT[s]}</span><b>${esc(n)}</b>${tb(t)}</div>`
             : `<div class="pdx-mv"><span class="sl">${SLOT_SHORT[s]}</span><b>???</b></div>`; }).join('');
  // Cadena evolutiva con la etiqueta FINAL en las últimas fases
  const chain = evoChain(m.dex), finals = evoFinals(m.dex), canJump = finals.length && finals[0] !== m.dex;
  const evo = chain.length ? `<div class="pdx-evo${chain.some(st => st.length > 3) ? ' wide' : ''}">${chain.map(st => `<div class="pdx-evs${st.length > 3 ? ' many' : ''}">${st.map(d => { const ow = own(d);
      return `<button class="pdx-evm${d === m.dex ? ' on' : ''}${ow ? '' : ' no'}" data-act="go" data-v="${d}" title="${ow ? esc(mon(d).name) : '???'}"><canvas width="56" height="56" data-evo="${d}"></canvas><small>${ow ? esc(mon(d).name) : '???'}</small>${isFinal(d) ? '<em>FINAL</em>' : ''}</button>`; }).join('')}</div>`).join('<i class="pdx-evar">▶</i>')}</div>` : '';
  const tab = o ? dx.tab || 'stats' : 'stats';
  const hw = typeof hwOf === 'function' ? hwOf(m.dex) : null;
  const facts = o ? `<div class="pdx-facts">
      ${hw ? `<div><span>Altura</span><b>${fmtAltura(hw[0])}</b></div><div><span>Peso</span><b>${fmtPeso(hw[1])}</b></div>` : ''}
      <div><span>Total</span><b>${total}</b></div>
      <div class="wide"><span>Habilidad</span><b>${esc(abilityOf(m.dex))}</b></div></div>` : '';
  const body = !o ? `<div class="pdx-lock"><p>Aún no tienes este Pokémon.</p><button class="pdx-gob" data-act="gacha">Consíguelo en el Gachapon ▶</button></div>`
    : tab === 'weak' ? `<div class="pdx-weak">${weakRows(m.types)}</div>`
    : tab === 'moves' ? `<div class="pdx-mvs">${moves}</div>`
    : `<div class="pdx-stats">${stats}</div>
       <p class="pdx-nat"><span>Naturaleza</span> ${nat[0]}${nat[1] ? ` <small>▲ ${STAT_NAMES[nat[1]]} · ▼ ${STAT_NAMES[nat[2]]}</small>` : ' <small>(neutra)</small>'}</p>
       <p class="pdx-lore">${esc(loreOf(m))}</p>`;
  const D = $('dxDet');
  D.style.setProperty('--r', r.col); D.style.setProperty('--t1', t1); D.style.setProperty('--t2', t2);
  D.classList.toggle('locked', !o);
  D.innerHTML = `
    <div class="pdx-hero">
      <div class="pdx-hbar">
        <button class="pdx-arr" data-act="step" data-v="-1" title="Anterior (←)">◀</button>
        <span class="pdx-meta">Nº ${pad(m.dex)} · ${regionOf(m.dex)}</span>
        ${o ? `<button class="pdx-favb${fav ? ' on' : ''}" data-act="fav" title="${fav ? 'Quitar de favoritos' : 'Marcar como favorito'}">${fav ? '★' : '☆'}</button>` : ''}
        <button class="pdx-arr" data-act="step" data-v="1" title="Siguiente (→)">▶</button>
        <button class="pdx-close" data-act="close" title="Cerrar">X</button>
      </div>
      <div class="pdx-stage${shiny && o ? ' shiny' : ''}"><canvas id="dxSpr" width="192" height="192"></canvas>${shiny && o ? '<s></s><s></s><s></s><s></s><s></s><s></s>' : ''}</div>
      <h2>${o ? esc(m.name) : '???'}</h2>
      <div class="pdx-badges"><span class="pdx-rb">${r.ic} ${r.n}</span>${o ? m.types.map(tb).join('') : '<span class="pdx-tb unk">???</span>'}</div>
      ${o ? `<div class="pdx-ctl"><div class="pdx-seg"><button data-act="view" data-v="normal" class="${shiny ? '' : 'on'}">Normal</button><button data-act="view" data-v="shiny" class="${shiny ? 'on' : ''}">Shiny</button></div>
        <div class="pdx-seg">${DX_ANIMS.map(([k, n]) => `<button data-act="anim" data-v="${k}" class="${dx.anim === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>` : ''}
    </div>
    ${facts}
    ${evo ? `<div class="pdx-evh"><h3>Evolución</h3>${canJump ? `<button class="pdx-jump" data-act="final">▲ Ver evolución final</button>` : ''}</div>${evo}` : ''}
    ${o ? `<div class="pdx-tabs">${DX_TABS.map(([k, n]) => `<button data-act="tab" data-v="${k}" class="${tab === k ? 'on' : ''}">${n}</button>`).join('')}</div>` : ''}
    <div class="pdx-body">${body}</div>`;
  dx.t0 = performance.now();
  dx.spr = $('dxSpr'); dx.sprO = o; dx.sprShiny = shiny && o;
  paintSprite(dx.spr, m.dex, {sc:4, fit:176, shiny: shiny && o, dark: !o});
  D.querySelectorAll('canvas[data-evo]').forEach(c => { const d = +c.dataset.evo; paintSprite(c, d, {sc:2, fit:52, dark: !own(d)}); });
}
// El sprite grande se anima (solo cuando la pantalla se ve)
setInterval(() => {
  if(typeof $ !== 'function' || !$('dexv') || $('dexv').classList.contains('hide') || !dx.spr || !dx.spr.isConnected || !dx.sprO) return;
  const x = dx.spr.getContext('2d'), t = (performance.now() - dx.t0) / 1000;
  const idle = sheet(dx.sel, 'Idle', dx.sprShiny), I = idle && idle.ok && idle.info;       // la escala sale de la hoja de Reposo: así el Pokémon no se encoge en Ataque/Herido
  const sc = I ? Math.min(4, 168 / Math.max(I.fw, I.fh)) : 4;
  x.clearRect(0, 0, 192, 192); drawFrame(x, dx.sel, dx.anim, t, 0, 96, 100, sc, 0, dx.sprShiny);
}, 120);

function openDex(){
  if(!dx.built) buildDexShell();
  if(!own(dx.sel)) dx.sel = save.box[save.box.length - 1] || 94;
  $('dxQ').value = dx.q; $('dxDet').classList.remove('open');
  renderTabs(); renderPills(); renderGrid(); renderDetail(); show('dexv');
}
