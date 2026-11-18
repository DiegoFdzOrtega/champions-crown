"use strict";
/* =====================================================================
   EFECTOS COPIADOS DEL VÍDEO «ROJO vs CINTIA» (Pokémon Battlegrounds, https://youtu.be/UGcfjUR-lIU?t=35):
   1) CARRERA (Espacio): estela de luz blanca desde donde sales hasta donde estás (se estrecha hacia atrás), bolitas de luz a lo largo
      (como copias de luz), polvo y un aro en el suelo al salir, y un aro pequeño al llegar. Sonido nuevo 'dash' (music.js).
   2) CARGA DEL ATAQUE FUERTE (E): el campo se oscurece poco a poco alrededor, líneas de luz que van hacia una bola del color del ataque
      delante de la boca, aros en el suelo que se cierran y un ¡tin! cuando ya está cargado ('v_ready').
   3) «CUADRO DE IMPACTO»: en un golpe muy eficaz o crítico fuerte, la pantalla se pone negra un instante con rayas blancas que salen del golpe
      y los dos Pokémon en blanco (como en el anime), el juego se congela un momento, destello blanco y ¡BUM! ('impact4').
   4) ESFERA AURAL: la bola se forma en las manos al lanzarla (con su sonido 'aura_cast'), aro en el suelo al salir y aro grande al dar.
   V5.<cosa> = false apaga cada parte. Las medidas de cada efecto están en V5 [AJUSTE].
   ===================================================================== */
const V5 = {dash: true, chg: true, imp: false, aura: true,   // imp: el «cuadro de impacto» (pantalla negra con rayas) quitado a petición de Diego
  dim: .45,          // lo que se oscurece el campo con el ataque fuerte cargado del todo (0 = nada)
  impMs: 110,        // lo que dura la pantalla negra del cuadro de impacto (milisegundos)
  impCd: 1.6,        // segundos mínimos entre dos cuadros de impacto
  impMin: .1,        // daño mínimo (parte de la vida del rival, 0,1 = 10 %) para que salga
  stop: .1};         // congelado del juego en el cuadro de impacto (segundos)
Object.assign(GM.meta, {da_polvo: {fw: 182, fh: 130, n: 4}, da_estela: {fw: 276, fh: 52, n: 3}, ea_carga: {fw: 79, fh: 78, n: 5}});   // sprites de Gemini (assets/fx)
['da_polvo', 'da_estela', 'ea_carga'].forEach(k => { const im = new Image(); im.onload = () => { GM.meta[k].ok = true; }; im.src = `assets/fx/${k}.png?v=1`; GM.img[k] = im; });
Object.assign(V5, {polvo: 1, estela: 1, copias: true, sacude: 3});   // [AJUSTE] tamaño de la nube de polvo y de la estela, copias de luz del Pokémon y temblor al salir
const V5L = [];      // carreras que se están dibujando
let V5last = 0, V5imp = null, V5cd = 0;

// ---------------- 1) CARRERA ----------------
function v5DashStart(f){
  const I = idleInfo(f.m.dex), foot = I.foot * ESCALA;
  V5L.push({f, x0: f.x, y0: f.y, foot, pts: [[f.x, f.y]], t: 0, rec: 0, col: TC[f.m.types[0]] || '#ffffff', ang: f.da || 0});
  if(V5.sacude && typeof fx !== 'undefined') fx.shake = Math.max(fx.shake || 0, V5.sacude);
  try{ fxBurst(f.x, f.y + foot - 4, ['#cdbb9a', '#a8916b', '#ece4d4'], 9, 150, (f.da || 0) + Math.PI, 1.3, {life: .45, s: 3, rise: -.2, drag: .88}); }catch(e){}
}
if(typeof use === 'function'){ const o = use; use = function(f, i){
  const d0 = f && f.dash, r = o.apply(this, arguments);
  try{ if(V5.dash && i === 0 && f && f.dash > 0 && f.dash !== d0) v5DashStart(f); }catch(e){}
  try{ if(V5.chg && i === 4 && f && f.wind && f.wind.c === 0 && typeof Sfx !== 'undefined' && !f.v5cs){ f.v5cs = 1; Sfx.play('charge2', f.wind.vk == null ? 1 : f.wind.vk); } }catch(e){}
  return r; }; }
