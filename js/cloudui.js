"use strict";
/* =====================================================================
   PANTALLA «AMIGOS · CUENTA» (la rellena cloudRender, y la lógica está en js/cloud.js)
   Se abre desde el menú (Perfil › Logros › Amigos › Mochila). Trae la cuenta (guardado en la nube) y la lista de amigos (cloudRenderFriends). Los desafíos vendrán después.
   ===================================================================== */
const cloudUi = {tab:'in', busy:false, err:'', info:'', email:'', pw:null};      // tab: 'in' = Entrar · 'up' = Crear cuenta
const cloudEsc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function cloudSummary(d){                                      // resumen de una partida para decidir en un conflicto
  const box = Array.isArray(d && d.box) ? d.box.length : 0;
  return `${box} Pokémon · ${(d && d.bp) || 0} PB · ${Object.keys((d && d.champ) || {}).length} Liga(s) superada(s) · ${Object.keys((d && d.ach) || {}).length} logro(s)`;
}
function cloudTime(t){ return t ? new Date(t).toLocaleString('es-ES', {dateStyle:'short', timeStyle:'short'}) : '—'; }

function cloudHtml(mode){                                       // mode 'friends' = pantalla Amigos (solo amigos) · si no, pantalla Cuenta (login, contraseña, Google...)
  if(mode === 'friends') return cloudFriendsHtml();
  if(!cloud.ready) return '<p class="help">Conectando con el servidor...</p>';
  if(!cloud.ok) return '<p class="warn">No se pudo cargar la conexión con el servidor (¿sin internet o bloqueada?).</p><p class="help">Puedes seguir jugando sin cuenta: tu partida se guarda en este navegador, como siempre.</p>';
  const msg = (cloudUi.err ? `<p class="warn">${cloudEsc(cloudUi.err)}</p>` : '') + (cloudUi.info ? `<p class="okmsg">${cloudEsc(cloudUi.info)}</p>` : '');
  const dis = cloudUi.busy ? ' disabled' : '';
  if(!cloud.user){
    const up = cloudUi.tab === 'up';
    return `<h2>Tu cuenta</h2>
      <p class="help">Con una cuenta tu partida se guarda en internet: juega en el móvil y en el ordenador, añade amigos y compite en la Clasificatoria. Es opcional.</p>
      <button id="cloudGoogle" class="lg-google"${dis}>${typeof G_LOGO !== 'undefined' ? G_LOGO : ''}<span>Continuar con Google</span></button>
      <p class="help">o con tu email:</p>
      <div class="ctabs"><button class="${up ? '' : 'on'}" data-tab="in">Entrar</button><button class="${up ? 'on' : ''}" data-tab="up">Crear cuenta</button></div>
      <form id="cloudForm" autocomplete="on">
        ${up ? `<label>Nombre de jugador<input id="cfName" type="text" maxlength="16" autocomplete="username" placeholder="3-16 letras, números o _"></label>` : ''}
        <label>Email<input id="cfEmail" type="email" autocomplete="email" placeholder="tu@correo.com" value="${cloudEsc(cloudUi.email || '')}"></label>
        <label>Contraseña<input id="cfPass" type="password" autocomplete="${up ? 'new-password' : 'current-password'}" placeholder="mínimo 6 caracteres"></label>
        <button type="submit" class="main"${dis}>${up ? 'Crear cuenta' : 'Entrar'}</button>
      </form>${up ? '' : `<button type="button" id="cloudForgot" class="linkbtn"${dis}>¿Has olvidado la contraseña?</button>`}${msg}`;
  }
  if(cloud.recovery){                                                                           // has abierto el enlace del correo: elige tu contraseña nueva
    return `<h2>Elige tu contraseña nueva</h2>
      <p class="help">Has entrado con el enlace del correo. Escribe la contraseña nueva dos veces.</p>
      <form id="cloudRecForm" autocomplete="off"><label>Contraseña nueva<input id="crP1" type="password" autocomplete="new-password" placeholder="mínimo 6 caracteres"></label>
      <label>Repite la contraseña nueva<input id="crP2" type="password" autocomplete="new-password"></label>
      <button type="submit" class="main"${dis}>Guardar contraseña nueva</button></form>${msg}<button id="cloudOut" class="sec">Cerrar sesión</button>`;
  }
  if(cloud.needName){
    return `<h2>Elige tu nombre de jugador</h2>
      <p class="help">Es el nombre con el que tus amigos te buscarán. Tiene que ser único.</p>
      <form id="cloudNameForm"><label>Nombre de jugador<input id="cfName" type="text" maxlength="16" placeholder="3-16 letras, números o _"></label>
      <button type="submit" class="main"${dis}>Guardar nombre</button></form>${msg}<button id="cloudOut" class="sec">Cerrar sesión</button>`;
  }
  if(cloud.conflict){
    return `<h2>¿Qué partida quieres usar?</h2>
      <p class="help">Tu cuenta ya tiene una partida en la nube y este navegador también tiene la suya, y son distintas. Elige cuál conservar. La otra se sustituye (si eliges la de la nube, antes se guarda una copia de seguridad de la de este navegador).</p>
      <div class="cchoice"><div><h3>Partida de la nube</h3><p>${cloudEsc(cloudSummary(cloud.conflict.data))}</p><small>Guardada: ${cloudTime(cloud.conflict.at)}</small><button id="cloudUseCloud" class="main"${dis}>Usar la de la nube</button></div>
      <div><h3>Partida de este navegador</h3><p>${cloudEsc(cloudSummary(cloudPayload()))}</p><small>Se sube y pisa la de la nube</small><button id="cloudUseLocal"${dis}>Usar la de este navegador</button></div></div>${msg}<button id="cloudOut" class="sec">Cerrar sesión</button>`;
  }
  return `<h2>Tu cuenta</h2>
    <p>Sesión iniciada como <b>${cloudEsc(cloud.name)}</b></p><p class="help">${cloudEsc((cloud.user && cloud.user.email) || '')}</p>
    <p class="${cloud.err ? 'warn' : 'okmsg'}">${cloudEsc(cloud.err || cloud.msg || 'Tu partida se guarda en la nube automáticamente.')}</p>
    <p class="help">Última subida: ${cloud.lastPush ? cloudTime(cloud.lastPush) : (cloudMeta().at ? cloudTime(cloudMeta().at) : '—')}</p>
    <div class="cbtns"><button id="cloudPush" class="main"${dis}>Guardar en la nube ahora</button><button id="cloudOut" class="sec">Cerrar sesión</button></div>
    ${cloudHasGoogle() ? '<p class="okmsg">✔ Google vinculado: también puedes entrar con «Continuar con Google».</p>' : `<div class="cbtns"><button id="cloudLinkG"${dis}>Vincular mi cuenta de Google</button></div><p class="help">Así podrás entrar a ESTA cuenta (con tu partida, tu nombre y tus amigos) pulsando «Continuar con Google».</p>`}
    <details class="cpass"${cloudUi.pw ? ' open' : ''}><summary>Cambiar contraseña</summary>${cloudUi.pw ? `<p class="${cloudUi.pw.err ? 'warn' : 'okmsg'}">${cloudEsc(cloudUi.pw.err || cloudUi.pw.info)}</p>` : ''}
      <form id="cpForm" autocomplete="off"><label>Contraseña actual<input id="cpOld" type="password" autocomplete="current-password"></label>
      <label>Contraseña nueva<input id="cpNew" type="password" autocomplete="new-password" placeholder="mínimo 6 caracteres"></label>
      <label>Repite la contraseña nueva<input id="cpNew2" type="password" autocomplete="new-password"></label>
      <button type="submit" class="main"${dis}>Cambiar contraseña</button></form></details>${msg}`;
}
function cloudFriendsHtml(){                                    // pantalla Amigos: hace falta haber entrado con una cuenta
  if(!cloud.ready) return '<p class="help">Conectando con el servidor...</p>';
  const dis = cloudUi.busy ? ' disabled' : '', msg = (cloudUi.err ? `<p class="warn">${cloudEsc(cloudUi.err)}</p>` : '') + (cloudUi.info ? `<p class="okmsg">${cloudEsc(cloudUi.info)}</p>` : '');
  if(!cloud.ok || !cloud.user || cloud.needName || cloud.conflict || cloud.recovery)
    return `<p class="help">Para añadir amigos y combatir contra ellos necesitas entrar con una cuenta.</p><div class="cbtns"><button id="cloudGoAcc" class="main">Ir a Cuenta</button></div>`;
  return `<h2>Amigos</h2>
    <p class="help">Escribe el nombre de jugador de un amigo para enviarle una solicitud. Cuando la acepte, aparecerá en tu lista.</p>
    <form id="frForm" class="frAdd"><input id="frName" type="text" maxlength="16" placeholder="Introduce nombre de jugador..." autocomplete="off"><button type="submit" class="main frIco"${dis}>Añadir ${FR_ICO.add}</button></form>${msg}
    <div id="frList"></div>`;
}

