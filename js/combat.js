"use strict";
/* =====================================================================
   4) COMBATE EN TIEMPO REAL
   ===================================================================== */
const foe = mine => mine ? g.e[g.ei] : g.p[g.pi];
// ---- Combate online (js/pvp.js): «me» = el bando que controlas. En el modo normal siempre es 'p'; en un combate online el que lanzó el desafío es 'p' y el invitado es 'e'. ----
const meSide = () => (g && g.me) || 'p';
const myList = () => meSide() === 'p' ? g.p : g.e, oppList = () => meSide() === 'p' ? g.e : g.p;
const myIdx = () => meSide() === 'p' ? g.pi : g.ei, oppIdx = () => meSide() === 'p' ? g.ei : g.pi;
const myMon = () => myList()[myIdx()];
const myCd = () => meSide() === 'p' ? g.swCd : (g.swCdE || 0);                  // segundos que faltan para poder volver a cambiar de Pokémon
const rad = f => Math.max(26, idleInfo(f.m.dex).fw * ESCALA * .3);   // tamaño para recibir golpes
function setAct(f, name, dur){ f.act = name; f.at = 0; f.lock = dur; }

// Sonido del golpe según la eficacia (js/music.js: hit, hit_super, hit_weak, hit_none) + chispa si es crítico + caída si se debilita
function hitSfx(mult, crit, dead){
  Sfx.play(mult === 0 ? 'hit_none' : mult >= 2 ? 'hit_super' : mult < 1 ? 'hit_weak' : 'hit');
  if(crit) Sfx.play('crit');
  if(dead) setTimeout(() => Sfx.play('faint'), 230);
}
function hit(T, dmg, type, A, close, big, mvn){       // A = quien ataca · close = golpe cuerpo a cuerpo · mvn = nombre del movimiento (solo para el efecto visual)
  if(T.dead || T.ghost) return;                       // ghost: está entrando o saliendo con la animación de cambio (swap.js): no recibe golpes
  const R = abHit(T, A, type, eff(type, T.m.types), close, big, mvn);                                     // habilidades (js/abilities.js): inmunidades, daño que haces y recibes, esquivar
  if(R.imm || R.dodge){                                                                                   // la habilidad lo ha parado
    if(!R.heal) g.pops.push({x:T.x, y:T.y-110, txt: R.dodge ? '¡Esquivó!' : 'Sin efecto', t:.9});
    Sfx.play(R.dodge ? 'dodge' : 'hit_none');
    abPop(T, (R.imm || R.dodge).toUpperCase()); fxBurst(T.x, T.y - 20, ['#ffffff', '#c8c8d4'], 6, 70); return;
  }
  const mult = R.mult;
  const foeAtk = !g.pvp && !!(A && g.e.includes(A));                                              // (en un combate online nadie es «el rival»: no hay crítico extra)
  const scope = (A && A.item === 'periscopio') ? IFX.periscopio : 0;                                      // Periscopio: más probabilidad de crítico
  const crit = mult > 0 && !R.noCrit && Math.random() < (CRIT.chance + scope) * (big ? CRIT.big : 1) * (foeAtk ? CRIT.foe : 1);   // golpe crítico (solo si el golpe hace daño)
  let dealt = dmg * mult * (crit ? CRIT.mult * R.critMul : 1) * (T.item === 'chaleco' && !(A && A.ab === 'Infiltrador') ? .8 : 1)   // Chaleco Asalto: -20% de daño
              * R.out * R.inn                                                                          // habilidades: daño que haces y que recibes
              / (T.defm || 1)                                                                          // resistencia por IVs/EVs/naturaleza (solo tus Pokémon)
              * (A && A.item === 'cinturon' && mult >= 2 ? IFX.cinturon : 1);                              // Cinturón de Experto: +20% si es muy eficaz
  const robusto = defAb(T, A) === 'Robustez';                                                               // Robustez: con la vida al máximo siempre aguanta (no se gasta)
  if((robusto || (T.item === 'aguante' && !T.aguanteUsado)) && dealt > 0 && T.hp >= T.max - 1e-6 && dealt >= T.hp){      // Banda Aguante: sobrevive 1 vez con 1 PS
    dealt = T.hp - 1; g.pops.push({x:T.x, y:T.y-150, txt:'¡Aguanta!', t:1.2, c:'#ff7a7a', s:12});
    if(!robusto){ T.aguanteUsado = true; if(T.ab === 'Liviano' && T.ax){ T.ax.light = true; abPop(T, 'LIVIANO', '#ffe066'); } }
  }
  T.hp -= dealt;
  if(A && A.item === 'roca' && mult > 0 && T.hp > 0) abFlinch(T, A, IFX.rocaProb, IFX.rocaStun);          // Roca del Rey: amedrenta (js/abilities.js: Foco Interno, Polvo Escudo, Dicha...)
  if(A && !A.dead){
    if(A.item === 'cascabel') A.hp = Math.min(A.max, A.hp + dealt*.15);                      // Cascabel Concha
    if(close && T.item === 'casco' && dealt > 0 && A.ab !== 'Muro Mágico') A.hp = Math.max(1, A.hp - A.max*.08);      // Casco Dentado
  }
  const txt = mult===0 ? 'Sin efecto' : mult>=2 ? '¡Muy eficaz!' : mult<1 ? 'Poco eficaz' : '';
  if(txt) g.pops.push({x:T.x, y:T.y-110, txt, t:.9});
  if(crit){                                                                                           // aviso, chispas y temblor extra
    g.pops.push({x:T.x, y:T.y-132, txt:'¡CRÍTICO!', t:1.1, c:'#ff9a3a', s:13});
    fxBurst(T.x, T.y-30, ['#ffe066', '#ffffff', '#ff9a3a'], 14, 200); fx.shake = Math.max(fx.shake, 7);
  }
  fxHit(T, mvn, type, mult, big, close, A);                                                          // efecto visual del impacto
  hitSfx(mult, crit, T.hp <= 0);                                                                       // sonido del impacto
  if(T.hp <= 0){ T.hp = 0; T.dead = true; T.dt = 0; setAct(T, 'Faint', 99); }
  else if(mult > 0) setAct(T, 'Hurt', .3);
  abAfter(T, A, dealt, type, close, crit, big);                                                       // habilidades: efectos al contacto, venganzas, Autoestima...
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
  const m = MV[i], cost = enCost(f, i);                                         // enCost: Presión del rival
  if(f.dead || cant(f) || f.cd[i] > 0 || f.en < cost) return;                   // amedrentado (Roca del Rey) o dormido: no puede atacar
  if(i > 0 && f.truant > 0) return;                                             // Indolente: espera tras su último ataque
  f.cd[i] = m.cd; f.en -= cost; f.dir = dirOf(ang);
  if(i > 0 && statusBlock(f)) return;                                           // paralizado (a veces no puede), confuso o enamorado: se pierde el ataque
  const nm = mvName(f, i), sm = i === 3 && STATUS_MOVES[nm];                    // sm: ataque de estado (js/status.js)
  if(i > 0){ f.lastUse = i; if(f.ab === 'Indolente') f.truant = ABX.indolente; }
  if(sm && f.ab === 'Bromista') f.cd[i] *= ABX.bromistaCd;                      // Bromista: sus ataques de estado se recargan antes
  const t0 = sm ? MOVES[nm].t : (f.ab === 'Normalidad' ? 'normal' : mtype(f, i)), t = (SKIN[f.ab] && t0 === 'normal') ? SKIN[f.ab] : t0, skin = t !== t0, shotMv = (i === 2 || i === 4), it = f.item, boost = ITEMS[it] && ITEMS[it].type === t ? IFX.tipo : 1;   // objetos de tipo
  const d = f.dmg * qAtk(f) * (skin ? ABX.skin : 1) * (it === 'vidasfera' ? 1.3 : 1) * boost
          * (it === 'cintaelec' && i === 1 ? IFX.cinta : 1) * (it === 'gafaselec' && shotMv ? IFX.gafaselec : 1) * (it === 'gafasesp' && shotMv ? IFX.gafasesp : 1);
  if(f.item === 'vidasfera' && (i === 1 || i === 2 || i === 4) && f.ab !== 'Cabeza Roca' && f.ab !== 'Muro Mágico') f.hp = Math.max(1, f.hp - f.max*.025);   // Vidasfera
  if(i === 0){ f.dash = .25; f.da = ang; Sfx.play('dash'); }
  if(i === 1){ setAct(f,'Attack',.45); fxMelee(f, ang, foe(mine), nm, t);  melee(f, ang, m.dmg*d*(f.st && f.st.k === 'brn' ? STX.brn.melee : 1), t, mine, nm); }   // quemado: golpe a la mitad
  if(i === 2){ setAct(f,'Shoot',.4);   fxShotStart(f, shot(f, ang, m.dmg*d, 520, 9, t, mine), nm, false); }
  if(sm){ setAct(f,'Shoot',.4); const s = shot(f, ang, 0, STX.speed * (f.ab === 'Bromista' ? ABX.bromista : 1), STX.r, t, mine); s.status = nm; fxShotStart(f, s, nm, false); }   // ataque de estado: proyectil sin daño
  else if(i === 3){ setAct(f,'Charge',.6);  fxBuff(f, nm, t);                  qApply(f, nm); }      // mejora: cada ataque hace lo suyo (js/qmoves.js)
  if(i === 4){ setAct(f,'Charge',.6);  fxShotStart(f, shot(f, ang, m.dmg*d, 380, 22, t, mine), nm, true); }
}

