"use strict";
/* =====================================================================
   11) LOGROS con recompensas (Puntos de Batalla y/o tickets de Gachapon).
   ---------------------------------------------------------------------
   TODO ESTÁ EN UNA TABLA DE DATOS (ACHIEVEMENT_DATA, justo debajo): es JSON puro (solo textos, números y objetos), así que se puede
   copiar a un archivo .json o a una base de datos tal cual. Cada logro es:

     {"id":"campo_10",            nombre interno único (sin espacios)
      "cat":"campo",              categoría de la pantalla: historia | campo | coleccion
      "name":"Aprendiz",          título · "desc": qué hay que hacer · "icon": clave de ICONS (menu.js)
      "metric":"campo_wins",      QUÉ se cuenta (ver ACH_METRICS más abajo)
      "region":"Kanto",           (opcional) parámetro de la métrica: región · "tier": 1|2|3 para campo_tier
      "goal":10,                  cuánto hay que llegar a contar (con goal > 1 sale barra de progreso)
      "reward":{"bp":200,"tickets":0}}   recompensa: Puntos de Batalla y/o tickets de Gachapon

   MÉTRICAS (ACH_METRICS): leaders · elite · champion (combates de la Historia ya superados, por región o en total) ·
   campo_wins (victorias totales en el Campo) · campo_tier (dificultad superada, 0/1) · pokemon_owned · shiny_owned.
   Para añadir una métrica nueva: una línea en ACH_METRICS que devuelva un número.

   CÓMO SE COBRA (hay que RECLAMAR a mano)
     1) Al cumplir la condición el logro queda COMPLETADO (aviso + barra llena + botón "Reclamar"), pero todavía no da nada.
     2) En la pantalla de Logros pulsas "Reclamar" (o "Reclamar todo") y entonces recibes los BP y/o tickets, una sola vez.

   FUNCIONES
     achSync()            recalcula TODOS los logros con el estado actual del juego y marca como completados los que se cumplan
                          (también cuenta lo que ya habías conseguido antes). Se llama tras cada combate ganado, tras cada tirada del
                          Gachapon, al abrir la pantalla de Logros y 1 vez al arrancar. Devuelve los recién completados. NO da recompensas.
     achClaim(id)         RECLAMA un logro completado: entrega su recompensa (una sola vez, nunca se repite). Devuelve true si la dio.
     achClaimAll()        reclama todos los que estén listos
     achGrant(reward)     suma {bp, tickets} al jugador y actualiza la cabecera
     achGet(id)           {progress, done (completado), claimed (reclamado), date}
     achReadyCount()      cuántos están completados y pendientes de reclamar (sale en la miga "Logros" del menú)
     achComplete(id)      marca uno como completado a mano (para logros sin métrica)
     registerAchievement  añade un logro por código (si no quieres tocar ACHIEVEMENT_DATA)
   Se guarda en save.ach como {id: {progress, done, date}}: "done" = fecha en que se completó, "date" = fecha en que se reclamó.
   ===================================================================== */
