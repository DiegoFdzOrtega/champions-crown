"use strict";
/* =====================================================================
   5) DIBUJO: arena, Pokémon y HUD retro oscuro
   ===================================================================== */
function text(t, x, y, size, col, align){
  ctx.font = `${size}px ${FONT}`; ctx.fillStyle = col || '#fff';
  ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(t, x, y);
}
function textO(t, x, y, size, col, align){                // texto con contorno oscuro: se lee sobre cualquier fondo (avisos flotantes, subtítulo)
  ctx.font = `${size}px ${FONT}`; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, size / 3); ctx.strokeStyle = 'rgba(8,10,20,.92)'; ctx.strokeText(t, x, y);
  text(t, x, y, size, col, align);
}
let HUD_SCALE = .74;      /* js/touch.js lo sube a .92 en pantallas táctiles */                                   // tamaño del HUD en combate (1 = como antes; más pequeño = molesta menos)
function hudAt(ax, ay, fn){ ctx.save(); ctx.translate(ax, ay); ctx.scale(HUD_SCALE, HUD_SCALE); ctx.translate(-ax, -ay); fn(); ctx.restore(); }   // dibuja fn() reducido desde la esquina (ax, ay)
function bar(x, y, w, h, v, max, col){
  ctx.fillStyle = '#05070c'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = col; ctx.fillRect(x+1, y+1, Math.max(0, (w-2) * v/max), h-2);
  ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1; ctx.strokeRect(x+.5, y+.5, w-1, h-1);
}
// Caja oscura semitransparente con borde fino iluminado
function hudBox(x, y, w, h, col){
  ctx.fillStyle = 'rgba(16,20,30,.9)'; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 10;
  ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.strokeRect(x+.5, y+.5, w-1, h-1); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1; ctx.strokeRect(x+4.5, y+4.5, w-9, h-9);
}
// Sombra suave bajo cada Pokémon
function shadow(x, y, rx){
  ctx.save(); ctx.translate(x, y); ctx.scale(1, .3);
  const gr = ctx.createRadialGradient(0,0,0,0,0,rx);
  gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(.6, 'rgba(0,0,0,.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0,0,rx,0,7); ctx.fill(); ctx.restore();
}

// Fondo antiguo (lava): solo se usa si un rival no tiene arena propia en arenas.js
function arenaFallback(){
  ctx.fillStyle = '#3b2c2a'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1;
  for(let x=0; x<W; x+=48){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for(let y=0; y<H; y+=48){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  const gr = ctx.createRadialGradient(W/2, H/2, H*.3, W/2, H/2, Math.hypot(W,H)/2);   // lava en los bordes
  gr.addColorStop(0, 'rgba(255,90,20,0)'); gr.addColorStop(.65, 'rgba(255,90,20,.2)'); gr.addColorStop(1, 'rgba(255,130,30,.65)');
  ctx.fillStyle = gr; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(W/2, 70); ctx.lineTo(W/2, H-90); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2, H/2+10, 140, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2, H/2+10, 40, 0, 7); ctx.stroke();
}

// Fondo del combate: cada líder / Alto Mando / Campeón tiene el suyo (ver arenas.js)
function arena(){ drawArena(g && g.o ? (g.o.arena || g.o.leader) : '', g ? g.t : 0); }

// Aviso del ataque fuerte: mientras se carga (f.wind, combat.js) se pinta en el suelo el carril por donde va a salir. Se va llenando; cuando el rival de la IA deja de apuntar, el borde se pone blanco.
// Terreno (TERR, combat.js): FRANJAS rectas en el suelo, por donde pasó el ataque fuerte. Las que TE perjudican llevan borde blanco discontinuo; las tuyas, borde fino de su color.
const SUELO = {ok:false, H:88, rows:[{"n": "fuego", "w": 422, "h": 77, "bt": 13}, {"n": "veneno", "w": 422, "h": 79, "bt": 14}, {"n": "hielo", "w": 422, "h": 75, "bt": 10}, {"n": "agua", "w": 423, "h": 88, "bt": 22}, {"n": "electrico", "w": 423, "h": 81, "bt": 15}, {"n": "planta", "w": 423, "h": 73, "bt": 8}]};
{ const i = new Image(); i.onload = () => { SUELO.ok = true; }; i.src = 'assets/objetos/suelo.png?v=3'; SUELO.img = i; }
function suelo(q, len, w, a){                                   // dibuja la franja con su sprite (assets/objetos/suelo.png): 2 tapas y el centro repetido en espejo para que no se note el corte
  const R = SUELO.rows[['fuego', 'veneno', 'hielo', 'agua', 'electrico', 'planta'].indexOf(q.type)]; if(!R) return false;
  const i = ['fuego', 'veneno', 'hielo', 'agua', 'electrico', 'planta'].indexOf(q.type), sy = i * SUELO.H, bh = R.h - R.bt, s = 2 * w / bh, cap = 36, capD = cap * s, L = len + 2 * w, midD = L - 2 * capD, top = -w - R.bt * s;
  ctx.globalAlpha = a; const im = SUELO.img;
  ctx.drawImage(im, 0, sy, cap, R.h, -w, top, capD, R.h * s);
  ctx.drawImage(im, R.w - cap, sy, cap, R.h, -w + L - capD, top, capD, R.h * s);
  if(midD > 0){ const sw = R.w - 2 * cap, n = Math.max(1, Math.round(midD / (sw * s))), tw = midD / n;
    for(let k = 0; k < n; k++){ ctx.save(); const x0 = -w + capD + k * tw; if(k % 2){ ctx.translate(x0 + tw, 0); ctx.scale(-1, 1); } else ctx.translate(x0, 0); ctx.drawImage(im, cap, sy, sw, R.h, 0, top, tw, R.h * s); ctx.restore(); } }
  return true;
}
function fuegoFx(len, w, a, t){                                  // llamas de píxeles que bailan por la franja de fuego (cada columna de 4 px: núcleo claro → amarillo → naranja → rojo en la punta) + brasas que suben
  const n = Math.max(5, Math.floor((len + 2 * w) / 24));
  for(let i = 0; i < n; i++){
    const bx = Math.round((-w + 14 + HH(i, 31) * (len + 2 * w - 28)) / 4) * 4, by = Math.round(((HH(i, 33) - .5) * w * .8 + 14) / 4) * 4, sz = 26 + 24 * HH(i, 35), ph = HH(i, 37) * 6.3, ww = sz > 38 ? 4 : 3;
    for(let k = -ww; k <= ww; k++){
      const prof = Math.pow(1 - Math.abs(k) / (ww + 1.2), 1.2), fl = .72 + .28 * Math.sin(t * 9 + ph + k * 1.9) + .1 * Math.sin(t * 17 + i + k), hh = Math.max(8, sz * prof * fl * (.85 + .3 * HH(i * 7 + k + 20, 39))), cells = Math.ceil(hh / 4);
      for(let j = 0; j < cells; j++){
        const f = j / cells; let col = f < .28 && Math.abs(k) < ww ? '#fff6b0' : f < .55 ? '#ffd23a' : f < .82 ? '#ff8a1f' : '#d9381a';
        ctx.globalAlpha = a * (f > .85 ? .8 : 1); ctx.fillStyle = col; ctx.fillRect(bx + k * 4, by - (j + 1) * 4, 4, 4);
      }
    }
  }
  for(let i = 0; i < Math.max(5, n); i++){                          // brasas
    const p = (t * (.5 + HH(i, 41)) + HH(i, 43)) % 1, x = -w + 10 + HH(i, 45) * (len + 2 * w - 20) + Math.sin(t * 3 + i) * 5, y = w * .3 - p * (w * 1.5);
    ctx.globalAlpha = a * (1 - p); ctx.fillStyle = i % 2 ? '#ffe04a' : '#ff8a1f'; ctx.fillRect(Math.round(x / 3) * 3, Math.round(y / 3) * 3, 3, 3);
  }
}
function aguaFx(len, w, a, t){                                   // agua de píxeles: ondas que se abren y se apagan, gotas que saltan y caen, destellos que se deslizan
  const L = len + 2 * w, n = Math.max(3, Math.floor(L / 55));
  for(let i = 0; i < n; i++){                                       // ondas: anillos de píxeles que crecen (cada onda dura ~1,6 s)
    const per = 1.4 + HH(i, 51) * .9, p = ((t + HH(i, 53) * 5) / per) % 1, cyc = Math.floor((t + HH(i, 53) * 5) / per), hx = HH(i * 3 + cyc, 55), hy = HH(i * 5 + cyc, 57);
    const cx = -w + 22 + hx * (L - 44), cy = (hy - .5) * w * 1.1, rx = 5 + p * 22, ry = rx * .42;
    ctx.fillStyle = p < .35 ? '#ffffff' : '#bfeaff';
    for(let j = 0, N = Math.round(rx * 3.4); j < N; j++){ const an = j / N * 6.283; ctx.globalAlpha = a * Math.min(1, (1 - p) * 1.4); ctx.fillRect(Math.round((cx + Math.cos(an) * rx) / 2) * 2, Math.round((cy + Math.sin(an) * ry) / 2) * 2, 3, 3); }
    if(p < .18){ ctx.globalAlpha = a * (1 - p / .18); ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(cx / 2) * 2 - 2, Math.round(cy / 2) * 2 - 6 - Math.round(p * 30), 4, 4); }      // la gota que cae al agua
  }
  for(let i = 0; i < n; i++){                                       // gotas que saltan de la superficie y vuelven a caer
    const per = 1.1 + HH(i, 61) * .8, p = ((t + HH(i, 63) * 7) / per) % 1, x = -w + 16 + HH(i, 65) * (L - 32) + (p - .5) * 14, y = w * .15 - Math.sin(p * Math.PI) * (14 + 14 * HH(i, 67));
    ctx.globalAlpha = a * (p < .1 || p > .9 ? .5 : 1); ctx.fillStyle = i % 3 ? '#e6f7ff' : '#7fd0ff'; ctx.fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, 3, 3);
  }
  for(let i = 0; i < 2 + Math.floor(L / 120); i++){                 // destello: raya clara que cruza la franja en diagonal
    const p = ((t * .22 + HH(i, 71)) % 1), x = -w + p * (L + 40) - 20;
    ctx.globalAlpha = a * .22 * Math.sin(p * Math.PI); ctx.fillStyle = '#ffffff'; for(let k = 0; k < 6; k++) ctx.fillRect(Math.round((x + k * 6) / 2) * 2, -w + 6 + k * 14 - 8, 4, 12);
  }
}
// ASPECTO de las franjas: se dibujan translúcidas (se ve el suelo del estadio por debajo) y con el borde más suave que el centro, y NUNCA fuera del campo.
const SUELO_LOOK = {capas: [.3, .3, .26], paso: .2, fx: .6, borde: .6};      // [AJUSTE] opacidad de cada capa (la 1ª es la franja entera; cada una siguiente es más estrecha y se suma: borde ≈ 30 %, centro ≈ 64 %) · cuánto se estrecha cada capa (parte del ancho) · opacidad de ondas, gotas y llamas · del borde discontinuo de las que te perjudican
function terrCap(len, r){ ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(len, -r); ctx.arc(len, 0, r, -Math.PI / 2, Math.PI / 2); ctx.lineTo(0, r); ctx.arc(0, 0, r, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); }      // la forma de la franja (recta con las puntas redondas)
function terrClip(){                                             // recorta el dibujo al suelo del campo: lo que se sale (pared del fondo, gradas) no se pinta
  ctx.beginPath();
  if(typeof prOn === 'function' && prOn()){ const c = PR.cam, F = PR.floor, X = x => (x - c.ox) / c.s, Y = y => (y - c.oy) / c.s; ctx.moveTo(X(F.lt), Y(F.yt)); ctx.lineTo(X(F.rt), Y(F.yt)); ctx.lineTo(X(F.rb), Y(F.yb)); ctx.lineTo(X(F.lb), Y(F.yb)); ctx.closePath(); }      // estadio (Torre Batalla, Campo de pruebas, Clasificatoria): el campo en perspectiva, por sus líneas
  else ctx.rect(14, 146, W - 28, H - 70 - 146);                    // resto de arenas: la zona por la que se mueven los Pokémon (con un pequeño margen)
  ctx.clip();
}
// ---- ENTRENADORES EN EL CAMPO (de momento solo en la Historia de Kanto): tú a la izquierda y el líder a la derecha, fuera de las líneas del campo ----
// Imagen: assets/entrenadores_mini/kanto.png (una fila; cada entrenador ocupa 16x32 y mira a la IZQUIERDA). Créditos en assets/entrenadores_mini/CREDITOS.txt
// CÁMARA LEJANA (FAR): en la Historia de Kanto el combate se ve desde más lejos: un campo grande en el centro, con sus líneas, y una zona de fuera ancha con decoración del tipo del gimnasio.
//   pantalla = (mundo - centro) × z + centro   ·   el ratón se pasa al mundo con mouseWorld() (js/pruebas.js) y el táctil / mando con tW2S() (js/touch.js)
//   Los límites por donde se mueven los Pokémon salen de aquí (bx0, bx1, by0, by1 en js/combat.js).
const FAR = {z: .75, cy: 300,                                       // [AJUSTE] z = tamaño con que se ve todo (1 = como antes; más bajo = más lejos) · cy = altura de la pantalla que no se mueve al alejar
  fx: .58,                                                          // [AJUSTE] parte del ancho de la pantalla que ocupa el campo (el resto, a los lados, es la zona de fuera)
  yt: .262, yb: .985};                                              // [AJUSTE] a qué altura de la pantalla empieza y acaba el campo (0 = arriba del todo, 1 = abajo) cuando el estadio NO tiene imagen propia