function cloudRender(){
  const box = document.getElementById('cloudBox'); if(!box) return;
  const mode = box.dataset.mode || 'account';
  box.innerHTML = cloudHtml(mode);
  const by = id => document.getElementById(id), run = async fn => {
    cloudUi.busy = true; cloudUi.err = ''; cloudUi.info = ''; cloudUi.pw = null; cloudRender();
    let e = ''; try{ e = await fn(); }catch(x){ e = cloudErr(x); }
    cloudUi.busy = false; cloudUi.err = e || ''; cloudRender();
  };
  box.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { cloudUi.tab = b.dataset.tab; cloudUi.err = ''; cloudUi.info = ''; cloudRender(); });
  const f = by('cloudForm');
  if(f) f.onsubmit = ev => { ev.preventDefault(); const email = by('cfEmail').value, pass = by('cfPass').value; cloudUi.email = email;
    if(cloudUi.tab === 'up'){ const name = by('cfName').value; run(async () => { const e = await cloudSignUp(email, pass, name); if(e && /^¡Cuenta creada/.test(e)){ cloudUi.tab = 'in'; cloudUi.info = e; return ''; } return e; }); }
    else run(() => cloudSignIn(email, pass)); };
  const nf = by('cloudNameForm'); if(nf) nf.onsubmit = ev => { ev.preventDefault(); const n = by('cfName').value; run(async () => { const e = await cloudSetName(n); if(!e) await cloudSync(); return e; }); };
  const fg = by('cloudForgot'); if(fg) fg.onclick = () => { const em = by('cfEmail').value; cloudUi.email = em; run(() => cloudResetMail(em)); };
  const rf = by('cloudRecForm'); if(rf) rf.onsubmit = ev => { ev.preventDefault(); const a = by('crP1').value, b = by('crP2').value; run(() => cloudRecoverPass(a, b)); };
  const cp = by('cpForm'); if(cp) cp.onsubmit = ev => { ev.preventDefault(); const a = by('cpOld').value, b = by('cpNew').value, c = by('cpNew2').value; run(async () => { const e = await cloudChangePass(a, b, c); cloudUi.pw = e ? {err: e} : {info: 'Contraseña cambiada.'}; return ''; }); };
  const o = by('cloudOut'); if(o) o.onclick = () => run(() => cloudSignOut().then(() => { cloudUi.tab = 'in'; return ''; }));
  const gg = by('cloudGoogle'); if(gg) gg.onclick = () => run(cloudGoogleIn);
  const ga = by('cloudGoAcc'); if(ga) ga.onclick = openAccount;
  const lgB = by('cloudLinkG'); if(lgB) lgB.onclick = () => run(cloudLinkGoogle);
  const p = by('cloudPush'); if(p) p.onclick = () => run(async () => (await cloudPush()) ? (cloud.msg = 'Guardado en la nube.', '') : (cloud.err || 'No se pudo guardar.'));
  const af = by('frForm');
  if(af) af.onsubmit = ev => { ev.preventDefault(); const n = by('frName').value; run(async () => { const r = await cloudFriendAdd(n); cloudUi.info = r.info || ''; return r.err || ''; }); };
  if(mode === 'friends') cloudRenderFriends();
  if(mode === 'friends' && cloud.user && !cloud.needName && !cloud.conflict && !cloud.fr.loaded && !cloud.fr.loading && !cloud.fr.err) cloudFriendsLoad().then(cloudRenderFriends);
  const uc = by('cloudUseCloud'); if(uc) uc.onclick = () => cloudUseCloud();
  const ul = by('cloudUseLocal'); if(ul) ul.onclick = () => run(async () => { await cloudUseLocal(); return cloud.err; });
}