function move(f, dx, dy, dt, k){
  let boost = qSpd(f) * (f.item === 'panuelo' ? 1.35 : 1) * abSpeed(f);                  // mejora (Q) + Pañuelo + habilidad
  if(!g.pvp && g.e && g.e.includes(f)) boost = Math.min(boost, ENEMY_SPEED_BUFF_CAP);                // un rival no se hace imposible de cazar al sumar Agilidad + Pañuelo
  const l = Math.hypot(dx,dy), sp = f.m.spd * (f.spdm || 1) * boost * (f.st && f.st.k === 'par' ? STX.par.spd : 1);
  let vx = 0, vy = 0;
  if(cant(f)){ f.mv = false; return; }                                          // amedrentado o dormido: no se mueve
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
  if(g.mega){ megaTick(dt); return; }                        // megaevolución en marcha (js/mega.js): el combate se detiene hasta que acaba la animación
  g.clock += dt;
  const P = g.p[g.pi], E = g.e[g.ei];
  megaHint(g.pvp ? myMon() : P);                             // aviso «MEGAEVOLUCIÓN LISTA»

  if(g.pvp){ pvpControl(P, 'p', dt); pvpControl(E, 'e', dt); }          // combate online: cada bando lo mueven las pulsaciones de su jugador (js/pvp.js)
  else{
  if(!P.dead && !P.ghost){                       // ghost = en pleno cambio de Pokémon: sin controles hasta que termine la animación
    const dx = (ctlHeld('right')?1:0) - (ctlHeld('left')?1:0);            // teclas configurables (Ajustes › Controles, js/controls.js)
    const dy = (ctlHeld('down')?1:0) - (ctlHeld('up')?1:0);
    const aim = Math.atan2(mouse.y-P.y, mouse.x-P.x);
    move(P, dx, dy, dt, 1); P.dir = dirOf(aim);
    if(ctlHeld('melee')) use(P,1,aim,true);
    if(ctlHeld('shot')) use(P,2,aim,true);
    if(ctlHeld('dash')) use(P,0, (dx||dy) ? Math.atan2(dy,dx) : aim, true);
    if(ctlHeld('buff')) use(P,3,aim,true);
    if(ctlHeld('strong')) use(P,4,aim,true);
  }
  if(!E.dead && !E.ghost){ if(aiSmart()) enemyAI(E, P, dt); else enemyBasic(E, P, dt); megaAI(E, dt); }
  }       // IA del rival (js/ai.js): estilo de combate, distancias, esquiva y uso inteligente de Q/E (no actúa mientras su Pokémon entra con la animación de cambio)
  for(const f of [P,E]){                         // tiempos de cada uno
    for(let i=0;i<5;i++) f.cd[i] = Math.max(0, f.cd[i]-dt);
    if(f.item === 'restos' && !f.dead) f.hp = Math.min(f.max, f.hp + f.max*IFX.restos*dt);   // Restos (IFX.restos en data.js)
    if(f.dash > 0 && !f.dead && (f.fxd = (f.fxd || 0) - dt) <= 0){ f.fxd = .045; fxDust(f); }          // polvo al correr
    if(f.stun > 0) f.stun -= dt;
    f.en = Math.min(100, f.en + EN_REGEN*dt); f.buff -= dt; f.dash -= dt; f.at += dt; f.lock -= dt;
    if(!f.dead && f.lock <= 0){ const w = f.mv ? 'Walk' : 'Idle'; if(f.act !== w){ f.act = w; f.at = 0; } }
    statusTick(f, dt);                           // estados (js/status.js)
    abTick(f, dt);                               // habilidades (js/abilities.js): clima, Mudar, Impulso...
  }
  if(g.wx){ g.wx.t -= dt; if(g.wx.t <= 0) g.wx = null; }     // el clima dura ABX.climaDur segundos
  statusBench();                                 // quien espera en el banquillo no conserva estados
  for(const s of g.shots){                       // proyectiles
    s.x += s.vx*dt; s.y += s.vy*dt; s.life -= dt;
    const T = foe(s.mine);
    if(!T.dead && !T.ghost && Math.hypot(s.x-T.x, s.y-T.y) < rad(T) + s.r * abShotK(s, T)){ if(s.status) statusShotHit(T, s); else hit(T, s.dmg, s.type, s.o, false, s.r > 15, s.mvn); s.life = 0; }
    if(s.x<0 || s.x>W || s.y<0 || s.y>H) s.life = 0;
  }
  g.shots = g.shots.filter(s => s.life > 0);
  g.pops.forEach(p => p.t -= dt); g.pops = g.pops.filter(p => p.t > 0);
  fxUpdate(dt);
  swapUpdate(dt);                                // animación de cambio de Pokémon (swap.js)
  if(g.swGrace > 0) g.swGrace = Math.max(0, g.swGrace - dt);        // margen del rival tras tu cambio (AI_SWAP.grace, ai.js)
  if(g.swCd > 0) g.swCd = Math.max(0, g.swCd - dt);                  // espera entre cambios (SWITCH_CD)
  if(g.swCdE > 0) g.swCdE = Math.max(0, g.swCdE - dt);               // lo mismo para el bando 'e' (solo combates online)
  if(g.swNote > 0) g.swNote -= dt;

  if(E.dead){ E.dt += dt; if(E.dt > 1){ const n = g.e.findIndex(f=>!f.dead); if(n<0) return endBattle(true);  swapStart('e', n, true); } }
  if(P.dead){ P.dt += dt; if(P.dt > 1){ const n = g.p.findIndex(f=>!f.dead); if(n<0) return endBattle(false); swapStart('p', n, true); } }
}

