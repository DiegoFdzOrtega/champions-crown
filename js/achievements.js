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
   campo_wins (victorias totales en el Campo) · campo_tier (dificultad superada, 0/1) · pokemon_owned · shiny_owned ·
   dex_region (Pokémon que tienes de la Pokédex de una región; parámetro "region" con el nombre del Gachapon: Kanto, Johto...).
   La recompensa también puede llevar "key":"mega_aro": un OBJETO CLAVE (KEY_ITEMS en mega.js) que se entrega solo al completar el logro, sin reclamar (Mochila › Objetos clave).
   La recompensa también puede llevar "title":"Texto" (un TÍTULO de perfil, sale bajo tu nombre) y/o "frame":"oro" (un MARCO para tu avatar; ver ACH_FRAMES): se desbloquean al reclamar el logro y se eligen en Perfil (save.title = id del logro, save.frame = id del marco).
   Un logro con "secret":true (y "hint":"pista") se ve como «???» hasta que lo consigues; su categoría suele ser "secreto".
   Métricas "owns" y "shiny_dex": con "dex":[nº de Pokédex, ...] y goal = cuántos hay que tener. 
   La recompensa también puede llevar "charm":"Kanto": entrega el AMULETO ARCOÍRIS de esa región (shiny más probable en su Gachapon; ver CHARM_RATE en data.js).
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
  {"id":"primer_gimnasio", "cat":"historia", "name":"Primer gimnasio",    "desc":"Derrota a tu primer Líder de Gimnasio.",                       "icon":"story",  "metric":"leaders",  "goal":1,  "reward":{"frame":"bronce", "bp":100,  "tickets":1}},
  {"id":"lideres_kanto",   "cat":"historia", "name":"Líderes de Kanto",   "desc":"Derrota a los 8 Líderes de Gimnasio de Kanto.",                "icon":"story",  "metric":"leaders",  "region":"Kanto", "goal":8, "reward":{"bp":500, "tickets":5}},
  {"id":"lideres_johto",   "cat":"historia", "name":"Líderes de Johto",   "desc":"Derrota a los 8 Líderes de Gimnasio de Johto.",                "icon":"story",  "metric":"leaders",  "region":"Johto", "goal":8, "reward":{"bp":500, "tickets":5}},
  {"id":"lideres_hoenn",   "cat":"historia", "name":"Líderes de Hoenn",   "desc":"Derrota a los 8 Líderes de Gimnasio de Hoenn.",                "icon":"story",  "metric":"leaders",  "region":"Hoenn", "goal":8, "reward":{"bp":500, "tickets":5}},
  {"id":"lideres_sinnoh",  "cat":"historia", "name":"Líderes de Sinnoh",  "desc":"Derrota a los 8 Líderes de Gimnasio de Sinnoh.",               "icon":"story",  "metric":"leaders",  "region":"Sinnoh", "goal":8, "reward":{"bp":500, "tickets":5}},
  {"id":"alto_kanto",      "cat":"historia", "name":"Alto Mando de Kanto","desc":"Derrota a los 4 miembros del Alto Mando de Kanto.",            "icon":"tower",  "metric":"elite",    "region":"Kanto", "goal":4, "reward":{"bp":400, "tickets":3}},
  {"id":"alto_johto",      "cat":"historia", "name":"Alto Mando de Johto","desc":"Derrota a los 4 miembros del Alto Mando de Johto.",            "icon":"tower",  "metric":"elite",    "region":"Johto", "goal":4, "reward":{"bp":400, "tickets":3}},
  {"id":"alto_hoenn",      "cat":"historia", "name":"Alto Mando de Hoenn","desc":"Derrota a los 4 miembros del Alto Mando de Hoenn.",            "icon":"tower",  "metric":"elite",    "region":"Hoenn", "goal":4, "reward":{"bp":400, "tickets":3}},
  {"id":"alto_sinnoh",     "cat":"historia", "name":"Alto Mando de Sinnoh","desc":"Derrota a los 4 miembros del Alto Mando de Sinnoh.",           "icon":"tower",  "metric":"elite",    "region":"Sinnoh", "goal":4, "reward":{"bp":400, "tickets":3}},
  {"id":"campeon_kanto",   "cat":"historia", "name":"Campeón de Kanto",   "desc":"Derrota a Azul y conviértete en el Campeón de Kanto.",         "icon":"trophy", "metric":"champion", "region":"Kanto", "goal":1, "reward":{"title":"Campeón de Kanto", "frame":"kanto", "bp":1000,"tickets":10}},
  {"id":"campeon_johto",   "cat":"historia", "name":"Campeón de Johto",   "desc":"Derrota a Lance y conviértete en el Campeón de Johto.",        "icon":"trophy", "metric":"champion", "region":"Johto", "goal":1, "reward":{"title":"Campeón de Johto", "frame":"johto", "bp":1000,"tickets":10}},
  {"id":"campeon_hoenn",   "cat":"historia", "name":"Campeón de Hoenn",   "desc":"Derrota a Plubio y conviértete en el Campeón de Hoenn.",       "icon":"trophy", "metric":"champion", "region":"Hoenn", "goal":1, "reward":{"title":"Campeón de Hoenn", "frame":"hoenn", "bp":1000,"tickets":10}},
  {"id":"campeon_sinnoh",  "cat":"historia", "name":"Campeona de Sinnoh", "desc":"Derrota a Cynthia y conviértete en la Campeona de Sinnoh.",      "icon":"trophy", "metric":"champion", "region":"Sinnoh", "goal":1, "reward":{"title":"Campeona de Sinnoh", "frame":"sinnoh", "bp":1000,"tickets":10}},
  {"id":"doble_campeon",   "cat":"historia", "name":"Maestro de dos Ligas","desc":"Sé el Campeón de las dos Ligas: Kanto y Johto.",              "icon":"trophy", "metric":"champion", "goal":2,  "reward":{"title":"Maestro de dos Ligas", "frame":"plata", "bp":2000, "tickets":15}},
  {"id":"triple_campeon",  "cat":"historia", "name":"Maestro de tres Ligas","desc":"Sé el Campeón de las tres Ligas: Kanto, Johto y Hoenn.",       "icon":"trophy", "metric":"champion", "goal":3,  "reward":{"title":"Maestro de tres Ligas", "frame":"oro", "bp":3000, "tickets":20}},
  {"id":"lideres_teselia",  "cat":"historia", "name":"Líderes de Teselia",  "desc":"Derrota a los 10 Líderes de Gimnasio de Teselia.",              "icon":"story",  "metric":"leaders",  "region":"Unova / Teselia", "goal":10, "reward":{"bp":500, "tickets":5}},
  {"id":"alto_teselia",     "cat":"historia", "name":"Alto Mando de Teselia","desc":"Derrota a los 4 miembros del Alto Mando de Teselia.",          "icon":"tower",  "metric":"elite",    "region":"Unova / Teselia", "goal":4, "reward":{"bp":400, "tickets":3}},
  {"id":"campeon_teselia",  "cat":"historia", "name":"Campeón de Teselia",  "desc":"Derrota a Mirto y conviértete en el Campeón de Teselia.",       "icon":"trophy", "metric":"champion", "region":"Unova / Teselia", "goal":1, "reward":{"title":"Campeón de Teselia", "frame":"teselia", "bp":1000,"tickets":10}},
  {"id":"cuatro_campeon",  "cat":"historia", "name":"Maestro de cuatro Ligas","desc":"Sé el Campeón de las cuatro Ligas: Kanto, Johto, Hoenn y Sinnoh.","icon":"trophy", "metric":"champion", "goal":4,  "reward":{"title":"Maestro de cuatro Ligas", "bp":4000, "tickets":25}},
  {"id":"cinco_campeon",   "cat":"historia", "name":"Maestro de cinco Ligas","desc":"Sé el Campeón de las cinco Ligas: Kanto, Johto, Hoenn, Sinnoh y Teselia.","icon":"trophy", "metric":"champion", "goal":5,  "reward":{"title":"Maestro de cinco Ligas", "bp":5000, "tickets":30}},
  {"id":"mega_aro",         "cat":"historia", "name":"Mega-Aro",           "desc":"Completa la Liga de Teselia: al ser Campeón recibirás el Mega-Aro, el brazalete de la Megaevolución, y el viaje a Kalos.","icon":"trophy","metric":"champion","region":"Unova / Teselia","goal":1,"reward":{"title":"Portador del Mega-Aro", "bp":1000,"tickets":10,"key":"mega_aro"}},
  {"id":"lideres_kalos",    "cat":"historia", "name":"Líderes de Kalos",   "desc":"Derrota a los 8 Líderes de Gimnasio de Kalos.",                "icon":"story",  "metric":"leaders",  "region":"Kalos", "goal":8, "reward":{"bp":600, "tickets":6}},
  {"id":"alto_kalos",      "cat":"historia", "name":"Alto Mando de Kalos","desc":"Derrota a los 4 miembros del Alto Mando de Kalos.",            "icon":"tower",  "metric":"elite",    "region":"Kalos", "goal":4, "reward":{"bp":500, "tickets":4}},
  {"id":"campeon_kalos",   "cat":"historia", "name":"Campeona de Kalos",  "desc":"Derrota a Dianta y conviértete en la Campeona de Kalos.",       "icon":"trophy", "metric":"champion", "region":"Kalos", "goal":1, "reward":{"title":"Campeona de Kalos", "frame":"kalos", "bp":1200,"tickets":12}},
  {"id":"seis_campeon",    "cat":"historia", "name":"Maestro de seis Ligas","desc":"Sé el Campeón de las seis Ligas: Kanto, Johto, Hoenn, Sinnoh, Teselia y Kalos.","icon":"trophy", "metric":"champion", "goal":6,  "reward":{"title":"Maestro de las seis Ligas", "frame":"arcoiris", "bp":6000, "tickets":35}},

  // ---------- CAMPO DE ENTRENAMIENTO ----------
  {"id":"campo_1",         "cat":"campo",    "name":"Primer entrenamiento","desc":"Vence a un entrenador del Campo de Entrenamiento.",           "icon":"campo",  "metric":"campo_wins", "goal":1,   "reward":{"bp":50,   "tickets":0}},
  {"id":"campo_10",        "cat":"campo",    "name":"Aprendiz",            "desc":"Vence a 10 entrenadores en el Campo de Entrenamiento.",       "icon":"campo",  "metric":"campo_wins", "goal":10,  "reward":{"bp":200,  "tickets":0}},
  {"id":"campo_25",        "cat":"campo",    "name":"Entrenador constante","desc":"Vence a 25 entrenadores en el Campo de Entrenamiento.",       "icon":"campo",  "metric":"campo_wins", "goal":25,  "reward":{"bp":300,  "tickets":2}},
  {"id":"campo_50",        "cat":"campo",    "name":"Veterano del Campo",  "desc":"Vence a 50 entrenadores en el Campo de Entrenamiento.",       "icon":"campo",  "metric":"campo_wins", "goal":50,  "reward":{"bp":500,  "tickets":5}},
  {"id":"campo_100",       "cat":"campo",    "name":"Leyenda del Campo",   "desc":"Vence a 100 entrenadores en el Campo de Entrenamiento.",      "icon":"campo",  "metric":"campo_wins", "goal":100, "reward":{"title":"Leyenda del Campo", "frame":"campo", "bp":1000, "tickets":10}},
  {"id":"campo_facil",     "cat":"campo",    "name":"Campo: Fácil superada","desc":"Vence a todos los entrenadores de la dificultad Fácil.",     "icon":"campo",  "metric":"campo_tier", "tier":1, "goal":1, "reward":{"bp":300, "tickets":0}},
  {"id":"campo_media",     "cat":"campo",    "name":"Campo: Media superada","desc":"Vence a todos los entrenadores de la dificultad Media.",     "icon":"campo",  "metric":"campo_tier", "tier":2, "goal":1, "reward":{"bp":500, "tickets":3}},
  {"id":"campo_dificil",   "cat":"campo",    "name":"Campo: Difícil superada","desc":"Vence a todos los entrenadores de la dificultad Difícil.", "icon":"campo",  "metric":"campo_tier", "tier":3, "goal":1, "reward":{"title":"Duro del Campo", "bp":800, "tickets":6}},

  // ---------- COLECCIÓN ----------
  {"id":"coleccion_10",    "cat":"coleccion","name":"Primeras capturas",   "desc":"Consigue 10 Pokémon diferentes.",                             "icon":"dex",    "metric":"pokemon_owned", "goal":10,  "reward":{"bp":100,  "tickets":0}},
  {"id":"coleccion_25",    "cat":"coleccion","name":"Coleccionista novato","desc":"Consigue 25 Pokémon diferentes.",                             "icon":"dex",    "metric":"pokemon_owned", "goal":25,  "reward":{"bp":200,  "tickets":1}},
  {"id":"coleccion_50",    "cat":"coleccion","name":"Coleccionista",       "desc":"Consigue 50 Pokémon diferentes.",                             "icon":"dex",    "metric":"pokemon_owned", "goal":50,  "reward":{"bp":300,  "tickets":3}},
  {"id":"coleccion_100",   "cat":"coleccion","name":"Gran coleccionista",  "desc":"Consigue 100 Pokémon diferentes.",                            "icon":"dex",    "metric":"pokemon_owned", "goal":100, "reward":{"title":"Gran coleccionista", "bp":600,  "tickets":5}},
  {"id":"coleccion_250",   "cat":"coleccion","name":"Maestro Pokémon",     "desc":"Consigue 250 Pokémon diferentes.",                            "icon":"dex",    "metric":"pokemon_owned", "goal":250, "reward":{"title":"Maestro Pokémon", "frame":"oro", "bp":1500, "tickets":15}},
  {"id":"shiny_1",         "cat":"coleccion","name":"¡Brilla!",            "desc":"Consigue tu primer Pokémon shiny.",                           "icon":"gacha",  "metric":"shiny_owned",   "goal":1,   "reward":{"frame":"brillo", "bp":500,  "tickets":5}},
  {"id":"shiny_5",         "cat":"coleccion","name":"Cazador de brillos",  "desc":"Consigue 5 Pokémon shiny diferentes.",                        "icon":"gacha",  "metric":"shiny_owned",   "goal":5,   "reward":{"bp":1000, "tickets":10}},
  {"id":"shiny_10",        "cat":"coleccion","name":"Constelación shiny",  "desc":"Consigue 10 Pokémon shiny diferentes.",                       "icon":"gacha",  "metric":"shiny_owned",   "goal":10,  "reward":{"title":"Constelación shiny", "bp":2000, "tickets":20}},

  // ---------- SECRETOS (se ven como «???» hasta que los consigues; "hint" es la pista que se enseña) ----------
  {"id":"sec_mew",       "cat":"secreto", "secret":true, "name":"Un sueño hecho realidad", "hint":"Un Pokémon legendario, pequeño y rosa.",                 "desc":"Consigue a Mew.",                                       "icon":"gacha", "metric":"owns", "dex":[151], "goal":1, "reward":{"bp":1000, "tickets":5, "title":"Amigo de Mew"}},
  {"id":"sec_mewtwo",    "cat":"secreto", "secret":true, "name":"Genio genético",          "hint":"Nació de un experimento.",                               "desc":"Consigue a Mewtwo.",                                    "icon":"gacha", "metric":"owns", "dex":[150], "goal":1, "reward":{"bp":1000, "tickets":5, "title":"Genio genético"}},
  {"id":"sec_iniciales", "cat":"secreto", "secret":true, "name":"Los tres iniciales",      "hint":"Una planta, una llama y una gota.",                      "desc":"Consigue a Bulbasaur, Charmander y Squirtle.",          "icon":"dex",   "metric":"owns", "dex":[1, 4, 7], "goal":3, "reward":{"bp":500, "tickets":2, "title":"Profesor en prácticas"}},
  {"id":"sec_eevee",     "cat":"secreto", "secret":true, "name":"Familia Eevee",           "hint":"Un solo Pokémon, muchas formas.",                        "desc":"Consigue a Eevee, Vaporeon, Jolteon y Flareon.",        "icon":"dex",   "metric":"owns", "dex":[133, 134, 135, 136], "goal":4, "reward":{"bp":800, "tickets":3, "title":"Criador de Eevee"}},
  {"id":"sec_dragones",  "cat":"secreto", "secret":true, "name":"Domador de dragones",     "hint":"Empieza como una serpiente de agua y acaba volando.",    "desc":"Consigue a Dratini, Dragonair y Dragonite.",            "icon":"dex",   "metric":"owns", "dex":[147, 148, 149], "goal":3, "reward":{"bp":700, "tickets":3, "title":"Domador de dragones"}},
  {"id":"sec_fosiles",   "cat":"secreto", "secret":true, "name":"Paleontólogo",            "hint":"Vienen de piedras muy, muy antiguas.",                   "desc":"Consigue a Omanyte, Kabuto y Aerodactyl.",              "icon":"dex",   "metric":"owns", "dex":[138, 140, 142], "goal":3, "reward":{"bp":600, "tickets":2, "title":"Paleontólogo"}},
  {"id":"sec_pikachu",   "cat":"secreto", "secret":true, "name":"Rayo dorado",             "hint":"Un ratón eléctrico de otro color.",                      "desc":"Consigue a Pikachu shiny.",                             "icon":"gacha", "metric":"shiny_dex", "dex":[25], "goal":1, "reward":{"bp":800, "tickets":4, "title":"Rayo dorado", "frame":"brillo"}},
  {"id":"sec_mewtwo_sh", "cat":"secreto", "secret":true, "name":"Clon esmeralda",         "hint":"Un clon creado en un laboratorio, pero de otro color.",  "desc":"Consigue a Mewtwo shiny.",                              "icon":"gacha", "metric":"shiny_dex", "dex":[150], "goal":1, "reward":{"bp":1500, "tickets":8, "title":"Clon esmeralda", "frame":"mewtwo"}},
  {"id":"sec_campo_250", "cat":"secreto", "secret":true, "name":"Incansable",              "hint":"Entrenar, entrenar y entrenar un poco más.",             "desc":"Vence a 250 entrenadores en el Campo de Entrenamiento.", "icon":"campo", "metric":"campo_wins", "goal":250, "reward":{"bp":2500, "tickets":15, "title":"Incansable", "frame":"campo"}},
];
const ACH_CATS = {historia:'Historia', campo:'Campo de Entrenamiento', coleccion:'Colección', entrenadores:'Entrenadores', secreto:'Secretos'};

