/* =====================================================================
   TERREMOTO CON SALTO: el Pokémon coge impulso, salta hacia arriba y cae de golpe contra el suelo;
   la onda del Terremoto (daño, temblor, grietas) sale justo cuando aterriza.
   - Juego: el golpe original (quakeStart de combat.js) se retrasa TJ.T segundos. Se cuenta con el dt
     del combate, así que el online sigue igual en los dos lados (PVP_VER subido a 34).
   - Dibujo: el sprite sube y baja (fxLunge), la sombra se queda en el suelo; Hop al subir, HitGround al caer.
   ===================================================================== */
const TJ = {T: .46, H: 110, pre: .07, top: .62, hop: true};   // [AJUSTE] segundos hasta el impacto · altura del salto (px) · agacharse antes · cuándo empieza a caer (0-1)

function tjAlto(J){                                 // altura del sprite en cada momento del salto
  const u = J.t / TJ.T;
  if(u < TJ.pre / TJ.T) return -6 * Math.sin(Math.PI * u / (TJ.pre / TJ.T));                    // se agacha un poco
  if(u < TJ.top){ const v = (u - TJ.pre / TJ.T) / (TJ.top - TJ.pre / TJ.T); return TJ.H * (1 - Math.pow(1 - v, 2.2)); }   // sube frenando
  const v = Math.min(1, (u - TJ.top) / (1 - TJ.top)); return TJ.H * (1 - v * v * v);           // cae acelerando, de golpe
}

if(typeof quakeStart === 'function'){ const o = quakeStart; quakeStart = function(f, w, wp){
  if(!f || f.tjGo) return o.apply(this, arguments);
  if(f.tjJ) return;                                                                     // ya está en el aire
  f.tjJ = {t: 0, w, wp, x0: f.x, y0: f.y};
  setAct(f, 'Attack', TJ.T + .35);
  try{ const I = idleInfo(f.m.dex); fxBurst(f.x, f.y + I.foot * ESCALA - 3, ['#c8b48a', '#e6dcc4', '#8a7a62'], 10, 120, -Math.PI / 2, 2.4, {life: .4, s: 2.5, rise: -.2, drag: .88}); }catch(e){}
  try{ if(typeof Sfx !== 'undefined') Sfx.play('swing', .9); }catch(e){}
}; }

if(typeof quakeTick === 'function'){ const o = quakeTick; quakeTick = function(f, dt){
  const J = f && f.tjJ;
  if(J){
    if(f.dead || f.hp <= 0){ f.tjJ = null; }
    else { J.t += dt; if(J.t >= TJ.T){ f.tjJ = null; f.tjGo = 1; try{ quakeStart(f, J.w, J.wp); } finally { f.tjGo = 0; } } }
  }
  return o.apply(this, arguments);
}; }

// el sprite sube y baja (la sombra se queda abajo)
if(typeof fxLunge === 'function'){ const o = fxLunge; fxLunge = function(f){
  const r = o.apply(this, arguments); if(f && f.tjJ){ r.y -= tjAlto(f.tjJ); } return r; }; }

// animación: al subir, los cuadros "en el aire" de Hop; al caer, HitGround si lo tiene. Sin Hop, quieto (el Attack de muchos se lanza hacia delante y se vería desplazado)
if(typeof anPick === 'function'){ const o = anPick; anPick = function(f){
  const J = f && f.tjJ; if(!J || f.dead || typeof anHas !== 'function') return o.apply(this, arguments);
  const u = J.t / TJ.T, fps = (typeof ANIMS !== 'undefined' && ANIMS.Hop && ANIMS.Hop.fps) || 10;
  if(u >= TJ.top && anHas(f, 'HitGround')) return ['HitGround', 0];
  if(TJ.hop && anHas(f, 'Hop')){ const S = sheet(f.m.dex, 'Hop', false), n = (S && S.info && S.info.n) || 6;
    const fr = u < TJ.pre / TJ.T ? 0 : Math.min(n - 2, Math.max(1, Math.round(1 + (n - 3) * Math.min(1, u / TJ.top))));
    return ['Hop', (fr + .5) / fps]; }
  return ['Idle', 0];
}; }

// estela al caer: líneas de velocidad encima del Pokémon (se dibujan justo antes que él)
function tjEstela(f){
  const J = f && f.tjJ; if(!J || !f.m) return;
  const u = J.t / TJ.T; if(u < TJ.top) return;
  const v = (u - TJ.top) / (1 - TJ.top), h = tjAlto(J), top = f.y - h - 40;
  ctx.save(); ctx.globalAlpha = .6 * (1 - v * .3); ctx.strokeStyle = '#fff4d6'; ctx.lineCap = 'round';
  for(let i = 0; i < 5; i++){ const dx = (i - 2) * 15, len = (24 + 40 * v) * (i === 2 ? 1.3 : 1);
    ctx.lineWidth = i === 2 ? 4 : 2.5; ctx.beginPath(); ctx.moveTo(f.x + dx, top - len); ctx.lineTo(f.x + dx, top); ctx.stroke(); }
  ctx.restore();
}
if(typeof drawF === 'function'){ const o = drawF; drawF = function(f){ try{ tjEstela(f); }catch(e){} return o.apply(this, arguments); }; }
