"use strict";
/* =====================================================================
   18) LA CASA DEL EQUIPO POKÉMON: fondo de la pantalla de equipo (imagen fondos/casa.png + trofeos y favoritos dibujados encima)
   - La imagen es solo el decorado: una casa vista desde arriba con 4 habitaciones. La vitrina del salón está VACÍA a propósito:
     el juego pone encima un trofeo por cada Liga superada (save.champ, igual que en room.js) y sus gemas de colores.
   - Los 3 Pokémon FAVORITOS del perfil (favSaved() y favShinySaved() de profile.js) viven en la casa, animados (reposo).
   - team.js llama a teamBgStart() al abrir el panel y a teamBgStop() al cerrarlo (así no gasta nada en el resto del juego).

   ▶ VOLVER AL DISEÑO ANTIGUO (habitación de madera con chimenea): pon TEAM_HOUSE = false aquí abajo. No hace falta tocar nada más.
   ▶ Si la imagen no carga (ruta mal escrita, archivo borrado...), la pantalla usa sola el diseño antiguo.

   Coordenadas: todas están en píxeles de la imagen (750x750). Para mover un favorito cambia HOUSE.pets; para mover los
   trofeos, HOUSE.slots (centro de cada cristal de la vitrina).
   ===================================================================== */
const TEAM_HOUSE = false;     // ← DESACTIVADA por ahora: se usa la habitación antigua. Ponlo en true para volver a ver la casa

const HOUSE = {W:750, H:750, src:'fondos/casa.png', img:null, ok:false, failed:false, cv:null, x:null, base:null, on:false, timer:0, t0:0, won:[], pets:[],
  slots: Array.from({length:9}, (_, i) => ({x:238 + i * 34.75, y:118})),     // un cristal de la vitrina por Liga (mismo orden que ROOM_LEAGUES)
  pos: [[330, 330], [515, 590], [280, 555]],                                  // dónde está cada favorito (pies): salón, dormitorio y cocina
  fit: 84};                                                                   // tamaño máximo de un favorito en píxeles de la imagen

// Copa pixel-art (unos 25x30 px) centrada en (cx, cy). Apagada = silueta oscura (Liga aún sin ganar)
function houseCup(x, cx, cy, on, gem){
  const u = 2.1, R = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(Math.round(cx + a * u), Math.round(cy + b * u), Math.ceil(w * u), Math.ceil(h * u)); };
  const g = on ? '#ffd24a' : '#3a3f58', g2 = on ? '#d89a1e' : '#2a2e44', OL = '#15152c';
  R(-5, -7, 10, 7, OL); R(-4, -7, 8, 6, g); R(-3, -6, 2, 4, on ? '#fff3a8' : g);                               // copa
  R(-7, -6, 3, 5, OL); R(-6, -5, 1, 3, g2); R(4, -6, 3, 5, OL); R(4, -5, 1, 3, g2);                              // asas
  R(-1, -1, 2, 4, g2); R(-4, 3, 8, 3, OL); R(-3, 3, 6, 2, g2);                                                  // pie y base
  if(on){ R(-1, -5, 2, 2, gem); R(-1, -5, 1, 1, '#fff'); }                                                       // gema de la región
}

// Fondo fijo: la imagen y los trofeos (se dibuja de nuevo cada vez que se abre, por si has ganado una Liga)
function houseBuild(){
  const H = HOUSE, c = H.base || (H.base = document.createElement('canvas')); c.width = H.W; c.height = H.H;
  const x = c.getContext('2d'); x.drawImage(H.img, 0, 0, H.W, H.H);
  H.slots.forEach((s, i) => {
    if(H.won[i]){ x.save(); x.shadowColor = ROOM_LEAGUES[i][1]; x.shadowBlur = 12; houseCup(x, s.x, s.y, true, ROOM_LEAGUES[i][1]); x.restore(); }
    else{ x.globalAlpha = .5; houseCup(x, s.x, s.y, false, ''); x.globalAlpha = 1; }
  });
}

function houseFrame(){
  const H = HOUSE;
  if(!H.on) return;
  if(!H.cv.isConnected || $('teamv').classList.contains('hide')){ H.on = false; return; }
  const x = H.x, t = (performance.now() - H.t0) / 1000;
  x.drawImage(H.base, 0, 0);
  H.slots.forEach((s, i) => { if(!H.won[i]) return;                                                            // destellos de los trofeos ganados
    const k = (t * .5 + i * .37) % 1; if(k < .16){ const a = 1 - Math.abs(k - .08) / .08, sx = s.x - 8, sy = s.y - 18; x.fillStyle = `rgba(255,255,230,${a})`; x.fillRect(sx, sy - 3, 2, 8); x.fillRect(sx - 3, sy, 8, 2); } });
  H.pets.forEach(p => {                                                                                         // favoritos: sombra y animación de reposo
    x.fillStyle = 'rgba(10,8,40,.38)'; x.beginPath(); x.ellipse(p.x, p.y + 1, 26, 6, 0, 0, 7); x.fill();
    drawFrame(x, p.d, 'Idle', t, 0, p.x, p.y - H.fit * .45, 3, H.fit, p.sh);
  });
  H.timer = setTimeout(houseFrame, 66);
}

function houseStop(){ HOUSE.on = false; clearTimeout(HOUSE.timer); }

function houseStart(canvas){
  const H = HOUSE; if(!canvas) return;
  if(H.failed){ $('teamv').classList.remove('casa'); roomStart(canvas); return; }                                 // la imagen no existe: diseño antiguo
  H.cv = canvas; canvas.width = H.W; canvas.height = H.H; H.x = canvas.getContext('2d');
  H.won = ROOM_LEAGUES.map(([n]) => champAny(n));                                            // Ligas superadas = trofeos en la vitrina
  const fav = favSaved(), fsh = favShinySaved();
  H.pets = fav.map((d, i) => ({d, sh: !!fsh[i], x: H.pos[i][0], y: H.pos[i][1]})).filter(p => p.d);
  H.pets.forEach(p => preloadSheets(p.d, p.sh));
  const go = () => { houseBuild(); clearTimeout(H.timer); H.t0 = performance.now(); H.on = true; houseFrame(); };
  if(H.ok) return go();
  if(!H.img){
    H.img = new Image();
    H.img.onload = () => { H.ok = true; if(H.cv && H.cv.isConnected && !$('teamv').classList.contains('hide') && $('teamv').classList.contains('casa')) go(); };
    H.img.onerror = () => { H.failed = true; if(H.cv && H.cv.isConnected){ $('teamv').classList.remove('casa'); roomStart(H.cv); } };
    H.img.src = H.src;
  }
}

// Punto de entrada que usa team.js: elige entre la casa nueva y la habitación antigua
function teamBgStart(canvas){
  const tv = $('teamv');
  if(TEAM_HOUSE){ tv.classList.add('casa'); houseStart(canvas); }
  else{ tv.classList.remove('casa'); roomStart(canvas); }
}
function teamBgStop(){ roomStop(); houseStop(); }
