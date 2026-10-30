"use strict";
/* =====================================================================
   PANTALLA «AMIGOS · CUENTA» (la rellena cloudRender, y la lógica está en js/cloud.js)
   Se abre desde el menú (Perfil › Logros › Amigos › Mochila). Trae la cuenta (guardado en la nube) y la lista de amigos (cloudRenderFriends). Los desafíos vendrán después.
   ===================================================================== */
const cloudUi = {tab:'in', busy:false, err:'', info:''};      // tab: 'in' = Entrar · 'up' = Crear cuenta
const cloudEsc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function cloudSummary(d){                                      // resumen de una partida para decidir en un conflicto
  const box = Array.isArray(d && d.box) ? d.box.length : 0;
  return `${box} Pokémon · ${(d && d.bp) || 0} PB · ${Object.keys((d && d.champ) || {}).length} Liga(s) superada(s) · ${Object.keys((d && d.ach) || {}).length} logro(s)`;
}
function cloudTime(t){ return t ? new Date(t).toLocaleString('es-ES', {dateStyle:'short', timeStyle:'short'}) : '—'; }

function cloudHtml(){
  if(!cloud.ready) return '<p class="help">Conectando con el servidor...</p>';
  if(!cloud.ok) return '<p class="warn">No se pudo cargar la conexión con el servidor (¿sin internet o bloqueada?).</p><p class="help">Puedes seguir jugando sin cuenta: tu partida se guarda en este navegador, como siempre.</p>';
  const msg = (cloudUi.err ? `<p class="warn">${cloudEsc(cloudUi.err)}</p>` : '') + (cloudUi.info ? `<p class="okmsg">${cloudEsc(cloudUi.info)}</p>` : '');
  const dis = cloudUi.busy ? ' disabled' : '';
  if(!cloud.user){
    const up = cloudUi.tab === 'up';
    return `<h2>Tu cuenta</h2>
      <p class="help">Con una cuenta tu partida se guarda en internet: podrás jugar desde otro ordenador y, pronto, añadir amigos y combatir contra ellos. Es opcional.</p>
      <div class="ctabs"><button class="${up ? '' : 'on'}" data-tab="in">Entrar</button><button class="${up ? 'on' : ''}" data-tab="up">Crear cuenta</button></div>
      <form id="cloudForm" autocomplete="on">
        ${up ? `<label>Nombre de jugador<input id="cfName" type="text" maxlength="16" autocomplete="username" placeholder="3-16 letras, números o _"></label>` : ''}
        <label>Email<input id="cfEmail" type="email" autocomplete="email" placeholder="tu@correo.com"></label>
        <label>Contraseña<input id="cfPass" type="password" autocomplete="${up ? 'new-password' : 'current-password'}" placeholder="mínimo 6 caracteres"></label>
        <button type="submit" class="main"${dis}>${up ? 'Crear cuenta' : 'Entrar'}</button>
      </form>${msg}`;
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
      <div><h3>Partida de este navegador</h3><p>${cloudEsc(cloudSummary(cloudPayload()))}</p><small>Se sube y pisa la de la nube</small><button id="cloudUseLocal"${dis}>Usar la de este navegador</button></div></div>${msg}`;
  }
  return `<h2>Tu cuenta</h2>
    <p>Sesión iniciada como <b>${cloudEsc(cloud.name)}</b></p><p class="help">${cloudEsc((cloud.user && cloud.user.email) || '')}</p>
    <p class="${cloud.err ? 'warn' : 'okmsg'}">${cloudEsc(cloud.err || cloud.msg || 'Tu partida se guarda en la nube automáticamente.')}</p>
    <p class="help">Última subida: ${cloud.lastPush ? cloudTime(cloud.lastPush) : (cloudMeta().at ? cloudTime(cloudMeta().at) : '—')}</p>
    <div class="cbtns"><button id="cloudPush" class="main"${dis}>Guardar en la nube ahora</button><button id="cloudOut" class="sec">Cerrar sesión</button></div>
    <h2>Amigos</h2>
    <p class="help">Escribe el nombre de jugador de un amigo para enviarle una solicitud. Cuando la acepte, aparecerá en tu lista.</p>
    <form id="frForm" class="frAdd"><input id="frName" type="text" maxlength="16" placeholder="Nombre de tu amigo" autocomplete="off"><button type="submit" class="main"${dis}>Añadir</button></form>${msg}
    <div id="frList"></div>`;
}

function cloudRender(){
  const box = document.getElementById('cloudBox'); if(!box) return;
  box.innerHTML = cloudHtml();
  const by = id => document.getElementById(id), run = async fn => {
    cloudUi.busy = true; cloudUi.err = ''; cloudUi.info = ''; cloudRender();
    let e = ''; try{ e = await fn(); }catch(x){ e = cloudErr(x); }
    cloudUi.busy = false; cloudUi.err = e || ''; cloudRender();
  };
  box.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { cloudUi.tab = b.dataset.tab; cloudUi.err = ''; cloudUi.info = ''; cloudRender(); });
  const f = by('cloudForm');
  if(f) f.onsubmit = ev => { ev.preventDefault(); const email = by('cfEmail').value, pass = by('cfPass').value;
    if(cloudUi.tab === 'up'){ const name = by('cfName').value; run(async () => { const e = await cloudSignUp(email, pass, name); if(e && /^¡Cuenta creada/.test(e)){ cloudUi.tab = 'in'; cloudUi.info = e; return ''; } return e; }); }
    else run(() => cloudSignIn(email, pass)); };
  const nf = by('cloudNameForm'); if(nf) nf.onsubmit = ev => { ev.preventDefault(); const n = by('cfName').value; run(async () => { const e = await cloudSetName(n); if(!e) await cloudSync(); return e; }); };
  const o = by('cloudOut'); if(o) o.onclick = () => run(() => cloudSignOut().then(() => { cloudUi.tab = 'in'; return ''; }));
  const p = by('cloudPush'); if(p) p.onclick = () => run(async () => (await cloudPush()) ? (cloud.msg = 'Guardado en la nube.', '') : (cloud.err || 'No se pudo guardar.'));
  const af = by('frForm');
  if(af) af.onsubmit = ev => { ev.preventDefault(); const n = by('frName').value; run(async () => { const r = await cloudFriendAdd(n); cloudUi.info = r.info || ''; return r.err || ''; }); };
  cloudRenderFriends();
  if(cloud.user && !cloud.needName && !cloud.conflict && !cloud.fr.loaded && !cloud.fr.loading && !cloud.fr.err) cloudFriendsLoad().then(cloudRenderFriends);
  const uc = by('cloudUseCloud'); if(uc) uc.onclick = () => cloudUseCloud();
  const ul = by('cloudUseLocal'); if(ul) ul.onclick = () => run(async () => { await cloudUseLocal(); return cloud.err; });
}

// Lista de amigos, solicitudes recibidas y enviadas (solo repinta #frList, así no se pierde lo que estés escribiendo en el cuadro de arriba)
const cloudArm = {id:'', t:0};                                  // el botón «Quitar» pide una segunda pulsación para confirmar
function cloudRenderFriends(){
  const el = document.getElementById('frList'); if(!el) return; const fr = cloud.fr;
  if(fr.err){ el.innerHTML = `<p class="warn">${cloudEsc(fr.err)}</p><button id="frRetry" class="sec">Reintentar</button>`; document.getElementById('frRetry').onclick = () => { fr.err = ''; fr.loaded = false; cloudRender(); }; return; }
  if(!fr.loaded){ el.innerHTML = '<p class="help">Cargando amigos...</p>'; return; }
  const on = f => cloud.online[f.uid] !== undefined;
  const row = (f, btns, st) => `<div class="frRow"><b>${st ? `<i class="dot${on(f) ? ' on' : ''}"></i>` : ''}${cloudEsc(f.name)}${st ? `<small>${on(f) ? 'En línea' : 'Desconectado'}</small>` : ''}</b><span>${btns}</span></div>`;
  const btn = (a, id, t, main) => `<button data-fr="${a}" data-id="${id}"${main ? ' class="main"' : ''}>${t}</button>`;
  let h = '';
  if(fr.incoming.length) h += `<h3>Solicitudes recibidas (${fr.incoming.length})</h3>` + fr.incoming.map(f => row(f, btn('accept', f.id, 'Aceptar', true) + btn('remove', f.id, 'Rechazar'))).join('');
  h += `<h3>Tus amigos (${fr.friends.length})</h3>` + (fr.friends.length ? fr.friends.slice().sort((a, b) => on(b) - on(a)).map(f => row(f, (on(f) ? btn('chal', f.uid, 'Desafiar', true) : '') + btn('remove', f.id, 'Quitar'), true)).join('') : '<p class="help">Todavía no tienes amigos. Escribe arriba el nombre de un jugador para enviarle una solicitud.</p>');
  if(fr.outgoing.length) h += `<h3>Solicitudes enviadas</h3>` + fr.outgoing.map(f => row(f, '<small>Esperando respuesta</small>' + btn('remove', f.id, 'Cancelar'))).join('');
  h += `<button id="frRefresh" class="sec">Actualizar lista</button>`;
  el.innerHTML = h;
  el.onclick = async e => {
    const b = e.target.closest('button'); if(!b) return;
    if(b.id === 'frRefresh'){ b.disabled = true; await cloudFriendsLoad(); return cloudRenderFriends(); }
    if(!b.dataset.fr) return; const id = b.dataset.id, a = b.dataset.fr;
    if(a === 'chal'){ const f = fr.friends.find(x => x.uid === id); const e = f ? cloudChallenge(f) : ''; if(e) toast(e); return; }
    if(a === 'remove' && b.textContent === 'Quitar' && !(cloudArm.id === id && Date.now() - cloudArm.t < 3500)){ cloudArm.id = id; cloudArm.t = Date.now(); b.textContent = '¿Seguro?'; return; }
    b.disabled = true;
    const err = a === 'accept' ? await cloudFriendAccept(id) : await cloudFriendRemove(id);
    cloudUi.err = err || ''; cloudUi.info = ''; cloudRender();
  };
}
let cloudPoll = 0;
function openFriends(){
  panel(userBar('friends') + `<h1>Amigos</h1><div id="cloudBox" class="cloudbox"></div>`);
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
