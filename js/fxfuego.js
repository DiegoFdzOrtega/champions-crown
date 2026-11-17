"use strict";
/* =====================================================================
   FUEGO COMO EN «POKÉMON ARENA 2D» (el vídeo que pasó Diego): LLAMARADA y GIRO FUEGO, dibujados por código.
   Estilo: bultos de fuego planos con contorno rojo oscuro y 4 capas (rojo, naranja, amarillo, centro claro), sin brillos difusos
   (hd4FireLayers / hd4Tongue / HD_FIRE de js/fxhd4.js).
   - LLAMARADA: el símbolo «大» de fuego VUELA hacia el rival girando un poco y creciendo, con llamas que le salen por detrás.
     Al chocar: estalla en una bola con rayos de fuego, sube una COLUMNA de llamas y queda un anillo de fuego ardiendo en el suelo.
   - GIRO FUEGO (ataque nuevo, Fuego, clic derecho, por MT): una bolita de fuego con una ristra de chispas. Al dar levanta un TORBELLINO
     de anillos de fuego con pinchos que giran, uno encima de otro, y dura unos segundos en el sitio.
   - SUELO ARDIENDO: Llamarada, Envite Ígneo y Giro Fuego dejan una mancha de llamitas que tiemblan en el suelo unos segundos (debajo de los Pokémon).
   Se ven siempre, también con los efectos HD apagados (son dibujos planos y no pesan).
   - FRANJA DE FUEGO: el terreno que deja un ataque fuerte de fuego son llamas sueltas en el suelo (ffFranja), no un rectángulo.
   ===================================================================== */
const FF = {llamaDur: 1.5, giroDur: 2.6, sueloDur: 3.2};                                    // [AJUSTE] segundos del impacto de Llamarada · del torbellino de Giro Fuego
const ffEase3 = v => 1 - Math.pow(1 - v, 3);

// ---- «大» de fuego: puntos a lo largo de los 3 trazos (HD_DAI, js/fxhd4.js) ----
function ffDaiBlobs(cx, cy, U, rot, r0, seed){
  const out = [], tongues = [], c = Math.cos(rot), s = Math.sin(rot), k = Math.floor(g.t * 16);
  HD_DAI.forEach((st, si) => {
    for(let i = 1; i < st.length; i++){
      const [x0, y0] = st[i - 1], [x1, y1] = st[i], L = Math.hypot(x1 - x0, y1 - y0), N = Math.max(2, Math.ceil(L * 7));
      for(let j = 0; j <= N; j++){
        const u = j / N, lx = (x0 + (x1 - x0) * u) * U, ly = (y0 + (y1 - y0) * u) * U, jx = (HH(j + si * 30 + i * 7, k + seed) - .5) * U * .07, jy = (HH(j + si * 30 + i * 7, k + seed + 3) - .5) * U * .07;
        const x = cx + (lx + jx) * c - (ly + jy) * s, y = cy + (lx + jx) * s + (ly + jy) * c;
        out.push([x, y, r0 * (.85 + .3 * HH(j + si * 11, k + seed + 5))]);
        if(j % 2 === 0) tongues.push([x, y]);
      }
    }
  });
  return {blobs: out, tongues};
}

