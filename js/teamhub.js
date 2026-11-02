"use strict";
/* =====================================================================
   12b) EQUIPO POKÉMON · VISTA NUEVA (PRUEBA) — «Construye · Analiza · Optimiza»
   Otra forma de ver la pantalla del equipo, con el estilo de un panel de juego moderno:
     · centro     → los 3 Pokémon del equipo como cartas con brillo de neón unidas por líneas (el nº 1, el líder, en medio con corona)
     · izquierda  → tus equipos, la nota del equipo («Sinergia») y recomendaciones automáticas
     · derecha    → análisis: gráfico de 6 ejes, debilidades compartidas, cobertura de tipos y estadísticas sumadas del equipo
     · abajo      → tu colección en una tira que se desplaza (buscar, tipo, orden). Clic = marcar, doble clic = añadir, o arrastrar a una carta.
     · «Optimizar equipo» → busca en tu colección los cambios que más suben la nota del equipo y te deja aplicarlos.
   NO sustituye a la vista clásica (team.js): se monta encima, dentro de #teamv, y usa sus mismas funciones (placeAt, removeMon, setItem,
   openData, itemDd...). El botón «Vista clásica» vuelve a la de siempre y la elección se recuerda en este navegador (localStorage 'cc_teamView').
   Para quitar la prueba del todo: borrar este archivo, su <script> en index.html y el bloque «Equipo · vista nueva» del final de style.css.
   Las «recomendaciones» y la nota NO son una IA: son reglas sencillas con la tabla de tipos, las estadísticas y los ataques.
   ===================================================================== */
const hb = {built:false, q:'', type:'', order:'num', fav:false, pick:null, io:null, clock:0, sug:null};
const hbOn = () => { try{ return localStorage.getItem('cc_teamView') !== 'pc'; }catch(e){ return true; } };
const hbSet = v => { try{ localStorage.setItem('cc_teamView', v); }catch(e){} };
const HB_AB = {normal:'NOR', fuego:'FUE', agua:'AGU', planta:'PLA', electrico:'ELÉ', hielo:'HIE', lucha:'LUC', veneno:'VEN', tierra:'TIE', volador:'VOL',
  psiquico:'PSÍ', bicho:'BIC', roca:'ROC', fantasma:'FAN', dragon:'DRA', siniestro:'SIN', acero:'ACE', hada:'HAD'};
const hbAb = t => HB_AB[t] || TYPE_ES[t].slice(0, 3).toUpperCase();
const hbPct = (v, lo, hi) => Math.max(0, Math.min(100, Math.round((v - lo) / (hi - lo) * 100)));

// ---- Análisis del equipo (reglas, sin IA): devuelve las 6 notas, debilidades, cobertura, etc. ----
function hbAnalyze(T){
  const ms = T.map(mon), n = ms.length, all = Object.keys(CH);
  if(!n) return {n, axes:{ofe:0, def:0, vel:0, cob:0, sin:0, uti:0}, score:0, weak:[], shared:[], res:[], miss:all, cov:[], sums:{}, phys:0, spec:0};
  const avg = f => T.reduce((s, d) => s + f(d), 0) / n, st = (d, k) => realStat(d, k);
  const mvT = new Set(T.flatMap(d => movesOf(d).map(x => (MOVES[x] || {}).t).filter(Boolean)));
  const cov = all.filter(t => [...mvT].some(a => eff(a, [t]) > 1)), miss = all.filter(t => !cov.includes(t));
  const weak = [], res = [];
  all.forEach(t => { const w = ms.filter(m => eff(t, m.types) > 1).length, r = ms.filter(m => eff(t, m.types) < 1).length; if(w) weak.push([t, w]); if(r >= 2) res.push([t, r]); });
  weak.sort((a, b) => b[1] - a[1]);
  const shared = weak.filter(([, w]) => w >= 2);
  const phys = T.filter(d => st(d, 'atk') >= st(d, 'spa')).length, spec = n - phys;
  const ofe = hbPct(avg(d => Math.max(st(d, 'atk'), st(d, 'spa'))), 50, 175);
  const def = hbPct(avg(d => (st(d, 'hp') + st(d, 'def') + st(d, 'spd')) / 3), 70, 165);
  const vel = hbPct(avg(d => st(d, 'spe')), 35, 165);
  const cob = Math.round(cov.length / all.length * 100);
  const sin = n < 2 ? 50 : Math.max(0, Math.min(100, 92 - shared.reduce((s, [, w]) => s + (w >= 3 ? 26 : 14), 0) + res.length * 3 + (new Set(ms.flatMap(m => m.types)).size - n) * 4));
  const uti = Math.round(Math.min(100, T.filter(d => save.equip[d]).length / n * 55 + Math.min(1, mvT.size / (n * 2.2)) * 45));
  const axes = {ofe, def, vel, cob, sin, uti};
  const score = Math.round((sin * .25 + cob * .2 + ofe * .15 + def * .15 + vel * .15 + uti * .1) * Math.min(1, .55 + n * .15));
  const sums = Object.fromEntries(STAT_KEYS.map(k => [k, T.reduce((s, d) => s + st(d, k), 0)]));
  return {n, axes, score, weak, shared, res, miss, cov, sums, phys, spec, mvT};
}
// Recomendaciones: frases cortas con ⚠ (aviso), ✓ (bien) o ✕ (peligro)
function hbTips(A){
  const out = [];
  if(A.n < 3) out.push(['warn', `Te ${3 - A.n === 1 ? 'falta 1 Pokémon' : 'faltan ' + (3 - A.n) + ' Pokémon'} para completar el equipo.`]);
  if(!A.n) return out;
  const big = ['tierra', 'roca', 'fuego', 'agua', 'hielo', 'lucha', 'hada', 'dragon', 'acero', 'siniestro'];
  const m = A.miss.filter(t => big.includes(t)).slice(0, 2);
  if(m.length) out.push(['warn', `Tu equipo no tiene ataques eficaces contra ${m.map(t => TYPE_ES[t]).join(' ni ')}.`]);
  A.shared.slice(0, 2).forEach(([t, w]) => out.push([w >= 3 ? 'bad' : 'warn', `Debilidad ante ${TYPE_ES[t]}: ${w} de tus ${A.n} Pokémon.`]));
  const strong = Object.keys(CH).map(t => [t, team.filter(d => movesOf(d).some(x => MOVES[x] && eff(MOVES[x].t, [t]) > 1)).length]).filter(([, k]) => k >= 2).sort((a, b) => b[1] - a[1]);
  if(strong.length) out.push(['ok', `Excelente contra equipos de tipo ${TYPE_ES[strong[0][0]]}${strong[1] ? ' y ' + TYPE_ES[strong[1][0]] : ''}.`]);
  const noItem = team.filter(d => !save.equip[d]);
  if(noItem.length) out.push(['warn', `${noItem.map(d => mon(d).name).join(' y ')} no ${noItem.length > 1 ? 'llevan' : 'lleva'} objeto.`]);
  if(A.n >= 2 && (!A.phys || !A.spec)) out.push(['warn', `Todos atacan por el lado ${A.phys ? 'físico' : 'especial'}: un Pokémon del otro tipo lo equilibraría.`]);
  if(A.n === 3 && !A.shared.length) out.push(['ok', 'Ningún tipo es súper eficaz contra 2 o más de tus Pokémon.']);
  return out.slice(0, 4);
}