const ACHIEVEMENT_DATA = [
  // ---------- HISTORIA ----------
  {"id":"primer_gimnasio", "cat":"historia", "name":"Primer gimnasio",    "desc":"Derrota a tu primer Líder de Gimnasio.",                       "icon":"story",  "metric":"leaders",  "goal":1,  "reward":{"bp":100,  "tickets":1}},
  {"id":"lideres_kanto",   "cat":"historia", "name":"Líderes de Kanto",   "desc":"Derrota a los 8 Líderes de Gimnasio de Kanto.",                "icon":"story",  "metric":"leaders",  "region":"Kanto", "goal":8, "reward":{"bp":500, "tickets":5}},
  {"id":"lideres_johto",   "cat":"historia", "name":"Líderes de Johto",   "desc":"Derrota a los 8 Líderes de Gimnasio de Johto.",                "icon":"story",  "metric":"leaders",  "region":"Johto", "goal":8, "reward":{"bp":500, "tickets":5}},
  {"id":"alto_kanto",      "cat":"historia", "name":"Alto Mando de Kanto","desc":"Derrota a los 4 miembros del Alto Mando de Kanto.",            "icon":"tower",  "metric":"elite",    "region":"Kanto", "goal":4, "reward":{"bp":400, "tickets":3}},
  {"id":"alto_johto",      "cat":"historia", "name":"Alto Mando de Johto","desc":"Derrota a los 4 miembros del Alto Mando de Johto.",            "icon":"tower",  "metric":"elite",    "region":"Johto", "goal":4, "reward":{"bp":400, "tickets":3}},
  {"id":"campeon_kanto",   "cat":"historia", "name":"Campeón de Kanto",   "desc":"Derrota a Azul y conviértete en el Campeón de Kanto.",         "icon":"trophy", "metric":"champion", "region":"Kanto", "goal":1, "reward":{"bp":1000,"tickets":10}},
  {"id":"campeon_johto",   "cat":"historia", "name":"Campeón de Johto",   "desc":"Derrota a Lance y conviértete en el Campeón de Johto.",        "icon":"trophy", "metric":"champion", "region":"Johto", "goal":1, "reward":{"bp":1000,"tickets":10}},
  {"id":"doble_campeon",   "cat":"historia", "name":"Maestro de dos Ligas","desc":"Sé el Campeón de las dos Ligas: Kanto y Johto.",              "icon":"trophy", "metric":"champion", "goal":2,  "reward":{"bp":2000, "tickets":15}},

  // ---------- CAMPO DE ENTRENAMIENTO ----------
  {"id":"campo_1",         "cat":"campo",    "name":"Primer entrenamiento","desc":"Vence a un entrenador del Campo de Entrenamiento.",           "icon":"campo",  "metric":"campo_wins", "goal":1,   "reward":{"bp":50,   "tickets":0}},
  {"id":"campo_10",        "cat":"campo",    "name":"Aprendiz",            "desc":"Vence a 10 entrenadores en el Campo de Entrenamiento.",       "icon":"campo",  "metric":"campo_wins", "goal":10,  "reward":{"bp":200,  "tickets":0}},
  {"id":"campo_25",        "cat":"campo",    "name":"Entrenador constante","desc":"Vence a 25 entrenadores en el Campo de Entrenamiento.",       "icon":"campo",  "metric":"campo_wins", "goal":25,  "reward":{"bp":300,  "tickets":2}},
  {"id":"campo_50",        "cat":"campo",    "name":"Veterano del Campo",  "desc":"Vence a 50 entrenadores en el Campo de Entrenamiento.",       "icon":"campo",  "metric":"campo_wins", "goal":50,  "reward":{"bp":500,  "tickets":5}},
  {"id":"campo_100",       "cat":"campo",    "name":"Leyenda del Campo",   "desc":"Vence a 100 entrenadores en el Campo de Entrenamiento.",      "icon":"campo",  "metric":"campo_wins", "goal":100, "reward":{"bp":1000, "tickets":10}},
  {"id":"campo_facil",     "cat":"campo",    "name":"Campo: Fácil superada","desc":"Vence a todos los entrenadores de la dificultad Fácil.",     "icon":"campo",  "metric":"campo_tier", "tier":1, "goal":1, "reward":{"bp":300, "tickets":0}},
  {"id":"campo_media",     "cat":"campo",    "name":"Campo: Media superada","desc":"Vence a todos los entrenadores de la dificultad Media.",     "icon":"campo",  "metric":"campo_tier", "tier":2, "goal":1, "reward":{"bp":500, "tickets":3}},
  {"id":"campo_dificil",   "cat":"campo",    "name":"Campo: Difícil superada","desc":"Vence a todos los entrenadores de la dificultad Difícil.", "icon":"campo",  "metric":"campo_tier", "tier":3, "goal":1, "reward":{"bp":800, "tickets":6}},

  // ---------- COLECCIÓN ----------
  {"id":"coleccion_10",    "cat":"coleccion","name":"Primeras capturas",   "desc":"Consigue 10 Pokémon diferentes.",                             "icon":"dex",    "metric":"pokemon_owned", "goal":10,  "reward":{"bp":100,  "tickets":0}},
  {"id":"coleccion_25",    "cat":"coleccion","name":"Coleccionista novato","desc":"Consigue 25 Pokémon diferentes.",                             "icon":"dex",    "metric":"pokemon_owned", "goal":25,  "reward":{"bp":200,  "tickets":1}},
  {"id":"coleccion_50",    "cat":"coleccion","name":"Coleccionista",       "desc":"Consigue 50 Pokémon diferentes.",                             "icon":"dex",    "metric":"pokemon_owned", "goal":50,  "reward":{"bp":300,  "tickets":3}},
  {"id":"coleccion_100",   "cat":"coleccion","name":"Gran coleccionista",  "desc":"Consigue 100 Pokémon diferentes.",                            "icon":"dex",    "metric":"pokemon_owned", "goal":100, "reward":{"bp":600,  "tickets":5}},
  {"id":"coleccion_250",   "cat":"coleccion","name":"Maestro Pokémon",     "desc":"Consigue 250 Pokémon diferentes.",                            "icon":"dex",    "metric":"pokemon_owned", "goal":250, "reward":{"bp":1500, "tickets":15}},
  {"id":"shiny_1",         "cat":"coleccion","name":"¡Brilla!",            "desc":"Consigue tu primer Pokémon shiny.",                           "icon":"gacha",  "metric":"shiny_owned",   "goal":1,   "reward":{"bp":500,  "tickets":5}},
  {"id":"shiny_5",         "cat":"coleccion","name":"Cazador de brillos",  "desc":"Consigue 5 Pokémon shiny diferentes.",                        "icon":"gacha",  "metric":"shiny_owned",   "goal":5,   "reward":{"bp":1000, "tickets":10}},
  {"id":"shiny_10",        "cat":"coleccion","name":"Constelación shiny",  "desc":"Consigue 10 Pokémon shiny diferentes.",                       "icon":"gacha",  "metric":"shiny_owned",   "goal":10,  "reward":{"bp":2000, "tickets":20}}
];
const ACH_CATS = {historia:'Historia', campo:'Campo de Entrenamiento', coleccion:'Colección'};

