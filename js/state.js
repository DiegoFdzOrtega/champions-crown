"use strict";
/* =====================================================================
   3) ESTADO: lienzo, equipo, partida guardada y creación de combates
   ===================================================================== */
const cv = document.getElementById('c'), ctx = cv.getContext('2d');

// El lienzo usa la resolución real de la pantalla. El juego se dibuja en un mundo de alto 540
// y ancho variable, así que llena toda la ventana sin deformarse.
function resize(){
  const dpr = window.devicePixelRatio || 1, cw = window.innerWidth, ch = window.innerHeight;
  W = Math.max(500, Math.round(cw * H / ch));
  cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
}

let team = [3, 6, 9];                            // equipo inicial: Venusaur, Charizard y Blastoise (los únicos que tienes al empezar una partida nueva)
// record = líderes vencidos · tickets = normales · ticketsL = legendarios · box = Pokémon que tienes
// items = objetos en la mochila · equip = objeto equipado a cada Pokémon {nº: id}
// box = Pokémon que tienes (en orden de llegada) · shiny/fav = nº de Pokédex · nat = naturaleza de cada uno
// pity = tiradas sin legendaria por región · used = veces que lo has llevado a un combate
const save = {record:0, bp:0, tickets:0, ticketsL:0, name:'ENTRENADOR', vol:100, region:'Kanto', gachaRegion:'Kanto',
              items:{}, equip:{}, teams:[], tsel:0, box:[3,6,9], shiny:[], fav:[], nat:{}, pity:{}, used:{},
              profileFav:[], profileSh:[], ach:{}, shinyOff:[], avatar:'', welcome:0, login:{streak:0, last:''}, firstWin:'',
              iv:{}, ev:{}, abil:{}, mv:{}, mvHist:{}, mtV:2, mtBought:{day:0, n:{}}, ivBase:{}, evCap:{}, capUsed:{}, trainV:2, champ:{}, prog:{}, mute:false, campoWins:{}, stats:{}, volMusic:70, volSfx:80};   // champ = Ligas superadas {Región:1} (trofeos y Torre Batalla)   // iv/ev/abil/mv/mtBought: entrenamiento (ver training.js)   // avatar = archivo de avatares/ que usas ('' = el clásico)   // profileFav = 3 favoritos del perfil · ach = logros
