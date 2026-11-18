"use strict";
/* =====================================================================
   MÁS COSAS DEL VÍDEO «LANCE vs IRIS»:
   1) CARTEL DE HABILIDAD: cuando salta una habilidad (Intimidación, Presión, Rastro, clima...) sale su nombre en GRANDE, en cursiva,
      entrando por el lado de ese Pokémon (izquierda = tú, derecha = rival).
   2) «¡A LUCHAR!» en grande al acabar la cuenta atrás del principio.
   3) COMBO: si golpeas varias veces seguidas sin que te den, sale «¡3 GOLPES SEGUIDOS!», «¡4 GOLPES SEGUIDOS!»...
      (se corta si te golpean o si pasan V12.comboT segundos sin golpear).
   4) DOBLE EQUIPO (ataque nuevo, Mejora · Q, tipo Normal): aparecen 3 copias tuyas alrededor; mientras dura la mejora, cada golpe
      que te dan tiene un V12.eva de probabilidad de dar a una copia (falla y la copia desaparece). Lo puede aprender casi cualquiera.
   V12.<parte> = false apaga cada cosa.
   ===================================================================== */
const V12 = {hab: true, luchar: true, combo: true, dobleq: true, comboMin: 3, comboT: 1.8, eva: .45};
let V12ban = [], V12go = null, V12cb = {n: 0, t: -9, show: null}, V12last = 9;