// ---- Métricas: cada una devuelve el número actual que se compara con "goal" ----
const ACH_PROG = (kind, region) => FLOORS.filter(F => F.kind === kind && (!region || F.region === region) && F.idx < progOf(F.region)).length;   // combates de la Historia ya superados
const ACH_METRICS = {
  leaders:       d => ACH_PROG('lider', d.region),
  elite:         d => ACH_PROG('alto', d.region),
  champion:      d => d.region ? (save.champ[d.region] ? 1 : 0) : Object.values(save.champ).filter(Boolean).length,
  campo_wins:    () => Math.max(save.stats.campo || 0, Object.keys(save.campoWins).length),          // victorias totales (repetidas incluidas)
  campo_tier:    d => (typeof campoCleared === 'function' && campoCleared(d.tier)) ? 1 : 0,           // 1 = dificultad del Campo superada
  pokemon_owned: () => new Set(save.box).size,
  shiny_owned:   () => new Set(save.shiny).size
};

// ---- Registro y consulta ----
const ACHIEVEMENTS = [];
function registerAchievement(def){
  if(!def || !def.id || ACHIEVEMENTS.some(a => a.id === def.id)) return;
  ACHIEVEMENTS.push(Object.assign({name:def.id, desc:'', icon:'trophy', cat:'historia', goal:0, reward:{bp:0, tickets:0}}, def));
}
ACHIEVEMENT_DATA.forEach(registerAchievement);
const achDef = id => ACHIEVEMENTS.find(a => a.id === id);
function achGet(id){                                // estado de un logro (no modifica nada). Las partidas antiguas ya tenían "date" = cobrado
  const s = save.ach[id], d = achDef(id), claimed = !!(s && s.date);
  return {progress:(s && s.progress) || 0, date:(s && s.date) || null, claimed, done:claimed || !!(s && s.done), goal:d ? d.goal : 0};
}
const achClaimedCount = () => ACHIEVEMENTS.filter(a => achGet(a.id).claimed).length;
const achReadyCount = () => ACHIEVEMENTS.filter(a => { const s = achGet(a.id); return s.done && !s.claimed; }).length;
const achRewardText = r => r ? [r.bp ? `${r.bp} BP` : '', r.tickets ? `${r.tickets} ticket${r.tickets > 1 ? 's' : ''} de Gachapon` : ''].filter(Boolean).join(' + ') : '';

