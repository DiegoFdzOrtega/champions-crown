"use strict";
/* =====================================================================
   FRANJAS DE TERRENO DE AGUA Y ELÉCTRICO con sprites de Gemini (como ya están la hierba de js/fxplanta.js y las brasas).
     te_agua (8 cuadros: charco A 0-3 y charco B 4-7, con ondas que se mueven) · te_onda (gota que cae y onda que se abre)
     te_elec (8 cuadros: suelo quemado A 0-3 y B 4-7, con grietas amarillas que parpadean)
   AGUA: un canal de agua RECTO (borde oscuro, orilla clara con espuma que se mueve, ondas que corren y brillos); cuando un Pokémon lo pisa
   o le pasa un disparo por encima, salpica y se abre una onda (te_onda). ELÉCTRICO: tierra quemada con las grietas de Gemini dentro de la línea,
   brillo amarillo que late, rayos en zigzag que la recorren y chispazos. HIELO: cristales de Gemini que crecen a lo largo de la franja (sobre escarcha suave) y destellos. Si el terreno te hace daño a ti, se marca su borde con rayas blancas, como siempre.
   El efecto en el combate es el mismo. TE5.on = false vuelve al dibujo de antes. Medidas en TE5 [AJUSTE].
   ===================================================================== */
const TE5 = {on: true, aguaRecta: false,   // aguaRecta: true = el agua como un canal recto (con ondas al pisarla) en vez de charcos
             agua: 1, elec: 1, paso: 62, fps: 5};          // encendido · tamaño de los charcos y de las manchas · separación entre manchas · velocidad de la animación
Object.assign(GM.meta, {te_agua: {fw: 234, fh: 129, n: 8}, te_onda: {fw: 136, fh: 69, n: 3}, te_elec: {fw: 254, fh: 157, n: 8}});
['te_agua', 'te_onda', 'te_elec'].forEach(k => { const im = new Image(); im.onload = () => { GM.meta[k].ok = true; }; im.src = `assets/fx/${k}.png?v=1`; GM.img[k] = im; });
const TE5_K = {agua: 'te_agua', electrico: 'te_elec', hielo: 'te_hielo'};

