"use strict";
/* =====================================================================
   EQUIPO DE 6 · ESCENARIO CON PEDESTALES (se monta sobre la vista nueva de js/teamhub.js)
   - Centro: la ilustración assets/fondos/equipo_pedestales.webp (1672 × 941) con 6 pedestales. Cada Pokémon del equipo está de pie en el suyo
     y se mueve en su sitio (su animación de quieto). Encima: nº, nombre y tipos. El nº 1 lleva corona (sale primero).
     Clic = verlo a la derecha · arrastrar uno sobre otro = cambiarlos de puesto · arrastrar desde la colección = ponerlo en ese pedestal.
   - Derecha: pestañas «Pokémon» (ficha del elegido: objeto, ataques, estadísticas, debilidades) y «Análisis» (lo de siempre).
   - Botón «Tabla de tipos»: tabla 6 × 18 con lo que le hace a cada uno un ataque de cada tipo.
   ===================================================================== */
const HB6 = {img: 'assets/fondos/equipo_pedestales.webp?v=1', w: 1672, h: 941,
  up: .8,                                                                             // [AJUSTE] cuánto se sube la imagen (0 = arriba del todo visible, 1 = se ve la parte de abajo)
  ped: [[280, 653], [482, 603], [705, 578], [970, 578], [1188, 603], [1390, 653]],   // [AJUSTE] centro de la cara de arriba de cada pedestal (píxeles de la imagen)
  sel: null, tab: 'mon', raf: 0, place: null};
// estrellas de la imagen que brillan (x, y, tamaño) y nubes que pasan (y, ancho, velocidad, opacidad) — en píxeles de la imagen
const HB6_STARS = [[165,33,9],[1436,70,7],[1560,138,6],[824,159,6],[681,27,6],[140,121,6],[373,75,6],[748,321,5],[1232,161,5],[1030,296,5],[1023,247,5],[943,315,5],[1449,156,4],[439,262,4],[1390,206,4],[1193,282,4],[653,136,4],[615,317,4],[1275,62,4],[876,261,4],[88,56,4],[538,281,3],[344,209,3],[258,107,3],[1357,163,3],[1028,140,3]];
const HB6_CLOUDS = [[255, 260, 9, .55], [300, 340, 6, .5], [345, 220, 11, .45], [470, 300, 7, .4], [505, 380, 5, .45], [205, 200, 13, .35]];
const hb6Spr = d => { const M = hbMega(d); return M ? M.folder : d; };

// ---- Estructura: se añade a la de teamhub.js ----
{ const o = hbBuild; hbBuild = function(){
    o.apply(this, arguments);
    const st = $('hbStage'); ['hbLines'].forEach(id => { const e = $(id); if(e) e.remove(); }); const em = st.querySelector('.hb-emb'); if(em) em.remove();
    const sc = document.createElement('div'); sc.id = 'hb6Scene'; sc.className = 'hb6-scene'; st.insertBefore(sc, st.firstChild);
    const fx = document.createElement('canvas'); fx.id = 'hb6Fx'; fx.className = 'hb6-fx'; sc.after(fx);
    const tb = document.createElement('div'); tb.className = 'hb6-tabs'; tb.innerHTML = '<button id="hb6Mx" class="hb-btn mini" title="Qué le hace a cada uno un ataque de cada tipo">▦ Tabla de tipos</button>'; st.appendChild(tb);
    const mx = document.createElement('div'); mx.id = 'hb6Table'; mx.className = 'hb6-table hide'; st.appendChild(mx);
    $('hb6Mx').onclick = () => { const t = $('hb6Table'); t.classList.toggle('hide'); if(!t.classList.contains('hide')) hb6Matrix(); };
    mx.onclick = e => { if(e.target.closest('[data-act="close"]')) mx.classList.add('hide'); };
    // derecha: pestañas
    const R = document.querySelector('#tmHub .hb-right');
    const tabs = document.createElement('div'); tabs.className = 'hb6-rt'; tabs.innerHTML = '<button data-t="mon" class="on">Pokémon</button><button data-t="ana">Análisis</button>';
    const det = document.createElement('section'); det.id = 'hb6Det'; det.className = 'hb-panel hb6-det';
    R.insertBefore(det, R.firstChild); R.insertBefore(tabs, R.firstChild); R.classList.add('t-mon');
    tabs.onclick = e => { const b = e.target.closest('[data-t]'); if(!b) return; HB6.tab = b.dataset.t; tabs.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); R.classList.toggle('t-mon', HB6.tab === 'mon'); };
    det.addEventListener('click', ddClick); det.addEventListener('keydown', ddKey);
    det.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if(!b || e.target.closest('.idd')) return; const d = HB6.sel; if(!d) return;
      const a = b.dataset.act; if(a === 'data') openData(d); else if(a === 'rm'){ HB6.sel = null; removeMon(d); } else if(a === 'lead') placeAt(d, 0); });
    // pedestales: clic, arrastrar
    const cards = $('hbCards');
    cards.addEventListener('click', e => { const c = e.target.closest('.hb6-mon'); if(!c) return; const d = +c.dataset.d, i = +c.dataset.i;
      if(hb.pick && hb.pick !== d){ placeAt(hb.pick, i); hb.pick = null; return; }
      if(d){ HB6.sel = d; hb6Mark(); hb6Det(); document.querySelector('#tmHub .hb6-rt [data-t="mon"]').click(); } });
    window.addEventListener('resize', () => { if(hb.built && hbOn()) hb6Place(); });
  }; }

