"use strict";
/* =====================================================================
   MÁS COSAS DEL VÍDEO «ROJO vs CINTIA» + DANZA ESPADA (de Pokémon Negro 2 / Blanco 2):
   1) RAYOS QUE SE MUEVEN (Hiperrayo, Rayo Solar, Hidrobomba, Foco Resplandor; Rayo Hielo en corto): sale un rayo continuo de la boca durante el tiempo de BEAMX; mientras dura lo giras con el ratón (el rival de la IA te va
      siguiendo despacio) y puedes andar muy despacio. Hace daño a golpecitos mientras el rival está dentro. Al acabar: «¡Tiene que recargar!»
      (BEAMX.rec segundos sin poder atacar; la carrera sí).
   2) CÁMARA: se acerca un poco al que carga un ataque fuerte y da un pequeño acercón en los golpes fuertes (CAM6).
   3) GOLPE CUERPO / CUERPO PESADO: aro de onda en el suelo y polvo al caer encima del rival.
   4) VELOCIDAD EXTREMA: tajos blancos que se cruzan sobre el rival al darle.
   5) NÚMEROS DE DAÑO: el daño que haces sale en grande encima del rival (los golpes seguidos se suman en el mismo número). Blanco normal,
      naranja si es muy eficaz, amarillo si es crítico, gris si es poco eficaz.
   6) DANZA ESPADA: un anillo de espadas azules alrededor del Pokémon que gira, un destello que las recorre, se hunden y suben las chispas naranjas
      de «sube el Ataque». Sonido de espadas. Si existe assets/fx/de_espada.png (una espada de Gemini, apuntando hacia abajo) se usa; si no, se dibuja.
   Cada parte se apaga con V6.<parte> = false.
   ===================================================================== */
const c01 = v => Math.max(0, Math.min(1, v));
const V6 = {hb: true, cam: true, cuerpo: true, ve: true, num: true, de: true};
const CAM6 = {carga: .5, golpe: .6, dur: .22};                                                       // [AJUSTE] acercamiento al cargar (× FEEL.zoom) · en los golpes fuertes · lo que dura el del golpe

// ---------------- 1) RAYOS QUE SE MUEVEN (Hiperrayo, Rayo Solar, Hidrobomba, Foco Resplandor y Rayo Hielo) ----------------
// Cada rayo: T duración · ancho (medio ancho) · dmg (daño total × el del ataque) · rec (segundos de recarga después; 0 = no) · lento (velocidad andando)
//   c = colores [brillo de fuera, borde, medio, centro] · onda = color de las líneas en onda · sp = sprite de Gemini (si está cargado se usa para el cuerpo del rayo)
const BEAMX = {
  'Hiperrayo':       {T: 1.3, ancho: 28, dmg: 1.25, rec: 1.1, lento: .25, c: ['255,140,40', '#ff7a14', '#ffd24a', '#ffffff'], onda: 'rgba(255,255,255,.9)'},
  'Rayo Solar':      {T: 1.2, ancho: 26, dmg: 1.2,  rec: .8,  lento: .3,  c: ['170,255,90', '#7fd63a', '#f4ff8a', '#ffffff'], onda: 'rgba(255,255,210,.95)', hojas: 1},
  'Hidrobomba':      {T: 1.1, ancho: 24, dmg: 1.15, rec: .7,  lento: .3,  c: ['80,170,255', '#2f7fe0', '#7cc8ff', '#eaf8ff'], onda: 'rgba(255,255,255,.95)', gotas: 1},
  'Foco Resplandor': {T: 1.2, ancho: 24, dmg: 1.2,  rec: .8,  lento: .3,  c: ['220,230,255', '#9aa8c8', '#e8eeff', '#ffffff'], onda: 'rgba(255,255,255,.9)', arco: 1, sp: 'fr_rayo'},
  'Rayo Hielo':      {T: .6,  ancho: 13, dmg: 1,    rec: 0,   lento: .5,  c: ['150,230,255', '#5fc8f0', '#c8f4ff', '#ffffff'], onda: 'rgba(255,255,255,.95)', hielo: 1, corto: 1}};
