"use strict";
/* =====================================================================
   MENÚ PRINCIPAL NUEVO
   - Barra de arriba: avatar, nombre, rango de la Clasificatoria, iconos (Perfil, Logros, Amigos, Mochila, Cuenta, Ajustes) con avisos y monedas.
   - «Continuar»: el siguiente combate de la Historia en grande (o la Torre Batalla cuando ya has acabado).
   - Tarjetas: JUGAR (Historia, Clasificatoria, Campo, Torre) y COLECCIÓN (Equipo, Pokédex, Gachapon, Tienda).
   - A la derecha: recompensa diaria y notas del parche.
   El menú antiguo sigue en index.html y menu.js: para volver a él, pon MM_NEW = false.
   ===================================================================== */
const MM_NEW = true;
const MM_ICO = {
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  ach: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/>',
  friends: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c3 0 5 2 5 5"/>',
  bag: '<rect x="4" y="7" width="16" height="13" rx="3"/><path d="M9 7V5a3 3 0 0 1 6 0v2M4 12h16"/>',
  account: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 17c.5-2 2-3 3.5-3s3 1 3.5 3M15 10h3M15 14h3"/>',
  guide: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8M12 17v.1"/>',
  set: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'
};
const mmSvg = k => `<svg viewBox="0 0 24 24">${MM_ICO[k]}</svg>`;
const mmIcon = (k, c) => { if(k === 'inv') return 'iconos/estrella.webp'; if(CUR_IMG && (k === 'coin' || k === 'ticket')) return CUR_SRC[k === 'coin' ? 'bp' : 'ticket']; const cv = document.createElement('canvas'); bitmap(cv, ICONS[k], c); return cv.toDataURL(); };
const mmNum = n => Number(n || 0).toLocaleString('es-ES');

