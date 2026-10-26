"use strict";
/* =====================================================================
   11) GACHAPON MULTI-REGIÓN ANIMADO
   - renderGacha(): pantalla con pestañas de región, banner, botones y probabilidades.
   - playPull(): capa de animación (máquina -> cápsula cae -> se abre -> Pokémon).
   Las reglas (tiradas, pity, garantías, repetidos) viven en economy.js: pullGacha().
   ===================================================================== */
const REG_COL = {Kanto:'#e23b3b', Johto:'#ffcc33', Hoenn:'#3ea6ff', Sinnoh:'#9aa6ff', Teselia:'#f0e03a',
                 Kalos:'#ff7ac8', Alola:'#ff9a3a', Galar:'#c05cff', Paldea:'#4ccf6a'};
const gx = {sel:null, res:[], mode:'one', t0:0, timers:[], dex:0, shiny:false, anim:false};

// Dibuja un icono de ticket (usa el mismo bitmap que el menú)
function ticketIcon(c, col){ bitmap(c, ICONS.ticket, col); }

// ---- Pantalla principal del Gachapon ----
function openGacha(){
  if(!REGION_DEX[save.gachaRegion]) save.gachaRegion = 'Kanto';
  if(!gx.built){
    $('gachav').innerHTML = `<canvas id="gcBg"></canvas><div class="dx gc">
      <header class="dxh"><button id="gcBack">← Menú</button><h1>Gachapon</h1><span id="gcTop"></span></header>
      <div id="gcTabs" class="tabs"></div>
      <div class="dxc gcc"><section id="gcLeft"></section><aside id="gcRight" class="ddet"></aside></div></div>`;
    $('gcBack').onclick = goMain;
    $('gcTabs').onclick = e => { const b = e.target.closest('.tab'); if(b){ save.gachaRegion = b.dataset.r; persist(); renderGacha(); } };
    $('gcLeft').onclick = e => {
      if(e.target.closest('.gm-box')){ gcShake(); return; }                         // tocar la máquina solo la agita (no gasta tickets)
      const b = e.target.closest('[data-mode]'); if(b && !b.disabled) startPull(b.dataset.mode); };
    $('gOv').onclick = e => {
      const b = e.target.closest('[data-g]'); if(!b) return;
      if(b.dataset.g === 'skip') showStage('reveal');
      if(b.dataset.g === 'sum') showSummary();
      if(b.dataset.g === 'close') closeOverlay();
    };
    gx.built = true;
  }
  renderGacha(); show('gachav');
}

function renderGacha(){
  const reg = save.gachaRegion, [a, b] = REGION_DEX[reg], total = regionSize(a, b), col = REG_COL[reg];
  $('gachav').style.setProperty('--c', col);
  $('gcTop').innerHTML = `<i class="gchip">🎟 <b>${save.tickets}</b> tickets</i><i class="gchip sp">🌟 <b>${save.ticketsL}</b> especiales</i><i class="gchip">🪙 <b>${save.bp}</b> PB</i>`;
  $('gcTabs').innerHTML = REGIONS_DEX.map(r =>
    `<button class="tab${r.n === reg ? ' on' : ''}" style="--rc:${REG_COL[r.n]}" data-r="${r.n}">${r.n} <small>${ownedIn(r.n)}/${regionSize(r.a, r.b)}</small></button>`).join('');

  // Destacados del banner: primero legendarias, luego épicas (máx. 6)
  const feat = [...pool(reg, 'legendary'), ...pool(reg, 'epic')].slice(0, 6);
  const btn = (mode, label, n, l) => `<button class="gb${mode === 'special' ? ' sp' : ''}" data-mode="${mode}" ${canPull(mode) ? '' : 'disabled title="No tienes tickets suficientes"'}>
      <span>${label}</span><em><canvas class="ic" data-sp="${l ? 1 : 0}" width="16" height="16"></canvas><b>${l || n}</b></em></button>`;
  const pity = pityOf(reg), hot = pity >= PITY_MAX - 1;
  gx.hp = gx.hp || domePile(Math.random() * 4294967296);
  $('gcLeft').innerHTML = `
    <div class="banner" style="--c:${col}">
      <div class="gm"><i class="gm-halo"></i>
        <div class="gm-box" id="gcMachBox" title="¡Tócala!"><canvas id="gcMach"></canvas>
          <div class="dome" id="gcDome">${gx.hp.map(p => `<img class="db" alt="" src="${ballURL(p.type)}">`).join('')}<i class="glass"></i></div></div>
        <i class="gm-floor"></i><span class="gm-tag">¡Tócala!</span></div>
      <div class="bn-main">
        <div class="bn-h"><h2>${BANNERS[reg]}</h2>
          <div class="cnt"><span><b>${ownedIn(reg)}</b> de ${total}</span><span class="shn">⭐ ${shinyIn(reg)} shiny</span></div></div>
        <p class="bn-sub">Destacados del banner</p>
        <div class="feat">${feat.map((d, i) => `<div class="fc${DEX[d-1].rar === 'legendary' ? ' lg' : ''}${own(d) ? ' got' : ''}" style="--c:${RAR[DEX[d-1].rar].col};--i:${i}"><canvas data-d="${d}" width="128" height="128"></canvas>
          <i>${RAR[DEX[d-1].rar].ic} ${esc(DEX[d-1].name)}</i></div>`).join('') || '<p>Sin destacados en esta región.</p>'}</div>
        <div class="gbar">${btn('one', 'Tirar x1', 1, 0)}${btn('ten', 'Tirar x10', 10, 0)}${btn('special', 'Tirar x10 especial', 0, 1)}</div>
        <div class="pity-box${hot ? ' hot' : ''}">
          <div class="pity-h"><span>Garantía de legendaria</span><b>${pity} / ${PITY_MAX}</b></div>
          <div class="pbar"><i style="width:${Math.min(100, pity / PITY_MAX * 100)}%"></i></div>
          <small>${hot ? '¡La próxima tirada es legendaria!' : `Legendaria asegurada en ${PITY_MAX - pity} tiradas como máximo`}</small></div>
      </div>
    </div>`;
  drawMachine($('gcMach'));
  $('gcLeft').querySelectorAll('canvas.ic').forEach(c => ticketIcon(c, c.dataset.sp === '1' ? '#1b1500' : '#ffffff'));
  $('gcLeft').querySelectorAll('.fc canvas').forEach(c => paintSprite(c, +c.dataset.d, {sc:8, fit:150}));
  gcStart(col);

  const row = r => { const n = pool(reg, r.id).length, have = pool(reg, r.id).filter(own).length;
    return `<tr style="--c:${r.col}"><td>${r.ic} ${r.n}</td><td class="pc">${(GACHA_RATES[r.id] * 100).toFixed(0)}%</td><td>${have}/${n}</td></tr>`; };
  $('gcRight').style.setProperty('--c', col);
  $('gcRight').innerHTML = `<h3>Probabilidades</h3>
    <table class="ptbl"><tr><th>Rareza</th><th>Prob.</th><th>Tienes</th></tr>${RARITIES.map(row).join('')}
      <tr style="--c:#fff"><td>⭐ Shiny</td><td class="pc">${(shinyRate(reg) * 100).toFixed(0)}%${save.charms[reg] ? ' 🌈' : ''}</td><td>${shinyIn(reg)}/${total}</td></tr></table>
    <h3>Reglas</h3>
    <ul class="rules">
      <li>La tirada <b>x10 especial</b> garantiza una <b>Legendaria</b>.</li>
      <li><b>Pity:</b> a las ${PITY_MAX} tiradas sin legendaria, la siguiente lo es (se cuenta por región).</li>
      <li>El <b>shiny</b> puede salir con cualquier rareza.</li>
      <li>${save.charms[reg] ? `🌈 Tienes el <b>Amuleto Arcoíris de ${reg}</b>: shiny al ${(CHARM_RATE * 100).toFixed(0)}% en esta región.` : `🌈 Completa la Pokédex de ${reg} y ganarás su <b>Amuleto Arcoíris</b>: el shiny sube del ${(SHINY_RATE * 100).toFixed(0)}% al ${(CHARM_RATE * 100).toFixed(0)}% en esta región.`}</li>
      <li>Los <b>repetidos</b> te dan monedas (PB): ${RARITIES.map(r => r.ic + ' ' + DUP_BP[r.id]).join(' · ')}.</li>
      <li>Los tickets se consiguen <b>jugando</b>: la primera vez que vences a cada líder te dan uno. También puedes comprarlos en la tienda.</li>
    </ul>`;
}

