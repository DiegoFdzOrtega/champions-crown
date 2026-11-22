"use strict";
/* =====================================================================
   CLASIFICATORIA CON EL FONDO NUEVO (22-11-2026, maqueta de Diego)
   Fondo: assets/fondos/clasificatoria2.webp (estadio de noche con 6 pedestales, recortado un poco por arriba).
   Marcos de Gemini en assets/menu/rk/ (panel, panelw, titulo, boton, pill, fila, barra): los pone css/rk2.css.
   Aquí solo se cambian los sitios de la imagen donde van los Pokémon, el aro, el botón y los hitos (RK_BG de js/ranked.js)
   y se apaga la vida de la sala vieja (js/rkvida.js: pantallas de la consola, que no existen en este fondo).
   RK2.on = false vuelve a la sala de antes.
   ===================================================================== */
const RK2 = {on: true};
if(RK2.on && typeof RK_BG !== 'undefined'){
  Object.assign(RK_BG, {w: 2560, h: 1296,
    ped: [[.202, .672], [.314, .636], [.425, .607], [.576, .607], [.685, .636], [.798, .672]], pedH: .055, pedW: .1,   // centro de arriba de cada pedestal (de izquierda a derecha)
    ring: [.5, .752], con: [.5, .826, .34, .08], hit: [.5, .985]});
  if(typeof RKV !== 'undefined') RKV.on = false;
  document.documentElement.classList.add('rk2on');
  // (22-11) en pantallas más anchas que el dibujo se cortaba el suelo (y los Hitos): ahora el fondo se pega ABAJO y lo que sobra se recorta del cielo
  rkFit = function(){
    const root = $('rkRoot'); if(!root || !root.offsetWidth) return;
    const W = root.offsetWidth, H = root.offsetHeight, B = RK_BG, s = Math.max(W / B.w, H / B.h), ox = (W - B.w * s) / 2, oy = H - B.h * s;
    root.style.setProperty('--bgs', `${Math.ceil(B.w * s)}px ${Math.ceil(B.h * s)}px`); root.style.setProperty('--bgp', `${Math.round(ox)}px ${Math.round(oy)}px`);
    const X = f => ox + f * B.w * s, Y = f => oy + f * B.h * s;
    root.style.setProperty('--ped', (B.pedW * B.w * s) + 'px'); root.style.setProperty('--pedh', (B.pedH * B.h * s) + 'px');
    root.querySelectorAll('[data-at]').forEach(e => { const [k, i] = e.dataset.at.split(':'); let x, y;
      if(k === 'ped'){ [x, y] = B.ped[+i]; } else if(k === 'ring'){ [x, y] = B.ring; e.style.width = (.37 * B.w * s) + 'px'; e.style.setProperty('--gap', (.094 * B.w * s) + 'px'); }
      else if(k === 'con'){ [x, y] = B.con; e.style.width = (B.con[2] * B.w * s * .86) + 'px'; } else if(k === 'hit'){ [x, y] = B.hit; }
      e.style.left = X(x) + 'px'; e.style.top = Y(y) + 'px'; });
  };
}

// (22-11) Los Pokémon de pie ENCIMA del pedestal: los pies (la última fila con dibujo del lienzo) van justo en el centro de arriba del pedestal
// y el nombre baja al frente del pedestal (css/rk2.css). Como el dibujo puede tardar en pintarse, se mide varias veces.
function rk2Pies(){
  document.querySelectorAll('#rkStage .rk-ped canvas').forEach(c => { try{
    const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data; let y = c.height - 1;
    for(; y > 0; y--){ let hit = false; for(let i = 0; i < c.width; i += 2) if(d[(y * c.width + i) * 4 + 3] > 40){ hit = true; break; } if(hit) break; }
    if(y > 0) c.style.setProperty('--pie', ((c.height - 1 - y) / c.height) + '');
  }catch(e){} });
}
if(RK2.on && typeof rkRenderStage === 'function'){ const o = rkRenderStage; rkRenderStage = function(){ const r = o.apply(this, arguments); [60, 300, 900, 2000].forEach(t => setTimeout(rk2Pies, t)); return r; }; }
