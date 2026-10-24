"use strict";
/* =====================================================================
   10) PERFIL: nombre, avatar y 3 Pokémon favoritos (solo es una selección de perfil:
       no toca el equipo de combate, las estadísticas ni los desbloqueos)
   ===================================================================== */
// true = solo se pueden elegir Pokémon que ya tienes. Pon false para poder elegir cualquiera de los 1025.
const PROFILE_ONLY_OWNED = true;

const favSaved = () => [0,1,2].map(i => (save.profileFav && mon(save.profileFav[i])) ? save.profileFav[i] : 0);   // 0 = espacio vacío
const favShinySaved = () => favSaved().map((d, i) => (d && save.profileSh && save.profileSh[i] && save.shiny.includes(d)) ? 1 : 0);   // 1 = ese favorito se enseña en su versión shiny
const profileFavCount = () => favSaved().filter(Boolean).length;
const plain = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();   // sin tildes, para buscar
let pfDraft = [0,0,0], pfDraftS = [0,0,0];     // favoritos que estás editando y si cada uno va en versión shiny (hasta pulsar "Guardar perfil")
let avDraft = '';                              // avatar que tienes marcado en la cuadrícula (hasta pulsar "Guardar / Seleccionar avatar activo")

function openProfile(){ pfDraft = favSaved(); pfDraftS = favShinySaved(); avDraft = save.avatar || ''; renderProfile(); }

function renderProfile(){
  const saved = favSaved();
  const savedS = favShinySaved(), dirty = pfDraft.some((d,i) => d !== saved[i] || pfDraftS[i] !== savedS[i]);
  panel(userBar('profile') + `<h1>Perfil</h1>
    <div class="pf-top"><img id="pfAv" alt="Vista previa del avatar">
      <div><b id="pfName"></b><p>Pokémon en tu colección: ${boxCount()}</p></div></div>
    <label>Nombre de entrenador<br><input id="nameIn" maxlength="10"></label>
    <h2>Avatar</h2>
    <p class="help">Elige tu avatar. Los que tienen candado se desbloquean al conseguir ese Pokémon.</p>
    <div class="av-grid" id="avGrid"></div>
    <div class="pf-btns"><button id="avSave" class="main">Guardar / Seleccionar avatar activo</button></div>
    <h2>Pokémon favoritos</h2>
    <p class="help">Elige 3 Pokémon distintos. Si tienes su versión shiny, puedes enseñarla en tu perfil. Son solo para tu perfil: no cambian tu equipo de combate.</p>
    <div class="pf-slots" id="pfSlots"></div>
    <p id="pfMsg" class="warn"></p>
    <div class="pf-btns"><button id="pfSave" class="main">Guardar perfil</button><button id="pfCancel">Cancelar cambios</button></div>`);
  $('pfName').textContent = save.name; renderAvatarGrid();
  $('nameIn').value = save.name;
  $('nameIn').oninput = e => { save.name = e.target.value.toUpperCase().slice(0,10) || 'ENTRENADOR'; $('pfName').textContent = save.name; persist(); refreshHud(); };
  const box = $('pfSlots');
  pfDraft.forEach((dex, i) => {
    const sh = !!(dex && pfDraftS[i] && save.shiny.includes(dex));
    const s = document.createElement('div'); s.className = 'pf-slot' + (dex ? '' : ' empty') + (sh ? ' shiny' : '');
    const h = document.createElement('small'); h.textContent = 'Favorito ' + (i+1); s.appendChild(h);
    const c = document.createElement('canvas'); c.width = c.height = 96; s.appendChild(c);
    const n = document.createElement('b'); n.textContent = dex ? (sh ? '⭐ ' : '') + mon(dex).name : 'Vacío'; s.appendChild(n);
    if(dex) dexThumbs.push({c, m:mon(dex), s:sh});
    const b = document.createElement('button'); b.textContent = dex ? 'Cambiar' : 'Elegir'; b.onclick = ()=>openFavPicker(i); s.appendChild(b);
    box.appendChild(s);
  });
  const full = pfDraft.every(Boolean), distinct = new Set(pfDraft).size === 3;
  $('pfMsg').textContent = !full ? 'Faltan favoritos: elige los 3 para poder guardar.' : !distinct ? 'No puedes repetir el mismo Pokémon.' : dirty ? 'Hay cambios sin guardar.' : '';
  $('pfSave').disabled = !(full && distinct && dirty);
  $('pfCancel').disabled = !dirty;
  $('pfSave').onclick = ()=>{
    if(!(pfDraft.every(Boolean) && new Set(pfDraft).size === 3)) return;
    save.profileFav = pfDraft.slice(); save.profileSh = pfDraft.map((d, i) => pfDraftS[i] && save.shiny.includes(d) ? 1 : 0); persist(); toast('Perfil guardado'); refreshHud(); renderProfile();
  };
  $('pfCancel').onclick = ()=>{ pfDraft = favSaved(); pfDraftS = favShinySaved(); renderProfile(); };
}

