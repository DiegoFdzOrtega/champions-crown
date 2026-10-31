"use strict";
/* =====================================================================
   PANEL VS (antes de cada combate de Historia y del Campo de Entrenamiento)
   - Izquierda (rojo): tu nombre, tu personaje (chico o chica) y tus Pokémon de equipo.
   - Derecha (azul): el nombre del rival, su retrato y sus Pokémon.
   - Abajo: "3 vs 6 · Región · tipo de combate".
   - Se cierra solo a los pocos segundos; clic / Enter / Espacio lo salta; Esc cancela y vuelves al menú.

   TU PERSONAJE: la imagen  avatares/RED Y LEAF.png  trae a los dos (Red a la izquierda, Leaf a la derecha); se enseña una mitad u otra.
   Se elige en Perfil › Personaje (save.gender: 'm' = chico, 'f' = chica, 'r' = Red Masters, solo para la cuenta yumbax). Si falta la imagen se usa el avatar clásico.
   (No sale en la lista de avatares: loadAvatars la salta.)

   USO:  vsIntro({name, id, path, label, enemies, go})
        name = nombre del rival · id = nombre de su retrato (lideres/...) · path = ruta fija del retrato (Campo)
        label = texto de abajo · enemies = su equipo (nº de Pokédex u objetos {dex}) · go = función que empieza el combate
        music = el objeto del combate (el mismo que recibe startBattle): hace que la música del combate empiece a sonar ya en esta pantalla. Si cancelas con Esc, vuelve la música del menú.
   ===================================================================== */
const VS_SKIN_FILE = 'RED Y LEAF.png';                    // una sola imagen en avatares/ con los dos personajes: Red (chico, izquierda) y Leaf (chica, derecha)
const VS_SKIN_URL = 'avatares/' + encodeURIComponent(VS_SKIN_FILE);
// Personajes de una sola imagen (80x80, con margen transparente que se recorta al dibujarlos): 'm' = chico (Red de 3.ª gen.) · 'r' = Red Masters (EXCLUSIVO de la cuenta VS_MASTERS_USER)
// La chica ('f') sigue siendo la mitad derecha de VS_SKIN_FILE.
const VS_SKINS = {m: 'red-gen3.png', r: 'red-masters.png'};
const VS_SKIN_FILES = [VS_SKIN_FILE, ...Object.values(VS_SKINS)];       // (no salen en la lista de avatares: loadAvatars las salta)
const VS_MASTERS_USER = 'yumbax';
const skinAllowed = g => g !== 'r' || (typeof cloud !== 'undefined' && !!cloud.name && cloud.name.toLowerCase() === VS_MASTERS_USER);   // es solo un detalle de adorno: se mira el nombre de la cuenta (Amigos)
const skinOf = g => { g = g || save.gender; return g === 'f' ? 'f' : (g === 'r' && skinAllowed('r') ? 'r' : 'm'); };      // el personaje que se usa de verdad (si no puedes tener el Masters, el chico)
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
function vsTrim(sp, im){                                     // recorta el margen transparente de la imagen para que el personaje salga grande (mira dónde empiezan y acaban los píxeles dibujados)
  try{
    const W = im.naturalWidth, H = im.naturalHeight, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d', {willReadFrequently: true}); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, W, H).data;
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for(let j = 0; j < H; j++) for(let i = 0; i < W; i++) if(d[(j * W + i) * 4 + 3] > 8){ if(i < x0) x0 = i; if(i > x1) x1 = i; if(j < y0) y0 = j; if(j > y1) y1 = j; }
    if(x1 < 0) return;
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
    sp.style.aspectRatio = bw + '/' + bh; sp.style.backgroundSize = `${W / bw * 100}% ${H / bh * 100}%`;
    sp.style.backgroundPosition = `${W > bw ? x0 / (W - bw) * 100 : 0}% ${H > bh ? y0 / (H - bh) * 100 : 0}%`;
  }catch(e){}                                                // (si el navegador lo impide, se ve entera con su margen)
}
function setPlayerSkin(el, g){                              // cambia 'el' por el personaje elegido: chico ('m'), chica ('f': mitad derecha de la imagen de Red y Leaf) o Red Masters ('r'); si falta la imagen se usa el avatar clásico
  g = skinOf(g);
  const sp = document.createElement('span'); sp.className = 'skin'; sp.dataset.g = g;
  el.replaceWith(sp);
  if(g === 'f'){
    sp.style.backgroundImage = `url("${VS_SKIN_URL}")`;                  // (la ruta se resuelve desde la página, no desde css/)
    const probe = new Image(); probe.onerror = () => { sp.classList.add('fb'); sp.style.backgroundImage = `url(${defaultAvatar()})`; }; probe.src = VS_SKIN_URL;
    return;
  }
  const url = 'avatares/' + VS_SKINS[g]; sp.classList.add('one'); sp.style.backgroundImage = `url("${url}")`;
  const probe = new Image(); probe.onload = () => vsTrim(sp, probe);
  probe.onerror = () => { sp.classList.remove('one'); sp.dataset.g = 'm'; sp.style.backgroundImage = `url("${VS_SKIN_URL}")`;       // sin la imagen nueva: la mitad izquierda de la antigua
    const old = new Image(); old.onerror = () => { sp.classList.add('fb'); sp.style.backgroundImage = `url(${defaultAvatar()})`; }; old.src = VS_SKIN_URL; };
  probe.src = url;
}

