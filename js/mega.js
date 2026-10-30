"use strict";
/* =====================================================================
   24) MEGA-ARO Y MEGAEVOLUCIÓN
   QUÉ HAY:
   - OBJETOS CLAVE (save.keys, state.js): objetos únicos que no se gastan. Hoy solo el Mega-Aro (se ve en Mochila › Objetos clave).
     Lo entrega solo el logro «Mega-Aro» (ser Campeón de Teselia, achievements.js).
   - MEGAPIEDRAS: una por cada mega (tabla MEGA, justo debajo). Se compran en la Tienda (pestaña Megapiedras, MEGA_PRICE BP) y se equipan en
     Equipo Pokémon como cualquier objeto, pero SOLO en su Pokémon (itemFits).
   - EN COMBATE: si tu Pokémon lleva su piedra y tienes el Mega-Aro, sale el aviso «MEGAEVOLUCIÓN» sobre la barra de energía y puedes pulsar la tecla R
     (o hacer clic en el aviso). Una sola por combate para todo tu equipo. El tiempo se para durante la animación (estilo X/Y: hélice de luz, destello
     y símbolo mega). La mega cambia: sprite, tipos, habilidad, ataque (el mayor entre Atq y Atq. Esp.) y velocidad. La vida no cambia.
   - RIVALES: el campo `mega:'lucario'` de una plantilla (kalos.js) hace que ese Pokémon megaevolucione solo, MEGA_FOE_DELAY segundos después de salir.
   SPRITES: pokemon_mega/<nº>-mega/ (mismas hojas que pokemon/). sheet() de sprites.js entiende dex = '448-mega' (texto) y los busca ahí.
   CÓMO AÑADIR UNA MEGA: 1) su carpeta en pokemon_mega/  2) su piedra en objetos/megapiedras/  3) una línea en MEGA. La Tienda y el equipo la cogen solos.
   ===================================================================== */

const MEGA_DIR = 'objetos/megapiedras/';               // sprites del Mega-Aro y de las Piedras Activadoras (32x32)
const MEGA_SPR = 'pokemon_mega';                       // carpeta de los sprites de las formas mega (la usa sprites.js)
const MEGA_PRICE = 3000;                               // BP que cuesta cada megapiedra
const MEGA_FOE_DELAY = 4;                              // los rivales megaevolucionan 4 s después de salir al campo

// ---- Objetos clave ----
const KEY_ITEMS = {
  mega_aro: {n:'Mega-Aro', img:MEGA_DIR + 'mega-bracelet.png',
    d:'Brazalete que permite la Megaevolución. Te lo dieron al ser Campeón de Teselia, para viajar a Kalos. Con él, un Pokémon que lleve su Megapiedra puede megaevolucionar en combate (tecla R), una vez por combate.'}
};
const hasKey = id => !!(save.keys && save.keys[id]);
const hasMegaRing = () => hasKey('mega_aro');
function giveKey(id){                                   // entrega un objeto clave (una sola vez). Devuelve true si es nuevo
  if(!KEY_ITEMS[id] || hasKey(id)) return false;
  save.keys[id] = Date.now(); persist(); return true;
}

