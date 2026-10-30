"use strict";
/* =====================================================================
   20) CONTROLES PERSONALIZABLES (Ajustes › Controles)
   Cada acción del combate tiene DOS huecos (principal y alternativo). En cada hueco va una tecla (e.code: 'KeyW', 'Space'...) o un botón del
   ratón ('Mouse0' = izquierdo, 'Mouse1' = rueda, 'Mouse2' = derecho, 'Mouse3'/'Mouse4' = laterales). Lo que el jugador cambia se guarda en
   save.controls = {accion: [hueco1, hueco2]} (null = hueco vacío); lo que no cambia usa CTL_ACTIONS[].def.
   El combate pregunta con ctlHeld('shot') («¿está pulsado?») y ui.js con ctlIs('mega', e.code) («¿esta tecla es la de megaevolución?»).
   Siguen fijas: Esc (pausa / menú) y M (silenciar), y el ratón siempre apunta.
   Para añadir una acción nueva: una línea en CTL_ACTIONS y usar ctlHeld / ctlIs donde haga falta.
   ===================================================================== */
const CTL_ACTIONS = [
  {id:'up',     n:'Mover arriba',     def:['KeyW', 'ArrowUp']},
  {id:'down',   n:'Mover abajo',      def:['KeyS', 'ArrowDown']},
  {id:'left',   n:'Mover izquierda',  def:['KeyA', 'ArrowLeft']},
  {id:'right',  n:'Mover derecha',    def:['KeyD', 'ArrowRight']},
  {id:'dash',   n:'Carrera',          def:['Space', null]},
  {id:'melee',  n:'Golpe',            def:['Mouse0', null]},
  {id:'shot',   n:'Disparo',          def:['Mouse2', null]},
  {id:'buff',   n:'Mejora',           def:['KeyQ', null]},
  {id:'strong', n:'Ataque fuerte',    def:['KeyE', null]},
  {id:'mega',   n:'Megaevolución',    def:['KeyR', null]},
  {id:'sw1',    n:'Cambiar al Pokémon 1', def:['Digit1', null]},
  {id:'sw2',    n:'Cambiar al Pokémon 2', def:['Digit2', null]},
  {id:'sw3',    n:'Cambiar al Pokémon 3', def:['Digit3', null]}
];
const CTL_RESERVED = /^(Escape|KeyM|F\d+|Tab|ContextMenu|MetaLeft|MetaRight|OSLeft|OSRight)$/;      // no se pueden asignar
const CTL_OK = c => typeof c === 'string' && /^[A-Za-z0-9]{2,20}$/.test(c);
function ctlBinds(id){                                       // [hueco1, hueco2] de una acción (con lo guardado o con lo de serie)
  const a = CTL_ACTIONS.find(x => x.id === id), c = save.controls && save.controls[id];
  const b = Array.isArray(c) ? c : a.def;
  return [CTL_OK(b[0]) ? b[0] : null, CTL_OK(b[1]) ? b[1] : null];
}
const ctlIs = (id, code) => ctlBinds(id).includes(code);
function ctlHeld(id){                                        // ¿está pulsada alguna de las teclas / botones de esa acción?
  for(const c of ctlBinds(id)){
    if(!c) continue;
    if(c === 'Mouse0'){ if(mouse.l) return true; }
    else if(c === 'Mouse2'){ if(mouse.r) return true; }
    else if(/^Mouse/.test(c)){ if(mouse.b && mouse.b[c]) return true; }
    else if(keys[c]) return true;
  }
  return false;
}
const ctlAny = code => CTL_ACTIONS.some(a => ctlIs(a.id, code));
const CTL_NAMES = {Space:'ESP', Mouse0:'CLIC I', Mouse1:'CLIC C', Mouse2:'CLIC D', Mouse3:'RATÓN 4', Mouse4:'RATÓN 5', ArrowUp:'↑', ArrowDown:'↓', ArrowLeft:'←', ArrowRight:'→',
  ShiftLeft:'SHIFT', ShiftRight:'SHIFT D', ControlLeft:'CTRL', ControlRight:'CTRL D', AltLeft:'ALT', AltRight:'ALT GR', Enter:'ENTER', Backquote:'º', Minus:'-', Equal:'=', Comma:',', Period:'.', Slash:'/', Semicolon:';', Quote:"'", BracketLeft:'[', BracketRight:']', Backslash:'\\', CapsLock:'BLOQ MAYÚS', NumpadEnter:'ENTER N'};
