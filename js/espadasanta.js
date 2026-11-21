"use strict";
/* =====================================================================
   ESPADA SANTA (ataque fuerte, E · tipo lucha) — 21-11-2026 (rehecha como dijo Diego)
   El Pokémon saca una espada gigante de luz delante de él y la clava en el suelo de golpe:
     - si el rival está pegado a la espada, le da con la espada (golpe directo, todo el daño);
     - si no, del golpe sale un RETUMBIDO en línea recta hacia donde apuntas: una grieta de luz que avanza por el
       suelo levantando destellos y chispas, y pega al rival si le pilla (se esquiva apartándose de la línea).
   Después la espada se queda clavada un momento y se deshace en luz.
   La llevan Gallade, Cobalion, Terrakion, Virizion y Keldeo (SIGNATURE en js/moves.js).
   Imágenes: assets/objetos/ataques/e/es_{carga,espada,golpe,chispas,marca}.png (6 cuadros por fila).
   Lo que pasa en el combate (cuándo y dónde pega) no depende de las imágenes: igual en los dos ordenadores del online.
   ===================================================================== */
const ES = {on: true, delante: 140, cae: .44, alza: .22, gira: .3, Rc: 58, vel: 700, largo: 500, ancho: 34, dmgOla: .9, clavada: .9, deshace: .35,   // [AJUSTE] dónde se clava (px delante) · cuándo golpea el suelo (s) · radio del golpe directo · retumbido: velocidad, alcance, ancho, daño (× el del ataque)
            alto: 210, hunde: .18, golpe: 230, chispas: 210, marca: 120, marcaDura: 3, ola: 120};                          // tamaños del dibujo (px)
const ES_IMG = {};
['carga', 'espada', 'golpe', 'chispas', 'marca'].forEach(k => { const im = new Image(); im.onload = () => { im.ok = true; im.fw = im.width / 6; }; im.src = `assets/objetos/ataques/e/es_${k}.png?v=1`; ES_IMG[k] = im; });
const esOk = () => ['carga', 'espada', 'golpe', 'chispas', 'marca'].every(k => ES_IMG[k].ok);
function esFr(k, fr, x, y, w, A, ax, ay, rot){   // cuadro fr de la fila k, de ancho w; (ax, ay) = punto del cuadro que va en (x, y) (0.5, 0.5 = centro)
  const im = ES_IMG[k]; if(!im || !im.ok || A <= 0) return; const h = w * im.height / im.fw, f = Math.max(0, Math.min(5, fr | 0));
  ctx.save(); ctx.globalAlpha = Math.min(1, A); ctx.translate(x, y); if(rot) ctx.rotate(rot);
  ctx.drawImage(im, f * im.fw, 0, im.fw, im.height, -w * (ax ?? .5), -h * (ay ?? .5), w, h); ctx.restore();
}
const esFinOla = () => ES.largo / ES.vel;

// ------------------------------------------------ COMBATE (igual en los dos ordenadores)
function esStart(f, w, wp){
  const c = Math.cos(w.ang), s = Math.sin(w.ang);
  f.espada = {t: 0, ang: w.ang, c, s, px: f.x, py: f.y - 26, x: f.x + c * ES.delante, y: f.y + s * ES.delante * .7, dmg: w.dmg * (1 + (FEEL.windK - 1) * wp),
              type: w.type, mine: w.mine, kbP: wp, golpe: false, hit: false};
  setAct(f, 'Attack', ES.cae + .2); if(typeof Sfx !== 'undefined') Sfx.play('strong', w.vk);
  fxAdd('impact', '_espada', {x: f.espada.x, y: f.espada.y, S: f.espada, fol: f, dur: ES.cae + Math.max(esFinOla(), ES.clavada) + ES.deshace + .1});
}
function esPega(f, S, T, k){
  if(T.inv > 0){ if(typeof dodgeOk === 'function') dodgeOk(T); S.hit = true; return; }
  S.hit = true; S.directo = k === 1; f.kbP = S.kbP; hit(T, S.dmg * k, S.type, f, k === 1, true, 'Espada Santa'); f.kbP = 0;
}
function esTick(f, dt){
  const S = f.espada; if(!S) return; S.t += dt;
  const T = foe(S.mine), vale = T && !T.dead && !T.ghost && !T.jump;
  if(!S.golpe && S.t >= ES.cae){ S.golpe = true; fx.shake = Math.max(fx.shake, 10); if(typeof Sfx !== 'undefined') Sfx.play('boom', 1);
    if(vale && Math.hypot(T.x - S.x, (T.y - S.y) / .7) <= ES.Rc + rad(T) * .5) esPega(f, S, T, 1); }              // la espada le da de lleno
  if(S.golpe && !S.hit && vale){                                                                                      // el retumbido avanza en línea recta
    const d = Math.min(ES.largo, (S.t - ES.cae) * ES.vel), px = T.x - S.x, py = T.y - S.y, u = px * S.c + py * S.s, v = Math.abs(-px * S.s + py * S.c);
    if(u >= 0 && u <= d && v <= ES.ancho + rad(T) * .5) esPega(f, S, T, ES.dmgOla);
  }
  if(S.t > ES.cae + Math.max(esFinOla(), ES.clavada) + ES.deshace) f.espada = null;
}
if(typeof windFire === 'function'){ const o = windFire; windFire = function(f){
  const w = f.wind; if(ES.on && w && w.nm === 'Espada Santa'){ f.wind = null; f.dir = dirOf(w.ang); return esStart(f, w, w.hold ? Math.max(0, Math.min(1, w.c / FEEL.windMax)) : 0); }
  return o.apply(this, arguments); }; }
