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
    ped: [[.202, .72], [.314, .682], [.425, .651], [.576, .651], [.685, .682], [.798, .72]], pedW: .1,   // centro de arriba de cada pedestal (de izquierda a derecha)
    ring: [.5, .752], con: [.5, .826, .34, .08], hit: [.5, .985]});
  if(typeof RKV !== 'undefined') RKV.on = false;
  document.documentElement.classList.add('rk2on');
  // (22-11) en pantallas más anchas que el dibujo se cortaba el suelo (y los Hitos): ahora el fondo se pega ABAJO y lo que sobra se recorta del cielo
  rkFit = function(){
    const root = $('rkRoot'); if(!root || !root.offsetWidth) return;
    const W = root.offsetWidth, H = root.offsetHeight, B = RK_BG, s = Math.max(W / B.w, H / B.h), ox = (W - B.w * s) / 2, oy = H - B.h * s;
    root.style.setProperty('--bgs', `${Math.ceil(B.w * s)}px ${Math.ceil(B.h * s)}px`); root.style.setProperty('--bgp', `${Math.round(ox)}px ${Math.round(oy)}px`);
    const X = f => ox + f * B.w * s, Y = f => oy + f * B.h * s;
    root.style.setProperty('--ped', (B.pedW * B.w * s) + 'px');
    root.querySelectorAll('[data-at]').forEach(e => { const [k, i] = e.dataset.at.split(':'); let x, y;
      if(k === 'ped'){ [x, y] = B.ped[+i]; } else if(k === 'ring'){ [x, y] = B.ring; e.style.width = (.37 * B.w * s) + 'px'; e.style.setProperty('--gap', (.094 * B.w * s) + 'px'); }
      else if(k === 'con'){ [x, y] = B.con; e.style.width = (B.con[2] * B.w * s * .86) + 'px'; } else if(k === 'hit'){ [x, y] = B.hit; }
      e.style.left = X(x) + 'px'; e.style.top = Y(y) + 'px'; });
  };
}