function v5DashDraw(dt){
  for(let k = V5L.length - 1; k >= 0; k--){
    const D = V5L[k], f = D.f; D.t += dt;
    if(f.dash > 0 && !f.dead){ D.rec -= dt; if(D.rec <= 0){ D.rec = .018; D.pts.push([f.x, f.y]); }
      D.gh = D.gh || []; D.gt = (D.gt || 0) - dt; if(V5.copias && D.gt <= 0){ D.gt = .05; const AP = typeof anPick === 'function' ? anPick(f) : [f.act, f.at]; D.gh.push({x: f.x, y: f.y, a: AP[0], t: AP[1], dir: f.dir, t0: D.t}); } }
    else if(!D.end){ D.end = D.t; D.pts.push([f.x, f.y]); }
    const fade = D.end ? 1 - (D.t - D.end) / .6 : 1; if(fade <= 0){ V5L.splice(k, 1); continue; }
    const P = D.pts, n = P.length, yo = -8;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'lighter';
    for(let i = 1; i < n; i++){                                                      // la estela: más fina atrás, más gorda delante
      const u = i / (n - 1 || 1), w = 3 + 17 * u;
      ctx.globalAlpha = fade * .45 * u; ctx.strokeStyle = D.col; ctx.lineWidth = w * 2.4;
      ctx.beginPath(); ctx.moveTo(P[i - 1][0], P[i - 1][1] + yo); ctx.lineTo(P[i][0], P[i][1] + yo); ctx.stroke();
      ctx.globalAlpha = fade * .9 * u; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(P[i - 1][0], P[i - 1][1] + yo); ctx.lineTo(P[i][0], P[i][1] + yo); ctx.stroke();
    }
    for(let i = 2; i < n; i += 3){                                                   // bolitas de luz a lo largo del camino
      const u = i / (n - 1), r = 6 + 9 * u, x = P[i][0], y = P[i][1] + yo, G = ctx.createRadialGradient(x, y, 0, x, y, r);
      G.addColorStop(0, 'rgba(255,255,255,.95)'); G.addColorStop(.5, 'rgba(220,240,255,.5)'); G.addColorStop(1, 'rgba(200,230,255,0)');
      ctx.globalAlpha = fade * (.4 + .6 * u); ctx.fillStyle = G; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fill();
    }
    if(gmOk('da_estela') && n > 1){                                                  // la estela de Gemini, estirada desde la salida hasta el Pokémon
      const x1 = P[n - 1][0], y1 = P[n - 1][1] + yo, dx = x1 - D.x0, dy = y1 - (D.y0 + yo), L = Math.hypot(dx, dy), M = GM.meta.da_estela;
      if(L > 8){ ctx.save(); ctx.translate(D.x0, D.y0 + yo); ctx.rotate(Math.atan2(dy, dx)); ctx.globalAlpha = fade; const h = M.fh * 1.1 * V5.estela;
        ctx.drawImage(GM.img.da_estela, 2 * M.fw, 0, M.fw, M.fh, -10, -h / 2, L + 34, h); ctx.restore(); } }
    ctx.globalCompositeOperation = 'source-over';
    (D.gh || []).forEach(q => { const u = (D.t - q.t0) / .45; if(u >= 1) return;     // copias de luz del Pokémon (se quedan atrás y se apagan)
      try{ ctx.save(); ctx.globalAlpha = (1 - u) * .55; ctx.filter = 'brightness(2.2) saturate(0)'; drawFrame(ctx, f.m.dex, q.a, q.t, q.dir, q.x, q.y, ESCALA, 0, f.shiny); ctx.restore(); }catch(e){ ctx.restore(); } });
    if(gmOk('da_polvo')){ const u = D.t / .6; if(u < 1){                            // la nube de polvo al salir (de Gemini)
      const M = GM.meta.da_polvo, i = Math.min(M.n - 1, Math.floor(u * M.n)), sc = V5.polvo, back = Math.cos(D.ang) > 0 ? -1 : 1;
      ctx.save(); ctx.translate(D.x0 + back * 14, D.y0 + D.foot + 4); ctx.scale(back < 0 ? -1 : 1, 1); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = u > .75 ? (1 - u) / .25 : 1;
      ctx.drawImage(GM.img.da_polvo, i * M.fw, 0, M.fw, M.fh, -M.fw * sc / 2, -M.fh * sc, M.fw * sc, M.fh * sc); ctx.restore(); } }
    const ring = (x, y, t, R) => { if(t < 0 || t > .35) return; const u = t / .35; ctx.globalAlpha = (1 - u) * .85; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3 * (1 - u) + 1;
      ctx.beginPath(); ctx.ellipse(x, y, 10 + R * u, (10 + R * u) * .38, 0, 0, 6.3); ctx.stroke(); };
    ring(D.x0, D.y0 + D.foot - 2, D.t, 46);                                          // aro al salir
    if(D.end) ring(P[n - 1][0], P[n - 1][1] + D.foot - 2, D.t - D.end, 30);         // y al llegar
    ctx.restore();
  }
}