// ---- Tabla de megaevoluciones ----
// clave = el valor de `mega` en las plantillas (kalos.js) · dex = Pokémon base · folder = carpeta en pokemon_mega/ · form = nombre de la forma
// stone / img = nombre y archivo (objetos/megapiedras/) de su piedra · types = tipos de la forma mega · ab = su habilidad (las que hace el juego están en abilities.js)
// base = [PS, Atq, Def, Atq.Esp, Def.Esp, Vel] de la forma mega (comprobadas con Bulbapedia). Todas las habilidades de esta tabla están hechas en abilities.js. En combate cuentan: Atq/Atq.Esp (el mayor) y Vel; los PS no cambian y la defensa solo va por tipos.
const MG = (dex, folder, form, stone, img, types, ab, base) => ({dex, folder, form, stone, img, types, ab, base});
const MEGA = {
  charizard_x: MG(6,   '6-mega-x',   'Mega-Charizard X', 'Charizardita X', 'charizardite-x', ['fuego', 'dragon'],     'Garra Dura',     [78, 130, 111, 130, 85, 100]),
  alakazam:    MG(65,  '65-mega',    'Mega-Alakazam',    'Alakazamita',    'alakazite',      ['psiquico'],            'Rastro',         [55, 50, 65, 175, 105, 150]),
  gengar:      MG(94,  '94-mega',    'Mega-Gengar',      'Gengarita',      'gengarite',      ['fantasma', 'veneno'],  'Sombra Trampa',  [60, 65, 80, 170, 95, 130]),
  kangaskhan:  MG(115, '115-mega',   'Mega-Kangaskhan',  'Kangaskhanita',  'kangaskhanite',  ['normal'],              'Amor Filial',    [105, 125, 100, 60, 100, 100]),
  aerodactyl:  MG(142, '142-mega',   'Mega-Aerodactyl',  'Aerodactylita',  'aerodactylite',  ['roca', 'volador'],     'Garra Dura',     [80, 135, 85, 70, 95, 150]),
  mewtwo_y:    MG(150, '150-mega-y', 'Mega-Mewtwo Y',    'Mewtwonita Y',   'mewtwonite-y',   ['psiquico'],            'Insomnio',       [106, 150, 70, 194, 120, 140]),
  steelix:     MG(208, '208-mega',   'Mega-Steelix',     'Steelixita',     'steelixite',     ['acero', 'tierra'],     'Poder Arena',    [75, 125, 230, 55, 95, 30]),
  houndoom:    MG(229, '229-mega',   'Mega-Houndoom',    'Houndoominita',  'houndoominite',  ['siniestro', 'fuego'],  'Poder Solar',    [75, 90, 90, 140, 90, 115]),
  tyranitar:   MG(248, '248-mega',   'Mega-Tyranitar',   'Tyranitarita',   'tyranitarite',   ['roca', 'siniestro'],   'Chorro Arena',   [100, 164, 150, 95, 120, 71]),
  gardevoir:   MG(282, '282-mega',   'Mega-Gardevoir',   'Gardevoirita',   'gardevoirite',   ['psiquico', 'hada'],    'Piel Feérica',   [68, 85, 65, 165, 135, 100]),
  mawile:      MG(303, '303-mega',   'Mega-Mawile',      'Mawilita',       'mawilite',       ['acero', 'hada'],       'Potencia',       [50, 105, 125, 55, 95, 50]),
  manectric:   MG(310, '310-mega',   'Mega-Manectric',   'Manectita',      'manectite',      ['electrico'],           'Intimidación',   [70, 75, 80, 135, 80, 135]),
  camerupt:    MG(323, '323-mega',   'Mega-Camerupt',    'Cameruptita',    'cameruptite',    ['fuego', 'tierra'],     'Potencia Bruta', [70, 120, 100, 145, 105, 20]),
  altaria:     MG(334, '334-mega',   'Mega-Altaria',     'Altarianita',    'altarianite',    ['dragon', 'hada'],      'Piel Feérica',   [75, 110, 110, 110, 105, 80]),
  banette:     MG(354, '354-mega',   'Mega-Banette',     'Banettita',      'banettite',      ['fantasma'],            'Bromista',       [64, 165, 75, 93, 83, 75]),
  glalie:      MG(362, '362-mega',   'Mega-Glalie',      'Glalitita',      'glalitite',      ['hielo'],               'Piel Helada',    [80, 120, 80, 120, 80, 100]),
  latias:      MG(380, '380-mega',   'Mega-Latias',      'Latiasita',      'latiasite',      ['dragon', 'psiquico'],  'Levitación',     [80, 100, 120, 140, 150, 110]),
  latios:      MG(381, '381-mega',   'Mega-Latios',      'Latiosita',      'latiosite',      ['dragon', 'psiquico'],  'Levitación',     [80, 130, 100, 160, 120, 110]),
  lopunny:     MG(428, '428-mega',   'Mega-Lopunny',     'Lopunnita',      'lopunnite',      ['normal', 'lucha'],     'Intrépido',      [65, 136, 94, 54, 96, 135]),
  lucario:     MG(448, '448-mega',   'Mega-Lucario',     'Lucarionita',    'lucarionite',    ['lucha', 'acero'],      'Adaptable',      [70, 145, 88, 140, 70, 112]),
  gallade:     MG(475, '475-mega',   'Mega-Gallade',     'Galladita',      'galladite',      ['psiquico', 'lucha'],   'Foco Interno',   [68, 165, 95, 65, 115, 110]),
  diancie:     MG(719, '719-mega',   'Mega-Diancie',     'Diancita',       'diancite',       ['roca', 'hada'],        'Espejo Mágico',  [50, 160, 110, 160, 110, 110])
};
const megaOf = key => MEGA[key] || null;

