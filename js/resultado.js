"use strict";
/* =====================================================================
   20) PANTALLA DE RESULTADO CON LOS PANELES DE GEMINI (victoria y derrota)
   Viste la pantalla #result (la de victoria.js y la de derrota de cada modo) con los paneles
   de assets/iconos/resultado/ (marco, placa, tarjetas, barra, botones y sello). Estilo: css/resultado.css
   - No cambia QUÉ se enseña (títulos, recompensas, etiquetas y botones los siguen poniendo
     modes.js, torre.js, campo.js, pvp.js, incursiones.js, pruebas.js y victoria.js): solo los coloca en el panel.
   - Derrota: añade el resumen del combate (Pokémon que le quedaban al rival, tiempo, su MVP)
     y un consejo según el tipo que más usa el rival.
   - Para el MVP apunta el daño que hace cada Pokémon envolviendo hit() (combat.js). Lo guarda
     aparte (WeakMap), sin tocar el estado del combate: no afecta al online (no hace falta subir PVP_VER).
   Envuelve: hit · victoryScreen · resultClear · show. Va el último en index.html.
   ===================================================================== */
const RES_DIR = 'assets/iconos/resultado/';
const RES_DMG = new WeakMap();                                   // Pokémon → daño hecho en este combate (solo para la pantalla final)

if(typeof hit === 'function'){ const o = hit; hit = function(T, dmg, type, A){
  const h0 = T && typeof T.hp === 'number' ? T.hp : null;
  const r = o.apply(this, arguments);
  try{ if(A && h0 !== null && T.hp < h0) RES_DMG.set(A, (RES_DMG.get(A) || 0) + (h0 - T.hp)); }catch(e){}
  return r;
}; }

// color de la recompensa (RW_LOOK de victoria.js) → qué marco de tarjeta usa
function resCardFrame(c){
  c = String(c || '').toLowerCase();
  if(['#ff3ea5', '#ff7ad9'].includes(c)) return 'rosa';
  if(['#c9d6f5', '#5aa8ff', '#3ea6ff'].includes(c)) return 'plata';
  return 'oro';
}

function resStrip(inner){                                        // quita lo que puso esta capa la vez anterior
  inner.classList.remove('cc', 'cc-win', 'cc-lose', 'cc-grid', 'cc-chips');
  inner.querySelectorAll('.cc-add').forEach(e => e.remove());
}

function resRivalSide(){                                         // en una derrota, el rival es el bando que sigue en pie
  if(!g) return null;
  if(!g.pvp) return g.e || null;
  const alive = s => (s || []).some(f => f && !f.dead && f.hp > 0);
  return alive(g.e) && !alive(g.p) ? g.e : alive(g.p) && !alive(g.e) ? g.p : null;
}

function resTip(side, name){                                     // «X usa mucho tipo Fantasma. Prueba con Siniestro o Fantasma.»
  if(typeof TYPE_ES === 'undefined' || typeof eff !== 'function' || !side || !side.length) return '';
  const n = {};
  side.forEach(f => ((f && f.m && f.m.types) || []).forEach(t => n[t] = (n[t] || 0) + 1));
  const top = Object.keys(n).sort((a, b) => n[b] - n[a])[0]; if(!top || !TYPE_ES[top]) return '';
  const good = Object.keys(TYPE_ES).filter(t => eff(t, [top]) >= 2).slice(0, 2);
  if(!good.length) return '';
  return `${name} usa mucho tipo ${TYPE_ES[top]}. Prueba con <b>${TYPE_ES[good[0]]}</b>` + (good[1] ? ` o <b>${TYPE_ES[good[1]]}</b>.` : '.');
}

