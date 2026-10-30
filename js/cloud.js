"use strict";
/* =====================================================================
   NUBE: cuentas y guardado de la partida en Supabase (https://supabase.com)
   - Es OPCIONAL: sin cuenta el juego funciona igual que siempre (la partida vive en localStorage, ver state.js).
   - Con cuenta, cada vez que se guarda (persist) se sube una copia a la tabla "saves" (unos segundos después, y solo si ha cambiado algo).
   - La URL y la clave "publishable" son PÚBLICAS a propósito: la seguridad la dan las reglas de la base de datos (Row Level Security):
     cada jugador solo puede leer y escribir SU fila. NUNCA pongas aquí la clave "secret" / "service_role".
   - La librería supabase-js se carga EN SEGUNDO PLANO desde jsDelivr (cloudLoadLib), así nunca retrasa el arranque del juego. Si no carga (sin internet, bloqueada...), cloud.ok = false y el juego sigue sin nube.
   - Tablas (se crearon con el SQL del README): profiles (id, username) y saves (user_id, data, updated_at).

   Cómo se reparte el trabajo:
     cloudInit()        al arrancar: recupera la sesión si ya habías entrado
     cloudSignUp / cloudSignIn / cloudSignOut
     cloudDirty()       lo llama persist() en state.js: programa una subida (debounce de 4 s)
     cloudPush()        sube la partida a la nube
     cloudSync()        al entrar: compara nube y navegador y decide (o te pregunta si hay conflicto)
     cloudUseCloud()    descarga la partida de la nube (guarda antes una copia de seguridad del navegador) y recarga la página
   ===================================================================== */
const CLOUD_URL = 'https://datrtinbmaubkuqvwuzf.supabase.co';
const CLOUD_KEY = 'sb_publishable_JUEl_Gv0mFLjoHjDOnR7-w_EFbemqOW';
const CLOUD_META = 'arena2d_cloud';             // localStorage: {uid, at, dirty} = último estado conocido de la sincronización con ESTE navegador
const CLOUD_BACKUP = 'arena2d_backup';          // localStorage: copia de seguridad de la partida del navegador antes de sustituirla por la de la nube

const cloud = {sb:null, ok:false, ready:false, user:null, name:'', needName:false, busy:false, msg:'', err:'', conflict:null, lastPush:0, timer:0, lock:false, pushing:false};

function cloudMeta(){ try{ return JSON.parse(localStorage.getItem(CLOUD_META) || 'null') || {}; }catch(e){ return {}; } }
function cloudSetMeta(m){ try{ localStorage.setItem(CLOUD_META, JSON.stringify(m)); }catch(e){} }
function cloudPayload(){ teamSync(); return JSON.parse(JSON.stringify({team, ...save})); }          // la misma forma que escribe persist()
function cloudFresh(){                                                                             // ¿partida sin estrenar (nada que perder)?
  return save.record === 0 && save.bp === 0 && save.tickets === 0 && save.ticketsL === 0 && save.box.length <= 3 && !Object.keys(save.prog || {}).length && !Object.keys(save.champ || {}).length && !Object.keys(save.ach || {}).length;
}
function cloudRefresh(){ if(typeof cloudRender === 'function') cloudRender(); }

const CLOUD_LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
function cloudLoadLib(){                                                                            // carga supabase-js sin bloquear nada; llama a cloudInit cuando está
  if(typeof supabase !== 'undefined' && supabase.createClient) return cloudInit();
  const s = document.createElement('script'); s.src = CLOUD_LIB; s.async = true;
  s.onload = cloudInit; s.onerror = () => { cloud.ok = false; cloud.ready = true; cloudRefresh(); };
  document.head.appendChild(s);
}
function cloudInit(){
  if(typeof supabase === 'undefined' || !supabase.createClient){ cloud.ok = false; cloud.ready = true; cloudRefresh(); return; }
  try{
    cloud.sb = supabase.createClient(CLOUD_URL, CLOUD_KEY, {auth:{persistSession:true, autoRefreshToken:true, detectSessionInUrl:false}});
    cloud.ok = true;
  }catch(e){ cloud.ok = false; cloud.ready = true; return; }
  cloud.sb.auth.getSession().then(({data}) => {
    cloud.ready = true;
    if(data && data.session){ cloud.user = data.session.user; return cloudAfterLogin(); }
    cloudRefresh();
  }).catch(() => { cloud.ready = true; cloudRefresh(); });
}

