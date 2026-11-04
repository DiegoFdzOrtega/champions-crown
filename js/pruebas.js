"use strict";
/* =====================================================================
   26) CAMPO DE PRUEBAS: la nueva vista de ESTADIO para los combates, para probarla antes de llevarla a otros modos.
   Combate contra la IA (un entrenador del Campo de Entrenamiento al azar). NO da recompensas ni cambia tu progreso.
   No toca la Clasificatoria ni el resto de modos: todo lo de aquí solo se activa con g.o.pruebas.

   CÓMO FUNCIONA
   - Fondo: la imagen fondos/estadio_pruebas.webp (2764 × 1536), que llena toda la ventana (ver prRef).
   - El campo de juego: el mundo del combate mide PR.W × H (más ancho que la pantalla) y se dibuja reducido con una
     "cámara" (PR.cam) para que caiga justo encima del suelo del estadio: así se ve como en la imagen, con los Pokémon
     pequeños abajo y la grada, los focos y las pantallas arriba.
       pantalla = mundo × cam.s + (cam.ox, cam.oy)
   - El ratón siempre va en coordenadas de PANTALLA (para pulsar el HUD); para apuntar, combat.js lo pasa al mundo con mouseWorld().
   - Los Pokémon no pueden salir de las líneas del campo (que va en perspectiva: más estrecho al fondo): prClamp().
   - Encima del fondo se pintan con datos reales: las cartas de los dos Pokémon (pantallas centrales), los marcadores
     de los lados (nombres y patrocinadores inventados), el cartel «¡MEGAEVOLUCIÓN LISTA!» y la línea de abajo.
   El HUD de siempre (paneles de arriba, cuadritos del equipo, barra de energía y ataques) coincide con los huecos de la imagen.
   ===================================================================== */
