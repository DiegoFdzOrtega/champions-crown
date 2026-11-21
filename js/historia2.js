"use strict";
/* =====================================================================
   PANTALLAS «HISTORIA» Y «LIGA» CON EL ASPECTO NUEVO (21-11-2026, maquetas de Diego: assets/menu/nuevo/ref_*.png)
   Solo cambia cómo se ven: la lógica sigue en js/menu.js (buildRegions) y js/liga.js (ligaRender).
   Aquí se ponen las imágenes de Gemini (assets/menu/nuevo/) y los iconos, y el resto lo hace css/historia2.css.
     fondo_castillo ... fondo de las dos pantallas
     titulo ........... placa con alas y Poké Ball («Historia», «Liga de Kanto»)
     r_<región> ....... ilustración de cada tarjeta de región (y de «Continúa aquí»)
     l_<región> ....... franja de la liga: su parte izquierda (balcón con cielo) va detrás del rival
     i_<icono> ........ iconos pequeños (puzle, llama, medalla, corona, estrella, Poké Ball, candado, flecha...)
   H2.on = false vuelve al aspecto de antes (hay que recargar la página).
   ===================================================================== */
const H2 = {on: true, dir: 'assets/menu/nuevo/'};
const H2_REG = {'Kanto': 'kanto', 'Johto': 'johto', 'Hoenn': 'hoenn', 'Sinnoh': 'sinnoh', 'Unova / Teselia': 'unova', 'Unova': 'unova', 'Teselia': 'unova',
                'Kalos': 'kalos', 'Alola': 'alola', 'Galar': 'galar', 'Paldea': 'paldea'};
const H2_PANO = new Set(['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar', 'paldea']);   // regiones con panorámica para «Continúa aquí» (c_<región>); las demás usan su tarjeta
const h2Ic = (n, cls) => `<img class="h2ic${cls ? ' ' + cls : ''}" src="${H2.dir}i_${n}.webp?v=1" alt="">`;
const h2Url = f => `url("${new URL(H2.dir + f, document.baseURI).href}")`;
if(H2.on){
  document.body.classList.add('h2on');
  document.documentElement.style.setProperty('--h2fondo', h2Url('fondo_castillo.webp?v=1'));
  document.documentElement.style.setProperty('--h2titulo', h2Url('titulo.webp?v=1'));
  document.documentElement.style.setProperty('--h2marco', h2Url('marco.webp?v=1'));
  document.documentElement.style.setProperty('--h2nt', h2Url('marco_ntop.webp?v=1'));
  document.documentElement.style.setProperty('--h2nb', h2Url('marco_nbot.webp?v=1'));
}
// marcos dorados de la maqueta: una capa encima de cada panel (grande · mediano · pequeño; «sin» = sin muesca)
const H2_MARCOS = [['#rSum,#regions .rfeat,.h2bot,#lgNew .lg-hero,#lgNew .lg-road,#tower .stteam,.h2f', ''], ['#rgrid .rcard', 'm'],
  ['#tower .stteam .card,#lgNew .lg-rw', 's'], ['#lgNew .lg-prog span,#rMode .sm-b,#btnBack1,#btnBack2', 's sin']];
function h2Marcos(){
  for(const [sel, cls] of H2_MARCOS) document.querySelectorAll(sel).forEach(el => {
    if(el.querySelector(':scope > .h2marco')) return;
    const i = document.createElement('h2-marco'); i.className = 'h2marco' + (cls ? ' ' + cls : ''); el.appendChild(i);
  });
}
function h2Titulo(txt, extra){ return `<div class="h2tit"><span class="h2tit-t">${txt}</span>${extra || ''}</div>`; }
function h2Volver(id, txt){ const b = document.getElementById(id); if(b && !b.dataset.h2){ b.dataset.h2 = 1; b.innerHTML = h2Ic('flecha') + '<span>' + txt + '</span>'; } }

// ---------------- HISTORIA (lista de regiones) ----------------
if(H2.on && typeof buildRegions === 'function'){ const o = buildRegions; buildRegions = function(){
  const r = o.apply(this, arguments);
  try{ h2Regiones(); }catch(e){ console.warn('historia2', e); }
  return r; }; }