// ---- Métricas: cada una devuelve el número actual que se compara con "goal" ----
const ACH_PROG = (kind, region) => FLOORS.filter(F => F.kind === kind && (!region || F.region === region) && F.idx < progAny(F.region)).length;   // combates de la Historia ya superados
const ACH_METRICS = {
  leaders:       d => ACH_PROG('lider', d.region),
  elite:         d => ACH_PROG('alto', d.region),
  champion:      d => d.region ? (champAny(d.region) ? 1 : 0) : new Set([...Object.keys(save.champ).filter(k => save.champ[k]), ...Object.keys(save.easy.champ).filter(k => save.easy.champ[k])]).size,
  campo_wins:    () => Math.max(save.stats.campo || 0, Object.keys(save.campoWins).length),          // victorias totales (repetidas incluidas)
  campo_tier:    d => (typeof campoCleared === 'function' && campoCleared(d.tier)) ? 1 : 0,           // 1 = dificultad del Campo superada
  pokemon_owned: () => new Set(save.box).size,
  shiny_owned:   () => new Set(save.shiny).size,
  owns:          d => (d.dex || []).filter(x => save.box.includes(x)).length,                           // cuántos de esos Pokémon (nº de Pokédex en "dex") tienes
  shiny_dex:     d => (d.dex || []).filter(x => save.shiny.includes(x)).length,                         // cuántos de esos tienes en versión shiny
  dex_region:    d => ownedIn(d.region)                                                                // Pokémon que tienes de esa región (sin contar los que aún no tienen sprite)
};