// Lista de amigos, solicitudes recibidas y enviadas (solo repinta #frList, así no se pierde lo que estés escribiendo en el cuadro de arriba)
const cloudArm = {id:'', t:0};                                  // el botón «Quitar» pide una segunda pulsación para confirmar
// Iconos de la lista de amigos (SVG: se ven igual en todos los navegadores, con el color del botón)
const frSvg = d => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const FR_ICO = {
  user: frSvg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'),
  users: frSvg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/><circle cx="17" cy="9" r="3"/><path d="M16 14.6c3.3 0 5.5 1.9 5.5 5.4"/>'),
  x: frSvg('<path d="M6 6l12 12M18 6L6 18"/>'),
  ok: frSvg('<path d="M5 12.5l4.5 4.5L19 7"/>'),
  add: frSvg('<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'),
  ref: frSvg('<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>'),
  chal: frSvg('<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/>')
};
function cloudAgo(t){                                             // «hace 5 min», «hace 3 h», «hace 2 días» o la fecha
  const s = (Date.now() - new Date(t).getTime()) / 1000;
  if(!(s >= 0)) return 'hace un momento';
  if(s < 90) return 'hace un momento';
  if(s < 3600) return 'hace ' + Math.round(s / 60) + ' min';
  if(s < 86400) return 'hace ' + Math.round(s / 3600) + ' h';
  const d = Math.round(s / 86400); if(d < 7) return d === 1 ? 'hace 1 día' : 'hace ' + d + ' días';
  return 'el ' + new Date(t).toLocaleDateString('es-ES', {day: 'numeric', month: 'short'});
}
function cloudRenderFriends(){
  const el = document.getElementById('frList'); if(!el) return; const fr = cloud.fr;
  if(fr.err){ el.innerHTML = `<p class="warn">${cloudEsc(fr.err)}</p><button id="frRetry" class="sec">Reintentar</button>`; document.getElementById('frRetry').onclick = () => { fr.err = ''; fr.loaded = false; cloudRender(); }; return; }
  if(!fr.loaded){ el.innerHTML = '<p class="help">Cargando amigos...</p>'; return; }
  const on = f => cloud.online[f.uid] !== undefined;
  const st = f => on(f) ? '<small class="frSt on">Conectado</small>' : `<small class="frSt off">Desconectado${f.seen ? ' · ' + cloudAgo(f.seen) : ''}</small>`;
  const row = (f, btns, s) => `<div class="frRow"><b>${s ? `<i class="dot${on(f) ? ' on' : f.seen ? ' off' : ''}"></i>` : ''}<span class="frWho"><span class="frN">${cloudEsc(f.name)}</span>${s ? st(f) : ''}</span></b><span>${btns}</span></div>`;
  const btn = (a, id, t, main) => `<button data-fr="${a}" data-id="${id}" class="frIco${main ? ' main' : ''}">${{view: FR_ICO.user, chal: FR_ICO.chal, remove: FR_ICO.x, accept: FR_ICO.ok}[a] || ''}<em>${t}</em></button>`;
  let h = '';
  if(cloud.rtStatus && cloud.rtStatus !== 'SUBSCRIBED'){                                          // la conexión en línea no está lista: por eso todos salen «Desconectado»
    const why = {CHANNEL_ERROR: 'No se ha podido abrir el canal en línea. En Supabase: Realtime › Settings › activa «Allow public access».', TIMED_OUT: 'La conexión en línea tarda demasiado. Recarga la página (Ctrl+F5).', CLOSED: 'La conexión en línea se ha cerrado. Recarga la página (Ctrl+F5).'}[cloud.rtStatus] || 'Conectando con el servidor en línea...';
    h += `<p class="warn">${cloudEsc(why)}</p>`;
  }
  if(fr.incoming.length) h += `<h3>Solicitudes recibidas (${fr.incoming.length})</h3>` + fr.incoming.map(f => row(f, btn('accept', f.id, 'Aceptar', true) + btn('remove', f.id, 'Rechazar'))).join('');
  h += `<h3>Tus amigos (${fr.friends.length}) ${FR_ICO.users}</h3>` + (fr.friends.length ? fr.friends.slice().sort((a, b) => (on(b) - on(a)) || ((b.seen ? Date.parse(b.seen) : 0) - (a.seen ? Date.parse(a.seen) : 0))).map(f => row(f, btn('view', f.uid, 'Perfil') + (on(f) ? btn('chal', f.uid, 'Desafiar', true) : '') + btn('remove', f.id, 'Quitar'), true)).join('') : '<p class="help">Todavía no tienes amigos. Escribe arriba el nombre de un jugador para enviarle una solicitud.</p>');
  if(fr.outgoing.length) h += `<h3>Solicitudes enviadas</h3>` + fr.outgoing.map(f => row(f, '<small>Esperando respuesta</small>' + btn('remove', f.id, 'Cancelar'))).join('');
  h += `<button id="frRefresh" class="sec frIco">Actualizar lista ${FR_ICO.ref}</button>`;
  el.innerHTML = h;
  el.onclick = async e => {
    const b = e.target.closest('button'); if(!b) return;
    if(b.id === 'frRefresh'){ b.disabled = true; await cloudFriendsLoad(); return cloudRenderFriends(); }
    if(!b.dataset.fr) return; const id = b.dataset.id, a = b.dataset.fr;
    if(a === 'view'){ const f = fr.friends.find(x => x.uid === id); if(f) openFriendProfile(f); return; }
    if(a === 'chal'){ const f = fr.friends.find(x => x.uid === id); const e = f ? cloudChallenge(f) : ''; if(e) toast(e); return; }
    if(a === 'remove' && b.textContent.trim() === 'Quitar' && !(cloudArm.id === id && Date.now() - cloudArm.t < 3500)){ cloudArm.id = id; cloudArm.t = Date.now(); b.querySelector('em').textContent = '¿Seguro?'; return; }
    b.disabled = true;
    const err = a === 'accept' ? await cloudFriendAccept(id) : await cloudFriendRemove(id);
    cloudUi.err = err || ''; cloudUi.info = ''; cloudRender();
  };
}
let cloudPoll = 0;
function openAccount(){                                          // Cuenta: entrar, crear cuenta, nombre, contraseña, vincular Google, nube
  clearInterval(cloudPoll);
  panel(userBar('account') + `<h1>Cuenta</h1><div id="cloudBox" class="cloudbox" data-mode="account"></div>`);
  cloudRender();
}
function openFriends(){
  panel(userBar('friends') + `<h1>Amigos</h1><div id="cloudBox" class="cloudbox" data-mode="friends"></div>`);
  cloudRender();
  clearInterval(cloudPoll);                                       // mientras esta pantalla está abierta, la lista se actualiza sola cada 15 s (solicitudes nuevas...)
  cloudPoll = setInterval(() => { if(!document.getElementById('cloudBox')){ clearInterval(cloudPoll); return; } if(cloud.user && !cloud.needName && !cloud.conflict && cloud.fr.loaded) cloudFriendsLoad().then(cloudRenderFriends); }, 15000);
}

