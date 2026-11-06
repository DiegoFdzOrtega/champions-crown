"use strict";
/* =====================================================================
   TORRE BATALLA: 50 pisos contra PERSONAJES del mundo Pokémon
   - Empiezas en el piso 1 con tu equipo de 3. Cada piso es un combate; al ganarlo subes al siguiente, hasta el piso 50.
   - Rivales: personajes de la Invocación que NO salen en la Historia (héroes, rivales, villanos y jefes de los equipos malvados,
     personajes del anime...; ni clases genéricas, ni Líderes, Alto Mando o Campeones). Van saliendo POR TURNOS en un orden
     barajado (save.tower.rot = cuántos llevas): siempre te toca alguien contra quien NO te has enfrentado todavía.
   - Cada 10 pisos (10, 20, 30, 40 y 50) un JEFE: un CAMPEÓN con sus 6 Pokémon (al azar, sin repetir en la subida).
   - La «subida» (los 50 rivales) se decide al empezar desde el piso 1 (torrePlan) y se ve en la torre: el siguiente rival a la vista,
     los demás en silueta. Tus Pokémon se CURAN en cada piso. Si pierdes, la subida acaba; lo ganado es tuyo.
   - Se abre al ser Campeón de KANTO (towerOpen), para poder farmear premios pronto.
   - La subida en marcha se GUARDA (save.tower.run = {f: último piso superado, r: con qué rival empezó}): puedes recargar y seguir.
     Si pierdes (o empiezas otra), TODOS los rivales de esa subida cambian: la siguiente empieza 45 personajes más allá.
   - save.tower = {best, total, runs, ms:{piso:1}, rot, seen, run}. Se juega en el estadio de la Torre (js/pruebas.js · estTorre).
   - Equilibrio: TORRE_CURVA (dificultad), torreReward (premio por piso) y TORRE_HITOS (premios únicos).
   Se carga DESPUÉS de campo.js. El combate lo cierra torreEnd(), que llama endBattle (modes.js).
   ===================================================================== */
const TORRE_BOSS_CADA = 10;                         // cada cuántos pisos hay un Campeón
const TORRE_MAX = 50;                               // pisos de la Torre
const TORRE_EXTRA = [];                             // (compatibilidad) entrenadores extra con el formato de CAMPO

// Dificultad por piso (misma fórmula que la Historia y el Campo: DIFF en data.js). piso 1 ≈ Campo Fácil · piso 50 = muy difícil.
const TORRE_CURVA = {
  n:   f => 2 + f * .30,
  lvl: f => Math.min(180, 106 + 2 * f),
  jefe: {n: 3, lvl: 6}                              // los Campeones llevan +3 de n y +6 de nivel
};
function torreStats(f, boss){
  const D = DIFF.dificil, n = TORRE_CURVA.n(f) + (boss ? TORRE_CURVA.jefe.n : 0), lvl = TORRE_CURVA.lvl(f) + (boss ? TORRE_CURVA.jefe.lvl : 0), k = lvl / 100;
  return {lvl, hm:D.hm(n) * k, dm:D.dm(n) * k, skill:Math.min(1, D.skill(n)), spdm:1 + (k - 1) * .4};
}

// Premio por cada piso superado (sube con el piso): BP y Chapas Plateadas siempre, tiradas cada 3 pisos y, al vencer a un Campeón,
// Chapas Doradas, una tirada legendaria y Estrellas de Invocación. Claves: bp, tickets, ticketsL, chapaplata, chapa, estrella, estrella_t.
function torreReward(f){
  const r = {bp: 60 + 12 * f, chapaplata: 2 + Math.floor(f / 4)};
  if(f % 3 === 0) r.tickets = 1 + Math.floor(f / 15);
  if(f % TORRE_BOSS_CADA === 0){ r.bp += 400 + 40 * f; r.chapa = 5 + Math.floor(f / 5); r.ticketsL = 1; r.estrella = f >= TORRE_MAX ? 3 : 1; if(f >= 30) r.estrella_t = f >= TORRE_MAX ? 3 : 1; }
  return r;
}
// Premios ÚNICOS: la primera vez que superas ese piso
const TORRE_HITOS = [
  {f:10, bp:1500,  tickets:5,  estrella:2},
  {f:25, bp:4000,  tickets:15, ticketsL:2, estrella:3, estrella_t:3},      // estrella_t = estrellas de los Masters (rosas)
  {f:50, bp:20000, tickets:40, ticketsL:5, estrella_t:10}          // ¡Torre completada!
];

// ---- ¿Está abierta? Al ser Campeón de Kanto ----
const leaguesAvail = () => REGIONS.filter(r => FLOORS.some(F => F.region === r));
const towerOpen = () => champAny('Kanto');
const towerNeed = () => towerOpen() ? 0 : 1;

