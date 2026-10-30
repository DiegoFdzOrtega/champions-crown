"use strict";
/* =====================================================================
   17) HABITACIÓN DEL EQUIPO POKÉMON: fondo en pixel art pintado por código (sin imágenes)
   Una sala de madera oscura con chimenea de piedra (a la izquierda, con el fuego ANIMADO), vitrina, estanterías con Poké Balls,
   una ventana de noche con telescopio y, arriba, la ESTANTERÍA DE TROFEOS: un trofeo por cada Liga Pokémon superada
   (se consigue al derrotar al Campeón; el estado sale de save.champ, que escribe modes.js).

     roomStart(canvas)  pinta la habitación y empieza la animación (team.js lo llama al abrir el panel)
     roomStop()         la para (al cerrar el panel, así no gasta nada en el resto del juego)

   El lienzo mide 480x270 y el CSS lo amplía sin suavizar (alineado arriba a la izquierda): así la chimenea y la estantería
   de trofeos siempre quedan en los huecos que deja el panel (ver --sc en style.css). Capas:
     1) fondo fijo (se dibuja de nuevo cada vez que se abre, por si has ganado una Liga)
     2) animación ligera (~15 imágenes/s): llamas, chispas, brillo de los trofeos y luces cálidas
   La oscuridad que protege la lectura de los paneles la pone el CSS (#teamv::before), no este archivo.
   Para cambiar colores o muebles: RM.pal y las coordenadas de rmBuild. Para añadir regiones: ROOM_LEAGUES.
   ===================================================================== */
const RM = {W:480, H:270, base:null, cv:null, x:null, on:false, timer:0, t0:0, won:[], slots:[],
  pal:{wood:'#2b1a13', woodA:'#33211a', woodB:'#241610', woodHi:'#4a2f20', woodLo:'#140c08', beam:'#1d120d', stone:'#3d3834', stoneA:'#46413b', stoneB:'#34302c', stoneHi:'#575049', mortar:'#1a1715'}};
// Una casilla por Liga (mismas regiones y orden que REGIONS en menu.js) con su color de gema
const ROOM_LEAGUES = [['Kanto', '#e23b3b'], ['Johto', '#ffcc33'], ['Hoenn', '#3ea6ff'], ['Sinnoh', '#9aa6ff'], ['Unova / Teselia', '#f0e03a'],
                      ['Kalos', '#ff7ac8'], ['Alola', '#ff9a3a'], ['Galar', '#c05cff'], ['Paldea', '#4ccf6a']];
const rmRng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

