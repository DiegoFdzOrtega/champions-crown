"use strict";
/* =====================================================================
   PUÑOS (golpe cuerpo a cuerpo, hueco 1): Puño Fuego · Puño Hielo · Puño Trueno · Puño Bala · Puño Sombra.
   Cada uno tiene su propia animación. Todos comparten el dibujo del puño (fist) y su recorrido (punchPos):
     1) el puño se echa un poco hacia atrás, 2) sale disparado hacia el rival, 3) se queda un momento en el impacto y se apaga.
   Lo que cambia es lo que lo rodea: llamas, cristales de hielo, rayos, destellos de acero o sombras.
   Como todos los efectos de este juego, es solo visual: el daño lo calcula combat.js (hueco 1 = MV[1]) y el tipo sale de MOVES (moves.js).
   Para retocar una animación: cambia los números de su bloque MEL['...']; la duración y el avance del atacante están en FXC['...'] (abajo del todo).
   ===================================================================== */

// Puño de pixel art girado hacia ang. pal = paleta del tipo [contorno, sombra, base, luz, brillo] · al = opacidad · k = tamaño
function fist(x, y, ang, pal, al, k = 1.15){
  const P = pts => rotp(x, y, ang, pts.map(([a, b]) => [a * k, b * k]));
  ctx.globalAlpha = al;
  PolyO(P([[-26, -6], [-10, -6], [-10, 6], [-26, 6]]), pal[1], pal[0]);                    // muñeca
  PolyO(P([[-10, -11], [8, -11], [13, -7], [13, 7], [8, 11], [-10, 11]]), pal[2], pal[0]); // puño
  Poly(P([[-8, -9], [9, -9], [11, -6], [-8, -6]]), pal[3]);                                // luz de arriba
  for(let j = 0; j < 3; j++) Poly(P([[2, -5 + j * 5], [12, -5 + j * 5], [12, -3 + j * 5], [2, -3 + j * 5]]), pal[1]);   // los dedos
  Poly(P([[-8, 5], [1, 5], [1, 9], [-8, 9]]), pal[1]);                                     // el pulgar
  ctx.globalAlpha = 1;
}
// Dónde está el puño en el instante a: sale del atacante (con su embestida visual) y llega al rival. t0 = cuándo empieza · tm = cuánto tarda
function punchPos(e, a, t0 = .04, tm = .08){
  const f = e.fol, L = fxLunge(f), co = Math.cos(e.ang), si = Math.sin(e.ang);
  const sx = f.x + L.x + co * 14, sy = f.y + L.y - 6 + si * 14, ex = e.x - co * 6, ey = e.y - si * 6;
  const u = ease(clamp01((a - t0) / tm)), back = a < t0 ? clamp01(a / t0) * 7 : 0;           // antes de salir se echa hacia atrás
  return {x:lerp(sx, ex, u) - co * back, y:lerp(sy, ey, u) - si * back, u, sx, sy};
}

// ---- Puño Fuego: puño naranja con una cola de llamas; al golpear estalla en brasas ----
MEL['Puño Fuego'] = (e, a) => {
  const p = FXP.fuego, q = punchPos(e, a), al = fade(a, .34, .16), co = Math.cos(e.ang), si = Math.sin(e.ang), fr = Math.floor(a * 28);
  if(al > 0){
    for(let i = 5; i >= 1; i--){                                                               // llamas que se quedan detrás
      const d = 12 + i * 8, bx = q.x - co * d + (HH(i, fr) - .5) * 10, by = q.y - si * d - i * 2 + (HH(i, fr + 9) - .5) * 10;
      ctx.globalAlpha = al * (1 - i * .13); puff(bx, by, Math.max(2, 7 - i), i / 6 + .1, p);
    }
    ctx.globalAlpha = 1; fist(q.x, q.y, e.ang, p, al);
    ctx.globalAlpha = al; for(let i = 0; i < 4; i++) puff(q.x + (HH(i, fr + 3) - .5) * 26, q.y - 12 - HH(i, fr + 5) * 8, 3 + (i % 2), HH(i, fr) * .6, p);   // llamitas sobre los nudillos
    ctx.globalAlpha = 1;
  }
  if(a >= .12){
    const u = clamp01((a - .12) / .32);
    hitStar(e.x, e.y, a, p, 1.25, .12);
    ctx.globalAlpha = (1 - u) * .9; Rg(e.x, e.y, 8 + 34 * ease(u), p[3], (8 + 34 * ease(u)) * .75, 2); Rg(e.x, e.y, 5 + 24 * ease(u), p[2], (5 + 24 * ease(u)) * .75, 1);   // onda de fuego
    for(let i = 0; i < 6; i++){ const an = i * 1.05 + .3, d = 10 + 30 * ease(u); puff(e.x + Math.cos(an) * d, e.y + Math.sin(an) * d * .75 - u * 8, Math.max(2, 5 - (u * 4 | 0)), u, p); }
    ctx.globalAlpha = 1;
    once(e, () => { fxBurst(e.x, e.y, [p[1], p[2], p[3], p[4]], 20, 190, undefined, 6.3, {life:.6, rise:.7}); fx.shake = Math.max(fx.shake, 3); });
  }
};