// ---------------------------------------------------------------------
// VIDA DE LA PANTALLA (solo adorno): fondo con partículas, bolas que se mueven dentro de la máquina y destacados animados.
// Se detiene sola cuando la pantalla se oculta o mientras hay una tirada en marcha.
// ---------------------------------------------------------------------
const GC = {raf:0, tok:0, shake:0, motes:null, balls:{}};
function gcStop(){ if(GC.raf) cancelAnimationFrame(GC.raf); GC.raf = 0; GC.tok++; }
function gcShake(){
  GC.shake = 1; const b = $('gcMachBox'); if(!b) return;
  b.classList.remove('clunk'); void b.offsetWidth; b.classList.add('clunk');
}
function gcStart(col){
  gcStop(); const tok = GC.tok;
  const bg = $('gcBg'), dome = $('gcDome'), imgs = dome ? [...dome.querySelectorAll('.db')] : [], pile = gx.hp,
        feats = [...$('gcLeft').querySelectorAll('.fc canvas')], RM = matchMedia('(prefers-reduced-motion:reduce)').matches,
        rn = (a, b) => a + Math.random() * (b - a);
  if(!GC.motes){                                                               // partículas: posiciones como fracción de la pantalla
    GC.motes = Array.from({length: 46}, (_, i) => ({x: Math.random(), y: Math.random(), v: rn(.012, .04), s: rn(2, 4), f: rn(.4, 1.2), ph: rn(0, 6.28),
      a: rn(.01, .03), k: i < 12 ? 'ball' : i < 30 ? 'star' : 'dot', t: DOME_MIX[i % DOME_MIX.length], w: Math.random() < .5}));
  }
  const ballImg = t => { if(!GC.balls[t]){ const im = new Image(); im.src = ballURL(t); GC.balls[t] = im; } return GC.balls[t]; };
  const order = pile.map((p, i) => i).sort((a, b) => pile[a].y - pile[b].y); order.forEach((i, z) => { if(imgs[i]) imgs[i].style.zIndex = z + 1; });
  const place = (i, x, y, rot) => { const im = imgs[i]; if(!im) return;
    im.style.left = ((x - BALL_R - (DOME.cx - DOME.rx)) / (DOME.rx * 2) * 100) + '%';
    im.style.top = ((y - BALL_R - (DOME.cy - DOME.ry)) / (DOME.ry * 2) * 100) + '%'; im.style.transform = `rotate(${rot}deg)`; };
  let last = performance.now(), tf = 0;

  function draw(now, dt){
    const ts = now / 1000;
    // 1) Bolas dentro de la cúpula (se agitan al tocar la máquina)
    GC.shake = Math.max(0, GC.shake - dt * .9);
    const ag = GC.shake, amp = RM ? .1 : .3 + ag * .9;
    pile.forEach((p, i) => {
      const hop = RM ? 0 : ag * Math.max(0, Math.sin(ts * p.f * 5 + p.ph)) * 1.7;
      place(i, p.x + Math.sin(ts * p.f * 1.3 + p.ph) * amp, p.y + Math.sin(ts * p.f + p.ph2) * amp * .6 - hop,
            p.rot + Math.sin(ts * p.f * 2 + p.ph) * (3 + ag * (RM ? 0 : 14)));
    });
    // 2) Fondo: bolas, destellos y puntitos que suben despacio
    if(bg){
      const W = bg.clientWidth, H = bg.clientHeight;
      if(bg.width !== W) bg.width = W; if(bg.height !== H) bg.height = H;
      const x = bg.getContext('2d'); x.clearRect(0, 0, W, H); x.imageSmoothingEnabled = false;
      GC.motes.forEach(m => {
        if(!RM){ m.y -= m.v * dt; if(m.y < -.05){ m.y = 1.05; m.x = Math.random(); } }
        const px = m.x * W + Math.sin(ts * m.f + m.ph) * m.a * W, py = m.y * H, tw = .5 + .5 * Math.sin(ts * m.f * 2 + m.ph);
        if(m.k === 'ball'){ const im = ballImg(m.t), s = m.s * 7; if(im.complete){ x.globalAlpha = .13 + .08 * tw; x.drawImage(im, Math.round(px - s / 2), Math.round(py - s / 2), s, s); } }
        else if(m.k === 'star'){ const s = m.s * 1.6; x.globalAlpha = .12 + .55 * tw; x.fillStyle = m.w ? '#ffffff' : col;
          x.fillRect(Math.round(px - 1), Math.round(py - s), 2, s * 2); x.fillRect(Math.round(px - s), Math.round(py - 1), s * 2, 2); }
        else{ x.globalAlpha = .1 + .3 * tw; x.fillStyle = m.w ? '#cfe3ff' : col; x.fillRect(Math.round(px), Math.round(py), m.s, m.s); }
      });
      x.globalAlpha = 1;
    }
    // 3) Destacados: se mueven con su animación de reposo (unas 8 veces por segundo)
    if((tf += dt) >= .12){ tf = 0;
      feats.forEach(c => { const d = +c.dataset.d, im = sheet(d, 'Idle', false); if(!im.ok) return;
        const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height); drawFrame(x, d, 'Idle', ts, 0, c.width / 2, c.height / 2 + 2, 8, 150, false); });
    }
  }
  function frame(now){
    if(GC.tok !== tok) return;
    if($('gachav').classList.contains('hide')){ GC.raf = 0; return; }            // pantalla oculta: se para (openGacha la vuelve a arrancar)
    GC.raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if(!gx.anim) draw(now, dt);
  }
  draw(last, .016);                                                            // primer cuadro ya pintado (aunque aún no corra la animación)
  GC.raf = requestAnimationFrame(frame);
}