try{
  const s = JSON.parse(localStorage.getItem('arena2d_v2') || 'null');
  if(s){
    if(Array.isArray(s.box) && s.box.every(id => mon(id))) save.box = s.box;
    if(Array.isArray(s.team) && s.team.length === 3 && s.team.every(id => save.box.includes(id) && !hidden(id))) team = s.team;
    save.ticketsL = s.ticketsL || 0; save.region = s.region || 'Kanto'; save.items = s.items || {};
    save.equip = s.equip || {}; save.shiny = s.shiny || []; save.fav = s.fav || []; save.nat = s.nat || {};
    save.pity = s.pity || {}; save.used = s.used || {}; save.gachaRegion = s.gachaRegion || 'Kanto';
    save.record = s.record || 0; save.bp = s.bp || 0; save.tickets = s.tickets || 0;
    save.name = s.name || save.name; save.mute = !!s.mute;
    // Volúmenes: vol = GLOBAL (0-100), volMusic = música, volSfx = efectos. Las partidas antiguas guardaban solo 'vol' (el de la música): pasa a volMusic y el global queda al 100.
    if(s.volMusic === undefined){ save.volMusic = s.vol ?? save.volMusic; save.vol = 100; } else { save.vol = s.vol ?? 100; save.volMusic = s.volMusic; }
    save.volSfx = s.volSfx ?? save.volSfx;
    save.shinyOff = Array.isArray(s.shinyOff) ? s.shinyOff : [];                    // shinys que tienes pero eliges NO usar (por defecto se usan)
    save.avatar = typeof s.avatar === 'string' ? s.avatar : '';
    const obj = v => (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
    save.iv = obj(s.iv); save.ev = obj(s.ev); save.ivBase = obj(s.ivBase); save.evCap = obj(s.evCap); save.capUsed = obj(s.capUsed); save.abil = obj(s.abil); save.mv = obj(s.mv); save.mvHist = obj(s.mvHist); save.mtV = s.mtV || 1;
    if((s.trainV || 1) < 2){                                                        // v2: todos los Pokémon vuelven a IV 0 y EV 0 y se devuelven las chapas gastadas
      Object.values(save.capUsed).forEach(c => { save.items.chapa = (save.items.chapa || 0) + (c.gold || 0); save.items.chapaplata = (save.items.chapaplata || 0) + (c.silver || 0); });
      save.iv = {}; save.ivBase = {}; save.ev = {}; save.evCap = {}; save.capUsed = {};
    }
    save.champ = obj(s.champ); save.prog = obj(s.prog); save.campoWins = obj(s.campoWins); save.stats = obj(s.stats); if(save.record >= floorsOf('Kanto').length) save.champ.Kanto = 1;   // prog = combates superados en las demás regiones (Johto...)
         // quien ya venció a Azul tiene el trofeo de Kanto
    save.mtBought = (s.mtBought && typeof s.mtBought === 'object' && s.mtBought.n) ? s.mtBought : {day:0, n:{}};
    save.profileFav = Array.isArray(s.profileFav) ? s.profileFav : []; save.profileSh = Array.isArray(s.profileSh) ? s.profileSh : []; save.ach = (s.ach && typeof s.ach === 'object') ? s.ach : {};   save.welcome = s.welcome === undefined ? 1 : s.welcome; save.login = (s.login && typeof s.login === 'object') ? {streak:+s.login.streak || 0, last:String(s.login.last || '')} : {streak:0, last:''}; save.firstWin = String(s.firstWin || '');   // profileSh = 1 en cada favorito que enseñas en su versión shiny
  }
}catch(e){}
// ¿Se usa la versión shiny de este Pokémon? Solo si lo tienes shiny y no lo has puesto en "normal" desde Equipo Pokémon
const useShiny = d => save.shiny.includes(d) && !save.shinyOff.includes(d);
// ---- EQUIPOS (hasta 5): cada uno con sus Pokémon y SUS objetos. Siempre hay uno activo: 'team' (sus Pokémon) y 'save.equip' (sus objetos) apuntan a él,
//      así todo lo que ya usaba team/save.equip (combate, tienda, mochila, objetos libres) sigue funcionando sin cambios. ----
const TEAM_MAX = 5;
(function initTeams(){
  let s = null; try{ s = JSON.parse(localStorage.getItem('arena2d_v2') || 'null'); }catch(e){}
  const okMons = a => Array.isArray(a) && a.length <= 3 && new Set(a).size === a.length && a.every(id => save.box.includes(id) && !hidden(id));
  const obj = v => (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
  const T = [];
  if(s && Array.isArray(s.teams)) s.teams.slice(0, TEAM_MAX).forEach((t, i) => T.push({n:String((t && t.n) || '').slice(0, 14) || 'Equipo ' + (i + 1), mons:t && okMons(t.mons) ? t.mons.slice() : [], equip:obj(t && t.equip)}));
  else T.push({n:'Equipo 1', mons:team.slice(), equip:save.equip});                      // partidas antiguas: tu equipo de siempre pasa a ser el Equipo 1
  while(T.length < TEAM_MAX) T.push({n:'Equipo ' + (T.length + 1), mons:[], equip:{}});            // los equipos nuevos empiezan vacíos: los rellenas tú en Equipo Pokémon
  if(!T[0].mons.length) T[0].mons = team.slice();                                                 // el Equipo 1 nunca queda vacío (si no hay nada guardado, el equipo inicial)
  save.teams = T; save.tsel = s && s.tsel >= 0 && s.tsel < TEAM_MAX ? s.tsel : 0;
  team = T[save.tsel].mons; save.equip = T[save.tsel].equip;
})();
function teamSync(){ const T = save.teams[save.tsel]; if(T){ T.mons = team; T.equip = save.equip; } }       // guarda en el equipo activo lo que haya en team / save.equip
function selectTeam(i){                                                                              // cambia de equipo activo
  if(i === save.tsel || !(i >= 0 && i < TEAM_MAX)) return;
  teamSync(); const T = save.teams[i];
  save.tsel = i; team = T.mons; save.equip = T.equip; persist();
}
function persist(){ try{ teamSync(); localStorage.setItem('arena2d_v2', JSON.stringify({team, ...save})); }catch(e){} }

let g = null;                                    // combate en curso
const keys = {}, mouse = {x:W/2, y:H/2, l:false, r:false};
const clamp = (v,a,b)=> Math.max(a, Math.min(b, v));
const rnd = a => a[Math.floor(Math.random()*a.length)];

function mk(m, hm, dm, item, shiny){
  return {m, item, shiny, hp:m.hp*hm, max:m.hp*hm, en:100, dmg:dm*m.atk/100, x:0, y:0, cd:[0,0,0,0,0], dir:0,
          act:'Idle', at:0, lock:0, dead:false, dt:0, buff:0, dash:0, da:0, mv:false};
}

// Un rival puede ser un nº de Pokédex (movimientos automáticos) o {dex, mv:[...]} con sus 4 movimientos fijos.
// El tipo de cada ataque sale del propio movimiento (MOVES), así un Pokémon puede cubrir varios tipos.
function enemyMon(e){
  if(typeof e === 'number') return mon(e);
  const m = Object.assign({}, mon(e.dex), {mv: e.mv.slice(), nat: e.nat, ab: e.ab});          // nat/ab: naturaleza y habilidad de la plantilla (teams.js)
  m.mt = [1,2,4].map(i => (MOVES[e.mv[i-1]] || {}).t || m.types[0]);
  return m;
}

function startBattle(o, again){
  if(!team.length){ toast('Tu equipo está vacío: añade Pokémon en Equipo Pokémon.'); return; }                // por seguridad (los botones de combate ya se desactivan si no hay 3)                                                              // again = true al reiniciar el combate (no vuelve a contar el uso de tus Pokémon)
  if(!again){ team.forEach(id => save.used[id] = (save.used[id] || 0) + 1); persist(); }                 // para ordenar por "más usados"
  const p = team.map(id => { const b = combatBoost(id), f = mk(playerMon(id), b.hm, b.dm, save.equip[id], useShiny(id)); f.spdm = b.spdm; f.defm = b.defm; return f; }),   // IVs, EVs, naturaleza y ataques de MT
         e = o.enemies.map(s => { const b = enemyBoost(s), f = mk(enemyMon(s), o.hm * b.hm, o.dm * b.dm, s.item); f.spdm = (o.spdm || 1) * b.spdm; f.defm = b.defm; return f; });   // plantilla del rival: objeto + IVs/EVs/naturaleza (teams.js)
  p.forEach(f=>{ f.x = W*.25; f.y = H/2 + 10; f.dir = 2; });
  e.forEach(f=>{ f.x = W*.75; f.y = H/2 + 10; f.dir = 6; f.lvl = o.lvl; });
  g = {o, p, e, pi:0, ei:0, shots:[], pops:[], t:0, clock:0, count:3, over:false, sw:[], swCd:0, swNote:0};     // sw = cambios de Pokémon en curso (js/swap.js) · swCd = segundos que faltan para poder volver a cambiar · swNote = tiempo que se ve el aviso "ESPERA"
  [...p, ...e].forEach(f => preloadSheets(f.m.dex, f.shiny));                                  // precarga de todas las animaciones (evita el círculo con la inicial al atacar)
  Music.battle(o);                                                                           // música del combate (music.js): fundido desde la del menú
  fxClear();                                                                                 // sin efectos de combates anteriores
  show('none');
}
