"use strict";
/* =====================================================================
   SHURIKEN DE AGUA (hueco 2, tipo agua): el ataque de Greninja.
   En los juegos lanza varios shuriken de agua seguidos (2 a 5 golpes); en el anime los forma con el agua y los lanza girando.
   Aquí: salen 3 shuriken de agua en abanico, girando sobre sí mismos con una estela de gotas; al llegar se clavan en el rival con tres cortes
   y salpican. Es solo visual: el daño lo calcula combat.js (hueco 2 = MV[2]) y el tipo (agua) sale de MOVES (moves.js).
   Para retocarlo: el tamaño y el giro están en shuri() (abajo) y el abanico en FLT['Shuriken de Agua'].
   ===================================================================== */

// Un shuriken de 4 puntas: contorno azul oscuro, cuerpo de agua, brillo blanco en el centro. x,y = centro · rot = giro · r = radio
function shuri(x, y, rot, r, al = 1){
  const p = FXP.agua, k = r / 10;
  const blade = [[10, 0], [3, -2.2], [0, -10], [-2.2, -3], [-10, 0], [-3, 2.2], [0, 10], [2.2, 3]].map(([a, b]) => [a * k, b * k]);
  ctx.globalAlpha = al;
  PolyO(rotp(x, y, rot, blade), p[2], p[0]);
  Poly(rotp(x, y, rot, [[10 * k, 0], [3 * k, -2.2 * k], [0, 0], [3 * k, 2.2 * k]]), p[3]);          // luz en una de las puntas
  Poly(rotp(x, y, rot, [[0, -10 * k], [-2.2 * k, -3 * k], [0, 0], [2.2 * k, -3 * k]]), p[3]);
  D(x, y, Math.max(1, Math.round(r * .14)), '#ffffff');                                            // centro
  ctx.globalAlpha = 1;
}

// Vuelo: tres shuriken en abanico, cada uno un poco adelantado respecto al anterior y girando a distinta velocidad
FLT['Shuriken de Agua'] = (s, a, an) => {
  const p = FXP.agua;
  [[-18, 10, 1], [0, 0, -1], [18, -10, 1]].forEach(([o, d, dir], i) => {
    const [x, y] = side(s.x, s.y, an, d, o);
    for(let k = 2; k >= 1; k--){                                                                   // dos copias más pálidas detrás = sensación de giro rápido
      const [tx, ty] = side(s.x, s.y, an, d - k * 9, o);
      shuri(tx, ty, g.t * 22 * dir + i + k * .7, 9, .22 / k);
    }
    shuri(x, y, g.t * 22 * dir + i, 12);
    Spark(x - Math.cos(an) * 12 + Math.sin(g.t * 30 + i) * 2, y - Math.sin(an) * 12, 1.5, i % 2 ? '#ffffff' : p[3]);   // gotas que suelta
  });
};
TRL['Shuriken de Agua'] = {rate:34, cols:['#3fa0ff', '#9be0ff', '#ffffff'], life:.3, speed:22, spread:5};

// Lanzamiento: un chorrito de agua en la mano del atacante
CST['Shuriken de Agua'] = (f, s, name, big, ox, oy, ang) => {
  fxBurst(ox, oy, FXP.agua.slice(2), 8, 100, ang, 1.2, {life:.25});
  fxAdd('impact', 'ring', {x:ox, y:oy, type:'agua', dur:.22, k:.6});
};

// Impacto: tres cortes cruzados (uno por shuriken) + salpicadura
IMP['Shuriken de Agua'] = (e, a) => {
  const p = FXP.agua;
  hitStar(e.x, e.y, a, p, .8);
  once(e, () => crown(e, [p[2], p[3], '#ffffff'], 12, 120, 110, {life:.5}));
  ctx.globalAlpha = fade(a, .18, .22);
  for(let i = 0; i < 3; i++){
    const x = e.x + (i - 1) * 13, y = e.y - 8 + (i % 2) * 10, r = 8;
    Ln(x - r, y - r, x + r, y + r, p[0], 3); Ln(x - r, y - r, x + r, y + r, p[3], 1.5);
    Ln(x + r, y - r, x - r, y + r, p[0], 3); Ln(x + r, y - r, x - r, y + r, '#ffffff', 1);
  }
  ctx.globalAlpha = 1;
};