// ---- RIVALES: personajes de la Invocación que no salen en la Historia (uno por personaje), en un orden barajado fijo ----
let TORRE_RIV = null;
function torreRivales(){
  if(TORRE_RIV) return TORRE_RIV;
  const L = (typeof INV_LIST !== 'undefined' ? INV_LIST : []).filter(x => x.t !== 'C' && x.n !== '???' && !['ch', 'am', 'gy', 'ma'].some(t => invHas(x, t)));
  const R = invSeeded(20261106), byName = new Map();
  L.map(x => [x, R()]).sort((a, b) => a[1] - b[1]).forEach(([x]) => { if(!byName.has(x.n)) byName.set(x.n, x); });   // una versión de cada personaje
  return TORRE_RIV = [...byName.values()];
}
// Tipos que le pegan a cada personaje: primero los famosos (por su archivo), luego por palabras de su clase, y los villanos, Siniestro/Veneno
const TORRE_FIRMA = {giovanni:['tierra'], archie:['agua', 'siniestro'], maxie:['fuego', 'tierra'], cyrus:['siniestro', 'hielo'], ghetsis:['dragon', 'siniestro'], lysandre:['fuego'],
  guzma:['bicho'], lusamine:['hada', 'veneno'], rose:['acero'], n:['dragon', 'normal'], silver:['siniestro'], ash:['electrico', 'fuego', 'volador'], colress:['acero', 'electrico'],
  xerosic:['veneno'], zinnia:['dragon'], wally:['psiquico'], mars:['veneno'], jupiter:['veneno'], saturn:['veneno'], volo:['fantasma'], kieran:['dragon', 'planta'], carmine:['planta'],
  arven:['planta', 'acero'], penny:['hada'], hop:['normal'], bede:['hada', 'psiquico'], marnie:['siniestro'], gladion:['siniestro'], hau:['normal'], lillie:['hada'], tierno:['normal'],
  shauna:['hada'], sina:['hielo'], dexio:['psiquico'], cheren:['normal'], bianca:['normal'], barry:['fuego'], brendan:['planta'], may:['agua'], lyra:['agua'], ethan:['fuego'],
  green:['planta'], leaf:['planta'], yellow:['electrico'], petrel:['veneno'], proton:['veneno'], archer:['siniestro'], ariana:['veneno'], courtney:['fuego'], tabitha:['fuego'],
  shelly:['agua'], matt:['agua'], plumeria:['veneno'], faba:['psiquico'], wicke:['psiquico'], phyco:['tierra'], dulse:['dragon'], soliera:['acero'], zossie:['electrico']};
