"use strict";
/* =====================================================================
   27) CONTROLES TÁCTILES (móvil y tableta)
   Se activan solos la primera vez que se toca la pantalla; con ratón y teclado todo sigue como siempre.
     - IZQUIERDA: joystick redondo. Aparece donde pongas el dedo (en la mitad izquierda) y mueve al Pokémon en 8 direcciones.
     - DERECHA: los 5 ataques en abanico alrededor del pulgar (el golpe, el más grande, en la esquina). Encima, MEGA cuando se puede.
         · TOCAR un ataque  → se lanza hacia el rival (apunta solo).
         · MANTENER y ARRASTRAR → sale una flecha para apuntar a mano; al soltar, se lanza hacia ahí.
     - Arriba: los cuadritos del equipo se tocan para cambiar de Pokémon (como el clic). Botón II = pausa / menú.
   CÓMO SE ENGANCHA AL JUEGO (sin tocar el combate): el combate pregunta ctlHeld('melee'), ctlHeld('left')... (js/controls.js);
   aquí se envuelve ctlHeld para que también diga «sí» cuando el dedo está en el joystick o se acaba de soltar un ataque.
   La puntería va por el ratón (mouse.x / mouse.y, en coordenadas de pantalla): antes de cada fotograma se coloca donde toca.
   Así también funciona en el combate online sin cambiar nada de js/pvp.js.
   ===================================================================== */
const TOUCH = {
  on: false,            // ¿se está jugando con los dedos? (se pone a true con el primer toque)
  joy: null,            // {id, ox, oy, x, y}: dedo del joystick (origen y posición)
  acts: {},             // dedos sobre los botones de ataque: {touchId: {id, i, x0, y0, x, y, drag}}
  pulse: null,          // ataque que se acaba de soltar: {id, until, ang} (ang = null → apunta solo)
  fs: false             // ya se pidió pantalla completa
};
const T_JOY_R = 62, T_DEAD = 12;                                        // radio del joystick y zona muerta (en px de pantalla del juego)
const T_ACTS = ['dash', 'melee', 'shot', 'buff', 'strong'];
const T_JIT = .2;                                                       // online: error al apuntar solo (radianes: ±0,2 ≈ ±11°). Apuntando a mano (arrastrando) no hay error             // acción de cada ataque (en el orden de MV)
const touchUI = () => TOUCH.on && !!g && !g.over;                       // ¿se enseñan los controles táctiles? (render.js oculta entonces la barra de ataques)
const tScrW = () => (typeof prOn === 'function' && prOn()) ? PR.SW : W; // ancho de la pantalla del juego (en el Estadio es distinto del ancho del mundo)
function tW2S(x, y){ return (typeof prOn === 'function' && prOn()) ? prW2S(x, y) : [x, y]; }   // mundo → pantalla

// Posición de cada botón (se recalcula: depende del ancho de la pantalla)
function tLayout(){
  const SW = tScrW(), cx = SW - 92, cy = H - 92;
  return {
    btn: [
      {i: 0, x: cx - 128, y: cy + 30, r: 30},          // carrera (ESP)
      {i: 1, x: cx, y: cy, r: 50},                     // golpe: el grande
      {i: 2, x: cx - 112, y: cy - 62, r: 34},          // disparo
      {i: 3, x: cx - 52, y: cy - 122, r: 32},          // mejora (Q)
      {i: 4, x: cx + 28, y: cy - 132, r: 34}           // ataque fuerte (E)
    ],
    mega: {x: cx + 52, y: cy - 214, r: 28},
    pause: {x: SW / 2 + 128, y: 28, r: 20}
  };
}
const tIn = (b, x, y, pad) => Math.hypot(x - b.x, y - b.y) <= b.r + (pad || 0);

// ---- Lo que el combate pregunta: ¿está pulsada esta acción? ----
function touchHeld(id){
  if(!TOUCH.on) return false;
  const J = TOUCH.joy;
  if(J && /^(up|down|left|right)$/.test(id)){
    const vx = J.x - J.ox, vy = J.y - J.oy, l = Math.hypot(vx, vy);
    if(l < T_DEAD) return false;
    const nx = vx / l, ny = vy / l;
    return id === 'right' ? nx > .38 : id === 'left' ? nx < -.38 : id === 'down' ? ny > .38 : ny < -.38;   // 8 direcciones
  }
  const P = TOUCH.pulse;
  return !!(P && P.id === id && performance.now() < P.until);
}
{ const kb = ctlHeld; ctlHeld = id => kb(id) || touchHeld(id); }   // el teclado y el ratón siguen funcionando igual

