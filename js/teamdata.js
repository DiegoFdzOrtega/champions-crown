"use strict";
/* =====================================================================
   16) FICHA TÉCNICA ("Ver datos") Y PERSONALIZACIÓN de un Pokémon del equipo.
   Es una ventana (#tmData) con 4 vistas:
     main    → estadísticas (base, IV, EV, nivel 50), naturaleza, habilidad y ataques
     nature  → elegir naturaleza nueva (gasta 1 Menta)
     abil    → elegir la otra habilidad (gasta 1 Cápsula de Habilidad)
     moves   → «Cambiar ataque»: ataques actuales, MT compatibles, ataques anteriores que se pueden recuperar, resumen y confirmación
     reset   → confirmar «Restablecer IVs» o «Restablecer EVs» (devuelve las chapas gastadas)
   Los IV se suben directamente con el botón +5 (gasta 1 Chapa Dorada) y los EV con el +10 (gasta 1 Chapa Plateada).
   La lógica (qué se guarda, qué cuesta) está en training.js; aquí solo se dibuja y se pulsan botones.
   ===================================================================== */
const dt = {dex:0, view:'main', slot:1, pick:null, t0:0, lock:0, tr:{iv:{}, ev:{}}};   // tr = barras de entrenamiento a medio mover (aún no aplicadas)
const dtOpen = () => !$('tmData').classList.contains('hide');

function openData(dex){ dt.dex = dex; dt.view = 'main'; dt.pick = null; dt.tr = {iv:{}, ev:{}}; dt.t0 = performance.now(); $('tmData').classList.remove('hide'); renderData(); }
function openDataMoves(dex, slot, pick){ openData(dex); dt.view = 'moves'; dt.slot = slot; dt.pick = pick || null; renderData(); }   // ficha abierta directamente en «Cambiar ataque»
function closeData(quiet){ if(!tm.built) return; $('tmData').classList.add('hide'); if(!quiet) renderTeamSlots(); }
function dataEsc(){ if(dt.view !== 'main'){ dt.view = 'main'; dt.pick = null; renderData(); } else closeData(); }   // Esc: vuelve a la ficha; otra vez, cierra

const natText = n => n[1] ? `▲ ${STAT_NAMES[n[1]]} · ▼ ${STAT_NAMES[n[2]]}` : 'neutra';
const typeChip = t => `<span class="tb" style="background:${TC[t]}">${TYPE_ES[t]}</span>`;
const mult = v => '×' + v.toFixed(2);
const ownedChip = id => `<span class="own-chip"><img class="iimg" src="${imgOf(id)}" alt="">${CONS[id].n} <b>×${held(id)}</b></span>`;

function renderData(){
  const body = {main: DT_NEW ? dataMainNew : dataMainOld, nature: dataNature, abil: dataAbil, moves: dataMoves, reset: dataReset}[dt.view]();
  $('tmDataB').innerHTML = body;
  const c = $('dtSpr'); if(c) paintSprite(c, dt.dex, {sc:5, fit:200, shiny: useShiny(dt.dex)});
}
// El sprite grande de la ficha se anima (solo cuando se ve)
setInterval(() => {
  const c = $('dtSpr'); if(!c || !c.isConnected || !dtOpen()) return;
  const x = c.getContext('2d'); x.clearRect(0, 0, 224, 224); drawFrame(x, dt.dex, 'Idle', (performance.now() - dt.t0) / 1000, 0, 112, 114, 5, 200, useShiny(dt.dex));
}, 120);

// Cabecera común: nombre, tipos, cerrar y cambiar de Pokémon del equipo
function dataHead(){
  const m = mon(dt.dex), r = RAR[m.rar], i = team.indexOf(dt.dex);
  return `<header class="dxh dth"><button data-act="prev" title="Pokémon anterior"${team.length < 2 ? ' disabled' : ''}>◀</button>
    <h1>${esc(m.name)}</h1><span class="rb" style="--c:${r.col}">${r.ic} ${r.n}</span><span class="tbs">${typeBadges(m)}</span>
    <button data-act="next" title="Pokémon siguiente"${team.length < 2 ? ' disabled' : ''}>▶</button>
    <small class="dtn">Hueco ${i + 1}/${team.length}</small><button class="tmclose" data-act="close" title="Cerrar (Esc)">✕ Cerrar</button></header>`;
}

