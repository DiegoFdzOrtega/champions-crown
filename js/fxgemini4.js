"use strict";
/* =====================================================================
   SPRITES DE GEMINI (4ª tanda, los ataques más usados). assets/fx/*.png con el fondo ya quitado. Usa gmDraw/gmOk (js/fxgemini.js) y gmMove (js/fxgemini2.js).
     hb_chorro · hb_golpe ..... HIDROBOMBA: el chorro con la ola en la punta (se estira hasta el rival) y la explosión de agua
     lr_roca · lr_golpe ....... LANZARROCAS: la roca que gira y cómo se rompe en trozos y polvo
     cz_aura · cz_golpe ....... CABEZAZO ZEN: la punta de flecha rosa delante de la cabeza y el estallido psíquico
     oc_orb · oc_golpe ........ ONDA CERTERA: la bola naranja y la gran explosión
     aa_ala · aa_golpe ........ ATAQUE ALA: el ala que barre y la nube de viento con plumas
     ea_orb · ea_golpe ........ ESFERA AURAL: la bola azul con remolinos y el estallido de aura
     ry_rayo · ry_golpe ....... RAYO: los trozos de rayo en zigzag (se repiten a lo largo) y el chispazo
   Mientras una imagen no ha cargado (o si falta), se ve el dibujo de código de antes. GM.on = false vuelve a los de código.
   G4 = tamaños [AJUSTE].
   ===================================================================== */
const G4 = {hbW: .5, ryW: .55, roca: .55, rocaHit: .7, ea: .6, eaHit: .85, oc: .72, ocHit: 1.25, cz: .55, czHit: .8, ala: .42, alaHit: .5, hbHit: .9, ryHit: .8};
Object.assign(GM.meta, {
  hb_chorro: {fw: 115, fh: 99, n: 4}, hb_golpe: {fw: 116, fh: 116, n: 4}, ry_rayo: {fw: 115, fh: 88, n: 3}, ry_golpe: {fw: 115, fh: 123, n: 3},
  cz_aura: {fw: 87, fh: 87, n: 4}, cz_golpe: {fw: 96, fh: 100, n: 4}, ea_orb: {fw: 83, fh: 93, n: 4}, ea_golpe: {fw: 113, fh: 133, n: 5},
  oc_orb: {fw: 76, fh: 78, n: 3}, oc_golpe: {fw: 93, fh: 92, n: 7}, lr_roca: {fw: 68, fh: 82, n: 4}, lr_golpe: {fw: 111, fh: 100, n: 6},
  aa_ala: {fw: 234, fh: 175, n: 4}, aa_golpe: {fw: 186, fh: 183, n: 5}});
['hb_chorro', 'hb_golpe', 'ry_rayo', 'ry_golpe', 'cz_aura', 'cz_golpe', 'ea_orb', 'ea_golpe', 'oc_orb', 'oc_golpe', 'lr_roca', 'lr_golpe', 'aa_ala', 'aa_golpe'].forEach(k => {
  const im = new Image(); im.onload = () => { GM.meta[k].ok = true; }; im.src = `assets/fx/${k}.png?v=1`; GM.img[k] = im; });
// Cuadro de la animación según el avance u (0..1) · un impacto que dura d segundos
const g4F = (k, u) => Math.min(GM.meta[k].n - 1, Math.floor(brClamp(u) * GM.meta[k].n));
const g4Hit = (k, sc, d, dy) => (e, a) => { const u = a / d; if(u >= 1) return; gmDraw(k, g4F(k, u), e.x, e.y - (dy || 6), sc * (e.k || 1), 0, u > .85 ? (1 - u) / .15 : 1); };
// Dibuja un trozo de una tira (sx0..sx1 = parte del cuadro, de 0 a 1) estirado de (x0) a (x1) a lo largo del eje, con alto h
function g4Part(k, i, sx0, sx1, x0, len, h, A){
  const M = GM.meta[k], im = GM.img[k]; if(!M.ok || len <= 0) return; i = ((i % M.n) + M.n) % M.n;
  ctx.globalAlpha = A; ctx.drawImage(im, i * M.fw + M.fw * sx0, 0, M.fw * (sx1 - sx0), M.fh, x0, -h / 2, len, h);
}
// Cambia una receta (chorro o golpe) por la nueva solo cuando sus imágenes han cargado
function g4Swap(table, name, keys, fn){
  const o = table[name], old = o && (o.draw || o);
  const w = function(){ if(gmOk(...keys)) return fn.apply(this, arguments); if(old) return old.apply(this, arguments); };
  if(o) Object.assign(w, o); delete w.draw; table[name] = w;
}

// ---------------- HIDROBOMBA (chorro) ----------------
g4Swap(FXR.stream, 'Hidrobomba', ['hb_chorro'], (e, a) => {
  const G = sg(e, 260), M = GM.meta.hb_chorro, fr = Math.floor(g.t * 12), h = M.fh * G4.hbW * 1.25, head = Math.min(G.len, M.fw * .5 * G4.hbW * 1.6);
  ctx.save(); ctx.translate(G.x0, G.y0); ctx.rotate(G.an); ctx.imageSmoothingEnabled = false;
  g4Part('hb_chorro', fr, 0, .5, 0, G.len - head + 2, h * (.92 + .08 * Math.sin(g.t * 30)), G.al);   // el cuerpo del chorro, estirado
  g4Part('hb_chorro', fr, .5, 1, G.len - head, head, h, G.al);                                        // la ola de la punta
  ctx.restore();
});
g4Swap(FXR.impact, 'Hidrobomba', ['hb_golpe'], g4Hit('hb_golpe', G4.hbHit, .8, 0));