const RANKED_ESTADIO = true;                                 // true = la CLASIFICATORIA usa esta vista de estadio (js/pvp.js) · false = vuelve al Coliseo de siempre
const PR = {
  W: 1250,                                                  // ancho del mundo en este modo
  get SW(){ return prSW(); },                               // ancho de la pantalla: se adapta a la ventana para llenarla entera (el HUD se dibuja con este)
  REF: {x: -5.86, w: 971.7, h: 540},                        // dónde va la imagen en el "dibujo de referencia" de 960 × 540 (todas las medidas de abajo están en él)
  cam: {s: .6432, ox: 78, oy: 175.6},                       // cámara: los círculos de salida (mundo W*.25 / W*.75) caen en los de la imagen
  ZOOM: 1.2, FLOOR_Y: 512,                                  // cámara acercada: todo el estadio se ve 1,2 veces más grande (Pokémon más grandes, algo menos de grada) · dónde cae en la pantalla la línea de abajo del campo
  floor: {yt: 320, yb: 492, lt: 198, rt: 762, lb: 12, rb: 948},   // líneas del campo en la pantalla: arriba (y, x izq, x der) y abajo
  img: null
};
const PR_ADS = [                                            // patrocinadores de los marcadores (marcas inventadas)
  {n: ['CORONA', 'CO.'], bg: '#f0c42a', fg: '#2a1a05', ic: 'crown'},
  {n: ['TORRE', 'TV'], bg: '#1d3f8a', fg: '#e6f0ff', ic: 'tower'},
  {n: ['BALL', 'CORP.'], bg: '#c8302a', fg: '#ffffff', ic: 'ball'},
  {n: ['LIGA', 'CROWN'], bg: '#2a6fd0', fg: '#ffffff', ic: 'star'}
];
const PR_BG = {ranked: 'fondos/estadio_pruebas.webp', pruebas: 'fondos/estadio_torre.webp'};   // fondo de cada modo (las dos imágenes tienen el MISMO encuadre: campo y pantallas en el mismo sitio)
function prImg(src){
  src = src || (g && g.o && g.o.pruebas ? PR_BG.pruebas : PR_BG.ranked);
  const c = PR.imgs || (PR.imgs = {});
  if(!c[src]){ const im = c[src] = new Image(); im.onload = () => im.ok = true; im.src = src; }
  return c[src];
}
const prOn = () => !!(g && g.o && (g.o.pruebas || g.o.estadio));      // pruebas = Campo de pruebas (contra la IA) · estadio = Clasificatoria online
// PANTALLA COMPLETA: la pantalla mide PR.SW × H (PR.SW sale de la forma de la ventana). El estadio se ve SIEMPRE entero (nunca se recorta el campo):
//  - ventana más ancha que la imagen: la imagen ocupa todo el alto y los lados que sobran se rellenan con la grada de sus bordes (prSides);
//  - ventana más estrecha: la imagen ocupa todo el ancho y queda una franja oscura abajo, detrás de la barra de ataques.
// Todo lo que va pegado a la imagen (pantallas, suelo, cámara y los paneles de arriba del HUD) se mide en el dibujo de referencia y se pasa a la pantalla con prRef().
function prSW(){ const w = cv.width, h = cv.height; return w && h ? Math.max(860, Math.min(1600, Math.round(w / h * H))) : 960; }
function prRef(){ const SW = prSW(), k = Math.min(SW / PR.REF.w, 1) * PR.ZOOM; return {k, ox: SW / 2 - 480 * k, oy: Math.min(0, PR.FLOOR_Y - PR.floor.yb * k)}; }   // referencia → pantalla: X = ox + x·k, Y = oy + y·k (con el zoom se recorta algo de cielo y de los lados)
function prCam(){ const R = prRef(), c = PR.cam; ctx.translate(R.ox + c.ox * R.k, R.oy + c.oy * R.k); ctx.scale(c.s * R.k, c.s * R.k); }   // lo usa render.js: mundo → pantalla
function prTopBegin(){ ctx.save(); W = PR.SW; }       // render.js: los paneles de arriba van en la pantalla (con la cámara acercada, los huecos de la imagen quedan tapados por ellos)
function prTopEnd(){ ctx.restore(); W = PR.SW; }
function prW2S(x, y){ const R = prRef(), c = PR.cam; return [R.ox + (x * c.s + c.ox) * R.k, R.oy + (y * c.s + c.oy) * R.k]; }
function mouseWorld(){                                      // el ratón en coordenadas del mundo (para apuntar)
  if(!prOn()) return mouse;
  const R = prRef(), c = PR.cam, rx = (mouse.x - R.ox) / R.k, ry = (mouse.y - R.oy) / R.k;
  return {x: (rx - c.ox) / c.s, y: (ry - c.oy) / c.s};
}
// Bordes del campo en perspectiva: a esa altura de la pantalla, dónde están las líneas de la izquierda y la derecha
function prEdges(sy){ const F = PR.floor, t = Math.max(0, Math.min(1, (sy - F.yt) / (F.yb - F.yt))); return [F.lt + (F.lb - F.lt) * t, F.rt + (F.rb - F.rt) * t]; }
function prClamp(f){                                        // lo llama combat.js después de mover a un Pokémon
  if(!prOn()) return;
  const c = PR.cam, F = PR.floor, foot = (g.pvp ? 10 : (idleInfo(f.m.dex).foot || 10)) * ESCALA;   // online: medida FIJA (la del sprite depende de si ya cargó la imagen y podría ser distinta en cada ordenador → descuadre)
  f.y = Math.max((F.yt + 10 - c.oy) / c.s - foot, Math.min((F.yb - 12 - c.oy) / c.s - foot, f.y));   // los PIES siempre dentro del campo (cada Pokémon mide distinto)
  const sy = (f.y + foot) * c.s + c.oy, [l, r] = prEdges(sy), m = 22;          // m = margen: que no pise la línea
  f.x = Math.max((l + m - c.ox) / c.s, Math.min((r - m - c.ox) / c.s, f.x));
}

