"use strict";
/* =====================================================================
   CHOQUE CUERPO A CUERPO: si los dos se dan un golpe (clic izquierdo) casi a la vez y cara a cara, los golpes chocan:
   ninguno hace daño (al primero se le devuelve la vida que quitó), destello de choque con chispas y un aro, sonido de choque,
   un pequeño parón y los dos salen empujados hacia atrás. Sin texto.
   MCH.ventana = segundos de diferencia que cuentan como «a la vez» · MCH.dist = distancia máxima entre los dos · MCH.empuje = lo que se separan.
   ===================================================================== */
const MCH = {on: true, ventana: .16, dist: 150, empuje: 520, parada: .07};
let MCHfx = [];
const mchFace = (f, T, ang) => { let d = Math.atan2(T.y - f.y, T.x - f.x) - ang; d = Math.atan2(Math.sin(d), Math.cos(d)); return Math.abs(d) < 1.2; };
if(typeof hit === 'function'){ const o = hit; hit = function(T, dmg, type, A, close){            // se apunta el último golpe cuerpo a cuerpo (por si hay que devolverlo)
  const hp0 = T ? T.hp : 0, r = o.apply(this, arguments);
  if(T && A && close && g) T.mchLast = {A, d: hp0 - T.hp, t: g.t};
  return r; }; }
if(typeof melee === 'function'){ const o = melee; melee = function(f, ang, dmg, type, mine){
  try{
    const T = MCH.on && g && !g.pvp ? foe(mine) : null, S = T && T.swing;
    if(S && !S.mch && T.mchAng != null && g.t - S.t0 < MCH.ventana && !T.dead && !f.dead && Math.hypot(T.x - f.x, T.y - f.y) < MCH.dist
       && mchFace(f, T, ang) && mchFace(T, f, T.mchAng)){
      S.mch = 1; f.swing = {t0: g.t, k: S.k, ang, type, big: false, mch: 1};
      const L = f.mchLast; if(L && L.A === T && g.t - L.t < MCH.ventana + .05 && L.d > 0){ f.hp = Math.min(f.max, f.hp + L.d); f.mchLast = null;
        g.pops = g.pops.filter(p => !(Math.abs(p.x - f.x) < 70 && p.t > .7 && (/^\d+$/.test(p.txt) || /CR[IÍ]TICO|eficaz/i.test(p.txt)))); f.v6n = null; }   // y fuera su número de daño   // el golpe del otro no cuenta
      mchClash(f, T, type, T.mchType);
      return;                                                                                      // el mío tampoco
    }
  }catch(e){}
  f.mchAng = ang; f.mchType = type;
  return o.apply(this, arguments); }; }
function mchClash(a, b, ta, tb){
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - 18, an = Math.atan2(b.y - a.y, b.x - a.x);
  [[a, an + Math.PI], [b, an]].forEach(([f, d]) => { f.kx = (f.kx || 0) + Math.cos(d) * MCH.empuje; f.ky = (f.ky || 0) + Math.sin(d) * MCH.empuje * .6; setAct(f, 'Hurt', .25); });
  try{ fxBurst(mx, my, [TC[ta] || '#ffffff', TC[tb] || '#ffffff', '#ffffff', '#fff3a0'], 22, 300); }catch(e){}
  fx.shake = Math.max(fx.shake, 9); if(typeof fxhd !== 'undefined') fxhd.stop = Math.max(fxhd.stop || 0, MCH.parada);
  if(typeof Sfx !== 'undefined'){ Sfx.play('clash', 1); Sfx.play('crit', .6); }
  MCHfx.push({x: mx, y: my, t0: g.t, ca: TC[ta] || '#ffffff', cb: TC[tb] || '#ffffff', an});
}
function mchDraw(){
  if(!g) return;
  for(let i = MCHfx.length - 1; i >= 0; i--){ const e = MCHfx[i], u = (g.t - e.t0) / .45; if(u >= 1 || u < 0){ MCHfx.splice(i, 1); continue; }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const r = 20 + 70 * u, G = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r);                // destello
    G.addColorStop(0, `rgba(255,255,255,${1 - u})`); G.addColorStop(.5, `rgba(255,240,180,${.6 * (1 - u)})`); G.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = G; ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, 6.3); ctx.fill();
    ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'round';
    for(let k = 0; k < 10; k++){ const a = e.an + Math.PI / 2 + (k - 4.5) * .3 + (k % 2 ? Math.PI : 0), d0 = 10 + 50 * u, d1 = d0 + 30 * (1 - u);   // chispas a los lados (perpendicular al choque)
      ctx.globalAlpha = 1 - u; ctx.strokeStyle = k % 3 ? '#ffffff' : (k % 2 ? e.ca : e.cb); ctx.lineWidth = 4 * (1 - u) + 1;
      ctx.beginPath(); ctx.moveTo(e.x + Math.cos(a) * d0, e.y + Math.sin(a) * d0); ctx.lineTo(e.x + Math.cos(a) * d1, e.y + Math.sin(a) * d1); ctx.stroke(); }
    ctx.globalAlpha = (1 - u) * .9; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;                // estrella de 4 puntas
    const s = 30 * (1 - u * .5); ctx.beginPath(); ctx.moveTo(e.x - s, e.y); ctx.lineTo(e.x + s, e.y); ctx.moveTo(e.x, e.y - s * 1.3); ctx.lineTo(e.x, e.y + s * 1.3); ctx.stroke();
    ctx.globalAlpha = (1 - u) * .8; ctx.lineWidth = 2; const R = 14 + 60 * u; ctx.beginPath(); ctx.ellipse(e.x, e.y + 34, R, R * .36, 0, 0, 6.3); ctx.stroke();   // aro en el suelo
    ctx.restore(); }
}
if(typeof megaDraw === 'function'){ const o = megaDraw; megaDraw = function(){ const r = o.apply(this, arguments); try{ mchDraw(); }catch(e){} return r; }; }