function dataMainOld(){
  const d = dt.dex, m = mon(d), iv = ivOf(d), ev = evOf(d), nat = natureOf(d), ab = abilitiesOf(d), ai = abilIdx(d), cb = combatBoost(d), mv = movesOf(d);
  const chapa = held('chapa'), plata = held('chapaplata'), cap = capOf(d);
  // Izquierda: estadísticas normales (solo se miran). Total = Base + IV + EV (+ naturaleza), todo a nivel 50.
  const pure = (k, i, e) => { const core = Math.floor((2 * m.base[k] + i + Math.floor(e / 4)) * .5); return k === 'hp' ? core + 60 : core + 5; };
  const statRows = STAT_KEYS.map(k => {
    const tag = nat[1] === k ? '<u class="up">▲ +10%</u>' : nat[2] === k ? '<u class="dn2">▼ −10%</u>' : '';
    const b0 = pure(k, 0, 0), pi = pure(k, iv[k], 0) - b0, pe = pure(k, iv[k], ev[k]) - pure(k, iv[k], 0), tot = realStat(d, k), pn = tot - pure(k, iv[k], ev[k]);
    const sg = v => v > 0 ? '+' + v : v < 0 ? '−' + Math.abs(v) : '0';
    return `<tr><th title="Valor base de la especie: ${m.base[k]}">${STAT_NAMES[k]}${tag}</th><td>${b0}</td><td class="pl">${sg(pi)}</td><td class="pl ev">${sg(pe)}</td>
      <td class="fin"><b>${tot}</b>${pn ? `<small class="${pn > 0 ? 'up' : 'dn2'}">${sg(pn)} nat.</small>` : ''}</td></tr>`;
  }).join('');
  // Derecha: entrenamiento (aquí se suben los IVs con Chapas Doradas y los EVs con Chapas Plateadas)
  const ivRows = STAT_KEYS.map(k => trRow('iv', k)).join(''), evRows = STAT_KEYS.map(k => trRow('ev', k)).join('');   // barras deslizantes (ver más abajo)
  const moves = [1, 2, 3, 4].map(s => { const n = mv[s - 1], t = (MOVES[n] || {}).t || m.types[0], ch = (save.mv[d] || {})[s];
    return `<div class="mvrow${ch ? ' chg' : ''}"><span class="sl">${SLOT_NAMES[s]}</span><b>${esc(n)}</b>${typeChip(t)}${ch ? '<em title="Enseñado con un MT">MT</em>' : ''}
      <button data-act="mtview" data-s="${s}" title="Aprender un MT o recuperar un ataque anterior">Cambiar ataque</button></div>`; }).join('');
  return `${dataHead()}
    <div class="dtc">
      <aside class="dtl"><div class="viewer"><canvas id="dtSpr" width="224" height="224"></canvas></div>
        <p class="meta">#${pad(m.dex)} · ${regionOf(m.dex)}</p>
        <div class="owned"><b>Tus mejoras</b>${['chapa', 'chapaplata', 'menta', 'capsula'].map(ownedChip).join('')}
          <button data-act="shop">Ir a la Tienda</button></div></aside>
      <section class="dtr">
        <div class="dtg">
          <div class="dtbox"><h3>Estadísticas <small>(nivel 50)</small></h3>
            <table class="dtt stt"><thead><tr><th></th><th>Base</th><th>+IV</th><th>+EV</th><th>Total</th></tr></thead><tbody>${statRows}</tbody></table>
            <p class="note">Total = Base + IV + EV (y la naturaleza, que sube o baja un 10%). Para subirlas, entrena los IVs y EVs en el apartado de la derecha.</p></div>
          <div class="dtbox"><h3>Entrenamiento</h3>
            <div class="trn iv"><h4>IVs <small>(0-${TRAIN.ivMax} · total ${ivSum(d)}/${TRAIN.ivTotal} · cada Chapa Dorada +${TRAIN.chapaIV})</small></h4>
              ${ivRows}
              <button data-act="rsview" data-w="iv"${cap.gold < 1 ? ' disabled' : ''} title="Vuelve los IV a 0 (el valor inicial de todos los Pokémon) y devuelve las Chapas Doradas gastadas">↺ Restablecer IVs <small>(devuelve ${cap.gold})</small></button></div>
            <div class="trn ev"><h4>EVs <small>(0-${TRAIN.evCap} · total ${evSum(d)}/${TRAIN.evTotal} · cada Chapa Plateada +${TRAIN.chapaEV})</small></h4>
              ${evRows}
              <button data-act="rsview" data-w="ev"${cap.silver < 1 ? ' disabled' : ''} title="Quita los EVs que dieron las Chapas Plateadas (los de combate se quedan) y las devuelve">↺ Restablecer EVs <small>(devuelve ${cap.silver})</small></button></div>
            <div class="trfoot" id="trFoot">${trFoot()}</div></div>
        </div>
        <p class="boost">En combate: PS <b>${mult(cb.hm)}</b> · Daño <b>${mult(cb.dm)}</b> · Velocidad <b>${mult(cb.spdm)}</b> · Resistencia <b>${mult(cb.defm)}</b></p>
        <div class="dinfo dtinfo">
          <p><span>Naturaleza</span> <img class="iimg mi" src="${mintImg(nat)}" alt=""><b>${nat[0]}</b> <small>(${natText(nat)})</small>
            <button data-act="natview"${held('menta') < 1 ? ' disabled title="Necesitas Mentas (Tienda > Mejoras)"' : ''}>Cambiar con Menta</button></p>
          <p><span>Habilidad</span> <b>${esc(ab[ai])}</b> <small>${esc(abilDesc(ab[ai]))}</small>
            <button data-act="abview"${held('capsula') < 1 ? ' disabled title="Necesitas Cápsulas de Habilidad (Tienda > Mejoras)"' : ''}>Cambiar con Cápsula</button></p>
        </div>
        <h3>Ataques ${movesChanged(d) ? '<button class="mini wide" data-act="reset">Restaurar originales</button>' : ''}</h3>
        <div class="dtmv">${moves}</div>
      </section></div>`;
}