function resDecorate(){
  const inner = document.querySelector('#result .inner'); if(!inner) return;
  resStrip(inner);
  const title = $('rTitle').textContent || '';
  if(g && g.pvp && /cancelado/i.test(title)) return;            // combate online cancelado: ni victoria ni derrota, se queda la pantalla sencilla
  const win = inner.classList.contains('win');
  const mk = (tag, cls) => { const e = document.createElement(tag); e.className = 'cc-add ' + cls; return e; };
  inner.classList.add('cc', win ? 'cc-win' : 'cc-lose');

  // retrato del rival dentro del círculo (y la placa delante, para que la tape por abajo)
  const foto = mk('div', 'cc-foto');
  const old = $('rPortrait');
  if(old) foto.appendChild(old);
  else if(!win && g && g.o && (g.o.leader || g.o.portrait) && typeof leaderImg === 'function'){
    const L = leaderImg(g.o.leader || 'torre_rival', g.o.portrait);
    if(L && L.src){ const p = document.createElement('img'); p.id = 'rPortrait'; p.className = 'vic-portrait'; p.alt = ''; p.src = L.src; p.onerror = () => p.remove(); foto.appendChild(p); }
  }
  inner.prepend(foto);
  inner.insertBefore(mk('div', 'cc-placa'), foto.nextSibling);

  if(win){
    const grid = $('vGrid');
    if(grid){
      inner.classList.add('cc-grid');
      grid.style.setProperty('--n', grid.children.length);
      [...grid.children].forEach(card => {
        card.classList.add('cc-t-' + resCardFrame(card.style.getPropertyValue('--c')));
        const x2 = card.querySelector('.x2'); if(x2){ x2.setAttribute('aria-label', x2.textContent); }
      });
    }
    if($('rChips')) inner.classList.add('cc-chips');
    return;
  }

  // ---- derrota: resumen del combate + consejo ----
  const side = resRivalSide();
  const name = (title.match(/^(.+?) ha ganado/) || [])[1] || (g && g.o && g.o.leaderName) || 'El rival';
  if(side && side.length){
    const st = mk('div', 'cc-stats');
    const c1 = document.createElement('div'), c2 = document.createElement('div'), c3 = document.createElement('div');
    c1.innerHTML = '<span class="cc-lab">Le quedaban</span><span class="cc-balls"></span>';
    const balls = c1.querySelector('.cc-balls');
    side.forEach(f => { const b = document.createElement('i'); if(f && !f.dead && f.hp > 0) b.className = 'on'; balls.appendChild(b); });
    const s = Math.max(0, Math.round((g && g.clock) || 0));
    c2.innerHTML = `<span class="cc-lab">Tiempo</span><b class="cc-big">${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}</b>`;
    let mvp = null, best = 0;
    side.forEach(f => { const d = RES_DMG.get(f) || 0; if(f && d > best){ best = d; mvp = f; } });
    c3.innerHTML = '<span class="cc-lab">Su MVP</span>';
    if(mvp){
      const dex = mvp.m.baseDex || mvp.m.dex, im = document.createElement('img');
      im.className = 'cc-cara'; im.alt = ''; im.src = `assets/pokemon/${dex}/caras/Normal.png`; im.onerror = () => im.remove();
      const t = document.createElement('small'); t.textContent = `${mvp.m.name} · ${Math.round(best)} daño`;
      c3.append(im, t);
    }else{ const t = document.createElement('b'); t.className = 'cc-big'; t.textContent = '—'; c3.appendChild(t); }
    st.append(c1, c2, c3); inner.insertBefore(st, $('rBtns'));
  }
  const tip = mk('div', 'cc-tip'), txt = resTip(side, name);
  const sp = document.createElement('span'); tip.appendChild(sp);
  if(txt) sp.innerHTML = txt; else sp.textContent = $('rText').textContent || '';
  if(tip.textContent) inner.insertBefore(tip, $('rBtns'));
  if(txt && /^Cambia el equipo/.test($('rText').textContent)) $('rText').classList.add('cc-hide');   // el consejo ya ocupa su sitio
}

if(typeof resultClear === 'function'){ const o = resultClear; resultClear = function(){
  const inner = document.querySelector('#result .inner'); if(inner) resStrip(inner);
  const t = $('rText'); if(t) t.classList.remove('cc-hide');
  return o.apply(this, arguments);
}; }
if(typeof victoryScreen === 'function'){ const o = victoryScreen; victoryScreen = function(){
  const inner = document.querySelector('#result .inner'); if(inner) resStrip(inner);
  const t = $('rText'); if(t) t.classList.remove('cc-hide');
  return o.apply(this, arguments);
}; }
if(typeof show === 'function'){ const o = show; show = function(w){
  if(w === 'result'){ try{ resDecorate(); }catch(e){ console.warn('resultado.js', e); } }
  return o.apply(this, arguments);
}; }
