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
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code) && g) e.preventDefault();
  if(e.code==='KeyR' && g) megaPlayer();                       // R = megaevolucionar (js/mega.js). Cambiar de Pokémon: 1 · 2 · 3 o clic en su cuadrito
  if(e.code==='Digit1') switchMon(0); if(e.code==='Digit2') switchMon(1); if(e.code==='Digit3') switchMon(2);
});
addEventListener('keyup', e=> keys[e.code] = false);
addEventListener('blur', ()=>{ for(const k in keys) keys[k] = false; mouse.l = mouse.r = false; });
function setMouse(e){ const r = cv.getBoundingClientRect(); mouse.x = (e.clientX-r.left)*W/r.width; mouse.y = (e.clientY-r.top)*H/r.height; }
cv.addEventListener('mousemove', e=>{ setMouse(e); const k = g && !g.paused ? hudIconAt(mouse.x, mouse.y) : -1; cv.style.cursor = k >= 0 && !g.p[k].dead && k !== g.pi ? 'pointer' : ''; });   // manita sobre los cuadritos del equipo
cv.addEventListener('mousedown', e=>{ setMouse(e);
  if(e.button===0 && g && !g.over && !g.paused && megaBadgeAt(mouse.x, mouse.y)){ megaPlayer(); return; }     // clic en el hueco de megaevolución
  if(e.button===0 && g && !g.over && !g.paused){ const k = hudIconAt(mouse.x, mouse.y); if(k >= 0){ switchMon(k); return; } }     // clic en un cuadrito del equipo = cambiar de Pokémon (no dispara)
  if(e.button===0) mouse.l = true; if(e.button===2) mouse.r = true; });
addEventListener('mouseup', e=>{ if(e.button===0) mouse.l = false; if(e.button===2) mouse.r = false; });
cv.addEventListener('contextmenu', e=>e.preventDefault());
addEventListener('resize', resize);

if(document.fonts) document.fonts.load('10px "Press Start 2P"');
resize(); buildMain(); show('main'); requestAnimationFrame(loop);