// =====================================================================
// FICHA NUEVA (DT_NEW = true): cabecera fija (sprite, naturaleza, habilidad, objeto, valor en combate, tus mejoras)
// y 3 pestañas: Resumen (barras + radar), Entrenar (IV/EV con −/+, barras y presets) y Ataques (tarjetas con daño, energía y recarga).
// La ficha antigua sigue entera en dataMainOld: para volver a ella, pon DT_NEW = false.
// =====================================================================
const DT_NEW = true;
const DT_LT = new Set(['electrico', 'tierra', 'hielo', 'acero', 'normal', 'hada', 'roca', 'bicho', 'planta', 'volador']);     // tipos claros: letra oscura
const dtChip = t => `<span class="tb${DT_LT.has(t) ? ' lt' : ''}" style="background:${TC[t]}">${TYPE_ES[t]}</span>`;
const DT_PRESETS = {                                                     // reparto de EVs (se colocan las barras; se gasta al pulsar «Aplicar»)
  spa:  {n:'Atacante especial', ev:{spa:252, spe:252, hp:6}},
  atk:  {n:'Atacante físico',   ev:{atk:252, spe:252, hp:6}},
  fast: {n:'Rápido',            ev:{spe:252, hp:128, def:128}},
  tank: {n:'Tanque',            ev:{hp:252, def:128, spd:128}}
};
function dtHead(){
  const d = dt.dex, m = mon(d), r = RAR[m.rar], i = team.indexOf(d), nat = natureOf(d), ab = abilitiesOf(d)[abilIdx(d)], cb = combatBoost(d);
  const it = save.equip[d] && ITEMS[save.equip[d]];
  const val = Math.round(((cb.hm + cb.dm + cb.spdm + cb.defm) / 4 - 1) * 100);
  const own = ['chapa', 'chapaplata', 'menta', 'capsula'].map(id => `<span><img class="iimg" src="${imgOf(id)}" alt="">${CONS[id].n} <b>×${held(id)}</b></span>`).join('');
  return `<div class="fd-h"><button class="nav" data-act="prev" title="Pokémon anterior"${team.length < 2 ? ' disabled' : ''}>◀</button><h1>${esc(m.name)}</h1>
      <div class="chips"><span class="rar" style="background:${r.col}">${r.ic} ${r.n}</span>${m.types.map(dtChip).join('')}</div>
      <button class="nav" data-act="next" title="Pokémon siguiente"${team.length < 2 ? ' disabled' : ''}>▶</button>
      <span class="sp">${i >= 0 ? `Hueco ${i + 1}/${team.length}` : ''}</span><button class="close" data-act="close" title="Cerrar (Esc)">✕ Cerrar</button></div>
    <div class="fd-hero"><div class="fd-spr" style="--t1a:${TC[m.types[0]]}55"><span class="no">Nº ${pad(m.dex)} · ${regionOf(m.dex)}</span>${save.fav.includes(d) ? '<span class="fav">★</span>' : ''}<canvas id="dtSpr" width="224" height="224"></canvas></div>
      <div class="fd-info">
        <div class="fd-card"><small>Naturaleza</small><div class="row"><b><img class="iimg mi" src="${mintImg(nat)}" alt=""> ${nat[0]}</b><button class="fd-mini" data-act="natview"${held('menta') < 1 ? ' disabled title="Necesitas Mentas (Tienda › Mejoras)"' : ''}>Cambiar · 1 Menta</button></div>
          <p>${nat[1] ? `<span class="up">▲ ${STAT_NAMES[nat[1]]} +10 %</span> · <span class="dn">▼ ${STAT_NAMES[nat[2]]} −10 %</span>` : 'Neutra: no sube ni baja nada.'}</p></div>
        <div class="fd-card"><small>Habilidad</small><div class="row"><b>${esc(ab)}</b><button class="fd-mini" data-act="abview"${held('capsula') < 1 ? ' disabled title="Necesitas Cápsulas de Habilidad (Tienda › Mejoras)"' : ''}>Cambiar · 1 Cápsula</button></div><p>${esc(abilDesc(ab))}</p></div>
        <div class="fd-card"><small>Objeto equipado</small><div class="row"><b>${it ? `<img class="iimg" src="${imgOf(save.equip[d])}" alt=""> ${esc(it.n)}` : 'Sin objeto'}</b></div><p>${it ? esc(it.d || '') : 'Se equipa desde su hueco del equipo (botón del objeto).'}</p></div>
        <div class="fd-card"><small>Valor en combate</small><div class="row"><b class="${val > 0 ? 'up' : val < 0 ? 'dn' : ''}">${val > 0 ? '+' : ''}${val} %</b></div><p>${val ? 'Media de lo que su entrenamiento y su naturaleza mejoran PS, daño, velocidad y resistencia.' : 'Sin entrenar: entrénalo para que rinda más en combate.'}</p></div>
        <div class="fd-own">${own}<button class="fd-mini shop" data-act="shop">Ir a la Tienda →</button></div>
      </div></div>
    <div class="fd-tabs">${[['sum', 'Resumen'], ['tr', 'Entrenar'], ['mv', 'Ataques']].map(([k, n]) => `<button data-act="tab" data-v="${k}" class="${(dt.tab || 'sum') === k ? 'on' : ''}">${n}${k === 'tr' && (trChapasTotal(d, 'iv') + trChapasTotal(d, 'ev')) ? ' <i class="fd-dot"></i>' : ''}</button>`).join('')}
      <button class="q${dt.help ? ' on' : ''}" data-act="help" title="Ayuda">?</button></div>`;
}
function dtSum(){
  const d = dt.dex, m = mon(d), nat = natureOf(d), cb = combatBoost(d);
  const pure = (k, i, e) => { const core = Math.floor((2 * m.base[k] + i + Math.floor(e / 4)) * .5); return k === 'hp' ? core + 60 : core + 5; };
  const MAXV = 230, iv = ivOf(d), ev = evOf(d);
  const rows = STAT_KEYS.map(k => {
    const base = m.base[k], b0 = pure(k, 0, 0), tot = realStat(d, k), col = base < 50 ? '#e8493a' : base < 80 ? '#f0903a' : base < 100 ? '#e8c33a' : base < 130 ? '#4ccf6a' : '#3ea6ff';
    const bw = Math.min(100, b0 / MAXV * 100), tw = Math.max(0, Math.min(100 - bw, (tot - b0) / MAXV * 100));
    const ar = nat[1] === k ? '<em class="up">▲</em>' : nat[2] === k ? '<em class="dn">▼</em>' : '<em></em>';
    return `<div class="fd-sr" title="Base de la especie ${base} · IV ${iv[k]} · EV ${ev[k]}"><span>${STAT_NAMES[k]}</span><div class="bar"><i style="width:${bw}%;background:${col}"></i><i class="tr" style="width:${tw}%;background-color:${col}"></i></div><b>${tot}</b>${ar}</div>`;
  }).join('');
  const tot = STAT_KEYS.reduce((s, k) => s + realStat(d, k), 0);
  const cx = 125, cy = 112, R = 88, ord = ['hp', 'atk', 'def', 'spe', 'spd', 'spa'], lab = ['PS', 'ATQ', 'DEF', 'VEL', 'DEF.E', 'AT.E'];
  const pt = (i, v) => { const a = -Math.PI / 2 + i * Math.PI / 3; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; };
  const poly = f => ord.map((k, i) => pt(i, Math.min(1, f(k) / MAXV)).map(n => n.toFixed(1)).join(',')).join(' ');
  const tc = TC[m.types[0]];
  const svg = `<svg viewBox="0 0 250 225">${[.25, .5, .75, 1].map(sc => `<polygon points="${ord.map((k, i) => pt(i, sc).join(',')).join(' ')}" fill="none" stroke="#2b4580"/>`).join('')}
    ${ord.map((k, i) => { const [x, y] = pt(i, 1.17); return `<text x="${x}" y="${y + 3}" fill="#8fb3e8" font-size="8" text-anchor="middle">${lab[i]}</text>`; }).join('')}
    <polygon points="${poly(k => pure(k, 0, 0))}" fill="${tc}55" stroke="${tc}" stroke-width="2"/><polygon points="${poly(k => realStat(d, k))}" fill="#ffffff1a" stroke="#fff" stroke-dasharray="4 3" stroke-width="1.5"/></svg>`;
  const best = STAT_KEYS.reduce((a, k) => m.base[k] > m.base[a] ? k : a, 'hp');
  const pc = v => { const p = Math.round((v - 1) * 100); return p ? `<b class="${p > 0 ? 'up' : 'dn'}">${p > 0 ? '+' : ''}${p} %</b>` : '<b>=</b>'; };
  return `<div class="fd-sum"><div class="fd-st"><div class="fd-leg"><span><i style="background:#4ccf6a"></i>Base (nivel 50)</span><span><i style="background:repeating-linear-gradient(45deg,#fff8 0 3px,#fff3 3px 6px)"></i>Entrenamiento (IV + EV)</span><span class="up">▲▼ Naturaleza</span></div>
      ${rows}<div class="fd-tot"><span>Total</span><b>${tot}</b></div></div>
    <div class="fd-rad">${svg}<p>Su punto fuerte es ${{hp:'los <b>PS</b>', atk:'el <b>Ataque</b>', def:'la <b>Defensa</b>', spa:'el <b>Ataque Especial</b>', spd:'la <b>Defensa Especial</b>', spe:'la <b>Velocidad</b>'}[best]}.<br>Discontinua: con tu entrenamiento.</p></div>
    <div class="fd-combat"><span>En combate:</span><span>PS ${pc(cb.hm)}</span><span>Daño ${pc(cb.dm)}</span><span>Velocidad ${pc(cb.spdm)}</span><span>Resistencia ${pc(cb.defm)}</span></div></div>`;
}
function dtTrain(){
  const d = dt.dex, cap = capOf(d), g = trChapasTotal(d, 'iv'), sv = trChapasTotal(d, 'ev');
  const row = (kind, k) => `<div class="fd-trw"><button data-act="trm" data-kind="${kind}" data-k="${k}" title="Bajar">−</button>${trRow(kind, k)}<button data-act="trp" data-kind="${kind}" data-k="${k}" title="Subir (1 chapa)">+</button></div>`;
  const chg = [];
  STAT_KEYS.forEach(k => { ['iv', 'ev'].forEach(kind => { const c = trCfg(kind), cur = c.cur(d, k), t = trWant(d, kind, k); if(t > cur) chg.push(`${kind.toUpperCase()} ${TR_SHORT[k]} ${cur}→${t}`); }); });
  const cost = [g ? `${g} Chapa${g > 1 ? 's' : ''} Dorada${g > 1 ? 's' : ''}` : '', sv ? `${sv} Chapa${sv > 1 ? 's' : ''} Plateada${sv > 1 ? 's' : ''}` : ''].filter(Boolean).join(' y ');
  return `<div class="fd-tr">
    <div class="fd-tc"><h3>IVs <small>${ivSum(d)} / ${TRAIN.ivTotal} · cada + gasta 1 Chapa Dorada (+${TRAIN.chapaIV})</small></h3>${STAT_KEYS.map(k => row('iv', k)).join('')}
      <div class="fd-pre"><button data-act="rsview" data-w="iv"${cap.gold < 1 ? ' disabled' : ''}>↺ Restablecer IVs <small>(devuelve ${cap.gold})</small></button></div></div>
    <div class="fd-tc"><h3>EVs <small>${evSum(d)} / ${TRAIN.evTotal} · cada + gasta 1 Chapa Plateada (+${TRAIN.chapaEV})</small></h3>${STAT_KEYS.map(k => row('ev', k)).join('')}
      <div class="fd-pre">${Object.entries(DT_PRESETS).map(([id, P]) => `<button data-act="preset" data-v="${id}">${P.n}</button>`).join('')}<button data-act="rsview" data-w="ev"${cap.silver < 1 ? ' disabled' : ''}>↺ Restablecer EVs <small>(devuelve ${cap.silver})</small></button></div></div>
    <div class="fd-apply"><span>${chg.length ? 'Sin aplicar: ' + chg.join(' · ') : 'Pulsa + o arrastra una barra. No se gasta nada hasta que pulses «Aplicar».'}</span>
      <button class="undo" data-act="trundo"${chg.length ? '' : ' disabled'}>Deshacer</button><button class="go" data-act="trapply"${chg.length ? '' : ' disabled'}>${cost ? 'Aplicar · gasta ' + cost : 'Aplicar'}</button></div></div>`;
}
function dtMoves(){
  const d = dt.dex, m = mon(d), mv = movesOf(d);
  return `${movesChanged(d) ? '<div class="fd-mvtop"><button class="fd-mini" data-act="reset">↺ Restaurar ataques originales</button></div>' : ''}<div class="fd-mv">${[1, 2, 3, 4].map(s => { const n = mv[s - 1], t = (MOVES[n] || {}).t || m.types[0], M = MV[s], inf = moveInfo(n), ch = (save.mv[d] || {})[s];
    return `<div class="fd-m" style="--t:${TC[t]}"><div class="top"><span class="sl">${SLOT_SHORT[s].toUpperCase()}</span><span class="key">${{1: 'Clic izq.', 2: 'Clic dcho.', 3: 'Q', 4: 'E'}[s]}</span>${ch ? '<span class="mt">MT</span>' : ''}</div>
      <h4>${esc(n)} ${dtChip(t)}</h4>
      <div class="nums"><span>Daño<b>${s === 3 ? '—' : M.dmg}</b></span><span>Energía<b>${M.en}</b></span><span>Recarga<b>${String(M.cd).replace('.', ',')} s</b></span></div>
      <p>${esc(inf.real)}</p><button class="chg" data-act="mtview" data-s="${s}" title="Aprender un MT o recuperar un ataque anterior">Cambiar</button></div>`; }).join('')}</div>`;
}
const DT_HELP = {
  sum: 'Las estadísticas son a nivel 50. Total = Base + IV + EV, y la naturaleza sube un 10 % una y baja un 10 % otra. En combate se nota una parte de esa mejora.',
  tr: 'IV: de 0 a 31 en cada estadística (cada Chapa Dorada +5). EV: hasta 252 en cada una y 510 en total (cada Chapa Plateada +10). Los presets solo colocan las barras: no se gasta nada hasta pulsar «Aplicar». Restablecer devuelve las chapas.',
  mv: 'Cada Pokémon tiene 4 huecos: Golpe (cuerpo a cuerpo), Disparo (a distancia), Mejora (te potencia) y Fuerte (el que más daño hace). Para cambiar uno necesitas un MT de ese hueco o recuperar uno que ya olvidó.'
};
function dataMainNew(){
  const tab = dt.tab || 'sum';
  return `<div class="fd">${dtHead()}${dt.help ? `<p class="fd-help">${DT_HELP[tab]}</p>` : ''}${tab === 'tr' ? dtTrain() : tab === 'mv' ? dtMoves() : dtSum()}</div>`;
}

