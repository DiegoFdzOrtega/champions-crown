"use strict";
/* =====================================================================
   MÁS COSAS DEL VÍDEO «LANCE vs IRIS» (dibujos de Gemini en assets/fx/):
   1) CANTO (ataque nuevo, hueco Mejora · Q, tipo Normal): abre la boca y sale una fila de notas musicales que vuela hasta el rival
      y lo duerme (como Somnífero). Lo aprenden: Clefairy, Jigglypuff, Lapras, Swablu, Chatot, Meloetta, Primarina... (ca_notas.png)
   2) DORMIDO: las Zzz de Gemini encima del Pokémon dormido (zz_dormir.png) en vez de las letras de antes.
   3) COMETA DRACO: la bola sube desde la boca, estalla arriba en trozos, caen los meteoritos y cada uno explota en el suelo (dc_sube, dc_estalla, dc_met2, dc_impacto).
   V11.<parte> = false apaga cada cosa.
   ===================================================================== */
const V11 = {canto: true, zzz: true, draco: true};
const V11IMG = {}; function v11Img(k, n){ const im = new Image(); im.onload = () => { im.n = n; im.fw = im.width / n; im.ok = true; }; im.src = 'assets/fx/' + k + '.png?v=1'; V11IMG[k] = im; }
v11Img('ca_notas', 6); v11Img('zz_dormir', 2);
const v11Ok = k => V11IMG[k] && V11IMG[k].ok;
function v11Draw(k, fr, x, y, sc, rot, A){ const im = V11IMG[k]; if(!im || !im.ok) return false; fr = ((fr % im.n) + im.n) % im.n;
  ctx.save(); ctx.translate(x, y); if(rot) ctx.rotate(rot); ctx.globalAlpha *= (A == null ? 1 : A); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(im, fr * im.fw, 0, im.fw, im.height, -im.fw * sc / 2, -im.height * sc / 2, im.fw * sc, im.height * sc); ctx.restore(); return true; }

// ---------------- 1) CANTO ----------------
if(V11.canto){
  if(typeof MOVES !== 'undefined') MOVES['Canto'] = MOVES['Canto'] || {t: 'normal', s: 3};
  if(typeof STATUS_MOVES !== 'undefined') STATUS_MOVES['Canto'] = {k: 'slp', acc: .85, desc: 'Canta una melodía que duerme al rival. A veces falla.'};
  if(typeof LEARN !== 'undefined' && !LEARN['Canto']) LEARN['Canto'] = '35-36,39-40,131,173-174,333-334,441,648,728-730';
  if(typeof MOVE_DESC !== 'undefined') MOVE_DESC['Canto'] = 'Canta una melodía que duerme al rival. A veces falla.';
  if(typeof MT_LIST !== 'undefined' && !MT_LIST.includes('Canto')) MT_LIST.push('Canto');
  // Como en el vídeo: va más despacio y deja una fila de notas sueltas que salen de la boca y ondulan hasta el rival (blancas al salir, moradas después)
  FXR.flight['Canto'] = (s, a, an) => {
    if(!v11Ok('ca_nota')) return;
    if(!s.v11c){ s.v11c = 1; s.vx *= .58; s.vy *= .58; s.v11n = 0; if(typeof Sfx !== 'undefined') Sfx.play('canto', s.mine ? 1 : .7); }   // la primera vez: más lento y suena la nana
    if(g.t - (s.v11e || 0) > .07){ s.v11e = g.t; V11notes.push({x: s.x, y: s.y - 6, an, t0: g.t, k: s.v11n++ % 4, ph: Math.random() * 6.3}); }
    v11Draw('ca_nota', Math.floor(g.t * 6) % 4, s.x, s.y - 6 + Math.sin(g.t * 14) * 5, .75, Math.sin(g.t * 9) * .25, 1); };
  FXR.trail['Canto'] = {rate: 18, cols: ['#ffffff', '#e8c8ff', '#c28bff'], life: .45, speed: 14, spread: 6, s: 1};
}

