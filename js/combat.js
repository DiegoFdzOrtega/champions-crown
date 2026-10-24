"use strict";
/* =====================================================================
   4) COMBATE EN TIEMPO REAL
   ===================================================================== */
const foe = mine => mine ? g.e[g.ei] : g.p[g.pi];
const rad = f => Math.max(26, idleInfo(f.m.dex).fw * ESCALA * .3);   // tamaño para recibir golpes
function setAct(f, name, dur){ f.act = name; f.at = 0; f.lock = dur; }

function hit(T, dmg, type, A, close, big, mvn){       // A = quien ataca · close = golpe cuerpo a cuerpo · mvn = nombre del movimiento (solo para el efecto visual)
  if(T.dead || T.ghost) return;                       // ghost: está entrando o saliendo con la animación de cambio (swap.js): no recibe golpes
  const mult = eff(type, T.m.types);
  const foeAtk = !!(A && g.e.includes(A));
  const scope = (A && A.item === 'periscopio') ? IFX.periscopio : 0;                                      // Periscopio: más probabilidad de crítico
  const crit = mult > 0 && Math.random() < (CRIT.chance + scope) * (big ? CRIT.big : 1) * (foeAtk ? CRIT.foe : 1);   // golpe crítico (solo si el golpe hace daño)
  let dealt = dmg * mult * (crit ? CRIT.mult : 1) * (T.item === 'chaleco' ? .8 : 1)                       // Chaleco Asalto: -20% de daño
              / (T.defm || 1)                                                                          // resistencia por IVs/EVs/naturaleza (solo tus Pokémon)
              * (A && A.item === 'cinturon' && mult >= 2 ? IFX.cinturon : 1);                              // Cinturón de Experto: +20% si es muy eficaz
  if(T.item === 'aguante' && !T.aguanteUsado && dealt > 0 && T.hp >= T.max - 1e-6 && dealt >= T.hp){      // Banda Aguante: sobrevive 1 vez con 1 PS
    dealt = T.hp - 1; T.aguanteUsado = true; g.pops.push({x:T.x, y:T.y-150, txt:'¡Aguanta!', t:1.2, c:'#ff7a7a', s:12});
  }
  T.hp -= dealt;
  if(A && A.item === 'roca' && mult > 0 && T.hp > 0 && Math.random() < IFX.rocaProb){                    // Roca del Rey: amedrenta
    T.stun = IFX.rocaStun; setAct(T, 'Hurt', IFX.rocaStun); g.pops.push({x:T.x, y:T.y-150, txt:'¡Amedrentado!', t:1, c:'#ffd24a', s:11});
  }
  if(A && !A.dead){
    if(A.item === 'cascabel') A.hp = Math.min(A.max, A.hp + dealt*.15);                      // Cascabel Concha
    if(close && T.item === 'casco' && dealt > 0) A.hp = Math.max(1, A.hp - A.max*.08);      // Casco Dentado
  }
  const txt = mult===0 ? 'Sin efecto' : mult>=2 ? '¡Muy eficaz!' : mult<1 ? 'Poco eficaz' : '';
  if(txt) g.pops.push({x:T.x, y:T.y-110, txt, t:.9});
  if(crit){                                                                                           // aviso, chispas y temblor extra
    g.pops.push({x:T.x, y:T.y-132, txt:'¡CRÍTICO!', t:1.1, c:'#ff9a3a', s:13});
    fxBurst(T.x, T.y-30, ['#ffe066', '#ffffff', '#ff9a3a'], 14, 200); fx.shake = Math.max(fx.shake, 7);
  }
  fxHit(T, mvn, type, mult, big, close, A);                                                          // efecto visual del impacto
  if(T.hp <= 0){ T.hp = 0; T.dead = true; T.dt = 0; setAct(T, 'Faint', 99); }
  else if(mult > 0) setAct(T, 'Hurt', .3);
}
function melee(f, ang, dmg, type, mine, mvn){
  const T = foe(mine), dx = T.x-f.x, dy = T.y-f.y;
  if(T.dead || T.ghost || Math.hypot(dx,dy) > 90 + rad(T)) return;
  let d = Math.abs(Math.atan2(dy,dx) - ang); d = Math.min(d, 2*Math.PI - d);
  if(d < 1) hit(T, dmg, type, f, true, false, mvn);
}
function shot(f, ang, dmg, speed, r, type, mine){
  const s = {x:f.x, y:f.y, vx:Math.cos(ang)*speed, vy:Math.sin(ang)*speed, dmg, r, type, mine, life:2, o:f, t0:g.t, acc:0};
  g.shots.push(s); return s;
}
// Tipo de cada ataque: usa los tipos del Pokémon (o los que pongas en 'mt')
function mtype(f, i){
  const m = f.m, k = {1:0, 2:1, 4:2}[i];
  return (m.mt && k !== undefined) ? m.mt[k] : (i === 2 ? (m.types[1] || m.types[0]) : m.types[0]);
}