// ---- Megapiedras: objetos de la Tienda y del equipo (una por mega) ----
ITEM_CATS.mega = 'Megapiedras';
Object.entries(MEGA).forEach(([k, M]) => {
  const id = 'mega_' + k, nm = DEX[M.dex - 1].name;
  ITEMS[id] = {n:M.stone, img:'megapiedras/' + M.img + '.png', cat:'mega', p:MEGA_PRICE, mega:k,
    d:`Piedra Activadora de ${nm}: con ella equipada y el Mega-Aro, ${nm} megaevoluciona en combate (tecla R) y se convierte en ${M.form}.`,
    og:`En los juegos: ${nm} puede megaevolucionar en ${M.form} durante el combate (una vez por combate).`};
  SHOP.push({id, n:M.stone, d:ITEMS[id].d, p:MEGA_PRICE, cat:'mega'});
});
// ¿puede llevar este Pokémon (nº de Pokédex) ese objeto? Las megapiedras solo valen para su Pokémon (la usa el desplegable de objetos de team.js)
const itemFits = (dex, id) => !(ITEMS[id] && ITEMS[id].mega) || MEGA[ITEMS[id].mega].dex === dex;

// ---------------------------------------------------------------------
// COMBATE
// ---------------------------------------------------------------------
// Prepara a un luchador al empezar el combate (la llama startBattle): f.megaKey = clave de su mega, o null si no puede megaevolucionar
function megaSetup(f, side, tmpl){
  f.megaKey = null; f.megaDone = false; f.megaT = 0;
  const key = side === 'e' ? (tmpl && tmpl.mega) : (f.item && ITEMS[f.item] && ITEMS[f.item].mega);
  const M = key && MEGA[key];
  if(!M || M.dex !== f.m.dex) return;
  if(side !== 'e' && !hasMegaRing()){ f.megaNeedRing = true; return; }          // lleva la piedra pero aún no tiene el Mega-Aro
  f.megaKey = key; preloadSheets(M.folder, f.shiny);                            // descarga ya las hojas de la forma mega
}
// ¿puede megaevolucionar ahora mismo? (el Pokémon del campo, sin cambio ni animación en marcha)
const megaSide = f => g.p.includes(f) ? 'p' : 'e';
const megaUsed = side => !!(g && g.megaUsed && g.megaUsed[side]);                 // UNA megaevolución por combate y por bando (como en los juegos)
function megaCan(f){
  return !!(g && f && f.megaKey && !f.megaDone && !megaUsed(megaSide(f)) && !f.dead && !f.ghost && !g.over && !g.paused && g.count <= 0 && !g.mega && !swapBusy() && (f === g.p[g.pi] || f === g.e[g.ei]));
}
function megaPlayer(){                                                          // tecla R y clic en el hueco MEGA
  if(!g || g.over || g.paused || g.count > 0) return false;
  if(g.pvp){ pvpEvent('mg'); return true; }                                      // combate online: se manda como pulsación (js/pvp.js)
  const P = g.p[g.pi];
  if(megaCan(P)){ megaStart(P); return true; }
  if(P.dead || P.ghost) return false;
  if(P.megaNeedRing) g.pops.push({x:P.x, y:P.y - 150, txt:'¡NECESITAS EL MEGA-ARO!', t:1.4, c:'#ff9a3a', s:10});
  else if(P.megaKey && !P.megaDone && megaUsed('p')) g.pops.push({x:P.x, y:P.y - 150, txt:'¡SOLO UNA MEGA POR COMBATE!', t:1.4, c:'#ff9a3a', s:10});
  return false;
}
function megaStart(f){
  const M = MEGA[f.megaKey];
  (g.megaUsed = g.megaUsed || {})[megaSide(f)] = true;                         // ya no podrá megaevolucionar nadie más de su equipo en este combate
  g.pops = g.pops.filter(p => !/MEGAEVOLUCIÓN LISTA/.test(p.txt));            // quita el cartel «LISTA» (ya no hace falta)
  f.megaDone = true; f.mv = false; f.act = 'Idle'; f.at = 0; f.dash = 0;
  g.mega = {f, M, from:f.m.name, t:0, swapped:false, parts:[], acc:0};
  Sfx.play('mega');
}
// El cambio en sí (ocurre en el destello): sprite, tipos, habilidad, ataque y velocidad. Los PS no cambian.
function megaApply(f){
  const M = MEGA[f.megaKey], o = f.m, b = M.base, atk = Math.max(b[1], b[3]), ok = !sheet(M.folder, 'Idle', false).bad;   // sin sprite de la mega se queda con el de siempre
  f.m = Object.assign({}, o, {dex: ok ? M.folder : o.dex, baseDex: o.dex, name: M.form, types: M.types.slice(), atk, spd: Math.round(110 + b[5] * .8), isMega: true});
  f.dmg *= atk / o.atk;                                                          // el daño conserva lo que ya tenía (IVs, EVs, naturaleza, Intimidación...)
  if(M.ab) f.ab = M.ab;
  const ax = f.ax; abEnter(f); f.ax = ax;                                        // habilidades «al entrar» (Intimidación, Chorro Arena...) vuelven a actuar
}
// Rival: megaevoluciona solo, MEGA_FOE_DELAY segundos después de salir al campo (la llama update)
function megaAI(E, dt){
  if(!E.megaKey || E.megaDone || megaUsed('e') || E.dead || E.ghost || g.mega) return;
  E.megaT += dt; if(E.megaT >= MEGA_FOE_DELAY && megaCan(E)) megaStart(E);
}
// Aviso al empezar el combate: «¡MEGAEVOLUCIÓN LISTA!» sobre tu Pokémon (una vez por Pokémon)
function megaHint(P){
  if(P.megaKey && !P.megaDone && !megaUsed(megaSide(P)) && !P.megaHinted && !P.dead && !P.ghost && !g.mega){ P.megaHinted = true; g.pops.push({x:P.x, y:P.y - 150, txt:'¡MEGAEVOLUCIÓN LISTA! (R)', t:2.4, c:'#ff9ae8', s:10}); }
}