// ---- Recompensa: Puntos de Batalla y/o tickets de Gachapon ----
function achGrant(r){
  if(!r) return;
  if(r.bp) save.bp += r.bp;
  if(r.tickets) save.tickets += r.tickets;
  if(typeof refreshHud === 'function') refreshHud();
}
function achComplete(id){                           // marca el logro como completado (NO da la recompensa: hay que reclamarla)
  const d = achDef(id); if(!d || achGet(id).done) return false;
  save.ach[id] = {progress:d.goal || 1, done:Date.now(), date:null}; persist(); return true;
}
function achClaim(id, quiet){                       // RECLAMAR: entrega la recompensa de un logro completado, una sola vez
  const d = achDef(id), s = achGet(id); if(!d || !s.done || s.claimed) return false;
  save.ach[id] = {progress:d.goal || 1, done:save.ach[id] && save.ach[id].done || Date.now(), date:Date.now()};
  achGrant(d.reward); persist(); if(typeof refreshHud === 'function') refreshHud();
  if(!quiet){ toast(`🏆 ${d.name} · +${achRewardText(d.reward)}`); if(typeof Sfx !== 'undefined') Sfx.play('logro'); }
  return true;
}
function achClaimAll(){
  const got = ACHIEVEMENTS.filter(a => achClaim(a.id, true));
  if(got.length){
    const tot = got.reduce((t, d) => ({bp:t.bp + (d.reward.bp || 0), tickets:t.tickets + (d.reward.tickets || 0)}), {bp:0, tickets:0});
    toast(`🏆 ${got.length} recompensa${got.length > 1 ? 's' : ''} reclamada${got.length > 1 ? 's' : ''} · +${achRewardText(tot)}`); if(typeof Sfx !== 'undefined') Sfx.play('logro');
  }
  return got.length;
}
function achProgress(id, n){                        // para logros manuales (sin métrica): fija el progreso; al llegar a goal queda completado
  const d = achDef(id); if(!d || achGet(id).done) return;
  const p = Math.max(0, Math.min(d.goal || 1, n));
  if(d.goal && p >= d.goal){ achComplete(id); announce([d]); } else { save.ach[id] = {progress:p, done:null, date:null}; persist(); }
}
const achAdd = (id, n = 1) => achProgress(id, achGet(id).progress + n);

// ---- Sincroniza TODOS los logros con el estado del juego (completa los cumplidos; las recompensas se reclaman aparte) ----
const announce = list => {                                                          // un solo aviso con todo lo completado
  if(!list.length) return;
  toast(`🏆 ${list.length > 1 ? 'Logros completados' : 'Logro completado'}: ${list.map(d => d.name).join(', ')} · ¡Reclama la recompensa en Logros!`);
  if(typeof Sfx !== 'undefined') Sfx.play('logro');
  if(typeof refreshHud === 'function') refreshHud();
};
let achBusy = false;
function achSync(){
  if(achBusy) return []; achBusy = true;
  const won = []; let dirty = false;
  try{
    ACHIEVEMENTS.forEach(d => {
      const f = ACH_METRICS[d.metric]; if(!f || achGet(d.id).done) return;
      const v = Math.max(0, Math.min(d.goal || 1, f(d) || 0)), cur = achGet(d.id).progress;
      if(v >= (d.goal || 1)){ if(achComplete(d.id)) won.push(d); }
      else if(v !== cur){ save.ach[d.id] = {progress:v, done:null, date:null}; dirty = true; }
    });
  }catch(e){ console.warn('Logros:', e); }
  achBusy = false;
  if(dirty && !won.length) persist();
  announce(won);
  return won;
}
setTimeout(() => achSync(), 900);                                                    // al arrancar: marca lo que ya habías conseguido

