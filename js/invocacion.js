"use strict";
/* =====================================================================
   INVOCACIÓN: tiradas de ENTRENADORES (como los deseos de Genshin Impact)
   - Datos: js/invdata.js (INV_DATA). Imágenes: carpeta «Sprites entrenadores/», sprites de Pokémon Showdown y sus artistas.
   - Rangos: Común · Raro · Épico · Legendario. Repetidos = BP (INV_TIER.dup).
   - Banners: «Estándar» (Estrella azul, iconos/estrella.webp) y uno TEMÁTICO que cambia CADA DÍA (a medianoche, hora de España) (Estrella rosa, iconos/estrella_t.webp).
     En el temático, al salir un Épico o Legendario hay un 50 % de que sea uno de los 3 destacados.
   - Garantías: un Épico o mejor cada 10 tiradas como mucho, y un Legendario a las 80 (desde la 66 la probabilidad sube).
   - Lo que sacas se usa como PERSONAJE en la tarjeta de entrenador y en el panel VS (Perfil › Entrenador, o «Usar» en la colección).
     Se guarda como save.gender = 'i:<archivo>' (vspanel.js lo entiende).
   - Las Estrellas se ganan en el Alto Mando y el Campeón (teams.js · REWARD_BOSS) y en los logros (achievements.js). Se guardan en save.items.estrella / estrella_t.
   ===================================================================== */