// ---- Fondo: la ilustración fondos/equipo.webp (1536x1024). Su círculo mágico está en (758, 208): se coloca y se amplía la imagen para que
// ese círculo quede justo detrás de la carta del líder (centrado con ella), sea cual sea el tamaño de la pantalla. Lo hace hbBgFit().
const HB_BG = {w:1536, h:1024, ex:758 / 1536, ey:208 / 1024};
function hbBgSvg(){ return ''; }
function hbBgFit(){
  const hub = $('tmHub'), lead = hub && $('hbCards').querySelector('.hb-mon[data-i="0"]'); if(!lead || !hub.offsetWidth) return;
  const H = hub.getBoundingClientRect(), L = lead.getBoundingClientRect(), W = H.width, Hh = H.height;
  const cx = L.left + L.width / 2 - H.left, cy = L.top + L.height / 2 - H.top, B = HB_BG;
  const s = Math.max(W / B.w, Hh / B.h, cx / (B.ex * B.w), (W - cx) / ((1 - B.ex) * B.w), cy / (B.ey * B.h), (Hh - cy) / ((1 - B.ey) * B.h));   // lo justo para cubrir la pantalla
  hub.style.setProperty('--bgs', `${Math.ceil(B.w * s)}px ${Math.ceil(B.h * s)}px`);
  hub.style.setProperty('--bgp', `${Math.round(cx - B.ex * B.w * s)}px ${Math.round(cy - B.ey * B.h * s)}px`);
}
addEventListener('resize', () => { if(hb.built && hbOn()) hbBgFit(); });

