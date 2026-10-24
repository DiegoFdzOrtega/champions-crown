"use strict";
/* =====================================================================
   19) PANTALLA DE VICTORIA: recompensas con icono
   Cuando ganas un combate (Historia o Campo de Entrenamiento) la pantalla #result enseña:
     - el retrato del rival vencido y el título,
     - una tarjeta por cada recompensa (icono pequeño, "+cantidad" que sube contando y lo que tienes ahora),
     - etiquetas con lo demás (EVs, trofeo, siguiente rival, dificultad superada...).
   Los datos salen de giveReward() (teams.js), que deja lo que se ha dado en `lastReward`. No inventa nada: si una victoria no da recompensa, no hay tarjetas.
   Funciones: victoryScreen(o) · resultClear() (derrota: vuelve a la pantalla de texto sencilla)
     o = {title, sub, rewards:lastReward, chips:[{t, c}], leader, path}   (leader/path = retrato del rival, como en el combate)
   Para añadir un tipo de recompensa nuevo: ponle nombre en REWARD_NAMES (teams.js) y su aspecto en RW_LOOK (abajo).
   ===================================================================== */
const RW_LOOK = {                                   // aspecto de cada recompensa: color · icono (bitmap de ICONS, o la imagen del objeto) · lo que tienes ahora
  tickets:   {c:'#ff3ea5', icon:'ticket', own:() => save.tickets,       lab:'Tiradas de Gachapon'},
  bp:        {c:'#ffcc33', icon:'coin',   own:() => save.bp,            lab:'Puntos de Batalla'},
  chapa:     {c:'#ffcc33', item:'chapa',  own:() => held('chapa'),      lab:'Chapas Doradas'},
  chapaplata:{c:'#c9d6f5', item:'chapaplata', own:() => held('chapaplata'), lab:'Chapas Plateadas'}
};

function resultClear(){                             // derrota (o antes de una victoria): quita tarjetas y etiquetas de la victoria anterior
  const inner = document.querySelector('#result .inner'); inner.classList.remove('win');
  ['rPortrait', 'rBanner', 'vGrid', 'rChips'].forEach(id => { const e = $(id); if(e) e.remove(); });
  $('rText').classList.remove('hide');
}

function rwIcon(id, col){                           // icono pequeño de una recompensa
  const L = RW_LOOK[id] || {}, box = document.createElement('div'); box.className = 'ico';
  const fallback = () => { const c = document.createElement('canvas'); bitmap(c, ICONS[L.icon] || ICONS.coin, col); box.innerHTML = ''; box.appendChild(c); };
  if(L.item){ const im = new Image(); im.alt = ''; im.src = imgOf(L.item); im.onerror = fallback; box.appendChild(im); }
  else fallback();
  return box;
}

function victoryScreen(o){
  resultClear();
  const inner = document.querySelector('#result .inner'), btns = $('rBtns'); inner.classList.add('win');
  const mk = (tag, cls, id) => { const e = document.createElement(tag); e.className = cls; if(id) e.id = id; return e; };
  // retrato del rival vencido + cartel
  const L = o.leader && typeof leaderImg === 'function' ? leaderImg(o.leader, o.path) : null;
  const banner = mk('div', 'vic-banner', 'rBanner');
  if(L && L.src){ const p = mk('img', 'vic-portrait', 'rPortrait'); p.alt = ''; p.src = L.src; p.onerror = () => p.remove(); inner.insertBefore(p, $('rTitle')); }
  banner.textContent = '★ VICTORIA ★'; inner.insertBefore(banner, $('rTitle'));
  $('rTitle').textContent = o.title; $('rText').textContent = o.sub || ''; $('rText').classList.toggle('hide', !o.sub);
  // tarjetas de recompensa
  const R = o.rewards && o.rewards.list && o.rewards.list.length ? o.rewards : null;
  if(R){
    const grid = mk('div', 'vic-grid', 'vGrid');
    const ORD = ['tickets', 'bp', 'chapa', 'chapaplata'], rank = id => ORD.includes(id) ? ORD.indexOf(id) : 99;      // siempre en el mismo orden: tiradas · BP · chapas
    R.list.slice().sort((a, b) => rank(a[0]) - rank(b[0])).forEach(([id, n], i) => {
      const L2 = RW_LOOK[id] || {c:'#3ea6ff', lab:REWARD_NAMES[id] || id, own:() => 0}, card = mk('div', 'rwc');
      card.style.setProperty('--c', L2.c); card.style.setProperty('--i', i);
      card.appendChild(rwIcon(id, L2.c));
      const num = mk('b', 'num'); num.textContent = '+' + n; card.appendChild(num);
      const lab = mk('span', 'lab'); lab.textContent = L2.lab || REWARD_NAMES[id]; card.appendChild(lab);
      const own = mk('small', 'own'); own.textContent = 'Ahora tienes ' + L2.own(); card.appendChild(own);
      if(id === 'tickets' && R.dbl){ const x = mk('em', 'x2'); x.textContent = '¡PRIMERA DEL DÍA! ×' + DAILY.firstWinMult; card.appendChild(x); }
      grid.appendChild(card);
      card.setAttribute('role', 'group'); card.setAttribute('aria-label', `+${n} ${L2.lab || REWARD_NAMES[id]}. Ahora tienes ${L2.own()}` + (id === 'tickets' && R.dbl ? `. ¡Primera victoria del día: tickets x${DAILY.firstWinMult}!` : ''));   // el valor final también está aquí (lectores de pantalla y pruebas)
      const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches, dur = 700;   // el número sube contando desde 0 (empieza cuando la pantalla ya se ve y su tarjeta ha salido)
      if(!reduce){ num.textContent = '+0'; let t0 = null; const tick = () => { if(!card.isConnected) return; if(!card.offsetParent){ requestAnimationFrame(tick); return; } if(t0 === null) t0 = performance.now() + 250 + i * 140 + 200;
        const u = Math.max(0, Math.min(1, (performance.now() - t0) / dur)); num.textContent = '+' + Math.round(n * (1 - Math.pow(1 - u, 3))); if(u < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
    });
    inner.insertBefore(grid, btns);
  }
  // etiquetas con lo demás
  if(o.chips && o.chips.length){
    const chips = mk('div', 'rchips', 'rChips');
    o.chips.forEach(c => { const e = mk('span', 'rchip'); e.style.setProperty('--c', c.c || '#3ea6ff'); e.textContent = c.t; chips.appendChild(e); });
    inner.insertBefore(chips, btns);
  }
}
