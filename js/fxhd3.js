"use strict";
/* =====================================================================
   MEJORA GENERAL DE TODOS LOS ATAQUES (prototipo). Se «envuelve» cada receta de siempre (proyectil, golpe cuerpo a cuerpo e impacto)
   y se le añade encima una capa HD con la PERSONALIDAD de su tipo:
     fuego = brasas y humo · agua = gotas y ondas · eléctrico = arcos · hielo = cristales · planta = hojas · psíquico = anillos ·
     fantasma/siniestro = volutas oscuras · veneno = burbujas · tierra/roca = trozos y polvo · volador = viento · bicho = enjambre ·
     lucha = onda de impacto · dragón = llamas violetas · acero = destellos · hada = estrellitas · normal = chispas blancas
   Además los impactos dejan MARCAS EN EL SUELO que se desvanecen (quemadura, charco, escarcha, veneno, sombra, grieta).
   Las recetas de siempre NO se tocan: con fxhd.on = false se ven exactamente como antes.
   Los ataques estrella (Lanzallamas, Hidrobomba...) tienen su receta completa en fxhd2.js; aquí se van sumando más.
   ===================================================================== */
const hdRGB = hex => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const hdCol = (hex) => { const c = hdRGB(hex); return hdBlob(c[0], c[1], c[2]); };
const hdStar4 = (x, y, r, a) => {                                    // destello en cruz de 4 puntas
  ctx.globalAlpha = Math.min(1, a); ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
};
const hdLeaf = (x, y, r, rot, a, col) => { ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = col; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath(); ctx.ellipse(0, 0, r, r * .42, 0, 0, 6.283); ctx.fill(); ctx.restore(); };
const hdBolt = (x0, y0, x1, y1, seed, col, w) => {                   // rayo en zigzag
  const n = 6, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0);
  for(let i = 1; i < n; i++){ const u = i / n, o = (HH(seed, i) - .5) * L * .28; ctx.lineTo(x0 + dx * u + nx * o, y0 + dy * u + ny * o); }
  ctx.lineTo(x1, y1); ctx.stroke();
};

