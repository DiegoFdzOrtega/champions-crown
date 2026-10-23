"use strict";
/* =====================================================================
   18) ANIMACIÓN DE CAMBIO DE POKÉMON (estilo anime)
   Se usa cuando cambias con las teclas 1, 2, 3 (o R) y cuando entra otro Pokémon tras un debilitamiento (tuyo o del rival).
   Fases (los tiempos están en SWAP):
     1) RETIRADA  : sale un rayo rojo de la Poké Ball, alcanza al Pokémon, lo vuelve luz roja y lo absorbe hacia la bola.
     2) LANZAMIENTO: la Poké Ball del nuevo Pokémon (su color depende de su rareza, como en el Gachapon) vuela en arco hasta el suelo.
     3) APERTURA  : la bola se abre con un destello, onda de luz y chispas, y el Pokémon sale como una silueta blanca que recupera su color.
   Mientras dura, el Pokémon que entra está "fantasma" (ghost): no se dibuja como siempre, no recibe golpes ni se puede mover ni atacar.
   No se puede empezar otro cambio tuyo hasta que acabe. Si el Pokémon se debilitó, se salta la retirada (ya se había ido).
   El estado vive en g.sw (lista de cambios en curso). Las funciones que usa el combate: swapStart · swapUpdate · swapBusy · swapDraw.
   ===================================================================== */
const SWAP = {recall:.78, thrown:.5, open:.7};             // segundos de cada fase (retirada · lanzamiento · apertura)
const swClamp = v => Math.max(0, Math.min(1, v));
const swEaseIn = u => u * u, swEaseOut = u => 1 - (1 - u) * (1 - u) * (1 - u);
const swBack = u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };   // sale con un pequeño "rebote"

// Dónde está la Poké Ball "en la mano" de cada lado (tu esquina de abajo a la izquierda · la del rival, arriba a la derecha)
const swOrigin = side => side === 'p' ? {x:64, y:H - 150} : {x:W - 64, y:196};
function swBallType(f){ if(f.shiny) return 'shiny'; const d = DEX[f.m.dex - 1]; return (d && d.rar) || 'common'; }

// ---------------------------------------------------------------------
// Dibujo de la Poké Ball (reutiliza el sprite del Gachapon, partido en dos mitades al abrirse)
// ---------------------------------------------------------------------
const SW_IMG = {};
function swBallImg(type){
  if(typeof ballURL !== 'function') return null;
  let im = SW_IMG[type]; if(!im){ im = new Image(); im.src = ballURL(type); SW_IMG[type] = im; }
  return im.complete && im.naturalWidth ? im : null;
}
function swBall(type, x, y, sc, rot, open){                       // open = ángulo (rad) de la tapa superior; 0 = cerrada
  const im = swBallImg(type), s = sc * ESCALA * 1.25;
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.imageSmoothingEnabled = false;
  if(!im){ ctx.fillStyle = '#e23b3b'; ctx.beginPath(); ctx.arc(0, 0, 8 * s, 0, 7); ctx.fill(); ctx.restore(); return; }
  ctx.rotate(rot || 0);
  if(!open) ctx.drawImage(im, -8 * s, -8 * s, 16 * s, 16 * s);
  else{
    ctx.drawImage(im, 0, 8, 16, 8, -8 * s, 0, 16 * s, 8 * s);                                   // mitad de abajo
    ctx.translate(7 * s, 0); ctx.rotate(-open); ctx.translate(-7 * s, 0);                       // la tapa gira sobre la bisagra de atrás
    ctx.drawImage(im, 0, 0, 16, 8, -8 * s, -8 * s, 16 * s, 8 * s);
  }
  ctx.restore();
}
function swGlow(x, y, r, a, col){
  if(a <= 0 || r <= 0) return; col = col || '255,255,255';
  const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.45, `rgba(${col},${a * .5})`); gr.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}

