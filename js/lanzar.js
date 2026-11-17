"use strict";
/* =====================================================================
   EL ENTRENADOR LANZA LA POKÉ BALL
   - AL EMPEZAR EL COMBATE (durante la cuenta atrás): primero tú y luego el rival lanzáis vuestra Poké Ball; vuela en arco, se abre
     y sale el Pokémon (la misma animación que al cambiar, js/swap.js). Hasta que se abre, el Pokémon no se ve.
   - En el ESTADIO (Torre, Campo, gimnasios de las regiones, Clasificatoria) el entrenador hace el gesto: echa el brazo atrás con la bola
     en la mano, da un saltito hacia delante al soltarla y vuelve a su sitio. También en cada cambio de Pokémon.
   LZ.on = false lo apaga (los Pokémon aparecen ya fuera, como antes).
   ===================================================================== */
const LZ = {on: true, first: .25, gap: .55, wind: .35};                  // [AJUSTE] encendido · cuándo lanzas tú (s) · cuánto después lanza el rival · segundos de coger impulso
const lzNow = () => performance.now() / 1000;
let lzOp = [];                                                            // lanzamientos del principio del combate
const lzPose = {p: null, e: null};                                        // cuándo suelta la bola cada entrenador (para el gesto)

function lzOrigin(side){                                                  // de dónde sale la bola: la mano del entrenador (estadio) o su sitio de siempre
  if(typeof teOn === 'function' && teOn() && typeof grAnchor === 'function'){ const A = grAnchor(side), fwd = side === 'p' ? 1 : -1; return {x: A.x + fwd * 14, y: A.y + 22}; }
  return swOrigin(side);
}
function lzOpening(){
  lzOp = []; if(!LZ.on || !g || !g.p || !g.e) return;
  const now = lzNow();
  [['p', g.p[g.pi], 0], ['e', g.e[g.ei], 1]].forEach(([side, f, k]) => {
    if(!f || f.dead) return; f.ghost = true;
    const rel = now + LZ.first + k * LZ.gap + LZ.wind;                    // momento en que suelta la bola
    lzPose[side] = rel;
    lzOp.push({side, to: f, from: f, t0: rel, tR: 0, tT: SWAP.thrown, tO: SWAP.open, L: {x: f.x, y: f.y}, bt: swBallType(f), bf: swBallType(f), swapped: true, opened: false});
  });
}
function lzStep(){
  if(!lzOp.length) return;
  if(!g || g.over){ lzOp.forEach(s => s.to.ghost = false); lzOp = []; return; }
  const now = lzNow();
  for(const s of lzOp){
    s.t = Math.max(0, now - s.t0); if(!s.O) s.O = lzOrigin(s.side);
    s.L.x = s.to.x; s.L.y = s.to.y;                                        // por si se ha movido (online)
    const I = idleInfo(s.to.m.dex), bx = s.L.x, by = s.L.y + I.foot * ESCALA - 8;
    if(!s.opened && s.t >= s.tT + s.tO * .2){ s.opened = true; const B = (typeof BALLS !== 'undefined' && BALLS[s.bt]) || {top: '#e23b3b'};
      fxBurst(bx, by - 8, ['#ffffff', '#ffffff', '#fff3b0', '#bfe6ff', B.top], 34, 230, -Math.PI / 2, 5.8, {life: .65, s: 2, rise: .25});
      fx.shake = Math.max(fx.shake, 3); if(typeof Sfx !== 'undefined') Sfx.play('sendout'); }
  }
  lzOp = lzOp.filter(s => { if(s.t >= s.tT + s.tO){ s.to.ghost = false; return false; } return true; });
}
function lzDraw(){
  lzStep();
  for(const s of lzOp){ if(lzNow() < s.t0) continue; try{ swDrawOne(s); }catch(e){} }
}