// ---------------------------------------------------------------------
// MARCAS EN EL SUELO (se dibujan debajo de los Pokémon: render.js llama a fxhdGround justo después de arena())
// ---------------------------------------------------------------------
const HD_DECAL = {fuego:'scorch', electrico:'scorch', agua:'puddle', hielo:'frost', veneno:'poison', fantasma:'shadow', siniestro:'shadow', tierra:'crack', roca:'crack', dragon:'shadow'};
fxhd.decals = [];
function hdDecal(x, y, type, k){
  const kind = HD_DECAL[type]; if(!kind) return;
  if(fxhd.decals.length >= 12) fxhd.decals.shift();
  fxhd.decals.push({x, y: y + 12, kind, k: k || 1, t: 0, dur: kind === 'puddle' ? 5.5 : 4.6, seed: Math.random() * 50, type});
}
let hdGLast = performance.now();
function fxhdGround(){
  const now = performance.now(), dt = Math.min(.05, (now - hdGLast) / 1000); hdGLast = now;
  if(!fxhd.on || !g) return;
  if(typeof hdSurfUnder === 'function') hdSurfUnder();                // el cuerpo de la ola de Surf va DEBAJO de los Pokémon (se ven «montados» en ella)
  if(!fxhd.decals.length) return;
  fxhd.decals.forEach(d => d.t += (g.paused ? 0 : dt));
  fxhd.decals = fxhd.decals.filter(d => d.t < d.dur);
  ctx.save();
  for(const d of fxhd.decals){
    const u = d.t / d.dur, fade = u < .08 ? u / .08 : Math.pow(1 - (u - .08) / .92, 1.4), R_ = (40 + 8 * d.k) * Math.min(1, .5 + d.t * 4);
    ctx.save(); ctx.translate(d.x, d.y); ctx.scale(1, .42);
    if(d.kind === 'scorch'){
      const hot = d.type === 'electrico' ? [255, 226, 90] : [255, 110, 20];
      ctx.globalAlpha = fade * .85; ctx.drawImage(hdBlob(20, 14, 10), -R_, -R_, R_ * 2, R_ * 2); ctx.globalAlpha = fade * .6; ctx.drawImage(hdBlob(20, 14, 10), -R_ * .6, -R_ * .6, R_ * 1.2, R_ * 1.2);
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.max(0, 1 - u * 1.8) * (.8 + .2 * Math.sin(d.t * 18)); ctx.drawImage(hdBlob(hot[0], hot[1], hot[2]), -R_ * .8, -R_ * .8, R_ * 1.6, R_ * 1.6);
    }else if(d.kind === 'puddle'){
      ctx.globalAlpha = fade * .8; ctx.drawImage(hdBlob(20, 80, 190), -R_ * 1.1, -R_ * 1.1, R_ * 2.2, R_ * 2.2); ctx.globalAlpha = fade * .5; ctx.drawImage(hdBlob(120, 190, 255), -R_ * .6, -R_ * .6, R_ * 1.2, R_ * 1.2);
      ctx.globalAlpha = fade * .8; ctx.strokeStyle = '#bfe6ff'; ctx.lineWidth = 2.2;
      for(let r = 0; r < 2; r++){ const v = ((d.t * .7 + r * .5) % 1); ctx.globalAlpha = fade * (1 - v) * .8; ctx.beginPath(); ctx.arc(0, 0, R_ * (.3 + .7 * v), 0, 6.283); ctx.stroke(); }
    }else if(d.kind === 'frost'){
      ctx.globalAlpha = fade * .9; ctx.drawImage(hdBlob(190, 235, 255), -R_ * 1.1, -R_ * 1.1, R_ * 2.2, R_ * 2.2); ctx.globalAlpha = fade * .7; ctx.drawImage(hdBlob(255, 255, 255), -R_ * .6, -R_ * .6, R_ * 1.2, R_ * 1.2);
      ctx.globalAlpha = fade * .9; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
      for(let i = 0; i < 7; i++){ const a = i * .9 + d.seed, l = R_ * (.5 + HH(d.seed, i) * .6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l); ctx.stroke(); }
    }else if(d.kind === 'poison'){
      ctx.globalAlpha = fade * .85; ctx.drawImage(hdBlob(100, 30, 140), -R_, -R_, R_ * 2, R_ * 2);
      ctx.globalAlpha = fade * .75; ctx.drawImage(hdBlob(150, 220, 70), -R_ * .6, -R_ * .6, R_ * 1.2, R_ * 1.2);
    }else if(d.kind === 'shadow'){
      ctx.globalAlpha = fade * .9; ctx.drawImage(hdBlob(14, 4, 30), -R_ * 1.1, -R_ * 1.1, R_ * 2.2, R_ * 2.2); ctx.globalAlpha = fade * .7; ctx.drawImage(hdBlob(14, 4, 30), -R_ * .6, -R_ * .6, R_ * 1.2, R_ * 1.2);
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = fade * .45; ctx.drawImage(hdBlob(130, 80, 220), -R_ * .6, -R_ * .6, R_ * 1.2, R_ * 1.2);
    }else if(d.kind === 'crack'){
      ctx.globalAlpha = fade * .55; ctx.drawImage(hdBlob(50, 32, 16), -R_, -R_, R_ * 2, R_ * 2);
      ctx.globalAlpha = fade * .85; ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      for(let i = 0; i < 6; i++){ const a = i * 1.05 + d.seed; let x = 0, y = 0; ctx.beginPath(); ctx.moveTo(0, 0);
        for(let s = 1; s <= 4; s++){ x += Math.cos(a + (HH(d.seed, i * 9 + s) - .5) * .9) * R_ * .3; y += Math.sin(a + (HH(d.seed, i * 9 + s) - .5) * .9) * R_ * .3; ctx.lineTo(x, y); } ctx.stroke(); }
    }
    ctx.restore();
  }
  ctx.restore();
}

