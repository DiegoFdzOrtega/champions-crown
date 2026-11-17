"use strict";
/* =====================================================================
   SPRITES DE ATAQUES HECHOS CON GEMINI (assets/fx/*.png, fondo ya quitado)
     hp_orb · hp_ola · hp_golpe ........ HIDROPULSO: bola de agua, ondas en media luna y el chapoteo al dar
     dr_met · dr_boom .................. COMETA DRACO: el meteoro que cae y su explosión
     pp_rocas .......................... PODER PASADO: las tres rocas con grietas doradas
     hr_cuerpo · hr_ini · hr_punta ..... HIPERRAYO: trozo del rayo que se repite, la boca y la punta
     (hr_carga está guardado por si se quiere usar para la carga)
   Los anillos, fogonazos y marcas del suelo siguen en código (js/fxbrendan.js, js/fxsuelo.js).
   Mientras una imagen no ha cargado (o si falta), se ve el dibujo de código de antes. GM.on = false vuelve a los de código.
   ===================================================================== */
const GM = {on: true, img: {}, meta: {
  hp_orb: {fw: 91, fh: 90, n: 4}, hp_ola: {fw: 101, fh: 136, n: 5}, hp_golpe: {fw: 171, fh: 132, n: 7},
  dr_met: {fw: 158, fh: 160, n: 4}, dr_boom: {fw: 164, fh: 165, n: 6}, pp_rocas: {fw: 301, fh: 307, n: 3},
  hr_ini: {fw: 256, fh: 130, n: 3}, hr_punta: {fw: 254, fh: 164, n: 4}, hr_carga: {fw: 126, fh: 120, n: 7}, hr_cuerpo: {fw: 512, fh: 126, n: 1}}};
Object.keys(GM.meta).forEach(k => { const im = new Image(); im.onload = () => { GM.meta[k].ok = true; }; im.src = `assets/fx/${k}.png?v=1`; GM.img[k] = im; });
const gmOk = (...ks) => GM.on && ks.every(k => GM.meta[k] && GM.meta[k].ok);
// Dibuja el cuadro i de una tira. (ax, ay) = qué punto del dibujo cae en (x, y), de 0 a 1
function gmDraw(k, i, x, y, sc, rot, A, ax, ay){
  const M = GM.meta[k], im = GM.img[k]; if(!M || !M.ok) return; i = ((i % M.n) + M.n) % M.n;
  ctx.save(); ctx.globalAlpha = A == null ? 1 : A; ctx.imageSmoothingEnabled = false; ctx.translate(x, y); if(rot) ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.drawImage(im, i * M.fw, 0, M.fw, M.fh, -M.fw * (ax == null ? .5 : ax), -M.fh * (ay == null ? .5 : ay), M.fw, M.fh); ctx.restore();
}

// ---------------- PODER PASADO: las rocas ----------------
{ const old = brBoulder; brBoulder = function(x, y, r, rot, A, glow){
    if(!gmOk('pp_rocas')) return old.apply(this, arguments);
    const i = r >= 16 ? 0 : r >= 12 ? 1 : 2, W = [278, 204, 166][i], sc = (r * 2.3) / W;      // cada roca a su tamaño
    brGlow(x, y, r * 1.9, '255,230,150', (glow ? .25 : .14) * (A == null ? 1 : A));
    gmDraw('pp_rocas', i, x, y, sc, rot * .35, A);
  }; }