const farOn = () => miniOn();
function farW2S(x, y){ return [(x - W / 2) * FAR.z + W / 2, (y - FAR.cy) * FAR.z + FAR.cy]; }
function farBarAlpha(){                                            // la barra de ataques se vuelve transparente si un Pokémon queda detrás
  const behind = [g.p[g.pi], g.e[g.ei]].some(f => { if(!f || f.dead) return false; const [sx, sy] = farW2S(f.x, f.y); return sy > H - 150 && Math.abs(sx - W / 2) < 330; });
  FAR.barA = (FAR.barA || 1) + ((behind ? .3 : 1) - (FAR.barA || 1)) * .15; return FAR.barA;
}
function farS2W(x, y){ return {x: (x - W / 2) / FAR.z + W / 2, y: (y - FAR.cy) / FAR.z + FAR.cy}; }
// ESTADIOS CON IMAGEN PROPIA: el fondo entero es una imagen (assets/fondos/estadios/) que ya trae pintadas las líneas del campo y la decoración de fuera.
//   court = dónde está el rectángulo del campo DENTRO de la imagen, en píxeles: [izquierda, arriba, derecha, abajo] · w, h = tamaño de la imagen
//   nuevo: true = estadio nuevo (estilo Gemini): ese líder deja el estadio grande con público (js/torreestadio.js) y usa esta imagen.
//   Para añadir otro: guarda la imagen y pon una línea con el id del líder (el de FLOORS, js/data.js). Si el campo está en otro sitio, mide su rectángulo.
// gradas = dónde se ponen los líderes que ya has vencido (pies, sobre 1024x572), de dentro a fuera; los de la izquierda miran a la derecha. Si no se pone, se usan las de Brock (GRADAS).
const GRADAS = [[362, 102], [327, 100], [292, 98], [257, 96], [662, 102], [697, 100], [732, 98], [767, 96]];      // en la parte de la grada que no tapa el marcador (los de las esquinas quedarían debajo)
// MEDIDAS: las imágenes van TAL CUAL (sin recortar ni deformar). De cada una se miden las 4 esquinas de su suelo de combate (sobre 1024x572):
//   trap = [x arriba izquierda, x arriba derecha, x abajo izquierda, x abajo derecha] · court = [x mínima, y de arriba, x máxima, y de abajo].
//   Los Pokémon se mueven por ese trapecio (estTrap): llegan a cada esquina del suelo sin salirse.
//   edge (opcional, en vez de trap) = el borde del suelo con más puntos, para suelos que no son un trapecio: [[y, x izquierda, x derecha], ...] de arriba abajo.
const EST_T = [225, 800, 135, 890], EST_C = [135, 170, 890, 445];
const EST = {                                                       // imágenes 2048x1144 (WebP, ~250 KB); court medido sobre 1024x572 · solo los estadios nuevos
  brock:    {src: 'assets/fondos/estadios/Kanto/brock.webp',    w: 1024, h: 572, court: [40, 158, 945, 452], nuevo: true,
             edge: [[158, 240, 800], [235, 100, 915], [340, 40, 945], [400, 130, 930], [452, 205, 845]]},      // el suelo entero, rodeando las rocas      // cueva de roca
  misty:    {src: 'assets/fondos/estadios/Kanto/misty.webp',    w: 1024, h: 572, court: [140, 175, 885, 458], trap: [220, 805, 140, 885], nuevo: true,       // piscina (imagen ajustada para que el campo mida igual que el de Brock)
             gradas: [[318, 74], [292, 72], [266, 70], [244, 68], [706, 74], [732, 72], [758, 70], [780, 68]]},
  lt_surge: {src: 'assets/fondos/estadios/Kanto/surge.webp',    w: 1024, h: 572, court: [102, 170, 924, 445], trap: [150, 875, 102, 924], nuevo: true},      // gimnasio eléctrico (suelo dorado)
  erika:    {src: 'assets/fondos/estadios/Kanto/erika.webp',    w: 1024, h: 572, court: [150, 200, 880, 440], trap: [215, 825, 150, 880], nuevo: true},      // jardín
  koga:     {src: 'assets/fondos/estadios/Kanto/koga.webp',     w: 1024, h: 572, court: [135, 190, 890, 418], trap: [245, 780, 135, 890], nuevo: true},      // dojo ninja
  sabrina:  {src: 'assets/fondos/estadios/Kanto/sabrina.webp',  w: 1024, h: 572, court: [125, 195, 900, 440], trap: [235, 790, 125, 900], nuevo: true},      // azotea de neón
  blaine:   {src: 'assets/fondos/estadios/Kanto/blaine.webp',   w: 1024, h: 572, court: [35, 162, 975, 452], nuevo: true,
             edge: [[162, 250, 770], [228, 110, 925], [330, 35, 975], [362, 90, 940], [400, 185, 860], [452, 235, 800]]},      // el suelo entero, rodeando las rocas y las máquinas      // volcán de Isla Canela
  giovanni: {src: 'assets/fondos/estadios/Kanto/giovanni.webp', w: 1024, h: 572, court: [180, 193, 835, 412], trap: [262, 765, 180, 835], nuevo: true},       // gimnasio de Ciudad Verde (Team Rocket)
  lorelei:  {src: 'assets/fondos/estadios/Kanto/lorelei.webp',  w: 1024, h: 572, court: [102, 188, 935, 450], trap: [172, 852, 102, 935], nuevo: true},      // Alto Mando: sala de hielo
  bruno:    {src: 'assets/fondos/estadios/Kanto/bruno.webp',    w: 1024, h: 572, court: [85, 190, 940, 450], trap: [175, 840, 85, 940], nuevo: true},       // Alto Mando: sala de lucha
  agatha:   {src: 'assets/fondos/estadios/Kanto/agatha.webp',   w: 1024, h: 572, court: [85, 190, 940, 455], trap: [160, 860, 85, 940], nuevo: true},       // Alto Mando: sala fantasma
  azul:     {src: 'assets/fondos/estadios/Kanto/azul.webp',     w: 1024, h: 572, court: [70, 205, 955, 455], trap: [150, 875, 70, 955], nuevo: true, anim: 'azul'},   // Campeón: paneles de luz que se mueven (estAzulFx)
  lance:    {src: 'assets/fondos/estadios/Kanto/lance.webp',    w: 1024, h: 572, court: [95, 195, 930, 445], trap: [210, 815, 95, 930], nuevo: true},      // Alto Mando: sala dorada del dragón
  // ---- Johto (los campos son las líneas blancas pintadas en cada imagen) ----
  pegaso:   {src: 'assets/fondos/estadios/Johto/pegaso.webp', w: 1024, h: 572, court: [140, 197, 882, 393], trap: [232, 800, 140, 882], nuevo: true},      // Ciudad Malva: torre de madera al aire libre
  anton:    {src: 'assets/fondos/estadios/Johto/anton.webp', w: 1024, h: 572, court: [110, 208, 924, 427], trap: [198, 828, 110, 924], nuevo: true},      // Azalea: invernadero del bosque
  blanca:   {src: 'assets/fondos/estadios/Johto/blanca.webp', w: 1024, h: 572, court: [100, 208, 927, 429], trap: [198, 826, 100, 927], nuevo: true},      // Ciudad Trigal: gimnasio rosa
  morti:    {src: 'assets/fondos/estadios/Johto/morti.webp', w: 1024, h: 572, court: [100, 208, 926, 428], trap: [200, 828, 100, 926], nuevo: true},      // Ciudad Iris: templo encantado
  anibal:   {src: 'assets/fondos/estadios/Johto/anibal.webp', w: 1024, h: 572, court: [97, 208, 928, 430], trap: [198, 826, 97, 928], nuevo: true},      // Ciudad Orquídea: dojo con cascada
  yasmina:  {src: 'assets/fondos/estadios/Johto/yasmina.webp', w: 1024, h: 572, court: [97, 208, 929, 430], trap: [198, 830, 97, 929], nuevo: true},      // Ciudad Olivo: gimnasio de acero
  fredo:    {src: 'assets/fondos/estadios/Johto/fredo.webp', w: 1024, h: 572, court: [100, 208, 926, 431], trap: [192, 830, 100, 926], nuevo: true},      // Pueblo Caoba: palacio de hielo
  debora:   {src: 'assets/fondos/estadios/Johto/debora.webp', w: 1024, h: 572, court: [96, 209, 928, 430], trap: [200, 828, 96, 928], nuevo: true},      // Ciudad Endrino: templo del dragón en el volcán
  // ---- Alto Mando y Campeón de Johto ----
  mento:    {src: 'assets/fondos/estadios/Johto/mento.webp', w: 1024, h: 572, court: [83, 192, 937, 457], trap: [193, 828, 83, 937], nuevo: true},      // Alto Mando: sala psíquica de Mento
  j_koga:   {src: 'assets/fondos/estadios/Johto/koga.webp', w: 1024, h: 572, court: [88, 192, 938, 458], trap: [193, 828, 88, 938], nuevo: true},      // Alto Mando: mazmorra ninja de Koga
  j_bruno:  {src: 'assets/fondos/estadios/Johto/bruno.webp', w: 1024, h: 572, court: [84, 192, 938, 458], trap: [194, 827, 84, 938], nuevo: true},      // Alto Mando: sala de lava de Bruno
  karen:    {src: 'assets/fondos/estadios/Johto/karen.webp', w: 1024, h: 572, court: [85, 192, 938, 459], trap: [193, 828, 85, 938], nuevo: true},      // Alto Mando: teatro nocturno de Karen
  j_lance:  {src: 'assets/fondos/estadios/Johto/lance.webp', w: 1024, h: 572, court: [85, 192, 938, 459], trap: [195, 828, 85, 938], nuevo: true}      // Campeón: salón dorado de Lance
};
function estLoad(E){ if(!E.img){ E.img = new Image(); E.img.onload = () => { E.ok = true; }; E.img.src = E.src + '?v=19'; } }
Object.values(EST).forEach(estLoad);                                // se cargan al abrir el juego: al entrar al combate ya están listas
const estEnt = () => (g && g.o && EST[g.o.leader]) || null;          // el estadio de este combate (aunque su imagen aún no haya cargado)
function estOf(){ const E = estEnt(); if(!E) return null; estLoad(E); return E.ok ? E : null; }
// LÍDERES VENCIDOS EN LA GRADA (Historia de Kanto): los que ya has derrotado antes que este vienen a verte (Brock en el de Misty; Brock y Misty en el de Surge...).
const FANS = {s: 1.6, on: false};      // (desactivado: no quedaba bien; true lo vuelve a poner)                                    // [AJUSTE] tamaño de cada entrenador en la grada (1 = 32 px) · false = sin público de líderes
function estFans(E){
  if(!FANS.on || !MINI.ok || !g || !g.o || typeof FLOORS === 'undefined') return;
  const cur = FLOORS[g.o.n]; if(!cur || cur.region !== 'Kanto') return;
  const hecho = typeof progOf === 'function' ? progOf('Kanto') : 0, seats = E.gradas || GRADAS;
  const fans = FLOORS.filter(F => F.region === 'Kanto' && F.idx < cur.idx && F.idx < hecho && F.id !== cur.id).map(F => miniIdx(F.id)).filter(i => i >= 0);
  const order = [0, 4, 1, 5, 2, 6, 3, 7];                             // se van llenando por los dos lados a la vez, de dentro a fuera
  const sx = W / E.w, sy = H / E.h, s = FANS.s * sy;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  fans.slice(0, seats.length).forEach((i, k) => {
    const q = seats[order[k] % seats.length] || seats[k], x = q[0] * sx, y = q[1] * sy, left = q[0] < E.w / 2;
    const bob = Math.sin(g.t * 3 + k * 1.3) > .7 ? -s : 0;             // de vez en cuando dan un saltito (animan)
    ctx.globalAlpha = .3; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(x, y, 7 * s, 2.4 * s, 0, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(Math.round(x), Math.round(y + bob)); if(left) ctx.scale(-1, 1);
    ctx.drawImage(MINI.img, (i % MINI.cols) * 32, Math.floor(i / MINI.cols) * 32, 32, 32, -16 * s, -30 * s, 32 * s, 32 * s); ctx.restore();
  });
  ctx.restore();
}
// ---- El campo en forma de trapecio: en cada altura, los Pokémon no pasan de los bordes del suelo (más cerca entre sí arriba que abajo) ----
function estTrapX(y){                                                // → [x izquierda, x derecha] del suelo a esa altura (en el mundo), o null si este combate no lo usa
  const E = typeof farOn === 'function' && farOn() ? estEnt() : null; if(!E || !(E.trap || E.edge)) return null;
  const t = E.trap, c = E.court, sx = W / E.w, sy = H / E.h;
  if(E.edge){                                                        // borde con varios puntos: se busca el tramo de esa altura
    const P = E.edge.map(([py, l, rr]) => { const a = farS2W(l * sx, py * sy), b = farS2W(rr * sx, py * sy); return [a.y, a.x, b.x]; });
    if(y <= P[0][0]) return [P[0][1], P[0][2]]; const L = P[P.length - 1]; if(y >= L[0]) return [L[1], L[2]];
    for(let i = 1; i < P.length; i++) if(y <= P[i][0]){ const A = P[i - 1], B = P[i], k = (y - A[0]) / (B[0] - A[0]); return [A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k]; }
  }
  const a = farS2W(t[0] * sx, c[1] * sy), b = farS2W(t[1] * sx, c[1] * sy), d = farS2W(t[2] * sx, c[3] * sy), e = farS2W(t[3] * sx, c[3] * sy);
  const k = Math.max(0, Math.min(1, (y - a.y) / (d.y - a.y)));
  return [a.x + (d.x - a.x) * k, b.x + (e.x - b.x) * k];
}
const EST_M = 40;                                                    // [AJUSTE] margen por dentro del borde (lo mismo que bx0 / bx1 en js/combat.js)
function estTrap(f){ if(!f) return; const X = estTrapX(f.y); if(!X) return; f.x = Math.max(X[0] + EST_M, Math.min(X[1] - EST_M, f.x)); }
if(typeof update === 'function'){ const o = update; update = function(){ const r = o.apply(this, arguments); try{ if(g && !g.pvp){ g.p.concat(g.e).forEach(f => { if(f && !f.dead) estTrap(f); }); } }catch(e){} return r; }; }
// ---- SALA DEL CAMPEÓN (Azul): los paneles de rayas azules tienen un brillo que los recorre, como en el juego original ----
//   Cada panel es un cuadrilátero (4 esquinas sobre 1024x572); v: 1 = el brillo baja (paneles de los lados), 0 = va de lado (paneles del fondo).
const AZUL_PANELS = (() => {
  const L = [[[14, 155], [39, 120], [39, 295], [14, 320]], [[56, 92], [80, 65], [80, 202], [56, 217]], [[93, 41], [115, 19], [115, 155], [93, 180]]];
  const side = L.map(q => ({q, v: 1})).concat(L.map(q => ({q: q.map(([x, y]) => [1024 - x, y]), v: 1})));
  const back = [];
  [[403, 468], [553, 619]].forEach(([x0, x1], s) => [[4, 17], [22, 35], [40, 53]].forEach(([y0, y1], r) => back.push({q: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], v: 0, rev: s === 0})));
  return side.concat(back);
})();
const AZUL_FX = {vel: .55, ancho: .22, a: .8};                        // [AJUSTE] velocidad del brillo · ancho de la banda (0-1) · intensidad
function estAzulFx(E){
  const sx = W / E.w, sy = H / E.h, t = g ? g.t : performance.now() / 1000, F = AZUL_FX;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  AZUL_PANELS.forEach((P, i) => {
    const q = P.q.map(([x, y]) => [x * sx, y * sy]), mid = (p, r) => [(p[0] + r[0]) / 2, (p[1] + r[1]) / 2];
    let a = P.v ? mid(q[0], q[1]) : mid(q[0], q[3]), b = P.v ? mid(q[3], q[2]) : mid(q[1], q[2]); if(P.rev){ const c = a; a = b; b = c; }
    const k = ((t * F.vel + (i % 6) * .17) % 1.5) - .25, cl = v => Math.max(0, Math.min(1, v));
    const gr = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
    gr.addColorStop(cl(k - F.ancho), 'rgba(120,230,255,0)'); gr.addColorStop(cl(k), `rgba(170,245,255,${F.a})`); gr.addColorStop(cl(k + F.ancho), 'rgba(120,230,255,0)');
    ctx.save(); ctx.beginPath(); q.forEach((p, j) => j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.clip();
    ctx.fillStyle = gr; const xs = q.map(p => p[0]), ys = q.map(p => p[1]);
    ctx.fillRect(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)); ctx.restore();
  });
  ctx.restore();
}
function estDraw(E){                                                // la imagen llena la pantalla; arriba se oscurece un poco para que se lea el marcador
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(E.img, 0, 0, W, H);
  const top = ctx.createLinearGradient(0, 0, 0, 150); top.addColorStop(0, 'rgba(3,4,10,.5)'); top.addColorStop(1, 'rgba(3,4,10,0)'); ctx.fillStyle = top; ctx.fillRect(0, 0, W, 150);
}
function farBox(){                                                  // las líneas de fuera del campo, en coordenadas del mundo (de aquí salen los límites bx0 … by1 de js/combat.js)
  const E = estEnt(), s = E ? [E.court[0] / E.w * W, E.court[1] / E.h * H, E.court[2] / E.w * W, E.court[3] / E.h * H] : [W * (1 - FAR.fx) / 2, H * FAR.yt, W * (1 + FAR.fx) / 2, H * FAR.yb];
  const a = farS2W(s[0], s[1]), b = farS2W(s[2], s[3]); return {x0: a.x, y0: a.y, x1: b.x, y1: b.y};
}
// ---- ENTRENADORES EN EL CAMPO: tú a la izquierda y el líder a la derecha, justo por dentro de las líneas ----
// Imagen: assets/entrenadores_mini/todos.png (rejilla de 24 columnas; cada entrenador ocupa 32x32 y mira a la IZQUIERDA). Créditos en assets/entrenadores_mini/CREDITOS.txt
// Tu personaje es el del perfil (save.gender, js/vspanel.js): chico, chica, los de logros y los de la Invocación. Si no hay dibujo pequeño del tuyo, sale Red (o Leaf si elegiste la chica).
const MINI = {ok: false, s: 2, x: 16, cols: 24,                     // [AJUSTE] tamaño en pantalla (x2) · a cuántos píxeles por DENTRO de la línea se ponen · columnas de la imagen
  names: ['red', 'leaf', 'blue', 'lucas', 'may', 'n', 'lance', 'brendan', 'ethan', 'aaron', 'acerola', 'acetrainer', 'acetrainerf', 'acetrainersnow', 'anabel', 'aquagrunt', 'aquagruntf', 'archer', 'archie', 'ariana', 'artist', 'barry', 'battlegirl', 'beauty', 'bede', 'bertha', 'birch', 'blackbelt', 'blaine', 'brandon', 'brawly', 'brock', 'bugcatcher', 'bugsy', 'byron', 'cameraman', 'camper', 'candice', 'charon', 'cheryl', 'chuck', 'clair', 'clay', 'clerk', 'colress', 'cook', 'cowgirl', 'crasherwake', 'cueball', 'cynthia', 'cyrus', 'daisy', 'dawn', 'dragontamer', 'drake', 'drayden', 'elesa', 'elm', 'erika', 'expert', 'expertf', 'falkner', 'fantina', 'fisherman', 'flannery', 'galacticgrunt', 'galacticgruntf', 'gamer', 'gardenia', 'gentleman', 'ghetsis', 'giovanni', 'glacia', 'greta', 'hexmaniac', 'hiker', 'iris', 'janine', 'jasmine', 'juan', 'jupiter', 'karen', 'kiawe', 'koga', 'korrina', 'lady', 'larry', 'lass', 'liza', 'ltsurge', 'lucian', 'lucy', 'magmagrunt', 'magmagruntf', 'marley', 'mars', 'maxie', 'maylene', 'mina', 'mira', 'misty', 'mom', 'morty', 'nessa', 'ninjaboy', 'noland', 'norman', 'nurse', 'oak', 'painter', 'palmer', 'parasollady', 'petrel', 'phoebe', 'picnicker', 'plasmagrunt', 'plasmagruntf', 'pokefan', 'pokefanf', 'pokekid', 'pokemaniac', 'proton', 'pryce', 'psychic', 'psychicf', 'rancher', 'reporter', 'richboy', 'roark', 'rocker', 'rocketgrunt', 'rocketgruntf', 'roughneck', 'rowan', 'roxanne', 'roxie', 'ruinmaniac', 'sabrina', 'sage', 'sailor', 'saturn', 'schoolkid', 'scientist', 'scott', 'shadowtriad', 'sidney', 'silver', 'skier', 'skierf', 'skyla', 'spenser', 'steven', 'supernerd', 'tate', 'tucker', 'veteran', 'volkner', 'waiter', 'waitress', 'wallace', 'wally', 'wattson', 'whitney', 'will', 'winona', 'worker', 'youngster', 'zinzolin']};      // orden en la imagen: es el nombre del personaje como en la Invocación (js/invdata.js), sin lo que va detrás del guion
