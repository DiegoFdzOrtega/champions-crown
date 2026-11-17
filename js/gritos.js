"use strict";
/* =====================================================================
   «¡VE, CHARIZARD!»: el entrenador grita al sacar un Pokémon (al empezar el combate y en cada cambio), en un bocadillo de cómic
   encima de él. En el estadio grande (js/torreestadio.js) sale sobre su plataforma y la Poké Ball se lanza DESDE el entrenador.
   Tú: «¡Ve, X!» · el rival: «¡Adelante, X!». GR.on = false lo apaga.
   ===================================================================== */
const GR = {on: true, dur: 1.7, size: 8};                                   // [AJUSTE] encendido · segundos que se ve · tamaño de la letra
const grList = [];
const grMine = () => (g && g.pvp && g.me === 'e') ? 'e' : 'p';
function grSay(side, f){
  if(!GR.on || !f || !f.m) return;
  const name = f.m.name || '';
  for(let i = grList.length - 1; i >= 0; i--) if(grList[i].side === side) grList.splice(i, 1);   // un bocadillo por entrenador
  grList.push({side, txt: side === grMine() ? `¡Ve, ${name}!` : `¡Adelante, ${name}!`, t0: performance.now() / 1000});
}
// Dónde está cada entrenador (la punta del bocadillo apunta ahí)
function grAnchor(side){
  if(typeof teOn === 'function' && teOn()){
    const P = teR2W([...TE_EST.plat[(side === 'p') ? 0 : 1], 0, 0]);                         // 'p' siempre en la plataforma de la izquierda
    return {x: P.x, y: P.y - 62};
  }
  const O = swOrigin(side); return {x: O.x, y: O.y - 30};
}
function grDraw(){
  if(!grList.length || !g) return;
  const now = performance.now() / 1000, Z = (typeof teOn === 'function' && teOn()) ? .75 / Math.max(.3, TE.cam.z) : 1;
  for(let i = grList.length - 1; i >= 0; i--){
    const b = grList[i], u = now - b.t0; if(u > GR.dur){ grList.splice(i, 1); continue; }
    const A = grAnchor(b.side), pop = u < .18 ? swBack(u / .18) : 1, fade = u > GR.dur - .25 ? (GR.dur - u) / .25 : 1;
    ctx.save(); ctx.translate(A.x, A.y); ctx.scale(Z * pop, Z * pop); ctx.globalAlpha = Math.max(0, fade);
    const sz = GR.size; ctx.font = `${sz}px ${FONT}`; const w = ctx.measureText(b.txt).width + 16, h = sz + 14;
    let bx = -w / 2; if(b.side === 'p') bx = Math.max(bx, -30); else bx = Math.min(bx, 30 - w);                              // que no se salga hacia fuera del campo
    const by = -h - 10;
    ctx.fillStyle = '#10141e'; ctx.beginPath(); ctx.roundRect(bx - 2, by - 2, w + 4, h + 4, 7); ctx.fill();                  // contorno
    ctx.beginPath(); ctx.moveTo(-7, by + h); ctx.lineTo(0, 2); ctx.lineTo(7, by + h); ctx.closePath(); ctx.fill();              // pico hacia el entrenador
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(bx, by, w, h, 5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-4.5, by + h - 1); ctx.lineTo(0, -1); ctx.lineTo(4.5, by + h - 1); ctx.closePath(); ctx.fill();
    text(b.txt, bx + w / 2, by + h / 2 + sz / 2, sz, '#10141e', 'center');
    ctx.restore();
  }
}
// ---- Enganches ----
{ const o = swapStart; swapStart = function(side, idx, quick){                // cada cambio: grito y, en el estadio, la bola sale de la mano del entrenador
    const s = o.apply(this, arguments);
    try{ const list = side === 'p' ? g.p : g.e; grSay(side, list[idx]); if(s && typeof teOn === 'function' && teOn()){ const A = grAnchor(side); s.O = {x: A.x, y: A.y + 40}; } }catch(e){}
    return s;
  }; }
{ const o = swapDraw; swapDraw = function(){ o.apply(this, arguments); try{ grDraw(); }catch(e){} }; }
{ const o = startBattle; startBattle = function(){                              // al empezar: los dos sacan su primer Pokémon
    const r = o.apply(this, arguments);
    try{ grList.length = 0; if(g && g.p && g.e){ grSay('p', g.p[g.pi]); setTimeout(() => { if(g && g.e) grSay('e', g.e[g.ei]); }, 450); } }catch(e){}
    return r;
  }; }