// ---- Coloca la ilustración (cubre el centro) y a cada Pokémon sobre su pedestal ----
function hb6Place(){
  const st = $('hbStage'), sc = $('hb6Scene'); if(!st || !sc || !st.offsetWidth) return;
  const hub = $('tmHub'), T = hub ? Math.max(0, Math.round(st.getBoundingClientRect().top - hub.getBoundingClientRect().top)) : 0;   // la ilustración sube hasta arriba del todo (detrás de la barra del título): sin franja negra encima
  const W = st.clientWidth, H = st.clientHeight + T, s = Math.max(W / HB6.w, H / HB6.h), ox = (W - HB6.w * s) / 2, oy = Math.max(H - HB6.h * s, Math.min(0, (H - HB6.h * s) * HB6.up));
  [sc, $('hb6Fx')].forEach(e => { if(e){ e.style.top = -T + 'px'; e.style.height = H + 'px'; } });
  sc.style.backgroundSize = `${HB6.w * s}px ${HB6.h * s}px`; sc.style.backgroundPosition = `${ox}px ${oy}px`;
  HB6.place = {s, ox, oy, T};
  $('hbCards').querySelectorAll('.hb6-mon').forEach(c => { const [px, py] = HB6.ped[+c.dataset.i]; c.style.left = (ox + px * s) + 'px'; c.style.top = (oy - T + py * s) + 'px'; c.style.setProperty('--k', s / .64); });
}
hbBgFit = function(){ hb6Place(); };
hbLines = function(){};

// ---- Los 6 Pokémon ----
hbCards = function(){
  if(HB6.sel && !team.includes(HB6.sel)) HB6.sel = null; if(!HB6.sel) HB6.sel = team[0] || null;
  $('hbCards').innerHTML = HB6.ped.map((_, i) => {
    const d = team[i];
    if(!d) return `<div class="hb6-mon empty${hb.pick ? ' can' : ''}" data-i="${i}"><div class="hb6-tag"><i class="hb6-n">${i + 1}</i><b>${hb.pick ? 'Poner aquí' : 'Vacío'}</b><small>${hb.pick ? esc(mon(hb.pick).name) : 'arrastra un Pokémon'}</small></div><div class="hb6-plus">＋</div></div>`;
    const m = mon(d), M = hbMega(d), ty = M ? M.types : m.types;
    return `<div class="hb6-mon${hb.pick ? ' can' : ''}" data-d="${d}" data-i="${i}" draggable="true" style="--c1:${TC[ty[0]]}" title="Clic: ver sus datos · arrástralo sobre otro para cambiarlos de puesto">
      <div class="hb6-tag"><i class="hb6-n">${i === 0 ? '♛' : i + 1}</i><b>${esc(M ? M.form : m.name)}${!M && save.shiny.includes(d) && useShiny(d) ? ' ⭐' : ''}</b><small>${ty.map(t => `<u style="background:${TC[t]}">${TYPE_ES[t]}</u>`).join('')}</small></div>
      <canvas width="200" height="200" data-spr="${hb6Spr(d)}"></canvas></div>`;
  }).join('');
  hb6Place(); hb6Mark(); hb6Det(); hb6Loop();
};
function hb6Mark(){ $('hbCards').querySelectorAll('.hb6-mon').forEach(c => c.classList.toggle('sel', +c.dataset.d === HB6.sel && !!HB6.sel)); }
// arrastrar (lo mismo que hacían las cartas)
{ const o = hbBuild; hbBuild = function(){
    o.apply(this, arguments); const cards = $('hbCards');
    cards.addEventListener('dragstart', e => { const c = e.target.closest('.hb6-mon[data-d]'); if(!c) return; e.stopPropagation(); e.dataTransfer.setData('text/plain', 'slot:' + c.dataset.i); e.dataTransfer.effectAllowed = 'move'; c.classList.add('dragging'); }, true);   // (antes que el de las cartas viejas, que cancelaba el arrastre)
    cards.addEventListener('dragend', () => cards.querySelectorAll('.dragging,.drop').forEach(c => c.classList.remove('dragging', 'drop')));
    cards.addEventListener('dragover', e => { const c = e.target.closest('.hb6-mon'); if(c){ e.preventDefault(); c.classList.add('drop'); } });
    cards.addEventListener('dragleave', e => { const c = e.target.closest('.hb6-mon'); if(c) c.classList.remove('drop'); });
    cards.addEventListener('drop', e => { const c = e.target.closest('.hb6-mon'); if(!c) return; e.preventDefault(); e.stopPropagation(); c.classList.remove('drop');
      const v = e.dataTransfer.getData('text/plain'), to = +c.dataset.i; if(v.startsWith('slot:')){ hbSwap(+v.slice(5), to); return; } const d = +v; if(d) placeAt(d, to); }, true);
  }; }

