"use strict";
/* =====================================================================
   RECETAS HD (prototipo): Lanzallamas y Hidrobomba rehechos con dibujo suave (degradados, mucha capa y turbulencia)
   en vez de cuadraditos de pixel art. Referencia: el estilo del tráiler de otro juego de combates en tiempo real.
   Solo se usan cuando fxhd.on está activo (js/fxhd.js); si no, se dibujan las recetas de siempre (se guardan aquí abajo).
   Técnica: «manchas» de luz precalculadas (hdBlob = círculo con degradado) que se dibujan muchas veces con distinto tamaño y color.
   Cada mancha viaja del atacante a la cabeza del chorro (flujo), así el fuego y el agua parecen vivos y no una imagen fija.
   ===================================================================== */
const hdSpr = {};
function hdBlob(r, g_, b){                                          // círculo con degradado (centro opaco → borde transparente)
  const k = r + ',' + g_ + ',' + b; if(hdSpr[k]) return hdSpr[k];
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${k},1)`); gr.addColorStop(.4, `rgba(${k},.55)`); gr.addColorStop(1, `rgba(${k},0)`); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  return hdSpr[k] = c;
}
const hdPut = (c, x, y, r, a) => { if(ctx.globalCompositeOperation === 'lighter') a *= fxhd.glow; if(a <= .01 || r <= .3) return; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(c, x - r, y - r, r * 2, r * 2); };
const hdFract = v => v - Math.floor(v);

// ---------------------------------------------------------------------
// LANZALLAMAS: chorro largo, fino en la boca y ancho en la punta. Blanco-amarillo cerca del atacante, naranja en medio,
// rojo oscuro y humo en la punta, con brasas que salen disparadas.
// ---------------------------------------------------------------------
function hdFlame(e){
  const G = sg(e, 250); if(G.len < 8) return;
  const t = g.t, A = G.al, ca = Math.cos(G.an), sa = Math.sin(G.an);
  const Bk = hdBlob(150, 32, 12), Bo = hdBlob(255, 112, 24), By = hdBlob(255, 205, 70), Bw = hdBlob(255, 248, 205), Bs = hdBlob(96, 84, 78), Bc = hdBlob(48, 20, 12);
  const N = Math.max(16, Math.round(G.len / 3.5)), P = [];
  for(let i = 0; i < N; i++){
    const ph = hdFract(i * .61803), u = hdFract(ph + t * 1.7), w = 3 + 23 * Math.pow(u, .85),
          lat = (Math.sin(i * 2.3 + t * 8 + ph * 6.28) * .65 + Math.sin(i * .9 - t * 4.5) * .35) * w * .5, [x, y] = pt(G, u, lat);
    P.push({u, x, y, w, r:w * (.9 + .3 * Math.sin(i * 5 + t * 9))});
  }
  P.sort((a, b) => a.u - b.u);
  ctx.save();
  for(const p of P) if(p.u < .5) hdPut(Bs, p.x, p.y - (.5 - p.u) * 22, p.r * 1.5 + 5, A * .24 * (1 - p.u / .5));          // humo en la boca
  for(const p of P) hdPut(Bk, p.x, p.y, p.r * 1.3, A * (.3 + .45 * p.u));                                                  // cuerpo rojo oscuro
  for(const p of P) hdPut(Bo, p.x, p.y, p.r * .95, A * .68);                                                              // naranja
  ctx.globalCompositeOperation = 'lighter';
  for(const p of P) hdPut(By, p.x, p.y, p.r * .55, A * .4 * (1 - p.u * .6));                                                // amarillo
  for(const p of P) hdPut(Bw, p.x, p.y, p.r * .26, A * .5 * (1 - p.u * .85));                                              // núcleo blanco
  ctx.globalCompositeOperation = 'source-over';
  // punta: masa oscura chamuscada con trozos
  hdPut(Bc, G.x1 - ca * 6, G.y1 - sa * 6, 24, A * .5);
  for(let i = 0; i < 7; i++){ const u = hdFract(i * .37 + t * 1.1), d = 8 + u * 30, o = (HH(i, 3) - .5) * 30;
    hdPut(Bc, G.x1 - ca * d + G.px * o, G.y1 - sa * d + G.py * o, 4 + HH(i, 5) * 5, A * (1 - u) * .6); }
  // brasas
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#ffd36a';
  for(let j = 0; j < 22; j++){
    const u = hdFract(j * .43 + t * 1.3), s = HH(j, 9) - .5, [x, y] = pt(G, .2 + u * .8, s * (14 + u * 60)), r = 1 + HH(j, 2) * 1.6;
    ctx.globalAlpha = A * (1 - u) * .95; ctx.beginPath(); ctx.arc(x, y - u * 10, r, 0, 6.283); ctx.fill();
  }
  ctx.restore();
}
// Impacto: bola de fuego que se abre, humo que sube y brasas con gravedad
function hdFireHit(e, a){
  const Bo = hdBlob(255, 112, 24), By = hdBlob(255, 205, 70), Bw = hdBlob(255, 248, 205), Bs = hdBlob(96, 84, 78), Bk = hdBlob(150, 32, 12);
  const u = clamp01(a / .75), out = 1 - Math.pow(1 - u, 3), k = e.k || 1;
  ctx.save();
  for(let i = 0; i < 9; i++){ const an = i * .7 + HH(i, 4) * .5, d = (12 + HH(i, 2) * 18) * out * k;
    hdPut(Bs, e.x + Math.cos(an) * d * .8, e.y - 4 + Math.sin(an) * d * .5 - u * 26, (10 + 10 * out) * k, (1 - u) * (u > .15 ? .3 : u * 2) * .35); }
  for(let i = 0; i < 9; i++){ const an = i * .7 + HH(i, 4) * .5, d = (10 + HH(i, 2) * 16) * out * k;
    hdPut(Bk, e.x + Math.cos(an) * d, e.y - 4 + Math.sin(an) * d * .55 - u * 12, (11 + 8 * out) * k, (1 - u) * .6); }
  ctx.globalCompositeOperation = 'lighter';
  for(let i = 0; i < 9; i++){ const an = i * .7 + HH(i, 4) * .5, d = (8 + HH(i, 2) * 14) * out * k;
    hdPut(Bo, e.x + Math.cos(an) * d, e.y - 4 + Math.sin(an) * d * .55 - u * 8, (11 + 6 * out) * k, (1 - u) * .8); }
  hdPut(By, e.x, e.y - 4, (24 + 14 * out) * k, (1 - u) * .85);
  hdPut(Bw, e.x, e.y - 4, (12 + 8 * out) * k, (1 - u * 1.4) * .9);
  ctx.fillStyle = '#ffd36a';
  for(let j = 0; j < 18; j++){ const an = -Math.PI * HH(j, 6) + (HH(j, 7) - .5) * .8, v = 70 + HH(j, 8) * 150, tt = a, x = e.x + Math.cos(an) * v * tt, y = e.y - 4 + Math.sin(an) * v * tt + 260 * tt * tt;
    ctx.globalAlpha = Math.max(0, 1 - tt / (.35 + HH(j, 1) * .4)); ctx.beginPath(); ctx.arc(x, y, 1.2 + HH(j, 3) * 1.4, 0, 6.283); ctx.fill(); }
  ctx.restore();
}

// ---------------------------------------------------------------------
// HIDROBOMBA: banda ancha de agua con espuma, cresta en la punta y gotas que saltan (como la ventisca del tráiler).
// ---------------------------------------------------------------------
function hdWave(e){
  const G = sg(e, 260); if(G.len < 8) return;
  const t = g.t, A = G.al, ca = Math.cos(G.an), sa = Math.sin(G.an);
  const Bd = hdBlob(14, 58, 170), Bm = hdBlob(54, 140, 235), Bl = hdBlob(150, 215, 255), Bw = hdBlob(246, 252, 255);
  const N = Math.max(20, Math.round(G.len / 3)), P = [];
  for(let i = 0; i < N; i++){
    const ph = hdFract(i * .61803), u = hdFract(ph + t * 1.15), w = 6 + 22 * Math.pow(u, .75),
          lat = (Math.sin(i * 1.9 + t * 6 + ph * 6.28) * .55 + Math.sin(i * .7 - t * 3.2) * .45) * w * .45, [x, y] = pt(G, u, lat);
    P.push({u, x, y, w, r:w * (.85 + .3 * Math.sin(i * 4 + t * 7))});
  }
  P.sort((a, b) => a.u - b.u);
  ctx.save();
  for(const p of P) hdPut(Bd, p.x, p.y, p.r * 1.25, A * .55);
  for(const p of P) hdPut(Bm, p.x, p.y, p.r * .95, A * .72);
  for(const p of P) hdPut(Bl, p.x, p.y, p.r * .62, A * .42);
  for(const p of P) hdPut(Bw, p.x, p.y, p.r * .28, A * .32 * (.5 + .5 * p.u));
  // espuma: burbujas con borde blanco que flotan por la banda
  ctx.lineWidth = 1.2;
  for(let i = 0; i < 46; i++){
    const u = hdFract(i * .37 + t * 1.0), w = 6 + 22 * Math.pow(u, .75), s = (HH(i, 4) - .5) * 1.5, [x, y] = pt(G, u, s * w * .6), r = 1.6 + HH(i, 2) * 4.2;
    ctx.globalAlpha = A * .55 * (u < .1 ? u * 10 : 1); ctx.strokeStyle = i % 3 ? '#ffffff' : '#bfe6ff'; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.stroke();
  }
  // cresta en la punta: arco blanco-azulado perpendicular al avance
  const cw = 40 + 14 * Math.sin(t * 9), cx = G.x1 + ca * 4, cy = G.y1 + sa * 4;
  ctx.globalAlpha = A; ctx.lineCap = 'round';
  [['#2a78e0', 11], ['#8fd0ff', 7], ['#ffffff', 3]].forEach(([c, lw]) => { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.ellipse(cx - ca * 6, cy - sa * 6, cw * .35, cw, G.an, -1.25, 1.25); ctx.stroke(); });
  hdPut(Bw, cx, cy, 22, A * .7);
  // gotas que saltan hacia delante y arriba
  ctx.fillStyle = '#ffffff';
  for(let j = 0; j < 26; j++){
    const u = hdFract(j * .41 + t * 1.6), s = (HH(j, 6) - .5) * 2, x = cx - ca * 22 + ca * u * 46 + G.px * s * (16 + u * 30), y = cy - sa * 22 + sa * u * 46 + G.py * s * (16 + u * 30) - Math.sin(u * 3.14) * 16;
    ctx.globalAlpha = A * (1 - u) * .9; ctx.beginPath(); ctx.arc(x, y, 1 + HH(j, 5) * 1.8, 0, 6.283); ctx.fill();
  }
  ctx.restore();
}
// Impacto de agua: columna de espuma, corona de gotas con gravedad y ondas en el suelo
function hdSplash(e, a){
  const Bm = hdBlob(54, 140, 235), Bl = hdBlob(150, 215, 255), Bw = hdBlob(246, 252, 255), k = e.k || 1, u = clamp01(a / .8), out = 1 - Math.pow(1 - u, 3);
  ctx.save();
  for(let i = 0; i < 7; i++){ const h = (14 + 40 * HH(i, 3)) * out * k, x = e.x + (HH(i, 1) - .5) * 24 * k;
    hdPut(Bm, x, e.y - h * .5, (12 + 8 * out) * k, (1 - u) * .55); hdPut(Bl, x, e.y - h * .6, (8 + 7 * out) * k, (1 - u) * .7); hdPut(Bw, x, e.y - h * .7, (5 + 4 * out) * k, (1 - u) * .8); }
  ctx.lineWidth = 2;
  for(let r = 0; r < 3; r++){ const v = clamp01((a - r * .1) / .6); if(v <= 0 || v >= 1) continue; ctx.globalAlpha = (1 - v) * .8; ctx.strokeStyle = r ? '#8fd0ff' : '#ffffff';
    ctx.beginPath(); ctx.ellipse(e.x, e.y + 8, (10 + 52 * k * (1 - Math.pow(1 - v, 2))), (4 + 18 * k * (1 - Math.pow(1 - v, 2))), 0, 0, 6.283); ctx.stroke(); }
  ctx.fillStyle = '#ffffff';
  for(let j = 0; j < 30; j++){ const an = -Math.PI * (.1 + .8 * HH(j, 6)), v = 80 + HH(j, 8) * 200, tt = a, x = e.x + Math.cos(an) * v * tt, y = e.y + Math.sin(an) * v * tt * 1.3 + 300 * tt * tt;
    ctx.globalAlpha = Math.max(0, 1 - tt / (.4 + HH(j, 1) * .4)); ctx.beginPath(); ctx.arc(x, y, 1.2 + HH(j, 3) * 2, 0, 6.283); ctx.fill(); }
  ctx.restore();
}

// ---------------------------------------------------------------------
// Se enganchan a las recetas de siempre: con HD apagado se ve lo de antes
// ---------------------------------------------------------------------
const hdOld = {SL:STR['Lanzallamas'], FL:FLT['Lanzallamas'], IL:IMP['Lanzallamas'], SH:STR['Hidrobomba'], FH:FLT['Hidrobomba'], IH:IMP['Hidrobomba']};
STR['Lanzallamas'] = (e, a) => fxhd.on ? hdFlame(e) : hdOld.SL(e, a);
FLT['Lanzallamas'] = (s, a, an) => { if(!fxhd.on) hdOld.FL(s, a, an); };
IMP['Lanzallamas'] = (e, a) => fxhd.on ? hdFireHit(e, a) : hdOld.IL(e, a);
STR['Hidrobomba'] = (e, a) => fxhd.on ? hdWave(e) : hdOld.SH(e, a);
FLT['Hidrobomba'] = (s, a, an) => { if(!fxhd.on) hdOld.FH(s, a, an); };
IMP['Hidrobomba'] = (e, a) => fxhd.on ? hdSplash(e, a) : hdOld.IH(e, a);
