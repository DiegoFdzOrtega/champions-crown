"use strict";
/* =====================================================================
   PANEL VS (antes de cada combate de Historia y del Campo de Entrenamiento)
   - Izquierda (rojo): tu nombre, tu personaje (chico o chica) y tus Pokémon de equipo.
   - Derecha (azul): el nombre del rival, su retrato y sus Pokémon.
   - Abajo: "3 vs 6 · Región · tipo de combate".
   - Se cierra solo a los pocos segundos; clic / Enter / Espacio lo salta; Esc cancela y vuelves al menú.

   TU PERSONAJE: la imagen  avatares/RED Y LEAF.png  trae a los dos (Red a la izquierda, Leaf a la derecha); se enseña una mitad u otra.
   Se elige en Perfil › Personaje (save.gender: 'm' = chico, 'f' = chica). Si falta la imagen se usa el avatar clásico.
   (No sale en la lista de avatares: loadAvatars la salta.)

   USO:  vsIntro({name, id, path, label, enemies, go})
        name = nombre del rival · id = nombre de su retrato (lideres/...) · path = ruta fija del retrato (Campo)
        label = texto de abajo · enemies = su equipo (nº de Pokédex u objetos {dex}) · go = función que empieza el combate
   ===================================================================== */
const VS_SKIN_FILE = 'RED Y LEAF.png';                    // una sola imagen en avatares/ con los dos personajes: Red (chico, izquierda) y Leaf (chica, derecha)
const VS_SKIN_URL = 'avatares/' + encodeURIComponent(VS_SKIN_FILE);
const VS_AUTO_MS = 4600, VS_MIN_MS = 700;                  // se cierra solo a los 4,6 s · no se puede saltar en los primeros 0,7 s (evita dobles clics)
// Arte VS de los rivales (como el de la pantalla VS de los juegos): si existe lideres/<región>/VS_<Nombre>.webp (o .png / vs_<nombre>), se usa en vez del retrato pequeño.
// Solo se busca en las regiones de esta lista (así no se piden archivos que no existen).  Si no está, se usa el retrato de siempre.
const VS_ART_REGIONS = [];                                 // DESACTIVADO: siempre se usan los retratos normales. Para volver a usar el arte VS de Kalos: ['kalos']
function vsFoeImg(im, o){
  const fallback = () => { im.onerror = () => { im.style.visibility = 'hidden'; }; if(o.path) im.src = o.path; else loadLeaderInto(im, o.id, () => { im.style.visibility = 'hidden'; }); };
  const reg0 = (typeof save !== 'undefined' && save.region) || '', reg = (typeof REGION_DIR !== 'undefined' && REGION_DIR[reg0]) || reg0;
  const dir = VS_ART_REGIONS.find(r => r === reg.toLowerCase());                          // (la carpeta es lideres/kalos, en minúsculas)
  if(o.path || !dir){ fallback(); return; }
  const cap = n => n.charAt(0).toUpperCase() + n.slice(1), names = [o.id, ...((typeof LEADER_FILE !== 'undefined' && LEADER_FILE[o.id]) || [])], list = [];
  names.forEach(n => ['VS_' + cap(n) + '.webp', 'VS_' + cap(n) + '.png', 'vs_' + n + '.png', 'vs_' + n + '.webp'].forEach(f => list.push(`lideres/${dir}/${f}`)));
  let k = 0;
  im.onload = () => im.parentNode && im.parentNode.classList.add('art');                  // marco apaisado para el arte VS
  im.onerror = () => { if(++k < list.length) im.src = list[k]; else { im.onload = null; fallback(); } };
  im.src = list[0];
}
function setPlayerSkin(el, g){                              // cambia 'el' por el personaje elegido: la mitad izquierda (chico) o derecha (chica) de la imagen; si no existe, el avatar clásico
  const sp = document.createElement('span'); sp.className = 'skin'; sp.dataset.g = g || (save.gender === 'f' ? 'f' : 'm');
  sp.style.backgroundImage = `url("${VS_SKIN_URL}")`;                  // (la ruta se resuelve desde la página, no desde css/)
  el.replaceWith(sp);
  const probe = new Image(); probe.onerror = () => { sp.classList.add('fb'); sp.style.backgroundImage = `url(${defaultAvatar()})`; }; probe.src = VS_SKIN_URL;
}