function use(f, i, ang, mine){
  const m = MV[i];
  if(f.dead || f.stun > 0 || f.cd[i] > 0 || f.en < m.en) return;                // amedrentado (Roca del Rey): no puede atacar
  f.cd[i] = m.cd; f.en -= m.en; f.dir = dirOf(ang);
  const t = mtype(f, i), shotMv = (i === 2 || i === 4), it = f.item, boost = ITEMS[it] && ITEMS[it].type === t ? IFX.tipo : 1;   // objetos de tipo
  const d = f.dmg * (f.buff > 0 ? 1.3 : 1) * (it === 'vidasfera' ? 1.3 : 1) * boost
          * (it === 'cintaelec' && i === 1 ? IFX.cinta : 1) * (it === 'gafaselec' && shotMv ? IFX.gafaselec : 1) * (it === 'gafasesp' && shotMv ? IFX.gafasesp : 1);
  if(f.item === 'vidasfera' && (i === 1 || i === 2 || i === 4)) f.hp = Math.max(1, f.hp - f.max*.025);   // Vidasfera
  if(i === 0){ f.dash = .25; f.da = ang; }
  const nm = mvName(f, i);                                                  // nombre real del movimiento: decide la animación
  if(i === 1){ setAct(f,'Attack',.45); fxMelee(f, ang, foe(mine), nm, t);  melee(f, ang, m.dmg*d, t, mine, nm); }
  if(i === 2){ setAct(f,'Shoot',.4);   fxShotStart(f, shot(f, ang, m.dmg*d, 520, 9, t, mine), nm, false); }
  if(i === 3){ setAct(f,'Charge',.6);  fxBuff(f, nm, t);                  f.buff = 5; }
  if(i === 4){ setAct(f,'Charge',.6);  fxShotStart(f, shot(f, ang, m.dmg*d, 380, 22, t, mine), nm, true); }
}

function move(f, dx, dy, dt, k){
  const l = Math.hypot(dx,dy), sp = f.m.spd * (f.spdm || 1) * (f.buff > 0 ? 1.25 : 1) * (f.item === 'panuelo' ? 1.35 : 1);
  let vx = 0, vy = 0;
  if(f.stun > 0){ f.mv = false; return; }                                       // amedrentado: no se mueve
  if(f.dash > 0){ vx = Math.cos(f.da)*sp*3; vy = Math.sin(f.da)*sp*3; }
  else if(l){ vx = dx/l*sp*k; vy = dy/l*sp*k; }
  f.mv = l > 0 || f.dash > 0;
  f.x = clamp(f.x + vx*dt, 50, W-50); f.y = clamp(f.y + vy*dt, 140, H-110);
}