function rmBuild(){
  const c = document.createElement('canvas'); c.width = RM.W; c.height = RM.H;
  const x = c.getContext('2d'), P = RM.pal, r = rmRng(5), R = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  const disc = (cx, cy, rad, col) => { for(let dy = -rad; dy <= rad; dy++){ const w = Math.floor(Math.sqrt(rad * rad - dy * dy + .5)); R(cx - w, cy + dy, w * 2 + 1, 1, col); } };
  const ball = (bx, by, top, hi) => { disc(bx, by, 6, '#e9e6e0'); for(let dy = -6; dy <= -1; dy++){ const w = Math.floor(Math.sqrt(36 - dy * dy + .5)); R(bx - w, by + dy, w * 2 + 1, 1, top); }
    R(bx - 6, by - 1, 13, 2, '#15110f'); disc(bx, by, 2, '#e9e6e0'); disc(bx, by, 1, '#15110f'); R(bx - 4, by - 5, 2, 1, hi); R(bx - 3, by + 2, 4, 3, 'rgba(0,0,0,.18)'); };
  const books = (x0, x1, base, hmin, hmax, seed) => { const rr = rmRng(seed), cols = ['#6b2222', '#24485a', '#6d5420', '#38336b', '#44592a', '#7a4326', '#8c7a4c', '#4e2548', '#2c3a2a'];
    let xx = x0; while(xx < x1 - 3){ const w = 3 + Math.floor(rr() * 4), h = hmin + Math.floor(rr() * (hmax - hmin + 1)), col = cols[Math.floor(rr() * cols.length)];
      R(xx, base - h, w, h, col); R(xx, base - h, 1, h, 'rgba(255,255,255,.16)'); R(xx + w - 1, base - h, 1, h, 'rgba(0,0,0,.35)'); R(xx + 1, base - h + 3, Math.max(1, w - 2), 1, '#cdbb86'); xx += w + (rr() < .12 ? 3 : 0); } };

  // ---- Paredes de madera oscura con pilastras ----
  R(0, 0, 480, 232, P.wood);
  for(let i = 0; i < 480; i += 8){ R(i, 0, 1, 232, P.woodB); R(i + 1, 0, 1, 232, P.woodA); if(r() < .5) R(i + 3, 12 + Math.floor(r() * 180), 1, 14 + Math.floor(r() * 22), P.woodHi); }
  for(const px of [92, 202, 312, 422]){ R(px, 8, 10, 224, P.woodLo); R(px, 8, 2, 224, P.woodHi); R(px + 8, 8, 2, 224, '#0d0705'); }   // pilastras
  R(0, 0, 480, 10, P.beam); R(0, 10, 480, 3, P.woodHi); R(0, 13, 480, 2, P.woodLo);                                                  // viga y moldura
  // ---- Suelo ----
  for(let y = 232, row = 0; y < 270; y += 6, row++){ R(0, y, 480, 6, '#2a1a12'); R(0, y, 480, 1, '#0e0806');
    for(let px = -(row % 2) * 30; px < 480; px += 60){ R(px, y + 1, 60, 5, r() < .5 ? '#2e1d14' : '#271810'); R(px + 59, y, 1, 6, '#0e0806'); } }
  R(0, 228, 480, 4, P.woodLo); R(0, 228, 480, 1, P.woodHi);
  R(150, 246, 220, 24, '#4a1a22'); R(152, 248, 216, 20, '#5d2430'); for(let i = 0; i < 12; i++) R(160 + i * 17, 255, 5, 5, '#8a6a2a'); R(150, 246, 220, 1, '#8a6a2a');   // alfombra

  // ---- Vitrina de cristal (x 100-198) ----
  R(106, 60, 86, 8, '#4a2f20'); R(110, 68, 78, 4, P.woodLo);
  R(114, 48, 28, 14, '#5a4630'); R(114, 48, 28, 2, '#7a6342'); R(150, 52, 30, 10, '#4a3a28'); R(150, 52, 30, 2, '#665238');          // cajas sobre la vitrina
  R(104, 72, 90, 156, '#3a2418'); R(106, 74, 86, 98, '#120b08');
  for(const gx of [108, 152]){ R(gx, 78, 38, 90, '#1b2430'); for(let i = 0; i < 4; i++) R(gx + 6 + i * 9, 78, 3, 90, 'rgba(160,190,230,.10)'); R(gx + 4, 86, 18, 2, 'rgba(210,230,255,.22)'); R(gx + 2, 100, 14, 2, 'rgba(210,230,255,.18)');
    R(gx, 78, 38, 2, P.woodHi); R(gx, 78, 2, 90, P.woodHi); R(gx + 36, 78, 2, 90, P.woodLo); R(gx, 166, 38, 2, P.woodLo); }
  R(106, 122, 86, 3, '#4a2f20'); books(112, 140, 168, 10, 22, 31); books(156, 184, 168, 10, 20, 33); books(112, 140, 121, 6, 14, 35);
  R(104, 172, 90, 5, '#4a2f20'); R(104, 172, 90, 1, P.woodHi);
  for(const gx of [108, 152]){ R(gx, 180, 38, 44, '#33200f'); R(gx + 3, 183, 32, 38, '#3a2616'); R(gx + 3, 183, 32, 1, P.woodHi); R(gx + 3, 183, 1, 38, P.woodLo); R(gx + 18, 198, 3, 8, '#b8893a'); }

  // ---- Estanterías empotradas (x 212-420) ----
  for(const [bx, seed] of [[212, 41], [322, 47]]){
    R(bx, 76, 100, 152, '#150c08');
    for(const sy of [76, 124, 172]){ R(bx, sy + 40, 100, 6, '#4a2f20'); R(bx, sy + 40, 100, 1, P.woodHi); R(bx, sy + 46, 100, 2, 'rgba(0,0,0,.4)'); }
    R(bx, 222, 100, 6, '#4a2f20'); R(bx, 222, 100, 1, P.woodHi);
    books(bx + 3, bx + 60, 116, 12, 26, seed); books(bx + 3, bx + 40, 164, 12, 24, seed + 3); books(bx + 52, bx + 96, 214, 12, 26, seed + 5);
  }
  ball(236, 108, '#d23a3a', '#ff9a9a'); ball(262, 160, '#2a5ab8', '#8ab4ff'); ball(286, 160, '#1a1714', '#6a645c'); R(280, 154, 12, 2, '#e8b82a'); R(281, 163, 8, 4, '#d9d4cc');
  ball(350, 110, '#e8b82a', '#fff0a0'); R(380, 98, 12, 10, '#6d5420'); R(382, 94, 8, 4, '#cdbb86'); R(370, 206, 14, 8, '#3a3a3a'); R(372, 202, 10, 4, '#555');
  R(400, 120, 8, 6, '#cdbb86'); R(398, 124, 12, 3, '#7a4326');
  // ---- Pared azul de la derecha con ventana de noche, mesa y telescopio ----
  R(432, 14, 48, 214, '#1c3478'); for(let i = 0; i < 48; i += 6) R(432 + i, 14, 1, 214, '#233f8c'); R(432, 14, 4, 214, '#0f1d46');
  R(441, 80, 36, 44, '#7a8fc8'); R(443, 82, 32, 40, '#0b1738'); for(let i = 0; i < 5; i++) R(443, 82 + i * 8, 32, 8, ['#0b1738', '#0e1c44', '#122350', '#182b5e', '#1f3670'][i]);
  for(let i = 0; i < 12; i++) R(445 + Math.floor(r() * 28), 84 + Math.floor(r() * 34), 1, 1, '#cfe0ff'); R(457, 90, 1, 5, '#fff'); R(455, 92, 5, 1, '#fff');
  R(458, 82, 2, 40, '#7a8fc8'); R(443, 101, 32, 2, '#7a8fc8'); R(439, 124, 40, 3, '#9aaee0');
  R(436, 192, 44, 5, '#4a2f20'); R(436, 192, 44, 1, P.woodHi); R(440, 197, 40, 31, '#1a100b'); R(444, 202, 32, 12, '#33200f'); R(458, 207, 4, 2, '#b8893a');
  R(448, 168, 3, 24, '#6d5420'); R(440, 190, 3, 2, '#6d5420'); R(458, 190, 3, 2, '#6d5420');                                // trípode
  R(446, 160, 26, 6, '#b8893a'); R(446, 160, 26, 2, '#e0b45a'); R(468, 158, 6, 10, '#8a6a2a'); R(474, 159, 3, 8, '#4a90c8');   // telescopio
  // ---- Chimenea de piedra (x 0-84), de arriba a abajo ----
  R(0, 14, 84, 214, P.stone);
  for(let yy = 14; yy < 228; yy += 11){ let xx = -((yy / 11 | 0) % 2) * 8; while(xx < 84){ const w = 10 + Math.floor(r() * 9), bw = Math.min(w, 84 - xx);
      if(bw > 0){ R(Math.max(0, xx), yy, bw, 10, [P.stone, P.stoneA, P.stoneB][Math.floor(r() * 3)]); R(Math.max(0, xx), yy, bw, 1, P.stoneHi); R(xx + bw, yy, 1, 11, P.mortar); } xx += w + 1; } R(0, yy + 10, 84, 1, P.mortar); }
  R(0, 14, 84, 60, 'rgba(0,0,0,.22)');                                                                                          // el humo oscurece lo alto
  R(0, 150, 96, 9, '#4a2f20'); R(0, 150, 96, 2, '#6a4429'); R(0, 157, 96, 2, P.woodLo);                                        // repisa
  ball(30, 144, '#d23a3a', '#ff9a9a'); R(52, 136, 4, 14, '#e8dcc0'); R(53, 132, 2, 4, '#ffcc66'); R(66, 138, 12, 12, '#6a4429'); R(68, 140, 8, 8, '#e8dcc0'); R(72, 141, 1, 4, '#222');
  // hogar con arco
  const cx = 38, top = 174; R(cx - 28, top - 4, 56, 60, P.mortar);
  for(let a = 0; a <= 180; a += 9){ const rad = a * Math.PI / 180, px = Math.round(cx - Math.cos(rad) * 27), py = Math.round(top - Math.sin(rad) * 27); R(px - 3, py - 3, 7, 6, a % 18 ? P.stoneA : P.stoneHi); }
  R(cx - 24, top, 48, 54, '#0c0705'); disc(cx, top, 23, '#0c0705');
  R(cx - 28, 222, 56, 6, '#4a4540'); R(cx - 28, 222, 56, 1, '#6a645c');                                                            // base
  R(cx - 17, 214, 34, 6, '#3d230f'); R(cx - 17, 214, 34, 2, '#5a3519'); R(cx - 13, 207, 26, 7, '#4a2a14'); R(cx - 13, 207, 26, 2, '#6a4423');   // troncos
  R(cx - 21, 219, 42, 2, '#222'); for(let i = -2; i <= 2; i++) R(cx + i * 9, 216, 2, 6, '#222'); R(cx - 21, 216, 42, 1, '#333');           // rejilla

  // ---- Estantería de trofeos (x 94-394, y 52): una casilla por Liga ----
  R(94, 52, 300, 12, '#4a2f20'); R(94, 52, 300, 1, '#7a4f2e'); R(94, 55, 300, 1, 'rgba(0,0,0,.25)'); R(94, 63, 300, 1, P.woodLo); R(94, 64, 300, 3, 'rgba(0,0,0,.45)');   // tablón de 12 px: ahí se rotula la región
  for(const bx of [110, 240, 372]){ R(bx, 64, 3, 8, P.woodLo); R(bx - 2, 70, 7, 2, P.woodLo); }                                        // ménsulas
  RM.slots = ROOM_LEAGUES.map(([name, col], i) => ({x: 112 + i * 33, y: 52, col, name}));
  RM.slots.forEach((s, i) => {
    R(s.x - 7, 49, 15, 3, '#2a1a10'); R(s.x - 7, 49, 15, 1, '#5a3a22');                                                           // peana
    rmTrophy(x, s.x, 49, s.col, RM.won[i]);
  });
  RM.base = c;
}