// ---- Animación: cada Pokémon se mueve en su sitio ----
function hb6Loop(){
  if(HB6.raf) return;
  const step = () => {
    const v = $('teamv');
    if(!v || v.classList.contains('hide') || !v.classList.contains('hubv')){ HB6.raf = 0; return; }
    const t = performance.now() / 1000;
    hb6Sky(t);
    $('hbCards').querySelectorAll('canvas[data-spr]').forEach((cv, i) => {
      const sp = cv.dataset.spr, dex = isNaN(+sp) ? sp : +sp, shiny = !isNaN(+sp) && useShiny(+sp), c = cv.getContext('2d');
      c.clearRect(0, 0, cv.width, cv.height);
      const im = sheet(dex, 'Idle', shiny); const I = im.ok ? im.info : (sheet(dex, 'Idle', false).ok ? sheet(dex, 'Idle', false).info : null); if(!I) return;
      const k = typeof szK === 'function' ? Math.max(.8, Math.min(1.5, szK(dex, I))) : 1;
      let s = 3.4 * k; s = Math.min(s, (cv.height * .96) / Math.max(8, I.foot - I.top + 2), (cv.width * .98) / I.fw);
      drawFrame(c, dex, 'Idle', t + i * .37, 0, cv.width / 2, cv.height - 4 - I.foot * s, s, 0, shiny);
    });
    HB6.raf = requestAnimationFrame(step);
  };
  HB6.raf = requestAnimationFrame(step);
}

// ---- Vida del fondo: nubes que pasan despacio y estrellas que brillan poco a poco ----
function hb6Sky(t){
  const cv = $('hb6Fx'), P = HB6.place; if(!cv || !P) return;
  const W = cv.clientWidth, H = cv.clientHeight; if(cv.width !== W || cv.height !== H){ cv.width = W; cv.height = H; }
  const c = cv.getContext('2d'); c.clearRect(0, 0, W, H); c.imageSmoothingEnabled = false;
  const X = x => P.ox + x * P.s, Y = y => P.oy + y * P.s, px = Math.max(2, Math.round(3 * P.s));
  // nubes: bultos de píxeles lila oscuro que cruzan de izquierda a derecha y vuelven a entrar
  HB6_CLOUDS.forEach(([cy, cw, sp, op], i) => {
    const span = HB6.w + cw * 2, cx = ((t * sp + i * 397) % span) - cw;
    for(let k = 0; k < 7; k++){
      const bx = cx + (k - 3) * cw * .16, by = cy + Math.sin(k * 1.7 + i) * 10 - (k === 3 || k === 2 ? 14 : 0), rw = cw * (.22 + .1 * Math.sin(k * 2.3 + i)), rh = rw * .42;
      c.globalAlpha = op * .85; c.fillStyle = '#3a3478';
      for(let yy = -rh; yy < rh; yy += px / P.s){ const ww = rw * Math.sqrt(Math.max(0, 1 - (yy / rh) ** 2)); c.fillRect(Math.round(X(bx - ww) / px) * px, Math.round(Y(by + yy) / px) * px, Math.round(ww * 2 * P.s / px) * px, px); }
      c.globalAlpha = op * .6; c.fillStyle = '#7a72c8';
      for(let yy = -rh * .9; yy < -rh * .2; yy += px / P.s){ const ww = rw * .8 * Math.sqrt(Math.max(0, 1 - (yy / rh) ** 2)); c.fillRect(Math.round(X(bx - ww) / px) * px, Math.round(Y(by + yy) / px) * px, Math.round(ww * 2 * P.s / px) * px, px); }
    }
  });
  // estrellas: cruz de luz que se enciende y apaga despacio
  HB6_STARS.forEach(([x, y, z], i) => {
    const a = Math.pow(.5 + .5 * Math.sin(t * (.35 + (i % 5) * .08) + i * 1.9), 2); if(a < .05) return;
    const cx = X(x), cy = Y(y), L = (z * 1.6 + 3) * P.s * (.6 + .4 * a), w = Math.max(1, Math.round(P.s * 1.4));
    c.globalAlpha = a * .9; c.fillStyle = '#e8f0ff'; c.fillRect(cx - L, cy - w / 2, L * 2, w); c.fillRect(cx - w / 2, cy - L, w, L * 2);
    c.globalAlpha = a * .5; c.fillStyle = '#9ac4ff'; const g = w * 2.5; c.fillRect(cx - g / 2, cy - g / 2, g, g);
  });
  c.globalAlpha = 1;
}

