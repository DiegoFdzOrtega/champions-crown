"use strict";
/* =====================================================================
   ESCENA DE COMBATE ESTILO JUEGO DE NINTENDO (fxhd5.js). No son más adornos en el proyectil: es lo que hace el juego alrededor del ataque.
     1) ESCENA: cuando lanzas un ataque FUERTE (tecla E) el campo se oscurece y se tiñe del color del tipo, y tú y el rival resaltáis (como cuando
        los juegos cambian el fondo al usar Rayo, Psíquico, Hidrobomba...). Sube en 0,15 s, aguanta y baja al impactar.
     2) PARPADEO: el Pokémon que recibe un golpe parpadea en blanco (el clásico «te han dado» de los juegos).
     3) ESTRELLA DE IMPACTO: el destello en estrella de picos, plano y con contorno, que sale en TODO golpe de Pokémon (cómics y juegos).
     4) EMPUJÓN DE CÁMARA: en golpes fuertes o muy eficaces la imagen se acerca un poco y vuelve (zoom).
   Todo depende de fxhd.on (Ajustes › Pantalla › Efectos de ataque mejorados).
   ===================================================================== */
fxhd.scene = null; fxhd.zoom = 0; fxhd.bursts = [];
const HD_SCENE = {fuego:[96,22,0], agua:[0,30,110], electrico:[26,20,92], hielo:[10,56,100], planta:[12,70,22], psiquico:[100,10,90], fantasma:[36,0,70], siniestro:[10,0,24],
  roca:[70,52,22], tierra:[80,50,16], dragon:[46,12,100], acero:[46,58,80], lucha:[90,34,10], veneno:[70,0,90], volador:[44,80,120], bicho:[50,80,12], hada:[120,44,100], normal:[50,50,60]};

// ---- 1) escena: se pinta justo después del suelo y ANTES de los Pokémon (los sprites quedan por encima, brillantes) ----
function hdSceneDim(dt){
  if(fxhd.zoom > 0) fxhd.zoom = Math.max(0, fxhd.zoom - dt / .28);
  const s = fxhd.scene; if(!s) return;
  s.t += (g.paused ? 0 : dt); if(s.t >= s.dur){ fxhd.scene = null; return; }
  const up = clamp01(s.t / .15), down = clamp01((s.dur - s.t) / .4), k = Math.min(up, down), c = HD_SCENE[s.type] || HD_SCENE.normal;
  ctx.save(); ctx.globalAlpha = .5 * k; ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`; ctx.fillRect(-20, -20, W + 40, H + 40);
  const gr = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * .62);                     // los bordes aún más oscuros (viñeta)
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.globalAlpha = k; ctx.fillStyle = gr; ctx.fillRect(-20, -20, W + 40, H + 40);
  ctx.restore();
}
const hdFxShotStart5 = fxShotStart;
fxShotStart = function(f, s, name, big){
  hdFxShotStart5(f, s, name, big);
  if(fxhd.on && big) fxhd.scene = {type:s.type, t:0, dur:1.6};
};

// ---- 2) y 4) parpadeo del que recibe el golpe, estrella y zoom ----
const hdFxHit5 = fxHit;
fxHit = function(T, name, type, mult, big, close, A){
  hdFxHit5(T, name, type, mult, big, close, A);
  if(!fxhd.on || mult === 0 || !g) return;
  T.hfT = g.t + (big || mult >= 2 ? .55 : .35);
  const k = (mult >= 2 ? 1.3 : mult < 1 ? .65 : 1) * (big ? 1.3 : close ? .85 : 1);
  fxhd.bursts.push({x:T.x, y:T.y - 8, type, k, t:0, dur:.34 + .08 * k, rot:Math.random() * 6.28, n:Math.random() < .5 ? 9 : 11});
  if(big || mult >= 2) fxhd.zoom = Math.max(fxhd.zoom, big ? 1 : .6);
  if(fxhd.scene && fxhd.scene.t < fxhd.scene.dur - .4) fxhd.scene.dur = fxhd.scene.t + .4;          // el impacto cierra la escena
};
const hdDrawF5 = drawF;
drawF = function(f, c){
  const on = fxhd.on && g && f.hfT && g.t < f.hfT && (((g.t * 16) | 0) % 2 === 0);
  if(on) ctx.filter = 'brightness(2.6) saturate(.15)';
  try{ hdDrawF5(f, c); }finally{ if(on) ctx.filter = 'none'; }
};

// ---- 3) estrella de picos plana con contorno (se dibuja sin brillo, encima de todo) ----
function hdBurstShape(x, y, R, n, rot, fill, edge){
  ctx.beginPath();
  for(let i = 0; i < n * 2; i++){ const a = rot + i * Math.PI / n, r = i % 2 ? R * .46 : R * (i % 4 ? .8 : 1); ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r * .86); }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
}
let hdB5 = performance.now();
function fxhdBursts(){
  if(!fxhd.on || !g) return;
  const now = performance.now(), dt = g.paused ? 0 : Math.min(.05, (now - hdB5) / 1000); hdB5 = now;
  ctx.save();
  fxhd.bursts.forEach(b => {
    b.t += dt; const u = clamp01(b.t / b.dur), P = fxPal(b.type), pop = u < .22 ? 1 - Math.pow(1 - u / .22, 3) : 1, R = (34 + 36 * b.k) * pop * (1 - Math.max(0, (u - .6) / .4) * .85);
    if(R < 2) return; ctx.globalAlpha = 1 - Math.max(0, (u - .7) / .3);
    hdBurstShape(b.x, b.y, R, b.n, b.rot, P[3], P[1]);                                      // estrella grande: color claro del tipo + contorno oscuro
    hdBurstShape(b.x, b.y, R * .58, b.n, b.rot + .3, '#ffffff', P[2]);                      // estrella interior blanca
  });
  ctx.restore();
  fxhd.bursts = fxhd.bursts.filter(b => b.t < b.dur);
}
const fxClear5 = fxClear; fxClear = function(){ fxClear5(); fxhd.scene = null; fxhd.zoom = 0; fxhd.bursts.length = 0; };
