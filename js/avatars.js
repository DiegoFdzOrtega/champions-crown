"use strict";
/* =====================================================================
   12) AVATARES Y BARRA DE USUARIO
   - Los avatares son imágenes de la carpeta  avatares/  (una imagen = un avatar).
   - El avatar activo se guarda en save.avatar (nombre de archivo; '' = el avatar clásico en pixel art).
   - Un avatar con nombre de Pokémon (Gengar.png) se desbloquea al conseguir ese Pokémon. Un archivo con otro nombre está desbloqueado siempre.
   - userBar(): avatar + nombre + migas de pan  Perfil › Logros › Amigos › Mochila  (cabecera del menú y arriba de esas 3 pantallas).
   CÓMO AÑADIR UN AVATAR NUEVO: copia la imagen a avatares/. Si abres el juego desde un servidor con listado de carpetas
   (p. ej. Live Server o python -m http.server) aparece sola; si no, añade su nombre a AVATAR_FILES.
   ===================================================================== */
const AVATAR_DIR = 'avatares/';
const AVATAR_FILES = ['Blastoise.png', 'Charizard.png', 'Dragonite.png', 'Gengar.png', 'Gyarados.png', 'Mewtwo.png', 'Pikachu.png', 'Venasaur.png'];   // lista de respaldo
const AVATAR_EXT = /\.(png|webp|jpe?g|gif)$/i;
const AVATAR_ALIAS = {venasaur: 'venusaur'};                 // nombres de archivo con otra ortografía que el Pokémon

// ---- Lista de avatares: [{file, name, dex}] (dex = nº del Pokémon que lo desbloquea, 0 = siempre libre) ----
let avatarFiles = AVATAR_FILES.slice();
const avatarOf = file => {
  const base = file.replace(AVATAR_EXT, ''), key = plain(base), m = DEX.find(d => plain(d.name) === (AVATAR_ALIAS[key] || key));
  return {file, name: m ? m.name : base.replace(/[_-]+/g, ' '), dex: m ? m.dex : 0};
};
const avatarList = () => avatarFiles.map(avatarOf);
const avatarUnlocked = a => !a.dex || save.box.includes(a.dex);
const avatarUrl = file => AVATAR_DIR + encodeURIComponent(file);

// Avatar clásico (el de siempre): se dibuja una vez en un canvas y se usa como imagen
let defAv = '';
function defaultAvatar(){
  if(!defAv){ const c = document.createElement('canvas'); bitmap(c, AVATAR, null, PAL_AVATAR); defAv = c.toDataURL(); }
  return defAv;
}
// Dirección de la imagen del avatar activo (si el archivo ya no existe o no está desbloqueado, usa el clásico)
function activeAvatarSrc(){
  const a = save.avatar && avatarList().find(x => x.file === save.avatar);
  return a && avatarUnlocked(a) ? avatarUrl(a.file) : defaultAvatar();
}
// Pone el avatar activo en todas las imágenes con clase "av" (cabecera y barras de usuario): se refleja al instante
function refreshAvatars(){
  document.querySelectorAll('img.av').forEach(im => { im.onerror = () => { im.onerror = null; im.src = defaultAvatar(); }; im.src = activeAvatarSrc(); });
}

// Intenta leer la carpeta avatares/ (solo funciona si el servidor muestra el listado) y suma lo que encuentre
async function loadAvatars(){
  try{
    const r = await fetch(AVATAR_DIR, {cache: 'no-store'}); if(!r.ok) return;
    const doc = new DOMParser().parseFromString(await r.text(), 'text/html'), found = [];
    doc.querySelectorAll('a[href]').forEach(a => {
      let f = a.getAttribute('href').split('?')[0].split('/').pop(); try{ f = decodeURIComponent(f); }catch(e){}
      if(AVATAR_EXT.test(f)) found.push(f);
    });
    const have = new Set(avatarFiles.map(f => f.toLowerCase()));
    found.forEach(f => { if(!have.has(f.toLowerCase())){ avatarFiles.push(f); have.add(f.toLowerCase()); } });
    if(found.length && typeof renderAvatarGrid === 'function' && $('avGrid')) renderAvatarGrid();       // si el Perfil está abierto, se actualiza
  }catch(e){}                                              // sin servidor / sin listado: se queda la lista de respaldo
}

// ---- Barra de usuario: avatar + nombre + migas de pan "Perfil › Logros › Amigos › Mochila" ----
const CRUMBS = [['profile', 'Perfil'], ['ach', 'Logros'], ['friends', 'Amigos'], ['bag', 'Mochila']];
const crumbsHtml = active => `<nav class="crumbs" aria-label="Secciones del jugador">` +
  CRUMBS.map(([k, n]) => `<button type="button" data-crumb="${k}"${k === active ? ' class="on" aria-current="page"' : ''}>${n}${k === 'ach' && typeof achReadyCount === 'function' && achReadyCount() ? `<em class="bdg">${achReadyCount()}</em>` : ''}</button>`).join('<i>›</i>') + '</nav>';
const userBar = active => `<div class="ubar"><img class="av" alt="Avatar"><b class="uname">${esc(save.name)}</b>${crumbsHtml(active)}</div>`;
// Un solo "clic" para todas las migas (la cabecera del menú y las barras de las pantallas): cambia de sección sin pasar por el menú
document.addEventListener('click', e => { const b = e.target.closest('[data-crumb]'); if(b) enter(b.dataset.crumb); });

loadAvatars();