// ---------------- HIDROPULSO ----------------
function gmHPFlight(s, a, an){
  const ca = Math.cos(an), sa = Math.sin(an), y0 = s.y - 6, fr = Math.floor(g.t * 12);
  for(let k = 3; k >= 1; k--){ const d = 18 + k * 26, sc = .44 + .04 * Math.sin(g.t * 12 + k); gmDraw('hp_ola', fr + k, s.x - ca * d, y0 - sa * d, sc, an, .95 - k * .18); }
  ctx.save(); for(let i = 0; i < 6; i++){ const u = (i / 6 + g.t * 3) % 1, o = (HH(i, 4) - .5) * 16; ctx.globalAlpha = 1 - u; ctx.fillStyle = '#ffffff'; ctx.fillRect(s.x - ca * (14 + u * 70) - sa * o - 1.5, y0 - sa * (14 + u * 70) + ca * o - 1.5, 3, 3); } ctx.restore();
  brGlow(s.x, y0, 26, '120,200,255', .4);
  gmDraw('hp_orb', Math.floor(g.t * 14), s.x, y0, .44, 0, 1);
}
function gmHPHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 4, u = a / .6; if(u >= 1) return;
  gmDraw('hp_golpe', Math.min(6, Math.floor(u * 7)), x, y, .62 * k, 0, 1);
  brRing(x, y + 16, (20 + 70 * brEase(u)) * k, .45, '#bfe6ff', 3, (1 - u) * .8);
}
{ const oF = FXR.flight['Hidropulso'], oI = FXR.impact['Hidropulso'];
  const wF = function(s, a, an){ if(gmOk('hp_orb', 'hp_ola')) return gmHPFlight(s, a, an); const b = oF && (oF.draw || oF); if(b) return b.apply(this, arguments); };
  const wI = function(e, a){ if(gmOk('hp_golpe')) return gmHPHit(e, a); const b = oI && (oI.draw || oI); if(b) return b.apply(this, arguments); };
  if(oF) Object.assign(wF, oF); if(oI) Object.assign(wI, oI); delete wF.draw; delete wI.draw; FXR.flight['Hidropulso'] = wF; FXR.impact['Hidropulso'] = wI; }

// ---------------- COMETA DRACO: meteoros y explosiones ----------------
{ const old = FXR.impact._dracoMet; FXR.impact._dracoMet = function(e, a){
    if(!gmOk('dr_met', 'dr_boom')) return old.apply(this, arguments);
    const k = e.last ? 1.35 : 1, x = e.m ? e.m.x : e.x, y = (e.m ? e.m.y : e.y) - 4, F = DR.fall;
    if(a < F){ const v = a / F, sx = x + 170 * (1 - v), sy = y - 330 * (1 - v);
      ctx.save(); ctx.globalAlpha = .25 + .5 * v; ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 22, 14 * k * v, 5 * k * v, 0, 0, 6.283); ctx.fill(); ctx.restore();   // sombra que crece
      gmDraw('dr_met', Math.floor(g.t * 14 + x), sx, sy, .62 * k, 0, 1, .27, .76); return; }
    const b = (a - F) / .55; if(b >= 1) return;
    if(b < .25) brGlow(x, y, 70 * k, '255,248,215', (1 - b / .25) * .8);
    brRing(x, y + 22, (14 + 60 * brEase(b)) * k, .42, '#ffffff', 2.5, (1 - b) * .8);
    gmDraw('dr_boom', Math.min(5, Math.floor(b * 6)), x, y - 8, .7 * k, 0, b > .8 ? (1 - b) / .2 : 1, .5, .55);
  }; }

// ---------------- HIPERRAYO: trozo que se repite + boca + punta ----------------
{ const old = brHRBeam; brHRBeam = function(e){
    if(!gmOk('hr_cuerpo', 'hr_ini', 'hr_punta')) return old.apply(this, arguments);
    const G = sg(e, 900); if(G.len < 8) return;
    const t = e.t || 0, A = G.al, gw = brClamp(t / .1), sc = .5, sy = sc * gw, B = GM.meta.hr_cuerpo, tw = B.fw * sc, L = G.len, im = GM.img.hr_cuerpo;
    ctx.save(); ctx.globalAlpha = A; ctx.imageSmoothingEnabled = false; ctx.translate(G.x0, G.y0); ctx.rotate(G.an);
    ctx.save(); ctx.beginPath(); ctx.rect(0, -B.fh * sc, L, B.fh * sc * 2); ctx.clip();                  // el rayo: el trozo repetido, que corre hacia delante
    const off = (g.t * 700) % tw;
    for(let x = -tw + off; x < L; x += tw) ctx.drawImage(im, 0, 0, B.fw, B.fh, x, -B.fh * sy / 2, tw + 1, B.fh * sy);
    ctx.restore(); ctx.restore();
    const fr = Math.floor(g.t * 14);
    gmDraw('hr_ini', fr, G.x0, G.y0, sc * (.7 + .3 * gw), G.an, A, .16, .5);                          // la boca, pegada al Pokémon
    gmDraw('hr_punta', fr, G.x1, G.y1, sc * 1.05 * (.7 + .3 * gw), G.an, A, .56, .5);                  // la bola gorda donde golpea
  }; }