// ---- Entrar al Campo de pruebas: un entrenador del Campo al azar ----
let prLast = '';
function openPruebas(){
  if(team.length < 3){ toast('Necesitas un equipo de 3 Pokémon (Equipo Pokémon).'); return; }
  const pool = CAMPO.filter(T => T.id !== prLast), T = pool[(Math.random() * pool.length) | 0]; prLast = T.id;
  prImg(PR_BG.pruebas);
  const S = campoStats(T), o = {
    pruebas: true, prId: T.id, floor: 0, n: -1, leader: '', arena: '', portrait: 'entrenadores/' + T.file,
    title: 'CAMPO DE PRUEBAS', sub: `${trainerName()} VS ${T.name}`.toUpperCase().slice(0, 34), rival: T.name,
    enemies: T.team, hm: S.hm, dm: S.dm, skill: S.skill, spdm: S.spdm, lvl: S.lvl
  };
  vsIntro({name: T.name, path: 'entrenadores/' + T.file, enemies: T.team, hideFoe: true, label: 'CAMPO DE PRUEBAS · EQUIPO RIVAL OCULTO', music: o, go: () => prGo(o)});
}
function prGo(o){
  LOCKW = PR.W; resize();                                   // el mundo de este modo mide PR.W (startBattle coloca a los Pokémon con W)
  startBattle(o);
  [...g.p, ...g.e].forEach(f => prClamp(f));
}
function prEnd(won){                                         // lo llama endBattle (modes.js): sin premios
  g.over = true;
  const o = g.o, b = $('rBtns'); b.innerHTML = '';
  const add = (t, fn, main) => { const x = document.createElement('button'); x.textContent = t; if(main) x.className = 'main'; x.onclick = fn; b.appendChild(x); };
  resultClear();
  $('rTitle').textContent = won ? `¡Has vencido a ${o.rival}!` : `${o.rival} ha ganado esta vez`;
  $('rText').textContent = 'Campo de pruebas: este combate no da recompensas ni cambia tu progreso.';
  add('Otro combate', () => { g = null; openPruebas(); }, true);
  add('Menú', () => { g = null; goMain(); });
  setTimeout(() => { show('result'); Sfx.play(won ? 'win' : 'lose'); }, 900);
}