// ---------------- 2) CARGA DEL ATAQUE FUERTE ----------------
const v5K = f => { const w = f.wind; if(!w) return 0; return clamp(w.hold ? w.c / FEEL.wind : 1 - w.t / w.T, 0, 1); };   // 0..1 hasta la carga mínima (2 s)
const v5Fs = () => g ? [...g.p, ...g.e].filter(f => f && f.wind && !f.dead && !f.ghost) : [];
function v5Dim(){                                                                    // el campo se oscurece (debajo de los Pokémon: ellos siguen viéndose bien)
  let k = 0; v5Fs().forEach(f => { k = Math.max(k, v5K(f)); }); if(!k) return;
  ctx.save(); ctx.globalAlpha = V5.dim * k; ctx.fillStyle = '#0a0c1a'; ctx.fillRect(-W, -H, W * 3, H * 3); ctx.restore();
  v5Fs().forEach(f => { const k2 = v5K(f), I = idleInfo(f.m.dex), fy = f.y + I.foot * ESCALA - 2;   // aros en el suelo que se cierran
    ctx.save(); ctx.strokeStyle = '#ffffff';
    for(let j = 0; j < 3; j++){ const p = (g.t * 1.3 + j / 3) % 1, R = 18 + (1 - p) * (50 + 40 * k2); ctx.globalAlpha = p * .6 * (.4 + .6 * k2); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(f.x, fy, R, R * .36, 0, 0, 6.3); ctx.stroke(); }
    const col = TC[f.wind.type] || '#ffffff';                                       // columna de luz y chispas que suben en espiral
    ctx.globalCompositeOperation = 'lighter';
    if(k2 > .35){ const h = 150 * (k2 - .35) / .65, Gp = ctx.createLinearGradient(0, fy, 0, fy - h);
      Gp.addColorStop(0, col); Gp.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = .35 * (.8 + .2 * Math.sin(g.t * 20)); ctx.fillStyle = Gp;
      ctx.beginPath(); ctx.ellipse(f.x, fy, 34, 12, 0, Math.PI, 0, true); ctx.lineTo(f.x + 22, fy - h); ctx.lineTo(f.x - 22, fy - h); ctx.closePath(); ctx.fill(); }
    for(let i = 0; i < 12; i++){ const p = (g.t * .9 + i / 12) % 1, an = i * 2.1 + g.t * 3, rr = 34 * (1 - p * .6);
      ctx.globalAlpha = Math.sin(p * Math.PI) * (.3 + .7 * k2); ctx.fillStyle = i % 2 ? '#ffffff' : col;
      ctx.fillRect(f.x + Math.cos(an) * rr - 2, fy - p * 110 + Math.sin(an) * rr * .35 - 2, 4, 4); }
    ctx.restore(); });
}
function v5ChgTop(){                                                                 // encima de los Pokémon: bola del color del ataque y líneas de luz que van hacia ella
  v5Fs().forEach(f => {
    const w = f.wind, k = v5K(f), col = TC[w.type] || '#ffffff', a = w.ang || 0, [mx0, my0] = typeof mouthOf === 'function' ? mouthOf(f) : [f.x, f.y - 16], ox = mx0 + Math.cos(a) * 12, oy = my0 + Math.sin(a) * 8;   // la bola sale de la boca (mouthOf, js/fxvideo2.js)
    const ready = w.hold ? w.c >= FEEL.wind : k > .3; if(ready && !f.v5r){ f.v5r = 1; if(w.hold && typeof Sfx !== 'undefined') Sfx.play('v_ready', .8); }
    ctx.save(); ctx.lineCap = 'round';
    for(let i = 0; i < 16; i++){                                                     // líneas que vienen de fuera hacia la bola
      const p = (g.t * 1.7 + i * .137) % 1, an = HH(i, 7) * 6.283 + Math.floor(g.t * 1.7 + i * .137) * 1.3, d0 = (1 - p) * (150 + 60 * k) + 16, L = 12 + 34 * (1 - p);
      ctx.globalAlpha = Math.min(1, p * 1.4) * (.5 + .5 * k); ctx.strokeStyle = i % 3 ? '#ffffff' : col; ctx.lineWidth = 2.5 + 2 * k;
      ctx.beginPath(); ctx.moveTo(ox + Math.cos(an) * d0, oy + Math.sin(an) * d0); ctx.lineTo(ox + Math.cos(an) * (d0 + L), oy + Math.sin(an) * (d0 + L)); ctx.stroke();
    }
    const r = 5 + 15 * k + (ready ? 1.5 * Math.sin(g.t * 30) : 0);                  // la bola: borde oscuro, color del ataque y centro blanco
    ctx.globalCompositeOperation = 'lighter'; const G = ctx.createRadialGradient(ox, oy, 0, ox, oy, r * 3.2);
    G.addColorStop(0, col); G.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = .55 * k; ctx.fillStyle = G; ctx.beginPath(); ctx.arc(ox, oy, r * 3.2, 0, 6.3); ctx.fill();
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.fillStyle = '#20141a'; ctx.beginPath(); ctx.arc(ox, oy, r + 2, 0, 6.3); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ox, oy, r, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ox, oy, r * .55, 0, 6.3); ctx.fill();
    ctx.restore();
  });
  g && [...g.p, ...g.e].forEach(f => { if(f && !f.wind){ f.v5r = 0; f.v5cs = 0; } });
}