// ---------------------------------------------------------------------
// ANIMACIÓN (estilo Pokémon X/Y): la pantalla se oscurece, la piedra baja una hélice de luz que envuelve al Pokémon, que se vuelve una silueta
// blanca; destello, símbolo mega, ondas arcoíris y chispas, y aparece la forma mega. El combate está parado mientras dura.
// ---------------------------------------------------------------------
const MEGA_T = {flash:1.5, end:2.8};                                             // segundos: momento del destello y final
const hue = (h, a = 1, l = 62) => `hsla(${((h % 360) + 360) % 360},100%,${l}%,${a})`;
const ease3 = x => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
const megaImgs = {};
function megaStoneImg(M){ if(!megaImgs[M.img]){ const im = new Image(); im.ok = false; im.onload = () => im.ok = true; im.src = MEGA_DIR + M.img + '.png'; megaImgs[M.img] = im; } return megaImgs[M.img]; }
let MEGA_OFF = null;

function megaSpark(m, x, y, vx, vy, life, s){ m.parts.push({x, y, vx, vy, life, max: life, h: Math.random() * 360, s: s || (2 + Math.random() * 3)}); }
function megaTick(dt){                                                           // la llama update() mientras dura la animación (el resto del combate no avanza)
  const m = g.mega, f = m.f; m.t += dt;
  fx.shake = Math.max(0, fx.shake - dt * 30);
  const I = idleInfo(f.m.dex), foot = f.y + I.foot * ESCALA;
  if(m.t < MEGA_T.flash){                                                        // chispas que suben desde los pies, cada vez más
    m.acc += dt * (20 + 100 * Math.min(1, m.t / MEGA_T.flash));
    while(m.acc >= 1){ m.acc--; megaSpark(m, f.x + (Math.random() - .5) * 120, foot - Math.random() * 16, (Math.random() - .5) * 30, -(70 + Math.random() * 150), .7 + Math.random() * .6); }
  }
  if(!m.swapped && m.t >= MEGA_T.flash){                                         // DESTELLO: aquí se cambia de forma
    megaApply(f); m.swapped = true; fx.shake = 16;
    for(let i = 0; i < 110; i++){ const a = Math.random() * 7, sp = 140 + Math.random() * 360; megaSpark(m, f.x, f.y, Math.cos(a) * sp, Math.sin(a) * sp, .8 + Math.random() * .8, 2 + Math.random() * 4); }
  }
  m.parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (m.swapped ? 160 : -10) * dt; p.life -= dt; });
  m.parts = m.parts.filter(p => p.life > 0);
  if(m.t >= MEGA_T.end){
    g.pops.push({x: f.x, y: f.y - 150, txt: '¡' + f.m.name.toUpperCase() + '!', t: 1.6, c: '#ff9ae8', s: 12});
    g.mega = null;
  }
}
// Sprite del Pokémon con una capa blanca encima (silueta de luz): se dibuja en un lienzo aparte para que la capa solo cubra al Pokémon
function megaSprite(f, tint, t, sc){
  if(!MEGA_OFF){ MEGA_OFF = document.createElement('canvas'); MEGA_OFF.width = MEGA_OFF.height = 360; }
  const o = MEGA_OFF.getContext('2d'); o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, 360, 360); o.globalCompositeOperation = 'source-over';
  const ok = drawFrame(o, f.m.dex, 'Idle', t, f.dir, 180, 180, ESCALA * sc, 0, f.shiny);
  if(ok && tint > 0){ o.globalCompositeOperation = 'source-atop'; o.fillStyle = `rgba(255,255,255,${Math.min(1, tint)})`; o.fillRect(0, 0, 360, 360); o.globalCompositeOperation = 'source-over'; }
  if(ok) ctx.drawImage(MEGA_OFF, f.x - 180, f.y - 180);
  else { ctx.fillStyle = TC[f.m.types[0]]; ctx.beginPath(); ctx.arc(f.x, f.y, 30 * sc, 0, 7); ctx.fill(); }
}
function megaDraw(){                                                             // dentro del campo (después de los Pokémon, antes del HUD)
  const m = g.mega; if(!m) return;
  const f = m.f, t = m.t, T = MEGA_T, I = idleInfo(f.m.dex), cx = f.x, foot = f.y + I.foot * ESCALA, topY = f.y + I.top * ESCALA, mid = (foot + topY) / 2;
  const out = t > T.flash + .2 ? Math.max(0, 1 - (t - T.flash - .2) / .7) : 1, pre = t < T.flash;
  ctx.save();
  ctx.fillStyle = `rgba(8,5,26,${Math.min(1, t / .35) * out * .68})`; ctx.fillRect(-30, -30, W + 60, H + 60);          // el escenario se oscurece
  ctx.globalCompositeOperation = 'lighter';
  const ramp = Math.min(1, t / T.flash) * out;
  const beam = ctx.createLinearGradient(cx - 60, 0, cx + 60, 0); beam.addColorStop(0, 'rgba(255,255,255,0)'); beam.addColorStop(.5, `rgba(255,240,255,${.5 * ramp})`); beam.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = beam; ctx.fillRect(cx - 60, 0, 120, foot + 6);                                                         // columna de luz
  for(let i = 0; i < 14; i++){                                                                                           // rayos que giran
    const a = i * Math.PI * 2 / 14 + t * .9, w = .07;
    ctx.fillStyle = hue(i * 26 + t * 140, .13 * ramp, 60); ctx.beginPath(); ctx.moveTo(cx, mid); ctx.lineTo(cx + Math.cos(a - w) * 520, mid + Math.sin(a - w) * 520); ctx.lineTo(cx + Math.cos(a + w) * 520, mid + Math.sin(a + w) * 520); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  shadow(cx, foot - 2, Math.max(30, I.fw * ESCALA * .42));
  if(pre){                                                                                                               // la silueta se vuelve blanca y late
    megaSprite(f, ease3((t - .3) / .9) * .95, t, 1 + Math.sin(t * 14) * .02 * ramp);
  } else {                                                                                                               // ya es mega: nace con un resplandor que se apaga
    const k = Math.max(0, 1 - (t - T.flash) / .55);
    megaSprite(f, k * .95, t, 1 + .12 * k);
  }
  ctx.globalCompositeOperation = 'lighter';
  if(pre){                                                                                                               // piedra + hélice de luz (dos hilos trenzados)
    const sy = Math.max(70, topY - 90) + Math.sin(t * 5) * 4, st = megaStoneImg(m.M), appear = ease3(t / .35);
    const gl = ctx.createRadialGradient(cx, sy, 4, cx, sy, 70); gl.addColorStop(0, `rgba(255,255,255,${.9 * appear})`); gl.addColorStop(.4, hue(t * 200, .35 * appear)); gl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gl; ctx.fillRect(cx - 80, sy - 80, 160, 160);
    const grow = ease3((t - .12) / .6), y0 = sy + 26, y1 = topY + 8;
    for(let j = 0; j < 2; j++){
      ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      let px = null, py = null;
      for(let k = 0; k <= 40 * grow; k++){
        const s = k / 40, x = cx + Math.sin(s * 12.5 + t * 9 + j * Math.PI) * 20 * (1 - s * .45), y = y0 + (y1 - y0) * s;
        if(px !== null){ ctx.strokeStyle = hue(s * 320 + t * 260 + j * 150, .9); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke(); }
        px = x; py = y;
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    if(st.ok){ ctx.imageSmoothingEnabled = false; ctx.globalAlpha = appear; ctx.drawImage(st, cx - 34, sy - 34, 68, 68); ctx.globalAlpha = 1; }
    ctx.globalCompositeOperation = 'lighter';
    for(let i = 0; i < 12; i++){                                                                                         // anillo de luces alrededor del Pokémon
      const a = i * Math.PI / 6 + t * 3.2, r = 66 + 10 * Math.sin(t * 6 + i);
      ctx.fillStyle = hue(i * 30 + t * 220, .85 * Math.min(1, t / .6)); ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, mid + Math.sin(a) * r * .38, 4, 0, 7); ctx.fill();
    }
  }
  const sa = t - (T.flash - .5), symA = sa > 0 ? Math.min(1, sa / .4) * out : 0;                                         // símbolo mega: dos anillos ondulados entrelazados
  if(symA > 0){
    for(let k = 0; k < 2; k++){
      ctx.lineWidth = 3; ctx.strokeStyle = hue(k * 180 + t * 200, .9 * symA); ctx.beginPath();
      for(let a = 0; a <= 6.4; a += .1){ const r = 64 + 9 * Math.sin(a * 3 + k * Math.PI + t * 5), x = cx + Math.cos(a + t * 1.2) * r, y = mid + Math.sin(a + t * 1.2) * r; a ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
  }
  if(!pre){                                                                                                              // ondas arcoíris que salen del destello
    for(let i = 0; i < 4; i++){ const k = (t - T.flash - i * .13) / .8; if(k <= 0 || k >= 1) continue;
      ctx.lineWidth = 6 * (1 - k); ctx.strokeStyle = hue(i * 90 + t * 200, .85 * (1 - k)); ctx.beginPath(); ctx.arc(cx, mid, 30 + ease3(k) * 330, 0, 7); ctx.stroke(); }
  }
  m.parts.forEach(p => { ctx.fillStyle = hue(p.h + t * 120, Math.min(1, p.life / p.max * 1.4)); ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (.4 + .6 * p.life / p.max), 0, 7); ctx.fill(); });
  ctx.restore();
}
function megaTop(){                                                              // encima de todo: el destello blanco de la pantalla y el cartel
  const m = g.mega; if(!m) return;
  const t = m.t, T = MEGA_T, fl = t < T.flash - .3 ? 0 : t < T.flash ? (t - (T.flash - .3)) / .3 : Math.max(0, 1 - (t - T.flash) / .55);
  if(fl > 0){ ctx.fillStyle = `rgba(255,255,255,${Math.min(1, fl)})`; ctx.fillRect(0, 0, W, H); }
  const bt = t - (T.flash + .15);
  if(bt > 0){
    ctx.save(); ctx.globalAlpha = Math.min(1, bt / .25) * Math.min(1, (T.end - t) / .35);
    text(`¡${m.from.toUpperCase()} HA MEGAEVOLUCIONADO!`, W / 2, H * .2, 12, '#ffd9fb', 'center');
    text(m.f.m.name.toUpperCase(), W / 2, H * .2 + 34, 20, '#ff9ae8', 'center');
    ctx.restore();
  }
}

// ---- Hueco «MEGAEVOLUCIÓN» en la barra de ataques (a la derecha de los 5 ataques; se puede pulsar) ----
// Sale cuando el Pokémon del campo lleva su Megapiedra. Tres estados: LISTA (brilla), YA USADA (otro de tu equipo ya megaevolucionó) y SIN MEGA-ARO.
function megaBadgeRect(){                                                        // posición EN PANTALLA (mundo del juego) para el clic, igual que la barra de ataques (render.js)
  const k = HUD_SCALE, tw = 5 * 104 + 4 * 8 + 24, x0 = (W - tw) / 2, y0 = H - 82, lx = x0 + tw + 8, ly = y0, lw = 112, lh = 72;
  return {x: W / 2 + (lx - W / 2) * k, y: H + (ly - H) * k, w: lw * k, h: lh * k, lx, ly, lw, lh};
}
function megaBadgeState(){                                                       // 'ready' | 'used' | 'noring' | null (no se enseña)
  const P = g && myMon(); if(!P || P.dead || g.over || g.mega) return null;
  if(P.megaKey && !P.megaDone) return megaUsed(meSide()) ? 'used' : 'ready';
  if(P.megaNeedRing) return 'noring';
  return null;
}
function megaBadgeOn(){ return megaBadgeState() === 'ready' && g.count <= 0; }
function megaBadgeAt(mx, my){ if(!megaBadgeState()) return false; const r = megaBadgeRect(); return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h; }
function megaHud(){                                                              // la llama draw() al final
  const st = megaBadgeState(); if(!st) return;
  const P = myMon(), r = megaBadgeRect(), t = performance.now() / 1000, hov = megaBadgeAt(mouse.x, mouse.y), ok = st === 'ready';
  hudAt(W / 2, H, () => {
    hudBox(r.lx, r.ly, r.lw, r.lh, ok ? hue(t * 180, .6 + .4 * Math.sin(t * 6)) : '#2c3550');
    if(hov && ok){ ctx.fillStyle = 'rgba(255,154,232,.12)'; ctx.fillRect(r.lx + 2, r.ly + 2, r.lw - 4, r.lh - 4); }
    ctx.fillStyle = ok ? '#ffcc33' : '#2c3550'; ctx.fillRect(r.lx + 8, r.ly + 8, 12, 12);                       // tecla R
    text('R', r.lx + 10, r.ly + 18, 7, '#10141e');
    const im = itemImg(P.item);
    if(im && im.ok){ ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = ok ? 1 : .35; ctx.drawImage(im, r.lx + r.lw / 2 - 17, r.ly + 12, 34, 34); ctx.restore(); }
    text('MEGA', r.lx + r.lw / 2, r.ly + 58, 8, ok ? '#ffd9fb' : '#6d7899', 'center');
    text(ok ? 'EVOLUCIÓN' : st === 'used' ? 'YA USADA' : 'SIN MEGA-ARO', r.lx + r.lw / 2, r.ly + 68, 6, ok ? '#ff9ae8' : '#6d7899', 'center');
  });
}