// ---------------------------------------------------------------------
// Pokémon teñido (silueta roja o blanca): se dibuja su cuadro actual en un lienzo aparte y se le pone el color encima
// ---------------------------------------------------------------------
const SWC = document.createElement('canvas'); SWC.width = SWC.height = 320; const SWX = SWC.getContext('2d');
function swSprite(f, x, y, sc, tint, amt, alpha){
  SWX.setTransform(1, 0, 0, 1, 0, 0); SWX.clearRect(0, 0, 320, 320); SWX.globalCompositeOperation = 'source-over'; SWX.globalAlpha = 1;
  drawFrame(SWX, f.m.dex, f.act, f.at, f.dir, 160, 160, ESCALA, 0, f.shiny);
  if(amt > 0){ SWX.globalCompositeOperation = 'source-atop'; SWX.globalAlpha = swClamp(amt); SWX.fillStyle = tint; SWX.fillRect(0, 0, 320, 320); SWX.globalAlpha = 1; SWX.globalCompositeOperation = 'source-over'; }
  ctx.save(); ctx.globalAlpha = swClamp(alpha); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(SWC, Math.round(x - 160 * sc), Math.round(y - 160 * sc), Math.round(320 * sc), Math.round(320 * sc)); ctx.restore();
}

// Rayo de energía de la Poké Ball (pixel art: capas roja, naranja y núcleo blanco, con ondulación)
function swBeam(ox, oy, tx, ty, t, power){
  if(power <= 0) return;
  const len = Math.hypot(tx - ox, ty - oy), n = Math.max(2, Math.ceil(len / PXS)), ang = Math.atan2(ty - oy, tx - ox), nx = -Math.sin(ang), ny = Math.cos(ang);
  ctx.save(); ctx.imageSmoothingEnabled = false;
  const layers = [[6, '#b3121c', .45], [4, '#ff3b30', .9], [2, '#ffb09a', 1], [1, '#ffffff', 1]];
  for(const [w, col, al] of layers){
    ctx.globalAlpha = al * Math.min(1, power * 1.2);
    for(let i = 0; i <= n; i++){
      const u = i / n, wob = Math.sin(i * .33 - t * 38) * 1.6 * PXS * Math.min(1, u * 3) * (w > 2 ? 1 : .4);
      const x = ox + (tx - ox) * u + nx * wob, y = oy + (ty - oy) * u + ny * wob, th = Math.max(1, Math.round(w * power));
      ctx.fillStyle = col; ctx.fillRect(snap(x - th * PXS / 2), snap(y - th * PXS / 2), th * PXS, th * PXS);
    }
  }
  ctx.globalAlpha = Math.min(1, power);                                    // motas de luz que viajan por el rayo hacia la bola
  for(let k = 0; k < 11; k++){
    const u = 1 - ((k / 11 + t * 2.4) % 1), x = ox + (tx - ox) * u + nx * Math.sin(k * 5.1 + t * 20) * 5, y = oy + (ty - oy) * u + ny * Math.sin(k * 5.1 + t * 20) * 5;
    ctx.fillStyle = k % 3 ? '#ffffff' : '#ffd0c4'; ctx.fillRect(snap(x), snap(y), PXS * (k % 4 === 0 ? 2 : 1), PXS * (k % 4 === 0 ? 2 : 1));
  }
  ctx.restore();
}

// ---------------------------------------------------------------------
// Lógica: empezar, avanzar y terminar un cambio
// ---------------------------------------------------------------------
const swapBusy = side => !!(g && g.sw && g.sw.some(s => !side || s.side === side));   // ¿hay un cambio en curso? (de un lado, o de cualquiera)