function h2Regiones(){
  h2Volver('btnBack2', 'Menú');
  const head = document.querySelector('#regions .rhead');
  if(head && !head.querySelector('.h2tit')){ const h = head.querySelector('h1'); if(h) h.outerHTML = h2Titulo('Historia'); const p = head.querySelector('.rsub'); if(p) p.remove(); }
  // Fácil / Difícil con sus iconos
  document.querySelectorAll('#rMode .sm-b').forEach(b => { const i = b.querySelector('i'); if(i && !i.dataset.h2){ i.dataset.h2 = 1; i.innerHTML = h2Ic(b.dataset.k === 'facil' ? 'puzle' : 'llama'); } });
  // resumen: «7 / 9 regiones» · barra · «82.0% · 104 combates»
  const S = document.getElementById('rSum');
  if(S){ const big = S.querySelector('.rs-big'), bar = S.querySelector('.rs-bar i'), sp = S.querySelector(':scope > span');
    const m = sp && sp.textContent.match(/(\d+)\s*de\s*(\d+)/), pct = m && +m[2] ? (+m[1] / +m[2] * 100) : 0;
    if(big && !big.dataset.h2){ big.dataset.h2 = 1; big.insertAdjacentHTML('afterbegin', h2Ic('estrella_med', 'big')); }
    if(sp && m) sp.textContent = `${pct.toFixed(1)}% · ${m[2]} combates`; }
  // «Continúa aquí»
  const F = document.querySelector('#rFeat .rfeat');
  if(F){ const h = F.querySelector('h2'), n = h ? h.textContent.trim() : '', k = H2_REG[n];
    if(k){ F.style.setProperty('--h2map', h2Url(H2_PANO.has(k) ? `c_${k}.webp?v=1` : `r_${k}.webp?v=1`)); F.classList.toggle('h2pano', H2_PANO.has(k)); }
    const go = F.querySelector('.rf-go'); if(go && !go.dataset.h2){ go.dataset.h2 = 1; go.innerHTML = /Repasar/.test(go.textContent) ? '↻' : '▶'; go.title = /Repasar/.test(go.title || go.textContent) ? 'Repasar' : 'Continuar'; } }
  // tarjetas de región
  document.querySelectorAll('#rgrid .rcard').forEach(c => {
    const n = (c.querySelector('h3') || {}).textContent || '', k = H2_REG[n.trim()];
    if(k) c.style.setProperty('--h2map', h2Url(`r_${k}.webp?v=1`));
    const b = c.querySelector('.rbadge');
    if(b){ if(b.classList.contains('done')) b.textContent = '✓ COMPLETADA'; else if(b.classList.contains('now')) b.textContent = 'En curso'; else b.style.display = 'none'; }
    const l = c.querySelector('.rlock'); if(l && !l.dataset.h2){ l.dataset.h2 = 1; l.innerHTML = h2Ic('candado'); }
  });
  // barra de abajo
  let bot = document.getElementById('h2Bot');
  if(!bot){ bot = document.createElement('div'); bot.id = 'h2Bot'; bot.className = 'h2bot'; const g = document.getElementById('rgrid'); g.after(bot); }
  const t = document.getElementById('rTower'), all = document.querySelectorAll('#rgrid .rcard.done').length === document.querySelectorAll('#rgrid .rcard').length;
  setTimeout(h2Marcos, 0);
  bot.innerHTML = `<span>${all ? '¡Has completado todas las regiones!' : 'Completa las regiones para desbloquear nuevas aventuras.'}</span>` + (t && t.textContent ? `<small>${t.textContent}</small>` : '');
}

// ---------------- LIGA (pantalla de cada región) ----------------
if(H2.on && typeof ligaRender === 'function'){ const o = ligaRender; ligaRender = function(){
  const r = o.apply(this, arguments);
  try{ h2Liga(); }catch(e){ console.warn('historia2', e); }
  return r; }; }