const HRX = {giro: 1.7, giroTu: 4, largo: 900, tick: .1};   // [AJUSTE] giro de la IA (rad/s) · tu giro · alcance · cada cuánto pega
// ---- DÓNDE ESTÁ LA BOCA de cada Pokémon (para que los rayos y la bola de carga salgan de ahí y no de la barriga) ----
// Se mira el dibujo de reposo de ese Pokémon en esa dirección: la cabeza es la parte de arriba; de lado, la boca es el borde de delante de la cabeza.
const MOUTH = {};
const DIRV = [[0, 1], [.7, .7], [1, 0], [.7, -.7], [0, -1], [-.7, -.7], [-1, 0], [-.7, .7]];          // 0 abajo, 1 abajo-der, 2 der, 3 arriba-der, 4 arriba, 5 arriba-izq, 6 izq, 7 abajo-izq
function mouthOf(f){
  try{
    const dir = f.dir || 0; let an = 'Idle', fi = 0;                                                  // el cuadro que se está viendo (Disparo / Carga: con la boca abierta)
    if(f.act && f.act !== 'Idle' && f.act !== 'Walk' && typeof ANIMS !== 'undefined' && ANIMS[f.act]){ const S = sheet(f.m.dex, f.act, false);
      if(S && S.ok && !S.bad){ const A2 = ANIMS[f.act]; an = f.act; fi = Math.floor((f.at || 0) * A2.fps); fi = A2.loop ? fi % S.info.n : Math.min(fi, S.info.n - 1); } }
    const key = f.m.dex + ':' + dir + ':' + an + ':' + fi; let M = MOUTH[key];
    if(!M){ const im = sheet(f.m.dex, an, false); if(!im || !im.ok) return [f.x, f.y - 16];
      const I = im.info, d = (dir + 1) * I.fh > im.height ? 0 : dir, c = document.createElement('canvas'); c.width = I.fw; c.height = I.fh;
      const x = c.getContext('2d'); x.drawImage(im, fi * I.fw, d * I.fh, I.fw, I.fh, 0, 0, I.fw, I.fh); const A = x.getImageData(0, 0, I.fw, I.fh).data, op = (i, j) => A[(j * I.fw + i) * 4 + 3] > 40;
      let y0 = -1, y1 = -1; for(let j = 0; j < I.fh; j++) for(let i = 0; i < I.fw; i++) if(op(i, j)){ if(y0 < 0) y0 = j; y1 = j; break; }
      if(y0 < 0) return [f.x, f.y - 16];
      const h = y1 - y0, [vx, vy] = DIRV[d]; let mx, my;
      if(Math.abs(vx) > .5){                                                                         // de lado o en diagonal: el punto más adelantado de la cabeza
        const yb = y0 + h * .5; let best = -1e9; mx = I.fw / 2; my = y0 + h * .25;
        for(let j = y0; j <= yb; j++) for(let i = 0; i < I.fw; i++) if(op(i, j)){ const sc = i * vx - (j - y0) * .35; if(sc > best){ best = sc; mx = i; my = j; } }
        mx -= vx * 2; my += 2 + (vy > 0 ? h * .04 : 0);
      } else {                                                                                       // de frente o de espaldas: centro de la cabeza
        const yb = Math.round(y0 + h * .3); let sx = 0, n = 0; for(let j = y0; j <= yb; j++) for(let i = 0; i < I.fw; i++) if(op(i, j)){ sx += i; n++; }
        mx = n ? sx / n : I.fw / 2; my = y0 + h * (vy > 0 ? .3 : .15);
      }
      M = MOUTH[key] = [(mx - I.fw / 2) * ESCALA, (my - I.fh / 2) * ESCALA]; }
    return [f.x + M[0], f.y + M[1]];
  }catch(e){ return [f.x, f.y - 16]; }
}
const hb6Mouth = f => { const a = f.burst.cur, [x, y] = mouthOf(f); return [x + Math.cos(a) * 6, y + Math.sin(a) * 4, a]; };
function hb6Start(f, nm, ang, dmg, type, mine, vk){
  const K = BEAMX[nm]; f.burst = {hb: 1, K, nm, t: 0, ang, cur: ang, dmg: dmg * K.dmg, type, mine, tk: 0, foe: feelFoe(f)};
  setAct(f, 'Shoot', K.T + .1); fx.shake = Math.max(fx.shake, K.corto ? 2 : 6);
  if(typeof Sfx !== 'undefined' && !K.corto) Sfx.play('beam', vk == null ? 1 : vk);
}
if(typeof windFire === 'function'){ const o = windFire; windFire = function(f){                    // ataques fuertes (E): al acabar la carga sale el rayo
  const w = f.wind;
  if(!V6.hb || !w || !BEAMX[w.nm] || BEAMX[w.nm].corto) return o.apply(this, arguments);      // (también online: el rayo sale igual en los dos ordenadores)
  f.wind = null; f.dir = dirOf(w.ang);
  const wp = w.hold ? clamp((w.c - FEEL.wind) / (FEEL.windMax - FEEL.wind), 0, 1) : 0;
  if(typeof Sfx !== 'undefined') Sfx.play('strong', w.vk);
  hb6Start(f, w.nm, w.ang, w.dmg * (1 + (FEEL.windK - 1) * wp), w.type, w.mine, w.vk);
}; }
function hb6Tick(f, dt){
  const b = f.burst, K = b.K; b.t += dt;
  if(f.dead || f.ghost || cant(f) || b.t >= K.T){                                                  // se acaba (los fuertes: tiene que recargar)
    f.burst = null; if(!f.dead){ setAct(f, 'Idle', .1); if(K.rec){ f.truant = Math.max(f.truant || 0, K.rec);
      g.pops.push({x: f.x, y: f.y - 120, txt: '¡Tiene que recargar!', t: 1.2, c: '#ff9a3a', s: 10}); } } return; }
  const T = foe(b.mine);
  { let d = b.ang - b.cur; d = Math.atan2(Math.sin(d), Math.cos(d)); const gm = (b.foe ? HRX.giro : HRX.giroTu) * dt; b.cur += clamp(d, -gm, gm); }   // gira hacia donde apuntas, con su peso (al de la IA se le puede esquivar)
  f.dir = dirOf(b.cur); if(f.act !== 'Shoot') setAct(f, 'Shoot', .2); else f.lock = .2;
  const [mx, my, a] = hb6Mouth(f); b.x0 = mx; b.y0 = my; b.len = HRX.largo;
  if(T && !T.dead && !T.ghost){                                                                    // ¿le da? (distancia del rival a la línea del rayo)
    const ux = Math.cos(a), uy = Math.sin(a), px = T.x - mx, py = (T.y - 10) - my, u = px * ux + py * uy, v = Math.abs(-px * uy + py * ux);
    if(u > 0 && u < HRX.largo && v < K.ancho + 22){ b.len = Math.min(b.len, u + 10); b.hitOn = 1;
      if((b.tk -= dt) <= 0 && !(T.inv > 0)){ b.tk = HRX.tick; const np = g.pops.length; hit(T, b.dmg * HRX.tick / K.T, b.type, f, false, false, b.nm);
        if(b.popOk) g.pops.splice(np).forEach(p => { if(/^\d+$/.test(p.txt)) g.pops.push(p); }); else b.popOk = 1;   // («Poco eficaz» / «¡Muy eficaz!» solo la 1.ª vez; el número sí se va sumando)
        fx.shake = Math.max(fx.shake, K.corto ? 1 : 3); } }
    else b.hitOn = 0;
  }
}
if(typeof burstTick === 'function'){ const o = burstTick; burstTick = function(f, dt){ if(f.burst && f.burst.hb) return hb6Tick(f, dt); return o.apply(this, arguments); }; }
if(typeof use === 'function'){ const o = use; use = function(f, i, ang){
  if(f && f.burst && f.burst.hb && i > 0) return;
  const nm = f && f.m && f.m.mv ? f.m.mv[i - 1] : null, K = nm && BEAMX[nm];
  if(!(V6.hb && i === 2 && K && K.corto)) return o.apply(this, arguments);
  const n0 = g.shots.length, r = o.apply(this, arguments);                                          // Rayo Hielo (disparo normal): en vez del proyectil, un rayo corto que también se mueve
  const nw = g.shots.slice(n0).filter(s => s.o === f);
  if(typeof fx !== 'undefined' && fx.list) for(let k = fx.list.length - 1; k >= 0; k--){ const e = fx.list[k]; if(e.kind === 'stream' && e.fol === f && e.name === nm) fx.list.splice(k, 1); }   // fuera el chorro viejo (salía del cuerpo)
  if(nw.length){ const s0 = nw[0]; g.shots = g.shots.filter(s => !nw.includes(s)); hb6Start(f, nm, ang, nw.reduce((q, s) => q + (s.dmg || 0), 0), s0.type, s0.mine); }
  else if(f.burst && !f.burst.hb){ const B = f.burst; f.burst = null; hb6Start(f, nm, ang, B.dmg * B.n, B.type, B.mine); }   // (si su disparo era una ristra)
  return r; }; }