// ---- Registro y consulta ----
const ACHIEVEMENTS = [];
function registerAchievement(def){
  if(!def || !def.id || ACHIEVEMENTS.some(a => a.id === def.id)) return;
  ACHIEVEMENTS.push(Object.assign({name:def.id, desc:'', icon:'trophy', cat:'historia', goal:0, reward:{bp:0, tickets:0}}, def));
}
ACHIEVEMENT_DATA.forEach(registerAchievement);
// Un logro «Pokédex de <región>» por cada región del Gachapon: te da BP, tickets y el AMULETO ARCOÍRIS de esa región. El objetivo es el nº de Pokémon de la región que
// ya tienen sprite (regionSize, data.js): al añadir sprites nuevos el objetivo sube solo.
REGIONS_DEX.filter(r => regionSize(r.a, r.b) > 0).forEach(r => registerAchievement({id:'dex_' + r.n.toLowerCase(), cat:'coleccion', name:'Pokédex de ' + r.n,
  desc:`Consigue todos los Pokémon de ${r.n}. Te dan su Amuleto Arcoíris: más shiny en el Gachapon de ${r.n}.`, icon:'dex', metric:'dex_region', region:r.n, goal:regionSize(r.a, r.b),
  reward:{bp:1500, tickets:10, charm:r.n, title:'Pokédex de ' + r.n}}));