const TORRE_AFIN = [
  [/aqua|swimmer|fisher|sailor|surfer|scuba|diver|tuber|beauty|firefighter/, ['agua']],
  [/magma|firebreather|kindler|flare/, ['fuego']],
  [/bug/, ['bicho']],
  [/bird|skytrainer|pilot/, ['volador']],
  [/psychic|sage|medium|mystic|channeler/, ['psiquico', 'fantasma']],
  [/hex|ghost/, ['fantasma']],
  [/blackbelt|battlegirl|crush|karate|roughneck|bodybuilder|hoopster|striker|linebacker/, ['lucha']],
  [/hiker|ruin|worker|backpacker|cyclist|biker/, ['roca', 'tierra', 'acero']],
  [/^ski|snow|boarder|workerice/, ['hielo']],
  [/dragon|tamer/, ['dragon']],
  [/skull|punk|streetthug|delinquent|ruffian|rocket|galactic|plasma|yell|star/, ['veneno', 'siniestro']],
  [/engineer|guitarist|rocker|scientist|gamer/, ['electrico', 'acero']],
  [/gardener|aroma|farmer|breeder|ranger|picnicker|camper/, ['planta', 'bicho', 'normal']],
  [/fairy|lady|idol|madame|parasol|dancer|model/, ['hada', 'normal']]
];
let TORRE_SETS = null;                                                                   // todos los Pokémon ya preparados del juego (líderes y Campo), uno por especie
function torreSets(){
  if(TORRE_SETS) return TORRE_SETS;
  const seen = new Set(), out = [];
  [...Object.values(TEAMS), ...CAMPO.map(T => T.team)].forEach(t => (t || []).forEach(s => { if(s && s.dex && mon(s.dex) && !seen.has(s.dex)){ seen.add(s.dex); out.push(s); } }));
  return TORRE_SETS = out;
}
function torreEquipo(x, n, seed){                                                        // n Pokémon distintos, con los tipos que le pegan a ese personaje (seed: el mismo equipo aunque recargues)
  const base = x.f.split('-')[0], af = TORRE_FIRMA[base] || (TORRE_AFIN.find(([re]) => re.test(x.f)) || [null, null])[1] || (invHas(x, 'vi') ? ['siniestro', 'veneno'] : null), all = torreSets();
  const R = invSeeded(seed || 1), mix = l => l.map(s => [s, R()]).sort((a, b) => a[1] - b[1]).map(p => p[0]);
  const fit = af ? mix(all.filter(s => mon(s.dex).types.some(t => af.includes(t)))) : [];
  const out = fit.slice(0, Math.max(n - 1, Math.min(n, fit.length)));                  // casi todo de su tipo y alguno de otro, para que no sea tan previsible
  for(const s of mix(all)){ if(out.length >= n) break; if(!out.includes(s)) out.push(s); }
  return out;
}
// ---- La subida: los 50 rivales, decididos al empezar ----
// Pisos normales: los siguientes personajes de la lista (desde save.tower.rot). Pisos 10/20/30/40/50: Campeones distintos al azar.
function torrePlanFrom(rot){
  const L = torreRivales(), champs = FLOORS.filter(F => F.kind === 'campeon' && TEAMS[F.id]), R = invSeeded(rot * 31 + 7);
  const cs = champs.map(F => [F, R()]).sort((a, b) => a[1] - b[1]).map(p => p[0]);
  const plan = []; let k = 0, b = 0;
  for(let f = 1; f <= TORRE_MAX; f++){
    if(f % TORRE_BOSS_CADA === 0){ const F = cs[b++ % cs.length]; plan.push({boss:true, id:F.id, name:F.leader}); }
    else { const x = L[(rot + k++) % L.length]; plan.push({id:'inv_' + x.f, x, name:x.n, path:invUrl(x.f)}); }
  }
  return plan;
}
const TORRE_SALTO = TORRE_MAX - TORRE_MAX / TORRE_BOSS_CADA;                               // personajes de una subida (45): si la pierdes, la siguiente empieza después de todos ellos
let TW_PLAN = {r:-1, p:null};
function torrePlan(){                                                                    // los 50 rivales de la subida en marcha (o de la próxima)
  const tw = save.tower, r = tw.run ? tw.run.r : (tw.rot || 0);
  if(TW_PLAN.r !== r) TW_PLAN = {r, p:torrePlanFrom(r)};
  return TW_PLAN.p;
}
const torreRun = {get active(){ return !!save.tower.run; }, get floor(){ return save.tower.run ? save.tower.run.f : 0; }};
function torreAcabar(){ const tw = save.tower; if(tw.run){ tw.rot = tw.run.r + TORRE_SALTO; tw.run = null; } persist(); }   // fin de la subida: todos los rivales cambian
// ---- REYES DE LA TORRE ----
// Los pisos de Campeón (10, 20, 30, 40, 50) los puede ocupar un JUGADOR: el primero que llega se queda el trono con su tarjeta y los 3 Pokémon con los que subió.
// Si otro jugador le gana, el trono cambia cuando empieza la hora siguiente. Todo vive en Supabase (torre_reyes.sql); sin cuenta o sin la tabla, quedan los Campeones de siempre.
const TW_KFL = [10, 20, 30, 40, 50];
let TW_K = {at:0, list:{}};
function twLoadLeader(im, id, onfail){                                                   // retrato de un Campeón: se busca en la carpeta de SU región (no en la que estés jugando)
  const F = FLOORS.find(x => x.id === id), r0 = save.region;
  if(F && F.region) save.region = F.region;
  try{ loadLeaderInto(im, id, onfail); }finally{ save.region = r0; }
}
function twKingClean(r){                                                                 // lo que viene de la nube es DATO NO FIABLE: se valida todo
  const f = fpNum(r && r.floor); if(!TW_KFL.includes(f) || !Array.isArray(r.mons)) return null;
  const mons = r.mons.map(m => Array.isArray(m) ? [fpNum(m[0]), m[1] ? 1 : 0] : null).filter(m => m && m[0] && mon(m[0]) && !hidden(m[0])).slice(0, 3);
  if(!mons.length) return null;
  const nm = fpStr(r.username, 16) || 'Jugador', c = r.card && typeof r.card === 'object' ? r.card : {};
  const g = c.g === 'f' ? 'f' : (c.g === 'r' ? (nm.toLowerCase() === VS_MASTERS_USER ? 'r' : 'm') : (vsKnown(c.g) ? c.g : 'm'));
  const a = c.av && avatarList().find(x => x.file === fpStr(c.av, 80));
  return {f, uid:String(r.user_id || ''), nm, g, mons, av:a ? avatarUrl(a.file) : defaultAvatar(), since:r.since};
}
async function twKingsLoad(force){
  if(!cloud.ok || !cloud.user || cloud.needName) return;
  if(!force && Date.now() - TW_K.at < 60000) return;
  try{
    const {data, error} = await cloud.sb.rpc('tower_kings_get'); if(error) return;
    const L = {}; (data || []).forEach(r => { const k = twKingClean(r); if(k) L[k.f] = k; }); TW_K = {at:Date.now(), list:L};
  }catch(e){}
}
const twIsMe = k => !!(k && cloud.user && k.uid === cloud.user.id);
const twKing = f => { const k = TW_K.list[f]; return k && !twIsMe(k) ? k : null; };        // el Rey contra el que luchas (si el Rey eres tú, se usa un Campeón de siempre)
async function twClaim(f){                                                                // acabas de ganar un piso de Campeón: pides el trono
  if(!cloud.ok || !cloud.user || cloud.needName){ toast('Inicia sesión para poder ser Rey de la Torre Batalla.'); return; }
  try{
    const {data, error} = await cloud.sb.rpc('tower_claim', {p_floor:f, p_card:fpCard(), p_mons:team.map(d => [d, useShiny(d) ? 1 : 0])});
    if(error) return; TW_K.at = 0;
    if(data === 'king' || data === 'pending'){ save.stats.rey = (save.stats.rey || 0) + 1; persist(); if(typeof achSync === 'function') achSync(); }          // logros: tronos conseguidos
    if(data === 'king') toast(`¡Eres el Rey del piso ${f}! Los demás jugadores lucharán contra tu equipo.`);
    else if(data === 'pending') toast(`Has vencido al Rey del piso ${f}: el trono será tuyo cuando empiece la próxima hora.`);
  }catch(e){}
}
function torreCampeon(id, seed){                                                       // los Campeones llevan 6; en la Torre luchas contra 3: su último (el más fuerte) y 2 más (siempre los mismos en esa subida)
  const T = TEAMS[id] || [], R = invSeeded(seed || 1), rest = T.slice(0, -1).map(x => [x, R()]).sort((a, b) => a[1] - b[1]).map(q => q[0]);
  return T.length <= 3 ? T.slice() : [...rest.slice(0, 2), T[T.length - 1]];
}
function torreFight(f){
  if(!towerOpen()){ toast('La Torre Batalla se abre al ser Campeón de Kanto.'); return; }
  if(team.length !== 3){ toast('Elige 3 Pokémon en EQUIPO POKÉMON para subir a la Torre.'); return; }
  const tw = save.tower;
  if(f === 1 && tw.run && tw.run.f > 0) torreAcabar();                                   // empezar otra subida con una a medias: esa se da por terminada
  if(!tw.run){ tw.run = {f:0, r:tw.rot || 0}; tw.runs++; persist(); f = 1; }             // nueva subida
  f = tw.run.f + 1;                                                                       // siempre el siguiente piso de la subida guardada
  const P = torrePlan()[f - 1], boss = !!P.boss, S = torreStats(f, boss);
  let o, vs;
  const K = boss ? twKing(f) : null;
  if(K){                                                                                  // piso de Campeón ocupado por un jugador: su personaje y sus 3 Pokémon
    const F = FLOORS.find(x => x.id === P.id), en = K.mons.map(m => m[0]), sh = K.mons.filter(m => m[1]).map(m => m[0]);
    o = {torre:true, estTorre:true, torreFloor:f, floor:f, n:-1, leader:F.id, boss:F.kind, arena:F.arena, leaderName:K.nm, rival:K.nm, portrait:K.av, kingOf:f, title:'TORRE BATALLA', sub:`PISO ${f} · REY · ${K.nm.toUpperCase()}`, enemies:en, hm:S.hm, dm:S.dm, skill:S.skill, spdm:S.spdm, lvl:S.lvl};
    vs = {name:K.nm, skin:K.g, sub:`Rey del piso ${f}`, enemies:en, shinyOf:dex => sh.includes(dex), label:`TORRE · PISO ${f} · REY`, music:o};
  }else if(boss){
    const F = FLOORS.find(x => x.id === P.id);
    const en = torreCampeon(F.id, tw.run.r * 53 + f);
    o = {torre:true, estTorre:true, torreFloor:f, floor:f, n:-1, leader:F.id, boss:F.kind, arena:F.arena, leaderName:F.leader, rival:F.leader, title:'TORRE BATALLA', sub:`PISO ${f} · CAMPEÓN · ${F.leader.toUpperCase()}`, enemies:en, hm:S.hm, dm:S.dm, skill:S.skill, spdm:S.spdm, lvl:S.lvl};
    const im = new Image(); twLoadLeader(im, F.id); im.onload = () => { o.portrait = im.src; };                 // su retrato para la pantalla del estadio
    vs = {name:F.leader, id:F.id, enemies:en, label:`TORRE · PISO ${f} · CAMPEÓN`, music:o};
  }else{
    const team2 = torreEquipo(P.x, f < 15 ? 3 : 4, tw.run.r * 97 + f);
    o = {torre:true, estTorre:true, torreFloor:f, floor:f, n:-1, leader:'torre_' + P.id, arena:'campo', leaderName:P.name, rival:P.name, portrait:P.path, title:'TORRE BATALLA', sub:`PISO ${f} · ${P.name.toUpperCase()}`, enemies:team2, hm:S.hm, dm:S.dm, skill:S.skill, spdm:S.spdm, lvl:S.lvl};
    vs = {name:P.name, path:P.path, enemies:team2, label:`TORRE · PISO ${f}`, music:o};
  }
  vs.go = () => prGo(o);                                                                  // se juega en el ESTADIO de la Torre (js/pruebas.js · fondos/estadio_torre.webp)
  vsIntro(vs);
}

