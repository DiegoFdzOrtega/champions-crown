"use strict";
/* =====================================================================
   5) DIBUJO: arena, Pokémon y HUD retro oscuro
   ===================================================================== */
function text(t, x, y, size, col, align){
  ctx.font = `${size}px ${FONT}`; ctx.fillStyle = col || '#fff';
  ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(t, x, y);
}
function textO(t, x, y, size, col, align){                // texto con contorno oscuro: se lee sobre cualquier fondo (avisos flotantes, subtítulo)
  ctx.font = `${size}px ${FONT}`; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, size / 3); ctx.strokeStyle = 'rgba(8,10,20,.92)'; ctx.strokeText(t, x, y);
  text(t, x, y, size, col, align);
}
let HUD_SCALE = .74;      /* js/touch.js lo sube a .92 en pantallas táctiles */                                   // tamaño del HUD en combate (1 = como antes; más pequeño = molesta menos)
function hudAt(ax, ay, fn){ ctx.save(); ctx.translate(ax, ay); ctx.scale(HUD_SCALE, HUD_SCALE); ctx.translate(-ax, -ay); fn(); ctx.restore(); }   // dibuja fn() reducido desde la esquina (ax, ay)
function bar(x, y, w, h, v, max, col){
  ctx.fillStyle = '#05070c'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = col; ctx.fillRect(x+1, y+1, Math.max(0, (w-2) * v/max), h-2);
  ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1; ctx.strokeRect(x+.5, y+.5, w-1, h-1);
}
// Caja oscura semitransparente con borde fino iluminado
function hudBox(x, y, w, h, col){
  ctx.fillStyle = 'rgba(16,20,30,.9)'; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 10;
  ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.strokeRect(x+.5, y+.5, w-1, h-1); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1; ctx.strokeRect(x+4.5, y+4.5, w-9, h-9);
}
// Sombra suave bajo cada Pokémon
function shadow(x, y, rx){
  ctx.save(); ctx.translate(x, y); ctx.scale(1, .3);
  const gr = ctx.createRadialGradient(0,0,0,0,0,rx);
  gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(.6, 'rgba(0,0,0,.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0,0,rx,0,7); ctx.fill(); ctx.restore();
}

// Fondo antiguo (lava): solo se usa si un rival no tiene arena propia en arenas.js
function arenaFallback(){
  ctx.fillStyle = '#3b2c2a'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1;
  for(let x=0; x<W; x+=48){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for(let y=0; y<H; y+=48){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  const gr = ctx.createRadialGradient(W/2, H/2, H*.3, W/2, H/2, Math.hypot(W,H)/2);   // lava en los bordes
  gr.addColorStop(0, 'rgba(255,90,20,0)'); gr.addColorStop(.65, 'rgba(255,90,20,.2)'); gr.addColorStop(1, 'rgba(255,130,30,.65)');
  ctx.fillStyle = gr; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(W/2, 70); ctx.lineTo(W/2, H-90); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2, H/2+10, 140, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2, H/2+10, 40, 0, 7); ctx.stroke();
}

// Fondo del combate: cada líder / Alto Mando / Campeón tiene el suyo (ver arenas.js)
function arena(){ drawArena(g && g.o ? (g.o.arena || g.o.leader) : '', g ? g.t : 0); }

// Aviso del ataque fuerte: mientras se carga (f.wind, combat.js) se pinta en el suelo el carril por donde va a salir. Se va llenando; cuando el rival de la IA deja de apuntar, el borde se pone blanco.
// Terreno (TERR, combat.js): FRANJAS rectas en el suelo, por donde pasó el ataque fuerte. Las que TE perjudican llevan borde blanco discontinuo; las tuyas, borde fino de su color.
const SUELO = {ok:false, H:88, rows:[{"n": "fuego", "w": 422, "h": 77, "bt": 13}, {"n": "veneno", "w": 422, "h": 79, "bt": 14}, {"n": "hielo", "w": 422, "h": 75, "bt": 10}, {"n": "agua", "w": 423, "h": 88, "bt": 22}, {"n": "electrico", "w": 423, "h": 81, "bt": 15}, {"n": "planta", "w": 423, "h": 73, "bt": 8}]};
{ const i = new Image(); i.onload = () => { SUELO.ok = true; }; i.src = 'objetos/suelo.png?v=3'; SUELO.img = i; }
function suelo(q, len, w, a){                                   // dibuja la franja con su sprite (objetos/suelo.png): 2 tapas y el centro repetido en espejo para que no se note el corte
  const R = SUELO.rows[['fuego', 'veneno', 'hielo', 'agua', 'electrico', 'planta'].indexOf(q.type)]; if(!R) return false;
  const i = ['fuego', 'veneno', 'hielo', 'agua', 'electrico', 'planta'].indexOf(q.type), sy = i * SUELO.H, bh = R.h - R.bt, s = 2 * w / bh, cap = 36, capD = cap * s, L = len + 2 * w, midD = L - 2 * capD, top = -w - R.bt * s;
  ctx.globalAlpha = a; const im = SUELO.img;
  ctx.drawImage(im, 0, sy, cap, R.h, -w, top, capD, R.h * s);
  ctx.drawImage(im, R.w - cap, sy, cap, R.h, -w + L - capD, top, capD, R.h * s);
  if(midD > 0){ const sw = R.w - 2 * cap, n = Math.max(1, Math.round(midD / (sw * s))), tw = midD / n;
    for(let k = 0; k < n; k++){ ctx.save(); const x0 = -w + capD + k * tw; if(k % 2){ ctx.translate(x0 + tw, 0); ctx.scale(-1, 1); } else ctx.translate(x0, 0); ctx.drawImage(im, cap, sy, sw, R.h, 0, top, tw, R.h * s); ctx.restore(); } }
  return true;
}
function fuegoFx(len, w, a, t){                                  // llamas de píxeles que bailan por la franja de fuego (cada columna de 4 px: núcleo claro → amarillo → naranja → rojo en la punta) + brasas que suben
  const n = Math.max(5, Math.floor((len + 2 * w) / 24));
  for(let i = 0; i < n; i++){
    const bx = Math.round((-w + 14 + HH(i, 31) * (len + 2 * w - 28)) / 4) * 4, by = Math.round(((HH(i, 33) - .5) * w * .8 + 14) / 4) * 4, sz = 26 + 24 * HH(i, 35), ph = HH(i, 37) * 6.3, ww = sz > 38 ? 4 : 3;
    for(let k = -ww; k <= ww; k++){
      const prof = Math.pow(1 - Math.abs(k) / (ww + 1.2), 1.2), fl = .72 + .28 * Math.sin(t * 9 + ph + k * 1.9) + .1 * Math.sin(t * 17 + i + k), hh = Math.max(8, sz * prof * fl * (.85 + .3 * HH(i * 7 + k + 20, 39))), cells = Math.ceil(hh / 4);
      for(let j = 0; j < cells; j++){
        const f = j / cells; let col = f < .28 && Math.abs(k) < ww ? '#fff6b0' : f < .55 ? '#ffd23a' : f < .82 ? '#ff8a1f' : '#d9381a';
        ctx.globalAlpha = a * (f > .85 ? .8 : 1); ctx.fillStyle = col; ctx.fillRect(bx + k * 4, by - (j + 1) * 4, 4, 4);
      }
    }
  }
  for(let i = 0; i < Math.max(5, n); i++){                          // brasas
    const p = (t * (.5 + HH(i, 41)) + HH(i, 43)) % 1, x = -w + 10 + HH(i, 45) * (len + 2 * w - 20) + Math.sin(t * 3 + i) * 5, y = w * .3 - p * (w * 1.5);
    ctx.globalAlpha = a * (1 - p); ctx.fillStyle = i % 2 ? '#ffe04a' : '#ff8a1f'; ctx.fillRect(Math.round(x / 3) * 3, Math.round(y / 3) * 3, 3, 3);
  }
}
function aguaFx(len, w, a, t){                                   // agua de píxeles: ondas que se abren y se apagan, gotas que saltan y caen, destellos que se deslizan
  const L = len + 2 * w, n = Math.max(3, Math.floor(L / 55));
  for(let i = 0; i < n; i++){                                       // ondas: anillos de píxeles que crecen (cada onda dura ~1,6 s)
    const per = 1.4 + HH(i, 51) * .9, p = ((t + HH(i, 53) * 5) / per) % 1, cyc = Math.floor((t + HH(i, 53) * 5) / per), hx = HH(i * 3 + cyc, 55), hy = HH(i * 5 + cyc, 57);
    const cx = -w + 22 + hx * (L - 44), cy = (hy - .5) * w * 1.1, rx = 5 + p * 22, ry = rx * .42;
    ctx.fillStyle = p < .35 ? '#ffffff' : '#bfeaff';
    for(let j = 0, N = Math.round(rx * 3.4); j < N; j++){ const an = j / N * 6.283; ctx.globalAlpha = a * Math.min(1, (1 - p) * 1.4); ctx.fillRect(Math.round((cx + Math.cos(an) * rx) / 2) * 2, Math.round((cy + Math.sin(an) * ry) / 2) * 2, 3, 3); }
    if(p < .18){ ctx.globalAlpha = a * (1 - p / .18); ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(cx / 2) * 2 - 2, Math.round(cy / 2) * 2 - 6 - Math.round(p * 30), 4, 4); }      // la gota que cae al agua
  }
  for(let i = 0; i < n; i++){                                       // gotas que saltan de la superficie y vuelven a caer
    const per = 1.1 + HH(i, 61) * .8, p = ((t + HH(i, 63) * 7) / per) % 1, x = -w + 16 + HH(i, 65) * (L - 32) + (p - .5) * 14, y = w * .15 - Math.sin(p * Math.PI) * (14 + 14 * HH(i, 67));
    ctx.globalAlpha = a * (p < .1 || p > .9 ? .5 : 1); ctx.fillStyle = i % 3 ? '#e6f7ff' : '#7fd0ff'; ctx.fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, 3, 3);
  }
  for(let i = 0; i < 2 + Math.floor(L / 120); i++){                 // destello: raya clara que cruza la franja en diagonal
    const p = ((t * .22 + HH(i, 71)) % 1), x = -w + p * (L + 40) - 20;
    ctx.globalAlpha = a * .22 * Math.sin(p * Math.PI); ctx.fillStyle = '#ffffff'; for(let k = 0; k < 6; k++) ctx.fillRect(Math.round((x + k * 6) / 2) * 2, -w + 6 + k * 14 - 8, 4, 12);
  }
}
// ASPECTO de las franjas: se dibujan translúcidas (se ve el suelo del estadio por debajo) y con el borde más suave que el centro, y NUNCA fuera del campo.
const SUELO_LOOK = {capas: [.3, .3, .26], paso: .2, fx: .6, borde: .6};      // [AJUSTE] opacidad de cada capa (la 1ª es la franja entera; cada una siguiente es más estrecha y se suma: borde ≈ 30 %, centro ≈ 64 %) · cuánto se estrecha cada capa (parte del ancho) · opacidad de ondas, gotas y llamas · del borde discontinuo de las que te perjudican
function terrCap(len, r){ ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(len, -r); ctx.arc(len, 0, r, -Math.PI / 2, Math.PI / 2); ctx.lineTo(0, r); ctx.arc(0, 0, r, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); }      // la forma de la franja (recta con las puntas redondas)
function terrClip(){                                             // recorta el dibujo al suelo del campo: lo que se sale (pared del fondo, gradas) no se pinta
  ctx.beginPath();
  if(typeof prOn === 'function' && prOn()){ const c = PR.cam, F = PR.floor, X = x => (x - c.ox) / c.s, Y = y => (y - c.oy) / c.s; ctx.moveTo(X(F.lt), Y(F.yt)); ctx.lineTo(X(F.rt), Y(F.yt)); ctx.lineTo(X(F.rb), Y(F.yb)); ctx.lineTo(X(F.lb), Y(F.yb)); ctx.closePath(); }      // estadio (Torre Batalla, Campo de pruebas, Clasificatoria): el campo en perspectiva, por sus líneas
  else ctx.rect(14, 146, W - 28, H - 70 - 146);                    // resto de arenas: la zona por la que se mueven los Pokémon (con un pequeño margen)
  ctx.clip();
}
function terrDraw(){
  if(!g.terr || !g.terr.length) return;
  ctx.save(); terrClip();
  for(const q of g.terr || []){
    const dx = q.x1 - q.x0, dy = q.y1 - q.y0, len = Math.hypot(dx, dy); if(len < 6) continue;
    const a = clamp(Math.min(q.t / .25, (q.T - q.t) / .8), 0, 1), col = TC[q.type] || '#ffffff', w = q.w, bad = !TERR[q.type].heal && q.mine === (g.me === 'e'), t = g.t, ux = dx / len, uy = dy / len;
    ctx.save(); ctx.translate(q.x0, q.y0); ctx.rotate(Math.atan2(dy, dx));
    let spr = false;
    if(SUELO.ok) SUELO_LOOK.capas.forEach((al, k) => { ctx.save(); if(k){ terrCap(len, w * (1 - SUELO_LOOK.paso * k)); ctx.clip(); } spr = suelo(q, len, w, a * al) || spr; ctx.restore(); });      // por capas: entera y floja, y encima el centro (cada vez más estrecho) → borde difuminado
    terrCap(len, w);                                  // con sprite: se dibuja la imagen; sin él, el dibujo de siempre
    if(!spr){ ctx.globalAlpha = .32 * a; ctx.fillStyle = col; ctx.fill(); }
    if(spr && q.type === 'fuego') fuegoFx(len, w, a * SUELO_LOOK.fx, t);
    else if(spr && q.type === 'agua') aguaFx(len, w, a * SUELO_LOOK.fx, t);                                   // agua: ondas y gotas dibujadas                                           // fuego: llamas dibujadas en vez de las del sprite
    if(!spr || bad){ ctx.globalAlpha = (spr ? SUELO_LOOK.borde : .85) * a; ctx.lineWidth = bad ? 3 : 2; ctx.strokeStyle = bad ? '#ffffff' : col; if(bad) ctx.setLineDash([11, 8]); ctx.stroke(); ctx.setLineDash([]); }      // las que te perjudican llevan borde blanco discontinuo
    ctx.restore();
    if(SUELO.ok) continue;
    ctx.save();
    for(let i = 0, n = Math.max(3, Math.floor(len / 30)); i < n; i++){                // detalle animado de cada tipo, repartido a lo largo de la franja
      const lx = HH(i, 21) * len, ly = (HH(i, 23) - .5) * w * 1.5, x = q.x0 + ux * lx - uy * ly, y = q.y0 + uy * lx + ux * ly, ph = (t * (.8 + HH(i, 25)) + HH(i, 27)) % 1;
      ctx.globalAlpha = a * (1 - ph) * .95;
      if(q.type === 'fuego'){ const h = 10 + 16 * (1 - ph); ctx.fillStyle = i % 2 ? '#ffe04a' : '#ff8a1f'; ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.quadraticCurveTo(x + Math.sin(t * 9 + i) * 3, y - h * 1.9, x + 5, y); ctx.fill(); }
      else if(q.type === 'veneno'){ ctx.fillStyle = '#d98cff'; ctx.beginPath(); ctx.arc(x, y - ph * 22, 2 + 4 * (1 - ph), 0, 6.3); ctx.fill(); }
      else if(q.type === 'hielo'){ ctx.globalAlpha = a * .8; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 9, y + 4); ctx.lineTo(x + 9, y - 4); ctx.stroke(); }
      else if(q.type === 'agua'){ ctx.strokeStyle = '#d6f1ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, 3 + ph * 12, (3 + ph * 12) * .55, 0, 0, 6.3); ctx.stroke(); }
      else if(q.type === 'electrico'){ if(ph > .35) continue; ctx.globalAlpha = a; ctx.strokeStyle = '#fff7a8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 8, y - 10); ctx.lineTo(x + 2, y - 2); ctx.lineTo(x - 3, y + 2); ctx.lineTo(x + 8, y + 10); ctx.stroke(); }
      else{ ctx.globalAlpha = a * .9; ctx.strokeStyle = i % 2 ? '#bdf47c' : '#3fae3a'; ctx.lineWidth = 2.5; const sw = Math.sin(t * 2.5 + i) * 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sw, y - 20); ctx.moveTo(x + 4, y); ctx.lineTo(x + 6 + sw, y - 14); ctx.stroke(); }
    }
    ctx.restore();
  }
  ctx.restore();
}
// EFECTO DE CARGA (clic mantenido y ataque fuerte): bolita con aro amarillo → brillo con chispas → torbellino blanco → estallido de estrella. k = 0..1 de lo cargado; ok = ya cuenta
function chgFxDraw(f, k, ok){
  const c1 = ok ? '#ffffff' : '#ffe04a', pul = .75 + .25 * Math.sin(g.t * (ok ? 30 : 16)), cx = f.x, cy = f.y - 6;
  ctx.save();
  const R0 = 30 + 26 * k, hg = ctx.createRadialGradient(cx, cy, 4, cx, cy, R0); hg.addColorStop(0, ok ? 'rgba(255,255,255,.55)' : 'rgba(255,224,74,.45)'); hg.addColorStop(1, 'rgba(255,224,74,0)');
  if(k > .2){ ctx.globalAlpha = pul * Math.min(1, (k - .2) * 4); ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx, cy, R0, 0, 6.3); ctx.fill(); }               // brillo en el cuerpo (desde 0,2)
  ctx.globalAlpha = ok ? 1 : .75; ctx.strokeStyle = c1; ctx.lineWidth = ok ? 5 : 3.5; ctx.beginPath(); ctx.ellipse(f.x, f.y + 22, 14 + 32 * k, (14 + 32 * k) * .4, 0, 0, 6.3); ctx.stroke();   // aro a los pies
  const ns = k < .2 ? 3 : 8;
  for(let i = 0; i < ns; i++){ const ph = (g.t * 2.4 + i / ns) % 1, an = i * (6.28 / ns) + g.t * 1.5, rr = (1 - ph) * (40 + 26 * k) + 8; ctx.globalAlpha = ph * .95; ctx.fillStyle = i % 2 ? '#ffffff' : '#ffe04a'; ctx.fillRect(cx + Math.cos(an) * rr - 2.5, cy + Math.sin(an) * rr * .8 - 2.5, 5, 5); }   // chispas que acuden
  if(k > .45){                                                       // torbellino blanco: dos espirales que giran alrededor
    ctx.strokeStyle = '#ffffff'; ctx.lineCap = 'round'; ctx.lineWidth = 3;
    for(let s = 0; s < 2; s++){ ctx.globalAlpha = Math.min(.9, (k - .45) * 4) * (s ? .6 : 1); ctx.beginPath();
      for(let t = 0; t <= 1; t += .05){ const an = g.t * 7 * (s ? -1 : 1) + t * 9 + s * 3, rr = 14 + 34 * t, yy = cy + 26 - t * 62; t ? ctx.lineTo(cx + Math.cos(an) * rr, yy + Math.sin(an) * rr * .3) : ctx.moveTo(cx + Math.cos(an) * rr, yy + Math.sin(an) * rr * .3); }
      ctx.stroke(); }
  }
  if(k > .8){                                                        // estallido: estrella blanca que late + destellos
    const sp = 16, ro = 52 + 10 * Math.sin(g.t * 28), ri = 30; ctx.globalAlpha = .55 + .3 * Math.sin(g.t * 24); ctx.fillStyle = '#ffffff'; ctx.beginPath();
    for(let i = 0; i < sp * 2; i++){ const an = i * Math.PI / sp + g.t * .8, rr = i % 2 ? ri : ro; i ? ctx.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr) : ctx.moveTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); }
    ctx.closePath(); ctx.fill();
    for(let i = 0; i < 3; i++){ const an = g.t * 5 + i * 2.1, rr = 48 + 8 * Math.sin(g.t * 20 + i); ctx.globalAlpha = 1; ctx.fillStyle = '#ffe04a'; ctx.fillRect(cx + Math.cos(an) * rr - 4, cy + Math.sin(an) * rr - 4, 8, 8); }
  }
  ctx.restore();
}
function windDraw(){
  for(const f of [g.p[g.pi], g.e[g.ei]]){
    if(f.ctr > 0 && !f.dead && !f.ghost){ ctx.save(); ctx.globalAlpha = .55 + .4 * Math.sin(g.t * 22); ctx.strokeStyle = '#7fe3ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(f.x, f.y + 22, 34, 13, 0, 0, 6.3); ctx.stroke(); ctx.restore(); }      // contraataque listo: aro azul a sus pies
    if(f.jump && !f.dead && !f.ghost && typeof nvJumpDraw === 'function') nvJumpDraw(f);      // salto (Golpe Cuerpo, Vuelo): la diana donde va a caer (js/fxnuevos.js)
    if(f.spin && !f.dead && !f.ghost && typeof nvSpinDraw === 'function') nvSpinDraw(f);      // Torbellino: los brazos de agua (js/fxnuevos.js)
    if(f.mc > .12 && !f.dead && !f.ghost) chgFxDraw(f, clamp(f.mc / FEEL.chgT, 0, 1), f.mc >= FEEL.chgMin);      // golpe cargándose (mantienes el clic)
    const w = f.wind; if(!w || f.dead || f.ghost) continue;
    if(typeof nvWindFx === 'function') nvWindFx(f, w);                              // carga propia de algunos ataques fuertes (la bola de luz del Rayo Solar: js/fxnuevos.js)
    const k = w.hold ? clamp(w.c / FEEL.windMax, 0, 1) : clamp(1 - w.t / w.T, 0, 1), col = TC[w.type] || '#ffffff', len = 640, hw = 24, fijo = feelFoe(f) && w.t <= w.T * FEEL.windLock;
    chgFxDraw(f, k, w.hold ? w.c >= FEEL.wind : k > .3);                                                                                  // ataque fuerte cargándose: mismo efecto que el golpe cargado
    ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(w.ang);
    const gr = ctx.createLinearGradient(0, 0, len, 0); gr.addColorStop(0, col); gr.addColorStop(1, col + '00');
    ctx.fillStyle = gr; ctx.globalAlpha = .14 + .16 * k; ctx.fillRect(18, -hw, len, hw * 2);                 // el carril entero
    ctx.globalAlpha = .3 + .3 * k; ctx.fillRect(18, -hw, len * k, hw * 2);                                    // la parte que se va llenando
    ctx.globalAlpha = .55 + .45 * k; ctx.strokeStyle = fijo ? '#ffffff' : col; ctx.lineWidth = fijo ? 3 : 2; if(!fijo) ctx.setLineDash([12, 9]);
    ctx.beginPath(); ctx.moveTo(18, -hw); ctx.lineTo(len * .8, -hw); ctx.moveTo(18, hw); ctx.lineTo(len * .8, hw); ctx.stroke();
    ctx.restore();
  }
}
// Forma del golpe cuerpo a cuerpo (f.swing, combat.js): una línea (estocada), un arco (barrido) o un anillo (giro) que dura un instante
function swingDraw(){
  for(const f of [g.p[g.pi], g.e[g.ei]]){
    const s = f.swing; if(!s || f.ghost) continue;
    const a = (g.t - s.t0) / .22; if(a < 0 || a >= 1) continue;
    const K = s.k, R = K.reach + 16, grow = Math.min(1, a * 2.4);
    ctx.save(); ctx.translate(f.x, f.y - 6); ctx.globalAlpha = .8 * (1 - a); ctx.strokeStyle = s.big ? '#ffe04a' : TC[s.type] || '#ffffff'; ctx.lineCap = 'round'; ctx.lineWidth = (11 * (1 - a) + 3) * (s.big ? 1.8 : 1);
    ctx.beginPath();
    if(K.lunge){ ctx.rotate(s.ang); ctx.moveTo(24, 0); ctx.lineTo(24 + (R - 24) * grow, 0); }
    else if(K.arc >= Math.PI) ctx.arc(0, 0, R * (.45 + .45 * grow), 0, 6.3);
    else ctx.arc(0, 0, R * .8, s.ang - K.arc, s.ang - K.arc + K.arc * 2 * grow);
    ctx.stroke(); ctx.restore();
  }
}
// Pilar (PIL, combat.js): una ROCA dibujada a píxeles gordos, como los sprites del juego (o = borde · l = luz · m = medio · d = sombra). Su base está a la altura de los pies de los Pokémon.
// Mientras cae se ve su sombra creciendo; con cada golpe le salen grietas; al recibir un golpe destella; antes de deshacerse parpadea.
const PIL_ART = [
  '....oooooo....',
  '...ollllllo...',
  '..olllllmmmo..',
  '..ollllmmmmo..',
  '..olllmmmmdo..',
  '..ollmmmmddo..',
  '.ollmmmmmddo..',
  '.olmmmmmdddo..',
  '.ollmmmmdddo..',
  '.olmmmmmmddo..',
  'ollmmmmmdddo..',
  'olmmmmmmddddo.',
  'olmmmmmdddddo.',
  '.ommmdddddddo.',
  '..oooooooooo..'
];
// [AJUSTE] Colores del pilar según el ESCENARIO: el tipo del gimnasio (la etiqueta del rival: «Agua» contra Misty, «Roca» contra Brock...). Si el rival no tiene un tipo
// (un Campeón, el Campo de Entrenamiento), se usa el primer tipo de su primer Pokémon. l = luz · m = medio · d = sombra · o = borde y grietas
const PIL_THEMES = {
  normal:    {l:'#d6d9e0', m:'#9ca1ad', d:'#676d7b', o:'#23262f'},
  roca:      {l:'#d9cdb4', m:'#a8997a', d:'#73674f', o:'#2b2418'},
  agua:      {l:'#cfeeff', m:'#6cb4ee', d:'#2f6fb8', o:'#12305c'},
  electrico: {l:'#fff6b0', m:'#f2cf3a', d:'#b08a12', o:'#4a3a05'},
  planta:    {l:'#c9f29a', m:'#6fbf4a', d:'#3b7d2c', o:'#173a12'},
  veneno:    {l:'#e6b8f2', m:'#a45cc0', d:'#6a3285', o:'#2d1239'},
  psiquico:  {l:'#ffc9e3', m:'#ee6fa8', d:'#a83a72', o:'#451230'},
  fuego:     {l:'#ffd08a', m:'#f07a2a', d:'#a8401a', o:'#3d1408'},
  tierra:    {l:'#ecd9a0', m:'#c9a65a', d:'#8a6c30', o:'#3a2a0e'},
  hielo:     {l:'#f0fdff', m:'#a5e3f0', d:'#5aa9c4', o:'#1c4a5c'},
  lucha:     {l:'#f2b6a0', m:'#c8553a', d:'#8a2f1e', o:'#3a110a'},
  fantasma:  {l:'#c9c0f0', m:'#7a68b8', d:'#463a80', o:'#1b1438'},
  dragon:    {l:'#c4b8ff', m:'#7558f0', d:'#4530a8', o:'#190f4a'},
  acero:     {l:'#eef1f6', m:'#b4bcc9', d:'#7a8494', o:'#272c36'},
  volador:   {l:'#e6ecff', m:'#a9b8f0', d:'#6f7fc0', o:'#252c52'},
  bicho:     {l:'#e0ef9a', m:'#a8bf2a', d:'#6c7d14', o:'#2c3306'},
  siniestro: {l:'#b4a59a', m:'#70584a', d:'#44332a', o:'#1a120d'},
  hada:      {l:'#ffe0ee', m:'#f29ac0', d:'#c0608a', o:'#4a1f33'}
};
function pilTheme(){                                                 // el tema de este combate (se decide una vez)
  if(g.pilTh) return g.pilTh;
  let k = String((g.o && g.o.tag) || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if(!PIL_THEMES[k]) k = (g.e[0] && g.e[0].m && g.e[0].m.types && g.e[0].m.types[0]) || 'normal';
  return g.pilTh = PIL_THEMES[k] ? k : 'normal';
}
const PIL_CRACK = [[[6,3],[6,4],[5,5],[5,6],[6,7]], [[9,8],[8,9],[8,10],[9,11],[4,10],[4,11]], [[7,8],[7,9],[6,10],[6,11],[7,12],[10,5],[9,6],[3,7],[3,8]]];   // grietas que se van sumando (columna, fila)
const pilCache = {};
function pilSprite(cell, dmg, flash, th){                                // el dibujo ya hecho para ese tamaño y ese estado (se pinta una sola vez)
  const key = th + '|' + cell + '|' + dmg + '|' + (flash ? 1 : 0), PIL_COL = PIL_THEMES[th]; if(pilCache[key]) return pilCache[key];
  const c = document.createElement('canvas'); c.width = 14 * cell; c.height = PIL_ART.length * cell; const x = c.getContext('2d');
  PIL_ART.forEach((row, j) => { for(let i = 0; i < 14; i++){ const ch = row[i]; if(ch === '.') continue; x.fillStyle = flash && ch !== 'o' ? '#ffffff' : PIL_COL[ch]; x.fillRect(i * cell, j * cell, cell, cell); } });
  x.fillStyle = PIL_COL.o; for(let k = 0; k < dmg; k++) PIL_CRACK[k].forEach(([i, j]) => x.fillRect(i * cell, j * cell, cell, cell));
  return pilCache[key] = c;
}
function pilDrawOld(p){
  const r = p.r, y0 = p.y + 22, e = r * .38, k = p.fall > 0 ? clamp(p.fall / PIL.fall, 0, 1) : 0, up = k * k * 560;
  const cell = Math.max(2, Math.round(r * 2.5 / 14)), im = pilSprite(cell, clamp(Math.ceil(PIL.hp - p.hp), 0, 3), p.hitT > 0, pilTheme());
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${(.36 * (1 - k * .7)).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(p.x + 5 * (1 - k), y0 + 3, r * 1.35 * (1 - k * .6), e * 1.2 * (1 - k * .6), 0, 0, 6.3); ctx.fill();   // sombra (avisa de dónde va a caer)
  if(!k && PIL.life - p.age < 2.5) ctx.globalAlpha = .55 + .45 * Math.sin(g.t * 20);                                                                                                            // a punto de deshacerse
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(im, Math.round(p.x - im.width / 2), Math.round(y0 + cell - im.height - up));
  ctx.restore();
}

// ---- PILARES CON DIBUJO: objetos/pilares.png (18 filas = 18 tipos, en el orden de PIL_THEMES; 7 columnas: entero · entero · agrietado · se inclina · cae y se parte · estalla · ruinas) ----
const PIL_IMG = {ok:false, xs:[0,61,124,188,286,382,497,572], ys:[0,62,121,182,239,295,352,408,465,521,577,632,688,744,799,854,910,966,1024],
  rows:['normal','roca','agua','electrico','planta','veneno','psiquico','fuego','tierra','hielo','lucha','fantasma','dragon','acero','volador','bicho','siniestro','hada']};
{ const i = new Image(); i.onload = () => { PIL_IMG.ok = true; }; i.src = 'objetos/pilares.png?v=1'; PIL_IMG.img = i; }
function pilFrame(th, c, x, base, flip, alpha, dy){                  // dibuja el cuadro c del pilar de ese tipo con la base en (x, base)
  const r = Math.max(0, PIL_IMG.rows.indexOf(th)), X = PIL_IMG.xs, Y = PIL_IMG.ys, S = PIL.r / 11;
  const sx = X[c] + 2, sw = X[c + 1] - X[c] - 3, sy = Y[r] + 2, sh = Y[r + 1] - Y[r] - 3, dw = sw * S, dh = sh * S;
  ctx.save(); if(alpha < 1) ctx.globalAlpha *= alpha; ctx.imageSmoothingEnabled = false; ctx.translate(Math.round(x), Math.round(base + 6 * S - (dy || 0)));
  if(flip) ctx.scale(-1, 1);
  ctx.drawImage(PIL_IMG.img, sx, sy, sw, sh, Math.round(-dw / 2), Math.round(-dh), Math.round(dw), Math.round(dh)); ctx.restore();
}
function pilDraw(p){
  if(!PIL_IMG.ok) return pilDrawOld(p);
  const r = p.r, y0 = p.y + 22, e = r * .38, k = p.fall > 0 ? clamp(p.fall / PIL.fall, 0, 1) : 0, up = k * k * 560, th = pilTheme(), dmg = clamp(Math.ceil(PIL.hp - p.hp), 0, 3);
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${(.36 * (1 - k * .7)).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(p.x + 5 * (1 - k), y0 + 3, r * 1.35 * (1 - k * .6), e * 1.2 * (1 - k * .6), 0, 0, 6.3); ctx.fill();   // sombra (avisa de dónde va a caer)
  if(!k && PIL.life - p.age < 2.5) ctx.globalAlpha = .55 + .45 * Math.sin(g.t * 20);                                                                                                            // a punto de deshacerse
  pilFrame(th, dmg >= 2 ? 2 : 0, p.x + (p.hitT > 0 ? (Math.random() - .5) * 5 : 0), y0, false, 1, up);                                                                                           // al recibir un golpe tiembla; con poca vida sale agrietado
  ctx.restore();
}
function pilFxDraw(f){                                               // restos de un pilar que se ha roto: se inclina, se parte, estalla y quedan las ruinas (solo visual)
  const a = g.t - f.t0, th = f.th, flip = f.seed > .5; if(a < 0 || a > 1.7) return;
  const c = a < .14 ? 3 : a < .3 ? 4 : a < .55 ? 5 : 6, al = a > 1.2 ? clamp((1.7 - a) / .5, 0, 1) : 1;
  pilFrame(th, c, f.x, f.y + 22, flip, al, 0);
}
function drawF(f, col){
  if(f.ghost || (g.mega && g.mega.f === f)) return;   // en pleno cambio (o megaevolucionando): lo dibuja su animación (swap.js / mega.js)
  const I = idleInfo(f.m.dex);
  const hid = f.hide > 0, lg = fxLunge(f); lg.y -= (typeof fxLift === 'function' ? fxLift(f) : 0) + (f.jump && typeof nvJumpLift === 'function' ? nvJumpLift(f) : 0);                                   // hide: bajo tierra (Excavar) · lg: avance visual al atacar
  if(!hid) shadow(f.x, f.y + I.foot*ESCALA - 2, Math.max(30, I.fw*ESCALA*.42));
  const inv = f.inv > 0 && !f.dead && !f.jump; if(inv){ ctx.save(); ctx.globalAlpha = .5; }                                               // esquivando con la carrera: se ve translúcido
  const okSpr = hid || (f.spin && !f.dead && typeof nvShellDraw === 'function' && nvShellDraw(f, lg)) || drawFrame(ctx, f.m.dex, f.act, f.at, f.dir, f.x + lg.x, f.y + lg.y, ESCALA, 0, f.shiny);      // Torbellino de Squirtle y familia: el caparazón en vez del sprite (js/fxnuevos.js)
  if(inv) ctx.restore();
  if(!hid && !okSpr && sheet(f.m.dex, 'Idle', false).bad){      // sin sprite (de verdad, no solo cargando): círculo
    ctx.fillStyle = TC[f.m.types[0]]; ctx.beginPath(); ctx.arc(f.x + lg.x, f.y + lg.y, 30, 0, 7); ctx.fill();
    text(f.m.name[0], f.x + lg.x, f.y+8 + lg.y, 20, '#10141e', 'center');
  }
  if(f.buff > 0 && !hid) fxAura(f, I);                                         // aura de la mejora activa (5 s)
  if(!hid && !f.dead && hasStatus(f)) fxStatusAura(f, I);                      // aura del estado (paralizado, veneno, quemadura, sueño, confusión)
  if(!f.dead) bar(f.x-30, f.y + I.top*ESCALA - 14, 60, 7, f.hp, f.max, col);
  if(!f.dead && hasStatus(f)) statusChips(f, f.x-30, f.y + I.top*ESCALA - 26, 28, 10, 6);   // etiquetas PAR · TOX · QUE · DRM · CNF
}

// Cuadritos del equipo (debajo de tu tarjeta): posición en el mundo del juego. La usan hud() para dibujarlos y ui.js para saber si hiciste clic en uno.
const ICON_K = 1.3;                                       // tamaño de TUS cuadritos del equipo (1 = pequeños como antes; más = más grandes, y se separan solos)
const HUD_H = 90, ICON_DY = 98;                           // alto de la tarjeta de Pokémon y dónde empiezan los cuadritos del equipo (debajo de ella)
function hudIconRect(i){ const k = HUD_SCALE; return {x:(10 + i*52*ICON_K) * k, y:(10 + ICON_DY) * k, w:46 * ICON_K * k, h:46 * ICON_K * k}; }
function hudIconAt(mx, my){                      // nº del cuadrito que hay en (mx, my), o -1
  if(!g || g.over) return -1;
  for(let i = 0; i < myList().length; i++){ const r = hudIconRect(i); if(mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) return i; }
  return -1;
}
// EQUIPO RIVAL OCULTO (Clasificatoria y Campo de pruebas): los cuadritos del rival enseñan «?» hasta que ese Pokémon sale al campo.
// Se apunta FUERA del estado del combate (WeakSet), así no cambia la huella del combate online (js/pvp.js).
const FOE_SEEN = new WeakSet();
function foeHidden(){ return !!(g && ((g.pvp && typeof pvp !== 'undefined' && pvp && pvp.match && pvp.match.ranked) || (g.o && g.o.pruebas))); }
function hud(x, y, list, idx, col){
  const f = list[idx], w = 340, r = f.hp / f.max, side = list === g.p ? 'p' : 'e', t = performance.now() / 1000;
  const hid = list !== myList() && foeHidden(); if(list !== myList()) FOE_SEEN.add(f);       // el que está en el campo ya se ha visto
  hudBox(x, y, w, HUD_H, f.m.isMega ? hue(t * 140, .85) : col);                                           // megaevolucionado: borde arcoíris
  ctx.fillStyle = '#0a0d15'; ctx.fillRect(x+8, y+10, 56, 56);                // retrato
  ctx.strokeStyle = f.m.isMega ? hue(t * 140 + 90, .9) : col; ctx.lineWidth = 1; ctx.strokeRect(x+8.5, y+10.5, 55, 55);
  drawFrame(ctx, f.m.dex, 'Idle', 0, 0, x+36, y+38, 2, 50, f.shiny);
  if(hasStatus(f)) statusChips(f, x+8, y+55, 27, 11, 6);                    // estado en el retrato
  text(f.m.name.toUpperCase(), x+74, y+24, f.m.name.length > 9 ? 8 : 10);                 // nombres largos (Mega-Charizard X...) un poco más pequeños para no tapar los tipos
  f.m.types.forEach((t,j)=>{
    const tx = x + w - 8 - 64*(f.m.types.length - j);
    ctx.fillStyle = TC[t]; ctx.fillRect(tx, y+12, 60, 12);
    text(t.toUpperCase(), tx+30, y+21, 6, '#10141e', 'center');
  });
  const bx = x + 92, bw = 236;                                               // barras con su etiqueta (PS = vida · EN = energía)
  text('PS', x+74, y+42, 7, '#c9d6f5'); text('EN', x+74, y+54, 6, '#7fa8d8');
  bar(bx, y+32, bw, 12, f.hp, f.max, r > .5 ? '#4ccf6a' : r > .2 ? '#e8c33a' : '#e8493a');
  [.5, .2].forEach(m => { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(Math.round(bx + 1 + (bw - 2) * m), y+33, 1, 10); });     // marcas del 50 % y del 20 % (donde la barra cambia de color)
  bar(bx, y+48, bw, 5, f.en, 100, '#4fb3ff');
  text(`${Math.ceil(f.hp)}/${Math.ceil(f.max)}`, x+328, y+68, 8, '#fff', 'right');
  {                                                                                                        // objeto (1ª línea) y habilidad (2ª línea): ya no se pisan ni desaparece la habilidad
    let tx = x+74;
    const im = f.item && itemImg(f.item);
    if(im && im.ok){ ctx.imageSmoothingEnabled = false; ctx.drawImage(im, tx, y+56, 16, 16); tx += 19; }
    if(f.item) text(ITEMS[f.item].n.toUpperCase(), tx, y+68, 6, '#c9d6f5');
    if(f.ab){ const ab = f.ab.toUpperCase(); ctx.font = `6px ${FONT}`; const aw = ctx.measureText(ab).width;
      ctx.fillStyle = 'rgba(155,226,155,.14)'; ctx.fillRect(x+74, y+73, aw + 12, 11); ctx.strokeStyle = 'rgba(155,226,155,.45)'; ctx.lineWidth = 1; ctx.strokeRect(x+74.5, y+73.5, aw + 11, 10);
      text(ab, x+80, y+81, 6, '#9be29b'); }
  }
  list.forEach((u,i)=>{                                                      // mini-iconos del equipo
    const K = list === myList() ? ICON_K : 1, px = x + i*52*K, py = y + ICON_DY;
    ctx.save(); ctx.translate(px, py); ctx.scale(K, K); ctx.translate(-px, -py);          // tus cuadritos se dibujan más grandes
    ctx.fillStyle = 'rgba(16,20,30,.9)'; ctx.fillRect(px, py, 46, 46);
    ctx.strokeStyle = i === idx ? '#ffcc33' : 'rgba(255,255,255,.25)'; ctx.lineWidth = i === idx ? 2 : 1; ctx.strokeRect(px+.5, py+.5, 45, 45);
    if(hid && !FOE_SEEN.has(u)){                                               // aún no ha salido: Poké Ball gris con «?»
      ctx.fillStyle = '#2a3148'; ctx.beginPath(); ctx.arc(px+23, py+21, 13, 0, 7); ctx.fill();
      ctx.fillStyle = '#1a2033'; ctx.beginPath(); ctx.arc(px+23, py+21, 13, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#10131f'; ctx.fillRect(px+10, py+20, 26, 2); ctx.beginPath(); ctx.arc(px+23, py+21, 4, 0, 7); ctx.fill();
      text('?', px+23, py+42, 9, '#8a94b0', 'center');
      ctx.restore(); return;
    }
    ctx.globalAlpha = u.dead ? .35 : 1;
    drawFrame(ctx, u.m.dex, 'Idle', 0, 0, px+23, py+20, 1, 34, u.shiny);
    bar(px+4, py+37, 38, 5, u.hp, u.max, '#4ccf6a'); ctx.globalAlpha = 1;
    if(u.dead){ ctx.save(); ctx.strokeStyle = 'rgba(232,73,58,.9)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(px+13, py+10); ctx.lineTo(px+33, py+30); ctx.moveTo(px+33, py+10); ctx.lineTo(px+13, py+30); ctx.stroke(); ctx.restore(); }   // ✖ = debilitado
    { const ready = u.megaKey && !u.megaDone && !u.dead, done = u.m.isMega, blocked = ready && megaUsed(side);                    // «M» de megaevolución: arcoíris = lista · rosa = ya megaevolucionó · gris = otra mega ya usada
      if(ready || done){ const mx = px + 31, my = py + 3; ctx.fillStyle = done ? '#ff6ad8' : blocked ? '#3a4258' : hue(t * 200 + i * 60, .95); ctx.fillRect(mx, my, 13, 12); text('M', mx + 2, my + 10, 8, blocked ? '#7a86a6' : '#10141e'); } }
    if(list === myList()){                                                        // solo tus cuadritos: se pueden pulsar para cambiar de Pokémon
      const can = !u.dead && i !== idx, wait = can && myCd() > 0, hov = hudIconAt(mouse.x, mouse.y) === i;
      if(wait){                                                              // en espera: se oscurece y muestra los segundos que faltan
        ctx.fillStyle = 'rgba(5,7,12,.62)'; ctx.fillRect(px+1, py+1, 44, 44);
        ctx.fillStyle = '#ffcc33'; ctx.fillRect(px+1, py+43, 44 * Math.min(1, myCd() / SWITCH_CD), 2);          // barrita que se vacía
        text(String(Math.ceil(myCd())), px+23, py+30, 16, '#ffcc33', 'center');
      }
      if(hov && can){ ctx.strokeStyle = wait ? '#ff9a3a' : '#7dffa0'; ctx.lineWidth = 2; ctx.strokeRect(px+1, py+1, 44, 44); }
      text(ctlShort('sw' + (i + 1)).slice(0, 3), px+6, py+11, 7, can ? '#c9d6f5' : 'rgba(201,214,245,.4)');          // la tecla que hace lo mismo (1 · 2 · 3)
    }
    ctx.restore();
  });
  if(list === myList()){                                                          // mensajes bajo los cuadritos
    const hv = hudIconAt(mouse.x, mouse.y), ty = y + ICON_DY + 46 * ICON_K + 12;
    if(g.swNote > 0) text(`ESPERA ${Math.ceil(myCd())} s PARA CAMBIAR`, x, ty, 7, '#ff9a3a');
    else if(hv >= 0 && hv !== idx && !list[hv].dead) text(myCd() > 0 ? `ESPERA ${Math.ceil(myCd())} s` : `CAMBIAR A ${list[hv].m.name.toUpperCase()}`, x, ty, 7, '#7dffa0');
    else if(g.clock < (typeof TOUCH !== 'undefined' && TOUCH.on ? 4 : 8) && g.count <= 0 && !g.over) text(typeof TOUCH !== 'undefined' && TOUCH.on ? 'TOCA UN CUADRO PARA CAMBIAR' : `CLIC EN UN CUADRO O TECLAS ${ctlShort('sw1')} · ${ctlShort('sw2')} · ${ctlShort('sw3')} PARA CAMBIAR`, x, ty, 6, 'rgba(201,214,245,.75)');
  }
}

// Dónde cae el mundo (W × H) dentro del lienzo. Normal: lo llena entero. Combate online: arena fija PVP_W × H, centrada y sin deformar (barras oscuras a los lados si la ventana es más ancha)
const VIEW = {sx: 1, sy: 1, ox: 0, oy: 0};
function viewCalc(){
  if(LOCKW){ const vw = typeof prOn === 'function' && prOn() ? PR.SW : W, s = Math.min(cv.width / vw, cv.height / H); VIEW.sx = VIEW.sy = s; VIEW.ox = (cv.width - vw * s) / 2; VIEW.oy = (cv.height - H * s) / 2; }   // Campo de pruebas (js/pruebas.js): la pantalla mide PR.SW aunque el mundo sea más ancho
  else{ VIEW.sx = cv.width / W; VIEW.sy = cv.height / H; VIEW.ox = VIEW.oy = 0; }
}
function draw(){
  const PRV = typeof prOn === 'function' && prOn(), want = PRV ? PR.W : g && g.pvp ? PVP_W : 0;      // PRV = Campo de pruebas: vista de estadio (js/pruebas.js)
  if(want !== LOCKW){ LOCKW = want; resize(); }                        // al entrar o salir de un combate online
  viewCalc();
  if(LOCKW){ ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#05070c'; ctx.fillRect(0, 0, cv.width, cv.height); }
  ctx.setTransform(VIEW.sx, 0, 0, VIEW.sy, VIEW.ox, VIEW.oy);
  ctx.clearRect(0,0,W,H);
  if(!g){ if(['dexv','teamv','torrev'].some(v => !$(v).classList.contains('hide'))) return;   // pantallas que tapan todo el lienzo: no gastar batería en dibujar el fondo del menú
    menuBg(performance.now()/1000); return; }
  const WW = W;                                    // ancho del mundo (en el Campo de pruebas es mayor que la pantalla)
  ctx.save(); fxShakeApply();                      // temblor de pantalla (solo el campo, no el HUD)
  g.zk = (g.zk || 0) + ((g.slowT > 0 ? 1 : 0) - (g.zk || 0)) * .16;                               // remate final: la cámara se acerca al Pokémon que cae (FEEL.zoom) y vuelve
  if(g.zk > .01 && g.zoomAt && !PRV){ const z = 1 + FEEL.zoom * g.zk; ctx.translate(g.zoomAt.x, g.zoomAt.y); ctx.scale(z, z); ctx.translate(-g.zoomAt.x, -g.zoomAt.y); }
  if(PRV){ W = PR.SW; prBack(); W = WW; prCam(); }   // estadio de fondo y «cámara» que coloca el campo sobre su suelo
  else arena();
  fxhdGround();                                    // marcas en el suelo de los ataques (js/fxhd3.js)
  const P = g.p[g.pi], E = g.e[g.ei], M = myMon(), gm = g.me === 'e';        // M = el Pokémon que controlas tú (en un combate online el invitado lleva el bando 'e')

  terrDraw();                                      // zonas de terreno (brasas, hielo, charco...)
  windDraw();                                      // carril del ataque fuerte que se está cargando
  swingDraw();                                     // forma del golpe cuerpo a cuerpo
  [[P, gm ? '#ff5a5a' : '#4ccf6a'], [E, gm ? '#4ccf6a' : '#ff5a5a']].map(([f, c]) => ({y:f.y, d:() => drawF(f, c)}))
    .concat((g.pil || []).map(p => ({y:p.y, d:() => pilDraw(p)}))).concat((g.pilFx || []).map(f => ({y:f.y - 1, d:() => pilFxDraw(f)}))).sort((a, b) => a.y - b.y).forEach(o => o.d());      // Pokémon y pilares, de atrás hacia delante
  g.shots.slice().sort((a, b) => (a.hold > 0 && a.lose ? 0 : 1) - (b.hold > 0 && b.lose ? 0 : 1)).forEach(s=>{       // en un choque, el disparo que gana se pinta encima del que pierde
    if(fxShot(s)) return;                          // proyectil con sprite; si no, el círculo de siempre
    ctx.save(); ctx.fillStyle = TC[s.type]; ctx.shadowColor = TC[s.type]; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); ctx.restore();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.stroke();
  });
  fxhdBegin();                                     // efectos HD (js/fxhd.js): guarda el cuadro antes de los efectos
  fxDraw();                                        // impactos, golpes, polvo y partículas
  fxhdDraw(); fxhdEnd();                           // efectos HD: luces, golpes, carga y brillo (bloom)
  swapDraw();                                      // animación de cambio de Pokémon (rayo, Poké Ball y destello)
  megaDraw();                                      // animación de megaevolución (js/mega.js)
  if(!PRV) abDrawWeather();                        // clima (sol, lluvia, granizo, arena): js/abilities.js
  ctx.restore();
  if(PRV){ W = PR.SW; abDrawWeather(); }          // Campo de pruebas: el clima cubre toda la pantalla y el HUD se dibuja con el ancho de la pantalla (W se repone al final)
  if(typeof nvBannerDraw === 'function') nvBannerDraw();          // cartel grande de algunos ataques fuertes («¡Rayo Solar!») y la pantalla que se oscurece un instante (js/fxnuevos.js)
  if(!M.dead && !(typeof TOUCH !== 'undefined' && TOUCH.on)){             // cruz de puntería (con los dedos no se enseña)
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(mouse.x-9, mouse.y); ctx.lineTo(mouse.x+9, mouse.y); ctx.moveTo(mouse.x, mouse.y-9); ctx.lineTo(mouse.x, mouse.y+9); ctx.stroke();
  }
  if(PRV) g.pops.forEach(p => { const [sx, sy] = prW2S(p.x, p.y - (1-p.t)*20); textO(p.txt, sx, sy, p.s || 9, p.c || '#ffe066', 'center'); });   // números del daño: a su sitio en la pantalla
  else g.pops.forEach(p => textO(p.txt, p.x, Math.max(178, p.y - (1-p.t)*20), p.s || 9, p.c || '#ffe066', 'center'));

  if(PRV) prTopBegin();                            // Campo de pruebas: los paneles de arriba van a la escala del estadio (js/pruebas.js)
  hudAt(0, 0, () => hud(10, 10, myList(), myIdx(), '#4a8cff'));
  hudAt(W, 0, () => hud(W-350, 10, oppList(), oppIdx(), '#ff4a5a'));
  abDrawHud();                                                               // clima activo (js/abilities.js)

  // Panel central: piso y temporizador
  const s = g.clock | 0;
  hudAt(W/2, 0, () => {
  hudBox(W/2-110, 8, 220, 52, '#4a8cff');
  text(g.pvp ? (g.o.estadio ? 'CLASIFICATORIA' : 'ONLINE') : g.o.pruebas ? 'PRUEBAS' : g.o.torre ? 'TORRE · PISO ' + g.o.floor : g.o.title ? 'CAMPO' : 'PISO ' + g.o.floor, W/2, 29, 12, '#ffcc33', 'center');
  text(`${(s/60|0)}:${String(s%60).padStart(2,'0')}`, W/2, 49, 10, '#fff', 'center');
  { ctx.font = `8px ${FONT}`; const sw = ctx.measureText(g.o.sub).width + 16; ctx.fillStyle = 'rgba(8,10,20,.62)'; ctx.fillRect(W/2 - sw/2, 64, sw, 16); }       // fondo tras el subtítulo para que se lea
  textO(g.o.sub, W/2, 76, 8, '#c9d6f5', 'center');
  const L = leaderImg(g.o.leader, g.o.portrait);                                             // retrato del líder
  if(L && L.ok){                                                                             // en un marco, a la izquierda del panel (antes iba debajo y se mezclaba con el subtítulo y el aviso del clima)
    const fx0 = W/2 - 110 - 8 - 52, k = Math.min(44 / L.width, 44 / L.height), w = L.width * k, h = L.height * k;
    hudBox(fx0, 8, 52, 52, '#4a8cff');
    ctx.imageSmoothingEnabled = false; ctx.drawImage(L, fx0 + 26 - w/2, 34 - h/2, w, h);
  }
  });
  if(PRV) prTopEnd();
  if(!(typeof TOUCH !== 'undefined' && TOUCH.on)) text(g.pvp ? 'ESC · MENÚ' : 'ESC · PAUSA', W - 14, H - 12, 6, '#6d7899', 'right');   // con los dedos está el botón II
  if(g.count > 0) text(String(Math.ceil(g.count)), W/2, H/2+22, 64, '#ffcc33', 'center');

  if(!(typeof TOUCH !== 'undefined' && TOUCH.on)){   // con pantalla táctil, la barra de ataques la sustituyen los botones (js/touch.js)
  // Barra de ataques, centrada abajo
  ctx.save(); ctx.translate(W/2, H); ctx.scale(HUD_SCALE, HUD_SCALE); ctx.translate(-W/2, -H);       // reducida desde el borde de abajo
  if(PRV) ctx.globalAlpha = prBarAlpha();          // Campo de pruebas: transparente si un Pokémon pasa por detrás
  const bw = 104, gap = 8, tw = 5*bw + 4*gap + 24, x0 = (W - tw)/2, y0 = H - 82;
  // Barra de energía grande, siempre visible, con las marcas de Q (20) y E (40) y el tiempo que falta
  { const ey = y0 - 38, bx = x0 + 78, bwid = tw - 78 - 12, bh = 10, by = ey + 16;
    hudBox(x0, ey, tw, 34, '#4fb3ff');
    text('ENERGÍA', x0 + 12, by + 8, 7, '#4fb3ff');
    bar(bx, by, bwid, bh, M.en, 100, '#4fb3ff');
    [3, 4].forEach(i => { const k = ctlKey(i).slice(0, 4);
      const need = Math.round(enCost(M, i)), mx = bx + 1 + (bwid - 2) * need / 100, ready = M.en >= need, col = i === 3 ? '#b07bff' : '#ffcc33';
      ctx.fillStyle = col; ctx.fillRect(Math.round(mx) - 1, by - 3, 2, bh + 6);
      const wait = Math.max(0, (need - M.en) / EN_REGEN);
      text(`${k} ${need}` + (ready ? ' ✔' : ` · ${wait.toFixed(1)}s`), mx, by - 5, 6, ready ? '#9be29b' : col, 'center');
    });
    text(String(Math.floor(M.en)), bx + bwid - 4, by + 8, 7, '#fff', 'right'); }
  hudBox(x0, y0, tw, 72, '#4a8cff');
  MV.forEach((m,i)=>{
    const x = x0 + 12 + i*(bw+gap), y = y0 + 10, h = 52, cost = Math.round(enCost(M, i));      // cost: energía real (Presión del rival)
    const enWait = Math.max(0, (cost - M.en) / EN_REGEN), cdWait = Math.max(0, M.cd[i]), wait = Math.max(enWait, cdWait);   // segundos hasta poder usarlo
    const ok = wait <= 0;
    const col = i === 0 ? '#9aa6b8' : i === 3 ? '#b07bff' : TC[mtype(M, i)];
    ctx.fillStyle = '#161c2c'; ctx.fillRect(x, y, bw, h);
    ctx.strokeStyle = ok ? col : '#2c3550'; ctx.lineWidth = 2; ctx.strokeRect(x+1, y+1, bw-2, h-2);
    const kl = ctlKey(i).slice(0, 7);                                                          // tecla de ese ataque (configurable: Ajustes › Controles)
    ctx.fillStyle = ok ? col : '#2c3550'; ctx.fillRect(x+4, y+4, kl.length*6 + 6, 10);      // tecla
    text(kl, x+7, y+12, 6, '#10141e');
    const nm = mvName(M, i).toUpperCase();
    text(nm, x+bw/2, y+32, nm.length > 10 ? 7 : 8, ok ? '#fff' : '#6d7899', 'center');
    if(ok && (i === 1 || i === 2)) text((i === 1 ? meleeKind(M) : shotKind(M)).n.toUpperCase(), x+bw/2, y+43, 6, col, 'center');      // forma del ataque (combat.js)
    if(m.en) text('EN ' + cost, x+bw-5, y+14, 6, M.en >= cost ? '#4fb3ff' : '#e8493a', 'right');
    if(m.en){ const fr = Math.min(1, M.en / cost); ctx.fillStyle = '#05070c'; ctx.fillRect(x+4, y+h-6, bw-8, 3);          // mini barra de energía de ese ataque
      ctx.fillStyle = fr >= 1 ? '#9be29b' : '#4fb3ff'; ctx.fillRect(x+4, y+h-6, (bw-8)*fr, 3); }
    if(!ok){
      const total = Math.max(m.cd, cost / EN_REGEN, .01);
      ctx.fillStyle = 'rgba(5,7,12,.72)'; ctx.fillRect(x+2, y+2, bw-4, (h-4) * Math.min(1, wait/total));
      text(wait.toFixed(1) + 's', x+bw/2, y+47, 8, cdWait >= enWait ? '#fff' : '#4fb3ff', 'center');       // blanco = enfriamiento · azul = falta energía
    }
  });
  ctx.restore();
  if(PRV){ ctx.save(); ctx.globalAlpha = PR.barA || 1; megaHud(); ctx.restore(); } else
  megaHud();                                       // aviso «R · MEGAEVOLUCIÓN» (js/mega.js)
  }
  megaTop();                                       // destello y cartel de la megaevolución, encima de todo
  if(g.pvp) pvpDraw();                             // combate online: avisos de conexión (js/pvp.js)
  if(typeof touchDraw === 'function') touchDraw();  // joystick y botones táctiles (js/touch.js)
  if(PRV){ prFront(); W = WW; }                    // Campo de pruebas: cartel de megaevolución y línea de abajo; se repone el ancho del mundo
}

let last = performance.now();
function loop(now){
  const dt = Math.min(.05, (now-last)/1000); last = now;
  if(g && g.pvp) pvpFrame(dt);                     // combate online: pasos fijos sincronizados con el rival (js/pvp.js)
  else if(fxhd.stop > 0 && g && !g.over){ fxhd.stop -= dt; }     // congelado del golpe (js/fxhd.js): el combate se queda quieto un instante
  else update(dt);
  draw(); requestAnimationFrame(loop);
}