// ---- Vistas de elección (con barra de confirmación para no gastar un objeto sin querer) ----
function cbar(text){
  return `<div class="cbar">${dt.pick !== null ? `<span>${text}</span><button class="main" data-act="ok">Confirmar</button><button data-act="cancel">Cancelar</button>` : '<span>Elige una opción.</span>'}</div>`;
}
function subHead(title, item){
  return `${dataHead()}<div class="dtsub"><button data-act="back">${dt.view === 'moves' ? '← Cancelar y volver' : '← Volver'}</button><h2>${title}</h2>${item ? ownedChip(item) : ''}</div>`;
}
function dataNature(){
  const d = dt.dex, cur = natureOf(d), cards = NATURES.map((n, i) =>
    `<button class="optb nat${n === cur ? ' cur' : ''}${dt.pick === String(i) ? ' pick' : ''}" data-act="pick" data-v="${i}"${n === cur ? ' disabled' : ''}><img class="iimg" src="${mintImg(n)}" alt=""><b>${n[0]}</b><small>${natText(n)}</small></button>`).join('');
  return `${subHead(`Naturaleza de ${esc(mon(d).name)}: ahora es ${cur[0]}`, 'menta')}<div class="optgrid">${cards}</div>
    ${cbar(dt.pick !== null ? `Gastar 1 Menta para que pase a ser <b>${NATURES[dt.pick][0]}</b> (${natText(NATURES[dt.pick])})` : '')}`;
}
function dataAbil(){
  const d = dt.dex, ab = abilitiesOf(d), cur = abilIdx(d);
  const cards = ab.map((n, i) => `<button class="optb big${i === cur ? ' cur' : ''}${dt.pick === String(i) ? ' pick' : ''}" data-act="pick" data-v="${i}"${i === cur ? ' disabled' : ''}>
    <b>${esc(n)}</b><small>${esc(abilDesc(n))}</small><em>${i === cur ? 'Habilidad actual' : 'Disponible'}</em></button>`).join('');
  return `${subHead(`Habilidad de ${esc(mon(d).name)}`, 'capsula')}<div class="optgrid two">${cards}</div>
    <p class="note">Esta habilidad es la que usa tu Pokémon en combate.</p>
    ${cbar(dt.pick !== null ? `Gastar 1 Cápsula de Habilidad para usar <b>${esc(ab[dt.pick])}</b>` : '')}`;
}
const SLOT_DESC = {1:'Golpe cuerpo a cuerpo', 2:'Disparo a distancia', 3:'Mejora para ti', 4:'Ataque fuerte a distancia'};
const mvType = (d, n) => (MOVES[n] || {}).t || mon(d).types[0];
function mvCard(d, sl, n, cls, tag){
  const q = MV[sl];
  return `<div class="mvc ${cls}"><span class="sl">${SLOT_SHORT[sl]}</span><b>${esc(n)}</b>${typeChip(mvType(d, n))}
    <small>${slotDesc(sl, n)} · Energía ${q.en} · Recarga ${String(q.cd).replace('.', ',')} s</small>${tag ? `<em>${tag}</em>` : ''}</div>`;
}
// «Cambiar ataque»: un hueco concreto. Aquí solo se elige y se muestra; quien decide si se puede aprender es teachCheck() (training.js).
function dataMoves(){
  const d = dt.dex, s = dt.slot, cur = movesOf(d)[s - 1], nm = esc(mon(d).name);
  const now = [1, 2, 3, 4].map(sl => mvCard(d, sl, movesOf(d)[sl - 1], sl === s ? 'tgt' : 'keep', sl === s ? 'Se cambia este' : 'Se queda')).join('');
  const mts = myMTs(s).sort((a, b) => mtMove(a).localeCompare(mtMove(b), 'es'));
  const mtCards = mts.map(id => { const n = mtMove(id), err = teachCheck(dt.dex, n), bad = err === NO_LEARN, known = err === 'Ya conoce ese movimiento.', key = 'mt:' + id;
    return `<button class="optb big mt${bad ? ' bad' : ''}${dt.pick === key ? ' pick' : ''}" data-act="${bad ? 'nolearn' : 'pick'}" data-v="${key}"${known ? ' disabled' : ''}>
      <img class="iimg" src="${imgOf(id)}" alt=""><b>MT ${esc(n)}</b>${typeChip(MOVES[n].t)}<small>Tienes ×${held(id)}</small>
      <em class="${bad ? 'no' : 'yes'}">${bad ? '✕ No compatible' : known ? 'Ya lo conoce' : '✓ Compatible'}</em></button>`; }).join('');
  const rcCards = forgotten(d, s).map(n => { const key = 'rc:' + n, orig = n === origMove(d, s), bad = !orig && !canLearn(d, n);
    return `<button class="optb big rc${bad ? ' bad' : ''}${dt.pick === key ? ' pick' : ''}" data-act="${bad ? 'nolearn' : 'pick'}" data-v="${key}">
      <b>${esc(n)}</b>${typeChip(mvType(d, n))}<small>${orig ? 'Ataque original' : 'Ataque anterior'} · gratis, no gasta MT</small>
      <em class="${bad ? 'no' : 'yes'}">${bad ? '✕ No compatible' : '↺ Recuperar'}</em></button>`; }).join('');
  let bar = `<div class="cbar"><span>Elige un movimiento. No se cambia nada hasta que pulses Confirmar.</span><button data-act="back">Cancelar y volver</button></div>`;
  if(dt.pick){
    const k = dt.pick.slice(0, 2), v = dt.pick.slice(3), nn = k === 'mt' ? mtMove(v) : v;
    bar = `<div class="cbar mtsumbar"><div class="mtsum"><div><em>Aprende</em><b>${esc(nn)}</b>${typeChip(mvType(d, nn))}</div><div><em class="o">Olvida</em><b>${esc(cur)}</b>${typeChip(mvType(d, cur))}</div>
      <small>${k === 'mt' ? `Gasta 1 MT (te quedarán ${held(v) - 1}). ` : 'Es gratis. '}«${esc(cur)}» quedará en «Ataques anteriores» por si quieres recuperarlo.</small></div>
      <button class="main" data-act="ok">Confirmar el cambio</button><button data-act="cancel">Cancelar</button></div>`;
  }
  return `${subHead(`Cambiar ataque de ${nm}: hueco «${SLOT_NAMES[s]}»`)}
    <h3 class="mvh">Ataques de ${nm} ahora</h3><div class="mvcs">${now}</div>
    <h3 class="mvh">Aprender un MT <small>(los de este hueco que tienes)</small></h3>
    ${mts.length ? `<div class="optgrid two">${mtCards}</div>` : `<p class="note big">No tienes ningún MT para este hueco (${SLOT_SHORT[s]}). La Tienda renueva sus MTs cada 24 horas.</p><button data-act="shop">Ir a la Tienda</button>`}
    <h3 class="mvh">Ataques anteriores <small>(recuperarlos es gratis)</small></h3>
    ${rcCards ? `<div class="optgrid two">${rcCards}</div>` : `<p class="note">Todavía no ha olvidado ningún ataque en este hueco.</p>`}
    ${bar}`;
}

