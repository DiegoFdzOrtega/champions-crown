"use strict";
/* =====================================================================
   28) MANDO (gamepad: Xbox, PlayStation, Switch Pro y la mayoría de mandos USB / Bluetooth)
   Se activa solo al pulsar un botón del mando (el navegador no lo "ve" hasta entonces). Con ratón / teclado todo sigue igual.
   EN COMBATE
     Stick izquierdo = mover · Stick derecho = apuntar a mano (si no lo tocas, apunta solo hacia el rival)
     A / Gatillo derecho (RT) = golpe · X = disparo · B / Gatillo izquierdo (LT) = carrera · Y = ataque fuerte · LB = mejora
     RB = megaevolución · Cruceta ← ↓ → = cambiar al Pokémon 1 · 2 · 3 · Start = pausa
   EN LOS MENÚS
     Cruceta o stick izquierdo = moverse entre botones · A = pulsar · B = atrás · Start = pausa en combate
   CÓMO SE ENGANCHA: igual que touch.js: se envuelve ctlHeld (js/controls.js) para que también diga «sí» con el mando,
   y se envuelve loop para colocar la puntería (mouse.x / mouse.y) antes de cada fotograma.
   ===================================================================== */
const GP = {
  on: false,            // ¿se está jugando con el mando? (se apaga al mover el ratón o pulsar una tecla)
  prev: [],             // botones del fotograma anterior (para detectar «acaba de pulsarse»)
  held: {},             // acciones de combate mantenidas ahora mismo
  aim: null,            // ángulo del stick derecho (null = apunta solo)
  rep: {}, focus: null, seen: false
};
const GP_DEAD = .28;
const gpPad = () => { const l = navigator.getGamepads ? navigator.getGamepads() : []; for(const p of l) if(p && p.connected) return p; return null; };
const gpBtn = (p, i) => !!(p.buttons[i] && (p.buttons[i].pressed || p.buttons[i].value > .5));
const gpInCombat = () => !!g && !g.over && !g.paused && !(typeof pvp !== 'undefined' && pvp && pvp.menu);

{ const prev = ctlHeld; ctlHeld = id => prev(id) || (GP.on && !!GP.held[id]); }

function gpAxis(p, dpad){                                 // stick izquierdo (+ cruceta en los menús) → [x, y] (-1..1)
  let x = p.axes[0] || 0, y = p.axes[1] || 0;
  if(Math.hypot(x, y) < GP_DEAD) x = y = 0;
  if(!dpad) return [x, y];
  if(gpBtn(p, 14)) x = -1; if(gpBtn(p, 15)) x = 1; if(gpBtn(p, 12)) y = -1; if(gpBtn(p, 13)) y = 1;
  return [x, y];
}