// ---------------------------------------------------------------------
// PROYECTILES: halo + estela suave + partículas del tipo
// ---------------------------------------------------------------------
function hdShot(s, a, an, type){
  const P = fxPal(type), t = g.t, r = Math.max(5, s.r || 9), ca = Math.cos(an), sa = Math.sin(an), px = -sa, py = ca;
  const Bd = hdCol(P[1]), Bm = hdCol(P[2]), Bl = hdCol(P[3]), Bw = hdCol(P[4]);
  ctx.save();
  for(let i = 1; i <= 9; i++){ const d = i * r * .85, k = 1 - i / 10, w = Math.sin(t * 20 + i) * r * .12;                    // estela
    hdPut(Bd, s.x - ca * d + px * w, s.y - sa * d + py * w, r * (1.5 * k + .3), .3 * k); }
  ctx.globalCompositeOperation = 'lighter';
  for(let i = 1; i <= 9; i++){ const d = i * r * .85, k = 1 - i / 10; hdPut(Bm, s.x - ca * d, s.y - sa * d, r * (1.0 * k + .2), .34 * k); }
  hdPut(Bl, s.x, s.y, r * 2.0, .3); hdPut(Bw, s.x, s.y, r * .95, .4);                                                    // halo
  // personalidad
  const c = P[4], c2 = P[3]; ctx.fillStyle = c; ctx.strokeStyle = c;
  if(type === 'fuego' || type === 'dragon'){ for(let i = 0; i < 7; i++){ const u = hdFract(i * .31 + t * 1.4), d = r * .6 + u * r * 4; ctx.globalAlpha = (1 - u) * .9; ctx.beginPath(); ctx.arc(s.x - ca * d + px * (HH(i, 2) - .5) * r * 1.6, s.y - sa * d + py * (HH(i, 2) - .5) * r * 1.6 - u * 10, 1 + HH(i, 5) * 1.6, 0, 6.283); ctx.fill(); } }
  else if(type === 'agua'){ for(let i = 0; i < 7; i++){ const u = hdFract(i * .31 + t * 1.5), d = r * .6 + u * r * 4; ctx.globalAlpha = (1 - u) * .9; ctx.beginPath(); ctx.arc(s.x - ca * d + px * (HH(i, 2) - .5) * r * 1.8, s.y - sa * d + py * (HH(i, 2) - .5) * r * 1.8 + u * u * 14, 1.1 + HH(i, 5) * 1.5, 0, 6.283); ctx.fill(); } }
  else if(type === 'electrico'){ const k = Math.floor(t * 30); ctx.lineCap = 'round'; for(let i = 0; i < 3; i++){ const A_ = HH(k, i) * 6.283, L = r * (2 + HH(k, i + 4) * 1.5); ctx.globalAlpha = .95; hdBolt(s.x, s.y, s.x + Math.cos(A_) * L, s.y + Math.sin(A_) * L, k + i, i ? c2 : '#ffffff', 1.8); } }
  else if(type === 'hielo'){ for(let i = 0; i < 5; i++){ const u = hdFract(i * .37 + t * 1.1), d = r + u * r * 4, x = s.x - ca * d + px * (HH(i, 2) - .5) * r * 2.2, y = s.y - sa * d + py * (HH(i, 2) - .5) * r * 2.2; hdStar4(x, y, 2.5 + HH(i, 3) * 3, (1 - u) * (.6 + .4 * Math.sin(t * 14 + i))); } }
  else if(type === 'planta'){ for(let i = 0; i < 5; i++){ const u = hdFract(i * .37 + t * 1.1), d = r + u * r * 4; hdLeaf(s.x - ca * d + px * Math.sin(t * 6 + i * 2) * r * 1.2, s.y - sa * d + py * Math.sin(t * 6 + i * 2) * r * 1.2, 3.5, t * 8 + i, (1 - u) * .9, i % 2 ? '#9be86a' : '#5cd04a'); } }
  else if(type === 'psiquico' || type === 'hada'){ ctx.lineWidth = 2; for(let i = 0; i < 3; i++){ const u = hdFract(i * .33 + t * 1.3), d = r * .8 + u * r * 3.4; ctx.globalAlpha = (1 - u) * .9; ctx.beginPath(); ctx.ellipse(s.x - ca * d, s.y - sa * d, r * (.4 + u * .5), r * (1 + u * .9), an, 0, 6.283); ctx.stroke(); }
    if(type === 'hada') for(let i = 0; i < 4; i++){ const u = hdFract(i * .37 + t * 1.2); hdStar4(s.x - ca * (r + u * r * 3.5) + px * (HH(i, 2) - .5) * r * 3, s.y - sa * (r + u * r * 3.5) + py * (HH(i, 2) - .5) * r * 3, 3 + HH(i, 4) * 2, (1 - u)); } }
  else if(type === 'fantasma' || type === 'siniestro'){ for(let i = 0; i < 4; i++){ const u = hdFract(i * .27 + t * 1.0), d = r + u * r * 3.5; ctx.globalAlpha = 1; hdPut(Bd, s.x - ca * d + px * Math.sin(t * 5 + i * 2) * r * 1.4, s.y - sa * d + py * Math.sin(t * 5 + i * 2) * r * 1.4, r * (1 - u * .5), (1 - u) * .45); } }
  else if(type === 'veneno'){ ctx.lineWidth = 1.4; for(let i = 0; i < 5; i++){ const u = hdFract(i * .31 + t * 1.0), d = r * .6 + u * r * 3.6; ctx.globalAlpha = (1 - u) * .85; ctx.beginPath(); ctx.arc(s.x - ca * d + px * (HH(i, 2) - .5) * r * 1.8, s.y - sa * d + py * (HH(i, 2) - .5) * r * 1.8 - u * 12, 1.5 + HH(i, 6) * 2.6, 0, 6.283); ctx.stroke(); } }
  else if(type === 'tierra' || type === 'roca'){ ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = type === 'roca' ? '#b0a37a' : '#8a5a24'; for(let i = 0; i < 6; i++){ const u = hdFract(i * .31 + t * 1.2), d = r * .8 + u * r * 3.8; ctx.globalAlpha = (1 - u); ctx.fillRect(s.x - ca * d + px * (HH(i, 2) - .5) * r * 1.6, s.y - sa * d + py * (HH(i, 2) - .5) * r * 1.6 + u * u * 16, 2 + HH(i, 3) * 2.5, 2 + HH(i, 3) * 2.5); } }
  else if(type === 'volador'){ ctx.lineWidth = 1.6; ctx.lineCap = 'round'; for(let i = 0; i < 4; i++){ const u = hdFract(i * .27 + t * 1.5), d = r + u * r * 4, o = (i - 1.5) * r * .8; ctx.globalAlpha = (1 - u) * .85; ctx.beginPath(); ctx.moveTo(s.x - ca * d + px * o, s.y - sa * d + py * o); ctx.lineTo(s.x - ca * (d + r * 1.6) + px * o, s.y - sa * (d + r * 1.6) + py * o); ctx.stroke(); } }
  else if(type === 'acero'){ for(let i = 0; i < 3; i++){ const u = hdFract(i * .33 + t * 1.6); hdStar4(s.x - ca * (r + u * r * 3) + px * (HH(i, 2) - .5) * r * 2, s.y - sa * (r + u * r * 3) + py * (HH(i, 2) - .5) * r * 2, 3 + HH(i, 4) * 3, (1 - u)); } }
  else{ for(let i = 0; i < 5; i++){ const u = hdFract(i * .31 + t * 1.3), d = r + u * r * 3.8; ctx.globalAlpha = (1 - u); ctx.beginPath(); ctx.arc(s.x - ca * d + px * (HH(i, 2) - .5) * r * 1.8, s.y - sa * d + py * (HH(i, 2) - .5) * r * 1.8, 1 + HH(i, 5) * 1.5, 0, 6.283); ctx.fill(); } }
  ctx.restore();
}

