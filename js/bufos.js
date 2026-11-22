"use strict";
/* =====================================================================
   MEJORAS (hueco Q) CON HOJAS DE GEMINI, como la Danza Espada (22-11-2026)
   Cada hoja (assets/fx/bf_<clave>.png) tiene 5 filas de 6 cuadros: 0 estallido · 1 aura · 2 anillo en el suelo · 3 símbolo · 4 partículas.
   Las filas se recortan con tools/bufos_recorte.py: BF_META = [y, ancho, alto, nº de cuadros] de cada fila (6 u 8). Si falta una hoja, ese ataque sigue con el dibujo de antes.
   Además: FRANJA DE VENENO nueva (charcos de lodo en vez de la banda gris).
   ===================================================================== */
const BF_META = {"misty":[[0,88,71,6],[71,170,101,6],[172,94,35,6],[207,32,27,6],[234,36,91,6]],"curse":[[0,143,89,6],[89,170,97,6],[186,129,82,6],[268,32,37,6],[305,20,93,6]],"quiver":[[0,144,124,6],[124,122,144,6],[268,137,89,6],[357,51,41,6],[398,37,170,6]],"wind":[[0,161,117,6],[117,110,121,6],[238,170,78,6],[316,56,57,6],[373,55,118,6]],"sand":[[0,127,128,6],[128,88,131,6],[259,116,52,6],[311,47,39,6],[350,32,170,6]],"acid":[[0,142,84,6],[84,170,137,6],[221,130,68,6],[289,49,43,6],[332,33,116,6]],"mist":[[0,170,130,6],[130,137,143,6],[273,158,65,6],[338,73,59,6],[397,44,134,6]],"hone":[[0,170,123,6],[123,169,143,6],[266,128,64,6],[330,60,50,6],[380,52,153,6]],"growth":[[0,150,123,6],[123,123,145,6],[268,170,72,6],[340,61,59,6],[399,60,132,6]],"agility":[[0,170,118,6],[118,87,130,6],[248,166,57,6],[305,53,42,6],[347,52,124,6]],"amnesia":[[0,167,122,6],[122,158,138,6],[260,170,80,6],[340,86,76,6],[416,40,132,6]],"rain":[[0,129,64,6],[64,170,103,6],[167,128,44,6],[211,39,38,6],[249,21,86,6]],"calm":[[0,158,121,8],[121,122,153,8],[274,170,77,8],[351,69,75,8],[426,49,149,8]],"dragon":[[0,127,110,6],[110,170,117,6],[227,144,46,6],[273,60,46,6],[319,29,98,6]],"iron":[[0,154,86,6],[86,170,92,6],[178,132,51,6],[229,31,34,6],[263,24,93,6]],"charge":[[0,160,115,6],[115,80,132,6],[247,170,56,6],[303,41,31,6],[334,42,123,6]],"bulk":[[0,140,117,6],[117,109,134,6],[251,170,68,6],[319,83,75,6],[394,59,142,6]],"scheme":[[0,158,108,6],[108,94,170,6],[278,162,52,6],[330,61,53,6],[383,40,117,6]],"sun":[[0,76,77,6],[77,61,135,6],[212,66,32,6],[244,35,37,6],[281,31,170,6]],"shell":[[0,129,104,6],[104,143,121,6],[225,170,67,6],[292,44,66,6],[358,55,135,6]]};
// (22-11) Carga, Agilidad, Día Soleado, Danza Lluvia y Campo Neblinoso: hojas rehechas (aura fina y hueca, sin rectángulos).
// Los CLIMAS (Día Soleado, Danza Lluvia, Tormenta de Arena) NO se tocan: Diego los quiere como estaban (22-11).
// Qué ataque usa cada hoja (las que aún no tienen hoja siguen con el dibujo de antes: js/fxextra.js)
const BF_MOVES = {'Carga':'charge', 'Paz Mental':'calm', 'Corpulencia':'bulk', 'Maquinación':'scheme', 'Refugio':'shell',
  'Desarrollo':'growth', 'Amnesia':'amnesia', 'Defensa Férrea':'iron', 'Agilidad':'agility', 'Danza Dragón':'dragon', 'Afilar':'hone',
  'Neblina':'mist', 'Armadura Ácida':'acid', 'Viento Afín':'wind', 'Danza Aleteo':'quiver', 'Maldición':'curse', 'Campo Neblinoso':'misty'};