// Nombre de jugador (tabla profiles). Si aún no tiene, se le pedirá uno.
async function cloudLoadProfile(){
  const {data, error} = await cloud.sb.from('profiles').select('username').eq('id', cloud.user.id).maybeSingle();
  if(error){ cloud.err = 'No se pudo leer tu perfil: ' + error.message; return; }
  cloud.name = data ? data.username : ''; cloud.needName = !data;
}
async function cloudAfterLogin(){
  cloud.err = ''; await cloudLoadProfile();
  if(!cloud.needName){ await cloudSync(); cloudFriendsLoad().then(() => { cloudRtStart(); cloudRefresh(); }); }
  cloudRefresh();
}

const CLOUD_NAME_RE = /^[A-Za-z0-9_]{3,16}$/;
async function cloudSetName(name){                                                                 // crea el perfil (nombre único, sin distinguir mayúsculas)
  name = String(name || '').trim();
  if(!CLOUD_NAME_RE.test(name)) return 'El nombre debe tener de 3 a 16 caracteres: letras sin tilde, números o _.';
  const {error} = await cloud.sb.from('profiles').insert({id: cloud.user.id, username: name});
  if(error) return error.code === '23505' ? 'Ese nombre ya lo tiene otro jugador. Prueba con otro.' : 'No se pudo guardar el nombre: ' + error.message;
  cloud.name = name; cloud.needName = false; cloudRtStart(); return '';
}

