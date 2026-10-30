"use strict";
/* =====================================================================
   19) COMBATE ONLINE (jugador contra jugador, en tiempo real)
   Cómo funciona (en sencillo):
   - Los DOS navegadores ejecutan el MISMO combate a la vez (el mismo código de combat.js). Lo único que viajan por internet son las pulsaciones
     de cada jugador (teclas, posición del ratón, cambio de Pokémon, megaevolución). Como las dos partidas reciben lo mismo, se ven igual,
     con todos los efectos, sin enviar la pantalla.
   - Para que sean IDÉNTICAS: el combate avanza en pasos fijos de 1/60 s (PVP_DT), el azar sale de un generador con una semilla común
     (Math.random se cambia SOLO mientras se calcula un paso) y cada pulsación se aplica con un pequeño retraso (PVP_DELAY pasos, unos 0,08 s, que se ajusta solo),
     el justo para que le dé tiempo a llegar al otro jugador. Si la pulsación del rival aún no ha llegado, el combate espera un instante.
   - Cada segundo los dos comparan una «huella» del combate (posiciones, vida, energía). Si no coincide dos veces seguidas, se cancela el combate.
   - Quien lanzó el desafío es el bando 'p' (sale a la izquierda) y el invitado el bando 'e' (sale a la derecha). Cada uno ve su HUD a su lado:
     las funciones myList / myIdx / myMon (combat.js) dicen qué bando eres tú.
   - Los dos equipos salen de lo que cada jugador ENVÍA al empezar (pvpTeamDesc): su Pokémon con sus ataques, vida, daño, velocidad, defensa,
     objeto, habilidad y mega. Nadie usa los datos guardados del otro. No hay recompensas, ni EVs, ni nada que toque la partida guardada.
   - Canal de Supabase Realtime: «match:<id>» (el id sale del desafío). Mensajes: hs (saludo y equipo), inp (pulsaciones), chk (huella), bye (abandono).
   Cuando cambies CUALQUIER cosa del cálculo del combate (combat.js, abilities.js, status.js, qmoves.js, swap.js, mega.js...), sube PVP_VER:
   así dos jugadores con versiones distintas del juego no pueden jugar entre ellos (se descuadrarían).
   ===================================================================== */
const PVP_VER = '1';
const PVP_DT = 1 / 60;                                  // segundos de cada paso del combate
const PVP_DELAY = 5, PVP_DMAX = 18;                     // retraso de las pulsaciones, en pasos (5 pasos ≈ 0,08 s): lo que tardas en ver moverse o atacar a TU Pokémon.
// Por qué no puede ser más corto sin más: cada paso necesita la pulsación del rival, que sale de su paso anterior. Con una ida y vuelta de T segundos,
// el combate solo avanza (D tuyo + D del rival) pasos cada T. Si la conexión es lenta, el combate iría a cámara lenta; por eso, si en 1 s se calculan
// menos de 54 de los 60 pasos, cada jugador sube SU retraso un paso (hasta PVP_DMAX) y lo baja otra vez tras 40 s yendo bien (pvpFrame).
const PVP_BATCH = 2;                                    // cuántos pasos se mandan juntos en cada mensaje (30 mensajes por segundo por jugador)
const PVP_TIMEOUT = 12000;                              // ms esperando al rival antes de darlo por desconectado
const PVP_ARENAS = ['coliseo'];                          // el estadio del combate online (js/arenaspvp.js). Si algún día hay más, el id del combate elige una (igual en los dos lados)
const PVP_EMPTY = {dx: 0, dy: 0, mx: 0, my: 0, l: 0, r: 0, sp: 0, q: 0, e: 0, sw: -1, mg: 0};
let pvp = null;                                         // estado del combate online en curso (o null)