function dataReset(){
  const d = dt.dex, c = capOf(d), iv = dt.what === 'iv', n = iv ? c.gold : c.silver, name = iv ? 'Chapas Doradas' : 'Chapas Plateadas';
  let detail;
  if(iv){ const base = save.ivBase[d] || ivOf(d), cur = ivOf(d);
    detail = STAT_KEYS.filter(k => cur[k] !== base[k]).map(k => `${STAT_NAMES[k]} ${cur[k]} → ${base[k]}`).join(' · ') || 'Los IV ya están en 0.'; }
  else{ const cp = evCapOf(d); detail = STAT_KEYS.filter(k => cp[k]).map(k => `${STAT_NAMES[k]} −${cp[k]} EV`).join(' · '); }
  return `${subHead(`Restablecer ${iv ? 'IVs' : 'EVs'} de ${esc(mon(d).name)}`, iv ? 'chapa' : 'chapaplata')}
    <div class="dtinfo"><p><span>Se deshace</span> <small>${detail}</small></p>
      <p><span>Recuperas</span> <b>${n} ${name}</b></p>
      <p class="note">${iv ? 'Vuelven a 0, el valor inicial de todos los Pokémon.' : 'Solo se quitan los EVs que dieron las Chapas Plateadas: los que ganó en combate se quedan.'}</p></div>
    <div class="cbar"><span>¿Restablecer y recuperar <b>${n} ${name}</b>?</span><button class="main" data-act="ok">Restablecer</button><button data-act="back">Cancelar</button></div>`;
}
// ---- Barras de entrenamiento (IV con Chapas Doradas, EV con Chapas Plateadas) ----
// Se arrastra la barra hacia la derecha: la zona rayada es lo que se va a subir y abajo se ve cuántas chapas costará.
// NO se gasta nada hasta pulsar «Aplicar cambios». La lógica real (qué cuesta, topes) sigue en training.js: aquí solo se llama a useChapa / useChapaPlata.
// dt.tr.iv[k] / dt.tr.ev[k] = valor al que quieres llegar (si no hay nada, se queda como está).
const trCfg = kind => kind === 'iv'
  ? {step:TRAIN.chapaIV, cap:TRAIN.ivMax, item:'chapa', cur:(d, k) => ivOf(d)[k]}
  : {step:TRAIN.chapaEV, cap:TRAIN.evCap, item:'chapaplata', cur:(d, k) => evOf(d)[k]};