// ---- Antes de cada fotograma: dónde apunta el Pokémon ----
function touchAim(){
  if(!touchUI()) return;
  const M = myMon(), E = oppList()[oppIdx()]; if(!M) return;
  let ang = null;
  for(const k in TOUCH.acts){ const a = TOUCH.acts[k]; if(a.drag) ang = Math.atan2(a.y - a.y0, a.x - a.x0); }          // arrastrando un ataque: apunta a mano
  const PU = TOUCH.pulse && performance.now() < TOUCH.pulse.until ? TOUCH.pulse : null;
  if(ang === null && PU) ang = PU.ang;
  if(ang === null && PU && PU.jit && E && !E.dead){ const [ex, ey] = tW2S(E.x, E.y), [px, py] = tW2S(M.x, M.y); ang = Math.atan2(ey - py, ex - px) + PU.jit; }   // apuntar solo con error (online)
  if(ang !== null){ const [sx, sy] = tW2S(M.x, M.y); mouse.x = sx + Math.cos(ang) * 300; mouse.y = sy + Math.sin(ang) * 300; }
  else if(E && !E.dead){ const [sx, sy] = tW2S(E.x, E.y); mouse.x = sx; mouse.y = sy; }                                  // si no: siempre hacia el rival
}
{ const lp = loop; loop = now => { touchAim(); lp(now); }; }

// ---- Dedos ----
function tPos(t){ const r = cv.getBoundingClientRect(); viewCalc(); return [((t.clientX - r.left) * cv.width / r.width - VIEW.ox) / VIEW.sx, ((t.clientY - r.top) * cv.height / r.height - VIEW.oy) / VIEW.sy]; }
function tActive(){ return !!g && !g.over && !g.paused; }
function tStart(e){
  if(!TOUCH.on){ TOUCH.on = true; HUD_SCALE = .92; document.body.classList.add('touch'); }                // primer toque: modo táctil (HUD algo más grande)
  if(!g) return;
  e.preventDefault();
  if(!TOUCH.fs){ TOUCH.fs = true; try{ const d = document.documentElement; (d.requestFullscreen || d.webkitRequestFullscreen || (() => {})).call(d); if(screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); }catch(err){} }
  if(!tActive()) return;
  const L = tLayout();
  for(const t of e.changedTouches){
    const [x, y] = tPos(t);
    if(tIn(L.pause, x, y, 8)){ pauseBattle(true); continue; }                                                          // II: pausa (online: menú)
    const k = hudIconAt(x, y); if(k >= 0){ switchMon(k); continue; }                                                   // cuadrito del equipo: cambiar
    if(megaBadgeState() === 'ready' && tIn(L.mega, x, y, 8)){ megaPlayer(); continue; }
    const b = L.btn.find(b => tIn(b, x, y, 10));
    if(b){ TOUCH.acts[t.identifier] = {id: T_ACTS[b.i], i: b.i, x0: x, y0: y, x, y, drag: false}; continue; }
    if(x < tScrW() * .55 && !TOUCH.joy) TOUCH.joy = {id: t.identifier, ox: x, oy: y, x, y};                             // mitad izquierda: joystick
  }
}
function tMove(e){
  if(!g) return; e.preventDefault();
  for(const t of e.changedTouches){
    const [x, y] = tPos(t), J = TOUCH.joy, a = TOUCH.acts[t.identifier];
    if(J && J.id === t.identifier){ const vx = x - J.ox, vy = y - J.oy, l = Math.hypot(vx, vy), k = l > T_JOY_R ? T_JOY_R / l : 1; J.x = J.ox + vx * k; J.y = J.oy + vy * k; }
    if(a){ a.x = x; a.y = y; if(Math.hypot(x - a.x0, y - a.y0) > 22) a.drag = true; }
  }
}
function tEnd(e){
  if(!g) return; e.preventDefault();
  for(const t of e.changedTouches){
    if(TOUCH.joy && TOUCH.joy.id === t.identifier) TOUCH.joy = null;
    const a = TOUCH.acts[t.identifier];
    if(a){
      delete TOUCH.acts[t.identifier];
      if(e.type === 'touchend' && tActive()) TOUCH.pulse = {id: a.id, until: performance.now() + 110, ang: a.drag ? Math.atan2(a.y - a.y0, a.x - a.x0) : null,   // al soltar: ¡se lanza!
        jit: !a.drag && g.pvp ? (Math.random() - .5) * T_JIT * 2 : 0};   // online: apuntar solo no es perfecto (± T_JIT), para no tener ventaja sobre quien apunta con el ratón
    }
  }
}
cv.addEventListener('touchstart', tStart, {passive: false});
cv.addEventListener('touchmove', tMove, {passive: false});
cv.addEventListener('touchend', tEnd, {passive: false});
cv.addEventListener('touchcancel', tEnd, {passive: false});
addEventListener('touchstart', () => { if(!TOUCH.on){ TOUCH.on = true; HUD_SCALE = .92; document.body.classList.add('touch'); } }, {passive: true, once: true});   // también si el primer toque es en un menú