// Trofeo de unos 19x20 px, de pie sobre su peana (bx = centro, by = suelo). won=false: solo una silueta apagada
function rmTrophy(x, bx, by, gem, won){
  const R = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(bx + a, by + b, w, h); };
  const G = won ? '#f2c14e' : '#2d2016', H = won ? '#ffe9a0' : '#35271a', D = won ? '#a67c1a' : '#201610';
  R(-5, -3, 11, 3, D); R(-4, -3, 9, 1, G);                                       // base
  R(-1, -8, 3, 5, G); R(-1, -8, 1, 5, H);                                        // pie
  R(-6, -19, 13, 2, G); R(-5, -17, 11, 4, G); R(-4, -13, 9, 3, G); R(-3, -10, 7, 2, D);   // copa
  R(-5, -19, 3, 1, H); R(-5, -17, 1, 4, H);
  R(-8, -17, 2, 1, G); R(-9, -16, 2, 4, G); R(-8, -12, 2, 1, G); R(7, -17, 2, 1, G); R(8, -16, 2, 4, G); R(7, -12, 2, 1, G);   // asas
  if(won){ R(-1, -16, 3, 4, gem); R(0, -17, 1, 1, '#fff'); R(-1, -16, 1, 1, '#ffffffaa'); }                                     // gema de la región
}