function update(dt){
  if(!g){ if(fx.list.length || fx.parts.length) fxClear(); return; }
  if(g.over || g.paused) return;                              // en pausa (Esc) nada se mueve
  g.t += dt;
  if(g.count > 0){ g.count -= dt; return; }
  g.clock += dt;
  const P = g.p[g.pi], E = g.e[g.ei];

  if(!P.dead && !P.ghost){                       // ghost = en pleno cambio de Pokémon: sin controles hasta que termine la animación
    const dx = (keys.KeyD||keys.ArrowRight?1:0) - (keys.KeyA||keys.ArrowLeft?1:0);
    const dy = (keys.KeyS||keys.ArrowDown?1:0) - (keys.KeyW||keys.ArrowUp?1:0);
    const aim = Math.atan2(mouse.y-P.y, mouse.x-P.x);
    move(P, dx, dy, dt, 1); P.dir = dirOf(aim);
    if(mouse.l) use(P,1,aim,true);
    if(mouse.r) use(P,2,aim,true);
    if(keys.Space) use(P,0, (dx||dy) ? Math.atan2(dy,dx) : aim, true);
    if(keys.KeyQ) use(P,3,aim,true);
    if(keys.KeyE) use(P,4,aim,true);
  }
  if(!E.dead && !E.ghost){                       // IA del rival (no actúa mientras su Pokémon entra con la animación)
    const sk = g.o.skill, ang = Math.atan2(P.y-E.y, P.x-E.x), dist = Math.hypot(P.x-E.x, P.y-E.y);
    const want = dist > 240 ? 1 : dist < 140 ? -1 : 0, side = Math.sin(g.t*1.2 + g.ei*2);
    move(E, Math.cos(ang)*want + Math.cos(ang+1.57)*side, Math.sin(ang)*want + Math.sin(ang+1.57)*side, dt, .5 + .4*sk);
    E.dir = dirOf(ang);
    const err = (1-sk)*.6*(Math.random()-.5), r = Math.random;
    if(!P.ghost){                                // si tu Pokémon está cambiando, el rival se mueve pero no ataca
      if(dist < 120 && r() < dt*6) use(E,1,ang,false);
      else if(r() < dt*(1+3*sk)) use(E,2,ang+err,false);
      if(r() < dt*.5*sk) use(E,4,ang+err,false);
      if(r() < dt*.25*sk) use(E,3,ang,false);
      if(r() < dt*.3*sk) use(E,0,ang+1.57,false);
    }
  }
  for(const f of [P,E]){                         // tiempos de cada uno
    for(let i=0;i<5;i++) f.cd[i] = Math.max(0, f.cd[i]-dt);
    if(f.item === 'restos' && !f.dead) f.hp = Math.min(f.max, f.hp + f.max*IFX.restos*dt);   // Restos (IFX.restos en data.js)
    if(f.dash > 0 && !f.dead && (f.fxd = (f.fxd || 0) - dt) <= 0){ f.fxd = .045; fxDust(f); }          // polvo al correr
    if(f.stun > 0) f.stun -= dt;
    f.en = Math.min(100, f.en + EN_REGEN*dt); f.buff -= dt; f.dash -= dt; f.at += dt; f.lock -= dt;
    if(!f.dead && f.lock <= 0){ const w = f.mv ? 'Walk' : 'Idle'; if(f.act !== w){ f.act = w; f.at = 0; } }
  }
  for(const s of g.shots){                       // proyectiles
    s.x += s.vx*dt; s.y += s.vy*dt; s.life -= dt;
    const T = foe(s.mine);
    if(!T.dead && !T.ghost && Math.hypot(s.x-T.x, s.y-T.y) < rad(T) + s.r){ hit(T, s.dmg, s.type, s.o, false, s.r > 15, s.mvn); s.life = 0; }
    if(s.x<0 || s.x>W || s.y<0 || s.y>H) s.life = 0;
  }
  g.shots = g.shots.filter(s => s.life > 0);
  g.pops.forEach(p => p.t -= dt); g.pops = g.pops.filter(p => p.t > 0);
  fxUpdate(dt);
  swapUpdate(dt);                                // animación de cambio de Pokémon (swap.js)
  if(g.swCd > 0) g.swCd = Math.max(0, g.swCd - dt);                  // espera entre cambios (SWITCH_CD)
  if(g.swNote > 0) g.swNote -= dt;

  if(E.dead){ E.dt += dt; if(E.dt > 1){ const n = g.e.findIndex(f=>!f.dead); if(n<0) return endBattle(true);  swapStart('e', n, true); } }
  if(P.dead){ P.dt += dt; if(P.dt > 1){ const n = g.p.findIndex(f=>!f.dead); if(n<0) return endBattle(false); swapStart('p', n, true); } }
}

const SWITCH_CD = 5;                              // segundos de espera entre un cambio tuyo y el siguiente (empieza a contar cuando el nuevo Pokémon ya ha salido)
function switchMon(i){                            // cambio VOLUNTARIO (teclas 1 2 3 · R · clic en los cuadritos del HUD). El cambio por debilitamiento no pasa por aquí.
  if(!g || g.over || g.paused || g.count > 0) return;
  if(i === undefined){ for(let k=1;k<=3;k++){ const j=(g.pi+k)%3; if(!g.p[j].dead){ i=j; break; } } }
  if(i===undefined || g.p[i].dead || i===g.pi || g.p[g.pi].dead) return;
  if(swapBusy()) return;                          // ya hay un cambio en marcha: no se empieza otro hasta que acabe la animación
  if(g.swCd > 0){ g.swNote = 1.6; return; }       // aún en espera: se avisa en el HUD ("ESPERA 3 s") y no se cambia
  swapStart('p', i, false).vol = true;            // la animación (swap.js) hace el cambio: retirada, lanzamiento y apertura · vol = voluntario: al acabar empieza la espera de SWITCH_CD
}