// ---- Menús: moverse entre botones por pantalla ----
const GP_SEL = 'button, a[href], input, select, textarea, [role="button"], [data-mm], [data-crumb], .gcard, .card';
function gpCands(){
  const out = [], vw = innerWidth, vh = innerHeight;
  document.querySelectorAll(GP_SEL).forEach(el => {
    if(el.disabled || el.closest('.hide, [hidden]') || el.type === 'hidden') return;
    const r = el.getBoundingClientRect();
    if(r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return;
    const cx = Math.min(Math.max(r.left + r.width / 2, 1), vw - 1), cy = Math.min(Math.max(r.top + r.height / 2, 1), vh - 1), top = document.elementFromPoint(cx, cy);
    if(!top || !(el === top || el.contains(top) || top.contains(el))) return;             // tapado por una ventana: no se puede elegir
    if(el.matches('canvas') || getComputedStyle(el).visibility === 'hidden') return;
    out.push({el, cx, cy});
  });
  return out.filter(a => !out.some(b => b !== a && a.el.contains(b.el)));                 // si un contenedor tiene botones dentro, solo cuentan los de dentro
}
function gpSet(el){
  if(GP.focus && GP.focus !== el) GP.focus.classList.remove('gp-f');
  GP.focus = el; if(!el) return;
  el.classList.add('gp-f'); try{ el.scrollIntoView({block: 'nearest', inline: 'nearest'}); }catch(e){}
}
function gpMove(dx, dy){
  const list = gpCands(); if(!list.length) return;
  const cur = list.find(c => c.el === GP.focus);
  if(!cur){ const mx = innerWidth / 2, my = innerHeight / 2; gpSet(list.reduce((a, b) => Math.hypot(a.cx - mx, a.cy - my) < Math.hypot(b.cx - mx, b.cy - my) ? a : b).el); return; }
  let best = null, bs = 1e9;
  for(const c of list){
    if(c === cur) continue;
    const vx = c.cx - cur.cx, vy = c.cy - cur.cy, along = vx * dx + vy * dy, perp = Math.abs(vx * dy - vy * dx);
    if(along < 4) continue;
    const s = along + perp * 2.2;
    if(s < bs){ bs = s; best = c; }
  }
  if(best) gpSet(best.el);
}
function gpClick(){
  const list = gpCands(); let el = GP.focus;
  if(!el || !list.some(c => c.el === el)){ gpMove(0, 1); el = GP.focus; if(!el) return; }
  if(el.tagName === 'SELECT' || (el.tagName === 'INPUT' && /^(text|search|number|email|password|url|tel)$/i.test(el.type))){ el.focus(); return; }
  el.click();
}
function gpEsc(){ (document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', {code: 'Escape', key: 'Escape', bubbles: true})); }

// ---- Un fotograma del mando ----
function gpTick(){
  requestAnimationFrame(gpTick);
  const p = gpPad(); if(!p){ if(GP.on) GP.on = false; GP.held = {}; return; }
  const now = performance.now(), b = i => gpBtn(p, i), pr = i => b(i) && !GP.prev[i];
  const inC = gpInCombat(), [ax, ay] = gpAxis(p, !inC), rx = p.axes[2] || 0, ry = p.axes[3] || 0;
  const act = p.buttons.some((x, i) => b(i) && !GP.prev[i]) || Math.hypot(ax, ay) > .5 || Math.hypot(rx, ry) > .5;
  if(act && !GP.on){ GP.on = true; if(!GP.seen){ GP.seen = true; if(typeof toast === 'function') toast('Mando activado 🎮'); } }
  if(!GP.on){ GP.prev = p.buttons.map((x, i) => b(i)); return; }

  if(inC){
    if(GP.focus){ GP.focus.classList.remove('gp-f'); GP.focus = null; }
    GP.held = {
      left: ax < -.38, right: ax > .38, up: ay < -.38, down: ay > .38,
      melee: b(0) || b(7), shot: b(2), dash: b(1) || b(6), strong: b(3), buff: b(4)
    };
    GP.aim = Math.hypot(rx, ry) > .4 ? Math.atan2(ry, rx) : null;
    if(pr(5)) megaPlayer();
    if(pr(14)) switchMon(0); if(pr(13)) switchMon(1); if(pr(15)) switchMon(2);
    if(pr(9)) pauseBattle(true);
  }else{
    GP.held = {}; GP.aim = null;
    const dx = ax > .5 ? 1 : ax < -.5 ? -1 : 0, dy = ay > .5 ? 1 : ay < -.5 ? -1 : 0, d = Math.abs(dx) > 0 ? [dx, 0] : [0, dy];
    if(dx || dy){
      const k = d[0] + ',' + d[1], r = GP.rep;
      if(r.k !== k){ r.k = k; r.t = now + 380; gpMove(d[0], d[1]); }
      else if(now >= r.t){ r.t = now + 130; gpMove(d[0], d[1]); }
    }else GP.rep = {};
    if(pr(0)) gpClick();
    if(pr(1)) gpEsc();
    if(pr(9)){ if(g && !g.over && g.paused) pauseBattle(false); else gpEsc(); }
    if(g && g.paused && !GP.focus) gpMove(0, 1);
    if(Math.abs(ry) > .4){ const sc = (GP.focus && GP.focus.closest('[style*="overflow"], .scroll')) || document.scrollingElement; if(sc) sc.scrollTop += ry * 14; }
  }
  GP.prev = p.buttons.map((x, i) => b(i));
}
requestAnimationFrame(gpTick);

// Puntería: con el stick derecho a mano, si no hacia el rival (solo si se juega con mando y no con ratón o dedos)
function gpAim(){
  if(!GP.on || !gpInCombat() || (typeof TOUCH !== 'undefined' && TOUCH.on)) return;
  const M = myMon(), E = oppList()[oppIdx()]; if(!M) return;
  const s2 = (x, y) => (typeof tW2S === 'function' ? tW2S(x, y) : [x, y]);
  if(GP.aim !== null){ const [sx, sy] = s2(M.x, M.y); mouse.x = sx + Math.cos(GP.aim) * 300; mouse.y = sy + Math.sin(GP.aim) * 300; }
  else if(E && !E.dead){ const [sx, sy] = s2(E.x, E.y); mouse.x = sx; mouse.y = sy; }
}
{ const lp = loop; loop = now => { gpAim(); lp(now); }; }

// Si se vuelve al ratón o al teclado, el mando se "calla" (y desaparece el marco de los menús)
const gpOff = () => { if(GP.on){ GP.on = false; GP.held = {}; if(GP.focus){ GP.focus.classList.remove('gp-f'); GP.focus = null; } } };
addEventListener('mousemove', e => { if(Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0) > 2) gpOff(); }, true);
addEventListener('mousedown', gpOff, true);
addEventListener('keydown', e => { if(!e.isTrusted) return; gpOff(); }, true);
addEventListener('gamepadconnected', () => { if(typeof toast === 'function') toast('Mando conectado: pulsa un botón 🎮'); });