if(typeof move === 'function'){ const o = move; move = function(f){                               // con el rayo saliendo se anda despacio
  if(!f || !f.burst || !f.burst.hb) return o.apply(this, arguments);
  const x0 = f.x, y0 = f.y, r = o.apply(this, arguments), k = f.burst.K.lento; f.x = x0 + (f.x - x0) * k; f.y = y0 + (f.y - y0) * k; return r; }; }
Object.assign(GM.meta, {fr_rayo: {fw: 1, fh: 1, n: 1}});                                            // Foco Resplandor: sprite de Gemini opcional (assets/fx/fr_rayo.png, un trozo de rayo horizontal que se repite)
{ const im = new Image(); im.onload = () => { const M = GM.meta.fr_rayo; M.n = 4; M.fw = im.width / 4; M.fh = im.height; M.b0 = 33; M.b1 = 120; M.ok = true; }; im.src = 'assets/fx/fr_rayo.png?v=1'; GM.img.fr_rayo = im; }   // 4 cuadros; el rayo ocupa las filas b0..b1 (fuera, chispas)
function hb6Draw(){
  if(!g) return;
  [...g.p, ...g.e].forEach(f => { const b = f && f.burst; if(!b || !b.hb || b.x0 == null) return;
    const K = b.K, C = K.c, A = Math.min(1, b.t / .08, (K.T - b.t) / .15), L = b.len, t = g.t, W = K.ancho * (1 + .1 * Math.sin(t * 40));
    ctx.save(); ctx.translate(b.x0, b.y0); ctx.rotate(b.cur); ctx.globalAlpha = A;
    ctx.globalCompositeOperation = 'lighter';
    const G = ctx.createLinearGradient(0, -W * 2, 0, W * 2); G.addColorStop(0, `rgba(${C[0]},0)`); G.addColorStop(.5, `rgba(${C[0]},.7)`); G.addColorStop(1, `rgba(${C[0]},0)`);
    ctx.fillStyle = G; ctx.fillRect(0, -W * 2, L, W * 4);                                           // brillo de fuera
    ctx.globalCompositeOperation = 'source-over';
    if(K.sp && gmOk(K.sp)){ const M = GM.meta[K.sp], fr = Math.floor(t * 12) % M.n, k0 = (2 * W) / ((M.b1 || M.fh) - (M.b0 || 0)), Hs = M.fh * k0, y0 = -W - (M.b0 || 0) * k0, seg = M.fw * k0;   // cuerpo con el sprite de Gemini
      ctx.imageSmoothingEnabled = false; for(let x = 0, k = 0; x < L; x += seg, k++){ const wd = Math.min(seg, L - x); ctx.drawImage(GM.img[K.sp], ((fr + k) % M.n) * M.fw, 0, M.fw * wd / seg, M.fh, x, y0, wd + .5, Hs); } }
    else { ctx.fillStyle = C[1]; ctx.fillRect(0, -W, L, W * 2); ctx.fillStyle = C[2]; ctx.fillRect(0, -W * .66, L, W * 1.32); ctx.fillStyle = C[3]; ctx.fillRect(0, -W * .32, L, W * .64);
      if(K.arco){ ['#ff8ab0', '#ffe27a', '#8affc8', '#8ac8ff'].forEach((c, i) => { ctx.fillStyle = c; ctx.globalAlpha = A * .55; ctx.fillRect(0, -W + i * W * .17, L, W * .12); ctx.fillRect(0, W - (i + 1) * W * .17, L, W * .12); }); ctx.globalAlpha = A; } }
    ctx.strokeStyle = K.onda; ctx.lineWidth = K.corto ? 1.5 : 2.5;                                  // las líneas en onda que recorren el rayo (como en el vídeo)
    for(let s = -1; s <= 1; s += 2){ ctx.beginPath(); for(let x = 0; x <= L; x += 8){ const y = s * W * .8 * Math.sin(x * .04 - t * 30 + (s > 0 ? 0 : Math.PI)); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    if(K.hojas){ ctx.fillStyle = '#9be35a'; for(let i = 0; i < L / 40; i++){ const x = ((i * 40 + t * 260) % L), y = Math.sin(i * 2.3 + t * 9) * W * 1.3;   // hojitas alrededor (Rayo Solar)
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * 8 + i); ctx.fillRect(-4, -2, 8, 4); ctx.restore(); } }
    if(K.gotas){ ctx.fillStyle = '#ffffff'; for(let i = 0; i < L / 30; i++){ const x = ((i * 30 + t * 300) % L), y = (HH(i, 5) - .5) * W * 2.6; ctx.fillRect(x, y, 4, 4); } }   // gotas que salpican (Hidrobomba)
    if(K.hielo){ ctx.fillStyle = '#ffffff'; for(let i = 0; i < L / 26; i++){ const x = ((i * 26 + t * 200) % L), y = (HH(i, 9) - .5) * W * 2.4, r = 2 + HH(i, 4) * 3;   // cristalitos (Rayo Hielo)
      ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.fill(); } }
    ctx.globalCompositeOperation = 'lighter';                                                       // bola en la boca y destello donde da
    const r0 = W * 1.5 * (1 + .15 * Math.sin(t * 50)), Gm = ctx.createRadialGradient(0, 0, 0, 0, 0, r0 * 1.6); Gm.addColorStop(0, '#ffffff'); Gm.addColorStop(.4, `rgba(${C[0]},.9)`); Gm.addColorStop(1, `rgba(${C[0]},0)`);
    ctx.fillStyle = Gm; ctx.beginPath(); ctx.arc(0, 0, r0 * 1.6, 0, 6.3); ctx.fill();
    if(b.hitOn){ const r1 = W * 2.4 * (1 + .2 * Math.sin(t * 60)), Gh = ctx.createRadialGradient(L, 0, 0, L, 0, r1); Gh.addColorStop(0, '#ffffff'); Gh.addColorStop(.35, `rgba(${C[0]},.9)`); Gh.addColorStop(1, `rgba(${C[0]},0)`);
      ctx.fillStyle = Gh; ctx.beginPath(); ctx.arc(L, 0, r1, 0, 6.3); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; for(let i = 0; i < 6; i++){ const an = HH(i, Math.floor(t * 20)) * 6.28, d0 = r1 * .5, d1 = r1 * (1.1 + HH(i + 9, Math.floor(t * 20)) * .8);
        ctx.beginPath(); ctx.moveTo(L + Math.cos(an) * d0, Math.sin(an) * d0); ctx.lineTo(L + Math.cos(an) * d1, Math.sin(an) * d1); ctx.stroke(); } }
    ctx.restore();
  });
}

// ---------------- 2) CÁMARA ----------------
let CAM6t = 0, CAM6at = null;
function cam6Upd(){
  if(!g || g.pvp || !V6.cam || g.slowT > 0) return;
  let best = 0, at = null;
  [...g.p, ...g.e].forEach(f => { if(f && f.wind && !f.dead){ const k = typeof v5K === 'function' ? v5K(f) : .5; if(k > best){ best = k; at = {x: f.x, y: f.y - 20}; } } });
  const hitK = CAM6t > g.t ? CAM6.golpe : 0;
  const want = Math.max(best * CAM6.carga, hitK);
  if(want > 0){ g.zoomAt = hitK >= best * CAM6.carga && CAM6at ? CAM6at : at || CAM6at; g.camZ = want; } else if(g.mega && typeof V7 !== 'undefined' && V7.mega && V7.megaZoom && g.mega.f){ const mf = g.mega.f, mi = idleInfo(mf.m.dex); g.zoomAt = {x: mf.x, y: mf.y + (mi.top + mi.foot) / 2 * ESCALA}; g.camZ = .9; } else g.camZ = 0;   // megaevolución: la cámara se acerca (js/fxvideo3.js)
}

// ---------------- 3), 4) y 5): al golpear ----------------
FXR.impact._v6tajo = (e, a) => { const u = a / e.dur; if(u >= 1) return;                      // tajos blancos cruzados (Velocidad Extrema)
  ctx.save(); ctx.lineCap = 'round';
  for(let i = 0; i < 3; i++){ const st = i * .06, v = c01((a - st) / .1); if(v <= 0) continue; const an = e.an + (i - 1) * .9, L = 70 + i * 10;
    ctx.globalAlpha = (1 - u); ctx.strokeStyle = '#bfe8ff'; ctx.lineWidth = 9 * (1 - u) + 2; ctx.beginPath(); ctx.moveTo(e.x - Math.cos(an) * L * v, e.y - Math.sin(an) * L * v); ctx.lineTo(e.x + Math.cos(an) * L * v, e.y + Math.sin(an) * L * v); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4 * (1 - u) + 1; ctx.stroke(); }
  ctx.restore(); };
const V6_CUERPO = /^(Golpe Cuerpo|Cuerpo Pesado|Placaje)$/;
if(typeof hit === 'function'){ const o = hit; hit = function(T, dmg, type, A, close, big, mvn){
  const hp0 = T ? T.hp : 0, np = g && g.pops ? g.pops.length : 0, r = o.apply(this, arguments);
  try{
    const d = T ? hp0 - T.hp : 0, nw = g.pops.slice(np).map(p => p.txt);
    if(V6.num && d > 0){                                                                // número de daño (se suma si llegan golpes seguidos)
      const cr = nw.includes('¡CRÍTICO!'), sup = nw.includes('¡Muy eficaz!'), poco = nw.includes('Poco eficaz'), P = T.v6n;
      const c = cr ? '#ffe04a' : sup ? '#ffa23a' : poco ? '#c8c8d0' : '#ffffff';
      if(P && g.pops.includes(P.p) && g.t - P.t0 < .4){ P.d += d; P.p.txt = String(Math.max(1, Math.round(P.d))); P.p.t = 1; P.t0 = g.t; if(cr || sup) P.p.c = c; P.p.s = Math.min(18, 12 + P.d / 25); }
      else { const p = {x: T.x + (Math.random() - .5) * 20, y: T.y - 78, txt: String(Math.max(1, Math.round(d))), t: 1, c, s: 12 + Math.min(5, d / 25)}; g.pops.push(p); T.v6n = {p, d, t0: g.t}; }
    }
    if(V6.cam && (big || nw.includes('¡CRÍTICO!')) && d > 0 && !g.pvp){ CAM6t = g.t + CAM6.dur; CAM6at = {x: T.x, y: T.y - 20}; }
    if(V6.cuerpo && close && d > 0 && V6_CUERPO.test(mvn || '')){ const I = idleInfo(T.m.dex), fy = T.y + I.foot * ESCALA - 2;
      fxAdd('impact', '_ring', {x: T.x, y: fy, dur: .45, r0: 18, r1: 95, c: '#ffffff'}); fxAdd('impact', '_ring', {x: T.x, y: fy, dur: .6, r0: 10, r1: 60, c: '#e8dcc0'});
      try{ fxBurst(T.x, fy - 4, ['#cdbb9a', '#a8916b', '#ece4d4'], 16, 220, 0, 6.3, {life: .5, s: 3, rise: -.2, drag: .86}); }catch(e){} fx.shake = Math.max(fx.shake, 8); }
    if(V6.ve && d > 0 && mvn === 'Velocidad Extrema') fxAdd('impact', '_v6tajo', {x: T.x, y: T.y - 20, dur: .35, an: A ? Math.atan2(T.y - A.y, T.x - A.x) : 0});
  }catch(e){}
  return r; }; }

// ---------------- 6) DANZA ESPADA ----------------
if(V6.de) FXR.buff['Danza Espada'] = () => {};                                               // (el estallido de antes; el aura de 5 s con espaditas sigue)
Object.assign(GM.meta, {de_espada: {fw: 1, fh: 1, n: 1}});
{ const im = new Image(); im.onload = () => { const M = GM.meta.de_espada; M.fw = im.width; M.fh = im.height; M.ok = true; }; im.src = 'assets/fx/de_espada.png?v=1'; GM.img.de_espada = im; }
function de6Sword(x, y, sc, A, glint){                                                              // una espada apuntando hacia abajo (punta en y)
  ctx.save(); ctx.globalAlpha = A; ctx.translate(x, y);
  if(gmOk('de_espada')){ const M = GM.meta.de_espada, h = 52 * sc, w = M.fw * h / M.fh; ctx.imageSmoothingEnabled = false; ctx.drawImage(GM.img.de_espada, -w / 2, -h, w, h); }
  else { const s = sc;
    ctx.fillStyle = '#0d4f5c'; ctx.fillRect(-4 * s, -40 * s, 8 * s, 34 * s); ctx.beginPath(); ctx.moveTo(-4 * s, -6 * s); ctx.lineTo(0, 2 * s); ctx.lineTo(4 * s, -6 * s); ctx.fill();   // contorno
    ctx.fillStyle = '#35c8e0'; ctx.fillRect(-3 * s, -40 * s, 6 * s, 33 * s); ctx.beginPath(); ctx.moveTo(-3 * s, -7 * s); ctx.lineTo(0, 0); ctx.lineTo(3 * s, -7 * s); ctx.fill();   // hoja
    ctx.fillStyle = '#b8f6ff'; ctx.fillRect(-1 * s, -40 * s, 2 * s, 32 * s);                     // filo brillante
    ctx.fillStyle = '#0d4f5c'; ctx.fillRect(-9 * s, -44 * s, 18 * s, 5 * s); ctx.fillStyle = '#5fe0f0'; ctx.fillRect(-8 * s, -43 * s, 16 * s, 3 * s);   // guarda
    ctx.fillStyle = '#0d4f5c'; ctx.fillRect(-2.5 * s, -54 * s, 5 * s, 10 * s); ctx.fillStyle = '#2a9fb8'; ctx.fillRect(-1.5 * s, -53 * s, 3 * s, 8 * s);   // empuñadura
    ctx.fillStyle = '#5fe0f0'; ctx.fillRect(-3 * s, -57 * s, 6 * s, 4 * s); }                     // pomo
  if(glint > 0){ ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = A * glint; ctx.fillStyle = '#ffffff'; ctx.fillRect(-6 * sc, -46 * sc, 12 * sc, 44 * sc); }
  ctx.restore();
}
FXR.impact._de6 = (e, a) => {
  const f = e.fol; if(!f) return; const u = a / e.dur; if(u >= 1) return;
  const I = idleInfo(f.m.dex), foot = f.y + I.foot * ESCALA, top = f.y - (I.fh || 40) * ESCALA * .5, n = 7, R = Math.max(58, (I.fw || 40) * ESCALA * .55);
  const app = c01(a / .2), sink = c01((a - .75) / .35), A = app * (1 - sink), cy = (top + foot) / 2 - 10 + sink * 30;
  const glintX = (a - .25) / .35;                                                                   // el destello va de izquierda a derecha
  const sw = [];
  for(let i = 0; i < n; i++){ const th = i * 6.283 / n + a * 2.2; sw.push({x: f.x + Math.cos(th) * R, y: cy + Math.sin(th) * R * .32, z: Math.sin(th), i}); }
  sw.sort((p, q) => p.z - q.z).forEach(s => { const gx = (s.x - (f.x - R)) / (2 * R), gl = glintX > 0 && glintX < 1.2 ? Math.max(0, 1 - Math.abs(gx - glintX) * 5) : 0;
    de6Sword(s.x, s.y + 6, 1.45 + s.z * .18, A * (.55 + .45 * (s.z + 1) / 2), gl); });
  if(glintX > 0 && glintX < 1.2){ ctx.save(); ctx.globalCompositeOperation = 'lighter';           // estrellitas del destello
    for(let i = 0; i < 6; i++){ const x = f.x - R + glintX * 2 * R + (HH(i, 3) - .5) * 30, y = cy - 30 + (HH(i, 5) - .5) * 30, s = 2 + HH(i, 7) * 3;
      ctx.globalAlpha = 1 - Math.abs(glintX - .5); ctx.fillStyle = '#ffffff'; ctx.fillRect(x - s, y - .5, s * 2, 1.5); ctx.fillRect(x - .5, y - s, 1.5, s * 2); }
    ctx.restore(); }
  if(a > .9){ const v = c01((a - .9) / (e.dur - .9));                                         // sube el Ataque: bolitas naranjas que suben
    ctx.save(); for(let i = 0; i < 14; i++){ const p = (v * 1.3 + HH(i, 11) * .6) % 1.3; if(p > 1) continue;
      const x = f.x + (HH(i, 13) - .5) * R * 1.8, y = foot - p * (foot - top + 30); ctx.globalAlpha = (1 - p) * (1 - v * .5);
      ctx.fillStyle = i % 3 ? '#ff9a2a' : '#ffd24a'; ctx.beginPath(); ctx.arc(x, y, 3 + HH(i, 17) * 3, 0, 6.3); ctx.fill(); }
    ctx.restore(); }
};
if(typeof fxBuff === 'function'){ const o = fxBuff; fxBuff = function(f, name){
  if(V6.de && name === 'Danza Espada' && f){ fxAdd('impact', '_de6', {x: f.x, y: f.y, fol: f, dur: 1.6});
    if(typeof Sfx !== 'undefined'){ const k = g.e && g.e.includes(f) ? .6 : 1; Sfx.play('swords', k); }
    const r = o.apply(this, arguments); f.auraName = 'Danza Espada'; return r; }
  return o.apply(this, arguments); }; }

// ---------------- Dónde se dibuja ----------------
if(typeof megaDraw === 'function'){ const o = megaDraw; megaDraw = function(){ const r = o.apply(this, arguments); try{ if(V6.hb) hb6Draw(); cam6Upd(); }catch(e){} return r; }; }