// ---------------------------------------------------------------------
// IMPACTOS: destello + onda + efecto propio del tipo
// ---------------------------------------------------------------------
function hdImpact(e, a, type){
  const P = fxPal(type), k = e.k || 1, u = clamp01(a / .7), out = 1 - Math.pow(1 - u, 3), x = e.x, y = e.y;
  const Bd = hdCol(P[1]), Bm = hdCol(P[2]), Bl = hdCol(P[3]), Bw = hdCol(P[4]);
  if(!e.hdDec){ e.hdDec = 1; hdDecal(x, y, type, k); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  hdPut(Bm, x, y, (20 + 18 * out) * Math.min(k, 1.2), (1 - u) * .34); hdPut(Bw, x, y, (9 + 6 * out) * Math.min(k, 1.2), (1 - u * 1.6) * .18);
  ctx.fillStyle = P[4]; ctx.strokeStyle = P[3];
  const ray = (n, v0, v1, grav, size, st) => { for(let j = 0; j < n; j++){ const an = (st || 0) + j * 6.283 / n + (HH(j, 6) - .5) * .5, v = v0 + HH(j, 8) * (v1 - v0), tt = a; ctx.globalAlpha = Math.max(0, 1 - tt / (.4 + HH(j, 1) * .35));
      ctx.beginPath(); ctx.arc(x + Math.cos(an) * v * tt, y + Math.sin(an) * v * tt * .85 + grav * tt * tt, size * (.7 + HH(j, 3)), 0, 6.283); ctx.fill(); } };
  if(type === 'fuego' || type === 'dragon'){ ray(14, 60, 200, 260, 1.7); if(type === 'fuego'){ ctx.globalCompositeOperation = 'source-over'; for(let i = 0; i < 4; i++) hdPut(hdBlob(96, 84, 78), x + (HH(i, 2) - .5) * 26, y - 6 - u * 26 - i * 3, (9 + 8 * u) * k, (u > .12 ? 1 - u : u * 8) * .3); } }
  else if(type === 'agua'){ ctx.lineWidth = 2; for(let r = 0; r < 2; r++){ const v = clamp01((a - r * .1) / .55); if(v <= 0 || v >= 1) continue; ctx.globalAlpha = (1 - v) * .85; ctx.beginPath(); ctx.ellipse(x, y + 8, (8 + 40 * k) * v, (3 + 15 * k) * v, 0, 0, 6.283); ctx.stroke(); } ray(16, 70, 210, 330, 1.7, -1.5); }
  else if(type === 'electrico'){ if(a < .3){ const kk = Math.floor(a * 40); ctx.lineCap = 'round'; for(let i = 0; i < 6; i++){ const A_ = i * 1.05 + HH(kk, i) * .6, L = (26 + HH(kk, i + 3) * 24) * k; ctx.globalAlpha = 1 - a / .3; hdBolt(x, y, x + Math.cos(A_) * L, y + Math.sin(A_) * L, kk + i, i % 2 ? '#ffffff' : P[3], 2.2); } } }
  else if(type === 'hielo'){ for(let j = 0; j < 9; j++){ const an = j * .7 + HH(j, 6), v = 70 + HH(j, 8) * 140, tt = a, X = x + Math.cos(an) * v * tt, Y = y + Math.sin(an) * v * tt * .85 + 160 * tt * tt;
      ctx.globalAlpha = Math.max(0, 1 - tt / .65); ctx.fillStyle = j % 2 ? '#ffffff' : P[3]; ctx.save(); ctx.translate(X, Y); ctx.rotate(an + tt * 6); ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(2.2, 0); ctx.lineTo(0, 5); ctx.lineTo(-2.2, 0); ctx.closePath(); ctx.fill(); ctx.restore(); }
    ctx.globalAlpha = (1 - u) * .8; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y + 6, 36 * k * out, 14 * k * out, 0, 0, 6.283); ctx.stroke(); }
  else if(type === 'planta'){ for(let j = 0; j < 8; j++){ const an = j * .8 + HH(j, 6), v = 50 + HH(j, 8) * 110, tt = a; hdLeaf(x + Math.cos(an) * v * tt, y + Math.sin(an) * v * tt * .8 + 90 * tt * tt, 5, an + tt * 9, Math.max(0, 1 - tt / .7), j % 2 ? '#9be86a' : '#3fb43a'); } }
  else if(type === 'psiquico' || type === 'hada'){ ctx.lineWidth = 2.5; for(let r = 0; r < 3; r++){ const v = clamp01((a - r * .09) / .6); if(v <= 0 || v >= 1) continue; ctx.globalAlpha = (1 - v) * .9; ctx.beginPath(); ctx.arc(x, y, (10 + 52 * k) * (1 - Math.pow(1 - v, 2)), 0, 6.283); ctx.stroke(); }
    if(type === 'hada') for(let j = 0; j < 7; j++){ const an = j * .9, v = 30 + HH(j, 8) * 70; hdStar4(x + Math.cos(an) * v * a, y + Math.sin(an) * v * a - a * 20, 3 + HH(j, 3) * 3, Math.max(0, 1 - a / .65)); } }
  else if(type === 'fantasma' || type === 'siniestro'){ ctx.globalCompositeOperation = 'source-over'; for(let j = 0; j < 6; j++){ const an = j * 1.05 + HH(j, 6), v = 20 + HH(j, 8) * 30; hdPut(Bd, x + Math.cos(an) * v * out, y + Math.sin(an) * v * out * .8 - u * 14, (12 + 8 * out) * k, (1 - u) * .6); }
    ctx.globalCompositeOperation = 'lighter'; hdPut(hdBlob(150, 90, 230), x, y, (16 + 12 * out) * k, (1 - u) * .5); }
  else if(type === 'veneno'){ ctx.lineWidth = 1.6; ctx.globalAlpha = 1; for(let j = 0; j < 9; j++){ const an = -Math.PI * (.1 + .8 * HH(j, 6)), v = 30 + HH(j, 8) * 70, tt = a; ctx.globalAlpha = Math.max(0, 1 - tt / .7); ctx.beginPath(); ctx.arc(x + Math.cos(an) * v * tt, y + Math.sin(an) * v * tt - tt * 20, 2 + HH(j, 3) * 3, 0, 6.283); ctx.stroke(); } }
  else if(type === 'tierra' || type === 'roca'){ ctx.globalCompositeOperation = 'source-over'; for(let i = 0; i < 4; i++) hdPut(hdBlob(150, 120, 80), x + (HH(i, 2) - .5) * 40 * out, y + 4 - u * 8, (14 + 10 * out) * k, (1 - u) * .45);
    ctx.fillStyle = type === 'roca' ? '#c9bd94' : '#a8743a'; for(let j = 0; j < 9; j++){ const an = -Math.PI * (.12 + .76 * HH(j, 6)), v = 80 + HH(j, 8) * 160, tt = a; ctx.globalAlpha = Math.max(0, 1 - tt / .7); ctx.save(); ctx.translate(x + Math.cos(an) * v * tt, y + Math.sin(an) * v * tt + 380 * tt * tt); ctx.rotate(tt * 8 + j); const s = 2.5 + HH(j, 3) * 3; ctx.fillRect(-s, -s, s * 2, s * 2); ctx.restore(); } }
  else if(type === 'volador'){ ctx.lineWidth = 2; ctx.lineCap = 'round'; for(let r = 0; r < 3; r++){ const v = clamp01((a - r * .07) / .5); if(v <= 0 || v >= 1) continue; ctx.globalAlpha = (1 - v) * .85; ctx.beginPath(); ctx.arc(x, y, (14 + 30 * k) * v, r + a * 8, r + a * 8 + 3.2); ctx.stroke(); } }
  else if(type === 'lucha'){ ctx.lineWidth = 3; ctx.globalAlpha = (1 - u) * .9; ctx.beginPath(); ctx.ellipse(x, y + 8, 46 * k * out, 17 * k * out, 0, 0, 6.283); ctx.stroke(); ray(12, 80, 220, 0, 1.6); }
  else if(type === 'acero' || type === 'bicho'){ ray(12, 80, 240, 120, 1.5); if(type === 'acero') for(let j = 0; j < 4; j++){ const an = j * 1.6 + .4, v = 20 + HH(j, 8) * 36; hdStar4(x + Math.cos(an) * v, y + Math.sin(an) * v, 5 + HH(j, 3) * 5, Math.max(0, 1 - a / .45)); } }
  else{ ray(12, 70, 200, 140, 1.6); }
  ctx.restore();
}