// ---- LLAMARADA: vuela el «大» ----
function ffLlamaFlight(s, a, an){
  const t = g.t, ca = Math.cos(an), sa = Math.sin(an), grow = .7 + .3 * Math.min(1, a * 2.5), U = 38 * grow, rot = Math.sin(t * 5) * .18 + a * .9;
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // brasas que se quedan atrás
  for(let i = 0; i < 8; i++){ const u = hdFract(t * 2.4 + i * .13), d = 20 + u * 70; ctx.globalAlpha = 1 - u; ctx.fillStyle = i % 2 ? HD_FIRE[3] : HD_FIRE[2]; ctx.fillRect(s.x - ca * d + (HH(i, 9) - .5) * 40 - 2, s.y - sa * d + (HH(i, 10) - .5) * 40 - u * 10 - 2, 4, 4); }
  ctx.globalAlpha = 1;
  const D = ffDaiBlobs(s.x, s.y, U, rot, 9 * grow, 0);
  // llamas que salen del símbolo hacia atrás (lo mueve el aire)
  D.tongues.forEach(([x, y], i) => { if(i % 2) return; hd4Tongue(x, y, (14 + HH(i, Math.floor(t * 12)) * 16) * grow, 5 * grow, an + Math.PI + (HH(i, 3) - .5) * .9, HD_FIRE[2], HD_FIRE[0]); });
  hd4FireLayers(D.blobs);
  // llamitas que se levantan del borde
  D.tongues.forEach(([x, y], i) => { if(i % 3) return; hd4Tongue(x, y - 4, (9 + HH(i, Math.floor(t * 14) + 7) * 9) * grow, 3.5 * grow, -Math.PI / 2 + (HH(i, 8) - .5) * .8, HD_FIRE[3], null); });
  ctx.restore();
}
// ---- LLAMARADA: impacto (estallido → columna de fuego → anillo ardiendo en el suelo) ----
function ffLlamaHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y, t = g.t, T = a * FF.llamaDur, kk = Math.floor(t * 16);
  if(!e.hdDec){ e.hdDec = 1; if(typeof hdDecal === 'function') hdDecal(x, y, 'fuego', k * 1.4); fx.shake = Math.max(fx.shake, 7); }
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // 1) el «大» se aplasta contra el rival y estalla (0 - .25 s)
  if(T < .25){ const u = T / .25; const D = ffDaiBlobs(x, y - 10, (30 + 26 * u) * k, .9, (7.5 + 6 * u) * k * (1 - u * .5), 0); hd4FireLayers(D.blobs); }
  // 2) bola de la explosión con rayos de fuego (estrella) (.1 - .55 s)
  if(T > .1 && T < .55){
    const u = (T - .1) / .45, R = (16 + 34 * ffEase3(Math.min(1, u * 1.6))) * k * (1 - Math.max(0, u - .6) / .4 * .7);
    for(let i = 0; i < 8; i++){ const an = i * Math.PI / 4 + .2; hd4Tongue(x + Math.cos(an) * R * .5, y - 12 + Math.sin(an) * R * .5 * .7, R * (1.1 + .3 * HH(i, 2)), 9 * k, an, HD_FIRE[2], HD_FIRE[0]); }
    hd4FireLayers([[x, y - 12, R * .75], [x - R * .4, y - 6, R * .45], [x + R * .4, y - 6, R * .45]]);
  }
  // 3) columna de fuego que sube (.3 - 1.25 s)
  if(T > .3 && T < 1.25){
    const u = (T - .3) / .95, up = ffEase3(Math.min(1, u * 2)), fade = u < .7 ? 1 : 1 - (u - .7) / .3, H = 120 * k * up, blobs = [];
    for(let i = 0; i < 9; i++){ const q = i / 8, by = y - 6 - q * H, wob = Math.sin(t * 9 + i * 1.3) * 6 * k * q, r = (20 - q * 9 + HH(i, kk) * 4) * k * fade;
      if(r > 1.5){ blobs.push([x + wob - 7 * k, by, r]); blobs.push([x + wob + 7 * k, by - 4, r * .85]); } }
    for(let i = 0; i < 6; i++){ const q = (i + .5) / 6; hd4Tongue(x + (HH(i, kk) - .5) * 30 * k, y - 10 - q * H, (18 + HH(i, kk + 3) * 16) * k * fade, 6 * k * fade + .5, -Math.PI / 2 + (HH(i, kk + 5) - .5) * .7, HD_FIRE[2], HD_FIRE[0]); }
    hd4FireLayers(blobs);
  }
  // 4) se queda el suelo ardiendo (ffSueloFuego: dura más que el impacto)
  if(T > .25 && !e.ffSuelo){ e.ffSuelo = 1; ffSueloFuego(x, y, k * 1.15); }
  // humo al final
  if(T > 1.05){ const u = Math.min(1, (T - 1.05) / .45); for(let i = 0; i < 5; i++){ ctx.globalAlpha = (1 - u) * .45; ctx.fillStyle = '#3a2a26'; ctx.beginPath(); ctx.arc(x + (i - 2) * 18 * k + Math.sin(t * 3 + i) * 4, y - 40 * k - u * 50 * k - i * 6, (10 + u * 12) * k, 0, 6.283); ctx.fill(); } }
  ctx.restore();
}