function swapStart(side, idx, quick){      // quick = el Pokémon ya se había debilitado: no hay retirada, solo lanzamiento y apertura
  const list = side === 'p' ? g.p : g.e, cur = side === 'p' ? g.pi : g.ei, from = list[cur], to = list[idx];
  const s = {side, idx, from, to, t:0, tR: quick ? 0 : SWAP.recall, tT:SWAP.thrown, tO:SWAP.open, O:swOrigin(side), L:{x:from.x, y:from.y}, bf:swBallType(from), bt:swBallType(to), swapped:false, landed:false, opened:false};
  (g.sw = g.sw || []).push(s);
  if(quick){ g.shots = []; swapDo(s); }
  else{ from.ghost = true; if(typeof Sfx !== 'undefined') Sfx.play('recall'); }
  return s;
}
function swapDo(s){                        // el Pokémon que entra pasa a ser el activo (aún invisible hasta que se abra la bola)
  const o = s.from, n = s.to;
  if(s.side === 'p') g.pi = s.idx; else g.ei = s.idx;
  n.x = s.L.x; n.y = s.L.y; n.dir = o.dir; n.act = 'Idle'; n.at = 0; n.lock = 0; n.ghost = true;
  o.ghost = false; s.swapped = true;
}
function swapUpdate(dt){
  if(!g.sw || !g.sw.length) return;
  for(const s of g.sw){
    s.t += dt;
    if(!s.swapped && s.t >= s.tR) swapDo(s);
    const I = idleInfo(s.to.m.dex), bx = s.L.x, by = s.L.y + I.foot * ESCALA - 8;
    if(!s.landed && s.t >= s.tR + s.tT){ s.landed = true; }
    if(!s.opened && s.t >= s.tR + s.tT + s.tO * .2){                                  // la bola se abre: destello y chispas
      s.opened = true; const B = (typeof BALLS !== 'undefined' && BALLS[s.bt]) || {top:'#e23b3b'};
      fxBurst(bx, by - 8, ['#ffffff', '#ffffff', '#fff3b0', '#bfe6ff', B.top], 34, 230, -Math.PI / 2, 5.8, {life:.65, s:2, rise:.25});
      fx.shake = Math.max(fx.shake, 3); if(typeof Sfx !== 'undefined') Sfx.play('sendout');
    }
  }
  g.sw = g.sw.filter(s => { if(s.t >= s.tR + s.tT + s.tO){ s.to.ghost = false; return false; } return true; });    // terminó: el combate sigue con normalidad
}