const INV_DIR = 'Sprites entrenadores/';
const INV_TIER = {
  C: {n:'Común',      st:3, c:'#5aa8ff', dup:15,  p:.625},
  R: {n:'Raro',       st:4, c:'#b36bff', dup:40,  p:.28},
  E: {n:'Épico',      st:5, c:'#ffcc33', dup:120, p:.08},
  L: {n:'Legendario', st:6, c:'#ff7ad9', dup:400, p:.015}
};
const INV_RANK = {C:0, R:1, E:2, L:3};
const INV_PITY = {e:10, l:80, soft:65};
const INV_LIST = INV_DATA.map(([f, t, tags, n, v]) => ({f, t, tags, n, v, full: v ? `${n} · ${v}` : n}));
const INV_BY = Object.fromEntries(INV_LIST.map(x => [x.f, x]));
const invUrl = f => INV_DIR + encodeURIComponent(f) + '.png';
const invHas = (x, tag) => { if(!tag) return true; for(let i = 0; i < x.tags.length; i += 2) if(x.tags.substr(i, 2) === tag) return true; return false; };
const INV_THEMES = [
  {tag:'ch', n:'Campeones de la Liga', d:'Los más fuertes de cada región, con sus versiones Masters.', c1:'#ffcc33', c2:'#7a4a00'},
  {tag:'vi', n:'Villanos',             d:'Jefes y reclutas de los equipos malvados.',                 c1:'#ff4d6d', c2:'#3a0a1a'},
  {tag:'am', n:'Alto Mando',           d:'Los cuatro guardianes de cada Liga.',                       c1:'#a35cff', c2:'#22084a'},
  {tag:'pa', n:'Pasarela',             d:'Trajes especiales: Concursos, festival, uniformes…',        c1:'#ff7ad9', c2:'#4a0a3a'},
  {tag:'gy', n:'Líderes de Gimnasio',  d:'Líderes y capitanes de todas las regiones.',                c1:'#4ccf6a', c2:'#08321a'},
  {tag:'he', n:'Héroes y rivales',     d:'Protagonistas y rivales de todos los juegos.',               c1:'#3ea6ff', c2:'#0a1e4a'},
  {tag:'re', n:'Retro',                d:'Versiones clásicas de cada generación.',                    c1:'#ffb35a', c2:'#3a1e08'},
  {tag:'an', n:'Anime',                d:'Personajes y versiones de la serie.',                       c1:'#ff9a3a', c2:'#3a1a08'}
];
const INV_EPOCH = Date.UTC(2026, 0, 5) - 3600000;                         // medianoche en España (UTC+1): los banners cambian cada día a esa hora
const INV_DAY = 86400000;
const invDay = () => Math.floor((Date.now() - INV_EPOCH) / INV_DAY);
const invTheme = () => INV_THEMES[((invDay() % INV_THEMES.length) + INV_THEMES.length) % INV_THEMES.length];
function invSeeded(seed){ let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function invFeatured(th){                                                 // los 3 destacados del día (los mismos para todos los jugadores)
  const pool = INV_LIST.filter(x => invHas(x, th.tag) && !invHas(x, 'ma')), R = invSeeded(invDay() * 97 + 13);
  const src = pool.map(x => [x, R()]).sort((a, b) => (INV_RANK[b[0].t] - INV_RANK[a[0].t]) || (a[1] - b[1])).map(p => p[0]);   // los de más rango primero (barajados dentro de cada rango)
  const seen = new Set(), out = [];
  for(const x of src){ const b = x.f.split('-')[0]; if(seen.has(b)) continue; seen.add(b); out.push(x); if(out.length === 3) break; }   // 3 personajes distintos
  return out;
}
// Banner MASTERS: las versiones Masters SOLO salen aquí. Cada día hay 3 disponibles (van rotando por todas: INV_MA_ROT) y salen al sacar un Legendario.
const INV_MA_ROT = (() => { const L = INV_LIST.filter(x => invHas(x, 'ma')), R = invSeeded(20261105); return L.map(x => [x, R()]).sort((a, b) => a[1] - b[1]).map(p => p[0]); })();
const invMaWeek = () => { const n = INV_MA_ROT.length, w = ((invDay() % Math.ceil(n / 3)) + Math.ceil(n / 3)) % Math.ceil(n / 3); return [0, 1, 2].map(i => INV_MA_ROT[(w * 3 + i) % n]); };
const INV_BANNERS = () => { const th = invTheme(); return [
  {id:'thm', cur:'estrella_t', n:th.n, d:th.d, tag:th.tag, c1:th.c1, c2:th.c2, feat:invFeatured(th)},
  {id:'ma', cur:'estrella_t', n:'Pokémon Masters', d:'Las versiones Masters solo salen en este banner, y cada día hay 3 distintas.', tag:null, ma:true, c1:'#7af0ff', c2:'#08304a', feat:invMaWeek()},
  {id:'std', cur:'estrella', n:'Invocación estándar', d:'Pueden salir todos los entrenadores (menos los Masters). Siempre disponible.', tag:null, c1:'#3ea6ff', c2:'#0a1a3a', feat:invFeatured({tag:''})}
]; };

// ---- Partida ----
function invSave(){
  const s = save.inv && typeof save.inv === 'object' ? save.inv : {};
  if(!s.own || typeof s.own !== 'object') s.own = {};
  if(!s.pity || typeof s.pity !== 'object') s.pity = {};
  ['std', 'thm', 'ma'].forEach(k => { const p = s.pity[k] || {}; s.pity[k] = {e: Math.max(0, +p.e || 0), l: Math.max(0, +p.l || 0)}; });
  s.n = Math.max(0, +s.n || 0);
  Object.keys(s.own).forEach(f => { if(!INV_BY[f]){ save.bp += 120 * s.own[f]; delete s.own[f]; if(save.gender === 'i:' + f) save.gender = 'm'; } });   // entrenadores retirados del juego (parejas...): se devuelven en BP
  if(!s.t0) s.t0 = Date.now();             // t0 = cuándo llegó la Invocación a esta partida (los logros reclamados antes se pagan en el regalo)
  save.inv = s; return s;
}
const invOwns = f => !!(save.inv && save.inv.own && save.inv.own[f]);
const invCount = () => Object.keys(invSave().own).filter(f => INV_BY[f]).length;
function invGift(){                                                       // la primera vez: 10 Estrellas azules y 3 rosas, y las de los logros que ya tenías reclamados
  const s = invSave(); if(s.gift) return;
  let b = 10, t = 3;
  if(typeof ACHIEVEMENTS !== 'undefined') ACHIEVEMENTS.forEach(a => { const g = achGet(a.id); if(g.claimed && g.date < s.t0){ if(a.secret) t++; else b++; } });   // (los reclamados después ya dieron su Estrella)
  save.items.estrella = held('estrella') + b; save.items.estrella_t = held('estrella_t') + t; s.gift = 1; persist();
  toast(`✦ ¡Invocación abierta! Regalo: ${b} Estrellas azules y ${t} rosas (incluye las de tus logros).`);
}

// ---- Una tirada ----
function invPick(list){ return list[Math.floor(Math.random() * list.length)]; }
function invRoll(bn){
  const s = invSave(), P = s.pity[bn.id]; P.e++; P.l++;
  const lr = P.l >= INV_PITY.l ? 1 : P.l > INV_PITY.soft ? INV_TIER.L.p + (P.l - INV_PITY.soft) * .06 : INV_TIER.L.p;
  const r = Math.random();
  let t = r < lr ? 'L' : (P.e >= INV_PITY.e || r < lr + INV_TIER.E.p) ? 'E' : r < lr + INV_TIER.E.p + INV_TIER.R.p ? 'R' : 'C';
  if(t === 'L'){ P.l = 0; P.e = 0; } else if(t === 'E') P.e = 0;
  const all = INV_LIST.filter(x => x.t === t && !invHas(x, 'ma'));          // los Masters no salen en los banners normales
  let x = null;
  if(bn.ma && t === 'L') x = invPick(bn.feat);                               // banner Masters: el Legendario es uno de los 3 del día
  else if(bn.tag){
    const ft = bn.feat.filter(y => y.t === t), tp = all.filter(y => invHas(y, bn.tag));
    if((t === 'E' || t === 'L') && ft.length && Math.random() < .5) x = invPick(ft);
    else if(tp.length && Math.random() < .5) x = invPick(tp);
  }
  if(!x) x = invPick(all);
  const dup = invOwns(x.f);
  s.own[x.f] = (s.own[x.f] || 0) + 1; s.n++;
  if(dup) save.bp += INV_TIER[t].dup;
  return {x, t, dup, bp: dup ? INV_TIER[t].dup : 0};
}
function invPull(bn, n){
  if(held(bn.cur) < n){ toast(`Te faltan ${n - held(bn.cur)} ${bn.cur === 'estrella' ? 'Estrellas azules' : 'Estrellas rosas'}. Se ganan en el Alto Mando, el Campeón y los logros.`); return; }
  save.items[bn.cur] = held(bn.cur) - n; if(save.items[bn.cur] <= 0) delete save.items[bn.cur];
  const res = []; for(let i = 0; i < n; i++) res.push(invRoll(bn));
  persist(); refreshHud(); invAnim(res);
}

// ---- Pantalla ----
let invSel = 'thm';
function openInv(){
  invGift();
  const B = INV_BANNERS(), bn = B.find(b => b.id === invSel) || B[0], s = invSave(), P = s.pity[bn.id];
  const left = INV_DAY - ((Date.now() - INV_EPOCH) % INV_DAY), lh = Math.floor(left / 3600000), lm = Math.floor(left % 3600000 / 60000);
  const cuando = lh ? `${lh} h ${lm} min` : `${lm} min`;                // lo que falta para el cambio de medianoche
  const star = (k, n) => `<span class="ivc"><img src="iconos/${k === 'estrella' ? 'estrella' : 'estrella_t'}.webp" alt=""><b>${n}</b></span>`;
  const feat = bn.feat.map((x, i) => { const tt = bn.ma ? 'L' : x.t; return `<figure class="ivf ivf${i}" style="--c:${INV_TIER[tt].c}"><img src="${invUrl(x.f)}" alt=""><figcaption><b>${esc(x.n)}</b>${x.v ? `<small>${esc(x.v)}</small>` : ''}<i>${'★'.repeat(INV_TIER[tt].st)}</i></figcaption></figure>`; }).join('');
  panel(`<div class="iv">
    <div class="iv-top"><h1>Invocación</h1><div class="iv-cur">${star('estrella', held('estrella'))}${star('estrella_t', held('estrella_t'))}<button class="iv-colb" id="ivCol">Colección · ${invCount()} / ${INV_LIST.length}</button></div></div>
    <div class="iv-tabs">${B.map(b => `<button data-b="${b.id}" class="${b.id === bn.id ? 'on' : ''}" style="--c:${b.c1}"><img src="iconos/${b.cur === 'estrella' ? 'estrella' : 'estrella_t'}.webp" alt=""><span>${b.id === 'thm' ? 'Hoy' : b.id === 'ma' ? '3 cada día' : 'Permanente'}<b>${esc(b.n)}</b></span></button>`).join('')}</div>
    <div class="iv-ban" style="--c1:${bn.c1};--c2:${bn.c2}">
      <div class="iv-bt"><span class="k">${bn.id === 'thm' ? `Banner del día · cambia en ${cuando}` : bn.id === 'ma' ? `Rotación diaria · cambian en ${cuando}` : 'Banner permanente'}</span><h2>${esc(bn.n)}</h2><p>${esc(bn.d)}</p>
        ${bn.id === 'thm' ? '<p class="up">+ Más probabilidad de los 3 destacados al sacar un Épico o Legendario.</p>' : bn.id === 'ma' ? `<p class="up">Cada Legendario es uno de estos 3. Hay ${INV_MA_ROT.length} versiones Masters: van saliendo de 3 en 3.</p>` : ''}
        <div class="iv-pity"><span>Épico garantizado en <b>${Math.max(1, INV_PITY.e - P.e)}</b></span><span>Legendario garantizado en <b>${Math.max(1, INV_PITY.l - P.l)}</b></span></div></div>
      <div class="iv-feat">${feat}</div>
    </div>
    <div class="iv-go">
      <button class="iv-pull" data-n="1"><span>Invocar ×1</span><em><img src="iconos/${bn.cur === 'estrella' ? 'estrella' : 'estrella_t'}.webp" alt=""> ×1</em></button>
      <button class="iv-pull x10" data-n="10"><span>Invocar ×10</span><em><img src="iconos/${bn.cur === 'estrella' ? 'estrella' : 'estrella_t'}.webp" alt=""> ×10</em></button>
    </div>
    <p class="iv-rates">Probabilidades base: <b style="color:${INV_TIER.L.c}">Legendario 1,5 %</b> · <b style="color:${INV_TIER.E.c}">Épico 8 %</b> · <b style="color:${INV_TIER.R.c}">Raro 28 %</b> · <b style="color:${INV_TIER.C.c}">Común 62,5 %</b> · <b style="color:#7af0ff">Los Masters solo salen en su banner (al sacar Legendario)</b> · Repetido: +${INV_TIER.C.dup} / ${INV_TIER.R.dup} / ${INV_TIER.E.dup} / ${INV_TIER.L.dup} BP según el rango.</p>
    <p class="iv-cred">Sprites de entrenadores: <a href="https://play.pokemonshowdown.com/sprites/trainers/" target="_blank" rel="noopener">Pokémon Showdown</a> y sus artistas · Pokémon © Nintendo / Game Freak / The Pokémon Company.</p>
  </div>`);
  $('panelBody').classList.add('wide');
  document.querySelectorAll('.iv-tabs button').forEach(b => b.onclick = () => { invSel = b.dataset.b; openInv(); });
  document.querySelectorAll('.iv-pull').forEach(b => b.onclick = () => invPull(bn, +b.dataset.n));
  $('ivCol').onclick = () => openInvCol();
}

// ---- Filtros (los usan la Colección y Perfil › Entrenador) ----
const INV_TAGS = [['ch', 'Campeones'], ['am', 'Alto Mando'], ['gy', 'Líderes'], ['vi', 'Villanos'], ['he', 'Héroes'], ['ma', 'Masters'], ['pa', 'Pasarela'], ['an', 'Anime'], ['re', 'Retro']];
const invFilt = (F, own) => INV_LIST.filter(x => (!own || invOwns(x.f)) && (!F.t || x.t === F.t) && (!F.g || invHas(x, F.g))
  && (!F.b || invBuffs(x.f).length) && (!F.q || x.full.toLowerCase().includes(F.q)))
  .sort((a, b) => (invOwns(b.f) - invOwns(a.f)) || (INV_RANK[b.t] - INV_RANK[a.t]) || a.full.localeCompare(b.full));
function invFiltHtml(F, own){
  const n = (k, v) => INV_LIST.filter(x => (!own || invOwns(x.f)) && (k === 't' ? x.t === v : invHas(x, v))).length;
  const chip = (k, v, name, c, cnt) => `<button data-fk="${k}" data-fv="${v}" class="${F[k] === v ? 'on' : ''}" style="--c:${c}">${name}${cnt != null ? ` <small>${cnt}</small>` : ''}</button>`;
  return `<div class="ivf-bar"><input class="ivf-q" placeholder="Buscar entrenador..." value="${esc(F.q)}">
      <button data-fk="b" data-fv="1" class="ivf-buff${F.b ? ' on' : ''}" style="--c:#4ccf6a" title="Entrenadores que potencian a algún Pokémon de tu equipo">Potencian a mi equipo <small>${INV_LIST.filter(x => (!own || invOwns(x.f)) && invBuffs(x.f).length).length}</small></button></div>
    <div class="ivf-row"><span>Rango</span>${chip('t', '', 'Todos', '#8fb3e8')}${['L', 'E', 'R', 'C'].map(t => chip('t', t, INV_TIER[t].n, INV_TIER[t].c, own ? n('t', t) : `${INV_LIST.filter(x => x.t === t && invOwns(x.f)).length}/${n('t', t)}`)).join('')}</div>
    <div class="ivf-row"><span>Tipo</span>${chip('g', '', 'Todos', '#8fb3e8')}${INV_TAGS.map(([g, nm]) => chip('g', g, nm, '#ffcc33', n('g', g))).join('')}</div>`;
}
function invFiltBind(root, F, redraw){
  const q = root.querySelector('.ivf-q');
  q.oninput = () => { F.q = q.value.trim().toLowerCase(); clearTimeout(invFiltBind.t); invFiltBind.t = setTimeout(() => { redraw(); const q2 = root.querySelector('.ivf-q'); if(q2){ q2.focus(); q2.setSelectionRange(q2.value.length, q2.value.length); } }, 250); };
  root.querySelectorAll('[data-fk]').forEach(b => b.onclick = () => { const k = b.dataset.fk, v = b.dataset.fv; F[k] = k === 'b' ? !F.b : (F[k] === v ? '' : v); redraw(); });
}
const invBuffTxt = f => { const I = invBuffInfo(f); return (I.L ? 'Potencia a: ' + I.L.slice(0, 6).map(d => mon(d) ? mon(d).name : d).join(', ') : 'Potencia a los tipo ' + I.T.map(t => TYPE_ES[t] || t).join(' y ')) + ` (${invPct(I.B)})`; };
function invUse(f){ save.gender = 'i:' + f; persist(); if(typeof fpPublish === 'function') fpPublish();
  const L = invBuffs(f); toast(`Personaje: ${INV_BY[f].full}.` + (L.length ? ` Potencia a ${L.map(d => mon(d).name).join(', ')} de tu equipo (${invPct(invBuffInfo(f).B)}).` : ' Sale en tu tarjeta y en el panel VS.')); }

// ---- Colección ----
const invColF = {q:'', t:'', g:'', b:false};
function openInvCol(){
  const s = invSave(), list = invFilt(invColF, false), cur = save.gender;
  panel(`<div class="iv ivcol"><div class="iv-top"><h1>Colección de entrenadores</h1><div class="iv-cur"><span class="ivn">${invCount()} / ${INV_LIST.length}</span><button class="iv-colb" id="ivBack">← Invocación</button></div></div>
    <div class="ivf" id="ivF">${invFiltHtml(invColF, false)}</div>
    <div class="ivcol-g">${list.slice(0, 240).map(x => { const o = invOwns(x.f), on = cur === 'i:' + x.f, bt = invBuffTxt(x.f), bf = o && invBuffs(x.f).length;
      return `<div class="ivcc${o ? '' : ' no'}${on ? ' on' : ''}" style="--c:${INV_TIER[x.t].c}" title="${esc(bt)}"><img loading="lazy" src="${invUrl(x.f)}" alt=""><b>${o ? esc(x.n) : '???'}</b><small>${o ? esc(x.v || INV_TIER[x.t].n) : INV_TIER[x.t].n}</small>${bf ? '<span class="ivbf" title="Potencia a tu equipo">▲</span>' : ''}${o ? `<span class="ivx">×${s.own[x.f]}</span><button data-use="${esc(x.f)}">${on ? '✓ En uso' : 'Usar'}</button>` : ''}</div>`; }).join('') || '<p class="help">Ningún entrenador con esos filtros.</p>'}</div>
    ${list.length > 240 ? `<p class="help">Mostrando 240 de ${list.length}: busca o filtra para ver los demás.</p>` : ''}
  </div>`);
  $('panelBody').classList.add('wide');
  $('ivBack').onclick = openInv;
  invFiltBind($('ivF'), invColF, openInvCol);
  document.querySelectorAll('[data-use]').forEach(b => b.onclick = () => { invUse(b.dataset.use); openInvCol(); });
}

// ---- Perfil › Entrenador: elegir entre los que tienes, con filtros ----
const invPfF = {q:'', t:'', g:'', b:false};
function invPickRender(box){
  if(!box) return;
  const all = invFilt({}, true);
  if(!all.length){ box.innerHTML = '<p class="help pf-invnone">Los entrenadores que consigas en la <b>Invocación</b> aparecerán aquí.</p>'; return; }
  const list = invFilt(invPfF, true), cur = save.gender, MAX = 60, more = box.dataset.more === '1';
  box.innerHTML = `<h3 class="pf-invh">De la Invocación <small>${all.length}</small></h3><div class="ivf">${invFiltHtml(invPfF, true)}</div>
    <div class="pf-invg">${list.slice(0, more ? 9999 : MAX).map(x => `<button type="button" data-ig="${esc(x.f)}" class="${cur === 'i:' + x.f ? 'on' : ''}" style="--c:${INV_TIER[x.t].c}" title="${esc(x.full + (invBuffTxt(x.f) ? ' · ' + invBuffTxt(x.f) : ''))}">
      <img loading="lazy" src="${invUrl(x.f)}" alt=""><b>${esc(x.n)}</b><small>${esc(x.v || INV_TIER[x.t].n)}</small>${invBuffs(x.f).length ? '<i class="ivbf">▲</i>' : ''}</button>`).join('') || '<p class="help">Ninguno con esos filtros.</p>'}</div>
    ${list.length > MAX && !more ? `<button type="button" class="pf-invmore">Ver los ${list.length}</button>` : ''}
    <p class="help">▲ = potencia a algún Pokémon de tu equipo si lo llevas como personaje: sus Pokémon de los juegos +10 % PS y daño (Masters +15 %); los entrenadores genéricos, a los de su tipo +5 %. Pasa el ratón por encima para verlo. No cuenta en los combates online.</p>`;
  invFiltBind(box, invPfF, () => invPickRender(box));
  const m = box.querySelector('.pf-invmore'); if(m) m.onclick = () => { box.dataset.more = '1'; invPickRender(box); };
  box.querySelectorAll('[data-ig]').forEach(b => b.onclick = () => {
    invUse(b.dataset.ig); box.querySelectorAll('[data-ig]').forEach(x => x.classList.toggle('on', x === b));
    document.querySelectorAll('#genRow button').forEach(x => x.classList.remove('on'));
    if(typeof renderMyCard === 'function') renderMyCard();
  });
}

// ---- Animación (estrella fugaz + revelación) ----
function invAnim(res){
  const best = res.reduce((a, r) => INV_RANK[r.t] > INV_RANK[a] ? r.t : a, 'C'), col = INV_TIER[best].c;
  const o = document.createElement('div'); o.id = 'invOv'; o.className = 'ivov t' + best; o.style.setProperty('--c', col);
  o.innerHTML = `<div class="ivsky"></div><div class="ivmet"><i></i></div><div class="ivflash"></div><div class="ivstage"></div><button class="ivskip">Saltar »</button>`;
  document.body.appendChild(o);
  if(typeof Sfx !== 'undefined') try{ Sfx.play('logro'); }catch(e){}
  let i = -1, done = false;
  const stage = o.querySelector('.ivstage');
  const card = r => `<div class="ivcard t${r.t}" style="--c:${INV_TIER[r.t].c}"><div class="ivglow"></div><img src="${invUrl(r.x.f)}" alt="">
      <div class="ivinfo"><i>${'★'.repeat(INV_TIER[r.t].st)}</i><b>${esc(r.x.n)}</b>${r.x.v ? `<small>${esc(r.x.v)}</small>` : ''}<span class="ivt">${INV_TIER[r.t].n}</span>
      ${r.dup ? `<em class="dup">Repetido · +${r.bp} BP</em>` : '<em class="new">¡NUEVO!</em>'}</div></div>`;
  const summary = () => {
    done = true; o.classList.add('ivdone'); o.querySelector('.ivskip').remove();
    stage.innerHTML = `<div class="ivsum">${res.map(r => `<div class="ivsc t${r.t}" style="--c:${INV_TIER[r.t].c}"><img src="${invUrl(r.x.f)}" alt=""><i>${'★'.repeat(INV_TIER[r.t].st)}</i><b>${esc(r.x.n)}</b>${r.dup ? `<em>+${r.bp} BP</em>` : '<em class="new">NUEVO</em>'}</div>`).join('')}</div>
      <div class="ivsumb"><button id="ivAgain">Volver a la Invocación</button></div>`;
    stage.querySelector('#ivAgain').onclick = close;
  };
  const next = () => {
    if(done) return;
    i++;
    if(i >= res.length){ if(res.length > 1) summary(); else close(); return; }
    stage.innerHTML = card(res[i]) + `<p class="ivhint">${res.length > 1 ? `${i + 1} / ${res.length} · ` : ''}Pulsa para continuar</p>`;
  };
  const close = () => { o.remove(); removeEventListener('keydown', key, true); openInv(); };
  const key = e => { if(e.code === 'Escape'){ e.stopImmediatePropagation(); close(); } else if(e.code === 'Space' || e.code === 'Enter'){ e.preventDefault(); e.stopImmediatePropagation(); if(o.classList.contains('go')) next(); } };
  addEventListener('keydown', key, true);
  o.querySelector('.ivskip').onclick = e => { e.stopPropagation(); if(res.length > 1) summary(); else { i = res.length - 1; next(); } };
  o.onclick = e => { if(!o.classList.contains('go') || e.target.closest('button')) return; next(); };
  setTimeout(() => o.classList.add('hit'), 1500);                           // la estrella llega al centro: destello
  setTimeout(() => { o.classList.add('go'); next(); }, 1900);
}

// ---- Conexiones con el resto del juego ----
{ const _enter = enter; enter = function(k){ if(k === 'inv') return openInv(); return _enter(k); }; }
// Cada logro da también Estrellas: 1 azul (los secretos, 1 rosa). Los que ya tenías reclamados te las dan en el regalo de bienvenida (invGift).
ACHIEVEMENTS.forEach(a => { if(!a.reward) a.reward = {}; if(a.secret) a.reward.estrella_t = (a.reward.estrella_t || 0) + 1; else a.reward.estrella = (a.reward.estrella || 0) + 1; });
invSave();

// ---- Bonus del personaje: si llevas a un entrenador de la Invocación, SUS Pokémon (los que usa en los juegos) van un poco más fuertes ----
// No cuenta en los combates online (pvpTeamDesc), para que la Clasificatoria sea justa.
const INV_BUFF   = {hm:1.10, dm:1.10, defm:1.05, spdm:1};            // personaje con nombre (Azul, Cynthia...): sus Pokémon · +10 % PS · +10 % daño · +5 % resistencia
const INV_BUFF_M = {hm:1.15, dm:1.15, defm:1.08, spdm:1};            // su versión MASTERS: un poco más
const INV_BUFF_G = {hm:1.05, dm:1.05, defm:1.03, spdm:1};            // entrenador genérico (Pescador, Montañero...): los Pokémon del TIPO de su clase, menos
// Entrenadores genéricos → tipos que potencian (por el tipo de Pokémon que usan en los juegos). Los que no están aquí: Normal.
const INV_CLASS_T = {fisherman:['agua'], fisher:['agua'], sailor:['agua', 'lucha'], swimmer:['agua'], swimmerf:['agua'], swimmerf2:['agua'], swimmerm:['agua'], tuber:['agua'], tuberf:['agua'], scubadiver:['agua'], freediver:['agua'], surfer:['agua'],
  triathleteswimmer:['agua'], triathleteswimmerf:['agua'], triathleteswimmerm:['agua'], aquasuit:['agua', 'siniestro'], aquagrunt:['agua', 'siniestro'], aquagruntf:['agua', 'siniestro'], teamaquabeta:['agua', 'siniestro'], teamaquagruntf:['agua', 'siniestro'], teamaquagruntm:['agua', 'siniestro'], parasollady:['agua'], firefighter:['agua'],
  bugcatcher:['bicho'], bugmaniac:['bicho'], hiker:['roca', 'tierra'], ruinmaniac:['tierra', 'roca'], worker:['lucha', 'acero'], worker2:['lucha', 'acero'], workerf:['lucha', 'acero'], workerice:['hielo'], roughneck:['siniestro', 'veneno'], engineer:['acero', 'electrico'],
  birdkeeper:['volador'], skytrainer:['volador'], skytrainerf:['volador'], pilot:['volador'], blackbelt:['lucha'], battlegirl:['lucha'], crushgirl:['lucha'], crushkin:['lucha'], bodybuilder:['lucha'], bodybuilderf:['lucha'], striker:['lucha'], linebacker:['lucha'],
  psychic:['psiquico'], psychicf:['psiquico'], psychicfjp:['psiquico'], clown:['psiquico'], harlequin:['psiquico'], juggler:['psiquico'], medium:['fantasma'], channeler:['fantasma'], hexmaniac:['fantasma'],
  firebreather:['fuego'], kindler:['fuego'], magmasuit:['fuego', 'tierra'], magmagrunt:['fuego', 'tierra'], magmagruntf:['fuego', 'tierra'], teammagmagruntf:['fuego', 'tierra'], teammagmagruntm:['fuego', 'tierra'], flaregrunt:['fuego', 'siniestro'], flaregruntf:['fuego', 'siniestro'],
  guitarist:['electrico'], rocker:['electrico'], gamer:['electrico'], supernerd:['electrico', 'acero'], scientist:['electrico', 'veneno'], scientistf:['electrico', 'veneno'],
  aromalady:['planta'], picnicker:['planta'], gardener:['planta'], pokemonranger:['planta'], pokemonrangerf:['planta'], rancher:['planta', 'normal'], skier:['hielo'], skierf:['hielo'], boarder:['hielo'], acetrainersnow:['hielo'], acetrainersnowf:['hielo'],
  dragontamer:['dragon'], veteran:['dragon'], veteranf:['dragon'], ninjaboy:['veneno'], kunoichi:['veneno', 'fantasma'], kunoichi2:['veneno', 'fantasma'], cueball:['veneno'], biker:['veneno'], burglar:['fuego'],
  punkguy:['siniestro'], punkgirl:['siniestro'], delinquent:['siniestro'], delinquentf:['siniestro'], delinquentf2:['siniestro'], ruffian:['siniestro'], streetthug:['siniestro'], hooligans:['siniestro'],
  rocketgrunt:['veneno'], rocketgruntf:['veneno'], teamrocketgruntf:['veneno'], teamrocketgruntm:['veneno'], rainbowrocketgrunt:['veneno', 'siniestro'], rainbowrocketgruntf:['veneno', 'siniestro'], galacticgrunt:['veneno', 'siniestro'], galacticgruntf:['veneno', 'siniestro'],
  plasmagrunt:['siniestro'], plasmagruntf:['siniestro'], skullgrunt:['veneno', 'siniestro'], skullgruntf:['veneno', 'siniestro'], yellgrunt:['siniestro'], yellgruntf:['siniestro'], stargrunt:['siniestro'], stargruntf:['siniestro'],
  fairytalegirl:['hada'], idol:['hada'], dancer:['hada'], policeman:['fuego'], kimonogirl:['psiquico', 'siniestro'], furisodegirl:['psiquico', 'hada']};
// Nombre en inglés del archivo → id de su equipo en TEAMS (teams.js usa los nombres en español)
const INV_TEAM_KEY = {ltsurge:'lt_surge', blue:'azul', falkner:'pegaso', bugsy:'anton', whitney:'blanca', morty:'morti', chuck:'anibal', jasmine:'yasmina', pryce:'fredo', clair:'debora', will:'mento',
  roxanne:'petra', brawly:'marcial', wattson:'erico', flannery:'candela', winona:'alana', tate:'vitoleti', liza:'vitoleti', juan:'galano', sidney:'sixto', phoebe:'fatima', glacia:'nivea', drake:'dracon', wallace:'plubio',
  roark:'roco', maylene:'brega', crasherwake:'mananti', byron:'aceron', candice:'inverna', volkner:'lectro', aaron:'alecran', bertha:'gaia', flint:'fausto', lucian:'delos', cynthia:'cintia',
  chili:'maiz', cress:'zeo', cilan:'millo', lenora:'aloe', burgh:'camus', elesa:'camila', clay:'yakon', skyla:'gerania', brycen:'junco', shauntal:'anis', grimsley:'aza', marshal:'lotto', caitlin:'catleya', alder:'mirto',
  viola:'violeta', grant:'lino', korrina:'corelia', ramos:'amaro', clemont:'lem', valerie:'valeria', olympia:'astrid', wulfric:'edel', siebold:'narciso', wikstrom:'tileo', drasna:'agata', diantha:'dianta', candela:null};
// Los que no tienen equipo en el juego: sus Pokémon más conocidos
const INV_SIG_X = {
  red:[25, 3, 6, 9, 143, 131, 196], leaf:[3, 6, 9, 133], green:[3, 6, 9, 36], ethan:[157, 154, 160, 25], kris:[154, 157, 160, 222], lyra:[154, 157, 160, 35], silver:[160, 169, 215, 94, 65],
  brendan:[254, 257, 260], may:[254, 257, 260, 267], wally:[282, 475], steven:[376, 306, 344, 346, 348, 227], archie:[319, 382, 342], maxie:[323, 383, 229],
  lucas:[389, 392, 395], dawn:[389, 392, 395, 417], barry:[389, 392, 395, 398], cyrus:[430, 461, 169, 130, 229, 487], mars:[429], jupiter:[454],
  hilbert:[497, 500, 503], hilda:[497, 500, 503], nate:[497, 500, 503], rosa:[497, 500, 503], hugh:[497, 500, 503, 521], cheren:[508, 510], bianca:[518, 497], n:[643, 571, 601, 567], ghetsis:[635, 604], colress:[462, 601],
  calem:[652, 655, 658], serena:[652, 655, 658, 700], shauna:[652, 655, 658], lysandre:[668, 130, 430, 620], sycamore:[3, 6, 9],
  elio:[724, 727, 730, 25], selene:[724, 727, 730], hau:[26, 724, 727, 730], gladion:[773, 169, 448], lillie:[790, 791, 792], lusamine:[793, 36, 229], guzma:[768, 794], plumeria:[757, 452], nanu:[53], hapu:[750],
  victor:[812, 815, 818], gloria:[812, 815, 818], hop:[888, 812, 815, 818], marnie:[861, 877], bede:[858, 214], leon:[6, 887, 681, 612], raihan:[884, 330], milo:[830], nessa:[834], kabu:[851, 59],
  bea:[865, 68], allister:[94], opal:[869, 303], gordie:[839], melony:[131, 584], piers:[862], rose:[879, 884], oleana:[877],
  florian:[908, 911, 914], juliana:[908, 911, 914], nemona:[903, 745], arven:[943, 908], penny:[700, 196, 197], kieran:[1015, 1011], carmine:[1016, 1017], geeta:[983, 970], iono:[939], larry:[398, 975], volo:[487],
  ash:[25, 6, 448, 724, 445], oak:[3, 6, 9], janine:[49]};
const INV_SIG = {};
function invSigOf(f){
  if(INV_SIG[f]) return INV_SIG[f];
  const base = f.split('-')[0];
  let tk = Object.prototype.hasOwnProperty.call(INV_TEAM_KEY, base) ? INV_TEAM_KEY[base] : base, L = [];
  if(tk && typeof TEAMS !== 'undefined' && TEAMS[tk]) L = TEAMS[tk].map(p => p && p.dex).filter(Boolean);
  if(!L.length && INV_SIG_X[base]) L = INV_SIG_X[base];
  if(!L.length && typeof TRAINERS !== 'undefined'){ const t = TRAINERS.find(t => t.id === f || t.id === base); if(t) L = t.dex; }
  return (INV_SIG[f] = [...new Set(L)].filter(d => typeof mon === 'function' && mon(d)));
}
// Qué potencia un entrenador: sus Pokémon (si tiene equipo conocido) o los de un tipo (genéricos)
function invBuffInfo(f){
  const L = invSigOf(f);
  if(L.length) return {L, B: invHas(INV_BY[f], 'ma') ? INV_BUFF_M : INV_BUFF};
  const base = f.split('-')[0], T = INV_CLASS_T[base] || ['normal'];
  return {T, B: INV_BUFF_G};
}
const invMatches = (f, d) => { const I = invBuffInfo(f); if(I.L) return I.L.includes(d); const m = mon(d); return !!m && m.types.some(t => I.T.includes(t)); };
const invBuffs = f => typeof team !== 'undefined' && team ? team.filter(d => invMatches(f, d)) : [];   // los de TU equipo que potencia
const invPct = B => `+${Math.round((B.hm - 1) * 100)} % PS y daño`;
let invNoBuff = false;
function invBuffFor(d){ if(invNoBuff || !invSkin(save.gender) || !invOwns(save.gender.slice(2))) return null; const f = save.gender.slice(2); return invMatches(f, d) ? invBuffInfo(f).B : null; }
{ const _cb = combatBoost; combatBoost = function(d){ const b = _cb(d), B = invBuffFor(d); if(B){ b.hm *= B.hm; b.dm *= B.dm; b.defm *= B.defm; b.spdm *= B.spdm; b.invBuff = true; } return b; }; }
if(typeof pvpTeamDesc === 'function'){ const _pd = pvpTeamDesc; pvpTeamDesc = function(){ invNoBuff = true; try{ return _pd.apply(this, arguments); } finally{ invNoBuff = false; } }; }