// ---------------------------------------------------------------------
// ANIMACIÓN
// ---------------------------------------------------------------------
// Máquina de Gachapon en pixel art (40x56 píxeles, se escala con CSS sin suavizado).
// Las Poké Balls de dentro de la cúpula NO se dibujan aquí: son imágenes que se mueven por encima (ver domePile / startEngine).
function drawMachine(c){
  c.width = 40; c.height = 56; const x = c.getContext('2d');
  const R = (px, py, w, h, col) => { x.fillStyle = col; x.fillRect(px, py, w, h); };
  for(let j = 0; j < 26; j++) for(let i = 0; i < 40; i++){                       // cúpula de cristal (elipse)
    const dx = (i - 19.5) / 16, dy = (j - 14) / 12.5, d = dx * dx + dy * dy;
    if(d <= 1) R(i, j, 1, 1, d > .86 ? '#0a0d14' : (i < 12 && j < 12 && d > .55 ? '#e8f6ff' : '#a8dcff'));
  }
  R(3, 26, 34, 24, '#0a0d14'); R(4, 27, 32, 22, '#d12f2f'); R(4, 27, 32, 3, '#ff6a5a');   // cuerpo rojo
  R(4, 46, 32, 3, '#8f1c1c');
  R(12, 34, 16, 14, '#0a0d14'); R(13, 35, 14, 12, '#05070c');                    // boca de salida
  R(30, 30, 5, 5, '#0a0d14'); R(31, 31, 3, 3, '#ffcc33');                        // palanca
  R(6, 31, 6, 2, '#ffcc33'); R(6, 35, 6, 2, '#e8eefc');                          // adornos
  R(5, 50, 8, 5, '#0a0d14'); R(27, 50, 8, 5, '#0a0d14');                         // patas
}