const trWant = (d, kind, k) => Math.max(trCfg(kind).cur(d, k), dt.tr[kind][k] || 0);
const trChapas = (d, kind, k) => Math.max(0, Math.ceil((trWant(d, kind, k) - trCfg(kind).cur(d, k)) / trCfg(kind).step));
const trChapasTotal = (d, kind) => STAT_KEYS.reduce((s, k) => s + trChapas(d, kind, k), 0);
function trMax(d, kind, k){                                          // valor más alto que se puede alcanzar en este stat (con las chapas y el hueco de EV que dejan los demás)
  const c = trCfg(kind), cur = c.cur(d, k); let others = 0, chOthers = 0;
  STAT_KEYS.forEach(j => { if(j === k) return; others += trWant(d, kind, j) - c.cur(d, j); chOthers += trChapas(d, kind, j); });
  let top = c.cap; if(kind === 'ev') top = Math.min(top, cur + Math.max(0, TRAIN.evTotal - evSum(d) - others));
  return Math.min(top, cur + Math.max(0, held(c.item) - chOthers) * c.step);
}
const TR_SHORT = {hp:'PS', atk:'ATQ', def:'DEF', spa:'AT.E', spd:'DEF.E', spe:'VEL'};     // nombres cortos de las barras (caben en la columna)
function trRow(kind, k){
  const d = dt.dex, c = trCfg(kind), cur = c.cur(d, k), mx = trMax(d, kind, k), t = Math.min(trWant(d, kind, k), mx);
  if(t > cur) dt.tr[kind][k] = t; else delete dt.tr[kind][k];
  return `<div class="trr" data-kind="${kind}" data-k="${k}"><span class="trl" title="${STAT_NAMES[k]}">${TR_SHORT[k]}</span>
    <div class="trs ${kind}" style="--cur:${cur / c.cap * 100}%;--tgt:${t / c.cap * 100}%"><i class="trc"></i><i class="trg"></i>
      <input type="range" min="0" max="${c.cap}" step="1" value="${t}" aria-label="${STAT_NAMES[k]}"${mx <= cur ? ` disabled title="${held(c.item) < 1 && !trChapasTotal(d, kind) ? 'No tienes chapas (Tienda > Mejoras)' : 'Ya está al máximo'}"` : ''}></div>
    <span class="trv">${trValText(d, kind, k)}</span></div>`;
}
function trValText(d, kind, k){
  const c = trCfg(kind), cur = c.cur(d, k), t = trWant(d, kind, k), n = trChapas(d, kind, k);
  return `<b>${cur}</b>${t > cur ? ` → <b class="nw">${t}</b><em><img class="iimg" src="${imgOf(c.item)}" alt="">×${n}</em>` : ''}`;
}
function trFoot(){
  const d = dt.dex, g = trChapasTotal(d, 'iv'), s = trChapasTotal(d, 'ev'), any = g + s > 0;
  const chip = (id, n) => `<img class="iimg" src="${imgOf(id)}" alt=""><b>${n}</b> <small>(tienes ${held(id)})</small>`;
  return `<span class="trcost">${any ? `Coste: ${g ? chip('chapa', g) + ' ' : ''}${s ? chip('chapaplata', s) : ''}` : 'Arrastra una barra hacia la derecha para subir un IV o un EV. No se gasta nada hasta que pulses «Aplicar cambios».'}</span>
    <button data-act="trundo"${any ? '' : ' disabled'}>Deshacer</button><button class="main" data-act="trapply"${any ? '' : ' disabled'}>Aplicar cambios</button>`;
}
function trSync(){                                                    // actualiza las barras sin volver a dibujar la ventana (si no, se soltaría la barra mientras la arrastras)
  const d = dt.dex;
  document.querySelectorAll('#tmDataB .trr').forEach(r => {
    const kind = r.dataset.kind, k = r.dataset.k, c = trCfg(kind), cur = c.cur(d, k), mx = trMax(d, kind, k), t = Math.min(trWant(d, kind, k), mx);
    if(t > cur) dt.tr[kind][k] = t; else delete dt.tr[kind][k];
    const bar = r.querySelector('.trs'), inp = r.querySelector('input');
    bar.style.setProperty('--tgt', t / c.cap * 100 + '%'); inp.value = t; inp.disabled = mx <= cur;
    r.querySelector('.trv').innerHTML = trValText(d, kind, k);
  });
  const f = $('trFoot'); if(f) f.innerHTML = trFoot();
}
document.addEventListener('input', e => {
  const inp = e.target.closest && e.target.closest('#tmDataB .trs input'); if(!inp) return;
  const r = inp.closest('.trr'), kind = r.dataset.kind, k = r.dataset.k, d = dt.dex, c = trCfg(kind), cur = c.cur(d, k), mx = trMax(d, kind, k);
  let v = +inp.value, t = cur;
  if(v > cur){ const n = v >= mx ? Math.ceil((mx - cur) / c.step) : Math.round((v - cur) / c.step); t = Math.min(mx, cur + n * c.step); }   // la barra salta de chapa en chapa
  if(t > cur) dt.tr[kind][k] = t; else delete dt.tr[kind][k];
  trSync();
});
document.addEventListener('change', e => { if(DT_NEW && e.target.closest && e.target.closest('#tmDataB .trs input')) renderData(); });   // ficha nueva: al soltar la barra se actualiza el coste
function trApply(){                                                   // gasta las chapas de las barras (una por una, con las mismas reglas de siempre)
  const d = dt.dex; let err = '', g = 0, s = 0;
  STAT_KEYS.forEach(k => {
    for(let n = trChapas(d, 'iv', k); n > 0 && !err; n--){ err = useChapa(d, k); if(!err) g++; }
    for(let n = trChapas(d, 'ev', k); n > 0 && !err; n--){ err = useChapaPlata(d, k); if(!err) s++; }
  });
  dt.tr = {iv:{}, ev:{}};
  toast(err || `Entrenamiento aplicado: ${g ? g + ' Chapa' + (g > 1 ? 's' : '') + ' Dorada' + (g > 1 ? 's' : '') : ''}${g && s ? ' y ' : ''}${s ? s + ' Chapa' + (s > 1 ? 's' : '') + ' Plateada' + (s > 1 ? 's' : '') : ''}.`);
}