// ---- GIRO FUEGO: bolita de fuego con ristra de chispas ----
function ffGiroFlight(s, a, an){
  const t = g.t, ca = Math.cos(an), sa = Math.sin(an);
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  for(let i = 6; i >= 1; i--){ const d = i * 11, r = 4.2 - i * .5; ctx.fillStyle = HD_FIRE[0]; ctx.fillRect(s.x - ca * d - r - 1, s.y - sa * d - r - 1 + Math.sin(t * 12 + i) * 1.5, r * 2 + 2, r * 2 + 2); ctx.fillStyle = i % 2 ? HD_FIRE[2] : HD_FIRE[1]; ctx.fillRect(s.x - ca * d - r, s.y - sa * d - r + Math.sin(t * 12 + i) * 1.5, r * 2, r * 2); }
  hd4Tongue(s.x - ca * 3, s.y - sa * 3, 22, 6, an + Math.PI, HD_FIRE[2], HD_FIRE[0]);
  hd4FireLayers([[s.x, s.y, 8 + Math.sin(t * 20)]]);
  ctx.restore();
}
// Un anillo del torbellino: cinta de fuego en elipse con pinchos hacia abajo. front = dibuja la mitad de delante (true) o la de detrás (false)
function ffRing(cx, cy, rx, ry, ph, k, A, front){
  const N = 26, gap = 1.1;                                                  // la cinta no está cerrada: tiene un hueco que gira
  const pts = []; for(let i = 0; i <= N; i++){ const an = ph + gap / 2 + i / N * (6.283 - gap); const sn = Math.sin(an); if((sn > 0) !== front) { pts.push(null); continue; } pts.push([cx + Math.cos(an) * rx, cy + sn * ry, an]); }
  const runs = []; let cur = []; pts.forEach(p => { if(p) cur.push(p); else if(cur.length){ runs.push(cur); cur = []; } }); if(cur.length) runs.push(cur);
  ctx.save(); ctx.globalAlpha = A; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  runs.forEach(run => {
    if(run.length < 2) return;
    [[13 * k, HD_FIRE[0], 0], [9 * k, HD_FIRE[1], 0], [5.5 * k, HD_FIRE[2], -1.5 * k], [2 * k, HD_FIRE[4], -3 * k]].forEach(([w, col, dy]) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); run.forEach(([x, y], i) => i ? ctx.lineTo(x, y + dy) : ctx.moveTo(x, y + dy)); ctx.stroke(); });
    run.forEach(([x, y, an], i) => { if(i % 2) return; const L = (12 + 8 * Math.abs(Math.sin(an * 3 + ph))) * k; hd4Tongue(x, y + 3 * k, L, 3.8 * k, Math.PI / 2 + Math.cos(an) * .5, HD_FIRE[2], HD_FIRE[0]); });   // pinchos hacia abajo
  });
  ctx.restore();
}
// ---- GIRO FUEGO: el torbellino ----
function ffGiroHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y + 6, t = g.t, T = a * FF.giroDur, N = 7;
  if(!e.hdDec){ e.hdDec = 1; if(typeof hdDecal === 'function') hdDecal(e.x, e.y, 'fuego', k); fx.shake = Math.max(fx.shake, 3); }
  if(T > FF.giroDur - .6 && !e.ffSuelo){ e.ffSuelo = 1; ffSueloFuego(e.x, e.y, k * .8); }      // al deshacerse el torbellino queda el suelo ardiendo
  const end = FF.giroDur - .55;
  const rings = [];
  for(let i = 0; i < N; i++){
    const born = i * .07, u = Math.min(1, Math.max(0, (T - born) / .25)); if(u <= 0) continue;
    const gone = T > end ? Math.min(1, Math.max(0, (T - end - (N - 1 - i) * .04) / .3)) : 0; if(gone >= 1) continue;   // se deshace de arriba abajo
    const q = i / (N - 1), rx = (28 + q * 30) * k * (.4 + .6 * ffEase3(u)) * (1 - gone * .5), ry = rx * .36;
    rings.push({cx: x + Math.sin(t * 2.2 + i * .55) * 5 * k + q * 10 * k, cy: y - 10 * k - i * 19 * k, rx, ry, ph: t * (7 - q * 2) + i * .9, A: 1 - gone});
  }
  rings.forEach(r => ffRing(r.cx, r.cy, r.rx, r.ry, r.ph, k, r.A, false));                         // las mitades de detrás, de abajo arriba
  ctx.save(); for(let i = 0; i < 10; i++){ const u = hdFract(t * 1.3 + i * .1); if(T > end + .3) break; ctx.globalAlpha = 1 - u; ctx.fillStyle = i % 2 ? HD_FIRE[3] : HD_FIRE[2]; const an = t * 6 + i * .63, r = (20 + u * 20) * k; ctx.fillRect(x + Math.cos(an) * r - 2, y - 10 * k - u * 100 * k + Math.sin(an) * r * .35 - 2, 4, 4); } ctx.restore();   // chispas que suben girando
  for(let i = rings.length - 1; i >= 0; i--){ const r = rings[i]; ffRing(r.cx, r.cy, r.rx, r.ry, r.ph, k, r.A, true); }  // las de delante, de arriba abajo
}