let V11notes = [];
v11Img('ca_nota', 4);
function v11NotesDraw(){
  V11notes = V11notes.filter(n => g.t - n.t0 < .9);
  for(const n of V11notes){ const u = (g.t - n.t0) / .9, px = -Math.sin(n.an), py = Math.cos(n.an), w = Math.sin(u * 7 + n.ph) * 10;
    const x = n.x + px * w + Math.cos(n.an) * 14 * u, y = n.y + py * w - 16 * u, A = u < .1 ? u / .1 : 1 - Math.pow((u - .1) / .9, 1.5);
    ctx.save(); if(u > .35) ctx.filter = `hue-rotate(${Math.round((u - .35) * 60)}deg) saturate(${1 + u})`;   // se van volviendo moradas
    v11Draw('ca_nota', n.k, x, y, .55 + .15 * Math.sin(u * 3), Math.sin(u * 6 + n.ph) * .3, A); ctx.restore(); }
}
if(typeof megaDraw === 'function'){ const o = megaDraw; megaDraw = function(){ const r = o.apply(this, arguments); try{ if(g && V11notes.length) v11NotesDraw(); }catch(e){} return r; }; }

// ---------------- 2) DORMIDO: Zzz ----------------
function v11Zzz(hx, top, t){                                                                     // lo llama fxstatus.js (dibujo de dormido)
  if(!V11.zzz || !v11Ok('zz_dormir')) return false;
  const u = (t * .6) % 1, A = u < .15 ? u / .15 : u > .8 ? (1 - u) / .2 : 1;
  return v11Draw('zz_dormir', Math.floor(t * 2.5), hx + 22 + u * 6, top - 26 - u * 14, .3, 0, A);
}

// ---------------- 3) COMETA DRACO (versión 2, dibujos de Gemini) ----------------
// La bola sube desde la boca (dc_sube) · estalla arriba en trozos (dc_estalla) · caen los meteoritos (dc_met2) · cada uno explota al tocar el suelo (dc_impacto)
v11Img('dc_sube', 4); v11Img('dc_estalla', 5); v11Img('dc_met2', 3); v11Img('dc_impacto', 6);
if(V11.draco && FXR.impact._dracoCast){ const o = FXR.impact._dracoCast; FXR.impact._dracoCast = function(e, a){
  if(!v11Ok('dc_sube') || !v11Ok('dc_estalla')) return o.apply(this, arguments);
  const f = e.fol; if(!f || !f.m) return; const [mx, my] = typeof mouthOf === 'function' ? mouthOf(f) : [f.x, f.y - 30], top = my - 300;
  if(a < .4){ const v = a / .4, ease = 1 - Math.pow(1 - v, 2.2), y = my + (top - my) * ease;            // sube
    const im = V11IMG.dc_sube, sc = .55; v11Draw('dc_sube', Math.floor(g.t * 14), mx, y + im.height * sc * .32, sc, 0, 1); return; }
  const v = (a - .4) / .5; if(v >= 1) return;                                                         // estalla arriba
  if(!e.v11b){ e.v11b = 1; fx.shake = Math.max(fx.shake, 3); if(typeof Sfx !== 'undefined') Sfx.play('boom', .5); }
  v11Draw('dc_estalla', Math.min(4, Math.floor(v * 5)), mx, top, .85, 0, v > .8 ? 1 - (v - .8) / .2 : 1);
}; }
if(V11.draco && FXR.impact._dracoMet){ const o = FXR.impact._dracoMet; FXR.impact._dracoMet = function(e, a){
  if(!v11Ok('dc_met2') || !v11Ok('dc_impacto')) return o.apply(this, arguments);
  const F = typeof DR !== 'undefined' ? DR.fall : .3, k = e.last ? 1.35 : 1, x = e.m ? e.m.x : e.x, y = (e.m ? e.m.y : e.y) + 18;
  if(a < F){ const v = a / F, sx = x + 190 * (1 - v), sy = y - 360 * (1 - v), im = V11IMG.dc_met2, sc = .55 * k;     // cae en diagonal (la cabeza va delante, abajo a la izquierda)
    ctx.save(); ctx.globalAlpha = .2 + .45 * v; ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(x, y, 16 * k * v, 6 * k * v, 0, 0, 6.283); ctx.fill(); ctx.restore();   // sombra que crece
    const fr = Math.floor(g.t * 14) % im.n; ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(im, fr * im.fw, 0, im.fw, im.height, sx - im.fw * sc * .15, sy - im.height * sc * .82, im.fw * sc, im.height * sc); ctx.restore(); return; }
  const b = (a - F) / .6; if(b >= 1) return;                                                          // explota en el suelo
  const im = V11IMG.dc_impacto, sc = .75 * k, fr = Math.min(im.n - 1, Math.floor(b * im.n));
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = b > .85 ? 1 - (b - .85) / .15 : 1;
  ctx.drawImage(im, fr * im.fw, 0, im.fw, im.height, x - im.fw * sc / 2, y - im.height * sc + 6, im.fw * sc, im.height * sc); ctx.restore();
}; }