// Siguiente combate de la Historia: la primera región abierta que no está terminada
function mmNext(){
  const regs = REGIONS_PLAYED();
  for(let i = 0; i < regs.length; i++){
    const r = regs[i], open = i === 0 || champOf(regs[i - 1]) || !!PREVIEW[r];
    if(!open) return null;
    const fls = FLOORS.map((F, gi) => ({F, gi})).filter(x => x.F.region === r), rec = progOf(r);
    const nx = fls.find(x => x.F.idx >= rec);
    if(nx) return {r, F: nx.F, gi: nx.gi, done: rec, total: fls.length};
  }
  return null;
}
function mmHero(){
  const nx = mmNext(), total = FLOORS.length, done = progTotal();
  if(nx){
    const F = nx.F, reg = String(nx.r).split(' / ').pop(), last = done + 1 >= total;
    const kind = F.kind === 'campeon' ? (/a$/.test(F.tag) ? 'Campeona' : 'Campeón') : F.kind === 'alto' ? 'Alto Mando' : nx.r === 'Alola' ? 'Capitán' : 'Líder';
    const q = typeof LIGA_INFO !== 'undefined' && LIGA_INFO[F.id] && LIGA_INFO[F.id].q;
    const map = new URL('region/' + encodeURIComponent((typeof REGION_IMG !== 'undefined' && REGION_IMG[nx.r]) || nx.r) + '.webp', document.baseURI).href;
    return `<div class="m2-hero" style="--map:url(&quot;${map}&quot;)"><img class="por" id="mmPor" alt="">
      <div class="m2-hi"><span class="k">Continuar · Liga de ${esc(reg)}</span><h2>${kind} ${esc(F.leader)}</h2>
        <p>${nx.F.region === 'Kanto' && nx.F.kind === 'campeon' && !towerOpen() ? '¡Gánale para abrir la Torre Batalla!' : q ? '«' + esc(q) + '»' : `Combate ${nx.done + 1} de ${nx.total} en ${esc(reg)}.`}</p>
        <div class="bar"><i style="width:${Math.min(100, done / total * 100)}%"></i></div>
        <div class="row"><button class="m2-go" data-mm="fight" data-gi="${nx.gi}" data-r="${esc(nx.r)}">¡COMBATIR!</button><button class="m2-link" data-mm="liga" data-r="${esc(nx.r)}">Ver la Liga →</button>
          <small>${done} / ${total} combates · ${save.storyMode === 'facil' ? 'Fácil' : 'Difícil'}</small></div></div></div>`;
  }
  if(towerOpen()){
    const best = (save.tower && save.tower.best) || 0;
    return `<div class="m2-hero tw"><img class="por tw-art" src="${MM_TOWER}" alt="">
      <div class="m2-hi"><span class="k">Continuar · Torre Batalla</span><h2>${best ? 'Supera el piso ' + best : '¡La Torre te espera!'}</h2>
        <p>Has vencido a todas las Ligas. Sube piso a piso: los rivales son cada vez más fuertes y cada piso da premios.</p>
        <div class="row"><button class="m2-go" data-mm="go" data-k="tower">¡SUBIR!</button><small>Récord: piso ${best}</small></div></div></div>`;
  }
  return `<div class="m2-hero"><div class="m2-hi"><span class="k">Historia</span><h2>¡Elige una región!</h2><p>Vence a los líderes, al Alto Mando y al Campeón.</p>
    <div class="row"><button class="m2-go" data-mm="go" data-k="story">JUGAR</button></div></div></div>`;
}
// Ilustraciones grandes de los cuadros del menú (carpeta iconos/). La de la Torre ya está; las demás se ponen solas al añadir el archivo (iconos/mm_equipo.webp...): si no existe, el cuadro queda como siempre.
const MM_TOWER = 'iconos/torre.webp';
const MM_ART = {};                                                                           // (ilustraciones grandes a la derecha de un cuadro: ahora ninguna)
const MM_COL = {team:'iconos/mm_equipo.webp', dex:'iconos/mm_pokedex.webp', gacha:'iconos/mm_gachapon.webp', inv:'iconos/mm_invocacion.webp', shop:'iconos/mm_tienda.webp'};   // cuadros de Colección: la ilustración hace de icono
const MM_HEAD = {story:'iconos/ic_historia.webp', rank:'iconos/ic_rank.webp', campo:'iconos/ic_campo.webp', tower:MM_TOWER, ...MM_COL};     // icono pequeño ilustrado de los cuadros de Jugar (si falta el archivo, vale el de píxeles)
Object.keys(MM_HEAD).forEach(k => { if(k !== 'tower') MM_HEAD[k] += '?v=2'; });         // (v=2: iconos reencuadrados; así el navegador no usa los antiguos guardados)
function mmTile(k, c, name, sub, st, extra, cls){
  const ic = mmIcon(k, c), hd = MM_HEAD[k] ? `<img class="hd${MM_COL[k] ? ' col' : ''}" src="${MM_HEAD[k]}" alt="" onerror="this.onerror=null;this.classList.remove('hd','col');this.src='${ic}'">` : `<img src="${ic}" alt="">`, art = MM_ART[k] ? `<img class="art" src="${MM_ART[k]}" alt="" onerror="this.parentNode.classList.remove('hasart');this.remove()">` : '';
  return `<button class="m2-t ${art ? 'hasart ' : ''}${cls || ''}" style="--c:${c};--ic:url('${ic}')" data-mm="go" data-k="${k}"><span class="h">${hd}<b>${name}</b></span>${sub ? `<small>${sub}</small>` : ''}${extra || ''}<span class="st">${st}</span>${art}</button>`;
}
function mmRender(){
  const m = $('main'); if(!m) return;
  m.classList.add('mm2');
  let d = $('mm2'); if(!d){ d = document.createElement('div'); d.id = 'mm2'; m.appendChild(d); }
  const r = save.ranked || {pts:0, w:0, l:0}, played = (r.w + r.l) > 0 || r.pts > 0, T = typeof rkTier === 'function' ? rkTier(r.pts) : null;
  const ach = typeof achReadyCount === 'function' ? achReadyCount() : 0;
  const fr = typeof cloud !== 'undefined' && cloud.fr && cloud.fr.incoming ? cloud.fr.incoming.length : 0;
  const logged = typeof cloud !== 'undefined' && !!cloud.user;
  const icons = [['profile', 'Perfil', 0], ['ach', 'Logros', ach], ['friends', 'Amigos', fr], ['bag', 'Mochila', 0], ['account', 'Cuenta', 0], ['guide', 'Guía', save.guideSeen ? 0 : '!'], ['set', 'Ajustes', 0]]
    .map(([k, n, b]) => `<button data-mm="go" data-k="${k}" title="${n}" aria-label="${n}">${mmSvg(k)}${b ? `<i>${b}</i>` : ''}<em>${n}</em></button>`).join('');
  const dex = boxCount(), lockT = !towerOpen(), need = towerNeed();
  const nx = mmNext();
  const towerSt = lockT ? '🔒 Sé Campeón de Kanto para abrirla' : `Récord: piso ${(save.tower && save.tower.best) || 0}`;
  const daily = typeof dailyState === 'function' ? dailyState() : null;
  const P = typeof PATCHES !== 'undefined' && PATCHES[0], pNew = P && save.patchSeen !== patchLatest();
  const pItems = P ? P.sections.flatMap(s => s.i).slice(0, 3).map(t => `<li>${esc(String(t).split(/[.:(]/)[0].slice(0, 70))}</li>`).join('') : '';
  d.innerHTML = `
    <div class="m2-top">
      <button class="m2-me" data-mm="go" data-k="profile" title="Perfil"><img class="av" alt="Avatar"><span class="who"><b>${esc(trainerName())}</b>
        <span class="rk">${played && T ? `<img src="${rkImg(T)}" alt="">${T.n} · ${r.pts} PC` : logged ? 'Sin clasificar' : 'Invitado · sin cuenta'}</span></span></button>
      <div class="m2-ic">${icons}</div>
      <div class="m2-cur"><span style="--c:#ffcc33"><img src="${mmIcon('coin', '#ffcc33')}" alt=""><span>${mmNum(save.bp)}<small>Puntos de Batalla</small></span></span>
        <span style="--c:#ff3ea5"><img src="${mmIcon('ticket', '#ff3ea5')}" alt=""><span>${mmNum(save.tickets)}${save.ticketsL ? ` <em>+${save.ticketsL}★</em>` : ''}${save.ticketsS ? ` <em class="s">+${save.ticketsS}✦</em>` : ''}<small>Tickets Gachapon</small></span></span></div>
    </div>
    <div class="m2-body"><div class="m2-left">
      <div class="m2-brand"><img src="icono-180.png?v=2" alt=""><div><h1>CHAMPIONS CROWN</h1><p>ROAD TO CHAMPION · ARENA 2D</p></div></div>
      ${mmHero()}
      <div class="m2-sec">Jugar</div>
      <div class="m2-play">
        ${mmTile('story', '#ffcc33', 'HISTORIA', `${REGIONS_PLAYED().length} regiones · líderes, Alto Mando y Campeón`, `${progTotal()} / ${FLOORS.length} combates`, `<span class="pb"><i style="width:${progTotal() / FLOORS.length * 100}%"></i></span>`)}
        ${mmTile('rank', played && T ? T.c : '#ffcc33', 'CLASIFICATORIA', 'Combates online por rango', played && T ? `${T.n} · ${r.pts} PC` : logged ? 'Sin clasificar' : 'Necesitas una cuenta', played && T ? `<img class="big" src="${rkImg(T)}" alt="">` : '')}
        ${mmTile('campo', '#4ccf6a', 'CAMPO DE ENTRENAMIENTO', 'Entrenadores sin límite: BP, chapas y tiradas', 'Premio en cada victoria')}
        ${mmTile('tower', '#ff9a3a', 'TORRE BATALLA', 'Sube piso a piso: rivales cada vez más fuertes', towerSt, '', lockT ? 'lock' : '')}
      </div>
      <div class="m2-sec">Colección</div>
      <div class="m2-col">
        ${mmTile('team', '#3ea6ff', 'EQUIPO', '', `${team.length} / 3`, `<span class="m2-mini">${team.map(id => `<canvas width="64" height="64" data-d="${id}"></canvas>`).join('')}</span>`)}
        ${mmTile('dex', '#3ea6ff', 'POKÉDEX', '', `${dex} / ${DEX_SHOWN}`, `<span class="pb"><i style="width:${dex / DEX_SHOWN * 100}%"></i></span>`)}
        ${mmTile('gacha', '#ff3ea5', 'GACHAPON', '', `${mmNum(save.tickets)} tickets`)}
        ${typeof openInv === 'function' ? mmTile('inv', '#b36bff', 'INVOCACIÓN', '', `${mmNum((save.items.estrella || 0) + (save.items.estrella_t || 0))} estrellas`) : ''}
        ${mmTile('shop', '#ffcc33', 'TIENDA', '', `${mmNum(save.bp)} BP`)}
      </div>
    </div>
    <div class="m2-right">
      ${daily && daily.pending ? `<button class="m2-daily" data-mm="daily"><span class="gift">🎁</span><span><b>Recompensa diaria · Día ${daily.idx + 1}/7</b><small>Pulsa para recogerla</small></span></button>` : ''}
      ${P ? `<button class="m2-news" data-mm="patch"><span class="h"><span>Notas del parche</span>${pNew ? '<i>NUEVO</i>' : ''}</span><b>${esc(P.v)}</b><ul>${pItems}</ul><span class="a">Ver todas →</span></button>` : ''}
    </div></div>
    <div class="m2-foot">↑ ↓ ← → moverte · ENTER elegir · ESC volver</div>`;
  d.querySelectorAll('canvas[data-d]').forEach(c => paintSprite(c, +c.dataset.d, {sc:2, fit:56, shiny: typeof useShiny === 'function' && useShiny(+c.dataset.d)}));
  const por = $('mmPor'); if(por && nx) loadLeaderInto(por, nx.F.id, () => { por.style.visibility = 'hidden'; });
  refreshAvatars();
}
if(MM_NEW){
  const _refreshHud = refreshHud;
  refreshHud = function(){ _refreshHud(); mmRender(); };
  const _mainKey = mainKey;
  mainKey = function(e){
    const list = [...document.querySelectorAll('#mm2 [data-mm]')]; if(!list.length) return _mainKey(e);
    let i = list.indexOf(document.activeElement);
    const step = {ArrowDown:1, ArrowRight:1, ArrowUp:-1, ArrowLeft:-1}[e.code];
    if(step){ i = i < 0 ? 0 : (i + step + list.length) % list.length; list[i].focus(); e.preventDefault(); }
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('#mm2 [data-mm]'); if(!b) return;
    const a = b.dataset.mm;
    if(a === 'go'){ if(b.dataset.k === 'guide') openGuia(); else enter(b.dataset.k); }
    else if(a === 'fight' || a === 'liga'){
      save.region = b.dataset.r; if(typeof liga !== 'undefined') liga.sel = null;
      if(a === 'fight' && team.length === 3) floorFight(+b.dataset.gi); else goStory();
    }
    else if(a === 'daily') openDaily();
    else if(a === 'patch') patchOpen();
  });
}
