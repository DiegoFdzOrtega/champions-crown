"use strict";
/* =====================================================================
   6) HISTORIA: un combate por líder, en orden (cada región: 8 líderes, Alto Mando de 4 y Campeón. Kanto y Johto)
   ===================================================================== */
function floorFight(n){                          // n = 0 es el primer líder
  const F = FLOORS[n], S = floorStats(n);
  const V = F.trio ? F.trio[Math.floor(Math.random() * F.trio.length)] : null;                 // Gres (Teselia): te toca uno de los tres hermanos, al azar
  const arena = F.arenas ? F.arenas[Math.floor(Math.random() * F.arenas.length)] : F.arena;    // arena propia del combate (Gres) o una de las dos versiones del gimnasio de Caolín
  const who = V || F;
  startBattle({
    floor:F.idx+1, n, leader:who.id, boss:F.kind,                    // floor = nº de combate dentro de su región · n = posición en FLOORS
    sub: `${who.leader.toUpperCase()} · ${who.tag.toUpperCase()}`,
    enemies: V ? TEAMS[V.id] : F.teams,                // equipo fijo de 6; sus estadísticas salen de FLOORS (lvl) y DIFF (dificultad)
    hm:S.hm, dm:S.dm, skill:S.skill, spdm:S.spdm, lvl:S.lvl,
    arena, leaderName:who.leader                       // arena (opcional) y nombre de quien te toca (para la pantalla final)
  });
}

// ---- PAUSA (Esc en mitad de un combate): detiene el combate y deja continuar, reiniciar o salir ----
let pzAct = null;                                                // acción pendiente de confirmar: salir o reiniciar
function pauseBattle(on){
  if(!g || g.over) return;
  g.paused = on; $('pause').classList.toggle('hide', !on); Music.duck(on); $('pMus').textContent = save.mute ? 'Sonido: no (M)' : 'Sonido: sí (M)';
  if(on){
    for(const k in keys) keys[k] = false; mouse.l = mouse.r = false; $('pBtns').classList.remove('hide'); $('pAsk').classList.add('hide'); $('pGo').focus();   // sueltas teclas y ratón para que no se quede nada pulsado
    const o = g.o, alive = a => a.filter(f => !f.dead).length, s = g.clock | 0;
    $('pzSub').textContent = (o.title ? o.title + ' · ' : 'Piso ' + o.floor + ' · ') + (o.sub || '');
    $('pzStats').innerHTML = `<span>Tiempo<b>${(s / 60) | 0}:${String(s % 60).padStart(2, '0')}</b></span><span>Tu equipo<b>${alive(g.p)}/${g.p.length}</b></span><span>Rival<b>${alive(g.e)}/${g.e.length}</b></span>`;
  }
}
function exitBattle(){                                           // sale del combate sin recompensa y vuelve a la pantalla de donde venías
  const campo = g && g.o.campo; g = null; $('pause').classList.add('hide'); Music.duck(false);
  if(campo) openCampo(); else goStory();
}
function restartBattle(){                                        // empieza el mismo combate desde cero (misma vida, energía y rival), sin recompensa de por medio
  const o = g.o; $('pause').classList.add('hide'); Music.duck(false); startBattle(o, true);
}
{ const el = id => document.getElementById(id);                   // ($ todavía no existe: ui.js se carga después)
  const ask = (txt, yes, act) => { el('pBtns').classList.add('hide'); el('pAsk').classList.remove('hide'); el('pAskT').textContent = txt; el('pYes').textContent = yes; pzAct = act; el('pNo').focus(); };
  el('pGo').onclick = () => pauseBattle(false);
  el('pNo').onclick = () => { pzAct = null; el('pAsk').classList.add('hide'); el('pBtns').classList.remove('hide'); el('pGo').focus(); };   // «No»: vuelves al menú de pausa
  el('pOut').onclick = () => ask('¿Salir del combate? No ganarás ninguna recompensa.', 'Sí, salir', exitBattle);
  el('pRe').onclick = () => ask('¿Reiniciar el combate? Empezarás desde cero: tus Pokémon y el rival recuperan toda la vida.', 'Sí, reiniciar', restartBattle);
  el('pYes').onclick = () => { if(pzAct) pzAct(); };
  el('pMus').onclick = () => { Music.toggleMute(); el('pMus').textContent = save.mute ? 'Sonido: no (M)' : 'Sonido: sí (M)'; }; }

function endBattle(won){
  if(g.o.campo) return campoEnd(won);                          // Campo de Entrenamiento: ver campo.js
  g.over = true;
  const o = g.o, F = FLOORS[o.n], b = document.getElementById('rBtns'); b.innerHTML = '';
  const add = (t,fn,main)=>{ const x = document.createElement('button'); x.textContent = t; if(main) x.className = 'main'; x.onclick = fn; b.appendChild(x); };
  const set = (t,p)=>{ resultClear(); document.getElementById('rTitle').textContent = t; document.getElementById('rText').textContent = p; };
  if(won){
    const R = F.region, chips = [];
    const view = !!PREVIEW[R];                                                         // modo ver (data.js): no se guarda nada de esta victoria
    if(!view) gainEVs(g.e.map(f => f.m.dex));                                          // EVs para tu equipo
    const first = o.floor > progOf(R);
    if(first && !view) setProg(R, o.floor);                                            // progreso de la región (solo avanza la primera vez)
    if(F.kind === 'campeon' && !view) save.champ[R] = 1;                               // trofeo del Equipo Pokémon (room.js) y progreso hacia la Torre Batalla
    if(view){ lastReward = null; chips.push({t:'MODO VER: no se guarda progreso ni recompensas', c:'#ff9a3a'}); } else giveReward(F, first);                                                              // recompensa fija: 10 tiradas de Gachapon (+ chapas), SIN BP (REWARD y REWARD_REGION en teams.js) · la pantalla de victoria (victoria.js) la enseña con iconos
    if(TRAIN.evPerFoe > 0) chips.push({t:'+EVs para tu equipo', c:'#3ea6ff'});
    if(F.kind === 'campeon' && !view) chips.push({t:'Trofeo de la Liga en tu habitación', c:'#ffcc33'});
    persist(); achSync();                                                              // logros: comprueba si esta victoria desbloquea alguno (achievements.js)
    const nx = FLOORS[o.n+1], next = nx && nx.region === R ? nx : null;               // el siguiente de la MISMA región (tras el Campeón no hay más)
    if(next) chips.push({t:`Siguiente: ${next.leader}`, c:'#4ccf6a'});
    victoryScreen({title:`¡Has vencido a ${o.leaderName || F.leader}!`, sub: F.kind === 'campeon' ? `¡Eres el Campeón de ${R}!` : '', rewards:lastReward, chips, leader:o.leader, path:o.portrait});
    if(next) add(next.kind === 'lider' ? 'Siguiente líder' : next.kind === 'alto' ? 'Siguiente: Alto Mando' : 'Combate final: Campeón', ()=>floorFight(o.n+1), true);
  }else{
    set(`${o.leaderName || F.leader} ha ganado esta vez`, 'Cambia el equipo o los objetos e inténtalo otra vez.');
    add('Reintentar', ()=>floorFight(o.n), true);
  }
  add('Menú', ()=>{ g = null; goMain(); });
  setTimeout(()=>{ show('result'); Sfx.play(won ? 'win' : 'lose'); }, 900);
}