// ---- Ficha del Pokémon elegido (derecha) ----
const HB6_SLOT = ['Golpe · clic izq.', 'Disparo · clic der.', 'Mejora · Q', 'Fuerte · E'];
function hb6Det(){
  const el = $('hb6Det'); if(!el) return; const d = HB6.sel; el.dataset.d = d || '';
  if(!d){ el.innerHTML = '<h3>Pokémon</h3><p class="hb6-none">Elige un Pokémon de los pedestales para ver sus datos.</p>'; return; }
  const m = mon(d), M = hbMega(d), ty = M ? M.types : m.types, i = team.indexOf(d), hw = typeof hwOf === 'function' ? hwOf(d) : null;
  const mv = movesOf(d), nat = natureOf(d) || [], L = {hp:'PS', atk:'Ataque', def:'Defensa', spa:'At. Esp.', spd:'Def. Esp.', spe:'Velocidad'}, C = {hp:'#e8503a', atk:'#ffc83a', def:'#4ccf6a', spa:'#3ea6ff', spd:'#8a7aff', spe:'#ff5aa0'};
  const ico = (t, c) => typeof tIco === 'function' ? tIco(t, c) : '';
  const weak = Object.keys(CH).map(t => [t, eff(t, ty)]).filter(([, v]) => v > 1).sort((a, b) => b[1] - a[1]);
  const good = Object.keys(CH).filter(t => mv.some(x => MOVES[x] && eff(MOVES[x].t, [t]) > 1));
  const tot = STAT_KEYS.reduce((a, k) => a + realStat(d, k), 0), ab = abilityOf(d);
  el.innerHTML = `<div class="hb6-hero" style="--t1:${TC[ty[0]]};--t2:${TC[ty[1] || ty[0]]}">
      <canvas id="hb6Spr" width="120" height="120"></canvas>
      <div class="hb6-hi"><h3>${i === 0 ? '♛ ' : `${i + 1} · `}${esc(M ? M.form : m.name)}</h3>
        <span class="hb6-no">#${pad3(m.dex)}${hw ? ` · ${fmtAltura(hw[0])} · ${fmtPeso(hw[1])}` : ''}</span>
        <span class="hb6-ty">${ty.map(t => `<u style="background:${TC[t]}">${ico(t)}${TYPE_ES[t]}</u>`).join('')}</span>
        ${typeof ribStrip === 'function' ? `<span class="hb6-rb">${ribStrip(d).replace(/class="rbstrip"[^>]*>/, 'class="hb6-rbs">')}</span>` : ''}</div></div>
    <div class="hb6-cards"><div><small>Habilidad</small><b>${esc(ab)}</b><p>${esc(typeof abilDesc === 'function' ? abilDesc(ab) : '')}</p></div>
      <div><small>Naturaleza</small><b>${esc(nat[0] || '')}</b><p>${nat[1] ? `<span class="nu">▲ ${L[nat[1]]}</span> <span class="nd">▼ ${L[nat[2]]}</span>` : 'Neutra'}</p></div></div>
    ${itemDd(d)}
    <h4>Ataques</h4><div class="hb6-mv">${mv.map((n, k) => { const t = (MOVES[n] || {}).t || ty[0];
      return `<div style="--c:${TC[t] || '#888'}">${ico(t, 'hb6-mi')}<span><b>${esc(n)}</b><small>${HB6_SLOT[k] || ''}</small></span>${typeof catIco === 'function' ? catIco(k + 1, n).replace(/<\/?span[^>]*>/g, '').replace(/>[^<]*$/, '>') : ''}</div>`; }).join('')}</div>
    <h4>Estadísticas <small>Total ${tot}</small></h4><div class="hb6-st">${STAT_KEYS.map(k => { const v = realStat(d, k), ar = nat[1] === k ? '<em class="nu">▲</em>' : nat[2] === k ? '<em class="nd">▼</em>' : '';
      return `<span>${L[k]}${ar}</span><i><s style="width:${Math.min(100, v / 2.2)}%;background:${C[k]}"></s></i><b>${v}</b>`; }).join('')}</div>
    <div class="hb6-ws"><div class="bad"><span>✖ Débil a</span>${weak.length ? weak.map(([t, v]) => `<em title="${TYPE_ES[t]}${v >= 4 ? ' ×4' : ''}">${ico(t)}${v >= 4 ? '<i>×4</i>' : ''}</em>`).join('') : ' nada'}</div>
      <div class="ok"><span>✔ Eficaz contra</span>${good.length ? good.map(t => `<em title="${TYPE_ES[t]}">${ico(t)}</em>`).join('') : ' —'}</div></div>
    <div class="hb6-ab"><button class="hb-btn" data-act="data">📋 Datos y ataques</button>${i > 0 ? '<button class="hb-btn" data-act="lead">♛ Hacer líder</button>' : ''}<button class="hb-btn" data-act="rm" title="Quitar del equipo">✕ Quitar</button></div>`;
  const cv = $('hb6Spr'); if(cv && typeof paintSprite === 'function') paintSprite(cv, M ? (M.folder || d) : d, {sc: 3, fit: 110, shiny: typeof useShiny === 'function' && useShiny(d)});
}