// ---- Poké Balls en pixel art (16x16), una por rareza ----
//  Común = Poké Ball roja/blanca · Poco común = Superball azul/roja · Rara = Ultra Ball negra/amarilla
//  Épica = Honor Ball blanca/roja · Legendaria = Master Ball morada · Shiny = Poké Ball dorada metálica
const BALLS = {
  common:   {top:'#e23b3b', hi:'#ff9d8c', bot:'#eef1f8', btn:'#ffffff'},
  uncommon: {top:'#3b7be2', hi:'#9cc8ff', bot:'#eef1f8', btn:'#ffffff', mark:'#e23b3b'},
  rare:     {top:'#2a2d38', hi:'#7a8298', bot:'#eef1f8', btn:'#ffffff', mark:'#ffd23a'},
  epic:     {top:'#f6f7fb', hi:'#ffffff', bot:'#f6f7fb', btn:'#e23b3b', mark:'#e23b3b'},
  legendary:{top:'#8a3fd1', hi:'#cf9bff', bot:'#efe6fb', btn:'#ffffff', mark:'#ff9ad5'},
  shiny:    {top:'#ffbe1a', hi:'#fff3a0', bot:'#ffe58a', btn:'#fff3b0', gold:true}
};
const BALL_URL = {};
function ballURL(type){
  if(BALL_URL[type]) return BALL_URL[type];
  const B = BALLS[type], N = 16, c = document.createElement('canvas'); c.width = c.height = N;
  const x = c.getContext('2d'), K = '#0a0d14';
  const mix = (h, f) => { const n = parseInt(h.slice(1), 16); return '#' + [16, 8, 0].map(s => Math.round(((n >> s) & 255) * (1 - f)).toString(16).padStart(2, '0')).join(''); };
  const lerpC = (a, b, t) => { const p = parseInt(a.slice(1), 16), q = parseInt(b.slice(1), 16);
    return '#' + [16, 8, 0].map(s => Math.round(((p >> s) & 255) * (1 - t) + ((q >> s) & 255) * t).toString(16).padStart(2, '0')).join(''); };
  const M_ = ['X...X', 'XX.XX', 'X.X.X'];                                      // la "M" de la Master Ball
  for(let j = 0; j < N; j++) for(let i = 0; i < N; i++){
    const dx = i - 7.5, dy = j - 7.5, d = Math.hypot(dx, dy); if(d > 7.9) continue;
    const top = dy < 0; let col;
    if(d > 6.9) col = K;                                                       // contorno
    else if(d <= 2.7){ col = d > 1.7 ? K : B.btn; }                            // botón central
    else if(Math.abs(dy) < 1) col = K;                                         // franja central
    else{
      col = top ? B.top : B.bot;
      if(B.gold) col = top ? lerpC('#ffe27a', '#e49a00', Math.min(1, (7.5 + dy) / 7)) : lerpC('#fff0b0', '#ffc93a', Math.min(1, dy / 7));
      if(top && dx + dy < -7 && d < 6.4) col = B.hi;                           // brillo (luz arriba a la izquierda)
      if(dx + dy > 6.5 && d > 4.8) col = mix(col, .28);                        // sombra abajo a la derecha
      if(type === 'uncommon' && top && (dy === -2.5 || dy === -3.5) && Math.abs(dx) >= 3.5 && Math.abs(dx) <= 5.5) col = B.mark;
      if(type === 'rare' && top && Math.abs(dx) === 3.5 && dy <= -3.5 && dy >= -5.5) col = B.mark;
      if(type === 'epic' && top && dy === -2.5 && Math.abs(dx) <= 4.5) col = B.mark;
      if(type === 'legendary' && top){
        if(Math.abs(dx) === 4.5 && (dy === -4.5 || dy === -3.5)) col = B.mark;
        if(dy >= -5.5 && dy <= -3.5 && Math.abs(dx) <= 2.5 && M_[dy + 5.5][dx + 2.5] === 'X') col = B.mark;
      }
      if(B.gold && d < 6.4 && (((dx + dy === -6 || dx + dy === -5) && top) || (dx + dy === 3 && !top))) col = '#fffbe0';   // reflejos metálicos
    }
    x.fillStyle = col; x.fillRect(i, j, 1, 1);
  }
  x.fillStyle = '#ffffff'; x.fillRect(4, 3, 2, 1);                             // destello
  return BALL_URL[type] = c.toDataURL();
}

// ---- Montón de Poké Balls dentro de la cúpula (se colocan "cayendo" hasta apilarse, con pseudoaleatorio fijo) ----
const DOME = {cx:19.5, cy:14, rx:14.8, ry:11.6}, BALL_R = 2.9;                  // interior del cristal, en píxeles de la máquina
const DOME_MIX = ['common', 'common', 'common', 'common', 'uncommon', 'uncommon', 'rare', 'rare', 'epic', 'legendary', 'shiny'];
function domePile(seed){
  let s = seed >>> 0;
  const rnd = () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const P = DOME_MIX.map(type => ({type, x: DOME.cx + (rnd() - .5) * 18, y: DOME.cy + (rnd() - .5) * 10,
    ph: rnd() * 6.28, ph2: rnd() * 6.28, f: .8 + rnd() * .7, rot: (rnd() - .5) * 40}));
  for(let it = 0; it < 170; it++){
    P.forEach(p => { p.y += .25; });                                           // gravedad
    for(let a = 0; a < P.length; a++) for(let b = a + 1; b < P.length; b++){   // no se solapan
      const A = P[a], B = P[b], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || .01, min = BALL_R * 1.9;
      if(d < min){ const k = (min - d) / 2 / d; A.x -= dx * k; A.y -= dy * k; B.x += dx * k; B.y += dy * k; } }
    P.forEach(p => {                                                           // y se quedan dentro del cristal
      const rx = DOME.rx - BALL_R, ry = DOME.ry - BALL_R, ex = (p.x - DOME.cx) / rx, ey = (p.y - DOME.cy) / ry, e = Math.hypot(ex, ey);
      if(e > 1){ p.x = DOME.cx + ex / e * rx; p.y = DOME.cy + ey / e * ry; } });
  }
  return P;
}