// ---- Estructura (una vez) ----
function hbBuild(){
  const el = document.createElement('div'); el.id = 'tmHub'; el.className = 'hb';
  el.innerHTML = hbBgSvg() + `
    <header class="hb-top">
      <div class="hb-logo" aria-hidden="true"></div>
      <div class="hb-tt"><h1>Equipo Pokémon</h1><span>Construye · Analiza · Optimiza</span></div>
      <div class="hb-chips"><span class="hb-chip" title="Puntos de Batalla (BP)"><canvas id="hbIcBP"></canvas><b id="hbBP"></b><small>BP</small></span><span class="hb-chip" title="Tickets de Gachapon"><canvas id="hbIcTK"></canvas><b id="hbTK"></b></span>
        <span class="hb-chip" title="Pokémon en tu colección"><canvas id="hbIcPK"></canvas><b id="hbPK"></b></span><span class="hb-chip" title="Hora"><canvas id="hbIcCK"></canvas><b id="hbCK"></b></span>
        <button id="hbClose" class="hb-btn ghost" title="Cerrar (Esc)">✕</button></div>
    </header>
    <div class="hb-body">
      <aside class="hb-left">
        <section class="hb-panel hb-teams"><h3>Mis equipos <small id="hbTCount"></small><button id="hbNew" class="hb-btn mini" title="Crear un equipo nuevo">+ Nuevo</button></h3><div id="hbTList" class="hb-tlist"></div></section>
        <section class="hb-panel hb-syn"><h3>Sinergia del equipo</h3><div class="hb-synb"><div id="hbRing" class="hb-ring"></div><ul id="hbChecks" class="hb-checks"></ul></div></section>
        <section class="hb-panel hb-rec"><h3><i class="bulb"></i>Recomendaciones</h3><ul id="hbTips" class="hb-tips"></ul></section>
      </aside>
      <main class="hb-stage" id="hbStage">
        <div class="hb-name"><input id="hbName" maxlength="14" autocomplete="off" aria-label="Nombre del equipo"><button id="hbFav" class="hb-btn mini" title="Equipo favorito">☆</button></div>
        <svg class="hb-lines" id="hbLines" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true"></svg>
        <div class="hb-emb" aria-hidden="true"></div>
        <div id="hbCards"></div>
        <div id="hbOpt" class="hb-opt hide"></div>
      </main>
      <aside class="hb-right">
        <section class="hb-panel hb-ana"><h3>Análisis competitivo</h3><div class="hb-anab"><div id="hbRadar" class="hb-radar"></div><div class="hb-weak"><b>Debilidades</b><div id="hbWeak" class="hb-wring"></div></div></div></section>
        <section class="hb-panel hb-cov"><h3>Cobertura de tipos</h3><div class="hb-covb"><div id="hbCovT" class="hb-covt"></div><div id="hbCovR" class="hb-ring sm"></div></div></section>
        <section class="hb-panel hb-sts"><h3>Estadísticas del equipo</h3><div id="hbStats" class="hb-stats"></div></section>
      </aside>
    </div>
    <footer class="hb-bot">
      <section class="hb-col">
        <div class="hb-colh"><b>Tu colección</b><input id="hbQ" placeholder="Buscar (nombre o nº)" autocomplete="off"><select id="hbType"></select>
          <select id="hbOrder"><option value="num">Número</option><option value="name">Nombre</option><option value="rar">Rareza</option><option value="used">Más usados</option><option value="fav">Favoritos</option></select>
          <button id="hbFavF" class="hb-btn mini" title="Ver solo tus favoritos">★ Favoritos</button><span id="hbCnt" class="hb-cnt"></span><span id="hbPick" class="hb-pick"></span></div>
        <div class="hb-strip"><button class="hb-arr" data-dir="-1" aria-label="Anterior">‹</button><div id="hbList" class="hb-list"></div><button class="hb-arr" data-dir="1" aria-label="Siguiente">›</button></div>
      </section>
      <div class="hb-acts"><button id="hbOptB" class="hb-btn gold">✨ Optimizar equipo</button><button id="hbData" class="hb-btn">📋 Ver datos del líder</button></div>
    </footer>`;
  $('teamv').insertBefore(el, $('tmData'));
  bitmap($('hbIcBP'), ICONS.coin, '#ffcc33'); bitmap($('hbIcTK'), ICONS.ticket, '#ff3ea5');                                     // los mismos iconos que el menú principal
  bitmap($('hbIcPK'), ['...kkkk...', '..krrrrk..', '.krrrrrrk.', 'krrrrrrrrk', 'kkkkwwkkkk', 'kwwwkkwwwk', 'kwwwwwwwwk', '.kwwwwwwk.', '..kwwwwk..', '...kkkk...'], null, {k:'#1a1a22', r:'#e8352b', w:'#f4f4f4'});
  bitmap($('hbIcCK'), ['...kkkk...', '..kwwwwk..', '.kwwwkwwk.', 'kwwwwkwwwk', 'kwwwwkwwwk', 'kwwwwkkkwk', 'kwwwwwwwwk', '.kwwwwwwk.', '..kwwwwk..', '...kkkk...'], null, {k:'#9fb4e8', w:'#0b1430'});
  // botones de arriba
  $('hbClose').onclick = closeTeam;
  $('hbNew').onclick = () => { newTeam(); setTimeout(() => { $('hbName').focus(); $('hbName').select(); }, 30); };
  $('hbTList').onclick = e => { const r = e.target.closest('.hb-trow'); if(!r || +r.dataset.i === save.tsel) return; closeDd(); selectTeam(+r.dataset.i); tm.selD = team[0] || null; hb.pick = null; renderTeamSlots(); };
  $('hbName').oninput = e => { const t = save.teams[save.tsel]; t.n = e.target.value.trim().slice(0, 14) || 'Equipo ' + (save.tsel + 1); persist(); hbTeams(); };
  $('hbFav').onclick = () => { const t = save.teams[save.tsel]; t.fav = !t.fav; persist(); hbRender(); };
  $('hbData').onclick = () => { const d = (hb.pick && team.includes(hb.pick)) ? hb.pick : team[0]; if(d) openData(d); };
  $('hbOptB').onclick = hbOptimize;
  // cartas del equipo
  const cards = $('hbCards');
  cards.addEventListener('click', ddClick); cards.addEventListener('keydown', ddKey);
  cards.addEventListener('click', e => {
    if(e.target.closest('.idd')) return; const c = e.target.closest('.hb-mon'); if(!c) return;
    const b = e.target.closest('[data-act]'), d = +c.dataset.d, i = +c.dataset.i;
    if(b){ const a = b.dataset.act; if(a === 'rm') removeMon(d); else if(a === 'data') openData(d); else if(a === 'lead') placeAt(d, 0); else if(a === 'put' && hb.pick) placeAt(hb.pick, i); return; }
    if(!d && hb.pick) placeAt(hb.pick, i);
  });
  cards.addEventListener('dragstart', e => { const c = e.target.closest('.hb-mon[data-d]'); if(!c || e.target.closest('.idd')){ e.preventDefault(); return; } closeDd(); e.dataTransfer.setData('text/plain', 'slot:' + c.dataset.i); e.dataTransfer.effectAllowed = 'move'; c.classList.add('dragging'); });
  cards.addEventListener('dragend', () => cards.querySelectorAll('.dragging,.drop').forEach(c => c.classList.remove('dragging', 'drop')));
  const ddMark = () => setTimeout(() => cards.querySelectorAll('.hb-mon').forEach(c => c.classList.toggle('ddon', !!c.querySelector('.iddl:not([hidden])'))), 0);
  cards.addEventListener('click', ddMark); document.addEventListener('click', ddMark);
  cards.addEventListener('dragover', e => { const c = e.target.closest('.hb-mon'); if(c){ e.preventDefault(); c.classList.add('drop'); } });
  cards.addEventListener('dragleave', e => { const c = e.target.closest('.hb-mon'); if(c) c.classList.remove('drop'); });
  cards.addEventListener('drop', e => { const c = e.target.closest('.hb-mon'); if(!c) return; e.preventDefault(); c.classList.remove('drop'); const v = e.dataTransfer.getData('text/plain'), to = +c.dataset.i;
    if(v.startsWith('slot:')){ hbSwap(+v.slice(5), to); return; }                                  // carta sobre carta: cambian de puesto
    const d = +v; if(d) placeAt(d, to); });
  // colección
  $('hbType').innerHTML = '<option value="">Todos los tipos</option>' + Object.keys(TYPE_ES).map(t => `<option value="${t}">${TYPE_ES[t]}</option>`).join('');
  $('hbQ').oninput = e => { hb.q = e.target.value; hbList(); };
  $('hbType').onchange = e => { hb.type = e.target.value; hbList(); };
  $('hbOrder').onchange = e => { hb.order = e.target.value; hbList(); };
  $('hbFavF').onclick = () => { hb.fav = !hb.fav; $('hbFavF').classList.toggle('on', hb.fav); hbList(); };
  const list = $('hbList');
  list.onclick = e => { const c = e.target.closest('.hb-tile'); if(!c) return; const d = +c.dataset.d; hb.pick = hb.pick === d ? null : d; hbMark(); hbPickBar(); hbCards(); };
  list.ondblclick = e => { const c = e.target.closest('.hb-tile'); if(!c) return; hb.pick = null; quickAdd(+c.dataset.d); };
  list.addEventListener('dragstart', e => { const c = e.target.closest('.hb-tile'); if(!c) return; e.dataTransfer.setData('text/plain', c.dataset.d); e.dataTransfer.effectAllowed = 'copy'; });
  list.addEventListener('wheel', e => { if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){ list.scrollLeft += e.deltaY; e.preventDefault(); } }, {passive:false});   // la rueda del ratón mueve la tira
  el.querySelectorAll('.hb-arr').forEach(b => b.onclick = () => list.scrollBy({left: +b.dataset.dir * list.clientWidth * .8, behavior:'smooth'}));
  $('hbPick').onclick = e => { const b = e.target.closest('[data-act]'); if(!b || !hb.pick) return; const a = b.dataset.act, d = hb.pick;
    if(a === 'add'){ hb.pick = null; placeAt(d, team.length); } else if(a === 'rep'){ hb.pick = null; placeAt(d, +b.dataset.i); } else if(a === 'x'){ hb.pick = null; hbMark(); hbPickBar(); hbCards(); } };
  $('hbOpt').onclick = e => { const b = e.target.closest('[data-act]'); if(!b) return;
    if(b.dataset.act === 'close') $('hbOpt').classList.add('hide');
    else if(b.dataset.act === 'apply'){ $('hbOpt').classList.add('hide'); hb.pick = null; placeAt(+b.dataset.d, +b.dataset.i); } };
  hb.io = new IntersectionObserver(es => es.forEach(en => { if(en.isIntersecting){ hb.io.unobserve(en.target); const d = +en.target.dataset.d; hbPaint(en.target.querySelector('canvas'), d, useShiny(d)); } }), {root: list, rootMargin: '0px 400px'});
  // classic: botón para volver a la vista nueva
  const top = $('teamv').querySelector('.pc-top'); if(top && !$('pcHub')){ const b = document.createElement('button'); b.id = 'pcHub'; b.className = 'pcb main'; b.textContent = '✨ Vista nueva'; b.title = 'Probar la pantalla de equipo nueva'; b.onclick = () => { hbSet('hub'); hbApply(); }; top.insertBefore(b, $('tmBack')); }
  hb.built = true;
}