const BF = {on: true, dur: 1.5, fps: 10, aura: 1.35, auraA: .45, anillo: 2.1, simbolo: 24};   // [AJUSTE] encendido · segundos de la animación · cuadros por segundo · alto del aura (× el Pokémon) · ancho del anillo (× el Pokémon) · tamaño del símbolo
for(const k in BF_META){ const id = 'bf_' + k; GM.meta[id] = {rows: BF_META[k]}; const im = new Image(); im.onload = () => { GM.meta[id].ok = true; }; im.src = `assets/fx/${id}.png?v=4`; GM.img[id] = im; }
const bfKey = n => BF.on && BF_MOVES[n] && BF_META[BF_MOVES[n]] && gmOk('bf_' + BF_MOVES[n]) ? 'bf_' + BF_MOVES[n] : null;
// Dibuja el cuadro fr de la fila r centrado en (x, y), con alto h (o ancho w si se da)
function bfCell(id, r, fr, x, y, h, w, A){
  const R = GM.meta[id].rows[r]; if(!R || A <= 0) return; const [y0, cw, ch, nf = 6] = R; fr = ((fr % nf) + nf) % nf;
  const H = w ? w * ch / cw : h, W = w || h * cw / ch;
  ctx.globalAlpha = A; ctx.drawImage(GM.img[id], fr * cw, y0, cw, ch, x - W / 2, y - H / 2, W, H);
}
const bfEnv = (a, d, i, o) => c01(a / i) * c01((d - a) / o);              // entra en i segundos y se va en los últimos o
// ANIMACIÓN AL USARLO (como la Danza Espada): anillo en el suelo + aura alrededor + estallido + símbolo que sube + partículas
FXR.impact._bf = (e, a) => {
  const f = e.fol, id = e.id; if(!f || !gmOk(id)) return; const d = e.dur; if(a >= d) return;
  const b = bodyOf(f), H = Math.max(30, b.foot - b.top), cy = (b.top + b.foot) / 2, fr = Math.floor(a * BF.fps), W = Math.max(56, b.hw * 2 * BF.anillo);
  ctx.save(); ctx.imageSmoothingEnabled = true;
  bfCell(id, 2, fr, f.x, b.foot - 2, 0, W, bfEnv(a, d, .15, .35) * .95);                                   // anillo
  bfCell(id, 1, fr, f.x, cy - H * .08, H * BF.aura, 0, bfEnv(a, d, .2, .4) * BF.auraA);                           // aura
  if(a < .6) bfCell(id, 0, Math.floor(a / .6 * (GM.meta[id].rows[0][3] || 6)), f.x, cy, H * 1.35, 0, 1);                              // estallido
  if(a > .35){ const u = (a - .35) / (d - .35); bfCell(id, 3, fr, f.x, b.top - 10 - u * 18, BF.simbolo, 0, c01(u / .2) * c01((1 - u) / .25)); }   // símbolo
  if(a > .5) bfCell(id, 4, fr, f.x, b.foot - H * .6, H * 1.25, 0, bfEnv(a - .5, d - .5, .2, .4) * .9);    // partículas
  ctx.restore();
};
if(typeof fxBuff === 'function'){ const o = fxBuff; fxBuff = function(f, name){
  const id = f && bfKey(name); if(id){ try{ fxAdd('impact', '_bf', {x: f.x, y: f.y, fol: f, id, dur: BF.dur}); }catch(e){} }
  return o.apply(this, arguments); }; }