// Suma una recompensa a la partida y la deja en lastReward para la pantalla de victoria
function torreGive(r){
  Object.entries(r).forEach(([id, n]) => { if(id === 'tickets') save.tickets += n; else if(id === 'ticketsL') save.ticketsL += n; else if(id === 'bp') save.bp += n; else save.items[id] = held(id) + n; });
  lastReward = {list:Object.entries(r), dbl:false};
}
function torreEnd(won){                                                                  // lo llama endBattle (modes.js) cuando el combate es de la Torre
  g.over = true;
  const o = g.o, f = o.torreFloor, tw = save.tower, b = $('rBtns'); b.innerHTML = '';
  const add = (t, fn, main) => { const x = document.createElement('button'); x.textContent = t; if(main) x.className = 'main'; x.onclick = fn; b.appendChild(x); };
  if(won){
    const r = Object.assign({}, torreReward(f)), chips = [];
    TORRE_HITOS.forEach(h => { if(f >= h.f && !tw.ms[h.f]){ tw.ms[h.f] = 1;
      Object.entries(h).forEach(([k, v]) => { if(k !== 'f') r[k] = (r[k] || 0) + v; }); chips.push({t:`¡Premio único del piso ${h.f}!`, c:'#ffcc33'}); } });
    torreGive(r); tw.total++; if(!o.boss) tw.seen = (tw.seen || 0) + 1; if(tw.run) tw.run.f = f;
    const rec = f > tw.best; if(rec){ tw.best = f; chips.push({t:`¡NUEVO RÉCORD: piso ${f}!`, c:'#ff3ea5'}); } else chips.push({t:`Tu récord: piso ${tw.best}`, c:'#8fb3e8'});
    if(f >= TORRE_MAX){ chips.push({t:'¡TORRE COMPLETADA!', c:'#ffd84a'}); torreAcabar(); }
    else if((f + 1) % TORRE_BOSS_CADA === 0) chips.push({t:'¡El siguiente piso es un Campeón!', c:'#ff9a3a'});
    persist(); if(typeof achSync === 'function') achSync(); refreshHud();
    if(o.boss && f % TORRE_BOSS_CADA === 0) twClaim(f);                                    // piso de Campeón vencido: a por el trono
    victoryScreen({title:`¡Piso ${f} superado!`, sub:o.leaderName, rewards:lastReward, chips, leader:o.leader, path:o.portrait});
    if(f < TORRE_MAX) add(`Subir al piso ${f + 1}`, () => torreFight(f + 1), true); else add('Volver a subir (piso 1)', () => torreFight(1), true);
  }else{
    if(!o.boss) tw.seen = (tw.seen || 0) + 1; torreAcabar();
    resultClear(); $('rTitle').textContent = `Has caído en el piso ${f}`;
    $('rText').textContent = `${o.leaderName} ha ganado. Has superado ${f - 1} piso${f - 1 === 1 ? '' : 's'} en esta subida. Tu récord: piso ${tw.best}. En la próxima subida TODOS los rivales serán nuevos.`;
    add('Volver a subir (piso 1)', () => torreFight(1), true);
  }
  add('La Torre', () => { g = null; openTorre(); });
  add('Menú', () => { g = null; goMain(); });
  setTimeout(() => { show('result'); Sfx.play(won ? 'win' : 'lose'); }, 900);
}

// ---- PANTALLA DE LA TORRE ----
const TORRE_RWN = {bp:() => 'BP', tickets:n => n === 1 ? 'tirada' : 'tiradas', ticketsL:n => n === 1 ? 'legendaria' : 'legendarias', chapa:n => n === 1 ? 'dorada' : 'doradas',
  chapaplata:n => n === 1 ? 'plateada' : 'plateadas', estrella:n => n === 1 ? 'estrella' : 'estrellas', estrella_t:n => n === 1 ? 'estrella rosa' : 'estrellas rosas'};   // (chapas doradas/plateadas, estrellas de Invocación)