// Un logro por cada personaje de TRAINERS (vspanel.js): consigue esos Pokémon EN SHINY y reclama el logro para desbloquear al personaje (se elige en Perfil › Personaje)
const dexNames = list => { const n = list.map(d => { try{ return mon(d).name; }catch(e){ return '#' + d; } }); return n.length > 1 ? n.slice(0, -1).join(', ') + ' y ' + n[n.length - 1] : n[0]; };
TRAINERS.forEach(t => registerAchievement({id:'tr_' + t.id, cat:'entrenadores', name:t.name, desc:`Consigue en versión shiny a ${dexNames(t.dex)}. Desbloquea al personaje ${t.name}.`, icon:'dex',
  metric:'shiny_dex', dex:t.dex, goal:t.dex.length, reward:{trainer:t.id}}));
const trainerUnlocked = id => ACHIEVEMENTS.some(a => a.reward && a.reward.trainer === id && achGet(a.id).claimed);
const achDef = id => ACHIEVEMENTS.find(a => a.id === id);
function achGet(id){                                // estado de un logro (no modifica nada). Las partidas antiguas ya tenían "date" = cobrado
  const s = save.ach[id], d = achDef(id), claimed = !!(s && s.date);
  return {progress:(s && s.progress) || 0, date:(s && s.date) || null, claimed, done:claimed || !!(s && s.done), goal:d ? d.goal : 0};
}
const achClaimedCount = () => ACHIEVEMENTS.filter(a => achGet(a.id).claimed).length;
const achReadyCount = () => ACHIEVEMENTS.filter(a => { const s = achGet(a.id); return s.done && !s.claimed; }).length;
const achRewardText = r => r ? [r.bp ? `${r.bp} BP` : '', r.tickets ? `${r.tickets} ticket${r.tickets > 1 ? 's' : ''} de Gachapon` : '', r.charm ? `Amuleto Arcoíris de ${r.charm}` : '', r.key && typeof KEY_ITEMS !== 'undefined' && KEY_ITEMS[r.key] ? KEY_ITEMS[r.key].n : '', r.title ? `título «${r.title}»` : '', r.frame && typeof ACH_FRAMES !== 'undefined' && ACH_FRAMES[r.frame] ? `marco ${ACH_FRAMES[r.frame].n}` : '', r.trainer ? `personaje ${(TRAINERS.find(t => t.id === r.trainer) || {}).name || r.trainer}` : ''].filter(Boolean).join(' + ') : '';