// ---- SUELO ARDIENDO (como en el vídeo): una mancha de llamitas que tiemblan en el suelo, tras los ataques de fuego fuertes ----
// Se dibuja DEBAJO de los Pokémon (en fxhdGround, js/fxhd3.js). Llamarada, Envite Ígneo y Giro Fuego la dejan.
const ffSuelo = [];
function ffSueloFuego(x, y, k){
  if(ffSuelo.length >= 6) ffSuelo.shift();
  const seed = Math.random() * 100, n = Math.round(48 * Math.min(1.6, k)), fl = [], R = 78 * k, lob = 3 + (HH(1, seed) * 3 | 0), ph = HH(2, seed) * 6.28;
  const edge = an => .55 + .45 * Math.abs(Math.sin(an * lob / 2 + ph)) + (HH(Math.floor(an * 4), seed + 9) - .5) * .25;   // borde irregular, con «puntas» como una mancha
  for(let i = 0; i < n; i++){
    const an = HH(i, seed) * 6.283, u = Math.pow(HH(i, seed + 1), .8), rr = u * edge(an);                  // más llamas en el centro, sueltas en el borde
    const big = Math.max(0, 1 - rr * .9);
    fl.push({dx: Math.cos(an) * rr * R, dy: Math.sin(an) * rr * R * .36, h: (10 + big * 34 + HH(i, seed + 3) * 14) * k, w: (4.5 + big * 4 + HH(i, seed + 4) * 2) * k,
      p: HH(i, seed + 5) * 6.28, tilt: (HH(i, seed + 6) - .5) * .5 + Math.cos(an) * rr * .25});                 // las del borde se abren un poco hacia fuera
  }
  fl.sort((a, b) => a.dy - b.dy);
  ffSuelo.push({x, y: y + 6, k, t0: g ? g.t : 0, fl});
}
function ffSueloDraw(){
  if(!ffSuelo.length || !g) return;
  const t = g.t;
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  for(let j = ffSuelo.length - 1; j >= 0; j--){
    const S = ffSuelo[j], u = t - S.t0; if(u > FF.sueloDur || u < 0){ ffSuelo.splice(j, 1); continue; }
    const grow = Math.min(1, u / .25), fade = u < FF.sueloDur - .7 ? 1 : (FF.sueloDur - u) / .7;
    ctx.globalAlpha = 1;
    S.fl.forEach((f, i) => {
      const fl = .9 + .14 * Math.sin(t * 15 + f.p) + .08 * Math.sin(t * 23 + f.p * 2), h = f.h * grow * fade * fl; if(h < 2) return;
      const x = S.x + f.dx, y = S.y + f.dy, lean = Math.sin(t * 6 + f.p) * .15 + f.tilt;
      hd4Tongue(x, y, h, f.w, -Math.PI / 2 + lean, HD_FIRE[1], HD_FIRE[0]);
      hd4Tongue(x, y - 1, h * .72, f.w * .62, -Math.PI / 2 + lean, HD_FIRE[2], null);
      hd4Tongue(x, y - 1, h * .4, f.w * .32, -Math.PI / 2 + lean, HD_FIRE[3], null);
    });
  }
  ctx.restore();
}
if(typeof fxhdGround === 'function'){ const o = fxhdGround; fxhdGround = function(){ o.apply(this, arguments); try{ ffSueloDraw(); }catch(e){} }; }

