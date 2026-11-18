"use strict";
/* =====================================================================
   GOLPES QUE SE LANZAN SOBRE EL RIVAL: con garras, colmillos, puños, tajos... (LG.re) el golpe (clic izquierdo) ya no se queda en el sitio:
   si el rival está a media distancia (entre LG.min y LG.max px), el Pokémon se lanza hacia él a toda velocidad (deja estela de copias y polvo)
   y al llegar suelta el golpe con un pequeño parón y temblor. Si está pegado, el golpe sale como siempre.
   El rival de la IA también se lanza a veces (LG.ia veces por segundo como mucho). En el online no se usa.
   LG.on = false lo apaga.
   ===================================================================== */
const LG = {on: true, min: 85, max: 300, maxIA: 230, vel: 1500, para: 52, tmax: .32, ia: .9, parada: .05,
  re: /garra|colmillo|tajo|cuchillada|pu[ñn]o|zarpazo|mordisco|corte|cabezazo|patada|puya|furia|golpe a[eé]reo|acua cola|cola f[eé]rrea|cola dragón|cola|cuerno|arañazo|placaje|carga|lengüetazo|tijera|cizalla|machada|demolición|pisot[oó]n|ala de acero|ataque ala|picotazo|pico/i};
const lgMove = f => { try{ const nm = mvName(f, 1); return nm && LG.re.test(nm) && !JUMP_MOVE[nm] && !SPIN_MOVE[nm] && !/ataque r[aá]pido|velocidad extrema|tumba rocas/i.test(nm) ? nm : null; }catch(e){ return null; } };
const lgCost = f => typeof enCost === 'function' ? enCost(f, 1) : MV[1].en;
function lgCan(f, T){
  if(!LG.on || !g || g.pvp || !f || !T || f.dead || T.dead || T.ghost || f.ghost) return false;
  if(f.wind || f.jump || f.ride || f.burst || f.boca || f.quick || f.v13l || f.draco || (typeof cant === 'function' && cant(f))) return false;
  if(f.cd[1] > 0 || f.en < lgCost(f) || !lgMove(f)) return false;
  const d = Math.hypot(T.x - f.x, T.y - f.y), mx = (typeof feelFoe === 'function' && feelFoe(f)) ? LG.maxIA : LG.max;
  return d > LG.min && d < mx;
}
if(typeof use === 'function'){ const o = use; use = function(f, i, ang, mine){
  if(f && f.v13l) return;                                                                       // ya se está lanzando
  if(i === 1){ const T = typeof foe === 'function' ? foe(mine) : null;
    if(lgCan(f, T)){
      f.v13l = {t: 0, mine, chg: f.chg, chgP: f.chgP, trail: []}; f.dir = dirOf(Math.atan2(T.y - f.y, T.x - f.x));
      setAct(f, 'Walk', LG.tmax + .1);
      try{ const I = idleInfo(f.m.dex); fxBurst(f.x, f.y + I.foot * ESCALA - 4, ['#e8dcc4', '#c9b893', '#ffffff'], 10, 160, Math.atan2(T.y - f.y, T.x - f.x) + Math.PI, 1.2, {life: .4, s: 2, drag: .88}); }catch(e){}
      if(typeof Sfx !== 'undefined') Sfx.play('dash', mine ? .8 : .5);
      return; } }
  return o.apply(this, arguments); }; }
function lgTick(dt){
  [...g.p, ...g.e].forEach(f => { const L = f && f.v13l; if(!L) return;
    const T = foe(L.mine); L.t += dt;
    if(!T || T.dead || f.dead || (typeof cant === 'function' && cant(f))){ f.v13l = null; return; }
    const a = Math.atan2(T.y - f.y, T.x - f.x), d = Math.hypot(T.x - f.x, T.y - f.y), step = LG.vel * dt;
    L.trail.push({x: f.x, y: f.y, t: g.t, dir: f.dir, act: f.act, at: f.at}); if(L.trail.length > 6) L.trail.shift();
    f.dir = dirOf(a);
    if(d - step > LG.para && L.t < LG.tmax){ f.x += Math.cos(a) * step; f.y += Math.sin(a) * step; return; }
    if(d > LG.para){ const k = d - LG.para; f.x += Math.cos(a) * k; f.y += Math.sin(a) * k; }
    lgEnd(f, L, a);
  });
}
function lgEnd(f, L, a){                                                                         // llega: suelta el golpe de verdad
  f.v13l = null; LG_TR.push({f, trail: L.trail, t0: g.t});
  const c0 = f.chg, p0 = f.chgP; f.chg = L.chg; f.chgP = L.chgP;
  try{ lgUse(f, 1, a, L.mine); }finally{ f.chg = c0; f.chgP = p0; }
  if(typeof fxhd !== 'undefined') fxhd.stop = Math.max(fxhd.stop || 0, LG.parada); fx.shake = Math.max(fx.shake, 3);
}
const lgUse = (f, i, a, mine) => { f.v13l = null; LG.skip = 1; try{ use(f, i, a, mine); }finally{ LG.skip = 0; } };
// para que el use() de lgEnd no vuelva a lanzarse: con LG.skip, lgCan dice que no
{ const c = lgCan; lgCan = function(){ return LG.skip ? false : c.apply(this, arguments); }; }

// La IA: a media distancia, a veces se lanza
let LG_TR = [], lgIaT = 0;
function lgIA(dt){
  if(!LG.on || !g || g.pvp || !(LG.ia > 0) || typeof enemyAI === 'undefined') return;
  const E = g.e[g.ei], P = g.p[g.pi]; if(!E || !P || E.dead) return;
  if(Math.random() < dt * LG.ia && lgCan(E, P)) use(E, 1, Math.atan2(P.y - E.y, P.x - E.x), false);
}
// Dibujo: estela de copias detrás del que se lanza (debajo de los Pokémon)
function lgDraw(){
  const all = [];
  [...g.p, ...g.e].forEach(f => { if(f && f.v13l) all.push({f, trail: f.v13l.trail, live: 1}); });
  LG_TR = LG_TR.filter(T => g.t - T.t0 < .25); LG_TR.forEach(T => all.push(T));
  for(const T of all){ const n = T.trail.length, fade = T.live ? 1 : 1 - (g.t - T.t0) / .25;
    T.trail.forEach((p, k) => { ctx.save(); ctx.globalAlpha = .12 + .3 * (k + 1) / n * fade;
      try{ drawFrame(ctx, T.f.m.dex, 'Walk', p.at || 0, p.dir, p.x, p.y, ESCALA, 0, T.f.shiny); }catch(e){}
      ctx.restore(); }); }
}
// Mientras se lanza no anda por su cuenta; animación de salto hacia delante si la tiene
if(typeof move === 'function'){ const o = move; move = function(f){ if(f && f.v13l) return; return o.apply(this, arguments); }; }
if(typeof anPick === 'function'){ const o = anPick; anPick = function(f){ if(f && f.v13l && typeof anHas === 'function'){ if(anHas(f, 'LeapForth')) return ['LeapForth', f.v13l.t]; if(anHas(f, 'Walk')) return ['Walk', f.v13l.t * 3]; } return o.apply(this, arguments); }; }
if(typeof spkTick === 'function'){ const o = spkTick; spkTick = function(dt){ const r = o.apply(this, arguments); try{ if(g && !g.paused){ lgTick(dt); lgIA(dt); } }catch(e){ console.warn('lanzarse', e); } return r; }; }
if(typeof windDraw === 'function'){ const o = windDraw; windDraw = function(){ const r = o.apply(this, arguments); try{ if(g) lgDraw(); }catch(e){} return r; }; }