// ---------------- RAYO (chorro) ----------------
g4Swap(FXR.stream, 'Rayo', ['ry_rayo'], (e, a) => {
  const G = sg(e, 300), M = GM.meta.ry_rayo, seg = M.fw * G4.ryW * .92, n = Math.max(1, Math.ceil(G.len / seg)), k = Math.floor(g.t * 18), h = M.fh * G4.ryW;
  ctx.save(); ctx.translate(G.x0, G.y0); ctx.rotate(G.an); ctx.imageSmoothingEnabled = false;
  for(let i = 0; i < n; i++){ const x = i * seg, L = Math.min(seg + 2, G.len - x); if(L <= 2) break;
    g4Part('ry_rayo', (k + i) % M.n, 0, L / (seg + 2), x, L, h * (i % 2 ? -1 : 1), G.al); }                 // los trozos alternan arriba / abajo para que el zigzag no se repita
  ctx.restore();
  if(typeof brGlow === 'function') brGlow(G.x1, G.y1, 26, '255,240,120', .45 * G.al);
});
g4Swap(FXR.impact, 'Rayo', ['ry_golpe'], g4Hit('ry_golpe', G4.ryHit, .55));

// ---------------- LANZARROCAS ----------------
gmMove('Lanzarrocas', ['lr_roca'], (s, a, an) => {
  const ph = (s.x * 7 + s.y * 3) % 4;
  gmDraw('lr_roca', Math.floor(g.t * 10 + ph), s.x, s.y - 6, G4.roca, g.t * 4 + ph, 1);
}, ['lr_golpe'], g4Hit('lr_golpe', G4.rocaHit, .6, 2));

// ---------------- ESFERA AURAL ----------------
gmMove('Esfera Aural', ['ea_orb'], (s, a, an) => {
  brGlow(s.x, s.y - 6, 28, '120,200,255', .4);
  gmDraw('ea_orb', Math.floor(g.t * 12), s.x, s.y - 6, G4.ea, 0, 1);
}, ['ea_golpe'], g4Hit('ea_golpe', G4.eaHit, .6));

// ---------------- ONDA CERTERA ----------------
gmMove('Onda Certera', ['oc_orb'], (s, a, an) => {
  brGlow(s.x, s.y - 6, 44, '255,170,80', .45);
  gmDraw('oc_orb', Math.floor(g.t * 10), s.x, s.y - 6, G4.oc * (1 + .05 * Math.sin(g.t * 20)), 0, 1);
}, ['oc_golpe'], (e, a) => {
  const u = a / .9; if(u >= 1) return;
  if(u < .2) brGlow(e.x, e.y - 6, 90 * (e.k || 1), '255,190,90', (1 - u / .2) * .8);
  gmDraw('oc_golpe', g4F('oc_golpe', u), e.x, e.y - 6, G4.ocHit * (e.k || 1), 0, u > .85 ? (1 - u) / .15 : 1);
});

// ---------------- CABEZAZO ZEN (golpe) ----------------
g4Swap(FXR.melee, 'Cabezazo Zen', ['cz_aura', 'cz_golpe'], (e, a) => {
  const f = e.fol;
  if(f && a < .26){ const A = a < .2 ? 1 : (.26 - a) / .06;                                            // la flecha rosa delante de la cabeza mientras embiste
    gmDraw('cz_aura', Math.floor(a * 16), f.x + Math.cos(e.ang) * 20, f.y - 14 + Math.sin(e.ang) * 20, G4.cz, e.ang, A); }
  if(a > .12){ const u = (a - .12) / .4; if(u < 1) gmDraw('cz_golpe', g4F('cz_golpe', u), e.x, e.y - 6, G4.czHit, 0, u > .8 ? (1 - u) / .2 : 1); }
  if(a < .2 && typeof brGlow === 'function') brGlow(e.x, e.y - 6, 40, '255,150,230', .3);
});

// ---------------- ATAQUE ALA (golpe) ----------------
g4Swap(FXR.melee, 'Ataque Ala', ['aa_ala', 'aa_golpe'], (e, a) => {
  const fl = Math.cos(e.ang) < 0;                                                                      // hacia la izquierda: el ala se da la vuelta (sin quedar boca abajo)
  if(a < .3){ const u = a / .3, M = GM.meta.aa_ala;
    ctx.save(); ctx.translate(e.x - Math.cos(e.ang) * 18, e.y - 10); ctx.rotate(fl ? e.ang + Math.PI : e.ang); if(fl) ctx.scale(-1, 1);
    ctx.imageSmoothingEnabled = false; ctx.globalAlpha = u > .8 ? (1 - u) / .2 : 1;
    const i = g4F('aa_ala', u), s = G4.ala; ctx.drawImage(GM.img.aa_ala, i * M.fw, 0, M.fw, M.fh, -M.fw * s / 2, -M.fh * s / 2, M.fw * s, M.fh * s); ctx.restore(); }
  if(a > .14){ const u = (a - .14) / .45; if(u < 1) gmDraw('aa_golpe', g4F('aa_golpe', u), e.x, e.y - 8, G4.alaHit, 0, u > .85 ? (1 - u) / .15 : 1); }
});

// Duración de los impactos (para que se vea la animación entera)
[['Lanzarrocas', .6], ['Esfera Aural', .6], ['Onda Certera', .9], ['Rayo', .55], ['Hidrobomba', .8]].forEach(([n, d]) => { FXC[n] = Object.assign({}, FXC[n], {idur: Math.max(d, (FXC[n] && FXC[n].idur) || 0)}); });
