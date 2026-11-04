"use strict";
/* =====================================================================
   28) PANTALLA DE ENTRADA (login) al abrir el juego
   - «Continuar con Google» (Supabase OAuth: te lleva a Google y vuelve a esta página ya con la sesión iniciada).
   - «Entrar con email»: las cuentas de email y contraseña de siempre (cloudSignIn / cloudSignUp de js/cloud.js).
   - «Jugar sin cuenta»: como siempre, la partida se guarda solo en este navegador.
   Si ya tenías la sesión iniciada, la pantalla se salta sola. Si el servidor no responde, se entra sin cuenta (con un aviso).
   La primera vez que entras con Google se te pide un nombre de jugador (cloudSetName), como al crear una cuenta con email.
   Para que Google funcione hay que activarlo en Supabase (ver el README / las instrucciones que te di).
   ===================================================================== */
const LOGIN_WAIT = 7000;                                                       // ms máximos esperando al servidor antes de dejar jugar sin cuenta
const lg = {mode: 'wait', email: '', up: false, err: '', info: '', busy: false, t0: Date.now(), done: false};

function lgEsc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c])); }
function lgClose(){                                                            // entrar al juego
  if(lg.done) return; lg.done = true;
  const el = $('login'); if(el) el.remove();
  goMain();
  if(lg.err && typeof toast === 'function') toast(lg.err);                    // p. ej. un error al volver de vincular Google (ya estabas dentro, la pantalla se salta)
  if(cloud.user && cloud.conflict && typeof openAccount === 'function') openAccount();     // tu cuenta y este navegador tienen partidas distintas: se elige allí
}
function lgGoogleErr(){                                                        // al volver de Google con un error, viene en la dirección (#error_description=...)
  const h = new URLSearchParams((location.hash || '').replace(/^#/, '') + '&' + (location.search || '').replace(/^\?/, ''));
  const d = h.get('error_description') || h.get('error');
  if(!d) return '';
  try{ history.replaceState(null, '', location.pathname); }catch(e){}
  if(/provider is not enabled|Unsupported provider/i.test(d)) return 'El inicio de sesión con Google aún no está activado en el servidor (Supabase › Authentication › Providers › Google).';
  if(/already linked|identity_already_exists|already exists/i.test(d)) return 'Esa cuenta de Google ya está usada en otra cuenta del juego, así que no se puede vincular a esta. Borra esa otra cuenta (Supabase › Authentication › Users) y vuelve a pulsar «Vincular mi cuenta de Google».';
  return 'No se pudo entrar con Google: ' + d.replace(/\+/g, ' ');
}
async function lgGoogle(){
  lg.err = ''; lg.busy = true; lgRender();
  const {error} = await cloud.sb.auth.signInWithOAuth({provider: 'google', options: {redirectTo: CLOUD_HOME()}});   // te lleva a la página de Google
  if(error){ lg.busy = false; lg.err = cloudErr(error); lgRender(); }
}
async function lgRun(fn){ lg.busy = true; lg.err = ''; lg.info = ''; lgRender(); let r = ''; try{ r = await fn(); }catch(e){ r = cloudErr(e); } lg.busy = false; return r; }

// ---- Qué se enseña según el estado de la cuenta ----
function lgState(){
  if(lg.mode === 'email' || lg.mode === 'guest') return lg.mode;
  if(!cloud.ready) return Date.now() - lg.t0 > LOGIN_WAIT ? 'offline' : 'wait';
  if(!cloud.ok) return 'offline';
  if(cloud.user && cloud.needName) return 'name';
  if(cloud.user && cloud.name) return 'in';
  if(cloud.user) return 'wait';                                                // dentro, cargando el perfil
  return 'choose';
}
const G_LOGO = '<svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

function lgRender(force){
  const el = $('lgBody'); if(!el || lg.done) return;
  const s = lgState(), dis = lg.busy ? ' disabled' : '', key = [s, lg.err, lg.info, lg.busy, lg.up].join('|');
  if(!force && key === lg.key) return;                                        // solo se redibuja si algo cambió (si no, un botón podría desaparecer bajo el dedo)
  lg.key = key;
  const msg = (lg.err ? `<p class="warn">${lgEsc(lg.err)}</p>` : '') + (lg.info ? `<p class="okmsg">${lgEsc(lg.info)}</p>` : '');
  if(s === 'in'){ lgClose(); return; }
  if(s === 'wait'){ el.innerHTML = `<p class="lg-wait">Conectando<span>.</span><span>.</span><span>.</span></p>`; return; }
  if(s === 'offline'){
    el.innerHTML = `<p class="warn">No hay conexión con el servidor.</p><p class="help">Puedes jugar sin cuenta: tu partida se guarda en este navegador. Cuando vuelva la conexión, entra desde <b>Cuenta</b> (arriba, junto a tu nombre).</p>
      <button id="lgGuest" class="main lg-big">Jugar sin cuenta</button>`;
  }
  else if(s === 'choose'){
    el.innerHTML = `<button id="lgGoogle" class="lg-google"${dis}>${G_LOGO}<span>Continuar con Google</span></button>
      <button id="lgEmail" class="lg-alt"${dis}>Entrar con email</button>${msg}
      <p class="help lg-why">Con una cuenta tu partida se guarda en internet: juega en el móvil y en el ordenador, añade amigos y compite en la Clasificatoria.</p>
      <button id="lgGuest" class="linkbtn">Jugar sin cuenta</button>`;
  }
  else if(s === 'email'){
    const up = lg.up;
    el.innerHTML = `<div class="ctabs"><button class="${up ? '' : 'on'}" data-tab="in">Entrar</button><button class="${up ? 'on' : ''}" data-tab="up">Crear cuenta</button></div>
      <form id="lgForm" autocomplete="on">
        ${up ? `<label>Nombre de jugador<input id="lgName" type="text" maxlength="16" autocomplete="username" placeholder="3-16 letras, números o _"></label>` : ''}
        <label>Email<input id="lgMail" type="email" autocomplete="email" placeholder="tu@correo.com" value="${lgEsc(lg.email)}"></label>
        <label>Contraseña<input id="lgPass" type="password" autocomplete="${up ? 'new-password' : 'current-password'}" placeholder="mínimo 6 caracteres"></label>
        <button type="submit" class="main lg-big"${dis}>${up ? 'Crear cuenta' : 'Entrar'}</button>
      </form>${up ? '' : `<button type="button" id="lgForgot" class="linkbtn"${dis}>¿Has olvidado la contraseña?</button>`}${msg}
      <button id="lgBack" class="linkbtn">← Volver</button>`;
  }
  else if(s === 'name'){
    el.innerHTML = `<h2>Elige tu nombre de jugador</h2><p class="help">Es el nombre con el que te verán tus rivales y tus amigos. Tiene que ser único.</p>
      <form id="lgNameForm"><label>Nombre de jugador<input id="lgName" type="text" maxlength="16" placeholder="3-16 letras, números o _" autocomplete="off"></label>
      <button type="submit" class="main lg-big"${dis}>Empezar</button></form>${msg}
      <p class="help lg-why">¿Ya tenías cuenta con email? Pulsa «Usar otra cuenta», entra con tu email y en <b>Cuenta</b> pulsa «Vincular mi cuenta de Google».</p>
      <button id="lgOut" class="linkbtn">Usar otra cuenta</button>`;
  }
  const by = id => document.getElementById(id);
  if(by('lgGuest')) by('lgGuest').onclick = lgClose;
  if(by('lgGoogle')) by('lgGoogle').onclick = lgGoogle;
  if(by('lgEmail')) by('lgEmail').onclick = () => { lg.mode = 'email'; lg.err = ''; lgRender(); };
  if(by('lgBack')) by('lgBack').onclick = () => { lg.mode = 'wait'; lg.err = ''; lg.info = ''; lgRender(); };
  el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { lg.up = b.dataset.tab === 'up'; lg.err = ''; lgRender(); });
  if(by('lgForm')) by('lgForm').onsubmit = async e => { e.preventDefault();
    const m = by('lgMail').value, p = by('lgPass').value, n = by('lgName') ? by('lgName').value : ''; lg.email = m;
    const r = await lgRun(() => lg.up ? cloudSignUp(m, p, n) : cloudSignIn(m, p));
    if(r && !cloud.user){ lg.err = /correo/.test(r) && /creada/.test(r) ? '' : r; lg.info = /creada/.test(r) ? r : ''; lgRender(); return; }
    if(r) lg.err = r;
    lg.mode = 'wait'; lgRender(); };
  if(by('lgForgot')) by('lgForgot').onclick = async () => { const r = await lgRun(() => cloudResetMail(by('lgMail').value)); lg.err = r; lg.info = r ? '' : (typeof cloudUi !== 'undefined' && cloudUi.info) || 'Te hemos mandado un correo.'; lgRender(); };
  if(by('lgNameForm')) by('lgNameForm').onsubmit = async e => { e.preventDefault();
    const r = await lgRun(() => cloudSetName(by('lgName').value));
    if(r){ lg.err = r; lgRender(); return; }
    await lgRun(async () => { await cloudSync(); if(typeof cloudGifts === 'function') await cloudGifts(); return ''; });
    lgClose(); };
  if(by('lgOut')) by('lgOut').onclick = async () => { await lgRun(() => cloudSignOut().then(() => '')); lg.mode = 'wait'; lgRender(); };
}

// ---- Arranque: se pone encima del menú y espera a saber si ya habías entrado ----
(() => {
  const d = document.createElement('div'); d.id = 'login'; d.className = 'screen ui';
  d.innerHTML = `<div class="lg-card"><h1 class="lg-logo">CHAMPIONS<br>CROWN</h1><p class="lg-sub">ROAD TO CHAMPION · ARENA 2D</p><div id="lgBody"></div></div>`;
  document.body.appendChild(d);
  show('none');                                                                // el menú no responde al teclado mientras tanto
  lg.err = lgGoogleErr();
  if(lg.err) lg.mode = 'wait';
  lgRender();
  const tick = setInterval(() => { if(lg.done){ clearInterval(tick); return; } if(!lg.busy) lgRender(); }, 300);   // sigue el estado de la cuenta (vuelta de Google, perfil...): solo redibuja si cambia
  const st = document.createElement('style');
  st.textContent = `#login{z-index:50;align-items:center;justify-content:center;background:rgba(5,7,14,.62)}
    #login .lg-card{width:min(30rem,92vw);margin:auto;padding:2.2rem 2.2rem 1.6rem;text-align:center;background:rgba(13,17,28,.92);border:2px solid #3a5a9c;box-shadow:0 0 2rem rgba(62,166,255,.35)}
    #login .lg-logo{font-size:2.3rem;line-height:1.3;margin:0;color:#fff;text-shadow:.22rem .22rem 0 #ff3ea5,-.12rem -.12rem 0 #3ea6ff}
    #login .lg-sub{font-size:.75rem;color:#8b98ad;margin:.8rem 0 1.8rem}
    .lg-google{display:flex;align-items:center;justify-content:center;gap:.9rem;width:100%;max-width:30rem;margin:0 0 .8rem;padding:1rem;background:#fff!important;color:#1f1f1f!important;border:2px solid #fff!important;font-family:Roboto,"Segoe UI",system-ui,sans-serif;font-size:1.05rem;font-weight:600}
    .lg-google:hover,.lg-google:focus{box-shadow:0 0 1.2rem rgba(255,255,255,.45)}
    #login .lg-alt,#login .lg-big{width:100%;margin:0 0 .8rem;padding:.95rem}
    #login form{text-align:left}#login form label{display:block;margin:.6rem 0}#login form input{width:100%;margin-top:.35rem}
    #login .lg-why{margin:1rem 0 .6rem;font-size:.7rem;line-height:1.7}
    #login .linkbtn{display:inline-block;margin:.4rem 0 0}
    #login .lg-wait{font-size:1rem;color:#9fb0d8;margin:1.4rem 0}
    #login .lg-wait span{animation:lgDot 1.2s infinite}#login .lg-wait span:nth-child(2){animation-delay:.2s}#login .lg-wait span:nth-child(3){animation-delay:.4s}
    @keyframes lgDot{0%,100%{opacity:.2}50%{opacity:1}}`;
  document.head.appendChild(st);
})();