const MINI_ALIAS = {m: 'red', r: 'red', f: 'leaf', maya: 'may', lt_surge: 'ltsurge', azul: 'blue', gold: 'ethan', pegaso: 'falkner', anton: 'bugsy', blanca: 'whitney', morti: 'morty', anibal: 'chuck', yasmina: 'jasmine', fredo: 'pryce', debora: 'clair', mento: 'will', j_koga: 'koga', j_bruno: 'bruno', j_lance: 'lance'};      // nombres del juego que en la imagen se llaman de otra forma
function miniIdx(id){                                               // código de personaje (perfil, Invocación o id de líder) → su casilla en la imagen (-1 si no hay dibujo)
  id = String(id || ''); if(id.startsWith('i:')) id = id.slice(2);
  id = MINI_ALIAS[id] || id; const k = id.split('-')[0]; return MINI.names.indexOf(MINI_ALIAS[k] || k);
}
{ const i = new Image(); i.onload = () => { MINI.ok = true; }; i.src = 'assets/entrenadores_mini/todos.png?v=1'; MINI.img = i; }
const miniOn = () => { const F = g && g.o && !g.pvp && g.o.floor && typeof FLOORS !== 'undefined' ? FLOORS[g.o.n] : null; return !!(F && F.id === g.o.leader && (F.region === 'Kanto' || (F.region === 'Johto' && typeof EST !== 'undefined' && EST[F.id]))); };      // ¿es un combate de la Historia de Kanto, o de un líder de Johto con su estadio nuevo?
function campoLineas(){                                             // la zona de fuera se oscurece un poco y el campo lleva sus líneas bien marcadas: borde oscuro, línea central y círculo
  const B = farBox(), cx = W / 2, cy = (B.y0 + B.y1) / 2, w = B.x1 - B.x0, big = 2000;
  ctx.save();
  ctx.fillStyle = 'rgba(4,6,12,.34)'; ctx.beginPath(); ctx.rect(-big, -big, big * 2 + W, big * 2 + H); ctx.rect(B.x0, B.y0, w, B.y1 - B.y0); ctx.fill('evenodd');      // fuera del campo, más oscuro
  ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(B.x0, B.y0, w, B.y1 - B.y0);                                                                              // dentro, un pelín más claro
  ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx, B.y0); ctx.lineTo(cx, B.y1); ctx.moveTo(B.x0 + w * .22, B.y0); ctx.lineTo(B.x0 + w * .22, B.y1); ctx.moveTo(B.x0 + w * .78, B.y0); ctx.lineTo(B.x0 + w * .78, B.y1); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(cx, cy, 96, 96 * .8, 0, 0, 6.283); ctx.stroke();
  ctx.strokeStyle = '#0d0f15'; ctx.lineWidth = 7; ctx.lineJoin = 'miter'; ctx.strokeRect(B.x0, B.y0, w, B.y1 - B.y0);                                             // borde: oscuro y grueso...
  ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 2; ctx.strokeRect(B.x0 + 6, B.y0 + 6, w - 12, B.y1 - B.y0 - 12);                                    // ...con un filo claro por dentro
  ctx.restore();
}
// ---- DECORACIÓN DE FUERA: cada gimnasio pone alrededor del campo cosas de su tipo (siempre en el mismo sitio). DECO: tipo del líder (tag de FLOORS) → qué se dibuja y con qué colores ----
const DECO = {                                                      // [AJUSTE] k = forma (roca · charco · cristal · mata · poste · lapida · llama) · c = colores [borde, base, luz, sombra] · mix = segunda forma que se alterna
  'Roca':      {k: 'roca',    c: ['#2a2c33', '#8b8f97', '#c3c7cf', '#5f636c']},
  'Agua':      {k: 'charco',  c: ['#123a7a', '#2f7fe0', '#bfe6ff', '#1b56b0'], mix: {k: 'roca', c: ['#1d2f4a', '#6f8fb5', '#b9d2ee', '#48607f']}},
  'Eléctrico': {k: 'poste',   c: ['#2a2a12', '#8f8f97', '#ffe04a', '#5a5a62']},
  'Planta':    {k: 'mata',    c: ['#12401c', '#2f9a44', '#8ee07a', '#1f6a30'], mix: {k: 'roca', c: ['#233018', '#6f8a5a', '#a9c48f', '#4a6038']}},
  'Veneno':    {k: 'charco',  c: ['#3a0f5c', '#8a3fc4', '#e0a8ff', '#5c2390'], mix: {k: 'mata', c: ['#2a1238', '#6a3a8a', '#b98ad8', '#45245e']}},
  'Psíquico':  {k: 'cristal', c: ['#5a1050', '#e05fb8', '#ffd0f0', '#a03088'], flota: 1},
  'Fuego':     {k: 'llama',   c: ['#5a0a05', '#d9381a', '#ffd23a', '#ff8a1f'], mix: {k: 'roca', c: ['#2a1410', '#6e4a40', '#a87a68', '#4a2e28']}},
  'Tierra':    {k: 'roca',    c: ['#2e2112', '#8a6a44', '#c4a070', '#5e4528']},
  'Hielo':     {k: 'cristal', c: ['#0f3a66', '#6fc4f2', '#e6f8ff', '#3a86c4']},
  'Lucha':     {k: 'roca',    c: ['#2e241c', '#8f7a66', '#c9b49c', '#5e4e40'], mix: {k: 'poste', c: ['#2a1a0c', '#8a5a2b', '#c9955a', '#5c3a1a']}},
  'Fantasma':  {k: 'lapida',  c: ['#1c1a26', '#6c6a80', '#a8a6c0', '#45435a'], mix: {k: 'llama', c: ['#1a0a3a', '#5a2aa8', '#d0a8ff', '#8a4fe0']}},
  'Dragón':    {k: 'cristal', c: ['#1a1266', '#5a4ae0', '#c8c0ff', '#3a2aa8'], mix: {k: 'roca', c: ['#1c1a33', '#5f5c8a', '#9a97c4', '#3d3a5e']}},
  'Campeón':   {k: 'cristal', c: ['#5c4205', '#e0b020', '#fff2b0', '#a87a10'], mix: {k: 'poste', c: ['#3a2a05', '#c9a030', '#ffe98a', '#8a6a14']}}
};
function decoDraw(k, x, y, s, c, sd, flota){
  const sh = () => { ctx.globalAlpha = .4; ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.ellipse(x + s * .15, y + s * .5, s * 1.05, s * .36, 0, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1; };
  ctx.lineJoin = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = c[0];
  if(k === 'roca'){ const q = HH(sd, 4); sh();
    ctx.beginPath(); ctx.moveTo(x - s, y + s * .35); ctx.lineTo(x - s * .8, y - s * .25); ctx.lineTo(x - s * (.2 + .2 * q), y - s * .7); ctx.lineTo(x + s * .45, y - s * .6); ctx.lineTo(x + s, y - s * .05); ctx.lineTo(x + s * .85, y + s * .4); ctx.lineTo(x, y + s * .55); ctx.closePath(); ctx.fillStyle = c[1]; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - s * .8, y - s * .25); ctx.lineTo(x - s * (.2 + .2 * q), y - s * .7); ctx.lineTo(x + s * .45, y - s * .6); ctx.lineTo(x + s * .1, y - s * .1); ctx.closePath(); ctx.fillStyle = c[2]; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + s * .1, y - s * .1); ctx.lineTo(x + s, y - s * .05); ctx.lineTo(x + s * .85, y + s * .4); ctx.lineTo(x, y + s * .55); ctx.closePath(); ctx.fillStyle = c[3]; ctx.fill(); }
  else if(k === 'charco'){ const w = s * 1.7, h = s * .7;                                    // charco: mancha ovalada con brillo y burbujas que suben
    ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, 0, 6.283); ctx.fillStyle = c[1]; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x + w * .15, y + h * .1, w * .6, h * .5, 0, 0, 6.283); ctx.fillStyle = c[3]; ctx.fill();
    ctx.strokeStyle = c[2]; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x - w * .3, y - h * .25, w * .3, h * .22, 0, 3.4, 5.6); ctx.stroke();
    for(let i = 0; i < 3; i++){ const p = (g.t * (.5 + HH(sd, i) * .5) + HH(sd, i + 5)) % 1; ctx.globalAlpha = 1 - p; ctx.fillStyle = c[2]; const z = 3 + HH(sd, i + 9) * 3; ctx.fillRect(Math.round(x + (HH(sd, i + 12) - .5) * w * 1.2), Math.round(y - p * s * 1.6), z, z); } ctx.globalAlpha = 1; }
  else if(k === 'cristal'){ const up = flota ? 10 + Math.sin(g.t * 2 + sd) * 6 : 0; sh();   // cristal: tres puntas; en Psíquico flota y sube y baja
    for(const [dx, hh, ww] of [[-s * .55, s * 1.1, s * .34], [s * .5, s * 1.3, s * .36], [0, s * 2, s * .46]]){ const bx = x + dx, by = y + s * .3 - up;
      ctx.beginPath(); ctx.moveTo(bx - ww, by); ctx.lineTo(bx - ww * .7, by - hh * .7); ctx.lineTo(bx, by - hh); ctx.lineTo(bx + ww * .7, by - hh * .7); ctx.lineTo(bx + ww, by); ctx.closePath(); ctx.fillStyle = c[1]; ctx.fill(); ctx.strokeStyle = c[0]; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx - ww, by); ctx.lineTo(bx - ww * .7, by - hh * .7); ctx.lineTo(bx, by - hh); ctx.lineTo(bx - ww * .1, by); ctx.closePath(); ctx.fillStyle = c[2]; ctx.fill();
      ctx.beginPath(); ctx.moveTo(bx + ww * .35, by); ctx.lineTo(bx, by - hh); ctx.lineTo(bx + ww * .7, by - hh * .7); ctx.lineTo(bx + ww, by); ctx.closePath(); ctx.fillStyle = c[3]; ctx.fill(); }
    const tw = .5 + .5 * Math.sin(g.t * 5 + sd * 3); ctx.globalAlpha = tw; ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x - 2), Math.round(y - s * 1.9 - up), 4, 4); ctx.globalAlpha = 1; }
  else if(k === 'mata'){ sh();                                                              // mata: tres bolas de hojas y alguna flor
    for(const [dx, dy, rr, col] of [[-s * .6, 0, s * .62, c[3]], [s * .6, s * .05, s * .58, c[3]], [0, -s * .35, s * .8, c[1]]]){ ctx.beginPath(); ctx.arc(x + dx, y + dy, rr, 0, 6.283); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = c[0]; ctx.lineWidth = 3; ctx.stroke(); }
    ctx.beginPath(); ctx.arc(x - s * .2, y - s * .6, s * .34, 0, 6.283); ctx.fillStyle = c[2]; ctx.fill();
    for(let i = 0; i < 3; i++){ ctx.fillStyle = i % 2 ? '#ffffff' : '#ffd23a'; ctx.fillRect(Math.round(x + (HH(sd, i) - .5) * s * 1.6), Math.round(y - s * .2 - HH(sd, i + 4) * s * .7), 4, 4); } }
  else if(k === 'poste'){ sh();                                                             // poste: columna con una bola arriba que chisporrotea
    ctx.fillStyle = c[1]; ctx.fillRect(x - s * .22, y - s * 1.8, s * .44, s * 2.2); ctx.strokeRect(x - s * .22, y - s * 1.8, s * .44, s * 2.2);
    ctx.fillStyle = c[3]; ctx.fillRect(x + s * .04, y - s * 1.8, s * .16, s * 2.2); ctx.fillStyle = c[1]; ctx.fillRect(x - s * .5, y + s * .25, s, s * .25); ctx.strokeRect(x - s * .5, y + s * .25, s, s * .25);
    ctx.beginPath(); ctx.arc(x, y - s * 2, s * .42, 0, 6.283); ctx.fillStyle = c[2]; ctx.fill(); ctx.stroke();
    if(Math.sin(g.t * 9 + sd * 5) > .2){ ctx.strokeStyle = c[2]; ctx.lineWidth = 2; ctx.beginPath(); for(let i = 0; i < 3; i++){ const an = HH(sd + Math.floor(g.t * 9), i) * 6.283; ctx.moveTo(x + Math.cos(an) * s * .5, y - s * 2 + Math.sin(an) * s * .5); ctx.lineTo(x + Math.cos(an + .4) * s * .9, y - s * 2 + Math.sin(an + .4) * s * .9); ctx.lineTo(x + Math.cos(an) * s * 1.2, y - s * 2 + Math.sin(an) * s * 1.2); } ctx.stroke(); } }
  else if(k === 'lapida'){ sh();                                                            // lápida: piedra redondeada con una cruz
    ctx.beginPath(); ctx.moveTo(x - s * .6, y + s * .4); ctx.lineTo(x - s * .6, y - s * .7); ctx.arc(x, y - s * .7, s * .6, Math.PI, 0); ctx.lineTo(x + s * .6, y + s * .4); ctx.closePath(); ctx.fillStyle = c[1]; ctx.fill(); ctx.stroke();
    ctx.fillStyle = c[3]; ctx.fillRect(x + s * .2, y - s * .9, s * .3, s * 1.25); ctx.fillStyle = c[2]; ctx.fillRect(x - s * .08, y - s * .95, s * .16, s * .8); ctx.fillRect(x - s * .3, y - s * .7, s * .6, s * .16); }
  else if(k === 'llama'){ const fl = .8 + .2 * Math.sin(g.t * 11 + sd * 4);                 // llama: cuenco oscuro con fuego que baila
    sh(); ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x, y + s * .2, s * .8, s * .34, 0, 0, 6.283); ctx.fill();
    for(const [kk, col] of [[1, c[1]], [.68, c[3]], [.38, c[2]]]){ const hh = s * 1.9 * kk * fl, ww = s * .62 * kk, lean = Math.sin(g.t * 6 + sd) * s * .18 * kk;
      ctx.beginPath(); ctx.moveTo(x - ww, y + s * .1); ctx.quadraticCurveTo(x - ww * 1.2, y - hh * .5, x + lean, y - hh); ctx.quadraticCurveTo(x + ww * 1.2, y - hh * .5, x + ww, y + s * .1); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); } }
}
function campoDeco(){
  const F = FLOORS[g.o.n], D = DECO[F.tag] || DECO['Roca'], B = farBox(), sd = (g.o.n || 0) * 13 + 5, vx = W * (1 / FAR.z - 1) / 2, vyT = (140 - FAR.cy) / FAR.z + FAR.cy, vyB = (H - FAR.cy) / FAR.z + FAR.cy, L = [];
  for(let i = 0; i < 70 && L.length < 30; i++){                                               // se reparten por los dos lados y por debajo, sin pisar el campo ni amontonarse
    const x = -vx + 20 + HH(sd + i, 1) * (W + 2 * vx - 40), y = vyT + HH(sd + i, 2) * (vyB - vyT - 10);
    if(x > B.x0 - 46 && x < B.x1 + 46 && y > B.y0 - 60 && y < B.y1 + 34) continue;
    if(L.some(o => Math.abs(o.x - x) < 62 && Math.abs(o.y - y) < 48)) continue;
    const m = D.mix && HH(sd + i, 6) > .55 ? D.mix : D; L.push({x, y, s: 15 + HH(sd + i, 3) * 15, k: m.k, c: m.c, sd: sd + i, fl: m.flota});
  }
  ctx.save(); L.sort((a, b) => a.y - b.y).forEach(o => decoDraw(o.k, o.x, o.y, o.s, o.c, o.sd, o.fl)); ctx.restore();
}
function miniOne(i, x, right){                                      // right = true: mira a la derecha (se voltea)
  if(i < 0) return; const s = MINI.s / FAR.z, w = 32 * s, h = 32 * s, y = Math.round((by0() + by1()) / 2) + 26, bob = Math.sin(g.t * 2.4 + (right ? 0 : 1.7)) > .6 ? -s : 0;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = .35; ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.ellipse(x, y, w * .18, w * .065, 0, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
  ctx.translate(Math.round(x), y + bob); if(right) ctx.scale(-1, 1);
  ctx.drawImage(MINI.img, (i % MINI.cols) * 32, Math.floor(i / MINI.cols) * 32, 32, 32, -w / 2, -h + 2 * s, w, h);
  ctx.restore();
}
function miniPos(side){ const B = farBox(), y = Math.round((by0() + by1()) / 2), X = typeof estTrapX === 'function' && estTrapX(y) || [B.x0, B.x1]; return side === 'p' ? {x: X[0] + MINI.x + 16, y: y - 6} : {x: X[1] - MINI.x - 16, y: y - 6}; }      // (con suelo en trapecio: justo por dentro de su borde a media altura)      // dónde está cada entrenador (de ahí sale la Poké Ball al cambiar: js/swap.js)
function miniDraw(){
  if(!MINI.ok) return;
  let me = miniIdx(typeof skinOf === 'function' ? skinOf() : save.gender); if(me < 0) me = miniIdx(save.gender === 'f' ? 'f' : 'm');
  miniOne(me, miniPos('p').x, true);                               // tú: el personaje de tu perfil
  miniOne(miniIdx(g.o.leader), miniPos('e').x, false);   // el líder (si no hay dibujo suyo, no sale nadie)
}
function terrDraw(){
  if(!g.terr || !g.terr.length) return;
  ctx.save(); terrClip();
  for(const q of g.terr || []){
    const dx = q.x1 - q.x0, dy = q.y1 - q.y0, len = Math.hypot(dx, dy); if(len < 6) continue;
    const a = clamp(Math.min(q.t / .25, (q.T - q.t) / .8), 0, 1), col = TC[q.type] || '#ffffff', w = q.w, bad = !TERR[q.type].heal && q.mine === (g.me === 'e'), t = g.t, ux = dx / len, uy = dy / len;
    ctx.save(); ctx.translate(q.x0, q.y0); ctx.rotate(Math.atan2(dy, dx));
    let spr = false;
    if(SUELO.ok) SUELO_LOOK.capas.forEach((al, k) => { ctx.save(); if(k){ terrCap(len, w * (1 - SUELO_LOOK.paso * k)); ctx.clip(); } spr = suelo(q, len, w, a * al) || spr; ctx.restore(); });      // por capas: entera y floja, y encima el centro (cada vez más estrecho) → borde difuminado
    terrCap(len, w);                                  // con sprite: se dibuja la imagen; sin él, el dibujo de siempre
    if(!spr){ ctx.globalAlpha = .32 * a; ctx.fillStyle = col; ctx.fill(); }
    if(spr && q.type === 'fuego') fuegoFx(len, w, a * SUELO_LOOK.fx, t);
    else if(spr && q.type === 'agua') aguaFx(len, w, a * SUELO_LOOK.fx, t);                                   // agua: ondas y gotas dibujadas                                           // fuego: llamas dibujadas en vez de las del sprite
    if(!spr || bad){ ctx.globalAlpha = (spr ? SUELO_LOOK.borde : .85) * a; ctx.lineWidth = bad ? 3 : 2; ctx.strokeStyle = bad ? '#ffffff' : col; if(bad) ctx.setLineDash([11, 8]); ctx.stroke(); ctx.setLineDash([]); }      // las que te perjudican llevan borde blanco discontinuo
    ctx.restore();
    if(SUELO.ok) continue;
    ctx.save();
    for(let i = 0, n = Math.max(3, Math.floor(len / 30)); i < n; i++){                // detalle animado de cada tipo, repartido a lo largo de la franja
      const lx = HH(i, 21) * len, ly = (HH(i, 23) - .5) * w * 1.5, x = q.x0 + ux * lx - uy * ly, y = q.y0 + uy * lx + ux * ly, ph = (t * (.8 + HH(i, 25)) + HH(i, 27)) % 1;
      ctx.globalAlpha = a * (1 - ph) * .95;
      if(q.type === 'fuego'){ const h = 10 + 16 * (1 - ph); ctx.fillStyle = i % 2 ? '#ffe04a' : '#ff8a1f'; ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.quadraticCurveTo(x + Math.sin(t * 9 + i) * 3, y - h * 1.9, x + 5, y); ctx.fill(); }
      else if(q.type === 'veneno'){ ctx.fillStyle = '#d98cff'; ctx.beginPath(); ctx.arc(x, y - ph * 22, 2 + 4 * (1 - ph), 0, 6.3); ctx.fill(); }
      else if(q.type === 'hielo'){ ctx.globalAlpha = a * .8; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 9, y + 4); ctx.lineTo(x + 9, y - 4); ctx.stroke(); }
      else if(q.type === 'agua'){ ctx.strokeStyle = '#d6f1ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, 3 + ph * 12, (3 + ph * 12) * .55, 0, 0, 6.3); ctx.stroke(); }
      else if(q.type === 'electrico'){ if(ph > .35) continue; ctx.globalAlpha = a; ctx.strokeStyle = '#fff7a8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 8, y - 10); ctx.lineTo(x + 2, y - 2); ctx.lineTo(x - 3, y + 2); ctx.lineTo(x + 8, y + 10); ctx.stroke(); }
      else{ ctx.globalAlpha = a * .9; ctx.strokeStyle = i % 2 ? '#bdf47c' : '#3fae3a'; ctx.lineWidth = 2.5; const sw = Math.sin(t * 2.5 + i) * 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sw, y - 20); ctx.moveTo(x + 4, y); ctx.lineTo(x + 6 + sw, y - 14); ctx.stroke(); }
    }
    ctx.restore();
  }
  ctx.restore();
}
// EFECTO DE CARGA (clic mantenido y ataque fuerte): bolita con aro amarillo → brillo con chispas → torbellino blanco → estallido de estrella. k = 0..1 de lo cargado; ok = ya cuenta
function chgFxDraw(f, k, ok){
  const c1 = ok ? '#ffffff' : '#ffe04a', pul = .75 + .25 * Math.sin(g.t * (ok ? 30 : 16)), cx = f.x, cy = f.y - 6;
  ctx.save();
  const R0 = 30 + 26 * k, hg = ctx.createRadialGradient(cx, cy, 4, cx, cy, R0); hg.addColorStop(0, ok ? 'rgba(255,255,255,.55)' : 'rgba(255,224,74,.45)'); hg.addColorStop(1, 'rgba(255,224,74,0)');
  if(k > .2){ ctx.globalAlpha = pul * Math.min(1, (k - .2) * 4); ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx, cy, R0, 0, 6.3); ctx.fill(); }               // brillo en el cuerpo (desde 0,2)
  ctx.globalAlpha = ok ? 1 : .75; ctx.strokeStyle = c1; ctx.lineWidth = ok ? 5 : 3.5; ctx.beginPath(); ctx.ellipse(f.x, f.y + 22, 14 + 32 * k, (14 + 32 * k) * .4, 0, 0, 6.3); ctx.stroke();   // aro a los pies
  const ns = k < .2 ? 3 : 8;
  for(let i = 0; i < ns; i++){ const ph = (g.t * 2.4 + i / ns) % 1, an = i * (6.28 / ns) + g.t * 1.5, rr = (1 - ph) * (40 + 26 * k) + 8; ctx.globalAlpha = ph * .95; ctx.fillStyle = i % 2 ? '#ffffff' : '#ffe04a'; ctx.fillRect(cx + Math.cos(an) * rr - 2.5, cy + Math.sin(an) * rr * .8 - 2.5, 5, 5); }   // chispas que acuden
  if(k > .45){                                                       // torbellino blanco: dos espirales que giran alrededor
    ctx.strokeStyle = '#ffffff'; ctx.lineCap = 'round'; ctx.lineWidth = 3;
    for(let s = 0; s < 2; s++){ ctx.globalAlpha = Math.min(.9, (k - .45) * 4) * (s ? .6 : 1); ctx.beginPath();
      for(let t = 0; t <= 1; t += .05){ const an = g.t * 7 * (s ? -1 : 1) + t * 9 + s * 3, rr = 14 + 34 * t, yy = cy + 26 - t * 62; t ? ctx.lineTo(cx + Math.cos(an) * rr, yy + Math.sin(an) * rr * .3) : ctx.moveTo(cx + Math.cos(an) * rr, yy + Math.sin(an) * rr * .3); }
      ctx.stroke(); }
  }
  if(k > .8){                                                        // estallido: estrella blanca que late + destellos
    const sp = 16, ro = 52 + 10 * Math.sin(g.t * 28), ri = 30; ctx.globalAlpha = .55 + .3 * Math.sin(g.t * 24); ctx.fillStyle = '#ffffff'; ctx.beginPath();
    for(let i = 0; i < sp * 2; i++){ const an = i * Math.PI / sp + g.t * .8, rr = i % 2 ? ri : ro; i ? ctx.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr) : ctx.moveTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); }
    ctx.closePath(); ctx.fill();
    for(let i = 0; i < 3; i++){ const an = g.t * 5 + i * 2.1, rr = 48 + 8 * Math.sin(g.t * 20 + i); ctx.globalAlpha = 1; ctx.fillStyle = '#ffe04a'; ctx.fillRect(cx + Math.cos(an) * rr - 4, cy + Math.sin(an) * rr - 4, 8, 8); }
  }
  ctx.restore();
}
function frzDraw(f){                                            // congelado: un bloque de hielo encima del Pokémon, con brillos; tiembla cuando está a punto de romperse
  const u = Math.min(1, f.frz / .35), sh = f.frz < .35 ? Math.sin(g.t * 60) * 2 : 0, cx = f.x + sh, top = f.y - 62, bot = f.y + 30, hw = 40;
  ctx.save(); ctx.globalAlpha = .62 * u + .2;
  ctx.beginPath(); ctx.moveTo(cx - hw, bot); ctx.lineTo(cx - hw * 1.05, top + 30); ctx.lineTo(cx - hw * .5, top + 6); ctx.lineTo(cx, top - 6); ctx.lineTo(cx + hw * .55, top + 6); ctx.lineTo(cx + hw * 1.05, top + 30); ctx.lineTo(cx + hw, bot); ctx.closePath();
  ctx.fillStyle = 'rgba(150,215,255,.6)'; ctx.fill(); ctx.strokeStyle = '#2a5fa8'; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke(); ctx.strokeStyle = '#e6f6ff'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - hw * .7, top + 34); ctx.lineTo(cx - hw * .35, top + 14); ctx.moveTo(cx - hw * .72, top + 52); ctx.lineTo(cx - hw * .6, top + 44); ctx.stroke();
  for(let i = 0; i < 4; i++){ const tw = .5 + .5 * Math.sin(g.t * 6 + i * 1.7); ctx.globalAlpha = tw * u; ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(cx + (HH(i, 3) - .5) * hw * 1.5), Math.round(top + 10 + HH(i, 5) * 70), 4, 4); }
  ctx.restore();
}
function psiDraw(T){                                            // Psíquico: el rival atrapado (aura rosa que late) y, mientras eliges, la línea y la diana de adónde lo vas a lanzar
  const p = T.psi, pul = .6 + .4 * Math.sin(g.t * 16), cx = T.x, cy = T.y - 8;
  ctx.save();
  ctx.globalAlpha = .35 * pul; ctx.fillStyle = '#ff5fb0'; ctx.beginPath(); ctx.arc(cx, cy, 44, 0, 6.3); ctx.fill();
  ctx.lineWidth = 3;
  for(let i = 0; i < 2; i++){ ctx.globalAlpha = .9; ctx.strokeStyle = i ? '#7de3ff' : '#ff8fd0'; ctx.beginPath(); ctx.ellipse(cx, cy, 46, 16, g.t * (i ? -3 : 3) + i * 1.57, 0, 6.3); ctx.stroke(); }
  for(let i = 0; i < 6; i++){ const an = g.t * 4 + i * 1.05, rr = 40 + 6 * Math.sin(g.t * 9 + i); ctx.globalAlpha = .9; ctx.fillStyle = i % 2 ? '#ffffff' : '#ffa8d8'; ctx.fillRect(cx + Math.cos(an) * rr - 2, cy + Math.sin(an) * rr * .7 - 2, 4, 4); }
  if(!p.fly && !p.ai){
    const x1 = clamp(p.mx, bx0(), bx1()), y1 = clamp(p.my, by0(), by1());
    ctx.globalAlpha = .85; ctx.strokeStyle = '#ff8fd0'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -g.t * 60; ctx.beginPath(); ctx.moveTo(cx, cy + 20); ctx.lineTo(x1, y1 + 22); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x1, y1 + 22, 30 * pul + 8, (30 * pul + 8) * .4, 0, 0, 6.3); ctx.stroke();
    ctx.fillStyle = '#ff5fb0'; ctx.fillRect(x1 - 3, y1 + 19, 6, 6);
  }
  ctx.restore();
}
function windDraw(){
  for(const f of [g.p[g.pi], g.e[g.ei]]){
    if(f.ctr > 0 && !f.dead && !f.ghost){ ctx.save(); ctx.globalAlpha = .55 + .4 * Math.sin(g.t * 22); ctx.strokeStyle = '#7fe3ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(f.x, f.y + 22, 34, 13, 0, 0, 6.3); ctx.stroke(); ctx.restore(); }      // contraataque listo: aro azul a sus pies
    if(f.frz > 0 && !f.dead && !f.ghost) frzDraw(f);                                          // congelado por Ventisca
    if(f.psi && !f.dead && !f.ghost) psiDraw(f);                                              // atrapado por Psíquico
    if(f.jump && !f.dead && !f.ghost && typeof nvJumpDraw === 'function') nvJumpDraw(f);      // salto (Golpe Cuerpo, Vuelo): la diana donde va a caer (js/fxnuevos.js)
    if(f.spin && !f.dead && !f.ghost && typeof nvSpinDraw === 'function') nvSpinDraw(f);      // Torbellino: los brazos de agua (js/fxnuevos.js)
    if(f.mc > .12 && !f.dead && !f.ghost) chgFxDraw(f, clamp(f.mc / FEEL.chgT, 0, 1), f.mc >= FEEL.chgMin);      // golpe cargándose (mantienes el clic)
    const w = f.wind; if(!w || f.dead || f.ghost) continue;
    if(typeof nvWindFx === 'function') nvWindFx(f, w);                              // carga propia de algunos ataques fuertes (la bola de luz del Rayo Solar: js/fxnuevos.js)
    const k = w.hold ? clamp(w.c / FEEL.windMax, 0, 1) : clamp(1 - w.t / w.T, 0, 1), col = TC[w.type] || '#ffffff', len = 640, hw = 24, fijo = feelFoe(f) && w.t <= w.T * FEEL.windLock;
    chgFxDraw(f, k, w.hold ? w.c >= FEEL.wind : k > .3);                                                                                  // ataque fuerte cargándose: mismo efecto que el golpe cargado
    ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(w.ang);
    const gr = ctx.createLinearGradient(0, 0, len, 0); gr.addColorStop(0, col); gr.addColorStop(1, col + '00');
    ctx.fillStyle = gr; ctx.globalAlpha = .14 + .16 * k; ctx.fillRect(18, -hw, len, hw * 2);                 // el carril entero
    ctx.globalAlpha = .3 + .3 * k; ctx.fillRect(18, -hw, len * k, hw * 2);                                    // la parte que se va llenando
    ctx.globalAlpha = .55 + .45 * k; ctx.strokeStyle = fijo ? '#ffffff' : col; ctx.lineWidth = fijo ? 3 : 2; if(!fijo) ctx.setLineDash([12, 9]);
    ctx.beginPath(); ctx.moveTo(18, -hw); ctx.lineTo(len * .8, -hw); ctx.moveTo(18, hw); ctx.lineTo(len * .8, hw); ctx.stroke();
    ctx.restore();
  }
}
// Forma del golpe cuerpo a cuerpo (f.swing, combat.js): una línea (estocada), un arco (barrido) o un anillo (giro) que dura un instante
function swingDraw(){
  for(const f of [g.p[g.pi], g.e[g.ei]]){
    const s = f.swing; if(!s || f.ghost) continue;
    const a = (g.t - s.t0) / .22; if(a < 0 || a >= 1) continue;
    const K = s.k, R = K.reach + 16, grow = Math.min(1, a * 2.4);
    ctx.save(); ctx.translate(f.x, f.y - 6); ctx.globalAlpha = .8 * (1 - a); ctx.strokeStyle = s.big ? '#ffe04a' : TC[s.type] || '#ffffff'; ctx.lineCap = 'round'; ctx.lineWidth = (11 * (1 - a) + 3) * (s.big ? 1.8 : 1);
    ctx.beginPath();
    if(K.lunge){ ctx.rotate(s.ang); ctx.moveTo(24, 0); ctx.lineTo(24 + (R - 24) * grow, 0); }
    else if(K.arc >= Math.PI) ctx.arc(0, 0, R * (.45 + .45 * grow), 0, 6.3);
    else ctx.arc(0, 0, R * .8, s.ang - K.arc, s.ang - K.arc + K.arc * 2 * grow);
    ctx.stroke(); ctx.restore();
  }
}
// Pilar (PIL, combat.js): una ROCA dibujada a píxeles gordos, como los sprites del juego (o = borde · l = luz · m = medio · d = sombra). Su base está a la altura de los pies de los Pokémon.
// Mientras cae se ve su sombra creciendo; con cada golpe le salen grietas; al recibir un golpe destella; antes de deshacerse parpadea.
const PIL_ART = [
  '....oooooo....',
  '...ollllllo...',
  '..olllllmmmo..',
  '..ollllmmmmo..',
  '..olllmmmmdo..',
  '..ollmmmmddo..',
  '.ollmmmmmddo..',
  '.olmmmmmdddo..',
  '.ollmmmmdddo..',
  '.olmmmmmmddo..',
  'ollmmmmmdddo..',
  'olmmmmmmddddo.',
  'olmmmmmdddddo.',
  '.ommmdddddddo.',
  '..oooooooooo..'
];
// [AJUSTE] Colores del pilar según el ESCENARIO: el tipo del gimnasio (la etiqueta del rival: «Agua» contra Misty, «Roca» contra Brock...). Si el rival no tiene un tipo
// (un Campeón, el Campo de Entrenamiento), se usa el primer tipo de su primer Pokémon. l = luz · m = medio · d = sombra · o = borde y grietas
const PIL_THEMES = {
  normal:    {l:'#d6d9e0', m:'#9ca1ad', d:'#676d7b', o:'#23262f'},
  roca:      {l:'#d9cdb4', m:'#a8997a', d:'#73674f', o:'#2b2418'},
  agua:      {l:'#cfeeff', m:'#6cb4ee', d:'#2f6fb8', o:'#12305c'},
  electrico: {l:'#fff6b0', m:'#f2cf3a', d:'#b08a12', o:'#4a3a05'},
  planta:    {l:'#c9f29a', m:'#6fbf4a', d:'#3b7d2c', o:'#173a12'},
  veneno:    {l:'#e6b8f2', m:'#a45cc0', d:'#6a3285', o:'#2d1239'},
  psiquico:  {l:'#ffc9e3', m:'#ee6fa8', d:'#a83a72', o:'#451230'},
  fuego:     {l:'#ffd08a', m:'#f07a2a', d:'#a8401a', o:'#3d1408'},
  tierra:    {l:'#ecd9a0', m:'#c9a65a', d:'#8a6c30', o:'#3a2a0e'},
  hielo:     {l:'#f0fdff', m:'#a5e3f0', d:'#5aa9c4', o:'#1c4a5c'},
  lucha:     {l:'#f2b6a0', m:'#c8553a', d:'#8a2f1e', o:'#3a110a'},
  fantasma:  {l:'#c9c0f0', m:'#7a68b8', d:'#463a80', o:'#1b1438'},
  dragon:    {l:'#c4b8ff', m:'#7558f0', d:'#4530a8', o:'#190f4a'},
  acero:     {l:'#eef1f6', m:'#b4bcc9', d:'#7a8494', o:'#272c36'},
  volador:   {l:'#e6ecff', m:'#a9b8f0', d:'#6f7fc0', o:'#252c52'},
  bicho:     {l:'#e0ef9a', m:'#a8bf2a', d:'#6c7d14', o:'#2c3306'},
  siniestro: {l:'#b4a59a', m:'#70584a', d:'#44332a', o:'#1a120d'},
  hada:      {l:'#ffe0ee', m:'#f29ac0', d:'#c0608a', o:'#4a1f33'}
};
function pilTheme(){                                                 // el tema de este combate (se decide una vez)
  if(g.pilTh) return g.pilTh;
  let k = String((g.o && g.o.tag) || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if(!PIL_THEMES[k]) k = (g.e[0] && g.e[0].m && g.e[0].m.types && g.e[0].m.types[0]) || 'normal';
  return g.pilTh = PIL_THEMES[k] ? k : 'normal';
}
const PIL_CRACK = [[[6,3],[6,4],[5,5],[5,6],[6,7]], [[9,8],[8,9],[8,10],[9,11],[4,10],[4,11]], [[7,8],[7,9],[6,10],[6,11],[7,12],[10,5],[9,6],[3,7],[3,8]]];   // grietas que se van sumando (columna, fila)
const pilCache = {};
function pilSprite(cell, dmg, flash, th){                                // el dibujo ya hecho para ese tamaño y ese estado (se pinta una sola vez)
  const key = th + '|' + cell + '|' + dmg + '|' + (flash ? 1 : 0), PIL_COL = PIL_THEMES[th]; if(pilCache[key]) return pilCache[key];
  const c = document.createElement('canvas'); c.width = 14 * cell; c.height = PIL_ART.length * cell; const x = c.getContext('2d');
  PIL_ART.forEach((row, j) => { for(let i = 0; i < 14; i++){ const ch = row[i]; if(ch === '.') continue; x.fillStyle = flash && ch !== 'o' ? '#ffffff' : PIL_COL[ch]; x.fillRect(i * cell, j * cell, cell, cell); } });
  x.fillStyle = PIL_COL.o; for(let k = 0; k < dmg; k++) PIL_CRACK[k].forEach(([i, j]) => x.fillRect(i * cell, j * cell, cell, cell));
  return pilCache[key] = c;
}
function pilDrawOld(p){
  const r = p.r, y0 = p.y + 22, e = r * .38, k = p.fall > 0 ? clamp(p.fall / PIL.fall, 0, 1) : 0, up = k * k * 560;
  const cell = Math.max(2, Math.round(r * 2.5 / 14)), im = pilSprite(cell, clamp(Math.ceil(PIL.hp - p.hp), 0, 3), p.hitT > 0, pilTheme());
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${(.36 * (1 - k * .7)).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(p.x + 5 * (1 - k), y0 + 3, r * 1.35 * (1 - k * .6), e * 1.2 * (1 - k * .6), 0, 0, 6.3); ctx.fill();   // sombra (avisa de dónde va a caer)
  if(!k && PIL.life - p.age < 2.5) ctx.globalAlpha = .55 + .45 * Math.sin(g.t * 20);                                                                                                            // a punto de deshacerse
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(im, Math.round(p.x - im.width / 2), Math.round(y0 + cell - im.height - up));
  ctx.restore();
}

// ---- PILARES CON DIBUJO: assets/objetos/pilares.png (18 filas = 18 tipos, en el orden de PIL_THEMES; 7 columnas: entero · entero · agrietado · se inclina · cae y se parte · estalla · ruinas) ----
const PIL_IMG = {ok:false, xs:[0,61,124,188,286,382,497,572], ys:[0,62,121,182,239,295,352,408,465,521,577,632,688,744,799,854,910,966,1024],
  rows:['normal','roca','agua','electrico','planta','veneno','psiquico','fuego','tierra','hielo','lucha','fantasma','dragon','acero','volador','bicho','siniestro','hada']};
{ const i = new Image(); i.onload = () => { PIL_IMG.ok = true; }; i.src = 'assets/objetos/pilares.png?v=1'; PIL_IMG.img = i; }
function pilFrame(th, c, x, base, flip, alpha, dy){                  // dibuja el cuadro c del pilar de ese tipo con la base en (x, base)
  const r = Math.max(0, PIL_IMG.rows.indexOf(th)), X = PIL_IMG.xs, Y = PIL_IMG.ys, S = PIL.r / 11;
  const sx = X[c] + 2, sw = X[c + 1] - X[c] - 3, sy = Y[r] + 2, sh = Y[r + 1] - Y[r] - 3, dw = sw * S, dh = sh * S;
  ctx.save(); if(alpha < 1) ctx.globalAlpha *= alpha; ctx.imageSmoothingEnabled = false; ctx.translate(Math.round(x), Math.round(base + 6 * S - (dy || 0)));
  if(flip) ctx.scale(-1, 1);
  ctx.drawImage(PIL_IMG.img, sx, sy, sw, sh, Math.round(-dw / 2), Math.round(-dh), Math.round(dw), Math.round(dh)); ctx.restore();
}
function pilDraw(p){
  if(!PIL_IMG.ok) return pilDrawOld(p);
  const r = p.r, y0 = p.y + 22, e = r * .38, k = p.fall > 0 ? clamp(p.fall / PIL.fall, 0, 1) : 0, up = k * k * 560, th = pilTheme(), dmg = clamp(Math.ceil(PIL.hp - p.hp), 0, 3);
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${(.36 * (1 - k * .7)).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(p.x + 5 * (1 - k), y0 + 3, r * 1.35 * (1 - k * .6), e * 1.2 * (1 - k * .6), 0, 0, 6.3); ctx.fill();   // sombra (avisa de dónde va a caer)
  if(!k && PIL.life - p.age < 2.5) ctx.globalAlpha = .55 + .45 * Math.sin(g.t * 20);                                                                                                            // a punto de deshacerse
  pilFrame(th, dmg >= 2 ? 2 : 0, p.x + (p.hitT > 0 ? (Math.random() - .5) * 5 : 0), y0, false, 1, up);                                                                                           // al recibir un golpe tiembla; con poca vida sale agrietado
  ctx.restore();
}
function pilFxDraw(f){                                               // restos de un pilar que se ha roto: se inclina, se parte, estalla y quedan las ruinas (solo visual)
  const a = g.t - f.t0, th = f.th, flip = f.seed > .5; if(a < 0 || a > 1.7) return;
  const c = a < .14 ? 3 : a < .3 ? 4 : a < .55 ? 5 : 6, al = a > 1.2 ? clamp((1.7 - a) / .5, 0, 1) : 1;
  pilFrame(th, c, f.x, f.y + 22, flip, al, 0);
}
function drawF(f, col){
  if(f.ghost || (g.mega && g.mega.f === f)) return;   // en pleno cambio (o megaevolucionando): lo dibuja su animación (swap.js / mega.js)
  const I = idleInfo(f.m.dex);
  const hid = f.hide > 0 || !!(f.jump && f.jump.K.dig && f.jump.t > .14 && f.jump.t < f.jump.T - f.jump.K.down), lg = fxLunge(f); lg.y -= (typeof fxLift === 'function' ? fxLift(f) : 0) + (f.jump && typeof nvJumpLift === 'function' ? nvJumpLift(f) : 0) + (f.ride && typeof hdSurfLift === 'function' ? hdSurfLift(f) : 0);                                   // hide: bajo tierra (Excavar) · lg: avance visual al atacar
  if(!hid) shadow(f.x, f.y + I.foot*ESCALA - 2, Math.max(30, I.fw*ESCALA*.42));
  const inv = f.inv > 0 && !f.dead && !f.jump; if(inv){ ctx.save(); ctx.globalAlpha = .5; }                                               // esquivando con la carrera: se ve translúcido
  const okSpr = hid || (f.spin && !f.dead && typeof nvShellDraw === 'function' && nvShellDraw(f, lg)) || ((AP) => drawFrame(ctx, f.m.dex, AP[0], AP[1], f.dir, f.x + lg.x, f.y + lg.y, ESCALA, 0, f.shiny))(typeof anPick === 'function' ? anPick(f) : [f.act, f.at]);      // anPick: animaciones extra (js/anims.js) · Torbellino de Squirtle y familia: el caparazón en vez del sprite (js/fxnuevos.js)
  if(inv) ctx.restore();
  if(!hid && !okSpr && sheet(f.m.dex, 'Idle', false).bad){      // sin sprite (de verdad, no solo cargando): círculo
    ctx.fillStyle = TC[f.m.types[0]]; ctx.beginPath(); ctx.arc(f.x + lg.x, f.y + lg.y, 30, 0, 7); ctx.fill();
    text(f.m.name[0], f.x + lg.x, f.y+8 + lg.y, 20, '#10141e', 'center');
  }
  if(f.buff > 0 && !hid) fxAura(f, I);                                         // aura de la mejora activa (5 s)
  if(!hid && !f.dead && hasStatus(f)) fxStatusAura(f, I);                      // aura del estado (paralizado, veneno, quemadura, sueño, confusión)
  if(!f.dead) bar(f.x-30, f.y + I.top*ESCALA - 14, 60, 7, f.hp, f.max, col);
  if(!f.dead && hasStatus(f)) statusChips(f, f.x-30, f.y + I.top*ESCALA - 26, 28, 10, 6);   // etiquetas PAR · TOX · QUE · DRM · CNF
}

// Cuadritos del equipo (debajo de tu tarjeta): posición en el mundo del juego. La usan hud() para dibujarlos y ui.js para saber si hiciste clic en uno.
const ICON_K = 1.3;                                       // tamaño de TUS cuadritos del equipo (1 = pequeños como antes; más = más grandes, y se separan solos)
const HUD_H = 90, ICON_DY = 98;                           // alto de la tarjeta de Pokémon y dónde empiezan los cuadritos del equipo (debajo de ella)
function hudIconRect(i){ const k = HUD_SCALE; return {x:(10 + i*52*ICON_K) * k, y:(10 + ICON_DY) * k, w:46 * ICON_K * k, h:46 * ICON_K * k}; }
function hudIconAt(mx, my){                      // nº del cuadrito que hay en (mx, my), o -1
  if(!g || g.over) return -1;
  for(let i = 0; i < myList().length; i++){ const r = hudIconRect(i); if(mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) return i; }
  return -1;
}
// EQUIPO RIVAL OCULTO (Clasificatoria y Campo de pruebas): los cuadritos del rival enseñan «?» hasta que ese Pokémon sale al campo.
// Se apunta FUERA del estado del combate (WeakSet), así no cambia la huella del combate online (js/pvp.js).
const FOE_SEEN = new WeakSet();
function foeHidden(){ return !!(g && ((g.pvp && typeof pvp !== 'undefined' && pvp && pvp.match && pvp.match.ranked) || (g.o && g.o.pruebas))); }
function hud(x, y, list, idx, col){
  const f = list[idx], w = 340, r = f.hp / f.max, side = list === g.p ? 'p' : 'e', t = performance.now() / 1000;
  const hid = list !== myList() && foeHidden(); if(list !== myList()) FOE_SEEN.add(f);       // el que está en el campo ya se ha visto
  hudBox(x, y, w, HUD_H, f.m.isMega ? hue(t * 140, .85) : col);                                           // megaevolucionado: borde arcoíris
  ctx.fillStyle = '#0a0d15'; ctx.fillRect(x+8, y+10, 56, 56);                // retrato
  ctx.strokeStyle = f.m.isMega ? hue(t * 140 + 90, .9) : col; ctx.lineWidth = 1; ctx.strokeRect(x+8.5, y+10.5, 55, 55);
  drawFrame(ctx, f.m.dex, 'Idle', 0, 0, x+36, y+38, 2, 50, f.shiny);
  if(hasStatus(f)) statusChips(f, x+8, y+55, 27, 11, 6);                    // estado en el retrato
  text(f.m.name.toUpperCase(), x+74, y+24, f.m.name.length > 9 ? 8 : 10);                 // nombres largos (Mega-Charizard X...) un poco más pequeños para no tapar los tipos
  f.m.types.forEach((t,j)=>{
    const tx = x + w - 8 - 64*(f.m.types.length - j);
    ctx.fillStyle = TC[t]; ctx.fillRect(tx, y+12, 60, 12);
    text(t.toUpperCase(), tx+30, y+21, 6, '#10141e', 'center');
  });
  const bx = x + 92, bw = 236;                                               // barras con su etiqueta (PS = vida · EN = energía)
  text('PS', x+74, y+42, 7, '#c9d6f5'); text('EN', x+74, y+54, 6, '#7fa8d8');
  bar(bx, y+32, bw, 12, f.hp, f.max, r > .5 ? '#4ccf6a' : r > .2 ? '#e8c33a' : '#e8493a');
  [.5, .2].forEach(m => { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(Math.round(bx + 1 + (bw - 2) * m), y+33, 1, 10); });     // marcas del 50 % y del 20 % (donde la barra cambia de color)
  bar(bx, y+48, bw, 5, f.en, 100, '#4fb3ff');
  text(`${Math.ceil(f.hp)}/${Math.ceil(f.max)}`, x+328, y+68, 8, '#fff', 'right');
  {                                                                                                        // objeto (1ª línea) y habilidad (2ª línea): ya no se pisan ni desaparece la habilidad
    let tx = x+74;
    const im = f.item && itemImg(f.item);
    if(im && im.ok){ ctx.imageSmoothingEnabled = false; ctx.drawImage(im, tx, y+56, 16, 16); tx += 19; }
    if(f.item) text(ITEMS[f.item].n.toUpperCase(), tx, y+68, 6, '#c9d6f5');
    if(f.ab){ const ab = f.ab.toUpperCase(); ctx.font = `6px ${FONT}`; const aw = ctx.measureText(ab).width;
      ctx.fillStyle = 'rgba(155,226,155,.14)'; ctx.fillRect(x+74, y+73, aw + 12, 11); ctx.strokeStyle = 'rgba(155,226,155,.45)'; ctx.lineWidth = 1; ctx.strokeRect(x+74.5, y+73.5, aw + 11, 10);
      text(ab, x+80, y+81, 6, '#9be29b'); }
  }
  list.forEach((u,i)=>{                                                      // mini-iconos del equipo
    const K = list === myList() ? ICON_K : 1, px = x + i*52*K, py = y + ICON_DY;
    ctx.save(); ctx.translate(px, py); ctx.scale(K, K); ctx.translate(-px, -py);          // tus cuadritos se dibujan más grandes
    ctx.fillStyle = 'rgba(16,20,30,.9)'; ctx.fillRect(px, py, 46, 46);
    ctx.strokeStyle = i === idx ? '#ffcc33' : 'rgba(255,255,255,.25)'; ctx.lineWidth = i === idx ? 2 : 1; ctx.strokeRect(px+.5, py+.5, 45, 45);
    if(hid && !FOE_SEEN.has(u)){                                               // aún no ha salido: Poké Ball gris con «?»
      ctx.fillStyle = '#2a3148'; ctx.beginPath(); ctx.arc(px+23, py+21, 13, 0, 7); ctx.fill();
      ctx.fillStyle = '#1a2033'; ctx.beginPath(); ctx.arc(px+23, py+21, 13, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#10131f'; ctx.fillRect(px+10, py+20, 26, 2); ctx.beginPath(); ctx.arc(px+23, py+21, 4, 0, 7); ctx.fill();
      text('?', px+23, py+42, 9, '#8a94b0', 'center');
      ctx.restore(); return;
    }
    ctx.globalAlpha = u.dead ? .35 : 1;
    drawFrame(ctx, u.m.dex, 'Idle', 0, 0, px+23, py+20, 1, 34, u.shiny);
    bar(px+4, py+37, 38, 5, u.hp, u.max, '#4ccf6a'); ctx.globalAlpha = 1;
    if(u.dead){ ctx.save(); ctx.strokeStyle = 'rgba(232,73,58,.9)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(px+13, py+10); ctx.lineTo(px+33, py+30); ctx.moveTo(px+33, py+10); ctx.lineTo(px+13, py+30); ctx.stroke(); ctx.restore(); }   // ✖ = debilitado
    { const ready = u.megaKey && !u.megaDone && !u.dead, done = u.m.isMega, blocked = ready && megaUsed(side);                    // «M» de megaevolución: arcoíris = lista · rosa = ya megaevolucionó · gris = otra mega ya usada
      if(ready || done){ const mx = px + 31, my = py + 3; ctx.fillStyle = done ? '#ff6ad8' : blocked ? '#3a4258' : hue(t * 200 + i * 60, .95); ctx.fillRect(mx, my, 13, 12); text('M', mx + 2, my + 10, 8, blocked ? '#7a86a6' : '#10141e'); } }
    if(list === myList()){                                                        // solo tus cuadritos: se pueden pulsar para cambiar de Pokémon
      const can = !u.dead && i !== idx, wait = can && myCd() > 0, hov = hudIconAt(mouse.x, mouse.y) === i;
      if(wait){                                                              // en espera: se oscurece y muestra los segundos que faltan
        ctx.fillStyle = 'rgba(5,7,12,.62)'; ctx.fillRect(px+1, py+1, 44, 44);
        ctx.fillStyle = '#ffcc33'; ctx.fillRect(px+1, py+43, 44 * Math.min(1, myCd() / SWITCH_CD), 2);          // barrita que se vacía
        text(String(Math.ceil(myCd())), px+23, py+30, 16, '#ffcc33', 'center');
      }
      if(hov && can){ ctx.strokeStyle = wait ? '#ff9a3a' : '#7dffa0'; ctx.lineWidth = 2; ctx.strokeRect(px+1, py+1, 44, 44); }
      text(ctlShort('sw' + (i + 1)).slice(0, 3), px+6, py+11, 7, can ? '#c9d6f5' : 'rgba(201,214,245,.4)');          // la tecla que hace lo mismo (1 · 2 · 3)
    }
    ctx.restore();
  });
  if(list === myList()){                                                          // mensajes bajo los cuadritos
    const hv = hudIconAt(mouse.x, mouse.y), ty = y + ICON_DY + 46 * ICON_K + 12;
    if(g.swNote > 0) text(`ESPERA ${Math.ceil(myCd())} s PARA CAMBIAR`, x, ty, 7, '#ff9a3a');
    else if(hv >= 0 && hv !== idx && !list[hv].dead) text(myCd() > 0 ? `ESPERA ${Math.ceil(myCd())} s` : `CAMBIAR A ${list[hv].m.name.toUpperCase()}`, x, ty, 7, '#7dffa0');
    else if(g.clock < (typeof TOUCH !== 'undefined' && TOUCH.on ? 4 : 8) && g.count <= 0 && !g.over) text(typeof TOUCH !== 'undefined' && TOUCH.on ? 'TOCA UN CUADRO PARA CAMBIAR' : `CLIC EN UN CUADRO O TECLAS ${ctlShort('sw1')} · ${ctlShort('sw2')} · ${ctlShort('sw3')} PARA CAMBIAR`, x, ty, 6, 'rgba(201,214,245,.75)');
  }
}

// Dónde cae el mundo (W × H) dentro del lienzo. Normal: lo llena entero. Combate online: arena fija PVP_W × H, centrada y sin deformar (barras oscuras a los lados si la ventana es más ancha)
const VIEW = {sx: 1, sy: 1, ox: 0, oy: 0};
function viewCalc(){
  if(LOCKW){ const vw = typeof prOn === 'function' && prOn() ? PR.SW : W, s = Math.min(cv.width / vw, cv.height / H); VIEW.sx = VIEW.sy = s; VIEW.ox = (cv.width - vw * s) / 2; VIEW.oy = (cv.height - H * s) / 2; }   // Campo de pruebas (js/pruebas.js): la pantalla mide PR.SW aunque el mundo sea más ancho
  else{ VIEW.sx = cv.width / W; VIEW.sy = cv.height / H; VIEW.ox = VIEW.oy = 0; }
}
function draw(){
  const PRV = typeof prOn === 'function' && prOn(), want = PRV ? (typeof teOn === 'function' && teOn() ? TE.W : PR.W) : g && g.pvp ? PVP_W : 0;   // (TE: estadio grande de la Torre, js/torreestadio.js)      // PRV = Campo de pruebas: vista de estadio (js/pruebas.js)
  if(want !== LOCKW){ LOCKW = want; resize(); }                        // al entrar o salir de un combate online
  viewCalc();
  if(LOCKW){ ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#05070c'; ctx.fillRect(0, 0, cv.width, cv.height); }
  ctx.setTransform(VIEW.sx, 0, 0, VIEW.sy, VIEW.ox, VIEW.oy);
  ctx.clearRect(0,0,W,H);
  if(!g){ if(['dexv','teamv','torrev'].some(v => !$(v).classList.contains('hide'))) return;   // pantallas que tapan todo el lienzo: no gastar batería en dibujar el fondo del menú
    menuBg(performance.now()/1000); return; }
  const WW = W;                                    // ancho del mundo (en el Campo de pruebas es mayor que la pantalla)
  ctx.save(); fxShakeApply();                      // temblor de pantalla (solo el campo, no el HUD)
  g.zk = (g.zk || 0) + ((g.slowT > 0 ? 1 : (g.camZ || 0)) - (g.zk || 0)) * .16;   // g.camZ: acercamiento de cámara al cargar / en golpes fuertes (js/fxvideo2.js)                               // remate final: la cámara se acerca al Pokémon que cae (FEEL.zoom) y vuelve
  const FARV = !PRV && farOn();                    // cámara lejana (Historia de Kanto): el campo se dibuja más pequeño
  if(g.zk > .01 && g.zoomAt && !PRV){ const z = 1 + FEEL.zoom * g.zk, zp = FARV ? farW2S(g.zoomAt.x, g.zoomAt.y) : [g.zoomAt.x, g.zoomAt.y]; ctx.translate(zp[0], zp[1]); ctx.scale(z, z); ctx.translate(-zp[0], -zp[1]); }
  if(PRV){ W = PR.SW; prBack(); W = WW; prCam(); }   // estadio de fondo y «cámara» que coloca el campo sobre su suelo
  else if(FARV && estEnt()){ const E = estOf(); if(E){ estDraw(E); if(E.anim === 'azul') estAzulFx(E); if(typeof estVida === 'function') estVida(E, g.o.leader); estFans(E); } else { ctx.fillStyle = '#05070c'; ctx.fillRect(0, 0, W, H); } }      // estadio con imagen propia (mientras carga: fondo oscuro, nunca el estadio antiguo)
  else arena();
  if(FARV){ ctx.translate(W / 2, FAR.cy); ctx.scale(FAR.z, FAR.z); ctx.translate(-W / 2, -FAR.cy); }      // a partir de aquí todo el campo va reducido
  if(FARV){ if(!estEnt()){ campoLineas(); campoDeco(); } miniDraw(); }      // líneas del campo, decoración de fuera y los dos entrenadores      // Historia de Kanto: líneas del campo y los dos entrenadores
  fxhdGround();                                    // marcas en el suelo de los ataques (js/fxhd3.js)
  const P = g.p[g.pi], E = g.e[g.ei], M = myMon(), gm = g.me === 'e';        // M = el Pokémon que controlas tú (en un combate online el invitado lleva el bando 'e')

  terrDraw();                                      // zonas de terreno (brasas, hielo, charco...)
  windDraw();                                      // carril del ataque fuerte que se está cargando
  swingDraw();                                     // forma del golpe cuerpo a cuerpo
  [[P, gm ? '#ff5a5a' : '#4ccf6a'], [E, gm ? '#4ccf6a' : '#ff5a5a']].map(([f, c]) => ({y:f.y, d:() => drawF(f, c)}))
    .concat((g.pil || []).map(p => ({y:p.y, d:() => pilDraw(p)}))).concat((g.pilFx || []).map(f => ({y:f.y - 1, d:() => pilFxDraw(f)}))).sort((a, b) => a.y - b.y).forEach(o => o.d());      // Pokémon y pilares, de atrás hacia delante
  g.shots.slice().sort((a, b) => (a.hold > 0 && a.lose ? 0 : 1) - (b.hold > 0 && b.lose ? 0 : 1)).forEach(s=>{       // en un choque, el disparo que gana se pinta encima del que pierde
    if(fxShot(s)) return;                          // proyectil con sprite; si no, el círculo de siempre
    ctx.save(); ctx.fillStyle = TC[s.type]; ctx.shadowColor = TC[s.type]; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); ctx.restore();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.stroke();
  });
  fxhdBegin();                                     // efectos HD (js/fxhd.js): guarda el cuadro antes de los efectos
  fxDraw();                                        // impactos, golpes, polvo y partículas
  fxhdDraw(); fxhdEnd();                           // efectos HD: luces, golpes, carga y brillo (bloom)
  swapDraw();                                      // animación de cambio de Pokémon (rayo, Poké Ball y destello)
  megaDraw();                                      // animación de megaevolución (js/mega.js)
  if(!PRV && !FARV) abDrawWeather();               // clima (sol, lluvia, granizo, arena): js/abilities.js
  ctx.restore();
  if(FARV) abDrawWeather();                        // con la cámara lejana el clima cubre toda la pantalla
  if(PRV){ W = PR.SW; abDrawWeather(); }          // Campo de pruebas: el clima cubre toda la pantalla y el HUD se dibuja con el ancho de la pantalla (W se repone al final)
  if(typeof nvBannerDraw === 'function') nvBannerDraw();          // cartel grande de algunos ataques fuertes («¡Rayo Solar!») y la pantalla que se oscurece un instante (js/fxnuevos.js)
  if(!M.dead && !(typeof TOUCH !== 'undefined' && TOUCH.on)){             // cruz de puntería (con los dedos no se enseña)
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(mouse.x-9, mouse.y); ctx.lineTo(mouse.x+9, mouse.y); ctx.moveTo(mouse.x, mouse.y-9); ctx.lineTo(mouse.x, mouse.y+9); ctx.stroke();
  }
  if(PRV) g.pops.forEach(p => { const [sx, sy] = prW2S(p.x, p.y - (1-p.t)*20); if(typeof popStyled === 'function' && popStyled(p, sx, sy)) return; textO(p.txt, sx, sy, p.s || 9, p.c || '#ffe066', 'center'); });   // números del daño: a su sitio en la pantalla
  else if(FARV) g.pops.forEach(p => { const [sx, sy] = farW2S(p.x, p.y - (1-p.t)*20); if(typeof popStyled === 'function' && popStyled(p, sx, Math.max(178, sy))) return; textO(p.txt, sx, Math.max(178, sy), p.s || 9, p.c || '#ffe066', 'center'); });
  else g.pops.forEach(p => { const y = Math.max(178, p.y - (1-p.t)*20); if(!(typeof popStyled === 'function' && popStyled(p, p.x, y))) textO(p.txt, p.x, y, p.s || 9, p.c || '#ffe066', 'center'); });   // «¡Es muy eficaz!» y compañía, en cuadro de texto (js/fxvideo3.js)

  if(PRV) prTopBegin();                            // Campo de pruebas: los paneles de arriba van a la escala del estadio (js/pruebas.js)
  hudAt(0, 0, () => hud(10, 10, myList(), myIdx(), '#4a8cff'));
  hudAt(W, 0, () => hud(W-350, 10, oppList(), oppIdx(), '#ff4a5a'));
  abDrawHud();                                                               // clima activo (js/abilities.js)

  // Panel central: piso y temporizador
  const s = g.clock | 0;
  if(typeof teOn === 'function' && teOn() && TE.hud) teCenter(s); else       // estadio grande de la Torre: marcador fino (js/torreestadio.js)
  hudAt(W/2, 0, () => {
  hudBox(W/2-110, 8, 220, 52, '#4a8cff');
  text(g.pvp ? (g.o.estadio ? 'CLASIFICATORIA' : 'ONLINE') : g.o.pruebas ? 'PRUEBAS' : g.o.torre ? 'TORRE · PISO ' + g.o.floor : g.o.title ? 'CAMPO' : 'PISO ' + g.o.floor, W/2, 29, 12, '#ffcc33', 'center');
  text(`${(s/60|0)}:${String(s%60).padStart(2,'0')}`, W/2, 49, 10, '#fff', 'center');
  { ctx.font = `8px ${FONT}`; const sw = ctx.measureText(g.o.sub).width + 16; ctx.fillStyle = 'rgba(8,10,20,.62)'; ctx.fillRect(W/2 - sw/2, 64, sw, 16); }       // fondo tras el subtítulo para que se lea
  textO(g.o.sub, W/2, 76, 8, '#c9d6f5', 'center');
  const L = leaderImg(g.o.leader, g.o.portrait);                                             // retrato del líder
  if(L && L.ok){                                                                             // en un marco, a la izquierda del panel (antes iba debajo y se mezclaba con el subtítulo y el aviso del clima)
    const fx0 = W/2 - 110 - 8 - 52, k = Math.min(44 / L.width, 44 / L.height), w = L.width * k, h = L.height * k;
    hudBox(fx0, 8, 52, 52, '#4a8cff');
    ctx.imageSmoothingEnabled = false; ctx.drawImage(L, fx0 + 26 - w/2, 34 - h/2, w, h);
  }
  });
  if(PRV) prTopEnd();
  if(!(typeof TOUCH !== 'undefined' && TOUCH.on)) text(g.pvp ? 'ESC · MENÚ' : 'ESC · PAUSA', W - 14, H - 12, 6, '#6d7899', 'right');   // con los dedos está el botón II
  if(g.count > 0) text(String(Math.ceil(g.count)), W/2, H/2+22, 64, '#ffcc33', 'center');

  if(!(typeof TOUCH !== 'undefined' && TOUCH.on)){   // con pantalla táctil, la barra de ataques la sustituyen los botones (js/touch.js)
  // Barra de ataques, centrada abajo
  ctx.save(); ctx.translate(W/2, H); ctx.scale(HUD_SCALE, HUD_SCALE); ctx.translate(-W/2, -H);       // reducida desde el borde de abajo
  if(FARV) ctx.globalAlpha = farBarAlpha();        // cámara lejana: lo mismo
  if(PRV) ctx.globalAlpha = prBarAlpha();          // Campo de pruebas: transparente si un Pokémon pasa por detrás
  const bw = 104, gap = 8, tw = 5*bw + 4*gap + 24, x0 = (W - tw)/2, y0 = H - 82;
  if(!(typeof hudBarImg === 'function' && hudBarImg(M))){     // con las piezas dibujadas (js/hudbar.js); si no, la de siempre
  // Barra de energía grande, siempre visible, con las marcas de Q (20) y E (40) y el tiempo que falta
  { const ey = y0 - 38, bx = x0 + 78, bwid = tw - 78 - 12, bh = 10, by = ey + 16;
    hudBox(x0, ey, tw, 34, '#4fb3ff');
    text('ENERGÍA', x0 + 12, by + 8, 7, '#4fb3ff');
    bar(bx, by, bwid, bh, M.en, 100, '#4fb3ff');
    [3, 4].forEach(i => { const k = ctlKey(i).slice(0, 4);
      const need = Math.round(enCost(M, i)), mx = bx + 1 + (bwid - 2) * need / 100, ready = M.en >= need, col = i === 3 ? '#b07bff' : '#ffcc33';
      ctx.fillStyle = col; ctx.fillRect(Math.round(mx) - 1, by - 3, 2, bh + 6);
      const wait = Math.max(0, (need - M.en) / EN_REGEN);
      text(`${k} ${need}` + (ready ? ' ✔' : ` · ${wait.toFixed(1)}s`), mx, by - 5, 6, ready ? '#9be29b' : col, 'center');
    });
    text(String(Math.floor(M.en)), bx + bwid - 4, by + 8, 7, '#fff', 'right'); }
  hudBox(x0, y0, tw, 72, '#4a8cff');
  MV.forEach((m,i)=>{
    const x = x0 + 12 + i*(bw+gap), y = y0 + 10, h = 52, cost = Math.round(enCost(M, i));      // cost: energía real (Presión del rival)
    const enWait = Math.max(0, (cost - M.en) / EN_REGEN), cdWait = Math.max(0, M.cd[i]), wait = Math.max(enWait, cdWait);   // segundos hasta poder usarlo
    const ok = wait <= 0;
    const col = i === 0 ? '#9aa6b8' : i === 3 ? '#b07bff' : TC[mtype(M, i)];
    ctx.fillStyle = '#161c2c'; ctx.fillRect(x, y, bw, h);
    ctx.strokeStyle = ok ? col : '#2c3550'; ctx.lineWidth = 2; ctx.strokeRect(x+1, y+1, bw-2, h-2);
    const kl = ctlKey(i).slice(0, 7);                                                          // tecla de ese ataque (configurable: Ajustes › Controles)
    ctx.fillStyle = ok ? col : '#2c3550'; ctx.fillRect(x+4, y+4, kl.length*6 + 6, 10);      // tecla
    text(kl, x+7, y+12, 6, '#10141e');
    const nm = mvName(M, i).toUpperCase();
    text(nm, x+bw/2, y+32, nm.length > 10 ? 7 : 8, ok ? '#fff' : '#6d7899', 'center');
    if(ok && (i === 1 || i === 2)) text((i === 1 ? meleeKind(M) : shotKind(M)).n.toUpperCase(), x+bw/2, y+43, 6, col, 'center');      // forma del ataque (combat.js)
    if(m.en) text('EN ' + cost, x+bw-5, y+14, 6, M.en >= cost ? '#4fb3ff' : '#e8493a', 'right');
    if(m.en){ const fr = Math.min(1, M.en / cost); ctx.fillStyle = '#05070c'; ctx.fillRect(x+4, y+h-6, bw-8, 3);          // mini barra de energía de ese ataque
      ctx.fillStyle = fr >= 1 ? '#9be29b' : '#4fb3ff'; ctx.fillRect(x+4, y+h-6, (bw-8)*fr, 3); }
    if(!ok){
      const total = Math.max(m.cd, cost / EN_REGEN, .01);
      ctx.fillStyle = 'rgba(5,7,12,.72)'; ctx.fillRect(x+2, y+2, bw-4, (h-4) * Math.min(1, wait/total));
      text(wait.toFixed(1) + 's', x+bw/2, y+47, 8, cdWait >= enWait ? '#fff' : '#4fb3ff', 'center');       // blanco = enfriamiento · azul = falta energía
    }
  });
  }
  ctx.restore();
  if(PRV || FARV){ ctx.save(); ctx.globalAlpha = (PRV ? PR.barA : FAR.barA) || 1; megaHud(); ctx.restore(); } else
  megaHud();                                       // aviso «R · MEGAEVOLUCIÓN» (js/mega.js)
  }
  megaTop();                                       // destello y cartel de la megaevolución, encima de todo
  if(g.pvp) pvpDraw();                             // combate online: avisos de conexión (js/pvp.js)
  if(typeof touchDraw === 'function') touchDraw();  // joystick y botones táctiles (js/touch.js)
  if(PRV){ prFront(); W = WW; }                    // Campo de pruebas: cartel de megaevolución y línea de abajo; se repone el ancho del mundo
}

let last = performance.now();
function loop(now){
  const dt = Math.min(.05, (now-last)/1000); last = now;
  if(g && g.pvp) pvpFrame(dt);                     // combate online: pasos fijos sincronizados con el rival (js/pvp.js)
  else if(fxhd.stop > 0 && g && !g.over){ fxhd.stop -= dt; }     // congelado del golpe (js/fxhd.js): el combate se queda quieto un instante
  else update(dt);
  draw(); requestAnimationFrame(loop);
}