// ---- Pantalla ----
function achRender(){
  const ready = achReadyCount();
  const cr = document.querySelector('.ubar .crumbs'); if(cr){ cr.outerHTML = crumbsHtml('ach'); }   // actualiza el aviso rojo de la miga
  $('achSum').innerHTML = `Reclamados: <b class="gold">${achClaimedCount()}</b> / ${ACHIEVEMENTS.length}` + (ready ? ` · Listos para reclamar: <b class="gold">${ready}</b>` : '');
  const tools = $('achTools'); tools.innerHTML = '';
  if(ready > 1){ const b = document.createElement('button'); b.className = 'main'; b.id = 'achAll'; b.textContent = `Reclamar todo (${ready})`; b.onclick = () => { achClaimAll(); achRender(); }; tools.appendChild(b); }
  const root = $('agrids'); root.innerHTML = '';
  if(!ACHIEVEMENTS.length){ root.innerHTML = '<p class="help">Todavía no hay logros.</p>'; return; }
  const cats = [...new Set(ACHIEVEMENTS.map(a => a.cat))];
  cats.forEach(cat => {
    const list = ACHIEVEMENTS.filter(a => a.cat === cat);
    const h = document.createElement('h2'); h.textContent = `${ACH_CATS[cat] || cat} · ${list.filter(a => achGet(a.id).claimed).length}/${list.length}`; root.appendChild(h);
    const grid = document.createElement('div'); grid.className = 'agrid'; root.appendChild(grid);
    list.forEach(a => {
      const s = achGet(a.id), d = document.createElement('div');
      d.className = 'ach' + (s.claimed ? ' done' : s.done ? ' ready' : ' locked'); d.dataset.id = a.id;
      const ic = document.createElement('canvas'); bitmap(ic, ICONS[a.icon] || ICONS.trophy, s.done ? '#ffcc33' : '#4a5468'); d.appendChild(ic);
      const t = document.createElement('div');
      const hh = document.createElement('h3'); hh.textContent = a.name; t.appendChild(hh);
      const p = document.createElement('p'); p.textContent = a.desc; t.appendChild(p);
      if(a.goal > 1){
        const bar = document.createElement('div'); bar.className = 'abar';
        const fill = document.createElement('i'); fill.style.width = Math.min(100, (s.done ? a.goal : s.progress) / a.goal * 100) + '%'; bar.appendChild(fill); t.appendChild(bar);
        const n = document.createElement('small'); n.textContent = `${s.done ? a.goal : Math.min(s.progress, a.goal)} / ${a.goal}`; t.appendChild(n);
      }
      const rw = document.createElement('span'); rw.className = 'arw'; rw.textContent = (s.claimed ? '✓ Recibido: ' : 'Recompensa: ') + achRewardText(a.reward); t.appendChild(rw);
      if(s.done && !s.claimed){                                                      // completado: botón para reclamar
        const bt = document.createElement('button'); bt.className = 'main aclaim'; bt.textContent = 'Reclamar';
        bt.onclick = () => { achClaim(a.id); achRender(); }; t.appendChild(bt);
      }
      const st = document.createElement('span'); st.className = 'ast';
      st.textContent = s.claimed ? 'RECLAMADO · ' + new Date(s.date).toLocaleDateString('es-ES', {day:'2-digit', month:'2-digit', year:'numeric'}) : s.done ? 'COMPLETADO · PENDIENTE DE RECLAMAR' : 'BLOQUEADO';
      t.appendChild(st); d.appendChild(t); grid.appendChild(d);
    });
  });
}
function openAchievements(){
  achSync();
  panel(userBar('ach') + `<h1>Logros</h1><p class="help">Cumple la condición y pulsa <b>Reclamar</b> para recibir los Puntos de Batalla y/o tickets de Gachapon (una sola vez por logro). <span id="achSum"></span></p><div class="pf-btns" id="achTools"></div><div id="agrids"></div>`);
  achRender();
}