// ---- Dibujo (lo llama render.js al final de draw) ----
function touchDraw(){
  if(!touchUI()) return;
  const M = myMon(); if(!M) return;
  const L = tLayout(), SW = tScrW(), t = performance.now() / 1000;
  ctx.save(); ctx.textBaseline = 'alphabetic';
  // joystick
  const J = TOUCH.joy, jx = J ? J.ox : 118, jy = J ? J.oy : H - 108;
  ctx.globalAlpha = J ? .9 : .45;
  ctx.fillStyle = 'rgba(16,20,34,.55)'; ctx.beginPath(); ctx.arc(jx, jy, T_JOY_R, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(122,184,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(jx, jy, T_JOY_R, 0, 7); ctx.stroke();
  const kx = J ? J.x : jx, ky = J ? J.y : jy;
  const gk = ctx.createRadialGradient(kx - 6, ky - 6, 2, kx, ky, 28); gk.addColorStop(0, '#e6f0ff'); gk.addColorStop(1, '#4f8bff');
  ctx.fillStyle = gk; ctx.beginPath(); ctx.arc(kx, ky, 26, 0, 7); ctx.fill();
  ctx.globalAlpha = 1;
  // energía: anillo alrededor del botón grande (se llena en sentido horario) con las marcas de lo que cuestan Q y E
  { const b = L.btn[1], R = b.r + 9, a0 = -Math.PI / 2, fr = M.en / 100;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(10,14,26,.8)'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, 7); ctx.stroke();
    ctx.strokeStyle = '#4fb3ff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(b.x, b.y, R, a0, a0 + fr * Math.PI * 2); ctx.stroke();
    ctx.lineCap = 'butt';
    [3, 4].forEach(i => { const n = Math.round(enCost(M, i)) / 100, a = a0 + n * Math.PI * 2; ctx.strokeStyle = i === 3 ? '#b07bff' : '#ffcc33'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(b.x + Math.cos(a) * (R - 7), b.y + Math.sin(a) * (R - 7)); ctx.lineTo(b.x + Math.cos(a) * (R + 7), b.y + Math.sin(a) * (R + 7)); ctx.stroke(); });
    textO(String(Math.floor(M.en)), b.x + R * .72, b.y + R * .72 + 12, 9, '#4fb3ff', 'center'); }
  // botones de ataque
  L.btn.forEach(b => {
    const i = b.i, m = MV[i], cost = Math.round(enCost(M, i)), enWait = Math.max(0, (cost - M.en) / EN_REGEN), cdWait = Math.max(0, M.cd[i]), wait = Math.max(enWait, cdWait), ok = wait <= 0;
    const col = i === 0 ? '#9aa6b8' : i === 3 ? '#b07bff' : TC[mtype(M, i)] || '#9aa6b8';
    const held = Object.values(TOUCH.acts).some(a => a.i === i);
    ctx.fillStyle = held ? 'rgba(40,50,80,.9)' : 'rgba(16,20,34,.82)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
    ctx.save(); if(ok){ ctx.shadowColor = col; ctx.shadowBlur = held ? 18 : 8; }
    ctx.strokeStyle = ok ? col : '#2c3550'; ctx.lineWidth = held ? 4 : 3; ctx.beginPath(); ctx.arc(b.x, b.y, b.r - 2, 0, 7); ctx.stroke(); ctx.restore();
    if(!ok){                                                                             // espera: se va llenando en sentido horario
      const total = Math.max(m.cd, cost / EN_REGEN, .01), fr = Math.min(1, wait / total);
      ctx.fillStyle = 'rgba(5,7,12,.7)'; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.arc(b.x, b.y, b.r - 3, -Math.PI / 2, -Math.PI / 2 + fr * Math.PI * 2); ctx.closePath(); ctx.fill();
    }
    const nm = mvName(M, i).toUpperCase(), fs = b.r > 40 ? 10 : 8;
    ctx.font = `${fs}px ${FONT}`; let s = nm; while(ctx.measureText(s).width > b.r * 1.75 && s.length > 4) s = s.slice(0, -1);
    textO(s, b.x, b.y + (m.en ? 0 : 3), fs, ok ? '#fff' : '#8a94b0', 'center');
    if(m.en) text('EN ' + cost, b.x, b.y + fs + 8, 7, M.en >= cost ? '#4fb3ff' : '#e8493a', 'center');
    if(!ok) textO(wait.toFixed(1), b.x, b.y - b.r * .42, 9, cdWait >= enWait ? '#fff' : '#4fb3ff', 'center');
  });
  // flecha de puntería mientras se arrastra un ataque
  for(const k in TOUCH.acts){ const a = TOUCH.acts[k]; if(!a.drag) continue;
    const ang = Math.atan2(a.y - a.y0, a.x - a.x0), [sx, sy] = tW2S(M.x, M.y), len = 150;
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.moveTo(sx + Math.cos(ang) * 24, sy + Math.sin(ang) * 24); ctx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len); ctx.stroke(); ctx.setLineDash([]);
    const hx = sx + Math.cos(ang) * (len + 12), hy = sy + Math.sin(ang) * (len + 12);
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - Math.cos(ang - .5) * 18, hy - Math.sin(ang - .5) * 18); ctx.lineTo(hx - Math.cos(ang + .5) * 18, hy - Math.sin(ang + .5) * 18); ctx.closePath(); ctx.fill(); ctx.restore(); }
  // MEGA (solo cuando se puede)
  if(megaBadgeState() === 'ready' && g.count <= 0){ const b = L.mega;
    ctx.save(); ctx.shadowColor = '#ff6ad8'; ctx.shadowBlur = 14 + 6 * Math.sin(t * 5);
    ctx.fillStyle = 'rgba(30,12,44,.9)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
    ctx.strokeStyle = hue(t * 160, .95); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(b.x, b.y, b.r - 2, 0, 7); ctx.stroke(); ctx.restore();
    textO('MEGA', b.x, b.y + 5, 9, '#ffd9fb', 'center'); }
  // pausa
  { const b = L.pause; ctx.fillStyle = 'rgba(16,20,34,.8)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(122,184,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.stroke();
    ctx.fillStyle = '#e6f0ff'; ctx.fillRect(b.x - 6, b.y - 7, 4, 14); ctx.fillRect(b.x + 2, b.y - 7, 4, 14); }
  ctx.restore();
}