function ovHtml(){
  const pile = gx.pile = domePile(Math.random() * 4294967296), bt = ballURL(gx.ballType);
  $('gOv').innerHTML = `<div class="stage"><i class="gfloor"></i>
    <div class="mach" id="gMachBox"><canvas id="gMach"></canvas>
      <div class="dome" id="gDome">${pile.map(p => `<img class="db" alt="" src="${ballURL(p.type)}">`).join('')}<i class="glass"></i></div>
      <i class="slotglow"></i></div>
    <i class="bshadow" id="gShadow"></i><i class="fxb" id="gFxB"></i><i class="aura" id="gAura"></i>
    <div class="gball k-${gx.ballType}" id="gBall"><div class="bi"><img class="bh bt" alt="" src="${bt}"><img class="bh bb" alt="" src="${bt}"><i class="bsh"></i></div></div>
    <div class="fx" id="gFx"></div>
    <div class="flash"></div><div class="sparks" id="gSparks"></div>
    <div class="rev"><div class="rv-box"><canvas id="gSpr" width="256" height="256"></canvas></div>
      <span class="rb" id="gRar"></span><h2 id="gName"></h2><p id="gTag"></p></div>
    <div class="sum" id="gSum"></div></div>
    <div class="obtn" id="gBtns"></div>`;
  drawMachine($('gMach'));
}
function showStage(s){
  const ov = $('gOv'); ov.dataset.stage = s;
  if(s === 'reveal'){ gx.timers.forEach(clearTimeout); gx.timers = []; stopEngine(); gx.anim = false; gx.t0 = performance.now(); paintReveal();
    $('gBtns').innerHTML = (gx.res.length > 1 ? '<button class="main" data-g="sum">Ver las 10 tiradas</button>' : '') +
      `<button data-g="close">${gx.res.length > 1 ? 'Cerrar' : 'Continuar'}</button>`; }
  else if(s === 'summary') $('gBtns').innerHTML = '<button data-g="close">Cerrar</button>';
  else if(!$('gBtns').querySelector('[data-g=skip]')) $('gBtns').innerHTML = '<button data-g="skip">Saltar ⏭</button>';   // el botón se queda quieto durante la animación
}
// Mejor resultado de la tanda: mayor rareza; el shiny desempata
function bestOf(res){ return res.reduce((b, r) => (RAR[r.rarity].rank < RAR[b.rarity].rank ||
  (RAR[r.rarity].rank === RAR[b.rarity].rank && r.shiny && !b.shiny)) ? r : b, res[0]); }

// ---- Efectos de partículas (se crean con la Web Animations API y se borran solos) ----
const FX_COL = {uncommon:'#6cc6ff', rare:'#ffd23a', epic:'#e23b3b', legendary:'#a855f7', shiny:'#ffd23a'};
function fxPt(box, o){
  const el = document.createElement('i'); el.className = 'pt ' + (o.shape || 'dot');
  el.style.cssText = `left:${o.x - o.w / 2}px;top:${o.y - (o.h || o.w) / 2}px;width:${o.w}px;height:${o.h || o.w}px;background:${o.bg};` + (o.glow ? `box-shadow:0 0 ${o.glow}px ${o.bg};` : '');
  box.appendChild(el);
  const rot = o.rot || 0, a = el.animate([
    {transform:'translate(0,0) rotate(0deg) scale(1)', opacity:1},
    {transform:`translate(${o.dx * .55}px,${o.dy * .55 - (o.up || 0)}px) rotate(${rot * .5}deg) scale(1)`, opacity:1, offset:.45},
    {transform:`translate(${o.dx}px,${o.dy}px) rotate(${rot}deg) scale(.2)`, opacity:0}],
    {duration:o.dur, delay:o.delay || 0, easing:'cubic-bezier(.2,.6,.4,1)', fill:'backwards'});
  a.onfinish = () => el.remove();
}
function fxRing(box, x, y, size, col, dur, delay, flat){                       // onda de choque (elipse aplastada = suelo en perspectiva)
  const el = document.createElement('i'); el.className = 'pt ring';
  el.style.cssText = `left:${x - size / 2}px;top:${y - size * flat / 2}px;width:${size}px;height:${size * flat}px;border-color:${col};box-shadow:0 0 ${size * .12}px ${col}`;
  box.appendChild(el);
  el.animate([{transform:'scale(.15)', opacity:.9}, {transform:'scale(1)', opacity:0}], {duration:dur, delay:delay || 0, easing:'ease-out', fill:'backwards'}).onfinish = () => el.remove();
}
function fxGlow(box, x, y, size, col, dur, peak){                              // destello suave (va DETRÁS de la bola)
  const el = document.createElement('i'); el.className = 'pt glow';
  el.style.cssText = `left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;background:radial-gradient(circle,${col} 0,${col}00 68%)`;
  box.appendChild(el);
  el.animate([{transform:'scale(.2)', opacity:peak}, {transform:'scale(1)', opacity:0}], {duration:dur, easing:'ease-out'}).onfinish = () => el.remove();
}
// Efecto del golpe contra el suelo según la rareza. k = intensidad (1 = golpe principal, menos en los rebotes)
function impactFx(kind, x, y, q, k, flat, rm){
  const fx = $('gFx'), fb = $('gFxB'); if(!fx || !fb) return;
  const rn = (a, b) => a + Math.random() * (b - a), n = m => Math.max(1, Math.round(m * k * (rm ? .5 : 1)));
  const fan = (cnt, o) => { for(let i = 0; i < cnt; i++){ const a = rn(-3.1, 0.05) + (o.all ? rn(0, 3.1) : 0), v = rn(o.v0, o.v1) * q;
    fxPt(fx, {x:x + rn(-1, 1) * q * .8, y, w:o.w * q * rn(.7, 1.2), bg:o.cols[i % o.cols.length], glow:o.glow, shape:o.shape, rot:rn(-200, 200),
      dx:Math.cos(a) * v, dy:Math.sin(a) * v * .4 + o.fall * q, up:o.up * q * rn(.6, 1.2), dur:rn(o.d0, o.d1)}); } };
  if(kind === 'common'){                                                      // golpe simple: un poco de polvo
    fan(n(7), {cols:['rgba(235,240,250,.8)', 'rgba(200,210,226,.75)'], v0:2, v1:5, w:1.1, fall:.2, up:.9, d0:450, d1:700});
    fxRing(fb, x, y, 8 * q * k, 'rgba(255,255,255,.4)', 400, 0, flat);
  }else if(kind === 'uncommon'){                                              // destello azul claro
    fxGlow(fb, x, y - q, 17 * q * k, '#6cc6ff', 520, .85);
    fxRing(fb, x, y, 11 * q * k, '#8fd8ff', 520, 0, flat);
    fan(n(6), {cols:['#d6f0ff', '#6cc6ff'], v0:2, v1:5, w:.8, glow:8, shape:'dot', fall:.6, up:1.8, d0:500, d1:750});
  }else if(kind === 'rare'){                                                  // pequeñas chispas amarillas
    fxGlow(fb, x, y - q, 11 * q * k, '#ffd23a', 400, .55);
    fan(n(14), {cols:['#ffd23a', '#fff1a0', '#ffb81c'], v0:3.5, v1:8.5, w:.75, glow:7, shape:'sq', fall:2.6, up:4, d0:650, d1:1000});
  }else if(kind === 'epic'){                                                  // partículas blancas y rojas
    fxGlow(fb, x, y - q, 12 * q * k, '#ffffff', 450, .45);
    fxRing(fb, x, y, 11 * q * k, '#ffffff', 540, 0, flat); fxRing(fb, x, y, 15 * q * k, '#e23b3b', 620, 90, flat);
    fan(n(18), {cols:['#ffffff', '#e23b3b'], v0:3, v1:8.5, w:.85, glow:6, fall:2.6, up:4.4, d0:750, d1:1150});
  }else if(kind === 'legendary'){                                             // aura morada + golpe más intenso
    fxGlow(fb, x, y - q, 26 * q * k, '#a855f7', 760, .8);
    [0, 130, 260].slice(0, k > .6 ? 3 : 1).forEach((dl, i) => fxRing(fb, x, y, (15 + i * 6) * q, i ? '#e0a8ff' : '#b46bff', 680, dl, flat));
    fan(n(26), {cols:['#a855f7', '#ff7ac8', '#ffffff', '#c58bff'], v0:3.5, v1:11, w:1.05, glow:10, fall:3.2, up:5.6, d0:850, d1:1350});
  }else if(kind === 'shiny'){                                                 // brillo dorado + estrellitas metálicas
    fxGlow(fb, x, y - q, 22 * q * k, '#ffd23a', 850, .8);
    fxRing(fb, x, y, 13 * q * k, '#ffe27a', 620, 0, flat);
    for(let i = 0; i < n(18); i++) fxPt(fx, {x:x + rn(-3.5, 3.5) * q, y:y - rn(0, 2) * q, w:rn(1, 1.8) * q, bg:i % 3 ? '#ffd23a' : '#fffbe0', glow:10, shape:'star',
      rot:rn(-180, 180), dx:rn(-6, 6) * q, dy:-rn(3.5, 9) * q, up:0, dur:rn(1000, 1500), delay:rn(0, 160)});
  }
}

