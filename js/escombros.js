"use strict";
/* =====================================================================
   ESCOMBROS QUE SALTAN (como en Pokémon Battlegrounds): piedrecitas que salen volando, caen, botan y se quedan
   un momento en el suelo antes de desaparecer.
     Terremoto ............ al aterrizar el salto, un montón de piedras alrededor
     Golpe muy fuerte ..... a melé, si quita de golpe ≥ ESC.fuerte de la vida: unas pocas piedras donde golpea
   Solo dibujo: no cambia nada del combate y no usa Math.random (el azar sale de una semilla), así el online no se entera.
   ESC.on = false lo apaga.
   ===================================================================== */
const ESC = {on: true, max: 140, quake: 26, golpe: 7, fuerte: .2, grav: 900, vida: 2.4};   // [AJUSTE]
const ESC_COL = ['#8a6a48', '#a3825c', '#6e5238', '#b8a184', '#5c4a3a'];
let escList = [], escG = null, escT = null, escSemilla = 1;
function escRnd(){ escSemilla = (escSemilla * 16807) % 2147483647; return escSemilla / 2147483647; }

function escSoltar(x, y, n, fuerza){
  if(!ESC.on || !g) return;
  if(escG !== g){ escG = g; escList = []; escT = null; }
  escSemilla = (Math.floor(x * 31 + y * 17 + (g.t || 0) * 1000) % 2147483646) + 1;
  for(let i = 0; i < n; i++){
    const a = escRnd() * 6.283, v = (60 + escRnd() * 170) * fuerza, r = 6 + escRnd() * 22;
    escList.push({x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * .6, z: 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .55, vz: (180 + escRnd() * 260) * fuerza,
      s: 4 + escRnd() * 6, c: ESC_COL[Math.floor(escRnd() * ESC_COL.length)], rot: escRnd() * 6.283, vr: (escRnd() - .5) * 16, vida: ESC.vida * (.7 + escRnd() * .6), t: 0, botes: 0});
  }
  if(escList.length > ESC.max) escList.splice(0, escList.length - ESC.max);
}

function escDibuja(){
  if(!ESC.on || !g || g !== escG || !escList.length) return;
  const dt = escT == null ? 0 : Math.max(0, Math.min(.05, g.t - escT)); escT = g.t;
  ctx.save();
  for(let i = escList.length - 1; i >= 0; i--){
    const p = escList[i];
    p.t += dt; if(p.t > p.vida){ escList.splice(i, 1); continue; }
    if(p.z > 0 || p.vz > 0){ p.vz -= ESC.grav * dt; p.z += p.vz * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if(p.z <= 0){ p.z = 0; if(p.botes < 2 && Math.abs(p.vz) > 60){ p.vz = -p.vz * .35; p.vx *= .5; p.vy *= .5; p.botes++; } else { p.vz = 0; p.vx = 0; p.vy = 0; p.vr = 0; } } }
    const A = Math.min(1, (p.vida - p.t) / .5);
    ctx.globalAlpha = .3 * A; ctx.fillStyle = '#000';                                                   // sombra en el suelo
    ctx.beginPath(); ctx.ellipse(p.x, p.y + 1, p.s * .9, p.s * .35, 0, 0, 6.283); ctx.fill();
    ctx.globalAlpha = A; ctx.save(); ctx.translate(p.x, p.y - p.z); ctx.rotate(p.rot);                    // la piedra (un polígono irregular)
    ctx.fillStyle = p.c; ctx.beginPath(); ctx.moveTo(-p.s, -p.s * .3); ctx.lineTo(-p.s * .2, -p.s * .9); ctx.lineTo(p.s * .8, -p.s * .5); ctx.lineTo(p.s, p.s * .4); ctx.lineTo(0, p.s * .8); ctx.lineTo(-p.s * .7, p.s * .5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(-p.s * .4, -p.s * .6, p.s * .5, p.s * .3);   // brillo arriba
    ctx.restore();
  }
  ctx.restore();
}

// Terremoto: al aterrizar (js/terremoto.js llama otra vez a quakeStart con f.tjGo = 1)
if(typeof quakeStart === 'function'){ const o = quakeStart; quakeStart = function(f){
  const r = o.apply(this, arguments);
  try{ if(f && (f.tjGo || typeof TJ === 'undefined') && f.quake) escSoltar(f.x, f.y, ESC.quake, 1.1); }catch(e){}
  return r; }; }
// golpe muy fuerte a melé
if(typeof hit === 'function'){ const o = hit; hit = function(T, dmg, type, A, close){
  const hp0 = T ? T.hp : 0, r = o.apply(this, arguments);
  try{ if(T && close && T.max > 0 && hp0 - T.hp >= T.max * ESC.fuerte) escSoltar(T.x, T.y, ESC.golpe, .7); }catch(e){}
  return r; }; }
// se dibuja encima de los Pokémon, dentro del campo (después de megaDraw, js/mega.js)
if(typeof megaDraw === 'function'){ const o = megaDraw; megaDraw = function(){ const r = o.apply(this, arguments); try{ escDibuja(); }catch(e){} return r; }; }
