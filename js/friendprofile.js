"use strict";
/* =====================================================================
   PERFIL DE AMIGOS: cada jugador publica una «tarjeta» con un resumen suyo y sus amigos pueden abrirla desde Amigos.
   - La tarjeta es un trozo pequeño de datos (avatar, marco, título, cifras, 3 favoritos y logros destacados). NO lleva tu partida, ni BP, ni tickets.
   - Se guarda en la tabla «cards» de Supabase (fila = user_id). Reglas (RLS): solo tú la escribes, y solo la leen tú y tus AMIGOS ACEPTADOS (SQL en el README).
   - fpCard()      construye MI tarjeta a partir de save.
   - fpPublish()   la sube si ha cambiado (la llama cloudPush y también al iniciar sesión). Con save.pubProfile = false borra la fila (nadie la ve).
   - fpLoad(uid)   lee la tarjeta de un amigo.  openFriendProfile(f) / openMyCardPreview() abren la pantalla.
   - La tarjeta de otro jugador es DATO NO FIABLE: todo se valida y se escapa antes de dibujarlo (fpStr, fpNum, listas de avatares, logros, marcos y regiones que existen aquí).
   ===================================================================== */
const FP_VER = 1;
const fpStr = (s, n) => String(s == null ? '' : s).slice(0, n);
const fpNum = n => { n = +n; return isFinite(n) && n > 0 ? Math.min(Math.floor(n), 99999) : 0; };
const fpTotalDex = () => DEX.filter(m => !hidden(m.dex)).length;
const fpRegions = () => Object.keys(ACH_REG_COL);                                    // las regiones que ya tienen Liga jugable

// ---- Mi tarjeta ----
function fpCard(){
  const claimed = ACHIEVEMENTS.filter(a => achGet(a.id).claimed);
  const top = claimed.slice().sort((a, b) => ((b.secret ? 1e6 : 0) + ((b.reward && b.reward.bp) || 0)) - ((a.secret ? 1e6 : 0) + ((a.reward && a.reward.bp) || 0))).slice(0, 8).map(a => a.id);
  const shV = favShinySaved();
  return {
    v: FP_VER, nm: fpStr(save.name, 10), g: save.gender === 'f' ? 'f' : 'm',
    av: (() => { const a = save.avatar && avatarList().find(x => x.file === save.avatar); return a && avatarUnlocked(a) ? a.file : ''; })(),
    fr: achActiveFrame(), ti: achActiveTitle() ? save.title : '',
    box: boxCount(), sh: new Set(save.shiny.filter(d => !hidden(d))).size, ach: claimed.length, achT: ACHIEVEMENTS.length,
    lg: REGIONS.filter(r => save.champ[r]), camp: fpNum(ACH_METRICS.campo_wins({})),
    top, fav: favSaved().map((d, i) => d ? [d, shV[i]] : null).filter(Boolean)
  };
}

// ---- Subir mi tarjeta (solo si ha cambiado desde la última vez) ----
async function fpPublish(force){
  if(!cloud.ok || !cloud.user || cloud.needName || cloud.conflict || cloud.lock) return;
  const on = save.pubProfile !== false, card = on ? fpCard() : null, key = on ? JSON.stringify(card) : 'off';
  if(!force && key === cloud.cardKey) return;
  try{
    const r = on ? await cloud.sb.from('cards').upsert({user_id: cloud.user.id, card, updated_at: new Date().toISOString()})
                 : await cloud.sb.from('cards').delete().eq('user_id', cloud.user.id);
    if(r.error){ cloud.cardErr = r.error.message || 'error'; return; }
    cloud.cardKey = key; cloud.cardErr = '';
  }catch(e){ cloud.cardErr = String((e && e.message) || e); }
}

// ---- Leer la tarjeta de un amigo ----
async function fpLoad(uid){
  const {data, error} = await cloud.sb.from('cards').select('card, updated_at').eq('user_id', uid).maybeSingle();
  if(error) return {err: /does not exist|schema cache|42P01|PGRST205/i.test((error.message || '') + (error.code || '')) ? 'missing' : cloudErr(error)};
  return {card: data && data.card && typeof data.card === 'object' ? data.card : null, at: data && data.updated_at};
}