const SWITCH_CD = 5;                              // segundos de espera entre un cambio tuyo y el siguiente (empieza a contar cuando el nuevo Pokémon ya ha salido)
function switchMon(i){                            // cambio VOLUNTARIO (teclas 1 2 3 · R · clic en los cuadritos del HUD). El cambio por debilitamiento no pasa por aquí.
  if(!g || g.over || g.paused || g.count > 0) return;
  if(g.pvp){ if(i !== undefined) pvpEvent('sw', i); return; }       // combate online: el cambio se manda como pulsación y lo hacen los dos a la vez (js/pvp.js)
  if(i === undefined){ for(let k=1;k<=3;k++){ const j=(g.pi+k)%3; if(!g.p[j].dead){ i=j; break; } } }
  if(i===undefined || g.p[i].dead || i===g.pi || g.p[g.pi].dead) return;
  if(swapBusy()) return;                          // ya hay un cambio en marcha: no se empieza otro hasta que acabe la animación
  const trap = abTrapped(g.p[g.pi], g.e[g.ei]);   // Sombra Trampa · Trampa Arena · Imán del rival
  if(trap){ const P = g.p[g.pi]; g.pops.push({x:P.x, y:P.y - 150, txt:'¡' + trap.toUpperCase() + ': no puedes cambiar!', t:1.4, c:'#ff9a3a', s:10}); return; }
  if(g.swCd > 0){ g.swNote = 1.6; return; }       // aún en espera: se avisa en el HUD ("ESPERA 3 s") y no se cambia
  swapStart('p', i, false).vol = true;            // la animación (swap.js) hace el cambio: retirada, lanzamiento y apertura · vol = voluntario: al acabar empieza la espera de SWITCH_CD
}