function ctlLabel(code){                                     // nombre corto de una tecla / botón, para mostrarlo
  if(!code) return '—';
  if(CTL_NAMES[code]) return CTL_NAMES[code];
  let m = /^Key([A-Z])$/.exec(code); if(m) return m[1];
  m = /^Digit(\d)$/.exec(code); if(m) return m[1];
  m = /^Numpad(\w+)$/.exec(code); if(m) return 'N' + m[1].replace('Add', '+').replace('Subtract', '-').replace('Multiply', '*').replace('Divide', '/').replace('Decimal', '.');
  return code.toUpperCase();
}
const ctlShort = id => { const b = ctlBinds(id).find(Boolean); return b ? ctlLabel(b) : '—'; };      // la tecla principal de una acción (la que sale en el HUD)
const ctlKey = i => ctlShort(['dash', 'melee', 'shot', 'buff', 'strong'][i]);                         // la tecla de cada ataque de la barra de abajo (en el orden de MV)
function ctlSet(id, slot, code){                             // asigna un código a un hueco; si ya lo usaba otro hueco, se intercambian
  const cur = ctlBinds(id).slice(), old = cur[slot];
  if(code){
    for(const a of CTL_ACTIONS){
      const b = ctlBinds(a.id).slice(); let ch = false;
      b.forEach((c, k) => { if(c === code && !(a.id === id && k === slot)){ b[k] = old; ch = true; } });
      if(ch){ (save.controls = save.controls || {})[a.id] = a.id === id ? cur : b; if(a.id === id) cur.splice(0, 2, ...b); else save.controls[a.id] = b; }
    }
  }
  cur[slot] = code || null; (save.controls = save.controls || {})[id] = cur; persist();
}
function ctlReset(){ save.controls = {}; persist(); }

// ---------------------------------------------------------------------
// Pantalla de Ajustes: la tabla de controles (la llama openSettings, menu.js)
// ---------------------------------------------------------------------
function ctlSettingsHtml(){
  return `<h2>Controles</h2>
    <p class="help">Pulsa un recuadro y luego la tecla o el botón del ratón que quieras. <b>Esc</b> cancela y <b>Retroceso</b> lo deja vacío. Cada acción tiene dos huecos. (El clic izquierdo no se puede elegir al asignar; vuelve con «Restablecer».)</p>
    <div id="ctlGrid">${CTL_ACTIONS.map(a => `<span class="ctlN">${a.n}</span>` + [0, 1].map(s => `<button class="ctlB" data-a="${a.id}" data-s="${s}"></button>`).join('')).join('')}</div>
    <div class="cbtns"><button id="ctlReset">Restablecer controles</button></div>`;
}
let ctlCapOff = null;                                        // función que cancela la captura en curso
function ctlPaint(){
  document.querySelectorAll('#ctlGrid .ctlB').forEach(b => { const c = ctlBinds(b.dataset.a)[+b.dataset.s]; b.textContent = ctlLabel(c); b.classList.toggle('empty', !c); b.classList.remove('cap'); });
}
function ctlSettingsBind(){
  const grid = document.getElementById('ctlGrid'); if(!grid) return;
  ctlPaint();
  grid.onclick = e => {
    const b = e.target.closest('.ctlB'); if(!b) return;
    if(ctlCapOff) ctlCapOff();
    const id = b.dataset.a, slot = +b.dataset.s;
    b.classList.add('cap'); b.textContent = 'Pulsa...';
    const off = () => { removeEventListener('keydown', onKey, true); removeEventListener('mousedown', onMouse, true); ctlCapOff = null; ctlPaint(); };
    const done = code => { off(); ctlSet(id, slot, code); ctlPaint(); };
    const onKey = ev => {
      ev.preventDefault(); ev.stopImmediatePropagation();
      if(ev.repeat) return;
      if(ev.code === 'Escape') return off();
      if(ev.code === 'Backspace' || ev.code === 'Delete') return done(null);
      if(CTL_RESERVED.test(ev.code)){ if(typeof toast === 'function') toast('Esa tecla está reservada (' + ctlLabel(ev.code) + ').'); return; }
      done(ev.code);
    };
    const onMouse = ev => {
      if(ev.button === 0) return off();                                // un clic izquierdo (por ejemplo en otro botón) cancela la captura sin tocar nada
      ev.preventDefault(); ev.stopImmediatePropagation(); done('Mouse' + ev.button);
    };
    ctlCapOff = off; addEventListener('keydown', onKey, true); addEventListener('mousedown', onMouse, true);
  };
  document.getElementById('ctlReset').onclick = () => { if(ctlCapOff) ctlCapOff(); ctlReset(); ctlPaint(); if(typeof toast === 'function') toast('Controles restablecidos.'); };
}