// Mientras dura la mejora (5 s): el anillo en el suelo y partículas suaves (en vez del dibujo de antes)
for(const n in BF_MOVES){
  const oB = FXR.buff[n], oA = FXR.aura[n];
  FXR.buff[n] = Object.assign((e, a, ...r) => { if(bfKey(n)) return; if(oB) return oB(e, a, ...r); }, oB || {});
  FXR.aura[n] = (f, I, t, type, k) => {
    const id = bfKey(n); if(!id) return oA ? oA(f, I, t, type, k) : FXR.aura._(f, I, t, type, k);
    const b = bodyOf(f), H = Math.max(30, b.foot - b.top), fr = Math.floor(t * BF.fps * .8), W = Math.max(50, b.hw * 2 * BF.anillo * .85);
    ctx.save(); bfCell(id, 2, fr, f.x, b.foot - 2, 0, W, .35 + .35 * k); bfCell(id, 4, fr, f.x, b.foot - H * .55, H * 1.1, 0, .25 + .35 * k); ctx.restore();
  };
}

/* ---------------- FRANJA DE VENENO ----------------
   Antes: una banda gris recta con burbujas (se veía como un rectángulo). Ahora, como el agua y el fuego: charcos de lodo tóxico morado
   sueltos a lo largo de la franja, con borde irregular, brillo, burbujas que crecen y explotan y humito morado que sube. El efecto en el combate es el mismo. */