// Cuadrícula para elegir el Pokémon de un espacio
function openFavPicker(slot){
  let sel = pfDraft[slot], selS = pfDraftS[slot] ? 1 : 0;          // selS = 1: se enseña en versión shiny
  const hasSh = d => save.shiny.includes(d);
  const owned = (PROFILE_ONLY_OWNED ? save.box.slice() : Array.from({length:DEX_TOTAL}, (_,i) => i+1)).filter(d => mon(d) && !hidden(d)).sort((a,b) => a-b);
  panel(`<h1>Favorito ${slot+1}</h1>
    <p class="help">${PROFILE_ONLY_OWNED ? 'Pokémon que ya tienes.' : 'Cualquier Pokémon.'} Los que ya están en otro espacio aparecen apagados.</p>
    <label>Buscar por nombre o número<br><input id="pfSearch" type="text" autocomplete="off"></label>
    <div class="pf-ver" id="pfVer"></div>
    <div class="grid pf-grid" id="pfGrid"></div><p id="pfCount" class="help"></p>
    <div class="pf-btns"><button id="pfOk" class="main">Confirmar</button><button id="pfNo">Cancelar</button></div>`);
  const used = d => pfDraft.some((x,i) => i !== slot && x === d);
  const draw = ()=>{
    const q = plain($('pfSearch').value.trim()), grid = $('pfGrid'); grid.innerHTML = ''; dexThumbs.length = 0;
    const list = owned.filter(d => !q || plain(mon(d).name).includes(q) || String(d) === q), shown = list.slice(0, 60);
    shown.forEach(d => {
      const {d:el, c} = card(mon(d), '#' + d);
      if(used(d)) el.classList.add('off'); if(d === sel) el.classList.add('sel');
      if(hasSh(d)){ const st = document.createElement('em'); st.className = 'sh'; st.textContent = '⭐'; st.title = 'Tienes su versión shiny'; el.appendChild(st); }
      el.onclick = ()=>{ if(used(d)){ toast('Ya está en otro espacio de favoritos.'); return; }
        if(d !== sel) selS = hasSh(d) ? (d === pfDraft[slot] ? pfDraftS[slot] : (useShiny(d) ? 1 : 0)) : 0;      // al elegir uno nuevo: usa la versión que llevas en tu equipo
        sel = d; draw(); };
      dexThumbs.push({c, m:mon(d), s:d === sel && !!selS}); grid.appendChild(el);
    });
    $('pfCount').textContent = list.length ? (list.length > shown.length ? `Mostrando ${shown.length} de ${list.length}: escribe para buscar.` : `${list.length} Pokémon`) : 'No hay ningún Pokémon con ese nombre.';
    $('pfOk').disabled = !sel || used(sel);
    const ver = $('pfVer'); ver.innerHTML = '';                                                    // elección Normal / Shiny del Pokémon marcado
    if(sel && hasSh(sel)){
      ver.innerHTML = `<span>${esc(mon(sel).name)}: versión en tu perfil</span><button class="pill${selS ? '' : ' on'}" data-s="0">Normal</button><button class="pill${selS ? ' on' : ''}" data-s="1">⭐ Shiny</button>`;
      ver.querySelectorAll('button').forEach(b => b.onclick = () => { selS = +b.dataset.s; draw(); });
    }else if(sel){ ver.innerHTML = `<span>${esc(mon(sel).name)}: aún no tienes su versión shiny (sale en el Gachapon)</span>`; }
  };
  $('pfSearch').oninput = draw;
  $('pfOk').onclick = ()=>{ if(sel && !used(sel)){ pfDraft[slot] = sel; pfDraftS[slot] = hasSh(sel) && selS ? 1 : 0; renderProfile(); } };
  $('pfNo').onclick = renderProfile;
  draw();
}

// ---- Selector de avatar: cuadrícula con las imágenes de avatares/ (los bloqueados salen apagados con candado) ----
function renderAvatarGrid(){
  const grid = $('avGrid'); if(!grid) return;
  const tiles = [{file:'', name:'Clásico', dex:0, src:defaultAvatar()}, ...avatarList().map(a => ({...a, src:avatarUrl(a.file)}))];
  grid.innerHTML = tiles.map(t => {
    const lock = t.file && !avatarUnlocked(t), act = (save.avatar || '') === t.file, sel = avDraft === t.file;
    return `<button type="button" class="av-tile${sel ? ' sel' : ''}${act ? ' act' : ''}${lock ? ' lock' : ''}" data-f="${esc(t.file).replace(/"/g, '&quot;')}" title="${lock ? 'Bloqueado: consigue a ' + esc(t.name) + ' (Gachapon)' : esc(t.name)}">
      <img src="${t.src}" alt="" onerror="this.style.visibility='hidden'"><span>${esc(t.name)}</span>${act ? '<em>ACTIVO</em>' : ''}${lock ? '<u>🔒</u>' : ''}</button>`;
  }).join('');
  grid.onclick = e => {
    const b = e.target.closest('.av-tile'); if(!b) return;
    if(b.classList.contains('lock')){ toast('Avatar bloqueado: consigue ese Pokémon en el Gachapon.'); return; }
    avDraft = b.dataset.f; renderAvatarGrid();
  };
  const prev = $('pfAv'); if(prev){ prev.onerror = () => { prev.onerror = null; prev.src = defaultAvatar(); }; prev.src = avDraft ? avatarUrl(avDraft) : defaultAvatar(); }   // vista previa
  const btn = $('avSave'); if(btn){
    btn.disabled = avDraft === (save.avatar || '');
    btn.onclick = () => {
      const a = avDraft && avatarList().find(x => x.file === avDraft);
      if(avDraft && !(a && avatarUnlocked(a))) return;
      save.avatar = avDraft; persist(); refreshAvatars(); refreshHud();            // se actualiza la cabecera al instante
      toast('Avatar activo: ' + (a ? a.name : 'Clásico')); renderAvatarGrid();
    };
  }
}
