"use strict";
/* =====================================================================
   ATAQUES DEL VÍDEO «BRENDAN vs STEVEN» (lo que eligió Diego), dibujados por código:
   - PODER PASADO (nuevo, Roca, clic derecho, por MT): un aro dorado con runas bajo el Pokémon, tres rocas con grietas doradas
       se levantan a su lado y salen volando juntas con una estela blanca; al dar, un fogonazo enorme, anillos en el suelo y piedras.
   - HIDROPULSO: una bola de agua con un remolino blanco y ONDAS en forma de media luna que la siguen; al dar, destello blanco con rayos.
   - HIPERRAYO (el de Claydol): se carga una bola naranja con rayitas que se cierran y aros en el suelo; luego un rayo ancho
       con el borde ondulado (rojo, naranja, amarillo y centro blanco), una hélice blanca que lo recorre y una bola gorda en la punta.
   - COMETA DRACO EN ÁREA: ya no es un proyectil. El Pokémon dispara una bola al cielo, estalla arriba y caen METEOROS en la zona
       donde estaba el rival (si se aparta a tiempo, se libra). En el combate online sigue siendo el proyectil de siempre.
   - PSÍQUICO (el de Gardevoir): una onda rosa; al dar, anillos rosas y blancos envuelven al rival, lo levantan y sale despedido
       dejando una nube rosa.
   - EMPUJÓN FUERTE («¡DERRIBADO!»): si un golpe te lanza lejos, el Pokémon sale arrastrándose por el suelo (polvo y dos surcos
       que se quedan) y se queda TUMBADO un momento (su animación de debilitarse, la de sus sprites) antes de levantarse.
   BR.on = false apaga todo lo de este archivo (vuelve a lo de antes).
   ===================================================================== */