// ---- Motor de la animación: mueve las bolas de la cúpula y la bola que sale y cae (se ejecuta en cada fotograma) ----
const easeIO = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;          // (lerp y clamp01 ya existen en fx.js)
const T_SHAKE = 400, T_PICK = 700, T_SINK = 1300, T_CHUTE = 1600, T_EXIT = 1950;     // línea de tiempo (ms)
function stopEngine(){ if(gx.raf) cancelAnimationFrame(gx.raf); gx.raf = 0; gx.e = null; }
function startEngine(){
  stopEngine();
  const stg = $('gOv').querySelector('.stage'), mach = $('gMachBox'), ball = $('gBall'), sh = $('gShadow'), au = $('gAura'),
        imgs = [...$('gDome').querySelectorAll('.db')], pile = gx.pile, kind = gx.ballType,
        RM = matchMedia('(prefers-reduced-motion:reduce)').matches, em = parseFloat(getComputedStyle(stg).fontSize);
  let ci = -1; pile.forEach((p, i) => { if(p.type === kind && (ci < 0 || p.y > pile[ci].y)) ci = i; });   // la bola elegida es del tipo del premio
  const order = pile.map((p, i) => i).sort((a, b) => pile[a].y - pile[b].y); order.forEach((i, z) => { imgs[i].style.zIndex = z + 1; });
  const E = gx.e = {t:0, ph:'prep', b:null, sq:0, bounces:0, aura:0, auraT:0}, rn = (a, b) => a + Math.random() * (b - a);
  const place = (i, x, y, rot) => { const im = imgs[i], D = BALL_R * 2;
    im.style.left = ((x - BALL_R - (DOME.cx - DOME.rx)) / (DOME.rx * 2) * 100) + '%'; im.style.top = ((y - BALL_R - (DOME.cy - DOME.ry)) / (DOME.ry * 2) * 100) + '%';
    im.style.transform = `rotate(${rot}deg)`; };
  const agitAt = t => t < T_SHAKE ? 0 : t < T_PICK ? (t - T_SHAKE) / (T_PICK - T_SHAKE) : t < T_CHUTE ? 1 : Math.max(.12, 1 - (t - T_CHUTE) / 700);
  let last = performance.now(), glintT = 0;

  function frame(now){
    if(gx.e !== E) return;
    gx.raf = requestAnimationFrame(frame);
    const dt = Math.min(.033, (now - last) / 1000); last = now; E.t += dt * 1000;
    const t = E.t, sw = stg.offsetWidth, shh = stg.offsetHeight, mw = mach.offsetWidth, mh = mach.offsetHeight,
          u = mw / 40, mx = sw / 2 - mw / 2, my = mach.offsetTop, X = a => mx + a * u, Y = a => my + a * u,
          D = BALL_R * 2 * u, yG = shh * .95, sF = 1.3, yFloor = yG - D * sF / 2;

    // 1) Bolas dentro de la cúpula: balanceo suave siempre; saltos cuando la máquina se agita
    const ag = agitAt(t), amp = RM ? .12 : .25 + ag * .9, ts = t / 1000;
    pile.forEach((p, i) => {
      if(i === ci && t >= T_PICK){
        if(t >= T_CHUTE){ imgs[i].style.visibility = 'hidden'; return; }
        const k = easeIO(clamp01((t - T_PICK) / (T_SINK - T_PICK))), s2 = clamp01((t - T_SINK) / (T_CHUTE - T_SINK));
        imgs[i].style.zIndex = 60;                                              // sale rodando por encima del montón hasta el desagüe
        place(i, lerp(p.x, DOME.cx, k), lerp(p.y, DOME.cy + DOME.ry - BALL_R - .2, k) + s2 * s2 * 8, p.rot + k * 200);
        return; }
      const hop = RM ? 0 : ag * Math.max(0, Math.sin(ts * p.f * 5 + p.ph)) * 1.7;
      place(i, p.x + Math.sin(ts * p.f * 1.3 + p.ph) * amp, p.y + Math.sin(ts * p.f + p.ph2) * amp * .6 - hop, p.rot + Math.sin(ts * p.f * 2 + p.ph) * (3 + ag * (RM ? 0 : 14)));
    });

    // 2) Fases
    if(E.ph === 'prep' && t >= T_SHAKE){ E.ph = 'shake'; showStage('shake'); if(gx.e !== E) return; }
    if(E.ph === 'shake' && t >= T_CHUTE){ E.ph = 'chute'; mach.classList.add('chute', 'clunk'); setTimeout(() => mach.classList.remove('clunk'), 320); }
    if(E.ph === 'chute' && t >= T_EXIT){
      E.ph = 'fall'; E.te = t; mach.classList.remove('chute'); showStage('drop'); if(gx.e !== E) return;
      const sg = Math.random() < .5 ? -1 : 1;
      E.b = {x:X(20), y:Y(40), vx:sg * rn(.05, .1) * mh, vy:0, rot:rn(-25, 25), vr:sg * rn(110, 200), s:.62, br:.35, floor:false};
      ball.style.cssText = `width:${D}px;height:${D}px;visibility:visible`; sh.style.opacity = 0;
      E.auraT = kind === 'legendary' ? .45 : kind === 'shiny' ? .5 : 0;
    }
    const b = E.b, g = 2.9 * mh;
    if(E.ph === 'fall'){
      const te = t - E.te;
      if(te < 230){                                                             // sale de la boca de la máquina hacia el jugador
        const k = easeIO(te / 230); b.y = lerp(Y(40), Y(46.5), k); b.s = lerp(.62, .95, k); b.br = lerp(.35, 1, k); b.rot += b.vr * dt * .4;
      }else{
        if(!E.out){ E.out = true; b.vy = mh * .02; }
        b.vy += g * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
        b.s = Math.max(b.s, lerp(.95, sF, clamp01((b.y - Y(46.5)) / (yFloor - Y(46.5)))));    // cae hacia delante: se acerca a la cámara
        const r = D * b.s / 2, fy = yG - r;
        if(b.y >= fy){
          b.y = fy;
          if(b.vy > mh * .07){                                                  // rebote
            E.bounces++; E.sq = Math.min(1, b.vy / (mh * 1.6)) * (E.bounces === 1 ? 1 : .6);
            impactFx(kind, b.x, yG - 2, u, E.bounces === 1 ? 1 : E.bounces === 2 ? .4 : .2, .3, RM);
            if(E.bounces === 1){
              E.auraT = kind === 'legendary' || kind === 'shiny' ? 1 : 0;
              if(kind === 'legendary' && !RM){ stg.classList.remove('quake'); void stg.offsetWidth; stg.classList.add('quake'); mach.classList.add('clunk'); setTimeout(() => mach.classList.remove('clunk'), 320); }
            }
            b.vy = -b.vy * .42; b.vx *= .8; b.floor = false;
          }else{ b.vy = 0; b.floor = true; }
        }
        if(b.floor || b.y >= fy - 1){ const fr = Math.min(Math.abs(b.vx), .06 * g * dt); b.vx -= Math.sign(b.vx) * fr; b.vr = b.vx / r * 57.3; }
        if(b.floor && Math.abs(b.vx) < 4 || te > 3400){ E.ph = 'rest'; E.tr = t; b.vx = b.vy = 0; b.y = fy; }
      }
    }
    if(E.ph === 'rest'){
      if(t - E.tr >= 450){ E.ph = 'center'; E.tc = t; E.b0 = {...b}; E.a0 = E.auraT; showStage('center'); if(gx.e !== E) return; }
    }
    if(E.ph === 'center'){
      const k = easeIO(clamp01((t - E.tc) / 800)), b0 = E.b0, sFin = 10.8 * em / D;
      b.x = lerp(b0.x, sw / 2, k); b.y = lerp(b0.y, shh * .46, k) - Math.sin(k * Math.PI) * shh * .07; b.s = lerp(b0.s, sFin, k);
      b.rot = lerp(b0.rot, Math.round(b0.rot / 360) * 360, k); E.auraT = E.a0 * (1 - k * .5);
      if(k >= 1){ E.ph = 'open'; E.to = t; ball.classList.add('opening'); showStage('open'); if(gx.e !== E) return; }
    }
    if(E.ph === 'open'){ E.auraT *= .96; if(t - E.to >= 800){ showStage('reveal'); return; } }

    // 3) Pintar la bola, su sombra y su aura
    if(b){
      E.sq *= Math.pow(.0008, dt);                                              // aplastamiento al golpear (se recupera rápido)
      const sx = 1 + .16 * E.sq, sy = 1 - .2 * E.sq;
      ball.style.transform = `translate(${b.x - D / 2}px,${b.y - D / 2}px) scale(${b.s * sx},${b.s * sy}) rotate(${b.rot}deg)`;
      ball.style.filter = b.br < 1 ? `brightness(${b.br})` : '';
      const air = E.ph === 'fall' || E.ph === 'rest' ? clamp01((yFloor - b.y) / (mh * .4)) : 1, vis = E.ph === 'center' ? 1 - easeIO(clamp01((t - E.tc) / 500)) : E.ph === 'open' ? 0 : 1;
      const sw2 = D * sF * (1 - .3 * air) * (E.ph === 'fall' && b.y < Y(47) ? .6 : 1);
      sh.style.cssText = `width:${sw2}px;height:${sw2 * .3}px;left:${b.x - sw2 / 2}px;top:${yG + shh * .004 - sw2 * .15}px;opacity:${.6 * (1 - .6 * air) * vis * (E.ph === 'fall' && b.y < Y(47.5) ? clamp01((b.y - Y(41)) / (Y(47.5) - Y(41))) : 1)};filter:blur(${1 + air * 3}px)`;
      E.aura += (E.auraT - E.aura) * Math.min(1, dt * 6);
      const col = FX_COL[kind] || '#ffffff', as = D * b.s * 2.8;
      au.style.cssText = `width:${as}px;height:${as}px;left:${b.x - as / 2}px;top:${b.y - as / 2}px;background:radial-gradient(circle,${col}cc 0,${col}55 38%,${col}00 70%);opacity:${E.aura * (.75 + .25 * Math.sin(ts * 5)) * (E.ph === 'open' ? .5 : 1)}`;
      if(kind === 'shiny' && (E.ph === 'rest' || E.ph === 'center') && !RM && (glintT -= dt) < 0){      // destellos dorados alrededor de la bola
        glintT = .32; const a = rn(0, 6.28), rr = D * b.s * rn(.45, .7);
        fxPt($('gFx'), {x:b.x + Math.cos(a) * rr, y:b.y + Math.sin(a) * rr, w:rn(.5, .9) * u, bg:'#fffbe0', glow:8, shape:'star', rot:90, dx:0, dy:-rn(.5, 2) * u, dur:650});
      }
    }
  }
  gx.raf = requestAnimationFrame(frame);
}