// ---- Dibujo ----
function hbRender(){
  if(!hb.built || !hbOn()) return;
  const A = hbAnalyze(team);
  $('hbBP').textContent = (save.bp || 0).toLocaleString('es-ES'); $('hbTK').textContent = save.tickets || 0; $('hbPK').textContent = boxCount(); hbClock();
  const cur = save.teams[save.tsel]; if(document.activeElement !== $('hbName')) $('hbName').value = cur.n;
  $('hbFav').textContent = cur.fav ? '★' : '☆'; $('hbFav').classList.toggle('on', !!cur.fav);
  hbTeams(); hbCards(); hbLines(); requestAnimationFrame(hbBgFit);
  // sinergia (nota total) y comprobaciones
  $('hbRing').innerHTML = hbRingSvg(A.score, '#4ccf6a') + `<b>${A.score}%</b>`;
  const chk = [[A.axes.cob >= 70, A.axes.cob >= 70 ? 'Gran cobertura' : 'Poca cobertura'], [A.n >= 2 && !A.shared.length, A.n >= 2 && !A.shared.length ? 'Buena sinergia' : 'Debilidades compartidas'], [A.n >= 2 && A.phys && A.spec, A.n >= 2 && A.phys && A.spec ? 'Equilibrado' : 'Poco equilibrado']];
  $('hbChecks').innerHTML = chk.map(([ok, t]) => `<li class="${ok ? 'ok' : 'warn'}"><i></i>${t}</li>`).join('');
  $('hbTips').innerHTML = hbTips(A).map(([k, t]) => `<li class="${k}"><i></i><span>${esc(t)}</span></li>`).join('') || '<li class="ok"><i></i><span>¡Todo en orden!</span></li>';
  // radar de 6 ejes
  const ax = [['Ofensiva', A.axes.ofe], ['Defensa', A.axes.def], ['Velocidad', A.axes.vel], ['Utilidad', A.axes.uti], ['Cobertura', A.axes.cob], ['Sinergia', A.axes.sin]];
  $('hbRadar').innerHTML = hbRadarSvg(ax);
  // debilidades (los tipos que golpean súper eficaz a alguno; en rojo los compartidos)
  const W = A.weak.slice(0, 10);
  $('hbWeak').innerHTML = W.map(([t, w], i) => { const a = i / Math.max(1, W.length) * 6.283 - 1.571; return `<span class="hb-tic${w >= 2 ? ' hot' : ''}" style="--c:${TC[t]};left:${50 + Math.cos(a) * 40}%;top:${50 + Math.sin(a) * 40}%" title="${TYPE_ES[t]}: ${w} de ${A.n}">${hbAb(t)}</span>`; }).join('') +
    `<div class="hb-wc"><small>Compartidas</small><b>${A.shared ? A.shared.length : 0}</b></div>`;
  // cobertura
  $('hbCovT').innerHTML = Object.keys(CH).map(t => `<span class="hb-tic${A.cov.includes(t) ? ' on' : ''}" style="--c:${TC[t]}" title="${TYPE_ES[t]}: ${A.cov.includes(t) ? 'tienes un ataque súper eficaz' : 'sin ataque súper eficaz'}">${hbAb(t)}</span>`).join('');
  $('hbCovR').innerHTML = hbRingSvg(A.axes.cob, '#4ccf6a') + `<b>${A.axes.cob}%</b><small>Cobertura</small>`;
  // estadísticas sumadas
  const L = {hp:'PS', atk:'Ataque', def:'Defensa', spa:'At. Esp.', spd:'Def. Esp.', spe:'Velocidad'}, C = {hp:'#e8503a', atk:'#ffc83a', def:'#4ccf6a', spa:'#3ea6ff', spd:'#8a7aff', spe:'#ff5aa0'};
  $('hbStats').innerHTML = STAT_KEYS.map(k => `<div class="hb-st"><u style="color:${C[k]}">${L[k]}</u><i><s style="width:${Math.min(100, (A.sums[k] || 0) / 6)}%;background:${C[k]}"></s></i><b>${A.sums[k] || 0}</b></div>`).join('');
  hbMark(); hbPickBar();
}
function hbRingSvg(p, col){
  const r = 42, c = 2 * Math.PI * r, off = c * (1 - p / 100);
  return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="${r}" fill="none" stroke="#1d2a48" stroke-width="9"/><circle cx="50" cy="50" r="${r}" fill="none" stroke="url(#hbG${col.slice(1)})" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 50 50)"/>
    <defs><linearGradient id="hbG${col.slice(1)}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2be0a0"/><stop offset="1" stop-color="${col}"/></linearGradient></defs></svg>`;
}
function hbRadarSvg(ax){
  const n = ax.length, cx = 120, cy = 104, R = 70, pt = (i, k) => { const a = -Math.PI / 2 + i / n * 2 * Math.PI; return [cx + Math.cos(a) * R * k, cy + Math.sin(a) * R * k]; };
  const ring = k => ax.map((_, i) => pt(i, k).join(',')).join(' ');
  const poly = ax.map(([, v], i) => pt(i, Math.max(.06, v / 100)).join(',')).join(' ');
  const lab = ax.map(([t, v], i) => { const [x, y] = pt(i, 1.32); return `<text x="${x}" y="${y - 4}" text-anchor="middle" class="rl">${t}</text><text x="${x}" y="${y + 11}" text-anchor="middle" class="rv">${v}</text>`; }).join('');
  return `<svg viewBox="0 0 240 212">${[1, .75, .5, .25].map(k => `<polygon points="${ring(k)}" class="rg"/>`).join('')}${ax.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, 1)[0]}" y2="${pt(i, 1)[1]}" class="rg"/>`).join('')}
    <polygon points="${poly}" class="rp"/>${ax.map(([, v], i) => { const [x, y] = pt(i, Math.max(.06, v / 100)); return `<circle cx="${x}" cy="${y}" r="3" class="rd"/>`; }).join('')}${lab}</svg>`;
}
function hbTeams(){
  $('hbTCount').textContent = `${save.teams.length}/${TEAM_MAX}`; $('hbNew').disabled = save.teams.length >= TEAM_MAX;
  $('hbTList').innerHTML = save.teams.map((t, i) => { const ms = i === save.tsel ? team : t.mons;
    return `<div class="hb-trow${i === save.tsel ? ' on' : ''}" data-i="${i}" role="button" tabindex="0"><b>${t.fav ? '★ ' : ''}${esc(t.n)}</b><span>${ms.length ? ms.map(d => `<canvas width="64" height="64" data-d="${d}"></canvas>`).join('') : '<em>Vacío</em>'}</span></div>`; }).join('');
  $('hbTList').querySelectorAll('canvas').forEach(c => paintSprite(c, +c.dataset.d, {sc:6, fit:62, shiny:useShiny(+c.dataset.d)}));
}
const hbMega = d => { const eq = save.equip[d], it = eq && ITEMS[eq]; return it && it.mega && MEGA[it.mega] && MEGA[it.mega].dex === d ? MEGA[it.mega] : null; };   // la mega si lleva su piedra
function hbSwap(a, b){                                                                              // cambia de puesto dos cartas (a una vacía: pasa al final)
  if(a === b || !team[a]) return;
  const d = team[a];
  if(team[b]){ team[a] = team[b]; team[b] = d; } else { team.splice(a, 1); team.push(d); }
  persist(); renderTeamSlots(); toast(`${mon(d).name} ahora es el nº ${team.indexOf(d) + 1} del equipo.`);
}
// Dibuja el sprite recortado a su contenido y lo encaja entero en el lienzo (así no se corta ni queda pequeño)
function hbPaint(cv, dex, shiny){
  let tries = 0; const T = document.createElement('canvas'); T.width = T.height = 320;
  const go = () => {
    const tx = T.getContext('2d'); tx.clearRect(0, 0, 320, 320); tx.imageSmoothingEnabled = false;
    if(!drawFrame(tx, dex, 'Idle', 0, 0, 160, 160, 1, 0, shiny)){ if(++tries < 24 && cv.isConnected) setTimeout(go, 250); return; }
    const D = tx.getImageData(0, 0, 320, 320).data; let x0 = 320, y0 = 320, x1 = -1, y1 = -1;
    for(let y = 0; y < 320; y++) for(let x = 0; x < 320; x++) if(D[(y * 320 + x) * 4 + 3] > 8){ if(x < x0) x0 = x; if(x > x1) x1 = x; if(y < y0) y0 = y; if(y > y1) y1 = y; }
    const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height); if(x1 < 0) return;
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1; let k = Math.min(cv.width * .94 / bw, cv.height * .94 / bh); if(k >= 2) k = Math.floor(k);
    const w = Math.round(bw * k), h = Math.round(bh * k); c.imageSmoothingEnabled = false;
    c.drawImage(T, x0, y0, bw, bh, Math.round((cv.width - w) / 2), Math.round((cv.height - h) / 2), w, h);
  };
  go();
}
// Las 3 cartas: el líder (nº 1) en el centro, más grande y con corona; los otros dos a los lados
const HB_POS = [{x:50, y:40, big:1}, {x:20, y:60}, {x:80, y:60}];
function hbCards(){
  $('hbCards').innerHTML = [0, 1, 2].map(i => {
    const d = team[i], P = HB_POS[i], st = `left:${P.x}%;top:${P.y}%`;
    if(!d) return `<article class="hb-mon empty${P.big ? ' big' : ''}" data-i="${i}" style="${st}"><i class="hb-num">${i + 1}</i><div class="hb-in"><b class="hb-plus">+</b><span>${hb.pick ? `Pulsa para poner a <em>${esc(mon(hb.pick).name)}</em>` : 'Hueco libre'}</span><small>Arrastra aquí un Pokémon de tu colección</small></div></article>`;
    const m = mon(d), M = hbMega(d), ty = M ? M.types : m.types, c1 = TC[ty[0]], c2 = TC[ty[1] || ty[0]], r = RAR[m.rar];
    return `<article class="hb-mon${P.big ? ' big' : ''}${hb.pick ? ' can' : ''}${M ? ' mega' : ''}" data-d="${d}" data-i="${i}" data-spr="${M ? M.folder : d}" draggable="true" title="Arrastra la carta sobre otra para cambiarlas de puesto" style="${st};--c1:${c1};--c2:${c2}">
      ${i === 0 ? '<i class="hb-crown" title="Líder: sale primero al combate"></i>' : ''}<i class="hb-num" title="Sale ${['primero', 'segundo', 'tercero'][i]} al combate">${i + 1}</i><div class="hb-in">
      <header><b>${esc(M ? M.form : m.name)}</b>${!M && save.shiny.includes(d) && useShiny(d) ? '<em class="sh" title="Shiny">⭐</em>' : ''}</header>
      ${M ? `<em class="hb-mg" title="Lleva su megapiedra: en combate puede megaevolucionar (tecla R)">MEGA · ${esc(m.name)}</em>` : ''}
      <div class="hb-spr"><canvas width="${P.big ? 176 : 136}" height="${P.big ? 176 : 136}"></canvas></div>
      <div class="hb-ty">${ty.map(t => `<span style="background:${TC[t]}">${TYPE_ES[t]}</span>`).join('')}</div>
      <div class="hb-rar" style="color:${r.col}" title="${r.n}">${'★'.repeat(r.rank + 1)}</div>
      ${itemDd(d)}
      <div class="hb-ma">${hb.pick && hb.pick !== d ? `<button data-act="put" class="put">⇄ Poner a ${esc(mon(hb.pick).name)}</button>` : `<button data-act="data">Datos</button><button data-act="rm" title="Quitar del equipo">✕</button>`}</div></div></article>`;
  }).join('');
  $('hbCards').querySelectorAll('.hb-mon[data-d]').forEach(c => { const cv = c.querySelector('canvas'); const sp = c.dataset.spr, mg = isNaN(+sp); hbPaint(cv, mg ? sp : +sp, !mg && useShiny(+sp)); });
}
function hbLines(){                                                                                   // líneas de neón que unen las cartas con el centro
  const C = [500, 300], pts = HB_POS.map(p => [p.x * 10, p.y * 6.2]);
  const col = i => team[i] ? TC[mon(team[i]).types[0]] : '#2d4a7c';
  $('hbLines').innerHTML = `<defs><filter id="hbBlur"><feGaussianBlur stdDeviation="6"/></filter></defs>
    ${[300, 230, 160].map((r, k) => `<ellipse cx="${C[0]}" cy="${C[1]}" rx="${r * 1.35}" ry="${r}" class="ring r${k}"/>`).join('')}
    ${pts.map(([x, y], i) => `<path d="M${C[0]} ${C[1]} Q ${(x + C[0]) / 2} ${y + 60} ${x} ${y}" stroke="${col(i)}" class="glow" filter="url(#hbBlur)"/><path d="M${C[0]} ${C[1]} Q ${(x + C[0]) / 2} ${y + 60} ${x} ${y}" stroke="${col(i)}" class="ln"/>`).join('')}
    <path d="M${pts[1][0]} ${pts[1][1]} Q 500 ${pts[1][1] + 210} ${pts[2][0]} ${pts[2][1]}" class="ln dim"/>`;
}
// Tira de la colección
function hbFiltered(){
  const q = plain(hb.q.trim()).replace(/^#/, ''), num = /^\d+$/.test(q);
  const L = save.box.filter(d => mon(d) && !hidden(d)).map(mon).filter(m => (!q || (num ? String(m.dex).startsWith(String(+q)) : plain(m.name).includes(q))) && (!hb.type || m.types.includes(hb.type)) && (!hb.fav || save.fav.includes(m.dex)));
  const o = hb.order;
  L.sort(o === 'name' ? (a, b) => a.name.localeCompare(b.name, 'es') : o === 'rar' ? (a, b) => RAR[b.rar].rank - RAR[a.rar].rank || a.dex - b.dex :
    o === 'used' ? (a, b) => (save.used[b.dex] || 0) - (save.used[a.dex] || 0) || a.dex - b.dex : o === 'fav' ? (a, b) => (save.fav.includes(b.dex) ? 1 : 0) - (save.fav.includes(a.dex) ? 1 : 0) || a.dex - b.dex : (a, b) => a.dex - b.dex);
  return L;
}
function hbList(){
  hb.io.disconnect(); const L = hbFiltered();
  $('hbList').innerHTML = L.length ? L.map(m => `<div class="hb-tile" data-d="${m.dex}" draggable="true" title="${esc(m.name)} · clic: marcar · doble clic: añadir · o arrástralo a una carta" style="--r:${RAR[m.rar].col};--c1:${TC[m.types[0]]}">
      <i class="hb-tin"></i>${save.fav.includes(m.dex) ? '<i class="hb-tfav">★</i>' : ''}<canvas width="80" height="80"></canvas><b>${esc(m.name)}</b><small>#${pad3(m.dex)}</small></div>`).join('') : `<p class="hb-none">${hb.fav && !save.fav.length ? 'Aún no tienes favoritos: márcalos con ☆ en la ficha de un Pokémon (botón «Datos» o la vista clásica).' : 'Ningún Pokémon coincide.'}</p>`;
  $('hbList').querySelectorAll('.hb-tile').forEach(c => hb.io.observe(c));
  $('hbCnt').textContent = `${L.length} de ${boxCount()}`; $('hbList').scrollLeft = 0; hbMark();
}
function hbMark(){
  const sug = hb.sug || [];
  $('hbList').querySelectorAll('.hb-tile').forEach(c => { const d = +c.dataset.d, i = team.indexOf(d);
    c.classList.toggle('in', i >= 0); c.classList.toggle('pick', d === hb.pick); c.classList.toggle('sug', sug.includes(d));
    c.querySelector('.hb-tin').textContent = i >= 0 ? (i === 0 ? '♛' : i + 1) : sug.includes(d) ? '✨' : ''; });
}
function hbPickBar(){
  const d = hb.pick, el = $('hbPick');
  if(!d){ el.innerHTML = '<em>Clic en un Pokémon para marcarlo · doble clic para añadirlo</em>'; return; }
  const m = mon(d);
  el.innerHTML = team.includes(d) ? `<b>${esc(m.name)}</b> ya está en el equipo <button data-act="x">✕</button>`
    : team.length < 3 ? `<b>${esc(m.name)}</b><button data-act="add" class="go">＋ Añadir al equipo</button><button data-act="x">✕</button>`
    : `<b>${esc(m.name)}</b> · sustituir a: ${team.map((x, i) => `<button data-act="rep" data-i="${i}">${i ? i + 1 : '♛'} ${esc(mon(x).name)}</button>`).join('')}<button data-act="x">✕</button>`;
}
function hbClock(){ const n = new Date(); $('hbCK').textContent = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0'); }

// ---- Optimizar: prueba cada Pokémon de tu colección en cada hueco y se queda con los cambios que más suben la nota ----
function hbOptimize(){
  const base = hbAnalyze(team).score, out = [];
  const pool = save.box.filter(d => mon(d) && !hidden(d) && !team.includes(d));
  pool.forEach(d => {
    if(team.length < 3){ const s = hbAnalyze([...team, d]).score; out.push({d, i:team.length, s}); return; }
    let best = null; for(let i = 0; i < 3; i++){ const T = team.slice(); T[i] = d; const s = hbAnalyze(T).score; if(!best || s > best.s) best = {d, i, s}; } out.push(best);
  });
  out.sort((a, b) => b.s - a.s); const top = out.filter(o => o.s > base).slice(0, 4);
  hb.sug = top.map(o => o.d); hbMark();
  const el = $('hbOpt'); el.classList.remove('hide');
  el.innerHTML = `<div class="hb-optb"><h3>✨ Optimizar equipo <small>nota actual ${base}%</small></h3>
    ${top.length ? top.map(o => { const m = mon(o.d), out2 = team[o.i]; return `<div class="hb-orow"><canvas width="64" height="64" data-d="${o.d}"></canvas><div><b>${esc(m.name)}</b><small>${out2 ? 'en lugar de ' + esc(mon(out2).name) : 'en el hueco libre'}</small></div><em>+${o.s - base}</em><button data-act="apply" data-d="${o.d}" data-i="${o.i}" class="hb-btn gold mini">Aplicar</button></div>`; }).join('')
      : '<p>No hay ningún cambio en tu colección que mejore la nota del equipo. ¡Ya está muy bien montado!</p>'}
    <p class="hb-note">La nota mezcla sinergia de tipos, cobertura de ataques, estadísticas y objetos. Es una ayuda, no una regla.</p>
    <button data-act="close" class="hb-btn">Cerrar</button></div>`;
  el.querySelectorAll('canvas').forEach(c => paintSprite(c, +c.dataset.d, {sc:6, fit:62, shiny:useShiny(+c.dataset.d)}));
}

// ---- Cambiar de vista y engancharse a la pantalla clásica ----
function hbApply(){
  if(!$('teamv') || !tm.built) return;
  if(!hb.built) hbBuild();
  const on = hbOn(); $('teamv').classList.toggle('hubv', on);
  clearInterval(hb.clock);
  if(on){ hb.pick = null; hb.sug = null; $('hbOpt').classList.add('hide'); hbRender(); hbList(); hb.clock = setInterval(() => { if($('teamv').classList.contains('hide')) clearInterval(hb.clock); else hbClock(); }, 20000); }
  else renderTeamSlots();
}
{
  const _open = openTeam, _rts = renderTeamSlots;
  openTeam = function(from){ _open(from); hbApply(); };                                             // al abrir la pantalla del equipo, se monta la vista elegida
  renderTeamSlots = function(){ _rts(); if(hb.built && hbOn() && !$('teamv').classList.contains('hide')) hbRender(); };   // cualquier cambio del equipo redibuja también la vista nueva
}