function rmFrame(){
  if(!RM.on) return;
  if(!RM.cv.isConnected || $('teamv').classList.contains('hide')){ RM.on = false; return; }
  const x = RM.x, t = (performance.now() - RM.t0) / 1000;
  x.globalCompositeOperation = 'source-over'; x.drawImage(RM.base, 0, 0);
  // ---- Llamas de la chimenea: columnas de 3 px con cuatro capas de color ----
  x.save(); x.beginPath(); x.rect(15, 168, 46, 54); x.clip();
  for(let i = 0; i < 14; i++){
    const cx = 17 + i * 3, mid = 1 - Math.abs(i - 6.5) / 7.5;
    const h = 8 + 34 * mid * (.6 + .4 * Math.sin(t * 8 + i * 1.7) * Math.sin(t * 5.3 + i * .6) + .2 * Math.sin(t * 15 + i * 2.3));
    x.fillStyle = '#a82d0a'; x.fillRect(cx, 218 - h, 3, h);
    x.fillStyle = '#ee7d17'; x.fillRect(cx, 218 - h * .74, 3, h * .74);
    x.fillStyle = '#ffc93c'; x.fillRect(cx, 218 - h * .46, 3, h * .46);
    if(mid > .45){ x.fillStyle = '#fff1a8'; x.fillRect(cx, 218 - h * .22, 3, h * .22); }
  }
  for(let i = 0; i < 9; i++){                                                              // chispas que suben
    const ph = (t * .55 + i * .29) % 1, ex = 22 + ((i * 41) % 32) + Math.sin(t * 3.1 + i) * 3, ey = 206 - ph * 52;
    x.globalAlpha = 1 - ph; x.fillStyle = i % 2 ? '#ffb347' : '#ffe08a'; x.fillRect(ex, ey, 1.5, 1.5);
  }
  x.restore(); x.globalAlpha = 1;
  // ---- Luces cálidas y brillo de trofeos (se suman al fondo) ----
  const fl = .86 + .14 * Math.sin(t * 11) * Math.sin(t * 7.3) + .06 * Math.sin(t * 23);
  x.globalCompositeOperation = 'lighter';
  const glow = (gx, gy, rad, rgb, a) => { const g = x.createRadialGradient(gx, gy, 0, gx, gy, rad); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(gx - rad, gy - rad, rad * 2, rad * 2); };
  glow(38, 205, 130 * fl, '255,110,35', .38 * fl); glow(38, 200, 52, '255,190,100', .26 * fl); glow(38, 140, 40, '255,150,70', .12 * fl);
  glow(458, 102, 60, '90,130,255', .10);                                                    // luz de luna en la ventana
  RM.slots.forEach((s, i) => { if(!RM.won[i]) return;
    glow(s.x, 38, 20, '255,210,120', .10 + .04 * Math.sin(t * 2 + i));
    const k = (t * .5 + i * .37) % 1; if(k < .16){ const a = 1 - Math.abs(k - .08) / .08; x.fillStyle = `rgba(255,255,230,${a})`; const sx = s.x - 4, sy = 33; x.fillRect(sx, sy, 1, 1); x.fillRect(sx - 1, sy, 3, 1); x.fillRect(sx, sy - 1, 1, 3); } });
  x.globalCompositeOperation = 'source-over';
  RM.timer = setTimeout(rmFrame, 66);
}