// ---- Móvil en vertical: pide girarlo ----
{ const st = document.createElement('style');
  st.textContent = `#tRotate{display:none;position:fixed;inset:0;z-index:9999;background:#070a14;color:#e6f0ff;font:12px "Press Start 2P",monospace;text-align:center;
    flex-direction:column;align-items:center;justify-content:center;gap:1.4em;line-height:1.8;padding:2em}
    #tRotate b{font-size:42px;color:#7ab8ff}
    @media (orientation:portrait) and (pointer:coarse){ #tRotate{display:flex} }`;
  document.head.appendChild(st);
  const d = document.createElement('div'); d.id = 'tRotate'; d.innerHTML = '<b>⟳</b>Gira el móvil<br>para jugar en horizontal';
  document.body.appendChild(d); }

// ---- ARRASTRAR Y SOLTAR EN LOS MENÚS CON EL DEDO (Equipo Pokémon: ordenar las cartas y meter Pokémon de la colección) ----
// El «arrastrar y soltar» del navegador (draggable="true" + dragstart / dragover / drop) no existe en las pantallas táctiles.
// Aquí se imita: MANTÉN PULSADO un momento sobre algo arrastrable (se levanta y vibra), muévelo y suéltalo encima de donde va.
// Si mueves el dedo enseguida, no se arrastra: la lista se desplaza como siempre. Se lanzan los mismos eventos que con el ratón,
// así que team / teamhub.js funcionan sin cambios.
(() => {
  const HOLD = 260;                                                                    // ms que hay que mantener el dedo para empezar a arrastrar
  let st = null;                                                                       // {src, x0, y0, timer, on, dt, ghost, over}
  const mkDT = () => { const d = {}; return {setData: (k, v) => { d[k] = String(v); }, getData: k => d[k] || '', clearData(){}, effectAllowed: 'all', dropEffect: 'move', types: []}; };
  const fire = (el, type, dt) => { if(!el) return true; const ev = new Event(type, {bubbles: true, cancelable: true}); Object.defineProperty(ev, 'dataTransfer', {value: dt}); return el.dispatchEvent(ev); };
  function begin(){
    if(!st) return;
    st.dt = mkDT();
    if(!fire(st.src, 'dragstart', st.dt)){ st = null; return; }                        // el juego puede cancelarlo (p. ej. sobre el menú del objeto)
    st.on = true;
    const r = st.src.getBoundingClientRect(), gh = st.src.cloneNode(true);
    st.src.querySelectorAll('canvas').forEach((c, i) => { const k = gh.querySelectorAll('canvas')[i]; if(k){ k.width = c.width; k.height = c.height; try{ k.getContext('2d').drawImage(c, 0, 0); }catch(e){} } });   // los dibujos no se copian solos
    Object.assign(gh.style, {position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', margin: 0, zIndex: 9998, pointerEvents: 'none', opacity: .85,
      transform: 'scale(1.06) rotate(-2deg)', boxShadow: '0 1rem 2rem rgba(0,0,0,.6)', transition: 'none'});
    document.body.appendChild(gh); st.ghost = gh; st.gx = st.x0 - r.left; st.gy = st.y0 - r.top;
    if(navigator.vibrate) try{ navigator.vibrate(15); }catch(e){}
  }
  document.addEventListener('touchstart', e => {
    if((g && !g.over) || e.touches.length !== 1) return;                               // en combate no (ahí manda el joystick)
    const src = e.target.closest && e.target.closest('[draggable="true"]'); if(!src) return;
    const t = e.touches[0]; st = {src, x0: t.clientX, y0: t.clientY, on: false, over: null};
    st.timer = setTimeout(begin, HOLD);
  }, {passive: true});
  document.addEventListener('touchmove', e => {
    if(!st) return; const t = e.touches[0];
    if(!st.on){ if(Math.hypot(t.clientX - st.x0, t.clientY - st.y0) > 10){ clearTimeout(st.timer); st = null; } return; }   // se movió antes de tiempo: era desplazar la lista
    e.preventDefault();
    st.ghost.style.left = (t.clientX - st.gx) + 'px'; st.ghost.style.top = (t.clientY - st.gy) + 'px';
    const el = document.elementFromPoint(t.clientX, t.clientY);
    if(el !== st.over){ if(st.over) fire(st.over, 'dragleave', st.dt); st.over = el; }
    if(el) fire(el, 'dragover', st.dt);
  }, {passive: false});
  const end = e => {
    if(!st) return; clearTimeout(st.timer);
    if(st.on){
      e.preventDefault();                                                              // que no cuente también como un toque (clic)
      if(e.type === 'touchend' && st.over && st.over !== st.src && !st.src.contains(st.over)) fire(st.over, 'drop', st.dt);
      fire(st.src, 'dragend', st.dt); st.ghost.remove();
    }
    st = null;
  };
  document.addEventListener('touchend', end, {passive: false});
  document.addEventListener('touchcancel', end, {passive: false});
  const css = document.createElement('style');                                         // sin menú del navegador ni selección de texto al mantener pulsado
  css.textContent = 'html.phone [draggable="true"],body.touch [draggable="true"]{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}';
  document.head.appendChild(css);
})();