let vsState = null;                                         // {go, t0, timer, draw, key}
function vsEnd(run){
  if(!vsState) return; const v = vsState; vsState = null;
  clearTimeout(v.timer); clearInterval(v.draw); removeEventListener('keydown', v.key, true);
  $('vs').classList.add('hide'); $('vs').innerHTML = '';
  if(run) v.go();
}
function vsSide(cls, name, mons, setImg, shinyOf){
  const d = document.createElement('div'); d.className = 'vs-side ' + cls;
  d.innerHTML = `<div class="vs-in"><b class="vs-name"></b><div class="vs-pic"><img alt=""></div><div class="vs-mons"></div></div>`;
  const nm = d.querySelector('.vs-name'); nm.textContent = name; if(name.length > 9) nm.classList.add('long');         // nombres largos (Campo de Entrenamiento): letra más pequeña
  setImg(d.querySelector('img'));
  const box = d.querySelector('.vs-mons'), cv = [];
  mons.forEach((e, i) => {
    const dex = typeof e === 'number' ? e : e.dex, c = document.createElement('canvas'); c.width = c.height = 96; c.style.setProperty('--i', i);
    box.appendChild(c); cv.push({c, dex, s: shinyOf ? shinyOf(dex) : false});
  });
  return {el: d, cv};
}
function vsIntro(o){
  if(vsState) return;
  const me = vsSide('vs-me', save.name, team.slice(), el => setPlayerSkin(el), dex => useShiny(dex)),
        foe = vsSide('vs-foe', String(o.name || '').toUpperCase(), o.enemies, im => vsFoeImg(im, o));
  const root = $('vs'); root.innerHTML = '';
  const vs = document.createElement('div'); vs.className = 'vs-vs'; vs.textContent = 'VS';
  const foot = document.createElement('div'); foot.className = 'vs-foot'; foot.textContent = `${team.length} vs ${o.enemies.length}${o.label ? ' · ' + o.label : ''}`;
  const hint = document.createElement('div'); hint.className = 'vs-hint'; hint.textContent = 'Clic o Enter para empezar';
  root.append(me.el, foe.el, vs, foot, hint); root.classList.remove('hide');
  const all = [...me.cv, ...foe.cv], paint = () => all.forEach(({c, dex, s}) => {           // los sprites se dibujan al cargar (como las miniaturas del resto del juego)
    const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height);
    if(!drawFrame(x, dex, 'Idle', 0, 0, c.width / 2, c.height / 2, c.width / 32, c.width - 8, s)){ x.fillStyle = TC[mon(dex).types[0]]; x.beginPath(); x.arc(c.width / 2, c.height / 2, c.width * .3, 0, 7); x.fill(); }
  });
  paint();
  const key = e => {
    if(e.code === 'Escape'){ e.stopImmediatePropagation(); e.preventDefault(); vsEnd(false); return; }              // cancelar: vuelves a donde estabas
    if(['Enter', 'Space', 'NumpadEnter'].includes(e.code)){ e.stopImmediatePropagation(); e.preventDefault(); if(Date.now() - vsState.t0 > VS_MIN_MS) vsEnd(true); }
    else e.stopImmediatePropagation();                                                                              // el resto de teclas no llegan al juego mientras se ve el panel
  };
  addEventListener('keydown', key, true);
  vsState = {go: o.go, t0: Date.now(), key, draw: setInterval(paint, 300), timer: setTimeout(() => vsEnd(true), VS_AUTO_MS)};
  root.onclick = () => { if(vsState && Date.now() - vsState.t0 > VS_MIN_MS) vsEnd(true); };
}