// Nombre de cada región sobre el tablón, bajo su trofeo. Es texto normal (no del lienzo de 480x270) para que se lea bien; --sc (css) es el tamaño de cada píxel del dibujo
const ROOM_LABEL = {'Unova / Teselia':'Teselia'};
function roomLabels(canvas){
  let l = document.getElementById('tmRoomLbl');
  if(!l){ l = document.createElement('div'); l.id = 'tmRoomLbl'; l.className = 'roomlbl'; l.setAttribute('aria-hidden', 'true'); canvas.parentNode.insertBefore(l, canvas.nextSibling); }
  l.innerHTML = ROOM_LEAGUES.map(([n], i) => `<span class="${RM.won[i] ? 'won' : ''}" style="left:calc(var(--sc) * ${112 + i * 33})">${ROOM_LABEL[n] || n}</span>`).join('');
}
function roomStart(canvas){
  if(!canvas) return;
  RM.won = ROOM_LEAGUES.map(([n]) => !!(save.champ && save.champ[n]));                      // Ligas superadas = trofeos en la estantería
  roomLabels(canvas);
  rmBuild();
  RM.cv = canvas; canvas.width = RM.W; canvas.height = RM.H; RM.x = canvas.getContext('2d'); RM.x.imageSmoothingEnabled = false;
  clearTimeout(RM.timer); RM.t0 = performance.now(); RM.on = true;
  rmFrame();                                                                                 // el fuego se anima siempre (es un adorno pequeño y suave)
}
function roomStop(){ RM.on = false; clearTimeout(RM.timer); }