// ---------------------------------------------------------------------
// Utilidades: generador de azar con semilla, huella, mensajes
// ---------------------------------------------------------------------
function pvpRng(seed){ let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function pvpHash(str){ let h = 2166136261; for(let i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function pvpSeeded(fn){ const R = Math.random; Math.random = pvp.rng; try{ return fn(); } finally{ Math.random = R; } }
const PVP_FAST = {inp: 1, chk: 1, bye: 1};                // mensajes que también van por la conexión directa (WebRTC), si está abierta
function pvpSend(ev, payload){                            // siempre por el canal de Supabase; además, por la conexión directa si ya existe (gana el que llegue antes; lo repetido se ignora)
  const P = pvp; if(!P) return;
  if(P.ch){ try{ P.ch.send({type: 'broadcast', event: ev, payload}); }catch(e){} }
  if(P.dcOk && PVP_FAST[ev]){ try{ P.dc.send(JSON.stringify({e: ev, p: payload})); }catch(e){} }
}
const pvpOk = n => typeof n === 'number' && isFinite(n);
const pvpName = () => pvp && pvp.opp ? pvp.opp.name : (pvp ? pvp.match.opp.name : '');

// ---------------------------------------------------------------------
// Tu equipo, tal como lo mandas al rival (todo lo que cambia el combate; así los dos calculan exactamente lo mismo)
// ---------------------------------------------------------------------
function pvpTeamDesc(){
  if(!team || team.length !== 3) return null;
  return team.map(id => {
    const b = combatBoost(id), item = save.equip[id] || null, mkey = item && ITEMS[item] && ITEMS[item].mega, M = mkey && MEGA[mkey], m = playerMon(id);
    return {m: JSON.parse(JSON.stringify(m)), hm: b.hm, dm: b.dm, spdm: b.spdm, defm: b.defm, item, shiny: !!useShiny(id), ab: abilityOf(id) || '',
            mega: (M && M.dex === m.dex && hasMegaRing()) ? mkey : null};
  });
}
function pvpDescOk(a){                                   // comprobación básica de lo que manda el rival (un mensaje roto o falso no debe romper el juego)
  if(!Array.isArray(a) || a.length !== 3) return false;
  return a.every(d => d && d.m && pvpOk(d.m.hp) && pvpOk(d.m.atk) && pvpOk(d.m.spd) && Array.isArray(d.m.types) && d.m.types.length >= 1 && d.m.types.every(t => TC[t])
    && typeof d.m.name === 'string' && [d.hm, d.dm, d.spdm, d.defm].every(v => pvpOk(v) && v > .2 && v < 5) && (d.item === null || (typeof d.item === 'string' && ITEMS[d.item])));
}
function pvpFighter(d){
  const f = mk(d.m, d.hm, d.dm, d.item || undefined, !!d.shiny);
  f.spdm = d.spdm; f.defm = d.defm; f.ab = String(d.ab || ''); f.megaKey = null; f.megaDone = false; f.megaT = 0;
  if(d.mega && MEGA[d.mega] && MEGA[d.mega].dex === d.m.dex){ f.megaKey = d.mega; preloadSheets(MEGA[d.mega].folder, f.shiny); }
  preloadSheets(d.m.dex, f.shiny);
  return f;
}

// ---------------------------------------------------------------------
// Aviso en pantalla mientras se conecta (antes de que exista el combate)
// ---------------------------------------------------------------------
function pvpOverlay(html, btn, fn){
  let o = document.getElementById('pvpOv');
  if(!html){ if(o) o.remove(); return; }
  if(!o){ o = document.createElement('div'); o.id = 'pvpOv'; o.className = 'dlOv'; document.body.appendChild(o); }
  o.innerHTML = `<div class="dlBox chalBox">${html}<div class="cbtns" style="justify-content:center">${btn ? `<button id="pvpBtn" class="main">${btn}</button>` : ''}</div></div>`;
  const b = document.getElementById('pvpBtn'); if(b) b.onclick = fn;
}

// ---------------------------------------------------------------------
// Empezar: lo llama cloud.js cuando un desafío se acepta (cloudMatchStart → cloudOnMatch)
// ---------------------------------------------------------------------
function cloudOnMatch(match){ pvpStart(match); }
function pvpStart(match){
  if(pvp) pvpLeave();
  const mine = pvpTeamDesc();
  if(!cloud.ok || !cloud.sb || !mine){ cloud.match = null; if(typeof toast === 'function') toast(mine ? 'Sin conexión en línea.' : 'Para jugar online necesitas un equipo de 3 Pokémon.'); if(typeof cloudChalUi === 'function') cloudChalUi(); return; }
  const me = match.host ? 'p' : 'e';
  pvp = {match, me, mine, opp: null, built: false, rdy: false, oppRdy: false, running: false, finished: false, tick: 0, acc: 0, wait: 0, lin: {}, rin: {}, out: [], outT: 0,
         chkL: {}, chkR: {}, bad: 0, evSw: -1, evMg: 0, D: PVP_DELAY, nextStamp: PVP_DELAY, winT: 0, winN: 0, calm: 0, menu: false, gotInp: false, rng: pvpRng(pvpHash('cc:' + match.id)), desync: false};
  const ch = cloud.sb.channel('match:' + match.id, {config: {broadcast: {self: false}}});
  ch.on('broadcast', {event: 'hs'}, m => pvpOnHs(m.payload))
    .on('broadcast', {event: 'inp'}, m => pvpOnInp(m.payload))
    .on('broadcast', {event: 'chk'}, m => pvpOnChk(m.payload))
    .on('broadcast', {event: 'bye'}, m => pvpOnBye(m.payload))
    .on('broadcast', {event: 'rtc'}, m => pvpOnRtc(m.payload))
    .subscribe(st => { if(st === 'SUBSCRIBED' && pvp && pvp.ch === ch){ pvp.subscribed = true; pvpHs(); } });
  pvp.ch = ch;
  pvp.hsT = setInterval(pvpHs, 500);
  pvp.limit = setTimeout(() => { if(pvp && !pvp.running) pvpFail('No se ha podido conectar con ' + pvpName() + '.'); }, 30000);
  pvpOverlay(`<h2>Conectando...</h2><p>Preparando el combate contra <b>${cloudEsc(match.opp.name)}</b>.</p>`, 'Cancelar', () => { pvpSend('bye', {from: cloud.user.id, why: 'cancel'}); pvpFail(''); });
}
function pvpFail(msg){ pvpLeave(); if(msg && typeof toast === 'function') toast(msg); }
function pvpLeave(){                                     // cierra el canal y deja todo como estaba (no toca el combate en pantalla: eso lo hace quien llama)
  const P = pvp; if(!P) return;
  clearInterval(P.hsT); clearTimeout(P.limit);
  if(P.ch){ try{ cloud.sb.removeChannel(P.ch); }catch(e){} }
  try{ if(P.dc) P.dc.close(); if(P.pc) P.pc.close(); }catch(e){}
  pvp = null; cloud.match = null; pvpOverlay('');
  if(g && g.pvp && !g.over){ g = null; goMain(); }
  if(typeof cloudChalUi === 'function') cloudChalUi();
}

// ---------------------------------------------------------------------
// Saludo: cada uno manda su equipo (cada 0,5 s) hasta saber que el otro ya está jugando
// ---------------------------------------------------------------------
function pvpHs(){
  const P = pvp; if(!P || !P.subscribed) return;
  if(P.built && !P.rdy && (pvpSheetsReady() || Date.now() - P.builtAt > 15000)) P.rdy = true;      // sprites cargados (necesarios: el tamaño de cada Pokémon cuenta en los golpes)
  pvpSend('hs', {from: cloud.user.id, ver: PVP_VER, name: cloud.name, team: P.mine, rdy: P.rdy});
  pvpTryRun();
}
function pvpOnHs(p){
  const P = pvp; if(!P || !p || p.from !== P.match.opp.uid) return;
  if(p.ver !== PVP_VER){ pvpSend('bye', {from: cloud.user.id, why: 'ver'}); pvpFail('Tú y ' + P.match.opp.name + ' tenéis versiones distintas del juego. Recargad la página (Ctrl+F5).'); return; }
  if(!P.opp){
    if(!pvpDescOk(p.team)){ pvpSend('bye', {from: cloud.user.id, why: 'team'}); pvpFail('El equipo de ' + P.match.opp.name + ' no es válido.'); return; }
    P.opp = {name: String(p.name || P.match.opp.name).slice(0, 24), team: p.team}; pvpBuild();
    if(P.me === 'p') pvpRtcInit();                                                                   // el anfitrión empieza a preparar la conexión directa
    pvpOverlay('');
    pvpHs();                                                                                          // contesta enseguida con tu equipo
  }
  if(p.rdy) P.oppRdy = true;
  pvpTryRun();
}
function pvpBuild(){                                     // crea el combate (aún parado): los dos equipos salen de lo que mandó cada uno
  const P = pvp, hostT = P.me === 'p' ? P.mine : P.opp.team, guestT = P.me === 'p' ? P.opp.team : P.mine;
  const p = hostT.map(pvpFighter), e = guestT.map(pvpFighter);
  p.forEach(f => { f.x = W * .25; f.y = H / 2 + 10; f.dir = 2; }); e.forEach(f => { f.x = W * .75; f.y = H / 2 + 10; f.dir = 6; });
  const hn = P.me === 'p' ? cloud.name : P.opp.name, gn = P.me === 'p' ? P.opp.name : cloud.name, ar = PVP_ARENAS[pvpHash('ar:' + P.match.id) % PVP_ARENAS.length];
  const o = {pvp: true, sub: (hn + ' VS ' + gn).toUpperCase().slice(0, 40), arena: ar, floor: 0, hm: 1, dm: 1, skill: 1, spdm: 1};
  g = {o, p, e, pi: 0, ei: 0, shots: [], pops: [], t: 0, clock: 0, count: 3, over: false, sw: [], swCd: 0, swCdE: 0, swNote: 0, pvp: true, me: P.me, inp: {p: PVP_EMPTY, e: PVP_EMPTY}};
  for(const k in keys) keys[k] = false; mouse.l = mouse.r = false;
  fxClear(); Music.battle({leader: 'azul'});
  pvpSeeded(() => { abEnter(g.p[0]); abEnter(g.e[0]); });
  show('none');
  P.built = true; P.builtAt = Date.now();
}
function pvpSheetsReady(){
  const done = d => { const im = sheet(d, 'Idle', false); return im.ok || im.bad; };
  return [...g.p, ...g.e].every(f => done(f.m.dex) && (!f.megaKey || done(MEGA[f.megaKey].folder)));
}
function pvpTryRun(){
  const P = pvp; if(!P || P.running || !P.rdy || !P.oppRdy) return;
  P.running = true; P.acc = 0; P.wait = 0;
  for(let k = 0; k < P.D; k++){ P.lin[k] = PVP_EMPTY; if(P.rin[k] === undefined) P.rin[k] = PVP_EMPTY; }
}

// ---------------------------------------------------------------------
// Pulsaciones: se leen, se mandan con retraso y se aplican a la vez en los dos lados
// ---------------------------------------------------------------------
function pvpEvent(kind, i){                              // cambio de Pokémon (teclas 1·2·3, clic) o megaevolución (R): se manda con la siguiente pulsación
  const P = pvp; if(!P || !P.running || !g || g.over || P.menu) return;
  if(kind === 'sw') P.evSw = i; else P.evMg = 1;
}
function pvpSample(){
  const P = pvp, z = P.menu, h = id => !z && ctlHeld(id) ? 1 : 0;           // teclas configurables de cada jugador (js/controls.js): al rival solo le llega el resultado (dx, dy, l, r...), no tus teclas
  const i = {dx: h('right') - h('left'), dy: h('down') - h('up'),
    mx: Math.round(mouse.x), my: Math.round(mouse.y), l: h('melee'), r: h('shot'), sp: h('dash'), q: h('buff'), e: h('strong'), sw: P.evSw, mg: P.evMg};
  P.evSw = -1; P.evMg = 0; return i;
}
const pvpEnc = i => [i.dx, i.dy, i.mx, i.my, i.l | (i.r << 1) | (i.sp << 2) | (i.q << 3) | (i.e << 4), i.sw, i.mg];
function pvpDec(a){
  if(!Array.isArray(a) || a.length < 7 || !a.every(pvpOk)) return PVP_EMPTY;
  const b = a[4] | 0;
  return {dx: Math.max(-1, Math.min(1, a[0] | 0)), dy: Math.max(-1, Math.min(1, a[1] | 0)), mx: Math.max(-200, Math.min(W + 200, a[2])), my: Math.max(-200, Math.min(H + 200, a[3])),
    l: b & 1, r: (b >> 1) & 1, sp: (b >> 2) & 1, q: (b >> 3) & 1, e: (b >> 4) & 1, sw: Math.max(-1, Math.min(2, a[5] | 0)), mg: a[6] ? 1 : 0};
}
function pvpFlush(){ const P = pvp; if(!P || !P.out.length) return; pvpSend('inp', {t0: P.outT, a: P.out}); P.out = []; }
function pvpOnInp(p){
  const P = pvp; if(!P || !p || !Array.isArray(p.a) || !pvpOk(p.t0) || p.a.length > 40) return;
  p.a.forEach((a, k) => { const t = p.t0 + k; if(t >= P.tick && P.rin[t] === undefined) P.rin[t] = pvpDec(a); });
  if(!P.gotInp){ P.gotInp = true; clearInterval(P.hsT); }                                             // el rival ya juega: se acabó el saludo
}

// ---------------------------------------------------------------------
// Bucle: pasos fijos. Lo llama loop() (render.js) en cada fotograma en lugar de update(dt)
// ---------------------------------------------------------------------
function pvpFrame(dt){
  const P = pvp; if(!P || !P.running || g.over) return;
  P.acc = Math.min(P.acc + dt, .25);
  let stepped = false;
  while(P.acc >= PVP_DT && !g.over){
    if(P.rin[P.tick] === undefined) break;                                                            // aún no ha llegado la pulsación del rival: espera
    pvpStep(); P.acc -= PVP_DT; stepped = true; P.winN++;
  }
  const now = performance.now();                                                                      // velocidad real del combate (pasos por segundo) → ajusta el retraso
  if(!P.winT || now - P.winT > 2500){ P.winT = now; P.winN = 0; }                                    // (pestaña en segundo plano o primer fotograma: no se mide)
  else if(now - P.winT >= 1000){
    const rate = P.winN * 1000 / (now - P.winT); P.winT = now; P.winN = 0;
    if(rate < 54 && P.D < PVP_DMAX){ P.D++; P.calm = 0; }
    else if(rate >= 59){ if(++P.calm >= 40 && P.D > PVP_DELAY){ P.D--; P.calm = 0; } }
    else P.calm = 0;
  }
  if(stepped) P.wait = 0;
  else if(P.acc >= PVP_DT){
    P.wait += dt; pvpFlush();                                                                         // esperando al rival (la conexión tarda más que el retraso): el combate sigue en cuanto llegue
    if(P.wait * 1000 > PVP_TIMEOUT) pvpDisconnect();
  }
}
function pvpStep(){
  const P = pvp, t = P.tick;
  const mine = pvpSample();                                                                           // lo que pulso ahora se aplicará en el paso t + D (en los dos lados)
  const ns = P.nextStamp;
  for(let k = ns; k <= t + P.D; k++){                                                        // si D ha subido, los pasos que faltan repiten la pulsación (sin cambios ni megas repetidos); si ha bajado, no se sella ninguno hasta alcanzar
    const m = k === P.nextStamp ? mine : Object.assign({}, mine, {sw: -1, mg: 0});
    P.lin[k] = m; if(!P.out.length) P.outT = k; P.out.push(pvpEnc(m)); P.nextStamp = k + 1; if(P.out.length >= PVP_BATCH) pvpFlush();
  }
  if(ns > t + P.D && (mine.sw >= 0 || mine.mg)){ P.evSw = mine.sw >= 0 ? mine.sw : P.evSw; P.evMg = mine.mg ? 1 : P.evMg; }   // (D bajó: esta pulsación no se pudo sellar; sus eventos se guardan para el siguiente paso)
  const a = P.lin[t], b = P.rin[t];
  g.inp = P.me === 'p' ? {p: a, e: b} : {p: b, e: a};
  pvpSeeded(() => update(PVP_DT));
  delete P.lin[t]; delete P.rin[t]; P.tick++;
  if(P.tick % 60 === 0) pvpCheck();
}
// Lo que hace update() (combat.js) con las pulsaciones de cada bando en lugar de teclado/IA
function pvpControl(f, side, dt){
  const i = g.inp[side]; if(!i) return;
  const mine = side === 'p';
  if(i.sw >= 0) pvpSwitch(side, i.sw);
  if(i.mg) pvpMega(side);
  if(f.dead || f.ghost) return;
  const aim = Math.atan2(i.my - f.y, i.mx - f.x);
  move(f, i.dx, i.dy, dt, 1); f.dir = dirOf(aim);
  if(i.l) use(f, 1, aim, mine);
  if(i.r) use(f, 2, aim, mine);
  if(i.sp) use(f, 0, (i.dx || i.dy) ? Math.atan2(i.dy, i.dx) : aim, mine);
  if(i.q) use(f, 3, aim, mine);
  if(i.e) use(f, 4, aim, mine);
}
function pvpSwitch(side, i){                              // lo mismo que switchMon (combat.js) pero para cualquiera de los dos bandos
  const L = side === 'p' ? g.p : g.e, cur = side === 'p' ? g.pi : g.ei, F = side === 'p' ? g.e[g.ei] : g.p[g.pi], cd = side === 'p' ? g.swCd : g.swCdE;
  if(g.over || g.count > 0 || !L[i] || L[i].dead || i === cur || L[cur].dead || swapBusy(side)) return;
  const trap = abTrapped(L[cur], F);
  if(trap){ g.pops.push({x: L[cur].x, y: L[cur].y - 150, txt: '¡' + trap.toUpperCase() + ': no puedes cambiar!', t: 1.4, c: '#ff9a3a', s: 10}); return; }
  if(cd > 0){ if(side === g.me) g.swNote = 1.6; return; }
  swapStart(side, i, false).vol = true;
}
function pvpMega(side){
  const f = side === 'p' ? g.p[g.pi] : g.e[g.ei];
  if(megaCan(f)) megaStart(f);
}

// ---------------------------------------------------------------------
// Huella: cada segundo se comparan los dos combates. Si difieren dos veces seguidas, algo se ha descuadrado
// ---------------------------------------------------------------------
function pvpState(){
  return [g.pi, g.ei, ...g.p.concat(g.e).map(f => `${f.x.toFixed(1)},${f.y.toFixed(1)},${f.hp.toFixed(1)},${f.en.toFixed(1)}`)].join('|');
}
function pvpCheck(){
  const P = pvp, t = P.tick, h = pvpHash(pvpState());
  P.chkL[t] = h; pvpSend('chk', {t, h}); pvpCmp(t);
}
// ---------------------------------------------------------------------
// Conexión directa entre los dos navegadores (WebRTC): sin pasar por el servidor de Irlanda, el camino es mucho más corto.
// Supabase solo sirve de «teléfono» para ponerse de acuerdo (mensajes rtc: oferta, respuesta y candidatos ICE). Si no se consigue conectar
// (router, empresa, red móvil...), todo sigue funcionando por Supabase como antes. Mientras la directa está abierta, inp/chk/bye van por las dos.
// ---------------------------------------------------------------------
const PVP_ICE = [{urls: 'stun:stun.l.google.com:19302'}, {urls: 'stun:stun1.l.google.com:19302'}];
function pvpRtcInit(){
  const P = pvp; if(!P || P.pc || typeof RTCPeerConnection === 'undefined') return;
  try{
    const pc = new RTCPeerConnection({iceServers: window.PVP_ICE_OVERRIDE || PVP_ICE}); P.pc = pc; P.iceQ = [];
    pc.onicecandidate = e => { if(e.candidate) pvpSend('rtc', {from: cloud.user.id, k: 'ice', d: e.candidate.toJSON()}); };
    if(P.me === 'p'){
      pvpRtcDc(pc.createDataChannel('pvp', {ordered: true}));
      pc.createOffer().then(o => pc.setLocalDescription(o)).then(() => pvpSend('rtc', {from: cloud.user.id, k: 'offer', d: {type: pc.localDescription.type, sdp: pc.localDescription.sdp}})).catch(e => console.warn('[pvp] rtc oferta', e));
    }else pc.ondatachannel = e => pvpRtcDc(e.channel);
  }catch(e){ console.warn('[pvp] WebRTC no disponible', e); P.pc = null; }
}
function pvpRtcDc(dc){
  const P = pvp; if(!P) return; P.dc = dc;
  dc.onopen = () => { if(pvp === P){ P.dcOk = true; console.info('[pvp] conexión directa abierta'); } };
  dc.onclose = dc.onerror = () => { if(pvp === P) P.dcOk = false; };
  dc.onmessage = ev => {
    if(pvp !== P) return; let m; try{ m = JSON.parse(ev.data); }catch(e){ return; }
    if(!m || !m.p) return;
    if(m.e === 'inp') pvpOnInp(m.p); else if(m.e === 'chk') pvpOnChk(m.p); else if(m.e === 'bye') pvpOnBye(m.p);
  };
}
async function pvpOnRtc(p){
  const P = pvp; if(!P || !p || p.from !== P.match.opp.uid) return;
  try{
    if(!P.pc) pvpRtcInit(); const pc = P.pc; if(!pc) return;
    if(p.k === 'offer' && P.me === 'e'){
      await pc.setRemoteDescription(p.d); const a = await pc.createAnswer(); await pc.setLocalDescription(a);
      pvpSend('rtc', {from: cloud.user.id, k: 'answer', d: {type: pc.localDescription.type, sdp: pc.localDescription.sdp}});
      P.iceQ.splice(0).forEach(c => pc.addIceCandidate(c).catch(() => {}));
    }else if(p.k === 'answer' && P.me === 'p'){
      await pc.setRemoteDescription(p.d); P.iceQ.splice(0).forEach(c => pc.addIceCandidate(c).catch(() => {}));
    }else if(p.k === 'ice'){
      if(pc.remoteDescription) pc.addIceCandidate(p.d).catch(() => {}); else P.iceQ.push(p.d);
    }
  }catch(e){ console.warn('[pvp] rtc', e); }
}
function pvpOnChk(p){ const P = pvp; if(!P || !p || !pvpOk(p.t)) return; P.chkR[p.t] = p.h; pvpCmp(p.t); }
function pvpCmp(t){
  const P = pvp, a = P.chkL[t], b = P.chkR[t]; if(a === undefined || b === undefined) return;
  delete P.chkL[t]; delete P.chkR[t];
  if(a === b){ P.bad = 0; return; }
  if(++P.bad >= 2 && !P.finished){ P.desync = true; console.warn('[pvp] desincronizado en el paso', t); pvpFinish(null, 'Los dos combates se han descuadrado y se ha cancelado. Si pasa siempre, recargad la página (Ctrl+F5) los dos.'); }
}

// ---------------------------------------------------------------------
// Final
// ---------------------------------------------------------------------
function pvpEnd(hostWon){ if(!pvp) { g.over = true; return; } pvpFinish((pvp.me === 'p') === !!hostWon, ''); }     // lo llama endBattle (modes.js) cuando alguien se queda sin Pokémon
function pvpDisconnect(){ if(pvp && !pvp.finished) pvpFinish(null, 'Se ha perdido la conexión con ' + pvpName() + '. El combate se ha cancelado.'); }
function pvpOnBye(p){
  const P = pvp; if(!P || !p || p.from !== P.match.opp.uid) return;
  if(!P.running){ pvpFail(p.why === 'ver' ? 'Tú y ' + P.match.opp.name + ' tenéis versiones distintas del juego. Recargad la página (Ctrl+F5).' : P.match.opp.name + ' ha cancelado el combate.'); return; }
  if(!P.finished) pvpFinish(true, pvpName() + ' ha abandonado el combate.');
}
function pvpFinish(iWon, why){                           // iWon: true = ganas · false = pierdes · null = combate cancelado sin ganador
  const P = pvp; if(!P || P.finished) return;
  P.finished = true; P.menu = false; pvpOverlay(''); if(g) g.over = true;
  clearInterval(P.hsT);
  const opp = pvpName(), oppUid = P.match.opp.uid;
  setTimeout(() => {
    if(!g || !g.pvp) return;
    resultClear();
    const title = iWon === null ? 'Combate cancelado' : iWon ? '¡Has ganado a ' + opp + '!' : opp + ' ha ganado';
    document.getElementById('rTitle').textContent = title;
    document.getElementById('rText').textContent = why || 'Combate online amistoso: no da recompensas ni cambia tu progreso.';
    const b = document.getElementById('rBtns'); b.innerHTML = '';
    const add = (t, fn, main) => { const x = document.createElement('button'); x.textContent = t; if(main) x.className = 'main'; x.onclick = fn; b.appendChild(x); };
    add('Revancha', () => { pvpLeave(); g = null; goMain(); const err = cloudChallenge({uid: oppUid, name: opp}); if(err && typeof toast === 'function') toast(err); }, true);
    add('Menú', () => { pvpLeave(); g = null; goMain(); });
    show('result'); if(typeof Sfx !== 'undefined') Sfx.play(iWon ? 'win' : 'lose');
  }, iWon === null ? 300 : 1200);
}
function pvpMenu(){                                      // Esc: abrir / cerrar el menú de abandonar (el combate NO se pausa)
  const P = pvp; if(!P || !P.running || P.finished) return;
  if(P.menu){ P.menu = false; pvpOverlay(''); return; }
  P.menu = true;
  pvpOverlay(`<h2>Combate online</h2><p>El combate sigue en marcha: ${cloudEsc(pvpName())} puede seguir atacando.</p>`, 'Seguir luchando', () => { P.menu = false; pvpOverlay(''); });
  const o = document.querySelector('#pvpOv .cbtns'); if(!o) return;
  const q = document.createElement('button'); q.textContent = 'Abandonar (pierdes)';
  q.onclick = () => { pvpSend('bye', {from: cloud.user.id, why: 'quit'}); pvpFinish(false, 'Has abandonado el combate.'); };
  o.appendChild(q);
}
addEventListener('pagehide', () => { if(pvp && !pvp.finished && pvp.running) pvpSend('bye', {from: cloud.user.id, why: 'quit'}); });

// Avisos sobre el campo (los dibuja draw() al final)
function pvpDraw(){
  const P = pvp; if(!P) return;
  if(!P.running){ textO(P.opp ? 'CARGANDO EL COMBATE...' : 'CONECTANDO...', W / 2, H / 2 + 22, 14, '#ffcc33', 'center'); return; }
  text(`RETRASO ${Math.round(P.D * 1000 / 60)} ms · ${P.dcOk ? 'CONEXIÓN DIRECTA' : 'POR SERVIDOR'}`, 14, H - 12, 6, '#6d7899');
  if(P.wait > .5) textO(`ESPERANDO A ${pvpName().toUpperCase()}... ${Math.floor(P.wait)} s`, W / 2, H / 2 + 22, 12, '#ff9a3a', 'center');
}