// ---- FRANJA DE FUEGO (el terreno que deja un ataque fuerte de fuego, TERR en combat.js): en vez del rectángulo con llamas dibujadas,
//      llamas sueltas en el suelo a lo largo de la franja, con el borde irregular (como el suelo ardiendo). El efecto en el combate es el mismo.
function ffFranja(q){
  const dx = q.x1 - q.x0, dy = q.y1 - q.y0, len = Math.hypot(dx, dy); if(len < 6) return;
  if(!q.ffl || q.ffLen !== Math.round(len / 20)){                            // las llamas se colocan una vez (y otra si la franja crece)
    q.ffLen = Math.round(len / 20); const seed = q.ffSeed || (q.ffSeed = Math.random() * 100), n = Math.round(len / 5) + 10, L = [];
    for(let i = 0; i < n; i++){ const u = HH(i, seed), side = (HH(i, seed + 1) - .5) * 2, edge = .55 + .45 * Math.abs(Math.sin(u * 9 + seed)), big = 1 - Math.abs(side) * .8;
      L.push({u, o: side * q.w * 1.5 * edge, h: (10 + big * 26 + HH(i, seed + 3) * 12), w: 4.5 + big * 3.5 + HH(i, seed + 4) * 2, p: HH(i, seed + 5) * 6.28, tilt: side * .25 + (HH(i, seed + 6) - .5) * .3}); }
    q.ffl = L;
  }
  const a = clamp(Math.min(q.t / .25, (q.T - q.t) / .8), 0, 1); if(a <= 0) return;
  const ux = dx / len, uy = dy / len, t = g.t, grow = Math.min(1, q.t / .3);
  const pts = q.ffl.map(f => ({f, x: q.x0 + ux * f.u * len - uy * f.o, y: q.y0 + uy * f.u * len + ux * f.o * .7})).sort((m, n) => m.y - n.y);
  ctx.save(); ctx.globalAlpha = 1;
  for(const {f, x, y} of pts){
    const fl = .9 + .14 * Math.sin(t * 15 + f.p) + .08 * Math.sin(t * 23 + f.p * 2), h = f.h * a * grow * fl; if(h < 2) continue;
    const lean = Math.sin(t * 6 + f.p) * .15 + f.tilt;
    hd4Tongue(x, y, h, f.w, -Math.PI / 2 + lean, HD_FIRE[1], HD_FIRE[0]);
    hd4Tongue(x, y - 1, h * .72, f.w * .62, -Math.PI / 2 + lean, HD_FIRE[2], null);
    hd4Tongue(x, y - 1, h * .4, f.w * .32, -Math.PI / 2 + lean, HD_FIRE[3], null);
  }
  ctx.restore();
}
if(typeof terrDraw === 'function'){ const o = terrDraw; terrDraw = function(){
    if(!g || !g.terr || !g.terr.some(q => q.type === 'fuego')) return o.apply(this, arguments);
    const all = g.terr; g.terr = all.filter(q => q.type !== 'fuego');
    try{ o.apply(this, arguments); } finally { g.terr = all; }
    ctx.save(); terrClip(); try{ all.forEach(q => { if(q.type === 'fuego') ffFranja(q); }); }catch(e){} ctx.restore();
  }; }

// ---- Se enganchan (con fxhd.on = false se ve lo de siempre) ----
// Se ven SIEMPRE (también con los efectos HD apagados): son dibujos planos y no pesan
{ const oF = FXR.flight['Llamarada'], oI = FXR.impact['Llamarada'];
  const keep = (fn, o) => { Object.assign(fn, o || {}); delete fn.draw; return fn; };
  FXR.flight['Llamarada'] = keep((s, a, an) => ffLlamaFlight(s, a, an), oF);
  FXR.impact['Llamarada'] = keep((e, a) => ffLlamaHit(e, a), oI);
  FXC['Llamarada'] = Object.assign({}, FXC['Llamarada'], {idur: FF.llamaDur});
}
// Giro Fuego nace con las recetas de Ascuas (sonido, estela, fogonazo al lanzar) y se le pone su vuelo y su torbellino
{ const N = 'Giro Fuego', B = 'Ascuas';
  if(FXR.cast[B]) FXR.cast[N] = FXR.cast[B]; if(FXR.trail[B]) FXR.trail[N] = FXR.trail[B]; if(FXR.shotStart[B]) FXR.shotStart[N] = FXR.shotStart[B];
  const oldF = FXR.flight[B], oldI = FXR.impact[B];
  FXR.flight[N] = (s, a, an) => ffGiroFlight(s, a, an);
  FXR.impact[N] = (e, a) => ffGiroHit(e, a);
  FXC[N] = Object.assign({}, FXC[B], {idur: FF.giroDur});
  if(typeof LEARN !== 'undefined') LEARN[N] = '4-6,37-38,58-59,77-78,126,136,146-149,151,155-157,218-219,228-229,240,244,250,255-257,322-324,330,334,338,371-373,390-392,435,467,485,494,498-500,513,554-555,607-609,631,635-637,643,653-655,662-663,667-668,721,725-727,776,791,806,813-815,838-839,850-851,880,890,909-911,935-937,994,1004-1005,1007,1020';   // quién lo aprende (datos de Pokémon Showdown)
}

// Envite Ígneo también deja el suelo ardiendo
{ const o = FXR.impact['Envite Ígneo']; if(o){ const w = (e, a, ...r) => { if(a > .15 && !e.ffSuelo){ e.ffSuelo = 1; ffSueloFuego(e.x, e.y, e.k || 1); } return o(e, a, ...r); }; Object.assign(w, o); FXR.impact['Envite Ígneo'] = w; } }