// ---------------------------------------------------------------------
// CUERPO A CUERPO: tajo curvo del color del tipo + destello (y el mismo impacto del tipo)
// ---------------------------------------------------------------------
function hdMelee(e, a, type){
  const P = fxPal(type), k = e.k || 1, an = e.ang || 0;
  if(a > .05 && a < .32){
    const u = clamp01((a - .05) / .27), sw = (-1.1 + 2.2 * (1 - Math.pow(1 - u, 2))), al = Math.sin(u * 3.14), R_ = 34 * (.8 + .4 * k);
    ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(an); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    [[P[2], 12], [P[3], 7], [P[4], 3]].forEach(([c, lw]) => { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.globalAlpha = al * .9; ctx.beginPath(); ctx.arc(-R_ * .6, 0, R_, sw - .8, sw + .15); ctx.stroke(); });
    ctx.restore();
  }
  if(a > .1){ const ie = e.hdImp || (e.hdImp = {x:e.x, y:e.y, k:k * .75, type}); hdImpact(ie, a - .1, type); }
}

// ---------------------------------------------------------------------
// Se envuelven TODAS las recetas existentes (las que ya son HD por completo, fxhd2.js, se saltan)
// ---------------------------------------------------------------------
const HD_FULL = {STR:['Lanzallamas', 'Hidrobomba'], FLT:['Lanzallamas', 'Hidrobomba'], IMP:['Lanzallamas', 'Hidrobomba']};
function hdWrapAll(){
  const wrap = (tab, kind, fn) => Object.keys(tab).forEach(n => {
    const old = tab[n]; if(!old || old.hdw || (HD_FULL[kind] || []).includes(n)) return;
    const draw = typeof old === 'function' ? old : old.draw; if(typeof draw !== 'function') return;
    const w = (...args) => {
      draw(...args);
      if(fxhd.on){ try{ fn(n, ...args); }catch(err){} } };
    if(typeof old === 'function') Object.assign(w, old); else Object.assign(w, old, {draw:w});
    w.hdw = 1; tab[n] = w;
  });
  wrap(FXR.flight, 'FLT', (n, s, a, an, type) => hdShot(s, a, an, type || s.type));
  wrap(FXR.impact, 'IMP', (n, e, a, type) => hdImpact(e, a, type || e.type));
  wrap(FXR.melee, 'MEL', (n, e, a, type) => hdMelee(e, a, type || e.type));
}
hdWrapAll();
// Marcas también en los ataques estrella (su impacto ya es HD)
['Lanzallamas', 'Hidrobomba'].forEach(n => { const old = FXR.impact[n]; FXR.impact[n] = (e, a, type) => { old(e, a, type); if(fxhd.on && !e.hdDec){ e.hdDec = 1; hdDecal(e.x, e.y, e.type || type, e.k || 1); } }; });
const hdFxClear3 = fxClear; fxClear = function(){ hdFxClear3(); fxhd.decals.length = 0; };