function te5Charcos(q){                                                            // AGUA: los charcos de Gemini en fila (el que le gusta a Diego)
  const k = TE5_K[q.type], M = GM.meta[k], dx = q.x1 - q.x0, dy = q.y1 - q.y0, len = Math.hypot(dx, dy); if(len < 6) return;
  const a = clamp(Math.min(q.t / .25, (q.T - q.t) / .8), 0, 1); if(a <= 0) return;
  const ux = dx / len, uy = dy / len, seed = q.teSeed || (q.teSeed = Math.random() * 100), grow = Math.min(1, q.t / .3);
  const n = Math.max(2, Math.round(len / TE5.paso) + 1), sc = q.w * 2.3 / M.fh * (q.type === 'agua' ? TE5.agua : TE5.elec), L = [];
  for(let i = 0; i < n; i++){                                                         // dónde va cada mancha (siempre en el mismo sitio)
    const u = n === 1 ? .5 : i / (n - 1), side = (HH(i, seed) - .5) * q.w * .7;
    L.push({x: q.x0 + ux * u * len - uy * side, y: q.y0 + uy * u * len + ux * side * .7, v: HH(i, seed + 1) < .5 ? 0 : 4, fl: HH(i, seed + 2) < .5,
            s: sc * (.85 + HH(i, seed + 3) * .35), ph: Math.floor(HH(i, seed + 4) * 4)});
  }
  L.sort((p, r) => p.y - r.y);
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = a;
  const fr = Math.floor(g.t * TE5.fps);
  for(const p of L){
    const c4 = (fr + p.ph) % 6, i = p.v + (c4 < 4 ? c4 : 6 - c4), s = p.s * (.6 + .4 * grow);         // 0 1 2 3 2 1: va y vuelve
    ctx.save(); ctx.translate(p.x, p.y); if(p.fl) ctx.scale(-1, 1);
    ctx.drawImage(GM.img[k], i * M.fw, 0, M.fw, M.fh, -M.fw * s / 2, -M.fh * s / 2, M.fw * s, M.fh * s); ctx.restore();
  }
  for(let j = 0; j < Math.max(2, n); j++){                                            // detalles: gotas que caen (agua) o chispazos (eléctrico)
    const ph = (g.t * (.7 + HH(j, seed + 7) * .5) + HH(j, seed + 8)) % 1, cyc = Math.floor(g.t * (.7 + HH(j, seed + 7) * .5) + HH(j, seed + 8));
    const u = HH(j * 13 + cyc, seed + 9), o = (HH(j * 7 + cyc, seed + 10) - .5) * q.w * 1.2, x = q.x0 + ux * u * len - uy * o, y = q.y0 + uy * u * len + ux * o * .7;
    if(q.type === 'agua'){ if(!gmOk('te_onda')) continue; const Mo = GM.meta.te_onda, f = Math.min(2, Math.floor(ph * 3)), so = .45 * sc / .45;
      ctx.globalAlpha = a * (1 - ph * .7); ctx.drawImage(GM.img.te_onda, f * Mo.fw, 0, Mo.fw, Mo.fh, x - Mo.fw * so * .25, y - Mo.fh * so * .25, Mo.fw * so * .5, Mo.fh * so * .5); }
    else if(ph < .25){                                                                // chispazo amarillo que salta
      ctx.globalAlpha = a * (1 - ph / .25); ctx.strokeStyle = ph < .1 ? '#ffffff' : '#ffe94a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath();
      let px = x - 12, py = y; ctx.moveTo(px, py); for(let s2 = 0; s2 < 4; s2++){ px += 6; py = y - 6 - HH(s2 + j, seed + cyc) * 14; ctx.lineTo(px, py); } ctx.stroke(); }
  }
  ctx.restore();
  if(!TERR[q.type].heal && q.mine === (g.me === 'e')){                              // te hace daño a ti: borde con rayas blancas (como siempre)
    ctx.save(); ctx.translate(q.x0, q.y0); ctx.rotate(Math.atan2(dy, dx)); terrCap(len, q.w); ctx.globalAlpha = .75 * a; ctx.lineWidth = 3; ctx.strokeStyle = '#ffffff'; ctx.setLineDash([11, 8]); ctx.stroke(); ctx.restore();
  }
}
// Cada franja es una línea recta (la forma de siempre, terrCap) con su dibujo dentro
function te5Franja(q){
  if(q.type === 'agua' && !TE5.aguaRecta) return te5Charcos(q);
  const dx = q.x1 - q.x0, dy = q.y1 - q.y0, len = Math.hypot(dx, dy); if(len < 6) return;
  const a = clamp(Math.min(q.t / .25, (q.T - q.t) / .8), 0, 1); if(a <= 0) return;
  q._ang = Math.atan2(q.y1 - q.y0, q.x1 - q.x0); const w = q.w * Math.min(1, .3 + q.t / .3 * .7), seed = q.teSeed || (q.teSeed = Math.random() * 100), t = g.t, ang = Math.atan2(dy, dx);
  ctx.save(); ctx.translate(q.x0, q.y0); ctx.rotate(ang); ctx.globalAlpha = a;
  if(q.type === 'agua') te5Agua(q, len, w, seed, t); else if(q.type === 'hielo') te5Hielo(q, len, w, seed, t); else te5Elec(q, len, w, seed, t);
  if(!TERR[q.type].heal && q.mine === (g.me === 'e')){ terrCap(len, w); ctx.globalAlpha = .75 * a; ctx.lineWidth = 3; ctx.strokeStyle = '#ffffff'; ctx.setLineDash([11, 8]); ctx.stroke(); ctx.setLineDash([]); }
  ctx.restore();
  if(q.type === 'agua') te5Pisadas(q, a);
}
// ---- AGUA: un canal de agua recto (borde oscuro, orilla clara con espuma, ondas que corren y brillos) ----
function te5Agua(q, len, w, seed, t){
  terrCap(len, w + 3); ctx.fillStyle = '#2d5a8c'; ctx.fill();                       // borde oscuro
  terrCap(len, w); ctx.fillStyle = '#a9dcff'; ctx.fill();                           // orilla clara
  terrCap(len, w - 4); ctx.fillStyle = '#5b9bd8'; ctx.fill();                       // el agua
  ctx.save(); terrCap(len, w - 4); ctx.clip();
  ctx.fillStyle = '#4a86c4'; for(let i = 0; i < len / 30 + 2; i++){ const x = ((i * 30 + t * 18) % (len + 60)) - 30; ctx.fillRect(x, -w * .1 + Math.sin(i + seed) * w * .3, 16, 3); }   // zonas más hondas que corren
  ctx.strokeStyle = '#d6efff'; ctx.lineWidth = 2;                                   // ondas (arcos) que corren a lo largo del canal
  for(let i = 0; i < len / 26 + 2; i++){ const x = ((i * 26 + t * 30) % (len + 52)) - 26, y = (HH(i, seed) - .5) * w * 1.1, r = 6 + HH(i, seed + 1) * 8;
    ctx.globalAlpha *= 1; ctx.beginPath(); ctx.ellipse(x, y, r, r * .35, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  ctx.fillStyle = '#ffffff'; for(let i = 0; i < len / 40 + 1; i++){ const tw = (t * 1.3 + HH(i, seed + 2)) % 1; if(tw > .35) continue;   // brillos que parpadean
    const x = HH(i, seed + 3) * len, y = (HH(i, seed + 4) - .5) * w * 1.2, s = tw < .17 ? 2 : 1; ctx.fillRect(x - s, y - s * 3, s * 2, s * 6); ctx.fillRect(x - s * 3, y - s, s * 6, s * 2); }
  ctx.restore();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.globalAlpha *= .8; terrCap(len, w - 1); ctx.setLineDash([6, 10]); ctx.lineDashOffset = -t * 20; ctx.stroke(); ctx.setLineDash([]);   // espuma de la orilla que se mueve
}
// Cuando un Pokémon pisa el agua o le cae un disparo encima: salpica y se abre una onda (te_onda de Gemini)
const TE5P = [];
function te5Pisadas(q, a){
  const dx = q.x1 - q.x0, dy = q.y1 - q.y0, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
  const dentro = (x, y) => { const u = (x - q.x0) * ux + (y - q.y0) * uy, v = -(x - q.x0) * uy + (y - q.y0) * ux; return u > -q.w && u < len + q.w && Math.abs(v) < q.w; };
  q.teP = q.teP || {};
  [...g.p, ...g.e].forEach((f, i) => { if(!f || f.dead || f.ghost || f.jump) return; const I = idleInfo(f.m.dex), fy = f.y + I.foot * ESCALA - 4;
    if(!dentro(f.x, fy)) return; const k = 'f' + i, mv = f.mv || f.dash > 0; q.teP[k] = (q.teP[k] || 0) - (g.t - (q.teLt || g.t));
    if(q.teP[k] <= 0){ q.teP[k] = mv ? .22 : .9; TE5P.push({x: f.x, y: fy, t0: g.t, s: mv ? 1 : .7}); } });
  (g.shots || []).forEach(s => { if(!s.teW && dentro(s.x, s.y + 20)){ s.teW = 1; TE5P.push({x: s.x, y: s.y + 20, t0: g.t, s: 1.2}); } });
  q.teLt = g.t;
}
function te5Ondas(){
  if(!gmOk('te_onda')) { TE5P.length = 0; return; } const M = GM.meta.te_onda;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  for(let i = TE5P.length - 1; i >= 0; i--){ const o = TE5P[i], u = (g.t - o.t0) / .5; if(u >= 1 || u < 0){ TE5P.splice(i, 1); continue; }
    const f = Math.min(M.n - 1, Math.floor(u * M.n)), s = .55 * o.s * (1 + u * .6); ctx.globalAlpha = 1 - u * .6;
    ctx.drawImage(GM.img.te_onda, f * M.fw, 0, M.fw, M.fh, o.x - M.fw * s / 2, o.y - M.fh * s / 2, M.fw * s, M.fh * s); }
  ctx.restore();
}
// ---- ELÉCTRICO: la tira de Gemini (te_elec2, tierra quemada con rayos que cambian) estirada a lo largo de la franja, con descargas (te_rayo) que saltan ----
//      Si las imágenes no han cargado: tierra quemada + rayos dibujados (te5ElecCodigo).
Object.assign(GM.meta, {te_elec2: {fw: 252, fh: 80, n: 4, b0: 28, b1: 78}, te_rayo: {fw: 191, fh: 94, n: 4}});
['te_elec2', 'te_rayo'].forEach(k => { const im = new Image(); im.onload = () => { GM.meta[k].ok = true; }; im.src = `assets/fx/${k}.png?v=1`; GM.img[k] = im; });
function te5Elec(q, len, w, seed, t){                                                           // ELÉCTRICO: solo rayos en el suelo (sin la tierra), como pidió Diego
  ctx.save(); const A0 = ctx.globalAlpha, pul = .5 + .5 * Math.sin(t * 22) * Math.sin(t * 7.3), fr = Math.floor(t * 14);   // (sin 'lighter': sobre la hierba verde el amarillo se volvía lima)
  terrCap(len, w); ctx.globalAlpha = A0 * (.08 + .1 * pul); ctx.fillStyle = '#ffe94a'; ctx.fill();               // brillo muy suave en el suelo
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for(let b = 0; b < 4; b++){                                                                      // rayos en zigzag a ras de suelo, con ramitas (cambian de forma muy rápido)
    const y0 = (b - 1.5) * w * .38, n = Math.max(4, Math.floor(len / 20)), P = [[-w * .5, y0]];
    for(let i = 1; i <= n; i++) P.push([-w * .5 + (len + w) * i / n, y0 + (HH(i * 3 + b, fr + seed) - .5) * w * .8]);
    const on = HH(b, fr) < .8; if(!on) continue;
    ctx.beginPath(); P.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.globalAlpha = A0 * .5; ctx.strokeStyle = '#ffb800'; ctx.lineWidth = 7; ctx.stroke();
    ctx.globalAlpha = A0; ctx.strokeStyle = '#fff7b0'; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.stroke();
    for(let i = 2; i < P.length - 1; i += 3){ const [x, y] = P[i], d = HH(i + b, fr + seed + 5) < .5 ? -1 : 1;   // ramitas
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6, y + d * 7); ctx.lineTo(x + 3, y + d * 13); ctx.globalAlpha = A0 * .8; ctx.strokeStyle = '#fff7b0'; ctx.lineWidth = 2; ctx.stroke(); }
  }
  for(let i = 0; i < len / 40 + 1; i++){ const ph = (t * 2.2 + HH(i, seed + 5)) % 1; if(ph > .3) continue;          // chispazos que saltan
    const x = HH(i + Math.floor(t * 2.2 + HH(i, seed + 5)) * 17, seed + 6) * len, y = (HH(i, seed + 7) - .5) * w;
    ctx.globalAlpha = A0 * (1 - ph / .3); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y);
    for(let k = 1; k <= 4; k++) ctx.lineTo(x + (HH(k, i + fr) - .5) * 16, y - k * 7); ctx.stroke(); }
  ctx.restore();
  if(gmOk('te_rayo')){ const R = GM.meta.te_rayo, n = Math.max(2, Math.round(len / 90)), s = (2 * w) / 50;   // descargas de Gemini que saltan del suelo
    for(let i = 0; i < n; i++){ const sp = .9 + HH(i, seed + 20) * .8, cyc = t * sp + HH(i, seed + 21), ph = cyc % 1; if(ph > .4) continue;
      const u = HH(i * 31 + Math.floor(cyc), seed + 22), x = -w * .3 + u * (len + w * .6), f = Math.min(R.n - 1, Math.floor(ph / .4 * R.n)), rs = s * .9;
      ctx.drawImage(GM.img.te_rayo, f * R.fw, 0, R.fw, R.fh, x - R.fw * rs / 2, -R.fh * rs + w * .3, R.fw * rs, R.fh * rs); } }
}
function te5ElecCodigo(q, len, w, seed, t){
  terrCap(len, w + 2); ctx.fillStyle = '#1a140c'; ctx.fill();
  ctx.save(); terrCap(len, w); ctx.clip();
  ctx.fillStyle = '#3a2c1c'; ctx.fillRect(-w, -w, len + 2 * w, 2 * w);
  if(gmOk('te_elec')){ const M = GM.meta.te_elec, s = (w * 2.6) / M.fh, step = M.fw * s * .55, fr = Math.floor(t * 8);       // grietas de Gemini (parpadean rápido)
    ctx.imageSmoothingEnabled = false;
    for(let x = -w, i = 0; x < len + w; x += step, i++){ const v = HH(i, seed) < .5 ? 0 : 4, k = v + ((fr + i) % 4);
      ctx.save(); ctx.translate(x, (HH(i, seed + 1) - .5) * w * .3); if(HH(i, seed + 2) < .5) ctx.scale(-1, 1);
      ctx.drawImage(GM.img.te_elec, k * M.fw, 0, M.fw, M.fh, -M.fw * s / 2, -M.fh * s / 2, M.fw * s, M.fh * s); ctx.restore(); } }
  ctx.globalCompositeOperation = 'lighter';
  const pul = .5 + .5 * Math.sin(t * 22) * Math.sin(t * 7.3);                       // brillo amarillo que late (como corriente)
  ctx.globalAlpha *= 1; const A0 = ctx.globalAlpha; ctx.globalAlpha = A0 * (.25 + .35 * pul); ctx.fillStyle = '#ffd52a'; ctx.fillRect(-w, -w, len + 2 * w, 2 * w);
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const fr = Math.floor(t * 14);
  for(let b = 0; b < 3; b++){                                                        // rayos en zigzag a lo largo de la franja (cambian de forma muy rápido)
    const y0 = (b - 1) * w * .45, n = Math.max(4, Math.floor(len / 22)); ctx.beginPath(); ctx.moveTo(-w * .6, y0);
    for(let i = 1; i <= n; i++) ctx.lineTo(-w * .6 + (len + w * 1.2) * i / n, y0 + (HH(i * 3 + b, fr + seed) - .5) * w * .9);
    ctx.globalAlpha = A0 * .5; ctx.strokeStyle = '#ffe94a'; ctx.lineWidth = 6; ctx.stroke();
    ctx.globalAlpha = A0 * (HH(b, fr) < .7 ? 1 : .3); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke(); }
  for(let i = 0; i < len / 50 + 1; i++){ const ph = (t * 2.2 + HH(i, seed + 5)) % 1; if(ph > .3) continue;     // chispazos que saltan hacia arriba
    const x = HH(i + Math.floor(t * 2.2 + HH(i, seed + 5)) * 17, seed + 6) * len, y = (HH(i, seed + 7) - .5) * w;
    ctx.globalAlpha = A0 * (1 - ph / .3); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y);
    for(let k = 1; k <= 4; k++) ctx.lineTo(x + (HH(k, i + fr) - .5) * 16, y - k * 7); ctx.stroke(); }
  ctx.strokeStyle = '#ffe94a'; ctx.lineWidth = 2; ctx.globalAlpha = A0 * (.5 + .5 * pul); terrCap(len, w); ctx.stroke();      // borde que brilla
  ctx.restore();
}
// ---- HIELO: la placa de hielo de Gemini (te_hielo, 2 cuadros con el brillo movido) estirada a lo largo de la franja, cristales que salen
//      del suelo (te_cristal) y destellos ----
Object.assign(GM.meta, {te_hielo: {fw: 505, fh: 162, n: 2, b0: 23, b1: 137}, te_cristal: {fw: 161, fh: 171, n: 4}});
['te_hielo', 'te_cristal'].forEach(k => { const im = new Image(); im.onload = () => { GM.meta[k].ok = true; }; im.src = `assets/fx/${k}.png?v=1`; GM.img[k] = im; });
function te5Hielo(q, len, w, seed, t){                                                          // la franja de hielo: CRISTALES (como pidió Diego) sobre una escarcha suave
  ctx.save(); terrCap(len, w); ctx.globalAlpha *= .28; ctx.fillStyle = '#d8f6ff'; ctx.fill(); ctx.globalAlpha /= .28;
  ctx.globalAlpha *= .5; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.setLineDash([4, 6]); ctx.stroke(); ctx.restore();
  if(!gmOk('te_cristal')) return;
  const C = GM.meta.te_cristal, ang = q._ang || 0, n = Math.max(3, Math.round(len / 34) + 1), grow = Math.min(1, q.t / .45), shrink = Math.min(1, (q.T - q.t) / .6), L = [];
  for(let i = 0; i < n; i++){ const u = n === 1 ? .5 : i / (n - 1), y = (HH(i, seed + 33) - .5) * w * 1.1, big = 1 - Math.abs(y) / w * .6;
    L.push({x: u * len, y, sc: (.32 + HH(i, seed + 34) * .2) * big * (w / 26), d: HH(i, seed + 35) * .3, fl: HH(i, seed + 36) < .5}); }
  L.sort((a, b) => (a.y * Math.cos(ang) + a.x * Math.sin(ang)) - (b.y * Math.cos(ang) + b.x * Math.sin(ang)));   // los de atrás primero
  ctx.imageSmoothingEnabled = false;
  for(const c of L){ const k = Math.max(0, Math.min(grow * 1.3 - c.d, shrink)); if(k <= 0) continue; const f = Math.min(3, Math.floor(k * 4));
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(-ang); if(c.fl) ctx.scale(-1, 1);              // de pie aunque la franja vaya torcida
    ctx.drawImage(GM.img.te_cristal, f * C.fw, 0, C.fw, C.fh, -C.fw * c.sc / 2, -C.fh * c.sc * .92, C.fw * c.sc, C.fh * c.sc); ctx.restore(); }
  ctx.fillStyle = '#ffffff';                                                                      // destellos de 4 puntas sobre los cristales
  for(let i = 0; i < Math.max(2, len / 45); i++){ const ph = (t * .9 + HH(i, seed + 40)) % 1; if(ph > .3) continue;
    const c = Math.floor(t * .9 + HH(i, seed + 40)), x = HH(i + c * 13, seed + 41) * len, y = (HH(i + c * 7, seed + 42) - .5) * w - 14, r = 2 + 7 * Math.sin(ph / .3 * Math.PI);
    ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * .22, y - r * .22); ctx.lineTo(x + r, y); ctx.lineTo(x + r * .22, y + r * .22); ctx.lineTo(x, y + r);
    ctx.lineTo(x - r * .22, y + r * .22); ctx.lineTo(x - r, y); ctx.lineTo(x - r * .22, y - r * .22); ctx.closePath(); ctx.fill(); }
}
if(typeof terrDraw === 'function'){ const o = terrDraw; terrDraw = function(){
    const mine = q => TE5.on && TE5_K[q.type] && (q.type !== 'hielo' || gmOk('te_cristal'));
    if(!g || !g.terr || !g.terr.some(mine)) return o.apply(this, arguments);
    const all = g.terr; g.terr = all.filter(q => !mine(q));
    try{ o.apply(this, arguments); } finally { g.terr = all; }
    ctx.save(); terrClip(); try{ all.forEach(q => { if(mine(q)) te5Franja(q); }); if(TE5.aguaRecta) te5Ondas(); }catch(e){} ctx.restore();
  }; }