// ---- Tabla de tipos ----
function hb6Matrix(){
  const T = Object.keys(CH), rows = team.map(d => { const M = hbMega(d), m = mon(d); return {d, n: M ? M.form : m.name, ty: M ? M.types : m.types}; });
  const cell = v => v >= 4 ? '<td class="x4">×4</td>' : v >= 2 ? '<td class="x2">×2</td>' : v === 0 ? '<td class="z">0</td>' : v <= .25 ? '<td class="q">¼</td>' : v < 1 ? '<td class="h">½</td>' : '<td></td>';
  $('hb6Table').innerHTML = `<div class="hb6-tb"><h3>Tabla de tipos <small>cómo le afecta a cada uno un ataque de…</small><button class="hb-btn mini" data-act="close">✕</button></h3>
    <div class="hb6-tw"><table><tr><th></th>${T.map(t => `<th style="background:${TC[t]}">${hbAb(t)}</th>`).join('')}</tr>
    ${rows.map(r => `<tr><td class="nm"><canvas width="48" height="48" data-d="${r.d}"></canvas>${esc(r.n)}</td>${T.map(t => cell(eff(t, r.ty))).join('')}</tr>`).join('')}
    <tr class="tot"><td class="nm">Débiles · resisten</td>${T.map(t => { const w = rows.filter(r => eff(t, r.ty) > 1).length, s = rows.filter(r => eff(t, r.ty) < 1).length; return `<td><em class="${w >= 3 ? 'hot' : ''}">${w || ''}</em>${w && s ? '·' : ''}<i>${s || ''}</i></td>`; }).join('')}</tr></table></div>
    <p class="hb6-leg"><b class="x4"></b>×4 <b class="x2"></b>×2 <b class="h"></b>½ <b class="q"></b>¼ <b class="z"></b>inmune · abajo: cuántos son débiles (rojo) y cuántos resisten (verde); en rojo fuerte si son 3 o más</p></div>`;
  $('hb6Table').querySelectorAll('canvas').forEach(c => paintSprite(c, +c.dataset.d, {sc: 4, fit: 46, shiny: useShiny(+c.dataset.d)}));
}
{ const o = hbRender; hbRender = function(){ o.apply(this, arguments); if(hb.built && $('hb6Table') && !$('hb6Table').classList.contains('hide')) hb6Matrix(); }; }
