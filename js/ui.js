"use strict";
/* =====================================================================
   7) PANTALLAS, TECLADO Y RATÓN
   ===================================================================== */
const $ = id => document.getElementById(id);
const VIEWS = ['main','regions','tower','panel','result','dexv','gachav','teamv'];
function show(w){ VIEWS.forEach(v => $(v).classList.toggle('hide', v !== w)); Music.scene(w); }          // la música cambia sola según la pantalla (music.js)

setInterval(()=>{                                 // dibuja las miniaturas cuando cargan los sprites
  [[thumbs,'tower'],[dexThumbs,'panel']].forEach(([arr,v])=>{
    if($(v).classList.contains('hide')) return;
    arr.forEach(({c,m,s})=>{
      const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height);
      if(!drawFrame(x, m.dex, 'Idle', 0, 0, c.width/2, c.height/2, c.width/32, c.width - 8, s)){
        x.fillStyle = TC[m.types[0]]; x.beginPath(); x.arc(c.width/2, c.height/2, c.width*.34, 0, 7); x.fill();
      }
    });
  });
}, 400);
$('btnBack1').onclick = goRegions; $('btnBack2').onclick = goMain; $('btnTeam').onclick = () => openTeam('story');           // desde la Historia: al cerrar el equipo se vuelve a la Historia

addEventListener('click', e => { const b = e.target.closest && e.target.closest('button'); if(b && !b.disabled) Sfx.play('click'); }, true);   // efecto de clic en todos los botones

addEventListener('keydown', e=>{
  keys[e.code] = true;
  if(e.code === 'KeyM' && !(e.target && (e.target.tagName === 'TEXTAREA' || (e.target.tagName === 'INPUT' && /^(text|search|number|email|password|url|tel)$/i.test(e.target.type))))){ Music.toggleMute(); toast(save.mute ? 'Sonido silenciado (M)' : 'Sonido activado (M)'); const mu = $('mute'); if(mu) mu.checked = !!save.mute; }   // M: silenciar / activar
  if(!$('main').classList.contains('hide')) mainKey(e);
  if(e.code === 'Escape'){ if(!g) back(); else if(!g.over) pauseBattle(!g.paused); }   // Esc: menú atrás · en combate: pausa / continuar
  if(g && (/^(Space|Arrow(Up|Down|Left|Right)|Tab)$/.test(e.code) || ctlAny(e.code))) e.preventDefault();      // en combate las teclas del juego no desplazan la página
  if(g && !e.repeat){                                          // (teclas configurables: js/controls.js)
    if(ctlIs('mega', e.code)) megaPlayer();                    // megaevolucionar (js/mega.js)
    if(ctlIs('sw1', e.code)) switchMon(0); if(ctlIs('sw2', e.code)) switchMon(1); if(ctlIs('sw3', e.code)) switchMon(2);      // cambiar de Pokémon (o clic en su cuadrito)
  }
});
addEventListener('keyup', e=> keys[e.code] = false);
addEventListener('blur', ()=>{ for(const k in keys) keys[k] = false; mouse.l = mouse.r = false; mouse.b = {}; });
function setMouse(e){ const r = cv.getBoundingClientRect(); viewCalc(); mouse.x = ((e.clientX-r.left)*cv.width/r.width - VIEW.ox) / VIEW.sx; mouse.y = ((e.clientY-r.top)*cv.height/r.height - VIEW.oy) / VIEW.sy; }
cv.addEventListener('mousemove', e=>{ setMouse(e); const k = g && !g.paused ? hudIconAt(mouse.x, mouse.y) : -1; cv.style.cursor = k >= 0 && !myList()[k].dead && k !== myIdx() ? 'pointer' : ''; });   // manita sobre los cuadritos del equipo
cv.addEventListener('mousedown', e=>{ setMouse(e);
  if(e.button===0 && g && !g.over && !g.paused && megaBadgeAt(mouse.x, mouse.y)){ megaPlayer(); return; }     // clic en el hueco de megaevolución
  if(e.button===0 && g && !g.over && !g.paused){ const k = hudIconAt(mouse.x, mouse.y); if(k >= 0){ switchMon(k); return; } }     // clic en un cuadrito del equipo = cambiar de Pokémon (no dispara)
  const c = 'Mouse' + e.button;
  if(e.button===0) mouse.l = true; else if(e.button===2) mouse.r = true; else mouse.b[c] = true;       // rueda / botones laterales (si están asignados)
  if(g && !g.over && !g.paused){                                // megaevolución y cambio de Pokémon también pueden ir en un botón del ratón
    if(e.button > 2) e.preventDefault();
    if(ctlIs('mega', c)) megaPlayer(); [0, 1, 2].forEach(i => { if(ctlIs('sw' + (i + 1), c)) switchMon(i); }); } });
addEventListener('mouseup', e=>{ if(e.button===0) mouse.l = false; else if(e.button===2) mouse.r = false; else mouse.b['Mouse' + e.button] = false; });
cv.addEventListener('contextmenu', e=>e.preventDefault());
addEventListener('resize', resize);

if(document.fonts) document.fonts.load('10px "Press Start 2P"');
resize(); buildMain(); show('main'); requestAnimationFrame(loop);