if(typeof feelTick === 'function'){ const o = feelTick; feelTick = function(f, dt){ const r = o.apply(this, arguments); try{ esTick(f, dt); }catch(e){} return r; }; }
FXR.impact['Espada Santa'] = () => {};                                            // el golpe ya se ve en _espada

// ------------------------------------------------ DIBUJO
let esMarcas = [], esG = null;
function esMarca(x, y, w, rot){ if(esG !== g){ esG = g; esMarcas = []; } esMarcas.push({x, y, w, rot, t0: g.t}); if(esMarcas.length > 40) esMarcas.shift(); }
FXR.impact._espada = (e, a) => {
  const S = e.S; if(!S) return; const x = S.x, gy = S.y + 16, H = ES.alto, ok = esOk(), tI = ES.cae;
  // 1) alza la espada por encima de la cabeza y la descarga en arco contra el suelo (21-11: como dijo Diego)
  const px = S.px, py = S.py, L = Math.hypot(x - px, gy - py), te = Math.atan2(gy - py, x - px);
  const ts = -Math.PI / 2 - .5 * (S.c >= 0 ? 1 : -1), tf = S.c >= 0 ? (te < ts ? te + 6.283 : te) : (te > ts ? te - 6.283 : te);
  const wE = L / (.92 * 1.11);                                                                       // ancho del dibujo para que la punta llegue al suelo
  if(a < tI){
    let th, k = 1;
    if(a < ES.alza){ const v = a / ES.alza; th = ts; k = .55 + .45 * (1 - Math.pow(1 - v, 3)); }       // la alza
    else if(a < ES.gira){ th = ts - .12 * (S.c >= 0 ? 1 : -1) * Math.sin((a - ES.alza) / (ES.gira - ES.alza) * Math.PI / 2); }   // coge impulso hacia atrás
    else { const v = (a - ES.gira) / (tI - ES.gira), q = v * v; th = ts + (tf - ts) * q;                // la descarga (cada vez más rápido)
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const R = L * 1.02;                       // estela en abanico
      const gr = ctx.createRadialGradient(px, py, R * .3, px, py, R); gr.addColorStop(0, 'rgba(140,230,255,0)'); gr.addColorStop(.8, `rgba(170,240,255,${.35 * v})`); gr.addColorStop(1, `rgba(255,255,255,${.6 * v})`);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(px, py); const a0 = Math.max(ts, th - 1.4), a1 = th; if(S.c >= 0) ctx.arc(px, py, R, Math.min(th - 1.2 * v, a1), a1); else ctx.arc(px, py, R, a1, Math.max(th + 1.2 * v, a1));
      ctx.closePath(); ctx.fill(); ctx.restore(); }
    const rot = th - Math.PI / 2, A = a < .06 ? a / .06 : 1;
    if(a > ES.gira * .7){ ctx.save(); ctx.globalAlpha = .45; ctx.fillStyle = 'rgba(10,20,40,.6)'; ctx.beginPath(); ctx.ellipse(x, gy, 26, 10, 0, 0, 6.283); ctx.fill(); ctx.restore(); }   // sombra donde va a caer
    if(ok){ if(a < ES.alza * .8) esFr('carga', a / (ES.alza * .8) * 6, px, py, wE * k * 156 / 198, A, .5, .05, rot); else esFr('espada', Math.floor(a * 14) % 6, px, py, wE * k, A, .5, .04, rot); }
    else { ctx.save(); ctx.translate(px, py); ctx.rotate(th); ctx.fillStyle = '#e8fbff'; ctx.fillRect(0, -5, L * k, 10); ctx.restore(); }
    return;
  }
  const u = a - tI;
  if(!e.esM){ e.esM = 1; esMarca(x, gy, ES.marca * 1.5, 0); if(typeof suCrater === 'function') suCrater(x, gy, 20); }
  // 2) fogonazo y golpe donde se clava
  if(u < .12){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createRadialGradient(x, gy - 30, 0, x, gy - 30, 200);
    gr.addColorStop(0, `rgba(230,255,255,${.85 * (1 - u / .12)})`); gr.addColorStop(1, 'rgba(230,255,255,0)'); ctx.fillStyle = gr; ctx.fillRect(x - 200, gy - 230, 400, 400); ctx.restore(); }
  if(ok && u < .5) esFr('golpe', u / .5 * 6, x, gy, ES.golpe, 1, .5, .78);
  // 3) el retumbido: grieta de luz que avanza en línea recta (si la espada no le dio de lleno)
  const dOla = Math.min(ES.largo, u * ES.vel), finOla = esFinOla(), cx = S.c, sy = S.s;
  if(!S.directo && u <= finOla + .35){
    if(S.hit && S.hitU == null) S.hitU = dOla;                                                       // donde pilló al rival se para
    const d = S.hitU != null ? S.hitU : dOla, A = u > finOla ? 1 - (u - finOla) / .35 : 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(x, gy, x + cx * d, gy + sy * d * .7); gr.addColorStop(0, 'rgba(120,220,255,0)'); gr.addColorStop(.7, `rgba(150,235,255,${.45 * A})`); gr.addColorStop(1, `rgba(240,255,255,${.95 * A})`);
    ctx.strokeStyle = gr; ctx.lineCap = 'round'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + cx * d, gy + sy * d * .7); ctx.stroke();
    ctx.lineWidth = 5; ctx.strokeStyle = `rgba(255,255,255,${.9 * A})`; ctx.stroke(); ctx.restore();
    const fx2 = x + cx * d, fy2 = gy + sy * d * .7;
    if(ok && A > 0){ esFr('golpe', 1 + Math.floor(a * 18) % 3, fx2, fy2, ES.ola, A, .5, .78); esFr('chispas', Math.floor(a * 14) % 4, fx2, fy2 - 18, ES.ola * .9, A * .9); }
    const paso = 46, n = Math.floor(d / paso); e.esN = e.esN || 1;                                   // grietas que va dejando
    for(; e.esN <= n; e.esN++) esMarca(x + cx * e.esN * paso, gy + sy * e.esN * paso * .7, ES.marca * (1 - e.esN * paso / ES.largo * .4), (e.esN % 2) * .6);
    if(S.hitU != null && !e.esB){ e.esB = 1; e.esBt = u; }                                           // explosión al pillarle
    if(e.esB && ok){ const b = (u - e.esBt) / .5; if(b < 1){ esFr('golpe', b * 6, fx2, fy2, ES.golpe * .85, 1, .5, .78); esFr('chispas', b * 6, fx2, fy2 - 30, ES.chispas * .85, 1); } }
  }
  // 4) la espada se queda clavada (inclinada, donde cayó) y luego se deshace en luz
  const fin = ES.clavada + ES.deshace, des = u > ES.clavada ? (u - ES.clavada) / ES.deshace : 0;
  if(ok && u < fin){ esFr('espada', Math.floor(g.t * 12) % 6, px, py + des * 10, wE, 1 - des, .5, .04, tf - Math.PI / 2);
    if(u < .6) esFr('chispas', u / .6 * 6, x, gy - 40, ES.chispas, 1);
    if(des > 0) esFr('chispas', 2 + des * 3, (px + x) / 2, (py + gy) / 2, ES.chispas * .8, 1 - des * .6); }
};
// las grietas brillantes van en el suelo (debajo de los Pokémon)
function esMarcasDib(){
  if(!g || g !== esG || !esMarcas.length) return;
  for(let i = esMarcas.length - 1; i >= 0; i--){ const m = esMarcas[i], u = (g.t - m.t0) / ES.marcaDura; if(u >= 1){ esMarcas.splice(i, 1); continue; }
    esFr('marca', Math.min(5, u * 6.5), m.x, m.y, m.w, u < .75 ? 1 : (1 - u) / .25, .5, .5, m.rot); }
}
if(typeof fxhdGround === 'function'){ const o = fxhdGround; fxhdGround = function(){ const r = o.apply(this, arguments); try{ esMarcasDib(); }catch(e){} return r; }; }