// ---- Dibujo (lo llama render.js) ----
function prBack(){                                           // fondo + pantallas del estadio (en la pantalla, detrás de los Pokémon)
  const im = prImg(), R = prRef();
  ctx.fillStyle = '#0a0f1e'; ctx.fillRect(0, 0, PR.SW, H);
  ctx.save(); ctx.translate(R.ox, R.oy); ctx.scale(R.k, R.k);                     // a partir de aquí, medidas del dibujo de referencia
  if(im.ok){ ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, PR.REF.x, 0, PR.REF.w, PR.REF.h); prSides(im, R); ctx.imageSmoothingEnabled = false; }
  const t = performance.now() / 1000;
  prLive(t);                                                 // lo que se mueve: focos, haces de luz y flashes de cámara en la grada
  if(!(typeof TOUCH !== 'undefined' && TOUCH.on)){         // en el móvil no: ahí la vida y el equipo ocupan más y se montaban encima
    prBoard(78, 122, 154, 94, '#4f8bff', t);                 // marcador izquierdo
    prBoard(738, 120, 155, 96, '#ff6a4a', t);                // marcador derecho
  }
  prTrainer(327, 131, 144, 72, 'me', '#4f8bff', t);           // tú (pantalla central izquierda)
  prTrainer(499, 131, 141, 72, 'foe', '#ff6a4a', t);          // el rival (pantalla central derecha)
  ctx.restore();
}
function prSides(im, R){                                      // ventana muy ancha: a los lados, el mismo estadio desenfocado y oscuro (sin estirar ni repetir nada)
  const bw = (PR.SW / R.k - PR.REF.w) / 2; if(bw <= 0) return;
  const SW = Math.round(PR.SW), key = SW + 'x' + H + im.src;
  if(!PR.blur || PR.blurKey !== key){                                                  // se prepara UNA vez por tamaño de ventana (el desenfoque es caro)
    const c = document.createElement('canvas'), q = .25; c.width = Math.ceil(SW * q); c.height = Math.ceil(H * q);
    const x = c.getContext('2d'), s = Math.max(c.width / im.width, c.height / im.height), w = im.width * s, h = im.height * s;
    if('filter' in x) x.filter = 'blur(6px) brightness(.42) saturate(.85)';
    x.drawImage(im, (c.width - w) / 2, (c.height - h) / 2, w, h);
    PR.blur = c; PR.blurKey = key;
  }
  const L = PR.REF.x, Rr = PR.REF.x + PR.REF.w;                                         // bordes de la imagen (en el dibujo de referencia)
  [[L - bw, bw], [Rr, bw]].forEach(([x0, w0]) => {                                      // pinta solo los lados con el estadio desenfocado
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 1, 0, w0 + 2, PR.REF.h); ctx.clip();
    ctx.drawImage(PR.blur, L - bw, 0, PR.REF.w + bw * 2, PR.REF.h); ctx.restore(); });
  [[L, -1], [Rr, 1]].forEach(([e, d]) => {                                              // unión suave: la imagen se funde con los lados
    const f = 36, gr = ctx.createLinearGradient(e - d * f, 0, e, 0);
    gr.addColorStop(0, 'rgba(8,11,24,0)'); gr.addColorStop(1, 'rgba(8,11,24,.55)');
    ctx.fillStyle = gr; ctx.fillRect(d < 0 ? e : e - f, 0, f, PR.REF.h);
    const sh = ctx.createLinearGradient(e, 0, e + d * 24, 0);                           // sombra hacia fuera
    sh.addColorStop(0, 'rgba(0,0,0,.5)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh; ctx.fillRect(d < 0 ? e - 24 : e, 0, 24, PR.REF.h); });
}
function prBarAlpha(){                                        // la barra de ataques se vuelve transparente si un Pokémon pasa por detrás
  const SW = PR.SW, c = PR.cam;
  const behind = [myMon(), oppList()[oppIdx()]].some(f => { if(!f || f.dead) return false;
    const foot = (idleInfo(f.m.dex).foot || 10) * ESCALA, [sx, sy] = prW2S(f.x, f.y + foot);
    return Math.abs(sx - SW / 2) < 315 && sy > H - 120 * HUD_SCALE - 30; });
  PR.barA = (PR.barA || 1) + ((behind ? .35 : 1) - (PR.barA || 1)) * .15;
  return PR.barA;
}
// ---- El estadio se mueve: haces de los focos que barren el campo, brillo de los focos y flashes de cámara en la grada ----
const PR_LAMPS = [[300, 93, '150,210,255'], [429, 93, '150,210,255'], [538, 93, '255,215,150'], [667, 93, '255,215,150']];   // los 4 focos de la imagen (fríos a la izquierda, cálidos a la derecha)
const PR_CROWD = [[240, 222, 480, 44], [0, 140, 62, 190], [62, 250, 110, 80], [898, 140, 62, 190], [788, 250, 110, 80]];     // zonas de público (x, y, ancho, alto)
function prLive(t){
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  PR_LAMPS.forEach(([lx, ly, rgb], i) => {
    const tx = lx + Math.sin(t * .35 + i * 1.7) * 110 + (i < 2 ? 40 : -40), ty = 470, half = 46;   // a dónde apunta el haz (barre despacio)
    const g = ctx.createLinearGradient(lx, ly, tx, ty); g.addColorStop(0, `rgba(${rgb},.16)`); g.addColorStop(.6, `rgba(${rgb},.05)`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(lx - 5, ly + 4); ctx.lineTo(lx + 5, ly + 4); ctx.lineTo(tx + half, ty); ctx.lineTo(tx - half, ty); ctx.closePath(); ctx.fill();
    const fl = .75 + .25 * Math.sin(t * 7 + i * 2.1) * Math.sin(t * 3.3 + i), gl = ctx.createRadialGradient(lx, ly + 3, 0, lx, ly + 3, 16);   // brillo del foco (parpadea un poco)
    gl.addColorStop(0, `rgba(${rgb},${.55 * fl})`); gl.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = gl; ctx.fillRect(lx - 16, ly - 13, 32, 32);
  });
  const hs = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); }, step = Math.floor(t * 6);
  for(let i = 0; i < 40; i++){                                                                  // flashes de cámara: puntos que se encienden un instante
    if(hs(i, step) > .2) continue;
    const z = PR_CROWD[(hs(i, 7.3) * PR_CROWD.length) | 0], x = z[0] + hs(i, step + .5) * z[2], y = z[1] + hs(i + 3, step) * z[3], a = 1 - (t * 6 - step);
    const gf = ctx.createRadialGradient(x, y, 0, x, y, 7); gf.addColorStop(0, `rgba(255,255,255,${.9 * a})`); gf.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gf; ctx.fillRect(x - 7, y - 7, 14, 14);
  }
  ctx.restore();
}

// ---- Pantallas centrales: la imagen de cada entrenador (tú y el rival) ----
const prPics = {};
function prPic(src, half){                                    // carga la imagen y recorta el margen transparente (half: 'r' = solo la mitad derecha, para la chica)
  const key = src + (half || '');
  if(prPics[key]) return prPics[key];
  const P = prPics[key] = {im: new Image(), ok: false};
  P.im.onload = () => {
    try{
      const W0 = P.im.naturalWidth, H0 = P.im.naturalHeight, x0 = half === 'r' ? W0 >> 1 : half === 'l' ? 0 : 0, w0 = half ? W0 >> 1 : W0;
      const c = document.createElement('canvas'); c.width = W0; c.height = H0; const x = c.getContext('2d', {willReadFrequently: true}); x.drawImage(P.im, 0, 0);
      const d = x.getImageData(x0, 0, w0, H0).data; let l = w0, r = -1, tp = H0, b = -1;
      for(let yy = 0; yy < H0; yy++) for(let xx = 0; xx < w0; xx++) if(d[(yy * w0 + xx) * 4 + 3] > 10){ if(xx < l) l = xx; if(xx > r) r = xx; if(yy < tp) tp = yy; if(yy > b) b = yy; }
      Object.assign(P, r < 0 ? {sx: x0, sy: 0, sw: w0, sh: H0} : {sx: x0 + l, sy: tp, sw: r - l + 1, sh: b - tp + 1});
    }catch(e){ Object.assign(P, {sx: 0, sy: 0, sw: P.im.naturalWidth, sh: P.im.naturalHeight}); }
    P.ok = true;
  };
  P.im.src = src;
  return P;
}
function prSkinPic(g){ return g === 'f' ? prPic(VS_SKIN_URL, 'r') : prPic('avatares/' + (VS_SKINS[g] || VS_SKINS.m)); }   // personaje de un jugador (el mismo de la pantalla VS)
function prMePic(){ return prSkinPic(typeof skinOf === 'function' ? skinOf() : 'm'); }
function prFoePic(){                                           // el rival: otro jugador (Clasificatoria: su personaje) o un entrenador del Campo (su imagen)
  if(g.pvp){ const sk = g.o.foeSkin; return prSkinPic(sk === 'f' || (typeof vsKnown === 'function' && vsKnown(sk)) ? sk : 'm'); }
  return prPic(g.o.portrait || '');
}
function prTrainer(x, y, w, h, side, col, t){
  const me = side === 'me', list = me ? myList() : oppList(), cur = me ? myMon() : oppList()[oppIdx()];
  const P = me ? prMePic() : prFoePic(), name = (me ? trainerName() : g.o.rival || '').toUpperCase();
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = 'rgba(8,12,26,.92)'; ctx.fillRect(x, y, w, h); prScreen(x, y, w, h, col);
  const half = Math.round(w * .46);
  const sp = ctx.createRadialGradient(x + half / 2, y + h * .62, 2, x + half / 2, y + h * .62, half * .7);      // foco detrás del personaje
  sp.addColorStop(0, col + '55'); sp.addColorStop(1, col + '00'); ctx.fillStyle = sp; ctx.fillRect(x, y, half, h);
  if(P.ok && P.sw){                                                                                   // el personaje, grande y pixelado, mirando hacia el centro
    const k = Math.min((h - 8) / P.sh, (half - 6) / P.sw), dw = P.sw * k, dh = P.sh * k, bob = Math.round(Math.sin(t * 2 + (me ? 0 : 1.5)) * 1);
    ctx.imageSmoothingEnabled = false; ctx.save(); ctx.translate(x + half / 2, y + h - 3 - dh + bob);
    if(!me) ctx.scale(-1, 1);
    ctx.drawImage(P.im, P.sx, P.sy, P.sw, P.sh, -dw / 2, 0, dw, dh); ctx.restore();
  }
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x + half, y + 4, 1, h - 8);
  const ix = x + half + 6, iw = w - half - 10;
  text(me ? 'TÚ' : 'RIVAL', ix, y + 10, 5, col);
  text(name, ix, y + 22, prFit(name, iw, 8), '#ffffff');
  text('EQUIPO', ix, y + 36, 5, '#c9d6f5');
  list.forEach((f, i) => { const bx = ix + 3 + i * 12, by = y + 44;                                    // Poké Balls: llena = vivo · gris = debilitado · anillo = en el campo
    ctx.fillStyle = f.dead ? '#3a4258' : '#f4f4f4'; ctx.beginPath(); ctx.arc(bx + 2, by, 4, 0, 7); ctx.fill();
    if(!f.dead){ ctx.fillStyle = '#e0352b'; ctx.beginPath(); ctx.arc(bx + 2, by, 4, Math.PI, 0); ctx.fill(); }
    ctx.fillStyle = '#10131f'; ctx.fillRect(bx - 2, by - .5, 8, 1);
    if(f === cur && !f.dead){ ctx.strokeStyle = '#ffcc33'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(bx + 2, by, 5.5, 0, 7); ctx.stroke(); } });
  if(cur){ const nm = cur.m.name.toUpperCase(); text('EN CAMPO', ix, y + 58, 5, '#c9d6f5'); text(nm, ix, y + 67, prFit(nm, iw, 6), cur.dead ? '#e8493a' : '#ffcc33'); }
  prScan(x, y, w, h); ctx.restore();
}
function prScreen(x, y, w, h, col){                          // brillo de pantalla encendida + líneas
  const gr = ctx.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, col + '30'); gr.addColorStop(1, col + '08');
  ctx.fillStyle = gr; ctx.fillRect(x, y, w, h);
}
function prScan(x, y, w, h){ ctx.fillStyle = 'rgba(0,0,0,.16)'; for(let yy = y; yy < y + h; yy += 2) ctx.fillRect(x, yy, w, 1); }
function prFit(txt, maxW, size){                              // tamaño de letra para que quepa
  for(let s = size; s > 4; s--){ ctx.font = `${s}px ${FONT}`; if(ctx.measureText(txt).width <= maxW) return s; }
  return 4;
}
function prBoard(x, y, w, h, col, t){                          // marcadores de los lados: patrocinadores en la parte de abajo (arriba quedan los cuadritos del equipo del HUD)
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = 'rgba(8,12,26,.88)'; ctx.fillRect(x, y, w, h); prScreen(x, y, w, h, col);
  text('PATROCINADORES', x + w - 6, y + 40, 5, col, 'right');
  ctx.fillStyle = col; ctx.fillRect(x + 6, y + 43, w - 12, 1);
  const tw = (w - 16) / 2, th = (h - 54) / 2;
  PR_ADS.forEach((A, i) => {
    const tx = x + 6 + (i % 2) * (tw + 4), ty = y + 47 + ((i / 2) | 0) * (th + 3);
    ctx.fillStyle = A.bg; ctx.fillRect(tx, ty, tw, th);
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(tx, ty, tw, 1); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(tx, ty + th - 1, tw, 1);
    ctx.save(); ctx.translate(tx + 9, ty + th / 2); ctx.scale(.7, .7); prIcon(A.ic, 0, 0, A.fg); ctx.restore();
    const nm = A.n.join(' '); text(nm, tx + 17, ty + th / 2 + 2.5, prFit(nm, tw - 20, 5), A.fg);
  });
  const sweep = ((t * .35) % 1.6) - .3;                       // destello que cruza la pantalla
  const gl = ctx.createLinearGradient(x + w * sweep - 30, 0, x + w * sweep + 30, 0); gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(.5, 'rgba(255,255,255,.08)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gl; ctx.fillRect(x, y, w, h);
  prScan(x, y, w, h); ctx.restore();
}
function prIcon(k, cx, cy, col){                              // iconos pixelados de los patrocinadores
  const P = (dx, dy, w, h, c) => { ctx.fillStyle = c || col; ctx.fillRect(Math.round(cx + dx), Math.round(cy + dy), w, h); };
  if(k === 'crown'){ P(-6, 0, 12, 4); P(-6, -5, 2, 5); P(-1, -6, 2, 6); P(4, -5, 2, 5); }
  else if(k === 'tower'){ P(-3, -7, 6, 13); P(-5, 3, 10, 3); P(-1, -9, 2, 2); }
  else if(k === 'ball'){ ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#e0352b'; ctx.beginPath(); ctx.arc(cx, cy, 7, Math.PI, 0); ctx.fill(); P(-7, -1, 14, 2, '#10131f'); P(-2, -2, 4, 4, '#10131f'); P(-1, -1, 2, 2, '#ffffff'); }
  else { ctx.fillStyle = col; ctx.beginPath(); for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 3 : 7; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); }
}
function prCard(x, y, w, h, f, col, t){                       // carta del Pokémon en la pantalla central: retrato a la izquierda, datos a la derecha
  if(!f) return;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = 'rgba(8,12,26,.9)'; ctx.fillRect(x, y, w, h); prScreen(x, y, w, h, col);
  const half = Math.round(w * .48);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x + half, y, 1, h);
  if(!f.dead) drawFrame(ctx, f.m.dex, 'Idle', t, 0, x + half / 2, y + h / 2 + 4, 1.5, 62, f.shiny);
  else { ctx.globalAlpha = .35; drawFrame(ctx, f.m.dex, 'Idle', 0, 0, x + half / 2, y + h / 2 + 4, 1.5, 62, f.shiny); ctx.globalAlpha = 1; }
  const ix = x + half + 5, iw = w - half - 9, nm = f.m.name.toUpperCase();
  text(nm, ix, y + 12, prFit(nm, iw, 7), '#ffffff');
  const r = f.hp / f.max;
  text('PS', ix, y + 25, 5, '#c9d6f5'); bar(ix + 13, y + 19, iw - 13, 6, f.hp, f.max, r > .5 ? '#4ccf6a' : r > .2 ? '#e8c33a' : '#e8493a');
  text('EN', ix, y + 36, 5, '#7fa8d8'); bar(ix + 13, y + 31, iw - 13, 5, f.en, 100, '#4fb3ff');
  text(`${Math.ceil(f.hp)}/${Math.ceil(f.max)}`, ix + iw, y + 46, 5, '#ffffff', 'right');
  text('TIPO', ix, y + 60, 5, '#c9d6f5');
  let tx = ix + 22; f.m.types.forEach(ty => { const s = ty.toUpperCase().slice(0, 6); ctx.font = `5px ${FONT}`; const tw = ctx.measureText(s).width + 5;
    if(tx + tw > ix + iw + 2) return; ctx.fillStyle = TC[ty]; ctx.fillRect(tx, y + 54, tw, 8); text(s, tx + 2.5, y + 61, 5, '#10141e'); tx += tw + 2; });
  if(f.dead){ ctx.fillStyle = 'rgba(232,73,58,.85)'; ctx.fillRect(x, y + h / 2 - 6, w, 12); text('DEBILITADO', x + w / 2, y + h / 2 + 3, 6, '#ffffff', 'center'); }
  prScan(x, y, w, h); ctx.restore();
}
function prFront(){                                           // encima del HUD: cartel de megaevolución y línea de abajo
  const t = performance.now() / 1000;
  const ready = typeof megaBadgeState === 'function' && megaBadgeState() === 'ready' && g.count <= 0 && !g.over, cur = myMon();
  if(!ready) PR.megaFor = null;                                                         // el cartel solo avisa UN momento: cuando sacas a mitad de combate un Pokémon que puede megaevolucionar
  else if(PR.megaFor !== cur){ PR.megaFor = cur; PR.megaT = g.clock > 1.5 ? t : -99; }  // al empezar el combate no sale (ya está el botón MEGA abajo)
  const ma = ready ? Math.max(0, Math.min(1, (2.4 - (t - PR.megaT)) / .5)) : 0;          // se ve 1,9 s y se desvanece en 0,5 s
  if(ma > 0){
    ctx.save(); ctx.globalAlpha = ma;
    const msg = `¡MEGAEVOLUCIÓN LISTA! (${ctlShort('mega').slice(0, 4)})`, fs = 12;
    const R = prRef(); ctx.save(); ctx.translate(R.ox, R.oy); ctx.scale(R.k, R.k);      // en el dibujo de referencia, justo encima del campo
    ctx.font = `${fs}px ${FONT}`; const w = ctx.measureText(msg).width + 40, h = 34, x = 480 - w / 2, y = 266, p = .6 + .4 * Math.sin(t * 5);
    ctx.save();
    ctx.fillStyle = 'rgba(20,10,40,.85)'; ctx.fillRect(x, y, w, h);
    ctx.shadowColor = '#ff6ad8'; ctx.shadowBlur = 16 * p; ctx.strokeStyle = `rgba(255,106,216,${.7 + .3 * p})`; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.shadowColor = '#7ab8ff'; ctx.strokeStyle = 'rgba(122,184,255,.5)'; ctx.lineWidth = 1; ctx.strokeRect(x + 5.5, y + 5.5, w - 11, h - 11);
    ctx.restore();
    textO(msg, 480, y + 23, fs, hue(t * 120, .95), 'center');
    ctx.restore();
    ctx.restore();
  }
  if(!g.pvp) text('CAMPO DE PRUEBAS · RIVAL: IA · SIN RECOMPENSAS', 14, H - 12, 6, '#6d7899');   // online: ahí va el ping (js/pvp.js)
}