// ---------------- 1) CARTEL DE HABILIDAD ----------------
function abBanner(f, txt, c){                                                                     // lo llama abPop (js/abilities.js)
  try{ if(V12.hab && g && f && txt && !/no le afecta|:/i.test(txt)){ const side = (g.p || []).includes(f) ? 'L' : 'R';
    V12ban = V12ban.filter(b => b.side !== side); V12ban.push({txt: '¡' + txt.replace(/^¡|!$/g, '') + '!', side, t0: performance.now(), c: c || '#ffd84a', who: f.m ? f.m.name : ''}); } }catch(e){}
}
function v12Text(txt, x, y, size, c1, c2, align, A, skew){
  ctx.save(); ctx.globalAlpha = A; ctx.translate(x, y); ctx.transform(1, 0, skew == null ? -.18 : skew, 1, 0, 0);
  ctx.font = `${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = size * .32; ctx.strokeStyle = '#0a1226'; ctx.strokeText(txt, 0, 0);
  const gr = ctx.createLinearGradient(0, -size / 2, 0, size / 2); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  ctx.fillStyle = gr; ctx.fillText(txt, 0, 0); ctx.restore();
}
function v12BanDraw(){
  const now = performance.now();
  V12ban = V12ban.filter(b => now - b.t0 < 1900);
  for(const b of V12ban){ const t = (now - b.t0) / 1000, inn = Math.min(1, t / .18), out = t > 1.5 ? 1 - (t - 1.5) / .4 : 1, L = b.side === 'L';
    const x = L ? 40 - 300 * (1 - inn) : W - 40 + 300 * (1 - inn), y = 170;
    v12Text(b.txt, x, y, 26, '#ffffff', b.c, L ? 'left' : 'right', out);
    if(b.who) v12Text(b.who, x + (L ? 6 : -6), y + 28, 10, '#c9d6f5', '#8fb3e8', L ? 'left' : 'right', out * .9); }
}

// ---------------- 2) ¡A LUCHAR! ----------------
function v12GoDraw(){
  if(!g) return;
  if(V12.luchar && V12last > 0 && g.count <= 0 && !g.pvp0) V12go = performance.now();
  V12last = g.count;
  if(!V12go) return; const t = (performance.now() - V12go) / 1000; if(t > 1.2){ V12go = null; return; }
  const sc = t < .15 ? .4 + 1 * (t / .15) : t < .25 ? 1.4 - .4 * ((t - .15) / .1) : 1, A = t > .9 ? 1 - (t - .9) / .3 : 1;
  ctx.save(); ctx.translate(W / 2, H / 2 + 10); ctx.scale(sc, sc); v12Text('¡A LUCHAR!', 0, 0, 56, '#fff6c8', '#ffb020', 'center', A); ctx.restore();
}

// ---------------- 3) COMBO ----------------
const v12Mine = A => g && (g.pvp ? (g.me === 'e' ? g.e : g.p) : g.p).includes(A);
if(typeof hit === 'function'){ const o = hit; hit = function(T, dmg, type, A){
  // 4) Doble Equipo: el golpe puede dar a una copia
  try{ if(V12.dobleq && T && !T.dead && T.v12cl > 0 && T.buff > 0 && T.qfx && T.qfx.eva && A && A !== T && dmg > 0 && Math.random() < T.qfx.eva){
    T.v12cl--; if(typeof popAt === 'function') popAt(T, '¡Falló!', '#c9d6f5'); if(typeof fxBurst === 'function') fxBurst(T.x + (Math.random() - .5) * 60, T.y - 10, ['#ffffff', '#c9d6f5'], 10, 120, 0, 6.3, {life: .4});
    if(typeof Sfx !== 'undefined') Sfx.play('hit_none', .6); return; } }catch(e){}
  const alive = T && !T.dead, hp0 = T ? T.hp : 0, r = o.apply(this, arguments);
  try{ if(V12.combo && g && T && A && A !== T && T.hp < hp0){
    if(v12Mine(T)) V12cb.n = 0;                                                                   // te han dado: se corta el combo
    else if(v12Mine(A) && !A.burst && g.t - V12cb.t > .22){                                      // (los rayos y chorros, que pegan muchas veces seguidas, no cuentan)
      V12cb.n = g.t - V12cb.t < V12.comboT ? V12cb.n + 1 : 1; V12cb.t = g.t;
      if(V12cb.n >= V12.comboMin) V12cb.show = {n: V12cb.n, t0: performance.now()}; } } }catch(e){}
  return r; }; }
function v12ComboDraw(){
  const S = V12cb.show; if(!S) return; const t = (performance.now() - S.t0) / 1000; if(t > 1.4){ V12cb.show = null; return; }
  const sc = t < .12 ? .6 + .6 * (t / .12) : t < .22 ? 1.2 - .2 * ((t - .12) / .1) : 1, A = t > 1 ? 1 - (t - 1) / .4 : 1;
  ctx.save(); ctx.translate(W / 2, 220); ctx.scale(sc, sc); v12Text(`¡${S.n} GOLPES SEGUIDOS!`, 0, 0, 24, '#ffffff', S.n >= 6 ? '#ff5a8a' : S.n >= 4 ? '#ff9a3a' : '#ffd84a', 'center', A); ctx.restore();
}

// ---------------- 4) DOBLE EQUIPO ----------------
if(V12.dobleq){
  if(typeof MOVES !== 'undefined') MOVES['Doble Equipo'] = MOVES['Doble Equipo'] || {t: 'normal', s: 3};
  if(typeof LEARN !== 'undefined' && !LEARN['Doble Equipo']) LEARN['Doble Equipo'] = '1-1025';             // (MT en casi todas las generaciones)
  if(typeof MOVE_DESC !== 'undefined') MOVE_DESC['Doble Equipo'] = 'Crea copias de sí mismo: algunos golpes dan a una copia y fallan.';
  if(typeof Q_FX !== 'undefined') Q_FX['Doble Equipo'] = {eva: V12.eva, spd: 1.1, tx: '¡Doble Equipo!'};
  if(typeof qApply === 'function'){ const o = qApply; qApply = function(f, nm){ const r = o.apply(this, arguments); if(nm === 'Doble Equipo'){ f.v12cl = 3; f.v12t0 = g ? g.t : 0; } return r; }; }
  if(typeof qLines === 'function'){ const o = qLines; qLines = function(nm){ const r = o.apply(this, arguments); const q = (typeof Q_FX !== 'undefined' && Q_FX[nm]) || {};
    if(q.eva) r.list.unshift(`3 copias: cada golpe que te dan tiene un ${Math.round(q.eva * 100)} % de dar a una copia y fallar`); return r; }; }
}
function v12ClonesDraw(){                                                                          // copias medio transparentes girando alrededor
  [...(g.p || []), ...(g.e || [])].forEach(f => { if(!f || f.dead || f.ghost || !(f.v12cl > 0) || !(f.buff > 0) || !f.qfx || !f.qfx.eva) return;
    const u = Math.min(1, (g.t - (f.v12t0 || 0)) / .3);
    for(let i = 0; i < f.v12cl; i++){ const a = g.t * 2.2 + i * 2.094, r = 46 * u, x = f.x + Math.cos(a) * r, y = f.y + Math.sin(a) * r * .45;
      ctx.save(); ctx.globalAlpha = (.35 + .15 * Math.sin(g.t * 20 + i)) * Math.min(1, f.buff / .4);
      try{ drawFrame(ctx, f.m.dex, 'Idle', g.t + i * .3, f.dir, x, y, ESCALA, 0, f.shiny); }catch(e){} ctx.restore(); } });
}

// ---------------- enganches ----------------
if(typeof nvBannerDraw === 'function'){ const o = nvBannerDraw; nvBannerDraw = function(){ const r = o.apply(this, arguments); try{ if(g){ v12BanDraw(); v12GoDraw(); v12ComboDraw(); } }catch(e){} return r; }; }   // en pantalla
if(typeof windDraw === 'function'){ const o = windDraw; windDraw = function(){ const r = o.apply(this, arguments); try{ if(g) v12ClonesDraw(); }catch(e){} return r; }; }        // debajo de los Pokémon