// ---- Ventana de desafío (sale en cualquier pantalla del juego) ----
function cloudChalUi(){
  let o = document.getElementById('chalOv'); const c = cloud.chal, m = cloud.match;
  if(!c && !m){ if(o) o.remove(); return; }
  if(!o){ o = document.createElement('div'); o.id = 'chalOv'; o.className = 'dlOv'; document.body.appendChild(o); }
  if(m && typeof pvpStart === 'function'){ o.remove(); return; }                                   // el combate online (js/pvp.js) lleva su propio aviso
  if(m){
    o.innerHTML = `<div class="dlBox chalBox"><h2>¡Desafío aceptado!</h2><p>Combate contra <b>${cloudEsc(m.opp.name)}</b>.</p><p class="help">El combate online llegará en el siguiente paso. Por ahora, el desafío ya funciona: os habéis conectado.</p><button id="chalOk" class="main">Vale</button></div>`;
    document.getElementById('chalOk').onclick = () => { cloud.match = null; cloudChalUi(); }; return;
  }
  const inc = c.dir === 'in';
  o.innerHTML = `<div class="dlBox chalBox"><h2>${inc ? '¡Te han desafiado!' : 'Desafío enviado'}</h2>
    <p>${inc ? `<b>${cloudEsc(c.name)}</b> te desafía a un combate.` : `Esperando a que <b>${cloudEsc(c.name)}</b> responda...`}</p>
    <div class="cbtns" style="justify-content:center">${inc ? '<button id="chalYes" class="main">Aceptar</button><button id="chalNo">Rechazar</button>' : '<button id="chalNo">Cancelar</button>'}</div></div>`;
  const y = document.getElementById('chalYes'); if(y) y.onclick = () => cloudAnswer(true);
  document.getElementById('chalNo').onclick = () => inc ? cloudAnswer(false) : cloudCancelChal();
}