// ---- El gesto del entrenador en el estadio: brazo atrás con la bola, saltito al soltar y vuelta ----
function lzPoseOf(side){                                                  // devuelve {rot, dy, sx, sy, ball} o null
  const rel = lzPose[side]; if(rel == null) return null;
  const u = lzNow() - rel + LZ.wind; if(u < 0 || u > LZ.wind + .55) return null;
  if(u < LZ.wind){ const k = u / LZ.wind, e = k * k * (3 - 2 * k); return {rot: -.5 * e, dy: 3 * e, sx: 1, sy: 1 - .1 * e, ball: true}; }       // coge impulso
  const v = (u - LZ.wind) / .55, rot = v < .25 ? -.5 + .95 * (v / .25) : .45 * (1 - (v - .25) / .75), hop = Math.sin(Math.min(1, v / .5) * Math.PI) * 16;
  return {rot, dy: -hop, sx: 1 + .05 * Math.sin(v * Math.PI), sy: 1, ball: false};
}
if(typeof teTrainers === 'function'){
  teTrainers = function(t){                                               // igual que en js/torreestadio.js, con el gesto de lanzar
    const sk = typeof skinOf === 'function' ? skinOf() : save.gender;
    const me = teTrainerOf([sk, save.gender === 'f' ? 'f' : 'm']);
    const foe = teTrainerOf([g.o.foeSkin, g.o.leader, g.o.rival, (g.o.portrait || '').split('/').pop().replace(/\.\w+$/, ''), g.o.leaderName && g.o.leaderName.toLowerCase()]);
    const s = 2.2, P0 = teR2W([...TE_EST.plat[0], 0, 0]), P1 = teR2W([...TE_EST.plat[1], 0, 0]), y = P0.y + 8;
    const swp = g.pvp && g.me === 'e';
    [[swp ? foe : me, P0.x, true, swp ? 'e' : 'p'], [swp ? me : foe, P1.x, false, swp ? 'p' : 'e']].forEach(([T, x, right, side]) => {
      if(!T) return; const P = LZ.on ? lzPoseOf(side) : null, bob = P ? 0 : (Math.sin(t * 2.4 + (right ? 0 : 1.7)) > .6 ? -2 : 0);
      ctx.save(); ctx.translate(x, y + bob + (P ? P.dy : 0)); ctx.imageSmoothingEnabled = false;
      if(right) ctx.scale(-1, 1);                                          // (a la izquierda el dibujo va dado la vuelta: mira hacia el campo)
      if(P){ ctx.rotate(-P.rot); ctx.scale(P.sx, P.sy); }                  // gira desde los pies: atrás al coger impulso, adelante al soltar
      ctx.drawImage(MINI.img, (T.i % MINI.cols) * 32, Math.floor(T.i / MINI.cols) * 32, 32, 32, -16 * s, -30 * s, 32 * s, 32 * s);
      if(P && P.ball){ const mf = side === 'p' ? g.p[g.pi] : g.e[g.ei], im = mf && mf.m ? swBallImg(swBallType(mf)) : null, bs = 16;   // la bola en la mano, por encima del hombro de atrás
        if(im && im.complete && im.naturalWidth) ctx.drawImage(im, 9 * s - bs / 2, -26 * s - bs / 2, bs, bs);
        else { ctx.fillStyle = '#e23b3b'; ctx.beginPath(); ctx.arc(9 * s, -26 * s, bs / 2, 0, 6.283); ctx.fill(); } }
      ctx.restore();
    });
  };
}

// ---- Enganches ----
{ const o = startBattle; startBattle = function(){ const r = o.apply(this, arguments); try{ lzOpening(); }catch(e){} return r; }; }
{ const o = swapStart; swapStart = function(side, idx, quick){             // en cada cambio, el entrenador del estadio también hace el gesto
    const s = o.apply(this, arguments); try{ if(s) lzPose[side] = lzNow() + s.tR; }catch(e){} return s; }; }
{ const o = swapDraw; swapDraw = function(){ o.apply(this, arguments); try{ lzDraw(); }catch(e){} }; }