const VN = {on: true, paso: 30, burb: 3};
GM.meta.te_veneno = {rows: [[0,143,88,4],[88,150,94,4],[182,76,72,4]]}; { const im = new Image(); im.onload = () => { GM.meta.te_veneno.ok = true; }; im.src = 'assets/fx/te_veneno.png?v=2'; GM.img.te_veneno = im; }   // [AJUSTE] encendido · separación entre charcos · burbujas por charco
function vnBlob(cx, cy, rx, ry, seed, grow, wob){                                   // contorno irregular (siempre el mismo para cada charco)
  ctx.beginPath(); const n = 14;
  for(let i = 0; i <= n; i++){ const th = i / n * 6.283, k = (.78 + .3 * HH(i % n, seed) + .04 * Math.sin(wob + i)) * grow;
    const x = cx + Math.cos(th) * rx * k, y = cy + Math.sin(th) * ry * k; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.closePath();
}
function vnFranja(q){
  const dx = q.x1 - q.x0, dy = q.y1 - q.y0, len = Math.hypot(dx, dy); if(len < 6) return;
  const a = clamp(Math.min(q.t / .25, (q.T - q.t) / .8), 0, 1); if(a <= 0) return;
  const ux = dx / len, uy = dy / len, seed = q.vnSeed || (q.vnSeed = Math.random() * 100), grow = Math.min(1, q.t / .35), t = g.t;
  const n = Math.max(2, Math.round(len / VN.paso) + 1), P = [];
  for(let i = 0; i < n; i++){ const u = n === 1 ? .5 : i / (n - 1), side = (HH(i, seed) - .5) * q.w * .8, r = q.w * (.95 + HH(i, seed + 1) * .6);
    P.push({x: q.x0 + ux * u * len - uy * side, y: q.y0 + uy * u * len + ux * side * .7, rx: r, ry: r * (.5 + HH(i, seed + 2) * .12), s: seed + i * 7.3, i}); }
  P.sort((p, r) => p.y - r.y);
  ctx.save(); ctx.globalAlpha = a;
  if(gmOk('te_veneno')){                                                                                                                 // charcos de Gemini (2 tipos de 4 cuadros, burbujeando)
    const R = GM.meta.te_veneno.rows, fr = Math.floor(t * 5); ctx.imageSmoothingEnabled = true;
    for(const p of P){ const [y0, cw, ch] = R[p.i % 2], k = (fr + p.i) % 4, w = p.rx * 2.6 * grow, h = w * ch / cw;
      ctx.drawImage(GM.img.te_veneno, k * cw, y0, cw, ch, p.x - w / 2, p.y - h * .55, w, h); }
  } else {
  for(const p of P){ vnBlob(p.x, p.y + 2, p.rx * 1.08, p.ry * 1.12, p.s, grow, t * 1.5); ctx.fillStyle = '#2a0b3d'; ctx.fill(); }     // borde oscuro
  for(const p of P){ vnBlob(p.x, p.y, p.rx, p.ry, p.s, grow, t * 1.5); ctx.fillStyle = '#6a2391'; ctx.fill(); }                       // el lodo
  for(const p of P){ vnBlob(p.x - p.rx * .05, p.y - p.ry * .12, p.rx * .78, p.ry * .7, p.s + 3, grow, t * 1.5); ctx.fillStyle = '#8c35b5'; ctx.fill(); }   // centro más claro
  ctx.fillStyle = '#d88cf2';                                                                                                            // brillos
  for(const p of P){ ctx.globalAlpha = a * (.55 + .25 * Math.sin(t * 2 + p.s)); ctx.beginPath(); ctx.ellipse(p.x - p.rx * .35, p.y - p.ry * .35, p.rx * .22 * grow, p.ry * .14 * grow, -.2, 0, 6.3); ctx.fill();
    ctx.beginPath(); ctx.arc(p.x + p.rx * .25, p.y - p.ry * .2, 1.6 * grow, 0, 6.3); ctx.fill(); }
  }
  for(const p of P) for(let j = 0; j < (gmOk('te_veneno') ? 1 : VN.burb); j++){                                                                                   // burbujas que crecen y explotan
    const sp = .55 + HH(j, p.s + 4) * .5, ph0 = t * sp + HH(j, p.s + 5), ph = ph0 % 1, cyc = Math.floor(ph0);
    const bx = p.x + (HH(j * 3 + cyc, p.s + 6) - .5) * p.rx * 1.2, by = p.y + (HH(j * 5 + cyc, p.s + 7) - .5) * p.ry * 1.0;
    if(ph < .75){ const r = 1.5 + ph / .75 * (3 + HH(j, p.s + 8) * 3);
      ctx.globalAlpha = a * .95; ctx.fillStyle = '#a24fd0'; ctx.beginPath(); ctx.arc(bx, by - r * .6, r, 0, 6.3); ctx.fill();
      ctx.strokeStyle = '#3a1050'; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = '#f3c9ff'; ctx.fillRect(bx - r * .45, by - r * 1.2, Math.max(1, r * .4), Math.max(1, r * .4)); }
    else { const u = (ph - .75) / .25;                                                                                                   // ¡plop!: aro y gotitas
      ctx.globalAlpha = a * (1 - u); ctx.strokeStyle = '#e3a4ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(bx, by, 3 + u * 7, (3 + u * 7) * .45, 0, 0, 6.3); ctx.stroke();
      ctx.fillStyle = '#c46ee8'; for(let s = 0; s < 4; s++){ const an = s * 1.57 + .7; ctx.fillRect(bx + Math.cos(an) * (3 + u * 9) - 1, by - 4 - Math.sin(u * 3.14) * 7 + Math.sin(an) * 2, 2, 2); } }
  }
  for(const p of P){ const ph = (t * .45 + HH(p.i, p.s + 9)) % 1;                                                                     // humito morado que sube
    ctx.globalAlpha = a * .35 * Math.sin(ph * 3.14); ctx.fillStyle = '#b06ad6'; ctx.beginPath(); ctx.arc(p.x + Math.sin(t + p.s) * 4, p.y - 6 - ph * 26, 3 + ph * 6, 0, 6.3); ctx.fill(); }
  ctx.restore();
  if(!TERR[q.type].heal && q.mine === (g.me === 'e')){                                                                                  // te hace daño a ti: borde con rayas blancas (como siempre)
    ctx.save(); ctx.translate(q.x0, q.y0); ctx.rotate(Math.atan2(dy, dx)); terrCap(len, q.w); ctx.globalAlpha = .7 * a; ctx.lineWidth = 3; ctx.strokeStyle = '#ffffff'; ctx.setLineDash([11, 8]); ctx.stroke(); ctx.restore(); }
}
if(typeof terrDraw === 'function'){ const o = terrDraw; terrDraw = function(){
    if(!VN.on || !g || !g.terr || !g.terr.some(q => q.type === 'veneno')) return o.apply(this, arguments);
    const all = g.terr; g.terr = all.filter(q => q.type !== 'veneno');
    try{ o.apply(this, arguments); } finally { g.terr = all; }
    ctx.save(); terrClip(); try{ all.forEach(q => { if(q.type === 'veneno') vnFranja(q); }); }catch(e){} ctx.restore();
  }; }