const torreRw = r => Object.entries(r).map(([id, n]) => `${n} ${TORRE_RWN[id] ? TORRE_RWN[id](n) : id}`).join(' · ');
// Pantalla #torrev sobre la ilustración fondos/torre_dia.webp (de 8:00 a 19:59) o torre_noche.webp (de 20:00 a 7:59).
// Los pisos van DENTRO del cristal de la torre (twFit los coloca encima de la imagen): se ven 10 y con las flechas se cambia de tramo.
// Cada piso enseña a su rival: los vencidos en esta subida y el siguiente, a la vista; los demás, en silueta; los Campeones con corona.
const TW_BG = {w:2880, h:1607, glass:{x:.436, y:.2195, w:.128, h:.5605}};               // dónde está el cristal de la torre en la imagen (en fracciones)
const twNight = () => { const h = new Date().getHours(); return h >= 20 || h < 8; };
const TW_ICO = {
  boss:'<svg viewBox="0 0 24 24"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill="currentColor"/></svg>',
  gift:'<svg viewBox="0 0 24 24"><path d="M4 11h16v10H4zM3 7h18v4H3zM12 7v14M12 7c-2-4-6-4-6-1s4 1 6 1c2 0 6 2 6-1s-4-3-6 1" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  who:'<svg viewBox="0 0 24 32"><circle cx="12" cy="8" r="6" fill="currentColor"/><path d="M1 32c0-9 5-15 11-15s11 6 11 15z" fill="currentColor"/></svg>',
  up:'<svg viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  dn:'<svg viewBox="0 0 24 24"><path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
let twPage = -1;                                                                          // tramo de 10 pisos que estás mirando (−1 = el de tu siguiente piso)
const twNext = () => save.tower.run ? Math.min(TORRE_MAX, save.tower.run.f + 1) : 1;     // el siguiente combate
const twCurPage = () => twPage >= 0 ? twPage : Math.floor((twNext() - 1) / 10);
// Iconos de las recompensas (los mismos de la pantalla de victoria)
const TW_RWI = {bp:() => CUR_SRC.bp, tickets:() => CUR_SRC.ticket, ticketsL:() => CUR_SRC.ticket_l, chapa:() => imgOf('chapa'), chapaplata:() => imgOf('chapaplata'), estrella:() => 'iconos/estrella.webp', estrella_t:() => 'iconos/estrella_t.webp'};
const TW_RWL = {bp:'Puntos de Batalla', tickets:'Tiradas de Gachapon', ticketsL:'Tiradas legendarias', chapa:'Chapas Doradas', chapaplata:'Chapas Plateadas', estrella:'Estrellas de Invocación', estrella_t:'Estrellas temáticas'};
const twChips = (r, big) => Object.entries(r).filter(([k]) => k !== 'f').map(([id, n]) => `<span class="tw-rwc${big ? ' big' : ''} rw-${id}" title="${TW_RWL[id] || id}"><img src="${TW_RWI[id] ? TW_RWI[id]() : ''}" alt="" onerror="this.style.display='none'"><b>${n >= 1000 ? (n / 1000).toFixed(n % 1000 ? 1 : 0).replace('.', ',') + 'k' : n}</b></span>`).join('');
const TW_SI = {
  rec:'<svg viewBox="0 0 24 24"><path d="M7 4h10v3a5 5 0 01-10 0zM5 5H3v2a4 4 0 004 4M19 5h2v2a4 4 0 01-4 4M12 12v4M8 20h8l-1-4H9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  eye:'<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>',
  run:'<svg viewBox="0 0 24 24"><path d="M4 20h4v-5h4v-5h4V5h4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>'
};
function openTorre(){
  const el = $('torrev');
  if(!el.dataset.built){
    el.dataset.built = '1';
    el.addEventListener('click', e => { const b = e.target.closest('[data-tw]'); if(!b) return; const a = b.dataset.tw;
      if(a === 'back') goMain(); else if(a === 'team') openTeam('torre'); else if(a === 'go') torreFight(twNext()); else if(a === 'new') torreFight(1); else if(a === 'guide') twGuide(true); else if(a === 'gx') twGuide(false);
      else if(a === 'up' || a === 'dn' || a === 'pg'){ const z = a === 'pg' ? +b.dataset.z : twCurPage() + (a === 'up' ? 1 : -1); twPage = Math.max(0, Math.min(TORRE_MAX / 10 - 1, z)); twRenderTower(); } });
    addEventListener('keydown', e => { if(e.code === 'Escape' && !$('torrev').classList.contains('hide')){ e.preventDefault(); if($('twGuide')) twGuide(false); else goMain(); } });
    addEventListener('resize', () => { if(!$('torrev').classList.contains('hide')) twFit(); });
  }
  twPage = -1;
  const tw = save.tower, ready = team.length === 3, open = towerOpen(), run = !!tw.run, nx = twNext(), P = torrePlan(), rivN = P[nx - 1], done = run ? tw.run.f : 0;
  const nextBoss = Math.ceil(nx / TORRE_BOSS_CADA) * TORRE_BOSS_CADA, hNext = TORRE_HITOS.find(h => !tw.ms[h.f]);
  const TN = {normal:'Normal', fuego:'Fuego', agua:'Agua', planta:'Planta', electrico:'Eléctrico', hielo:'Hielo', lucha:'Lucha', veneno:'Veneno', tierra:'Tierra', volador:'Volador', psiquico:'Psíquico', bicho:'Bicho', roca:'Roca', fantasma:'Fantasma', dragon:'Dragón', siniestro:'Siniestro', acero:'Acero', hada:'Hada'};
  const mons = [1, 0, 2].map(ti => { const d = team[ti]; if(!d) return `<div class="tw-mon empty"><span>Hueco ${ti + 1}</span></div>`;
    const m = mon(d); return `<div class="tw-mon${ti === 0 ? ' lead' : ''}" style="--c1:${TC[m.types[0]]};--c2:${TC[m.types[1] || m.types[0]]}"><i class="ped"></i><canvas width="160" height="160" data-d="${d}"></canvas>
      <b>${esc(m.name)}</b><span class="tys">${m.types.map(t => `<i style="--t:${TC[t]}">${TN[t] || t}</i>`).join('')}</span></div>`; }).join('');
  // tu subida: barra de 50 pisos con los 5 Campeones y el siguiente rival en grande
  const bar = `<div class="tw-prog"><i class="fill" style="width:${done / TORRE_MAX * 100}%"></i>${[10, 20, 30, 40, 50].map(f => `<span class="cp${done >= f ? ' ok' : ''}" style="left:${f / TORRE_MAX * 100}%">${TW_ICO.boss}</span>`).join('')}</div>`;
  const nxPic = rivN.boss ? `<span class="who">${TW_ICO.who}</span>` : `<img src="${rivN.path}" alt="">`;
  const ej = [1, 3, 10, 50].map(f => `<div class="tw-rw${f % TORRE_BOSS_CADA ? '' : ' boss'}"><b>${f % TORRE_BOSS_CADA ? 'Piso ' + f : `${TW_ICO.boss} Piso ${f}`}</b><span class="tw-chips">${twChips(torreReward(f))}</span></div>`).join('');
  const hit = TORRE_HITOS.map(h => { const got = !!tw.ms[h.f], pct = Math.min(1, tw.best / h.f);
    return `<div class="tw-h${got ? ' got' : ''}${h.f === TORRE_MAX ? ' fin' : ''}"><div class="hd"><b>Piso ${h.f}${h.f === TORRE_MAX ? ' · Cima' : ''}</b><em>${got ? '✓ Conseguido' : `${Math.min(tw.best, h.f)} / ${h.f}`}</em></div><span class="tw-chips">${twChips(h)}</span><i class="hp"><s style="width:${pct * 100}%"></s></i></div>`; }).join('');
  const crowns = [10,20,30,40,50].map(f => `<span class="cp${done >= f ? ' ok' : ''}" style="left:${f / TORRE_MAX * 100}%">${TW_ICO.boss}</span>`).join('');
  const minis = done ? P.slice(Math.max(0, done - 6), done).map(q => q.boss ? `<span class="b">${TW_ICO.boss}</span>` : `<img src="${q.path}" alt="" title="${esc(q.name)}">`).join('') : '';
  const tile = (id, n) => `<span class="v-tile rw-${id}" title="${TW_RWL[id] || id}"><img src="${TW_RWI[id] ? TW_RWI[id]() : ''}" alt="" onerror="this.style.display='none'"><b>${n >= 1000 ? (n / 1000).toFixed(n % 1000 ? 1 : 0).replace('.', ',') + 'k' : n}</b></span>`;
  const tiles = r => `<div class="v-tiles">${Object.entries(r).filter(([k]) => k !== 'f').map(([id, n]) => tile(id, n)).join('')}</div>`;
  const meds = TORRE_HITOS.map(h => { const got = !!tw.ms[h.f], pc = Math.round(Math.min(1, tw.best / h.f) * 100);
    return `<div class="v-med${got ? ' got' : ''}"><div class="hd"><b>Piso ${h.f}${h.f === TORRE_MAX ? ' · Cima' : ''}</b><em>${got ? '✓ Conseguido' : Math.min(tw.best, h.f) + ' / ' + h.f}</em></div>${tiles(h)}<i class="hp"><s style="width:${pc}%"></s></i></div>`; }).join('');
  el.innerHTML = `<div class="tw2 v2 ${twNight() ? 'night' : 'day'}" id="twRoot">
    <div class="tw-glass" id="twGlass"></div>
    <div class="tw-nav" id="twNav"></div>
    <header class="tw-top"><button class="tw-btn" data-tw="back">☰ Menú</button><button class="tw-btn v-gbtn" data-tw="guide">? Guía</button>
      <div class="tw-banner"><h1>Torre Batalla</h1></div>
      <div class="v-stats"><span title="Récord">${TW_SI.rec}<b>${tw.best}</b><small>Récord</small></span><span title="Rivales vencidos">${TW_SI.eye}<b>${tw.seen || 0}</b><small>Vencidos</small></span><span title="Subidas">${TW_SI.run}<b>${tw.runs}</b><small>Subidas</small></span></div></header>
    <aside class="tw-left v-L">
      <section class="v-hero${rivN.boss ? ' boss' : ''}">
        ${run && done ? '<button class="v-new" data-tw="new" title="Empezar otra subida: cambian todos los rivales">↻ Nueva subida</button>' : ''}
        <div class="art">${nxPic}</div>
        <small class="k">${rivN.boss ? '¡Un Campeón te espera!' : run && done ? 'Siguiente rival' : 'Primer rival'}</small>
        <b class="nm">${esc(rivN.boss ? '???' : rivN.name)}</b>
        <div class="fl">Piso <b>${nx}</b> de ${TORRE_MAX}</div>
        <div class="tw-prog"><i class="fill" style="width:${done / TORRE_MAX * 100}%"></i>${crowns}</div>
        ${minis ? `<div class="mini">${minis}</div>` : ''}
      </section>
      <section class="v-teamc"><div class="v-team">${mons}</div>
        ${run && done ? '<p class="v-lock">🔒 Equipo fijo durante la subida. Para cambiarlo, empieza una nueva.</p>' : '<div class="v-tr"><label class="tw-sel"><select id="twTeamSel" aria-label="Equipo"></select></label><button class="tw-btn" data-tw="team">Cambiar</button></div>'}</section>
    </aside>
    <aside class="tw-right v-R">
      <section class="v-win"><h4>Premio del piso ${nx}</h4>${tiles(torreReward(nx))}
        <p>${TW_ICO.boss} Campeón en el piso <b>${nextBoss}</b></p></section>
      <section class="v-road"><h4>Premios únicos</h4>${meds}</section>
      <section class="v-kings"><h4>Reyes de la Torre</h4><div id="twKings"></div></section>
    </aside>
    <div class="v-go">${!open ? '<p class="tw-warn">Se abre al ser Campeón de Kanto.</p>' : !ready ? '<p class="tw-warn">Elige 3 Pokémon en Equipo Pokémon.</p>' : ''}
      <button class="tw-go" data-tw="go" ${open && ready ? '' : 'disabled'}><span>${run && done ? 'Seguir' : '¡Subir!'}</span><small>Piso ${nx} · ${esc(rivN.boss ? 'Campeón' : rivN.name)}</small></button></div>
  </div>`;
  show('torrev');
  if($('twTeamSel')) fillTeamSel('twTeamSel', openTorre);
  el.querySelectorAll('canvas[data-d]').forEach(c => typeof hbPaint === 'function' ? hbPaint(c, +c.dataset.d, useShiny(+c.dataset.d)) : paintSprite(c, +c.dataset.d, {sc:4, fit:150, shiny: useShiny(+c.dataset.d)}));
  twRenderTower(); twFit(); twRenderKings();
  twKingsLoad().then(() => { if(!$('torrev').classList.contains('hide')){ twRenderTower(); twRenderKings(); twRenderHero(); } });
}
// Los 10 pisos del tramo que miras, dentro del cristal, con su rival, y la barra de tramos al lado
function twRenderHero(){                                                                 // si el siguiente piso lo ocupa un Rey, la tarjeta de la izquierda enseña al jugador
  const h = document.querySelector('.v-hero'); if(!h) return;
  const nx = twNext(), P = torrePlan()[nx - 1], K = P && P.boss ? twKing(nx) : null; if(!K) return;
  h.querySelector('.art').innerHTML = `<img class="kp" src="${K.av}" alt="">`;
  h.querySelector('.nm').textContent = K.nm; h.querySelector('.k').textContent = `Rey del piso ${nx}`;
  const go = document.querySelector('.tw-go small'); if(go) go.textContent = `Piso ${nx} · Rey ${K.nm}`;
}
// ---- GUÍA DE LA TORRE (ventana con las reglas) ----
function twGuide(on){
  const old = $('twGuide'); if(old) old.remove(); if(!on) return;
  const tile = (id, n) => `<span class="v-tile rw-${id}" title="${TW_RWL[id] || id}"><img src="${TW_RWI[id] ? TW_RWI[id]() : ''}" alt=""><b>${n >= 1000 ? (n / 1000).toFixed(n % 1000 ? 1 : 0).replace('.', ',') + 'k' : n}</b></span>`;
  const tiles = r => `<span class="v-tiles">${Object.entries(r).filter(([k]) => k !== 'f').map(([id, n]) => tile(id, n)).join('')}</span>`;
  const row = (t, r) => `<div class="gr"><em>${t}</em>${tiles(r)}</div>`;
  const hitos = TORRE_HITOS.map(h => row(`Primera vez que llegas al piso ${h.f}${h.f === TORRE_MAX ? ' (¡la cima!)' : ''}`, h)).join('');
  const d = document.createElement('div'); d.id = 'twGuide'; d.className = 'v-gd';
  d.innerHTML = `<div class="box"><button class="gx" data-tw="gx" aria-label="Cerrar">✕</button><h2>Guía de la Torre Batalla</h2>
    <section><h3>1 · Cómo se sube</h3><ul>
      <li>La Torre tiene <b>${TORRE_MAX} pisos</b> y en cada uno luchas contra un rival. Se abre al ser Campeón de Kanto.</li>
      <li>Los rivales son <b>personajes de Invocación</b> (entrenadores del anime, jefes de equipos malos…), no entrenadores genéricos. En cada subida salen otros distintos.</li>
      <li>Tu subida <b>se guarda</b>: puedes cerrar el juego y pulsar <b>SEGUIR</b> cuando quieras. Mientras dura, tu equipo queda fijo.</li>
      <li>Si <b>pierdes un combate</b>, la subida se acaba y la siguiente empieza con <b>todos los rivales nuevos</b>. También puedes empezar otra con «↻ Nueva subida».</li>
      <li>Tu <b>récord</b> es el piso más alto al que has llegado.</li></ul></section>
    <section><h3>2 · Campeones cada 10 pisos</h3><ul>
      <li>Los pisos <b>10, 20, 30, 40 y 50</b> son de Campeón: más difíciles y con premios mucho mejores.</li>
      <li>Si el piso lo ocupa un jugador (un Rey), luchas contra su equipo. Si no, contra un Campeón del juego.</li></ul></section>
    <section><h3>3 · Los tronos (Reyes de la Torre)</h3><ul>
      <li>Cada piso de Campeón tiene <b>un trono</b>. El primer jugador que llega a ese piso <b>se queda el trono</b> con su personaje y los <b>3 Pokémon con los que subió</b>.</li>
      <li>Los demás jugadores tienen que vencerle para pasar de ese piso.</li>
      <li>Si alguien le gana, <b>el trono cambia cuando empieza la hora siguiente</b> y pasa al último que le venció. Así el Rey puede cambiar cada hora.</li>
      <li>Necesitas <b>iniciar sesión</b> para reclamar un trono. Verás quién manda en cada piso en el panel «Reyes de la Torre».</li></ul></section>
    <section><h3>4 · Premios</h3>
      ${row('En cada piso (el 1 da menos, los altos más)', torreReward(1))}${row('Cada 3 pisos se suman tiradas', torreReward(3))}${row('Piso de Campeón (ejemplo: el 10)', torreReward(10))}
      <p class="gn">Y además, premios únicos (solo la primera vez):</p>${hitos}</section></div>`;
  d.addEventListener('click', e => { if(e.target === d) twGuide(false); });
  $('twRoot').appendChild(d);
}
function twRenderKings(){
  const b = $('twKings'); if(!b) return;
  if(!cloud.ok || !cloud.user){ b.innerHTML = '<p class="kn">Inicia sesión: el primero en llegar a un piso de Campeón se queda el trono con su equipo.</p>'; return; }
  const left = 60 - new Date().getMinutes();
  b.innerHTML = TW_KFL.map(f => { const k = TW_K.list[f];
    return `<div class="kr${k ? '' : ' none'}${twIsMe(k) ? ' me' : ''}"><b>${f}</b>${k ? `<img src="${k.av}" alt=""><span class="n">${twIsMe(k) ? 'Tú' : cloudEsc(k.nm)}</span><span class="t">${k.mons.map(m => `<i title="${esc(mon(m[0]).name)}"><canvas width="40" height="40" data-d="${m[0]}" data-s="${m[1]}"></canvas></i>`).join('')}</span>` : `<span class="n">Campeón de siempre</span><span class="t free">Libre</span>`}</div>`; }).join('') + `<p class="kn">El trono puede cambiar en ${left} min.</p>`;
  b.querySelectorAll('canvas[data-d]').forEach(c => paintSprite(c, +c.dataset.d, {sc:2, fit:38, shiny:!!+c.dataset.s}));
}
function twRenderTower(){
  const tw = save.tower, pg = twCurPage(), lo = pg * 10 + 1, nx = twNext(), P = torrePlan(), hitos = Object.fromEntries(TORRE_HITOS.map(h => [h.f, h])), out = [];
  for(let f = lo + 9; f >= lo; f--){
    const p = P[f - 1], boss = !!p.boss, h = hitos[f], done = !!save.tower.run && f < nx, isNx = f === nx, show = done || isNx, rec = f === tw.best;
    const K = boss ? twKing(f) : null;
    const pic = boss ? (show ? (K ? `<img class="pic kp" src="${K.av}" alt="">` : `<img class="pic" data-lid="${p.id}" alt="">`) : `<span class="who">${TW_ICO.who}</span>`) : `<img class="pic${show ? '' : ' sil'}" src="${p.path}" alt="" loading="lazy">`;
    out.push(`<div class="tw-fl${boss ? ' boss' : ''}${done ? ' done' : ''}${isNx ? ' next' : ''}${f === TORRE_MAX ? ' top' : ''}">
      <span class="no">${f}</span>${boss ? `<span class="crown">${TW_ICO.boss}</span>` : ''}
      <span class="nm">${show ? esc(K ? K.nm : p.name) : boss ? (K ? 'Rey' : 'Campeón') : '???'}</span>
      ${h ? `<span class="gf${tw.ms[f] ? ' got' : ''}">${TW_ICO.gift}</span>` : ''}${done ? '<span class="ok">✓</span>' : ''}${pic}
      ${isNx ? `<span class="tag nx">${save.tower.run && save.tower.run.f ? 'Siguiente' : 'Primer rival'}</span>` : rec ? '<span class="tag rec">Récord</span>' : ''}</div>`);
  }
  $('twGlass').innerHTML = `<div class="tw-zn"><span>Pisos ${lo} - ${lo + 9}</span></div><div class="tw-fls">${out.join('')}</div>`;
  $('twGlass').querySelectorAll('img[data-lid]').forEach(im => twLoadLeader(im, im.dataset.lid));
  const pages = Array.from({length: TORRE_MAX / 10}, (_, i) => i).reverse();
  $('twNav').innerHTML = `<button class="tw-arr" data-tw="up" ${pg >= TORRE_MAX / 10 - 1 ? 'disabled' : ''} aria-label="Pisos de arriba">${TW_ICO.up}</button>
    <div class="tw-zbar">${pages.map(i => { const a = i * 10 + 1, full = tw.best >= a + 9, part = tw.best >= a;
      return `<button data-tw="pg" data-z="${i}" class="${i === pg ? 'on' : ''}${full ? ' full' : part ? ' part' : ''}" title="Pisos ${a}-${a + 9}"><i>${TW_ICO.boss}</i><small>${a}-${a + 9}</small></button>`; }).join('')}</div>
    <button class="tw-arr" data-tw="dn" ${pg <= 0 ? 'disabled' : ''} aria-label="Pisos de abajo">${TW_ICO.dn}</button>`;
}
// Coloca el fondo (cubre la pantalla; si sobra alto, se recorta el CIELO y no la entrada) y pone los pisos encima del cristal
function twFit(){
  const root = $('twRoot'); if(!root || !root.offsetWidth) return;
  const W = root.offsetWidth, H = root.offsetHeight, B = TW_BG, s = Math.max(W / B.w, H / B.h), iw = B.w * s, ih = B.h * s, ox = (W - iw) / 2, oy = H - ih;   // pegado abajo
  root.style.setProperty('--bgs', `${Math.ceil(iw)}px ${Math.ceil(ih)}px`); root.style.setProperty('--bgp', `${Math.round(ox)}px ${Math.round(oy)}px`);
  const G = B.glass, gx = ox + G.x * iw, gy = Math.max(oy + G.y * ih, root.querySelector('.tw-banner').getBoundingClientRect().bottom - root.getBoundingClientRect().top + 6), gw = G.w * iw, gh = oy + (G.y + G.h) * ih - gy;
  Object.assign($('twGlass').style, {left: gx + 'px', top: gy + 'px', width: gw + 'px', height: gh + 'px'});
  const nav = $('twNav'); nav.style.left = (gx + gw + Math.max(8, gw * .08)) + 'px'; nav.style.top = gy + 'px'; nav.style.height = gh + 'px';
}