// ---- Recompensa: Puntos de Batalla y/o tickets de Gachapon ----
function achGrant(r){
  if(!r) return;
  if(r.bp) save.bp += r.bp;
  if(r.tickets) save.tickets += r.tickets;
  if(r.charm) save.charms[r.charm] = true;
  if(typeof refreshHud === 'function') refreshHud();
}
function achComplete(id){                           // marca el logro como completado (NO da la recompensa: hay que reclamarla)
  const d = achDef(id); if(!d || achGet(id).done) return false;
  save.ach[id] = {progress:d.goal || 1, done:Date.now(), date:null};
  if(d.reward && d.reward.key && typeof giveKey === 'function') giveKey(d.reward.key);               // objetos clave (Mega-Aro): se entregan AL COMPLETAR el logro, sin tener que reclamar (mega.js)
  persist(); return true;
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
  const keys = list.filter(d => d.reward && d.reward.key && typeof KEY_ITEMS !== 'undefined' && KEY_ITEMS[d.reward.key]).map(d => KEY_ITEMS[d.reward.key].n);
  toast(`🏆 ${list.length > 1 ? 'Logros completados' : 'Logro completado'}: ${list.map(d => d.name).join(', ')} · ¡Reclama la recompensa en Logros!` + (keys.length ? ` · ¡Has recibido: ${keys.join(', ')}! (Mochila)` : ''));
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
// Lista compacta: una fila por logro (medalla pequeña, nombre y descripción, barra, recompensa y botón). Pestañas por categoría, los listos arriba del todo
// y los logros secretos como «???» hasta que los consigues. La medalla de cada logro se dibuja por código (achMedal), sin imágenes.
const ACH_REG_COL = {Kanto:'#e23b3b', Johto:'#f0b429', Hoenn:'#2bb3a3', Sinnoh:'#7b8cff', 'Unova / Teselia':'#b4bdd2', Kalos:'#ff7ab8'};   // color de cada región
const ACH_REG_NAME = {'Unova / Teselia':'Teselia'};                                          // cómo se escribe el grupo en pantalla
const ACH_GROUP = {primer_gimnasio:'Primeros pasos', mega_aro:'Unova / Teselia'};            // logros que van a un grupo concreto (si no, se agrupan por región o por métrica)
const ACH_TABS = [['all', 'Todos'], ['historia', 'Historia'], ['campo', 'Campo'], ['coleccion', 'Colección'], ['entrenadores', 'Entrenadores'], ['secreto', 'Secretos']];
let achTab = 'all', achHideDone = false; const achJust = new Set();                           // pestaña actual · ocultar los ya reclamados · logros recién reclamados (animación)

// ---- Marcos de avatar y títulos de perfil: son recompensas especiales de algunos logros (reward.frame / reward.title) y se eligen en Perfil ----
const ACH_FRAMES = {bronce:{n:'Bronce', c:'#cd7f32'}, plata:{n:'Plata', c:'#d5dcec'}, oro:{n:'Oro', c:'#ffcc33'}, kanto:{n:'Kanto', c:'#e23b3b'}, johto:{n:'Johto', c:'#f0b429'},
  hoenn:{n:'Hoenn', c:'#2bb3a3'}, sinnoh:{n:'Sinnoh', c:'#7b8cff'}, teselia:{n:'Teselia', c:'#b4bdd2'}, kalos:{n:'Kalos', c:'#ff7ab8'}, campo:{n:'Campo', c:'#4ccf6a'},
  brillo:{n:'Brillo', c:'#ffe26a'}, arcoiris:{n:'Arcoíris', c:'#ff7ad9'}, mewtwo:{n:'Mewtwo shiny', c:'#4af0a8'}};                  // el aspecto de cada uno está en css/style.css (.av.fr-<id>)
const achFramesUnlocked = () => Object.keys(ACH_FRAMES).filter(f => ACHIEVEMENTS.some(a => a.reward && a.reward.frame === f && achGet(a.id).claimed));
const achTitlesUnlocked = () => ACHIEVEMENTS.filter(a => a.reward && a.reward.title && achGet(a.id).claimed).map(a => ({id:a.id, text:a.reward.title}));
const achActiveTitle = () => { const a = save.title && achDef(save.title); return a && a.reward && a.reward.title && achGet(a.id).claimed ? a.reward.title : ''; };
const achActiveFrame = () => ACH_FRAMES[save.frame] && achFramesUnlocked().includes(save.frame) ? save.frame : '';
const achFrameSource = f => { const a = ACHIEVEMENTS.find(x => x.reward && x.reward.frame === f); return a ? (a.secret && !achGet(a.id).done ? 'un logro secreto' : 'el logro «' + a.name + '»') : ''; };

// ---- Medallas ----
const achMix = (a, b, t) => { const A = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const ACH_GLYPH = {                                                                          // dibujo de 7x7 que va dentro de la medalla (# = blanco)
  gem:   ['...#...', '..###..', '.#####.', '#######', '.#####.', '..###..', '...#...'],
  tower: ['#.#.#.#', '#######', '.#####.', '.##.##.', '.##.##.', '.#####.', '#######'],
  crown: ['#..#..#', '##.#.##', '#######', '#######', '.#####.', '.#####.', '.......'],
  trophy:['#######', '#.###.#', '#.###.#', '.#####.', '..###..', '...#...', '..###..'],
  star:  ['...#...', '...#...', '#######', '.#####.', '..###..', '.##.##.', '.#...#.'],
  book:  ['###.###', '#.#.#.#', '#.#.#.#', '#.#.#.#', '#.#.#.#', '#######', '.......'],
  bolt:  ['...###.', '..###..', '.###...', '#######', '...###.', '..##...', '.#.....'],
  q:     ['.#####.', '##...##', '....##.', '...##..', '...#...', '.......', '...#...'],
  ball:  ['..rrr..', '.rrrrr.', 'rrrrrrr', 'kkkwkkk', 'wwwwwww', '.wwwww.', '..www..']
};
function achStyle(a){                                                                        // forma, dibujo y color de la medalla de un logro
  const col = ACH_REG_COL[a.region] || ({campo:'#4ccf6a', coleccion:'#4fb3ff'})[a.cat] || '#ffcc33';
  if(a.id === 'mega_aro') return {shape:'ring', glyph:null, col:'#ff9ae8'};
  switch(a.metric){
    case 'leaders':       return {shape:'oct',    glyph:'gem',    col};
    case 'elite':         return {shape:'shield', glyph:'tower',  col};
    case 'champion':      return {shape:'star',   glyph:a.region ? 'crown' : 'trophy', col};
    case 'campo_wins':    return {shape:'circle', glyph:'bolt',   col};
    case 'campo_tier':    return {shape:'shield', glyph:'star',   col};
    case 'pokemon_owned': return {shape:'circle', glyph:'ball', col};
    case 'dex_region':    return {shape:'circle', glyph:'book', col};
    case 'shiny_owned':   return {shape:'spark',  glyph:'star',   col:'#ffe26a'};
    case 'shiny_dex':     return {shape:'spark',  glyph:'star',   col:'#ffe26a'};
    case 'owns':          return {shape:'circle', glyph:'ball',   col:'#b07bff'};
  }
  return {shape:'circle', glyph:'trophy', col};
}
function achShapeFn(shape){                                                                  // ¿está el punto dentro de la forma? (dx, dy desde el centro de un lienzo de 18 x 18)
  const R = 8.3;
  if(shape === 'oct')    return (dx, dy) => Math.max(Math.abs(dx), Math.abs(dy)) <= R && Math.abs(dx) + Math.abs(dy) <= R * 1.45;
  if(shape === 'shield') return (dx, dy) => { const ay = dy + 8.6; return ay >= 0 && ay <= 17.2 && Math.abs(dx) <= (ay < 9 ? 7.6 : 7.6 * Math.pow(1 - (ay - 9) / 8.6, .75)); };
  if(shape === 'spark')  return (dx, dy) => Math.pow(Math.abs(dx), .55) + Math.pow(Math.abs(dy), .55) <= Math.pow(8.6, .55);
  if(shape === 'ring')   return (dx, dy) => { const d = dx * dx + dy * dy; return d <= R * R && d >= 3.7 * 3.7; };
  if(shape === 'star'){
    const pts = []; for(let i = 0; i < 10; i++){ const r = i % 2 ? 5 : 8.9, an = -Math.PI / 2 + i * Math.PI / 5; pts.push([Math.cos(an) * r, Math.sin(an) * r]); }
    return (dx, dy) => { let ins = false; for(let i = 0, j = 9; i < 10; j = i++){ const [xi, yi] = pts[i], [xj, yj] = pts[j]; if((yi > dy) !== (yj > dy) && dx < (xj - xi) * (dy - yi) / (yj - yi) + xi) ins = !ins; } return ins; };
  }
  return (dx, dy) => dx * dx + dy * dy <= R * R;                                             // círculo
}
function achMedal(a, secret){                                                                        // lienzo 18 x 18 con la medalla del logro (a todo color; si está bloqueado, el CSS la apaga)
  const N = 18, c = document.createElement('canvas'); c.width = c.height = N; c.className = 'amedal';
  const x = c.getContext('2d'), st = secret ? {shape:'circle', glyph:'q', col:'#8b98ad'} : achStyle(a), inside = achShapeFn(st.shape), M = [];
  for(let j = 0; j < N; j++){ M[j] = []; for(let i = 0; i < N; i++) M[j][i] = inside(i + .5 - N / 2, j + .5 - N / 2); }
  const at = (i, j) => i >= 0 && j >= 0 && i < N && j < N && M[j][i];
  for(let j = 0; j < N; j++) for(let i = 0; i < N; i++){
    if(!M[j][i]) continue;
    const edge = !at(i - 1, j) || !at(i + 1, j) || !at(i, j - 1) || !at(i, j + 1);
    x.fillStyle = edge ? achMix(st.col, '#000000', .6)
      : (!at(i - 2, j) || !at(i, j - 2) || !at(i - 1, j - 1)) && (!at(i - 1, j) || !at(i, j - 1)) ? achMix(st.col, '#ffffff', .5)                                      // borde luminoso (arriba-izquierda)
      : (!at(i + 1, j) || !at(i, j + 1) || !at(i + 1, j + 1)) && (!at(i + 2, j) || !at(i, j + 2)) ? achMix(st.col, '#000000', .3)                                      // borde oscuro (abajo-derecha)
      : achMix(st.col, '#ffffff', .22 * (1 - j / N) - .05 * (j / N));                                                                                                   // relleno con un poco de degradado
    x.fillRect(i, j, 1, 1);
  }
  if(st.shape === 'ring'){ x.fillStyle = '#ffffff'; x.fillRect(8, 1, 2, 3); x.fillStyle = '#ffd0f4'; x.fillRect(8, 1, 1, 1); }                                         // la gema del Mega-Aro
  const G = st.glyph && ACH_GLYPH[st.glyph];
  if(G){
    const ox = 5.5 | 0, oy = st.shape === 'shield' ? 4 : 5, pal = {'#':'#ffffff', r:'#e0352b', w:'#f4f4f4', k:'#10131f'};
    G.forEach((row, j) => [...row].forEach((ch, i) => { if(ch !== '.'){ x.fillStyle = achMix(st.col, '#000000', .55); x.fillRect(ox + i + 1, oy + j + 1, 1, 1); } }));    // sombra
    G.forEach((row, j) => [...row].forEach((ch, i) => { if(ch !== '.'){ x.fillStyle = pal[ch]; x.fillRect(ox + i, oy + j, 1, 1); } }));
  }
  return c;
}


// ---- Recompensas en forma de fichas pequeñas ----
function achChips(r, hidden){
  const w = document.createElement('div'); w.className = 'achips'; if(!r) return w;
  const chip = (cls, txt, ico, col, img, sw) => {
    const e = document.createElement('span'); e.className = 'achip ' + cls;
    if(ico){ const c = document.createElement('canvas'); bitmap(c, ICONS[ico], col); e.appendChild(c); }
    if(img){ const im = new Image(); im.alt = ''; im.src = img; e.appendChild(im); }
    if(sw){ const q = document.createElement('i'); q.style.background = sw; e.appendChild(q); }
    e.appendChild(document.createTextNode(txt)); w.appendChild(e);
  };
  if(hidden){ chip('ky', 'Recompensa: ???'); return w; }
  if(r.bp) chip('bp', `${r.bp} BP`, 'coin', '#ffcc33');
  if(r.tickets) chip('tk', `${r.tickets} ticket${r.tickets > 1 ? 's' : ''}`, 'ticket', '#ff8ad8');
  if(r.title) chip('ti', `Título: ${r.title}`);
  if(r.frame && ACH_FRAMES[r.frame]) chip('fr', `Marco ${ACH_FRAMES[r.frame].n}`, null, null, null, ACH_FRAMES[r.frame].c);
  if(r.trainer) chip('ti', `Personaje: ${(TRAINERS.find(t => t.id === r.trainer) || {}).name || r.trainer}`);
  if(r.charm) chip('ch', 'Amuleto Arcoíris', null, null, CHARM_IMG);
  if(r.key && typeof KEY_ITEMS !== 'undefined' && KEY_ITEMS[r.key]) chip('ky', KEY_ITEMS[r.key].n);
  return w;
}

// ---- Orden y grupos ----
function achGroupOf(a){
  if(ACH_GROUP[a.id]) return ACH_GROUP[a.id];
  if(a.cat === 'historia') return a.region || 'Maestro de Ligas';
  if(a.cat === 'campo') return a.metric === 'campo_tier' ? 'Dificultades' : 'Victorias';
  if(a.cat === 'entrenadores') return a.reward && TRAINERS.some(t => t.masters && t.id === a.reward.trainer) ? 'Versiones Masters' : 'Personajes';
  if(a.cat === 'coleccion') return a.metric === 'shiny_owned' ? 'Shiny' : a.metric === 'dex_region' ? 'Pokédex' : 'Pokémon';
  return ACH_CATS[a.cat] || a.cat;
}
function achGroups(cat){                                                                     // [[nombre del grupo, [logros]]] de una categoría, en el orden de pantalla (solo se ordena lo que se ve; los datos no se tocan)
  const kind = {leaders: 0, elite: 1, champion: 2}, order = [], map = {};
  ACHIEVEMENTS.filter(a => a.cat === cat).forEach(a => { const g = achGroupOf(a); if(!map[g]){ map[g] = []; order.push(g); } map[g].push(a); });
  const rank = g => cat !== 'historia' ? order.indexOf(g) : g === 'Primeros pasos' ? -1 : g === 'Maestro de Ligas' ? 99 : Object.keys(ACH_REG_COL).indexOf(g);
  order.sort((a, b) => rank(a) - rank(b));
  order.forEach(g => map[g].sort((a, b) => ((kind[a.metric] ?? 3) - (kind[b.metric] ?? 3)) || ((a.goal || 0) - (b.goal || 0))));
  return order.map(g => [g, map[g]]);
}
const achState = a => { const s = achGet(a.id); return s.claimed ? 'claimed' : s.done ? 'ready' : 'todo'; };

function achRow(a){
  const s = achGet(a.id), st = achState(a), hide = !!a.secret && !s.done, d = document.createElement('div');
  d.className = 'arow ' + (st === 'claimed' ? 'done' : st === 'ready' ? 'ready' : 'locked') + (hide ? ' secret' : '') + (achJust.has(a.id) ? ' just' : ''); d.dataset.id = a.id; d.style.setProperty('--ac', achStyle(a).col);
  const mw = document.createElement('div'); mw.className = 'amw'; mw.appendChild(achMedal(a, hide)); d.appendChild(mw);
  const t = document.createElement('div'); t.className = 'abody';
  const nm = document.createElement('div'); nm.className = 'an'; nm.textContent = hide ? '???' : a.name; t.appendChild(nm);
  const p = document.createElement('div'); p.className = 'ad'; p.textContent = hide ? 'Logro secreto. ' + (a.hint ? 'Pista: ' + a.hint : '¡Descúbrelo jugando!') : a.desc; t.appendChild(p);
  d.appendChild(t);
  const pg = document.createElement('div'); pg.className = 'apg';
  if(a.goal > 1 && !hide){
    const cur = s.done ? a.goal : Math.min(s.progress, a.goal), bar = document.createElement('div'); bar.className = 'abar';
    const fill = document.createElement('i'); fill.style.width = Math.min(100, cur / a.goal * 100) + '%'; bar.appendChild(fill);
    const n = document.createElement('small'); n.textContent = `${cur} / ${a.goal}`; bar.appendChild(n); pg.appendChild(bar);
  }
  d.appendChild(pg);
  d.appendChild(achChips(a.reward, hide));
  const ac = document.createElement('div'); ac.className = 'aact';
  if(st === 'ready'){
    const bt = document.createElement('button'); bt.className = 'main aclaim'; bt.textContent = 'Reclamar';
    bt.onclick = () => { if(achClaim(a.id)) achJust.add(a.id); achRender(); setTimeout(() => { achJust.clear(); }, 900); }; ac.appendChild(bt);
  }else if(st === 'claimed'){ const ck = document.createElement('span'); ck.className = 'ack'; ck.textContent = '✓'; ck.title = 'Reclamado el ' + new Date(s.date).toLocaleDateString('es-ES', {day:'2-digit', month:'2-digit', year:'numeric'}); ac.appendChild(ck); }
  d.appendChild(ac); return d;
}
function achRender(){
  const total = ACHIEVEMENTS.length, cl = achClaimedCount(), ready = achReadyCount(), pct = total ? Math.round(cl / total * 100) : 0;
  const cr = document.querySelector('.ubar .crumbs'); if(cr){ cr.outerHTML = crumbsHtml('ach'); }   // actualiza el aviso rojo de la miga
  $('achHead').innerHTML = `<b>${cl}<small> / ${total}</small></b><div class="abar big"><i style="width:${pct}%"></i></div><span>${pct}%</span>`;
  const tools = $('achTools'); tools.innerHTML = '';
  if(ready){ const b = document.createElement('button'); b.className = 'main'; b.id = 'achAll'; b.textContent = ready > 1 ? `Reclamar todo (${ready})` : 'Reclamar'; b.onclick = () => { achClaimAll(); achRender(); }; tools.appendChild(b); }
  const hd = document.createElement('button'); hd.className = 'afil' + (achHideDone ? ' on' : ''); hd.textContent = achHideDone ? 'Mostrar reclamados' : 'Ocultar reclamados'; hd.onclick = () => { achHideDone = !achHideDone; achRender(); }; tools.appendChild(hd);
  const tabs = $('achTabs'); tabs.innerHTML = '';
  ACH_TABS.forEach(([k, name]) => {
    const list = k === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => a.cat === k); if(k !== 'all' && !list.length) return;
    const rd = list.filter(a => achState(a) === 'ready').length, b = document.createElement('button');
    b.className = 'atab' + (achTab === k ? ' on' : ''); b.innerHTML = `${name} <small>${list.filter(a => achState(a) === 'claimed').length}/${list.length}</small>` + (rd ? `<i class="bdg">${rd}</i>` : '');
    b.onclick = () => { achTab = k; achRender(); }; tabs.appendChild(b);
  });
  const root = $('agrids'); root.innerHTML = '';
  if(!ACHIEVEMENTS.length){ root.innerHTML = '<p class="help">Todavía no hay logros.</p>'; return; }
  const cats = Object.keys(ACH_CATS).filter(cat => achTab === 'all' || achTab === cat), inTab = a => cats.includes(a.cat);
  const label = (txt, n, col) => { const h = document.createElement('div'); h.className = 'agh'; if(col) h.style.setProperty('--ac', col); h.innerHTML = `<span>${esc(txt)}</span><small>${n}</small>`; root.appendChild(h); };
  const box = () => { const l = document.createElement('div'); l.className = 'alist'; root.appendChild(l); return l; };
  const rdy = ACHIEVEMENTS.filter(a => inTab(a) && achState(a) === 'ready');
  if(rdy.length){ label('Listos para reclamar', rdy.length, '#4ccf6a'); const l = box(); rdy.forEach(a => l.appendChild(achRow(a))); }
  let shown = rdy.length;
  cats.forEach(cat => achGroups(cat).forEach(([g, all]) => {
    const list = all.filter(a => achState(a) !== 'ready' && !(achHideDone && achState(a) === 'claimed')); if(!list.length) return;
    label(ACH_REG_NAME[g] || g, `${all.filter(a => achState(a) === 'claimed').length}/${all.length}`, ACH_REG_COL[g]);
    const l = box(); list.forEach(a => { l.appendChild(achRow(a)); shown++; });
  }));
  if(!shown){ const e = document.createElement('p'); e.className = 'aempty'; e.textContent = '¡No te queda ninguno por reclamar aquí!'; root.appendChild(e); }
}
function openAchievements(){
  achSync();
  panel(userBar('ach') + `<h1>Logros</h1><div class="ahead"><div id="achHead"></div><div id="achTools"></div></div><div class="atabs" id="achTabs"></div><div id="agrids"></div>`);
  achRender();
}