function h2Liga(){
  h2Volver('btnBack1', 'Regiones');
  const L = document.querySelector('#lgNew .lg'); if(!L) return;
  const k = H2_REG[save.region];
  // título con alas
  const h1 = L.querySelector('.lg-top h1');
  if(h1){ const sm = h1.querySelector('small'), modo = sm ? sm.textContent : '', dif = /F[aá]cil/.test(modo);
    const nombre = h1.firstChild && h1.firstChild.nodeType === 3 ? h1.firstChild.textContent : h1.textContent.replace(modo, '');
    h1.outerHTML = h2Titulo(esc(nombre.trim()), `<span class="h2tit-m">${h2Ic(dif ? 'puzle' : 'llama')}${esc(modo)}</span>`); }
  // contadores de arriba con iconos
  const ics = ['medalla', 'corona', 'estrella'];
  L.querySelectorAll('.lg-prog span').forEach((s, i) => { if(!s.dataset.h2){ s.dataset.h2 = 1; s.insertAdjacentHTML('afterbegin', h2Ic(ics[i] || 'estrella')); } });
  // el recuadro grande: fondo del castillo y, detrás del rival, el balcón de su región
  const H = L.querySelector('.lg-hero');
  if(H && k) H.style.setProperty('--h2por', h2Url(`b_${k}.webp?v=1`));   // balcón de la región (balcones.png)
  const kd = L.querySelector('.lg-kind'); if(kd && !kd.dataset.h2){ kd.dataset.h2 = 1; kd.innerHTML = h2Ic('corona') + kd.innerHTML.replace(/^♛\s*/, ''); }
  const rt = L.querySelector('.lg-rt small'); if(rt && !rt.dataset.h2){ rt.dataset.h2 = 1; rt.textContent = '· ' + rt.textContent; }
  const go = L.querySelector('.lg-go'); if(go && !go.dataset.h2){ go.dataset.h2 = 1; go.innerHTML = '<b>▶</b> ' + go.textContent.replace('¡COMBATIR!', '¡Combatir!'); }
  // títulos de los paneles con la Poké Ball
  const h3 = L.querySelector('.lg-road h3'); if(h3 && !h3.dataset.h2){ h3.dataset.h2 = 1; h3.innerHTML = h2Ic('pokeball') + '<span>' + h3.textContent + '</span><i class="h2deco"></i>'; }
  const crown = L.querySelector('.lg-n.ch .crown'); if(crown) crown.innerHTML = h2Ic('corona');
  const th = document.querySelector('#tower .stt-h h2'); if(th && !th.dataset.h2){ th.dataset.h2 = 1; th.innerHTML = h2Ic('pokeball') + '<span>' + th.textContent + '</span><i class="h2deco"></i>'; }
  setTimeout(h2Marcos, 0);
  // su equipo: la cara del HUD en vez del sprite
  L.querySelectorAll('.lg-balls canvas[data-d]').forEach(cv => h2Cara(cv, cv.dataset.d));
  const eb = document.getElementById('btnTeam'); if(eb && !eb.dataset.h2){ eb.dataset.h2 = 1; eb.innerHTML = h2Ic('lapiz') + '<span>' + eb.textContent.replace(/^[^A-Za-zÁÉÍÓÚáéíóú]+/, '') + '</span>'; }
}

// ---------------- TU EQUIPO (abajo de la Liga): retrato del HUD, iconos de tipo e icono del objeto ----------------
// retrato = el mismo del combate (assets/pokemon/<nº>/caras/Normal.png, js/caras.js); si no existe, se queda el dibujo de antes
if(H2.on && typeof buildStory === 'function'){ const o = buildStory; buildStory = function(){
  const r = o.apply(this, arguments);
  try{ h2Equipo(); }catch(e){ console.warn('historia2', e); }
  return r; }; }
function h2Equipo(){
  setTimeout(h2Marcos, 0);
  document.querySelectorAll('#teamBar .card').forEach((d, i) => {
    const id = team[i], m = id != null && mon(id); if(!m || d.dataset.h2 == id) return; d.dataset.h2 = id; d.classList.add('h2eq');
    const cv = d.querySelector('canvas'); if(cv) h2Cara(cv, m.dex || id);
    const ty = d.querySelector('.tt');
    if(ty){ ty.title = m.types.map(t => (typeof TYPE_ES !== 'undefined' && TYPE_ES[t]) || t).join(' / ');
      ty.innerHTML = m.types.map(t => `<img class="h2tipo" src="assets/iconos/tipos/${t}.png" alt="${t}">`).join(''); }
    const it = d.querySelector('.ti'), ob = save.equip && save.equip[id];
    if(it){ if(ob && ITEMS[ob]){ it.title = ITEMS[ob].n; it.innerHTML = `<img class="h2obj" src="${imgOf(ob)}" alt="${esc(ITEMS[ob].n)}">`; }
      else { it.title = 'Sin objeto'; it.innerHTML = '<i class="h2sinobj"></i>'; } }
  });
}

// pone la cara del HUD (assets/pokemon/<nº>/caras/Normal.png) delante del lienzo y lo esconde; si no hay cara, se queda el lienzo
function h2Cara(cv, dex){
  if(!cv || cv.dataset.h2c || typeof CARPETA === 'undefined') return; cv.dataset.h2c = 1;
  const im = new Image(); im.className = 'h2cara'; im.alt = '';
  im.onload = () => { cv.style.display = 'none'; }; im.onerror = () => im.remove();
  im.src = `${CARPETA}/${parseInt(dex)}/caras/Normal.png`; cv.before(im);
}