// ---- Puño Hielo: puño helado con escarcha; al golpear salen cristales de hielo ----
MEL['Puño Hielo'] = (e, a) => {
  const p = FXP.hielo, q = punchPos(e, a), al = fade(a, .36, .16), co = Math.cos(e.ang), si = Math.sin(e.ang), fr = Math.floor(a * 22);
  if(al > 0){
    for(let i = 1; i <= 6; i++){                                                               // trocitos de hielo que caen detrás
      const d = 10 + i * 8, bx = q.x - co * d + (HH(i, 2) - .5) * 16, by = q.y - si * d + (HH(i, 4) - .5) * 16 + i * 1.5;
      ctx.globalAlpha = al * (1 - i * .13); PolyO(rotp(bx, by, i * 1.3, [[0, -5], [2.5, 0], [0, 5], [-2.5, 0]]), p[3], p[1]);
    }
    ctx.globalAlpha = 1; fist(q.x, q.y, e.ang, p, al);
    ctx.globalAlpha = al; for(let i = 0; i < 4; i++) if((fr + i) % 2) Spark(q.x + (HH(i, 7) - .5) * 40, q.y + (HH(i, 8) - .5) * 28, 2 + (i % 2), i % 2 ? '#ffffff' : p[3]);   // destellos de escarcha
    ctx.globalAlpha = 1;
  }
  if(a >= .12){
    const u = clamp01((a - .12) / .34), al2 = fade(a, .4, .2);
    hitStar(e.x, e.y, a, p, 1.15, .12);
    ctx.globalAlpha = al2; Rg(e.x, e.y, 6 + 28 * ease(u), '#ffffff', (6 + 28 * ease(u)) * .75, 1); Rg(e.x, e.y, 9 + 32 * ease(u), p[2], (9 + 32 * ease(u)) * .75, 2);
    for(let i = 0; i < 7; i++){                                                                // cristales de hielo que salen en estrella
      const an = i * .9 + .25, len = (9 + 26 * ease(u)) * (i % 2 ? 1 : .7), cx = e.x + Math.cos(an) * 6, cy = e.y + Math.sin(an) * 5;
      PolyO(rotp(cx, cy, an, [[0, -3], [len, 0], [0, 3]]), i % 2 ? p[3] : p[2], p[1]);
    }
    ctx.globalAlpha = 1;
    once(e, () => { fxBurst(e.x, e.y, [p[2], p[3], p[4], '#ffffff'], 18, 170, undefined, 6.3, {life:.55, grav:.9}); fxBurst(e.x, e.y + 6, [p[3], p[4]], 8, 40, -Math.PI / 2, 2.2, {life:.8, rise:.5, s:2}); fx.shake = Math.max(fx.shake, 2); });
  }
};

// ---- Puño Trueno: puño amarillo rodeado de chispas; al golpear salen rayos en todas direcciones ----
MEL['Puño Trueno'] = (e, a) => {
  const p = FXP.electrico, q = punchPos(e, a), al = fade(a, .36, .14), fr = Math.floor(a * 36);
  if(al > 0){
    ctx.globalAlpha = al;
    fist(q.x, q.y, e.ang, p, al);
    for(let k = 0; k < 3; k++){ const an = k * 2.1 + fr * .8; bolt(q.x, q.y, q.x + Math.cos(an) * 34, q.y + Math.sin(an) * 30, fr * 3 + k * 11, p, 1, 4, 7); }   // rayitos alrededor del puño
    ctx.globalAlpha = 1;
  }
  if(a >= .12){
    const u = clamp01((a - .12) / .3), al2 = fade(a, .3, .16);
    hitStar(e.x, e.y, a, p, 1.2, .12);
    if(al2 > 0){
      ctx.globalAlpha = al2; Rg(e.x, e.y, 6 + 26 * ease(u), p[3], (6 + 26 * ease(u)) * .75, 2);
      for(let k = 0; k < 5; k++){ const an = k * 1.26 + .4 + (fr % 2) * .15; bolt(e.x, e.y, e.x + Math.cos(an) * (30 + 20 * ease(u)), e.y + Math.sin(an) * (26 + 18 * ease(u)), fr * 5 + k * 13, p, 1, 5, 8); }
      ctx.globalAlpha = 1;
    }
    once(e, () => { fxBurst(e.x, e.y, [p[2], p[3], p[4], '#ffffff'], 22, 220, undefined, 6.3, {life:.4, s:1}); fx.shake = Math.max(fx.shake, 4); });
  }
};