function startPull(mode){
  if(gx.anim) return;
  const res = pullGacha(mode, save.gachaRegion);
  if(!res){ toast('No tienes tickets suficientes.'); return; }
  gx.res = res; gx.mode = mode; gx.best = bestOf(res); gx.anim = true;
  gx.ballType = gx.best.shiny ? 'shiny' : gx.best.rarity;                       // la bola que sale es SIEMPRE la del premio real
  const r = RAR[gx.best.rarity];
  ovHtml(); const ov = $('gOv');
  ov.style.setProperty('--c', gx.best.shiny ? '#ffffff' : r.col); ov.classList.toggle('shinyc', gx.best.shiny);
  ov.dataset.rar = gx.best.rarity; ov.classList.remove('hide');
  // chispas para el destello final (posiciones aleatorias, las mueve el CSS)
  $('gSparks').innerHTML = Array.from({length: 22}, () => {
    const a = Math.random() * 6.283, d = 10 + Math.random() * 16;
    return `<i style="--dx:${Math.cos(a) * d}em;--dy:${Math.sin(a) * d}em;--dl:${Math.random() * .2}s"></i>`; }).join('');
  // Línea de tiempo: máquina se agita -> una bola baja por el desagüe -> sale por la ranura y cae, rebota y se queda
  //                  -> va al centro -> se abre -> aparece el Pokémon (lo dirige startEngine; este temporizador es solo un seguro)
  showStage('calm');
  gx.timers = [setTimeout(() => showStage('reveal'), 30000)];
  startEngine();
  renderGacha();                                                  // refresca contadores detrás de la capa
}
function paintReveal(){
  const b = gx.best, m = DEX[b.dex - 1], r = RAR[b.rarity];
  gx.dex = b.dex; gx.shiny = b.shiny;
  $('gRar').textContent = `${r.ic} ${r.n}${b.shiny ? ' · ⭐ SHINY' : ''}`; $('gRar').style.setProperty('--c', r.col);
  $('gName').textContent = m.name;
  $('gTag').innerHTML = tagOf(b);
}
const tagOf = r => r.newShiny ? '⭐ ¡Shiny nuevo!' : r.isNew ? '✨ ¡Nuevo en tu Pokédex!' : `Repetido: +${r.bp} PB`;
// El sprite grande se anima mientras se ve el resultado
setInterval(() => {
  const ov = $('gOv'), c = $('gSpr');
  if(ov.classList.contains('hide') || ov.dataset.stage !== 'reveal' || !c) return;
  const x = c.getContext('2d'), t = (performance.now() - gx.t0) / 1000;
  x.clearRect(0, 0, 256, 256); drawFrame(x, gx.dex, 'Idle', t, 0, 128, 130, 6, 230, gx.shiny);
}, 120);