// ---------------- 3) CUADRO DE IMPACTO ----------------
if(typeof hit === 'function'){ const o = hit; hit = function(T, dmg, type, A, close, big){
  const hp0 = T ? T.hp : 0, np = g && g.pops ? g.pops.length : 0, r = o.apply(this, arguments);
  try{
    if(V5.imp && !g.pvp && T && A && A !== T && (g.t - V5cd) > V5.impCd && hp0 - T.hp >= T.max * V5.impMin){
      const nw = g.pops.slice(np).map(p => p.txt), sup = nw.includes('¡Muy eficaz!'), cr = nw.includes('¡CRÍTICO!');
      if(sup || (cr && big)){ V5cd = g.t; V5imp = {T, A, at: performance.now(), x: T.x, y: T.y - 20};
        if(typeof fxhd !== 'undefined') fxhd.stop = Math.max(fxhd.stop || 0, V5.stop);
        if(typeof Sfx !== 'undefined') Sfx.play('impact4', .9); }
    }
  }catch(e){}
  return r; }; }
function v5Sil(f){                                                                   // el Pokémon entero en blanco
  try{ ctx.save(); ctx.filter = 'brightness(0) invert(1)';
    const AP = typeof anPick === 'function' ? anPick(f) : [f.act, f.at];
    drawFrame(ctx, f.m.dex, AP[0], AP[1], f.dir, f.x, f.y, ESCALA, 0, f.shiny); ctx.restore(); }catch(e){ ctx.restore(); }
}
function v5ImpDraw(){
  if(!V5imp) return; const ms = performance.now() - V5imp.at, I = V5imp;
  if(ms > V5.impMs + 260){ V5imp = null; return; }
  ctx.save();
  if(ms < V5.impMs){                                                                 // pantalla negra, rayas blancas desde el golpe y los dos en blanco
    ctx.fillStyle = '#0b0b10'; ctx.fillRect(-W, -H, W * 3, H * 3);
    ctx.fillStyle = '#ffffff';
    for(let i = 0; i < 34; i++){ const an = HH(i, 11) * 6.283, w = .02 + HH(i, 5) * .05, r0 = 60 + HH(i, 3) * 120, r1 = 1600;
      ctx.beginPath(); ctx.moveTo(I.x + Math.cos(an) * r0, I.y + Math.sin(an) * r0);
      ctx.lineTo(I.x + Math.cos(an - w) * r1, I.y + Math.sin(an - w) * r1); ctx.lineTo(I.x + Math.cos(an + w) * r1, I.y + Math.sin(an + w) * r1); ctx.closePath(); ctx.fill(); }
    v5Sil(I.A); v5Sil(I.T);
  } else {                                                                           // destello blanco que se apaga, con rayos
    const u = (ms - V5.impMs) / 260, G = ctx.createRadialGradient(I.x, I.y, 0, I.x, I.y, 170);
    G.addColorStop(0, 'rgba(255,255,255,1)'); G.addColorStop(.4, 'rgba(255,255,255,.6)'); G.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = 1 - u; ctx.fillStyle = G; ctx.beginPath(); ctx.arc(I.x, I.y, 170, 0, 6.3); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineCap = 'round';
    for(let i = 0; i < 12; i++){ const an = i * .5236 + .2, a0 = 40 + 160 * u, a1 = a0 + 60 * (1 - u); ctx.lineWidth = 4 * (1 - u) + 1;
      ctx.beginPath(); ctx.moveTo(I.x + Math.cos(an) * a0, I.y + Math.sin(an) * a0); ctx.lineTo(I.x + Math.cos(an) * a1, I.y + Math.sin(an) * a1); ctx.stroke(); }
    ctx.globalAlpha = (1 - u) * .9; ctx.lineWidth = 3; const R = 30 + 110 * u;
    ctx.beginPath(); ctx.ellipse(I.x, I.T.y + 26, R, R * .38, 0, 0, 6.3); ctx.stroke();
  }
  ctx.restore();
}