// ---- Botones de la ficha (un solo controlador para toda la ventana) ----
function dataStep(delta){ const i = team.indexOf(dt.dex); dt.dex = team[(i + delta + team.length) % team.length]; dt.view = 'main'; dt.pick = null; dt.tr = {iv:{}, ev:{}}; }   // (la pestaña abierta se mantiene)
function confirmPick(){
  if(dt.pick === null && dt.view !== 'reset') return;                    // (Restablecer no elige nada: solo se confirma)
  const d = dt.dex; let err = '', ok = '';
  if(dt.view === 'nature'){ err = useMenta(d, +dt.pick); ok = `Naturaleza nueva: ${NATURES[dt.pick][0]}.`; }
  else if(dt.view === 'abil'){ const n = abilitiesOf(d)[dt.pick]; err = useCapsula(d, +dt.pick); ok = `Habilidad nueva: ${n}.`; }
  else if(dt.view === 'reset'){ const iv = dt.what === 'iv', n = iv ? capOf(d).gold : capOf(d).silver; err = iv ? resetIVs(d) : resetEVs(d); ok = `${iv ? 'IVs' : 'EVs'} restablecidos: recuperas ${n} ${iv ? 'Chapas Doradas' : 'Chapas Plateadas'}.`; dt.view = 'main'; toast(err || ok); return; }
  else if(dt.view === 'moves'){
    const k = dt.pick.slice(0, 2), v = dt.pick.slice(3);
    if(k === 'mt'){ const n = mtMove(v); err = useMT(d, v); ok = `${mon(d).name} aprendió ${n}.`; }
    else { err = recallMove(d, dt.slot, v); ok = `${mon(d).name} recuperó ${v}.`; }
  }
  toast(err || ok); dt.pick = null; if(!err) dt.view = 'main';
}
document.addEventListener('click', e => {
  const b = e.target.closest('#tmDataB [data-act]'); if(!b || b.disabled) return;
  const a = b.dataset.act, d = dt.dex, t = performance.now();
  if(a === 'close') return closeData();
  if(t < dt.lock) return;                                            // justo después de confirmar se ignoran los clics (por si se pulsa dos veces)
  if(a === 'nolearn'){ toast(NO_LEARN); return; }
  if(a === 'shop'){ closeData(true); closePick(); tm.from = ''; return openShop(); }
  if(a === 'prev') dataStep(-1); else if(a === 'next') dataStep(1);
  else if(a === 'back'){ dt.view = 'main'; dt.pick = null; }
  else if(a === 'chapa'){ const err = useChapa(d, b.dataset.k); toast(err || `${STAT_NAMES[b.dataset.k]}: IV +${TRAIN.chapaIV} (ahora ${ivOf(d)[b.dataset.k]}).`); }
  else if(a === 'chapap'){ const err = useChapaPlata(d, b.dataset.k); toast(err || `${STAT_NAMES[b.dataset.k]}: +${TRAIN.chapaEV} EV (ahora ${evOf(d)[b.dataset.k]}).`); }
  else if(a === 'tab'){ dt.tab = b.dataset.v; }
  else if(a === 'help'){ dt.help = !dt.help; }
  else if(a === 'trp' || a === 'trm'){ const kind = b.dataset.kind, k = b.dataset.k, c = trCfg(kind), cur = c.cur(d, k), w = trWant(d, kind, k);
    const t = a === 'trp' ? Math.min(trMax(d, kind, k), w + c.step) : Math.max(cur, w - c.step);
    if(a === 'trp' && t <= w) toast(held(c.item) <= trChapasTotal(d, kind) ? `No te quedan ${c.item === 'chapa' ? 'Chapas Doradas' : 'Chapas Plateadas'} (Tienda › Mejoras).` : 'Ya está al máximo.');
    if(t > cur) dt.tr[kind][k] = t; else delete dt.tr[kind][k]; }
  else if(a === 'preset'){ const P = DT_PRESETS[b.dataset.v]; dt.tr.ev = {};
    STAT_KEYS.filter(k => P.ev[k]).sort((x, y) => P.ev[y] - P.ev[x]).forEach(k => { const cur = evOf(d)[k], want = Math.max(cur, Math.min(P.ev[k], trMax(d, 'ev', k))); if(want > cur) dt.tr.ev[k] = want; });
    toast(`${P.n}: barras colocadas. Pulsa «Aplicar» para gastar las chapas.`); }
  else if(a === 'trapply') trApply();
  else if(a === 'trundo') dt.tr = {iv:{}, ev:{}};
  else if(a === 'rsview'){ dt.view = 'reset'; dt.what = b.dataset.w; dt.pick = null; }
  else if(a === 'natview'){ dt.view = 'nature'; dt.pick = null; }
  else if(a === 'abview'){ dt.view = 'abil'; dt.pick = null; }
  else if(a === 'mtview'){ dt.view = 'moves'; dt.slot = +b.dataset.s; dt.pick = null; }
  else if(a === 'pick') dt.pick = b.dataset.v;
  else if(a === 'cancel') dt.pick = null;
  else if(a === 'ok'){ dt.lock = t + 500; confirmPick(); }
  else if(a === 'reset'){ resetMoves(d); toast('Ataques originales restaurados.'); }
  renderData();
});