function showSummary(){
  showStage('summary');
  $('gSum').innerHTML = gx.res.map(r => `<div class="sc" style="--c:${RAR[r.rarity].col}"><canvas width="64" height="64" data-d="${r.dex}" data-s="${r.shiny ? 1 : 0}"></canvas>
    <b>${esc(DEX[r.dex - 1].name)}</b><small>${r.shiny ? '⭐ ' : ''}${r.newShiny || r.isNew ? '¡NUEVO!' : '+' + r.bp + ' PB'}</small></div>`).join('');
  $('gSum').querySelectorAll('canvas').forEach(c => paintSprite(c, +c.dataset.d, {sc:2, fit:56, shiny: c.dataset.s === '1'}));
}
function closeOverlay(){
  gx.timers.forEach(clearTimeout); gx.timers = []; stopEngine(); gx.anim = false;
  $('gOv').classList.add('hide'); $('gOv').innerHTML = ''; renderGacha();
}
// ESC cierra/salta la animación en vez de salir de la pantalla (se registra antes que el de ui.js)
addEventListener('keydown', e => {
  if(e.code !== 'Escape' || $('gOv').classList.contains('hide')) return;
  e.stopImmediatePropagation();
  const s = $('gOv').dataset.stage;
  if(s === 'reveal' || s === 'summary') closeOverlay(); else showStage('reveal');
});