// ---------------- 4) ESFERA AURAL ----------------
FXR.impact._eaCast = (e, a) => {                                                     // la esfera creciendo en las manos con luz que se junta
  const u = a / e.dur; if(u >= 1) return; const r = 8 + 22 * u;
  if(gmOk('ea_carga')){ gmDraw('ea_carga', Math.min(4, Math.floor(u * 5)), e.x, e.y, .7, 0, u > .85 ? (1 - u) / .15 : 1); return; }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for(let i = 0; i < 10; i++){ const an = i * .628 + e.x, d = (1 - u) * 60 + r; ctx.globalAlpha = u; ctx.fillStyle = i % 2 ? '#ffffff' : '#7fd0ff';
    ctx.fillRect(e.x + Math.cos(an) * d - 2, e.y + Math.sin(an) * d - 2, 4, 4); }
  const G = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r * 1.8); G.addColorStop(0, 'rgba(255,255,255,.95)'); G.addColorStop(.45, 'rgba(90,170,255,.8)'); G.addColorStop(1, 'rgba(60,120,255,0)');
  ctx.globalAlpha = 1; ctx.fillStyle = G; ctx.beginPath(); ctx.arc(e.x, e.y, r * 1.8, 0, 6.3); ctx.fill();
  ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2;   // las líneas blancas onduladas de la bola
  for(let s = -1; s <= 1; s += 2){ ctx.beginPath(); for(let t = -1; t <= 1; t += .1){ const x = e.x + t * r * .9, y = e.y + s * r * .35 * Math.cos(t * 1.6 + g.t * 8); t > -1 ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
  ctx.restore();
};
FXR.impact._ring = (e, a) => { const u = a / e.dur; if(u >= 1) return; const R = e.r0 + (e.r1 - e.r0) * u;      // aro en el suelo que se abre
  ctx.save(); ctx.globalAlpha = (1 - u) * .9; ctx.strokeStyle = e.c || '#ffffff'; ctx.lineWidth = 4 * (1 - u) + 1.5; ctx.beginPath(); ctx.ellipse(e.x, e.y, R, R * .38, 0, 0, 6.3); ctx.stroke(); ctx.restore(); };
{ const o = FXR.cast['Esfera Aural'] || FXR.cast['_']; FXR.cast['Esfera Aural'] = function(f, s, name, big, ox, oy){
  const r = o && o.apply(this, arguments);
  if(V5.aura){ fxAdd('impact', '_eaCast', {x: ox, y: oy - 6, dur: .3}); const I = idleInfo(f.m.dex);
    fxAdd('impact', '_ring', {x: f.x, y: f.y + I.foot * ESCALA - 2, dur: .4, r0: 14, r1: 60, c: '#bfe6ff'});
    if(typeof Sfx !== 'undefined') Sfx.play('aura_cast', g.e && g.e.includes(f) ? .6 : .9); }
  return r; }; }
{ const o = FXR.impact['Esfera Aural']; if(o){ const w = function(e, a){ if(V5.aura && a < .5){ const u = a / .5, R = 20 + 90 * u;
    ctx.save(); ctx.globalAlpha = (1 - u) * .85; ctx.strokeStyle = '#d8f0ff'; ctx.lineWidth = 4 * (1 - u) + 1; ctx.beginPath(); ctx.ellipse(e.x, e.y + 18, R, R * .38, 0, 0, 6.3); ctx.stroke(); ctx.restore(); }
  return (o.draw || o).apply(this, arguments); }; Object.assign(w, o); delete w.draw; FXR.impact['Esfera Aural'] = w; } }
if(typeof G4 !== 'undefined') G4.ea = Math.max(G4.ea, .75);                         // la bola un poco más grande, como en el vídeo

// ---------------- Dónde se dibuja cada cosa ----------------
if(typeof windDraw === 'function'){ const o = windDraw; windDraw = function(){       // debajo de los Pokémon: oscurecer, aros y estela de la carrera
  const now = g ? g.t : 0, dt = Math.max(0, Math.min(.05, now - V5last)); V5last = now;
  try{ if(V5.chg) v5Dim(); }catch(e){}
  const r = o.apply(this, arguments);
  try{ v5DashDraw(dt); }catch(e){}
  return r; }; }
if(typeof megaDraw === 'function'){ const o = megaDraw; megaDraw = function(){       // encima de todo (antes del HUD): bola de carga y cuadro de impacto
  const r = o.apply(this, arguments);
  try{ if(V5.chg) v5ChgTop(); v5ImpDraw(); }catch(e){}
  return r; }; }

// ---------------- Sin carteles grandes del ataque fuerte («¡HIDROBOMBA!» en grande): V5.cartel = true los vuelve a poner ----------------
V5.cartel = false;
if(typeof nvBigStart === 'function'){ const o = nvBigStart; nvBigStart = function(){ if(V5.cartel) return o.apply(this, arguments); }; }