let vsState = null;                                         // {go, t0, timer, draw, key}
function vsEnd(run){
  if(!vsState) return; const v = vsState; vsState = null;
  clearTimeout(v.timer); clearInterval(v.draw); removeEventListener('keydown', v.key, true);
  $('vs').classList.add('hide'); $('vs').innerHTML = '';
  if(run) v.go(); else if(v.music) Music.play('menu');                                      // cancelar: vuelve la música del menú
}
// Tipo que más se repite entre los Pokémon del rival (solo su primer tipo): si lo comparten la mitad o más (un líder de gimnasio), el fondo del rival toma el color de ese tipo
function vsTint(list){
  const n = {};
  list.forEach(e => { try{ const t = mon(typeof e === 'number' ? e : e.dex).types[0]; if(t) n[t] = (n[t] || 0) + 1; }catch(err){} });
  const k = Object.keys(n).sort((x, y) => n[y] - n[x])[0];
  return k && TC[k] && n[k] >= Math.ceil(list.length / 2) ? {type: k, color: TC[k], es: (typeof TYPE_ES !== 'undefined' && TYPE_ES[k]) || k} : null;
}
function vsSide(cls, name, mons, setImg, shinyOf, tint, sub){
  const d = document.createElement('div'); d.className = 'vs-side ' + cls;
  d.innerHTML = `<div class="vs-bg"></div><div class="vs-pic"><img alt=""></div><div class="vs-plate"><b class="vs-name"></b><small class="vs-sub"></small></div><div class="vs-mons"></div>`;
  if(tint) d.style.setProperty('--t', tint.color);                                                                  // el fondo del rival toma el color de su tipo
  d.querySelector('.vs-sub').textContent = sub || '';
  const nm = d.querySelector('.vs-name'); nm.textContent = name; if(name.length > 9) nm.classList.add('long');         // nombres largos (Campo de Entrenamiento): letra más pequeña
  setImg(d.querySelector('img'));
  const box = d.querySelector('.vs-mons'), cv = [];
  mons.forEach((e, i) => {
    const dex = typeof e === 'number' ? e : e.dex, w = document.createElement('div'), c = document.createElement('canvas'); c.width = c.height = 144;
    let tc = '#fff'; try{ tc = TC[mon(dex).types[0]] || '#fff'; }catch(err){}                                          // el aro de cada Pokémon lleva el color de su tipo
    w.className = 'vs-mon'; w.style.setProperty('--i', i); w.style.setProperty('--tc', tc); w.appendChild(c); box.appendChild(w);
    cv.push({c, dex, s: shinyOf ? shinyOf(dex) : false});
  });
  return {el: d, cv};
}
function vsIntro(o){
  if(vsState) return;
  const me = vsSide('vs-me', save.name, team.slice(), el => setPlayerSkin(el), dex => useShiny(dex), null, 'Tu equipo'),
        tint = vsTint(o.enemies),
        foe = vsSide('vs-foe', String(o.name || '').toUpperCase(), o.enemies, im => vsFoeImg(im, o), null, tint, tint ? 'Tipo ' + tint.es : '');
  const root = $('vs'); root.innerHTML = '';
  const vs = document.createElement('div'); vs.className = 'vs-vs'; vs.textContent = 'VS';
  const cut = document.createElement('div'); cut.className = 'vs-cut';
  const flash = document.createElement('div'); flash.className = 'vs-flash';
  const foot = document.createElement('div'); foot.className = 'vs-foot'; foot.textContent = `${team.length} vs ${o.enemies.length}${o.label ? ' · ' + o.label : ''}`;
  const hint = document.createElement('div'); hint.className = 'vs-hint'; hint.textContent = 'Clic o Enter para empezar';
  root.append(me.el, foe.el, cut, vs, foot, hint, flash); root.classList.remove('hide');
  if(o.music) Music.battle(o.music);                                                                                  // la música del combate empieza en la pantalla VS (startBattle la pide otra vez y ya está sonando)
  const all = [...me.cv, ...foe.cv], paint = () => all.forEach(({c, dex, s}) => {           // los sprites se dibujan al cargar (como las miniaturas del resto del juego)
    const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height);
    if(!drawFrame(x, dex, 'Idle', 0, 0, c.width / 2, c.height / 2, c.width / 32, c.width - 10, s)){ x.fillStyle = TC[mon(dex).types[0]]; x.beginPath(); x.arc(c.width / 2, c.height / 2, c.width * .3, 0, 7); x.fill(); }
  });
  paint();
  const key = e => {
    if(e.code === 'Escape'){ e.stopImmediatePropagation(); e.preventDefault(); vsEnd(false); return; }              // cancelar: vuelves a donde estabas
    if(['Enter', 'Space', 'NumpadEnter'].includes(e.code)){ e.stopImmediatePropagation(); e.preventDefault(); if(Date.now() - vsState.t0 > VS_MIN_MS) vsEnd(true); }
    else e.stopImmediatePropagation();                                                                              // el resto de teclas no llegan al juego mientras se ve el panel
  };
  addEventListener('keydown', key, true);
  vsState = {go: o.go, music: !!o.music, t0: Date.now(), key, draw: setInterval(paint, 300), timer: setTimeout(() => vsEnd(true), VS_AUTO_MS)};
  root.onclick = () => { if(vsState && Date.now() - vsState.t0 > VS_MIN_MS) vsEnd(true); };
}