function cloudErr(e){
  const m = String((e && e.message) || e || '');
  if(/Invalid login/i.test(m)) return 'Email o contraseña incorrectos.';
  if(/already registered|already been registered/i.test(m)) return 'Ese email ya tiene una cuenta. Entra con «Entrar».';
  if(/at least 6|Password should/i.test(m)) return 'La contraseña debe tener al menos 6 caracteres.';
  if(/valid email|invalid format|Unable to validate email/i.test(m)) return 'El email no es válido.';
  if(/rate limit/i.test(m)) return 'Demasiados intentos. Espera un poco y prueba otra vez.';
  if(/schema cache|does not exist|friendships/i.test(m) && /relation|table|schema/i.test(m)) return 'Falta crear la tabla de amistades en Supabase (el SQL de «friendships» del README).';
  if(/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'No hay conexión con el servidor. Mira tu internet.';
  return m || 'Ha ocurrido un error.';
}

async function cloudSignUp(email, pass, name){
  name = String(name || '').trim();
  if(!CLOUD_NAME_RE.test(name)) return 'El nombre de jugador debe tener de 3 a 16 caracteres: letras sin tilde, números o _.';
  const {data, error} = await cloud.sb.auth.signUp({email: String(email || '').trim(), password: pass});
  if(error) return cloudErr(error);
  if(!data.session) return '¡Cuenta creada! Te hemos enviado un correo para confirmarla; después pulsa «Entrar».';   // solo si «Confirm email» está activado en Supabase
  cloud.user = data.user;
  const e = await cloudSetName(name);
  if(e){ cloud.needName = true; await cloudSync(); return e; }                                      // la cuenta existe pero el nombre estaba cogido: se pide otro
  await cloudSync(); return '';
}
async function cloudSignIn(email, pass){
  const {data, error} = await cloud.sb.auth.signInWithPassword({email: String(email || '').trim(), password: pass});
  if(error) return cloudErr(error);
  cloud.user = data.user; await cloudAfterLogin(); return '';
}
async function cloudSignOut(){
  clearTimeout(cloud.timer); cloudRtStop();
  if(cloud.user && !cloud.needName) await cloudPush().catch(() => {});                              // última subida antes de salir
  await cloud.sb.auth.signOut();
  cloud.user = null; cloud.name = ''; cloud.needName = false; cloud.conflict = null; cloud.msg = ''; cloud.err = '';
  cloud.fr = {loaded:false, loading:false, friends:[], incoming:[], outgoing:[], err:''};
  try{ localStorage.removeItem(CLOUD_META); }catch(e){}
  cloudRefresh();
}

// ---- Subida: persist() llama a cloudDirty() cada vez que se guarda ----
function cloudDirty(){
  if(!cloud.ok || !cloud.user || cloud.lock || cloud.needName || cloud.conflict) return;
  const m = cloudMeta(); m.uid = cloud.user.id; m.dirty = true; cloudSetMeta(m);
  clearTimeout(cloud.timer); cloud.timer = setTimeout(() => cloudPush().catch(() => {}), 4000);
}
async function cloudPush(){
  if(!cloud.ok || !cloud.user || cloud.lock || cloud.pushing) return false;
  cloud.pushing = true;
  try{
    const at = new Date().toISOString();
    const {error} = await cloud.sb.from('saves').upsert({user_id: cloud.user.id, data: cloudPayload(), updated_at: at});
    if(error){ cloud.err = 'No se pudo guardar en la nube: ' + error.message; cloudRefresh(); return false; }
    cloudSetMeta({uid: cloud.user.id, at, dirty: false}); cloud.lastPush = Date.now(); cloud.err = ''; cloudRefresh(); return true;
  }catch(e){ cloud.err = cloudErr(e); cloudRefresh(); return false; }
  finally{ cloud.pushing = false; }
}

// ---- Al entrar: ¿qué partida vale, la de la nube o la de este navegador? ----
async function cloudSync(){
  const {data, error} = await cloud.sb.from('saves').select('data, updated_at').eq('user_id', cloud.user.id).maybeSingle();
  if(error){ cloud.err = 'No se pudo leer tu partida de la nube: ' + error.message; return; }
  const m = cloudMeta(), same = m.uid === cloud.user.id;
  if(!data){ await cloudPush(); cloud.msg = 'Tu partida se ha subido a la nube.'; return; }               // cuenta nueva: se sube lo de este navegador
  const row = {data: data.data, at: data.updated_at};
  if(same && m.at && new Date(m.at).getTime() === new Date(row.at).getTime()){                         // la nube no ha cambiado desde la última vez
    if(m.dirty) await cloudPush(); else cloud.msg = 'Tu partida está al día en la nube.'; return;
  }
  if(same && !m.dirty){ cloud.msg = 'Cargando tu partida más reciente...'; return cloudUseCloud(row); }  // jugaste en otro sitio y aquí no has tocado nada: se actualiza sola
  if(!same && cloudFresh()){ return cloudUseCloud(row); }                                              // navegador sin estrenar: se usa la de la nube
  cloud.conflict = row;                                                                                // las dos tienen cambios: decide el jugador
}
function cloudUseCloud(row){
  row = row || cloud.conflict; if(!row) return;
  cloud.lock = true; clearTimeout(cloud.timer);                                                         // persist() deja de escribir hasta recargar
  try{
    const cur = localStorage.getItem('arena2d_v2'); if(cur) localStorage.setItem(CLOUD_BACKUP, cur);    // copia de seguridad de lo que había en este navegador
    localStorage.setItem('arena2d_v2', JSON.stringify(row.data));
    cloudSetMeta({uid: cloud.user.id, at: row.at, dirty: false});
  }catch(e){ cloud.lock = false; cloud.err = 'No se pudo guardar la partida en este navegador.'; return; }
  location.reload();
}
async function cloudUseLocal(){                                                                       // gana el navegador: se pisa la nube
  cloud.conflict = null; const ok = await cloudPush(); cloud.msg = ok ? 'Tu partida de este navegador se ha subido a la nube.' : ''; cloudRefresh();
}

// ---- AMIGOS (tabla friendships: requester pide, addressee acepta; status 'pending' o 'accepted') ----
// Cada jugador solo ve las filas en las que participa (Row Level Security). Los nombres se leen de profiles.
cloud.fr = {loaded:false, loading:false, friends:[], incoming:[], outgoing:[], err:''};
async function cloudFriendsLoad(){
  if(!cloud.ok || !cloud.user || cloud.needName || cloud.fr.loading) return;
  const me = cloud.user.id, fr = cloud.fr; fr.loading = true;
  try{
    const {data, error} = await cloud.sb.from('friendships').select('id, requester, addressee, status, created_at').or(`requester.eq.${me},addressee.eq.${me}`);
    if(error) throw error;
    const rows = data || [], ids = [...new Set(rows.map(r => r.requester === me ? r.addressee : r.requester))], names = {};
    if(ids.length){
      const {data: ps, error: e2} = await cloud.sb.from('profiles').select('id, username').in('id', ids);
      if(e2) throw e2; (ps || []).forEach(p => { names[p.id] = p.username; });
    }
    const row = r => { const other = r.requester === me ? r.addressee : r.requester; return {id: r.id, uid: other, name: names[other] || '(jugador)', at: r.created_at}; };
    const byName = (a, b) => a.name.localeCompare(b.name);
    fr.friends = rows.filter(r => r.status === 'accepted').map(row).sort(byName);
    fr.incoming = rows.filter(r => r.status === 'pending' && r.addressee === me).map(row).sort(byName);
    fr.outgoing = rows.filter(r => r.status === 'pending' && r.requester === me).map(row).sort(byName);
    fr.err = ''; fr.loaded = true;
  }catch(e){ fr.err = cloudErr(e); }
  finally{ fr.loading = false; }
}
async function cloudFriendAdd(name){                                                              // devuelve {err, info}
  name = String(name || '').trim();
  if(!CLOUD_NAME_RE.test(name)) return {err: 'Escribe el nombre de jugador de tu amigo (3-16 letras, números o _).'};
  await cloudFriendsLoad(); if(cloud.fr.err) return {err: cloud.fr.err};
  const me = cloud.user.id, fr = cloud.fr;
  const {data, error} = await cloud.sb.from('profiles').select('id, username').ilike('username', name.replace(/[\\%_]/g, '\\$&')).maybeSingle();   // sin distinguir mayúsculas (la _ se escapa: en ilike es un comodín)
  if(error) return {err: cloudErr(error)};
  if(!data) return {err: 'No existe ningún jugador con ese nombre.'};
  if(data.id === me) return {err: 'Ese eres tú.'};
  if(fr.friends.some(f => f.uid === data.id)) return {err: data.username + ' ya es amigo tuyo.'};
  if(fr.outgoing.some(f => f.uid === data.id)) return {err: 'Ya le enviaste una solicitud a ' + data.username + '. Está esperando a que la acepte.'};
  const inc = fr.incoming.find(f => f.uid === data.id);
  if(inc){ const e = await cloudFriendAccept(inc.id); return e ? {err: e} : {info: data.username + ' ya te había pedido amistad: ¡ahora sois amigos!'}; }
  const {error: e2} = await cloud.sb.from('friendships').insert({requester: me, addressee: data.id, status: 'pending'});
  if(e2) return {err: cloudErr(e2)};
  await cloudFriendsLoad(); return {info: 'Solicitud enviada a ' + data.username + '.'};
}
async function cloudFriendAccept(id){
  const {error} = await cloud.sb.from('friendships').update({status: 'accepted'}).eq('id', id);
  if(error) return cloudErr(error); await cloudFriendsLoad(); return '';
}
async function cloudFriendRemove(id){                                                             // rechazar, cancelar o quitar: es borrar la fila
  const {error} = await cloud.sb.from('friendships').delete().eq('id', id);
  if(error) return cloudErr(error); await cloudFriendsLoad(); return '';
}

// ---- EN LÍNEA Y DESAFÍOS (Supabase Realtime: canal «lobby») ----
// Presence = quién está conectado ahora mismo. Broadcast = mensajes sueltos entre jugadores (desafío, respuesta, cancelar).
// Un desafío dura 30 s. Solo se aceptan desafíos de AMIGOS. Al aceptarse se crea cloud.match y se llama a cloudOnMatch(match) (el combate online: js/pvp.js).
cloud.rt = null; cloud.online = {}; cloud.chal = null; cloud.match = null;
const CLOUD_CHAL_MS = 30000;
function cloudRtStart(){
  if(!cloud.ok || !cloud.user || !cloud.name || cloud.rt) return;
  const ch = cloud.sb.channel('lobby', {config: {presence: {key: cloud.user.id}, broadcast: {self: false}}});
  ch.on('presence', {event: 'sync'}, () => {
      const st = ch.presenceState(), on = {};
      Object.keys(st).forEach(k => { on[k] = (st[k][0] && st[k][0].name) || ''; });
      cloud.online = on; if(typeof cloudRenderFriends === 'function') cloudRenderFriends();
    })
    .on('broadcast', {event: 'challenge'}, m => cloudOnChallenge(m.payload))
    .on('broadcast', {event: 'reply'}, m => cloudOnReply(m.payload))
    .on('broadcast', {event: 'cancel'}, m => cloudOnCancel(m.payload))
    .subscribe(st => { if(st === 'SUBSCRIBED') ch.track({name: cloud.name, at: Date.now()}); });
  cloud.rt = ch;
}
function cloudRtStop(){
  if(cloud.chal) clearTimeout(cloud.chal.timer);
  if(cloud.rt){ try{ cloud.sb.removeChannel(cloud.rt); }catch(e){} }
  cloud.rt = null; cloud.online = {}; cloud.chal = null; cloud.match = null; if(typeof cloudChalUi === 'function') cloudChalUi();
}
const cloudSend = (event, payload) => { if(cloud.rt) cloud.rt.send({type: 'broadcast', event, payload}); };
const cloudBusy = () => (typeof g !== 'undefined' && g && !g.over) || !!cloud.match;               // ya hay un combate en marcha (o uno online preparándose)
const cloudNoTeam = () => typeof team !== 'undefined' && team.length !== 3;                          // para el combate online hace falta un equipo de 3 Pokémon
function cloudChalEnd(msg){ if(cloud.chal) clearTimeout(cloud.chal.timer); cloud.chal = null; if(typeof cloudChalUi === 'function') cloudChalUi(); if(msg && typeof toast === 'function') toast(msg); }
function cloudChalTimer(id){ return setTimeout(() => { if(cloud.chal && cloud.chal.id === id){ const c = cloud.chal; if(c.dir === 'out') cloudSend('cancel', {id, from: cloud.user.id, to: c.uid}); cloudChalEnd(c.dir === 'out' ? c.name + ' no ha respondido.' : 'Desafío de ' + c.name + ' caducado.'); } }, CLOUD_CHAL_MS); }

function cloudChallenge(f){                                                                        // f = {uid, name} de un amigo. Devuelve un texto de error o ''
  if(!cloud.rt) return 'Aún no hay conexión en línea. Espera un momento.';
  if(cloud.chal) return 'Ya hay un desafío en curso.';
  if(cloudBusy()) return 'Estás en un combate.';
  if(cloudNoTeam()) return 'Para un combate online necesitas un equipo de 3 Pokémon (Equipo Pokémon).';
  if(cloud.online[f.uid] === undefined) return f.name + ' no está en línea.';
  const id = Math.random().toString(36).slice(2, 10);
  cloud.chal = {dir: 'out', id, uid: f.uid, name: f.name, t: Date.now(), timer: cloudChalTimer(id)};
  cloudSend('challenge', {id, from: cloud.user.id, fromName: cloud.name, to: f.uid});
  cloudChalUi(); return '';
}
async function cloudOnChallenge(p){
  if(!p || p.to !== cloud.user.id) return;
  let fr = cloud.fr.friends.some(f => f.uid === p.from);
  if(!fr){ await cloudFriendsLoad(); fr = cloud.fr.friends.some(f => f.uid === p.from); }          // quizá os hicisteis amigos hace un momento
  if(!fr) return;                                                                                   // los desconocidos se ignoran
  if(cloud.chal || cloudBusy()){ cloudSend('reply', {id: p.id, from: cloud.user.id, to: p.from, ok: false, why: 'busy'}); return; }
  if(cloudNoTeam()){ cloudSend('reply', {id: p.id, from: cloud.user.id, to: p.from, ok: false, why: 'noteam'}); if(typeof toast === 'function') toast(p.fromName + ' te ha desafiado, pero tu equipo no tiene 3 Pokémon.'); return; }
  cloud.chal = {dir: 'in', id: p.id, uid: p.from, name: p.fromName || '(jugador)', t: Date.now(), timer: cloudChalTimer(p.id)};
  cloudChalUi(); if(typeof Sfx !== 'undefined' && Sfx.play) try{ Sfx.play('click'); }catch(e){}
}
function cloudAnswer(ok){                                                                           // el jugador contesta a un desafío recibido
  const c = cloud.chal; if(!c || c.dir !== 'in') return;
  cloudSend('reply', {id: c.id, from: cloud.user.id, to: c.uid, ok});
  if(ok) cloudMatchStart(c); else cloudChalEnd();
}
function cloudCancelChal(){ const c = cloud.chal; if(!c) return; if(c.dir === 'out') cloudSend('cancel', {id: c.id, from: cloud.user.id, to: c.uid}); cloudChalEnd(); }
function cloudOnReply(p){
  const c = cloud.chal; if(!p || p.to !== cloud.user.id || !c || c.dir !== 'out' || c.id !== p.id) return;
  if(p.ok) cloudMatchStart(c); else cloudChalEnd(c.name + (p.why === 'busy' ? ' está ocupado.' : p.why === 'noteam' ? ' no tiene un equipo de 3 Pokémon.' : ' ha rechazado el desafío.'));
}
function cloudOnCancel(p){ const c = cloud.chal; if(!p || p.to !== cloud.user.id || !c || c.dir !== 'in' || c.id !== p.id) return; cloudChalEnd(c.name + ' ha cancelado el desafío.'); }
function cloudMatchStart(c){                                                                        // desafío aceptado: aquí empezará el combate online
  clearTimeout(c.timer); cloud.chal = null;
  cloud.match = {id: c.id, opp: {uid: c.uid, name: c.name}, host: c.dir === 'out'};               // host = quien lanzó el desafío (su navegador calculará el combate)
  if(typeof cloudChalUi === 'function') cloudChalUi();
  if(typeof cloudOnMatch === 'function') cloudOnMatch(cloud.match);
}

addEventListener('visibilitychange', () => { if(document.visibilityState === 'hidden' && cloud.user && cloudMeta().dirty) cloudPush().catch(() => {}); });
cloudLoadLib();