// ---- Dibujar una tarjeta (la de un amigo o la mía). Todo lo que viene de fuera se valida ----
function fpView(card, o){
  const me = fpCard(), self = !!o.self;
  const av = (card.av && avatarList().find(x => x.file === fpStr(card.av, 80))) || null;
  const fr = ACH_FRAMES[card.fr] ? card.fr : '';
  const tiA = card.ti && achDef(fpStr(card.ti, 60)), title = tiA && tiA.reward && tiA.reward.title ? tiA.reward.title : '';
  const box = fpNum(card.box), sh = fpNum(card.sh), ach = fpNum(card.ach), achT = fpNum(card.achT) || ACHIEVEMENTS.length, camp = fpNum(card.camp);
  const lg = Array.isArray(card.lg) ? card.lg.filter(r => REGIONS.includes(r)) : [];
  const top = (Array.isArray(card.top) ? card.top : []).map(id => achDef(fpStr(id, 60))).filter(Boolean).slice(0, 8);
  const fav = (Array.isArray(card.fav) ? card.fav : []).map(p => Array.isArray(p) ? [fpNum(p[0]), p[1] ? 1 : 0] : null).filter(p => p && p[0] && mon(p[0]) && !hidden(p[0])).slice(0, 3);
  const tile = (label, val, mine) => `<div class="fp-tile"><small>${label}</small><b>${val}</b>${self ? '' : `<em>Tú: ${mine}</em>`}</div>`;
  const online = !self && o.uid && cloud.online[o.uid] !== undefined;
  const regPills = fpRegions().map(r => `<span class="fp-reg${lg.includes(r) ? ' on' : ''}" style="--c:${ACH_REG_COL[r]}">${cloudEsc(ACH_REG_NAME[r] || r)}</span>`).join('');
  return `<div class="fp-head">
      <img class="fp-av${fr ? ' afr-' + fr : ''}" alt="Avatar" src="${av ? avatarUrl(av.file) : defaultAvatar()}">
      <div class="fp-who"><b>${cloudEsc(o.name)}</b>
        <span>${card.nm ? 'Entrenador: ' + cloudEsc(fpStr(card.nm, 10)) : ''}</span>
        ${title ? `<small class="fp-title">${cloudEsc(title)}</small>` : ''}
        ${self ? '' : `<span class="fp-st"><i class="dot${online ? ' on' : ''}"></i>${online ? 'En línea' : 'Desconectado'}</span>`}</div></div>
    <div class="fp-tiles">${tile('Pokémon', box + ' / ' + fpTotalDex(), me.box)}${tile('Shiny ⭐', sh, me.sh)}${tile('Logros', ach + ' / ' + achT, me.ach)}${tile('Ligas', lg.length + ' / ' + REGIONS.length, me.lg.length)}${tile('Victorias Campo', camp, me.camp)}</div>
    <h2>Ligas superadas</h2><div class="fp-regs">${regPills}</div>
    <h2>Pokémon favoritos</h2>
    ${fav.length ? `<div class="fp-favs">${fav.map(([d, s]) => `<div class="fp-fav${s ? ' shiny' : ''}"><canvas width="96" height="96" data-d="${d}" data-s="${s}"></canvas><b>${s ? '⭐ ' : ''}${cloudEsc(mon(d).name)}</b></div>`).join('')}</div>` : '<p class="help">No ha elegido favoritos.</p>'}
    <h2>Logros destacados</h2>
    ${top.length ? `<div class="fp-meds">${top.map(a => `<div class="fp-med" data-a="${cloudEsc(a.id)}"><span></span><b>${cloudEsc(a.name)}</b><small>${a.secret ? 'Secreto' : cloudEsc(ACH_CATS[a.cat] || '')}</small></div>`).join('')}</div>` : '<p class="help">Todavía no ha reclamado logros.</p>'}`;
}
function fpPaint(root){                                                   // sprites y medallas (necesitan el DOM ya puesto)
  root.querySelectorAll('canvas[data-d]').forEach(c => paintSprite(c, +c.dataset.d, {sc:5, fit:90, shiny: c.dataset.s === '1'}));
  root.querySelectorAll('.fp-med').forEach(m => { const a = achDef(m.dataset.a); if(a) m.querySelector('span').appendChild(achMedal(a)); });
  root.querySelectorAll('img.fp-av').forEach(im => { im.onerror = () => { im.onerror = null; im.src = defaultAvatar(); }; });
}

function fpScreen(title, back, backText){
  panel(userBar(back === openProfile ? 'profile' : 'friends') + `<h1>${title}</h1><div id="fpBody" class="fpBody"><p class="help">Cargando...</p></div><div class="pf-btns" id="fpBtns"><button id="fpBack">${backText}</button></div>`);
  $('fpBack').onclick = back;
  return $('fpBody');
}
async function openFriendProfile(f){                                       // f = {uid, name} de un amigo
  const body = fpScreen('Perfil de ' + cloudEsc(f.name), openFriends, '← Volver a Amigos');
  const r = await fpLoad(f.uid); if($('fpBody') !== body) return;            // el jugador ya se fue a otra pantalla
  if(r.err === 'missing'){ body.innerHTML = '<p class="warn">Falta crear la tabla «cards» en Supabase (el SQL está en el README, apartado «Perfil de amigos»).</p>'; return; }
  if(r.err){ body.innerHTML = `<p class="warn">${cloudEsc(r.err)}</p>`; return; }
  if(!r.card){ body.innerHTML = `<p class="help">${cloudEsc(f.name)} todavía no tiene el perfil publicado: puede que no haya abierto el juego con esta versión o que lo tenga oculto.</p>`; return; }
  body.innerHTML = fpView(r.card, {name: f.name, uid: f.uid, self: false}) + (r.at ? `<p class="help">Actualizado: ${cloudTime(r.at)}</p>` : '');
  fpPaint(body);
  if(cloud.online[f.uid] !== undefined){                                     // se puede desafiar desde aquí
    const b = document.createElement('button'); b.className = 'main'; b.textContent = 'Desafiar'; b.onclick = () => { const e = cloudChallenge(f); if(e) toast(e); };
    $('fpBtns').appendChild(b);
  }
}
function openMyCardPreview(){                                              // «Así te ven tus amigos» (desde Perfil)
  const body = fpScreen('Así te ven tus amigos', openProfile, '← Volver a Perfil');
  const off = save.pubProfile === false;
  body.innerHTML = (off ? '<p class="warn">Ahora mismo tu perfil está oculto: tus amigos no lo ven. Actívalo en Perfil › «Perfil para amigos».</p>' : '') + fpView(fpCard(), {name: cloud.name || save.name, self: true});
  fpPaint(body);
}