// ---- Puño Bala: dos puñetazos seguidos, muy rápidos, de acero brillante ----
MEL['Puño Bala'] = (e, a) => {
  const p = FXP.acero, co = Math.cos(e.ang), si = Math.sin(e.ang), al = fade(a, .36, .14), strike = a >= .15;
  if(al > 0){
    let q;
    if(!strike){ const u = a < .07 ? ease(a / .07) : 1 - ease(clamp01((a - .07) / .07)); q = punchPos(e, 1, 0, 1); q = {x:lerp(q.sx, e.x - co * 6, u), y:lerp(q.sy, e.y - si * 6, u)}; }   // 1.º puñetazo: sale y vuelve
    else q = punchPos(e, a - .15, .0, .05);                                                    // 2.º puñetazo: sale y se queda
    for(let k = -2; k <= 2; k++){                                                              // líneas de velocidad
      const o = k * 8, x0 = q.x - co * 26 - si * o, y0 = q.y - si * 26 + co * o, x1 = q.x - co * (46 + HH(k, 3) * 20) - si * o, y1 = q.y - si * (46 + HH(k, 3) * 20) + co * o;
      ctx.globalAlpha = al * .8; Ln(x0, y0, x1, y1, k % 2 ? '#ffffff' : p[3], 1);
    }
    ctx.globalAlpha = 1; fist(q.x, q.y, e.ang, p, al);
    if(a < .3){ ctx.globalAlpha = al; Spark(q.x + co * 6 - si * 9, q.y + si * 6 + co * 9 - 4, 3 + (Math.floor(a * 30) % 2), '#ffffff'); ctx.globalAlpha = 1; }   // destello metálico
  }
  for(const t0 of [.07, .2]){                                                                  // un impacto por cada puñetazo
    if(a < t0) continue;
    hitStar(e.x, e.y, a, p, t0 < .1 ? .8 : 1.1, t0);
    once(e, () => { fxBurst(e.x, e.y, ['#ffffff', '#ffe27a', p[3], p[2]], t0 < .1 ? 9 : 14, 190, undefined, 6.3, {life:.3, s:1}); if(t0 > .1) fx.shake = Math.max(fx.shake, 3); }, 'b' + t0);
  }
};

// ---- Puño Sombra: dos puños fantasma salen de un remolino oscuro y golpean ----
MEL['Puño Sombra'] = (e, a) => {
  const p = FXP.fantasma, co = Math.cos(e.ang), si = Math.sin(e.ang), al = fade(a, .38, .18), fr = Math.floor(a * 18);
  const f = e.fol, L = fxLunge(f), ox = f.x + L.x + co * 14, oy = f.y + L.y - 6 + si * 14;
  if(a < .22){ ctx.globalAlpha = fade(a, .08, .14) * .85; Rg(ox, oy, 6 + 12 * ease(clamp01(a / .1)), p[1], (6 + 12 * ease(clamp01(a / .1))) * .8, 2); Rg(ox, oy, 4 + 8 * ease(clamp01(a / .1)), p[3], (4 + 8 * ease(clamp01(a / .1))) * .8, 1); ctx.globalAlpha = 1; }   // remolino
  if(al > 0) for(const [dl, off] of [[0, 11], [.05, -11]]){                                    // los dos puños, uno ligeramente detrás del otro
    const aa = a - dl; if(aa < 0) continue;
    const q = punchPos(e, aa, .03, .09), px = -si * off * (1 - q.u * .7), py = co * off * (1 - q.u * .7);
    for(let k = 3; k >= 1; k--){ const qq = punchPos(e, Math.max(0, aa - k * .02), .03, .09); fist(qq.x + px, qq.y + py, e.ang, p, al * .14 * (4 - k), 1.05); }   // estela de sombra
    fist(q.x + px, q.y + py, e.ang, p, al * .88, 1.05);
  }
  if(a >= .13){
    const u = clamp01((a - .13) / .36), al2 = fade(a, .3, .24);
    hitStar(e.x, e.y, a, p, 1.1, .13);
    if(al2 > 0){
      ctx.globalAlpha = al2 * .55; D(e.x, e.y, 9 + 24 * ease(u), p[1]); ctx.globalAlpha = al2 * .7; D(e.x, e.y, 5 + 15 * ease(u), p[2]);   // mancha de sombra
      ctx.globalAlpha = al2; for(let i = 0; i < 6; i++){ const an = i * 1.05 + a * 3, d = 14 + 22 * ease(u); D(e.x + Math.cos(an) * d, e.y + Math.sin(an) * d * .7 - u * 10, 2 + (i % 2), i % 2 ? p[3] : p[4]); }   // llamitas fantasma
      ctx.globalAlpha = 1;
    }
    once(e, () => { fxBurst(e.x, e.y, [p[1], p[2], p[3], p[4]], 16, 110, undefined, 6.3, {life:.7, rise:.5}); fx.shake = Math.max(fx.shake, 2); });
  }
};

// Duración (dur), cuánto se lanza el atacante hacia delante (lg, lgd) y temblor de pantalla extra (shake)
FXC['Puño Fuego']  = {dur:.6,  lg:lungeTo(50, 50), lgd:.22};
FXC['Puño Hielo']  = {dur:.6,  lg:lungeTo(50, 50), lgd:.22};
FXC['Puño Trueno'] = {dur:.55, lg:lungeTo(54, 48), lgd:.2,  shake:1};
FXC['Puño Bala']   = {dur:.55, lg:lungeTo(70, 44), lgd:.2};
FXC['Puño Sombra'] = {dur:.65, lg:lungeTo(30, 58), lgd:.26};