// ---------------------------------------------------------------------
// Dibujo de todos los cambios en curso (se llama desde render.js, después de los efectos)
// ---------------------------------------------------------------------
function swapDraw(){
  if(!g || !g.sw) return;
  for(const s of g.sw){ try{ swDrawOne(s); }catch(e){ s.err = true; } }
}
function swDrawOne(s){
  const t = s.t, O = s.O, L = s.L, f = s.from, I = idleInfo(s.to.m.dex), bx = L.x, by = L.y + I.foot * ESCALA - 8;
  // ---- 1) RETIRADA: rayo rojo que absorbe al Pokémon ----
  if(t < s.tR){
    const u = t / s.tR, bu = swClamp(u / .2), au = swClamp((u - .2) / .62), e = swEaseIn(au);
    const px = L.x + (O.x - L.x) * e * .96, py = L.y + (O.y - L.y) * e * .96, sc = 1 - .92 * e;
    const fade = u < .82 ? 1 : swClamp(1 - (u - .82) / .18);                                   // el rayo se apaga al final
    swGlow(O.x, O.y, 34 + 16 * Math.sin(t * 30), .55 * bu * fade, '255,70,50');
    swBall(s.bf, O.x, O.y, 1, 0, 0);
    swBeam(O.x, O.y, O.x + (px - O.x) * bu, O.y + (py - O.y) * bu, t, fade * (bu > .05 ? 1 : 0));
    if(au < 1){
      for(let k = 3; k >= 1; k--){ const ek = Math.max(0, e - k * .09); swSprite(f, L.x + (O.x - L.x) * ek * .96, L.y + (O.y - L.y) * ek * .96, 1 - .92 * ek, '#ff2a1c', 1, .22 / k * (au > 0 ? 1 : 0)); }   // estela de luz roja
      const hit = swClamp(bu * 3 - 1);                                                         // al llegar el rayo, el Pokémon se vuelve rojo brillante
      swSprite(f, px, py, sc, au < .5 ? '#ff3a2a' : '#ff9a88', Math.min(1, hit + au), au < .85 ? 1 : 1 - (au - .85) / .15);
      swGlow(px, py, 40 * sc + 8, .5 * hit * (1 - au * .5), '255,60,40');
    }
    if(u > .78){ const k = swClamp((u - .78) / .22); swGlow(O.x, O.y, 30 + 46 * Math.sin(k * Math.PI), .9 * Math.sin(k * Math.PI), '255,235,225'); }   // la bola se cierra con un fogonazo
    return;
  }
  // ---- 2) LANZAMIENTO: la Poké Ball del nuevo Pokémon vuela en arco ----
  const tt = (t - s.tR) / s.tT;
  if(tt < 1){
    const u = swClamp(tt), x = O.x + (bx - O.x) * u, y = O.y + (by - O.y) * u - Math.sin(u * Math.PI) * 130;
    for(let k = 1; k <= 4; k++){ const uk = Math.max(0, u - k * .045), xk = O.x + (bx - O.x) * uk, yk = O.y + (by - O.y) * uk - Math.sin(uk * Math.PI) * 130; ctx.globalAlpha = .28 / k; swBall(s.bt, xk, yk, .8, uk * 14, 0); }   // estela
    ctx.globalAlpha = 1; swBall(s.bt, x, y, 1, u * 14, 0);
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(bx, by + 8, 12 * (1 - Math.sin(u * Math.PI) * .4), 4, 0, 0, 7); ctx.fill();       // sombra en el suelo
    return;
  }
  // ---- 3) APERTURA: destello, onda de luz y salida del Pokémon ----
  const ou = swClamp((t - s.tR - s.tT) / s.tO), hop = swClamp(ou / .2), open = swEaseOut(swClamp((ou - .2) / .15));
  const ballA = 1 - swClamp((ou - .42) / .25), ballY = by - Math.sin(hop * Math.PI) * 12;
  if(ballA > 0){ ctx.globalAlpha = ballA; swBall(s.bt, bx, ballY, 1, hop < 1 ? (1 - hop) * .4 : 0, open * 1.35); ctx.globalAlpha = 1; }
  const k = swClamp((ou - .2) / .5);                                                           // intensidad del destello
  if(ou > .2 && k < 1){
    swGlow(bx, by - 18, 28 + 120 * swEaseOut(k), .95 * (1 - k), '255,255,255');
    const colW = 34 * (1 - k); ctx.save(); const gr = ctx.createLinearGradient(0, by, 0, by - 200);                                    // columna de luz
    gr.addColorStop(0, `rgba(255,255,255,${.85 * (1 - k)})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gr; ctx.fillRect(bx - colW / 2, by - 200, colW, 200); ctx.restore();
    ctx.save(); ctx.globalAlpha = Math.max(0, 1 - k * 1.1);                                                                              // las ondas de luz se desvanecen
    Rg(bx, by, 14 + 90 * swEaseOut(k), '#ffffff', (14 + 90 * swEaseOut(k)) * .38, 1);
    if(k > .12) Rg(bx, by, 8 + 60 * swEaseOut(k), '#bfe6ff', (8 + 60 * swEaseOut(k)) * .38, 1);
    ctx.restore();
  }
  const pu = swClamp((ou - .22) / .55);                                                        // el Pokémon sale: silueta blanca que recupera el color
  if(pu > 0){
    const eb = swBack(pu), sc = .15 + .85 * eb, y = by - 8 + ((L.y) - (by - 8)) * swEaseOut(pu);
    ctx.save(); ctx.globalAlpha = pu; shadow(L.x, L.y + I.foot * ESCALA - 2, Math.max(30, I.fw * ESCALA * .42)); ctx.restore();
    swSprite(s.to, L.x, y, sc, '#ffffff', 1 - Math.pow(pu, 1.6), Math.min(1, pu * 5));
    if(pu < .8) swGlow(L.x, y, 50 * sc, .55 * (1 - pu), '255,255,255');
  }
}