const BR = {on: true, kdMin: 2600, lie: .5};                              // [AJUSTE] encendido · velocidad del empujón (px/s) a partir de la que te derriba · segundos tumbado
const brClamp = v => Math.max(0, Math.min(1, v));
const brEase = v => 1 - Math.pow(1 - brClamp(v), 3);
function brGlow(x, y, r, rgb, A){ if(r <= 0 || A <= 0) return; ctx.save(); const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${A})`); gr.addColorStop(.45, `rgba(${rgb},${A * .55})`); gr.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); ctx.restore(); }
function brRays(x, y, r0, r1, n, rot, col, lw, A){ ctx.save(); ctx.globalAlpha = A; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath();
  for(let i = 0; i < n; i++){ const an = rot + i / n * 6.283, k = .75 + .25 * HH(i, 7); ctx.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0); ctx.lineTo(x + Math.cos(an) * r1 * k, y + Math.sin(an) * r1 * k); } ctx.stroke(); ctx.restore(); }
function brRing(x, y, r, sy, col, lw, A){ if(r <= 0 || A <= 0) return; ctx.save(); ctx.globalAlpha = A; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.ellipse(x, y, r, r * sy, 0, 0, 6.283); ctx.stroke(); ctx.restore(); }
const brFoot = f => f.y + idleInfo(f.m.dex).foot * ESCALA - 4;
function brOwn(tab, name, fn){ const o = tab[name]; const w = function(){ if(BR.on) return fn.apply(this, arguments); const b = o && (o.draw || o); if(b) return b.apply(this, arguments); }; if(o) Object.assign(w, o); delete w.draw; tab[name] = w; }

// =====================================================================  PODER PASADO
const BR_ROCA = ['#3a2a14', '#b89a62', '#d8c08a', '#f2e2b4'];
function brBoulder(x, y, r, rot, A, glow){                                    // roca con grietas doradas
  ctx.save(); ctx.globalAlpha = A; ctx.translate(x, y); ctx.rotate(rot);
  if(glow) brGlow(0, 0, r * 2.2, '255,230,150', .45 * A);
  const P = [[-1, -.55], [-.35, -1], [.6, -.8], [1, -.1], [.7, .75], [-.25, .95], [-.95, .4]];
  ctx.beginPath(); P.forEach(([px, py], i) => ctx[i ? 'lineTo' : 'moveTo'](px * r, py * r)); ctx.closePath(); ctx.fillStyle = BR_ROCA[1]; ctx.fill(); ctx.strokeStyle = BR_ROCA[0]; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-1 * r, -.55 * r); ctx.lineTo(-.35 * r, -1 * r); ctx.lineTo(.6 * r, -.8 * r); ctx.lineTo(.2 * r, -.15 * r); ctx.lineTo(-.6 * r, -.1 * r); ctx.closePath(); ctx.fillStyle = BR_ROCA[3]; ctx.fill();      // cara de arriba, más clara
  ctx.strokeStyle = '#ffe27a'; ctx.lineWidth = 2; ctx.lineJoin = 'miter'; ctx.beginPath(); ctx.moveTo(-.5 * r, .5 * r); ctx.lineTo(-.1 * r, .05 * r); ctx.lineTo(.35 * r, .35 * r); ctx.lineTo(.2 * r, .7 * r); ctx.moveTo(-.1 * r, .05 * r); ctx.lineTo(.1 * r, -.4 * r); ctx.stroke();   // grietas que brillan
  ctx.restore();
}
FXR.impact._ppCast = (e, a) => {                                             // aro dorado con runas a los pies del que ataca
  const f = e.fol; if(!f || !f.m) return; const x = f.x, y = brFoot(f), u = a / e.dur, A = u < .15 ? u / .15 : Math.max(0, 1 - (u - .55) / .45), R = 46 + 6 * brEase(u / .3);
  brGlow(x, y, R * 1.1, '255,220,120', .18 * A);
  brRing(x, y, R, .42, '#c9a24a', 3, A); brRing(x, y, R * .82, .42, '#ffe8a8', 1.5, A * .8);
  ctx.save(); ctx.globalAlpha = A; ctx.fillStyle = '#ffe8a8';
  for(let i = 0; i < 8; i++){ const an = i / 8 * 6.283 + a * 2.2, px = x + Math.cos(an) * R * .91, py = y + Math.sin(an) * R * .91 * .42; ctx.save(); ctx.translate(px, py); ctx.rotate(an + Math.PI / 2); ctx.beginPath(); ctx.moveTo(-4, 1.5); ctx.lineTo(0, -2.5); ctx.lineTo(4, 1.5); ctx.closePath(); ctx.fill(); ctx.restore(); }
  ctx.restore();
};
const PP = {rise: .55, speed: 560, turn: 9};                                 // [AJUSTE] segundos levitando al lado del Pokémon · velocidad al salir · lo que gira para perseguir (rad/s): solo se esquiva con la carrera
function brPPFlight(s, a, an){
  const P = s.pp, up = P && P.phase === 'up', u = P ? brClamp((g.t - P.t0) / PP.rise) : 1, moving = !up;
  const rocks = up ? [[0, 22, 24, 0], [-9, -24, 17, 1.3], [7, -60, 14, 2.6]]                  // levitando: una encima de otra, como en el vídeo
                   : [[0, 0, 24, 0], [-22, -18, 17, 1.3], [16, -26, 14, 2.6]];                  // volando: juntas
  if(moving){ for(let k = 7; k >= 1; k--){ const b = k * .03; brGlow(s.x - s.vx * b, s.y - s.vy * b - 8, 20 - k * 1.8, '255,250,235', .4 * (1 - k / 8)); } }   // estela blanca
  const ca = Math.cos(an), sa = Math.sin(an), px = -sa, py = ca;
  rocks.forEach(([dx, dy, r, ph], i) => {
    let x, y;
    if(up){ const e = brEase((u - i * .12) / .55), bob = Math.sin(g.t * 6 + i) * 2.5; x = s.x + dx; y = s.y + dy - 30 * e + bob + 26 * (1 - e); if(e <= 0) return; }   // suben una a una
    else { x = s.x + px * dx + ca * dy * .4; y = s.y - 6 + py * dx + sa * dy * .4 + dy * .5; }
    brBoulder(x, y, r, (up ? g.t * .6 : g.t * (1.5 + i * .4)) + ph, 1, !up);
  });
}
// Mecánica: la roca no sale disparada. Se queda levitando PP.rise s al lado del que ataca y luego vuela PERSIGUIENDO al rival.
// Solo se libra si está haciendo la carrera (invulnerable) justo cuando le llega.
function ppStart(f, s){
  const side = s.vx < 0 ? -1 : 1;                                           // se ponen a su lado, hacia el rival (como en el vídeo)
  s.pp = {phase: 'up', t0: g.t, f, ox: side * 56}; s.life = 4; s.dg = true; s.vx0 = s.vx; s.vy0 = s.vy; s.vx = s.vy = 0;      // (dg: mientras levita no golpea a nadie)
  setAct(f, 'Charge', PP.rise);
}
function ppSteer(){
  if(!g || !g.shots) return;
  for(const s of g.shots){ const P = s.pp; if(!P || s.life <= 0) continue;
    const f = P.f;
    if(P.phase === 'up'){
      if(!f || f.dead || f.ghost){ s.life = 0; continue; }
      s.x = f.x + P.ox; s.y = f.y - 10; s.vx = s.vy = 0;
      if(g.t - P.t0 >= PP.rise){ P.phase = 'go'; const T = foe(s.mine), an = T ? Math.atan2(T.y - s.y, T.x - s.x) : Math.atan2(s.vy0, s.vx0); s.vx = Math.cos(an) * PP.speed; s.vy = Math.sin(an) * PP.speed; P.tg = g.t; s.dg = false; if(typeof Sfx !== 'undefined') Sfx.play('shot', .8); }
      continue; }
    if(s.dg) continue;                                                       // ya lo ha esquivado: sigue recto
    const T = foe(s.mine); if(!T || T.dead || T.ghost) continue;
    const dt = Math.min(.05, g.t - (P.last || g.t)); P.last = g.t;
    const want = Math.atan2(T.y - s.y, T.x - s.x), cur = Math.atan2(s.vy, s.vx); let d = want - cur; d = Math.atan2(Math.sin(d), Math.cos(d));
    const na = cur + Math.max(-PP.turn * dt, Math.min(PP.turn * dt, d)); s.vx = Math.cos(na) * PP.speed; s.vy = Math.sin(na) * PP.speed;
  }
}
if(typeof shotClash === 'function'){ const o = shotClash; shotClash = function(){ const r = o.apply(this, arguments); try{ ppSteer(); }catch(e){} return r; }; }
function brPPHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y, gy = y + 18;
  if(!e.brD){ e.brD = 1; if(typeof suCrater === 'function') suCrater(x, gy + 4, 18 * k); if(typeof Sfx !== 'undefined') Sfx.play('boom', .6); }
  const u = a / .55; if(u < 1){ brGlow(x, y - 4, (60 + 60 * brEase(u)) * k, '255,248,215', (1 - u) * .95); brGlow(x, y - 4, (26 + 20 * u) * k, '255,255,255', 1 - u); }
  for(let r = 0; r < 3; r++){ const v = brClamp((a - r * .07) / .6); if(v > 0 && v < 1) brRing(x, gy, (14 + 70 * brEase(v)) * k, .4, '#ffffff', 3 * (1 - v) + 1, 1 - v); }
  for(let i = 0; i < 10; i++){ const t = a - HH(i, 30) * .05; if(t < 0 || t > .8) continue; const vx = (HH(i, 31) - .5) * 220, vy = -140 - HH(i, 32) * 120;
    ctx.save(); ctx.globalAlpha = 1 - t / .8; ctx.fillStyle = i % 3 ? '#9c8460' : '#d8c08a'; const s = 3 + HH(i, 33) * 4; ctx.fillRect(x + vx * t - s / 2, gy - 6 + vy * t + 480 * t * t - s / 2, s, s); ctx.restore(); }
}
{ const N = 'Poder Pasado', B = 'Lanzarrocas';
  if(typeof MOVES !== 'undefined' && !MOVES[N]) MOVES[N] = {t: 'roca', s: 2};
  if(typeof SHOT_MOVE !== 'undefined') SHOT_MOVE[N] = 'pesado';                // un solo disparo lento, grande y fuerte (las tres rocas juntas), sea cual sea el tipo del Pokémon
  FXR.cast[N] = (f, s, name, big, ox, oy, ang) => { fxAdd('impact', '_ppCast', {x: f.x, y: f.y, fol: f, dur: .95}); if(typeof Sfx !== 'undefined') Sfx.play('strong', .5); };
  FXR.shotStart[N] = (f, s, big) => { if(BR.on && !(g && g.pvp)) ppStart(f, s); };   // (online: disparo normal, para no desincronizar)
  FXR.flight[N] = (s, a, an) => brPPFlight(s, a, an);
  FXR.impact[N] = (e, a) => brPPHit(e, a);
  FXC[N] = Object.assign({}, FXC[B], {idur: .85, shake: 2});
  if(typeof LEARN !== 'undefined' && typeof DEX !== 'undefined'){                // la aprenden los de tipo Roca y los de siempre en los juegos (fósiles, legendarios...)
    const ids = new Set(DEX.filter(m => m.types.includes('roca')).map(m => m.dex));
    [138, 139, 140, 141, 142, 144, 145, 146, 151, 185, 213, 219, 221, 222, 246, 247, 248, 249, 250, 251, 337, 338, 345, 346, 347, 348, 369, 377, 378, 379, 408, 409, 410, 411, 438, 468, 469, 473, 476, 483, 484, 486, 487, 488, 564, 565, 566, 567, 696, 697, 698, 699, 703, 719].forEach(d => ids.add(d));
    LEARN[N] = [...ids].sort((p, q) => p - q).join(',');
  }
}

// =====================================================================  HIDROPULSO
FXR.impact._hpCast = (e, a) => {                                             // la bola de agua se forma en la boca
  const u = a / e.dur, A = 1 - u, r = 6 + 10 * brEase(u / .5);
  brGlow(e.x, e.y, r * 2.4, '120,200,255', .5 * A);
  brRing(e.x, e.y, r + 10 + 22 * u, 1, '#ffffff', 2, A * .9); brRing(e.x, e.y, r + 4 + 34 * u, .5, '#bfe6ff', 1.5, A * .7);
};
function brWaterOrb(x, y, r, rot, A){
  ctx.save(); ctx.globalAlpha = A;
  brGlow(x, y, r * 2, '120,200,255', .45 * A);
  const gr = ctx.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r); gr.addColorStop(0, '#bfe9ff'); gr.addColorStop(.55, '#3a9cf0'); gr.addColorStop(1, '#1b5fc0');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); ctx.strokeStyle = '#0d3b8a'; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, r * .55, rot, rot + 2.6); ctx.stroke();      // remolino blanco
  ctx.restore();
}
function brHPFlight(s, a, an){
  const ca = Math.cos(an), sa = Math.sin(an), y0 = s.y - 6;
  for(let k = 3; k >= 1; k--){                                               // ondas en media luna detrás de la bola
    const d = 14 + k * 22 + Math.sin(g.t * 14 + k) * 2, x = s.x - ca * d, y = y0 - sa * d, h = 20 + k * 4 + Math.sin(g.t * 12 + k * 2) * 2, A = .9 - k * .2;
    ctx.save(); ctx.translate(x, y); ctx.rotate(an); ctx.globalAlpha = A;
    ctx.fillStyle = 'rgba(90,170,255,.38)'; ctx.beginPath(); ctx.ellipse(0, 0, 8, h, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0, 0, 8, h, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();      // borde de delante, blanco
    ctx.strokeStyle = '#7cc4ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 0, 8, h, 0, Math.PI / 2, Math.PI * 1.5); ctx.stroke();
    ctx.restore();
  }
  ctx.save(); for(let i = 0; i < 6; i++){ const u = (i / 6 + g.t * 3) % 1, o = (HH(i, 4) - .5) * 16; ctx.globalAlpha = 1 - u; ctx.fillStyle = '#ffffff'; ctx.fillRect(s.x - ca * (14 + u * 70) - sa * o - 1.5, y0 - sa * (14 + u * 70) + ca * o - 1.5, 3, 3); } ctx.restore();   // gotitas
  brWaterOrb(s.x, y0, 14, g.t * 9, 1);
}
function brHPHit(e, a){
  const k = e.k || 1, x = e.x, y = e.y - 4, u = a / .6; if(u >= 1) return;
  brGlow(x, y, (34 + 30 * brEase(u)) * k, '255,255,255', 1 - u);
  brRays(x, y, 14 * k, (40 + 50 * brEase(u)) * k, 10, .3, '#ffffff', 3 * (1 - u) + 1, 1 - u);
  brRing(x, y + 16, (20 + 70 * brEase(u)) * k, .45, '#bfe6ff', 3, (1 - u) * .9);
  brRing(x, y, (16 + 48 * brEase(u)) * k, 1, '#7cc4ff', 2, (1 - u) * .7);
  ctx.save(); for(let i = 0; i < 12; i++){ const t = a - HH(i, 10) * .04; if(t < 0 || t > .55) continue; const an = HH(i, 11) * 6.283, v = 120 + HH(i, 12) * 140; ctx.globalAlpha = 1 - t / .55; ctx.fillStyle = i % 2 ? '#ffffff' : '#7cc4ff'; ctx.fillRect(x + Math.cos(an) * v * t - 2, y + Math.sin(an) * v * t * .8 + 220 * t * t - 2, 4, 4); } ctx.restore();
}
brOwn(FXR.flight, 'Hidropulso', brHPFlight);
brOwn(FXR.impact, 'Hidropulso', brHPHit);
{ const o = FXR.cast['Hidropulso'] || FXR.cast['_']; FXR.cast['Hidropulso'] = function(f, s, name, big, ox, oy, ang){ if(!BR.on) return o && o.apply(this, arguments); fxAdd('impact', '_hpCast', {x: ox, y: oy, dur: .3}); }; }
FXC['Hidropulso'] = Object.assign({}, FXC['Hidropulso'], {idur: .65});

// =====================================================================  HIPERRAYO (como el de Claydol)
const BR_HR = {CH: 0, W: 40};                                                 // CH = 0: la carga ya se ve mientras mantienes la E (js/fxnuevos.js); el rayo sale al soltar
function brHRCharge(e, u){
  const x = e.ox, y = e.oy - 4, fl = e.fol, gy = fl && fl.m ? brFoot(fl) : y + 34, ease = u * u, R = 5 + 9 * ease;
  brGlow(x, y, 44 + 10 * Math.sin(g.t * 20), '255,150,70', .35 * Math.min(1, u * 4));
  brRing(fl ? fl.x : x, gy, 34 + 4 * Math.sin(g.t * 10), .42, '#ffffff', 1.5, .6 * Math.min(1, u * 4)); brRing(fl ? fl.x : x, gy, 22, .42, '#ffd9a8', 1.5, .5 * Math.min(1, u * 4));
  ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineCap = 'round'; ctx.lineWidth = 2;                // rayitas que se cierran hacia la bola
  for(let i = 0; i < 14; i++){ const an = i / 14 * 6.283 + HH(i, 3) * .3, ph = (u * 2.2 + HH(i, 5)) % 1, far = 80 - 52 * ph, near = far - 14 - 8 * HH(i, 6); ctx.globalAlpha = Math.min(1, u * 5) * (1 - ph * .5);
    ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * far, y + Math.sin(an) * far * .9); ctx.lineTo(x + Math.cos(an) * near, y + Math.sin(an) * near * .9); ctx.stroke(); }
  ctx.restore();
  ctx.save(); [[R + 3, '#7a1a00'], [R, '#ff7a1f'], [R * .7, '#ffd24a'], [R * .4, '#ffffff']].forEach(([r, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); }); ctx.restore();
}
function brHRBeam(e){
  const t = e.t || 0; if(t < BR_HR.CH){ brHRCharge(e, t / BR_HR.CH); return; }
  const G = sg(e, 900); if(G.len < 8) return;
  const A = G.al, gw = brClamp((t - BR_HR.CH) / .1), W = BR_HR.W * gw, L = G.len, ca = Math.cos(G.an), sa = Math.sin(G.an), px = -sa, py = ca, N = Math.max(20, Math.floor(L / 6));
  const half = (u, k) => { const ramp = u < .08 ? .55 + .45 * u / .08 : 1; return (W / 2) * ramp * k * (1 + .13 * Math.sin(u * L / 20 - g.t * 16)); };   // borde ondulado
  const band = (k, pad, col, al) => { ctx.globalAlpha = A * (al == null ? 1 : al); ctx.fillStyle = col; ctx.beginPath();
    for(let i = 0; i <= N; i++){ const u = i / N, h = half(u, k) + pad; ctx[i ? 'lineTo' : 'moveTo'](G.x0 + ca * L * u + px * h, G.y0 + sa * L * u + py * h); }
    for(let i = N; i >= 0; i--){ const u = i / N, h = half(u, k) + pad; ctx.lineTo(G.x0 + ca * L * u - px * h, G.y0 + sa * L * u - py * h); }
    ctx.closePath(); ctx.fill(); };
  ctx.save();
  band(1.55, 4, 'rgba(255,110,90,.35)', 1);                                  // brillo rosado alrededor
  band(1, 3.5, '#8a1e0e'); band(1, 0, '#ff5a1e'); band(.78, 0, '#ff9a2a'); band(.55, 0, '#ffd84a'); band(.3, 0, '#fffbe8');
  ctx.globalAlpha = A; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.2; ctx.lineJoin = 'round';  // hélice blanca: dos ondas que se cruzan
  for(let s = 0; s < 2; s++){ ctx.beginPath(); for(let i = 0; i <= N * 2; i++){ const u = i / (N * 2), ph = u * L / 15 - g.t * 22 + s * Math.PI, h = Math.sin(ph) * W * .62 * (u < .08 ? u / .08 : 1); ctx[i ? 'lineTo' : 'moveTo'](G.x0 + ca * L * u + px * h, G.y0 + sa * L * u + py * h); } ctx.stroke(); }
  brGlow(G.x0, G.y0, W * .7, '255,240,200', .9 * A);
  brGlow(G.x1, G.y1, W * 1.1, '255,220,150', .8 * A);                       // bola gorda en la punta
  [[W * .62 + 3, '#ff7a1f'], [W * .62, '#ffd24a'], [W * .42, '#ffffff']].forEach(([r, c]) => { ctx.globalAlpha = A; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(G.x1, G.y1, r * (1 + .06 * Math.sin(g.t * 30)), 0, 6.283); ctx.fill(); });
  ctx.restore();
}
FXC['Hiperrayo'] = Object.assign({}, FXC['Hiperrayo'], {fade: .5});          // el rayo se queda un momento después de dar (como en el vídeo)
// (el rayo lo dibuja js/fxsuelo.js llamando a brHRBeam: así se ve con o sin efectos HD y se sigue dejando el rastro quemado)

// =====================================================================  PSÍQUICO (como el de Gardevoir)
const BR_PSI = ['#5a1050', '#d048b0', '#ff8fd8', '#ffd6f2', '#ffffff'];
function brPsiFlight(s, a, an){
  const ca = Math.cos(an), sa = Math.sin(an), y = s.y - 6;
  for(let k = 0; k < 3; k++){ const ph = (g.t * 3 + k / 3) % 1, d = ph * 40; ctx.save(); ctx.translate(s.x - ca * d, y - sa * d); ctx.rotate(an); ctx.globalAlpha = 1 - ph;
    ctx.strokeStyle = BR_PSI[2]; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 7, 14 + ph * 10, 0, 0, 6.283); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore(); }
  brGlow(s.x, y, 22, '255,140,215', .55);
  ctx.save(); [[9, BR_PSI[1]], [6, BR_PSI[3]], [3, '#ffffff']].forEach(([r, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(s.x, y, r, 0, 6.283); ctx.fill(); }); ctx.restore();
}
function brPsiHit(e, a){
  const T = e.T, k = e.k || 1, x = T ? T.x : e.x, y = T ? T.y - 26 - (typeof fxLift === 'function' ? fxLift(T) : 0) : e.y;
  if(!e.brD){ e.brD = 1; if(T && T.hp > 0 && !T.dead && !T.lift) T.lift = {t0: g.t, dur: .7}; if(T) e.brT = T; }
  const u = a / e.dur;
  if(u < .7){ const v = u / .7, A = v < .15 ? v / .15 : 1 - Math.pow((v - .15) / .85, 2);      // anillos que envuelven al rival
    brGlow(x, y, 54 * k, '255,150,220', .45 * A);
    for(let r = 0; r < 3; r++){ const rr = (58 - 18 * v - r * 13) * k; if(rr <= 4) continue; brRing(x, y, rr, .92, BR_PSI[2], 5, A * .8); brRing(x, y, rr, .92, '#ffffff', 1.8, A); } }
  if(a > .3 && a < .55){ const v = (a - .3) / .25; brGlow(x, y, (40 + 50 * v) * k, '255,190,235', 1 - v); }   // fogonazo rosa
  if(T && a > .25 && a < e.dur && Math.floor(a * 30) !== e.brK){ e.brK = Math.floor(a * 30);       // nube rosa que deja al salir despedido
    SU.fx.push({k: 'rosa', t0: g.t, dur: .9, p: [[T.x + (Math.random() - .5) * 20, T.y - 20 + (Math.random() - .5) * 16, 10 + Math.random() * 8, (Math.random() - .5), Math.random()]]}); }
}
brOwn(FXR.flight, 'Psíquico', brPsiFlight);
brOwn(FXR.impact, 'Psíquico', brPsiHit);
FXC['Psíquico'] = Object.assign({}, FXC['Psíquico'], {idur: 1});

// =====================================================================  COMETA DRACO EN ÁREA
const DR = {n: 7, R: 115, hitR: 64, dmg: .25, maxHits: 4, aim: 26, t0: .75, gap: .17, fall: .3};   // [AJUSTE] meteoros · radio de la zona · radio de cada golpe · daño de cada meteoro (× el del ataque) · golpes como mucho · cuándo cae el primero · separación · segundos que tarda en caer
function dracoStart(f, w, wp){
  const T = foe(w.mine), P = {x: T.x, y: T.y}, dmg = w.dmg * (1 + (FEEL.windK - 1) * wp), met = [];
  for(let i = 0; i < DR.n; i++){ const last = i === DR.n - 1, an = HH(i, g.t * 7) * 6.283, d = last ? 0 : DR.R * (.35 + .65 * HH(i + 3, g.t * 7));
    met.push({t: DR.t0 + i * DR.gap, x: P.x + Math.cos(an) * d, y: P.y + Math.sin(an) * d * .6, done: false, last}); }
  f.draco = {t: 0, met, dmg, type: w.type, mine: w.mine, kbP: wp, hits: 0};
  setAct(f, 'Shoot', .55); if(typeof Sfx !== 'undefined') Sfx.play('strong', w.vk);
  fxAdd('impact', '_dracoCast', {x: f.x, y: f.y, fol: f, dur: .9});
  met.forEach(m => fxAdd('impact', '_dracoMet', {x: m.x, y: m.y, m, delay: m.t - DR.fall, dur: DR.fall + .55, last: m.last}));
}
function dracoTick(f, dt){
  const d = f.draco; if(!d) return; d.t += dt;
  const T0 = foe(d.mine);
  for(const m of d.met){ if(m.done || d.t < m.t - DR.fall || !T0 || T0.dead) continue;                 // mientras cae, el meteoro persigue al rival (con un poco de desvío)
    if(m.ox === undefined){ const an = HH(d.met.indexOf(m), 9) * 6.283, r = m.last ? 0 : DR.aim * HH(d.met.indexOf(m), 11); m.ox = Math.cos(an) * r; m.oy = Math.sin(an) * r * .5; }
    m.x = T0.x + m.ox; m.y = T0.y + m.oy; }
  for(const m of d.met){ if(m.done || d.t < m.t) continue; m.done = true;
    if(typeof suCrater === 'function') suCrater(m.x, m.y + 18, m.last ? 26 : 15); if(typeof Sfx !== 'undefined') Sfx.play('boom', m.last ? .9 : .5);
    fx.shake = Math.max(fx.shake, m.last ? 9 : 4);
    const T = foe(d.mine); if(!T || T.dead || T.ghost || T.jump || d.hits >= DR.maxHits) continue;
    if(T.inv > 0){ if(typeof dodgeOk === 'function') dodgeOk(T); continue; }                          // solo se libra si está haciendo la carrera justo ahora
    if(Math.hypot(T.x - m.x, (T.y - m.y) / .6) <= DR.hitR + rad(T) * .5){ d.hits++; f.kbP = m.last ? d.kbP : 0; hit(T, d.dmg * DR.dmg, d.type, f, false, m.last, '_draco'); f.kbP = 0; } }
  if(d.met.every(m => m.done)) f.draco = null;
}
FXR.impact._draco = () => {};                                                 // el golpe de cada meteoro ya se ve en _dracoMet
FXR.impact._dracoCast = (e, a) => {                                          // bola que sube al cielo y estalla arriba
  const f = e.fol; if(!f || !f.m) return; const x = f.x, y0 = f.y - 30, top = y0 - 300;
  brGlow(x, f.y - 10, 50, '170,140,255', .35 * Math.max(0, 1 - a / .5));
  if(a < .35){ const v = a / .35, y = y0 + (top - y0) * brEase(v);
    ctx.save(); const gr = ctx.createLinearGradient(x, y0, x, y); gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(1, 'rgba(255,250,230,.95)'); ctx.fillStyle = gr; ctx.fillRect(x - 7, Math.min(y, y0), 14, Math.abs(y0 - y)); ctx.restore();
    brGlow(x, y, 20, '255,250,220', 1); }
  else { const v = (a - .35) / .5; if(v < 1){ brGlow(x, top, 40 + 50 * v, '255,255,240', 1 - v); brRays(x, top, 18, 50 + 40 * v, 16, a, '#fff6d8', 3, 1 - v); } }
};
FXR.impact._dracoMet = (e, a) => {                                           // un meteoro: cae en diagonal con su estela y estalla
  const k = e.last ? 1.4 : 1, x = e.m ? e.m.x : e.x, y = (e.m ? e.m.y : e.y) - 4, F = DR.fall;
  if(a < F){ const v = a / F, sx = x + 170 * (1 - v), sy = y - 330 * (1 - v);
    ctx.save(); const gr = ctx.createLinearGradient(sx, sy, sx + 70, sy - 140); gr.addColorStop(0, 'rgba(255,240,190,.95)'); gr.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.strokeStyle = gr; ctx.lineCap = 'round'; ctx.lineWidth = 10 * k; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 70, sy - 140); ctx.stroke(); ctx.restore();
    brGlow(sx, sy, 16 * k, '255,240,190', .9); brBoulder(sx, sy, 6 * k, a * 9, 1, false);
    ctx.save(); ctx.globalAlpha = .25 + .5 * v; ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 22, 14 * k * v, 5 * k * v, 0, 0, 6.283); ctx.fill(); ctx.restore();   // sombra que crece
    return; }
  const b = (a - F) / .55; if(b >= 1) return;
  brGlow(x, y, (40 + 50 * brEase(b)) * k, '255,248,215', 1 - b);
  brRays(x, y, 10, (30 + 45 * brEase(b)) * k, 14, x * .01, '#fff2c4', 3 * (1 - b) + 1, 1 - b);
  brRing(x, y + 22, (14 + 60 * brEase(b)) * k, .42, '#ffffff', 2.5, (1 - b) * .9);
  ctx.save(); for(let i = 0; i < 10; i++){ const t = a - F - HH(i, 70) * .04; if(t < 0 || t > .5) continue; const an = HH(i, 71) * 6.283, v = 90 + HH(i, 72) * 130; ctx.globalAlpha = 1 - t / .5; ctx.fillStyle = i % 2 ? '#ffb02a' : '#fff2c4'; ctx.fillRect(x + Math.cos(an) * v * t - 2, y + Math.sin(an) * v * t * .8 - 2, 4, 4); } ctx.restore();
  if(b > .25){ const v = (b - .25) / .75; ctx.save(); ctx.globalAlpha = .55 * (1 - v); ctx.fillStyle = '#3a3036'; ctx.beginPath(); ctx.arc(x, y - 6 - 16 * v, (10 + 12 * v) * k, 0, 6.283); ctx.fill(); ctx.restore(); }   // humo
};
if(typeof windFire === 'function'){ const o = windFire; windFire = function(f){
    const w = f.wind; if(BR.on && w && w.nm === 'Cometa Draco' && !(g && g.pvp)){ f.wind = null; f.dir = dirOf(w.ang); return dracoStart(f, w, w.hold ? Math.max(0, Math.min(1, w.c / FEEL.windMax)) : 0); }
    return o.apply(this, arguments); }; }
if(typeof feelTick === 'function'){ const o = feelTick; feelTick = function(f, dt){ const r = o.apply(this, arguments); try{ dracoTick(f, dt); }catch(e){} return r; }; }

// =====================================================================  EMPUJÓN FUERTE: arrastre, surcos y se queda tumbado
function suPaintSkid(x0, y0, x1, y1){
  if(typeof suCanvas !== 'function') return null;
  const R = suRnd(Math.random() * 999), m = 30, [c, s] = suCanvas(Math.min(x0, x1) - m, Math.min(y0, y1) - m, Math.max(x0, x1) + m, Math.max(y0, y1) + m);
  const an = Math.atan2(y1 - y0, x1 - x0), px = -Math.sin(an), py = Math.cos(an), L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(4, Math.round(L / 10));
  for(const side of [-1, 1]){ s.strokeStyle = 'rgba(40,30,20,.55)'; s.lineWidth = 4; s.lineCap = 'round'; s.beginPath();
    for(let i = 0; i <= n; i++){ const u = i / n, o = side * (7 + (R() - .5) * 3); s[i ? 'lineTo' : 'moveTo'](x0 + (x1 - x0) * u + px * o, y0 + (y1 - y0) * u + py * o * .6); } s.stroke(); }
  for(let i = 0; i < n; i++){ const u = R(), o = (R() - .5) * 26; s.fillStyle = R() < .6 ? 'rgba(60,45,30,.35)' : 'rgba(210,195,170,.35)'; s.fillRect(x0 + (x1 - x0) * u + px * o, y0 + (y1 - y0) * u + py * o * .6, 3, 3); }
  s.fillStyle = 'rgba(80,62,44,.3)'; s.beginPath(); s.ellipse(x1 + Math.cos(an) * 14, y1 + Math.sin(an) * 8, 16, 7, an, 0, 6.283); s.fill();      // tierra amontonada al final
  return c;
}
if(typeof hit === 'function'){ const o = hit; hit = function(T, dmg, type, A, close, big, mvn){
    const r = o.apply(this, arguments);
    try{ if(BR.on && T && !T.dead && T.hp > 0 && A && A !== T){ const sp = Math.hypot(T.kx || 0, T.ky || 0);
        if(sp >= BR.kdMin && !T.jump && !T.lift){ T.kdn = {t0: g.t, x0: T.x, y0: brFoot(T), end: 0}; g.pops.push({x: T.x, y: T.y - 150, txt: '¡DERRIBADO!', t: 1, c: '#ffffff', s: 12}); if(typeof Sfx !== 'undefined') Sfx.play('skid', .7); } } }catch(e){}
    return r; }; }
function brKnock(){
  if(!g || !g.p || !g.e) return;
  for(const f of [g.p[g.pi], g.e[g.ei]]){ if(!f || !f.m) continue;
    const sp = Math.hypot(f.kx || 0, f.ky || 0);
    if(sp > 600 && !f.jump && !f.ghost && Math.floor(g.t * 25) !== f.brDust){ f.brDust = Math.floor(g.t * 25); const a = Math.atan2(f.ky, f.kx) + Math.PI;   // polvo al arrastrarse
      fxBurst(f.x, brFoot(f), ['#b9ab8c', '#e6dcc4', '#8a7a62'], 2, 70, a, 1.2, {life: .45, s: 2, rise: .3}); }
    const K = f.kdn; if(!K) continue;
    if(f.dead){ f.kdn = null; continue; }
    if(!K.end && (sp < 160 || g.t - K.t0 > 1.2)){ K.end = g.t; const x1 = f.x, y1 = brFoot(f); if(Math.hypot(x1 - K.x0, y1 - K.y0) > 30 && typeof suAdd === 'function') suAdd(suPaintSkid(K.x0, K.y0, x1, y1));
      fxBurst(x1, y1, ['#b9ab8c', '#e6dcc4'], 8, 110, -Math.PI / 2, 3, {life: .5, s: 2}); }
    if(K.end && (g.t - K.end > BR.lie || f.act === 'Walk' || f.act === 'Attack' || f.act === 'Shoot' || f.act === 'Charge')) f.kdn = null;   // se levanta (o antes, si se mueve o ataca)
  }
}
if(typeof fxDraw === 'function'){ const o = fxDraw; fxDraw = function(){ const r = o.apply(this, arguments); try{ brKnock(); }catch(e){} return r; }; }
if(typeof anPick === 'function'){ const o = anPick; anPick = function(f){                    // mientras sale despedido y un momento después: tumbado (su animación de debilitarse)
    if(BR.on && f && f.kdn && !f.dead && (f.act === 'Hurt' || f.act === 'Idle' || f.act === 'Walk')) return ['Faint', Math.min(.6, (g.t - f.kdn.t0) * 2.6)];
    return o.apply(this, arguments); }; }
